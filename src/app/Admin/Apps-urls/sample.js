"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Search, Globe, Clock, RefreshCw, ChevronLeft,
  ChevronRight, Filter, ExternalLink, Wifi, AlertCircle,
  BarChart2, Bot, MessageCircle, Briefcase,
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;
const getToken = () => (typeof localStorage !== "undefined" ? localStorage.getItem("admin_auth_token") ?? "" : "");

// ── Avatar helpers ────────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  "#6366f1","#f97316","#14b8a6","#a855f7","#ec4899",
  "#0ea5e9","#f43f5e","#84cc16","#eab308","#64748b",
];
function initials(name = "") {
  const p = name.trim().split(" ");
  return p.length >= 2 ? (p[0][0] + p[p.length - 1][0]).toUpperCase() : name.slice(0, 2).toUpperCase();
}
function avatarColor(id) { return AVATAR_COLORS[(id ?? 0) % AVATAR_COLORS.length]; }

// ── App meta map ──────────────────────────────────────────────────────────────
const APP_META = {
  "google.com":         { name: "Google",        bg: "#4285F4", favicon: "https://www.google.com/favicon.ico",                        category: "work" },
  "docs.google.com":    { name: "Google Docs",   bg: "#4285F4", favicon: "https://ssl.gstatic.com/docs/documents/images/kix-favicon7.ico", category: "work" },
  "spreadsheets":       { name: "Google Sheets", bg: "#0F9D58", favicon: "https://ssl.gstatic.com/docs/spreadsheets/favicon3.ico",    category: "work" },
  "drive.google.com":   { name: "Google Drive",  bg: "#4285F4", favicon: "https://ssl.gstatic.com/docs/doclist/images/drive_2022q3_32dp.png", category: "work" },
  "mail.google.com":    { name: "Gmail",          bg: "#EA4335", favicon: "https://ssl.gstatic.com/ui/v1/icons/mail/rfr/gmail.ico",   category: "work" },
  "calendar.google.com":{ name: "Calendar",       bg: "#1A73E8", favicon: "https://calendar.google.com/googlecalendar/images/favicon_v2018_256.png", category: "work" },
  "youtube.com":        { name: "YouTube",        bg: "#FF0000", favicon: "https://www.youtube.com/favicon.ico",                      category: "media" },
  "canva.com":          { name: "Canva",          bg: "#7C3AED", favicon: "https://www.canva.com/favicon.ico",                        category: "work" },
  "canva.in":           { name: "Canva",          bg: "#7C3AED", favicon: "https://www.canva.com/favicon.ico",                        category: "work" },
  "chatgpt.com":        { name: "ChatGPT",        bg: "#10A37F", favicon: "https://chatgpt.com/favicon.ico",                          category: "ai" },
  "chat.openai.com":    { name: "ChatGPT",        bg: "#10A37F", favicon: "https://chatgpt.com/favicon.ico",                          category: "ai" },
  "claude.ai":          { name: "Claude",         bg: "#D97757", favicon: "https://claude.ai/favicon.ico",                            category: "ai" },
  "chat.deepseek.com":  { name: "DeepSeek",       bg: "#1A73E8", favicon: "https://chat.deepseek.com/favicon.ico",                    category: "ai" },
  "deepseek.com":       { name: "DeepSeek",       bg: "#1A73E8", favicon: "https://chat.deepseek.com/favicon.ico",                    category: "ai" },
  "web.whatsapp.com":   { name: "WhatsApp",       bg: "#25D366", favicon: "https://web.whatsapp.com/favicon.ico",                     category: "social" },
  "whatsapp.com":       { name: "WhatsApp",       bg: "#25D366", favicon: "https://web.whatsapp.com/favicon.ico",                     category: "social" },
  "github.com":         { name: "GitHub",         bg: "#24292E", favicon: "https://github.com/favicon.ico",                           category: "work" },
  "figma.com":          { name: "Figma",          bg: "#F24E1E", favicon: "https://www.figma.com/favicon.ico",                        category: "work" },
  "notion.so":          { name: "Notion",         bg: "#1F1F1F", favicon: "https://www.notion.so/front-static/favicon.ico",           category: "work" },
  "slack.com":          { name: "Slack",          bg: "#4A154B", favicon: "https://a.slack-edge.com/80588/marketing/img/meta/favicon-32.png", category: "social" },
  "stackoverflow.com":  { name: "Stack Overflow", bg: "#F48024", favicon: "https://stackoverflow.com/favicon.ico",                   category: "work" },
  "mangools.com":       { name: "Mangools",       bg: "#35C369", favicon: "https://mangools.com/favicon.ico",                         category: "work" },
  "picsart.com":        { name: "PicsArt",        bg: "#FF4500", favicon: "https://picsart.com/favicon.ico",                          category: "work" },
  "cloudinary.com":     { name: "Cloudinary",     bg: "#3448C5", favicon: "https://cloudinary.com/favicon.ico",                      category: "work" },
  "athmahospitals.com": { name: "Athma Hospitals",bg: "#0EA5E9", favicon: "https://athmahospitals.com/favicon.ico",                  category: "work" },
  "localhost":          { name: "Localhost",      bg: "#64748b", favicon: null,                                                        category: "dev" },
  "127.0.0.1":          { name: "Localhost",      bg: "#64748b", favicon: null,                                                        category: "dev" },
  "twitter.com":        { name: "Twitter/X",      bg: "#000000", favicon: "https://abs.twimg.com/favicons/twitter.3.ico",             category: "social" },
  "x.com":              { name: "X",              bg: "#000000", favicon: "https://abs.twimg.com/favicons/twitter.3.ico",             category: "social" },
  "linkedin.com":       { name: "LinkedIn",       bg: "#0077B5", favicon: "https://www.linkedin.com/favicon.ico",                    category: "social" },
};

