"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import {
  Activity, Search, Download, RefreshCw,
  Monitor, Globe, Clock,
  Users, Eye, MoreVertical, ArrowUpRight, ArrowDownRight,
  AlertCircle, XCircle, Pause, Play,
  Code2, MessageSquare, Mail, FileText, Video,
  Music, Image as ImageIcon, Terminal, Database,
  Coffee, Briefcase, Target, Award, Flame,
  Grid3x3, List,
  ArrowUp, ArrowDown, Minus, WifiOff,
  Circle, CircleDot,
  ChevronRight, X,
  Sparkles,
  Layers,
  AlertTriangle,
} from "lucide-react";

// ─── API ───────────────────────────────────────────────────────────────────
const API_BASE = "https://api.pencilkraft.in/api/admin/activity/dashboard";

const PERIOD_MAP = { Today: "day", Yesterday: "day", Week: "week", Month: "month", Year: "year" };

function buildUrl(dateRange, deptId, status, year) {
  const now = new Date();
  const y = year || now.getFullYear();
  let month = now.getMonth() + 1;
  if (dateRange === "Yesterday") {
    const yd = new Date(now);
    yd.setDate(yd.getDate() - 1);
    month = yd.getMonth() + 1;
  }
  const dept = (!deptId || deptId === "all") ? 0 : deptId;
  const base =
    `${API_BASE}` +
    `?period=${PERIOD_MAP[dateRange] || "day"}` +
    `&year=${y}` +
    `&status=${status}` +
    `&department_id=${dept}`;
  return dateRange === "Year" ? base : `${base}&month=${month}`;
}

const DEPT_URL =
  `${API_BASE}?period=day&year=${new Date().getFullYear()}&month=${new Date().getMonth() + 1}&status=all&department_id=0`;

// Read auth token from localStorage — tries both key names
function getAuthToken() {
  try {
    return (
      localStorage.getItem("admin_auth_token")
    );
  } catch {
    return "";
  }
}

// ─── HELPERS ───────────────────────────────────────────────────────────────
const STATUS = {
  Active:  { label: "Active",    color: "#22c55e", bg: "#dcfce7", dot: "#22c55e", Icon: CircleDot },
  Idle:    { label: "Idle",      color: "#eab308", bg: "#fef9c3", dot: "#eab308", Icon: Circle    },
  Break:   { label: "On Break",  color: "#f97316", bg: "#ffedd5", dot: "#f97316", Icon: Pause     },
  Offline: { label: "Offline",   color: "#94a3b8", bg: "#f1f5f9", dot: "#94a3b8", Icon: XCircle   },
};
const getStatus = (s = "") =>
  STATUS[s] || STATUS[s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()] || STATUS.Offline;

const CAT = {
  productive:  { label: "Productive",  color: "#22c55e", bg: "#dcfce7" },
  neutral:     { label: "Neutral",     color: "#3b82f6", bg: "#dbeafe" },
  distracting: { label: "Distracting", color: "#ef4444", bg: "#fee2e2" },
};

const AVATAR_COLORS = [
  "#6366f1","#14b8a6","#f97316","#ec4899","#8b5cf6",
  "#22c55e","#0ea5e9","#ef4444","#eab308","#84cc16",
];
const avatarColor = (id) => AVATAR_COLORS[(id || 0) % AVATAR_COLORS.length];
const initials = (name = "") =>
  name.split(" ").map((p) => p[0] || "").join("").toUpperCase().slice(0, 2);

const fmtHours = (h = 0) =>
  `${Math.floor(h)}h ${Math.round((h % 1) * 60)}m`;

// ─── SMALL COMPONENTS ──────────────────────────────────────────────────────
const Skel = ({ className = "" }) => (
  <div className={`animate-pulse bg-gray-200 rounded-xl ${className}`} />
);

const ProdBadge = ({ value }) => {
  let color = "#22c55e", bg = "#dcfce7", Icon = ArrowUp;
  if (value === 0) { color = "#94a3b8"; bg = "#f1f5f9"; Icon = Minus; }
  else if (value < 50) { color = "#ef4444"; bg = "#fee2e2"; Icon = ArrowDown; }
  else if (value < 70) { color = "#eab308"; bg = "#fef9c3"; Icon = Minus; }
  return (
    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold"
      style={{ color, backgroundColor: bg }}>
      <Icon size={9} strokeWidth={3} />{value}%
    </span>
  );
};

