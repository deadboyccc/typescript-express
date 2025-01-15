/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, NextFunction } from "express"
import { JSDOM } from "jsdom"
import createDOMPurify from "dompurify"

// Setup DOMPurify
const jsdom = new JSDOM("")
const DOMPurifyInstance = createDOMPurify(
  jsdom.window as unknown as Window & typeof globalThis,
)

/**
 * Middleware to sanitize the request body globally.
 * This strips all HTML tags from the request body.
 */
const sanitizeRequestBody = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (req.body && typeof req.body === "object") {
    req.body = Object.keys(req.body).reduce(
      (sanitizedBody, key) => {
        const value = req.body[key]
        sanitizedBody[key] =
          typeof value === "string"
            ? DOMPurifyInstance.sanitize(value, { ALLOWED_TAGS: [] })
            : value // Remove all HTML tags
        return sanitizedBody
      },
      {} as Record<string, any>,
    )
  }
  next()
}

export default sanitizeRequestBody
