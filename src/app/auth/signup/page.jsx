"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";

const BASE = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { "ngrok-skip-browser-warning": "true" },
});

export default function AuthPage() {
  const [activeTab, setActiveTab]       = useState("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [showModal, setShowModal]       = useState(false);

  // ── SIGN IN STATE ─────────────────────────────────────────
  const [loginForm, setLoginForm]       = useState({ email: "", domain: "", password: "" });
  const [loginErrors, setLoginErrors]   = useState({});
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  // ── SIGN UP STATE ─────────────────────────────────────────
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "",
    company: "", country: "", mobile: "", domain: "", agreeTerms: false,
  });

  const [emailStatus, setEmailStatus]   = useState(null);
  const [domainStatus, setDomainStatus] = useState(null);
  const [emailMsg, setEmailMsg]         = useState("");
  const [domainMsg, setDomainMsg]       = useState("");
  const [domainManual, setDomainManual] = useState(false);
  const [submitting, setSubmitting]     = useState(false);
  const [submitErrors, setSubmitErrors] = useState({});

  const emailAbort  = useRef(null);
  const domainAbort = useRef(null);

  const tabs      = ["signin", "signup", "recover"];
  const tabIcons  = { signin: "login", signup: "person_add", recover: "lock_reset" };
  const tabLabels = { signin: "Sign In", signup: "Sign Up", recover: "Recover" };

  // ── SIGN IN HANDLERS ──────────────────────────────────────
  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    if (loginErrors[name])   setLoginErrors(p => { const n={...p}; delete n[name];   return n; });
    if (loginErrors.general) setLoginErrors(p => { const n={...p}; delete n.general; return n; });
    setLoginForm(p => ({ ...p, [name]: value }));
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!loginForm.email.trim())    errs.email    = "Email is required";
    if (!loginForm.domain.trim())   errs.domain   = "Domain is required";
    if (!loginForm.password.trim()) errs.password = "Password is required";
    if (Object.keys(errs).length) { setLoginErrors(errs); return; }

    setLoginLoading(true);
    setLoginErrors({});
    try {
      const res = await BASE.post("/api/auth/login", {
        email:    loginForm.email.trim(),
        domain:   loginForm.domain.trim(),
        password: loginForm.password,
        
      });

      if (res.data && res.data.success === false) {
        if (res.data.errors) setLoginErrors(res.data.errors);
        else setLoginErrors({ general: res.data.message || "Login failed. Please try again." });
        return;
      }

      // ── Save to localStorage ──────────────────────────────
      // API shape: { success, message, data: { user, company, token } }
      const payload  = res.data?.data ?? {};
      const token    = payload.token;
      const user     = payload.user;
      const company  = payload.company;

      if (token)   localStorage.setItem("admin_auth_token",   token);
      if (user)    localStorage.setItem("auth_user",    JSON.stringify(user));
      if (company) localStorage.setItem("auth_company", JSON.stringify(company));
      localStorage.setItem("auth_payload", JSON.stringify(res.data));

      // ── Show success flash then hard-navigate ─────────────
      setLoginSuccess(true);

      const role = user?.role ?? "";
      const dest = role === "admin" ? "/Admin/Dashboard" : "/dashboard";

      setTimeout(() => {
        window.location.href = dest;
      }, 1000);

    } catch (err) {
      const data = err?.response?.data;
      if (data?.errors)       setLoginErrors(data.errors);
      else if (data?.message) setLoginErrors({ general: data.message });
      else                    setLoginErrors({ general: "Unable to connect. Please try again." });
    } finally {
      setLoginLoading(false);
    }
  };

  // ── SIGN UP HANDLERS ──────────────────────────────────────
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (submitErrors[name]) setSubmitErrors(p => { const n={...p}; delete n[name]; return n; });
    if (name === "domain") { setDomainManual(true); setForm(p => ({ ...p, domain: value })); return; }
    if (name === "company") {
      const slug = value.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 40);
      setForm(p => ({ ...p, company: value, ...(domainManual ? {} : { domain: slug }) }));
      return;
    }
    setForm(p => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  useEffect(() => {
    const email = form.email.trim();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!email || !valid) { setEmailStatus(null); setEmailMsg(""); return; }
    if (emailAbort.current) emailAbort.current.abort();
    const ctrl = new AbortController(); emailAbort.current = ctrl;
    const t = setTimeout(async () => {
      try {
        setEmailStatus("checking"); setEmailMsg("");
        const res = await BASE.get(`/api/auth/check-email?email=${encodeURIComponent(email)}`, { signal: ctrl.signal });
        if (res.data && typeof res.data.available === "boolean") {
          setEmailStatus(res.data.available ? "available" : "taken");
          setEmailMsg(res.data.available ? "Email is available" : "Email already exists");
        } else { setEmailStatus("error"); setEmailMsg("Server error. Try again."); }
      } catch (err) {
        if (axios.isCancel(err)) return;
        setEmailStatus("error"); setEmailMsg("Unable to verify email");
      }
    }, 500);
    return () => { clearTimeout(t); ctrl.abort(); };
  }, [form.email]);

  useEffect(() => {
    const domain = form.domain.trim();
    const valid  = /^[a-zA-Z0-9-]+$/.test(domain);
    if (!domain) { setDomainStatus(null); setDomainMsg(""); return; }
    if (!valid)  { setDomainStatus("error"); setDomainMsg("Only letters, numbers and hyphens"); return; }
    if (domainAbort.current) domainAbort.current.abort();
    const ctrl = new AbortController(); domainAbort.current = ctrl;
    const t = setTimeout(async () => {
      try {
        setDomainStatus("checking"); setDomainMsg("");
        const res = await BASE.get(`/api/auth/check-domain?domain=${encodeURIComponent(domain)}`, { signal: ctrl.signal });
        let taken = false;
        if (typeof res.data.available === "boolean") taken = !res.data.available;
        else if (typeof res.data.exists === "boolean") taken = res.data.exists;
        else { setDomainStatus("error"); setDomainMsg("Could not verify domain. Try again."); return; }
        setDomainStatus(taken ? "taken" : "available");
        setDomainMsg(taken ? "Domain already taken" : "Domain is available");
      } catch (err) {
        if (axios.isCancel(err)) return;
        setDomainStatus("error"); setDomainMsg("Could not verify domain. Try again.");
      }
    }, 400);
    return () => { clearTimeout(t); ctrl.abort(); };
  }, [form.domain]);

  const isFormValid =
    form.firstName.trim().length >= 2 &&
    form.lastName.trim().length  >= 2 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) &&
    /^[a-zA-Z0-9-]+$/.test(form.domain) &&
    form.agreeTerms &&
    emailStatus  === "available" &&
    domainStatus === "available";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid || submitting) return;
    setSubmitting(true); setSubmitErrors({});
    try {
      const res = await BASE.post("/api/auth/register", form);
      if (res.data && res.data.success === false) {
        if (res.data.errors) setSubmitErrors(res.data.errors);
        else alert(res.data.message || "Registration failed.");
        return;
      }
      setShowModal(true);
      setForm({ firstName:"", lastName:"", email:"", company:"", country:"", mobile:"", domain:"", agreeTerms:false });
      setEmailStatus(null); setDomainStatus(null); setEmailMsg(""); setDomainMsg(""); setDomainManual(false);
    } catch (err) {
      const data = err?.response?.data;
      if (data?.errors) setSubmitErrors(data.errors);
      else alert(data?.message || "Error creating account. Please try again.");
    } finally { setSubmitting(false); }
  };

  // ── STYLE HELPERS ─────────────────────────────────────────
  const inputBase   = { backgroundColor:"var(--surface-container-low)", color:"var(--on-surface)", outline:"none" };
  const fieldBorder = (s) =>
    s==="taken"||s==="error" ? "2px solid var(--error)" :
    s==="available"          ? "2px solid var(--tertiary)" :
    "2px solid transparent";
  const loginBorder = (name) => loginErrors[name] ? "2px solid var(--error)" : "2px solid transparent";

  const StatusBadge = ({ status, msg }) => {
    if (!msg) return null;
    const color = status==="available"?"var(--tertiary)":status==="checking"?"var(--outline)":"var(--error)";
    const icon  = status==="available"?"check_circle":status==="checking"?"progress_activity":"cancel";
    return (
      <p className="flex items-center gap-1 text-xs mt-1.5 font-medium" style={{ color }}>
        <span className={"material-symbols-outlined"+(status==="checking"?" spinning":"")}
          style={{ fontSize:14, fontVariationSettings:status==="available"?"'FILL' 1":"'FILL' 0" }}>{icon}</span>
        {msg}
      </p>
    );
  };

  const FieldIcon = ({ status }) => {
    if (!status) return null;
    const color  = status==="available"?"var(--tertiary)":status==="checking"?"var(--outline-variant)":"var(--error)";
    const icon   = status==="available"?"check_circle":status==="checking"?"progress_activity":"cancel";
    const filled = status==="available"||status==="taken"||status==="error";
    return (
      <span className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color }}>
        <span className={"material-symbols-outlined"+(status==="checking"?" spinning":"")}
          style={{ fontSize:18, fontVariationSettings:filled?"'FILL' 1":"'FILL' 0" }}>{icon}</span>
      </span>
    );
  };

  const FieldError = ({ name, errors = submitErrors }) => {
    const errs = errors[name];
    if (!errs) return null;
    return (
      <p className="flex items-center gap-1 text-xs mt-1.5 font-medium" style={{ color:"var(--error)" }}>
        <span className="material-symbols-outlined" style={{ fontSize:14, fontVariationSettings:"'FILL' 1" }}>cancel</span>
        {Array.isArray(errs) ? errs[0] : errs}
      </p>
    );
  };

  const SuccessModal = () => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ backgroundColor:"rgba(0,0,0,0.45)", backdropFilter:"blur(8px)" }}>
      <div className="relative w-full max-w-md rounded-[2rem] overflow-hidden"
        style={{ backgroundColor:"var(--surface-container-lowest)", boxShadow:"0 32px 80px rgba(0,88,186,0.25)" }}>
        <div className="h-1.5 w-full" style={{ background:"linear-gradient(to right,var(--primary),var(--secondary-container))" }} />
        <div className="px-8 pt-10 pb-8 flex flex-col items-center text-center">
          <div className="relative mb-6">
            <div className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{ background:"linear-gradient(135deg,var(--primary),var(--secondary-container))", boxShadow:"0 12px 40px rgba(0,88,186,0.35)" }}>
              <span className="material-symbols-outlined text-white" style={{ fontSize:40, fontVariationSettings:"'FILL' 1" }}>check_circle</span>
            </div>
            <div className="absolute inset-0 rounded-full animate-ping" style={{ backgroundColor:"rgba(84,227,252,0.25)", animationDuration:"1.4s" }} />
          </div>
          <h2 className="font-extrabold text-2xl mb-2" style={{ fontFamily:"'Manrope',sans-serif", color:"var(--on-surface)" }}>Account Created! 🎉</h2>
          <p className="text-sm leading-relaxed mb-1" style={{ color:"var(--on-surface-variant)" }}>
            Welcome to <strong style={{ color:"var(--primary)" }}>Ethereal Vault</strong>. Your account is ready.
          </p>
          <p className="text-xs mb-8" style={{ color:"var(--outline)" }}>A confirmation email has been sent to your inbox.</p>
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {["⚡ Instant Access","🔒 Bank-level Security","📊 Live Markets"].map(t => (
              <span key={t} className="text-xs font-semibold px-3 py-1.5 rounded-full"
                style={{ backgroundColor:"var(--surface-container-low)", color:"var(--on-surface-variant)" }}>{t}</span>
            ))}
          </div>
          <button onClick={() => { setShowModal(false); setActiveTab("signin"); }}
            className="w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all active:scale-95"
            style={{ background:"linear-gradient(to right,var(--primary),var(--secondary-container))", color:"var(--on-primary)", fontFamily:"'Manrope',sans-serif" }}>
            <span className="material-symbols-outlined" style={{ fontSize:20 }}>login</span>Go to Sign In
          </button>
          <button onClick={() => setShowModal(false)} className="mt-3 text-xs font-medium hover:underline" style={{ color:"var(--outline)" }}>Stay on this page</button>
        </div>
      </div>
    </div>
  );

  const LoginSuccessBanner = () => (
    <div className="rounded-2xl p-6 flex flex-col items-center text-center gap-3"
      style={{ background:"linear-gradient(135deg,rgba(0,88,186,0.06),rgba(84,227,252,0.08))", border:"1.5px solid rgba(0,88,186,0.15)" }}>
      <div className="relative">
        <div className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{ background:"linear-gradient(135deg,var(--primary),var(--secondary-container))", boxShadow:"0 8px 24px rgba(0,88,186,0.3)" }}>
          <span className="material-symbols-outlined text-white" style={{ fontSize:32, fontVariationSettings:"'FILL' 1" }}>verified_user</span>
        </div>
        <div className="absolute inset-0 rounded-full animate-ping" style={{ backgroundColor:"rgba(84,227,252,0.2)", animationDuration:"1.2s" }} />
      </div>
      <div>
        <p className="font-bold text-xl" style={{ fontFamily:"'Manrope',sans-serif", color:"var(--on-surface)" }}>Logged in successfully!</p>
        <p className="text-sm mt-1.5 flex items-center justify-center gap-1.5" style={{ color:"var(--on-surface-variant)" }}>
          <span className="material-symbols-outlined spinning" style={{ fontSize:14, color:"var(--primary)" }}>progress_activity</span>
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
        .signature-gradient { background:linear-gradient(135deg,#0058ba 0%,#54e3fc 100%); }
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

      {showModal && <SuccessModal />}

      <div className="relative min-h-screen flex items-stretch overflow-x-auto"
        style={{ backgroundColor:"var(--surface)", color:"var(--on-surface)", fontFamily:"'Plus Jakarta Sans',sans-serif" }}>

        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute rounded-full" style={{ top:"-20%",right:"-10%",width:"60%",height:"60%",backgroundColor:"var(--secondary-container)",opacity:0.2,filter:"blur(120px)" }} />
          <div className="absolute rounded-full" style={{ bottom:"-10%",left:"-5%",width:"40%",height:"40%",backgroundColor:"var(--primary)",opacity:0.1,filter:"blur(100px)" }} />
        </div>

        {/* ═══ LEFT ═══ */}
        <section className="relative z-10 w-full lg:w-[65%] flex items-center justify-center p-6 md:p-12 lg:p-16">
          <div className="w-full max-w-2xl rounded-[2.5rem] p-8 md:p-10"
            style={{ backgroundColor:"var(--surface-container-lowest)", boxShadow:"0px 20px 40px rgba(0,88,186,0.08)" }}>

            <div className="lg:hidden mb-8">
              <span className="text-2xl font-black tracking-tighter" style={{ color:"var(--primary)",fontFamily:"'Manrope',sans-serif" }}>Universal Trading</span>
            </div>

            <nav className="flex gap-2 mb-10 p-1.5 rounded-2xl" style={{ backgroundColor:"var(--surface-container-low)" }}>
              {tabs.map(tab => {
                const active = activeTab === tab;
                return (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all active:scale-95 text-sm font-semibold tracking-wide"
                    style={{ fontFamily:"'Manrope',sans-serif", ...(active
                      ? { background:"linear-gradient(to right,var(--primary),var(--secondary-container))",color:"var(--on-primary)",boxShadow:"0 8px 24px rgba(0,88,186,0.2)" }
                      : { color:"var(--on-surface-variant)",background:"transparent" }) }}>
                    <span className="material-symbols-outlined" style={{ fontSize:20 }}>{tabIcons[tab]}</span>
                    <span>{tabLabels[tab]}</span>
                  </button>
                );
              })}
            </nav>

            {/* ── SIGN IN ── */}
            {activeTab === "signin" && (
              <div className="space-y-6">
                <div className="mb-6">
                  <h1 className="font-bold text-3xl tracking-tight" style={{ fontFamily:"'Manrope',sans-serif" }}>Welcome back</h1>
                  <p className="mt-2" style={{ color:"var(--on-surface-variant)" }}>Securely access your Ethereal Vault.</p>
                </div>

                {loginSuccess ? <LoginSuccessBanner /> : (
                  <form onSubmit={handleLoginSubmit}>
                    <div className="space-y-5">

                      {loginErrors.general && (
                        <div className="rounded-xl p-4 flex items-center gap-3"
                          style={{ backgroundColor:"rgba(179,27,37,0.06)", border:"1.5px solid var(--error)" }}>
                          <span className="material-symbols-outlined" style={{ color:"var(--error)", fontSize:18, fontVariationSettings:"'FILL' 1" }}>error</span>
                          <p className="text-sm font-medium" style={{ color:"var(--error)" }}>{loginErrors.general}</p>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-widest mb-2 ml-1" style={{ color:"var(--on-surface-variant)" }}>Email</label>
                          <div className="relative rounded-xl overflow-hidden" style={{ border: loginBorder("email") }}>
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2" style={{ color:"var(--primary-dim)" }}>mail</span>
                            <input
                              type="email" name="email" value={loginForm.email} onChange={handleLoginChange}
                              className="w-full pl-12 pr-4 py-4 border-none rounded-xl"
                              placeholder="you@example.com" style={inputBase}
                              onFocus={e=>e.currentTarget.style.backgroundColor="var(--surface-container-lowest)"}
                              onBlur={e=>e.currentTarget.style.backgroundColor="var(--surface-container-low)"}
                            />
                          </div>
                          <FieldError name="email" errors={loginErrors} />
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-widest mb-2 ml-1" style={{ color:"var(--on-surface-variant)" }}>Domain</label>
                          <div className="flex items-center rounded-xl overflow-hidden"
                            style={{ border: loginBorder("domain"), backgroundColor:"var(--surface-container-low)" }}>
                            <span className="px-2.5 py-4 text-xs font-semibold shrink-0 select-none border-r"
                              style={{ color:"var(--on-surface-variant)", borderColor:"var(--outline-variant)", backgroundColor:"var(--surface-container)" }}>
                              https://
                            </span>
                            <input
                              type="text" name="domain" value={loginForm.domain} onChange={handleLoginChange}
                              className="flex-1 min-w-0 bg-transparent border-none focus:ring-0 py-4 px-2"
                              placeholder="yourcompany"
                              style={{ color:"var(--on-surface)", outline:"none" }}
                            />
                            <span className="px-2.5 py-4 text-xs font-semibold shrink-0 select-none border-l"
                              style={{ color:"var(--on-surface-variant)", borderColor:"var(--outline-variant)", backgroundColor:"var(--surface-container)" }}>
                              .mindcarve.in
                            </span>
                          </div>
                          <FieldError name="domain" errors={loginErrors} />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-widest mb-2 ml-1" style={{ color:"var(--on-surface-variant)" }}>Password</label>
                        <div className="relative rounded-xl overflow-hidden" style={{ border: loginBorder("password") }}>
                          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2" style={{ color:"var(--primary-dim)" }}>lock</span>
                          <input
                            type={showPassword?"text":"password"} name="password" value={loginForm.password} onChange={handleLoginChange}
                            className="w-full pl-12 pr-12 py-4 border-none rounded-xl"
                            placeholder="••••••••" style={inputBase}
                            onFocus={e=>e.currentTarget.style.backgroundColor="var(--surface-container-lowest)"}
                            onBlur={e=>e.currentTarget.style.backgroundColor="var(--surface-container-low)"}
                          />
                          <button type="button" onClick={() => setShowPassword(v=>!v)} className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color:"var(--outline)" }}>
                            <span className="material-symbols-outlined">{showPassword?"visibility_off":"visibility"}</span>
                          </button>
                        </div>
                        <FieldError name="password" errors={loginErrors} />
                      </div>

                      <div className="rounded-xl p-4 flex items-center justify-between border" style={{ backgroundColor:"var(--surface-container)",borderColor:"rgba(171,173,175,0.1)" }}>
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input type="checkbox" className="w-6 h-6 rounded" style={{ accentColor:"var(--primary)" }} />
                          <span className="text-sm font-medium" style={{ color:"var(--on-surface-variant)" }}>I&apos;m not a robot</span>
                        </label>
                        <div className="flex flex-col items-center">
                          <img alt="reCAPTCHA" className="w-6 h-6 grayscale opacity-50"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCgPzcBvhPgLtBcvMin4fAR_YxzlMfi1i4kR7xkFRTaKqS2BtJ8ThHT9saaAI1aUKfwwHavn4Td3c4YsK_NfbCH8LnlUzgGfXnKgclq6bkDUMxollZaxnleGmxS9BzYrCWSDxwfg4sbKtfRExRCEsYhjlJCmC2fOoB7x3JSkHXPMidEuNiQJAXgmActS0IeNFCyLm5N0tkLLAk58tpPSUjHimnIt6G3-Jsh8cbmfQGSzhDLx3DAglxFayWVMawtRpwtEO1S6JSzKvoU" />
                          <span className="text-[8px] uppercase font-bold" style={{ color:"var(--outline-variant)" }}>reCAPTCHA</span>
                        </div>
                      </div>

                      <button type="submit" disabled={loginLoading}
                        className="w-full py-4 font-bold text-lg rounded-xl flex items-center justify-center gap-2 active:scale-95"
                        style={{
                          background:"linear-gradient(to right,var(--primary),var(--secondary-container))",
                          color:"var(--on-primary)", boxShadow:"0 20px 40px rgba(0,88,186,0.2)",
                          fontFamily:"'Manrope',sans-serif",
                          opacity: loginLoading ? 0.7 : 1,
                          cursor: loginLoading ? "not-allowed" : "pointer",
                        }}>
                        {loginLoading
                          ? <><span className="material-symbols-outlined spinning" style={{ fontSize:20 }}>progress_activity</span> Signing in…</>
                          : <>Sign In <span className="material-symbols-outlined">arrow_forward</span></>}
                      </button>
                    </div>
                  </form>
                )}

                <div className="mt-6 text-center">
                  <p className="text-sm" style={{ color:"var(--on-surface-variant)" }}>
                    Don&apos;t have an account?{" "}
                    <button onClick={() => setActiveTab("signup")} className="font-bold hover:underline" style={{ color:"var(--primary)" }}>Create one for free</button>
                  </p>
                </div>
              </div>
            )}

            {/* ── SIGN UP ── */}
            {activeTab === "signup" && (
              <div className="space-y-6">
                <div className="mb-6">
                  <h1 className="font-bold text-3xl tracking-tight" style={{ fontFamily:"'Manrope',sans-serif" }}>Create your account</h1>
                  <p className="font-medium" style={{ color:"var(--on-surface-variant)" }}>Join the Ethereal Vault and start trading today.</p>
                </div>

                {Object.keys(submitErrors).length > 0 && (
                  <div className="rounded-xl p-4 flex items-start gap-3"
                    style={{ backgroundColor:"rgba(179,27,37,0.06)", border:"1.5px solid var(--error)" }}>
                    <span className="material-symbols-outlined mt-0.5" style={{ color:"var(--error)", fontSize:18, fontVariationSettings:"'FILL' 1" }}>error</span>
                    <div>
                      <p className="text-sm font-bold" style={{ color:"var(--error)" }}>Please fix the following:</p>
                      <ul className="mt-1 space-y-0.5">
                        {Object.entries(submitErrors).map(([field, msgs]) => (
                          <li key={field} className="text-xs" style={{ color:"var(--error)" }}>
                            <span className="font-semibold capitalize">{field}</span>: {Array.isArray(msgs) ? msgs[0] : msgs}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {[{label:"First Name",name:"firstName",ph:"John"},{label:"Last Name",name:"lastName",ph:"Doe"}].map(({label,name,ph})=>(
                        <div key={name}>
                          <label className="text-xs font-bold uppercase tracking-widest ml-1" style={{ color:"var(--on-surface-variant)" }}>{label}</label>
                          <div className="relative mt-1 flex items-center rounded-xl" style={{ backgroundColor:"var(--surface-container-low)", border: submitErrors[name] ? "2px solid var(--error)" : "2px solid transparent" }}>
                            <span className="material-symbols-outlined absolute left-4" style={{ color:"var(--primary-dim)" }}>badge</span>
                            <input type="text" name={name} value={form[name]} onChange={handleChange}
                              className="w-full bg-transparent border-none focus:ring-0 py-4 pl-12 pr-4"
                              placeholder={ph} style={{ color:"var(--on-surface)",outline:"none" }} />
                          </div>
                          <FieldError name={name} />
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="text-xs font-bold uppercase tracking-widest ml-1" style={{ color:"var(--on-surface-variant)" }}>Email Address</label>
                        <div className="relative mt-1 flex items-center rounded-xl overflow-hidden"
                          style={{ backgroundColor:"var(--surface-container-low)", border:fieldBorder(emailStatus) }}>
                          <span className="material-symbols-outlined absolute left-4" style={{ color:"var(--primary-dim)" }}>mail</span>
                          <input type="email" name="email" value={form.email} onChange={handleChange}
                            className="w-full bg-transparent border-none focus:ring-0 py-4 pl-12 pr-10"
                            placeholder="john.doe@example.com" style={{ color:"var(--on-surface)",outline:"none" }} />
                          <FieldIcon status={emailStatus} />
                        </div>
                        <StatusBadge status={emailStatus} msg={emailMsg} />
                        <FieldError name="email" />
                      </div>
                      <div>
                        <label className="text-xs font-bold uppercase tracking-widest ml-1" style={{ color:"var(--on-surface-variant)" }}>Company Name</label>
                        <div className="relative mt-1 flex items-center rounded-xl" style={{ backgroundColor:"var(--surface-container-low)", border: submitErrors.company ? "2px solid var(--error)" : "2px solid transparent" }}>
                          <span className="material-symbols-outlined absolute left-4" style={{ color:"var(--primary-dim)" }}>business</span>
                          <input type="text" name="company" value={form.company} onChange={handleChange}
                            className="w-full bg-transparent border-none focus:ring-0 py-4 pl-12 pr-4"
                            placeholder="Universal Enterprises Ltd" style={{ color:"var(--on-surface)",outline:"none" }} />
                        </div>
                        <FieldError name="company" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="text-xs font-bold uppercase tracking-widest ml-1" style={{ color:"var(--on-surface-variant)" }}>Country</label>
                        <div className="relative mt-1">
                          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2" style={{ color:"var(--primary-dim)" }}>public</span>
                          <select name="country" value={form.country} onChange={handleChange}
                            className="w-full border-none rounded-xl py-4 pl-12 pr-8 appearance-none"
                            style={{ backgroundColor:"var(--surface-container-low)", color: form.country ? "var(--on-surface)" : "var(--outline)", outline:"none",
                              border: submitErrors.country ? "2px solid var(--error)" : "2px solid transparent" }}>
                            <option value="">Select country</option>
                            {["United States","United Kingdom","Singapore","Germany","India","Canada","Australia"].map(c=><option key={c}>{c}</option>)}
                          </select>
                          <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color:"var(--on-surface-variant)" }}>expand_more</span>
                        </div>
                        <FieldError name="country" />
                      </div>
                      <div>
                        <label className="text-xs font-bold uppercase tracking-widest ml-1" style={{ color:"var(--on-surface-variant)" }}>Mobile Number</label>
                        <div className="relative mt-1 flex items-center rounded-xl" style={{ backgroundColor:"var(--surface-container-low)", border: submitErrors.mobile ? "2px solid var(--error)" : "2px solid transparent" }}>
                          <span className="material-symbols-outlined absolute left-4" style={{ color:"var(--primary-dim)" }}>phone_iphone</span>
                          <input type="tel" name="mobile" value={form.mobile} onChange={handleChange}
                            className="w-full bg-transparent border-none focus:ring-0 py-4 pl-12 pr-4"
                            placeholder="+1 234 567 8900" style={{ color:"var(--on-surface)",outline:"none" }} />
                        </div>
                        <FieldError name="mobile" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-widest ml-1 flex items-center gap-2" style={{ color:"var(--on-surface-variant)" }}>
                        Domain Name
                        {!domainManual && form.company && (
                          <span className="normal-case text-[10px] font-semibold px-2 py-0.5 rounded-full"
                            style={{ backgroundColor:"var(--secondary-container)",color:"var(--on-secondary-container)" }}>
                            auto-filled · you can change it
                          </span>
                        )}
                      </label>
                      <div className="mt-1 flex items-center rounded-xl overflow-hidden"
                        style={{ border:fieldBorder(domainStatus), backgroundColor:"var(--surface-container-low)" }}>
                        <span className="px-3 py-4 text-sm font-medium shrink-0 select-none border-r"
                          style={{ color:"var(--on-surface-variant)",borderColor:"var(--outline-variant)",backgroundColor:"var(--surface-container)" }}>
                          https://
                        </span>
                        <div className="relative flex-1">
                          <input type="text" name="domain" value={form.domain} onChange={handleChange}
                            className="w-full bg-transparent border-none focus:ring-0 py-4 px-3 pr-9"
                            placeholder="yourcompany" style={{ color:"var(--on-surface)",outline:"none" }} />
                          <FieldIcon status={domainStatus} />
                        </div>
                        <span className="px-3 py-4 text-sm font-medium shrink-0 select-none border-l"
                          style={{ color:"var(--on-surface-variant)",borderColor:"var(--outline-variant)",backgroundColor:"var(--surface-container)" }}>
                          .mindcarve.in
                        </span>
                      </div>
                      <StatusBadge status={domainStatus} msg={domainMsg} />
                      <FieldError name="domain" />
                    </div>
                    <div className="flex items-start gap-3 mt-2">
                      <input type="checkbox" id="agreeTerms" name="agreeTerms" checked={form.agreeTerms} onChange={handleChange}
                        className="w-5 h-5 rounded mt-0.5" style={{ accentColor:"var(--primary)" }} />
                      <label htmlFor="agreeTerms" className="text-sm font-medium leading-tight" style={{ color:"var(--on-surface-variant)" }}>
                        I agree to the{" "}
                        <a href="#" className="font-bold hover:underline" style={{ color:"var(--primary)" }}>Terms of Service</a>{" "}and{" "}
                        <a href="#" className="font-bold hover:underline" style={{ color:"var(--primary)" }}>Privacy Policy</a>.
                      </label>
                    </div>
                    <button type="submit" disabled={!isFormValid || submitting}
                      className="w-full py-5 font-bold rounded-xl text-lg mt-4 flex items-center justify-center gap-2"
                      style={{
                        background:"linear-gradient(to right,var(--primary),var(--secondary-container))",
                        color:"var(--on-primary)", boxShadow:"0 20px 40px rgba(0,88,186,0.2)",
                        fontFamily:"'Manrope',sans-serif",
                        opacity:(!isFormValid||submitting)?0.5:1,
                        cursor:(!isFormValid||submitting)?"not-allowed":"pointer",
                      }}>
                      {submitting
                        ? <><span className="material-symbols-outlined spinning" style={{ fontSize:20 }}>progress_activity</span> Creating…</>
                        : <><span className="material-symbols-outlined" style={{ fontSize:20 }}>rocket_launch</span> Create Account</>}
                    </button>
                    <p className="text-center text-xs" style={{ color:"var(--on-surface-variant)" }}>
                      By joining, you&apos;ll get access to premium trading tools.
                    </p>
                  </div>
                </form>
              </div>
            )}

            {/* ── RECOVER ── */}
            {activeTab === "recover" && (
              <div className="space-y-6">
                <div className="mb-6">
                  <h2 className="font-bold text-3xl tracking-tight" style={{ fontFamily:"'Manrope',sans-serif" }}>Forgot access?</h2>
                  <p className="mt-2" style={{ color:"var(--on-surface-variant)" }}>Enter your email to verify your identity and restore your ethereal vault.</p>
                </div>
                <form onSubmit={e => { e.preventDefault(); alert("Recovery link sent (demo)"); }}>
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-bold ml-1" style={{ color:"var(--on-surface-variant)" }}>Login / Email</label>
                      <div className="relative mt-1">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined" style={{ color:"var(--primary-dim)" }}>account_circle</span>
                        <input type="email" className="w-full pl-12 pr-12 py-4 border-none rounded-xl" placeholder="name@domain.com" style={inputBase}
                          onFocus={e=>e.currentTarget.style.backgroundColor="var(--surface-container-lowest)"}
                          onBlur={e=>e.currentTarget.style.backgroundColor="var(--surface-container-low)"} />
                      </div>
                    </div>
                    <div className="rounded-xl p-4 flex items-center justify-between" style={{ backgroundColor:"var(--surface-container-low)" }}>
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 border-2 rounded bg-white cursor-pointer" style={{ borderColor:"var(--outline)" }} />
                        <span className="text-sm font-medium" style={{ color:"var(--on-surface-variant)" }}>I&apos;m not a robot</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="material-symbols-outlined text-3xl" style={{ color:"var(--primary)",fontVariationSettings:"'FILL' 1" }}>verified_user</span>
                        <span className="text-[8px] uppercase font-black" style={{ color:"var(--outline)" }}>reCAPTCHA</span>
                      </div>
                    </div>
                    <button type="submit" className="w-full signature-gradient py-5 rounded-xl font-bold text-lg flex items-center justify-center gap-2 active:scale-95"
                      style={{ color:"var(--on-primary)",boxShadow:"0 16px 32px rgba(0,88,186,0.2)",fontFamily:"'Manrope',sans-serif" }}>
                      <span>Recover</span><span className="material-symbols-outlined">lock_reset</span>
                    </button>
                  </div>
                </form>
                <div className="text-center pt-4">
                  <p className="text-sm" style={{ color:"var(--on-surface-variant)" }}>
                    Remembered?{" "}
                    <button onClick={() => setActiveTab("signin")} className="font-bold hover:underline" style={{ color:"var(--primary)" }}>Go back to Sign In</button>
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ═══ RIGHT ═══ */}
        <section className="hidden lg:flex relative w-[35%] flex-col justify-center px-8 xl:px-12 backdrop-blur-sm shadow-2xl rounded-l-[2rem]"
          style={{ backgroundColor:"rgba(255,255,255,0.4)" }}>
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute rounded-full" style={{ top:"-20%",right:"-10%",width:"80%",height:"80%",backgroundColor:"var(--secondary-container)",opacity:0.2,filter:"blur(100px)" }} />
          </div>
          {activeTab === "signin" && (
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md" style={{ background:"linear-gradient(to top right,var(--primary),var(--secondary-container))" }}>
                  <span className="material-symbols-outlined text-2xl" style={{ color:"var(--on-primary)",fontVariationSettings:"'FILL' 1" }}>account_balance_wallet</span>
                </div>
                <span className="text-2xl font-black tracking-tighter" style={{ color:"var(--primary)",fontFamily:"'Manrope',sans-serif" }}>Universal Trading</span>
              </div>
              <h2 className="font-extrabold text-4xl tracking-tight leading-[1.2]" style={{ fontFamily:"'Manrope',sans-serif",color:"var(--on-surface)" }}>
                Secure access <br />to your{" "}
                <span style={{ background:"linear-gradient(to right,var(--primary),var(--secondary-container))",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>financial world</span>
              </h2>
              <p className="mt-5 text-base max-w-sm leading-relaxed" style={{ color:"var(--on-surface-variant)" }}>Institutional-grade vault with real-time analytics and bank-level encryption.</p>
              <div className="mt-8 pt-4" style={{ borderTop:"1px solid rgba(171,173,175,0.2)" }}>
                {[{icon:"verified",text:"2FA & Biometric ready"},{icon:"security",text:"24/7 fraud monitoring"}].map(({icon,text})=>(
                  <div key={icon} className="flex items-center gap-3 text-sm mt-3" style={{ color:"var(--on-surface-variant)" }}>
                    <span className="material-symbols-outlined" style={{ color:"var(--primary)" }}>{icon}</span><span>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {activeTab === "signup" && (
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md" style={{ background:"linear-gradient(to bottom right,var(--primary),var(--secondary-container))" }}>
                  <span className="material-symbols-outlined text-white text-2xl" style={{ fontVariationSettings:"'FILL' 1" }}>group_add</span>
                </div>
                <span className="text-2xl font-extrabold tracking-tighter" style={{ color:"var(--primary)",fontFamily:"'Manrope',sans-serif" }}>Join the network</span>
              </div>
              <h2 className="font-extrabold text-4xl tracking-tight leading-[1.2]" style={{ fontFamily:"'Manrope',sans-serif",color:"var(--on-surface)" }}>
                Start your <br />
                <span style={{ background:"linear-gradient(to right,var(--secondary-fixed),var(--primary))",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>Ethereal journey</span>
              </h2>
              <p className="mt-5 text-base max-w-sm" style={{ color:"var(--on-surface-variant)" }}>Access global markets, institutional tools, and a community of elite traders.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                {["🔒 GDPR compliant","⚡ Instant execution"].map(tag=>(
                  <span key={tag} className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-full" style={{ backgroundColor:"var(--surface-container-low)" }}>{tag}</span>
                ))}
              </div>
            </div>
          )}
          {activeTab === "recover" && (
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 signature-gradient rounded-xl flex items-center justify-center shadow-md">
                  <span className="material-symbols-outlined text-white text-2xl" style={{ fontVariationSettings:"'FILL' 1" }}>lock_reset</span>
                </div>
                <span className="text-2xl font-black tracking-tighter" style={{ color:"var(--primary)",fontFamily:"'Manrope',sans-serif" }}>Reset access</span>
              </div>
              <h2 className="font-extrabold text-4xl tracking-tight leading-[1.2]" style={{ fontFamily:"'Manrope',sans-serif",color:"var(--on-surface)" }}>
                Recover <br /><span style={{ color:"var(--primary)" }}>your vault</span>
              </h2>
              <p className="mt-5 text-base" style={{ color:"var(--on-surface-variant)" }}>We&apos;ll send a secure link to verify your identity and restore your account.</p>
              <div className="mt-8 rounded-xl p-4 border" style={{ backgroundColor:"rgba(238,241,243,0.5)",borderColor:"rgba(171,173,175,0.1)" }}>
                <div className="flex items-center gap-2 text-sm font-medium" style={{ color:"var(--primary)" }}>
                  <span className="material-symbols-outlined">support_agent</span> 24/7 support
                </div>
                <p className="text-xs mt-2" style={{ color:"var(--on-surface-variant)" }}>Contact our security team if you face any issues.</p>
              </div>
            </div>
          )}
        </section>

        {/* mobile nav */}
        <footer className="lg:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-6 py-4 rounded-t-[32px]"
          style={{ backgroundColor:"rgba(255,255,255,0.8)",backdropFilter:"blur(24px)",boxShadow:"0px -10px 30px rgba(0,88,186,0.05)" }}>
          {tabs.map(tab => {
            const active = activeTab === tab;
            return (
              <button key={tab} onClick={() => setActiveTab(tab)} className="flex flex-col items-center transition-all"
                style={{ color:active?"var(--primary)":"var(--on-surface-variant)",transform:active?"scale(1.1)":"scale(1)",opacity:active?1:0.6 }}>
                <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings:active?"'FILL' 1":"'FILL' 0" }}>{tabIcons[tab]}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest mt-1">{tabLabels[tab]}</span>
              </button>
            );
          })}
        </footer>
      </div>
    </>
  );
}