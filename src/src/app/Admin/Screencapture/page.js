"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Monitor, ChevronLeft, ChevronRight,
  X, ZoomIn, Clock, Calendar, Users, Camera,
  AlertCircle, Download, Grid3X3, List,
  Eye, Shield, Activity, Search, Filter,
  TrendingUp, Wifi, WifiOff, RefreshCw, Info,
  ChevronUp, ChevronDown as ChevronDownIcon,
} from "lucide-react";

// ── Config ────────────────────────────────────────────────────────────
const API_BASE = process.env.NEXT_PUBLIC_API_URL;

const getToken = () => (typeof localStorage !== "undefined" ? localStorage.getItem("admin_auth_token") ?? "" : "");
const getHeaders = () => ({
  "Content-Type": "application/json",
  "ngrok-skip-browser-warning": "true",
  ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
});

// ── Fix image URL ─────────────────────────────────────────────────────
function fixImageUrl(raw) {
  if (!raw) return null;
  if (raw.startsWith("https://") || raw.startsWith("http://")) return raw;
  if (raw.startsWith("http/")) return `${API_BASE}/${raw}`;
  if (raw.startsWith("/")) return `${API_BASE}${raw}`;
  return `${API_BASE}/${raw}`;
}

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
  if (!str) return "—";
  try { return new Date(str.replace(" ","T")).toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"}); } catch { return str; }
}
function fmtDate(str) {
  if (!str) return "";
  try { return new Date(str+"T00:00:00").toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}); } catch { return str; }
}
function shiftDate(base, offset) {
  const d = new Date(base+"T00:00:00");
  d.setDate(d.getDate()+offset);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}
function getRawPath(s) {
  return s?.screenshot_url || s?.image_url || s?.file_path || s?.path || s?.url || s?.filename || null;
}

// ── App signatures ────────────────────────────────────────────────────
const APP_SIGNATURES = [
  { keys:["figma"],                              name:"Figma",        color:"#F24E1E", icon:"🎨", category:"Design" },
  { keys:["canva"],                              name:"Canva",        color:"#7C3AED", icon:"🖌️", category:"Design" },
  { keys:["picsart"],                            name:"PicsArt",      color:"#FF4500", icon:"🎨", category:"Design" },
  { keys:["photoshop"],                          name:"Photoshop",    color:"#001E36", icon:"🖼️", category:"Design" },
  { keys:["vscode","visual studio code"],        name:"VS Code",      color:"#007ACC", icon:"💻", category:"Dev" },
  { keys:["localhost","127.0.0.1"],              name:"Localhost",    color:"#64748b", icon:"🔧", category:"Dev" },
  { keys:["phpmyadmin","mysql"],                 name:"phpMyAdmin",   color:"#F29111", icon:"🗄️", category:"Dev" },
  { keys:["github"],                             name:"GitHub",       color:"#24292E", icon:"🐙", category:"Dev" },
  { keys:["terminal","cmd","powershell","bash"], name:"Terminal",     color:"#1a1a1a", icon:"⌨️", category:"Dev" },
  { keys:["chatgpt","chat.openai"],              name:"ChatGPT",      color:"#10A37F", icon:"🤖", category:"AI" },
  { keys:["claude.ai"],                          name:"Claude AI",    color:"#D97757", icon:"🤖", category:"AI" },
  { keys:["deepseek"],                           name:"DeepSeek",     color:"#1A73E8", icon:"🤖", category:"AI" },
  { keys:["web.whatsapp","whatsapp"],            name:"WhatsApp",     color:"#25D366", icon:"💬", category:"Social" },
  { keys:["slack"],                              name:"Slack",        color:"#4A154B", icon:"💬", category:"Social" },
  { keys:["youtube"],                            name:"YouTube",      color:"#FF0000", icon:"▶️", category:"Media" },
  { keys:["gmail","mail.google"],                name:"Gmail",        color:"#EA4335", icon:"📧", category:"Work" },
  { keys:["docs.google.com/document","google docs"], name:"Google Docs", color:"#4285F4", icon:"📝", category:"Work" },
  { keys:["docs.google.com/spreadsheet","google sheets"], name:"Sheets", color:"#0F9D58", icon:"📊", category:"Work" },
  { keys:["drive.google","google drive"],        name:"Drive",        color:"#4285F4", icon:"📁", category:"Work" },
  { keys:["wordpress","wp-admin"],               name:"WordPress",    color:"#21759B", icon:"🌐", category:"Work" },
  { keys:["athmahospitals"],                     name:"Athma",        color:"#0EA5E9", icon:"🏥", category:"Work" },
  { keys:["cloudinary"],                         name:"Cloudinary",   color:"#3448C5", icon:"☁️", category:"Work" },
  { keys:["mangools"],                           name:"Mangools",     color:"#35C369", icon:"🔍", category:"Work" },
  { keys:["notion"],                             name:"Notion",       color:"#000000", icon:"📓", category:"Work" },
  { keys:["zoom","google meet","teams"],         name:"Meeting",      color:"#2D8CFF", icon:"📹", category:"Work" },
  { keys:["chrome","firefox","safari","edge","browser"], name:"Browser", color:"#4285F4", icon:"🌐", category:"Other" },
  { keys:["google"],                             name:"Google",       color:"#4285F4", icon:"🌐", category:"Other" },
];

