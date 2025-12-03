import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ServicesService } from '../services/services.service';
import {
  CreateProductDto,
  GetProductDto,
  UpdateProductDto,
} from '../dto/products.dto';
import { ProductEntity } from '../entities/entities';
import { IProduct } from '../interfaces/iproducts';

@Controller('products')
export class ControllersController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post()
  async createProduct(
    @Body() createProductDto: CreateProductDto,
  ): Promise<ProductEntity> {
    return this.servicesService.createProduct(createProductDto);
  }

  @Put(':id')
  async updateProduct(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<ProductEntity> {
    return this.servicesService.updateProduct(id, updateProductDto);
  }

  @Get(':id')
  async getProductById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ProductEntity> {
    return this.servicesService.getProductById(id);
  }

  @Get()
  async getProducts(@Query() query: GetProductDto): Promise<ProductEntity[]> {
    return this.servicesService.getProducts(query as Partial<IProduct>);
  }

  @Delete(':id')
  async deleteProduct(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.servicesService.deleteProduct(id);
  }
}
