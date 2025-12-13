import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsEnum,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole, UserStatus, AuthProvider } from '../interfaces/iuser';

export class RegisterDto {
  @ApiProperty({
    description: 'Adresse email (unique)',
    example: 'jean.mukendi@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiPropertyOptional({
    description: 'Numéro de téléphone',
    example: '+243812345678',
  })
  @IsString()
  @IsOptional()
  @Matches(/^\+?[0-9]{10,15}$/, {
    message: 'phone must be a valid phone number',
  })
  phone?: string;

  @ApiProperty({
    description: 'Mot de passe (min 8 caractères)',
    example: 'SecurePass123!',
    minLength: 8,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password!: string;

  @ApiProperty({
    description: 'Prénom',
    example: 'Jean',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  firstName!: string;

  @ApiProperty({
    description: 'Nom de famille',
    example: 'Mukendi',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  lastName!: string;

  @ApiPropertyOptional({
    description: 'Rôle utilisateur',
    enum: UserRole,
    default: UserRole.FARMER,
  })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @ApiPropertyOptional({
    description: 'Adresse du portefeuille Cardano',
    example:
      'addr1qx2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3jcu5d8ps7zex2k2xt3uqxgjqnnj83ws8lhrn648jjxtwq2ytjqp',
  })
  @IsString()
  @IsOptional()
  @MaxLength(150)
  walletAddress?: string;
}

export class LoginDto {
  @ApiProperty({
    description: 'Email ou téléphone',
    example: 'jean.mukendi@example.com',
  })
  @IsString()
  @IsNotEmpty()
  identifier!: string;

  @ApiProperty({
    description: 'Mot de passe',
    example: 'SecurePass123!',
  })
  @IsString()
  @IsNotEmpty()
  password!: string;
}

export class UpdateUserDto {
  @ApiPropertyOptional({
    description: 'Prénom',
    example: 'Jean',
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  firstName?: string;

  @ApiPropertyOptional({
    description: 'Nom de famille',
    example: 'Mukendi',
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  lastName?: string;

  @ApiPropertyOptional({
    description: 'Numéro de téléphone',
    example: '+243812345678',
  })
  @IsString()
  @IsOptional()
  phone?: string;
}

export class ChangePasswordDto {
  @ApiProperty({
    description: 'Ancien mot de passe',
    example: 'OldPass123!',
  })
  @IsString()
  @IsNotEmpty()
  oldPassword!: string;

  @ApiProperty({
    description: 'Nouveau mot de passe (min 8 caractères)',
    example: 'NewSecurePass123!',
    minLength: 8,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  newPassword!: string;
}

export class ForgotPasswordDto {
  @ApiProperty({
    description: 'Email de récupération',
    example: 'jean.mukendi@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email!: string;
}

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Token de réinitialisation',
    example: 'reset-token-123456',
  })
  @IsString()
  @IsNotEmpty()
  token!: string;

  @ApiProperty({
    description: 'Nouveau mot de passe (min 8 caractères)',
    example: 'NewSecurePass123!',
    minLength: 8,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  newPassword!: string;
}

export class VerifyEmailDto {
  @ApiProperty({
    description: 'Token de vérification',
    example: 'verify-token-123456',
  })
  @IsString()
  @IsNotEmpty()
  token!: string;
}

export class UserResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id!: string;

  @ApiProperty({ example: 'jean.mukendi@example.com' })
  email!: string;

  @ApiPropertyOptional({ example: '+243812345678' })
  phone?: string;

  @ApiProperty({ example: 'Jean' })
  firstName!: string;

  @ApiProperty({ example: 'Mukendi' })
  lastName!: string;

  @ApiProperty({ enum: UserRole, example: UserRole.FARMER })
  role!: UserRole;

  @ApiProperty({ enum: UserStatus, example: UserStatus.ACTIVE })
  status!: UserStatus;

  @ApiProperty({ example: true })
  emailVerified!: boolean;

  @ApiProperty({ example: false })
  phoneVerified!: boolean;

  @ApiProperty({
    enum: AuthProvider,
    example: AuthProvider.EMAIL,
    description: "Méthode d'authentification",
  })
  authProvider!: AuthProvider;

  @ApiPropertyOptional({
    example:
      'addr1qx2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3jcu5d8ps7zex2k2xt3uqxgjqnnj83ws8lhrn648jjxtwq2ytjqp',
    description: 'Adresse du portefeuille Cardano (si connexion wallet)',
  })
  walletAddress?: string;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  createdAt!: Date;
}

export class LoginResponseDto {
  @ApiProperty({
    description: 'Token JWT pour authentification',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken!: string;

  @ApiProperty({
    description: 'Token de rafraîchissement',
    example: 'refresh-token-123456',
  })
  refreshToken!: string;

  @ApiProperty({
    description: 'Informations utilisateur',
    type: UserResponseDto,
  })
  user!: UserResponseDto;
}
