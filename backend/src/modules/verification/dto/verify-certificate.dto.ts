import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyCertificateParamDto {
  @ApiProperty({
    example: 'XERTY-2026-A49F1B',
    description: 'Human-readable unique certificate identifier',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^[a-zA-Z0-9\-_]{5,50}$/, {
    message: 'certificateId must be an alphanumeric identifier between 5 and 50 characters',
  })
  certificateId: string;
}
