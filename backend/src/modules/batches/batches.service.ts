import {
  Injectable,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ethers } from 'ethers';
import { SingleIssueDto } from './dto/single-issue.dto';
import { ProcessBatchDto, ParseFileContentDto } from './dto/process-batch.dto';
import { CertificatesService } from '../certificates/certificates.service';
import { IpfsService } from '../ipfs/ipfs.service';
import { CoursesService } from '../courses/courses.service';
import { IssuersService } from '../issuers/issuers.service';
import { TemplatesService } from '../templates/templates.service';

@Injectable()
export class BatchesService {
  private readonly logger = new Logger(BatchesService.name);

  constructor(
    private readonly certificatesService: CertificatesService,
    private readonly ipfsService: IpfsService,
    private readonly coursesService: CoursesService,
    private readonly issuersService: IssuersService,
    private readonly templatesService: TemplatesService,
  ) {}

  private generateCertificateId(): string {
    const year = new Date().getFullYear();
    const randomHex = ethers.hexlify(ethers.randomBytes(4)).replace('0x', '').toUpperCase();
    return `XERTY-${year}-${randomHex}`;
  }

  private computeCertificateHash(data: {
    certificateId: string;
    studentEmail: string;
    studentWallet: string;
    courseId: string;
    issueDate: string;
  }): string {
    const serialized = JSON.stringify({
      id: data.certificateId,
      email: data.studentEmail.toLowerCase(),
      wallet: data.studentWallet.toLowerCase(),
      course: data.courseId,
      date: data.issueDate,
    });
    return ethers.keccak256(ethers.toUtf8Bytes(serialized));
  }

  async singleIssue(dto: SingleIssueDto) {
    this.logger.log(`Initiating single issuance for: ${dto.studentEmail}`);

    await this.issuersService.findByUserId(dto.issuerId).catch(async () => {
      return this.issuersService.findByOnchainAddress(dto.issuerId);
    });
    const course = await this.coursesService.findById(dto.courseId);
    const template = await this.templatesService.findById(dto.templateId);

    const certificateId = this.generateCertificateId();
    const issueDate = new Date().toISOString();
    const certificateHash = this.computeCertificateHash({
      certificateId,
      studentEmail: dto.studentEmail,
      studentWallet: dto.studentWallet,
      courseId: dto.courseId,
      issueDate,
    });

    const metadataPayload = {
      name: `Certificate of Completion: ${course.title}`,
      description: `Verifiable credential issued to ${dto.studentName} for successfully completing ${course.title}.`,
      image: template?.bgImageUrl || 'ipfs://QmSampleBackgroundCID',
      external_url: `https://xerty.app/verify/${certificateId}`,
      attributes: [
        { trait_type: 'Recipient Name', value: dto.studentName },
        { trait_type: 'Course Title', value: course.title },
        { trait_type: 'Course Code', value: course.code },
        { trait_type: 'Grade', value: dto.grade || 'Pass' },
        { trait_type: 'Score', value: dto.score || 100 },
        { trait_type: 'Certificate ID', value: certificateId },
        { trait_type: 'Issue Date', value: issueDate },
      ],
      properties: {
        certificate_id: certificateId,
        certificate_hash: certificateHash,
        recipient_wallet: dto.studentWallet.toLowerCase(),
      },
    };

    const ipfsResult = await this.ipfsService.pinJSON(metadataPayload);

    const certificate = await this.certificatesService.create({
      certificateId,
      issuerId: dto.issuerId as any,
      courseId: dto.courseId as any,
      templateId: dto.templateId as any,
      studentName: dto.studentName,
      studentEmail: dto.studentEmail,
      studentWallet: dto.studentWallet,
      grade: dto.grade,
      score: dto.score,
      issueDate: new Date(issueDate),
      imageIpfsCid: template?.bgImageIpfsCid || 'QmSampleBackgroundCID',
      ipfsCID: ipfsResult.cid,
      certificateHash,
      transactionHash: dto.transactionHash,
      status: 'ISSUED',
    });

    return {
      message: 'Certificate issued successfully',
      certificate,
      verificationUrl: `https://xerty.app/verify/${certificateId}`,
    };
  }