function detectApp(s) {
  const hay = [s?.active_window||"",s?.window_title||"",s?.app_name||"",s?.url||"",getRawPath(s)||""].join(" ").toLowerCase();
  for (const sig of APP_SIGNATURES) { if (sig.keys.some(k=>hay.includes(k))) return sig; }
  return { name:"Desktop", color:"#94a3b8", icon:"🖥️", category:"Other" };
}

// ── EmpAvatar ─────────────────────────────────────────────────────────
function EmpAvatar({ emp, size="md" }) {
  const [err,setErr] = useState(false);
  const cls = size==="lg"?"w-11 h-11 text-sm":size==="sm"?"w-7 h-7 text-[10px]":"w-9 h-9 text-xs";
  const src = emp.profile_image ? fixImageUrl(emp.profile_image) : null;
  if (src&&!err)
    return <img src={src} alt={emp.name} onError={()=>setErr(true)}
      className={`${cls} rounded-full object-cover shrink-0 border-2 border-white shadow-sm`}/>;
  return (
    <div className={`${cls} rounded-full flex items-center justify-center text-white font-bold shrink-0 border-2 border-white shadow-sm`}
      style={{backgroundColor:avatarColor(emp.id)}}>
      {initials(emp.name)}
    </div>
  );
}

// ── Lightbox ──────────────────────────────────────────────────────────
function Lightbox({ screenshot, emp, date, total, currentIdx, onClose, onPrev, onNext, hasPrev, hasNext }) {
  const app    = detectApp(screenshot);
  const imgSrc = fixImageUrl(getRawPath(screenshot));

  useEffect(()=>{
    const h=(e)=>{
      if(e.key==="Escape") onClose();
      if(e.key==="ArrowLeft"&&hasPrev) onPrev();
      if(e.key==="ArrowRight"&&hasNext) onNext();
    };
    window.addEventListener("keydown",h);
    return ()=>window.removeEventListener("keydown",h);
  },[hasPrev,hasNext,onClose,onPrev,onNext]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-md">
      {/* top bar */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-4 z-20">
        <div className="flex items-center gap-3">
          <EmpAvatar emp={emp} size="sm"/>
          <div>
            <p className="text-white text-sm font-bold">{emp.name}</p>
            <p className="text-white/40 text-xs">{fmtDate(date)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-white/40 text-xs">{currentIdx+1} / {total}</span>
          {imgSrc && (
            <a href={imgSrc} download target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition">
              <Download size={12}/> Save
            </a>
          )}
          <button onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition">
            <X size={16}/>
          </button>
        </div>
      </div>

      {hasPrev && (
        <button onClick={onPrev}
          className="absolute left-5 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition">
          <ChevronLeft size={24}/>
        </button>
      )}
      {hasNext && (
        <button onClick={onNext}
          className="absolute right-5 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition">
          <ChevronRight size={24}/>
        </button>
      )}

      <div className="relative w-full max-w-5xl mx-20 px-4 mt-14 mb-20">
        <div className="relative rounded-2xl overflow-hidden bg-gray-900 border border-white/10 shadow-2xl">
          {imgSrc ? (
            <img src={imgSrc} alt="screenshot" className="w-full object-contain max-h-[65vh]"/>
          ) : (
            <div className="w-full h-80 flex flex-col items-center justify-center bg-gray-800">
              <span className="text-6xl mb-3">{app.icon}</span>
              <p className="text-white/50 text-sm">{app.name}</p>
              <p className="text-white/25 text-xs mt-1">Image unavailable</p>
            </div>
          )}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-white text-xs font-bold shadow-lg"
            style={{backgroundColor:app.color+"ee"}}>
            <span>{app.icon}</span> {app.name}
          </div>
          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-black/50 text-white/60 text-[10px] font-medium">
            {app.category}
          </div>
          <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/60 text-white text-xs">
            <Clock size={10}/> {fmtTime(screenshot.captured_at||screenshot.created_at)}
          </div>
        </div>
        {screenshot.active_window && (
          <div className="mt-3 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
            <Info size={13} className="text-white/40 shrink-0"/>
            <div>
              <p className="text-white/30 text-[10px] uppercase tracking-wider mb-0.5">Active Window</p>
              <p className="text-white/70 text-sm truncate">{screenshot.active_window}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Screenshot Card ───────────────────────────────────────────────────
function ScreenshotCard({ screenshot, index, onOpen }) {
  const [imgErr,setImgErr] = useState(false);
  const [loaded,setLoaded] = useState(false);
  const app    = detectApp(screenshot);
  const imgSrc = fixImageUrl(getRawPath(screenshot));

  return (
    <div
      className="group relative bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
      onClick={()=>onOpen(index)}
    >
      <div className="relative bg-gray-100 overflow-hidden" style={{aspectRatio:"16/9"}}>
        {imgSrc&&!imgErr ? (
          <>
            {!loaded&&(
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                <div className="w-5 h-5 border-2 border-gray-300 border-t-violet-400 rounded-full animate-spin"/>
              </div>
            )}
            <img src={imgSrc} alt="screenshot"
              className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-105 ${loaded?"opacity-100":"opacity-0"}`}
              onLoad={()=>setLoaded(true)}
              onError={()=>{setImgErr(true);setLoaded(true);}}
            />
          </>
        ):(
          <div className="w-full h-full flex flex-col items-center justify-center"
            style={{background:`linear-gradient(135deg,${app.color}22,${app.color}06)`}}>
            <span className="text-3xl mb-1">{app.icon}</span>
            <p className="text-[10px] font-bold" style={{color:app.color}}>{app.name}</p>
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/35 transition-all duration-200 flex items-center justify-center">
          <div className="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-200">
            <ZoomIn size={15} className="text-gray-800"/>
          </div>
        </div>
        <div className="absolute top-1.5 left-1.5 flex items-center gap-1 px-1.5 py-0.5 rounded-md text-white text-[9px] font-bold shadow"
          style={{backgroundColor:app.color+"ee"}}>
          <span className="text-[11px]">{app.icon}</span>{app.name}
        </div>
        <div className="absolute bottom-1.5 right-1.5 flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-black/55 text-white text-[9px]">
          <Clock size={8}/> {fmtTime(screenshot.captured_at||screenshot.created_at)}
        </div>
      </div>
      <div className="px-2.5 py-2">
        <div className="flex items-center justify-between gap-1">
          <p className="text-[10px] font-bold text-gray-700 truncate">
            {screenshot.active_window||screenshot.window_title||app.name}
          </p>
          <Eye size={10} className="text-gray-300 group-hover:text-violet-400 transition-colors shrink-0"/>
        </div>
        <p className="text-[9px] text-gray-400">{fmtTime(screenshot.captured_at||screenshot.created_at)}</p>
      </div>
    </div>
  );
}

// ── Timeline group ────────────────────────────────────────────────────
function TimelineGroup({ hour, screenshots, onOpen, globalOffset }) {
  const [collapsed,setCollapsed] = useState(false);
  const appCount = {};
  for (const s of screenshots) { const n=detectApp(s).name; appCount[n]=(appCount[n]||0)+1; }
  const topApp = Object.entries(appCount).sort((a,b)=>b[1]-a[1])[0];
  const topSig = topApp ? APP_SIGNATURES.find(s=>s.name===topApp[0]) : null;

  return (
    <div className="mb-6">
      <button className="w-full flex items-center gap-3 mb-3 group/hdr" onClick={()=>setCollapsed(c=>!c)}>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-violet-50 border border-violet-100 group-hover/hdr:bg-violet-100 transition-colors">
          <Clock size={11} className="text-violet-500"/>
          <span className="text-xs font-bold text-violet-700">{hour}:00 – {hour}:59</span>
          {collapsed ? <ChevronDownIcon size={12} className="text-violet-400"/> : <ChevronUp size={12} className="text-violet-400"/>}
        </div>
        <div className="flex-1 h-px bg-gray-200"/>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] text-gray-400">{screenshots.length} captures</span>
          {topSig && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-white"
              style={{backgroundColor:topSig.color+"cc"}}>
              {topSig.icon} {topSig.name}
            </span>
          )}
        </div>
      </button>
      {!collapsed && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {screenshots.map((s,i)=>(
            <ScreenshotCard key={s.id??i} screenshot={s} index={globalOffset+i} onOpen={onOpen}/>
          ))}
        </div>
      )}
    </div>
  );
}

// ── App Usage ─────────────────────────────────────────────────────────
function AppUsage({ screenshots }) {
  const map = {};
  for (const s of screenshots) {
    const a = detectApp(s);
    if(!map[a.name]) map[a.name]={...a,count:0};
    map[a.name].count++;
  }
  const sorted = Object.values(map).sort((a,b)=>b.count-a.count);
  const total  = screenshots.length;
  return (
    <div className="space-y-2.5">
      {sorted.slice(0,7).map(app=>{
        const pct = Math.round((app.count/total)*100);
        return (
          <div key={app.name} className="flex items-center gap-2">
            <span className="text-sm w-5 text-center shrink-0">{app.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between mb-1">
                <span className="text-[11px] font-semibold text-gray-700 truncate">{app.name}</span>
                <span className="text-[10px] text-gray-400 ml-1 shrink-0">{pct}%</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700" style={{width:`${pct}%`,backgroundColor:app.color}}/>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Category filter ───────────────────────────────────────────────────
const CATEGORIES = ["All","Design","Dev","AI","Social","Work","Media","Other"];

// ── Live countdown ────────────────────────────────────────────────────
function LiveCountdown({ seconds }) {
  const m = Math.floor(seconds/60);
  const s = seconds%60;
  return (
    <span className="text-green-300 text-[10px] font-mono">
      {m}:{String(s).padStart(2,"0")}
    </span>
  );
}

// ── Main ──────────────────────────────────────────────────────────────
export default function ScreenCapturePage() {
  const [employees,        setEmployees]        = useState([]);
  const [empLoading,       setEmpLoading]        = useState(true);
  const [empSearch,        setEmpSearch]         = useState("");
  const [selectedEmp,      setSelectedEmp]       = useState(null);
  const [date,             setDate]              = useState(todayStr());
  const [screenshots,      setScreenshots]       = useState([]);
  const [loading,          setLoading]           = useState(false);
  const [error,            setError]             = useState(null);
  const [hasFetched,       setHasFetched]        = useState(false);
  const [lightboxIdx,      setLightboxIdx]       = useState(null);
  const [viewMode,         setViewMode]          = useState("timeline");
  const [catFilter,        setCatFilter]         = useState("All");
  const [screenshotSearch, setScreenshotSearch]  = useState("");
  const [autoRefresh,      setAutoRefresh]       = useState(false);
  const [countdown,        setCountdown]         = useState(180); // 3 min in seconds
  const intervalRef  = useRef(null);
  const countdownRef = useRef(null);

  // ── load employees list ───────────────────────────────────────────
  useEffect(()=>{
    (async()=>{
      try {
        const r = await fetch(`${API_BASE}/api/admin/screenshots/employees`,{headers:getHeaders()});
        const j = await r.json();
        setEmployees(j.data??[]);
      } catch { /* silent */ }
      finally { setEmpLoading(false); }
    })();
  },[]);

  // ── core fetch ───────────────────────────────────────────────────
  const fetchScreenshots = useCallback(async(silent=false)=>{
    if(!selectedEmp) return;
    if(!silent){ setLoading(true); setError(null); }
    try {
      const r = await fetch(
        `${API_BASE}/api/admin/screenshots?employee_id=${selectedEmp}&date=${date}`,
        {headers:getHeaders()}
      );
      if(!r.ok) throw new Error(`HTTP ${r.status}`);
      const j = await r.json();
      const list = Array.isArray(j)?j:(j.data??j.screenshots??[]);
      setScreenshots(list);
      setHasFetched(true);
    } catch(e){ if(!silent) setError(e.message); }
    finally { if(!silent) setLoading(false); }
  },[selectedEmp,date]);

  // ── AUTO-FETCH when employee or date changes ──────────────────────
  useEffect(()=>{
    if(!selectedEmp) return;
    setHasFetched(false);
    setScreenshots([]);
    setCatFilter("All");
    setScreenshotSearch("");
    fetchScreenshots(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[selectedEmp, date]);

  // ── Live auto-refresh interval ────────────────────────────────────
  useEffect(()=>{
    // clear old timers
    if(intervalRef.current)  clearInterval(intervalRef.current);
    if(countdownRef.current) clearInterval(countdownRef.current);

    if(!autoRefresh || !selectedEmp) return;

    // reset countdown
    setCountdown(180);

    // fetch every 3 min
    intervalRef.current = setInterval(()=>{
      fetchScreenshots(true);
      setCountdown(180);
    }, 180_000);

    // tick countdown every second
    countdownRef.current = setInterval(()=>{
      setCountdown(c=>c>0?c-1:0);
    },1000);

    return ()=>{
      clearInterval(intervalRef.current);
      clearInterval(countdownRef.current);
    };
  },[autoRefresh, selectedEmp, fetchScreenshots]);

  // when live is turned on, also immediately refetch
  const toggleLive = () => {
    const next = !autoRefresh;
    setAutoRefresh(next);
    if(next && selectedEmp) fetchScreenshots(false);
  };

  const empInfo = employees.find(e=>e.id===selectedEmp);

  // filter employees
  const filteredEmps = employees.filter(e=>
    !empSearch || e.name.toLowerCase().includes(empSearch.toLowerCase())
  );

  // filter screenshots
  const filteredShots = screenshots.filter(s=>{
    const app = detectApp(s);
    if(catFilter!=="All" && app.category!==catFilter) return false;
    if(screenshotSearch){
      const q = screenshotSearch.toLowerCase();
      if(![s.active_window||"",s.window_title||"",app.name].join(" ").toLowerCase().includes(q)) return false;
    }
    return true;
  });

  // group by hour
  const grouped = {};
  for (const s of filteredShots) {
    try {
      const h = new Date((s.captured_at||s.created_at||"").replace(" ","T")).getHours();
      if(!grouped[h]) grouped[h]=[];
      grouped[h].push(s);
    } catch { /* skip */ }
  }
  const hours    = Object.keys(grouped).map(Number).sort((a,b)=>a-b);
  const flatList = hours.flatMap(h=>grouped[h]);

  // top apps for hero chips
  const appMap = {};
  for (const s of screenshots) { const a=detectApp(s).name; appMap[a]=(appMap[a]||0)+1; }
  const topApps = Object.entries(appMap).sort((a,b)=>b[1]-a[1]).slice(0,3);

  // heatmap
  const heatmap = Array(24).fill(0);
  for (const s of screenshots) {
    try { heatmap[new Date((s.captured_at||s.created_at||"").replace(" ","T")).getHours()]++; } catch {}
  }
  const maxHeat = Math.max(...heatmap,1);

  return (
    <div className="flex flex-col gap-5" style={{height:"calc(100vh - 80px)"}}>

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <div className="relative bg-gradient-to-br from-slate-800 via-slate-900 to-violet-900 rounded-2xl p-5 overflow-hidden shrink-0">
        <div className="absolute inset-0 opacity-20 pointer-events-none"
          style={{backgroundImage:"radial-gradient(circle at 15% 60%,#7c3aed 0%,transparent 45%),radial-gradient(circle at 85% 20%,#3b82f6 0%,transparent 35%)"}}/>
        <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-5 h-5 rounded-md bg-red-500 flex items-center justify-center">
                <div className={`w-2 h-2 rounded-full bg-white ${autoRefresh?"animate-ping":""}`}/>
              </div>
              <span className="text-red-400 text-[10px] font-bold tracking-widest uppercase">
                {autoRefresh ? "Live — Auto Refresh" : "Screen Surveillance"}
              </span>
              {autoRefresh && <LiveCountdown seconds={countdown}/>}
            </div>
            <h1 className="text-white text-lg font-bold mb-0.5">Screen Capture Monitor</h1>
            <p className="text-slate-400 text-xs max-w-lg">
              Click any employee to instantly view their screenshots. Enable Live for auto-refresh every 3 minutes.
            </p>
            {hasFetched && topApps.length>0 && (
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                {topApps.map(([name,count])=>{
                  const sig=APP_SIGNATURES.find(s=>s.name===name)||{icon:"🖥️",color:"#64748b"};
                  return (
                    <div key={name} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 border border-white/10 text-xs">
                      <span>{sig.icon}</span>
                      <span className="text-white/80 font-medium">{name}</span>
                      <span className="text-white/40">{count}×</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* date + live controls */}
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={toggleLive}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${autoRefresh?"bg-green-500 border-green-400 text-white shadow-lg shadow-green-900/40":"bg-white/10 border-white/20 text-white hover:bg-white/20"}`}>
              {autoRefresh?<Wifi size={12}/>:<WifiOff size={12}/>}
              {autoRefresh?"Live ON":"Live OFF"}
            </button>
            {[{l:"Today",o:0},{l:"Yesterday",o:-1}].map(({l,o})=>{
              const v=shiftDate(todayStr(),o);
              return (
                <button key={l} onClick={()=>setDate(v)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${date===v?"bg-white text-slate-800 shadow":"bg-white/10 text-white border border-white/20 hover:bg-white/20"}`}>
                  {l}
                </button>
              );
            })}
            <div className="flex items-center bg-white/10 border border-white/20 rounded-lg overflow-hidden">
              <button onClick={()=>setDate(shiftDate(date,-1))} className="px-2 py-1.5 text-white hover:bg-white/20 border-r border-white/20 transition-colors"><ChevronLeft size={13}/></button>
              <label className="flex items-center gap-1.5 px-3 py-1.5 cursor-pointer">
                <Calendar size={11} className="text-white/60"/>
                <input type="date" value={date} onChange={e=>setDate(e.target.value)}
                  className="outline-none bg-transparent text-xs text-white w-24 [color-scheme:dark]"/>
              </label>
              <button onClick={()=>setDate(shiftDate(date,1))} className="px-2 py-1.5 text-white hover:bg-white/20 border-l border-white/20 transition-colors"><ChevronRight size={13}/></button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ──────────────────────────────────────────────────── */}
      <div className="flex gap-5 flex-1 min-h-0">

        {/* ── LEFT SIDEBAR ────────────────────────────────────────── */}
        <div className="w-60 shrink-0 flex flex-col gap-3 overflow-y-auto pb-4" style={{maxHeight:"100%"}}>

          {/* Employee list card */}
          <div className="bg-white rounded-2xl min-h-[250px] border border-gray-100 shadow-sm flex flex-col" >
            {/* sticky header */}
            <div className="px-4 py-2.5 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-2 mb-2">
                <Users size={12} className="text-violet-500"/>
                <p className="text-xs font-bold text-gray-700">Employees</p>
                <span className="ml-auto text-[10px] text-gray-400 font-medium">{employees.length}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5">
                <Search size={10} className="text-gray-400 shrink-0"/>
                <input value={empSearch} onChange={e=>setEmpSearch(e.target.value)}
                  placeholder="Search employee…"
                  className="text-[11px] outline-none bg-transparent text-gray-600 w-full"/>
                {empSearch && <button onClick={()=>setEmpSearch("")} className="text-gray-400 hover:text-gray-600 shrink-0"><X size={9}/></button>}
              </div>
            </div>

            {/* scrollable employee list */}
            <div className="overflow-y-auto" style={{maxHeight:"260px"}}>
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
                    <button key={emp.id}
                      onClick={()=>setSelectedEmp(emp.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-all border-l-2 ${
                        selectedEmp===emp.id
                          ? "bg-violet-50 border-violet-500"
                          : "border-transparent hover:bg-gray-50"
                      }`}
                    >
                      <EmpAvatar emp={emp} size="sm"/>
                      <p className={`text-xs font-semibold truncate flex-1 ${selectedEmp===emp.id?"text-violet-700":"text-gray-700"}`}>
                        {emp.name}
                      </p>
                      {selectedEmp===emp.id && (
                        loading
                          ? <div className="w-3 h-3 border border-violet-400 border-t-transparent rounded-full animate-spin shrink-0"/>
                          : <div className="w-1.5 h-1.5 rounded-full bg-violet-500 shrink-0"/>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* hint */}
            {!selectedEmp && !empLoading && (
              <div className="px-4 py-2.5 border-t border-gray-50 shrink-0">
                <p className="text-[10px] text-gray-400 text-center">👆 Click an employee to view screenshots</p>
              </div>
            )}
          </div>

          {/* manual refresh — only shown when employee is selected */}
          {selectedEmp && (
            <button onClick={()=>fetchScreenshots(false)} disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold text-violet-600 border border-violet-200 hover:bg-violet-50 disabled:opacity-40 transition-all">
              <RefreshCw size={12} className={loading?"animate-spin":""}/>
              {loading?"Refreshing…":"Refresh Now"}
            </button>
          )}

          {/* Activity heatmap */}
          {hasFetched && screenshots.length>0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 shrink-0">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={12} className="text-violet-500"/>
                <p className="text-xs font-bold text-gray-700">Activity Heatmap</p>
              </div>
              <div className="flex gap-0.5 items-end h-10">
                {heatmap.map((count,h)=>(
                  <div key={h} title={`${String(h).padStart(2,"0")}:00 — ${count} captures`}
                    className="flex-1 rounded-sm transition-all duration-300 cursor-default"
                    style={{
                      height: count>0?`${Math.max(15,(count/maxHeat)*100)}%`:"4px",
                      backgroundColor: count>0?`rgba(124,58,237,${0.2+(count/maxHeat)*0.8})`:"#f1f5f9",
                    }}/>
                ))}
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[9px] text-gray-400">12am</span>
                <span className="text-[9px] text-gray-400">12pm</span>
                <span className="text-[9px] text-gray-400">11pm</span>
              </div>
            </div>
          )}

          {/* App usage */}
          {hasFetched && screenshots.length>0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 shrink-0">
              <div className="flex items-center gap-2 mb-3">
                <Activity size={12} className="text-violet-500"/>
                <p className="text-xs font-bold text-gray-700">App Usage</p>
              </div>
              <AppUsage screenshots={screenshots}/>
            </div>
          )}

          {/* Session stats */}
          {hasFetched && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 shrink-0">
              <div className="flex items-center gap-2 mb-3">
                <Shield size={12} className="text-violet-500"/>
                <p className="text-xs font-bold text-gray-700">Session Stats</p>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div className="bg-violet-50 rounded-xl p-2.5 text-center border border-violet-100">
                  <p className="text-xl font-bold text-violet-700">{screenshots.length}</p>
                  <p className="text-[9px] text-violet-500 font-semibold">Captures</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-2.5 text-center border border-slate-100">
                  <p className="text-xl font-bold text-slate-700">{hours.length}</p>
                  <p className="text-[9px] text-slate-500 font-semibold">Active Hrs</p>
                </div>
              </div>
              {screenshots.length>0 && (
                <>
                  <div className="bg-gray-50 rounded-xl px-3 py-2 border border-gray-100 mb-2">
                    <p className="text-[9px] text-gray-400">First capture</p>
                    <p className="text-xs font-bold text-gray-700">
                      {fmtTime(screenshots[screenshots.length-1]?.captured_at||screenshots[screenshots.length-1]?.created_at)}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl px-3 py-2 border border-gray-100">
                    <p className="text-[9px] text-gray-400">Last capture</p>
                    <p className="text-xs font-bold text-gray-700">
                      {fmtTime(screenshots[0]?.captured_at||screenshots[0]?.created_at)}
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* ── RIGHT CONTENT ────────────────────────────────────────── */}
        <div className="flex-1 min-w-0 flex flex-col gap-4 overflow-y-auto pb-4" style={{maxHeight:"100%"}}>

          {/* Toolbar — shown when screenshots exist */}
          {hasFetched && screenshots.length>0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 shrink-0 sticky top-0 z-20">
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  {empInfo && <EmpAvatar emp={empInfo} size="sm"/>}
                  <div>
                    <p className="text-sm font-bold text-gray-800">{empInfo?.name}</p>
                    <p className="text-[11px] text-gray-400">
                      {fmtDate(date)} · {filteredShots.length} of {screenshots.length} shown
                      {autoRefresh && <span className="ml-2 text-green-500 font-semibold">● Live</span>}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl">
                  <button onClick={()=>setViewMode("timeline")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${viewMode==="timeline"?"bg-white text-gray-800 shadow-sm":"text-gray-500 hover:text-gray-700"}`}>
                    <List size={11}/> Timeline
                  </button>
                  <button onClick={()=>setViewMode("grid")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${viewMode==="grid"?"bg-white text-gray-800 shadow-sm":"text-gray-500 hover:text-gray-700"}`}>
                    <Grid3X3 size={11}/> Grid
                  </button>
                </div>
              </div>

              {/* Category filter + search */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
                  {CATEGORIES.map(cat=>(
                    <button key={cat} onClick={()=>setCatFilter(cat)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all ${catFilter===cat?"bg-violet-600 text-white shadow-sm":"bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                      {cat}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 ml-auto">
                  <Search size={10} className="text-gray-400 shrink-0"/>
                  <input value={screenshotSearch} onChange={e=>setScreenshotSearch(e.target.value)}
                    placeholder="Search app or window…"
                    className="text-[11px] outline-none bg-transparent text-gray-600 w-36"/>
                  {screenshotSearch && (
                    <button onClick={()=>setScreenshotSearch("")} className="text-gray-400 hover:text-gray-600"><X size={10}/></button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Loading skeleton */}
          {loading && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-24 gap-3">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-violet-50 border border-violet-100 flex items-center justify-center">
                  <Monitor size={28} className="text-violet-400"/>
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white animate-ping"/>
                </div>
              </div>
              <p className="text-sm font-bold text-gray-700">Loading screenshots…</p>
              <p className="text-xs text-gray-400">{empInfo?.name}</p>
            </div>
          )}

          {/* Error */}
          {error&&!loading && (
            <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4 flex items-center gap-3 text-red-600 text-sm">
              <AlertCircle size={16}/> {error}
              <button onClick={()=>fetchScreenshots(false)} className="ml-auto text-xs font-semibold underline">Retry</button>
            </div>
          )}

          {/* Empty state — no employee selected */}
          {!selectedEmp && !loading && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-24 gap-4">
              <div className="w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center">
                <Camera size={36} className="text-slate-300"/>
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-gray-700 mb-1">Select an employee to view screenshots</p>
                <p className="text-xs text-gray-400 max-w-xs">Click any employee from the left panel — screenshots will load instantly.</p>
              </div>
            </div>
          )}

          {/* No screenshots for this date */}
          {hasFetched&&!loading&&screenshots.length===0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-24 gap-4">
              <div className="w-20 h-20 rounded-3xl bg-violet-50 flex items-center justify-center">
                <Monitor size={36} className="text-violet-200"/>
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-gray-700 mb-1">No screenshots for {fmtDate(date)}</p>
                <p className="text-xs text-gray-400">{empInfo?.name} may not have been active, or screenshots weren't captured.</p>
              </div>
            </div>
          )}

          {/* No filter match */}
          {hasFetched&&!loading&&screenshots.length>0&&filteredShots.length===0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-12 gap-3">
              <Filter size={28} className="text-gray-200"/>
              <p className="text-sm font-bold text-gray-600">No screenshots match this filter</p>
              <button onClick={()=>{setCatFilter("All");setScreenshotSearch("");}}
                className="text-xs text-violet-600 font-semibold hover:underline">Clear filters</button>
            </div>
          )}

          {/* Timeline */}
          {hasFetched&&!loading&&filteredShots.length>0&&viewMode==="timeline" && (
            <div>
              {hours.map(hour=>{
                const hShots = grouped[hour];
                const offset = hours.slice(0,hours.indexOf(hour)).reduce((a,h)=>a+grouped[h].length,0);
                return (
                  <TimelineGroup key={hour}
                    hour={String(hour).padStart(2,"0")}
                    screenshots={hShots}
                    onOpen={setLightboxIdx}
                    globalOffset={offset}
                  />
                );
              })}
            </div>
          )}

          {/* Grid */}
          {hasFetched&&!loading&&filteredShots.length>0&&viewMode==="grid" && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {flatList.map((s,i)=>(
                <ScreenshotCard key={s.id??i} screenshot={s} index={i} onOpen={setLightboxIdx}/>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIdx!==null&&flatList[lightboxIdx] && (
        <Lightbox
          screenshot={flatList[lightboxIdx]}
          emp={empInfo||{name:"Employee",id:0}}
          date={date}
          total={flatList.length}
          currentIdx={lightboxIdx}
          onClose={()=>setLightboxIdx(null)}
          onPrev={()=>setLightboxIdx(i=>Math.max(0,i-1))}
          onNext={()=>setLightboxIdx(i=>Math.min(flatList.length-1,i+1))}
          hasPrev={lightboxIdx>0}
          hasNext={lightboxIdx<flatList.length-1}
        />
      )}
    </div>
  );
}
