import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { TrendingUp, Mail, Send, Eye, ArrowRight, Zap, Briefcase } from "lucide-react";
import { API_BASE_URL } from "../config/api";

function StatCard({ label, value, sub, accent, icon: Icon }: { label: string; value: string; sub: string; accent: string; icon: any }) {
  return (
    <div style={{
      background: "var(--bg-surface)",
      border: "1px solid var(--border)",
      borderRadius: 14,
      padding: "20px 22px",
      display: "flex", flexDirection: "column", gap: 12,
      boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
      transition: "border-color 0.15s, box-shadow 0.15s",
      cursor: "default",
    }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.borderColor = "var(--border-strong)";
        (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
        (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 4px rgba(0,0,0,0.05)";
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span className="label-caps">{label}</span>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: `${accent}15`,
          border: `1px solid ${accent}35`,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: accent,
        }}>
          <Icon size={14} />
        </div>
      </div>
      <div>
        <div style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.03em", lineHeight: 1 }}>
          {value}
        </div>
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6, fontWeight: 500 }}>{sub}</div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [briefing, setBriefing] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBriefing = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/dashboard/daily-briefing`);
        if (res.ok) setBriefing(await res.json());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchBriefing();
  }, []);

  const openRate = briefing?.emails_sent > 0
    ? Math.round((briefing.emails_opened / briefing.emails_sent) * 100)
    : 0;
  const openRateAccent = openRate >= 30 ? "var(--green)" : openRate >= 15 ? "var(--amber)" : "var(--red)";

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
            Good morning, Linus 👋
          </h2>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4, fontWeight: 500 }}>
            Your autonomous sales pipeline summary for today.
          </p>
        </div>
        <Link to="/discovery" className="btn-primary" style={{ flexShrink: 0, marginTop: 2 }}>
          <Zap size={13} /> Run Discovery
        </Link>
      </div>

      {/* Stat cards */}
      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{
              height: 110, borderRadius: 14,
              background: "var(--bg-elevated)",
              border: "1px solid var(--border)",
              animation: "pulse-dot 1.5s infinite",
            }} />
          ))}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
          <StatCard label="Pipeline Value" value={`$${briefing?.pipeline_value?.toLocaleString() ?? "0"}`} sub="Weighted deal opportunities" accent="var(--green)" icon={TrendingUp} />
          <StatCard label="Drafts Ready"   value={String(briefing?.drafts_ready ?? 0)}                     sub="AI outreach ready to send"  accent="var(--blue)"  icon={Mail} />
          <StatCard label="Emails Sent"    value={String(briefing?.emails_sent ?? 0)}                      sub="Outreach delivered"         accent="var(--text-muted)" icon={Send} />
          <StatCard label="Open Rate"      value={`${openRate}%`}                                          sub="Recipient engagement"       accent={openRateAccent} icon={Eye} />
        </div>
      )}

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 18 }}>

        {/* Priority accounts */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>
              Today's Priority Accounts
            </h3>
            <span style={{
              fontSize: 10, fontWeight: 700, color: "var(--text-muted)",
              background: "var(--bg-elevated)", border: "1px solid var(--border)",
              borderRadius: 20, padding: "3px 10px", letterSpacing: "0.05em", textTransform: "uppercase",
            }}>
              Ranked by opportunity
            </span>
          </div>

          {loading ? (
            <div style={{ height: 120, borderRadius: 14, background: "var(--bg-elevated)", border: "1px solid var(--border)" }} />
          ) : briefing?.top_priorities?.length === 0 ? (
            <div style={{
              background: "var(--bg-surface)", border: "1px solid var(--border)",
              borderRadius: 14, padding: "40px 24px", textAlign: "center",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: "var(--bg-elevated)", border: "1px solid var(--border)",
                display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)",
              }}>
                <Briefcase size={18} />
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-secondary)" }}>Priority queue is clear</p>
                <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
                  Run Prospect Discovery to find high-value leads.
                </p>
              </div>
              <Link to="/discovery" className="btn-primary" style={{ marginTop: 4 }}>Launch Discovery</Link>
            </div>
          ) : (
            briefing?.top_priorities?.map((priority: any, index: number) => (
              <div key={index} style={{
                background: "var(--bg-surface)", border: "1px solid var(--border)",
                borderRadius: 14, padding: "18px 20px",
                boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                transition: "border-color 0.12s, box-shadow 0.12s",
              }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--border-strong)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)";
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <h4 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>{priority.company_name}</h4>
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: "2px 8px",
                        background: "var(--bg-elevated)", border: "1px solid var(--border)",
                        borderRadius: 20, color: "var(--text-muted)", letterSpacing: "0.04em",
                      }}>
                        Score {priority.priority_score ?? 95}
                      </span>
                    </div>
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: "3px 8px",
                      background: "var(--green-dim)", color: "var(--green-text)",
                      border: "1px solid var(--green-border)", borderRadius: 6, display: "inline-block",
                    }}>
                      Est. ${priority.estimated_value?.toLocaleString() ?? "3,500"}
                    </span>
                  </div>
                  <Link to={`/companies/${priority.company_id}`} className="btn-primary" style={{ flexShrink: 0, fontSize: 11 }}>
                    Review & Send <ArrowRight size={12} />
                  </Link>
                </div>
                <div style={{
                  background: "var(--bg-elevated)", borderLeft: "3px solid var(--border-strong)",
                  borderRadius: "0 6px 6px 0", padding: "10px 14px",
                }}>
                  <p className="label-caps" style={{ marginBottom: 5 }}>AI Context</p>
                  <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6, fontWeight: 400 }}>
                    {priority.sales_coach_advice || priority.why_today ||
                      "High deal potential identified. Automated booking and customer payment portal recommended."}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Quick actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>Quick Actions</h3>
          <div style={{
            background: "var(--bg-surface)", border: "1px solid var(--border)",
            borderRadius: 14, overflow: "hidden",
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          }}>
            {[
              { to: "/companies", icon: Mail,      label: "Outreach Drafts",    sub: "Ready for review",     badge: briefing?.drafts_ready ?? 0, badgeColor: "var(--green-text)", badgeBg: "var(--green-dim)", badgeBorder: "var(--green-border)" },
              { to: "/discovery", icon: Zap,       label: "Prospect Discovery", sub: "Search Google Places",  badge: "Active",                    badgeColor: "var(--blue-text)",  badgeBg: "var(--blue-dim)",  badgeBorder: "var(--blue-border)" },
              { to: "/deals",     icon: TrendingUp, label: "Deals Pipeline",     sub: "Track & close",        badge: null,                        badgeColor: null,                badgeBg: null,               badgeBorder: null },
            ].map((item, i, arr) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "13px 15px", textDecoration: "none",
                    borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none",
                    transition: "background 0.12s",
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--bg-hover)"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 30, height: 30, borderRadius: 7,
                      background: "var(--bg-elevated)", border: "1px solid var(--border)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "var(--text-muted)",
                    }}>
                      <Icon size={13} />
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)" }}>{item.label}</div>
                      <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 1 }}>{item.sub}</div>
                    </div>
                  </div>
                  {item.badge !== null && (
                    <span style={{
                      fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 20,
                      background: item.badgeBg!, color: item.badgeColor!, border: `1px solid ${item.badgeBorder}`,
                    }}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {!loading && (
            <div style={{
              background: "var(--green-dim)", border: "1px solid var(--green-border)",
              borderRadius: 12, padding: "14px 16px",
            }}>
              <p className="label-caps" style={{ color: "var(--green-text)", marginBottom: 8 }}>AI Briefing</p>
              <p style={{ fontSize: 11, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                {briefing?.top_priorities?.length > 0
                  ? `${briefing.top_priorities.length} high-priority accounts need attention. ${briefing.drafts_ready ?? 0} outreach drafts ready to send.`
                  : "No priority accounts yet. Run Prospect Discovery to populate your pipeline."
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
