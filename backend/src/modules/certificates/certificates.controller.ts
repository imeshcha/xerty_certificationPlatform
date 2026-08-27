import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CertificatesService } from './certificates.service';
import {
  CreateCertificateDto,
  RevokeCertificateDto,
} from './dto/create-certificate.dto';
import { RelayClaimDto, TopUpGasTankDto } from './dto/relay-claim.dto';

@ApiTags('Certificates')
@Controller('certificates')
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all certificates' })
  @ApiResponse({ status: 200, description: 'Certificates retrieved successfully' })
  async getAllCertificates() {
    return this.certificatesService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Create new certificate record' })
  @ApiResponse({ status: 201, description: 'Certificate record created successfully' })
  async createCertificate(@Body() dto: CreateCertificateDto) {
    return this.certificatesService.create(dto);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Create multiple certificate records in batch' })
  @ApiResponse({ status: 201, description: 'Certificates created successfully' })
  async createCertificatesBulk(@Body() dtoList: CreateCertificateDto[]) {
    return this.certificatesService.bulkCreate(dtoList);
  }

  @Get('course/:courseId')
  @ApiOperation({ summary: 'Get certificates issued for a specific course' })
  @ApiResponse({ status: 200, description: 'Certificates retrieved successfully' })
  async getCertificatesByCourse(@Param('courseId') courseId: string) {
    return this.certificatesService.findByCourseId(courseId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get certificate by Certificate ID' })
  @ApiResponse({ status: 200, description: 'Certificate retrieved successfully' })
  async getCertificateById(@Param('id') id: string) {
    return this.certificatesService.findByCertificateId(id);
  }

  @Get('hash/:hash')
  @ApiOperation({ summary: 'Get certificate by Keccak-256 certificate hash' })
  @ApiResponse({ status: 200, description: 'Certificate retrieved successfully' })
  async getCertificateByHash(@Param('hash') hash: string) {
    return this.certificatesService.findByCertificateHash(hash);
  }

  @Get('student/wallet/:wallet')
  @ApiOperation({ summary: 'Get certificates owned by student wallet' })
  @ApiResponse({ status: 200, description: 'Certificates retrieved successfully' })
  async getCertificatesByStudentWallet(@Param('wallet') wallet: string) {
    return this.certificatesService.findByStudentWallet(wallet);
  }

  @Get('student/email/:email')
  @ApiOperation({ summary: 'Get certificates by student email' })
  @ApiResponse({ status: 200, description: 'Certificates retrieved successfully' })
  async getCertificatesByStudentEmail(@Param('email') email: string) {
    return this.certificatesService.findByStudentEmail(email);
  }

  @Get('issuer/:issuerId')
  @ApiOperation({ summary: 'Get all certificates issued by institution' })
  @ApiResponse({ status: 200, description: 'Certificates retrieved successfully' })
  async getCertificatesByIssuer(@Param('issuerId') issuerId: string) {
    return this.certificatesService.findByIssuerId(issuerId);
  }

  @Patch(':id/claim')
  @ApiOperation({ summary: 'Claim certificate with student wallet and/or email' })
  @ApiResponse({ status: 200, description: 'Certificate claimed successfully' })
  async claimCertificate(
    @Param('id') id: string,
    @Body() body: { studentWallet?: string; studentEmail?: string },
  ) {
    return this.certificatesService.claim(id, body);
  }

  @Patch(':id/revoke')
  @ApiOperation({ summary: 'Revoke certificate with on-chain reason' })
  @ApiResponse({ status: 200, description: 'Certificate status updated to REVOKED' })
  async revokeCertificate(
    @Param('id') id: string,
    @Body() dto: RevokeCertificateDto,
  ) {
    return this.certificatesService.revoke(id, dto);
  }

  @Post('relay-claim')
  @ApiOperation({ summary: 'Gasless meta-transaction student certificate claim' })
  @ApiResponse({ status: 200, description: 'Certificate claimed on-chain with sponsored gas' })
  async relayClaimCertificate(@Body() dto: RelayClaimDto) {
    return this.certificatesService.relayClaim(dto);
  }

  @Get('issuer/:issuerId/gas-tank')
  @ApiOperation({ summary: 'Get institution gas tank and sponsored claim credits' })
  @ApiResponse({ status: 200, description: 'Gas tank status retrieved successfully' })
  async getIssuerGasTank(@Param('issuerId') issuerId: string) {
    return this.certificatesService.getGasTank(issuerId);
  }

  @Post('issuer/:issuerId/gas-tank/topup')
  @ApiOperation({ summary: 'Top up institution gas tank balance' })
  @ApiResponse({ status: 200, description: 'Gas tank topped up successfully' })
  async topUpIssuerGasTank(
    @Param('issuerId') issuerId: string,
    @Body() body: TopUpGasTankDto,
  ) {
    return this.certificatesService.topUpGasTank(issuerId, body.amount || 25);
  }

  @Get('vault/:issuerAddress')
  @ApiOperation({ summary: 'Get on-chain smart contract gas vault balance' })
  @ApiResponse({ status: 200, description: 'On-chain gas vault details retrieved' })
  async getOnChainGasVault(
    @Param('issuerAddress') issuerAddress: string,
  ) {
    return this.certificatesService.getOnChainVault(issuerAddress);
  }
}
