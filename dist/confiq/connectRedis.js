"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectRedisDbFunc = void 0;
const logger_1 = __importDefault(require("../utils/logger"));
const ioredis_1 = __importDefault(require("ioredis"));
const connectRedisDbFunc = () => {
    if (!process.env.REDIS_URL) {
        logger_1.default.warn("failed to connect to redis: REDIS_URL is not defined");
        throw new Error("failed to connect to redis: REDIS_URL is not defined");
    }
    // Use Redis URL from environment variable
    const redisClient = new ioredis_1.default(process.env.REDIS_URL);
    // Handle Redis connection errors
    redisClient.on('error', (err) => {
        logger_1.default.error("Redis connection error: " + err.message);
        throw new Error("Failed to connect to Redis: " + err.message);
    });
    redisClient.on('connect', () => {
        logger_1.default.info("Successfully connected to Redis");
    });
    redisClient.on('ready', () => {
        logger_1.default.info("Redis client is ready");
    });
    redisClient.on('close', () => {
        logger_1.default.info("Redis connection closed");
    });
    return redisClient;
};
exports.connectRedisDbFunc = connectRedisDbFunc;
