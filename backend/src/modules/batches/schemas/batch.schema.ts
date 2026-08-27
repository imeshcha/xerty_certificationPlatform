import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type BatchDocument = Batch & Document;

export enum BatchStatus {
  QUEUED = 'QUEUED',
  PROCESSING = 'PROCESSING',
  PINNING_IPFS = 'PINNING_IPFS',
  MINTING_ONCHAIN = 'MINTING_ONCHAIN',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

@Schema({ _id: false })
export class BatchRowLog {
  @Prop({ required: true })
  rowIndex: number;

  @Prop({ required: true, lowercase: true, trim: true })
  studentEmail: string;

  @Prop({ trim: true })
  studentName: string;

  @Prop({ required: true, enum: ['SUCCESS', 'FAILED'] })
  status: string;

  @Prop({ trim: true })
  certificateId?: string;

  @Prop({ trim: true })
  certificateHash?: string;

  @Prop({ trim: true })
  errorMessage?: string;
}

export const BatchRowLogSchema = SchemaFactory.createForClass(BatchRowLog);

@Schema({ timestamps: true, collection: 'certificate_batches' })
export class Batch {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'IssuerProfile', required: true, index: true })
  issuerId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'CertificateTemplate', required: true })
  templateId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Course', required: true, index: true })
  courseId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, trim: true })
  batchName: string;

  @Prop({ required: true, default: 0 })
  totalRecords: number;

  @Prop({ required: true, default: 0 })
  successfulCount: number;

  @Prop({ required: true, default: 0 })
  failedCount: number;

  @Prop({ required: true, enum: BatchStatus, default: BatchStatus.QUEUED, index: true })
  status: string;

  @Prop({ trim: true })
  merkleRoot?: string;

  @Prop({ index: true, trim: true })
  txHash?: string;

  @Prop()
  blockNumber?: number;

  @Prop({ type: [BatchRowLogSchema], default: [] })
  logs: BatchRowLog[];
}

export const BatchSchema = SchemaFactory.createForClass(Batch);
BatchSchema.index({ issuerId: 1, createdAt: -1 });
BatchSchema.index({ status: 1 });
