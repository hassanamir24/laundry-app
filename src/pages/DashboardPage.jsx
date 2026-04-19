import { useState, useEffect } from "react";
import StatusPill from "../components/StatusPill";
import { fetchOrders } from "../api/api";

// Format date nicely
function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-PK", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function fmtCurrency(n) {
  return "Rs " + Number(n).toLocaleString("en-PK");
}

const ACTIVE_STATUSES = new Set([
  "Pending", "Confirmed", "Picked Up", "Washing",
  "Drying", "Ironing", "Ready", "Out for Delivery",
]);

const SUGGESTIONS = [
  { icon: "🗓", text: "You usually schedule pickups on Sundays — want to book for this weekend?" },
  { icon: "✨", text: "Your suits are due for dry cleaning (last cleaned 45 days ago)." },
  { icon: "⚡", text: "Express delivery available tomorrow — complete orders by 6 PM today." },
];

export default function DashboardPage({ user, onNav, onTrackOrder }) {
  const [orders, setOrders]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [suggestion]            = useState(SUGGESTIONS[Math.floor(Math.random() * SUGGESTIONS.length)]);

  useEffect(() => {
    fetchOrders(user?.user_id)
      .then(setOrders)
      .finally(() => setLoading(false));
  }, [user]);

  const activeOrders    = orders.filter((o) => ACTIVE_STATUSES.has(o.status));
  const deliveredOrders = orders.filter((o) => o.status === "Delivered");
  const totalSpent      = orders.reduce((s, o) => s + Number(o.total_amount), 0);
  const recent          = orders.slice(0, 5);

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Good morning, {user?.name?.split(" ")[0] ?? "there"} 👋</div>
        <div className="page-subtitle">Here's what's happening with your laundry today.</div>
      </div>

      {/* AI suggestion strip */}
      <div className="ai-strip">
        <div className="ai-strip-tag">✦ AI Tip</div>
        <div className="ai-strip-text">
          {suggestion.icon} {suggestion.text}
        </div>
        <button className="btn btn-amber btn-sm" onClick={() => onNav("place")}>
          Book Now
        </button>
      </div>

      {/* Metrics */}
      <div className="metrics-grid">
        <MetricCard
          label="Active Orders"
          value={loading ? "—" : activeOrders.length}
          sub={loading ? "" : `${activeOrders.filter(o => o.status === "Washing").length} currently washing`}
          loading={loading}
        />
        <MetricCard
          label="Total Orders"
          value={loading ? "—" : orders.length}
          sub="All time"
          loading={loading}
        />
        <MetricCard
          label="Amount Spent"
          value={loading ? "—" : fmtCurrency(totalSpent)}
          sub="Lifetime total"
          loading={loading}
        />
        <MetricCard
          label="Completed"
          value={loading ? "—" : deliveredOrders.length}
          sub="Delivered orders"
          loading={loading}
        />
      </div>

      <div className="grid-2">
        {/* Active orders */}
        <div className="card" style={{ animation: "fadeUp 0.4s 0.3s ease both" }}>
          <div className="flex-between mb-md">
            <div className="card-title" style={{ margin: 0 }}>Active Orders</div>
            {activeOrders.length > 0 && (
              <button className="btn btn-secondary btn-sm" onClick={() => onNav("track")}>
                Track
              </button>
            )}
          </div>

          {loading ? (
            <SkeletonRows n={3} />
          ) : activeOrders.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🧺</div>
              <div className="empty-state-text">No active orders</div>
              <button
                className="btn btn-primary btn-sm"
                style={{ marginTop: 12 }}
                onClick={() => onNav("place")}
              >
                Place your first order
              </button>
            </div>
          ) : (
            activeOrders.map((o) => (
              <div
                key={o.order_id}
                onClick={() => onTrackOrder(o.order_id)}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "12px 0",
                  borderBottom: "1px solid var(--bg2)",
                  cursor: "pointer",
                  transition: "opacity 0.15s",
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = "0.75"}
                onMouseLeave={e => e.currentTarget.style.opacity = "1"}
              >
                <div style={{
                  width: 38, height: 38, borderRadius: "50%",
                  background: "var(--amber-lt)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 16, flexShrink: 0,
                }}>
                  🧺
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>
                    Order #{o.order_id}
                  </div>
                  <div className="text-muted">
                    {o.items?.map(i => i.cloth_type).join(", ") ?? "—"}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <StatusPill status={o.status} />
                  <div className="text-muted" style={{ marginTop: 3 }}>
                    {fmtCurrency(o.total_amount)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Recent order history */}
        <div className="card" style={{ animation: "fadeUp 0.4s 0.35s ease both" }}>
          <div className="flex-between mb-md">
            <div className="card-title" style={{ margin: 0 }}>Recent History</div>
            <button className="btn btn-secondary btn-sm" onClick={() => onNav("history")}>
              View all
            </button>
          </div>

          {loading ? (
            <SkeletonRows n={4} />
          ) : recent.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📋</div>
              <div className="empty-state-text">No orders yet</div>
            </div>
          ) : (
            recent.map((o) => (
              <div
                key={o.order_id}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "10px 0",
                  borderBottom: "1px solid var(--bg2)",
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>Order #{o.order_id}</div>
                  <div className="text-muted">{fmtDate(o.order_date)}</div>
                </div>
                <StatusPill status={o.status} />
                <div style={{ fontSize: 14, fontWeight: 500, minWidth: 70, textAlign: "right" }}>
                  {fmtCurrency(o.total_amount)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, sub, loading }) {
  return (
    <div className="metric-card">
      <div className="metric-label">{label}</div>
      {loading
        ? <div className="skeleton" style={{ height: 32, width: "60%", marginBottom: 6 }} />
        : <div className="metric-value">{value}</div>
      }
      <div className="metric-sub">{sub}</div>
    </div>
  );
}

function SkeletonRows({ n }) {
  return Array.from({ length: n }).map((_, i) => (
    <div key={i} style={{ display: "flex", gap: 10, padding: "12px 0", borderBottom: "1px solid var(--bg2)" }}>
      <div className="skeleton" style={{ width: 38, height: 38, borderRadius: "50%", flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div className="skeleton" style={{ height: 14, width: "50%", marginBottom: 6 }} />
        <div className="skeleton" style={{ height: 12, width: "70%" }} />
      </div>
    </div>
  ));
}
