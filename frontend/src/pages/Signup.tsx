import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles, ArrowRight, Lock, Mail, User, Building, ShieldCheck } from "lucide-react";

export default function Signup() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [password, setPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      setError("Please fill in all required fields.");
      return;
    }
    if (!agreeTerms) {
      setError("Please accept the Terms of Service to continue.");
      return;
    }
    setLoading(true);
    setError("");

    setTimeout(() => {
      localStorage.setItem("lf-auth-user", JSON.stringify({
        email: email,
        name: fullName,
        company: companyName || "My B2B Company",
        role: "Administrator"
      }));
      setLoading(false);
      navigate("/app");
    }, 900);
  };

  return (
    <div style={{
      minHeight: "100vh", background: "var(--bg-base)", color: "var(--text-primary)",
      display: "flex", flexDirection: "column", justifyContent: "space-between", fontFamily: "Inter, sans-serif"
    }}>
      {/* Header */}
      <header style={{ padding: "20px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: "#111827", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Sparkles size={16} color="#fff" />
          </div>
          <span style={{ fontSize: 15, fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-0.03em" }}>LeadForge AI</span>
        </Link>
        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
          Already have an account? <Link to="/login" style={{ color: "var(--blue-text)", fontWeight: 700, textDecoration: "none" }}>Log In</Link>
        </span>
      </header>

      {/* Main Container */}
      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{
          background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 20,
          padding: 36, maxWidth: 460, width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.08)",
          display: "flex", flexDirection: "column", gap: 20
        }}>
          <div>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 20,
              background: "var(--green-dim)", border: "1px solid var(--green-border)", marginBottom: 10
            }}>
              <span style={{ fontSize: 10, fontWeight: 800, color: "var(--green-text)", textTransform: "uppercase" }}>
                14-Day Free Trial • No Credit Card Required
              </span>
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-0.03em" }}>
              Start Growing Revenue Today
            </h2>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
              Get instant access to 100 free prospect discovery searches & AI outreach automation.
            </p>
          </div>

          {error && (
            <div style={{ background: "var(--red-dim)", border: "1px solid var(--red-border)", color: "var(--red-text)", borderRadius: 8, padding: 10, fontSize: 12, fontWeight: 600 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: 5 }}>Full Name</label>
              <div style={{ position: "relative" }}>
                <User size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                <input
                  type="text" required value={fullName} onChange={e => setFullName(e.target.value)}
                  placeholder="Linus Kibet" className="glass-input" style={{ paddingLeft: 34, fontSize: 13 }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: 5 }}>Work Email Address</label>
              <div style={{ position: "relative" }}>
                <Mail size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                <input
                  type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="linus@company.com" className="glass-input" style={{ paddingLeft: 34, fontSize: 13 }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: 5 }}>Company Name (Optional)</label>
              <div style={{ position: "relative" }}>
                <Building size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                <input
                  type="text" value={companyName} onChange={e => setCompanyName(e.target.value)}
                  placeholder="LeadForge AI Inc." className="glass-input" style={{ paddingLeft: 34, fontSize: 13 }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: 5 }}>Password</label>
              <div style={{ position: "relative" }}>
                <Lock size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                <input
                  type="password" required value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters" className="glass-input" style={{ paddingLeft: 34, fontSize: 13 }}
                />
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: "var(--text-secondary)", marginTop: 2 }}>
              <input type="checkbox" id="terms" checked={agreeTerms} onChange={e => setAgreeTerms(e.target.checked)} style={{ cursor: "pointer" }} />
              <label htmlFor="terms" style={{ cursor: "pointer" }}>
                I agree to LeadForge AI's <a href="#terms" onClick={e=>e.preventDefault()} style={{ color: "var(--blue-text)", textDecoration: "none" }}>Terms of Service</a> & <a href="#privacy" onClick={e=>e.preventDefault()} style={{ color: "var(--blue-text)", textDecoration: "none" }}>Privacy Policy</a>
              </label>
            </div>

            <button type="submit" disabled={loading} className="btn-primary" style={{ padding: "12px 0", justifyContent: "center", fontSize: 13, marginTop: 6 }}>
              {loading ? "Creating Account…" : "Create Free Account"} {!loading && <ArrowRight size={14} />}
            </button>
          </form>

          <div style={{ borderTop: "1px solid var(--border)", paddingTop: 14, textAlign: "center" }}>
            <span style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
              <ShieldCheck size={13} color="var(--green)" /> Instant Activation • Cancel Anytime
            </span>
          </div>
        </div>
      </main>

      <footer style={{ padding: "20px 32px", textAlign: "center", fontSize: 11, color: "var(--text-muted)" }}>
        © {new Date().getFullYear()} LeadForge AI Inc. All rights reserved.
      </footer>
    </div>
  );
}
