import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { SocialLinksDto } from './create-student-profile.dto';

export class UpdateStudentProfileDto {
  @ApiProperty({ required: false, example: 'Alice Doe' })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiProperty({ required: false, example: 'Lead Blockchain Architect' })
  @IsOptional()
  @IsString()
  headline?: string;

  @ApiProperty({ required: false, example: 'Updated bio description' })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiProperty({ type: SocialLinksDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => SocialLinksDto)
  socialLinks?: SocialLinksDto;
}
