"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const argon2_1 = __importDefault(require("argon2"));
const userSchema = new mongoose_1.default.Schema({
    userName: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        Default: Date.now()
    }
}, {
    timestamps: true
});
userSchema.pre("save", async function (next) {
    try {
        if (this.isModified("password")) {
            this.password = await argon2_1.default.hash(this.password);
            await this.save();
            next();
        }
    }
    catch (error) {
        next(error);
    }
});
userSchema.methods.comparePassword = async function (userPassword) {
    try {
        return await argon2_1.default.verify(this.password, userPassword);
    }
    catch (error) {
        throw new Error(error);
    }
};
// enables one to carry out text search on the field userName
userSchema.index({
    userName: "text"
});
const userModel = mongoose_1.default.model("User", userSchema);
exports.default = userModel;
