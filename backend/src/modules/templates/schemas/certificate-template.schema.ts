import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type CertificateTemplateDocument = CertificateTemplate & Document;

export enum TemplateOrientation {
  LANDSCAPE = 'LANDSCAPE',
  PORTRAIT = 'PORTRAIT',
}

@Schema({ timestamps: true, collection: 'certificate_templates' })
export class CertificateTemplate {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'IssuerProfile', required: true, index: true })
  issuerId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Course', index: true })
  courseId?: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true })
  bgImageIpfsCid: string;

  @Prop({ required: true })
  bgImageUrl: string;

  @Prop({ type: MongooseSchema.Types.Mixed, required: true })
  canvasLayoutJson: Record<string, any>;

  @Prop({ enum: TemplateOrientation, default: TemplateOrientation.LANDSCAPE })
  orientation: string;

  @Prop({ default: true, index: true })
  isActive: boolean;
}

export const CertificateTemplateSchema = SchemaFactory.createForClass(CertificateTemplate);
CertificateTemplateSchema.index({ issuerId: 1, isActive: 1 });
CertificateTemplateSchema.index({ courseId: 1 });
