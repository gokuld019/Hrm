"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS & HELPERS (same as dashboard)
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

const Icon = ({ d, size = 14, stroke = "currentColor", fill = "none", sw = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
    strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
    style={{ display: "block", flexShrink: 0 }}>
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

const ICONS = {
  home:        "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",
  folder:      "M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z",
  tickets:     "M2 3h20v14H2z M8 21h8M12 17v4",
  attendance:  "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm.5 5H11v6l5.25 3.15.75-1.23-4.5-2.67V7z",
  performance: "M18 20V10M12 20V4M6 20v-6",
  training:    "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  probation:   "M9 11l3 3L22 4 M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11",
  notice:      "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  promotion:   "M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z",
  resignation: "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v1",
  termination: "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z",
  holidays:    "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z",
  search:      "M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z",
  settings:    "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z",
  bell:        "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0",
  mail:        "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6",
  grid:        "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z",
  sun:         "M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12 M12 16A4 4 0 1 0 12 8a4 4 0 0 0 0 8z",
  monitor:     "M2 3h20v14H2z M8 21h8M12 17v4",
  logOut:      "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9",
  clock:       "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2",
  calendar:    "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z",
  chevRight:   "M9 18l6-6-6-6",
  chevDown:    "M6 9l6 6 6-6",
  plus:        "M12 5v14M5 12h14",
  more:        "M12 5h.01M12 12h.01M12 19h.01",
  moreH:       "M5 12h.01M12 12h.01M19 12h.01",
  star:        "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  tag:         "M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z M7 7h.01",
  check:       "M20 6L9 17l-5-5",
  grip:        "M9 3h.01M15 3h.01M9 9h.01M15 9h.01M9 15h.01M15 15h.01M9 21h.01M15 21h.01",
  export:      "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M17 8l-5-5-5 5 M12 3v12",
  users:       "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75 M9 7a4 4 0 1 0 0 8 4 4 0 0 0 0-8z",
  ticketList:  "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 0 2-2h2a2 2 0 0 0 2 2m-6 9l2 2 4-4",
  refresh:     "M23 4v6h-6 M1 20v-6h6 M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15",
};

const AVATAR_COLORS = ["#6366f1","#f59e0b","#22c55e","#ef4444","#8b5cf6","#06b6d4","#ec4899","#14b8a6","#f97316","#3b82f6"];
function avatarColor(name = "") {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffffffff;
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

// Project icon colors
const PROJECT_COLORS = ["#6366f1","#f97316","#06b6d4","#22c55e","#ec4899","#8b5cf6","#f59e0b","#ef4444"];
function projectColor(id) {
  return PROJECT_COLORS[(id ?? 0) % PROJECT_COLORS.length];
}

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

// ─────────────────────────────────────────────────────────────────────────────
// STATUS CONFIG
// ─────────────────────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  pending:     { bg: "#fef9c3", text: "#854d0e",  dot: "#f59e0b", label: "Pending"     },
  in_progress: { bg: "#dbeafe", text: "#1e40af",  dot: "#3b82f6", label: "Inprogress"  },
  completed:   { bg: "#dcfce7", text: "#166534",  dot: "#22c55e", label: "Completed"   },
  on_hold:     { bg: "#fce7f3", text: "#be185d",  dot: "#ec4899", label: "Onhold"      },
  cancelled:   { bg: "#f3f4f6", text: "#6b7280",  dot: "#9ca3af", label: "Cancelled"   },
};

const PRIORITY_CONFIG = {
  high:   { color: "#f59e0b", bg: "#fffbeb", text: "#d97706" },
  medium: { color: "#3b82f6", bg: "#dbeafe", text: "#1d4ed8" },
  low:    { color: "#22c55e", bg: "#dcfce7", text: "#16a34a" },
};

const TAG_COLORS = [
  { bg: "#dbeafe", text: "#1d4ed8" },
  { bg: "#fce7f3", text: "#be185d" },
  { bg: "#dcfce7", text: "#15803d" },
  { bg: "#ede9fe", text: "#6d28d9" },
  { bg: "#fef3c7", text: "#92400e" },
  { bg: "#fee2e2", text: "#b91c1c" },
];
function tagColor(str = "") {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) & 0xffffffff;
  return TAG_COLORS[Math.abs(h) % TAG_COLORS.length];
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
  const isActive = activePage === pageKey || (pageKey === "projects" && (activePage === "project-detail" || activePage === "tasks"));
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
        <SideNavItem label="Dashboard"             iconKey="home"        pageKey={null}        activePage={activePage} onNavigate={onNavigate} />
        <SideNavItem label="Projects"              iconKey="folder"      pageKey="projects"    activePage={activePage} onNavigate={onNavigate} />
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
            { label: "Performance Indicator", iconKey: "reports",     pageKey: "performance-indicator" },
            { label: "Performance Review",    iconKey: "ticketDetail",pageKey: "performance-review"    },
            { label: "Performance Appraisal", iconKey: "ticketDetail",pageKey: "performance-appraisal" },
            { label: "Goal List",             iconKey: "ticketList",  pageKey: "performance-goal-list" },
            { label: "Goal Type",             iconKey: "automation",  pageKey: "performance-goal-type" },
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
function Topbar({ fullName }) {
  const { theme, setTheme } = useTheme();
  const ACCENT = theme.accent;
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(3);

  const handleLogout = async () => {
    try { await fetch(`${BASE}/api/auth/logout`, { method: "POST", headers: HEADERS() }); } catch (_) {}
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    router.replace("/auth/Employeelogin");
  };

  const IconBtn = ({ d, active, onClick, badge, title }) => (
    <div title={title} onClick={onClick} style={{ width: 32, height: 32, borderRadius: 8, background: active ? `${ACCENT}18` : "#f9fafb", border: `1px solid ${active ? ACCENT + "55" : "#e5e7eb"}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative", transition: "all 0.15s", flexShrink: 0 }}>
      <Icon d={d} stroke={active ? ACCENT : "#6b7280"} size={14} />
      {badge > 0 && (
        <div style={{ position: "absolute", top: -3, right: -3, width: 14, height: 14, borderRadius: "50%", background: "#ef4444", border: "2px solid #fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 7, color: "#fff", fontWeight: 800 }}>{badge}</span>
        </div>
      )}
    </div>
  );

  return (
    <div style={{ background: theme.topbar, borderBottom: `1px solid ${theme.border}`, padding: "10px 20px", display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 7, padding: "5px 10px", flex: 1, maxWidth: 240 }}>
        <Icon d={ICONS.search} stroke="#9ca3af" />
        <input placeholder="Search in HRMS…" style={{ border: "none", background: "transparent", fontSize: 12, color: "#6b7280", outline: "none", width: "100%" }} />
        <span style={{ fontSize: 10, color: "#d1d5db" }}>⌘/</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: "auto" }}>
        <IconBtn title="App Grid"          d={ICONS.grid}    onClick={() => {}} />
        <IconBtn title={darkMode ? "Light" : "Dark"} d={darkMode ? ICONS.sun : ICONS.monitor} active={darkMode}
          onClick={() => { const n = !darkMode; setDarkMode(n); setTheme(n ? { sidebar:"#1e293b",topbar:"#1e293b",card:"#334155",pageBg:"#0f172a",text:"#f1f5f9",textSub:"#94a3b8",border:"#334155" } : { sidebar:"#ffffff",topbar:"#ffffff",card:"#ffffff",pageBg:"#f9fafb",text:"#111827",textSub:"#6b7280",border:"#f1f5f9" }); }} />
        <IconBtn title="Messages"          d={ICONS.mail}    onClick={() => {}} />
        <IconBtn title="Notifications"     d={ICONS.bell}    badge={notifications} onClick={() => setNotifications(0)} />
        <Avatar name={fullName || "E"} size={32} color={ACCENT} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STATUS DROPDOWN
// ─────────────────────────────────────────────────────────────────────────────
function StatusDropdown({ taskId, currentStatus, onStatusChange }) {
  const { theme } = useTheme();
  const ACCENT = theme.accent;
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = async (status) => {
    setOpen(false);
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/api/employee/tasks/${taskId}/status`, {
        method: "PUT",
        headers: HEADERS(),
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (json.success) onStatusChange(taskId, json.data.status);
    } catch (err) { console.error("Status update failed:", err); }
    finally { setLoading(false); }
  };

  const cfg = STATUS_CONFIG[currentStatus] || STATUS_CONFIG.pending;

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(o => !o)}
        disabled={loading}
        style={{ display: "flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 12, background: cfg.bg, border: "none", cursor: loading ? "wait" : "pointer", fontSize: 11.5, fontWeight: 600, color: cfg.text, transition: "all 0.15s" }}>
        {loading ? (
          <svg width={8} height={8} viewBox="0 0 24 24" fill="none" stroke={cfg.text} strokeWidth={2.5} style={{ animation: "spin 0.8s linear infinite" }}>
            <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" />
          </svg>
        ) : (
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.dot }} />
        )}
        • {cfg.label}
      </button>
      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 4px)", right: 0, background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb", boxShadow: "0 8px 24px rgba(0,0,0,0.1)", zIndex: 999, minWidth: 150, overflow: "hidden" }}>
          {Object.entries(STATUS_CONFIG).map(([key, sc]) => (
            <div key={key} onClick={() => handleSelect(key)}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", cursor: "pointer", fontSize: 12.5, color: "#374151", background: currentStatus === key ? "#f9fafb" : "#fff", fontWeight: currentStatus === key ? 600 : 400 }}
              onMouseEnter={e => e.currentTarget.style.background = "#f9fafb"}
              onMouseLeave={e => e.currentTarget.style.background = currentStatus === key ? "#f9fafb" : "#fff"}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: sc.dot }} />
              {sc.label}
              {currentStatus === key && <Icon d={ICONS.check} size={12} stroke={ACCENT} style={{ marginLeft: "auto" }} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TASK ROW COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
function TaskRow({ task, isCompleted, onStatusChange, onToggleComplete }) {
  const { theme } = useTheme();
  const ACCENT = theme.accent;
  const [starred, setStarred] = useState(false);

  const priorityCfg = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
  const statusCfg   = STATUS_CONFIG[task.status]     || STATUS_CONFIG.pending;

  const dueDate = task.due_date
    ? new Date(task.due_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    : null;

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== "completed";

  // Derive tags from task data (use visibility or project type as tags, fallback to defaults)
  const tags = task.tags?.length ? task.tags : [task.visibility === "public" ? (task.project?.type || "General") : "Private"].filter(Boolean);

  return (
    <div className="task-row" style={{ display: "flex", alignItems: "center", padding: "13px 16px", borderBottom: "1px solid #f3f4f6", background: "#fff", transition: "background 0.12s", position: "relative" }}>
      {/* Drag handle */}
      <div style={{ color: "#d1d5db", marginRight: 10, cursor: "grab", flexShrink: 0 }}>
        <Icon d={ICONS.grip} size={14} stroke="#d1d5db" sw={2} />
      </div>

      {/* Checkbox */}
      <div
        onClick={() => onToggleComplete(task.id)}
        style={{ width: 18, height: 18, borderRadius: 5, border: `2px solid ${isCompleted ? ACCENT : "#d1d5db"}`, background: isCompleted ? ACCENT : "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", marginRight: 12, flexShrink: 0, transition: "all 0.15s" }}>
        {isCompleted && <Icon d={ICONS.check} size={10} stroke="#fff" sw={3} />}
      </div>

      {/* Star */}
      <div
        onClick={() => setStarred(s => !s)}
        style={{ marginRight: 10, cursor: "pointer", flexShrink: 0 }}>
        <Icon d={ICONS.star} size={14} stroke={starred ? "#f59e0b" : "#d1d5db"} fill={starred ? "#f59e0b" : "none"} sw={1.8} />
      </div>

      {/* Title */}
      <div style={{ flex: 1, minWidth: 0, marginRight: 16 }}>
        <span style={{
          fontSize: 13.5, fontWeight: 500, color: isCompleted ? "#9ca3af" : "#1f2937",
          textDecoration: isCompleted ? "line-through" : "none",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "block"
        }}>
          {task.title}
        </span>
      </div>

      {/* Due date */}
      {dueDate && (
        <div style={{ display: "flex", alignItems: "center", gap: 5, marginRight: 16, flexShrink: 0 }}>
          <Icon d={ICONS.calendar} size={12} stroke={isOverdue ? "#ef4444" : "#9ca3af"} />
          <span style={{ fontSize: 11.5, color: isOverdue ? "#ef4444" : "#9ca3af", fontWeight: isOverdue ? 600 : 400 }}>
            {dueDate}
          </span>
        </div>
      )}

      {/* Tags */}
      <div style={{ display: "flex", gap: 5, marginRight: 14, flexShrink: 0 }}>
        {tags.slice(0, 2).map((tag, i) => {
          const tc = tagColor(tag);
          return (
            <span key={i} style={{ fontSize: 10.5, padding: "2px 8px", borderRadius: 10, background: tc.bg, color: tc.text, fontWeight: 600, whiteSpace: "nowrap" }}>
              {typeof tag === "string" ? tag.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()) : tag}
            </span>
          );
        })}
      </div>

      {/* Status badge with dropdown */}
      <div style={{ marginRight: 14, flexShrink: 0 }}>
        <StatusDropdown taskId={task.id} currentStatus={task.status} onStatusChange={onStatusChange} />
      </div>

      {/* Assignee avatars */}
      <div style={{ display: "flex", marginRight: 10, flexShrink: 0 }}>
        {(task.assignees?.length ? task.assignees : [task.creator].filter(Boolean)).slice(0, 3).map((a, i) => {
          const name = a?.name || a?.firstname ? `${a.firstname ?? ""} ${a.lastname ?? ""}`.trim() : "?";
          return (
            <div key={i} style={{ marginLeft: i === 0 ? 0 : -6 }}>
              <Avatar name={name} size={24} color={avatarColor(name)} img={a?.profile_image ? `${BASE}${a.profile_image}` : null} />
            </div>
          );
        })}
        {(!task.assignees?.length && !task.creator) && (
          <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#f3f4f6", border: "2px solid #fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon d={ICONS.users} size={11} stroke="#9ca3af" />
          </div>
        )}
      </div>

      {/* More */}
      <button style={{ width: 24, height: 24, background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, borderRadius: 4 }}
        onMouseEnter={e => e.currentTarget.style.background = "#f3f4f6"}
        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
        <Icon d={ICONS.moreH} size={14} stroke="#9ca3af" sw={2.5} />
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PROJECT PANEL (left card)
// ─────────────────────────────────────────────────────────────────────────────
function ProjectCard({ project, isSelected, onClick }) {
  const { theme } = useTheme();
  const ACCENT = theme.accent;
  const color = projectColor(project.id);

  const tasks = project._tasks || [];
  const completedCount = tasks.filter(t => t.status === "completed").length;
  const totalCount = tasks.length;
  const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const progressColor = pct >= 80 ? "#22c55e" : pct >= 50 ? "#3b82f6" : "#f97316";

  return (
    <div
      onClick={onClick}
      className="project-card"
      style={{
        background: isSelected ? "#fff" : "#fff",
        borderRadius: 12,
        border: isSelected ? `2px solid ${ACCENT}` : "1px solid #f1f5f9",
        padding: "16px 18px",
        cursor: "pointer",
        transition: "all 0.15s",
        boxShadow: isSelected ? `0 4px 20px ${ACCENT}22` : "none",
        marginBottom: 12,
      }}>
      {/* Project icon + name */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}18`, border: `2px solid ${color}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <svg width={18} height={18} viewBox="0 0 40 40" style={{ display: "block" }}>
            <circle cx="20" cy="20" r="20" fill={color} opacity={0.15} />
            <text x="50%" y="54%" dominantBaseline="middle" textAnchor="middle" fontSize="16" fontWeight="700" fill={color}>
              {(project.project_name || project.name || "P")[0].toUpperCase()}
            </text>
          </svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {project.project_name || project.name || "Untitled Project"}
          </div>
          <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>
            {totalCount} tasks • {completedCount} Completed
          </div>
        </div>
      </div>

      {/* Meta */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 10, color: "#9ca3af", marginBottom: 2 }}>Deadline</div>
          <div style={{ fontSize: 11.5, fontWeight: 600, color: "#374151" }}>
            {project.end_date ? new Date(project.end_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—"}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 10, color: "#9ca3af", marginBottom: 2 }}>Value</div>
          <div style={{ fontSize: 11.5, fontWeight: 600, color: "#374151" }}>
            ${project.value ? Number(project.value).toLocaleString() : "549987"}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 10, color: "#9ca3af", marginBottom: 2 }}>Project Lead</div>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <Avatar name={project.team_leader ? `${project.team_leader.firstname ?? ""} ${project.team_leader.lastname ?? ""}`.trim() : "?"} size={18} color={avatarColor(project.team_leader?.firstname || "L")} img={project.team_leader?.profile_image ? `${BASE}${project.team_leader.profile_image}` : null} />
            <span style={{ fontSize: 11, fontWeight: 600, color: "#374151" }}>{project.team_leader?.firstname || "Lead"}</span>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <Icon d={ICONS.clock} size={11} stroke="#f97316" />
          <span style={{ fontSize: 11, color: "#6b7280" }}>Total {project.total_hours ?? 565} Hrs</span>
        </div>
        <span style={{ fontSize: 11, fontWeight: 700, color: progressColor }}>{pct}% Completed</span>
      </div>
      <div style={{ height: 5, background: "#e5e7eb", borderRadius: 3, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: progressColor, borderRadius: 3, transition: "width 0.6s ease" }} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TASKS PAGE
// ─────────────────────────────────────────────────────────────────────────────
function TasksPage() {
  const { theme } = useTheme();
  const ACCENT = theme.accent;

  const [allTasks, setAllTasks]           = useState([]);
  const [projects, setProjects]           = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);
  const [completedIds, setCompletedIds]   = useState(new Set());
  const [priorityFilter, setPriorityFilter] = useState(null); // null | "high" | "medium" | "low"
  const [showLoadMore, setShowLoadMore]   = useState(false);
  const [visibleCount, setVisibleCount]   = useState(10);

  // Fetch all tasks
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch(`${BASE}/api/employee/tasks/`, { headers: HEADERS() });
      const json = await res.json();
      let tasks = [];
      if (json.success && Array.isArray(json.data))       tasks = json.data;
      else if (Array.isArray(json.data?.tasks))            tasks = json.data.tasks;
      else if (Array.isArray(json))                        tasks = json;
      else if (Array.isArray(json.tasks))                  tasks = json.tasks;
      setAllTasks(tasks);

      // Build project list from tasks
      const projectMap = new Map();
      tasks.forEach(t => {
        if (t.project) {
          const p = t.project;
          if (!projectMap.has(p.id)) {
            projectMap.set(p.id, { ...p, _tasks: [] });
          }
          projectMap.get(p.id)._tasks.push(t);
        }
      });
      const projectList = [...projectMap.values()];
      setProjects(projectList);
      if (projectList.length > 0 && !selectedProject) {
        setSelectedProject(projectList[0].id);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  // Mark complete locally
  const handleToggleComplete = (taskId) => {
    setCompletedIds(prev => {
      const next = new Set(prev);
      if (next.has(taskId)) next.delete(taskId);
      else next.add(taskId);
      return next;
    });
  };

  // Status update from API
  const handleStatusChange = (taskId, newStatus) => {
    setAllTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    // Also update in projects
    setProjects(prev => prev.map(p => ({
      ...p,
      _tasks: (p._tasks || []).map(t => t.id === taskId ? { ...t, status: newStatus } : t)
    })));
    // Auto-mark completed
    if (newStatus === "completed") {
      setCompletedIds(prev => new Set([...prev, taskId]));
    } else {
      setCompletedIds(prev => { const next = new Set(prev); next.delete(taskId); return next; });
    }
  };

  const currentProject = projects.find(p => p.id === selectedProject);
  const projectTasks   = currentProject?._tasks ?? [];

  const filteredTasks = projectTasks.filter(t => {
    if (!priorityFilter) return true;
    return t.priority === priorityFilter;
  });

  const completedTasks = filteredTasks.filter(t => completedIds.has(t.id) || t.status === "completed");
  const pendingTasks   = filteredTasks.filter(t => !completedIds.has(t.id) && t.status !== "completed");

  const totalDone  = completedTasks.length;
  const totalAll   = filteredTasks.length;
  const projectPct = totalAll > 0 ? Math.round((totalDone / totalAll) * 100) : 0;

  const visiblePending = pendingTasks.slice(0, visibleCount);
  const hasMore        = pendingTasks.length > visibleCount;

  return (
    <div style={{ display: "flex", gap: 0, height: "100%", overflow: "hidden" }}>
      <style>{`
        @keyframes spin { from{transform:rotate(0deg);}to{transform:rotate(360deg);} }
        .task-row:hover { background: #fafafa !important; }
        .project-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08) !important; }
      `}</style>

      {/* LEFT: Project list */}
      <div style={{ width: 300, flexShrink: 0, overflowY: "auto", paddingRight: 14, paddingBottom: 20 }}>
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 50, gap: 8 }}>
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 0.8s linear infinite" }}>
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            <span style={{ fontSize: 12, color: "#9ca3af" }}>Loading…</span>
          </div>
        ) : error ? (
          <div style={{ background: "#fef2f2", borderRadius: 10, padding: 16, color: "#991b1b", fontSize: 12 }}>
            Error: {error}
            <button onClick={fetchTasks} style={{ display: "block", marginTop: 8, fontSize: 11, color: ACCENT, background: "none", border: "none", cursor: "pointer" }}>Retry</button>
          </div>
        ) : projects.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40, color: "#9ca3af", fontSize: 12 }}>No projects found</div>
        ) : (
          projects.map(p => (
            <ProjectCard
              key={p.id}
              project={p}
              isSelected={selectedProject === p.id}
              onClick={() => { setSelectedProject(p.id); setVisibleCount(10); setPriorityFilter(null); }}
            />
          ))
        )}
      </div>

      {/* RIGHT: Task list */}
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 20 }}>
        {!currentProject && !loading ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 300, color: "#9ca3af" }}>
            <Icon d={ICONS.folder} size={48} stroke="#e5e7eb" />
            <p style={{ marginTop: 12, fontSize: 14 }}>Select a project to view tasks</p>
          </div>
        ) : (
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #f1f5f9", overflow: "hidden" }}>
            {/* Top filter bar */}
            <div style={{ padding: "14px 18px", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              {/* Priority filter tabs */}
              <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#111827", marginRight: 16 }}>Priority</span>
                {[
                  { key: null,     label: "All"    },
                  { key: "high",   label: "High"   },
                  { key: "medium", label: "Medium" },
                  { key: "low",    label: "Low"    },
                ].map(({ key, label }) => (
                  <button key={String(key)} onClick={() => setPriorityFilter(key)}
                    style={{ padding: "5px 14px", border: "none", background: "transparent", fontSize: 13, fontWeight: priorityFilter === key ? 600 : 400, color: priorityFilter === key ? ACCENT : "#6b7280", cursor: "pointer", borderBottom: priorityFilter === key ? `2px solid ${ACCENT}` : "2px solid transparent", transition: "all 0.15s" }}>
                    {label}
                  </button>
                ))}
              </div>
              {/* Right filters */}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button style={{ display: "flex", alignItems: "center", gap: 5, background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 7, padding: "5px 10px", fontSize: 12, color: "#6b7280", cursor: "pointer" }}>
                  <Icon d={ICONS.calendar} stroke="#9ca3af" size={12} />
                  Due Date
                </button>
                <button style={{ display: "flex", alignItems: "center", gap: 5, background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 7, padding: "5px 10px", fontSize: 12, color: "#6b7280", cursor: "pointer" }}>
                  <Icon d={ICONS.tag} stroke="#9ca3af" size={12} />
                  All Tags ▾
                </button>
                <button style={{ display: "flex", alignItems: "center", gap: 5, background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 7, padding: "5px 10px", fontSize: 12, color: "#6b7280", cursor: "pointer" }}>
                  Sort By : Created Date ▾
                </button>
              </div>
            </div>

            {/* Project Summary header */}
            {currentProject && (
              <div style={{ padding: "16px 18px", borderBottom: "1px solid #f3f4f6", background: "#fafafa" }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#111827", marginBottom: 2 }}>
                  {currentProject.project_name || currentProject.name}
                </div>
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

            {/* Mark all as completed */}
            <div style={{ padding: "10px 18px", borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={() => {
                  const ids = new Set([...completedIds, ...pendingTasks.map(t => t.id)]);
                  setCompletedIds(ids);
                }}
                style={{ display: "flex", alignItems: "center", gap: 5, background: "transparent", border: "none", fontSize: 12.5, color: "#6b7280", cursor: "pointer", padding: "4px 8px", borderRadius: 6 }}
                onMouseEnter={e => e.currentTarget.style.background = "#f9fafb"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <Icon d={ICONS.check} size={13} stroke="#9ca3af" />
                Mark All as Completed ▾
              </button>
            </div>

            {/* Task rows */}
            {loading ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 50, gap: 8 }}>
                <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 0.8s linear infinite" }}>
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                <span style={{ fontSize: 13, color: "#9ca3af" }}>Loading tasks…</span>
              </div>
            ) : filteredTasks.length === 0 ? (
              <div style={{ textAlign: "center", padding: 40, color: "#9ca3af", fontSize: 13 }}>
                No tasks found{priorityFilter ? ` with ${priorityFilter} priority` : ""}
              </div>
            ) : (
              <>
                {/* Pending tasks */}
                {visiblePending.map(task => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    isCompleted={completedIds.has(task.id)}
                    onStatusChange={handleStatusChange}
                    onToggleComplete={handleToggleComplete}
                  />
                ))}

                {/* Load more */}
                {hasMore && (
                  <div style={{ padding: "16px 18px", borderBottom: "1px solid #f3f4f6", textAlign: "center" }}>
                    <button
                      onClick={() => setVisibleCount(c => c + 10)}
                      style={{ display: "inline-flex", alignItems: "center", gap: 7, background: ACCENT, color: "#fff", border: "none", borderRadius: 8, padding: "9px 24px", fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "opacity 0.15s" }}
                      onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
                      onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
                      <Icon d={ICONS.refresh} size={13} stroke="#fff" />
                      Load More
                    </button>
                  </div>
                )}

                {/* Completed tasks — collapsed section */}
                {completedTasks.length > 0 && (
                  <div>
                    <div style={{ padding: "10px 18px", background: "#f9fafb", borderTop: "1px solid #f3f4f6", display: "flex", alignItems: "center", gap: 8 }}>
                      <Icon d={ICONS.check} size={13} stroke="#22c55e" sw={2.5} />
                      <span style={{ fontSize: 12.5, fontWeight: 600, color: "#374151" }}>Completed ({completedTasks.length})</span>
                    </div>
                    {completedTasks.map(task => (
                      <TaskRow
                        key={task.id}
                        task={task}
                        isCompleted={true}
                        onStatusChange={handleStatusChange}
                        onToggleComplete={handleToggleComplete}
                      />
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
    <>
      <button onClick={() => setOpen(o => !o)} style={{ position: "fixed", bottom: 24, right: 24, width: 46, height: 46, borderRadius: "50%", background: ACCENT, border: "none", boxShadow: `0 4px 20px ${ACCENT}66`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 1000, transform: open ? "rotate(45deg)" : "rotate(0deg)", transition: "transform 0.3s" }}>
        <Icon d={ICONS.settings} stroke="#fff" size={20} />
      </button>
      {open && (
        <div style={{ position: "fixed", bottom: 80, right: 24, width: 280, background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", boxShadow: "0 20px 60px rgba(0,0,0,0.15)", zIndex: 1000, overflow: "hidden" }}>
          <div style={{ background: "linear-gradient(135deg,#1e293b,#334155)", padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>Theme Settings</div>
            <button onClick={() => setTheme(DEFAULT_THEME)} style={{ fontSize: 10, padding: "3px 9px", background: "rgba(255,255,255,0.12)", border: "none", borderRadius: 6, color: "#fff", cursor: "pointer" }}>Reset</button>
          </div>
          <div style={{ padding: "14px 16px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#374151", marginBottom: 10, textTransform: "uppercase" }}>Accent Color</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {PRESET_THEMES.map((p, i) => (
                <div key={i} title={p.name} onClick={() => setTheme({ accent: p.accent, accentDark: p.accentDark })}
                  style={{ width: 28, height: 28, borderRadius: "50%", background: p.accent, cursor: "pointer", border: theme.accent === p.accent ? "3px solid #1e293b" : "3px solid transparent", transition: "all 0.15s" }} />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────────────────────
export default function EmployeeTasksPage() {
  const router = useRouter();
  const [profile, setProfile]   = useState(null);

  const activePage = "tasks"; // This page is always "tasks"

  const navigate = (page) => {
    if (page === null)       router.push("/Employee/Dashboard");
    else if (page === "projects") router.push("/Employee/Projects");
    else if (page === "tasks")    router.push("/Employee/Tasks");
    else                     router.push(`/Employee/Dashboard?page=${page}`);
  };

  useEffect(() => {
    fetch(`${BASE}/api/employee/profile`, { headers: HEADERS() })
      .then(r => r.json()).then(json => { if (json.success) setProfile(json.data); })
      .catch(console.error);
  }, []);

  const emp         = profile?.employee;
  const fullName    = emp ? `${emp.firstname} ${emp.lastname}` : "Employee";
  const designation = profile?.designation?.name ?? "Employee";

  return (
    <ThemeProvider>
      <ProtectedRoute requiredRole="employee">
        <ThemedLayout activePage={activePage} navigate={navigate} fullName={fullName} designation={designation}>
          <TasksPage />
        </ThemedLayout>
        <SettingsPanel />
      </ProtectedRoute>
    </ThemeProvider>
  );
}

function ThemedLayout({ activePage, navigate, fullName, designation, children }) {
  const { theme } = useTheme();
  const ACCENT = theme.accent;
  return (
    <>
      <style>{`
        @keyframes spin { from{transform:rotate(0deg);}to{transform:rotate(360deg);} }
        @keyframes syncPulse { 0%,100%{opacity:1;}50%{opacity:0.3;} }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #d1d5db; }
      `}</style>
      <div style={{ display: "flex", height: "100vh", fontFamily: "'Inter',-apple-system,sans-serif", background: theme.pageBg, color: theme.text, overflow: "hidden" }}>
        <Sidebar activePage={activePage} onNavigate={navigate} fullName={fullName} designation={designation} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", height: "100vh" }}>
          <Topbar fullName={fullName} />
          {/* Breadcrumb bar */}
          <div style={{ background: theme.topbar, borderBottom: `1px solid ${theme.border}`, padding: "9px 20px", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <h1 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: theme.text }}>Tasks</h1>
                <div style={{ fontSize: 11, color: theme.textSub, marginTop: 1, display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ cursor: "pointer", color: ACCENT }} onClick={() => navigate(null)}>🏠</span>
                  <span>›</span>
                  <span style={{ cursor: "pointer", color: ACCENT }} onClick={() => navigate("projects")}>Projects</span>
                  <span>›</span>
                  <span style={{ color: theme.text, fontWeight: 500 }}>Tasks</span>
                </div>
              </div>
              <button
                style={{ display: "flex", alignItems: "center", gap: 6, background: ACCENT, border: "none", borderRadius: 7, padding: "7px 16px", fontSize: 12.5, color: "#fff", fontWeight: 700, cursor: "pointer", transition: "opacity 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
                onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
                <Icon d={ICONS.plus} stroke="#fff" size={14} />
                Add Task
              </button>
            </div>
          </div>
          {/* Main content */}
          <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
            {children}
          </div>
        </div>
      </div>
    </>
  );
}