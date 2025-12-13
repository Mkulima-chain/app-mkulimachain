import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarketplaceItemEntity } from './entities/marketplace-item.entity';
import { MarketplaceItemRepository } from './repositories/marketplace-item.repository';
import { MarketplaceItemService } from './services/marketplace-item.service';
import { MarketplaceItemController } from './controllers/marketplace-item.controller';
import { OrderEntity } from './entities/order.entity';
import { OrderRepository } from './repositories/order.repository';
import { OrderService } from './services/order.service';
import { OrderController } from './controllers/order.controller';
import { BatchEntity } from '@/modules/batch/entities/batch.entity';
import { FarmerEntity } from '@/modules/farmers/entities/entities';
import { CooperativeEntity } from '@/modules/cooperatives/entities/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MarketplaceItemEntity,
      OrderEntity,
      BatchEntity,
      FarmerEntity,
      CooperativeEntity,
    ]),
  ],
  controllers: [MarketplaceItemController, OrderController],
  providers: [
    MarketplaceItemService,
    MarketplaceItemRepository,
    OrderService,
    OrderRepository,
  ],
  exports: [MarketplaceItemService, OrderService],
})
export class MarketplaceModule {}
