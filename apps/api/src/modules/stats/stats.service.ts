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
  ) { }

  async getSummary() {
    try {
      const [ farmers, products, orders ] = await Promise.all([
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
          { name: "API", status: "online", value: "99.9%" },
          { name: "Base de données", status: "online", value: "100%" },
          { name: "Blockchain", status: "online", value: "Mocked" },
          { name: "Marketplace", status: "online", value: "100%" },
        ]
      };
    } catch (error) {
      console.error("Error in StatsService.getSummary:", error);
      throw error;
    }
  }

  async getRecentActivities() {
    const [ recentOrders, recentProducts, recentFarmers ] = await Promise.all([
      this.orderRepo.find({
        order: { createdAt: 'DESC' },
        take: 5,
        relations: [ 'item' ],
      }),
      this.productRepo.find({
        order: { createdAt: 'DESC' },
        take: 5,
        relations: [ 'harvest', 'harvest.farmer' ],
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
}

