import { useState } from "react";
import { Building2, Users, Puzzle, ToggleLeft, Sliders, Play, Activity } from "lucide-react";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("organization");

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
            <div style={{ maxWidth: 540, display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--text-primary)" }}>Connected Integrations</h3>
                <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>Sync email providers and CRM webhooks</p>
              </div>

              <div style={{
                padding: "16px 20px", background: "var(--bg-elevated)", border: "1px solid var(--border)",
                borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14,
              }}>
                <div>
                  <h4 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>Google Workspace (SMTP/IMAP)</h4>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 3 }}>Connect your sales inbox for automated outreach dispatching.</p>
                </div>
                <button className="btn-ghost" style={{ flexShrink: 0 }}>Connect</button>
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
    </div>
  );
}
