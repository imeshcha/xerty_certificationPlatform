import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CertificateStatus, BlockchainNetwork } from '../schemas/certificate.schema';

export class CreateCertificateDto {
  @ApiProperty({ example: 'XERTY-2026-08-9842' })
  @IsNotEmpty()
  @IsString()
  certificateId: string;

  @ApiProperty({ example: '658b1234abcd5678ef012345' })
  @IsNotEmpty()
  @IsString()
  issuerId: string;

  @ApiProperty({ required: false, example: '658b1234abcd5678ef012347' })
  @IsOptional()
  @IsString()
  studentId?: string;

  @ApiProperty({ example: '658b1234abcd5678ef012346' })
  @IsNotEmpty()
  @IsString()
  courseId: string;

  @ApiProperty({ required: false, example: '658b1234abcd5678ef012348' })
  @IsOptional()
  @IsString()
  templateId?: string;

  @ApiProperty({
    enum: BlockchainNetwork,
    default: BlockchainNetwork.ARBITRUM_SEPOLIA,
    example: BlockchainNetwork.ARBITRUM_SEPOLIA,
  })
  @IsOptional()
  @IsString()
  network?: string;

  @ApiProperty({ example: '0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069' })
  @IsNotEmpty()
  @IsString()
  certificateHash: string;

  @ApiProperty({ example: 'QmMetadataJSONCID1234567890abcdef' })
  @IsNotEmpty()
  @IsString()
  ipfsCID: string;

  @ApiProperty({ required: false, example: 'QmImageCID1234567890abcdef' })
  @IsOptional()
  @IsString()
  imageIpfsCid?: string;

  @ApiProperty({ required: false, example: '0x3a1b2c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b' })
  @IsOptional()
  @IsString()
  transactionHash?: string;

  @ApiProperty({ required: false, example: '5UfDfvS8o... (Solana Devnet Signature)' })
  @IsOptional()
  @IsString()
  solanaSignature?: string;

  @ApiProperty({ required: false, example: 'So11111111111111111111111111111111111111112' })
  @IsOptional()
  @IsString()
  solanaMintAddress?: string;

  @ApiProperty({ enum: CertificateStatus, default: CertificateStatus.ISSUED })
  @IsOptional()
  @IsEnum(CertificateStatus)
  status?: string;

  @ApiProperty({ required: false, example: '2026-08-23T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  issueDate?: Date;

  @ApiProperty({ required: false, example: '0xabcdef1234567890abcdef1234567890abcdef12' })
  @IsOptional()
  @IsString()
  studentWallet?: string;

  @ApiProperty({ example: 'alice@example.com' })
  @IsNotEmpty()
  @IsEmail()
  studentEmail: string;

  @ApiProperty({ example: 'Alice Doe' })
  @IsNotEmpty()
  @IsString()
  studentName: string;

  @ApiProperty({ required: false, example: 'Distinction' })
  @IsOptional()
  @IsString()
  grade?: string;

  @ApiProperty({ required: false, example: 98.5 })
  @IsOptional()
  @IsNumber()
  score?: number;

  @ApiProperty({ required: false, example: { student_name: 'Alice Doe', grade: 'Distinction' } })
  @IsOptional()
  variablesMap?: Record<string, any>;

  @ApiProperty({ required: false })
  @IsOptional()
  metadataJson?: Record<string, any>;
}

export class RevokeCertificateDto {
  @ApiProperty({ example: 'Academic integrity violation or administrative correction' })
  @IsNotEmpty()
  @IsString()
  revocationReason: string;

  @ApiProperty({ required: false, example: '0x3a1b2c4d5e6f...' })
  @IsOptional()
  @IsString()
  transactionHash?: string;

  @ApiProperty({ required: false, example: '5UfDfvS8o... (Solana Signature)' })
  @IsOptional()
  @IsString()
  solanaSignature?: string;
}
