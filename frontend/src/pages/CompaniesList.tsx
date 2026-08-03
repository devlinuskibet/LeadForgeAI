import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Plus, X } from "lucide-react";

import { API_BASE_URL } from "../config/api";
import { formatCurrency } from "../utils/currency";

interface Company {
  id: string; name: string; website: string | null; status: string;
  location?: string | null; address?: string | null;
  opportunity_score?: number | null; estimated_value?: number | null;
}

function ScoreDot({ score }: { score: number }) {
  const color = score >= 80 ? "var(--green)" : score >= 50 ? "var(--amber)" : "var(--red)";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{ width: 7, height: 7, borderRadius: "50%", background: color, flexShrink: 0 }} />
      <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)" }}>{score}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; border: string; label: string }> = {
    ACTIVE:   { bg: "var(--green-dim)", color: "var(--green-text)", border: "var(--green-border)", label: "Active" },
    PAUSED:   { bg: "var(--amber-dim)", color: "var(--amber-text)", border: "var(--amber-border)", label: "Paused" },
    ARCHIVED: { bg: "var(--bg-elevated)", color: "var(--text-muted)", border: "var(--border)", label: "Archived" },
  };
  const s = map[status] ?? map.ARCHIVED;
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20,
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      letterSpacing: "0.04em", textTransform: "uppercase",
    }}>
      {s.label}
    </span>
  );
}

