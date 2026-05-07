"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const BASE = process.env.NEXT_PUBLIC_API_URL;
const HEADERS = () => ({
  Authorization: `Bearer ${localStorage.getItem("employee_auth_token")}`,
  "ngrok-skip-browser-warning": "true",
  Accept: "application/json",
  "Content-Type": "application/json",
});

// ─── ICONS ───────────────────────────────────────────────────────────────────
const Icon = ({ d, size = 14, stroke = "currentColor", fill = "none", sw = 1.8 }) => (
  <svg
    width={size} height={size} viewBox="0 0 24 24"
    fill={fill} stroke={stroke} strokeWidth={sw}
    strokeLinecap="round" strokeLinejoin="round"
    style={{ display: "block", flexShrink: 0 }}
  >
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

const ICONS = {
  clock:      "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2",
  calendar:   "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z",
  search:     "M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z",
  chevLeft:   "M15 18l-6-6 6-6",
  chevRight:  "M9 18l6-6-6-6",
  sortUp:     "M8 9l4-4 4 4M8 15l4 4 4-4",
  logIn:      "M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4 M10 17l5-5-5-5 M15 12H3",
  logOut:     "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9",
  export:     "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M17 8l-5-5-5 5 M12 3v12",
  report:     "M18 20V10M12 20V4M6 20v-6",
  user:       "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  coffee:     "M17 8h1a4 4 0 0 1 0 8h-1 M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z M6 1v3M10 1v3M14 1v3",
  zap:        "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  settings:   "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z",
  refresh:    "M23 4v6h-6 M1 20v-6h6 M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15",
  filter:     "M22 3H2l8 9.46V19l4 2v-8.54L22 3z",
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function fmt12(dateStr) {
  if (!dateStr) return "–";
  const d = new Date(dateStr);
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
}
function fmtDate(dateStr) {
  if (!dateStr) return "–";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}
function fmtHM(totalHours) {
  if (!totalHours && totalHours !== 0) return "–";
  const h = Math.floor(totalHours);
  const m = Math.round((totalHours - h) * 60);
  if (h === 0) return `${m}m`;
  return `${h}h ${m > 0 ? m + "m" : ""}`.trim();
}
function useClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return now;
}
function Avatar({ name = "?", size = 36, color = "#374151", img = null }) {
  const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  if (img) return (
    <div style={{ width: size, height: size, borderRadius: "50%", overflow: "hidden", flexShrink: 0, border: "2px solid #e5e7eb" }}>
      <img src={img} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { e.target.style.display = "none"; }} />
    </div>
  );
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.34, fontWeight: 700, color: "#fff", flexShrink: 0, letterSpacing: "-0.5px", border: "2px solid #fff" }}>
      {initials}
    </div>
  );
}

// ─── STAT CARD ───────────────────────────────────────────────────────────────
function StatMiniCard({ iconBg, iconPath, value, target, label, badge, badgeUp, ACCENT }) {
  return (
    <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #f1f5f9", padding: "16px 18px", flex: 1, display: "flex", gap: 12, alignItems: "flex-start" }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon d={iconPath} size={18} stroke="#fff" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: "#111827", letterSpacing: "-0.5px" }}>
          {value} <span style={{ fontSize: 14, color: "#9ca3af", fontWeight: 500 }}>/ {target}</span>
        </div>
        <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 6 }}>{label}</div>
        <span style={{ fontSize: 10.5, padding: "2px 8px", borderRadius: 10, background: badgeUp ? "#dcfce7" : "#fee2e2", color: badgeUp ? "#166534" : "#991b1b", fontWeight: 600 }}>
          {badgeUp ? "↑" : "↓"} {badge}
        </span>
      </div>
    </div>
  );
}

