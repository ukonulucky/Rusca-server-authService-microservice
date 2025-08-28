import express from "express"
import { loginUserController, logOutUserController,registerUserController } from "../controllers/userControllers"

const userRouter = express.Router()

userRouter.post("/register", registerUserController)
userRouter.post("/login", loginUserController)
userRouter.post("/logOut", logOutUserController)



export default userRouter