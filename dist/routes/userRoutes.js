"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userControllers_1 = require("../controllers/userControllers");
const userRouter = express_1.default.Router();
userRouter.post("/register", userControllers_1.registerUserController);
userRouter.post("/login", userControllers_1.loginUserController);
userRouter.post("/logOut", userControllers_1.logOutUserController);
exports.default = userRouter;
