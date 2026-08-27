import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCourseDto {
  @ApiProperty({ example: '658b1234abcd5678ef012345' })
  @IsNotEmpty()
  @IsString()
  issuerId: string;

  @ApiProperty({ example: 'Advanced Smart Contract Engineering' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ example: 'ARB-401' })
  @IsNotEmpty()
  @IsString()
  code: string;

  @ApiProperty({ required: false, example: 'https://academy.edu/courses/arb-401' })
  @IsOptional()
  @IsString()
  courseUrl?: string;

  @ApiProperty({ required: false, example: 'Comprehensive training in Arbitrum Layer 2 development' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false, example: 60 })
  @IsOptional()
  @IsNumber()
  durationHours?: number;

  @ApiProperty({ required: false, example: ['Solidity', 'Arbitrum', 'ERC-5192', 'Hardhat'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @ApiProperty({ required: false, example: 'GOLD_CLASSIC' })
  @IsOptional()
  @IsString()
  certificateTemplate?: string;

  @ApiProperty({ required: false, example: 'Certificate of Completion' })
  @IsOptional()
  @IsString()
  templateTitle?: string;

  @ApiProperty({ required: false, example: 'Program Director' })
  @IsOptional()
  @IsString()
  signatureTitle?: string;

  @ApiProperty({ required: false, example: {} })
  @IsOptional()
  templateJson?: Record<string, any>;
}

export class UpdateCourseDto {
  @ApiProperty({ required: false, example: '658b1234abcd5678ef012345' })
  @IsOptional()
  @IsString()
  issuerId?: string;

  @ApiProperty({ required: false, example: 'Advanced Smart Contract Engineering' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ required: false, example: 'https://academy.edu/courses/arb-401' })
  @IsOptional()
  @IsString()
  courseUrl?: string;

  @ApiProperty({ required: false, example: 'Updated course description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false, example: 80 })
  @IsOptional()
  @IsNumber()
  durationHours?: number;

  @ApiProperty({ required: false, example: ['Solidity', 'Arbitrum', 'Stylus'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @ApiProperty({ required: false, example: 'GOLD_CLASSIC' })
  @IsOptional()
  @IsString()
  certificateTemplate?: string;

  @ApiProperty({ required: false, example: 'Certificate of Completion' })
  @IsOptional()
  @IsString()
  templateTitle?: string;

  @ApiProperty({ required: false, example: 'Program Director' })
  @IsOptional()
  @IsString()
  signatureTitle?: string;

  @ApiProperty({ required: false, example: {} })
  @IsOptional()
  templateJson?: Record<string, any>;

  @ApiProperty({ required: false, example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
