// Maps order status string → CSS class suffix
const STATUS_CLASS = {
  "Pending":           "pending",
  "Confirmed":         "confirmed",
  "Picked Up":         "picked-up",
  "Washing":           "washing",
  "Drying":            "drying",
  "Ironing":           "ironing",
  "Ready":             "ready",
  "Out for Delivery":  "out-for-delivery",
  "Delivered":         "delivered",
  "Cancelled":         "cancelled",
};

export default function StatusPill({ status }) {
  const cls = STATUS_CLASS[status] ?? "pending";
  return <span className={`pill pill-${cls}`}>{status}</span>;
}