// ─── TIMELINE CHART ──────────────────────────────────────────────────────────
function TimelineBar({ punches = [], shiftStart = "06:00", shiftEnd = "11:00" }) {
  const toMins = (t) => {
    if (!t) return null;
    const d = new Date(t);
    return d.getHours() * 60 + d.getMinutes();
  };
  const startMins = 6 * 60;
  const endMins   = 23 * 60;
  const totalRange = endMins - startMins;
  const labels = [];
  for (let h = 6; h <= 23; h += 1) labels.push(`${String(h).padStart(2, "0")}:00`);

  // Build segments from punches
  const segments = [];
  let lastIn = null;
  for (const p of punches) {
    const t = toMins(p.punch_time);
    if (p.type === "in") { lastIn = t; }
    else if (p.type === "out" && lastIn !== null) {
      segments.push({ start: lastIn, end: t, type: "work" });
      lastIn = null;
    }
  }
  if (lastIn !== null) segments.push({ start: lastIn, end: toMins(new Date().toISOString()) || lastIn + 60, type: "work" });

  const pct = (m) => `${Math.max(0, Math.min(100, ((m - startMins) / totalRange) * 100))}%`;

  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ position: "relative", height: 22, background: "#f1f5f9", borderRadius: 6, overflow: "hidden" }}>
        {segments.map((s, i) => (
          <div key={i} style={{ position: "absolute", top: 0, bottom: 0, left: pct(s.start), width: pct(s.end - s.start + startMins).replace("%", "") === "0" ? "2%" : `calc(${pct(s.end)} - ${pct(s.start)})`, background: "#22c55e", opacity: 0.85 }} />
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
        {labels.filter((_, i) => i % 2 === 0).map((l, i) => (
          <span key={i} style={{ fontSize: 9, color: "#9ca3af" }}>{l}</span>
        ))}
      </div>
    </div>
  );
}

// ─── STATUS BADGE ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    present:  { bg: "#dcfce7", text: "#166534", dot: "#22c55e", label: "Present"  },
    absent:   { bg: "#fee2e2", text: "#991b1b", dot: "#ef4444", label: "Absent"   },
    late:     { bg: "#fef9c3", text: "#854d0e", dot: "#f59e0b", label: "Late"     },
    "half-day": { bg: "#ede9fe", text: "#5b21b6", dot: "#8b5cf6", label: "Half Day" },
    wfh:      { bg: "#dbeafe", text: "#1e40af", dot: "#3b82f6", label: "WFH"      },
  };
  const k = (status ?? "").toLowerCase().replace(" ", "-");
  const cfg = map[k] || { bg: "#f1f5f9", text: "#6b7280", dot: "#9ca3af", label: status || "–" };
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 20, background: cfg.bg }}>
      <div style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.dot }} />
      <span style={{ fontSize: 11.5, fontWeight: 600, color: cfg.text }}>{cfg.label}</span>
    </div>
  );
}

// ─── PRODUCTION BADGE ────────────────────────────────────────────────────────
function ProductionBadge({ hours }) {
  const val = parseFloat(hours) || 0;
  const color = val >= 8 ? "#16a34a" : val >= 6 ? "#2563eb" : val > 0 ? "#dc2626" : "#dc2626";
  const bg    = val >= 8 ? "#dcfce7" : val >= 6 ? "#dbeafe" : val > 0 ? "#fee2e2" : "#fee2e2";
  const h = Math.floor(val);
  const m = Math.round((val - h) * 60);
  const label = val > 0 ? `${h}.${String(m).padStart(2, "0")} Hrs` : "0.00 Hrs";
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 6, background: bg }}>
      <Icon d={ICONS.clock} size={11} stroke={color} />
      <span style={{ fontSize: 11.5, fontWeight: 700, color }}>{label}</span>
    </div>
  );
}

