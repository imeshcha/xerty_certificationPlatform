import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type CourseDocument = Course & Document;

@Schema({ timestamps: true, collection: 'courses' })
export class Course {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, index: true })
  issuerId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true, uppercase: true, trim: true })
  code: string;

  @Prop({ trim: true })
  description?: string;

  @Prop({ trim: true })
  courseUrl?: string;

  @Prop({ default: 0 })
  durationHours: number;

  @Prop({ type: [String], default: [] })
  skills: string[];

  @Prop({ default: 'GOLD_CLASSIC', trim: true })
  certificateTemplate: string;

  @Prop({ default: 'Certificate of Completion', trim: true })
  templateTitle?: string;

  @Prop({ default: 'Program Director', trim: true })
  signatureTitle?: string;

  @Prop({ type: Object, default: null })
  templateJson?: Record<string, any>;

  @Prop({ default: true, index: true })
  isActive: boolean;
}

export const CourseSchema = SchemaFactory.createForClass(Course);
CourseSchema.index({ issuerId: 1, code: 1 }, { unique: true });
CourseSchema.index({ issuerId: 1, isActive: 1 });
