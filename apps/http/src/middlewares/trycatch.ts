import type { NextFunction, Request, Response } from "express"

export const TryCatch = (handler: Function)  => {
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



export default TryCatch;