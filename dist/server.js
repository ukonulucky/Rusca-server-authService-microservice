"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const logger_1 = __importDefault(require("./utils/logger"));
const dbConnect_1 = __importDefault(require("./confiq/dbConnect"));
const helmet_1 = __importDefault(require("helmet"));
const rate_limiter_flexible_1 = require("rate-limiter-flexible");
const connectRedis_1 = require("./confiq/connectRedis");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
console.log("environment variables", process.env.REDIS_URL);
// middleware 
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// setting up a redis client
const redisClient = (0, connectRedis_1.connectRedisDbFunc)();
// setup a rate limiter for redis
const redisRateLimitClient = new rate_limiter_flexible_1.RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: "rateLimitRedis",
    duration: 1,
    points: 5
});
// create a middleware for the radis rate limiter
app.use(async (req, res, next) => {
    try {
        logger_1.default.warn("Checking for rate limit");
        if (!req.ip)
            throw new Error("req.ip not found");
        await redisRateLimitClient.consume(req.ip);
        next();
    }
    catch (error) {
        res.status(429).json({
            message: `Error in connecting to redis:, ${error}`
        });
    }
});
app.listen(async () => {
    try {
        await (0, dbConnect_1.default)();
        logger_1.default.warn(`App started at port ${PORT}`);
    }
    catch (error) {
        logger_1.default.error(`Application error, ${error}`);
        console.log(`Application erorr occured`, error);
        process.exit();
    }
});
