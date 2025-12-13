import { Module } from '@nestjs/common';
import { ServicesService } from './services/services.service';
import { ControllersController } from './controllers/controllers.controller';
import { HarvestEntity } from './entities/entities';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FarmerEntity } from '@/modules/farmers/entities/entities';
import { ProductEntity } from '@/modules/products/entities/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([HarvestEntity, FarmerEntity, ProductEntity]),
  ],
  providers: [ServicesService],
  controllers: [ControllersController],
})
export class HarvestModule {}
