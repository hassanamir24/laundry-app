import supabase from './_supabase.js';
import crypto from 'crypto';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, phone, password, role, address } = req.body;
  if (!name || !phone || !password || !role || !address)
    return res.status(400).json({ error: 'All fields required' });

  // Check phone not already registered
  const { data: existing } = await supabase
    .from('users').select('user_id').eq('phone', phone.trim()).single();
  if (existing) return res.status(409).json({ error: 'Phone already registered' });

  const hash = crypto.createHash('sha256').update(password).digest('hex').toUpperCase();

  const { data, error } = await supabase
    .from('users')
    .insert({ name: name.trim(), phone: phone.trim(), password_hash: hash, role, address: address.trim(), is_active: true })
    .select('user_id')
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ success: 1, user_id: data.user_id });
}
