import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UserRepository } from '../repositories/user.repository';
import { UserEntity } from '../entities/user.entity';
import {
  RegisterDto,
  LoginDto,
  UpdateUserDto,
  ChangePasswordDto,
  LoginResponseDto,
  UserResponseDto,
} from '../dto/auth.dto';
import { WalletConnectDto } from '../dto/wallet-auth.dto';
import { UserStatus, UserRole } from '../interfaces/iuser';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<LoginResponseDto> {
    // Empêcher la création de comptes admin via l'endpoint public
    // Seuls les admins existants peuvent créer d'autres admins (via un endpoint séparé)
    if (dto.role === UserRole.ADMIN) {
      throw new ForbiddenException(
        'Cannot create admin account via public registration. Only existing admins can create admin accounts.',
      );
    }

    // Vérifier si l'email existe déjà
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Vérifier si le téléphone existe déjà (si fourni)
    if (dto.phone) {
      const existingPhone = await this.userRepository.findByPhone(dto.phone);
      if (existingPhone) {
        throw new ConflictException('Phone number already registered');
      }
    }

    const user = await this.userRepository.create(dto);

    // Générer les tokens pour connecter automatiquement l'utilisateur
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    // Sauvegarder le refresh token
    await this.userRepository.updateRefreshToken(user.id, refreshToken);

    return {
      accessToken,
      refreshToken,
      user: this.mapToResponseDto(user),
    };
  }

  async createAdminAccount(
    currentAdmin: UserEntity,
    dto: RegisterDto,
  ): Promise<UserResponseDto> {
    // Vérifier que l'utilisateur actuel est un admin
    if (currentAdmin.role !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'Only administrators can create admin accounts.',
      );
    }

    // Vérifier si l'email existe déjà
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Vérifier si le téléphone existe déjà (si fourni)
    if (dto.phone) {
      const existingPhone = await this.userRepository.findByPhone(dto.phone);
      if (existingPhone) {
        throw new ConflictException('Phone number already registered');
      }
    }

    // Créer le compte admin avec le statut actif (pas besoin de vérification)
    const adminUser = await this.userRepository.createAdmin(dto);

    return this.mapToResponseDto(adminUser);
  }

  async hasAdmins(): Promise<boolean> {
    const adminCount = await this.userRepository.countAdmins();
    return adminCount > 0;
  }

  async createFirstAdmin(dto: RegisterDto): Promise<LoginResponseDto> {
    // Vérifier s'il existe déjà des admins
    const adminCount = await this.userRepository.countAdmins();
    if (adminCount > 0) {
      throw new ForbiddenException(
        'Admin accounts already exist. Use the protected endpoint to create additional admin accounts.',
      );
    }

    // Vérifier si l'email existe déjà
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Vérifier si le téléphone existe déjà (si fourni)
    if (dto.phone) {
      const existingPhone = await this.userRepository.findByPhone(dto.phone);
      if (existingPhone) {
        throw new ConflictException('Phone number already registered');
      }
    }

    // Créer le premier compte admin
    const adminUser = await this.userRepository.createAdmin(dto);

    // Générer les tokens pour connecter automatiquement l'utilisateur
    const accessToken = this.generateAccessToken(adminUser);
    const refreshToken = this.generateRefreshToken(adminUser);

    // Sauvegarder le refresh token
    await this.userRepository.updateRefreshToken(adminUser.id, refreshToken);

    return {
      accessToken,
      refreshToken,
      user: this.mapToResponseDto(adminUser),
    };
  }

  async login(dto: LoginDto): Promise<LoginResponseDto> {
    const user = await this.userRepository.findByIdentifier(dto.identifier);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Vérifier si l'utilisateur a un mot de passe (connexion email)
    if (!user.password) {
      throw new UnauthorizedException(
        'This account uses a different authentication method. Please use wallet or Google login.',
      );
    }

    const isPasswordValid = await this.userRepository.validatePassword(
      dto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status === UserStatus.SUSPENDED) {
      throw new UnauthorizedException('Account is suspended');
    }

    // Mettre à jour la dernière connexion
    await this.userRepository.updateLastLogin(user.id);

    // Générer les tokens
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    // Sauvegarder le refresh token
    await this.userRepository.updateRefreshToken(user.id, refreshToken);

    return {
      accessToken,
      refreshToken,
      user: this.mapToResponseDto(user),
    };
  }

  async getProfile(userId: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.mapToResponseDto(user);
  }

  async updateProfile(
    userId: string,
    dto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const user = await this.userRepository.update(userId, dto);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.mapToResponseDto(user);
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isOldPasswordValid = await this.userRepository.validatePassword(
      dto.oldPassword,
      user.password,
    );
    if (!isOldPasswordValid) {
      throw new BadRequestException('Invalid old password');
    }

    const isSamePassword = await this.userRepository.validatePassword(
      dto.newPassword,
      user.password,
    );
    if (isSamePassword) {
      throw new BadRequestException(
        'New password must be different from old password',
      );
    }

    const hashedPassword = await this.hashPassword(dto.newPassword);
    await this.userRepository.updatePassword(userId, hashedPassword);
  }

  async refreshToken(refreshToken: string): Promise<LoginResponseDto> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret:
          this.configService.get<string>('JWT_REFRESH_SECRET') ||
          'refresh-secret-key',
      });

      const user = await this.userRepository.findById(payload.sub);
      if (!user || user.refreshToken !== refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const newAccessToken = this.generateAccessToken(user);
      const newRefreshToken = this.generateRefreshToken(user);

      await this.userRepository.updateRefreshToken(user.id, newRefreshToken);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        user: this.mapToResponseDto(user),
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string): Promise<void> {
    await this.userRepository.updateRefreshToken(userId, null);
  }

  async verifyEmail(userId: string): Promise<void> {
    await this.userRepository.verifyEmail(userId);
  }

  async verifyPhone(userId: string): Promise<void> {
    await this.userRepository.verifyPhone(userId);
  }

  async walletConnect(dto: WalletConnectDto): Promise<LoginResponseDto> {
    // TODO: Vérifier la signature avec Cardano (à implémenter avec @cardano-foundation/cardano-connect-with-wallet)
    // Pour l'instant, on accepte la connexion si le wallet n'existe pas déjà

    let user = await this.userRepository.findByWalletAddress(dto.walletAddress);

    if (!user) {
      // Créer un nouvel utilisateur avec wallet
      user = await this.userRepository.createWithWallet({
        walletAddress: dto.walletAddress,
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: dto.role,
      });
    } else {
      // Mettre à jour les infos si fournies
      if (dto.email || dto.firstName || dto.lastName) {
        const updateData: Partial<UserEntity> = {};
        if (dto.firstName) updateData.firstName = dto.firstName;
        if (dto.lastName) updateData.lastName = dto.lastName;
        if (dto.email) updateData.email = dto.email;
        const updatedUser = await this.userRepository.updatePartial(
          user.id,
          updateData,
        );
        if (updatedUser) {
          user = updatedUser;
        }
      }
    }

    await this.userRepository.updateLastLogin(user.id);

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    await this.userRepository.updateRefreshToken(user.id, refreshToken);

    return {
      accessToken,
      refreshToken,
      user: this.mapToResponseDto(user),
    };
  }

  async googleAuth(googleUser: {
    googleId: string;
    email: string;
    firstName: string;
    lastName: string;
    picture?: string;
    role?: UserRole;
  }): Promise<LoginResponseDto> {
    let user = await this.userRepository.findByGoogleId(googleUser.googleId);

    if (!user) {
      // Vérifier si l'email existe déjà avec un autre provider
      const existingUser = await this.userRepository.findByEmail(
        googleUser.email,
      );
      if (existingUser && existingUser.authProvider !== 'google') {
        throw new ConflictException(
          'Email already registered with another authentication method',
        );
      }

      // Créer un nouvel utilisateur avec Google
      user = await this.userRepository.createWithGoogle({
        googleId: googleUser.googleId,
        email: googleUser.email,
        firstName: googleUser.firstName,
        lastName: googleUser.lastName,
        role: googleUser.role,
      });
    }

    await this.userRepository.updateLastLogin(user.id);

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    await this.userRepository.updateRefreshToken(user.id, refreshToken);

    return {
      accessToken,
      refreshToken,
      user: this.mapToResponseDto(user),
    };
  }

  private generateAccessToken(user: UserEntity): string {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    return this.jwtService.sign(payload);
  }

  private generateRefreshToken(user: UserEntity): string {
    const payload = {
      sub: user.id,
      email: user.email,
    };
    const secret =
      this.configService.get<string>('JWT_REFRESH_SECRET') ||
      'refresh-secret-key';
    const expiresIn =
      this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d';
    return this.jwtService.sign(payload, {
      secret,
      expiresIn,
    } as any);
  }

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  private mapToResponseDto(user: UserEntity): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      status: user.status,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
      authProvider: user.authProvider,
      walletAddress: user.walletAddress,
      createdAt: user.createdAt,
    };
  }
}
