import supabase from './_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { order_id } = req.query;
  if (!order_id) return res.status(400).json({ error: 'order_id required' });

  const { data, error } = await supabase
    .from('delivery_status')
    .select('status_label, updated_at, updated_by')
    .eq('order_id', order_id)
    .order('updated_at', { ascending: true });

  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ items: data });
}
