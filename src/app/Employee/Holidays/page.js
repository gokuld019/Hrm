"use client";
import { useState, useEffect, useCallback, useRef } from "react";

// ─── API ──────────────────────────────────────────────────────────────────────
const BASE = "https://pencilkraft.in/api/employee";

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("employee_auth_token");
}

async function apiFetch(path) {
  try {
    const token = getToken();
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch(`${BASE}${path}`, { headers });
    const json = await res.json();
    return json.success ? json : null;
  } catch { return null; }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const TODAY = new Date();
const TODAY_ISO = TODAY.toISOString().slice(0, 10);

function isoYM(y, m) { return `${y}-${String(m + 1).padStart(2, "0")}`; }
function daysInMonth(y, m) { return new Date(y, m + 1, 0).getDate(); }
function firstDay(y, m) {
  const d = new Date(y, m, 1).getDay();
  return d === 0 ? 6 : d - 1; // Mon=0
}
function pad(n) { return String(n).padStart(2, "0"); }
function isoDate(y, m, d) { return `${y}-${pad(m + 1)}-${pad(d)}`; }

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAY_LABELS  = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

// Status config
const STATUS_CFG = {
  "On Time":    { bg:"#ecfdf5", dot:"#22c55e", text:"#15803d", glow:"rgba(34,197,94,0.15)"  },
  "Late":       { bg:"#fefce8", dot:"#eab308", text:"#a16207", glow:"rgba(234,179,8,0.15)"  },
  "Early Out":  { bg:"#fff7ed", dot:"#f97316", text:"#c2410c", glow:"rgba(249,115,22,0.15)" },
  "Absent":     { bg:"#fef2f2", dot:"#ef4444", text:"#b91c1c", glow:"rgba(239,68,68,0.15)"  },
  "Off":        { bg:"#f9fafb", dot:"#d1d5db", text:"#9ca3af", glow:"rgba(0,0,0,0.04)"      },
  "Day Off":    { bg:"#f9fafb", dot:"#d1d5db", text:"#9ca3af", glow:"rgba(0,0,0,0.04)"      },
  "Upcoming":   { bg:"#eff6ff", dot:"#3b82f6", text:"#1d4ed8", glow:"rgba(59,130,246,0.15)" },
  "Late & Early Out": { bg:"#fff7ed", dot:"#f97316", text:"#c2410c", glow:"rgba(249,115,22,0.15)" },
  "Holiday":    { bg:"#fdf4ff", dot:"#a855f7", text:"#7e22ce", glow:"rgba(168,85,247,0.15)" },
};

function getStatus(row, isFuture, isHoliday) {
  if (isHoliday) return "Holiday";
  if (isFuture) {
    if (row?.status === "Off" || row?.status_label === "Day Off") return "Day Off";
    return "Upcoming";
  }
  return row?.status_label || row?.status || "Off";
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, color, icon, delay }) {
  return (
    <div style={{
      background:"#fff", borderRadius:16, padding:"18px 20px",
      border:`1px solid ${color}22`,
      boxShadow:`0 4px 24px ${color}12, 0 1px 4px rgba(0,0,0,0.04)`,
      display:"flex", alignItems:"center", gap:16,
      animation:"fadeUp 0.5s ease both",
      animationDelay: delay,
    }}>
      <div style={{
        width:52, height:52, borderRadius:14,
        background:`linear-gradient(135deg,${color}22,${color}11)`,
        border:`1.5px solid ${color}33`,
        display:"flex", alignItems:"center", justifyContent:"center",
        fontSize:22, flexShrink:0,
      }}>{icon}</div>
      <div>
        <div style={{ fontSize:11, fontWeight:700, color:"#9ca3af", letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:3 }}>{label}</div>
        <div style={{ fontSize:28, fontWeight:900, color:"#111827", lineHeight:1, letterSpacing:"-1px" }}>{value}</div>
        {sub && <div style={{ fontSize:12, color:"#9ca3af", marginTop:3 }}>{sub}</div>}
      </div>
    </div>
  );
}

