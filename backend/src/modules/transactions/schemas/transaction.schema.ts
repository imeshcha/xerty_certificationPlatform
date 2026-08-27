import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type TransactionDocument = Transaction & Document;

export enum TransactionType {
  SINGLE_MINT = 'SINGLE_MINT',
  BATCH_MERKLE_ANCHOR = 'BATCH_MERKLE_ANCHOR',
  REVOCATION = 'REVOCATION',
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

@Schema({ timestamps: true, collection: 'transactions' })
export class Transaction {
  @Prop({ required: true, unique: true, index: true, lowercase: true, trim: true })
  txHash: string;

  @Prop({ required: true, enum: TransactionType, index: true })
  txType: string;

  @Prop({ required: true, enum: TransactionStatus, default: TransactionStatus.PENDING, index: true })
  status: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', index: true })
  issuerId?: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Certificate', index: true })
  certificateId?: MongooseSchema.Types.ObjectId;

  @Prop({ default: 'Arbitrum Sepolia' })
  network: string;

  @Prop({ default: 421614 })
  chainId: number;

  @Prop()
  blockNumber?: number;

  @Prop()
  gasUsed?: string;

  @Prop({ trim: true })
  errorMessage?: string;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
TransactionSchema.index({ txHash: 1 }, { unique: true });
TransactionSchema.index({ issuerId: 1, status: 1 });
TransactionSchema.index({ certificateId: 1 });
