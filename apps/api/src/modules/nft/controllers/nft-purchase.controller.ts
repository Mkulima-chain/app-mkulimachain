import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  ParseIntPipe,
} from '@nestjs/common';
import { NFTPurchaseService } from '../services/nft-purchase.service';
import {
  CreateNFTPurchaseDto,
  GetNFTPurchaseDto,
} from '../dto/nft-purchase.dto';
import { NFTPurchaseEntity } from '../entities/nft-purchase.entity';

@Controller('nft-purchases')
export class NFTPurchaseController {
  constructor(private readonly service: NFTPurchaseService) {}

  @Post()
  async create(@Body() dto: CreateNFTPurchaseDto): Promise<NFTPurchaseEntity> {
    return this.service.create(dto);
  }

  @Get()
  async findAll(
    @Query() query: GetNFTPurchaseDto,
  ): Promise<NFTPurchaseEntity[]> {
    return this.service.findAll(query);
  }

  @Get('stats')
  async getStats(): Promise<{
    totalPurchases: number;
    totalRevenue: number;
    totalSchoolFund: number;
    totalCreatorEarnings: number;
    totalPlatformEarnings: number;
  }> {
    return this.service.getStats();
  }

  @Get('school-fund/total')
  async getTotalSchoolFund(): Promise<{ total: number }> {
    const total = await this.service.getTotalSchoolFundContributions();
    return { total };
  }

  @Get('school-fund/year/:year')
  async getSchoolFundByYear(
    @Param('year', ParseIntPipe) year: number,
  ): Promise<{ total: number }> {
    const total = await this.service.getSchoolFundContributionsByPeriod(year);
    return { total };
  }

  @Get('school-fund/year/:year/month/:month')
  async getSchoolFundByMonth(
    @Param('year', ParseIntPipe) year: number,
    @Param('month', ParseIntPipe) month: number,
  ): Promise<{ total: number }> {
    const total = await this.service.getSchoolFundContributionsByPeriod(
      year,
      month,
    );
    return { total };
  }

  @Get('buyer/:buyerId')
  async findByBuyerId(
    @Param('buyerId', ParseUUIDPipe) buyerId: string,
  ): Promise<NFTPurchaseEntity[]> {
    return this.service.findByBuyerId(buyerId);
  }

  @Get('nft/:nftId')
  async findByNftId(
    @Param('nftId', ParseUUIDPipe) nftId: string,
  ): Promise<NFTPurchaseEntity[]> {
    return this.service.findByNftId(nftId);
  }

  @Get('creator/:creatorId')
  async findByCreatorId(
    @Param('creatorId', ParseUUIDPipe) creatorId: string,
  ): Promise<NFTPurchaseEntity[]> {
    return this.service.findByCreatorId(creatorId);
  }

  @Get('creator/:creatorId/earnings')
  async getCreatorEarnings(
    @Param('creatorId', ParseUUIDPipe) creatorId: string,
  ): Promise<{ earnings: number }> {
    const earnings = await this.service.getCreatorEarnings(creatorId);
    return { earnings };
  }

  @Get(':id')
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<NFTPurchaseEntity> {
    return this.service.findById(id);
  }
}
