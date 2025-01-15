/* eslint-disable */
// This is just a test module to see if the views runs well, It's not PRODUCTION ready.
import axios from "axios"
// import { update } from "lodash"

// const form = document.getElementById("login-form")
// const logoutBtn = document.getElementById("logout")
const updateBtn = document.getElementById("update")

// const login = async (email, password) => {
//   console.log("email:", email)
//   console.log("Password:", password)

//   try {
//     const result = await axios({
//       method: "post",
//       url: "http://localhost:3000/api/v1/users/login",
//       data: {
//         email,
//         password,
//       },
//     })
//   } catch (err) {
//     console.log("Data:", err.response?.data.message)
//   }
// }

// const logout = async () => {
//   try {
//     const result = await axios({
//       method: "get",
//       url: "http://localhost:3000/api/v1/users/logout",
//     })

//     console.log(result.data.status)
//     if (result.data.status === "ok") {
//       location.reload(true)
//     }
//   } catch (err) {
//     console.log("Data:", err.response?.data.message)
//   }
// }
// form.addEventListener("submit", (e) => {
//   e.preventDefault()

//   const email = document.getElementById("email").value
//   const password = document.getElementById("password").value

//   login(email, password)
// })

const updateInformation = async (name, email) => {
  console.log("email:", email)
  console.log("name:", name)
  try {
    const response = await axios({
      method: "patch",
      url: "http://localhost:3000/api/v1/users/updateme",
      data: {
        name,
        email,
      },
    })
    console.log("User updated successfully:", response.data)
  } catch (error) {
    console.log("Error updating user:", error)
  }
}
// logoutBtn.addEventListener("click", logout)
updateBtn.addEventListener("click", (e) => {
  e.preventDefault()

  const name = document.getElementById("user").value
  const email = document.getElementById("email").value
  console.log("email:", email)
  console.log("name:", name)

  updateInformation(name, email)
})
