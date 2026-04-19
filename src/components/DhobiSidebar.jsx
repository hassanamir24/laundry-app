export default function DhobiSidebar({ page, onNav, user, onLogout }) {
  const initials = user?.name ? user.name.split(" ").map(n=>n[0]).join("").slice(0,2) : "?";
  const NAV = [
    { section:"Overview", items:[{ id:"dhobi-dashboard", label:"Dashboard",       icon:HomeIcon  }] },
    { section:"Orders",   items:[{ id:"new-orders",      label:"New Orders",      icon:BellIcon  },
                                  { id:"my-orders",       label:"My Orders",       icon:ListIcon  }] },
    { section:"Business", items:[{ id:"my-pricing",      label:"My Pricing",      icon:TagIcon   },
                                  { id:"forecast",        label:"Demand Forecast", icon:ChartIcon }] },
  ];
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-name">DhobiNow</div>
        <div className="brand-tagline">Dhobi Portal</div>
      </div>
      <nav className="sidebar-nav">
        {NAV.map(sec => (
          <div key={sec.section}>
            <div className="nav-section-label">{sec.section}</div>
            {sec.items.map(item => { const Icon=item.icon; return (
              <div key={item.id} className={`nav-item ${page===item.id?"active":""}`} onClick={() => onNav(item.id)}>
                <Icon className="nav-icon" />{item.label}
              </div>
            ); })}
          </div>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="sidebar-user" style={{ marginBottom:10 }}>
          <div className="user-avatar" style={{ background:"var(--teal)" }}>{initials}</div>
          <div><div className="user-name">{user?.name ?? "..."}</div><div className="user-role">Dhobi</div></div>
        </div>
        <button onClick={onLogout} style={{ width:"100%", padding:"7px", borderRadius:"var(--radius-md)", border:"1px solid rgba(255,255,255,0.1)", background:"transparent", color:"rgba(255,255,255,0.4)", fontSize:12, cursor:"pointer", fontFamily:"var(--font-ui)", transition:"all 0.15s" }}
          onMouseEnter={e=>e.target.style.color="rgba(255,255,255,0.8)"} onMouseLeave={e=>e.target.style.color="rgba(255,255,255,0.4)"}>
          Sign out
        </button>
      </div>
    </aside>
  );
}
function HomeIcon({className}) { return <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 9.5L10 3l7 6.5V17a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/><path d="M7 18v-6h6v6"/></svg>; }
function BellIcon({className}) { return <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M10 2a6 6 0 016 6v3l1.5 2.5H2.5L4 11V8a6 6 0 016-6z"/><path d="M8 16a2 2 0 004 0"/></svg>; }
function ListIcon({className}) { return <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="4" width="14" height="13" rx="2"/><path d="M7 8h6M7 11h6M7 14h4"/></svg>; }
function ChartIcon({className}) { return <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 15l4-5 4 3 4-7"/><rect x="2" y="2" width="16" height="16" rx="2"/></svg>; }
function TagIcon({className}) { return <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 3h6l8 8-6 6-8-8V3z"/><circle cx="7" cy="7" r="1" fill="currentColor"/></svg>; }
