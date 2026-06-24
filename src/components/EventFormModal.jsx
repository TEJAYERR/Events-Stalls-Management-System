import { useState, useEffect } from "react";
import { S } from "../styles/styles";
import { api } from "../api/client";

export default function EventFormModal({ token, event, onClose, onSaved, showToast }) {
  const isEdit = !!event;
  const [form, setForm] = useState({
    name: event?.name || "",
    venue: event?.venue || "",
    description: event?.description || "",
    startDate: event?.startDate || "",
    endDate: event?.endDate || "",
  });
  const [blueprint, setBlueprint] = useState(null);
  const [loading, setLoading] = useState(false);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  // Monitor real-time screen width scale adjustments
  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit) {
        await api.updateEvent(event.id, form, token);
        if (blueprint) {
          const fd = new FormData();
          fd.append("blueprintFile", blueprint);
          await api.updateBlueprint(event.id, fd, token);
        }
        showToast("Event updated!");
      } else {
        if (!blueprint) {
          showToast("Please upload a blueprint image", "error");
          setLoading(false);
          return;
        }
        const fd = new FormData();
        fd.append("eventRequest", new Blob([JSON.stringify({ ...form, stallRequests: [] })], { type: "application/json" }));
        fd.append("blueprintFile", blueprint);
        await api.createEvent(fd, token);
        showToast("Event created!");
      }
      onSaved();
    } catch (err) {
      showToast(err.message || "Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  };

  const isPhone = screenWidth < 520; // Trigger fluid shrink when viewport sizes slide under modal max-widths

  // ─── DYNAMIC RESPONSIVE BREAKPOINT OVERRIDES ───
  const responsiveOverlay = {
    ...S.overlay,
    padding: isPhone ? "12px" : S.overlay?.padding || 20
  };

  const responsiveModal = {
    ...S.modal,
    padding: isPhone ? "24px 16px" : S.modal?.padding || 32,
    maxHeight: isPhone ? "95vh" : S.modal?.maxHeight || "90vh",
    boxSizing: "border-box"
  };

  const responsiveDateGrid = {
    display: "grid", 
    gridTemplateColumns: isPhone ? "1fr" : "1fr 1fr", 
    gap: isPhone ? "0px" : 12 
  };

  const responsiveActionRow = {
    display: "flex", 
    gap: 10, 
    justifyContent: isPhone ? "stretch" : "flex-end",
    flexDirection: isPhone ? "column-reverse" : "row", // Places confirm action on top for mobile thumbs
    marginTop: 16,
    width: "100%"
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
        <div style={S.modalTitle}>{isEdit ? "Edit Event" : "Create Event"}</div>
        <p style={{ fontSize: 13, color: "#888", marginBottom: 20 }}>
          {isEdit ? "Update event details" : "Fill in the details to create a new event"}
        </p>
        <form onSubmit={submit} style={{ width: "100%", boxSizing: "border-box" }}>
          <div style={S.formGroup}>
            <label style={S.label}>Event Name *</label>
            <input
              style={S.input}
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Techfest 2026"
              required
            />
          </div>
          <div style={S.formGroup}>
            <label style={S.label}>Venue *</label>
            <input
              style={S.input}
              value={form.venue}
              onChange={(e) => setForm((p) => ({ ...p, venue: e.target.value }))}
              placeholder="e.g. Bangalore Exhibition Centre"
              required
            />
          </div>
          <div style={S.formGroup}>
            <label style={S.label}>Description</label>
            <textarea
              style={S.textarea}
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="Brief description of the event..."
            />
          </div>

          {/* DYNAMIC DATE CONTROL GRID CONTAINER */}
          <div style={responsiveDateGrid}>
            <div style={S.formGroup}>
              <label style={S.label}>Start Date *</label>
              <input
                style={S.input}
                type="date"
                value={form.startDate}
                onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))}
                required
              />
            </div>
            <div style={S.formGroup}>
              <label style={S.label}>End Date *</label>
              <input
                style={S.input}
                type="date"
                value={form.endDate}
                onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))}
                required
              />
            </div>
          </div>

          <div style={S.formGroup}>
            <label style={S.label}>Blueprint / Layout Image {!isEdit && "*"}</label>
            <input type="file" accept="image/*" onChange={(e) => setBlueprint(e.target.files[0])} style={{ fontSize: 13, width: "100%" }} />
            {isEdit && <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>Leave empty to keep existing image</div>}
          </div>

          {/* INTERACTIVE FORM FOOTER CALL TO ACTIONS */}
          <div style={responsiveActionRow}>
            <button 
              type="button" 
              style={{ ...S.btn("secondary"), ...responsiveButton }} 
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              style={{ ...S.btn("primary"), ...responsiveButton }} 
              disabled={loading}
            >
              {loading ? "Saving..." : isEdit ? "Save Changes" : "Create Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
