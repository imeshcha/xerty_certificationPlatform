import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { OrganizationInfoDto } from './create-issuer-profile.dto';

export class UpdateIssuerProfileDto {
  @ApiProperty({ required: false, example: 'Global Blockchain Academy (Updated)' })
  @IsOptional()
  @IsString()
  academyName?: string;

  @ApiProperty({ type: OrganizationInfoDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => OrganizationInfoDto)
  organizationInfo?: OrganizationInfoDto;
}
