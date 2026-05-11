"use client";
import { useState, useEffect, useCallback } from "react";

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const BASE_URL = "https://pencilkraft.in/api";
const ACCENT = "#f97316";

const MONTH_MAP = {
  January: 0, February: 1, March: 2, April: 3, May: 4, June: 5,
  July: 6, August: 7, September: 8, October: 9, November: 10, December: 11,
};

// ─── API HELPER ───────────────────────────────────────────────────────────────
function getToken() {
  if (typeof window !== "undefined") return localStorage.getItem("employee_auth_token") || "";
  return "";
}
async function apiFetch(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...(options.headers || {}) },
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || "API error");
  return data;
}

// ─── SVG ICONS ────────────────────────────────────────────────────────────────
const Ic = ({ d, size = 16, stroke = "currentColor", fill = "none", sw = 1.8, style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
    strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
    style={{ display: "block", flexShrink: 0, ...style }}>
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);
const ICONS = {
  bell:      "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0",
  plus:      "M12 5v14M5 12h14",
  check:     "M20 6L9 17l-5-5",
  x:         "M18 6L6 18M6 6l12 12",
  search:    "M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z",
  chevLeft:  "M15 18l-6-6 6-6",
  chevRight: "M9 18l6-6-6-6",
  clock:     "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2",
  info:      "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 8h.01M12 12v4",
  briefcase: "M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2",
  send:      "M22 2L11 13 M22 2L15 22l-4-9-9-4 22-7z",
  fileText:  "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6M16 13H8M16 17H8M10 9H8",
  refresh:   "M23 4v6h-6 M1 20v-6h6 M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15",
  star:      "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  alertCircle: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 8v4M12 16h.01",
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function fmtDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}
function calcDays(from, to) {
  if (!from || !to) return 0;
  return Math.max(0, Math.round((new Date(to) - new Date(from)) / 86400000) + 1);
}

// ─── PALETTES ────────────────────────────────────────────────────────────────
const LEAVE_PALETTE = ["#3b82f6","#8b5cf6","#ef4444","#ec4899","#f97316","#10b981","#f59e0b","#06b6d4"];
const LEAVE_ICON_BG = ["#1f2937","#3b82f6","#7c3aed","#ec4899","#f97316","#10b981","#f59e0b","#06b6d4"];

// ─── STATUS BADGE ─────────────────────────────────────────────────────────────
const STATUS_CFG = {
  pending:   { color: "#d97706", bg: "#fffbeb", border: "#fde68a", dot: "#f59e0b", label: "Pending"   },
  approved:  { color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0", dot: "#22c55e", label: "Approved"  },
  rejected:  { color: "#dc2626", bg: "#fef2f2", border: "#fecaca", dot: "#ef4444", label: "Rejected"  },
  cancelled: { color: "#6b7280", bg: "#f9fafb", border: "#e5e7eb", dot: "#9ca3af", label: "Cancelled" },
};
function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status?.toLowerCase()] || STATUS_CFG.pending;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 20, background: cfg.bg, border: `1px solid ${cfg.border}`, fontSize: 11.5, fontWeight: 600, color: cfg.color, whiteSpace: "nowrap" }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.dot, flexShrink: 0 }} />
      {cfg.label}
    </span>
  );
}

// ─── AVATAR ───────────────────────────────────────────────────────────────────
const AV_COLORS = ["#f97316","#6366f1","#22c55e","#ef4444","#8b5cf6","#06b6d4","#ec4899","#14b8a6","#f59e0b","#3b82f6"];
function avatarBg(name = "") {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffffffff;
  return AV_COLORS[Math.abs(h) % AV_COLORS.length];
}
function Avatar({ name = "?", size = 32 }) {
  const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: avatarBg(name), display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.33, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
      {initials}
    </div>
  );
}

