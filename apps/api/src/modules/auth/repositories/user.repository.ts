import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import { RegisterDto, UpdateUserDto } from '../dto/auth.dto';
import { UserRole, UserStatus, AuthProvider } from '../interfaces/iuser';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repository: Repository<UserEntity>,
  ) {}

  async create(dto: RegisterDto): Promise<UserEntity> {
    const hashedPassword = dto.password
      ? await bcrypt.hash(dto.password, 10)
      : undefined;
    const user = this.repository.create({
      ...dto,
      password: hashedPassword,
      role: dto.role || UserRole.FARMER,
      status: UserStatus.PENDING_VERIFICATION,
      authProvider: AuthProvider.EMAIL,
    });
    return this.repository.save(user);
  }

  async createAdmin(dto: RegisterDto): Promise<UserEntity> {
    const hashedPassword = dto.password
      ? await bcrypt.hash(dto.password, 10)
      : undefined;
    const user = this.repository.create({
      ...dto,
      password: hashedPassword,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE, // Les comptes admin sont automatiquement actifs
      authProvider: AuthProvider.EMAIL,
    });
    return this.repository.save(user);
  }

  async findById(id: string): Promise<UserEntity | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.repository.findOne({ where: { email } });
  }

  async findByPhone(phone: string): Promise<UserEntity | null> {
    return this.repository.findOne({ where: { phone } });
  }

  async findByIdentifier(identifier: string): Promise<UserEntity | null> {
    if (identifier.includes('@')) {
      return this.findByEmail(identifier);
    }
    return this.findByPhone(identifier);
  }

  async countAdmins(): Promise<number> {
    return this.repository.count({ where: { role: UserRole.ADMIN } });
  }

  async findByWalletAddress(walletAddress: string): Promise<UserEntity | null> {
    return this.repository.findOne({ where: { walletAddress } });
  }

  async findByGoogleId(googleId: string): Promise<UserEntity | null> {
    return this.repository.findOne({ where: { googleId } });
  }

  async createWithWallet(data: {
    walletAddress: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    role?: UserRole;
  }): Promise<UserEntity> {
    const user = this.repository.create({
      ...data,
      email: data.email || `${data.walletAddress}@wallet.mkulimachain`,
      firstName: data.firstName || 'Wallet',
      lastName: data.lastName || 'User',
      role: data.role || UserRole.FARMER,
      authProvider: AuthProvider.WALLET,
      status: UserStatus.ACTIVE,
      emailVerified: false,
      phoneVerified: false,
    });
    return this.repository.save(user);
  }

  async createWithGoogle(data: {
    googleId: string;
    email: string;
    firstName: string;
    lastName: string;
    role?: UserRole;
  }): Promise<UserEntity> {
    const user = this.repository.create({
      ...data,
      role: data.role || UserRole.FARMER,
      authProvider: AuthProvider.GOOGLE,
      status: UserStatus.ACTIVE,
      emailVerified: true,
      phoneVerified: false,
    });
    return this.repository.save(user);
  }

  async findAll(): Promise<UserEntity[]> {
    return this.repository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findByRole(role: UserRole): Promise<UserEntity[]> {
    return this.repository.find({
      where: { role },
      order: { createdAt: 'DESC' },
    });
  }

  async findByStatus(status: UserStatus): Promise<UserEntity[]> {
    return this.repository.find({
      where: { status },
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserEntity | null> {
    await this.repository.update(id, dto);
    return this.findById(id);
  }

  async updatePartial(
    id: string,
    data: Partial<UserEntity>,
  ): Promise<UserEntity | null> {
    await this.repository.update(id, data);
    return this.findById(id);
  }

  async updatePassword(id: string, hashedPassword: string): Promise<void> {
    await this.repository.update(id, { password: hashedPassword });
  }

  async updateRefreshToken(
    id: string,
    refreshToken: string | null,
  ): Promise<void> {
    await this.repository.update(id, { refreshToken });
  }

  async verifyEmail(id: string): Promise<void> {
    await this.repository.update(id, {
      emailVerified: true,
      status: UserStatus.ACTIVE,
    });
  }

  async verifyPhone(id: string): Promise<void> {
    await this.repository.update(id, { phoneVerified: true });
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.repository.update(id, { lastLogin: new Date() });
  }

  async updateStatus(id: string, status: UserStatus): Promise<void> {
    await this.repository.update(id, { status });
  }

  async delete(id: string): Promise<void> {
    await this.repository.softDelete(id);
  }

  async validatePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }
}
