import supabase from '../_supabase.js';
import crypto from 'crypto';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('users')
      .select('user_id, name, phone, role, address')
      .order('role').order('name');
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ items: data });
  }

  if (req.method === 'POST') {
    const { name, phone, role, address } = req.body;
    const hash = crypto.createHash('sha256').update('password123').digest('hex').toUpperCase();
    const { error } = await supabase
      .from('users')
      .insert({ name, phone, role, address, password_hash: hash, is_active: true });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: 1 });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
