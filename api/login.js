import supabase from './_supabase.js';
import crypto from 'crypto';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { phone, password } = req.body;
  if (!phone || !password) return res.status(400).json({ error: 'Phone and password required' });

  const hash = crypto.createHash('sha256').update(password).digest('hex').toUpperCase();

  const { data, error } = await supabase
    .from('users')
    .select('user_id, name, role, address, phone, password_hash')
    .eq('phone', phone.trim())
    .eq('is_active', true)
    .single();

  if (error || !data) return res.status(200).json({ success: 0 });
  if (data.password_hash !== hash) return res.status(200).json({ success: 0 });

  return res.status(200).json({
    success: 1,
    user_id: data.user_id,
    name:    data.name,
    role:    data.role,
    address: data.address,
    phone:   data.phone,
  });
}
