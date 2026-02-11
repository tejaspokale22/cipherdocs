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

    role: {
      type: String,
      enum: ["user", "issuer"],
    },
  },
  { timestamps: true },
);

export default mongoose.model("User", userSchema);
