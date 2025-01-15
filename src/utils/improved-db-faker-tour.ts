/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
import dotenv from "dotenv"
import { faker } from "@faker-js/faker"
import mongoose from "mongoose"
import { Tour } from "../models/tourModel"

const start = Date.now()
dotenv.config({ path: `${__dirname}/config.env` }) // load environment variables

const db = process.env.DATA_LOCAL

if (!db) {
  console.error("❌ DATABASE URL is missing in environment variables!")
  process.exit(1)
}

const main = async () => {
  try {
    // Connect to mongo
    await mongoose.connect(db)
    console.log("✅ DB Connection Successful!")

    // Import args
    if (process.argv.includes("--import")) {
      console.log("⏳ Importing data...")
      // drop tours
      await Tour.deleteMany({})
      console.log("⚡ Existing data cleared.")

      //location generation
      const locations: any[] = []
      for (let i = 0; i < 100; i++) {
        locations.push({
          coordinates: [faker.location.longitude(), faker.location.latitude()],
          address: faker.location.streetAddress(),
          descripion: faker.lorem.sentence(),
        })
      }
      // data generation
      const data: any[] = []
      for (let i = 0; i < 20; i++) {
        data.push({
          locations: [locations[i], locations[i + 1]],

          startLocation: {
            coordinates: [
              faker.location.longitude(),
              faker.location.latitude(),
            ],
            address: faker.location.streetAddress(),
            descripion: faker.lorem.sentence(),
          },
          name: faker.person.fullName(),
          duration: faker.number.int({ min: 1, max: 7 }),
          maxGroupSize: faker.number.int({ min: 5, max: 15 }),
          difficulty: faker.helpers.arrayElement([
            "easy",
            "medium",
            "difficult",
          ]),
          ratingAverage: faker.number.float({
            min: 0,
            max: 5,
            fractionDigits: 2,
          }),
          ratingQuantity: faker.number.int({ min: 0, max: 100 }),
          price: Number.parseFloat(
            faker.commerce.price({ min: 100, max: 10000 }),
          ),
          summary: faker.lorem.sentence(),
          description: faker.lorem.paragraphs(3),
          imageCover: faker.image.urlLoremFlickr({
            category: "nature",
            width: 640,
            height: 480,
          }),
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
          ],
          startDates: faker.date.betweens({
            from: "2020-01-01T00:00:00.000Z",
            to: "2024-12-31T00:00:00.000Z",
            count: 3,
          }),
        })
      }

      // Insert data in bulk with ordered: false (faster in insertMany() than create())
      await Tour.insertMany(data, { ordered: false })
      console.log("✅ Data imported successfully!")
    } else {
      console.warn(
        "⚠️ No valid arguments provided. Use --import to import data.",
      )
    }
  } catch (err: any) {
    console.error("❌ Error occurred:", err.message)
  } finally {
    // close resources + long running time
    await mongoose.connection.close()
    console.log("🔒 Database connection closed.")
    const end = Date.now()
    console.log(`⏱️ Process took ${(end - start) / 1000} seconds`)
  }
}

// excute the script
main()
