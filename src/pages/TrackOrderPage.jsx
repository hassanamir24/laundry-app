import { useState, useEffect } from "react";
import { fetchOrders, fetchStatusLog } from "../api/api";
import StatusPill from "../components/StatusPill";

function fmtDateTime(dt) {
  if (!dt) return "—";
  return new Date(dt).toLocaleString("en-PK", {
    day: "numeric", month: "short",
    hour: "2-digit", minute: "2-digit",
  });
}

function fmtCurrency(n) {
  return "Rs " + Number(n).toLocaleString("en-PK");
}

// Pipeline stages in order
const PIPELINE = [
  "Order Placed",
  "Confirmed",
  "Picked Up",
  "Washing",
  "Drying",
  "Ironing",
  "Ready",
  "Out for Delivery",
  "Delivered",
];

const ACTIVE_STATUSES = new Set([
  "Pending", "Confirmed", "Picked Up", "Washing",
  "Drying", "Ironing", "Ready", "Out for Delivery",
]);

export default function TrackOrderPage({ user, selectedOrderId, onClearSelected }) {
  const [orders, setOrders]       = useState([]);
  const [activeId, setActiveId]   = useState(selectedOrderId ?? null);
  const [statusLog, setStatusLog] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [logLoading, setLogLoading] = useState(false);

  useEffect(() => {
    fetchOrders(user?.user_id)
      .then((data) => {
        setOrders(data);
        // Auto-select most recent active order if none pre-selected
        if (!activeId) {
          const first = data.find(o => ACTIVE_STATUSES.has(o.status)) ?? data[0];
          if (first) setActiveId(first.order_id);
        }
      })
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    if (!activeId) return;
    setLogLoading(true);
    fetchStatusLog(activeId)
      .then(setStatusLog)
      .finally(() => setLogLoading(false));
  }, [activeId]);

  const selected = orders.find(o => o.order_id === activeId);

  // Which step index is the current status?
  const currentIdx = selected
    ? PIPELINE.indexOf(selected.status === "Pending" ? "Order Placed" : selected.status)
    : -1;

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Track Orders</div>
        <div className="page-subtitle">Live status updates for your laundry.</div>
      </div>

      <div className="grid-2" style={{ alignItems: "start" }}>
        {/* Left: order list */}
        <div className="card" style={{ animation: "fadeUp 0.3s ease" }}>
          <div className="card-title">Your Orders</div>
          {loading ? (
            <div style={{ padding: "1rem 0" }}>
              {[1,2,3].map(i => (
                <div key={i} style={{ display: "flex", gap: 10, padding: "10px 0", borderBottom: "1px solid var(--bg2)" }}>
                  <div className="skeleton" style={{ width: 36, height: 36, borderRadius: "50%" }} />
                  <div style={{ flex: 1 }}>
                    <div className="skeleton" style={{ height: 13, width: "50%", marginBottom: 6 }} />
                    <div className="skeleton" style={{ height: 11, width: "70%" }} />
                  </div>
                </div>
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📦</div>
              <div className="empty-state-text">No orders to track</div>
            </div>
          ) : (
            orders.map((o) => (
              <div
                key={o.order_id}
                onClick={() => { setActiveId(o.order_id); onClearSelected?.(); }}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "12px 10px", borderRadius: "var(--radius-md)",
                  cursor: "pointer", transition: "background 0.12s",
                  background: activeId === o.order_id ? "var(--surface2)" : "transparent",
                  borderLeft: activeId === o.order_id ? "3px solid var(--amber)" : "3px solid transparent",
                }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: activeId === o.order_id ? "var(--amber-lt)" : "var(--bg2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 15, flexShrink: 0,
                }}>
                  🧺
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>Order #{o.order_id}</div>
                  <div className="text-muted" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {o.items?.map(i => `${i.quantity}× ${i.cloth_type}`).join(", ") ?? "—"}
                  </div>
                </div>
                <div style={{ flexShrink: 0 }}>
                  <StatusPill status={o.status} />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right: detail + timeline */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {selected ? (
            <>
              {/* Order info */}
              <div className="card" style={{ animation: "fadeUp 0.35s ease" }}>
                <div className="flex-between mb-md">
                  <div>
                    <div style={{ fontSize: 17, fontWeight: 600 }}>Order #{selected.order_id}</div>
                    <div className="text-muted">Dhobi: {selected.dhobi_name ?? "Not yet assigned"}</div>
                  </div>
                  <StatusPill status={selected.status} />
                </div>

                {/* Visual timeline */}
                <div className="timeline-steps">
                  {PIPELINE.map((stage, idx) => {
                    const done    = idx < currentIdx;
                    const current = idx === currentIdx;
                    const isLast  = idx === PIPELINE.length - 1;
                    return (
                      <div key={stage} style={{ display: "flex", alignItems: "center", flex: isLast ? "none" : 1 }}>
                        <div className={`timeline-step ${done ? "done" : ""} ${current ? "current" : ""}`}>
                          <div className="timeline-step-circle">
                            {done ? "✓" : idx + 1}
                          </div>
                          <div className="timeline-step-label">
                            {stage.split(" ").map((w, i) => (
                              <span key={i}>{w}{i < stage.split(" ").length - 1 ? " " : ""}</span>
                            ))}
                          </div>
                        </div>
                        {!isLast && <div className={`timeline-line ${done ? "done" : ""}`} />}
                      </div>
                    );
                  })}
                </div>

                {/* ETA estimate */}
                {ACTIVE_STATUSES.has(selected.status) && (
                  <div style={{
                    background: "var(--amber-lt)",
                    borderRadius: "var(--radius-md)",
                    padding: "10px 14px",
                    fontSize: 13,
                    color: "var(--amber-dk)",
                    fontWeight: 500,
                    marginTop: 8,
                  }}>
                    ⏱ Estimated delivery: {selected.pickup_date
                      ? new Date(new Date(selected.pickup_date).getTime() + 2 * 86400000)
                          .toLocaleDateString("en-PK", { weekday: "long", day: "numeric", month: "short" })
                      : "To be confirmed"
                    }
                  </div>
                )}
              </div>

              {/* Items summary */}
              <div className="card" style={{ animation: "fadeUp 0.4s ease" }}>
                <div className="card-title">Items in this order</div>
                {selected.items?.map((item, i) => (
                  <div key={i} style={{
                    display: "flex", justifyContent: "space-between",
                    padding: "9px 0",
                    borderBottom: i < selected.items.length - 1 ? "1px solid var(--bg2)" : "none",
                    fontSize: 14,
                  }}>
                    <span>{item.quantity}× {item.cloth_type} — <span style={{ color: "var(--text3)" }}>{item.service_name}</span></span>
                    <span style={{ fontWeight: 500 }}>{fmtCurrency(item.line_total)}</span>
                  </div>
                ))}
                <div style={{
                  display: "flex", justifyContent: "space-between",
                  paddingTop: 10, marginTop: 4,
                  borderTop: "1.5px solid var(--bg2)",
                  fontWeight: 600,
                }}>
                  <span>Total</span>
                  <span>{fmtCurrency(selected.total_amount)}</span>
                </div>
              </div>

              {/* Status log */}
              <div className="card" style={{ animation: "fadeUp 0.45s ease" }}>
                <div className="card-title">Status Timeline</div>
                {logLoading ? (
                  <div>
                    {[1,2,3].map(i => (
                      <div key={i} style={{ display: "flex", gap: 12, padding: "10px 0" }}>
                        <div className="skeleton" style={{ width: 10, height: 10, borderRadius: "50%", marginTop: 4 }} />
                        <div style={{ flex: 1 }}>
                          <div className="skeleton" style={{ height: 13, width: "50%", marginBottom: 5 }} />
                          <div className="skeleton" style={{ height: 11, width: "35%" }} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  [...statusLog].reverse().map((entry, i) => (
                    <div key={i} style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: i < statusLog.length - 1 ? "1px solid var(--bg2)" : "none" }}>
                      <div style={{
                        width: 10, height: 10, borderRadius: "50%", marginTop: 4,
                        background: i === 0 ? "var(--amber)" : "var(--teal)",
                        flexShrink: 0,
                      }} />
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 500 }}>{entry.status_label}</div>
                        <div className="text-muted">{fmtDateTime(entry.updated_at)} · {entry.updated_by}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : !loading && (
            <div className="card">
              <div className="empty-state">
                <div className="empty-state-icon">👈</div>
                <div className="empty-state-text">Select an order to see details</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
