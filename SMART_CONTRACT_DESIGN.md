# Smart Contract Design & Blockchain Specification: Xerty

## 1. Blockchain Architecture Overview

Xerty deploys on the **Arbitrum Sepolia Testnet** (Ethereum Layer 2). The smart contract architecture combines **EIP-5192 Soulbound Token (SBT)** standards with **Merkle Tree Root Batching** to guarantee non-transferability, instant cryptographic verification, and scalable bulk issuance with minimal gas footprint.

```
+---------------------------------------------------------------------------------------+
|                                ARBITRUM SEPOLIA (L2)                                  |
+---------------------------------------------------------------------------------------+
|                                                                                       |
|   +--------------------------+               +------------------------------------+   |
|   |   XertyIssuerRegistry    | <-----------> |       XertyCertificateSBT          |   |
|   |  (Institutional Identity)|               |   (ERC-721 + ERC-5192 Soulbound)   |   |
|   +--------------------------+               +------------------------------------+   |
|                                                                 ^                     |
|                                                                 |                     |
|                                              +------------------------------------+   |
|                                              |         XertyMerkleBatch           |   |
|                                              |   (O(1) Gas Root Batch Issuer)     |   |
|                                              +------------------------------------+   |
+---------------------------------------------------------------------------------------+
```

---

## 2. Core Smart Contracts

### 2.1 `XertyIssuerRegistry.sol`
Maintains verified educational institutions, university wallet addresses, authorized signers, and metadata URLs.

#### Key Functions & Signatures:
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IXertyIssuerRegistry {
    enum IssuerStatus { Inactive, Active, Suspended }

    struct Issuer {
        string name;
        string legalEntityIdentifier; // D-U-N-S or institutional registration
        string metadataURI;          // IPFS CID of institutional profile
        address adminWallet;         // Primary governance wallet
        IssuerStatus status;
        uint256 registeredAt;
    }

    event IssuerRegistered(address indexed issuerAddress, string name, string metadataURI);
    event IssuerStatusUpdated(address indexed issuerAddress, IssuerStatus newStatus);
    event IssuerSignerUpdated(address indexed issuerAddress, address indexed signer, bool authorized);

    function registerIssuer(address issuerAddress, string calldata name, string calldata legalId, string calldata metadataURI) external;
    function setIssuerStatus(address issuerAddress, IssuerStatus status) external;
    function setAuthorizedSigner(address signer, bool authorized) external;
    function isAuthorizedIssuer(address issuerAddress) external view returns (bool);
    function isAuthorizedSigner(address issuerAddress, address signer) external view returns (bool);
    function getIssuer(address issuerAddress) external view returns (Issuer memory);
}
```

---

### 2.2 `XertyCertificateSBT.sol`
Implements non-transferable Soulbound Credentials conforming to **ERC-721** and **ERC-5192 (Minimal Soulbound NFTs)**.

#### Core Structural Design:
- **EIP-5192 Compliance**: Emits `Locked(tokenId)` on mint. `locked(uint256 tokenId)` returns `true` unconditionally.
- **Transfer Lock**: All calls to `transferFrom`, `safeTransferFrom`, or `approve` revert with `CustomError: ErrSoulboundTokenLocked()`.
- **Tamper-Evident Hash Check**: Stores `bytes32 certHash` (Keccak-256 hash of certificate payload + IPFS URI) on-chain.
- **Revocation Protocol**: Authorized issuers can mark a token ID as revoked with a cryptographic reason code.

#### Key Interface & Implementation Signatures:
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/// @notice ERC-5192 Minimal Soulbound Interface
interface IERC5192 {
    event Locked(uint256 tokenId);
    event Unlocked(uint256 tokenId);
    function locked(uint256 tokenId) external view returns (bool);
}

interface IXertyCertificateSBT is IERC721, IERC5192 {
    struct CertificateRecord {
        address issuer;
        address recipient;
        bytes32 certificateHash; // Keccak-256 hash of certificate attributes
        uint256 issueDate;
        uint256 expiryDate;      // 0 if non-expiring
        bool isRevoked;
        string revocationReason;
        string tokenURI;         // ipfs://Qm...
    }

    event CertificateIssued(
        uint256 indexed tokenId,
        address indexed issuer,
        address indexed recipient,
        bytes32 certificateHash,
        string tokenURI
    );

    event CertificateRevoked(
        uint256 indexed tokenId,
        address indexed issuer,
        string reason,
        uint256 timestamp
    );

    error ErrSoulboundTokenLocked();
    error ErrUnauthorizedIssuer();
    error ErrCertificateRevoked();
    error ErrCertificateExpired();
    error ErrInvalidHash();

    function issueCertificate(
        address to,
        string calldata tokenURI,
        bytes32 certHash,
        uint256 expiryDate
    ) external returns (uint256 tokenId);

    function batchIssueCertificates(
        address[] calldata recipients,
        string[] calldata tokenURIs,
        bytes32[] calldata certHashes,
        uint256[] calldata expiryDates
    ) external returns (uint256[] memory tokenIds);

    function revokeCertificate(uint256 tokenId, string calldata reason) external;

    function verifyCertificate(
        uint256 tokenId
    ) external view returns (
        bool isValid,
        address issuer,
        address recipient,
        bytes32 certificateHash,
        string memory tokenURI,
        bool isRevoked
    );

    function getCertificateRecord(uint256 tokenId) external view returns (CertificateRecord memory);
}
```

