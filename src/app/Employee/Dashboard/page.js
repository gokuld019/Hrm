"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import EmployeeAttendancePage from "../Attendance/page";
import EmployeeLeavePage from "../Leave/page";
import HolidaysPage from "../Holidays/page";
import NoticePeriodTracker from "../EmployeeWorkCycle/NoticePeriodTracker/page";
import ProbationManagement from "../EmployeeWorkCycle/ProbationManagement/page";
import Promotion from "../EmployeeWorkCycle/Promotion/page";
import Resignation from "../EmployeeWorkCycle/Resignation/page";
import Termination from "../EmployeeWorkCycle/Termination/page";
import ShiftSchedulePage from "../ShiftSchedule/page";
import PayrollPage from "../Payroll/page";
import TicketsPage from "../Tickets/page";
import ProjectsPage from "../Projects/page";
import TasksPage from "../Task/page";

// ─── Constants ────────────────────────────────────────────────────────────────
const BASE = "";
const HEADERS = () => ({
  Authorization: `Bearer ${localStorage.getItem("employee_auth_token")}`,
  "ngrok-skip-browser-warning": "true",
  Accept: "application/json",
  "Content-Type": "application/json",
});
const ATTENDANCE_POLL_MS = 5000;
const AVATAR_COLORS = ["#6366f1","#f59e0b","#22c55e","#ef4444","#8b5cf6","#06b6d4","#ec4899","#14b8a6","#f97316","#3b82f6"];

// ─── Lucide-style SVG Icons ───────────────────────────────────────────────────
const Icon = ({ d, size = 16, stroke = "currentColor", fill = "none", sw = 1.8, style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
    strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
    style={{ display: "block", flexShrink: 0, ...style }}>
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

const ICONS = {
  home:        "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",
  folder:      "M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z",
  list:        "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 0 2-2h2a2 2 0 0 0 2 2",
  attendance:  "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2",
  calendar:    "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z",
  briefcase:   "M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2",
  ticket:      "M2 3h20v14H2z M8 21h8M12 17v4",
  dollar:      "M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
  chevDown:    "M6 9l6 6 6-6",
  chevRight:   "M9 18l6-6-6-6",
  search:      "M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z",
  bell:        "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0",
  mail:        "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6",
  grid:        "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z",
  settings:    "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z",
  logOut:      "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9",
  logIn:       "M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4 M10 17l5-5-5-5 M15 12H3",
  clock:       "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2",
  menu:        "M3 12h18M3 6h18M3 18h18",
  refresh:     "M23 4v6h-6 M1 20v-6h6 M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15",
  upload:      "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M17 8l-5-5-5 5 M12 3v12",
  plus:        "M12 5v14M5 12h14",
  check:       "M20 6L9 17l-5-5",
  x:           "M18 6L6 18M6 6l12 12",
  user:        "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  shield:      "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  phone:       "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z",
  mapPin:      "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
  trending:    "M23 6l-9.5 9.5-5-5L1 18 M17 6h6v6",
  users:       "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75",
  video:       "M23 7l-7 5 7 5V7z M1 5h15a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H1V5z",
  radio:       "M12 1a3 3 0 1 0 0 6 3 3 0 0 0 0-6z M6.343 8.657a8 8 0 1 0 11.314 0",
  link:        "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71 M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71",
  activity:    "M22 12h-4l-3 9L9 3l-3 9H2",
  edit:        "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7 M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z",
  more:        "M12 5h.01M12 12h.01M12 19h.01",
  arrowRight:  "M5 12h14 M12 5l7 7-7 7",
  star:        "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  trash:       "M3 6h18 M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",
  archive:     "M21 8v13H3V8 M1 3h22v5H1z M10 12h4",
  send:        "M22 2L11 13 M22 2l-7 20-4-9-9-4 20-7z",
  info:        "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 8h.01M12 12v4",
  alertTri:    "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z M12 9v4M12 17h.01",
  checkCheck:  "M18 6L7 17l-5-5 M22 10L11 21l-2-2",
  kanban:      "M3 3h5v18H3z M9 3h5v18H9z M15 3h5v18h-5z",
  grid2:       "M3 3h8v8H3zM13 3h8v8h-8zM3 13h8v8H3zM13 13h8v8h-8z",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function avatarColor(name = "") {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffffffff;
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

const Avatar = ({ name = "?", size = 32, color = "#374151", img = null }) => {
  const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  if (img) return (
    <div style={{ width: size, height: size, borderRadius: "50%", overflow: "hidden", flexShrink: 0 }}>
      <img src={img} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }}
        onError={e => { e.target.style.display = "none"; }} />
    </div>
  );
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.32, fontWeight: 700, color: "#fff", flexShrink: 0, letterSpacing: "-0.5px" }}>
      {initials}
    </div>
  );
};

function StackedAvatars({ members = [], max = 3, size = 26 }) {
  const shown = members.slice(0, max);
  const extra = members.length - max;
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      {shown.map((m, i) => {
        const name = `${m.firstname ?? ""} ${m.lastname ?? ""}`.trim();
        return (
          <div key={m.id ?? i} title={name} style={{ marginLeft: i === 0 ? 0 : -8, zIndex: max - i }}>
            <Avatar name={name} size={size} color={avatarColor(name)}
              img={m.profile_image ? `${BASE}${m.profile_image}` : null} />
          </div>
        );
      })}
      {extra > 0 && (
        <div style={{ marginLeft: -8, width: size, height: size, borderRadius: "50%", background: "#e5e7eb", border: "2px solid #fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.28, fontWeight: 700, color: "#6b7280" }}>+{extra}</div>
      )}
    </div>
  );
}

// ─── Attendance Hook ──────────────────────────────────────────────────────────
function useAttendance() {
  const [attendance, setAttendance] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [punching, setPunching] = useState(false);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);

  const fetchAll = useCallback(async () => {
    try {
      const [todayRes, dashRes] = await Promise.all([
        fetch(`${BASE}/api/employee/attendance/today`, { headers: HEADERS() }),
        fetch(`${BASE}/api/employee/attendance/dashboard`, { headers: HEADERS() }),
      ]);
      const [todayJson, dashJson] = await Promise.all([todayRes.json(), dashRes.json()]);
      if (todayJson.success) { setAttendance(todayJson.data); setError(null); }
      if (dashJson.success) setDashboard(dashJson.data);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchAll();
    intervalRef.current = setInterval(fetchAll, ATTENDANCE_POLL_MS);
    return () => clearInterval(intervalRef.current);
  }, [fetchAll]);

  const doPunch = useCallback(async (type) => {
    setPunching(true); setError(null);
    try {
      const endpoint = type === "in" ? `${BASE}/api/employee/attendance/punch-in` : `${BASE}/api/employee/attendance/punch-out`;
      const res = await fetch(endpoint, { method: "POST", headers: HEADERS() });
      const json = await res.json();
      if (json.success) await fetchAll();
      else setError(json.message ?? "Punch failed");
    } catch (err) { setError(err.message); }
    finally { setPunching(false); }
  }, [fetchAll]);

  return { attendance, dashboard, loading, punching, error, doPunch, refresh: fetchAll };
}

function useClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);
  return now;
}

function fmt12(dateStr) {
  if (!dateStr) return "--:-- --";
  return new Date(dateStr).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
}

function fmtHMS(totalHours) {
  const totalSec = Math.round(totalHours * 3600);
  const h = Math.floor(totalSec / 3600), m = Math.floor((totalSec % 3600) / 60), s = totalSec % 60;
  return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
}

