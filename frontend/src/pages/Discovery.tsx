import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Radar, Search, CheckCircle, MapPin, Star, Globe, ArrowRight, Briefcase } from 'lucide-react';

export function Discovery() {
  const [searchParams, setSearchParams] = useState({ business_type: '', location: '', max_results: 10, min_rating: 4.0, has_website: true });
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<string>('idle');
  const [logs, setLogs] = useState<string[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [apiStats, setApiStats] = useState<any>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const fetchStats = async () => {
    try {
      const r = await fetch('http://localhost:8000/api/discovery/stats');
      if (r.ok) setApiStats(await r.json());
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchStats(); }, []);

  const startDiscovery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchParams.business_type || !searchParams.location) return;
    setJobStatus('starting'); setLogs([]); setSummary(null);
    try {
      const r = await fetch('http://localhost:8000/api/discovery/start', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(searchParams) });
      const d = await r.json();
      setJobId(d.job_id); setJobStatus('in_progress');
    } catch {
      setJobStatus('failed');
      setLogs(prev => [...prev, "Failed to connect to discovery service"]);
    }
  };

  useEffect(() => {
    if (!jobId || jobStatus === 'failed') return;
    if (jobStatus === 'completed' && summary) return;
    const interval = setInterval(async () => {
      try {
        const r = await fetch(`http://localhost:8000/api/discovery/job/${jobId}`);
        const d = await r.json();
        setJobStatus(d.status);
        if (d.logs) setLogs(d.logs);
        if (d.status === 'completed' && !summary) {
          const sr = await fetch(`http://localhost:8000/api/discovery/job/${jobId}/summary`);
          if (sr.ok) { setSummary(await sr.json()); fetchStats(); }
        }
      } catch (e) { console.error(e); }
    }, 1500);
    return () => clearInterval(interval);
  }, [jobId, jobStatus, summary]);

  useEffect(() => { logsEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [logs]);

  const isRunning = jobStatus === 'in_progress' || jobStatus === 'starting';
  const presets = [
    { label: 'Plumbers · Rongai',    vals: { business_type: 'Plumbers',  location: 'Rongai' } },
    { label: 'Schools · Nairobi',    vals: { business_type: 'Schools',   location: 'Nairobi' } },
    { label: 'Dentists · Westlands', vals: { business_type: 'Dentists',  location: 'Westlands' } },
  ];

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexDirection: "column", gap: 22 }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: "#111827", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Radar size={15} color="#fff" />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
              Prospect Discovery Agent
            </h2>
          </div>
          <p style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500 }}>
            Deploy the AI agent to search Google Places, analyze websites, and inject qualified prospects into your CRM.
          </p>
        </div>

        {apiStats && (
          <div style={{
            display: "flex", background: "var(--bg-surface)",
            border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden",
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          }}>
            {[
              { label: "API Calls",   value: apiStats.requests_made,        color: "var(--text-secondary)" },
              { label: "Cache Hits",  value: apiStats.cache_hits,            color: "var(--green)"          },
              { label: "Avg Time",    value: `${apiStats.average_time_seconds}s`, color: "var(--blue)"    },
            ].map((s, i, arr) => (
              <div key={s.label} style={{ padding: "10px 16px", borderRight: i < arr.length - 1 ? "1px solid var(--border)" : "none" }}>
                <p className="label-caps">{s.label}</p>
                <p style={{ fontSize: 16, fontWeight: 800, color: s.color, marginTop: 2 }}>{s.value}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form card */}
      <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
        {/* Card header */}
        <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", background: "var(--bg-elevated)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Search size={13} style={{ color: "var(--text-muted)" }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)" }}>Search Parameters</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className="label-caps" style={{ marginRight: 2 }}>Presets</span>
            {presets.map(p => (
              <button key={p.label} type="button" onClick={() => setSearchParams({ ...searchParams, ...p.vals })} style={{
                padding: "5px 11px", borderRadius: 7, fontSize: 11, fontWeight: 600,
                background: "var(--bg-surface)", border: "1px solid var(--border)",
                color: "var(--text-secondary)", cursor: "pointer", fontFamily: "inherit", transition: "all 0.12s",
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border-strong)"; (e.currentTarget as HTMLElement).style.color = "var(--text-primary)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)"; }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={startDiscovery} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label className="label-caps" style={{ display: "block", marginBottom: 7 }}>Business Type</label>
              <div style={{ position: "relative" }}>
                <Briefcase size={13} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                <input type="text" required value={searchParams.business_type} onChange={e => setSearchParams({ ...searchParams, business_type: e.target.value })}
                  className="glass-input" style={{ paddingLeft: 32 }} placeholder="Schools, Plumbers, Dentists…" disabled={isRunning} />
              </div>
            </div>
            <div>
              <label className="label-caps" style={{ display: "block", marginBottom: 7 }}>Location</label>
              <div style={{ position: "relative" }}>
                <MapPin size={13} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                <input type="text" required value={searchParams.location} onChange={e => setSearchParams({ ...searchParams, location: e.target.value })}
                  className="glass-input" style={{ paddingLeft: 32 }} placeholder="Nairobi, Rongai, Chicago IL…" disabled={isRunning} />
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 14, paddingTop: 14, borderTop: "1px solid var(--border)", alignItems: "end" }}>
            <div>
              <label className="label-caps" style={{ display: "block", marginBottom: 7 }}>Max Results</label>
              <select value={searchParams.max_results} onChange={e => setSearchParams({ ...searchParams, max_results: parseInt(e.target.value) })}
                className="glass-input" disabled={isRunning} style={{ cursor: "pointer" }}>
                {[10, 25, 50, 100].map(n => <option key={n} value={n}>{n} results</option>)}
              </select>
            </div>
            <div>
              <label className="label-caps" style={{ display: "block", marginBottom: 7 }}>Min Rating</label>
              <div style={{ position: "relative" }}>
                <Star size={12} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "var(--amber)" }} />
                <select value={searchParams.min_rating} onChange={e => setSearchParams({ ...searchParams, min_rating: parseFloat(e.target.value) })}
                  className="glass-input" style={{ paddingLeft: 30, cursor: "pointer" }} disabled={isRunning}>
                  <option value={0}>Any</option>
                  <option value={3.0}>3.0+</option>
                  <option value={4.0}>4.0+</option>
                  <option value={4.5}>4.5+</option>
                </select>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, paddingBottom: 2 }}>
              <input id="has_website" type="checkbox" checked={searchParams.has_website}
                onChange={e => setSearchParams({ ...searchParams, has_website: e.target.checked })}
                disabled={isRunning} style={{ accentColor: "#111827", width: 14, height: 14, cursor: "pointer" }} />
              <label htmlFor="has_website" style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 5, cursor: "pointer" }}>
                <Globe size={12} /> Has website
              </label>
            </div>
          </div>

          <button type="submit" disabled={isRunning || !searchParams.business_type || !searchParams.location}
            className="btn-primary"
            style={{ opacity: isRunning || !searchParams.business_type || !searchParams.location ? 0.5 : 1, justifyContent: "center", padding: "11px 20px", fontSize: 12 }}>
            {isRunning ? (
              <>
                <div style={{ width: 12, height: 12, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                Pipeline Running…
              </>
            ) : (
              <><Radar size={13} /> Launch Discovery Pipeline</>
            )}
          </button>
        </form>
      </div>

      {/* Terminal log */}
      {(logs.length > 0 || isRunning) && (
        <div style={{ background: "var(--terminal-bg)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ display: "flex", gap: 5 }}>
                {["#ef4444", "#eab308", "#22c55e"].map(c => (
                  <span key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c, opacity: 0.7, display: "inline-block" }} />
                ))}
              </div>
              <span style={{ fontSize: 11, fontFamily: "monospace", color: "#475569", borderLeft: "1px solid rgba(255,255,255,0.06)", paddingLeft: 10 }}>
                telemetry.log
              </span>
            </div>
            <div>
              {jobStatus === 'completed' && <span style={{ fontSize: 10, fontFamily: "monospace", fontWeight: 800, color: "#22c55e", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 20, padding: "3px 10px" }}>COMPLETE</span>}
              {jobStatus === 'failed'    && <span style={{ fontSize: 10, fontFamily: "monospace", fontWeight: 800, color: "#ef4444", background: "rgba(239,68,68,0.1)",  border: "1px solid rgba(239,68,68,0.2)",  borderRadius: 20, padding: "3px 10px" }}>FAILED</span>}
              {isRunning                && <span style={{ fontSize: 10, fontFamily: "monospace", fontWeight: 800, color: "#eab308", background: "rgba(234,179,8,0.1)",  border: "1px solid rgba(234,179,8,0.2)",  borderRadius: 20, padding: "3px 10px" }}>RUNNING…</span>}
            </div>
          </div>
          <div style={{ padding: "14px 18px", fontFamily: "monospace", fontSize: 11, height: 220, overflowY: "auto", display: "flex", flexDirection: "column", gap: 5 }}>
            {logs.map((log, i) => {
              const isErr = log.toLowerCase().includes('error') || log.toLowerCase().includes('failed');
              const isDivider = log.startsWith('---') || log.startsWith('─');
              return (
                <div key={i} style={{ display: "flex", gap: 10, color: isErr ? "#ef4444" : isDivider ? "#1e293b" : "#4ade80", fontWeight: isErr ? 700 : 400 }}>
                  {!isDivider && <span style={{ color: "#334155", flexShrink: 0 }}>[{new Date().toISOString().split('T')[1].split('.')[0]}]</span>}
                  <span style={{ wordBreak: "break-all" }}>{log}</span>
                </div>
              );
            })}
            {isRunning && (
              <div style={{ display: "flex", gap: 10, color: "#eab308" }}>
                <span style={{ color: "#334155" }}>[{new Date().toISOString().split('T')[1].split('.')[0]}]</span>
                <span>Executing pipeline…</span>
              </div>
            )}
            <div ref={logsEndRef} />
          </div>
        </div>
      )}

      {/* Summary */}
      {summary && (
        <div style={{ background: "var(--bg-surface)", border: "1px solid var(--green-border)", borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          <div style={{ padding: "14px 22px", borderBottom: "1px solid var(--border)", background: "var(--green-dim)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <CheckCircle size={15} color="var(--green)" />
              <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>Discovery Summary</h3>
            </div>
            <span style={{ fontSize: 10, fontWeight: 700, color: "var(--green-text)", background: "var(--green-dim)", border: "1px solid var(--green-border)", borderRadius: 20, padding: "3px 10px", letterSpacing: "0.05em" }}>
              PHASE COMPLETE
            </span>
          </div>

          <div style={{ padding: "22px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 20 }}>
              {[
                { label: "Businesses Found",    value: summary.businesses_found,                           color: "var(--text-primary)" },
                { label: "Websites Analyzed",   value: summary.websites_found,                             color: "var(--blue)"         },
                { label: "Potential Revenue",   value: `$${summary.potential_revenue?.toLocaleString()}`,  color: "var(--green)"        },
                { label: "Ready for Outreach",  value: summary.ready_for_outreach,                         color: "var(--green)"        },
              ].map(s => (
                <div key={s.label} style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 10, padding: "14px 16px", textAlign: "center" }}>
                  <p className="label-caps" style={{ marginBottom: 8 }}>{s.label}</p>
                  <p style={{ fontSize: 24, fontWeight: 800, color: s.color, letterSpacing: "-0.03em" }}>{s.value}</p>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 18 }}>
              <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 10, padding: "16px 18px" }}>
                <p className="label-caps" style={{ marginBottom: 12 }}>Opportunity Breakdown</p>
                {[
                  { label: "High (80+)",    value: summary.high_opportunity,   color: "var(--green)" },
                  { label: "Medium (50–79)", value: summary.medium_opportunity, color: "var(--amber)" },
                  { label: "Low (<50)",     value: summary.low_opportunity,    color: "var(--text-muted)" },
                ].map(row => (
                  <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <span style={{ fontSize: 11, color: row.color, fontWeight: 600 }}>{row.label}</span>
                    <span style={{ fontSize: 11, fontWeight: 800, padding: "2px 8px", borderRadius: 6, background: `${row.color}18`, color: row.color, border: `1px solid ${row.color}30` }}>{row.value}</span>
                  </div>
                ))}
              </div>
              <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 10, padding: "16px 18px" }}>
                <p className="label-caps" style={{ marginBottom: 12 }}>Averages & Estimates</p>
                {[
                  { label: "Avg Opportunity Score", value: `${summary.average_opportunity_score}/100` },
                  { label: "Avg Deal Size",          value: `$${summary.average_deal_size?.toLocaleString()}` },
                  { label: "Est. Outreach Time",     value: `~${Math.ceil(summary.estimated_outreach_time_mins)} mins` },
                ].map(row => (
                  <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500 }}>{row.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 800, color: "var(--text-primary)" }}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <Link to="/companies" className="btn-primary" style={{ width: "100%", justifyContent: "center", padding: "12px 20px", fontSize: 12 }}>
              Review High-Priority Companies <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
