import { useState, useEffect } from "react";
import { S } from "../styles/styles";

export default function Sidebar({ page, setPage, onLogout }) {
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  // Synchronize layout engines with window viewport boundaries
  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isPhone = screenWidth < 768;
  const isDesktop = screenWidth >= 1024;

  const nav = [
    { id: "dashboard", icon: "▦", label: "Dashboard" },
    { id: "events", icon: "📅", label: "Events" },
    { id: "bookings", icon: "📋", label: "Bookings" },
  ];

  // ─── DYNAMIC RESPONSIVE SIDEBAR RULES ───
  // Automatically neutralizes fixed values during full-screen phone menu toggles
  const responsiveSidebarStyle = {
    ...S.sidebar,
    position: isPhone ? "static" : S.sidebar?.position || "fixed",
    width: isPhone ? "100%" : S.sidebar?.width || 260,
    height: isPhone ? "100%" : S.sidebar?.height || "100vh",
    flex: isPhone ? "1" : S.sidebar?.flex || "0 0 260px",
    padding: isPhone ? "16px 0" : S.sidebar?.padding || "24px 0",
  };

  return (
    <div style={responsiveSidebarStyle}>
      {/* 1. BRANDING HEADER (Only shows on Desktop layout) */}
      {isDesktop && (
        <div style={S.sidebarLogo}>
          <div style={S.logoIcon}>🏪</div>
          <div>
            <div style={S.logoText}>StallManager</div>
            <div style={S.logoSub}>Admin Panel</div>
          </div>
        </div>
      )}

      {/* 2. NAVIGATION ITEM LINKS */}
      <nav style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        {nav.map((n) => (
          <div 
            key={n.id} 
            style={S.navItem(page === n.id)} 
            onClick={() => setPage(n.id)}
          >
            <span style={{ marginRight: "4px" }}>{n.icon}</span> {n.label}
          </div>
        ))}
      </nav>

      {/* 3. LOGOUT CALL TO ACTION BUTTON CONTAINER */}
      <div
        style={{ 
          ...S.logout, 
          marginTop: "auto", 
          paddingBottom: isPhone ? "24px" : S.logout?.paddingBottom 
        }}
        onClick={() => {
          const ok = window.confirm("Are you sure you want to logout?");
          if (ok) onLogout();
        }}
      >
        <span style={{ marginRight: "4px" }}>↪</span> Logout
      </div>
    </div>
  );
}
