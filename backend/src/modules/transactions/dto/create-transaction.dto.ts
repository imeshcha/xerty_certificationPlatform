import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TransactionStatus, TransactionType } from '../schemas/transaction.schema';

export class CreateTransactionDto {
  @ApiProperty({ example: '0x3a1b2c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b' })
  @IsNotEmpty()
  @IsString()
  txHash: string;

  @ApiProperty({ enum: TransactionType, example: TransactionType.SINGLE_MINT })
  @IsEnum(TransactionType)
  txType: string;

  @ApiProperty({ enum: TransactionStatus, default: TransactionStatus.PENDING })
  @IsOptional()
  @IsEnum(TransactionStatus)
  status?: string;

  @ApiProperty({ required: false, example: '658b1234abcd5678ef012345' })
  @IsOptional()
  @IsString()
  issuerId?: string;

  @ApiProperty({ required: false, example: '658b1234abcd5678ef012348' })
  @IsOptional()
  @IsString()
  certificateId?: string;

  @ApiProperty({ required: false, example: 'Arbitrum Sepolia' })
  @IsOptional()
  @IsString()
  network?: string;

  @ApiProperty({ required: false, example: 12849204 })
  @IsOptional()
  @IsNumber()
  blockNumber?: number;

  @ApiProperty({ required: false, example: '154000' })
  @IsOptional()
  @IsString()
  gasUsed?: string;
}