// ─── SPINNER ──────────────────────────────────────────────────────────────────
function Spinner({ color = "#fff", size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round"
      style={{ animation: "spin 0.8s linear infinite", display: "block", flexShrink: 0 }}>
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

// ─── SKELETON ─────────────────────────────────────────────────────────────────
function Skel({ h = 40, r = 8, w = "100%" }) {
  return <div style={{ width: w, height: h, borderRadius: r, background: "linear-gradient(90deg,#f1f5f9 25%,#e9eef5 50%,#f1f5f9 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite" }} />;
}

// ─── CONFIRM MODAL ────────────────────────────────────────────────────────────
function ConfirmModal({ isOpen, title, message, onConfirm, onClose, loading }) {
  if (!isOpen) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.52)", backdropFilter: "blur(6px)", zIndex: 700, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
      onClick={!loading ? onClose : undefined}>
      <div onClick={e => e.stopPropagation()}
        style={{ background: "#fff", borderRadius: 18, width: "100%", maxWidth: 400, boxShadow: "0 32px 80px rgba(0,0,0,0.24)", overflow: "hidden", animation: "modalIn 0.25s cubic-bezier(.34,1.2,.64,1)" }}>
        {/* Icon area */}
        <div style={{ padding: "32px 28px 20px", textAlign: "center" }}>
          <div style={{ width: 60, height: 60, borderRadius: "50%", background: "#fef2f2", border: "2px solid #fecaca", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
            <Ic d={ICONS.alertCircle} stroke="#dc2626" size={28} sw={1.8} />
          </div>
          <div style={{ fontSize: 17, fontWeight: 800, color: "#111827", marginBottom: 10, letterSpacing: "-0.3px" }}>{title}</div>
          <div style={{ fontSize: 13.5, color: "#6b7280", lineHeight: 1.65 }}>{message}</div>
        </div>
        {/* Buttons */}
        <div style={{ padding: "4px 24px 24px", display: "flex", gap: 10 }}>
          <button onClick={onClose} disabled={loading}
            style={{ flex: 1, padding: "11px 0", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, fontSize: 13.5, fontWeight: 600, color: "#374151", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1, transition: "all 0.15s" }}>
            Keep It
          </button>
          <button onClick={onConfirm} disabled={loading}
            style={{ flex: 1, padding: "11px 0", background: loading ? "#9ca3af" : "#dc2626", border: "none", borderRadius: 10, fontSize: 13.5, fontWeight: 700, color: "#fff", cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, transition: "background 0.15s" }}>
            {loading ? <><Spinner size={13} />&nbsp;Cancelling…</> : <><Ic d={ICONS.x} stroke="#fff" size={14} sw={2.5} />Yes, Cancel It</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── SUCCESS MODAL ────────────────────────────────────────────────────────────
function SuccessModal({ isOpen, title, message, isError = false, onClose }) {
  if (!isOpen) return null;
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    const t = setTimeout(onClose, 3200);
    return () => clearTimeout(t);
  }, [isOpen]);

  const gradFrom = isError ? "#ef4444" : "#10b981";
  const gradTo   = isError ? "#dc2626" : "#059669";

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.48)", backdropFilter: "blur(6px)", zIndex: 800, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
      onClick={onClose}>
      <div onClick={e => e.stopPropagation()}
        style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 380, boxShadow: "0 32px 80px rgba(0,0,0,0.24)", overflow: "hidden", animation: "successPop 0.38s cubic-bezier(.34,1.56,.64,1)", textAlign: "center" }}>
        {/* Coloured top */}
        <div style={{ background: `linear-gradient(135deg, ${gradFrom}, ${gradTo})`, padding: "36px 28px 26px" }}>
          <div style={{ width: 68, height: 68, borderRadius: "50%", background: "rgba(255,255,255,0.22)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", border: "3px solid rgba(255,255,255,0.4)" }}>
            {isError
              ? <Ic d={ICONS.x} stroke="#fff" size={32} sw={2.5} />
              : <Ic d={ICONS.check} stroke="#fff" size={32} sw={2.5} />
            }
          </div>
          <div style={{ fontSize: 19, fontWeight: 800, color: "#fff", marginBottom: 8, letterSpacing: "-0.4px" }}>{title}</div>
          <div style={{ fontSize: 13.5, color: "rgba(255,255,255,0.82)", lineHeight: 1.55 }}>{message}</div>
        </div>
        {/* Bottom */}
        <div style={{ padding: "22px 28px" }}>
          <button onClick={onClose}
            style={{ width: "100%", padding: "11px 0", background: isError ? "#fef2f2" : "#f0fdf4", border: `1px solid ${isError ? "#fecaca" : "#bbf7d0"}`, borderRadius: 10, fontSize: 13.5, fontWeight: 700, color: isError ? "#dc2626" : "#065f46", cursor: "pointer" }}>
            Got it!
          </button>
          <div style={{ marginTop: 8, fontSize: 11.5, color: "#9ca3af" }}>Closes automatically in 3 seconds</div>
        </div>
      </div>
    </div>
  );
}

