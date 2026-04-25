"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

const DEFAULT_THEME = {
  accent:     "#f97316",
  accentDark: "#ea580c",
  sidebar:    "#ffffff",
  topbar:     "#ffffff",
  card:       "#ffffff",
  pageBg:     "#f9fafb",
  text:       "#111827",
  textSub:    "#6b7280",
  border:     "#f1f5f9",
};

let _theme = { ...DEFAULT_THEME };
const getTheme = () => _theme;

const BASE = process.env.NEXT_PUBLIC_API_URL;
const HEADERS = () => ({
  "Authorization": `Bearer ${localStorage.getItem("auth_token")}`,
  "ngrok-skip-browser-warning": "true",
  "Accept": "application/json",
  "Content-Type": "application/json",
});

const ThemeCtx = React.createContext({ theme: DEFAULT_THEME, setTheme: () => {} });
const useTheme = () => React.useContext(ThemeCtx);

function ThemeProvider({ children }) {
  const [theme, setThemeState] = React.useState(() => {
    if (typeof window !== "undefined") {
      try { return { ...DEFAULT_THEME, ...JSON.parse(localStorage.getItem("hrm_theme") || "{}") }; }
      catch { return DEFAULT_THEME; }
    }
    return DEFAULT_THEME;
  });
  const setTheme = (updates) => {
    setThemeState(prev => {
      const next = { ...prev, ...updates };
      _theme = next;
      if (typeof window !== "undefined") localStorage.setItem("hrm_theme", JSON.stringify(next));
      return next;
    });
  };
  React.useEffect(() => { _theme = theme; }, [theme]);
  return (
    <ThemeCtx.Provider value={{ theme, setTheme }}>
      <style>{`
        :root {
          --accent:      ${theme.accent};
          --accent-dark: ${theme.accentDark};
          --sidebar:     ${theme.sidebar};
          --topbar:      ${theme.topbar};
          --card:        ${theme.card};
          --page-bg:     ${theme.pageBg};
          --text:        ${theme.text};
          --text-sub:    ${theme.textSub};
          --border:      ${theme.border};
        }
      `}</style>
      {children}
    </ThemeCtx.Provider>
  );
}

const ATTENDANCE_POLL_MS = 5000;

const Icon = ({ d, size = 14, stroke = "currentColor", fill = "none", sw = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
    strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
    style={{ display: "block", flexShrink: 0 }}>
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

const ICONS = {
  tickets:     "M2 3h20v14H2z M8 21h8M12 17v4",
  ticketList:  "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 0 2-2h2a2 2 0 0 0 2 2m-6 9l2 2 4-4",
  ticketDetail:"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z M14 2v5h5M8 13h8M8 17h5",
  automation:  "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  reports:     "M18 20V10M12 20V4M6 20v-6",
  search:      "M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z",
  export:      "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M17 8l-5-5-5 5 M12 3v12",
  calendar:    "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z",
  settings:    "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z",
  bell:        "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0",
  mail:        "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6",
  grid:        "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z",
  sun:         "M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12 M12 16A4 4 0 1 0 12 8a4 4 0 0 0 0 8z",
  monitor:     "M2 3h20v14H2z M8 21h8M12 17v4",
  phone:       "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z",
  mapPin:      "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
  more:        "M12 5h.01M12 12h.01M12 19h.01",
  video:       "M23 7l-7 5 7 5V7z M1 5h15a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H1V5z",
  chat:        "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
  plus:        "M12 5v14M5 12h14",
  comment:     "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
  clock:       "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2",
  list:        "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 0 2-2h2a2 2 0 0 0 2 2",
  grid2:       "M3 3h8v8H3zM13 3h8v8h-8zM3 13h8v8H3zM13 13h8v8h-8z",
  attendance:  "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm.5-5H11v6l5.25 3.15.75-1.23-4.5-2.67V7z",
  performance: "M18 20V10M12 20V4M6 20v-6",
  training:    "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  probation:   "M9 11l3 3L22 4 M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11",
  notice:      "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  promotion:   "M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z",
  resignation: "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v1",
  termination: "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z",
  holidays:    "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z",
  home:        "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",
  chevRight:   "M9 18l6-6-6-6",
  logIn:       "M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4 M10 17l5-5-5-5 M15 12H3",
  logOut:      "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9",
  wifi:        "M5 12.55a11 11 0 0 1 14.08 0 M1.42 9a16 16 0 0 1 21.16 0 M8.53 16.11a6 6 0 0 1 6.95 0 M12 20h.01",
  projects:    "M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",
  folder:      "M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z",
  edit:        "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7 M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z",
  trash:       "M3 6h18 M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6 M10 11v6 M14 11v6 M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2",
  arrowLeft:   "M19 12H5 M12 5l-7 7 7 7",
  briefcase:   "M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2",
  dollar:      "M12 1v22 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
  users:       "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75 M9 7a4 4 0 1 0 0 8 4 4 0 0 0 0-8z",
  checkCircle: "M22 11.08V12a10 10 0 1 1-5.93-9.14 M22 4L12 14.01l-3-3",
  tag:         "M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z M7 7h.01",
  link:        "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71 M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71",
  building:    "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",
  moreH:       "M5 12h.01M12 12h.01M19 12h.01",
  star:        "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  check:       "M20 6L9 17l-5-5",
  grip:        "M9 3h.01M15 3h.01M9 9h.01M15 9h.01M9 15h.01M15 15h.01M9 21h.01M15 21h.01",
  refresh:     "M23 4v6h-6 M1 20v-6h6 M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15",
};

const Avatar = ({ name = "?", size = 32, color = "#374151", img = null }) => {
  const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  if (img) {
    return (
      <div style={{ width: size, height: size, borderRadius: "50%", overflow: "hidden", flexShrink: 0, border: "2px solid #fff" }}>
        <img src={img} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={e => { e.target.style.display = "none"; }} />
      </div>
    );
  }
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.32, fontWeight: 700, color: "#fff", flexShrink: 0, letterSpacing: "-0.5px", border: "2px solid #fff" }}>
      {initials}
    </div>
  );
};

const Dot = ({ color }) => <div style={{ width: 7, height: 7, borderRadius: "50%", background: color, flexShrink: 0 }} />;

const Card = ({ children, style = {} }) => (
  <div style={{ background: "var(--card, #fff)", borderRadius: 10, border: "1px solid var(--border, #f1f5f9)", padding: "13px 14px", ...style }}>
    {children}
  </div>
);

const AVATAR_COLORS = ["#6366f1","#f59e0b","#22c55e","#ef4444","#8b5cf6","#06b6d4","#ec4899","#14b8a6","#f97316","#3b82f6"];
function avatarColor(name = "") {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffffffff;
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

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
        <div style={{ marginLeft: -8, width: size, height: size, borderRadius: "50%", background: "#e5e7eb", border: "2px solid #fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.28, fontWeight: 700, color: "#6b7280" }}>
          +{extra}
        </div>
      )}
    </div>
  );
}

function useAttendance() {
  const [attendance, setAttendance] = useState(null);
  const [dashboard, setDashboard]   = useState(null);
  const [loading, setLoading]       = useState(true);
  const [punching, setPunching]     = useState(false);
  const [error, setError]           = useState(null);
  const intervalRef                 = useRef(null);

  const fetchAll = useCallback(async () => {
    try {
      const [todayRes, dashRes] = await Promise.all([
        fetch(`${BASE}/api/employee/attendance/today`,     { headers: HEADERS() }),
        fetch(`${BASE}/api/employee/attendance/dashboard`, { headers: HEADERS() }),
      ]);
      const [todayJson, dashJson] = await Promise.all([todayRes.json(), dashRes.json()]);
      if (todayJson.success) { setAttendance(todayJson.data); setError(null); }
      if (dashJson.success)  { setDashboard(dashJson.data); }
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
      const endpoint = type === "in"
        ? `${BASE}/api/employee/attendance/punch-in`
        : `${BASE}/api/employee/attendance/punch-out`;
      const res  = await fetch(endpoint, { method: "POST", headers: HEADERS() });
      const json = await res.json();
      if (json.success) { await fetchAll(); }
      else { setError(json.message ?? "Punch failed"); }
    } catch (err) { setError(err.message); }
    finally { setPunching(false); }
  }, [fetchAll]);

  return { attendance, dashboard, loading, punching, error, doPunch, refresh: fetchAll };
}

function useClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return now;
}

function fmt12(dateStr) {
  if (!dateStr) return "--:-- --";
  const d = new Date(dateStr);
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
}

function fmtHMS(totalHours) {
  const totalSec = Math.round(totalHours * 3600);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

const PAGE_TITLES = {
  null:                    { title: "Employee Dashboard",    crumb: "Employee Dashboard"    },
  "projects":              { title: "Projects",              crumb: "Projects"              },
  "Tasks":                 { title: "Tasks",                 crumb: "Tasks"                 },
  "project-detail":        { title: "Project Details",       crumb: "Project Details"       },
  "tickets":               { title: "Tickets",               crumb: "Tickets"               },
  "tickets-details":       { title: "Ticket Details",        crumb: "Ticket Details"        },
  "tickets-automation":    { title: "Ticket Automation",     crumb: "Ticket Automation"     },
  "tickets-reports":       { title: "Ticket Reports",        crumb: "Ticket Reports"        },
  "attendance-leaves":     { title: "Leaves",                crumb: "Leaves"                },
  "attendance-employee":   { title: "Attendance",            crumb: "Attendance"            },
  "attendance-timesheets": { title: "Timesheets",            crumb: "Timesheets"            },
  "attendance-shift":      { title: "Shift & Schedule",      crumb: "Shift & Schedule"      },
  "attendance-swap":       { title: "Shift Swap Requests",   crumb: "Shift Swap Requests"   },
  "attendance-overtime":   { title: "Overtime",              crumb: "Overtime"              },
  "attendance-holidays":   { title: "Holiday Calendar",      crumb: "Holiday Calendar"      },
  "attendance-wfh":        { title: "WFH Management",        crumb: "WFH Management"        },
  "performance-indicator": { title: "Performance Indicator", crumb: "Performance Indicator" },
  "performance-review":    { title: "Performance Review",    crumb: "Performance Review"    },
  "performance-appraisal": { title: "Performance Appraisal", crumb: "Performance Appraisal" },
  "performance-goal-list": { title: "Goal List",             crumb: "Goal List"             },
  "performance-goal-type": { title: "Goal Type",             crumb: "Goal Type"             },
  "training-list":         { title: "Training List",         crumb: "Training List"         },
  "training-trainers":     { title: "Trainers",              crumb: "Trainers"              },
  "training-type":         { title: "Training Type",         crumb: "Training Type"         },
  "training-cert":         { title: "Certification Tracking",crumb: "Certification"         },
  "training-analytics":    { title: "Learning Analytics",    crumb: "Learning Analytics"    },
  "probation":             { title: "Probation Management",  crumb: "Probation Management"  },
  "notice":                { title: "Notice Period Tracker", crumb: "Notice Period"         },
  "promotion":             { title: "Promotion",             crumb: "Promotion"             },
  "resignation":           { title: "Resignation",           crumb: "Resignation"           },
  "termination":           { title: "Termination",           crumb: "Termination"           },
  "holidays":              { title: "Holidays",              crumb: "Holidays"              },
};

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
    <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 20, background: cfg.bg }}>
      <div style={{ width: 7, height: 7, borderRadius: "50%", background: cfg.dot }} />
      <span style={{ fontSize: 11.5, fontWeight: 600, color: cfg.text }}>{cfg.label}</span>
    </div>
  );
}

function StatusBadge({ status }) {
  const key = (status ?? "").toLowerCase().replace(" ", "-");
  const cfg = STATUS_CONFIG[key] || STATUS_CONFIG.planning;
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 20, background: cfg.bg }}>
      <div style={{ width: 7, height: 7, borderRadius: "50%", background: cfg.dot }} />
      <span style={{ fontSize: 11.5, fontWeight: 600, color: cfg.text }}>{cfg.label}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PROJECTS LIST PAGE
