import { Router } from "express";
import {
   loginUser,
  registerController,
  testController,
  verifyUser,
} from "../controller/auth.controller.js";
import type { Request, Response } from "express";
const router = Router();

router.get("/test", testController);
router.post("/register", registerController);
router.post("/verify/:token", verifyUser  );
router.post("/login", loginUser);
 
export default router;
