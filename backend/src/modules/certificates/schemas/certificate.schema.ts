import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type CertificateDocument = Certificate & Document;

export enum CertificateStatus {
  ISSUED = 'ISSUED',
  REVOKED = 'REVOKED',
}

export enum BlockchainNetwork {
  ARBITRUM_SEPOLIA = 'ARBITRUM_SEPOLIA',
  SOLANA_DEVNET = 'SOLANA_DEVNET',
}

@Schema({ timestamps: true, collection: 'certificates' })
export class Certificate {
  @Prop({ required: true, unique: true, index: true, trim: true })
  certificateId: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, index: true })
  issuerId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: false, index: true })
  studentId?: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Course', required: true, index: true })
  courseId: MongooseSchema.Types.ObjectId;

  @Prop({ required: false })
  templateId?: string;

  @Prop({
    required: true,
    enum: BlockchainNetwork,
    default: BlockchainNetwork.ARBITRUM_SEPOLIA,
    index: true,
  })
  network: string;

  @Prop({ required: true, unique: true, index: true, lowercase: true, trim: true })
  certificateHash: string;

  @Prop({ required: true, trim: true })
  ipfsCID: string;

  @Prop({ trim: true })
  imageIpfsCid?: string;

  @Prop({ index: true, trim: true })
  transactionHash?: string;

  @Prop({ index: true, trim: true })
  solanaSignature?: string;

  @Prop({ index: true, trim: true })
  solanaMintAddress?: string;

  @Prop({
    required: true,
    enum: CertificateStatus,
    default: CertificateStatus.ISSUED,
    index: true,
  })
  status: string;

  @Prop({ required: true, default: Date.now, index: true })
  issueDate: Date;

  @Prop({ required: true, index: true, trim: true })
  studentWallet: string;

  @Prop({ required: true, lowercase: true, index: true, trim: true })
  studentEmail: string;

  @Prop({ required: true, trim: true })
  studentName: string;

  @Prop({ trim: true })
  grade?: string;

  @Prop()
  score?: number;

  @Prop({ type: Object, default: {} })
  variablesMap?: Record<string, any>;

  @Prop({ type: Object, default: {} })
  metadataJson?: Record<string, any>;

  @Prop({ default: false, index: true })
  isClaimed: boolean;

  @Prop()
  claimedAt?: Date;

  @Prop({ trim: true })
  claimedByWallet?: string;

  @Prop()
  revokedAt?: Date;

  @Prop({ trim: true })
  revocationReason?: string;
}

export const CertificateSchema = SchemaFactory.createForClass(Certificate);

CertificateSchema.index({ certificateId: 1 }, { unique: true });
CertificateSchema.index({ certificateHash: 1 }, { unique: true });
CertificateSchema.index({ issuerId: 1, status: 1 });
CertificateSchema.index({ studentWallet: 1 });
CertificateSchema.index({ studentEmail: 1 });
CertificateSchema.index({ transactionHash: 1 });
CertificateSchema.index({ solanaSignature: 1 });
CertificateSchema.index({ network: 1 });
