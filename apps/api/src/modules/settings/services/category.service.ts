import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoryEntity } from '../entities/category.entity';
import { CreateCategoryDto, UpdateCategoryDto } from '../dto/settings.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(CategoryEntity)
    private categoryRepository: Repository<CategoryEntity>,
  ) {}

  async create(category: CreateCategoryDto): Promise<CategoryEntity> {
    const newCategory = this.categoryRepository.create(category);
    return this.categoryRepository.save(newCategory);
  }

  async update(
    id: string,
    category: UpdateCategoryDto,
  ): Promise<CategoryEntity> {
    const updatedCategory = await this.categoryRepository.preload({
      id,
      ...category,
    });
    if (!updatedCategory) {
      throw new Error('Category not found');
    }
    return this.categoryRepository.save(updatedCategory);
  }

  async findOne(id: string): Promise<CategoryEntity> {
    return this.categoryRepository.findOne({ where: { id } });
  }

  async findAll(activeOnly?: boolean): Promise<CategoryEntity[]> {
    const where = activeOnly ? { isActive: true } : {};
    return this.categoryRepository.find({
      where,
      order: { name: 'ASC' },
    });
  }

  async delete(id: string): Promise<void> {
    await this.categoryRepository.softDelete(id);
  }
}
