import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SyncUserDto {
  @ApiProperty({ example: 'did:privy:clx9832abc...' })
  @IsString()
  @IsNotEmpty()
  privyUserId: string;

  @ApiProperty({ example: '0x1234567890abcdef1234567890abcdef12345678' })
  @IsString()
  @IsNotEmpty()
  walletAddress: string;

  @ApiProperty({ required: false, example: '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d' })
  @IsOptional()
  @IsString()
  solanaAddress?: string;

  @ApiProperty({ example: 'GOOGLE' })
  @IsOptional()
  @IsString()
  authProvider?: string;

  @ApiProperty({ required: false, example: 'alice@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ required: false, example: 'Alice Doe' })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiProperty({ required: false, example: 'https://avatar.url' })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiProperty({ default: 'STUDENT', example: 'STUDENT' })
  @IsOptional()
  @IsString()
  role?: string;
}
