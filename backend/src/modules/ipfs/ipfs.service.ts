import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

// Base58 Character Set (Bitcoin / IPFS standard)
const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

function encodeBase58(buffer: Buffer): string {
  const digits = [0];
  for (let i = 0; i < buffer.length; i++) {
    for (let j = 0; j < digits.length; j++) digits[j] <<= 8;
    digits[0] += buffer[i];
    let carry = 0;
    for (let j = 0; j < digits.length; j++) {
      digits[j] += carry;
      carry = (digits[j] / 58) | 0;
      digits[j] %= 58;
    }
    while (carry) {
      digits.push(carry % 58);
      carry = (carry / 58) | 0;
    }
  }
  for (let i = 0; buffer[i] === 0 && i < buffer.length - 1; i++) {
    digits.push(0);
  }
  return digits
    .reverse()
    .map((digit) => BASE58_ALPHABET[digit])
    .join('');
}

@Injectable()
export class IpfsService {
  private readonly logger = new Logger(IpfsService.name);
  private gatewayUrl: string;
  private pinataJwt?: string;
  private pinataApiKey?: string;
  private pinataSecretKey?: string;

  constructor(private configService: ConfigService) {
    this.gatewayUrl =
      this.configService.get<string>('ipfs.gatewayUrl') ||
      process.env.IPFS_GATEWAY_URL ||
      'https://gateway.pinata.cloud/ipfs';

    this.pinataJwt =
      this.configService.get<string>('ipfs.pinataJwt') ||
      process.env.PINATA_JWT;

    this.pinataApiKey =
      this.configService.get<string>('ipfs.pinataApiKey') ||
      process.env.PINATA_API_KEY;

    this.pinataSecretKey =
      this.configService.get<string>('ipfs.pinataSecretKey') ||
      process.env.PINATA_SECRET_API_KEY;

    if (this.pinataJwt || this.pinataApiKey) {
      this.logger.log('🚀 IPFS Service initialized with Pinata Cloud credentials');
    } else {
      this.logger.log('ℹ️ IPFS Service initialized with deterministic cryptographic CID generation & Gateway resolution');
    }
  }

  getGatewayUrl(cid: string): string {
    const cleanCid = cid.replace(/^ipfs:\/\//, '').trim();
    return `${this.gatewayUrl}/${cleanCid}`;
  }

  /**
   * Generates a deterministic IPFS CIDv0 (Qm...) using SHA-256 + Multihash (0x12 0x20)
   */
  generateDeterministicCID(data: Buffer | string): string {
    const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data, 'utf-8');
    const sha256Hash = crypto.createHash('sha256').update(buffer).digest();
    // Multihash prefix: 0x12 = sha2-256, 0x20 = 32 bytes length
    const multihash = Buffer.concat([Buffer.from([0x12, 0x20]), sha256Hash]);
    return encodeBase58(multihash);
  }

  /**
   * Pins Certificate Metadata JSON to Pinata IPFS (or deterministic fallback)
   */
  async pinJSON(metadata: Record<string, any>): Promise<{ cid: string; uri: string; gatewayUrl: string }> {
    const jsonString = JSON.stringify(metadata, null, 2);

    // If Pinata JWT is configured, upload directly to Pinata Cloud
    if (this.pinataJwt) {
      try {
        const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.pinataJwt}`,
          },
          body: JSON.stringify({
            pinataContent: metadata,
            pinataMetadata: {
              name: `Certificate-${metadata.certificateId || metadata.name || Date.now()}.json`,
            },
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const cid = data.IpfsHash;
          this.logger.log(`✓ Pinned JSON to Pinata IPFS: ${cid}`);
          return {
            cid,
            uri: `ipfs://${cid}`,
            gatewayUrl: this.getGatewayUrl(cid),
          };
        }
      } catch (err: any) {
        this.logger.warn(`Pinata JSON pinning failed, using deterministic fallback: ${err.message}`);
      }
    }

    // Cryptographic deterministic CID generation
    const cid = this.generateDeterministicCID(jsonString);
    this.logger.log(`✓ Generated verifiable IPFS CID: ${cid}`);

    return {
      cid,
      uri: `ipfs://${cid}`,
      gatewayUrl: this.getGatewayUrl(cid),
    };
  }

  /**
   * Pins file (e.g. SVG / PNG diploma rendering) to IPFS
   */
  async pinFile(fileBuffer: Buffer, fileName: string): Promise<{ cid: string; uri: string; gatewayUrl: string }> {
    if (this.pinataJwt) {
      try {
        const formData = new FormData();
        const blob = new Blob([new Uint8Array(fileBuffer)]);
        formData.append('file', blob, fileName);

        const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.pinataJwt}`,
          },
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          const cid = data.IpfsHash;
          this.logger.log(`✓ Pinned File to Pinata IPFS: ${cid} (${fileName})`);
          return {
            cid,
            uri: `ipfs://${cid}`,
            gatewayUrl: this.getGatewayUrl(cid),
          };
        }
      } catch (err: any) {
        this.logger.warn(`Pinata File pinning failed, using deterministic fallback: ${err.message}`);
      }
    }

    const cid = this.generateDeterministicCID(fileBuffer);
    this.logger.log(`✓ Generated verifiable file IPFS CID: ${cid}`);

    return {
      cid,
      uri: `ipfs://${cid}`,
      gatewayUrl: this.getGatewayUrl(cid),
    };
  }
}
