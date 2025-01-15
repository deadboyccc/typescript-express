import { Request, Response, NextFunction, RequestHandler } from "express"

// Define the type for an asynchronous RequestHandler
type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
) => Promise<any>

//dig more
// Updated catchAsync function
//it will take the AsyncRequesthanlder fn and returns the RequestHandler
const catchAsync = (fn: AsyncRequestHandler): RequestHandler => {
  //returning the RequestHandler
  return (req: Request, res: Response, next: NextFunction) => {
    // Ensure errors in the async function are caught and forwarded to next()
    //in the Request hanlder we excute the fn async request handler and catch the error of that operation
    //fn = the async function that returns a promise we try it then catch the error and forwards it to the global error handler

    fn(req, res, next).catch(next)
  }
}

//default export it
export default catchAsync

// this function will wrap a function(the controller ) and returns the RequestHanlder, but it has to take an asyncRequestHnadler so that it returns a promise<any> (cuz the request Handler is async -returns a promise) type:any
