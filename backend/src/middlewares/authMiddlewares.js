import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        message: "not authorized",
      });
    }

    // verify jwt
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // fetch user from database
    const user = await User.findById(decoded.userId).select(
      "walletAddress username name role",
    );

    if (!user) {
      return res.status(401).json({
        message: "user not found",
      });
    }

    // attach user to request
    req.user = {
      _id: user._id,
      walletAddress: user.walletAddress,
      username: user.username,
      name: user.name,
      role: user.role,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      message: "invalid or expired token",
    });
  }
};
