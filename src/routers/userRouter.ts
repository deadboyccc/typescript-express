import express from "express"
import {
  forgotPassword,
  isLoggedIn,
  login,
  logOut,
  protect,
  resetPassword,
  signUp,
  updatePassword,
} from "../controllers/authenticationController"
import {
  createUserById,
  deleteMe,
  deleteUserById,
  getAllUsers,
  getMe,
  getUser,
  getUserById,
  resizeuserPhoto,
  updateMe,
  updateUser,
  updateUserPhoto,
} from "../controllers/userControllers"
export const userRouter = express.Router()

//auth.start
//sign up and sign in
userRouter.post("/signup", signUp)
userRouter.post("/login", login)
userRouter.get("/isloggedin", isLoggedIn)
userRouter.get("/logout", logOut)

//forgot password and reset thro email api token
userRouter.post("/forgotpassword", forgotPassword)
userRouter.patch("/resetpassword/:token", resetPassword)

//if user is logged in then update password thro the route
userRouter.patch("/updatepassword", protect, updatePassword)

//auth.end

//get my info (atuh required)
userRouter.get("/me", protect, getMe, getUser)
//update user data (auth required)
userRouter.patch(
  "/updateme",
  protect,
  updateUserPhoto,
  resizeuserPhoto,
  updateMe,
)
userRouter.delete("/deleteme", protect, deleteMe)

userRouter.route("/").get(getAllUsers).post(createUserById)

userRouter
  .route("/:id")
  .patch(updateUser)
  .delete(deleteUserById)
  .get(getUserById)
