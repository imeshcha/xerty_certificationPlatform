// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title XertyCertificate
 * @dev Decentralized Certificate Registry for Arbitrum Sepolia Layer 2.
 * Stores tamper-proof academic credentials with instant verifiability and revocation control.
 */
contract XertyCertificate is AccessControl, ReentrancyGuard {
    bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");

    enum CertificateStatus {
        ACTIVE,
        REVOKED
    }

    struct Certificate {
        string certificateId;      // Unique certificate identifier
        bytes32 certificateHash;   // Keccak-256 hash of metadata payload
        address issuerAddress;     // Authorized issuer wallet
        address studentAddress;    // Recipient wallet
        string ipfsCID;            // IPFS TokenURI / metadata locator
        uint64 timestamp;          // Issuance block timestamp
        CertificateStatus status;  // ACTIVE (0) or REVOKED (1)
    }

    // Mapping from certificateId (string) => Certificate
    mapping(string => Certificate) private _certificates;
    // Mapping from certificateHash (bytes32) => certificateId (string)
    mapping(bytes32 => string) private _hashToCertificateId;
    // Registry of all issued certificate IDs
    string[] private _allCertificateIds;

    // Events
    event CertificateIssued(
        string indexed certificateId,
        bytes32 indexed certificateHash,
        address indexed issuerAddress,
        address studentAddress,
        string ipfsCID,
        uint64 timestamp
    );

    event CertificateRevoked(
        string indexed certificateId,
        bytes32 indexed certificateHash,
        address indexed issuerAddress,
        string reason,
        uint64 timestamp
    );

    /**
     * @dev Initializes the contract with the default admin and issuer roles.
     * @param adminAddress The address that will hold DEFAULT_ADMIN_ROLE and initial ISSUER_ROLE.
     */
    constructor(address adminAddress) {
        require(adminAddress != address(0), "XertyCertificate: Invalid admin address");
        _grantRole(DEFAULT_ADMIN_ROLE, adminAddress);
        _grantRole(ISSUER_ROLE, adminAddress);
    }

    // =========================================================================
    // ISSUER FUNCTIONS
    // =========================================================================

    /**
     * @notice Issues a new verifiable digital certificate.
     * @param certificateId Unique human-readable certificate ID (e.g. "XERTY-2026-08-9842").
     * @param certificateHash Keccak-256 cryptographic hash of certificate metadata.
     * @param studentAddress Recipient wallet address (EVM / MPC wallet).
     * @param ipfsCID IPFS Content Identifier pointing to the metadata and assets.
     */
    function issueCertificate(
        string calldata certificateId,
        bytes32 certificateHash,
        address studentAddress,
        string calldata ipfsCID
    ) external onlyRole(ISSUER_ROLE) nonReentrant {
        // Input validation
        require(bytes(certificateId).length > 0, "XertyCertificate: Empty certificateId");
        require(certificateHash != bytes32(0), "XertyCertificate: Invalid certificateHash");
        require(studentAddress != address(0), "XertyCertificate: Invalid studentAddress");
        require(bytes(ipfsCID).length > 0, "XertyCertificate: Empty ipfsCID");

        // Duplicate prevention
        require(
            _certificates[certificateId].timestamp == 0,
            "XertyCertificate: Certificate ID already exists"
        );
        require(
            bytes(_hashToCertificateId[certificateHash]).length == 0,
            "XertyCertificate: Certificate hash already registered"
        );

        uint64 currentTimestamp = uint64(block.timestamp);

        // Store certificate record
        _certificates[certificateId] = Certificate({
            certificateId: certificateId,
            certificateHash: certificateHash,
            issuerAddress: msg.sender,
            studentAddress: studentAddress,
            ipfsCID: ipfsCID,
            timestamp: currentTimestamp,
            status: CertificateStatus.ACTIVE
        });

        _hashToCertificateId[certificateHash] = certificateId;
        _allCertificateIds.push(certificateId);

        emit CertificateIssued(
            certificateId,
            certificateHash,
            msg.sender,
            studentAddress,
            ipfsCID,
            currentTimestamp
        );
    }

    /**
     * @notice Revokes an existing certificate on-chain.
     * @param certificateId Unique certificate identifier to revoke.
     * @param reason Human-readable explanation for audit logs.
     */
    function revokeCertificate(
        string calldata certificateId,
        string calldata reason
    ) external onlyRole(ISSUER_ROLE) nonReentrant {
        require(bytes(certificateId).length > 0, "XertyCertificate: Empty certificateId");
        require(bytes(reason).length > 0, "XertyCertificate: Empty reason");

        Certificate storage cert = _certificates[certificateId];
        require(cert.timestamp != 0, "XertyCertificate: Certificate not found");
        require(cert.status == CertificateStatus.ACTIVE, "XertyCertificate: Certificate already revoked");

        // Only the issuing institution or contract admin can revoke
        require(
            cert.issuerAddress == msg.sender || hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "XertyCertificate: Unauthorized to revoke this certificate"
        );

        cert.status = CertificateStatus.REVOKED;
        uint64 currentTimestamp = uint64(block.timestamp);

        emit CertificateRevoked(
            certificateId,
            cert.certificateHash,
            msg.sender,
            reason,
            currentTimestamp
        );
    }

    // =========================================================================
    // VERIFIER & PUBLIC QUERY FUNCTIONS
    // =========================================================================

    /**
     * @notice Verifies certificate authenticity and active status.
     * @param certificateId Unique certificate ID.
     * @return isValid True if certificate exists and is not revoked.
     * @return isRevoked True if certificate exists but was revoked.
     * @return certificateHash Stored cryptographic digest.
     * @return issuerAddress Address of the issuing institution.
     * @return studentAddress Address of the certificate holder.
     * @return ipfsCID IPFS pointer.
     * @return timestamp Issuance block timestamp.
     */
    function verifyCertificate(string calldata certificateId)
        external
        view
        returns (
            bool isValid,
            bool isRevoked,
            bytes32 certificateHash,
            address issuerAddress,
            address studentAddress,
            string memory ipfsCID,
            uint64 timestamp
        )
    {
        Certificate memory cert = _certificates[certificateId];
        if (cert.timestamp == 0) {
            return (false, false, bytes32(0), address(0), address(0), "", 0);
        }

        bool active = (cert.status == CertificateStatus.ACTIVE);
        bool revoked = (cert.status == CertificateStatus.REVOKED);

        return (
            active,
            revoked,
            cert.certificateHash,
            cert.issuerAddress,
            cert.studentAddress,
            cert.ipfsCID,
            cert.timestamp
        );
    }

    /**
     * @notice Retrieves full certificate record by Certificate ID.
     * @param certificateId Unique certificate ID.
     */
    function getCertificate(string calldata certificateId)
        external
        view
        returns (Certificate memory)
    {
        Certificate memory cert = _certificates[certificateId];
        require(cert.timestamp != 0, "XertyCertificate: Certificate not found");
        return cert;
    }

    /**
     * @notice Retrieves full certificate record by Keccak-256 hash.
     * @param certificateHash Cryptographic hash of the certificate.
     */
    function getCertificateByHash(bytes32 certificateHash)
        external
        view
        returns (Certificate memory)
    {
        string memory certId = _hashToCertificateId[certificateHash];
        require(bytes(certId).length > 0, "XertyCertificate: Certificate hash not found");
        return _certificates[certId];
    }

    /**
     * @notice Returns total number of certificates issued on the platform.
     */
    function getTotalCertificates() external view returns (uint256) {
        return _allCertificateIds.length;
    }
}
