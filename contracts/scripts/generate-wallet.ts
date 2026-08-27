import { ethers } from "ethers";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const wallet = ethers.Wallet.createRandom();
  console.log("=================================================");
  console.log("  🚀 NEW XERTY PLATFORM RELAYER WALLET GENERATED");
  console.log("=================================================");
  console.log("Public Address :", wallet.address);
  console.log("Private Key    :", wallet.privateKey);
  console.log("=================================================");

  // Write to contracts/.env if not present
  const contractsEnvPath = path.join(__dirname, "../.env");
  const backendEnvPath = path.join(__dirname, "../../backend/.env");

  const envContent = `ARBITRUM_SEPOLIA_RPC=https://sepolia-rollup.arbitrum.io/rpc\nDEPLOYER_PRIVATE_KEY=${wallet.privateKey}\nRELAYER_PRIVATE_KEY=${wallet.privateKey}\nRELAYER_WALLET_ADDRESS=${wallet.address}\n`;

  fs.writeFileSync(contractsEnvPath, envContent, { flag: "w" });
  console.log("✅ Written to contracts/.env");

  // Also append / update in backend/.env
  let currentBackendEnv = "";
  if (fs.existsSync(backendEnvPath)) {
    currentBackendEnv = fs.readFileSync(backendEnvPath, "utf-8");
  }
  
  if (!currentBackendEnv.includes("RELAYER_PRIVATE_KEY")) {
    fs.appendFileSync(backendEnvPath, `\n# Arbitrum Sepolia Relayer\nARBITRUM_SEPOLIA_RPC=https://sepolia-rollup.arbitrum.io/rpc\nRELAYER_PRIVATE_KEY=${wallet.privateKey}\nRELAYER_WALLET_ADDRESS=${wallet.address}\n`);
    console.log("✅ Appended to backend/.env");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
