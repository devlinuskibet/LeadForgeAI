import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles, ArrowRight, Lock, Mail, Eye, EyeOff, ShieldCheck } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFillDemo = () => {
    setEmail("linus@leadforge.ai");
    setPassword("password123");
    setError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    setLoading(true);
    setError("");

    setTimeout(() => {
      localStorage.setItem("lf-auth-user", JSON.stringify({
        email: email,
        name: email.split("@")[0] || "Sales Executive",
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
          Don't have an account? <Link to="/signup" style={{ color: "var(--blue-text)", fontWeight: 700, textDecoration: "none" }}>Sign Up Free</Link>
        </span>
      </header>

      {/* Main Container */}
      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{
          background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 20,
          padding: 36, maxWidth: 440, width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.08)",
          display: "flex", flexDirection: "column", gap: 20
        }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-0.03em" }}>Log in to LeadForge</h2>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>Enter your credentials to access your autonomous sales engine.</p>
          </div>

          {/* Quick Demo Fill Callout */}
          <div style={{
            background: "var(--blue-dim)", border: "1px solid var(--blue-border)", borderRadius: 12, padding: "12px 14px",
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10
          }}>
            <div style={{ fontSize: 11, color: "var(--blue-text)", fontWeight: 600 }}>
              💡 Testing out LeadForge AI?
            </div>
            <button type="button" onClick={handleFillDemo} style={{
              background: "var(--bg-surface)", border: "1px solid var(--blue-border)", color: "var(--blue-text)",
              borderRadius: 6, padding: "4px 10px", fontSize: 11, fontWeight: 800, cursor: "pointer", fontFamily: "inherit"
            }}>
              Fill Demo Account
            </button>
          </div>

          {error && (
            <div style={{ background: "var(--red-dim)", border: "1px solid var(--red-border)", color: "var(--red-text)", borderRadius: 8, padding: 10, fontSize: 12, fontWeight: 600 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Work Email Address</label>
              <div style={{ position: "relative" }}>
                <Mail size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                <input
                  type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="name@company.com" className="glass-input" style={{ paddingLeft: 34, fontSize: 13 }}
                />
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)" }}>Password</label>
                <a href="#forgot" onClick={(e) => { e.preventDefault(); alert("Password reset link sent to your registered email."); }} style={{ fontSize: 11, color: "var(--blue-text)", textDecoration: "none", fontWeight: 600 }}>Forgot password?</a>
              </div>
              <div style={{ position: "relative" }}>
                <Lock size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                <input
                  type={showPassword ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••" className="glass-input" style={{ paddingLeft: 34, paddingRight: 34, fontSize: 13 }}
                />
                <button
                  type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--text-secondary)" }}>
              <input type="checkbox" id="remember" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} style={{ cursor: "pointer" }} />
              <label htmlFor="remember" style={{ cursor: "pointer" }}>Remember me for 30 days</label>
            </div>

            <button type="submit" disabled={loading} className="btn-primary" style={{ padding: "12px 0", justifyContent: "center", fontSize: 13, marginTop: 4 }}>
              {loading ? "Authenticating Session…" : "Log In to Sales Engine"} {!loading && <ArrowRight size={14} />}
            </button>
          </form>

          <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16, textAlign: "center" }}>
            <span style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
              <ShieldCheck size={13} color="var(--green)" /> 256-bit TLS Encrypted Session Security
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
