import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Course, CourseDocument } from './schemas/course.schema';
import { User, UserDocument, UserRole } from '../users/schemas/user.schema';
import { CreateCourseDto, UpdateCourseDto } from './dto/create-course.dto';

@Injectable()
export class CoursesService {
  constructor(
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  private async resolveUserObjectId(identifier: string): Promise<Types.ObjectId> {
    if (!identifier) {
      const fallbackUser = await this.userModel.findOne().exec();
      if (fallbackUser) return fallbackUser._id as Types.ObjectId;
      const created = await this.userModel.create({ role: UserRole.ISSUER });
      return created._id as Types.ObjectId;
    }

    // Check if valid hex 24-character ObjectId
    if (Types.ObjectId.isValid(identifier) && identifier.length === 24 && !identifier.includes(':')) {
      return new Types.ObjectId(identifier);
    }

    // Find user by privyUserId, walletAddress, or solanaAddress
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

  async findAll(): Promise<CourseDocument[]> {
    return this.courseModel
      .find({ isActive: true })
      .populate('issuerId', 'academyName slug onchainIssuerAddress isVerified')
      .exec();
  }

  async findAllByIssuer(issuerIdentifier: string): Promise<CourseDocument[]> {
    const issuerObjectId = await this.resolveUserObjectId(issuerIdentifier);
    return this.courseModel
      .find({ issuerId: issuerObjectId, isActive: true })
      .populate('issuerId', 'academyName slug onchainIssuerAddress isVerified')
      .exec();
  }

  async findById(id: string): Promise<CourseDocument> {
    const course = await this.courseModel
      .findById(id)
      .populate('issuerId', 'academyName slug onchainIssuerAddress isVerified')
      .exec();
    if (!course) {
      throw new NotFoundException('Course not found');
    }
    return course;
  }

  async create(dto: CreateCourseDto): Promise<CourseDocument> {
    const issuerObjectId = await this.resolveUserObjectId(dto.issuerId);
    const newCourse = new this.courseModel({
      ...dto,
      issuerId: issuerObjectId,
      code: dto.code.toUpperCase(),
    });
    return newCourse.save();
  }

  async update(id: string, dto: UpdateCourseDto): Promise<CourseDocument> {
    const updateData: any = { ...dto };
    if (dto.issuerId) {
      updateData.issuerId = await this.resolveUserObjectId(dto.issuerId);
    }
    const updated = await this.courseModel
      .findByIdAndUpdate(id, { $set: updateData }, { new: true })
      .exec();
    if (!updated) {
      throw new NotFoundException('Course not found');
    }
    return updated;
  }
}
