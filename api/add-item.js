import supabase from './_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { order_id, cloth_type, quantity, service_id, price } = req.body;

  // Insert item
  const { error: itemErr } = await supabase
    .from('order_items')
    .insert({ order_id, cloth_type, quantity, service_id, price });

  if (itemErr) return res.status(500).json({ error: itemErr.message });

  // Update order total
  const { data: items } = await supabase
    .from('order_items')
    .select('price')
    .eq('order_id', order_id);

  const total = (items ?? []).reduce((s, i) => s + Number(i.price), 0);

  await supabase.from('orders').update({ total_amount: total }).eq('order_id', order_id);

  return res.status(200).json({ success: 1 });
}
