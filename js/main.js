// Navigation active state
document.querySelectorAll(".nav-link").forEach((link) => {
  link.addEventListener("click", function () {
    document.querySelectorAll(".nav-link").forEach((l) => l.classList.remove("active"))
    this.classList.add("active")
  })
})

// Set active link based on current page
const currentPage = window.location.pathname.split("/").pop() || "index.html"
document.querySelectorAll(".nav-link").forEach((link) => {
  if (link.getAttribute("href") === currentPage) {
    link.classList.add("active")
  }
})

// Update auth button based on login state
function updateAuthButton() {
  const authBtn = document.getElementById("authBtn")
  const user = JSON.parse(localStorage.getItem("currentUser"))

  if (user) {
    authBtn.textContent = `Logout (${user.username})`
    authBtn.onclick = logout
  } else {
    authBtn.textContent = "Login"
    authBtn.onclick = () => document.getElementById("authModal").classList.remove("hidden")
  }
}

function logout() {
  localStorage.removeItem("currentUser")
  updateAuthButton()
  window.location.href = "index.html"
}

updateAuthButton()

document.querySelectorAll(".faq-question").forEach((question) => {
  question.addEventListener("click", function () {
    const faqItem = this.parentElement
    const isActive = faqItem.classList.contains("active")

    // Close all other FAQ items
    document.querySelectorAll(".faq-item").forEach((item) => {
      item.classList.remove("active")
    })

    // Toggle current FAQ item
    if (!isActive) {
      faqItem.classList.add("active")
    }
  })
})

// Simple hamburger toggle for mobile navigation (safe: checks for elements)
;(function () {
  const hamburger = document.getElementById('hamburger')
  const navMenu = document.getElementById('navMenu') || document.querySelector('.nav-menu')
  const navAuth = document.querySelector('.nav-auth')

  if (!hamburger || !navMenu) return

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active')
    // the CSS uses .nav-menu.active to open the menu at small widths
    navMenu.classList.toggle('active')

    // toggle auth panel visibility if it exists
    if (navAuth) navAuth.classList.toggle('active')

    // Prevent background page from scrolling when nav is open on mobile
    document.body.classList.toggle('nav-open')
  })
})()
