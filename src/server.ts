import dotenv from "dotenv"
import { engine } from "express-handlebars"
dotenv.config()
import cors from "cors"
import express, { NextFunction, Response, Request } from "express"
import logger from "./utils/logger"
import dbConnectFunc from "./confiq/dbConnect"
import helmet from "helmet"
import { RateLimiterRedis } from "rate-limiter-flexible"
import { connectRedisDbFunc } from "./confiq/connectRedis"
import userRouter from "./routes/userRoutes"
import path from "path"



const app = express()
const PORT = process.env.PORT || 5000
console.log("environment variables", process.env.REDIS_URL)



const corsOptions = {
    origin:"*",
    methods: ["GET","HEAD","PUT","PATCH","POST","DELETE"],
    credentials: true, // Enable credentials (cookies, authorization headers, etc.)
}
// middleware 
app.use(helmet())
app.use(cors(corsOptions))
app.use(express.json())

// setting up a redis client
const redisClient = connectRedisDbFunc()

// setup a rate limiter for redis
const redisRateLimitClient = new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: "rateLimitRedis",
    duration: 1,
    points: 5
})

// create a middleware for the radis rate limiter
app.use(async (req, res, next) => { 
    try {
       logger.warn("Checking for rate limit")
    if(!req.ip) throw new Error("req.ip not found")
         await redisRateLimitClient.consume(req.ip)
       next()
   } catch (error) {
       res.status(429).json({
           message:`Error in connecting to redis:, ${error}`
       })
   }
})




app.engine("hbs", engine({
    extname: '.hbs',
    defaultLayout: false // <- disables layout
  }))  // instruct express to use engine as the templating engine for any file ending in .hbs

app.set("view engine", "hbs") // instruct the view engine to search for any file ending with hbs to render to the screeen
 
app.set("views", path.join(__dirname,"views"))  // instruct express to search for the views folder at path ./views

 /* set static files location */
app.use(express.static(path.join(__dirname, "public")))
 

// middleware to record all request and methods
app.use((req, res, next) => { 
    logger.info(`request from ${req.url} having a method of ${req.method}`)
    next()
})

//endpoints

app.get("/", (req, res) => { 
    console.log("Root route accessed now");
    res.send(`Server running on port ${PORT}`)
 })
app.use("/api", userRouter)

// route for all other routes
app.use((req: Request, res: Response, next: NextFunction) => {
    res.status(404).json({
        message:"route not found"
    })
})


/* handling all errors */
app.use((err:Error, req:Request, res:Response, next:NextFunction) => {
    const errorMessage = err.message
    // the stack property tells what area in the application the error happenz
    const stack = err.stack
res.status(500).json({
    message: errorMessage,
    stack })
})



app.listen(PORT, async() => { 
    try {
     
        const res = await dbConnectFunc()
        if (res) { 
            logger.info("MongoDb  connected successfully")
        }
        logger.info(`App started at port ${PORT}`)
        
    } catch (error) {
        logger.error(`Application error, ${error}`)
        console.log(`Application erorr occured`, error)
        process.exit()
    }
})