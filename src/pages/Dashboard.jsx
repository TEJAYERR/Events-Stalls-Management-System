import { useState, useEffect } from "react";
import { S } from "../styles/styles";
import { api } from "../api/client";
import { formatDate, formatCurrency } from "../utils/format";
import { getEventStatus } from "../utils/eventStatus";

export default function Dashboard({ token, setPage }) {
  const [events, setEvents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    api.getEvents(token).then(setEvents).catch(() => {});
    api.getBookings("CONFIRMED", "", token).then(setBookings).catch(() => {});
  }, [token]);

  const totalStalls = events.reduce((a, e) => a + (e.stalls?.length || 0), 0);
  const totalRevenue = bookings.reduce((a, b) => a + Number(b.amount || 0), 0);

  const statCards = [
    { label: "Total Events", value: events.length, icon: "📅", iconBg: "#e8f0fe" },
    { label: "Total Stalls", value: totalStalls, icon: "🏪", iconBg: "#f3e8ff" },
    { label: "Confirmed Bookings", value: bookings.length, icon: "📋", iconBg: "#e8f5e9" },
    { label: "Total Revenue", value: formatCurrency(totalRevenue), icon: "₹", iconBg: "#fff8e1" },
  ];

  const isPhone = screenWidth < 768;
  const isTablet = screenWidth >= 768 && screenWidth < 1024;
  const isDesktop = screenWidth >= 1024;

  // ─── DYNAMIC RESPONSIVE BREAKPOINT OVERRIDES ───
  const responsiveStatGrid = {
    ...S.statGrid,
    // 1 column on phone, 2 columns on tablet or full desktop layouts
    gridTemplateColumns: isPhone ? "1fr" : "1fr 1fr",
    gap: isPhone ? "12px" : S.statGrid?.gap || 20,
  };

  const responsiveSplitSection = {
    display: "grid",
    // 1 column for phones/tablets, 2 columns side-by-side on large desktop monitors
    gridTemplateColumns: isDesktop ? "1fr 1fr" : "1fr",
    gap: isPhone ? "16px" : "20px",
  };

  return (
    <div style={{ width: "100%", boxSizing: "border-box" }}>
      <div style={{ ...S.pageTitle, fontSize: isPhone ? "22px" : S.pageTitle?.fontSize || "28px" }}>Dashboard</div>
      
      {/* 1. METRICS STATISTICS GRID CONTAINER */}
      <div style={responsiveStatGrid}>
        {statCards.map((s) => (
          <div key={s.label} style={{ ...S.statCard, padding: isPhone ? "16px" : S.statCard?.padding || 24 }}>
            <div>
              <div style={S.statLabel}>{s.label}</div>
              <div style={{ ...S.statValue, fontSize: isPhone ? "22px" : isTablet ? "26px" : S.statValue?.fontSize || "32px" }}>
                {s.value}
              </div>
            </div>
            <div style={{ ...S.statIcon, background: s.iconBg, width: isPhone ? "38px" : "44px", height: isPhone ? "38px" : "44px", fontSize: isPhone ? "16px" : "20px" }}>{s.icon}</div>
          </div>
        ))}
      </div>

      {/* 2. SUMMARY DATA BREAKOUT LIST PANELS */}
      <div style={responsiveSplitSection}>
        {/* Active Events Box */}
        <div style={{ ...S.card, padding: isPhone ? "16px" : S.card?.padding || 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>📈 Active Events</div>
            <span style={{ ...S.btn("ghost"), fontSize: 12, padding: "4px 0", cursor: "pointer" }} onClick={() => setPage("events")}>
              View all
            </span>
          </div>
          {events
            .filter((e) => ["active", "upcoming"].includes(getEventStatus(e)))
            .slice(0, 4)
            .map((e) => {
              const booked = e.stalls?.filter((s) => s.stallStatus === "BOOKED").length || 0;
              const total = e.stalls?.length || 0;
              const pct = total ? Math.round((booked / total) * 100) : 0;
              const status = getEventStatus(e);
              return (
                <div key={e.id} style={{ padding: "12px 0", borderBottom: "1px solid #f5f5f5", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.name}</div>
                    <div style={{ fontSize: 12, color: "#888" }}>{formatDate(e.startDate)}</div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <span style={{ ...S.badge(status === "active" ? "purple" : ""), fontSize: 10 }}>{status}</span>
                    <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>
                      {booked}/{total} booked ({pct}%)
                    </div>
                  </div>
                </div>
              );
            })}
          {events.length === 0 && <div style={{ color: "#888", fontSize: 13 }}>No events yet</div>}
        </div>

        {/* Recent Bookings Box */}
        <div style={{ ...S.card, padding: isPhone ? "16px" : S.card?.padding || 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>🕐 Recent Bookings</div>
            <span style={{ ...S.btn("ghost"), fontSize: 12, padding: "4px 0", cursor: "pointer" }} onClick={() => setPage("bookings")}>
              View all
            </span>
          </div>
          {([...bookings].sort((a, c) => {
            const at = a?.createdAt ? new Date(a.createdAt).getTime() : null;
            const bt = c?.createdAt ? new Date(c.createdAt).getTime() : null;
            if (at == null && bt == null) return 0;
            if (at == null) return 1;
            if (bt == null) return -1;
            return bt - at;
          })).slice(0, 5).map((b) => (
            <div key={b.bookingId} style={{ padding: "12px 0", borderBottom: "1px solid #f5f5f5", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.vendorName}</div>
                <div style={{ fontSize: 12, color: "#888", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  Stall {b.stallNumber} · {b.eventName}
                </div>
                <div style={{ fontSize: 12, color: "#888" }}>{b.category}</div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{formatCurrency(b.amount)}</div>
                <span style={{ ...S.badge("green"), fontSize: 10, marginTop: 4, display: "inline-block" }}>confirmed</span>
              </div>
            </div>
          ))}
          {bookings.length === 0 && <div style={{ color: "#888", fontSize: 13 }}>No bookings yet</div>}
        </div>
      </div>
    </div>
  );
}
