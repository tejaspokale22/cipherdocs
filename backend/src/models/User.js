import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    walletAddress: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    username: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },

    name: {
      type: String,
      trim: true,
    },

    role: {
      type: String,
      enum: ["user", "issuer"],
    },

    // Required for Web3 authentication
    nonce: {
      type: String,
      select: false,
    },
  },
  { timestamps: true },
);

export default mongoose.model("User", userSchema);
