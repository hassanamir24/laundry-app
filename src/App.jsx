import { useState, useEffect } from "react";
import "./index.css";

import Sidebar            from "./components/Sidebar";
import DhobiSidebar       from "./components/DhobiSidebar";
import AdminSidebar        from "./components/AdminSidebar";

import LoginPage          from "./pages/LoginPage";
import DashboardPage      from "./pages/DashboardPage";
import PlaceOrderPage     from "./pages/PlaceOrderPage";
import TrackOrderPage     from "./pages/TrackOrderPage";
import HistoryPage        from "./pages/HistoryPage";

import DhobiDashboardPage from "./pages/dhobi/DhobiDashboardPage";
import NewOrdersPage      from "./pages/dhobi/NewOrdersPage";
import MyOrdersPage       from "./pages/dhobi/MyOrdersPage";
import ForecastPage       from "./pages/dhobi/ForecastPage";
import DhobiPricingPage   from "./pages/dhobi/DhobiPricingPage";

import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import UsersPage          from "./pages/admin/UsersPage";
import AssignmentsPage    from "./pages/admin/AssignmentsPage";
import PricingPage        from "./pages/admin/PricingPage";
import RevenuePage        from "./pages/admin/RevenuePage";

import {
  fetchUnassignedOrders, fetchDhobiOrders,
  acceptOrder, updateOrderStatus, fetchDemandForecast,
} from "./api/api";

export default function App() {
  const [user, setUser]                 = useState(null);
  const [page, setPage]                 = useState("dashboard");
  const [trackOrderId, setTrackOrderId] = useState(null);
  const [toast, setToast]               = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("laundry_user");
    if (saved) { try { setUser(JSON.parse(saved)); } catch {} }
  }, []);

  function handleLogin(u) {
    setUser(u);
    localStorage.setItem("laundry_user", JSON.stringify(u));
    if (u.role === "dhobi")  setPage("dhobi-dashboard");
    else if (u.role === "admin") setPage("admin-dashboard");
    else setPage("dashboard");
  }

  function handleLogout() {
    setUser(null);
    localStorage.removeItem("laundry_user");
    setPage("dashboard");
  }

  function showToast(msg, type="success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  function goTrack(id) { setTrackOrderId(id); setPage("track"); }
  function goNav(p)    { setPage(p); if (p!=="track") setTrackOrderId(null); }

  if (!user) return <LoginPage onLogin={handleLogin} />;

  // ── DHOBI ────────────────────────────────────────────────────
  if (user.role === "dhobi") {
    return (
      <div className="app-shell">
        <DhobiSidebar page={page} onNav={goNav} user={user} onLogout={handleLogout} />
        <main className="main-content">
          {page==="dhobi-dashboard" && <DhobiDashboardPage user={user} onNav={goNav} fetchDhobiOrders={fetchDhobiOrders} fetchUnassignedOrders={fetchUnassignedOrders} />}
          {page==="new-orders"      && <NewOrdersPage user={user} fetchUnassignedOrders={fetchUnassignedOrders} acceptOrder={acceptOrder} onShowToast={showToast} />}
          {page==="my-orders"       && <MyOrdersPage  user={user} fetchDhobiOrders={fetchDhobiOrders} updateOrderStatus={updateOrderStatus} onShowToast={showToast} />}
          {page==="my-pricing"      && <DhobiPricingPage user={user} onShowToast={showToast} />}
          {page==="forecast"        && <ForecastPage fetchDemandForecast={fetchDemandForecast} />}
        </main>
        {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
      </div>
    );
  }

  // ── ADMIN ────────────────────────────────────────────────────
  if (user.role === "admin") {
    return (
      <div className="app-shell">
        <AdminSidebar page={page} onNav={goNav} user={user} onLogout={handleLogout} />
        <main className="main-content">
          {page==="admin-dashboard" && <AdminDashboardPage onNav={goNav} />}
          {page==="admin-users"     && <UsersPage onShowToast={showToast} />}
          {page==="admin-assign"    && <AssignmentsPage onShowToast={showToast} />}
          {page==="admin-pricing"   && <PricingPage onShowToast={showToast} />}
          {page==="admin-revenue"   && <RevenuePage />}
        </main>
        {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
      </div>
    );
  }

  // ── CUSTOMER ─────────────────────────────────────────────────
  return (
    <div className="app-shell">
      <Sidebar page={page} onNav={goNav} user={user} onLogout={handleLogout} />
      <main className="main-content">
        {page==="dashboard" && <DashboardPage user={user} onNav={goNav} onTrackOrder={goTrack} />}
        {page==="place"     && <PlaceOrderPage user={user} onSuccess={() => setPage("dashboard")} onShowToast={showToast} />}
        {page==="track"     && <TrackOrderPage user={user} selectedOrderId={trackOrderId} onClearSelected={() => setTrackOrderId(null)} />}
        {page==="history"   && <HistoryPage user={user} onTrackOrder={goTrack} />}
      </main>
      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
    </div>
  );
}
