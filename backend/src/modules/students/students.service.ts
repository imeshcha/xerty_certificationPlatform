import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, UserRole } from '../users/schemas/user.schema';
import { CreateStudentProfileDto } from './dto/create-student-profile.dto';
import { UpdateStudentProfileDto } from './dto/update-student-profile.dto';

@Injectable()
export class StudentsService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) {}

  async findByUserId(userId: string): Promise<any> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('Student profile not found for this user');
    }
    return {
      _id: user._id,
      userId: user._id,
      fullName: user.fullName,
      email: user.email,
      walletAddress: user.walletAddress,
      headline: user.studentProfile?.headline,
      bio: user.studentProfile?.bio,
      socialLinks: {
        linkedin: user.studentProfile?.linkedin,
        github: user.studentProfile?.github,
        twitter: user.studentProfile?.twitter,
      },
    };
  }

  async findById(id: string): Promise<any> {
    return this.findByUserId(id);
  }

  async create(dto: CreateStudentProfileDto): Promise<any> {
    const updated = await this.userModel
      .findByIdAndUpdate(
        dto.userId,
        {
          role: UserRole.STUDENT,
          fullName: dto.fullName,
          studentProfile: {
            headline: dto.headline,
            bio: dto.bio,
            linkedin: dto.socialLinks?.linkedin,
            github: dto.socialLinks?.github,
            twitter: dto.socialLinks?.twitter,
          },
        },
        { new: true },
      )
      .exec();

    if (!updated) {
      throw new NotFoundException('User not found to create student profile');
    }

    return {
      _id: updated._id,
      userId: updated._id,
      fullName: updated.fullName,
      headline: updated.studentProfile?.headline,
      bio: updated.studentProfile?.bio,
      socialLinks: {
        linkedin: updated.studentProfile?.linkedin,
      },
    };
  }

  async update(userId: string, dto: UpdateStudentProfileDto): Promise<any> {
    const updatePayload: any = {};
    if (dto.fullName) updatePayload.fullName = dto.fullName;
    if (dto.headline) updatePayload['studentProfile.headline'] = dto.headline;
    if (dto.bio) updatePayload['studentProfile.bio'] = dto.bio;
    if (dto.socialLinks?.linkedin) updatePayload['studentProfile.linkedin'] = dto.socialLinks.linkedin;

    const updated = await this.userModel.findByIdAndUpdate(userId, { $set: updatePayload }, { new: true }).exec();
    if (!updated) {
      throw new NotFoundException('Student profile not found');
    }
    return updated;
  }

  async claimCertificate(studentUserId: string, certificateId: string): Promise<any> {
    return { success: true, studentUserId, certificateId };
  }
}
