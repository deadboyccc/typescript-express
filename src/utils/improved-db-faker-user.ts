/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
import dotenv from "dotenv"
import { faker } from "@faker-js/faker"
import mongoose from "mongoose"
import { User } from "../models/userModel"

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
      await User.deleteMany({})
      console.log("⚡ Existing data cleared.")

      // Generate data
      const data: any[] = []
      for (let i = 0; i < 20; i++) {
        const password = faker.internet.password({ length: 15 })
        data.push({
          name: faker.person.fullName(),
          email: faker.internet.email().toLowerCase(), // Ensure email matches `lowercase: true`
          photo: faker.image.urlLoremFlickr(), // Matches the default value in the schema
          password: password,
          passwordConfirm: password, // Ensure password confirmation matches
        })
      }
      console.log(data[0])
      // await User.create(data[0])

      // Insert data in bulk
      await User.insertMany(data, {
        ordered: false,
      })
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
