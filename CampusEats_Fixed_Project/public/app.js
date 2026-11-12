const API = "/api";
let token = localStorage.getItem("campuseats_token") || "";
let user = JSON.parse(localStorage.getItem("campuseats_user") || "null");
let foods = [];
let category = "All";
let cart = JSON.parse(localStorage.getItem("campuseats_cart") || "[]");
let authMode = "login";

const $ = (id) => document.getElementById(id);
const rupees = (n) => `₹${Number(n).toFixed(0)}`;
const headers = () => ({ "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) });

function toast(message) {
  $("toast").textContent = message;
  $("toast").classList.add("show");
  setTimeout(() => $("toast").classList.remove("show"), 2600);
}
function saveCart() { localStorage.setItem("campuseats_cart", JSON.stringify(cart)); renderCart(); }
function updateAccount() {
  $("welcomeText").textContent = user ? `Hi, ${user.name.split(" ")[0]}` : "Welcome, student";
  $("authOpen").classList.toggle("hidden", !!user);
  $("logoutBtn").classList.toggle("hidden", !user);
}
function foodEmoji(food) {
  const s = `${food.name} ${food.category}`.toLowerCase();
  if (/coffee|drink|soda|juice|tea/.test(s)) return "🥤";
  if (/fries|snack|chips/.test(s)) return "🍟";
  if (/dosa|rice|meal|paneer|thali/.test(s)) return "🍛";
  if (/pizza/.test(s)) return "🍕";
  if (/burger|roll|sandwich/.test(s)) return "🍔";
  return "🥪";
}
async function loadFoods() {
  const params = new URLSearchParams();
  if (category !== "All") params.set("category", category);
  if ($("searchInput").value.trim()) params.set("search", $("searchInput").value.trim());
  $("foodGrid").innerHTML = '<p class="muted">Loading menu…</p>';
  try {
    const res = await fetch(`${API}/foods?${params}`);
    foods = await res.json();
    renderFoods();
  } catch (_err) { $("foodGrid").innerHTML = '<p class="muted">Could not load menu. Check that the server and MongoDB are running.</p>'; }
}
function renderFoods() {
  if (!foods.length) { $("foodGrid").innerHTML = '<p class="muted">No matching food found. Try another search.</p>'; return; }
  $("foodGrid").innerHTML = foods.map(food => `
    <article class="food-card">
      <div class="food-visual">${food.image ? `<img src="${escapeHTML(food.image)}" alt="" style="width:100%;height:100%;object-fit:cover">` : foodEmoji(food)}<small>${escapeHTML(food.category)}</small></div>
      <div class="food-info"><h3>${escapeHTML(food.name)}</h3><p>${escapeHTML(food.restaurant)} · ${escapeHTML(food.location || "Near campus")}</p>
      <div class="food-meta"><span class="price">${rupees(food.price)}</span><button data-add="${food._id}">＋ Add</button></div></div>
    </article>`).join("");
  document.querySelectorAll("[data-add]").forEach(btn => btn.addEventListener("click", () => addToCart(btn.dataset.add)));
}
function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function addToCart(id) {
  const food = foods.find(item => item._id === id);
  if (!food) return;
  const found = cart.find(item => item.foodId === id);
  if (found) found.quantity += 1;
  else cart.push({ foodId: id, name: food.name, restaurant: food.restaurant, price: food.price, quantity: 1 });
  saveCart(); toast(`${food.name} added to cart`);
}
function renderCart() {
  $("cartCount").textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  $("cartTotal").textContent = rupees(total);
  $("checkoutTotal").textContent = rupees(total);
  if (!cart.length) { $("cartItems").innerHTML = '<p class="muted">Your cart is empty.</p>'; return; }
  $("cartItems").innerHTML = cart.map(item => `<div class="cart-row"><div><strong>${escapeHTML(item.name)}</strong><small>${escapeHTML(item.restaurant)} · ${rupees(item.price)} each</small></div><div class="qty"><button data-minus="${item.foodId}">−</button><b>${item.quantity}</b><button data-plus="${item.foodId}">＋</button></div></div>`).join("");
  document.querySelectorAll("[data-minus]").forEach(b => b.onclick = () => changeQty(b.dataset.minus, -1));
  document.querySelectorAll("[data-plus]").forEach(b => b.onclick = () => changeQty(b.dataset.plus, 1));
}
function changeQty(id, delta) {
  const item = cart.find(x => x.foodId === id);
  if (!item) return;
  item.quantity += delta;
  cart = cart.filter(x => x.quantity > 0);
  saveCart();
}
function openDrawer() { $("cartDrawer").classList.add("open"); $("cartBackdrop").classList.remove("hidden"); }
function closeDrawer() { $("cartDrawer").classList.remove("open"); $("cartBackdrop").classList.add("hidden"); }
function openModal(id) { $(id).classList.remove("hidden"); }
function closeModal(id) { $(id).classList.add("hidden"); }
function setAuthMode(mode) {
  authMode = mode;
  $("authTitle").textContent = mode === "login" ? "Login to your account" : "Create your account";
  $("nameLabel").classList.toggle("hidden", mode === "login");
  $("nameLabel").querySelector("input").required = mode === "register";
  $("authSubmit").textContent = mode === "login" ? "Login" : "Create account";
  document.querySelectorAll(".tab").forEach(t => t.classList.toggle("active", t.dataset.mode === mode));
  $("authMessage").textContent = "";
}
async function authSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const data = Object.fromEntries(new FormData(form));
  try {
    const res = await fetch(`${API}/auth/${authMode}`, { method: "POST", headers: headers(), body: JSON.stringify(data) });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || "Authentication failed.");
    token = result.token; user = result.user;
    localStorage.setItem("campuseats_token", token);
    localStorage.setItem("campuseats_user", JSON.stringify(user));
    updateAccount(); closeModal("authModal"); form.reset(); toast("You are signed in!");
  } catch (err) { $("authMessage").textContent = err.message; }
}
async function addFoodSubmit(event) {
  event.preventDefault();
  if (!token) { openModal("authModal"); toast("Please log in to submit a menu item."); return; }
  const data = Object.fromEntries(new FormData(event.currentTarget));
  try {
    const res = await fetch(`${API}/foods`, { method: "POST", headers: headers(), body: JSON.stringify(data) });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message);
    event.currentTarget.reset(); $("addFoodMessage").textContent = "Food item submitted and added to the menu.";
    category = "All"; document.querySelectorAll(".filter").forEach(f => f.classList.toggle("active", f.dataset.category === "All"));
    await loadFoods(); toast("Food item added!");
  } catch (err) { $("addFoodMessage").textContent = err.message || "Could not add food item."; }
}
async function checkoutSubmit(event) {
  event.preventDefault();
  if (!token) { closeModal("checkoutModal"); openModal("authModal"); toast("Log in before placing your order."); return; }
  if (!cart.length) return;
  const data = Object.fromEntries(new FormData(event.currentTarget));
  data.items = cart.map(item => ({ foodId: item.foodId, quantity: item.quantity }));
  try {
    const res = await fetch(`${API}/orders`, { method: "POST", headers: headers(), body: JSON.stringify(data) });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || "Could not place order.");
    cart = []; saveCart(); closeModal("checkoutModal"); closeDrawer();
    toast(`Order placed! Total ${rupees(result.order.total)}`);
    event.currentTarget.reset();
  } catch (err) { $("checkoutMessage").textContent = err.message; }
}
async function loadOrders() {
  if (!token) { openModal("authModal"); toast("Log in to view your orders."); return; }
  openModal("ordersModal"); $("ordersList").innerHTML = '<p class="muted">Loading…</p>';
  try {
    const res = await fetch(`${API}/orders/mine`, { headers: headers() });
    const orders = await res.json();
    $("ordersList").innerHTML = orders.length ? orders.map(o => `<div class="order-card"><strong>${rupees(o.total)} · ${escapeHTML(o.orderStatus)}</strong><p>${o.items.map(i => `${escapeHTML(i.name)} × ${i.quantity}`).join(", ")}</p><small>${new Date(o.createdAt).toLocaleString()} · ${escapeHTML(o.paymentMethod)} · ${escapeHTML(o.paymentStatus)}</small></div>`).join("") : '<p class="muted">No orders yet.</p>';
  } catch (_err) { $("ordersList").innerHTML = '<p class="muted">Could not load orders.</p>'; }
}

