import { useEffect, useState } from "react";

export default function Toast({ msg, type, onClose }) {
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  // Monitor live viewport alterations
  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    
    // Toast auto-expiry timer hook
    const t = setTimeout(onClose, 3000);
    
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(t);
    };
  }, [onClose]);

  const isPhone = screenWidth < 480;

  // ─── DYNAMIC RESPONSIVE BREAKPOINT OVERRIDES ───
  const responsiveToastStyle = {
    position: "fixed",
    bottom: isPhone ? 16 : 24,
    // Center notification box on smartphones, dock it to bottom-right corner on desktops
    right: isPhone ? "auto" : 24,
    left: isPhone ? "50%" : "auto",
    transform: isPhone ? "translateX(-50%)" : "none",
    
    width: isPhone ? "calc(100% - 32px)" : "auto", // Enforces comfortable side margins on mobile
    maxWidth: isPhone ? "340px" : "400px",
    textAlign: isPhone ? "center" : "left",
    
    zIndex: 9999,
    background: type === "error" ? "#e74c3c" : "#2ecc71",
    color: "#fff",
    padding: "12px 20px",
    borderRadius: 10,
    fontWeight: 600,
    fontSize: 14,
    boxShadow: "0 4px 12px rgba(0,0,0,.2)",
    boxSizing: "border-box",
    wordBreak: "break-word" // Protects layout frames from extra-long text strings
  };

  return (
    <div style={responsiveToastStyle}>
      {msg}
    </div>
  );
}
