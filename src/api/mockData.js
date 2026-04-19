// ─────────────────────────────────────────────────────────────
//  MOCK DATA  —  used when DEMO_MODE = true in config.js
//  Replace with real APEX REST calls by setting DEMO_MODE = false
// ─────────────────────────────────────────────────────────────

export const MOCK_USER = {
  user_id: 1,
  name: "Ali Hassan",
  phone: "03001234567",
  email: "ali@email.com",
  address: "House 12, Block C, Faisalabad",
};

export const MOCK_SERVICES = [
  { service_id: 1, service_name: "Wash",        price_per_item: 50  },
  { service_id: 2, service_name: "Iron",        price_per_item: 30  },
  { service_id: 3, service_name: "Wash & Iron", price_per_item: 80  },
  { service_id: 4, service_name: "Dry Clean",   price_per_item: 150 },
  { service_id: 5, service_name: "Iron Only",   price_per_item: 30  },
];

export const CLOTH_TYPES = [
  "Shirt", "T-Shirt", "Jeans", "Trousers", "Kurta",
  "Shalwar Kameez", "Suit", "Jacket", "Sweater",
  "Bedsheet", "Towel", "Socks", "Undergarments",
];

export const MOCK_ORDERS = [
  {
    order_id: 1,
    order_date: "2026-04-17",
    pickup_date: "2026-04-18",
    delivery_date: null,
    status: "Washing",
    total_amount: 400,
    notes: "Use mild detergent",
    items: [
      { cloth_type: "Shirt",  quantity: 3, service_name: "Wash & Iron", line_total: 240 },
      { cloth_type: "Jeans",  quantity: 2, service_name: "Wash & Iron", line_total: 160 },
    ],
    dhobi_name: "Mohammad Waseem",
    dhobi_phone: "03211112222",
    time_slot: "8AM–10AM",
    address: "House 12, Block C, Faisalabad",
    status_log: [
      { status_label: "Order Placed", updated_at: "2026-04-17T10:15:00" },
      { status_label: "Confirmed",    updated_at: "2026-04-17T11:00:00" },
      { status_label: "Picked Up",    updated_at: "2026-04-18T09:30:00" },
      { status_label: "Washing",      updated_at: "2026-04-18T10:45:00" },
    ],
  },
  {
    order_id: 2,
    order_date: "2026-04-15",
    pickup_date: "2026-04-16",
    delivery_date: "2026-04-17",
    status: "Delivered",
    total_amount: 310,
    notes: null,
    items: [
      { cloth_type: "Suit",   quantity: 1, service_name: "Dry Clean",   line_total: 150 },
      { cloth_type: "Shirt",  quantity: 2, service_name: "Wash & Iron", line_total: 160 },
    ],
    dhobi_name: "Asif Laundry",
    dhobi_phone: "03333334444",
    time_slot: "2PM–4PM",
    address: "House 12, Block C, Faisalabad",
    status_log: [
      { status_label: "Order Placed",      updated_at: "2026-04-15T09:00:00" },
      { status_label: "Confirmed",         updated_at: "2026-04-15T09:30:00" },
      { status_label: "Picked Up",         updated_at: "2026-04-16T14:15:00" },
      { status_label: "Washing",           updated_at: "2026-04-16T15:00:00" },
      { status_label: "Drying",            updated_at: "2026-04-16T17:00:00" },
      { status_label: "Ironing",           updated_at: "2026-04-16T18:30:00" },
      { status_label: "Ready",             updated_at: "2026-04-16T20:00:00" },
      { status_label: "Out for Delivery",  updated_at: "2026-04-17T10:00:00" },
      { status_label: "Delivered",         updated_at: "2026-04-17T11:30:00" },
    ],
  },
  {
    order_id: 3,
    order_date: "2026-04-10",
    pickup_date: "2026-04-11",
    delivery_date: "2026-04-12",
    status: "Delivered",
    total_amount: 240,
    notes: null,
    items: [
      { cloth_type: "Kurta",   quantity: 3, service_name: "Wash", line_total: 150 },
      { cloth_type: "Shalwar", quantity: 3, service_name: "Iron", line_total: 90  },
    ],
    dhobi_name: "Mohammad Waseem",
    dhobi_phone: "03211112222",
    time_slot: "8AM–10AM",
    address: "House 12, Block C, Faisalabad",
    status_log: [
      { status_label: "Order Placed", updated_at: "2026-04-10T08:00:00" },
      { status_label: "Delivered",    updated_at: "2026-04-12T14:00:00" },
    ],
  },
];
