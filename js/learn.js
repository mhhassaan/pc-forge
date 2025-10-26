function toggleContent(button) {
  const card = button.closest(".learn-card")
  const content = card.querySelector(".expanded-content")

  content.classList.toggle("hidden")

  if (content.classList.contains("hidden")) {
    button.textContent = "Learn More"
  } else {
    button.textContent = "Show Less"
  }
}
