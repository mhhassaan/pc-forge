// Use the shared components DB exposed by js/components-db.js via getComponents()

const selectedComponents = {}
let filteredComponents = []
let currentSort = 'default'

// Helper to access the latest components source (may be set asynchronously)
function getComponents() {
  return window.componentsDB || window.components || {}
}

// Load components JSON directly (primary source). This fetch runs at
// startup so we don't rely on an external loader file.
async function loadComponentsJSON() {
  try {
    const res = await fetch('js/components-db.json', { cache: 'no-store' })
    if (!res.ok) {
      console.warn('components-db.json not found (status ' + res.status + ')')
      // leave window.components if already set by other means, otherwise empty
      window.componentsDB = window.components || {}
      window.components = window.componentsDB
      return window.componentsDB
    }
    const json = await res.json()
    window.componentsDB = json
    window.components = json
    console.debug('Loaded components DB from js/components-db.json (direct load in build.js)')
    return json
  } catch (err) {
    console.error('Failed to load js/components-db.json', err)
    window.componentsDB = window.components || {}
    window.components = window.componentsDB
    return window.componentsDB
  }
}

// Initialize
async function init() {
  // Always attempt to load the JSON; this avoids depending on a separate loader file.
  await loadComponentsJSON()

  loadAllComponents()
  setupEventListeners()
  // updatePrices()
  setInterval(updatePrices, 3000)
}

// Load all components
function loadAllComponents() {
  filteredComponents = Object.values(getComponents()).flat()
  filteredComponents.forEach((component) => {
    component.currentPrice = component.basePrice // initialize current price
  })
  renderComponents()
}

// Setup event listeners
function setupEventListeners() {
  document.getElementById("componentFilter").addEventListener("change", applyFilters)
  document.querySelectorAll(".brand-filter").forEach((checkbox) => {
    checkbox.addEventListener("change", applyFilters)
  })
  document.getElementById("priceRange").addEventListener("input", (e) => {
    document.getElementById("priceValue").textContent = e.target.value
    applyFilters()
  })
  document.getElementById("specsFilter").addEventListener("input", applyFilters)
  document.getElementById("resetFilters").addEventListener("click", resetFilters)
  const sortSelect = document.getElementById('sortSelect')
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      currentSort = e.target.value
      applySort()
      renderComponents()
    })
  }
  document.getElementById("saveBuildBtn").addEventListener("click", saveBuild)
  document.getElementById("myBuildsBtn").addEventListener("click", () => {
    window.location.href = "my-builds.html"
  })
}

// Apply filters
function applyFilters() {
  const componentType = document.getElementById("componentFilter").value
  const selectedBrands = Array.from(document.querySelectorAll(".brand-filter:checked")).map((cb) => cb.value)
  const maxPrice = Number.parseInt(document.getElementById("priceRange").value)
  const specsFilter = document.getElementById("specsFilter").value.toLowerCase()

  let filtered = Object.values(getComponents()).flat()

  if (componentType) {
    const comps = getComponents()
    filtered = filtered.filter((c) => {
      for (const type in comps) {
        if (comps[type].includes(c)) return type === componentType
      }
    })
  }

  if (selectedBrands.length > 0) {
    filtered = filtered.filter((c) => selectedBrands.includes(c.brand))
  }

  filtered = filtered.filter((c) => c.basePrice <= maxPrice)

  if (specsFilter) {
    filtered = filtered.filter((c) => c.specs.toLowerCase().includes(specsFilter))
  }

  filteredComponents = filtered
  applySort()
  renderComponents()
}

// Apply current sort to filteredComponents
function applySort() {
  if (!currentSort || currentSort === 'default') return

  const parts = currentSort.split('-') // e.g., ['price','asc']
  const key = parts[0]
  const dir = parts[1] || 'asc'

  filteredComponents.sort((a, b) => {
    if (key === 'price') {
      return dir === 'asc' ? a.basePrice - b.basePrice : b.basePrice - a.basePrice
    }
    if (key === 'name') {
      const na = a.name.toLowerCase()
      const nb = b.name.toLowerCase()
      if (na < nb) return dir === 'asc' ? -1 : 1
      if (na > nb) return dir === 'asc' ? 1 : -1
      return 0
    }
    if (key === 'brand') {
      const ba = a.brand.toLowerCase()
      const bb = b.brand.toLowerCase()
      if (ba < bb) return dir === 'asc' ? -1 : 1
      if (ba > bb) return dir === 'asc' ? 1 : -1
      return 0
    }
    return 0
  })
}

