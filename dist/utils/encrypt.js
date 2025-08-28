"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.encrypt = encrypt;
const crypto_1 = __importDefault(require("crypto"));
const algorithm = 'aes-256-cbc';
const secretKey = Buffer.from(process.env.JWT_SECRET, 'base64');
function toBase64url(input) {
    return input.toString('base64')
        .replace(/\+/g, '-') // plus to dash
        .replace(/\//g, '_') // slash to underscore
        .replace(/=+$/, ''); // remove trailing =
}
function encrypt(text) {
    if (!secretKey)
        throw new Error("No secretKey");
    const iv = crypto_1.default.randomBytes(16);
    const cipher = crypto_1.default.createCipheriv(algorithm, secretKey, iv);
    const encrypted = Buffer.concat([cipher.update(text.toString(), 'utf8'), cipher.final()]);
    const combined = Buffer.concat([iv, encrypted]);
    return toBase64url(combined).toString();
}
