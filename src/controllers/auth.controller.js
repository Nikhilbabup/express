import bcrypt from "bcrypt";
import { registerSchema } from "../validators/auth.validator.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";

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
  const accessToken = await generateAccessToken(user);
  const refreshToken = await generateRefreshToken(user);
  user.refreshToken = refreshToken;
  await user.save();

  const token = { accessToken, refreshToken };
  res.json({ token });
};

export const refresh = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ error: "Refresh token required" });
  }

  const user = await User.findOne({ refreshToken });

  if (!user) {
    return res.status(403).json({ error: "Invalid refresh token" });
  }

  try {
    jwt.verify(refreshToken, process.env.JWT_SECRET);

    const newAccessToken = await generateAccessToken(user);
    const newRefreshToken = await generateRefreshToken(user);
    res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (error) {
    console.error("Refresh token verification failed:", error);
    return res.status(403).json({ error: "Invalid refresh token" });
  }
};
