// --- Supabase ulanishi ---
const SUPABASE_URL = "https://tjvsvspbywjyeuybpbbo.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqdnN2c3BieXdqeWV1eWJwYmJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMzMDg0MzQsImV4cCI6MjA5ODg4NDQzNH0.kxVQoIQpDY1smO6RstEcvAMyxkZjNIi3emtt8TnXnlI";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let products = [];

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
const submitBtn = form.querySelector("button[type=submit]");

// --- Formatlash ---
function formatMoney(num) {
  return new Intl.NumberFormat("uz-UZ").format(num);
}

// --- Bazadan o'qish ---
async function fetchProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    alert("Mahsulotlarni yuklashda xatolik: " + error.message);
    return;
  }
  products = data;
  render();
}

// --- Qo'shish ---
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = nameInput.value.trim();
  const price = parseFloat(priceInput.value);
  const qty = parseInt(qtyInput.value, 10);

  if (!name || isNaN(price) || isNaN(qty)) return;

  submitBtn.disabled = true;
  const { error } = await supabase
    .from("products")
    .insert({ name, price, qty });
  submitBtn.disabled = false;

  if (error) {
    alert("Qo'shishda xatolik: " + error.message);
    return;
  }

  form.reset();
  qtyInput.value = 1;
  nameInput.focus();
  await fetchProducts();
});

// --- O'chirish ---
async function deleteProduct(id) {
  const item = products.find((p) => p.id === id);
  if (!item || !confirm(`"${item.name}" mahsulotini o'chirasizmi?`)) return;

  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) {
    alert("O'chirishda xatolik: " + error.message);
    return;
  }
  await fetchProducts();
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

  tableBody.querySelectorAll(".btn-danger").forEach((btn) => {
    btn.addEventListener("click", () =>
      deleteProduct(Number(btn.dataset.id))
    );
  });

  emptyState.style.display = filtered.length === 0 ? "block" : "none";

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

// Boshlang'ich yuklash
fetchProducts();
