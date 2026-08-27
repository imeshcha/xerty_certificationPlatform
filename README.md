# Xerty - Decentralized Credential Platform on Arbitrum Layer 2

Xerty is an institution-grade decentralized credential protocol on **Arbitrum Sepolia** enabling universities, academies, and organizations to issue non-transferable Soulbound Certificates with frictionless MPC social logins, Pinata IPFS metadata pinning, and zero-login public verification.

---

## 🏗️ Architecture Summary

```
User
 │
 ├── Landing Page (/) ──► Clean Hero & Role Action Cards (Issuers / Students / Verifiers)
 │
 ├── Issuer Studio (/issuer) ──► Profile Settings, Course Catalog, Template Selector, Single/Bulk Minting
 │
 ├── Student Vault (/student) ──► Profile Settings, Soulbound Credential Portfolio, 1-Click LinkedIn Share
 │
 └── Public Verifier (/verify) ──► Zero-Login Trustless Cryptographic Verification
```

---

## 🚀 Running Locally

```bash
# 1. Start NestJS Backend API (Port 4000)
npm run dev:backend

# 2. Start Next.js Frontend App (Port 3000)
npm run dev:frontend

# 3. Run Smart Contract Tests
npm run test:contracts
```

---

## 🗄️ Lightweight 3-Collection MongoDB Atlas Database

1. **`users`**: Account authentication, Privy DID, embedded Arbitrum MPC wallet address, and embedded `issuerProfile` / `studentProfile`.
2. **`courses`**: Certification track metadata, duration hours, skills taxonomy, and external curriculum links.
3. **`certificates`**: Issued credentials, Keccak-256 hash, IPFS CID, and Arbitrum on-chain transaction hash.
