import { useState, useEffect } from "react";
import { DollarSign, Trophy, TrendingUp, Sparkles, FileText, CheckCircle2, X } from "lucide-react";

import { API_BASE_URL } from "../config/api";
import { formatCurrency } from "../utils/currency";

interface Deal { id: string; name: string; amount: number; status: "OPEN" | "WON" | "LOST"; company_id: string; company_name: string; }
interface DealMetrics { total_open_value: number; total_won_value: number; total_lost_value: number; total_deals_count: number; win_rate_percentage: number; }

function MetricCard({ label, value, accent, icon: Icon }: { label: string; value: string; accent: string; icon: any }) {
  return (
    <div style={{
      background: "var(--bg-surface)", border: "1px solid var(--border)",
      borderRadius: 12, padding: "16px 20px",
      display: "flex", alignItems: "center", gap: 14,
      boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 9, flexShrink: 0,
        background: `${accent}15`, border: `1px solid ${accent}30`,
        display: "flex", alignItems: "center", justifyContent: "center", color: accent,
      }}>
        <Icon size={16} />
      </div>
      <div>
        <p className="label-caps" style={{ marginBottom: 4 }}>{label}</p>
        <p style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.03em" }}>{value}</p>
      </div>
    </div>
  );
}

function KanbanCard({ deal, onWon, onLost, onReopen, onProposal, type }: any) {
  const isLost = type === "lost";
  const isWon  = type === "won";
  return (
    <div style={{
      background: "var(--bg-surface)", border: "1px solid var(--border)",
      borderRadius: 10, padding: 14, display: "flex", flexDirection: "column", gap: 10,
      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <h4 style={{ fontSize: 12, fontWeight: 700, color: isLost ? "var(--text-muted)" : "var(--text-primary)" }}>{deal.name}</h4>
        <span style={{
          fontSize: 11, fontWeight: 800, padding: "2px 8px", borderRadius: 6,
          background: isWon ? "var(--green-dim)" : isLost ? "var(--bg-elevated)" : "var(--blue-dim)",
          color: isWon ? "var(--green-text)" : isLost ? "var(--text-muted)" : "var(--blue-text)",
          border: `1px solid ${isWon ? "var(--green-border)" : isLost ? "var(--border)" : "var(--blue-border)"}`,
        }}>
          {formatCurrency(deal.amount)}
        </span>
      </div>
      <p style={{ fontSize: 11, color: "var(--text-muted)" }}>{deal.company_name}</p>

      {isWon && (
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <CheckCircle2 size={11} color="var(--green)" />
          <span style={{ fontSize: 10, fontWeight: 700, color: "var(--green-text)" }}>Deal Converted</span>
        </div>
      )}

      {!isWon && !isLost && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 8, borderTop: "1px solid var(--border)" }}>
          <button onClick={() => onProposal(deal.company_id)} style={{
            fontSize: 11, fontWeight: 600, color: "var(--text-muted)",
            background: "none", border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", gap: 4, fontFamily: "inherit",
          }}>
            <Sparkles size={11} /> Proposal
          </button>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={() => onWon(deal.id)} style={{
              padding: "4px 10px", borderRadius: 6, fontSize: 10, fontWeight: 700,
              background: "var(--green-dim)", color: "var(--green-text)", border: "1px solid var(--green-border)",
              cursor: "pointer", fontFamily: "inherit",
            }}>Won ✓</button>
            <button onClick={() => onLost(deal.id)} style={{
              padding: "4px 10px", borderRadius: 6, fontSize: 10, fontWeight: 700,
              background: "var(--red-dim)", color: "var(--red-text)", border: "1px solid var(--red-border)",
              cursor: "pointer", fontFamily: "inherit",
            }}>Lost</button>
          </div>
        </div>
      )}

      {isLost && (
        <button onClick={() => onReopen(deal.id)} style={{
          fontSize: 10, fontWeight: 600, color: "var(--blue-text)",
          background: "none", border: "none", cursor: "pointer",
          textAlign: "left", fontFamily: "inherit",
        }}>
          ↩ Reopen Deal
        </button>
      )}
    </div>
  );
}

