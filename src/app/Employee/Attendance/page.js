"use client";
import React, { useState, useEffect, useCallback } from "react";

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const BASE = "https://pencilkraft.in";
const HEADERS = () => ({
  Authorization: `Bearer ${localStorage.getItem("employee_auth_token")}`,
  "ngrok-skip-browser-warning": "true",
  Accept: "application/json",
  "Content-Type": "application/json",
});

// ─── ICONS ────────────────────────────────────────────────────────────────────
const Icon = ({ d, size = 14, stroke = "currentColor", fill = "none", sw = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
    strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
    style={{ display: "block", flexShrink: 0 }}>
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);
const ICONS = {
  clock:    "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2",
  calendar: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z",
  search:   "M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z",
  chevL:    "M15 18l-6-6 6-6",
  chevR:    "M9 18l6-6-6-6",
  logIn:    "M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4 M10 17l5-5-5-5 M15 12H3",
  logOut:   "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9",
  coffee:   "M17 8h1a4 4 0 0 1 0 8h-1 M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z M6 1v3M10 1v3M14 1v3",
  zap:      "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  refresh:  "M23 4v6h-6 M1 20v-6h6 M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15",
  user:     "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  briefcase:"M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z M12 3a2 2 0 0 0-2 2v2h4V5a2 2 0 0 0-2-2z",
  target:   "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12z M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const fmt12 = (v) => {
  if (!v) return null;
  // Handle time-only strings like "10:45:00" or "10:45"
  if (typeof v === "string" && /^\d{1,2}:\d{2}(:\d{2})?$/.test(v.trim())) {
    const [h, m] = v.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    return `${String(h12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${ampm}`;
  }
  const d = new Date(v);
  if (isNaN(d)) return null;
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
};

const fmtDate = (v) => {
  if (!v) return null;
  const d = new Date(v);
  if (isNaN(d)) return null;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const fmtHM = (h) => {
  if (h == null) return null;
  const hrs = Math.floor(h), mins = Math.round((h - hrs) * 60);
  return hrs === 0 ? `${mins}m` : `${hrs}h ${mins > 0 ? `${mins}m` : ""}`;
};

const fmtMins = (m) => {
  if (m == null) return null;
  const h = Math.floor(m / 60), rem = m % 60;
  return h === 0 ? `${rem} min` : `${h}h ${rem > 0 ? `${rem}m` : ""}`;
};

// ─── FIELD PICKER ─────────────────────────────────────────────────────────────
function pick(rec, keys) {
  for (const k of keys) {
    const v = rec[k];
    if (v !== undefined && v !== null && v !== "" && v !== "00:00:00" && v !== "00:00") return v;
  }
  return null;
}

// ─── NORMALISE: maps ANY record shape → consistent object ─────────────────────
function normalise(r) {
  return {
    id: r.id,
    date: pick(r, ["date", "attendance_date", "work_date", "working_date", "record_date", "created_at", "attendance_date_time"]),
    checkIn: pick(r, ["check_in", "check_in_time", "checkin_time", "checkin", "punch_in", "punch_in_time", "first_punch", "first_punch_time", "in_time", "clock_in", "clock_in_time", "start_time", "signin_time", "time_in", "punch_in_at"]),
    checkOut: pick(r, ["check_out", "check_out_time", "checkout_time", "checkout", "punch_out", "punch_out_time", "last_punch", "last_punch_time", "out_time", "clock_out", "clock_out_time", "end_time", "signout_time", "time_out"]),
    status: pick(r, ["status", "attendance_status", "day_status", "work_status", "day_type"]),
    breakMins: pick(r, ["break_minutes", "break_duration_minutes", "break_time_minutes", "total_break_minutes", "break_mins", "break_in_minutes"]),
    breakHrs: pick(r, ["break_hours", "break_duration", "break_time", "total_break_hours", "break_duration_hours", "break_in_hours"]),
    lateMins: pick(r, ["late_minutes", "late_duration_minutes", "late_mins", "late_arrival_minutes", "late_time_minutes", "late_by_minutes"]),
    lateHrs: pick(r, ["late_hours", "late_duration", "late_time", "late_arrival_hours", "late_by_hours"]),
    otMins: pick(r, ["overtime_minutes", "over_time_minutes", "ot_minutes", "extra_minutes", "overtime_mins", "over_time_mins"]),
    otHrs: pick(r, ["overtime_hours", "overtime", "over_time", "ot_hours", "extra_hours", "overtime_duration", "over_time_hours"]),
    prodHrs: pick(r, ["production_hours", "productive_hours", "total_hours", "worked_hours", "working_hours", "net_hours", "total_worked_hours", "effective_hours", "work_hours", "total_working_hours", "hours_worked", "duration"]),
    shiftName: pick(r, ["shift_name", "shift"]),
    _raw: r,
  };
}

// ─── EXTRACT RECORDS from any API response shape ───────────────────────────────
function extractRecords(json) {
  if (!json) return [];
  const tries = [
    json?.data?.data,
    json?.data?.results,
    json?.data?.records,
    json?.data?.attendance,
    json?.data?.attendances,
    json?.data?.items,
    json?.data?.list,
    json?.results,
    json?.records,
    json?.attendance,
    json?.attendances,
    json?.items,
    json?.list,
    json?.data,
    json,
  ];
  for (const c of tries) {
    if (Array.isArray(c) && c.length > 0) return c;
  }
  return [];
}

// ─── CLOCK ────────────────────────────────────────────────────────────────────
function useClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);
  return now;
}

