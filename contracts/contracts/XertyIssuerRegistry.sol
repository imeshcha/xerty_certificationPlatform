// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title XertyIssuerRegistry
 * @dev Manages authorized educational institutions, academies, and universities.
 */
contract XertyIssuerRegistry is AccessControl {
    bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");

    struct Issuer {
        string name;
        string organizationURI;
        bool isRegistered;
        bool isActive;
        uint256 registeredAt;
    }

    mapping(address => Issuer) private _issuers;
    address[] private _issuerAddresses;

    event IssuerRegistered(address indexed issuerAddress, string name, string organizationURI);
    event IssuerStatusUpdated(address indexed issuerAddress, bool isActive);

    constructor(address defaultAdmin) {
        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
    }

    function registerIssuer(
        address issuerAddress,
        string calldata name,
        string calldata organizationURI
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(issuerAddress != address(0), "Invalid issuer address");
        require(!_issuers[issuerAddress].isRegistered, "Issuer already registered");

        _issuers[issuerAddress] = Issuer({
            name: name,
            organizationURI: organizationURI,
            isRegistered: true,
            isActive: true,
            registeredAt: block.timestamp
        });

        _issuerAddresses.push(issuerAddress);
        _grantRole(ISSUER_ROLE, issuerAddress);

        emit IssuerRegistered(issuerAddress, name, organizationURI);
    }

    function setIssuerStatus(
        address issuerAddress,
        bool isActive
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_issuers[issuerAddress].isRegistered, "Issuer not found");
        _issuers[issuerAddress].isActive = isActive;

        if (isActive) {
            _grantRole(ISSUER_ROLE, issuerAddress);
        } else {
            _revokeRole(ISSUER_ROLE, issuerAddress);
        }

        emit IssuerStatusUpdated(issuerAddress, isActive);
    }

    function isAuthorizedIssuer(address issuerAddress) external view returns (bool) {
        return _issuers[issuerAddress].isRegistered && _issuers[issuerAddress].isActive;
    }

    function getIssuer(address issuerAddress) external view returns (Issuer memory) {
        require(_issuers[issuerAddress].isRegistered, "Issuer not found");
        return _issuers[issuerAddress];
    }

    function getAllIssuers() external view returns (address[] memory) {
        return _issuerAddresses;
    }
}
