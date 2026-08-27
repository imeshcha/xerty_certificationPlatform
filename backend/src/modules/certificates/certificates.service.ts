import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Certificate,
  CertificateDocument,
  CertificateStatus,
} from './schemas/certificate.schema';
import { User, UserDocument, UserRole } from '../users/schemas/user.schema';
import { Course, CourseDocument } from '../courses/schemas/course.schema';
import {
  CreateCertificateDto,
  RevokeCertificateDto,
} from './dto/create-certificate.dto';

@Injectable()
export class CertificatesService {
  constructor(
    @InjectModel(Certificate.name) private certModel: Model<CertificateDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
  ) {}

  private async resolveUserObjectId(identifier: string): Promise<Types.ObjectId> {
    if (!identifier) {
      const fallbackUser = await this.userModel.findOne().exec();
      if (fallbackUser) return fallbackUser._id as Types.ObjectId;
      const created = await this.userModel.create({ role: UserRole.ISSUER });
      return created._id as Types.ObjectId;
    }

    if (Types.ObjectId.isValid(identifier) && identifier.length === 24 && !identifier.includes(':')) {
      return new Types.ObjectId(identifier);
    }

    let user = await this.userModel
      .findOne({
        $or: [
          { privyUserId: identifier },
          { walletAddress: identifier.toLowerCase() },
          { solanaAddress: identifier },
        ],
      })
      .exec();

    if (!user) {
      user = await this.userModel.create({
        privyUserId: identifier.startsWith('did:privy:') ? identifier : undefined,
        walletAddress: identifier.startsWith('0x') ? identifier.toLowerCase() : undefined,
        role: UserRole.ISSUER,
      });
    }

    return user._id as Types.ObjectId;
  }

  private async resolveCourseObjectId(identifier: string): Promise<Types.ObjectId> {
    if (!identifier) {
      const fallbackCourse = await this.courseModel.findOne().exec();
      if (fallbackCourse) return fallbackCourse._id as Types.ObjectId;
      const created = await this.courseModel.create({
        title: 'Blockchain Certification Cohort',
        code: 'CERT-101',
        durationHours: 40,
      });
      return created._id as Types.ObjectId;
    }

    if (Types.ObjectId.isValid(identifier) && identifier.length === 24 && !identifier.includes(':')) {
      const exists = await this.courseModel.findById(identifier).exec();
      if (exists) return exists._id as Types.ObjectId;
    }

    let course = await this.courseModel
      .findOne({
        $or: [
          { code: identifier.toUpperCase() },
          { title: identifier },
        ],
      })
      .exec();

    if (!course) {
      course = await this.courseModel.findOne().exec();
      if (!course) {
        course = await this.courseModel.create({
          title: 'Blockchain Certification Cohort',
          code: identifier.toUpperCase(),
          durationHours: 40,
        });
      }
    }

    return course._id as Types.ObjectId;
  }

