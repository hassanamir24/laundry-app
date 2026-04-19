import supabase from './_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { user_id } = req.query;
  if (!user_id) return res.status(400).json({ error: 'user_id required' });

  const { data, error } = await supabase
    .from('orders')
    .select('order_id, order_date, pickup_date, delivery_date, status, total_amount, notes, pickup_type, return_type, payment_method, payment_status')
    .eq('user_id', user_id)
    .order('order_date', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ items: data });
}
