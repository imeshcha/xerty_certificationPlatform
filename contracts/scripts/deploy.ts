import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("----------------------------------------------------");
  console.log("Deploying Xerty contracts with account:", deployer.address);
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");
  console.log("----------------------------------------------------");

  // 1. Deploy XertyIssuerRegistry
  const IssuerRegistryFactory = await ethers.getContractFactory("XertyIssuerRegistry");
  const issuerRegistry = await IssuerRegistryFactory.deploy(deployer.address);
  await issuerRegistry.waitForDeployment();
  const issuerRegistryAddress = await issuerRegistry.getAddress();
  console.log("✅ XertyIssuerRegistry deployed to:", issuerRegistryAddress);

  // 2. Deploy XertyCertificateSBT
  const CertificateSBTFactory = await ethers.getContractFactory("XertyCertificateSBT");
  const certificateSBT = await CertificateSBTFactory.deploy(
    "Xerty Soulbound Certificate",
    "XERTY",
    deployer.address
  );
  await certificateSBT.waitForDeployment();
  const certificateSBTAddress = await certificateSBT.getAddress();
  console.log("✅ XertyCertificateSBT deployed to:", certificateSBTAddress);

  // 3. Deploy XertyMerkleBatch
  const MerkleBatchFactory = await ethers.getContractFactory("XertyMerkleBatch");
  const merkleBatch = await MerkleBatchFactory.deploy(deployer.address);
  await merkleBatch.waitForDeployment();
  const merkleBatchAddress = await merkleBatch.getAddress();
  console.log("✅ XertyMerkleBatch deployed to:", merkleBatchAddress);

  // Export deployments manifest
  const deploymentManifest = {
    network: "arbitrumSepolia",
    chainId: 421614,
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      XertyIssuerRegistry: issuerRegistryAddress,
      XertyCertificateSBT: certificateSBTAddress,
      XertyMerkleBatch: merkleBatchAddress,
    },
  };

  const outputPath = path.join(__dirname, "../deployments.json");
  fs.writeFileSync(outputPath, JSON.stringify(deploymentManifest, null, 2));
  console.log("📄 Saved deployment manifest to:", outputPath);
  console.log("----------------------------------------------------");
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});
