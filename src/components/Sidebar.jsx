import { DEMO_MODE } from "../api/config";

const NAV = [
  {
    section: "Overview",
    items: [
      { id: "dashboard", label: "Dashboard",   icon: HomeIcon },
      { id: "track",     label: "Track Order", icon: TrackIcon },
    ],
  },
  {
    section: "Orders",
    items: [
      { id: "place",   label: "Place Order",   icon: PlusIcon },
      { id: "history", label: "Order History", icon: ListIcon },
    ],
  },
  {
    section: "Assistant",
    items: [
      { id: "ai-assistant", label: "AI Assistant", icon: AIIcon },
    ],
  },
];

export default function Sidebar({ page, onNav, user, onLogout }) {
  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2)
    : "?";

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-name">DhobiNow</div>
        <div className="brand-tagline">Laundry Management</div>
        {DEMO_MODE && (
          <div style={{ marginTop:8, fontSize:10, background:"rgba(232,160,32,0.2)", color:"#E8A020", padding:"3px 8px", borderRadius:999, display:"inline-block", letterSpacing:"0.06em" }}>
            DEMO MODE
          </div>
        )}
      </div>

      <nav className="sidebar-nav">
        {NAV.map((section) => (
          <div key={section.section}>
            <div className="nav-section-label">{section.section}</div>
            {section.items.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className={`nav-item ${page === item.id ? "active" : ""}`}
                  onClick={() => onNav(item.id)}
                >
                  <Icon className="nav-icon" />
                  {item.label}
                </div>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user" style={{ marginBottom:10 }}>
          <div className="user-avatar">{initials}</div>
          <div>
            <div className="user-name">{user?.name ?? "Loading..."}</div>
            <div className="user-role">Customer</div>
          </div>
        </div>
        <button
          onClick={onLogout}
          style={{
            width:"100%", padding:"10px", borderRadius:12,
            border:"1px solid rgba(255,255,255,0.08)", background:"transparent",
            color:"rgba(255,255,255,0.4)", fontSize:11, cursor:"pointer",
            fontFamily:"var(--font-ui)", fontWeight:700, letterSpacing:"0.1em",
            textTransform:"uppercase", transition:"all 0.15s",
            display:"flex", alignItems:"center", justifyContent:"center", gap:6,
          }}
          onMouseEnter={e => { e.currentTarget.style.color="#fff"; e.currentTarget.style.background="rgba(255,255,255,0.06)"; }}
          onMouseLeave={e => { e.currentTarget.style.color="rgba(255,255,255,0.4)"; e.currentTarget.style.background="transparent"; }}
        >
          ↩ Sign out
        </button>
      </div>
    </aside>
  );
}

function HomeIcon({ className }) {
  return <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 9.5L10 3l7 6.5V17a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/><path d="M7 18v-6h6v6"/></svg>;
}
function TrackIcon({ className }) {
  return <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="10" cy="10" r="7"/><path d="M10 6v4l3 2"/></svg>;
}
function PlusIcon({ className }) {
  return <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="10" cy="10" r="7"/><path d="M10 7v6M7 10h6"/></svg>;
}
function ListIcon({ className }) {
  return <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="4" width="14" height="13" rx="2"/><path d="M7 8h6M7 11h6M7 14h4"/></svg>;
}
function AIIcon({ className }) {
  return <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M5 7c0-1.1.9-2 2-2h6a2 2 0 012 2v3a2 2 0 01-2 2H8l-3 3V7z" strokeLinejoin="round"/></svg>;
}