import { useState, useEffect } from "react";
import { S } from "../styles/styles";
import { api } from "../api/client";
import { formatCurrency } from "../utils/format";

export default function StallModal({ stall, eventId, token, onClose, onSaved, showToast }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    stallNumber: stall?.stallNumber || "",
    stallType: stall?.stallType || "NORMAL",
    price: stall?.price || "",
  });
  const [loading, setLoading] = useState(false);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const isNew = !stall;

  // Track live window resize events
  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isNew) await api.addStall(eventId, { ...form, price: Number(form.price) }, token);
      else await api.updateStall(eventId, stall.id, { ...form, price: Number(form.price) }, token);
      showToast(isNew ? "Stall added!" : "Stall updated!");
      onSaved();
    } catch (err) {
      showToast(err.message || "Error", "error");
    } finally {
      setLoading(false);
    }
  };

  const del = async () => {
    if (!confirm("Delete this stall?")) return;
    setLoading(true);
    try {
      await api.deleteStall(eventId, stall.id, token);
      showToast("Stall deleted!");
      onSaved();
    } catch (err) {
      showToast(err.message || "Error", "error");
    } finally {
      setLoading(false);
    }
  };

  const showForm = isNew || editing;
  const isPhone = screenWidth < 400;

  // ─── DYNAMIC RESPONSIVE BREAKPOINT OVERRIDES ───
  const responsiveOverlay = {
    ...S.overlay,
    padding: isPhone ? "12px" : S.overlay?.padding || 20
  };

  const responsiveModal = {
    ...S.modal,
    padding: isPhone ? "24px 16px" : S.modal?.padding || 32,
    maxWidth: 420,
    boxSizing: "border-box"
  };

  const responsiveInfoGrid = {
    display: "grid",
    gridTemplateColumns: isPhone ? "1fr" : "1fr 1fr", // Drops to 1 column if metrics cramp
    gap: 16,
    marginBottom: 16
  };

  const responsiveActionRow = {
    display: "flex",
    gap: 10,
    justifyContent: isPhone ? "stretch" : "flex-end",
    flexDirection: isPhone ? "column-reverse" : "row", // Standard thumb-order stack
    width: "100%",
    marginTop: 20
  };

  const responsiveButton = {
    flex: isPhone ? 1 : "none",
    width: isPhone ? "100%" : "auto",
    justifyContent: "center"
  };

  return (
    <div style={responsiveOverlay}>
      <div style={responsiveModal}>
        <button style={S.modalClose} onClick={onClose}>✕</button>
        {!showForm ? (
          <>
            <div style={S.modalTitle}>
              Stall {stall.stallNumber} {stall.stallStatus === "BOOKED" ? "— Booked" : ""}
            </div>
            <p style={{ fontSize: 13, color: stall.stallStatus === "BOOKED" ? "#e74c3c" : "#888", marginBottom: 20 }}>
              {stall.stallStatus === "BOOKED" ? "This stall has already been booked." : "This stall is available for booking."}
            </p>
            
            {/* Dynamic Details Metadata Grid */}
            <div style={responsiveInfoGrid}>
              <div>
                <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>Type</div>
                <span style={{ background: "#f1f3f5", padding: "4px 12px", borderRadius: 20, fontSize: 13, display: "inline-block" }}>
                  {stall.stallType?.toLowerCase()}
                </span>
              </div>
              <div>
                <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>Price</div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{formatCurrency(stall.price)}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>Status</div>
                <span style={S.badge(stall.stallStatus === "BOOKED" ? "red" : "green")}>
                  {stall.stallStatus === "BOOKED" ? "booked" : "available"}
                </span>
              </div>
            </div>

            {stall.stallStatus === "BOOKED" && stall.vendorName && (
              <div style={{ background: "#fff8f8", border: "1px solid #ffcdd2", borderRadius: 10, padding: 16, marginBottom: 20, wordBreak: "break-word" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  👤 <span style={{ fontWeight: 600 }}>{stall.vendorName}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  🏷️ <span>{stall.category}</span>
                </div>
                {stall.description && (
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                    <span style={{ marginTop: 2 }}>📄</span> <span>{stall.description}</span>
                  </div>
                )}
              </div>
            )}

            {/* Responsive Buttons Row */}
            <div style={responsiveActionRow}>
              <button style={{ ...S.btn("secondary"), ...responsiveButton }} onClick={onClose}>Close</button>
              <button style={{ ...S.btn(), ...responsiveButton }} onClick={() => setEditing(true)}>✏️ Edit Stall</button>
              <button style={{ ...S.btn("danger"), ...responsiveButton }} onClick={del} disabled={loading}>🗑️ Delete</button>
            </div>
          </>
        ) : (
          <>
            <div style={S.modalTitle}>{isNew ? "Add Stall" : "Edit Stall"}</div>
            <form onSubmit={save} style={{ marginTop: 20, width: "100%", boxSizing: "border-box" }}>
              <div style={S.formGroup}>
                <label style={S.label}>Stall Number *</label>
                <input
                  style={S.input}
                  value={form.stallNumber}
                  onChange={(e) => setForm((p) => ({ ...p, stallNumber: e.target.value }))}
                  placeholder="e.g. A-01"
                  required
                />
              </div>
              <div style={S.formGroup}>
                <label style={S.label}>Type *</label>
                <select style={S.select} value={form.stallType} onChange={(e) => setForm((p) => ({ ...p, stallType: e.target.value }))}>
                  <option value="NORMAL">Normal</option>
                  <option value="PREMIUM">Premium</option>
                </select>
              </div>
              <div style={S.formGroup}>
                <label style={S.label}>Price (₹) *</label>
                <input
                  style={S.input}
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
                  placeholder="e.g. 8000"
                  required
                />
              </div>

              <div style={responsiveActionRow}>
                <button type="button" style={{ ...S.btn("secondary"), ...responsiveButton }} onClick={() => (isNew ? onClose() : setEditing(false))}>
                  Cancel
                </button>
                <button type="submit" style={{ ...S.btn(), ...responsiveButton }} disabled={loading}>
                  {loading ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
