import { Router } from "express";
import {
   loginUser,
  logOutUser,
  myProfile,
  refreshToken,
  registerController,
  testController,
  verifyOtp,
  verifyUser,
} from "../controller/auth.controller.js";
import type { Request, Response } from "express";
import { isAuth } from "../middlewares/isAuth.js";
const router = Router();

router.get("/test", testController);
router.post("/register", registerController);
router.post("/verify/:token", verifyUser  );
router.post("/login", loginUser);
router.post("/verifyOtp", verifyOtp);
router.get("/me", isAuth, myProfile );
router.post("/refresh", refreshToken );
router.post("/logout", isAuth, logOutUser );
 
export default router;
