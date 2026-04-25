"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Calendar, Search, FileText, Edit2, Clock,
  CheckCircle2, XCircle, AlertCircle, ChevronLeft,
  ChevronRight, RefreshCw, Users, BarChart2,
  UserCheck, UserX, Timer,
} from "lucide-react";

// ── Config ────────────────────────────────────────────────────────────────────
const API_BASE = process.env.NEXT_PUBLIC_API_URL;
const getToken = () => localStorage.getItem("auth_token") ?? "";

// ── Helpers ───────────────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  "#6366f1","#f97316","#14b8a6","#a855f7","#ec4899",
  "#0ea5e9","#f43f5e","#84cc16","#eab308","#64748b",
];
function initials(name = "") {
  const parts = name.trim().split(" ");
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase();
}
function avatarColor(id) { return AVATAR_COLORS[(id ?? 0) % AVATAR_COLORS.length]; }
function fmtMinutes(val) {
  if (!val || val === 0) return "—";
  return `${Math.round(Number(val))} Min`;
}
function fmtHours(val) {
  if (!val || val === 0) return "0.00";
  return Number(val).toFixed(2);
}
function hoursColor(val) {
  const h = Number(val);
  if (h === 0) return { bg:"#fef2f2", text:"#ef4444", bar:"#ef4444" };
  if (h >= 8)  return { bg:"#f0fdf4", text:"#16a34a", bar:"#22c55e" };
  if (h >= 5)  return { bg:"#fffbeb", text:"#d97706", bar:"#f59e0b" };
  return       { bg:"#fff7ed", text:"#ea580c", bar:"#f97316" };
}
function shiftDate(base, offset) {
  const d = new Date(base + "T00:00:00");
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}
function todayStr() { return shiftDate(new Date().toISOString().slice(0,10), 0); }
function fmtDisplay(str) {
  if (!str) return "";
  const d = new Date(str + "T00:00:00");
  return d.toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" });
}

// ── Avatar component ──────────────────────────────────────────────────────────
function Avatar({ emp, size = "md" }) {
  const [err, setErr] = useState(false);
  const cls = size === "lg" ? "w-10 h-10 text-sm"
            : size === "sm" ? "w-6 h-6 text-[9px]"
            : "w-8 h-8 text-xs";
  if (emp.profile_image && !err)
    return (
      <img src={`${emp.profile_image}`} alt={emp.name}
        onError={() => setErr(true)}
        className={`${cls} rounded-full object-cover shrink-0 border-2 border-white shadow-sm`} />
    );
  return (
    <div className={`${cls} rounded-full flex items-center justify-center text-white font-bold shrink-0 border-2 border-white shadow-sm`}
      style={{ backgroundColor: avatarColor(emp.employee_id) }}>
      {initials(emp.name)}
    </div>
  );
}

// ── Status Badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const cfg = {
    Present: { dot:"#22c55e", bg:"#f0fdf4", text:"#16a34a", border:"#bbf7d0" },
    Absent:  { dot:"#ef4444", bg:"#fef2f2", text:"#dc2626", border:"#fecaca" },
    Late:    { dot:"#f59e0b", bg:"#fffbeb", text:"#d97706", border:"#fde68a" },
  }[status] ?? { dot:"#94a3b8", bg:"#f8fafc", text:"#64748b", border:"#e2e8f0" };
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ background:cfg.bg, color:cfg.text, border:`1px solid ${cfg.border}` }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background:cfg.dot }} />
      {status}
    </span>
  );
}

const TABS = ["Overview", "By Department", "Employee Detail"];

