import { useState, useEffect } from "react";
import { BASE_URL, DEMO_MODE } from "../../api/config";
function fmtCurrency(n) { return "Rs " + Number(n).toLocaleString("en-PK"); }

export default function PricingPage({ onShowToast }) {
  const [services, setServices] = useState([]);
  const [editing,  setEditing]  = useState({});
  const [saving,   setSaving]   = useState(null);
  const [loading,  setLoading]  = useState(true);

  function load() {
    if (DEMO_MODE) {
      setServices([{service_id:1,service_name:"Wash",price_per_item:50},{service_id:2,service_name:"Iron",price_per_item:30},{service_id:3,service_name:"Wash & Iron",price_per_item:80},{service_id:4,service_name:"Dry Clean",price_per_item:150},{service_id:5,service_name:"Iron Only",price_per_item:30}]);
      setLoading(false); return;
    }
    fetch(`${BASE_URL}/services`).then(r=>r.json()).then(d=>setServices(d.items??[])).finally(()=>setLoading(false));
  }

  useEffect(()=>{ load(); },[]);

  async function savePrice(svc) {
    const price = parseInt(editing[svc.service_id]);
    if (!price||price<=0) { onShowToast("Enter a valid price.","error"); return; }
    setSaving(svc.service_id);
    try {
      if (!DEMO_MODE) {
        await fetch(`${BASE_URL}/admin/update-price`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({service_id:svc.service_id,price})});
      }
      setServices(prev=>prev.map(s=>s.service_id===svc.service_id?{...s,price_per_item:price}:s));
      setEditing(e=>{const n={...e};delete n[svc.service_id];return n;});
      onShowToast(`${svc.service_name} updated to Rs ${price}`, "success");
    } catch(e) { onShowToast("Failed to save.","error"); } finally { setSaving(null); }
  }

  return (
    <div>
      <div className="page-header"><div className="page-title">Platform Pricing</div><div className="page-subtitle">Global service rates. Dhobis can override with their own prices.</div></div>
      {loading ? <div className="text-muted">Loading...</div> : (
        <div className="grid-2">
          {services.map(svc => {
            const isEditing = svc.service_id in editing;
            return (
              <div key={svc.service_id} className="card">
                <div style={{fontSize:15,fontWeight:600,marginBottom:4}}>{svc.service_name}</div>
                <div style={{fontSize:12,color:"var(--text3)",marginBottom:16}}>Per item charge</div>
                {isEditing ? (
                  <div>
                    <div style={{position:"relative",marginBottom:10}}>
                      <span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",fontSize:13,color:"var(--text3)"}}>Rs</span>
                      <input type="number" className="form-input" style={{paddingLeft:30}} autoFocus
                        value={editing[svc.service_id]} onChange={e=>setEditing(p=>({...p,[svc.service_id]:e.target.value}))}
                        onKeyDown={e=>e.key==="Enter"&&savePrice(svc)} />
                    </div>
                    <div style={{display:"flex",gap:8}}>
                      <button className="btn btn-primary btn-sm" disabled={saving===svc.service_id} onClick={()=>savePrice(svc)}>{saving===svc.service_id?"Saving...":"Save"}</button>
                      <button className="btn btn-secondary btn-sm" onClick={()=>setEditing(e=>{const n={...e};delete n[svc.service_id];return n;})}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                    <div style={{fontSize:24,fontWeight:700,color:"var(--navy)"}}>{fmtCurrency(svc.price_per_item)}</div>
                    <button className="btn btn-secondary btn-sm" onClick={()=>setEditing(e=>({...e,[svc.service_id]:String(svc.price_per_item)}))}>Edit</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
