import { Router } from "express";
import {
    loginController,
  registerController,
  testController,
} from "../controller/auth.controller.js";
import type { Request, Response } from "express";
const router = Router();

router.get("/test", testController);
router.post("/register", registerController);
router.post("/login", loginController);
 
export default router;
