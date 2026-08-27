import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

export enum UserRole {
  STUDENT = 'STUDENT',
  ISSUER = 'ISSUER',
  ADMIN = 'ADMIN',
}

export enum AuthProvider {
  GOOGLE = 'GOOGLE',
  APPLE = 'APPLE',
  TELEGRAM = 'TELEGRAM',
  LINKEDIN = 'LINKEDIN',
  GITHUB = 'GITHUB',
  DISCORD = 'DISCORD',
  TWITTER = 'TWITTER',
  EMAIL = 'EMAIL',
  WALLET = 'WALLET',
  WEB3_WALLET = 'WEB3_WALLET',
}

@Schema({ _id: false })
export class IssuerProfileData {
  @Prop({ trim: true })
  academyName?: string;

  @Prop({ lowercase: true, trim: true })
  slug?: string;

  @Prop({ trim: true })
  website?: string;

  @Prop({ trim: true })
  contactEmail?: string;

  @Prop({ trim: true })
  description?: string;

  @Prop({ default: false })
  isVerified?: boolean;
}

@Schema({ _id: false })
export class StudentProfileData {
  @Prop({ trim: true })
  fullName?: string;

  @Prop({ trim: true })
  headline?: string;

  @Prop({ trim: true })
  bio?: string;

  @Prop({ trim: true })
  linkedin?: string;

  @Prop({ trim: true })
  github?: string;

  @Prop({ trim: true })
  twitter?: string;
}

@Schema({ timestamps: true, collection: 'users' })
export class User {
  @Prop({ unique: true, sparse: true, lowercase: true, trim: true })
  email?: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true, index: true })
  walletAddress: string;

  @Prop({ index: true, trim: true })
  solanaAddress?: string;

  @Prop({ required: true, default: 'GOOGLE' })
  authProvider: string;

  @Prop({ required: true, unique: true, index: true })
  privyUserId: string;

  @Prop({ required: true, enum: UserRole, default: UserRole.STUDENT, index: true })
  role: string;

  @Prop({ trim: true })
  fullName?: string;

  @Prop()
  avatarUrl?: string;

  // Embedded Profile (Eliminates separate issuer_profiles & student_profiles tables)
  @Prop({ type: IssuerProfileData, default: {} })
  issuerProfile?: IssuerProfileData;

  @Prop({ type: StudentProfileData, default: {} })
  studentProfile?: StudentProfileData;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Explicit Index Definitions
UserSchema.index({ email: 1 }, { unique: true, sparse: true });
UserSchema.index({ walletAddress: 1 }, { unique: true });
UserSchema.index({ solanaAddress: 1 }, { sparse: true });
UserSchema.index({ privyUserId: 1 }, { unique: true });
UserSchema.index({ role: 1 });
UserSchema.index({ 'issuerProfile.slug': 1 }, { sparse: true });
