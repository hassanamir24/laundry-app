import { useState, useEffect } from "react";
import { fetchOrders } from "../api/api";
import StatusPill from "../components/StatusPill";

function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-PK", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function fmtCurrency(n) {
  return "Rs " + Number(n).toLocaleString("en-PK");
}

const ALL_STATUSES = [
  "All", "Pending", "Confirmed", "Picked Up", "Washing",
  "Drying", "Ironing", "Ready", "Out for Delivery", "Delivered", "Cancelled",
];

export default function HistoryPage({ user, onTrackOrder }) {
  const [orders, setOrders]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [statusFilter, setFilter] = useState("All");
  const [expanded, setExpanded]   = useState(null);

  useEffect(() => {
    fetchOrders(user?.user_id)
      .then(setOrders)
      .finally(() => setLoading(false));
  }, [user]);

  const filtered = orders.filter(o => {
    const matchSearch =
      !search ||
      String(o.order_id).includes(search) ||
      o.items?.some(i => i.cloth_type.toLowerCase().includes(search.toLowerCase())) ||
      (o.dhobi_name ?? "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalSpent = orders.reduce((s, o) => s + Number(o.total_amount), 0);

  return (
    <div>
      <div className="page-header">
        <div className="flex-between">
          <div>
            <div className="page-title">Order History</div>
            <div className="page-subtitle">
              {orders.length} orders · Total spent {fmtCurrency(totalSpent)}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-md" style={{ animation: "fadeUp 0.3s ease", padding: "1rem 1.25rem" }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          {/* Search */}
          <div style={{ position: "relative", flex: "1 1 220px" }}>
            <svg style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", opacity: 0.4 }}
              width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="8.5" cy="8.5" r="5.5"/><path d="M13.5 13.5L18 18"/>
            </svg>
            <input
              type="text"
              className="form-input"
              placeholder="Search by order ID, cloth, dhobi..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: 32 }}
            />
          </div>
          {/* Status filter pills */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {["All", "Pending", "Washing", "Delivered", "Cancelled"].map(s => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                style={{
                  padding: "5px 12px",
                  borderRadius: 999,
                  border: "1.5px solid",
                  borderColor: statusFilter === s ? "var(--navy)" : "rgba(28,43,58,0.15)",
                  background: statusFilter === s ? "var(--navy)" : "transparent",
                  color: statusFilter === s ? "#fff" : "var(--text2)",
                  fontSize: 12, fontWeight: 500, cursor: "pointer",
                  fontFamily: "var(--font-ui)",
                  transition: "all 0.15s",
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ animation: "fadeUp 0.35s ease", padding: 0, overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: "1.5rem" }}>
            {[1,2,3,4].map(i => (
              <div key={i} style={{ display: "flex", gap: 12, padding: "14px 0", borderBottom: "1px solid var(--bg2)" }}>
                <div className="skeleton" style={{ height: 14, width: "10%", borderRadius: 4 }} />
                <div className="skeleton" style={{ height: 14, width: "30%", borderRadius: 4 }} />
                <div className="skeleton" style={{ height: 14, width: "15%", borderRadius: 4, marginLeft: "auto" }} />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state" style={{ padding: "3rem" }}>
            <div className="empty-state-icon">🔍</div>
            <div className="empty-state-text">No orders match your search</div>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Items</th>
                <th>Dhobi</th>
                <th>Date</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Total</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <>
                  <tr
                    key={o.order_id}
                    onClick={() => setExpanded(expanded === o.order_id ? null : o.order_id)}
                  >
                    <td style={{ fontWeight: 600 }}>#{o.order_id}</td>
                    <td>
                      <div style={{ fontSize: 13 }}>
                        {o.items?.slice(0, 2).map(i => `${i.quantity}× ${i.cloth_type}`).join(", ")}
                        {o.items?.length > 2 && <span className="text-muted"> +{o.items.length - 2} more</span>}
                      </div>
                    </td>
                    <td className="text-sm">{o.dhobi_name ?? <span className="text-muted">Unassigned</span>}</td>
                    <td className="text-sm">{fmtDate(o.order_date)}</td>
                    <td><StatusPill status={o.status} /></td>
                    <td style={{ textAlign: "right", fontWeight: 600 }}>{fmtCurrency(o.total_amount)}</td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={(e) => { e.stopPropagation(); onTrackOrder(o.order_id); }}
                      >
                        Track
                      </button>
                    </td>
                  </tr>

                  {/* Expanded row — item breakdown */}
                  {expanded === o.order_id && (
                    <tr key={`${o.order_id}-expanded`}>
                      <td colSpan={7} style={{ padding: 0 }}>
                        <div style={{
                          background: "var(--surface2)",
                          padding: "1rem 1.5rem",
                          borderTop: "1px solid var(--bg2)",
                          borderBottom: "1px solid var(--bg2)",
                          animation: "fadeUp 0.2s ease",
                        }}>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem 2rem", marginBottom: 12 }}>
                            {o.items?.map((item, i) => (
                              <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                                <span>
                                  {item.quantity}× {item.cloth_type}
                                  <span style={{ color: "var(--text3)", marginLeft: 6 }}>{item.service_name}</span>
                                </span>
                                <span style={{ fontWeight: 500 }}>{fmtCurrency(item.line_total)}</span>
                              </div>
                            ))}
                          </div>
                          {o.notes && (
                            <div style={{ fontSize: 12, color: "var(--text3)", fontStyle: "italic" }}>
                              Note: {o.notes}
                            </div>
                          )}
                          {o.address && (
                            <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 4 }}>
                              📍 {o.address}  ·  {o.time_slot}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
