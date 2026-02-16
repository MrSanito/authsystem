import jwt from "jsonwebtoken";
import { getRedisClient } from "@repo/redis";
import type { Response } from "express";

const redis = getRedisClient();

export const generateToken = async (id: any, res: Response) => {
  const accessToken = jwt.sign({ id }, process.env.JWT_SECRET!, {
    expiresIn: "1m",
  });

  const refreshToken = jwt.sign({ id }, process.env.REFRESH_SECRET!, {
    expiresIn: "7d",
  });

  const refreshTokenKey = `refreshToken:${id}`;

  await redis.setex(refreshTokenKey, 7 * 24 * 60 * 60, refreshToken);

  res.cookie("accessToken", {
    httpOnly: true,
    // secure: true,
    sameSite: "strict",
    maxAge: 1 * 60 * 1000,
  });

  res.cookie("refreshToken", {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly : true, 
    samesite: "none", 
    // secure: true, 

  });

  return {refreshToken, accessToken}
};
