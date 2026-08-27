'use client';

import { publicClient } from '../lib/viemClient';

const CERTIFICATE_CONTRACT_ADDRESS = (process.env
  .NEXT_PUBLIC_CERTIFICATE_SBT_ADDRESS || '0x0000000000000000000000000000000000000000') as `0x${string}`;

export function useContract() {
  async function getBlockNumber() {
    return publicClient.getBlockNumber();
  }

  return {
    publicClient,
    certificateContractAddress: CERTIFICATE_CONTRACT_ADDRESS,
    getBlockNumber,
  };
}
