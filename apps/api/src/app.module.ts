import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { FarmersModule } from './modules/farmers/farmers.module';
import { ProductsModule } from './modules/products/module.module';
import { CooperativesModule } from './modules/cooperatives/module.module';
import { HarvestModule } from './modules/harvest/module.module';
import { BatchModule } from './modules/batch/batch.module';
import { SupplyChainModule } from './modules/supply-chain/supply-chain.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { FinanceModule } from './modules/finance/finance.module';
import { MarketplaceModule } from './modules/marketplace/marketplace.module';
import { NFTModule } from './modules/nft/nft.module';
import { SchoolFundModule } from './modules/school-fund/school-fund.module';
import { StatsModule } from './modules/stats/stats.module';
import { SettingsModule } from './modules/settings/settings.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    AuthModule,
    FarmersModule,
    CooperativesModule,
    ProductsModule,
    HarvestModule,
    BatchModule,
    SupplyChainModule,
    WalletModule,
    FinanceModule,
    MarketplaceModule,
    NFTModule,
    SchoolFundModule,
    StatsModule,
    SettingsModule,
  ],
  controllers: [],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
  exports: [
    AppService,
    AuthModule,
    FarmersModule,
    CooperativesModule,
    ProductsModule,
    HarvestModule,
    BatchModule,
    SupplyChainModule,
    WalletModule,
    FinanceModule,
    MarketplaceModule,
    NFTModule,
    SchoolFundModule,
    SettingsModule,
  ],
})
export class AppModule {}
