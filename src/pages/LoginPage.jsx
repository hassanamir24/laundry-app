import { useState } from "react";

export default function LoginPage({ onLogin }) {
  const [mode, setMode]       = useState("login");
  const [form, setForm]       = useState({ name:"", phone:"", password:"", role:"customer", address:"" });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [showPw, setShowPw]   = useState(false);

  function set(field, val) { setForm(f => ({ ...f, [field]: val })); setError(""); }

  async function handleSubmit() {
    if (!form.phone.trim() || !form.password.trim()) { setError("Phone and password are required."); return; }
    if (mode === "signup") {
      if (!form.name.trim())    { setError("Full name is required."); return; }
      if (!form.address.trim()) { setError("Address is required."); return; }
      if (form.password.length < 6) { setError("Password must be at least 6 characters."); return; }
    }
    setLoading(true); setError("");

    try {
      if (mode === "login") {
        const res  = await fetch("/api/login", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: form.phone.trim(), password: form.password }),
        });
        const data = await res.json();
        if (!data || data.success !== 1) { setError("Incorrect phone number or password."); return; }
        onLogin({ user_id: data.user_id, name: data.name, role: data.role, address: data.address, phone: data.phone });

      } else {
        const res = await fetch("/api/signup", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: form.name.trim(), phone: form.phone.trim(), password: form.password, role: form.role, address: form.address.trim() }),
        });
        if (res.status === 409) { setError("This phone number is already registered. Please sign in."); return; }
        if (!res.ok) { setError("Failed to create account. Please try again."); return; }
        const data = await res.json();
        if (!data || data.success !== 1) { setError("Account created. Please sign in."); setMode("login"); return; }
        onLogin({ user_id: data.user_id, name: data.name, role: data.role, address: data.address, phone: data.phone });
      }
    } catch (e) {
      setError("Connection failed. Please check your internet and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", display:"flex", alignItems:"center", justifyContent:"center", padding:"20px 16px", fontFamily:"var(--font-ui)" }}>
      <div style={{ width:"100%", maxWidth:420 }}>

        {/* Logo */}
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{ width:64, height:64, borderRadius:"50%", background:"var(--navy)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px", fontSize:28, boxShadow:"0 8px 24px -4px rgba(29,38,51,0.25)" }}>🧺</div>
          <h1 style={{ fontSize:30, fontWeight:800, color:"var(--navy)", letterSpacing:"-0.5px", marginBottom:4, fontFamily:"var(--font-display)" }}>DhobiNow</h1>
          <p style={{ fontSize:13, color:"var(--text3)", fontWeight:500 }}>Smart Laundry Management</p>
        </div>

        {/* Card */}
        <div style={{ background:"var(--surface)", borderRadius:28, padding:"32px 28px", boxShadow:"0 20px 48px -8px rgba(29,38,51,0.12)", border:"1px solid rgba(100,116,139,0.08)" }}>

          {/* Tabs */}
          <div style={{ display:"flex", background:"var(--bg2)", borderRadius:14, padding:3, marginBottom:28 }}>
            {["login","signup"].map(m => (
              <button key={m} onClick={() => { setMode(m); setError(""); setForm({ name:"", phone:"", password:"", role:"customer", address:"" }); }}
                style={{ flex:1, padding:"10px", border:"none", borderRadius:12, fontFamily:"var(--font-ui)", fontSize:14, fontWeight:700, cursor:"pointer", transition:"all 0.2s", background:mode===m?"var(--surface)":"transparent", color:mode===m?"var(--navy)":"var(--text3)", boxShadow:mode===m?"0 2px 8px -2px rgba(0,0,0,0.08)":"none" }}>
                {m === "login" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          {/* Signup only fields */}
          {mode === "signup" && (
            <>
              <div style={{ marginBottom:16 }}>
                <label style={{ display:"block", fontSize:10, fontWeight:800, color:"var(--text3)", textTransform:"uppercase", letterSpacing:"0.2em", marginBottom:8, marginLeft:2 }}>Full Name</label>
                <input style={inputStyle} type="text" placeholder="e.g. Ali Hassan" value={form.name} onChange={e => set("name", e.target.value)} onKeyDown={e => e.key==="Enter" && handleSubmit()} />
              </div>

              <div style={{ marginBottom:16 }}>
                <label style={{ display:"block", fontSize:10, fontWeight:800, color:"var(--text3)", textTransform:"uppercase", letterSpacing:"0.2em", marginBottom:8, marginLeft:2 }}>I am a</label>
                <div style={{ display:"flex", gap:10 }}>
                  {[["customer","🧍 Customer"],["dhobi","🧺 Dhobi"]].map(([r, label]) => (
                    <button key={r} onClick={() => set("role", r)} style={{ flex:1, padding:"12px 8px", border:`2px solid ${form.role===r?"var(--navy)":"rgba(100,116,139,0.15)"}`, borderRadius:14, fontFamily:"var(--font-ui)", fontSize:13, fontWeight:700, cursor:"pointer", transition:"all 0.15s", background:form.role===r?"var(--navy)":"transparent", color:form.role===r?"#fff":"var(--text2)" }}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom:16 }}>
                <label style={{ display:"block", fontSize:10, fontWeight:800, color:"var(--text3)", textTransform:"uppercase", letterSpacing:"0.2em", marginBottom:8, marginLeft:2 }}>Address</label>
                <input style={inputStyle} type="text" placeholder="Street, City" value={form.address} onChange={e => set("address", e.target.value)} onKeyDown={e => e.key==="Enter" && handleSubmit()} />
              </div>
            </>
          )}

          {/* Common fields */}
          <div style={{ marginBottom:16 }}>
            <label style={{ display:"block", fontSize:10, fontWeight:800, color:"var(--text3)", textTransform:"uppercase", letterSpacing:"0.2em", marginBottom:8, marginLeft:2 }}>Phone Number</label>
            <input style={inputStyle} type="tel" placeholder="03001234567" value={form.phone} onChange={e => set("phone", e.target.value)} onKeyDown={e => e.key==="Enter" && handleSubmit()} inputMode="numeric" />
          </div>

          <div style={{ marginBottom:16 }}>
            <label style={{ display:"block", fontSize:10, fontWeight:800, color:"var(--text3)", textTransform:"uppercase", letterSpacing:"0.2em", marginBottom:8, marginLeft:2 }}>Password</label>
            <div style={{ position:"relative" }}>
              <input style={{ ...inputStyle, paddingRight:48 }} type={showPw?"text":"password"} placeholder={mode==="signup"?"Min. 6 characters":"Enter your password"} value={form.password} onChange={e => set("password", e.target.value)} onKeyDown={e => e.key==="Enter" && handleSubmit()} />
              <button onClick={() => setShowPw(p => !p)} style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"var(--text3)", fontSize:16, padding:4 }}>
                {showPw ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{ fontSize:13, color:"var(--red)", background:"var(--red-lt)", padding:"10px 14px", borderRadius:12, marginBottom:16, fontWeight:500 }}>
              ⚠️ {error}
            </div>
          )}

          {/* Submit */}
          <button onClick={handleSubmit} disabled={loading} style={{ width:"100%", padding:"14px", border:"none", borderRadius:18, fontFamily:"var(--font-ui)", fontSize:15, fontWeight:800, cursor:loading?"not-allowed":"pointer", background:loading?"var(--bg2)":"var(--navy)", color:loading?"var(--text3)":"#fff", transition:"all 0.2s", boxShadow:loading?"none":"0 4px 16px -2px rgba(29,38,51,0.30)", marginBottom:4 }}>
            {loading ? (mode==="login" ? "Signing in..." : "Creating account...") : (mode==="login" ? "Sign In →" : "Create Account →")}
          </button>

          {/* Switch mode */}
          <p style={{ textAlign:"center", fontSize:13, color:"var(--text3)", marginTop:16 }}>
            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            <button onClick={() => { setMode(mode==="login"?"signup":"login"); setError(""); }} style={{ background:"none", border:"none", color:"var(--navy)", fontWeight:700, cursor:"pointer", fontFamily:"var(--font-ui)", fontSize:13 }}>
              {mode === "login" ? "Create one" : "Sign in"}
            </button>
          </p>
        </div>

        <p style={{ textAlign:"center", fontSize:11, color:"var(--text3)", marginTop:20, fontWeight:500 }}>
          By continuing you agree to our Terms of Service & Privacy Policy
        </p>
      </div>
    </div>
  );
}

const inputStyle = {
  width:"100%", padding:"13px 16px", background:"#f8fafc",
  border:"2px solid rgba(100,116,139,0.10)", borderRadius:16,
  fontFamily:"var(--font-ui)", fontSize:15, fontWeight:600,
  color:"var(--navy)", outline:"none", transition:"all 0.15s", display:"block",
};
