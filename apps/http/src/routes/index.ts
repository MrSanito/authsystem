import { Router } from "express";
import authRoutes from "./auth.routes.js"
import type { Request, Response } from "express";
const router = Router();

// router.get("/auth", (req: Request, res: Response) => {
//     console.log("andha banda hai kya")
//     res.json({
//         success: true, 
//         message: "lawde kaam kar"
//     })
    
// } )
router.use("/auth", authRoutes )

export default router;  