//the GLOBAL APPERROR class to distinguish operational errors from programming/modules errors
export class AppError extends Error {
  public status: string
  public isOperational: boolean
  code?: number
  errmsg?: string
  errors?: Record<string, unknown>[]
  constructor(
    public message: string,
    public statusCode: number,
  ) {
    super(message)
    this.status = String(statusCode).startsWith("4") ? "Fai" : "Error"
    this.isOperational = true
    //creating stack trace on this object(the new error extending the og Error) and
    //excluding this.constructor function to not pollute the stack trace
    Error.captureStackTrace(this, this.constructor)
  }
}
