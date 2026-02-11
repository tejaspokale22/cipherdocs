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

    name: {
      type: String,
      default: "",
      trim: true,
    },

    role: {
      type: String,
      enum: ["user", "issuer"],
      default: "user",
    },

    nonce: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("User", userSchema);
