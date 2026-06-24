// ─── STYLES ────────────────────────────────────────────────────────────────
// Centralized inline-style tokens shared across pages/components.
// (Kept as a plain JS object, matching the original single-file app —
// swap for CSS modules / styled-components later if you want.)
export const S = {
  // Layout
  app: { fontFamily: "'Inter', sans-serif", minHeight: "100vh", background: "#f8f9fa", display: "flex", overflowX: "hidden" },
  sidebar: { width: 260, flex: "0 0 260px", background: "#0f0f1a", color: "#fff", display: "flex", flexDirection: "column", padding: "24px 0", position: "fixed", top: 0, left: 0, height: "100vh", zIndex: 100, boxSizing: "border-box" },
  sidebarLogo: { display: "flex", alignItems: "center", gap: 12, padding: "0 20px 32px" },
  logoIcon: { width: 40, height: 40, background: "#6C5CE7", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 },
  logoText: { fontWeight: 700, fontSize: 16 },
  logoSub: { fontSize: 11, color: "#888", marginTop: 2 },
  navItem: (active) => ({ display: "flex", alignItems: "center", gap: 12, padding: "12px 20px", cursor: "pointer", borderRadius: 0, color: active ? "#fff" : "#888", background: active ? "#1a1a2e" : "transparent", fontWeight: active ? 600 : 400, fontSize: 14, transition: "all .2s", borderLeft: active ? "3px solid #6C5CE7" : "3px solid transparent" }),
  logout: { marginTop: "auto", display: "flex", alignItems: "center", gap: 12, padding: "12px 20px", cursor: "pointer", color: "#888", fontSize: 14 },
  main: { marginLeft: 260, flex: 1, padding: "32px 36px", minHeight: "100vh" },
  pageTitle: { fontSize: 28, fontWeight: 700, color: "#1a1a2e", marginBottom: 28 },
  pageBreadcrumb: { fontSize: 12, color: "#888", marginBottom: 8 },

  // Cards
  card: { background: "#fff", borderRadius: 12, padding: 24, boxShadow: "0 1px 3px rgba(0,0,0,.08)" },
  statGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 28 },
  statCard: { background: "#fff", borderRadius: 12, padding: 24, boxShadow: "0 1px 3px rgba(0,0,0,.08)", display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
  statLabel: { fontSize: 13, color: "#888", marginBottom: 8 },
  statValue: { fontSize: 32, fontWeight: 700, color: "#1a1a2e" },
  statIcon: { width: 44, height: 44, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 },

  // Buttons
  btn: (variant = "primary") => ({
    display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 8,
    fontWeight: 600, fontSize: 13, cursor: "pointer", border: "none", transition: "all .2s",
    background: variant === "primary" ? "#6C5CE7" : variant === "danger" ? "#e74c3c" : variant === "ghost" ? "transparent" : "#f1f3f5",
    color: variant === "primary" ? "#fff" : variant === "danger" ? "#fff" : variant === "ghost" ? "#6C5CE7" : "#333",
    textDecoration: variant === "ghost" ? "underline" : "none",
  }),
  btnSm: (variant = "primary") => ({ ...S.btn(variant), padding: "6px 14px", fontSize: 12 }),

  // Form
  formGroup: { marginBottom: 18 },
  label: { display: "block", fontSize: 13, fontWeight: 600, color: "#333", marginBottom: 6 },
  input: { width: "100%", padding: "10px 14px", borderRadius: 8, border: "1.5px solid #e0e0e0", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit" },
  textarea: { width: "100%", padding: "10px 14px", borderRadius: 8, border: "1.5px solid #e0e0e0", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit", minHeight: 80, resize: "vertical" },
  select: { width: "100%", padding: "10px 14px", borderRadius: 8, border: "1.5px solid #e0e0e0", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit", background: "#fff" },

  // Modal
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 },
  modal: { background: "#fff", borderRadius: 16, padding: 32, width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto", position: "relative" },
  modalTitle: { fontSize: 20, fontWeight: 700, color: "#1a1a2e", marginBottom: 4 },
  modalClose: { position: "absolute", top: 16, right: 16, background: "none", border: "1px solid #e0e0e0", borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" },

  // Badges
  badge: (color) => ({ display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: color === "green" ? "#e8f5e9" : color === "red" ? "#fdecea" : color === "purple" ? "#6C5CE7" : "#f1f3f5", color: color === "green" ? "#2e7d32" : color === "red" ? "#c62828" : color === "purple" ? "#fff" : "#555" }),

  // Table
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "12px 16px", fontSize: 12, fontWeight: 600, color: "#888", borderBottom: "1px solid #f0f0f0", textTransform: "uppercase", letterSpacing: .5 },
  td: { padding: "14px 16px", fontSize: 14, color: "#333", borderBottom: "1px solid #f8f9fa", verticalAlign: "middle" },

  // Event card
  eventCard: { background: "#fff", borderRadius: 12, boxShadow: "0 1px 3px rgba(0,0,0,.08)", marginBottom: 16, overflow: "hidden", display: "flex" },
  eventImg: { width: 180, minHeight: 140, objectFit: "cover", flexShrink: 0 },
  eventBody: { padding: "20px 24px", flex: 1 },

  // Stall grid
  stallGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12, marginTop: 16 },
  stallCard: (type, status) => ({
    borderRadius: 10, padding: "14px", cursor: "pointer", transition: "transform .15s",
    border: `2px solid ${status === "BOOKED" ? "#ffcdd2" : type === "PREMIUM" ? "#fff3cd" : "#e3f2fd"}`,
    background: status === "BOOKED" ? "#fff8f8" : type === "PREMIUM" ? "#fffdf0" : "#f8fbff",
  }),

  // Login
  loginWrap: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0f0f1a" },
  loginBox: { background: "#fff", borderRadius: 16, padding: 40, width: 360, boxShadow: "0 8px 32px rgba(0,0,0,.2)" },
  // Global font helper (use on page wrappers if a component doesn't inherit from S.app)
  globalFont: { fontFamily: "'Inter', sans-serif" },
};

