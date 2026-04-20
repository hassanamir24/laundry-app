import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function ok(res, data)            { res.status(200).json(data); }
function fail(res, msg, code=500) { res.status(code).json({ error: msg }); }

// ── ROUTES ────────────────────────────────────────────────────

async function handleLogin(req, res) {
  const { phone, password } = req.body;
  if (!phone || !password) return fail(res, 'Phone and password required', 400);
  const hash = crypto.createHash('sha256').update(password).digest('hex');
  const { data } = await supabase
    .from('users').select('user_id,name,role,address,phone,password_hash')
    .eq('phone', phone.trim()).eq('is_active', true).single();
  if (!data || data.password_hash !== hash) return ok(res, { success: 0 });
  return ok(res, { success: 1, user_id: data.user_id, name: data.name, role: data.role, address: data.address, phone: data.phone });
}

async function handleSignup(req, res) {
  const { name, phone, password, role, address } = req.body;
  if (!name || !phone || !password || !role) return fail(res, 'All fields required', 400);
  const { data: existing } = await supabase.from('users').select('user_id').eq('phone', phone.trim()).single();
  if (existing) return fail(res, 'Phone already registered', 409);
  const hash = crypto.createHash('sha256').update(password).digest('hex');
  const { data, error } = await supabase.from('users')
    .insert({ name: name.trim(), phone: phone.trim(), password_hash: hash, role, address: address?.trim() || '' })
    .select('user_id,name,role,address,phone').single();
  if (error) return fail(res, 'Failed to create account');
  return ok(res, { success: 1, ...data });
}

async function handleOrders(req, res) {
  const { user_id } = req.query;
  if (!user_id) return fail(res, 'user_id required', 400);
  const { data, error } = await supabase.from('orders').select('*').eq('user_id', user_id).order('order_date', { ascending: false });
  if (error) return fail(res, error.message);
  return ok(res, { items: data });
}

async function handleServices(req, res) {
  const { data, error } = await supabase.from('services').select('service_id,service_name,price_per_item').eq('is_active', true).order('service_id');
  if (error) return fail(res, error.message);
  return ok(res, { items: data });
}

async function handlePlaceOrder(req, res) {
  const { user_id, pickup_date, time_slot, address, notes, pickup_type, return_type, payment_method } = req.body;
  if (!user_id || !pickup_date) return fail(res, 'user_id and pickup_date required', 400);
  const { data: order, error } = await supabase.from('orders')
    .insert({ user_id: Number(user_id), pickup_date, status: 'Pending', total_amount: 0, notes: notes || '', pickup_type: pickup_type || 'pickup', return_type: return_type || 'deliver', payment_method: payment_method || 'COD', payment_status: 'Pending' })
    .select('order_id').single();
  if (error) return fail(res, error.message);
  await supabase.from('pickup_schedule').insert({ order_id: order.order_id, scheduled_date: pickup_date, time_slot: time_slot || '', address: address || '', pickup_status: 'Confirmed' });
  await supabase.from('delivery_status').insert({ order_id: order.order_id, status_label: 'Order Placed', updated_by: 'Customer' });
  return ok(res, { success: true, order_id: order.order_id });
}

async function handleAddItem(req, res) {
  const { order_id, cloth_type, quantity, service_id, price } = req.body;
  if (!order_id || !cloth_type) return fail(res, 'order_id and cloth_type required', 400);
  const { error } = await supabase.from('order_items').insert({ order_id: Number(order_id), cloth_type, quantity: Number(quantity), service_id: Number(service_id), price: Number(price) });
  if (error) return fail(res, error.message);
  return ok(res, { success: true });
}

async function handleOrderItems(req, res) {
  const { order_id } = req.query;
  if (!order_id) return fail(res, 'order_id required', 400);
  const { data, error } = await supabase.from('order_items').select('item_id,cloth_type,quantity,price,service_id,services(service_name,price_per_item)').eq('order_id', order_id);
  if (error) return fail(res, error.message);
  return ok(res, { items: data.map(i => ({ ...i, service_name: i.services?.service_name, line_total: i.price })) });
}

