# 🚀 Xerty: $0 Production Cloud Deployment Guide

This guide details the step-by-step procedure to deploy the entire **Xerty Decentralized Certificate Issuance Platform** to production at **$0.00 / month** using free-tier cloud and blockchain infrastructure.

---

## 1. Free-Tier Architecture & Zero-Cost Breakdown

| Component | Cloud Provider | Free Tier Allocation | Estimated Monthly Cost |
| :--- | :--- | :--- | :--- |
| **Frontend** | **Vercel** | Unlimited serverless deployments, Global CDN, SSL | **$0.00** |
| **Backend API** | **Render** | Free Web Service (512MB RAM, Auto HTTPS) | **$0.00** |
| **Database** | **MongoDB Atlas** | M0 Free Tier (512MB Storage, Replica Set) | **$0.00** |
| **Blockchain** | **Arbitrum Sepolia** | Layer 2 Ethereum Testnet (Free Testnet ETH) | **$0.00** |
| **Storage** | **Pinata IPFS** | Free Tier (1GB Storage, Multi-Gateway) | **$0.00** |
| **Auth & MPC** | **Privy** | Developer Free Tier (1,000 MAUs) | **$0.00** |
| **Total Monthly Cost** | | | **$0.00** |

---

## 2. Step-by-Step Deployment Instructions