// ─── Day Detail Popover ───────────────────────────────────────────────────────
function DayPopover({ row, date, myShift, holiday, onClose }) {
  const iso  = date;
  const isFuture  = iso > TODAY_ISO;
  const isOff = row?.status === "Off" || row?.status_label === "Day Off";
  const isHoliday = !!holiday;
  const status = getStatus(row, isFuture, isHoliday);
  const cfg = STATUS_CFG[status] || STATUS_CFG["Off"];

  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, zIndex:500, display:"flex", alignItems:"center", justifyContent:"center", padding:20, background:"rgba(0,0,0,0.35)", backdropFilter:"blur(6px)" }}>
      <div onClick={e=>e.stopPropagation()} style={{
        background:"#fff", borderRadius:20, width:"100%", maxWidth:380,
        boxShadow:"0 32px 80px rgba(0,0,0,0.2)", overflow:"hidden",
        animation:"popIn 0.2s ease",
      }}>
        {/* Header */}
        <div style={{ background:`linear-gradient(135deg,${cfg.dot},${cfg.dot}cc)`, padding:"20px 22px 16px" }}>
          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between" }}>
            <div>
              <div style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.7)", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:4 }}>
                {new Date(iso).toLocaleDateString("en-US",{weekday:"long"})}
              </div>
              <div style={{ fontSize:26, fontWeight:900, color:"#fff", letterSpacing:"-0.5px" }}>
                {new Date(iso).toLocaleDateString("en-US",{day:"numeric",month:"long",year:"numeric"})}
              </div>
            </div>
            <button onClick={onClose} style={{ width:30, height:30, borderRadius:8, background:"rgba(255,255,255,0.2)", border:"none", cursor:"pointer", color:"#fff", fontSize:16, display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
          </div>
          <div style={{ marginTop:12, display:"inline-flex", alignItems:"center", gap:6, background:"rgba(255,255,255,0.2)", padding:"5px 12px", borderRadius:99 }}>
            <span style={{ width:7, height:7, borderRadius:"50%", background:"#fff" }} />
            <span style={{ fontSize:12.5, fontWeight:700, color:"#fff" }}>{status}</span>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding:"18px 22px", display:"flex", flexDirection:"column", gap:10 }}>
          {isHoliday && (
            <div style={{ padding:"12px 14px", background:"#fdf4ff", borderRadius:10, border:"1px solid #e9d5ff" }}>
              <div style={{ fontSize:11, fontWeight:700, color:"#9ca3af", marginBottom:3 }}>HOLIDAY</div>
              <div style={{ fontSize:14, fontWeight:700, color:"#7e22ce" }}>{holiday.title}</div>
              <div style={{ fontSize:12.5, color:"#9ca3af", marginTop:2 }}>{holiday.description}</div>
            </div>
          )}
          {myShift && !isOff && !isHoliday && (
            <div style={{ padding:"12px 14px", background:"#fff7ed", borderRadius:10, border:"1px solid #fed7aa" }}>
              <div style={{ fontSize:11, fontWeight:700, color:"#9ca3af", marginBottom:3 }}>SHIFT</div>
              <div style={{ fontSize:14, fontWeight:700, color:"#c2410c" }}>{myShift.shift_name}</div>
              <div style={{ fontSize:12.5, color:"#9ca3af" }}>{myShift.start_time} – {myShift.end_time}</div>
            </div>
          )}
          {row && !isFuture && !isHoliday && (
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
              {[
                { l:"Punch In",  v: row.punch_in  || "—", c: row.punch_in  ? "#111827" : "#d1d5db" },
                { l:"Punch Out", v: row.punch_out || "—", c: row.punch_out ? "#111827" : "#d1d5db" },
                { l:"Hours",     v: row.hours > 0 ? `${row.hours}h` : "—", c: row.hours > 0 ? "#f97316" : "#d1d5db" },
                { l:"Status",    v: status, c: cfg.dot },
              ].map(item => (
                <div key={item.l} style={{ padding:"10px 12px", background:"#f9fafb", borderRadius:9 }}>
                  <div style={{ fontSize:10.5, fontWeight:700, color:"#9ca3af", marginBottom:3, textTransform:"uppercase", letterSpacing:"0.05em" }}>{item.l}</div>
                  <div style={{ fontSize:15, fontWeight:800, color:item.c }}>{item.v}</div>
                </div>
              ))}
            </div>
          )}
          {isFuture && !isHoliday && !isOff && (
            <div style={{ padding:"12px 14px", background:"#eff6ff", borderRadius:10, border:"1px solid #bfdbfe", textAlign:"center" }}>
              <div style={{ fontSize:22, marginBottom:4 }}>🗓️</div>
              <div style={{ fontSize:13, fontWeight:700, color:"#1d4ed8" }}>Upcoming Working Day</div>
              <div style={{ fontSize:12, color:"#9ca3af", marginTop:2 }}>Shift: {myShift?.shift_name} · {myShift?.start_time}–{myShift?.end_time}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Legend ───────────────────────────────────────────────────────────────────
function Legend() {
  const items = [
    { label:"Present",  color:"#22c55e" },
    { label:"Late",     color:"#eab308" },
    { label:"Early Out",color:"#f97316" },
    { label:"Absent",   color:"#ef4444" },
    { label:"Holiday",  color:"#a855f7" },
    { label:"Day Off",  color:"#d1d5db" },
    { label:"Upcoming", color:"#3b82f6" },
  ];
  return (
    <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"center" }}>
      {items.map(it => (
        <div key={it.label} style={{ display:"flex", alignItems:"center", gap:5 }}>
          <span style={{ width:8, height:8, borderRadius:"50%", background:it.color, flexShrink:0 }} />
          <span style={{ fontSize:11.5, color:"#6b7280", fontWeight:600 }}>{it.label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Calendar Grid ────────────────────────────────────────────────────────────
function CalendarGrid({ year, month, attendanceMap, myShift, holidays }) {
  const [selected, setSelected] = useState(null);
  const total    = daysInMonth(year, month);
  const startDay = firstDay(year, month);
  const cells    = Array.from({ length: 42 }, (_, i) => {
    const dayNum = i - startDay + 1;
    return dayNum >= 1 && dayNum <= total ? dayNum : null;
  });

  return (
    <div>
      {/* Day labels */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:6, marginBottom:6 }}>
        {DAY_LABELS.map(d => (
          <div key={d} style={{ textAlign:"center", fontSize:11.5, fontWeight:800, color:"#9ca3af", letterSpacing:"0.07em", textTransform:"uppercase", padding:"6px 0" }}>{d}</div>
        ))}
      </div>

      {/* Day cells */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:6 }}>
        {cells.map((dayNum, i) => {
          if (!dayNum) return <div key={i} />;
          const iso     = isoDate(year, month, dayNum);
          const isFuture= iso > TODAY_ISO;
          const isToday = iso === TODAY_ISO;
          const row     = attendanceMap[iso];
          const holiday = holidays.find(h => h.date_iso === iso);
          const isOff   = row?.status === "Off" || row?.status_label === "Day Off";
          const status  = getStatus(row, isFuture, !!holiday);
          const cfg     = STATUS_CFG[status] || STATUS_CFG["Off"];
          const isNoData= !row && !holiday && !isFuture;

          return (
            <div
              key={i}
              onClick={() => setSelected({ row, date: iso, holiday })}
              style={{
                borderRadius:12,
                background: isNoData ? "#fafafa" : cfg.bg,
                border: isToday
                  ? "2px solid #f97316"
                  : `1.5px solid ${isNoData ? "#f3f4f6" : cfg.dot + "44"}`,
                padding:"8px 6px 6px",
                minHeight:72,
                cursor:"pointer",
                transition:"all 0.15s",
                display:"flex", flexDirection:"column", alignItems:"center", gap:4,
                position:"relative",
                boxShadow: isToday ? `0 0 0 3px #f9731622, 0 4px 12px ${cfg.glow}` : `0 2px 6px ${isNoData?"rgba(0,0,0,0.03)":cfg.glow}`,
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 24px ${cfg.glow}`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = isToday ? `0 0 0 3px #f9731622, 0 4px 12px ${cfg.glow}` : `0 2px 6px ${isNoData?"rgba(0,0,0,0.03)":cfg.glow}`; }}
            >
              {/* Date number */}
              <div style={{
                width:24, height:24, borderRadius:"50%",
                background: isToday ? "#f97316" : "transparent",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:12.5, fontWeight:isToday?800:700,
                color: isToday ? "#fff" : isNoData ? "#d1d5db" : "#374151",
              }}>{dayNum}</div>

              {/* Status dot + label */}
              {(row || holiday) && !isNoData && (
                <>
                  <div style={{ width:7, height:7, borderRadius:"50%", background:cfg.dot }} />
                  <div style={{ fontSize:9.5, fontWeight:700, color:cfg.text, textAlign:"center", lineHeight:1.2, maxWidth:"100%" }}>
                    {status === "On Time" ? "✓" : status === "Holiday" ? holiday?.title?.split(" ")[0] : status.split(" ")[0]}
                  </div>
                </>
              )}

              {/* Punch in time */}
              {row?.punch_in && !isFuture && !holiday && (
                <div style={{ fontSize:9, color:"#9ca3af", fontWeight:600 }}>{row.punch_in}</div>
              )}

              {/* Upcoming indicator */}
              {isFuture && !isOff && !holiday && myShift?.active_days?.includes(DAY_LABELS[(i % 7)].toLowerCase()) && (
                <div style={{ width:5, height:5, borderRadius:"50%", background:"#3b82f6", opacity:0.6 }} />
              )}
            </div>
          );
        })}
      </div>

      {selected && (
        <DayPopover
          row={selected.row}
          date={selected.date}
          myShift={myShift}
          holiday={selected.holiday}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}

// ─── List View ────────────────────────────────────────────────────────────────
function ListView({ rows, myShift, holidays }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
      {rows.filter(r => r.status !== "Off" && r.status_label !== "Day Off").map((row, i) => {
        const isFuture = row.date > TODAY_ISO;
        const holiday  = holidays.find(h => h.date_iso === row.date);
        const status   = getStatus(row, isFuture, !!holiday);
        const cfg      = STATUS_CFG[status] || STATUS_CFG["Off"];
        const isToday  = row.date === TODAY_ISO;

        return (
          <div key={i} style={{
            display:"flex", alignItems:"center", gap:14, padding:"12px 16px",
            borderRadius:12, background:"#fff",
            border:`1.5px solid ${isToday?"#f97316":"#f1f5f9"}`,
            boxShadow: isToday ? "0 0 0 3px #f9731612" : "0 1px 4px rgba(0,0,0,0.04)",
            animation:`fadeUp 0.3s ease both`, animationDelay:`${i * 0.03}s`,
          }}>
            {/* Date block */}
            <div style={{ width:48, textAlign:"center", flexShrink:0 }}>
              <div style={{ fontSize:22, fontWeight:900, color: isToday ? "#f97316" : "#111827", lineHeight:1 }}>
                {new Date(row.date).getDate()}
              </div>
              <div style={{ fontSize:10.5, fontWeight:700, color:"#9ca3af", textTransform:"uppercase" }}>
                {new Date(row.date).toLocaleDateString("en-US",{weekday:"short"})}
              </div>
            </div>

            {/* Separator */}
            <div style={{ width:3, height:40, borderRadius:2, background:cfg.dot, flexShrink:0 }} />

            {/* Info */}
            <div style={{ flex:1 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:3 }}>
                <span style={{ fontSize:13.5, fontWeight:700, color:"#111827" }}>
                  {holiday ? holiday.title : myShift?.shift_name || "Morning"}
                </span>
                <span style={{ fontSize:10.5, fontWeight:700, padding:"2px 8px", borderRadius:99, background:cfg.bg, color:cfg.text, border:`1px solid ${cfg.dot}33` }}>
                  {status}
                </span>
              </div>
              <div style={{ fontSize:12, color:"#9ca3af" }}>
                {holiday ? holiday.description : `${myShift?.start_time}–${myShift?.end_time}`}
              </div>
            </div>

            {/* Times */}
            {!isFuture && !holiday && (
              <div style={{ display:"flex", gap:12, textAlign:"center" }}>
                <div>
                  <div style={{ fontSize:10, color:"#9ca3af", fontWeight:600 }}>IN</div>
                  <div style={{ fontSize:13, fontWeight:800, color:row.punch_in?"#111827":"#d1d5db" }}>{row.punch_in||"—"}</div>
                </div>
                <div>
                  <div style={{ fontSize:10, color:"#9ca3af", fontWeight:600 }}>OUT</div>
                  <div style={{ fontSize:13, fontWeight:800, color:row.punch_out?"#111827":"#d1d5db" }}>{row.punch_out||"—"}</div>
                </div>
                <div>
                  <div style={{ fontSize:10, color:"#9ca3af", fontWeight:600 }}>HRS</div>
                  <div style={{ fontSize:13, fontWeight:800, color:row.hours>0?"#f97316":"#d1d5db" }}>{row.hours>0?`${row.hours}h`:"—"}</div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AttendanceCalendarPage({ ACCENT = "#f97316" }) {
  const now = new Date();
  const [year,  setYear]  = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [view,  setView]  = useState("calendar"); // "calendar" | "list"
  const [loading, setLoading] = useState(true);

  const [myShift,   setMyShift]   = useState(null);
  const [history,   setHistory]   = useState([]);
  const [holidays,  setHolidays]  = useState([]);

  // Load data
  const load = useCallback(async () => {
    setLoading(true);
    const [shiftRes, histRes] = await Promise.all([
      apiFetch("/my-shift"),
      apiFetch(`/attendance/history?month=${month + 1}&year=${year}`),
    ]);
    if (shiftRes?.data) setMyShift(shiftRes.data);
    if (histRes?.data)  setHistory(histRes.data);

    // Holiday data — static for now, can be replaced with API
    setHolidays([
      { date_iso:"2026-01-01", title:"New Year",        description:"First day of the new year",          status:"Active" },
      { date_iso:"2026-01-15", title:"Pongal",          description:"Tamil harvest festival",              status:"Active" },
      { date_iso:"2026-01-26", title:"Republic Day",    description:"India Republic Day",                  status:"Active" },
      { date_iso:"2026-04-14", title:"Tamil New Year",  description:"Puthandu – Tamil New Year",           status:"Active" },
      { date_iso:"2026-04-18", title:"Good Friday",     description:"Holiday before Easter",               status:"Active" },
      { date_iso:"2026-05-01", title:"Labour Day",      description:"International Workers Day",           status:"Active" },
      { date_iso:"2026-08-15", title:"Independence Day",description:"India Independence Day",              status:"Active" },
      { date_iso:"2026-10-02", title:"Gandhi Jayanti",  description:"Birthday of Mahatma Gandhi",          status:"Active" },
      { date_iso:"2026-11-14", title:"Diwali",          description:"Festival of Lights",                  status:"Active" },
      { date_iso:"2026-12-25", title:"Christmas",       description:"Celebration of Christmas",            status:"Active" },
    ]);
    setLoading(false);
  }, [year, month]);

  useEffect(() => { load(); }, [load]);

  // Build attendance map keyed by ISO date
  const attendanceMap = {};
  history.forEach(r => { attendanceMap[r.date] = r; });

  // Stats for this month
  const monthRows = history.filter(r => {
    const d = new Date(r.date);
    return d.getFullYear() === year && d.getMonth() === month;
  });

  const pastRows = monthRows.filter(r => r.date <= TODAY_ISO);
  const onTime   = pastRows.filter(r => r.status === "On Time" || r.status_label === "On Time").length;
  const late     = pastRows.filter(r => r.status === "Late"    || r.status_label?.includes("Late")).length;
  const absent   = pastRows.filter(r => r.status === "Absent"  || r.status_label === "Absent").length;
  const earlyOut = pastRows.filter(r => r.status === "Early Out"|| r.status_label === "Early Out").length;
  const totalWorked = pastRows.reduce((a, r) => a + (r.hours || 0), 0);
  const monthHolidays = holidays.filter(h => {
    const d = new Date(h.date_iso);
    return d.getFullYear() === year && d.getMonth() === month;
  });

  const prevMonth = () => { if (month === 0) { setYear(y=>y-1); setMonth(11); } else setMonth(m=>m-1); };
  const nextMonth = () => { if (month === 11) { setYear(y=>y+1); setMonth(0);  } else setMonth(m=>m+1); };
  const goToday   = () => { setYear(now.getFullYear()); setMonth(now.getMonth()); };

  return (
    <div style={{ fontFamily:"'Nunito','DM Sans',sans-serif", display:"flex", flexDirection:"column", gap:20 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }
        @keyframes popIn  { from{opacity:0;transform:scale(0.93)}      to{opacity:1;transform:scale(1)} }
        @keyframes spin   { from{transform:rotate(0)} to{transform:rotate(360deg)} }
      `}</style>

      {/* ── Stat Cards ─────────────────────────────────────────────────────── */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:12 }}>
        <StatCard label="Present"    value={loading?"…":onTime}   color="#22c55e" icon="✓"  delay="0s"    sub="On time days" />
        <StatCard label="Late"       value={loading?"…":late}     color="#eab308" icon="⏰" delay="0.05s" sub="Late arrivals" />
        <StatCard label="Early Out"  value={loading?"…":earlyOut} color="#f97316" icon="↩"  delay="0.1s"  sub="Left early"   />
        <StatCard label="Absent"     value={loading?"…":absent}   color="#ef4444" icon="✕"  delay="0.15s" sub="Days missed"   />
        <StatCard label="Hours"      value={loading?"…":`${Math.round(totalWorked*10)/10}h`} color="#3b82f6" icon="⏱" delay="0.2s" sub="Total worked" />
      </div>

      {/* ── Calendar Card ──────────────────────────────────────────────────── */}
      <div style={{
        background:"#fff", borderRadius:20,
        border:"1px solid #f1f5f9",
        boxShadow:"0 4px 32px rgba(0,0,0,0.06)",
        overflow:"hidden",
        animation:"fadeUp 0.4s ease 0.1s both",
      }}>
        {/* Header bar */}
        <div style={{
          background:`linear-gradient(135deg,#1e293b 0%,#334155 100%)`,
          padding:"18px 24px",
          display:"flex", alignItems:"center", justifyContent:"space-between",
        }}>
          {/* Left: nav */}
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <button onClick={prevMonth} style={{ width:34, height:34, borderRadius:9, background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.15)", cursor:"pointer", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>‹</button>
            <div>
              <div style={{ fontSize:20, fontWeight:900, color:"#fff", letterSpacing:"-0.5px" }}>{MONTH_NAMES[month]}</div>
              <div style={{ fontSize:12, color:"rgba(255,255,255,0.5)", marginTop:1 }}>{year}</div>
            </div>
            <button onClick={nextMonth} style={{ width:34, height:34, borderRadius:9, background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.15)", cursor:"pointer", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>›</button>
            <button onClick={goToday} style={{ fontSize:12, fontWeight:700, padding:"5px 12px", borderRadius:8, background:ACCENT, border:"none", color:"#fff", cursor:"pointer", marginLeft:4 }}>Today</button>
          </div>

          {/* Right: shift pill + view toggle + refresh */}
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            {myShift && (
              <div style={{ display:"flex", alignItems:"center", gap:7, background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.15)", borderRadius:10, padding:"6px 12px" }}>
                <span style={{ fontSize:16 }}>☀️</span>
                <div>
                  <div style={{ fontSize:12, fontWeight:800, color:"#fff" }}>{myShift.shift_name} Shift</div>
                  <div style={{ fontSize:10.5, color:"rgba(255,255,255,0.6)" }}>{myShift.start_time}–{myShift.end_time}</div>
                </div>
              </div>
            )}

            {/* View toggle */}
            <div style={{ display:"flex", borderRadius:9, overflow:"hidden", border:"1px solid rgba(255,255,255,0.15)" }}>
              {["calendar","list"].map(v => (
                <button key={v} onClick={()=>setView(v)} style={{
                  padding:"7px 14px", border:"none", cursor:"pointer",
                  background: view===v ? ACCENT : "rgba(255,255,255,0.08)",
                  color: "#fff", fontSize:12, fontWeight:700, transition:"background 0.15s",
                }}>
                  {v === "calendar" ? "📅 Calendar" : "☰ List"}
                </button>
              ))}
            </div>

            <button onClick={load} style={{ width:34, height:34, borderRadius:9, background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.15)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
              {loading
                ? <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.5} strokeLinecap="round" style={{animation:"spin .8s linear infinite"}}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                : <span style={{ fontSize:14, color:"#fff" }}>↻</span>}
            </button>
          </div>
        </div>

        {/* Month summary strip */}
        <div style={{
          background:"#f8fafc", borderBottom:"1px solid #f1f5f9",
          padding:"10px 24px", display:"flex", alignItems:"center", justifyContent:"space-between",
        }}>
          <Legend />
          <div style={{ display:"flex", gap:16 }}>
            {monthHolidays.length > 0 && (
              <div style={{ fontSize:12, color:"#7e22ce", fontWeight:700 }}>
                🎉 {monthHolidays.length} holiday{monthHolidays.length > 1 ? "s" : ""} this month
              </div>
            )}
            <div style={{ fontSize:12, color:"#9ca3af" }}>
              {daysInMonth(year, month)} days · {pastRows.filter(r=>r.status!=="Off"&&r.status_label!=="Day Off").length} tracked
            </div>
          </div>
        </div>

        {/* Calendar or List */}
        <div style={{ padding:"20px 24px" }}>
          {view === "calendar" ? (
            <CalendarGrid
              year={year}
              month={month}
              attendanceMap={attendanceMap}
              myShift={myShift}
              holidays={holidays}
            />
          ) : (
            <ListView
              rows={monthRows.length ? monthRows : history.filter(r=>{
                const d=new Date(r.date);
                return d.getFullYear()===year && d.getMonth()===month;
              })}
              myShift={myShift}
              holidays={holidays}
            />
          )}
        </div>

        {/* Footer */}
        <div style={{ padding:"12px 24px", borderTop:"1px solid #f1f5f9", background:"#fafafa", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <span style={{ fontSize:12, color:"#9ca3af" }}>
            Click any day to see full details · Data from pencilkraft API
          </span>
          <div style={{ display:"flex", gap:12 }}>
            {[
              { label:"Working Days", val: pastRows.filter(r=>r.status!=="Off"&&r.status_label!=="Day Off").length, color:"#374151" },
              { label:"Holidays",     val: monthHolidays.length,         color:"#a855f7" },
              { label:"Days Off",     val: pastRows.filter(r=>r.status==="Off"||r.status_label==="Day Off").length, color:"#9ca3af" },
            ].map(item => (
              <div key={item.label} style={{ fontSize:12, color:"#9ca3af" }}>
                <span style={{ fontWeight:700, color:item.color }}>{item.val}</span> {item.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Holiday List Table ─────────────────────────────────────────────── */}
      <div style={{
        background:"#fff", borderRadius:20,
        border:"1px solid #f1f5f9",
        boxShadow:"0 4px 32px rgba(0,0,0,0.04)",
        overflow:"hidden",
        animation:"fadeUp 0.5s ease 0.2s both",
      }}>
        <div style={{ padding:"16px 24px", borderBottom:"1px solid #f1f5f9", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <div style={{ fontSize:15, fontWeight:800, color:"#111827" }}>Holiday Calendar {year}</div>
            <div style={{ fontSize:12, color:"#9ca3af", marginTop:2 }}>Official holidays for this year</div>
          </div>
          <span style={{ fontSize:12, fontWeight:700, padding:"4px 12px", borderRadius:99, background:"#fdf4ff", color:"#7e22ce", border:"1px solid #e9d5ff" }}>
            {holidays.length} holidays
          </span>
        </div>

        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ background:"#fafafa" }}>
                {["#","Holiday","Date","Day","Description","Status"].map((h,i) => (
                  <th key={i} style={{ padding:"10px 20px", textAlign:"left", fontSize:11.5, fontWeight:700, color:"#9ca3af", textTransform:"uppercase", letterSpacing:"0.06em", borderBottom:"1px solid #f1f5f9" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {holidays.map((h, i) => {
                const d = new Date(h.date_iso);
                const isPast = h.date_iso < TODAY_ISO;
                const isThisMonth = d.getFullYear() === year && d.getMonth() === month;
                return (
                  <tr key={i}
                    style={{ borderBottom:"1px solid #f9fafb", background: isThisMonth ? "#fdf4ff08" : "#fff", opacity: isPast ? 0.65 : 1 }}
                    onMouseEnter={e=>e.currentTarget.style.background="#fafafa"}
                    onMouseLeave={e=>e.currentTarget.style.background=isThisMonth?"#fdf4ff08":"#fff"}>
                    <td style={{ padding:"13px 20px", fontSize:13, fontWeight:700, color:"#d1d5db" }}>{i+1}</td>
                    <td style={{ padding:"13px 20px" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                        <div style={{ width:8, height:8, borderRadius:"50%", background:"#a855f7", flexShrink:0 }} />
                        <span style={{ fontSize:13.5, fontWeight:700, color:"#111827" }}>{h.title}</span>
                        {isThisMonth && <span style={{ fontSize:10, fontWeight:700, padding:"2px 7px", borderRadius:99, background:"#a855f7", color:"#fff" }}>This Month</span>}
                      </div>
                    </td>
                    <td style={{ padding:"13px 20px", fontSize:13, fontWeight:600, color:"#374151" }}>
                      {d.toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})}
                    </td>
                    <td style={{ padding:"13px 20px", fontSize:13, color:"#6b7280" }}>
                      {d.toLocaleDateString("en-US",{weekday:"long"})}
                    </td>
                    <td style={{ padding:"13px 20px", fontSize:13, color:"#9ca3af" }}>{h.description}</td>
                    <td style={{ padding:"13px 20px" }}>
                      <span style={{
                        display:"inline-flex", alignItems:"center", gap:5,
                        background: h.status==="Active" ? "#22c55e" : "#ef4444",
                        color:"#fff", borderRadius:7, padding:"4px 12px",
                        fontSize:12, fontWeight:700,
                      }}>
                        <span style={{ width:5, height:5, borderRadius:"50%", background:"rgba(255,255,255,0.6)" }} />
                        {h.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div style={{ padding:"10px 24px", borderTop:"1px solid #f1f5f9", background:"#fafafa", fontSize:12, color:"#9ca3af" }}>
          Showing {holidays.length} holidays · {holidays.filter(h=>h.status==="Active").length} active · Dimmed rows are past dates
        </div>
      </div>
    </div>
  );
}