import supabase from './_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();

  const { data, error } = await supabase
    .from('orders')
    .select('order_date')
    .gte('order_date', thirtyDaysAgo);

  if (error) return res.status(500).json({ error: error.message });

  // Group by day of week
  const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const counts = { 0:0, 1:0, 2:0, 3:0, 4:0, 5:0, 6:0 };

  for (const o of (data ?? [])) {
    const day = new Date(o.order_date).getDay();
    counts[day]++;
  }

  const items = DAYS.map((name, idx) => ({
    day_name:    name,
    day_num:     idx,
    order_count: counts[idx],
  }));

  return res.status(200).json({ items });
}
