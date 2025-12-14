import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SupplyChainStepEntity } from './entities/supply-chain-step.entity';
import { SupplyChainStepRepository } from './repositories/supply-chain-step.repository';
import { SupplyChainStepService } from './services/supply-chain-step.service';
import { SupplyChainStepController } from './controllers/supply-chain-step.controller';
import { BatchEntity } from '@/modules/batch/entities/batch.entity';
import { CooperativeEntity } from '@/modules/cooperatives/entities/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SupplyChainStepEntity,
      BatchEntity,
      CooperativeEntity,
    ]),
  ],
  controllers: [SupplyChainStepController],
  providers: [SupplyChainStepService, SupplyChainStepRepository],
  exports: [SupplyChainStepService],
})
export class SupplyChainModule {}
