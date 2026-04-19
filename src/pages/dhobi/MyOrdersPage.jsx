import { useState, useEffect } from "react";
import StatusPill from "../../components/StatusPill";

function fmtCurrency(n) { return "Rs " + Number(n).toLocaleString("en-PK"); }
function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-PK", { day: "numeric", month: "short" });
}

// What statuses can a dhobi move an order to, given current status
const NEXT_STATUSES = {
  "Confirmed":        ["Picked Up"],
  "Picked Up":        ["Washing"],
  "Washing":          ["Drying"],
  "Drying":           ["Ironing"],
  "Ironing":          ["Ready"],
  "Ready":            ["Out for Delivery"],
  "Out for Delivery": ["Delivered"],
};

export default function MyOrdersPage({ user, fetchDhobiOrders, updateOrderStatus, onShowToast }) {
  const [orders,   setOrders]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [updating, setUpdating] = useState(null); // order_id being updated
  const [expanded, setExpanded] = useState(null);

  function load() {
    if (!user?.user_id) return;
    setLoading(true);
    fetchDhobiOrders(user.user_id)
      .then(setOrders)
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, [user]);

  async function handleStatusUpdate(orderId, newStatus) {
    setUpdating(orderId);
    try {
      await updateOrderStatus(orderId, newStatus, user.name);
      onShowToast(`Order #${orderId} → ${newStatus}`, "success");
      // Update locally
      setOrders(prev =>
        prev.map(o => o.order_id === orderId ? { ...o, status: newStatus } : o)
      );
    } catch (e) {
      onShowToast("Failed to update status. Try again.", "error");
    } finally {
      setUpdating(null);
    }
  }

  const active    = orders.filter(o => !["Delivered","Cancelled"].includes(o.status));
  const completed = orders.filter(o => o.status === "Delivered");

  return (
    <div>
      <div className="page-header">
        <div className="flex-between">
          <div>
            <div className="page-title">My Orders</div>
            <div className="page-subtitle">
              {active.length} active · {completed.length} delivered today
            </div>
          </div>
          <button className="btn btn-secondary" onClick={load}>↻ Refresh</button>
        </div>
      </div>

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {[1,2,3].map(i => (
            <div key={i} className="card">
              <div className="skeleton" style={{ height: 14, width: "40%", marginBottom: 8 }} />
              <div className="skeleton" style={{ height: 12, width: "60%" }} />
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="card">
          <div className="empty-state" style={{ padding: "3rem" }}>
            <div className="empty-state-icon">🧺</div>
            <div className="empty-state-text">No orders assigned yet</div>
            <div className="text-muted" style={{ marginTop: 6 }}>Accept orders from the New Requests page.</div>
          </div>
        </div>
      ) : (
        <>
          {/* Active orders */}
          {active.length > 0 && (
            <div style={{ marginBottom: "1.5rem" }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
                Active — {active.length}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {active.map(o => {
                  const nextOptions = NEXT_STATUSES[o.status] ?? [];
                  const isExpanded  = expanded === o.order_id;
                  return (
                    <div key={o.order_id} className="card" style={{ padding: "1rem 1.25rem" }}>
                      <div
                        style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}
                        onClick={() => setExpanded(isExpanded ? null : o.order_id)}
                      >
                        {/* Order info */}
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                            <span style={{ fontSize: 15, fontWeight: 600 }}>Order #{o.order_id}</span>
                            <span style={{ fontSize: 13, color: "var(--text3)" }}>{o.customer_name}</span>
                          </div>
                          <div className="text-muted" style={{ marginTop: 3 }}>
                            {o.items?.slice(0, 3).map(i => `${i.quantity}× ${i.cloth_type}`).join(", ")}
                            {o.items?.length > 3 && " ..."}
                          </div>
                        </div>

                        {/* Status + price */}
                        <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                          <StatusPill status={o.status} />
                          <div style={{ fontSize: 14, fontWeight: 600 }}>{fmtCurrency(o.total_amount)}</div>
                          <div style={{ fontSize: 12, color: "var(--text3)" }}>{isExpanded ? "▲" : "▼"}</div>
                        </div>
                      </div>

                      {/* Expanded detail */}
                      {isExpanded && (
                        <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--bg2)", animation: "fadeUp 0.2s ease" }}>
                          {/* Customer details */}
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px 16px", marginBottom: 14 }}>
                            {[
                              ["Pickup date",  fmtDate(o.pickup_date)],
                              ["Time slot",    o.time_slot ?? "—"],
                              ["Phone",        o.customer_phone],
                              ["Address",      o.pickup_address ?? o.customer_address],
                              ["Notes",        o.notes ?? "None"],
                            ].map(([k, v]) => (
                              <div key={k}>
                                <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 2 }}>{k}</div>
                                <div style={{ fontSize: 13, fontWeight: 500 }}>{v}</div>
                              </div>
                            ))}
                          </div>

                          {/* All items */}
                          <div style={{ background: "var(--surface2)", borderRadius: "var(--radius-md)", padding: "10px 12px", marginBottom: 14 }}>
                            {o.items?.map((item, i) => (
                              <div key={i} style={{
                                display: "flex", justifyContent: "space-between",
                                fontSize: 13, padding: "5px 0",
                                borderBottom: i < o.items.length - 1 ? "1px solid var(--bg2)" : "none",
                              }}>
                                <span>{item.quantity}× {item.cloth_type} <span style={{ color: "var(--text3)" }}>— {item.service_name}</span></span>
                                <span style={{ fontWeight: 500 }}>{fmtCurrency(item.line_total)}</span>
                              </div>
                            ))}
                          </div>

                          {/* Status update buttons */}
                          {nextOptions.length > 0 && (
                            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                              <span style={{ fontSize: 13, color: "var(--text3)" }}>Move to:</span>
                              {nextOptions.map(next => (
                                <button
                                  key={next}
                                  className="btn btn-primary btn-sm"
                                  disabled={updating === o.order_id}
                                  onClick={() => handleStatusUpdate(o.order_id, next)}
                                  style={{ background: statusColor(next), borderColor: statusColor(next) }}
                                >
                                  {updating === o.order_id ? "Updating..." : `→ ${next}`}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Completed orders */}
          {completed.length > 0 && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
                Delivered — {completed.length}
              </div>
              <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Order</th>
                      <th>Customer</th>
                      <th>Items</th>
                      <th style={{ textAlign: "right" }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {completed.map(o => (
                      <tr key={o.order_id}>
                        <td style={{ fontWeight: 600 }}>#{o.order_id}</td>
                        <td>{o.customer_name}</td>
                        <td className="text-muted">{o.items?.map(i => `${i.quantity}× ${i.cloth_type}`).join(", ")}</td>
                        <td style={{ textAlign: "right", fontWeight: 600 }}>{fmtCurrency(o.total_amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function statusColor(status) {
  const map = {
    "Picked Up":        "#2456A4",
    "Washing":          "#1A62A8",
    "Drying":           "#C07700",
    "Ironing":          "#B85C00",
    "Ready":            "#0F6E56",
    "Out for Delivery": "#1A4E8A",
    "Delivered":        "#085041",
  };
  return map[status] ?? "var(--navy)";
}
