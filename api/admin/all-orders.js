import supabase from '../_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { data: orders, error } = await supabase
    .from('orders')
    .select('order_id, order_date, status, total_amount, user_id')
    .order('order_date', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });

  const { data: users }       = await supabase.from('users').select('user_id, name, phone, role');
  const { data: assignments }  = await supabase.from('assignments').select('order_id, dhobi_id');

  const userMap   = Object.fromEntries((users ?? []).map(u => [u.user_id, u]));
  const assignMap = Object.fromEntries((assignments ?? []).map(a => [a.order_id, a.dhobi_id]));

  const items = (orders ?? []).map(o => {
    const customer = userMap[o.user_id] ?? {};
    const dhobiId  = assignMap[o.order_id];
    const dhobi    = dhobiId ? userMap[dhobiId] : null;
    return {
      ...o,
      customer_name:  customer.name,
      customer_phone: customer.phone,
      dhobi_id:       dhobiId ?? null,
      dhobi_name:     dhobi?.name ?? null,
    };
  });

  return res.status(200).json({ items });
}
