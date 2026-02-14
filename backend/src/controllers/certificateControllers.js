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

export const prepareCertificate = async (req, res) => {
  try {
    if (req.user.role !== "issuer") {
      return res.status(403).json({
        success: false,
        message: "Only issuers can prepare certificates",
      });
    }

    const {
      title,
      description,
      recipientWallet,
      encryptedFileBase64,
      aesKeyHex,
      ivHex,
      expiryDate,
      originalDocumentHash,
    } = req.body;

    if (
      !title ||
      !recipientWallet ||
      !encryptedFileBase64 ||
      !aesKeyHex ||
      !ivHex ||
      !originalDocumentHash
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const normalizedWallet = recipientWallet.toLowerCase();

    if (!isAddress(normalizedWallet)) {
      return res.status(400).json({
        success: false,
        message: "Invalid recipient wallet address",
      });
    }

    const recipientUser = await User.findOne({
      walletAddress: normalizedWallet,
    });

    if (!recipientUser) {
      return res.status(404).json({
        success: false,
        message: "Recipient not found",
      });
    }

    // Duplicate check (only active certificates)
    const existingActive = await Certificate.findOne({
      originalDocumentHash,
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
      throw new Error("MASTER_SECRET not configured");
    }

    const masterKey = Buffer.from(process.env.MASTER_SECRET, "hex");

    if (masterKey.length !== 32) {
      throw new Error("MASTER_SECRET must be 32 bytes");
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
        title,
        description,
        originalDocumentHash,
        encryptedDocumentHash,
        ipfsCID,
        encryptedAESKey,
        fileIV: ivHex, // GCM IV from frontend
        envelopeIV: envelopeIV.toString("hex"), // CBC IV
        recipientId: recipientUser._id,
        expiryDate: expiryDate || null,
      },
    });
  } catch (error) {
    console.error("Prepare Certificate Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while preparing certificate",
    });
  }
};

export const issueCertificate = async (req, res) => {
  try {
    if (req.user.role !== "issuer") {
      return res.status(403).json({
        success: false,
        message: "only issuers can issue certificates",
      });
    }

    const {
      title,
      description,
      originalDocumentHash,
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
      !originalDocumentHash ||
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
        message: "missing required data",
      });
    }

    const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
    const AMOY_RPC_URL = process.env.AMOY_RPC_URL;

    if (!CONTRACT_ADDRESS || !AMOY_RPC_URL) {
      throw new Error("blockchain configuration missing");
    }

    const provider = new ethers.JsonRpcProvider(AMOY_RPC_URL);

    const receipt = await provider.getTransactionReceipt(blockchainTxHash);

    if (!receipt) {
      return res.status(400).json({
        success: false,
        message: "transaction not found",
      });
    }

    if (
      !receipt.to ||
      receipt.to.toLowerCase() !== CONTRACT_ADDRESS.toLowerCase()
    ) {
      return res.status(400).json({
        success: false,
        message: "invalid contract address",
      });
    }

    const recipientUser = await User.findById(recipientId);

    if (!recipientUser) {
      return res.status(404).json({
        success: false,
        message: "recipient not found",
      });
    }

    // enforce revoke-before-reissue rule
    const existingActive = await Certificate.findOne({
      originalDocumentHash,
      recipient: recipientUser._id,
      status: "active",
    });

    if (existingActive) {
      return res.status(409).json({
        success: false,
        message:
          "active certificate already exists. revoke it before reissuing.",
      });
    }

    const certificate = await Certificate.create({
      title,
      description,
      originalDocumentHash,
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
      message: "certificate issued successfully",
      data: certificate,
    });
  } catch (error) {
    console.error("issue certificate error:", error);
    return res.status(500).json({
      success: false,
      message: "server error while issuing certificate",
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
        title: cert.title,
        description: cert.description,
        issuer: cert.issuer,
        issueDate: cert.issueDate,
        status: cert.status,
        fileBase64: decryptedBuffer.toString("base64"),
      });
    }

    return res.status(200).json({
      success: true,
      count: result.length,
      data: result,
    });
  } catch (error) {
    console.error("Get My Certificates Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch certificates",
    });
  }
};

export const getIssuedCertificates = async (req, res) => {
  try {
    const issuerId = req.user._id;

    // Safety check
    if (req.user.role !== "issuer") {
      return res.status(403).json({
        message: "Access denied. Only issuers can view issued certificates.",
      });
    }

    const certificates = await Certificate.find({ issuer: issuerId })
      .populate("recipient", "username walletAddress") // optional
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: certificates,
    });
  } catch (error) {
    console.error("Get Issued Certificates Error:", error);
    return res.status(500).json({
      message: "Server error while fetching issued certificates",
    });
  }
};
