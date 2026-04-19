import supabase from './_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    const { dhobi_id } = req.query;
    const { data, error } = await supabase
      .from('dhobi_pricing')
      .select('pricing_id, service_id, cloth_type, custom_price, services(service_name)')
      .eq('dhobi_id', dhobi_id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ items: data });
  }

  if (req.method === 'POST') {
    const { dhobi_id, service_id, cloth_type, custom_price } = req.body;

    // Upsert
    const { error } = await supabase
      .from('dhobi_pricing')
      .upsert({ dhobi_id, service_id, cloth_type: cloth_type ?? null, custom_price },
               { onConflict: 'dhobi_id,service_id' });

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: 1 });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
