"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search, Globe, Clock, RefreshCw,
  ExternalLink, AlertCircle,
  Bot, MessageCircle, Briefcase, Users, Calendar,
  Filter, MonitorSmartphone, AppWindow, BarChart2,
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;
const getToken = () => (typeof localStorage !== "undefined" ? localStorage.getItem("auth_token") ?? "" : "");

// ── Helpers ───────────────────────────────────────────────────────────
const AVATAR_COLORS = ["#6366f1","#f97316","#14b8a6","#a855f7","#ec4899","#0ea5e9","#f43f5e","#84cc16","#eab308","#64748b"];
function initials(name = "") {
  const p = name.trim().split(" ");
  return p.length >= 2 ? (p[0][0] + p[p.length - 1][0]).toUpperCase() : name.slice(0, 2).toUpperCase();
}
function avatarColor(id) { return AVATAR_COLORS[(id ?? 0) % AVATAR_COLORS.length]; }
function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}
function fmtTime(str) {
  if (!str) return "";
  try { return new Date(str.replace(" ","T")).toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit",second:"2-digit"}); } catch { return str; }
}
function fmtDateLabel(str) {
  if (!str) return "";
  try { return new Date(str+"T00:00:00").toLocaleDateString("en-GB",{weekday:"long",day:"2-digit",month:"long",year:"numeric"}); } catch { return str; }
}
function shiftDate(base, offset) {
  const d = new Date(base+"T00:00:00");
  d.setDate(d.getDate()+offset);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

// ── App meta (websites) ───────────────────────────────────────────────
const APP_META = {
  "google.com":          { name:"Google",        bg:"#4285F4", favicon:"https://www.google.com/favicon.ico",                                        category:"work"   },
  "docs.google.com":     { name:"Google Docs",   bg:"#4285F4", favicon:"https://ssl.gstatic.com/docs/documents/images/kix-favicon7.ico",           category:"work"   },
  "spreadsheets":        { name:"Google Sheets", bg:"#0F9D58", favicon:"https://ssl.gstatic.com/docs/spreadsheets/favicon3.ico",                   category:"work"   },
  "drive.google.com":    { name:"Google Drive",  bg:"#4285F4", favicon:"https://ssl.gstatic.com/docs/doclist/images/drive_2022q3_32dp.png",        category:"work"   },
  "mail.google.com":     { name:"Gmail",          bg:"#EA4335", favicon:"https://ssl.gstatic.com/ui/v1/icons/mail/rfr/gmail.ico",                  category:"work"   },
  "calendar.google.com": { name:"Calendar",       bg:"#1A73E8", favicon:"https://calendar.google.com/googlecalendar/images/favicon_v2018_256.png", category:"work"   },
  "youtube.com":         { name:"YouTube",        bg:"#FF0000", favicon:"https://www.youtube.com/favicon.ico",                                      category:"media"  },
  "canva.com":           { name:"Canva",          bg:"#7C3AED", favicon:"https://www.canva.com/favicon.ico",                                        category:"work"   },
  "canva.in":            { name:"Canva",          bg:"#7C3AED", favicon:"https://www.canva.com/favicon.ico",                                        category:"work"   },
  "chatgpt.com":         { name:"ChatGPT",        bg:"#10A37F", favicon:"https://chatgpt.com/favicon.ico",                                          category:"ai"     },
  "chat.openai.com":     { name:"ChatGPT",        bg:"#10A37F", favicon:"https://chatgpt.com/favicon.ico",                                          category:"ai"     },
  "claude.ai":           { name:"Claude",         bg:"#D97757", favicon:"https://claude.ai/favicon.ico",                                            category:"ai"     },
  "chat.deepseek.com":   { name:"DeepSeek",       bg:"#1A73E8", favicon:"https://chat.deepseek.com/favicon.ico",                                   category:"ai"     },
  "deepseek.com":        { name:"DeepSeek",       bg:"#1A73E8", favicon:"https://chat.deepseek.com/favicon.ico",                                   category:"ai"     },
  "web.whatsapp.com":    { name:"WhatsApp",       bg:"#25D366", favicon:"https://web.whatsapp.com/favicon.ico",                                    category:"social" },
  "whatsapp.com":        { name:"WhatsApp",       bg:"#25D366", favicon:"https://web.whatsapp.com/favicon.ico",                                    category:"social" },
  "github.com":          { name:"GitHub",         bg:"#24292E", favicon:"https://github.com/favicon.ico",                                          category:"work"   },
  "figma.com":           { name:"Figma",          bg:"#F24E1E", favicon:"https://www.figma.com/favicon.ico",                                       category:"work"   },
  "notion.so":           { name:"Notion",         bg:"#1F1F1F", favicon:"https://www.notion.so/front-static/favicon.ico",                          category:"work"   },
  "slack.com":           { name:"Slack",          bg:"#4A154B", favicon:"https://a.slack-edge.com/80588/marketing/img/meta/favicon-32.png",        category:"social" },
  "stackoverflow.com":   { name:"Stack Overflow", bg:"#F48024", favicon:"https://stackoverflow.com/favicon.ico",                                   category:"work"   },
  "mangools.com":        { name:"Mangools",       bg:"#35C369", favicon:"https://mangools.com/favicon.ico",                                         category:"work"   },
  "picsart.com":         { name:"PicsArt",        bg:"#FF4500", favicon:"https://picsart.com/favicon.ico",                                         category:"work"   },
  "cloudinary.com":      { name:"Cloudinary",     bg:"#3448C5", favicon:"https://cloudinary.com/favicon.ico",                                      category:"work"   },
  "athmahospitals.com":  { name:"Athma",          bg:"#0EA5E9", favicon:"https://athmahospitals.com/favicon.ico",                                  category:"work"   },
  "localhost":           { name:"Localhost",      bg:"#64748b", favicon:null,                                                                        category:"dev"    },
  "127.0.0.1":           { name:"Localhost",      bg:"#64748b", favicon:null,                                                                        category:"dev"    },
  "twitter.com":         { name:"Twitter/X",      bg:"#000000", favicon:"https://abs.twimg.com/favicons/twitter.3.ico",                            category:"social" },
  "x.com":               { name:"X",              bg:"#000000", favicon:"https://abs.twimg.com/favicons/twitter.3.ico",                            category:"social" },
  "linkedin.com":        { name:"LinkedIn",       bg:"#0077B5", favicon:"https://www.linkedin.com/favicon.ico",                                    category:"social" },
};

function getAppMeta(url) {
  try {
    if (!url) throw new Error("No URL");
    const host = new URL(url).hostname.replace("www.", "");
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
  return url?.startsWith("chrome://") || url?.startsWith("about:") || url?.startsWith("chrome-extension://");
}

// ── Avatar ────────────────────────────────────────────────────────────
function Avatar({ emp, size="md" }) {
  const [err,setErr] = useState(false);
  const cls = size==="lg"?"w-10 h-10 text-sm":size==="sm"?"w-7 h-7 text-[10px]":"w-8 h-8 text-xs";
  if (emp?.profile_image && !err)
    return <img src={emp.profile_image} alt={emp.name} onError={()=>setErr(true)}
      className={`${cls} rounded-full object-cover shrink-0 border-2 border-white shadow-sm`}/>;
  return (
    <div className={`${cls} rounded-full flex items-center justify-center text-white font-bold shrink-0 border-2 border-white shadow-sm`}
      style={{backgroundColor:avatarColor(emp?.id)}}>
      {initials(emp?.name)}
    </div>
  );
}

// ── App Icon (websites) ──────────────────────────────────────────────
function AppIcon({ url }) {
  const [err,setErr] = useState(false);
  const meta = getAppMeta(url);
  if (meta.favicon && !err)
    return (
      <div className="w-7 h-7 rounded-lg border border-gray-100 bg-white flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
        <img src={meta.favicon} alt={meta.name} onError={()=>setErr(true)} className="w-4 h-4 object-contain"/>
      </div>
    );
  return (
    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm"
      style={{backgroundColor:meta.bg}}>
      {meta.name[0]}
    </div>
  );
}

// ── Activity Icon (apps) ─────────────────────────────────────────────
const ACTIVITY_ICON_MAP = {
  "Visual Studio Code": { bg: "#007ACC", icon: "💻", label: "VS Code" },
  "Google Chrome":      { bg: "#4285F4", icon: "🌐", label: "Chrome" },
  "Postman":            { bg: "#FF6C37", icon: "📮", label: "Postman" },
  "Electron":           { bg: "#47848F", icon: "⚛️", label: "Electron" },
  "Windows Explorer":   { bg: "#0078D7", icon: "📁", label: "Explorer" },
  "Microsoft Edge":     { bg: "#0078D7", icon: "🌐", label: "Edge" },
  "WhatsApp.Root":      { bg: "#25D366", icon: "💬", label: "WhatsApp" },
  "EmployeeTracker":    { bg: "#6366f1", icon: "👥", label: "Tracker" },
};
function ActivityIcon({ appName }) {
  const meta = ACTIVITY_ICON_MAP[appName] || { bg: "#64748b", icon: "🖥️", label: appName?.slice(0,2) || "App" };
  return (
    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-sm"
         style={{ backgroundColor: meta.bg }}>
      {meta.icon}
    </div>
  );
}

// ── Category badge ────────────────────────────────────────────────────
function CategoryBadge({ category }) {
  const cfg = {
    ai:     { label:"AI",     bg:"#f0fdf4", text:"#16a34a", border:"#bbf7d0" },
    social: { label:"Social", bg:"#eff6ff", text:"#2563eb", border:"#bfdbfe" },
    dev:    { label:"Dev",    bg:"#faf5ff", text:"#7c3aed", border:"#e9d5ff" },
    media:  { label:"Media",  bg:"#fff7ed", text:"#ea580c", border:"#fed7aa" },
  }[category];
  if (!cfg) return null;
  return (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold ml-1.5"
      style={{background:cfg.bg, color:cfg.text, border:`1px solid ${cfg.border}`}}>
      {cfg.label}
    </span>
  );
}

const FILTER_TABS = [
  { key:"all",    label:"All",      icon:Globe         },
  { key:"ai",     label:"AI Tools", icon:Bot           },
  { key:"social", label:"Social",   icon:MessageCircle },
  { key:"work",   label:"Work",     icon:Briefcase     },
];

const VIEW_OPTIONS = [
  { key: "browsing",   label: "Websites",       icon: Globe             },
  { key: "activities", label: "App Activities", icon: MonitorSmartphone },
];

// ── Main Component ────────────────────────────────────────────────────
export default function BrowsingHistoryPage() {
  // ── existing state (all untouched) ───────────────────────────────
  const [employees,    setEmployees]    = useState([]);
  const [empLoading,   setEmpLoading]   = useState(true);
  const [empSearch,    setEmpSearch]    = useState("");
  const [selectedEmp,  setSelectedEmp]  = useState(null);
  const [fromDate,     setFromDate]     = useState(todayStr());
  const [toDate,       setToDate]       = useState(todayStr());
  const [activeView,   setActiveView]   = useState("browsing");

  const [history,        setHistory]        = useState([]);
  const [histLoading,    setHistLoading]    = useState(false);
  const [histError,      setHistError]      = useState(null);
  const [hasFetchedHist, setHasFetchedHist] = useState(false);

  const [activities,    setActivities]    = useState([]);
  const [actLoading,    setActLoading]    = useState(false);
  const [actError,      setActError]      = useState(null);
  const [hasFetchedAct, setHasFetchedAct] = useState(false);

  const [searchQuery,  setSearchQuery]  = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  // ── NEW state ────────────────────────────────────────────────────
  const [actEmployees, setActEmployees] = useState([]);   // GET /api/admin/activities/employees
  const [actSummary,   setActSummary]   = useState(null); // GET /api/admin/activities/summary

  const headers = {
    "Content-Type":"application/json",
    "ngrok-skip-browser-warning":"true",
    ...(getToken()?{Authorization:`Bearer ${getToken()}`}:{}),
  };

  // ── EXISTING: load browsing employees — completely untouched ──────
  useEffect(() => {
    (async() => {
      try {
        const r = await fetch(`${API_BASE}/api/admin/browsing-history/employees`,{headers});
        const j = await r.json();
        setEmployees(j.data??[]);
      } catch { /* silent */ }
      finally { setEmpLoading(false); }
    })();
  }, []);

  // ── NEW: load activities employees + summary on mount ─────────────
  useEffect(() => {
    (async () => {
      try {
        const [empRes, summaryRes] = await Promise.all([
          fetch(`${API_BASE}/api/admin/activities/employees`, { headers }),
          fetch(`${API_BASE}/api/admin/activities/summary`,   { headers }),
        ]);
        const empJson     = await empRes.json();
        const summaryJson = await summaryRes.json();

        // handle both wrapped { data: [...] } and bare array responses
        if      (Array.isArray(empJson.data)) setActEmployees(empJson.data);
        else if (Array.isArray(empJson))      setActEmployees(empJson);

        if (summaryJson.success && summaryJson.data) setActSummary(summaryJson.data);
      } catch { /* silent */ }
    })();
  }, []);

  // ── EXISTING: fetch browsing history — untouched ──────────────────
  const fetchBrowsingHistory = useCallback(async () => {
    if (!selectedEmp) return;
    setHistLoading(true); setHistError(null); setHasFetchedHist(false);
    try {
      const r = await fetch(
        `${API_BASE}/api/admin/browsing-history?employee_id=${selectedEmp}&from_date=${fromDate}&to_date=${toDate}&limit=200`,
        { headers }
      );
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const j = await r.json();
      const emp = (j.data??[])[0];
      setHistory(emp?.history??[]);
      setHasFetchedHist(true);
    } catch(e) { setHistError(e.message); }
    finally { setHistLoading(false); }
  }, [selectedEmp, fromDate, toDate]);

  // ── EXISTING: fetch app activities — untouched ────────────────────
  const fetchActivities = useCallback(async () => {
    if (!selectedEmp) return;
    setActLoading(true); setActError(null); setHasFetchedAct(false);
    try {
      const url = `${API_BASE}/api/admin/activities/employee/${selectedEmp}?from_date=${fromDate}&to_date=${toDate}&limit=200`;
      const r = await fetch(url, { headers });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const j = await r.json();

      let activitiesArray = [];
      if (j.data && Array.isArray(j.data)) {
        activitiesArray = j.data;
      } else if (j.data && j.data.data && Array.isArray(j.data.data)) {
        activitiesArray = j.data.data;
      } else if (Array.isArray(j)) {
        activitiesArray = j;
      }
      setActivities(activitiesArray);
      setHasFetchedAct(true);
    } catch(e) { setActError(e.message); }
    finally { setActLoading(false); }
  }, [selectedEmp, fromDate, toDate]);

  // ── EXISTING: auto-fetch on change — untouched ────────────────────
  useEffect(() => {
    if (!selectedEmp) return;
    if (activeView === "browsing") {
      setHistory([]);
      setHasFetchedHist(false);
      setActiveFilter("all");
      setSearchQuery("");
      fetchBrowsingHistory();
    } else {
      setActivities([]);
      setHasFetchedAct(false);
      setActiveFilter("all");
      setSearchQuery("");
      fetchActivities();
    }
  }, [selectedEmp, fromDate, toDate, activeView, fetchBrowsingHistory, fetchActivities]);

  // ── Derived — untouched ───────────────────────────────────────────
  const empInfo      = employees.find(e => e.id === selectedEmp);
  const filteredEmps = employees.filter(e => !empSearch || e.name.toLowerCase().includes(empSearch.toLowerCase()));

  let currentData = [];
  let loading     = false;
  let error       = null;
  let hasFetched  = false;

  if (activeView === "browsing") {
    currentData = history;      loading = histLoading; error = histError; hasFetched = hasFetchedHist;
  } else {
    currentData = activities;   loading = actLoading;  error = actError;  hasFetched = hasFetchedAct;
  }

  const filtered = currentData.filter(item => {
    if (!item) return false;
    if (activeView === "browsing") {
      if (!item.url) return false;
      if (isSkippable(item.url)) return false;
      const q = searchQuery.toLowerCase();
      if (q && !item.url.toLowerCase().includes(q) && !(item.title?.toLowerCase() || "").includes(q)) return false;
      if (activeFilter !== "all" && getAppMeta(item.url).category !== activeFilter) return false;
    } else {
      const q = searchQuery.toLowerCase();
      if (q && !(item.active_app?.toLowerCase() || "").includes(q) && !(item.window_title?.toLowerCase() || "").includes(q)) return false;
    }
    return true;
  });

  const grouped = filtered.reduce((acc, item) => {
    const timestamp = activeView === "browsing" ? item.visited_at : item.created_at;
    if (!timestamp) return acc;
    const day = timestamp.slice(0,10);
    if (!acc[day]) acc[day] = [];
    acc[day].push(item);
    return acc;
  }, {});
  const days = Object.keys(grouped).sort().reverse();

  const getTopApps = () => {
    if (!Array.isArray(filtered)) return [];
    const counts = {};
    for (const item of filtered) {
      if (!item) continue;
      let key = "Unknown";
      if (activeView === "browsing") {
        const url = item.url;
        if (url && typeof url === 'string') {
          try { key = getAppMeta(url)?.name || "Unknown"; } catch { key = "Unknown"; }
        }
      } else {
        key = (item.active_app && typeof item.active_app === 'string') ? item.active_app : "Unknown";
      }
      counts[key] = (counts[key] || 0) + 1;
    }
    return Object.entries(counts).sort((a,b) => b[1] - a[1]).slice(0,5);
  };
  const topApps = getTopApps();

  // summary top apps for hero + sidebar when no employee selected
  const summaryTopApps = actSummary?.top_apps?.slice(0, 5) ?? [];

  return (
    <div className="flex flex-col gap-5" style={{height:"calc(100vh - 80px)"}}>

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <div className="relative bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-5 overflow-hidden shrink-0">
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10 pointer-events-none"/>
        <div className="absolute bottom-0 right-16 w-16 h-16 rounded-full bg-white/10 pointer-events-none"/>
        <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-indigo-200 text-[10px] font-bold tracking-widest uppercase mb-1">Admin Monitor</p>
            <h1 className="text-white text-lg font-bold mb-0.5">Employee Activity</h1>
            <p className="text-indigo-100 text-xs max-w-lg">
              View websites visited or applications used by each employee.
            </p>

            {/* Browsing view: local top apps badge (only when employee selected) */}
            {activeView === "browsing" && hasFetched && topApps.length > 0 && (
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                {topApps.map(([name, count]) => {
                  const entry   = Object.values(APP_META).find(a => a.name === name);
                  const bg      = entry?.bg      || "#6366f1";
                  const favicon = entry?.favicon || null;
                  return (
                    <div key={name} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/15 border border-white/20 text-xs">
                      {favicon ? (
                        <img src={favicon} alt={name} className="w-3.5 h-3.5 object-contain" onError={e=>e.target.style.display="none"}/>
                      ) : (
                        <div className="w-3.5 h-3.5 rounded text-white text-[9px] flex items-center justify-center font-bold" style={{backgroundColor: bg}}>
                          {name[0]}
                        </div>
                      )}
                      <span className="text-white/90 font-medium">{name}</span>
                      <span className="text-white/50">{count}×</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Activities view: summary top apps badge (always shown, company-wide) */}
            {activeView === "activities" && summaryTopApps.length > 0 && (
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                {summaryTopApps.map(({ active_app, count }) => {
                  const meta = ACTIVITY_ICON_MAP[active_app] || { bg: "#64748b", icon: "🖥️" };
                  return (
                    <div key={active_app} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/15 border border-white/20 text-xs">
                      <div className="w-3.5 h-3.5 rounded text-white text-[9px] flex items-center justify-center font-bold" style={{backgroundColor: meta.bg}}>
                        {meta.icon}
                      </div>
                      <span className="text-white/90 font-medium">{active_app}</span>
                      <span className="text-white/50">{count}×</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Date controls */}
          <div className="flex items-center gap-2 flex-wrap">
            {[{l:"Today",o:0},{l:"Yesterday",o:-1}].map(({l,o}) => {
              const v = shiftDate(todayStr(), o);
              const active = fromDate === v && toDate === v;
              return (
                <button key={l} onClick={() => { setFromDate(v); setToDate(v); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${active ? "bg-white text-indigo-700 shadow" : "bg-white/15 text-white border border-white/25 hover:bg-white/25"}`}>
                  {l}
                </button>
              );
            })}
            <div className="flex items-center bg-white/15 border border-white/25 rounded-lg overflow-hidden text-xs text-white">
              <label className="flex items-center gap-1.5 px-3 py-1.5 cursor-pointer border-r border-white/20">
                <Calendar size={11} className="text-white/70"/>
                <input type="date" value={fromDate} onChange={e=>setFromDate(e.target.value)}
                  className="outline-none bg-transparent text-xs text-white w-24 [color-scheme:dark]"/>
              </label>
              <span className="px-2 text-white/40 text-sm">→</span>
              <label className="flex items-center gap-1.5 px-3 py-1.5 cursor-pointer">
                <input type="date" value={toDate} onChange={e=>setToDate(e.target.value)}
                  className="outline-none bg-transparent text-xs text-white w-24 [color-scheme:dark]"/>
              </label>
            </div>
          </div>
        </div>

        {/* View Toggle */}
        <div className="relative z-10 flex justify-end mt-3">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-0.5 inline-flex">
            {VIEW_OPTIONS.map(opt => (
              <button
                key={opt.key}
                onClick={() => setActiveView(opt.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  activeView === opt.key
                    ? "bg-white text-indigo-700 shadow"
                    : "text-white/80 hover:text-white hover:bg-white/20"
                }`}>
                <opt.icon size={12}/>
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Body ──────────────────────────────────────────────────── */}
      <div className="flex gap-5 flex-1 min-h-0">

        {/* LEFT SIDEBAR */}
        <div className="w-60 shrink-0 flex flex-col gap-3 overflow-y-auto pb-4" style={{maxHeight:"100%"}}>

          {/* Employee list — UNCHANGED */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col">
            <div className="px-4 py-2.5 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-2 mb-2">
                <Users size={12} className="text-indigo-500"/>
                <p className="text-xs font-bold text-gray-700">Employees</p>
                <span className="ml-auto text-[10px] text-gray-400">{employees.length}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5">
                <Search size={10} className="text-gray-400 shrink-0"/>
                <input value={empSearch} onChange={e=>setEmpSearch(e.target.value)}
                  placeholder="Search employee…"
                  className="text-[11px] outline-none bg-transparent text-gray-600 w-full"/>
                {empSearch && <button onClick={()=>setEmpSearch("")} className="text-gray-400 shrink-0 hover:text-gray-600">✕</button>}
              </div>
            </div>
            <div className="overflow-y-auto" style={{maxHeight:"300px"}}>
              {empLoading ? (
                <div className="p-4 space-y-3">
                  {[1,2,3,4,5].map(i=>(
                    <div key={i} className="flex items-center gap-2 animate-pulse">
                      <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0"/>
                      <div className="h-3 flex-1 bg-gray-200 rounded"/>
                    </div>
                  ))}
                </div>
              ) : filteredEmps.length===0 ? (
                <p className="text-center text-xs text-gray-400 py-6">No employees found</p>
              ) : (
                <div className="divide-y divide-gray-50">
                  {filteredEmps.map(emp=>(
                    <button key={emp.id} onClick={()=>setSelectedEmp(emp.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-all border-l-2 ${
                        selectedEmp===emp.id
                          ? "bg-indigo-50 border-indigo-500"
                          : "border-transparent hover:bg-gray-50"
                      }`}>
                      <Avatar emp={emp} size="sm"/>
                      <p className={`text-xs font-semibold truncate flex-1 ${selectedEmp===emp.id?"text-indigo-700":"text-gray-700"}`}>
                        {emp.name}
                      </p>
                      {selectedEmp===emp.id && (
                        loading
                          ? <div className="w-3 h-3 border border-indigo-400 border-t-transparent rounded-full animate-spin shrink-0"/>
                          : <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0"/>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {!selectedEmp && !empLoading && (
              <div className="px-4 py-2.5 border-t border-gray-50 shrink-0">
                <p className="text-[10px] text-gray-400 text-center">👆 Click an employee to view history</p>
              </div>
            )}
          </div>

          {/* Refresh button */}
          {selectedEmp && (
            <button
              onClick={() => activeView === "browsing" ? fetchBrowsingHistory() : fetchActivities()}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold text-indigo-600 border border-indigo-200 hover:bg-indigo-50 disabled:opacity-40 transition-all">
              <RefreshCw size={12} className={loading ? "animate-spin" : ""}/>
              {loading ? "Refreshing…" : "Refresh Now"}
            </button>
          )}

          {/* Session stats — UNCHANGED */}
          {hasFetched && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 shrink-0">
              <p className="text-xs font-bold text-gray-700 mb-3">Session Stats</p>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div className="bg-indigo-50 rounded-xl p-2.5 text-center border border-indigo-100">
                  <p className="text-xl font-bold text-indigo-700">{filtered.length}</p>
                  <p className="text-[9px] text-indigo-500 font-semibold">
                    {activeView === "browsing" ? "Visits" : "Events"}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-xl p-2.5 text-center border border-slate-100">
                  <p className="text-xl font-bold text-slate-700">{days.length}</p>
                  <p className="text-[9px] text-slate-500 font-semibold">Days</p>
                </div>
              </div>
              {topApps[0] && (
                <div className="bg-gray-50 rounded-xl px-3 py-2 border border-gray-100">
                  <p className="text-[9px] text-gray-400">Top {activeView === "browsing" ? "site" : "app"}</p>
                  <p className="text-xs font-bold text-gray-700 truncate">{topApps[0][0]}</p>
                </div>
              )}
            </div>
          )}

          {/* NEW: Company-wide overview card — activities view only */}
          {activeView === "activities" && actSummary && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 shrink-0">
              <div className="flex items-center gap-1.5 mb-3">
                <BarChart2 size={12} className="text-indigo-500"/>
                <p className="text-xs font-bold text-gray-700">Company Overview</p>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div className="bg-indigo-50 rounded-xl p-2.5 text-center border border-indigo-100">
                  <p className="text-lg font-bold text-indigo-700">{actSummary.total_activities?.toLocaleString()}</p>
                  <p className="text-[9px] text-indigo-500 font-semibold">Total Events</p>
                </div>
                <div className="bg-green-50 rounded-xl p-2.5 text-center border border-green-100">
                  <p className="text-lg font-bold text-green-700">{actSummary.today_activities?.toLocaleString()}</p>
                  <p className="text-[9px] text-green-500 font-semibold">Today</p>
                </div>
              </div>
              <div className="bg-purple-50 rounded-xl p-2.5 text-center border border-purple-100">
                <p className="text-lg font-bold text-purple-700">{actSummary.unique_employees}</p>
                <p className="text-[9px] text-purple-500 font-semibold">Active Employees</p>
              </div>
            </div>
          )}

          {/* Top apps bar chart (local filtered data) — UNCHANGED */}
          {hasFetched && topApps.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 shrink-0">
              <p className="text-xs font-bold text-gray-700 mb-3">Top {activeView === "browsing" ? "Websites" : "Apps"}</p>
              <div className="space-y-2.5">
                {topApps.map(([name, count]) => {
                  let bg = "#6366f1";
                  let favicon = null;
                  if (activeView === "browsing") {
                    const entry = Object.values(APP_META).find(a => a.name === name);
                    bg = entry?.bg || "#6366f1";
                    favicon = entry?.favicon;
                  } else {
                    const meta = ACTIVITY_ICON_MAP[name];
                    bg = meta?.bg || "#64748b";
                  }
                  const pct = Math.round((count / filtered.length) * 100);
                  return (
                    <div key={name} className="flex items-center gap-2">
                      {favicon ? (
                        <img src={favicon} alt={name} className="w-4 h-4 object-contain shrink-0" onError={e=>e.target.style.display="none"}/>
                      ) : (
                        <div className="w-4 h-4 rounded text-white text-[9px] flex items-center justify-center font-bold shrink-0" style={{backgroundColor: bg}}>
                          {name[0]}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between mb-0.5">
                          <span className="text-[11px] font-semibold text-gray-700 truncate">{name}</span>
                          <span className="text-[10px] text-gray-400 ml-1 shrink-0">{pct}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-700" style={{width:`${pct}%`, backgroundColor: bg}}/>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* NEW: Summary top-apps bar chart — shown in activities view when no employee is selected yet */}
          {activeView === "activities" && !hasFetched && actSummary?.top_apps?.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 shrink-0">
              <p className="text-xs font-bold text-gray-700 mb-3">Company Top Apps</p>
              <div className="space-y-2.5">
                {actSummary.top_apps.map(({ active_app, count }) => {
                  const meta  = ACTIVITY_ICON_MAP[active_app] || { bg: "#64748b", icon: "🖥️" };
                  const total = actSummary.top_apps.reduce((s, a) => s + a.count, 0);
                  const pct   = Math.round((count / total) * 100);
                  return (
                    <div key={active_app} className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded text-white text-[9px] flex items-center justify-center font-bold shrink-0" style={{backgroundColor: meta.bg}}>
                        {meta.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between mb-0.5">
                          <span className="text-[11px] font-semibold text-gray-700 truncate">{active_app}</span>
                          <span className="text-[10px] text-gray-400 ml-1 shrink-0">{count}</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-700" style={{width:`${pct}%`, backgroundColor: meta.bg}}/>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT — Main content (timeline) — UNCHANGED */}
        <div className="flex-1 min-w-0 flex flex-col gap-4 overflow-y-auto pb-4" style={{maxHeight:"100%"}}>

          {/* Sticky toolbar */}
          {hasFetched && currentData.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 shrink-0 sticky top-0 z-20">
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  {empInfo && <Avatar emp={empInfo} size="md"/>}
                  <div>
                    <p className="text-sm font-bold text-gray-800">{empInfo?.name}</p>
                    <p className="text-[11px] text-gray-400">
                      {filtered.length} of {currentData.length} {activeView === "browsing" ? "visits" : "events"} · {days.length} day{days.length!==1?"s":""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5">
                  <Search size={11} className="text-gray-400"/>
                  <input value={searchQuery} onChange={e=>setSearchQuery(e.target.value)}
                    placeholder={activeView === "browsing" ? "Search URLs or titles…" : "Search apps or windows…"}
                    className="text-xs outline-none text-gray-600 w-44 bg-transparent"/>
                  {searchQuery && (
                    <button onClick={()=>setSearchQuery("")} className="text-gray-400 hover:text-gray-600 ml-1 text-xs">✕</button>
                  )}
                </div>
              </div>
              {activeView === "browsing" && (
                <div className="flex border-b border-gray-100 -mx-4 px-4 overflow-x-auto">
                  {FILTER_TABS.map(tab=>(
                    <button key={tab.key} onClick={()=>setActiveFilter(tab.key)}
                      className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 whitespace-nowrap transition-all ${
                        activeFilter===tab.key
                          ? "border-indigo-500 text-indigo-600"
                          : "border-transparent text-gray-400 hover:text-gray-700"
                      }`}>
                      <tab.icon size={12}/>{tab.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-24 gap-3">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                <RefreshCw size={24} className="text-indigo-400 animate-spin"/>
              </div>
              <p className="text-sm font-bold text-gray-700">
                Loading {activeView === "browsing" ? "browsing history" : "app activities"}…
              </p>
              <p className="text-xs text-gray-400">{empInfo?.name}</p>
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl px-4 py-3 flex items-center gap-2">
              <AlertCircle size={14}/> Failed to load: {error}
              <button onClick={() => activeView === "browsing" ? fetchBrowsingHistory() : fetchActivities()} className="ml-auto font-semibold underline">Retry</button>
            </div>
          )}

          {/* No employee selected */}
          {!selectedEmp && !loading && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-24 gap-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center">
                <Globe size={28} className="text-indigo-300"/>
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-gray-700 mb-1">Select an employee to view activity</p>
                <p className="text-xs text-gray-400 max-w-xs">Click any employee from the left panel.</p>
              </div>
            </div>
          )}

          {/* No data */}
          {hasFetched && !loading && currentData.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-24 gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center">
                <AppWindow size={28} className="text-gray-200"/>
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-gray-700 mb-1">No {activeView === "browsing" ? "browsing history" : "app activities"} found</p>
                <p className="text-xs text-gray-400">{empInfo?.name} had no recorded activity for this date range.</p>
              </div>
            </div>
          )}

          {/* Filter no match */}
          {hasFetched && !loading && currentData.length > 0 && filtered.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-12 gap-3">
              <Filter size={28} className="text-gray-200"/>
              <p className="text-sm font-bold text-gray-600">No results match this filter</p>
              <button onClick={()=>{setActiveFilter("all"); setSearchQuery("");}} className="text-xs text-indigo-600 font-semibold hover:underline">Clear filters</button>
            </div>
          )}

          {/* Timeline */}
          {hasFetched && !loading && filtered.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {days.map(day => (
                <div key={day}>
                  <div className="px-5 py-2 bg-gray-50 border-b border-gray-100 sticky top-0 z-10">
                    <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                      {fmtDateLabel(day)} — {grouped[day].length} {activeView === "browsing" ? "visits" : "events"}
                    </p>
                  </div>
                  {grouped[day].map((item, idx) => {
                    if (activeView === "browsing") {
                      const meta = getAppMeta(item.url);
                      const safeTitle = item.title || (()=>{ try{return new URL(item.url).hostname;}catch{return item.url;} })();
                      return (
                        <div key={idx} className="flex items-center gap-3 px-5 py-2.5 border-b border-gray-50 hover:bg-indigo-50/30 transition-colors group cursor-pointer"
                             onClick={() => window.open(item.url, "_blank", "noopener,noreferrer")}>
                          <AppIcon url={item.url}/>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1 flex-wrap">
                              <p className="text-xs font-semibold text-gray-800 truncate max-w-xs">{safeTitle}</p>
                              <CategoryBadge category={meta.category}/>
                            </div>
                            <p className="text-[11px] text-gray-400 truncate max-w-sm mt-0.5">{item.url}</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[10px] font-medium text-gray-400">{meta.name}</span>
                            <span className="text-[11px] text-gray-400 tabular-nums">{fmtTime(item.visited_at)}</span>
                            <ExternalLink size={11} className="text-gray-300 group-hover:text-indigo-400 transition-colors"/>
                          </div>
                        </div>
                      );
                    } else {
                      return (
                        <div key={idx} className="flex items-center gap-3 px-5 py-2.5 border-b border-gray-50 hover:bg-indigo-50/30 transition-colors">
                          <ActivityIcon appName={item.active_app}/>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1 flex-wrap">
                              <p className="text-xs font-semibold text-gray-800 truncate max-w-xs">{item.active_app || "Unknown app"}</p>
                            </div>
                            <p className="text-[11px] text-gray-500 truncate max-w-sm mt-0.5">{item.window_title || "—"}</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[11px] text-gray-400 tabular-nums">{fmtTime(item.created_at)}</span>
                          </div>
                        </div>
                      );
                    }
                  })}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}