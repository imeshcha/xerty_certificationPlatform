import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type IssuerProfileDocument = IssuerProfile & Document;

@Schema({ _id: false })
export class OrganizationInfo {
  @Prop({ trim: true })
  description?: string;

  @Prop({ trim: true })
  website?: string;

  @Prop({ lowercase: true, trim: true })
  contactEmail?: string;

  @Prop({ trim: true })
  contactPhone?: string;

  @Prop()
  logoUrl?: string;

  @Prop({ trim: true })
  address?: string;
}

export const OrganizationInfoSchema = SchemaFactory.createForClass(OrganizationInfo);

@Schema({ timestamps: true, collection: 'issuer_profiles' })
export class IssuerProfile {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, trim: true })
  academyName: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true, index: true })
  slug: string;

  @Prop({ type: OrganizationInfoSchema, default: {} })
  organizationInfo: OrganizationInfo;

  @Prop({ required: true, unique: true, lowercase: true, trim: true, index: true })
  onchainIssuerAddress: string;

  @Prop({ default: false, index: true })
  isVerified: boolean;
}

export const IssuerProfileSchema = SchemaFactory.createForClass(IssuerProfile);

IssuerProfileSchema.index({ userId: 1 }, { unique: true });
IssuerProfileSchema.index({ slug: 1 }, { unique: true });
IssuerProfileSchema.index({ onchainIssuerAddress: 1 }, { unique: true });
