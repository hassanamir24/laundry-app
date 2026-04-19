// ── ADD THESE FUNCTIONS TO THE BOTTOM OF YOUR api.js FILE ──
// Copy everything below and paste at the end of src/api/api.js

// ── GET unassigned orders (available for dhobi to accept) ────
export async function fetchUnassignedOrders() {
  if (DEMO_MODE) {
    await delay(500);
    return [
      {
        order_id: 10,
        order_date: new Date().toISOString(),
        pickup_date: new Date(Date.now() + 86400000).toISOString(),
        status: "Pending",
        total_amount: 320,
        notes: "Handle with care",
        customer_name: "Fatima Noor",
        customer_phone: "03001112222",
        customer_address: "Plot 5, Gulberg, Faisalabad",
        time_slot: "10AM-12PM",
        pickup_address: "Plot 5, Gulberg, Faisalabad",
        items: [
          { cloth_type: "Shirt", quantity: 2, service_name: "Wash & Iron", line_total: 160 },
          { cloth_type: "Jeans", quantity: 2, service_name: "Wash & Iron", line_total: 160 },
        ],
      },
      {
        order_id: 11,
        order_date: new Date().toISOString(),
        pickup_date: new Date(Date.now() + 86400000).toISOString(),
        status: "Pending",
        total_amount: 150,
        notes: null,
        customer_name: "Omar Butt",
        customer_phone: "03009998888",
        customer_address: "House 8, Canal Road, Faisalabad",
        time_slot: "2PM-4PM",
        pickup_address: "House 8, Canal Road, Faisalabad",
        items: [
          { cloth_type: "Suit", quantity: 1, service_name: "Dry Clean", line_total: 150 },
        ],
      },
    ];
  }

  const res = await fetch(`${BASE_URL}/unassigned-orders`);
  if (!res.ok) throw new Error("Failed to load unassigned orders");
  const data = await res.json();
  const orders = data.items ?? [];

  const ordersWithItems = await Promise.all(
    orders.map(async (order) => {
      const itemsRes = await fetch(`${BASE_URL}/order-items/${order.order_id}`);
      const itemsData = await itemsRes.json();
      return { ...order, items: itemsData.items ?? [] };
    })
  );
  return ordersWithItems;
}

// ── GET orders assigned to this dhobi ────────────────────────
export async function fetchDhobiOrders(dhobiId) {
  if (DEMO_MODE) {
    await delay(500);
    return [
      {
        order_id: 1,
        order_date: new Date(Date.now() - 86400000).toISOString(),
        pickup_date: new Date().toISOString(),
        status: "Washing",
        total_amount: 400,
        notes: "Use mild detergent",
        customer_name: "Ali Hassan",
        customer_phone: "03001234567",
        customer_address: "House 12, Block C, Faisalabad",
        time_slot: "8AM-10AM",
        pickup_address: "House 12, Block C, Faisalabad",
        items: [
          { cloth_type: "Shirt", quantity: 3, service_name: "Wash & Iron", line_total: 240 },
          { cloth_type: "Jeans", quantity: 2, service_name: "Wash & Iron", line_total: 160 },
        ],
      },
    ];
  }

  const res = await fetch(`${BASE_URL}/dhobi-orders/${dhobiId}`);
  if (!res.ok) throw new Error("Failed to load dhobi orders");
  const data = await res.json();
  const orders = data.items ?? [];

  const ordersWithItems = await Promise.all(
    orders.map(async (order) => {
      const itemsRes = await fetch(`${BASE_URL}/order-items/${order.order_id}`);
      const itemsData = await itemsRes.json();
      return { ...order, items: itemsData.items ?? [] };
    })
  );
  return ordersWithItems;
}

// ── POST accept an order ──────────────────────────────────────
export async function acceptOrder(orderId, dhobiId) {
  if (DEMO_MODE) {
    await delay(700);
    return { success: true };
  }
  const res = await fetch(`${BASE_URL}/accept-order`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ order_id: orderId, dhobi_id: dhobiId }),
  });
  if (!res.ok) throw new Error("Failed to accept order");
  return { success: true };
}

// ── POST update order status ──────────────────────────────────
export async function updateOrderStatus(orderId, newStatus, updatedBy) {
  if (DEMO_MODE) {
    await delay(500);
    return { success: true };
  }
  const res = await fetch(`${BASE_URL}/update-status`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      order_id:   orderId,
      new_status: newStatus,
      updated_by: updatedBy,
    }),
  });
  if (!res.ok) throw new Error("Failed to update status");
  return { success: true };
}

// ── GET demand forecast ───────────────────────────────────────
export async function fetchDemandForecast() {
  if (DEMO_MODE) {
    await delay(400);
    return [
      { day_name: "Monday",    day_num: 2, order_count: 8  },
      { day_name: "Tuesday",   day_num: 3, order_count: 6  },
      { day_name: "Wednesday", day_num: 4, order_count: 11 },
      { day_name: "Thursday",  day_num: 5, order_count: 9  },
      { day_name: "Friday",    day_num: 6, order_count: 14 },
      { day_name: "Saturday",  day_num: 7, order_count: 22 },
      { day_name: "Sunday",    day_num: 1, order_count: 19 },
    ];
  }
  const res = await fetch(`${BASE_URL}/demand-forecast`);
  if (!res.ok) throw new Error("Failed to load forecast");
  const data = await res.json();
  return data.items ?? [];
}
