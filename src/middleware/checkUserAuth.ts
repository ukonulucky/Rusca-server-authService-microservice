import { Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import { IGetUserAuthInfoRequest } from "../types/appTypes";
import UserModel from "../model/userSchema";







export const checkUserAuthMiddelware = async (req: IGetUserAuthInfoRequest, res:Response, next:NextFunction): Promise<void> => { 
   // const userJwt = req.cookies?.token

    const userJwt = req.header('Authorization')?.split(' ')[1]; // Get the token from 'Bearer <token>'

   
   
    if (!userJwt) { 

         res.status(401).json({ message: "Authentication required!", isAuthenticated: false });
        return 
        
    }
    try {
 
        const { id } = jwt.verify(userJwt, process.env.JWT_SECRET as string) as { id: string }

        const user = await UserModel.findById(id)
        if (!user) { 
            res.status(401).json({ message: "User not found" ,isAuthenticated: false });
            return 
        }
        req.user = user
      
        next()
    } catch (error) {
        res.status(401).json({ message: "Invalid or expired token", isAuthenticated: false });
      
    }


}