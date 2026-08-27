import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SingleIssueDto {
  @ApiProperty({ example: '658b1234abcd5678ef012345' })
  @IsNotEmpty()
  @IsString()
  issuerId: string;

  @ApiProperty({ example: '658b1234abcd5678ef012346' })
  @IsNotEmpty()
  @IsString()
  courseId: string;

  @ApiProperty({ example: '658b1234abcd5678ef012347' })
  @IsNotEmpty()
  @IsString()
  templateId: string;

  @ApiProperty({ example: 'Alice Doe' })
  @IsNotEmpty()
  @IsString()
  studentName: string;

  @ApiProperty({ example: 'alice@example.com' })
  @IsNotEmpty()
  @IsEmail()
  studentEmail: string;

  @ApiProperty({ example: '0xabcdef1234567890abcdef1234567890abcdef12' })
  @IsNotEmpty()
  @IsString()
  studentWallet: string;

  @ApiProperty({ required: false, example: 'Distinction' })
  @IsOptional()
  @IsString()
  grade?: string;

  @ApiProperty({ required: false, example: 98.5 })
  @IsOptional()
  @IsNumber()
  score?: number;

  @ApiProperty({ required: false, example: '0x3a1b2c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b' })
  @IsOptional()
  @IsString()
  transactionHash?: string;
}
