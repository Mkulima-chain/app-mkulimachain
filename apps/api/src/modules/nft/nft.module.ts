import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NFTEntity } from './entities/nft.entity';
import { NFTRepository } from './repositories/nft.repository';
import { NFTService } from './services/nft.service';
import { NFTController } from './controllers/nft.controller';
import { NFTPurchaseEntity } from './entities/nft-purchase.entity';
import { NFTPurchaseRepository } from './repositories/nft-purchase.repository';
import { NFTPurchaseService } from './services/nft-purchase.service';
import { NFTPurchaseController } from './controllers/nft-purchase.controller';
import { IPFSModule } from '@/shared/ipfs/ipfs.module';
import { UserEntity } from '@/modules/auth/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([NFTEntity, NFTPurchaseEntity, UserEntity]),
    IPFSModule,
  ],
  controllers: [NFTController, NFTPurchaseController],
  providers: [
    NFTService,
    NFTRepository,
    NFTPurchaseService,
    NFTPurchaseRepository,
  ],
  exports: [NFTService, NFTPurchaseService],
})
export class NFTModule {}
