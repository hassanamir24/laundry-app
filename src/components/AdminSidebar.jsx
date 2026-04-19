export default function AdminSidebar({ page, onNav, user, onLogout }) {
  const initials = user?.name ? user.name.split(" ").map(n=>n[0]).join("").slice(0,2) : "A";
  const NAV = [
    { section:"Overview",    items:[{ id:"admin-dashboard", label:"Dashboard"  }] },
    { section:"Management",  items:[{ id:"admin-users",     label:"Users"      },
                                     { id:"admin-assign",    label:"Assignments"},
                                     { id:"admin-pricing",   label:"Pricing"    }] },
    { section:"Analytics",   items:[{ id:"admin-revenue",   label:"Revenue"    }] },
  ];
  return (
    <aside className="sidebar">
      <div className="sidebar-brand"><div className="brand-name">DhobiNow</div><div className="brand-tagline">Admin Panel</div></div>
      <nav className="sidebar-nav">
        {NAV.map(sec => (
          <div key={sec.section}>
            <div className="nav-section-label">{sec.section}</div>
            {sec.items.map(item => (
              <div key={item.id} className={`nav-item ${page===item.id?"active":""}`} onClick={() => onNav(item.id)}>
                <span style={{width:18,height:18,display:"inline-block"}}/>
                {item.label}
              </div>
            ))}
          </div>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="sidebar-user" style={{marginBottom:10}}>
          <div className="user-avatar" style={{background:"var(--blue)"}}>{initials}</div>
          <div><div className="user-name">{user?.name}</div><div className="user-role">Admin</div></div>
        </div>
        <button onClick={onLogout} style={{width:"100%",padding:"7px",borderRadius:"var(--radius-md)",border:"1px solid rgba(255,255,255,0.1)",background:"transparent",color:"rgba(255,255,255,0.4)",fontSize:12,cursor:"pointer",fontFamily:"var(--font-ui)"}}>Sign out</button>
      </div>
    </aside>
  );
}
