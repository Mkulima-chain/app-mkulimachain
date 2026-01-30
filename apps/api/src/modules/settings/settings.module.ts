import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryEntity } from './entities/category.entity';
import { UnitEntity } from './entities/unit.entity';
import { CurrencyEntity } from './entities/currency.entity';
import { CategoryService } from './services/category.service';
import { UnitService } from './services/unit.service';
import { CurrencyService } from './services/currency.service';
import { CategoryController } from './controllers/category.controller';
import { UnitController } from './controllers/unit.controller';
import { CurrencyController } from './controllers/currency.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([CategoryEntity, UnitEntity, CurrencyEntity]),
  ],
  controllers: [CategoryController, UnitController, CurrencyController],
  providers: [CategoryService, UnitService, CurrencyService],
  exports: [CategoryService, UnitService, CurrencyService],
})
export class SettingsModule {}
