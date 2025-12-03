import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { NFTRepository } from '../repositories/nft.repository';
import { NFTEntity } from '../entities/nft.entity';
import {
  CreateNFTDto,
  UpdateNFTDto,
  GetNFTDto,
  MintNFTDto,
} from '../dto/nft.dto';
import { NFTStatus, NFTType, IRevenueDistribution } from '../interfaces/inft';

@Injectable()
export class NFTService {
  constructor(private readonly repository: NFTRepository) {}

  async create(dto: CreateNFTDto): Promise<NFTEntity> {
    this.validateRevenueDistribution(dto.revenueDistribution);
    return this.repository.create(dto);
  }

  async findById(id: string): Promise<NFTEntity> {
    const nft = await this.repository.findById(id);
    if (!nft) {
      throw new NotFoundException(`NFT with ID ${id} not found`);
    }
    return nft;
  }

  async findByOnChainHash(onChainHash: string): Promise<NFTEntity> {
    const nft = await this.repository.findByOnChainHash(onChainHash);
    if (!nft) {
      throw new NotFoundException(`NFT with hash ${onChainHash} not found`);
    }
    return nft;
  }

  async findAll(query: GetNFTDto): Promise<NFTEntity[]> {
    return this.repository.findAll(query);
  }

  async findByCreatorId(creatorId: string): Promise<NFTEntity[]> {
    return this.repository.findByCreatorId(creatorId);
  }

  async findListed(): Promise<NFTEntity[]> {
    return this.repository.findListed();
  }

  async findByType(type: NFTType): Promise<NFTEntity[]> {
    return this.repository.findByType(type);
  }

  async update(id: string, dto: UpdateNFTDto): Promise<NFTEntity> {
    if (dto.revenueDistribution) {
      this.validateRevenueDistribution(dto.revenueDistribution);
    }

    const nft = await this.repository.update(id, dto);
    if (!nft) {
      throw new NotFoundException(`NFT with ID ${id} not found`);
    }
    return nft;
  }

  async mint(id: string, dto: MintNFTDto): Promise<NFTEntity> {
    const nft = await this.findById(id);

    if (nft.status !== NFTStatus.DRAFT) {
      throw new BadRequestException(
        `NFT cannot be minted. Current status: ${nft.status}`,
      );
    }

    const minted = await this.repository.mint(id, dto);
    if (!minted) {
      throw new NotFoundException(`NFT with ID ${id} not found`);
    }
    return minted;
  }

  async list(id: string): Promise<NFTEntity> {
    const nft = await this.findById(id);

    if (nft.status !== NFTStatus.MINTED) {
      throw new BadRequestException(
        `NFT must be minted before listing. Current status: ${nft.status}`,
      );
    }

    const listed = await this.repository.list(id);
    if (!listed) {
      throw new NotFoundException(`NFT with ID ${id} not found`);
    }
    return listed;
  }

  async sell(id: string): Promise<NFTEntity> {
    const nft = await this.findById(id);

    if (nft.status !== NFTStatus.LISTED) {
      throw new BadRequestException(
        `NFT is not listed for sale. Current status: ${nft.status}`,
      );
    }

    const sold = await this.repository.markAsSold(id);
    if (!sold) {
      throw new NotFoundException(`NFT with ID ${id} not found`);
    }
    return sold;
  }

  calculateRevenueShares(nft: NFTEntity): {
    creator: number;
    schoolFund: number;
    platform: number;
  } {
    const price = Number(nft.priceADA);
    const dist = nft.revenueDistribution;

    return {
      creator: (price * dist.creatorPercent) / 100,
      schoolFund: (price * dist.schoolFundPercent) / 100,
      platform: (price * dist.platformPercent) / 100,
    };
  }

  async delete(id: string): Promise<void> {
    const nft = await this.findById(id);

    if (nft.status === NFTStatus.SOLD) {
      throw new BadRequestException('Cannot delete a sold NFT');
    }

    await this.repository.delete(id);
  }

  private validateRevenueDistribution(dist: IRevenueDistribution): void {
    const total =
      dist.creatorPercent + dist.schoolFundPercent + dist.platformPercent;
    if (total !== 100) {
      throw new BadRequestException(
        `Revenue distribution must total 100%. Current: ${total}%`,
      );
    }
  }
}
