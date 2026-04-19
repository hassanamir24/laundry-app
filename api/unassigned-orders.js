import supabase from './_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // Get pending orders with no assignment
  const { data: orders, error } = await supabase
    .from('orders')
    .select(`
      order_id, order_date, pickup_date, status, total_amount, notes,
      users!orders_user_id_fkey(name, phone, address),
      pickup_schedule(time_slot, address),
      assignments(assign_id)
    `)
    .eq('status', 'Pending')
    .is('assignments', null);

  if (error) {
    // Fallback: manual join
    const { data: allPending } = await supabase
      .from('orders').select('order_id, order_date, pickup_date, status, total_amount, notes, user_id').eq('status', 'Pending');

    const { data: assigned } = await supabase.from('assignments').select('order_id');
    const assignedIds = new Set((assigned ?? []).map(a => a.order_id));
    const unassigned  = (allPending ?? []).filter(o => !assignedIds.has(o.order_id));

    const result = await Promise.all(unassigned.map(async o => {
      const { data: u }  = await supabase.from('users').select('name,phone,address').eq('user_id', o.user_id).single();
      const { data: ps } = await supabase.from('pickup_schedule').select('time_slot,address').eq('order_id', o.order_id).single();
      return { ...o, customer_name: u?.name, customer_phone: u?.phone, customer_address: u?.address, time_slot: ps?.time_slot, pickup_address: ps?.address };
    }));

    return res.status(200).json({ items: result });
  }

  const items = (orders ?? []).map(o => ({
    ...o,
    customer_name:    o.users?.name,
    customer_phone:   o.users?.phone,
    customer_address: o.users?.address,
    time_slot:        o.pickup_schedule?.[0]?.time_slot,
    pickup_address:   o.pickup_schedule?.[0]?.address,
  }));

  return res.status(200).json({ items });
}
