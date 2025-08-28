import logger from "../utils/logger"
import Redis from "ioredis"

export const connectRedisDbFunc = () => {
    
    if (!process.env.REDIS_URL) {
        logger.warn("failed to connect to redis: REDIS_URL is not defined")
        throw new Error("failed to connect to redis: REDIS_URL is not defined")
    }

    // Use Redis URL from environment variable
    const redisClient = new Redis(process.env.REDIS_URL);

    // Handle Redis connection errors
    redisClient.on('error', (err) => {
        logger.error("Redis connection error: " + err.message);
        throw new Error("Failed to connect to Redis: " + err.message);
    });

    redisClient.on('connect', () => {
        logger.info("Successfully connected to Redis");
    });

    redisClient.on('ready', () => {
        logger.info("Redis client is ready");
    });

    redisClient.on('close', () => {
        logger.info("Redis connection closed");
    });

    return redisClient;
}
