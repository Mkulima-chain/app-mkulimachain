import { Module } from '@nestjs/common';
import { ServicesService } from './services/services.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from './entities/entities';
import { ControllersController } from './controllers/controllers.controller';
import { CloudinaryModule } from '@/shared/cloudinary/cloudinary.module';
import { UploadController } from './controllers/upload.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ProductEntity]), CloudinaryModule],
  controllers: [ControllersController, UploadController],
  providers: [ServicesService],
  exports: [ServicesService],
})
export class ProductsModule {}
