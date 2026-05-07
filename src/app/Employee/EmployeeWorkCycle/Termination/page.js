"use client";
import { useState } from "react";

// ─── Icon ──────────────────────────────────────────────────────────────────────
const Icon = ({ d, size = 16, stroke = "currentColor", sw = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke}
    strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
    style={{ display: "block", flexShrink: 0 }}>
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

const IC = {
  check:    "M20 6L9 17l-5-5",
  clock:    "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2",
  alert:    "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z M12 9v4M12 17h.01",
  msg:      "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
  send:     "M22 2L11 13 M22 2L15 22l-4-9-9-4 22-7z",
  chevD:    "M6 9l6 6 6-6",
  chevU:    "M18 15l-6-6-6 6",
  download: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M7 10l5 5 5-5 M12 15V3",
  file:     "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6",
  calendar: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z",
  shield:   "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  info:     "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 8h.01M12 12v4",
  phone:    "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z",
  appeal:   "M9 12l2 2 4-4 M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z",
  x:        "M18 6L6 18M6 6l12 12",
};

const ACCENT = "#f97316";

// ─── Employee termination data ─────────────────────────────────────────────────
const ME = {
  name:           "Arjun Nair",
  role:           "Sales Executive",
  dept:           "Sales",
  empId:          "EMP-0042",
  joinDate:       "Jan 15, 2024",
  terminationDate:"Apr 30, 2026",
  lastWorkDay:    "Apr 30, 2026",
  hrContact:      "Divya R.",
  hrEmail:        "divya.r@company.com",
  status:         "Notice Served",  // "Notified" | "Notice Served" | "Clearance Pending" | "Settled"
  type:           "Termination",    // "Termination" | "Layoff" | "Mutual Separation"
  reason:         "Performance",
  severanceDays:  15,
  noticeDays:     30,
  elapsed:        30,
};

// Status config
const STATUS_CFG = {
  "Notified":          { bg:"#fef2f2", c:"#b91c1c", dot:"#ef4444", emoji:"🔴", msg:"You have been formally notified of termination." },
  "Notice Served":     { bg:"#fff7ed", c:"#c2410c", dot:"#f97316", emoji:"⏳", msg:"Your notice period is complete. Clearance in progress." },
  "Clearance Pending": { bg:"#fffbeb", c:"#b45309", dot:"#f59e0b", emoji:"📋", msg:"Completing exit clearance formalities." },
  "Settled":           { bg:"#f0fdf4", c:"#15803d", dot:"#22c55e", emoji:"✅", msg:"All formalities complete. Settlement processed." },
};

// Clearance checklist — what the employee needs to do
const CLEARANCE = [
  { id:1, cat:"You",     label:"Return Laptop & Equipment",  done:true,  dueDate:"Apr 30, 2026", note:"Return to admin — ground floor" },
  { id:2, cat:"You",     label:"Return ID Card & Access Cards", done:true, dueDate:"Apr 30, 2026", note:"Hand over to security" },
  { id:3, cat:"You",     label:"Clear Desk & Personal Belongings", done:true, dueDate:"Apr 30, 2026", note:"Collect by last day" },
  { id:4, cat:"You",     label:"Exit Interview",              done:false, dueDate:"Apr 28, 2026", note:"15 min session with HR", special:true },
  { id:5, cat:"Company", label:"Access & System Revocation",  done:true,  note:"Completed by IT on Apr 30" },
  { id:6, cat:"Company", label:"Full & Final Settlement",     done:false, note:"Expected by May 15, 2026" },
  { id:7, cat:"Company", label:"Experience Letter",           done:false, note:"Expected by May 12, 2026" },
  { id:8, cat:"Company", label:"Relieving Letter",            done:false, note:"Expected by May 12, 2026" },
];

// Settlement breakdown
const SETTLEMENT = [
  { label:"Last Month Salary",       val:"₹48,000", type:"base"   },
  { label:"Severance Pay (15 days)", val:"+₹24,000",type:"credit" },
  { label:"Leave Encashment (8d)",   val:"+₹8,000", type:"credit" },
  { label:"Notice Pay",              val:"+₹0",     type:"base"   },
  { label:"Deductions / Recovery",   val:"−₹3,500", type:"debit"  },
];

// Timeline
const TIMELINE = [
  { date:"Apr 1, 2026",  label:"Termination Notice Issued",     done:true,  icon:"🔴" },
  { date:"Apr 1, 2026",  label:"HR Meeting & Documentation",    done:true,  icon:"✅" },
  { date:"Apr 30, 2026", label:"Last Working Day",              done:true,  icon:"✅" },
  { date:"Apr 28, 2026", label:"Exit Interview",                done:false, icon:"🔵" },
  { date:"May 12, 2026", label:"Relieving & Experience Letter", done:false, icon:"⬜" },
  { date:"May 15, 2026", label:"Full & Final Settlement",       done:false, icon:"⬜" },
];

// Documents
const DOCS = [
  { name:"Termination Letter",           status:"available", date:"Apr 1, 2026"  },
  { name:"HR Meeting Summary",           status:"available", date:"Apr 1, 2026"  },
  { name:"Exit Interview Form",          status:"pending",   note:"After interview" },
  { name:"Relieving Letter",             status:"pending",   note:"By May 12, 2026" },
  { name:"Experience Letter",            status:"pending",   note:"By May 12, 2026" },
  { name:"Full & Final Settlement Slip", status:"pending",   note:"By May 15, 2026" },
];

// Appeal rights info
const RIGHTS = [
  "You have the right to appeal this decision within 7 days of notification.",
  "All dues including earned salary, leave encashment & severance will be settled.",
  "You are entitled to an Experience Letter and Relieving Letter.",
  "You may seek legal counsel regarding this termination.",
];

// ─── Modal ─────────────────────────────────────────────────────────────────────
function Modal({ show, onClose, title, color = ACCENT, children }) {
  if (!show) return null;
  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, zIndex:600, background:"rgba(15,23,42,0.65)", backdropFilter:"blur(8px)", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:"#fff", borderRadius:20, width:"100%", maxWidth:460, boxShadow:"0 32px 80px rgba(0,0,0,0.25)", animation:"popIn 0.22s cubic-bezier(0.34,1.56,0.64,1) both", overflow:"hidden" }}>
        <div style={{ background:`linear-gradient(135deg,${color},${color}bb)`, padding:"18px 22px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ fontSize:16, fontWeight:900, color:"#fff" }}>{title}</div>
          <button onClick={onClose} style={{ width:28, height:28, borderRadius:8, background:"rgba(255,255,255,0.2)", border:"none", cursor:"pointer", color:"#fff", fontSize:16, display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
        </div>
        <div style={{ padding:"20px 22px 22px" }}>{children}</div>
      </div>
    </div>
  );
}

const inputStyle = { width:"100%", padding:"10px 13px", border:"1.5px solid #e5e7eb", borderRadius:10, fontSize:13.5, color:"#111827", outline:"none", boxSizing:"border-box", fontFamily:"inherit", background:"#fafafa" };

// ─── Main ──────────────────────────────────────────────────────────────────────
export default function MyTermination() {
  const [clearance,    setClearance]    = useState(CLEARANCE);
  const [modal,        setModal]        = useState(null);
  const [msgText,      setMsgText]      = useState("");
  const [appealText,   setAppealText]   = useState("");
  const [exitReason,   setExitReason]   = useState("");
  const [exitFeedback, setExitFeedback] = useState("");
  const [expandDocs,   setExpandDocs]   = useState(false);
  const [expandRights, setExpandRights] = useState(true);

  const cfg      = STATUS_CFG[ME.status] || STATUS_CFG["Notified"];
  const myTasks  = clearance.filter(c => c.cat === "You");
  const coTasks  = clearance.filter(c => c.cat === "Company");
  const myDone   = myTasks.filter(t => t.done).length;
  const pct      = Math.min(100, Math.round((ME.elapsed / ME.noticeDays) * 100));
  const netPay   = "₹76,500";
  const settleDate = "May 15, 2026";

  const markDone = (id) => setClearance(prev => prev.map(c => c.id === id ? { ...c, done:true } : c));
  const submitExit = () => { markDone(4); setModal(null); };

  return (
    <div style={{ fontFamily:"'Nunito','DM Sans',sans-serif", display:"flex", flexDirection:"column", gap:16 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }
        @keyframes popIn  { from{opacity:0;transform:scale(0.93)} to{opacity:1;transform:scale(1)} }
        @keyframes pulse  { 0%,100%{opacity:0.5} 50%{opacity:1} }
      `}</style>

      {/* ── HERO ───────────────────────────────────────────────────────────── */}
      <div style={{ borderRadius:20, overflow:"hidden", background:"linear-gradient(135deg,#1e293b 0%,#0f172a 100%)", boxShadow:"0 8px 40px rgba(0,0,0,0.2)", animation:"fadeUp 0.4s ease both" }}>

        {/* Top */}
        <div style={{ padding:"24px 28px 18px", display:"flex", alignItems:"flex-start", justifyContent:"space-between", flexWrap:"wrap", gap:16 }}>
          <div>
            <div style={{ fontSize:11, fontWeight:800, letterSpacing:"0.12em", color:"rgba(255,255,255,0.3)", textTransform:"uppercase", marginBottom:6 }}>My Termination Status</div>
            <div style={{ fontSize:22, fontWeight:900, color:"#fff", letterSpacing:"-0.5px" }}>Hello, {ME.name.split(" ")[0]} 👋</div>
            <div style={{ fontSize:13, color:"rgba(255,255,255,0.45)", marginTop:4 }}>
              {ME.role} · {ME.dept} · ID: <span style={{ color:"rgba(255,255,255,0.6)", fontWeight:700 }}>{ME.empId}</span>
            </div>
            {/* Status badge */}
            <div style={{ marginTop:14, display:"inline-flex", alignItems:"center", gap:8, padding:"7px 14px", borderRadius:99, background:cfg.bg, border:`1.5px solid ${cfg.dot}55` }}>
              <span style={{ width:8, height:8, borderRadius:"50%", background:cfg.dot, animation:"pulse 2s ease infinite" }} />
              <span style={{ fontSize:13, fontWeight:800, color:cfg.c }}>{cfg.emoji} {ME.status}</span>
              <span style={{ fontSize:12, color:cfg.c, opacity:0.7 }}>· {cfg.msg}</span>
            </div>
          </div>

          {/* Type badge */}
          <div style={{ textAlign:"right" }}>
            <div style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.3)", letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:8 }}>Separation Type</div>
            <div style={{ background:"rgba(239,68,68,0.15)", border:"1px solid rgba(239,68,68,0.3)", borderRadius:12, padding:"10px 18px", textAlign:"center" }}>
              <div style={{ fontSize:20, marginBottom:4 }}>
                {ME.type === "Termination" ? "🔴" : ME.type === "Layoff" ? "🟡" : "🤝"}
              </div>
              <div style={{ fontSize:14, fontWeight:900, color:"#f87171" }}>{ME.type}</div>
              <div style={{ fontSize:12, color:"rgba(255,255,255,0.4)", marginTop:2 }}>Reason: {ME.reason}</div>
            </div>
          </div>
        </div>

        {/* Notice period bar */}
        <div style={{ padding:"0 28px 16px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:"rgba(255,255,255,0.3)", marginBottom:6, fontWeight:700 }}>
            <span>Notice Start: {ME.terminationDate}</span>
            <span>{pct}% complete · {ME.noticeDays}-day notice</span>
            <span>Last Day: {ME.lastWorkDay}</span>
          </div>
          <div style={{ height:8, background:"rgba(255,255,255,0.08)", borderRadius:99, overflow:"hidden" }}>
            <div style={{ height:"100%", width:`${pct}%`, background:`linear-gradient(90deg,#ef4444,#f97316)`, borderRadius:99 }} />
          </div>
        </div>

        {/* Stats + action strip */}
        <div style={{ padding:"12px 28px 16px", borderTop:"1px solid rgba(255,255,255,0.06)", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
          <div style={{ display:"flex", alignItems:"center", gap:24 }}>
            {[
              { label:"Tasks Done",    val:`${myDone}/${myTasks.length}`, color:"#fb923c"              },
              { label:"Net Payable",   val:netPay,                         color:"#22c55e"              },
              { label:"Settlement",    val:settleDate,                     color:"rgba(255,255,255,0.7)" },
              { label:"Severance",     val:`${ME.severanceDays} days`,     color:"rgba(255,255,255,0.6)" },
            ].map((s, i) => (
              <div key={i}>
                <div style={{ fontSize:10.5, fontWeight:700, color:"rgba(255,255,255,0.3)", textTransform:"uppercase", letterSpacing:"0.07em" }}>{s.label}</div>
                <div style={{ fontSize:16, fontWeight:900, color:s.color, marginTop:2 }}>{s.val}</div>
              </div>
            ))}
          </div>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            <button onClick={()=>setModal("appeal")} style={{ padding:"8px 14px", borderRadius:10, background:"rgba(251,191,36,0.12)", border:"1px solid rgba(251,191,36,0.3)", cursor:"pointer", fontSize:12, fontWeight:700, color:"#fbbf24" }}>
              ⚖️ File Appeal
            </button>
            <button onClick={()=>setModal("msg")} style={{ padding:"8px 16px", borderRadius:10, background:ACCENT, border:"none", cursor:"pointer", fontSize:12, fontWeight:700, color:"#fff", display:"flex", alignItems:"center", gap:6 }}>
              <Icon d={IC.msg} size={13} stroke="#fff" />Contact HR
            </button>
          </div>
        </div>
      </div>

      {/* ── ALERT BANNER ──────────────────────────────────────────────────── */}
      <div style={{ background:"#fef2f2", border:"1.5px solid #fecaca", borderRadius:14, padding:"14px 18px", display:"flex", gap:12, alignItems:"flex-start", animation:"fadeUp 0.4s ease 0.05s both" }}>
        <div style={{ width:36, height:36, borderRadius:10, background:"#fee2e2", border:"1px solid #fca5a5", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontSize:18 }}>⚠️</div>
        <div>
          <div style={{ fontSize:13.5, fontWeight:800, color:"#b91c1c", marginBottom:3 }}>Important Notice</div>
          <div style={{ fontSize:12.5, color:"#7f1d1d", lineHeight:1.7 }}>
            Your employment has been terminated effective <strong>{ME.terminationDate}</strong>. You have <strong>7 days</strong> to file an appeal if you believe this decision was unjust. All settlement dues will be processed by <strong>{settleDate}</strong>. Please contact HR for any queries.
          </div>
        </div>
      </div>

      {/* ── 2-COL GRID ─────────────────────────────────────────────────────── */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 330px", gap:16, alignItems:"start" }}>

        {/* LEFT ─────────────────────────────────────────────────────────────── */}
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

          {/* Exit Clearance */}
          <div style={{ background:"#fff", borderRadius:16, border:"1px solid #f1f5f9", overflow:"hidden", boxShadow:"0 2px 16px rgba(0,0,0,0.05)", animation:"fadeUp 0.42s ease 0.1s both" }}>
            <div style={{ padding:"14px 20px", borderBottom:"1px solid #f1f5f9", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div>
                <div style={{ fontSize:14, fontWeight:800, color:"#111827" }}>☑️ Exit Clearance</div>
                <div style={{ fontSize:12, color:"#9ca3af", marginTop:2 }}>Complete these before your last day</div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <div style={{ width:64, height:6, background:"#f1f5f9", borderRadius:99, overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${Math.round(myDone/myTasks.length*100)}%`, background:`linear-gradient(90deg,#ef4444,${ACCENT})`, borderRadius:99 }} />
                </div>
                <span style={{ fontSize:13, fontWeight:900, color:ACCENT }}>{Math.round(myDone/myTasks.length*100)}%</span>
              </div>
            </div>

            {/* My tasks */}
            <div style={{ padding:"6px 0 2px" }}>
              <div style={{ padding:"8px 20px", fontSize:11, fontWeight:800, color:"#ef4444", textTransform:"uppercase", letterSpacing:"0.08em" }}>Your Actions ({myDone}/{myTasks.length})</div>
              {myTasks.map((t, i) => (
                <div key={t.id} style={{
                  display:"flex", alignItems:"center", gap:13, padding:"13px 20px",
                  borderBottom:"1px solid #f9fafb",
                  background: t.done ? "#f0fdf408" : "#fff",
                  animation:`fadeUp 0.38s ease ${0.1+i*0.07}s both`,
                }}>
                  <div style={{ width:30, height:30, borderRadius:9, flexShrink:0, background: t.done?"#dcfce7":"#fafafa", border:`1.5px solid ${t.done?"#86efac":"#e5e7eb"}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    {t.done ? <Icon d={IC.check} size={14} stroke="#16a34a" sw={2.5} /> : <Icon d={IC.clock} size={13} stroke="#d1d5db" />}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13.5, fontWeight:700, color: t.done?"#9ca3af":"#111827", textDecoration:t.done?"line-through":"none" }}>{t.label}</div>
                    <div style={{ fontSize:11.5, color:"#9ca3af", marginTop:2 }}>Due: {t.dueDate} · {t.note}</div>
                  </div>
                  {t.done
                    ? <span style={{ fontSize:11.5, fontWeight:700, color:"#16a34a", background:"#f0fdf4", padding:"2px 9px", borderRadius:99, flexShrink:0 }}>✓ Done</span>
                    : <button
                        onClick={() => t.special ? setModal("exit") : markDone(t.id)}
                        style={{ padding:"5px 14px", borderRadius:8, border:"none", cursor:"pointer", background:"#fef2f212", color:"#ef4444", border:"1px solid #fecaca", fontSize:12.5, fontWeight:700, flexShrink:0, transition:"all 0.15s" }}
                        onMouseEnter={e=>{ e.currentTarget.style.background="#ef4444"; e.currentTarget.style.color="#fff"; e.currentTarget.style.border="1px solid #ef4444"; }}
                        onMouseLeave={e=>{ e.currentTarget.style.background="#fef2f212"; e.currentTarget.style.color="#ef4444"; e.currentTarget.style.border="1px solid #fecaca"; }}>
                        {t.special ? "Fill Form" : "Mark Done"}
                      </button>}
                </div>
              ))}
            </div>

            {/* Company tasks */}
            <div style={{ padding:"6px 0 10px" }}>
              <div style={{ padding:"8px 20px", fontSize:11, fontWeight:800, color:"#9ca3af", textTransform:"uppercase", letterSpacing:"0.08em" }}>Pending from Company</div>
              {coTasks.map((t, i) => (
                <div key={t.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 20px", borderBottom: i<coTasks.length-1?"1px solid #f9fafb":"none" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                    <span style={{ width:6, height:6, borderRadius:"50%", background: t.done?"#22c55e":"#e5e7eb", flexShrink:0 }} />
                    <div>
                      <div style={{ fontSize:13, fontWeight:600, color: t.done?"#6b7280":"#6b7280" }}>{t.label}</div>
                      <div style={{ fontSize:11.5, color:"#9ca3af", marginTop:1 }}>{t.note}</div>
                    </div>
                  </div>
                  <span style={{ fontSize:11.5, fontWeight:700, flexShrink:0, padding:"2px 9px", borderRadius:99,
                    color: t.done?"#16a34a":"#d97706",
                    background: t.done?"#f0fdf4":"#fefce8" }}>
                    {t.done ? "✓ Done" : "Awaiting"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div style={{ background:"#fff", borderRadius:16, border:"1px solid #f1f5f9", overflow:"hidden", boxShadow:"0 2px 16px rgba(0,0,0,0.05)", animation:"fadeUp 0.42s ease 0.16s both" }}>
            <div style={{ padding:"14px 20px", borderBottom:"1px solid #f1f5f9" }}>
              <div style={{ fontSize:14, fontWeight:800, color:"#111827" }}>📍 Termination Timeline</div>
              <div style={{ fontSize:12, color:"#9ca3af", marginTop:2 }}>Key milestones in your exit process</div>
            </div>
            <div style={{ padding:"18px 20px 10px", position:"relative" }}>
              <div style={{ position:"absolute", left:38, top:18, bottom:18, width:2, background:"#f1f5f9", borderRadius:1 }} />
              {TIMELINE.map((t, i) => {
                const isCurrent = !t.done && TIMELINE.slice(0, i).every(x => x.done);
                return (
                  <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:14, paddingBottom: i<TIMELINE.length-1?18:8, position:"relative", animation:`fadeUp 0.38s ease ${0.1+i*0.07}s both` }}>
                    <div style={{ width:28, height:28, borderRadius:"50%", background:"#fff", border:`2px solid ${t.done?"#86efac":isCurrent?"#93c5fd":"#e5e7eb"}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, flexShrink:0, zIndex:1 }}>
                      {t.icon}
                    </div>
                    <div style={{ paddingTop:4, flex:1 }}>
                      <div style={{ fontSize:13.5, fontWeight:700, color: t.done?"#111827":"#9ca3af" }}>{t.label}</div>
                      <div style={{ fontSize:12, color:"#9ca3af", marginTop:2 }}>{t.date}</div>
                    </div>
                    {isCurrent && <span style={{ marginTop:4, fontSize:11.5, fontWeight:700, padding:"2px 10px", borderRadius:99, background:"#eff6ff", color:"#1d4ed8", flexShrink:0 }}>Next</span>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Your Rights */}
          <div style={{ background:"#fff", borderRadius:16, border:"1px solid #f1f5f9", overflow:"hidden", boxShadow:"0 2px 16px rgba(0,0,0,0.05)", animation:"fadeUp 0.42s ease 0.2s both" }}>
            <button onClick={()=>setExpandRights(v=>!v)} style={{ width:"100%", padding:"14px 20px", borderBottom: expandRights?"1px solid #f1f5f9":"none", display:"flex", alignItems:"center", justifyContent:"space-between", background:"none", border:"none", cursor:"pointer" }}>
              <div style={{ fontSize:14, fontWeight:800, color:"#111827" }}>⚖️ Your Rights & Entitlements</div>
              <Icon d={expandRights ? IC.chevU : IC.chevD} size={15} stroke="#9ca3af" />
            </button>
            {expandRights && (
              <div style={{ padding:"14px 20px 16px", display:"flex", flexDirection:"column", gap:10 }}>
                {RIGHTS.map((r, i) => (
                  <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:10, padding:"10px 14px", background:"#f8fafc", borderRadius:10, border:"1px solid #f1f5f9" }}>
                    <div style={{ width:22, height:22, borderRadius:6, background:"#eff6ff", border:"1px solid #bfdbfe", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:1 }}>
                      <Icon d={IC.shield} size={11} stroke="#3b82f6" />
                    </div>
                    <span style={{ fontSize:12.5, color:"#374151", lineHeight:1.6 }}>{r}</span>
                  </div>
                ))}
                <div style={{ padding:"10px 14px", background:"#fef2f2", borderRadius:10, border:"1px solid #fecaca" }}>
                  <div style={{ fontSize:12, fontWeight:700, color:"#b91c1c", marginBottom:2 }}>Appeal Deadline</div>
                  <div style={{ fontSize:12.5, color:"#7f1d1d" }}>File your appeal by <strong>May 7, 2026</strong> (7 days from termination notice). Click <strong>"⚖️ File Appeal"</strong> above.</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT ─────────────────────────────────────────────────────────────── */}
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

          {/* Settlement */}
          <div style={{ background:"#fff", borderRadius:16, border:"1px solid #f1f5f9", overflow:"hidden", boxShadow:"0 2px 16px rgba(0,0,0,0.05)", animation:"fadeUp 0.42s ease 0.08s both" }}>
            <div style={{ padding:"14px 18px", borderBottom:"1px solid #f1f5f9" }}>
              <div style={{ fontSize:13.5, fontWeight:800, color:"#111827" }}>💰 Full & Final Settlement</div>
              <div style={{ fontSize:12, color:"#9ca3af", marginTop:2 }}>Expected by {settleDate}</div>
            </div>
            <div style={{ padding:"4px 0" }}>
              {SETTLEMENT.map((s, i) => (
                <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"11px 18px", borderBottom: i<SETTLEMENT.length-1?"1px solid #f9fafb":"none" }}>
                  <span style={{ fontSize:12.5, color:"#6b7280" }}>{s.label}</span>
                  <span style={{ fontSize:14, fontWeight:900, color: s.type==="credit"?"#16a34a":s.type==="debit"?"#dc2626":"#111827" }}>{s.val}</span>
                </div>
              ))}
            </div>
            <div style={{ margin:"0 14px 14px", padding:"14px 16px", borderRadius:12, background:"linear-gradient(135deg,#f0fdf415,#dcfce710)", border:"1.5px solid #86efac55", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ fontSize:14, fontWeight:800, color:"#111827" }}>Net Payable</span>
              <span style={{ fontSize:24, fontWeight:900, color:"#16a34a", letterSpacing:"-0.5px" }}>{netPay}</span>
            </div>
            <div style={{ padding:"0 14px 14px" }}>
              <div style={{ fontSize:11.5, color:"#9ca3af", background:"#f9fafb", borderRadius:9, padding:"9px 12px", lineHeight:1.6 }}>
                💡 Amount subject to final HR verification. Any discrepancy — contact <strong style={{ color:ACCENT }}>{ME.hrContact}</strong>.
              </div>
            </div>
          </div>

          {/* HR Contact */}
          <div style={{ background:"#fff", borderRadius:16, border:"1px solid #f1f5f9", padding:"16px 18px", boxShadow:"0 2px 16px rgba(0,0,0,0.05)", animation:"fadeUp 0.42s ease 0.12s both" }}>
            <div style={{ fontSize:13.5, fontWeight:800, color:"#111827", marginBottom:12 }}>🧑‍💼 Your HR Contact</div>
            <div style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 14px", background:"#f9fafb", borderRadius:12, border:"1px solid #f1f5f9", marginBottom:10 }}>
              <div style={{ width:44, height:44, borderRadius:"50%", background:"linear-gradient(135deg,#6366f1,#4f46e5)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, fontWeight:900, color:"#fff", flexShrink:0 }}>DR</div>
              <div>
                <div style={{ fontSize:14, fontWeight:800, color:"#111827" }}>{ME.hrContact}</div>
                <div style={{ fontSize:12, color:"#9ca3af", marginTop:2 }}>HR Manager · Exit & Settlements</div>
                <div style={{ fontSize:12, color:"#6366f1", marginTop:2 }}>{ME.hrEmail}</div>
              </div>
            </div>
            <button onClick={()=>setModal("msg")} style={{ width:"100%", padding:"9px 0", background:`${ACCENT}12`, border:`1px solid ${ACCENT}30`, borderRadius:10, fontSize:13, fontWeight:700, color:ACCENT, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:7 }}>
              <Icon d={IC.msg} size={14} stroke={ACCENT} />Send Message to HR
            </button>
          </div>

          {/* Key Dates */}
          <div style={{ background:"#fff", borderRadius:16, border:"1px solid #f1f5f9", overflow:"hidden", boxShadow:"0 2px 16px rgba(0,0,0,0.05)", animation:"fadeUp 0.42s ease 0.16s both" }}>
            <div style={{ padding:"14px 18px", borderBottom:"1px solid #f1f5f9" }}>
              <div style={{ fontSize:13.5, fontWeight:800, color:"#111827" }}>📅 Key Dates</div>
            </div>
            {[
              { label:"Date Joined",           val:ME.joinDate,         icon:"🟢" },
              { label:"Termination Effective", val:ME.terminationDate,  icon:"🔴" },
              { label:"Last Working Day",       val:ME.lastWorkDay,     icon:"📅" },
              { label:"Severance Period",       val:`${ME.severanceDays} days`, icon:"💼" },
              { label:"Settlement Expected",    val:settleDate,         icon:"💰" },
              { label:"Appeal Deadline",        val:"May 7, 2026",      icon:"⚖️"  },
            ].map((item, i, arr) => (
              <div key={i} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 18px", borderBottom: i<arr.length-1?"1px solid #f9fafb":"none" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ fontSize:14 }}>{item.icon}</span>
                  <span style={{ fontSize:12.5, color:"#6b7280" }}>{item.label}</span>
                </div>
                <span style={{ fontSize:12.5, fontWeight:800, color: item.label==="Appeal Deadline"?"#dc2626":"#374151" }}>{item.val}</span>
              </div>
            ))}
          </div>

          {/* Documents */}
          <div style={{ background:"#fff", borderRadius:16, border:"1px solid #f1f5f9", overflow:"hidden", boxShadow:"0 2px 16px rgba(0,0,0,0.05)", animation:"fadeUp 0.42s ease 0.2s both" }}>
            <button onClick={()=>setExpandDocs(v=>!v)} style={{ width:"100%", padding:"14px 18px", borderBottom: expandDocs?"1px solid #f1f5f9":"none", display:"flex", alignItems:"center", justifyContent:"space-between", background:"none", border:"none", cursor:"pointer" }}>
              <div style={{ fontSize:13.5, fontWeight:800, color:"#111827" }}>📄 My Documents</div>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ fontSize:12, color:"#9ca3af" }}>{DOCS.filter(d=>d.status==="available").length}/{DOCS.length} ready</span>
                <Icon d={expandDocs ? IC.chevU : IC.chevD} size={15} stroke="#9ca3af" />
              </div>
            </button>
            {expandDocs && DOCS.map((doc, i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 18px", borderBottom: i<DOCS.length-1?"1px solid #f9fafb":"none", gap:8 }}>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:12.5, fontWeight:600, color: doc.status==="available"?"#111827":"#9ca3af", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{doc.name}</div>
                  {doc.date && <div style={{ fontSize:11, color:"#9ca3af", marginTop:1 }}>{doc.date}</div>}
                  {doc.note && <div style={{ fontSize:11, color:"#d97706", marginTop:1 }}>{doc.note}</div>}
                </div>
                {doc.status === "available"
                  ? <button style={{ padding:"4px 10px", background:"#f0fdf4", border:"1px solid #bbf7d0", borderRadius:7, fontSize:11.5, fontWeight:700, color:"#16a34a", cursor:"pointer", flexShrink:0 }}>⬇ Get</button>
                  : <span style={{ fontSize:11, fontWeight:700, color:"#d1d5db", flexShrink:0 }}>Pending</span>}
              </div>
            ))}
          </div>

          {/* Tip */}
          <div style={{ background:"#fef2f2", border:"1px solid #fecaca", borderRadius:12, padding:"12px 14px", display:"flex", gap:10, animation:"fadeUp 0.42s ease 0.24s both" }}>
            <span style={{ fontSize:18, flexShrink:0 }}>💡</span>
            <div style={{ fontSize:12.5, color:"#b91c1c", lineHeight:1.6 }}>
              Your settlement will be processed by <strong>{settleDate}</strong>. For any disputes, contact <strong>{ME.hrContact}</strong> or file an appeal within 7 days of termination notice.
            </div>
          </div>
        </div>
      </div>

      {/* ══ MODALS ══════════════════════════════════════════════════════════ */}

      {/* Contact HR */}
      <Modal show={modal==="msg"} onClose={()=>setModal(null)} title="Contact HR">
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div style={{ padding:"10px 14px", background:"#f9fafb", borderRadius:10, display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:34, height:34, borderRadius:"50%", background:"linear-gradient(135deg,#6366f1,#4f46e5)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:800, color:"#fff" }}>DR</div>
            <div>
              <div style={{ fontSize:13.5, fontWeight:700, color:"#111827" }}>{ME.hrContact}</div>
              <div style={{ fontSize:12, color:"#9ca3af" }}>HR Manager · {ME.hrEmail}</div>
            </div>
          </div>
          <div>
            <label style={{ fontSize:12, fontWeight:700, color:"#374151", marginBottom:6, display:"block" }}>Your Message</label>
            <textarea value={msgText} onChange={e=>setMsgText(e.target.value)} rows={4}
              placeholder="e.g. I have a query about my settlement amount or exit clearance…"
              style={{ ...inputStyle, resize:"none", lineHeight:1.6 }} />
          </div>
          <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
            <button onClick={()=>setModal(null)} style={{ padding:"8px 18px", background:"#f9fafb", border:"1px solid #e5e7eb", borderRadius:9, fontSize:13, fontWeight:600, color:"#374151", cursor:"pointer" }}>Cancel</button>
            <button onClick={()=>{ setModal(null); setMsgText(""); alert("Message sent to "+ME.hrContact); }}
              style={{ padding:"8px 20px", background:ACCENT, border:"none", borderRadius:9, fontSize:13, fontWeight:700, color:"#fff", cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}>
              <Icon d={IC.send} size={13} stroke="#fff" />Send
            </button>
          </div>
        </div>
      </Modal>

      {/* Appeal */}
      <Modal show={modal==="appeal"} onClose={()=>setModal(null)} title="⚖️ File an Appeal" color="#b45309">
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div style={{ padding:"10px 14px", background:"#fffbeb", border:"1px solid #fde68a", borderRadius:10, fontSize:12.5, color:"#92400e", lineHeight:1.6 }}>
            You have until <strong>May 7, 2026</strong> to file an appeal. Your appeal will be reviewed by the HR committee within 5 working days.
          </div>
          <div>
            <label style={{ fontSize:12, fontWeight:700, color:"#374151", marginBottom:6, display:"block" }}>Grounds for Appeal</label>
            <select style={{ ...inputStyle }}>
              <option value="">Select reason…</option>
              {["Unfair dismissal","Lack of due process","Discrimination","Insufficient warning","Incorrect reason cited","Other"].map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize:12, fontWeight:700, color:"#374151", marginBottom:6, display:"block" }}>Your Statement</label>
            <textarea value={appealText} onChange={e=>setAppealText(e.target.value)} rows={5}
              placeholder="Explain why you believe the termination decision should be reconsidered…"
              style={{ ...inputStyle, resize:"none", lineHeight:1.6 }} />
          </div>
          <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
            <button onClick={()=>setModal(null)} style={{ padding:"8px 18px", background:"#f9fafb", border:"1px solid #e5e7eb", borderRadius:9, fontSize:13, fontWeight:600, color:"#374151", cursor:"pointer" }}>Cancel</button>
            <button onClick={()=>{ setModal(null); alert("Appeal submitted. HR will respond within 5 working days."); }}
              style={{ padding:"8px 20px", background:"#b45309", border:"none", borderRadius:9, fontSize:13, fontWeight:700, color:"#fff", cursor:"pointer" }}>Submit Appeal</button>
          </div>
        </div>
      </Modal>

      {/* Exit Interview */}
      <Modal show={modal==="exit"} onClose={()=>setModal(null)} title="🎤 Exit Interview">
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div style={{ padding:"10px 14px", background:"#f0fdf4", borderRadius:10, fontSize:12.5, color:"#15803d", lineHeight:1.5 }}>
            Your responses are confidential and used only to improve the workplace. Thank you for your time.
          </div>
          <div>
            <label style={{ fontSize:12, fontWeight:700, color:"#374151", marginBottom:6, display:"block" }}>Primary reason for leaving</label>
            <select value={exitReason} onChange={e=>setExitReason(e.target.value)} style={{ ...inputStyle }}>
              <option value="">Select…</option>
              {["Termination — Performance","Termination — Conduct","Mutual Agreement","Layoff","Restructuring","Other"].map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize:12, fontWeight:700, color:"#374151", marginBottom:6, display:"block" }}>Any feedback for the company?</label>
            <textarea value={exitFeedback} onChange={e=>setExitFeedback(e.target.value)} rows={4}
              placeholder="Suggestions, things done well, things that could be improved…"
              style={{ ...inputStyle, resize:"none", lineHeight:1.6 }} />
          </div>
          <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
            <button onClick={()=>setModal(null)} style={{ padding:"8px 18px", background:"#f9fafb", border:"1px solid #e5e7eb", borderRadius:9, fontSize:13, fontWeight:600, color:"#374151", cursor:"pointer" }}>Cancel</button>
            <button onClick={submitExit} disabled={!exitReason}
              style={{ padding:"8px 20px", background:exitReason?ACCENT:"#e5e7eb", border:"none", borderRadius:9, fontSize:13, fontWeight:700, color:exitReason?"#fff":"#9ca3af", cursor:exitReason?"pointer":"not-allowed" }}>
              Submit Interview
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}