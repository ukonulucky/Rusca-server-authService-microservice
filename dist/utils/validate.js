"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerValidation = void 0;
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
