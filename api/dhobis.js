import supabase from './_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { data, error } = await supabase
    .from('users')
    .select('user_id, name, phone, address')
    .eq('role', 'dhobi')
    .eq('is_active', true)
    .order('name');

  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ items: data });
}
