import { useState, useEffect, useCallback } from "react";
import { S } from "../styles/styles";
import { api } from "../api/client";
import { formatDate, formatCurrency } from "../utils/format";
import { getEventStatus } from "../utils/eventStatus";
import StallModal from "../components/StallModal";
import EventFormModal from "../components/EventFormModal";

export default function EventDetail({ eventId, token, onBack, showToast }) {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stallModal, setStallModal] = useState(null); 
  const [editEvent, setEditEvent] = useState(false);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    api.getEvent(eventId, token).then((e) => { setEvent(e); setLoading(false); }).catch(() => setLoading(false));
  }, [eventId, token]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div style={{ color: "#888", padding: 40 }}>Loading...</div>;
  if (!event) return <div style={{ color: "#888", padding: 40 }}>Event not found</div>;

  const booked = event.stalls?.filter((s) => s.stallStatus === "BOOKED").length || 0;
  const total = event.stalls?.length || 0;
  const available = total - booked;
  const revenue = event.stalls?.filter((s) => s.stallStatus === "BOOKED").reduce((a, s) => a + Number(s.price || 0), 0) || 0;
  const status = getEventStatus(event);
  const publicUrl = `${window.location.origin}/event/${event.id}`;

  const isPhone = screenWidth < 768;
  const isTablet = screenWidth >= 768 && screenWidth < 1024;
  const isUnder600 = screenWidth < 600; // 💡 New specific breakpoint tag to catch early mobile squishing

  // ─── DYNAMIC RESPONSIVE BREAKPOINT OVERRIDES ───
  const responsiveOverviewSplit = {
    display: "grid",
    gridTemplateColumns: (isPhone || isTablet) ? "1fr" : "1fr 280px", 
    gap: 20,
    marginBottom: 20
  };

  const responsiveMetricsRow = {
    display: "grid",
    gridTemplateColumns: isPhone ? "1fr 1fr" : isTablet ? "1fr 1fr 1fr 1fr" : "1fr",
    gap: 12
  };

  // 💡 FIXED: Stacks vertically below 600px so elements don't pop out
  const responsiveMetaRow = {
    display: "flex", 
    gap: isUnder600 ? 8 : 20, 
    flexDirection: isUnder600 ? "column" : "row", 
    fontSize: 13, 
    color: "#666", 
    marginBottom: 16
  };

  // 💡 FIXED: Completely structural layout reflow below 600px with explicit block limits
  const responsiveInfoBar = {
    background: "#f8f9fa",
    borderRadius: 8,
    padding: "10px 14px",
    display: "flex",
    alignItems: isUnder600 ? "stretch" : "center",
    flexDirection: isUnder600 ? "column" : "row",
    gap: 8,
    fontSize: 13,
    width: "100%",
    boxSizing: "border-box",
    overflow: "hidden" // Prevents container from widening past its parent card box
  };

  const responsiveStallGrid = {
    ...S.stallGrid,
    gridTemplateColumns: isPhone 
      ? "repeat(auto-fill, minmax(135px, 1fr))" 
      : S.stallGrid?.gridTemplateColumns || "repeat(auto-fill, minmax(160px, 1fr))",
    gap: isPhone ? "8px" : S.stallGrid?.gap || 12
  };

  return (
    <div style={{ width: "100%", boxSizing: "border-box" }}>
      <div style={S.pageBreadcrumb}>Events &rsaquo; {event.name}</div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, gap: "12px" }}>
        <div style={{ ...S.pageTitle, marginBottom: 0, fontSize: isPhone ? "20px" : S.pageTitle?.fontSize || "28px" }}>
          {event.name}
        </div>
        <button style={S.btn("secondary")} onClick={onBack}>← Back</button>
      </div>

      <div style={responsiveOverviewSplit}>
        <div style={{ ...S.card, padding: isPhone ? "16px" : S.card?.padding || 24, overflow: "hidden" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <span style={S.badge(status === "active" ? "purple" : "")}>{status}</span>
            <button style={S.btnSm("secondary")} onClick={() => window.open(`/event/${event.id}`, "_blank")}>↗ Preview</button>
          </div>
          
          {event.description && (
            <p style={{ fontSize: 14, color: "#555", marginBottom: 12, lineHeight: 1.6, wordBreak: "break-word" }}>
              {event.description}
            </p>
          )}

          {/* 💡 UPDATED DESCRIPTION METADATA ROW */}
          <div style={responsiveMetaRow}>
            <span>📅 {formatDate(event.startDate)}</span>
            <span>📍 {event.venue}</span>
          </div>
          
          {/* 💡 UPDATED LINK ADAPTIVE ENGINE */}
          <div style={responsiveInfoBar}>
            <span style={{ color: "#6C5CE7", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" }}>Booking Link:</span>
            <span style={{ 
              color: "#555", 
              flex: 1, 
              overflow: "hidden", 
              textOverflow: "ellipsis", 
              whiteSpace: "nowrap",
              display: "block",
              width: "100%",
              boxSizing: "border-box"
            }}>
              {publicUrl}
            </span>
            <button 
              style={{ 
                background: "none", 
                border: "none", 
                cursor: "pointer", 
                fontSize: 16, 
                alignSelf: isUnder600 ? "flex-end" : "center", 
                padding: "6px",
                marginTop: isUnder600 ? 4 : 0
              }} 
              onClick={() => { navigator.clipboard.writeText(publicUrl); showToast("Link copied!"); }}
            >
              📋
            </button>
          </div>
          <button style={{ ...S.btnSm(), marginTop: 16 }} onClick={() => setEditEvent(true)}>✏️ Edit Event</button>
        </div>

        <div style={responsiveMetricsRow}>
          {[["Total Stalls", total, "#333"], ["Booked", booked, "#e74c3c"], ["Available", available, "#2ecc71"], ["Revenue", formatCurrency(revenue), "#6C5CE7"]].map(([l, v, c]) => (
            <div key={l} style={{ ...S.card, padding: isPhone ? "12px 14px" : "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12, color: "#888" }}>{l}</span>
              <span style={{ fontWeight: 700, fontSize: isPhone ? "14px" : "16px", color: c }}>{v}</span>
            </div>
          ))}
        </div>
      </div>

      <img src={api.getBlueprintUrl(event.id)} alt="Blueprint" style={{ width: "100%", maxHeight: isPhone ? 220 : 400, objectFit: "cover", borderRadius: 12, marginBottom: 20 }} onError={(e) => { e.target.style.display = "none"; }} />

      <div style={{ ...S.card, padding: isPhone ? "16px" : S.card?.padding || 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, gap: "10px" }}>
          <div style={{ fontWeight: 700, fontSize: 16 }}>Stalls Management</div>
          <button style={S.btn()} onClick={() => setStallModal("new")}>+ Add Stall</button>
        </div>
        
        <div style={responsiveStallGrid}>
          {(
            event.stalls
              ?.slice()
              .sort((a, b) => {
                const getIndex = (sn) => {
                  if (!sn) return Number.POSITIVE_INFINITY;
                  const m = String(sn).match(/A\s*-?\s*(\d+)/i);
                  if (!m) return Number.POSITIVE_INFINITY;
                  return Number(m[1]);
                };
                const ai = getIndex(a?.stallNumber);
                const bi = getIndex(b?.stallNumber);
                if (ai !== bi) return ai - bi;
                return String(a?.stallNumber || "").localeCompare(String(b?.stallNumber || ""));
              })
              .map((stall) => (
                <div key={stall.id} style={{ ...S.stallCard(stall.stallType, stall.stallStatus), padding: isPhone ? "10px" : S.stallCard?.padding || "14px" }} onClick={() => setStallModal(stall)}>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{stall.stallNumber}</div>
                  <div style={{ fontSize: 12, color: stall.stallType === "PREMIUM" ? "#f39c12" : "#3498db", marginBottom: 6 }}>{stall.stallType?.toLowerCase()}</div>
                  <div style={{ fontSize: isPhone ? "12px" : "13px", fontWeight: 600, marginBottom: 6 }}>{formatCurrency(stall.price)}</div>
                  <span style={S.badge(stall.stallStatus === "BOOKED" ? "red" : "green")}>{stall.stallStatus === "BOOKED" ? "Booked" : "Free"}</span>
                  {stall.vendorName && <div style={{ fontSize: 11, color: "#888", marginTop: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{stall.vendorName}</div>}
                </div>
              ))
          )}
        </div>
      </div>

      {stallModal && (
        <StallModal
          stall={stallModal === "new" ? null : stallModal}
          eventId={event.id}
          token={token}
          onClose={() => setStallModal(null)}
          onSaved={() => { setStallModal(null); load(); }}
          showToast={showToast}
        />
      )}
      {editEvent && (
        <EventFormModal
          token={token}
          event={event}
          onClose={() => setEditEvent(false)}
          onSaved={() => { setEditEvent(false); load(); }}
          showToast={showToast}
        />
      )}
    </div>
  );
}
