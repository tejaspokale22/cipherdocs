import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    issueDate: {
      type: Date,
      default: Date.now,
      required: true,
    },

    expiryDate: {
      type: Date,
    },

    status: {
      type: String,
      enum: ["active", "revoked", "expired"],
      default: "active",
    },

    documentHash: {
      type: String,
      required: true,
    },

    ipfsCID: {
      type: String,
      required: true,
      trim: true,
    },

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

    blockchainTxHash: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Certificate", certificateSchema);
