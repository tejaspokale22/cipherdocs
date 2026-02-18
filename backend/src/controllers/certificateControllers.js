import crypto from "crypto";
import { isAddress } from "ethers";
import User from "../models/User.js";
import {
  uploadToIPFS,
  getCertificateFromIPFS,
} from "../services/ipfsService.js";
import { ethers } from "ethers";
import Certificate from "../models/Certificate.js";
import { decryptAESKey, decryptFileBuffer } from "../utils/decryption.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { getDocumentHMAC } from "../utils/hmac.js";
import { expireCertificate } from "../utils/expiry.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const abiPath = path.join(__dirname, "../abi/CipherDocs.json");
const CipherDocsABI = JSON.parse(fs.readFileSync(abiPath, "utf-8"));

export const prepareCertificate = async (req, res) => {
  try {
    if (req.user.role !== "issuer") {
      return res.status(403).json({
        success: false,
        message: "Only issuers can prepare certificates",
      });
    }

    const {
      name,
      recipientWallet,
      encryptedFileBase64,
      aesKeyHex,
      ivHex,
      expiryDate,
      originalDocumentHash,
    } = req.body;

    if (
      !name ||
      !recipientWallet ||
      !encryptedFileBase64 ||
      !aesKeyHex ||
      !ivHex ||
      !originalDocumentHash
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields.",
      });
    }

    const normalizedWallet = recipientWallet.toLowerCase();

    if (!isAddress(normalizedWallet)) {
      return res.status(400).json({
        success: false,
        message: "Invalid recipient wallet address.",
      });
    }

    const recipientUser = await User.findOne({
      walletAddress: normalizedWallet,
    });

    if (!recipientUser) {
      return res.status(404).json({
        success: false,
        message: "Recipient not found.",
      });
    }

    const documentHMAC = getDocumentHMAC(originalDocumentHash);

    // Duplicate check (only active certificates)
    const existingActive = await Certificate.findOne({
      documentHMAC,
      recipient: recipientUser._id,
      status: "active",
    });

    if (existingActive) {
      return res.status(409).json({
        success: false,
        message:
          "Active certificate already exists. Revoke it before reissuing.",
      });
    }

    const fileBuffer = Buffer.from(encryptedFileBase64, "base64");

    // Compute encrypted file hash (for blockchain)
    const encryptedDocumentHash = crypto
      .createHash("sha256")
      .update(fileBuffer)
      .digest("hex");

    const masterSecret = process.env.MASTER_SECRET;

    if (!masterSecret) {
      throw new Error("MASTER_SECRET not configured.");
    }

    const masterKey = Buffer.from(process.env.MASTER_SECRET, "hex");

    if (masterKey.length !== 32) {
      throw new Error("MASTER_SECRET must be 32 bytes.");
    }

    // generate envelope IV (CBC)
    const envelopeIV = crypto.randomBytes(16);

    // encrypt AES key using AES-256-CBC
    const cipher = crypto.createCipheriv("aes-256-cbc", masterKey, envelopeIV);

    let encryptedAESKey = cipher.update(aesKeyHex, "hex", "hex");
    encryptedAESKey += cipher.final("hex");

    const ipfsCID = await uploadToIPFS(fileBuffer);

    return res.status(200).json({
      success: true,
      data: {
        name,
        documentHMAC,
        encryptedDocumentHash,
        ipfsCID,
        encryptedAESKey,
        fileIV: ivHex,
        envelopeIV: envelopeIV.toString("hex"),
        recipientId: recipientUser._id,
        expiryDate: expiryDate || null,
      },
    });
  } catch (error) {
    console.error("Prepare Certificate Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while preparing certificate.",
    });
  }
};

