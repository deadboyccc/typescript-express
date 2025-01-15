/* eslint-disable @typescript-eslint/no-unused-vars */
import crypto from "crypto"
import { Response } from "express"
import jwt from "jsonwebtoken"
import { AppError } from "../utils/appError"
import catchAsync from "../utils/catchAsync"
import Email from "../utils/email"
import { IUserDocument, User } from "../models/userModel"

//creating a special request interface to make the user optional (simple workaround): OPTIMAL SOLUTION: add this to types.d.ts
export interface RequestWithUser extends Request {
  user?: IUserDocument // Make the 'user' property optional
}

// Signing the recieved JWT token witht the secret key to ensure it's payload isn't modified
function signToken(id: string) {
  return jwt.sign({ id }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  })
}

// create and send the token (user, statusCode because it processes faile and successful ops,res)
const createSendToken = (
  user: IUserDocument,
  statusCode: number,
  res: Response,
) => {
  const token = signToken(user._id as string)
  res.cookie("jwt", token, {
    expires: new Date(
      Date.now() +
        (Number(process.env.JWT_COOKIE_EXPIRES_IN) || 0) * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === "development" ? false : true,
  })

  //IMPORTANT, cuz the pre-save mongoDB middle ware won't trigger to encrypt the passwords in this stage
  // Remove the password field from the user object before sending the response
  user.password = user.passwordConfirm = undefined

  //sending the token is assume successful, because the GLOBAL error handler will take care of the errors
  res.status(statusCode).json({
    status: "success",
    token,
    data: { user },
  })
}

// adding a user to the db, SIGNING UP
export const signUp = catchAsync(async (req, res) => {
  //only pick the allowed fileds  thro obj destructuring
  const { name, email, password, passwordConfirm, role } = req.body
  //create the url
  const url = `${req.protocol}://${req.hostname}`
  //create the user
  const user = await User.create({
    name,
    email,
    password,
    passwordConfirm,
    role,
  })
  //send the welcome email
  await new Email(user, url).sendWelcome()

  //create the token and send it to the user with 201 status (user created)
  createSendToken(user, 201, res)
})

//LOGIN
export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body
  //check if email and password exists (same step)
  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400))
  }

  //check if user exist and the password is correct
  //query the user and get the password
  const user = await User.findOne({ email }).select("+password")

  //if no user found or no password found or if the password is incorrect send an error
  if (
    !user ||
    !user.password ||
    !(await user.correctPassword(password, user.password))
  ) {
    return next(new AppError("Invalid email or password", 401))
  }

  //if everything is ok send the token back to the client
  createSendToken(user, 200, res)
})

//restrict access based on ROLES
export const restrict = (...roles: string[]) => {
  return catchAsync(async (req, res, next) => {
    // Ensure user exists on the request
    //the user gets attached to the req body (assuming HTTPS) in the protect middleware (checks user ===logged in)
    const user = req.user

    if (!user || !roles.includes(user.role)) {
      return next(
        new AppError(
          `User role ${
            user?.role || "undefined"
          } is not authorized to perform this action`,
          403, //forbidden authorization failed u are logined but fail auth
        ),
      )
    }

    // User is authorized
    next()
  })
}

//FORGOT PASSWORD, SEND TOKEN TO EMAIL
export const forgotPassword = catchAsync(async (req, res, next) => {
  // 1)get user passed on email on req.body
  const user = await User.findOne({ email: req.body.email })
  if (!user) {
    return next(new AppError("No user found with that email", 404))
  }
  //generate the reset token thro middleware schema method(cleaner)
  const resetToken = user.createPasswordResetToken()
  //saving the user updated info
  await user.save({ validateBeforeSave: false })
  //create the reset url with the reset token
  const resetURL = `${req.protocol}://${req.get(
    "host",
  )}/api/v1/users/resetpassword/${resetToken}`

  // console.log(resetURL)
  //send the token thro the email
  try {
    await new Email(user, resetURL).passwordReset()
    res.status(200).json({
      status: "success",
      message: "Token sent to email",
    })
  } catch (err) {
    user.passwordResetToken = undefined
    user.passwordResetExpired = undefined
    await user.save({ validateBeforeSave: false })
    return next(new AppError("Error sending email. Try again later.", 500))
  }
  // next()
})

//reset password with the token send to email (URL RESET)
export const resetPassword = catchAsync(async (req, res, next) => {
  // console.log("resetPassword route hit")
  // 1) Hash the token from the request params
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex")

  // 2) Find the user based on the hashed token and check if the token is still valid
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpired: { $gt: Date.now() }, // Ensure this field is correct (cuz the token expires after a while)
  })

  if (!user) {
    return next(new AppError("Token is invalid or has expired", 400))
  }

  // 3) Validate and set the new password
  const { password, passwordConfirm } = req.body
  if (!password || !passwordConfirm) {
    return next(
      new AppError("Password and password confirmation are required", 400),
    )
  }

  user.password = password
  user.passwordConfirm = passwordConfirm

  //removing the resettoken and expiration date from the current user
  user.passwordResetToken = undefined
  user.passwordResetExpired = undefined

  // 4) Save the updated user to the database (MUST: IT TRIGGERS THE PRE-SAVE MIDDLEWARE TO ENCRYPT PASSWORD)
  await user.save()

  //forgetting password + getting the token = auto login
  // 5) Generate a new JWT and send it to the client
  createSendToken(user, 200, res)
})

