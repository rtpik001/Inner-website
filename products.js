// products.js — products.json পড়ে card বানায়, filter আর search চালায়
(function () {
  const grid = document.getElementById("product-grid");
  const filtersEl = document.getElementById("productFilters");
  const statusEl = document.getElementById("productStatus");
  const searchForm = document.getElementById("heroSearchForm");
  const searchInput = document.getElementById("heroSearch");
  if (!grid) return;

  let allProducts = [];
  let activeCategory = "All";
  let query = "";

  // Category অনুযায়ী thumbnail-এর রং (তোমার design-এর tint class)
  const TINTS = { Electronics: "tint-sky", Cameras: "tint-marigold", Home: "tint-pine", Books: "tint-plum" };

  // Search-এ এই শব্দগুলো ignore করবে
  const STOP_WORDS = ["for", "the", "and", "with", "under", "a", "an", "to", "me", "find", "show", "i", "want", "need", "buy"];

  // ছোট helper: element বানায়, textContent দিয়ে (XSS safe)
  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function stockInfo(stock) {
    if (stock === 0) return { text: "Out of stock", cls: "stock-out" };
    if (stock <= 2) return { text: `Only ${stock} left`, cls: "stock-low" };
    return { text: "In stock", cls: "stock-in" };
  }

  function createCard(p) {
    const stock = stockInfo(p.stock);
    const card = el("article", "product-card" + (p.stock === 0 ? " is-out" : ""));

    const thumb = el("div", "product-thumb " + (TINTS[p.category] || "tint-marigold"), p.image || "📦");
    thumb.setAttribute("aria-hidden", "true");

    const badge = el("span", "badge badge-buy", p.category);
    const title = el("h3", "product-title", p.name);
    const meta = el("p", "product-meta", `${p.condition} · ★ ${p.rating} · ${p.seller}`);

    const row = el("div", "product-row");
    row.append(el("span", "product-price", `$${p.price}`), el("span", "stock " + stock.cls, stock.text));

    const btn = el("a", "btn " + (p.stock === 0 ? "btn-outline" : "btn-primary"), p.stock === 0 ? "View details" : "Buy now");
    btn.href = `product.html?id=${encodeURIComponent(p.id)}`; // Phase 2-এ এই page বানাবো

    card.append(thumb, badge, title, meta, row, btn);
    return card;
  }

  // "laptop under $800" → { words: ["laptop"], maxPrice: 800 }
  function parseQuery(text) {
    const lower = text.toLowerCase();
    const priceMatch = lower.match(/under\s*\$?\s*(\d+)/);
    const maxPrice = priceMatch ? Number(priceMatch[1]) : null;
    const words = lower
      .replace(/under\s*\$?\s*\d+/, "")
      .split(/[^a-z0-9]+/)
      .filter((w) => w.length > 1 && !STOP_WORDS.includes(w));
    return { words, maxPrice };
  }

  function matches(p, parsed) {
    if (activeCategory !== "All" && p.category !== activeCategory) return false;
    if (parsed.maxPrice !== null && p.price > parsed.maxPrice) return false;
    if (parsed.words.length === 0) return true;
    const haystack = [p.name, p.category, p.description, ...(p.features || [])].join(" ").toLowerCase();
    return parsed.words.some((w) => haystack.includes(w));
  }

  function render() {
    const parsed = parseQuery(query);
    const list = allProducts
      .filter((p) => matches(p, parsed))
      .sort((a, b) => (b.stock > 0) - (a.stock > 0)); // in-stock আগে

    grid.textContent = "";

    if (list.length === 0) {
      const empty = el("div", "product-empty");
      empty.append(el("p", "", query ? `Nothing matches "${query}" yet.` : "No products in this category yet."));
      const reset = el("button", "btn btn-outline", "Show all products");
      reset.type = "button";
      reset.addEventListener("click", () => {
        query = "";
        activeCategory = "All";
        if (searchInput) searchInput.value = "";
        renderFilters();
        render();
      });
      empty.append(reset);
      grid.append(empty);
    } else {
      list.forEach((p) => grid.append(createCard(p)));
    }

    if (statusEl) {
      const inStock = list.filter((p) => p.stock > 0).length;
      statusEl.textContent = `Showing ${list.length} of ${allProducts.length} products · ${inStock} available`;
    }
  }

  function renderFilters() {
    if (!filtersEl) return;
    const categories = ["All", ...new Set(allProducts.map((p) => p.category))];
    filtersEl.textContent = "";
    categories.forEach((cat) => {
      const b = el("button", "filter-chip", cat);
      b.type = "button";
      b.setAttribute("aria-pressed", String(cat === activeCategory));
      b.addEventListener("click", () => {
        activeCategory = cat;
        renderFilters();
        render();
      });
      filtersEl.append(b);
    });
  }

  // Hero search box → products filter
  if (searchForm && searchInput) {
    searchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      query = searchInput.value.trim();
      activeCategory = "All";
      renderFilters();
      render();
      document.getElementById("products").scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  // ভুল data থাকলে সেই product skip করবে, পুরো site ভাঙবে না
  function isValid(p) {
    return p && typeof p.name === "string" && Number.isFinite(p.price) && Number.isFinite(p.stock);
  }

  async function load() {
    grid.textContent = "Loading products…";
    try {
      const res = await fetch("products.json");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      allProducts = Array.isArray(data) ? data.filter(isValid) : [];
      renderFilters();
      render();
    } catch (err) {
      console.error("Products load failed:", err);
      grid.textContent = "Couldn't load products. Check products.json for a typo, then refresh.";
    }
  }

  load();
})();
