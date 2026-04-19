import supabase from './_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { order_id, new_status, updated_by } = req.body;

  const { error } = await supabase
    .from('orders')
    .update({ status: new_status })
    .eq('order_id', order_id);

  if (error) return res.status(500).json({ error: error.message });

  // Log status change
  await supabase.from('delivery_status').insert({
    order_id, status_label: new_status, updated_by: updated_by ?? 'System',
  });

  // If picked up, update pickup schedule too
  if (new_status === 'Picked Up') {
    await supabase.from('pickup_schedule')
      .update({ pickup_status: 'Picked Up' })
      .eq('order_id', order_id);
  }

  return res.status(200).json({ success: 1 });
}