// ─── AVATAR ───────────────────────────────────────────────────────────────────
function Avatar({ name = "?", size = 36, color = "#374151", img = null }) {
  const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  if (img) return (
    <div style={{ width: size, height: size, borderRadius: "50%", overflow: "hidden", flexShrink: 0, border: "2px solid #e5e7eb" }}>
      <img src={img} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }}
        onError={e => { e.target.style.display = "none"; }} />
    </div>
  );
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.34, fontWeight: 700, color: "#fff", flexShrink: 0, letterSpacing: "-0.5px", border: "2px solid #fff" }}>
      {initials}
    </div>
  );
}

// ─── STAT CARD ────────────────────────────────────────────────────────────────
function StatCard({ iconBg, iconPath, value, target, label, badge, badgeUp, ACCENT }) {
  return (
    <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #f1f5f9", padding: "16px 18px", flex: 1, display: "flex", gap: 12, alignItems: "flex-start" }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon d={iconPath} size={18} stroke="#fff" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: "#111827", letterSpacing: "-0.5px" }}>
          {value} <span style={{ fontSize: 13, color: "#9ca3af", fontWeight: 500 }}>/ {target}</span>
        </div>
        <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 6 }}>{label}</div>
        <span style={{ fontSize: 10.5, padding: "2px 8px", borderRadius: 10, background: badgeUp ? "#dcfce7" : "#fee2e2", color: badgeUp ? "#166534" : "#991b1b", fontWeight: 600 }}>
          {badgeUp ? "↑" : "↓"} {badge}
        </span>
      </div>
    </div>
  );
}

// ─── TIMELINE BAR ─────────────────────────────────────────────────────────────
function TimelineBar({ punches = [] }) {
  const toMins = (t) => { if (!t) return null; const d = new Date(t); return isNaN(d) ? null : d.getHours() * 60 + d.getMinutes(); };
  const START = 6 * 60, END = 23 * 60, RANGE = END - START;
  const pct = (m) => Math.max(0, Math.min(100, ((m - START) / RANGE) * 100));
  const labels = Array.from({ length: 18 }, (_, i) => `${String(i + 6).padStart(2, "0")}:00`);

  const segments = [];
  let lastIn = null;
  const sortedPunches = [...punches].sort((a, b) => new Date(a.punch_time) - new Date(b.punch_time));
  for (const p of sortedPunches) {
    const t = toMins(p.punch_time);
    if (p.type === "in") lastIn = t;
    else if (p.type === "out" && lastIn !== null) { segments.push({ s: lastIn, e: t }); lastIn = null; }
  }
  if (lastIn !== null) { const now = new Date(); segments.push({ s: lastIn, e: now.getHours() * 60 + now.getMinutes() }); }

  if (segments.length === 0) return null;

  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ position: "relative", height: 22, background: "#f1f5f9", borderRadius: 6, overflow: "hidden" }}>
        {segments.map((seg, i) => (
          <div key={i} style={{ position: "absolute", top: 0, bottom: 0, left: `${pct(seg.s)}%`, width: `${Math.max(0.5, pct(seg.e) - pct(seg.s))}%`, background: "#22c55e", opacity: 0.85 }} />
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
const STATUS_MAP = {
  present:    { bg: "#dcfce7", text: "#166534", dot: "#22c55e", label: "Present"  },
  absent:     { bg: "#fee2e2", text: "#991b1b", dot: "#ef4444", label: "Absent"   },
  late:       { bg: "#fef9c3", text: "#854d0e", dot: "#f59e0b", label: "Late"     },
  "half-day": { bg: "#ede9fe", text: "#5b21b6", dot: "#8b5cf6", label: "Half Day" },
  "half day": { bg: "#ede9fe", text: "#5b21b6", dot: "#8b5cf6", label: "Half Day" },
  wfh:        { bg: "#dbeafe", text: "#1e40af", dot: "#3b82f6", label: "WFH"      },
  off:        { bg: "#f3f4f6", text: "#6b7280", dot: "#9ca3af", label: "Off"      },
  holiday:    { bg: "#fdf2fb", text: "#86198f", dot: "#d946ef", label: "Holiday"  },
  leave:      { bg: "#fff7ed", text: "#9a3412", dot: "#f97316", label: "Leave"    },
};
function StatusBadge({ status }) {
  const key = (status ?? "").toLowerCase().trim().replace(/_/g, "-");
  const cfg = STATUS_MAP[key] || { bg: "#f1f5f9", text: "#6b7280", dot: "#9ca3af", label: status || "–" };
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 20, background: cfg.bg }}>
      <div style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.dot }} />
      <span style={{ fontSize: 11.5, fontWeight: 600, color: cfg.text }}>{cfg.label}</span>
    </div>
  );
}

