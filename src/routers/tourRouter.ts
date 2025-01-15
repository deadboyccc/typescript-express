import express from "express"
import {
  UpdatePatchTour,
  deleteTourById,
  getTourById,
  getAllTours,
  createTourById,
  top5Tours,
  getToursStats,
  getYearlyPlan,
  getToursWithin,
  getDistances,
  updateTourPhotos,
  resizeTourPhotos,
} from "../controllers/tourControllers"
import { protect, restrict } from "../controllers/authenticationController"
import { reviewRouter } from "../routers/reviewRouter"

//middleware to check param on the router

//middleware on the router(mini app of express) to handle the tours resource/routes
export const toursRouter = express.Router()

//nested tour / review  Route
toursRouter.use("/:tourId/reviews", reviewRouter)
//middleware to check param on the router

//middleware on the router(mini app of express) to handle the tours resource/routes
toursRouter.route("/plan/:year").get(getYearlyPlan)
toursRouter.route("/stats").get(getToursStats)
toursRouter.route("/top5").get(top5Tours, getAllTours)
toursRouter
  .route("/tours-within/:distance/center/:latlng/unit/:unit")
  .get(getToursWithin)
toursRouter.route("/distances/:latlng/unit/:unit").get(getDistances)

toursRouter.route("/").get(getAllTours).post(createTourById)
toursRouter
  .route("/:id")
  .patch(updateTourPhotos, resizeTourPhotos, UpdatePatchTour)
  .delete(protect, restrict("admin", "lead-guide"), deleteTourById)
  .get(getTourById)
