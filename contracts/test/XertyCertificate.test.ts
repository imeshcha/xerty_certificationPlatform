import { expect } from "chai";
import { ethers } from "hardhat";
import { XertyCertificate } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("XertyCertificate Smart Contract", function () {
  let xertyCert: XertyCertificate;
  let admin: SignerWithAddress;
  let issuer: SignerWithAddress;
  let student: SignerWithAddress;
  let verifier: SignerWithAddress;
  let unauthorized: SignerWithAddress;

  const sampleCertId = "XERTY-2026-08-001";
  const sampleCertHash = ethers.keccak256(ethers.toUtf8Bytes("Xerty Certificate Payload 1"));
  const sampleIpfsCID = "QmSampleMetadataCID1234567890abcdef";

  beforeEach(async function () {
    [admin, issuer, student, verifier, unauthorized] = await ethers.getSigners();

    const XertyCertificateFactory = await ethers.getContractFactory("XertyCertificate");
    xertyCert = await XertyCertificateFactory.deploy(admin.address);
    await xertyCert.waitForDeployment();

    // Grant ISSUER_ROLE to issuer account
    const ISSUER_ROLE = await xertyCert.ISSUER_ROLE();
    await xertyCert.connect(admin).grantRole(ISSUER_ROLE, issuer.address);
  });

  describe("Deployment & Access Control", function () {
    it("Should configure correct admin and issuer roles", async function () {
      const DEFAULT_ADMIN_ROLE = await xertyCert.DEFAULT_ADMIN_ROLE();
      const ISSUER_ROLE = await xertyCert.ISSUER_ROLE();

      expect(await xertyCert.hasRole(DEFAULT_ADMIN_ROLE, admin.address)).to.be.true;
      expect(await xertyCert.hasRole(ISSUER_ROLE, admin.address)).to.be.true;
      expect(await xertyCert.hasRole(ISSUER_ROLE, issuer.address)).to.be.true;
      expect(await xertyCert.hasRole(ISSUER_ROLE, unauthorized.address)).to.be.false;
    });

    it("Should revert if deployed with zero address", async function () {
      const XertyCertificateFactory = await ethers.getContractFactory("XertyCertificate");
      await expect(
        XertyCertificateFactory.deploy(ethers.ZeroAddress)
      ).to.be.revertedWith("XertyCertificate: Invalid admin address");
    });
  });

  describe("Certificate Issuance (`issueCertificate`)", function () {
    it("Should issue a certificate successfully and emit CertificateIssued event", async function () {
      const tx = await xertyCert
        .connect(issuer)
        .issueCertificate(sampleCertId, sampleCertHash, student.address, sampleIpfsCID);

      await expect(tx)
        .to.emit(xertyCert, "CertificateIssued")
        .withArgs(
          sampleCertId,
          sampleCertHash,
          issuer.address,
          student.address,
          sampleIpfsCID,
          (timestamp: any) => timestamp > 0
        );

      expect(await xertyCert.getTotalCertificates()).to.equal(1);

      const cert = await xertyCert.getCertificate(sampleCertId);
      expect(cert.certificateId).to.equal(sampleCertId);
      expect(cert.certificateHash).to.equal(sampleCertHash);
      expect(cert.issuerAddress).to.equal(issuer.address);
      expect(cert.studentAddress).to.equal(student.address);
      expect(cert.ipfsCID).to.equal(sampleIpfsCID);
      expect(cert.status).to.equal(0); // ACTIVE
    });

    it("Should prevent unauthorized accounts from issuing certificates", async function () {
      await expect(
        xertyCert
          .connect(unauthorized)
          .issueCertificate(sampleCertId, sampleCertHash, student.address, sampleIpfsCID)
      ).to.be.revertedWithCustomError(xertyCert, "AccessControlUnauthorizedAccount");
    });

    it("Should prevent duplicate certificateId", async function () {
      await xertyCert
        .connect(issuer)
        .issueCertificate(sampleCertId, sampleCertHash, student.address, sampleIpfsCID);

      const differentHash = ethers.keccak256(ethers.toUtf8Bytes("Different payload"));
      await expect(
        xertyCert
          .connect(issuer)
          .issueCertificate(sampleCertId, differentHash, student.address, sampleIpfsCID)
      ).to.be.revertedWith("XertyCertificate: Certificate ID already exists");
    });

    it("Should prevent duplicate certificateHash", async function () {
      await xertyCert
        .connect(issuer)
        .issueCertificate(sampleCertId, sampleCertHash, student.address, sampleIpfsCID);

      const differentId = "XERTY-2026-08-002";
      await expect(
        xertyCert
          .connect(issuer)
          .issueCertificate(differentId, sampleCertHash, student.address, sampleIpfsCID)
      ).to.be.revertedWith("XertyCertificate: Certificate hash already registered");
    });

    it("Should validate inputs (empty ID, zero address, empty IPFS CID, zero hash)", async function () {
      // Empty ID
      await expect(
        xertyCert
          .connect(issuer)
          .issueCertificate("", sampleCertHash, student.address, sampleIpfsCID)
      ).to.be.revertedWith("XertyCertificate: Empty certificateId");

      // Zero Hash
      await expect(
        xertyCert
          .connect(issuer)
          .issueCertificate(sampleCertId, ethers.ZeroHash, student.address, sampleIpfsCID)
      ).to.be.revertedWith("XertyCertificate: Invalid certificateHash");

      // Zero Address Student
      await expect(
        xertyCert
          .connect(issuer)
          .issueCertificate(sampleCertId, sampleCertHash, ethers.ZeroAddress, sampleIpfsCID)
      ).to.be.revertedWith("XertyCertificate: Invalid studentAddress");

      // Empty IPFS CID
      await expect(
        xertyCert
          .connect(issuer)
          .issueCertificate(sampleCertId, sampleCertHash, student.address, "")
      ).to.be.revertedWith("XertyCertificate: Empty ipfsCID");
    });
  });

  describe("Certificate Revocation (`revokeCertificate`)", function () {
    beforeEach(async function () {
      await xertyCert
        .connect(issuer)
        .issueCertificate(sampleCertId, sampleCertHash, student.address, sampleIpfsCID);
    });

    it("Should revoke certificate successfully and emit CertificateRevoked event", async function () {
      const reason = "Administrative correction";
      const tx = await xertyCert.connect(issuer).revokeCertificate(sampleCertId, reason);

      await expect(tx)
        .to.emit(xertyCert, "CertificateRevoked")
        .withArgs(
          sampleCertId,
          sampleCertHash,
          issuer.address,
          reason,
          (timestamp: any) => timestamp > 0
        );

      const cert = await xertyCert.getCertificate(sampleCertId);
      expect(cert.status).to.equal(1); // REVOKED
    });

    it("Should allow default admin to revoke certificates", async function () {
      await expect(
        xertyCert.connect(admin).revokeCertificate(sampleCertId, "Revoked by Super Admin")
      ).to.emit(xertyCert, "CertificateRevoked");
    });

    it("Should prevent unauthorized users from revoking", async function () {
      await expect(
        xertyCert.connect(unauthorized).revokeCertificate(sampleCertId, "Unauthorized attempt")
      ).to.be.revertedWithCustomError(xertyCert, "AccessControlUnauthorizedAccount");
    });

    it("Should revert if certificate is already revoked", async function () {
      await xertyCert.connect(issuer).revokeCertificate(sampleCertId, "First revocation");

      await expect(
        xertyCert.connect(issuer).revokeCertificate(sampleCertId, "Second revocation")
      ).to.be.revertedWith("XertyCertificate: Certificate already revoked");
    });

    it("Should revert if revoking non-existent certificate", async function () {
      await expect(
        xertyCert.connect(issuer).revokeCertificate("NON-EXISTENT", "Reason")
      ).to.be.revertedWith("XertyCertificate: Certificate not found");
    });
  });

  describe("Verification & Public Queries (`verifyCertificate`, `getCertificate`)", function () {
    it("Should return false for non-existent certificate", async function () {
      const result = await xertyCert.connect(verifier).verifyCertificate("UNKNOWN-ID");
      expect(result.isValid).to.be.false;
      expect(result.isRevoked).to.be.false;
      expect(result.timestamp).to.equal(0);
    });

    it("Should return valid for active certificate", async function () {
      await xertyCert
        .connect(issuer)
        .issueCertificate(sampleCertId, sampleCertHash, student.address, sampleIpfsCID);

      const result = await xertyCert.connect(verifier).verifyCertificate(sampleCertId);
      expect(result.isValid).to.be.true;
      expect(result.isRevoked).to.be.false;
      expect(result.certificateHash).to.equal(sampleCertHash);
      expect(result.issuerAddress).to.equal(issuer.address);
      expect(result.studentAddress).to.equal(student.address);
      expect(result.ipfsCID).to.equal(sampleIpfsCID);
      expect(result.timestamp).to.be.gt(0);
    });

    it("Should return isRevoked = true for revoked certificate", async function () {
      await xertyCert
        .connect(issuer)
        .issueCertificate(sampleCertId, sampleCertHash, student.address, sampleIpfsCID);
      await xertyCert.connect(issuer).revokeCertificate(sampleCertId, "Revoked reason");

      const result = await xertyCert.connect(verifier).verifyCertificate(sampleCertId);
      expect(result.isValid).to.be.false;
      expect(result.isRevoked).to.be.true;
    });

    it("Should fetch certificate by hash", async function () {
      await xertyCert
        .connect(issuer)
        .issueCertificate(sampleCertId, sampleCertHash, student.address, sampleIpfsCID);

      const cert = await xertyCert.getCertificateByHash(sampleCertHash);
      expect(cert.certificateId).to.equal(sampleCertId);
      expect(cert.studentAddress).to.equal(student.address);
    });

    it("Should revert getCertificateByHash for unregistered hash", async function () {
      const randomHash = ethers.keccak256(ethers.toUtf8Bytes("Unregistered"));
      await expect(xertyCert.getCertificateByHash(randomHash)).to.be.revertedWith(
        "XertyCertificate: Certificate hash not found"
      );
    });
  });
});
