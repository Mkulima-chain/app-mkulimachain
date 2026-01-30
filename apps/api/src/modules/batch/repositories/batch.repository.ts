import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { BatchEntity } from '../entities/batch.entity';
import { BatchHarvestEntity } from '../entities/batch-harvest.entity';
import { CreateBatchDto, UpdateBatchDto, GetBatchDto } from '../dto/batch.dto';
import { HarvestEntity } from '@/modules/harvest/entities/entities';

@Injectable()
export class BatchRepository {
  constructor(
    @InjectRepository(BatchEntity)
    private readonly repository: Repository<BatchEntity>,
    @InjectRepository(HarvestEntity)
    private readonly harvestRepository: Repository<HarvestEntity>,
    @InjectRepository(BatchHarvestEntity)
    private readonly batchHarvestRepository: Repository<BatchHarvestEntity>,
  ) {}

  async create(dto: CreateBatchDto): Promise<BatchEntity> {
    // Support pour l'ancien format (harvestIds) et le nouveau format (harvests avec quantités)
    const harvestQuantities = dto.harvests || (dto.harvestIds?.map(id => ({ harvestId: id, quantity: 0 })) || []);
    
    const harvestIds = harvestQuantities.map(hq => hq.harvestId);
    const harvests = await this.harvestRepository.findBy({
      id: In(harvestIds),
    });

    const batch = this.repository.create({
      qrCode: dto.qrCode,
      batchHash: dto.batchHash,
      status: dto.status,
    });

    const savedBatch = await this.repository.save(batch);

    // Créer les relations avec quantités
    const batchHarvests = harvestQuantities.map(hq => {
      const harvest = harvests.find(h => h.id === hq.harvestId);
      if (!harvest) return null;
      
      // Si quantité non spécifiée, utiliser la quantité totale de la récolte
      const quantity = hq.quantity > 0 ? hq.quantity : harvest.quantity;
      
      return this.batchHarvestRepository.create({
        batchId: savedBatch.id,
        harvestId: harvest.id,
        quantity,
      });
    }).filter(Boolean) as BatchHarvestEntity[];

    await this.batchHarvestRepository.save(batchHarvests);

    return this.findById(savedBatch.id)!;
  }

  async findById(id: string): Promise<BatchEntity | null> {
    return this.repository.findOne({
      where: { id },
      relations: [
        'batchHarvests', 
        'batchHarvests.harvest', 
        'batchHarvests.harvest.product',
        'batchHarvests.harvest.farmer',
        'supplyChainSteps'
      ],
    });
  }

  async findByQrCode(qrCode: string): Promise<BatchEntity | null> {
    return this.repository.findOne({
      where: { qrCode },
      relations: [
        'batchHarvests', 
        'batchHarvests.harvest', 
        'batchHarvests.harvest.product',
        'batchHarvests.harvest.farmer',
        'supplyChainSteps'
      ],
    });
  }

  async findAll(query: GetBatchDto): Promise<BatchEntity[]> {
    const where: Record<string, unknown> = {};

    if (query.id) where.id = query.id;
    if (query.qrCode) where.qrCode = query.qrCode;
    if (query.status) where.status = query.status;

    return this.repository.find({
      where,
      relations: [
        'batchHarvests', 
        'batchHarvests.harvest', 
        'batchHarvests.harvest.product',
        'batchHarvests.harvest.farmer',
        'supplyChainSteps'
      ],
    });
  }

  async update(id: string, dto: UpdateBatchDto): Promise<BatchEntity | null> {
    const batch = await this.findById(id);
    if (!batch) return null;

    if (dto.harvests || dto.harvestIds) {
      // Supprimer les anciennes relations
      await this.batchHarvestRepository.delete({ batchId: id });

      // Créer les nouvelles relations
      const harvestQuantities = dto.harvests || (dto.harvestIds?.map(harvestId => ({ harvestId, quantity: 0 })) || []);
      const harvestIds = harvestQuantities.map(hq => hq.harvestId);
      const harvests = await this.harvestRepository.findBy({
        id: In(harvestIds),
      });

      const batchHarvests = harvestQuantities.map(hq => {
        const harvest = harvests.find(h => h.id === hq.harvestId);
        if (!harvest) return null;
        
        const quantity = hq.quantity > 0 ? hq.quantity : harvest.quantity;
        
        return this.batchHarvestRepository.create({
          batchId: id,
          harvestId: harvest.id,
          quantity,
        });
      }).filter(Boolean) as BatchHarvestEntity[];

      await this.batchHarvestRepository.save(batchHarvests);
    }

    if (dto.qrCode) batch.qrCode = dto.qrCode;
    if (dto.batchHash) batch.batchHash = dto.batchHash;
    if (dto.status) batch.status = dto.status;

    await this.repository.save(batch);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.repository.softDelete(id);
  }
}
