import { useState, useEffect } from "react";
import { S } from "../styles/styles";
import { api } from "../api/client";

export default function Login({ onLogin }) {
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  // Synchronize state with live window viewport changes
  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.login(form);
      localStorage.setItem("jwt", res.JWTToken);
      localStorage.setItem("admin", JSON.stringify({ id: res.id, username: res.username }));
      onLogin(res.JWTToken);
    } catch (e) {
      setError("Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  const isPhone = screenWidth < 400; // Trigger fluid shrink slightly earlier for login card boxes

  // ─── DYNAMIC RESPONSIVE BREAKPOINT OVERRIDES ───
  const responsiveLoginBox = {
    ...S.loginBox,
    width: isPhone ? "100%" : S.loginBox?.width || 360,
    maxWidth: "360px",
    padding: isPhone ? "32px 24px" : S.loginBox?.padding || 40,
    boxSizing: "border-box" // Prevents explicit paddings from pushing widths past parent containers
  };

  return (
    <div style={{ ...S.loginWrap, padding: isPhone ? "16px" : 0, boxSizing: "border-box" }}>
      <div style={responsiveLoginBox}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
          <div style={{ ...S.logoIcon, width: 48, height: 48, fontSize: 22 }}>🏪</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 20 }}>StallManager</div>
            <div style={{ fontSize: 12, color: "#888" }}>Admin Panel</div>
          </div>
        </div>
        <form onSubmit={submit}>
          <div style={S.formGroup}>
            <label style={S.label}>Username</label>
            <input
              style={S.input}
              value={form.username}
              onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
              placeholder="Enter username"
              required
            />
          </div>
          <div style={S.formGroup}>
            <label style={S.label}>Password</label>
            <input
              style={S.input}
              type="password"
              value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              placeholder="Enter password"
              required
            />
          </div>
          {error && <div style={{ color: "#e74c3c", fontSize: 13, marginBottom: 12 }}>{error}</div>}
          <button style={{ ...S.btn("primary"), width: "100%", justifyContent: "center", padding: "12px" }} type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
