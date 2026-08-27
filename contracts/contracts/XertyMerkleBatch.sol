// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

/**
 * @title XertyMerkleBatch
 * @dev Anchors Merkle roots for high-throughput, low-cost cohort certificate issuance.
 */
contract XertyMerkleBatch is AccessControl {
    bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");

    struct BatchAnchor {
        bytes32 merkleRoot;
        string ipfsBatchManifestCID;
        address issuer;
        uint32 totalCertificates;
        uint64 timestamp;
    }

    // batchId => BatchAnchor
    mapping(bytes32 => BatchAnchor) private _batches;
    // leafHash => isRevoked
    mapping(bytes32 => bool) private _revokedLeaves;

    event BatchAnchored(
        bytes32 indexed batchId,
        bytes32 indexed merkleRoot,
        address indexed issuer,
        uint32 totalCertificates,
        string ipfsBatchManifestCID
    );

    event LeafCertificateRevoked(bytes32 indexed batchId, bytes32 indexed leafHash, string reason);

    constructor(address adminAddress) {
        _grantRole(DEFAULT_ADMIN_ROLE, adminAddress);
        _grantRole(ISSUER_ROLE, adminAddress);
    }

    function anchorBatch(
        bytes32 batchId,
        bytes32 merkleRoot,
        uint32 totalCertificates,
        string calldata ipfsBatchManifestCID
    ) external onlyRole(ISSUER_ROLE) {
        require(_batches[batchId].timestamp == 0, "Batch ID already exists");
        require(merkleRoot != bytes32(0), "Invalid Merkle root");
        require(totalCertificates > 0, "Empty batch count");

        _batches[batchId] = BatchAnchor({
            merkleRoot: merkleRoot,
            ipfsBatchManifestCID: ipfsBatchManifestCID,
            issuer: msg.sender,
            totalCertificates: totalCertificates,
            timestamp: uint64(block.timestamp)
        });

        emit BatchAnchored(batchId, merkleRoot, msg.sender, totalCertificates, ipfsBatchManifestCID);
    }

    function verifyCertificateProof(
        bytes32 batchId,
        bytes32 leafHash,
        bytes32[] calldata proof
    ) external view returns (bool isValid, bool isRevoked) {
        BatchAnchor memory batch = _batches[batchId];
        require(batch.timestamp != 0, "Batch not found");

        isValid = MerkleProof.verify(proof, batch.merkleRoot, leafHash);
        isRevoked = _revokedLeaves[leafHash];
        return (isValid, isRevoked);
    }

    function revokeCertificateLeaf(
        bytes32 batchId,
        bytes32 leafHash,
        string calldata reason
    ) external onlyRole(ISSUER_ROLE) {
        BatchAnchor memory batch = _batches[batchId];
        require(batch.timestamp != 0, "Batch not found");
        require(!_revokedLeaves[leafHash], "Leaf already revoked");

        _revokedLeaves[leafHash] = true;
        emit LeafCertificateRevoked(batchId, leafHash, reason);
    }

    function getBatch(bytes32 batchId) external view returns (BatchAnchor memory) {
        require(_batches[batchId].timestamp != 0, "Batch not found");
        return _batches[batchId];
    }
}