// ─────────────────────────────────────────────────────────────────────────────
function ProjectsListPage({ onSelectProject }) {
  const { theme } = useTheme();
  const ACCENT = theme.accent;
  const [projects, setProjects]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [search, setSearch]             = useState("");
  const [viewMode, setViewMode]         = useState("list");
  const [rowsPerPage, setRowsPerPage]   = useState(10);
  const [page, setPage]                 = useState(1);
  const [selectedIds, setSelectedIds]   = useState(new Set());
  const [statusFilter, setStatusFilter] = useState("");
  const [allChecked, setAllChecked]     = useState(false);

  useEffect(() => {
    fetch(`${BASE}/api/employee/projects`, { headers: HEADERS() })
      .then(r => r.json())
      .then(json => {
        if (json.success && Array.isArray(json.data)) setProjects(json.data);
        else if (Array.isArray(json.data?.projects)) setProjects(json.data.projects);
        else if (Array.isArray(json)) setProjects(json);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = projects.filter(p => {
    const q = search.toLowerCase();
    const nameMatch = (p.project_name || "").toLowerCase().includes(q) || (p.project_code || "").toLowerCase().includes(q);
    const statusMatch = !statusFilter || (p.status || "").toLowerCase() === statusFilter.toLowerCase();
    return nameMatch && statusMatch;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const paginated  = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const toggleRow = (id) => {
    setSelectedIds(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  };
  const toggleAll = () => {
    if (allChecked) { setSelectedIds(new Set()); setAllChecked(false); }
    else { setSelectedIds(new Set(paginated.map(p => p.id))); setAllChecked(true); }
  };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 80, gap: 10 }}>
      <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 0.8s linear infinite" }}>
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
      </svg>
      <span style={{ fontSize: 14, color: "#9ca3af" }}>Loading projects…</span>
    </div>
  );

  if (error) return (
    <div style={{ background: "#fef2f2", borderRadius: 10, padding: 20, color: "#991b1b", fontSize: 13 }}>Error: {error}</div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      <style>{`
        @keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
        .proj-row:hover { background: #fafafa !important; }
        .proj-row:hover .proj-actions { opacity: 1 !important; }
        .proj-actions { opacity: 0; transition: opacity 0.15s; }
        .chk:checked { accent-color: ${ACCENT}; }
      `}</style>
      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #f1f5f9", overflow: "hidden" }}>
        <div style={{ padding: "14px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>Project List</span>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
              style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 7, padding: "6px 28px 6px 10px", fontSize: 12, color: "#6b7280", cursor: "pointer", outline: "none", appearance: "none" }}>
              <option value="">Select Status</option>
              <option value="active">Active</option>
              <option value="planning">Planning</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="inactive">Inactive</option>
            </select>
            <button style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 7, padding: "6px 12px", fontSize: 12, color: "#6b7280", cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
              Sort By : Last 7 Days ▾
            </button>
          </div>
        </div>
        <div style={{ padding: "10px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, background: "#fafafa" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 12, color: "#6b7280" }}>Row Per Page</span>
            <select value={rowsPerPage} onChange={e => { setRowsPerPage(Number(e.target.value)); setPage(1); }}
              style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 6, padding: "4px 8px", fontSize: 12, color: "#374151", cursor: "pointer" }}>
              {[5, 10, 20, 50].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            <span style={{ fontSize: 12, color: "#9ca3af" }}>Entries</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ display: "flex", gap: 2, background: "#f3f4f6", borderRadius: 7, padding: 2 }}>
              {[
                { mode: "list", d: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" },
                { mode: "grid", d: "M3 3h8v8H3zM13 3h8v8h-8zM3 13h8v8H3zM13 13h8v8h-8z" },
              ].map(({ mode, d }) => (
                <button key={mode} onClick={() => setViewMode(mode)}
                  style={{ width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", background: viewMode === mode ? "#fff" : "transparent", borderRadius: 5, border: "none", cursor: "pointer", boxShadow: viewMode === mode ? "0 1px 4px rgba(0,0,0,0.08)" : "none" }}>
                  <Icon d={d} size={14} stroke={viewMode === mode ? ACCENT : "#9ca3af"} />
                </button>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 7, padding: "5px 10px" }}>
              <Icon d={ICONS.search} stroke="#9ca3af" size={13} />
              <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search…"
                style={{ border: "none", background: "transparent", fontSize: 12, color: "#374151", outline: "none", width: 130 }} />
            </div>
          </div>
        </div>

        {viewMode === "list" ? (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#f9fafb" }}>
                  <th style={{ width: 40, padding: "10px 16px", textAlign: "center" }}>
                    <input type="checkbox" checked={allChecked} onChange={toggleAll} className="chk" style={{ width: 14, height: 14, cursor: "pointer" }} />
                  </th>
                  {[
                    { label: "Project ID", w: 100 }, { label: "Project Name", w: 220 },
                    { label: "Leader", w: 160 }, { label: "Team", w: 130 },
                    { label: "Deadline", w: 110 }, { label: "Priority", w: 110 },
                    { label: "Status", w: 110 }, { label: "", w: 80 },
                  ].map(({ label, w }, i) => (
                    <th key={i} style={{ padding: "10px 16px 10px 0", textAlign: "left", fontSize: 11.5, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.5px", whiteSpace: "nowrap", width: w }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        {label}
                        {label && <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth={2.5} strokeLinecap="round"><path d="M8 9l4-4 4 4M8 15l4 4 4-4" /></svg>}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr><td colSpan={8} style={{ padding: "40px 0", textAlign: "center", color: "#9ca3af", fontSize: 13 }}>No projects found</td></tr>
                ) : paginated.map((p) => {
                  const leaderName = p.team_leader ? `${p.team_leader.firstname} ${p.team_leader.lastname}`.trim() : "—";
                  const isChecked = selectedIds.has(p.id);
                  return (
                    <tr key={p.id} className="proj-row"
                      style={{ borderTop: "1px solid #f3f4f6", background: isChecked ? `${ACCENT}08` : "#fff", transition: "background 0.12s", cursor: "default" }}>
                      <td style={{ padding: "12px 16px", textAlign: "center" }}>
                        <input type="checkbox" checked={isChecked} onChange={() => toggleRow(p.id)} className="chk" style={{ width: 14, height: 14, cursor: "pointer" }} />
                      </td>
                      <td style={{ padding: "12px 16px 12px 0" }}>
                        <span style={{ fontSize: 12.5, fontWeight: 600, color: "#6b7280", letterSpacing: "0.3px" }}>{p.project_code}</span>
                      </td>
                      <td style={{ padding: "12px 16px 12px 0" }}>
                        <button onClick={() => onSelectProject(p.id)}
                          style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontSize: 13.5, fontWeight: 600, color: "#111827", textAlign: "left" }}
                          onMouseEnter={e => e.currentTarget.style.color = ACCENT}
                          onMouseLeave={e => e.currentTarget.style.color = "#111827"}>
                          {p.project_name}
                        </button>
                      </td>
                      <td style={{ padding: "12px 16px 12px 0" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <Avatar name={leaderName} size={28} color={avatarColor(leaderName)} img={p.team_leader?.profile_image ? `${BASE}${p.team_leader.profile_image}` : null} />
                          <span style={{ fontSize: 12.5, color: "#374151", fontWeight: 500 }}>{leaderName}</span>
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px 12px 0" }}>
                        <StackedAvatars members={p.team_members ?? []} max={3} size={26} />
                      </td>
                      <td style={{ padding: "12px 16px 12px 0" }}>
                        <span style={{ fontSize: 12.5, color: "#6b7280" }}>
                          {p.end_date ? new Date(p.end_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px 12px 0" }}><PriorityBadge priority={p.priority} /></td>
                      <td style={{ padding: "12px 16px 12px 0" }}><StatusBadge status={p.status} /></td>
                      <td style={{ padding: "12px 16px 12px 0" }}>
                        <div className="proj-actions" style={{ display: "flex", gap: 6 }}>
                          <button onClick={() => onSelectProject(p.id)} style={{ width: 28, height: 28, background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                            <Icon d={ICONS.edit} size={12} stroke="#0369a1" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: 20, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
            {paginated.length === 0 ? (
              <div style={{ gridColumn: "1/-1", textAlign: "center", color: "#9ca3af", fontSize: 13, padding: 40 }}>No projects found</div>
            ) : paginated.map(p => {
              const leaderName = p.team_leader ? `${p.team_leader.firstname} ${p.team_leader.lastname}`.trim() : "—";
              return (
                <div key={p.id} style={{ background: "#fff", borderRadius: 12, border: "1px solid #f1f5f9", overflow: "hidden", transition: "box-shadow 0.2s", cursor: "pointer" }}
                  onClick={() => onSelectProject(p.id)}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.08)"}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}>
                  <div style={{ padding: "14px 16px", borderBottom: "1px solid #f9fafb", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontSize: 10.5, fontWeight: 600, color: "#9ca3af", marginBottom: 3 }}>{p.project_code}</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>{p.project_name}</div>
                    </div>
                    <PriorityBadge priority={p.priority} />
                  </div>
                  <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Avatar name={leaderName} size={26} color={avatarColor(leaderName)} />
                        <div>
                          <div style={{ fontSize: 11, color: "#9ca3af" }}>Leader</div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>{leaderName}</div>
                        </div>
                      </div>
                      <StackedAvatars members={p.team_members ?? []} max={3} size={24} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ fontSize: 11.5, color: "#9ca3af" }}>
                        <span style={{ color: "#ef4444", fontWeight: 600 }}>Deadline: </span>
                        {p.end_date ? new Date(p.end_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                      </div>
                      <StatusBadge status={p.status} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ padding: "12px 20px", borderTop: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fafafa" }}>
          <span style={{ fontSize: 12, color: "#9ca3af" }}>
            Showing {Math.min((page - 1) * rowsPerPage + 1, filtered.length)}–{Math.min(page * rowsPerPage, filtered.length)} of {filtered.length} entries
          </span>
          <div style={{ display: "flex", gap: 4 }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              style={{ width: 30, height: 30, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", cursor: page === 1 ? "not-allowed" : "pointer", opacity: page === 1 ? 0.4 : 1 }}>
              <Icon d="M15 18l-6-6 6-6" size={14} stroke="#6b7280" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).slice(Math.max(0, page - 3), page + 2).map(n => (
              <button key={n} onClick={() => setPage(n)}
                style={{ width: 30, height: 30, background: n === page ? ACCENT : "#fff", border: `1px solid ${n === page ? ACCENT : "#e5e7eb"}`, borderRadius: 6, fontSize: 12.5, fontWeight: n === page ? 700 : 400, color: n === page ? "#fff" : "#6b7280", cursor: "pointer" }}>
                {n}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              style={{ width: 30, height: 30, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", cursor: page === totalPages ? "not-allowed" : "pointer", opacity: page === totalPages ? 0.4 : 1 }}>
              <Icon d="M9 18l6-6-6-6" size={14} stroke="#6b7280" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PROJECT DETAIL PANEL (slide-in)
// ─────────────────────────────────────────────────────────────────────────────
function ProjectDetailPanel({ projectId, onClose }) {
  const { theme } = useTheme();
  const ACCENT = theme.accent;
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [visible, setVisible] = useState(false);

  useEffect(() => { setTimeout(() => setVisible(true), 10); }, []);

  useEffect(() => {
    if (!projectId) return;
    setLoading(true); setError(null);
    fetch(`${BASE}/api/employee/projects/${projectId}`, { headers: HEADERS() })
      .then(r => r.json())
      .then(json => { if (json.success) setProject(json.data); else setError("Project not found"); })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [projectId]);

  const handleClose = () => { setVisible(false); setTimeout(onClose, 280); };

  const startDate = project?.start_date ? new Date(project.start_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";
  const endDate   = project?.end_date   ? new Date(project.end_date).toLocaleDateString("en-GB",   { day: "2-digit", month: "short", year: "numeric" }) : "—";
  const daysLeft  = project?.end_date ? Math.max(0, Math.ceil((new Date(project.end_date) - new Date()) / 86400000)) : null;

  return (
    <>
      <div onClick={handleClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", backdropFilter: "blur(3px)", zIndex: 400, opacity: visible ? 1 : 0, transition: "opacity 0.28s ease" }} />
      <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 620, background: "#fff", zIndex: 500, display: "flex", flexDirection: "column", boxShadow: "-20px 0 60px rgba(0,0,0,0.18)", transform: visible ? "translateX(0)" : "translateX(100%)", transition: "transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)", overflow: "hidden" }}>
        <style>{`@keyframes spin { from{transform:rotate(0)}to{transform:rotate(360deg)} }`}</style>
        <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 55%, #1e3a5f 100%)", flexShrink: 0, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -50, right: -50, width: 200, height: 200, borderRadius: "50%", background: `${ACCENT}18`, pointerEvents: "none" }} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px 0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#64748b" }}>
              <span>Projects</span>
              <Icon d="M9 18l6-6-6-6" size={10} stroke="#64748b" />
              <span style={{ color: "#94a3b8" }}>Project Detail</span>
            </div>
            <button onClick={handleClose} style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#94a3b8" }}>
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>
          </div>
          <div style={{ padding: "16px 20px 0" }}>
            {loading ? (
              <div style={{ display: "flex", alignItems: "center", gap: 10, paddingBottom: 20 }}>
                <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth={2.5} strokeLinecap="round" style={{ animation: "spin 0.8s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
                <span style={{ fontSize: 13, color: "#64748b" }}>Loading project…</span>
              </div>
            ) : error ? (
              <div style={{ color: "#ef4444", fontSize: 13, paddingBottom: 20 }}>{error}</div>
            ) : project ? (
              <>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
                  <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                    <div style={{ width: 52, height: 52, borderRadius: 14, background: `${ACCENT}22`, border: `1.5px solid ${ACCENT}44`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon d={ICONS.briefcase} stroke={ACCENT} size={24} />
                    </div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 10.5, fontWeight: 700, color: ACCENT, background: `${ACCENT}20`, padding: "2px 8px", borderRadius: 8 }}>{project.project_code}</span>
                        <StatusBadge status={project.status} />
                        <PriorityBadge priority={project.priority} />
                      </div>
                      <h2 style={{ margin: 0, fontSize: 19, fontWeight: 800, color: "#fff", letterSpacing: "-0.3px", lineHeight: 1.2 }}>{project.project_name}</h2>
                      <p style={{ margin: "4px 0 0", fontSize: 11.5, color: "#94a3b8" }}>{project.description || "No description provided."}</p>
                    </div>
                  </div>
                  {daysLeft !== null && (
                    <div style={{ background: daysLeft <= 3 ? "#fef2f2" : daysLeft <= 7 ? "#fffbeb" : "rgba(255,255,255,0.06)", border: `1px solid ${daysLeft <= 3 ? "#fca5a5" : daysLeft <= 7 ? "#fde68a" : "rgba(255,255,255,0.12)"}`, borderRadius: 12, padding: "10px 14px", textAlign: "center", flexShrink: 0 }}>
                      <div style={{ fontSize: 22, fontWeight: 800, color: daysLeft <= 3 ? "#ef4444" : daysLeft <= 7 ? "#f59e0b" : "#fff" }}>{daysLeft}</div>
                      <div style={{ fontSize: 9, color: daysLeft <= 3 ? "#991b1b" : daysLeft <= 7 ? "#92400e" : "#94a3b8", fontWeight: 600, textTransform: "uppercase" }}>Days Left</div>
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", paddingBottom: 14 }}>
                  {[
                    { label: "Start", value: startDate },
                    { label: "End",   value: endDate   },
                    { label: "Value", value: `₹${Number(project.value ?? 0).toLocaleString("en-IN")}` },
                    { label: "Team",  value: `${(project.team_members ?? []).length} Members` },
                  ].map(({ label, value }, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 10px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8 }}>
                      <span style={{ fontSize: 9.5, color: "#64748b", textTransform: "uppercase" }}>{label}:</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#e2e8f0" }}>{value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : null}
          </div>
          {project && (
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", display: "flex", padding: "0 20px", background: "rgba(0,0,0,0.12)" }}>
              {["overview", "team", "client"].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  style={{ padding: "11px 14px", background: "transparent", border: "none", borderBottom: activeTab === tab ? `2px solid ${ACCENT}` : "2px solid transparent", color: activeTab === tab ? ACCENT : "#64748b", fontSize: 12, fontWeight: activeTab === tab ? 700 : 500, cursor: "pointer", textTransform: "capitalize", transition: "color 0.15s" }}>
                  {tab}
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
          {!loading && !error && project && (
            <>
              {activeTab === "overview" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div style={{ background: "#f8fafc", borderRadius: 12, border: "1px solid #e2e8f0", padding: 16 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 12 }}>Project Info</div>
                      {[
                        { label: "Code",  value: project.project_code },
                        { label: "Type",  value: (project.type ?? "—").replace("_"," ").replace(/\b\w/g, c => c.toUpperCase()) },
                        { label: "Start", value: startDate },
                        { label: "End",   value: endDate   },
                        { label: "Value", value: `₹${Number(project.value ?? 0).toLocaleString("en-IN")}` },
                      ].map(({ label, value }, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: i < 4 ? "1px solid #f1f5f9" : "none" }}>
                          <span style={{ fontSize: 11.5, color: "#9ca3af" }}>{label}</span>
                          <span style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>{value}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ background: "#f8fafc", borderRadius: 12, border: "1px solid #e2e8f0", padding: 16 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 12 }}>Status</div>
                      <div style={{ marginBottom: 12 }}><StatusBadge status={project.status} /></div>
                      <div style={{ marginBottom: 12 }}><PriorityBadge priority={project.priority} /></div>
                      <div style={{ marginTop: 8 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                          <span style={{ fontSize: 11, color: "#9ca3af" }}>Completion</span>
                          <span style={{ fontSize: 11, fontWeight: 700, color: "#374151" }}>{project.progress ?? 0}%</span>
                        </div>
                        <div style={{ height: 6, background: "#e5e7eb", borderRadius: 3, overflow: "hidden" }}>
                          <div style={{ width: `${project.progress ?? 0}%`, height: "100%", background: `linear-gradient(90deg, ${ACCENT}, ${ACCENT}cc)`, borderRadius: 3 }} />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div style={{ background: "#f8fafc", borderRadius: 12, border: "1px solid #e2e8f0", padding: 16 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 10 }}>About Project</div>
                    <p style={{ margin: 0, fontSize: 13, color: "#6b7280", lineHeight: 1.75 }}>{project.description || "No description provided."}</p>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 12 }}>Key Personnel</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      {[
                        { role: "Project Manager", person: project.project_manager, color: "#6366f1" },
                        { role: "Team Leader",     person: project.team_leader,     color: "#22c55e" },
                      ].filter(({ person }) => !!person).map(({ role, person, color }) => {
                        const name = `${person.firstname} ${person.lastname}`.trim();
                        return (
                          <div key={role} style={{ background: "#f8fafc", borderRadius: 12, border: "1px solid #e2e8f0", padding: 14, display: "flex", gap: 12 }}>
                            <Avatar name={name} size={42} color={avatarColor(name)} img={person.profile_image ? `${BASE}${person.profile_image}` : null} />
                            <div>
                              <div style={{ fontSize: 10, fontWeight: 700, color, background: `${color}15`, padding: "1px 7px", borderRadius: 8, marginBottom: 5, display: "inline-block" }}>{role}</div>
                              <div style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>{name}</div>
                              <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>{person.email}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "team" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[
                    project.project_manager && { ...project.project_manager, _role: "Project Manager" },
                    project.team_leader     && { ...project.team_leader,     _role: "Team Leader"     },
                    ...(project.team_members ?? []).map(m => ({ ...m, _role: "Team Member" })),
                  ].filter(Boolean).map((m, i) => {
                    const name = `${m.firstname} ${m.lastname}`.trim();
                    const roleColor = m._role === "Project Manager" ? "#6366f1" : m._role === "Team Leader" ? "#22c55e" : "#9ca3af";
                    return (
                      <div key={`${m.id}-${i}`} style={{ display: "flex", gap: 12, padding: "14px 16px", background: "#f8fafc", borderRadius: 12, border: "1px solid #e2e8f0", alignItems: "center" }}>
                        <Avatar name={name} size={46} color={avatarColor(name)} img={m.profile_image ? `${BASE}${m.profile_image}` : null} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                            <span style={{ fontSize: 13.5, fontWeight: 700, color: "#111827" }}>{name}</span>
                            <span style={{ fontSize: 9.5, fontWeight: 700, color: roleColor, background: `${roleColor}15`, padding: "1px 7px", borderRadius: 8 }}>{m._role}</span>
                          </div>
                          <div style={{ fontSize: 11.5, color: "#6b7280" }}>{m.email}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {activeTab === "client" && (
                project.client ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <div style={{ background: "linear-gradient(135deg, #1e293b, #334155)", borderRadius: 14, padding: "18px 20px", display: "flex", alignItems: "center", gap: 14 }}>
                      <div style={{ width: 52, height: 52, borderRadius: 13, background: `${ACCENT}25`, border: `1.5px solid ${ACCENT}44`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Icon d={ICONS.building} stroke={ACCENT} size={24} />
                      </div>
                      <div>
                        <div style={{ fontSize: 17, fontWeight: 800, color: "#fff" }}>{project.client.company_name}</div>
                        <div style={{ fontSize: 11.5, color: "#94a3b8", marginTop: 2 }}>{project.client.client_code}</div>
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      {[
                        { label: "Contact", value: project.client.contact_person },
                        { label: "Email",   value: project.client.email          },
                        { label: "Phone",   value: project.client.phone          },
                        { label: "City",    value: project.client.city           },
                        { label: "State",   value: project.client.state          },
                        { label: "Country", value: project.client.country        },
                      ].map(({ label, value }, i) => (
                        <div key={i} style={{ padding: "11px 14px", background: "#f8fafc", borderRadius: 10, border: "1px solid #e2e8f0" }}>
                          <div style={{ fontSize: 9.5, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>{label}</div>
                          <div style={{ fontSize: 12.5, fontWeight: 600, color: "#374151" }}>{value || "—"}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: "center", padding: "40px 20px", color: "#9ca3af", fontSize: 13 }}>No client linked to this project.</div>
                )
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TASKS PAGE (inline)
// ─────────────────────────────────────────────────────────────────────────────
const TASK_STATUS_CONFIG = {
  pending:     { bg: "#fef9c3", text: "#854d0e",  dot: "#f59e0b", label: "Pending"     },
  in_progress: { bg: "#dbeafe", text: "#1e40af",  dot: "#3b82f6", label: "In Progress" },
  completed:   { bg: "#dcfce7", text: "#166634",  dot: "#22c55e", label: "Completed"   },
  on_hold:     { bg: "#fce7f3", text: "#be185d",  dot: "#ec4899", label: "On Hold"     },
  cancelled:   { bg: "#f3f4f6", text: "#6b7280",  dot: "#9ca3af", label: "Cancelled"   },
};

const PROJECT_COLORS = ["#6366f1","#f97316","#06b6d4","#22c55e","#ec4899","#8b5cf6","#f59e0b","#ef4444"];
function projectColor(id) { return PROJECT_COLORS[(id ?? 0) % PROJECT_COLORS.length]; }

function TasksPage() {
  const { theme } = useTheme();
  const ACCENT = theme.accent;
  const [allTasks, setAllTasks]             = useState([]);
  const [projects, setProjects]             = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState(null);
  const [completedIds, setCompletedIds]     = useState(new Set());
  const [priorityFilter, setPriorityFilter] = useState(null);
  const [visibleCount, setVisibleCount]     = useState(10);

  const fetchTasks = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res  = await fetch(`${BASE}/api/employee/tasks/`, { headers: HEADERS() });
      const json = await res.json();
      let tasks = [];
      if (json.success && Array.isArray(json.data)) tasks = json.data;
      else if (Array.isArray(json.data?.tasks))      tasks = json.data.tasks;
      else if (Array.isArray(json))                  tasks = json;
      setAllTasks(tasks);
      const projectMap = new Map();
      tasks.forEach(t => {
        if (t.project) {
          if (!projectMap.has(t.project.id)) projectMap.set(t.project.id, { ...t.project, _tasks: [] });
          projectMap.get(t.project.id)._tasks.push(t);
        }
      });
      const list = [...projectMap.values()];
      setProjects(list);
      if (list.length > 0 && !selectedProject) setSelectedProject(list[0].id);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const handleToggleComplete = (taskId) => {
    setCompletedIds(prev => { const next = new Set(prev); next.has(taskId) ? next.delete(taskId) : next.add(taskId); return next; });
  };

  const handleStatusChange = (taskId, newStatus) => {
    setAllTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    setProjects(prev => prev.map(p => ({ ...p, _tasks: (p._tasks || []).map(t => t.id === taskId ? { ...t, status: newStatus } : t) })));
    if (newStatus === "completed") setCompletedIds(prev => new Set([...prev, taskId]));
    else setCompletedIds(prev => { const next = new Set(prev); next.delete(taskId); return next; });
  };

  const currentProject = projects.find(p => p.id === selectedProject);
  const projectTasks   = currentProject?._tasks ?? [];
  const filteredTasks  = projectTasks.filter(t => !priorityFilter || t.priority === priorityFilter);
  const completedTasks = filteredTasks.filter(t => completedIds.has(t.id) || t.status === "completed");
  const pendingTasks   = filteredTasks.filter(t => !completedIds.has(t.id) && t.status !== "completed");
  const totalDone = completedTasks.length;
  const totalAll  = filteredTasks.length;
  const projectPct = totalAll > 0 ? Math.round((totalDone / totalAll) * 100) : 0;
  const visiblePending = pendingTasks.slice(0, visibleCount);
  const hasMore = pendingTasks.length > visibleCount;

  return (
    <div style={{ display: "flex", gap: 16, height: "100%", overflow: "hidden" }}>
      <style>{`
        @keyframes spin { from{transform:rotate(0deg);}to{transform:rotate(360deg);} }
        .task-row:hover { background: #fafafa !important; }
      `}</style>

      {/* LEFT: Project list */}
      <div style={{ width: 300, flexShrink: 0, overflowY: "auto", paddingBottom: 20 }}>
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 50, gap: 8 }}>
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth={2.5} strokeLinecap="round" style={{ animation: "spin 0.8s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
            <span style={{ fontSize: 12, color: "#9ca3af" }}>Loading…</span>
          </div>
        ) : error ? (
          <div style={{ background: "#fef2f2", borderRadius: 10, padding: 16, color: "#991b1b", fontSize: 12 }}>Error: {error}</div>
        ) : projects.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40, color: "#9ca3af", fontSize: 12 }}>No projects found</div>
        ) : projects.map(p => {
          const isSelected = selectedProject === p.id;
          const color = projectColor(p.id);
          const tasks = p._tasks || [];
          const done = tasks.filter(t => t.status === "completed").length;
          const pct = tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0;
          const progressColor = pct >= 80 ? "#22c55e" : pct >= 50 ? "#3b82f6" : "#f97316";
          return (
            <div key={p.id} onClick={() => { setSelectedProject(p.id); setVisibleCount(10); setPriorityFilter(null); }}
              style={{ background: "#fff", borderRadius: 12, border: isSelected ? `2px solid ${ACCENT}` : "1px solid #f1f5f9", padding: "16px 18px", cursor: "pointer", marginBottom: 12, boxShadow: isSelected ? `0 4px 20px ${ACCENT}22` : "none", transition: "all 0.15s" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}18`, border: `2px solid ${color}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: 16, fontWeight: 700, color }}>{(p.project_name || "P")[0].toUpperCase()}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.project_name || "Untitled"}</div>
                  <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>{tasks.length} tasks • {done} Completed</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 11, color: "#6b7280" }}>Progress</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: progressColor }}>{pct}%</span>
              </div>
              <div style={{ height: 5, background: "#e5e7eb", borderRadius: 3, overflow: "hidden" }}>
                <div style={{ width: `${pct}%`, height: "100%", background: progressColor, borderRadius: 3, transition: "width 0.6s ease" }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* RIGHT: Task list */}
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 20 }}>
        {!currentProject && !loading ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 300, color: "#9ca3af" }}>
            <p style={{ fontSize: 14 }}>Select a project to view tasks</p>
          </div>
        ) : (
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #f1f5f9", overflow: "hidden" }}>
            <div style={{ padding: "14px 18px", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#111827", marginRight: 16 }}>Priority</span>
                {[{ key: null, label: "All" }, { key: "high", label: "High" }, { key: "medium", label: "Medium" }, { key: "low", label: "Low" }].map(({ key, label }) => (
                  <button key={String(key)} onClick={() => setPriorityFilter(key)}
                    style={{ padding: "5px 14px", border: "none", background: "transparent", fontSize: 13, fontWeight: priorityFilter === key ? 600 : 400, color: priorityFilter === key ? ACCENT : "#6b7280", cursor: "pointer", borderBottom: priorityFilter === key ? `2px solid ${ACCENT}` : "2px solid transparent", transition: "all 0.15s" }}>
                    {label}
                  </button>
                ))}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button style={{ display: "flex", alignItems: "center", gap: 5, background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 7, padding: "5px 10px", fontSize: 12, color: "#6b7280", cursor: "pointer" }}>
                  Sort By : Created Date ▾
                </button>
              </div>
            </div>

            {currentProject && (
              <div style={{ padding: "16px 18px", borderBottom: "1px solid #f3f4f6", background: "#fafafa" }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#111827", marginBottom: 2 }}>{currentProject.project_name || currentProject.name}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 10 }}>
                  <div>
                    <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 2 }}>Tasks Done</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: "#111827" }}>{totalDone} / {totalAll}</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ height: 8, background: "#e5e7eb", borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ width: `${projectPct}%`, height: "100%", background: "#3b82f6", borderRadius: 4, transition: "width 0.6s ease" }} />
                    </div>
                    <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>{projectPct}% Completed</div>
                  </div>
                </div>
              </div>
            )}

            {loading ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 50, gap: 8 }}>
                <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth={2.5} strokeLinecap="round" style={{ animation: "spin 0.8s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
                <span style={{ fontSize: 13, color: "#9ca3af" }}>Loading tasks…</span>
              </div>
            ) : filteredTasks.length === 0 ? (
              <div style={{ textAlign: "center", padding: 40, color: "#9ca3af", fontSize: 13 }}>No tasks found</div>
            ) : (
              <>
                {visiblePending.map(task => {
                  const isCompleted = completedIds.has(task.id);
                  const statusCfg = TASK_STATUS_CONFIG[task.status] || TASK_STATUS_CONFIG.pending;
                  const priorityColor = task.priority === "high" ? "#ef4444" : task.priority === "medium" ? "#f59e0b" : "#22c55e";
                  return (
                    <div key={task.id} className="task-row" style={{ display: "flex", alignItems: "center", padding: "13px 16px", borderBottom: "1px solid #f3f4f6", background: "#fff", transition: "background 0.12s" }}>
                      <div onClick={() => handleToggleComplete(task.id)}
                        style={{ width: 18, height: 18, borderRadius: 5, border: `2px solid ${isCompleted ? ACCENT : "#d1d5db"}`, background: isCompleted ? ACCENT : "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", marginRight: 12, flexShrink: 0 }}>
                        {isCompleted && <Icon d={ICONS.check} size={10} stroke="#fff" sw={3} />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0, marginRight: 16 }}>
                        <span style={{ fontSize: 13.5, fontWeight: 500, color: isCompleted ? "#9ca3af" : "#1f2937", textDecoration: isCompleted ? "line-through" : "none", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "block" }}>
                          {task.title}
                        </span>
                      </div>
                      {task.due_date && (
                        <div style={{ display: "flex", alignItems: "center", gap: 5, marginRight: 16, flexShrink: 0 }}>
                          <Icon d={ICONS.calendar} size={12} stroke="#9ca3af" />
                          <span style={{ fontSize: 11.5, color: "#9ca3af" }}>
                            {new Date(task.due_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                          </span>
                        </div>
                      )}
                      <div style={{ marginRight: 14, flexShrink: 0 }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 12, background: statusCfg.bg }}>
                          <div style={{ width: 6, height: 6, borderRadius: "50%", background: statusCfg.dot }} />
                          <span style={{ fontSize: 11.5, fontWeight: 600, color: statusCfg.text }}>• {statusCfg.label}</span>
                        </div>
                      </div>
                      <div style={{ display: "flex", marginRight: 10, flexShrink: 0 }}>
                        {task.creator ? (
                          <Avatar name={task.creator.name || "?"} size={24} color={avatarColor(task.creator.name || "?")} />
                        ) : (
                          <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#f3f4f6", border: "2px solid #fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Icon d={ICONS.users} size={11} stroke="#9ca3af" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {hasMore && (
                  <div style={{ padding: "16px 18px", borderBottom: "1px solid #f3f4f6", textAlign: "center" }}>
                    <button onClick={() => setVisibleCount(c => c + 10)}
                      style={{ display: "inline-flex", alignItems: "center", gap: 7, background: ACCENT, color: "#fff", border: "none", borderRadius: 8, padding: "9px 24px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                      Load More
                    </button>
                  </div>
                )}

                {completedTasks.length > 0 && (
                  <div>
                    <div style={{ padding: "10px 18px", background: "#f9fafb", borderTop: "1px solid #f3f4f6", display: "flex", alignItems: "center", gap: 8 }}>
                      <Icon d={ICONS.check} size={13} stroke="#22c55e" sw={2.5} />
                      <span style={{ fontSize: 12.5, fontWeight: 600, color: "#374151" }}>Completed ({completedTasks.length})</span>
                    </div>
                    {completedTasks.map(task => (
                      <div key={task.id} className="task-row" style={{ display: "flex", alignItems: "center", padding: "13px 16px", borderBottom: "1px solid #f3f4f6", background: "#fff" }}>
                        <div onClick={() => handleToggleComplete(task.id)}
                          style={{ width: 18, height: 18, borderRadius: 5, border: `2px solid ${ACCENT}`, background: ACCENT, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", marginRight: 12, flexShrink: 0 }}>
                          <Icon d={ICONS.check} size={10} stroke="#fff" sw={3} />
                        </div>
                        <span style={{ flex: 1, fontSize: 13.5, fontWeight: 500, color: "#9ca3af", textDecoration: "line-through", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {task.title}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PROTECTED ROUTE
// ─────────────────────────────────────────────────────────────────────────────
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
    } else { setIsAuthorized(true); }
  }, [requiredRole, router]);
  if (!isAuthorized) return null;
  return children;
}

// ─────────────────────────────────────────────────────────────────────────────
// SIDEBAR
// ─────────────────────────────────────────────────────────────────────────────
const subIconMap = {
  ticketList:   "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 0 2-2h2a2 2 0 0 0 2 2m-6 9l2 2 4-4",
  ticketDetail: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z M14 2v5h5M8 13h8M8 17h5",
  automation:   "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  reports:      "M18 20V10M12 20V4M6 20v-6",
};

function AccordionNavItem({ label, iconKey = "tickets", subItems, activePage, onNavigate, defaultOpen = false }) {
  const ACCENT = getTheme().accent;
  const isAnyChildActive = subItems.some(item => item.pageKey === activePage);
  const [open, setOpen] = useState(defaultOpen || isAnyChildActive);
  useEffect(() => { if (isAnyChildActive) setOpen(true); }, [isAnyChildActive]);
  return (
    <div style={{ marginBottom: 2 }}>
      <button onClick={() => setOpen(o => !o)}
        style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "8px 12px 8px 10px", border: "none", borderRadius: 8, background: (open || isAnyChildActive) ? `${ACCENT}18` : "transparent", color: (open || isAnyChildActive) ? ACCENT : "#374151", cursor: "pointer", fontSize: 13.5, fontWeight: (open || isAnyChildActive) ? 600 : 500, textAlign: "left", transition: "background 0.15s, color 0.15s" }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0, background: (open || isAnyChildActive) ? ACCENT : "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.15s" }}>
          <Icon d={ICONS[iconKey] || ICONS.tickets} size={16} stroke={(open || isAnyChildActive) ? "#fff" : "#6b7280"} />
        </div>
        <span style={{ flex: 1 }}>{label}</span>
        <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={open ? ACCENT : "#9ca3af"} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", flexShrink: 0 }}>
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div style={{ marginTop: 2, marginLeft: 20, paddingLeft: 16, borderLeft: "2px solid #e5e7eb" }}>
          {subItems.map((item, i) => {
            const isActive = activePage === item.pageKey;
            return (
              <button key={i} onClick={() => onNavigate(item.pageKey)}
                style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "7px 10px", border: "none", borderRadius: 6, background: isActive ? `${ACCENT}15` : "transparent", color: isActive ? ACCENT : "#6b7280", cursor: "pointer", fontSize: 12.5, fontWeight: isActive ? 600 : 400, marginBottom: 1, textAlign: "left" }}
                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = "#f9fafb"; e.currentTarget.style.color = "#374151"; } }}
                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#6b7280"; } }}>
                <div style={{ width: 22, height: 22, borderRadius: 5, flexShrink: 0, background: isActive ? `${ACCENT}15` : "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon d={subIconMap[item.iconKey] || subIconMap.ticketList} size={12} stroke={isActive ? ACCENT : "#9ca3af"} />
                </div>
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.badge && (
                  <span style={{ fontSize: 9, padding: "1px 5px", borderRadius: 8, background: "#ef4444", color: "#fff", fontWeight: 700 }}>{item.badge}</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SideNavItem({ label, iconKey, pageKey, badge, activePage, onNavigate }) {
  const ACCENT = getTheme().accent;
  const isActive = activePage === pageKey || (pageKey === "projects" && activePage === "project-detail");
  return (
    <button onClick={() => onNavigate(pageKey)}
      style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "8px 12px 8px 10px", border: "none", borderRadius: 8, background: isActive ? `${ACCENT}18` : "transparent", color: isActive ? ACCENT : "#374151", cursor: "pointer", fontSize: 13.5, fontWeight: isActive ? 600 : 500, textAlign: "left", transition: "background 0.15s, color 0.15s", marginBottom: 2 }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0, background: isActive ? ACCENT : "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.15s" }}>
        <Icon d={ICONS[iconKey] || ICONS.tickets} size={16} stroke={isActive ? "#fff" : "#6b7280"} />
      </div>
      <span style={{ flex: 1 }}>{label}</span>
      {badge && (
        <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 8, background: "#ef4444", color: "#fff", fontWeight: 700 }}>{badge}</span>
      )}
    </button>
  );
}

function Sidebar({ activePage, onNavigate, fullName, designation }) {
  const { theme } = useTheme();
  const ACCENT = theme.accent;
  return (
    <aside style={{ width: 232, background: theme.sidebar, borderRight: `1px solid ${theme.border}`, display: "flex", flexDirection: "column", flexShrink: 0, height: "100vh" }}>
      <div style={{ padding: "15px 16px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 9 }}>
        <div style={{ width: 32, height: 32, borderRadius: 9, background: ACCENT, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 15, fontWeight: 800 }}>S</div>
        <span style={{ fontSize: 16, fontWeight: 800, color: "#111827", letterSpacing: "-0.4px" }}>SmartHR</span>
      </div>
      <nav style={{ padding: "14px 10px", flex: 1, overflowY: "auto" }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.9px", padding: "0 10px 8px" }}>HRM</div>
        <SideNavItem label="Dashboard" iconKey="home"   pageKey={null}      activePage={activePage} onNavigate={onNavigate} />
        <SideNavItem label="Projects"  iconKey="folder" pageKey="projects"  activePage={activePage} onNavigate={onNavigate} />
        <SideNavItem label="Tasks"     iconKey="list"   pageKey="Tasks"     activePage={activePage} onNavigate={onNavigate} />
        <AccordionNavItem label="Tickets" iconKey="tickets" activePage={activePage} onNavigate={onNavigate}
          subItems={[
            { label: "Ticket",            iconKey: "ticketList",   pageKey: "tickets"            },
            { label: "Ticket Details",    iconKey: "ticketDetail", pageKey: "tickets-details"    },
            { label: "Ticket Automation", iconKey: "automation",   pageKey: "tickets-automation" },
            { label: "Ticket Reports",    iconKey: "reports",      pageKey: "tickets-reports"    },
          ]}
        />
        <AccordionNavItem label="Attendance" iconKey="attendance" activePage={activePage} onNavigate={onNavigate}
          subItems={[
            { label: "Leaves",              iconKey: "ticketList", pageKey: "attendance-leaves"     },
            { label: "Attendance",          iconKey: "ticketList", pageKey: "attendance-employee"   },
            { label: "Timesheets",          iconKey: "reports",    pageKey: "attendance-timesheets" },
            { label: "Shift & Schedule",    iconKey: "ticketList", pageKey: "attendance-shift"      },
            { label: "Shift Swap Requests", iconKey: "automation", pageKey: "attendance-swap",  badge: "New" },
            { label: "Overtime",            iconKey: "reports",    pageKey: "attendance-overtime"   },
            { label: "Holiday Calendar",    iconKey: "ticketList", pageKey: "attendance-holidays",  badge: "New" },
            { label: "WFH Management",      iconKey: "ticketList", pageKey: "attendance-wfh",       badge: "New" },
          ]}
        />
        <AccordionNavItem label="Performance" iconKey="performance" activePage={activePage} onNavigate={onNavigate}
          subItems={[
            { label: "Performance Indicator", iconKey: "reports",      pageKey: "performance-indicator" },
            { label: "Performance Review",    iconKey: "ticketDetail", pageKey: "performance-review"    },
            { label: "Performance Appraisal", iconKey: "ticketDetail", pageKey: "performance-appraisal" },
            { label: "Goal List",             iconKey: "ticketList",   pageKey: "performance-goal-list" },
            { label: "Goal Type",             iconKey: "automation",   pageKey: "performance-goal-type" },
          ]}
        />
        <AccordionNavItem label="Training" iconKey="training" activePage={activePage} onNavigate={onNavigate}
          subItems={[
            { label: "Training List",          iconKey: "ticketList",  pageKey: "training-list"      },
            { label: "Trainers",               iconKey: "ticketDetail",pageKey: "training-trainers"  },
            { label: "Training Type",          iconKey: "automation",  pageKey: "training-type"      },
            { label: "Certification Tracking", iconKey: "ticketList",  pageKey: "training-cert",  badge: "New" },
            { label: "Learning Analytics",     iconKey: "reports",     pageKey: "training-analytics", badge: "New" },
          ]}
        />
        <SideNavItem label="Probation Management" iconKey="probation"   pageKey="probation"   badge="New" activePage={activePage} onNavigate={onNavigate} />
        <SideNavItem label="Notice Period Tracker" iconKey="notice"     pageKey="notice"      badge="New" activePage={activePage} onNavigate={onNavigate} />
        <SideNavItem label="Promotion"             iconKey="promotion"  pageKey="promotion"             activePage={activePage} onNavigate={onNavigate} />
        <SideNavItem label="Resignation"           iconKey="resignation"pageKey="resignation"           activePage={activePage} onNavigate={onNavigate} />
        <SideNavItem label="Termination"           iconKey="termination"pageKey="termination"           activePage={activePage} onNavigate={onNavigate} />
        <SideNavItem label="Holidays"              iconKey="holidays"   pageKey="holidays"              activePage={activePage} onNavigate={onNavigate} />
      </nav>
      <div style={{ padding: "12px 14px", borderTop: "1px solid #f1f5f9" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <Avatar name={fullName || "Employee"} size={34} color="#374151" />
          <div style={{ overflow: "hidden" }}>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{fullName || "Employee"}</div>
            <div style={{ fontSize: 10.5, color: "#9ca3af" }}>{designation || "Employee"}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TOPBAR
// ─────────────────────────────────────────────────────────────────────────────
function Topbar({ fullName, isPunchedIn }) {
  const { theme, setTheme } = useTheme();
  const ACCENT = theme.accent;
  const router = useRouter();
  const [showProfile, setShowProfile] = useState(false);
  const [darkMode,    setDarkMode]    = useState(false);
  const [compact,     setCompact]     = useState(false);
  const [showGrid,    setShowGrid]    = useState(false);
  const [notifications, setNotifications] = useState(3);
  const profileRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    try { await fetch(`${BASE}/api/auth/logout`, { method: "POST", headers: HEADERS() }); } catch (_) {}
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    localStorage.removeItem("emp_active_page");
    router.replace("/auth/Employeelogin");
  };

  const IconBtn = ({ d, active, onClick, badge, title }) => (
    <div title={title} onClick={onClick} style={{ width: 32, height: 32, borderRadius: 8, background: active ? `${ACCENT}18` : "#f9fafb", border: `1px solid ${active ? ACCENT + "55" : "#e5e7eb"}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative", transition: "all 0.15s", flexShrink: 0 }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = "#f3f4f6"; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = "#f9fafb"; }}>
      <Icon d={d} stroke={active ? ACCENT : "#6b7280"} size={14} />
      {badge > 0 && (
        <div style={{ position: "absolute", top: -3, right: -3, width: 14, height: 14, borderRadius: "50%", background: "#ef4444", border: "2px solid #fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 7, color: "#fff", fontWeight: 800 }}>{badge}</span>
        </div>
      )}
    </div>
  );

  return (
    <div style={{ background: theme.topbar, borderBottom: `1px solid ${theme.border}`, padding: "10px 20px", display: "flex", alignItems: "center", gap: 8, flexShrink: 0, position: "relative", zIndex: 100 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 7, padding: "5px 10px", flex: 1, maxWidth: 240 }}>
        <Icon d={ICONS.search} stroke="#9ca3af" />
        <input placeholder="Search in HRMS…" style={{ border: "none", background: "transparent", fontSize: 12, color: "#6b7280", outline: "none", width: "100%" }} />
        <span style={{ fontSize: 10, color: "#d1d5db" }}>⌘/</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 20, background: isPunchedIn ? "#dcfce7" : "#f1f5f9", border: `1px solid ${isPunchedIn ? "#bbf7d0" : "#e5e7eb"}` }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: isPunchedIn ? "#22c55e" : "#9ca3af", animation: isPunchedIn ? "syncPulse 2s ease-in-out infinite" : "none" }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: isPunchedIn ? "#166534" : "#6b7280" }}>{isPunchedIn ? "Working" : "Offline"}</span>
        </div>
        <IconBtn title="App Grid"     d={ICONS.grid}    active={showGrid}  onClick={() => setShowGrid(g => !g)} />
        <IconBtn title={darkMode ? "Light Mode" : "Dark Mode"} d={darkMode ? ICONS.sun : ICONS.monitor} active={darkMode}
          onClick={() => { const next = !darkMode; setDarkMode(next); setTheme(next ? { sidebar:"#1e293b", topbar:"#1e293b", card:"#334155", pageBg:"#0f172a", text:"#f1f5f9", textSub:"#94a3b8", border:"#334155" } : { sidebar:"#ffffff", topbar:"#ffffff", card:"#ffffff", pageBg:"#f9fafb", text:"#111827", textSub:"#6b7280", border:"#f1f5f9" }); }} />
        <IconBtn title="Compact Mode" d="M4 6h16M4 12h16M4 18h16" active={compact} onClick={() => setCompact(c => !c)} />
        <IconBtn title="Messages"     d={ICONS.mail} />
        <IconBtn title="Notifications" d={ICONS.bell} badge={notifications} onClick={() => setNotifications(0)} />
        <div ref={profileRef} style={{ position: "relative" }}>
          <div onClick={() => setShowProfile(s => !s)} style={{ cursor: "pointer" }}>
            <Avatar name={fullName || "Employee"} size={32} color={ACCENT} />
          </div>
          {showProfile && (
            <div style={{ position: "absolute", top: 42, right: 0, width: 220, background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", boxShadow: "0 10px 40px rgba(0,0,0,0.12)", zIndex: 999, overflow: "hidden" }}>
              <div style={{ background: "linear-gradient(135deg,#1e293b,#334155)", padding: "14px 16px", display: "flex", gap: 10, alignItems: "center" }}>
                <Avatar name={fullName || "E"} size={38} color={ACCENT} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{fullName || "Employee"}</div>
                  <div style={{ fontSize: 10, color: "#94a3b8" }}>Employee</div>
                </div>
              </div>
              {[
                { icon: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z", label: "My Profile" },
                { icon: ICONS.settings, label: "Account Settings" },
                { icon: ICONS.bell,     label: "Notifications" },
                { icon: ICONS.clock,    label: "Activity Log" },
              ].map(({ icon, label }, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", cursor: "pointer", fontSize: 13, color: "#374151", borderBottom: "1px solid #f9fafb" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#f9fafb"}
                  onMouseLeave={e => e.currentTarget.style.background = "#fff"}>
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon d={icon} stroke="#6b7280" size={13} />
                  </div>
                  {label}
                </div>
              ))}
              <div onClick={handleLogout} style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 16px", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#ef4444" }}
                onMouseEnter={e => e.currentTarget.style.background = "#fef2f2"}
                onMouseLeave={e => e.currentTarget.style.background = "#fff"}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon d={ICONS.logOut} stroke="#ef4444" size={13} />
                </div>
                Sign Out
              </div>
            </div>
          )}
        </div>
      </div>
      {showGrid && (
        <div style={{ position: "absolute", top: 56, right: 140, background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", boxShadow: "0 10px 40px rgba(0,0,0,0.1)", padding: 16, zIndex: 999, width: 200 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.8px" }}>Quick Access</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
            {[
              { label: "Dashboard", icon: ICONS.home     },
              { label: "Projects",  icon: ICONS.folder   },
              { label: "Tickets",   icon: ICONS.tickets  },
              { label: "Leaves",    icon: ICONS.calendar },
              { label: "Reports",   icon: ICONS.reports  },
              { label: "Settings",  icon: ICONS.settings },
            ].map(({ label, icon }, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, padding: "8px 4px", borderRadius: 8, cursor: "pointer" }}
                onMouseEnter={e => e.currentTarget.style.background = "#f9fafb"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <div style={{ width: 36, height: 36, borderRadius: 9, background: `${ACCENT}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon d={icon} stroke={ACCENT} size={16} />
                </div>
                <span style={{ fontSize: 9, color: "#6b7280", textAlign: "center" }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SETTINGS PANEL
// ─────────────────────────────────────────────────────────────────────────────
const PRESET_THEMES = [
  { name: "Orange",  accent: "#f97316", accentDark: "#ea580c" },
  { name: "Blue",    accent: "#3b82f6", accentDark: "#2563eb" },
  { name: "Purple",  accent: "#8b5cf6", accentDark: "#7c3aed" },
  { name: "Green",   accent: "#22c55e", accentDark: "#16a34a" },
  { name: "Pink",    accent: "#ec4899", accentDark: "#db2777" },
  { name: "Teal",    accent: "#14b8a6", accentDark: "#0d9488" },
  { name: "Red",     accent: "#ef4444", accentDark: "#dc2626" },
  { name: "Indigo",  accent: "#6366f1", accentDark: "#4f46e5" },
];

function SettingsPanel() {
  const { theme, setTheme } = useTheme();
  const ACCENT = theme.accent;
  const [open, setOpen] = useState(false);
  const ColorRow = ({ label, themeKey }) => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
      <span style={{ fontSize: 12, color: "#6b7280" }}>{label}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ fontSize: 10, color: "#9ca3af", fontFamily: "monospace" }}>{theme[themeKey]}</span>
        <input type="color" value={theme[themeKey]} onChange={e => setTheme({ [themeKey]: e.target.value })}
          style={{ width: 32, height: 24, border: "1px solid #e5e7eb", borderRadius: 5, cursor: "pointer", padding: 1, background: "none" }} />
      </div>
    </div>
  );
  return (
    <>
      <button onClick={() => setOpen(o => !o)} style={{ position: "fixed", bottom: 24, right: 24, width: 46, height: 46, borderRadius: "50%", background: ACCENT, border: "none", boxShadow: `0 4px 20px ${ACCENT}66`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 1000, animation: open ? "none" : "floatPulse 3s ease-in-out infinite", transition: "transform 0.3s", transform: open ? "rotate(45deg)" : "rotate(0deg)" }}>
        <Icon d={ICONS.settings} stroke="#fff" size={20} />
        <style>{`@keyframes floatPulse { 0%,100% { box-shadow: 0 4px 20px ${ACCENT}66; } 50% { box-shadow: 0 4px 32px ${ACCENT}99; } }`}</style>
      </button>
      {open && (
        <div style={{ position: "fixed", bottom: 80, right: 24, width: 300, background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", boxShadow: "0 20px 60px rgba(0,0,0,0.15)", zIndex: 1000, overflow: "hidden", animation: "slideUp 0.2s ease" }}>
          <style>{`@keyframes slideUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }`}</style>
          <div style={{ background: "linear-gradient(135deg,#1e293b,#334155)", padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>Theme Settings</div>
              <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>Customise your workspace</div>
            </div>
            <button onClick={() => setTheme(DEFAULT_THEME)} style={{ fontSize: 10, padding: "3px 9px", background: "rgba(255,255,255,0.12)", border: "none", borderRadius: 6, color: "#fff", cursor: "pointer" }}>Reset</button>
          </div>
          <div style={{ padding: "14px 16px", maxHeight: 460, overflowY: "auto" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#374151", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.7px" }}>Accent Color</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
              {PRESET_THEMES.map((p, i) => (
                <div key={i} title={p.name} onClick={() => setTheme({ accent: p.accent, accentDark: p.accentDark })}
                  style={{ width: 28, height: 28, borderRadius: "50%", background: p.accent, cursor: "pointer", border: theme.accent === p.accent ? "3px solid #1e293b" : "3px solid transparent", boxShadow: theme.accent === p.accent ? `0 0 0 2px ${p.accent}` : "none", transition: "all 0.15s" }} />
              ))}
              <label style={{ width: 28, height: 28, borderRadius: "50%", border: "2px dashed #d1d5db", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", overflow: "hidden", position: "relative" }}>
                <span style={{ fontSize: 16, color: "#9ca3af" }}>+</span>
                <input type="color" value={theme.accent} onChange={e => setTheme({ accent: e.target.value, accentDark: e.target.value })} style={{ position: "absolute", opacity: 0, width: "100%", height: "100%", cursor: "pointer" }} />
              </label>
            </div>
            <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 14, marginBottom: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#374151", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.7px" }}>Surface Colors</div>
              <ColorRow label="Sidebar background" themeKey="sidebar" />
              <ColorRow label="Topbar background"  themeKey="topbar"  />
              <ColorRow label="Card background"    themeKey="card"    />
              <ColorRow label="Page background"    themeKey="pageBg"  />
              <ColorRow label="Border color"       themeKey="border"  />
            </div>
            <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 14, marginBottom: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#374151", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.7px" }}>Typography</div>
              <ColorRow label="Primary text"   themeKey="text"    />
              <ColorRow label="Secondary text" themeKey="textSub" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD CHARTS
// ─────────────────────────────────────────────────────────────────────────────
const DonutChart = () => {
  const data = [{ v: 1254, c: "#22c55e" }, { v: 32, c: "#ef4444" }, { v: 658, c: "#3b82f6" }, { v: 14, c: "#f97316" }, { v: 68, c: "#a855f7" }];
  const total = data.reduce((s, d) => s + d.v, 0);
  const r = 42, circ = 2 * Math.PI * r;
  let offset = 0;
  const segs = data.map(d => { const len = (d.v / total) * circ; const seg = { ...d, da: `${len} ${circ - len}`, do: -offset }; offset += len; return seg; });
  return (
    <svg width={110} height={110} viewBox="0 0 110 110">
      <circle cx={55} cy={55} r={r} fill="none" stroke="#f1f5f9" strokeWidth={14} />
      {segs.map((s, i) => (
        <circle key={i} cx={55} cy={55} r={r} fill="none" stroke={s.c} strokeWidth={14}
          strokeDasharray={s.da} strokeDashoffset={s.do} strokeLinecap="butt"
          style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }} />
      ))}
    </svg>
  );
};

const PerfChart = () => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
  const vals   = [18, 22, 30, 35, 42, 55, 60];
  const W = 440, H = 115, pL = 30, pB = 20, pR = 10, pT = 10, maxV = 65;
  const pts = vals.map((v, i) => [pL + (i / (vals.length - 1)) * (W - pL - pR), pT + (1 - v / maxV) * (H - pT - pB)]);
  const area = `M${pts[0][0]},${pts[0][1]} ` + pts.slice(1).map(p => `L${p[0]},${p[1]}`).join(" ") + ` L${pts[pts.length-1][0]},${H-pB} L${pts[0][0]},${H-pB} Z`;
  const line = `M${pts[0][0]},${pts[0][1]} ` + pts.slice(1).map(p => `L${p[0]},${p[1]}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: 115 }}>
      <defs>
        <linearGradient id="pg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22c55e" stopOpacity=".25" />
          <stop offset="100%" stopColor="#22c55e" stopOpacity=".02" />
        </linearGradient>
      </defs>
      {[0, .25, .5, .75, 1].map((t, i) => <line key={i} x1={pL} y1={pT + t*(H-pT-pB)} x2={W-pR} y2={pT + t*(H-pT-pB)} stroke="#f1f5f9" strokeWidth="1" />)}
      <path d={area} fill="url(#pg)" />
      <path d={line} fill="none" stroke="#22c55e" strokeWidth="2" strokeLinejoin="round" />
      {pts.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={3} fill="#22c55e" />)}
      {months.map((m, i) => <text key={i} x={pL + (i/(months.length-1))*(W-pL-pR)} y={H} textAnchor="middle" fontSize="9" fill="#94a3b8">{m}</text>)}
    </svg>
  );
};

const SkillCircle = ({ pct, color }) => {
  const c = 2 * Math.PI * 16;
  return (
    <svg width={38} height={38} viewBox="0 0 40 40">
      <circle cx={20} cy={20} r={16} fill="none" stroke="#e2e8f0" strokeWidth={4} />
      <circle cx={20} cy={20} r={16} fill="none" stroke={color} strokeWidth={4}
        strokeDasharray={`${(pct / 100) * c} ${c - (pct / 100) * c}`}
        strokeDashoffset={25} strokeLinecap="round" />
      <text x={20} y={24} textAnchor="middle" fontSize={9} fontWeight={700} fill="#1e293b">{pct}%</text>
    </svg>
  );
};

function SparkBars({ color, values }) {
  const max = Math.max(...values);
  return (
    <svg viewBox="0 0 88 44" style={{ width: 88, height: 44 }}>
      {values.map((v, i) => {
        const barH = (v / max) * 34;
        const opacity = 0.35 + (i / (values.length - 1)) * 0.65;
        return <rect key={i} x={i * 8} y={40 - barH} width={5} height={barH} rx={2} fill={color} opacity={opacity} />;
      })}
    </svg>
  );
}

function StatCard({ icon, iconBg, label, value, badge, chartColor, chartValues }) {
  return (
    <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #f1f5f9", padding: "18px 16px", display: "flex", alignItems: "flex-end", justifyContent: "space-between", flex: 1 }}>
      <div>
        <div style={{ width: 44, height: 44, borderRadius: "50%", border: `2px solid ${iconBg}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
          <Icon d={icon} stroke={iconBg} size={18} />
        </div>
        <div style={{ fontSize: 11.5, color: "#9ca3af", marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: 26, fontWeight: 800, color: "#111827", lineHeight: 1 }}>{value}</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: "#22c55e", background: "#f0fdf4", padding: "2px 7px", borderRadius: 10 }}>{badge}</span>
        <SparkBars color={chartColor} values={chartValues} />
      </div>
    </div>
  );
}

const priorityStyle = {
  High:   { bg: "#fef2f2", text: "#dc2626", dot: "#dc2626" },
  Low:    { bg: "#f0fdf4", text: "#16a34a", dot: "#16a34a" },
  Medium: { bg: "#fffbeb", text: "#d97706", dot: "#d97706" },
};
const ticketStatusStyle = {
  Open:       { bg: "#fce7f3", text: "#be185d" },
  "On Hold":  { bg: "#fef9c3", text: "#854d0e" },
  Reopened:   { bg: "#ede9fe", text: "#7c3aed" },
  Resolved:   { bg: "#dcfce7", text: "#166534" },
  Closed:     { bg: "#f1f5f9", text: "#475569" },
};

function TicketRow({ id, category, title, status, priority, assignedTo, updatedAgo, comments, avatarColor: ac }) {
  const ACCENT = getTheme().accent;
  const pr = priorityStyle[priority]    || priorityStyle.Medium;
  const st = ticketStatusStyle[status] || { bg: "#f3f4f6", text: "#6b7280" };
  return (
    <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #f1f5f9", padding: "16px 20px", marginBottom: 10 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: ACCENT }}>{category}</span>
        <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 12px", borderRadius: 6, background: pr.bg, color: pr.text, display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: pr.dot, display: "inline-block" }} />{priority}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#fff", background: ACCENT, padding: "2px 8px", borderRadius: 5 }}>{id}</span>
        <span style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>{title}</span>
        <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 10, background: st.bg, color: st.text, fontWeight: 600 }}>• {status}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Avatar name={assignedTo} size={20} color={ac} />
          <span style={{ fontSize: 11.5, color: "#6b7280" }}>Assigned to <strong style={{ color: "#374151" }}>{assignedTo}</strong></span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <Icon d={ICONS.calendar} stroke="#9ca3af" size={12} />
          <span style={{ fontSize: 11, color: "#9ca3af" }}>Updated {updatedAgo}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <Icon d={ICONS.comment} stroke="#9ca3af" size={12} />
          <span style={{ fontSize: 11, color: "#9ca3af" }}>{comments} Comments</span>
        </div>
      </div>
    </div>
  );
}

function PlaceholderPage({ title }) {
  const ACCENT = getTheme().accent;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 20px", background: "#fff", borderRadius: 12, border: "1px solid #f1f5f9" }}>
      <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#fff3ed", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
        <Icon d={ICONS.settings} stroke={ACCENT} size={28} />
      </div>
      <h2 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 700, color: "#1e293b" }}>{title}</h2>
      <p style={{ margin: 0, fontSize: 13, color: "#9ca3af" }}>This page is under construction.</p>
    </div>
  );
}

function PunchButton({ attendance, punching, onPunch }) {
  const { theme } = useTheme();
  const ACCENT = theme.accent;
  const isPunchedIn = attendance?.last_punch_type === "in";
  const canPunchIn  = attendance?.can_punch_in  ?? true;
  const canPunchOut = attendance?.can_punch_out ?? false;
  const isDisabled  = punching || (!canPunchIn && !canPunchOut);
  const actionType  = isPunchedIn ? "out" : "in";
  const label       = punching ? "Processing…" : isPunchedIn ? "Punch Out" : "Punch In";
  const bg          = isPunchedIn ? "linear-gradient(90deg,#ef4444,#dc2626)" : `linear-gradient(90deg,${ACCENT},#ea580c)`;
  const pulseColor  = isPunchedIn ? "#ef4444" : ACCENT;
  return (
    <div style={{ position: "relative" }}>
      {isPunchedIn && !punching && <style>{`@keyframes punchPulse { 0% { transform:scale(1); opacity:0.6; } 100% { transform:scale(1.18); opacity:0; } }`}</style>}
      <button disabled={isDisabled} onClick={() => onPunch(actionType)}
        style={{ width: "100%", background: isDisabled ? "#e5e7eb" : bg, color: isDisabled ? "#9ca3af" : "#fff", border: "none", borderRadius: 8, padding: "10px 0", fontSize: 13, fontWeight: 700, cursor: isDisabled ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, transition: "opacity 0.2s", opacity: isDisabled ? 0.7 : 1, position: "relative", overflow: "hidden" }}>
        {punching ? (
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 0.8s linear infinite" }}>
            <path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
        ) : (
          <Icon d={isPunchedIn ? ICONS.logOut : ICONS.logIn} stroke="#fff" size={14} />
        )}
        {label}
      </button>
      <div style={{ position: "absolute", top: -3, right: -3, width: 10, height: 10, borderRadius: "50%", background: isPunchedIn ? "#22c55e" : "#9ca3af", border: "2px solid #fff", boxShadow: isPunchedIn ? `0 0 0 2px ${pulseColor}33` : "none", animation: isPunchedIn ? "punchPulse 1.5s ease-out infinite" : "none" }} />
    </div>
  );
}

function AttendanceCard({ attendance, loading, punching, error, onPunch }) {
  const { theme } = useTheme();
  const ACCENT = theme.accent;
  const now         = useClock();
  const isPunchedIn = attendance?.last_punch_type === "in";
  const shift       = attendance?.shift;
  const totalHours  = attendance?.total_hours ?? 0;
  const punchList   = attendance?.punches ?? [];
  const firstIn     = punchList.find(p => p.type === "in");
  const pct         = Math.min(shift?.progress_percent ?? 0, 100);
  const r = 40, circ = 2 * Math.PI * r, dash = (pct / 100) * circ;
  const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true });
  const dateStr = now.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
  return (
    <Card style={{ textAlign: "center", position: "relative" }}>
      <div style={{ position: "absolute", top: 10, right: 10, display: "flex", alignItems: "center", gap: 4 }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: error ? "#ef4444" : "#22c55e", animation: error ? "none" : "syncPulse 2s ease-in-out infinite" }} />
        <style>{`@keyframes syncPulse { 0%,100% { opacity:1; } 50% { opacity:0.3; } } @keyframes spin { from{transform:rotate(0deg);}to{transform:rotate(360deg);}}`}</style>
        <span style={{ fontSize: 9, color: error ? "#ef4444" : "#9ca3af" }}>{error ? "Offline" : "Live"}</span>
      </div>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 20, background: isPunchedIn ? "#dcfce7" : "#f1f5f9", marginBottom: 6 }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: isPunchedIn ? "#22c55e" : "#9ca3af" }} />
        <span style={{ fontSize: 10.5, fontWeight: 700, color: isPunchedIn ? "#166534" : "#6b7280" }}>{isPunchedIn ? "Currently Working" : "Punched Out"}</span>
      </div>
      <div style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", marginBottom: 2 }}>Attendance</div>
      <div style={{ fontSize: 11.5, fontWeight: 700, color: "#111827", marginBottom: 10 }}>{timeStr}, {dateStr}</div>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 10, position: "relative" }}>
        <svg width={100} height={100} viewBox="0 0 100 100">
          <circle cx={50} cy={50} r={r} fill="none" stroke="#e2e8f0" strokeWidth={8} />
          <circle cx={50} cy={50} r={r} fill="none" stroke={isPunchedIn ? "#22c55e" : "#9ca3af"} strokeWidth={8}
            strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
            style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%", transition: "stroke-dasharray 0.6s ease" }} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: "#1e293b" }}>{fmtHMS(totalHours)}</span>
          <span style={{ fontSize: 9, color: "#94a3b8" }}>Total Hours</span>
        </div>
      </div>
      {shift && (
        <div style={{ display: "inline-block", background: "#111827", color: "#fff", fontSize: 10.5, padding: "3px 10px", borderRadius: 12, marginBottom: 8 }}>
          {shift.name} · {Math.round((shift.total_minutes - shift.remaining_minutes) / 60 * 10) / 10}h worked
        </div>
      )}
      <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 10 }}>
        {firstIn ? `First Punch In at ${fmt12(firstIn.punch_time)}` : "No punch recorded today"}
      </div>
      {punchList.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, marginBottom: 12, flexWrap: "wrap", padding: "0 4px" }}>
          {punchList.slice(-6).map((p, i) => (
            <div key={p.id} title={`${p.type.toUpperCase()} · ${fmt12(p.punch_time)}`}
              style={{ width: 8, height: 8, borderRadius: "50%", background: p.type === "in" ? "#22c55e" : "#ef4444", border: i === punchList.length - 1 ? "2px solid #374151" : "2px solid transparent", cursor: "default" }} />
          ))}
          {punchList.length > 6 && <span style={{ fontSize: 9, color: "#9ca3af" }}>+{punchList.length - 6} more</span>}
        </div>
      )}
      {error && (
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 6, padding: "5px 8px", fontSize: 10.5, color: "#991b1b", marginBottom: 8 }}>{error}</div>
      )}
      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "9px 0", background: "#f9fafb", borderRadius: 8 }}>
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 0.8s linear infinite" }}>
            <path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
          <span style={{ fontSize: 12, color: "#9ca3af" }}>Loading…</span>
        </div>
      ) : (
        <PunchButton attendance={attendance} punching={punching} onPunch={onPunch} />
      )}
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────────────────────
export default function EmployeeDashboard() {
  const [activePage, setActivePage] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("emp_active_page");
      return stored || null;
    }
    return null;
  });

  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [showBanner, setShowBanner]           = useState(true);
  const [profile, setProfile]                 = useState(null);
  const [profileLoading, setProfileLoading]   = useState(true);
  const [projects, setProjects]               = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [projectsError, setProjectsError]     = useState(null);
  const [tasks, setTasks]                     = useState([]);
  const [tasksLoading, setTasksLoading]       = useState(true);
  const [tasksError, setTasksError]           = useState(null);

  const { attendance, dashboard, loading: attLoading, punching, error: attError, doPunch } = useAttendance();
  const isPunchedIn = attendance?.last_punch_type === "in";

  const dash        = dashboard;
  const todayWorked = Math.max(0, dash?.today?.worked  ?? 0);
  const todayTarget = dash?.today?.target  ?? 9;
  const weekWorked  = Math.max(0, dash?.week?.worked   ?? 0);
  const weekTarget  = dash?.week?.target   ?? 45;
  const monthWorked = Math.max(0, dash?.month?.worked  ?? 0);
  const monthTarget = dash?.month?.target  ?? 180;
  const otHours     = Math.max(0, dash?.overtime?.this_month_hours ?? 0);
  const otTarget    = dash?.overtime?.target_hours ?? 28;
  const weekChange  = dash?.week?.change_percent   ?? 0;
  const monthChange = dash?.month?.change_percent  ?? 0;
  const otChange    = dash?.overtime?.change_percent ?? 0;
  const sumTotal = dash?.summary?.total_working_hours ?? "—";
  const sumProd  = dash?.summary?.productive_hours    ?? "—";
  const sumBreak = dash?.summary?.break_hours         ?? "—";
  const sumOT    = dash?.summary?.overtime_today      ?? "—";
  const weekPct  = Math.min(100, Math.max(0, dash?.week?.progress_percent      ?? 0));
  const monthPct = Math.min(100, Math.max(0, dash?.month?.progress_percent     ?? 0));
  const otPct    = Math.min(100, Math.max(0, dash?.overtime?.progress_percent  ?? 0));
  const todayPct = Math.min(100, Math.max(0, todayTarget > 0 ? (todayWorked / todayTarget) * 100 : 0));

  // ── NAVIGATE (SPA — no router.push) ──────────────────────────────────────
  const navigate = (pg) => {
    setActivePage(pg);
    if (pg !== "project-detail") setSelectedProjectId(null);
    if (typeof window !== "undefined") {
      if (pg === null) {
        localStorage.removeItem("emp_active_page");
      } else {
        localStorage.setItem("emp_active_page", pg);
      }
    }
  };

  const openProjectDetail = (id) => {
    setSelectedProjectId(id);
    setActivePage("project-detail");
    if (typeof window !== "undefined") localStorage.setItem("emp_active_page", "project-detail");
  };

  useEffect(() => {
    fetch(`${BASE}/api/employee/profile`, { headers: HEADERS() })
      .then(r => r.json()).then(json => { if (json.success) setProfile(json.data); })
      .catch(console.error).finally(() => setProfileLoading(false));
  }, []);

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch(`${BASE}/api/employee/projects`, { headers: HEADERS() });
        const result = await res.json();
        let extracted = null;
        if (result.success && Array.isArray(result.data)) extracted = result.data;
        else if (result.success && Array.isArray(result.data?.projects)) extracted = result.data.projects;
        else if (Array.isArray(result.projects)) extracted = result.projects;
        else if (Array.isArray(result)) extracted = result;
        else if (Array.isArray(result.data)) extracted = result.data;
        if (extracted) setProjects(extracted);
        else throw new Error("Unrecognised shape");
      } catch (err) { setProjectsError(err.message); }
      finally { setProjectsLoading(false); }
    };
    run();
  }, []);

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch(`${BASE}/api/employee/tasks`, { headers: HEADERS() });
        const result = await res.json();
        if (result.success && Array.isArray(result.data)) {
          setTasks(result.data);
          setProjects(prev => {
            if (prev.length > 0) return prev;
            const seen = new Map();
            result.data.forEach(t => { if (t.project && !seen.has(t.project.id)) seen.set(t.project.id, { ...t.project, tasks_count: 0, total_tasks: 0, progress: 0, hours_logged: 0, total_hours: 0, team_members: [], project_manager: null }); });
            return [...seen.values()];
          });
          setProjectsLoading(false);
        }
      } catch (err) { setTasksError(err.message); }
      finally { setTasksLoading(false); }
    };
    run();
  }, []);

  const emp         = profile?.employee;
  const fullName    = profileLoading ? "Loading…" : emp ? `${emp.firstname} ${emp.lastname}` : "Employee";
  const designation = profile?.designation?.name ?? "Senior Product Designer";
  const department  = profile?.department?.name  ?? "UI/UX Design";
  const email       = emp?.email        ?? "employee@example.com";
  const phone       = emp?.phone_number ?? "+1 324 3453 545";
  const joiningDate = emp?.joining_date ?? "15 Jan 2024";

  const pageInfo = PAGE_TITLES[activePage] ?? PAGE_TITLES[null];

  const tickets = [
    { id: "Tic - 001", category: "IT Support", title: "Laptop Issue",   status: "Open",     priority: "High",   assignedTo: "Edgar Hansel", updatedAgo: "10 hours ago", comments: 9, avatarColor: "#6366f1" },
    { id: "Tic - 002", category: "IT Support", title: "Payment Issue",  status: "On Hold",  priority: "Low",    assignedTo: "Ann Lynch",    updatedAgo: "15 hours ago", comments: 9, avatarColor: "#f59e0b" },
    { id: "Tic - 003", category: "IT Support", title: "Bug Report",     status: "Reopened", priority: "Medium", assignedTo: "Juan Hermann", updatedAgo: "20 hours ago", comments: 9, avatarColor: "#22c55e" },
    { id: "Tic - 004", category: "IT Support", title: "Network Issue",  status: "Open",     priority: "High",   assignedTo: "Jessie Otero", updatedAgo: "1 day ago",    comments: 5, avatarColor: "#ef4444" },
    { id: "Tic - 005", category: "HR Support", title: "Leave Request",  status: "Resolved", priority: "Low",    assignedTo: "Ann Lynch",    updatedAgo: "2 days ago",   comments: 3, avatarColor: "#8b5cf6" },
  ];
  const sparkData = {
    new: [8,14,10,18,12,20,16,22,14,18,20], open: [6,10,8,14,10,16,12,18,10,14,16],
    solved: [4,8,6,10,8,12,10,14,8,10,12],  pending: [2,4,3,6,4,8,6,10,4,6,8],
  };
  const taskStatusStyle = {
    "pending":     { bg: "#fef9c3", text: "#854d0e",  label: "Pending"     },
    "in_progress": { bg: "#dbeafe", text: "#1e40af",  label: "In Progress" },
    "in progress": { bg: "#dbeafe", text: "#1e40af",  label: "In Progress" },
    "completed":   { bg: "#dcfce7", text: "#166534",  label: "Completed"   },
    "on_hold":     { bg: "#f3f4f6", text: "#6b7280",  label: "On Hold"     },
    "planning":    { bg: "#ede9fe", text: "#5b21b6",  label: "Planning"    },
  };
  const teamMembers = [
    { name: "Alexander Jermai", role: "UI/UX Designer",  color: "#6366f1" },
    { name: "Doglas Martini",   role: "Product Designer", color: "#f59e0b" },
    { name: "Daniel Esbella",   role: "Project Manager",  color: "#22c55e" },
    { name: "Daniel Esbella",   role: "Project Manager",  color: "#ef4444" },
    { name: "Stephan Perah",    role: "Team Lead",        color: "#8b5cf6" },
    { name: "Andrew Jermia",    role: "Project Lead",     color: "#06b6d4" },
  ];
  const notifications = [
    { name: "Lex Murphy", action: "requested access to UNIX", time: "Today at 9:42 AM",  file: "EV_review.pdf" },
    { name: "Lex Murphy", action: "requested access to UNIX", time: "Today at 10:00 AM" },
    { name: "Lex Murphy", action: "requested access to UNIX", time: "Today at 10:30 AM", actions: true },
    { name: "Lex Murphy", action: "requested access to UNIX", time: "Today at 12:00 PM" },
    { name: "Lex Murphy", action: "requested access to UNIX", time: "Today at 03:00 PM" },
  ];
  const meetings = [
    { time: "09:25 AM", title: "Marketing Strategy Presentation",                    cat: "Marketing",   dot: "#ef4444" },
    { time: "09:20 AM", title: "Design Review Hospital, doctors Management Project", cat: "Review",      dot: "#f59e0b" },
    { time: "09:18 AM", title: "Birthday Celebration of Employee",                   cat: "Celebration", dot: "#ef4444" },
    { time: "09:10 AM", title: "Update of Project Flow",                             cat: "Development", dot: "#22c55e" },
  ];
  const skills = [
    { name: "Figma",      date: "Updated · 15 May 2025", pct: 90, color: "#22c55e" },
    { name: "HTML",       date: "Updated · 12 May 2025", pct: 85, color: "#3b82f6" },
    { name: "CSS",        date: "Updated · 12 May 2025", pct: 79, color: "#3b82f6" },
    { name: "Wordpress",  date: "Updated · 15 May 2025", pct: 81, color: "#22c55e" },
    { name: "Javascript", date: "Updated · 13 May 2025", pct: 52, color: "#f59e0b" },
  ];

  const renderContent = () => {
    const ACCENT = _theme.accent;

    // ── PROJECTS (with slide-in panel) ─────────────────────────────────────
    if (activePage === "projects") return (
      <>
        <ProjectsListPage onSelectProject={(id) => setSelectedProjectId(id)} />
        {selectedProjectId && (
          <ProjectDetailPanel
            projectId={selectedProjectId}
            onClose={() => setSelectedProjectId(null)}
          />
        )}
      </>
    );

    // ── PROJECT DETAIL (direct nav fallback) ───────────────────────────────
    if (activePage === "project-detail") return (
      <>
        <ProjectsListPage onSelectProject={(id) => setSelectedProjectId(id)} />
        {selectedProjectId && (
          <ProjectDetailPanel
            projectId={selectedProjectId}
            onClose={() => { setSelectedProjectId(null); navigate("projects"); }}
          />
        )}
      </>
    );

    // ── TASKS ──────────────────────────────────────────────────────────────
    if (activePage === "Tasks") return <TasksPage />;

    // ── DASHBOARD ──────────────────────────────────────────────────────────
    if (activePage === null) return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {showBanner && (
          <div style={{ background: "#fefce8", border: "1px solid #fde047", borderRadius: 8, padding: "8px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 12.5, color: "#854d0e" }}>Your Leave Request on "24th April 2024" has been Approved!!!</span>
            <button onClick={() => setShowBanner(false)} style={{ background: "none", border: "none", color: "#854d0e", fontSize: 18, lineHeight: 1, cursor: "pointer" }}>×</button>
          </div>
        )}
        {/* ROW 1 */}
        <div style={{ display: "grid", gridTemplateColumns: "300px 1fr 210px", gap: 12 }}>
          <Card style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ background: "linear-gradient(135deg,#1e293b,#334155)", padding: 14, display: "flex", alignItems: "center", gap: 12 }}>
              <Avatar name={fullName} size={50} color={ACCENT} />
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{fullName}</div>
                <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{designation}</div>
                <div style={{ display: "flex", gap: 5, marginTop: 5 }}>
                  <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 10, background: "#312e81", color: "#a5b4fc", fontWeight: 600 }}>{department}</span>
                  <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 10, background: "#1e3a5f", color: "#7dd3fc", fontWeight: 600 }}>{designation}</span>
                </div>
              </div>
            </div>
            <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 7 }}>
              {[{ icon: ICONS.phone, val: phone }, { icon: ICONS.mail, val: email }, { icon: ICONS.mapPin, val: department }, { icon: ICONS.calendar, val: joiningDate }].map(({ icon, val }, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Icon d={icon} stroke="#9ca3af" /><span style={{ fontSize: 11.5, color: "#4b5563" }}>{val}</span>
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 700 }}>Leave Details</span>
              <span style={{ fontSize: 11, color: "#9ca3af" }}>2026</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <DonutChart />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, flex: 1 }}>
                {[["#22c55e","1254 On Time"],["#ef4444","32 Late Attendance"],["#3b82f6","658 Work From Home"],["#f97316","14 Absent"],["#a855f7","68 Sick Leave"]].map(([c, l], i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 5 }}><Dot color={c} /><span style={{ fontSize: 10.5, color: "#4b5563" }}>{l}</span></div>
                ))}
              </div>
            </div>
            <div style={{ marginTop: 10, background: "#f0fdf4", borderRadius: 7, padding: "7px 11px", fontSize: 12, color: "#166534" }}>
              Better than <strong>85%</strong> of Employees
            </div>
          </Card>
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 700 }}>Leave Details</span>
              <span style={{ fontSize: 11, color: "#9ca3af" }}>2026</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
              {[["Total Leaves",16],["Taken",10],["Absent",2],["Request",0],["Worked Days",240],["Loss of Pay",2]].map(([l,v],i) => (
                <div key={i}><div style={{ fontSize: 10, color: "#9ca3af" }}>{l}</div><div style={{ fontSize: 18, fontWeight: 800, color: "#111827" }}>{v}</div></div>
              ))}
            </div>
            <button style={{ width: "100%", background: "#111827", color: "#fff", border: "none", borderRadius: 8, padding: 9, fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}>Apply New Leave</button>
          </Card>
        </div>
        {/* ROW 2 */}
        <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 12 }}>
          <AttendanceCard attendance={attendance} loading={attLoading} punching={punching} error={attError} onPunch={doPunch} />
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", gap: 10 }}>
              {[
                { value: `${todayWorked.toFixed(1)}/${todayTarget}`, label: "Total Hours Today",  badge: `${Math.abs(dash?.today?.percentage ?? 0).toFixed(1)}%`, pct: todayPct, color: "#22c55e", isGood: (dash?.today?.percentage ?? 0) >= 0 },
                { value: `${weekWorked.toFixed(1)}/${weekTarget}`,   label: "Total Hours Week",   badge: `${Math.abs(weekChange).toFixed(1)}% vs last week`,  pct: weekPct,  color: "#3b82f6", isGood: weekChange >= 0 },
                { value: `${monthWorked.toFixed(1)}/${monthTarget}`, label: "Total Hours Month",  badge: `${Math.abs(monthChange).toFixed(1)}% vs last month`, pct: monthPct, color: "#a855f7", isGood: monthChange >= 0 },
                { value: `${otHours}/${otTarget}`,                   label: "Overtime this Month",badge: `${Math.abs(otChange).toFixed(1)}% vs last month`,    pct: otPct,    color: "#f59e0b", isGood: otChange >= 0 },
              ].map(({ value, label, badge, pct, color, isGood }, i) => (
                <div key={i} style={{ background: "#fff", borderRadius: 10, border: "1px solid #f1f5f9", padding: "12px 14px", flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 19, fontWeight: 800, color: "#111827", letterSpacing: "-0.5px" }}>{value}</div>
                  <div style={{ fontSize: 10, color: "#9ca3af", margin: "2px 0 7px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{label}</div>
                  <div style={{ height: 4, background: "#e5e7eb", borderRadius: 2, overflow: "hidden", marginBottom: 6 }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 2, transition: "width 0.6s ease" }} />
                  </div>
                  <span style={{ fontSize: 9, padding: "1px 6px", borderRadius: 10, background: isGood ? "#dcfce7" : "#fee2e2", color: isGood ? "#166634" : "#991b1b", fontWeight: 600 }}>
                    {isGood ? "↑" : "↓"} {badge}
                  </span>
                </div>
              ))}
            </div>
            <Card>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                {[[sumTotal,"Total Working hours"],[sumProd,"Productive Hours"],[sumBreak,"Break hours"],[sumOT,"Overtime Today"]].map(([v,l],i) => (
                  <div key={i}><div style={{ fontSize: 10, color: "#9ca3af" }}>{l}</div><div style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>{v}</div></div>
                ))}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 6 }}>
                {[["#22c55e",todayPct],["#3b82f6",weekPct],["#f59e0b",monthPct],["#8b5cf6",otPct]].map(([c,w],i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Dot color={c} />
                    <div style={{ flex: 1, height: 5, borderRadius: 3, background: "#e5e7eb", overflow: "hidden" }}>
                      <div style={{ width: `${w}%`, height: "100%", background: c, borderRadius: 3, transition: "width 0.6s ease" }} />
                    </div>
                    <span style={{ fontSize: 9, color: "#9ca3af", minWidth: 28, textAlign: "right" }}>{w.toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
        {/* ROW 3 */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 700 }}>Projects</span>
              <button style={{ background: "#f3f4f6", border: "none", borderRadius: 5, padding: "3px 9px", fontSize: 11, color: "#6b7280", cursor: "pointer" }}>Ongoing Projects ▾</button>
            </div>
            {projectsLoading ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 30, gap: 8, color: "#9ca3af" }}>
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 1s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
                <span style={{ fontSize: 12 }}>Loading projects…</span>
              </div>
            ) : projectsError ? (
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "12px 14px", fontSize: 11, color: "#991b1b" }}>Failed to load projects: {projectsError}</div>
            ) : projects.length === 0 ? (
              <div style={{ textAlign: "center", padding: 24, color: "#9ca3af", fontSize: 12 }}>No projects assigned</div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {projects.map((p, i) => (
                  <div key={p.id || i} style={{ background: "#f9fafb", borderRadius: 8, padding: 11, border: "1px solid #f3f4f6", cursor: "pointer" }}
                    onClick={() => { navigate("projects"); setSelectedProjectId(p.id); }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.06)"}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 600 }}>{p.project_name || p.name || "Untitled"}</span>
                      <Icon d={ICONS.more} sw={2.5} stroke="#9ca3af" />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
                      <Avatar name={p.project_manager?.firstname || "PM"} size={26} color="#6366f1" />
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 600 }}>{p.project_manager ? `${p.project_manager.firstname ?? ""} ${p.project_manager.lastname ?? ""}`.trim() : "Project Manager"}</div>
                        <div style={{ fontSize: 10, color: "#9ca3af" }}>Project Leader</div>
                      </div>
                    </div>
                    <div style={{ fontSize: 11, color: "#ef4444", marginBottom: 6 }}>{p.end_date ? `Deadline: ${p.end_date}` : "Deadline not set"}</div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ flex: 1, height: 5, background: "#e5e7eb", borderRadius: 3, marginRight: 6, overflow: "hidden" }}>
                        <div style={{ width: `${p.progress ?? 0}%`, height: "100%", background: "#6366f1", borderRadius: 3 }} />
                      </div>
                      <span style={{ fontSize: 10.5, fontWeight: 600, color: ACCENT }}>{p.hours_logged ?? 0}/{p.total_hours ?? 0} Hrs</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 700 }}>Tasks</span>
              <span style={{ fontSize: 10, background: "#f3f4f6", padding: "2px 8px", borderRadius: 10, color: "#6b7280" }}>{tasksLoading ? "…" : `${tasks.length} Total`}</span>
            </div>
            {tasksLoading ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 30, gap: 8, color: "#9ca3af" }}>
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 1s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
                <span style={{ fontSize: 12 }}>Loading tasks…</span>
              </div>
            ) : tasksError ? (
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 12px", fontSize: 11, color: "#991b1b" }}>Failed: {tasksError}</div>
            ) : tasks.length === 0 ? (
              <div style={{ textAlign: "center", padding: 24, color: "#9ca3af", fontSize: 12 }}>No tasks assigned</div>
            ) : tasks.map((t, i) => {
              const key = (t.status ?? "").toLowerCase().replace(" ", "_");
              const sc  = taskStatusStyle[key] || { bg: "#f3f4f6", text: "#6b7280", label: t.status };
              const priorityColor = t.priority === "high" ? "#ef4444" : t.priority === "medium" ? "#f59e0b" : "#9ca3af";
              return (
                <div key={t.id ?? i} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "9px 8px", borderBottom: i < tasks.length - 1 ? "1px solid #f9fafb" : "none" }}>
                  <Dot color={priorityColor} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, color: "#374151", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.title}</div>
                    {t.project?.project_name && <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 1 }}>{t.project.project_name}</div>}
                  </div>
                  <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 12, background: sc.bg, color: sc.text, fontWeight: 600, whiteSpace: "nowrap", flexShrink: 0 }}>{sc.label}</span>
                  <Avatar name={t.creator?.name ?? "?"} size={21} color="#6366f1" />
                </div>
              );
            })}
          </Card>
        </div>
        {/* ROW 4 */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 210px", gap: 12 }}>
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>Performance</div>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 4 }}>
                  <span style={{ fontSize: 22, fontWeight: 800 }}>98%</span>
                  <span style={{ fontSize: 10, padding: "2px 7px", background: "#dcfce7", color: "#166534", borderRadius: 10, fontWeight: 600 }}>13%</span>
                  <span style={{ fontSize: 11, color: "#9ca3af" }}>vs last years</span>
                </div>
              </div>
              <span style={{ fontSize: 11, color: "#9ca3af" }}>2026</span>
            </div>
            <PerfChart />
          </Card>
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 700 }}>My Skills</span>
              <span style={{ fontSize: 11, color: "#9ca3af" }}>2026</span>
            </div>
            {skills.map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderBottom: i < skills.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{s.name}</div>
                  <div style={{ fontSize: 10, color: "#9ca3af" }}>{s.date}</div>
                </div>
                <SkillCircle pct={s.pct} color={s.color} />
              </div>
            ))}
          </Card>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ background: "#1e293b", borderRadius: 10, padding: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>Team Birthday</span>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 6 }}>
                  <Avatar name="Andrew Jermia" size={44} color="#8b5cf6" />
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>Andrew Jermia</div>
                <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 10 }}>iOS Developer</div>
                <button style={{ width: "100%", background: "#f59e0b", color: "#fff", border: "none", borderRadius: 7, padding: 7, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Send Wishes 🎂</button>
              </div>
            </div>
            <div style={{ background: "#1e293b", borderRadius: 10, padding: "11px 13px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>Leave Policy</div>
                <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>Last Updated · Today</div>
              </div>
              <button style={{ background: "#334155", color: "#e2e8f0", border: "none", borderRadius: 5, padding: "4px 9px", fontSize: 11, cursor: "pointer" }}>View All</button>
            </div>
            <div style={{ background: ACCENT, borderRadius: 10, padding: "11px 13px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>Next Holiday</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.75)", marginTop: 2 }}>Diwali, 15 Sep 2025</div>
              </div>
              <button style={{ background: "rgba(0,0,0,0.15)", color: "#fff", border: "none", borderRadius: 5, padding: "4px 9px", fontSize: 11, cursor: "pointer" }}>View All</button>
            </div>
          </div>
        </div>
        {/* ROW 5 */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 700 }}>Team Members</span>
              <span style={{ fontSize: 11, color: ACCENT, fontWeight: 600, cursor: "pointer" }}>View All</span>
            </div>
            {teamMembers.map((m, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 0", borderBottom: i < teamMembers.length - 1 ? "1px solid #f9fafb" : "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Avatar name={m.name} size={30} color={m.color} />
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>{m.name}</div>
                    <div style={{ fontSize: 10.5, color: "#9ca3af" }}>{m.role}</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  {[ICONS.phone, ICONS.video, ICONS.chat].map((d, j) => (
                    <div key={j} style={{ width: 24, height: 24, borderRadius: 5, background: "#f9fafb", border: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                      <Icon d={d} size={11} stroke="#6b7280" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </Card>
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 700 }}>Notifications</span>
              <span style={{ fontSize: 11, color: ACCENT, fontWeight: 600, cursor: "pointer" }}>View All</span>
            </div>
            {notifications.map((n, i) => (
              <div key={i} style={{ display: "flex", gap: 8, padding: "7px 0", borderBottom: i < notifications.length - 1 ? "1px solid #f9fafb" : "none" }}>
                <Avatar name={n.name} size={28} color="#6366f1" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11.5, color: "#4b5563" }}><strong style={{ color: "#111827" }}>{n.name}</strong> {n.action}</div>
                  <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 1 }}>{n.time}</div>
                  {n.file && <div style={{ display: "inline-flex", alignItems: "center", gap: 3, background: "#fef9c3", padding: "2px 7px", borderRadius: 4, marginTop: 4 }}><span style={{ fontSize: 10, color: "#854d0e" }}>{n.file}</span></div>}
                  {n.actions && (
                    <div style={{ display: "flex", gap: 5, marginTop: 5 }}>
                      <button style={{ background: "#22c55e", color: "#fff", border: "none", borderRadius: 5, padding: "3px 11px", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Approve</button>
                      <button style={{ background: "#ef4444", color: "#fff", border: "none", borderRadius: 5, padding: "3px 11px", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Decline</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </Card>
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 700 }}>Meetings Schedule</span>
              <span style={{ fontSize: 11, background: "#f3f4f6", padding: "3px 9px", borderRadius: 5, color: "#6b7280" }}>Today</span>
            </div>
            {meetings.map((m, i) => (
              <div key={i} style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: i < meetings.length - 1 ? "1px solid #f9fafb" : "none" }}>
                <div style={{ fontSize: 11, color: "#6b7280", whiteSpace: "nowrap", minWidth: 54 }}>{m.time}</div>
                <div style={{ width: 4, background: m.dot, borderRadius: 2, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{m.title}</div>
                  <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 1 }}>{m.cat}</div>
                </div>
              </div>
            ))}
          </Card>
        </div>
        <div style={{ textAlign: "center", fontSize: 11, color: "#9ca3af", paddingTop: 4 }}>
          2014 - 2026 © SmartHR &nbsp;·&nbsp; Designed &amp; Developed By <span style={{ color: ACCENT, fontWeight: 600 }}>Dreamo</span>
        </div>
      </div>
    );

    if (activePage === "tickets") return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          <StatCard icon={ICONS.tickets}      iconBg={ACCENT}  label="New Tickets"     value="120" badge="↑+19.01%" chartColor={ACCENT}  chartValues={sparkData.new}     />
          <StatCard icon={ICONS.ticketList}   iconBg="#a855f7" label="Open Tickets"    value="60"  badge="↑+19.01%" chartColor="#a855f7" chartValues={sparkData.open}    />
          <StatCard icon={ICONS.ticketDetail} iconBg="#22c55e" label="Solved Tickets"  value="50"  badge="↑+19.01%" chartColor="#22c55e" chartValues={sparkData.solved}  />
          <StatCard icon={ICONS.clock}        iconBg="#06b6d4" label="Pending Tickets" value="10"  badge="↑+19.01%" chartColor="#06b6d4" chartValues={sparkData.pending} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 260px", gap: 14, alignItems: "start" }}>
          <div>
            <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #f1f5f9", padding: "12px 16px", marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 14, fontWeight: 700 }}>Ticket List</span>
              <div style={{ display: "flex", gap: 8 }}>
                {["Priority ▾", "Select Status ▾", "Sort By : Last 7 Days ▾"].map((lbl, i) => (
                  <button key={i} style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 6, padding: "5px 11px", fontSize: 11.5, color: "#6b7280", cursor: "pointer", fontWeight: 500 }}>{lbl}</button>
                ))}
              </div>
            </div>
            {tickets.map((t, i) => <TicketRow key={i} {...t} />)}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #f1f5f9", padding: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Ticket Categories</div>
              {[{ name: "Internet Issue", count: 0 }, { name: "Computer", count: 1 }, { name: "Redistribute", count: 0 }, { name: "Payment", count: 2 }, { name: "Complaint", count: 1 }].map((c, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 0", borderBottom: i < 4 ? "1px solid #f9fafb" : "none" }}>
                  <span style={{ fontSize: 13, color: "#374151" }}>{c.name}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, width: 24, height: 24, borderRadius: "50%", background: c.count > 0 ? "#111827" : "#f3f4f6", color: c.count > 0 ? "#fff" : "#9ca3af", display: "flex", alignItems: "center", justifyContent: "center" }}>{c.count}</span>
                </div>
              ))}
            </div>
            <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #f1f5f9", padding: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Support Agents</div>
              {[{ name: "Edgar Hansel", count: 0, color: "#6366f1" }, { name: "Ann Lynch", count: 1, color: "#f59e0b" }, { name: "Juan Hermann", count: 0, color: "#22c55e" }, { name: "Jessie Otero", count: 2, color: "#ef4444" }].map((a, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: i < 3 ? "1px solid #f9fafb" : "none" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Avatar name={a.name} size={30} color={a.color} />
                    <span style={{ fontSize: 12.5, fontWeight: 500, color: "#374151" }}>{a.name}</span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, width: 24, height: 24, borderRadius: "50%", background: a.count > 0 ? "#111827" : "#f3f4f6", color: a.count > 0 ? "#fff" : "#9ca3af", display: "flex", alignItems: "center", justifyContent: "center" }}>{a.count}</span>
                </div>
              ))}
            </div>
            <button style={{ width: "100%", background: ACCENT, color: "#fff", border: "none", borderRadius: 10, padding: 12, fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
              <Icon d={ICONS.plus} stroke="#fff" size={15} /> Raise New Ticket
            </button>
          </div>
        </div>
      </div>
    );

    return <PlaceholderPage title={pageInfo.title} />;
  };

  return (
    <ThemeProvider>
      <ProtectedRoute requiredRole="employee">
        <ThemedDashboard
          activePage={activePage} navigate={navigate} fullName={fullName} designation={designation}
          isPunchedIn={isPunchedIn} pageInfo={pageInfo} renderContent={renderContent}
        />
        <SettingsPanel />
      </ProtectedRoute>
    </ThemeProvider>
  );
}

function ThemedDashboard({ activePage, navigate, fullName, designation, isPunchedIn, renderContent, pageInfo }) {
  const { theme } = useTheme();
  const ACCENT = theme.accent;
  return (
    <>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes syncPulse { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
      `}</style>
      <div style={{ display: "flex", height: "100vh", fontFamily: "'Inter',-apple-system,sans-serif", background: theme.pageBg, color: theme.text, overflow: "hidden" }}>
        <Sidebar activePage={activePage} onNavigate={navigate} fullName={fullName} designation={designation} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", height: "100vh" }}>
          <Topbar fullName={fullName} isPunchedIn={isPunchedIn} />
          <div style={{ background: theme.topbar, borderBottom: `1px solid ${theme.border}`, padding: "9px 20px", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <h1 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: theme.text }}>{pageInfo.title}</h1>
                <div style={{ fontSize: 11, color: theme.textSub, marginTop: 1, display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ cursor: "pointer", color: ACCENT }} onClick={() => navigate(null)}>🏠</span>
                  <span>›</span>
                  {(activePage === "project-detail") && (
                    <>
                      <span style={{ cursor: "pointer", color: ACCENT }} onClick={() => navigate("projects")}>Projects</span>
                      <span>›</span>
                    </>
                  )}
                  <span style={{ color: theme.text, fontWeight: 500 }}>{pageInfo.crumb}</span>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button style={{ display: "flex", alignItems: "center", gap: 5, background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 7, padding: "5px 10px", fontSize: 12, color: "#6b7280", fontWeight: 500, cursor: "pointer" }}>
                  <Icon d={ICONS.export} stroke="#6b7280" /> Export
                </button>
                <div style={{ display: "flex", alignItems: "center", gap: 5, background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 7, padding: "5px 10px", fontSize: 12, color: "#6b7280" }}>
                  <Icon d={ICONS.calendar} stroke="#6b7280" /> 15-04-2025
                </div>
                {activePage === "projects" && (
                  <button style={{ display: "flex", alignItems: "center", gap: 6, background: ACCENT, border: "none", borderRadius: 7, padding: "6px 14px", fontSize: 12.5, color: "#fff", fontWeight: 700, cursor: "pointer" }}>
                    <Icon d={ICONS.plus} stroke="#fff" size={13} /> Add Project
                  </button>
                )}
                {activePage === "Tasks" && (
                  <button style={{ display: "flex", alignItems: "center", gap: 6, background: ACCENT, border: "none", borderRadius: 7, padding: "6px 14px", fontSize: 12.5, color: "#fff", fontWeight: 700, cursor: "pointer" }}>
                    <Icon d={ICONS.plus} stroke="#fff" size={13} /> Add Task
                  </button>
                )}
                {activePage === "tickets" && (
                  <button style={{ display: "flex", alignItems: "center", gap: 6, background: ACCENT, border: "none", borderRadius: 7, padding: "6px 14px", fontSize: 12.5, color: "#fff", fontWeight: 700, cursor: "pointer" }}>
                    <Icon d={ICONS.plus} stroke="#fff" size={13} /> Add Ticket
                  </button>
                )}
              </div>
            </div>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
            {renderContent()}
          </div>
        </div>
      </div>
    </>
  );
}