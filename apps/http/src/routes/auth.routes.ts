import { Router } from "express";
import { registerController, testController } from "../controller/auth.controller.js";
import type { Request, Response } from "express"; 
const router = Router();

router.get("/", (req : Request, Response) => {
    console.log( "request received")
    
})
router.get("/register", registerController)
router.get("/test", testController)

export default router;