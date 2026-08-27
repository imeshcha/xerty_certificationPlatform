import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type StudentProfileDocument = StudentProfile & Document;

@Schema({ _id: false })
export class SocialLinks {
  @Prop({ trim: true })
  linkedin?: string;

  @Prop({ trim: true })
  github?: string;

  @Prop({ trim: true })
  twitter?: string;
}

export const SocialLinksSchema = SchemaFactory.createForClass(SocialLinks);

@Schema({ timestamps: true, collection: 'student_profiles' })
export class StudentProfile {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, trim: true })
  fullName: string;

  @Prop({ trim: true })
  headline?: string;

  @Prop({ trim: true })
  bio?: string;

  @Prop({ type: SocialLinksSchema, default: {} })
  socialLinks: SocialLinks;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Certificate' }], default: [] })
  claimedCertificates: MongooseSchema.Types.ObjectId[];
}

export const StudentProfileSchema = SchemaFactory.createForClass(StudentProfile);

StudentProfileSchema.index({ userId: 1 }, { unique: true });
