/* eslint-disable @typescript-eslint/no-empty-object-type */
import bcrypt from "bcryptjs"
import crypto from "crypto"
import mongoose, { Document, Model, Query } from "mongoose"

// Define the interface for your document
export interface IUserDocument extends Document {
  name: string
  email: string
  photo?: string
  password: string | undefined
  passwordConfirm: string | undefined
  role: "admin" | "user" | "guide" | "lead-guide"
  correctPassword: (
    inputPassword: string,
    userPassword: string,
  ) => Promise<boolean>
  passwordChangedAt: Date
  changedPasswordAfter: (a: number) => boolean
  createPasswordResetToken: () => string
  // Add more fields here if needed
  passwordResetToken: string | undefined
  passwordResetExpired: Date | undefined
  // reload: Function
  isActive: boolean
}

// Define the interface for your model
export interface IUserModel extends Model<IUserDocument> {}

const userSchema = new mongoose.Schema<IUserDocument>(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "Name is required"],
      minlength: 3,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function (value) {
          return /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value)
        },
        message: "Please enter a valid email address",
      },
    },
    photo: {
      type: String,
      default: "default.jpg",
    },
    role: {
      type: String,
      enum: ["user", "guide", "lead-guide", "admin"],
      default: "user",
      required: [true, "must have a role!"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 10,
      select: false,
      maxlength: 80,
    },
    passwordConfirm: {
      type: String,
      required: [true, "Please confirm your password"],
      minlength: 10,
      maxlength: 80,
      validate: {
        //works on save() (and create() cuz it saves auto)
        validator: function (this: IUserDocument, value: string): boolean {
          return this.password === value
        },

        message: "Passwords do not match",
      },
    },
    passwordChangedAt: {
      type: Date,
      // require: [true, 'enter password changed it manually '],
      select: true,
    },
    passwordResetToken: String,
    passwordResetExpired: Date,
    isActive: {
      type: Boolean,
      default: true,
      select: false,
    },
  },

  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)
//ading the virtual first_letter that doesn't persist on the db rather it's runetime
userSchema.virtual("first_letter").get(function (this: IUserDocument) {
  return this.name.charAt(0).toUpperCase() || "$"
})
//pre-find(query) remove isActive:false users (delete users)
userSchema.pre(
  /^find/,
  function (this: Query<IUserDocument[], IUserDocument, unknown>, next) {
    this.find({ isActive: true })
    next()
  },
)

//pre-save save() and create() not UPDATE encrypt if password is modified
userSchema.pre("save", async function (this: IUserDocument, next) {
  //encrypt run the function if passwords was actually modified
  if (!this.isModified("password")) return next()
  //bcrypt the password
  this.password! = await bcrypt.hash(this.password!, 1)
  this.passwordConfirm = undefined

  next()
})
//pre-save if password is modified = change the date to now -1 second(error correction)
userSchema.pre("save", function (this: IUserDocument, next) {
  if (!this.isModified("password") || this.isNew) return next()
  this.passwordChangedAt = new Date(Date.now() - 1000)
  next()
})
//user method to check password using bcrypt.compare
userSchema.methods.correctPassword = async function (
  inputPassword: string,
  userPassword: string,
) {
  const result = await bcrypt.compare(inputPassword, userPassword)
  // console.log(result)
  return result
}
//method send the jwttimestamp and see if password was changed since then (reject)
userSchema.methods.changedPasswordAfter = function (
  this: IUserDocument,
  JWTTimeStamp: number,
): boolean {
  if (this.passwordChangedAt) {
    const changedTimeInSeconds = Math.floor(
      this.passwordChangedAt.getTime() / 1000,
    )
    // console.log(changedTimeInSeconds, JWTTimeStamp)
    return JWTTimeStamp < changedTimeInSeconds
  }
  return false
}
//self-explanatory
userSchema.methods.createPasswordResetToken = function (this: IUserDocument) {
  const resetToken = crypto.randomBytes(32).toString("hex")
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex")
  this.passwordResetExpired = new Date(Date.now() + 10 * 60 * 1000)
  // console.log('resetToken:', resetToken)
  // console.log('encrypted token:', this.passwordResetToken)
  return resetToken
}

//reload method
// Add the reload method
userSchema.methods.reload = async function (): Promise<IUserDocument> {
  const refreshedUser = await (this.constructor as typeof mongoose.Model)
    .findById(this._id)
    .exec()
  if (!refreshedUser) {
    throw new Error("Failed to reload: User not found")
  }
  Object.assign(this, refreshedUser.toObject())
  return this as IUserDocument
}
export const User: IUserModel = mongoose.model<IUserDocument, IUserModel>(
  "User",
  userSchema,
)
