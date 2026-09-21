"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import {
  FiBell, FiPlus, FiCheck, FiX, FiSearch, FiChevronLeft, FiChevronRight,
  FiClock, FiInfo, FiBriefcase, FiSend, FiFileText, FiRefreshCw, FiStar,
  FiAlertCircle, FiCalendar, FiUser, FiMessageSquare, FiCheckCircle,
  FiXCircle, FiAlertTriangle, FiSun, FiMoon, FiChevronDown, FiChevronUp,
  FiFilter, FiDownload, FiEye, FiCoffee, FiHeart, FiActivity
} from "react-icons/fi";
import { HiOutlineOfficeBuilding } from "react-icons/hi";
import {
  MdOutlineBeachAccess, MdOutlineSick, MdOutlineEventBusy,
  MdOutlineChildCare, MdOutlineWorkOff, MdOutlineCelebration
} from "react-icons/md";
import { PiBriefcaseBold, PiCalendarCheckBold } from "react-icons/pi";

// ─── CONFIG ────────────────────────────────────────────────────────────────
const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const ACCENT = "#f97316";

// ─── API HELPERS ───────────────────────────────────────────────────────────
function getToken() {
  if (typeof window !== "undefined")
    return localStorage.getItem("employee_auth_token") || "";
  return "";
}
async function apiFetch(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "ngrok-skip-browser-warning": "true",
      ...(options.headers || {}),
    },
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || "API error");
  return data;
}

// ─── DATE HELPERS ──────────────────────────────────────────────────────────
function fmtDate(d) {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
    });
  } catch { return "—"; }
}
function fmtDateTime(d) {
  if (!d) return "—";
  try {
    const dt = new Date(d);
    return (
      dt.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) +
      " · " +
      dt.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
    );
  } catch { return "—"; }
}

// Working days from a date range, respecting shift active_days (mon..sun)
function countWorkingDays(from, to, activeDays = ["mon","tue","wed","thu","fri","sat"]) {
  if (!from || !to) return 0;
  const start = new Date(from);
  const end = new Date(to);
  if (isNaN(start) || isNaN(end) || end < start) return 0;
  const dayMap = ["sun","mon","tue","wed","thu","fri","sat"];
  const norm = activeDays.map(d => d.toLowerCase().slice(0, 3));
  let count = 0;
  const cur = new Date(start);
  while (cur <= end) {
    const short = dayMap[cur.getDay()];
    if (norm.includes(short)) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
}

// ─── ICON HELPERS ──────────────────────────────────────────────────────────
function leaveTypeIcon(name = "") {
  const n = name.toLowerCase();
  if (n.includes("sick")) return <MdOutlineSick size={16} />;
  if (n.includes("casual")) return <FiCoffee size={16} />;
  if (n.includes("annual") || n.includes("vacation") || n.includes("paid"))
    return <MdOutlineBeachAccess size={16} />;
  if (n.includes("maternity") || n.includes("paternity") || n.includes("child"))
    return <MdOutlineChildCare size={16} />;
  if (n.includes("bereave") || n.includes("death"))
    return <MdOutlineEventBusy size={16} />;
  if (n.includes("marriage") || n.includes("wedding"))
    return <MdOutlineCelebration size={16} />;
  if (n.includes("holiday") || n.includes("public"))
    return <MdOutlineCelebration size={16} />;
  return <FiBriefcase size={16} />;
}

// Solid accent color per leave type (no gradients)
const LEAVE_COLORS = [
  "#3b82f6", "#8b5cf6", "#ec4899", "#f97316",
  "#10b981", "#f59e0b", "#06b6d4", "#ef4444",
];
function leaveColor(i) { return LEAVE_COLORS[i % LEAVE_COLORS.length]; }

// ─── STATUS CONFIG ─────────────────────────────────────────────────────────
const STATUS_CFG = {
  pending:   { color: "#b45309", bg: "#fffbeb", border: "#fde68a", dot: "#f59e0b", label: "Pending",   Icon: FiClock },
  approved:  { color: "#15803d", bg: "#f0fdf4", border: "#bbf7d0", dot: "#22c55e", label: "Approved",  Icon: FiCheckCircle },
  rejected:  { color: "#b91c1c", bg: "#fef2f2", border: "#fecaca", dot: "#ef4444", label: "Rejected",  Icon: FiXCircle },
  cancelled: { color: "#4b5563", bg: "#f9fafb", border: "#e5e7eb", dot: "#9ca3af", label: "Cancelled", Icon: FiX },
};

function StatusPill({ status }) {
  const cfg = STATUS_CFG[status?.toLowerCase()] || STATUS_CFG.pending;
  const Icon = cfg.Icon;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
      style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
    >
      <Icon size={11} />
      {cfg.label}
    </span>
  );
}

