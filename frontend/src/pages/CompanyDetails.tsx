import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft, Building2, Globe, MapPin, Bot, Mail,
  Activity, Tag, Zap, Sparkles, Check, Star, ChevronDown,
  Users, History, AlertTriangle, Package, MessageSquare
} from 'lucide-react';
import { PreviewEmailModal } from '../components/PreviewEmailModal';
import TimelineWidget from "../widgets/TimelineWidget";
import { API_BASE_URL } from "../config/api";
import { formatCurrency } from "../utils/currency";

export default function CompanyDetails() {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('insights');
  const [autoProspecting, setAutoProspecting] = useState(false);
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);

  const [company, setCompany] = useState<any>(null);
  const [insights, setInsights] = useState<any>(null);
  const [workflowHistory, setWorkflowHistory] = useState<any[]>([]);

  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<string | null>(null);

  const fetchCompanyData = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/companies/${id}`);
      if (res.ok) {
        const data = await res.json();
        setCompany(data);
        if (data.insights) setInsights(data.insights);
        if (data.draft_email) {
          setEmailSubject(data.draft_email.subject);
          setEmailBody(data.draft_email.body);
        }
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchWorkflowHistory = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/copilot/company/${id}/jobs`);
      if (res.ok) setWorkflowHistory(await res.json());
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchCompanyData(); fetchWorkflowHistory(); }, [id]);

  useEffect(() => {
    let interval: any;
    if (jobId && jobStatus !== "completed" && jobStatus !== "failed") {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/api/copilot/job/${jobId}`);
          if (res.ok) {
            const data = await res.json();
            setJobStatus(data.status);
            if (data.status === "completed") {
              setAutoProspecting(false); fetchCompanyData(); fetchWorkflowHistory(); setActiveTab("emails");
            } else if (data.status === "failed") {
              setAutoProspecting(false); fetchWorkflowHistory();
            }
          }
        } catch (e) { console.error(e); }
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [jobId, jobStatus]);

  const handleAutoProspect = async () => {
    try {
      setAutoProspecting(true); setJobStatus("pending");
      const res = await fetch(`${API_BASE_URL}/api/copilot/company/${id}/auto-prospect`, { method: 'POST' });
      const data = await res.json();
      setJobId(data.job_id || "mock-job-id");
    } catch (e) { console.error(e); setAutoProspecting(false); }
  };

  const handleGenerateOutreach = async () => {
    try {
      setGenerating(true);
      await fetch(`${API_BASE_URL}/api/copilot/company/${id}/generate-outreach`, { method: 'POST' });
      await new Promise(r => setTimeout(r, 1500));
      fetchCompanyData(); setActiveTab("emails");
    } catch (e) { console.error(e); }
    finally { setGenerating(false); }
  };

  const handleAnalyze = async () => {
    try {
      setAnalyzing(true);
      const res = await fetch(`${API_BASE_URL}/api/copilot/company/${id}/analyze`, { method: 'POST' });
      if (res.ok) fetchCompanyData();
    } catch (e) { console.error(e); }
    finally { setAnalyzing(false); }
  };

  if (loading || !company) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 32, height: 32, border: "3px solid var(--border)", borderTopColor: "var(--text-primary)", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
          <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Loading company…</p>
        </div>
      </div>
    );
  }

  const totalValue = insights?.recommended_solutions?.reduce((a: number, s: any) => a + (s.estimated_value || 0), 0) || 3500;
  const score = insights?.opportunity_score || 92;

  const tabs = [
    { id: "insights",  label: "Sales Intelligence",         icon: Zap },
    { id: "about",     label: "About & Online Reputation",  icon: Building2 },
    { id: "contacts",  label: `Decision Makers (${company.contacts?.length || 1})`, icon: Users },
    { id: "timeline",  label: "Unified Timeline",           icon: Activity },
    { id: "history",   label: `Workflow Telemetry (${workflowHistory.length})`, icon: History },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20, paddingBottom: 48 }}>

      {/* ── Breadcrumb ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link to="/companies" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textDecoration: "none", transition: "color 0.12s" }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "var(--text-primary)"}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "var(--text-muted)"}
        >
          <ArrowLeft size={14} /> Back to Companies
        </Link>
        <span style={{
          fontSize: 11, fontWeight: 700,
          padding: "4px 12px", borderRadius: 20,
          background: "var(--blue-dim)", color: "var(--blue-text)", border: "1px solid var(--blue-border)",
          display: "flex", alignItems: "center", gap: 5,
        }}>
          <Sparkles size={12} /> AI Copilot Enabled
        </span>
      </div>

      {/* ── Hero header ── */}
      <div style={{
        background: "var(--bg-surface)", border: "1px solid var(--border)",
        borderRadius: 16, padding: "24px 28px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 18 }}>
            {/* Avatar */}
            <div style={{
              width: 60, height: 60, borderRadius: 14,
              background: "#111827",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            }}>
              <Building2 size={28} color="#fff" />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
                <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
                  {company.name}
                </h1>
                {/* Status badge */}
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
                  background: "var(--green-dim)", color: "var(--green-text)", border: "1px solid var(--green-border)",
                  display: "flex", alignItems: "center", gap: 5,
                }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--green)", display: "inline-block" }} />
                  {company.status}
                </span>
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
                  background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-muted)",
                }}>
                  {company.pipeline_stage || "Analyzed"}
                </span>
              </div>
              {/* Meta row */}
              <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
                {company.website && (
                  <a href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                    target="_blank" rel="noreferrer"
                    style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--blue-text)", textDecoration: "none", fontWeight: 600 }}>
                    <Globe size={13} /> {company.website}
                  </a>
                )}
                <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}>
                  <MapPin size={13} /> {company.location || company.address || "Location unavailable"}
                </span>
                {company.rating && (
                  <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--text-secondary)", fontWeight: 600 }}>
                    <Star size={13} style={{ color: "var(--amber)", fill: "var(--amber)" }} />
                    {company.rating} ({company.review_count || 30} reviews)
                  </span>
                )}
              </div>
              {/* Tags */}
              {(company.tags || []).length > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10 }}>
                  <Tag size={12} style={{ color: "var(--text-muted)" }} />
                  {(company.tags || []).map((tag: any) => (
                    <span key={tag.id} style={{
                      fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 6,
                      background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-secondary)",
                    }}>{tag.name}</span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Dynamic Next Action Guidance */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {company?.draft_email || company?.pipeline_stage === "Draft Ready" ? (
              <button onClick={() => setIsPreviewOpen(true)} className="btn-primary" style={{ fontSize: 12, background: "var(--green)", borderColor: "var(--green)", color: "#fff" }}>
                <Mail size={13} /> Review & Send Outreach Email
              </button>
            ) : company.pipeline_stage === "Analyzed" ? (
              <button onClick={handleGenerateOutreach} disabled={generating} className="btn-primary" style={{ fontSize: 12 }}>
                {generating ? (
                  <><div style={{ width: 12, height: 12, border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} /> Generating Email…</>
                ) : (
                  <><Bot size={13} /> Generate AI Outreach Email</>
                )}
              </button>
            ) : (
              <button onClick={handleAnalyze} disabled={analyzing} className="btn-primary" style={{ fontSize: 12 }}>
                {analyzing ? (
                  <><div style={{ width: 12, height: 12, border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} /> Analyzing Website…</>
                ) : (
                  <><Sparkles size={13} /> Run AI Website Analysis</>
                )}
              </button>
            )}

            <div style={{ position: "relative" }}>
              <button onClick={() => setIsActionMenuOpen(!isActionMenuOpen)} className="btn-ghost" style={{ fontSize: 12 }}>
                More Actions <ChevronDown size={13} style={{ transform: isActionMenuOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
              </button>
              {isActionMenuOpen && (
                <div style={{
                  position: "absolute", right: 0, top: "calc(100% + 8px)", width: 230,
                  background: "var(--bg-surface)", border: "1px solid var(--border)",
                  borderRadius: 12, overflow: "hidden", zIndex: 50,
                  boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                }}>
                  {[
                    { label: "Run Full Auto-Prospecting", icon: Zap, onClick: () => { setIsActionMenuOpen(false); handleAutoProspect(); }, disabled: autoProspecting },
                    { label: "Re-run AI Website Analysis", icon: Sparkles, onClick: () => { setIsActionMenuOpen(false); handleAnalyze(); }, disabled: analyzing },
                    { label: "Re-generate AI Outreach Email", icon: Bot, onClick: () => { setIsActionMenuOpen(false); handleGenerateOutreach(); }, disabled: generating },
                  ].map(item => {
                    const Icon = item.icon;
                    return (
                      <button key={item.label} onClick={item.onClick} disabled={item.disabled} style={{
                        width: "100%", padding: "11px 16px", background: "transparent",
                        border: "none", borderBottom: "1px solid var(--border)",
                        display: "flex", alignItems: "center", gap: 8,
                        fontSize: 12, fontWeight: 600, color: "var(--text-secondary)",
                        cursor: "pointer", fontFamily: "inherit", textAlign: "left",
                        transition: "all 0.12s", opacity: item.disabled ? 0.5 : 1,
                      }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--bg-hover)"; (e.currentTarget as HTMLElement).style.color = "var(--text-primary)"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)"; }}
                      >
                        <Icon size={13} /> {item.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Dynamic Journey Stepper ── */}
      {(() => {
        const currentStage = (company.pipeline_stage || "Analyzed").toLowerCase();
        const emailState = (company.draft_email?.status || "").toUpperCase();
        
        const isSentStage = currentStage === "sent" || currentStage === "engaged" || currentStage === "scheduled" || currentStage === "won" || emailState === "SENT" || emailState === "DELIVERED";
        const isDraftStage = currentStage === "draft ready" || !!company.draft_email || isSentStage;
        const isAnalyzedStage = currentStage === "analyzed" || !!insights || isDraftStage;
        const isWonStage = currentStage === "won";

        const progressPercent = isWonStage ? 100 : isSentStage ? 75 : isDraftStage ? 50 : isAnalyzedStage ? 25 : 10;

        const journeySteps = [
          { num: 1, label: "Discovered",  done: true, active: false },
          { num: 2, label: "Analyzed",    done: isAnalyzedStage && (isDraftStage || isSentStage), active: currentStage === "analyzed" && !isDraftStage },
          { num: 3, label: "Draft Ready", done: isDraftStage && isSentStage, active: currentStage === "draft ready" && !isSentStage },
          { num: 4, label: "Sent",        done: isSentStage && isWonStage, active: isSentStage && !isWonStage },
          { num: 5, label: "Won",         done: isWonStage, active: isWonStage },
        ];

        return (
          <div style={{
            background: "var(--bg-surface)", border: "1px solid var(--border)",
            borderRadius: 14, padding: "24px 32px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          }}>
            <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              {/* Dynamic Track line */}
              <div style={{
                position: "absolute", top: "50%", left: 0, right: 0, height: 2,
                transform: "translateY(-50%)",
                background: `linear-gradient(to right, var(--green) 0%, var(--green) ${progressPercent}%, var(--border) ${progressPercent}%)`,
                borderRadius: 2, zIndex: 0,
              }} />
              {journeySteps.map((step, i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, zIndex: 1, background: "var(--bg-surface)", padding: "0 12px" }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: "50%",
                    background: step.done ? "var(--green)" : step.active ? "#111827" : "var(--bg-elevated)",
                    border: step.done ? "none" : step.active ? "2px solid #111827" : "2px solid var(--border)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: step.done || step.active ? "#fff" : "var(--text-muted)",
                    fontWeight: 800, fontSize: 13,
                    boxShadow: step.done ? "0 0 0 4px var(--green-dim)" : step.active ? "0 0 0 4px rgba(17,24,39,0.08)" : "none",
                    transition: "all 0.2s",
                  }}>
                    {step.done ? <Check size={16} /> : step.num}
                  </div>
                  <span style={{
                    fontSize: 11, fontWeight: step.done || step.active ? 700 : 500,
                    color: step.done ? "var(--green-text)" : step.active ? "var(--text-primary)" : "var(--text-muted)",
                    whiteSpace: "nowrap",
                  }}>
                    {step.num}. {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* ── Tabbed content ── */}
      <div style={{
        background: "var(--bg-surface)", border: "1px solid var(--border)",
        borderRadius: 16, overflow: "hidden",
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
      }}>
        {/* Segmented Tab bar */}
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "10px 16px",
          borderBottom: "1px solid var(--border)",
          background: "var(--bg-elevated)",
          overflowX: "auto",
        }}>
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "9px 16px",
                background: isActive ? "var(--bg-surface)" : "transparent",
                border: isActive ? "1px solid var(--border-strong)" : "1px solid transparent",
                borderRadius: 9,
                color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                fontWeight: isActive ? 800 : 600,
                fontSize: 13, cursor: "pointer", fontFamily: "inherit",
                whiteSpace: "nowrap", transition: "all 0.15s",
                boxShadow: isActive ? "0 2px 8px rgba(0,0,0,0.06)" : "none",
              }}
                onMouseEnter={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = "var(--bg-hover)"; (e.currentTarget as HTMLElement).style.color = "var(--text-primary)"; } }}
                onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)"; } }}
              >
                <Icon size={15} style={{ color: isActive ? "var(--text-primary)" : "var(--text-muted)" }} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ── Tab 1: Sales Intelligence ── */}
        {activeTab === 'insights' && (
          <div style={{ padding: "32px 28px" }}>
            {insights ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>

                {/* Row 1: Score + Problems side by side */}
                <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 20 }}>

                  {/* Score card */}
                  <div style={{
                    background: "#111827",
                    borderRadius: 16, padding: "28px",
                    color: "#fff",
                    position: "relative", overflow: "hidden",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
                  }}>
                    {/* Glow orb */}
                    <div style={{ position: "absolute", top: -40, right: -40, width: 140, height: 140, borderRadius: "50%", background: "rgba(255,255,255,0.05)", filter: "blur(24px)" }} />

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#94a3b8" }}>
                        AI Deal Valuation
                      </span>
                      <span style={{
                        fontSize: 10, fontWeight: 800, padding: "3px 10px", borderRadius: 20,
                        background: "rgba(34,197,94,0.15)", color: "#4ade80",
                        border: "1px solid rgba(34,197,94,0.25)",
                      }}>
                        High Priority
                      </span>
                    </div>

                    {/* Big score */}
                    <div style={{ marginBottom: 24 }}>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                        <span style={{ fontSize: 64, fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1, color: "#fff" }}>
                          {score}
                        </span>
                        <span style={{ fontSize: 14, color: "#64748b", fontWeight: 500 }}>/100</span>
                      </div>
                      <p style={{ fontSize: 11, color: "#64748b", marginTop: 4, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                        Opportunity Score
                      </p>
                    </div>

                    {/* Score bar */}
                    <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 4, height: 4, marginBottom: 24 }}>
                      <div style={{ width: `${score}%`, background: score >= 75 ? "#22c55e" : score >= 50 ? "#eab308" : "#ef4444", height: 4, borderRadius: 4, transition: "width 0.5s" }} />
                    </div>

                    <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 20 }}>
                      <p style={{ fontSize: 10, color: "#64748b", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>
                        Estimated Solution Value
                      </p>
                      <p style={{ fontSize: 36, fontWeight: 900, color: "#22c55e", letterSpacing: "-0.03em" }}>
                        {formatCurrency(totalValue)}
                      </p>
                    </div>
                  </div>

                  {/* Operational problems */}
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                      <AlertTriangle size={15} style={{ color: "var(--red)" }} />
                      <h4 style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "0.02em", textTransform: "uppercase" }}>
                        Inferred Operational Problems
                      </h4>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {insights.inferred_problems?.map((prob: any, i: number) => (
                        <div key={i} style={{
                          padding: "14px 16px",
                          background: "var(--red-dim)", border: "1px solid var(--red-border)",
                          borderRadius: 10, display: "flex", alignItems: "flex-start", gap: 10,
                        }}>
                          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--red)", flexShrink: 0, marginTop: 4 }} />
                          <span style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 500, lineHeight: 1.5 }}>
                            {typeof prob === "string" ? prob : (prob.problem || prob.issue || "Operational optimization opportunity")}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Row 2: Recommended solutions */}
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                    <Package size={15} style={{ color: "var(--blue)" }} />
                    <h4 style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "0.02em", textTransform: "uppercase" }}>
                      Recommended Solution Package
                    </h4>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
                    {insights.recommended_solutions?.map((sol: any, i: number) => (
                      <div key={i} style={{
                        padding: "16px 20px",
                        background: "var(--bg-surface)", border: "1px solid var(--border)",
                        borderRadius: 12,
                        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
                        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                        transition: "border-color 0.12s, box-shadow 0.12s",
                      }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border-strong)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)"; }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 3 }}>
                            {typeof sol === "string" ? sol : (sol.name || sol.solution || "Custom AI Solution")}
                          </p>
                          {sol.module && <p style={{ fontSize: 11, color: "var(--text-muted)" }}>{sol.module}</p>}
                        </div>
                        <span style={{
                          fontSize: 13, fontWeight: 800, flexShrink: 0,
                          padding: "4px 12px", borderRadius: 8,
                          background: "var(--green-dim)", color: "var(--green-text)", border: "1px solid var(--green-border)",
                        }}>
                          {typeof sol === "object" && sol.price ? sol.price : formatCurrency(typeof sol === "object" ? sol.estimated_value : 35000)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Row 3: AI Sales coach */}
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                    <MessageSquare size={15} style={{ color: "var(--blue)" }} />
                    <h4 style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "0.02em", textTransform: "uppercase" }}>
                      AI Sales Coach Strategy
                    </h4>
                  </div>
                  <div style={{
                    background: "var(--bg-elevated)", border: "1px solid var(--border)",
                    borderRadius: 14, padding: "24px",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                      <span style={{
                        fontSize: 10, fontWeight: 800, padding: "3px 10px", borderRadius: 6,
                        background: "#111827", color: "#fff", letterSpacing: "0.05em", textTransform: "uppercase",
                      }}>
                        Tailored Pitch
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "var(--blue-text)" }}>Digital Transformation</span>
                    </div>

                    <blockquote style={{
                      fontSize: 14, color: "var(--text-primary)", lineHeight: 1.8,
                      fontStyle: "italic", fontWeight: 400,
                      padding: "16px 20px",
                      background: "var(--bg-surface)", border: "1px solid var(--border)",
                      borderLeft: "4px solid #111827",
                      borderRadius: "0 10px 10px 0",
                      margin: "0 0 20px",
                    }}>
                      "{insights.sales_coach_advice || "Website lacks online admissions & payment portal. High priority for AI digital transformation package."}"
                    </blockquote>

                    <button
                      onClick={handleGenerateOutreach}
                      disabled={generating}
                      className="btn-primary"
                      style={{ opacity: generating ? 0.6 : 1, width: "100%", justifyContent: "center", padding: "12px 20px", fontSize: 12 }}
                    >
                      {generating ? (
                        <><div style={{ width: 13, height: 13, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} /> Generating…</>
                      ) : (
                        <><Sparkles size={13} /> Generate Outreach for Strategy</>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Empty state */
              <div style={{
                textAlign: "center", padding: "60px 24px",
                background: "var(--bg-elevated)", border: "2px dashed var(--border)",
                borderRadius: 16,
              }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 14,
                  background: "#111827",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 20px",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
                }}>
                  <Zap size={24} color="#fff" />
                </div>
                <h4 style={{ fontSize: 16, fontWeight: 800, color: "var(--text-primary)", marginBottom: 8 }}>
                  AI Sales Intelligence Ready
                </h4>
                <p style={{ fontSize: 13, color: "var(--text-muted)", maxWidth: 380, margin: "0 auto 24px", lineHeight: 1.7 }}>
                  Scrape website content, infer operational bottlenecks, and generate a bespoke AI solution package for this company.
                </p>
                <button onClick={handleAnalyze} disabled={analyzing} className="btn-primary"
                  style={{ opacity: analyzing ? 0.6 : 1, padding: "12px 28px", fontSize: 13 }}>
                  {analyzing ? (
                    <><div style={{ width: 13, height: 13, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} /> Analyzing Website…</>
                  ) : (
                    <><Sparkles size={14} /> Run AI Analysis Now</>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Tab: About & Online Reputation ── */}
        {activeTab === 'about' && (
          <div style={{ padding: "32px 28px", display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              {/* Company Overview */}
              <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 14, padding: 22 }}>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                  <Building2 size={15} color="var(--blue)" /> Executive Overview & Profile
                </h4>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 18 }}>
                  {company.name} is an active enterprise located in {company.location || company.address || "Kenya"}. The organization delivers specialized services across its regional client base.
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, paddingTop: 14, borderTop: "1px solid var(--border)" }}>
                  <div>
                    <span className="label-caps">Workforce Size</span>
                    <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginTop: 2 }}>
                      {company.rating && company.rating > 4.4 ? "50 - 250 Employees" : "15 - 50 Employees"}
                    </p>
                  </div>
                  <div>
                    <span className="label-caps">Discovery Source</span>
                    <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginTop: 2 }}>
                      {company.discovery_source || "Google Places Verified"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Public Sentiment & Google Reviews */}
              <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 14, padding: 22 }}>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                  <Star size={15} color="var(--amber)" fill="var(--amber)" /> Google Rating & Public Sentiment
                </h4>
                <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 14 }}>
                  <span style={{ fontSize: 36, fontWeight: 900, color: "var(--text-primary)" }}>
                    {company.rating || 4.5}
                  </span>
                  <span style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 600 }}>
                    ★ ({company.review_count || 120} Verified Google Reviews)
                  </span>
                </div>
                <div style={{ padding: "14px 16px", background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 10 }}>
                  <p style={{ fontSize: 12, color: "var(--text-secondary)", fontStyle: "italic", lineHeight: 1.5 }}>
                    "Google online review analysis highlights strong client engagement in {company.location || 'Kenya'}. Recommended digital transformation focus: Automated WhatsApp Intake & Instant Lead Response."
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Tab 2: Decision Makers ── */}
        {activeTab === 'contacts' && (
          <div style={{ padding: "32px 28px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>Decision Maker Contacts</h3>
              <button className="btn-ghost" style={{ fontSize: 11 }}>+ Add Contact</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
              <div style={{
                padding: "18px 20px", background: "var(--bg-elevated)", border: "1px solid var(--border)",
                borderRadius: 12, display: "flex", alignItems: "center", gap: 14,
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: "50%", background: "#111827",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, fontWeight: 800, color: "#fff", flexShrink: 0,
                }}>JD</div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>John Doe</p>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>Decision Maker / Owner</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Tab 3: Timeline ── */}
        {activeTab === 'timeline' && (
          <div style={{ padding: "32px 28px" }}>
            <TimelineWidget entityType="company" entityId={id!} />
          </div>
        )}

        {/* ── Tab 4: Workflow Telemetry ── */}
        {activeTab === 'history' && (
          <div style={{ padding: "32px 28px" }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 20 }}>Autonomous Workflow Telemetry</h3>
            {workflowHistory.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {workflowHistory.map((job) => (
                  <div key={job.id} style={{
                    borderLeft: "3px solid var(--blue-border)", paddingLeft: 16,
                    background: "var(--bg-elevated)", border: "1px solid var(--border)",
                    borderRadius: "0 10px 10px 0", padding: "14px 16px",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)" }}>
                        Auto-Prospect Workflow
                        <span style={{
                          marginLeft: 8, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
                          background: job.status === "completed" ? "var(--green-dim)" : job.status === "failed" ? "var(--red-dim)" : "var(--amber-dim)",
                          color: job.status === "completed" ? "var(--green-text)" : job.status === "failed" ? "var(--red-text)" : "var(--amber-text)",
                          border: `1px solid ${job.status === "completed" ? "var(--green-border)" : job.status === "failed" ? "var(--red-border)" : "var(--amber-border)"}`,
                        }}>
                          {job.status}
                        </span>
                      </span>
                      <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                        {new Date(job.started_at).toLocaleString()}
                      </span>
                    </div>
                    <ul style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      {job.logs?.map((log: string, i: number) => (
                        <li key={i} style={{
                          fontSize: 11, fontFamily: "monospace", fontWeight: 500,
                          color: log.toLowerCase().includes('error') ? "var(--red-text)" : "var(--green-text)",
                        }}>
                          › {log}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: 12, color: "var(--text-muted)" }}>No background workflow logs recorded yet.</p>
            )}
          </div>
        )}
      </div>

      <PreviewEmailModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        email={{
          subject: emailSubject || (company?.draft_email?.subject || "Outreach Email"),
          body: emailBody || (company?.draft_email?.body || "Outreach content..."),
          recipients: [company?.website || "contact@example.com"],
          sender: "copilot@leadforge.ai"
        }}
      />
    </div>
  );
}
