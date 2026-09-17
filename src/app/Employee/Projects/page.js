"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS & HELPERS
// ─────────────────────────────────────────────────────────────────────────────
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
  "Authorization": `Bearer ${localStorage.getItem("employee_auth_token")}`,
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
  plus:        "M12 5v14M5 12h14",
  clock:       "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2",
  home:        "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",
  chevRight:   "M9 18l6-6-6-6",
  logIn:       "M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4 M10 17l5-5-5-5 M15 12H3",
  logOut:      "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9",
  projects:    "M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",
  folder:      "M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z",
  edit:        "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7 M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z",
  trash:       "M3 6h18 M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6 M10 11v6 M14 11v6 M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2",
  arrowLeft:   "M19 12H5 M12 5l-7 7 7 7",
  briefcase:   "M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2",
  dollar:      "M12 1v22 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
  users:       "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75 M9 7a4 4 0 1 0 0 8 4 4 0 0 0 0-8z",
  tag:         "M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z M7 7h.01",
  link:        "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71 M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71",
  building:    "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",
  checkCircle: "M22 11.08V12a10 10 0 1 1-5.93-9.14 M22 4L12 14.01l-3-3",
  attendance:  "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm.5-5H11v6l5.25 3.15.75-1.23-4.5-2.67V7z",
  performance: "M18 20V10M12 20V4M6 20v-6",
  training:    "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  probation:   "M9 11l3 3L22 4 M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11",
  notice:      "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  promotion:   "M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z",
  resignation: "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v1",
  termination: "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z",
  holidays:    "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z",
  eye:         "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
  chevDown:    "M6 9l6 6 6-6",
  filter:      "M22 3H2l8 9.46V19l4 2v-8.54L22 3z",
  x:           "M18 6L6 18M6 6l12 12",
};

