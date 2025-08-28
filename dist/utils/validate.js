"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePasswordOTPVerificationValidation = exports.changePasswordValidation = exports.forgotPasswordValidation = exports.loginValidation = exports.registerValidation = void 0;
const joi_1 = __importDefault(require("joi"));
const registerValidation = (data) => {
    const schema = joi_1.default.object({
        userName: joi_1.default.string().min(3).max(15).required(),
        email: joi_1.default.string().email().required(),
        password: joi_1.default.string().min(5).max(15).required()
    });
    return schema.validate(data);
};
exports.registerValidation = registerValidation;
const loginValidation = (data) => {
    const schema = joi_1.default.object({
        email: joi_1.default.string().email().required(),
        password: joi_1.default.string().min(5).max(15).required(),
        fullName: joi_1.default.string(),
        role: joi_1.default.string()
    });
    return schema.validate(data);
};
exports.loginValidation = loginValidation;
const forgotPasswordValidation = (data) => {
    const schema = joi_1.default.object({
        email: joi_1.default.string().email().required()
    });
    return schema.validate(data);
};
exports.forgotPasswordValidation = forgotPasswordValidation;
const changePasswordValidation = (data) => {
    const schema = joi_1.default.object({
        email: joi_1.default.string().email().required(),
        token: joi_1.default.string().required(),
        password: joi_1.default.string().required(),
    });
    return schema.validate(data);
};
exports.changePasswordValidation = changePasswordValidation;
const changePasswordOTPVerificationValidation = (data) => {
    const schema = joi_1.default.object({
        email: joi_1.default.string().email().required(),
        token: joi_1.default.string().required()
    });
    return schema.validate(data);
};
exports.changePasswordOTPVerificationValidation = changePasswordOTPVerificationValidation;
