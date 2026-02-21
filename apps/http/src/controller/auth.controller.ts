import type { Request, Response } from "express";
import { prisma } from "@repo/db";

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import TryCatch from "../middlewares/trycatch.js";
import { LoginSchema, RegisterSchema } from "@repo/validation";
import { getRedisClient } from "@repo/redis";
import crypto from "crypto";
import { sendMail } from "../config/sendMail.js";
import { getOtpHtml, getVerifyEmailHtml } from "../config/email.js";
import { generateAccessToken, generateToken, revokeRefreshToken, verifyRefreshToken } from "../config/generateToken.js";
import { refreshCSRFToken } from "../config/csrfMiddleware.js";

const redis = getRedisClient();

export const registerController = TryCatch(
  async (req: Request, res: Response) => {
    console.log(req.body);

    const validation = RegisterSchema.safeParse(req.body);
    if (!validation.success) {
      const zodError = validation.error;

      let firstErrorMessage: string = "Validation Failed";
      let allErrors: { field: string; message: string; code: string }[] = [];

      if (zodError.issues && Array.isArray(zodError.issues)) {
        allErrors = zodError.issues.map((issue) => ({
          field: issue.path ? issue.path.join(".") : "unknown",
          message: issue.message || "Validation Error ",
          code: issue.code,
        }));

        firstErrorMessage = allErrors[0]?.message || "Validation Error";
      }

      res.status(400).json({
        success: false,
        message: firstErrorMessage,
        error: allErrors,
      });
      return;
    }

    const { email, name, password } = validation.data;

    const rateLimitKey = `register-rate-limit:${req.ip}:${email}`;
    const isAllowed = await redis.set(rateLimitKey, "1", "EX", 60, "NX");

    if (!isAllowed) {
      res.status(429).json({
        success: false,
        message: "Too many requests",
      });
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ success: false, message: "User already exists" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    console.log("hashed password", hashedPassword);

    const verifyToken = crypto.randomBytes(32).toString("hex");
    console.log("verify token", verifyToken);

    const VerifyKey = `verify:${verifyToken}`;

    const datatoStore = JSON.stringify({
      name,
      email,
      password: hashedPassword,
    });

    await redis.set(VerifyKey, datatoStore, "EX", 300, "NX");

    const subject = "Verify You Email for Account Creation";
    const html = getVerifyEmailHtml({ email, token: verifyToken });

    const emailSend = await sendMail(email, subject, html);
    console.log("email send", emailSend);
    await redis.set(rateLimitKey, "true", "EX", 60);

    return res.json({
      success: true,
      message:
        "if your email is valild  , a verification link has been send . it will expire in 5 minutes",
    });
  },
);

export const testController = async (req: Request, res: Response) => {
  const user = await prisma.user.findFirst();

  console.log("we are herr", user);
  res.json({
    success: true,
    message: "working fine",
  });
};

export const verifyUser = TryCatch(async (req: Request, res: Response) => {
  const { token } = req.params;
  console.log(token);
  if (!token) {
    return res.status(400).json({
      success: true,
      message: "Verification token is required",
    });
  }

  const verifyKey = `verify:${token}`;

  const userDataJson = await redis.get(verifyKey);
  if (!userDataJson) {
    return res.status(400).json({
      success: true,
      message: "Verification token is Expired",
    });
  }

  await redis.del(verifyKey);
  const userData = JSON.parse(userDataJson);

  const existingUser = await prisma.user.findUnique({
    where: { email: userData.email },
  });
  if (existingUser) {
    res.status(400).json({ success: false, message: "User already exists" });
    return;
  }

  const newUser = await prisma.user.create({
    data: {
      name: userData.name,
      email: userData.email,
      password: userData.password,
    },
  });

  return res.status(201).json({
    succcess: true,
    message: " Email Verified Successfully ! you account has been created",
    user: {
      _id: newUser.id,
      name: newUser.name,
      email: newUser.email,
    },
  });
});

export const loginUser = TryCatch(async (req: Request, res: Response) => {
  console.log(req.body);

  const validation = LoginSchema.safeParse(req.body);
  if (!validation.success) {
    const zodError = validation.error;

    let firstErrorMessage: string = "Validation Failed";
    let allErrors: { field: string; message: string; code: string }[] = [];

    if (zodError.issues && Array.isArray(zodError.issues)) {
      allErrors = zodError.issues.map((issue) => ({
        field: issue.path ? issue.path.join(".") : "unknown",
        message: issue.message || "Validation Error ",
        code: issue.code,
      }));

      firstErrorMessage = allErrors[0]?.message || "Validation Error";
    }

    return res.status(400).json({
      success: false,
      message: firstErrorMessage,
      error: allErrors,
    });
  }

  const { email, password } = validation.data;

  const rateLimitKey = `login-rate-limit${req.ip}:${email}`;

  if (await redis.get(rateLimitKey)) {
    return res.status(409).json({
      success: false,
      message: "Too many request , try again later",
    });
  }

  const User = await prisma.user.findUnique({
    where: {
      email: email,
    },
    select: {
      id: true,
      email: true,
      password: true,
    },
  });

  console.log("user", User)
  if (!User) {
    return res.status(404).json({
      success: false,
      message: "Invalid Credential",
    });
  }

  console.log("User Detail", User);
  const comparePassword = await bcrypt.compare(password, User.password);
  console.log("compared password", comparePassword)

  if (!comparePassword) {
    return res.status(400).json({
      success: false,
      message: "Invalid Credentials",
    });
  }
  const OTP = Math.floor(100000 + Math.random() * 900000).toString();

  const otpKey = `otp:${email}`;

  await redis.set(otpKey, JSON.stringify(OTP), "EX", 300);

  const Subject = `OTP FOR VERIFICATION`;

  const html = getOtpHtml({ email, OTP });

  await sendMail(email, Subject, OTP);

  await redis.set(rateLimitKey, "true", "EX", 60);

  return res.status(200).json({
    success: true,
    message:
      "If your email is valid , an otp has been sent . it will be valid for 5 minutes",
  });
});

export const verifyOtp = TryCatch(async (req: Request, res: Response) => {
  console.log("request body",req.body)
  const { email, otp } = req.body;
  console.log("email", email, "otp", otp);

  if (!email || !otp) {
    res.status(404).json({
      success: false,
      message: "Please provide all details",
    });
  }
  const otpKey = `otp:${email}`;

  const storedOtpString = await redis.get(otpKey);

  console.log("stored Otp String", storedOtpString);

  if (!storedOtpString) {
    return res.status(400).json({
      success: false,
      message: "Otp is expired",
    });
  }

  const storedOtp = JSON.parse(storedOtpString);

  if (storedOtp != otp) {
    return res.status(400).json({
      success: false,
      message: "Invalid OTP",
    });
  }

  await redis.del(otpKey);

  let User = await prisma.user.findUnique({
    where: {
      email,
    },
    select: {
      name: true,

      id: true,
      email: true,
    },
  });

  console.log("user data", User);

  const tokenData = await generateToken(User?.id, res);

  console.log("token data", tokenData);

  res.status(200).json({
    success: true,
    message: `Welcome : ${User?.name}`,
    User,
  });
});

export const myProfile = TryCatch((req: Request, res: Response) => {
  const User = req.user;

  res.json(User)
});


export const refreshToken = TryCatch(async(req: Request , res: Response) => { 
  const refreshToken = req.cookies.refreshToken;

 
  if(!refreshToken) {
    return res.status(401).json({
      success: false, 
       message: "Invalid refresh Token"

    })
  }

  const decode  = await verifyRefreshToken(refreshToken);

  console.log("decode debug data", decode)
   if (!decode) {
    return res.status(401).json({
      success: false,
      message: "Invalid refresh Token 123",
    });
  }

  generateAccessToken(decode.id,res)

  res.status(200).json({
    success : true,
    message: "token Refreshed"
  })

 })

 export const logOutUser = TryCatch(async(req: Request, res: Response) => { 
  const userId= req.user?.id;

  await revokeRefreshToken(userId);

  res.clearCookie("refreshToken")
  res.clearCookie("accessToken")
  res.clearCookie("csrfToken")

  await redis.del(`user:${userId}`)

  res.json({
    message: "Logged Out Successfully"
  })


})

export const refreshCSRF = TryCatch(async(req: Request , res: Response) => { 
  const userId = req.user?.id;

 const newCSRFToken = await refreshCSRFToken(userId, res);

  res.status(200).json({
    success: true,
    message: "CSRF Token Refreshed",
    csrfToken: newCSRFToken
  })
})