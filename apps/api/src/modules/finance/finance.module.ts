import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MicroLoanEntity } from './entities/micro-loan.entity';
import { MicroLoanRepository } from './repositories/micro-loan.repository';
import { MicroLoanService } from './services/micro-loan.service';
import { MicroLoanController } from './controllers/micro-loan.controller';
import { CreditScoreEntity } from './entities/credit-score.entity';
import { CreditScoreRepository } from './repositories/credit-score.repository';
import { CreditScoreService } from './services/credit-score.service';
import { CreditScoreController } from './controllers/credit-score.controller';
import { MobileMoneyTransactionEntity } from './entities/mobile-money-transaction.entity';
import { MobileMoneyTransactionRepository } from './repositories/mobile-money-transaction.repository';
import { MobileMoneyTransactionService } from './services/mobile-money-transaction.service';
import { MobileMoneyTransactionController } from './controllers/mobile-money-transaction.controller';
import { FarmerEntity } from '@/modules/farmers/entities/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MicroLoanEntity,
      CreditScoreEntity,
      MobileMoneyTransactionEntity,
      FarmerEntity,
    ]),
  ],
  controllers: [
    MicroLoanController,
    CreditScoreController,
    MobileMoneyTransactionController,
  ],
  providers: [
    MicroLoanService,
    MicroLoanRepository,
    CreditScoreService,
    CreditScoreRepository,
    MobileMoneyTransactionService,
    MobileMoneyTransactionRepository,
  ],
  exports: [
    MicroLoanService,
    CreditScoreService,
    MobileMoneyTransactionService,
  ],
})
export class FinanceModule {}
