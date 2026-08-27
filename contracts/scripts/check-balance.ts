import { ethers } from "ethers";
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
  const rpc = process.env.ARBITRUM_SEPOLIA_RPC || "https://sepolia-rollup.arbitrum.io/rpc";
  const provider = new ethers.JsonRpcProvider(rpc);
  const address = process.env.RELAYER_WALLET_ADDRESS || "0x1Cc31698907837b05e3239787618547d96ca342F";
  
  const balance = await provider.getBalance(address);
  console.log(`Address: ${address}`);
  console.log(`Arbitrum Sepolia Balance: ${ethers.formatEther(balance)} ETH`);
}

main().catch(console.error);