async function handleOrderLog(req, res) {
  const { order_id } = req.query;
  if (!order_id) return fail(res, 'order_id required', 400);
  const { data, error } = await supabase.from('delivery_status').select('status_label,updated_at,updated_by').eq('order_id', order_id).order('updated_at');
  if (error) return fail(res, error.message);
  return ok(res, { items: data });
}

async function handleUnassignedOrders(req, res) {
  const { data: assigned } = await supabase.from('assignments').select('order_id');
  const assignedIds = (assigned || []).map(a => a.order_id);
  let query = supabase.from('orders').select('*,users(name,phone,address),pickup_schedule(time_slot,address)').eq('status', 'Pending').order('order_date');
  if (assignedIds.length > 0) query = query.not('order_id', 'in', `(${assignedIds.join(',')})`);
  const { data, error } = await query;
  if (error) return fail(res, error.message);
  return ok(res, { items: (data||[]).map(o => ({ ...o, customer_name: o.users?.name, customer_phone: o.users?.phone, customer_address: o.users?.address, time_slot: o.pickup_schedule?.[0]?.time_slot, pickup_address: o.pickup_schedule?.[0]?.address })) });
}

async function handleDhobiOrders(req, res) {
  const { dhobi_id } = req.query;
  if (!dhobi_id) return fail(res, 'dhobi_id required', 400);
  const { data, error } = await supabase.from('assignments').select('order_id,orders(*,users(name,phone,address),pickup_schedule(time_slot,address))').eq('dhobi_id', dhobi_id);
  if (error) return fail(res, error.message);
  const items = (data||[]).map(a => a.orders).filter(o => o && !['Delivered','Cancelled'].includes(o.status))
    .map(o => ({ ...o, customer_name: o.users?.name, customer_phone: o.users?.phone, customer_address: o.users?.address, time_slot: o.pickup_schedule?.[0]?.time_slot, pickup_address: o.pickup_schedule?.[0]?.address }));
  return ok(res, { items });
}

async function handleAcceptOrder(req, res) {
  const { order_id, dhobi_id } = req.body;
  if (!order_id || !dhobi_id) return fail(res, 'order_id and dhobi_id required', 400);
  await supabase.from('assignments').delete().eq('order_id', order_id);
  const { error } = await supabase.from('assignments').insert({ order_id: Number(order_id), dhobi_id: Number(dhobi_id) });
  if (error) return fail(res, error.message);
  await supabase.from('orders').update({ status: 'Confirmed' }).eq('order_id', order_id);
  return ok(res, { success: true });
}

async function handleUpdateStatus(req, res) {
  const { order_id, new_status, updated_by } = req.body;
  if (!order_id || !new_status) return fail(res, 'order_id and new_status required', 400);
  const { error } = await supabase.from('orders').update({ status: new_status }).eq('order_id', order_id);
  if (error) return fail(res, error.message);
  await supabase.from('delivery_status').insert({ order_id: Number(order_id), status_label: new_status, updated_by: updated_by || 'Dhobi' });
  return ok(res, { success: true });
}

async function handleDhobis(req, res) {
  const { data, error } = await supabase.from('users').select('user_id,name,phone,address').eq('role', 'dhobi').eq('is_active', true).order('name');
  if (error) return fail(res, error.message);
  return ok(res, { items: data });
}

async function handleDemandForecast(req, res) {
  const since = new Date(); since.setDate(since.getDate() - 30);
  const { data, error } = await supabase.from('orders').select('order_date').gte('order_date', since.toISOString());
  if (error) return fail(res, error.message);
  const names = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const counts = {};
  for (const o of data) {
    const d = new Date(o.order_date); const n = d.getDay();
    if (!counts[n]) counts[n] = { day_name: names[n], day_num: n, order_count: 0 };
    counts[n].order_count++;
  }
  return ok(res, { items: Object.values(counts).sort((a,b) => a.day_num - b.day_num) });
}

