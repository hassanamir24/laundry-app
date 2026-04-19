import { BASE_URL, DEMO_MODE } from "./config";
import { MOCK_ORDERS, MOCK_SERVICES, MOCK_USER } from "./mockData";

const delay = (ms = 500) => new Promise(r => setTimeout(r, ms));

// ── GET user ─────────────────────────────────────────────────
export async function fetchUser(userId) {
  if (DEMO_MODE) { await delay(300); return MOCK_USER; }
  const res  = await fetch(`${BASE_URL}/admin/users`);
  const data = await res.json();
  return (data.items ?? []).find(u => u.user_id === userId) ?? null;
}

// ── GET orders for customer ───────────────────────────────────
export async function fetchOrders(userId) {
  if (DEMO_MODE) { await delay(600); return MOCK_ORDERS; }
  const res    = await fetch(`${BASE_URL}/orders?user_id=${userId}`);
  if (!res.ok) throw new Error("Failed to load orders");
  const data   = await res.json();
  const orders = data.items ?? [];
  return Promise.all(orders.map(async o => {
    const r = await fetch(`${BASE_URL}/order-items?order_id=${o.order_id}`);
    const d = await r.json();
    return { ...o, items: d.items ?? [] };
  }));
}

// ── GET order detail ──────────────────────────────────────────
export async function fetchOrderDetail(orderId) {
  if (DEMO_MODE) { await delay(400); return MOCK_ORDERS.find(o => o.order_id === orderId) ?? null; }
  const res  = await fetch(`${BASE_URL}/orders?order_id=${orderId}`);
  const data = await res.json();
  return data.items?.[0] ?? null;
}

// ── GET status log ────────────────────────────────────────────
export async function fetchStatusLog(orderId) {
  if (DEMO_MODE) { await delay(300); return MOCK_ORDERS.find(o => o.order_id === orderId)?.status_log ?? []; }
  const res  = await fetch(`${BASE_URL}/order-log?order_id=${orderId}`);
  if (!res.ok) throw new Error("Failed to load status log");
  const data = await res.json();
  return data.items ?? [];
}

// ── GET services ──────────────────────────────────────────────
export async function fetchServices() {
  if (DEMO_MODE) { await delay(300); return MOCK_SERVICES; }
  const res  = await fetch(`${BASE_URL}/services`);
  if (!res.ok) throw new Error("Failed to load services");
  const data = await res.json();
  return data.items ?? [];
}

// ── GET dhobis ────────────────────────────────────────────────
export async function fetchDhobis() {
  if (DEMO_MODE) {
    await delay(300);
    return [
      { user_id:4, name:"Mohammad Waseem", phone:"03211112222", address:"Shop 5, Gol Chakkar, Faisalabad" },
      { user_id:5, name:"Asif Laundry",    phone:"03333334444", address:"Main Market, Gulberg, Lahore" },
    ];
  }
  const res  = await fetch(`${BASE_URL}/dhobis`);
  if (!res.ok) throw new Error("Failed to load dhobis");
  const data = await res.json();
  return data.items ?? [];
}

// ── POST place order ──────────────────────────────────────────
export async function placeOrder(payload) {
  if (DEMO_MODE) {
    await delay(900);
    return { success: true, order_id: Math.max(...MOCK_ORDERS.map(o => o.order_id)) + 1 };
  }
  const res = await fetch(`${BASE_URL}/place-order`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id:        payload.user_id,
      pickup_date:    payload.pickup_date,
      time_slot:      payload.time_slot,
      address:        payload.address,
      notes:          payload.notes,
      pickup_type:    payload.pickup_type,
      return_type:    payload.return_type,
      payment_method: payload.payment_method,
    }),
  });
  if (!res.ok) throw new Error("Failed to place order");
  const data = await res.json();
  const orderId = data.order_id;

  for (const item of payload.items) {
    await fetch(`${BASE_URL}/add-item`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order_id: orderId, cloth_type: item.cloth_type, quantity: item.quantity, service_id: item.service_id, price: item.price }),
    });
  }
  return { success: true, order_id: orderId };
}

