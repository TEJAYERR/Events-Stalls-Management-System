import { useState, useEffect } from "react";
import { S } from "./styles/styles";
import { getRoute } from "./router";
import Toast from "./components/Toast";
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Events from "./pages/Events";
import Bookings from "./pages/Bookings";
import PublicEventPage from "./pages/PublicEventPage";

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem("jwt"));
  const [page, setPage] = useState("dashboard");
  const [toast, setToast] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  const route = getRoute(page); 

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setScreenWidth(width);
      if (width >= 768) setIsMenuOpen(false);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isPhone = screenWidth < 768;
  const isTablet = screenWidth >= 768 && screenWidth < 1024;
  const isDesktop = screenWidth >= 1024;

  const showToast = (msg, type = "success") => setToast({ msg, type });
  const handleLogout = () => {
    localStorage.removeItem("jwt");
    localStorage.removeItem("admin");
    setToken(null);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    setIsMenuOpen(false);
  };

  // Public route
  if (route?.type === "public") return <PublicEventPage eventId={route.eventId} />;

  // Admin — login
  if (!token) return <Login onLogin={setToken} />;

  const navItems = [
    { id: "dashboard", icon: "▦", label: "Dashboard" },
    { id: "events", icon: "📅", label: "Events" },
    { id: "bookings", icon: "📋", label: "Bookings" },
  ];

  // ─── DYNAMIC RESPONSIVE STYLE GENERATORS ───
  const responsiveAppStyle = {
    ...S.app,
    fontFamily: S.globalFont?.fontFamily,
    flexDirection: isDesktop ? "row" : "column",
    paddingTop: !isDesktop ? "61px" : 0, 
  };

  const responsiveSidebarStyle = {
    ...S.sidebar,
    position: "fixed",
    top: isPhone ? "61px" : 0,
    width: isPhone ? "100%" : S.sidebar?.width || 260,
    flex: isPhone ? "none" : S.sidebar?.flex || "0 0 260px",
    height: isPhone ? "calc(100vh - 61px)" : "100vh",
    display: isDesktop ? "flex" : (isPhone && isMenuOpen) ? "flex" : "none",
    zIndex: 150,
  };

  const responsiveMainStyle = {
    ...S.main,
    marginLeft: isDesktop ? S.main?.marginLeft || 260 : 0,
    padding: !isDesktop ? "20px" : S.main?.padding || "32px 36px",
  };

  return (
    <div style={responsiveAppStyle}>
      
      {/* HEADER PANELS (PHONES & TABLETS) */}
      {!isDesktop && (
        <header style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          padding: "0 20px",
          background: "#0f0f1a",
          borderBottom: "1px solid #1a1a2e",
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: "61px",
          zIndex: 200,
          boxSizing: "border-box"
        }}>
          {/* Brand/Logo block */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "32px", height: "32px", background: "#6C5CE7", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "14px", color: "#fff" }}>🏪</div>
            {(!isTablet) && <span style={{ fontWeight: "bold", fontSize: "14px", color: "#fff" }}>StallManager</span>}
          </div>

          {/* TABLET HORIZONTAL NAVBAR (768px - 1023px) */}
          {isTablet && (
            <nav style={{ display: "flex", height: "100%", alignItems: "center" }}>
              {navItems.map((n) => {
                const active = page === n.id;
                return (
                  <div
                    key={n.id}
                    onClick={() => handlePageChange(n.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "0 20px",
                      height: "100%",
                      cursor: "pointer",
                      color: active ? "#fff" : "#888",
                      background: active ? "#1a1a2e" : "transparent",
                      fontWeight: active ? 600 : 400,
                      fontSize: 14,
                      borderBottom: active ? "3px solid #6C5CE7" : "3px solid transparent",
                      boxSizing: "border-box",
                      transition: "all 0.2s ease"
                    }}
                  >
                    <span>{n.icon}</span> {n.label}
                  </div>
                );
              })}
              <div
                onClick={() => { if (window.confirm("Are you sure?")) handleLogout(); }}
                style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 20px", cursor: "pointer", color: "#888", fontSize: 14 }}
              >
                <span>↪</span> Logout
              </div>
            </nav>
          )}

          {/* PHONE HAMBURGER CONTROLS (< 768px) */}
          {isPhone && (
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", padding: "4px" }}
              aria-label="Toggle Navigation"
            >
              {isMenuOpen ? (
                <svg style={{ width: "24px", height: "24px" }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
              ) : (
                <svg style={{ width: "24px", height: "24px" }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
              )}
            </button>
          )}
        </header>
      )}

      {/* SIDEBAR COMPONENT */}
      {!isTablet && (
        <aside style={responsiveSidebarStyle}>
          <Sidebar page={page} setPage={handlePageChange} onLogout={handleLogout} />
        </aside>
      )}

      {/* MAIN DASHBOARD CONTENT SHELLS */}
      <main style={responsiveMainStyle}>
        {page === "dashboard" && <Dashboard token={token} setPage={setPage} />}
        {page === "events" && <Events token={token} showToast={showToast} />}
        {page === "bookings" && <Bookings token={token} showToast={showToast} />}
      </main>

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
