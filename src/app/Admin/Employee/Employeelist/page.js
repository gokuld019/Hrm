"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  Users, UserCheck, UserX, UserPlus, Search, Plus, Pencil, Trash2,
  X, Upload, ChevronDown, AlertTriangle, RefreshCw, Eye,
  Briefcase, CheckCircle2, Clock, Loader2, MoreVertical, ImagePlus, ArrowRight,
  Sun, Moon, Sunset, Calendar, Check, ListTodo, BarChart2,
  AlertCircle, TrendingUp, Target, Layers, ChevronRight,
} from "lucide-react";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "@/app/lib/cropImage";

// ── Constants ─────────────────────────────────────────────────────────
const prodColor = (v) => v >= 80 ? "#22c55e" : v >= 50 ? "#a855f7" : v >= 30 ? "#eab308" : "#ef4444";
const AVATAR_COLORS   = ["#6366f1","#f97316","#14b8a6","#ec4899","#22c55e","#a855f7","#3b82f6","#eab308"];
const ROLE_COLORS     = ["#a855f7","#eab308","#ef4444","#22c55e","#3b82f6","#ec4899","#14b8a6","#f97316"];
const BASE = process.env.NEXT_PUBLIC_API_URL;

const SHIFT_PRESETS = {
  morning: { label: "Morning", icon: Sun,    color: "#f97316", bg: "#fff7ed" },
  evening: { label: "Evening", icon: Sunset, color: "#8b5cf6", bg: "#f5f3ff" },
  night:   { label: "Night",   icon: Moon,   color: "#1e40af", bg: "#eff6ff" },
};
const DAY_KEYS   = ["mon","tue","wed","thu","fri","sat","sun"];
const DAY_LABELS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

const TASK_STATUS_CFG = {
  pending:     { label:"Pending",     bg:"#fff7ed", text:"#ea580c", dot:"#f97316" },
  in_progress: { label:"In Progress", bg:"#eff6ff", text:"#2563eb", dot:"#3b82f6" },
  completed:   { label:"Completed",   bg:"#f0fdf4", text:"#16a34a", dot:"#22c55e" },
  cancelled:   { label:"Cancelled",   bg:"#fef2f2", text:"#dc2626", dot:"#ef4444" },
};
const PROJECT_STATUS_CFG = {
  planning:    { label:"Planning",    bg:"#f5f3ff", text:"#7c3aed" },
  in_progress: { label:"In Progress", bg:"#eff6ff", text:"#2563eb" },
  completed:   { label:"Completed",   bg:"#f0fdf4", text:"#16a34a" },
  on_hold:     { label:"On Hold",     bg:"#fff7ed", text:"#ea580c" },
};
const PRIORITY_CFG = {
  high:   { bg:"#fef2f2", text:"#dc2626" },
  medium: { bg:"#fff7ed", text:"#ea580c" },
  low:    { bg:"#f0fdf4", text:"#16a34a" },
};

// ── Auth headers ──────────────────────────────────────────────────────
const getAuthHeaders = () => {
  const token = typeof window !== "undefined" ? localStorage.getItem("admin_auth_token") : null;
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    "ngrok-skip-browser-warning": "true",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// ── Image upload helper ───────────────────────────────────────────────
const uploadAvatarWithEmployeeId = async (file, employeeId) => {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("employee_id", employeeId);
  const res = await fetch("/api/upload-avatar", { method: "POST", body: fd });
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e?.error || "Image upload failed"); }
  return (await res.json()).path;
};

// ── Generate next sequential employee ID ──────────────────────────────
const generateNextEmployeeId = (employees) => {
  let maxNum = 0;
  for (const emp of employees) {
    const id    = emp.employee_id || "";
    const match = id.match(/EMP-?(\d+)/i);
    if (match) { const num = parseInt(match[1], 10); if (num > maxNum) maxNum = num; }
  }
  return `EMP-${String(maxNum + 1).padStart(3, "0")}`;
};

// ── Helpers ───────────────────────────────────────────────────────────
const getInitials     = (emp) => { const f = emp.firstname||""; const l = emp.lastname||""; return f&&l?`${f[0]}${l[0]}`.toUpperCase():f?f.slice(0,2).toUpperCase():"??"; };
const getFullName     = (emp) => [emp.firstname, emp.lastname].filter(Boolean).join(" ") || "Unknown";
const getRole         = (emp) => emp.designation?.name || emp.designation || emp.role || "Employee";
const getProductivity = (emp) => Math.min(100, Math.max(0, Number(emp.productivity ?? emp.performance ?? 0)));
function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

// ── Debounce ──────────────────────────────────────────────────────────
function useDebounce(value, delay = 600) {
  const [d, setD] = useState(value);
  useEffect(() => { const t = setTimeout(() => setD(value), delay); return () => clearTimeout(t); }, [value, delay]);
  return d;
}

// ── Field status ──────────────────────────────────────────────────────
function FieldStatus({ status, message }) {
  if (status === "idle" || !message) return null;
  if (status === "checking") return <p className="text-[10px] text-blue-400 mt-1 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse inline-block"/>Checking…</p>;
  if (status === "ok")       return <p className="text-[10px] text-green-500 mt-1 flex items-center gap-1"><CheckCircle2 size={10}/>{message}</p>;
  if (status === "error")    return <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1"><AlertTriangle size={10}/>{message}</p>;
}

// ── Shared input styles ───────────────────────────────────────────────
const inputBase  = "w-full text-sm border rounded-lg px-3 py-2 outline-none focus:ring-2 transition text-gray-800 bg-white placeholder:text-gray-400";
const neutral    = "border-gray-200 focus:border-orange-400 focus:ring-orange-100";
const selectBase = "w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 appearance-none bg-white transition text-gray-700 disabled:opacity-60";
const fieldBorderFn = (s) =>
  s === "ok"    ? "border-green-400 focus:border-green-400 focus:ring-green-100" :
  s === "error" ? "border-red-400   focus:border-red-400   focus:ring-red-100"   : neutral;

// ── Crop Image Modal ──────────────────────────────────────────────────
function CropImageModal({ imageSrc, onCropComplete, onClose }) {
  const [crop, setCrop]                     = useState({ x: 0, y: 0 });
  const [zoom, setZoom]                     = useState(1);
  const [croppedAreaPixels, setCroppedArea] = useState(null);

  const handleSave = async () => {
    try { const blob = await getCroppedImg(imageSrc, croppedAreaPixels); onCropComplete(blob); }
    catch (e) { console.error("Crop error", e); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose}/>
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 z-10 flex flex-col">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <h3 className="text-sm font-bold text-gray-800">Crop Image</h3>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"><X size={14}/></button>
        </div>
        <div className="relative h-80 w-full bg-gray-900">
          <Cropper image={imageSrc} crop={crop} zoom={zoom} aspect={1}
            onCropChange={setCrop} onZoomChange={setZoom}
            onCropComplete={(_, px) => setCroppedArea(px)}/>
        </div>
        <div className="p-4 border-t border-gray-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 text-xs font-semibold text-white bg-orange-500 rounded-lg hover:bg-orange-600">Apply Crop</button>
        </div>
      </div>
    </div>
  );
}

