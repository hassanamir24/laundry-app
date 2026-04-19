import { useState, useEffect } from "react";
import { BASE_URL, DEMO_MODE } from "../../api/config";
function fmtCurrency(n) { return "Rs " + Number(n).toLocaleString("en-PK"); }
function fmtDate(d) { if(!d) return "—"; return new Date(d).toLocaleDateString("en-PK",{day:"numeric",month:"short"}); }

export default function RevenuePage() {
  const [data, setData]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (DEMO_MODE) {
      setData([
        {order_day:"2026-04-14T19:00:00Z",total_orders:2,revenue:420,delivered:2,pending:0},
        {order_day:"2026-04-16T19:00:00Z",total_orders:2,revenue:560,delivered:0,pending:0},
        {order_day:"2026-04-17T19:00:00Z",total_orders:3,revenue:710,delivered:0,pending:1},
      ]);
      setLoading(false); return;
    }
    fetch(`${BASE_URL}/admin/revenue`).then(r=>r.json()).then(d=>setData(d.items??[])).finally(()=>setLoading(false));
  }, []);

  const totalRev    = data.reduce((s,d)=>s+Number(d.revenue),0);
  const totalOrders = data.reduce((s,d)=>s+Number(d.total_orders),0);
  const maxRevenue  = Math.max(...data.map(d=>Number(d.revenue)),1);

  return (
    <div>
      <div className="page-header"><div className="page-title">Revenue Analytics</div><div className="page-subtitle">Order and revenue breakdown over the last 14 days.</div></div>
      <div className="metrics-grid mb-lg">
        {[
          {label:"Total Revenue (14d)", value:fmtCurrency(totalRev)},
          {label:"Total Orders (14d)",  value:totalOrders},
          {label:"Avg Per Day",         value:fmtCurrency(Math.round(totalRev/Math.max(data.length,1)))},
          {label:"Days Recorded",       value:data.length},
        ].map((m,i)=>(
          <div key={i} className="metric-card"><div className="metric-label">{m.label}</div><div className="metric-value">{loading?"—":m.value}</div></div>
        ))}
      </div>

      {/* Bar chart */}
      <div className="card mb-md">
        <div className="card-title">Daily Revenue</div>
        {loading ? <div style={{height:120}} className="skeleton"/> : (
          <div>
            <div style={{display:"flex",alignItems:"flex-end",gap:8,height:120,marginBottom:8}}>
              {data.map((d,i)=>{
                const pct = (Number(d.revenue)/maxRevenue)*100;
                return (
                  <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                    <div style={{fontSize:11,fontWeight:600,color:"var(--text2)"}}>{fmtCurrency(d.revenue)}</div>
                    <div style={{width:"100%",height:`${Math.max(pct,4)}%`,background:"var(--teal)",borderRadius:"4px 4px 0 0",minHeight:4}}/>
                  </div>
                );
              })}
            </div>
            <div style={{display:"flex",gap:8,borderTop:"1.5px solid var(--bg2)",paddingTop:8}}>
              {data.map((d,i)=><div key={i} style={{flex:1,textAlign:"center",fontSize:11,fontWeight:600,color:"var(--text3)"}}>{fmtDate(d.order_day)}</div>)}
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="card" style={{padding:0,overflow:"hidden"}}>
        <table className="data-table">
          <thead><tr><th>Date</th><th>Orders</th><th>Delivered</th><th>Pending</th><th style={{textAlign:"right"}}>Revenue</th></tr></thead>
          <tbody>
            {data.map((d,i)=>(
              <tr key={i}>
                <td style={{fontWeight:500}}>{fmtDate(d.order_day)}</td>
                <td>{d.total_orders}</td>
                <td style={{color:"var(--teal-dk)",fontWeight:500}}>{d.delivered}</td>
                <td style={{color:"var(--amber-dk)"}}>{d.pending}</td>
                <td style={{textAlign:"right",fontWeight:600}}>{fmtCurrency(d.revenue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