//update pasword
export const updatePassword = catchAsync(async (req, res, next) => {
  // 1) Check for the presence of an authorization token
  //no need cuz now we use cookie and protect that adds .user to the req

  // 3) Check if the user still exists
  let user = await User.findById(req.user.id).select("+password")
  if (!user) {
    return next(
      new AppError(
        "The user associated with this token no longer exists.",
        401,
      ),
    )
  }

  //4)check if current password is correct
  const isCorrect = await user.correctPassword(
    req.body.passwordCurrent,
    user.password!,
  )
  if (!isCorrect) {
    return next(new AppError("incorrect password", 401))
  }
  //IS CORRECT =>
  user.password = req.body.password
  user.passwordConfirm = req.body.passwordConfirm
  // currentUser.passwordChangedAt = new Date()
  //happens in mongose middleware
  // Save the updated user to the database (MUST: IT TRIGGERS THE PRE-SAVE MIDDLEWARE TO ENCRYPT PASSWORD)
  user.save()
  //Important Mongoose tip: when attaching objects it saves the object information to the db but doesn't refresh the object based on the saved db info(obj stored in memory, while mongodb on disk===decoupled) but the object is decoupled from the mongo db and doesn't update meaing the current obj you have is not the same as the mongodb realtionobj

  //reimplement the reload
  // user.reload()
  //or simpler workaround = requery the current obj (in memroy) to sync with the db object

  user = await User.findById(req.user.id)

  //send the token back after updating password
  createSendToken(user!, 200, res)
})

/**
 * Middleware to protect routes by verifying user authentication.
 * Ensures that the user provides a valid JWT via the Authorization header or cookies.
 *
 * Steps:
 * 1. Extract the token from cookies or the Authorization header.
 * 2. Validate the token using the JWT secret.
 * 3. Check if the user associated with the token still exists.
 */
export const protect = catchAsync(async (req, res, next) => {
  let token: string | undefined

  // 1) Extract the token
  // Check if a token is present in cookies
  if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt
  }

  // Otherwise, check for the token in the Authorization header (not very important)
  const authHeader = req.headers.authorization
  if (!token && authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1]
  }

  // If no token is found, send an error response
  if (!token) {
    return next(
      new AppError(
        "You are not logged in. Please log in to access this route.",
        401,
      ),
    )
  }

  // 2) Validate the token
  let decoded: jwt.JwtPayload
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET!) as jwt.JwtPayload
  } catch (err) {
    return next(
      new AppError("Invalid or expired token. Please log in again.", 401),
    )
  }

  // 3) Check if the user associated with the token still exists
  const currentUser = await User.findById(decoded.id)
  if (!currentUser) {
    return next(
      new AppError(
        "The user associated with this token no longer exists.",
        401,
      ),
    )
  }

  // Attach the current user to the request object for downstream middlewares
  res.locals.user = currentUser
  req.user = currentUser

  // Proceed to the next middleware or route handler
  next()
})

/**
 * Middleware to check if a user is logged in.
 * Primarily used for rendering views and injecting `isLoggedIn` and `currentUser` data into templates.
 *
 * Steps:
 * 1. Check for the presence of a JWT cookie.
 * 2. Verify the token's validity.
 * 3. Check if the user associated with the token still exists.
 * 4. Ensure the user's password has not been changed after the token was issued.
 */
export const isLoggedIn = catchAsync(async (req, res, next) => {
  // 1) Check for the presence of a cookie
  try {
    if (!req.cookies || !req.cookies.jwt) {
      return next() // No cookie, user is not logged in
    }

    const token = req.cookies.jwt

    // 2) Verify the token
    let decoded: jwt.JwtPayload
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as jwt.JwtPayload
    } catch (err) {
      return next() // Invalid token, proceed without a logged-in user
    }

    // 3) Check if the user associated with the token still exists
    const currentUser = await User.findById(decoded.id)
    if (!currentUser) {
      return next() // User no longer exists, proceed without a logged-in user
    }

    // 4) Verify if the user changed their password after the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat as number)) {
      return next() // Password changed, token invalid, proceed without a logged-in user
    }
    req.isLoggedIn = true
    res.locals.user = currentUser // Useful for template rendering (templates gets acces to the res.locals)
    res.status(200).json({
      state: "logged in",
    })
  } catch (err) {
    return next()
  }

  // Proceed to the next middleware
  next()
})

// Log out user and clear the JWT cookie
//by creating a empty cookie that expires in seconds
export const logOut = catchAsync(async (req, res, next) => {
  res.cookie("jwt", "", {
    expires: new Date(Date.now() + 5 * 1000),
    httpOnly: true,
  })
  res.status(200).json({
    status: "ok",
  })
})
