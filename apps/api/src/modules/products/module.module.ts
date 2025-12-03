import { Module } from '@nestjs/common';
import { ServicesService } from './services/services.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from './entities/entities';
import { ControllersController } from './controllers/controllers.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ProductEntity])],
  controllers: [ControllersController],
  providers: [ServicesService],
  exports: [ServicesService],
})
export class ProductsModule {}
