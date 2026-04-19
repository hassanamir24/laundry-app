import supabase from '../_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { service_id, price } = req.body;

  const { error } = await supabase
    .from('services')
    .update({ price_per_item: price })
    .eq('service_id', service_id);

  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ success: 1 });
}
