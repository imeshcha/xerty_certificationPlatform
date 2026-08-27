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
      // Ensure solanaAddress is attached
      if (!existing.solanaAddress) {
        existing.solanaAddress = solanaAddress;
      }
      if (!existing.email && userData.email) existing.email = userData.email;
      if (!existing.fullName && userData.fullName) existing.fullName = userData.fullName;
      if (userData.privyUserId) existing.privyUserId = userData.privyUserId;
      if (walletAddress) existing.walletAddress = walletAddress.toLowerCase();

      // If user provided a specific role and the existing role is not locked yet, lock it
      if (userData.role && !existing.isRoleLocked) {
        existing.role = userData.role;
        existing.isRoleLocked = true;
      }

      return existing.save();
    }

    // New user with both EVM and Solana addresses
    return this.userModel.create({
      ...userData,
      walletAddress: walletAddress?.toLowerCase(),
      solanaAddress,
      role: userData.role || UserRole.STUDENT,
      isRoleLocked: !!userData.role,
    });
  }

  async updateIssuerProfile(
    identifier: { userId?: string; walletAddress?: string },
    profileData: {
      fullName?: string;
      roleInInstitute?: string;
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

    const setPayload: any = {
      role: UserRole.ISSUER,
      isRoleLocked: true,
      issuerProfile: {
        ...profileData,
        isVerified: false,
      },
    };
    if (profileData.fullName) {
      setPayload.fullName = profileData.fullName;
    }

    const updated = await this.userModel
      .findOneAndUpdate(
        query,
        {
          $set: setPayload,
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
