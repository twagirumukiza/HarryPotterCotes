/**
 * HarryPotterCotes – Application de suivi de cote AUTOMATIQUE
 * Aucune connexion requise. Les cotes se chargent depuis data/cotes.json
 * (mis à jour par GitHub Actions) + possibilité de surcharge manuelle locale.
 */

const STORAGE_KEY = "harrypottercotes_manual_v2";
const COTES_URL = "data/cotes.json";

// État
let autoCotes = {};      // depuis data/cotes.json
let manualCotes = {};    // surcharges locales (optionnel)
let meta = { updatedAt: null, source: null };
let currentEditCode = null;

// ---------- Initialisation ----------
document.addEventListener("DOMContentLoaded", async () => {
  loadManualFromStorage();
  await loadAutoCotes();
  renderGrid();
  updateStats();
  bindEvents();
  applyTheme();
});

// ---------- Chargement automatique ----------
async function loadAutoCotes() {
  try {
    const res = await fetch(COTES_URL + "?t=" + Date.now());
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    autoCotes = data.cotes || {};
    meta.updatedAt = data.updatedAt || null;
    meta.source = data.source || "auto";
    console.log("Cotes automatiques chargées :", Object.keys(autoCotes).length, "items");
  } catch (e) {
    console.warn("Impossible de charger data/cotes.json", e);
    autoCotes = {};
  }
}

function loadManualFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) manualCotes = JSON.parse(raw);
  } catch (e) {
    manualCotes = {};
  }
}

function saveManualToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(manualCotes));
}

/** Retourne la cote effective (manuel > auto) */
function getCote(code) {
  if (manualCotes[code] && manualCotes[code].price != null) {
    return { ...manualCotes[code], origin: "manual" };
  }
  if (autoCotes[code] && autoCotes[code].price != null) {
    return {
      price: autoCotes[code].price,
      min: autoCotes[code].min,
      max: autoCotes[code].max,
      n: autoCotes[code].n,
      updated: meta.updatedAt,
      origin: "auto"
    };
  }
  return null;
}

// ---------- Rendu ----------
function renderGrid() {
  const grid = document.getElementById("figures-grid");
  const search = document.getElementById("search-input").value.toLowerCase().trim();
  const rarityFilter = document.getElementById("filter-rarity").value;
  const categoryFilter = document.getElementById("filter-category")?.value || "all";
  const sortBy = document.getElementById("sort-by").value;

  let list = [...FIGURES];

  if (search) {
    list = list.filter(f =>
      f.name.toLowerCase().includes(search) ||
      f.code.toLowerCase().includes(search) ||
      f.searchTerms.some(t => t.toLowerCase().includes(search))
    );
  }

  if (rarityFilter !== "all") {
    list = list.filter(f => f.rarity === rarityFilter);
  }

  if (categoryFilter !== "all") {
    list = list.filter(f => f.category === categoryFilter);
  }

  list.sort((a, b) => {
    if (sortBy === "name") return a.name.localeCompare(b.name);
    if (sortBy === "price-asc") {
      const pa = getCote(a.code)?.price ?? 9999;
      const pb = getCote(b.code)?.price ?? 9999;
      return pa - pb;
    }
    if (sortBy === "price-desc") {
      const pa = getCote(a.code)?.price ?? -1;
      const pb = getCote(b.code)?.price ?? -1;
      return pb - pa;
    }
    return a.id.localeCompare(b.id);
  });

  grid.innerHTML = list.map(f => createCard(f)).join("");
}