// ─── PUNCH WIDGET ────────────────────────────────────────────────────────────
function PunchWidget({ attendance, punching, error, onPunch, profile, ACCENT }) {
  const now         = useClock();
  const isPunchedIn = attendance?.last_punch_type === "in";
  const totalHours  = attendance?.total_hours ?? 0;
  const punchList   = attendance?.punches ?? [];
  const shift       = attendance?.shift;
  const firstIn     = punchList.find(p => p.type === "in");
  const pct         = Math.min(shift?.progress_percent ?? 0, 100);
  const r = 50, circ = 2 * Math.PI * r, dash = (pct / 100) * circ;

  const emp       = profile?.employee;
  const fullName  = emp ? `${emp.firstname} ${emp.lastname}`.trim() : "Employee";
  const imgSrc    = emp?.profile_image ? `${BASE}${emp.profile_image}` : null;
  const timeStr   = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true });
  const dateStr   = now.toLocaleDateString("en-US", { weekday: "short", day: "2-digit", month: "short", year: "numeric" });

  return (
    <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #f1f5f9", padding: 20, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
      <style>{`@keyframes spin { from{transform:rotate(0deg);}to{transform:rotate(360deg);} } @keyframes pulse { 0%,100%{opacity:1;}50%{opacity:.4;} }`}</style>
      <div style={{ fontSize: 11.5, color: "#6b7280", fontWeight: 600, marginBottom: 2 }}>Good Morning, {emp?.firstname ?? "Employee"}</div>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: "#111827", marginBottom: 16 }}>{timeStr}, {dateStr}</div>

      {/* Donut + Avatar */}
      <div style={{ position: "relative", width: 130, height: 130, marginBottom: 10 }}>
        <svg width={130} height={130} viewBox="0 0 130 130">
          <circle cx={65} cy={65} r={r} fill="none" stroke="#e2e8f0" strokeWidth={10} />
          <circle cx={65} cy={65} r={r} fill="none"
            stroke={isPunchedIn ? "#22c55e" : "#9ca3af"} strokeWidth={10}
            strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
            style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%", transition: "stroke-dasharray 0.6s ease" }}
          />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Avatar name={fullName} size={90} color={ACCENT} img={imgSrc} />
        </div>
      </div>

      {/* Production badge */}
      <div style={{ background: ACCENT, color: "#fff", borderRadius: 20, padding: "4px 14px", fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
        Production : {fmtHM(totalHours)}
      </div>
      <div style={{ fontSize: 11.5, color: "#6b7280", marginBottom: 14 }}>
        {firstIn ? `Punch In at ${fmt12(firstIn.punch_time)}` : "No punch recorded today"}
      </div>

      {error && (
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 6, padding: "5px 10px", fontSize: 11, color: "#991b1b", marginBottom: 8, width: "100%" }}>{error}</div>
      )}

      {/* Punch Button */}
      <button
        disabled={punching}
        onClick={() => onPunch(isPunchedIn ? "out" : "in")}
        style={{ width: "100%", background: isPunchedIn ? "#1e293b" : `linear-gradient(90deg,${ACCENT},#ea580c)`, color: "#fff", border: "none", borderRadius: 8, padding: "11px 0", fontSize: 13.5, fontWeight: 700, cursor: punching ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: punching ? 0.7 : 1, transition: "opacity 0.2s" }}
      >
        {punching
          ? <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.5} strokeLinecap="round" style={{ animation: "spin 0.8s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
          : <Icon d={isPunchedIn ? ICONS.logOut : ICONS.logIn} stroke="#fff" size={14} />}
        {punching ? "Processing…" : isPunchedIn ? "Punch Out" : "Punch In"}
      </button>
    </div>
  );
}

