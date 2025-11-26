import { redisClient } from "./redisClient.js";

export const rateLimitter = ({
  windowSeconds = 900,
  maxRequests = 100,
  keyPrefix = "rate",
}) => {
  return async (req, res, next) => {
    try {
      const identifier = req.user?.id || req.ip;

      const key = `${keyPrefix}:${identifier}`;

      const current = await redisClient.incr(key);

      if (current === 1) {
        await redisClient.expire(key, windowSeconds);
      }

      if (current > maxRequests) {
        return res.status(429).json({ error: "Too many requests" });
      }

      next();
    } catch (error) {
      console.error("Rate limiting error:", error);
      next();
    }
  };
};