// ─── PRODUCTION BADGE ─────────────────────────────────────────────────────────
function ProductionBadge({ hours }) {
  const val   = parseFloat(hours) || 0;
  const color = val >= 8 ? "#16a34a" : val >= 6 ? "#2563eb" : "#dc2626";
  const bg    = val >= 8 ? "#dcfce7" : val >= 6 ? "#dbeafe" : "#fee2e2";
  const h = Math.floor(val), m = Math.round((val - h) * 60);
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 6, background: bg }}>
      <Icon d={ICONS.clock} size={11} stroke={color} />
      <span style={{ fontSize: 11.5, fontWeight: 700, color }}>{`${h}.${String(m).padStart(2, "0")} Hrs`}</span>
    </div>
  );
}

// ─── DEBUG OVERLAY ────────────────────────────────────────────────────────────
function RawDebug({ record }) {
  const [open, setOpen] = useState(false);
  if (!record) return null;
  return (
    <div style={{ position: "fixed", bottom: 16, right: 16, zIndex: 9999 }}>
      <button onClick={() => setOpen(o => !o)}
        style={{ background: "#1e293b", color: "#fff", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 12, cursor: "pointer", fontWeight: 600, boxShadow: "0 4px 12px rgba(0,0,0,0.3)" }}>
        {open ? "✕ Close" : "🔍 Debug first record"}
      </button>
      {open && (
        <pre style={{ position: "absolute", bottom: 44, right: 0, background: "#0f172a", color: "#86efac", borderRadius: 10, padding: 16, width: 500, maxHeight: 420, overflowY: "auto", fontSize: 11, fontFamily: "monospace", whiteSpace: "pre-wrap", margin: 0, boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}>
          {JSON.stringify(record, null, 2)}
        </pre>
      )}
    </div>
  );
}

// ─── PUNCH WIDGET ─────────────────────────────────────────────────────────────
function PunchWidget({ attendance, punching, punchError, onPunch, profile, ACCENT }) {
  const now         = useClock();
  const isPunchedIn = attendance?.last_punch_type === "in";
  const totalHours  = attendance?.total_hours ?? 0;
  const punches     = attendance?.punches ?? [];
  const shift       = attendance?.shift;
  const firstIn     = punches.find(p => p.type === "in");
  const pct         = Math.min(shift?.progress_percent ?? 0, 100);
  const r = 50, circ = 2 * Math.PI * r, dash = (pct / 100) * circ;

  const emp      = profile?.employee;
  const fullName = emp ? `${emp.firstname} ${emp.lastname}`.trim() : "Employee";
  const imgSrc   = emp?.profile_image ? `${BASE}${emp.profile_image}` : null;
  const timeStr  = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true });
  const dateStr  = now.toLocaleDateString("en-US", { weekday: "short", day: "2-digit", month: "short", year: "numeric" });

  return (
    <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #f1f5f9", padding: 20, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
      <div style={{ fontSize: 11.5, color: "#6b7280", fontWeight: 600, marginBottom: 2 }}>
        Good Morning, {emp?.firstname ?? "Employee"}
      </div>
      <div style={{ fontSize: 12, fontWeight: 700, color: "#111827", marginBottom: 16 }}>{timeStr}, {dateStr}</div>

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

      <div style={{ background: ACCENT, color: "#fff", borderRadius: 20, padding: "4px 14px", fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
        Production : {fmtHM(totalHours) ?? "0m"}
      </div>
      <div style={{ fontSize: 11.5, color: "#6b7280", marginBottom: 14 }}>
        {firstIn ? `Punch In at ${fmt12(firstIn.punch_time)}` : "No punch recorded today"}
      </div>
      {shift && (
        <div style={{ fontSize: 10, color: "#9ca3af", marginBottom: 12, display: "flex", alignItems: "center", gap: 4 }}>
          <Icon d={ICONS.briefcase} size={10} stroke="#9ca3af" />
          Shift: {shift.name} | {fmt12(shift.start_time)} - {fmt12(shift.end_time)}
        </div>
      )}

      {punchError && (
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 6, padding: "5px 10px", fontSize: 11, color: "#991b1b", marginBottom: 8, width: "100%" }}>
          {punchError}
        </div>
      )}

      <button disabled={punching} onClick={() => onPunch(isPunchedIn ? "out" : "in")}
        style={{ width: "100%", background: isPunchedIn ? "#1e293b" : `linear-gradient(90deg,${ACCENT},#ea580c)`, color: "#fff", border: "none", borderRadius: 8, padding: "11px 0", fontSize: 13.5, fontWeight: 700, cursor: punching ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: punching ? 0.7 : 1 }}>
        {punching
          ? <Spinner color="#fff" size={14} />
          : <Icon d={isPunchedIn ? ICONS.logOut : ICONS.logIn} stroke="#fff" size={14} />}
        {punching ? "Processing…" : isPunchedIn ? "Punch Out" : "Punch In"}
      </button>
    </div>
  );
}

