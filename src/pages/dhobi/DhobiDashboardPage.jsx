import { useState, useEffect } from "react";
import StatusPill from "../../components/StatusPill";

function fmtCurrency(n) { return "Rs " + Number(n).toLocaleString("en-PK"); }
function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" });
}

export default function DhobiDashboardPage({ user, onNav, fetchDhobiOrders, fetchUnassignedOrders }) {
  const [myOrders,    setMyOrders]    = useState([]);
  const [newOrders,   setNewOrders]   = useState([]);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    if (!user?.user_id) return;
    Promise.all([
      fetchDhobiOrders(user.user_id),
      fetchUnassignedOrders(),
    ]).then(([mine, unassigned]) => {
      setMyOrders(mine);
      setNewOrders(unassigned);
    }).finally(() => setLoading(false));
  }, [user]);

  const inProgress = myOrders.filter(o =>
    ["Confirmed","Picked Up","Washing","Drying","Ironing"].includes(o.status)
  );
  const ready      = myOrders.filter(o => o.status === "Ready");
  const todayEarnings = myOrders
    .filter(o => o.status === "Delivered" &&
      new Date(o.order_date).toDateString() === new Date().toDateString())
    .reduce((s, o) => s + Number(o.total_amount), 0);

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Welcome, {user?.name?.split(" ")[0]} 👋</div>
        <div className="page-subtitle">Here's your workload for today.</div>
      </div>

      {/* Metrics */}
      <div className="metrics-grid">
        {[
          { label: "New Requests",  value: loading ? "—" : newOrders.length,   sub: "Awaiting acceptance",  },
          { label: "In Progress",   value: loading ? "—" : inProgress.length,  sub: "Currently processing"  },
          { label: "Ready",         value: loading ? "—" : ready.length,       sub: "Awaiting delivery"     },
          { label: "Today's Jobs",  value: loading ? "—" : myOrders.length,    sub: fmtCurrency(todayEarnings) + " earned" },
        ].map((m, i) => (
          <div className="metric-card" key={i}>
            <div className="metric-label">{m.label}</div>
            <div className="metric-value">{m.value}</div>
            <div className="metric-sub">{m.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        {/* New orders requiring attention */}
        <div className="card" style={{ animation: "fadeUp 0.35s ease" }}>
          <div className="flex-between mb-md">
            <div className="card-title" style={{ margin: 0 }}>New Requests</div>
            {newOrders.length > 0 && (
              <button className="btn btn-amber btn-sm" onClick={() => onNav("new-orders")}>
                View all
              </button>
            )}
          </div>

          {loading ? <SkeletonRows n={2} /> : newOrders.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">✓</div>
              <div className="empty-state-text">No new requests right now</div>
            </div>
          ) : (
            newOrders.slice(0, 3).map(o => (
              <div key={o.order_id} style={{
                padding: "12px 0", borderBottom: "1px solid var(--bg2)",
                display: "flex", alignItems: "center", gap: 12,
              }}>
                <div style={{
                  width: 38, height: 38, borderRadius: "50%",
                  background: "var(--amber-lt)", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
                }}>👤</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{o.customer_name}</div>
                  <div className="text-muted">{o.items?.map(i => `${i.quantity}× ${i.cloth_type}`).join(", ")}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{fmtCurrency(o.total_amount)}</div>
                  <div className="text-muted">{o.time_slot}</div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Active orders */}
        <div className="card" style={{ animation: "fadeUp 0.4s ease" }}>
          <div className="flex-between mb-md">
            <div className="card-title" style={{ margin: 0 }}>Active Orders</div>
            <button className="btn btn-secondary btn-sm" onClick={() => onNav("my-orders")}>
              Manage
            </button>
          </div>

          {loading ? <SkeletonRows n={3} /> : myOrders.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🧺</div>
              <div className="empty-state-text">No active orders</div>
            </div>
          ) : (
            myOrders.slice(0, 4).map(o => (
              <div key={o.order_id} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "10px 0", borderBottom: "1px solid var(--bg2)",
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>
                    Order #{o.order_id}
                    <span style={{ fontSize: 12, color: "var(--text3)", marginLeft: 8 }}>
                      {o.customer_name}
                    </span>
                  </div>
                  <div className="text-muted">{fmtDate(o.pickup_date)} · {o.time_slot}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                  <StatusPill status={o.status} />
                  <div style={{ fontSize: 12, color: "var(--text3)" }}>{fmtCurrency(o.total_amount)}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function SkeletonRows({ n }) {
  return Array.from({ length: n }).map((_, i) => (
    <div key={i} style={{ display: "flex", gap: 10, padding: "12px 0", borderBottom: "1px solid var(--bg2)" }}>
      <div className="skeleton" style={{ width: 38, height: 38, borderRadius: "50%", flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div className="skeleton" style={{ height: 13, width: "50%", marginBottom: 6 }} />
        <div className="skeleton" style={{ height: 11, width: "70%" }} />
      </div>
    </div>
  ));
}
