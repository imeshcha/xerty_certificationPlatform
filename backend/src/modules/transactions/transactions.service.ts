import { Injectable } from '@nestjs/common';
import { BlockchainService } from '../blockchain/blockchain.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionStatus } from './schemas/transaction.schema';

@Injectable()
export class TransactionsService {
  constructor(private blockchainService: BlockchainService) {}

  async findByHash(txHash: string): Promise<any> {
    try {
      const provider = this.blockchainService.getProvider();
      const tx = await provider.getTransaction(txHash);
      const receipt = await provider.getTransactionReceipt(txHash);

      return {
        txHash,
        blockNumber: receipt?.blockNumber || tx?.blockNumber,
        status: receipt?.status === 1 ? TransactionStatus.SUCCESS : TransactionStatus.PENDING,
        network: 'Arbitrum Sepolia',
        chainId: 421614,
        explorerUrl: `https://sepolia.arbiscan.io/tx/${txHash}`,
      };
    } catch {
      return {
        txHash,
        status: TransactionStatus.SUCCESS,
        network: 'Arbitrum Sepolia',
        explorerUrl: `https://sepolia.arbiscan.io/tx/${txHash}`,
      };
    }
  }

  async findByIssuer(issuerId: string): Promise<any[]> {
    return [];
  }

  async create(dto: CreateTransactionDto): Promise<any> {
    return {
      txHash: dto.txHash,
      status: TransactionStatus.SUCCESS,
      network: 'Arbitrum Sepolia',
    };
  }

  async updateStatus(
    txHash: string,
    status: TransactionStatus,
    blockNumber?: number,
    gasUsed?: string,
  ): Promise<any> {
    return { txHash, status, blockNumber, gasUsed };
  }
}
