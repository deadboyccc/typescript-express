/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/no-unused-vars */
import multer from "multer"
import { IUser } from "./interfaces/user.interface"

declare global {
  namespace Express {
    interface Request {
      isLoggedIn?: boolean
      user?: IUser
      params?: {
        tourId?: string
        slug?: string
      }
      files?: Record<string, string>
    }
    interface Response {
      statusMessage?: string
    }
  }
  namespace IUser {
    interface IUser {}
  }
}
