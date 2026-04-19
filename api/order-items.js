import supabase from './_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { order_id } = req.query;
  if (!order_id) return res.status(400).json({ error: 'order_id required' });

  const { data, error } = await supabase
    .from('order_items')
    .select('item_id, cloth_type, quantity, price, services(service_name, price_per_item)')
    .eq('order_id', order_id);

  if (error) return res.status(500).json({ error: error.message });

  const items = data.map(i => ({
    item_id:       i.item_id,
    cloth_type:    i.cloth_type,
    quantity:      i.quantity,
    line_total:    i.price,
    service_name:  i.services?.service_name,
    price_per_item: i.services?.price_per_item,
  }));

  return res.status(200).json({ items });
}
