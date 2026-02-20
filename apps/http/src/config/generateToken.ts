import jwt from "jsonwebtoken";
import { getRedisClient } from "@repo/redis";
import type { Response } from "express";
import { refreshToken } from "../controller/auth.controller.js";
import { generateCSRFToken } from "./csrfMiddleware.js";

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

  res.cookie("accessToken", accessToken,  {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 1 * 60 * 1000,
  });

  res.cookie("refreshToken", refreshToken,  {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly : true, 
    sameSite: "none", 
    secure: true, 

  });

  const csrfToken = await generateCSRFToken(id, res);


  return {refreshToken, accessToken, csrfToken}
};

export const verifyRefreshToken = async (RefreshToken : any ) => {

    try {
      const decode: any = jwt.verify(RefreshToken, process.env.REFRESH_SECRET!);
      console.log("decoded data jwt verify", decode)

      const storedToken = await redis.get(`refreshToken:${decode.id}`)

      console.log("stored Data", storedToken)

      if(storedToken === RefreshToken) {
        return decode;

      }
      return null
        
    } catch (error) {
      return null
        
    }
  }

  export const generateAccessToken = (id : any, res: Response) => { 
    const accessToken = jwt.sign({id},process.env.JWT_SECRET!, {
      expiresIn: "7d"
    })

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 1 * 60 * 1000,
    });
   }


   export const revokeRefreshToken = async(userId : string) => { 
    await redis.del(`refresh_token:${userId}`);

    }
