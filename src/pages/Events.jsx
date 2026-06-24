import { useState, useEffect } from "react";
import { S } from "../styles/styles";
import { api } from "../api/client";
import { formatDate, formatCurrency } from "../utils/format";
import { getEventStatus } from "../utils/eventStatus";
import EventFormModal from "../components/EventFormModal";
import EventDetail from "./EventDetail";

export default function Events({ token, showToast }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createModal, setCreateModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const load = () => {
    setLoading(true);
    api.getEvents(token).then((e) => { setEvents(e); setLoading(false); }).catch(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const deleteEvent = async (id, e) => {
    e.stopPropagation();
    if (!confirm("Delete this event and all its stalls?")) return;
    try {
      await api.deleteEvent(id, token);
      showToast("Event deleted!");
      load();
    } catch {
      showToast("Failed to delete", "error");
    }
  };

  if (selectedId) {
    return (
      <EventDetail
        eventId={selectedId}
        token={token}
        onBack={() => { setSelectedId(null); load(); }}
        showToast={showToast}
      />
    );
  }

  const isPhone = screenWidth < 768;
  const isTablet = screenWidth >= 768 && screenWidth < 1024;

  return (
    <div style={{ width: "100%", boxSizing: "border-box" }}>
      <div style={S.pageBreadcrumb}>Events</div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, gap: "12px" }}>
        <div style={{ ...S.pageTitle, marginBottom: 0, fontSize: isPhone ? "22px" : S.pageTitle?.fontSize || "28px" }}>Events</div>
        <button style={S.btn()} onClick={() => setCreateModal(true)}>+ Create Event</button>
      </div>
      <div style={{ fontSize: 13, color: "#888", marginBottom: 16 }}>{events.length} events total</div>

      {loading ? (
        <div style={{ color: "#888" }}>Loading...</div>
      ) : (
        events.map((event) => {
          const booked = event.stalls?.filter((s) => s.stallStatus === "BOOKED").length || 0;
          const total = event.stalls?.length || 0;
          const available = total - booked;
          const pct = total ? Math.round((booked / total) * 100) : 0;
          const revenue = event.stalls?.filter((s) => s.stallStatus === "BOOKED").reduce((a, s) => a + Number(s.price || 0), 0) || 0;
          const premium = event.stalls?.filter((s) => s.stallType === "PREMIUM").length || 0;
          const status = getEventStatus(event);

          // ─── DYNAMIC RESPONSIVE BREAKPOINT OVERRIDES ───
          const responsiveCardStyle = {
            ...S.eventCard,
            flexDirection: isPhone ? "column" : "row"
          };

          const responsiveImgStyle = {
            ...S.eventImg,
            width: isPhone ? "100%" : S.eventImg?.width || 180,
            height: isPhone ? "160px" : "auto",
            minHeight: isPhone ? "auto" : S.eventImg?.minHeight || 140
          };

          const responsiveMetaRow = {
            display: "flex",
            flexDirection: isPhone ? "column" : "row",
            gap: isPhone ? "6px" : isTablet ? "12px" : "20px",
            fontSize: 13,
            color: "#666",
            marginBottom: 12
          };

          const responsiveStatsWrapper = {
            display: "flex",
            flexDirection: (isPhone || isTablet) ? "column" : "row",
            alignItems: (isPhone || isTablet) ? "flex-start" : "center",
            gap: isPhone ? "12px" : isTablet ? "14px" : "20px",
            width: "100%"
          };

          const responsiveActionButtonsGroup = {
            marginLeft: (isPhone || isTablet) ? "0" : "auto",
            marginTop: (isPhone || isTablet) ? "4px" : "0",
            display: "flex",
            gap: 8,
            width: isPhone ? "100%" : "auto",
            justifyContent: isPhone ? "space-between" : "flex-start"
          };

          return (
            <div key={event.id} style={responsiveCardStyle}>
              <img
                src={api.getBlueprintUrl(event.id)}
                alt={event.name}
                style={responsiveImgStyle}
                onError={(e) => { e.target.src = ""; e.target.style.background = "#f0f0f0"; }}
              />
              <div style={{ ...S.eventBody, padding: isPhone ? "16px" : S.eventBody?.padding || "20px 24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <div style={{ fontWeight: 700, fontSize: isPhone ? "16px" : "18px" }}>{event.name}</div>
                  <span style={{ ...S.badge(status === "active" ? "purple" : ""), fontSize: 10 }}>{status}</span>
                </div>
                {event.description && (
                  <p style={{ fontSize: 13, color: "#666", marginBottom: 10, lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {event.description}
                  </p>
                )}
                
                {/* Dynamic Metadata Row (Date/Venue/Stalls) */}
                <div style={responsiveMetaRow}>
                  <span>📅 {formatDate(event.startDate)}</span>
                  <span>📍 {event.venue}</span>
                  <span>🏪 {total} stalls {premium > 0 ? `(${premium} premium)` : ""}</span>
                </div>

                {/* Booking Metrics Progress Bar and Administrative Actions */}
                <div style={responsiveStatsWrapper}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: isPhone ? "10px" : "16px", fontSize: 13 }}>
                    <span style={{ color: "#e74c3c", fontWeight: 600 }}>{booked} booked</span>
                    <span style={{ color: "#2ecc71", fontWeight: 600 }}>{available} available</span>
                    <span style={{ fontWeight: 700 }}>{formatCurrency(revenue)} earned</span>
                  </div>
                  
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", width: (isPhone || isTablet) ? "100%" : "auto", flex: (isPhone || isTablet) ? "none" : 1 }}>
                    <div style={{ flex: 1, height: 6, background: "#f0f0f0", borderRadius: 3, maxWidth: (isPhone || isTablet) ? "100%" : 120 }}>
                      <div style={{ width: `${pct}%`, height: "100%", background: "#6C5CE7", borderRadius: 3 }} />
                    </div>
                    <span style={{ fontSize: 12, color: "#888", whiteSpace: "nowrap" }}>{pct}% filled</span>
                  </div>

                  <div style={responsiveActionButtonsGroup}>
                    <button style={{ ...S.btnSm("secondary"), flex: isPhone ? 1 : "none", justifyCenter: "center" }} onClick={() => window.open(`/event/${event.id}`, "_blank")}>↗ Preview</button>
                    <button style={{ ...S.btnSm(), flex: isPhone ? 1 : "none", justifyCenter: "center" }} onClick={() => setSelectedId(event.id)}>✏️ Manage</button>
                    <button style={{ ...S.btnSm("danger"), flex: isPhone ? "none" : "none" }} onClick={(e) => deleteEvent(event.id, e)}>🗑️</button>
                  </div>
                </div>
              </div>
            </div>
          );
        })
      )}

      {!loading && events.length === 0 && (
        <div style={{ ...S.card, textAlign: "center", padding: isPhone ? "40px 20px" : 60, color: "#888" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📅</div>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>No events yet</div>
          <button style={S.btn()} onClick={() => setCreateModal(true)}>Create your first event</button>
        </div>
      )}

      {createModal && (
        <EventFormModal token={token} onClose={() => setCreateModal(false)} onSaved={() => { setCreateModal(false); load(); }} showToast={showToast} />
      )}
    </div>
  );
}
