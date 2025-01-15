import { AppError } from "./appError"
import catchAsync from "./catchAsync"
import { APIFeatures } from "./utils_apiFeatures"
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type appModel = Record<any, any>

//A FACTORY-DESIGN PATTER TO CREATE BASIC REST APIS
export const deleteOne = (model: appModel) => {
  return catchAsync(async (req, res, next) => {
    // Your implementation here
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const doc = await model.findByIdAndDelete(req.params.id)
    if (!model) {
      return next(new AppError(`${req.params.id} is not a valid id`, 404))
    }
    res.status(204).json({
      status: "success",
      data: null,
    })
  })
}

//update one doc on a given resource
export const updateOne = (model: appModel) =>
  catchAsync(async (req, res, next) => {
    const doc = await model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
    if (!doc) {
      return next(new AppError(`${req.params.id} is not a valid id`, 404))
    }
    res //wrote something /update
      .status(200)
      .json({ status: "success", message: "New doc created", data: doc })
  })

//create one doc on a given resource
export const createOne = (model: appModel) =>
  catchAsync(async (req, res) => {
    const doc = await model.create(req.body)

    //done post creating(successful post)
    res.status(201).json({
      status: "success",
      message: "New doc created",
      data: { data: doc },

      // data: (req.body as { text: string }).text,
    })
  })

//get one doc on a given resource
export const getOne = (
  model: appModel,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  populateOptions: Record<any, any> = {},
) =>
  catchAsync(async (req, res, next) => {
    let query = model.findById(req.params.id)
    if (Object.keys(populateOptions).length !== 0) {
      query = query.populate(populateOptions)
    }
    const doc = await query
    if (!doc) {
      return next(new AppError(`${req.params.id} is not a valid id`, 404))
    }
    res.status(200).json({ status: "success", data: { doc } })
  })

//get ALL docs on a given resource
export const getAll = (model: appModel) =>
  catchAsync(async (req, res) => {
    // created API features instantance and chain features then export and  Execute query
    const tourApiFeaturedQuery = new APIFeatures<ReturnType<typeof model.find>>(
      model.find(),
      req.query,
    )
      .filter()
      .sort()
      .limit()
      .paginate()
    // const allDocs = await tourApiFeaturedQuery.mongooseQuery.explain()
    const allDocs = await tourApiFeaturedQuery.mongooseQuery
    res.status(200).json({
      status: "success",
      results: allDocs.length,
      data: { allDocs },
    })
  })
