import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchoolFundEntity } from './entities/school-fund.entity';
import { SchoolFundRepository } from './repositories/school-fund.repository';
import { SchoolFundService } from './services/school-fund.service';
import { SchoolFundController } from './controllers/school-fund.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SchoolFundEntity])],
  controllers: [SchoolFundController],
  providers: [SchoolFundService, SchoolFundRepository],
  exports: [SchoolFundService],
})
export class SchoolFundModule {}
