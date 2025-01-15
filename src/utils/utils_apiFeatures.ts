/* eslint-disable @typescript-eslint/no-explicit-any */
import { FilterQuery } from "mongoose"

export class APIFeatures<T> {
  constructor(
    public mongooseQuery: FilterQuery<T>,
    public requestQueryObj: Record<string, any>,
  ) {}

  filter() {
    // Create a copy of the request query object
    const reqQueryObj = { ...this.requestQueryObj }
    // Remove excluded fields
    const excludedFields = ["page", "sort", "limit", "fields"]
    excludedFields.forEach((el) => delete reqQueryObj[el])

    // Stringify and replace operators with MongoDB syntax
    let queryStr = JSON.stringify(reqQueryObj)
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`)

    // Update the mongoose query
    this.mongooseQuery = this.mongooseQuery.find(JSON.parse(queryStr))
    return this
  }

  sort() {
    if (this.requestQueryObj.sort) {
      const sortString = this.requestQueryObj.sort
        .toString()
        .split(",")
        .join(" ")
      this.mongooseQuery = this.mongooseQuery.sort(sortString)
    } else {
      this.mongooseQuery = this.mongooseQuery.sort("-createdAt")
    }
    return this
  }

  limit() {
    if (this.requestQueryObj.fields) {
      const fieldArray = this.requestQueryObj.fields
        .toString()
        .split(",")
        .join(" ")
      this.mongooseQuery = this.mongooseQuery.select(fieldArray)
    } else {
      this.mongooseQuery = this.mongooseQuery.select("-__v")
    }
    return this
  }

  paginate() {
    const page = Number(this.requestQueryObj.page) || 1
    const limit = Number(this.requestQueryObj.limit) || 15
    const skip = (page - 1) * limit

    this.mongooseQuery = this.mongooseQuery.skip(skip).limit(limit)
    return this
  }
}
