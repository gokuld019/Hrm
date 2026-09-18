"use client";
import { useState, useEffect, useCallback } from "react";
import {
  X, Plus, Trash2, ChevronDown, AlertTriangle, Loader2,
  CheckCircle2, Users, Calendar, Search, Check, FileText,
  UserCheck, RefreshCw, Shield, Edit2, Eye, XCircle, Info,
  ChevronLeft, ChevronRight, Clock, ThumbsUp, ThumbsDown, Bell,
  Briefcase, Star, Filter, RotateCcw, MessageSquare, Layers,
  Building2, Zap, ClipboardList, Sparkles, Palmtree, Stethoscope,
  Coffee, Baby, Heart, Frown, Landmark,
} from "lucide-react";

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const BASE = process.env.NEXT_PUBLIC_API_URL || "https://api.pencilkraft.in";

const MONTH_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const LEAVE_TYPE_PRESETS = [
  { name:"Annual Leave",      Icon:Palmtree,     color:"#f97316", bg:"#fff7ed" },
  { name:"Sick Leave",        Icon:Stethoscope,  color:"#ef4444", bg:"#fef2f2" },
  { name:"Casual Leave",      Icon:Coffee,       color:"#3b82f6", bg:"#eff6ff" },
  { name:"Maternity Leave",   Icon:Heart,        color:"#ec4899", bg:"#fdf2f8" },
  { name:"Paternity Leave",   Icon:Baby,         color:"#8b5cf6", bg:"#f5f3ff" },
  { name:"Marriage Leave",    Icon:Heart,        color:"#14b8a6", bg:"#f0fdfa" },
  { name:"Bereavement Leave", Icon:Frown,        color:"#64748b", bg:"#f8fafc" },
  { name:"Public Holiday",    Icon:Landmark,     color:"#22c55e", bg:"#f0fdf4" },
  { name:"Extra Leave",       Icon:Star,         color:"#6366f1", bg:"#eef2ff" },
];

const getPreset = (name) => LEAVE_TYPE_PRESETS.find(p => p.name === name) || LEAVE_TYPE_PRESETS[0];

const AVATAR_COLORS = ["#6366f1","#f97316","#14b8a6","#ec4899","#22c55e","#a855f7","#3b82f6","#eab308"];
const CARDS_PER_PAGE = 6;

// ─── AUTH HELPER ─────────────────────────────────────────────────────────────
const getAuthHeaders = () => {
  const token = typeof window !== "undefined" ? localStorage.getItem("admin_auth_token") : null;
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    "ngrok-skip-browser-warning": "true",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// ─── EMPLOYEE HELPERS ─────────────────────────────────────────────────────────
const getInitials = (name = "") => name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "??";
const getFullName = (emp) => {
  if (!emp) return "Unknown";
  if (typeof emp === "string") return emp;
  return [emp.firstname, emp.lastname].filter(Boolean).join(" ") || emp.name || "Unknown";
};
const getRole = (emp) => emp?.designation?.name || emp?.designation || emp?.role || "Employee";

// ─── STYLE HELPERS ────────────────────────────────────────────────────────────
const inputBase  = "w-full text-sm border rounded-lg px-3 py-2 outline-none focus:ring-2 transition text-gray-800 bg-white placeholder:text-gray-400";
const neutral    = "border-gray-200 focus:border-orange-400 focus:ring-orange-100";
const selectBase = "w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 appearance-none bg-white transition text-gray-700 disabled:opacity-60";

// ─── FORMAT DATE ──────────────────────────────────────────────────────────────
function fmtDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}
function fmtDateTime(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) + " · " + d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

