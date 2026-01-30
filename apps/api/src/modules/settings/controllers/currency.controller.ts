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
import { CurrencyService } from '../services/currency.service';
import { CreateCurrencyDto, UpdateCurrencyDto } from '../dto/settings.dto';
import { CurrencyEntity } from '../entities/currency.entity';
import { Public } from '@/modules/auth/decorators/public.decorator';

@ApiTags('currencies')
@Controller('currencies')
@Public()
export class CurrencyController {
  constructor(private readonly currencyService: CurrencyService) {}

  @Post()
  @ApiOperation({ summary: 'Créer une devise' })
  @ApiBody({ type: CreateCurrencyDto })
  @ApiResponse({ status: HttpStatus.CREATED, type: CurrencyEntity })
  async create(
    @Body() createCurrencyDto: CreateCurrencyDto,
  ): Promise<CurrencyEntity> {
    return this.currencyService.create(createCurrencyDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Mettre à jour une devise' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({ type: UpdateCurrencyDto })
  @ApiResponse({ status: HttpStatus.OK, type: CurrencyEntity })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCurrencyDto: UpdateCurrencyDto,
  ): Promise<CurrencyEntity> {
    return this.currencyService.update(id, updateCurrencyDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtenir une devise' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: HttpStatus.OK, type: CurrencyEntity })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<CurrencyEntity> {
    return this.currencyService.findOne(id);
  }

  @Get()
  @ApiOperation({ summary: 'Lister les devises' })
  @ApiQuery({ name: 'activeOnly', required: false, type: Boolean })
  @ApiResponse({ status: HttpStatus.OK, type: [CurrencyEntity] })
  async findAll(
    @Query('activeOnly') activeOnly?: string,
  ): Promise<CurrencyEntity[]> {
    return this.currencyService.findAll(activeOnly === 'true');
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une devise' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: HttpStatus.OK })
  async delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.currencyService.delete(id);
  }
}
