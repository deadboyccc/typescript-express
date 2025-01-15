/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import dotenv from "dotenv"
import { faker } from "@faker-js/faker"
import mongoose from "mongoose"
import fs from "fs/promises"
import { Tour } from "../models/tourModel"

const start = Date.now()
dotenv.config({ path: `${__dirname}/config.env` }) // Load environment variables

const dataFilePath = `${__dirname}/../../assets/data2.json`
const db = process.env.DATA_LOCAL
//write the new data.json using faker.js

async function generateRandomData() {
  try {
    const data: any[] = []

    for (let i = 0; i < 10_000; i++) {
      data.push({
        name: faker.person.fullName(), // Generate random tour names
        duration: faker.number.int({ min: 1, max: 7 }), // Random duration between 1 and 7 days
        maxGroupSize: faker.number.int({ min: 5, max: 15 }), // Random group size between 5 and 15
        difficulty: faker.helpers.arrayElement(["easy", "medium", "difficult"]),
        ratingAverage: faker.number.float({
          min: 0,
          max: 5,
          fractionDigits: 2,
        }), // Random rating average between 0 and 5 with 2 decimals

        ratingQuantity: faker.number.int({ min: 0, max: 100 }), // Random number of ratings between 0 and 100
        price: parseFloat(faker.commerce.price({ min: 100, max: 10000 })), // Random price between $100 and $10000
        summary: faker.lorem.sentence(), // Generate random tour summary
        description: faker.lorem.paragraphs(3), // Generate random tour description with 3 paragraphs
        imageCover: faker.image.urlLoremFlickr({
          category: "nature",
          width: 640,
          height: 480,
        }), // Generate random cover image URL
        images: [
          faker.image.urlLoremFlickr({
            category: "nature",
            width: 640,
            height: 480,
          }),
          faker.image.urlLoremFlickr({
            category: "landscape",
            width: 640,
            height: 480,
          }),
          faker.image.urlLoremFlickr({
            category: "city",
            width: 640,
            height: 480,
          }),
        ], // Generate 3 random image URLs
        startDates: [
          faker.date.future(), // Random future start date
          faker.date.future(), // Another random future start date
        ],
      })
    }

    const stringfied = JSON.stringify(data, null, 2) // Properly stringify the data with indentation
    await fs.writeFile(dataFilePath, stringfied)
    console.log("📝Data successfully written to data2.json!")
  } catch (error) {
    console.error("Error generating data:", error)
  } finally {
    const end = Date.now()
    console.log(`⏱️ Process took ${(end - start) / 1000} seconds`)
  }
}

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
      await Tour.deleteMany({})
      console.log("⚡ Existing data cleared.")

      // Read and parse data file
      const data = await fs.readFile(dataFilePath, "utf-8")
      const jsonData = JSON.parse(data)

      if (!Array.isArray(jsonData) || jsonData.length === 0) {
        console.warn("⚠️ No data found in data2.json.")
        return
      }

      // Insert new data
      await Tour.create(jsonData)
      console.log("✅ Data imported successfully!")
    }

    // Handle other arguments
    else {
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

//FIRST RUN THE GENERATE RANDOM DATA () THEN THE MAIN()
// generateRandomData()
// main()

// type objRecord = Record<string, any>
// const testObj: objRecord = {
//   name: true,
//   age: 10,
//   friends: ['ehllo f', 'bye'],
//   joe: {
//     name: 'joe',
//   },
// }
// interface objRecordInterface {
//   [property: string]: any
// }

//print formatted process time in seconds
