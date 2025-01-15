# Project Documentation

## Overview
This project is a TypeScript-based application that utilizes environment variables for configuration. It provides various API routes and endpoints to perform specific tasks. The project structure includes TypeScript files located in the `src` directory and a configuration file named `config.env`.

## use the generate bat file to generate fake data to local database to test the API

## Environment Variables
The project expects the following environment variables to be defined in the `src/config.env` file:

- `NODE_ENV`: development or production, this will affect logging middleware, smpt email settings and the way errors are sent (prod includes stack trace)
- `PORT`: The port number on which the server will run.
- `DB_LOCAL`: The hostname of the database server. (local)
- `JWT_SECRET`: The secret key used for JSON Web Token (JWT) authentication.
- `JWT_EXPIRES_IN`: JWT epides in 'xd' format (90d=90days)
- `FROM_EMAIL`: server sender email

- `PRODUCTION_SMPT_HOST`: host name of the production smpt
- `PRODUCTION_SMPT_USER`: smpt user
- `PRODUCTION_SMPT_PASSWORD`: smpt password

- `DEVELOPMENT_SMPT_HOST`: host name of the development smpt
- `DEVELOPMENT_SMPT_USER`: dev smpt user
- `DEVELOPMENT_SMPT_PASSWORD`: dev smpt password

## API Documentation

### Overview
This project is a TypeScript-based application that provides various API routes and endpoints to perform specific tasks. The project structure includes TypeScript files located in the `src` directory.

### API Routes and Endpoints

#### Tours
- **GET /api/v1/tours**: Get all tours.
  - Controller: `getAllTours`
- **GET /api/v1/tours/:id**: Get a tour by ID.
  - Controller: `getTourById`
- **POST /api/v1/tours**: Create a new tour.
  - Controller: `createTourById`
- **PATCH /api/v1/tours/:id**: Update a tour by ID.
  - Controller: `UpdatePatchTour`
- **DELETE /api/v1/tours/:id**: Delete a tour by ID.
  - Controller: `deleteTourById`
- **GET /api/v1/tours/top5**: Get top 5 tours.
  - Controller: `top5Tours`
- **GET /api/v1/tours/stats**: Get tour statistics.
  - Controller: `getToursStats`
- **GET /api/v1/tours/plan/:year**: Get yearly plan.
  - Controller: `getYearlyPlan`
- **GET /api/v1/tours-within/:distance/center/:latlng/unit/:unit**: Get tours within a certain distance.
  - Controller: `getToursWithin`
- **GET /api/v1/tours/distances/:latlng/unit/:unit**: Get distances of tours.
  - Controller: `getDistances`

#### Users
- **GET /api/v1/users**: Get all users.
  - Controller: `getAllUsers`
- **GET /api/v1/users/:id**: Get a user by ID.
  - Controller: `getUserById`
- **POST /api/v1/users**: Create a new user.
  - Controller: `createUserById`
- **PATCH /api/v1/users/:id**: Update a user by ID.
  - Controller: `updateUser`
- **DELETE /api/v1/users/:id**: Delete a user by ID.
  - Controller: `deleteUserById`
- **PATCH /api/v1/users/updateMe**: Update logged-in user details.
  - Controller: `updateMe`
- **DELETE /api/v1/users/deleteMe**: Deactivate logged-in user.
  - Controller: `deleteMe`
- **GET /api/v1/users/me**: Get logged-in user information.
  - Controller: `getMe`

#### Reviews
- **GET /api/v1/reviews**: Get all reviews.
  - Controller: `getAllReviews`
- **POST /api/v1/reviews**: Create a new review.
  - Controller: `createReview`
- **PATCH /api/v1/reviews/:id**: Update a review by ID.
  - Controller: `updateReview`
- **DELETE /api/v1/reviews/:id**: Delete a review by ID.
  - Controller: `deleteReviewById`
- **GET /api/v1/reviews/:id**: Get a review by ID.
  - Controller: `getReviewById`

#### Bookings
- **POST /api/v1/bookings**: Create a new booking.
  - Controller: `createBooking`
- **GET /api/v1/bookings**: Get all bookings.
  - Controller: `getAllBookings`

#### Views
- **GET /base**: Render base view.
  - Controller: `baseController`
- **GET /overview**: Render overview view.
  - Controller: `overviewController`

### Models
- **Tour Model**: `Tour`
- **User Model**: `User`
- **Review Model**: `Review`
- **Booking Model**: `Booking`

### Utilities
- **Error Handling**: `AppError`
- **Async Handler**: `catchAsync`
- **API Features**: `APIFeatures`
- **Handler Factory**: `handlerFactory`

### Middleware
- **Authentication**: `protect`, `restrict`
- **File Upload**: `updateTourPhotos`, `resizeTourPhotos`, `updateUserPhoto`, `resizeuserPhoto`

### Configuration
- **TypeScript Configuration**: `tsconfig.json`
- **ESLint Configuration**: `eslint.config.mjs`
- **Prettier Configuration**: `.prettierrc`
- **Nodemon Configuration**: `nodemon.json`
- **Jest Configuration**: `jest.config.js`

For more details, refer to the source code files linked above.