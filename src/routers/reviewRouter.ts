import express from "express"
import { protect, restrict } from "../controllers/authenticationController"
import {
  createReview,
  deleteReviewById,
  getAllReviews,
  getReviewById,
  setReviewTourUserId,
  updateReview,
} from "../controllers/reviewControllers"

export const reviewRouter = express.Router({ mergeParams: true })

reviewRouter
  .route("/")
  .get(getAllReviews)
  .post(protect, restrict("user"), setReviewTourUserId, createReview)
reviewRouter
  .route("/:id")
  .delete(deleteReviewById)
  .patch(updateReview)
  .get(getReviewById)
