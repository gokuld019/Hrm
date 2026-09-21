"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  FiSearch, FiDownload, FiPlus, FiEdit2, FiTrash2, FiChevronLeft,
  FiChevronRight, FiFileText, FiTrendingUp, FiUsers, FiCheck,
  FiX, FiSend, FiSettings, FiLayers, FiShield, FiClock, FiInfo,
  FiAlertTriangle, FiRefreshCw, FiCheckCircle, FiXCircle, FiBriefcase,
  FiDollarSign, FiAward, FiUser, FiCalendar, FiEye, FiTarget,
  FiActivity, FiChevronDown, FiFilter, FiSave, FiSliders,
  FiPieChart, FiBarChart2, FiMoreVertical, FiStar, FiZap
} from "react-icons/fi";
import { HiOutlineOfficeBuilding } from "react-icons/hi";
import {
  MdOutlineBeachAccess, MdOutlineSick, MdOutlineWorkOff,
  MdOutlineCelebration, MdOutlineChildCare, MdOutlineEventBusy
} from "react-icons/md";
import { PiBriefcaseBold } from "react-icons/pi";

// ─── CONFIG ────────────────────────────────────────────────────────────────
const BASE = process.env.NEXT_PUBLIC_API_URL;


const ACCENT = "#f97316";
const DEPARTMENTS = ["All","Engineering","Design","Finance","HR","Marketing","Sales","Operations"];

// ─── AUTH ──────────────────────────────────────────────────────────────────
const getAuthHeaders = () => {
  const token = typeof window !== "undefined" ? localStorage.getItem("admin_auth_token") : null;
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    "ngrok-skip-browser-warning": "true",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// ─── HELPERS ───────────────────────────────────────────────────────────────
const fmt = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");
function fmtShort(n) {
  n = Number(n || 0);
  if (n >= 10000000) return "₹" + (n/10000000).toFixed(1) + "Cr";
  if (n >= 100000)   return "₹" + (n/100000).toFixed(1) + "L";
  if (n >= 1000)     return "₹" + (n/1000).toFixed(0) + "K";
  return "₹" + n;
}
const getInitials = (name = "") => name.split(" ").filter(Boolean).map(n => n[0]).join("").slice(0,2).toUpperCase() || "??";
const getFullName = (emp) => {
  if (!emp) return "Unknown";
  if (typeof emp === "string") return emp;
  return [emp.firstname, emp.lastname].filter(Boolean).join(" ") || emp.name || "Unknown";
};
const getRole = (emp) => emp?.designation?.name || emp?.designation || emp?.role || "Employee";

const COMP_COLORS = ["#16a34a","#3b82f6","#06b6d4","#8b5cf6","#f59e0b","#ec4899","#ef4444","#6366f1","#14b8a6","#f97316"];
const AV_COLORS   = ["#6366f1","#f97316","#14b8a6","#ec4899","#22c55e","#a855f7","#3b82f6","#eab308","#ef4444","#06b6d4"];

function avatarBg(name = "") {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffffffff;
  return AV_COLORS[Math.abs(h) % AV_COLORS.length];
}

const LEAVE_COLORS = ["#3b82f6","#8b5cf6","#ec4899","#f97316","#10b981","#f59e0b","#06b6d4","#ef4444"];

// ─── BASE UI ───────────────────────────────────────────────────────────────
function Avatar({ name = "?", size = 34 }) {
  return (
    <div className="flex items-center justify-center font-bold text-white shrink-0"
      style={{ width: size, height: size, borderRadius: "50%", background: avatarBg(name), fontSize: size * 0.33 }}>
      {getInitials(name)}
    </div>
  );
}

const STATUS_CFG = {
  Paid:    { bg:"#f0fdf4", color:"#16a34a", border:"#bbf7d0", dot:"#22c55e", Icon: FiCheckCircle },
  Pending: { bg:"#fffbeb", color:"#d97706", border:"#fde68a", dot:"#f59e0b", Icon: FiClock       },
  Unpaid:  { bg:"#fef2f2", color:"#dc2626", border:"#fecaca", dot:"#ef4444", Icon: FiXCircle     },
};
function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status] || STATUS_CFG.Pending;
  const Icon = cfg.Icon;
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap"
      style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color }}>
      <Icon size={11} />{status}
    </span>
  );
}

const GRADE_CFG = {
  basic:  { bg:"#f0fdf4", color:"#16a34a", border:"#bbf7d0" },
  medium: { bg:"#fffbeb", color:"#b45309", border:"#fde68a" },
  high:   { bg:"#eef2ff", color:"#4f46e5", border:"#c7d2fe" },
};
function GradeBadge({ grade }) {
  const g = (grade || "basic").toLowerCase();
  const cfg = GRADE_CFG[g] || GRADE_CFG.basic;
  return (
    <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold capitalize"
      style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color }}>
      {g}
    </span>
  );
}

const DEPT_COLORS = {
  Engineering:"#eef2ff|#4f46e5", Design:"#fdf2f8|#be185d", Finance:"#fff7ed|#c2410c",
  HR:"#f0fdf4|#15803d", Marketing:"#fef9c3|#a16207", Sales:"#f0fdfa|#0f766e",
  Operations:"#f8fafc|#475569"
};
function DeptBadge({ dept }) {
  if (!dept) return <span className="text-gray-400 text-[11px]">—</span>;
  const [bg, color] = (DEPT_COLORS[dept] || "#f3f4f6|#374151").split("|");
  return (
    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold" style={{ background: bg, color }}>
      {dept}
    </span>
  );
}

