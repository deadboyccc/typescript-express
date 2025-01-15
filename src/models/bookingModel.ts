/* eslint-disable @typescript-eslint/no-empty-object-type */
import mongoose, { Document, Model, Schema, Types } from "mongoose"

//UNIMPLEMENTED CUZ NO STRIPE :3
//general interface
interface IBooking {
  tour: Types.ObjectId // Reference to Tour model
  user: Types.ObjectId // Reference to User model
  price: number
}

//document interface extending the booking interface
interface IBookingDocument extends IBooking, Document {}

//model interface extending the booking document
interface IBookingModel extends Model<IBookingDocument> {
  // Add any custom static methods here if needed
}

const bookingSchema: Schema = new Schema<IBookingDocument>({
  tour: {
    select: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tour", // Reference to Tour model
    required: [true, "Booking must belong to a Tour"],
  },
  user: {
    select: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to User model
    required: [true, "Booking must belong to a User"],
  },
  price: {
    type: Number,
    required: [true, "Booking must have a price"],
  },
})

// bookingSchema.pre(
//   /^find/,
//   function (this: Query<IBookingDocument[], IBookingDocument, any>, next) {
//     next()
//   },
// )
const Booking: IBookingModel = mongoose.model<IBookingDocument, IBookingModel>(
  "Booking",
  bookingSchema,
)

export default Booking
