import { useState } from "react";
import { Building2, Users, Puzzle, ToggleLeft, Sliders, Play, Activity } from "lucide-react";
import { API_BASE_URL } from "../config/api";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("organization");
  const [isSmtpModalOpen, setIsSmtpModalOpen] = useState(false);
  const [smtpHost, setSmtpHost] = useState("smtp.gmail.com");
  const [smtpPort, setSmtpPort] = useState("587");
  const [smtpUser, setSmtpUser] = useState("leadforge1.ai@gmail.com");
  const [smtpPass, setSmtpPass] = useState("");
  const [smtpConnecting, setSmtpConnecting] = useState(false);
  const [smtpSuccess, setSmtpSuccess] = useState(false);
  const [smtpError, setSmtpError] = useState<string | null>(null);

  const sidebarNavs = [
    { id: "organization", label: "Organization", icon: Building2 },
    { id: "roles", label: "Users & Roles", icon: Users },
    { id: "integrations", label: "Integrations", icon: Puzzle },
    { id: "features", label: "Feature Flags", icon: ToggleLeft },
  ];

  const aiNavs = [
    { id: "ai_settings", label: "AI Settings & Prompts", icon: Sliders },
    { id: "ai_playground", label: "AI Playground", icon: Play },
    { id: "ai_usage", label: "AI Usage & Telemetry", icon: Activity },
  ];

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
          Platform Settings
        </h2>
        <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4, fontWeight: 500 }}>
          Manage your organization, team permissions, integrations, and AI engine parameters.
        </p>
      </div>

      {/* Main Container */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "240px 1fr",
        gap: 0,
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        minHeight: 520,
      }}>
        {/* Sidebar */}
        <div style={{
          background: "var(--bg-elevated)",
          borderRight: "1px solid var(--border)",
          padding: "20px 12px",
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}>
          <div>
            <span className="label-caps" style={{ display: "block", padding: "0 10px 8px 10px" }}>General</span>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {sidebarNavs.map(nav => {
                const Icon = nav.icon;
                const isActive = activeTab === nav.id;
                return (
                  <button
                    key={nav.id}
                    onClick={() => setActiveTab(nav.id)}
                    style={{
                      display: "flex", alignItems: "center", gap: 9,
                      padding: "9px 12px", borderRadius: 8,
                      fontSize: 12, fontWeight: isActive ? 700 : 500,
                      background: isActive ? "#111827" : "transparent",
                      color: isActive ? "#ffffff" : "var(--text-secondary)",
                      border: "none", cursor: "pointer", fontFamily: "inherit",
                      textAlign: "left", transition: "all 0.12s",
                    }}
                  >
                    <Icon size={14} style={{ opacity: isActive ? 1 : 0.7 }} />
                    {nav.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <span className="label-caps" style={{ display: "block", padding: "0 10px 8px 10px" }}>AI Engine</span>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {aiNavs.map(nav => {
                const Icon = nav.icon;
                const isActive = activeTab === nav.id;
                return (
                  <button
                    key={nav.id}
                    onClick={() => setActiveTab(nav.id)}
                    style={{
                      display: "flex", alignItems: "center", gap: 9,
                      padding: "9px 12px", borderRadius: 8,
                      fontSize: 12, fontWeight: isActive ? 700 : 500,
                      background: isActive ? "#111827" : "transparent",
                      color: isActive ? "#ffffff" : "var(--text-secondary)",
                      border: "none", cursor: "pointer", fontFamily: "inherit",
                      textAlign: "left", transition: "all 0.12s",
                    }}
                  >
                    <Icon size={14} style={{ opacity: isActive ? 1 : 0.7 }} />
                    {nav.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Content Pane */}
        <div style={{ padding: "28px 32px", overflowY: "auto" }}>
          {activeTab === "organization" && (
            <div style={{ maxWidth: 480, display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--text-primary)" }}>Organization Details</h3>
                <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>Manage core company identity</p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label className="label-caps" style={{ display: "block", marginBottom: 6 }}>Organization Name</label>
                  <input type="text" defaultValue="Acme Sales Corp" className="glass-input" />
                </div>
                <div>
                  <label className="label-caps" style={{ display: "block", marginBottom: 6 }}>Primary Administrator Email</label>
                  <input type="email" defaultValue="linus@leadforge.ai" className="glass-input" />
                </div>
                <button className="btn-primary" style={{ alignSelf: "flex-start", marginTop: 4 }}>Save Changes</button>
              </div>
            </div>
          )}

          {activeTab === "roles" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--text-primary)" }}>Users & Roles</h3>
                <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>Manage account seats and workspace permissions</p>
              </div>

              <div style={{ border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "var(--bg-elevated)", borderBottom: "1px solid var(--border)" }}>
                      <th style={{ padding: "10px 16px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>User</th>
                      <th style={{ padding: "10px 16px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Role</th>
                      <th style={{ padding: "10px 16px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ padding: "14px 16px", fontSize: 12, fontWeight: 700, color: "var(--text-primary)" }}>Linus Kibet (linus@leadforge.ai)</td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{ fontSize: 10, fontWeight: 800, padding: "3px 8px", borderRadius: 6, background: "var(--blue-dim)", color: "var(--blue-text)", border: "1px solid var(--blue-border)" }}>Super Admin</span>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{ fontSize: 10, fontWeight: 800, padding: "3px 8px", borderRadius: 6, background: "var(--green-dim)", color: "var(--green-text)", border: "1px solid var(--green-border)" }}>Active</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "integrations" && (
            <div style={{ maxWidth: 640, display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--text-primary)" }}>Connected Integrations & Email Dispatchers</h3>
                <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>Sync live email delivery providers, SendGrid API, and Google Workspace SMTP</p>
              </div>

              {/* 1. Active SendGrid Live Delivery Provider */}
              <div style={{
                padding: "18px 20px", background: "var(--bg-elevated)", border: "1px solid var(--border)",
                borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14,
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <h4 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>SendGrid Cloud Dispatcher</h4>
                    <span style={{
                      fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 20,
                      background: "var(--green-dim)", color: "var(--green-text)", border: "1px solid var(--green-border)"
                    }}>Active & Verified</span>
                  </div>
                  <p style={{ fontSize: 11, color: "var(--text-muted)" }}>
                    Verified Sender: <strong style={{ color: "var(--text-primary)" }}>leadforge1.ai@gmail.com</strong>
                  </p>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                    API Key: <code style={{ fontSize: 10, background: "var(--bg-surface)", padding: "2px 6px", borderRadius: 4 }}>SG.UGqr...3mIs</code> (Live SendGrid Dispatch Active)
                  </p>
                </div>
                <button onClick={() => alert("SendGrid integration is verified and actively dispatching emails from leadforge1.ai@gmail.com.")}
                  className="btn-ghost" style={{ fontSize: 11, flexShrink: 0 }}>
                  Manage
                </button>
              </div>

              {/* 2. Google Workspace SMTP Connector */}
              <div style={{
                padding: "18px 20px", background: "var(--bg-elevated)", border: "1px solid var(--border)",
                borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14,
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
              }}>
                <div>
                  <h4 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>Google Workspace (SMTP/IMAP)</h4>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 3 }}>Connect your custom sales inbox (Gmail/Outlook) for automated outreach dispatching.</p>
                </div>
                <button onClick={() => setIsSmtpModalOpen(true)} className="btn-primary" style={{ fontSize: 11, flexShrink: 0 }}>
                  Connect
                </button>
              </div>
            </div>
          )}

          {activeTab === "features" && (
            <div style={{ maxWidth: 540, display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--text-primary)" }}>Feature Flags</h3>
                <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>Enable or disable experimental features</p>
              </div>

              {[
                { title: "AI Outreach Generator", desc: "Allow automatic synthesis of personalized proposal emails." },
                { title: "Live Telemetry Terminal", desc: "Show real-time scraping & LLM execution logs on discovery page." },
              ].map(f => (
                <div key={f.title} style={{
                  padding: "16px 20px", background: "var(--bg-elevated)", border: "1px solid var(--border)",
                  borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14,
                }}>
                  <div>
                    <h4 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{f.title}</h4>
                    <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 3 }}>{f.desc}</p>
                  </div>
                  <input type="checkbox" defaultChecked style={{ accentColor: "#111827", width: 16, height: 16, cursor: "pointer" }} />
                </div>
              ))}
            </div>
          )}

          {activeTab === "ai_settings" && (
            <div style={{ maxWidth: 480, display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--text-primary)" }}>AI Engine Parameters</h3>
                <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>Configure backend AI execution behavior</p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label className="label-caps" style={{ display: "block", marginBottom: 6 }}>AI Provider</label>
                  <select className="glass-input" style={{ cursor: "pointer" }}>
                    <option value="mock">Mock Provider (Local Testing)</option>
                    <option value="mimo">MiMo / OpenAI Compatible Endpoint</option>
                  </select>
                </div>
                <div>
                  <label className="label-caps" style={{ display: "block", marginBottom: 6 }}>Default Model Name</label>
                  <input type="text" defaultValue="gemini-flash" className="glass-input" />
                </div>
                <div>
                  <label className="label-caps" style={{ display: "block", marginBottom: 6 }}>Max Retries</label>
                  <input type="number" defaultValue={3} className="glass-input" />
                </div>
                <button className="btn-primary" style={{ alignSelf: "flex-start", marginTop: 4 }}>Save AI Configuration</button>
              </div>
            </div>
          )}

          {activeTab === "ai_playground" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16, height: "100%" }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--text-primary)" }}>AI Playground</h3>
                <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>Test prompts and view raw model completions</p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div>
                    <label className="label-caps" style={{ display: "block", marginBottom: 6 }}>Select Prompt Template</label>
                    <select className="glass-input" style={{ cursor: "pointer" }}>
                      <option>Email Outreach Synthesizer (v2)</option>
                      <option>Website Intelligence Analyzer (v1)</option>
                    </select>
                  </div>
                  <div>
                    <label className="label-caps" style={{ display: "block", marginBottom: 6 }}>Template Source</label>
                    <textarea readOnly className="glass-input" style={{ height: 100, fontFamily: "monospace", fontSize: 11, color: "var(--text-secondary)" }}
                      value={"Write a high-converting sales proposal email for {{company_name}} focusing on {{pain_point}}."} />
                  </div>
                  <button className="btn-primary" style={{ justifyContent: "center" }}>Run Test Completion</button>
                </div>

                <div style={{
                  background: "var(--bg-elevated)", border: "1px solid var(--border)",
                  borderRadius: 12, padding: 16, display: "flex", flexDirection: "column", gap: 8,
                }}>
                  <span className="label-caps">Completion Output</span>
                  <div style={{
                    flex: 1, minHeight: 180, background: "var(--bg-surface)",
                    border: "1px solid var(--border)", borderRadius: 8, padding: 14,
                    fontSize: 11, fontFamily: "monospace", color: "var(--text-secondary)",
                    lineHeight: 1.6, overflowY: "auto",
                  }}>
                    Subject: Digital Transformation Opportunity for Zawadi Apartments{"\n\n"}
                    Hi Linus,{"\n\n"}
                    We noticed your website currently requires manual phone inquiries for bookings. Our AI Digital Booking & Admissions Portal can automate this workflow...
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "ai_usage" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--text-primary)" }}>AI Usage & Telemetry</h3>
                <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>Monitor API call counts and execution time</p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                {[
                  { label: "Total Requests", val: "1,240", color: "var(--text-primary)" },
                  { label: "Cache Hit Rate", val: "94.2%", color: "var(--green)" },
                  { label: "Avg Latency", val: "1.2s", color: "var(--blue)" },
                ].map(s => (
                  <div key={s.label} style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px 18px" }}>
                    <span className="label-caps">{s.label}</span>
                    <p style={{ fontSize: 22, fontWeight: 800, color: s.color, marginTop: 6 }}>{s.val}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SMTP Connection Modal */}
      {isSmtpModalOpen && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 60,
          background: "rgba(17, 24, 39, 0.65)", backdropFilter: "blur(6px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 20
        }}>
          <div style={{
            background: "var(--bg-surface)", border: "1px solid var(--border)",
            borderRadius: 16, width: "100%", maxWidth: 480, overflow: "hidden",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)", padding: 24, display: "flex", flexDirection: "column", gap: 16
          }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--text-primary)" }}>Connect Google Workspace / Custom SMTP</h3>
              <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
                Enter your Gmail / Workspace App Password or custom SMTP server details to connect your sales inbox.
              </p>
            </div>

            {smtpSuccess && (
              <div style={{ padding: "10px 14px", background: "var(--green-dim)", border: "1px solid var(--green-border)", borderRadius: 8, fontSize: 12, fontWeight: 700, color: "var(--green-text)" }}>
                ✓ SMTP Connection Test Successful! Sales inbox linked.
              </div>
            )}

            {smtpError && (
              <div style={{ padding: "10px 14px", background: "var(--red-dim)", border: "1px solid var(--red-border)", borderRadius: 8, fontSize: 12, fontWeight: 600, color: "var(--red-text)" }}>
                ✕ {smtpError}
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label className="label-caps" style={{ display: "block", marginBottom: 6 }}>SMTP Host</label>
                <input type="text" value={smtpHost} onChange={e => setSmtpHost(e.target.value)} className="glass-input" placeholder="smtp.gmail.com" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 10 }}>
                <div>
                  <label className="label-caps" style={{ display: "block", marginBottom: 6 }}>Port</label>
                  <input type="text" value={smtpPort} onChange={e => setSmtpPort(e.target.value)} className="glass-input" placeholder="587" />
                </div>
                <div>
                  <label className="label-caps" style={{ display: "block", marginBottom: 6 }}>Sender Email</label>
                  <input type="email" value={smtpUser} onChange={e => setSmtpUser(e.target.value)} className="glass-input" placeholder="sales@yourcompany.com" />
                </div>
              </div>
              <div>
                <label className="label-caps" style={{ display: "block", marginBottom: 6 }}>App Password / API Key</label>
                <input type="password" value={smtpPass} onChange={e => setSmtpPass(e.target.value)} className="glass-input" placeholder="•••• •••• •••• ••••" />
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
              <button onClick={() => setIsSmtpModalOpen(false)} disabled={smtpConnecting} className="btn-ghost" style={{ fontSize: 12 }}>
                Cancel
              </button>
              <button onClick={async () => {
                if (!smtpUser || !smtpPass) {
                  setSmtpError("Please provide Sender Email and App Password.");
                  return;
                }
                setSmtpConnecting(true);
                setSmtpError(null);
                try {
                  const res = await fetch(`${API_BASE_URL}/api/emails/test-smtp`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      host: smtpHost,
                      port: parseInt(smtpPort) || 587,
                      user: smtpUser,
                      password: smtpPass,
                      recipient: smtpUser
                    })
                  });
                  if (!res.ok) {
                    const data = await res.json().catch(() => ({}));
                    throw new Error(data.detail || "Failed to verify SMTP credentials");
                  }
                  setSmtpSuccess(true);
                  setTimeout(() => { setIsSmtpModalOpen(false); setSmtpSuccess(false); }, 1800);
                } catch (e: any) {
                  setSmtpError(e.message || "Connection failed. Check host, port & App Password.");
                } finally {
                  setSmtpConnecting(false);
                }
              }} disabled={smtpConnecting} className="btn-primary" style={{ fontSize: 12 }}>
                {smtpConnecting ? "Testing Connection…" : "Save & Test Connection"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
