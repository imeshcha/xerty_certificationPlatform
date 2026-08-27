import { IsEnum, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TemplateOrientation } from '../schemas/certificate-template.schema';

export class CreateTemplateDto {
  @ApiProperty({ example: '658b1234abcd5678ef012345' })
  @IsNotEmpty()
  @IsString()
  issuerId: string;

  @ApiProperty({ required: false, example: '658b1234abcd5678ef012346' })
  @IsOptional()
  @IsString()
  courseId?: string;

  @ApiProperty({ example: 'Gold Honor Graduate Template' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'QmBackgroundCID1234567890abcdef' })
  @IsNotEmpty()
  @IsString()
  bgImageIpfsCid: string;

  @ApiProperty({ example: 'https://gateway.pinata.cloud/ipfs/QmBackgroundCID1234567890abcdef' })
  @IsNotEmpty()
  @IsString()
  bgImageUrl: string;

  @ApiProperty({
    example: {
      width: 1920,
      height: 1080,
      elements: [
        { id: 'student_name', tag: '{{student_name}}', x: 960, y: 480, fontSize: 48 },
        { id: 'qr_code', tag: '{{qr_code}}', x: 1650, y: 880, width: 160, height: 160 },
      ],
    },
  })
  @IsNotEmpty()
  @IsObject()
  canvasLayoutJson: Record<string, any>;

  @ApiProperty({ enum: TemplateOrientation, default: TemplateOrientation.LANDSCAPE })
  @IsOptional()
  @IsEnum(TemplateOrientation)
  orientation?: string;
}

export class UpdateTemplateDto {
  @ApiProperty({ required: false, example: 'Gold Honor Graduate Template (v2)' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  canvasLayoutJson?: Record<string, any>;

  @ApiProperty({ enum: TemplateOrientation, required: false })
  @IsOptional()
  @IsEnum(TemplateOrientation)
  orientation?: string;
}
