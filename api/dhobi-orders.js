import supabase from './_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { dhobi_id } = req.query;
  if (!dhobi_id) return res.status(400).json({ error: 'dhobi_id required' });

  const { data: assignments } = await supabase
    .from('assignments')
    .select('order_id')
    .eq('dhobi_id', dhobi_id);

  if (!assignments?.length) return res.status(200).json({ items: [] });

  const orderIds = assignments.map(a => a.order_id);

  const { data: orders, error } = await supabase
    .from('orders')
    .select('order_id, order_date, pickup_date, status, total_amount, notes, user_id')
    .in('order_id', orderIds)
    .not('status', 'in', '("Delivered","Cancelled")')
    .order('order_date');

  if (error) return res.status(500).json({ error: error.message });

  const result = await Promise.all((orders ?? []).map(async o => {
    const { data: u }  = await supabase.from('users').select('name,phone,address').eq('user_id', o.user_id).single();
    const { data: ps } = await supabase.from('pickup_schedule').select('time_slot,address').eq('order_id', o.order_id).single();
    return { ...o, customer_name: u?.name, customer_phone: u?.phone, customer_address: u?.address, time_slot: ps?.time_slot, pickup_address: ps?.address };
  }));

  return res.status(200).json({ items: result });
}
