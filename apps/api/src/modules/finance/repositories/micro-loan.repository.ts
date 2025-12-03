import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { MicroLoanEntity } from '../entities/micro-loan.entity';
import {
  CreateMicroLoanDto,
  UpdateMicroLoanDto,
  GetMicroLoanDto,
} from '../dto/micro-loan.dto';
import { LoanStatus } from '../interfaces/imicro-loan';
import { FarmerEntity } from '@/modules/farmers/entities/entities';

@Injectable()
export class MicroLoanRepository {
  constructor(
    @InjectRepository(MicroLoanEntity)
    private readonly repository: Repository<MicroLoanEntity>,
    @InjectRepository(FarmerEntity)
    private readonly farmerRepository: Repository<FarmerEntity>,
  ) {}

  async create(dto: CreateMicroLoanDto): Promise<MicroLoanEntity> {
    const farmer = await this.farmerRepository.findOneBy({ id: dto.farmerId });

    const loan = this.repository.create({
      farmer: farmer!,
      amountADA: dto.amountADA,
      interestRate: dto.interestRate,
      durationDays: dto.durationDays,
      loanContractHash: dto.loanContractHash,
      status: LoanStatus.PENDING,
    });

    return this.repository.save(loan);
  }

  async findById(id: string): Promise<MicroLoanEntity | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['farmer'],
    });
  }

  async findAll(query: GetMicroLoanDto): Promise<MicroLoanEntity[]> {
    const qb = this.repository
      .createQueryBuilder('loan')
      .leftJoinAndSelect('loan.farmer', 'farmer');

    if (query.id) qb.andWhere('loan.id = :id', { id: query.id });
    if (query.farmerId)
      qb.andWhere('farmer.id = :farmerId', { farmerId: query.farmerId });
    if (query.status)
      qb.andWhere('loan.status = :status', { status: query.status });

    return qb.orderBy('loan.createdAt', 'DESC').getMany();
  }

  async findByFarmerId(farmerId: string): Promise<MicroLoanEntity[]> {
    return this.repository.find({
      where: { farmer: { id: farmerId } },
      relations: ['farmer'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOverdueLoans(): Promise<MicroLoanEntity[]> {
    return this.repository.find({
      where: {
        status: LoanStatus.ACTIVE,
        dueDate: LessThan(new Date()),
      },
      relations: ['farmer'],
    });
  }

  async update(
    id: string,
    dto: UpdateMicroLoanDto,
  ): Promise<MicroLoanEntity | null> {
    await this.repository.update(id, dto);
    return this.findById(id);
  }

  async activate(id: string): Promise<MicroLoanEntity | null> {
    const loan = await this.findById(id);
    if (!loan) return null;

    const startDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + loan.durationDays);

    loan.status = LoanStatus.ACTIVE;
    loan.startDate = startDate;
    loan.dueDate = dueDate;

    return this.repository.save(loan);
  }

  async markAsRepaid(id: string): Promise<MicroLoanEntity | null> {
    const loan = await this.findById(id);
    if (!loan) return null;

    loan.status = LoanStatus.REPAID;
    loan.repaidAt = new Date();

    return this.repository.save(loan);
  }

  async markAsDefaulted(id: string): Promise<MicroLoanEntity | null> {
    const loan = await this.findById(id);
    if (!loan) return null;

    loan.status = LoanStatus.DEFAULTED;

    return this.repository.save(loan);
  }

  async delete(id: string): Promise<void> {
    await this.repository.softDelete(id);
  }
}
