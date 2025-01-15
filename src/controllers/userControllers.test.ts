import { filterObj } from "./userControllers"

describe("filterObj", () => {})
test("what", () => {
  const obj = { name: "John", age: 30, email: "john@example.com" }
  const result = filterObj(obj, "name", "age", "email", "city")
  expect(result).toEqual({ name: "John", age: 30, email: "john@example.com" })
})
it("should return the original object when no allowed fields are specified", () => {
  const obj = { name: "John", age: 30, email: "john@example.com" }
  const result = filterObj(obj, "name", "age", "email")
  expect(result).toEqual(obj)
})
it("should return an empty object when no allowed fields are specified", () => {
  const obj = { name: "John", age: 30, email: "john@example.com" }
  const result = filterObj(obj)
  expect(result).toEqual({})
})

it("should correctly filter an object with a single allowed field", () => {
  const obj = { name: "John", age: 30, email: "john@example.com" }
  const result = filterObj(obj, "name")
  expect(result).toEqual({ name: "John" })
})

it("should handle multiple allowed fields correctly", () => {
  const obj = {
    name: "John",
    age: 30,
    email: "john@example.com",
    city: "New York",
  }
  const result = filterObj(obj, "name", "email", "city")
  expect(result).toEqual({
    name: "John",
    email: "john@example.com",
    city: "New York",
  })
})
it("should ignore fields not present in the input object", () => {
  const obj = { name: "John", age: 30 }
  const result = filterObj(obj, "name", "email")
  expect(result).toEqual({ name: "John" })
})
