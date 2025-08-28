"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const express_handlebars_1 = require("express-handlebars");
dotenv_1.default.config();
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const logger_1 = __importDefault(require("./utils/logger"));
const dbConnect_1 = __importDefault(require("./confiq/dbConnect"));
const helmet_1 = __importDefault(require("helmet"));
const rate_limiter_flexible_1 = require("rate-limiter-flexible");
const connectRedis_1 = require("./confiq/connectRedis");
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const path_1 = __importDefault(require("path"));
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
const corsOptions = {
    origin: "*",
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    credentials: true, // Enable credentials (cookies, authorization headers, etc.)
};
app.engine("hbs", (0, express_handlebars_1.engine)({
    extname: '.hbs',
    defaultLayout: false // <- disables layout
})); // instruct express to use engine as the templating engine for any file ending in .hbs
app.set("view engine", "hbs"); // instruct the view engine to search for any file ending with hbs to render to the screeen
app.set("views", path_1.default.join(__dirname, "views")); // instruct express to search for the views folder at path ./views
/* set static files location */
app.use(express_1.default.static(path_1.default.join(__dirname, "public")));
// middleware to record all request and methods
app.use((req, res, next) => {
    logger_1.default.info(`request from ${req.url} having a method of ${req.method}`);
    next();
});
//endpoints
app.get("/", (req, res) => {
    console.log("Root route accessed");
    res.send(`Server running on port ${PORT}`);
});
app.use("/api/auth", userRoutes_1.default);
// route for all other routes
app.use((req, res, next) => {
    res.status(404).json({
        message: "route not found"
    });
});
/* handling all errors */
app.use((err, req, res, next) => {
    const errorMessage = err.message;
    // the stack property tells what area in the application the error happenz
    const stack = err.stack;
    res.status(500).json({
        message: errorMessage,
        stack
    });
});
app.listen(PORT, async () => {
    try {
        const res = await (0, dbConnect_1.default)();
        if (res) {
            logger_1.default.info("MongoDb  connected successfully");
        }
        logger_1.default.info(`App started at port ${PORT}`);
    }
    catch (error) {
        logger_1.default.error(`Application error, ${error}`);
        console.log(`Application erorr occured`, error);
        process.exit();
    }
});
