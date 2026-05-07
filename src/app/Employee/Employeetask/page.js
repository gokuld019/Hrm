"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN TOKENS
// ─────────────────────────────────────────────────────────────────────────────
const TOKENS = {
  font: {
    display: "'Syne', sans-serif",
    body: "'DM Sans', sans-serif",
    mono: "'JetBrains Mono', monospace",
  },
  radius: { sm: "6px", md: "10px", lg: "16px", xl: "22px", full: "9999px" },
};

const DEFAULT_THEME = {
  accent: "#6ee7b7",
  accentRgb: "110,231,183",
  accentDark: "#34d399",
  sidebar: "rgba(10,10,18,0.95)",
  topbar: "rgba(10,10,18,0.90)",
  card: "rgba(20,20,35,0.80)",
  pageBg: "#080810",
  pageBgGrad: "radial-gradient(ellipse 80% 50% at 20% 10%, rgba(110,231,183,0.06) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 90%, rgba(59,130,246,0.06) 0%, transparent 50%), #080810",
  text: "#f1f5f9",
  textSub: "#64748b",
  textMuted: "#334155",
  border: "rgba(255,255,255,0.06)",
  borderHover: "rgba(255,255,255,0.12)",
};

let _theme = { ...DEFAULT_THEME };
const getTheme = () => _theme;

