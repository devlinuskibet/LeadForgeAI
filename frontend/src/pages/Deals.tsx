import { useState, useEffect } from "react";
import { DollarSign, Trophy, TrendingUp, Sparkles, FileText, CheckCircle2, X, Search, Filter, Plus, Edit2, Trash2, Download, Calendar, MessageSquare } from "lucide-react";

import { API_BASE_URL } from "../config/api";
import { formatCurrency } from "../utils/currency";

interface Deal { id: string; name: string; amount: number; probability?: number; target_close_date?: string; status: "OPEN" | "WON" | "LOST"; company_id: string; company_name: string; }
interface DealMetrics { total_open_value: number; total_weighted_value?: number; total_won_value: number; total_lost_value: number; total_deals_count: number; win_rate_percentage: number; }

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

function KanbanCard({ deal, onWon, onLost, onReopen, onProposal, onEdit, onDelete, onAddNote, type }: any) {
  const isLost = type === "lost";
  const isWon  = type === "won";
  const prob = deal.probability || 75;
  return (
    <div style={{
      background: "var(--bg-surface)", border: "1px solid var(--border)",
      borderRadius: 10, padding: 14, display: "flex", flexDirection: "column", gap: 10,
      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <div>
          <h4 style={{ fontSize: 12, fontWeight: 700, color: isLost ? "var(--text-muted)" : "var(--text-primary)" }}>{deal.name}</h4>
          {!isLost && !isWon && (
            <span style={{ fontSize: 10, fontWeight: 700, color: "var(--blue-text)", marginTop: 2, display: "inline-block" }}>
              {prob}% Win Probability
            </span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          <button onClick={() => onAddNote(deal)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 2 }} title="Log Activity Note">
            <MessageSquare size={11} />
          </button>
          <button onClick={() => onEdit(deal)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 2 }} title="Edit Deal">
            <Edit2 size={11} />
          </button>
          <button onClick={() => onDelete(deal.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--red-text)", padding: 2 }} title="Delete Deal">
            <Trash2 size={11} />
          </button>
          <span style={{
            fontSize: 11, fontWeight: 800, padding: "2px 8px", borderRadius: 6,
            background: isWon ? "var(--green-dim)" : isLost ? "var(--bg-elevated)" : "var(--blue-dim)",
            color: isWon ? "var(--green-text)" : isLost ? "var(--text-muted)" : "var(--blue-text)",
            border: `1px solid ${isWon ? "var(--green-border)" : isLost ? "var(--border)" : "var(--blue-border)"}`,
          }}>
            {formatCurrency(deal.amount)}
          </span>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 11, color: "var(--text-muted)" }}>
        <span>{deal.company_name}</span>
        <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 10, fontWeight: 600 }}>
          <Calendar size={10} /> {deal.target_close_date ? new Date(deal.target_close_date).toLocaleDateString() : "Close Q3"}
        </span>
      </div>

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
  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [proposal, setProposal] = useState<any>(null);
  const [loadingProposal, setLoadingProposal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "OPEN" | "WON" | "LOST">("ALL");

  // Create Deal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newDealName, setNewDealName] = useState("");
  const [newDealAmount, setNewDealAmount] = useState("5000");
  const [newDealCompanyId, setNewDealCompanyId] = useState("");
  const [creatingDeal, setCreatingDeal] = useState(false);

  // Edit Deal state
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [editDealName, setEditDealName] = useState("");
  const [editDealAmount, setEditDealAmount] = useState("");
  const [updatingDeal, setUpdatingDeal] = useState(false);

  const openEditModal = (d: Deal) => {
    setEditingDeal(d);
    setEditDealName(d.name);
    setEditDealAmount(String(d.amount));
  };

  const handleUpdateDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDeal) return;
    setUpdatingDeal(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/deals/${editingDeal.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: editingDeal.status,
          name: editDealName,
          amount: parseFloat(editDealAmount) || 0
        })
      });
      if (res.ok) {
        setEditingDeal(null);
        fetchDeals();
      }
    } catch (err) { console.error(err); }
    finally { setUpdatingDeal(false); }
  };

  const fetchDeals = async () => {
    try {
      const [r1, r2, r3] = await Promise.all([
        fetch(`${API_BASE_URL}/api/deals/`),
        fetch(`${API_BASE_URL}/api/deals/metrics`),
        fetch(`${API_BASE_URL}/api/companies/`),
      ]);
      if (r1.ok) setDeals(await r1.json());
      if (r2.ok) setMetrics(await r2.json());
      if (r3.ok) {
        const compData = await r3.json();
        setCompanies(compData);
        if (compData.length > 0 && !newDealCompanyId) setNewDealCompanyId(compData[0].id);
      }
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchDeals(); }, []);

  const handleCreateDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDealName || !newDealCompanyId) return;
    setCreatingDeal(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/deals/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newDealName,
          amount: parseFloat(newDealAmount) || 0,
          company_id: newDealCompanyId,
          status: "OPEN"
        })
      });
      if (res.ok) {
        setIsCreateModalOpen(false);
        setNewDealName("");
        fetchDeals();
      }
    } catch (err) { console.error(err); }
    finally { setCreatingDeal(false); }
  };

  const handleAddNote = async (deal: Deal) => {
    const noteText = prompt(`Log activity note for deal "${deal.name}":`);
    if (!noteText || !noteText.trim()) return;
    try {
      await fetch(`${API_BASE_URL}/api/deals/${deal.id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: noteText.trim() })
      });
      alert("Activity note logged to company timeline successfully!");
    } catch (e) { console.error(e); }
  };

  const handleDeleteDeal = async (id: string) => {
    if (!confirm("Are you sure you want to delete this deal record?")) return;
    try {
      await fetch(`${API_BASE_URL}/api/deals/${id}`, { method: "DELETE" });
      fetchDeals();
    } catch (e) { console.error(e); }
  };

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

  const downloadProposalDoc = (p: any) => {
    if (!p) return;
    let content = `# ${p.title || "AI Solution Proposal"}\n\n`;
    content += `## Executive Summary\n${p.executive_summary || ""}\n\n`;
    content += `## Scope & Investment Breakdown\n`;
    (p.scope_items || []).forEach((item: any) => {
      content += `- **${item.module}**: $${item.estimated_price?.toLocaleString()} (Confidence: ${item.confidence})\n`;
    });
    content += `\n**Total Solution Value**: $${p.total_estimated_value?.toLocaleString()} USD\n`;
    
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Proposal_${(p.title || "LeadForge").replace(/[^a-zA-Z0-9]/g, "_")}.md`;
    a.click();
  };

  const filteredDeals = deals.filter(d => {
    const matchesSearch = !searchQuery || (d.name || "").toLowerCase().includes(searchQuery.toLowerCase()) || (d.company_name || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const wr = metrics?.win_rate_percentage ?? 0;
  const wrColor = wr >= 50 ? "var(--green)" : wr >= 25 ? "var(--amber)" : "var(--red)";

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", flexDirection: "column", gap: 22 }}>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>Deals & Revenue Pipeline</h2>
          <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4, fontWeight: 500 }}>Track deal conversions, active opportunities, and AI-generated proposals.</p>
        </div>
        <button onClick={() => setIsCreateModalOpen(true)} className="btn-primary" style={{ fontSize: 12, padding: "8px 16px" }}>
          <Plus size={14} /> Create New Deal
        </button>
      </div>

      {/* Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
        <MetricCard label="Pipeline Value" value={formatCurrency(metrics?.total_open_value)} accent="var(--blue)"  icon={DollarSign} />
        <MetricCard label="Weighted Forecast" value={formatCurrency(metrics?.total_weighted_value ?? ((metrics?.total_open_value || 0) * 0.75))} accent="#8b5cf6" icon={Sparkles} />
        <MetricCard label="Won Revenue"    value={formatCurrency(metrics?.total_won_value)}  accent="var(--green)" icon={Trophy} />
        <MetricCard label="Win Rate"       value={`${wr}%`}                                                  accent={wrColor}      icon={TrendingUp} />
        <MetricCard label="Total Deals"    value={String(metrics?.total_deals_count ?? 0)}                   accent="var(--text-muted)" icon={FileText} />
      </div>

      {/* Revenue Forecast Bar */}
      {(() => {
        const openVal = metrics?.total_open_value || 0;
        const wonVal = metrics?.total_won_value || 0;
        const lostVal = metrics?.total_lost_value || 0;
        const sumVal = openVal + wonVal + lostVal || 1;
        const openPct = Math.round((openVal / sumVal) * 100);
        const wonPct = Math.round((wonVal / sumVal) * 100);
        const lostPct = Math.min(100 - openPct - wonPct, 100);

        return (
          <div style={{
            padding: "16px 20px", background: "var(--bg-elevated)", border: "1px solid var(--border)",
            borderRadius: 14, display: "flex", flexDirection: "column", gap: 10
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12, fontWeight: 700 }}>
              <span style={{ color: "var(--text-primary)" }}>Pipeline Revenue Breakdown & Conversion Distribution</span>
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Total Tracked: {formatCurrency(sumVal)}</span>
            </div>

            {/* Segmented Progress Bar */}
            <div style={{ height: 8, width: "100%", background: "var(--bg-surface)", borderRadius: 6, overflow: "hidden", display: "flex" }}>
              <div style={{ width: `${openPct}%`, background: "var(--blue)", transition: "width 0.3s" }} title={`Active Open: ${openPct}%`} />
              <div style={{ width: `${wonPct}%`, background: "var(--green)", transition: "width 0.3s" }} title={`Closed Won: ${wonPct}%`} />
              <div style={{ width: `${lostPct}%`, background: "var(--red)", transition: "width 0.3s" }} title={`Closed Lost: ${lostPct}%`} />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 11, color: "var(--text-muted)" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--blue)" }} /> Active Open ({openPct}%)
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--green)" }} /> Closed Won ({wonPct}%)
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--red)" }} /> Closed Lost ({lostPct}%)
              </span>
            </div>
          </div>
        );
      })()}

      {/* Filter Toolbar */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap",
        padding: "12px 16px", background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 12
      }}>
        <div style={{ position: "relative", flex: 1, maxWidth: 320 }}>
          <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search deals or companies…" className="glass-input" style={{ paddingLeft: 34, fontSize: 12 }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Filter size={13} style={{ color: "var(--text-muted)", marginRight: 4 }} />
          {(["ALL", "OPEN", "WON", "LOST"] as const).map(st => (
            <button key={st} onClick={() => setStatusFilter(st)} style={{
              padding: "6px 12px", borderRadius: 8, fontSize: 11, fontWeight: statusFilter === st ? 800 : 600,
              background: statusFilter === st ? "var(--bg-elevated)" : "transparent",
              color: statusFilter === st ? "var(--text-primary)" : "var(--text-muted)",
              border: statusFilter === st ? "1px solid var(--border-strong)" : "1px solid transparent",
              cursor: "pointer", fontFamily: "inherit"
            }}>
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Kanban */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
        <KanbanColumn title="Active Opportunities" count={filteredDeals.filter(d => d.status === "OPEN").length}  accentColor="var(--blue)"  borderColor="var(--blue-border)">
          {filteredDeals.filter(d => d.status === "OPEN").map(d => (
            <KanbanCard key={d.id} deal={d} type="open" onWon={() => updateStatus(d.id, "WON")} onLost={() => updateStatus(d.id, "LOST")} onProposal={generateProposal} onEdit={openEditModal} onDelete={handleDeleteDeal} onAddNote={handleAddNote} />
          ))}
          {filteredDeals.filter(d => d.status === "OPEN").length === 0 && (
            <p style={{ fontSize: 11, color: "var(--text-muted)", textAlign: "center", padding: "24px 0" }}>No active deals</p>
          )}
        </KanbanColumn>

        <KanbanColumn title="Closed Won" count={filteredDeals.filter(d => d.status === "WON").length}  accentColor="var(--green)" borderColor="var(--green-border)">
          {filteredDeals.filter(d => d.status === "WON").map(d => (
            <KanbanCard key={d.id} deal={d} type="won" onEdit={openEditModal} onDelete={handleDeleteDeal} onAddNote={handleAddNote} />
          ))}
          {filteredDeals.filter(d => d.status === "WON").length === 0 && (
            <p style={{ fontSize: 11, color: "var(--text-muted)", textAlign: "center", padding: "24px 0" }}>No won deals yet</p>
          )}
        </KanbanColumn>

        <KanbanColumn title="Closed Lost" count={filteredDeals.filter(d => d.status === "LOST").length} accentColor="var(--red)"   borderColor="var(--red-border)">
          {filteredDeals.filter(d => d.status === "LOST").map(d => (
            <KanbanCard key={d.id} deal={d} type="lost" onReopen={() => updateStatus(d.id, "OPEN")} onEdit={openEditModal} onDelete={handleDeleteDeal} onAddNote={handleAddNote} />
          ))}
          {filteredDeals.filter(d => d.status === "LOST").length === 0 && (
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

                <button onClick={() => downloadProposalDoc(proposal)} className="btn-primary" style={{ fontSize: 12, padding: "10px 18px", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <Download size={14} /> Download Proposal Document (.md)
                </button>
              </div>
            ) : (
              <div style={{ padding: "48px 0", textAlign: "center", color: "var(--text-muted)", fontSize: 12 }}>
                Failed to generate proposal.
              </div>
            )}
          </div>
        </div>
      )}
      {isCreateModalOpen && (
        <div style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 20,
        }}>
          <form onSubmit={handleCreateDeal} style={{
            background: "var(--bg-surface)", border: "1px solid var(--border)",
            borderRadius: 18, padding: 28, maxWidth: 480, width: "100%",
            boxShadow: "0 32px 80px rgba(0,0,0,0.18)",
            display: "flex", flexDirection: "column", gap: 16
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 14, borderBottom: "1px solid var(--border)" }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--text-primary)" }}>Log New Opportunity / Deal</h3>
              <button type="button" onClick={() => setIsCreateModalOpen(false)} style={{
                background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 7, padding: 7, cursor: "pointer", color: "var(--text-muted)",
              }}><X size={14} /></button>
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Target Company</label>
              <select value={newDealCompanyId} onChange={e => setNewDealCompanyId(e.target.value)} className="glass-input" style={{ fontSize: 12 }}>
                {companies.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Deal Opportunity Name</label>
              <input type="text" value={newDealName} onChange={e => setNewDealName(e.target.value)} required
                placeholder="e.g. AI Workflow Retainer" className="glass-input" style={{ fontSize: 12 }} />
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Estimated Deal Value (USD / KES)</label>
              <input type="number" value={newDealAmount} onChange={e => setNewDealAmount(e.target.value)} required
                placeholder="5000" className="glass-input" style={{ fontSize: 12 }} />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
              <button type="button" onClick={() => setIsCreateModalOpen(false)} className="btn-ghost" style={{ fontSize: 12 }}>Cancel</button>
              <button type="submit" disabled={creatingDeal} className="btn-primary" style={{ fontSize: 12 }}>
                {creatingDeal ? "Creating Deal…" : "Log Deal"}
              </button>
            </div>
          </form>
        </div>
      )}
      {editingDeal && (
        <div style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 20,
        }}>
          <form onSubmit={handleUpdateDeal} style={{
            background: "var(--bg-surface)", border: "1px solid var(--border)",
            borderRadius: 18, padding: 28, maxWidth: 480, width: "100%",
            boxShadow: "0 32px 80px rgba(0,0,0,0.18)",
            display: "flex", flexDirection: "column", gap: 16
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 14, borderBottom: "1px solid var(--border)" }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--text-primary)" }}>Edit Opportunity Details</h3>
              <button type="button" onClick={() => setEditingDeal(null)} style={{
                background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 7, padding: 7, cursor: "pointer", color: "var(--text-muted)",
              }}><X size={14} /></button>
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Target Company</label>
              <input type="text" value={editingDeal.company_name} disabled className="glass-input" style={{ fontSize: 12, opacity: 0.7 }} />
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Deal Opportunity Name</label>
              <input type="text" value={editDealName} onChange={e => setEditDealName(e.target.value)} required className="glass-input" style={{ fontSize: 12 }} />
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Estimated Deal Value (USD / KES)</label>
              <input type="number" value={editDealAmount} onChange={e => setEditDealAmount(e.target.value)} required className="glass-input" style={{ fontSize: 12 }} />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
              <button type="button" onClick={() => setEditingDeal(null)} className="btn-ghost" style={{ fontSize: 12 }}>Cancel</button>
              <button type="submit" disabled={updatingDeal} className="btn-primary" style={{ fontSize: 12 }}>
                {updatingDeal ? "Saving Changes…" : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
