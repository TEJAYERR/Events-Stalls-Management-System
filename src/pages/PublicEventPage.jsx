import { useState, useEffect } from "react";
import { S } from "../styles/styles";
import { api } from "../api/client";
import { formatDate, formatCurrency } from "../utils/format";
import { getEventStatus } from "../utils/eventStatus";
import BookingForm from "../components/BookingForm";
import Invoice from "./Invoice";

// ─── PUBLIC EVENT PAGE ───────────────────────────────────────────────────────
// Uses api.getPublicEvent() -> GET /events/{eventId} (no auth) throughout.
export default function PublicEventPage({ eventId }) {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedStall, setSelectedStall] = useState(null); // stall or null
  const [bookingStep, setBookingStep] = useState("idle"); // idle | form | paying | confirmed
  const [bookingData, setBookingData] = useState(null);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [razorpayResponse, setRazorpayResponse] = useState(null);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  // Track live real-time viewport changes
  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    api.getPublicEvent(eventId).then((e) => { setEvent(e); setLoading(false); }).catch(() => setLoading(false));
  }, [eventId]);

  const openStall = (stall) => { setSelectedStall(stall); setBookingStep("idle"); };
  const closeModal = () => {
    setSelectedStall(null);
    setBookingStep("idle");
    setBookingData(null);
    setConfirmedBooking(null);
    setShowInvoice(false);
    setRazorpayResponse(null);
  };

  const startBooking = async (form) => {
    setBookingStep("paying");
    try {
      const res = await api.bookStall(event.id, selectedStall.id, form);
      setBookingData(res);
      // Load Razorpay
      if (!window.Razorpay) {
        await new Promise((resolve, reject) => {
          const s = document.createElement("script");
          s.src = "https://checkout.razorpay.com/v1/checkout.js";
          s.onload = resolve;
          s.onerror = reject;
          document.head.appendChild(s);
        });
      }
      const rzp = new window.Razorpay({
        key: res.razorpayKey,
        amount: Number(res.amount) * 100,
        currency: "INR",
        order_id: res.razorpayOrderId,
        name: "StallManager",
        description: `Stall ${selectedStall.stallNumber}`,
        handler: async (response) => {
          try {
            const eventIdToVerify = event.id;
            const stallIdToVerify = selectedStall.id;

            await api.verifyPayment(eventIdToVerify, stallIdToVerify, {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            setRazorpayResponse(response);
            setConfirmedBooking({ ...res, razorpayOrderId: response.razorpay_order_id });
            setBookingStep("confirmed");
            setShowInvoice(true);
            api.getPublicEvent(eventId).then(setEvent);
          } catch {
            setBookingStep("form");
          }
        },
        modal: {
          ondismiss: () => {
            setBookingStep("idle");
          },
        },
      });
      rzp.open();
    } catch (err) {
      setBookingStep("form");
    }
  };

  if (loading) return <div style={{ padding: 60, textAlign: "center", color: "#888" }}>Loading event...</div>;
  if (!event) return <div style={{ padding: 60, textAlign: "center", color: "#888" }}>Event not found</div>;

  if (showInvoice) {
    return (
      <Invoice
        booking={{ ...confirmedBooking, stallNumber: selectedStall?.stallNumber }}
        event={event}
        stall={selectedStall}
        onBack={() => { setShowInvoice(false); closeModal(); }}
      />
    );
  }

  const booked = event.stalls?.filter((s) => s.stallStatus === "BOOKED").length || 0;
  const total = event.stalls?.length || 0;
  const status = getEventStatus(event);

  const isUnder600 = screenWidth < 600;

  // ─── DYNAMIC RESPONSIVE BREAKPOINT OVERRIDES ───
  const responsiveMetaRow = {
    display: "flex",
    gap: isUnder600 ? 8 : 24,
    flexDirection: isUnder600 ? "column" : "row",
    fontSize: 14,
    color: "#aaa"
  };

  const responsiveMetricsRow = {
    display: "flex",
    gap: isUnder600 ? 24 : 40,
    flexWrap: "wrap",
    marginTop: 24
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa", width: "100%", overflowX: "hidden" }}>
      {/* Header */}
      <div style={{ background: "#0f0f1a", color: "#fff", padding: isUnder600 ? "32px 20px" : "40px 32px", boxSizing: "border-box" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <span style={{ background: status === "active" ? "#2ecc71" : "#888", color: "#fff", padding: "4px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700, marginBottom: 16, display: "inline-block" }}>
            {status === "active" ? "Open for Booking" : status === "upcoming" ? "Coming Soon" : "Closed"}
          </span>
          <h1 style={{ fontSize: isUnder600 ? "24px" : "32px", fontWeight: 800, marginBottom: 12, lineHeight: 1.2 }}>{event.name}</h1>
          {event.description && <p style={{ fontSize: 15, color: "#aaa", lineHeight: 1.6, marginBottom: 20, maxWidth: 600, wordBreak: "break-word" }}>{event.description}</p>}
          
          <div style={responsiveMetaRow}>
            <span>📅 {formatDate(event.startDate)}</span>
            <span>📍 {event.venue}</span>
          </div>
          
          <div style={responsiveMetricsRow}>
            {[["Stalls Available", total - booked], ["Stalls Booked", booked], ["Total Stalls", total]].map(([l, v]) => (
              <div key={l} style={{ minWidth: isUnder600 ? "100px" : "auto" }}>
                <div style={{ fontSize: isUnder600 ? "22px" : "28px", fontWeight: 800 }}>{v}</div>
                <div style={{ fontSize: 13, color: "#aaa" }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: isUnder600 ? "24px 16px" : "32px", boxSizing: "border-box" }}>
        {/* Blueprint */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 12 }}>Event Layout</div>
          <img src={api.getBlueprintUrl(event.id)} alt="Layout" style={{ width: "100%", borderRadius: 12, maxHeight: isUnder600 ? 220 : 360, objectFit: "cover" }} onError={(e) => (e.target.style.display = "none")} />
          <p style={{ textAlign: "center", fontSize: 13, color: "#6C5CE7", marginTop: 8 }}>Reference image showing stall placement and zones</p>
        </div>

        {/* Stall Grid */}
        <div>
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: isUnder600 ? "flex-start" : "center", 
            flexDirection: isUnder600 ? "column" : "row",
            gap: isUnder600 ? "12px" : "0px",
            marginBottom: 16 
          }}>
            <div style={{ fontWeight: 700, fontSize: 18 }}>Select a Stall</div>
            <div style={{ display: "flex", gap: isUnder600 ? 12 : 16, fontSize: 13, flexWrap: "wrap" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 14, height: 14, border: "2px solid #e3f2fd", borderRadius: 3, display: "inline-block", background: "#f8fbff" }} /> Normal</span>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 14, height: 14, border: "2px solid #fff3cd", borderRadius: 3, display: "inline-block", background: "#fffdf0" }} /> Premium</span>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 14, height: 14, border: "2px solid #ffcdd2", borderRadius: 3, display: "inline-block", background: "#fff8f8" }} /> Booked</span>
            </div>
          </div>
          
          <div style={{ 
            ...S.stallGrid,
            gridTemplateColumns: isUnder600 ? "repeat(auto-fill, minmax(130px, 1fr))" : S.stallGrid?.gridTemplateColumns || "repeat(auto-fill, minmax(160px, 1fr))",
            gap: isUnder600 ? "8px" : S.stallGrid?.gap || 12
          }}>
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
                  <div key={stall.id} style={{ ...S.stallCard(stall.stallType, stall.stallStatus), userSelect: "none", padding: isUnder600 ? "10px" : "14px" }} onClick={() => openStall(stall)}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{stall.stallNumber}</div>
                      {stall.stallType === "PREMIUM" && <span>👑</span>}
                    </div>
                    <div style={{ fontSize: isUnder600 ? "12px" : "13px", fontWeight: 600, margin: "6px 0" }}>{formatCurrency(stall.price)}</div>
                    <span style={S.badge(stall.stallStatus === "BOOKED" ? "red" : "green")}>{stall.stallStatus === "BOOKED" ? "Booked" : "Available"}</span>
                    {stall.stallStatus === "BOOKED" && stall.category && (
                      <div style={{ fontSize: 11, color: "#888", marginTop: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {stall.category}
                      </div>
                    )}
                  </div>
                ))
            )}
          </div>
        </div>
      </div>

      {/* Stall Modal */}
      {selectedStall && bookingStep !== "confirmed" && (
        <div style={{ ...S.overlay, padding: isUnder600 ? "12px" : "20px" }}>
          <div style={{ ...S.modal, maxWidth: 480, padding: isUnder600 ? "24px 16px" : S.modal?.padding || 32, boxSizing: "border-box" }}>
            <button style={S.modalClose} onClick={closeModal}>✕</button>

            {selectedStall.stallStatus === "BOOKED" ? (
              <>
                <div style={S.modalTitle}>Stall {selectedStall.stallNumber} — Booked</div>
                <p style={{ fontSize: 14, color: "#e74c3c", marginBottom: 20 }}>This stall has already been booked.</p>
                <div style={{ background: "#fff8f8", border: "1px solid #ffcdd2", borderRadius: 10, padding: 16, marginBottom: 20, wordBreak: "break-word" }}>
                  {selectedStall.vendorName && <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, fontSize: 14 }}>👤 <strong>{selectedStall.vendorName}</strong></div>}
                  {selectedStall.category && <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, fontSize: 14 }}>🏷️ {selectedStall.category}</div>}
                  {selectedStall.description && <div style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 14 }}><span style={{ marginTop: 2 }}>📄</span> {selectedStall.description}</div>}
                </div>
                <p style={{ textAlign: "center", fontSize: 13, color: "#888" }}>Please choose another available stall.</p>
              </>
            ) : bookingStep === "idle" ? (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                  <div style={{ ...S.logoIcon, width: 36, height: 36 }}>🏪</div>
                  <div>
                    <div style={S.modalTitle}>Book Stall {selectedStall.stallNumber}</div>
                    <div style={{ fontSize: 13, color: "#888" }}>{selectedStall.stallType === "PREMIUM" ? "Premium" : "Standard"} stall · {formatCurrency(selectedStall.price)}</div>
                  </div>
                </div>
                <BookingForm stall={selectedStall} onSubmit={startBooking} onCancel={closeModal} loading={bookingStep === "paying"} />
              </>
            ) : (
              <div style={{ textAlign: "center", padding: 40 }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
                <div style={{ fontWeight: 600 }}>Processing payment...</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirmed Modal */}
      {bookingStep === "confirmed" && confirmedBooking && (
        <div style={{ ...S.overlay, padding: isUnder600 ? "12px" : "20px" }}>
          <div style={{ ...S.modal, maxWidth: 420, textAlign: "center", padding: isUnder600 ? "24px 16px" : S.modal?.padding || 32, boxSizing: "border-box" }}>
            <button style={S.modalClose} onClick={closeModal}>✕</button>
            <div style={{ width: 72, height: 72, background: "#e8f5e9", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 32 }}>✅</div>
            <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Booking Confirmed!</div>
            <p style={{ color: "#666", marginBottom: 20 }}>Stall {selectedStall?.stallNumber} is now booked for you.</p>
            <div style={{ background: "#f8f9fa", borderRadius: 8, padding: "12px 20px", display: "inline-block", fontFamily: "monospace", fontSize: 14, fontWeight: 700, marginBottom: 28, maxWidth: "100%", overflowX: "auto" }}>
              Ref: {confirmedBooking.bookingReference}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button style={{ ...S.btn(), width: "100%", justifyContent: "center", padding: 14 }} onClick={() => setShowInvoice(true)}>View Invoice & Confirmation</button>
              <button style={{ background: "none", border: "none", cursor: "pointer", color: "#888", fontSize: 14, padding: "8px" }} onClick={closeModal}>Back to stalls</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