---

### 2.3 `XertyMerkleBatch.sol`
Provides hyper-optimized $O(1)$ gas batch issuance for large cohorts (e.g. 500–5,000 students at once). Instead of executing hundreds of individual mints, the issuer anchors a 32-byte **Merkle Root** on-chain in a single transaction. Verification is performed trustlessly via Merkle inclusion proofs.

#### Solidity Specification:
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract XertyMerkleBatch {
    struct BatchRecord {
        address issuer;
        bytes32 merkleRoot;
        uint256 totalCertificates;
        string batchMetadataURI; // IPFS CID to batch manifest
        uint256 anchoredAt;
        bool isRevoked;
    }

    // Mapping: batchId => BatchRecord
    mapping(bytes32 => BatchRecord) public batches;
    
    // Mapping: batchId => leafHash => isRevoked
    mapping(bytes32 => mapping(bytes32 => bool)) public revokedLeaves;

    event BatchAnchored(
        bytes32 indexed batchId,
        address indexed issuer,
        bytes32 merkleRoot,
        uint256 totalCertificates,
        string batchMetadataURI
    );

    event CertificateInBatchRevoked(bytes32 indexed batchId, bytes32 indexed leafHash, string reason);

    function anchorBatch(
        bytes32 batchId,
        bytes32 merkleRoot,
        uint256 totalCertificates,
        string calldata batchMetadataURI
    ) external {
        require(batches[batchId].anchoredAt == 0, "Batch already exists");
        batches[batchId] = BatchRecord({
            issuer: msg.sender,
            merkleRoot: merkleRoot,
            totalCertificates: totalCertificates,
            batchMetadataURI: batchMetadataURI,
            anchoredAt: block.timestamp,
            isRevoked: false
        });
        emit BatchAnchored(batchId, msg.sender, merkleRoot, totalCertificates, batchMetadataURI);
    }

    function verifyCertificateProof(
        bytes32 batchId,
        bytes32[] calldata proof,
        bytes32 leaf
    ) external view returns (bool isValid, address issuer, uint256 anchoredAt) {
        BatchRecord memory b = batches[batchId];
        require(b.anchoredAt != 0, "Batch not found");
        require(!b.isRevoked, "Batch revoked");
        require(!revokedLeaves[batchId][leaf], "Individual certificate revoked");
        
        bool verified = MerkleProof.verify(proof, b.merkleRoot, leaf);
        return (verified, b.issuer, b.anchoredAt);
    }
}
```

---

## 3. Gas Optimization & Efficiency Strategy

| Optimization Technique | Implementation Detail | Gas Impact |
| :--- | :--- | :--- |
| **Soulbound Lock Optimization** | Unconditionally override `_update()` in OpenZeppelin ERC-721 v5.0 to bypass storage reads for approval checks. | ~40% cheaper mints |
| **Packed Structs** | Packing timestamp fields (`uint48` for dates) and `address` types into contiguous 256-bit memory slots. | Reduces storage slots per certificate |
| **Calldata Arrays** | Passing batch arrays as `calldata` rather than `memory` to prevent unnecessary allocations. | Saves ~3,000 gas per batch item |
| **Merkle Tree Anchoring** | Replacing $N$ storage writes with 1 `bytes32` write for cohorts $> 50$ students. | Anchors 1,000 certificates for < $0.01 in test gas |
| **Immutable Strings Avoidance** | Storing IPFS base CIDs or hash substrings rather than full 100-character HTTP strings on-chain. | ~50,000 gas savings per token |

---

## 4. Blockchain Deployment & Verification Target

| Parameter | Configuration |
| :--- | :--- |
| **Network Name** | **Arbitrum Sepolia Testnet** |
| **Chain ID** | `421614` (`0x66EEE`) |
| **Currency Symbol** | `ETH` (Arbitrum Sepolia Testnet ETH) |
| **Official RPC URL** | `https://sepolia-rollup.arbitrum.io/rpc` |
| **Dedicated RPC** | Alchemy / QuickNode (`https://arb-sepolia.g.alchemy.com/v2/${API_KEY}`) |
| **Block Explorer** | [Arbitrum Sepolia Arbiscan](https://sepolia.arbiscan.io/) |
| **Contract Verification** | Hardhat / Foundry verify plugin with Arbiscan API Key (Free) |

---

## 5. Security & Access Control Matrix

```mermaid
graph TD
    Deployer[Platform Admin] -->|DEFAULT_ADMIN_ROLE| CertContract[XertyCertificateSBT]
    Deployer -->|DEFAULT_ADMIN_ROLE| Registry[XertyIssuerRegistry]
    
    Registry -->|Grants ISSUER_ROLE| VerifiedIssuer[University / Academy Wallet]
    
    VerifiedIssuer -->|Calls issueCertificate / batchIssue| CertContract
    VerifiedIssuer -->|Calls anchorBatch| MerkleBatch[XertyMerkleBatch]
    VerifiedIssuer -->|Calls revokeCertificate| CertContract
    
    Student[Student Wallet] -.->|Receives SBT (Cannot Transfer)| CertContract
    Verifier[Public / Employer] -.->|Queries verifyCertificate (Read-only)| CertContract
```
