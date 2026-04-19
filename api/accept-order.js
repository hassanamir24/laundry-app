import supabase from './_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { order_id, dhobi_id } = req.body;

  // Remove existing assignment if any
  await supabase.from('assignments').delete().eq('order_id', order_id);

  // Insert new assignment
  const { error: assignErr } = await supabase
    .from('assignments')
    .insert({ order_id, dhobi_id });

  if (assignErr) return res.status(500).json({ error: assignErr.message });

  // Update order status to Confirmed
  await supabase.from('orders').update({ status: 'Confirmed' }).eq('order_id', order_id);

  // Log status change
  await supabase.from('delivery_status').insert({
    order_id, status_label: 'Confirmed', updated_by: 'Dhobi',
  });

  return res.status(200).json({ success: 1 });
}
