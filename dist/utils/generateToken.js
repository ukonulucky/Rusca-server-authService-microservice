"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const generateToken = (user) => {
    if (!user._id) {
        throw new Error("User id not found");
    }
    console.log("this is the user sent", user);
    const accessToken = jsonwebtoken_1.default.sign({
        userId: user._id,
        username: user.userName
    }, process.env.JWT_SECRET);
    console.log("this is the accessToken created", accessToken);
    const refreshToken = crypto_1.default.randomBytes(40).toString("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // expires in 7days
    return {
        accessToken,
        expiresAt,
        userId: user._id
    };
};
exports.generateToken = generateToken;
