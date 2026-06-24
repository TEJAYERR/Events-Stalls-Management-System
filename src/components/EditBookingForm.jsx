import { useState, useEffect } from "react";
import { S } from "../styles/styles";
import { api } from "../api/client";

export default function EditBookingForm({ booking, token, showToast, onSaved, onClose }) {
  const [form, setForm] = useState({
    name: booking.vendorName || "",
    mobileNumber: booking.mobileNumber || "",
    category: booking.category || "",
    description: booking.description || "",
  });
  const [loading, setLoading] = useState(false);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  // Monitor real-time screen width adjustments
  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.updateBooking(booking.bookingId, form, token);
      showToast("Booking updated!");
      onSaved();
    } catch {
      showToast("Failed to update", "error");
      setLoading(false);
    }
  };

  const isPhone = screenWidth < 400;

  // ─── DYNAMIC RESPONSIVE BREAKPOINT OVERRIDES ───
  const responsiveActionButtonsRow = {
    display: "flex", 
    gap: 10, 
    justifyContent: isPhone ? "stretch" : "flex-end",
    flexDirection: isPhone ? "column-reverse" : "row", // Places primary confirm action on top on mobile screens
    width: "100%"
  };

  const responsiveButton = {
    flex: isPhone ? 1 : "none",
    width: isPhone ? "100%" : "auto",
    justifyContent: "center"
  };

  return (
    <form onSubmit={save} style={{ width: "100%", boxSizing: "border-box" }}>
      <div style={S.formGroup}>
        <label style={S.label}>Vendor Name</label>
        <input style={S.input} value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
      </div>
      <div style={S.formGroup}>
        <label style={S.label}>Mobile Number</label>
        <input
          style={S.input}
          value={form.mobileNumber}
          onChange={(e) => setForm((p) => ({ ...p, mobileNumber: e.target.value }))}
        />
      </div>
      <div style={S.formGroup}>
        <label style={S.label}>Category</label>
        <input style={S.input} value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} />
      </div>
      <div style={S.formGroup}>
        <label style={S.label}>Description</label>
        <textarea
          style={S.textarea}
          value={form.description}
          onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
        />
      </div>

      {/* FOOTER ACTIONS SUBMIT ROW CONTAINER */}
      <div style={responsiveActionButtonsRow}>
        <button 
          type="button" 
          style={{ ...S.btn("secondary"), ...responsiveButton }} 
          onClick={onClose}
        >
          Cancel
        </button>
        <button 
          type="submit" 
          style={{ ...S.btn(), ...responsiveButton }} 
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
