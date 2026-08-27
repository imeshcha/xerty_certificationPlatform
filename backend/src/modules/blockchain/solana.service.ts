import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';

@Injectable()
export class SolanaService {
  private readonly logger = new Logger(SolanaService.name);
  private connection: Connection;
  private network: string;

  constructor(private configService: ConfigService) {
    this.network = this.configService.get<string>('solana.cluster') || 'devnet';
    const rpcUrl =
      this.configService.get<string>('solana.rpcUrl') ||
      clusterApiUrl('devnet');

    this.connection = new Connection(rpcUrl, 'confirmed');
    this.logger.log(`Initialized Solana Connection on [${this.network}] -> ${rpcUrl}`);
  }

  getConnection(): Connection {
    return this.connection;
  }

  async getLatestSlot(): Promise<number> {
    return this.connection.getSlot();
  }

  async getVersion(): Promise<any> {
    return this.connection.getVersion();
  }

  /**
   * Verifies an on-chain transaction signature on Solana Devnet
   */
  async verifySignature(signature: string): Promise<{
    isValid: boolean;
    slot?: number;
    blockTime?: number;
    err?: any;
    confirmationStatus?: string;
  }> {
    try {
      const status = await this.connection.getSignatureStatus(signature, {
        searchTransactionHistory: true,
      });

      if (!status || !status.value) {
        return {
          isValid: false,
        };
      }

      return {
        isValid: status.value.err === null,
        slot: status.value.slot,
        err: status.value.err,
        confirmationStatus: status.value.confirmationStatus,
      };
    } catch (err: any) {
      this.logger.warn(`Failed to verify Solana signature ${signature}: ${err.message}`);
      return {
        isValid: false,
        err: err.message,
      };
    }
  }

  /**
   * Returns standard Solana Explorer URL
   */
  getExplorerUrl(signature: string): string {
    return `https://explorer.solana.com/tx/${signature}?cluster=${this.network}`;
  }

  /**
   * Returns Solana Account Explorer URL
   */
  getAccountExplorerUrl(pubkey: string): string {
    return `https://explorer.solana.com/address/${pubkey}?cluster=${this.network}`;
  }
}
