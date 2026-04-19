import { useState } from "react";
import { BASE_URL, DEMO_MODE } from "../api/config";

export default function LoginPage({ onLogin }) {
  const [mode, setMode]       = useState("login");
  const [form, setForm]       = useState({ name:"", phone:"", password:"", role:"customer", address:"" });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  function set(field, val) { setForm(f => ({ ...f, [field]: val })); setError(""); }

  async function handleSubmit() {
    if (!form.phone.trim() || !form.password.trim()) { setError("Phone and password are required."); return; }
    if (mode === "signup" && (!form.name.trim() || !form.address.trim())) { setError("All fields are required."); return; }
    setLoading(true); setError("");

    try {
      if (DEMO_MODE) {
        await new Promise(r => setTimeout(r, 700));
        const DEMO_USERS = [
          { user_id:1, name:"Ali Hassan",      phone:"03001234567", password:"password123", role:"customer", address:"House 12, Block C, Faisalabad" },
          { user_id:4, name:"Mohammad Waseem", phone:"03211112222", password:"password123", role:"dhobi",    address:"Shop 5, Gol Chakkar, Faisalabad" },
          { user_id:5, name:"Asif Laundry",    phone:"03333334444", password:"password123", role:"dhobi",    address:"Main Market, Gulberg, Lahore" },
          { user_id:6, name:"Admin User",      phone:"03000000001", password:"password123", role:"admin",    address:"Head Office, Islamabad" },
        ];
        if (mode === "login") {
          const u = DEMO_USERS.find(u => u.phone === form.phone.trim() && u.password === form.password);
          if (!u) { setError("Incorrect phone or password."); return; }
          const { password, ...user } = u;
          onLogin(user); return;
        } else {
          if (DEMO_USERS.find(u => u.phone === form.phone.trim())) { setError("Phone already registered."); return; }
          onLogin({ user_id: Date.now(), name: form.name, phone: form.phone, role: form.role, address: form.address }); return;
        }
      }

      if (mode === "login") {
        const res  = await fetch(`${BASE_URL}/login`, {
          method:"POST", headers:{"Content-Type":"application/json"},
          body: JSON.stringify({ phone: form.phone.trim(), password: form.password }),
        });
        const data = await res.json();
        const out  = data.items?.[0] ?? data;
        if (!out || String(out.success) === "0" || out.success === 0) { setError("Incorrect phone or password."); return; }
        onLogin({ user_id: out.user_id, name: out.name, role: out.role, address: out.address, phone: form.phone.trim() });
      } else {
        const res = await fetch(`${BASE_URL}/signup`, {
          method:"POST", headers:{"Content-Type":"application/json"},
          body: JSON.stringify({ name:form.name.trim(), phone:form.phone.trim(), password:form.password, role:form.role, address:form.address.trim() }),
        });
        if (!res.ok) { setError("Phone number already registered."); return; }
        const res2 = await fetch(`${BASE_URL}/login`, {
          method:"POST", headers:{"Content-Type":"application/json"},
          body: JSON.stringify({ phone: form.phone.trim(), password: form.password }),
        });
        const data2 = await res2.json();
        const out2  = data2.items?.[0] ?? data2;
        onLogin({ user_id: out2.user_id, name: out2.name, role: out2.role, address: out2.address, phone: form.phone.trim() });
      }
    } catch (e) {
      setError("Could not connect. Make sure ORDS is running.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ width:"100%", maxWidth:440, padding:"0 1rem" }}>
        <div style={{ textAlign:"center", marginBottom:"2rem" }}>
          <div style={{ width:56, height:56, borderRadius:"50%", background:"var(--navy)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 1rem", fontSize:26 }}>🧺</div>
          <div style={{ fontFamily:"var(--font-display)", fontSize:32, color:"var(--navy)", letterSpacing:"-0.5px" }}>DhobiNow</div>
          <div style={{ fontSize:13, color:"var(--text3)", marginTop:4 }}>Smart Laundry Management</div>
        </div>

        <div className="card" style={{ padding:"2rem" }}>
          <div style={{ display:"flex", background:"var(--bg2)", borderRadius:"var(--radius-md)", padding:3, marginBottom:"1.5rem" }}>
            {["login","signup"].map(m => (
              <button key={m} onClick={() => { setMode(m); setError(""); }}
                style={{ flex:1, padding:"8px", border:"none", borderRadius:"var(--radius-md)", fontFamily:"var(--font-ui)", fontSize:14, fontWeight:500, cursor:"pointer", transition:"all 0.15s", background:mode===m?"var(--surface)":"transparent", color:mode===m?"var(--navy)":"var(--text3)", boxShadow:mode===m?"var(--shadow-sm)":"none" }}>
                {m === "login" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          {mode === "signup" && (
            <>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" type="text" placeholder="e.g. Ali Hassan" value={form.name} onChange={e => set("name", e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">I am a</label>
                <div style={{ display:"flex", gap:8 }}>
                  {["customer","dhobi"].map(r => (
                    <button key={r} onClick={() => set("role", r)}
                      style={{ flex:1, padding:"9px", border:`1.5px solid ${form.role===r?"var(--navy)":"rgba(28,43,58,0.15)"}`, borderRadius:"var(--radius-md)", background:form.role===r?"var(--navy)":"transparent", color:form.role===r?"#fff":"var(--text2)", fontFamily:"var(--font-ui)", fontSize:14, fontWeight:500, cursor:"pointer", transition:"all 0.15s" }}>
                      {r === "customer" ? "🧍 Customer" : "🧺 Dhobi"}
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Address</label>
                <input className="form-input" type="text" placeholder="Your full address" value={form.address} onChange={e => set("address", e.target.value)} />
              </div>
            </>
          )}

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input className="form-input" type="text" placeholder="03001234567" value={form.phone} onChange={e => set("phone", e.target.value)} onKeyDown={e => e.key==="Enter" && handleSubmit()} />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" placeholder="Enter password" value={form.password} onChange={e => set("password", e.target.value)} onKeyDown={e => e.key==="Enter" && handleSubmit()} />
          </div>

          {error && (
            <div style={{ fontSize:13, color:"var(--red)", background:"var(--red-lt)", padding:"8px 12px", borderRadius:"var(--radius-md)", marginBottom:"1rem" }}>
              {error}
            </div>
          )}

          <button className="btn btn-primary" style={{ width:"100%", justifyContent:"center", padding:11 }} onClick={handleSubmit} disabled={loading}>
            {loading ? (mode==="login" ? "Signing in..." : "Creating account...") : (mode==="login" ? "Sign In →" : "Create Account →")}
          </button>

          {mode === "login" && (
            <div style={{ marginTop:"1.5rem", borderTop:"1px solid var(--bg2)", paddingTop:"1.25rem" }}>
              <div style={{ fontSize:11, color:"var(--text3)", marginBottom:8, textTransform:"uppercase", letterSpacing:"0.06em", fontWeight:600 }}>Demo Quick Login</div>
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                {[
                  { name:"Ali Hassan",      phone:"03001234567", role:"customer" },
                  { name:"Mohammad Waseem", phone:"03211112222", role:"dhobi"    },
                  { name:"Admin User",      phone:"03000000001", role:"admin"    },
                ].map(u => (
                  <button key={u.phone} onClick={() => { set("phone", u.phone); set("password", "password123"); }}
                    style={{ padding:"7px 12px", borderRadius:"var(--radius-md)", border:`1px solid ${form.phone===u.phone?"var(--navy)":"var(--bg2)"}`, background:form.phone===u.phone?"var(--navy)":"var(--surface2)", color:form.phone===u.phone?"#fff":"var(--text2)", fontSize:13, cursor:"pointer", fontFamily:"var(--font-ui)", display:"flex", justifyContent:"space-between", transition:"all 0.15s" }}>
                    <span>{u.name}</span>
                    <span style={{ opacity:0.6, fontSize:11, textTransform:"uppercase" }}>{u.role}</span>
                  </button>
                ))}
              </div>
              <div style={{ fontSize:11, color:"var(--text3)", marginTop:8, textAlign:"center" }}>Default password: <code>password123</code></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