// ── Main ──────────────────────────────────────────────────────────────────────
export default function AttendancePage() {
  const [date, setDate]           = useState(todayStr());
  const [data, setData]           = useState([]);
  const [stats, setStats]         = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);
  const [activeTab, setActiveTab] = useState("Overview");
  const [rowsPerPage, setRowsPerPage]     = useState(10);
  const [currentPage, setCurrentPage]     = useState(1);
  const [searchQuery, setSearchQuery]     = useState("");
  const [selectedDept, setSelectedDept]   = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");

  const fetchAttendance = useCallback(async (d) => {
    setLoading(true); setError(null);
    try {
      const token = getToken();
      const headers = { "Content-Type":"application/json", "ngrok-skip-browser-warning":"true" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res  = await fetch(`${API_BASE}/api/admin/attendance/daily?date=${d}`, { headers });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json.data ?? []);
      setStats(json.statistics ?? null);
      setCurrentPage(1);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAttendance(date); }, [date, fetchAttendance]);

  const departments = ["All", ...Array.from(new Set(data.map(e => e.department).filter(Boolean)))];
  const statuses    = ["All", ...Array.from(new Set(data.map(e => e.status).filter(Boolean)))];

  const filtered = data.filter(emp => {
    const q = searchQuery.toLowerCase();
    return (!q || emp.name.toLowerCase().includes(q) || emp.department?.toLowerCase().includes(q))
        && (selectedDept   === "All" || emp.department === selectedDept)
        && (selectedStatus === "All" || emp.status     === selectedStatus);
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const pageData   = filtered.slice((currentPage-1)*rowsPerPage, currentPage*rowsPerPage);

  // dept breakdown
  const deptMap = data.reduce((acc, emp) => {
    const d = emp.department ?? "Unknown";
    if (!acc[d]) acc[d] = { total:0, present:0, late:0, absent:0, hours:0, members:[] };
    acc[d].total++;
    if (emp.status === "Present") acc[d].present++;
    else if (emp.status === "Late") acc[d].late++;
    else acc[d].absent++;
    acc[d].hours += Number(emp.production_hours ?? 0);
    acc[d].members.push(emp);
    return acc;
  }, {});

  const presentPct = stats?.total_employees
    ? Math.round(((stats.present ?? 0) / stats.total_employees) * 100) : 0;

  const summaryCards = stats ? [
    { label:"Total Employees", value:stats.total_employees??0, icon:Users,      color:"#6366f1", bg:"#eef2ff", sub:"All registered" },
    { label:"Present",         value:stats.present??0,         icon:UserCheck,  color:"#22c55e", bg:"#f0fdf4", sub:`${presentPct}% rate` },
    { label:"Late",            value:stats.late??0,            icon:Timer,      color:"#f59e0b", bg:"#fffbeb", sub:"Checked in late" },
    { label:"Absent",          value:stats.absent??0,          icon:UserX,      color:"#ef4444", bg:"#fef2f2", sub:"Not checked in" },
  ] : [];

  return (
    <div className="space-y-5">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div className="relative bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 overflow-hidden">
        {/* decorative blobs */}
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute bottom-0 right-10 w-20 h-20 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute top-6 right-40 w-8 h-8 rounded-full bg-white/15 pointer-events-none" />

        <div className="relative z-10 flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-orange-100 text-[10px] font-bold tracking-widest uppercase mb-1">
              Attendance Admin
            </p>
            <h1 className="text-white text-xl font-bold mb-1 leading-tight">
              Daily Attendance Tracking
            </h1>
            <p className="text-orange-100 text-xs max-w-md">
              Monitor check-ins, late arrivals, absences &amp; production hours across every team — all in one place.
            </p>
            {stats && (
              <div className="mt-4 flex items-center gap-3">
                <span className="text-white/70 text-xs whitespace-nowrap">Attendance Rate</span>
                <div className="w-40 h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white rounded-full transition-all duration-700"
                    style={{ width: `${presentPct}%` }} />
                </div>
                <span className="text-white text-sm font-bold">{presentPct}%</span>
                <span className="text-orange-100 text-[10px]">{fmtDisplay(date)}</span>
              </div>
            )}
          </div>

          {/* date controls */}
          <div className="flex items-center gap-2 flex-wrap">
            {[{label:"Today",offset:0},{label:"Yesterday",offset:-1}].map(({label,offset}) => {
              const val = shiftDate(todayStr(), offset);
              return (
                <button key={label} onClick={() => { setDate(val); setCurrentPage(1); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    date === val
                      ? "bg-white text-orange-600 shadow-md"
                      : "bg-white/20 text-white border border-white/30 hover:bg-white/30"
                  }`}>
                  {label}
                </button>
              );
            })}

            <div className="flex items-center bg-white/20 border border-white/30 rounded-lg overflow-hidden">
              <button onClick={() => { setDate(shiftDate(date,-1)); setCurrentPage(1); }}
                className="px-2 py-1.5 text-white hover:bg-white/20 border-r border-white/30 transition-colors">
                <ChevronLeft size={13} />
              </button>
              <label className="flex items-center gap-1.5 px-3 py-1.5 cursor-pointer">
                <Calendar size={12} className="text-white/80" />
                <input type="date" value={date}
                  onChange={e => { setDate(e.target.value); setCurrentPage(1); }}
                  className="outline-none bg-transparent text-xs text-white w-24 [color-scheme:dark]" />
              </label>
              <button onClick={() => { setDate(shiftDate(date,1)); setCurrentPage(1); }}
                className="px-2 py-1.5 text-white hover:bg-white/20 border-l border-white/30 transition-colors">
                <ChevronRight size={13} />
              </button>
            </div>

            <button onClick={() => fetchAttendance(date)}
              className="w-8 h-8 rounded-lg bg-white/20 border border-white/30 flex items-center justify-center text-white hover:bg-white/30 transition-colors">
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            </button>
            <button className="w-8 h-8 rounded-lg bg-white/20 border border-white/30 flex items-center justify-center text-white hover:bg-white/30 transition-colors">
              <FileText size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Error ─────────────────────────────────────────────────────────── */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl px-4 py-3 flex items-center gap-2">
          <AlertCircle size={14} /> Failed to load: {error}
        </div>
      )}

      {/* ── Stat Cards ────────────────────────────────────────────────────── */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {summaryCards.map(card => (
            <div key={card.label}
              className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: card.bg }}>
                  <card.icon size={18} style={{ color: card.color }} />
                </div>
                <span className="text-2xl font-bold text-gray-800">{card.value}</span>
              </div>
              <p className="text-sm font-semibold text-gray-700">{card.label}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">{card.sub}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Tab Panel ─────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

        {/* Tab bar + filters */}
        <div className="flex items-center border-b border-gray-100 px-5 gap-0 overflow-x-auto">
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-3.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-all shrink-0 ${
                activeTab === tab
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-gray-400 hover:text-gray-700"
              }`}>
              {tab}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2 py-2 shrink-0">
            <select value={selectedDept} onChange={e => { setSelectedDept(e.target.value); setCurrentPage(1); }}
              className="px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 bg-white outline-none">
              {departments.map(d => <option key={d}>{d}</option>)}
            </select>
            <select value={selectedStatus} onChange={e => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
              className="px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 bg-white outline-none">
              {statuses.map(s => <option key={s}>{s}</option>)}
            </select>
            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5">
              <Search size={11} className="text-gray-400" />
              <input value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                placeholder="Search…"
                className="text-xs outline-none text-gray-600 w-28 bg-transparent" />
            </div>
          </div>
        </div>

        {/* ── Overview: card grid ──────────────────────────────────────────── */}
        {activeTab === "Overview" && (
          <div className="p-5">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-2 text-gray-400">
                <RefreshCw size={20} className="animate-spin text-orange-400" />
                <p className="text-xs">Loading attendance data…</p>
              </div>
            ) : filtered.length === 0 ? (
              <p className="text-center text-xs text-gray-400 py-14">No records found.</p>
            ) : (
              <>
                <p className="text-xs text-gray-400 mb-4">
                  <span className="font-semibold text-gray-700">{fmtDisplay(date)}</span>
                  {" · "}{filtered.length} employees tracked
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {filtered.map(emp => {
                    const hcfg = hoursColor(emp.production_hours);
                    const pct  = Math.min(100, (Number(emp.production_hours)/9)*100);
                    return (
                      <div key={emp.employee_id}
                        className="border border-gray-100 rounded-xl p-4 hover:border-orange-200 hover:shadow-md transition-all bg-white group">
                        {/* top row */}
                        <div className="flex items-start gap-2.5 mb-3">
                          <Avatar emp={emp} size="md" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-gray-800 truncate">{emp.name}</p>
                            <p className="text-[10px] text-gray-400">{emp.department ?? "—"}</p>
                          </div>
                        </div>
                        <div className="mb-3">
                          <StatusBadge status={emp.status} />
                        </div>
                        {/* time grid */}
                        <div className="grid grid-cols-2 gap-1.5 mb-3">
                          <div className="bg-gray-50 rounded-lg px-2.5 py-2 border border-gray-100">
                            <p className="text-[9px] text-gray-400 mb-0.5 font-medium">CHECK IN</p>
                            <p className="text-xs font-bold text-gray-700">{emp.check_in ?? "—"}</p>
                          </div>
                          <div className="bg-gray-50 rounded-lg px-2.5 py-2 border border-gray-100">
                            <p className="text-[9px] text-gray-400 mb-0.5 font-medium">CHECK OUT</p>
                            <p className="text-xs font-bold text-gray-700">{emp.check_out ?? "—"}</p>
                          </div>
                        </div>
                        {/* hours progress */}
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-[10px] text-gray-400 font-medium">Production</span>
                            <span className="text-[10px] font-bold" style={{ color: hcfg.text }}>
                              {fmtHours(emp.production_hours)} Hrs
                            </span>
                          </div>
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-500"
                              style={{ width:`${pct}%`, backgroundColor: hcfg.bar }} />
                          </div>
                        </div>
                          {emp.late && emp.late !== "0m" && (
                          <p className="text-[10px] text-orange-500 font-semibold mt-2 flex items-center gap-1">
                            <Timer size={10} /> Late by {emp.late}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── By Department ────────────────────────────────────────────────── */}
        {activeTab === "By Department" && (
          <div className="p-5 space-y-3">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-2 text-gray-400">
                <RefreshCw size={20} className="animate-spin text-orange-400" />
                <p className="text-xs">Loading…</p>
              </div>
            ) : Object.keys(deptMap).length === 0 ? (
              <p className="text-center text-xs text-gray-400 py-14">No records found.</p>
            ) : Object.entries(deptMap).map(([dept, d]) => {
              const pct = d.total ? Math.round((d.present / d.total) * 100) : 0;
              return (
                <div key={dept}
                  className="border border-gray-100 rounded-xl p-4 hover:border-orange-200 hover:shadow-sm transition-all bg-white">
                  <div className="flex items-center flex-wrap gap-4">
                    {/* dept name */}
                    <div className="flex items-center gap-3 min-w-[160px]">
                      <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0">
                        <BarChart2 size={16} className="text-orange-500" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800">{dept}</p>
                        <p className="text-[11px] text-gray-400">{d.total} employees</p>
                      </div>
                    </div>

                    {/* avatar stack */}
                    <div className="flex -space-x-2">
                      {d.members.slice(0,5).map((emp,i) => (
                        <div key={emp.employee_id} style={{ zIndex:5-i }}>
                          <Avatar emp={emp} size="sm" />
                        </div>
                      ))}
                      {d.total > 5 && (
                        <div className="w-6 h-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[9px] font-bold text-gray-500">
                          +{d.total-5}
                        </div>
                      )}
                    </div>

                    {/* status pills */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-50 text-green-600 border border-green-100">
                        ✓ {d.present} Present
                      </span>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-yellow-50 text-yellow-600 border border-yellow-100">
                        ⏱ {d.late} Late
                      </span>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-50 text-red-500 border border-red-100">
                        ✗ {d.absent} Absent
                      </span>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-500 border border-blue-100">
                        🕐 {d.hours.toFixed(1)} Hrs
                      </span>
                    </div>

                    {/* progress bar */}
                    <div className="flex items-center gap-2 ml-auto min-w-[140px]">
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500"
                          style={{ width:`${pct}%`, backgroundColor: pct>=80?"#22c55e":pct>=50?"#f59e0b":"#ef4444" }} />
                      </div>
                      <span className="text-xs font-bold text-gray-700 w-9 text-right">{pct}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Employee Detail: table ───────────────────────────────────────── */}
        {activeTab === "Employee Detail" && (
          <>
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-50 bg-gray-50/40">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>Rows</span>
                <select value={rowsPerPage}
                  onChange={e => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                  className="border border-gray-200 rounded-lg px-2 py-1 text-xs text-gray-600 bg-white outline-none">
                  {[5,10,25,50].map(n => <option key={n}>{n}</option>)}
                </select>
                <span>per page</span>
              </div>
              <p className="text-xs text-gray-400">{filtered.length} total</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/60">
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400">#</th>
                    {["Employee","Status","Check In","Check Out","Break","Late","Prod. Hours",""].map(col => (
                      <th key={col} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 whitespace-nowrap">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={9} className="px-5 py-14 text-center">
                      <RefreshCw size={18} className="animate-spin mx-auto mb-2 text-orange-400" />
                      <p className="text-xs text-gray-400">Loading…</p>
                    </td></tr>
                  ) : pageData.length === 0 ? (
                    <tr><td colSpan={9} className="text-center text-xs text-gray-400 py-14">
                      No records found.
                    </td></tr>
                  ) : pageData.map((emp, idx) => {
                    const hcfg = hoursColor(emp.production_hours);
                    return (
                      <tr key={emp.employee_id}
                        className={`border-b border-gray-50 hover:bg-orange-50/20 transition-colors ${idx%2!==0?"bg-gray-50/20":""}`}>
                        <td className="px-5 py-3 text-xs text-gray-400 font-medium">
                          {(currentPage-1)*rowsPerPage+idx+1}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar emp={emp} size="md" />
                            <div>
                              <p className="text-xs font-semibold text-gray-800 whitespace-nowrap">{emp.name}</p>
                              <p className="text-[11px] text-gray-400">{emp.department ?? "—"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3"><StatusBadge status={emp.status} /></td>
                        <td className="px-4 py-3 text-xs text-gray-700 font-medium">{emp.check_in ?? "—"}</td>
                        <td className="px-4 py-3 text-xs text-gray-700 font-medium">{emp.check_out ?? "—"}</td>
                        <td className="px-4 py-3 text-xs text-gray-400">{emp.break ?? "—"}</td>
                        <td className="px-4 py-3 text-xs">
                          {emp.late && emp.late !== "0m"
  ? <span className="text-orange-500 font-semibold">{emp.late}</span>
  : <span className="text-gray-400">—</span>}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
                            style={{ backgroundColor:hcfg.bg, color:hcfg.text }}>
                            <Clock size={10} /> {fmtHours(emp.production_hours)} Hrs
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-orange-50 hover:text-orange-500 hover:border-orange-200 transition-colors">
                            <Edit2 size={12} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
              <p className="text-xs text-gray-400">
                Showing {filtered.length===0?0:(currentPage-1)*rowsPerPage+1}–{Math.min(currentPage*rowsPerPage,filtered.length)} of {filtered.length} entries
              </p>
              <div className="flex items-center gap-1">
                <button onClick={() => setCurrentPage(p => Math.max(1,p-1))} disabled={currentPage===1}
                  className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 disabled:opacity-40">
                  <ChevronLeft size={13} />
                </button>
                {Array.from({length:totalPages},(_,i)=>i+1)
                  .filter(p => Math.abs(p-currentPage)<=2)
                  .map(p => (
                    <button key={p} onClick={() => setCurrentPage(p)}
                      className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center transition-colors ${
                        p===currentPage ? "bg-orange-500 text-white shadow-sm" : "border border-gray-200 text-gray-500 hover:bg-gray-50"
                      }`}>
                      {p}
                    </button>
                  ))}
                <button onClick={() => setCurrentPage(p => Math.min(totalPages,p+1))} disabled={currentPage===totalPages}
                  className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 disabled:opacity-40">
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