// ── Avatar upload section ─────────────────────────────────────────────
function AvatarUploadSection({ avatarPreview, avatarFile, employeeId, onChange, onRemove }) {
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [pendingImage,  setPendingImage]  = useState(null);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.addEventListener("load", () => { setPendingImage(reader.result); setCropModalOpen(true); });
    reader.readAsDataURL(file);
  };

  const handleCropComplete = async (croppedBlob) => {
    const file = new File([croppedBlob], "avatar.jpg", { type: "image/jpeg" });
    onChange({ target: { files: [file] } });
    setCropModalOpen(false); setPendingImage(null);
  };

  return (
    <>
      <div className="flex items-center gap-4 p-4 border border-dashed border-gray-200 rounded-xl bg-gray-50">
        {avatarPreview
          ? <img src={avatarPreview} alt="preview" className="w-14 h-14 rounded-full object-cover border-2 border-orange-300 shrink-0"/>
          : <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center text-orange-400 shrink-0"><ImagePlus size={20}/></div>
        }
        <div>
          <p className="text-xs font-semibold text-gray-700 mb-0.5">ProfileImage</p>
          <p className="text-[11px] text-gray-400 mb-2">Saved as <span className="font-mono text-orange-500 bg-orange-50 px-1 rounded">{employeeId ? `${employeeId}.(ext)` : "{employee_id}.(ext)"}</span></p>
          <div className="flex gap-2 items-center">
            <label className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition">
              <Upload size={11}/>{avatarFile ? "Change" : "Upload"}
              <input type="file" accept="image/*" className="hidden" onChange={handleFileSelect}/>
            </label>
            {avatarFile && (
              <button onClick={onRemove} className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-100 transition">
                <X size={10}/> Remove
              </button>
            )}
            {avatarFile && <span className="text-[10px] text-gray-400 italic">Saved on submit</span>}
          </div>
        </div>
      </div>
      {cropModalOpen && <CropImageModal imageSrc={pendingImage} onCropComplete={handleCropComplete} onClose={() => setCropModalOpen(false)}/>}
    </>
  );
}

// ── Dept + Designation fetcher ────────────────────────────────────────
function useDeptDesig() {
  const [departments,  setDepts]     = useState([]);
  const [designations, setDesigs]    = useState([]);
  const [loadingDept,  setLoadDept]  = useState(true);
  const [loadingDesig, setLoadDesig] = useState(true);
  const [deptError,    setDeptErr]   = useState(null);
  const [desigError,   setDesigErr]  = useState(null);

  useEffect(() => {
    fetch(`${BASE}/api/admin/departments`, { headers: getAuthHeaders() })
      .then(r => { if(!r.ok) throw new Error(); return r.json(); })
      .then(d => setDepts(d?.data || []))
      .catch(e => setDeptErr(e.message))
      .finally(() => setLoadDept(false));
    fetch(`${BASE}/api/admin/designations`, { headers: getAuthHeaders() })
      .then(r => { if(!r.ok) throw new Error(); return r.json(); })
      .then(d => setDesigs(d?.data || []))
      .catch(e => setDesigErr(e.message))
      .finally(() => setLoadDesig(false));
  }, []);

  return { departments, designations, loadingDept, loadingDesig, deptError, desigError };
}

