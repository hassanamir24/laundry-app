import { useState, useEffect } from "react";
import { BASE_URL, DEMO_MODE } from "../../api/config";

export default function UsersPage({ onShowToast }) {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState("all");
  const [search,  setSearch]  = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [form,    setForm]    = useState({name:"",phone:"",role:"customer",address:""});
  const [saving,  setSaving]  = useState(false);

  function load() {
    setLoading(true);
    if (DEMO_MODE) {
      setUsers([
        {user_id:1,name:"Ali Hassan",      phone:"03001234567",role:"customer",address:"House 12, Block C, Faisalabad"},
        {user_id:2,name:"Sara Khan",       phone:"03009876543",role:"customer",address:"Flat 4, Model Town, Lahore"},
        {user_id:3,name:"Raza Mir",        phone:"03112223333",role:"customer",address:"Plot 7, DHA, Karachi"},
        {user_id:4,name:"Mohammad Waseem", phone:"03211112222",role:"dhobi",   address:"Shop 5, Gol Chakkar, Faisalabad"},
        {user_id:5,name:"Asif Laundry",    phone:"03333334444",role:"dhobi",   address:"Main Market, Gulberg, Lahore"},
        {user_id:6,name:"Admin User",      phone:"03000000001",role:"admin",   address:"Head Office, Islamabad"},
      ]);
      setLoading(false); return;
    }
    fetch(`${BASE_URL}/admin/users`).then(r=>r.json()).then(d=>setUsers(d.items??[])).finally(()=>setLoading(false));
  }

  useEffect(()=>{ load(); },[]);

  async function handleAdd() {
    if (!form.name||!form.phone||!form.address) { onShowToast("All fields required.","error"); return; }
    setSaving(true);
    try {
      if (!DEMO_MODE) {
        await fetch(`${BASE_URL}/admin/add-user`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});
      }
      onShowToast(`${form.name} added as ${form.role}!`,"success");
      setShowAdd(false); setForm({name:"",phone:"",role:"customer",address:""});
      load();
    } catch(e) { onShowToast("Failed to add user.","error"); } finally { setSaving(false); }
  }

  const ROLE_COLOR = { customer:{bg:"var(--blue-lt)",color:"var(--blue)"}, dhobi:{bg:"var(--teal-lt)",color:"var(--teal-dk)"}, admin:{bg:"#EEEDFE",color:"#534AB7"} };
  const filtered = users.filter(u => (filter==="all"||u.role===filter) && (!search||u.name.toLowerCase().includes(search.toLowerCase())||u.phone.includes(search)));

  return (
    <div>
      <div className="page-header"><div className="flex-between">
        <div><div className="page-title">Users</div><div className="page-subtitle">{users.length} registered users</div></div>
        <button className="btn btn-amber" onClick={()=>setShowAdd(s=>!s)}>+ Add User</button>
      </div></div>

      {showAdd && (
        <div className="card mb-md" style={{animation:"fadeUp 0.25s ease"}}>
          <div className="card-title">New User</div>
          <div className="grid-2">
            <div className="form-group"><label className="form-label">Name</label><input className="form-input" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} /></div>
            <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} /></div>
            <div className="form-group"><label className="form-label">Role</label>
              <select className="form-select" value={form.role} onChange={e=>setForm(f=>({...f,role:e.target.value}))}>
                <option value="customer">Customer</option><option value="dhobi">Dhobi</option><option value="admin">Admin</option>
              </select>
            </div>
            <div className="form-group"><label className="form-label">Address</label><input className="form-input" value={form.address} onChange={e=>setForm(f=>({...f,address:e.target.value}))} /></div>
          </div>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
            <button className="btn btn-secondary" onClick={()=>setShowAdd(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleAdd} disabled={saving}>{saving?"Saving...":"Add User"}</button>
          </div>
        </div>
      )}

      <div className="card" style={{padding:0,overflow:"hidden"}}>
        <div style={{padding:"1rem 1.25rem",borderBottom:"1px solid var(--bg2)",display:"flex",gap:10,flexWrap:"wrap"}}>
          <input className="form-input" placeholder="Search..." style={{flex:1,minWidth:180}} value={search} onChange={e=>setSearch(e.target.value)} />
          {["all","customer","dhobi","admin"].map(r=>(
            <button key={r} onClick={()=>setFilter(r)} style={{padding:"5px 14px",borderRadius:999,border:`1.5px solid ${filter===r?"var(--navy)":"rgba(28,43,58,0.15)"}`,background:filter===r?"var(--navy)":"transparent",color:filter===r?"#fff":"var(--text2)",fontSize:12,fontWeight:500,cursor:"pointer",fontFamily:"var(--font-ui)",textTransform:"capitalize"}}>
              {r==="all"?"All":r}
            </button>
          ))}
        </div>
        {loading ? <div style={{padding:"2rem",textAlign:"center",color:"var(--text3)"}}>Loading...</div> : (
          <table className="data-table">
            <thead><tr><th>Name</th><th>Phone</th><th>Role</th><th>Address</th></tr></thead>
            <tbody>
              {filtered.map(u=>(
                <tr key={u.user_id}>
                  <td style={{fontWeight:500}}>{u.name}</td>
                  <td className="text-sm">{u.phone}</td>
                  <td><span style={{fontSize:11,padding:"2px 10px",borderRadius:999,fontWeight:500,...(ROLE_COLOR[u.role]||{})}}>{u.role}</span></td>
                  <td className="text-sm" style={{color:"var(--text3)"}}>{u.address}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
