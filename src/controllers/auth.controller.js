import bcrypt from "bcrypt";
import { registerSchema } from "../validators/auth.validator.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { generateAccessToken, generateRefreshToken } from "../utils/token.js";
import { deleteToken, saveToken, verifyRefreshToken } from "../utils/redisToken.js";

export const register = async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);

  if (!parsed.success) {
    return res
      .status(400)
      .json({ error: "Invalid input", details: parsed.error.errors });
  }

  const { email, password } = parsed.data;

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ email, password: hashedPassword });

  res
    .status(201)
    .json({ message: "User registered successfully", userId: user._id });
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(400).json({ error: "Invalid Credentials" });
  }
  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    return res.status(400).json({ error: "Invalid Credentials" });
  }
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  await saveToken(user._id.toString(), refreshToken);
  const token = { accessToken, refreshToken };
  res.json({ token });
};

export const refresh = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ error: "Refresh token required" });
  }

  const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
  const isValid = await verifyRefreshToken(decoded.id, refreshToken);

  if (!isValid) {
    return res.status(403).json({ error: "Invalid refresh token" });
  }

  try {
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const newAccessToken = await generateAccessToken(user);
    const newRefreshToken = await generateRefreshToken(user);
    
    // ✅ ROTATION: delete old, save new
    await deleteToken(decoded.id, refreshToken);
    await saveToken(decoded.id, newRefreshToken);

    res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (error) {
    console.error("Refresh token verification failed:", error);
    return res.status(403).json({ error: "Invalid refresh token" });
  }
};