// ── GET unassigned orders ─────────────────────────────────────
export async function fetchUnassignedOrders() {
  if (DEMO_MODE) {
    await delay(500);
    return [
      { order_id:10, order_date:new Date().toISOString(), pickup_date:new Date(Date.now()+86400000).toISOString(), status:"Pending", total_amount:320, notes:"Handle with care", customer_name:"Fatima Noor", customer_phone:"03001112222", customer_address:"Plot 5, Gulberg, Faisalabad", time_slot:"10AM-12PM", pickup_address:"Plot 5, Gulberg, Faisalabad", items:[{cloth_type:"Shirt",quantity:2,service_name:"Wash & Iron",line_total:160},{cloth_type:"Jeans",quantity:2,service_name:"Wash & Iron",line_total:160}] },
      { order_id:11, order_date:new Date().toISOString(), pickup_date:new Date(Date.now()+86400000).toISOString(), status:"Pending", total_amount:150, notes:null,              customer_name:"Omar Butt",   customer_phone:"03009998888", customer_address:"House 8, Canal Road, Faisalabad",   time_slot:"2PM-4PM",  pickup_address:"House 8, Canal Road, Faisalabad",   items:[{cloth_type:"Suit",quantity:1,service_name:"Dry Clean",line_total:150}] },
    ];
  }
  const res  = await fetch(`${BASE_URL}/unassigned-orders`);
  if (!res.ok) throw new Error("Failed to load unassigned orders");
  const data = await res.json();
  const orders = data.items ?? [];
  return Promise.all(orders.map(async o => {
    const r = await fetch(`${BASE_URL}/order-items?order_id=${o.order_id}`);
    const d = await r.json();
    return { ...o, items: d.items ?? [] };
  }));
}

// ── GET dhobi assigned orders ─────────────────────────────────
export async function fetchDhobiOrders(dhobiId) {
  if (DEMO_MODE) {
    await delay(500);
    return [{ order_id:1, order_date:new Date(Date.now()-86400000).toISOString(), pickup_date:new Date().toISOString(), status:"Washing", total_amount:400, notes:"Use mild detergent", customer_name:"Ali Hassan", customer_phone:"03001234567", customer_address:"House 12, Block C, Faisalabad", time_slot:"8AM-10AM", pickup_address:"House 12, Block C, Faisalabad", items:[{cloth_type:"Shirt",quantity:3,service_name:"Wash & Iron",line_total:240},{cloth_type:"Jeans",quantity:2,service_name:"Wash & Iron",line_total:160}] }];
  }
  const res  = await fetch(`${BASE_URL}/dhobi-orders?dhobi_id=${dhobiId}`);
  if (!res.ok) throw new Error("Failed to load dhobi orders");
  const data = await res.json();
  const orders = data.items ?? [];
  return Promise.all(orders.map(async o => {
    const r = await fetch(`${BASE_URL}/order-items?order_id=${o.order_id}`);
    const d = await r.json();
    return { ...o, items: d.items ?? [] };
  }));
}

// ── POST accept order ─────────────────────────────────────────
export async function acceptOrder(orderId, dhobiId) {
  if (DEMO_MODE) { await delay(700); return { success: true }; }
  const res = await fetch(`${BASE_URL}/accept-order`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ order_id: orderId, dhobi_id: dhobiId }),
  });
  if (!res.ok) throw new Error("Failed to accept order");
  return { success: true };
}

// ── POST update order status ──────────────────────────────────
export async function updateOrderStatus(orderId, newStatus, updatedBy) {
  if (DEMO_MODE) { await delay(500); return { success: true }; }
  const res = await fetch(`${BASE_URL}/update-status`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ order_id: orderId, new_status: newStatus, updated_by: updatedBy }),
  });
  if (!res.ok) throw new Error("Failed to update status");
  return { success: true };
}

// ── GET demand forecast ───────────────────────────────────────
export async function fetchDemandForecast() {
  if (DEMO_MODE) {
    await delay(400);
    return [
      { day_name:"Monday",    day_num:1, order_count:8  },
      { day_name:"Tuesday",   day_num:2, order_count:6  },
      { day_name:"Wednesday", day_num:3, order_count:11 },
      { day_name:"Thursday",  day_num:4, order_count:9  },
      { day_name:"Friday",    day_num:5, order_count:14 },
      { day_name:"Saturday",  day_num:6, order_count:22 },
      { day_name:"Sunday",    day_num:0, order_count:19 },
    ];
  }
  const res  = await fetch(`${BASE_URL}/demand-forecast`);
  if (!res.ok) throw new Error("Failed to load forecast");
  const data = await res.json();
  return data.items ?? [];
}
