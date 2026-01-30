import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { MobileMoneyTransactionService } from '../services/mobile-money-transaction.service';
import {
  CreateMobileMoneyTransactionDto,
  UpdateMobileMoneyTransactionDto,
  GetMobileMoneyTransactionDto,
  CompleteTransactionDto,
  FailTransactionDto,
} from '../dto/mobile-money-transaction.dto';
import { MobileMoneyTransactionEntity } from '../entities/mobile-money-transaction.entity';

@Controller('mobile-money')
export class MobileMoneyTransactionController {
  constructor(private readonly service: MobileMoneyTransactionService) {}

  @Post()
  async create(
    @Body() dto: CreateMobileMoneyTransactionDto,
  ): Promise<MobileMoneyTransactionEntity> {
    return this.service.create(dto);
  }

  @Get()
  async findAll(
    @Query() query: GetMobileMoneyTransactionDto,
  ): Promise<MobileMoneyTransactionEntity[]> {
    return this.service.findAll(query);
  }

  @Get('stats')
  async getStats(): Promise<{
    total: number;
    success: number;
    failed: number;
    pending: number;
    totalAmount: number;
    totalAmountADA: number;
  }> {
    return this.service.getStats();
  }

  @Get('mobile/:mobileNumber')
  async findByMobileNumber(
    @Param('mobileNumber') mobileNumber: string,
  ): Promise<MobileMoneyTransactionEntity[]> {
    return this.service.findByMobileNumber(mobileNumber);
  }

  @Get('address/:adaAddress')
  async findByAdaAddress(
    @Param('adaAddress') adaAddress: string,
  ): Promise<MobileMoneyTransactionEntity[]> {
    return this.service.findByAdaAddress(adaAddress);
  }

  @Get(':id')
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<MobileMoneyTransactionEntity> {
    return this.service.findById(id);
  }

  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMobileMoneyTransactionDto,
  ): Promise<MobileMoneyTransactionEntity> {
    return this.service.update(id, dto);
  }

  @Post(':id/complete')
  async complete(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CompleteTransactionDto,
  ): Promise<MobileMoneyTransactionEntity> {
    return this.service.complete(id, dto);
  }

  @Post(':id/fail')
  async fail(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: FailTransactionDto,
  ): Promise<MobileMoneyTransactionEntity> {
    return this.service.fail(id, dto);
  }
}
