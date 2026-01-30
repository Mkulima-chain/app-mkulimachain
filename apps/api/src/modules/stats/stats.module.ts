import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';
import { FarmerEntity } from '../farmers/entities/entities';
import { ProductEntity } from '../products/entities/entities';
import { OrderEntity } from '../marketplace/entities/order.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([FarmerEntity, ProductEntity, OrderEntity]),
  ],
  controllers: [StatsController],
  providers: [StatsService],
})
export class StatsModule {}
