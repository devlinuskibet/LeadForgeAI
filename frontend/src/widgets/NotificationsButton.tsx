import { useState } from "react";
import { Bell } from "lucide-react";

export default function NotificationsButton() {
  const [isOpen, setIsOpen] = useState(false);

  const notifications = [
    { id: 1, text: "John Doe opened your email", time: "5m ago", unread: true },
    { id: 2, text: "New lead assigned: TechCorp", time: "1h ago", unread: true },
    { id: 3, text: "Acme Corp meeting in 30 minutes", time: "2h ago", unread: false },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: "relative",
          width: 34, height: 34, borderRadius: 9,
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.07)",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", color: "#64748b",
          transition: "all 0.15s",
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)";
          (e.currentTarget as HTMLElement).style.color = "#94a3b8";
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)";
          (e.currentTarget as HTMLElement).style.color = "#64748b";
        }}
      >
        <Bell size={14} />
        {unreadCount > 0 && (
          <span style={{
            position: "absolute", top: 6, right: 6,
            width: 6, height: 6, borderRadius: "50%",
            background: "#22c55e", border: "1.5px solid #0a0b0d",
          }} />
        )}
      </button>

      {isOpen && (
        <div style={{
          position: "absolute", right: 0, top: "calc(100% + 10px)",
          width: 300,
          background: "#111318",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 14,
          overflow: "hidden",
          zIndex: 50,
          boxShadow: "0 16px 48px rgba(0,0,0,0.5)",
        }}>
          <div style={{
            padding: "12px 16px",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#f1f5f9" }}>Alerts</span>
              {unreadCount > 0 && (
                <span style={{
                  fontSize: 9, fontWeight: 800, padding: "2px 6px", borderRadius: 20,
                  background: "var(--green-dim)", color: "var(--green)", border: "1px solid var(--green-border)",
                }}>
                  {unreadCount} new
                </span>
              )}
            </div>
            <button style={{ fontSize: 10, fontWeight: 600, color: "#475569", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>
              Mark all read
            </button>
          </div>
          <div style={{ maxHeight: 280, overflowY: "auto" }}>
            {notifications.map(n => (
              <div key={n.id} style={{
                padding: "12px 16px",
                borderBottom: "1px solid rgba(255,255,255,0.04)",
                background: n.unread ? "rgba(34,197,94,0.04)" : "transparent",
                transition: "background 0.1s",
              }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: "#f1f5f9" }}>{n.text}</p>
                <p style={{ fontSize: 10, color: "#475569", marginTop: 3 }}>{n.time}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
