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
  CreateHarvestDto,
  GetHarvestDto,
  UpdateHarvestDto,
} from '../dto/harvest.dto';
import { HarvestEntity } from '../entities/entities';
import { Public } from '@/modules/auth/decorators/public.decorator';

@Controller('harvests')
@Public() // ouverture pour l'admin; à sécuriser plus tard
export class ControllersController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post()
  async createHarvest(
    @Body() createHarvestDto: CreateHarvestDto,
  ): Promise<HarvestEntity> {
    return this.servicesService.createHarvest(createHarvestDto);
  }

  @Put(':id')
  async updateHarvest(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateHarvestDto: UpdateHarvestDto,
  ): Promise<HarvestEntity> {
    return this.servicesService.updateHarvest(id, updateHarvestDto);
  }

  @Get(':id')
  async getHarvest(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<HarvestEntity> {
    return this.servicesService.getHarvestById(id);
  }

  @Get()
  async getHarvests(@Query() query: GetHarvestDto): Promise<HarvestEntity[]> {
    return this.servicesService.getHarvests(query);
  }

  @Delete(':id')
  async deleteHarvest(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.servicesService.deleteHarvest(id);
  }
}
