import crypto from "crypto";
import User from "../models/User.js";
import { ethers } from "ethers";
import jwt from "jsonwebtoken";

// Request Nonce
export const requestNonce = async (req, res) => {
  try {
    const { walletAddress } = req.body;

    if (!walletAddress) {
      return res.status(400).json({ message: "wallet address required" });
    }

    const normalizedAddress = walletAddress.toLowerCase();
    const nonce = crypto.randomBytes(16).toString("hex");

    let user = await User.findOne({ walletAddress: normalizedAddress });

    if (!user) {
      // Create minimal user with nonce
      user = new User({
        walletAddress: normalizedAddress,
        nonce,
      });
    } else {
      user.nonce = nonce;
    }

    await user.save();

    return res.json({
      nonce,
      isNewUser: !user.username, // better check
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "server error" });
  }
};

// Verify Signature & Login
export const verify = async (req, res) => {
  try {
    const { walletAddress, signature, username, name, role } = req.body;

    if (!walletAddress || !signature) {
      return res.status(400).json({
        message: "Authentication failed. Please re-connect your wallet.",
      });
    }

    const normalizedAddress = walletAddress.toLowerCase();

    const user = await User.findOne({
      walletAddress: normalizedAddress,
    }).select("+nonce");

    if (!user || !user.nonce) {
      return res.status(400).json({
        message: "Session expired. Please reconnect your wallet.",
      });
    }

    const message = `Login to CipherDocs: ${user.nonce}`;
    const recoveredAddress = ethers.verifyMessage(message, signature);

    if (recoveredAddress.toLowerCase() !== normalizedAddress) {
      return res.status(401).json({
        message: "Authentication failed. Please try again.",
      });
    }

    // Rotate nonce immediately
    user.nonce = undefined;

    // Complete registration if new user
    if (!user.username) {
      if (!username || !name || !role) {
        return res.status(400).json({
          message: "Complete your profile to continue.",
        });
      }

      const cleanUsername = username.trim().toLowerCase();

      const existingUsername = await User.findOne({
        username: cleanUsername,
      });

      if (existingUsername) {
        return res.status(400).json({
          message: "Username already taken.",
        });
      }

      if (!["user", "issuer"].includes(role)) {
        return res.status(400).json({
          message: "Invalid role selected.",
        });
      }

      if (role === "issuer") {
        const approvedIssuers =
          process.env.APPROVED_ISSUERS?.split(",").map((addr) =>
            addr.trim().toLowerCase(),
          ) || [];

        if (!approvedIssuers.includes(normalizedAddress)) {
          return res.status(403).json({
            message: "This wallet is not authorized to register as an issuer.",
          });
        }
      }

      user.username = cleanUsername;
      user.name = name.trim();
      user.role = role;
    }

    await user.save();

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "6h" },
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 6 * 60 * 60 * 1000,
    });

    return res.json({
      message: "Authentication successful.",
      role: user.role,
      username: user.username,
      name: user.name,
      walletAddress: user.walletAddress,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "server error" });
  }
};

// Get Current Session
export const getCurrentSession = async (req, res) => {
  return res.json(req.user);
};

// Logout
export const logout = async (_req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    expires: new Date(0),
  });

  return res.json({ message: "logged out successfully" });
};
