import type { Request, Response } from "express";

export const registerController = async (req: Request, res: Response) => {};

export const testController = async (req: Request, res: Response) => {
  console.log("we are herr");
  res.json({
    success: true,
    message: "working fine",
  });
};
