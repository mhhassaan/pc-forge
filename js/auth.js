const authModal = document.getElementById("authModal")
const authTabs = document.querySelectorAll(".auth-tab")
const authForms = document.querySelectorAll(".auth-form")
const loginForm = document.getElementById("loginForm")
const signupForm = document.getElementById("signupForm")
const modalClose = document.querySelector(".modal-close")

// Tab switching
authTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const tabName = tab.getAttribute("data-tab")

    authTabs.forEach((t) => t.classList.remove("active"))
    authForms.forEach((f) => f.classList.remove("active"))

    tab.classList.add("active")
    document.getElementById(`${tabName}Form`).classList.add("active")
  })
})

// Close modal
modalClose.addEventListener("click", () => {
  authModal.classList.add("hidden")
})

authModal.addEventListener("click", (e) => {
  if (e.target === authModal) {
    authModal.classList.add("hidden")
  }
})

// Login form
loginForm.addEventListener("submit", (e) => {
  e.preventDefault()
  const email = loginForm.querySelector('input[type="email"]').value
  const password = loginForm.querySelector('input[type="password"]').value

  const users = JSON.parse(localStorage.getItem("users")) || []
  const user = users.find((u) => u.email === email && u.password === password)

  if (user) {
    localStorage.setItem(
      "currentUser",
      JSON.stringify({
        username: user.username,
        email: user.email,
      }),
    )
    authModal.classList.add("hidden")
    loginForm.reset()
    location.reload()
  } else {
    alert("Invalid email or password")
  }
})

// Signup form
signupForm.addEventListener("submit", (e) => {
  e.preventDefault()
  const username = signupForm.querySelector('input[type="text"]').value
  const email = signupForm.querySelector('input[type="email"]').value
  const password = signupForm.querySelectorAll('input[type="password"]')[0].value
  const confirmPassword = signupForm.querySelectorAll('input[type="password"]')[1].value

  if (password !== confirmPassword) {
    alert("Passwords do not match")
    return
  }

  const users = JSON.parse(localStorage.getItem("users")) || []

  if (users.find((u) => u.email === email)) {
    alert("Email already registered")
    return
  }

  users.push({ username, email, password })
  localStorage.setItem("users", JSON.stringify(users))

  localStorage.setItem("currentUser", JSON.stringify({ username, email }))
  authModal.classList.add("hidden")
  signupForm.reset()
  location.reload()
})
