/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
import dotenv from "dotenv"
import { faker } from "@faker-js/faker"
import mongoose from "mongoose"
import { Review } from "../models/reviewModel"
import { sample } from "lodash"
import { User } from "../models/userModel"
import { Tour } from "../models/tourModel"

//CREATING FAKE REVIEWS WITHT THE FAKERJS LIBRARY
const start = Date.now()
dotenv.config({ path: `${__dirname}/config.env` }) // Load environment variables

const db = process.env.DATA_LOCAL

if (!db) {
  console.error("❌ DATABASE URL is missing in environment variables!")
  process.exit(1)
}
const main = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(db)
    console.log("✅ DB Connection Successful!")

    // Import Data
    if (process.argv.includes("--import")) {
      console.log("⏳ Importing data...")
      // Clear existing data
      await Review.deleteMany({})
      console.log("⚡ Existing data cleared.")
      //getting random ids from users and tours to write random reviews to them
      const users = await User.find({})
      const userIds = users.map((user) => user._id)
      const tours = await Tour.find({})
      const tourIds = tours.map((tour) => tour._id)

      // Generate data
      const data: any[] = []
      for (let i = 0; i < 240; i++) {
        data.push({
          review: faker.lorem.sentences(),
          rating: faker.number.float({
            min: 0,
            max: 5,
          }),
          user: sample(userIds),
          tour: sample(tourIds),
        })
      }

      // Insert data in bulk(better for performance but doesn't check validation -use only in dev-)
      await Review.insertMany(data, { ordered: false })
      console.log("✅ Data imported successfully!")
    } else {
      console.warn(
        "⚠️ No valid arguments provided. Use --import to import data.",
      )
    }
  } catch (err: any) {
    console.error("❌ Error occurred:", err.message)
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close()
    console.log("🔒 Database connection closed.")
    const end = Date.now()
    console.log(`⏱️ Process took ${(end - start) / 1000} seconds`)
  }
}

// Execute the script
main()