const BASE = process.env.NEXT_PUBLIC_API_URL;
const HEADERS = () => ({
  Authorization: `Bearer ${localStorage.getItem("employee_auth_token")}`,
  "ngrok-skip-browser-warning": "true",
  Accept: "application/json",
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
  const setTheme = (u) => setThemeState(prev => {
    const next = { ...prev, ...u };
    _theme = next;
    if (typeof window !== "undefined") localStorage.setItem("hrm_theme", JSON.stringify(next));
    return next;
  });
  React.useEffect(() => { _theme = theme; }, [theme]);
  return (
    <ThemeCtx.Provider value={{ theme, setTheme }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        :root {
          --accent: ${theme.accent};
          --accent-rgb: ${theme.accentRgb || "110,231,183"};
          --accent-dark: ${theme.accentDark};
          --sidebar: ${theme.sidebar};
          --topbar: ${theme.topbar};
          --card: ${theme.card};
          --page-bg: ${theme.pageBg};
          --page-bg-grad: ${theme.pageBgGrad};
          --text: ${theme.text};
          --text-sub: ${theme.textSub};
          --text-muted: ${theme.textMuted};
          --border: ${theme.border};
          --border-hover: ${theme.borderHover};
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { font-family: ${TOKENS.font.body}; background: var(--page-bg); color: var(--text); }
        ::selection { background: var(--accent); color: #000; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 2px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.15); }

        @keyframes spin { from{transform:rotate(0deg)}to{transform:rotate(360deg)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0}to{opacity:1} }
        @keyframes glow { 0%,100%{box-shadow:0 0 8px var(--accent)44}50%{box-shadow:0 0 20px var(--accent)88} }
        @keyframes orb { 0%,100%{transform:scale(1) translate(0,0)}33%{transform:scale(1.05) translate(10px,-10px)}66%{transform:scale(0.95) translate(-8px,8px)} }
        @keyframes shimmer { 0%{transform:translateX(-100%)}100%{transform:translateX(200%)} }
        @keyframes checkPop { 0%{transform:scale(0)}60%{transform:scale(1.3)}100%{transform:scale(1)} }
        @keyframes slideIn { from{transform:translateX(-8px);opacity:0}to{transform:translateX(0);opacity:1} }
        @keyframes ringFill { from{stroke-dashoffset:283}to{stroke-dashoffset:var(--ring-offset)} }

        .fade-up { animation: fadeUp 0.4s ease both; }
        .fade-up-1 { animation: fadeUp 0.4s 0.05s ease both; }
        .fade-up-2 { animation: fadeUp 0.4s 0.1s ease both; }
        .fade-up-3 { animation: fadeUp 0.4s 0.15s ease both; }

        .glass {
          background: var(--card);
          backdrop-filter: blur(20px) saturate(1.4);
          -webkit-backdrop-filter: blur(20px) saturate(1.4);
          border: 1px solid var(--border);
        }

        .btn-ghost {
          background: rgba(255,255,255,0.04);
          border: 1px solid var(--border);
          border-radius: ${TOKENS.radius.md};
          color: var(--text-sub);
          cursor: pointer;
          font-family: ${TOKENS.font.body};
          font-size: 12px;
          font-weight: 500;
          padding: 6px 12px;
          transition: all 0.18s ease;
          display: inline-flex; align-items: center; gap: 6px;
        }
        .btn-ghost:hover { background: rgba(255,255,255,0.08); border-color: var(--border-hover); color: var(--text); }

        .btn-accent {
          background: linear-gradient(135deg, var(--accent) 0%, var(--accent-dark) 100%);
          border: none;
          border-radius: ${TOKENS.radius.md};
          color: #000;
          cursor: pointer;
          font-family: ${TOKENS.font.body};
          font-size: 12px;
          font-weight: 600;
          padding: 7px 14px;
          transition: all 0.18s ease;
          display: inline-flex; align-items: center; gap: 6px;
        }
        .btn-accent:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(var(--accent-rgb),0.35); }
        .btn-accent:active { transform: translateY(0); }

        .nav-item {
          display: flex; align-items: center; gap: 10px;
          width: 100%; padding: 8px 12px;
          border: none; border-radius: ${TOKENS.radius.md};
          background: transparent; color: var(--text-sub);
          cursor: pointer; font-family: ${TOKENS.font.body};
          font-size: 13px; font-weight: 500; text-align: left;
          transition: all 0.15s ease; position: relative;
        }
        .nav-item:hover { background: rgba(255,255,255,0.04); color: var(--text); }
        .nav-item.active { background: rgba(var(--accent-rgb),0.1); color: var(--accent); }
        .nav-item.active::before {
          content: ''; position: absolute; left: -1px; top: 20%; bottom: 20%;
          width: 2px; border-radius: 2px;
          background: var(--accent); box-shadow: 0 0 8px var(--accent);
        }

        .project-card {
          border-radius: ${TOKENS.radius.xl};
          border: 1px solid var(--border);
          background: rgba(255,255,255,0.025);
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative; overflow: hidden;
          animation: fadeUp 0.35s ease both;
        }
        .project-card:hover { border-color: var(--border-hover); background: rgba(255,255,255,0.04); transform: translateX(3px); }
        .project-card.selected {
          border-color: rgba(var(--accent-rgb), 0.4);
          background: rgba(var(--accent-rgb), 0.06);
          box-shadow: 0 0 0 1px rgba(var(--accent-rgb),0.15), 4px 0 20px rgba(var(--accent-rgb),0.1);
        }

        .task-row {
          display: flex; align-items: center;
          padding: 12px 18px;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          transition: background 0.15s ease;
          position: relative;
          animation: slideIn 0.25s ease both;
        }
        .task-row:hover { background: rgba(255,255,255,0.025); }
        .task-row:hover .task-actions { opacity: 1 !important; }
        .task-actions { opacity: 0; transition: opacity 0.15s ease; }
        .task-row.completed-row { opacity: 0.55; }

        .priority-pill {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 3px 9px; border-radius: ${TOKENS.radius.full};
          font-size: 10.5px; font-weight: 600;
          font-family: ${TOKENS.font.body};
        }

        .status-btn {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 3px 10px; border-radius: ${TOKENS.radius.full};
          font-size: 11px; font-weight: 500;
          cursor: pointer; border: none;
          font-family: ${TOKENS.font.body};
          transition: all 0.15s ease;
        }
        .status-btn:hover { filter: brightness(1.15); transform: scale(1.03); }

        .tab-pill {
          padding: 5px 14px; border-radius: ${TOKENS.radius.full};
          border: 1px solid var(--border); background: transparent;
          color: var(--text-sub); font-family: ${TOKENS.font.body};
          font-size: 12px; font-weight: 500; cursor: pointer;
          transition: all 0.18s ease;
        }
        .tab-pill:hover { border-color: var(--border-hover); color: var(--text); }
        .tab-pill.active {
          background: rgba(var(--accent-rgb), 0.12);
          border-color: rgba(var(--accent-rgb), 0.4);
          color: var(--accent);
        }

        .progress-bar {
          height: 4px; background: rgba(255,255,255,0.06);
          border-radius: 2px; overflow: hidden;
        }
        .progress-fill {
          height: 100%; border-radius: 2px;
          background: linear-gradient(90deg, var(--accent), var(--accent-dark));
          transition: width 0.8s cubic-bezier(0.4,0,0.2,1);
          position: relative; overflow: hidden;
        }
        .progress-fill::after {
          content: ''; position: absolute; top: 0; left: -100%;
          width: 60%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          animation: shimmer 2.5s 1s ease infinite;
        }

        .tag-chip {
          display: inline-flex; align-items: center;
          padding: 2px 8px; border-radius: ${TOKENS.radius.full};
          font-size: 10px; font-weight: 600;
          font-family: ${TOKENS.font.mono};
          white-space: nowrap;
        }

        .star-btn {
          background: none; border: none; cursor: pointer;
          transition: transform 0.2s ease; padding: 2px;
        }
        .star-btn:hover { transform: scale(1.2) rotate(10deg); }

        .check-box {
          width: 18px; height: 18px; border-radius: 5px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.18s ease; flex-shrink: 0;
        }
        .check-box:hover { transform: scale(1.1); }

        .status-dropdown {
          position: absolute; top: calc(100% + 6px); right: 0;
          background: rgba(12,12,22,0.97);
          backdrop-filter: blur(20px);
          border-radius: ${TOKENS.radius.lg}; border: 1px solid var(--border-hover);
          box-shadow: 0 16px 40px rgba(0,0,0,0.6); z-index: 999;
          min-width: 160px; overflow: hidden;
          animation: fadeUp 0.15s ease;
        }

        .dropdown-item {
          display: flex; align-items: center; gap: 9px;
          padding: 9px 13px; cursor: pointer;
          font-size: 12.5px; color: var(--text-sub);
          font-family: ${TOKENS.font.body};
          transition: background 0.12s ease;
        }
        .dropdown-item:hover { background: rgba(255,255,255,0.05); color: var(--text); }
        .dropdown-item.current { background: rgba(var(--accent-rgb),0.08); color: var(--text); }

        .orb {
          position: absolute; border-radius: 50%;
          filter: blur(60px); pointer-events: none;
          animation: orb 10s ease-in-out infinite;
        }

        .sidebar-section-label {
          font-family: ${TOKENS.font.mono};
          font-size: 9.5px; font-weight: 500;
          color: var(--text-muted);
          text-transform: uppercase; letter-spacing: 1.2px;
          padding: 0 14px 6px;
        }

        select {
          appearance: none;
          background: rgba(255,255,255,0.04);
          border: 1px solid var(--border);
          border-radius: ${TOKENS.radius.md};
          color: var(--text-sub); cursor: pointer;
          font-family: ${TOKENS.font.body}; font-size: 12px;
          outline: none; padding: 6px 28px 6px 10px;
          transition: all 0.15s ease;
        }
        select:hover { border-color: var(--border-hover); color: var(--text); }
      `}</style>
      {children}
    </ThemeCtx.Provider>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ICONS
// ─────────────────────────────────────────────────────────────────────────────
const Icon = ({ d, size = 14, stroke = "currentColor", fill = "none", sw = 1.6, style: s }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
    strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
    style={{ display: "block", flexShrink: 0, ...s }}>
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

const ICONS = {
  home: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",
  folder: "M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z",
  tickets: "M2 3h20v14H2z M8 21h8M12 17v4",
  attendance: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2",
  performance: "M18 20V10M12 20V4M6 20v-6",
  training: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  probation: "M9 11l3 3L22 4 M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11",
  notice: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  promotion: "M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z",
  resignation: "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v1",
  termination: "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z",
  holidays: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z",
  search: "M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z",
  bell: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0",
  settings: ["M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z", "M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"],
  logOut: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9",
  sun: "M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12 M12 16A4 4 0 1 0 12 8a4 4 0 0 0 0 8z",
  monitor: "M2 3h20v14H2z M8 21h8M12 17v4",
  chevRight: "M9 18l6-6-6-6",
  chevLeft: "M15 18l-6-6 6-6",
  chevDown: "M6 9l6 6 6-6",
  x: "M18 6L6 18M6 6l12 12",
  plus: "M12 5v14M5 12h14",
  check: "M20 6L9 17l-5-5",
  star: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  calendar: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z",
  tag: "M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z M7 7h.01",
  clock: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2",
  users: ["M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2", "M9 7a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"],
  more: "M12 5h.01M12 12h.01M12 19h.01",
  moreH: "M5 12h.01M12 12h.01M19 12h.01",
  grip: "M9 3h.01M15 3h.01M9 9h.01M15 9h.01M9 15h.01M15 15h.01",
  mail: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6",
  zap: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  refresh: "M23 4v6h-6 M1 20v-6h6 M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15",
  filter: "M22 3H2l8 9.46V19l4 2v-8.54L22 3z",
  export: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M17 8l-5-5-5 5 M12 3v12",
  list: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
};

// ─────────────────────────────────────────────────────────────────────────────
// AVATAR
// ─────────────────────────────────────────────────────────────────────────────
const AVATAR_PALETTE = ["#6ee7b7","#60a5fa","#c084fc","#f472b6","#fb923c","#34d399","#818cf8","#38bdf8","#a78bfa","#4ade80"];
function avatarColor(name = "") {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffffffff;
  return AVATAR_PALETTE[Math.abs(h) % AVATAR_PALETTE.length];
}

const Avatar = ({ name = "?", size = 28, img = null }) => {
  const color = avatarColor(name);
  const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  const hexToRgba = (hex, a) => {
    const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
    return `rgba(${r},${g},${b},${a})`;
  };
  if (img) return (
    <div style={{ width: size, height: size, borderRadius: "50%", overflow: "hidden", flexShrink: 0, border: `1.5px solid ${hexToRgba(color, 0.3)}` }}>
      <img src={img} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { e.target.style.display = "none"; }} />
    </div>
  );
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: hexToRgba(color, 0.15), border: `1.5px solid ${hexToRgba(color, 0.3)}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.33, fontWeight: 600, color, flexShrink: 0, fontFamily: TOKENS.font.body }}>
      {initials}
    </div>
  );
};

function StackedAvatars({ members = [], max = 3, size = 24 }) {
  const shown = members.slice(0, max);
  const extra = members.length - max;
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      {shown.map((m, i) => {
        const name = m?.name || `${m?.firstname ?? ""} ${m?.lastname ?? ""}`.trim() || "?";
        return (
          <div key={m?.id ?? i} title={name} style={{ marginLeft: i === 0 ? 0 : -size * 0.3, zIndex: max - i }}>
            <Avatar name={name} size={size} img={m?.profile_image || null} />
          </div>
        );
      })}
      {extra > 0 && (
        <div style={{ marginLeft: -size * 0.3, width: size, height: size, borderRadius: "50%", background: "rgba(255,255,255,0.06)", border: "1.5px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.28, fontWeight: 600, color: "var(--text-sub)" }}>+{extra}</div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STATUS & PRIORITY CONFIG
// ─────────────────────────────────────────────────────────────────────────────
const STATUS_CFG = {
  pending:     { color: "#fbbf24", bg: "rgba(251,191,36,0.1)",  border: "rgba(251,191,36,0.25)",  label: "Pending"     },
  in_progress: { color: "#60a5fa", bg: "rgba(96,165,250,0.1)",  border: "rgba(96,165,250,0.25)",  label: "In Progress" },
  completed:   { color: "#4ade80", bg: "rgba(74,222,128,0.1)",  border: "rgba(74,222,128,0.25)",  label: "Completed"   },
  on_hold:     { color: "#f472b6", bg: "rgba(244,114,182,0.1)", border: "rgba(244,114,182,0.25)", label: "On Hold"     },
  cancelled:   { color: "#94a3b8", bg: "rgba(148,163,184,0.1)", border: "rgba(148,163,184,0.25)", label: "Cancelled"   },
};
const PRIORITY_CFG = {
  high:   { color: "#f87171", bg: "rgba(248,113,113,0.1)",  border: "rgba(248,113,113,0.25)",  glow: "rgba(248,113,113,0.2)"  },
  medium: { color: "#fbbf24", bg: "rgba(251,191,36,0.1)",   border: "rgba(251,191,36,0.25)",   glow: "rgba(251,191,36,0.15)"  },
  low:    { color: "#4ade80", bg: "rgba(74,222,128,0.1)",   border: "rgba(74,222,128,0.25)",   glow: "rgba(74,222,128,0.15)"  },
};
const TAG_COLORS = [
  { bg: "rgba(96,165,250,0.12)", text: "#60a5fa", border: "rgba(96,165,250,0.25)" },
  { bg: "rgba(244,114,182,0.12)", text: "#f472b6", border: "rgba(244,114,182,0.25)" },
  { bg: "rgba(74,222,128,0.12)", text: "#4ade80", border: "rgba(74,222,128,0.25)" },
  { bg: "rgba(167,139,250,0.12)", text: "#a78bfa", border: "rgba(167,139,250,0.25)" },
  { bg: "rgba(251,191,36,0.12)", text: "#fbbf24", border: "rgba(251,191,36,0.25)" },
  { bg: "rgba(248,113,113,0.12)", text: "#f87171", border: "rgba(248,113,113,0.25)" },
];
function tagColor(str = "") {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) & 0xffffffff;
  return TAG_COLORS[Math.abs(h) % TAG_COLORS.length];
}

const PROJECT_COLORS = ["#6ee7b7","#60a5fa","#c084fc","#f472b6","#fb923c","#4ade80","#fbbf24","#f87171"];
function projectColor(id) { return PROJECT_COLORS[(id ?? 0) % PROJECT_COLORS.length]; }

// ─────────────────────────────────────────────────────────────────────────────
// CIRCULAR PROGRESS RING
// ─────────────────────────────────────────────────────────────────────────────
function ProgressRing({ pct = 0, size = 52, color = "var(--accent)", trackColor = "rgba(255,255,255,0.06)" }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={trackColor} strokeWidth={4} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={4}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)" }} />
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize={size * 0.22} fontWeight="700" fill={color} fontFamily={TOKENS.font.mono}>{pct}%</text>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SIDEBAR
// ─────────────────────────────────────────────────────────────────────────────
const ACCORDION_GROUPS = [
  { key: "tickets", label: "Tickets", icon: "tickets",
    items: [{ label: "All Tickets", pageKey: "tickets" }, { label: "Ticket Details", pageKey: "tickets-details" }, { label: "Automation", pageKey: "tickets-automation" }, { label: "Reports", pageKey: "tickets-reports" }]
  },
  { key: "attendance", label: "Attendance", icon: "attendance",
    items: [{ label: "Leaves", pageKey: "attendance-leaves" }, { label: "Attendance", pageKey: "attendance-employee" }, { label: "Timesheets", pageKey: "attendance-timesheets" }, { label: "Shift & Schedule", pageKey: "attendance-shift" }, { label: "Shift Swap", pageKey: "attendance-swap", badge: "New" }, { label: "Overtime", pageKey: "attendance-overtime" }, { label: "Holiday Calendar", pageKey: "attendance-holidays", badge: "New" }, { label: "WFH Management", pageKey: "attendance-wfh", badge: "New" }]
  },
  { key: "performance", label: "Performance", icon: "performance",
    items: [{ label: "Performance Indicator", pageKey: "performance-indicator" }, { label: "Performance Review", pageKey: "performance-review" }, { label: "Appraisal", pageKey: "performance-appraisal" }, { label: "Goal List", pageKey: "performance-goal-list" }, { label: "Goal Type", pageKey: "performance-goal-type" }]
  },
  { key: "training", label: "Training", icon: "training",
    items: [{ label: "Training List", pageKey: "training-list" }, { label: "Trainers", pageKey: "training-trainers" }, { label: "Training Type", pageKey: "training-type" }, { label: "Certification Tracking", pageKey: "training-cert", badge: "New" }, { label: "Learning Analytics", pageKey: "training-analytics", badge: "New" }]
  },
];
const STANDALONE_ITEMS = [
  { label: "Probation Management", icon: "probation", pageKey: "probation", badge: "New" },
  { label: "Notice Period Tracker", icon: "notice", pageKey: "notice", badge: "New" },
  { label: "Promotion", icon: "promotion", pageKey: "promotion" },
  { label: "Resignation", icon: "resignation", pageKey: "resignation" },
  { label: "Termination", icon: "termination", pageKey: "termination" },
  { label: "Holidays", icon: "holidays", pageKey: "holidays" },
];

function AccordionGroup({ group, activePage, onNavigate }) {
  const { theme } = useTheme();
  const isAnyActive = group.items.some(i => i.pageKey === activePage);
  const [open, setOpen] = useState(isAnyActive);
  const bodyRef = useRef(null);
  const [height, setHeight] = useState(isAnyActive ? "auto" : "0px");
  useEffect(() => { if (isAnyActive && !open) setOpen(true); }, [isAnyActive]);
  useEffect(() => { if (bodyRef.current) setHeight(open ? `${bodyRef.current.scrollHeight}px` : "0px"); }, [open]);
  const color = isAnyActive || open ? theme.accent : "var(--text-sub)";
  return (
    <div style={{ marginBottom: 2 }}>
      <button className={`nav-item ${isAnyActive ? "active" : ""}`} onClick={() => setOpen(o => !o)} style={{ justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: TOKENS.radius.sm, background: isAnyActive ? `rgba(var(--accent-rgb),0.15)` : "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Icon d={ICONS[group.icon] || ICONS.folder} size={13} stroke={color} />
          </div>
          <span style={{ color }}>{group.label}</span>
        </div>
        <Icon d={ICONS.chevDown} size={12} stroke={color} style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.22s ease" }} />
      </button>
      <div style={{ height, overflow: "hidden", transition: "height 0.25s cubic-bezier(0.4,0,0.2,1)" }}>
        <div ref={bodyRef} style={{ paddingLeft: 14, paddingTop: 2, paddingBottom: 2, borderLeft: "1px solid rgba(255,255,255,0.05)", marginLeft: 22 }}>
          {group.items.map(item => {
            const isActive = activePage === item.pageKey;
            return (
              <button key={item.pageKey} onClick={() => onNavigate(item.pageKey)}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "6px 10px", border: "none", borderRadius: TOKENS.radius.sm, background: isActive ? `rgba(var(--accent-rgb),0.1)` : "transparent", color: isActive ? "var(--accent)" : "var(--text-sub)", cursor: "pointer", fontSize: 12, fontWeight: isActive ? 500 : 400, fontFamily: TOKENS.font.body, textAlign: "left", transition: "all 0.12s ease", marginBottom: 1 }}
                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.color = "var(--text)"; } }}
                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-sub)"; } }}>
                <span>{item.label}</span>
                {item.badge && <span style={{ fontSize: 9, padding: "1px 5px", borderRadius: TOKENS.radius.full, background: `rgba(var(--accent-rgb),0.15)`, color: "var(--accent)", fontWeight: 600, border: `1px solid rgba(var(--accent-rgb),0.25)` }}>{item.badge}</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Sidebar({ activePage, onNavigate, fullName, designation }) {
  const { theme } = useTheme();
  return (
    <aside style={{ width: 230, background: theme.sidebar, borderRight: `1px solid ${theme.border}`, display: "flex", flexDirection: "column", flexShrink: 0, height: "100vh", backdropFilter: "blur(20px)" }}>
      <div style={{ padding: "16px 16px 14px", borderBottom: `1px solid ${theme.border}`, display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 34, height: 34, borderRadius: TOKENS.radius.md, background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentDark})`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 14px rgba(var(--accent-rgb),0.35)` }}>
          <Icon d={ICONS.zap} stroke="#000" size={16} fill="#000" />
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: theme.text, fontFamily: TOKENS.font.display, letterSpacing: "-0.3px" }}>SmartHR</div>
          <div style={{ fontSize: 9.5, color: theme.textSub, fontFamily: TOKENS.font.mono, letterSpacing: "0.5px" }}>WORKSPACE</div>
        </div>
      </div>
      <nav style={{ padding: "12px 10px", flex: 1, overflowY: "auto" }}>
        <div className="sidebar-section-label" style={{ marginBottom: 6 }}>Main</div>
        <button className="nav-item" onClick={() => onNavigate(null)}>
          <div style={{ width: 28, height: 28, borderRadius: TOKENS.radius.sm, background: "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon d={ICONS.home} size={13} stroke="var(--text-sub)" /></div>
          Dashboard
        </button>
        <button className="nav-item" onClick={() => onNavigate("projects")}>
          <div style={{ width: 28, height: 28, borderRadius: TOKENS.radius.sm, background: "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon d={ICONS.folder} size={13} stroke="var(--text-sub)" /></div>
          Projects
        </button>
        <div className="sidebar-section-label" style={{ marginTop: 14, marginBottom: 6 }}>Management</div>
        {ACCORDION_GROUPS.map(g => <AccordionGroup key={g.key} group={g} activePage={activePage} onNavigate={onNavigate} />)}
        {STANDALONE_ITEMS.map(item => (
          <button key={item.pageKey} className={`nav-item ${activePage === item.pageKey ? "active" : ""}`} onClick={() => onNavigate(item.pageKey)}>
            <div style={{ width: 28, height: 28, borderRadius: TOKENS.radius.sm, background: activePage === item.pageKey ? `rgba(var(--accent-rgb),0.15)` : "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon d={ICONS[item.icon] || ICONS.folder} size={13} stroke={activePage === item.pageKey ? "var(--accent)" : "var(--text-sub)"} />
            </div>
            <span style={{ flex: 1 }}>{item.label}</span>
            {item.badge && <span style={{ fontSize: 9, padding: "1px 5px", borderRadius: TOKENS.radius.full, background: `rgba(var(--accent-rgb),0.15)`, color: "var(--accent)", fontWeight: 600 }}>{item.badge}</span>}
          </button>
        ))}
      </nav>
      <div style={{ padding: "12px 14px", borderTop: `1px solid ${theme.border}`, display: "flex", alignItems: "center", gap: 10 }}>
        <Avatar name={fullName || "Employee"} size={34} />
        <div style={{ overflow: "hidden", flex: 1 }}>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: theme.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontFamily: TOKENS.font.body }}>{fullName || "Employee"}</div>
          <div style={{ fontSize: 10.5, color: theme.textSub, fontFamily: TOKENS.font.mono }}>{designation || "Employee"}</div>
        </div>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 8px #4ade80" }} />
      </div>
    </aside>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TOPBAR
// ─────────────────────────────────────────────────────────────────────────────
function Topbar({ fullName }) {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [showProfile, setShowProfile] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(3);
  const profileRef = useRef(null);

  useEffect(() => {
    const handler = e => { if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false); };
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
    <div style={{ background: theme.topbar, borderBottom: `1px solid ${theme.border}`, padding: "10px 20px", display: "flex", alignItems: "center", gap: 12, flexShrink: 0, backdropFilter: "blur(20px)", zIndex: 100 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", borderRadius: TOKENS.radius.md, padding: "7px 12px", flex: 1, maxWidth: 280 }}>
        <Icon d={ICONS.search} stroke="var(--text-muted)" size={13} />
        <input style={{ background: "transparent", border: "none", color: "var(--text)", fontFamily: TOKENS.font.body, fontSize: 13, outline: "none", width: "100%" }} placeholder="Search tasks, projects…" />
        <kbd style={{ fontSize: 9.5, padding: "2px 5px", borderRadius: 4, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "var(--text-muted)", fontFamily: TOKENS.font.mono }}>⌘K</kbd>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: "auto" }}>
        <button className="btn-ghost" onClick={() => {
          const next = !darkMode; setDarkMode(next);
          if (!next) setTheme({ sidebar: "rgba(248,250,252,0.98)", topbar: "rgba(248,250,252,0.95)", card: "rgba(255,255,255,0.9)", pageBg: "#f1f5f9", pageBgGrad: "#f1f5f9", text: "#0f172a", textSub: "#475569", textMuted: "#94a3b8", border: "rgba(0,0,0,0.08)", borderHover: "rgba(0,0,0,0.15)" });
          else setTheme({ ...DEFAULT_THEME });
        }} style={{ width: 34, height: 34, padding: 0, justifyContent: "center" }}>
          <Icon d={darkMode ? ICONS.sun : ICONS.monitor} stroke="var(--text-sub)" size={14} />
        </button>
        <div style={{ position: "relative" }}>
          <button className="btn-ghost" style={{ width: 34, height: 34, padding: 0, justifyContent: "center" }} onClick={() => setNotifications(0)}>
            <Icon d={ICONS.bell} stroke="var(--text-sub)" size={14} />
          </button>
          {notifications > 0 && (
            <div style={{ position: "absolute", top: -3, right: -3, width: 15, height: 15, borderRadius: "50%", background: "#f87171", border: `2px solid ${theme.topbar}`, display: "flex", alignItems: "center", justifyContent: "center", animation: "glow 2s ease infinite" }}>
              <span style={{ fontSize: 7, color: "#fff", fontWeight: 700 }}>{notifications}</span>
            </div>
          )}
        </div>
        <div style={{ width: 1, height: 22, background: "var(--border)" }} />
        <div ref={profileRef} style={{ position: "relative" }}>
          <button onClick={() => setShowProfile(s => !s)}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 8px 4px 4px", borderRadius: TOKENS.radius.lg, border: "1px solid var(--border)", background: "rgba(255,255,255,0.03)", cursor: "pointer", transition: "all 0.15s ease" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--border-hover)"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}>
            <Avatar name={fullName || "Employee"} size={26} />
            <span style={{ fontSize: 12.5, fontWeight: 500, color: "var(--text)", fontFamily: TOKENS.font.body }}>{(fullName || "Employee").split(" ")[0]}</span>
            <Icon d={ICONS.chevDown} size={11} stroke="var(--text-sub)" />
          </button>
          {showProfile && (
            <div style={{ position: "absolute", top: 46, right: 0, width: 220, background: "rgba(12,12,22,0.97)", borderRadius: TOKENS.radius.xl, border: "1px solid var(--border-hover)", boxShadow: "0 24px 60px rgba(0,0,0,0.6)", zIndex: 999, overflow: "hidden", backdropFilter: "blur(20px)", animation: "fadeUp 0.18s ease" }}>
              <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)", display: "flex", gap: 10, alignItems: "center" }}>
                <Avatar name={fullName || "E"} size={38} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", fontFamily: TOKENS.font.body }}>{fullName || "Employee"}</div>
                  <div style={{ fontSize: 10, color: "var(--text-sub)", fontFamily: TOKENS.font.mono }}>Employee</div>
                </div>
              </div>
              <div style={{ padding: "6px" }}>
                <button onClick={handleLogout}
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", cursor: "pointer", fontSize: 12.5, fontWeight: 500, color: "#f87171", background: "transparent", border: "none", borderRadius: TOKENS.radius.md, width: "100%", fontFamily: TOKENS.font.body, transition: "background 0.12s ease" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(248,113,113,0.1)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <Icon d={ICONS.logOut} stroke="#f87171" size={14} />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STATUS DROPDOWN
// ─────────────────────────────────────────────────────────────────────────────
function StatusDropdown({ taskId, currentStatus, onStatusChange }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  const handleSelect = async (status) => {
    setOpen(false); setLoading(true);
    try {
      const res = await fetch(`${BASE}/api/employee/tasks/${taskId}/status`, { method: "PUT", headers: HEADERS(), body: JSON.stringify({ status }) });
      const json = await res.json();
      if (json.success) onStatusChange(taskId, json.data.status);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };
  const cfg = STATUS_CFG[currentStatus] || STATUS_CFG.pending;
  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button className="status-btn" onClick={() => setOpen(o => !o)} disabled={loading}
        style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color, cursor: loading ? "wait" : "pointer" }}>
        {loading ? (
          <svg width={8} height={8} viewBox="0 0 24 24" fill="none" stroke={cfg.color} strokeWidth={2.5} style={{ animation: "spin 0.8s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" /></svg>
        ) : (
          <div style={{ width: 5, height: 5, borderRadius: "50%", background: cfg.color, boxShadow: `0 0 6px ${cfg.color}` }} />
        )}
        {cfg.label}
      </button>
      {open && (
        <div className="status-dropdown">
          {Object.entries(STATUS_CFG).map(([key, sc]) => (
            <div key={key} className={`dropdown-item ${currentStatus === key ? "current" : ""}`} onClick={() => handleSelect(key)}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: sc.color, boxShadow: `0 0 6px ${sc.color}`, flexShrink: 0 }} />
              <span style={{ flex: 1 }}>{sc.label}</span>
              {currentStatus === key && <Icon d={ICONS.check} size={11} stroke={sc.color} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PROJECT CARD (left panel)
// ─────────────────────────────────────────────────────────────────────────────
function ProjectCard({ project, isSelected, onClick, idx }) {
  const { theme } = useTheme();
  const color = projectColor(project.id);
  const tasks = project._tasks || [];
  const done = tasks.filter(t => t.status === "completed").length;
  const total = tasks.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const name = project.project_name || project.name || "Untitled Project";

  return (
    <div className={`project-card ${isSelected ? "selected" : ""}`} onClick={onClick} style={{ animationDelay: `${idx * 0.06}s`, padding: "14px 16px", marginBottom: 10 }}>
      {/* Color accent bar */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${color}, ${color}44)`, opacity: isSelected ? 1 : 0.4, transition: "opacity 0.2s ease" }} />

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        {/* Progress ring as icon */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          <ProgressRing pct={pct} size={46} color={color} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontFamily: TOKENS.font.display, letterSpacing: "-0.2px", marginBottom: 2 }}>{name}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: color, boxShadow: `0 0 6px ${color}` }} />
            <span style={{ fontSize: 10.5, color: "var(--text-sub)", fontFamily: TOKENS.font.mono }}>{done}/{total} tasks</span>
          </div>
        </div>
      </div>

      {/* Meta row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <div>
          <div style={{ fontSize: 9, color: "var(--text-muted)", fontFamily: TOKENS.font.mono, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 2 }}>Deadline</div>
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-sub)" }}>
            {project.end_date ? new Date(project.end_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "—"}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 9, color: "var(--text-muted)", fontFamily: TOKENS.font.mono, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 3 }}>Lead</div>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <Avatar name={project.team_leader ? `${project.team_leader.firstname ?? ""} ${project.team_leader.lastname ?? ""}`.trim() : "?"} size={18} />
            <span style={{ fontSize: 11, fontWeight: 500, color: "var(--text-sub)" }}>{project.team_leader?.firstname || "—"}</span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ marginTop: 12 }}>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}, ${color}99)` }} />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TASK ROW
// ─────────────────────────────────────────────────────────────────────────────
function TaskRow({ task, isCompleted, onStatusChange, onToggleComplete, idx = 0 }) {
  const { theme } = useTheme();
  const [starred, setStarred] = useState(false);
  const priorityCfg = PRIORITY_CFG[(task.priority || "").toLowerCase()] || PRIORITY_CFG.medium;
  const dueDate = task.due_date ? new Date(task.due_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) : null;
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== "completed";
  const tags = task.tags?.length ? task.tags : [task.visibility === "public" ? (task.project?.type || "General") : "Private"].filter(Boolean);
  const assignees = task.assignees?.length ? task.assignees : [task.creator].filter(Boolean);

  return (
    <div className={`task-row ${isCompleted ? "completed-row" : ""}`} style={{ animationDelay: `${idx * 0.03}s` }}>
      {/* Priority glow accent */}
      {!isCompleted && task.priority === "high" && (
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: priorityCfg.color, boxShadow: `0 0 8px ${priorityCfg.color}` }} />
      )}

      {/* Drag handle */}
      <div style={{ color: "var(--text-muted)", marginRight: 10, cursor: "grab", flexShrink: 0, opacity: 0.5 }}>
        <Icon d={ICONS.grip} size={13} stroke="var(--text-muted)" sw={2} />
      </div>

      {/* Checkbox */}
      <div className="check-box"
        onClick={() => onToggleComplete(task.id)}
        style={{ border: `2px solid ${isCompleted ? theme.accent : "rgba(255,255,255,0.15)"}`, background: isCompleted ? `rgba(var(--accent-rgb),0.15)` : "transparent", marginRight: 10 }}>
        {isCompleted && <Icon d={ICONS.check} size={10} stroke={theme.accent} sw={3} style={{ animation: "checkPop 0.25s ease" }} />}
      </div>

      {/* Star */}
      <button className="star-btn" onClick={() => setStarred(s => !s)} style={{ marginRight: 8 }}>
        <Icon d={ICONS.star} size={13} stroke={starred ? "#fbbf24" : "rgba(255,255,255,0.2)"} fill={starred ? "#fbbf24" : "none"} sw={1.8} />
      </button>

      {/* Title */}
      <div style={{ flex: 1, minWidth: 0, marginRight: 14 }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: isCompleted ? "var(--text-muted)" : "var(--text)", textDecoration: isCompleted ? "line-through" : "none", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "block", fontFamily: TOKENS.font.body, transition: "all 0.15s ease" }}>
          {task.title}
        </span>
      </div>

      {/* Due date */}
      {dueDate && (
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginRight: 14, flexShrink: 0 }}>
          <Icon d={ICONS.calendar} size={11} stroke={isOverdue ? "#f87171" : "var(--text-muted)"} />
          <span style={{ fontSize: 11, color: isOverdue ? "#f87171" : "var(--text-sub)", fontWeight: isOverdue ? 600 : 400, fontFamily: TOKENS.font.mono }}>{dueDate}</span>
        </div>
      )}

      {/* Tags */}
      <div style={{ display: "flex", gap: 4, marginRight: 12, flexShrink: 0 }}>
        {tags.slice(0, 2).map((tag, i) => {
          const tc = tagColor(String(tag));
          return (
            <span key={i} className="tag-chip" style={{ background: tc.bg, color: tc.text, border: `1px solid ${tc.border}` }}>
              {String(tag).replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
            </span>
          );
        })}
      </div>

      {/* Priority badge */}
      <div style={{ marginRight: 12, flexShrink: 0 }}>
        <span className="priority-pill" style={{ background: priorityCfg.bg, border: `1px solid ${priorityCfg.border}`, color: priorityCfg.color }}>
          <div style={{ width: 5, height: 5, borderRadius: "50%", background: priorityCfg.color, boxShadow: `0 0 6px ${priorityCfg.color}` }} />
          {(task.priority || "med").charAt(0).toUpperCase() + (task.priority || "med").slice(1)}
        </span>
      </div>

      {/* Status */}
      <div style={{ marginRight: 12, flexShrink: 0 }}>
        <StatusDropdown taskId={task.id} currentStatus={task.status} onStatusChange={onStatusChange} />
      </div>

      {/* Assignees */}
      <div style={{ marginRight: 10, flexShrink: 0 }}>
        <StackedAvatars members={assignees} max={3} size={24} />
      </div>

      {/* Actions */}
      <div className="task-actions">
        <button className="btn-ghost" style={{ width: 28, height: 28, padding: 0, justifyContent: "center", borderRadius: TOKENS.radius.sm }}>
          <Icon d={ICONS.moreH} size={12} stroke="var(--text-sub)" sw={2.5} />
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MINI STAT CARDS (top of task list)
// ─────────────────────────────────────────────────────────────────────────────
function MiniStats({ total, done, inProgress, overdue }) {
  const { theme } = useTheme();
  const stats = [
    { label: "Total Tasks", value: total, color: theme.accent, icon: ICONS.list },
    { label: "Completed", value: done, color: "#4ade80", icon: ICONS.check },
    { label: "In Progress", value: inProgress, color: "#60a5fa", icon: ICONS.refresh },
    { label: "Overdue", value: overdue, color: "#f87171", icon: ICONS.clock },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 14 }}>
      {stats.map(({ label, value, color, icon }, i) => (
        <div key={i} style={{ background: "rgba(255,255,255,0.025)", border: "1px solid var(--border)", borderRadius: TOKENS.radius.lg, padding: "12px 14px", animation: `fadeUp 0.3s ${i * 0.05}s ease both`, transition: "border-color 0.15s ease" }}
          onMouseEnter={e => e.currentTarget.style.borderColor = "var(--border-hover)"}
          onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: TOKENS.font.mono, textTransform: "uppercase", letterSpacing: "0.6px" }}>{label}</span>
            <div style={{ width: 24, height: 24, borderRadius: TOKENS.radius.sm, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon d={icon} size={11} stroke={color} />
            </div>
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color, fontFamily: TOKENS.font.display }}>{value}</div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TASKS PAGE
// ─────────────────────────────────────────────────────────────────────────────
function TasksPage() {
  const { theme } = useTheme();
  const [allTasks, setAllTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completedIds, setCompletedIds] = useState(new Set());
  const [priorityFilter, setPriorityFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [visibleCount, setVisibleCount] = useState(12);
  const [search, setSearch] = useState("");
  const [showCompleted, setShowCompleted] = useState(true);

  const fetchTasks = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${BASE}/api/employee/tasks/`, { headers: HEADERS() });
      const json = await res.json();
      let tasks = [];
      if (json.success && Array.isArray(json.data)) tasks = json.data;
      else if (Array.isArray(json.data?.tasks)) tasks = json.data.tasks;
      else if (Array.isArray(json)) tasks = json;
      else if (Array.isArray(json.tasks)) tasks = json.tasks;
      setAllTasks(tasks);
      const projectMap = new Map();
      tasks.forEach(t => {
        if (t.project) {
          const p = t.project;
          if (!projectMap.has(p.id)) projectMap.set(p.id, { ...p, _tasks: [] });
          projectMap.get(p.id)._tasks.push(t);
        }
      });
      const projectList = [...projectMap.values()];
      setProjects(projectList);
      if (projectList.length > 0 && !selectedProject) setSelectedProject(projectList[0].id);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const handleToggleComplete = taskId => {
    setCompletedIds(prev => { const next = new Set(prev); next.has(taskId) ? next.delete(taskId) : next.add(taskId); return next; });
  };
  const handleStatusChange = (taskId, newStatus) => {
    setAllTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    setProjects(prev => prev.map(p => ({ ...p, _tasks: (p._tasks || []).map(t => t.id === taskId ? { ...t, status: newStatus } : t) })));
    if (newStatus === "completed") setCompletedIds(prev => new Set([...prev, taskId]));
    else setCompletedIds(prev => { const next = new Set(prev); next.delete(taskId); return next; });
  };

  const currentProject = projects.find(p => p.id === selectedProject);
  const projectTasks = currentProject?._tasks ?? [];

  const filteredTasks = projectTasks.filter(t => {
    if (priorityFilter && t.priority !== priorityFilter) return false;
    if (statusFilter && t.status !== statusFilter) return false;
    if (search && !t.title?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const completedTasks = filteredTasks.filter(t => completedIds.has(t.id) || t.status === "completed");
  const pendingTasks = filteredTasks.filter(t => !completedIds.has(t.id) && t.status !== "completed");
  const inProgressTasks = filteredTasks.filter(t => t.status === "in_progress");
  const overdueTasks = filteredTasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== "completed");
  const visiblePending = pendingTasks.slice(0, visibleCount);
  const hasMore = pendingTasks.length > visibleCount;

  const totalDone = completedTasks.length;
  const totalAll = filteredTasks.length;
  const projectPct = totalAll > 0 ? Math.round((totalDone / totalAll) * 100) : 0;

  return (
    <div style={{ display: "flex", gap: 14, height: "100%", overflow: "hidden" }}>
      {/* LEFT PANEL — Projects */}
      <div style={{ width: 270, flexShrink: 0, overflowY: "auto", paddingBottom: 20 }}>
        {/* Panel header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <span style={{ fontSize: 10.5, fontWeight: 600, color: "var(--text-muted)", fontFamily: TOKENS.font.mono, textTransform: "uppercase", letterSpacing: "0.8px" }}>Projects</span>
          <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: TOKENS.font.mono }}>{projects.length} total</span>
        </div>

        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 50, gap: 8 }}>
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={theme.accent} strokeWidth={2} strokeLinecap="round" style={{ animation: "spin 0.8s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
            <span style={{ fontSize: 12, color: "var(--text-sub)", fontFamily: TOKENS.font.body }}>Loading…</span>
          </div>
        ) : error ? (
          <div style={{ background: "rgba(248,113,113,0.08)", borderRadius: TOKENS.radius.lg, padding: 16, color: "#f87171", fontSize: 12, border: "1px solid rgba(248,113,113,0.2)" }}>
            {error}
            <button onClick={fetchTasks} style={{ display: "block", marginTop: 8, fontSize: 11, color: theme.accent, background: "none", border: "none", cursor: "pointer", fontFamily: TOKENS.font.body }}>Retry ↺</button>
          </div>
        ) : projects.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40, color: "var(--text-muted)", fontSize: 12 }}>No projects found</div>
        ) : projects.map((p, idx) => (
          <ProjectCard key={p.id} project={p} isSelected={selectedProject === p.id} idx={idx}
            onClick={() => { setSelectedProject(p.id); setVisibleCount(12); setPriorityFilter(null); setStatusFilter(null); setSearch(""); }} />
        ))}
      </div>

      {/* RIGHT PANEL — Tasks */}
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 20, display: "flex", flexDirection: "column", gap: 14 }}>
        {!currentProject && !loading ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 300, color: "var(--text-muted)" }}>
            <Icon d={ICONS.folder} size={48} stroke="rgba(255,255,255,0.1)" />
            <p style={{ marginTop: 12, fontSize: 13, fontFamily: TOKENS.font.body }}>Select a project to view tasks</p>
          </div>
        ) : currentProject ? (
          <>
            {/* Project header */}
            <div className="glass" style={{ borderRadius: TOKENS.radius.xl, padding: "16px 20px", display: "flex", alignItems: "center", gap: 20, position: "relative", overflow: "hidden" }}>
              <div className="orb" style={{ width: 200, height: 200, background: `${projectColor(currentProject.id)}08`, top: -80, right: -50, animationDuration: "8s" }} />
              <ProgressRing pct={projectPct} size={60} color={projectColor(currentProject.id)} />
              <div style={{ flex: 1, position: "relative", zIndex: 1 }}>
                <div style={{ fontSize: 17, fontWeight: 700, color: "var(--text)", fontFamily: TOKENS.font.display, letterSpacing: "-0.3px", marginBottom: 4 }}>
                  {currentProject.project_name || currentProject.name}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  {[
                    { label: `${totalDone}/${totalAll} done`, color: "#4ade80" },
                    { label: `${inProgressTasks.length} active`, color: "#60a5fa" },
                    { label: overdueTasks.length > 0 ? `${overdueTasks.length} overdue` : "On track", color: overdueTasks.length > 0 ? "#f87171" : "#4ade80" },
                  ].map(({ label, color }, i) => (
                    <span key={i} style={{ fontSize: 11, color, fontFamily: TOKENS.font.mono, display: "flex", alignItems: "center", gap: 4 }}>
                      <div style={{ width: 5, height: 5, borderRadius: "50%", background: color, boxShadow: `0 0 6px ${color}` }} />
                      {label}
                    </span>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, position: "relative", zIndex: 1 }}>
                <button className="btn-ghost">
                  <Icon d={ICONS.export} size={12} />
                  Export
                </button>
                <button className="btn-accent">
                  <Icon d={ICONS.plus} size={13} stroke="#000" />
                  Add Task
                </button>
              </div>
            </div>

            {/* Mini stats */}
            <MiniStats total={totalAll} done={totalDone} inProgress={inProgressTasks.length} overdue={overdueTasks.length} />

            {/* Task list */}
            <div className="glass" style={{ borderRadius: TOKENS.radius.xl, overflow: "hidden", flex: 1 }}>
              {/* Filter toolbar */}
              <div style={{ padding: "12px 18px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 11.5, fontWeight: 600, color: "var(--text)", fontFamily: TOKENS.font.body, marginRight: 6 }}>Priority</span>
                  {[{ key: null, label: "All" }, { key: "high", label: "High" }, { key: "medium", label: "Medium" }, { key: "low", label: "Low" }].map(({ key, label }) => (
                    <button key={String(key)} className={`tab-pill ${priorityFilter === key ? "active" : ""}`} onClick={() => setPriorityFilter(key)}>{label}</button>
                  ))}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {/* Search tasks */}
                  <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", borderRadius: TOKENS.radius.md, padding: "5px 10px" }}
                    onFocusCapture={e => e.currentTarget.style.borderColor = `rgba(var(--accent-rgb),0.4)`}
                    onBlurCapture={e => e.currentTarget.style.borderColor = "var(--border)"}>
                    <Icon d={ICONS.search} stroke="var(--text-muted)" size={11} />
                    <input value={search} onChange={e => setSearch(e.target.value)}
                      style={{ background: "transparent", border: "none", color: "var(--text)", fontFamily: TOKENS.font.body, fontSize: 12, outline: "none", width: 120 }}
                      placeholder="Search tasks…" />
                  </div>
                  <button className="btn-ghost">
                    <Icon d={ICONS.calendar} size={12} />
                    Due Date
                  </button>
                  <select value={statusFilter || ""} onChange={e => setStatusFilter(e.target.value || null)} style={{ padding: "5px 28px 5px 10px" }}>
                    <option value="">All Status</option>
                    {Object.entries(STATUS_CFG).map(([key, sc]) => <option key={key} value={key}>{sc.label}</option>)}
                  </select>
                </div>
              </div>

              {/* Column headers */}
              <div style={{ display: "flex", alignItems: "center", padding: "8px 18px", background: "rgba(255,255,255,0.015)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <div style={{ width: 13 + 10 + 18 + 10 + 13 + 8, flexShrink: 0 }} />{/* grip + check + star spacer */}
                <div style={{ flex: 1, fontSize: 10, fontWeight: 600, color: "var(--text-muted)", fontFamily: TOKENS.font.mono, textTransform: "uppercase", letterSpacing: "0.6px" }}>Task</div>
                <div style={{ width: 80, fontSize: 10, fontWeight: 600, color: "var(--text-muted)", fontFamily: TOKENS.font.mono, textTransform: "uppercase", letterSpacing: "0.6px", marginRight: 14 }}>Due</div>
                <div style={{ width: 100, fontSize: 10, fontWeight: 600, color: "var(--text-muted)", fontFamily: TOKENS.font.mono, textTransform: "uppercase", letterSpacing: "0.6px", marginRight: 12 }}>Tags</div>
                <div style={{ width: 70, fontSize: 10, fontWeight: 600, color: "var(--text-muted)", fontFamily: TOKENS.font.mono, textTransform: "uppercase", letterSpacing: "0.6px", marginRight: 12 }}>Priority</div>
                <div style={{ width: 110, fontSize: 10, fontWeight: 600, color: "var(--text-muted)", fontFamily: TOKENS.font.mono, textTransform: "uppercase", letterSpacing: "0.6px", marginRight: 12 }}>Status</div>
                <div style={{ width: 70, fontSize: 10, fontWeight: 600, color: "var(--text-muted)", fontFamily: TOKENS.font.mono, textTransform: "uppercase", letterSpacing: "0.6px", marginRight: 10 }}>Assignee</div>
                <div style={{ width: 28 }} />
              </div>

              {/* Mark all */}
              <div style={{ padding: "8px 18px 8px", borderBottom: "1px solid rgba(255,255,255,0.04)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.01)" }}>
                <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: TOKENS.font.mono }}>{pendingTasks.length} pending · {completedTasks.length} completed</span>
                <button onClick={() => setCompletedIds(new Set([...completedIds, ...pendingTasks.map(t => t.id)]))}
                  style={{ display: "flex", alignItems: "center", gap: 5, background: "transparent", border: "none", fontSize: 11.5, color: "var(--text-sub)", cursor: "pointer", padding: "4px 8px", borderRadius: TOKENS.radius.md, fontFamily: TOKENS.font.body, transition: "all 0.12s ease" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "var(--text)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-sub)"; }}>
                  <Icon d={ICONS.check} size={12} stroke="var(--text-sub)" />
                  Mark all complete
                </button>
              </div>

              {/* Loading */}
              {loading ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 50, gap: 8 }}>
                  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={theme.accent} strokeWidth={2} strokeLinecap="round" style={{ animation: "spin 0.8s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
                  <span style={{ fontSize: 13, color: "var(--text-sub)", fontFamily: TOKENS.font.body }}>Loading tasks…</span>
                </div>
              ) : filteredTasks.length === 0 ? (
                <div style={{ textAlign: "center", padding: 60, color: "var(--text-muted)", fontSize: 13, fontFamily: TOKENS.font.body }}>
                  No tasks found{priorityFilter ? ` with ${priorityFilter} priority` : ""}
                </div>
              ) : (
                <>
                  {/* Pending tasks */}
                  {visiblePending.map((task, i) => (
                    <TaskRow key={task.id} task={task} idx={i} isCompleted={completedIds.has(task.id)} onStatusChange={handleStatusChange} onToggleComplete={handleToggleComplete} />
                  ))}

                  {/* Load more */}
                  {hasMore && (
                    <div style={{ padding: "14px 18px", display: "flex", justifyContent: "center", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <button className="btn-ghost" onClick={() => setVisibleCount(c => c + 12)} style={{ gap: 8 }}>
                        <Icon d={ICONS.refresh} size={12} />
                        Load {Math.min(12, pendingTasks.length - visibleCount)} more tasks
                      </button>
                    </div>
                  )}

                  {/* Completed section */}
                  {completedTasks.length > 0 && (
                    <div>
                      <button onClick={() => setShowCompleted(s => !s)}
                        style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", background: "rgba(74,222,128,0.04)", borderTop: "1px solid rgba(255,255,255,0.04)", borderBottom: showCompleted ? "1px solid rgba(255,255,255,0.04)" : "none", width: "100%", border: "none", cursor: "pointer", transition: "background 0.15s ease" }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(74,222,128,0.07)"}
                        onMouseLeave={e => e.currentTarget.style.background = "rgba(74,222,128,0.04)"}>
                        <div style={{ width: 16, height: 16, borderRadius: "50%", background: "rgba(74,222,128,0.15)", border: "1px solid rgba(74,222,128,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Icon d={ICONS.check} size={9} stroke="#4ade80" sw={2.5} />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 600, color: "#4ade80", fontFamily: TOKENS.font.mono, letterSpacing: "0.4px" }}>COMPLETED · {completedTasks.length}</span>
                        <Icon d={ICONS.chevDown} size={12} stroke="#4ade80" style={{ marginLeft: "auto", transform: showCompleted ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s ease" }} />
                      </button>
                      {showCompleted && completedTasks.map((task, i) => (
                        <TaskRow key={task.id} task={task} idx={i} isCompleted={true} onStatusChange={handleStatusChange} onToggleComplete={handleToggleComplete} />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SETTINGS PANEL
// ─────────────────────────────────────────────────────────────────────────────
const PRESETS = [
  { name: "Emerald", accent: "#6ee7b7", accentRgb: "110,231,183", accentDark: "#34d399" },
  { name: "Blue",    accent: "#60a5fa", accentRgb: "96,165,250",  accentDark: "#3b82f6" },
  { name: "Purple",  accent: "#c084fc", accentRgb: "192,132,252", accentDark: "#a855f7" },
  { name: "Pink",    accent: "#f472b6", accentRgb: "244,114,182", accentDark: "#ec4899" },
  { name: "Orange",  accent: "#fb923c", accentRgb: "251,146,60",  accentDark: "#f97316" },
  { name: "Cyan",    accent: "#22d3ee", accentRgb: "34,211,238",  accentDark: "#06b6d4" },
  { name: "Lime",    accent: "#a3e635", accentRgb: "163,230,53",  accentDark: "#84cc16" },
  { name: "Rose",    accent: "#fb7185", accentRgb: "251,113,133", accentDark: "#f43f5e" },
];

function SettingsPanel() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(o => !o)}
        style={{ position: "fixed", bottom: 24, right: 24, width: 44, height: 44, borderRadius: "50%", background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentDark})`, border: "none", boxShadow: `0 4px 20px rgba(var(--accent-rgb),0.5)`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 1000, transition: "box-shadow 0.2s ease" }}>
        <Icon d={ICONS.settings} stroke="#000" size={18} style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.3s ease" }} />
      </button>
      {open && (
        <div style={{ position: "fixed", bottom: 78, right: 24, width: 280, background: "rgba(8,8,16,0.97)", borderRadius: TOKENS.radius.xl, border: "1px solid var(--border-hover)", boxShadow: "0 24px 60px rgba(0,0,0,0.7)", zIndex: 1000, overflow: "hidden", backdropFilter: "blur(24px)", animation: "fadeUp 0.2s ease" }}>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", fontFamily: TOKENS.font.display }}>Appearance</div>
              <div style={{ fontSize: 10.5, color: "var(--text-sub)", fontFamily: TOKENS.font.mono, marginTop: 1 }}>Accent Color</div>
            </div>
            <button className="btn-ghost" onClick={() => setTheme(DEFAULT_THEME)} style={{ fontSize: 10.5, padding: "3px 8px" }}>Reset</button>
          </div>
          <div style={{ padding: "14px 16px" }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {PRESETS.map(p => (
                <button key={p.name} title={p.name} onClick={() => setTheme({ accent: p.accent, accentRgb: p.accentRgb, accentDark: p.accentDark, pageBgGrad: `radial-gradient(ellipse 80% 50% at 20% 10%, rgba(${p.accentRgb},0.06) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 90%, rgba(59,130,246,0.06) 0%, transparent 50%), #080810` })}
                  style={{ width: 30, height: 30, borderRadius: "50%", background: p.accent, border: theme.accent === p.accent ? "3px solid #fff" : "3px solid transparent", cursor: "pointer", transition: "all 0.15s ease", boxShadow: theme.accent === p.accent ? `0 0 12px ${p.accent}88` : "none" }} />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
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
    if (requiredRole && role !== requiredRole) router.replace(role === "admin" ? "/Admin/Dashboard" : "/Employee/Dashboard");
    else setIsAuthorized(true);
  }, [requiredRole, router]);
  if (!isAuthorized) return null;
  return children;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────────────────────
export default function EmployeeTasksPage() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);

  const navigate = page => {
    if (page === null) router.push("/Employee/Dashboard");
    else if (page === "projects") router.push("/Employee/Projects");
    else if (page === "tasks") router.push("/Employee/Tasks");
    else router.push(`/Employee/Dashboard?page=${page}`);
  };

  useEffect(() => {
    fetch(`${BASE}/api/employee/profile`, { headers: HEADERS() })
      .then(r => r.json()).then(json => { if (json.success) setProfile(json.data); })
      .catch(console.error);
  }, []);

  const emp = profile?.employee;
  const fullName = emp ? `${emp.firstname} ${emp.lastname}` : "Employee";
  const designation = profile?.designation?.name ?? "Employee";

  return (
    <ThemeProvider>
      <ProtectedRoute requiredRole="employee">
        <InnerLayout navigate={navigate} fullName={fullName} designation={designation}>
          <TasksPage />
        </InnerLayout>
        <SettingsPanel />
      </ProtectedRoute>
    </ThemeProvider>
  );
}

function InnerLayout({ navigate, fullName, designation, children }) {
  const { theme } = useTheme();
  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: TOKENS.font.body, background: theme.pageBgGrad || theme.pageBg, color: theme.text, overflow: "hidden", position: "relative" }}>
      {/* Ambient orbs */}
      <div className="orb" style={{ width: 500, height: 500, background: `rgba(var(--accent-rgb),0.04)`, top: "-15%", left: "20%", animationDuration: "12s", position: "fixed", zIndex: 0 }} />
      <div className="orb" style={{ width: 350, height: 350, background: "rgba(96,165,250,0.04)", bottom: "5%", right: "15%", animationDuration: "9s", animationDelay: "4s", position: "fixed", zIndex: 0 }} />

      <Sidebar activePage="tasks" onNavigate={navigate} fullName={fullName} designation={designation} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", height: "100vh", position: "relative", zIndex: 1 }}>
        <Topbar fullName={fullName} />

        {/* Page header */}
        <div style={{ background: "rgba(255,255,255,0.015)", borderBottom: `1px solid ${theme.border}`, padding: "12px 22px", flexShrink: 0, backdropFilter: "blur(10px)" }}>
          <div className="fade-up" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <button onClick={() => navigate(null)} style={{ background: "none", border: "none", cursor: "pointer", color: theme.accent, fontSize: 11, fontFamily: TOKENS.font.mono, padding: 0 }}>Dashboard</button>
                <Icon d={ICONS.chevRight} size={10} stroke="var(--text-muted)" />
                <button onClick={() => navigate("projects")} style={{ background: "none", border: "none", cursor: "pointer", color: theme.accent, fontSize: 11, fontFamily: TOKENS.font.mono, padding: 0 }}>Projects</button>
                <Icon d={ICONS.chevRight} size={10} stroke="var(--text-muted)" />
                <span style={{ fontSize: 11, color: "var(--text-sub)", fontFamily: TOKENS.font.mono }}>Tasks</span>
              </div>
              <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: theme.text, fontFamily: TOKENS.font.display, letterSpacing: "-0.4px" }}>Tasks</h1>
            </div>
            <div className="fade-up-1" style={{ display: "flex", gap: 8 }}>
              <button className="btn-ghost">
                <Icon d={ICONS.filter} size={12} />
                Filter
              </button>
              <button className="btn-accent">
                <Icon d={ICONS.plus} size={13} stroke="#000" />
                Add Task
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="fade-up-2" style={{ flex: 1, overflowY: "auto", padding: "16px 22px" }}>
          {children}
        </div>
      </div>
    </div>
  );
}