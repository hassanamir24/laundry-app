import { useState, useEffect } from "react";

function fmtCurrency(n) { return "Rs " + Number(n).toLocaleString("en-PK"); }
function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" });
}

export default function NewOrdersPage({ user, fetchUnassignedOrders, acceptOrder, onShowToast }) {
  const [orders,   setOrders]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [accepting, setAccepting] = useState(null); // order_id being accepted

  function load() {
    setLoading(true);
    fetchUnassignedOrders()
      .then(setOrders)
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function handleAccept(orderId) {
    setAccepting(orderId);
    try {
      await acceptOrder(orderId, user.user_id);
      onShowToast(`Order #${orderId} accepted successfully!`, "success");
      // Remove from list
      setOrders(prev => prev.filter(o => o.order_id !== orderId));
    } catch (e) {
      onShowToast("Failed to accept order. Try again.", "error");
    } finally {
      setAccepting(null);
    }
  }

  return (
    <div>
      <div className="page-header">
        <div className="flex-between">
          <div>
            <div className="page-title">New Order Requests</div>
            <div className="page-subtitle">Accept orders to add them to your workload.</div>
          </div>
          <button className="btn btn-secondary" onClick={load}>↻ Refresh</button>
        </div>
      </div>

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {[1,2,3].map(i => (
            <div key={i} className="card">
              <div style={{ display: "flex", gap: 12 }}>
                <div className="skeleton" style={{ width: 44, height: 44, borderRadius: "50%" }} />
                <div style={{ flex: 1 }}>
                  <div className="skeleton" style={{ height: 14, width: "30%", marginBottom: 8 }} />
                  <div className="skeleton" style={{ height: 12, width: "60%", marginBottom: 6 }} />
                  <div className="skeleton" style={{ height: 12, width: "40%" }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="card">
          <div className="empty-state" style={{ padding: "3rem" }}>
            <div className="empty-state-icon">✓</div>
            <div className="empty-state-text" style={{ fontSize: 16, fontWeight: 500 }}>
              No new requests right now
            </div>
            <div className="text-muted" style={{ marginTop: 6 }}>
              Check back soon — new orders will appear here.
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {orders.map(o => (
            <div key={o.order_id} className="card" style={{ animation: "fadeUp 0.3s ease" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>

                {/* Avatar */}
                <div style={{
                  width: 44, height: 44, borderRadius: "50%",
                  background: "var(--blue-lt)", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 16, fontWeight: 600, color: "var(--blue)",
                }}>
                  {o.customer_name?.split(" ").map(n => n[0]).join("").slice(0, 2)}
                </div>

                {/* Info */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <div style={{ fontSize: 15, fontWeight: 600 }}>{o.customer_name}</div>
                    <span style={{
                      fontSize: 11, background: "var(--amber-lt)", color: "var(--amber-dk)",
                      padding: "2px 8px", borderRadius: 999, fontWeight: 500,
                    }}>
                      Order #{o.order_id}
                    </span>
                  </div>

                  <div style={{ display: "flex", gap: 16, marginTop: 8, flexWrap: "wrap" }}>
                    <div>
                      <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 2 }}>Pickup</div>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{fmtDate(o.pickup_date)} · {o.time_slot}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 2 }}>Address</div>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{o.pickup_address ?? o.customer_address}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 2 }}>Phone</div>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{o.customer_phone}</div>
                    </div>
                  </div>

                  {/* Items */}
                  <div style={{
                    marginTop: 12, padding: "10px 12px",
                    background: "var(--surface2)", borderRadius: "var(--radius-md)",
                  }}>
                    <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 6, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Items
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 20px" }}>
                      {o.items?.map((item, i) => (
                        <div key={i} style={{ fontSize: 13 }}>
                          <span style={{ fontWeight: 500 }}>{item.quantity}× {item.cloth_type}</span>
                          <span style={{ color: "var(--text3)", marginLeft: 5 }}>{item.service_name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {o.notes && (
                    <div style={{ marginTop: 8, fontSize: 12, color: "var(--text3)", fontStyle: "italic" }}>
                      Note: {o.notes}
                    </div>
                  )}
                </div>

                {/* Right: price + actions */}
                <div style={{ flexShrink: 0, textAlign: "right" }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "var(--navy)", marginBottom: 12 }}>
                    {fmtCurrency(o.total_amount)}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <button
                      className="btn btn-amber"
                      disabled={accepting === o.order_id}
                      onClick={() => handleAccept(o.order_id)}
                    >
                      {accepting === o.order_id ? "Accepting..." : "Accept Order"}
                    </button>
                    <button className="btn btn-secondary btn-sm" style={{ justifyContent: "center" }}>
                      Skip
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
