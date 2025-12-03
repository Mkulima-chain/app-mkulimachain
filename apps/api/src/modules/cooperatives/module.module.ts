import { Module } from '@nestjs/common';
import { CooperativeEntity } from './entities/entities';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServicesService } from './services/services.service';
import { ControllersController } from './controllers/controllers.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CooperativeEntity])],
  controllers: [ControllersController],
  providers: [ServicesService],
  exports: [ServicesService],
})
export class CooperativesModule {}
