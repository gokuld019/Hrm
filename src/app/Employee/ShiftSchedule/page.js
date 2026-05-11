"use client";
import { useState, useEffect, useCallback } from "react";

// ─── API BASE ──────────────────────────────────────────────────────────────────
const BASE = "https://pencilkraft.in/api/employee";

function getAuthToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("employee_auth_token");
}

async function apiFetch(path) {
  try {
    const token = getAuthToken();
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch(`${BASE}${path}`, { headers });
    const json = await res.json();
    return json.success ? json : null;
  } catch {
    return null;
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getWeekStart(offset = 0) {
  const d = new Date();
  const day = d.getDay(); // 0=Sun
  const diff = day === 0 ? -6 : 1 - day; // Monday
  d.setDate(d.getDate() + diff + offset * 7);
  return d.toISOString().slice(0, 10);
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function toMinHrs(minutes) {
  if (!minutes) return "0h 0m";
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

const TODAY_ISO = new Date().toISOString().slice(0, 10);
const TODAY_DATE = new Date();

const DAYS_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// ─── Icon ─────────────────────────────────────────────────────────────────────
const Ic = ({ d, size = 16, stroke = "currentColor", sw = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke}
    strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
    style={{ display: "block", flexShrink: 0 }}>
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

const I = {
  users:    "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  alert:    "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z M12 9v4M12 17h.01",
  trending: "M23 6l-9.5 9.5-5-5L1 18 M17 6h6v6",
  swap:     "M7 16V4m0 0L3 8m4-4l4 4 M17 8v12m0 0l4-4m-4 4l-4-4",
  calendar: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z",
  clock:    "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2",
  settings: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z",
  bar:      "M18 20V10M12 20V4M6 20v-6",
  refresh:  "M23 4v6h-6 M1 20v-6h6 M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15",
  sun:      "M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12 M12 16A4 4 0 1 0 12 8a4 4 0 0 0 0 8z",
  moon:     "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z",
  download: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M7 10l5 5 5-5 M12 15V3",
  check:    "M20 6L9 17l-5-5",
  x:        "M18 6L6 18M6 6l12 12",
  plus:     "M12 5v14M5 12h14",
  star:     "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  zap:      "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  chevL:    "M15 18l-6-6 6-6",
  chevR:    "M9 18l6-6-6-6",
  export:   "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M17 8l-5-5-5 5 M12 3v12",
  activity: "M22 12h-4l-3 9L9 3l-3 9H2",
  bell:     "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0",
  send:     "M22 2L11 13 M22 2L15 22l-4-9-9-4 22-7z",
  upcoming: "M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z",
};

// ─── Avatar ───────────────────────────────────────────────────────────────────
const AC = ["#f97316","#6366f1","#22c55e","#ef4444","#8b5cf6","#06b6d4","#ec4899","#14b8a6","#f59e0b","#3b82f6"];
function aC(n=""){let h=0;for(let i=0;i<n.length;i++)h=(h*31+n.charCodeAt(i))&0xffffffff;return AC[Math.abs(h)%AC.length];}
const Av = ({ name, size=34 }) => (
  <div style={{ width:size, height:size, borderRadius:"50%", background:aC(name), display:"flex", alignItems:"center", justifyContent:"center", fontSize:size*0.32, fontWeight:700, color:"#fff", flexShrink:0 }}>
    {name.split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase()}
  </div>
);

// ─── Status config ─────────────────────────────────────────────────────────────
const SP = {
  "On Time":  { bg:"#f0fdf4", c:"#16a34a" },
  "Late":     { bg:"#fffbeb", c:"#d97706" },
  "Early Out":{ bg:"#fff7ed", c:"#ea580c" },
  "Absent":   { bg:"#fef2f2", c:"#dc2626" },
  "Off":      { bg:"#f9fafb", c:"#9ca3af" },
  "Day Off":  { bg:"#f9fafb", c:"#9ca3af" },
  "Upcoming": { bg:"#eff6ff", c:"#3b82f6" },
  "Late & Early Out": { bg:"#fff7ed", c:"#ea580c" },
};

const Pill = ({ s }) => {
  const cfg = SP[s] || SP["Off"];
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"3px 9px", borderRadius:99, background:cfg.bg, fontSize:11.5, fontWeight:600, color:cfg.c, whiteSpace:"nowrap" }}>
      <span style={{ width:5, height:5, borderRadius:"50%", background:cfg.c }} />{s}
    </span>
  );
};

// ─── Loading skeleton ─────────────────────────────────────────────────────────
const Skeleton = ({ w="100%", h=16, r=6 }) => (
  <div style={{ width:w, height:h, borderRadius:r, background:"linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%)", backgroundSize:"200% 100%", animation:"shimmer 1.4s infinite" }} />
);

// ─── Swap Modal ───────────────────────────────────────────────────────────────
function SwapModal({ ACCENT, onClose, onSubmit, myShift, allShifts }) {
  const [selDay, setSelDay] = useState("");
  const [reason, setReason] = useState("");
  const [busy,   setBusy]   = useState(false);

  const activeDays = myShift?.active_days?.map(d => d.charAt(0).toUpperCase() + d.slice(1)) || [];
  const ok = !!selDay;

  const submit = async () => {
    if (!ok) return;
    setBusy(true);
    await new Promise(r => setTimeout(r, 650));
    onSubmit({ day: selDay });
    setBusy(false);
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", backdropFilter:"blur(4px)", zIndex:600, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}
      onClick={onClose}>
      <div onClick={e=>e.stopPropagation()}
        style={{ background:"#fff", borderRadius:16, width:"100%", maxWidth:460, boxShadow:"0 24px 60px rgba(0,0,0,0.18)", overflow:"hidden" }}>
        <div style={{ background:`linear-gradient(135deg,${ACCENT},#ea580c)`, padding:"16px 20px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:34, height:34, borderRadius:9, background:"rgba(255,255,255,0.2)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Ic d={I.swap} stroke="#fff" size={16} />
            </div>
            <div>
              <div style={{ fontSize:14, fontWeight:700, color:"#fff" }}>Request Shift Swap</div>
              <div style={{ fontSize:11, color:"rgba(255,255,255,0.75)" }}>{myShift?.shift_name} · {myShift?.start_time}–{myShift?.end_time}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ width:28, height:28, borderRadius:7, background:"rgba(255,255,255,0.2)", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Ic d={I.x} stroke="#fff" size={13} />
          </button>
        </div>
        <div style={{ padding:"18px 20px", display:"flex", flexDirection:"column", gap:14 }}>
          <div>
            <div style={{ fontSize:12, fontWeight:700, color:"#374151", marginBottom:8 }}>Which day?</div>
            <div style={{ display:"flex", gap:5 }}>
              {DAYS_SHORT.map(d => {
                const has = activeDays.some(ad => ad.toLowerCase().startsWith(d.toLowerCase()));
                const act = selDay === d;
                return (
                  <button key={d} onClick={() => has && setSelDay(d)} disabled={!has}
                    style={{ flex:1, padding:"8px 0", border:`1.5px solid ${act?ACCENT:"#e5e7eb"}`, borderRadius:8, background:act?`${ACCENT}10`:"#fafafa", cursor:has?"pointer":"not-allowed", opacity:has?1:0.35 }}>
                    <div style={{ fontSize:10.5, fontWeight:700, color:act?ACCENT:"#6b7280" }}>{d}</div>
                    <div style={{ fontSize:9.5, color:has?(act?ACCENT:"#f97316"):"#9ca3af", marginTop:1 }}>{has?"Work":"Off"}</div>
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <div style={{ fontSize:12, fontWeight:700, color:"#374151", marginBottom:6 }}>
              Reason <span style={{ fontWeight:400, color:"#9ca3af" }}>(optional)</span>
            </div>
            <textarea value={reason} onChange={e=>setReason(e.target.value)} rows={2}
              placeholder="e.g. Doctor's appointment"
              style={{ width:"100%", padding:"9px 12px", border:"1px solid #e5e7eb", borderRadius:8, fontSize:13, color:"#111827", outline:"none", resize:"none", boxSizing:"border-box", fontFamily:"inherit", lineHeight:1.5 }} />
          </div>
        </div>
        <div style={{ padding:"12px 20px", borderTop:"1px solid #f1f5f9", display:"flex", gap:8, justifyContent:"flex-end", background:"#fafafa" }}>
          <button onClick={onClose} style={{ padding:"8px 18px", background:"#fff", border:"1px solid #e5e7eb", borderRadius:8, fontSize:13, fontWeight:600, color:"#374151", cursor:"pointer" }}>Cancel</button>
          <button onClick={submit} disabled={!ok||busy}
            style={{ padding:"8px 18px", background:ok?ACCENT:"#e5e7eb", border:"none", borderRadius:8, fontSize:13, fontWeight:700, color:ok?"#fff":"#9ca3af", cursor:ok?"pointer":"not-allowed", display:"flex", alignItems:"center", gap:6 }}>
            {busy
              ? <><svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.5} strokeLinecap="round" style={{ animation:"spin .8s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>Sending…</>
              : <><Ic d={I.send} stroke="#fff" size={13} />Send Request</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Tab 1: Weekly Schedule ───────────────────────────────────────────────────
function WeeklyTab({ ACCENT, setShowSwap, myShift, weekData, weekOffset, setWeekOffset, weekStart }) {
  if (!myShift) return <div style={{ padding:40, textAlign:"center", color:"#9ca3af" }}>Loading shift data…</div>;

  const shiftColor = myShift.shift_type === "morning" ? "#f97316" : myShift.shift_type === "evening" ? "#8b5cf6" : "#1e293b";
  const shiftLight = myShift.shift_type === "morning" ? "#fff7ed" : myShift.shift_type === "evening" ? "#f5f3ff" : "#f8fafc";
  const shiftIcon  = myShift.shift_type === "morning" ? I.sun : myShift.shift_type === "evening" ? I.download : I.moon;

  // Build week label
  const ws = new Date(weekStart);
  const we = new Date(ws); we.setDate(ws.getDate() + 6);
  const weekLabel = `${ws.getDate()} ${ws.toLocaleString("default",{month:"short"})} – ${we.getDate()} ${we.toLocaleString("default",{month:"short"})}`;

  // Map weekData.days by day_name
  const dayMap = {};
  (weekData?.days || []).forEach(d => { dayMap[d.day_name] = d; });

  // Build 7-day grid starting from week_start
  const weekDates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(ws); d.setDate(ws.getDate() + i);
    weekDates.push({ iso: d.toISOString().slice(0,10), num: d.getDate(), dayName: DAYS_SHORT[i] });
  }

  const todayIdx = weekDates.findIndex(d => d.iso === TODAY_ISO);

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      {/* Week grid */}
      <div style={{ background:"#fff", borderRadius:12, border:"1px solid #f1f5f9" }}>
        <div style={{ padding:"12px 18px", borderBottom:"1px solid #f1f5f9", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <button onClick={()=>setWeekOffset(o=>o-1)}
              style={{ width:28, height:28, border:"1px solid #e5e7eb", borderRadius:7, background:"#fff", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Ic d={I.chevL} size={13} stroke="#6b7280" />
            </button>
            <span style={{ fontSize:13.5, fontWeight:700, color:"#111827" }}>{weekLabel}</span>
            <button onClick={()=>setWeekOffset(o=>o+1)}
              style={{ width:28, height:28, border:"1px solid #e5e7eb", borderRadius:7, background:"#fff", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Ic d={I.chevR} size={13} stroke="#6b7280" />
            </button>
            <button onClick={()=>setWeekOffset(0)}
              style={{ fontSize:12, fontWeight:600, color:ACCENT, padding:"3px 10px", border:`1px solid ${ACCENT}30`, borderRadius:7, background:`${ACCENT}08`, cursor:"pointer" }}>Today</button>
          </div>
          <div style={{ display:"flex", gap:7 }}>
            <button onClick={()=>setShowSwap(true)}
              style={{ display:"flex", alignItems:"center", gap:6, padding:"6px 13px", background:ACCENT, border:"none", borderRadius:8, fontSize:12.5, fontWeight:700, color:"#fff", cursor:"pointer" }}>
              <Ic d={I.swap} stroke="#fff" size={13} />Request Swap
            </button>
            <button style={{ display:"flex", alignItems:"center", gap:5, padding:"6px 11px", background:"#fff", border:"1px solid #e5e7eb", borderRadius:8, fontSize:12.5, color:"#374151", cursor:"pointer" }}>
              <Ic d={I.export} stroke="#6b7280" size={13} />Export
            </button>
          </div>
        </div>

        <div style={{ padding:"16px 18px" }}>
          {/* Day headers */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:8, marginBottom:8 }}>
            {weekDates.map((d, i) => {
              const isToday = i === todayIdx;
              return (
                <div key={d.dayName} style={{ textAlign:"center" }}>
                  <div style={{ fontSize:11.5, fontWeight:600, color:isToday?ACCENT:"#9ca3af", marginBottom:4 }}>{d.dayName}</div>
                  <div style={{ width:30, height:30, borderRadius:"50%", background:isToday?ACCENT:"transparent", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto", fontSize:13, fontWeight:700, color:isToday?"#fff":"#374151" }}>
                    {d.num}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Day cells */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:8 }}>
            {weekDates.map((d, i) => {
              const isToday = i === todayIdx;
              const dayInfo = dayMap[d.dayName];
              const isWorkDay = dayInfo?.is_working_day ?? myShift.active_days.includes(d.dayName.toLowerCase());
              const isFuture = d.iso > TODAY_ISO;
              const label = isFuture && isWorkDay ? "Upcoming" : (dayInfo?.label || (isWorkDay ? "Absent" : "Day Off"));
              const statusCfg = SP[label] || SP["Off"];

              return (
                <div key={d.dayName} style={{
                  borderRadius:10, border:`1px solid ${isToday?ACCENT+"55":"#f1f5f9"}`,
                  background:isToday?`${ACCENT}06`:"#fafafa",
                  padding:"12px 8px", textAlign:"center", minHeight:100,
                  display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:6,
                }}>
                  {isWorkDay ? (
                    <>
                      <div style={{ width:30, height:30, borderRadius:8, background:`${shiftColor}15`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                        <Ic d={shiftIcon} stroke={shiftColor} size={15} />
                      </div>
                      <div style={{ fontSize:11.5, fontWeight:700, color:shiftColor }}>{myShift.shift_name}</div>
                      <div style={{ fontSize:10.5, color:"#9ca3af", lineHeight:1.3 }}>{myShift.start_time}–{myShift.end_time}</div>
                      {!isFuture && dayInfo?.check_in && (
                        <div style={{ fontSize:10, color:"#6b7280" }}>In: {dayInfo.check_in}</div>
                      )}
                      <span style={{ display:"inline-flex", alignItems:"center", gap:3, padding:"2px 8px", borderRadius:99, background:statusCfg.bg, fontSize:10.5, fontWeight:600, color:statusCfg.c }}>
                        <span style={{ width:4, height:4, borderRadius:"50%", background:statusCfg.c }} />
                        {label}
                      </span>
                    </>
                  ) : (
                    <div style={{ fontSize:12, color:"#d1d5db", fontWeight:600 }}>Day Off</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Active shift + Swap panel */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 340px", gap:14 }}>
        <div style={{ background:"#fff", borderRadius:12, border:"1px solid #f1f5f9", padding:"16px 18px" }}>
          <div style={{ fontSize:13.5, fontWeight:700, color:"#111827", marginBottom:12, display:"flex", alignItems:"center", gap:7 }}>
            <Ic d={I.clock} stroke={ACCENT} size={15} />
            My Active Shift
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:12, padding:"14px 16px", background:shiftLight, borderRadius:10, border:`1px solid ${shiftColor}22` }}>
            <div style={{ width:3, height:52, borderRadius:2, background:shiftColor, flexShrink:0 }} />
            <div style={{ flex:1 }}>
              <div style={{ fontSize:15, fontWeight:800, color:"#111827" }}>{myShift.shift_name}</div>
              <div style={{ fontSize:12.5, color:"#6b7280", marginTop:2 }}>{myShift.start_time}–{myShift.end_time} · {myShift.break_time}m break</div>
              <div style={{ display:"flex", gap:3, marginTop:10, flexWrap:"wrap" }}>
                {DAYS_SHORT.map(d => {
                  const active = myShift.active_days.includes(d.toLowerCase());
                  return <span key={d} style={{ fontSize:10, fontWeight:700, padding:"2px 6px", borderRadius:4, background:active?shiftColor:"#e5e7eb", color:active?"#fff":"#9ca3af" }}>{d}</span>;
                })}
              </div>
            </div>
            <div style={{ textAlign:"right" }}>
              <span style={{ fontSize:11, fontWeight:700, padding:"4px 12px", borderRadius:99, background:"#f0fdf4", color:"#16a34a", border:"1px solid #bbf7d0" }}>
                {myShift.status === "active" ? "Active" : myShift.status}
              </span>
            </div>
          </div>
        </div>

        {/* Today's summary */}
        <div style={{ background:"#fff", borderRadius:12, border:"1px solid #f1f5f9", padding:"14px 16px" }}>
          <div style={{ fontSize:13.5, fontWeight:700, color:"#111827", marginBottom:12, display:"flex", alignItems:"center", gap:7 }}>
            <Ic d={I.activity} stroke={ACCENT} size={14} />
            Today's Summary
          </div>
          {(() => {
            const td = dayMap[DAYS_SHORT[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]];
            if (!td) return <div style={{ fontSize:13, color:"#9ca3af" }}>No data for today</div>;
            return (
              <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 12px", background:"#f9fafb", borderRadius:8 }}>
                  <span style={{ fontSize:12, color:"#6b7280" }}>Status</span>
                  <Pill s={td.label} />
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 12px", background:"#f9fafb", borderRadius:8 }}>
                  <span style={{ fontSize:12, color:"#6b7280" }}>Check In</span>
                  <span style={{ fontSize:13, fontWeight:700, color:"#111827" }}>{td.check_in || "—"}</span>
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 12px", background:"#f9fafb", borderRadius:8 }}>
                  <span style={{ fontSize:12, color:"#6b7280" }}>Check Out</span>
                  <span style={{ fontSize:13, fontWeight:700, color:"#111827" }}>{td.check_out || "—"}</span>
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 12px", background:"#f9fafb", borderRadius:8 }}>
                  <span style={{ fontSize:12, color:"#6b7280" }}>Worked</span>
                  <span style={{ fontSize:13, fontWeight:700, color:ACCENT }}>{toMinHrs(td.worked_minutes)}</span>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}

// ─── Tab 2: Shift Config ──────────────────────────────────────────────────────
function ConfigTab({ ACCENT, myShift, allShifts }) {
  const shiftColor = myShift?.shift_type === "morning" ? "#f97316" : myShift?.shift_type === "evening" ? "#8b5cf6" : "#1e293b";
  const shiftLight = myShift?.shift_type === "morning" ? "#fff7ed" : myShift?.shift_type === "evening" ? "#f5f3ff" : "#f8fafc";
  const shiftIcon  = myShift?.shift_type === "morning" ? I.sun : myShift?.shift_type === "evening" ? I.download : I.moon;

  const AVAIL_CFG = {
    morning:{ icon:I.sun,      color:"#f97316" },
    evening:{ icon:I.download, color:"#8b5cf6" },
    night:  { icon:I.moon,     color:"#1e293b" },
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <div style={{ display:"grid", gridTemplateColumns:"320px 1fr", gap:14 }}>
        {/* My shift */}
        <div style={{ background:"#fff", borderRadius:12, border:"1px solid #f1f5f9", padding:"16px 18px" }}>
          <div style={{ fontSize:13.5, fontWeight:700, color:"#111827", marginBottom:14 }}>My Shift</div>
          {myShift ? (
            <div style={{ borderRadius:10, border:"1px solid #f1f5f9", padding:"12px 14px", background:shiftLight }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:7 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <div style={{ width:3, height:32, borderRadius:2, background:shiftColor }} />
                  <div>
                    <div style={{ fontSize:13.5, fontWeight:700, color:"#111827" }}>{myShift.shift_name}</div>
                    <div style={{ fontSize:11.5, color:"#6b7280" }}>{myShift.start_time}–{myShift.end_time} · {myShift.break_time}m break</div>
                  </div>
                </div>
                <span style={{ fontSize:11, fontWeight:700, padding:"2px 8px", borderRadius:99, background:shiftColor, color:"#fff" }}>{myShift.shift_name}</span>
              </div>
              <div style={{ display:"flex", gap:3, flexWrap:"wrap" }}>
                {DAYS_SHORT.map(d => {
                  const active = myShift.active_days.includes(d.toLowerCase());
                  return <span key={d} style={{ fontSize:10, fontWeight:700, padding:"2px 6px", borderRadius:4, background:active?shiftColor:"#e5e7eb", color:active?"#fff":"#9ca3af" }}>{d}</span>;
                })}
              </div>
              <div style={{ marginTop:10, padding:"6px 10px", background:"rgba(0,0,0,0.04)", borderRadius:7 }}>
                <div style={{ fontSize:11, color:"#6b7280" }}>Max Employees: <strong style={{color:"#111827"}}>{myShift.max_employees}</strong></div>
              </div>
            </div>
          ) : <Skeleton h={120} />}
        </div>

        {/* All available shifts */}
        <div style={{ background:"#fff", borderRadius:12, border:"1px solid #f1f5f9", padding:"16px 18px" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
            <div style={{ display:"flex", alignItems:"center", gap:7 }}>
              <Ic d={I.calendar} stroke={ACCENT} size={15} />
              <span style={{ fontSize:13.5, fontWeight:700, color:"#111827" }}>All Company Shifts</span>
            </div>
            <span style={{ fontSize:12, color:"#9ca3af", fontWeight:600 }}>{allShifts?.length || 0} shifts</span>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {(allShifts || []).map(shift => {
              const cfg = AVAIL_CFG[shift.shift_type] || AVAIL_CFG.morning;
              const isMine = myShift?.id === shift.id;
              return (
                <div key={shift.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 14px", borderRadius:10, border:`1.5px solid ${isMine?ACCENT+"44":"#f1f5f9"}`, background:isMine?`${ACCENT}04`:"#fafafa" }}>
                  <div style={{ width:36, height:36, borderRadius:9, background:`${cfg.color}15`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <Ic d={cfg.icon} stroke={cfg.color} size={16} />
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13.5, fontWeight:700, color:"#111827", display:"flex", alignItems:"center", gap:7 }}>
                      {shift.shift_name}
                      {isMine && <span style={{ fontSize:10, fontWeight:700, padding:"2px 7px", borderRadius:99, background:ACCENT, color:"#fff" }}>Mine</span>}
                    </div>
                    <div style={{ fontSize:12, color:"#6b7280", marginTop:2 }}>{shift.start_time}–{shift.end_time}</div>
                    <div style={{ display:"flex", gap:3, marginTop:6, flexWrap:"wrap" }}>
                      {DAYS_SHORT.map(d => {
                        const active = shift.active_days.includes(d.toLowerCase());
                        return <span key={d} style={{ fontSize:9.5, fontWeight:700, padding:"2px 5px", borderRadius:3, background:active?cfg.color:"#e5e7eb", color:active?"#fff":"#9ca3af" }}>{d}</span>;
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Tab 3: Analytics ─────────────────────────────────────────────────────────
function AnalyticsTab({ ACCENT, stats, dailyRates, historyData, myShift }) {
  const dist = stats?.shift_distribution || [];
  const hrs  = stats?.hours_summary || {};
  const att  = stats?.attendance_rate || {};
  const days = dailyRates?.days || [];

  const maxBar = Math.max(...days.map(d => d.worked_minutes || 0), 1);

  // Status color mapping for attendance rate
  const attRows = [
    { l:"On Time",  p: att.on_time || 0,  c:"#22c55e" },
    { l:"Late",     p: att.late || 0,     c:"#f59e0b" },
    { l:"Early Out",p: att.early_out || 0,c:"#f97316" },
    { l:"Absent",   p: att.absent || 0,   c:"#ef4444" },
  ];
  const presentPct = Math.round(100 - (att.absent || 0));

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14 }}>
        {/* Shift Distribution */}
        <div style={{ background:"#fff", borderRadius:12, border:"1px solid #f1f5f9", padding:"16px 18px" }}>
          <div style={{ fontSize:13.5, fontWeight:700, color:"#111827", marginBottom:14 }}>Shift Distribution</div>
          {dist.length ? dist.map((item,i) => {
            const cfg = item.shift_name === "Morning" ? { color:"#f97316", icon:I.sun } : { color:"#8b5cf6", icon:I.download };
            return (
              <div key={i} style={{ marginBottom:i<dist.length-1?14:0 }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:5 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <Ic d={cfg.icon} stroke={cfg.color} size={13} />
                    <span style={{ fontSize:13, fontWeight:600, color:"#374151" }}>{item.shift_name}</span>
                  </div>
                  <span style={{ fontSize:12.5, fontWeight:700, color:cfg.color }}>{item.employees} emp</span>
                </div>
                <div style={{ height:7, background:"#f1f5f9", borderRadius:4, overflow:"hidden" }}>
                  <div style={{ width:`${item.percentage}%`, height:"100%", background:cfg.color, borderRadius:4 }} />
                </div>
                <div style={{ fontSize:11, color:"#9ca3af", marginTop:3 }}>{item.percentage}% of workforce</div>
              </div>
            );
          }) : <Skeleton h={80} />}
        </div>

        {/* Hours Summary */}
        <div style={{ background:"#fff", borderRadius:12, border:"1px solid #f1f5f9", padding:"16px 18px" }}>
          <div style={{ fontSize:13.5, fontWeight:700, color:"#111827", marginBottom:12 }}>Hours This Week</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:14 }}>
            {[
              { l:"Scheduled", v:`${hrs.scheduled_hours || 0}h`, c:ACCENT },
              { l:"Worked",    v:`${hrs.worked_hours || 0}h`,    c:"#22c55e" },
              { l:"Overtime",  v:`${hrs.overtime_hours || 0}h`,  c:"#ef4444" },
              { l:"Absent",    v:`${Math.round((hrs.absent_hours||0)*10)/10}h`, c:"#f59e0b" },
            ].map((s,i)=>(
              <div key={i}>
                <div style={{ fontSize:11, color:"#9ca3af" }}>{s.l}</div>
                <div style={{ fontSize:20, fontWeight:800, color:s.c, lineHeight:1.2, marginTop:1 }}>{s.v}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize:12, fontWeight:600, color:"#6b7280", marginBottom:8 }}>Daily Productivity</div>
          <div style={{ display:"flex", alignItems:"flex-end", gap:5, height:60 }}>
            {days.map((d,i) => {
              const h = d.worked_minutes > 0 ? Math.max(8, (d.worked_minutes / maxBar) * 50) : 6;
              const active = d.is_working_day;
              return (
                <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:3 }}>
                  <div style={{ width:"100%", height:`${h}px`, background:active?(d.status==="absent"?"#fecaca":ACCENT):"#f1f5f9", borderRadius:3, transition:"height .3s" }} />
                  <span style={{ fontSize:9.5, color:"#9ca3af" }}>{d.day_name}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Attendance Rate */}
        <div style={{ background:"#fff", borderRadius:12, border:"1px solid #f1f5f9", padding:"16px 18px" }}>
          <div style={{ fontSize:13.5, fontWeight:700, color:"#111827", marginBottom:12 }}>Attendance Rate</div>
          <div style={{ display:"flex", justifyContent:"center", marginBottom:14 }}>
            {(()=>{
              const r=44, circ=2*Math.PI*r, p=presentPct/100;
              return (
                <svg width={108} height={108} viewBox="0 0 108 108">
                  <circle cx={54} cy={54} r={r} fill="none" stroke="#f1f5f9" strokeWidth={11} />
                  <circle cx={54} cy={54} r={r} fill="none" stroke={ACCENT} strokeWidth={11}
                    strokeDasharray={`${circ*p} ${circ*(1-p)}`} strokeLinecap="round"
                    style={{ transform:"rotate(-90deg)", transformOrigin:"54px 54px" }} />
                  <text x={54} y={50} textAnchor="middle" fontSize={19} fontWeight={800} fill="#111827">{presentPct}%</text>
                  <text x={54} y={64} textAnchor="middle" fontSize={10} fill="#9ca3af">Overall</text>
                </svg>
              );
            })()}
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
            {attRows.map(row => (
              <div key={row.l} style={{ display:"flex", alignItems:"center", gap:7 }}>
                <span style={{ width:7, height:7, borderRadius:"50%", background:row.c, flexShrink:0 }} />
                <span style={{ fontSize:12, color:"#374151", flex:1 }}>{row.l}</span>
                <div style={{ width:70, height:5, background:"#f1f5f9", borderRadius:3, overflow:"hidden" }}>
                  <div style={{ width:`${row.p}%`, height:"100%", background:row.c, borderRadius:3 }} />
                </div>
                <span style={{ fontSize:12, fontWeight:700, color:"#374151", minWidth:32, textAlign:"right" }}>{row.p}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* History in analytics */}
      <HistoryTable ACCENT={ACCENT} historyData={historyData} myShift={myShift} onRequestSwap={null} />
    </div>
  );
}

// ─── History Table (shared) ───────────────────────────────────────────────────
function HistoryTable({ ACCENT, historyData, myShift, onRequestSwap }) {
  const shiftColor = myShift?.shift_type === "morning" ? "#f97316" : "#8b5cf6";

  // Determine display status: future working days → Upcoming
  const rows = (historyData || []).map(row => {
    const isFuture = row.date > TODAY_ISO;
    const isOff = row.status === "Off" || row.status_label === "Day Off";
    let displayStatus = row.status_label || row.status;
    if (isFuture && !isOff) displayStatus = "Upcoming";
    const shiftTime = myShift ? `${myShift.start_time}–${myShift.end_time}` : row.shift_time;
    return { ...row, displayStatus, shiftTime };
  });

  return (
    <div style={{ background:"#fff", borderRadius:12, border:"1px solid #f1f5f9", overflow:"hidden" }}>
      <div style={{ padding:"12px 18px", borderBottom:"1px solid #f1f5f9", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:7 }}>
          <Ic d={I.activity} stroke={ACCENT} size={14} />
          <span style={{ fontSize:13.5, fontWeight:700, color:"#111827" }}>My Shift History</span>
          <span style={{ fontSize:11, color:"#9ca3af", background:"#f3f4f6", padding:"2px 8px", borderRadius:99 }}>{rows.length} entries · This Month</span>
        </div>
        {onRequestSwap && (
          <button onClick={onRequestSwap}
            style={{ display:"flex", alignItems:"center", gap:6, padding:"6px 13px", background:ACCENT, border:"none", borderRadius:8, fontSize:12.5, fontWeight:700, color:"#fff", cursor:"pointer" }}>
            <Ic d={I.swap} stroke="#fff" size={13} />Request Swap
          </button>
        )}
      </div>
      <div style={{ overflowX:"auto" }}>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
          <thead>
            <tr style={{ background:"#fafafa" }}>
              {["Date","Day","Shift","Shift Time","Punch In","Punch Out","Hours","Status"].map((h,i)=>(
                <th key={i} style={{ padding:"9px 14px", textAlign:"left", fontSize:11.5, fontWeight:600, color:"#9ca3af", textTransform:"uppercase", letterSpacing:"0.5px", whiteSpace:"nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const isFuture = row.date > TODAY_ISO;
              const isOff = row.displayStatus === "Day Off" || row.displayStatus === "Off";
              return (
                <tr key={i} style={{ borderTop:"1px solid #f3f4f6", opacity: isFuture ? 0.7 : 1 }}
                  onMouseEnter={e=>e.currentTarget.style.background="#fafafa"}
                  onMouseLeave={e=>e.currentTarget.style.background="#fff"}>
                  <td style={{ padding:"11px 14px", color:"#374151", fontSize:12.5 }}>{row.date}</td>
                  <td style={{ padding:"11px 14px" }}><span style={{ fontWeight:700, color:"#6b7280", fontSize:12 }}>{row.day}</span></td>
                  <td style={{ padding:"11px 14px" }}>
                    {!isOff
                      ? <span style={{ display:"inline-flex", alignItems:"center", gap:4, fontSize:12, fontWeight:600, color:shiftColor, background:shiftColor==="#f97316"?"#fff7ed":"#f5f3ff", padding:"3px 9px", borderRadius:99 }}>
                          <Ic d={shiftColor==="#f97316"?I.sun:I.download} stroke={shiftColor} size={11} />{row.shift_name}
                        </span>
                      : <span style={{ fontSize:12, color:"#9ca3af", background:"#f9fafb", padding:"3px 9px", borderRadius:99 }}>Day Off</span>}
                  </td>
                  <td style={{ padding:"11px 14px", color:"#6b7280", fontSize:12 }}>{isOff ? "—" : row.shiftTime}</td>
                  <td style={{ padding:"11px 14px", fontWeight:600, color:row.punch_in?"#111827":"#d1d5db", fontSize:12 }}>{row.punch_in || "—"}</td>
                  <td style={{ padding:"11px 14px", fontWeight:600, color:row.punch_out?"#111827":"#d1d5db", fontSize:12 }}>{row.punch_out || "—"}</td>
                  <td style={{ padding:"11px 14px", fontWeight:800, color:"#111827" }}>{row.hours > 0 ? `${row.hours}h` : "—"}</td>
                  <td style={{ padding:"11px 14px" }}>
                    {isFuture && !isOff
                      ? <span style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"3px 9px", borderRadius:99, background:"#eff6ff", fontSize:11.5, fontWeight:600, color:"#3b82f6", whiteSpace:"nowrap" }}>
                          <span style={{ width:5, height:5, borderRadius:"50%", background:"#3b82f6" }} />Upcoming
                        </span>
                      : <Pill s={row.displayStatus} />}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div style={{ padding:"9px 18px", borderTop:"1px solid #f1f5f9", background:"#fafafa", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:8 }}>
        <span style={{ fontSize:12, color:"#9ca3af" }}>{rows.length} entries this month</span>
        <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
          {["On Time","Late","Early Out","Absent","Upcoming","Day Off"].map(s=>{
            const c = SP[s] || SP["Off"];
            return <span key={s} style={{ display:"inline-flex", alignItems:"center", gap:3, fontSize:11, color:c.c, background:c.bg, padding:"2px 8px", borderRadius:99 }}>
              <span style={{ width:5, height:5, borderRadius:"50%", background:c.c }} />{s}
            </span>;
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function EmployeeShiftSchedulePage({ ACCENT = "#f97316" }) {
  const [tab,         setTab]        = useState("weekly");
  const [showSwap,    setShowSwap]   = useState(false);
  const [weekOffset,  setWeekOffset] = useState(0);
  const [loading,     setLoading]    = useState(true);

  // API data
  const [myShift,     setMyShift]    = useState(null);
  const [allShifts,   setAllShifts]  = useState([]);
  const [empCount,    setEmpCount]   = useState(null);
  const [weekData,    setWeekData]   = useState(null);
  const [historyData, setHistoryData]= useState([]);
  const [stats,       setStats]      = useState(null);
  const [dailyRates,  setDailyRates] = useState(null);

  const weekStart = getWeekStart(weekOffset);

  const loadAll = useCallback(async () => {
    setLoading(true);
    const statsWeek = getWeekStart(0); // always current week for stats

    const [shift, shifts, count, week, history, dashStats, daily] = await Promise.all([
      apiFetch("/my-shift"),
      apiFetch("/shifts"),
      apiFetch("/my-shift/employee-count"),
      apiFetch(`/attendance/weekly?week_start=${weekStart}`),
      apiFetch("/attendance/history"),
      apiFetch(`/dashboard/stats?week_start=${statsWeek}`),
      apiFetch(`/attendance/daily-rates?week_start=${statsWeek}`),
    ]);

    if (shift?.data)      setMyShift(shift.data);
    if (shifts?.data)     setAllShifts(shifts.data);
    if (count?.data)      setEmpCount(count.data);
    if (week)             setWeekData(week);
    if (history?.data)    setHistoryData(history.data);
    if (dashStats)        setStats(dashStats);
    if (daily)            setDailyRates(daily);
    setLoading(false);
  }, [weekStart]);

  useEffect(() => { loadAll(); }, [loadAll]);

  // Reload weekly data when offset changes
  const loadWeek = useCallback(async () => {
    const week = await apiFetch(`/attendance/weekly?week_start=${weekStart}`);
    if (week) setWeekData(week);
  }, [weekStart]);

  useEffect(() => { if (weekOffset !== 0) loadWeek(); }, [weekOffset, loadWeek]);

  const TABS = [
    { key:"weekly",    label:"Weekly Schedule", icon:I.calendar },
    { key:"config",    label:"Shift Config",    icon:I.settings  },
    { key:"analytics", label:"Analytics",       icon:I.bar       },
  ];

  // Stat cards — real data
  const totalShifts = allShifts.length;
  const totalEmp    = (stats?.shift_distribution || []).reduce((a, s) => a + s.employees, 0) || empCount?.total_employees || 0;
  const coverageAlerts = (stats?.shift_distribution || []).filter(s => s.percentage < 20).length;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16, fontFamily:"'Nunito','Inter',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap');
        @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
      `}</style>

      {/* Stat cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
        {[
          { icon:I.users,    bg:"#fff7ed", ic:ACCENT,    label:"Assigned Employees", val: loading?"…":String(totalEmp),      sub:"total"    },
          { icon:I.alert,    bg:"#fef2f2", ic:"#ef4444", label:"Coverage Alerts",    val: loading?"…":String(coverageAlerts), sub:"shifts"   },
          { icon:I.trending, bg:"#f0f9ff", ic:"#0ea5e9", label:"Total Shifts",       val: loading?"…":String(totalShifts),    sub:"active"   },
          { icon:I.clock,    bg:"#f5f3ff", ic:"#8b5cf6", label:"Hours Worked",       val: loading?"…":`${stats?.hours_summary?.worked_hours||0}h`, sub:"this week" },
        ].map((c,i)=>(
          <div key={i} style={{ background:"#fff", borderRadius:12, padding:"14px 18px", border:"1px solid #f1f5f9", display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:44, height:44, borderRadius:11, background:c.bg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <Ic d={c.icon} stroke={c.ic} size={20} />
            </div>
            <div>
              <div style={{ fontSize:11, color:"#9ca3af", fontWeight:600, marginBottom:1 }}>{c.label}</div>
              <div style={{ fontSize:24, fontWeight:800, color:"#111827", lineHeight:1, letterSpacing:"-0.5px" }}>{c.val}</div>
              <div style={{ fontSize:11.5, color:"#6b7280", marginTop:2 }}>{c.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", alignItems:"center", gap:4 }}>
        {TABS.map(t => {
          const active = tab === t.key;
          return (
            <button key={t.key} onClick={()=>setTab(t.key)}
              style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 16px", border:"none", borderRadius:9, background:active?ACCENT:"#fff", color:active?"#fff":"#6b7280", fontSize:13, fontWeight:active?700:500, cursor:"pointer", boxShadow:active?`0 2px 8px ${ACCENT}44`:"0 1px 3px rgba(0,0,0,0.06)", transition:"all .15s", fontFamily:"inherit" }}>
              <Ic d={t.icon} stroke={active?"#fff":"#9ca3af"} size={14} />
              {t.label}
            </button>
          );
        })}
        <button onClick={loadAll}
          style={{ marginLeft:"auto", width:34, height:34, border:"1px solid #e5e7eb", borderRadius:8, background:"#fff", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}
          title="Refresh">
          <Ic d={I.refresh} stroke="#6b7280" size={14} />
        </button>
      </div>

      {/* Loading banner */}
      {loading && (
        <div style={{ padding:"10px 16px", background:"#eff6ff", borderRadius:8, fontSize:12.5, color:"#3b82f6", fontWeight:600, display:"flex", alignItems:"center", gap:8 }}>
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth={2.5} strokeLinecap="round" style={{ animation:"spin .8s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
          Fetching live data from API…
        </div>
      )}

      {/* Tab content */}
      {tab === "weekly" && (
        <WeeklyTab
          ACCENT={ACCENT}
          setShowSwap={setShowSwap}
          myShift={myShift}
          weekData={weekData}
          weekOffset={weekOffset}
          setWeekOffset={setWeekOffset}
          weekStart={weekStart}
        />
      )}
      {tab === "config" && (
        <ConfigTab ACCENT={ACCENT} myShift={myShift} allShifts={allShifts} />
      )}
      {tab === "analytics" && (
        <AnalyticsTab
          ACCENT={ACCENT}
          stats={stats}
          dailyRates={dailyRates}
          historyData={historyData}
          myShift={myShift}
        />
      )}

      {/* History always shown below weekly & config */}
      {tab !== "analytics" && (
        <HistoryTable
          ACCENT={ACCENT}
          historyData={historyData}
          myShift={myShift}
          onRequestSwap={()=>setShowSwap(true)}
        />
      )}

      {showSwap && (
        <SwapModal
          ACCENT={ACCENT}
          myShift={myShift}
          allShifts={allShifts}
          onClose={()=>setShowSwap(false)}
          onSubmit={({ day }) => {
            setShowSwap(false);
            // In a real app, POST to swap endpoint here
            alert(`Swap request sent for ${day}`);
          }}
        />
      )}
    </div>
  );
}
