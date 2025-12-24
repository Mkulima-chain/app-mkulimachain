import { Module } from '@nestjs/common';
import { ServicesService } from './services/services.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from './entities/entities';
import { ControllersController } from './controllers/controllers.controller';
import { CloudinaryModule } from '@/shared/cloudinary/cloudinary.module';
import { IPFSModule } from '@/shared/ipfs/ipfs.module';
import { UploadController } from './controllers/upload.controller';
import { ProductRepository } from './repositories/products.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductEntity]),
    CloudinaryModule,
    IPFSModule,
  ],
  controllers: [ControllersController, UploadController],
  providers: [ServicesService, ProductRepository],
  exports: [ServicesService, ProductRepository],
})
export class ProductsModule {}