  async findAll(): Promise<CertificateDocument[]> {
    return this.certModel
      .find()
      .populate('issuerId', 'academyName slug onchainIssuerAddress isVerified')
      .populate('courseId', 'title code durationHours')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByCourseId(courseId: string): Promise<CertificateDocument[]> {
    let query: any = {};
    if (Types.ObjectId.isValid(courseId) && courseId.length === 24) {
      query = { courseId: new Types.ObjectId(courseId) };
    } else {
      const course = await this.courseModel.findOne({ code: courseId.toUpperCase() }).exec();
      if (course) {
        query = { courseId: course._id };
      } else {
        return [];
      }
    }

    return this.certModel
      .find(query)
      .populate('issuerId', 'academyName slug onchainIssuerAddress isVerified')
      .populate('courseId', 'title code durationHours')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByCertificateId(certificateId: string): Promise<CertificateDocument> {
    const cert = await this.certModel
      .findOne({ certificateId })
      .populate('issuerId')
      .populate('courseId')
      .populate('templateId')
      .populate('studentId')
      .exec();
    if (!cert) {
      throw new NotFoundException('Certificate record not found');
    }
    return cert;
  }

  async findByCertificateHash(certificateHash: string): Promise<CertificateDocument> {
    const cert = await this.certModel
      .findOne({ certificateHash: certificateHash.toLowerCase() })
      .populate('issuerId')
      .populate('courseId')
      .exec();
    if (!cert) {
      throw new NotFoundException('Certificate hash not found');
    }
    return cert;
  }

  async findByStudentWallet(walletAddress: string): Promise<CertificateDocument[]> {
    return this.certModel
      .find({ studentWallet: walletAddress.toLowerCase() })
      .populate('issuerId', 'academyName slug onchainIssuerAddress isVerified')
      .populate('courseId', 'title code durationHours')
      .sort({ issueDate: -1 })
      .exec();
  }

  async findByStudentEmail(email: string): Promise<CertificateDocument[]> {
    return this.certModel
      .find({ studentEmail: email.toLowerCase() })
      .populate('issuerId', 'academyName slug onchainIssuerAddress isVerified')
      .populate('courseId', 'title code durationHours')
      .sort({ issueDate: -1 })
      .exec();
  }

  async findByIssuerId(issuerIdentifier: string): Promise<CertificateDocument[]> {
    const issuerObjectId = await this.resolveUserObjectId(issuerIdentifier);
    return this.certModel
      .find({ issuerId: issuerObjectId })
      .populate('courseId', 'title code')
      .sort({ createdAt: -1 })
      .exec();
  }

  async create(dto: CreateCertificateDto): Promise<CertificateDocument> {
    const issuerObjectId = await this.resolveUserObjectId(dto.issuerId);
    const courseObjectId = await this.resolveCourseObjectId(dto.courseId);
    const newCert = new this.certModel({
      ...dto,
      issuerId: issuerObjectId,
      courseId: courseObjectId,
      certificateHash: dto.certificateHash.toLowerCase(),
      studentWallet: (dto.studentWallet || '').toLowerCase(),
      studentEmail: dto.studentEmail.toLowerCase(),
      issueDate: dto.issueDate || new Date(),
    });
    return newCert.save();
  }

  async bulkCreate(dtoList: CreateCertificateDto[]): Promise<CertificateDocument[]> {
    const certDocs = await Promise.all(
      dtoList.map(async (dto) => {
        const issuerObjectId = await this.resolveUserObjectId(dto.issuerId);
        const courseObjectId = await this.resolveCourseObjectId(dto.courseId);
        return {
          ...dto,
          issuerId: issuerObjectId,
          courseId: courseObjectId,
          certificateHash: dto.certificateHash.toLowerCase(),
          studentWallet: (dto.studentWallet || '').toLowerCase(),
          studentEmail: dto.studentEmail.toLowerCase(),
          issueDate: dto.issueDate || new Date(),
        };
      }),
    );
    return this.certModel.insertMany(certDocs) as unknown as CertificateDocument[];
  }

  async claim(
    certificateId: string,
    claimData: { studentWallet?: string; studentEmail?: string },
  ): Promise<CertificateDocument> {
    const updatePayload: any = {
      isClaimed: true,
      claimedAt: new Date(),
    };
    if (claimData.studentWallet) {
      updatePayload.studentWallet = claimData.studentWallet.toLowerCase();
      updatePayload.claimedByWallet = claimData.studentWallet.toLowerCase();
    }
    if (claimData.studentEmail) {
      updatePayload.studentEmail = claimData.studentEmail.toLowerCase();
    }

    const updated = await this.certModel
      .findOneAndUpdate(
        { certificateId },
        { $set: updatePayload },
        { new: true },
      )
      .populate('issuerId', 'academyName slug onchainIssuerAddress isVerified')
      .populate('courseId', 'title code durationHours')
      .exec();

    if (!updated) {
      throw new NotFoundException('Certificate record not found');
    }
    return updated;
  }

  async revoke(certificateId: string, dto: RevokeCertificateDto): Promise<CertificateDocument> {
    const updated = await this.certModel
      .findOneAndUpdate(
        { certificateId },
        {
          $set: {
            status: CertificateStatus.REVOKED,
            revokedAt: new Date(),
            revocationReason: dto.revocationReason,
            ...(dto.transactionHash && { transactionHash: dto.transactionHash }),
            ...(dto.solanaSignature && { solanaSignature: dto.solanaSignature }),
          },
        },
        { new: true },
      )
      .exec();

    if (!updated) {
      throw new NotFoundException('Certificate record not found');
    }
    return updated;
  }
}
