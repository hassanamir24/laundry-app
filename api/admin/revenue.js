import supabase from '../_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const fourteenDaysAgo = new Date(Date.now() - 14 * 86400000).toISOString();

  const { data, error } = await supabase
    .from('orders')
    .select('order_date, total_amount, status')
    .gte('order_date', fourteenDaysAgo)
    .order('order_date');

  if (error) return res.status(500).json({ error: error.message });

  // Group by day
  const dayMap = {};
  for (const o of (data ?? [])) {
    const day = o.order_date.split('T')[0];
    if (!dayMap[day]) dayMap[day] = { order_day: day, total_orders: 0, revenue: 0, delivered: 0, pending: 0 };
    dayMap[day].total_orders++;
    dayMap[day].revenue += Number(o.total_amount);
    if (o.status === 'Delivered') dayMap[day].delivered++;
    if (o.status === 'Pending')   dayMap[day].pending++;
  }

  const items = Object.values(dayMap).sort((a, b) => a.order_day.localeCompare(b.order_day));
  return res.status(200).json({ items });
}
