"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUserController = void 0;
const logger_1 = __importDefault(require("../utils/logger"));
const validate_1 = require("../utils/validate");
const userSchema_1 = __importDefault(require("../model/userSchema"));
const refreshToken_1 = __importDefault(require("../model/refreshToken"));
const generateToken_1 = require("../utils/generateToken");
// register user
const registerUserController = async (req, res) => {
    logger_1.default.info("user hit the register controller");
    try {
        // validate user input
        const { error } = (0, validate_1.registerValidation)(req.body);
        if (error) {
            logger_1.default.error("user registration error", error.details[0].message);
            res.status(400).json({
                message: error.details[0].message,
                status: false
            });
            return;
        }
        const newUser = new userSchema_1.default({
            email: req.body.email,
            userName: req.body.userName,
            password: req.body.password
        });
        const user = await newUser.save();
        logger_1.default.info("user created");
        // create token
        const { accessToken, expiresAt, refreshToken } = (0, generateToken_1.generateToken)(user);
        new refreshToken_1.default({
            accessToken,
            expiresAt,
            refreshToken
        });
        logger_1.default.warn("new refresh token schema created");
        res.status(201).json({
            message: "User created successfuly",
            status: true,
            accessToken,
            refreshToken
        });
    }
    catch (error) {
        logger_1.default.error("Registration error", error);
        res.status(500).json({
            message: "Internal server error",
            status: false
        });
    }
};
exports.registerUserController = registerUserController;
// login user
