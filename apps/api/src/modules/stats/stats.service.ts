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
    const [farmers, products, orders] = await Promise.all([
      this.farmerRepo.count(),
      this.productRepo.count(),
      this.orderRepo.count(),
    ]);

    // CA approximatif (somme totalADA) pour affichage
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
    };
  }
}

