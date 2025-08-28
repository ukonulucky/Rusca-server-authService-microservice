import express from "express"
import { loginUserController, logOutUserController, refreshTokenController, registerUserController } from "../controllers/userControllers"

const userRouter = express.Router()

userRouter.post("/register", registerUserController)
userRouter.post("/login", loginUserController)
userRouter.post("/logOut", logOutUserController)
userRouter.post("/cretaRefreshToken", refreshTokenController)


export default userRouter