import { Module } from '@nestjs/common';
import { FarmerEntity } from './entities/entities';
import { CooperativeEntity } from '@/modules/cooperatives/entities/entities';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServicesService } from './services/services.service';
import { ControllersController } from './controllers/controllers.controller';
import { RepositoriesService } from './repositories/repositories';

@Module({
  imports: [
    TypeOrmModule.forFeature([FarmerEntity, CooperativeEntity]),
  ],
  controllers: [ControllersController],
  providers: [ServicesService, RepositoriesService],
  exports: [ServicesService, RepositoriesService],
})
export class FarmersModule {}