function createCard(fig) {
  const cote = getCote(fig.code);
  const hasPrice = cote && cote.price != null;
  const priceDisplay = hasPrice ? Number(cote.price).toFixed(2) + " €" : "— €";

  let metaText = "Aucune donnée";
  if (hasPrice) {
    const origin = cote.origin === "manual" ? "✏️ manuel" : "⚡ auto";
    const range = (cote.min != null && cote.max != null)
      ? " · " + cote.min.toFixed(1) + "–" + cote.max.toFixed(1) + " €"
      : "";
    const n = cote.n ? " · " + cote.n + " obs." : "";
    metaText = origin + range + n;
  }

  return `
    <article class="card" data-code="${fig.code}">
      <div class="card-header">
        <h3>${fig.name}</h3>
        <span class="card-num">#${fig.id}</span>
      </div>
      <div class="card-body">
        <div class="card-code">${fig.code}</div>
        <span class="card-rarity rarity-${fig.rarity}">
          ${fig.rarity === "gold" ? "★ Gold / Rare" : fig.rarity === "accessory" ? "Accessoire" : "Standard"}
        </span>
        <div class="card-price">
          <div class="price-value ${hasPrice ? "" : "unknown"}">${priceDisplay}</div>
          <div class="price-meta">${metaText}</div>
        </div>
        <div class="card-actions">
          <button class="btn btn-small btn-search" onclick="openMarketSearch('${fig.code}')">
            🔍 Vérifier
          </button>
          <button class="btn btn-small btn-edit" onclick="openEditModal('${fig.code}')">
            ✏️ Corriger
          </button>
        </div>
      </div>
    </article>
  `;
}

function updateStats() {
  const total = FIGURES.length;
  let withPrice = 0;
  const prices = [];

  FIGURES.forEach(f => {
    const c = getCote(f.code);
    if (c && c.price != null) {
      withPrice++;
      prices.push(c.price);
    }
  });

  const avg = prices.length ? prices.reduce((a, b) => a + b, 0) / prices.length : null;

  document.getElementById("stat-total").textContent = withPrice + "/" + total;
  document.getElementById("stat-updated").textContent = meta.updatedAt
    ? formatDate(meta.updatedAt)
    : "—";
  document.getElementById("stat-avg").textContent = avg
    ? avg.toFixed(2) + " €"
    : "—";
}

// ---------- Recherche marché (vérification manuelle) ----------
function openMarketSearch(code) {
  const fig = FIGURES.find(f => f.code === code);
  if (!fig) return;

  const qName = "Kinder Joy " + fig.name;
  const qFull = qName + " " + fig.code;

  const urls = [
    // Europe / FR
    "https://www.ebay.fr/sch/i.html?_nkw=" + encodeURIComponent(qFull) + "&LH_Sold=1&LH_Complete=1",
    "https://www.vinted.fr/catalog?search_text=" + encodeURIComponent(qName),
    "https://www.leboncoin.fr/recherche?text=" + encodeURIComponent(qName),
    // Amazon FR + Amazon JP (Asie)
    "https://www.amazon.fr/s?k=" + encodeURIComponent(qName),
    "https://www.amazon.co.jp/s?k=" + encodeURIComponent(qName),
    // Coleka – page collection + recherche
    "https://www.coleka.com/fr/kinder-surprise/series-secondaires-demontables/series-vt/kinder-joy-funko-harry-potter_r38251",
    "https://www.coleka.com/fr/search?q=" + encodeURIComponent(qFull),
    // Sites asiatiques
    "https://jp.mercari.com/search?keyword=" + encodeURIComponent(qName),
    "https://auctions.yahoo.co.jp/search/search?p=" + encodeURIComponent(qName)
  ];

  // Ouvre les onglets avec un léger décalage (évite le blocage pop-up)
  urls.forEach((url, i) => {
    setTimeout(() => window.open(url, "_blank"), i * 180);
  });
}

// ---------- Modal correction manuelle (optionnel) ----------
function openEditModal(code) {
  currentEditCode = code;
  const fig = FIGURES.find(f => f.code === code);
  const autoPrice = autoCotes[code]?.price;

  document.getElementById("modal-title").textContent = fig.name;
  document.getElementById("modal-code").textContent = "Code : " + fig.code + " · Cote auto : " + (autoPrice != null ? autoPrice.toFixed(2) + " €" : "—");

  const inputs = document.querySelectorAll(".price-input");
  const existing = manualCotes[code]?.prices || [];
  inputs.forEach((inp, i) => {
    inp.value = existing[i] != null ? existing[i] : "";
  });

  updateModalCote();
  document.getElementById("price-modal").classList.remove("hidden");
}

