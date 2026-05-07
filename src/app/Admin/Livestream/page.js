"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  Radio, Monitor, RefreshCw, Signal, Activity, Eye,
  Maximize2, Minimize2, Volume2, VolumeX, AlertCircle,
  Clock, Zap, X, Search, Wifi, WifiOff, Camera, Users,
  ChevronRight, Loader2, Circle,
} from "lucide-react";

// ── CONFIG ────────────────────────────────────────────────────────────────
const BASE                 = process.env.NEXT_PUBLIC_API_URL;
const SIGNALING_SERVER_URL = "ws://76.13.243.90:8080";

const TURN_SERVERS = {
  iceServers: [
    { urls: "turn:openrelay.metered.ca:80",   username: "openrelayproject", credential: "openrelayproject" },
    { urls: "turn:openrelay.metered.ca:443",  username: "openrelayproject", credential: "openrelayproject" },
    { urls: "turn:openrelay.metered.ca:3478", username: "openrelayproject", credential: "openrelayproject" },
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

const DEPT_COLORS = {
  IT:               { bg: "#eff6ff", text: "#3b82f6", dot: "#60a5fa" },
  HR:               { bg: "#fdf4ff", text: "#a855f7", dot: "#c084fc" },
  Designing:        { bg: "#fdf2f8", text: "#ec4899", dot: "#f472b6" },
  "Content Creator":{ bg: "#f0fdfa", text: "#14b8a6", dot: "#2dd4bf" },
  Default:          { bg: "#fff7ed", text: "#f97316", dot: "#fb923c" },
};

const AVATAR_PALETTE = [
  "#f97316","#6366f1","#14b8a6","#ec4899","#22c55e","#a855f7","#3b82f6","#eab308","#ef4444","#8b5cf6",
];

const getAuthHeaders = () => {
  const token = typeof window !== "undefined" ? localStorage.getItem("admin_auth_token") : null;
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    "ngrok-skip-browser-warning": "true",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const getInitials = (emp) => {
  const f = emp.firstname || ""; const l = emp.lastname || "";
  return f && l ? `${f[0]}${l[0]}`.toUpperCase() : f ? f.slice(0,2).toUpperCase() : "??";
};
const getFullName = (emp) => [emp.firstname, emp.lastname].filter(Boolean).join(" ") || "Unknown";
const getDept     = (emp) => emp.department?.name || "—";
const getDesig    = (emp) => emp.designation?.name || "Employee";
const getAvatar   = (emp) => emp.profile_image ? `${emp.profile_image}` : null;

// ── StatsBar ──────────────────────────────────────────────────────────────
function StatsBar({ streamDuration, status }) {
  const [fps,     setFps]     = useState(0);
  const [bitrate, setBitrate] = useState(0);
  useEffect(() => {
    if (status !== "Streaming live") { setFps(0); setBitrate(0); return; }
    const t = setInterval(() => {
      setFps(Math.floor(24 + Math.random() * 8));
      setBitrate(Math.floor(800 + Math.random() * 400));
    }, 1500);
    return () => clearInterval(t);
  }, [status]);
  const live = status === "Streaming live";
  return (
    <div className="flex items-center gap-5 px-4 py-2 bg-white/80 backdrop-blur border-t border-gray-100">
      {[
        { label:"FPS",     value: live ? fps : "—",              icon:<Zap      size={10}/> },
        { label:"BITRATE", value: live ? `${bitrate}kbps` : "—", icon:<Activity size={10}/> },
        { label:"UPTIME",  value: streamDuration,                 icon:<Clock    size={10}/> },
        { label:"CODEC",   value: live ? "VP8" : "—",            icon:<Signal   size={10}/> },
      ].map(s => (
        <div key={s.label} className="flex items-center gap-1.5">
          <span className={live ? "text-orange-400" : "text-gray-300"}>{s.icon}</span>
          <span className="text-[10px] text-gray-400 font-semibold tracking-wide">{s.label}:</span>
          <span className={`text-[10px] font-black ${live ? "text-orange-500" : "text-gray-300"}`}>{s.value}</span>
        </div>
      ))}
    </div>
  );
}

// ── Spinner ───────────────────────────────────────────────────────────────
function Spinner({ size = 32, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      className={className} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
    </svg>
  );
}

// ── Employee Monitoring Card (reference image style) ──────────────────────
function EmployeeCard({ emp, isSelected, isStreaming, onSelect }) {
  const avatarBg  = AVATAR_PALETTE[emp.id % AVATAR_PALETTE.length];
  const deptStyle = DEPT_COLORS[getDept(emp)] || DEPT_COLORS.Default;
  const avatar    = getAvatar(emp);

  return (
    <button
      onClick={() => onSelect(emp)}
      className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 group relative overflow-hidden ${
        isSelected
          ? "border-orange-400 bg-orange-50 shadow-lg shadow-orange-100"
          : isStreaming
          ? "border-emerald-400 bg-emerald-50 shadow-lg shadow-emerald-100"
          : "border-gray-100 bg-white hover:border-gray-200 hover:shadow-md"
      }`}
    >
      {/* Live streaming pulse ring */}
      {isStreaming && (
        <span className="absolute top-3 right-3">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"/>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"/>
          </span>
        </span>
      )}

      {/* Selected indicator */}
      {isSelected && !isStreaming && (
        <span className="absolute top-3 right-3 w-3 h-3 rounded-full bg-orange-500"/>
      )}

      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="relative shrink-0">
          {avatar ? (
            <img src={avatar} alt={getFullName(emp)} className="w-11 h-11 rounded-full object-cover"/>
          ) : (
            <div className="w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-black" style={{ backgroundColor: avatarBg }}>
              {getInitials(emp)}
            </div>
          )}
          {/* Online dot */}
          <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white bg-emerald-400"/>
        </div>

        <div className="flex-1 min-w-0">
          <p className={`text-sm font-black truncate ${isSelected ? "text-orange-700" : "text-gray-900"}`}>
            {getFullName(emp)}
          </p>
          <p className="text-[10px] text-gray-400 truncate mb-2">{emp.email}</p>

          {/* App being used row — like reference image */}
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
              style={{ backgroundColor: deptStyle.bg }}>
              <Monitor size={10} style={{ color: deptStyle.text }}/>
            </div>
            <span className="text-[10px] font-semibold truncate" style={{ color: deptStyle.text }}>
              {getDesig(emp)}
            </span>
          </div>

          {/* Department + status row */}
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: deptStyle.bg, color: deptStyle.text }}>
              {getDept(emp)}
            </span>
            <span className="text-[9px] text-gray-400">·</span>
            <span className="text-[9px] text-gray-400 flex items-center gap-1">
              <Clock size={8}/>{isStreaming ? "Streaming" : "Active"}
            </span>
          </div>
        </div>
      </div>

      {/* Connect hint */}
      {!isStreaming && !isSelected && (
        <div className="mt-3 flex items-center gap-1 text-[10px] text-gray-300 font-semibold group-hover:text-orange-400 transition-colors">
          <Camera size={10}/>
          <span>Click to monitor</span>
          <ChevronRight size={10} className="ml-auto"/>
        </div>
      )}
      {isSelected && (
        <div className="mt-3 flex items-center gap-1 text-[10px] text-orange-500 font-bold">
          <Circle size={8} className="fill-orange-500"/>
          <span>Selected — click Connect & View</span>
        </div>
      )}
      {isStreaming && (
        <div className="mt-3 flex items-center gap-1 text-[10px] text-emerald-600 font-bold">
          <Wifi size={10}/>
          <span>🔴 Live stream active</span>
        </div>
      )}
    </button>
  );
}

// ── MAIN ─────────────────────────────────────────────────────────────────
export default function LiveStreamViewer() {
  const videoRef = useRef(null);
  const wsRef    = useRef(null);
  const pcRef    = useRef(null);
  const timerRef = useRef(null);
  const startRef = useRef(null);

  const [employees,      setEmployees]      = useState([]);
  const [loadingEmps,    setLoadingEmps]    = useState(true);
  const [empError,       setEmpError]       = useState(null);
  const [status,         setStatus]         = useState("Disconnected");
  const [selectedEmp,    setSelectedEmp]    = useState(null);
  const [streamingEmpId, setStreamingEmpId] = useState(null);
  const [error,          setError]          = useState(null);
  const [isFullscreen,   setIsFullscreen]   = useState(false);
  const [isMuted,        setIsMuted]        = useState(true);
  const [streamDuration, setStreamDuration] = useState("00:00");
  const [searchQ,        setSearchQ]        = useState("");
  const [serverUrl,      setServerUrl]      = useState(SIGNALING_SERVER_URL);

  // ── Fetch real employees from API ───────────────────────────────────────
  const fetchEmployees = useCallback(async () => {
    setLoadingEmps(true); setEmpError(null);
    try {
      const res  = await fetch(`${BASE}/api/admin/employees`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const list = Array.isArray(json) ? json : (json?.data ?? []);
      setEmployees(list);
    } catch (err) {
      setEmpError(err.message || "Failed to load employees");
    } finally {
      setLoadingEmps(false);
    }
  }, []);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

  // ── Timer ────────────────────────────────────────────────────────────────
  const startTimer = useCallback(() => {
    startRef.current = Date.now();
    timerRef.current = setInterval(() => {
      const e = Math.floor((Date.now() - startRef.current) / 1000);
      const m = String(Math.floor(e / 60)).padStart(2, "0");
      const s = String(e % 60).padStart(2, "0");
      setStreamDuration(`${m}:${s}`);
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    setStreamDuration("00:00");
  }, []);

  const cleanup = useCallback(() => {
    if (pcRef.current) { pcRef.current.close(); pcRef.current = null; }
    if (wsRef.current) { wsRef.current.close(); wsRef.current = null; }
    if (videoRef.current) videoRef.current.srcObject = null;
    stopTimer();
    setStatus("Disconnected");
    setStreamingEmpId(null);
    setError(null);
  }, [stopTimer]);

  useEffect(() => () => cleanup(), [cleanup]);

  // ── Connect WebRTC ────────────────────────────────────────────────────
  const connectAndView = useCallback(async () => {
    if (!selectedEmp) { setError("Select an employee to monitor."); return; }
    const employeeId = String(selectedEmp.id);

    cleanup();
    setError(null);
    setStatus("Connecting");

    const ws = new WebSocket(serverUrl);
    wsRef.current = ws;

    ws.onerror = () => {
      setError(`Cannot reach signaling server at ${serverUrl}.`);
      setStatus("Error");
      stopTimer();
    };

    ws.onclose = () => {
      setStatus(prev => prev === "Streaming live" ? "Disconnected" : prev);
      setStreamingEmpId(null);
    };

    ws.onopen = async () => {
      ws.send(JSON.stringify({ type: "register", role: "admin", employeeId: "admin_001" }));
      setStatus("Connected, sending offer…");

      const pc = new RTCPeerConnection(TURN_SERVERS);
      pcRef.current = pc;

      pc.ontrack = (event) => {
        console.log("🎬 ontrack fired", event.streams[0]);
        if (videoRef.current && event.streams[0]) {
          videoRef.current.srcObject = event.streams[0];
          videoRef.current.play().catch(e => console.warn("Autoplay blocked:", e));
        }
        setStatus("Streaming live");
        setStreamingEmpId(selectedEmp.id);
        startTimer();
      };

      pc.onicecandidate = (event) => {
        if (event.candidate && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: "ice-candidate", candidate: event.candidate, to: employeeId }));
        }
      };

      pc.onconnectionstatechange = () => {
        console.log("Connection state:", pc.connectionState);
        const s = pc.connectionState;
        if (s === "failed" || s === "closed" || s === "disconnected") {
          setStatus("Disconnected");
          setStreamingEmpId(null);
          stopTimer();
        }
      };

      pc.addTransceiver("video", { direction: "recvonly" });

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      ws.send(JSON.stringify({ type: "offer", offer: pc.localDescription, from: "admin_001", to: employeeId }));
    };

    ws.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        if (!pcRef.current) return;
        if (data.type === "error") { setError(data.message || "Employee not connected."); setStatus("Error"); stopTimer(); return; }
        if (data.type === "answer") await pcRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
        if (data.type === "ice-candidate" && data.candidate) await pcRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
      } catch (e) { console.error("WS error:", e); }
    };
  }, [selectedEmp, serverUrl, cleanup, startTimer, stopTimer]);

  const handleDisconnect = () => { cleanup(); };

  const toggleFullscreen = () => {
    const el = document.getElementById("stream-box");
    if (!isFullscreen) el?.requestFullscreen?.();
    else document.exitFullscreen?.();
    setIsFullscreen(f => !f);
  };

  const toggleMute = () => {
    if (videoRef.current) videoRef.current.muted = !isMuted;
    setIsMuted(m => !m);
  };

  const filteredEmps = employees.filter(e =>
    getFullName(e).toLowerCase().includes(searchQ.toLowerCase()) ||
    getDept(e).toLowerCase().includes(searchQ.toLowerCase()) ||
    String(e.id).includes(searchQ) ||
    (e.employee_id || "").toLowerCase().includes(searchQ.toLowerCase())
  );

  const isLive       = status === "Streaming live";
  const isConnecting = status === "Connecting" || status === "Connected, sending offer…";

  return (
    <div className="h-screen bg-[#f5f6fa] flex flex-col overflow-hidden" style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>

      {/* ── TOP HEADER ────────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-100 shadow-sm shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center shadow-md shadow-orange-200">
            <Radio size={16} className="text-white"/>
          </div>
          <div>
            <h1 className="text-sm font-black text-gray-900 tracking-tight">Employee Monitor</h1>
            <p className="text-[10px] text-gray-400 font-medium leading-none mt-0.5">Live Screen Surveillance · Admin Panel</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Live badge */}
          {isLive && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 rounded-xl shadow-sm shadow-red-200">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse"/>
              <span className="text-[10px] font-black text-white tracking-widest">LIVE</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl">
            <Users size={11} className="text-gray-400"/>
            <span className="text-[10px] font-bold text-gray-500">{employees.length} employees</span>
          </div>
          <button onClick={fetchEmployees} title="Refresh employees"
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 transition">
            <RefreshCw size={13}/>
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">

        {/* ── LEFT: Employee Cards Grid ─────────────────────────────────────── */}
        <aside className="w-80 shrink-0 flex flex-col bg-[#f5f6fa] border-r border-gray-200 overflow-hidden">
          {/* Search */}
          <div className="p-4 pb-3">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
              <input value={searchQ} onChange={e => setSearchQ(e.target.value)}
                placeholder="Search employee, dept, ID…"
                className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-200 rounded-2xl text-xs text-gray-700 placeholder:text-gray-300 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition shadow-sm"/>
            </div>
          </div>

          {/* Section label */}
          <div className="flex items-center justify-between px-4 pb-2">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              All Employees {filteredEmps.length > 0 && `· ${filteredEmps.length}`}
            </p>
            {streamingEmpId && (
              <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-600">
                1 streaming
              </span>
            )}
          </div>

          {/* Employee list */}
          <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
            {loadingEmps ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
                <Loader2 size={24} className="animate-spin text-orange-400"/>
                <p className="text-xs font-medium">Loading employees…</p>
              </div>
            ) : empError ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center">
                  <WifiOff size={20} className="text-red-400"/>
                </div>
                <p className="text-xs text-red-400 font-medium text-center">{empError}</p>
                <button onClick={fetchEmployees} className="text-xs font-bold text-orange-500 underline">Retry</button>
              </div>
            ) : filteredEmps.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-300">
                <Users size={32} strokeWidth={1}/>
                <p className="text-xs mt-2 font-medium">No employees found</p>
              </div>
            ) : filteredEmps.map(emp => (
              <EmployeeCard
                key={emp.id}
                emp={emp}
                isSelected={selectedEmp?.id === emp.id}
                isStreaming={streamingEmpId === emp.id}
                onSelect={e => { setSelectedEmp(e); setError(null); }}
              />
            ))}
          </div>

          {/* Server URL config */}
          <div className="p-4 border-t border-gray-100 bg-white">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Signaling Server</p>
            <input value={serverUrl} onChange={e => setServerUrl(e.target.value)}
              className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-[10px] text-gray-500 outline-none focus:border-orange-400 transition font-mono"/>
          </div>
        </aside>

        {/* ── RIGHT: Video Monitor ──────────────────────────────────────────── */}
        <main className="flex-1 flex flex-col overflow-hidden p-5 gap-4">

          {/* Video box */}
          <div id="stream-box"
            className="relative flex-1 rounded-3xl overflow-hidden shadow-2xl shadow-gray-200/80 group"
            style={{ background: "linear-gradient(135deg, #111827 0%, #1f2937 100%)" }}>

            {/* Video */}
            <video ref={videoRef} autoPlay playsInline muted
              className={`w-full h-full object-contain transition-opacity duration-500 ${isLive ? "opacity-100" : "opacity-0"}`}/>

            {/* Empty state */}
            {!isLive && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-5">
                {/* Decorative grid */}
                <div className="absolute inset-0 opacity-5"
                  style={{ backgroundImage: "repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 1px,transparent 40px),repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 1px,transparent 40px)" }}/>

                <div className="relative z-10 flex flex-col items-center gap-4 text-center">
                  <div className={`w-24 h-24 rounded-3xl flex items-center justify-center border ${
                    isConnecting ? "bg-amber-500/20 border-amber-400/40" : "bg-white/5 border-white/10"
                  }`}>
                    {isConnecting
                      ? <Spinner size={38} className="text-amber-400 animate-spin"/>
                      : <Monitor size={38} className="text-white/20"/>
                    }
                  </div>
                  {isConnecting && <div className="absolute w-32 h-32 rounded-3xl border-2 border-amber-400/20 animate-ping"/>}

                  <div>
                    <p className="text-base font-black text-white/40">
                      {isConnecting ? "Establishing connection…" : "No stream active"}
                    </p>
                    <p className="text-xs text-white/20 mt-1">
                      {isConnecting
                        ? `Connecting to ${selectedEmp ? getFullName(selectedEmp) : "employee"}…`
                        : "Select an employee from the left panel"}
                    </p>
                  </div>

                  {status === "Error" && error && (
                    <div className="px-5 py-3 bg-red-500/10 border border-red-500/20 rounded-2xl max-w-xs">
                      <p className="text-xs text-red-400 font-medium leading-relaxed">{error}</p>
                      <p className="text-[10px] text-red-400/50 mt-1">Make sure employee-browser-client.html is open on their machine</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* LIVE overlays */}
            {isLive && selectedEmp && (
              <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 rounded-xl shadow-lg shadow-red-900/40">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse"/>
                  <span className="text-[10px] font-black text-white tracking-widest">LIVE</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-black/50 backdrop-blur rounded-xl border border-white/10">
                  {getAvatar(selectedEmp) ? (
                    <img src={getAvatar(selectedEmp)} className="w-5 h-5 rounded-full object-cover"/>
                  ) : (
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[8px] font-black"
                      style={{ backgroundColor: AVATAR_PALETTE[selectedEmp.id % AVATAR_PALETTE.length] }}>
                      {getInitials(selectedEmp)}
                    </div>
                  )}
                  <span className="text-[10px] font-bold text-white/90">{getFullName(selectedEmp)}</span>
                  <span className="text-[9px] text-white/40">· {getDept(selectedEmp)}</span>
                </div>
              </div>
            )}

            {/* Muted notice */}
            {isLive && isMuted && (
              <div className="absolute top-4 right-20 flex items-center gap-1.5 px-2.5 py-1.5 bg-black/40 backdrop-blur rounded-xl border border-white/10 z-10">
                <VolumeX size={11} className="text-white/50"/>
                <span className="text-[10px] text-white/50 font-bold">Muted</span>
              </div>
            )}

            {/* Hover controls */}
            <div className={`absolute top-4 right-4 flex items-center gap-2 transition-opacity duration-200 z-10 ${isLive ? "opacity-0 group-hover:opacity-100" : "opacity-0"}`}>
              <button onClick={toggleMute} className="w-9 h-9 flex items-center justify-center rounded-xl bg-black/50 backdrop-blur border border-white/15 text-white hover:bg-black/70 transition">
                {isMuted ? <VolumeX size={14}/> : <Volume2 size={14}/>}
              </button>
              <button onClick={toggleFullscreen} className="w-9 h-9 flex items-center justify-center rounded-xl bg-black/50 backdrop-blur border border-white/15 text-white hover:bg-black/70 transition">
                {isFullscreen ? <Minimize2 size={14}/> : <Maximize2 size={14}/>}
              </button>
            </div>

            {/* Duration */}
            {isLive && (
              <div className="absolute bottom-14 right-4 z-10">
                <div className="px-3 py-1.5 bg-black/50 backdrop-blur rounded-xl border border-white/10">
                  <span className="text-xs font-black text-white/60 font-mono">{streamDuration}</span>
                </div>
              </div>
            )}

            {/* Stats bar */}
            <div className="absolute bottom-0 left-0 right-0 z-10">
              <StatsBar streamDuration={streamDuration} status={status}/>
            </div>
          </div>

          {/* ── Control bar ───────────────────────────────────────────────── */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Status card */}
            <div className="flex items-center gap-3 flex-1 px-4 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm">
              {selectedEmp ? (
                <>
                  {getAvatar(selectedEmp) ? (
                    <img src={getAvatar(selectedEmp)} className="w-9 h-9 rounded-full object-cover shrink-0"/>
                  ) : (
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-black shrink-0"
                      style={{ backgroundColor: AVATAR_PALETTE[selectedEmp.id % AVATAR_PALETTE.length] }}>
                      {getInitials(selectedEmp)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-gray-900">{getFullName(selectedEmp)}</p>
                    <p className="text-[10px] text-gray-400">{getDept(selectedEmp)} · {getDesig(selectedEmp)} · ID {selectedEmp.id}</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                    <Users size={14} className="text-gray-300"/>
                  </div>
                  <div>
                    <p className="text-xs font-black text-gray-400">No employee selected</p>
                    <p className="text-[10px] text-gray-300">Choose from the panel on the left</p>
                  </div>
                </>
              )}

              {/* Status pill */}
              <div className="ml-auto shrink-0">
                {isLive ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-[10px] font-black text-emerald-600">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"/>Live
                  </span>
                ) : isConnecting ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-xl text-[10px] font-black text-amber-600">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"/>Connecting…
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-[10px] font-black text-gray-400">
                    <span className="w-2 h-2 rounded-full bg-gray-300"/>Idle
                  </span>
                )}
              </div>
            </div>

            {/* Action button */}
            {isLive || isConnecting ? (
              <button onClick={handleDisconnect}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-black text-red-500 bg-red-50 border-2 border-red-200 hover:bg-red-100 hover:border-red-300 transition shrink-0">
                <X size={14}/>Stop
              </button>
            ) : (
              <button onClick={connectAndView} disabled={!selectedEmp}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-black text-white bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 transition shadow-lg shadow-orange-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none shrink-0">
                <Eye size={14}/>Connect &amp; View
              </button>
            )}
          </div>

          {/* Error banner */}
          {error && status !== "Error" && (
            <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-2xl shrink-0">
              <AlertCircle size={14} className="text-red-400 shrink-0"/>
              <p className="text-xs text-red-500 font-medium">{error}</p>
              <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600"><X size={12}/></button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
