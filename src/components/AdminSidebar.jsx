import { useState } from "react";

export default function AdminSidebar({ page, onNav, user, onLogout }) {
  const [open, setOpen] = useState(false);
  const initials = user?.name ? user.name.split(" ").map(n=>n[0]).join("").slice(0,2) : "AD";
  const NAV = [
    { section:"Overview",  items:[{ id:"admin-dashboard", label:"Dashboard",   icon:HomeIcon   }] },
    { section:"Manage",    items:[{ id:"admin-users",     label:"Users",        icon:UsersIcon  },
                                   { id:"admin-orders",    label:"Assignments",  icon:AssignIcon },
                                   { id:"admin-pricing",   label:"Pricing",      icon:PriceIcon  }] },
    { section:"Analytics", items:[{ id:"admin-revenue",   label:"Revenue",      icon:ChartIcon  },
                                   { id:"ai-assistant",    label:"AI Assistant", icon:AIIcon     }] },
  ];

  function navigate(id) { onNav(id); setOpen(false); }

  const Content = () => (
    <>
      <div className="sidebar-brand">
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
          <div style={{width:36,height:36,borderRadius:"50%",background:"rgba(255,255,255,0.08)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>🧺</div>
          <div><div className="brand-name">DhobiNow</div><div className="brand-tagline" style={{color:"var(--amber)"}}>Admin Portal</div></div>
        </div>
      </div>
      <nav className="sidebar-nav">
        {NAV.map(sec => (
          <div key={sec.section}>
            <div className="nav-section-label">{sec.section}</div>
            {sec.items.map(item => {
              const Icon = item.icon;
              return <div key={item.id} className={`nav-item ${page===item.id?"active":""}`} onClick={()=>navigate(item.id)}><Icon className="nav-icon"/>{item.label}</div>;
            })}
          </div>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="sidebar-user" style={{marginBottom:10}}>
          <div className="user-avatar" style={{background:"var(--amber)",color:"var(--navy)"}}>{initials}</div>
          <div><div className="user-name">{user?.name??"Admin"}</div><div className="user-role">Administrator</div></div>
        </div>
        <button onClick={onLogout} style={{width:"100%",padding:"10px",borderRadius:12,border:"1px solid rgba(255,255,255,0.08)",background:"transparent",color:"rgba(255,255,255,0.4)",fontSize:11,cursor:"pointer",fontFamily:"var(--font-ui)",fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}
          onMouseEnter={e=>{e.currentTarget.style.color="#fff";e.currentTarget.style.background="rgba(255,255,255,0.06)";}}
          onMouseLeave={e=>{e.currentTarget.style.color="rgba(255,255,255,0.4)";e.currentTarget.style.background="transparent";}}>
          ↩ Sign out
        </button>
      </div>
    </>
  );

  return (
    <>
      <aside className="sidebar sidebar-desktop"><Content /></aside>
      <div className="mobile-topbar">
        <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:20}}>🧺</span><span style={{fontWeight:800,fontSize:17,color:"#fff"}}>DhobiNow</span></div>
        <button onClick={()=>setOpen(true)} style={{width:38,height:38,borderRadius:10,background:"rgba(255,255,255,0.08)",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:4,padding:10}}>
          <span style={{width:16,height:2,background:"#fff",borderRadius:2,display:"block"}}/><span style={{width:16,height:2,background:"#fff",borderRadius:2,display:"block"}}/><span style={{width:12,height:2,background:"#fff",borderRadius:2,display:"block"}}/>
        </button>
      </div>
      {open && (
        <>
          <div onClick={()=>setOpen(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",zIndex:200,backdropFilter:"blur(3px)"}}/>
          <aside style={{position:"fixed",left:0,top:0,bottom:0,width:280,background:"var(--navy)",zIndex:201,display:"flex",flexDirection:"column",padding:"28px 20px",overflowY:"auto",animation:"slideInLeft 0.25s ease"}}>
            <button onClick={()=>setOpen(false)} style={{position:"absolute",top:14,right:14,width:32,height:32,borderRadius:8,background:"rgba(255,255,255,0.08)",border:"none",cursor:"pointer",color:"rgba(255,255,255,0.7)",fontSize:20,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
            <Content />
          </aside>
        </>
      )}
      <style>{`
        @keyframes slideInLeft{from{transform:translateX(-100%);opacity:0}to{transform:translateX(0);opacity:1}}
        .sidebar-desktop{display:flex;flex-direction:column;}
        .mobile-topbar{display:none;}
        @media(max-width:768px){
          .sidebar-desktop{display:none!important;}
          .mobile-topbar{display:flex!important;position:fixed;top:0;left:0;right:0;height:56px;background:var(--navy);padding:0 16px;align-items:center;justify-content:space-between;z-index:100;box-shadow:0 2px 12px rgba(0,0,0,0.15);}
          .main-content{margin-left:0!important;padding-top:68px!important;padding-bottom:24px!important;width:100%!important;}
        }
      `}</style>
    </>
  );
}
function HomeIcon({className}){return <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 9.5L10 3l7 6.5V17a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/><path d="M7 18v-6h6v6"/></svg>;}
function UsersIcon({className}){return <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="8" cy="7" r="3"/><path d="M2 17c0-3.3 2.7-6 6-6s6 2.7 6 6"/><path d="M14 5a3 3 0 010 6M18 17c0-2.8-1.8-5.1-4-5.8"/></svg>;}
function AssignIcon({className}){return <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="3" width="14" height="14" rx="2"/><path d="M7 10h6M10 7v6"/></svg>;}
function PriceIcon({className}){return <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M10 3v14M6 6h6a2 2 0 010 4H8a2 2 0 000 4h7"/></svg>;}
function ChartIcon({className}){return <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 15l4-5 4 3 4-7"/></svg>;}
function AIIcon({className}){return <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M5 7c0-1.1.9-2 2-2h6a2 2 0 012 2v3a2 2 0 01-2 2H8l-3 3V7z" strokeLinejoin="round"/></svg>;}