import compression from "compression"
import cookieParser from "cookie-parser"
import cors from "cors"
import express from "express"
import mongoSanitize from "express-mongo-sanitize"
import rateLimit from "express-rate-limit"
import helmet from "helmet"
import hpp from "hpp"
import morgan from "morgan"
import path from "path"
import { AppError } from "./utils/appError"
import { bookingRouter } from "./routers/bookingRouter"
import errorController from "./controllers/errorController"
import { reviewRouter } from "./routers/reviewRouter"
import sanitizeRequestBody from "./utils/sanitizeRequestBody"
import { toursRouter } from "./routers/tourRouter"
import { userRouter } from "./routers/userRouter"
import { viewRouter } from "./routers/viewRouter"

//initiating the express instance
export const app = express()

//using the CORS middle ware
app.use(cors())

//settings the view engine to pug and adding the static public path
app.set("view engine", "pug")
app.set("views", path.join(__dirname, "views"))
app.use(express.static(path.join(__dirname, "public"))) // Correct!

//Global MiddleWare
//security
//using the helmet middleware to secure express headers
app.use(helmet({}))

//Limiter to prevent possible DDSOS
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests! please try again in an hour!",
})
app.use("/api", limiter)

// compression with sane options
app.use(
  compression({
    level: 6, //1-9
    threshold: 1024, // Only compress responses larger than 1KB
    filter: (_req, res) => {
      // Compress only text-based content (HTML, JSON, etc.) (not for images)
      const contentType = res.getHeader("Content-Type")
      return (
        typeof contentType === "string" &&
        /json|text|javascript|css|xml/.test(contentType)
      )
    },
  }),
)

//logger works
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"))
}
//JSON and coookie parsers
app.use(express.json({ limit: "30kb" }))
app.use(cookieParser())

//custom log
app.use((req, res, next) => {
  // console.log(`Method: ${req.method} URL: ${req.url}`)
  // console.log("cookies:", req.cookies)
  next()
})

//nosql inject and XXS
app.use(mongoSanitize())
//data sanitization after getting req.body to function on, prevent html injections into db
app.use(sanitizeRequestBody)
//404 not found
app.use(
  hpp({
    whitelist: [
      "duration",
      "difficulty",
      "ratingAverage",
      "ratingQuantity",
      "price",
      "maxGroupSize",
    ],
  }),
)

//rendering pages
app.use("/", viewRouter)

//routes and routers
app.use("/api/v1/tours", toursRouter)
app.use("/api/v1/users", userRouter)
app.use("/api/v1/reviews", reviewRouter)
app.use("/api/v1/bookings", bookingRouter)

//clean the url (params) preventing duplicate params (security )
app.all("*", (req, res, next) => {
  next(new AppError(`404 URL path not found :${req.originalUrl}`, 404))
})

//global errorController / handler
app.use(errorController)
