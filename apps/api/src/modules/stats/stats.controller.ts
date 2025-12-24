import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { StatsService } from './stats.service';
import { Public } from '@/modules/auth/decorators/public.decorator';

@ApiTags('stats')
@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('summary')
  @Public() // À sécuriser avec JWT quand l'admin enverra le token
  @ApiOperation({ summary: 'Résumé des statistiques du tableau de bord' })
  @ApiResponse({ status: 200, description: 'Résumé des stats' })
  async getSummary() {
    return this.statsService.getSummary();
  }

  @Get('activities')
  @Public()
  @ApiOperation({ summary: 'Activités récentes' })
  async getRecentActivities() {
    return this.statsService.getRecentActivities();
  }

  @Get('charts')
  @Public()
  @ApiOperation({ summary: 'Données pour les graphiques du dashboard' })
  @ApiResponse({
    status: 200,
    description: 'Données mensuelles pour graphiques',
  })
  async getChartsData() {
    return this.statsService.getChartsData();
  }
}