export const issueCertificate = async (req, res) => {
  try {
    if (req.user.role !== "issuer") {
      return res.status(403).json({
        success: false,
        message: "Only issuers can issue certificates.",
      });
    }

    const {
      name,
      documentHMAC,
      encryptedDocumentHash,
      ipfsCID,
      encryptedAESKey,
      fileIV,
      envelopeIV,
      recipientId,
      blockchainTxHash,
      contractCertificateId,
      expiryDate,
    } = req.body;

    if (
      !name ||
      !documentHMAC ||
      !encryptedDocumentHash ||
      !ipfsCID ||
      !encryptedAESKey ||
      !fileIV ||
      !envelopeIV ||
      !blockchainTxHash ||
      !contractCertificateId
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required data.",
      });
    }

    const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
    const AMOY_RPC_URL = process.env.AMOY_RPC_URL;

    if (!CONTRACT_ADDRESS || !AMOY_RPC_URL) {
      throw new Error("Blockchain configuration missing.");
    }

    const provider = new ethers.JsonRpcProvider(AMOY_RPC_URL);

    const receipt = await provider.getTransactionReceipt(blockchainTxHash);

    if (!receipt) {
      return res.status(400).json({
        success: false,
        message: "Transaction not found.",
      });
    }

    if (
      !receipt.to ||
      receipt.to.toLowerCase() !== CONTRACT_ADDRESS.toLowerCase()
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid contract address.",
      });
    }

    const recipientUser = await User.findById(recipientId);

    if (!recipientUser) {
      return res.status(404).json({
        success: false,
        message: "Recipient not found.",
      });
    }

    // enforce revoke-before-reissue rule
    const existingActive = await Certificate.findOne({
      documentHMAC,
      recipient: recipientUser._id,
      status: "active",
    });

    if (existingActive) {
      return res.status(409).json({
        success: false,
        message:
          "Active certificate already exists. Revoke it before re-issuing.",
      });
    }

    const certificate = await Certificate.create({
      name,
      documentHMAC,
      encryptedDocumentHash,
      ipfsCID,
      encryptedAESKey,
      fileIV,
      envelopeIV,
      issuer: req.user._id,
      recipient: recipientUser._id,
      blockchainTxHash,
      contractCertificateId,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      network: "polygon-amoy",
      status: "active",
    });

    return res.status(201).json({
      success: true,
      message: "Certificate issued successfully.",
      data: certificate,
    });
  } catch (error) {
    console.error("Issue certificate error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while issuing certificate.",
    });
  }
};

export const getMyCertificates = async (req, res) => {
  try {
    const userId = req.user._id;

    const certificates = await Certificate.find({
      recipient: userId,
    })
      .populate("issuer", "username walletAddress")
      .sort({ createdAt: -1 });

    const result = [];

    for (const cert of certificates) {
      // Update status if expired
      await expireCertificate(cert);

      // fetch encrypted file from IPFS
      const encryptedBuffer = await getCertificateFromIPFS(cert.ipfsCID);

      // decrypt AES key
      const aesKeyBuffer = decryptAESKey(cert.encryptedAESKey, cert.envelopeIV);

      // decrypt file
      const decryptedBuffer = decryptFileBuffer(
        encryptedBuffer,
        aesKeyBuffer,
        cert.fileIV,
      );

      result.push({
        _id: cert._id,
        name: cert.name,
        issuer: cert.issuer,
        issueDate: cert.issueDate,
        status: cert.status,
        fileBase64: decryptedBuffer.toString("base64"),
        contractCertificateId: cert.contractCertificateId,
      });
    }

    return res.status(200).json({
      success: true,
      count: result.length,
      data: result,
    });
  } catch (error) {
    console.error("Get my certificates error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch certificates.",
    });
  }
};

export const getIssuedCertificates = async (req, res) => {
  try {
    const issuerId = req.user._id;

    if (req.user.role !== "issuer") {
      return res.status(403).json({
        message: "Access denied. Only issuers can view issued certificates.",
      });
    }

    const certificates = await Certificate.find({ issuer: issuerId })
      .populate("recipient", "username walletAddress")
      .sort({ createdAt: -1 });

    for (const cert of certificates) {
      // Update status if expired
      await expireCertificate(cert);
    }

    return res.status(200).json({
      success: true,
      data: certificates,
    });
  } catch (error) {
    console.error("Get issued certificates error:", error);
    return res.status(500).json({
      message: "Server error while fetching issued certificates.",
    });
  }
};

