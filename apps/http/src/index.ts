import "dotenv/config";
import cookieParser from "cookie-parser";
import express from "express";
import type { Request, Response } from "express";
import router from "./routes/index.js";
import { getRedisClient } from "@repo/redis";
import cors from "cors";


getRedisClient();

const app = express();
app.use(express.json());

app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_URL, 
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  }),
);

const port = 3001;
app.use((req, res, next) => {
  console.log(`🔔 Incoming Request: ${req.method} ${req.url}`);
  next();
});

app.use("/api/v1", router);

app.get("/", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "here we are here",
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
