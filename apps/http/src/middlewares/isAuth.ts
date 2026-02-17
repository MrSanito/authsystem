import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import { prisma } from "@repo/db";

import { getRedisClient } from "@repo/redis";

const redis = getRedisClient();

export const isAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token  = req.cookies.accessToken;

    if (!token) {
      return res.status(403).json({
        message: "Please Login - no Token",
      });
    }

    const decodedData: any = jwt.verify(token, process.env.JWT_SECRET!);

    if (!decodedData) {
        
        return res.status(400).json({
            success: false,
            message: "token expired",
        });
    }
        
    const catchedUser = await redis.get(`user:${decodedData.id}`);

    if(catchedUser) {
            req.user = JSON.parse(catchedUser);
        return next()
    }

const User = await prisma.user.findUnique({
    where : {
        id : decodedData.id
    }
    , 
    select: {
        id: true,
        email: true, 
        name: true, 
        role: true,

    }
})

if(!User){
    return res.status(400).json({
        success: false, 
        message: "no user with this id"
    })
}

await redis.set(`user:${User.id}`, JSON.stringify(User), "EX", 3600);

req.user= User;

next();




  } catch (error: any) {

    return res.status(500).json({
        success: false, 

        message: error.message
    })
  }
};
