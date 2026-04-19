import supabase from './_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { user_id, pickup_date, time_slot, address, notes, pickup_type, return_type, payment_method } = req.body;

  // Insert order
  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .insert({
      user_id,
      pickup_date,
      status:         'Pending',
      total_amount:   0,
      notes,
      pickup_type:    pickup_type  ?? 'pickup',
      return_type:    return_type  ?? 'deliver',
      payment_method: payment_method ?? 'COD',
      payment_status: 'Pending',
    })
    .select('order_id')
    .single();

  if (orderErr) return res.status(500).json({ error: orderErr.message });

  const orderId = order.order_id;

  // Insert pickup schedule
  await supabase.from('pickup_schedule').insert({
    order_id:       orderId,
    scheduled_date: pickup_date,
    time_slot,
    address,
    pickup_status:  'Confirmed',
  });

  // Log initial status
  await supabase.from('delivery_status').insert({
    order_id:     orderId,
    status_label: 'Order Placed',
    updated_by:   'Customer',
  });

  return res.status(200).json({ success: 1, order_id: orderId });
}
