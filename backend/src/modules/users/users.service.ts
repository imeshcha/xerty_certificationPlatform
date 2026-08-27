import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, UserRole } from './schemas/user.schema';
import { Keypair } from '@solana/web3.js';
import * as crypto from 'crypto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  private generateSolanaAddress(seedSource: string): string {
    try {
      const hash = crypto.createHash('sha256').update(seedSource.toLowerCase()).digest();
      const keypair = Keypair.fromSeed(hash);
      return keypair.publicKey.toBase58();
    } catch {
      return '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d';
    }
  }

  async findByPrivyId(privyUserId: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ privyUserId }).exec();
  }

  async findByWallet(walletAddress: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({
        $or: [
          { walletAddress: walletAddress.toLowerCase() },
          { solanaAddress: walletAddress },
        ],
      })
      .exec();
  }

  async findBySlug(slug: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ 'issuerProfile.slug': slug.toLowerCase() }).exec();
  }

  async findById(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async upsertUser(userData: Partial<User>): Promise<UserDocument> {
    const { privyUserId, walletAddress } = userData;

    // Derive deterministic Solana Address if not explicitly supplied
    const solanaAddress =
      userData.solanaAddress ||
      this.generateSolanaAddress(walletAddress || privyUserId || 'default_seed');

    // Find existing user by wallet, solanaAddress, or Privy ID
    let existing = await this.userModel
      .findOne({
        $or: [
          { privyUserId },
          { walletAddress: walletAddress?.toLowerCase() },
          { solanaAddress },
        ],
      })
      .exec();

    if (existing) {
      if (!existing.solanaAddress) {
        existing.solanaAddress = solanaAddress;
      }
      if (!existing.email && userData.email) existing.email = userData.email;
      if (!existing.fullName && userData.fullName) existing.fullName = userData.fullName;
      if (userData.privyUserId) existing.privyUserId = userData.privyUserId;
      if (walletAddress) existing.walletAddress = walletAddress.toLowerCase();

      return existing.save();
    }

    // New user initial sync (UNASSIGNED role by default until registration form is completed)
    return this.userModel.create({
      ...userData,
      walletAddress: walletAddress?.toLowerCase(),
      solanaAddress,
      role: userData.role || UserRole.UNASSIGNED,
      isRoleLocked: false,
      isProfileComplete: false,
    });
  }

  async completeRegistration(payload: {
    userId?: string;
    walletAddress?: string;
    privyUserId?: string;
    role: UserRole;
    email?: string;
    fullName?: string;
    issuerProfile?: any;
    studentProfile?: any;
  }): Promise<UserDocument> {
    const { userId, walletAddress, privyUserId, role, email, fullName, issuerProfile, studentProfile } = payload;

    const query: any = {
      $or: [],
    };
    if (userId) query.$or.push({ _id: userId });
    if (privyUserId) query.$or.push({ privyUserId });
    if (walletAddress) query.$or.push({ walletAddress: walletAddress.toLowerCase() });

    if (query.$or.length === 0) {
      query.$or.push({ walletAddress: '0x0' });
    }

    let user = await this.userModel.findOne(query).exec();

    if (user && user.isRoleLocked && user.isProfileComplete && user.role !== UserRole.UNASSIGNED && user.role !== role) {
      throw new ForbiddenException(
        `Strict Access Policy: An account registered as ${user.role} cannot create or access a ${role} account.`
      );
    }

    const solanaAddress =
      user?.solanaAddress ||
      this.generateSolanaAddress(walletAddress || privyUserId || user?.walletAddress || 'default_seed');

    const updateDoc: any = {
      role,
      isRoleLocked: true,
      isProfileComplete: true,
      solanaAddress,
    };

    if (email) updateDoc.email = email;
    if (fullName) updateDoc.fullName = fullName;
    if (privyUserId) updateDoc.privyUserId = privyUserId;
    if (walletAddress) updateDoc.walletAddress = walletAddress.toLowerCase();

    if (role === UserRole.ISSUER && issuerProfile) {
      updateDoc.issuerProfile = {
        ...issuerProfile,
        isVerified: false,
      };
    } else if (role === UserRole.STUDENT && studentProfile) {
      updateDoc.studentProfile = studentProfile;
      if (studentProfile.fullName) updateDoc.fullName = studentProfile.fullName;
    }

    if (user) {
      Object.assign(user, updateDoc);
      return user.save();
    }

    return this.userModel.create(updateDoc);
  }

  async updateIssuerProfile(
    identifier: { userId?: string; walletAddress?: string },
    profileData: {
      academyName?: string;
      slug?: string;
      website?: string;
      contactEmail?: string;
      description?: string;
    },
  ): Promise<UserDocument> {
    const query = identifier.userId
      ? { _id: identifier.userId }
      : {
          $or: [
            { walletAddress: identifier.walletAddress?.toLowerCase() },
            { solanaAddress: identifier.walletAddress },
          ],
        };

    const existingUser = await this.userModel.findOne(query).exec();
    if (existingUser && existingUser.isRoleLocked && existingUser.role === UserRole.STUDENT) {
      throw new ForbiddenException('Strict Access: Student accounts cannot create an Issuer profile or access the Issuer portal.');
    }

    const updated = await this.userModel
      .findOneAndUpdate(
        query,
        {
          $set: {
            role: UserRole.ISSUER,
            isRoleLocked: true,
            isProfileComplete: true,
            issuerProfile: {
              ...profileData,
              isVerified: false,
            },
          },
        },
        { new: true, upsert: true },
      )
      .exec();

    if (!updated) {
      throw new NotFoundException('User not found to update issuer profile');
    }
    return updated;
  }

  async updateStudentProfile(
    identifier: { userId?: string; walletAddress?: string },
    profileData: {
      fullName?: string;
      headline?: string;
      bio?: string;
      linkedin?: string;
      github?: string;
      twitter?: string;
    },
  ): Promise<UserDocument> {
    const query = identifier.userId
      ? { _id: identifier.userId }
      : {
          $or: [
            { walletAddress: identifier.walletAddress?.toLowerCase() },
            { solanaAddress: identifier.walletAddress },
          ],
        };

    const existingUser = await this.userModel.findOne(query).exec();
    if (existingUser && existingUser.isRoleLocked && existingUser.role === UserRole.ISSUER) {
      throw new ForbiddenException('Strict Access: Issuer accounts cannot create a Student profile.');
    }

    const updatePayload: any = {
      role: UserRole.STUDENT,
      isRoleLocked: true,
      isProfileComplete: true,
      studentProfile: profileData,
    };
    if (profileData.fullName) {
      updatePayload.fullName = profileData.fullName;
    }

    const updated = await this.userModel
      .findOneAndUpdate(query, { $set: updatePayload }, { new: true, upsert: true })
      .exec();

    if (!updated) {
      throw new NotFoundException('User not found to update student profile');
    }
    return updated;
  }
}
