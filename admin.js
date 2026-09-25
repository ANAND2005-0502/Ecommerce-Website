/* ============ FreshBasket Owner Dashboard ============ */
const PRODUCTS_KEY = "fb_products";

const CATEGORY_EMOJI = {
  "Spices": "🌶️",
  "Grains & Pulses": "🌾",
  "Dairy & Eggs": "🥛",
  "Fruits & Vegetables": "🥬",
  "Baking": "🍞",
  "Oils & Condiments": "🫒"
};

function seedProducts() {
  return [
    { id: "p1", name: "Organic Turmeric Powder", price: 4.99, unit: "250g", category: "Spices", stock: 60, image: "", desc: "Stone-ground, single-origin turmeric with rich curcumin." },
    { id: "p2", name: "Basmati Rice (Aged)", price: 12.50, unit: "kg", category: "Grains & Pulses", stock: 40, image: "", desc: "Extra-long grain, naturally aged 2 years for aroma." },
    { id: "p3", name: "Farm Fresh Eggs", price: 3.20, unit: "pc", category: "Dairy & Eggs", stock: 120, image: "", desc: "Free-range eggs collected daily from local farms." },
    { id: "p4", name: "Heirloom Tomatoes", price: 2.80, unit: "kg", category: "Fruits & Vegetables", stock: 25, image: "", desc: "Vine-ripened, sweet and juicy — perfect for salads." },
    { id: "p5", name: "All-Purpose Flour", price: 2.40, unit: "kg", category: "Baking", stock: 80, image: "", desc: "Unbleached, finely milled flour for breads and cakes." },
    { id: "p6", name: "Extra Virgin Olive Oil", price: 9.90, unit: "L", category: "Oils & Condiments", stock: 30, image: "", desc: "Cold-pressed, first harvest — peppery and bright." },
    { id: "p7", name: "Green Cardamom", price: 14.00, unit: "250g", category: "Spices", stock: 8, image: "", desc: "Premium whole pods, intensely aromatic." },
    { id: "p8", name: "Red Lentils (Masoor)", price: 5.60, unit: "kg", category: "Grains & Pulses", stock: 55, image: "", desc: "Quick-cooking, protein-rich split lentils." }
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
function saveProducts(list) {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(list));
}
function fmt(n) { return "$" + Number(n).toFixed(2); }
function uid() { return "p" + Date.now() + Math.random().toString(36).slice(2, 6); }

/* ---------- DOM refs ---------- */
const form = document.getElementById("product-form");
const formTitle = document.getElementById("form-title");
const saveBtn = document.getElementById("save-btn");
const cancelEditBtn = document.getElementById("cancel-edit");
const listEl = document.getElementById("admin-list");
const emptyEl = document.getElementById("admin-empty");
const countEl = document.getElementById("prod-count");
const toast = document.getElementById("toast");

const f = {
  id: document.getElementById("p-id"),
  name: document.getElementById("p-name"),
  price: document.getElementById("p-price"),
  unit: document.getElementById("p-unit"),
  category: document.getElementById("p-category"),
  stock: document.getElementById("p-stock"),
  image: document.getElementById("p-image"),
  desc: document.getElementById("p-desc")
};

let products = getProducts();

/* ---------- Render list ---------- */
function renderList() {
  listEl.innerHTML = "";
  emptyEl.hidden = products.length > 0;
  countEl.textContent = products.length;

  products.forEach(p => {
    const row = document.createElement("div");
    row.className = "admin-item";
    const stockWarn = p.stock <= 10 ? `style="color:#c62828;font-weight:700"` : "";
    row.innerHTML = `
      ${p.image
        ? `<img class="thumb" src="${p.image}" onerror="this.outerHTML='<div class=thumb>${CATEGORY_EMOJI[p.category] || "🥗"}</div>'">`
        : `<div class="thumb">${CATEGORY_EMOJI[p.category] || "🥗"}</div>`}
      <div class="admin-item-info">
        <div class="admin-item-name">${p.name}</div>
        <div class="admin-item-meta">
          ${p.category} · ${fmt(p.price)} / ${p.unit} ·
          <span ${stockWarn}>${p.stock} in stock</span>
        </div>
      </div>
      <div class="admin-item-actions">
        <button class="btn btn-ghost" data-a="edit">✏️ Edit</button>
        <button class="btn btn-danger" data-a="del">🗑️ Delete</button>
      </div>`;

    row.querySelector('[data-a="edit"]').addEventListener("click", () => startEdit(p.id));
    row.querySelector('[data-a="del"]').addEventListener("click", () => removeProduct(p.id));
    listEl.appendChild(row);
  });
}

/* ---------- Add / Edit ---------- */
form.addEventListener("submit", e => {
  e.preventDefault();
  const editingId = f.id.value;

  const product = {
    id: editingId || uid(),
    name: f.name.value.trim(),
    price: parseFloat(f.price.value),
    unit: f.unit.value,
    category: f.category.value,
    stock: parseInt(f.stock.value, 10),
    image: f.image.value.trim(),
    desc: f.desc.value.trim()
  };

  if (editingId) {
    const idx = products.findIndex(p => p.id === editingId);
    if (idx > -1) products[idx] = product;
    showToast(`✏️ "${product.name}" updated!`);
  } else {
    products.push(product);
    showToast(`✅ "${product.name}" added to your store!`);
  }

  saveProducts(products);
  resetForm();
  renderList();
});

function startEdit(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;
  f.id.value = p.id;
  f.name.value = p.name;
  f.price.value = p.price;
  f.unit.value = p.unit;
  f.category.value = p.category;
  f.stock.value = p.stock;
  f.image.value = p.image;
  f.desc.value = p.desc;

  formTitle.textContent = "✏️ Edit Ingredient";
  saveBtn.textContent = "Save Changes";
  cancelEditBtn.hidden = false;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function resetForm() {
  form.reset();
  f.id.value = "";
  formTitle.textContent = "➕ Add New Ingredient";
  saveBtn.textContent = "Add Ingredient";
  cancelEditBtn.hidden = true;
}

cancelEditBtn.addEventListener("click", resetForm);

/* ---------- Delete ---------- */
function removeProduct(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;
  if (!confirm(`Delete "${p.name}" from your store?`)) return;
  products = products.filter(x => x.id !== id);
  saveProducts(products);
  renderList();
  showToast(`🗑️ "${p.name}" deleted.`);
}

/* ---------- Toast ---------- */
let toastTimer;
function showToast(msg) {
  toast.textContent = msg;
  toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (toast.hidden = true), 2600);
}

/* ---------- Init ---------- */
renderList();