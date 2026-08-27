import { Module } from '@nestjs/common';
import { BlockchainService } from './blockchain.service';
import { SolanaService } from './solana.service';

@Module({
  providers: [BlockchainService, SolanaService],
  exports: [BlockchainService, SolanaService],
})
export class BlockchainModule {}