### Step 1: MongoDB Atlas Database Setup (Free Tier)
1. Create a free account at [cloud.mongodb.com](https://cloud.mongodb.com).
2. Create a new project named `Xerty`.
3. Create an **M0 (Shared)** free cluster (choose AWS or GCP in your preferred region).
4. Under **Security $\rightarrow$ Database Access**:
   - Create a database user (e.g., `xerty_admin`) with a secure password.
5. Under **Security $\rightarrow$ Network Access**:
   - Add IP Address `0.0.0.0/0` (Allow access from anywhere, required for Render/Vercel serverless egress).
6. Under **Database $\rightarrow$ Connect**:
   - Choose **Drivers (Node.js)** and copy your connection string:
     ```
     mongodb+srv://xerty_admin:<password>@cluster0.xxxx.mongodb.net/xerty?retryWrites=true&w=majority
     ```

---

### Step 2: Pinata IPFS Decentralized Storage Setup (Free Tier)
1. Sign up for a free account at [app.pinata.cloud](https://app.pinata.cloud).
2. Navigate to **API Keys $\rightarrow$ New Key**:
   - Enable `pinJSONToIPFS`, `pinFileToIPFS`, and `pinByHash`.
   - Copy your **API Key**, **API Secret**, and **JWT Token**.
3. Under **Gateways**, copy your free dedicated gateway URL (e.g., `https://gateway.pinata.cloud/ipfs`).

---

### Step 3: Privy Authentication & MPC Wallet Setup (Free Tier)
1. Sign up at [dashboard.privy.io](https://dashboard.privy.io).
2. Create a new application named `Xerty`.
3. Under **Settings $\rightarrow$ Basics**:
   - Copy your **App ID** and **App Secret**.
4. Under **Login Methods**:
   - Enable **Google**, **Apple**, **Telegram**, **LinkedIn**, and **Web3 Wallets**.
5. Under **Embedded Wallets**:
   - Set **Create embedded wallets for users** $\rightarrow$ `all-users`.
   - Set **Default Chain** $\rightarrow$ `Arbitrum Sepolia (421614)`.

---

### Step 4: Smart Contract Deployment on Arbitrum Sepolia
1. Ensure your deployer wallet has free Arbitrum Sepolia testnet ETH from faucets:
   - [Chainlink Arbitrum Sepolia Faucet](https://faucets.chain.link/arbitrum-sepolia)
   - [LearnWeb3 Faucet](https://learnweb3.io/faucets/arbitrum_sepolia)
2. In your terminal, deploy the `XertyCertificate` smart contract:
   ```bash
   cd contracts
   npm install
   npx hardhat run scripts/deploy-certificate.ts --network arbitrumSepolia
   ```
3. Copy the deployed contract address (recorded in `deployments-certificate.json`).
4. (Optional) Verify contract source code on Arbiscan:
   ```bash
   npx hardhat verify --network arbitrumSepolia <DEPLOYED_CONTRACT_ADDRESS> <ADMIN_WALLET_ADDRESS>
   ```

---

### Step 5: Backend API Deployment on Render (Free Web Service)
1. Sign up at [render.com](https://render.com).
2. Click **New $\rightarrow$ Web Service** and connect your GitHub repository.
3. Configure settings:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start:prod`
   - **Instance Type**: `Free`
4. Add the following **Environment Variables**:
   - `NODE_ENV`: `production`
   - `PORT`: `10000`
   - `MONGODB_URI`: `<Your MongoDB Atlas Connection String>`
   - `PRIVY_APP_ID`: `<Your Privy App ID>`
   - `PRIVY_APP_SECRET`: `<Your Privy App Secret>`
   - `PINATA_JWT`: `<Your Pinata JWT>`
   - `PINATA_GATEWAY_URL`: `https://gateway.pinata.cloud/ipfs`
   - `BLOCKCHAIN_RPC_URL`: `https://sepolia-rollup.arbitrum.io/rpc`
   - `BLOCKCHAIN_CHAIN_ID`: `421614`
   - `BLOCKCHAIN_CONTRACT_ADDRESS`: `<Your Deployed Contract Address>`
   - `CORS_ORIGIN`: `https://xerty.vercel.app`
5. Click **Create Web Service**. Once deployed, copy your backend URL (e.g., `https://xerty-backend.onrender.com`).

---

### Step 6: Frontend Deployment on Vercel
1. Sign up at [vercel.com](https://vercel.com).
2. Click **Add New $\rightarrow$ Project** and import your repository.
3. Configure project settings:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: `frontend`
4. Add the following **Environment Variables**:
   - `NEXT_PUBLIC_API_URL`: `https://xerty-backend.onrender.com/api/v1`
   - `NEXT_PUBLIC_PRIVY_APP_ID`: `<Your Privy App ID>`
   - `NEXT_PUBLIC_DEFAULT_CHAIN_ID`: `421614`
   - `NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC`: `https://sepolia-rollup.arbitrum.io/rpc`
   - `NEXT_PUBLIC_CERTIFICATE_CONTRACT_ADDRESS`: `<Your Deployed Contract Address>`
   - `NEXT_PUBLIC_IPFS_GATEWAY`: `https://gateway.pinata.cloud/ipfs`
   - `NEXT_PUBLIC_APP_URL`: `https://xerty.vercel.app`
5. Click **Deploy**. Vercel will build and assign your production URL.

---

## 3. End-to-End User Flow & Verification Checklist

To verify complete end-to-end functionality in production, perform this live walk-through:

```
Step 1: User Login
  └─ User logs in with Google / Apple / Telegram / LinkedIn or Web3 Wallet at `/`.

Step 2: Embedded MPC Wallet Creation
  └─ Privy automatically creates a non-custodial EVM wallet on Arbitrum Sepolia.

Step 3: Issuer Program Onboarding
  └─ Navigate to `/issuer/courses/new` and create a course (e.g., "ARB-401").

Step 4: Certificate Template Selection
  └─ Navigate to `/issuer/templates` and select or upload a custom background.

Step 5: Certificate Issuance
  └─ Navigate to `/issuer/issue/single` (or `/issuer/issue/bulk` with CSV).
  └─ Click "Issue & Mint Certificate".

Step 6: Decentralized IPFS Storage
  └─ Metadata JSON and certificate media are pinned to Pinata IPFS.

Step 7: Blockchain Anchoring
  └─ Keccak-256 hash is immutably anchored to Arbitrum Sepolia smart contract.

Step 8: Student Portfolio Delivery
  └─ Student receives credential in portfolio; 1-click "Add to LinkedIn" active.

Step 9: Public Trustless Verification
  └─ Navigate to `/verify/<CERTIFICATE_ID>` with zero login.
  └─ Confirm "VALID" trust badge, Arbiscan transaction proof, and IPFS viewer.
```

---

## 4. Production Health Check Endpoints

- **Backend API Docs (Swagger)**: `https://xerty-backend.onrender.com/api/docs`
- **Public Verification Endpoint**: `https://xerty-backend.onrender.com/api/v1/verify/XERTY-2026-A49F1B`
- **Frontend Web App**: `https://xerty.vercel.app`
- **Arbitrum Sepolia Block Explorer**: `https://sepolia.arbiscan.io/address/<CONTRACT_ADDRESS>`