// ── Shift Schedule Tab ────────────────────────────────────────────────
function ShiftScheduleTab({ selectedShiftId, onSelect }) {
  const [shifts,  setShifts]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch(`${BASE}/api/admin/shifts`, { headers: getAuthHeaders() })
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(json => setShifts(Array.isArray(json) ? json : Array.isArray(json.data) ? json.data : []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const parseDays = (active_days) => {
    if (!active_days) return Array(7).fill(false);
    const arr = Array.isArray(active_days) ? active_days : (() => { try { return JSON.parse(active_days); } catch { return []; } })();
    if (arr.length > 0 && typeof arr[0] === "string" && isNaN(Number(arr[0])))
      return DAY_KEYS.map(k => arr.map(d => d.toLowerCase()).includes(k));
    return arr.map(Boolean).slice(0, 7);
  };

  const getShiftType = (s) => {
    const t    = (s.shift_type || s.type || "").toLowerCase();
    if (SHIFT_PRESETS[t]) return t;
    const from = (s.start_time || "").slice(0, 5);
    if (from >= "06:00" && from < "14:00") return "morning";
    if (from >= "14:00" && from < "22:00") return "evening";
    return "night";
  };

  if (loading) return <div className="flex flex-col items-center justify-center py-12 gap-3 text-gray-400"><Loader2 size={22} className="animate-spin text-orange-400"/><p className="text-xs font-medium">Loading shifts…</p></div>;
  if (error)   return <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600"><AlertTriangle size={13}/><span>Failed to load shifts: {error}</span></div>;
  if (shifts.length === 0) return <div className="flex flex-col items-center justify-center py-12 gap-2 text-gray-400"><Calendar size={32} className="text-gray-200"/><p className="text-sm font-semibold">No shifts available</p><p className="text-[11px] text-gray-400">Create shifts first from the Shift Schedule page.</p></div>;

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-500 font-medium">Select a shift to assign to this employee. You can change it later.</p>
      <div onClick={() => onSelect(null)} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${selectedShiftId === null ? "border-orange-400 bg-orange-50" : "border-gray-100 hover:border-gray-200"}`}>
        <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center shrink-0"><X size={16} className="text-gray-400"/></div>
        <div className="flex-1"><p className="text-sm font-semibold text-gray-700">No Shift Assigned</p><p className="text-[10px] text-gray-400">Assign a shift later</p></div>
        {selectedShiftId === null && <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center shrink-0"><Check size={11} className="text-white"/></div>}
      </div>
      {shifts.map((shift) => {
        const type       = getShiftType(shift);
        const preset     = SHIFT_PRESETS[type];
        const ShiftIcon  = preset.icon;
        const days       = parseDays(shift.active_days ?? shift.days);
        const name       = shift.shift_name || shift.name || "Unnamed Shift";
        const from       = (shift.start_time || shift.from || "").slice(0, 5);
        const to         = (shift.end_time   || shift.to   || "").slice(0, 5);
        const maxEmp     = shift.max_employees ?? shift.maxEmp ?? 0;
        const isSelected = selectedShiftId === shift.id;
        return (
          <div key={shift.id} onClick={() => onSelect(shift.id)}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${isSelected ? "border-orange-400 shadow-sm" : "border-gray-100 hover:border-gray-200 hover:shadow-sm"}`}
            style={isSelected ? { background: preset.bg } : {}}>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: preset.bg }}>
                <ShiftIcon size={18} style={{ color: preset.color }}/>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p className="text-sm font-bold text-gray-800 truncate">{name}</p>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ color: preset.color, background: preset.bg }}>{preset.label}</span>
                    {isSelected && <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center"><Check size={11} className="text-white"/></div>}
                  </div>
                </div>
                <p className="text-[11px] text-gray-500 font-medium mb-2"><Clock size={10} className="inline mr-1"/>{from} – {to}{shift.break_time ? <span className="ml-2 text-gray-400">· {shift.break_time}m break</span> : null}</p>
                <div className="flex gap-1 mb-2">
                  {DAY_LABELS.map((d, i) => (
                    <span key={d} className="text-[9px] w-5 h-5 rounded flex items-center justify-center font-bold transition-all"
                      style={days[i] ? { background: preset.color, color: "#fff" } : { background: "#f1f5f9", color: "#94a3b8" }}>{d[0]}</span>
                  ))}
                </div>
                <div className="flex items-center gap-3 text-[10px] text-gray-400">
                  <span className="flex items-center gap-1"><Users size={9}/> Max {maxEmp} employees</span>
                  {days.filter(Boolean).length > 0 && <span>{days.filter(Boolean).length} days/week</span>}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Shared Modal Shell ────────────────────────────────────────────────
function ModalShell({ title, onClose, children, footer, tabs, activeTab, onTabChange }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}/>
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 z-10 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h2 className="text-base font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition"><X size={15}/></button>
        </div>
        {tabs && (
          <div className="flex items-center gap-0 px-6 pt-3 shrink-0 border-b border-gray-100">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold border-b-2 transition-all -mb-px ${activeTab === tab.id ? "border-orange-500 text-orange-500" : "border-transparent text-gray-400 hover:text-gray-600"}`}>
                <tab.icon size={12}/>{tab.label}
              </button>
            ))}
          </div>
        )}
        <div className="overflow-y-auto px-6 py-5 space-y-5 flex-1">{children}</div>
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50 shrink-0">{footer}</div>
      </div>
    </div>
  );
}

// ── ADD EMPLOYEE MODAL ────────────────────────────────────────────────
function AddEmployeeModal({ onClose, onSuccess, onNavigate }) {
  const blank = {
    firstname: "", lastname: "", employee_id: "", joining_date: "", username: "",
    email: "", phone_number: "", company: "", department_id: "", designation_id: "",
    about: "", status: "active", avatarFile: null, avatarPreview: null,
  };
  const [form, setForm]               = useState(blank);
  const [saving, setSaving]           = useState(false);
  const [saveError, setSaveError]     = useState(null);
  const [idStatus, setIdStatus]       = useState({ status: "idle", message: "" });
  const [emailStatus, setEmailStatus] = useState({ status: "idle", message: "" });
  const [loadingId, setLoadingId]     = useState(true);
  const [manualIdMode, setManualIdMode] = useState(false);
  const [activeTab, setActiveTab]     = useState("basic");
  const [selectedShiftId, setSelectedShiftId] = useState(null);

  const { departments, designations, loadingDept, loadingDesig, deptError, desigError } = useDeptDesig();
  const filteredDesignations = designations.filter(d => d.department_id === Number(form.department_id));

  const dId    = useDebounce(form.employee_id);
  const dEmail = useDebounce(form.email);

  const formatEmpId = (raw) => raw ? raw.replace(/^(EMP)(\d+)$/i, (_, p, n) => `EMP-${n.padStart(3, "0")}`) : raw;

  const checkIdAvailability = async (id) => {
    try {
      const r = await fetch(`${BASE}/api/admin/employees/check-id`, { method: "POST", headers: getAuthHeaders(), body: JSON.stringify({ employee_id: id }) });
      const d = await r.json();
      const ok = d?.available ?? d?.is_available ?? !d?.exists ?? true;
      setIdStatus(ok ? { status: "ok", message: "Employee ID is available" } : { status: "error", message: d?.message || "ID already taken" });
    } catch { setIdStatus({ status: "ok", message: "Employee ID is available" }); }
  };

  useEffect(() => {
    setForm(p => ({ ...p, joining_date: new Date().toISOString().split("T")[0] }));
    (async () => {
      try {
        setLoadingId(true);
        const response = await fetch(`${BASE}/api/admin/api/admin/employees/next-code`, { headers: getAuthHeaders() });
        if (!response.ok) throw new Error();
        const data   = await response.json();
        const nextId = data.next_code || data.data?.next_code;
        if (!nextId) throw new Error();
        const formatted = formatEmpId(nextId);
        setForm(prev => ({ ...prev, employee_id: formatted }));
        await checkIdAvailability(formatted);
      } catch {
        try {
          const r    = await fetch(`${BASE}/api/admin/employees`, { headers: getAuthHeaders() });
          const data = await r.json();
          const existing = Array.isArray(data) ? data : data?.data ?? data?.employees ?? [];
          const derived  = generateNextEmployeeId(existing);
          setForm(prev => ({ ...prev, employee_id: derived }));
          await checkIdAvailability(derived);
        } catch {
          setManualIdMode(true);
          setIdStatus({ status: "idle", message: "" });
          setForm(prev => ({ ...prev, employee_id: "" }));
        }
      } finally { setLoadingId(false); }
    })();
  }, []);

  useEffect(() => {
    if (!manualIdMode) return;
    if (!dId.trim()) { setIdStatus({ status: "idle", message: "" }); return; }
    setIdStatus({ status: "checking", message: "" });
    fetch(`${BASE}/api/admin/employees/check-id`, { method: "POST", headers: getAuthHeaders(), body: JSON.stringify({ employee_id: dId }) })
      .then(r => r.json())
      .then(data => { const ok = data?.available ?? data?.is_available ?? !data?.exists ?? true; setIdStatus(ok ? { status: "ok", message: "Employee ID is available" } : { status: "error", message: data?.message || "ID already taken" }); })
      .catch(() => setIdStatus({ status: "error", message: "Could not verify ID" }));
  }, [dId, manualIdMode]);

  useEffect(() => {
    const rx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!dEmail.trim() || !rx.test(dEmail)) { setEmailStatus({ status: "idle", message: "" }); return; }
    setEmailStatus({ status: "checking", message: "" });
    fetch(`${BASE}/api/admin/employees/check-email`, { method: "POST", headers: getAuthHeaders(), body: JSON.stringify({ email: dEmail }) })
      .then(r => r.json())
      .then(data => { const ok = data?.available ?? data?.is_available ?? !data?.exists ?? true; setEmailStatus(ok ? { status: "ok", message: "Email is available" } : { status: "error", message: data?.message || "Email already registered" }); })
      .catch(() => setEmailStatus({ status: "error", message: "Could not verify email" }));
  }, [dEmail]);

  const set = (k, v) => {
    if (k === "department_id") setForm(p => ({ ...p, department_id: v, designation_id: "" }));
    else setForm(p => ({ ...p, [k]: v }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    if (form.avatarPreview) URL.revokeObjectURL(form.avatarPreview);
    setForm(p => ({ ...p, avatarFile: file, avatarPreview: URL.createObjectURL(file) }));
  };

  const handleRemoveImage = () => {
    if (form.avatarPreview) URL.revokeObjectURL(form.avatarPreview);
    setForm(p => ({ ...p, avatarFile: null, avatarPreview: null }));
  };

  const isValid = () =>
    form.firstname.trim() && form.lastname.trim() && form.employee_id.trim() &&
    form.joining_date && form.username.trim() && form.email.trim() &&
    form.phone_number.trim() && form.department_id && form.designation_id &&
    idStatus.status === "ok" && emailStatus.status === "ok";

  const handleSave = async () => {
    if (!isValid()) return;
    setSaving(true); setSaveError(null);
    try {
      let profileImagePath = null;
      if (form.avatarFile) profileImagePath = await uploadAvatarWithEmployeeId(form.avatarFile, form.employee_id);
      const payload = {
        employee_id: form.employee_id, firstname: form.firstname, lastname: form.lastname,
        username: form.username, email: form.email, phone_number: form.phone_number,
        joining_date: form.joining_date, department_id: Number(form.department_id),
        designation_id: Number(form.designation_id), about: form.about, status: form.status,
        ...(selectedShiftId !== null  ? { shift_id: selectedShiftId }         : {}),
        ...(profileImagePath          ? { profile_image: profileImagePath }    : {}),
        ...(form.company              ? { company: form.company }              : {}),
      };
      const res  = await fetch(`${BASE}/api/admin/employees`, { method: "POST", headers: getAuthHeaders(), body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || (data?.errors ? Object.values(data.errors).flat().join(" • ") : `Error ${res.status}`));
      onSuccess?.(data); onClose();
    } catch (err) { setSaveError(err.message || "Failed to save."); }
    finally { setSaving(false); }
  };

  const TABS = [
    { id: "basic", label: "Basic Information", icon: Users    },
    { id: "shift", label: "Shift Schedule",    icon: Calendar },
  ];

  return (
    <ModalShell title="Add New Employee" onClose={onClose} tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab}
      footer={
        <>
          {activeTab === "basic" ? (
            <>
              <button onClick={onClose} className="px-5 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100 transition">Cancel</button>
              <button onClick={() => setActiveTab("shift")} disabled={!isValid()}
                className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed">
                Next: Shift Schedule <ArrowRight size={14}/>
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setActiveTab("basic")} className="px-5 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100 transition">← Back</button>
              <button onClick={handleSave} disabled={saving || !isValid()}
                className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed">
                {saving ? <><Loader2 size={14} className="animate-spin"/>Saving…</> : <><Plus size={14}/>Save Employee</>}
              </button>
            </>
          )}
        </>
      }
    >
      {activeTab === "basic" && (
        <>
          {saveError && <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600"><AlertTriangle size={13} className="shrink-0 mt-0.5"/><span>{saveError}</span></div>}
          <AvatarUploadSection avatarPreview={form.avatarPreview} avatarFile={form.avatarFile} employeeId={form.employee_id} onChange={handleImageChange} onRemove={handleRemoveImage}/>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs font-semibold text-gray-600 mb-1.5">First Name <span className="text-red-500">*</span></label><input value={form.firstname} onChange={e=>set("firstname",e.target.value)} className={`${inputBase} ${neutral}`}/></div>
            <div><label className="block text-xs font-semibold text-gray-600 mb-1.5">Last Name <span className="text-red-500">*</span></label><input value={form.lastname} onChange={e=>set("lastname",e.target.value)} className={`${inputBase} ${neutral}`}/></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Employee ID <span className="text-red-500">*</span></label>
              {manualIdMode ? (
                <input value={form.employee_id} onChange={e=>set("employee_id",e.target.value)} placeholder="e.g., EMP-001" className={`${inputBase} ${fieldBorderFn(idStatus.status)}`}/>
              ) : (
                <div className="relative">
                  <input value={form.employee_id} disabled={loadingId} readOnly={!manualIdMode} className={`${inputBase} ${fieldBorderFn(idStatus.status)} bg-gray-50`} placeholder={loadingId ? "Generating…" : "Auto-generated"}/>
                  {loadingId && <div className="absolute right-3 top-1/2 -translate-y-1/2"><Loader2 size={14} className="animate-spin text-gray-400"/></div>}
                </div>
              )}
              <FieldStatus {...idStatus}/>
              {manualIdMode && <p className="text-[10px] text-amber-500 mt-1">⚠️ Please enter a unique Employee ID manually (e.g., EMP-001).</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Joining Date <span className="text-red-500">*</span></label>
              <input type="date" value={form.joining_date} onChange={e=>set("joining_date",e.target.value)} className={`${inputBase} ${neutral}`}/>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs font-semibold text-gray-600 mb-1.5">Username <span className="text-red-500">*</span></label><input value={form.username} onChange={e=>set("username",e.target.value)} className={`${inputBase} ${neutral}`}/></div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email <span className="text-red-500">*</span></label>
              <input type="email" value={form.email} onChange={e=>set("email",e.target.value)} className={`${inputBase} ${fieldBorderFn(emailStatus.status)}`}/>
              <FieldStatus {...emailStatus}/>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs font-semibold text-gray-600 mb-1.5">Phone Number <span className="text-red-500">*</span></label><input type="tel" value={form.phone_number} onChange={e=>set("phone_number",e.target.value)} className={`${inputBase} ${neutral}`}/></div>
            <div><label className="block text-xs font-semibold text-gray-600 mb-1.5">Company</label><input value={form.company} onChange={e=>set("company",e.target.value)} className={`${inputBase} ${neutral}`}/></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Department <span className="text-red-500">*</span></label>
              <div className="relative">
                <select value={form.department_id} onChange={e=>set("department_id",e.target.value)} disabled={loadingDept} className={selectBase}>
                  <option value="">{loadingDept ? "Loading…" : "Select Department"}</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
                <ChevronDown size={13} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                {deptError && <p className="text-[10px] text-red-500 mt-1">Failed to load</p>}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Designation <span className="text-red-500">*</span></label>
              <div className="relative">
                <select value={form.designation_id} onChange={e=>set("designation_id",e.target.value)} disabled={loadingDesig || !form.department_id || filteredDesignations.length === 0} className={selectBase}>
                  <option value="">{!form.department_id ? "Select department first" : loadingDesig ? "Loading…" : filteredDesignations.length === 0 ? "No designations" : "Select Designation"}</option>
                  {filteredDesignations.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
                <ChevronDown size={13} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                {desigError && <p className="text-[10px] text-red-500 mt-1">Failed to load</p>}
              </div>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Status</label>
            <div className="relative">
              <select value={form.status} onChange={e=>set("status",e.target.value)} className={selectBase}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <ChevronDown size={13} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"/>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">About</label>
            <textarea value={form.about} onChange={e=>set("about",e.target.value)} rows={3} className={`${inputBase} ${neutral} resize-none`}/>
          </div>
        </>
      )}
      {activeTab === "shift" && (
        <div>
          {selectedShiftId !== null && (
            <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-orange-50 border border-orange-200 rounded-xl text-xs font-semibold text-orange-600">
              <CheckCircle2 size={13} className="text-orange-500"/>Shift selected — click Save Employee to confirm.
              <button onClick={() => setSelectedShiftId(null)} className="ml-auto text-gray-400 hover:text-gray-600"><X size={12}/></button>
            </div>
          )}
          <ShiftScheduleTab selectedShiftId={selectedShiftId} onSelect={setSelectedShiftId}/>
        </div>
      )}
    </ModalShell>
  );
}

// ── EDIT EMPLOYEE MODAL ───────────────────────────────────────────────
function EditEmployeeModal({ emp, onClose, onSuccess }) {
  const [form, setForm] = useState({
    firstname:      emp.firstname      || "",
    lastname:       emp.lastname       || "",
    username:       emp.username       || "",
    email:          emp.email          || "",
    phone_number:   emp.phone_number   || "",
    company:        emp.company        || "",
    department_id:  String(emp.department_id  || emp.department?.id  || ""),
    designation_id: String(emp.designation_id || emp.designation?.id || ""),
    joining_date:   emp.joining_date   || "",
    about:          emp.about          || "",
    status:         emp.status         || "active",
    avatarFile:     null,
    avatarPreview:  emp.profile_image  || emp.avatar || null,
  });
  const [saving, setSaving]           = useState(false);
  const [saveError, setSaveError]     = useState(null);
  const [activeTab, setActiveTab]     = useState("basic");
  const [selectedShiftId, setSelectedShiftId] = useState(emp.shift_id ?? null);

  const { departments, designations, loadingDept, loadingDesig, deptError, desigError } = useDeptDesig();
  const filteredDesignations = designations.filter(d => d.department_id === Number(form.department_id));

  const set = (k, v) => {
    if (k === "department_id") setForm(p => ({ ...p, department_id: v, designation_id: "" }));
    else setForm(p => ({ ...p, [k]: v }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    setForm(p => ({ ...p, avatarFile: file, avatarPreview: URL.createObjectURL(file) }));
  };

  const handleRemoveImage = () => {
    setForm(p => ({ ...p, avatarFile: null, avatarPreview: null }));
  };

  const isValid = () =>
    form.firstname.trim() && form.lastname.trim() && form.joining_date &&
    form.username.trim() && form.email.trim() && form.phone_number.trim() &&
    form.department_id && form.designation_id;

  const handleSave = async () => {
    if (!isValid()) return;
    setSaving(true); setSaveError(null);
    try {
      let profileImagePath = emp.profile_image || null;
      if (form.avatarFile) profileImagePath = await uploadAvatarWithEmployeeId(form.avatarFile, emp.employee_id);
      const payload = {
        firstname: form.firstname, lastname: form.lastname, username: form.username,
        email: form.email, phone_number: form.phone_number, joining_date: form.joining_date,
        department_id: Number(form.department_id), designation_id: Number(form.designation_id),
        about: form.about, status: form.status,
        ...(selectedShiftId !== null ? { shift_id: selectedShiftId }         : {}),
        ...(profileImagePath         ? { profile_image: profileImagePath }   : {}),
        ...(form.company             ? { company: form.company }             : {}),
      };
      const res  = await fetch(`${BASE}/api/admin/employees/${emp.id}`, { method: "PUT", headers: getAuthHeaders(), body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || (data?.errors ? Object.values(data.errors).flat().join(" • ") : `Error ${res.status}`));
      onSuccess?.(data?.data ?? data); onClose();
    } catch(err) { setSaveError(err.message || "Failed to update."); }
    finally { setSaving(false); }
  };

  const TABS = [
    { id: "basic", label: "Basic Information", icon: Users    },
    { id: "shift", label: "Shift Schedule",    icon: Calendar },
  ];

  return (
    <ModalShell title={`Edit — ${getFullName(emp)}`} onClose={onClose} tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab}
      footer={
        <>
          <button onClick={onClose} className="px-5 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100 transition">Cancel</button>
          <button onClick={handleSave} disabled={saving || !isValid()}
            className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed">
            {saving ? <><Loader2 size={14} className="animate-spin"/>Updating…</> : <><Pencil size={14}/>Update Employee</>}
          </button>
        </>
      }
    >
      {activeTab === "basic" && (
        <>
          {saveError && <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600"><AlertTriangle size={13} className="shrink-0 mt-0.5"/><span>{saveError}</span></div>}
          <AvatarUploadSection avatarPreview={form.avatarPreview} avatarFile={form.avatarFile} employeeId={emp.employee_id} onChange={handleImageChange} onRemove={handleRemoveImage}/>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs font-semibold text-gray-600 mb-1.5">First Name <span className="text-red-500">*</span></label><input value={form.firstname} onChange={e=>set("firstname",e.target.value)} className={`${inputBase} ${neutral}`}/></div>
            <div><label className="block text-xs font-semibold text-gray-600 mb-1.5">Last Name <span className="text-red-500">*</span></label><input value={form.lastname} onChange={e=>set("lastname",e.target.value)} className={`${inputBase} ${neutral}`}/></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Employee ID</label>
              <input value={emp.employee_id} readOnly className={`${inputBase} border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed`}/>
              <p className="text-[10px] text-gray-400 mt-1">ID cannot be changed after creation</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Joining Date <span className="text-red-500">*</span></label>
              <input type="date" value={form.joining_date} onChange={e=>set("joining_date",e.target.value)} className={`${inputBase} ${neutral}`}/>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs font-semibold text-gray-600 mb-1.5">Username <span className="text-red-500">*</span></label><input value={form.username} onChange={e=>set("username",e.target.value)} className={`${inputBase} ${neutral}`}/></div>
            <div><label className="block text-xs font-semibold text-gray-600 mb-1.5">Email <span className="text-red-500">*</span></label><input type="email" value={form.email} onChange={e=>set("email",e.target.value)} className={`${inputBase} ${neutral}`}/></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs font-semibold text-gray-600 mb-1.5">Phone Number <span className="text-red-500">*</span></label><input type="tel" value={form.phone_number} onChange={e=>set("phone_number",e.target.value)} className={`${inputBase} ${neutral}`}/></div>
            <div><label className="block text-xs font-semibold text-gray-600 mb-1.5">Company</label><input value={form.company} onChange={e=>set("company",e.target.value)} className={`${inputBase} ${neutral}`}/></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Department <span className="text-red-500">*</span></label>
              <div className="relative">
                <select value={form.department_id} onChange={e=>set("department_id",e.target.value)} disabled={loadingDept} className={selectBase}>
                  <option value="">{loadingDept ? "Loading…" : "Select Department"}</option>
                  {departments.map(d => <option key={d.id} value={String(d.id)}>{d.name}</option>)}
                </select>
                <ChevronDown size={13} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"/>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Designation <span className="text-red-500">*</span></label>
              <div className="relative">
                <select value={form.designation_id} onChange={e=>set("designation_id",e.target.value)} disabled={loadingDesig || !form.department_id || filteredDesignations.length === 0} className={selectBase}>
                  <option value="">{!form.department_id ? "Select department first" : loadingDesig ? "Loading…" : filteredDesignations.length === 0 ? "No designations" : "Select Designation"}</option>
                  {filteredDesignations.map(d => <option key={d.id} value={String(d.id)}>{d.name}</option>)}
                </select>
                <ChevronDown size={13} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"/>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Status</label>
            <div className="relative">
              <select value={form.status} onChange={e=>set("status",e.target.value)} className={selectBase}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <ChevronDown size={13} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"/>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">About</label>
            <textarea value={form.about} onChange={e=>set("about",e.target.value)} rows={3} className={`${inputBase} ${neutral} resize-none`}/>
          </div>
        </>
      )}
      {activeTab === "shift" && (
        <div>
          {selectedShiftId !== null && (
            <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-orange-50 border border-orange-200 rounded-xl text-xs font-semibold text-orange-600">
              <CheckCircle2 size={13} className="text-orange-500"/>Shift selected — click Update Employee to save.
              <button onClick={() => setSelectedShiftId(null)} className="ml-auto text-gray-400 hover:text-gray-600"><X size={12}/></button>
            </div>
          )}
          <ShiftScheduleTab selectedShiftId={selectedShiftId} onSelect={setSelectedShiftId}/>
        </div>
      )}
    </ModalShell>
  );
}

// ── DELETE CONFIRM MODAL ──────────────────────────────────────────────
function DeleteConfirmModal({ emp, onClose, onSuccess }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError]       = useState(null);

  const handleDelete = async () => {
    setDeleting(true); setError(null);
    try {
      const res  = await fetch(`${BASE}/api/admin/employees/${emp.id}`, { method: "DELETE", headers: getAuthHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || `Error ${res.status}`);
      onSuccess?.(); onClose();
    } catch(err) { setError(err.message || "Failed to delete."); }
    finally { setDeleting(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}/>
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 z-10 p-6">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4"><Trash2 size={22} className="text-red-500"/></div>
        <h3 className="text-base font-bold text-gray-900 text-center mb-1">Delete Employee</h3>
        <p className="text-sm text-gray-500 text-center mb-1">Are you sure you want to delete</p>
        <p className="text-sm font-semibold text-gray-800 text-center mb-4">{getFullName(emp)} <span className="text-gray-400 font-normal">({emp.employee_id})</span></p>
        <p className="text-xs text-red-500 text-center mb-5">This action cannot be undone.</p>
        {error && <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 mb-4"><AlertTriangle size={13}/><span>{error}</span></div>}
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition">Cancel</button>
          <button onClick={handleDelete} disabled={deleting}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-xl transition disabled:opacity-60">
            {deleting ? <><Loader2 size={14} className="animate-spin"/>Deleting…</> : <><Trash2 size={14}/>Delete</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── CARD ACTION MENU ──────────────────────────────────────────────────
function CardMenu({ onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(o => !o)} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition">
        <MoreVertical size={15}/>
      </button>
      {open && (
        <div className="absolute right-0 top-8 z-20 w-36 bg-white rounded-xl shadow-lg border border-gray-100 py-1 overflow-hidden">
          <button onClick={() => { setOpen(false); onEdit(); }} className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 transition">
            <Pencil size={13} className="text-orange-400"/> Edit Employee
          </button>
          <div className="h-px bg-gray-100 mx-2"/>
          <button onClick={() => { setOpen(false); onDelete(); }} className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition">
            <Trash2 size={13}/> Delete
          </button>
        </div>
      )}
    </div>
  );
}

// ── EMPLOYEE DETAIL DRAWER ────────────────────────────────────────────
// Shows: Attendance (today), Projects assigned, Tasks assigned, Productivity breakdown
function EmployeeDetailDrawer({ emp, onClose, allProjects, allTasks, attendanceMap }) {
  const empId       = emp.id;
  const name        = getFullName(emp);
  const role        = getRole(emp);
  const avatarSrc   = emp.profile_image || emp.avatar || null;
  const avatarBg    = AVATAR_COLORS[empId % AVATAR_COLORS.length];
  const initials    = getInitials(emp);
  const isActive    = emp.status === "active" || emp.status === 1;

  // Filter projects this employee is part of (team_member, manager, or team_leader)
  const empProjects = allProjects.filter(p =>
    p.project_manager_id === empId ||
    p.team_leader_id === empId ||
    (p.team_members || []).some(m => m.id === empId)
  );

  // Filter tasks assigned to this employee
  const empTasks = allTasks.filter(t => (t.assignees || []).some(a => a.id === empId));

  // Task breakdowns
  const taskPending    = empTasks.filter(t => t.status === "pending").length;
  const taskProgress   = empTasks.filter(t => t.status === "in_progress").length;
  const taskCompleted  = empTasks.filter(t => t.status === "completed").length;
  const taskTotal      = empTasks.length;

  // Attendance today
  const attendance = attendanceMap[empId];
  const isPresent  = attendance?.status === "Present" || attendance?.status === "Late";
  const isLate     = attendance?.status === "Late";
  const prodHours  = attendance?.production_hours ? Number(attendance.production_hours).toFixed(2) : "0.00";
  const checkIn    = attendance?.check_in  || "—";
  const checkOut   = attendance?.check_out || "—";
  const lateMin    = attendance?.late_minutes || 0;

  // Compute overall productivity score:
  // 50% from tasks (completed / total), 50% from production hours (out of 9 hrs)
  const taskScore  = taskTotal > 0 ? Math.round((taskCompleted / taskTotal) * 100) : 0;
  const hoursScore = Math.min(100, Math.round((Number(prodHours) / 9) * 100));
  const overallProd = taskTotal > 0 ? Math.round((taskScore * 0.5) + (hoursScore * 0.5)) : hoursScore;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}/>
      <div className="relative bg-white w-full sm:w-[420px] h-[90vh] sm:h-full rounded-t-3xl sm:rounded-l-3xl sm:rounded-r-none shadow-2xl z-10 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <p className="text-sm font-bold text-gray-800">Employee Details</p>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition"><X size={15}/></button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Profile */}
          <div className="px-5 py-5 border-b border-gray-100">
            <div className="flex items-center gap-4">
              {avatarSrc
                ? <img src={avatarSrc} alt={name} className="w-16 h-16 rounded-2xl object-cover ring-2 ring-white shadow-md"/>
                : <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-md" style={{ backgroundColor: avatarBg }}>{initials}</div>
              }
              <div>
                <p className="text-base font-bold text-gray-900">{name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{emp.employee_id}</p>
                <p className="text-xs font-semibold text-orange-500 mt-0.5">{role}</p>
                <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1 ${isActive ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-green-500" : "bg-gray-400"}`}/>
                  {isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>

          {/* ── Today's Attendance ──────────────────────────────────── */}
          <div className="px-5 py-4 border-b border-gray-100">
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3">Today's Attendance</p>
            {!attendance ? (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs text-gray-400">
                <AlertCircle size={14}/> No attendance record for today
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold ${isPresent ? isLate ? "bg-yellow-50 text-yellow-600 border border-yellow-200" : "bg-green-50 text-green-600 border border-green-200" : "bg-red-50 text-red-600 border border-red-200"}`}>
                    <span className={`w-2 h-2 rounded-full ${isPresent ? isLate ? "bg-yellow-500" : "bg-green-500" : "bg-red-500"}`}/>
                    {attendance.status}
                    {isLate && lateMin > 0 && <span className="ml-1 text-yellow-500 font-normal">({lateMin}m late)</span>}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-gray-50 rounded-xl p-2.5 border border-gray-100">
                    <p className="text-[9px] text-gray-400 font-semibold mb-1">CHECK IN</p>
                    <p className="text-xs font-bold text-gray-700">{checkIn}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-2.5 border border-gray-100">
                    <p className="text-[9px] text-gray-400 font-semibold mb-1">CHECK OUT</p>
                    <p className="text-xs font-bold text-gray-700">{checkOut}</p>
                  </div>
                  <div className="bg-orange-50 rounded-xl p-2.5 border border-orange-100">
                    <p className="text-[9px] text-orange-400 font-semibold mb-1">PROD. HRS</p>
                    <p className="text-xs font-bold text-orange-600">{prodHours} Hrs</p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* ── Overall Productivity ────────────────────────────────── */}
          <div className="px-5 py-4 border-b border-gray-100">
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3">Overall Productivity</p>
            <div className="flex items-center gap-4 mb-3">
              <div className="relative w-16 h-16 shrink-0">
                <svg className="w-16 h-16 -rotate-90" viewBox="0 0 56 56">
                  <circle cx="28" cy="28" r="22" fill="none" stroke="#f1f5f9" strokeWidth="6"/>
                  <circle cx="28" cy="28" r="22" fill="none" stroke={prodColor(overallProd)} strokeWidth="6"
                    strokeDasharray={`${2 * Math.PI * 22}`}
                    strokeDashoffset={`${2 * Math.PI * 22 * (1 - overallProd / 100)}`}
                    strokeLinecap="round"/>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold" style={{ color: prodColor(overallProd) }}>{overallProd}%</span>
                </div>
              </div>
              <div className="flex-1 space-y-1.5">
                <div>
                  <div className="flex justify-between mb-1"><span className="text-[10px] text-gray-400">Task Completion</span><span className="text-[10px] font-bold text-gray-700">{taskScore}%</span></div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className="h-full rounded-full transition-all" style={{ width:`${taskScore}%`, backgroundColor: prodColor(taskScore) }}/></div>
                </div>
                <div>
                  <div className="flex justify-between mb-1"><span className="text-[10px] text-gray-400">Working Hours</span><span className="text-[10px] font-bold text-gray-700">{hoursScore}%</span></div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className="h-full rounded-full transition-all" style={{ width:`${hoursScore}%`, backgroundColor: prodColor(hoursScore) }}/></div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label:"Pending",     val: taskPending,   bg:"#fff7ed", text:"#ea580c" },
                { label:"In Progress", val: taskProgress,  bg:"#eff6ff", text:"#2563eb" },
                { label:"Completed",   val: taskCompleted, bg:"#f0fdf4", text:"#16a34a" },
              ].map(({ label, val, bg, text }) => (
                <div key={label} className="rounded-xl p-2 text-center border" style={{ backgroundColor: bg, borderColor: bg }}>
                  <p className="text-base font-bold" style={{ color: text }}>{val}</p>
                  <p className="text-[9px] font-semibold" style={{ color: text }}>{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Projects ────────────────────────────────────────────── */}
          <div className="px-5 py-4 border-b border-gray-100">
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3">
              Projects <span className="text-gray-400 font-normal ml-1">({empProjects.length})</span>
            </p>
            {empProjects.length === 0 ? (
              <p className="text-xs text-gray-400 py-2">No projects assigned.</p>
            ) : (
              <div className="space-y-2">
                {empProjects.map(p => {
                  const scfg  = PROJECT_STATUS_CFG[p.status] || { label: p.status, bg: "#f8fafc", text: "#64748b" };
                  const pcfg  = PRIORITY_CFG[p.priority]    || { bg: "#f8fafc", text: "#64748b" };
                  const role  = p.project_manager_id === empId ? "Manager" : p.team_leader_id === empId ? "Lead" : "Member";
                  return (
                    <div key={p.id} className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 hover:border-orange-200 hover:bg-orange-50/20 transition-all">
                      <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0">
                        <Layers size={14} className="text-orange-400"/>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-bold text-gray-800 truncate">{p.project_name}</p>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0" style={{ backgroundColor: scfg.bg, color: scfg.text }}>{scfg.label}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded" style={{ backgroundColor: pcfg.bg, color: pcfg.text }}>{p.priority}</span>
                          <span className="text-[9px] text-gray-400">{p.project_code}</span>
                          <span className="text-[9px] bg-orange-50 text-orange-500 px-1.5 py-0.5 rounded font-semibold">{role}</span>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1">Due: {p.end_date}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Tasks ───────────────────────────────────────────────── */}
          <div className="px-5 py-4 pb-8">
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3">
              Tasks <span className="text-gray-400 font-normal ml-1">({empTasks.length})</span>
            </p>
            {empTasks.length === 0 ? (
              <p className="text-xs text-gray-400 py-2">No tasks assigned.</p>
            ) : (
              <div className="space-y-2">
                {empTasks.map(t => {
                  const scfg = TASK_STATUS_CFG[t.status] || { label: t.status, bg: "#f8fafc", text: "#64748b", dot: "#94a3b8" };
                  const pcfg = PRIORITY_CFG[t.priority]  || { bg: "#f8fafc", text: "#64748b" };
                  const due  = t.due_date ? new Date(t.due_date) : null;
                  const now  = new Date();
                  const isOverdue = due && due < now && t.status !== "completed";
                  return (
                    <div key={t.id} className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${isOverdue ? "border-red-200 bg-red-50/30" : "border-gray-100 hover:border-orange-200 hover:bg-orange-50/20"}`}>
                      <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: scfg.dot }}/>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-bold text-gray-800 truncate">{t.title}</p>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0" style={{ backgroundColor: scfg.bg, color: scfg.text }}>{scfg.label}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded" style={{ backgroundColor: pcfg.bg, color: pcfg.text }}>{t.priority}</span>
                          <span className="text-[9px] text-gray-400">{t.project?.project_name}</span>
                        </div>
                        <p className={`text-[10px] mt-1 font-medium ${isOverdue ? "text-red-500" : "text-gray-400"}`}>
                          {isOverdue ? "⚠ Overdue · " : "Due: "}
                          {due ? due.toLocaleDateString("en-GB", { day:"2-digit", month:"short" }) : "—"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── EMPLOYEE CARD ─────────────────────────────────────────────────────
function EmployeeCard({ emp, index, onViewDetails, onEdit, onDelete, attendanceMap, allTasks }) {
  const name         = getFullName(emp);
  const role         = getRole(emp);
  const initials     = getInitials(emp);
  const avatarBg     = AVATAR_COLORS[index % AVATAR_COLORS.length];
  const roleColor    = ROLE_COLORS[index % ROLE_COLORS.length];
  const productivity = getProductivity(emp);
  const avatarSrc    = emp.profile_image || emp.avatar || emp.avatar_url || null;
  const isActive     = emp.status === "active" || emp.status === 1;

  // Attendance today
  const attendance = attendanceMap[emp.id];
  const isPresent  = attendance?.status === "Present" || attendance?.status === "Late";
  const isLate     = attendance?.status === "Late";
  const prodHours  = attendance?.production_hours ? Number(attendance.production_hours).toFixed(2) : null;

  // Task counts for this employee
  const empTasks    = allTasks.filter(t => (t.assignees || []).some(a => a.id === emp.id));
  const taskTotal   = empTasks.length;
  const taskDone    = empTasks.filter(t => t.status === "completed").length;
  const taskPending = empTasks.filter(t => t.status === "pending").length;

  // Computed productivity
  const taskScore   = taskTotal > 0 ? Math.round((taskDone / taskTotal) * 100) : 0;
  const hoursScore  = prodHours ? Math.min(100, Math.round((Number(prodHours) / 9) * 100)) : 0;
  const compProd    = taskTotal > 0 || prodHours ? Math.round((taskScore * 0.5) + (hoursScore * 0.5)) : productivity;
  const displayProd = compProd;

  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 group">
      <div className="flex items-start justify-between mb-3">
        {/* Attendance badge */}
        <div className="flex items-center gap-1.5">
          <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${isActive ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-green-500" : "bg-gray-400"}`}/>
            {isActive ? "Active" : "Inactive"}
          </span>
          {attendance && (
            <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${isPresent ? isLate ? "bg-yellow-50 text-yellow-600" : "bg-green-50 text-green-700" : "bg-red-50 text-red-500"}`}>
              {isPresent ? isLate ? "Late" : "Present" : "Absent"}
            </span>
          )}
        </div>
        <CardMenu onEdit={onEdit} onDelete={onDelete}/>
      </div>

      <div className="flex flex-col items-center text-center mb-4">
        {avatarSrc
          ? <img src={avatarSrc} alt={name} className="w-14 h-14 rounded-full object-cover mb-2.5 ring-2 ring-white shadow-sm"/>
          : <div className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg mb-2.5 shadow-sm" style={{ backgroundColor: avatarBg }}>{initials}</div>
        }
        <p className="text-sm font-bold text-gray-900 leading-tight">{name}</p>
        <p className="text-[10px] text-gray-400 font-medium mt-0.5">{emp.employee_id}</p>
        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full mt-1.5" style={{ color: roleColor, backgroundColor: roleColor + "15" }}>{role}</span>
      </div>

      {/* Task + hours mini stats */}
      <div className="grid grid-cols-3 gap-1.5 mb-3">
        <div className="bg-gray-50 rounded-xl p-2 text-center border border-gray-100">
          <p className="text-[9px] text-gray-400 font-medium mb-0.5">Tasks</p>
          <p className="text-sm font-bold text-gray-800">{taskTotal}</p>
        </div>
        <div className="bg-orange-50 rounded-xl p-2 text-center border border-orange-100">
          <p className="text-[9px] text-orange-400 font-medium mb-0.5">Pending</p>
          <p className="text-sm font-bold text-orange-600">{taskPending}</p>
        </div>
        <div className="bg-green-50 rounded-xl p-2 text-center border border-green-100">
          <p className="text-[9px] text-green-500 font-medium mb-0.5">Done</p>
          <p className="text-sm font-bold text-green-600">{taskDone}</p>
        </div>
      </div>

      {/* Production hours today */}
      {prodHours && (
        <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-indigo-50 border border-indigo-100 mb-3">
          <span className="text-[10px] text-indigo-400 font-medium flex items-center gap-1"><Clock size={10}/>Today's Hours</span>
          <span className="text-[10px] font-bold text-indigo-600">{prodHours} Hrs</span>
        </div>
      )}

      {/* Productivity bar */}
      <div className="mb-3">
        <div className="flex justify-between text-[10px] mb-1">
          <span className="text-gray-400 font-medium">Productivity</span>
          <span style={{ color: prodColor(displayProd) }} className="font-bold">{displayProd}%</span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${displayProd}%`, backgroundColor: prodColor(displayProd) }}/>
        </div>
      </div>

      <button onClick={() => onViewDetails?.(emp)}
        className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold text-orange-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition">
        <Eye size={12}/> View Details
      </button>
    </div>
  );
}

// ── SKELETON ──────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm animate-pulse">
      <div className="flex justify-between mb-3"><div className="w-20 h-4 bg-gray-200 rounded-full"/><div className="w-6 h-6 bg-gray-200 rounded-lg"/></div>
      <div className="flex flex-col items-center mb-4">
        <div className="w-14 h-14 rounded-full bg-gray-200 mb-2"/>
        <div className="h-3 w-24 bg-gray-200 rounded mb-1"/>
        <div className="h-2 w-12 bg-gray-100 rounded mb-1"/>
        <div className="h-4 w-20 bg-gray-100 rounded-full"/>
      </div>
      <div className="grid grid-cols-3 gap-1.5 mb-3">{[1,2,3].map(i=><div key={i} className="h-12 bg-gray-100 rounded-xl"/>)}</div>
      <div className="h-1.5 bg-gray-100 rounded-full mb-3"/>
      <div className="h-7 bg-gray-100 rounded-lg"/>
    </div>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────────────────
export default function EmployeeList({ onViewDetails, onNavigateToDeptDesig }) {
  const [employees,    setEmployees]    = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [search,       setSearch]       = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEmp,   setEditingEmp]   = useState(null);
  const [deletingEmp,  setDeletingEmp]  = useState(null);
  const [detailEmp,    setDetailEmp]    = useState(null);

  // Global data: projects, tasks, attendance
  const [allProjects,   setAllProjects]   = useState([]);
  const [allTasks,      setAllTasks]      = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({}); // keyed by employee.id

  const fetchEmployees = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res  = await fetch(`${BASE}/api/admin/employees`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setEmployees(Array.isArray(data) ? data : (data?.data ?? data?.employees ?? []));
    } catch(err) { setError(err.message || "Failed to load."); }
    finally { setLoading(false); }
  }, []);

  const fetchProjectsAndTasks = useCallback(async () => {
    try {
      const [pr, tr] = await Promise.all([
        fetch(`${BASE}/projects`, { headers: getAuthHeaders() }).then(r => r.json()),
        fetch(`${BASE}/tasks`,    { headers: getAuthHeaders() }).then(r => r.json()),
      ]);
      setAllProjects(Array.isArray(pr) ? pr : pr?.data ?? []);
      setAllTasks(Array.isArray(tr)    ? tr : tr?.data ?? []);
    } catch { /* silent */ }
  }, []);

  const fetchAttendance = useCallback(async () => {
    try {
      const today = todayStr();
      const r = await fetch(`${BASE}/api/admin/attendance/daily?date=${today}`, { headers: getAuthHeaders() });
      const j = await r.json();
      const list = j.data ?? [];
      const map  = {};
      for (const rec of list) map[rec.employee_id] = rec;
      setAttendanceMap(map);
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    fetchEmployees();
    fetchProjectsAndTasks();
    fetchAttendance();
  }, [fetchEmployees, fetchProjectsAndTasks, fetchAttendance]);

  const filtered = employees.filter(e => {
    const q = search.toLowerCase();
    return getFullName(e).toLowerCase().includes(q) || getRole(e).toLowerCase().includes(q);
  });

  const total      = employees.length;
  const active     = employees.filter(e => e.status === "active" || e.status === 1).length;
  const inactive   = total - active;
  const ago30      = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const newJoiners = employees.filter(e => { const d = e.joining_date || e.created_at; return d && new Date(d) >= ago30; }).length;

  // Attendance summary
  const presentToday = Object.values(attendanceMap).filter(a => a.status === "Present" || a.status === "Late").length;
  const absentToday  = total - presentToday;

  const stats = [
    { label: "Total Employees", value: total,        Icon: Users,      bg: "bg-slate-800",   text: "text-slate-100" },
    { label: "Active",          value: active,       Icon: UserCheck,  bg: "bg-emerald-500", text: "text-white" },
    { label: "Present Today",   value: presentToday, Icon: Target,     bg: "bg-blue-500",    text: "text-white" },
    { label: "New Joiners",     value: newJoiners,   Icon: UserPlus,   bg: "bg-orange-500",  text: "text-white" },
  ];

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {stats.map(({ label, value, Icon, bg, text }) => (
          <div key={label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${bg}`}><Icon size={20} className={text}/></div>
            <div>
              <p className="text-[11px] text-gray-400 font-medium">{label}</p>
              <p className="text-xl font-bold text-gray-900">{loading ? "—" : value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-gray-800">Employees Grid</h3>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search employees…"
              className="text-xs border border-gray-200 rounded-lg pl-8 pr-3 py-1.5 outline-none focus:border-orange-400 w-44 bg-white"/>
          </div>
          <button className="flex items-center gap-1.5 text-xs border border-gray-200 rounded-lg px-3 py-1.5 text-gray-500 hover:bg-gray-50 transition">
            <ChevronDown size={12}/> Designation
          </button>
          <button onClick={() => { fetchEmployees(); fetchProjectsAndTasks(); fetchAttendance(); }}
            className="flex items-center justify-center w-8 h-8 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition" title="Refresh">
            <RefreshCw size={13}/>
          </button>
          <button onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-orange-500 hover:bg-orange-600 transition shadow-sm shadow-orange-200">
            <Plus size={14}/> Add Employee
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 mb-4">
          <span className="flex items-center gap-2"><AlertTriangle size={15}/>{error}</span>
          <button onClick={fetchEmployees} className="flex items-center gap-1 text-xs font-semibold underline"><RefreshCw size={11}/>Retry</button>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i}/>)
          : filtered.length === 0
            ? (
              <div className="col-span-4 flex flex-col items-center justify-center py-16 text-gray-400">
                <Users size={40} strokeWidth={1} className="mb-3 text-gray-300"/>
                <p className="text-sm font-medium">{search ? "No employees match your search." : "No employees found."}</p>
              </div>
            )
            : filtered.map((emp, i) => (
              <EmployeeCard
                key={emp.id ?? emp.employee_id ?? i}
                emp={emp}
                index={i}
                allTasks={allTasks}
                attendanceMap={attendanceMap}
                onViewDetails={(e) => setDetailEmp(e)}
                onEdit={() => setEditingEmp(emp)}
                onDelete={() => setDeletingEmp(emp)}
              />
            ))
        }
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddEmployeeModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => fetchEmployees()}
          onNavigate={onNavigateToDeptDesig}
        />
      )}
      {editingEmp && (
        <EditEmployeeModal
          emp={editingEmp}
          onClose={() => setEditingEmp(null)}
          onSuccess={() => { setEditingEmp(null); fetchEmployees(); }}
        />
      )}
      {deletingEmp && (
        <DeleteConfirmModal
          emp={deletingEmp}
          onClose={() => setDeletingEmp(null)}
          onSuccess={() => { setDeletingEmp(null); fetchEmployees(); }}
        />
      )}
      {detailEmp && (
        <EmployeeDetailDrawer
          emp={detailEmp}
          onClose={() => setDetailEmp(null)}
          allProjects={allProjects}
          allTasks={allTasks}
          attendanceMap={attendanceMap}
        />
      )}
    </div>
  );
}
