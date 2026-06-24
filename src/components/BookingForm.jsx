import { useState } from "react";
import { S } from "../styles/styles";
import { formatCurrency } from "../utils/format";

// ─── BOOKING FORM (public) ─────────────────────────────────────────────────
export default function BookingForm({ stall, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState({ vendorName: "", mobileNumber: "", category: "", description: "" });

  const handle = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handle}>
      <div style={S.formGroup}>
        <label style={S.label}>Full Name *</label>
        <input
          style={S.input}
          placeholder="Your full name"
          value={form.vendorName}
          onChange={(e) => setForm((p) => ({ ...p, vendorName: e.target.value }))}
          required
        />
      </div>
      <div style={S.formGroup}>
        <label style={S.label}>Mobile Number *</label>
        <input
          style={S.input}
          placeholder="10-digit mobile number"
          value={form.mobileNumber}
          onChange={(e) => setForm((p) => ({ ...p, mobileNumber: e.target.value }))}
          required
        />
      </div>
      <div style={S.formGroup}>
        <label style={S.label}>Business Category *</label>
        <input
          style={S.input}
          placeholder="e.g. Electronics, Clothing, Food"
          value={form.category}
          onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
          required
        />
      </div>
      <div style={S.formGroup}>
        <label style={S.label}>Description *</label>
        <textarea
          style={S.textarea}
          placeholder="Brief description of what you'll be selling or showcasing..."
          value={form.description}
          onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
          required
        />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
        <div>
          <span style={{ fontSize: 13, color: "#888" }}>Amount to pay</span>{" "}
          <span style={{ fontWeight: 800, fontSize: 18, marginLeft: 8 }}>{formatCurrency(stall.price)}</span>
        </div>
      </div>
      <button
        type="submit"
        disabled={loading}
        style={{ ...S.btn(), width: "100%", justifyContent: "center", padding: "14px", marginTop: 16, fontSize: 15 }}
      >
        💳 Pay with Razorpay
      </button>
      <p style={{ textAlign: "center", fontSize: 12, color: "#aaa", marginTop: 8 }}>Secured by Razorpay · Test Mode</p>
    </form>
  );
}
