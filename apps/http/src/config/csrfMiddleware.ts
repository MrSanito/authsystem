import type { NextFunction, Request, Response } from "express";
import { getRedisClient } from "@repo/redis";
import crypto from "crypto";

const redis = getRedisClient();

export const generateCSRFToken = async (userId: string, res: Response) => {
  const csrfToken = crypto.randomBytes(32).toString("hex");

  const csrfKey = `csrf:${userId}`;
  await redis.setex(csrfKey, 3600, csrfToken);

  res.cookie("csrfToken", csrfToken, {
    httpOnly: false,
    secure: true,
    sameSite: "none",
    maxAge: 60 * 60 * 1000,
  });

  return csrfToken;
};

export const verifyCSRFToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (req.method === "GET") {
      return next();
    }
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User is not authenticated",
      });
    }
    const ClientToken =
      req.headers["x-csrf-token"] ||
      req.headers["x-xcsrf-token"] ||
      req.headers["csrf-token"];

    if (!ClientToken) {
      console.log("token missing")
      return res.status(403).json({
        success: false,
        message: "CSRF_Token is missing Please Refresh The Page",
        code: "CSRF_TOKEN_MISSING",
      });
    }

    const csrfKey =`csrf:${userId}`;
    const storedToken = await redis.get(csrfKey);

    if(!storedToken){
      console.log("token missing");

      return res.status(403).json({
        success: false,
        message: "Invalid CSRF Token  . Please Refresh The Page",
        code: "CSRF_TOKEN_EXPIRED",
      });
    }

    if(storedToken !== ClientToken){
      return res.status(403).json({
        success: false,
        message: "CSRF Token is invalid Please Refresh The Page",
        code: "CSRF_TOKEN_INVALID",
      });
    }
    next()
  } catch (error) {
    console.log("error in verifyCSRFToken", error);
    return res.status(500).json({
      success: false,
      message: "CSRF Verification Failed Error",
      code:"CSRF_VERIFICATION_ERROR"
    });
  }
};

export const revokeCSRFToken = async (userId: string) => {
  const csrfKey = `csrf:${userId}`;
  await redis.del(csrfKey);
};


export const refreshCSRFToken = async (userId: string, res: Response) => {
  await revokeCSRFToken(userId);
  return await generateCSRFToken(userId, res);
};