// ─── Badge Components ─────────────────────────────────────────────────────────
const PRIORITY_CONFIG = {
  high:   { dot: "#ef4444", bg: "#fef2f2", text: "#dc2626", label: "High"   },
  medium: { dot: "#f59e0b", bg: "#fffbeb", text: "#d97706", label: "Medium" },
  low:    { dot: "#22c55e", bg: "#f0fdf4", text: "#16a34a", label: "Low"    },
};
const STATUS_CONFIG = {
  active:        { bg: "#dcfce7", text: "#166534", dot: "#22c55e", label: "Active"      },
  inactive:      { bg: "#fee2e2", text: "#991b1b", dot: "#ef4444", label: "Inactive"    },
  planning:      { bg: "#ede9fe", text: "#5b21b6", dot: "#8b5cf6", label: "Planning"    },
  "in-progress": { bg: "#dbeafe", text: "#1e40af", dot: "#3b82f6", label: "In Progress" },
  completed:     { bg: "#dcfce7", text: "#166534", dot: "#22c55e", label: "Completed"   },
  on_hold:       { bg: "#f1f5f9", text: "#475569", dot: "#94a3b8", label: "On Hold"     },
};
function PriorityBadge({ priority }) {
  const cfg = PRIORITY_CONFIG[(priority ?? "").toLowerCase()] || PRIORITY_CONFIG.medium;
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"3px 10px", borderRadius:20, background:cfg.bg, fontSize:11, fontWeight:600, color:cfg.text }}>
      <span style={{ width:6, height:6, borderRadius:"50%", background:cfg.dot, display:"inline-block" }} />{cfg.label}
    </span>
  );
}
function StatusBadge({ status }) {
  const key = (status ?? "").toLowerCase().replace(" ","-");
  const cfg = STATUS_CONFIG[key] || STATUS_CONFIG.planning;
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"3px 10px", borderRadius:20, background:cfg.bg, fontSize:11, fontWeight:600, color:cfg.text }}>
      <span style={{ width:6, height:6, borderRadius:"50%", background:cfg.dot, display:"inline-block" }} />{cfg.label}
    </span>
  );
}

// ─── Page Meta ────────────────────────────────────────────────────────────────
const PAGE_TITLES = {
  null:                  { title: "Employee Dashboard",    crumb: "Dashboard"        },
  tickets:               { title: "Tickets",               crumb: "Tickets"          },
  "attendance-employee": { title: "Attendance",            crumb: "Attendance"       },
  "attendance-shift":    { title: "Shift & Schedule",      crumb: "Shift & Schedule" },
  "attendance-holidays": { title: "Holiday Calendar",      crumb: "Holiday Calendar" },
  "employee-work-cycle": { title: "Employee Work Cycle",   crumb: "Work Cycle"       },
  leave:                 { title: "Leave Management",      crumb: "Leave"            },
  holidays:              { title: "Holidays",              crumb: "Holidays"         },
  payroll:               { title: "Payroll",               crumb: "Payroll"          },
  projects:              { title: "Projects",              crumb: "Projects"         },
  Tasks:                 { title: "Tasks",                 crumb: "Tasks"            },
};

// ─── ProtectedRoute ───────────────────────────────────────────────────────────
function ProtectedRoute({ children, requiredRole }) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  useEffect(() => {
    const stored = localStorage.getItem("auth_user");
    if (!stored) { router.replace("/login"); return; }
    const user = JSON.parse(stored);
    const role = user?.role ?? "";
    if (requiredRole && role !== requiredRole) {
      router.replace(role === "admin" ? "/Admin/Dashboard" : "/Employee/Dashboard");
    } else setIsAuthorized(true);
  }, [requiredRole, router]);
  if (!isAuthorized) return null;
  return children;
}

// ─── Tooltip ─────────────────────────────────────────────────────────────────
function Tooltip({ label, children }) {
  return (
    <div style={{ position:"relative" }} className="tt-wrap">
      {children}
      <style>{`.tt-wrap:hover .tt-label{opacity:1;transform:translateX(-50%) translateY(0)}`}</style>
      <span className="tt-label" style={{ position:"absolute", top:"calc(100% + 8px)", left:"50%", transform:"translateX(-50%) translateY(-4px)", background:"#1e293b", color:"#fff", fontSize:10, padding:"4px 8px", borderRadius:6, whiteSpace:"nowrap", pointerEvents:"none", opacity:0, transition:"all 0.15s", zIndex:999, fontWeight:600, fontFamily:"inherit" }}>
        {label}
      </span>
    </div>
  );
}

// ─── Backdrop ─────────────────────────────────────────────────────────────────
const Backdrop = ({ onClick }) => (
  <div style={{ position:"fixed", inset:0, zIndex:40 }} onClick={onClick} />
);

