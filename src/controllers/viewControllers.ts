/* eslint-disable @typescript-eslint/no-unused-vars */
import { RequestHandler } from "express"
import catchAsync from "../utils/catchAsync"
import { Tour } from "../models/tourModel"
//basic view controller (testing)
export const baseController: RequestHandler = (req, res) => {
  res.status(200).render("base", {
    title: "Base",
    description:
      "Discover the hidden gems of our beautiful and adventurous country",
  })
}
export const overviewController: RequestHandler = catchAsync(
  async (req, res, next) => {
    //1)get tour data from our DB
    const tours = await Tour.find()
    //2)build template
    //3)render template
    res.status(200).render("overview", {
      title: "Overview | All Tours",
      tours,
    })
  },
)

export const tourController: RequestHandler = catchAsync(
  async (req, res, next) => {
    const tour = await Tour.findById(req.params.id)
    res.status(200).render("tour", {
      title: "The Forrest Hiker",
      tour,
    })
  },
)

export const login: RequestHandler = catchAsync(async (req, res, next) => {
  res.status(200).render("login", {
    title: "login",
  })
})
export const updateUser: RequestHandler = catchAsync(async (req, res, next) => {
  res.status(200).render("update", {
    title: "Update User",
  })
})