$("authOpen").onclick = () => { setAuthMode("login"); openModal("authModal"); };
$("logoutBtn").onclick = () => { token = ""; user = null; localStorage.removeItem("campuseats_token"); localStorage.removeItem("campuseats_user"); updateAccount(); toast("Logged out."); };
$("cartOpen").onclick = openDrawer; $("cartClose").onclick = closeDrawer; $("cartBackdrop").onclick = closeDrawer;
$("checkoutOpen").onclick = () => { if (!cart.length) return toast("Your cart is empty."); closeDrawer(); if (!token) { openModal("authModal"); return toast("Please log in to continue."); } openModal("checkoutModal"); };
$("ordersBtn").onclick = loadOrders;
$("authForm").addEventListener("submit", authSubmit);
$("addFoodForm").addEventListener("submit", addFoodSubmit);
$("checkoutForm").addEventListener("submit", checkoutSubmit);
$("searchInput").addEventListener("input", loadFoods);
document.querySelectorAll(".filter").forEach(btn => btn.addEventListener("click", () => {
  category = btn.dataset.category;
  document.querySelectorAll(".filter").forEach(f => f.classList.toggle("active", f === btn));
  loadFoods();
}));
document.querySelectorAll("[data-mode]").forEach(btn => btn.onclick = () => setAuthMode(btn.dataset.mode));
document.querySelectorAll("[data-close]").forEach(btn => btn.onclick = () => closeModal(btn.dataset.close));
document.querySelectorAll(".modal").forEach(modal => modal.addEventListener("click", e => { if (e.target === modal) closeModal(modal.id); }));
updateAccount(); renderCart(); loadFoods();
