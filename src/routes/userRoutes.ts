import express from "express"
import { changePasswordController, deleteUserController, forgotPasswordController, getAllUsersController, getSingleUserController, loginUserController, logOutUserController,registerUserController, suspendedAccountActivationController, verifyUserEmailController } from "../controllers/userControllers"
import { checkUserAuthMiddelware } from "../middleware/checkUserAuth"
import { checkAdminAuthMiddleware } from "../middleware/checkAdminAuth"

const userRouter = express.Router()


// user auth routes starts //
//register user
userRouter.post("/auth/register", registerUserController)

// login user
userRouter.post("/auth/login", loginUserController)


// verify user email
userRouter.get("/auth/emailVerify/:email/:token", verifyUserEmailController)

// forgot password
userRouter.post("/auth/forgotpassword", forgotPasswordController)

// update password
userRouter.post("/auth/updatePassword", changePasswordController)

// logout user
userRouter.get("/auth/logOut", checkUserAuthMiddelware,logOutUserController)

// activete suspended account
userRouter.get("/auth/account/suspended/activate/:id", suspendedAccountActivationController)

// user auth routes ends //

// get single user
userRouter.get("/user/:id", checkUserAuthMiddelware, getSingleUserController)

// get all users
userRouter.get("/users", checkUserAuthMiddelware, getAllUsersController)

// delete single user
userRouter.delete("/user/delete/:id",checkUserAuthMiddelware, deleteUserController)

export default userRouter