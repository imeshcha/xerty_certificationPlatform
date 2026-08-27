import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("====================================================");
  console.log("Deploying XertyCertificate to Arbitrum Sepolia");
  console.log("Deployer address:", deployer.address);
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Deployer balance:", ethers.formatEther(balance), "ETH");
  console.log("====================================================");

  // Deploy XertyCertificate
  const XertyCertificateFactory = await ethers.getContractFactory("XertyCertificate");
  const xertyCertificate = await XertyCertificateFactory.deploy(deployer.address);
  await xertyCertificate.waitForDeployment();
  const contractAddress = await xertyCertificate.getAddress();

  console.log("✅ XertyCertificate deployed successfully to:", contractAddress);

  // Save deployment artifact
  const deploymentInfo = {
    network: "arbitrumSepolia",
    chainId: 421614,
    contractName: "XertyCertificate",
    contractAddress,
    deployerAddress: deployer.address,
    deployedAt: new Date().toISOString(),
    rpcEndpoint: "https://sepolia-rollup.arbitrum.io/rpc",
    explorerUrl: `https://sepolia.arbiscan.io/address/${contractAddress}`,
  };

  const outputPath = path.join(__dirname, "../deployments-certificate.json");
  fs.writeFileSync(outputPath, JSON.stringify(deploymentInfo, null, 2));
  console.log("📄 Saved deployment metadata to:", outputPath);
  console.log("====================================================");
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});