// ─── Spinner ─────────────────────────────────────────────────────────────────
const Spinner = ({ color = "#f97316", size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" style={{ animation:"spin 0.8s linear infinite", display:"block" }}>
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

// ─── Notification Panel ───────────────────────────────────────────────────────
const notifData = [
  { id:1, color:"#3b82f6", bg:"#eff6ff", icon:"info",       title:"Shift assigned",           desc:"You have been assigned the Morning shift.",     time:"2 min ago",  unread:true  },
  { id:2, color:"#16a34a", bg:"#f0fdf4", icon:"checkCheck",  title:"Leave request approved",   desc:"Your leave for Apr 22–24 has been approved.",   time:"18 min ago", unread:true  },
  { id:3, color:"#d97706", bg:"#fffbeb", icon:"alertTri",    title:"Attendance alert",         desc:"You missed clock-in yesterday.",                 time:"1 hr ago",   unread:true  },
  { id:4, color:"#8b5cf6", bg:"#f5f3ff", icon:"users",       title:"Team update",              desc:"New member added to your project team.",         time:"3 hr ago",   unread:false },
  { id:5, color:"#16a34a", bg:"#f0fdf4", icon:"check",       title:"Task completed",           desc:"Project Phoenix milestone reached.",             time:"Yesterday",  unread:false },
];

function NotificationPanel({ onClose }) {
  const [notifs, setNotifs] = useState(notifData);
  const [filter, setFilter] = useState("all");
  const unread = notifs.filter(n => n.unread).length;
  const shown = filter === "unread" ? notifs.filter(n => n.unread) : notifs;
  return (
    <>
      <Backdrop onClick={onClose} />
      <div style={{ position:"fixed", top:58, right:44, zIndex:50, width:380, borderRadius:16, background:"#fff", border:"1px solid #f1f5f9", boxShadow:"0 20px 60px rgba(0,0,0,0.12)", overflow:"hidden", animation:"slideDown .18s cubic-bezier(.4,0,.2,1)", fontFamily:"inherit" }}>
        <style>{`@keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}`}</style>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 20px", borderBottom:"1px solid #f1f5f9" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ fontSize:14, fontWeight:700, color:"#1e293b" }}>Notifications</span>
            {unread > 0 && <span style={{ background:"#f97316", color:"#fff", fontSize:10, fontWeight:700, padding:"1px 7px", borderRadius:20 }}>{unread}</span>}
          </div>
          <div style={{ display:"flex", gap:8 }}>
            {unread > 0 && <button onClick={() => setNotifs(p => p.map(n => ({ ...n, unread:false })))} style={{ fontSize:11, color:"#f97316", fontWeight:600, background:"none", border:"none", cursor:"pointer" }}>Mark all read</button>}
            <button onClick={onClose} style={{ width:28, height:28, borderRadius:8, background:"#f9fafb", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}><Icon d={ICONS.x} size={13} stroke="#6b7280" /></button>
          </div>
        </div>
        <div style={{ display:"flex", gap:4, padding:"12px 20px 0" }}>
          {["all","unread"].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding:"4px 12px", borderRadius:8, fontSize:11, fontWeight:600, textTransform:"capitalize", background:filter===f?"#f97316":"#f1f5f9", color:filter===f?"#fff":"#6b7280", border:"none", cursor:"pointer" }}>{f}</button>
          ))}
        </div>
        <div style={{ maxHeight:360, overflowY:"auto", padding:"12px" }}>
          {shown.map(n => (
            <div key={n.id} style={{ display:"flex", gap:12, padding:"12px", borderRadius:12, background:n.unread?"#fff7ed":"transparent", marginBottom:4, cursor:"pointer" }}
              onMouseEnter={e => e.currentTarget.style.background=n.unread?"#fff7ed":"#f9fafb"}
              onMouseLeave={e => e.currentTarget.style.background=n.unread?"#fff7ed":"transparent"}>
              <div style={{ width:36, height:36, borderRadius:10, background:n.bg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <Icon d={ICONS[n.icon]} size={15} stroke={n.color} />
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                  <span style={{ fontSize:12, fontWeight:600, color:n.unread?"#1e293b":"#64748b" }}>{n.title}</span>
                  <div style={{ display:"flex", alignItems:"center", gap:6, flexShrink:0 }}>
                    {n.unread && <span style={{ width:6, height:6, borderRadius:"50%", background:"#f97316", display:"block" }} />}
                    <span style={{ fontSize:10, color:"#94a3b8" }}>{n.time}</span>
                  </div>
                </div>
                <p style={{ fontSize:11, color:"#94a3b8", margin:"2px 0 0", lineHeight:1.5 }}>{n.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div style={{ borderTop:"1px solid #f1f5f9", padding:"12px 20px" }}>
          <button style={{ width:"100%", fontSize:11, fontWeight:600, color:"#f97316", background:"none", border:"none", cursor:"pointer" }}>View all notifications</button>
        </div>
      </div>
    </>
  );
}

// ─── Profile Panel ─────────────────────────────────────────────────────────────
function ProfilePanel({ onClose, fullName, onLogout, loggingOut }) {
  return (
    <>
      <Backdrop onClick={onClose} />
      <div style={{ position:"fixed", top:58, right:16, zIndex:50, width:280, borderRadius:16, background:"#fff", border:"1px solid #f1f5f9", boxShadow:"0 20px 60px rgba(0,0,0,0.12)", overflow:"hidden", animation:"slideDown .18s cubic-bezier(.4,0,.2,1)", fontFamily:"inherit" }}>
        <div style={{ padding:"20px", background:"linear-gradient(135deg,#fff7ed,#fce7f3)", borderBottom:"1px solid #f1f5f9" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:48, height:48, borderRadius:16, background:"linear-gradient(135deg,#f97316,#ec4899)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:18, fontWeight:800 }}>
              {fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p style={{ fontSize:14, fontWeight:700, color:"#1e293b", margin:0 }}>{fullName}</p>
              <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:3 }}>
                <span style={{ width:6, height:6, borderRadius:"50%", background:"#22c55e", display:"block" }} />
                <span style={{ fontSize:10, color:"#64748b" }}>Employee · Online</span>
              </div>
            </div>
          </div>
        </div>
        <div style={{ padding:"8px 12px" }}>
          {[
            { icon:"user",     label:"My Profile",        desc:"View & edit profile"    },
            { icon:"settings", label:"Account Settings",  desc:"Preferences & security" },
            { icon:"bell",     label:"Notifications",     desc:"Manage alerts"          },
            { icon:"shield",   label:"Privacy",           desc:"Data & permissions"     },
          ].map(item => (
            <button key={item.label} style={{ width:"100%", display:"flex", alignItems:"center", gap:12, padding:"10px 12px", borderRadius:10, border:"none", background:"transparent", cursor:"pointer", textAlign:"left" }}
              onMouseEnter={e => e.currentTarget.style.background="#fff7ed"}
              onMouseLeave={e => e.currentTarget.style.background="transparent"}>
              <div style={{ width:32, height:32, borderRadius:8, background:"#f1f5f9", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <Icon d={ICONS[item.icon]} size={14} stroke="#64748b" />
              </div>
              <div>
                <p style={{ fontSize:12, fontWeight:600, color:"#374151", margin:0 }}>{item.label}</p>
                <p style={{ fontSize:10, color:"#94a3b8", margin:0 }}>{item.desc}</p>
              </div>
              <Icon d={ICONS.chevRight} size={12} stroke="#d1d5db" style={{ marginLeft:"auto" }} />
            </button>
          ))}
        </div>
        <div style={{ borderTop:"1px solid #f1f5f9", padding:"8px 12px 12px" }}>
          <button onClick={onLogout} disabled={loggingOut} style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"10px", borderRadius:10, background:"transparent", border:"none", fontSize:12, fontWeight:700, color:"#ef4444", cursor:"pointer" }}
            onMouseEnter={e => e.currentTarget.style.background="#fef2f2"}
            onMouseLeave={e => e.currentTarget.style.background="transparent"}>
            {loggingOut ? <Spinner color="#ef4444" size={14} /> : <Icon d={ICONS.logOut} size={14} stroke="#ef4444" />}
            {loggingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Employee Work Cycle ──────────────────────────────────────────────────────
function EmployeeWorkCyclePage() {
  const [activeTab, setActiveTab] = useState("notice-period");
  const tabs = [
    { id:"notice-period",        label:"Notice Period",  component:NoticePeriodTracker },
    { id:"probation-management", label:"Probation",      component:ProbationManagement },
    { id:"promotion",            label:"Promotion",      component:Promotion           },
    { id:"resignation",          label:"Resignation",    component:Resignation         },
    { id:"termination",          label:"Termination",    component:Termination         },
  ];
  const ActiveComp = tabs.find(t => t.id === activeTab)?.component || NoticePeriodTracker;
  return (
    <div style={{ background:"#fff", borderRadius:16, border:"1px solid #f1f5f9", overflow:"hidden" }}>
      <div style={{ borderBottom:"1px solid #f1f5f9", background:"#f9fafb", padding:"0 16px", display:"flex", gap:4, overflowX:"auto" }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{ padding:"12px 20px", background:"transparent", border:"none", borderBottom:activeTab===tab.id?"2px solid #f97316":"2px solid transparent", color:activeTab===tab.id?"#f97316":"#6b7280", fontSize:13, fontWeight:activeTab===tab.id?700:500, cursor:"pointer", whiteSpace:"nowrap" }}>
            {tab.label}
          </button>
        ))}
      </div>
      <div style={{ padding:24 }}><ActiveComp /></div>
    </div>
  );
}

// ─── Dashboard Charts ─────────────────────────────────────────────────────────
const PerfChart = () => {
  const months=["Jan","Feb","Mar","Apr","May","Jun","Jul"],vals=[18,22,30,35,42,55,60];
  const W=440,H=115,pL=30,pB=20,pR=10,pT=10,maxV=65;
  const pts=vals.map((v,i)=>[pL+(i/(vals.length-1))*(W-pL-pR),pT+(1-v/maxV)*(H-pT-pB)]);
  const area=`M${pts[0][0]},${pts[0][1]} `+pts.slice(1).map(p=>`L${p[0]},${p[1]}`).join(" ")+` L${pts[pts.length-1][0]},${H-pB} L${pts[0][0]},${H-pB} Z`;
  const line=`M${pts[0][0]},${pts[0][1]} `+pts.slice(1).map(p=>`L${p[0]},${p[1]}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:115}}>
      <defs><linearGradient id="pg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f97316" stopOpacity=".25"/><stop offset="100%" stopColor="#f97316" stopOpacity=".02"/></linearGradient></defs>
      <path d={area} fill="url(#pg)"/>
      <path d={line} fill="none" stroke="#f97316" strokeWidth="2" strokeLinejoin="round"/>
      {pts.map(([x,y],i)=><circle key={i} cx={x} cy={y} r={3} fill="#f97316"/>)}
      {months.map((m,i)=><text key={i} x={pL+(i/(months.length-1))*(W-pL-pR)} y={H} textAnchor="middle" fontSize="9" fill="#94a3b8">{m}</text>)}
    </svg>
  );
};

const SkillCircle = ({pct,color}) => {
  const c=2*Math.PI*16;
  return (
    <svg width={38} height={38} viewBox="0 0 40 40">
      <circle cx={20} cy={20} r={16} fill="none" stroke="#e2e8f0" strokeWidth={4}/>
      <circle cx={20} cy={20} r={16} fill="none" stroke={color} strokeWidth={4} strokeDasharray={`${(pct/100)*c} ${c-(pct/100)*c}`} strokeDashoffset={25} strokeLinecap="round"/>
      <text x={20} y={24} textAnchor="middle" fontSize={9} fontWeight={700} fill="#1e293b">{pct}%</text>
    </svg>
  );
};

function SparkBars({color,values}) {
  const max=Math.max(...values);
  return (
    <svg viewBox="0 0 88 44" style={{width:88,height:44}}>
      {values.map((v,i)=><rect key={i} x={i*8} y={40-(v/max)*34} width={5} height={(v/max)*34} rx={2} fill={color} opacity={0.35+(i/(values.length-1))*0.65}/>)}
    </svg>
  );
}

function StatCard({ iconD, iconBg, label, value, badge, chartColor, chartValues, onClick }) {
  return (
    <div onClick={onClick} style={{ background:"#fff", borderRadius:16, padding:20, border:"1px solid #f1f5f9", boxShadow:"0 1px 3px rgba(0,0,0,0.04)", cursor:onClick?"pointer":"default" }}
      onMouseEnter={e => { if(onClick) e.currentTarget.style.boxShadow="0 4px 20px rgba(0,0,0,0.08)"; }}
      onMouseLeave={e => e.currentTarget.style.boxShadow="0 1px 3px rgba(0,0,0,0.04)"}>
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:12 }}>
        <div style={{ width:44, height:44, borderRadius:12, background:iconBg, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <Icon d={iconD} size={20} stroke="#fff" sw={1.8} />
        </div>
      </div>
      <p style={{ fontSize:11, color:"#94a3b8", fontWeight:500, margin:"0 0 4px" }}>{label}</p>
      <p style={{ fontSize:24, fontWeight:800, color:"#1e293b", margin:"0 0 12px" }}>{value}</p>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <span style={{ fontSize:11, fontWeight:600, color:"#22c55e", background:"#f0fdf4", padding:"2px 8px", borderRadius:10 }}>{badge}</span>
        {chartValues && <SparkBars color={chartColor||iconBg} values={chartValues} />}
      </div>
    </div>
  );
}

function AttendanceCard({ attendance, loading, punching, error, onPunch }) {
  const now = useClock();
  const isPunchedIn = attendance?.last_punch_type==="in";
  const shift = attendance?.shift;
  const totalHours = attendance?.total_hours??0;
  const punchList  = attendance?.punches??[];
  const firstIn    = punchList.find(p=>p.type==="in");
  const pct = Math.min(shift?.progress_percent??0,100);
  const r=40,circ=2*Math.PI*r,dash=(pct/100)*circ;
  const timeStr = now.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:true});
  const dateStr = now.toLocaleDateString("en-US",{day:"2-digit",month:"short",year:"numeric"});

  return (
    <div style={{ background:"#fff", borderRadius:16, border:"1px solid #f1f5f9", padding:"18px 16px", textAlign:"center", position:"relative" }}>
      <div style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"3px 10px", borderRadius:20, background:isPunchedIn?"#dcfce7":"#f1f5f9", marginBottom:6 }}>
        <div style={{ width:6, height:6, borderRadius:"50%", background:isPunchedIn?"#22c55e":"#9ca3af" }} />
        <span style={{ fontSize:10, fontWeight:700, color:isPunchedIn?"#166534":"#6b7280" }}>{isPunchedIn?"Currently Working":"Punched Out"}</span>
      </div>
      <div style={{ fontSize:11, fontWeight:700, color:"#1e293b", marginBottom:2 }}>Attendance</div>
      <div style={{ fontSize:11, color:"#94a3b8", marginBottom:10 }}>{timeStr}, {dateStr}</div>
      <div style={{ display:"flex", justifyContent:"center", marginBottom:10, position:"relative" }}>
        <svg width={100} height={100} viewBox="0 0 100 100">
          <circle cx={50} cy={50} r={r} fill="none" stroke="#e2e8f0" strokeWidth={8}/>
          <circle cx={50} cy={50} r={r} fill="none" stroke={isPunchedIn?"#22c55e":"#9ca3af"} strokeWidth={8} strokeDasharray={`${dash} ${circ-dash}`} strokeLinecap="round" style={{transform:"rotate(-90deg)",transformOrigin:"50% 50%"}}/>
        </svg>
        <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
          <span style={{ fontSize:13, fontWeight:800, color:"#1e293b" }}>{fmtHMS(totalHours)}</span>
          <span style={{ fontSize:9, color:"#94a3b8" }}>Total Hours</span>
        </div>
      </div>
      <div style={{ fontSize:11, color:"#94a3b8", marginBottom:12 }}>
        {firstIn ? `First punch at ${fmt12(firstIn.punch_time)}` : "No punch today"}
      </div>
      {error && <div style={{ background:"#fef2f2", border:"1px solid #fecaca", borderRadius:6, padding:"5px 8px", fontSize:11, color:"#991b1b", marginBottom:8 }}>{error}</div>}
      {loading ? (
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:6, padding:"9px 0", background:"#f9fafb", borderRadius:8 }}>
          <Spinner size={14} /><span style={{ fontSize:12, color:"#94a3b8" }}>Loading…</span>
        </div>
      ) : (
        <button disabled={punching} onClick={() => onPunch(isPunchedIn?"out":"in")}
          style={{ width:"100%", background:punching?"#e5e7eb":isPunchedIn?"linear-gradient(90deg,#ef4444,#dc2626)":"linear-gradient(90deg,#f97316,#ea580c)", color:punching?"#9ca3af":"#fff", border:"none", borderRadius:8, padding:"10px 0", fontSize:13, fontWeight:700, cursor:punching?"not-allowed":"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:7 }}>
          {punching ? <Spinner size={14} color="#9ca3af" /> : <Icon d={isPunchedIn?ICONS.logOut:ICONS.logIn} stroke={punching?"#9ca3af":"#fff"} size={14} />}
          {punching?"Processing…":isPunchedIn?"Punch Out":"Punch In"}
        </button>
      )}
    </div>
  );
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────
function NavItem({ iconD, label, badge, active, onClick, chevron }) {
  return (
    <div onClick={onClick} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 12px", borderRadius:10, cursor:"pointer", background:active?"#fff7ed":"transparent", color:active?"#f97316":"#6b7280", marginBottom:2, transition:"all 0.15s", userSelect:"none" }}
      onMouseEnter={e => { if(!active){ e.currentTarget.style.background="#fff7ed"; e.currentTarget.style.color="#f97316"; }}}
      onMouseLeave={e => { if(!active){ e.currentTarget.style.background="transparent"; e.currentTarget.style.color="#6b7280"; }}}>
      <Icon d={iconD} size={16} stroke={active?"#f97316":"currentColor"} sw={1.8} />
      <span style={{ fontSize:13, fontWeight:active?600:500, flex:1 }}>{label}</span>
      {badge && <span style={{ fontSize:9, padding:"1px 6px", borderRadius:8, background:"#f97316", color:"#fff", fontWeight:700 }}>{badge}</span>}
      {chevron !== undefined && (
        <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke={active?"#f97316":"#94a3b8"} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" style={{ transform:chevron?"rotate(180deg)":"rotate(0)", transition:"transform 0.2s", flexShrink:0 }}>
          <path d="M6 9l6 6 6-6" />
        </svg>
      )}
    </div>
  );
}

function SubNavItem({ iconD, label, page, activePage, onNavigate }) {
  const isActive = activePage===page;
  return (
    <div onClick={() => onNavigate(page)} style={{ display:"flex", alignItems:"center", gap:8, padding:"7px 10px", borderRadius:8, cursor:"pointer", background:isActive?"#fff7ed":"transparent", color:isActive?"#f97316":"#6b7280", marginBottom:1, fontSize:12, fontWeight:isActive?600:400, transition:"all 0.12s" }}
      onMouseEnter={e => { if(!isActive){ e.currentTarget.style.background="#fff7ed"; e.currentTarget.style.color="#f97316"; }}}
      onMouseLeave={e => { if(!isActive){ e.currentTarget.style.background="transparent"; e.currentTarget.style.color="#6b7280"; }}}>
      <Icon d={iconD} size={13} stroke={isActive?"#f97316":"currentColor"} sw={1.8} />
      <span>{label}</span>
    </div>
  );
}

function Sidebar({ activePage, onNavigate, fullName, designation }) {
  const [attendOpen, setAttendOpen] = useState(["attendance-employee","attendance-shift","attendance-holidays"].includes(activePage));
  const isAttend = ["attendance-employee","attendance-shift","attendance-holidays"].includes(activePage);

  useEffect(() => { if(isAttend) setAttendOpen(true); }, [isAttend]);

  return (
    <aside style={{ width:240, background:"#fff", borderRight:"1px solid #f1f5f9", display:"flex", flexDirection:"column", flexShrink:0, height:"100vh" }}>
      <div style={{ padding:"16px 20px", borderBottom:"1px solid #f1f5f9", display:"flex", alignItems:"center", gap:10 }}>
        <div style={{ width:32, height:32, borderRadius:9, background:"#f97316", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:15, fontWeight:800 }}>M</div>
        <span style={{ fontSize:16, fontWeight:800, color:"#1e293b", letterSpacing:"-0.4px" }}>Mindcarve</span>
      </div>
      <nav style={{ padding:"14px 12px", flex:1, overflowY:"auto" }}>
        <p style={{ fontSize:10, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.9px", padding:"0 8px 8px" }}>Main Menu</p>

        {/* Dashboard — internal */}
        <NavItem iconD={ICONS.home}   label="Dashboard" badge="Hot" active={activePage===null}  onClick={() => onNavigate(null)} />

       <NavItem iconD={ICONS.folder} label="Projects" active={activePage==="projects"} onClick={() => onNavigate("projects")} />
       <NavItem iconD={ICONS.list}   label="Tasks"    active={activePage==="Tasks"}    onClick={() => onNavigate("Tasks")} />

        <p style={{ fontSize:10, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.9px", padding:"16px 8px 8px" }}>Attendance</p>
        <div>
          <NavItem iconD={ICONS.attendance} label="Attendance" active={isAttend} chevron={attendOpen} onClick={() => setAttendOpen(o=>!o)} />
          <div style={{ overflow:"hidden", maxHeight:attendOpen?"200px":"0", transition:"max-height 0.2s", marginLeft:16, paddingLeft:12, borderLeft:"2px solid #f1f5f9" }}>
            <div style={{ paddingTop:4, paddingBottom:4 }}>
              <SubNavItem iconD={ICONS.list}     label="Attendance"       page="attendance-employee" activePage={activePage} onNavigate={onNavigate} />
              <SubNavItem iconD={ICONS.calendar} label="Shift & Schedule" page="attendance-shift"    activePage={activePage} onNavigate={onNavigate} />
              <SubNavItem iconD={ICONS.calendar} label="Holiday Calendar" page="attendance-holidays" activePage={activePage} onNavigate={onNavigate} />
            </div>
          </div>
        </div>
        <NavItem iconD={ICONS.calendar}  label="Leave"      active={activePage==="leave"}               onClick={() => onNavigate("leave")} />
        <NavItem iconD={ICONS.calendar}  label="Holidays"   active={activePage==="holidays"}            onClick={() => onNavigate("holidays")} />
        <NavItem iconD={ICONS.briefcase} label="Work Cycle" active={activePage==="employee-work-cycle"} onClick={() => onNavigate("employee-work-cycle")} />

        <p style={{ fontSize:10, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.9px", padding:"16px 8px 8px" }}>Payroll</p>
        <NavItem iconD={ICONS.dollar} label="Payroll" active={activePage==="payroll"} onClick={() => onNavigate("payroll")} />

        <p style={{ fontSize:10, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.9px", padding:"16px 8px 8px" }}>Support</p>
        <NavItem iconD={ICONS.ticket} label="Tickets" active={activePage==="tickets"} onClick={() => onNavigate("tickets")} />
      </nav>
      <div style={{ padding:"12px 16px", borderTop:"1px solid #f1f5f9" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:36, height:36, borderRadius:10, background:"linear-gradient(135deg,#f97316,#ec4899)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:14, fontWeight:800, flexShrink:0 }}>
            {(fullName||"E").charAt(0).toUpperCase()}
          </div>
          <div style={{ overflow:"hidden" }}>
            <div style={{ fontSize:12, fontWeight:600, color:"#1e293b", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{fullName||"Employee"}</div>
            <div style={{ fontSize:10, color:"#94a3b8" }}>{designation||"Employee"}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

// ─── Topbar ───────────────────────────────────────────────────────────────────
function Topbar({ fullName, isPunchedIn, openPanel, togglePanel }) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [spinning, setSpinning] = useState(false);

  const handleLogout = async () => {
    if (loggingOut) return; setLoggingOut(true);
    try { await fetch(`${BASE}/api/auth/logout`, { method:"POST", headers:HEADERS() }); } catch(_) {}
    finally {
      localStorage.removeItem("employee_auth_token");
      localStorage.removeItem("auth_user");
      localStorage.removeItem("emp_active_page");
      router.replace("/auth/Employeelogin");
    }
  };

  const triggerRefresh = () => { if(spinning) return; setSpinning(true); setTimeout(()=>setSpinning(false),900); };

  const IconBtn = ({ panelKey, iconD, badge, title }) => {
    const isActive = openPanel === panelKey;
    return (
      <Tooltip label={title}>
        <button onClick={() => togglePanel(panelKey)} style={{ position:"relative", width:32, height:32, borderRadius:8, background:isActive?"#fff7ed":"#f9fafb", border:`1px solid ${isActive?"#fed7aa":"#e5e7eb"}`, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:isActive?"#f97316":"#6b7280" }}>
          <Icon d={iconD} size={14} stroke="currentColor" sw={1.8} />
          {badge > 0 && <div style={{ position:"absolute", top:-3, right:-3, width:14, height:14, borderRadius:"50%", background:"#f97316", border:"2px solid #fff", display:"flex", alignItems:"center", justifyContent:"center" }}><span style={{ fontSize:7, color:"#fff", fontWeight:800 }}>{badge}</span></div>}
        </button>
      </Tooltip>
    );
  };

  return (
    <div style={{ height:56, background:"#fff", borderBottom:"1px solid #f1f5f9", display:"flex", alignItems:"center", padding:"0 20px", gap:8, flexShrink:0, position:"relative", zIndex:100 }}>
      <div style={{ flex:1, maxWidth:280, display:"flex", alignItems:"center", gap:8, background:"#f9fafb", border:"1px solid #e5e7eb", borderRadius:10, padding:"6px 12px" }}>
        <Icon d={ICONS.search} stroke="#94a3b8" size={13} />
        <input placeholder="Search in HRMS…" style={{ border:"none", background:"transparent", fontSize:12, color:"#6b7280", outline:"none", width:"100%" }} />
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:6, marginLeft:"auto" }}>
        <div style={{ display:"flex", alignItems:"center", gap:5, padding:"4px 10px", borderRadius:20, background:isPunchedIn?"#dcfce7":"#f1f5f9", border:`1px solid ${isPunchedIn?"#bbf7d0":"#e5e7eb"}` }}>
          <div style={{ width:6, height:6, borderRadius:"50%", background:isPunchedIn?"#22c55e":"#94a3b8", animation:isPunchedIn?"syncPulse 2s ease-in-out infinite":"none" }} />
          <span style={{ fontSize:11, fontWeight:600, color:isPunchedIn?"#166534":"#6b7280" }}>{isPunchedIn?"Working":"Offline"}</span>
        </div>
        <Tooltip label="Refresh">
          <button onClick={triggerRefresh} style={{ width:32, height:32, borderRadius:8, background:"#f9fafb", border:"1px solid #e5e7eb", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
            <Icon d={ICONS.refresh} size={13} stroke={spinning?"#f97316":"#6b7280"} style={{ animation:spinning?"spin 0.8s linear infinite":"none" }} />
          </button>
        </Tooltip>
        <IconBtn panelKey="notifications" iconD={ICONS.bell}  badge={3} title="Notifications" />
        <IconBtn panelKey="mail"          iconD={ICONS.mail}  badge={3} title="Messages"      />
        <Tooltip label="My Profile">
          <button onClick={() => togglePanel("profile")} style={{ width:32, height:32, borderRadius:10, background:"linear-gradient(135deg,#f97316,#ec4899)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:12, fontWeight:800, border:"none", cursor:"pointer", marginLeft:4 }}>
            {(fullName||"E").charAt(0).toUpperCase()}
          </button>
        </Tooltip>
      </div>
      {openPanel==="notifications" && <NotificationPanel onClose={() => togglePanel(null)} />}
      {openPanel==="profile" && <ProfilePanel onClose={() => togglePanel(null)} fullName={fullName||"Employee"} onLogout={handleLogout} loggingOut={loggingOut} />}
    </div>
  );
}

// ─── Placeholder ──────────────────────────────────────────────────────────────
function PlaceholderPage({ title }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"60px 20px", background:"#fff", borderRadius:16, border:"1px solid #f1f5f9" }}>
      <div style={{ width:64, height:64, borderRadius:"50%", background:"#fff7ed", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:16 }}>
        <Icon d={ICONS.settings} stroke="#f97316" size={28} />
      </div>
      <h2 style={{ margin:"0 0 8px", fontSize:18, fontWeight:700, color:"#1e293b" }}>{title}</h2>
      <p style={{ margin:0, fontSize:13, color:"#94a3b8" }}>This page is under construction.</p>
    </div>
  );
}

// ─── Main Dashboard Export ────────────────────────────────────────────────────
export default function EmployeeDashboard() {
  const router = useRouter(); // ← used for Projects & Tasks navigation

  const [activePage, setActivePage] = useState(() => {
    if (typeof window !== "undefined") return localStorage.getItem("emp_active_page") || null;
    return null;
  });
  const [showBanner, setShowBanner] = useState(true);
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [teamMembers, setTeamMembers] = useState([]);
  const [teamMembersLoading, setTeamMembersLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [openPanel, setOpenPanel] = useState(null);

  const { attendance, dashboard, loading:attLoading, punching, error:attError, doPunch } = useAttendance();
  const isPunchedIn = attendance?.last_punch_type==="in";

  const dash = dashboard;
  const todayWorked = Math.max(0, dash?.today?.worked??0);
  const todayTarget = dash?.today?.target??9;
  const weekWorked  = Math.max(0, dash?.week?.worked??0);
  const weekTarget  = dash?.week?.target??45;
  const monthWorked = Math.max(0, dash?.month?.worked??0);
  const monthTarget = dash?.month?.target??180;
  const otHours     = Math.max(0, dash?.overtime?.this_month_hours??0);
  const otTarget    = dash?.overtime?.target_hours??28;
  const weekPct     = Math.min(100,Math.max(0,dash?.week?.progress_percent??0));
  const monthPct    = Math.min(100,Math.max(0,dash?.month?.progress_percent??0));
  const otPct       = Math.min(100,Math.max(0,dash?.overtime?.progress_percent??0));
  const todayPct    = Math.min(100,Math.max(0,todayTarget>0?(todayWorked/todayTarget)*100:0));
  const sumTotal = dash?.summary?.total_working_hours??"—";
  const sumProd  = dash?.summary?.productive_hours??"—";
  const sumBreak = dash?.summary?.break_hours??"—";
  const sumOT    = dash?.summary?.overtime_today??"—";

const navigate = (pg) => {
  setOpenPanel(null);
  setActivePage(pg);
  if (typeof window !== "undefined") {
    if (pg === null) localStorage.removeItem("emp_active_page");
    else localStorage.setItem("emp_active_page", pg);
  }
};

  const togglePanel = (name) => setOpenPanel(prev => name===null ? null : prev===name ? null : name);

  useEffect(() => {
    fetch(`${BASE}/api/employee/profile`, { headers:HEADERS() })
      .then(r=>r.json()).then(json => { if(json.success) setProfile(json.data); })
      .catch(console.error).finally(() => setProfileLoading(false));
  }, []);

  useEffect(() => {
    fetch(`${BASE}/api/employee/projects`, { headers:HEADERS() }).then(r=>r.json()).then(json => {
      let d=null;
      if(json.success&&Array.isArray(json.data)) d=json.data;
      else if(Array.isArray(json.data?.projects)) d=json.data.projects;
      else if(Array.isArray(json)) d=json;
      if(d) setProjects(d);
    }).finally(()=>setProjectsLoading(false));
  }, []);

  useEffect(() => {
    fetch(`${BASE}/api/employee/tasks`, { headers:HEADERS() }).then(r=>r.json()).then(json => {
      if(json.success&&Array.isArray(json.data)) setTasks(json.data);
    }).finally(()=>setTasksLoading(false));
  }, []);

  // Fetch team members (from the first project or a dedicated endpoint)
  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        // First, get the first project the employee is assigned to
        const projectsRes = await fetch(`${BASE}/api/employee/projects`, { headers: HEADERS() });
        const projectsJson = await projectsRes.json();
        let projectsData = null;
        
        if (projectsJson.success && Array.isArray(projectsJson.data)) {
          projectsData = projectsJson.data;
        } else if (Array.isArray(projectsJson.data?.projects)) {
          projectsData = projectsJson.data.projects;
        } else if (Array.isArray(projectsJson)) {
          projectsData = projectsJson;
        }
        
        if (projectsData && projectsData.length > 0) {
          const firstProjectId = projectsData[0].id || projectsData[0].project_id;
          
          if (firstProjectId) {
            // Fetch project details including team members
            const projectRes = await fetch(`${BASE}/api/employee/projects/${firstProjectId}`, { headers: HEADERS() });
            const projectJson = await projectRes.json();
            
            if (projectJson.success && projectJson.data) {
              const projectData = projectJson.data;
              let members = [];
              
              // Extract team members based on the API response structure
              if (projectData.team_members && Array.isArray(projectData.team_members)) {
                members = projectData.team_members;
              } else if (projectData.members && Array.isArray(projectData.members)) {
                members = projectData.members;
              } else if (projectData.employees && Array.isArray(projectData.employees)) {
                members = projectData.employees;
              } else if (projectData.team && Array.isArray(projectData.team)) {
                members = projectData.team;
              }
              
              // Map members to the expected format
              const formattedMembers = members.map(member => ({
                name: `${member.firstname || member.first_name || ''} ${member.lastname || member.last_name || ''}`.trim() || member.name || 'Team Member',
                role: member.role || member.designation || member.position || 'Team Member',
                color: avatarColor(member.name || `${member.firstname} ${member.lastname}`),
                profile_image: member.profile_image,
                id: member.id
              }));
              
              setTeamMembers(formattedMembers);
            }
          }
        }
        
        // If no team members found or no projects, try a separate team endpoint
        if (teamMembers.length === 0) {
          const teamRes = await fetch(`${BASE}/api/employee/team`, { headers: HEADERS() });
          const teamJson = await teamRes.json();
          
          if (teamJson.success && Array.isArray(teamJson.data)) {
            const formattedMembers = teamJson.data.map(member => ({
              name: `${member.firstname || member.first_name || ''} ${member.lastname || member.last_name || ''}`.trim() || member.name || 'Team Member',
              role: member.role || member.designation || member.position || 'Team Member',
              color: avatarColor(member.name || `${member.firstname} ${member.lastname}`),
              profile_image: member.profile_image,
              id: member.id
            }));
            setTeamMembers(formattedMembers);
          }
        }
      } catch (error) {
        console.error("Error fetching team members:", error);
      } finally {
        setTeamMembersLoading(false);
      }
    };
    
    fetchTeamMembers();
  }, []);

  const emp         = profile?.employee;
  const fullName    = profileLoading ? "Loading…" : emp ? `${emp.firstname} ${emp.lastname}` : "Employee";
  const designation = profile?.designation?.name??"Senior Product Designer";
  const department  = profile?.department?.name??"UI/UX Design";
  const email       = emp?.email??"employee@example.com";
  const phone       = emp?.phone_number??"+1 324 3453 545";
  const joiningDate = emp?.joining_date??"15 Jan 2024";

  const pageInfo = PAGE_TITLES[activePage] ?? PAGE_TITLES[null];

  const sparkData = { hours:[8,14,10,18,12,20,16,22,14,18,20], tasks:[4,8,6,10,8,12,10,14,8,10,12] };
  const skills = [
    { name:"Figma",      date:"Updated · 15 May 2025", pct:90, color:"#22c55e" },
    { name:"HTML",       date:"Updated · 12 May 2025", pct:85, color:"#3b82f6" },
    { name:"CSS",        date:"Updated · 12 May 2025", pct:79, color:"#3b82f6" },
    { name:"Javascript", date:"Updated · 13 May 2025", pct:52, color:"#f59e0b" },
  ];
  
  const meetings = [
    { time:"09:25 AM", title:"Marketing Strategy Presentation", dot:"#ef4444" },
    { time:"09:20 AM", title:"Design Review Hospital Project",   dot:"#f59e0b" },
    { time:"09:10 AM", title:"Update of Project Flow",          dot:"#22c55e" },
  ];
  const taskStatusStyle = {
    pending:     { bg:"#fef9c3", text:"#854d0e", label:"Pending"     },
    in_progress: { bg:"#dbeafe", text:"#1e40af", label:"In Progress" },
    completed:   { bg:"#dcfce7", text:"#166534", label:"Completed"   },
    on_hold:     { bg:"#f3f4f6", text:"#6b7280", label:"On Hold"     },
    planning:    { bg:"#ede9fe", text:"#5b21b6", label:"Planning"    },
  };

  // ─── renderContent ──────────────────────────────────────────────────────────
  const renderContent = () => {
    if (activePage === "attendance-employee")                             return <EmployeeAttendancePage ACCENT="#f97316" />;
    if (activePage === "attendance-holidays" || activePage === "holidays") return <HolidaysPage />;
    if (activePage === "attendance-shift")                                return <ShiftSchedulePage />;
    if (activePage === "employee-work-cycle")                             return <EmployeeWorkCyclePage />;
    if (activePage === "leave")                                           return <EmployeeLeavePage ACCENT="#f97316" />;
    if (activePage === "payroll")                                         return <PayrollPage />;
    if (activePage === "tickets")                                         return <TicketsPage />;
    if (activePage === null)                                              return renderDashboard();
    if (activePage === "projects")                                        return <ProjectsPage />;
    if (activePage === "Tasks")                                           return <TasksPage />;
    return <PlaceholderPage title={pageInfo.title} />;
  };

  // ─── renderDashboard ────────────────────────────────────────────────────────
  const renderDashboard = () => (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      {showBanner && (
        <div style={{ background:"#fff", borderRadius:16, padding:20, border:"1px solid #f1f5f9", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:16 }}>
            <div style={{ width:56, height:56, borderRadius:"50%", background:"linear-gradient(135deg,#f97316,#ec4899)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:20, fontWeight:800 }}>
              {fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 style={{ margin:0, fontSize:16, fontWeight:800, color:"#1e293b" }}>Welcome back, {fullName}!</h2>
              <p style={{ margin:"4px 0 0", fontSize:13, color:"#94a3b8" }}>
                You have <span style={{ color:"#f97316", fontWeight:700 }}>{tasks.length}</span> active tasks &amp; your leave status is updated.
              </p>
            </div>
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <button onClick={() => navigate("projects")} style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 14px", background:"#f97316", border:"none", borderRadius:10, fontSize:12, fontWeight:700, color:"#fff", cursor:"pointer" }}>
              <Icon d={ICONS.folder} stroke="#fff" size={14} /> View Projects
            </button>
            <button onClick={() => setShowBanner(false)} style={{ width:30, height:30, borderRadius:8, background:"#f9fafb", border:"1px solid #e5e7eb", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
              <Icon d={ICONS.x} size={12} stroke="#6b7280" />
            </button>
          </div>
        </div>
      )}

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16 }}>
        <StatCard iconD={ICONS.clock}    iconBg="#f97316" label="Hours Today"      value={`${todayWorked.toFixed(1)}/${todayTarget}h`}  badge={`${todayPct.toFixed(0)}%`} chartColor="#f97316" chartValues={sparkData.hours} />
        <StatCard iconD={ICONS.trending} iconBg="#3b82f6" label="Hours This Week"  value={`${weekWorked.toFixed(1)}/${weekTarget}h`}    badge={`${weekPct.toFixed(0)}%`}  chartColor="#3b82f6" chartValues={sparkData.hours} />
        <StatCard iconD={ICONS.activity} iconBg="#8b5cf6" label="Hours This Month" value={`${monthWorked.toFixed(1)}/${monthTarget}h`}  badge={`${monthPct.toFixed(0)}%`} chartColor="#8b5cf6" chartValues={sparkData.tasks} />
        <StatCard iconD={ICONS.star}     iconBg="#f59e0b" label="Overtime / Month" value={`${otHours}/${otTarget}h`}                   badge={`${otPct.toFixed(0)}%`}    chartColor="#f59e0b" chartValues={sparkData.tasks} />
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"280px 1fr", gap:16 }}>
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <div style={{ background:"#fff", borderRadius:16, border:"1px solid #f1f5f9", overflow:"hidden" }}>
            <div style={{ background:"linear-gradient(135deg,#1e293b,#334155)", padding:16, display:"flex", alignItems:"center", gap:12 }}>
              <Avatar name={fullName} size={50} color="#f97316" />
              <div>
                <div style={{ fontSize:14, fontWeight:700, color:"#fff" }}>{fullName}</div>
                <div style={{ fontSize:11, color:"#94a3b8", marginTop:2 }}>{designation}</div>
              </div>
            </div>
            <div style={{ padding:"12px 14px", display:"flex", flexDirection:"column", gap:8 }}>
              {[{d:ICONS.phone,v:phone},{d:ICONS.mail,v:email},{d:ICONS.mapPin,v:department},{d:ICONS.calendar,v:joiningDate}].map(({d,v},i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <Icon d={d} stroke="#94a3b8" size={14} /><span style={{ fontSize:11, color:"#4b5563" }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
          <AttendanceCard attendance={attendance} loading={attLoading} punching={punching} error={attError} onPunch={doPunch} />
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:12 }}>
            {[
              { value:`${sumTotal}`, label:"Total Working Hours" },
              { value:`${sumProd}`,  label:"Productive Hours"    },
              { value:`${sumBreak}`, label:"Break Hours"         },
              { value:`${sumOT}`,    label:"Overtime Today"      },
            ].map(({value,label},i) => (
              <div key={i} style={{ background:"#fff", borderRadius:14, border:"1px solid #f1f5f9", padding:"14px 16px" }}>
                <div style={{ fontSize:22, fontWeight:800, color:"#1e293b" }}>{value}</div>
                <div style={{ fontSize:11, color:"#94a3b8", margin:"2px 0 4px" }}>{label}</div>
                <div style={{ height:4, background:"#f1f5f9", borderRadius:2, marginTop:8, overflow:"hidden" }}>
                  <div style={{ width:`${[todayPct,weekPct,monthPct,otPct][i]}%`, height:"100%", background:["#f97316","#3b82f6","#8b5cf6","#f59e0b"][i], borderRadius:2 }} />
                </div>
              </div>
            ))}
          </div>
          <div style={{ background:"#fff", borderRadius:16, border:"1px solid #f1f5f9", padding:16 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
              <span style={{ fontSize:13, fontWeight:700, color:"#1e293b" }}>Weekly Progress</span>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {[{label:"Today",pct:todayPct,c:"#f97316"},{label:"Week",pct:weekPct,c:"#3b82f6"},{label:"Month",pct:monthPct,c:"#8b5cf6"},{label:"Overtime",pct:otPct,c:"#f59e0b"}].map(({label,pct,c}) => (
                <div key={label} style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <span style={{ fontSize:11, color:"#94a3b8", width:56, flexShrink:0 }}>{label}</span>
                  <div style={{ flex:1, height:6, background:"#f1f5f9", borderRadius:3, overflow:"hidden" }}>
                    <div style={{ width:`${pct}%`, height:"100%", background:c, borderRadius:3 }} />
                  </div>
                  <span style={{ fontSize:11, fontWeight:700, color:"#374151", width:32, textAlign:"right" }}>{pct.toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        {/* Projects preview card */}
        <div style={{ background:"#fff", borderRadius:16, border:"1px solid #f1f5f9", padding:16 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
            <span style={{ fontSize:13, fontWeight:700, color:"#1e293b" }}>Projects</span>
            <button onClick={() => navigate("projects")} style={{ fontSize:11, fontWeight:600, color:"#f97316", background:"none", border:"none", cursor:"pointer" }}>View All →</button>
          </div>
          {projectsLoading ? <div style={{ textAlign:"center", padding:30 }}><Spinner /></div> : projects.length===0 ? (
            <div style={{ textAlign:"center", padding:24, color:"#94a3b8", fontSize:12 }}>No projects assigned</div>
          ) : (
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              {projects.slice(0,4).map((p,i) => (
                <div key={p.id||i} style={{ background:"#f9fafb", borderRadius:10, padding:12, border:"1px solid #f1f5f9", cursor:"pointer" }}
                  onClick={() => navigate("projects")}
                  onMouseEnter={e => { e.currentTarget.style.borderColor="#fed7aa"; e.currentTarget.style.background="#fff7ed"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor="#f1f5f9"; e.currentTarget.style.background="#f9fafb"; }}>
                  <div style={{ fontSize:12, fontWeight:600, color:"#1e293b", marginBottom:4 }}>{p.project_name||"Untitled"}</div>
                  <div style={{ fontSize:11, color:"#ef4444", marginBottom:6 }}>{p.end_date?`Due: ${p.end_date}`:"No deadline"}</div>
                  <div style={{ height:4, background:"#e5e7eb", borderRadius:2, overflow:"hidden" }}>
                    <div style={{ width:`${p.progress??0}%`, height:"100%", background:"#f97316", borderRadius:2 }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tasks preview card */}
        <div style={{ background:"#fff", borderRadius:16, border:"1px solid #f1f5f9", padding:16 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
            <span style={{ fontSize:13, fontWeight:700, color:"#1e293b" }}>Tasks</span>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ fontSize:10, background:"#f1f5f9", padding:"2px 8px", borderRadius:10, color:"#6b7280" }}>{tasksLoading?"…":`${tasks.length} Total`}</span>
              <button onClick={() => navigate("Tasks")} style={{ fontSize:11, fontWeight:600, color:"#f97316", background:"none", border:"none", cursor:"pointer" }}>View All →</button>
            </div>
          </div>
          {tasksLoading ? <div style={{ textAlign:"center", padding:30 }}><Spinner /></div> : tasks.slice(0,6).map((t,i) => {
            const key=(t.status??"").toLowerCase().replace(" ","_");
            const sc=taskStatusStyle[key]||{bg:"#f3f4f6",text:"#6b7280",label:t.status};
            return (
              <div key={t.id??i} style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 0", borderBottom:i<5?"1px solid #f9fafb":"none", cursor:"pointer" }}
                onClick={() => navigate("Tasks")}
                onMouseEnter={e => e.currentTarget.style.background="#fffbf5"}
                onMouseLeave={e => e.currentTarget.style.background="transparent"}>
                <div style={{ width:6, height:6, borderRadius:"50%", background:t.priority==="high"?"#ef4444":t.priority==="medium"?"#f59e0b":"#94a3b8", flexShrink:0 }} />
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:12, color:"#374151", fontWeight:500, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{t.title}</div>
                </div>
                <span style={{ fontSize:10, padding:"2px 7px", borderRadius:12, background:sc.bg, color:sc.text, fontWeight:600, flexShrink:0 }}>{sc.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 220px", gap:16 }}>
        <div style={{ background:"#fff", borderRadius:16, border:"1px solid #f1f5f9", padding:16 }}>
          <div style={{ fontSize:13, fontWeight:700, color:"#1e293b", marginBottom:4 }}>Performance</div>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
            <span style={{ fontSize:22, fontWeight:800, color:"#1e293b" }}>98%</span>
            <span style={{ fontSize:10, padding:"2px 7px", background:"#dcfce7", color:"#166534", borderRadius:10 }}>↑ 13%</span>
          </div>
          <PerfChart />
        </div>
        <div style={{ background:"#fff", borderRadius:16, border:"1px solid #f1f5f9", padding:16 }}>
          <div style={{ fontSize:13, fontWeight:700, color:"#1e293b", marginBottom:14 }}>My Skills</div>
          {skills.map((s,i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:12, padding:"8px 0", borderBottom:i<skills.length-1?"1px solid #f3f4f6":"none" }}>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:12, fontWeight:600, color:"#1e293b" }}>{s.name}</div>
                <div style={{ fontSize:10, color:"#94a3b8" }}>{s.date}</div>
              </div>
              <SkillCircle pct={s.pct} color={s.color} />
            </div>
          ))}
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <div style={{ background:"#1e293b", borderRadius:14, padding:14 }}>
            <div style={{ fontSize:12, fontWeight:700, color:"#fff", marginBottom:10 }}>Leave Details</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
              {[["Total",16],["Taken",10],["Absent",2],["Balance",6]].map(([l,v]) => (
                <div key={l}><div style={{ fontSize:9, color:"#64748b", textTransform:"uppercase" }}>{l}</div><div style={{ fontSize:18, fontWeight:800, color:"#fff" }}>{v}</div></div>
              ))}
            </div>
            <button onClick={() => navigate("leave")} style={{ width:"100%", marginTop:12, background:"#f97316", color:"#fff", border:"none", borderRadius:8, padding:"8px 0", fontSize:11, fontWeight:700, cursor:"pointer" }}>
              Apply Leave
            </button>
          </div>
          <div style={{ background:"#fff", borderRadius:14, border:"1px solid #f1f5f9", padding:14 }}>
            <div style={{ fontSize:12, fontWeight:700, color:"#1e293b", marginBottom:10 }}>Meetings Today</div>
            {meetings.map((m,i) => (
              <div key={i} style={{ display:"flex", gap:8, padding:"6px 0", borderBottom:i<meetings.length-1?"1px solid #f9fafb":"none" }}>
                <div style={{ width:3, background:m.dot, borderRadius:2, flexShrink:0 }} />
                <div>
                  <div style={{ fontSize:11, fontWeight:600, color:"#1e293b" }}>{m.title}</div>
                  <div style={{ fontSize:10, color:"#94a3b8" }}>{m.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ background:"#fff", borderRadius:16, border:"1px solid #f1f5f9", padding:16 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
          <span style={{ fontSize:13, fontWeight:700, color:"#1e293b" }}>Team Members</span>
        </div>
        {teamMembersLoading ? (
          <div style={{ textAlign:"center", padding:30 }}><Spinner /></div>
        ) : teamMembers.length === 0 ? (
          <div style={{ textAlign:"center", padding:20, color:"#94a3b8", fontSize:12 }}>No team members found</div>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
            {teamMembers.map((m,i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"12px 14px", background:"#f9fafb", borderRadius:12, border:"1px solid #f1f5f9" }}>
                <Avatar name={m.name} size={36} color={m.color} img={m.profile_image} />
                <div>
                  <div style={{ fontSize:12, fontWeight:600, color:"#1e293b" }}>{m.name}</div>
                  <div style={{ fontSize:10, color:"#94a3b8" }}>{m.role}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ textAlign:"center", fontSize:11, color:"#94a3b8", paddingTop:4 }}>
        2014–2026 © SmartHR &nbsp;·&nbsp; Designed &amp; Developed By <span style={{ color:"#f97316", fontWeight:600 }}>Dreamo</span>
      </div>
    </div>
  );

  return (
    <ProtectedRoute requiredRole="employee">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 99px; }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes syncPulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes slideDown { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
      <div style={{ display:"flex", height:"100vh", fontFamily:"'Plus Jakarta Sans',-apple-system,sans-serif", background:"#f8fafc", color:"#1e293b", overflow:"hidden" }}>
        {sidebarOpen && <Sidebar activePage={activePage} onNavigate={navigate} fullName={fullName} designation={designation} />}
        <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", height:"100vh" }}>
          <Topbar fullName={fullName} isPunchedIn={isPunchedIn} openPanel={openPanel} togglePanel={togglePanel} />
          <div style={{ background:"#fff", borderBottom:"1px solid #f1f5f9", padding:"10px 24px", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <button onClick={() => setSidebarOpen(o=>!o)} style={{ width:32, height:32, borderRadius:8, background:"#f9fafb", border:"1px solid #e5e7eb", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", marginRight:8 }}>
                  <Icon d={ICONS.menu} size={15} stroke="#6b7280" />
                </button>
                <h1 style={{ margin:0, fontSize:17, fontWeight:700, color:"#1e293b" }}>{pageInfo.title}</h1>
              </div>
              <div style={{ fontSize:11, color:"#94a3b8", marginTop:3, display:"flex", alignItems:"center", gap:4, paddingLeft:40 }}>
                <Icon d={ICONS.home} size={11} stroke="#94a3b8" />
                <Icon d={ICONS.chevRight} size={11} stroke="#94a3b8" />
                <span>Dashboard</span>
                <Icon d={ICONS.chevRight} size={11} stroke="#94a3b8" />
                <span style={{ color:"#374151", fontWeight:600 }}>{pageInfo.crumb}</span>
              </div>
            </div>
          </div>
          <div style={{ flex:1, overflowY:"auto", padding:"20px 24px" }}>
            {renderContent()}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}