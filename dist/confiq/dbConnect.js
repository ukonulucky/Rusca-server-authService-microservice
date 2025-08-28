"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const logger_1 = __importDefault(require("../utils/logger"));
const MUNGU_URL = process.env.MUNGU_DB;
const dbConnectFunc = async () => {
    try {
        logger_1.default.warn("DB connection started");
        if (!MUNGU_URL) {
            logger_1.default.warn("MUNGU_DB error:", "No MUNGU_URL found");
            throw new Error("No MUNGU_URL found");
        }
        const res = await mongoose_1.default.connect(MUNGU_URL);
        return res;
    }
    catch (error) {
        logger_1.default.error("DB error:", error);
        console.log(`MUNGU_DB ERORR:`, error);
    }
};
exports.default = dbConnectFunc;