// ════════════════════════════════════════════════════════════════════
// ── PAGINATION
// ════════════════════════════════════════════════════════════════════
function Pagination({ total, page, perPage, onChange }) {
  const totalPages = Math.ceil(total / perPage);
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  return (
    <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100">
      <p className="text-[11px] text-gray-400 font-medium">
        Showing{" "}
        <span className="text-gray-700 font-bold">{Math.min((page-1)*perPage+1,total)}–{Math.min(page*perPage,total)}</span>
        {" "}of <span className="text-gray-700 font-bold">{total}</span>
      </p>
      <div className="flex items-center gap-1">
        <button onClick={() => onChange(page-1)} disabled={page===1}
          className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-orange-50 hover:border-orange-300 hover:text-orange-500 disabled:opacity-30 disabled:cursor-not-allowed transition">
          <ChevronLeft size={13}/>
        </button>
        {pages.slice(Math.max(0, page-3), page+2).map(p => (
          <button key={p} onClick={() => onChange(p)}
            className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold transition ${p===page ? "bg-orange-500 text-white border border-orange-500 shadow-sm" : "border border-gray-200 text-gray-500 hover:bg-orange-50 hover:border-orange-300 hover:text-orange-500"}`}>
            {p}
          </button>
        ))}
        <button onClick={() => onChange(page+1)} disabled={page===totalPages}
          className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-orange-50 hover:border-orange-300 hover:text-orange-500 disabled:opacity-30 disabled:cursor-not-allowed transition">
          <ChevronRight size={13}/>
        </button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// ── NOTIFICATION MODAL
// ════════════════════════════════════════════════════════════════════
function NotificationModal({ type, title, message, onClose }) {
  const config = {
    success: { bg:"bg-green-50",  border:"border-green-200",  icon:<CheckCircle2 size={26} className="text-green-500"/>,  titleColor:"text-green-800",  msgColor:"text-green-600",  btnBg:"bg-green-500 hover:bg-green-600" },
    error:   { bg:"bg-red-50",    border:"border-red-200",    icon:<XCircle      size={26} className="text-red-500"/>,    titleColor:"text-red-800",    msgColor:"text-red-600",    btnBg:"bg-red-500 hover:bg-red-600" },
    warning: { bg:"bg-amber-50",  border:"border-amber-200",  icon:<AlertTriangle size={26} className="text-amber-500"/>, titleColor:"text-amber-800",  msgColor:"text-amber-600",  btnBg:"bg-amber-500 hover:bg-amber-600" },
    info:    { bg:"bg-blue-50",   border:"border-blue-200",   icon:<Info          size={26} className="text-blue-500"/>,  titleColor:"text-blue-800",   msgColor:"text-blue-600",   btnBg:"bg-blue-500 hover:bg-blue-600" },
  };
  const c = config[type] || config.info;
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}/>
      <div className={`relative w-full max-w-xs mx-4 rounded-2xl border-2 ${c.bg} ${c.border} p-8 shadow-2xl z-10 flex flex-col items-center text-center animate-[modalPop_0.3s_cubic-bezier(.34,1.56,.64,1)]`}>
        <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-md mb-4">{c.icon}</div>
        <h3 className={`text-base font-black mb-1 ${c.titleColor}`}>{title}</h3>
        <p className={`text-sm ${c.msgColor} mb-6 leading-relaxed`}>{message}</p>
        <button onClick={onClose} className={`px-8 py-2.5 text-sm font-bold text-white rounded-xl transition ${c.btnBg}`}>OK</button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// ── CONFIRM MODAL
// ════════════════════════════════════════════════════════════════════
function ConfirmModal({ title, message, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel}/>
      <div className="relative w-full max-w-sm mx-4 rounded-2xl bg-white border border-gray-200 p-6 shadow-2xl z-10">
        <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4"><Trash2 size={20} className="text-red-500"/></div>
        <h3 className="text-base font-black text-gray-900 text-center mb-1">{title}</h3>
        <p className="text-sm text-gray-500 text-center mb-5 leading-relaxed">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 px-4 py-2.5 text-sm font-bold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition">Cancel</button>
          <button onClick={onConfirm} disabled={loading} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-black text-white bg-red-500 hover:bg-red-600 rounded-xl transition disabled:opacity-60">
            {loading ? <><Loader2 size={13} className="animate-spin"/>Deleting…</> : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// ── REJECT REMARKS MODAL
// ════════════════════════════════════════════════════════════════════
function RejectModal({ request, onConfirm, onCancel, loading }) {
  const [remarks, setRemarks] = useState("");
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel}/>
      <div className="relative w-full max-w-sm mx-4 rounded-2xl bg-white border border-gray-200 shadow-2xl z-10 overflow-hidden animate-[modalPop_0.28s_cubic-bezier(.34,1.3,.64,1)]">
        <div className="bg-gradient-to-r from-red-500 to-rose-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <XCircle size={16} className="text-white"/>
            </div>
            <div>
              <p className="text-sm font-black text-white">Reject Leave Request</p>
              <p className="text-[10px] text-red-100">{request?.employee_name} · {request?.leave_type_name}</p>
            </div>
          </div>
          <button onClick={onCancel} className="w-7 h-7 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition">
            <X size={13} className="text-white"/>
          </button>
        </div>
        <div className="p-5">
          <label className="block text-xs font-bold text-gray-600 mb-2">
            Remarks <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            value={remarks}
            onChange={e => setRemarks(e.target.value)}
            placeholder="Reason for rejection, e.g. Not enough quota…"
            rows={3}
            className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 resize-none transition text-gray-800 placeholder:text-gray-400"
          />
          <div className="flex gap-3 mt-4">
            <button onClick={onCancel} className="flex-1 px-4 py-2.5 text-sm font-bold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition">
              Cancel
            </button>
            <button onClick={() => onConfirm(remarks)} disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-black text-white bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 rounded-xl transition disabled:opacity-60 shadow-sm shadow-red-200">
              {loading ? <><Loader2 size={13} className="animate-spin"/>Rejecting…</> : <><ThumbsDown size={13}/>Reject Leave</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// ── MODAL SHELL
// ════════════════════════════════════════════════════════════════════
function ModalShell({ title, onClose, children, footer, tabs, activeTab, onTabChange }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}/>
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 z-10 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h2 className="text-base font-black text-gray-900">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition"><X size={15}/></button>
        </div>
        {tabs && (
          <div className="flex items-center px-6 pt-3 shrink-0 border-b border-gray-100 overflow-x-auto">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold border-b-2 transition-all -mb-px whitespace-nowrap ${activeTab===tab.id ? "border-orange-500 text-orange-500" : "border-transparent text-gray-400 hover:text-gray-600"}`}>
                <tab.icon size={12}/>{tab.label}
              </button>
            ))}
          </div>
        )}
        <div className="overflow-y-auto px-6 py-5 space-y-5 flex-1">{children}</div>
        {footer && <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/60 rounded-b-2xl shrink-0">{footer}</div>}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// ── useDeptDesig hook
// ════════════════════════════════════════════════════════════════════
function useDeptDesig() {
  const [departments, setDepts]     = useState([]);
  const [designations, setDesigs]   = useState([]);
  const [loadingDept, setLoadDept]  = useState(true);
  const [loadingDesig, setLoadDesig]= useState(true);
  const [deptError, setDeptErr]     = useState(null);
  useEffect(() => {
    fetch(`${BASE}/api/admin/departments`, { headers: getAuthHeaders() }).then(r => { if(!r.ok) throw new Error(); return r.json(); }).then(d => setDepts(d?.data||[])).catch(e => setDeptErr(e.message)).finally(() => setLoadDept(false));
    fetch(`${BASE}/api/admin/designations`, { headers: getAuthHeaders() }).then(r => { if(!r.ok) throw new Error(); return r.json(); }).then(d => setDesigs(d?.data||[])).catch(() => {}).finally(() => setLoadDesig(false));
  }, []);
  return { departments, designations, loadingDept, loadingDesig, deptError };
}

// ════════════════════════════════════════════════════════════════════
// ── LEAVE TYPE ROW
// ════════════════════════════════════════════════════════════════════
function LeaveTypeRow({ row, index, onChange, onRemove }) {
  const preset = getPreset(row.name);
  const PIcon = preset.Icon;
  return (
    <div className="grid grid-cols-[1fr_90px_90px_90px_32px] gap-2 items-center p-3 rounded-xl border border-gray-100 bg-gray-50/50 hover:border-orange-200 transition-all">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{backgroundColor:preset.bg}}>
          <PIcon size={13} style={{color:preset.color}}/>
        </div>
        <input value={row.name} onChange={e => onChange(index,"name",e.target.value)} placeholder="Leave type" className={`${inputBase} ${neutral} text-xs py-1.5`}/>
      </div>
      <input type="number" min="0" max="365" value={row.days_per_year} onChange={e => onChange(index,"days_per_year",e.target.value)} className={`${inputBase} ${neutral} text-xs py-1.5 text-center`}/>
      <input type="number" min="0" max="365" value={row.carry_forward} onChange={e => onChange(index,"carry_forward",e.target.value)} className={`${inputBase} ${neutral} text-xs py-1.5 text-center`}/>
      <div className="relative">
        <select value={row.encashable} onChange={e => onChange(index,"encashable",e.target.value)} className={`${selectBase} text-xs py-1.5`}>
          <option value="no">No</option><option value="yes">Yes</option>
        </select>
        <ChevronDown size={11} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"/>
      </div>
      <button onClick={() => onRemove(index)} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition"><Trash2 size={12}/></button>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// ── CREATE / EDIT POLICY MODAL
// ════════════════════════════════════════════════════════════════════
function CreateLeavePolicyModal({ onClose, onSuccess, editPolicy }) {
  const isEdit = !!editPolicy;
  const currentYear = new Date().getFullYear();
  const [form, setForm] = useState({
    policy_name: editPolicy?.policy_name || "", year: String(editPolicy?.year || currentYear),
    month_type: editPolicy?.month_type || "all", months: editPolicy?.months || [],
    scope: editPolicy?.scope || "all", department_id: String(editPolicy?.department_id || ""),
    designation_ids: editPolicy?.designation_ids || [],
  });
  const [leaveTypes, setLeaveTypes] = useState(
    editPolicy?.leave_types?.map(lt => ({ name: lt.name, days_per_year: lt.days_per_year, carry_forward: lt.carry_forward||0, encashable: lt.encashable ? "yes" : "no" }))
    || [{ name:"Annual Leave", days_per_year:21, carry_forward:5, encashable:"yes" }, { name:"Sick Leave", days_per_year:10, carry_forward:0, encashable:"no" }, { name:"Casual Leave", days_per_year:7, carry_forward:0, encashable:"no" }]
  );
  const [saving, setSaving]       = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const { departments, designations, loadingDept, loadingDesig, deptError } = useDeptDesig();
  const filteredDesig = designations.filter(d => d.department_id === Number(form.department_id));
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const toggleMonth = (m) => { if(form.month_type !== "specific") return; setForm(p => { const a = p.months.includes(m); return { ...p, months: a ? p.months.filter(x => x !== m) : [...p.months, m].sort((a,b) => a-b) }; }); };
  const toggleDesig = (id) => { setForm(p => { const a = p.designation_ids.includes(id); return { ...p, designation_ids: a ? p.designation_ids.filter(x => x !== id) : [...p.designation_ids, id] }; }); };
  const handleDeptChange = (val) => setForm(p => ({ ...p, department_id: val, designation_ids: [] }));
  const handleLeaveChange = (idx, key, val) => setLeaveTypes(prev => prev.map((r,i) => i===idx ? { ...r, [key]: val } : r));
  const addLeaveType = () => { const used = new Set(leaveTypes.map(r => r.name)); const next = LEAVE_TYPE_PRESETS.find(p => !used.has(p.name)); setLeaveTypes(prev => [...prev, { name: next?.name||"Custom Leave", days_per_year:5, carry_forward:0, encashable:"no" }]); };
  const removeLeaveType = (idx) => setLeaveTypes(prev => prev.filter((_,i) => i !== idx));
  const isDetailsValid = () => form.policy_name.trim() && form.year && (form.month_type === "all" || form.months.length > 0) && (form.scope === "all" || form.department_id);
  const isValid = () => isDetailsValid() && leaveTypes.length > 0 && leaveTypes.every(r => r.name.trim() && Number(r.days_per_year) > 0);

  const handleSave = async () => {
    if (!isValid()) return; setSaving(true);
    try {
      const payload = { policy_name: form.policy_name, year: Number(form.year), month_type: form.month_type, months: form.month_type === "all" ? [] : form.months, scope: form.scope, ...(form.scope === "department" ? { department_id: Number(form.department_id) } : {}), ...(form.scope === "department" && form.designation_ids.length > 0 ? { designation_ids: form.designation_ids } : {}), leave_types: leaveTypes.map(r => ({ name: r.name, days_per_year: Number(r.days_per_year), carry_forward: Number(r.carry_forward), encashable: r.encashable === "yes" })) };
      const url = isEdit ? `${BASE}/api/admin/leave-policies/${editPolicy.id}` : `${BASE}/api/admin/leave-policies`;
      const res = await fetch(url, { method: isEdit ? "PUT" : "POST", headers: getAuthHeaders(), body: JSON.stringify(payload) });
      const data = await res.json(); if (!res.ok) throw new Error(data?.message || `Error ${res.status}`);
      onSuccess?.(isEdit ? "Policy updated successfully!" : "Policy created successfully!"); onClose();
    } catch (err) { onSuccess?.(null, err.message || "Failed to save policy."); } finally { setSaving(false); }
  };

  const TABS = [{ id:"details", label:"Policy Details", icon:FileText }, { id:"leaves", label:"Leave Types", icon:Calendar }];
  const totalDays = leaveTypes.reduce((s,r) => s + Number(r.days_per_year||0), 0);

  return (
    <ModalShell title={isEdit ? "Edit Leave Policy" : "Create Leave Policy"} onClose={onClose} tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab}
      footer={activeTab === "details" ? (
        <><button onClick={onClose} className="px-5 py-2 text-sm font-bold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-100 transition">Cancel</button>
        <button onClick={() => setActiveTab("leaves")} disabled={!isDetailsValid()} className="flex items-center gap-2 px-5 py-2 text-sm font-black text-white bg-orange-500 hover:bg-orange-600 rounded-xl transition disabled:opacity-50">Next <ChevronRight size={14}/></button></>
      ) : (
        <><button onClick={() => setActiveTab("details")} className="flex items-center gap-1 px-5 py-2 text-sm font-bold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-100 transition"><ChevronLeft size={14}/>Back</button>
        <button onClick={handleSave} disabled={saving||!isValid()} className="flex items-center gap-2 px-5 py-2 text-sm font-black text-white bg-orange-500 hover:bg-orange-600 rounded-xl transition disabled:opacity-50">
          {saving ? <><Loader2 size={14} className="animate-spin"/>{isEdit ? "Updating…" : "Saving…"}</> : <><Plus size={14}/>{isEdit ? "Update Policy" : "Save Policy"}</>}
        </button></>
      )}>
      {activeTab === "details" && (<>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-xs font-bold text-gray-600 mb-1.5">Policy Name <span className="text-red-500">*</span></label><input value={form.policy_name} onChange={e => set("policy_name",e.target.value)} placeholder="e.g., Annual Leave Policy 2026" className={`${inputBase} ${neutral}`}/></div>
          <div><label className="block text-xs font-bold text-gray-600 mb-1.5">Year <span className="text-red-500">*</span></label>
            <div className="relative"><select value={form.year} onChange={e => set("year",e.target.value)} className={selectBase}>{[currentYear-1,currentYear,currentYear+1,currentYear+2].map(y => <option key={y} value={y}>{y}</option>)}</select><ChevronDown size={13} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"/></div>
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-2">Applicable Month(s) <span className="text-red-500">*</span></label>
          <div className="flex gap-2 mb-3">{["all","specific"].map(t => <button key={t} onClick={() => set("month_type",t)} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${form.month_type===t ? "border-orange-400 bg-orange-50 text-orange-600" : "border-gray-200 text-gray-500"}`}><Check size={11} className={form.month_type===t ? "opacity-100" : "opacity-0"}/>{t === "all" ? "All Months" : "Specific Months"}</button>)}</div>
          {form.month_type === "specific" && (<><div className="grid grid-cols-6 gap-2">{MONTH_SHORT.map((m,i) => { const num = i+1; const sel = form.months.includes(num); return <button key={m} onClick={() => toggleMonth(num)} className={`py-2 text-xs font-bold rounded-lg border transition-all ${sel ? "border-orange-400 bg-orange-50 text-orange-600" : "border-gray-200 text-gray-500"}`}>{m}</button>; })}</div>{form.months.length===0 && <p className="text-[11px] text-amber-500 mt-2 flex items-center gap-1"><AlertTriangle size={10}/>Select at least one month</p>}</>)}
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-2">Apply To <span className="text-red-500">*</span></label>
          <div className="flex gap-2 mb-3">
            <button onClick={() => set("scope","all")} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${form.scope==="all" ? "border-orange-400 bg-orange-50 text-orange-600" : "border-gray-200 text-gray-500"}`}><Users size={11}/>All Departments</button>
            <button onClick={() => set("scope","department")} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${form.scope==="department" ? "border-orange-400 bg-orange-50 text-orange-600" : "border-gray-200 text-gray-500"}`}><Shield size={11}/>Specific Department</button>
          </div>
          {form.scope === "department" && (<div className="space-y-4">
            <div><label className="block text-xs font-bold text-gray-600 mb-1.5">Department <span className="text-red-500">*</span></label>
              <div className="relative"><select value={form.department_id} onChange={e => handleDeptChange(e.target.value)} disabled={loadingDept} className={selectBase}><option value="">{loadingDept ? "Loading…" : "Select Department"}</option>{departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select><ChevronDown size={13} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"/>{deptError && <p className="text-[10px] text-red-500 mt-1">Failed to load departments</p>}</div>
            </div>
            {form.department_id && (<div><label className="block text-xs font-bold text-gray-600 mb-1.5">Designations <span className="ml-1 text-[10px] font-normal text-gray-400">(leave blank = whole dept)</span></label>
              {loadingDesig ? <div className="flex items-center gap-2 text-xs text-gray-400 py-2"><Loader2 size={13} className="animate-spin"/>Loading…</div> : filteredDesig.length===0 ? <p className="text-xs text-gray-400 py-2">No designations found.</p> : (
                <div className="flex flex-wrap gap-2">{filteredDesig.map(d => { const sel = form.designation_ids.includes(d.id); return <button key={d.id} onClick={() => toggleDesig(d.id)} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${sel ? "border-orange-400 bg-orange-50 text-orange-600" : "border-gray-200 text-gray-500"}`}>{sel && <Check size={10}/>}{d.name}</button>; })}</div>
              )}
              {form.designation_ids.length > 0 && <div className="mt-2 flex items-center gap-1.5 p-2 bg-orange-50 border border-orange-200 rounded-lg text-xs text-orange-600"><CheckCircle2 size={11}/>{form.designation_ids.length} selected<button onClick={() => set("designation_ids",[])} className="ml-auto"><X size={11}/></button></div>}
            </div>)}
          </div>)}
        </div>
        <div className="p-3 bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 rounded-xl text-xs space-y-1">
          <p className="font-black text-gray-700 mb-1 flex items-center gap-1.5"><ClipboardList size={12} className="text-orange-500"/>Summary</p>
          <p className="text-gray-600">Name: <span className="text-gray-900 font-bold">{form.policy_name||"—"}</span></p>
          <p className="text-gray-600">Year: <span className="text-gray-900 font-bold">{form.year}</span> · Months: <span className="text-gray-900 font-bold">{form.month_type==="all" ? "All 12" : form.months.map(m => MONTH_SHORT[m-1]).join(",") || "—"}</span></p>
          <p className="text-gray-600">Scope: <span className="text-gray-900 font-bold">{form.scope==="all" ? "All Departments" : departments.find(d => String(d.id)===String(form.department_id))?.name || "—"}</span></p>
        </div>
      </>)}
      {activeTab === "leaves" && (<>
        <div className="grid grid-cols-[1fr_90px_90px_90px_32px] gap-2 px-3 pb-1">
          {["Leave Type","Days/Yr","Carry Fwd","Encashable",""].map(h => <span key={h} className="text-[10px] font-black text-gray-400 uppercase tracking-wide">{h}</span>)}
        </div>
        <div className="space-y-2">{leaveTypes.map((row,idx) => <LeaveTypeRow key={idx} row={row} index={idx} onChange={handleLeaveChange} onRemove={removeLeaveType}/>)}</div>
        <button onClick={addLeaveType} className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold text-orange-500 border-2 border-dashed border-orange-200 rounded-xl hover:bg-orange-50 transition"><Plus size={13}/>Add Leave Type</button>
        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl">
          <span className="text-xs font-bold text-white">Total Leave Days</span>
          <span className="text-xl font-black text-white">{totalDays} days/yr</span>
        </div>
      </>)}
    </ModalShell>
  );
}