export default function CompaniesList() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "high" | "active">("all");
  const [loading, setLoading] = useState(true);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [bulkData, setBulkData] = useState("");
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/companies/`)
      .then(r => r.ok ? r.json() : [])
      .then(setCompanies)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleBulkImport = async () => {
    setImporting(true);
    try {
      const items = bulkData.split("\n").filter(l => l.trim()).map(l => {
        const [name, website] = l.split(",");
        return { name: name?.trim(), website: website?.trim() || "" };
      });
      const res = await fetch(`${API_BASE_URL}/api/prospecting/bulk-import`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(items),
      });
      if (res.ok) { setShowBulkImport(false); setBulkData(""); }
    } catch (e) { console.error(e); }
    finally { setImporting(false); }
  };

  const filtered = companies.filter(c => {
    const s = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || (c.website || "").toLowerCase().includes(searchTerm.toLowerCase());
    const f = activeFilter === "all" ? true : activeFilter === "high" ? (c.opportunity_score ?? 0) >= 80 : c.status === "ACTIVE";
    return s && f;
  });

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
              Companies & Leads
            </h2>
            <span style={{
              fontSize: 10, fontWeight: 800, padding: "3px 9px", borderRadius: 20,
              background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-muted)",
            }}>
              {companies.length} total
            </span>
          </div>
          <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4, fontWeight: 500 }}>
            Manage, filter, and execute AI outreach across discovered business leads.
          </p>
        </div>
        <button onClick={() => setShowBulkImport(true)} className="btn-primary">
          <Plus size={13} /> Bulk Import
        </button>
      </div>

      {/* Search + filter */}
      <div style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
        borderRadius: 12, padding: "12px 16px",
        display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
      }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <Search size={13} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input
            type="text" value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="glass-input" style={{ paddingLeft: 32, fontSize: 12 }}
            placeholder="Search by name or domain…"
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span className="label-caps" style={{ marginRight: 4 }}>Filter</span>
          {(["all", "high", "active"] as const).map(f => (
            <button key={f} onClick={() => setActiveFilter(f)} style={{
              padding: "6px 12px", borderRadius: 7, fontSize: 11, fontWeight: 700,
              cursor: "pointer", fontFamily: "inherit", transition: "all 0.12s",
              background: activeFilter === f ? "#111827" : "var(--bg-elevated)",
              color: activeFilter === f ? "#fff" : "var(--text-secondary)",
              border: activeFilter === f ? "1px solid #111827" : "1px solid var(--border)",
            }}>
              {f === "all" ? "All Leads" : f === "high" ? "High Priority" : "Active"}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{
        background: "var(--bg-surface)", border: "1px solid var(--border)",
        borderRadius: 14, overflow: "hidden",
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              {["Company", "Website", "Location", "Score", "Est. Value", "Status", ""].map((h, i) => (
                <th key={i} style={{
                  padding: "10px 18px", textAlign: "left",
                  fontSize: 10, fontWeight: 700, color: "var(--text-muted)",
                  letterSpacing: "0.08em", textTransform: "uppercase",
                  background: "var(--bg-elevated)",
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ padding: "48px 18px", textAlign: "center", color: "var(--text-muted)", fontSize: 12 }}>Loading companies…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: "48px 18px", textAlign: "center", color: "var(--text-muted)", fontSize: 12 }}>No companies found.</td></tr>
            ) : filtered.map((company, idx) => (
              <tr key={company.id}
                style={{ borderBottom: idx < filtered.length - 1 ? "1px solid var(--border)" : "none", transition: "background 0.1s" }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--table-hover)"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
              >
                <td style={{ padding: "13px 18px" }}>
                  <Link to={`/companies/${company.id}`} style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
                    <div style={{
                      width: 30, height: 30, borderRadius: 7, background: "#111827",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 12, fontWeight: 800, color: "#fff", flexShrink: 0,
                    }}>
                      {company.name.charAt(0).toUpperCase()}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{company.name}</span>
                  </Link>
                </td>
                <td style={{ padding: "13px 18px" }}>
                  <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}>{company.website || "—"}</span>
                </td>
                <td style={{ padding: "13px 18px" }}>
                  <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}>
                    {company.location || company.address || "—"}
                  </span>
                </td>
                <td style={{ padding: "13px 18px" }}>
                  <ScoreDot score={company.opportunity_score ?? 90} />
                </td>
                <td style={{ padding: "13px 18px" }}>
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 6,
                    background: "var(--green-dim)", color: "var(--green-text)", border: "1px solid var(--green-border)",
                  }}>
                    {formatCurrency(company.estimated_value)}
                  </span>
                </td>
                <td style={{ padding: "13px 18px" }}>
                  <StatusBadge status={company.status} />
                </td>
                <td style={{ padding: "13px 18px", textAlign: "right" }}>
                  <Link to={`/companies/${company.id}`} style={{
                    fontSize: 11, fontWeight: 700, padding: "6px 12px", borderRadius: 7,
                    background: "var(--bg-elevated)", border: "1px solid var(--border)",
                    color: "var(--text-secondary)", textDecoration: "none", transition: "all 0.12s", display: "inline-block",
                  }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.background = "#111827";
                      (e.currentTarget as HTMLElement).style.color = "#fff";
                      (e.currentTarget as HTMLElement).style.borderColor = "#111827";
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.background = "var(--bg-elevated)";
                      (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
                      (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                    }}
                  >
                    View →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bulk import modal */}
      {showBulkImport && (
        <div style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.35)",
          backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50,
        }}>
          <div style={{
            background: "var(--bg-surface)", border: "1px solid var(--border)",
            borderRadius: 16, padding: 28, maxWidth: 480, width: "90%",
            boxShadow: "0 24px 80px rgba(0,0,0,0.15)",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--text-primary)" }}>Bulk Import</h3>
                <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 3 }}>
                  One per line — <code style={{ fontFamily: "monospace", color: "var(--text-secondary)" }}>Company Name, Website</code>
                </p>
              </div>
              <button onClick={() => setShowBulkImport(false)} style={{
                background: "var(--bg-elevated)", border: "1px solid var(--border)",
                borderRadius: 7, padding: 7, cursor: "pointer", color: "var(--text-muted)",
              }}>
                <X size={14} />
              </button>
            </div>
            <textarea
              className="glass-input"
              style={{ height: 160, resize: "vertical", fontFamily: "monospace", fontSize: 12 }}
              placeholder={"ABC School, abcschool.edu\nXYZ Hotel, xyzhotel.com"}
              value={bulkData}
              onChange={e => setBulkData(e.target.value)}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16 }}>
              <button onClick={() => setShowBulkImport(false)} className="btn-ghost">Cancel</button>
              <button onClick={handleBulkImport} disabled={importing || !bulkData.trim()} className="btn-primary"
                style={{ opacity: importing || !bulkData.trim() ? 0.5 : 1 }}>
                {importing ? "Importing…" : "Start Auto-Prospecting"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
