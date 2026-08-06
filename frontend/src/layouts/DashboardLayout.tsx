import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, Settings, LogOut, Radar, DollarSign, Sparkles, Bell, Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";

function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    return (localStorage.getItem("lf-theme") as "light" | "dark") || "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("lf-theme", theme);
  }, [theme]);

  const toggle = () => setTheme(t => (t === "light" ? "dark" : "light"));
  return { theme, toggle };
}

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();

  const authUser = JSON.parse(localStorage.getItem("lf-auth-user") || '{"name":"Linus Kibet","role":"Administrator"}');

  const handleSignOut = () => {
    localStorage.removeItem("lf-auth-user");
    navigate("/login");
  };

  const navItems = [
    { label: "Overview",            path: "/app",          icon: LayoutDashboard },
    { label: "Companies & Leads",   path: "/app/companies", icon: Users },
    { label: "Prospect Discovery",  path: "/app/discovery", icon: Radar },
    { label: "Deals & Revenue",     path: "/app/deals",     icon: DollarSign },
    { label: "AI Management",       path: "/app/settings",  icon: Settings },
  ];

  const pageTitle: Record<string, string> = {
    "/app":           "Pipeline Overview",
    "/app/companies":  "Companies & Leads",
    "/app/discovery":  "Prospect Discovery",
    "/app/deals":      "Deals & Revenue",
    "/app/settings":   "AI Management",
  };

  const currentTitle = Object.entries(pageTitle)
    .reverse()
    .find(([p]) => p === "/app" ? location.pathname === "/app" : location.pathname.startsWith(p))?.[1] ?? "LeadForge";

  return (
    <div style={{
      display: "flex",
      height: "100vh",
      overflow: "hidden",
      background: "var(--bg-base)",
    }}>
      {/* ── Sidebar ── */}
      <aside style={{
        width: 228,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        background: "var(--sidebar-bg)",
        borderRight: "1px solid var(--sidebar-border)",
        zIndex: 20,
      }}>
        {/* Logo */}
        <div style={{
          height: 60,
          display: "flex",
          alignItems: "center",
          padding: "0 18px",
          borderBottom: "1px solid var(--sidebar-border)",
          gap: 10,
        }}>
          <div style={{
            width: 30, height: 30,
            borderRadius: 8,
            background: "#111827",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <Sparkles size={14} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em", lineHeight: 1 }}>
              LeadForge<span style={{ color: "var(--text-muted)", fontWeight: 400 }}>AI</span>
            </div>
            <div style={{ fontSize: 9, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 3 }}>
              Sales Engine
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "14px 10px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 2 }}>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = item.path === "/app"
              ? location.pathname === "/app"
              : location.pathname.startsWith(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  padding: "8px 11px",
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: isActive ? 700 : 500,
                  textDecoration: "none",
                  color: isActive ? "var(--sidebar-nav-active-color)" : "var(--sidebar-nav-color)",
                  background: isActive ? "var(--sidebar-nav-active-bg)" : "transparent",
                  transition: "all 0.12s",
                  letterSpacing: "0.01em",
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.background = "var(--sidebar-nav-hover-bg)";
                    (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                    (e.currentTarget as HTMLElement).style.color = "var(--sidebar-nav-color)";
                  }
                }}
              >
                <Icon size={14} style={{ flexShrink: 0, opacity: isActive ? 1 : 0.7 }} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User footer */}
        <div style={{
          padding: "12px 10px",
          borderTop: "1px solid var(--sidebar-border)",
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "8px 11px" }}>
            <div style={{
              width: 28, height: 28,
              borderRadius: "50%",
              background: "#111827",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 10, fontWeight: 800, color: "#fff",
              flexShrink: 0,
            }}>
              {(authUser.name || "L").charAt(0).toUpperCase()}
            </div>
            <div style={{ overflow: "hidden" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {authUser.name || "Linus Kibet"}
              </div>
              <div style={{ fontSize: 9, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 2 }}>
                {authUser.role || "Administrator"}
              </div>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              width: "100%", padding: "8px 11px",
              background: "transparent", border: "none",
              borderRadius: 8, cursor: "pointer",
              fontSize: 11, fontWeight: 600, color: "var(--text-muted)",
              transition: "all 0.12s", fontFamily: "inherit",
              textAlign: "left",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.color = "var(--red-text)";
              (e.currentTarget as HTMLElement).style.background = "var(--red-dim)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
              (e.currentTarget as HTMLElement).style.background = "transparent";
            }}
          >
            <LogOut size={13} /> Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Header */}
        <header style={{
          height: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
          background: "var(--header-bg)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--border)",
          flexShrink: 0,
          zIndex: 10,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <h1 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
              {currentTitle}
            </h1>
            {/* LIVE pill */}
            <div style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: "3px 9px",
              background: "var(--green-dim)",
              border: "1px solid var(--green-border)",
              borderRadius: 20,
            }}>
              <div className="dot-pulse" style={{ background: "var(--live-dot)" }} />
              <span style={{ fontSize: 10, fontWeight: 700, color: "var(--green-text)", letterSpacing: "0.05em" }}>LIVE</span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>

            {/* Theme toggle */}
            <button
              onClick={toggle}
              title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
              style={{
                width: 34, height: 34,
                borderRadius: 8,
                background: "var(--bg-elevated)",
                border: "1px solid var(--border)",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: "var(--text-secondary)",
                transition: "all 0.15s",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--border-strong)";
                (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
              }}
            >
              {theme === "light" ? <Moon size={14} /> : <Sun size={14} />}
            </button>

            {/* Notification bell */}
            <button
              style={{
                position: "relative",
                width: 34, height: 34,
                borderRadius: 8,
                background: "var(--bg-elevated)",
                border: "1px solid var(--border)",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: "var(--text-secondary)",
                transition: "all 0.15s",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--border-strong)";
                (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
              }}
            >
              <Bell size={14} />
              <span style={{
                position: "absolute", top: 7, right: 7,
                width: 5, height: 5,
                background: "var(--green)",
                borderRadius: "50%",
                border: "1.5px solid var(--bg-surface)",
              }} />
            </button>

            {/* Avatar */}
            <div style={{
              width: 32, height: 32,
              borderRadius: "50%",
              background: "#111827",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 800, color: "#fff",
              cursor: "pointer",
            }}>
              LK
            </div>
          </div>
        </header>

        {/* Page content */}
        <main style={{
          flex: 1,
          overflowY: "auto",
          padding: "28px 28px 40px",
          background: "var(--bg-base)",
        }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
