import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BatchEntity } from './entities/batch.entity';
import { BatchRepository } from './repositories/batch.repository';
import { BatchService } from './services/batch.service';
import { BatchController } from './controllers/batch.controller';
import { HarvestEntity } from '@/modules/harvest/entities/entities';
import { CooperativeEntity } from '@/modules/cooperatives/entities/entities';
import { FarmerEntity } from '@/modules/farmers/entities/entities';
import { ProductEntity } from '@/modules/products/entities/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BatchEntity,
      HarvestEntity,
      CooperativeEntity,
      FarmerEntity,
      ProductEntity,
    ]),
  ],
  controllers: [BatchController],
  providers: [BatchService, BatchRepository],
  exports: [BatchService],
})
export class BatchModule {}
