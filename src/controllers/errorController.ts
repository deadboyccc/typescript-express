import { Request, Response } from "express"
import { AppError } from "../utils/appError"

//error controller documented using Doxgen + auto AI doc (test)
/**
 * Handles database cast errors (e.g., invalid ID format).
 * @param err - The error object from the database.
 * @returns A new appError instance with a user-friendly message.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function handleCastErrorDB(err: Record<string, any>): AppError {
  const message = `Invalid ${err.path}: ${err.value}`
  return new AppError(message, 400)
}
function handleDuplicateFieldsDB(err: AppError) {
  const x = err.errmsg?.match(/"[^"]*"/)?.at(0)
  const message = `duplicate field value as ${x}, Please use another value!`
  return new AppError(message, 400)
}
function handleValidationErrorDB(err: AppError) {
  const errors = Object.values(err.errors ?? {}).map((el) => el.message)

  const message = `Validation failed: ${errors.join("  &&  ")}`
  return new AppError(message, 400)
}
/**
 *
 * Handles errors in production mode.
 * @param err - The appError instance representing the error.
 * @param res - The Express response object.
 */
function sendErrorProd(err: AppError, res: Response): void {
  if (err.isOperational) {
    // Operational errors: Send full error details to the client
    res.status(err.statusCode || 500).json({
      status: "error",
      message: err.message || "An unexpected error occurred",
      // stack: err.stack, // Include stack trace for debugging
      // error: err, // Full error object
    })
  } else {
    // Programming or unknown errors: Hide details for security reasons
    console.error("ERROR 💀💀", err) // Log the error to the console
    res.status(500).json({
      status: "error",
      message: "An unexpected error occurred",
    })
  }
}

/**
 * Handles errors in development mode.
 * @param err - The appError instance representing the error.
 * @param res - The Express response object.
 */
function sendErrorDev(err: AppError, res: Response, req: Request): void {
  if (req.originalUrl.startsWith("/api")) {
    res.status(err.statusCode || 500).json({
      status: err.status || "error",
      message: err.message || "An unexpected error occurred",
      stack: err.stack, // Include stack trace for detailed debugging
      error: err,
    })
  } else {
    res.status(err.statusCode || 500).render("error", {
      title: "Error 40x | something went wrong",
      message: err.message || "An unexpected error occurred",
    })
  }
}

/**
 * Global error-handling middleware for Express.
 * @param err - The appError instance or any error.
 * @param req - The Express request object.
 * @param res - The Express response object.
 * @param next - The Express next middleware function.
 */
const errorHandler = (err: AppError, req: Request, res: Response): void => {
  // Determine the environment and handle errors accordingly
  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res, req)
  } else if (process.env.NODE_ENV === "production") {
    let error = { ...err }

    // Handle specific error types (e.g., database-related)
    if (err.name === "CastError") error = handleCastErrorDB(err)
    if (err.code === 11000) error = handleDuplicateFieldsDB(err)
    if (err.name === "ValidationError") error = handleValidationErrorDB(err)
    if (err.name === "JsonWebTokenError") error = handleJWTError()
    if (err.name === "TokenExpiredError") error = handleJWTExpired()
    // Send a production-friendly error response
    sendErrorProd(error as AppError, res)
  }
}

function handleJWTError() {
  return new AppError("Json Web Token invalid! Please login again.", 401)
}
function handleJWTExpired() {
  return new AppError("Json Web Token expired! Please login again.", 401)
}
export default errorHandler
