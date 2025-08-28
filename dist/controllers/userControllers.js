"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePasswordOTPVerificationController = exports.deleteUserController = exports.changePasswordController = exports.forgotPasswordController = exports.getAllUsersController = exports.getSingleUserController = exports.logOutUserController = exports.loginUserController = exports.registerUserController = void 0;
const logger_1 = __importDefault(require("../utils/logger"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const validate_1 = require("../utils/validate");
const userSchema_1 = __importDefault(require("../model/userSchema"));
const mongoose_1 = require("mongoose");
const sendEmail_1 = __importDefault(require("../utils/sendEmail"));
const encrypt_1 = require("../utils/encrypt");
const checkUserIp_1 = require("../utils/checkUserIp");
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
                status: false,
            });
            return;
        }
        const { email, password, fullName, role } = req.body;
        // Check if user already exists
        const existingUser = await userSchema_1.default.findOne({
            $or: [{ email }, { fullName }],
        });
        if (existingUser) {
            logger_1.default.warn("Attempted registration with existing email");
            return res.status(409).json({
                message: "User with this email or userName already exists",
                status: false,
            });
        }
        const user = new userSchema_1.default({
            password,
            email,
            fullName,
            role,
        });
        const newUser = await user.save();
        logger_1.default.info("user created");
        // create token
        /* endpoint to verify email */
        const emailVerificationToken = newUser.createEmailVerificationToken();
        const verifyEmailEndpoint = process.env.SERVER_URL +
            "/api/v1/user" +
            "/emailVerify/" +
            newUser.email +
            "/" +
            emailVerificationToken;
        const option = {
            subject: "Activate Your Account!",
            emailTemplate: "accountVerification",
            to: [
                {
                    email: newUser.email,
                    name: fullName,
                },
            ],
            mailData: {
                companyName: "Rusca bank assessment",
                userName: fullName,
                link: verifyEmailEndpoint,
            },
        };
        await (0, sendEmail_1.default)(req, res, option);
        res.status(201).json({
            status: "success",
            message: "Account created, please verify your email",
            data: newUser,
        });
    }
    catch (error) {
        logger_1.default.error("Registration error", error);
        res.status(500).json({
            message: "Internal server error",
            status: false,
        });
    }
};
exports.registerUserController = registerUserController;
// login user
const loginUserController = async (req, res) => {
    logger_1.default.info("user hit the login controller");
    try {
        // validate user input
        const { error } = (0, validate_1.loginValidation)(req.body);
        if (error) {
            logger_1.default.error("user login error", error.details[0].message);
            res.status(400).json({
                message: error.details[0].message,
                status: false,
            });
            return;
        }
        const { email, password } = req.body;
        const user = await userSchema_1.default.findOne({
            email,
        });
        if (!user) {
            logger_1.default.warn("Attempted login with invalid email");
            return res.status(409).json({
                message: "Invalid user email/password",
                status: false,
            });
        }
        // check if passoword match
        const isPasswordCorrect = user.comparePassword(password);
        const encryptedId = (0, encrypt_1.encrypt)(user._id.toString());
        if (!isPasswordCorrect) {
            logger_1.default.error("Attempt to login user with wrong credentials");
            if (user.failedLoginCount === 2) {
                // check if user account is already suspended
                if (user.status == "suspended") {
                }
                await userSchema_1.default.findOneAndUpdate({ email }, { status: "suspended" }, { new: true } // returns the updated document
                );
                if (!req.clientIp) {
                    throw new Error("User ip not found");
                }
                const { location: { regionName }, time, ipAddress, status, } = await (0, checkUserIp_1.getUserIpFunc)(req.clientIp);
                if (status !== "success") {
                    throw new Error("Failed to obtain user ip");
                }
                const option1 = {
                    subject: "Failed Loging Attempt",
                    to: [
                        {
                            email,
                            name: user.fullName,
                        },
                    ],
                    emailTemplate: "failedLoginTemplate",
                    mailData: {
                        companyName: "Online bank assessment",
                        userName: user.fullName,
                        link: `${process.env.SERVER_URL}/api/v1/user/account/suspended/activate/${encryptedId}`,
                        verificationCode: undefined,
                        attemptTime: time,
                        ipAddress: ipAddress,
                        location: regionName,
                    },
                };
                await (0, sendEmail_1.default)(req, res, option1);
                throw new Error("Account suspended, please check your mail to activate account.");
            }
            await userSchema_1.default.findOneAndUpdate({ email }, {
                $inc: {
                    failedLoginCount: 1,
                },
            }, { new: true } // returns the updated document
            );
            return res.status(401).json({
                message: "Invalid user email/password",
                status: false,
            });
        }
        // check if user email is verified
        const { email_verified, fullName } = user;
        if (!email_verified) {
            // create an email verification token
            logger_1.default.info("attempt to create an email verification token");
            const emailVerificationToken = user.createEmailVerificationToken();
            const verifyEmailEndpoint = process.env.SERVER_URL +
                "/api/v1/user" +
                "/emailVerify/" +
                email +
                "/" +
                emailVerificationToken;
            console.log("email verification token", emailVerificationToken);
            const option = {
                subject: "Activate Your Account!",
                emailTemplate: "accountVerification",
                to: [
                    {
                        email: user.email,
                        name: user.fullName,
                    },
                ],
                mailData: {
                    companyName: "Rusca bank",
                    userName: user.fullName,
                    link: verifyEmailEndpoint,
                },
            };
            await (0, sendEmail_1.default)(req, res, option);
            return res.status(201).json({
                message: "Email verification sent",
                status: true,
            });
        }
        const { _id } = user;
        // set jwt token for the user
        const token = jsonwebtoken_1.default.sign({ id: _id }, process.env.JWT_SECRET);
        res.cookie("token", token, {
            maxAge: 24 * 60 * 60 * 1000, // cookie will expire in 24 hours
            httpOnly: true,
            sameSite: "strict",
            secure: false,
        });
        res.status(201).json({
            message: "User loggedIn successfuly",
            status: true,
            user,
        });
    }
    catch (error) {
        logger_1.default.error("Login error", error);
        res.status(500).json({
            message: "Internal server error",
            status: false,
        });
    }
};
exports.loginUserController = loginUserController;
// logout controller
const logOutUserController = async (req, res) => {
    logger_1.default.info("user hit the logout controller");
    try {
        res.cookie("token", "", {
            maxAge: 1,
        });
        return res.status(200).json({
            isAuthenticated: false,
            message: "user logged out",
        });
    }
    catch (error) {
        logger_1.default.error("Logout error", error);
        res.status(500).json({
            message: "Internal server error",
            status: false,
        });
    }
};
exports.logOutUserController = logOutUserController;
// get single user controller
const getSingleUserController = async (req, res) => {
    try {
        logger_1.default.info("User hits the getAllUsersRoutes");
        const { id } = req.params;
        const isIdVallid = (0, mongoose_1.isValidObjectId)(id.toString());
        if (!id || !isIdVallid) {
            return res.status(404).json({
                status: "false",
                message: "User id not found",
            });
        }
        const userFound = await userSchema_1.default.findById(id);
        if (!userFound) {
            return res.status(404).json({
                status: "false",
                message: "User not found",
            });
        }
        return res.status(200).json({
            status: "success",
            user: userFound,
        });
    }
    catch (error) {
        logger_1.default.error("Get single user error", error);
        res.status(500).json({
            message: "Internal server error",
            status: false,
        });
    }
};
exports.getSingleUserController = getSingleUserController;
// get all users controllers
const getAllUsersController = async (req, res) => {
    try {
        logger_1.default.info("User hits the getAllUsersRoutes");
        const { id } = req.params;
        const isIdVallid = (0, mongoose_1.isValidObjectId)(id.toString());
        if (!id || !isIdVallid) {
            return res.status(404).json({
                status: "false",
                message: "User id not found",
            });
        }
        const userFound = await userSchema_1.default.findById(id);
        if (!userFound) {
            return res.status(404).json({
                status: "false",
                message: "User not found",
            });
        }
        return res.status(200).json({
            status: "success",
            user: userFound,
        });
    }
    catch (error) {
        logger_1.default.error("Login error", error);
        res.status(500).json({
            message: "Internal server error",
            status: false,
        });
    }
};
exports.getAllUsersController = getAllUsersController;
// forgot password controller
const forgotPasswordController = async (req, res) => {
    try {
        const { error } = (0, validate_1.forgotPasswordValidation)(req.body);
        if (error) {
            logger_1.default.error("user forgot password email error", error.details[0].message);
            res.status(400).json({
                message: error.details[0].message,
                status: false,
            });
            return;
        }
        const { email } = req.body;
        const foundUser = await userSchema_1.default.findOne({
            email,
        });
        if (!foundUser) {
            return res.status(401).json({
                status: false,
                message: "user not found",
            });
        }
        /* generate 5 digit code fro reset password */
        const code = foundUser.createPasswordResetCode();
        const { email: userEmail, fullName } = foundUser;
        await foundUser.save();
        const message = "Please use this OTP " +
            code +
            " to change your password. OTP expires in one hour";
        const option = {
            subject: "Forgot Password",
            emailTemplate: "forgotPasswordTemplate",
            to: [
                {
                    email: userEmail,
                    name: fullName,
                },
            ],
            mailData: {
                companyName: "online bank assessment",
                userName: fullName,
                link: "",
                verificationCode: code,
            },
        };
        await (0, sendEmail_1.default)(req, res, option);
        logger_1.default.info(`user sent email: ${email} for forgot password`);
        /*  mailSender() */
        res.status(200).json({
            error: false,
            message: "Hi, a change password OTP has been sent to your mail",
            meta: message,
        });
    }
    catch (error) {
        logger_1.default.error("Forgot password error", error);
        res.status(500).json({
            message: "Internal server error",
            status: false,
        });
    }
};
exports.forgotPasswordController = forgotPasswordController;
// change password controller
const changePasswordController = async (req, res) => {
    try {
        const { error } = (0, validate_1.changePasswordValidation)(req.body);
        if (error) {
            logger_1.default.error("user forgot password email error", error.details[0].message);
            res.status(400).json({
                message: error.details[0].message,
                status: false,
            });
            return;
        }
        const { email, token, password } = req.body;
        const foundUser = await userSchema_1.default.findOne({
            email,
        });
        if (!foundUser) {
            return res.status(401).json({
                status: false,
                message: "user not found",
            });
        }
        /* generate 5 digit code */
        const isTokenValid = foundUser.isPasswordResetTokenValid(token);
        if (!isTokenValid) {
            throw new Error("Incorrect or expired OTP");
        }
        const { email: emailSaved, fullName } = foundUser;
        foundUser.password = password;
        foundUser.password_reset_expires = null;
        foundUser.password_reset_expires = null;
        await foundUser.save();
        const option = {
            subject: "Password Update Success",
            emailTemplate: "passwordUpdateSuccessTemplate",
            to: [
                {
                    email: emailSaved,
                    name: fullName,
                },
            ],
            mailData: {
                companyName: "online bank assessment",
                userName: fullName,
                link: "https://ukonuluckyportfolio.vercel.app/",
            },
        };
        (0, sendEmail_1.default)(req, res, option);
        res.status(200).json({
            error: false,
            status: true,
            message: "Password updated successfully",
        });
    }
    catch (error) {
        logger_1.default.error("change password error", error);
        res.status(500).json({
            message: "Internal server error",
            status: false,
        });
    }
};
exports.changePasswordController = changePasswordController;
//delete password controller
const deleteUserController = async (req, res) => {
    try {
        logger_1.default.info("user hits the deleteController");
        const { id } = req.params;
        // check if email and password are sent
        if (!id) {
            throw new Error("Missing user Id");
        }
        // delete user by Id
        const foundUser = await userSchema_1.default.findByIdAndDelete(id);
        if (!foundUser) {
            return res.status(401).json({
                status: false,
                message: "user not found",
            });
        }
        res.status(200).json({
            error: false,
            status: true,
            message: "User deleted successfully",
        });
    }
    catch (error) {
        logger_1.default.error("user deletion error", error);
        res.status(500).json({
            message: "Internal server error",
            status: false,
        });
    }
};
exports.deleteUserController = deleteUserController;
//delete password controller
const changePasswordOTPVerificationController = async (req, res) => {
    try {
        logger_1.default.info("user hits the changePasswordOtpVerificationController");
        // validate user input
        const { error } = (0, validate_1.changePasswordOTPVerificationValidation)(req.body);
        if (error) {
            logger_1.default.error("user chnagePasswordOtpVerification error", error.details[0].message);
            res.status(400).json({
                message: error.details[0].message,
                status: false,
            });
            return;
        }
        const { email, token } = req.body;
        const foundUser = await userSchema_1.default.findOne({
            email
        });
        if (!foundUser) {
            res.status(401).json({
                error: false,
                status: false,
                message: "user not found",
            });
            return;
        }
        /* check if token is valid */
        const isTokenValid = foundUser.isPasswordResetTokenValid(token);
        if (!isTokenValid) {
            throw new Error("Incorrect or expired OTP");
        }
        foundUser.password_reset_expires = null;
        foundUser.password_reset_token = null;
        await foundUser.save();
        res.status(200).json({
            error: false,
            status: "success",
            message: "OTP verified successfully",
            data: {
                email: foundUser.email,
            },
        });
    }
    catch (error) {
        logger_1.default.error("user deletion error", error);
        res.status(500).json({
            message: "Internal server error",
            status: false,
        });
    }
};
exports.changePasswordOTPVerificationController = changePasswordOTPVerificationController;
