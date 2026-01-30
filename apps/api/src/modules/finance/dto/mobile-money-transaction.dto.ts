import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsEnum,
  IsNumber,
  MaxLength,
  Min,
  Matches,
} from 'class-validator';
import {
  MobileMoneyProvider,
  TransactionStatus,
  TransactionType,
} from '../interfaces/imobile-money-transaction';

export class CreateMobileMoneyTransactionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  @Matches(/^\+?[0-9]{10,15}$/, {
    message: 'fromMobileNumber must be a valid phone number',
  })
  fromMobileNumber!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  toAdaAddress!: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(0.01)
  amount!: number;

  @IsEnum(MobileMoneyProvider)
  @IsNotEmpty()
  provider!: MobileMoneyProvider;

  @IsEnum(TransactionType)
  @IsNotEmpty()
  type!: TransactionType;
}

export class UpdateMobileMoneyTransactionDto {
  @IsEnum(TransactionStatus)
  @IsOptional()
  status?: TransactionStatus;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  transactionRef?: string;

  @IsString()
  @IsOptional()
  failureReason?: string;

  @IsNumber()
  @IsOptional()
  amountADA?: number;
}

export class GetMobileMoneyTransactionDto {
  @IsUUID()
  @IsOptional()
  id?: string;

  @IsString()
  @IsOptional()
  fromMobileNumber?: string;

  @IsString()
  @IsOptional()
  toAdaAddress?: string;

  @IsEnum(MobileMoneyProvider)
  @IsOptional()
  provider?: MobileMoneyProvider;

  @IsEnum(TransactionStatus)
  @IsOptional()
  status?: TransactionStatus;

  @IsEnum(TransactionType)
  @IsOptional()
  type?: TransactionType;
}

export class CompleteTransactionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  transactionRef!: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  amountADA!: number;
}

export class FailTransactionDto {
  @IsString()
  @IsNotEmpty()
  failureReason!: string;
}
