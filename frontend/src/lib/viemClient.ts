import { createPublicClient, http } from 'viem';
import { arbitrumSepolia } from 'viem/chains';

const RPC_URL =
  process.env.NEXT_PUBLIC_RPC_URL || 'https://sepolia-rollup.arbitrum.io/rpc';

export const publicClient = createPublicClient({
  chain: arbitrumSepolia,
  transport: http(RPC_URL),
});
