import { Module } from '@nestjs/common';
import { ServicesService } from './services/services.service';
import { ControllersController } from './controllers/controllers.controller';
import { HarvestEntity } from './entities/entities';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([HarvestEntity])],
  providers: [ServicesService],
  controllers: [ControllersController],
})
export class HarvestModule {}
