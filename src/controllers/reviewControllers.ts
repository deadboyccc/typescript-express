/* eslint-disable @typescript-eslint/no-explicit-any */
import catchAsync from "../utils/catchAsync"
import {
  createOne,
  deleteOne,
  getOne,
  updateOne,
} from "..//utils/handlerFactory"
import { Review } from "../models/reviewModel"

//REVIEW CONTROLLERS BASIC REST API OPERATIONS USING THE FACTORY TEMPLATE
export const getAllReviews = catchAsync(async (req, res) => {
  let filter: Record<any, any> = {}

  if (req.params.tourId) {
    filter = { tour: req.params.tourId }
  }
  const reviews = await Review.find(filter)
  res.status(200).json({
    status: "sucess",
    count: reviews.length,
    data: {
      reviews,
    },
  })
})
export const setReviewTourUserId = catchAsync(async (req, res, next) => {
  if (!req.body.user) req.body.user = req.user.id
  if (!req.body.tour) req.body.tour = req.params.tourId
  next()
})

export const createReview = createOne(Review)
export const deleteReviewById = deleteOne(Review)
export const updateReview = updateOne(Review)
export const getReviewById = getOne(Review)
// export const getAllReviews = getAll(Review)
