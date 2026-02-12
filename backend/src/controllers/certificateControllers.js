import crypto from "crypto";
import { isAddress } from "ethers";
import User from "../models/User.js";
import { uploadToIPFS } from "../services/ipfsService.js";
import { ethers } from "ethers";
import Certificate from "../models/Certificate.js";

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
    } = req.body;

    if (
      !title ||
      !recipientWallet ||
      !encryptedFileBase64 ||
      !aesKeyHex ||
      !ivHex
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

    const fileBuffer = Buffer.from(encryptedFileBase64, "base64");

    const documentHash = crypto
      .createHash("sha256")
      .update(fileBuffer)
      .digest("hex");

    const masterSecret = process.env.MASTER_SECRET;

    if (!masterSecret) {
      throw new Error("MASTER_SECRET not configured");
    }

    const masterKey = Buffer.from(masterSecret, "hex");

    if (masterKey.length !== 32) {
      throw new Error("MASTER_SECRET must be 32 bytes");
    }

    const envelopeIV = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv("aes-256-cbc", masterKey, envelopeIV);

    let encryptedAESKey = cipher.update(aesKeyHex, "hex", "hex");
    encryptedAESKey += cipher.final("hex");

    const ipfsCID = await uploadToIPFS(fileBuffer);

    return res.status(200).json({
      success: true,
      data: {
        title,
        description,
        documentHash,
        ipfsCID,
        encryptedAESKey,
        encryptionIV: envelopeIV.toString("hex"),
        recipientId: recipientUser._id,
        expiryDate,
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
        message: "Only issuers can issue certificates",
      });
    }

    const {
      title,
      description,
      documentHash,
      ipfsCID,
      encryptedAESKey,
      encryptionIV,
      recipientId,
      blockchainTxHash,
      contractCertificateId,
      expiryDate,
    } = req.body;

    if (
      !documentHash ||
      !ipfsCID ||
      !blockchainTxHash ||
      !contractCertificateId
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing blockchain data",
      });
    }

    const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
    const AMOY_RPC_URL = process.env.AMOY_RPC_URL;

    const provider = new ethers.JsonRpcProvider(AMOY_RPC_URL);

    const receipt = await provider.getTransactionReceipt(blockchainTxHash);

    if (!receipt) {
      return res.status(400).json({
        success: false,
        message: "Transaction not found",
      });
    }

    if (receipt.to.toLowerCase() !== CONTRACT_ADDRESS.toLowerCase()) {
      return res.status(400).json({
        success: false,
        message: "Invalid contract address",
      });
    }

    const recipientUser = await User.findById(recipientId);

    if (!recipientUser) {
      return res.status(404).json({
        success: false,
        message: "Recipient not found",
      });
    }

    const certificate = await Certificate.create({
      title,
      description,
      documentHash,
      ipfsCID,
      encryptedAESKey,
      encryptionIV,
      issuer: req.user._id,
      recipient: recipientUser._id,
      blockchainTxHash,
      contractCertificateId,
      expiryDate,
      network: "polygon-amoy",
      status: "active",
    });

    return res.status(201).json({
      success: true,
      message: "Certificate issued successfully",
      data: certificate,
    });
  } catch (error) {
    console.error("Issue Certificate Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while issuing certificate",
    });
  }
};
