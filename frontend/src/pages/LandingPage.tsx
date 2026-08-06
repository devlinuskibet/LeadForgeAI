import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Sparkles, Radar, DollarSign, Mail, ArrowRight, CheckCircle2,
  ChevronDown, Globe, Shield, Play, Sun, Moon, Check, Star
} from "lucide-react";

export default function LandingPage() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    return (localStorage.getItem("lf-theme") as "light" | "dark") || "light";
  });
  const [isAnnual, setIsAnnual] = useState(true);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [demoState, setDemoState] = useState<"search" | "analyzing" | "complete">("search");
  const [demoQuery, setDemoQuery] = useState("Dental Clinics · Nairobi");

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("lf-theme", next);
  };

  const runInteractiveDemo = () => {
    setDemoState("analyzing");
    setTimeout(() => setDemoState("complete"), 1800);
  };

  const faqItems = [
    {
      q: "How does LeadForge AI discover qualified B2B prospects?",
      a: "LeadForge AI connects directly to Google Places APIs and web search indices to identify active businesses by location, industry, and rating. It then launches autonomous scrapers to inspect target websites, extracting verified emails, phone numbers, decision-maker roles, and technology stacks."
    },
    {
      q: "Can I send outreach emails directly through LeadForge AI?",
      a: "Yes! LeadForge AI includes an integrated SMTP engine supporting Gmail App Passwords, Custom Domain SMTP (SendGrid, Mailgun, Postmark), and custom mail servers. Outgoing emails include 1x1 telemetry tracking pixels to measure real-time open rates."
    },
    {
      q: "How does the AI Proposal Generator work?",
      a: "When a target company's website is analyzed, our LLM engine identifies missing web modules, security gaps, and growth bottlenecks. It automatically synthesizes a tailored B2B solution proposal with customized pricing, scope items, and confidence scores."
    },
    {
      q: "Is there a free trial available?",
      a: "Absolutely! You get a 14-day full-access free trial with 100 free prospect discovery searches and full access to our AI Email Generator and Deals Pipeline—no credit card required."
    },
    {
      q: "What CRM integrations are supported?",
      a: "LeadForge AI seamlessly syncs leads and deals across Salesforce, HubSpot, Zoho, and Pipedrive. You can also export structured prospect lists and pipeline forecasts directly to CSV."
    }
  ];

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)", color: "var(--text-primary)", fontFamily: "Inter, sans-serif" }}>

      {/* ── STICKY NAVIGATION BAR ── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "var(--header-bg)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
        borderBottom: "1px solid var(--border)", padding: "0 28px", height: 64,
        display: "flex", alignItems: "center", justifyContent: "space-between"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: "#111827", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Sparkles size={16} color="#fff" />
            </div>
            <div>
              <span style={{ fontSize: 15, fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-0.03em" }}>LeadForge</span>
              <span style={{ fontSize: 15, fontWeight: 400, color: "var(--text-muted)" }}>AI</span>
            </div>
          </Link>

          <nav style={{ display: "flex", alignItems: "center", gap: 24, fontSize: 13, fontWeight: 600 }}>
            <a href="#features" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>Features</a>
            <a href="#how-it-works" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>How It Works</a>
            <a href="#pricing" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>Pricing</a>
            <a href="#testimonials" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>Reviews</a>
            <a href="#faq" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>FAQ</a>
          </nav>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={toggleTheme} style={{
            width: 36, height: 36, borderRadius: 8, background: "var(--bg-elevated)", border: "1px solid var(--border)",
            display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-secondary)"
          }} title="Toggle Theme">
            {theme === "light" ? <Moon size={15} /> : <Sun size={15} />}
          </button>

          <Link to="/login" style={{
            textDecoration: "none", fontSize: 12, fontWeight: 700, color: "var(--text-primary)", padding: "8px 14px"
          }}>
            Log In
          </Link>

          <Link to="/signup" className="btn-primary" style={{ fontSize: 12, padding: "9px 18px" }}>
            Get Started Free <ArrowRight size={13} />
          </Link>
        </div>
      </header>

      {/* ── HERO SECTION ── */}
      <section style={{ padding: "80px 24px 60px", maxWidth: 1200, margin: "0 auto", textAlign: "center", position: "relative" }}>

        {/* AI Badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px", borderRadius: 30,
          background: "var(--blue-dim)", border: "1px solid var(--blue-border)", marginBottom: 24
        }}>
          <Sparkles size={13} color="var(--blue-text)" />
          <span style={{ fontSize: 11, fontWeight: 800, color: "var(--blue-text)", letterSpacing: "0.04em", textTransform: "uppercase" }}>
            Autonomous B2B Lead Gen & Revenue Platform
          </span>
        </div>

        <h1 style={{ fontSize: 52, fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-0.04em", lineHeight: 1.15, maxWidth: 900, margin: "0 auto 20px" }}>
          Turn Raw Business Signals into High-Value Deals Automatically
        </h1>

        <p style={{ fontSize: 17, color: "var(--text-secondary)", lineHeight: 1.6, maxWidth: 720, margin: "0 auto 36px", fontWeight: 400 }}>
          LeadForge AI discovers targeted prospects on Google Places, scrapes decision-maker contact details, analyzes website tech stacks, and crafts hyper-personalized cold outreach campaigns on autopilot.
        </p>

        {/* Hero Actions */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, flexWrap: "wrap", marginBottom: 50 }}>
          <Link to="/signup" className="btn-primary" style={{ fontSize: 14, padding: "14px 28px", borderRadius: 12 }}>
            Start 14-Day Free Trial <ArrowRight size={15} />
          </Link>
          <button onClick={() => navigate("/app")} className="btn-ghost" style={{ fontSize: 14, padding: "14px 24px", borderRadius: 12 }}>
            <Play size={14} fill="currentColor" /> Explore Live Dashboard
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 24, fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}><CheckCircle2 size={14} color="var(--green)" /> No Credit Card Required</span>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}><CheckCircle2 size={14} color="var(--green)" /> Instant 100 Free Leads</span>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}><CheckCircle2 size={14} color="var(--green)" /> SMTP Email Pixel Tracking</span>
        </div>

        {/* ── INTERACTIVE DEMO CARD SHOWCASE ── */}
        <div style={{
          marginTop: 60, background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 20,
          padding: 28, boxShadow: "0 32px 80px rgba(0,0,0,0.12)", textAlign: "left"
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid var(--border)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ef4444" }} />
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#f59e0b" }} />
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#10b981" }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", marginLeft: 10 }}>LeadForge AI Prospector Engine v2.4</span>
            </div>
            <span className="badge-green" style={{ fontSize: 10, fontWeight: 800, padding: "3px 10px", borderRadius: 20 }}>
              ● LIVE SIMULATOR
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            {/* Left demo controls */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>1. Target Industry & Location Search</label>
                <div style={{ display: "flex", gap: 6 }}>
                  {["Dental Clinics · Nairobi", "Plumbers · Rongai", "Agencies · Westlands"].map(q => (
                    <button key={q} onClick={() => { setDemoQuery(q); setDemoState("search"); }} style={{
                      padding: "3px 8px", borderRadius: 12, fontSize: 10, fontWeight: 700,
                      background: demoQuery === q ? "var(--bg-elevated)" : "transparent",
                      color: demoQuery === q ? "var(--text-primary)" : "var(--text-muted)",
                      border: `1px solid ${demoQuery === q ? "var(--border-strong)" : "var(--border)"}`, cursor: "pointer", fontFamily: "inherit"
                    }}>{q.split(" · ")[0]}</button>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <input type="text" readOnly value={demoQuery} className="glass-input" style={{ fontSize: 13, fontWeight: 700 }} />
                <button onClick={runInteractiveDemo} disabled={demoState === "analyzing"} className="btn-primary" style={{ fontSize: 12, padding: "0 18px", flexShrink: 0 }}>
                  {demoState === "analyzing" ? "Searching…" : "Discover Leads"}
                </button>
              </div>

              {demoState === "analyzing" && (
                <div style={{ padding: 20, background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 12, textAlign: "center" }}>
                  <div style={{ width: 24, height: 24, border: "2px solid var(--border)", borderTopColor: "var(--blue)", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 10px" }} />
                  <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)" }}>Scraping Google Places & Extracting Domain Intelligence…</p>
                </div>
              )}

              {demoState === "complete" && (
                <div style={{ background: "var(--green-dim)", border: "1px solid var(--green-border)", borderRadius: 12, padding: 14, display: "flex", flexDirection: "column", gap: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "var(--green-text)" }}>✅ DISCOVERY PIPELINE COMPLETE</span>
                  <p style={{ fontSize: 12, color: "var(--text-secondary)" }}>Extracted 5 verified dental practices, 3 direct contact emails, and detected missing HTTPS SSL certificates.</p>
                </div>
              )}
            </div>

            {/* Right demo result mock card */}
            <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 14, padding: 18, display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <h4 style={{ fontSize: 14, fontWeight: 800, color: "var(--text-primary)" }}>Apex Dental Specialist Center</h4>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>Nairobi, Kenya • apexdental.co.ke</p>
                </div>
                <span className="badge-blue" style={{ fontSize: 11, fontWeight: 800, padding: "2px 8px", borderRadius: 6 }}>
                  KES 450,000 Opportunity
                </span>
              </div>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 4, background: "var(--bg-surface)", border: "1px solid var(--border)" }}>
                  📧 info@apexdental.co.ke
                </span>
                <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 4, background: "var(--bg-surface)", border: "1px solid var(--border)" }}>
                  📞 +254 712 345678
                </span>
              </div>

              <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 8, padding: 10, fontSize: 11, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                <strong>AI Proposal Recommendation:</strong> Website requires modern responsive redesign and automated appointment booking widget.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── METRICS & SOCIAL PROOF BAR ── */}
      <section style={{ borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", background: "var(--bg-surface)", padding: "40px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 30, textAlign: "center" }}>
          <div>
            <p style={{ fontSize: 36, fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-0.03em" }}>500,000+</p>
            <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", marginTop: 4 }}>B2B Prospects Discovered</p>
          </div>
          <div>
            <p style={{ fontSize: 36, fontWeight: 900, color: "var(--blue-text)", letterSpacing: "-0.03em" }}>$42M+</p>
            <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", marginTop: 4 }}>Pipeline Value Generated</p>
          </div>
          <div>
            <p style={{ fontSize: 36, fontWeight: 900, color: "var(--green-text)", letterSpacing: "-0.03em" }}>99.8%</p>
            <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", marginTop: 4 }}>Domain Extraction Accuracy</p>
          </div>
          <div>
            <p style={{ fontSize: 36, fontWeight: 900, color: "var(--amber-text)", letterSpacing: "-0.03em" }}>4.9 / 5.0</p>
            <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", marginTop: 4 }}>Customer Satisfaction Rating</p>
          </div>
        </div>
      </section>

      {/* ── FEATURES SECTION ── */}
      <section id="features" style={{ padding: "90px 24px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <span className="label-caps" style={{ color: "var(--blue-text)" }}>Everything You Need To Scale Revenue</span>
          <h2 style={{ fontSize: 36, fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-0.03em", marginTop: 8 }}>
            Engineered for Modern B2B Growth Teams
          </h2>
          <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 8, maxWidth: 600, margin: "8px auto 0" }}>
            Replace 5 fragmented sales tools with one unified AI-driven prospect discovery and revenue acceleration engine.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24 }}>
          {/* Feature 1 */}
          <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 28, display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ width: 42, height: 42, borderRadius: 10, background: "var(--blue-dim)", border: "1px solid var(--blue-border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--blue-text)" }}>
              <Radar size={20} />
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 800, color: "var(--text-primary)" }}>Google Places & Maps Scraper</h3>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>
              Target any business category in any city worldwide. Extract company names, physical addresses, ratings, and phone numbers in seconds.
            </p>
          </div>

          {/* Feature 2 */}
          <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 28, display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ width: 42, height: 42, borderRadius: 10, background: "var(--green-dim)", border: "1px solid var(--green-border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--green-text)" }}>
              <Globe size={20} />
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 800, color: "var(--text-primary)" }}>Deep Website Scraper & Intelligence</h3>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>
              Inspect target domains automatically to uncover direct contact emails, social links (LinkedIn, Twitter), SSL status, and tech stack tags.
            </p>
          </div>

          {/* Feature 3 */}
          <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 28, display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ width: 42, height: 42, borderRadius: 10, background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.25)", display: "flex", alignItems: "center", justifyContent: "center", color: "#8b5cf6" }}>
              <Sparkles size={20} />
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 800, color: "var(--text-primary)" }}>AI Cold Outreach Generator</h3>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>
              Craft hyper-relevant personalized cold email templates tailored to each prospect's website content, pain points, and valuation metrics.
            </p>
          </div>

          {/* Feature 4 */}
          <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 28, display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ width: 42, height: 42, borderRadius: 10, background: "var(--amber-dim)", border: "1px solid var(--amber-border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--amber-text)" }}>
              <Mail size={20} />
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 800, color: "var(--text-primary)" }}>SMTP Delivery & Open Tracking Pixel</h3>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>
              Send campaigns via your preferred SMTP relay or Google App Password. Automatic 1x1 transparent PNG pixel tracking logs recipient opens.
            </p>
          </div>

          {/* Feature 5 */}
          <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 28, display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ width: 42, height: 42, borderRadius: 10, background: "var(--blue-dim)", border: "1px solid var(--blue-border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--blue-text)" }}>
              <DollarSign size={20} />
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 800, color: "var(--text-primary)" }}>Deals & Revenue Pipeline</h3>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>
              Manage active opportunities with visual Kanban boards, deal stage tracking, expected revenue probability forecasting, and CSV exports.
            </p>
          </div>

          {/* Feature 6 */}
          <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 28, display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ width: 42, height: 42, borderRadius: 10, background: "var(--green-dim)", border: "1px solid var(--green-border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--green-text)" }}>
              <Shield size={20} />
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 800, color: "var(--text-primary)" }}>Enterprise Security & Compliance</h3>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>
              Built with bank-grade encryption, tenant organization isolation, granular user roles, rate limiting, and complete audit trail logs.
            </p>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS WORKFLOW ── */}
      <section id="how-it-works" style={{ background: "var(--bg-elevated)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", padding: "90px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <span className="label-caps" style={{ color: "var(--blue-text)" }}>Simple 4-Step Process</span>
            <h2 style={{ fontSize: 36, fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-0.03em", marginTop: 8 }}>
              How LeadForge AI Automates Your Growth Pipeline
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
            {[
              { num: "01", title: "Select Location & Industry", desc: "Choose target preset keywords or custom business niches in any city worldwide." },
              { num: "02", title: "Scrape & Extract Contacts", desc: "LeadForge analyzes domain websites, gathering verified emails, phones, & tech tags." },
              { num: "03", title: "Generate & Send Outreach", desc: "AI crafts customized cold emails and dispatches them via secure SMTP relays." },
              { num: "04", title: "Track Opens & Close Deals", desc: "Monitor pixel open events, review AI proposals, and close high-value contracts." },
            ].map((step, i) => (
              <div key={i} style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 24, position: "relative" }}>
                <span style={{ fontSize: 32, fontWeight: 900, color: "var(--blue-text)", opacity: 0.8 }}>{step.num}</span>
                <h4 style={{ fontSize: 16, fontWeight: 800, color: "var(--text-primary)", marginTop: 12, marginBottom: 8 }}>{step.title}</h4>
                <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING SECTION ── */}
      <section id="pricing" style={{ padding: "90px 24px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <span className="label-caps" style={{ color: "var(--blue-text)" }}>Transparent Pricing</span>
          <h2 style={{ fontSize: 36, fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-0.03em", marginTop: 8 }}>
            Simple Plans for Every Stage of Growth
          </h2>

          {/* Billing Toggle */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginTop: 24, background: "var(--bg-elevated)", padding: "4px 8px", borderRadius: 30, border: "1px solid var(--border)" }}>
            <button onClick={() => setIsAnnual(false)} style={{
              padding: "6px 16px", borderRadius: 20, fontSize: 12, fontWeight: 700, border: "none", cursor: "pointer",
              background: !isAnnual ? "var(--bg-surface)" : "transparent", color: !isAnnual ? "var(--text-primary)" : "var(--text-muted)",
              boxShadow: !isAnnual ? "0 2px 8px rgba(0,0,0,0.06)" : "none"
            }}>Monthly Billing</button>
            <button onClick={() => setIsAnnual(true)} style={{
              padding: "6px 16px", borderRadius: 20, fontSize: 12, fontWeight: 700, border: "none", cursor: "pointer",
              background: isAnnual ? "var(--bg-surface)" : "transparent", color: isAnnual ? "var(--text-primary)" : "var(--text-muted)",
              boxShadow: isAnnual ? "0 2px 8px rgba(0,0,0,0.06)" : "none"
            }}>
              Annual Billing <span className="badge-green" style={{ fontSize: 9, padding: "2px 6px", borderRadius: 10, marginLeft: 4 }}>Save 20%</span>
            </button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24, alignItems: "stretch" }}>
          {/* Starter Plan */}
          <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 20, padding: 32, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)" }}>Starter</h3>
              <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>Ideal for solo founders & independent consultants.</p>
              <div style={{ margin: "24px 0" }}>
                <span style={{ fontSize: 42, fontWeight: 900, color: "var(--text-primary)" }}>${isAnnual ? "29" : "36"}</span>
                <span style={{ fontSize: 13, color: "var(--text-muted)" }}> / month</span>
              </div>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 12, fontSize: 13, color: "var(--text-secondary)" }}>
                <li style={{ display: "flex", alignItems: "center", gap: 8 }}><Check size={16} color="var(--green)" /> 500 Prospect Searches / mo</li>
                <li style={{ display: "flex", alignItems: "center", gap: 8 }}><Check size={16} color="var(--green)" /> Google Places & Web Scraper</li>
                <li style={{ display: "flex", alignItems: "center", gap: 8 }}><Check size={16} color="var(--green)" /> AI Email Generator</li>
                <li style={{ display: "flex", alignItems: "center", gap: 8 }}><Check size={16} color="var(--green)" /> SMTP Email Dispatch</li>
                <li style={{ display: "flex", alignItems: "center", gap: 8 }}><Check size={16} color="var(--green)" /> Basic Deals Kanban Board</li>
              </ul>
            </div>
            <Link to="/signup" className="btn-ghost" style={{ marginTop: 32, justifyContent: "center", padding: "12px 0" }}>
              Start 14-Day Free Trial
            </Link>
          </div>

          {/* Pro Plan (Featured) */}
          <div style={{
            background: "var(--bg-surface)", border: "2px solid var(--blue)", borderRadius: 20, padding: 32,
            display: "flex", flexDirection: "column", justifyContent: "space-between", position: "relative",
            boxShadow: "0 20px 40px rgba(37,99,235,0.1)"
          }}>
            <span style={{
              position: "absolute", top: -13, left: "50%", transform: "translateX(-50%)",
              background: "var(--blue)", color: "#fff", fontSize: 10, fontWeight: 900, padding: "4px 14px", borderRadius: 20, letterSpacing: "0.06em"
            }}>MOST POPULAR</span>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)" }}>Professional</h3>
              <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>For growing sales teams & B2B agencies.</p>
              <div style={{ margin: "24px 0" }}>
                <span style={{ fontSize: 42, fontWeight: 900, color: "var(--text-primary)" }}>${isAnnual ? "79" : "99"}</span>
                <span style={{ fontSize: 13, color: "var(--text-muted)" }}> / month</span>
              </div>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 12, fontSize: 13, color: "var(--text-secondary)" }}>
                <li style={{ display: "flex", alignItems: "center", gap: 8 }}><Check size={16} color="var(--green)" /> 5,000 Prospect Searches / mo</li>
                <li style={{ display: "flex", alignItems: "center", gap: 8 }}><Check size={16} color="var(--green)" /> Deep Domain & Tech Stack Enrichment</li>
                <li style={{ display: "flex", alignItems: "center", gap: 8 }}><Check size={16} color="var(--green)" /> 1x1 Open Pixel Telemetry Tracking</li>
                <li style={{ display: "flex", alignItems: "center", gap: 8 }}><Check size={16} color="var(--green)" /> AI Solution Proposal Generator</li>
                <li style={{ display: "flex", alignItems: "center", gap: 8 }}><Check size={16} color="var(--green)" /> Revenue Forecasting & CSV Exports</li>
              </ul>
            </div>
            <Link to="/signup" className="btn-primary" style={{ marginTop: 32, justifyContent: "center", padding: "12px 0" }}>
              Start Pro Free Trial <ArrowRight size={14} />
            </Link>
          </div>

          {/* Enterprise Plan */}
          <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 20, padding: 32, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)" }}>Enterprise</h3>
              <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>Custom pipeline scale for enterprise teams.</p>
              <div style={{ margin: "24px 0" }}>
                <span style={{ fontSize: 42, fontWeight: 900, color: "var(--text-primary)" }}>${isAnnual ? "249" : "299"}</span>
                <span style={{ fontSize: 13, color: "var(--text-muted)" }}> / month</span>
              </div>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 12, fontSize: 13, color: "var(--text-secondary)" }}>
                <li style={{ display: "flex", alignItems: "center", gap: 8 }}><Check size={16} color="var(--green)" /> Unlimited Prospect Searches</li>
                <li style={{ display: "flex", alignItems: "center", gap: 8 }}><Check size={16} color="var(--green)" /> Dedicated SMTP Relay & Custom IP</li>
                <li style={{ display: "flex", alignItems: "center", gap: 8 }}><Check size={16} color="var(--green)" /> Custom LLM Model Fine-Tuning</li>
                <li style={{ display: "flex", alignItems: "center", gap: 8 }}><Check size={16} color="var(--green)" /> Multi-User Team Roles & Audit Logs</li>
                <li style={{ display: "flex", alignItems: "center", gap: 8 }}><Check size={16} color="var(--green)" /> 24/7 Priority SLA & Dedicated Manager</li>
              </ul>
            </div>
            <Link to="/signup" className="btn-ghost" style={{ marginTop: 32, justifyContent: "center", padding: "12px 0" }}>
              Contact Sales Team
            </Link>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS SECTION ── */}
      <section id="testimonials" style={{ background: "var(--bg-elevated)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", padding: "90px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <span className="label-caps" style={{ color: "var(--blue-text)" }}>Verified Reviews</span>
            <h2 style={{ fontSize: 36, fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-0.03em", marginTop: 8 }}>
              Loved by Sales Directors & Founders Worldwide
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24 }}>
            {[
              {
                quote: "LeadForge AI cut our cold prospecting research time by 80%. Finding qualified local businesses and generating instant proposal decks has completely transformed our agency pipeline.",
                author: "Sarah Jenkins", role: "Head of Growth", company: "Apex Digital Media", rating: 5
              },
              {
                quote: "The open tracking pixel and custom AI email generator allowed us to achieve a 48% open rate and close $180,000 in new B2B client contracts within our first 30 days.",
                author: "David Ochieng", role: "Founder & CEO", company: "Nairobi Cloud Solutions", rating: 5
              },
              {
                quote: "Having prospect discovery, website intelligence scraping, and deals Kanban tracking in one clean interface is a game changer for our sales reps.",
                author: "Marcus Thorne", role: "VP of Business Development", company: "Vanguard Tech", rating: 5
              }
            ].map((t, idx) => (
              <div key={idx} style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 28, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} size={15} fill="#f59e0b" color="#f59e0b" />
                    ))}
                  </div>
                  <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7, fontStyle: "italic" }}>"{t.quote}"</p>
                </div>
                <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#111827", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#fff" }}>
                    {t.author.charAt(0)}
                  </div>
                  <div>
                    <h5 style={{ fontSize: 13, fontWeight: 800, color: "var(--text-primary)" }}>{t.author}</h5>
                    <p style={{ fontSize: 11, color: "var(--text-muted)" }}>{t.role} • {t.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ SECTION ── */}
      <section id="faq" style={{ padding: "90px 24px", maxWidth: 800, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <span className="label-caps" style={{ color: "var(--blue-text)" }}>Got Questions?</span>
          <h2 style={{ fontSize: 36, fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-0.03em", marginTop: 8 }}>
            Frequently Asked Questions
          </h2>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {faqItems.map((item, idx) => (
            <div key={idx} style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
              <button onClick={() => setActiveFaq(activeFaq === idx ? null : idx)} style={{
                width: "100%", padding: "18px 20px", display: "flex", alignItems: "center", justifyContent: "space-between",
                background: "none", border: "none", cursor: "pointer", textAlign: "left", fontSize: 14, fontWeight: 800, color: "var(--text-primary)"
              }}>
                {item.q}
                <ChevronDown size={16} style={{ transform: activeFaq === idx ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
              </button>
              {activeFaq === idx && (
                <div style={{ padding: "0 20px 20px", fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7, borderTop: "1px solid var(--border)", paddingTop: 14 }}>
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section style={{ padding: "0 24px 90px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{
          background: "linear-gradient(135deg, #111827 0%, #1f2937 100%)", borderRadius: 24, padding: "60px 32px",
          textAlign: "center", color: "#fff", boxShadow: "0 24px 60px rgba(0,0,0,0.2)"
        }}>
          <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--green)" }}>
            ⚡ ACCELERATE YOUR REVENUE TODAY
          </span>
          <h2 style={{ fontSize: 40, fontWeight: 900, letterSpacing: "-0.03em", marginTop: 12, marginBottom: 16 }}>
            Ready to Supercharge Your B2B Sales Pipeline?
          </h2>
          <p style={{ fontSize: 15, color: "#9ca3af", maxWidth: 600, margin: "0 auto 32px", lineHeight: 1.6 }}>
            Join 2,500+ sales leaders automating prospect discovery, domain intelligence enrichment, and high-converting cold email outreach.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
            <Link to="/signup" style={{
              background: "#fff", color: "#111827", textDecoration: "none", fontSize: 14, fontWeight: 800,
              padding: "14px 30px", borderRadius: 12, display: "inline-flex", alignItems: "center", gap: 8
            }}>
              Start Free Trial Now <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: "1px solid var(--border)", background: "var(--bg-surface)", padding: "50px 24px 30px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 40, marginBottom: 40 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: "#111827", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Sparkles size={14} color="#fff" />
              </div>
              <span style={{ fontSize: 14, fontWeight: 900, color: "var(--text-primary)" }}>LeadForge AI</span>
            </div>
            <p style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6 }}>
              Autonomous B2B prospect discovery, website intelligence scraping, & AI-powered cold email engine.
            </p>
          </div>

          <div>
            <h5 style={{ fontSize: 12, fontWeight: 800, color: "var(--text-primary)", marginBottom: 12, textTransform: "uppercase" }}>Platform</h5>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 8, fontSize: 12 }}>
              <li><Link to="/app/discovery" style={{ color: "var(--text-muted)", textDecoration: "none" }}>Prospect Discovery</Link></li>
              <li><Link to="/app/companies" style={{ color: "var(--text-muted)", textDecoration: "none" }}>Company Intelligence</Link></li>
              <li><Link to="/app/deals" style={{ color: "var(--text-muted)", textDecoration: "none" }}>Deals Kanban Pipeline</Link></li>
              <li><Link to="/app/settings" style={{ color: "var(--text-muted)", textDecoration: "none" }}>SMTP & AI Settings</Link></li>
            </ul>
          </div>

          <div>
            <h5 style={{ fontSize: 12, fontWeight: 800, color: "var(--text-primary)", marginBottom: 12, textTransform: "uppercase" }}>Account</h5>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 8, fontSize: 12 }}>
              <li><Link to="/login" style={{ color: "var(--text-muted)", textDecoration: "none" }}>Log In</Link></li>
              <li><Link to="/signup" style={{ color: "var(--text-muted)", textDecoration: "none" }}>Sign Up Free</Link></li>
              <li><Link to="/app" style={{ color: "var(--text-muted)", textDecoration: "none" }}>Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h5 style={{ fontSize: 12, fontWeight: 800, color: "var(--text-primary)", marginBottom: 12, textTransform: "uppercase" }}>System Status</h5>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--green-text)", fontWeight: 700 }}>
              <div className="dot-pulse" style={{ background: "var(--live-dot)" }} /> All Systems Operational
            </div>
            <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 8 }}>Uptime 99.98% • Latency 140ms</p>
          </div>
        </div>

        <div style={{ maxWidth: 1200, margin: "0 auto", borderTop: "1px solid var(--border)", paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11, color: "var(--text-muted)" }}>
          <span>© {new Date().getFullYear()} LeadForge AI Inc. All rights reserved.</span>
          <div style={{ display: "flex", gap: 16 }}>
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Security</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
