"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Sun, Moon, Sunset, Clock, Users, Plus, Trash2, Edit3, Save,
  ChevronLeft, ChevronRight, Calendar, AlertTriangle, CheckCircle,
  ArrowLeftRight, Download, ToggleLeft, ToggleRight,
  TrendingUp, Shield, Bell, Zap, X, Check,
  BarChart2, RefreshCw, Star, Loader2,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────
const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const API      = `${BASE_URL}/api/admin/shifts`;

const DAYS     = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

const AVATAR_COLORS = ["#6366f1","#14b8a6","#f97316","#ec4899","#22c55e","#a855f7","#3b82f6","#06b6d4"];

const SHIFT_PRESETS = {
  morning: { label: "Morning", icon: Sun,    color: "#f97316", bg: "#fff7ed", from: "06:00", to: "14:00", break: 30 },
  evening: { label: "Evening", icon: Sunset, color: "#8b5cf6", bg: "#f5f3ff", from: "14:00", to: "22:00", break: 30 },
  night:   { label: "Night",   icon: Moon,   color: "#1e40af", bg: "#eff6ff", from: "22:00", to: "06:00", break: 30 },
};

const SWAP_REQUESTS = [
  { id: 1, from: "Daniel E.", to: "Tom W.",  shift: "Morning", date: "Mon, Apr 21", status: "pending"  },
  { id: 2, from: "Ann L.",    to: "Nina P.", shift: "Evening", date: "Wed, Apr 23", status: "pending"  },
  { id: 3, from: "Mark S.",   to: "Juan H.", shift: "Night",   date: "Thu, Apr 24", status: "approved" },
];

// ─── Auth headers ─────────────────────────────────────────────────────────────
function authHeaders() {
  const token = typeof localStorage !== "undefined" ? localStorage.getItem("admin_auth_token") : "";
  return {
    "Content-Type":               "application/json",
    "Accept":                     "application/json",
    "Authorization":              `Bearer ${token}`,
    "ngrok-skip-browser-warning": "true",
  };
}

// ─── Helper: Get week start date (Monday) based on offset ─────────────────────
// ─── Helper: Get week start date (Monday) based on offset ─────────────────────
function getWeekStartDateFromOffset(offset = 0) {
  const today = new Date();
  // Get current date in Indian timezone (IST)
  const currentDate = new Date(today.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  
  // Apply week offset
  currentDate.setDate(currentDate.getDate() + offset * 7);
  
  // Get the day of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  const dayOfWeek = currentDate.getDay();
  
  // Calculate days to subtract to get Monday
  // If today is Monday (1), subtract 0 days
  // If today is Tuesday (2), subtract 1 day, etc.
  // If today is Sunday (0), subtract 6 days to get previous Monday
  const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  
  const weekStart = new Date(currentDate);
  weekStart.setDate(currentDate.getDate() - daysToSubtract);
  
  return weekStart;
}

// ─── Helper: Format date to YYYY-MM-DD for API ────────────────────────────────
function getWeekStartDate(offset) {
  const weekStart = getWeekStartDateFromOffset(offset);
  return weekStart.toISOString().split('T')[0];
}

// ─── apiToUI ──────────────────────────────────────────────────────────────────
function apiToUI(s) {
  // ── active_days ──
  let days = [false, false, false, false, false, false, false];
  const raw = s.active_days ?? s.days;
  if (Array.isArray(raw)) {
    if (raw.length > 0 && typeof raw[0] === "string" && isNaN(Number(raw[0]))) {
      days = DAY_KEYS.map(k => raw.map(d => d.toLowerCase()).includes(k));
    } else {
      days = raw.map(Boolean).slice(0, 7);
      while (days.length < 7) days.push(false);
    }
  } else if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        if (parsed.length > 0 && typeof parsed[0] === "string" && isNaN(Number(parsed[0]))) {
          days = DAY_KEYS.map(k => parsed.map(d => d.toLowerCase()).includes(k));
        } else {
          days = parsed.map(Boolean).slice(0, 7);
          while (days.length < 7) days.push(false);
        }
      }
    } catch {
      days = raw.split("").slice(0, 7).map(c => c === "1");
    }
  }

  // ── shift type ──
  let type = (s.shift_type || s.type || "").toLowerCase();
  if (!SHIFT_PRESETS[type]) {
    const from = (s.start_time || s.from || "").slice(0, 5);
    if      (from >= "06:00" && from < "14:00") type = "morning";
    else if (from >= "14:00" && from < "22:00") type = "evening";
    else                                          type = "night";
  }

  // ── employees: handle array of objects, array of strings, or just a count ──
  let employees    = [];
  let employeeCount = 0;

  if (typeof s.employees_count === "number") {
    employeeCount = s.employees_count;
  } else if (typeof s.employees_count === "string") {
    employeeCount = parseInt(s.employees_count, 10) || 0;
  }

  if (Array.isArray(s.employees)) {
    employees = s.employees.map(e => {
      if (typeof e === "string") return e;
      if (typeof e === "object" && e !== null) {
        if (e.firstname && e.lastname) return `${e.firstname} ${e.lastname[0]}.`;
        return e.name || e.username || String(e.id || "?");
      }
      return String(e);
    });
    if (employeeCount === 0) employeeCount = employees.length;
  }

  return {
    id:            s.id,
    name:          s.shift_name || s.name || "Unnamed Shift",
    type,
    from:          (s.start_time || s.from || SHIFT_PRESETS[type].from).slice(0, 5),
    to:            (s.end_time   || s.to   || SHIFT_PRESETS[type].to  ).slice(0, 5),
    break:         s.break_time ?? s.break_minutes ?? s.break ?? 30,
    maxEmp:        s.max_employees ?? s.maxEmp ?? 8,
    color:         s.color ?? SHIFT_PRESETS[type]?.color ?? "#f97316",
    days,
    employees,
    employeeCount,
  };
}

// ─── uiToApi ──────────────────────────────────────────────────────────────────
function uiToApi(form) {
  return {
    shift_name:    form.name,
    shift_type:    form.type,
    start_time:    form.from,
    end_time:      form.to,
    break_time:    Number(form.break),
    max_employees: Number(form.maxEmp),
    active_days:   form.days.map((d, i) => d ? DAY_KEYS[i] : null).filter(Boolean),
    color:         form.color,
    status:        "active",
  };
}

