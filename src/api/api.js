// ─────────────────────────────────────────────────────────────
//  API SERVICE LAYER — Vercel Serverless + Supabase
// ─────────────────────────────────────────────────────────────

import { DEMO_MODE } from "./config";

const delay = (ms = 500) => new Promise((r) => setTimeout(r, ms));

// Safe fetch — handles empty responses and errors cleanly
async function safeFetch(url, options) {
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`HTTP ${res.status}: ${text}`);
    }
    const text = await res.text();
    if (!text || text.trim() === "") return { success: true };
    try { return JSON.parse(text); } catch { return { success: true }; }
  } catch (e) {
    console.error("API error:", url, e.message);
    throw e;
  }
}

// ── AUTH: Login ───────────────────────────────────────────────
export async function loginUser(phone, password) {
  if (DEMO_MODE) {
    await delay(600);
    const DEMO_USERS = [
      { user_id:1, name:"Ali Hassan",      phone:"03001234567", password:"password123", role:"customer", address:"House 12, Block C, Faisalabad" },
      { user_id:3, name:"Mohammad Waseem", phone:"03211112222", password:"password123", role:"dhobi",    address:"Shop 5, Gol Chakkar, Faisalabad" },
      { user_id:5, name:"Admin User",      phone:"03000000001", password:"password123", role:"admin",    address:"Head Office, Islamabad" },
    ];
    const u = DEMO_USERS.find(u => u.phone === phone && u.password === password);
    if (!u) return null;
    const { password: _, ...user } = u;
    return user;
  }
  const data = await safeFetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, password }),
  });
  if (!data || data.success !== 1) return null;
  return {
    user_id: data.user_id,
    name:    data.name,
    role:    data.role,
    address: data.address,
    phone,
  };
}

// ── AUTH: Signup ──────────────────────────────────────────────
export async function signupUser({ name, phone, password, role, address }) {
  if (DEMO_MODE) { await delay(700); return { user_id: Date.now(), name, phone, role, address }; }
  const data = await safeFetch("/api/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, phone, password, role, address }),
  });
  if (!data || data.success !== 1) return null;
  return { user_id: data.user_id, name: data.name, role: data.role, address: data.address, phone };
}

// ── GET all orders for a customer (with items) ────────────────
export async function fetchOrders(userId) {
  if (!userId) return [];
  if (DEMO_MODE) { await delay(600); return []; }
  const data = await safeFetch(`/api/orders?user_id=${userId}`);
  const orders = data.items ?? [];
  return Promise.all(orders.map(async (o) => {
    try {
      const r = await safeFetch(`/api/order-items?order_id=${o.order_id}`);
      return { ...o, items: r.items ?? [] };
    } catch { return { ...o, items: [] }; }
  }));
}

// ── GET delivery status log ───────────────────────────────────
export async function fetchStatusLog(orderId) {
  if (DEMO_MODE) { await delay(300); return []; }
  const data = await safeFetch(`/api/order-log?order_id=${orderId}`);
  return data.items ?? [];
}

// ── GET all active services ───────────────────────────────────
export async function fetchServices() {
  if (DEMO_MODE) { await delay(300); return []; }
  const data = await safeFetch("/api/services");
  return data.items ?? [];
}

// ── POST place a new order ────────────────────────────────────
export async function placeOrder(payload) {
  if (DEMO_MODE) { await delay(900); return { success: true, order_id: Date.now() }; }

  // Step 1: create order header
  const orderData = await safeFetch("/api/place-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id:        payload.user_id,
      pickup_date:    payload.pickup_date,
      time_slot:      payload.time_slot,
      address:        payload.address,
      notes:          payload.notes ?? "",
      pickup_type:    payload.pickup_type ?? "pickup",
      return_type:    payload.return_type ?? "deliver",
      payment_method: payload.payment_method ?? "COD",
    }),
  });

  const orderId = orderData?.order_id;
  if (!orderId) throw new Error("Order created but no order_id returned");

  // Step 2: insert each item
  for (const item of payload.items) {
    await safeFetch("/api/add-item", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        order_id:   orderId,
        cloth_type: item.cloth_type,
        quantity:   item.quantity,
        service_id: item.service_id,
        price:      item.price,
      }),
    });
  }

  return { success: true, order_id: orderId };
}

