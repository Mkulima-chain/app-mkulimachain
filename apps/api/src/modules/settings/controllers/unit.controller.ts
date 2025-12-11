import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { UnitService } from '../services/unit.service';
import { CreateUnitDto, UpdateUnitDto } from '../dto/settings.dto';
import { UnitEntity } from '../entities/unit.entity';
import { Public } from '@/modules/auth/decorators/public.decorator';

@ApiTags('units')
@Controller('units')
@Public()
export class UnitController {
  constructor(private readonly unitService: UnitService) {}

  @Post()
  @ApiOperation({ summary: 'Créer une unité' })
  @ApiBody({ type: CreateUnitDto })
  @ApiResponse({ status: HttpStatus.CREATED, type: UnitEntity })
  async create(@Body() createUnitDto: CreateUnitDto): Promise<UnitEntity> {
    return this.unitService.create(createUnitDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Mettre à jour une unité' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({ type: UpdateUnitDto })
  @ApiResponse({ status: HttpStatus.OK, type: UnitEntity })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUnitDto: UpdateUnitDto,
  ): Promise<UnitEntity> {
    return this.unitService.update(id, updateUnitDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtenir une unité' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: HttpStatus.OK, type: UnitEntity })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<UnitEntity> {
    return this.unitService.findOne(id);
  }

  @Get()
  @ApiOperation({ summary: 'Lister les unités' })
  @ApiQuery({ name: 'activeOnly', required: false, type: Boolean })
  @ApiResponse({ status: HttpStatus.OK, type: [UnitEntity] })
  async findAll(@Query('activeOnly') activeOnly?: string): Promise<UnitEntity[]> {
    return this.unitService.findAll(activeOnly === 'true');
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une unité' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: HttpStatus.OK })
  async delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.unitService.delete(id);
  }
}

