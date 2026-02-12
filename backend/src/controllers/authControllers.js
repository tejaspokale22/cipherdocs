import crypto from "crypto";
import User from "../models/User.js";
import { ethers } from "ethers";
import jwt from "jsonwebtoken";

// in-memory nonce store
const nonceStore = new Map();

// request nonce
export const requestNonce = async (req, res) => {
  try {
    const { walletAddress } = req.body;

    if (!walletAddress) {
      return res.status(400).json({ message: "wallet address required" });
    }

    const normalizedAddress = walletAddress.toLowerCase();

    // generate nonce
    const nonce = crypto.randomBytes(16).toString("hex");

    // store nonce temporarily
    nonceStore.set(normalizedAddress, nonce);

    // check if user already exists
    const existingUser = await User.findOne({
      walletAddress: normalizedAddress,
    });

    return res.json({
      nonce,
      isNewUser: !existingUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "server error" });
  }
};

// verify signature and login
export const verify = async (req, res) => {
  try {
    const { walletAddress, signature, username, role } = req.body;

    if (!walletAddress || !signature) {
      return res
        .status(400)
        .json({ message: "wallet address and signature required" });
    }

    const normalizedAddress = walletAddress.toLowerCase();

    // get stored nonce
    const storedNonce = nonceStore.get(normalizedAddress);

    if (!storedNonce) {
      return res.status(400).json({ message: "nonce expired or invalid" });
    }

    const message = `Login to CipherDocs: ${storedNonce}`;

    // verify wallet signature
    const recoveredAddress = ethers.verifyMessage(message, signature);

    if (recoveredAddress.toLowerCase() !== normalizedAddress) {
      return res.status(401).json({ message: "invalid signature" });
    }

    // remove nonce after successful verification
    nonceStore.delete(normalizedAddress);

    let user = await User.findOne({
      walletAddress: normalizedAddress,
    });

    // new user creation only after valid signature
    if (!user) {
      if (!username || !role) {
        return res.status(400).json({
          message: "username and role required for new user",
        });
      }

      const cleanUsername = username.trim().toLowerCase();

      if (!["user", "issuer"].includes(role)) {
        return res.status(400).json({ message: "invalid role" });
      }

      const existingUsername = await User.findOne({
        username: cleanUsername,
      });

      if (existingUsername) {
        return res.status(400).json({
          message: "username already taken",
        });
      }

      user = new User({
        walletAddress: normalizedAddress,
        username: cleanUsername,
        role,
      });

      await user.save();
    }

    // generate jwt
    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    // set http only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      message: "authentication successful",
      role: user.role,
      username: user.username,
      walletAddress: user.walletAddress,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "server error" });
  }
};

// get current session
export const getCurrentSession = async (req, res) => {
  return res.json(req.user);
};

// logout user
export const logout = async (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: new Date(0), // expire immediately
  });

  return res.json({ message: "logged out successfully" });
};
