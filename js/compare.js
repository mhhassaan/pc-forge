function getComponents() {
  return window.componentsDB || window.components || {}
}

let selectedComp1 = null
let selectedComp2 = null

async function ensureComponentsLoaded() {
  if (window.componentsDB || window.components) return
  try {
    const res = await fetch('js/components-db.json', { cache: 'no-store' })
    if (!res.ok) throw new Error('Failed to fetch components DB: ' + res.status)
    const data = await res.json()
    // expose both names to be compatible with older code
    window.componentsDB = data
    window.components = data
  } catch (err) {
    console.warn('Could not load components DB for compare page:', err)
    // leave window.componentsDB undefined; handlers will handle empty data
  }
}

// Initialize
async function initCompare() {
  await ensureComponentsLoaded()

  document.getElementById("component1Type").addEventListener("change", handleType1Change)
  document.getElementById("component2Type").addEventListener("change", handleType2Change)
  document.getElementById("component1").addEventListener("change", handleComp1Change)
  document.getElementById("component2").addEventListener("change", handleComp2Change)

  // If type selects are empty (only placeholder), populate them from the DB keys
  const comp = getComponents()
  const types = Object.keys(comp)
  if (types.length) {
    const t1 = document.getElementById('component1Type')
    const t2 = document.getElementById('component2Type')
    // Only add types if there are no real options besides the placeholder
    if (t1 && t1.options.length <= 1) {
      types.forEach(type => {
        const o = document.createElement('option')
        o.value = type
        o.textContent = type.charAt(0).toUpperCase() + type.slice(1)
        t1.appendChild(o)
      })
    }
    if (t2 && t2.options.length <= 1) {
      types.forEach(type => {
        const o = document.createElement('option')
        o.value = type
        o.textContent = type.charAt(0).toUpperCase() + type.slice(1)
        t2.appendChild(o)
      })
    }
  }
}

// Handle type selection
function handleType1Change() {
  const type = document.getElementById("component1Type").value
  const select = document.getElementById("component1")
  select.disabled = !type
  select.innerHTML = '<option value="">Select Component</option>'

  const comps = getComponents()
  if (type && comps[type]) {
    comps[type].forEach((comp) => {
      const option = document.createElement("option")
      option.value = JSON.stringify(comp)
      option.textContent = comp.name
      select.appendChild(option)
    })
  }

  selectedComp1 = null;
  updateComparison();
}

function handleType2Change() {
  const type = document.getElementById("component2Type").value
  const select = document.getElementById("component2")
  select.disabled = !type
  select.innerHTML = '<option value="">Select Component</option>'

  const comps = getComponents()
  if (type && comps[type]) {
    comps[type].forEach((comp) => {
      const option = document.createElement("option")
      option.value = JSON.stringify(comp)
      option.textContent = comp.name
      select.appendChild(option)
    })
  }
  selectedComp2 = null;
  updateComparison();
}

// Handle component selection
function handleComp1Change() {
  const value = document.getElementById("component1").value
  selectedComp1 = value ? JSON.parse(value) : null
  updateComparison()
}

function handleComp2Change() {
  const value = document.getElementById("component2").value
  selectedComp2 = value ? JSON.parse(value) : null
  updateComparison()
}

// Update comparison table
function updateComparison() {
  const table = document.getElementById("comparisonTable")
  const noSelection = document.getElementById("noSelection")

  if (!selectedComp1 || !selectedComp2) {
    table.classList.add("hidden")
    noSelection.style.display = "block"
    return
  }

  table.classList.remove("hidden")
  noSelection.style.display = "none"

  document.getElementById("comp1Header").textContent = selectedComp1.name
  document.getElementById("comp2Header").textContent = selectedComp2.name

  const tbody = document.getElementById("comparisonBody")
  tbody.innerHTML = ""

  // Brand
  addComparisonRow("Brand", selectedComp1.brand, selectedComp2.brand)

  // Build spec objects that include price for comparison
  const specs1 = Object.assign({}, selectedComp1.specs, { price: selectedComp1.basePrice })
  const specs2 = Object.assign({}, selectedComp2.specs, { price: selectedComp2.basePrice })

  const allSpecs = new Set([...Object.keys(specs1), ...Object.keys(specs2)])

  allSpecs.forEach((spec) => {
    const val1 = specs1[spec]
    const val2 = specs2[spec]

    let better1 = false
    let better2 = false

    // Determine which is better (higher is usually better, except for price and TDP)
    if (spec === "price" || spec === "tdp") {
      // handle undefined values gracefully
      if (typeof val1 === 'number' && typeof val2 === 'number') {
        better1 = val1 < val2
        better2 = val2 < val1
      }
    } else if (typeof val1 === 'number' && typeof val2 === 'number') {
      better1 = val1 > val2
      better2 = val2 > val1
    }

    addComparisonRow(formatSpecName(spec), val1, val2, better1, better2)
  })
}

// Add comparison row
function addComparisonRow(label, val1, val2, better1 = false, better2 = false) {
  const tbody = document.getElementById("comparisonBody")
  const row = document.createElement("tr")

  row.innerHTML = `
    <td class="spec-label">${label}</td>
    <td class="spec-value ${better1 ? "better" : ""}">${formatValue(val1)}</td>
    <td class="spec-value ${better2 ? "better" : ""}">${formatValue(val2)}</td>
  `

  tbody.appendChild(row)
}

// Format spec name
function formatSpecName(spec) {
  return spec
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim()
}

// Format value
function formatValue(value) {
  if (typeof value === "number") {
    if (value > 1000) return (value / 1000).toFixed(1) + "K"
    return value.toString()
  }
  return value
}

initCompare()