// ─── AVATAR ────────────────────────────────────────────────────────────────
const AV_COLORS = ["#f97316","#6366f1","#22c55e","#ef4444","#8b5cf6","#06b6d4","#ec4899","#14b8a6"];
function avatarBg(name = "") {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffffffff;
  return AV_COLORS[Math.abs(h) % AV_COLORS.length];
}
function Avatar({ name = "?", size = 32 }) {
  const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div
      className="flex items-center justify-center font-bold text-white shrink-0"
      style={{
        width: size, height: size, borderRadius: "50%",
        background: avatarBg(name), fontSize: size * 0.36,
      }}
    >
      {initials}
    </div>
  );
}

// ─── SPINNER ───────────────────────────────────────────────────────────────
function Spinner({ color = "#fff", size = 14 }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={2.5} strokeLinecap="round"
      className="animate-spin shrink-0"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

// ─── SKELETON ──────────────────────────────────────────────────────────────
function Skel({ className = "", style = {} }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-gray-100 ${className}`}
      style={{ background: "linear-gradient(90deg,#f1f5f9 25%,#e9eef5 50%,#f1f5f9 75%)", backgroundSize: "200% 100%", ...style }}
    />
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// LEAVE DETAIL SHEET
// ═══════════════════════════════════════════════════════════════════════════
function LeaveDetailSheet({ leave, onClose, onCancel, cancelling }) {
  if (!leave) return null;
  const cfg = STATUS_CFG[leave.status?.toLowerCase()] || STATUS_CFG.pending;
  const StatusIcon = cfg.Icon;
  const isExtra = !leave.leave_type;
  const typeName = leave.leave_type?.name || "Extra Leave";
  const isPending = leave.status?.toLowerCase() === "pending";

  // Timeline
  const timeline = [
    {
      label: "Requested",
      date: leave.created_at,
      Icon: FiSend,
      color: "#3b82f6",
      done: true,
    },
    ...(leave.status?.toLowerCase() !== "pending"
      ? [{
          label: cfg.label,
          date: leave.updated_at,
          Icon: StatusIcon,
          color: cfg.dot,
          done: true,
          note: leave.admin_remarks,
        }]
      : []),
  ];

  return (
    <div
      className="fixed inset-0 z-[800] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-6"
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0"
              style={{ background: isExtra ? "#6366f1" : ACCENT }}
            >
              {isExtra ? <FiStar size={18} /> : leaveTypeIcon(typeName)}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                {isExtra ? "Extra Leave" : "Leave Request"} · #{leave.id}
              </p>
              <h3 className="text-base font-bold text-gray-900 truncate">{typeName}</h3>
              <div className="mt-1"><StatusPill status={leave.status} /></div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 transition shrink-0"
          >
            <FiX size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          {/* Period card */}
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">From</p>
                <p className="text-sm font-semibold text-gray-800">{fmtDate(leave.start_date)}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">To</p>
                <p className="text-sm font-semibold text-gray-800">{fmtDate(leave.end_date)}</p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
              <span className="text-xs text-gray-500 font-medium">Total duration</span>
              <span
                className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full"
                style={{ background: "#fff7ed", color: ACCENT }}
              >
                <FiCalendar size={11} />
                {leave.number_of_days} {leave.number_of_days === 1 ? "day" : "days"}
              </span>
            </div>
          </div>

          {/* Reason */}
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <FiFileText size={11} /> Reason
            </p>
            <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-3 border border-gray-100">
              {leave.reason || "—"}
            </p>
          </div>

          {/* Description */}
          {leave.description && (
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <FiMessageSquare size={11} /> Description
              </p>
              <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-3 border border-gray-100 whitespace-pre-wrap">
                {leave.description}
              </p>
            </div>
          )}

          {/* Admin Remarks */}
          {leave.admin_remarks && (
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <FiMessageSquare size={11} /> Admin Remarks
              </p>
              <div
                className="rounded-xl p-3 border text-sm"
                style={{
                  background: leave.status === "rejected" ? "#fef2f2" : "#f0fdf4",
                  borderColor: leave.status === "rejected" ? "#fecaca" : "#bbf7d0",
                  color: leave.status === "rejected" ? "#b91c1c" : "#15803d",
                }}
              >
                {leave.admin_remarks}
              </div>
            </div>
          )}

          {/* Approval info */}
          {(leave.approved_at || leave.approved_by) && (
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                Reviewed By
              </p>
              <div className="flex items-center gap-2.5">
                <Avatar name={String(leave.approved_by || "Admin")} size={32} />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">
                    {leave.approved_by || "Admin"}
                  </p>
                  {leave.approved_at && (
                    <p className="text-[11px] text-gray-400">{fmtDateTime(leave.approved_at)}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Timeline */}
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <FiActivity size={11} /> Timeline
            </p>
            <div className="relative pl-6">
              <div className="absolute left-2 top-2 bottom-2 w-px bg-gray-200" />
              {timeline.map((t, i) => {
                const Icon = t.Icon;
                return (
                  <div key={i} className={`relative ${i === timeline.length - 1 ? "" : "pb-4"}`}>
                    <div
                      className="absolute -left-[22px] top-1 w-4 h-4 rounded-full flex items-center justify-center ring-4 ring-white"
                      style={{ background: t.color }}
                    >
                      <Icon size={8} className="text-white" strokeWidth={3} />
                    </div>
                    <div className="bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
                      <p className="text-xs font-bold text-gray-800">{t.label}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{fmtDateTime(t.date)}</p>
                      {t.note && (
                        <p className="text-[11px] text-gray-600 mt-1 italic">"{t.note}"</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-3 bg-gray-50">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition"
          >
            Close
          </button>
          {isPending && onCancel && (
            <button
              onClick={() => onCancel(leave)}
              disabled={cancelling}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-xl disabled:opacity-60 transition"
              style={{ background: "#dc2626" }}
            >
              {cancelling ? <><Spinner size={13} />Cancelling…</> : <><FiX size={14} />Cancel Request</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// CONFIRM MODAL
// ═══════════════════════════════════════════════════════════════════════════
function ConfirmModal({ isOpen, title, message, onConfirm, onClose, loading }) {
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 z-[900] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={!loading ? onClose : undefined}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden"
      >
        <div className="p-6 text-center">
          <div className="w-14 h-14 rounded-full bg-red-50 border-2 border-red-200 flex items-center justify-center mx-auto mb-4">
            <FiAlertTriangle size={24} className="text-red-600" />
          </div>
          <h3 className="text-base font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-sm text-gray-500 leading-relaxed">{message}</p>
        </div>
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
          >
            Keep It
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? <><Spinner size={13} />Cancelling…</> : <><FiX size={14} />Yes, Cancel</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// TOAST (success / error)
// ═══════════════════════════════════════════════════════════════════════════
function Toast({ isOpen, title, message, isError = false, onClose }) {
  useEffect(() => {
    if (!isOpen) return;
    const t = setTimeout(onClose, 3200);
    return () => clearTimeout(t);
  }, [isOpen, onClose]);
  if (!isOpen) return null;

  const bg = isError ? "#dc2626" : "#059669";
  const Icon = isError ? FiXCircle : FiCheckCircle;
  return (
    <div className="fixed top-6 right-6 z-[950] max-w-sm" onClick={onClose}>
      <div
        className="rounded-2xl shadow-2xl overflow-hidden flex items-stretch"
        style={{ background: bg }}
      >
        <div className="flex items-center justify-center px-4">
          <Icon size={22} className="text-white" />
        </div>
        <div className="flex-1 py-3.5 pr-4">
          <p className="text-sm font-bold text-white leading-tight">{title}</p>
          <p className="text-xs text-white/85 mt-0.5 leading-snug">{message}</p>
        </div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// APPLY LEAVE MODAL
// ═══════════════════════════════════════════════════════════════════════════
function ApplyLeaveModal({ onClose, onSuccess, onError, balances, shift }) {
  const [tab, setTab] = useState("assigned");
  const [form, setForm] = useState({
    leave_type_id: "", start_date: "", end_date: "", reason: "", description: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const activeDays = shift?.active_days || ["mon","tue","wed","thu","fri","sat"];
  const selected = balances.find(b => String(b.leave_type_id) === String(form.leave_type_id));
  const allowedMonths = selected?.policy?.month_type === "specific" ? (selected.policy.months || []) : [];
  const workingDays = countWorkingDays(form.start_date, form.end_date, activeDays);
  const calendarDays = form.start_date && form.end_date
    ? Math.max(0, Math.round((new Date(form.end_date) - new Date(form.start_date)) / 86400000) + 1)
    : 0;

  const set = (k, v) => {
    setForm(p => ({ ...p, [k]: v }));
    setErrors(p => ({ ...p, [k]: "" }));
  };

  const validate = () => {
    const e = {};
    if (tab === "assigned" && !form.leave_type_id) e.leave_type_id = "Select a leave type";
    if (!form.start_date) e.start_date = "Start date required";
    if (!form.end_date) e.end_date = "End date required";
    if (form.start_date && form.end_date && form.end_date < form.start_date)
      e.end_date = "End date must be after start";
    if (!form.reason.trim()) e.reason = "Reason is required";
    if (form.start_date && form.end_date && workingDays === 0)
      e.end_date = "Selected range has no working days (Sunday off)";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSubmitting(true);
    try {
      if (tab === "assigned") {
        await apiFetch("/api/employee/apply-leave", {
          method: "POST",
          body: JSON.stringify({
            leave_type_id: Number(form.leave_type_id),
            start_date: form.start_date,
            end_date: form.end_date,
            reason: form.reason,
            description: form.description || null,
            is_extra: false,
          }),
        });
        onSuccess("Leave Request Submitted!", "Your request has been sent for manager approval.");
      } else {
        await apiFetch("/api/employee/apply-leave", {
          method: "POST",
          body: JSON.stringify({
            start_date: form.start_date,
            end_date: form.end_date,
            reason: form.reason,
            description: form.description || null,
            is_extra: true,
          }),
        });
        onSuccess("Extra Leave Submitted!", "Your extra leave request has been sent to HR for review.");
      }
      onClose();
    } catch (err) {
      onError(err.message || "Failed to submit leave request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[850] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between shrink-0" style={{ background: "#fff7ed" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0" style={{ background: ACCENT }}>
              <FiSend size={17} />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Apply for Leave</h3>
              <p className="text-[11px] text-gray-500">Fill in all required fields</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white hover:bg-gray-100 flex items-center justify-center text-gray-500 border border-gray-200"
          >
            <FiX size={15} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 shrink-0 bg-white">
          {[
            { key: "assigned", label: "Assigned Leave", Icon: PiBriefcaseBold },
            { key: "extra", label: "Extra Leave", Icon: FiStar },
          ].map(t => {
            const Icon = t.Icon;
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => {
                  setTab(t.key);
                  setForm({ leave_type_id: "", start_date: "", end_date: "", reason: "", description: "" });
                  setErrors({});
                }}
                className="flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 border-b-2 transition"
                style={{
                  color: active ? ACCENT : "#6b7280",
                  borderBottomColor: active ? ACCENT : "transparent",
                  background: "transparent",
                }}
              >
                <Icon size={14} />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
          {tab === "extra" && (
            <div className="flex items-start gap-2.5 p-3 bg-blue-50 border border-blue-100 rounded-xl">
              <FiInfo size={14} className="text-blue-600 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-800 leading-relaxed">
                Extra leave goes directly to HR for approval. No balance is deducted — HR decides at their discretion.
              </p>
            </div>
          )}

          {/* Leave type (assigned) */}
          {tab === "assigned" && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Leave Type <span className="text-red-500">*</span>
              </label>
              <select
                value={form.leave_type_id}
                onChange={e => set("leave_type_id", e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none transition ${
                  errors.leave_type_id ? "border-red-400 bg-red-50" : "border-gray-200 bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                }`}
                style={{ color: form.leave_type_id ? "#111827" : "#9ca3af" }}
              >
                <option value="">Select leave type…</option>
                {balances.map(b => (
                  <option key={b.leave_type_id} value={b.leave_type_id} disabled={b.remaining_days === 0}>
                    {b.leave_type_name} — {b.remaining_days} day{b.remaining_days !== 1 ? "s" : ""} left
                    {b.remaining_days === 0 ? " (Exhausted)" : ""}
                  </option>
                ))}
              </select>
              {errors.leave_type_id && (
                <p className="text-[11px] text-red-500 mt-1">{errors.leave_type_id}</p>
              )}
              {allowedMonths.length > 0 && (
                <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5 mt-2 inline-block">
                  Allowed months: {allowedMonths.join(", ")}
                </p>
              )}
            </div>
          )}

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: "start_date", label: "From Date" },
              { key: "end_date", label: "To Date" },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  {label} <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={form[key]}
                  onChange={e => set(key, e.target.value)}
                  min={key === "end_date" ? form.start_date || undefined : undefined}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none transition ${
                    errors[key] ? "border-red-400 bg-red-50" : "border-gray-200 bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  }`}
                />
                {errors[key] && <p className="text-[11px] text-red-500 mt-1">{errors[key]}</p>}
              </div>
            ))}
          </div>

          {/* Working days summary */}
          {form.start_date && form.end_date && calendarDays > 0 && (
            <div
              className="rounded-xl p-3.5 border flex items-start gap-3"
              style={{
                background: workingDays === 0 ? "#fef2f2" : "#f0fdf4",
                borderColor: workingDays === 0 ? "#fecaca" : "#bbf7d0",
              }}
            >
              {workingDays === 0 ? (
                <>
                  <FiAlertTriangle size={16} className="text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-red-800">No working days in range</p>
                    <p className="text-[11px] text-red-600 mt-0.5">
                      Your shift works {activeDays.map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(", ")}. Pick a working day.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <FiCalendar size={16} className="text-green-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs font-bold text-green-800">
                      {workingDays} working day{workingDays !== 1 ? "s" : ""}
                    </p>
                    <p className="text-[11px] text-green-700 mt-0.5">
                      {fmtDate(form.start_date)} → {fmtDate(form.end_date)}
                      {calendarDays !== workingDays && ` · ${calendarDays - workingDays} day${calendarDays - workingDays !== 1 ? "s" : ""} off`}
                    </p>
                  </div>
                  {tab === "assigned" && selected && workingDays > selected.remaining_days && (
                    <span className="text-[10px] font-bold text-red-700 bg-red-100 border border-red-200 px-2 py-0.5 rounded-full">
                      Exceeds balance!
                    </span>
                  )}
                </>
              )}
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Reason <span className="text-red-500">*</span>
            </label>
            <input
              value={form.reason}
              onChange={e => set("reason", e.target.value)}
              placeholder="Brief reason for leave…"
              className={`w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none transition ${
                errors.reason ? "border-red-400 bg-red-50" : "border-gray-200 bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              }`}
            />
            {errors.reason && <p className="text-[11px] text-red-500 mt-1">{errors.reason}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Description <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={form.description}
              onChange={e => set("description", e.target.value)}
              placeholder="Additional details…"
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-gray-200 bg-white outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100 resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-xl transition disabled:opacity-60"
            style={{ background: tab === "extra" ? "#6366f1" : ACCENT }}
          >
            {submitting ? <><Spinner size={13} />Submitting…</> : <><FiSend size={14} />Submit Request</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// BALANCE CARD
// ═══════════════════════════════════════════════════════════════════════════
function BalanceCard({ item, index }) {
  const pct = item.assigned_days > 0
    ? Math.round((item.used_days / item.assigned_days) * 100)
    : 0;
  const barColor = pct >= 90 ? "#ef4444" : pct >= 70 ? "#f59e0b" : "#22c55e";
  const color = leaveColor(index);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 hover:border-gray-200 hover:shadow-sm transition">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0"
            style={{ background: color }}
          >
            {leaveTypeIcon(item.leave_type_name)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">{item.leave_type_name}</p>
            {item.is_paid && (
              <span className="text-[9px] font-bold uppercase tracking-wide text-green-700 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded">
                Paid
              </span>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-gray-900 leading-none tabular-nums">
            {item.remaining_days}
          </p>
          <p className="text-[10px] text-gray-400 mt-0.5">of {item.assigned_days}</p>
        </div>
      </div>

      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-2">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: barColor }}
        />
      </div>

      <div className="flex items-center justify-between text-[11px]">
        <span className="text-gray-500">{item.used_days} used</span>
        <span
          className="font-semibold"
          style={{ color: item.remaining_days <= 1 ? "#ef4444" : "#16a34a" }}
        >
          {item.remaining_days} remaining
        </span>
      </div>

      {item.policy?.month_type === "specific" && item.policy?.months?.length > 0 && (
        <div className="mt-3 px-2 py-1.5 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-[10px] text-amber-700 font-semibold truncate">
            Allowed: {item.policy.months.join(", ")}
          </p>
        </div>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════
export default function EmployeeLeavePage() {
  const [balances, setBalances]       = useState([]);
  const [history, setHistory]         = useState([]);
  const [shift, setShift]             = useState(null);
  const [loadingBal, setLoadingBal]   = useState(true);
  const [loadingHist, setLoadingHist] = useState(true);
  const [showApply, setShowApply]     = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [search, setSearch]           = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage]               = useState(1);

  // Sheet
  const [detailLeave, setDetailLeave] = useState(null);
  // Confirm
  const [confirm, setConfirm] = useState({ open: false, id: null, loading: false, inSheet: false });
  // Toast
  const [toast, setToast] = useState({ open: false, title: "", message: "", isError: false });

  const showToast = (title, message, isError = false) =>
    setToast({ open: true, title, message, isError });

  // ── Fetchers ──────────────────────────────────────────────────────────
  const fetchBalances = useCallback(async () => {
    setLoadingBal(true);
    try {
      const r = await apiFetch("/api/employee/leave-balance");
      setBalances(r.data || []);
    } catch (e) { console.error(e); }
    finally { setLoadingBal(false); }
  }, []);

  const fetchHistory = useCallback(async () => {
    setLoadingHist(true);
    try {
      const r = await apiFetch("/api/employee/leave-history");
      setHistory(r.data || []);
    } catch (e) { console.error(e); }
    finally { setLoadingHist(false); }
  }, []);

  const fetchShift = useCallback(async () => {
    try {
      const r = await apiFetch("/api/employee/my-shift");
      setShift(r.data || null);
    } catch (e) {
      // Fallback: use default Mon–Sat if endpoint fails
      setShift({ active_days: ["mon","tue","wed","thu","fri","sat"] });
    }
  }, []);

  useEffect(() => {
    fetchBalances();
    fetchHistory();
    fetchShift();
  }, [fetchBalances, fetchHistory, fetchShift]);

  const refreshAll = () => { fetchBalances(); fetchHistory(); };

  // ── Cancel flow ───────────────────────────────────────────────────────
  const openConfirm = (id, inSheet = false) =>
    setConfirm({ open: true, id, loading: false, inSheet });

  const handleConfirmCancel = async () => {
    setConfirm(c => ({ ...c, loading: true }));
    try {
      await apiFetch(`/api/employee/leave-cancel/${confirm.id}`, { method: "PUT" });
      setConfirm({ open: false, id: null, loading: false, inSheet: false });
      if (confirm.inSheet) setDetailLeave(null);
      showToast("Request Cancelled", "Your leave request has been cancelled successfully.", false);
      refreshAll();
    } catch (err) {
      setConfirm(c => ({ ...c, loading: false }));
      showToast("Cancellation Failed", err.message || "Unable to cancel. Please try again.", true);
    }
  };

  // ── Derived ───────────────────────────────────────────────────────────
  const pending  = history.filter(r => r.status?.toLowerCase() === "pending");
  const approved = history.filter(r => r.status?.toLowerCase() === "approved");
  const rejected = history.filter(r => r.status?.toLowerCase() === "rejected");

  const filtered = useMemo(() => {
    return history.filter(r => {
      const st = r.status?.toLowerCase() || "";
      const matchStatus = filterStatus === "all" || st === filterStatus;
      const q = search.toLowerCase().trim();
      if (!q) return matchStatus;
      const name = (r.leave_type?.name || "Extra Leave").toLowerCase();
      const reason = (r.reason || "").toLowerCase();
      return matchStatus && (name.includes(q) || reason.includes(q));
    });
  }, [history, filterStatus, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const paginated  = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  useEffect(() => { setPage(1); }, [filterStatus, search, rowsPerPage]);

  const FILTER_TABS = [
    { key: "all",      label: "All",      count: history.length },
    { key: "pending",  label: "Pending",  count: pending.length },
    { key: "approved", label: "Approved", count: approved.length },
    { key: "rejected", label: "Rejected", count: rejected.length },
  ];

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>

      {/* ─── Header ─── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Leave Management</h1>
          <p className="text-xs text-gray-500">Track your leave balance, apply, and view history</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refreshAll}
            className="flex items-center gap-2 px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 transition"
          >
            <FiRefreshCw size={12} className={loadingBal || loadingHist ? "animate-spin" : ""} />
            Refresh
          </button>
          <button
            onClick={() => setShowApply(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white transition shadow-sm"
            style={{ background: ACCENT }}
          >
            <FiPlus size={14} />
            Apply Leave
          </button>
        </div>
      </div>

      {/* ─── Stats Strip ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total Requests", value: history.length, Icon: FiFileText, color: "#3b82f6", bg: "#eff6ff" },
          { label: "Pending",        value: pending.length,  Icon: FiClock,     color: "#f59e0b", bg: "#fffbeb" },
          { label: "Approved",       value: approved.length, Icon: FiCheckCircle, color: "#22c55e", bg: "#f0fdf4" },
          { label: "Rejected",       value: rejected.length, Icon: FiXCircle,   color: "#ef4444", bg: "#fef2f2" },
        ].map(({ label, value, Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: bg, color }}
            >
              <Icon size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-gray-500 font-medium">{label}</p>
              <p className="text-xl font-bold text-gray-900 leading-tight">
                {loadingHist ? "—" : value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ─── Balance Section ─── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "#fff7ed", color: ACCENT }}>
            <PiBriefcaseBold size={15} />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-800">Leave Balance</p>
            <p className="text-[11px] text-gray-500">
              Year {new Date().getFullYear()}
              {shift?.active_days?.length > 0 && ` · Working days: ${shift.active_days.map(d => d[0].toUpperCase() + d.slice(1)).join(", ")}`}
            </p>
          </div>
        </div>

        {loadingBal ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => <Skel key={i} style={{ height: 130 }} />)}
          </div>
        ) : balances.length === 0 ? (
          <div className="text-center py-10">
            <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-3">
              <PiBriefcaseBold size={20} className="text-gray-300" />
            </div>
            <p className="text-sm font-semibold text-gray-500">No leave policies assigned</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Contact HR to get leave types assigned</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {balances.map((b, i) => (
              <BalanceCard key={b.leave_type_id} item={b} index={i} />
            ))}
          </div>
        )}
      </div>

      {/* ─── Pending Alert ─── */}
      {pending.length > 0 && (
        <div
          className="rounded-2xl border p-4 flex items-start gap-3"
          style={{ background: "#fffbeb", borderColor: "#fde68a" }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "#fef3c7", color: "#b45309" }}
          >
            <FiBell size={15} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-amber-900">
              {pending.length} pending request{pending.length !== 1 ? "s" : ""}
            </p>
            <p className="text-xs text-amber-700 mt-0.5">
              Waiting for admin approval. Click a card below to view details.
            </p>
          </div>
        </div>
      )}

      {/* ─── History Table ─── */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {/* Toolbar */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "#fff7ed", color: ACCENT }}>
              <FiFileText size={15} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">Leave History</p>
              <p className="text-[11px] text-gray-500">All your leave requests</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Search */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg">
              <FiSearch size={13} className="text-gray-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search…"
                className="bg-transparent outline-none text-xs text-gray-700 w-32"
              />
              {search && (
                <button onClick={() => setSearch("")} className="text-gray-400 hover:text-gray-600">
                  <FiX size={11} />
                </button>
              )}
            </div>

            {/* Rows per page */}
            <select
              value={rowsPerPage}
              onChange={e => setRowsPerPage(Number(e.target.value))}
              className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-600 outline-none cursor-pointer"
            >
              {[10, 25, 50, 100].map(n => <option key={n} value={n}>{n} / page</option>)}
            </select>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2 overflow-x-auto">
          {FILTER_TABS.map(t => {
            const active = filterStatus === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setFilterStatus(t.key)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition"
                style={{
                  background: active ? ACCENT : "#f3f4f6",
                  color: active ? "#fff" : "#6b7280",
                }}
              >
                {t.label}
                <span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded-full tabular-nums"
                  style={{
                    background: active ? "rgba(255,255,255,0.25)" : "#e5e7eb",
                    color: active ? "#fff" : "#6b7280",
                  }}
                >
                  {t.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Table body */}
        <div className="overflow-x-auto">
          {loadingHist ? (
            <div className="p-5 space-y-2">
              {[...Array(5)].map((_, i) => <Skel key={i} style={{ height: 52 }} />)}
            </div>
          ) : paginated.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-3">
                <FiFileText size={22} className="text-gray-300" />
              </div>
              <p className="text-sm font-semibold text-gray-500">No leave records found</p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                {search ? "Try a different search" : "Apply for a leave to get started"}
              </p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {["Type", "Period", "Days", "Reason", "Applied", "Status", ""].map((h, i) => (
                    <th
                      key={i}
                      className="px-4 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map(row => {
                  const typeName = row.leave_type?.name || "Extra Leave";
                  const isExtra = !row.leave_type;
                  const typeColor = isExtra ? "#6366f1" : ACCENT;
                  return (
                    <tr
                      key={row.id}
                      onClick={() => setDetailLeave(row)}
                      className="border-b border-gray-50 hover:bg-orange-50/30 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0"
                            style={{ background: typeColor }}
                          >
                            {isExtra ? <FiStar size={14} /> : leaveTypeIcon(typeName)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-gray-800 truncate">{typeName}</p>
                            {isExtra && (
                              <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded mt-0.5 inline-block">
                                EXTRA
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs text-gray-700 whitespace-nowrap">
                          {fmtDate(row.start_date)} → {fmtDate(row.end_date)}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full"
                          style={{ background: "#fff7ed", color: ACCENT }}
                        >
                          {row.number_of_days}d
                        </span>
                      </td>
                      <td className="px-4 py-3 max-w-[200px]">
                        <p className="text-xs text-gray-600 italic truncate">"{row.reason}"</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-[11px] text-gray-500 whitespace-nowrap">{fmtDate(row.created_at)}</p>
                      </td>
                      <td className="px-4 py-3"><StatusPill status={row.status} /></td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={e => { e.stopPropagation(); setDetailLeave(row); }}
                          className="w-7 h-7 rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50 flex items-center justify-center text-gray-400 hover:text-orange-500 transition"
                          title="View details"
                        >
                          <FiEye size={12} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {!loadingHist && filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between flex-wrap gap-3">
            <p className="text-[11px] text-gray-500">
              Showing {Math.min((page - 1) * rowsPerPage + 1, filtered.length)}–
              {Math.min(page * rowsPerPage, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <FiChevronLeft size={14} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .slice(Math.max(0, page - 3), page + 2)
                .map(n => (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className="w-8 h-8 rounded-lg text-xs font-semibold transition"
                    style={{
                      background: n === page ? ACCENT : "#fff",
                      color: n === page ? "#fff" : "#6b7280",
                      border: `1px solid ${n === page ? ACCENT : "#e5e7eb"}`,
                    }}
                  >
                    {n}
                  </button>
                ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <FiChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─── Modals ─── */}
      {showApply && (
        <ApplyLeaveModal
          onClose={() => setShowApply(false)}
          onSuccess={(title, msg) => { showToast(title, msg, false); refreshAll(); }}
          onError={(msg) => showToast("Submission Failed", msg, true)}
          balances={balances}
          shift={shift}
        />
      )}

      {detailLeave && (
        <LeaveDetailSheet
          leave={detailLeave}
          onClose={() => setDetailLeave(null)}
          onCancel={(lv) => openConfirm(lv.id, true)}
          cancelling={confirm.loading && confirm.inSheet}
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

      <Toast
        isOpen={toast.open}
        title={toast.title}
        message={toast.message}
        isError={toast.isError}
        onClose={() => setToast(t => ({ ...t, open: false }))}
      />
    </div>
  );
}