// ─── APPLY LEAVE MODAL ────────────────────────────────────────────────────────
function ApplyLeaveModal({ onClose, onSuccess, onError, balances }) {
  const [tab, setTab] = useState("assigned");
  const [form, setForm] = useState({ leave_type_id: "", start_date: "", end_date: "", reason: "", description: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const selected = balances.find(b => String(b.leave_type_id) === String(form.leave_type_id));
  const allowedMonths = selected?.policy?.month_type === "specific" ? (selected.policy.months || []) : [];
  const days = calcDays(form.start_date, form.end_date);
  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: "" })); };

  function monthMin(months) {
    if (!months.length) return undefined;
    const year = new Date().getFullYear();
    const nums = months.map(m => MONTH_MAP[m]).filter(n => n !== undefined).sort((a, b) => a - b);
    return `${year}-${String(nums[0] + 1).padStart(2, "0")}-01`;
  }
  function monthMax(months) {
    if (!months.length) return undefined;
    const year = new Date().getFullYear();
    const nums = months.map(m => MONTH_MAP[m]).filter(n => n !== undefined).sort((a, b) => a - b);
    const last = nums[nums.length - 1];
    const lastDay = new Date(year, last + 1, 0).getDate();
    return `${year}-${String(last + 1).padStart(2, "0")}-${lastDay}`;
  }

  const validate = () => {
    const e = {};
    if (tab === "assigned" && !form.leave_type_id) e.leave_type_id = "Select a leave type";
    if (!form.start_date) e.start_date = "Start date required";
    if (!form.end_date)   e.end_date   = "End date required";
    if (form.start_date && form.end_date && form.end_date < form.start_date) e.end_date = "End must be after start";
    if (!form.reason.trim()) e.reason = "Reason is required";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSubmitting(true);
    try {
      if (tab === "assigned") {
        await apiFetch("/employee/apply-leave", {
          method: "POST",
          body: JSON.stringify({ leave_type_id: Number(form.leave_type_id), start_date: form.start_date, end_date: form.end_date, reason: form.reason, description: form.description }),
        });
        onSuccess("Leave Request Submitted!", "Your leave request has been sent for manager approval. You'll be notified once reviewed.");
      } else {
        await apiFetch("/employee/extra-leave-request", {
          method: "POST",
          body: JSON.stringify({ start_date: form.start_date, end_date: form.end_date, reason: form.reason, description: form.description }),
        });
        onSuccess("Extra Leave Submitted!", "Your extra leave request has been sent to HR for review and approval.");
      }
      onClose();
    } catch (err) {
      onError(err.message || "Failed to submit leave request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)", zIndex: 600, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
      onClick={onClose}>
      <div onClick={e => e.stopPropagation()}
        style={{ background: "#fff", borderRadius: 18, width: "100%", maxWidth: 540, boxShadow: "0 32px 80px rgba(0,0,0,0.25)", overflow: "hidden", animation: "modalIn 0.22s cubic-bezier(.4,0,.2,1)", maxHeight: "92vh", display: "flex", flexDirection: "column" }}>

        {/* Header */}
        <div style={{ background: `linear-gradient(135deg, ${ACCENT}, #ea580c)`, padding: "18px 22px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Ic d={ICONS.send} stroke="#fff" size={16} />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>Apply for Leave</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.75)" }}>Fill in all required fields</div>
            </div>
          </div>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(255,255,255,0.2)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Ic d={ICONS.x} stroke="#fff" size={14} />
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: "1px solid #f1f5f9", background: "#fafafa", flexShrink: 0 }}>
          {[{ key: "assigned", label: "Assigned Leave", icon: "📋" }, { key: "extra", label: "Extra Leave", icon: "➕" }].map(t => (
            <button key={t.key} onClick={() => { setTab(t.key); setForm({ leave_type_id: "", start_date: "", end_date: "", reason: "", description: "" }); setErrors({}); }}
              style={{ flex: 1, padding: "12px 10px", border: "none", background: "transparent", cursor: "pointer", fontSize: 13, fontWeight: tab === t.key ? 700 : 500, color: tab === t.key ? ACCENT : "#6b7280", borderBottom: `2px solid ${tab === t.key ? ACCENT : "transparent"}`, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "all 0.15s" }}>
              <span>{t.icon}</span>{t.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14, overflowY: "auto" }}>
          {tab === "extra" && (
            <div style={{ padding: "10px 14px", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 9, display: "flex", gap: 8, alignItems: "flex-start" }}>
              <Ic d={ICONS.info} stroke="#3b82f6" size={15} style={{ marginTop: 1, flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: "#1e40af", lineHeight: 1.5 }}>Extra leave goes directly to HR for approval. No balance is deducted — HR decides at their discretion.</span>
            </div>
          )}

          {tab === "assigned" && (
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
                Leave Type <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <select value={form.leave_type_id} onChange={e => set("leave_type_id", e.target.value)}
                style={{ width: "100%", padding: "9px 12px", border: `1px solid ${errors.leave_type_id ? "#ef4444" : "#e5e7eb"}`, borderRadius: 8, fontSize: 13, color: form.leave_type_id ? "#111827" : "#9ca3af", outline: "none", background: "#fff", boxSizing: "border-box" }}>
                <option value="">Select leave type…</option>
                {balances.map(b => (
                  <option key={b.leave_type_id} value={b.leave_type_id} disabled={b.remaining_days === 0}>
                    {b.leave_type_name} ({b.remaining_days} days left){b.remaining_days === 0 ? " — Exhausted" : ""}
                  </option>
                ))}
              </select>
              {errors.leave_type_id && <p style={{ fontSize: 11, color: "#ef4444", margin: "3px 0 0" }}>{errors.leave_type_id}</p>}
              {allowedMonths.length > 0 && (
                <p style={{ fontSize: 11, color: "#92400e", margin: "4px 0 0", background: "#fffbeb", padding: "4px 8px", borderRadius: 6, display: "inline-block" }}>
                  Allowed months: {allowedMonths.join(", ")}
                </p>
              )}
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[{ label: "From Date", key: "start_date" }, { label: "To Date", key: "end_date" }].map(({ label, key }) => (
              <div key={key}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
                  {label} <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input type="date" value={form[key]} onChange={e => set(key, e.target.value)}
                  min={key === "end_date" ? (form.start_date || undefined) : (allowedMonths.length ? monthMin(allowedMonths) : undefined)}
                  max={allowedMonths.length ? monthMax(allowedMonths) : undefined}
                  style={{ width: "100%", padding: "9px 12px", border: `1px solid ${errors[key] ? "#ef4444" : "#e5e7eb"}`, borderRadius: 8, fontSize: 13, color: "#111827", outline: "none", boxSizing: "border-box", background: "#fff" }} />
                {errors[key] && <p style={{ fontSize: 11, color: "#ef4444", margin: "3px 0 0" }}>{errors[key]}</p>}
              </div>
            ))}
          </div>

          {form.start_date && form.end_date && days > 0 && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 9 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Ic d={ICONS.clock} stroke="#16a34a" size={15} />
                <span style={{ fontSize: 13, fontWeight: 600, color: "#166534" }}>
                  {days} Day{days !== 1 ? "s" : ""} · {fmtDate(form.start_date)} → {fmtDate(form.end_date)}
                </span>
              </div>
              {tab === "assigned" && selected && days > selected.remaining_days && (
                <span style={{ fontSize: 11.5, fontWeight: 700, color: "#dc2626", background: "#fef2f2", padding: "2px 8px", borderRadius: 20, border: "1px solid #fca5a5" }}>Exceeds balance!</span>
              )}
            </div>
          )}

          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
              Reason <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input value={form.reason} onChange={e => set("reason", e.target.value)} placeholder="Brief reason for leave…"
              style={{ width: "100%", padding: "9px 12px", border: `1px solid ${errors.reason ? "#ef4444" : "#e5e7eb"}`, borderRadius: 8, fontSize: 13, color: "#111827", outline: "none", boxSizing: "border-box" }} />
            {errors.reason && <p style={{ fontSize: 11, color: "#ef4444", margin: "3px 0 0" }}>{errors.reason}</p>}
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
              Description <span style={{ color: "#9ca3af", fontWeight: 400 }}>(optional)</span>
            </label>
            <textarea value={form.description} onChange={e => set("description", e.target.value)}
              placeholder="Additional details…" rows={2}
              style={{ width: "100%", padding: "9px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, color: "#111827", outline: "none", resize: "vertical", boxSizing: "border-box", fontFamily: "inherit", lineHeight: 1.5 }} />
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: "14px 24px", borderTop: "1px solid #f1f5f9", display: "flex", gap: 10, justifyContent: "flex-end", background: "#fafafa", flexShrink: 0 }}>
          <button onClick={onClose} style={{ padding: "9px 20px", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 9, fontSize: 13, fontWeight: 600, color: "#374151", cursor: "pointer" }}>Cancel</button>
          <button onClick={handleSubmit} disabled={submitting}
            style={{ padding: "9px 22px", background: submitting ? "#9ca3af" : (tab === "extra" ? "#6366f1" : ACCENT), border: "none", borderRadius: 9, fontSize: 13, fontWeight: 700, color: "#fff", cursor: submitting ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 7 }}>
            {submitting ? <><Spinner />&nbsp;Submitting…</> : <><Ic d={ICONS.send} stroke="#fff" size={14} />Submit Request</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── STAT CARD ────────────────────────────────────────────────────────────────
function StatCard({ icon, iconBg, label, used, remaining, color }) {
  return (
    <div style={{ background: "#fff", borderRadius: 14, padding: "18px 20px", border: "1px solid #f3f4f6", display: "flex", alignItems: "center", gap: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.04)", flex: 1, minWidth: 0 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</div>
        <div style={{ fontSize: 28, fontWeight: 800, color: "#111827", lineHeight: 1, letterSpacing: "-1px" }}>{used}</div>
        <div style={{ fontSize: 11.5, color: color || "#3b82f6", marginTop: 5, fontWeight: 500 }}>Remaining: {remaining}</div>
      </div>
      <div style={{ width: 52, height: 52, borderRadius: 14, background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Ic d={icon} stroke="#fff" size={22} />
      </div>
    </div>
  );
}

// ─── BALANCE BAR ──────────────────────────────────────────────────────────────
function BalanceBar({ item, iconBg }) {
  const pct = item.assigned_days > 0 ? Math.round((item.used_days / item.assigned_days) * 100) : 0;
  const barColor = pct >= 90 ? "#ef4444" : pct >= 70 ? "#f59e0b" : "#22c55e";
  return (
    <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #f1f5f9", padding: "14px 16px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: iconBg || "#1f2937", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Ic d={ICONS.briefcase} stroke="#fff" size={14} />
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{item.leave_type_name}</span>
          {item.is_paid && <span style={{ fontSize: 10, background: "#f0fdf4", color: "#16a34a", padding: "1px 6px", borderRadius: 99, fontWeight: 700, border: "1px solid #bbf7d0" }}>Paid</span>}
        </div>
        <div style={{ textAlign: "right" }}>
          <span style={{ fontSize: 16, fontWeight: 800, color: "#111827" }}>{item.used_days}</span>
          <span style={{ fontSize: 12, color: "#9ca3af" }}>/{item.assigned_days}</span>
        </div>
      </div>
      <div style={{ height: 6, background: "#f1f5f9", borderRadius: 3, overflow: "hidden", marginBottom: 6 }}>
        <div style={{ width: `${pct}%`, height: "100%", background: barColor, borderRadius: 3, transition: "width 0.8s ease" }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontSize: 11, color: "#9ca3af" }}>Used: {item.used_days} days</span>
        <span style={{ fontSize: 11, fontWeight: 600, color: item.remaining_days <= 1 ? "#ef4444" : "#16a34a" }}>Remaining: {item.remaining_days} days</span>
      </div>
      {item.policy?.month_type === "specific" && item.policy?.months?.length > 0 && (
        <div style={{ marginTop: 8, padding: "5px 8px", background: "#fffbeb", borderRadius: 6, border: "1px solid #fde68a" }}>
          <span style={{ fontSize: 10.5, color: "#92400e", fontWeight: 600 }}>Allowed: {item.policy.months.join(", ")}</span>
        </div>
      )}
    </div>
  );
}

// ─── EXTRA LEAVE DETAILS TABLE ─────────────────────────────────────────────────
function ExtraLeaveSection({ extraLeaves, loadingExtra, onCancelRequest }) {
  const [pg, setPg] = useState(1);
  const PER = 6;
  const total = Math.ceil((extraLeaves?.length || 0) / PER);
  const rows  = (extraLeaves || []).slice((pg - 1) * PER, pg * PER);

  return (
    <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #f1f5f9", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
      {/* Header */}
      <div style={{ padding: "14px 20px", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 34, height: 34, borderRadius: 9, background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Ic d={ICONS.star} stroke="#3b82f6" size={16} />
        </div>
        <div>
          <div style={{ fontSize: 14.5, fontWeight: 700, color: "#111827" }}>Extra Leave Requests</div>
          <div style={{ fontSize: 11.5, color: "#9ca3af" }}>Leave requests sent directly to HR for approval</div>
        </div>
        <span style={{ background: "#eff6ff", color: "#1d4ed8", borderRadius: 20, padding: "2px 10px", fontSize: 12, fontWeight: 700, border: "1px solid #bfdbfe", marginLeft: 4 }}>
          {extraLeaves?.length || 0}
        </span>
      </div>

      {/* Body */}
      <div style={{ overflowX: "auto" }}>
        {loadingExtra ? (
          <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 10 }}>
            {[...Array(3)].map((_, i) => <Skel key={i} h={52} r={8} />)}
          </div>
        ) : rows.length === 0 ? (
          <div style={{ padding: "44px 0", textAlign: "center", color: "#9ca3af" }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>📭</div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>No extra leave requests yet</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>Use the Apply button above to submit an extra leave request</div>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#f8faff" }}>
                {["#", "Period", "Days", "Reason", "Description", "Applied On", "Status", "HR Remarks", "Action"].map((h, i) => (
                  <th key={i} style={{ padding: "11px 14px 11px 0", ...(i === 0 ? { paddingLeft: 20 } : {}), textAlign: "left", fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.6px", whiteSpace: "nowrap", borderBottom: "1px solid #f1f5f9" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={row.id} className="lv-row" style={{ borderBottom: "1px solid #f9fafb", transition: "background 0.1s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#fafafa"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td style={{ padding: "13px 14px 13px 20px" }}>
                    <span style={{ fontSize: 12, color: "#9ca3af", fontWeight: 600 }}>#{(pg - 1) * PER + idx + 1}</span>
                  </td>
                  <td style={{ padding: "13px 14px 13px 0", whiteSpace: "nowrap" }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: "#111827" }}>{fmtDate(row.start_date)}</div>
                    <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>→ {fmtDate(row.end_date)}</div>
                  </td>
                  <td style={{ padding: "13px 14px 13px 0" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", fontWeight: 700, color: "#6366f1", background: "#eef2ff", padding: "3px 10px", borderRadius: 20, fontSize: 12 }}>
                      {row.number_of_days}d
                    </span>
                  </td>
                  <td style={{ padding: "13px 14px 13px 0", maxWidth: 150 }}>
                    <span style={{ fontStyle: "italic", fontSize: 12, color: "#374151", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>"{row.reason}"</span>
                  </td>
                  <td style={{ padding: "13px 14px 13px 0", maxWidth: 140 }}>
                    <span style={{ fontSize: 12, color: "#6b7280", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.description || "—"}</span>
                  </td>
                  <td style={{ padding: "13px 14px 13px 0", whiteSpace: "nowrap", fontSize: 12, color: "#6b7280" }}>{fmtDate(row.created_at)}</td>
                  <td style={{ padding: "13px 14px 13px 0" }}><StatusBadge status={row.status} /></td>
                  <td style={{ padding: "13px 14px 13px 0", maxWidth: 130 }}>
                    {row.admin_remarks
                      ? <span style={{ fontSize: 11.5, color: "#374151", background: "#f9fafb", padding: "3px 8px", borderRadius: 6, border: "1px solid #e5e7eb", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.admin_remarks}</span>
                      : <span style={{ fontSize: 12, color: "#9ca3af" }}>—</span>
                    }
                  </td>
                  <td style={{ padding: "13px 20px 13px 0" }}>
                    {row.status?.toLowerCase() === "pending" && (
                      <button onClick={() => onCancelRequest(row.id)}
                        style={{ width: 28, height: 28, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                        title="Cancel Request">
                        <Ic d={ICONS.x} stroke="#dc2626" size={12} sw={2} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {total > 1 && (
        <div style={{ padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid #f1f5f9", background: "#fafafa" }}>
          <span style={{ fontSize: 12, color: "#9ca3af" }}>
            Showing {(pg - 1) * PER + 1}–{Math.min(pg * PER, extraLeaves.length)} of {extraLeaves.length}
          </span>
          <div style={{ display: "flex", gap: 4 }}>
            {[...Array(total)].map((_, i) => (
              <button key={i} onClick={() => setPg(i + 1)}
                style={{ width: 28, height: 28, borderRadius: 6, border: `1px solid ${pg === i + 1 ? "#6366f1" : "#e5e7eb"}`, background: pg === i + 1 ? "#6366f1" : "#fff", color: pg === i + 1 ? "#fff" : "#6b7280", fontSize: 12, fontWeight: pg === i + 1 ? 700 : 400, cursor: "pointer" }}>
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function EmployeeLeavePage() {
  const [balances, setBalances]         = useState([]);
  const [history, setHistory]           = useState([]);
  const [extraLeaves, setExtraLeaves]   = useState([]);
  const [loadingBal, setLoadingBal]     = useState(true);
  const [loadingHist, setLoadingHist]   = useState(true);
  const [loadingExtra, setLoadingExtra] = useState(true);
  const [showApply, setShowApply]       = useState(false);
  const [filterStatus, setFilterStatus] = useState("All");
  const [search, setSearch]             = useState("");
  const [rowsPerPage, setRowsPerPage]   = useState(10);
  const [page, setPage]                 = useState(1);

  // Confirm modal
  const [confirm, setConfirm] = useState({ open: false, id: null, type: "assigned", loading: false });
  // Success/error modal
  const [result, setResult]   = useState({ open: false, title: "", message: "", isError: false });

  const showResult = (title, message, isError = false) => setResult({ open: true, title, message, isError });

  const fetchBalances = useCallback(async () => {
    setLoadingBal(true);
    try { const r = await apiFetch("/employee/leave-balance"); setBalances(r.data || []); } catch {}
    finally { setLoadingBal(false); }
  }, []);

  const fetchHistory = useCallback(async () => {
    setLoadingHist(true);
    try { const r = await apiFetch("/employee/leave-history"); setHistory(r.data || []); } catch {}
    finally { setLoadingHist(false); }
  }, []);

  const fetchExtra = useCallback(async () => {
    setLoadingExtra(true);
    try { const r = await apiFetch("/employee/extra-leave-details"); setExtraLeaves(r.data || []); } catch {}
    finally { setLoadingExtra(false); }
  }, []);

  useEffect(() => { fetchBalances(); fetchHistory(); fetchExtra(); }, []);
  const refreshAll = () => { fetchBalances(); fetchHistory(); fetchExtra(); };

  // Open confirm modal — type: "assigned" | "extra"
  const handleRequestCancel     = (id) => setConfirm({ open: true, id, type: "assigned", loading: false });
  const handleExtraRequestCancel = (id) => setConfirm({ open: true, id, type: "extra",    loading: false });

  // Actual cancel API call — routes to correct endpoint based on type
  const handleConfirmCancel = async () => {
    setConfirm(c => ({ ...c, loading: true }));
    const endpoint = confirm.type === "extra"
      ? `/employee/extra-leave-cancel/${confirm.id}`
      : `/employee/leave-cancel/${confirm.id}`;
    try {
      await apiFetch(endpoint, { method: "PUT" });
      setConfirm({ open: false, id: null, type: "assigned", loading: false });
      showResult("Request Cancelled!", "Your leave request has been successfully cancelled.", false);
      refreshAll();
    } catch (err) {
      setConfirm(c => ({ ...c, loading: false }));
      showResult("Cancellation Failed", err.message || "Unable to cancel. Please try again.", true);
    }
  };

  // After apply submit
  const handleSubmitSuccess = (title, message) => {
    showResult(title, message, false);
    refreshAll();
  };

  const pending  = history.filter(r => r.status?.toLowerCase() === "pending");
  const approved = history.filter(r => r.status?.toLowerCase() === "approved");
  const rejected = history.filter(r => r.status?.toLowerCase() === "rejected");

  const filtered = history.filter(r => {
    const matchStatus = filterStatus === "All" || r.status?.toLowerCase() === filterStatus.toLowerCase();
    const q = search.toLowerCase();
    const name = (r.leave_type?.name || "Extra Leave").toLowerCase();
    return matchStatus && (name.includes(q) || (r.reason || "").toLowerCase().includes(q));
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const paginated  = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const FILTER_TABS = [
    { key: "All",      label: "All",      count: history.length  },
    { key: "Pending",  label: "Pending",  count: pending.length  },
    { key: "Approved", label: "Approved", count: approved.length },
    { key: "Rejected", label: "Rejected", count: rejected.length },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, fontFamily: "'Inter',-apple-system,sans-serif" }}>
      <style>{`
        @keyframes spin       { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes shimmer    { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes modalIn    { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes successPop { from{opacity:0;transform:scale(0.86)} to{opacity:1;transform:scale(1)} }
        .lv-row:hover { background: #fafafa !important; }
        .tab-pill { transition: all 0.15s; cursor: pointer; }
      `}</style>

      {/* ── STAT CARDS ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
        {loadingBal
          ? [...Array(4)].map((_, i) => <Skel key={i} h={100} r={14} />)
          : balances.length > 0
            ? balances.slice(0, 4).map((b, i) => (
                <StatCard key={b.leave_type_id} icon={ICONS.briefcase}
                  iconBg={LEAVE_ICON_BG[i % LEAVE_ICON_BG.length]} label={b.leave_type_name}
                  used={b.used_days} remaining={b.remaining_days} color={LEAVE_PALETTE[i % LEAVE_PALETTE.length]} />
              ))
            : <div style={{ gridColumn: "1/-1", padding: 24, textAlign: "center", color: "#9ca3af", background: "#fafafa", borderRadius: 14, border: "1px dashed #e5e7eb" }}>No leave policies assigned yet</div>
        }
      </div>

      {/* ── BALANCE + APPLY ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 16 }}>
        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #f1f5f9", padding: "18px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 14.5, fontWeight: 700, color: "#111827" }}>Leave Balance</div>
              <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>Your current leave usage for {new Date().getFullYear()}</div>
            </div>
            <button onClick={refreshAll}
              style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 7, fontSize: 12, cursor: "pointer", color: "#374151" }}>
              <Ic d={ICONS.refresh} stroke="#9ca3af" size={12} /> Refresh
            </button>
          </div>
          {loadingBal
            ? <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>{[...Array(4)].map((_, i) => <Skel key={i} h={90} r={12} />)}</div>
            : balances.length === 0
              ? <div style={{ padding: "32px 0", textAlign: "center", color: "#9ca3af" }}><div style={{ fontSize: 32, marginBottom: 8 }}>📭</div><div style={{ fontSize: 13 }}>No assigned leaves found</div></div>
              : <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {balances.map((b, i) => <BalanceBar key={b.leave_type_id} item={b} iconBg={LEAVE_ICON_BG[i % LEAVE_ICON_BG.length]} />)}
                </div>
          }
        </div>

        {/* Apply card */}
        <div style={{ background: "linear-gradient(145deg, #1e293b 0%, #0f172a 100%)", borderRadius: 14, padding: "22px 20px", display: "flex", flexDirection: "column", justifyContent: "space-between", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -30, right: -30, width: 140, height: 140, borderRadius: "50%", background: `${ACCENT}20`, pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: -20, left: -20, width: 100, height: 100, borderRadius: "50%", background: `${ACCENT}12`, pointerEvents: "none" }} />
          <div style={{ position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: `${ACCENT}30`, border: `1.5px solid ${ACCENT}50`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Ic d={ICONS.send} stroke={ACCENT} size={18} />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>Apply for Leave</div>
                <div style={{ fontSize: 11.5, color: "#64748b" }}>Submit a new leave request</div>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 }}>
              {["Assigned leave — uses your balance", "Extra leave — HR approval required", "Track status in Leave History"].map((text, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 18, height: 18, borderRadius: "50%", background: `${ACCENT}25`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Ic d={ICONS.check} stroke={ACCENT} size={10} sw={2.5} />
                  </div>
                  <span style={{ fontSize: 12, color: "#94a3b8" }}>{text}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ position: "relative" }}>
            <button onClick={() => setShowApply(true)}
              style={{ width: "100%", background: ACCENT, color: "#fff", border: "none", borderRadius: 10, padding: "12px 0", fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: `0 4px 16px ${ACCENT}55` }}>
              <Ic d={ICONS.plus} stroke="#fff" size={16} sw={2.5} />Apply New Leave
            </button>
            {pending.length > 0 && (
              <div style={{ marginTop: 10, textAlign: "center" }}>
                <span style={{ fontSize: 11.5, color: "#f59e0b", fontWeight: 600 }}>
                  {pending.length} request{pending.length !== 1 ? "s" : ""} pending approval
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── PENDING CARDS ── */}
      {pending.length > 0 && (
        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #f1f5f9", padding: "18px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: "#fff7ed", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Ic d={ICONS.bell} stroke={ACCENT} size={16} />
            </div>
            <div style={{ fontSize: 14.5, fontWeight: 700, color: "#111827" }}>Pending Requests</div>
            <span style={{ background: "#fef3c7", color: "#92400e", borderRadius: 20, padding: "2px 10px", fontSize: 12, fontWeight: 700, border: "1px solid #fde68a" }}>{pending.length} pending</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
            {pending.map(req => (
              <div key={req.id} style={{ background: "#fff", borderRadius: 13, border: "1px solid #fde68a", padding: "14px 16px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Avatar name="Me" size={36} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>My Request</div>
                      <div style={{ fontSize: 11, color: "#9ca3af" }}>Applied: {fmtDate(req.created_at)}</div>
                    </div>
                  </div>
                  <StatusBadge status={req.status} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10, marginBottom: 10 }}>
                  <div style={{ background: "#f9fafb", borderRadius: 8, padding: "8px 12px" }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 3 }}>Type</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>{req.leave_type?.name || "Extra Leave"}</div>
                  </div>
                  <div style={{ background: "#fff7ed", borderRadius: 8, padding: "8px 14px", textAlign: "center" }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 3 }}>Days</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: ACCENT, lineHeight: 1 }}>{req.number_of_days}</div>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: "#374151", marginBottom: 8 }}>{fmtDate(req.start_date)} → {fmtDate(req.end_date)}</div>
                {req.reason && <div style={{ fontSize: 12, color: "#6b7280", fontStyle: "italic", marginBottom: 10 }}>"{req.reason}"</div>}
                <button onClick={() => handleRequestCancel(req.id)}
                  style={{ width: "100%", padding: "7px 0", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 7, fontSize: 12, fontWeight: 600, color: "#dc2626", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  <Ic d={ICONS.x} stroke="#dc2626" size={12} sw={2} />Cancel Request
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── EXTRA LEAVE DETAILS ── */}
      <ExtraLeaveSection
        extraLeaves={extraLeaves}
        loadingExtra={loadingExtra}
        onCancelRequest={handleExtraRequestCancel}
      />

      {/* ── LEAVE HISTORY TABLE ── */}
      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #f1f5f9", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
        {/* Table header */}
        <div style={{ padding: "14px 20px", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Ic d={ICONS.fileText} stroke={ACCENT} size={16} />
            <span style={{ fontWeight: 700, fontSize: 14, color: "#111827" }}>Leave History</span>
            <span style={{ background: "#fef3c7", color: "#92400e", borderRadius: 20, padding: "2px 10px", fontSize: 12, fontWeight: 600 }}>Total: {history.length}</span>
            <span style={{ background: "#ecfdf5", color: "#065f46", borderRadius: 20, padding: "2px 10px", fontSize: 12, fontWeight: 600 }}>Approved: {approved.length}</span>
          </div>
          <div style={{ marginLeft: "auto" }}>
            <button onClick={() => setShowApply(true)}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", background: ACCENT, border: "none", borderRadius: 8, fontSize: 12.5, fontWeight: 700, color: "#fff", cursor: "pointer" }}>
              <Ic d={ICONS.plus} stroke="#fff" size={13} sw={2.5} />Apply Leave
            </button>
          </div>
        </div>

        {/* Filters */}
        <div style={{ padding: "10px 20px", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {FILTER_TABS.map(tab => (
              <button key={tab.key} className="tab-pill"
                onClick={() => { setFilterStatus(tab.key); setPage(1); }}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", border: `1.5px solid ${filterStatus === tab.key ? ACCENT : "#e5e7eb"}`, borderRadius: 20, background: filterStatus === tab.key ? ACCENT : "#fff", fontSize: 12.5, fontWeight: 600, color: filterStatus === tab.key ? "#fff" : "#6b7280" }}>
                {tab.label}
                <span style={{ fontSize: 11, fontWeight: 700, padding: "1px 6px", borderRadius: 10, background: filterStatus === tab.key ? "rgba(255,255,255,0.25)" : "#f3f4f6", color: filterStatus === tab.key ? "#fff" : "#6b7280" }}>{tab.count}</span>
              </button>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 12, color: "#6b7280" }}>Rows</span>
            <select value={rowsPerPage} onChange={e => { setRowsPerPage(Number(e.target.value)); setPage(1); }}
              style={{ border: "1px solid #e5e7eb", borderRadius: 6, padding: "4px 8px", fontSize: 12, color: "#374151", outline: "none" }}>
              {[5, 10, 25, 50].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 7, padding: "5px 10px" }}>
              <Ic d={ICONS.search} stroke="#9ca3af" size={13} />
              <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search…"
                style={{ border: "none", background: "transparent", fontSize: 12, color: "#374151", outline: "none", width: 130 }} />
            </div>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          {loadingHist ? (
            <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 10 }}>
              {[...Array(4)].map((_, i) => <Skel key={i} h={52} r={8} />)}
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#fafafa" }}>
                  <th style={{ width: 40, padding: "11px 16px", textAlign: "center" }}>
                    <input type="checkbox" style={{ width: 14, height: 14, cursor: "pointer", accentColor: ACCENT }} />
                  </th>
                  {["#","Leave Type","From","To","Days","Reason","Applied On","Approved By","Status",""].map((h, i) => (
                    <th key={i} style={{ padding: "11px 12px 11px 0", textAlign: "left", fontSize: 11.5, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.5px", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr><td colSpan={11} style={{ padding: "50px 0", textAlign: "center", color: "#9ca3af", fontSize: 13 }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>📋</div>No leave records found
                  </td></tr>
                ) : paginated.map((row, idx) => {
                  const typeName = row.leave_type?.name || "Extra Leave";
                  const isExtra  = !row.leave_type;
                  return (
                    <tr key={row.id} className="lv-row" style={{ borderTop: "1px solid #f3f4f6", background: "#fff", transition: "background 0.12s" }}>
                      <td style={{ padding: "12px 16px", textAlign: "center" }}>
                        <input type="checkbox" style={{ width: 14, height: 14, cursor: "pointer", accentColor: ACCENT }} />
                      </td>
                      <td style={{ padding: "12px 12px 12px 0" }}>
                        <span style={{ fontSize: 12, color: "#9ca3af", fontWeight: 600 }}>#{(page - 1) * rowsPerPage + idx + 1}</span>
                      </td>
                      <td style={{ padding: "12px 12px 12px 0" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                          <div style={{ width: 28, height: 28, borderRadius: 7, background: isExtra ? "#eff6ff" : "#fff7ed", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <Ic d={isExtra ? ICONS.star : ICONS.briefcase} stroke={isExtra ? "#3b82f6" : ACCENT} size={13} />
                          </div>
                          <div>
                            <span style={{ fontSize: 13, fontWeight: 600, color: "#111827", whiteSpace: "nowrap" }}>{typeName}</span>
                            {isExtra && <span style={{ marginLeft: 6, fontSize: 9.5, background: "#eff6ff", color: "#1d4ed8", padding: "1px 5px", borderRadius: 99, fontWeight: 700, border: "1px solid #bfdbfe" }}>EXTRA</span>}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "12px 12px 12px 0", color: "#374151", whiteSpace: "nowrap" }}>{fmtDate(row.start_date)}</td>
                      <td style={{ padding: "12px 12px 12px 0", color: "#374151", whiteSpace: "nowrap" }}>{fmtDate(row.end_date)}</td>
                      <td style={{ padding: "12px 12px 12px 0" }}>
                        <span style={{ display: "inline-flex", fontWeight: 700, color: ACCENT, background: "#fff7ed", padding: "3px 10px", borderRadius: 20, fontSize: 12 }}>
                          {row.number_of_days} {row.number_of_days === 1 ? "Day" : "Days"}
                        </span>
                      </td>
                      <td style={{ padding: "12px 12px 12px 0", color: "#6b7280", maxWidth: 160 }}>
                        <span style={{ fontStyle: "italic", fontSize: 12, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>"{row.reason}"</span>
                      </td>
                      <td style={{ padding: "12px 12px 12px 0", color: "#6b7280", whiteSpace: "nowrap", fontSize: 12 }}>{fmtDate(row.created_at)}</td>
                      <td style={{ padding: "12px 12px 12px 0" }}>
                        {row.approved_by
                          ? <div style={{ display: "flex", alignItems: "center", gap: 7 }}><Avatar name={String(row.approved_by)} size={24} /><span style={{ fontSize: 12, color: "#374151" }}>{row.approved_by}</span></div>
                          : <span style={{ fontSize: 12, color: "#9ca3af" }}>Awaiting…</span>}
                      </td>
                      <td style={{ padding: "12px 12px 12px 0" }}><StatusBadge status={row.status} /></td>
                      <td style={{ padding: "12px 16px 12px 0" }}>
                        <div style={{ display: "flex", gap: 5 }}>
                          {row.status?.toLowerCase() === "pending" && (
                            <button onClick={() => handleRequestCancel(row.id)}
                              style={{ width: 28, height: 28, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }} title="Cancel">
                              <Ic d={ICONS.x} stroke="#dc2626" size={12} sw={2} />
                            </button>
                          )}
                          <button style={{ width: 28, height: 28, background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }} title="View">
                            <Ic d={ICONS.info} stroke="#0369a1" size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <div style={{ padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid #f3f4f6", background: "#fafafa" }}>
          <span style={{ fontSize: 12, color: "#6b7280" }}>
            Showing {filtered.length === 0 ? 0 : Math.min((page - 1) * rowsPerPage + 1, filtered.length)}–{Math.min(page * rowsPerPage, filtered.length)} of {filtered.length}
          </span>
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              style={{ width: 30, height: 30, borderRadius: 6, border: "1px solid #e5e7eb", background: "#fff", cursor: page === 1 ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: page === 1 ? 0.4 : 1 }}>
              <Ic d={ICONS.chevLeft} size={13} stroke="#6b7280" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).slice(Math.max(0, page - 3), page + 2).map(n => (
              <button key={n} onClick={() => setPage(n)}
                style={{ width: 30, height: 30, borderRadius: 6, border: `1px solid ${n === page ? ACCENT : "#e5e7eb"}`, background: n === page ? ACCENT : "#fff", fontSize: 12.5, fontWeight: n === page ? 700 : 400, color: n === page ? "#fff" : "#6b7280", cursor: "pointer" }}>
                {n}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              style={{ width: 30, height: 30, borderRadius: 6, border: "1px solid #e5e7eb", background: "#fff", cursor: page === totalPages ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: page === totalPages ? 0.4 : 1 }}>
              <Ic d={ICONS.chevRight} size={13} stroke="#6b7280" />
            </button>
          </div>
        </div>
      </div>

      {/* ── MODALS ── */}
      {showApply && (
        <ApplyLeaveModal
          onClose={() => setShowApply(false)}
          onSuccess={handleSubmitSuccess}
          onError={(msg) => showResult("Submission Failed", msg, true)}
          balances={balances}
        />
      )}

      <ConfirmModal
        isOpen={confirm.open}
        title="Cancel Leave Request?"
        message="Are you sure you want to cancel this leave request? This action cannot be undone."
        onConfirm={handleConfirmCancel}
        onClose={() => !confirm.loading && setConfirm(c => ({ ...c, open: false }))}
        loading={confirm.loading}
      />

      <SuccessModal
        isOpen={result.open}
        title={result.title}
        message={result.message}
        isError={result.isError}
        onClose={() => setResult(r => ({ ...r, open: false }))}
      />
    </div>
  );
}
