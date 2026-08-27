import { IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class OrganizationInfoDto {
  @ApiProperty({ required: false, example: 'Leading Web3 certification academy' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false, example: 'https://blockchainacademy.edu' })
  @IsOptional()
  @IsString()
  website?: string;

  @ApiProperty({ required: false, example: 'contact@blockchainacademy.edu' })
  @IsOptional()
  @IsString()
  contactEmail?: string;

  @ApiProperty({ required: false, example: '+1 (555) 019-2834' })
  @IsOptional()
  @IsString()
  contactPhone?: string;

  @ApiProperty({ required: false, example: 'https://blockchainacademy.edu/logo.png' })
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @ApiProperty({ required: false, example: 'San Francisco, CA' })
  @IsOptional()
  @IsString()
  address?: string;
}

export class CreateIssuerProfileDto {
  @ApiProperty({ example: '658b1234abcd5678ef012345' })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({ example: 'Global Blockchain Academy' })
  @IsNotEmpty()
  @IsString()
  academyName: string;

  @ApiProperty({ example: 'global-blockchain-academy' })
  @IsNotEmpty()
  @IsString()
  slug: string;

  @ApiProperty({ example: '0x1234567890abcdef1234567890abcdef12345678' })
  @IsNotEmpty()
  @IsString()
  onchainIssuerAddress: string;

  @ApiProperty({ type: OrganizationInfoDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => OrganizationInfoDto)
  organizationInfo?: OrganizationInfoDto;
}
