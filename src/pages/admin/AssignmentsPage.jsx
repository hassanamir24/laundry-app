import { useState, useEffect } from "react";
import { BASE_URL, DEMO_MODE } from "../../api/config";
import StatusPill from "../../components/StatusPill";
function fmtCurrency(n) { return "Rs " + Number(n).toLocaleString("en-PK"); }

export default function AssignmentsPage({ onShowToast }) {
  const [orders,  setOrders]  = useState([]);
  const [dhobis,  setDhobis]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(null);

  function load() {
    setLoading(true);
    if (DEMO_MODE) {
      setOrders([
        {order_id:1,status:"Confirmed",total_amount:400,customer_name:"Ali Hassan",customer_phone:"03001234567",dhobi_id:4,dhobi_name:"Mohammad Waseem",order_date:new Date().toISOString()},
        {order_id:7,status:"Pending",  total_amount:0,  customer_name:"Sara Khan",  customer_phone:"03009876543",dhobi_id:null,dhobi_name:null,order_date:new Date().toISOString()},
        {order_id:2,status:"Washing",  total_amount:310,customer_name:"Sara Khan",  customer_phone:"03009876543",dhobi_id:5,dhobi_name:"Asif Laundry",order_date:new Date().toISOString()},
      ]);
      setDhobis([{user_id:4,name:"Mohammad Waseem"},{user_id:5,name:"Asif Laundry"}]);
      setLoading(false); return;
    }
    Promise.all([
      fetch(`${BASE_URL}/admin/all-orders`).then(r=>r.json()),
      fetch(`${BASE_URL}/admin/users`).then(r=>r.json()),
    ]).then(([o,u])=>{
      setOrders(o.items??[]);
      setDhobis((u.items??[]).filter(u=>u.role==="dhobi"));
    }).finally(()=>setLoading(false));
  }

  useEffect(()=>{ load(); },[]);

  async function handleAssign(orderId, dhobiId) {
    if (!dhobiId) return;
    setAssigning(orderId);
    try {
      if (!DEMO_MODE) {
        await fetch(`${BASE_URL}/admin/assign-dhobi`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({order_id:orderId,dhobi_id:dhobiId})});
      }
      const dhobi = dhobis.find(d=>String(d.user_id)===String(dhobiId));
      setOrders(prev=>prev.map(o=>o.order_id===orderId?{...o,dhobi_id:dhobiId,dhobi_name:dhobi?.name,status:o.status==="Pending"?"Confirmed":o.status}:o));
      onShowToast(`Order #${orderId} assigned to ${dhobi?.name}`, "success");
    } catch(e) { onShowToast("Failed to assign.","error"); } finally { setAssigning(null); }
  }

  const unassigned = orders.filter(o=>!o.dhobi_name&&!["Delivered","Cancelled"].includes(o.status));
  const assigned   = orders.filter(o=>o.dhobi_name&&!["Delivered","Cancelled"].includes(o.status));
  const completed  = orders.filter(o=>["Delivered","Cancelled"].includes(o.status));

  function OrderRow({o}) {
    return (
      <div style={{display:"flex",alignItems:"center",gap:12,padding:"12px 0",borderBottom:"1px solid var(--bg2)",fontSize:14}}>
        <div style={{fontWeight:600,minWidth:50}}>#{o.order_id}</div>
        <div style={{flex:1}}>
          <div style={{fontWeight:500}}>{o.customer_name}</div>
          <div style={{fontSize:12,color:"var(--text3)"}}>{o.customer_phone}</div>
        </div>
        <StatusPill status={o.status}/>
        <div style={{fontWeight:600,minWidth:64,textAlign:"right"}}>{fmtCurrency(o.total_amount)}</div>
        <select style={{padding:"5px 10px",borderRadius:"var(--radius-md)",border:"1.5px solid rgba(28,43,58,0.15)",background:"var(--surface)",fontFamily:"var(--font-ui)",fontSize:13,cursor:"pointer",minWidth:160}}
          value={o.dhobi_id??""} disabled={assigning===o.order_id}
          onChange={e=>handleAssign(o.order_id,e.target.value)}>
          <option value="">— Assign dhobi —</option>
          {dhobis.map(d=><option key={d.user_id} value={d.user_id}>{d.name}</option>)}
        </select>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div className="flex-between">
          <div><div className="page-title">Order Assignments</div><div className="page-subtitle">Assign dhobis to orders, track progress.</div></div>
          <button className="btn btn-secondary" onClick={load}>↻ Refresh</button>
        </div>
      </div>
      {loading ? <div className="card"><div style={{padding:"2rem",textAlign:"center",color:"var(--text3)"}}>Loading...</div></div> : (
        <>
          {unassigned.length > 0 && (
            <div className="card mb-md">
              <div className="card-title" style={{color:"var(--amber-dk)"}}>⚠ Unassigned ({unassigned.length})</div>
              {unassigned.map(o=><OrderRow key={o.order_id} o={o}/>)}
            </div>
          )}
          {assigned.length > 0 && (
            <div className="card mb-md">
              <div className="card-title">Active Orders ({assigned.length})</div>
              {assigned.map(o=><OrderRow key={o.order_id} o={o}/>)}
            </div>
          )}
          {completed.length > 0 && (
            <div className="card">
              <div className="card-title">Completed ({completed.length})</div>
              {completed.map(o=><OrderRow key={o.order_id} o={o}/>)}
            </div>
          )}
        </>
      )}
    </div>
  );
}
