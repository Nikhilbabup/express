import { redisClient } from "./redisClient.js";

export const saveToken = async (userId, refreshToken) => {
  const key = `refresh_token_${userId}:${refreshToken}`;
  await redisClient.setEx(key, 7 * 24 * 60 * 60, "valid"); // 7 days expiration
};

export const verifyRefreshToken = async (userId, refreshToken) => {
  const key = `refresh_token_${userId}:${refreshToken}`;
  const result = await redisClient.get(key);
  return result === "valid";
};

export const deleteToken = async (userId, refreshToken) => {
  const key = `refresh_token_${userId}:${refreshToken}`;
  await redisClient.del(key);
};