function closeModal() {
  document.getElementById("price-modal").classList.add("hidden");
  currentEditCode = null;
}

function updateModalCote() {
  const prices = [...document.querySelectorAll(".price-input")]
    .map(i => parseFloat(i.value))
    .filter(v => !isNaN(v) && v > 0);

  const el = document.getElementById("modal-cote");
  if (prices.length === 0) {
    el.textContent = "— (la cote auto sera utilisée)";
    return;
  }

  prices.sort((a, b) => a - b);
  const mid = Math.floor(prices.length / 2);
  const median = prices.length % 2 !== 0
    ? prices[mid]
    : (prices[mid - 1] + prices[mid]) / 2;

  el.textContent = median.toFixed(2) + " €  (médiane de " + prices.length + ")";
}

function saveCote() {
  if (!currentEditCode) return;

  const prices = [...document.querySelectorAll(".price-input")]
    .map(i => parseFloat(i.value))
    .filter(v => !isNaN(v) && v > 0);

  if (prices.length === 0) {
    delete manualCotes[currentEditCode];
  } else {
    prices.sort((a, b) => a - b);
    const mid = Math.floor(prices.length / 2);
    const median = prices.length % 2 !== 0
      ? prices[mid]
      : (prices[mid - 1] + prices[mid]) / 2;

    manualCotes[currentEditCode] = {
      price: Math.round(median * 100) / 100,
      prices,
      updated: new Date().toISOString(),
      origin: "manual"
    };
  }

  saveManualToStorage();
  renderGrid();
  updateStats();
  closeModal();
}

// ---------- Utilitaires ----------
function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function exportData() {
  const payload = {
    exportedAt: new Date().toISOString(),
    autoUpdatedAt: meta.updatedAt,
    figures: FIGURES.map(f => ({
      ...f,
      cote: getCote(f.code)
    }))
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "harrypottercotes_" + new Date().toISOString().slice(0, 10) + ".json";
  a.click();
  URL.revokeObjectURL(url);
}

async function refreshAuto() {
  const btn = document.getElementById("btn-refresh");
  btn.disabled = true;
  btn.textContent = "⏳ Chargement…";
  await loadAutoCotes();
  renderGrid();
  updateStats();
  btn.disabled = false;
  btn.textContent = "🔄 Actualiser";
}

// ---------- Thème ----------
function applyTheme() {
  const saved = localStorage.getItem("hpc_theme") || "light";
  document.documentElement.setAttribute("data-theme", saved);
  document.getElementById("theme-toggle").textContent = saved === "dark" ? "☀️" : "🌙";
}

function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme") || "light";
  const next = current === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("hpc_theme", next);
  document.getElementById("theme-toggle").textContent = next === "dark" ? "☀️" : "🌙";
}

// ---------- Events ----------
function bindEvents() {
  document.getElementById("search-input").addEventListener("input", renderGrid);
  document.getElementById("filter-rarity").addEventListener("change", renderGrid);
  document.getElementById("filter-category")?.addEventListener("change", renderGrid);
  document.getElementById("sort-by").addEventListener("change", renderGrid);

  document.getElementById("btn-refresh").addEventListener("click", refreshAuto);
  document.getElementById("btn-export").addEventListener("click", exportData);
  document.getElementById("theme-toggle").addEventListener("click", toggleTheme);

  document.getElementById("modal-close").addEventListener("click", closeModal);
  document.getElementById("modal-cancel").addEventListener("click", closeModal);
  document.getElementById("modal-save").addEventListener("click", saveCote);

  document.querySelectorAll(".price-input").forEach(inp => {
    inp.addEventListener("input", updateModalCote);
  });

  document.getElementById("price-modal").addEventListener("click", (e) => {
    if (e.target.id === "price-modal") closeModal();
  });
}
