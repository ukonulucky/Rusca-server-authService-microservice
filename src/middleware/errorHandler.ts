import logger from "../utils/logger";
import { ErrorRequestHandler } from "express"


export const errorHandler:ErrorRequestHandler = (err, req, res, next) => { 

    logger.error(err.stack)
    res.status(err.status || 500).json({
        error: err.message || "Internal server error"
    })

}