// ── GET unassigned orders ─────────────────────────────────────
export async function fetchUnassignedOrders() {
  if (DEMO_MODE) { await delay(500); return []; }
  const data = await safeFetch("/api/unassigned-orders");
  const orders = data.items ?? [];
  return Promise.all(orders.map(async (o) => {
    try {
      const r = await safeFetch(`/api/order-items?order_id=${o.order_id}`);
      return { ...o, items: r.items ?? [] };
    } catch { return { ...o, items: [] }; }
  }));
}

// ── GET dhobi's assigned orders ───────────────────────────────
export async function fetchDhobiOrders(dhobiId) {
  if (!dhobiId) return [];
  if (DEMO_MODE) { await delay(500); return []; }
  const data = await safeFetch(`/api/dhobi-orders?dhobi_id=${dhobiId}`);
  const orders = data.items ?? [];
  return Promise.all(orders.map(async (o) => {
    try {
      const r = await safeFetch(`/api/order-items?order_id=${o.order_id}`);
      return { ...o, items: r.items ?? [] };
    } catch { return { ...o, items: [] }; }
  }));
}

// ── POST accept order ─────────────────────────────────────────
export async function acceptOrder(orderId, dhobiId) {
  if (DEMO_MODE) { await delay(700); return { success: true }; }
  await safeFetch("/api/accept-order", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ order_id: orderId, dhobi_id: dhobiId }),
  });
  return { success: true };
}

// ── POST update order status ──────────────────────────────────
export async function updateOrderStatus(orderId, newStatus, updatedBy) {
  if (DEMO_MODE) { await delay(500); return { success: true }; }
  await safeFetch("/api/update-status", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ order_id: orderId, new_status: newStatus, updated_by: updatedBy }),
  });
  return { success: true };
}

// ── GET demand forecast ───────────────────────────────────────
export async function fetchDemandForecast() {
  if (DEMO_MODE) { await delay(400); return []; }
  const data = await safeFetch("/api/demand-forecast");
  return data.items ?? [];
}

// ── GET all dhobis ────────────────────────────────────────────
export async function fetchDhobis() {
  if (DEMO_MODE) { await delay(300); return []; }
  const data = await safeFetch("/api/dhobis");
  return data.items ?? [];
}

// ── ADMIN: GET all users ──────────────────────────────────────
export async function fetchAllUsers() {
  if (DEMO_MODE) { await delay(400); return []; }
  const data = await safeFetch("/api/admin/users");
  return data.items ?? [];
}

// ── ADMIN: POST add user ──────────────────────────────────────
export async function addUser(payload) {
  if (DEMO_MODE) { await delay(400); return { success: true }; }
  await safeFetch("/api/admin/users", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return { success: true };
}

// ── ADMIN: GET all orders ─────────────────────────────────────
export async function fetchAllOrders() {
  if (DEMO_MODE) { await delay(500); return []; }
  const data = await safeFetch("/api/admin/all-orders");
  return data.items ?? [];
}

// ── ADMIN: POST assign dhobi ──────────────────────────────────
export async function adminAssignDhobi(orderId, dhobiId) {
  if (DEMO_MODE) { await delay(600); return { success: true }; }
  await safeFetch("/api/admin/assign-dhobi", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ order_id: orderId, dhobi_id: dhobiId }),
  });
  return { success: true };
}

// ── ADMIN: POST update service price ─────────────────────────
export async function updateServicePrice(serviceId, price) {
  if (DEMO_MODE) { await delay(400); return { success: true }; }
  await safeFetch("/api/admin/update-price", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ service_id: serviceId, price }),
  });
  return { success: true };
}

// ── ADMIN: GET revenue analytics ──────────────────────────────
export async function fetchRevenue() {
  if (DEMO_MODE) { await delay(400); return []; }
  const data = await safeFetch("/api/admin/revenue");
  return data.items ?? [];
}
