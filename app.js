/* ============ FreshBasket Storefront — Amazon-style ============ */
const PRODUCTS_KEY = "fb_products";
const CART_KEY = "fb_cart";

const CATEGORY_EMOJI = {
  "Spices": "🌶️",
  "Grains & Pulses": "🌾",
  "Dairy & Eggs": "🥛",
  "Fruits & Vegetables": "🥬",
  "Baking": "🍞",
  "Oils & Condiments": "🫒"
};

/* ---------- Seed data (only first visit) ---------- */
function seedProducts() {
  return [
    { id: "p1", name: "Organic Turmeric Powder — Stone-Ground, Single-Origin, High Curcumin Content", price: 4.99, unit: "250g pack", category: "Spices", stock: 60, image: "", desc: "Stone-ground, single-origin turmeric with rich curcumin." },
    { id: "p2", name: "Premium Aged Basmati Rice, Extra-Long Grain, Naturally Aged 2 Years", price: 12.50, unit: "1 kg", category: "Grains & Pulses", stock: 40, image: "", desc: "Extra-long grain, naturally aged 2 years for aroma." },
    { id: "p3", name: "Farm Fresh Free-Range Eggs, Collected Daily, Pack of 12", price: 3.20, unit: "12 ct", category: "Dairy & Eggs", stock: 120, image: "", desc: "Free-range eggs collected daily from local farms." },
    { id: "p4", name: "Organic Heirloom Tomatoes, Vine-Ripened, Sweet and Juicy", price: 2.80, unit: "1 kg", category: "Fruits & Vegetables", stock: 25, image: "", desc: "Vine-ripened, sweet and juicy — perfect for salads." },
    { id: "p5", name: "Unbleached All-Purpose Flour, Finely Milled for Breads and Cakes", price: 2.40, unit: "1 kg", category: "Baking", stock: 80, image: "", desc: "Unbleached, finely milled flour for breads and cakes." },
    { id: "p6", name: "Extra Virgin Olive Oil, Cold-Pressed First Harvest, Peppery & Bright", price: 9.90, unit: "1 L", category: "Oils & Condiments", stock: 30, image: "", desc: "Cold-pressed, first harvest — peppery and bright." },
    { id: "p7", name: "Premium Green Cardamom Whole Pods, Intensely Aromatic, Grade A", price: 14.00, unit: "250g pack", category: "Spices", stock: 8, image: "", desc: "Premium whole pods, intensely aromatic." },
    { id: "p8", name: "Red Lentils (Masoor Dal), Quick-Cooking, Protein-Rich, Split", price: 5.60, unit: "1 kg", category: "Grains & Pulses", stock: 55, image: "", desc: "Quick-cooking, protein-rich split lentils." }
  ];
}

function getProducts() {
  const data = localStorage.getItem(PRODUCTS_KEY);
  if (data === null) {
    const seeded = seedProducts();
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(seeded));
    return seeded;
  }
  return JSON.parse(data);
}

/* ---------- Cart helpers ---------- */
function getCart() { return JSON.parse(localStorage.getItem(CART_KEY) || "[]"); }
function saveCart(cart) { localStorage.setItem(CART_KEY, JSON.stringify(cart)); }
function fmt(n) { return "$" + Number(n).toFixed(2); }

/* ---------- Deterministic fake rating per product ---------- */
function ratingOf(p) {
  let h = 0;
  for (const ch of p.id) h = (h * 31 + ch.charCodeAt(0)) % 997;
  return (3.6 + (h % 14) / 10).toFixed(1); // 3.6 – 4.9
}
function starsOf(rating) {
  const full = Math.round(rating);
  return "★".repeat(full) + "☆".repeat(5 - full);
}

/* ---------- Render products (Amazon-style cards) ---------- */
const grid = document.getElementById("product-grid");
const emptyMsg = document.getElementById("empty-msg");
const searchInput = document.getElementById("search-input");
const categoryFilter = document.getElementById("category-filter");
const resultsBar = document.getElementById("results-bar");
let products = getProducts();

function renderCategories() {
  const cats = [...new Set(products.map(p => p.category))];
  cats.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    categoryFilter.appendChild(opt);
  });
}

function priceParts(price) {
  const [whole, fraction] = Number(price).toFixed(2).split(".");
  return { whole, fraction };
}

