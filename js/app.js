/**
 * HarryPotterCotes – Application de suivi de cote
 * Stockage local + liens de recherche marché
 */

const STORAGE_KEY = "harrypottercotes_data_v1";

// État
let cotes = {};          // { code: { price, prices[], updated, source } }
let currentEditCode = null;

// ---------- Initialisation ----------
document.addEventListener("DOMContentLoaded", () => {
  loadFromStorage();
  renderGrid();
  updateStats();
  bindEvents();
  applyTheme();
});

// ---------- Stockage ----------
function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) cotes = JSON.parse(raw);
  } catch (e) {
    console.warn("Impossible de charger les cotes locales", e);
    cotes = {};
  }
}

function saveToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cotes));
}

// ---------- Rendu ----------
function renderGrid() {
  const grid = document.getElementById("figures-grid");
  const search = document.getElementById("search-input").value.toLowerCase().trim();
  const rarityFilter = document.getElementById("filter-rarity").value;
  const categoryFilter = document.getElementById("filter-category")?.value || "all";
  const sortBy = document.getElementById("sort-by").value;

  let list = [...FIGURES];

  // Filtre recherche
  if (search) {
    list = list.filter(f =>
      f.name.toLowerCase().includes(search) ||
      f.code.toLowerCase().includes(search) ||
      f.searchTerms.some(t => t.toLowerCase().includes(search))
    );
  }

  // Filtre rareté
  if (rarityFilter !== "all") {
    list = list.filter(f => f.rarity === rarityFilter);
  }

  // Filtre catégorie
  if (categoryFilter !== "all") {
    list = list.filter(f => f.category === categoryFilter);
  }

  // Tri
  list.sort((a, b) => {
    if (sortBy === "name") return a.name.localeCompare(b.name);
    if (sortBy === "price-asc") {
      const pa = cotes[a.code]?.price ?? 9999;
      const pb = cotes[b.code]?.price ?? 9999;
      return pa - pb;
    }
    if (sortBy === "price-desc") {
      const pa = cotes[a.code]?.price ?? -1;
      const pb = cotes[b.code]?.price ?? -1;
      return pb - pa;
    }
    return a.id.localeCompare(b.id); // number
  });

  grid.innerHTML = list.map(f => createCard(f)).join("");
}

function createCard(fig) {
  const cote = cotes[fig.code];
  const hasPrice = cote && cote.price != null;
  const priceDisplay = hasPrice
    ? `${cote.price.toFixed(2)} €`
    : "— €";
  const meta = hasPrice
    ? `MAJ ${formatDate(cote.updated)} · ${cote.prices?.length || 1} obs.`
    : "Aucune observation";

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
          <div class="price-meta">${meta}</div>
        </div>
        <div class="card-actions">
          <button class="btn btn-small btn-search" onclick="openMarketSearch('${fig.code}')">
            🔍 Chercher
          </button>
          <button class="btn btn-small btn-edit" onclick="openEditModal('${fig.code}')">
            ✏️ Saisir
          </button>
        </div>
      </div>
    </article>
  `;
}

function updateStats() {
  const total = FIGURES.length;
  const withPrice = Object.values(cotes).filter(c => c.price != null).length;
  const prices = Object.values(cotes).filter(c => c.price != null).map(c => c.price);
  const avg = prices.length ? (prices.reduce((a, b) => a + b, 0) / prices.length) : null;

  const lastUpdate = Object.values(cotes)
    .map(c => c.updated)
    .filter(Boolean)
    .sort()
    .pop();

  document.getElementById("stat-total").textContent = `${withPrice}/${total}`;
  document.getElementById("stat-updated").textContent = lastUpdate
    ? formatDate(lastUpdate)
    : "—";
  document.getElementById("stat-avg").textContent = avg
    ? `${avg.toFixed(2)} €`
    : "—";
}

// ---------- Recherche marché ----------
function openMarketSearch(code) {
  const fig = FIGURES.find(f => f.code === code);
  if (!fig) return;

  const query = encodeURIComponent(`Kinder Joy ${fig.name} Quidditch`);
  const queryCode = encodeURIComponent(`Kinder Joy ${fig.code}`);

  // eBay FR (ventes terminées)
  const ebay = `https://www.ebay.fr/sch/i.html?_nkw=${query}&_sacat=0&LH_Sold=1&LH_Complete=1&rt=nc&LH_PrefLoc=1`;
  // Vinted
  const vinted = `https://www.vinted.fr/catalog?search_text=${query}`;
  // Leboncoin
  const leboncoin = `https://www.leboncoin.fr/recherche?text=${query}`;

  // Ouvre 3 onglets
  window.open(ebay, "_blank");
  setTimeout(() => window.open(vinted, "_blank"), 300);
  setTimeout(() => window.open(leboncoin, "_blank"), 600);

  // Propose ensuite de saisir
  setTimeout(() => {
    if (confirm(`Les recherches pour « ${fig.name} » sont ouvertes.\n\nVeux-tu saisir les prix observés maintenant ?`)) {
      openEditModal(code);
    }
  }, 1000);
}

// ---------- Modal saisie ----------
function openEditModal(code) {
  currentEditCode = code;
  const fig = FIGURES.find(f => f.code === code);
  const cote = cotes[code] || {};

  document.getElementById("modal-title").textContent = fig.name;
  document.getElementById("modal-code").textContent = `Code : ${fig.code}`;

  const inputs = document.querySelectorAll(".price-input");
  inputs.forEach((inp, i) => {
    inp.value = cote.prices && cote.prices[i] != null ? cote.prices[i] : "";
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
    el.textContent = "—";
    return;
  }

  // Médiane
  prices.sort((a, b) => a - b);
  const mid = Math.floor(prices.length / 2);
  const median = prices.length % 2 !== 0
    ? prices[mid]
    : (prices[mid - 1] + prices[mid]) / 2;

  el.textContent = `${median.toFixed(2)} €  (médiane de ${prices.length})`;
}

function saveCote() {
  if (!currentEditCode) return;

  const prices = [...document.querySelectorAll(".price-input")]
    .map(i => parseFloat(i.value))
    .filter(v => !isNaN(v) && v > 0);

  if (prices.length === 0) {
    alert("Entre au moins un prix valide.");
    return;
  }

  prices.sort((a, b) => a - b);
  const mid = Math.floor(prices.length / 2);
  const median = prices.length % 2 !== 0
    ? prices[mid]
    : (prices[mid - 1] + prices[mid]) / 2;

  cotes[currentEditCode] = {
    price: Math.round(median * 100) / 100,
    prices: prices,
    updated: new Date().toISOString(),
    source: "manual"
  };

  saveToStorage();
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
    figures: FIGURES.map(f => ({
      ...f,
      cote: cotes[f.code] || null
    }))
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `harrypottercotes_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
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

  document.getElementById("btn-refresh").addEventListener("click", () => {
    loadFromStorage();
    renderGrid();
    updateStats();
  });

  document.getElementById("btn-export").addEventListener("click", exportData);
  document.getElementById("theme-toggle").addEventListener("click", toggleTheme);

  document.getElementById("modal-close").addEventListener("click", closeModal);
  document.getElementById("modal-cancel").addEventListener("click", closeModal);
  document.getElementById("modal-save").addEventListener("click", saveCote);

  document.querySelectorAll(".price-input").forEach(inp => {
    inp.addEventListener("input", updateModalCote);
  });

  // Fermer modal en cliquant dehors
  document.getElementById("price-modal").addEventListener("click", (e) => {
    if (e.target.id === "price-modal") closeModal();
  });
}
