import express from "express"
import { protect } from "../controllers/authenticationController"
import { createBooking, getAllBookings } from "../controllers/bookingController"

export const bookingRouter = express.Router()

bookingRouter.route("/").get(protect, getAllBookings)

bookingRouter.route("/:tourId").post(protect, createBooking)
