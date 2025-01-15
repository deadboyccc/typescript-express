/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { RequestHandler } from "express"
import multer from "multer"
import sharp from "sharp"
import { AppError } from "../utils/appError"
import catchAsync from "../utils/catchAsync"
import { getOne } from "../utils/handlerFactory"
import { User } from "../models/userModel"
import { APIFeatures } from "../utils/utils_apiFeatures"

// Initialize the multer upload instance
const upload = multer({
  //memory (buffer)
  storage: multer.memoryStorage(),
  //disk (BAD PRACTICE CUZ IT WILL BE PROCESSED LATER AND FETCHED FROM THE DISK AGAIN !) // storage: multer.diskStorage({
  //   destination: (
  //     req: Request,
  //     file: Express.Multer.File,
  //     cb: (error: Error | null, destination: string) => void,
  //   ) => {
  //     cb(null, "./src/backend/public/img") // Set the destination folder
  //   },
  //   filename: (
  //     req: Request,
  //     file: Express.Multer.File,
  //     cb: (error: Error | null, filename: string) => void,
  //   ) => {
  //     const ext = file.mimetype.split("/")[1] // Extract the file extension
  //     cb(null, `user-${req.user?.id}-${Date.now()}.${ext}`) // Construct the filename
  //   },
  // }),
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

//export the update and resize photo middle wares
export const updateUserPhoto = upload.single("photo")
export const resizeuserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next()
  req.file.filename = `user-${req.user?.id}-${Date.now()}.jpeg` // Construct the filename
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`./src/backend/public/img/${req.file.filename}`)
  next()
})
// Utility to filter allowed fields from an object
export function filterObj(
  obj: Record<string, any>,
  ...allowedFields: string[]
) {
  const filteredObj: Record<string, any> = {}
  Object.keys(obj).forEach((key) => {
    if (allowedFields.includes(key)) {
      filteredObj[key] = obj[key]
    }
  })
  return filteredObj
}

//simple rest apis routes handlers :
export const getAllUsers: RequestHandler = catchAsync(
  async (req, res, next) => {
    // created API features instantance and chain features then export and  Execute query
    const userApiFeaturedQuery = new APIFeatures<ReturnType<typeof User.find>>(
      User.find(),
      req.query,
    )
      .filter()
      .sort()
      .limit()
      .paginate()
    const allUsers = await userApiFeaturedQuery.mongooseQuery

    // Send response
    res.status(200).json({
      status: "success",
      results: allUsers.length,
      data: { allUsers },
    })
  },
)

export const getUserById: RequestHandler<{ id: string }> = catchAsync(
  async (req, res, next) => {
    // Your implementation here

    const user = await User.findById(req.params.id)
    res.status(200).json({ status: "success", data: { user } })
  },
)
export const createUserById: RequestHandler<{ id: string }> = catchAsync(
  async (req, res, next) => {
    const newUser = await User.create(req.body)
    //done post creating(successful post)
    res.status(201).json({
      status: "success",
      message: "New User created",
      data: newUser,
      // data: (req.body as { text: string }).text,
    })
  },
)

export const updateUser: RequestHandler<{ id: string }> = catchAsync(
  async (req, res, next) => {
    //filter the body first but assuming only admin can updates using this route so no filtering
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
    res
      //wrote something /update
      .status(200)
      .json({ status: "success", message: "New tour created", data: user })
  },
)

export const deleteUserById: RequestHandler<{ id: string }> = catchAsync(
  async (req, res, next) => {
    await User.findByIdAndDelete(req.params.id)
    res.status(204).json({
      status: "success",
      data: null,
    })
  },
)

// Controller to update user details
//FOR USERS
export const updateMe = catchAsync(async (req, res, next) => {
  // Prevent password updates through this route
  if (req.params.email || req.params.user) {
    const { email, user } = req.params
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        email: email || req.user.email,
        name: user || req.user.name,
      },
      {
        new: true,
        runValidators: true,
      },
    )
    return next()
  }
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError("Password updates are not allowed via this route", 400),
    )
  }

  // Filter the request body for allowed fields
  const filteredBody = filterObj(req.body, "email", "name")

  //if the reqeust has a file then add that file to the filtered body (cuz it will be send,otherwise the photo will be lost)
  if (req.file) filteredBody.photo = req.file.filename
  // Update the user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  })

  // Respond with the updated user
  res.status(200).json({
    status: "success",
    data: { user: updatedUser },
  })
  //so we can't use next after sending a request cuz that simply will call the next function while sending a response emits that
})
export const deleteMe = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { isActive: false },
    {
      new: true,
    },
  )
  // console.log(user)
  if (!user) {
    return next(new AppError("user not found!", 400))
  }
  res.status(204).json({
    status: "success",
    data: null,
  })
})

//get logged in user information
//middleware to add req.params.id from the User object attached to the request from Protect auth middleware
export const getMe = catchAsync(async (req, res, next) => {
  req.params.id = req.user.id
  //adds to the reqeust parameters the user id
  sharp({})
  next()
})
export const getUser = getOne(User)
