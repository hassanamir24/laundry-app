import { useState, useEffect } from "react";
import { fetchServices, placeOrder } from "../api/api";
import { fetchDhobis } from "../api/api";
import { CLOTH_TYPES } from "../api/mockData";

function fmtCurrency(n) { return "Rs " + Number(n).toLocaleString("en-PK"); }

const TIME_SLOTS = ["8AM – 10AM","10AM – 12PM","12PM – 2PM","2PM – 4PM","4PM – 6PM"];
function tomorrow() { const d = new Date(); d.setDate(d.getDate()+1); return d.toISOString().split("T")[0]; }

export default function PlaceOrderPage({ user, onSuccess, onShowToast }) {
  const [services, setServices] = useState([]);
  const [dhobis,   setDhobis]   = useState([]);
  const [step, setStep]         = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Step 1 fields
  const [pickupDate,  setPickupDate]  = useState(tomorrow());
  const [timeSlot,    setTimeSlot]    = useState(TIME_SLOTS[0]);
  const [address,     setAddress]     = useState(user?.address ?? "");
  const [notes,       setNotes]       = useState("");
  const [pickupType,  setPickupType]  = useState("pickup");   // pickup | dropoff
  const [returnType,  setReturnType]  = useState("deliver");  // deliver | collect
  const [selectedDhobi, setSelectedDhobi] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");  // COD | Online

  const [items, setItems] = useState([{ id:Date.now(), cloth_type:"Shirt", quantity:1, service_id:"" }]);

  useEffect(() => {
    fetchServices().then(setServices);
    fetchDhobis().then(setDhobis);
  }, []);

  function updateItem(id, field, val) { setItems(p => p.map(i => i.id===id ? {...i,[field]:val} : i)); }
  function addItem()    { setItems(p => [...p, { id:Date.now(), cloth_type:"Shirt", quantity:1, service_id:"" }]); }
  function removeItem(id) { if (items.length===1) return; setItems(p => p.filter(i => i.id!==id)); }

  function getLinePrice(item) {
    const svc = services.find(s => String(s.service_id) === String(item.service_id));
    return svc ? svc.price_per_item * item.quantity : 0;
  }
  const total = items.reduce((s,i) => s + getLinePrice(i), 0);

  const step1Valid = pickupDate && timeSlot && address.trim() && (pickupType==="pickup" || selectedDhobi);
  const step2Valid = items.every(i => i.cloth_type && i.quantity > 0 && i.service_id);

  async function handleSubmit() {
    setSubmitting(true);
    try {
      await placeOrder({
        user_id: user.user_id, pickup_date: pickupDate, time_slot: timeSlot,
        address, notes, pickup_type: pickupType, return_type: returnType,
        payment_method: paymentMethod, selected_dhobi: selectedDhobi,
        items: items.map(i => {
          const svc = services.find(s => String(s.service_id)===String(i.service_id));
          return { cloth_type:i.cloth_type, quantity:i.quantity, service_id:i.service_id, price: svc ? svc.price_per_item*i.quantity : 0 };
        }),
      });
      onShowToast("Order placed successfully! 🎉", "success");
      onSuccess();
    } catch (e) {
      onShowToast("Failed to place order. Try again.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Option card component ─────────────────────────────────
  function OptionCard({ active, onClick, icon, title, desc }) {
    return (
      <div onClick={onClick} style={{ flex:1, padding:"12px 14px", border:`1.5px solid ${active?"var(--navy)":"rgba(28,43,58,0.15)"}`, borderRadius:"var(--radius-md)", background:active?"var(--navy)":"var(--surface)", cursor:"pointer", transition:"all 0.15s" }}>
        <div style={{ fontSize:20, marginBottom:6 }}>{icon}</div>
        <div style={{ fontSize:14, fontWeight:600, color:active?"#fff":"var(--navy)" }}>{title}</div>
        <div style={{ fontSize:12, color:active?"rgba(255,255,255,0.65)":"var(--text3)", marginTop:2 }}>{desc}</div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Place New Order</div>
        <div className="page-subtitle">Schedule a pickup and add your laundry items.</div>
      </div>

      {/* Step indicator */}
      <div style={{ display:"flex", gap:0, marginBottom:"2rem" }}>
        {[{n:1,label:"Details"},{n:2,label:"Items"},{n:3,label:"Review"}].map(({n,label},idx) => (
          <div key={n} style={{ display:"flex", alignItems:"center", flex:idx<2?1:"none" }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
              <div style={{ width:28, height:28, borderRadius:"50%", background:step>=n?"var(--navy)":"var(--bg2)", color:step>=n?"#fff":"var(--text3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:600, transition:"all 0.3s" }}>
                {step>n?"✓":n}
              </div>
              <span style={{ fontSize:13, fontWeight:step===n?600:400, color:step===n?"var(--navy)":"var(--text3)" }}>{label}</span>
            </div>
            {idx<2 && <div style={{ flex:1, height:1, margin:"0 16px", background:step>n?"var(--navy)":"var(--bg2)", transition:"background 0.3s" }} />}
          </div>
        ))}
      </div>

      {/* ── Step 1 ── */}
      {step === 1 && (
        <div className="card" style={{ animation:"fadeUp 0.3s ease", maxWidth:620 }}>

          {/* Pickup type */}
          <div className="form-group">
            <label className="form-label">How should we collect your clothes?</label>
            <div style={{ display:"flex", gap:10 }}>
              <OptionCard active={pickupType==="pickup"}  onClick={() => setPickupType("pickup")}  icon="🚗" title="We pick up"     desc="Dhobi comes to your door" />
              <OptionCard active={pickupType==="dropoff"} onClick={() => setPickupType("dropoff")} icon="🏃" title="I drop off"     desc="You bring to dhobi's shop" />
            </div>
          </div>

          {/* Return type */}
          <div className="form-group">
            <label className="form-label">How should you get your clothes back?</label>
            <div style={{ display:"flex", gap:10 }}>
              <OptionCard active={returnType==="deliver"} onClick={() => setReturnType("deliver")} icon="🚚" title="Deliver to me"  desc="Dhobi brings back to door" />
              <OptionCard active={returnType==="collect"} onClick={() => setReturnType("collect")} icon="🏃" title="I collect"      desc="You pick up from shop" />
            </div>
          </div>

          {/* Dhobi selection for dropoff */}
          {pickupType === "dropoff" && (
            <div className="form-group">
              <label className="form-label">Select Dhobi</label>
              <select className="form-select" value={selectedDhobi} onChange={e => setSelectedDhobi(e.target.value)}>
                <option value="">Choose a dhobi...</option>
                {dhobis.map(d => (
                  <option key={d.user_id} value={d.user_id}>{d.name} — {d.address}</option>
                ))}
              </select>
            </div>
          )}

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Pickup Date</label>
              <input type="date" className="form-input" value={pickupDate} min={tomorrow()} onChange={e => setPickupDate(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Time Slot</label>
              <select className="form-select" value={timeSlot} onChange={e => setTimeSlot(e.target.value)}>
                {TIME_SLOTS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">{pickupType==="pickup" ? "Pickup Address" : "Your Address"}</label>
            <input type="text" className="form-input" value={address} onChange={e => setAddress(e.target.value)} placeholder="Enter full address" />
          </div>

          {/* Payment method */}
          <div className="form-group">
            <label className="form-label">Payment Method</label>
            <div style={{ display:"flex", gap:10 }}>
              <OptionCard active={paymentMethod==="COD"}    onClick={() => setPaymentMethod("COD")}    icon="💵" title="Cash on Delivery" desc="Pay when order is delivered" />
              <OptionCard active={paymentMethod==="Online"} onClick={() => setPaymentMethod("Online")} icon="💳" title="Online Payment"   desc="Pay securely online" />
            </div>
          </div>

          {paymentMethod === "Online" && (
            <div style={{ padding:"12px 14px", background:"var(--blue-lt)", borderRadius:"var(--radius-md)", fontSize:13, color:"var(--blue)", marginBottom:"1rem" }}>
              ℹ️ Online payment integration (JazzCash / EasyPaisa) coming soon. Your order will be placed and payment collected on delivery for now.
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Special Instructions (optional)</label>
            <textarea className="form-textarea" value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g. use mild detergent, no bleach" />
          </div>

          <div style={{ display:"flex", justifyContent:"flex-end" }}>
            <button className="btn btn-primary" disabled={!step1Valid} onClick={() => setStep(2)}>Continue to Items →</button>
          </div>
        </div>
      )}

      {/* ── Step 2: Items ── */}
      {step === 2 && (
        <div style={{ animation:"fadeUp 0.3s ease" }}>
          <div className="card mb-md">
            <div style={{ display:"grid", gridTemplateColumns:"1fr 160px 120px 80px 32px", gap:10, alignItems:"center", padding:"0 0 10px", borderBottom:"1.5px solid var(--bg2)", marginBottom:8 }}>
              {["Cloth type","Service","Qty","Price",""].map(h => (
                <div key={h} style={{ fontSize:11, fontWeight:600, color:"var(--text3)", textTransform:"uppercase", letterSpacing:"0.06em" }}>{h}</div>
              ))}
            </div>
            {items.map(item => {
              const linePrice = getLinePrice(item);
              return (
                <div key={item.id} style={{ display:"grid", gridTemplateColumns:"1fr 160px 120px 80px 32px", gap:10, alignItems:"center", padding:"8px 0", borderBottom:"1px solid var(--bg2)" }}>
                  <select className="form-select" style={{ padding:"7px 10px" }} value={item.cloth_type} onChange={e => updateItem(item.id,"cloth_type",e.target.value)}>
                    {CLOTH_TYPES.map(c => <option key={c}>{c}</option>)}
                  </select>
                  <select className="form-select" style={{ padding:"7px 10px" }} value={item.service_id} onChange={e => updateItem(item.id,"service_id",e.target.value)}>
                    <option value="">Select...</option>
                    {services.map(s => <option key={s.service_id} value={s.service_id}>{s.service_name} — Rs {s.price_per_item}</option>)}
                  </select>
                  <div className="stepper">
                    <button className="stepper-btn" onClick={() => updateItem(item.id,"quantity",Math.max(1,item.quantity-1))}>−</button>
                    <div className="stepper-val">{item.quantity}</div>
                    <button className="stepper-btn" onClick={() => updateItem(item.id,"quantity",item.quantity+1)}>+</button>
                  </div>
                  <div style={{ fontSize:14, fontWeight:500, color:linePrice?"var(--navy)":"var(--text3)" }}>{linePrice ? fmtCurrency(linePrice) : "—"}</div>
                  <button onClick={() => removeItem(item.id)} disabled={items.length===1} style={{ width:28, height:28, borderRadius:"50%", border:"1px solid rgba(192,57,43,0.25)", background:"transparent", cursor:"pointer", color:"var(--red)", fontSize:16, opacity:items.length===1?0.3:1, display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
                </div>
              );
            })}
            <div style={{ display:"flex", justifyContent:"space-between", marginTop:14, alignItems:"center" }}>
              <button className="btn btn-secondary btn-sm" onClick={addItem}>+ Add Item</button>
              <div style={{ fontSize:15, fontWeight:600 }}>Total: {fmtCurrency(total)}</div>
            </div>
          </div>
          <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
            <button className="btn btn-secondary" onClick={() => setStep(1)}>← Back</button>
            <button className="btn btn-primary" disabled={!step2Valid} onClick={() => setStep(3)}>Review Order →</button>
          </div>
        </div>
      )}

      {/* ── Step 3: Review ── */}
      {step === 3 && (
        <div style={{ animation:"fadeUp 0.3s ease", maxWidth:580 }}>
          <div className="card mb-md">
            <div className="card-title">Order Summary</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px 24px", fontSize:14 }}>
              {[
                ["Pickup",       pickupType==="pickup" ? "🚗 We pick up" : "🏃 You drop off"],
                ["Return",       returnType==="deliver" ? "🚚 We deliver back" : "🏃 You collect"],
                ["Date",         pickupDate],
                ["Time",         timeSlot],
                ["Address",      address],
                ["Payment",      paymentMethod==="COD" ? "💵 Cash on Delivery" : "💳 Online"],
                ["Notes",        notes || "—"],
              ].map(([k,v]) => (
                <div key={k}>
                  <div style={{ fontSize:11, color:"var(--text3)", marginBottom:2 }}>{k}</div>
                  <div style={{ fontWeight:500 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card mb-md">
            <div className="card-title">Items</div>
            {items.map((item,i) => {
              const svc = services.find(s => String(s.service_id)===String(item.service_id));
              return (
                <div key={item.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:i<items.length-1?"1px solid var(--bg2)":"none", fontSize:14 }}>
                  <div><span style={{ fontWeight:500 }}>{item.quantity}× {item.cloth_type}</span><span style={{ color:"var(--text3)", marginLeft:8 }}>{svc?.service_name}</span></div>
                  <div style={{ fontWeight:500 }}>{fmtCurrency(getLinePrice(item))}</div>
                </div>
              );
            })}
            <div style={{ display:"flex", justifyContent:"space-between", paddingTop:12, marginTop:4, borderTop:"1.5px solid var(--bg2)", fontWeight:600, fontSize:16 }}>
              <span>Total</span><span style={{ color:"var(--navy)" }}>{fmtCurrency(total)}</span>
            </div>
          </div>

          <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
            <button className="btn btn-secondary" onClick={() => setStep(2)}>← Back</button>
            <button className="btn btn-amber" disabled={submitting} onClick={handleSubmit}>
              {submitting ? "Placing Order..." : "Confirm & Place Order 🎉"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
