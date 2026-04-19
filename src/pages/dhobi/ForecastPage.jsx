import { useState, useEffect } from "react";

const DAY_ORDER = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

function getBusyness(count, max) {
  const pct = max > 0 ? count / max : 0;
  if (pct >= 0.8) return { label: "Very Busy", color: "#C0392B", bg: "#FDECEA" };
  if (pct >= 0.5) return { label: "Busy",      color: "#B87A10", bg: "#FDF3E0" };
  return               { label: "Normal",     color: "#0F6E56", bg: "#E3F5EE" };
}

const TIPS = [
  "Weekends are your busiest days — stock up on detergent by Friday.",
  "Consider hiring a helper on high-demand days.",
  "Enable waitlist mode on very busy days to avoid overload.",
  "Express delivery charges apply on days with 80%+ demand.",
];

export default function ForecastPage({ fetchDemandForecast }) {
  const [data,    setData]    = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDemandForecast()
      .then(raw => {
        // Sort by day of week Sun→Sat
        const sorted = [...raw].sort((a, b) => {
          const ai = DAY_ORDER.findIndex(d => a.day_name.trim().startsWith(d));
          const bi = DAY_ORDER.findIndex(d => b.day_name.trim().startsWith(d));
          return ai - bi;
        });
        setData(sorted);
      })
      .finally(() => setLoading(false));
  }, []);

  const maxCount = Math.max(...data.map(d => d.order_count), 1);
  const totalOrders = data.reduce((s, d) => s + d.order_count, 0);
  const busiestDay  = data.reduce((a, b) => a.order_count > b.order_count ? a : b, { day_name: "—", order_count: 0 });

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Demand Forecast</div>
        <div className="page-subtitle">Order patterns from the last 30 days to help you plan your week.</div>
      </div>

      {/* Summary metrics */}
      <div className="metrics-grid" style={{ marginBottom: "1.5rem" }}>
        {[
          { label: "Total Orders (30d)", value: loading ? "—" : totalOrders },
          { label: "Busiest Day",        value: loading ? "—" : busiestDay.day_name?.trim().slice(0, 3) },
          { label: "Peak Orders/Day",    value: loading ? "—" : maxCount },
          { label: "Daily Average",      value: loading ? "—" : Math.round(totalOrders / 7) },
        ].map((m, i) => (
          <div className="metric-card" key={i}>
            <div className="metric-label">{m.label}</div>
            <div className="metric-value">{m.value}</div>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <div className="card" style={{ marginBottom: "1.25rem", animation: "fadeUp 0.35s ease" }}>
        <div className="card-title">Orders by day of week</div>

        {loading ? (
          <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 160, padding: "0 8px" }}>
            {[65,45,80,60,90,100,85].map((h, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <div className="skeleton" style={{ width: "100%", height: `${h}%`, borderRadius: "6px 6px 0 0" }} />
                <div className="skeleton" style={{ height: 10, width: 28, borderRadius: 4 }} />
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: "8px 0 0" }}>
            {/* Bars */}
            <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 160, marginBottom: 8 }}>
              {data.map((d, i) => {
                const pct      = maxCount > 0 ? (d.order_count / maxCount) * 100 : 0;
                const busyness = getBusyness(d.order_count, maxCount);
                const dayShort = d.day_name.trim().slice(0, 3);
                return (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                    {/* Count label above bar */}
                    <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text2)" }}>
                      {d.order_count}
                    </div>
                    {/* Bar */}
                    <div style={{
                      width: "100%",
                      height: `${Math.max(pct, 6)}%`,
                      background: busyness.color,
                      borderRadius: "6px 6px 0 0",
                      transition: "height 0.5s ease",
                      opacity: 0.85,
                      minHeight: 6,
                    }} />
                  </div>
                );
              })}
            </div>
            {/* Day labels */}
            <div style={{
              display: "flex", gap: 10,
              borderTop: "1.5px solid var(--bg2)", paddingTop: 8,
            }}>
              {data.map((d, i) => (
                <div key={i} style={{ flex: 1, textAlign: "center", fontSize: 11, fontWeight: 600, color: "var(--text3)" }}>
                  {d.day_name.trim().slice(0, 3).toUpperCase()}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Day-by-day breakdown */}
      <div className="card" style={{ animation: "fadeUp 0.4s ease", marginBottom: "1.25rem" }}>
        <div className="card-title">Daily breakdown</div>
        {loading ? (
          <div>{[1,2,3,4,5,6,7].map(i => (
            <div key={i} style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--bg2)" }}>
              <div className="skeleton" style={{ height: 12, width: "15%", borderRadius: 4 }} />
              <div className="skeleton" style={{ height: 12, flex: 1, borderRadius: 4 }} />
              <div className="skeleton" style={{ height: 12, width: "10%", borderRadius: 4 }} />
            </div>
          ))}</div>
        ) : (
          data.map((d, i) => {
            const busyness = getBusyness(d.order_count, maxCount);
            const barWidth = maxCount > 0 ? (d.order_count / maxCount) * 100 : 0;
            return (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "11px 0",
                borderBottom: i < data.length - 1 ? "1px solid var(--bg2)" : "none",
              }}>
                {/* Day name */}
                <div style={{ minWidth: 90, fontSize: 14, fontWeight: 500 }}>
                  {d.day_name.trim()}
                </div>
                {/* Bar */}
                <div style={{ flex: 1, height: 8, background: "var(--bg2)", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", width: `${barWidth}%`,
                    background: busyness.color, borderRadius: 4,
                    transition: "width 0.5s ease",
                  }} />
                </div>
                {/* Count */}
                <div style={{ minWidth: 30, textAlign: "right", fontSize: 14, fontWeight: 600 }}>
                  {d.order_count}
                </div>
                {/* Badge */}
                <div style={{
                  minWidth: 72, padding: "3px 8px", borderRadius: 999,
                  background: busyness.bg, color: busyness.color,
                  fontSize: 11, fontWeight: 600, textAlign: "center",
                }}>
                  {busyness.label}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* AI Tips */}
      <div style={{
        background: "var(--navy)", borderRadius: "var(--radius-lg)",
        padding: "1.25rem 1.5rem", animation: "fadeUp 0.45s ease",
      }}>
        <div style={{
          fontSize: 10, fontWeight: 600, color: "var(--amber)",
          background: "rgba(232,160,32,0.15)", border: "1px solid rgba(232,160,32,0.3)",
          padding: "3px 8px", borderRadius: 999, letterSpacing: "0.08em",
          textTransform: "uppercase", display: "inline-block", marginBottom: 12,
        }}>
          ✦ AI Recommendations
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {TIPS.map((tip, i) => (
            <div key={i} style={{ display: "flex", gap: 10, fontSize: 13, color: "rgba(255,255,255,0.75)" }}>
              <span style={{ color: "var(--amber)", flexShrink: 0 }}>→</span>
              <span>{tip}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
