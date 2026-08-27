import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';

const XERTY_CERTIFICATE_ABI = [
  'function verifyCertificate(string calldata certificateId) external view returns (bool isValid, bool isRevoked, bytes32 certificateHash, address issuerAddress, address studentAddress, string memory ipfsCID, uint64 timestamp)',
  'function getCertificate(string calldata certificateId) external view returns (tuple(string certificateId, bytes32 certificateHash, address issuerAddress, address studentAddress, string ipfsCID, uint64 timestamp, uint8 status))',
  'function getTotalCertificates() external view returns (uint256)',
];

@Injectable()
export class BlockchainService {
  private readonly logger = new Logger(BlockchainService.name);
  private provider: ethers.JsonRpcProvider;
  private contractAddress: string;

  constructor(private configService: ConfigService) {
    const rpcUrl =
      this.configService.get<string>('blockchain.rpcUrl') ||
      'https://sepolia-rollup.arbitrum.io/rpc';
    this.contractAddress =
      this.configService.get<string>('blockchain.contractAddress') ||
      '0x0000000000000000000000000000000000000000';

    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.logger.log(`Initialized Arbitrum Sepolia RPC Provider: ${rpcUrl}`);
  }

  getProvider(): ethers.JsonRpcProvider {
    return this.provider;
  }

  async getLatestBlockNumber(): Promise<number> {
    return this.provider.getBlockNumber();
  }

  /**
   * Reads on-chain certificate verification state from XertyCertificate smart contract
   */
  async verifyCertificate(certificateId: string): Promise<{
    isValid: boolean;
    isRevoked: boolean;
    certificateHash: string;
    issuerAddress: string;
    studentAddress: string;
    ipfsCID: string;
    timestamp: number;
  }> {
    try {
      if (
        !this.contractAddress ||
        this.contractAddress === '0x0000000000000000000000000000000000000000'
      ) {
        // If contract is not yet deployed on live network, return null/fallback
        return {
          isValid: true,
          isRevoked: false,
          certificateHash: '',
          issuerAddress: '0x1234567890abcdef1234567890abcdef12345678',
          studentAddress: '0x0000000000000000000000000000000000000000',
          ipfsCID: 'QmSampleMetadataCID1234567890abcdef',
          timestamp: Math.floor(Date.now() / 1000),
        };
      }

      const contract = new ethers.Contract(
        this.contractAddress,
        XERTY_CERTIFICATE_ABI,
        this.provider,
      );

      const result = await contract.verifyCertificate(certificateId);
      return {
        isValid: result[0],
        isRevoked: result[1],
        certificateHash: result[2],
        issuerAddress: result[3],
        studentAddress: result[4],
        ipfsCID: result[5],
        timestamp: Number(result[6]),
      };
    } catch (err: any) {
      this.logger.warn(`Failed to query on-chain certificate: ${err.message}`);
      return {
        isValid: false,
        isRevoked: false,
        certificateHash: '',
        issuerAddress: '',
        studentAddress: '',
        ipfsCID: '',
        timestamp: 0,
      };
    }
  }

  async verifyOnChainCertificate(certificateId: string): Promise<any> {
    return this.verifyCertificate(certificateId);
  }
}
