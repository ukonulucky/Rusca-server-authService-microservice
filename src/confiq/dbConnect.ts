import mongoose from "mongoose"
import logger from "../utils/logger"

const MUNGU_URL = process.env.MUNGU_DB


const dbConnectFunc = async () => { 
    try {
        logger.info("DB connection started")
        if (!MUNGU_URL) { 
            logger.warn("MUNGU_DB error:", "No MUNGU_URL found")
            throw new Error("No MUNGU_URL found")
        }
        const res = await mongoose.connect(MUNGU_URL)
        return res
    } catch (error) {
        logger.error("DB error:", error)
        console.log(`MUNGU_DB ERORR:`,error)
    }
}

export default dbConnectFunc