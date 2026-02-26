import jwt from "jsonwebtoken";
import { getRedisClient } from "@repo/redis";
import type { Response } from "express";
import { refreshToken } from "../controller/auth.controller.js";
import { generateCSRFToken, revokeCSRFToken } from "./csrfMiddleware.js";
import crypto from "crypto";

const redis = getRedisClient();

export const generateToken = async (id: any, res: Response) => {
  const sessionId = crypto.randomBytes(16).toString("hex");

  const accessToken = jwt.sign({ id, sessionId }, process.env.JWT_SECRET!, {
    expiresIn: "15m",
  });

  const refreshToken = jwt.sign(
    { id, sessionId },
    process.env.REFRESH_SECRET!,
    {
      expiresIn: "7d",
    },
  );

  const refreshTokenKey = `refreshToken:${id}`;
  const activeSessionKey = `active_session:${id}`;
  const sessionDataKey = ` session${sessionId}`;

  const existingSession = await redis.get(activeSessionKey);

  if (existingSession) {
    await redis.del(`session:${existingSession}`);
    await redis.del(refreshToken);
  }

  const sessionData = {
    user: id,
    sessionId,
    createdAt: new Date().toISOString(),
    lastActivity: new Date().toISOString(),
  };
  await redis.setex(refreshTokenKey, 7 * 24 * 60 * 60, refreshToken);
  await redis.setex(
    sessionDataKey,
    7 * 24 * 60 * 60,
    JSON.stringify(sessionData),
  );

  await redis.setex(activeSessionKey, 7 * 24 * 60 * 60, sessionId);
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 15 * 60 * 1000,
  });

  res.cookie("refreshToken", refreshToken, {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: "none",
    secure: true,
  });

  const csrfToken = await generateCSRFToken(id, res);

  return { refreshToken, accessToken, csrfToken, sessionId };
};

export const verifyRefreshToken = async (RefreshToken: any) => {
  try {
    const decode: any = jwt.verify(RefreshToken, process.env.REFRESH_SECRET!);
    console.log("decoded data jwt verify", decode);

    const storedToken = await redis.get(`refreshToken:${decode.id}`);

    console.log("stored Data", storedToken);

    if (storedToken !== RefreshToken) {
      return null;
    }

    const activeSessionId = await redis.get(`active_session:${decode.id}`);

    if (activeSessionId! == decode.sessionId) {
      return null;
    }

    const sessionData = await redis.get(`session:${decode.sessionId}`);

    if (!sessionData) {
      return null;
    }

    const parsedSessionData = JSON.parse(sessionData);
    parsedSessionData.lastActivity = new Date().toISOString();

    await redis.setex(
      `session:${decode.sessionId}`,
      7 * 24 * 60 * 60,
      JSON.stringify(parsedSessionData),
    );

    return decode;
  } catch (error) {
    return null;
  }
};

export const generateAccessToken = (
  id: any,
  sessionId: string,
  res: Response,
) => {
  const accessToken = jwt.sign({ id, sessionId }, process.env.JWT_SECRET!, {
    expiresIn: "15m",
  });

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 15 * 60 * 1000,
  });
};

export const revokeRefreshToken = async (userId: string) => {
  const activeSessionId = await redis.get(`active_session:${userId}`);
  await redis.del(`refreshToken:${userId}`);
  await redis.del(`active_session:${userId}`);

  if (activeSessionId) {
    await redis.del(`session:${activeSessionId}`);
  }
  await revokeCSRFToken(userId);
};

export const isSessionActive = async (userId: string, sessionId: string) => {
  const activeSessionId = await redis.get(`active_session:${userId}`);

  return activeSessionId === sessionId;
};