// ─── MAIN PAGE ───────────────────────────────────────────────────────────────
export default function EmployeeAttendancePage({ ACCENT = "#f97316" }) {
  // ── state ──
  const [attendance, setAttendance] = useState(null);
  const [dashboard,  setDashboard]  = useState(null);
  const [records,    setRecords]    = useState([]);
  const [profile,    setProfile]    = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [punching,   setPunching]   = useState(false);
  const [error,      setError]      = useState(null);

  // table state
  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortField,    setSortField]    = useState("date");
  const [sortDir,      setSortDir]      = useState("desc");
  const [rowsPerPage,  setRowsPerPage]  = useState(10);
  const [page,         setPage]         = useState(1);
  const [dateRange,    setDateRange]    = useState(() => {
    const to = new Date();
    const from = new Date(); from.setDate(from.getDate() - 6);
    const fmt = d => d.toISOString().slice(0, 10);
    return `${fmt(from)} - ${fmt(to)}`;
  });

  // ── fetch ──
  const fetchAll = useCallback(async () => {
    try {
      const [todayRes, dashRes, recordsRes, profileRes] = await Promise.all([
        fetch(`${BASE}/api/employee/attendance/today`,        { headers: HEADERS() }),
        fetch(`${BASE}/api/employee/attendance/dashboard`,    { headers: HEADERS() }),
        fetch(`${BASE}/api/employee/attendance`,              { headers: HEADERS() }),
        fetch(`${BASE}/api/employee/profile`,                 { headers: HEADERS() }),
      ]);
      const [todayJson, dashJson, recordsJson, profileJson] = await Promise.all([
        todayRes.json(), dashRes.json(), recordsRes.json(), profileRes.json(),
      ]);
      if (todayJson.success)   setAttendance(todayJson.data);
      if (dashJson.success)    setDashboard(dashJson.data);
      if (profileJson.success) setProfile(profileJson.data);
      // Records
      let recs = [];
      if (recordsJson.success && Array.isArray(recordsJson.data))               recs = recordsJson.data;
      else if (recordsJson.success && Array.isArray(recordsJson.data?.records)) recs = recordsJson.data.records;
      else if (Array.isArray(recordsJson.data))                                 recs = recordsJson.data;
      else if (Array.isArray(recordsJson))                                      recs = recordsJson;
      setRecords(recs);
      setError(null);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── punch ──
  const doPunch = useCallback(async (type) => {
    setPunching(true); setError(null);
    try {
      const endpoint = type === "in"
        ? `${BASE}/api/employee/attendance/punch-in`
        : `${BASE}/api/employee/attendance/punch-out`;
      const res  = await fetch(endpoint, { method: "POST", headers: HEADERS() });
      const json = await res.json();
      if (json.success) await fetchAll();
      else setError(json.message ?? "Punch failed");
    } catch (e) { setError(e.message); }
    finally { setPunching(false); }
  }, [fetchAll]);

  // ── derived dashboard values ──
  const dash        = dashboard;
  const todayWorked = Math.max(0, dash?.today?.worked  ?? 0);
  const todayTarget = dash?.today?.target   ?? 9;
  const weekWorked  = Math.max(0, dash?.week?.worked   ?? 0);
  const weekTarget  = dash?.week?.target    ?? 40;
  const monthWorked = Math.max(0, dash?.month?.worked  ?? 0);
  const monthTarget = dash?.month?.target   ?? 98;
  const otHours     = Math.max(0, dash?.overtime?.this_month_hours ?? 0);
  const otTarget    = dash?.overtime?.target_hours ?? 28;
  const weekBadge   = `${Math.abs(dash?.week?.change_percent   ?? 5).toFixed(0)}% This Week`;
  const monthBadge  = `${Math.abs(dash?.month?.change_percent  ?? 7).toFixed(0)}% Last Week`;
  const monthBadge2 = `${Math.abs(dash?.month?.change_percent  ?? 8).toFixed(0)}% Last Month`;
  const otBadge     = `${Math.abs(dash?.overtime?.change_percent ?? 6).toFixed(0)}% Last Month`;
  const weekUp   = (dash?.week?.change_percent   ?? 1) >= 0;
  const monthUp  = (dash?.month?.change_percent  ?? 1) >= 0;
  const otUp     = (dash?.overtime?.change_percent ?? -1) >= 0;

  const sumTotal = dash?.summary?.total_working_hours ?? "12h 36m";
  const sumProd  = dash?.summary?.productive_hours    ?? "08h 36m";
  const sumBreak = dash?.summary?.break_hours         ?? "22m 15s";
  const sumOT    = dash?.summary?.overtime_today      ?? "02h 15m";

  // ── table filter/sort/page ──
  const filtered = records.filter(r => {
    const q = search.toLowerCase();
    const dateMatch   = fmtDate(r.date ?? r.created_at ?? "").toLowerCase().includes(q);
    const statusMatch = !statusFilter || (r.status ?? "").toLowerCase() === statusFilter.toLowerCase();
    return (q === "" || dateMatch) && statusMatch;
  });

  const sorted = [...filtered].sort((a, b) => {
    let av, bv;
    if (sortField === "date") { av = new Date(a.date ?? a.created_at ?? 0); bv = new Date(b.date ?? b.created_at ?? 0); }
    else if (sortField === "check_in")  { av = a.punch_in  ?? a.check_in  ?? ""; bv = b.punch_in  ?? b.check_in  ?? ""; }
    else if (sortField === "check_out") { av = a.punch_out ?? a.check_out ?? ""; bv = b.punch_out ?? b.check_out ?? ""; }
    else { av = a[sortField] ?? ""; bv = b[sortField] ?? ""; }
    if (av < bv) return sortDir === "asc" ? -1 : 1;
    if (av > bv) return sortDir === "asc" ?  1 : -1;
    return 0;
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / rowsPerPage));
  const paginated  = sorted.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const toggleSort = (field) => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
  };

  // ─── COLS ───
  const cols = [
    { key: "date",       label: "Date",             w: 130 },
    { key: "check_in",   label: "Check In",          w: 110 },
    { key: "status",     label: "Status",            w: 120 },
    { key: "check_out",  label: "Check Out",         w: 110 },
    { key: "break",      label: "Break",             w: 100 },
    { key: "late",       label: "Late",              w: 90  },
    { key: "overtime",   label: "Overtime",          w: 100 },
    { key: "production", label: "Production Hours",  w: 140 },
  ];

  function getCellValue(r, key) {
    switch (key) {
      case "date":       return fmtDate(r.date ?? r.created_at);
      case "check_in":   return fmt12(r.punch_in ?? r.check_in ?? r.punch_in_time);
      case "check_out":  return fmt12(r.punch_out ?? r.check_out ?? r.punch_out_time);
      case "break":      return r.break_minutes != null ? `${r.break_minutes} Min` : (r.break_hours ? fmtHM(r.break_hours) : "–");
      case "late":       return r.late_minutes != null ? `${r.late_minutes} Min` : (r.late_hours ? fmtHM(r.late_hours) : "–");
      case "overtime":   return r.overtime_minutes != null ? `${r.overtime_minutes} Min` : (r.overtime_hours ? fmtHM(r.overtime_hours) : "–");
      case "production": return r.production_hours ?? r.total_hours ?? null;
      case "status":     return r.status;
      default:           return "–";
    }
  }

  // ── render ──
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, fontFamily: "'Inter',-apple-system,sans-serif" }}>
      <style>{`
        @keyframes spin { from{transform:rotate(0deg);}to{transform:rotate(360deg);} }
        @keyframes pulse { 0%,100%{opacity:1;}50%{opacity:.4;} }
        .att-row:hover { background:#fafafa !important; }
        .sort-btn:hover svg { opacity: 1 !important; }
      `}</style>

      {/* ── TOP SECTION: punch widget + stat cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 14 }}>
        {/* Punch widget */}
        {loading ? (
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", padding: 40 }}>
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth={2.5} strokeLinecap="round" style={{ animation: "spin 0.8s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
          </div>
        ) : (
          <PunchWidget attendance={attendance} punching={punching} error={error} onPunch={doPunch} profile={profile} ACCENT={ACCENT} />
        )}

        {/* Stat cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
            <StatMiniCard ACCENT={ACCENT}
              iconBg={ACCENT}      iconPath={ICONS.clock}
              value={todayWorked.toFixed(2)} target={todayTarget}
              label="Total Hours Today"  badge={weekBadge}   badgeUp={true}
            />
            <StatMiniCard ACCENT={ACCENT}
              iconBg="#3b82f6"     iconPath={ICONS.zap}
              value={weekWorked.toFixed(0)}  target={weekTarget}
              label="Total Hours Week"   badge={monthBadge}  badgeUp={weekUp}
            />
            <StatMiniCard ACCENT={ACCENT}
              iconBg="#8b5cf6"     iconPath={ICONS.calendar}
              value={monthWorked.toFixed(0)} target={monthTarget}
              label="Total Hours Month"  badge={monthBadge2} badgeUp={monthUp}
            />
            <StatMiniCard ACCENT={ACCENT}
              iconBg="#f59e0b"     iconPath={ICONS.coffee}
              value={otHours}             target={otTarget}
              label="Overtime this Month" badge={otBadge}     badgeUp={otUp}
            />
          </div>

          {/* Summary + Timeline */}
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #f1f5f9", padding: "14px 18px", flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              {[
                { label: "Total Working hours", val: sumTotal, dot: "#22c55e" },
                { label: "Productive Hours",    val: sumProd,  dot: "#22c55e" },
                { label: "Break hours",         val: sumBreak, dot: "#f59e0b" },
                { label: "Overtime",            val: sumOT,    dot: "#3b82f6" },
              ].map(({ label, val, dot }, i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: dot }} />
                    <span style={{ fontSize: 10.5, color: "#9ca3af" }}>{label}</span>
                  </div>
                  <span style={{ fontSize: 18, fontWeight: 800, color: "#111827", letterSpacing: "-0.5px" }}>{val}</span>
                </div>
              ))}
            </div>
            {/* Timeline */}
            <TimelineBar punches={attendance?.punches ?? []} />
          </div>
        </div>
      </div>

      {/* ── TABLE SECTION ── */}
      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #f1f5f9", overflow: "hidden" }}>
        {/* Table header toolbar */}
        <div style={{ padding: "13px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>Employee Attendance</span>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* Date range */}
            <div style={{ display: "flex", alignItems: "center", gap: 5, background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 7, padding: "5px 10px", fontSize: 12, color: "#374151" }}>
              <Icon d={ICONS.calendar} size={12} stroke="#9ca3af" />
              <span>{dateRange}</span>
            </div>
            {/* Status filter */}
            <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
              style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 7, padding: "6px 10px", fontSize: 12, color: "#6b7280", cursor: "pointer", outline: "none" }}>
              <option value="">Select Status</option>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
              <option value="half-day">Half Day</option>
              <option value="wfh">WFH</option>
            </select>
            {/* Sort */}
            <button style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 7, padding: "6px 12px", fontSize: 12, color: "#6b7280", cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
              Sort By : Last 7 Days ▾
            </button>
          </div>
        </div>

        {/* Sub-toolbar */}
        <div style={{ padding: "10px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fafafa" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, color: "#6b7280" }}>Row Per Page</span>
            <select value={rowsPerPage} onChange={e => { setRowsPerPage(Number(e.target.value)); setPage(1); }}
              style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 6, padding: "4px 8px", fontSize: 12, color: "#374151", cursor: "pointer" }}>
              {[5, 10, 20, 50].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            <span style={{ fontSize: 12, color: "#9ca3af" }}>Entries</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 7, padding: "5px 10px" }}>
            <Icon d={ICONS.search} stroke="#9ca3af" size={13} />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by date…"
              style={{ border: "none", background: "transparent", fontSize: 12, color: "#374151", outline: "none", width: 150 }} />
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#f9fafb" }}>
                {cols.map(({ key, label, w }) => (
                  <th key={key}
                    onClick={() => toggleSort(key)}
                    className="sort-btn"
                    style={{ padding: "10px 16px", textAlign: "left", fontSize: 11.5, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.5px", whiteSpace: "nowrap", width: w, cursor: "pointer", userSelect: "none" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      {label}
                      <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke={sortField === key ? ACCENT : "#d1d5db"} strokeWidth={2.5} strokeLinecap="round" style={{ opacity: sortField === key ? 1 : 0.5, transition: "opacity 0.15s" }}>
                        <path d="M8 9l4-4 4 4M8 15l4 4 4-4" />
                      </svg>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={cols.length} style={{ padding: "50px 0", textAlign: "center" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 10, color: "#9ca3af", fontSize: 13 }}>
                      <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth={2.5} strokeLinecap="round" style={{ animation: "spin 0.8s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
                      Loading attendance…
                    </div>
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={cols.length} style={{ padding: "50px 0", textAlign: "center", color: "#9ca3af", fontSize: 13 }}>
                    No attendance records found
                  </td>
                </tr>
              ) : paginated.map((r, i) => (
                <tr key={r.id ?? i} className="att-row"
                  style={{ borderTop: "1px solid #f3f4f6", background: "#fff", transition: "background 0.12s", cursor: "default" }}>
                  {cols.map(({ key }) => {
                    const val = getCellValue(r, key);
                    return (
                      <td key={key} style={{ padding: "13px 16px", verticalAlign: "middle" }}>
                        {key === "status" ? (
                          <StatusBadge status={val} />
                        ) : key === "production" ? (
                          <ProductionBadge hours={val} />
                        ) : (
                          <span style={{ fontSize: 13, color: val === "–" ? "#d1d5db" : "#374151" }}>{val}</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ padding: "12px 20px", borderTop: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fafafa" }}>
          <span style={{ fontSize: 12, color: "#9ca3af" }}>
            Showing {sorted.length === 0 ? 0 : Math.min((page - 1) * rowsPerPage + 1, sorted.length)}–{Math.min(page * rowsPerPage, sorted.length)} of {sorted.length} entries
          </span>
          <div style={{ display: "flex", gap: 4 }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              style={{ width: 30, height: 30, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", cursor: page === 1 ? "not-allowed" : "pointer", opacity: page === 1 ? 0.4 : 1 }}>
              <Icon d={ICONS.chevLeft} size={14} stroke="#6b7280" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .slice(Math.max(0, page - 3), page + 2)
              .map(n => (
                <button key={n} onClick={() => setPage(n)}
                  style={{ width: 30, height: 30, background: n === page ? ACCENT : "#fff", border: `1px solid ${n === page ? ACCENT : "#e5e7eb"}`, borderRadius: 6, fontSize: 12.5, fontWeight: n === page ? 700 : 400, color: n === page ? "#fff" : "#6b7280", cursor: "pointer" }}>
                  {n}
                </button>
              ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              style={{ width: 30, height: 30, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", cursor: page === totalPages ? "not-allowed" : "pointer", opacity: page === totalPages ? 0.4 : 1 }}>
              <Icon d={ICONS.chevRight} size={14} stroke="#6b7280" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}