// Render components
function renderComponents() {
  const grid = document.getElementById("componentsList")
  grid.innerHTML = ""

  if (filteredComponents.length === 0) {
    grid.innerHTML =
      '<p style="grid-column: 1/-1; text-align: center; color: var(--text-secondary);">No components found</p>'
    return
  }

  filteredComponents.forEach((component) => {
    const card = document.createElement("div")
    card.className = "component-card"

    // Derive a human-friendly specs string from the specs object if needed
    let specsText = ""
    if (typeof component.specs === "string") {
      specsText = component.specs
    } else if (typeof component.specs === "object") {
      // Prefer common fields when available
      if (component.specs.cores && component.specs.threads) {
        specsText = `${component.specs.cores} cores, ${component.specs.threads} threads`
      } else if (component.specs.vram) {
        specsText = `${component.specs.vram}GB VRAM`
      } else if (component.specs.capacity) {
        specsText = `${component.specs.capacity}TB ${component.specs.type || ""}`.trim()
      } else if (component.specs.speed) {
        specsText = `${component.specs.speed} ${component.specs.type || ""}`.trim()
      } else {
        // Fallback: join object entries
        specsText = Object.entries(component.specs)
          .map(([k, v]) => `${k}: ${v}`)
          .join(" • ")
      }
    }

    card.innerHTML = `
      <div class="component-image">${component.image ? `<img src="${component.image}" alt="${component.name}"/>` : '💻'}</div>
      <div class="component-info">
        <div class="component-name">${component.name}</div>
        <div class="component-brand">${component.brand}</div>
        <div class="component-specs">${specsText}</div>
        <div class="component-price">$${component.currentPrice || component.basePrice}</div>
        <button class="btn btn-primary" onclick="selectComponent(${component.id})">Select</button>
      </div>
    `
    grid.appendChild(card)
  })
}

// Select component
function selectComponent(componentId) {
  const component = Object.values(getComponents())
    .flat()
    .find((c) => c.id === componentId)

  if (!component) return

  const type = Object.keys(getComponents()).find((key) => getComponents()[key].some((c) => c.id === componentId))
  selectedComponents[type] = component
  updateSummary()
  updateSaveBuildButton()
}

// // Update prices (simulate market fluctuation)
// function updatePrices() {
//   Object.values(components)
//     .flat()
//     .forEach((component) => {
//       const variance = (Math.random() - 0.5) * 0.1
//       component.currentPrice = Math.round(component.basePrice * (1 + variance) * 100) / 100
//     })

//   renderComponents()
//   updateSummary()
// }

// Update summary panel
function updateSummary() {
  const summary = document.getElementById("buildSummary")
  const types = ["cpu", "gpu", "motherboard", "ram", "storage"]
  let total = 0

  types.forEach((type) => {
    const item = summary.querySelector(`[data-type="${type}"]`) || createSummaryItem(type)
    if (selectedComponents[type]) {
      item.querySelector(".summary-value").textContent =
        `${selectedComponents[type].name} - $${selectedComponents[type].currentPrice}`
      total += selectedComponents[type].currentPrice
    } else {
      item.querySelector(".summary-value").textContent = "Not selected"
    }
  })

  document.querySelector(".total-price").textContent = `$${total.toFixed(2)}`
}

// Create summary item
function createSummaryItem(type) {
  const labelMap = {
    cpu: "CPU",
    gpu: "GPU",
    motherboard: "Motherboard",
    ram: "RAM",
    storage: "Storage"
  }

  const summary = document.getElementById("buildSummary");
  const item = document.createElement("div");
  item.className = "summary-item";
  item.setAttribute("data-type", type);

  // We now use the labelMap to get the correct string
  item.innerHTML = `
    <span>${labelMap[type]}</span> 
    <span class="summary-value">Not selected</span>
  `;

  // This inserts the new item before the divider line
  summary.insertBefore(item, summary.querySelector(".summary-divider"));
  return item;
}

// Save build
function saveBuild() {
  const user = JSON.parse(localStorage.getItem("currentUser"))
  if (!user) {
    alert("Please login to save builds")
    return
  }

  const buildName = prompt("Enter build name:")
  if (!buildName) return

  const builds = JSON.parse(localStorage.getItem(`builds_${user.email}`)) || []
  const total = Object.values(selectedComponents).reduce((sum, c) => sum + c.currentPrice, 0)

  builds.push({
    id: Date.now(),
    name: buildName,
    components: { ...selectedComponents },
    total: total,
    date: new Date().toLocaleDateString(),
  })

  localStorage.setItem(`builds_${user.email}`, JSON.stringify(builds))
  alert("Build saved successfully!")
}

// Reset filters
function resetFilters() {
  document.getElementById("componentFilter").value = ""
  document.querySelectorAll(".brand-filter").forEach((cb) => (cb.checked = false))
  document.getElementById("priceRange").value = 5000
  document.getElementById("priceValue").textContent = "5000"
  document.getElementById("specsFilter").value = ""
  loadAllComponents()
}

// If no external loader exists, create a fallback that loads the JSON
// so the app keeps working when `js/components-db.js` is removed.
if (!window.componentsDBReady) {
  window.componentsDBReady = (async () => {
    try {
      const res = await fetch('js/components-db.json', { cache: 'no-store' })
      if (!res.ok) {
        console.warn('components-db.json not found (status ' + res.status + ')')
        window.componentsDB = {}
        window.components = window.componentsDB
        return window.componentsDB
      }
      const json = await res.json()
      window.componentsDB = json
      window.components = json
      console.debug('Loaded components DB from js/components-db.json (fallback loader in build.js)')
      return json
    } catch (err) {
      console.error('Failed to load components-db.json (build.js fallback)', err)
      window.componentsDB = {}
      window.components = window.componentsDB
      return window.componentsDB
    }
  })()
}

// Start initialization (async init returns a promise but we don't need to await it here)
init()