function getAppMeta(url) {
  try {
    const u = new URL(url);
    const host = u.hostname.replace("www.", "");
    for (const key of Object.keys(APP_META)) {
      if (host === key || host.endsWith("." + key)) return APP_META[key];
    }
    const hashed = Math.abs(host.split("").reduce((a, c) => a + c.charCodeAt(0), 0));
    return { name: host, bg: AVATAR_COLORS[hashed % AVATAR_COLORS.length], favicon: `https://${host}/favicon.ico`, category: "other" };
  } catch {
    return { name: "—", bg: "#64748b", favicon: null, category: "other" };
  }
}

function isSkippable(url) {
  return url.startsWith("chrome://") || url.startsWith("about:") || url.startsWith("chrome-extension://");
}

// ── Date helpers ──────────────────────────────────────────────────────────────
function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function fmtTime(str) {
  if (!str) return "";
  return new Date(str.replace(" ", "T")).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}
function fmtDateLabel(str) {
  if (!str) return "";
  return new Date(str + "T00:00:00").toLocaleDateString("en-GB", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });
}

// ── Avatar component ──────────────────────────────────────────────────────────
function Avatar({ emp, size = "md" }) {
  const [err, setErr] = useState(false);
  const cls = size === "lg" ? "w-10 h-10 text-sm" : size === "sm" ? "w-7 h-7 text-[10px]" : "w-8 h-8 text-xs";
  if (emp.profile_image && !err)
    return (
      <img src={`${emp.profile_image}`} alt={emp.name} onError={() => setErr(true)}
        className={`${cls} rounded-full object-cover shrink-0 border-2 border-white shadow-sm`} />
    );
  return (
    <div className={`${cls} rounded-full flex items-center justify-center text-white font-bold shrink-0 border-2 border-white shadow-sm`}
      style={{ backgroundColor: avatarColor(emp.id) }}>
      {initials(emp.name)}
    </div>
  );
}

// ── App Icon component ────────────────────────────────────────────────────────
function AppIcon({ url }) {
  const [err, setErr] = useState(false);
  const meta = getAppMeta(url);
  if (meta.favicon && !err)
    return (
      <div className="w-7 h-7 rounded-lg border border-gray-100 bg-white flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
        <img src={meta.favicon} alt={meta.name} onError={() => setErr(true)} className="w-4 h-4 object-contain" />
      </div>
    );
  return (
    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm"
      style={{ backgroundColor: meta.bg }}>
      {meta.name[0]}
    </div>
  );
}

// ── Category badge ────────────────────────────────────────────────────────────
function CategoryBadge({ category }) {
  const cfg = {
    ai:     { label: "AI",     bg: "#f0fdf4", text: "#16a34a", border: "#bbf7d0" },
    social: { label: "Social", bg: "#eff6ff", text: "#2563eb", border: "#bfdbfe" },
    dev:    { label: "Dev",    bg: "#faf5ff", text: "#7c3aed", border: "#e9d5ff" },
    media:  { label: "Media",  bg: "#fff7ed", text: "#ea580c", border: "#fed7aa" },
  }[category];
  if (!cfg) return null;
  return (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold ml-1.5"
      style={{ background: cfg.bg, color: cfg.text, border: `1px solid ${cfg.border}` }}>
      {cfg.label}
    </span>
  );
}

