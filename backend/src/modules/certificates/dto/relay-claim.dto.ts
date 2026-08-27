import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RelayClaimDto {
  @ApiProperty({ example: 'XERTY-2026-ARB-9842', description: 'Unique certificate ID to claim' })
  @IsNotEmpty()
  @IsString()
  certificateId: string;

  @ApiProperty({ example: '0x1234567890abcdef1234567890abcdef12345678', description: 'Destination wallet address' })
  @IsNotEmpty()
  @IsString()
  claimantWallet: string;

  @ApiProperty({ example: 'alice@example.com', required: false, description: 'Student claimant email' })
  @IsOptional()
  @IsString()
  claimantEmail?: string;

  @ApiProperty({ required: false, description: 'Optional off-chain EIP-712 / Ed25519 signature proof' })
  @IsOptional()
  @IsString()
  signature?: string;

  @ApiProperty({ required: false, description: 'Anti-replay nonce or timestamp' })
  @IsOptional()
  @IsString()
  nonce?: string;
}

export class TopUpGasTankDto {
  @ApiProperty({ example: 25.0, description: 'Amount in USD or units to top up gas tank' })
  @IsNotEmpty()
  amount: number;
}
