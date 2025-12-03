import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { MicroLoanRepository } from '../repositories/micro-loan.repository';
import { MicroLoanEntity } from '../entities/micro-loan.entity';
import {
  CreateMicroLoanDto,
  UpdateMicroLoanDto,
  GetMicroLoanDto,
} from '../dto/micro-loan.dto';
import { LoanStatus } from '../interfaces/imicro-loan';

@Injectable()
export class MicroLoanService {
  constructor(private readonly repository: MicroLoanRepository) {}

  async create(dto: CreateMicroLoanDto): Promise<MicroLoanEntity> {
    return this.repository.create(dto);
  }

  async findById(id: string): Promise<MicroLoanEntity> {
    const loan = await this.repository.findById(id);
    if (!loan) {
      throw new NotFoundException(`Loan with ID ${id} not found`);
    }
    return loan;
  }

  async findAll(query: GetMicroLoanDto): Promise<MicroLoanEntity[]> {
    return this.repository.findAll(query);
  }

  async findByFarmerId(farmerId: string): Promise<MicroLoanEntity[]> {
    return this.repository.findByFarmerId(farmerId);
  }

  async findOverdueLoans(): Promise<MicroLoanEntity[]> {
    return this.repository.findOverdueLoans();
  }

  async update(id: string, dto: UpdateMicroLoanDto): Promise<MicroLoanEntity> {
    const loan = await this.repository.update(id, dto);
    if (!loan) {
      throw new NotFoundException(`Loan with ID ${id} not found`);
    }
    return loan;
  }

  async activate(id: string): Promise<MicroLoanEntity> {
    const loan = await this.findById(id);

    if (loan.status !== LoanStatus.PENDING) {
      throw new BadRequestException(
        `Loan can only be activated from pending status. Current: ${loan.status}`,
      );
    }

    const activated = await this.repository.activate(id);
    if (!activated) {
      throw new NotFoundException(`Loan with ID ${id} not found`);
    }
    return activated;
  }

  async repay(id: string): Promise<MicroLoanEntity> {
    const loan = await this.findById(id);

    if (loan.status !== LoanStatus.ACTIVE) {
      throw new BadRequestException(
        `Only active loans can be repaid. Current: ${loan.status}`,
      );
    }

    const repaid = await this.repository.markAsRepaid(id);
    if (!repaid) {
      throw new NotFoundException(`Loan with ID ${id} not found`);
    }
    return repaid;
  }

  async markDefaulted(id: string): Promise<MicroLoanEntity> {
    const loan = await this.findById(id);

    if (loan.status !== LoanStatus.ACTIVE) {
      throw new BadRequestException(
        `Only active loans can be marked as defaulted. Current: ${loan.status}`,
      );
    }

    const defaulted = await this.repository.markAsDefaulted(id);
    if (!defaulted) {
      throw new NotFoundException(`Loan with ID ${id} not found`);
    }
    return defaulted;
  }

  calculateRepaymentAmount(loan: MicroLoanEntity): number {
    const principal = Number(loan.amountADA);
    const rate = Number(loan.interestRate) / 100;
    return principal + principal * rate;
  }

  async delete(id: string): Promise<void> {
    const loan = await this.findById(id);

    if (loan.status === LoanStatus.ACTIVE) {
      throw new BadRequestException('Cannot delete an active loan');
    }

    await this.repository.delete(id);
  }
}
