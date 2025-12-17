import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CurrencyEntity } from '../entities/currency.entity';
import { CreateCurrencyDto, UpdateCurrencyDto } from '../dto/settings.dto';

@Injectable()
export class CurrencyService {
  constructor(
    @InjectRepository(CurrencyEntity)
    private currencyRepository: Repository<CurrencyEntity>,
  ) {}

  async create(currency: CreateCurrencyDto): Promise<CurrencyEntity> {
    const newCurrency = this.currencyRepository.create(currency);
    return this.currencyRepository.save(newCurrency);
  }

  async update(
    id: string,
    currency: UpdateCurrencyDto,
  ): Promise<CurrencyEntity> {
    const updatedCurrency = await this.currencyRepository.preload({
      id,
      ...currency,
    });
    if (!updatedCurrency) {
      throw new Error('Currency not found');
    }
    return this.currencyRepository.save(updatedCurrency);
  }

  async findOne(id: string): Promise<CurrencyEntity> {
    return this.currencyRepository.findOne({ where: { id } });
  }

  async findAll(activeOnly?: boolean): Promise<CurrencyEntity[]> {
    const where = activeOnly ? { isActive: true } : {};
    return this.currencyRepository.find({
      where,
      order: { code: 'ASC' },
    });
  }

  async delete(id: string): Promise<void> {
    await this.currencyRepository.softDelete(id);
  }
}
