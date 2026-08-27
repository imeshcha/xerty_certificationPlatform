import { IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class SocialLinksDto {
  @ApiProperty({ required: false, example: 'https://linkedin.com/in/alicedoe' })
  @IsOptional()
  @IsString()
  linkedin?: string;

  @ApiProperty({ required: false, example: 'https://github.com/alicedoe' })
  @IsOptional()
  @IsString()
  github?: string;

  @ApiProperty({ required: false, example: 'https://x.com/alicedoe' })
  @IsOptional()
  @IsString()
  twitter?: string;
}

export class CreateStudentProfileDto {
  @ApiProperty({ example: '658b1234abcd5678ef012345' })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({ example: 'Alice Doe' })
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @ApiProperty({ required: false, example: 'Full-Stack Web3 Developer' })
  @IsOptional()
  @IsString()
  headline?: string;

  @ApiProperty({ required: false, example: 'Specializing in Solidity & Layer-2 dApps' })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiProperty({ type: SocialLinksDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => SocialLinksDto)
  socialLinks?: SocialLinksDto;
}