const AVATAR_COLORS = ["#6366f1","#f59e0b","#22c55e","#ef4444","#8b5cf6","#06b6d4","#ec4899","#14b8a6","#f97316","#3b82f6"];
function avatarColor(name = "") {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffffffff;
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

const Avatar = ({ name = "?", size = 32, color = "#374151", img = null }) => {
  const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  if (img) {
    return (
      React.createElement("div", { style: { width: size, height: size, borderRadius: "50%", overflow: "hidden", flexShrink: 0, border: "2px solid #fff", boxShadow: "0 2px 6px rgba(15,23,42,0.08)" } },
        React.createElement("img", { src: img, alt: name, style: { width: "100%", height: "100%", objectFit: "cover" }, onError: e => { e.target.style.display = "none"; } })
      )
    );
  }
  return (
    React.createElement("div", { style: { width: size, height: size, borderRadius: "50%", background: `linear-gradient(135deg, ${color}, ${color}cc)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.32, fontWeight: 700, color: "#fff", flexShrink: 0, letterSpacing: "-0.5px", border: "2px solid #fff", boxShadow: "0 2px 6px rgba(15,23,42,0.08)" } },
      initials
    )
  );
};

function StackedAvatars({ members = [], max = 3, size = 26 }) {
  const shown = members.slice(0, max);
  const extra = members.length - max;
  return (
    React.createElement("div", { style: { display: "flex", alignItems: "center" } },
      shown.map((m, i) => {
        const name = `${m.firstname ?? ""} ${m.lastname ?? ""}`.trim();
        return React.createElement("div", { key: m.id ?? i, title: name, style: { marginLeft: i === 0 ? 0 : -10, zIndex: max - i, position: "relative" } },
          React.createElement(Avatar, { name: name, size: size, color: avatarColor(name), img: m.profile_image ? `${m.profile_image}` : null })
        );
      }),
      extra > 0 && React.createElement("div", { style: { marginLeft: -10, width: size, height: size, borderRadius: "50%", background: "linear-gradient(135deg,#e5e7eb,#d1d5db)", border: "2px solid #fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.28, fontWeight: 700, color: "#4b5563", boxShadow: "0 2px 6px rgba(15,23,42,0.08)" } },
        `+${extra}`
      )
    )
  );
}

const PRIORITY_CONFIG = {
  high:   { dot: "#ef4444", bg: "#fef2f2", text: "#dc2626", label: "High"   },
  medium: { dot: "#f59e0b", bg: "#fffbeb", text: "#d97706", label: "Medium" },
  low:    { dot: "#22c55e", bg: "#f0fdf4", text: "#16a34a", label: "Low"    },
};
const STATUS_CONFIG = {
  active:       { bg: "#dcfce7", text: "#166534", dot: "#22c55e", label: "Active"      },
  inactive:     { bg: "#fee2e2", text: "#991b1b", dot: "#ef4444", label: "Inactive"    },
  planning:     { bg: "#ede9fe", text: "#5b21b6", dot: "#8b5cf6", label: "Planning"    },
  "in-progress":{ bg: "#dbeafe", text: "#1e40af", dot: "#3b82f6", label: "In Progress" },
  completed:    { bg: "#dcfce7", text: "#166534", dot: "#22c55e", label: "Completed"   },
  on_hold:      { bg: "#f1f5f9", text: "#475569", dot: "#94a3b8", label: "On Hold"     },
};

function PriorityBadge({ priority }) {
  const cfg = PRIORITY_CONFIG[(priority ?? "").toLowerCase()] || PRIORITY_CONFIG.medium;
  return (
    React.createElement("div", { style: { display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 11px", borderRadius: 20, background: cfg.bg, border: `1px solid ${cfg.dot}22` } },
      React.createElement("div", { style: { width: 6, height: 6, borderRadius: "50%", background: cfg.dot, boxShadow: `0 0 6px ${cfg.dot}66` } }),
      React.createElement("span", { style: { fontSize: 11, fontWeight: 700, color: cfg.text, letterSpacing: "0.1px" } }, cfg.label)
    )
  );
}

function StatusBadge({ status }) {
  const key = (status ?? "").toLowerCase().replace(" ", "-");
  const cfg = STATUS_CONFIG[key] || STATUS_CONFIG.planning;
  return (
    React.createElement("div", { style: { display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 11px", borderRadius: 20, background: cfg.bg, border: `1px solid ${cfg.dot}22` } },
      React.createElement("div", { style: { width: 6, height: 6, borderRadius: "50%", background: cfg.dot, boxShadow: `0 0 6px ${cfg.dot}66` } }),
      React.createElement("span", { style: { fontSize: 11, fontWeight: 700, color: cfg.text, letterSpacing: "0.1px" } }, cfg.label)
    )
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TOPBAR
// ─────────────────────────────────────────────────────────────────────────────
function Topbar({ fullName }) {
  const { theme, setTheme } = useTheme();
  const ACCENT = theme.accent;
  const router = useRouter();
  const [showProfile, setShowProfile] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(3);
  const profileRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    try { await fetch(`${BASE}/api/auth/logout`, { method: "POST", headers: HEADERS() }); } catch (_) {}
    localStorage.removeItem("employee_auth_token");
    localStorage.removeItem("auth_user");
    router.replace("/auth/Employeelogin");
  };

  return (
    React.createElement("div", { style: { background: theme.topbar, borderBottom: `1px solid ${theme.border}`, padding: "10px 24px", display: "flex", alignItems: "center", gap: 8, flexShrink: 0, zIndex: 100, backdropFilter: "blur(12px)" } },
      React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, background: theme.pageBg, border: `1px solid ${theme.border}`, borderRadius: 10, padding: "7px 12px", flex: 1, maxWidth: 280, transition: "border-color 0.15s" }, onFocusCapture: e => e.currentTarget.style.borderColor = ACCENT, onBlurCapture: e => e.currentTarget.style.borderColor = theme.border },
        React.createElement(Icon, { d: ICONS.search, stroke: "#9ca3af", size: 13 }),
        React.createElement("input", { placeholder: "Search in HRMS…", style: { border: "none", background: "transparent", fontSize: 12.5, color: theme.textSub, outline: "none", width: "100%" } }),
        React.createElement("span", { style: { fontSize: 10, color: "#d1d5db", padding: "2px 6px", background: theme.topbar, borderRadius: 5, fontWeight: 600, border: `1px solid ${theme.border}` } }, "⌘/")
      ),
      React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, marginLeft: "auto" } },
        React.createElement("div", { onClick: () => { const next = !darkMode; setDarkMode(next); setTheme(next ? { sidebar:"#1e293b", topbar:"#1e293b", card:"#334155", pageBg:"#0f172a", text:"#f1f5f9", textSub:"#94a3b8", border:"#334155" } : { sidebar:"#ffffff", topbar:"#ffffff", card:"#ffffff", pageBg:"#f9fafb", text:"#111827", textSub:"#6b7280", border:"#f1f5f9" }); }, style: { width: 34, height: 34, borderRadius: 10, background: theme.pageBg, border: `1px solid ${theme.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.15s" }, onMouseEnter: e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(15,23,42,0.06)"; }, onMouseLeave: e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; } },
          React.createElement(Icon, { d: darkMode ? ICONS.sun : ICONS.monitor, stroke: theme.textSub, size: 14 })
        ),
        React.createElement("div", { style: { position: "relative", width: 34, height: 34, borderRadius: 10, background: theme.pageBg, border: `1px solid ${theme.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.15s" }, onClick: () => setNotifications(0), onMouseEnter: e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(15,23,42,0.06)"; }, onMouseLeave: e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; } },
          React.createElement(Icon, { d: ICONS.bell, stroke: theme.textSub, size: 14 }),
          notifications > 0 && React.createElement("div", { style: { position: "absolute", top: -3, right: -3, minWidth: 16, height: 16, padding: "0 4px", borderRadius: 8, background: "linear-gradient(135deg,#ef4444,#dc2626)", border: `2px solid ${theme.topbar}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 6px rgba(239,68,68,0.35)" } },
            React.createElement("span", { style: { fontSize: 8.5, color: "#fff", fontWeight: 800 } }, notifications)
          )
        ),
        React.createElement("div", { ref: profileRef, style: { position: "relative" } },
          React.createElement("div", { onClick: () => setShowProfile(s => !s), style: { cursor: "pointer", display: "flex", alignItems: "center", gap: 8, padding: 3, paddingRight: 10, borderRadius: 30, background: theme.pageBg, border: `1px solid ${theme.border}`, transition: "all 0.15s" }, onMouseEnter: e => { e.currentTarget.style.background = `${ACCENT}0d`; e.currentTarget.style.borderColor = `${ACCENT}33`; }, onMouseLeave: e => { e.currentTarget.style.background = theme.pageBg; e.currentTarget.style.borderColor = theme.border; } },
            React.createElement(Avatar, { name: fullName || "Employee", size: 28, color: ACCENT }),
            React.createElement("span", { style: { fontSize: 12, fontWeight: 600, color: theme.text, maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, (fullName || "Employee").split(" ")[0]),
            React.createElement(Icon, { d: ICONS.chevDown, size: 11, stroke: theme.textSub })
          ),
          showProfile && React.createElement("div", { style: { position: "absolute", top: 46, right: 0, width: 240, background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", boxShadow: "0 20px 50px rgba(15,23,42,0.15)", zIndex: 999, overflow: "hidden" } },
            React.createElement("div", { style: { background: `linear-gradient(135deg, #1e293b, ${ACCENT}dd)`, padding: "16px 18px", display: "flex", gap: 12, alignItems: "center" } },
              React.createElement(Avatar, { name: fullName || "E", size: 42, color: "#fff" }),
              React.createElement("div", null,
                React.createElement("div", { style: { fontSize: 13.5, fontWeight: 700, color: "#fff" } }, fullName || "Employee"),
                React.createElement("div", { style: { fontSize: 11, color: "rgba(255,255,255,0.7)", marginTop: 1 } }, "Employee")
              )
            ),
            React.createElement("div", { onClick: handleLogout, style: { display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#ef4444", transition: "background 0.15s" }, onMouseEnter: e => e.currentTarget.style.background = "#fef2f2", onMouseLeave: e => e.currentTarget.style.background = "#fff" },
              React.createElement("div", { style: { width: 30, height: 30, borderRadius: 9, background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center" } },
                React.createElement(Icon, { d: ICONS.logOut, stroke: "#ef4444", size: 14 })
              ),
              "Sign Out"
            )
          )
        )
      )
    )
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
  return (
    React.createElement(React.Fragment, null,
      React.createElement("button", { onClick: () => setOpen(o => !o), style: { position: "fixed", bottom: 24, right: 24, width: 48, height: 48, borderRadius: "50%", background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT}dd)`, border: "none", boxShadow: `0 8px 24px ${ACCENT}55`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 1000, transition: "transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)", transform: open ? "rotate(45deg) scale(0.95)" : "rotate(0deg) scale(1)" } },
        React.createElement(Icon, { d: ICONS.settings, stroke: "#fff", size: 20 })
      ),
      open && React.createElement("div", { style: { position: "fixed", bottom: 84, right: 24, width: 310, background: "#fff", borderRadius: 18, border: "1px solid #e5e7eb", boxShadow: "0 24px 60px rgba(15,23,42,0.18)", zIndex: 1000, overflow: "hidden" } },
        React.createElement("div", { style: { background: `linear-gradient(135deg, #1e293b, ${ACCENT}dd)`, padding: "16px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" } },
          React.createElement("div", null,
            React.createElement("div", { style: { fontSize: 14, fontWeight: 700, color: "#fff" } }, "Theme Settings"),
            React.createElement("div", { style: { fontSize: 10.5, color: "rgba(255,255,255,0.7)", marginTop: 2 } }, "Customise your workspace")
          ),
          React.createElement("button", { onClick: () => setTheme(DEFAULT_THEME), style: { fontSize: 10.5, padding: "4px 10px", background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 7, color: "#fff", cursor: "pointer", fontWeight: 600 } }, "Reset")
        ),
        React.createElement("div", { style: { padding: "16px 18px" } },
          React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: "#374151", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.8px" } }, "Accent Color"),
          React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 10 } },
            PRESET_THEMES.map((p, i) => React.createElement("div", { key: i, title: p.name, onClick: () => setTheme({ accent: p.accent, accentDark: p.accentDark }), style: { width: 32, height: 32, borderRadius: "50%", background: `linear-gradient(135deg, ${p.accent}, ${p.accentDark})`, cursor: "pointer", border: theme.accent === p.accent ? "3px solid #1e293b" : "3px solid transparent", transition: "all 0.15s", boxShadow: theme.accent === p.accent ? `0 0 0 3px ${p.accent}33` : "0 2px 6px rgba(0,0,0,0.08)" } }))
          )
        )
      )
    )
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PROJECT DETAIL SLIDE-IN PANEL
// ─────────────────────────────────────────────────────────────────────────────
function ProjectDetailPanel({ projectId, onClose }) {
  const { theme } = useTheme();
  const ACCENT = theme.accent;
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 10);
  }, []);

  useEffect(() => {
    if (!projectId) return;
    setLoading(true); setError(null);
    fetch(`${BASE}/api/employee/projects/${projectId}`, { headers: HEADERS() })
      .then(r => r.json())
      .then(json => { if (json.success) setProject(json.data); else setError("Project not found"); })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [projectId]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 280);
  };

  const startDate = project?.start_date ? new Date(project.start_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";
  const endDate   = project?.end_date   ? new Date(project.end_date).toLocaleDateString("en-GB",   { day: "2-digit", month: "short", year: "numeric" }) : "—";
  const daysLeft  = project?.end_date ? Math.max(0, Math.ceil((new Date(project.end_date) - new Date()) / 86400000)) : null;

  const TABS = ["overview", "team", "client"];

  return (
    React.createElement(React.Fragment, null,
      React.createElement("div", { onClick: handleClose, style: { position: "fixed", inset: 0, background: "rgba(15,23,42,0.4)", backdropFilter: "blur(4px)", zIndex: 400, opacity: visible ? 1 : 0, transition: "opacity 0.28s ease" } }),
      React.createElement("div", { style: { position: "fixed", top: 0, right: 0, bottom: 0, width: 640, background: "#fff", zIndex: 500, display: "flex", flexDirection: "column", boxShadow: "-24px 0 70px rgba(15,23,42,0.2)", transform: visible ? "translateX(0)" : "translateX(100%)", transition: "transform 0.32s cubic-bezier(0.32, 0.72, 0, 1)", overflow: "hidden" } },
        React.createElement("style", null, `
          @keyframes spin { from{transform:rotate(0)}to{transform:rotate(360deg)} }
          @keyframes fadeInUp { from{opacity:0; transform:translateY(8px)} to{opacity:1; transform:translateY(0)} }
          .tab-btn:hover { background: rgba(255,255,255,0.06) !important; }
          .detail-card { background: linear-gradient(180deg,#fafbfc,#f8fafc); border-radius: 14px; border: 1px solid #e8edf2; padding: 18px; transition: all 0.18s ease; }
          .detail-card:hover { border-color: #d8e1ea; box-shadow: 0 4px 16px rgba(15,23,42,0.04); }
          .info-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px dashed #eef2f6; }
          .info-row:last-child { border-bottom: none; padding-bottom: 0; }
          .info-row:first-child { padding-top: 0; }
          .team-card:hover { box-shadow: 0 8px 24px rgba(15,23,42,0.08) !important; transform: translateY(-2px); border-color: ${ACCENT}44 !important; }
          .team-card { transition: all 0.22s cubic-bezier(0.32, 0.72, 0, 1) !important; }
          .client-tile { transition: all 0.15s ease; }
          .client-tile:hover { border-color: ${ACCENT}44 !important; background: #fff !important; }
          .client-tile:hover { transform: translateY(-1px); }
        `),
        React.createElement("div", { style: { background: "linear-gradient(135deg, #0f172a 0%, #1e293b 55%, #1e3a5f 100%)", padding: "0 0 0 0", flexShrink: 0, position: "relative", overflow: "hidden" } },
          React.createElement("div", { style: { position: "absolute", top: -60, right: -60, width: 220, height: 220, borderRadius: "50%", background: `radial-gradient(circle, ${ACCENT}22, transparent 70%)`, pointerEvents: "none" } }),
          React.createElement("div", { style: { position: "absolute", bottom: -40, left: 40, width: 160, height: 160, borderRadius: "50%", background: `radial-gradient(circle, ${ACCENT}15, transparent 70%)`, pointerEvents: "none" } }),
          React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 22px 0" } },
            React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#64748b", fontWeight: 500 } },
              React.createElement("span", null, "Projects"),
              React.createElement(Icon, { d: "M9 18l6-6-6-6", size: 10, stroke: "#64748b" }),
              React.createElement("span", { style: { color: "#94a3b8" } }, "Project Detail")
            ),
            React.createElement("button", { onClick: handleClose, style: { width: 34, height: 34, borderRadius: 10, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#94a3b8", transition: "all 0.15s" }, onMouseEnter: e => { e.currentTarget.style.background = "rgba(255,255,255,0.15)"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.transform = "rotate(90deg)"; }, onMouseLeave: e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "#94a3b8"; e.currentTarget.style.transform = "rotate(0deg)"; } },
              React.createElement(Icon, { d: ICONS.x, size: 14, sw: 2.5 })
            )
          ),
          React.createElement("div", { style: { padding: "18px 22px 0" } },
            loading ? React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10, paddingBottom: 22 } },
              React.createElement("svg", { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: ACCENT, strokeWidth: 2.5, strokeLinecap: "round", style: { animation: "spin 0.8s linear infinite" } }, React.createElement("path", { d: "M21 12a9 9 0 1 1-6.219-8.56" })),
              React.createElement("span", { style: { fontSize: 13, color: "#64748b" } }, "Loading project…")
            ) : error ? React.createElement("div", { style: { color: "#fca5a5", fontSize: 13, paddingBottom: 22 } }, error) : project && React.createElement(React.Fragment, null,
              React.createElement("div", { style: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 14, marginBottom: 18 } },
                React.createElement("div", { style: { display: "flex", gap: 14, alignItems: "center", flex: 1, minWidth: 0 } },
                  React.createElement("div", { style: { width: 56, height: 56, borderRadius: 16, background: `linear-gradient(135deg, ${ACCENT}33, ${ACCENT}11)`, border: `1.5px solid ${ACCENT}55`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: `0 6px 20px ${ACCENT}22` } },
                    React.createElement(Icon, { d: ICONS.briefcase, stroke: ACCENT, size: 26 })
                  ),
                  React.createElement("div", { style: { minWidth: 0 } },
                    React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 7, marginBottom: 8, flexWrap: "wrap" } },
                      React.createElement("span", { style: { fontSize: 10.5, fontWeight: 800, color: ACCENT, background: `${ACCENT}22`, padding: "3px 9px", borderRadius: 8, letterSpacing: "0.6px", border: `1px solid ${ACCENT}33` } }, project.project_code),
                      React.createElement(StatusBadge, { status: project.status }),
                      React.createElement(PriorityBadge, { priority: project.priority })
                    ),
                    React.createElement("h2", { style: { margin: 0, fontSize: 20, fontWeight: 800, color: "#fff", letterSpacing: "-0.4px", lineHeight: 1.2 } }, project.project_name),
                    React.createElement("p", { style: { margin: "6px 0 0", fontSize: 12, color: "#94a3b8", maxWidth: 360, lineHeight: 1.55 } }, project.description || "No description provided.")
                  )
                ),
                daysLeft !== null && React.createElement("div", { style: { background: daysLeft <= 3 ? "linear-gradient(135deg,#ef4444,#dc2626)" : daysLeft <= 7 ? "linear-gradient(135deg,#f59e0b,#d97706)" : "rgba(255,255,255,0.06)", border: daysLeft <= 3 ? "none" : daysLeft <= 7 ? "none" : "1px solid rgba(255,255,255,0.12)", borderRadius: 14, padding: "12px 16px", textAlign: "center", flexShrink: 0, boxShadow: daysLeft <= 7 ? `0 6px 20px ${daysLeft <= 3 ? "#ef444455" : "#f59e0b55"}` : "none" } },
                  React.createElement("div", { style: { fontSize: 24, fontWeight: 800, color: "#fff", lineHeight: 1, letterSpacing: "-0.5px" } }, daysLeft),
                  React.createElement("div", { style: { fontSize: 9, color: daysLeft <= 7 ? "rgba(255,255,255,0.85)" : "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.7px", marginTop: 4 } }, "Days Left")
                )
              ),
              React.createElement("div", { style: { display: "flex", gap: 8, flexWrap: "wrap", paddingBottom: 16 } },
                [
                  { icon: ICONS.calendar, label: "Start", value: startDate },
                  { icon: ICONS.calendar, label: "End",   value: endDate   },
                  { icon: ICONS.dollar,   label: "Value", value: `₹${Number(project.value ?? 0).toLocaleString("en-IN")}` },
                  { icon: ICONS.users,    label: "Team",  value: `${(project.team_members ?? []).length} Members` },
                ].map(({ icon, label, value }, i) => React.createElement("div", { key: i, style: { display: "flex", alignItems: "center", gap: 7, padding: "7px 12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, transition: "all 0.15s" }, onMouseEnter: e => { e.currentTarget.style.background = "rgba(255,255,255,0.09)"; }, onMouseLeave: e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; } },
                  React.createElement(Icon, { d: icon, stroke: "#64748b", size: 12 }),
                  React.createElement("span", { style: { fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 600 } }, `${label}:`),
                  React.createElement("span", { style: { fontSize: 11.5, fontWeight: 700, color: "#e2e8f0" } }, value)
                ))
              )
            )
          ),
          project && React.createElement("div", { style: { borderTop: "1px solid rgba(255,255,255,0.07)", display: "flex", padding: "0 22px", background: "rgba(0,0,0,0.15)" } },
            TABS.map(tab => React.createElement("button", { key: tab, className: "tab-btn", onClick: () => setActiveTab(tab), style: { padding: "12px 16px", background: "transparent", border: "none", borderBottom: activeTab === tab ? `2.5px solid ${ACCENT}` : "2.5px solid transparent", color: activeTab === tab ? ACCENT : "#94a3b8", fontSize: 12.5, fontWeight: activeTab === tab ? 800 : 500, cursor: "pointer", textTransform: "capitalize", transition: "color 0.15s", letterSpacing: "0.3px" } }, tab))
          )
        ),
        React.createElement("div", { style: { flex: 1, overflowY: "auto", padding: "22px" } },
          !loading && !error && project && (activeTab === "overview" ?
            React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 16, animation: "fadeInUp 0.3s ease" } },
              React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 } },
                React.createElement("div", { className: "detail-card" },
                  React.createElement("div", { style: { fontSize: 11, fontWeight: 800, color: "#374151", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 14, display: "flex", alignItems: "center", gap: 7 } },
                    React.createElement("div", { style: { width: 18, height: 18, borderRadius: 6, background: `${ACCENT}15`, display: "flex", alignItems: "center", justifyContent: "center" } },
                      React.createElement(Icon, { d: ICONS.folder, stroke: ACCENT, size: 10, sw: 2.2 })
                    ),
                    "Project Info"
                  ),
                  [
                    { label: "Code",    value: project.project_code },
                    { label: "Type",    value: (project.type ?? "—").replace("_"," ").replace(/\b\w/g, c => c.toUpperCase()) },
                    { label: "Start",   value: startDate },
                    { label: "End",     value: endDate   },
                    { label: "Value",   value: `₹${Number(project.value ?? 0).toLocaleString("en-IN")}` },
                  ].map(({ label, value }, i) => React.createElement("div", { className: "info-row", key: i },
                    React.createElement("span", { style: { fontSize: 12, color: "#9ca3af", fontWeight: 500 } }, label),
                    React.createElement("span", { style: { fontSize: 12.5, fontWeight: 700, color: "#374151" } }, value)
                  ))
                ),
                React.createElement("div", { className: "detail-card" },
                  React.createElement("div", { style: { fontSize: 11, fontWeight: 800, color: "#374151", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 14, display: "flex", alignItems: "center", gap: 7 } },
                    React.createElement("div", { style: { width: 18, height: 18, borderRadius: 6, background: `${ACCENT}15`, display: "flex", alignItems: "center", justifyContent: "center" } },
                      React.createElement(Icon, { d: ICONS.checkCircle, stroke: ACCENT, size: 10, sw: 2.2 })
                    ),
                    "Status"
                  ),
                  React.createElement("div", { style: { marginBottom: 12 } }, React.createElement(StatusBadge, { status: project.status })),
                  React.createElement("div", { style: { marginBottom: 14 } }, React.createElement(PriorityBadge, { priority: project.priority })),
                  React.createElement("div", { style: { marginTop: 8 } },
                    React.createElement("div", { style: { display: "flex", justifyContent: "space-between", marginBottom: 8 } },
                      React.createElement("span", { style: { fontSize: 11.5, color: "#9ca3af", fontWeight: 500 } }, "Completion"),
                      React.createElement("span", { style: { fontSize: 12, fontWeight: 800, color: "#374151" } }, `${project.progress ?? 0}%`)
                    ),
                    React.createElement("div", { style: { height: 8, background: "#eef2f6", borderRadius: 4, overflow: "hidden" } },
                      React.createElement("div", { style: { width: `${project.progress ?? 0}%`, height: "100%", background: `linear-gradient(90deg, ${ACCENT}, ${ACCENT}cc)`, borderRadius: 4, transition: "width 0.8s cubic-bezier(0.32, 0.72, 0, 1)", boxShadow: `0 0 12px ${ACCENT}55` } })
                    )
                  )
                )
              ),
              React.createElement("div", { className: "detail-card" },
                React.createElement("div", { style: { fontSize: 11, fontWeight: 800, color: "#374151", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 12, display: "flex", alignItems: "center", gap: 7 } },
                  React.createElement("div", { style: { width: 18, height: 18, borderRadius: 6, background: `${ACCENT}15`, display: "flex", alignItems: "center", justifyContent: "center" } },
                    React.createElement(Icon, { d: ICONS.folder, stroke: ACCENT, size: 10, sw: 2.2 })
                  ),
                  "About Project"
                ),
                React.createElement("p", { style: { margin: 0, fontSize: 13, color: "#6b7280", lineHeight: 1.75 } }, project.description || "No description provided for this project.")
              ),
              (project.team_members ?? []).length > 0 && React.createElement("div", { className: "detail-card" },
                React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 } },
                  React.createElement("div", { style: { fontSize: 11, fontWeight: 800, color: "#374151", textTransform: "uppercase", letterSpacing: "0.8px", display: "flex", alignItems: "center", gap: 7 } },
                    React.createElement("div", { style: { width: 18, height: 18, borderRadius: 6, background: `${ACCENT}15`, display: "flex", alignItems: "center", justifyContent: "center" } },
                      React.createElement(Icon, { d: ICONS.users, stroke: ACCENT, size: 10, sw: 2.2 })
                    ),
                    "Team Members"
                  ),
                  React.createElement("span", { style: { fontSize: 11, color: ACCENT, fontWeight: 700, background: `${ACCENT}12`, padding: "3px 10px", borderRadius: 8 } }, `${(project.team_members ?? []).length} Total`)
                ),
                React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 10 } },
                  (project.team_members ?? []).slice(0, 8).map(m => {
                    const name = `${m.firstname} ${m.lastname}`.trim();
                    return React.createElement("div", { key: m.id, title: name, style: { display: "flex", flexDirection: "column", alignItems: "center", gap: 5, transition: "transform 0.15s", cursor: "pointer" }, onMouseEnter: e => e.currentTarget.style.transform = "translateY(-2px)", onMouseLeave: e => e.currentTarget.style.transform = "translateY(0)" },
                      React.createElement(Avatar, { name: name, size: 42, color: avatarColor(name), img: m.profile_image ? `${m.profile_image}` : null }),
                      React.createElement("span", { style: { fontSize: 9.5, color: "#9ca3af", maxWidth: 48, textAlign: "center", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 500 } }, m.firstname)
                    );
                  }),
                  (project.team_members ?? []).length > 8 && React.createElement("div", { style: { width: 42, height: 42, borderRadius: "50%", background: "linear-gradient(135deg,#f3f4f6,#e5e7eb)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#6b7280", border: "2px solid #fff", boxShadow: "0 2px 6px rgba(15,23,42,0.08)" } }, `+${project.team_members.length - 8}`)
                )
              )
            ) : activeTab === "team" ?
            React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 12, animation: "fadeInUp 0.3s ease" } },
              React.createElement("div", { style: { fontSize: 11, fontWeight: 800, color: "#374151", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 4 } }, `All Team Members (${[
                project.project_manager && { ...project.project_manager, _role: "Project Manager" },
                project.team_leader     && { ...project.team_leader,     _role: "Team Leader"     },
                ...(project.team_members ?? []).map(m => ({ ...m, _role: "Team Member" })),
              ].filter(Boolean).length})`),
              [
                project.project_manager && { ...project.project_manager, _role: "Project Manager" },
                project.team_leader     && { ...project.team_leader,     _role: "Team Leader"     },
                ...(project.team_members ?? []).map(m => ({ ...m, _role: "Team Member" })),
              ].filter(Boolean).map((m, i) => {
                const name = `${m.firstname} ${m.lastname}`.trim();
                const roleColor = m._role === "Project Manager" ? "#6366f1" : m._role === "Team Leader" ? "#22c55e" : "#9ca3af";
                return React.createElement("div", { key: `${m.id}-${i}`, className: "team-card", style: { display: "flex", gap: 14, padding: "14px 18px", background: "#fff", borderRadius: 14, border: "1px solid #e8edf2", alignItems: "center" } },
                  React.createElement("div", { style: { position: "relative" } },
                    React.createElement(Avatar, { name: name, size: 48, color: avatarColor(name), img: m.profile_image ? `${m.profile_image}` : null }),
                    React.createElement("div", { style: { position: "absolute", bottom: -1, right: -1, width: 15, height: 15, borderRadius: "50%", background: "#22c55e", border: "2.5px solid #fff", boxShadow: "0 0 0 2px #22c55e33" } })
                  ),
                  React.createElement("div", { style: { flex: 1, minWidth: 0 } },
                    React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 4 } },
                      React.createElement("span", { style: { fontSize: 13.5, fontWeight: 700, color: "#111827" } }, name),
                      React.createElement("span", { style: { fontSize: 9.5, fontWeight: 800, color: roleColor, background: `${roleColor}15`, padding: "2px 8px", borderRadius: 8, letterSpacing: "0.3px" } }, m._role)
                    ),
                    React.createElement("div", { style: { fontSize: 11.5, color: "#6b7280", display: "flex", alignItems: "center", gap: 5 } },
                      React.createElement(Icon, { d: ICONS.mail, stroke: "#9ca3af", size: 10 }),
                      m.email
                    ),
                    m.phone_number && React.createElement("div", { style: { fontSize: 11, color: "#9ca3af", marginTop: 2, display: "flex", alignItems: "center", gap: 5 } },
                      React.createElement(Icon, { d: ICONS.phone, stroke: "#9ca3af", size: 10 }),
                      m.phone_number
                    )
                  ),
                  React.createElement("div", { style: { display: "flex", gap: 6 } },
                    React.createElement("div", { style: { width: 32, height: 32, borderRadius: 9, background: `${ACCENT}12`, border: `1px solid ${ACCENT}22`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.15s" }, onMouseEnter: e => { e.currentTarget.style.background = `${ACCENT}22`; e.currentTarget.style.transform = "scale(1.08)"; }, onMouseLeave: e => { e.currentTarget.style.background = `${ACCENT}12`; e.currentTarget.style.transform = "scale(1)"; } },
                      React.createElement(Icon, { d: ICONS.mail, stroke: ACCENT, size: 13 })
                    )
                  )
                );
              })
            ) : activeTab === "client" && (project.client ?
            React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 14, animation: "fadeInUp 0.3s ease" } },
              React.createElement("div", { style: { background: `linear-gradient(135deg, #1e293b, #334155, ${ACCENT}dd)`, borderRadius: 16, padding: "20px 22px", display: "flex", alignItems: "center", gap: 16, position: "relative", overflow: "hidden" } },
                React.createElement("div", { style: { position: "absolute", top: -40, right: -40, width: 140, height: 140, borderRadius: "50%", background: `${ACCENT}33`, filter: "blur(40px)", pointerEvents: "none" } }),
                React.createElement("div", { style: { width: 56, height: 56, borderRadius: 14, background: `linear-gradient(135deg, ${ACCENT}33, ${ACCENT}11)`, border: `1.5px solid ${ACCENT}55`, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" } },
                  React.createElement(Icon, { d: ICONS.building, stroke: ACCENT, size: 26 })
                ),
                React.createElement("div", { style: { position: "relative" } },
                  React.createElement("div", { style: { fontSize: 17, fontWeight: 800, color: "#fff", letterSpacing: "-0.3px" } }, project.client.company_name),
                  React.createElement("div", { style: { fontSize: 11.5, color: "#94a3b8", marginTop: 3, fontWeight: 500 } }, project.client.client_code),
                  React.createElement("div", { style: { marginTop: 8 } },
                    React.createElement("span", { style: { fontSize: 10.5, fontWeight: 700, padding: "3px 10px", borderRadius: 8, background: "#dcfce7", color: "#166534", letterSpacing: "0.3px" } }, project.client.status)
                  )
                )
              ),
              React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11 } },
                [
                  { label: "Contact Person",  value: project.client.contact_person },
                  { label: "Email",           value: project.client.email          },
                  { label: "Phone",           value: project.client.phone          },
                  { label: "City",            value: project.client.city           },
                  { label: "State",           value: project.client.state          },
                  { label: "Country",         value: project.client.country        },
                  { label: "Payment Terms",   value: (project.client.payment_terms ?? "").replace("_"," ").toUpperCase() },
                  { label: "Credit Limit",    value: `₹${Number(project.client.credit_limit ?? 0).toLocaleString("en-IN")}` },
                ].map(({ label, value }, i) => React.createElement("div", { key: i, className: "client-tile", style: { padding: "12px 15px", background: "#fafbfc", borderRadius: 12, border: "1px solid #e8edf2" } },
                  React.createElement("div", { style: { fontSize: 9.5, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 5, fontWeight: 700 } }, label),
                  React.createElement("div", { style: { fontSize: 12.5, fontWeight: 600, color: "#374151" } }, value || "—")
                ))
              ),
              React.createElement("div", { style: { padding: "15px 17px", background: "#fafbfc", borderRadius: 14, border: "1px solid #e8edf2" } },
                React.createElement("div", { style: { fontSize: 10.5, fontWeight: 800, color: "#374151", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 10, display: "flex", alignItems: "center", gap: 7 } },
                  React.createElement("div", { style: { width: 16, height: 16, borderRadius: 5, background: `${ACCENT}15`, display: "flex", alignItems: "center", justifyContent: "center" } },
                    React.createElement(Icon, { d: ICONS.mapPin, stroke: ACCENT, size: 9, sw: 2.2 })
                  ),
                  "Address"
                ),
                React.createElement("div", { style: { fontSize: 12.5, color: "#6b7280", lineHeight: 1.8 } },
                  project.client.address, React.createElement("br", null),
                  `${project.client.city}, ${project.client.state} - ${project.client.zip_code}`, React.createElement("br", null),
                  project.client.country
                )
              ),
              project.client.notes && React.createElement("div", { style: { background: "linear-gradient(135deg,#fffbeb,#fef3c7)", borderRadius: 14, padding: "14px 16px", border: "1px solid #fde68a" } },
                React.createElement("div", { style: { fontSize: 10.5, fontWeight: 800, color: "#92400e", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 7 } }, "Notes"),
                React.createElement("div", { style: { fontSize: 12.5, color: "#78350f", lineHeight: 1.7 } }, project.client.notes)
              )
            ) : React.createElement("div", { style: { textAlign: "center", padding: "50px 20px", color: "#9ca3af", fontSize: 13, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 } },
              React.createElement("div", { style: { width: 60, height: 60, borderRadius: 18, background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #e2e8f0" } },
                React.createElement(Icon, { d: ICONS.building, stroke: "#cbd5e1", size: 26 })
              ),
              "No client linked to this project."
            ))
          )
        )
      )
    )
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PROJECTS LIST PAGE
// ─────────────────────────────────────────────────────────────────────────────
function ProjectsListContent({ onSelectProject }) {
  const { theme } = useTheme();
  const ACCENT = theme.accent;
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState("list");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [statusFilter, setStatusFilter] = useState("");
  const [allChecked, setAllChecked] = useState(false);

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
    React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "center", padding: 100, gap: 12 } },
      React.createElement("div", { style: { width: 32, height: 32, borderRadius: 10, background: `${ACCENT}12`, display: "flex", alignItems: "center", justifyContent: "center" } },
        React.createElement("svg", { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: ACCENT, strokeWidth: 2.5, strokeLinecap: "round", strokeLinejoin: "round", style: { animation: "spin 0.8s linear infinite" } },
          React.createElement("path", { d: "M21 12a9 9 0 1 1-6.219-8.56" })
        )
      ),
      React.createElement("span", { style: { fontSize: 13.5, color: "#9ca3af", fontWeight: 500 } }, "Loading projects…")
    )
  );

  if (error) return (
    React.createElement("div", { style: { background: "linear-gradient(135deg,#fef2f2,#fee2e2)", borderRadius: 14, padding: 24, color: "#991b1b", fontSize: 13, border: "1px solid #fecaca", fontWeight: 500 } }, `⚠️ Error: ${error}`)
  );

  return (
    React.createElement("div", null,
      React.createElement("style", null, `
        @keyframes spin { from{transform:rotate(0deg)}to{transform:rotate(360deg)} }
        .proj-row:hover { background: #fafbfc !important; }
        .proj-row:hover .proj-actions { opacity: 1 !important; transform: translateX(0) !important; }
        .proj-actions { opacity: 0; transition: all 0.18s ease; transform: translateX(4px); }
        .chk { accent-color: ${ACCENT}; cursor: pointer; }
        .proj-card:hover { box-shadow: 0 12px 32px rgba(15,23,42,0.1) !important; transform: translateY(-3px); }
        .proj-card { transition: all 0.22s cubic-bezier(0.32, 0.72, 0, 1); }
        .pag-btn:hover:not(:disabled) { background: ${ACCENT}12 !important; border-color: ${ACCENT}44 !important; }
        .view-btn:hover { background: rgba(0,0,0,0.03) !important; }
        @keyframes fadeIn { from{opacity:0; transform:translateY(6px)} to{opacity:1; transform:translateY(0)} }
        .proj-row { animation: fadeIn 0.25s ease; }
      `),
      React.createElement("div", { style: { background: theme.card, borderRadius: 16, border: `1px solid ${theme.border}`, overflow: "hidden", boxShadow: "0 4px 24px rgba(15,23,42,0.04)" } },
        // Header
        React.createElement("div", { style: { padding: "18px 24px", borderBottom: `1px solid ${theme.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, background: `linear-gradient(180deg, ${theme.card}, ${theme.pageBg}22)` } },
          React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 12 } },
            React.createElement("div", { style: { width: 36, height: 36, borderRadius: 11, background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT}dd)`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 6px 18px ${ACCENT}44` } },
              React.createElement(Icon, { d: ICONS.folder, stroke: "#fff", size: 17, sw: 2 })
            ),
            React.createElement("div", null,
              React.createElement("span", { style: { fontSize: 15, fontWeight: 800, color: theme.text, letterSpacing: "-0.2px", display: "block" } }, "Project List"),
              React.createElement("span", { style: { fontSize: 11.5, color: theme.textSub, fontWeight: 500 } }, `${filtered.length} project${filtered.length !== 1 ? "s" : ""} found`)
            )
          ),
          React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8 } },
            React.createElement("div", { style: { position: "relative" } },
              React.createElement("select", { value: statusFilter, onChange: e => { setStatusFilter(e.target.value); setPage(1); }, style: { background: theme.pageBg, border: `1px solid ${theme.border}`, borderRadius: 9, padding: "8px 34px 8px 12px", fontSize: 12.5, color: theme.text, cursor: "pointer", outline: "none", appearance: "none", fontWeight: 500, transition: "all 0.15s" }, onFocus: e => { e.currentTarget.style.borderColor = ACCENT; e.currentTarget.style.boxShadow = `0 0 0 3px ${ACCENT}15`; }, onBlur: e => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.boxShadow = "none"; } },
                React.createElement("option", { value: "" }, "All Status"),
                React.createElement("option", { value: "active" }, "Active"),
                React.createElement("option", { value: "planning" }, "Planning"),
                React.createElement("option", { value: "in-progress" }, "In Progress"),
                React.createElement("option", { value: "completed" }, "Completed"),
                React.createElement("option", { value: "inactive" }, "Inactive")
              ),
              React.createElement("div", { style: { position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" } },
                React.createElement(Icon, { d: ICONS.chevDown, stroke: theme.textSub, size: 12, sw: 2.2 })
              )
            ),
            React.createElement("button", { style: { background: theme.pageBg, border: `1px solid ${theme.border}`, borderRadius: 9, padding: "8px 14px", fontSize: 12.5, color: theme.textSub, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontWeight: 500, transition: "all 0.15s" }, onMouseEnter: e => { e.currentTarget.style.background = `${ACCENT}0d`; e.currentTarget.style.borderColor = `${ACCENT}33`; e.currentTarget.style.color = ACCENT; }, onMouseLeave: e => { e.currentTarget.style.background = theme.pageBg; e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.color = theme.textSub; } },
              React.createElement(Icon, { d: ICONS.filter, size: 12 }), "Sort By"
            )
          )
        ),
        // Toolbar
        React.createElement("div", { style: { padding: "12px 24px", borderBottom: `1px solid ${theme.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, background: theme.pageBg } },
          React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 12 } },
            React.createElement("span", { style: { fontSize: 12.5, color: theme.textSub, fontWeight: 500 } }, "Rows"),
            React.createElement("select", { value: rowsPerPage, onChange: e => { setRowsPerPage(Number(e.target.value)); setPage(1); }, style: { background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 8, padding: "5px 10px", fontSize: 12.5, color: theme.text, cursor: "pointer", fontWeight: 600, outline: "none" } },
              [5, 10, 20, 50].map(n => React.createElement("option", { key: n, value: n }, n))
            ),
            React.createElement("span", { style: { fontSize: 12.5, color: theme.textSub, fontWeight: 500 } }, "per page")
          ),
          React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10 } },
            React.createElement("div", { style: { display: "flex", gap: 3, background: theme.pageBg, borderRadius: 9, padding: 3, border: `1px solid ${theme.border}` } },
              [
                { mode: "list", d: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" },
                { mode: "grid", d: "M3 3h8v8H3zM13 3h8v8h-8zM3 13h8v8H3zM13 13h8v8h-8z" },
              ].map(({ mode, d }) => React.createElement("button", { key: mode, className: "view-btn", onClick: () => setViewMode(mode), style: { width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", background: viewMode === mode ? theme.card : "transparent", borderRadius: 6, border: "none", cursor: "pointer", boxShadow: viewMode === mode ? "0 2px 6px rgba(15,23,42,0.08)" : "none", transition: "all 0.15s" } },
                React.createElement(Icon, { d: d, size: 14, stroke: viewMode === mode ? ACCENT : theme.textSub, sw: viewMode === mode ? 2.2 : 1.8 })
              ))
            ),
            React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 7, background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 9, padding: "7px 12px", transition: "all 0.15s" }, onFocusCapture: e => { e.currentTarget.style.borderColor = ACCENT; e.currentTarget.style.boxShadow = `0 0 0 3px ${ACCENT}15`; }, onBlurCapture: e => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.boxShadow = "none"; } },
              React.createElement(Icon, { d: ICONS.search, stroke: theme.textSub, size: 13, sw: 2 }),
              React.createElement("input", { value: search, onChange: e => { setSearch(e.target.value); setPage(1); }, placeholder: "Search projects…", style: { border: "none", background: "transparent", fontSize: 12.5, color: theme.text, outline: "none", width: 150, fontWeight: 500 } })
            )
          )
        ),
        // Content
        viewMode === "list" ? React.createElement("div", { style: { overflowX: "auto" } },
          React.createElement("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: 13 } },
            React.createElement("thead", null,
              React.createElement("tr", { style: { background: theme.pageBg } },
                React.createElement("th", { style: { width: 44, padding: "12px 20px", textAlign: "center" } },
                  React.createElement("input", { type: "checkbox", checked: allChecked, onChange: toggleAll, className: "chk", style: { width: 15, height: 15 } })
                ),
                [
                  { label: "Code", w: 110 }, { label: "Project Name", w: 240 },
                  { label: "Leader", w: 180 }, { label: "Team", w: 140 },
                  { label: "Deadline", w: 120 }, { label: "Priority", w: 120 },
                  { label: "Status", w: 130 }, { label: "", w: 90 },
                ].map(({ label, w }, i) => React.createElement("th", { key: i, style: { padding: "12px 16px 12px 0", textAlign: "left", fontSize: 10.5, fontWeight: 800, color: theme.textSub, textTransform: "uppercase", letterSpacing: "0.8px", whiteSpace: "nowrap", width: w } }, label))
              )
            ),
            React.createElement("tbody", null,
              paginated.length === 0 ? React.createElement("tr", null, React.createElement("td", { colSpan: 8, style: { padding: "60px 0", textAlign: "center", color: theme.textSub, fontSize: 13, fontWeight: 500 } },
                React.createElement("div", { style: { display: "flex", flexDirection: "column", alignItems: "center", gap: 12 } },
                  React.createElement("div", { style: { width: 60, height: 60, borderRadius: 20, background: theme.pageBg, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${theme.border}` } },
                    React.createElement(Icon, { d: ICONS.folder, stroke: theme.textSub, size: 26 })
                  ),
                  "No projects found"
                )
              )) : paginated.map(p => {
                const leaderName = p.team_leader ? `${p.team_leader.firstname} ${p.team_leader.lastname}`.trim() : "—";
                const isChecked = selectedIds.has(p.id);
                return React.createElement("tr", { key: p.id, className: "proj-row", style: { borderTop: `1px solid ${theme.border}`, background: isChecked ? `${ACCENT}06` : theme.card, transition: "background 0.12s", cursor: "default" } },
                  React.createElement("td", { style: { padding: "14px 20px", textAlign: "center" } },
                    React.createElement("input", { type: "checkbox", checked: isChecked, onChange: () => toggleRow(p.id), className: "chk", style: { width: 15, height: 15 } })
                  ),
                  React.createElement("td", { style: { padding: "14px 16px 14px 0" } },
                    React.createElement("span", { style: { fontSize: 11.5, fontWeight: 800, color: theme.textSub, letterSpacing: "0.4px", padding: "4px 10px", background: theme.pageBg, borderRadius: 7, border: `1px solid ${theme.border}` } }, p.project_code)
                  ),
                  React.createElement("td", { style: { padding: "14px 16px 14px 0" } },
                    React.createElement("button", { onClick: () => onSelectProject(p.id), style: { background: "none", border: "none", padding: 0, cursor: "pointer", fontSize: 13.5, fontWeight: 700, color: theme.text, textAlign: "left", transition: "color 0.15s" }, onMouseEnter: e => e.currentTarget.style.color = ACCENT, onMouseLeave: e => e.currentTarget.style.color = theme.text }, p.project_name)
                  ),
                  React.createElement("td", { style: { padding: "14px 16px 14px 0" } },
                    React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 9 } },
                      React.createElement(Avatar, { name: leaderName, size: 30, color: avatarColor(leaderName), img: p.team_leader?.profile_image ? `${p.team_leader.profile_image}` : null }),
                      React.createElement("span", { style: { fontSize: 12.5, color: theme.text, fontWeight: 600 } }, leaderName)
                    )
                  ),
                  React.createElement("td", { style: { padding: "14px 16px 14px 0" } },
                    React.createElement(StackedAvatars, { members: p.team_members ?? [], max: 3, size: 28 })
                  ),
                  React.createElement("td", { style: { padding: "14px 16px 14px 0" } },
                    React.createElement("span", { style: { fontSize: 12.5, color: theme.textSub, fontWeight: 600 } }, p.end_date ? new Date(p.end_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—")
                  ),
                  React.createElement("td", { style: { padding: "14px 16px 14px 0" } }, React.createElement(PriorityBadge, { priority: p.priority })),
                  React.createElement("td", { style: { padding: "14px 16px 14px 0" } }, React.createElement(StatusBadge, { status: p.status })),
                  React.createElement("td", { style: { padding: "14px 16px 14px 0" } },
                    React.createElement("div", { className: "proj-actions", style: { display: "flex", gap: 6 } },
                      React.createElement("button", { onClick: () => onSelectProject(p.id), title: "View", style: { width: 32, height: 32, background: `${ACCENT}10`, border: `1px solid ${ACCENT}22`, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.15s" }, onMouseEnter: e => { e.currentTarget.style.background = `${ACCENT}22`; e.currentTarget.style.transform = "scale(1.05)"; }, onMouseLeave: e => { e.currentTarget.style.background = `${ACCENT}10`; e.currentTarget.style.transform = "scale(1)"; } },
                        React.createElement(Icon, { d: ICONS.eye, size: 13, stroke: ACCENT, sw: 2.2 })
                      )
                    )
                  )
                );
              })
            )
          )
        ) : React.createElement("div", { style: { padding: 22, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 18 } },
          paginated.length === 0 ? React.createElement("div", { style: { gridColumn: "1/-1", textAlign: "center", color: theme.textSub, fontSize: 13, padding: 60, fontWeight: 500 } }, "No projects found") : paginated.map(p => {
            const leaderName = p.team_leader ? `${p.team_leader.firstname} ${p.team_leader.lastname}`.trim() : "—";
            return React.createElement("div", { key: p.id, className: "proj-card", style: { background: theme.card, borderRadius: 16, border: `1px solid ${theme.border}`, overflow: "hidden", cursor: "pointer", boxShadow: "0 2px 12px rgba(15,23,42,0.04)" }, onClick: () => onSelectProject(p.id) },
              React.createElement("div", { style: { padding: "16px 18px", borderBottom: `1px solid ${theme.border}`, display: "flex", justifyContent: "space-between", alignItems: "flex-start", background: `linear-gradient(135deg, ${theme.card}, ${theme.pageBg}44)` } },
                React.createElement("div", { style: { minWidth: 0, flex: 1 } },
                  React.createElement("div", { style: { fontSize: 10.5, fontWeight: 800, color: ACCENT, marginBottom: 4, letterSpacing: "0.5px", background: `${ACCENT}12`, padding: "3px 8px", borderRadius: 6, display: "inline-block" } }, p.project_code),
                  React.createElement("div", { style: { fontSize: 14, fontWeight: 800, color: theme.text, marginTop: 6, letterSpacing: "-0.2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, p.project_name)
                ),
                React.createElement(PriorityBadge, { priority: p.priority })
              ),
              React.createElement("div", { style: { padding: "14px 18px", display: "flex", flexDirection: "column", gap: 12 } },
                React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between" } },
                  React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 9 } },
                    React.createElement(Avatar, { name: leaderName, size: 30, color: avatarColor(leaderName) }),
                    React.createElement("div", { style: { minWidth: 0 } },
                      React.createElement("div", { style: { fontSize: 10, color: theme.textSub, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.4px" } }, "Leader"),
                      React.createElement("div", { style: { fontSize: 12.5, fontWeight: 700, color: theme.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 120 } }, leaderName)
                    )
                  ),
                  React.createElement(StackedAvatars, { members: p.team_members ?? [], max: 3, size: 26 })
                ),
                React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between" } },
                  React.createElement("div", { style: { fontSize: 11.5, color: theme.textSub, display: "flex", alignItems: "center", gap: 5, fontWeight: 500 } },
                    React.createElement(Icon, { d: ICONS.calendar, stroke: theme.textSub, size: 11 }),
                    p.end_date ? new Date(p.end_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"
                  ),
                  React.createElement(StatusBadge, { status: p.status })
                )
              )
            );
          })
        ),
        // Pagination
        React.createElement("div", { style: { padding: "14px 24px", borderTop: `1px solid ${theme.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", background: theme.pageBg } },
          React.createElement("span", { style: { fontSize: 12.5, color: theme.textSub, fontWeight: 500 } }, `Showing ${Math.min((page - 1) * rowsPerPage + 1, filtered.length)}–${Math.min(page * rowsPerPage, filtered.length)} of ${filtered.length}`),
          React.createElement("div", { style: { display: "flex", gap: 5 } },
            React.createElement("button", { className: "pag-btn", onClick: () => setPage(p => Math.max(1, p - 1)), disabled: page === 1, style: { width: 32, height: 32, background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", cursor: page === 1 ? "not-allowed" : "pointer", opacity: page === 1 ? 0.4 : 1, transition: "all 0.15s" } },
              React.createElement(Icon, { d: "M15 18l-6-6 6-6", size: 14, stroke: theme.textSub, sw: 2.2 })
            ),
            Array.from({ length: totalPages }, (_, i) => i + 1).slice(Math.max(0, page - 3), page + 2).map(n => React.createElement("button", { key: n, onClick: () => setPage(n), style: { width: 32, height: 32, background: n === page ? `linear-gradient(135deg, ${ACCENT}, ${ACCENT}dd)` : theme.card, border: `1px solid ${n === page ? ACCENT : theme.border}`, borderRadius: 8, fontSize: 12.5, fontWeight: n === page ? 800 : 600, color: n === page ? "#fff" : theme.textSub, cursor: "pointer", boxShadow: n === page ? `0 4px 12px ${ACCENT}44` : "none", transition: "all 0.15s" } }, n)),
            React.createElement("button", { className: "pag-btn", onClick: () => setPage(p => Math.min(totalPages, p + 1)), disabled: page === totalPages, style: { width: 32, height: 32, background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", cursor: page === totalPages ? "not-allowed" : "pointer", opacity: page === totalPages ? 0.4 : 1, transition: "all 0.15s" } },
              React.createElement(Icon, { d: "M9 18l6-6-6-6", size: 14, stroke: theme.textSub, sw: 2.2 })
            )
          )
        )
      )
    )
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
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────────────────────
export default function ProjectsPage() {
  const router = useRouter();
  const { theme } = useTheme ? useTheme() : { theme: DEFAULT_THEME };
  const [activePage, setActivePage] = useState("projects");
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetch(`${BASE}/api/employee/profile`, { headers: HEADERS() })
      .then(r => r.json()).then(json => { if (json.success) setProfile(json.data); })
      .catch(console.error);
  }, []);

  const emp         = profile?.employee;
  const fullName    = emp ? `${emp.firstname} ${emp.lastname}` : "Employee";
  const designation = profile?.designation?.name ?? "Employee";

  const handleNavigate = (page) => {
    if (page === "dashboard") { router.push("/Employee/Dashboard"); return; }
    setActivePage(page);
    if (typeof window !== "undefined") {
      if (page) localStorage.setItem("emp_active_page", page);
    }
  };

  return (
    React.createElement(ThemeProvider, null,
      React.createElement(ProtectedRoute, { requiredRole: "employee" },
        React.createElement("div", { style: { display: "flex", height: "100vh", fontFamily: "'Inter',-apple-system,sans-serif", background: theme.pageBg, color: theme.text, overflow: "hidden" } },
          React.createElement("div", { style: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", height: "100vh" } },
            React.createElement(Topbar, { fullName: fullName }),
            React.createElement("div", { style: { background: theme.topbar, borderBottom: `1px solid ${theme.border}`, padding: "14px 24px", flexShrink: 0 } },
              React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between" } },
                React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 12 } },
                  React.createElement("div", { style: { width: 40, height: 40, borderRadius: 12, background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}dd)`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 6px 18px ${theme.accent}44` } },
                    React.createElement(Icon, { d: ICONS.projects, stroke: "#fff", size: 18, sw: 2 })
                  ),
                  React.createElement("div", null,
                    React.createElement("h1", { style: { margin: 0, fontSize: 18, fontWeight: 800, color: theme.text, letterSpacing: "-0.3px" } }, "Projects"),
                    React.createElement("div", { style: { fontSize: 11.5, color: theme.textSub, marginTop: 2, display: "flex", alignItems: "center", gap: 6, fontWeight: 500 } },
                      React.createElement("span", { style: { cursor: "pointer", color: theme.accent, display: "flex", alignItems: "center" }, onClick: () => handleNavigate("dashboard"), title: "Home" },
                        React.createElement(Icon, { d: ICONS.home, size: 11, stroke: theme.accent, sw: 2.2 })
                      ),
                      React.createElement(Icon, { d: ICONS.chevRight, size: 10, stroke: theme.textSub }),
                      React.createElement("span", { style: { color: theme.text, fontWeight: 600 } }, "Projects")
                    )
                  )
                ),
                React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8 } },
                  React.createElement("button", { style: { display: "flex", alignItems: "center", gap: 6, background: theme.pageBg, border: `1px solid ${theme.border}`, borderRadius: 9, padding: "7px 12px", fontSize: 12.5, color: theme.textSub, fontWeight: 600, cursor: "pointer", transition: "all 0.15s" }, onMouseEnter: e => { e.currentTarget.style.background = `${theme.accent}0d`; e.currentTarget.style.borderColor = `${theme.accent}33`; e.currentTarget.style.color = theme.accent; }, onMouseLeave: e => { e.currentTarget.style.background = theme.pageBg; e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.color = theme.textSub; } },
                    React.createElement(Icon, { d: ICONS.export, stroke: "currentColor", size: 12, sw: 2.2 }), "Export"
                  ),
                  React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6, background: theme.pageBg, border: `1px solid ${theme.border}`, borderRadius: 9, padding: "7px 12px", fontSize: 12.5, color: theme.textSub, fontWeight: 600 } },
                    React.createElement(Icon, { d: ICONS.calendar, stroke: theme.textSub, size: 12, sw: 2.2 }),
                    "15-04-2025"
                  )
                )
              )
            ),
            React.createElement("div", { style: { flex: 1, overflowY: "auto", padding: "20px 24px" } },
              React.createElement(ProjectsListContent, { onSelectProject: (id) => setSelectedProjectId(id) })
            )
          )
        ),
        React.createElement(SettingsPanel, null),
        selectedProjectId && React.createElement(ProjectDetailPanel, { projectId: selectedProjectId, onClose: () => setSelectedProjectId(null) })
      )
    )
  );
}