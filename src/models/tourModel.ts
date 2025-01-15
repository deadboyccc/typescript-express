/* eslint-disable @typescript-eslint/no-empty-object-type */
import mongoose, { Document, Model, Query, Schema } from "mongoose"
import slugify from "slugify"

// Define the interface for the document
export interface ITourDocument extends Document {
  name: string
  duration: number
  maxGroupSize: number
  difficulty: "easy" | "medium" | "difficult"
  ratingAverage: number
  ratingQuantity: number
  price: number
  priceDiscount?: number
  summary: string
  description?: string
  imageCover: string
  images?: string[]
  createdAt: Date
  startDates?: Date[]
  durationWeek?: number // Virtual property
  slug?: string
  secretTour?: boolean
  startLocation: object
  locations: number[]
  guides: string[]
}
export interface ITourModel extends Model<ITourDocument> {}

const tourSchema = new Schema<ITourDocument>(
  {
    //referencing
    guides: [{ type: mongoose.Schema.ObjectId, ref: "User" }],
    startLocation: {
      type: {
        type: String,
        default: "Point", // Ensure the type is "Point"
        enum: ["Point"], // GeoJSON type is case-sensitive
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
        validate: {
          validator: function (val: number[]) {
            return val.length === 2 // Ensure it's exactly two numbers
          },
          message:
            "Coordinates must contain exactly two values: [longitude, latitude].",
        },
      },
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: "Point",
          enum: ["Point"], // GeoJSON type is case-sensitive
        },
        coordinates: {
          type: [Number], // [longitude, latitude]
          required: true,
          validate: {
            validator: function (val: number[]) {
              return val.length === 2 // Ensure it's exactly two numbers
            },
            message:
              "Coordinates must contain exactly two values: [longitude, latitude].",
          },
        },
        address: String,
        description: String,
      },
    ],
    secretTour: {
      type: Boolean,
      default: false,
    },
    name: {
      type: String,
      trim: true,
      unique: true,
      required: [true, "Name is required"],
      minlength: 8,
      maxlength: 80,
    },
    duration: {
      type: Number,
      required: [true, "Duration is required"],
    },
    maxGroupSize: {
      type: Number,
      required: [true, "Group size is required"],
    },
    difficulty: {
      type: String,
      required: [true, "Difficulty is required"],
      enum: {
        values: ["easy", "medium", "difficult"],
        message: "Difficulty is either: easy, medium, difficult",
      },
    },
    ratingAverage: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
      set: (value: number) => Math.round(value * 10) / 10,
    },
    ratingQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: 1,
      max: 10000,
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (this: ITourDocument, value: number) {
          return value < this.price
        },
        message:
          "Discount price ({VALUE}) should be less than the original price ({REF}).",
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, "Summary is required"],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, "Cover image is required"],
      select: true,
    },
    images: {
      type: [String],
      select: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      select: false,
    },
    startDates: {
      type: [Date],
      select: false,
    },
    slug: {
      type: String,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

//adding index so we order query by price it doesn't have to process all fiels, it will have them already sorted
// tourSchema.index({ price: 1, ratingAverge: -1 })
// tourSchema.index({ slug: 1 })
// tourSchema.index({ 'locations.coordinates': '2dsphere' })
//indexing the 2dsphere is necessary for geo data process!
tourSchema.index({ startLocation: "2dsphere" })

// Define the virtual property for `durationWeek` not persistant on db rather on api GET requests
tourSchema.virtual("durationWeek").get(function (this: ITourDocument) {
  const a = this.duration / 7
  return a.toFixed(2) // Convert duration to weeks
})
//instead of populating and adding data to disk create virtual populate
tourSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "tour",
  localField: "_id",
})
//middleware for the mongodb pipeline of certain actions like saving finding (querying )
tourSchema.pre("save", function (this: ITourDocument, next) {
  this.slug = slugify(this.name, { lower: true })
  next()
})
//embedding (bad practice)
// tourSchema.pre('save', async function (this: ITour, next) {
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id))
//   this.guides = (await Promise.all(guidesPromises)) as unknown as string[]
//   next()
// })
//pre-find query middlewaare (remove secret tours)
tourSchema.pre("find", function (this, next) {
  this.find({ secretTour: { $ne: true } })
  next()
})
//populate before queries
tourSchema.pre(
  /^find/,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function (this: Query<ITourDocument[], ITourDocument, any>, next) {
    this.populate({
      path: "guides",
      select: "-__v -photo",
    })
    this.populate({
      path: "reviews",
      select: "review rating user",
    })
    next()
  },
)

// Export the model
export const Tour: ITourModel = mongoose.model<ITourDocument, ITourModel>(
  "Tour",
  tourSchema,
)