// ════════════════════════════════════════════════════════════════════
// ── ASSIGN LEAVE MODAL — with Bulk Assign tab
// ════════════════════════════════════════════════════════════════════
function AssignLeaveModal({ onClose, onSuccess, editAssignment }) {
  const isEdit = !!editAssignment;
  const currentYear = new Date().getFullYear();

  // Mode: "single" (existing flow) or "bulk" (new bulk-from-policy flow)
  const [mode, setMode] = useState("single");

  // ── Single assign state ──
  const [employees, setEmployees] = useState([]); const [loadingEmps, setLoadingEmps] = useState(true); const [empError, setEmpError] = useState(null);
  const [search, setSearch] = useState(""); const [selectedEmp, setSelectedEmp] = useState(editAssignment?.employee || null);
  const [policies, setPolicies] = useState([]); const [loadingPol, setLoadingPol] = useState(false); const [selectedPol, setSelectedPol] = useState(null);
  const [leaveOverride, setLeaveOverride] = useState({}); const [saving, setSaving] = useState(false); const [activeTab, setActiveTab] = useState("employee");

  // ── Bulk assign state ──
  const [bulkPolicies, setBulkPolicies]     = useState([]);
  const [loadingBulkPol, setLoadingBulkPol] = useState(false);
  const [bulkPolicyId, setBulkPolicyId]     = useState("");
  const [bulkYear, setBulkYear]             = useState(String(currentYear));
  const [bulkSaving, setBulkSaving]         = useState(false);
  const [bulkSearch, setBulkSearch]         = useState("");

  // ── Load employees (single mode) ──
  useEffect(() => {
    if (mode !== "single") return;
    if (employees.length > 0) return;
    setLoadingEmps(true);
    fetch(`${BASE}/api/admin/employees`, { headers: getAuthHeaders() })
      .then(r => { if(!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(data => setEmployees(Array.isArray(data) ? data : (data?.data ?? data?.employees ?? [])))
      .catch(err => setEmpError(err.message||"Failed"))
      .finally(() => setLoadingEmps(false));
  }, [mode]);

  // ── Load policies for single mode ──
  useEffect(() => {
    if (!selectedEmp) return; setLoadingPol(true); setSelectedPol(null); setLeaveOverride({});
    fetch(`${BASE}/api/admin/leave-policies`, { headers: getAuthHeaders() })
      .then(r => r.json())
      .then(data => {
        const list = Array.isArray(data) ? data : (data?.data ?? []);
        setPolicies(list);
        if (isEdit && editAssignment?.policy_id) {
          const pol = list.find(p => p.id === editAssignment.policy_id);
          if (pol) handlePolicySelect(pol, editAssignment.leave_allocations);
        }
      })
      .catch(() => setPolicies([]))
      .finally(() => setLoadingPol(false));
  }, [selectedEmp]);

  // ── Load policies for bulk mode ──
  useEffect(() => {
    if (mode !== "bulk") return;
    if (bulkPolicies.length > 0) return;
    setLoadingBulkPol(true);
    fetch(`${BASE}/api/admin/leave-policies`, { headers: getAuthHeaders() })
      .then(r => r.json())
      .then(data => setBulkPolicies(Array.isArray(data) ? data : (data?.data ?? [])))
      .catch(() => setBulkPolicies([]))
      .finally(() => setLoadingBulkPol(false));
  }, [mode]);

  const handlePolicySelect = (pol, existing) => {
    setSelectedPol(pol);
    const init = {};
    (pol.leave_types||[]).forEach(lt => {
      const ex = existing?.find(a => a.leave_type_name === lt.name);
      init[lt.name] = { days_assigned: ex?.days_assigned ?? lt.days_per_year, notes: ex?.notes||"" };
    });
    setLeaveOverride(init);
  };
  const handleOverrideChange = (name, key, val) => setLeaveOverride(prev => ({ ...prev, [name]: { ...prev[name], [key]: val } }));
  const filtered = employees.filter(e => { const q = search.toLowerCase(); return getFullName(e).toLowerCase().includes(q) || (e.employee_id||"").toLowerCase().includes(q) || getRole(e).toLowerCase().includes(q); });
  const isValid = () => selectedEmp && selectedPol && Object.keys(leaveOverride).length > 0;
  const totalAssigned = Object.values(leaveOverride).reduce((s,v) => s + Number(v.days_assigned||0), 0);

  // ── Single save ──
  const handleSave = async () => {
    if (!isValid()) return; setSaving(true);
    try {
      const payload = { employee_id: selectedEmp.id, policy_id: selectedPol.id, leave_allocations: Object.entries(leaveOverride).map(([name,v]) => ({ leave_type_name: name, days_assigned: Number(v.days_assigned), notes: v.notes||"" })) };
      const url = isEdit ? `${BASE}/api/admin/leave-assignments/${editAssignment.id}` : `${BASE}/api/admin/leave-assignments`;
      const res = await fetch(url, { method: isEdit ? "PUT" : "POST", headers: getAuthHeaders(), body: JSON.stringify(payload) });
      const data = await res.json(); if (!res.ok) throw new Error(data?.message || `Error ${res.status}`);
      onSuccess?.(isEdit ? "Assignment updated!" : "Leave assigned!"); onClose();
    } catch (err) { onSuccess?.(null, err.message||"Failed to assign."); } finally { setSaving(false); }
  };

  // ── Bulk save ──
  const isBulkValid = () => bulkPolicyId && bulkYear;
  const handleBulkSave = async () => {
    if (!isBulkValid()) return;
    setBulkSaving(true);
    try {
      const res = await fetch(`${BASE}/api/admin/leave-assignments/bulk-from-policy`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ policy_id: Number(bulkPolicyId), year: Number(bulkYear) }),
      });
      let data = {};
      try { data = await res.json(); } catch {}
      if (!res.ok) throw new Error(data?.message || data?.error || `Server error (${res.status})`);
      onSuccess?.(data.message || "Bulk assignment completed successfully!");
      onClose();
    } catch (err) {
      onSuccess?.(null, err.message || "Failed to bulk assign.");
    } finally {
      setBulkSaving(false);
    }
  };

  // ── Tabs change based on mode ──
  const TABS = mode === "single"
    ? [
        { id: "mode",     label: "Choose Mode",    icon: Layers   },
        { id: "employee", label: "Select Employee", icon: Users    },
        { id: "leave",    label: "Assign Leave",    icon: Calendar },
      ]
    : [
        { id: "mode", label: "Choose Mode",    icon: Layers   },
        { id: "bulk", label: "Bulk Assign",    icon: Zap      },
      ];

  // Filter bulk policies by search
  const filteredBulkPolicies = bulkPolicies.filter(p => {
    const q = bulkSearch.toLowerCase();
    return (p.policy_name||"").toLowerCase().includes(q);
  });
  const selectedBulkPolicy = bulkPolicies.find(p => String(p.id) === String(bulkPolicyId));

  // Footer based on activeTab
  const renderFooter = () => {
    if (activeTab === "mode") {
      return (
        <>
          <button onClick={onClose} className="px-5 py-2 text-sm font-bold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-100 transition">Cancel</button>
          <button
            onClick={() => setActiveTab(mode === "single" ? "employee" : "bulk")}
            className="flex items-center gap-2 px-5 py-2 text-sm font-black text-white bg-orange-500 hover:bg-orange-600 rounded-xl transition">
            Continue <ChevronRight size={14}/>
          </button>
        </>
      );
    }
    if (activeTab === "employee") {
      return (
        <>
          <button onClick={() => setActiveTab("mode")} className="flex items-center gap-1 px-5 py-2 text-sm font-bold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-100 transition"><ChevronLeft size={14}/>Back</button>
          <button onClick={() => setActiveTab("leave")} disabled={!selectedEmp} className="flex items-center gap-2 px-5 py-2 text-sm font-black text-white bg-orange-500 hover:bg-orange-600 rounded-xl transition disabled:opacity-50">
            Next <ChevronRight size={14}/>
          </button>
        </>
      );
    }
    if (activeTab === "leave") {
      return (
        <>
          <button onClick={() => setActiveTab("employee")} className="flex items-center gap-1 px-5 py-2 text-sm font-bold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-100 transition"><ChevronLeft size={14}/>Back</button>
          <button onClick={handleSave} disabled={saving||!isValid()} className="flex items-center gap-2 px-5 py-2 text-sm font-black text-white bg-orange-500 hover:bg-orange-600 rounded-xl transition disabled:opacity-50">
            {saving ? <><Loader2 size={14} className="animate-spin"/>{isEdit ? "Updating…" : "Assigning…"}</> : <><UserCheck size={14}/>{isEdit ? "Update" : "Assign Leave"}</>}
          </button>
        </>
      );
    }
    if (activeTab === "bulk") {
      return (
        <>
          <button onClick={() => setActiveTab("mode")} className="flex items-center gap-1 px-5 py-2 text-sm font-bold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-100 transition"><ChevronLeft size={14}/>Back</button>
          <button onClick={handleBulkSave} disabled={bulkSaving || !isBulkValid()}
            className="flex items-center gap-2 px-5 py-2 text-sm font-black text-white bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 rounded-xl transition disabled:opacity-50 shadow-sm shadow-violet-200">
            {bulkSaving ? <><Loader2 size={14} className="animate-spin"/>Bulk Assigning…</> : <><Zap size={14}/>Bulk Assign Leave</>}
          </button>
        </>
      );
    }
  };

  return (
    <ModalShell
      title={isEdit ? "Edit Leave Assignment" : "Assign Leave"}
      onClose={onClose}
      tabs={isEdit ? null : TABS}
      activeTab={activeTab}
      onTabChange={(tabId) => {
        // Don't allow jumping past mode if still on mode tab without selection
        if (isEdit) return;
        setActiveTab(tabId);
      }}
      footer={isEdit ? (
        <>
          <button onClick={onClose} className="px-5 py-2 text-sm font-bold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-100 transition">Cancel</button>
          <button onClick={handleSave} disabled={saving||!isValid()} className="flex items-center gap-2 px-5 py-2 text-sm font-black text-white bg-orange-500 hover:bg-orange-600 rounded-xl transition disabled:opacity-50">
            {saving ? <><Loader2 size={14} className="animate-spin"/>Updating…</> : <><UserCheck size={14}/>Update</>}
          </button>
        </>
      ) : renderFooter()}>

      {/* ─── Mode selector tab ─── */}
      {!isEdit && activeTab === "mode" && (
        <>
          <div className="text-center mb-2">
            <p className="text-sm font-black text-gray-800 mb-1">How would you like to assign leave?</p>
            <p className="text-xs text-gray-500">Pick one of the options below to get started</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {/* Single mode card */}
            <button
              onClick={() => { setMode("single"); }}
              className={`text-left p-5 rounded-2xl border-2 transition-all hover:-translate-y-0.5 ${mode === "single" ? "border-orange-400 bg-orange-50 shadow-lg shadow-orange-100" : "border-gray-200 bg-white hover:border-orange-200"}`}>
              <div className="flex items-start justify-between mb-3">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-sm ${mode==="single" ? "bg-gradient-to-br from-orange-400 to-amber-500" : "bg-gray-100"}`}>
                  <UserCheck size={20} className={mode==="single" ? "text-white" : "text-gray-400"}/>
                </div>
                {mode === "single" && (
                  <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center">
                    <Check size={13} className="text-white"/>
                  </div>
                )}
              </div>
              <p className="text-sm font-black text-gray-900 mb-1">Single Employee</p>
              <p className="text-[11px] text-gray-500 leading-relaxed">Assign a leave policy to one specific employee. Customize allocations per leave type.</p>
            </button>

            {/* Bulk mode card */}
            <button
              onClick={() => { setMode("bulk"); }}
              className={`text-left p-5 rounded-2xl border-2 transition-all hover:-translate-y-0.5 ${mode === "bulk" ? "border-violet-400 bg-violet-50 shadow-lg shadow-violet-100" : "border-gray-200 bg-white hover:border-violet-200"}`}>
              <div className="flex items-start justify-between mb-3">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-sm ${mode==="bulk" ? "bg-gradient-to-br from-violet-500 to-purple-600" : "bg-gray-100"}`}>
                  <Zap size={20} className={mode==="bulk" ? "text-white" : "text-gray-400"}/>
                </div>
                {mode === "bulk" && (
                  <div className="w-6 h-6 rounded-full bg-violet-500 flex items-center justify-center">
                    <Check size={13} className="text-white"/>
                  </div>
                )}
              </div>
              <p className="text-sm font-black text-gray-900 mb-1 flex items-center gap-1.5">
                Bulk Assign
                <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-violet-100 text-violet-600 border border-violet-200">FAST</span>
              </p>
              <p className="text-[11px] text-gray-500 leading-relaxed">Auto-assign a policy to all eligible employees in one click based on policy scope.</p>
            </button>
          </div>

          <div className="flex items-start gap-2.5 p-3 bg-blue-50 border border-blue-100 rounded-xl">
            <Info size={14} className="text-blue-500 shrink-0 mt-0.5"/>
            <div className="text-[11px] text-blue-700 leading-relaxed">
              <span className="font-black">Tip:</span> Use <span className="font-bold">Bulk Assign</span> when you've just created a new policy and want to apply it to all employees within its scope at once.
            </div>
          </div>
        </>
      )}

      {/* ─── Single mode: Employee tab ─── */}
      {!isEdit && activeTab === "employee" && (
        <>
          <div className="relative"><Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, ID, role…" className={`${inputBase} ${neutral} pl-9`}/></div>
          {selectedEmp && (<div className="flex items-center gap-3 p-3 bg-orange-50 border border-orange-200 rounded-xl">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-black shrink-0" style={{backgroundColor:AVATAR_COLORS[selectedEmp.id%AVATAR_COLORS.length]}}>{getInitials(getFullName(selectedEmp))}</div>
            <div className="flex-1 min-w-0"><p className="text-xs font-black text-gray-800">{getFullName(selectedEmp)}</p><p className="text-[10px] text-gray-500">{selectedEmp.employee_id} · {getRole(selectedEmp)}</p></div>
            <span className="flex items-center gap-1 text-[10px] font-black text-orange-600"><CheckCircle2 size={12}/>Selected</span>
            <button onClick={() => setSelectedEmp(null)} className="text-gray-400 hover:text-gray-600"><X size={13}/></button>
          </div>)}
          {loadingEmps ? <div className="flex items-center justify-center py-10 gap-2 text-gray-400"><Loader2 size={18} className="animate-spin text-orange-400"/><span className="text-xs">Loading employees…</span></div>
            : empError ? <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600"><AlertTriangle size={13}/>{empError}</div>
            : (<div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
              {filtered.length === 0 ? <div className="flex flex-col items-center py-10 text-gray-400"><Users size={32} strokeWidth={1}/><p className="text-xs mt-2">No employees found</p></div>
                : filtered.map((emp,i) => { const isSel = selectedEmp?.id === emp.id; const isActive = emp.status==="active"||emp.status===1;
                  return (<div key={emp.id??i} onClick={() => setSelectedEmp(emp)} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${isSel ? "border-orange-400 bg-orange-50" : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"}`}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black shrink-0" style={{backgroundColor:AVATAR_COLORS[i%AVATAR_COLORS.length]}}>{getInitials(getFullName(emp))}</div>
                    <div className="flex-1 min-w-0"><p className="text-xs font-bold text-gray-800 truncate">{getFullName(emp)}</p><p className="text-[10px] text-gray-400">{emp.employee_id} · {getRole(emp)}</p></div>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${isActive ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"}`}><span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-green-500" : "bg-gray-400"}`}/>{isActive ? "Active" : "Inactive"}</span>
                    {isSel && <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center"><Check size={11} className="text-white"/></div>}
                  </div>); })}
            </div>)}
        </>
      )}

      {/* ─── Single mode: Leave tab ─── */}
      {(activeTab === "leave" || (isEdit && activeTab !== "bulk")) && (
        <>
          {selectedEmp && (<div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-black shrink-0" style={{backgroundColor:AVATAR_COLORS[selectedEmp.id%AVATAR_COLORS.length]}}>{getInitials(getFullName(selectedEmp))}</div>
            <div><p className="text-sm font-black text-gray-800">{getFullName(selectedEmp)}</p><p className="text-[11px] text-gray-400">{selectedEmp.employee_id} · {getRole(selectedEmp)}</p></div>
          </div>)}
          <div><label className="block text-xs font-bold text-gray-600 mb-1.5">Select Leave Policy <span className="text-red-500">*</span></label>
            {loadingPol ? <div className="flex items-center gap-2 text-xs text-gray-400 py-2"><Loader2 size={13} className="animate-spin"/>Loading policies…</div>
              : policies.length === 0 ? <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-600"><AlertTriangle size={13}/>No policies found. Create one first.</div>
              : (<div className="space-y-2">{policies.map(pol => { const isSel = selectedPol?.id === pol.id; return (
                <div key={pol.id} onClick={() => handlePolicySelect(pol)} className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${isSel ? "border-orange-400 bg-orange-50" : "border-gray-100 hover:border-gray-200"}`}>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isSel ? "bg-orange-100" : "bg-gray-100"}`}><FileText size={15} className={isSel ? "text-orange-500" : "text-gray-400"}/></div>
                  <div className="flex-1 min-w-0"><div className="flex items-center justify-between"><p className="text-xs font-black text-gray-800">{pol.policy_name}</p>{isSel && <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center"><Check size={11} className="text-white"/></div>}</div>
                  <p className="text-[10px] text-gray-400">{pol.year} · {pol.month_type==="all" ? "All months" : (pol.months||[]).map(m => MONTH_SHORT[m-1]).join(",")} · {(pol.leave_types||[]).length} types</p></div>
                </div>); })}
              </div>)}
          </div>
          {selectedPol && (selectedPol.leave_types||[]).length > 0 && (<div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">Leave Allocation</label>
            <div className="space-y-2">{(selectedPol.leave_types||[]).map(lt => { const ov = leaveOverride[lt.name] || { days_assigned: lt.days_per_year, notes:"" }; const preset = getPreset(lt.name); const PIcon = preset.Icon;
              return (<div key={lt.name} className="grid grid-cols-[1fr_90px] gap-3 items-center p-3 rounded-xl border border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{backgroundColor:preset.bg}}>
                    <PIcon size={13} style={{color:preset.color}}/>
                  </div>
                  <div><p className="text-xs font-bold text-gray-800">{lt.name}</p><p className="text-[10px] text-gray-400">Default: {lt.days_per_year}d</p></div>
                </div>
                <input type="number" min="0" max="365" value={ov.days_assigned} onChange={e => handleOverrideChange(lt.name,"days_assigned",e.target.value)} className={`${inputBase} ${neutral} text-xs py-1.5 text-center`}/>
              </div>); })}
            </div>
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl mt-3">
              <span className="text-xs font-bold text-white">Total for {getFullName(selectedEmp)}</span>
              <span className="text-xl font-black text-white">{totalAssigned}d/yr</span>
            </div>
          </div>)}
        </>
      )}

      {/* ─── Bulk mode tab ─── */}
      {!isEdit && activeTab === "bulk" && (
        <>
          {/* Bulk header banner */}
          <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl shadow-md shadow-violet-200">
            <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center shrink-0 backdrop-blur-sm">
              <Zap size={20} className="text-white"/>
            </div>
            <div className="flex-1">
              <p className="text-sm font-black text-white mb-0.5 flex items-center gap-2">
                Bulk Assign Leave
                <Sparkles size={12} className="text-yellow-200"/>
              </p>
              <p className="text-[11px] text-violet-100 leading-relaxed">
                Select a policy and year. The system will automatically assign leave to all eligible employees within the policy's scope.
              </p>
            </div>
          </div>

          {/* Year selector */}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5 flex items-center gap-1.5">
              <Calendar size={12} className="text-violet-500"/>
              Year <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[currentYear-1, currentYear, currentYear+1, currentYear+2].map(y => {
                const sel = String(bulkYear) === String(y);
                return (
                  <button
                    key={y}
                    onClick={() => setBulkYear(String(y))}
                    className={`py-2.5 text-xs font-black rounded-xl border-2 transition-all ${sel ? "border-violet-400 bg-violet-50 text-violet-600 shadow-sm shadow-violet-100" : "border-gray-200 text-gray-500 hover:border-violet-200"}`}>
                    {y}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Policy search + selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-gray-600 flex items-center gap-1.5">
                <FileText size={12} className="text-violet-500"/>
                Select Policy <span className="text-red-500">*</span>
              </label>
              {bulkPolicies.length > 0 && (
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-violet-100 text-violet-600">
                  {filteredBulkPolicies.length} of {bulkPolicies.length}
                </span>
              )}
            </div>

            {bulkPolicies.length > 4 && (
              <div className="relative mb-2">
                <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                <input
                  value={bulkSearch}
                  onChange={e => setBulkSearch(e.target.value)}
                  placeholder="Search policies…"
                  className={`${inputBase} ${neutral} pl-8 text-xs py-2`}
                />
              </div>
            )}

            {loadingBulkPol ? (
              <div className="flex items-center justify-center py-8 gap-2 text-gray-400">
                <Loader2 size={16} className="animate-spin text-violet-400"/>
                <span className="text-xs">Loading policies…</span>
              </div>
            ) : bulkPolicies.length === 0 ? (
              <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-600">
                <AlertTriangle size={13}/>
                No policies available. Create a policy first.
              </div>
            ) : filteredBulkPolicies.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-gray-400">
                <Search size={28} strokeWidth={1}/>
                <p className="text-xs mt-2">No policies match "{bulkSearch}"</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {filteredBulkPolicies.map(pol => {
                  const isSel = String(bulkPolicyId) === String(pol.id);
                  const scopeLabel = pol.scope === "all" ? "All Departments" : (pol.department_name || `Dept ${pol.department_id}`);
                  return (
                    <div
                      key={pol.id}
                      onClick={() => setBulkPolicyId(String(pol.id))}
                      className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${isSel ? "border-violet-400 bg-violet-50 shadow-sm shadow-violet-100" : "border-gray-100 hover:border-gray-200 bg-white"}`}>
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isSel ? "bg-gradient-to-br from-violet-500 to-purple-600" : "bg-gray-100"}`}>
                        <FileText size={15} className={isSel ? "text-white" : "text-gray-400"}/>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <p className="text-xs font-black text-gray-800 truncate">{pol.policy_name}</p>
                          {isSel && (
                            <div className="w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center shrink-0 ml-2">
                              <Check size={11} className="text-white"/>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-500">
                            <Calendar size={9}/>
                            {pol.year}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-500">
                            <Building2 size={9}/>
                            {scopeLabel}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-500">
                            <Layers size={9}/>
                            {(pol.leave_types||[]).length} types
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Selected summary */}
          {selectedBulkPolicy && (
            <div className="rounded-2xl border-2 border-violet-200 overflow-hidden">
              <div className="bg-gradient-to-r from-violet-50 to-purple-50 px-4 py-3 border-b border-violet-100">
                <p className="text-[10px] font-black uppercase tracking-wider text-violet-600 flex items-center gap-1.5">
                  <ClipboardList size={11}/>
                  Bulk Assignment Summary
                </p>
              </div>
              <div className="p-4 bg-white space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 flex items-center gap-1.5"><FileText size={11} className="text-violet-400"/>Policy</span>
                  <span className="font-black text-gray-900">{selectedBulkPolicy.policy_name}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 flex items-center gap-1.5"><Calendar size={11} className="text-violet-400"/>Year</span>
                  <span className="font-black text-gray-900">{bulkYear}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 flex items-center gap-1.5"><Building2 size={11} className="text-violet-400"/>Scope</span>
                  <span className="font-black text-gray-900">{selectedBulkPolicy.scope === "all" ? "All Departments" : (selectedBulkPolicy.department_name || `Dept ${selectedBulkPolicy.department_id}`)}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 flex items-center gap-1.5"><Layers size={11} className="text-violet-400"/>Leave Types</span>
                  <div className="flex items-center gap-1 flex-wrap justify-end max-w-[60%]">
                    {(selectedBulkPolicy.leave_types||[]).slice(0, 3).map(lt => {
                      const preset = getPreset(lt.name);
                      const PIcon = preset.Icon;
                      return (
                        <span
                          key={lt.name}
                          className="inline-flex items-center gap-0.5 text-[9px] font-black px-1.5 py-0.5 rounded-full"
                          style={{backgroundColor:preset.bg, color:preset.color}}>
                          <PIcon size={8}/>{lt.days_per_year}d
                        </span>
                      );
                    })}
                    {(selectedBulkPolicy.leave_types||[]).length > 3 && (
                      <span className="text-[9px] text-gray-400 font-black">+{(selectedBulkPolicy.leave_types||[]).length - 3}</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-violet-500 to-purple-600 px-4 py-3 flex items-center gap-2">
                <Zap size={14} className="text-yellow-200"/>
                <p className="text-[11px] font-black text-white">
                  Ready to assign to all eligible employees
                </p>
              </div>
            </div>
          )}

          {/* Warning */}
          <div className="flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <AlertTriangle size={14} className="text-amber-500 shrink-0 mt-0.5"/>
            <div className="text-[11px] text-amber-700 leading-relaxed">
              <span className="font-black">Heads up:</span> This action will create leave assignments for all employees within the policy's scope. Existing assignments for the same policy/year will be skipped.
            </div>
          </div>
        </>
      )}
    </ModalShell>
  );
}

// ════════════════════════════════════════════════════════════════════
// ── VIEW POLICY MODAL
// ════════════════════════════════════════════════════════════════════
function ViewPolicyModal({ policy, onClose }) {
  return (
    <ModalShell title="Policy Details" onClose={onClose}>
      <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 rounded-xl">
        <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center shrink-0"><FileText size={18} className="text-orange-500"/></div>
        <div><p className="text-sm font-black text-gray-900">{policy.policy_name}</p><p className="text-xs text-gray-500 mt-0.5">{policy.year} · {policy.month_type==="all" ? "All months" : (policy.months||[]).map(m => MONTH_SHORT[m-1]).join(", ")}</p><p className="text-xs text-gray-500">Scope: {policy.scope==="all" ? "All Departments" : policy.department_name||`Dept ${policy.department_id}`}</p></div>
      </div>
      <div><p className="text-xs font-black text-gray-700 mb-2">Leave Types ({(policy.leave_types||[]).length})</p>
        <div className="space-y-2">{(policy.leave_types||[]).map(lt => { const preset = getPreset(lt.name); const PIcon = preset.Icon; return (
          <div key={lt.name} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50 hover:border-orange-200 transition">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{backgroundColor:preset.bg}}>
                <PIcon size={13} style={{color:preset.color}}/>
              </div>
              <span className="text-xs font-bold text-gray-800">{lt.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-white border border-gray-200 rounded-full text-[10px] font-black text-gray-700">{lt.days_per_year}d/yr</span>
              {lt.carry_forward>0 && <span className="px-2 py-0.5 bg-blue-50 border border-blue-100 rounded-full text-[10px] font-black text-blue-600">CF: {lt.carry_forward}</span>}
              {lt.encashable && <span className="px-2 py-0.5 bg-green-50 border border-green-100 rounded-full text-[10px] font-black text-green-600">Encashable</span>}
            </div>
          </div>); })}
        </div>
      </div>
    </ModalShell>
  );
}

// ════════════════════════════════════════════════════════════════════
// ── POLICIES SECTION
// ════════════════════════════════════════════════════════════════════
function PoliciesSection({ policies, loading, onEdit, onDelete, onView }) {
  const [page, setPage] = useState(1);
  const paginated = policies.slice((page-1)*CARDS_PER_PAGE, page*CARDS_PER_PAGE);

  if (loading) return (
    <div className="grid grid-cols-2 gap-4">{Array.from({length:4}).map((_,i) => (
      <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 animate-pulse">
        <div className="h-4 w-32 bg-gray-200 rounded mb-3"/><div className="h-3 w-24 bg-gray-100 rounded mb-2"/><div className="h-3 w-20 bg-gray-100 rounded"/>
      </div>
    ))}</div>
  );

  if (policies.length === 0) return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-100">
      <FileText size={40} strokeWidth={1} className="mb-3 text-gray-200"/>
      <p className="text-sm font-bold">No leave policies yet.</p>
      <p className="text-xs mt-1 text-gray-300">Create your first policy to get started.</p>
    </div>
  );

  return (<>
    <div className="grid grid-cols-2 gap-4">
      {paginated.map(pol => (
        <div key={pol.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
          <div className="flex items-start justify-between mb-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center shrink-0 shadow-sm shadow-orange-200"><FileText size={15} className="text-white"/></div>
            <div className="flex items-center gap-1">
              <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">Active</span>
              <button onClick={() => onView(pol)} className="w-6 h-6 flex items-center justify-center rounded-lg border border-gray-200 text-gray-300 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition"><Eye size={11}/></button>
              <button onClick={() => onEdit(pol)} className="w-6 h-6 flex items-center justify-center rounded-lg border border-gray-200 text-gray-300 hover:border-orange-400 hover:text-orange-500 hover:bg-orange-50 transition"><Edit2 size={11}/></button>
              <button onClick={() => onDelete(pol)} className="w-6 h-6 flex items-center justify-center rounded-lg border border-gray-200 text-gray-300 hover:border-red-400 hover:text-red-500 hover:bg-red-50 transition"><Trash2 size={11}/></button>
            </div>
          </div>
          <p className="text-sm font-black text-gray-900 mb-0.5 truncate">{pol.policy_name}</p>
          <p className="text-[10px] text-gray-400 mb-3">{pol.year} · {pol.month_type==="all" ? "All months" : (pol.months||[]).map(m => MONTH_SHORT[m-1]).join(", ")}</p>
          <div className="flex flex-wrap gap-1 mb-2">
            {(pol.leave_types||[]).slice(0,3).map(lt => { const preset = getPreset(lt.name); const PIcon = preset.Icon; return (
              <span key={lt.name} className="inline-flex items-center gap-1 text-[9px] font-black px-1.5 py-0.5 rounded-full" style={{backgroundColor:preset.bg, color:preset.color}}>
                <PIcon size={8}/>{lt.name.split(" ")[0]}: {lt.days_per_year}d
              </span>
            ); })}
            {(pol.leave_types||[]).length>3 && <span className="text-[9px] text-gray-400">+{(pol.leave_types||[]).length-3} more</span>}
          </div>
          <p className="text-[10px] text-gray-400 flex items-center gap-1"><Building2 size={9}/>{pol.scope==="all" ? "All Departments" : pol.department_name||`Dept ${pol.department_id}`}</p>
        </div>
      ))}
    </div>
    <Pagination total={policies.length} page={page} perPage={CARDS_PER_PAGE} onChange={setPage}/>
  </>);
}

// ════════════════════════════════════════════════════════════════════
// ── ASSIGNED LEAVE SECTION
// ════════════════════════════════════════════════════════════════════
function AssignedLeaveSection({ onEdit, onDelete, refreshKey }) {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [searchQ, setSearchQ]         = useState("");
  const [page, setPage]               = useState(1);

  const fetchAssignments = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${BASE}/api/admin/leave-assignments`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json(); setAssignments(Array.isArray(data) ? data : (data?.data??[]));
    } catch (err) { setError(err.message||"Failed to load assignments."); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAssignments(); }, [fetchAssignments, refreshKey]);

  const filtered  = assignments.filter(a => { const q = searchQ.toLowerCase(); const emp = getFullName(a.employee||a); return emp.toLowerCase().includes(q) || (a.policy_name||"").toLowerCase().includes(q); });
  const paginated = filtered.slice((page-1)*CARDS_PER_PAGE, page*CARDS_PER_PAGE);

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-black text-gray-800">Assigned Leave Details</h3>
          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-orange-100 text-orange-600">{assignments.length}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative"><Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"/>
            <input value={searchQ} onChange={e => { setSearchQ(e.target.value); setPage(1); }} placeholder="Search…" className="pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg outline-none focus:border-orange-400 bg-white text-gray-700 w-36"/>
          </div>
          <button onClick={fetchAssignments} className="w-7 h-7 flex items-center justify-center border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition"><RefreshCw size={11}/></button>
        </div>
      </div>
      {error && <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 mb-3"><span className="flex items-center gap-2"><AlertTriangle size={13}/>{error}</span><button onClick={fetchAssignments} className="font-black underline flex items-center gap-1"><RefreshCw size={10}/>Retry</button></div>}
      {loading ? (<div className="grid grid-cols-2 gap-4">{Array.from({length:4}).map((_,i) => <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 animate-pulse"><div className="flex gap-3 mb-3"><div className="w-10 h-10 rounded-full bg-gray-200"/><div className="flex-1"><div className="h-3 w-28 bg-gray-200 rounded mb-1.5"/><div className="h-2.5 w-20 bg-gray-100 rounded"/></div></div><div className="h-3 w-36 bg-gray-100 rounded mb-2"/><div className="h-3 w-24 bg-gray-100 rounded"/></div>)}</div>)
        : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400 bg-white rounded-2xl border border-gray-100">
            <UserCheck size={36} strokeWidth={1} className="mb-2 text-gray-200"/>
            <p className="text-sm font-bold">{searchQ ? "No matching assignments." : "No leave assignments yet."}</p>
            <p className="text-xs mt-1 text-gray-300">Use "Assign Leave" to get started.</p>
          </div>
        ) : (<>
          <div className="grid grid-cols-2 gap-4">
            {paginated.map(a => {
              const emp = a.employee||a; const name = getFullName(emp); const initials = getInitials(name);
              const avatarBg = AVATAR_COLORS[(emp.id||0) % AVATAR_COLORS.length];
              const allocs = a.leave_allocations||[]; const total = allocs.reduce((s,x) => s+Number(x.days_assigned||0), 0);
              return (
                <div key={a.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-black shrink-0" style={{backgroundColor:avatarBg}}>{initials}</div>
                      <div><p className="text-xs font-black text-gray-900">{name}</p><p className="text-[10px] text-gray-400">{emp.employee_id||""} · {getRole(emp)}</p></div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => onEdit(a)} className="w-6 h-6 flex items-center justify-center rounded-lg border border-gray-200 text-gray-300 hover:border-orange-400 hover:text-orange-500 hover:bg-orange-50 transition"><Edit2 size={11}/></button>
                      <button onClick={() => onDelete(a)} className="w-6 h-6 flex items-center justify-center rounded-lg border border-gray-200 text-gray-300 hover:border-red-400 hover:text-red-500 hover:bg-red-50 transition"><Trash2 size={11}/></button>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 mb-2 p-2 bg-gray-50 border border-gray-100 rounded-lg">
                    <FileText size={10} className="text-gray-400"/><span className="text-[10px] font-bold text-gray-600 truncate">{a.policy_name||`Policy #${a.policy_id}`}</span>
                    <span className="ml-auto text-[10px] font-black text-orange-500 shrink-0">{total}d/yr</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {allocs.slice(0,4).map(alloc => { const preset = getPreset(alloc.leave_type_name); const PIcon = preset.Icon; return (
                      <span key={alloc.leave_type_name} className="inline-flex items-center gap-1 text-[9px] font-black px-1.5 py-0.5 rounded-full" style={{backgroundColor:preset.bg, color:preset.color}}>
                        <PIcon size={8}/>{alloc.leave_type_name.split(" ")[0]}: {alloc.days_assigned}d
                      </span>
                    ); })}
                    {allocs.length>4 && <span className="text-[9px] text-gray-400">+{allocs.length-4}</span>}
                  </div>
                </div>
              );
            })}
          </div>
          <Pagination total={filtered.length} page={page} perPage={CARDS_PER_PAGE} onChange={setPage}/>
        </>)}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// ── LEAVE APPROVAL SECTION — REAL APIs
// ════════════════════════════════════════════════════════════════════
function LeaveApprovalSection() {
  const [requests, setRequests]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [filter, setFilter]           = useState("pending");
  const [search, setSearch]           = useState("");
  const [page, setPage]               = useState(1);
  const [actionLoading, setAL]        = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [notification, setNotif]      = useState(null);

  const notify = (type, title, message) => setNotif({ type, title, message });

  const fetchRequests = useCallback(async (status = filter) => {
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${BASE}/api/admin/leave-requests?status=${status}`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setRequests(data?.data || []);
    } catch (err) { setError(err.message || "Failed to load leave requests."); }
    finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { fetchRequests(filter); setPage(1); }, [filter]);

  const handleApprove = async (req) => {
    setAL(req.id);
    try {
      const res = await fetch(`${BASE}/api/admin/leave-request/${req.id}/approve`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ type: req.type }),
      });
      let data = {};
      try { data = await res.json(); } catch {}
      if (!res.ok) {
        const msg = data?.message || data?.error || `Server error (${res.status})`;
        throw new Error(msg);
      }
      notify("success", "Approved", data.message || "Leave request has been approved.");
      fetchRequests(filter);
    } catch (err) {
      notify("error", "Approval Failed", err.message);
    } finally { setAL(null); }
  };

  const handleReject = async (req, remarks) => {
    setAL(req.id);
    try {
      const res = await fetch(`${BASE}/api/admin/leave-request/${req.id}/reject`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ type: req.type, ...(remarks ? { remarks } : {}) }),
      });
      let data = {};
      try { data = await res.json(); } catch {}
      if (!res.ok) {
        const msg = data?.message || data?.error || `Server error (${res.status})`;
        throw new Error(msg);
      }
      setRejectModal(null);
      notify("info", "Leave Rejected", data.message || "Leave request has been rejected.");
      fetchRequests(filter);
    } catch (err) {
      notify("error", "Rejection Failed", err.message);
    } finally { setAL(null); }
  };

  const [counts, setCounts] = useState({ pending: 0, approved: 0, rejected: 0, all: 0 });
  useEffect(() => {
    Promise.all(["pending","approved","rejected"].map(s =>
      fetch(`${BASE}/api/admin/leave-requests?status=${s}`, { headers: getAuthHeaders() }).then(r => r.json()).then(d => ({ s, count: (d?.data||[]).length })).catch(() => ({ s, count: 0 }))
    )).then(results => {
      const c = { pending: 0, approved: 0, rejected: 0 };
      results.forEach(r => { c[r.s] = r.count; });
      setCounts({ ...c, all: c.pending + c.approved + c.rejected });
    });
  }, [requests]);

  const filtered = requests.filter(r => {
    const q = search.toLowerCase();
    return (r.employee_name||"").toLowerCase().includes(q) || (r.leave_type_name||"").toLowerCase().includes(q) || (r.reason||"").toLowerCase().includes(q);
  });
  const paginated = filtered.slice((page-1)*CARDS_PER_PAGE, page*CARDS_PER_PAGE);

  const statusStyle = {
    pending:  { dot:"bg-amber-400",   badge:"bg-amber-50 text-amber-700 border-amber-200",     label:"Pending",  cardBorder:"border-amber-200 bg-amber-50/30"  },
    approved: { dot:"bg-emerald-500", badge:"bg-emerald-50 text-emerald-700 border-emerald-200",label:"Approved", cardBorder:"border-emerald-200 bg-emerald-50/20" },
    rejected: { dot:"bg-red-400",     badge:"bg-red-50 text-red-600 border-red-200",            label:"Rejected", cardBorder:"border-red-200 bg-red-50/20"        },
  };

  const FILTERS = [
    { key: "pending",  label: "Pending"  },
    { key: "approved", label: "Approved" },
    { key: "rejected", label: "Rejected" },
  ];

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md shadow-violet-200">
            <Bell size={16} className="text-white"/>
          </div>
          <div>
            <h3 className="text-sm font-black text-gray-900">Leave Approval Requests</h3>
            <p className="text-[10px] text-gray-400">Review and action employee leave applications</p>
          </div>
          {counts.pending > 0 && (
            <span className="flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-full bg-red-500 text-white shadow-sm shadow-red-200 animate-pulse">
              {counts.pending} pending
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"/>
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search employee, type…"
              className="pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-xl outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 bg-white text-gray-700 w-44 transition"/>
          </div>
          <button onClick={() => fetchRequests(filter)} className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-violet-500 transition">
            <RefreshCw size={13}/>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-5 p-1 bg-gray-100 rounded-2xl w-fit">
        {FILTERS.map(({ key, label }) => {
          const isActive = filter === key;
          const activeStyles = {
            pending:  "bg-amber-500 text-white shadow-sm shadow-amber-200",
            approved: "bg-emerald-500 text-white shadow-sm shadow-emerald-200",
            rejected: "bg-red-500 text-white shadow-sm shadow-red-200",
          };
          return (
            <button key={key} onClick={() => setFilter(key)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-black rounded-xl transition-all ${isActive ? activeStyles[key] : "text-gray-500 hover:text-gray-700 hover:bg-white"}`}>
              {label}
              <span className={`text-[10px] font-black px-1.5 py-0 rounded-full ${isActive ? "bg-white/25 text-white" : "bg-gray-200 text-gray-600"}`}>
                {counts[key] || 0}
              </span>
            </button>
          );
        })}
      </div>

      {error && (
        <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-600 mb-4">
          <span className="flex items-center gap-2"><AlertTriangle size={15}/>{error}</span>
          <button onClick={() => fetchRequests(filter)} className="flex items-center gap-1 text-xs font-black underline"><RefreshCw size={11}/>Retry</button>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 gap-4">
          {Array.from({length:4}).map((_,i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 animate-pulse">
              <div className="flex gap-3 mb-4"><div className="w-10 h-10 rounded-full bg-gray-200"/><div className="flex-1 space-y-2"><div className="h-3 w-28 bg-gray-200 rounded"/><div className="h-2.5 w-20 bg-gray-100 rounded"/></div></div>
              <div className="grid grid-cols-3 gap-2 mb-3">{[...Array(3)].map((_,j) => <div key={j} className="h-14 bg-gray-100 rounded-xl"/>)}</div>
              <div className="h-8 bg-gray-100 rounded-xl"/>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-100">
          <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-4 border border-gray-100">
            <Bell size={28} strokeWidth={1} className="text-gray-300"/>
          </div>
          <p className="text-sm font-bold text-gray-500">No {filter} requests</p>
          <p className="text-xs mt-1 text-gray-300">{search ? "Try a different search term" : `All ${filter} leave requests will appear here`}</p>
        </div>
      ) : (<>
        <div className="grid grid-cols-2 gap-4">
          {paginated.map(req => {
            const sc   = statusStyle[req.status] || statusStyle.pending;
            const preset = getPreset(req.leave_type_name);
            const PIcon = preset.Icon;
            const avatarBg = AVATAR_COLORS[(req.employee_id||0) % AVATAR_COLORS.length];
            const initials = getInitials(req.employee_name || "??");
            const isLoading = actionLoading === req.id;
            const isPending = req.status === "pending";
            const isExtra   = req.is_extra || req.type === "extra";

            return (
              <div key={req.id}
                className={`rounded-2xl p-5 border-2 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 ${sc.cardBorder}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-black shrink-0 ring-2 ring-white shadow-md" style={{backgroundColor:avatarBg}}>
                        {initials}
                      </div>
                      {isExtra && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-indigo-500 border-2 border-white flex items-center justify-center">
                          <Star size={7} className="text-white" fill="white"/>
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-black text-gray-900 leading-tight">{req.employee_name || "—"}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">#{req.employee_code} · {req.designation || "Employee"}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-full border ${sc.badge}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`}/>{sc.label}
                    </span>
                    {isExtra && (
                      <span className="inline-flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100">
                        <Star size={7} fill="currentColor"/>Extra Leave
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="col-span-2 p-2.5 rounded-xl border" style={{backgroundColor:preset.bg, borderColor:`${preset.color}22`}}>
                    <p className="text-[9px] font-bold uppercase tracking-wider mb-1" style={{color:preset.color}}>Leave Type</p>
                    <p className="text-[11px] font-black text-gray-800 leading-tight flex items-center gap-1.5">
                      <PIcon size={11} style={{color:preset.color}}/>
                      {req.leave_type_name}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-orange-50 border border-orange-100 text-center">
                    <p className="text-[9px] font-bold text-orange-400 uppercase tracking-wider mb-1">Days</p>
                    <p className="text-2xl font-black text-orange-600 leading-none">{req.days}</p>
                  </div>
                  <div className="col-span-3 p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Period</p>
                    <p className="text-[11px] font-bold text-gray-700">{fmtDate(req.start_date)} → {fmtDate(req.end_date)}</p>
                  </div>
                </div>

                <div className="mb-3 px-3 py-2.5 rounded-xl bg-white border border-gray-100 shadow-sm">
                  <p className="text-[10px] text-gray-500 italic leading-relaxed line-clamp-2">"{req.reason}"</p>
                  {req.description && req.description !== req.reason && (
                    <p className="text-[9px] text-gray-400 mt-1 leading-relaxed">{req.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-[9px] text-gray-400 font-medium mb-3">
                  <Clock size={9}/>
                  <span>Applied: {fmtDateTime(req.applied_at)}</span>
                </div>

                {isPending && (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setRejectModal(req)}
                      disabled={isLoading}
                      className="flex items-center justify-center gap-1.5 py-2.5 text-xs font-black text-red-500 bg-white border-2 border-red-100 rounded-xl hover:bg-red-50 hover:border-red-300 transition disabled:opacity-50 shadow-sm">
                      {isLoading ? <Loader2 size={12} className="animate-spin"/> : <ThumbsDown size={12}/>}
                      Reject
                    </button>
                    <button
                      onClick={() => handleApprove(req)}
                      disabled={isLoading}
                      className="flex items-center justify-center gap-1.5 py-2.5 text-xs font-black text-white bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 rounded-xl shadow-sm shadow-emerald-200 transition disabled:opacity-50">
                      {isLoading ? <Loader2 size={12} className="animate-spin"/> : <ThumbsUp size={12}/>}
                      Approve
                    </button>
                  </div>
                )}

                {req.status === "approved" && (
                  <div className="flex items-center justify-center gap-2 py-2.5 bg-emerald-50 border-2 border-emerald-100 rounded-xl">
                    <CheckCircle2 size={14} className="text-emerald-500"/>
                    <span className="text-xs font-black text-emerald-600">Leave Approved</span>
                  </div>
                )}
                {req.status === "rejected" && (
                  <div className="flex flex-col items-center justify-center py-2.5 bg-red-50 border-2 border-red-100 rounded-xl gap-1">
                    <div className="flex items-center gap-1.5">
                      <XCircle size={14} className="text-red-400"/>
                      <span className="text-xs font-black text-red-500">Leave Rejected</span>
                    </div>
                    {req.remarks && <p className="text-[9px] text-red-400 px-3 text-center italic">"{req.remarks}"</p>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <Pagination total={filtered.length} page={page} perPage={CARDS_PER_PAGE} onChange={setPage}/>
      </>)}

      {rejectModal && (
        <RejectModal
          request={rejectModal}
          loading={actionLoading === rejectModal.id}
          onConfirm={(remarks) => handleReject(rejectModal, remarks)}
          onCancel={() => setRejectModal(null)}
        />
      )}

      {notification && (
        <NotificationModal
          type={notification.type}
          title={notification.title}
          message={notification.message}
          onClose={() => setNotif(null)}
        />
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// ── MAIN PAGE
// ════════════════════════════════════════════════════════════════════
export default function LeaveManagement() {
  const [showCreatePolicy, setShowCreatePolicy] = useState(false);
  const [showAssignLeave,  setShowAssignLeave]  = useState(false);
  const [editPolicy,       setEditPolicy]       = useState(null);
  const [editAssignment,   setEditAssignment]   = useState(null);
  const [viewPolicy,       setViewPolicy]       = useState(null);
  const [confirmDelete,    setConfirmDelete]    = useState(null);
  const [deleting,         setDeleting]         = useState(false);
  const [notification,     setNotification]     = useState(null);
  const [policies,         setPolicies]         = useState([]);
  const [loading,          setLoading]          = useState(true);
  const [error,            setError]            = useState(null);
  const [assignKey,        setAssignKey]        = useState(0);
  const [pendingCount,     setPendingCount]     = useState(0);

  const notify = useCallback((type, title, message) => setNotification({ type, title, message }), []);

  const fetchPolicies = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${BASE}/api/admin/leave-policies`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json(); setPolicies(Array.isArray(data) ? data : (data?.data??[]));
    } catch (err) { setError(err.message||"Failed to load policies."); } finally { setLoading(false); }
  }, []);

  const fetchPendingCount = useCallback(async () => {
    try {
      const res = await fetch(`${BASE}/api/admin/leave-requests?status=pending`, { headers: getAuthHeaders() });
      const data = await res.json();
      setPendingCount((data?.data||[]).length);
    } catch {}
  }, []);

  useEffect(() => { fetchPolicies(); fetchPendingCount(); }, [fetchPolicies, fetchPendingCount]);

  const handlePolicySuccess  = (msg, errMsg) => { if(errMsg) { notify("error","Error",errMsg); return; } notify("success","Success",msg||"Done!"); fetchPolicies(); };
  const handleAssignSuccess  = (msg, errMsg) => { if(errMsg) { notify("error","Error",errMsg); return; } notify("success","Success",msg||"Done!"); setAssignKey(k => k+1); };

  const handleDeleteConfirm = async () => {
    if (!confirmDelete) return;
    const { type, item } = confirmDelete; setDeleting(true);
    try {
      const url = type === "policy" ? `${BASE}/api/admin/leave-policies/${item.id}` : `${BASE}/api/admin/leave-assignments/${item.id}`;
      const res = await fetch(url, { method:"DELETE", headers: getAuthHeaders() });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || `Error ${res.status}`);
      setConfirmDelete(null); notify("success","Deleted", type==="policy" ? "Policy deleted successfully." : "Assignment deleted successfully.");
      if (type === "policy") fetchPolicies(); else setAssignKey(k => k+1);
    } catch (err) { setConfirmDelete(null); notify("error","Delete Failed", err.message||"Could not delete."); } finally { setDeleting(false); }
  };

  const totalLeaveTypes = policies.reduce((s,p) => s+(p.leave_types?.length||0), 0);

  const stats = [
    { label:"Total Policies",    value: loading ? "—" : policies.length,  Icon:FileText,  bg:"bg-slate-800",  text:"text-white" },
    { label:"Active Year",       value: new Date().getFullYear(),          Icon:Calendar,  bg:"bg-orange-500", text:"text-white" },
    { label:"Leave Types",       value: loading ? "—" : totalLeaveTypes,  Icon:Shield,    bg:"bg-blue-500",   text:"text-white" },
    { label:"Pending Approvals", value: pendingCount,                      Icon:Bell,      bg:"bg-violet-600", text:"text-white" },
  ];

  return (
    <div>
      <style>{`@keyframes modalPop{from{opacity:0;transform:scale(0.88)}to{opacity:1;transform:scale(1)}}`}</style>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {stats.map(({ label, value, Icon, bg, text }) => (
          <div key={label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-3 hover:shadow-md transition-shadow">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${bg} shadow-sm`}><Icon size={20} className={text}/></div>
            <div><p className="text-[11px] text-gray-400 font-semibold">{label}</p><p className="text-2xl font-black text-gray-900">{value}</p></div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-black text-gray-800">Leave Policies</h3>
          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-orange-100 text-orange-600">{policies.length}</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchPolicies} className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition"><RefreshCw size={13}/></button>
          <button onClick={() => { setEditAssignment(null); setShowAssignLeave(true); }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black text-orange-600 bg-orange-50 border border-orange-200 hover:bg-orange-100 transition">
            <UserCheck size={13}/>Assign Leave
          </button>
          <button onClick={() => { setEditPolicy(null); setShowCreatePolicy(true); }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 transition shadow-sm shadow-orange-200">
            <Plus size={13}/>Create Policy
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 mb-4">
          <span className="flex items-center gap-2"><AlertTriangle size={15}/>{error}</span>
          <button onClick={fetchPolicies} className="flex items-center gap-1 text-xs font-black underline"><RefreshCw size={11}/>Retry</button>
        </div>
      )}

      <PoliciesSection policies={policies} loading={loading}
        onEdit={pol => { setEditPolicy(pol); setShowCreatePolicy(true); }}
        onDelete={pol => setConfirmDelete({ type:"policy", item:pol })}
        onView={pol => setViewPolicy(pol)}
      />

      <AssignedLeaveSection key={assignKey} refreshKey={assignKey}
        onEdit={a => { setEditAssignment(a); setShowAssignLeave(true); }}
        onDelete={a => setConfirmDelete({ type:"assignment", item:a })}
      />

      <LeaveApprovalSection/>

      {/* Modals */}
      {showCreatePolicy && (
        <CreateLeavePolicyModal editPolicy={editPolicy}
          onClose={() => { setShowCreatePolicy(false); setEditPolicy(null); }}
          onSuccess={handlePolicySuccess}/>
      )}
      {showAssignLeave && (
        <AssignLeaveModal editAssignment={editAssignment}
          onClose={() => { setShowAssignLeave(false); setEditAssignment(null); }}
          onSuccess={handleAssignSuccess}/>
      )}
      {viewPolicy && <ViewPolicyModal policy={viewPolicy} onClose={() => setViewPolicy(null)}/>}
      {confirmDelete && (
        <ConfirmModal
          title={confirmDelete.type === "policy" ? "Delete Policy?" : "Delete Assignment?"}
          message={confirmDelete.type === "policy" ? `Delete "${confirmDelete.item.policy_name}"? This cannot be undone.` : `Delete assignment for ${getFullName(confirmDelete.item.employee||confirmDelete.item)}?`}
          loading={deleting} onConfirm={handleDeleteConfirm} onCancel={() => setConfirmDelete(null)}/>
      )}
      {notification && (
        <NotificationModal type={notification.type} title={notification.title} message={notification.message} onClose={() => setNotification(null)}/>
      )}
    </div>
  );
}