const ErrorBanner = ({ message, url, onRetry }) => (
  <div className="flex items-start justify-between gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-2xl">
    <div className="flex items-start gap-2 min-w-0">
      <AlertTriangle size={15} className="text-red-500 shrink-0 mt-0.5" />
      <div className="min-w-0">
        <p className="text-sm font-semibold text-red-700">{message}</p>
        {url && <p className="text-[11px] text-red-400 font-mono truncate mt-0.5">{url}</p>}
      </div>
    </div>
    <button onClick={onRetry}
      className="text-[11px] font-bold px-3 py-1 bg-red-100 hover:bg-red-200 rounded-lg shrink-0 text-red-700">
      Retry
    </button>
  </div>
);

// ─── KPI CARD ──────────────────────────────────────────────────────────────
const KpiCard = ({ Icon, label, value, sub, change, up, color }) => (
  <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all">
    <div className="flex items-start justify-between mb-4">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center"
        style={{ backgroundColor: `${color}18` }}>
        <Icon size={20} style={{ color }} strokeWidth={1.8} />
      </div>
      {change != null && (
        <span className={`flex items-center gap-0.5 text-[11px] font-bold px-2 py-1 rounded-lg
          ${up ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}>
          {up ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
          {change}
        </span>
      )}
    </div>
    <p className="text-[11px] text-gray-400 font-medium mb-1">{label}</p>
    <div className="flex items-baseline gap-1.5">
      <p className="text-2xl font-bold text-gray-800">{value}</p>
      {sub && <p className="text-xs text-gray-400">{sub}</p>}
    </div>
  </div>
);

// ─── ACTIVITY TIMELINE ─────────────────────────────────────────────────────
const ActivityTimeline = ({ events = [] }) => {
  const feed = useMemo(() => {
    const seen = new Set();
    return events.filter((e) => {
      if (seen.has(e.employee_name)) return false;
      seen.add(e.employee_name);
      return true;
    }).slice(0, 8);
  }, [events]);

  const bars = useMemo(() => {
    const buckets = {};
    events.forEach((e) => {
      const h = new Date(e.timestamp).getHours();
      buckets[h] = (buckets[h] || 0) + 1;
    });
    return Array.from({ length: 10 }, (_, i) => {
      const h = i + 9;
      return { label: h <= 12 ? `${h}am` : `${h - 12}pm`, count: buckets[h] || 0 };
    });
  }, [events]);

  const maxBar = Math.max(...bars.map((b) => b.count), 1);

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-gray-800">Activity Timeline</h3>
          <p className="text-[11px] text-gray-400 mt-0.5">Live feed — recent app usage</p>
        </div>
        <div className="flex items-center gap-3">
          {Object.entries(CAT).map(([k, c]) => (
            <div key={k} className="flex items-center gap-1.5 text-[10px] text-gray-500">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
              {c.label}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-end gap-1.5 h-28 mb-4">
        {bars.map((b, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
            <div className="w-full relative rounded-t-md overflow-hidden bg-gray-50 h-20 flex flex-col-reverse">
              <div className="bg-blue-400 transition-all duration-500"
                style={{ height: `${(b.count / maxBar) * 100}%` }} />
              {b.count > 0 && (
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-800 text-white
                  text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity
                  whitespace-nowrap pointer-events-none">
                  {b.count}
                </div>
              )}
            </div>
            <span className="text-[9px] font-semibold text-gray-400">{b.label}</span>
          </div>
        ))}
      </div>

      <div className="divide-y divide-gray-50">
        {feed.length === 0
          ? <p className="text-xs text-gray-400 text-center py-4">No recent activity</p>
          : feed.map((ev, i) => (
            <div key={i} className="flex items-center gap-3 py-2">
              <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                <Activity size={12} className="text-blue-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-gray-700 truncate">
                  <span className="font-bold">{ev.employee_name}</span>
                  <span className="text-gray-400"> — {ev.action}</span>
                </p>
              </div>
              <span className="text-[10px] text-gray-400 shrink-0">{ev.time}</span>
            </div>
          ))}
      </div>
    </div>
  );
};

// ─── PRODUCTIVITY DONUT ────────────────────────────────────────────────────
const ProductivityDonut = ({ productive = 0, neutral = 0, distracting = 0 }) => {
  const total = productive + neutral + distracting || 1;
  const segs = [
    { color: "#22c55e", pct: (productive  / total) * 100, label: "Productive"  },
    { color: "#3b82f6", pct: (neutral     / total) * 100, label: "Neutral"     },
    { color: "#ef4444", pct: (distracting / total) * 100, label: "Distracting" },
  ];
  const r = 65, cx = 85, cy = 85, sw = 24, circ = 2 * Math.PI * r;
  let cum = 0;

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-bold text-gray-800">App Categories</h3>
          <p className="text-[11px] text-gray-400 mt-0.5">Time distribution today</p>
        </div>
        <MoreVertical size={15} className="text-gray-300" />
      </div>
      <div className="flex flex-col items-center">
        <svg width={170} height={170} viewBox="0 0 170 170">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth={sw} />
          {segs.map((s, i) => {
            const off  = circ * (1 - cum / 100);
            const dash = circ * (s.pct / 100);
            cum += s.pct;
            return (
              <circle key={i} cx={cx} cy={cy} r={r} fill="none"
                stroke={s.pct > 0 ? s.color : "transparent"}
                strokeWidth={sw}
                strokeDasharray={`${dash} ${circ - dash}`}
                strokeDashoffset={off}
                strokeLinecap="butt"
                style={{ transform: "rotate(-90deg)", transformOrigin: `${cx}px ${cy}px` }} />
            );
          })}
          <text x={cx} y={cy - 5} textAnchor="middle" fontSize={20} fontWeight="800" fill="#1e293b">
            {Math.round(segs[0].pct)}%
          </text>
          <text x={cx} y={cy + 13} textAnchor="middle" fontSize={10} fill="#94a3b8">Productive</text>
        </svg>
        <div className="w-full space-y-2 mt-2">
          {segs.map((s) => (
            <div key={s.label} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                <span className="text-xs text-gray-600">{s.label}</span>
              </div>
              <span className="text-xs font-bold text-gray-800">{Math.round(s.pct)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── TOP APPS ──────────────────────────────────────────────────────────────
const APP_ICONS = {
  "google chrome": Globe,  "chrome": Globe,
  "microsoft word": FileText, "word": FileText, "notion": FileText,
  "postman": Database,
  "visual studio code": Code2, "vs code": Code2,
  "whatsapp": MessageSquare, "slack": MessageSquare,
  "figma": Layers,
  "gmail": Mail,
  "youtube": Video,
  "spotify": Music,
  "terminal": Terminal,
  "instagram": ImageIcon,
};

const getAppIcon = (name = "") => {
  const lc = name.toLowerCase();
  for (const [key, Icon] of Object.entries(APP_ICONS)) {
    if (lc.includes(key)) return Icon;
  }
  return Globe;
};

const getAppCat = (name = "") => {
  const lc = name.toLowerCase();
  if (["youtube","instagram","facebook","twitter","spotify","whatsapp","tiktok"].some((d) => lc.includes(d)))
    return "distracting";
  if (["chrome","edge","firefox","safari"].some((n) => lc.includes(n)))
    return "neutral";
  return "productive";
};

const TopApps = ({ apps = [] }) => {
  const max = apps[0]?.count || 1;
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-gray-800">Top Applications</h3>
          <p className="text-[11px] text-gray-400 mt-0.5">Most used apps team-wide</p>
        </div>
        <button className="text-[11px] font-semibold text-orange-500 hover:underline">View all</button>
      </div>
      <div className="space-y-3">
        {apps.length === 0
          ? <p className="text-xs text-gray-400 text-center py-6">No app data available</p>
          : apps.map((app, i) => {
            const Icon = getAppIcon(app.name);
            const cat  = CAT[getAppCat(app.name)];
            const pct  = Math.round((app.count / max) * 100);
            return (
              <div key={i} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: cat.bg }}>
                  <Icon size={15} style={{ color: cat.color }} strokeWidth={1.8} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-gray-700 truncate">{app.name}</span>
                    <span className="text-[11px] font-bold text-gray-500 ml-2 shrink-0">
                      {app.count.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: cat.color }} />
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

// ─── EMPLOYEE CARD ─────────────────────────────────────────────────────────
const EmployeeCard = ({ emp, onClick }) => {
  const st   = getStatus(emp.status);
  const prod = Math.round(emp.productivity || 0);
  const bg   = avatarColor(emp.employee_id);
  const ini  = initials(emp.name);
  const time = fmtHours(emp.worked_hours);

  return (
    <div onClick={onClick}
      className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md
        hover:border-orange-200 transition-all cursor-pointer group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white text-sm font-bold"
              style={{ backgroundColor: bg }}>{ini}</div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white"
              style={{ backgroundColor: st.dot }} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-800 truncate">{emp.name}</p>
            <p className="text-[11px] text-gray-400 truncate">{emp.designation}</p>
          </div>
        </div>
        <MoreVertical size={14} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      <div className="flex items-center gap-2 mb-4">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
          style={{ color: st.color, backgroundColor: st.bg }}>
          <st.Icon size={9} strokeWidth={2.5} />{st.label}
        </span>
        <ProdBadge value={prod} />
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-gray-50 rounded-lg p-2 text-center">
          <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-wide">Worked</p>
          <p className="text-xs font-bold text-gray-800 mt-0.5">{time}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-2 text-center">
          <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-wide">Productivity</p>
          <p className="text-xs font-bold text-gray-800 mt-0.5">{prod}%</p>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] text-gray-500 font-semibold">Productivity</span>
          <span className="text-[11px] font-bold text-gray-700">{prod}/100</span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-orange-400 to-pink-500 transition-all"
            style={{ width: `${Math.min(prod, 100)}%` }} />
        </div>
      </div>
    </div>
  );
};

// ─── EMPLOYEE ROW ──────────────────────────────────────────────────────────
const EmployeeRow = ({ emp, onClick }) => {
  const st   = getStatus(emp.status);
  const prod = Math.round(emp.productivity || 0);
  return (
    <tr onClick={onClick}
      className="hover:bg-orange-50/50 cursor-pointer transition-colors group border-b border-gray-50 last:border-0">
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold"
              style={{ backgroundColor: avatarColor(emp.employee_id) }}>{initials(emp.name)}</div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white"
              style={{ backgroundColor: st.dot }} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-800">{emp.name}</p>
            <p className="text-[10px] text-gray-400">{emp.designation}</p>
          </div>
        </div>
      </td>
      <td className="py-3 px-4">
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold"
          style={{ color: st.color, backgroundColor: st.bg }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: st.dot }} />
          {st.label}
        </span>
      </td>
      <td className="py-3 px-4"><ProdBadge value={prod} /></td>
      <td className="py-3 px-4 text-xs font-semibold text-gray-700">{fmtHours(emp.worked_hours)}</td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-orange-400 to-pink-500"
              style={{ width: `${Math.min(prod, 100)}%` }} />
          </div>
          <span className="text-[10px] font-bold text-gray-600">{prod}</span>
        </div>
      </td>
      <td className="py-3 px-4">
        <button className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400
          hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-all">
          <ChevronRight size={14} />
        </button>
      </td>
    </tr>
  );
};

// ─── DRAWER ────────────────────────────────────────────────────────────────
const Drawer = ({ emp, onClose }) => {
  if (!emp) return null;
  const st   = getStatus(emp.status);
  const prod = Math.round(emp.productivity || 0);
  const bg   = avatarColor(emp.employee_id);

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
        onClick={onClose} style={{ animation: "fdIn .2s ease" }} />
      <div className="fixed top-0 right-0 h-full z-50 w-[420px] bg-white shadow-2xl flex flex-col"
        style={{ animation: "slIn .25s cubic-bezier(.4,0,.2,1)" }}>
        <style>{`
          @keyframes slIn { from { opacity:0; transform:translateX(32px) } to { opacity:1; transform:translateX(0) } }
          @keyframes fdIn { from { opacity:0 } to { opacity:1 } }
        `}</style>

        <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-br from-orange-50 to-pink-50">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-lg font-bold shadow-sm"
                  style={{ backgroundColor: bg }}>{initials(emp.name)}</div>
                <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white"
                  style={{ backgroundColor: st.dot }} />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-800">{emp.name}</h3>
                <p className="text-xs text-gray-500">{emp.designation}</p>
                <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold"
                  style={{ color: st.color, backgroundColor: st.bg }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: st.dot }} />
                  {st.label}
                </span>
              </div>
            </div>
            <button onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:bg-white/80">
              <X size={15} />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white/70 rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-gray-800">{prod}%</p>
              <p className="text-[10px] text-gray-500 font-medium">Productivity</p>
            </div>
            <div className="bg-white/70 rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-gray-800">{fmtHours(emp.worked_hours)}</p>
              <p className="text-[10px] text-gray-500 font-medium">Worked Hours</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Employee ID</p>
            <div className="bg-gray-50 rounded-xl p-3 text-sm font-mono text-gray-600">#{emp.employee_id}</div>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Productivity Score</p>
            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-orange-400 to-pink-500"
                style={{ width: `${Math.min(prod, 100)}%` }} />
            </div>
            <p className="text-right text-xs font-bold text-gray-600 mt-1">{prod} / 100</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-[10px] text-gray-400 font-semibold uppercase mb-1">Designation</p>
              <p className="text-xs font-bold text-gray-700">{emp.designation}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-[10px] text-gray-400 font-semibold uppercase mb-1">Status</p>
              <p className="text-xs font-bold text-gray-700">{st.label}</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex gap-2">
          <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-500
            text-white rounded-xl text-xs font-bold hover:bg-orange-600 transition-colors">
            <Eye size={13} /> View Full Profile
          </button>
          <button className="px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-xs
            font-bold hover:bg-gray-50">
            <MessageSquare size={13} />
          </button>
        </div>
      </div>
    </>
  );
};

// ─── MAIN PAGE ─────────────────────────────────────────────────────────────
export default function ActivityPage() {
  const [view,         setView]         = useState("grid");
  const [dateRange,    setDateRange]    = useState("Today");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDept,   setFilterDept]   = useState("all");
  const [departments,  setDepartments]  = useState([]);
  const [search,       setSearch]       = useState("");
  const [selectedEmp,  setSelectedEmp]  = useState(null);

  const [apiData,   setApiData]   = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState(null);
  const [lastUrl,   setLastUrl]   = useState("");

  const fetchId = useRef(0);

  // Pre-fetch all departments on mount so dropdown is populated immediately
  useEffect(() => {
    const token = getAuthToken();
    const headers = { "Content-Type": "application/json", "Accept": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    fetch(DEPT_URL, { headers })
      .then((r) => r.json())
      .then((json) => {
        if (json?.departments?.length) setDepartments(json.departments);
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const runFetch = (dr, dept, status, yr) => {
    const id    = ++fetchId.current;
    const url   = buildUrl(dr, dept, status, yr || selectedYear);
    const token = getAuthToken();

    setLastUrl(url);
    setLoading(true);
    setError(null);

    const headers = {
      "Content-Type": "application/json",
      "Accept": "application/json",
    };

    // Attach Bearer token if available
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    fetch(url, { headers })
      .then((res) => {
        if (id !== fetchId.current) return;
        if (!res.ok) {
          return res.json().catch(() => null).then((body) => {
            throw new Error(body?.message || `HTTP ${res.status}`);
          });
        }
        return res.json();
      })
      .then((json) => {
        if (!json || id !== fetchId.current) return;
        if (!json.success) throw new Error(json.message || "API error");
        setApiData(json);
        if (json.departments?.length) setDepartments(json.departments);
      })
      .catch((err) => {
        if (id !== fetchId.current) return;
        setError(err.message || "Request failed");
      })
      .finally(() => {
        if (id !== fetchId.current) return;
        setLoading(false);
      });
  };

  useEffect(() => {
    runFetch(dateRange, filterDept, filterStatus, selectedYear);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange, filterDept, filterStatus, selectedYear]);

  // ── Derived ──────────────────────────────────────────────────────────────
  const teamActivity = useMemo(() => {
    if (!apiData?.team_activity) return [];
    return apiData.team_activity.filter((e) => {
      const q = search.toLowerCase();
      const matchQ = !q || e.name.toLowerCase().includes(q) || e.designation.toLowerCase().includes(q);
      const matchS = filterStatus === "all" || e.status.toLowerCase() === filterStatus.toLowerCase();
      return matchQ && matchS;
    });
  }, [apiData, search, filterStatus]);

  const cards      = apiData?.cards             || {};
  const topApps    = apiData?.top_applications  || [];
  const appCats    = apiData?.app_categories    || { productive: 0, neutral: 0, distracting: 0 };
  const timeline   = apiData?.activity_timeline || [];
  const insights   = apiData?.insights          || {};
  const total      = apiData?.team_activity?.length || 0;
  const activeNow  = cards.active_now    ?? 0;
  const idleCount  = cards.idle          ?? 0;
  const avgProd    = Math.round(cards.avg_productivity ?? 0);
  const activePct  = cards.active_percent ?? 0;
  const offline    = Math.max(0, total - activeNow - idleCount);

  return (
    <div className="space-y-5">

      {error && (
        <ErrorBanner
          message={error}
          url={lastUrl}
          onRetry={() => runFetch(dateRange, filterDept, filterStatus, selectedYear)}
        />
      )}

      {/* ── Toolbar ── */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px] flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2
          border border-gray-200 focus-within:border-orange-300 transition-colors">
          <Search size={14} className="text-gray-400 shrink-0" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search employees, roles…"
            className="bg-transparent text-xs outline-none text-gray-700 w-full placeholder:text-gray-400" />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-gray-50 rounded-xl p-1 border border-gray-200">
            {["Today","Yesterday","Week","Month","Year"].map((d) => (
              <button key={d} onClick={() => setDateRange(d)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all
                  ${dateRange === d ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
                {d}
              </button>
            ))}
          </div>
          {/* Year picker — only visible when Year tab is active */}
          {dateRange === "Year" && (
            <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="text-xs px-3 py-2 border border-orange-300 rounded-xl bg-white text-gray-700
                font-bold outline-none cursor-pointer focus:ring-2 focus:ring-orange-200">
              {Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          )}
        </div>

        <div className="flex items-center gap-2">
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs px-3 py-2 border border-gray-200 rounded-xl bg-white text-gray-600
              font-medium outline-none cursor-pointer hover:border-orange-300">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="idle">Idle</option>
          </select>

          <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)}
            className="text-xs px-3 py-2 border border-gray-200 rounded-xl bg-white text-gray-600
              font-medium outline-none cursor-pointer hover:border-orange-300">
            <option value="all">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={String(d.id)}>{d.name}</option>
            ))}
          </select>

          <div className="flex items-center bg-gray-50 rounded-xl p-1 border border-gray-200">
            <button onClick={() => setView("grid")}
              className={`w-8 h-7 rounded-lg flex items-center justify-center transition-all
                ${view === "grid" ? "bg-white text-orange-500 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}>
              <Grid3x3 size={13} />
            </button>
            <button onClick={() => setView("list")}
              className={`w-8 h-7 rounded-lg flex items-center justify-center transition-all
                ${view === "list" ? "bg-white text-orange-500 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}>
              <List size={13} />
            </button>
          </div>

          <button onClick={() => runFetch(dateRange, filterDept, filterStatus, selectedYear)} disabled={loading}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-500
              border border-gray-200 hover:bg-gray-50 disabled:opacity-40">
            <RefreshCw size={13} className={loading ? "animate-spin text-orange-500" : ""} />
          </button>

          <button className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-xl
            text-xs font-semibold text-gray-600 hover:bg-gray-50">
            <Download size={13} /> Export
          </button>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      {loading && !apiData ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-3">
              <Skel className="h-11 w-11" /><Skel className="h-3 w-20" /><Skel className="h-7 w-16" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard Icon={Users}  label="Active Now"       value={activeNow} sub={`/ ${total}`}
            change={`${activePct}%`} up color="#22c55e" />
          <KpiCard Icon={Pause}  label="Idle"             value={idleCount} sub={`/ ${total}`}
            color="#eab308" />
          <KpiCard Icon={Target} label="Avg Productivity" value={`${avgProd}%`}
            color="#f97316" />
          <KpiCard Icon={WifiOff} label="Offline"         value={offline} sub={`/ ${total}`}
            color="#94a3b8" />
        </div>
      )}

      {/* ── Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          {loading && !apiData
            ? <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm"><Skel className="h-64 w-full" /></div>
            : <ActivityTimeline events={timeline} />}
        </div>
        {loading && !apiData
          ? <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm"><Skel className="h-64 w-full" /></div>
          : <ProductivityDonut productive={appCats.productive} neutral={appCats.neutral} distracting={appCats.distracting} />}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {loading && !apiData
          ? <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm"><Skel className="h-56 w-full" /></div>
          : <TopApps apps={topApps} />}

        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={14} className="text-orange-500" />
            <div>
              <h3 className="text-sm font-bold text-gray-800">Insights &amp; Highlights</h3>
              <p className="text-[11px] text-gray-400">Highlights from the selected period</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {insights.top_performer && (
              <div className="flex gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-all">
                <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                  <Award size={15} className="text-green-500" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-800 mb-0.5">Top Performer</p>
                  <p className="text-[11px] text-gray-500">
                    {insights.top_performer.name} — {insights.top_performer.productivity}% productivity
                  </p>
                </div>
              </div>
            )}
            {idleCount > 0 && (
              <div className="flex gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-all">
                <div className="w-9 h-9 rounded-xl bg-yellow-50 flex items-center justify-center shrink-0">
                  <AlertCircle size={15} className="text-yellow-500" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-800 mb-0.5">Idle Employees</p>
                  <p className="text-[11px] text-gray-500">
                    {idleCount} employee{idleCount !== 1 ? "s" : ""} idle — consider a check-in.
                  </p>
                </div>
              </div>
            )}
            {appCats.neutral > 0 && (
              <div className="flex gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-all">
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                  <Activity size={15} className="text-blue-500" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-800 mb-0.5">Neutral App Usage</p>
                  <p className="text-[11px] text-gray-500">
                    {appCats.neutral.toLocaleString()} events in neutral apps this period.
                  </p>
                </div>
              </div>
            )}
            {topApps[0] && (
              <div className="flex gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-all">
                <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                  <Flame size={15} className="text-orange-500" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-800 mb-0.5">Most Used App</p>
                  <p className="text-[11px] text-gray-500">
                    {topApps[0].name} — {topApps[0].count.toLocaleString()} events.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Team Activity ── */}
      <div>
        <div className="mb-4">
          <h3 className="text-base font-bold text-gray-800">Team Activity</h3>
          <p className="text-[11px] text-gray-400 mt-0.5">
            {loading ? "Loading…" : `${teamActivity.length} of ${total} employees shown`}
          </p>
        </div>

        {loading && !apiData ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <Skel className="h-36 w-full" />
              </div>
            ))}
          </div>
        ) : view === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
            {teamActivity.map((emp) => (
              <EmployeeCard key={emp.employee_id} emp={emp} onClick={() => setSelectedEmp(emp)} />
            ))}
            {teamActivity.length === 0 && (
              <div className="col-span-full text-center py-16 bg-white rounded-2xl border border-gray-100">
                <Users size={32} className="mx-auto text-gray-200 mb-2" />
                <p className="text-sm text-gray-400 font-medium">No employees match your filters</p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {["Employee","Status","Productivity","Worked","Focus",""].map((h) => (
                      <th key={h} className="text-left text-[10px] font-bold text-gray-400
                        uppercase tracking-widest py-3 px-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {teamActivity.map((emp) => (
                    <EmployeeRow key={emp.employee_id} emp={emp} onClick={() => setSelectedEmp(emp)} />
                  ))}
                </tbody>
              </table>
            </div>
            {teamActivity.length === 0 && (
              <div className="text-center py-12">
                <Users size={28} className="mx-auto text-gray-200 mb-2" />
                <p className="text-sm text-gray-400">No employees match your filters</p>
              </div>
            )}
          </div>
        )}
      </div>

      <Drawer emp={selectedEmp} onClose={() => setSelectedEmp(null)} />
    </div>
  );
}