function Spinner({ size = 13, color = "#fff" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5}
      strokeLinecap="round" className="animate-spin shrink-0">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PAYSLIP MODAL
// ════════════════════════════════════════════════════════════════════════════
function PayslipModal({ employee, monthNum, year, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true); setError(null);
      try {
        const res = await fetch(`${BASE}/api/admin/payslip/${employee.id}/${monthNum}/${year}`, { headers: getAuthHeaders() });
        const j = await res.json();
        if (!res.ok || !j.success) throw new Error(j.message || j.error || "Failed to load payslip");
        setData(j);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [employee.id, monthNum, year]);

  const handleSend = async () => {
    setSending(true);
    await new Promise(r => setTimeout(r, 1200));
    setSending(false);
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-[900] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="bg-white rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between shrink-0">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Payslip</p>
            <h2 className="text-base font-bold text-gray-900">
              {getFullName(employee)} — {data?.month_name || `${monthNum}/${year}`}
            </h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500">
            <FiX size={15} />
          </button>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Spinner size={24} color={ACCENT} />
            <p className="text-xs text-gray-400 font-medium">Loading payslip…</p>
          </div>
        )}

        {!loading && error && (
          <div className="p-6">
            <div className="flex items-start gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
              <FiAlertTriangle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {!loading && data && (
          <div className="p-6 space-y-5">
            <div className="flex items-center gap-3 p-4 bg-orange-50 border border-orange-100 rounded-xl">
              <Avatar name={data.employee.name} size={44} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-gray-900">{data.employee.name}</p>
                <p className="text-[11px] text-gray-500">
                  {data.employee.employee_id} · {data.employee.designation || "—"} · {data.employee.department || "—"}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Hourly Rate</p>
                <p className="text-sm font-black text-gray-800">{fmt(data.hourly_rate)}</p>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Summary</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { l: "Working Days",    v: data.summary.working_days,    c: "#3b82f6" },
                  { l: "Present Days",    v: data.summary.present_days,    c: "#22c55e" },
                  { l: "Absent Days",     v: data.summary.absent_days,     c: "#ef4444" },
                  { l: "Paid Leaves",     v: data.summary.paid_leaves,     c: "#8b5cf6" },
                  { l: "Unpaid Leaves",   v: data.summary.unpaid_leaves,   c: "#f59e0b" },
                  { l: "Late Days",       v: data.summary.late_days,       c: "#f97316" },
                  { l: "Scheduled Hours", v: data.summary.scheduled_hours, c: "#6366f1" },
                  { l: "Worked Hours",    v: data.summary.worked_hours,    c: "#06b6d4" },
                  { l: "Shortfall Hours", v: data.summary.hour_shortfall,  c: "#dc2626" },
                ].map(({ l, v, c }) => (
                  <div key={l} className="bg-gray-50 border border-gray-100 rounded-lg p-2.5">
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">{l}</p>
                    <p className="text-base font-black" style={{ color: c }}>{v}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-500" /> Earnings
                </p>
                <div className="space-y-1">
                  {data.earnings.map((e, i) => (
                    <div key={i} className="flex justify-between py-1.5 border-b border-gray-50">
                      <span className="text-xs text-gray-600">{e.name}</span>
                      <span className="text-xs font-bold text-gray-800">{fmt(e.amount)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between pt-2.5 mt-1 border-t-2 border-green-100">
                  <span className="text-xs font-bold text-green-700">Total Earnings</span>
                  <span className="text-sm font-black text-green-700">{fmt(data.total_earnings)}</span>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500" /> Deductions
                </p>
                <div className="space-y-1">
                  {data.deductions.map((d, i) => (
                    <div key={i} className="flex justify-between py-1.5 border-b border-gray-50">
                      <span className="text-xs text-gray-600">{d.name}</span>
                      <span className="text-xs font-bold text-gray-800">{fmt(d.amount)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between pt-2.5 mt-1 border-t-2 border-red-100">
                  <span className="text-xs font-bold text-red-700">Total Deductions</span>
                  <span className="text-sm font-black text-red-700">{fmt(data.total_deductions)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-gray-900 text-white">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Net Take Home</p>
                <p className="text-2xl font-black">{fmt(data.net_pay)}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center">
                <FiDollarSign size={22} className="text-orange-400" />
              </div>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-bold text-gray-700">
                <FiDownload size={13} /> Download PDF
              </button>
              <button
                onClick={handleSend}
                disabled={sending || sent}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-white disabled:opacity-60"
                style={{ background: sent ? "#16a34a" : ACCENT }}
              >
                {sending ? <><Spinner size={12} />Sending…</> :
                 sent ? <><FiCheck size={13} />Sent!</> :
                        <><FiSend size={13} />Email Payslip</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// EDIT / ASSIGN SALARY MODAL
// ════════════════════════════════════════════════════════════════════════════
function EditSalaryModal({ employee, structures, onClose, onSaved }) {
  const [structureId, setStructureId] = useState(employee.salary_structure_id || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleSave = async () => {
    setSaving(true); setError(null);
    try {
      if (structureId) {
        const res = await fetch(`${BASE}/api/admin/employees/${employee.id}/assign-salary-structure`, {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({ salary_structure_id: Number(structureId) }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message || "Failed to assign structure");
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[900] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-orange-50">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Assign Salary Structure</h3>
            <p className="text-[11px] text-gray-500">{getFullName(employee)} · {employee.employee_id}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white hover:bg-gray-100 flex items-center justify-center text-gray-500 border border-gray-200">
            <FiX size={14} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">
              <FiAlertTriangle size={13} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">
              Salary Structure <span className="text-red-500">*</span>
            </label>
            <select
              value={structureId}
              onChange={e => setStructureId(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 bg-white cursor-pointer"
            >
              <option value="">— Select a structure —</option>
              {structures.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.grade} · {fmtShort(s.annual_ctc)}/yr)
                </option>
              ))}
            </select>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-start gap-2">
            <FiInfo size={13} className="text-blue-600 shrink-0 mt-0.5" />
            <p className="text-[11px] text-blue-700 leading-relaxed">
              Assigning a salary structure determines how this employee's payslip is calculated each month.
            </p>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !structureId}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white rounded-lg disabled:opacity-60"
            style={{ background: ACCENT }}
          >
            {saving ? <><Spinner size={12} />Saving…</> : <><FiSave size={13} />Save</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// STRUCTURE FORM MODAL
// ════════════════════════════════════════════════════════════════════════════
function StructureFormModal({ editItem, components, deductions, onClose, onSaved }) {
  const isEdit = !!editItem;
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    name: editItem?.name || "",
    grade: editItem?.grade || "basic",
    annual_ctc: editItem?.annual_ctc || 480000,
    monthly_ctc: editItem?.monthly_ctc || 40000,
    components: editItem?.components?.map(c => ({
      id: c.id, value: Number(c.pivot?.value || c.value || 0),
      calculation_type: c.pivot?.calculation_type || c.calculation_type || "fixed",
      sort_order: c.pivot?.sort_order || c.sort_order || 0,
    })) || [],
    deductions: editItem?.deductions?.map(d => ({
      id: d.id, value: Number(d.pivot?.value || d.value || 0),
      calculation_type: d.pivot?.calculation_type || d.calculation_type || "fixed",
      sort_order: d.pivot?.sort_order || d.sort_order || 0,
    })) || [],
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const toggleComp = (comp) => {
    const exists = form.components.find(c => c.id === comp.id);
    set("components", exists
      ? form.components.filter(c => c.id !== comp.id)
      : [...form.components, { id: comp.id, value: 0, calculation_type: comp.calculation_type, sort_order: form.components.length }]);
  };
  const toggleDed = (ded) => {
    const exists = form.deductions.find(d => d.id === ded.id);
    set("deductions", exists
      ? form.deductions.filter(d => d.id !== ded.id)
      : [...form.deductions, { id: ded.id, value: 0, calculation_type: ded.calculation_type, sort_order: form.deductions.length }]);
  };
  const updateComp = (id, key, val) => set("components", form.components.map(c => c.id === id ? { ...c, [key]: val } : c));
  const updateDed = (id, key, val) => set("deductions", form.deductions.map(d => d.id === id ? { ...d, [key]: val } : d));

  const totalEarnings = form.components.reduce((sum, c) => sum + Number(c.value || 0), 0);
  const totalDeductions = form.deductions.reduce((sum, d) => sum + Number(d.value || 0), 0);

  const handleSave = async () => {
    if (!form.name.trim()) { setError("Name is required"); return; }
    setSaving(true); setError(null);
    try {
      const payload = {
        name: form.name,
        grade: form.grade,
        annual_ctc: Number(form.annual_ctc),
        monthly_ctc: Number(form.monthly_ctc),
        components: form.components,
        deductions: form.deductions,
      };
      const url = isEdit ? `${BASE}/api/admin/salary-structures/${editItem.id}` : `${BASE}/api/admin/salary-structures`;
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Save failed");
      onSaved();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const STEPS = [{ n:1, label:"Basic" }, { n:2, label:"Earnings" }, { n:3, label:"Deductions" }];

  return (
    <div className="fixed inset-0 z-[900] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="bg-white rounded-2xl w-full max-w-2xl max-h-[94vh] flex flex-col overflow-hidden shadow-2xl">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-orange-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ background: ACCENT }}>
              <FiLayers size={17} />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">{isEdit ? "Edit" : "Create"} Salary Structure</h2>
              <p className="text-[11px] text-gray-500">Define earnings + deductions template</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white hover:bg-gray-100 flex items-center justify-center text-gray-500 border border-gray-200">
            <FiX size={15} />
          </button>
        </div>

        <div className="flex items-center px-6 py-3 border-b border-gray-100 bg-gray-50 shrink-0">
          {STEPS.map((s, i) => (
            <React.Fragment key={s.n}>
              <button
                onClick={() => setStep(s.n)}
                className="flex items-center gap-2 text-xs font-bold transition"
                style={{ color: step === s.n ? ACCENT : step > s.n ? "#16a34a" : "#9ca3af" }}
              >
                <span
                  className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                  style={{ background: step === s.n ? ACCENT : step > s.n ? "#16a34a" : "#e5e7eb" }}
                >
                  {step > s.n ? <FiCheck size={11} /> : s.n}
                </span>
                {s.label}
              </button>
              {i < STEPS.length - 1 && <div className="flex-1 h-px bg-gray-200 mx-3" />}
            </React.Fragment>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">
              <FiAlertTriangle size={13} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {step === 1 && (
            <>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">Structure Name <span className="text-red-500">*</span></label>
                <input
                  value={form.name}
                  onChange={e => set("name", e.target.value)}
                  placeholder="e.g. Junior Developer Package"
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-2">Grade</label>
                <div className="grid grid-cols-3 gap-2">
                  {["basic","medium","high"].map(g => {
                    const active = form.grade === g;
                    const cfg = GRADE_CFG[g];
                    return (
                      <button
                        key={g}
                        onClick={() => set("grade", g)}
                        className="py-3 rounded-xl border-2 text-sm font-bold capitalize transition-all"
                        style={{
                          borderColor: active ? cfg.color : cfg.border,
                          background: active ? cfg.bg : "#fafafa",
                          color: active ? cfg.color : "#6b7280",
                        }}
                      >
                        {g}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5">Annual CTC</label>
                  <input
                    type="number"
                    value={form.annual_ctc}
                    onChange={e => {
                      const v = Number(e.target.value);
                      setForm(p => ({ ...p, annual_ctc: v, monthly_ctc: Math.round(v / 12) }));
                    }}
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-orange-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5">Monthly CTC</label>
                  <input
                    type="number"
                    value={form.monthly_ctc}
                    readOnly
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-600"
                  />
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <p className="text-xs text-gray-500 bg-orange-50 border border-orange-100 rounded-lg p-3 flex items-center gap-2">
                <FiInfo size={13} className="text-orange-500 shrink-0" />
                Select earnings components and set their values.
              </p>

              {components.length === 0 ? (
                <div className="text-center py-8 bg-amber-50 border border-amber-200 rounded-xl">
                  <FiAlertTriangle size={22} className="text-amber-600 mx-auto mb-2" />
                  <p className="text-xs font-bold text-amber-800">No earning components available</p>
                  <p className="text-[11px] text-amber-700 mt-1">Add master earnings first from the Master Data tab</p>
                </div>
              ) : (
                components.map(comp => {
                  const selected = form.components.find(c => c.id === comp.id);
                  return (
                    <div key={comp.id} className={`p-3 rounded-xl border-2 transition ${selected ? "border-orange-300 bg-orange-50/40" : "border-gray-100 bg-white"}`}>
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={!!selected}
                          onChange={() => toggleComp(comp)}
                          className="w-4 h-4 accent-orange-500 cursor-pointer"
                        />
                        <div className="flex-1">
                          <p className="text-xs font-bold text-gray-800">{comp.name}</p>
                          <p className="text-[10px] text-gray-400 capitalize">{comp.calculation_type?.replace(/_/g, " ")}</p>
                        </div>
                        {selected && (
                          <div className="flex items-center gap-2 shrink-0">
                            <input
                              type="number"
                              value={selected.value}
                              onChange={e => updateComp(comp.id, "value", Number(e.target.value))}
                              placeholder="0"
                              className="w-24 px-2 py-1 text-xs border border-gray-200 rounded-lg outline-none focus:border-orange-400 text-right"
                            />
                            <select
                              value={selected.calculation_type || "fixed"}
                              onChange={e => updateComp(comp.id, "calculation_type", e.target.value)}
                              className="px-2 py-1 text-[10px] border border-gray-200 rounded-lg outline-none bg-white"
                            >
                              <option value="fixed">₹ Fixed</option>
                              <option value="percentage_of_basic">% of Basic</option>
                              <option value="percentage_of_gross">% of Gross</option>
                            </select>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}

              <div className="flex items-center justify-between p-3 bg-gray-900 rounded-xl text-white">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Monthly</span>
                <span className="text-lg font-black">{fmt(totalEarnings)}</span>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <p className="text-xs text-gray-500 bg-orange-50 border border-orange-100 rounded-lg p-3 flex items-center gap-2">
                <FiInfo size={13} className="text-orange-500 shrink-0" />
                Select deduction components and set their values.
              </p>

              {deductions.length === 0 ? (
                <div className="text-center py-8 bg-amber-50 border border-amber-200 rounded-xl">
                  <FiAlertTriangle size={22} className="text-amber-600 mx-auto mb-2" />
                  <p className="text-xs font-bold text-amber-800">No deduction components available</p>
                  <p className="text-[11px] text-amber-700 mt-1">Add master deductions first from the Master Data tab</p>
                </div>
              ) : (
                deductions.map(ded => {
                  const selected = form.deductions.find(d => d.id === ded.id);
                  return (
                    <div key={ded.id} className={`p-3 rounded-xl border-2 transition ${selected ? "border-red-300 bg-red-50/40" : "border-gray-100 bg-white"}`}>
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={!!selected}
                          onChange={() => toggleDed(ded)}
                          className="w-4 h-4 accent-red-500 cursor-pointer"
                        />
                        <div className="flex-1">
                          <p className="text-xs font-bold text-gray-800">{ded.name}</p>
                          <p className="text-[10px] text-gray-400 capitalize">{ded.calculation_type?.replace(/_/g, " ")}</p>
                        </div>
                        {selected && (
                          <div className="flex items-center gap-2 shrink-0">
                            <input
                              type="number"
                              value={selected.value}
                              onChange={e => updateDed(ded.id, "value", Number(e.target.value))}
                              placeholder="0"
                              className="w-24 px-2 py-1 text-xs border border-gray-200 rounded-lg outline-none focus:border-red-400 text-right"
                            />
                            <select
                              value={selected.calculation_type || "fixed"}
                              onChange={e => updateDed(ded.id, "calculation_type", e.target.value)}
                              className="px-2 py-1 text-[10px] border border-gray-200 rounded-lg outline-none bg-white"
                            >
                              <option value="fixed">₹ Fixed</option>
                              <option value="percentage_of_basic">% of Basic</option>
                              <option value="percentage_of_gross">% of Gross</option>
                            </select>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}

              <div className="flex items-center justify-between p-3 bg-red-600 rounded-xl text-white">
                <span className="text-xs font-bold uppercase tracking-wider">Total Deductions</span>
                <span className="text-lg font-black">− {fmt(totalDeductions)}</span>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-gray-900 text-white">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Net Take Home</span>
                <span className="text-2xl font-black">{fmt(totalEarnings - totalDeductions)}</span>
              </div>
            </>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between shrink-0">
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-100">
              Cancel
            </button>
            {step > 1 && (
              <button onClick={() => setStep(s => s - 1)} className="px-4 py-2 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-100">
                ← Back
              </button>
            )}
          </div>
          {step < 3 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={step === 1 && !form.name.trim()}
              className="px-5 py-2 text-sm font-bold text-white rounded-lg disabled:opacity-50"
              style={{ background: ACCENT }}
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white rounded-lg disabled:opacity-60"
              style={{ background: ACCENT }}
            >
              {saving ? <><Spinner size={12} />Saving…</> : <><FiSave size={13} />{isEdit ? "Update" : "Create"}</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// CONFIRM MODAL — reusable for all deletes
// ════════════════════════════════════════════════════════════════════════════
function ConfirmModal({ title, message, onConfirm, onClose, loading, confirmLabel = "Delete" }) {
  return (
    <div className="fixed inset-0 z-[950] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
        <div className="p-6 text-center">
          <div className="w-14 h-14 rounded-full bg-red-50 border-2 border-red-200 flex items-center justify-center mx-auto mb-4">
            <FiAlertTriangle size={22} className="text-red-600" />
          </div>
          <h3 className="text-base font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-sm text-gray-500 leading-relaxed">{message}</p>
        </div>
        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onClose} disabled={loading} className="flex-1 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-60">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? <><Spinner size={13} />Deleting…</> : <><FiTrash2 size={13} />{confirmLabel}</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// TOAST
// ════════════════════════════════════════════════════════════════════════════
function Toast({ isOpen, title, message, isError, onClose }) {
  useEffect(() => {
    if (!isOpen) return;
    const t = setTimeout(onClose, 3200);
    return () => clearTimeout(t);
  }, [isOpen, onClose]);
  if (!isOpen) return null;
  const bg = isError ? "#dc2626" : "#059669";
  const Icon = isError ? FiXCircle : FiCheckCircle;
  return (
    <div className="fixed top-6 right-6 z-[1000] max-w-sm" onClick={onClose}>
      <div className="rounded-2xl shadow-2xl flex items-stretch overflow-hidden" style={{ background: bg }}>
        <div className="flex items-center justify-center px-4">
          <Icon size={22} className="text-white" />
        </div>
        <div className="flex-1 py-3.5 pr-4">
          <p className="text-sm font-bold text-white">{title}</p>
          <p className="text-xs text-white/85 mt-0.5">{message}</p>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// STAT CARD
// ════════════════════════════════════════════════════════════════════════════
function StatCard({ Icon, iconBg, label, value, sub, subColor, trend }) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-3">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-white" style={{ background: iconBg }}>
        <Icon size={20} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{label}</p>
        <p className="text-xl font-black text-gray-900 leading-tight">{value}</p>
        {sub && <p className="text-[10.5px] font-semibold mt-0.5" style={{ color: subColor || "#9ca3af" }}>{sub}</p>}
      </div>
      {trend !== undefined && (
        <div className="shrink-0 flex items-center gap-0.5 text-[11px] font-bold px-2 py-0.5 rounded-full"
             style={{ color: trend > 0 ? "#16a34a" : "#dc2626", background: trend > 0 ? "#f0fdf4" : "#fef2f2" }}>
          {trend > 0 ? "↑" : "↓"}{Math.abs(trend)}%
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// MASTER FORM MODAL — Add/Edit for components & deductions
// ════════════════════════════════════════════════════════════════════════════
function MasterFormModal({ modal, type, saving, onSave, onClose }) {
  const [form, setForm] = useState({
    name: modal.item.name || "",
    calculation_type: modal.item.calculation_type || "fixed",
  });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const isComponent = type === "component";
  const color = isComponent ? "#10b981" : "#ef4444";
  const label = isComponent ? "Earning Component" : "Deduction Component";

  return (
    <div className="fixed inset-0 z-[900] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between"
             style={{ background: isComponent ? "#f0fdf4" : "#fef2f2" }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white" style={{ background: color }}>
              {isComponent ? <FiTrendingUp size={16} /> : <FiShield size={16} />}
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">
                {modal.mode === "edit" ? "Edit" : "Add"} {label}
              </h3>
              <p className="text-[11px] text-gray-500 mt-0.5">
                {modal.mode === "edit" ? `Updating #${modal.item.id}` : "Create a new master entry"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white hover:bg-gray-100 flex items-center justify-center text-gray-500 border border-gray-200">
            <FiX size={14} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              value={form.name}
              onChange={e => set("name", e.target.value)}
              placeholder={isComponent ? "e.g. Internet Allowance" : "e.g. ESI"}
              autoFocus
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">
              Calculation Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { v: "fixed", l: "Fixed ₹" },
                { v: "percentage_of_basic", l: "% of Basic" },
                { v: "percentage_of_gross", l: "% of Gross" },
              ].map(opt => (
                <button
                  key={opt.v}
                  onClick={() => set("calculation_type", opt.v)}
                  className="py-2.5 rounded-lg border-2 text-[11px] font-bold transition"
                  style={{
                    borderColor: form.calculation_type === opt.v ? color : "#e5e7eb",
                    background: form.calculation_type === opt.v ? (isComponent ? "#f0fdf4" : "#fef2f2") : "#fff",
                    color: form.calculation_type === opt.v ? color : "#6b7280",
                  }}
                >
                  {opt.l}
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-start gap-2">
            <FiInfo size={13} className="text-blue-600 shrink-0 mt-0.5" />
            <p className="text-[11px] text-blue-700 leading-relaxed">
              {isComponent
                ? "Earning components define what employees receive (Basic, HRA, Conveyance, etc.)"
                : "Deduction components define what's cut from gross pay (PF, PT, ESI, etc.)"}
            </p>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-2">
          <button onClick={onClose} disabled={saving} className="px-4 py-2 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-60">
            Cancel
          </button>
          <button
            onClick={() => onSave(form)}
            disabled={saving || !form.name.trim()}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white rounded-lg disabled:opacity-60"
            style={{ background: color }}
          >
            {saving ? <><Spinner size={12} />Saving…</> : <><FiSave size={13} />{modal.mode === "edit" ? "Update" : "Create"}</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// MASTER LIST CARD — Reusable for earnings & deductions with full CRUD
// ════════════════════════════════════════════════════════════════════════════
function MasterListCard({ title, Icon, color, items, loading, type, onChanged, showToast }) {
  const [modal, setModal] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const endpoint = type === "component" ? "payroll-components" : "payroll-deductions";
  const itemLabel = type === "component" ? "Earning Component" : "Deduction Component";

  const handleSave = async (payload) => {
    setSaving(true);
    try {
      const isEdit = modal.mode === "edit";
      const url = isEdit
        ? `${BASE}/api/admin/${endpoint}/${modal.item.id}`
        : `${BASE}/api/admin/${endpoint}`;
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        let msg = data.message || "Save failed";
        if (data.errors) msg = Object.values(data.errors).flat().join(" · ");
        throw new Error(msg);
      }
      showToast("Success", `${itemLabel} ${isEdit ? "updated" : "created"} successfully`, false);
      setModal(null);
      onChanged();
    } catch (err) {
      showToast("Error", err.message, true);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`${BASE}/api/admin/${endpoint}/${confirm.id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Cannot delete this item");
      showToast("Deleted", `${itemLabel} removed successfully`, false);
      setConfirm(null);
      onChanged();
    } catch (err) {
      showToast("Cannot Delete", err.message, true);
      setConfirm(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
          <Icon size={15} style={{ color }} />
          <span className="text-sm font-black text-gray-800">{title}</span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}>
            {items.length}
          </span>
          <button
            onClick={() => setModal({ mode: "add", item: { name: "", calculation_type: "fixed" } })}
            className="ml-auto flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold text-white"
            style={{ background: color }}
          >
            <FiPlus size={11} /> Add
          </button>
        </div>

        <div className="p-4 space-y-2">
          {loading ? (
            [...Array(3)].map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />)
          ) : items.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-3">
                <Icon size={20} className="text-gray-300" />
              </div>
              <p className="text-xs font-bold text-gray-500">No {title.toLowerCase()} yet</p>
              <p className="text-[11px] text-gray-400 mt-0.5">Click "Add" to create your first entry</p>
            </div>
          ) : (
            items.map(item => (
              <div key={item.id}
                   className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-gray-200 transition group">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0"
                     style={{ background: color }}>
                  <Icon size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-800 truncate">{item.name}</p>
                  <p className="text-[10px] text-gray-400 capitalize">
                    {item.calculation_type?.replace(/_/g, " ")}
                  </p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  item.is_active ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-500"
                }`}>
                  {item.is_active ? "Active" : "Inactive"}
                </span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button
                    onClick={() => setModal({ mode: "edit", item })}
                    title="Edit"
                    className="w-7 h-7 rounded-lg border border-gray-200 text-gray-500 hover:text-orange-500 hover:border-orange-300 hover:bg-orange-50 flex items-center justify-center transition"
                  >
                    <FiEdit2 size={11} />
                  </button>
                  <button
                    onClick={() => setConfirm(item)}
                    title="Delete"
                    className="w-7 h-7 rounded-lg border border-gray-200 text-gray-500 hover:text-red-500 hover:border-red-300 hover:bg-red-50 flex items-center justify-center transition"
                  >
                    <FiTrash2 size={11} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {modal && (
        <MasterFormModal
          modal={modal}
          type={type}
          saving={saving}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}

      {confirm && (
        <ConfirmModal
          title={`Delete ${itemLabel}?`}
          message={`"${confirm.name}" will be permanently removed. If this is used in any salary structure, you'll need to remove it from those first.`}
          confirmLabel="Delete"
          loading={deleting}
          onConfirm={handleDelete}
          onClose={() => setConfirm(null)}
        />
      )}
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ════════════════════════════════════════════════════════════════════════════
export default function EmployeeSalaryPage() {
  const [activeTab, setActiveTab] = useState("salary");

  const [employees, setEmployees] = useState([]);
  const [structures, setStructures] = useState([]);
  const [components, setComponents] = useState([]);
  const [deductions, setDeductions] = useState([]);

  const [loadingEmp, setLoadingEmp] = useState(true);
  const [loadingStruct, setLoadingStruct] = useState(true);
  const [loadingMasters, setLoadingMasters] = useState(true);

  const [search, setSearch] = useState("");
  const [dept, setDept] = useState("All");
  const [sortBy, setSortBy] = useState("name");
  const [sortDir, setSortDir] = useState("asc");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState(new Set());

  const now = new Date();
  const [monthNum, setMonthNum] = useState(now.getMonth() + 1);
  const [year] = useState(now.getFullYear());

  const [viewEmp, setViewEmp] = useState(null);
  const [editEmp, setEditEmp] = useState(null);

  const [showStructureForm, setShowStructureForm] = useState(false);
  const [editStructure, setEditStructure] = useState(null);
  const [structureToDelete, setStructureToDelete] = useState(null);
  const [deletingStruct, setDeletingStruct] = useState(false);

  const [toast, setToast] = useState({ open: false, title: "", message: "", isError: false });
  const showToast = (title, message, isError = false) => setToast({ open: true, title, message, isError });

  // ─── Fetchers ──────────────────────────────────────────────────────
  const fetchEmployees = useCallback(async () => {
    setLoadingEmp(true);
    try {
      const res = await fetch(`${BASE}/api/admin/employees`, { headers: getAuthHeaders() });
      const data = await res.json();
      const list = Array.isArray(data) ? data : (data?.data || []);
      setEmployees(list);
    } catch (err) { console.error(err); }
    finally { setLoadingEmp(false); }
  }, []);

  const fetchStructures = useCallback(async () => {
    setLoadingStruct(true);
    try {
      const res = await fetch(`${BASE}/api/admin/salary-structures`, { headers: getAuthHeaders() });
      const data = await res.json();
      const list = data?.data?.data || data?.data || (Array.isArray(data) ? data : []);
      setStructures(Array.isArray(list) ? list : []);
    } catch (err) { console.error(err); }
    finally { setLoadingStruct(false); }
  }, []);

  const fetchMasters = useCallback(async () => {
    setLoadingMasters(true);
    try {
      const [cRes, dRes] = await Promise.all([
        fetch(`${BASE}/api/admin/payroll-components`, { headers: getAuthHeaders() }),
        fetch(`${BASE}/api/admin/payroll-deductions`, { headers: getAuthHeaders() }),
      ]);
      const cData = await cRes.json();
      const dData = await dRes.json();
      setComponents(Array.isArray(cData) ? cData : (cData?.data || []));
      setDeductions(Array.isArray(dData) ? dData : (dData?.data || []));
    } catch (err) { console.error(err); }
    finally { setLoadingMasters(false); }
  }, []);

  useEffect(() => {
    fetchEmployees();
    fetchStructures();
    fetchMasters();
  }, [fetchEmployees, fetchStructures, fetchMasters]);

  const stats = useMemo(() => {
    const totalGross = employees.reduce((s, e) => s + (Number(e.salary_structure?.monthly_ctc) || 0), 0);
    return {
      totalEmployees: employees.length,
      totalGross,
      structuresCount: structures.length,
      componentsCount: components.length,
    };
  }, [employees, structures, components]);

  const filtered = useMemo(() => {
    let list = employees.filter(e => {
      const q = search.toLowerCase();
      const name = getFullName(e).toLowerCase();
      const matchQ = !q || name.includes(q) || (e.employee_id || "").toLowerCase().includes(q) || getRole(e).toLowerCase().includes(q);
      const matchDept = dept === "All" || e.department?.name === dept;
      return matchQ && matchDept;
    });
    return list.sort((a, b) => {
      const av = String(a[sortBy] || "").toLowerCase();
      const bv = String(b[sortBy] || "").toLowerCase();
      return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    });
  }, [employees, search, dept, sortBy, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const paginated = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  useEffect(() => { setPage(1); }, [search, dept, rowsPerPage]);

  const toggleSort = (col) => {
    if (sortBy === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortBy(col); setSortDir("asc"); }
  };
  const toggleRow = (id) => setSelectedIds(prev => {
    const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n;
  });
  const toggleAll = () => {
    if (selectedIds.size === paginated.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(paginated.map(e => e.id)));
  };

  // ─── Delete structure (custom confirm) ─────────────────────────────
  const confirmDeleteStructure = async () => {
    if (!structureToDelete) return;
    setDeletingStruct(true);
    try {
      const res = await fetch(`${BASE}/api/admin/salary-structures/${structureToDelete.id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Delete failed");
      showToast("Deleted", "Structure deleted successfully", false);
      setStructureToDelete(null);
      fetchStructures();
    } catch (err) {
      showToast("Delete Failed", err.message, true);
      setStructureToDelete(null);
    } finally {
      setDeletingStruct(false);
    }
  };

  // ─── Gate: Can we create a structure? ─────────────────────────────
  const canCreateStructure = components.length > 0 && deductions.length > 0;
  const structureGateMessage = (() => {
    if (components.length === 0 && deductions.length === 0) return "Add at least one earning component and one deduction component in Master Data before creating a structure.";
    if (components.length === 0) return "Add at least one earning component in Master Data before creating a structure.";
    if (deductions.length === 0) return "Add at least one deduction component in Master Data before creating a structure.";
    return "";
  })();

  const handleOpenNewStructure = () => {
    if (!canCreateStructure) {
      showToast("Cannot Create Structure", structureGateMessage, true);
      setActiveTab("masters");
      return;
    }
    setEditStructure(null);
    setShowStructureForm(true);
  };

  const TABS = [
    { key: "salary",     label: "Employee Salary",   Icon: FiUsers    },
    { key: "structures", label: "Salary Structures", Icon: FiLayers   },
    { key: "masters",    label: "Master Data",       Icon: FiSettings },
  ];

  return (
    <div className="space-y-5">
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-black text-gray-900">Employee Salary</h1>
          <p className="text-xs text-gray-500 mt-0.5">Manage payroll, structures & compliance</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { fetchEmployees(); fetchStructures(); fetchMasters(); }}
            className="flex items-center gap-2 px-3.5 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50"
          >
            <FiRefreshCw size={13} /> Refresh
          </button>
          {activeTab === "structures" && (
            <button
              onClick={handleOpenNewStructure}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-white disabled:opacity-60"
              style={{ background: canCreateStructure ? ACCENT : "#9ca3af" }}
            >
              <FiPlus size={13} /> New Structure
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white border border-gray-100 p-1 rounded-2xl w-fit shadow-sm">
        {TABS.map(t => {
          const active = activeTab === t.key;
          const Icon = t.Icon;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition"
              style={{ background: active ? ACCENT : "transparent", color: active ? "#fff" : "#6b7280" }}
            >
              <Icon size={13} /> {t.label}
            </button>
          );
        })}
      </div>

      {/* ══════════════════════════════════════════════════════
          TAB 1: EMPLOYEE SALARY
         ══════════════════════════════════════════════════════ */}
      {activeTab === "salary" && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard Icon={FiUsers}     iconBg="#1e293b" label="Total Employees"   value={stats.totalEmployees}   sub="On payroll" trend={5} />
            <StatCard Icon={FiDollarSign} iconBg="#16a34a" label="Monthly CTC"      value={fmtShort(stats.totalGross)} sub="Combined" subColor="#16a34a" trend={7} />
            <StatCard Icon={FiLayers}    iconBg="#6366f1" label="Structures"        value={stats.structuresCount}  sub="Active templates" />
            <StatCard Icon={FiCheckCircle} iconBg="#f97316" label="Components"     value={stats.componentsCount}  sub="Earnings master" />
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <FiUsers size={15} className="text-orange-500" />
                <span className="text-sm font-black text-gray-800">Employee Salary List</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 border border-orange-100">
                  {filtered.length}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={monthNum}
                  onChange={e => setMonthNum(Number(e.target.value))}
                  className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 outline-none bg-white cursor-pointer focus:border-orange-400"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                    <option key={m} value={m}>
                      {new Date(2026, m - 1, 1).toLocaleString("en-US", { month: "long" })} {year}
                    </option>
                  ))}
                </select>
                <select
                  value={dept}
                  onChange={e => setDept(e.target.value)}
                  className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 outline-none bg-white cursor-pointer focus:border-orange-400"
                >
                  {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                </select>
                <div className="relative">
                  <FiSearch size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search…"
                    className="pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg outline-none focus:border-orange-400 w-48"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              {loadingEmp ? (
                <div className="p-6 space-y-2">
                  {[...Array(6)].map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />)}
                </div>
              ) : paginated.length === 0 ? (
                <div className="text-center py-16">
                  <FiUsers size={32} className="text-gray-300 mx-auto mb-2" />
                  <p className="text-sm font-bold text-gray-500">No employees found</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="px-4 py-3 w-10">
                        <input type="checkbox"
                          checked={paginated.length > 0 && selectedIds.size === paginated.length}
                          onChange={toggleAll}
                          className="w-3.5 h-3.5 accent-orange-500 cursor-pointer" />
                      </th>
                      {[
                        { l: "Employee ID", c: "employee_id" },
                        { l: "Employee",    c: "firstname"   },
                        { l: "Department",  c: null          },
                        { l: "Role",        c: null          },
                        { l: "Structure",   c: null          },
                        { l: "Status",      c: null          },
                        { l: "",            c: null          },
                      ].map(({ l, c }, i) => (
                        <th key={i}
                            onClick={c ? () => toggleSort(c) : undefined}
                            className={`px-4 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap ${c ? "cursor-pointer select-none hover:text-gray-700" : ""}`}>
                          {l}
                          {c && sortBy === c && (
                            <FiChevronDown size={9} className="inline ml-1"
                              style={{ transform: sortDir === "desc" ? "rotate(180deg)" : "none" }} />
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map(emp => {
                      const name = getFullName(emp);
                      const struct = emp.salary_structure;
                      return (
                        <tr key={emp.id} className="border-b border-gray-50 hover:bg-orange-50/30 transition">
                          <td className="px-4 py-3">
                            <input type="checkbox"
                              checked={selectedIds.has(emp.id)}
                              onChange={() => toggleRow(emp.id)}
                              className="w-3.5 h-3.5 accent-orange-500 cursor-pointer" />
                          </td>
                          <td className="px-4 py-3 text-xs font-mono font-bold text-gray-500">
                            {emp.employee_id || `EMP-${emp.id}`}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <Avatar name={name} size={32} />
                              <div>
                                <p className="text-xs font-bold text-gray-800 truncate">{name}</p>
                                <p className="text-[10px] text-gray-400 truncate">{emp.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3"><DeptBadge dept={emp.department?.name} /></td>
                          <td className="px-4 py-3 text-xs text-gray-600">{emp.designation?.name || "—"}</td>
                          <td className="px-4 py-3">
                            {struct ? (
                              <div className="flex items-center gap-1.5">
                                <FiLayers size={11} className="text-orange-500" />
                                <span className="text-xs font-semibold text-gray-700 truncate max-w-[140px]">{struct.name}</span>
                              </div>
                            ) : (
                              <span className="text-[11px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100 font-bold">
                                Not assigned
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge status={emp.status === "active" ? "Paid" : "Unpaid"} />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => setViewEmp(emp)}
                                title="View Payslip"
                                className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-orange-500 hover:border-orange-300 hover:bg-orange-50 transition">
                                <FiEye size={12} />
                              </button>
                              <button
                                onClick={() => setEditEmp(emp)}
                                title="Assign Structure"
                                className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition">
                                <FiEdit2 size={12} />
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

            <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
              <p className="text-[11px] text-gray-500 font-medium">
                Showing <strong className="text-gray-800">{filtered.length === 0 ? 0 : Math.min((page - 1) * rowsPerPage + 1, filtered.length)}</strong>–
                <strong className="text-gray-800">{Math.min(page * rowsPerPage, filtered.length)}</strong> of
                <strong className="text-gray-800"> {filtered.length}</strong>
              </p>
              <div className="flex items-center gap-1">
                <select value={rowsPerPage} onChange={e => setRowsPerPage(Number(e.target.value))}
                  className="text-[11px] border border-gray-200 rounded-md px-2 py-1 outline-none bg-white cursor-pointer">
                  {[10, 25, 50].map(n => <option key={n} value={n}>{n} / page</option>)}
                </select>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="w-7 h-7 rounded-md border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-40">
                  <FiChevronLeft size={13} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .slice(Math.max(0, page - 3), page + 2)
                  .map(n => (
                    <button key={n} onClick={() => setPage(n)}
                      className="w-7 h-7 rounded-md text-[11px] font-bold transition"
                      style={{
                        background: n === page ? ACCENT : "#fff",
                        color: n === page ? "#fff" : "#6b7280",
                        border: `1px solid ${n === page ? ACCENT : "#e5e7eb"}`,
                      }}>
                      {n}
                    </button>
                  ))}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="w-7 h-7 rounded-md border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-40">
                  <FiChevronRight size={13} />
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ══════════════════════════════════════════════════════
          TAB 2: SALARY STRUCTURES
         ══════════════════════════════════════════════════════ */}
      {activeTab === "structures" && (
        <>
          {!canCreateStructure && (
            <div className="flex items-start gap-3 p-4 bg-amber-50 border-2 border-amber-200 rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                <FiAlertTriangle size={18} className="text-amber-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-black text-amber-900">Before creating a structure…</p>
                <p className="text-xs text-amber-700 mt-1 leading-relaxed">{structureGateMessage}</p>
                <button onClick={() => setActiveTab("masters")}
                  className="mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold text-white bg-amber-600 hover:bg-amber-700">
                  <FiSettings size={11} /> Go to Master Data
                </button>
              </div>
            </div>
          )}

          <div className="flex items-start gap-3 p-4 bg-orange-50 border border-orange-100 rounded-2xl">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0" style={{ background: ACCENT }}>
              <FiLayers size={18} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-black text-orange-900">Salary Structure Templates</p>
              <p className="text-xs text-orange-700 mt-0.5">
                Reusable packages you can assign to employees. Uses live payroll components + deductions.
              </p>
            </div>
          </div>

          {loadingStruct ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-48 bg-white rounded-2xl border border-gray-100 animate-pulse" />
              ))}
            </div>
          ) : structures.length === 0 ? (
            <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-3">
                <FiLayers size={26} className="text-gray-300" />
              </div>
              <p className="text-sm font-bold text-gray-600">No salary structures yet</p>
              <p className="text-xs text-gray-400 mt-1">Click "New Structure" to create your first template</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {structures.map(s => {
                const cfg = GRADE_CFG[(s.grade || "basic").toLowerCase()] || GRADE_CFG.basic;
                return (
                  <div key={s.id} className="bg-white rounded-2xl border overflow-hidden shadow-sm hover:shadow-lg transition-all"
                       style={{ borderColor: cfg.border }}>
                    <div className="p-4" style={{ background: cfg.bg, borderBottom: `1px solid ${cfg.border}` }}>
                      <div className="flex items-start justify-between">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-black text-gray-900 truncate">{s.name}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <GradeBadge grade={s.grade} />
                            <span className="text-[10px] text-gray-500 font-semibold">
                              {s.components?.length || 0} earnings · {s.deductions?.length || 0} deductions
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <button
                            onClick={() => { setEditStructure(s); setShowStructureForm(true); }}
                            className="w-6 h-6 rounded-md bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-orange-500 hover:border-orange-300">
                            <FiEdit2 size={11} />
                          </button>
                          <button
                            onClick={() => setStructureToDelete(s)}
                            className="w-6 h-6 rounded-md bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-red-500 hover:border-red-300">
                            <FiTrash2 size={11} />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <div>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Annual CTC</p>
                          <p className="text-lg font-black text-gray-900">{fmtShort(s.annual_ctc)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Monthly</p>
                          <p className="text-sm font-black" style={{ color: cfg.color }}>{fmt(s.monthly_ctc)}</p>
                        </div>
                      </div>

                      {s.components?.length > 0 && (
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Earnings</p>
                          <div className="space-y-1">
                            {s.components.slice(0, 3).map(c => (
                              <div key={c.id} className="flex items-center justify-between text-[11px]">
                                <span className="text-gray-600 truncate">{c.name}</span>
                                <span className="font-bold text-gray-800 shrink-0 ml-2">
                                  {c.pivot?.calculation_type === "fixed" ? fmt(c.pivot.value)
                                    : c.pivot?.calculation_type === "percentage_of_basic" ? `${c.pivot.value}% of Basic`
                                    : c.pivot?.calculation_type === "percentage_of_gross" ? `${c.pivot.value}% of Gross`
                                    : fmt(c.pivot?.value || 0)}
                                </span>
                              </div>
                            ))}
                            {s.components.length > 3 && <p className="text-[10px] text-gray-400">+{s.components.length - 3} more</p>}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ══════════════════════════════════════════════════════
          TAB 3: MASTER DATA — FULL CRUD
         ══════════════════════════════════════════════════════ */}
      {activeTab === "masters" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <MasterListCard
            title="Earning Components"
            Icon={FiTrendingUp}
            color="#10b981"
            items={components}
            loading={loadingMasters}
            type="component"
            onChanged={fetchMasters}
            showToast={showToast}
          />
          <MasterListCard
            title="Deduction Components"
            Icon={FiShield}
            color="#ef4444"
            items={deductions}
            loading={loadingMasters}
            type="deduction"
            onChanged={fetchMasters}
            showToast={showToast}
          />
        </div>
      )}

      {/* ── Modals ─────────────────────────────────────────── */}
      {viewEmp && (
        <PayslipModal employee={viewEmp} monthNum={monthNum} year={year} onClose={() => setViewEmp(null)} />
      )}

      {editEmp && (
        <EditSalaryModal
          employee={editEmp}
          structures={structures}
          onClose={() => setEditEmp(null)}
          onSaved={() => {
            fetchEmployees();
            showToast("Assigned", "Salary structure assigned successfully", false);
          }}
        />
      )}

      {showStructureForm && (
        <StructureFormModal
          editItem={editStructure}
          components={components}
          deductions={deductions}
          onClose={() => { setShowStructureForm(false); setEditStructure(null); }}
          onSaved={() => {
            fetchStructures();
            showToast(editStructure ? "Updated" : "Created", "Salary structure saved successfully", false);
          }}
        />
      )}

      {structureToDelete && (
        <ConfirmModal
          title="Delete Salary Structure?"
          message={`"${structureToDelete.name}" will be permanently deleted. Employees currently assigned to this structure will lose their salary setup.`}
          confirmLabel="Delete Structure"
          loading={deletingStruct}
          onConfirm={confirmDeleteStructure}
          onClose={() => !deletingStruct && setStructureToDelete(null)}
        />
      )}

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