import Booking from "../models/bookingModel"
import catchAsync from "../utils/catchAsync"
import { Tour } from "../models/tourModel"

//UMIMPLEMENTED BECAUSE STRIPE DOESN'T WORK IN THIS BEAUTIFUL PLACE PPL :D
//simple create a booking controller
export const createBooking = catchAsync(async (req, res) => {
  // 1) Get the tour from the request params
  const tour = await Tour.findById(req.params.tourId)
  //2)create the booking based on the tour queried above and the user attached to the reqest body by the protect auth middleware
  const booking = await Booking.create({
    user: req.user.id,
    tour: tour?.id,
    price: tour?.price,
  })
  //3) send back the booking
  res.status(201).json({
    status: "sucessful",
    booking,
  })
})

//simple get all boookings controller
export const getAllBookings = catchAsync(async (req, res) => {
  // 1) Get all bookings
  const bookings = await Booking.find()
  // .populate({
  //   path: "user",
  //   select: "name -_id", // Include 'name', exclude '_id'
  // })
  // .populate({
  //   path: "tour",
  //   select: "name -_id", // Include 'name', exclude '_id'
  // })

  // 2) Send back the bookings
  res.status(200).json({
    status: "successful",
    data: bookings,
  })
})
