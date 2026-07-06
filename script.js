// Ma'lumotlarni localStorage'da saqlaymiz
const STORAGE_KEY = "sotuv_products";

let products = loadProducts();

// DOM elementlari
const form = document.getElementById("productForm");
const nameInput = document.getElementById("name");
const priceInput = document.getElementById("price");
const qtyInput = document.getElementById("qty");
const tableBody = document.getElementById("productBody");
const emptyState = document.getElementById("emptyState");
const searchInput = document.getElementById("search");
const statCount = document.getElementById("statCount");
const statValue = document.getElementById("statValue");

// --- Saqlash / yuklash ---
function loadProducts() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveProducts() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

// --- Formatlash ---
function formatMoney(num) {
  return new Intl.NumberFormat("uz-UZ").format(num);
}

// --- Qo'shish ---
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = nameInput.value.trim();
  const price = parseFloat(priceInput.value);
  const qty = parseInt(qtyInput.value, 10);

  if (!name || isNaN(price) || isNaN(qty)) return;

  products.push({
    id: Date.now(),
    name,
    price,
    qty,
  });

  saveProducts();
  render();
  form.reset();
  qtyInput.value = 1;
  nameInput.focus();
});

// --- O'chirish ---
function deleteProduct(id) {
  const item = products.find((p) => p.id === id);
  if (item && confirm(`"${item.name}" mahsulotini o'chirasizmi?`)) {
    products = products.filter((p) => p.id !== id);
    saveProducts();
    render();
  }
}

// --- Qidiruv ---
searchInput.addEventListener("input", render);

// --- Chizish ---
function render() {
  const query = searchInput.value.trim().toLowerCase();
  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(query)
  );

  tableBody.innerHTML = "";

  filtered.forEach((p, index) => {
    const total = p.price * p.qty;
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${escapeHtml(p.name)}</td>
      <td class="num">${formatMoney(p.price)} so'm</td>
      <td class="num">${p.qty}</td>
      <td class="num">${formatMoney(total)} so'm</td>
      <td><button class="btn btn-danger" data-id="${p.id}">🗑 O'chirish</button></td>
    `;
    tableBody.appendChild(row);
  });

  // O'chirish tugmalariga hodisa biriktirish
  tableBody.querySelectorAll(".btn-danger").forEach((btn) => {
    btn.addEventListener("click", () =>
      deleteProduct(Number(btn.dataset.id))
    );
  });

  // Bo'sh holat
  emptyState.style.display = filtered.length === 0 ? "block" : "none";

  // Statistika (butun ro'yxat bo'yicha, qidiruvdan qat'i nazar)
  const totalCount = products.reduce((sum, p) => sum + p.qty, 0);
  const totalValue = products.reduce((sum, p) => sum + p.price * p.qty, 0);
  statCount.textContent = totalCount;
  statValue.textContent = formatMoney(totalValue);
}

// XSS'dan himoya
function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// Boshlang'ich chizish
render();
