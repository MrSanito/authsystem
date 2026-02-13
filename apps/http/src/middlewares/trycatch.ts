import type { NextFunction } from "express"

const Trycatch = (handler: Function)  => {
    return async (req : Request, res : Response, next : NextFunction) => {
        try {
            await handler(req, res, next)
            
        } catch (error : any) {
            res.status(500).json({
                success: false, 
                message : error.message
            })
            
        }
        
    }
    
}