export const verifyCertificate = async (req, res) => {
  try {
    const { certId, uploadedDocumentHash } = req.body;

    // validate required fields
    if (!certId || !uploadedDocumentHash) {
      return res.status(400).json({
        status: "error",
        message: "Missing required fields: certId and originalDocumentHash.",
      });
    }

    // validate bytes32 format
    if (!ethers.isHexString(certId, 32)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid certificate ID format.",
      });
    }

    const normalizedCertId = certId.toLowerCase();
    const uploadedHash = uploadedDocumentHash.toLowerCase();

    // fetch certificate from database
    const certificate = await Certificate.findOne({
      contractCertificateId: normalizedCertId,
    }).populate("issuer", "walletAddress");

    if (!certificate) {
      return res.status(404).json({
        status: "error",
        message: "Certificate not found.",
      });
    }

    // connect to blockchain
    const provider = new ethers.JsonRpcProvider(process.env.AMOY_RPC_URL);

    const contract = new ethers.Contract(
      process.env.CONTRACT_ADDRESS,
      CipherDocsABI,
      provider,
    );

    const onChainCert = await contract.getCertificate(normalizedCertId);

    if (onChainCert.issuer === ethers.ZeroAddress) {
      return res.json({
        status: "error",
        message: "Certificate not found on blockchain.",
      });
    }

    // verify encrypted document hash against blockchain
    const chainEncryptedHash = onChainCert.documentHash
      .toLowerCase()
      .replace("0x", "");

    if (
      chainEncryptedHash !== certificate.encryptedDocumentHash.toLowerCase()
    ) {
      return res.json({
        status: "error",
        message: "Blockchain hash mismatch.",
      });
    }

    // download encrypted file from ipfs
    const encryptedBuffer = await getCertificateFromIPFS(certificate.ipfsCID);

    // verify encrypted file integrity
    const encryptedFileHash = crypto
      .createHash("sha256")
      .update(encryptedBuffer)
      .digest("hex");

    if (encryptedFileHash !== chainEncryptedHash) {
      return res.json({
        status: "error",
        message: "Encrypted file integrity compromised.",
      });
    }

    // decrypt aes key using master secret
    const aesKeyBuffer = decryptAESKey(
      certificate.encryptedAESKey,
      certificate.envelopeIV,
    );

    // decrypt file
    const decryptedBuffer = decryptFileBuffer(
      encryptedBuffer,
      aesKeyBuffer,
      certificate.fileIV,
    );

    // compute original hash from decrypted file
    const decryptedHash = crypto
      .createHash("sha256")
      .update(decryptedBuffer)
      .digest("hex");

    // compare uploaded file hash with decrypted hash
    if (decryptedHash !== uploadedHash) {
      return res.json({
        status: "tampered",
        message:
          "Uploaded document does not match the originally issued certificate.",
      });
    }

    // revoked check
    if (onChainCert.revoked) {
      return res.json({
        status: "revoked",
        message: "Certificate has been revoked.",
      });
    }

    // expiry check
    const currentTimestamp = Math.floor(Date.now() / 1000);

    if (
      Number(onChainCert.expiry) > 0 &&
      Number(onChainCert.expiry) < currentTimestamp
    ) {
      return res.json({
        status: "expired",
        message: "Certificate has expired.",
      });
    }

    // final valid response
    return res.json({
      status: "valid",
      issuer: certificate.issuer.walletAddress,
      user: onChainCert.user,
      issuedAt: Number(onChainCert.issuedAt) * 1000,
      blockchainTxHash: certificate.blockchainTxHash,
      message: "Certificate is valid and authentic.",
    });
  } catch (error) {
    console.error("Verification error:", error);

    return res.status(500).json({
      status: "error",
      message: "Verification failed due to server error.",
    });
  }
};

export const revokeCertificate = async (req, res) => {
  try {
    const { certId } = req.params;

    if (!ethers.isHexString(certId, 32)) {
      return res.status(400).json({
        message: "Invalid certificate ID.",
      });
    }

    const normalizedCertId = certId.toLowerCase();

    // find certificate in db
    const certificate = await Certificate.findOne({
      contractCertificateId: normalizedCertId,
    });

    if (!certificate) {
      return res.status(404).json({
        message: "Certificate not found.",
      });
    }

    // ensure logged-in user is issuer
    if (
      certificate.issuer.toString() !== req.user.id &&
      req.user.role !== "issuer"
    ) {
      return res.status(403).json({
        message: "Not authorized to revoke this certificate.",
      });
    }

    // connect to blockchain
    const provider = new ethers.JsonRpcProvider(process.env.AMOY_RPC_URL);

    const contract = new ethers.Contract(
      process.env.CONTRACT_ADDRESS,
      CipherDocsABI,
      provider,
    );

    const onChainCert = await contract.getCertificate(normalizedCertId);

    // ensure blockchain state is revoked
    if (!onChainCert.revoked) {
      return res.status(400).json({
        message: "Certificate is not revoked yet on blockchain.",
      });
    }

    // update db
    certificate.status = "revoked";
    await certificate.save();

    return res.json({
      message: "Certificate revoked successfully.",
    });
  } catch (error) {
    console.error("Revoke error:", error);
    return res.status(500).json({
      message: "Server error during revoke.",
    });
  }
};
