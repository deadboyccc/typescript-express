/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
import dotenv from "dotenv"
import mongoose from "mongoose"
import os from "os"
import { app } from "./app"
import cluster from "cluster"
import { Server } from "http"

// Load environment variables
dotenv.config({ path: `${__dirname}/config.env` })

// Declare server variable
let server: Server

// Handle uncaught exceptions globally
process.on("uncaughtException", (err: Error) => {
  console.log("Uncaught Exception:", err)
  console.log(err.name, err.message)
  process.exit(1)
})

// DB connection function
async function mongosh() {
  const db = process.env.DATA_LOCAL

  if (!db) {
    console.error("No database connection string found!💥")
    process.exit(1) // Exit if DB connection string is missing
  }

  try {
    await mongoose.connect(db)
    console.log("DB Connection Successful!🎉")
  } catch (error) {
    console.error("DB connection error💥", error)
    process.exit(1) // Exit if DB connection fails
  }
}

// Wait for DB connection before starting the server
async function startServer() {
  await mongosh() // Ensure DB is connected first

  const numCPUs = os.cpus().length

  if (cluster.isMaster) {
    console.log(`Master ${process.pid} is running`)

    // Fork workers for each CPU core
    for (let i = 0; i < numCPUs; i++) {
      cluster.fork()
    }

    cluster.on("exit", (worker, code, signal) => {
      console.log(`Worker ${worker.process.pid} died`)
    })

    // Handle graceful shutdown when SIGINT is received
    process.on("SIGINT", () => {
      console.log("Shutting down gracefully...")
      for (const id in cluster.workers) {
        cluster.workers[id]?.send("shutdown")
      }
      process.exit(0)
    })
  } else {
    // Worker processes handle requests
    process.on("message", (msg: string) => {
      if (msg === "shutdown") {
        console.log(`Worker ${process.pid} shutting down...`)
        process.exit(0)
      }
    })

    // Start the server
    server = app.listen(process.env.PORT || 3000, () => {
      console.log(`Worker ${process.pid} started`)
    })
  }
}

// Start the server
startServer()

// Handle unhandled promise rejections globally
process.on("unhandledRejection", (err: Error) => {
  console.log("Unhandled Rejection:", err)
  console.log(err.name, err.message)
  // Close the server and exit gracefully
  server.close(() => {
    process.exit(1)
  })
})
