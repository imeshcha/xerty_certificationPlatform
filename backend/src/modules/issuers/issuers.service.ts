import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, UserRole } from '../users/schemas/user.schema';
import { CreateIssuerProfileDto } from './dto/create-issuer-profile.dto';
import { UpdateIssuerProfileDto } from './dto/update-issuer-profile.dto';

@Injectable()
export class IssuersService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) {}

  async findByUserId(userId: string): Promise<any> {
    const user = await this.userModel.findById(userId).exec();
    if (!user || !user.issuerProfile) {
      throw new NotFoundException('Issuer profile not found for this user');
    }
    return {
      _id: user._id,
      userId: user._id,
      academyName: user.issuerProfile.academyName,
      slug: user.issuerProfile.slug,
      isVerified: user.issuerProfile.isVerified,
      onchainIssuerAddress: user.walletAddress,
      organizationInfo: {
        website: user.issuerProfile.website,
        contactEmail: user.issuerProfile.contactEmail,
        description: user.issuerProfile.description,
      },
    };
  }

  async findBySlug(slug: string): Promise<any> {
    const user = await this.userModel.findOne({ 'issuerProfile.slug': slug.toLowerCase() }).exec();
    if (!user || !user.issuerProfile) {
      throw new NotFoundException('Issuer profile not found');
    }
    return {
      _id: user._id,
      userId: user._id,
      academyName: user.issuerProfile.academyName,
      slug: user.issuerProfile.slug,
      isVerified: user.issuerProfile.isVerified,
      onchainIssuerAddress: user.walletAddress,
      organizationInfo: {
        website: user.issuerProfile.website,
        contactEmail: user.issuerProfile.contactEmail,
        description: user.issuerProfile.description,
      },
    };
  }

  async findByOnchainAddress(address: string): Promise<any> {
    const user = await this.userModel.findOne({ walletAddress: address.toLowerCase() }).exec();
    if (!user || !user.issuerProfile) {
      return null;
    }
    return {
      _id: user._id,
      userId: user._id,
      academyName: user.issuerProfile.academyName,
      slug: user.issuerProfile.slug,
      isVerified: user.issuerProfile.isVerified,
      onchainIssuerAddress: user.walletAddress,
      organizationInfo: {
        website: user.issuerProfile.website,
        contactEmail: user.issuerProfile.contactEmail,
        description: user.issuerProfile.description,
      },
    };
  }

  async create(dto: CreateIssuerProfileDto): Promise<any> {
    const query = dto.onchainIssuerAddress
      ? { walletAddress: dto.onchainIssuerAddress.toLowerCase() }
      : { _id: dto.userId };

    const updated = await this.userModel
      .findOneAndUpdate(
        query,
        {
          role: UserRole.ISSUER,
          issuerProfile: {
            academyName: dto.academyName,
            slug: dto.slug.toLowerCase(),
            website: dto.organizationInfo?.website,
            contactEmail: dto.organizationInfo?.contactEmail,
            description: dto.organizationInfo?.description,
            isVerified: false,
          },
        },
        { new: true, upsert: true },
      )
      .exec();

    return {
      _id: updated._id,
      userId: updated._id,
      academyName: updated.issuerProfile?.academyName,
      slug: updated.issuerProfile?.slug,
      isVerified: updated.issuerProfile?.isVerified,
      onchainIssuerAddress: updated.walletAddress,
      organizationInfo: {
        website: updated.issuerProfile?.website,
        contactEmail: updated.issuerProfile?.contactEmail,
        description: updated.issuerProfile?.description,
      },
    };
  }

  async update(userId: string, dto: UpdateIssuerProfileDto): Promise<any> {
    const updatePayload: any = {};
    if (dto.academyName) updatePayload['issuerProfile.academyName'] = dto.academyName;
    if (dto.organizationInfo?.website) updatePayload['issuerProfile.website'] = dto.organizationInfo.website;
    if (dto.organizationInfo?.contactEmail) updatePayload['issuerProfile.contactEmail'] = dto.organizationInfo.contactEmail;
    if (dto.organizationInfo?.description) updatePayload['issuerProfile.description'] = dto.organizationInfo.description;

    const updated = await this.userModel.findByIdAndUpdate(userId, { $set: updatePayload }, { new: true }).exec();

    if (!updated) {
      throw new NotFoundException('Issuer profile not found');
    }
    return updated;
  }

  async verifyIssuer(id: string): Promise<any> {
    const updated = await this.userModel
      .findByIdAndUpdate(id, { $set: { 'issuerProfile.isVerified': true } }, { new: true })
      .exec();
    if (!updated) {
      throw new NotFoundException('Issuer profile not found');
    }
    return updated;
  }
}
