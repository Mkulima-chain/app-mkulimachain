import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BatchEntity } from './entities/batch.entity';
import { BatchRepository } from './repositories/batch.repository';
import { BatchService } from './services/batch.service';
import { BatchController } from './controllers/batch.controller';
import { HarvestEntity } from '@/modules/harvest/entities/entities';

@Module({
  imports: [TypeOrmModule.forFeature([BatchEntity, HarvestEntity])],
  controllers: [BatchController],
  providers: [BatchService, BatchRepository],
  exports: [BatchService],
})
export class BatchModule {}