// ─── SPINNER ──────────────────────────────────────────────────────────────────
function Spinner({ color = "#f97316", size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" style={{ animation: "spin 0.8s linear infinite", flexShrink: 0 }}>
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

// ─── PAG BUTTON ───────────────────────────────────────────────────────────────
function PagBtn({ children, onClick, disabled, active, ACCENT }) {
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ width: 30, height: 30, background: active ? ACCENT : "#fff", border: `1px solid ${active ? ACCENT : "#e5e7eb"}`, borderRadius: 6, fontSize: 12.5, fontWeight: active ? 700 : 400, color: active ? "#fff" : "#6b7280", cursor: disabled ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: disabled ? 0.4 : 1 }}>
      {children}
    </button>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function EmployeeAttendancePage({ ACCENT = "#f97316" }) {
  const [attendance, setAttendance] = useState(null);
  const [dashboard,  setDashboard]  = useState(null);
  const [records,    setRecords]    = useState([]);
  const [rawRecords, setRawRecords] = useState([]);
  const [profile,    setProfile]    = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [punching,   setPunching]   = useState(false);
  const [punchError, setPunchError] = useState(null);

  // table state
  const [search,      setSearch]      = useState("");
  const [statusFilter,setStatusFilter]= useState("");
  const [sortField,   setSortField]   = useState("date");
  const [sortDir,     setSortDir]     = useState("desc");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page,        setPage]        = useState(1);
  const [dateRange]                   = useState(() => {
    const to = new Date(), from = new Date(); from.setDate(from.getDate() - 6);
    const f = d => d.toISOString().slice(0, 10);
    return `${f(from)} – ${f(to)}`;
  });

  // ── fetch today ─────────────────────────────────────────────────────────
  const fetchToday = useCallback(async () => {
    try {
      const res  = await fetch(`${BASE}/api/employee/attendance/today`, { headers: HEADERS() });
      const json = await res.json();
      if (json.success && json.data) setAttendance(json.data);
    } catch (e) { console.error("[fetchToday]", e); }
  }, []);

  // ── fetch all ───────────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [todayRes, dashRes, profileRes] = await Promise.all([
        fetch(`${BASE}/api/employee/attendance/today`,     { headers: HEADERS() }),
        fetch(`${BASE}/api/employee/attendance/dashboard`, { headers: HEADERS() }),
        fetch(`${BASE}/api/employee/profile`,              { headers: HEADERS() }),
      ]);
      const [todayJson, dashJson, profileJson] = await Promise.all([
        todayRes.json(), dashRes.json(), profileRes.json(),
      ]);

      if (todayJson.success)   setAttendance(todayJson.data);
      if (dashJson.success)    setDashboard(dashJson.data);
      if (profileJson.success) setProfile(profileJson.data);

      // Try multiple record endpoints until one returns data
      const endpoints = [
        `${BASE}/api/employee/attendance/history?month=${new Date().getMonth()+1}&year=${new Date().getFullYear()}`,
        `${BASE}/api/employee/attendance?month=${new Date().getMonth()+1}&year=${new Date().getFullYear()}`,
        `${BASE}/api/employee/attendance/records`,
        `${BASE}/api/employee/attendance/list`,
        `${BASE}/api/employee/attendances`,
        `${BASE}/api/employee/attendance/all`,
      ];

      let raw = [];
      for (const url of endpoints) {
        try {
          const res  = await fetch(url, { headers: HEADERS() });
          const json = await res.json();
          const recs = extractRecords(json);
          if (recs.length > 0) {
            raw = recs;
            break;
          }
        } catch (e) {
          console.warn(`❌ ${url}:`, e.message);
        }
      }

      setRawRecords(raw);
      setRecords(raw.map(normalise));
    } catch (e) {
      console.error("[fetchAll]", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── punch ───────────────────────────────────────────────────────────────
  const doPunch = useCallback(async (type) => {
    setPunching(true); setPunchError(null);
    try {
      const url  = type === "in"
        ? `${BASE}/api/employee/attendance/punch-in`
        : `${BASE}/api/employee/attendance/punch-out`;
      const res  = await fetch(url, { method: "POST", headers: HEADERS() });
      const json = await res.json();
      if (json.success) { await fetchToday(); await fetchAll(); }
      else setPunchError(json.message ?? "Punch failed");
    } catch (e) { setPunchError(e.message); }
    finally { setPunching(false); }
  }, [fetchToday, fetchAll]);

  // ── dashboard numbers ───────────────────────────────────────────────────
  const dash        = dashboard;
  const todayWorked = Math.max(0, dash?.today?.worked  ?? attendance?.total_hours ?? 0);
  const todayTarget = dash?.today?.target   ?? 9;
  const weekWorked  = Math.max(0, dash?.week?.worked   ?? 0);
  const weekTarget  = dash?.week?.target    ?? 45;
  const monthWorked = Math.max(0, dash?.month?.worked  ?? 0);
  const monthTarget = dash?.month?.target   ?? 180;
  const otHours     = Math.max(0, dash?.overtime?.this_month_hours ?? 0);
  const otTarget    = dash?.overtime?.target_hours ?? 28;
  
  // Safe formatting for dashboard stats
  const weekBadge   = dash?.week?.change_percent != null ? `${Math.abs(dash.week.change_percent).toFixed(0)}% This Week` : "0% This Week";
  const monBadge    = dash?.week?.change_percent != null ? `${Math.abs(dash.week.change_percent).toFixed(0)}% Last Week` : "0% Last Week";
  const mon2Badge   = dash?.month?.change_percent != null ? `${Math.abs(dash.month.change_percent).toFixed(0)}% Last Month` : "0% Last Month";
  const otBadge     = dash?.overtime?.change_percent != null ? `${Math.abs(dash.overtime.change_percent).toFixed(0)}% Last Month` : "0% Last Month";
  const weekUp  = (dash?.week?.change_percent ?? 1) >= 0;
  const monthUp = (dash?.month?.change_percent ?? 1) >= 0;
  const otUp    = (dash?.overtime?.change_percent ?? 0) >= 0;
  
  const sumTotal = dash?.summary?.total_working_hours ?? (todayWorked ? fmtHM(todayWorked) : "0h");
  const sumProd  = dash?.summary?.productive_hours    ?? (todayWorked ? fmtHM(todayWorked) : "0h");
  const sumBreak = dash?.summary?.break_hours         ?? "0h";
  const sumOT    = dash?.summary?.overtime_today      ?? "0h";

  // ── table filter / sort / paginate ──────────────────────────────────────
  const filtered = records.filter(r => {
    const q  = search.toLowerCase();
    const dm = q === "" || (fmtDate(r.date) ?? "").toLowerCase().includes(q) || (r.shiftName?.toLowerCase() || "").includes(q);
    const sm = !statusFilter || (r.status ?? "").toLowerCase().replace(/[\s_]+/g, "-") === statusFilter;
    return dm && sm;
  });

  const sorted = [...filtered].sort((a, b) => {
    let av, bv;
    if      (sortField === "date")      { av = new Date(a.date ?? 0);  bv = new Date(b.date ?? 0); }
    else if (sortField === "check_in")  { av = a.checkIn  ?? "";       bv = b.checkIn  ?? ""; }
    else if (sortField === "check_out") { av = a.checkOut ?? "";       bv = b.checkOut ?? ""; }
    else if (sortField === "status")    { av = a.status   ?? "";       bv = b.status   ?? ""; }
    else                                { av = ""; bv = ""; }
    if (av < bv) return sortDir === "asc" ? -1 : 1;
    if (av > bv) return sortDir === "asc" ?  1 : -1;
    return 0;
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / rowsPerPage));
  const paginated  = sorted.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  const toggleSort = (f) => {
    if (sortField === f) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(f); setSortDir("asc"); }
  };

  const cols = [
    { key: "date",       label: "Date",           w: 130 },
    { key: "check_in",   label: "Check In",       w: 110 },
    { key: "status",     label: "Status",         w: 120 },
    { key: "check_out",  label: "Check Out",      w: 110 },
    { key: "break",      label: "Break",          w: 100 },
    { key: "late",       label: "Late",           w: 90  },
    { key: "overtime",   label: "Overtime",       w: 100 },
    { key: "production", label: "Production Hrs", w: 140 },
  ];

  function cellContent(row, key) {
    switch (key) {
      case "date":       return { type: "text",   val: fmtDate(row.date) };
      case "check_in":   return { type: "text",   val: fmt12(row.checkIn) };
      case "check_out":  return { type: "text",   val: fmt12(row.checkOut) };
      case "status":     return { type: "status", val: row.status };
      case "production": return { type: "prod",   val: row.prodHrs };
      case "break": {
        const v = row.breakMins != null ? fmtMins(row.breakMins)
                : row.breakHrs  != null ? fmtHM(row.breakHrs)   : null;
        return { type: "text", val: v };
      }
      case "late": {
        const v = row.lateMins != null ? fmtMins(row.lateMins)
                : row.lateHrs  != null ? fmtHM(row.lateHrs)     : null;
        return { type: "text", val: v };
      }
      case "overtime": {
        const v = row.otMins != null ? fmtMins(row.otMins)
                : row.otHrs  != null ? fmtHM(row.otHrs)         : null;
        return { type: "text", val: v };
      }
      default: return { type: "text", val: null };
    }
  }

  // ── render ──────────────────────────────────────────────────────────────
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, fontFamily: "'Inter',-apple-system,sans-serif" }}>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}} .att-row:hover{background:#fafafa!important}`}</style>

      {/* TOP ROW */}
      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 14 }}>
        {loading ? (
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", padding: 40 }}>
            <Spinner color={ACCENT} size={20} />
          </div>
        ) : (
          <PunchWidget attendance={attendance} punching={punching} punchError={punchError}
            onPunch={doPunch} profile={profile} ACCENT={ACCENT} />
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
            <StatCard ACCENT={ACCENT} iconBg={ACCENT}  iconPath={ICONS.clock}    value={todayWorked.toFixed(1)} target={todayTarget} label="Total Hours Today"   badge={weekBadge} badgeUp={true}    />
            <StatCard ACCENT={ACCENT} iconBg="#3b82f6" iconPath={ICONS.zap}      value={weekWorked.toFixed(1)}  target={weekTarget}  label="Total Hours Week"   badge={monBadge}  badgeUp={weekUp}  />
            <StatCard ACCENT={ACCENT} iconBg="#8b5cf6" iconPath={ICONS.calendar} value={monthWorked.toFixed(1)} target={monthTarget} label="Total Hours Month"  badge={mon2Badge} badgeUp={monthUp} />
            <StatCard ACCENT={ACCENT} iconBg="#f59e0b" iconPath={ICONS.coffee}   value={otHours.toFixed(1)}     target={otTarget}    label="Overtime this Month" badge={otBadge}   badgeUp={otUp}    />
          </div>

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
            <TimelineBar punches={attendance?.punches ?? []} />
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #f1f5f9", overflow: "hidden" }}>
        {/* Toolbar */}
        <div style={{ padding: "13px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>Employee Attendance</span>
            {records.length > 0 && (
              <span style={{ fontSize: 11, background: "#dcfce7", color: "#166534", padding: "2px 8px", borderRadius: 10, fontWeight: 600 }}>
                {records.length} records
              </span>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5, background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 7, padding: "5px 10px", fontSize: 12, color: "#374151" }}>
              <Icon d={ICONS.calendar} size={12} stroke="#9ca3af" />
              <span>{dateRange}</span>
            </div>
            <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
              style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 7, padding: "6px 10px", fontSize: 12, color: "#6b7280", cursor: "pointer", outline: "none" }}>
              <option value="">All Statuses</option>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
              <option value="half-day">Half Day</option>
              <option value="wfh">WFH</option>
              <option value="off">Off</option>
              <option value="holiday">Holiday</option>
              <option value="leave">Leave</option>
            </select>
            <button onClick={fetchAll} title="Refresh"
              style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 7, padding: "6px 10px", cursor: "pointer", display: "flex", alignItems: "center" }}>
              <Icon d={ICONS.refresh} size={14} stroke="#6b7280" />
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
              placeholder="Search by date or shift…"
              style={{ border: "none", background: "transparent", fontSize: 12, color: "#374151", outline: "none", width: 180 }} />
          </div>
        </div>

        {/* Table grid */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#f9fafb" }}>
                {cols.map(({ key, label, w }) => (
                  <th key={key} onClick={() => toggleSort(key)}
                    style={{ padding: "10px 16px", textAlign: "left", fontSize: 11.5, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.5px", whiteSpace: "nowrap", width: w, cursor: "pointer", userSelect: "none" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      {label}
                      <svg width={10} height={10} viewBox="0 0 24 24" fill="none"
                        stroke={sortField === key ? ACCENT : "#d1d5db"} strokeWidth={2.5} strokeLinecap="round"
                        style={{ opacity: sortField === key ? 1 : 0.4 }}>
                        <path d="M8 9l4-4 4 4M8 15l4 4 4-4" />
                      </svg>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={cols.length} style={{ padding: "50px 0", textAlign: "center" }}>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 10, color: "#9ca3af", fontSize: 13 }}>
                    <Spinner color={ACCENT} /> Loading attendance…
                  </div>
                </td></tr>
              ) : paginated.length === 0 ? (
                <tr><td colSpan={cols.length} style={{ padding: "50px 0", textAlign: "center", color: "#9ca3af", fontSize: 13 }}>
                  No attendance records found
                </td></tr>
              ) : paginated.map((row, i) => (
                <tr key={row.id || i} className="att-row"
                  style={{ borderTop: "1px solid #f3f4f6", background: "#fff", transition: "background 0.12s" }}>
                  {cols.map(({ key }) => {
                    const { type, val } = cellContent(row, key);
                    return (
                      <td key={key} style={{ padding: "13px 16px", verticalAlign: "middle" }}>
                        {type === "status" ? <StatusBadge status={val} />
                       : type === "prod"   ? <ProductionBadge hours={val} />
                       : val               ? <span style={{ fontSize: 13, color: "#374151" }}>{val}</span>
                       :                    <span style={{ fontSize: 13, color: "#d1d5db" }}>–</span>}
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
            Showing {sorted.length === 0 ? 0 : (page - 1) * rowsPerPage + 1}–{Math.min(page * rowsPerPage, sorted.length)} of {sorted.length} entries
          </span>
          <div style={{ display: "flex", gap: 4 }}>
            <PagBtn ACCENT={ACCENT} onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
              <Icon d={ICONS.chevL} size={14} stroke="#6b7280" />
            </PagBtn>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .slice(Math.max(0, page - 3), page + 2)
              .map(n => (
                <PagBtn key={n} ACCENT={ACCENT} active={n === page} onClick={() => setPage(n)}>{n}</PagBtn>
              ))}
            <PagBtn ACCENT={ACCENT} onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
              <Icon d={ICONS.chevR} size={14} stroke="#6b7280" />
            </PagBtn>
          </div>
        </div>
      </div>

      {/* Debug overlay */}
      <RawDebug record={rawRecords[0]} />
    </div>
  );
}