function renderProducts() {
  const q = searchInput.value.trim().toLowerCase();
  const cat = categoryFilter.value;

  const filtered = products.filter(p => {
    const matchQ = p.name.toLowerCase().includes(q) || (p.desc || "").toLowerCase().includes(q);
    const matchC = cat === "all" || p.category === cat;
    return matchQ && matchC;
  });

  resultsBar.innerHTML = `<strong>${filtered.length} result${filtered.length !== 1 ? "s" : ""}</strong>${q ? ` for "<strong>${q}</strong>"` : ""}${cat !== "all" ? ` in <strong>${cat}</strong>` : ""}`;
  grid.innerHTML = "";
  emptyMsg.hidden = filtered.length > 0;

  filtered.forEach(p => {
    const card = document.createElement("div");
    card.className = "product-card";

    const { whole, fraction } = priceParts(p.price);
    const rating = ratingOf(p);
    const out = p.stock <= 0;
    const low = !out && p.stock <= 10;
    const bestSeller = p.stock >= 50;

    let badges = "";
    if (bestSeller) badges += `<span class="badge-bestseller">Best Seller</span>`;
    if (low) badges += `<span class="badge-lowstock">Only ${p.stock} left!</span>`;

    const imgHtml = p.image
      ? `<img src="${p.image}" alt="" onerror="this.outerHTML='<div class=product-emoji>${CATEGORY_EMOJI[p.category] || "🥗"}</div>'">`
      : `<div class="product-emoji">${CATEGORY_EMOJI[p.category] || "🥗"}</div>`;

    card.innerHTML = `
      ${badges}
      <div class="product-img">${imgHtml}</div>
      <div class="product-title" title="${p.name}">${p.name}</div>
      <div class="rating-row">
        <span class="stars">${starsOf(rating)}</span>
        <span class="rating-count">${(ratingOf(p) * 137 % 9000 + 400).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</span>
      </div>
      <div class="price-row">
        <span class="price-currency">$</span>
        <span class="price-whole">${whole}</span>
        <span class="price-fraction">${fraction}</span>
        <span class="price-unit">(${p.unit})</span>
      </div>
      <div class="stock-line ${out ? "out" : low ? "low" : ""}">${out ? "Currently unavailable" : low ? `Hurry — only ${p.stock} left in stock!` : "In stock"}</div>
      <button class="btn-addcart" ${out ? "disabled" : ""}>${out ? "Out of Stock" : "Add to Cart"}</button>
      ${out ? "" : `<button class="btn-buynow">Buy Now</button>`}
    `;

    card.querySelector(".btn-addcart").addEventListener("click", () => addToCart(p.id));
    const buyBtn = card.querySelector(".btn-buynow");
    if (buyBtn) buyBtn.addEventListener("click", () => { addToCart(p.id, true); });
    grid.appendChild(card);
  });
}

/* ---------- Cart logic ---------- */
const cartBtn = document.getElementById("cart-btn");
const cartDrawer = document.getElementById("cart-drawer");
const cartOverlay = document.getElementById("cart-overlay");
const cartItemsEl = document.getElementById("cart-items");
const cartTotalEl = document.getElementById("cart-total");
const cartCountEl = document.getElementById("cart-count");

function addToCart(id, goCheckout = false) {
  const cart = getCart();
  const item = cart.find(i => i.id === id);
  const p = products.find(x => x.id === id);
  if (item) {
    if (item.qty < p.stock) item.qty += 1;
  } else {
    cart.push({ id, qty: 1 });
  }
  saveCart(cart);
  renderCart();
  if (goCheckout) openCart();
}

function renderCart() {
  const cart = getCart();
  const totalQty = cart.reduce((s, i) => s + i.qty, 0);
  cartCountEl.textContent = totalQty;
  cartItemsEl.innerHTML = "";
  let total = 0;

  if (cart.length === 0) {
    cartItemsEl.innerHTML = `<p class="empty-msg">Your Amazon Cart is empty.</p>`;
  }

  cart.forEach(item => {
    const p = products.find(x => x.id === item.id);
    if (!p) return;
    total += p.price * item.qty;

    const qtyOpts = Array.from({ length: Math.min(10, p.stock) }, (_, i) =>
      `<option value="${i + 1}" ${i + 1 === item.qty ? "selected" : ""}>Qty: ${i + 1}</option>`
    ).join("");

    const row = document.createElement("div");
    row.className = "cart-item";
    row.innerHTML = `
      <div class="cart-item-thumb">${p.image ? "🖼️" : (CATEGORY_EMOJI[p.category] || "🥗")}</div>
      <div class="cart-item-info">
        <div class="cart-item-name">${p.name}</div>
        <span class="instock-note">In stock</span>
        <div class="cart-item-price">${fmt(p.price)}</div>
        <div class="qty-controls" style="margin-top:6px">
          <select class="qty-select">${qtyOpts}</select>
          <button class="remove-link">Delete</button>
        </div>
      </div>`;
    row.querySelector(".qty-select").addEventListener("change", e => setQty(item.id, parseInt(e.target.value, 10)));
    row.querySelector(".remove-link").addEventListener("click", () => removeFromCart(item.id));
    cartItemsEl.appendChild(row);
  });

  cartTotalEl.textContent = fmt(total);
}

function setQty(id, qty) {
  let cart = getCart();
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty = qty;
  if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
  saveCart(cart);
  renderCart();
}
function removeFromCart(id) {
  saveCart(getCart().filter(i => i.id !== id));
  renderCart();
}

function openCart() { cartDrawer.hidden = false; cartOverlay.hidden = false; }
function closeCart() { cartDrawer.hidden = true; cartOverlay.hidden = true; }

cartBtn.addEventListener("click", openCart);
document.getElementById("close-cart").addEventListener("click", closeCart);
cartOverlay.addEventListener("click", closeCart);
document.getElementById("checkout-btn").addEventListener("click", () => {
  const cart = getCart();
  if (cart.length === 0) return;
  cart.forEach(item => {
    const p = products.find(x => x.id === item.id);
    if (p) p.stock = Math.max(0, p.stock - item.qty);
  });
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  saveCart([]);
  renderCart();
  renderProducts();
  closeCart();
  alert("✅ Order placed! Thank you for shopping at FreshBasket.");
});

/* ---------- Search & filters ---------- */
searchInput.addEventListener("input", renderProducts);
categoryFilter.addEventListener("change", renderProducts);
document.getElementById("search-form").addEventListener("submit", e => e.preventDefault());

/* Sub-nav "Today's Deals" → sort by lowest price */
document.getElementById("subnav-deals").addEventListener("click", e => {
  e.preventDefault();
  products = [...products].sort((a, b) => a.price - b.price);
  renderProducts();
});

/* Footer back-to-top */
document.getElementById("back-to-top").addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

/* ---------- Init ---------- */
renderCategories();
renderProducts();
renderCart();