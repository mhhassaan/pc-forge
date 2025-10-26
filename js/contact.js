const contactForm = document.getElementById("contactForm")

contactForm.addEventListener("submit", (e) => {
  e.preventDefault()

  const name = document.getElementById("name").value
  const email = document.getElementById("email").value
  const subject = document.getElementById("subject").value
  const message = document.getElementById("message").value

  // Simulate storing message (in real app, would send to server)
  const messages = JSON.parse(localStorage.getItem("contactMessages")) || []
  messages.push({
    id: Date.now(),
    name,
    email,
    subject,
    message,
    date: new Date().toLocaleString(),
  })

  localStorage.setItem("contactMessages", JSON.stringify(messages))

  alert("Thank you for your message! We'll get back to you soon.")
  contactForm.reset()
})
