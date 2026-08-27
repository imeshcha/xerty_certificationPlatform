import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class BatchRowDto {
  @ApiProperty({ example: 'Alice Doe' })
  @IsNotEmpty()
  @IsString()
  studentName: string;

  @ApiProperty({ example: 'alice@example.com' })
  @IsNotEmpty()
  @IsEmail()
  studentEmail: string;

  @ApiProperty({ required: false, example: '0xabcdef1234567890abcdef1234567890abcdef12' })
  @IsOptional()
  @IsString()
  studentWallet?: string;

  @ApiProperty({ required: false, example: 'Distinction' })
  @IsOptional()
  @IsString()
  grade?: string;

  @ApiProperty({ required: false, example: 98.5 })
  @IsOptional()
  @IsNumber()
  score?: number;
}

export class ProcessBatchDto {
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

  @ApiProperty({ example: 'Fall 2026 Graduating Cohort' })
  @IsNotEmpty()
  @IsString()
  batchName: string;

  @ApiProperty({ type: [BatchRowDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BatchRowDto)
  records: BatchRowDto[];

  @ApiProperty({ required: false, example: '0x3a1b2c...' })
  @IsOptional()
  @IsString()
  transactionHash?: string;
}

export class ParseFileContentDto {
  @ApiProperty({ description: 'Raw CSV text or base64 Excel string' })
  @IsNotEmpty()
  @IsString()
  fileContent: string;

  @ApiProperty({ enum: ['csv', 'excel'], example: 'csv' })
  @IsNotEmpty()
  @IsString()
  fileType: 'csv' | 'excel';
}
