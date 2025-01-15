/* eslint-disable no-console */
import dotenv from "dotenv"
dotenv.config({ path: `${__dirname}/config.env` })

//ENTRY POINT , MAKING SURE DB IS CONNECTED, ENVIRONMENTAL VARIABLE ARE SET AND APP(SERVER) IS RUNNING SUCCESSFULLY
import mongoose from "mongoose"
import { app } from "./app"
//uncaught exceptions = TERMINATE THE PROGRAM (SECURITY)
process.on("uncaughtException", (err: Error) => {
  console.log(err)
  console.log(err.name, err.message)
  process.exit(1)
})

const db = process.env.DATA_LOCAL!

mongosh()
const port = process.env.PORT
const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
  console.log("Press Ctrl+C to stop the server")
})

//db conection hoisted function
async function mongosh() {
  try {
    if (!db) {
      console.error("No database connection string found!💥")
      process.exit(1)
    }
    await mongoose.connect(db, {})
    console.log("DB Connection Successful!🎉")
  } catch (error) {
    console.error("DB connection error💥", error)
  }
}

//unhandled promises = TERMINAL BUT GRACEFULLY BY WAITING FOR THE SERVER TO CLOSE THEN CALL BACK THE PROCESS EXIT
process.on("unhandledRejection", (err: Error) => {
  console.log(err)
  console.log(err.name, err.message)
  server.close(() => {
    process.exit(1)
  })
})