// ── Filter tabs config ────────────────────────────────────────────────────────
const FILTER_TABS = [
  { key: "all",    label: "All",           icon: Globe },
  { key: "ai",     label: "AI Tools",      icon: Bot },
  { key: "social", label: "Social",        icon: MessageCircle },
  { key: "work",   label: "Work",          icon: Briefcase },
];

// ── Main component ────────────────────────────────────────────────────────────
export default function BrowsingHistoryPage() {
  const [employees, setEmployees]     = useState([]);
  const [empLoading, setEmpLoading]   = useState(true);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [fromDate, setFromDate]       = useState(todayStr());
  const [toDate, setToDate]           = useState(todayStr());
  const [history, setHistory]         = useState([]);
  const [histLoading, setHistLoading] = useState(false);
  const [histError, setHistError]     = useState(null);
  const [hasFetched, setHasFetched]   = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const headers = {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
    ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
  };

  // load employees
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`${API_BASE}/api/admin/browsing-history/employees`, { headers });
        const j = await r.json();
        setEmployees(j.data ?? []);
      } catch { /* silent */ }
      finally { setEmpLoading(false); }
    })();
  }, []);

  const fetchHistory = useCallback(async () => {
    if (!selectedEmp) return;
    setHistLoading(true); setHistError(null); setHasFetched(false);
    try {
      const r = await fetch(
        `${API_BASE}/api/admin/browsing-history?employee_id=${selectedEmp}&from_date=${fromDate}&to_date=${toDate}&limit=200`,
        { headers }
      );
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const j = await r.json();
      const emp = (j.data ?? [])[0];
      setHistory(emp?.history ?? []);
      setHasFetched(true);
    } catch (e) { setHistError(e.message); }
    finally { setHistLoading(false); }
  }, [selectedEmp, fromDate, toDate]);

  // filter history
  const filtered = history.filter(h => {
    if (isSkippable(h.url)) return false;
    const q = searchQuery.toLowerCase();
    if (q && !h.url.toLowerCase().includes(q) && !h.title.toLowerCase().includes(q)) return false;
    if (activeFilter !== "all") {
      const meta = getAppMeta(h.url);
      if (meta.category !== activeFilter) return false;
    }
    return true;
  });

  // group by day
  const grouped = filtered.reduce((acc, h) => {
    const day = h.visited_at.slice(0, 10);
    if (!acc[day]) acc[day] = [];
    acc[day].push(h);
    return acc;
  }, {});
  const days = Object.keys(grouped).sort().reverse();

  // top apps stat
  const appCounts = {};
  for (const h of filtered) {
    const meta = getAppMeta(h.url);
    appCounts[meta.name] = (appCounts[meta.name] ?? 0) + 1;
  }
  const topApps = Object.entries(appCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const empInfo = employees.find(e => e.id === selectedEmp);

  return (
    <div className="space-y-4">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div className="relative bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 overflow-hidden">
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute bottom-0 right-16 w-16 h-16 rounded-full bg-white/10 pointer-events-none" />
        <div className="relative z-10">
          <p className="text-indigo-200 text-[10px] font-bold tracking-widest uppercase mb-1">Admin Monitor</p>
          <h1 className="text-white text-xl font-bold mb-1">Employee Browsing History</h1>
          <p className="text-indigo-100 text-xs max-w-lg">
            Track websites, apps &amp; activity timelines across your team. Click any URL to open it directly.
          </p>
        </div>
      </div>

      {/* ── Employee selector ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider">Select Employee</p>
        {empLoading ? (
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <RefreshCw size={13} className="animate-spin" /> Loading employees…
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {employees.map(emp => (
              <button key={emp.id} onClick={() => setSelectedEmp(emp.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                  selectedEmp === emp.id
                    ? "bg-indigo-50 border-indigo-300 text-indigo-700"
                    : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                }`}>
                <Avatar emp={emp} size="sm" />
                {emp.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Date range + fetch ────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex items-center flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500 font-medium">From</label>
            <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)}
              className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-700 outline-none focus:border-indigo-400" />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500 font-medium">To</label>
            <input type="date" value={toDate} onChange={e => setToDate(e.target.value)}
              className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-700 outline-none focus:border-indigo-400" />
          </div>
          <button onClick={fetchHistory} disabled={!selectedEmp || histLoading}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold disabled:opacity-50 hover:bg-indigo-700 transition-colors">
            <RefreshCw size={12} className={histLoading ? "animate-spin" : ""} />
            {histLoading ? "Fetching…" : "Fetch History"}
          </button>
          <div className="ml-auto flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5">
            <Search size={11} className="text-gray-400" />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search URLs or titles…"
              className="text-xs outline-none text-gray-600 w-44 bg-transparent" />
          </div>
        </div>
      </div>

      {/* ── Error ─────────────────────────────────────────────────────────── */}
      {histError && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl px-4 py-3 flex items-center gap-2">
          <AlertCircle size={14} /> Failed to load: {histError}
        </div>
      )}

      {/* ── Stats + Timeline ──────────────────────────────────────────────── */}
      {hasFetched && !histLoading && (
        <>
          {/* Top apps */}
          {topApps.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider">Top Apps · {filtered.length} visits</p>
              <div className="flex flex-wrap gap-2">
                {topApps.map(([name, count]) => {
                  const entry = Object.values(APP_META).find(a => a.name === name);
                  const bg = entry?.bg ?? "#6366f1";
                  return (
                    <div key={name} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-100 bg-gray-50">
                      {entry?.favicon
                        ? <img src={entry.favicon} alt={name} className="w-4 h-4 object-contain" onError={e => e.target.style.display="none"} />
                        : <div className="w-4 h-4 rounded text-white text-[9px] flex items-center justify-center font-bold" style={{ backgroundColor: bg }}>{name[0]}</div>
                      }
                      <span className="text-xs font-medium text-gray-700">{name}</span>
                      <span className="text-xs font-bold px-1.5 py-0.5 rounded-lg text-white" style={{ backgroundColor: bg }}>{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Filter tabs + Timeline */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                {empInfo && <Avatar emp={empInfo} size="md" />}
                <div>
                  <p className="text-sm font-bold text-gray-800">{empInfo?.name ?? "Employee"}</p>
                  <p className="text-[11px] text-gray-400">{filtered.length} visits · {days.length} day{days.length !== 1 ? "s" : ""}</p>
                </div>
              </div>
            </div>

            {/* Filter tabs */}
            <div className="flex border-b border-gray-100 px-4 overflow-x-auto">
              {FILTER_TABS.map(tab => (
                <button key={tab.key} onClick={() => setActiveFilter(tab.key)}
                  className={`flex items-center gap-1.5 px-3 py-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-all ${
                    activeFilter === tab.key
                      ? "border-indigo-500 text-indigo-600"
                      : "border-transparent text-gray-400 hover:text-gray-700"
                  }`}>
                  <tab.icon size={12} />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Timeline rows */}
            {filtered.length === 0 ? (
              <p className="text-center text-xs text-gray-400 py-14">No records match your filters.</p>
            ) : (
              days.map(day => (
                <div key={day}>
                  <div className="px-5 py-2 bg-gray-50 border-b border-gray-100">
                    <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                      {fmtDateLabel(day)} &mdash; {grouped[day].length} visits
                    </p>
                  </div>
                  {grouped[day].map((h, idx) => {
                    const meta = getAppMeta(h.url);
                    const safeTitle = h.title || new URL(h.url).hostname;
                    return (
                      <div key={idx}
                        className="flex items-center gap-3 px-5 py-2.5 border-b border-gray-50 hover:bg-indigo-50/30 transition-colors group cursor-pointer"
                        onClick={() => window.open(h.url, "_blank", "noopener,noreferrer")}>
                        <AppIcon url={h.url} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1 flex-wrap">
                            <p className="text-xs font-semibold text-gray-800 truncate max-w-xs">{safeTitle}</p>
                            <CategoryBadge category={meta.category} />
                          </div>
                          <p className="text-[11px] text-gray-400 truncate max-w-sm mt-0.5">{h.url}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] font-medium text-gray-400">{meta.name}</span>
                          <span className="text-[11px] text-gray-400 tabular-nums">{fmtTime(h.visited_at)}</span>
                          <ExternalLink size={11} className="text-gray-300 group-hover:text-indigo-400 transition-colors" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* ── Empty state (before first fetch) ──────────────────────────────── */}
      {!hasFetched && !histLoading && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
            <Globe size={24} className="text-indigo-400" />
          </div>
          <p className="text-sm font-bold text-gray-700 mb-1">Select an employee &amp; fetch history</p>
          <p className="text-xs text-gray-400 max-w-xs">Pick an employee from above, choose a date range, and click Fetch History to see their browsing activity.</p>
        </div>
      )}
    </div>
  );
}
