import type { Request, Response } from "express";
import { prisma } from "@repo/db";

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const registerController = async (req: Request, res: Response) => {
  try {
    console.log(req.body);
    const { email, password, name } = req.body;
    if (!email || !password) {
      res
        .status(400)
        .json({ success: false, message: "Email and password are required" });
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ success: false, message: "User already exists" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    res
      .status(201)
      .json({
        success: true,
        message: "User created successfully",
        user: { id: user.id, email: user.email },
      });
  } catch (error) {
    console.error("Register error:", error);
    res
      .status(500)
      .json({ success: false, message: "Internal server error", error });
  }
};

export const testController = async (req: Request, res: Response) => {
  const user = await prisma.user.findFirst();

  console.log("we are herr", user);
  res.json({
    success: true,
    message: "working fine",
  });
};

export const loginController = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res
        .status(400)
        .json({ success: false, message: "Email and password are required" });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(400).json({ success: false, message: "Invalid credentials" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ success: false, message: "Invalid credentials" });
      return;
    }

    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "1h" },
    );
    res.json({ success: true, token, message: "Login successful" });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
