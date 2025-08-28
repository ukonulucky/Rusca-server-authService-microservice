"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const refreshTokenSchema = new mongoose_1.default.Schema({
    token: {
        type: String,
        required: true,
        unique: true
    },
    user: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    expiresAt: {
        type: Date,
        required: true
    }
}, {
    timestamps: true
});
// TTL index to auto-delete expired tokens when the expiresAt time is reached
refreshTokenSchema.index({
    expiresAt: 1
}, {
    expireAfterSeconds: 0
});
const refreshTokenModal = mongoose_1.default.model("RefreshToken", refreshTokenSchema);
exports.default = refreshTokenModal;
