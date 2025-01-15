/* eslint-disable @typescript-eslint/no-unused-vars */
import { RequestHandler } from "express"
import multer from "multer"
import { AppError } from "../utils/appError"
import catchAsync from "../utils/catchAsync"
import { getAll, getOne } from "../utils/handlerFactory"
import { Tour } from "../models/tourModel"
import sharp from "sharp"

//BASIC REST API IMPLEMENTATION OF THE TOUR RESROUCES
//using the factory (test)
export const getAllTours = getAll(Tour)
export const getTourById = getOne(Tour, { path: "reviews" })
export const createTourById: RequestHandler<{ id: string }> = catchAsync(
  async (req, res, next) => {
    const newTour = await Tour.create(req.body)

    //done post creating(successful post)
    res.status(201).json({
      status: "success",
      message: "New tour created",
      data: newTour,

      // data: (req.body as { text: string }).text,
    })
  },
)

export const UpdatePatchTour: RequestHandler<{ id: string }> = catchAsync(
  async (req, res, next) => {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
    if (!tour) {
      return next(new AppError(`${req.params.id} is not a valid id`, 404))
    }
    res //wrote something /update
      .status(200)
      .json({ status: "success", message: "New tour created", data: tour })
  },
)

export const deleteTourById: RequestHandler<{ id: string }> = catchAsync(
  async (req, res, next) => {
    const tour = await Tour.findByIdAndDelete(req.params.id)
    if (!tour) {
      return next(new AppError(`${req.params.id} is not a valid id`, 404))
    }
    //204 (nothing retured)= DELETE , 200 = GET-PATCH, 201 = POST
    //400=bad request(DELETE,POST,PATCH), 404 not found (GET)
    res.status(204).json({
      status: "success",
      data: null,
    })
  },
)

//alias for top5 tours (highest rated and cheapest)
export const top5Tours: RequestHandler = (req, res, next) => {
  req.query.limit = "5"
  req.query.sort = "-ratingAverage,price"
  req.query.fields = "name,price,ratingAverage"
  next()
}

export const getToursStats: RequestHandler = catchAsync(
  async (req, res, next) => {
    const stats = await Tour.aggregate([
      {
        $match: { ratingAverage: { $gte: 4.8 } },
      },
      {
        $group: {
          _id: { $toUpper: "$difficulty" },
          toursCount: { $sum: 1 },
          ratingsCount: { $sum: "$ratingQuantity" },
          ratingAvg: { $avg: "$ratingAverage" },
          averagePrice: { $avg: "$price" },
          maxPrice: { $max: "$price" },
          minPrice: { $min: "$price" },
        },
      },
      {
        $sort: { averagePrice: 1 },
      },
    ])
    res.status(200).json({ status: "success", data: { stats } })
  },
)

//get yearly plan endpoint
export const getYearlyPlan: RequestHandler = catchAsync(
  async (req, res, next) => {
    const year = req.params.year
    const plan = await Tour.aggregate([
      {
        $unwind: "$startDates",
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: "$startDates" },
          tourCount: { $sum: 1 },
          // tours: { $push: '$name' },
        },
      },
      {
        $addFields: { month: "$_id" },
      },
      {
        $project: { _id: 0 },
      },
      {
        $sort: { tourCount: -1 },
      },
    ])
    res
      .status(200)
      .json({ status: "success", results: plan.length, data: { plan } })
  },
)
// /tours-within/:distance/center/33.297330220691705, 44.33381409260888/units/:unit
//latlng = -1231,8391231 as string
// Handler to get tours within a certain distance using geo processes of mongodb
export const getToursWithin: RequestHandler = catchAsync(
  async (req, res, next) => {
    const { distance, latlng, unit } = req.params

    // Ensure latlng is provided and properly formatted
    if (!latlng) {
      return next(new AppError("Coordinates (center) must be provided!", 400))
    }

    const [lat, lng] = latlng.split(",").map((coord) => coord.trim())
    if (!lat || !lng) {
      return next(
        new AppError("Invalid coordinates format! Provide as lat,lng.", 400),
      )
    }

    // Validate and calculate radius based on the unit
    const radius =
      unit === "mi"
        ? Number(distance) / 3963.22
        : unit === "km"
          ? Number(distance) / 6378.1
          : null

    if (!radius) {
      return next(
        new AppError(
          'Invalid unit! Use "mi" for miles or "km" for kilometers.',
          400,
        ),
      )
    }

    // Fetch tours within the calculated radius
    let tours = await Tour.find({
      startLocation: {
        $geoWithin: { $centerSphere: [[Number(lng), Number(lat)], radius] },
      },
    })
    if (!tours)
      tours = await Tour.find({
        "startLocation.coordinates": {
          $geoWithin: {
            $centerSphere: [
              [87.75925191170106, -43.580390855607845],
              0.6470744359781887,
            ],
          },
        },
      })
    // Send the response
    res.status(200).json({
      status: "success",
      results: tours.length,
      data: tours,
      distance,
      lat,
      lng,
      unit,
      radius,
    })
  },
)
// /distances/:latlng/unit/:unit
//get tours within a certain distance
export const getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params

  const distanceMultiplier =
    unit === "mi" ? 0.0006213 : unit === "km" ? 0.001 : null

  // Ensure latlng is provided and properly formatted
  if (!latlng) {
    return next(new AppError("Coordinates must be provided!", 400))
  }

  const [lat, lng] = latlng.split(",").map((coord) => coord.trim())
  if (!lat || !lng) {
    return next(
      new AppError("Invalid coordinates format! Provide as lat,lng.", 400),
    )
  }
  const distances = await Tour.aggregate([
    //need to be first
    {
      $geoNear: {
        near: {
          type: "Point",
          coordinates: [+lng, +lat],
        },
        distanceField: "distance",
        distanceMultiplier: Number(distanceMultiplier),
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ])
  res.status(200).json({
    status: "success",
    results: distances.length,
    data: {
      data: distances,
    },
  })
})

//upload a tour coverimage or images
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter(req, file, cb) {
    // Check if the file is an image
    if (file.mimetype.startsWith("image")) {
      cb(null, true) // Accept the file
    } else {
      // Reject the file with an error
      cb(null, false)
    }
  },
})
export const updateTourPhotos = upload.fields([
  { name: "imageCover", maxCount: 1 },
  {
    name: "images",
    maxCount: 3,
  },
])

//resize uploaded images and validatiing
export const resizeTourPhotos = catchAsync(async (req, res, next) => {
  //getting the fiels as multer array types
  const files = req.files as {
    imageCover?: Express.Multer.File[]
    images?: Express.Multer.File[]
  }
  //if none
  if (!files.imageCover || !files.images) return next()

  //COVER IMAGE handling
  const coverImgName = `tour-${req.params.id}-${Date.now()}-cover.jpeg` // Construct the filename
  await sharp(files.imageCover[0].buffer)
    .resize(300, 300)
    .toFormat("jpeg")
    .jpeg({ quality: 10 })
    .toFile(`./src/backend/public/img/${coverImgName}`)
  req.body.imageCover = coverImgName
  req.body.images = []

  //IMAGE handling
  const all = files.images.map(async (image, i) => {
    const imgName = `tour-${req.params.id}-${Date.now()}-img${i + 1}.jpeg` // Construct the filename
    await sharp(image.buffer)
      .resize(500, 500)
      .toFormat("jpeg")
      .jpeg({ quality: 100 })
      .toFile(`./src/backend/public/img/${imgName}`)
    req.body.images[i] = imgName
  })
  await Promise.all(all)

  next()
})
