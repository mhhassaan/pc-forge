function initMyBuilds() {
  const user = JSON.parse(localStorage.getItem("currentUser"))

  if (!user) {
    showLoginPrompt()
    return
  }

  loadUserBuilds(user.email)
}

function showLoginPrompt() {
  const content = document.getElementById("buildsContent")
  content.innerHTML = `
    <div class="login-prompt">
      <h2>Please Log In</h2>
      <p>You need to be logged in to view your saved builds.</p>
      <button class="btn btn-primary" onclick="document.getElementById('authModal').classList.remove('hidden')">Login / Sign Up</button>
    </div>
  `
}

function loadUserBuilds(email) {
  const builds = JSON.parse(localStorage.getItem(`builds_${email}`)) || []
  const content = document.getElementById("buildsContent")

  if (builds.length === 0) {
    content.innerHTML = `
      <div class="no-builds">
        <h2>No Builds Yet</h2>
        <p>Start creating your first PC build!</p>
        <a href="build.html" class="btn btn-accent">Create Build</a>
      </div>
    `
    return
  }

  const grid = document.createElement("div")
  grid.className = "builds-grid"

  builds.forEach((build) => {
    const card = document.createElement("div")
    card.className = "build-card"

    const componentsList = Object.entries(build.components)
      .map(
        ([type, component]) => `
      <div class="component-item">
        <span class="component-label">${type.charAt(0).toUpperCase() + type.slice(1)}</span>
        <span class="component-value">${component.name || component}</span>
      </div>
    `,
      )
      .join("")

    card.innerHTML = `
      <div class="build-header">
        <div class="build-name">${build.name}</div>
        <div class="build-date">Saved: ${build.date}</div>
      </div>
      <div class="build-details">
        <div class="component-list">
          ${componentsList}
        </div>
        <div class="build-total">
          <span>Total Cost</span>
          <span class="total-price">$${build.total.toFixed(2)}</span>
        </div>
        <div class="build-actions">
          <button class="btn btn-secondary" onclick="editBuild(${build.id})">Edit</button>
          <button class="btn btn-danger" onclick="deleteBuild(${build.id}, '${email}')">Delete</button>
        </div>
      </div>
    `

    grid.appendChild(card)
  })

  content.innerHTML = ""
  content.appendChild(grid)
}

function editBuild(buildId) {
  alert("Edit functionality would load the build into the builder")
}

function deleteBuild(buildId, email) {
  if (!confirm("Are you sure you want to delete this build?")) return

  const builds = JSON.parse(localStorage.getItem(`builds_${email}`)) || []
  const filtered = builds.filter((b) => b.id !== buildId)

  localStorage.setItem(`builds_${email}`, JSON.stringify(filtered))
  loadUserBuilds(email)
}

initMyBuilds()