function KanbanColumn({ title, count, accentColor, borderColor, children }: any) {
  return (
    <div style={{
      background: "var(--bg-elevated)", border: `1px solid ${borderColor}`,
      borderRadius: 14, padding: 14,
      display: "flex", flexDirection: "column", gap: 10, minHeight: 280,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: accentColor }} />
        <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)" }}>{title}</span>
        <span style={{
          fontSize: 10, fontWeight: 800, padding: "2px 7px", borderRadius: 20,
          background: `${accentColor}18`, color: accentColor, border: `1px solid ${accentColor}30`,
          marginLeft: "auto",
        }}>{count}</span>
      </div>
      {children}
    </div>
  );
}

export default function Deals() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [metrics, setMetrics] = useState<DealMetrics | null>(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [proposal, setProposal] = useState<any>(null);
  const [loadingProposal, setLoadingProposal] = useState(false);

  const fetchDeals = async () => {
    try {
      const [r1, r2] = await Promise.all([
        fetch(`${API_BASE_URL}/api/deals/`),
        fetch(`${API_BASE_URL}/api/deals/metrics`),
      ]);
      if (r1.ok) setDeals(await r1.json());
      if (r2.ok) setMetrics(await r2.json());
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchDeals(); }, []);

  const updateStatus = async (id: string, s: "OPEN" | "WON" | "LOST") => {
    await fetch(`${API_BASE_URL}/api/deals/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: s }) });
    fetchDeals();
  };

  const generateProposal = async (companyId: string) => {
    setSelectedCompanyId(companyId); setLoadingProposal(true);
    try {
      const r = await fetch(`${API_BASE_URL}/api/deals/company/${companyId}/generate-proposal`, { method: "POST" });
      if (r.ok) setProposal(await r.json());
    } catch (e) { console.error(e); }
    finally { setLoadingProposal(false); }
  };

  const wr = metrics?.win_rate_percentage ?? 0;
  const wrColor = wr >= 50 ? "var(--green)" : wr >= 25 ? "var(--amber)" : "var(--red)";

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", flexDirection: "column", gap: 22 }}>

      <div>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>Deals & Revenue Pipeline</h2>
        <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4, fontWeight: 500 }}>Track deal conversions, active opportunities, and AI-generated proposals.</p>
      </div>

      {/* Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
        <MetricCard label="Pipeline Value" value={formatCurrency(metrics?.total_open_value)} accent="var(--blue)"  icon={DollarSign} />
        <MetricCard label="Won Revenue"    value={formatCurrency(metrics?.total_won_value)}  accent="var(--green)" icon={Trophy} />
        <MetricCard label="Win Rate"       value={`${wr}%`}                                                  accent={wrColor}      icon={TrendingUp} />
        <MetricCard label="Total Deals"    value={String(metrics?.total_deals_count ?? 0)}                   accent="var(--text-muted)" icon={FileText} />
      </div>

      {/* Kanban */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
        <KanbanColumn title="Active Opportunities" count={deals.filter(d => d.status === "OPEN").length}  accentColor="var(--blue)"  borderColor="var(--blue-border)">
          {deals.filter(d => d.status === "OPEN").map(d => (
            <KanbanCard key={d.id} deal={d} type="open" onWon={() => updateStatus(d.id, "WON")} onLost={() => updateStatus(d.id, "LOST")} onProposal={generateProposal} />
          ))}
          {deals.filter(d => d.status === "OPEN").length === 0 && (
            <p style={{ fontSize: 11, color: "var(--text-muted)", textAlign: "center", padding: "24px 0" }}>No active deals</p>
          )}
        </KanbanColumn>

        <KanbanColumn title="Closed Won" count={deals.filter(d => d.status === "WON").length}  accentColor="var(--green)" borderColor="var(--green-border)">
          {deals.filter(d => d.status === "WON").map(d => (
            <KanbanCard key={d.id} deal={d} type="won" />
          ))}
          {deals.filter(d => d.status === "WON").length === 0 && (
            <p style={{ fontSize: 11, color: "var(--text-muted)", textAlign: "center", padding: "24px 0" }}>No won deals yet</p>
          )}
        </KanbanColumn>

        <KanbanColumn title="Closed Lost" count={deals.filter(d => d.status === "LOST").length} accentColor="var(--red)"   borderColor="var(--red-border)">
          {deals.filter(d => d.status === "LOST").map(d => (
            <KanbanCard key={d.id} deal={d} type="lost" onReopen={() => updateStatus(d.id, "OPEN")} />
          ))}
          {deals.filter(d => d.status === "LOST").length === 0 && (
            <p style={{ fontSize: 11, color: "var(--text-muted)", textAlign: "center", padding: "24px 0" }}>No lost deals</p>
          )}
        </KanbanColumn>
      </div>

      {/* Proposal modal */}
      {selectedCompanyId && (
        <div style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 20,
        }}>
          <div style={{
            background: "var(--bg-surface)", border: "1px solid var(--border)",
            borderRadius: 18, padding: 28, maxWidth: 560, width: "100%",
            maxHeight: "85vh", overflowY: "auto",
            boxShadow: "0 32px 80px rgba(0,0,0,0.18)",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22, paddingBottom: 18, borderBottom: "1px solid var(--border)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 9,
                  background: "var(--bg-elevated)", border: "1px solid var(--border)",
                  display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)",
                }}>
                  <Sparkles size={15} />
                </div>
                <div>
                  <h3 style={{ fontSize: 14, fontWeight: 800, color: "var(--text-primary)" }}>AI Solution Proposal</h3>
                  <p style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>Generated from website intelligence</p>
                </div>
              </div>
              <button onClick={() => { setSelectedCompanyId(null); setProposal(null); }} style={{
                background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 7, padding: 7, cursor: "pointer", color: "var(--text-muted)",
              }}><X size={14} /></button>
            </div>

            {loadingProposal ? (
              <div style={{ padding: "48px 0", textAlign: "center" }}>
                <div style={{ width: 32, height: 32, border: "3px solid var(--border)", borderTopColor: "var(--text-primary)", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
                <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)" }}>Synthesizing proposal…</p>
              </div>
            ) : proposal ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px 18px" }}>
                  <h4 style={{ fontSize: 15, fontWeight: 800, color: "var(--text-primary)" }}>{proposal.title}</h4>
                  <p style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 8, lineHeight: 1.7 }}>{proposal.executive_summary}</p>
                </div>

                <div>
                  <p className="label-caps" style={{ marginBottom: 10 }}>Scope Modules & Investment</p>
                  {proposal.scope_items.map((item: any, idx: number) => (
                    <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 9, marginBottom: 8 }}>
                      <div>
                        <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)" }}>{item.module}</p>
                        <span style={{ fontSize: 10, color: "var(--blue-text)", fontWeight: 600 }}>Confidence: {item.confidence}</span>
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 800, padding: "4px 10px", borderRadius: 7, background: "var(--green-dim)", color: "var(--green-text)", border: "1px solid var(--green-border)" }}>
                        ${item.estimated_price?.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", background: "var(--green-dim)", border: "1px solid var(--green-border)", borderRadius: 12 }}>
                  <span className="label-caps" style={{ color: "var(--green-text)" }}>Total Solution Value</span>
                  <span style={{ fontSize: 22, fontWeight: 800, color: "var(--green-text)", letterSpacing: "-0.03em" }}>
                    ${proposal.total_estimated_value?.toLocaleString()} USD
                  </span>
                </div>
              </div>
            ) : (
              <div style={{ padding: "48px 0", textAlign: "center", color: "var(--text-muted)", fontSize: 12 }}>
                Failed to generate proposal.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