async function handleAdminUsers(req, res) {
  if (req.method === 'GET') {
    const { data, error } = await supabase.from('users').select('user_id,name,phone,role,address').order('role').order('name');
    if (error) return fail(res, error.message);
    return ok(res, { items: data });
  }
  const { name, phone, role, address } = req.body;
  const { error } = await supabase.from('users').insert({ name, phone, role, address, password_hash: 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', is_active: true });
  if (error) return fail(res, error.message);
  return ok(res, { success: true });
}

async function handleAdminAllOrders(req, res) {
  const { data, error } = await supabase.from('orders').select('order_id,order_date,status,total_amount,users(name,phone),assignments(users(user_id,name))').order('order_date', { ascending: false });
  if (error) return fail(res, error.message);
  return ok(res, { items: data.map(o => ({ order_id: o.order_id, order_date: o.order_date, status: o.status, total_amount: o.total_amount, customer_name: o.users?.name, customer_phone: o.users?.phone, dhobi_id: o.assignments?.[0]?.users?.user_id ?? null, dhobi_name: o.assignments?.[0]?.users?.name ?? null })) });
}

async function handleAdminAssignDhobi(req, res) {
  const { order_id, dhobi_id } = req.body;
  await supabase.from('assignments').delete().eq('order_id', order_id);
  const { error } = await supabase.from('assignments').insert({ order_id: Number(order_id), dhobi_id: Number(dhobi_id) });
  if (error) return fail(res, error.message);
  return ok(res, { success: true });
}

async function handleAdminUpdatePrice(req, res) {
  const { service_id, price } = req.body;
  const { error } = await supabase.from('services').update({ price_per_item: Number(price) }).eq('service_id', service_id);
  if (error) return fail(res, error.message);
  return ok(res, { success: true });
}

async function handleAdminRevenue(req, res) {
  const since = new Date(); since.setDate(since.getDate() - 14);
  const { data, error } = await supabase.from('orders').select('order_date,total_amount,status').gte('order_date', since.toISOString());
  if (error) return fail(res, error.message);
  const grouped = {};
  for (const o of data) {
    const day = o.order_date.slice(0, 10);
    if (!grouped[day]) grouped[day] = { order_day: day, total_orders: 0, revenue: 0, delivered: 0, pending: 0 };
    grouped[day].total_orders++;
    grouped[day].revenue += Number(o.total_amount || 0);
    if (o.status === 'Delivered') grouped[day].delivered++;
    if (o.status === 'Pending')   grouped[day].pending++;
  }
  return ok(res, { items: Object.values(grouped).sort((a,b) => a.order_day.localeCompare(b.order_day)) });
}

// ── ROUTER ────────────────────────────────────────────────────

const ROUTES = {
  'POST /login':               handleLogin,
  'POST /signup':              handleSignup,
  'GET /orders':               handleOrders,
  'GET /services':             handleServices,
  'POST /place-order':         handlePlaceOrder,
  'POST /add-item':            handleAddItem,
  'GET /order-items':          handleOrderItems,
  'GET /order-log':            handleOrderLog,
  'GET /unassigned-orders':    handleUnassignedOrders,
  'GET /dhobi-orders':         handleDhobiOrders,
  'POST /accept-order':        handleAcceptOrder,
  'POST /update-status':       handleUpdateStatus,
  'GET /dhobis':               handleDhobis,
  'GET /demand-forecast':      handleDemandForecast,
  'GET /admin/users':          handleAdminUsers,
  'POST /admin/users':         handleAdminUsers,
  'GET /admin/all-orders':     handleAdminAllOrders,
  'POST /admin/assign-dhobi':  handleAdminAssignDhobi,
  'POST /admin/update-price':  handleAdminUpdatePrice,
  'GET /admin/revenue':        handleAdminRevenue,
};

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  // Extract path after /api
  const path = req.url.replace(/^\/api/, '').split('?')[0];
  const key  = `${req.method} ${path}`;
  const fn   = ROUTES[key];

  if (!fn) return fail(res, `Route not found: ${key}`, 404);

  try {
    await fn(req, res);
  } catch (e) {
    console.error('Handler error:', e);
    fail(res, 'Internal server error');
  }
}
