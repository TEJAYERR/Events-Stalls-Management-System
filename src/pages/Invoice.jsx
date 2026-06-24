import { useState, useEffect, useRef } from "react";
import { S } from "../styles/styles";
import { formatCurrency } from "../utils/format";

import html2canvas from "html2canvas"; // 💡 Import it locally

// ─── INVOICE ───────────────────────────────────────────────────────────────
export default function Invoice({ booking, event, stall, onBack }) {
  const ref = useRef();
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    
    const t = setTimeout(() => {
      downloadInvoice();
    }, 1000);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

    const downloadInvoice = async () => {
    try {
      // 💡 Clean out the script tag creation completely!
      if (!ref.current) return false;

      // Generate canvas reliably from local package package dependency
      const canvas = await html2canvas(ref.current, { 
        scale: 2,
        useCORS: true, // Prevents clean assets/blueprint images from cloud servers fracturing canvases
        logging: false
      });

      const link = document.createElement("a");
      link.download = `invoice-${booking?.bookingReference || "unknown"}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      return true;
    } catch (e) {
      console.error("Download failed", e);
      return false;
    }
  };


  const isPhone = screenWidth < 600;

  // ─── DYNAMIC RESPONSIVE BREAKPOINT OVERRIDES ───
  const responsiveControlBar = {
    maxWidth: 640, 
    width: "100%", 
    marginBottom: 16, 
    display: "flex", 
    alignItems: isPhone ? "stretch" : "center", 
    justifyContent: "space-between", 
    flexDirection: isPhone ? "column" : "row",
    gap: 12
  };

  const responsiveButtonsGroup = {
    display: "flex", 
    alignItems: isPhone ? "stretch" : "center", 
    gap: 8, 
    flexDirection: "column",
    justifyContent: "flex-end",
    textAlign: isPhone ? "center" : "right"
  };

  const responsiveInvoiceHeader = {
    background: "#0f0f1a", 
    color: "#fff", 
    padding: isPhone ? "20px 16px" : "28px 32px"
  };

  const responsiveHeaderSplit = {
    display: "flex", 
    justifyContent: "space-between", 
    alignItems: isPhone ? "stretch" : "flex-start",
    flexDirection: isPhone ? "column" : "row",
    gap: isPhone ? "16px" : "0px"
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa", padding: isPhone ? "16px 12px" : 32, display: "flex", flexDirection: "column", alignItems: "center", boxSizing: "border-box" }}>
      
      {/* 1. INTERACTIVE ACTIONS TOP BAR */}
      <div style={responsiveControlBar}>
        <button style={{ ...S.btn("secondary"), justifyContent: "center" }} onClick={onBack}>← Back to Event</button>
        <div style={responsiveButtonsGroup}>
          <button style={{ ...S.btn("primary"), justifyContent: "center" }} onClick={downloadInvoice}>⬇️ Download Invoice</button>
          <span style={{ fontSize: 12, color: "#888" }}>Auto-download starts shortly; use button if it fails.</span>
        </div>
      </div>

      {/* 2. CORE INVOICE IMAGE CANVAS */}
      <div ref={ref} style={{ maxWidth: 640, width: "100%", background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,.1)", boxSizing: "border-box" }}>
        
        {/* Invoice Branding Header Section */}
        <div style={responsiveInvoiceHeader}>
          <div style={responsiveHeaderSplit}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div style={{ ...S.logoIcon, width: 32, height: 32, fontSize: 14 }}>🏪</div>
                <span style={{ fontWeight: 700, fontSize: isPhone ? 14 : 16 }}>StallManager</span>
              </div>
              {/* 💡 SCALED FONT: Formats heading for better visual fit */}
              <div style={{ fontSize: isPhone ? 20 : 24, fontWeight: 700 }}>Booking Invoice</div>
              <div style={{ fontSize: isPhone ? 12 : 13, color: "#aaa", marginTop: 4 }}>Thank you for your booking!</div>
            </div>
            <div style={{ textAlign: isPhone ? "left" : "right" }}>
              <div style={{ background: "#2ecc71", color: "#fff", padding: isPhone ? "4px 10px" : "6px 14px", borderRadius: 20, fontSize: isPhone ? 11 : 13, fontWeight: 700, marginBottom: 8, display: "inline-block" }}>✓ Confirmed</div>
              <div style={{ fontSize: isPhone ? 11 : 13, color: "#aaa" }}>{new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</div>
            </div>
          </div>
        </div>

                <div style={{ padding: isPhone ? "20px 16px" : "28px 32px" }}>
          {/* Ref + Amount */}
          <div style={{ 
            background: "#f0eeff", 
            borderRadius: 10, 
            padding: isPhone ? "12px 14px" : "16px 20px", 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: isPhone ? "flex-start" : "center", 
            flexDirection: isPhone ? "column" : "row",
            gap: isPhone ? "10px" : "0px",
            marginBottom: 24 
          }}>
            <div>
              <div style={{ fontSize: 11, color: "#888", marginBottom: 2 }}>Booking Reference</div>
              {/* 💡 SCALED FONT: Prevent reference stretching */}
              <div style={{ fontWeight: 700, fontSize: isPhone ? 16 : 18, color: "#6C5CE7" }}>{booking.bookingReference}</div>
            </div>
            <div style={{ textAlign: isPhone ? "left" : "right" }}>
              <div style={{ fontSize: 11, color: "#888", marginBottom: 2 }}>Amount Paid</div>
              {/* 💡 SCALED FONT: Clean billing currency sizing */}
              <div style={{ fontWeight: 700, fontSize: isPhone ? 18 : 22 }}>{formatCurrency(booking.amount)}</div>
            </div>
          </div>

          {/* Details Grid */}
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: isPhone ? "1fr" : "1fr 1fr", 
            gap: isPhone ? 20 : 28, 
            marginBottom: 24 
          }}>
            <div>
              {/* 💡 SCALED FONT: Smaller tracking labels */}
              <div style={{ fontSize: isPhone ? 10 : 11, fontWeight: 700, color: "#6C5CE7", letterSpacing: 1, marginBottom: 8 }}>EVENT DETAILS</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, fontSize: isPhone ? 13 : 14 }}>🏪 {event?.name}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: isPhone ? 13 : 14 }}># Stall <strong>{stall?.stallNumber || booking.stallNumber}</strong></div>
            </div>
            <div>
              {/* 💡 SCALED FONT: Smaller tracking labels */}
              <div style={{ fontSize: isPhone ? 10 : 11, fontWeight: 700, color: "#6C5CE7", letterSpacing: 1, marginBottom: 8 }}>BOOKER DETAILS</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, fontSize: isPhone ? 13 : 14 }}>👤 <strong>{booking.vendorName}</strong></div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, fontSize: isPhone ? 13 : 14 }}>📞 {booking.mobileNumber}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, fontSize: isPhone ? 13 : 14 }}>🏷️ {booking.category}</div>
              {booking.description && <div style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: isPhone ? 13 : 14 }}><span style={{ marginTop: 2 }}>📄</span> {booking.description}</div>}
            </div>
          </div>

          <hr style={{ border: "none", borderTop: "1px solid #f0f0f0", marginBottom: 20 }} />

          {/* Payment Details */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: isPhone ? 10 : 11, fontWeight: 700, color: "#6C5CE7", letterSpacing: 1, marginBottom: 12 }}>PAYMENT DETAILS</div>
            {[
              ["Payment Method", "Razorpay"],
              ["Order ID", booking.razorpayOrderId || "—"],
              ["Payment Status", "CONFIRMED"],
            ].map(([l, v]) => (
              <div key={l} style={{ display: "flex", justifyContent: "space-between", fontSize: isPhone ? 13 : 14, marginBottom: 8, gap: 12 }}>
                <span style={{ color: "#666" }}>{l}</span>
                <span style={{ 
                  fontWeight: v === "CONFIRMED" ? 700 : 400, 
                  color: v === "CONFIRMED" ? "#2ecc71" : "#333",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  textAlign: "right",
                  maxWidth: isPhone ? "180px" : "none"
                }} title={v}>
                  {v}
                </span>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: isPhone ? 14 : 15, fontWeight: 700, borderTop: "1px solid #f0f0f0", paddingTop: 10, marginTop: 4 }}>
              <span>Total Amount</span><span>{formatCurrency(booking.amount)}</span>
            </div>
          </div>

          {/* Notes */}
          <div style={{ background: "#f8f9fa", borderRadius: 10, padding: isPhone ? "12px 14px" : "16px 20px", marginBottom: 20 }}>
            <div style={{ fontWeight: 600, fontSize: isPhone ? 12 : 13, marginBottom: 8 }}>Important Notes</div>
            {["Please carry this invoice to the event for stall verification.", "Report to the event management desk 30 minutes before setup time.", "For queries, contact the event organizer with your booking reference."].map((n) => (
              <div key={n} style={{ fontSize: isPhone ? 12 : 13, color: "#555", marginBottom: 6, lineHeight: 1.4 }}>• {n}</div>
            ))}
          </div>

          <div style={{ textAlign: "center", fontSize: isPhone ? 11 : 12, color: "#aaa", lineHeight: 1.5 }}>
            Generated by StallManager · {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}<br />
            This is a computer-generated invoice and does not require a signature.
          </div>
        </div>
      </div>
    </div>
  );
}
