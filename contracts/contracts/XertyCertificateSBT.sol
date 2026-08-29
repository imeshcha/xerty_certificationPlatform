// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

interface IERC5192 {
    event Locked(uint256 tokenId);
    event Unlocked(uint256 tokenId);
    function locked(uint256 tokenId) external view returns (bool);
}

/**
 * @title XertyCertificateSBT
 * @dev Non-transferable ERC-721 Soulbound Token (ERC-5192) for academic credentials.
 */
contract XertyCertificateSBT is ERC721, AccessControl, IERC5192 {
    bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");

    enum CertificateStatus {
        ACTIVE,
        REVOKED
    }

    struct CertificateRecord {
        string certificateId;
        bytes32 certHash;
        address issuerWallet;
        address studentWallet;
        string ipfsCID;
        uint64 timestamp;
        CertificateStatus status;
        string revocationReason;
    }

    uint256 private _nextTokenId = 1;

    // TokenId => CertificateRecord
    mapping(uint256 => CertificateRecord) private _certificates;
    // CertificateId (string) => TokenId
    mapping(string => uint256) private _certificateIdToToken;
    // CertHash (bytes32) => TokenId
    mapping(bytes32 => uint256) private _hashToToken;

    // --- ISSUER ON-CHAIN GAS VAULT ---
    // Issuer Address => Deposited Gas Balance (in wei)
    mapping(address => uint256) public issuerGasVault;
    // CourseId => Deposited Gas Balance (in wei)
    mapping(string => uint256) public courseGasVault;

    event CertificateIssued(
        uint256 indexed tokenId,
        string indexed certificateId,
        bytes32 indexed certHash,
        address issuer,
        address student,
        string ipfsCID
    );

    event CertificateRevoked(
        uint256 indexed tokenId,
        string indexed certificateId,
        string reason
    );

    event GasDeposited(
        address indexed issuer,
        string indexed courseId,
        uint256 amount
    );

    event GasWithdrawn(
        address indexed issuer,
        uint256 amount
    );

    constructor(
        string memory name,
        string memory symbol,
        address adminAddress
    ) ERC721(name, symbol) {
        _grantRole(DEFAULT_ADMIN_ROLE, adminAddress);
        _grantRole(ISSUER_ROLE, adminAddress);
    }

    function issueCertificate(
        string calldata certificateId,
        bytes32 certHash,
        address student,
        string calldata ipfsCID
    ) external returns (uint256) {
        require(bytes(certificateId).length > 0, "Empty certificate ID");
        require(student != address(0), "Invalid student address");
        require(_certificateIdToToken[certificateId] == 0, "Certificate ID already exists");
        require(_hashToToken[certHash] == 0, "Certificate hash already registered");

        uint256 tokenId = _nextTokenId++;
        _safeMint(student, tokenId);

        _certificates[tokenId] = CertificateRecord({
            certificateId: certificateId,
            certHash: certHash,
            issuerWallet: msg.sender,
            studentWallet: student,
            ipfsCID: ipfsCID,
            timestamp: uint64(block.timestamp),
            status: CertificateStatus.ACTIVE,
            revocationReason: ""
        });

        _certificateIdToToken[certificateId] = tokenId;
        _hashToToken[certHash] = tokenId;

        emit Locked(tokenId);
        emit CertificateIssued(tokenId, certificateId, certHash, msg.sender, student, ipfsCID);

        return tokenId;
    }

    function batchIssueCertificates(
        string[] calldata certificateIds,
        bytes32[] calldata certHashes,
        address[] calldata students,
        string[] calldata ipfsCIDs
    ) external returns (uint256[] memory) {
        uint256 count = certificateIds.length;
        require(
            count == certHashes.length && count == students.length && count == ipfsCIDs.length,
            "Array length mismatch"
        );

        uint256[] memory tokenIds = new uint256[](count);

        for (uint256 i = 0; i < count; i++) {
            require(students[i] != address(0), "Invalid student address");
            require(_certificateIdToToken[certificateIds[i]] == 0, "Certificate ID already exists");
            require(_hashToToken[certHashes[i]] == 0, "Certificate hash already exists");

            uint256 tokenId = _nextTokenId++;
            _safeMint(students[i], tokenId);

            _certificates[tokenId] = CertificateRecord({
                certificateId: certificateIds[i],
                certHash: certHashes[i],
                issuerWallet: msg.sender,
                studentWallet: students[i],
                ipfsCID: ipfsCIDs[i],
                timestamp: uint64(block.timestamp),
                status: CertificateStatus.ACTIVE,
                revocationReason: ""
            });

            _certificateIdToToken[certificateIds[i]] = tokenId;
            _hashToToken[certHashes[i]] = tokenId;
            tokenIds[i] = tokenId;

            emit Locked(tokenId);
            emit CertificateIssued(tokenId, certificateIds[i], certHashes[i], msg.sender, students[i], ipfsCIDs[i]);
        }

        return tokenIds;
    }

    function revokeCertificate(
        string calldata certificateId,
        string calldata reason
    ) external {
        uint256 tokenId = _certificateIdToToken[certificateId];
        require(tokenId != 0, "Certificate not found");

        CertificateRecord storage record = _certificates[tokenId];
        require(
            msg.sender == record.issuerWallet || hasRole(DEFAULT_ADMIN_ROLE, msg.sender) || hasRole(ISSUER_ROLE, msg.sender),
            "Only original issuing wallet can revoke"
        );
        require(record.status == CertificateStatus.ACTIVE, "Certificate already revoked");

        record.status = CertificateStatus.REVOKED;
        record.revocationReason = reason;

        emit CertificateRevoked(tokenId, certificateId, reason);
    }

    function verifyCertificate(string calldata certificateId)
        external
        view
        returns (CertificateRecord memory)
    {
        uint256 tokenId = _certificateIdToToken[certificateId];
        require(tokenId != 0, "Certificate not found");
        return _certificates[tokenId];
    }

    function getCertificateByHash(bytes32 certHash)
        external
        view
        returns (CertificateRecord memory)
    {
        uint256 tokenId = _hashToToken[certHash];
        require(tokenId != 0, "Certificate not found");
        return _certificates[tokenId];
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        return string(abi.encodePacked("ipfs://", _certificates[tokenId].ipfsCID));
    }

    // ERC-5192: Soulbound Token standard
    function locked(uint256 tokenId) external view override returns (bool) {
        _requireOwned(tokenId);
        return true;
    }

    // Soulbound transfer restriction: prevent all secondary transfers
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal virtual override returns (address) {
        address from = _ownerOf(tokenId);
        // Minting is allowed (from == address(0)), burning is allowed (to == address(0)), transfers are blocked
        if (from != address(0) && to != address(0)) {
            revert("XertySBT: Soulbound tokens cannot be transferred");
        }
        return super._update(to, tokenId, auth);
    }

    // --- ISSUER GAS VAULT METHODS ---

    /**
     * @dev Allows an Issuer to deposit ETH into their on-chain gas escrow
     * to sponsor student claim minting costs for a specific course or globally.
     */
    function depositGas(string calldata courseId) external payable {
        require(msg.value > 0, "Must deposit non-zero ETH");
        issuerGasVault[msg.sender] += msg.value;
        if (bytes(courseId).length > 0) {
            courseGasVault[courseId] += msg.value;
        }
        emit GasDeposited(msg.sender, courseId, msg.value);
    }

    /**
     * @dev Allows an Issuer to withdraw unspent gas funds from their vault back to their wallet.
     */
    function withdrawGas(uint256 amount) external {
        require(issuerGasVault[msg.sender] >= amount, "Insufficient vault balance");
        issuerGasVault[msg.sender] -= amount;
        
        (bool sent, ) = payable(msg.sender).call{value: amount}("");
        require(sent, "Failed to refund ETH");

        emit GasWithdrawn(msg.sender, amount);
    }

    function getIssuerGasBalance(address issuer) external view returns (uint256) {
        return issuerGasVault[issuer];
    }

    function getCourseGasBalance(string calldata courseId) external view returns (uint256) {
        return courseGasVault[courseId];
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC721, AccessControl)
        returns (bool)
    {
        return interfaceId == type(IERC5192).interfaceId || super.supportsInterface(interfaceId);
    }
}
