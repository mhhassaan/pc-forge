// prefer the centralized gallery builds defined in gallery-db.js if present
// do NOT declare a global `builds` here; always read from the centralized `window.galleryBuilds`
function getBuilds() {
  return window.galleryBuilds || []
}

let currentFilter = "all"
let currentGallerySort = 'default'

async function initGallery() {
  // Try to fetch a JSON DB first (if available) to avoid script-order/timing issues.
  await loadGalleryJSON()

  // If galleryBuilds isn't available yet this logs a helpful message. We always read via getBuilds().
  if (!getBuilds() || getBuilds().length === 0) {
    console.warn('gallery.js: no builds available to render. Check that gallery-db.js or gallery-db.json defines the data and that it is included/served correctly')
  } else {
    console.debug('gallery.js: loaded builds from window.galleryBuilds', getBuilds().length)
  }

  renderGallery()
  setupFilterButtons()
  setupSort()
}

// Load gallery data from JSON file (optional). This avoids reliance on script order.
async function loadGalleryJSON() {
  try {
    const res = await fetch('js/gallery-db.json', { cache: 'no-store' })
    if (!res.ok) return
    const data = await res.json()
    if (data.builds && data.builds.length) window.galleryBuilds = data.builds
    if (data.gallery && data.gallery.length) window.galleryDB = data.gallery
    console.debug('gallery.js: successfully loaded gallery-db.json')
  } catch (e) {
    // silent fail — we'll rely on existing globals if available
    console.debug('gallery.js: could not load gallery-db.json', e.message)
  }
}

function renderGallery() {
  const grid = document.getElementById("galleryGrid")
  grid.innerHTML = ""

  const sourceBuilds = getBuilds()
  const filtered = currentFilter === "all" ? sourceBuilds : sourceBuilds.filter((b) => b.category === currentFilter)

  // create a shallow copy and apply sorting
  const sorted = [...filtered]
  applyGallerySort(sorted)

  sorted.forEach((build) => {
    const card = document.createElement("div")
    card.className = "gallery-card"
    // try to find an image in the gallery DB (falls back to emoji)
    const galleryEntry = (window.galleryDB || []).find((g) => g.id === build.id) || {}
    const imageHtml = galleryEntry.image
      ? `<img src="${galleryEntry.image}" alt="${build.name}" />`
      : build.icon

    card.innerHTML = `
      <div class="gallery-image ${build.category}">${imageHtml}</div>
      <div class="gallery-content">
        <span class="gallery-category">${build.category.toUpperCase()}</span>
        <h3>${build.name}</h3>
        <p class="gallery-specs">${build.specs}</p>
        <div class="gallery-price">$${build.price.toLocaleString()}</div>
        <div class="gallery-buttons">
          <button class="btn btn-secondary" onclick="viewBuild(${build.id})">View Build</button>
          <button class="btn btn-primary" onclick="saveBuildFromGallery(${build.id})">Save</button>
        </div>
      </div>
    `
    grid.appendChild(card)
  })
}

function setupFilterButtons() {
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"))
      btn.classList.add("active")
      currentFilter = btn.getAttribute("data-category")
      renderGallery()
    })
  })
}

function setupSort() {
  const sortSelect = document.getElementById('gallerySortSelect')
  if (!sortSelect) return
  sortSelect.addEventListener('change', (e) => {
    currentGallerySort = e.target.value
    renderGallery()
  })
}

function applyGallerySort(arr) {
  if (!currentGallerySort || currentGallerySort === 'default') return

  const parts = currentGallerySort.split('-')
  const key = parts[0]
  const dir = parts[1] || 'asc'

  arr.sort((a, b) => {
    if (key === 'price') {
      return dir === 'asc' ? a.price - b.price : b.price - a.price
    }
    if (key === 'name') {
      const na = a.name.toLowerCase()
      const nb = b.name.toLowerCase()
      if (na < nb) return dir === 'asc' ? -1 : 1
      if (na > nb) return dir === 'asc' ? 1 : -1
      return 0
    }
    return 0
  })
}

function viewBuild(buildId) {
  const build = getBuilds().find((b) => b.id === buildId)
  if (build) {
    alert(`${build.name}\n\n${build.specs}\n\nPrice: $${build.price.toLocaleString()}`)
  }
}

function saveBuildFromGallery(buildId) {
  const user = JSON.parse(localStorage.getItem("currentUser"))
  if (!user) {
    alert("Please login to save builds")
    document.getElementById("authModal").classList.remove("hidden")
    return
  }

  const build = getBuilds().find((b) => b.id === buildId)
  const userBuilds = JSON.parse(localStorage.getItem(`builds_${user.email}`)) || []

  userBuilds.push({
    id: Date.now(),
    name: build.name,
    components: build.components,
    total: build.price,
    date: new Date().toLocaleDateString(),
  })

  localStorage.setItem(`builds_${user.email}`, JSON.stringify(userBuilds))
  alert(`${build.name} saved to your builds!`)
}

initGallery()
