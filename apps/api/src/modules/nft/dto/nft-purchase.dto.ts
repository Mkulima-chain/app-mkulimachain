import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsNumber,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateNFTPurchaseDto {
  @IsUUID()
  @IsNotEmpty()
  nftId!: string;

  @IsUUID()
  @IsNotEmpty()
  buyerId!: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  transactionHash?: string;
}

export class GetNFTPurchaseDto {
  @IsUUID()
  @IsOptional()
  id?: string;

  @IsUUID()
  @IsOptional()
  nftId?: string;

  @IsUUID()
  @IsOptional()
  buyerId?: string;

  @IsString()
  @IsOptional()
  transactionHash?: string;
}

export class NFTPurchaseStatsDto {
  @IsUUID()
  @IsOptional()
  creatorId?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  year?: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  month?: number;
}
