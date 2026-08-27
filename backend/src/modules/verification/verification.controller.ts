import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { VerificationService } from './verification.service';
import { VerifyCertificateParamDto } from './dto/verify-certificate.dto';

@ApiTags('Public Verification')
@Controller('verify')
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

  @Get(':certificateId')
  @ApiOperation({
    summary: 'Public Zero-Login Certificate Verification',
    description:
      'Cross-validates certificate authenticity against MongoDB Atlas and Arbitrum Sepolia on-chain contract state.',
  })
  @ApiParam({ name: 'certificateId', example: 'XERTY-2026-A49F1B' })
  @ApiResponse({
    status: 200,
    description: 'Cryptographic verification report returned successfully',
  })
  async verifyCertificate(@Param() params: VerifyCertificateParamDto) {
    return this.verificationService.verify(params.certificateId);
  }
}
