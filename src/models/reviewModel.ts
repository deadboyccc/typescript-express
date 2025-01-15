/* eslint-disable @typescript-eslint/no-unused-vars */
import mongoose, { Model, Query } from "mongoose"

// Interface for Review data (optional but recommended for type safety)
export interface IReviewDocument {
  review: string
  rating: number
  createdAt: Date
  user: mongoose.Schema.Types.ObjectId | string // Can be either ObjectId or string
  tour: mongoose.Schema.Types.ObjectId | string // Can be either ObjectId or string
}
//cleaner imo
export interface IReviewModel extends Model<IReviewDocument> {
  calculateAverageRating: (tourId: string) => Promise<void>
}
// export interface IReviewModel extends Model<IReviewDocument> {
//   calculateAverageRating(tourId: string): Promise<void> // Correct signature
// }

// Define the review schema
export const reviewSchema = new mongoose.Schema<IReviewDocument>(
  {
    review: {
      type: String,
      trim: true,
      required: [true, "Review text is required!"],
      minlength: 8,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 1,
      required: [true, "Review rating is required!"],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Review must have an author (user)!"],
    },
    tour: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tour",
      required: [true, "Review must be related to a tour!"],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

//adding indexes on tour and users (unique = true)
//cuz each user should review a tour ONCE
reviewSchema.index({ tour: 1, user: 1 }, { unique: true })

reviewSchema.pre(
  /^findOneAnd/,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function (this: Query<IReviewDocument[], IReviewDocument, any>) {
    const reviews = await this.findOne()
  },
)
// Populate user information on `find` queries
reviewSchema.pre(
  /^find/,
  function (this: Query<IReviewDocument[], IReviewDocument>, next) {
    this.populate({
      path: "user",
      select: "name",
    })
    next()
  },
)

// Static method to calculate average ratings using the aggregation pipeline
reviewSchema.statics.calculateAverageRating = async function (tourId: string) {
  const stats = await this.aggregate([
    { $match: { tour: new mongoose.Types.ObjectId(tourId) } },
    {
      $group: {
        _id: "$tour",
        nRating: { $sum: 1 },
        averageRating: { $avg: "$rating" },
      },
    },
  ])

  //if there exists stats :
  if (stats.length > 0) {
    // Update the Tour document with the new stats (adjust model accordingly)
    await mongoose.model("Tour").findByIdAndUpdate(tourId, {
      ratingQuantity: stats[0].nRating,
      ratingAverage: stats[0].averageRating,
    })
  } else {
    //if not stats
    // Set default values if no reviews exist
    await mongoose.model("Tour").findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5, // Default rating
    })
  }
}

// Call `calculateAverageRating` after a new review is saved
//after the review being saved to ensure that the average is updated and synced with the current avail data !
reviewSchema.post("save", function (doc: IReviewDocument) {
  ;(doc.constructor as IReviewModel).calculateAverageRating(doc.tour.toString())
})
//DOESN'T TRIGGER SAVE MIDDLE WARE
//findByIdAndUpdate
//findByIdAndDelete
// Export the model
export const Review: IReviewModel = mongoose.model<
  IReviewDocument,
  IReviewModel
>("Review", reviewSchema)
