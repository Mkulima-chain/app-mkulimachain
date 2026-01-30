import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FarmerEntity } from '../farmers/entities/entities';
import { ProductEntity } from '../products/entities/entities';
import { OrderEntity } from '../marketplace/entities/order.entity';

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(FarmerEntity)
    private readonly farmerRepo: Repository<FarmerEntity>,
    @InjectRepository(ProductEntity)
    private readonly productRepo: Repository<ProductEntity>,
    @InjectRepository(OrderEntity)
    private readonly orderRepo: Repository<OrderEntity>,
  ) {}

  async getSummary() {
    try {
      const [farmers, products, orders] = await Promise.all([
        this.farmerRepo.count(),
        this.productRepo.count(),
        this.orderRepo.count(),
      ]);

      const { revenueAda = 0 } =
        (await this.orderRepo
          .createQueryBuilder('order')
          .select('SUM(order.totalADA)', 'revenueAda')
          .getRawOne()) || {};

      return {
        farmers,
        products,
        orders,
        revenueAda: Number(revenueAda) || 0,
        systemStatus: [
          { name: 'API', status: 'online', value: '99.9%' },
          { name: 'Base de données', status: 'online', value: '100%' },
          { name: 'Blockchain', status: 'online', value: 'Mocked' },
          { name: 'Marketplace', status: 'online', value: '100%' },
        ],
      };
    } catch (error) {
      console.error('Error in StatsService.getSummary:', error);
      throw error;
    }
  }

  async getRecentActivities() {
    const [recentOrders, recentProducts, recentFarmers] = await Promise.all([
      this.orderRepo.find({
        order: { createdAt: 'DESC' },
        take: 5,
        relations: ['item'],
      }),
      this.productRepo.find({
        order: { createdAt: 'DESC' },
        take: 5,
        relations: ['harvests', 'harvests.farmer'],
      }),
      this.farmerRepo.find({
        order: { createdAt: 'DESC' },
        take: 5,
      }),
    ]);

    const activities = [
      ...recentOrders.map((order) => ({
        id: `order-${order.id}`,
        type: 'order',
        title: 'Nouvelle commande',
        description: `Commande ${order.id.slice(0, 8)}... (${order.totalADA} ADA)`,
        time: order.createdAt,
        status: 'success',
      })),
      ...recentProducts.map((product) => ({
        id: `product-${product.id}`,
        type: 'product',
        title: 'Produit ajouté',
        description: `${product.name} (${product.stock} unités)`,
        time: product.createdAt,
        status: 'info',
      })),
      ...recentFarmers.map((farmer) => ({
        id: `farmer-${farmer.id}`,
        type: 'farmer',
        title: 'Nouvel agriculteur',
        description: `${farmer.name} s'est inscrit`,
        time: farmer.createdAt,
        status: 'success',
      })),
    ];

    // Sort by most recent
    return activities
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 10);
  }

  /**
   * Get monthly chart data for dashboard graphs
   */
  async getChartsData() {
    const now = new Date();
    const sixMonthsAgo = new Date(now);
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // Get monthly farmers count
    const farmersMonthly = await this.farmerRepo
      .createQueryBuilder('farmer')
      .select("TO_CHAR(farmer.createdAt, 'YYYY-MM')", 'month')
      .addSelect('COUNT(*)', 'count')
      .where('farmer.createdAt >= :sixMonthsAgo', { sixMonthsAgo })
      .groupBy("TO_CHAR(farmer.createdAt, 'YYYY-MM')")
      .orderBy("TO_CHAR(farmer.createdAt, 'YYYY-MM')", 'ASC')
      .getRawMany();

    // Get monthly orders count and revenue
    const ordersMonthly = await this.orderRepo
      .createQueryBuilder('order')
      .select("TO_CHAR(order.createdAt, 'YYYY-MM')", 'month')
      .addSelect('COUNT(*)', 'orderCount')
      .addSelect('SUM(order.totalADA)', 'revenue')
      .where('order.createdAt >= :sixMonthsAgo', { sixMonthsAgo })
      .groupBy("TO_CHAR(order.createdAt, 'YYYY-MM')")
      .orderBy("TO_CHAR(order.createdAt, 'YYYY-MM')", 'ASC')
      .getRawMany();

    // Get monthly products count
    const productsMonthly = await this.productRepo
      .createQueryBuilder('product')
      .select("TO_CHAR(product.createdAt, 'YYYY-MM')", 'month')
      .addSelect('COUNT(*)', 'count')
      .where('product.createdAt >= :sixMonthsAgo', { sixMonthsAgo })
      .groupBy("TO_CHAR(product.createdAt, 'YYYY-MM')")
      .orderBy("TO_CHAR(product.createdAt, 'YYYY-MM')", 'ASC')
      .getRawMany();

    // Generate last 6 months labels
    const months: string[] = [];
    const monthLabels: Record<string, string> = {};
    const frenchMonths = [
      'Jan',
      'Fév',
      'Mar',
      'Avr',
      'Mai',
      'Jun',
      'Jul',
      'Aoû',
      'Sep',
      'Oct',
      'Nov',
      'Déc',
    ];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now);
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      months.push(key);
      monthLabels[key] = frenchMonths[d.getMonth()];
    }

    // Create lookup maps
    const farmerMap = new Map(
      farmersMonthly.map((f) => [f.month, parseInt(f.count, 10)]),
    );
    const orderMap = new Map(
      ordersMonthly.map((o) => [
        o.month,
        {
          orders: parseInt(o.orderCount, 10),
          revenue: parseFloat(o.revenue) || 0,
        },
      ]),
    );
    const productMap = new Map(
      productsMonthly.map((p) => [p.month, parseInt(p.count, 10)]),
    );

    // Calculate running totals for farmers
    const totalFarmers = await this.farmerRepo.count();
    let runningFarmerTotal = totalFarmers;
    const farmersData = [...months]
      .reverse()
      .map((month) => {
        const newFarmers = farmerMap.get(month) || 0;
        const total = runningFarmerTotal;
        runningFarmerTotal -= newFarmers;
        return {
          name: monthLabels[month],
          agriculteurs: total,
          nouveaux: newFarmers,
        };
      })
      .reverse();

    // Build orders chart data
    const ordersData = months.map((month) => {
      const data = orderMap.get(month) || { orders: 0, revenue: 0 };
      return {
        name: monthLabels[month],
        commandes: data.orders,
        livrees: Math.floor(data.orders * 0.85), // Estimate 85% delivered
      };
    });

    // Build finance chart data
    const financeData = months.map((month) => {
      const data = orderMap.get(month) || { orders: 0, revenue: 0 };
      return {
        name: monthLabels[month],
        revenus: Math.round(data.revenue * 100) / 100,
        depenses: Math.round(data.revenue * 0.3 * 100) / 100, // Estimate 30% as expenses
      };
    });

    // Build marketplace chart data
    const marketplaceData = months.map((month) => {
      const newProducts = productMap.get(month) || 0;
      const data = orderMap.get(month) || { orders: 0, revenue: 0 };
      return {
        name: monthLabels[month],
        ventes: data.orders,
        produits: newProducts,
      };
    });

    return {
      farmers: farmersData,
      orders: ordersData,
      finance: financeData,
      marketplace: marketplaceData,
    };
  }
}
