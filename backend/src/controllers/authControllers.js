import crypto from "crypto";
import User from "../models/User.js";
import { ethers } from "ethers";
import jwt from "jsonwebtoken";

export const requestNonce = async (req, res) => {
  try {
    const { walletAddress } = req.body;

    if (!walletAddress) {
      return res.status(400).json({ message: "Wallet address required" });
    }

    const normalizedAddress = walletAddress.toLowerCase();

    let user = await User.findOne({ walletAddress: normalizedAddress });

    // If user doesn't exist, create one
    if (!user) {
      user = new User({
        walletAddress: normalizedAddress,
        nonce: crypto.randomBytes(16).toString("hex"),
      });

      await user.save();

      return res.json({ nonce: user.nonce });
    }

    // If user exists, generate new nonce
    user.nonce = crypto.randomBytes(16).toString("hex");
    await user.save();

    return res.json({ nonce: user.nonce });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const verify = async (req, res) => {
  try {
    const { walletAddress, signature } = req.body;

    if (!walletAddress || !signature) {
      return res.status(400).json({ message: "Wallet and signature required" });
    }

    const normalizedAddress = walletAddress.toLowerCase();

    const user = await User.findOne({ walletAddress: normalizedAddress });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const message = `Login to CipherDocs: ${user.nonce}`;

    const recoveredAddress = ethers.verifyMessage(message, signature);

    if (recoveredAddress.toLowerCase() !== normalizedAddress) {
      return res.status(401).json({ message: "Invalid signature" });
    }

    // Rotate nonce after successful login
    user.nonce = crypto.randomBytes(16).toString("hex");
    await user.save();

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    // Send token as HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // change to true in production (HTTPS)
      sameSite: "lax",
    });

    return res.json({ message: "Authentication successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
