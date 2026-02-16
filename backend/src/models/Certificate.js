import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    originalDocumentHash: {
      type: String,
      required: true,
    },

    encryptedDocumentHash: {
      type: String,
      required: true,
    },

    ipfsCID: {
      type: String,
      required: true,
      trim: true,
    },

    // Envelope Encryption Fields
    encryptedAESKey: {
      type: String,
      required: true,
    },

    fileIV: {
      type: String,
      required: true,
    },

    envelopeIV: {
      type: String,
      required: true,
    },

    // References
    issuer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Blockchain Metadata
    blockchainTxHash: {
      type: String,
      required: true,
      trim: true,
    },

    contractCertificateId: {
      type: String,
      required: true,
    },

    network: {
      type: String,
      default: "polygon-amoy",
    },

    issueDate: {
      type: Date,
      default: Date.now,
    },

    expiryDate: {
      type: Date,
    },

    status: {
      type: String,
      enum: ["active", "revoked", "expired", "forged"],
      default: "active",
    },
  },
  { timestamps: true },
);

export default mongoose.model("Certificate", certificateSchema);
