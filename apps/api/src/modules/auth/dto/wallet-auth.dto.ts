import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsEnum,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../interfaces/iuser';

export class WalletConnectDto {
  @ApiProperty({
    description: 'Adresse du portefeuille Cardano',
    example:
      'addr1qx2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3jcu5d8ps7zex2k2xt3uqxgjqnnj83ws8lhrn648jjxtwq2ytjqp',
    maxLength: 150,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  walletAddress!: string;

  @ApiProperty({
    description: 'Signature de la connexion (message signé par le wallet)',
    example: '0xabc123def456...',
  })
  @IsString()
  @IsNotEmpty()
  signature!: string;

  @ApiProperty({
    description: 'Message signé',
    example: 'Connect to MkulimaChain',
  })
  @IsString()
  @IsNotEmpty()
  message!: string;

  @ApiPropertyOptional({
    description: 'Email (optionnel pour compléter le profil)',
    example: 'jean.mukendi@example.com',
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    description: 'Prénom',
    example: 'Jean',
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  firstName?: string;

  @ApiPropertyOptional({
    description: 'Nom de famille',
    example: 'Mukendi',
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  lastName?: string;

  @ApiPropertyOptional({
    description: 'Rôle utilisateur',
    enum: UserRole,
    default: UserRole.FARMER,
  })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}

export class WalletVerifyDto {
  @ApiProperty({
    description: 'Adresse du portefeuille',
    example:
      'addr1qx2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3jcu5d8ps7zex2k2xt3uqxgjqnnj83ws8lhrn648jjxtwq2ytjqp',
  })
  @IsString()
  @IsNotEmpty()
  walletAddress!: string;

  @ApiProperty({
    description: 'Nonce pour la vérification',
    example: 'nonce-123456',
  })
  @IsString()
  @IsNotEmpty()
  nonce!: string;

  @ApiProperty({
    description: 'Signature du nonce',
    example: '0xabc123def456...',
  })
  @IsString()
  @IsNotEmpty()
  signature!: string;
}
