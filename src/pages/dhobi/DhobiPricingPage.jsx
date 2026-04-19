import { useState, useEffect } from "react";
import { BASE_URL, DEMO_MODE } from "../../api/config";
import { fetchServices } from "../../api/api";

function fmtCurrency(n) { return "Rs " + Number(n).toLocaleString("en-PK"); }

const MOCK_SERVICES = [
  { service_id:1, service_name:"Wash",        price_per_item:50  },
  { service_id:2, service_name:"Iron",        price_per_item:30  },
  { service_id:3, service_name:"Wash & Iron", price_per_item:80  },
  { service_id:4, service_name:"Dry Clean",   price_per_item:150 },
  { service_id:5, service_name:"Iron Only",   price_per_item:30  },
];

export default function DhobiPricingPage({ user, onShowToast }) {
  const [services,  setServices]  = useState([]);
  const [myPricing, setMyPricing] = useState({});
  const [editing,   setEditing]   = useState({});
  const [saving,    setSaving]    = useState(null);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const svcs = await fetchServices();
        setServices(svcs);
        if (!DEMO_MODE) {
          const res = await fetch(`${BASE_URL}/dhobi-pricing/${user.user_id}`);
          const data = await res.json();
          const map = {};
          for (const p of (data.items ?? [])) map[p.service_id] = p.custom_price;
          setMyPricing(map);
        }
      } catch (e) {
        setServices(MOCK_SERVICES);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  function startEdit(sid, val) { setEditing(e => ({ ...e, [sid]: String(val) })); }
  function cancelEdit(sid)     { setEditing(e => { const n={...e}; delete n[sid]; return n; }); }

  async function savePrice(svc) {
    const price = parseInt(editing[svc.service_id]);
    if (!price || price <= 0) { onShowToast("Enter a valid price.", "error"); return; }
    setSaving(svc.service_id);
    try {
      if (!DEMO_MODE) {
        await fetch(`${BASE_URL}/dhobi-pricing`, {
          method:"POST", headers:{"Content-Type":"application/json"},
          body: JSON.stringify({ dhobi_id:user.user_id, service_id:svc.service_id, cloth_type:null, custom_price:price }),
        });
      }
      setMyPricing(p => ({ ...p, [svc.service_id]: price }));
      cancelEdit(svc.service_id);
      onShowToast(`${svc.service_name} updated to Rs ${price}`, "success");
    } catch (e) {
      onShowToast("Failed to save.", "error");
    } finally { setSaving(null); }
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-title">My Pricing</div>
        <div className="page-subtitle">Set your own rates. Customers see your prices when they choose you.</div>
      </div>

      <div style={{ background:"var(--amber-lt)", border:"1px solid rgba(232,160,32,0.3)", borderRadius:"var(--radius-md)", padding:"10px 14px", marginBottom:"1.5rem", fontSize:13, color:"var(--amber-dk)" }}>
        ✦ Override any global price with your own rate. Leave as default to use the platform price.
      </div>

      {loading ? (
        [1,2,3,4,5].map(i => <div key={i} className="card mb-sm"><div className="skeleton" style={{ height:14, width:"50%" }} /></div>)
      ) : services.map(svc => {
        const myPrice   = myPricing[svc.service_id];
        const isEditing = svc.service_id in editing;
        const hasCustom = myPrice !== undefined;

        return (
          <div key={svc.service_id} className="card" style={{ marginBottom:"0.75rem", padding:"1rem 1.25rem" }}>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                  <span style={{ fontSize:15, fontWeight:600 }}>{svc.service_name}</span>
                  {hasCustom
                    ? <span style={{ fontSize:11, background:"var(--teal-lt)", color:"var(--teal-dk)", padding:"2px 8px", borderRadius:999, fontWeight:500 }}>Your price</span>
                    : <span style={{ fontSize:11, background:"var(--bg2)", color:"var(--text3)", padding:"2px 8px", borderRadius:999 }}>Global default</span>
                  }
                </div>
                <div style={{ fontSize:12, color:"var(--text3)", marginTop:3 }}>Global rate: {fmtCurrency(svc.price_per_item)}/item</div>
              </div>

              {isEditing ? (
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <div style={{ position:"relative" }}>
                    <span style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", fontSize:13, color:"var(--text3)" }}>Rs</span>
                    <input type="number" className="form-input" style={{ width:100, paddingLeft:30 }}
                      value={editing[svc.service_id]} autoFocus
                      onChange={e => setEditing(p => ({ ...p, [svc.service_id]:e.target.value }))}
                      onKeyDown={e => e.key==="Enter" && savePrice(svc)} />
                  </div>
                  <button className="btn btn-primary btn-sm" disabled={saving===svc.service_id} onClick={() => savePrice(svc)}>{saving===svc.service_id?"...":"Save"}</button>
                  <button className="btn btn-secondary btn-sm" onClick={() => cancelEdit(svc.service_id)}>Cancel</button>
                </div>
              ) : (
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <div style={{ fontSize:20, fontWeight:700, color:hasCustom?"var(--teal-dk)":"var(--text3)" }}>
                    {fmtCurrency(hasCustom ? myPrice : svc.price_per_item)}
                  </div>
                  <button className="btn btn-secondary btn-sm" onClick={() => startEdit(svc.service_id, myPrice ?? svc.price_per_item)}>Edit</button>
                  {hasCustom && <button className="btn btn-secondary btn-sm" onClick={() => { setMyPricing(p => { const n={...p}; delete n[svc.service_id]; return n; }); onShowToast("Reset to global.", "success"); }} style={{ color:"var(--red)" }}>Reset</button>}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
