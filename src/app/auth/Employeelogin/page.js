"use client";

import { useState } from "react";
import axios from "axios";

const BASE = axios.create({
  baseURL: "https://pencilkraft.in/api/auth",
  headers: { "ngrok-skip-browser-warning": "true" },
});

export default function AuthPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loginForm, setLoginForm]       = useState({ email: "", password: "" });
  const [loginErrors, setLoginErrors]   = useState({});
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [redirectRole, setRedirectRole] = useState("");

  // ── SIGN IN HANDLERS ──────────────────────────────────────
  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    if (loginErrors[name])
      setLoginErrors((p) => { const n = { ...p }; delete n[name]; return n; });
    if (loginErrors.general)
      setLoginErrors((p) => { const n = { ...p }; delete n.general; return n; });
    setLoginForm((p) => ({ ...p, [name]: value }));
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!loginForm.email.trim())    errs.email    = "Email is required";
    if (!loginForm.password.trim()) errs.password = "Password is required";
    if (Object.keys(errs).length)   { setLoginErrors(errs); return; }

    setLoginLoading(true);
    setLoginErrors({});

    try {
      const res = await BASE.post("/login", {
        email:    loginForm.email.trim(),
        password: loginForm.password,
      });

      if (res.data && res.data.success === false) {
        if (res.data.errors) setLoginErrors(res.data.errors);
        else setLoginErrors({ general: res.data.message || "Login failed. Please try again." });
        return;
      }

      const payload = res.data?.data ?? {};
      const token   = payload.token;
      const user    = payload.user;
      const company = payload.company;

      // ── Store in localStorage ──────────────────────────
      if (token)   localStorage.setItem("employee_auth_token",   token);
      if (user)    localStorage.setItem("auth_user",    JSON.stringify(user));
      if (company) localStorage.setItem("auth_company", JSON.stringify(company));
      localStorage.setItem("auth_payload", JSON.stringify(res.data));

      // ── Set role cookie so middleware.js can read it ───
      // This is what blocks employees from visiting /Admin/* routes
      // localStorage is invisible to middleware — cookies are not
      const role = user?.role ?? "employee";
      document.cookie = `user_role=${role}; path=/; SameSite=Lax; max-age=${8 * 60 * 60}`;

      // ── Redirect based on role ─────────────────────────
      // admin    → /Admin/Dashboard
      // employee → /Employee/Dashboard
      const dest = role === "admin" ? "/Admin/Dashboard" : "/Employee/Dashboard";

      setRedirectRole(role);
      setLoginSuccess(true);
      setTimeout(() => { window.location.href = dest; }, 1200);

    } catch (err) {
      const data = err?.response?.data;
      if (data?.errors)       setLoginErrors(data.errors);
      else if (data?.message) setLoginErrors({ general: data.message });
      else                    setLoginErrors({ general: "Unable to connect. Please try again." });
    } finally {
      setLoginLoading(false);
    }
  };

  // ── STYLE HELPERS ──────────────────────────────────────────
  const inputBase = {
    backgroundColor: "var(--surface-container-low)",
    color: "var(--on-surface)",
    outline: "none",
  };
  const loginBorder = (name) =>
    loginErrors[name] ? "2px solid var(--error)" : "2px solid transparent";

  const FieldError = ({ name }) => {
    const err = loginErrors[name];
    if (!err) return null;
    return (
      <p className="flex items-center gap-1 text-xs mt-1.5 font-medium" style={{ color: "var(--error)" }}>
        <span className="material-symbols-outlined" style={{ fontSize: 14, fontVariationSettings: "'FILL' 1" }}>
          cancel
        </span>
        {err}
      </p>
    );
  };

  const LoginSuccessBanner = () => (
    <div
      className="rounded-2xl p-6 flex flex-col items-center text-center gap-3"
      style={{
        background: "linear-gradient(135deg,rgba(0,88,186,0.06),rgba(84,227,252,0.08))",
        border: "1.5px solid rgba(0,88,186,0.15)",
      }}
    >
      <div className="relative">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg,var(--primary),var(--secondary-container))",
            boxShadow: "0 8px 24px rgba(0,88,186,0.3)",
          }}
        >
          <span
            className="material-symbols-outlined text-white"
            style={{ fontSize: 32, fontVariationSettings: "'FILL' 1" }}
          >
            verified_user
          </span>
        </div>
        <div
          className="absolute inset-0 rounded-full animate-ping"
          style={{ backgroundColor: "rgba(84,227,252,0.2)", animationDuration: "1.2s" }}
        />
      </div>
      <div>
        <p className="font-bold text-xl" style={{ fontFamily: "'Manrope',sans-serif", color: "var(--on-surface)" }}>
          Logged in successfully!
        </p>
        <p className="text-sm mt-1" style={{ color: "var(--on-surface-variant)" }}>
          Signed in as{" "}
          <span style={{ color: "var(--primary)", fontWeight: 700, textTransform: "capitalize" }}>
            {redirectRole}
          </span>
        </p>
        <p className="text-sm mt-2 flex items-center justify-center gap-1.5" style={{ color: "var(--on-surface-variant)" }}>
          <span className="material-symbols-outlined spinning" style={{ fontSize: 14, color: "var(--primary)" }}>
            progress_activity
          </span>
          Redirecting to your dashboard…
        </p>
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
        .material-symbols-outlined {
          font-family:'Material Symbols Outlined'; font-weight:normal; font-style:normal;
          font-size:24px; line-height:1; letter-spacing:normal; text-transform:none;
          display:inline-block; white-space:nowrap; direction:ltr;
          -webkit-font-smoothing:antialiased;
          font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24;
          user-select:none;
        }
        @keyframes spin { to { transform:rotate(360deg); } }
        .spinning { animation:spin 0.8s linear infinite; display:inline-block; }
        :root {
          --primary:#0058ba; --primary-dim:#004da4; --primary-fixed:#6c9fff;
          --on-primary:#f0f2ff;
          --secondary:#006573; --secondary-fixed:#54e3fc; --on-secondary:#daf8ff;
          --secondary-container:#54e3fc; --on-secondary-container:#004f5a;
          --tertiary:#006850; --tertiary-fixed:#45fec9; --on-tertiary:#c6ffe7;
          --error:#b31b25; --on-error:#ffefee;
          --surface:#f5f7f9;
          --surface-container-lowest:#ffffff; --surface-container-low:#eef1f3;
          --surface-container:#e5e9eb; --surface-container-high:#dfe3e6;
          --on-surface:#2c2f31; --on-surface-variant:#595c5e;
          --outline:#747779; --outline-variant:#abadaf;
        }
      `}</style>

      <div
        className="relative min-h-screen flex items-stretch overflow-x-auto"
        style={{
          backgroundColor: "var(--surface)",
          color: "var(--on-surface)",
          fontFamily: "'Plus Jakarta Sans',sans-serif",
        }}
      >
        {/* Background blobs */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute rounded-full" style={{ top:"-20%", right:"-10%", width:"60%", height:"60%", backgroundColor:"var(--secondary-container)", opacity:0.2, filter:"blur(120px)" }} />
          <div className="absolute rounded-full" style={{ bottom:"-10%", left:"-5%", width:"40%", height:"40%", backgroundColor:"var(--primary)", opacity:0.1, filter:"blur(100px)" }} />
        </div>

        {/* ═══ LEFT SIDE – BRANDING ═══ */}
        <section
          className="hidden lg:flex relative w-[35%] flex-col justify-center px-8 xl:px-12 backdrop-blur-sm shadow-2xl rounded-r-[2rem]"
          style={{ backgroundColor: "rgba(255,255,255,0.4)" }}
        >
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute rounded-full" style={{ top:"-20%", right:"-10%", width:"80%", height:"80%", backgroundColor:"var(--secondary-container)", opacity:0.2, filter:"blur(100px)" }} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md"
                style={{ background:"linear-gradient(to top right,var(--primary),var(--secondary-container))" }}
              >
                <span className="material-symbols-outlined text-2xl" style={{ color:"var(--on-primary)", fontVariationSettings:"'FILL' 1" }}>
                  account_balance_wallet
                </span>
              </div>
              <span className="text-2xl font-black tracking-tighter" style={{ color:"var(--primary)", fontFamily:"'Manrope',sans-serif" }}>
                Universal Trading
              </span>
            </div>

            <h2 className="font-extrabold text-4xl tracking-tight leading-[1.2]" style={{ fontFamily:"'Manrope',sans-serif", color:"var(--on-surface)" }}>
              Secure access <br />to your{" "}
              <span style={{ background:"linear-gradient(to right,var(--primary),var(--secondary-container))", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
                financial world
              </span>
            </h2>
            <p className="mt-5 text-base max-w-sm leading-relaxed" style={{ color:"var(--on-surface-variant)" }}>
              Institutional-grade vault with real-time analytics and bank-level encryption.
            </p>

            <div className="mt-6 flex flex-col gap-3">
              <div className="flex items-center gap-3 rounded-xl px-4 py-3" style={{ backgroundColor:"rgba(0,88,186,0.07)", border:"1px solid rgba(0,88,186,0.15)" }}>
                <span className="material-symbols-outlined" style={{ color:"var(--primary)", fontSize:20, fontVariationSettings:"'FILL' 1" }}>admin_panel_settings</span>
                <div>
                  <p className="text-sm font-semibold" style={{ color:"var(--on-surface)" }}>Admin</p>
                  <p className="text-xs" style={{ color:"var(--on-surface-variant)" }}>Full access · redirected to Admin Dashboard</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl px-4 py-3" style={{ backgroundColor:"rgba(0,101,115,0.07)", border:"1px solid rgba(0,101,115,0.15)" }}>
                <span className="material-symbols-outlined" style={{ color:"var(--secondary)", fontSize:20, fontVariationSettings:"'FILL' 1" }}>badge</span>
                <div>
                  <p className="text-sm font-semibold" style={{ color:"var(--on-surface)" }}>Employee</p>
                  <p className="text-xs" style={{ color:"var(--on-surface-variant)" }}>Restricted · Employee Dashboard only</p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4" style={{ borderTop:"1px solid rgba(171,173,175,0.2)" }}>
              {[["verified","2FA & Biometric ready"],["security","24/7 fraud monitoring"]].map(([icon, label]) => (
                <div key={icon} className="flex items-center gap-3 text-sm mt-3" style={{ color:"var(--on-surface-variant)" }}>
                  <span className="material-symbols-outlined" style={{ color:"var(--primary)" }}>{icon}</span>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ RIGHT SIDE – FORM ═══ */}
        <section className="relative z-10 w-full lg:w-[65%] flex items-center justify-center p-6 md:p-12 lg:p-16">
          <div
            className="w-full max-w-2xl rounded-[2.5rem] p-8 md:p-10"
            style={{ backgroundColor:"var(--surface-container-lowest)", boxShadow:"0px 20px 40px rgba(0,88,186,0.08)" }}
          >
            <div className="lg:hidden mb-8">
              <span className="text-2xl font-black tracking-tighter" style={{ color:"var(--primary)", fontFamily:"'Manrope',sans-serif" }}>
                Universal Trading
              </span>
            </div>

            <div className="space-y-6">
              <div className="mb-6">
                <h1 className="font-bold text-3xl tracking-tight" style={{ fontFamily:"'Manrope',sans-serif" }}>
                  Welcome back
                </h1>
                <p className="mt-2" style={{ color:"var(--on-surface-variant)" }}>
                  Securely access your Ethereal Vault.
                </p>
              </div>

              {loginSuccess ? (
                <LoginSuccessBanner />
              ) : (
                <form onSubmit={handleLoginSubmit}>
                  <div className="space-y-5">

                    {loginErrors.general && (
                      <div
                        className="rounded-xl p-4 flex items-center gap-3"
                        style={{ backgroundColor:"rgba(179,27,37,0.06)", border:"1.5px solid var(--error)" }}
                      >
                        <span className="material-symbols-outlined" style={{ color:"var(--error)", fontSize:18, fontVariationSettings:"'FILL' 1" }}>error</span>
                        <p className="text-sm font-medium" style={{ color:"var(--error)" }}>{loginErrors.general}</p>
                      </div>
                    )}

                    {/* Email */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest mb-2 ml-1" style={{ color:"var(--on-surface-variant)" }}>
                        Email
                      </label>
                      <div className="relative rounded-xl overflow-hidden" style={{ border: loginBorder("email") }}>
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2" style={{ color:"var(--primary-dim)" }}>mail</span>
                        <input
                          type="email"
                          name="email"
                          value={loginForm.email}
                          onChange={handleLoginChange}
                          className="w-full pl-12 pr-4 py-4 border-none rounded-xl"
                          placeholder="you@example.com"
                          style={inputBase}
                          onFocus={(e) => (e.currentTarget.style.backgroundColor = "var(--surface-container-lowest)")}
                          onBlur={(e)  => (e.currentTarget.style.backgroundColor = "var(--surface-container-low)")}
                        />
                      </div>
                      <FieldError name="email" />
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest mb-2 ml-1" style={{ color:"var(--on-surface-variant)" }}>
                        Password
                      </label>
                      <div className="relative rounded-xl overflow-hidden" style={{ border: loginBorder("password") }}>
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2" style={{ color:"var(--primary-dim)" }}>lock</span>
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={loginForm.password}
                          onChange={handleLoginChange}
                          className="w-full pl-12 pr-12 py-4 border-none rounded-xl"
                          placeholder="••••••••"
                          style={inputBase}
                          onFocus={(e) => (e.currentTarget.style.backgroundColor = "var(--surface-container-lowest)")}
                          onBlur={(e)  => (e.currentTarget.style.backgroundColor = "var(--surface-container-low)")}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          className="absolute right-4 top-1/2 -translate-y-1/2"
                          style={{ color:"var(--outline)" }}
                        >
                          <span className="material-symbols-outlined">
                            {showPassword ? "visibility_off" : "visibility"}
                          </span>
                        </button>
                      </div>
                      <FieldError name="password" />
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={loginLoading}
                      className="w-full py-4 font-bold text-lg rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
                      style={{
                        background: "linear-gradient(to right,var(--primary),var(--secondary-container))",
                        color: "var(--on-primary)",
                        boxShadow: "0 20px 40px rgba(0,88,186,0.2)",
                        fontFamily: "'Manrope',sans-serif",
                        opacity: loginLoading ? 0.7 : 1,
                        cursor: loginLoading ? "not-allowed" : "pointer",
                      }}
                    >
                      {loginLoading ? (
                        <>
                          <span className="material-symbols-outlined spinning" style={{ fontSize:20 }}>progress_activity</span>
                          Signing in…
                        </>
                      ) : (
                        <>
                          Sign In <span className="material-symbols-outlined">arrow_forward</span>
                        </>
                      )}
                    </button>

                  </div>
                </form>
              )}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}