// ─── Small UI helpers ─────────────────────────────────────────────────────────
const ShiftBadge = ({ type, small }) => {
  const p = SHIFT_PRESETS[type] || SHIFT_PRESETS.morning;
  const Ic = p.icon;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-semibold ${small ? "text-[10px] px-2 py-0.5" : "text-xs px-2.5 py-1"}`}
      style={{ background: p.bg, color: p.color }}>
      <Ic size={small ? 9 : 11} strokeWidth={2} /> {p.label}
    </span>
  );
};

const Avatar = ({ name, color, size = 26 }) => (
  <div style={{ width: size, height: size, borderRadius: "50%", background: color, fontSize: size * 0.36, color: "#fff", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
    {(name || "?").split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
  </div>
);

const Spinner = ({ size = 16, color = "#f97316" }) => (
  <Loader2 size={size} style={{ color, animation: "spin 1s linear infinite" }} />
);

// ═════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════════════════
export default function ShiftSchedule() {
  const [shifts,             setShifts]             = useState([]);
  const [shiftEmpCounts,     setShiftEmpCounts]      = useState({});   // { shiftId: count }
  const [shiftEmpNames,      setShiftEmpNames]       = useState({});   // { shiftId: ["Name",...] }
  const [loading,            setLoading]             = useState(true);
  const [apiError,           setApiError]            = useState(null);
  const [swaps,              setSwaps]               = useState(SWAP_REQUESTS);
  const [activeTab,          setActiveTab]           = useState("schedule");
  const [weekOffset,         setWeekOffset]          = useState(0);
  const [showAddModal,       setShowAddModal]        = useState(false);
  const [editShift,          setEditShift]           = useState(null);
  const [autoSchedule,       setAutoSchedule]        = useState(false);
  const [notification,       setNotification]        = useState(null);
  const [selectedCell,       setSelectedCell]        = useState(null);
  const [deletingId,         setDeletingId]          = useState(null);
  const [savingShift,        setSavingShift]         = useState(false);
  
  // Stats from API
  const [statsData,          setStatsData]           = useState({
    shiftDistribution: [],
    hoursOverview: { scheduled_hours: 0, worked_hours: 0, overtime_hours: 0, absent_hours: 0 },
    attendanceRate: { on_time: 0, late: 0, early_out: 0, absent: 0 },
    dailyHours: { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 },
  });
  const [statsLoading,       setStatsLoading]        = useState(false);

  // ── Week label (derived from current date) ──────────────────────────────────
  const weekStart = getWeekStartDateFromOffset(weekOffset);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  const fmtDate = d => d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });

  const toast = useCallback((msg, type = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3500);
  }, []);

  // ── Fetch dashboard stats ───────────────────────────────────────────────────
  const fetchDashboardStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const weekStart = getWeekStartDate(weekOffset);
      const res = await fetch(`${BASE_URL}/api/admin/shift-dashboard/stats?week_start=${weekStart}`, { 
        headers: authHeaders() 
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      
      if (json.success) {
        setStatsData({
          shiftDistribution: json.shift_distribution || [],
          hoursOverview: json.hours_overview || { scheduled_hours: 0, worked_hours: 0, overtime_hours: 0, absent_hours: 0 },
          attendanceRate: json.attendance_rate || { on_time: 0, late: 0, early_out: 0, absent: 0 },
          dailyHours: json.daily_hours || { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 },
        });
      }
    } catch (err) {
      console.error("Failed to fetch dashboard stats:", err);
    } finally {
      setStatsLoading(false);
    }
  }, [weekOffset]);

  // ── Fetch employee counts from /api/admin/employees ───────────────────────
  const fetchEmployeeCounts = useCallback(async () => {
    try {
      const res  = await fetch(`${BASE_URL}/api/admin/employees`, { headers: authHeaders() });
      if (!res.ok) return;
      const json = await res.json();
      const all  = Array.isArray(json) ? json : Array.isArray(json.data) ? json.data : [];

      const counts = {};
      const names  = {};

      for (const emp of all) {
        const sid = emp.shift_id ?? emp.shift?.id ?? null;
        if (sid == null) continue;

        counts[sid] = (counts[sid] || 0) + 1;

        const fullName =
          emp.firstname && emp.lastname
            ? `${emp.firstname} ${emp.lastname[0]}.`
            : emp.name || emp.username || `Emp ${emp.id}`;

        if (!names[sid]) names[sid] = [];
        names[sid].push(fullName);
      }

      setShiftEmpCounts(counts);
      setShiftEmpNames(names);
    } catch (err) {
      console.warn("Could not fetch employee counts:", err);
    }
  }, []);

  // ── GET /admin/shifts ─────────────────────────────────────────────────────
  const fetchShifts = useCallback(async () => {
    setLoading(true);
    setApiError(null);
    try {
      const res  = await fetch(API, { headers: authHeaders() });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const raw  = Array.isArray(json) ? json : Array.isArray(json.data) ? json.data : [];
      setShifts(raw.map(apiToUI));
    } catch (err) {
      console.error("GET shifts failed:", err);
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // fetch all data on mount and when week offset changes
  useEffect(() => {
    fetchShifts();
    fetchEmployeeCounts();
    fetchDashboardStats();
  }, [fetchShifts, fetchEmployeeCounts, fetchDashboardStats]);

  // ── helper: get real employee count for a shift ───────────────────────────
  const getEmpCount = useCallback((shift) => {
    if (shiftEmpCounts[shift.id] != null) return shiftEmpCounts[shift.id];
    if (shift.employeeCount > 0) return shift.employeeCount;
    return shift.employees.length;
  }, [shiftEmpCounts]);

  // ── helper: get employee name list for a shift ────────────────────────────
  const getEmpNames = useCallback((shift) => {
    if (shiftEmpNames[shift.id]?.length) return shiftEmpNames[shift.id];
    return shift.employees;
  }, [shiftEmpNames]);

  // ── flatten active_days.0…6 → single key ─────────────────────────────────
  const flattenErrors = (errors) => {
    const mapped = {};
    Object.entries(errors).forEach(([k, msgs]) => {
      const baseKey = k.startsWith("active_days") ? "active_days" : k;
      if (!mapped[baseKey]) mapped[baseKey] = Array.isArray(msgs) ? msgs[0] : msgs;
    });
    return mapped;
  };

  // ── POST ──────────────────────────────────────────────────────────────────
  const createShift = async (form, setFieldErrors) => {
    setSavingShift(true);
    try {
      const payload = uiToApi(form);
      const res  = await fetch(API, { method: "POST", headers: authHeaders(), body: JSON.stringify(payload) });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (json.errors) setFieldErrors(flattenErrors(json.errors));
        const msg = json.errors
          ? Object.entries(json.errors).map(([f, m]) => `${f}: ${Array.isArray(m) ? m.join(", ") : m}`).join(" | ")
          : json.message || `HTTP ${res.status}`;
        throw new Error(msg);
      }
      setShifts(prev => [...prev, apiToUI(json.data ?? json)]);
      toast("Shift created successfully!");
      setShowAddModal(false);
      setEditShift(null);
      fetchDashboardStats();
    } catch (err) {
      toast(`Failed to create: ${err.message}`, "error");
    } finally {
      setSavingShift(false);
    }
  };

  // ── PUT ───────────────────────────────────────────────────────────────────
  const updateShift = async (form, setFieldErrors) => {
    setSavingShift(true);
    try {
      const payload = uiToApi(form);
      const res  = await fetch(`${API}/${form.id}`, { method: "PUT", headers: authHeaders(), body: JSON.stringify(payload) });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (json.errors) setFieldErrors(flattenErrors(json.errors));
        const msg = json.errors
          ? Object.entries(json.errors).map(([f, m]) => `${f}: ${Array.isArray(m) ? m.join(", ") : m}`).join(" | ")
          : json.message || `HTTP ${res.status}`;
        throw new Error(msg);
      }
      const updated = apiToUI(json.data ?? json);
      setShifts(prev => prev.map(s => s.id === updated.id ? updated : s));
      toast("Shift updated successfully!");
      setShowAddModal(false);
      setEditShift(null);
      fetchDashboardStats();
    } catch (err) {
      toast(`Failed to update: ${err.message}`, "error");
    } finally {
      setSavingShift(false);
    }
  };

  // ── DELETE ────────────────────────────────────────────────────────────────
  const deleteShift = async (id) => {
    setDeletingId(id);
    try {
      const res = await fetch(`${API}/${id}`, { method: "DELETE", headers: authHeaders() });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `HTTP ${res.status}`);
      }
      setShifts(prev => prev.filter(s => s.id !== id));
      toast("Shift deleted.", "error");
      fetchDashboardStats();
    } catch (err) {
      toast(`Failed to delete: ${err.message}`, "error");
    } finally {
      setDeletingId(null);
    }
  };

  const saveShift = (form, setFieldErrors) =>
    form.id ? updateShift(form, setFieldErrors) : createShift(form, setFieldErrors);

  const handleSwap = (id, action) => {
    setSwaps(prev => prev.map(s => s.id === id ? { ...s, status: action } : s));
    toast(action === "approved" ? "Swap request approved!" : "Swap request declined.");
  };

  // ── Stats ─────────────────────────────────────────────────────────────────
  const totalAssigned   = Object.values(shiftEmpCounts).reduce((a, b) => a + b, 0)
                          || shifts.reduce((s, sh) => s + getEmpCount(sh), 0);
  const coverageAlert   = shifts.filter(sh => getEmpCount(sh) < Math.ceil(sh.maxEmp * 0.5)).length;
  const pendingSwaps    = swaps.filter(s => s.status === "pending").length;

  return (
    <div className="min-h-full" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      {/* Toast */}
      {notification && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold max-w-sm"
          style={{ background: notification.type === "error" ? "#fef2f2" : "#f0fdf4", color: notification.type === "error" ? "#dc2626" : "#16a34a", border: `1px solid ${notification.type === "error" ? "#fecaca" : "#bbf7d0"}` }}>
          {notification.type === "error" ? <AlertTriangle size={15} className="shrink-0" /> : <CheckCircle size={15} className="shrink-0" />}
          <span className="leading-snug">{notification.msg}</span>
        </div>
      )}

      {/* Stat Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {[
          { icon: Users,          label: "Assigned Employees", value: totalAssigned,   suffix: " total",     color: "#f97316", bg: "#fff7ed" },
          { icon: Shield,         label: "Coverage Alerts",    value: coverageAlert,   suffix: " shifts",    color: "#ef4444", bg: "#fef2f2" },
          { icon: TrendingUp,     label: "Total Shifts",       value: shifts.length,   suffix: " active",    color: "#8b5cf6", bg: "#f5f3ff" },
          { icon: ArrowLeftRight, label: "Pending Swaps",      value: pendingSwaps,    suffix: " requests",  color: "#06b6d4", bg: "#ecfeff" },
        ].map(({ icon: Ic, label, value, suffix, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: bg }}>
              <Ic size={20} style={{ color }} strokeWidth={1.8} />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">{label}</p>
              <p className="text-xl font-extrabold text-gray-800 leading-tight">
                {loading ? <Spinner size={14} /> : value}
                <span className="text-xs font-medium text-gray-400 ml-1">{suffix}</span>
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Tab Bar */}
      <div className="flex items-center gap-1 bg-white rounded-xl p-1 border border-gray-100 mb-5 w-fit shadow-sm">
        {[
          { id: "schedule",  label: "Weekly Schedule", icon: Calendar  },
          { id: "config",    label: "Shift Config",    icon: Clock     },
          { id: "analytics", label: "Analytics",       icon: BarChart2 },
        ].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${activeTab === t.id ? "bg-orange-500 text-white shadow-sm" : "text-gray-500 hover:bg-gray-50"}`}>
            <t.icon size={13} strokeWidth={2} /> {t.label}
          </button>
        ))}
        <button
          onClick={() => { fetchShifts(); fetchEmployeeCounts(); fetchDashboardStats(); }}
          disabled={loading}
          className="ml-1 w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 disabled:opacity-40">
          {loading ? <Spinner size={13} /> : <RefreshCw size={13} />}
        </button>
      </div>

      {/* API Error Banner */}
      {apiError && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5 text-sm text-red-600 font-medium">
          <AlertTriangle size={15} />
          <span>Could not load shifts: {apiError}</span>
          <button onClick={fetchShifts} className="ml-auto flex items-center gap-1.5 text-xs font-bold text-red-600 hover:underline">
            <RefreshCw size={11} /> Retry
          </button>
        </div>
      )}

      {/* ════ TAB 1 — WEEKLY SCHEDULE ════ */}
      {activeTab === "schedule" && (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-5">
          <div className="xl:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
              <div className="flex items-center gap-3">
                <button onClick={() => setWeekOffset(w => w - 1)} className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50">
                  <ChevronLeft size={14} />
                </button>
                <span className="text-sm font-bold text-gray-800">{fmtDate(weekStart)} – {fmtDate(weekEnd)}</span>
                <button onClick={() => setWeekOffset(w => w + 1)} className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50">
                  <ChevronRight size={14} />
                </button>
                <button onClick={() => setWeekOffset(0)} className="text-xs text-orange-500 font-semibold hover:underline ml-1">Today</button>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600">
                  <Zap size={12} className="text-yellow-500" />
                  Auto-Schedule
                  <button onClick={() => { setAutoSchedule(v => !v); toast(autoSchedule ? "Auto-schedule OFF" : "Auto-schedule ON!"); }}
                    className={`transition-colors ${autoSchedule ? "text-orange-500" : "text-gray-400"}`}>
                    {autoSchedule ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                  </button>
                </div>
                <button onClick={() => toast("Schedule exported!")} className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50">
                  <Download size={12} /> Export
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20 gap-3 text-gray-400 text-sm">
                <Spinner size={18} /> Loading shifts…
              </div>
            ) : shifts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
                <Clock size={32} className="text-gray-200" />
                <p className="text-sm font-semibold">No shifts found</p>
                <button onClick={() => { setEditShift(null); setShowAddModal(true); }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 text-white rounded-xl text-xs font-bold hover:bg-orange-600">
                  <Plus size={12} /> Create First Shift
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left px-4 py-3 text-gray-400 font-semibold w-36">Shift</th>
                      {DAYS.map((d, i) => {
                        const dt = new Date(weekStart);
                        dt.setDate(dt.getDate() + i);
                        const isToday = weekOffset === 0 && dt.toDateString() === new Date().toDateString();
                        return (
                          <th key={d} className="text-center px-2 py-3 font-semibold" style={{ minWidth: 90 }}>
                            <div className={`flex flex-col items-center gap-0.5 ${isToday ? "text-orange-500" : "text-gray-500"}`}>
                              <span>{d}</span>
                              <span className={`text-[11px] font-bold w-6 h-6 flex items-center justify-center rounded-full ${isToday ? "bg-orange-500 text-white" : "text-gray-700"}`}>{dt.getDate()}</span>
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {shifts.map((shift) => {
                      const preset   = SHIFT_PRESETS[shift.type] || SHIFT_PRESETS.morning;
                      const empCount = getEmpCount(shift);
                      const empNames = getEmpNames(shift);

                      return (
                        <tr key={shift.id} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-8 rounded-full" style={{ background: shift.color }} />
                              <div>
                                <p className="font-semibold text-gray-800">{shift.name}</p>
                                <p className="text-[10px] text-gray-400">{shift.from} – {shift.to}</p>
                              </div>
                            </div>
                          </td>
                          {DAYS.map((_, di) => {
                            const active     = shift.days[di];
                            const isSelected = selectedCell?.shiftId === shift.id && selectedCell?.dayIndex === di;
                            const cellCount  = active ? empCount : 0;
                            const isUnder    = active && cellCount < Math.ceil(shift.maxEmp * 0.5);

                            return (
                              <td key={di} className="px-1.5 py-2 text-center align-top">
                                {active ? (
                                  <div
                                    onClick={() => setSelectedCell(isSelected ? null : { shiftId: shift.id, dayIndex: di })}
                                    className={`rounded-xl p-2 cursor-pointer border transition-all ${isSelected ? "border-orange-400 shadow-md" : "border-transparent hover:border-gray-200"}`}
                                    style={{ background: isSelected ? preset.bg : isUnder ? "#fef2f2" : undefined }}
                                  >
                                    <div className="flex justify-center -space-x-1.5 mb-1.5">
                                      {Array.from({ length: Math.min(3, cellCount) }).map((_, ei) => {
                                        const name  = empNames[ei] || "";
                                        const color = AVATAR_COLORS[ei % AVATAR_COLORS.length];
                                        return (
                                          <div key={ei} style={{ border: "2px solid #fff", borderRadius: "50%" }}>
                                            <Avatar name={name || "?"} color={color} size={22} />
                                          </div>
                                        );
                                      })}
                                      {cellCount > 3 && (
                                        <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#f1f5f9", fontSize: 9, fontWeight: 700, color: "#64748b", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #fff" }}>
                                          +{cellCount - 3}
                                        </div>
                                      )}
                                    </div>
                                    <div className={`text-[10px] font-semibold ${isUnder ? "text-red-500" : "text-gray-500"}`}>
                                      {isUnder && <AlertTriangle size={8} className="inline mr-0.5" />}
                                      {cellCount}/{shift.maxEmp}
                                    </div>
                                    <button className="mt-1 w-full flex items-center justify-center gap-0.5 text-[10px] text-orange-400 hover:text-orange-600 font-semibold">
                                      <Plus size={9} /> Add
                                    </button>
                                  </div>
                                ) : (
                                  <div className="rounded-xl p-3 bg-gray-50 border border-dashed border-gray-200 text-[10px] text-gray-300 font-medium">Off</div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Right panel */}
          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold text-gray-700">Active Shifts</p>
                <button onClick={() => { setEditShift(null); setShowAddModal(true); }}
                  className="flex items-center gap-1 text-[11px] text-orange-500 font-semibold hover:bg-orange-50 px-2 py-1 rounded-lg">
                  <Plus size={11} /> New
                </button>
              </div>
              {loading && <div className="flex items-center justify-center py-6 text-gray-300"><Spinner /></div>}
              <div className="space-y-2">
                {shifts.map(sh => {
                  const count = getEmpCount(sh);
                  return (
                    <div key={sh.id} className="flex items-center justify-between p-2.5 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors group">
                      <div className="flex items-center gap-2.5">
                        <div className="w-2.5 h-8 rounded-full" style={{ background: sh.color }} />
                        <div>
                          <p className="text-xs font-semibold text-gray-800">{sh.name}</p>
                          <p className="text-[10px] text-gray-400">{sh.from}–{sh.to}</p>
                          <p className="text-[10px] text-gray-400">{count}/{sh.maxEmp} emp</p>
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setEditShift(sh); setShowAddModal(true); }}
                          className="w-6 h-6 rounded-lg flex items-center justify-center bg-blue-50 text-blue-500 hover:bg-blue-100">
                          <Edit3 size={10} />
                        </button>
                        <button onClick={() => deleteShift(sh.id)} disabled={deletingId === sh.id}
                          className="w-6 h-6 rounded-lg flex items-center justify-center bg-red-50 text-red-400 hover:bg-red-100 disabled:opacity-40">
                          {deletingId === sh.id ? <Spinner size={10} color="#ef4444" /> : <Trash2 size={10} />}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Swap Requests */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center gap-2 mb-3">
                <ArrowLeftRight size={13} className="text-orange-500" />
                <p className="text-xs font-bold text-gray-700">Swap Requests</p>
                {pendingSwaps > 0 && <span className="ml-auto text-[10px] bg-orange-500 text-white rounded-full px-1.5 py-0.5 font-bold">{pendingSwaps}</span>}
              </div>
              <div className="space-y-2">
                {swaps.map(sw => (
                  <div key={sw.id} className="p-2.5 rounded-xl border border-gray-100 text-[11px]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-gray-700">{sw.from} → {sw.to}</span>
                      <ShiftBadge type={sw.shift.toLowerCase()} small />
                    </div>
                    <p className="text-gray-400 mb-2">{sw.date}</p>
                    {sw.status === "pending" ? (
                      <div className="flex gap-1.5">
                        <button onClick={() => handleSwap(sw.id, "approved")}
                          className="flex-1 flex items-center justify-center gap-1 py-1 rounded-lg bg-green-50 text-green-600 font-semibold hover:bg-green-100">
                          <Check size={10} /> Approve
                        </button>
                        <button onClick={() => handleSwap(sw.id, "declined")}
                          className="flex-1 flex items-center justify-center gap-1 py-1 rounded-lg bg-red-50 text-red-500 font-semibold hover:bg-red-100">
                          <X size={10} /> Decline
                        </button>
                      </div>
                    ) : (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${sw.status === "approved" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-400"}`}>
                        {sw.status.charAt(0).toUpperCase() + sw.status.slice(1)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {coverageAlert > 0 && (
              <div className="bg-red-50 rounded-2xl border border-red-100 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle size={14} className="text-red-500" />
                  <p className="text-xs font-bold text-red-600">Coverage Alerts</p>
                </div>
                {shifts.filter(sh => getEmpCount(sh) < Math.ceil(sh.maxEmp * 0.5)).map(sh => (
                  <div key={sh.id} className="text-[11px] text-red-500 font-medium mb-1">
                    ⚠ {sh.name}: only {getEmpCount(sh)}/{sh.maxEmp} filled
                  </div>
                ))}
                <button onClick={() => toast("AI auto-filled understaffed shifts!")}
                  className="mt-2 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-red-500 text-white text-[11px] font-bold hover:bg-red-600">
                  <Zap size={11} /> Auto-Fill with AI
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ════ TAB 2 — SHIFT CONFIGURATION ════ */}
      {activeTab === "config" && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <div className="xl:col-span-1 space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-bold text-gray-800">All Shifts</p>
                <button onClick={() => { setEditShift(null); setShowAddModal(true); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 text-white rounded-lg text-xs font-bold hover:bg-orange-600 shadow-sm">
                  <Plus size={12} /> Add Shift
                </button>
              </div>
              {loading ? (
                <div className="flex items-center justify-center py-10 gap-2 text-gray-300 text-xs"><Spinner size={14} /> Loading…</div>
              ) : shifts.length === 0 ? (
                <p className="text-center text-xs text-gray-400 py-8">No shifts yet. Create one!</p>
              ) : (
                shifts.map(sh => (
                  <div key={sh.id}
                    className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 hover:border-orange-200 transition-colors mb-3 cursor-pointer group"
                    onClick={() => { setEditShift(sh); setShowAddModal(true); }}>
                    <div className="w-3 h-12 rounded-full mt-0.5 shrink-0" style={{ background: sh.color }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-gray-800">{sh.name}</p>
                        <ShiftBadge type={sh.type} small />
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{sh.from} → {sh.to} · {sh.break}m break</p>
                      <div className="flex gap-0.5 mt-2">
                        {DAYS.map((d, i) => (
                          <span key={d} className={`text-[9px] w-5 h-5 rounded flex items-center justify-center font-bold ${sh.days[i] ? "bg-orange-50 text-orange-500 border border-orange-200" : "bg-gray-50 text-gray-300 border border-gray-100"}`}>{d}</span>
                        ))}
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-[10px] text-gray-400">
                          <Users size={9} className="inline mr-0.5" />
                          {getEmpCount(sh)}/{sh.maxEmp} assigned
                        </span>
                      </div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); deleteShift(sh.id); }} disabled={deletingId === sh.id}
                      className="opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 rounded-lg flex items-center justify-center bg-red-50 text-red-400 hover:bg-red-100 shrink-0 disabled:opacity-40">
                      {deletingId === sh.id ? <Spinner size={10} color="#ef4444" /> : <Trash2 size={10} />}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="xl:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <Calendar size={15} className="text-orange-500" />
                <p className="text-sm font-bold text-gray-800">Employee Availability</p>
                <span className="ml-auto text-xs text-gray-400">This Week</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr>
                      <th className="text-left pb-2 text-gray-400 font-medium w-28">Employee</th>
                      {DAYS.map(d => <th key={d} className="text-center pb-2 text-gray-400 font-medium">{d}</th>)}
                      <th className="text-center pb-2 text-gray-400 font-medium">Hours</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(shiftEmpNames).flatMap(([sid, names]) =>
                      names.map((name, ni) => {
                        const shift = shifts.find(s => String(s.id) === String(sid));
                        return (
                          <tr key={`${sid}-${ni}`} className="border-t border-gray-50">
                            <td className="py-2">
                              <div className="flex items-center gap-2">
                                <Avatar name={name} color={AVATAR_COLORS[ni % AVATAR_COLORS.length]} size={22} />
                                <span className="font-semibold text-gray-700">{name}</span>
                              </div>
                            </td>
                            {DAYS.map((_, di) => {
                              const active = shift?.days[di];
                              const pr     = shift ? (SHIFT_PRESETS[shift.type] || SHIFT_PRESETS.morning) : null;
                              return (
                                <td key={di} className="text-center py-2">
                                  {active && pr ? (
                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-md text-[9px] font-bold" style={{ background: pr.bg, color: pr.color }}>
                                      <pr.icon size={10} />
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-gray-50 text-gray-300 text-[9px]">—</span>
                                  )}
                                </td>
                              );
                            })}
                            <td className="text-center py-2">
                              <span className="text-xs font-bold text-gray-600">
                                {shift ? shift.days.filter(Boolean).length * 8 : 0}h
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                    {Object.keys(shiftEmpNames).length === 0 && (
                      <tr>
                        <td colSpan={9} className="text-center text-xs text-gray-400 py-8">
                          {loading ? "Loading…" : "No employees assigned to shifts yet."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-50 text-[10px] text-gray-400 font-medium">
                {[{ icon: Sun, color: "#f97316", bg: "#fff7ed", label: "Morning" }, { icon: Sunset, color: "#8b5cf6", bg: "#f5f3ff", label: "Evening" }, { icon: Moon, color: "#1e40af", bg: "#eff6ff", label: "Night" }].map(({ icon: Ic, color, bg, label }) => (
                  <span key={label} className="flex items-center gap-1">
                    <span className="w-5 h-5 rounded flex items-center justify-center" style={{ background: bg }}><Ic size={10} style={{ color }} /></span>{label}
                  </span>
                ))}
                <span className="flex items-center gap-1"><span className="w-5 h-5 rounded bg-gray-50 flex items-center justify-center text-gray-300 text-[9px]">—</span> Unassigned day</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <Star size={15} className="text-orange-500" />
                <p className="text-sm font-bold text-gray-800">Quick Templates</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { name: "5-Day Morning",   type: "morning", desc: "Mon–Fri 06:00–14:00", days: [1,1,1,1,1,0,0] },
                  { name: "Weekend Evening", type: "evening", desc: "Sat–Sun 14:00–22:00", days: [0,0,0,0,0,1,1] },
                  { name: "Night Rotation",  type: "night",   desc: "Mon–Fri 22:00–06:00", days: [1,1,1,1,1,0,0] },
                  { name: "Full Week",       type: "morning", desc: "7 days 09:00–17:00",  days: [1,1,1,1,1,1,1] },
                  { name: "Split Shift",     type: "evening", desc: "Mon–Wed + Fri",        days: [1,1,1,0,1,0,0] },
                  { name: "On-call Night",   type: "night",   desc: "Flexible overnight",   days: [1,0,1,0,1,0,0] },
                ].map((tpl, i) => {
                  const pr = SHIFT_PRESETS[tpl.type];
                  return (
                    <div key={i} className="p-3 rounded-xl border border-gray-100 hover:border-orange-200 hover:shadow-sm transition-all cursor-pointer group"
                      onClick={() => {
                        setEditShift({ type: tpl.type, name: tpl.name, from: pr.from, to: pr.to, break: pr.break, maxEmp: 8, days: tpl.days.map(Boolean), color: pr.color });
                        setShowAddModal(true);
                      }}>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform" style={{ background: pr.bg }}>
                        <pr.icon size={15} style={{ color: pr.color }} />
                      </div>
                      <p className="text-xs font-bold text-gray-700">{tpl.name}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{tpl.desc}</p>
                      <div className="flex gap-0.5 mt-2">
                        {tpl.days.map((d, di) => (
                          <span key={di} className={`text-[8px] w-4 h-4 rounded flex items-center justify-center font-bold ${d ? "text-white" : "bg-gray-50 text-gray-300"}`} style={d ? { background: pr.color } : {}}>{DAYS[di][0]}</span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════ TAB 3 — ANALYTICS ════ */}
      {activeTab === "analytics" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Shift Distribution */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-sm font-bold text-gray-800 mb-4">Shift Distribution</p>
            {statsLoading ? (
              <div className="flex justify-center py-8"><Spinner /></div>
            ) : statsData.shiftDistribution.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-8">No data yet</p>
            ) : (
              statsData.shiftDistribution.map((shift, idx) => {
                const shiftType = shift.shift_name?.toLowerCase() || "morning";
                const pr = SHIFT_PRESETS[shiftType] || SHIFT_PRESETS.morning;
                return (
                  <div key={idx} className="mb-4">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <div className="flex items-center gap-2">
                        <pr.icon size={12} style={{ color: pr.color }} />
                        <span className="font-semibold text-gray-700">{shift.shift_name}</span>
                      </div>
                      <span className="font-bold" style={{ color: pr.color }}>{shift.employees} emp</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${shift.percentage}%`, background: pr.color }} />
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">{shift.percentage}% of assigned workforce</p>
                  </div>
                );
              })
            )}
          </div>

          {/* Hours Overview */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-sm font-bold text-gray-800 mb-4">Hours Overview This Week</p>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                { label: "Total Scheduled", value: statsData.hoursOverview.scheduled_hours, unit: "h", color: "#f97316" },
                { label: "Actual Worked",   value: statsData.hoursOverview.worked_hours,   unit: "h", color: "#22c55e" },
                { label: "Overtime",        value: statsData.hoursOverview.overtime_hours, unit: "h", color: "#ef4444" },
                { label: "Absent Hours",    value: statsData.hoursOverview.absent_hours,   unit: "h", color: "#eab308" },
              ].map(({ label, value, unit, color }) => (
                <div key={label} className="p-3 rounded-xl border border-gray-100">
                  <p className="text-[10px] text-gray-400 mb-1">{label}</p>
                  <p className="text-xl font-extrabold" style={{ color }}>
                    {statsLoading ? <Spinner size={14} /> : value}
                    <span className="text-xs ml-0.5">{unit}</span>
                  </p>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 font-semibold mb-2">Daily Hours</p>
            <div className="flex items-end gap-1.5 h-20">
              {DAYS.map(day => {
                const hours = statsData.dailyHours[day] || 0;
                const maxHours = Math.max(...Object.values(statsData.dailyHours), 1);
                const height = (hours / maxHours) * 68;
                return (
                  <div key={day} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full rounded-t-sm" style={{ height: `${height}px`, background: day === "Sat" || day === "Sun" ? "#e2e8f0" : "#f97316", opacity: day === "Sat" || day === "Sun" ? 0.5 : 1 }} />
                    <span className="text-[9px] text-gray-400">{day}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Attendance Rate */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-sm font-bold text-gray-800 mb-4">Attendance Rate This Week</p>
            {statsLoading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Spinner size={24} />
              </div>
            ) : (
              <>
                <div className="flex flex-col items-center mb-4">
                  <div className="relative w-32 h-32">
                    <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                      <circle cx={60} cy={60} r={50} fill="none" stroke="#f1f5f9" strokeWidth={14} />
                      <circle 
                        cx={60} cy={60} r={50} fill="none" stroke="#f97316" strokeWidth={14}
                        strokeDasharray={`${(statsData.attendanceRate.on_time / 100) * 314} ${314}`} 
                        strokeLinecap="round" 
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-extrabold text-gray-800">{statsData.attendanceRate.on_time}%</span>
                      <span className="text-[10px] text-gray-400">On Time</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  {[
                    { label: "On Time",   pct: statsData.attendanceRate.on_time,    color: "#22c55e" },
                    { label: "Late",      pct: statsData.attendanceRate.late,       color: "#eab308" },
                    { label: "Early Out", pct: statsData.attendanceRate.early_out,  color: "#f97316" },
                    { label: "Absent",    pct: statsData.attendanceRate.absent,     color: "#ef4444" },
                  ].map(({ label, pct, color }) => (
                    <div key={label} className="flex items-center gap-3 text-xs">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
                      <span className="flex-1 text-gray-500">{label}</span>
                      <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                      </div>
                      <span className="font-bold text-gray-700 w-7 text-right">{pct}%</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-sm font-bold text-gray-800 mb-4">Recent Activity</p>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
              {[
                { icon: CheckCircle,    color: "#22c55e", bg: "#f0fdf4", text: "Shift schedule updated",            time: "Today 06:02 AM" },
                { icon: ArrowLeftRight, color: "#8b5cf6", bg: "#f5f3ff", text: "Shift swap approved: Ann → Nina",   time: "Today 08:15 AM" },
                { icon: AlertTriangle,  color: "#ef4444", bg: "#fef2f2", text: "Coverage alert on Night Shift",     time: "Today 10:00 AM" },
                { icon: Bell,           color: "#f97316", bg: "#fff7ed", text: "Reminder: Evening Shift at 14:00",  time: "Today 13:30 PM" },
              ].map(({ icon: Ic, color, bg, text, time }, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl border border-gray-100">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: bg }}>
                    <Ic size={14} style={{ color }} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-700 font-medium leading-snug">{text}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <ShiftModal
          initial={editShift}
          saving={savingShift}
          onSave={saveShift}
          onClose={() => { setShowAddModal(false); setEditShift(null); }}
        />
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// SHIFT MODAL
// ═════════════════════════════════════════════════════════════════════════════
function ShiftModal({ initial, saving, onSave, onClose }) {
  const isEdit = !!(initial?.id);

  const [form, setForm] = useState({
    id:        initial?.id        ?? null,
    name:      initial?.name      ?? "",
    type:      initial?.type      ?? "morning",
    from:      (initial?.from     ?? "06:00").slice(0, 5),
    to:        (initial?.to       ?? "14:00").slice(0, 5),
    break:     initial?.break     ?? 30,
    maxEmp:    initial?.maxEmp    ?? 8,
    color:     initial?.color     ?? "#f97316",
    days:      initial?.days      ?? [true, true, true, true, true, false, false],
    employees: initial?.employees ?? [],
  });

  const [fieldErrors, setFieldErrors] = useState({});

  const set = (key, val) => {
    setForm(f => ({ ...f, [key]: val }));
    setFieldErrors(e => ({ ...e, [key]: null }));
  };

  const toggleDay = (i) => {
    setForm(f => ({ ...f, days: f.days.map((d, di) => di === i ? !d : d) }));
    setFieldErrors(e => ({ ...e, active_days: null }));
  };

  const applyPreset = (type) => {
    const p = SHIFT_PRESETS[type];
    setForm(f => ({ ...f, type, from: p.from, to: p.to, color: p.color }));
    setFieldErrors(e => ({ ...e, shift_type: null }));
  };

  const calcDuration = () => {
    const [fh, fm] = form.from.split(":").map(Number);
    const [th, tm] = form.to.split(":").map(Number);
    let mins = (th * 60 + tm) - (fh * 60 + fm);
    if (mins <= 0) mins += 24 * 60;
    const net = mins - Number(form.break);
    return {
      total: `${Math.floor(mins / 60)}h ${mins % 60}m`,
      net:   `${Math.floor(net  / 60)}h ${net  % 60}m`,
    };
  };

  const { total: durationTotal, net: durationNet } = calcDuration();
  const activeDayCount = form.days.filter(Boolean).length;
  const canSave        = form.name.trim().length > 0 && activeDayCount > 0 && !saving;
  const previewPayload = uiToApi(form);

  const FieldError = ({ field }) =>
    fieldErrors[field] ? (
      <p className="flex items-center gap-1 text-[10px] text-red-500 mt-1 font-medium">
        <AlertTriangle size={9} /> {fieldErrors[field]}
      </p>
    ) : null;

  const hasErrors = Object.values(fieldErrors).some(Boolean);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: SHIFT_PRESETS[form.type]?.bg }}>
              {(() => { const Ic = SHIFT_PRESETS[form.type]?.icon || Sun; return <Ic size={18} style={{ color: SHIFT_PRESETS[form.type]?.color }} />; })()}
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">{isEdit ? "Edit Shift" : "Create New Shift"}</p>
              <p className="text-[10px] text-gray-400 font-mono">
                {isEdit ? `PUT /api/admin/shifts/${form.id}` : "POST /api/admin/shifts"}
              </p>
            </div>
          </div>
          <button onClick={onClose} disabled={saving}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 disabled:opacity-40">
            <X size={16} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">

          {hasErrors && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <div className="flex items-center gap-2 mb-2 text-xs font-bold text-red-600">
                <AlertTriangle size={13} /> Please fix the errors below
              </div>
              <ul className="space-y-0.5">
                {Object.entries(fieldErrors).filter(([, v]) => v).map(([k, v]) => (
                  <li key={k} className="text-[11px] text-red-500 font-medium">• {k}: {v}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Shift Name */}
          <div>
            <label className="text-xs font-bold text-gray-600 mb-1.5 block">
              Shift Name <span className="text-red-400">*</span>
            </label>
            <input
              value={form.name}
              onChange={e => set("name", e.target.value)}
              placeholder="e.g. Morning Shift A"
              autoFocus
              className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none transition-all"
              style={{
                borderColor: fieldErrors.shift_name ? "#fca5a5" : form.name.trim() ? "#d1fae5" : "#fca5a5",
                boxShadow:   fieldErrors.shift_name ? "0 0 0 2px #fca5a510" : form.name.trim() ? "0 0 0 2px #d1fae510" : "0 0 0 2px #fca5a510",
              }}
            />
            {!form.name.trim() && <p className="text-[10px] text-red-400 mt-1 font-medium">Shift name is required</p>}
            <FieldError field="shift_name" />
          </div>

          {/* Shift Type */}
          <div>
            <label className="text-xs font-bold text-gray-600 mb-2 block">Shift Type</label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(SHIFT_PRESETS).map(([key, p]) => (
                <button key={key} onClick={() => applyPreset(key)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-xs font-semibold transition-all ${form.type === key ? "border-orange-400 shadow-sm" : "border-gray-100 hover:border-gray-200"}`}
                  style={form.type === key ? { background: p.bg } : {}}>
                  <p.icon size={18} style={{ color: form.type === key ? p.color : "#9ca3af" }} />
                  <span style={{ color: form.type === key ? p.color : "#6b7280" }}>{p.label}</span>
                  <span className="text-[10px] text-gray-400">{p.from}–{p.to}</span>
                </button>
              ))}
            </div>
            <FieldError field="shift_type" />
          </div>

          {/* Timing */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-600 mb-1.5 block">Start Time</label>
              <input type="time" value={form.from} onChange={e => set("from", e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-orange-50 transition-all ${fieldErrors.start_time ? "border-red-300" : "border-gray-200 focus:border-orange-400"}`} />
              <FieldError field="start_time" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 mb-1.5 block">End Time</label>
              <input type="time" value={form.to} onChange={e => set("to", e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-orange-50 transition-all ${fieldErrors.end_time ? "border-red-300" : "border-gray-200 focus:border-orange-400"}`} />
              <FieldError field="end_time" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 mb-1.5 block">Break (min)</label>
              <input type="number" value={form.break} min={0} max={120} onChange={e => set("break", +e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-orange-50 transition-all ${fieldErrors.break_time ? "border-red-300" : "border-gray-200 focus:border-orange-400"}`} />
              <FieldError field="break_time" />
            </div>
          </div>

          {/* Duration pill */}
          <div className="flex items-center gap-2 px-3 py-2 bg-orange-50 rounded-xl text-xs font-semibold text-orange-600 border border-orange-100">
            <Clock size={13} />
            Duration: <strong>{durationTotal}</strong>
            <span className="text-orange-400 ml-1">· Net: {durationNet}</span>
          </div>

          {/* Max Employees */}
          <div>
            <label className="text-xs font-bold text-gray-600 mb-1.5 block">Max Employees</label>
            <input type="number" value={form.maxEmp} min={1} max={50} onChange={e => set("maxEmp", +e.target.value)}
              className={`w-full px-3 py-2 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-orange-50 transition-all ${fieldErrors.max_employees ? "border-red-300" : "border-gray-200 focus:border-orange-400"}`} />
            <FieldError field="max_employees" />
          </div>

          {/* Active Days */}
          <div>
            <label className="text-xs font-bold text-gray-600 mb-2 block">
              Active Days <span className="text-red-400">*</span>
            </label>
            <div className="flex gap-1.5">
              {DAYS.map((d, i) => (
                <button key={d} onClick={() => toggleDay(i)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border-2 transition-all ${
                    form.days[i]
                      ? "border-orange-400 text-white"
                      : fieldErrors.active_days
                        ? "border-red-200 text-gray-400 hover:border-red-300"
                        : "border-gray-100 text-gray-400 hover:border-gray-200"
                  }`}
                  style={form.days[i] ? { background: form.color } : {}}>
                  {d}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-gray-400 mt-1.5 font-medium">
              {activeDayCount} day{activeDayCount !== 1 ? "s" : ""} selected
              {activeDayCount > 0 && (
                <span className="ml-1 text-orange-400">→ [{previewPayload.active_days.join(", ")}]</span>
              )}
            </p>
            {activeDayCount === 0 && <p className="text-[10px] text-red-400 mt-0.5 font-medium">At least one day must be selected</p>}
            <FieldError field="active_days" />
          </div>

          {/* API payload preview */}
          <details className="text-[10px] text-gray-400 border border-gray-100 rounded-xl overflow-hidden">
            <summary className="px-3 py-2 cursor-pointer font-semibold hover:bg-gray-50 select-none">
              📦 Preview API payload (live)
            </summary>
            <pre className="px-3 py-2 bg-gray-50 overflow-x-auto text-[10px] text-gray-500 leading-relaxed">
              {JSON.stringify(previewPayload, null, 2)}
            </pre>
          </details>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-50 bg-gray-50/50">
          <button onClick={onClose} disabled={saving}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-100 border border-gray-200 disabled:opacity-40">
            Cancel
          </button>
          <button
            onClick={() => { if (canSave) onSave(form, setFieldErrors); }}
            disabled={!canSave}
            className="flex items-center gap-2 px-5 py-2 bg-orange-500 text-white rounded-xl text-sm font-bold hover:bg-orange-600 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all">
            {saving
              ? <><Spinner size={14} color="#fff" /> {isEdit ? "Updating…" : "Creating…"}</>
              : <><Save size={14} /> {isEdit ? "Update Shift" : "Create Shift"}</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}