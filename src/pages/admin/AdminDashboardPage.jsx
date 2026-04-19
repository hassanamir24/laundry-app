import { useState, useEffect } from "react";
import { BASE_URL, DEMO_MODE } from "../../api/config";
import StatusPill from "../../components/StatusPill";
function fmtCurrency(n) { return "Rs " + Number(n).toLocaleString("en-PK"); }

export default function AdminDashboardPage({ onNav }) {
  const [orders,  setOrders]  = useState([]);
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (DEMO_MODE) {
        setOrders([
          {order_id:1,status:"Confirmed",total_amount:400,customer_name:"Ali Hassan",dhobi_name:"Mohammad Waseem",order_date:new Date().toISOString()},
          {order_id:2,status:"Washing",  total_amount:310,customer_name:"Sara Khan",  dhobi_name:"Asif Laundry",   order_date:new Date().toISOString()},
          {order_id:7,status:"Pending",  total_amount:0,  customer_name:"Sara Khan",  dhobi_name:null,             order_date:new Date().toISOString()},
        ]);
        setUsers([{role:"customer"},{role:"customer"},{role:"customer"},{role:"dhobi"},{role:"dhobi"},{role:"admin"}]);
        setLoading(false); return;
      }
      try {
        const [o,u] = await Promise.all([
          fetch(`${BASE_URL}/admin/all-orders`).then(r=>r.json()),
          fetch(`${BASE_URL}/admin/users`).then(r=>r.json()),
        ]);
        setOrders(o.items??[]); setUsers(u.items??[]);
      } finally { setLoading(false); }
    }
    load();
  }, []);

  const totalRevenue  = orders.reduce((s,o)=>s+Number(o.total_amount),0);
  const unassigned    = orders.filter(o=>!o.dhobi_name && o.status!=="Cancelled").length;
  const activeOrders  = orders.filter(o=>!["Delivered","Cancelled"].includes(o.status)).length;
  const dhobiCount    = users.filter(u=>u.role==="dhobi").length;

  return (
    <div>
      <div className="page-header"><div className="page-title">Admin Dashboard</div><div className="page-subtitle">Full platform overview.</div></div>
      <div className="metrics-grid">
        {[
          {label:"Total Orders",    value:loading?"—":orders.length,       sub:"All time"},
          {label:"Total Revenue",   value:loading?"—":fmtCurrency(totalRevenue), sub:"Collected"},
          {label:"Active Dhobis",   value:loading?"—":dhobiCount,          sub:"Registered"},
          {label:"Unassigned",      value:loading?"—":unassigned,          sub:"Need dhobi", alert:unassigned>0},
        ].map((m,i) => (
          <div key={i} className="metric-card" style={{borderLeft:m.alert?"3px solid var(--amber)":"none"}}>
            <div className="metric-label">{m.label}</div>
            <div className="metric-value" style={{color:m.alert?"var(--amber-dk)":undefined}}>{m.value}</div>
            <div className="metric-sub">{m.sub}</div>
          </div>
        ))}
      </div>
      {unassigned > 0 && (
        <div style={{background:"var(--amber-lt)",border:"1px solid rgba(232,160,32,0.3)",borderRadius:"var(--radius-md)",padding:"10px 14px",marginBottom:"1.5rem",fontSize:13,color:"var(--amber-dk)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span>⚠️ {unassigned} order{unassigned>1?"s":""} need a dhobi assigned</span>
          <button className="btn btn-amber btn-sm" onClick={()=>onNav("admin-assign")}>Assign Now</button>
        </div>
      )}
      <div className="card">
        <div className="flex-between mb-md">
          <div className="card-title" style={{margin:0}}>Recent Orders</div>
          <button className="btn btn-secondary btn-sm" onClick={()=>onNav("admin-assign")}>View all</button>
        </div>
        {loading ? <div className="text-muted">Loading...</div> : orders.slice(0,8).map(o => (
          <div key={o.order_id} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:"1px solid var(--bg2)",fontSize:14}}>
            <div style={{fontWeight:600,minWidth:50}}>#{o.order_id}</div>
            <div style={{flex:1}}>{o.customer_name}<span style={{color:"var(--text3)",marginLeft:8,fontSize:12}}>{o.dhobi_name?"→ "+o.dhobi_name:"Unassigned"}</span></div>
            <StatusPill status={o.status}/>
            <div style={{fontWeight:600,minWidth:70,textAlign:"right"}}>{fmtCurrency(o.total_amount)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