  async parseFileContent(dto: ParseFileContentDto) {
    if (dto.fileType === 'csv') {
      const lines = dto.fileContent.split(/\r?\n/).filter((line) => line.trim().length > 0);
      if (lines.length < 2) {
        throw new BadRequestException('CSV file must contain a header row and at least one data row');
      }

      const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
      const nameIdx = headers.findIndex((h) => h.includes('name'));
      const emailIdx = headers.findIndex((h) => h.includes('email'));
      const walletIdx = headers.findIndex((h) => h.includes('wallet') || h.includes('address'));
      const gradeIdx = headers.findIndex((h) => h.includes('grade'));
      const scoreIdx = headers.findIndex((h) => h.includes('score'));

      if (emailIdx === -1 || nameIdx === -1) {
        throw new BadRequestException("CSV must contain 'name' and 'email' columns");
      }

      const parsedRows = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map((c) => c.trim());
        const studentName = cols[nameIdx] || '';
        const studentEmail = cols[emailIdx] || '';
        const studentWallet = walletIdx !== -1 ? cols[walletIdx] : '';
        const grade = gradeIdx !== -1 ? cols[gradeIdx] : undefined;
        const score = scoreIdx !== -1 ? parseFloat(cols[scoreIdx]) : undefined;

        const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(studentEmail);
        const isValidWallet = !studentWallet || /^0x[a-fA-F0-9]{40}$/.test(studentWallet);

        parsedRows.push({
          rowIndex: i,
          studentName,
          studentEmail,
          studentWallet: studentWallet || '0x0000000000000000000000000000000000000000',
          grade,
          score,
          isValid: isValidEmail && isValidWallet && studentName.length > 0,
          validationError: !isValidEmail
            ? 'Invalid email format'
            : !isValidWallet
            ? 'Invalid EVM wallet address'
            : !studentName
            ? 'Missing student name'
            : null,
        });
      }

      return {
        totalRows: parsedRows.length,
        validRowsCount: parsedRows.filter((r) => r.isValid).length,
        invalidRowsCount: parsedRows.filter((r) => !r.isValid).length,
        rows: parsedRows,
      };
    }

    throw new BadRequestException('Unsupported file format. Please upload a valid CSV or Excel file.');
  }

  async processBatch(dto: ProcessBatchDto) {
    this.logger.log(`Processing batch '${dto.batchName}' with ${dto.records.length} records`);

    const course = await this.coursesService.findById(dto.courseId);
    const template = await this.templatesService.findById(dto.templateId);

    let successfulCount = 0;
    let failedCount = 0;
    const logs = [];

    for (let i = 0; i < dto.records.length; i++) {
      const record = dto.records[i];
      try {
        const certificateId = this.generateCertificateId();
        const issueDate = new Date().toISOString();
        const studentWallet = record.studentWallet || '0x0000000000000000000000000000000000000000';

        const certificateHash = this.computeCertificateHash({
          certificateId,
          studentEmail: record.studentEmail,
          studentWallet,
          courseId: dto.courseId,
          issueDate,
        });

        const metadata = {
          name: `Certificate of Completion: ${course.title}`,
          description: `Issued to ${record.studentName} for ${course.title}`,
          image: template?.bgImageUrl || 'ipfs://QmSampleBackgroundCID',
          properties: {
            certificate_id: certificateId,
            certificate_hash: certificateHash,
          },
        };
        const ipfsResult = await this.ipfsService.pinJSON(metadata);

        await this.certificatesService.create({
          certificateId,
          issuerId: dto.issuerId as any,
          courseId: dto.courseId as any,
          templateId: dto.templateId as any,
          studentName: record.studentName,
          studentEmail: record.studentEmail,
          studentWallet,
          grade: record.grade,
          score: record.score,
          issueDate: new Date(issueDate),
          imageIpfsCid: template?.bgImageIpfsCid || 'QmSampleBackgroundCID',
          ipfsCID: ipfsResult.cid,
          certificateHash,
          transactionHash: dto.transactionHash,
          status: 'ISSUED',
        });

        successfulCount++;
        logs.push({
          rowIndex: i + 1,
          studentEmail: record.studentEmail,
          studentName: record.studentName,
          status: 'SUCCESS',
          certificateId,
          certificateHash,
        });
      } catch (err: any) {
        failedCount++;
        logs.push({
          rowIndex: i + 1,
          studentEmail: record.studentEmail,
          studentName: record.studentName,
          status: 'FAILED',
          errorMessage: err.message || 'Processing error',
        });
      }
    }

    return {
      message: 'Batch processing finished',
      totalRecords: dto.records.length,
      successfulCount,
      failedCount,
      logs,
    };
  }

  async getBatchesByIssuer(issuerId: string): Promise<any[]> {
    return [];
  }

  async getBatchById(id: string): Promise<any> {
    return { id, status: 'COMPLETED' };
  }
}
