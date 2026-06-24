import { useState, useEffect, useCallback } from "react";
import { S } from "../styles/styles";
import { api } from "../api/client";
import { formatCurrency } from "../utils/format";
import EditBookingForm from "../components/EditBookingForm";

const statusBadge = (s) => {
  if (s === "CONFIRMED") return <span style={S.badge("purple")}>confirmed</span>;
  if (s === "PENDING") return <span style={{ ...S.badge(""), background: "#fff3cd", color: "#856404" }}>pending</span>;
  if (s === "FAILED") return <span style={S.badge("red")}>failed</span>;
  return <span style={S.badge("")}>{s?.toLowerCase()}</span>;
};

export default function Bookings({ token, showToast }) {
  const [status, setStatus] = useState("CONFIRMED");
  const [search, setSearch] = useState("");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editBooking, setEditBooking] = useState(null);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  // Sync state with device viewport size
  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    api.getBookings(status, search, token).then((b) => { setBookings(b); setLoading(false); }).catch(() => setLoading(false));
  }, [status, search, token]);

  useEffect(() => { load(); }, [load]);

  const isPhone = screenWidth < 768;

  // ─── DYNAMIC RESPONSIVE BREAKPOINT OVERRIDES ───
  const responsiveSearchRow = {
    padding: "16px 20px", 
    borderBottom: "1px solid #f0f0f0", 
    display: "flex", 
    justifyContent: "space-between", 
    alignItems: isPhone ? "flex-start" : "center",
    flexDirection: isPhone ? "column" : "row",
    gap: "12px"
  };

  const responsiveInput = {
    ...S.input,
    maxWidth: isPhone ? "100%" : 320,
    width: "100%",
    padding: "8px 14px"
  };

  const responsiveModalGrid = {
    display: "grid",
    gridTemplateColumns: isPhone ? "1fr" : "1fr 1fr",
    gap: isPhone ? 12 : 16,
    marginBottom: 20
  };

  return (
    <div style={{ width: "100%", boxSizing: "border-box" }}>
      <div style={S.pageBreadcrumb}>Bookings</div>
      <div style={{ ...S.pageTitle, fontSize: isPhone ? "22px" : S.pageTitle?.fontSize || "28px" }}>Bookings</div>

      {/* STATUS BADGE FILTERS - Auto wraps cleanly onto next line if buttons overflow */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {["CONFIRMED", "PENDING", "FAILED", "EXPIRED"].map((s) => (
          <button key={s} style={{ ...S.btnSm(status === s ? "primary" : "secondary") }} onClick={() => setStatus(s)}>
            {s.charAt(0) + s.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      <div style={{ ...S.card, padding: 0, overflow: "hidden" }}>
        {/* INTERACTIVE SEARCH CONTROLS ROW */}
        <div style={responsiveSearchRow}>
          <input
            style={responsiveInput}
            placeholder="Search by name, mobile, stall, ref..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span style={{ fontSize: 13, color: "#888", whiteSpace: "nowrap" }}>{bookings.length} bookings</span>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "#888" }}>Loading...</div>
        ) : (
          /* 💡 HORIZONTAL SCROLL WRAPPER (Self-contained scroll handling) */
          <div style={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
            <table style={{ ...S.table, minWidth: isPhone ? "750px" : "100%" }}>
              <thead>
                <tr>
                  {["Reference", "Booker", "Event", "Stall", "Category", "Amount", "Status", ""].map((h) => (
                    <th key={h} style={S.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr
                    key={b.bookingId}
                    style={{ cursor: "pointer" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#fafafa")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                  >
                    <td style={S.td}><span style={{ fontSize: 12, color: "#888", fontFamily: "monospace" }}>{b.bookingReference}</span></td>
                    <td style={S.td}>
                      <div style={{ fontWeight: 600 }}>{b.vendorName}</div>
                      <div style={{ fontSize: 12, color: "#888" }}>{b.mobileNumber}</div>
                    </td>
                    <td style={S.td}><span style={{ fontSize: 13 }}>{b.eventName?.length > 20 ? b.eventName.slice(0, 20) + "..." : b.eventName}</span></td>
                    <td style={S.td}><span style={{ fontWeight: 600 }}>{b.stallNumber}</span></td>
                    <td style={S.td}><span style={{ color: "#888" }}>{b.category}</span></td>
                    <td style={S.td}><span style={{ fontWeight: 700 }}>{formatCurrency(b.amount)}</span></td>
                    <td style={S.td}>{statusBadge(b.bookingStatus)}</td>
                    <td style={S.td}>
                      <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18 }} onClick={() => setEditBooking(b)} title="View/Edit">👁️</button>
                    </td>
                  </tr>
                ))}
                {bookings.length === 0 && (
                  <tr><td colSpan={8} style={{ ...S.td, textAlign: "center", padding: 40, color: "#888" }}>No {status.toLowerCase()} bookings found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DETAIL MODAL OVERLAYS */}
      {editBooking && (
        <div style={{ ...S.overlay, padding: isPhone ? "12px" : "20px" }}>
          <div style={{ ...S.modal, maxWidth: 460, padding: isPhone ? "20px" : S.modal?.padding || 32 }}>
            <button style={S.modalClose} onClick={() => setEditBooking(null)}>✕</button>
            <div style={S.modalTitle}>Booking Details</div>
            <div style={{ fontSize: 12, color: "#888", marginBottom: 20, fontFamily: "monospace" }}>{editBooking.bookingReference}</div>
            
            <div style={responsiveModalGrid}>
              <div><div style={{ fontSize: 12, color: "#888" }}>Event</div><div style={{ fontWeight: 600, marginTop: 4 }}>{editBooking.eventName}</div></div>
              <div><div style={{ fontSize: 12, color: "#888" }}>Stall</div><div style={{ fontWeight: 600, marginTop: 4 }}>{editBooking.stallNumber}</div></div>
              <div><div style={{ fontSize: 12, color: "#888" }}>Amount</div><div style={{ fontWeight: 700, color: "#6C5CE7", marginTop: 4 }}>{formatCurrency(editBooking.amount)}</div></div>
              <div><div style={{ fontSize: 12, color: "#888" }}>Status</div><div style={{ marginTop: 4 }}>{statusBadge(editBooking.bookingStatus)}</div></div>
            </div>

            {editBooking.bookingStatus === "CONFIRMED" && (
              <EditBookingForm booking={editBooking} token={token} showToast={showToast} onSaved={() => { setEditBooking(null); load(); }} onClose={() => setEditBooking(null)} />
            )}
            {editBooking.bookingStatus !== "CONFIRMED" && (
              <button style={S.btn("secondary")} onClick={() => setEditBooking(null)}>Close</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
