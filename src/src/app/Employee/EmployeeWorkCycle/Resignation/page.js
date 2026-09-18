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
  x:        "M18 6L6 18M6 6l12 12",
  coin:     "M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z M12 6v6M12 16h.01",
  user:     "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  undo:     "M3 7v6h6 M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13",
  shield:   "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
};

const ACCENT = "#f97316";

// ─── My resignation data ───────────────────────────────────────────────────────
const ME = {
  name:         "Priya Ramesh",
  role:         "UI/UX Designer",
  dept:         "Design",
  manager:      "Kavitha S.",
  joinDate:     "Feb 1, 2024",
  resignDate:   "Apr 1, 2026",
  lastWorkDay:  "May 31, 2026",
  noticeDays:   60,
  elapsed:      33,
  status:       "Notice Active",  // "Draft" | "Submitted" | "Accepted" | "Notice Active" | "Completed"
  buyoutEst:    "₹38,500",
};

const STATUS_CFG = {
  "Draft":         { bg:"#f9fafb", c:"#6b7280", dot:"#d1d5db", emoji:"📝", msg:"Your resignation draft is saved. Submit when ready." },
  "Submitted":     { bg:"#eff6ff", c:"#1d4ed8", dot:"#3b82f6", emoji:"📤", msg:"Submitted to HR. Awaiting acceptance." },
  "Accepted":      { bg:"#fdf4ff", c:"#7e22ce", dot:"#a855f7", emoji:"✅", msg:"Resignation accepted. Notice period begins." },
  "Notice Active": { bg:"#fff7ed", c:"#c2410c", dot:"#f97316", emoji:"⏳", msg:"You are currently serving your notice period." },
  "Completed":     { bg:"#f0fdf4", c:"#15803d", dot:"#22c55e", emoji:"🎓", msg:"Your exit is complete. All the best ahead!" },
};

// Exit formalities
const FORMALITIES = [
  { id:1, cat:"You",     label:"Handover Document Upload",    done:true,  dueDate:"May 20, 2026", note:"Upload to HR portal" },
  { id:2, cat:"You",     label:"Team Knowledge Transfer",     done:true,  dueDate:"May 25, 2026", note:"Session with team lead" },
  { id:3, cat:"You",     label:"Return ID Card & Assets",     done:false, dueDate:"May 31, 2026", note:"Return to admin desk" },
  { id:4, cat:"You",     label:"Exit Interview",              done:false, dueDate:"May 28, 2026", note:"Schedule with HR", special:true },
  { id:5, cat:"Company", label:"Access Revocation",           done:false, note:"By IT team on last day" },
  { id:6, cat:"Company", label:"Full & Final Settlement",     done:false, note:"Expected by Jun 15" },
  { id:7, cat:"Company", label:"Experience Letter",           done:false, note:"Expected by Jun 10" },
  { id:8, cat:"Company", label:"Relieving Letter",            done:false, note:"Expected by Jun 10" },
];

// Timeline
const TIMELINE = [
  { date:"Apr 1, 2026",  label:"Resignation Submitted",        done:true,  icon:"✅" },
  { date:"Apr 2, 2026",  label:"HR Acceptance Received",       done:true,  icon:"✅" },
  { date:"Apr 1, 2026",  label:"Notice Period Begins",         done:true,  icon:"✅" },
  { date:"May 28, 2026", label:"Exit Interview",               done:false, icon:"🔵" },
  { date:"May 31, 2026", label:"Last Working Day",             done:false, icon:"⬜" },
  { date:"Jun 15, 2026", label:"Full & Final Settlement",      done:false, icon:"⬜" },
];

// F&F Settlement
const SETTLEMENT = [
  { label:"Last Month Salary",      val:"₹75,000",  type:"base"   },
  { label:"Leave Encashment (12d)", val:"+₹12,500", type:"credit" },
  { label:"Reimbursements",         val:"+₹5,000",  type:"credit" },
  { label:"Deductions",             val:"−₹2,000",  type:"debit"  },
];

// Documents
const DOCS = [
  { name:"Resignation Letter",            status:"available", date:"Apr 1, 2026"  },
  { name:"Resignation Acceptance Letter", status:"available", date:"Apr 2, 2026"  },
  { name:"Exit Interview Form",           status:"pending",   note:"Pending completion" },
  { name:"Relieving Letter",              status:"pending",   note:"Expected Jun 10" },
  { name:"Experience Letter",             status:"pending",   note:"Expected Jun 10" },
  { name:"F&F Settlement Slip",           status:"pending",   note:"Expected Jun 15" },
];

// ─── Modal ─────────────────────────────────────────────────────────────────────
function Modal({ show, onClose, title, color = ACCENT, children }) {
  if (!show) return null;
  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, zIndex:600, background:"rgba(15,23,42,0.6)", backdropFilter:"blur(8px)", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div onClick={e => e.stopPropagation()} style={{ background:"#fff", borderRadius:20, width:"100%", maxWidth:460, boxShadow:"0 32px 80px rgba(0,0,0,0.22)", animation:"popIn 0.22s cubic-bezier(0.34,1.56,0.64,1) both", overflow:"hidden" }}>
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
export default function MyResignation() {
  const [formalities, setFormalities] = useState(FORMALITIES);
  const [modal,       setModal]       = useState(null);
  const [msgText,     setMsgText]     = useState("");
  const [earlyDate,   setEarlyDate]   = useState("");
  const [earlyReason, setEarlyReason] = useState("");
  const [cancelReason,setCancelReason]= useState("");
  const [exitReason,  setExitReason]  = useState("");
  const [exitFeedback,setExitFeedback]= useState("");
  const [expandDocs,  setExpandDocs]  = useState(false);

  const cfg        = STATUS_CFG[ME.status] || STATUS_CFG["Notice Active"];
  const remaining  = ME.noticeDays - ME.elapsed;
  const pct        = Math.min(100, Math.round((ME.elapsed / ME.noticeDays) * 100));
  const myForms    = formalities.filter(f => f.cat === "You");
  const myDone     = myForms.filter(f => f.done).length;
  const coForms    = formalities.filter(f => f.cat === "Company");

  const markDone = (id) => setFormalities(prev => prev.map(f => f.id === id ? { ...f, done:true } : f));
  const submitExit = () => { markDone(4); setModal(null); };

  const netPayable = "₹90,500";
  const settleDate = "Jun 15, 2026";

  return (
    <div style={{ fontFamily:"'Nunito','DM Sans',sans-serif", display:"flex", flexDirection:"column", gap:16 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }
        @keyframes popIn  { from{opacity:0;transform:scale(0.93)} to{opacity:1;transform:scale(1)} }
        @keyframes pulse  { 0%,100%{opacity:0.6} 50%{opacity:1} }
      `}</style>

      {/* ── HERO ───────────────────────────────────────────────────────────── */}
      <div style={{ borderRadius:20, overflow:"hidden", background:"linear-gradient(135deg,#1e293b 0%,#0f172a 100%)", boxShadow:"0 8px 40px rgba(0,0,0,0.18)", animation:"fadeUp 0.4s ease both" }}>

        {/* Top */}
        <div style={{ padding:"24px 28px 18px", display:"flex", alignItems:"flex-start", justifyContent:"space-between", flexWrap:"wrap", gap:16 }}>
          <div>
            <div style={{ fontSize:11, fontWeight:800, letterSpacing:"0.12em", color:"rgba(255,255,255,0.35)", textTransform:"uppercase", marginBottom:6 }}>My Resignation</div>
            <div style={{ fontSize:22, fontWeight:900, color:"#fff", letterSpacing:"-0.5px" }}>Hello, {ME.name.split(" ")[0]} 👋</div>
            <div style={{ fontSize:13, color:"rgba(255,255,255,0.45)", marginTop:4 }}>
              {ME.role} · {ME.dept} · Manager: <span style={{ color:"rgba(255,255,255,0.65)", fontWeight:700 }}>{ME.manager}</span>
            </div>
            {/* Status badge */}
            <div style={{ marginTop:14, display:"inline-flex", alignItems:"center", gap:8, padding:"7px 14px", borderRadius:99, background:cfg.bg, border:`1.5px solid ${cfg.dot}55` }}>
              <span style={{ width:8, height:8, borderRadius:"50%", background:cfg.dot, animation:"pulse 2s ease infinite" }} />
              <span style={{ fontSize:13, fontWeight:800, color:cfg.c }}>{cfg.emoji} {ME.status}</span>
              <span style={{ fontSize:12, color:cfg.c, opacity:0.75 }}>· {cfg.msg}</span>
            </div>
          </div>

          {/* Days countdown */}
          <div style={{ textAlign:"right" }}>
            <div style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.3)", letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:4 }}>Days Remaining</div>
            <div style={{ fontSize:52, fontWeight:900, color:ACCENT, lineHeight:1, letterSpacing:"-2px" }}>{remaining}</div>
            <div style={{ fontSize:12, color:"rgba(255,255,255,0.35)", marginTop:2 }}>of {ME.noticeDays}-day notice</div>
            <div style={{ fontSize:11.5, color:"rgba(255,255,255,0.25)", marginTop:1 }}>Last day: {ME.lastWorkDay}</div>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ padding:"0 28px 16px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:"rgba(255,255,255,0.3)", marginBottom:6, fontWeight:700 }}>
            <span>{ME.resignDate}</span>
            <span>Day {ME.elapsed} of {ME.noticeDays} · {pct}% served</span>
            <span>{ME.lastWorkDay}</span>
          </div>
          <div style={{ height:8, background:"rgba(255,255,255,0.08)", borderRadius:99, overflow:"hidden" }}>
            <div style={{ height:"100%", width:`${pct}%`, background:`linear-gradient(90deg,${ACCENT},#fb923c)`, borderRadius:99 }} />
          </div>
        </div>

        {/* Strip: stats + actions */}
        <div style={{ padding:"12px 28px 16px", borderTop:"1px solid rgba(255,255,255,0.06)", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:10 }}>
          <div style={{ display:"flex", alignItems:"center", gap:24 }}>
            {[
              { label:"Tasks Done",     val:`${myDone}/${myForms.length}`, color:"#fb923c"              },
              { label:"Net Payable",    val:netPayable,                     color:"#22c55e"              },
              { label:"Settlement",     val:settleDate,                     color:"rgba(255,255,255,0.7)" },
              { label:"Joined",         val:ME.joinDate,                    color:"rgba(255,255,255,0.5)" },
            ].map((s, i) => (
              <div key={i}>
                <div style={{ fontSize:10.5, fontWeight:700, color:"rgba(255,255,255,0.3)", textTransform:"uppercase", letterSpacing:"0.07em" }}>{s.label}</div>
                <div style={{ fontSize:16, fontWeight:900, color:s.color, marginTop:2 }}>{s.val}</div>
              </div>
            ))}
          </div>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            <button onClick={()=>setModal("early")} style={{ padding:"8px 14px", borderRadius:10, background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.12)", cursor:"pointer", fontSize:12, fontWeight:700, color:"rgba(255,255,255,0.75)" }}>
              ⚡ Early Release
            </button>
            <button onClick={()=>setModal("buyout")} style={{ padding:"8px 14px", borderRadius:10, background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.12)", cursor:"pointer", fontSize:12, fontWeight:700, color:"rgba(255,255,255,0.75)" }}>
              💸 Buyout
            </button>
            <button onClick={()=>setModal("cancel")} style={{ padding:"8px 14px", borderRadius:10, background:"rgba(239,68,68,0.15)", border:"1px solid rgba(239,68,68,0.3)", cursor:"pointer", fontSize:12, fontWeight:700, color:"#f87171" }}>
              ↩ Cancel Resignation
            </button>
            <button onClick={()=>setModal("msg")} style={{ padding:"8px 16px", borderRadius:10, background:ACCENT, border:"none", cursor:"pointer", fontSize:12, fontWeight:700, color:"#fff", display:"flex", alignItems:"center", gap:6 }}>
              <Icon d={IC.msg} size={13} stroke="#fff" />Message Manager
            </button>
          </div>
        </div>
      </div>

      {/* ── 2-COL GRID ─────────────────────────────────────────────────────── */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 330px", gap:16, alignItems:"start" }}>

        {/* LEFT ─────────────────────────────────────────────────────────────── */}
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

          {/* Exit Formalities */}
          <div style={{ background:"#fff", borderRadius:16, border:"1px solid #f1f5f9", overflow:"hidden", boxShadow:"0 2px 16px rgba(0,0,0,0.05)", animation:"fadeUp 0.42s ease 0.08s both" }}>
            <div style={{ padding:"14px 20px", borderBottom:"1px solid #f1f5f9", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div>
                <div style={{ fontSize:14, fontWeight:800, color:"#111827" }}>☑️ Exit Formalities</div>
                <div style={{ fontSize:12, color:"#9ca3af", marginTop:2 }}>Your tasks to complete before last day</div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <div style={{ width:64, height:6, background:"#f1f5f9", borderRadius:99, overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${Math.round(myDone/myForms.length*100)}%`, background:`linear-gradient(90deg,${ACCENT},#fb923c)`, borderRadius:99 }} />
                </div>
                <span style={{ fontSize:13, fontWeight:900, color:ACCENT }}>{Math.round(myDone/myForms.length*100)}%</span>
              </div>
            </div>

            {/* MY tasks */}
            <div style={{ padding:"6px 0 2px" }}>
              <div style={{ padding:"8px 20px", fontSize:11, fontWeight:800, color:ACCENT, textTransform:"uppercase", letterSpacing:"0.08em" }}>Your Actions ({myDone}/{myForms.length})</div>
              {myForms.map((f, i) => (
                <div key={f.id} style={{
                  display:"flex", alignItems:"center", gap:13, padding:"13px 20px",
                  borderBottom:"1px solid #f9fafb",
                  background: f.done ? "#f0fdf408" : "#fff",
                  animation:`fadeUp 0.38s ease ${0.1+i*0.07}s both`,
                }}>
                  <div style={{ width:30, height:30, borderRadius:9, flexShrink:0, background: f.done?"#dcfce7":"#fafafa", border:`1.5px solid ${f.done?"#86efac":"#e5e7eb"}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    {f.done
                      ? <Icon d={IC.check} size={14} stroke="#16a34a" sw={2.5} />
                      : <Icon d={IC.clock} size={13} stroke="#d1d5db" />}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13.5, fontWeight:700, color: f.done?"#9ca3af":"#111827", textDecoration:f.done?"line-through":"none" }}>{f.label}</div>
                    <div style={{ fontSize:11.5, color:"#9ca3af", marginTop:2 }}>Due: {f.dueDate} · {f.note}</div>
                  </div>
                  {f.done
                    ? <span style={{ fontSize:11.5, fontWeight:700, color:"#16a34a", background:"#f0fdf4", padding:"2px 9px", borderRadius:99, flexShrink:0 }}>✓ Done</span>
                    : <button
                        onClick={() => f.special ? setModal("exit") : markDone(f.id)}
                        style={{ padding:"5px 14px", borderRadius:8, border:"none", cursor:"pointer", background:`${ACCENT}14`, color:ACCENT, fontSize:12.5, fontWeight:700, flexShrink:0, transition:"all 0.15s" }}
                        onMouseEnter={e=>{ e.currentTarget.style.background=ACCENT; e.currentTarget.style.color="#fff"; }}
                        onMouseLeave={e=>{ e.currentTarget.style.background=`${ACCENT}14`; e.currentTarget.style.color=ACCENT; }}>
                        {f.special ? "Fill Form" : "Mark Done"}
                      </button>}
                </div>
              ))}
            </div>

            {/* Company tasks */}
            <div style={{ padding:"6px 0 10px" }}>
              <div style={{ padding:"8px 20px", fontSize:11, fontWeight:800, color:"#9ca3af", textTransform:"uppercase", letterSpacing:"0.08em" }}>Pending from Company</div>
              {coForms.map((f, i) => (
                <div key={f.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 20px", borderBottom: i<coForms.length-1?"1px solid #f9fafb":"none" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                    <span style={{ width:6, height:6, borderRadius:"50%", background:"#e5e7eb", flexShrink:0 }} />
                    <div>
                      <div style={{ fontSize:13, fontWeight:600, color:"#6b7280" }}>{f.label}</div>
                      <div style={{ fontSize:11.5, color:"#9ca3af", marginTop:1 }}>{f.note}</div>
                    </div>
                  </div>
                  <span style={{ fontSize:11.5, fontWeight:700, color:"#d97706", background:"#fefce8", padding:"2px 8px", borderRadius:99, flexShrink:0 }}>Awaiting</span>
                </div>
              ))}
            </div>
          </div>

          {/* Exit Timeline */}
          <div style={{ background:"#fff", borderRadius:16, border:"1px solid #f1f5f9", overflow:"hidden", boxShadow:"0 2px 16px rgba(0,0,0,0.05)", animation:"fadeUp 0.42s ease 0.14s both" }}>
            <div style={{ padding:"14px 20px", borderBottom:"1px solid #f1f5f9" }}>
              <div style={{ fontSize:14, fontWeight:800, color:"#111827" }}>📍 Exit Timeline</div>
              <div style={{ fontSize:12, color:"#9ca3af", marginTop:2 }}>Your resignation journey step by step</div>
            </div>
            <div style={{ padding:"18px 20px 10px", position:"relative" }}>
              <div style={{ position:"absolute", left:38, top:18, bottom:18, width:2, background:"#f1f5f9", borderRadius:1 }} />
              {TIMELINE.map((t, i) => {
                const isCurrent = !t.done && TIMELINE.slice(0, i).every(x => x.done);
                return (
                  <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:14, paddingBottom: i < TIMELINE.length-1 ? 18 : 8, position:"relative", animation:`fadeUp 0.38s ease ${0.1+i*0.07}s both` }}>
                    <div style={{ width:28, height:28, borderRadius:"50%", background:"#fff", border:`2px solid ${t.done?"#86efac":isCurrent?"#93c5fd":"#e5e7eb"}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, flexShrink:0, zIndex:1 }}>
                      {t.icon}
                    </div>
                    <div style={{ paddingTop:4, flex:1 }}>
                      <div style={{ fontSize:13.5, fontWeight:700, color: t.done?"#111827":"#9ca3af" }}>{t.label}</div>
                      <div style={{ fontSize:12, color:"#9ca3af", marginTop:2 }}>{t.date}</div>
                    </div>
                    {isCurrent && (
                      <span style={{ marginTop:4, fontSize:11.5, fontWeight:700, padding:"2px 10px", borderRadius:99, background:"#eff6ff", color:"#1d4ed8", flexShrink:0 }}>Next</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT ─────────────────────────────────────────────────────────────── */}
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

          {/* F&F Settlement */}
          <div style={{ background:"#fff", borderRadius:16, border:"1px solid #f1f5f9", overflow:"hidden", boxShadow:"0 2px 16px rgba(0,0,0,0.05)", animation:"fadeUp 0.42s ease 0.06s both" }}>
            <div style={{ padding:"14px 18px", borderBottom:"1px solid #f1f5f9" }}>
              <div style={{ fontSize:13.5, fontWeight:800, color:"#111827" }}>💰 Full & Final Settlement</div>
              <div style={{ fontSize:12, color:"#9ca3af", marginTop:2 }}>Expected by {settleDate}</div>
            </div>
            <div style={{ padding:"4px 0" }}>
              {SETTLEMENT.map((s, i) => (
                <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"11px 18px", borderBottom: i < SETTLEMENT.length-1?"1px solid #f9fafb":"none" }}>
                  <span style={{ fontSize:12.5, color:"#6b7280" }}>{s.label}</span>
                  <span style={{ fontSize:14, fontWeight:900, color: s.type==="credit"?"#16a34a":s.type==="debit"?"#dc2626":"#111827" }}>{s.val}</span>
                </div>
              ))}
            </div>
            <div style={{ margin:"0 14px 14px", padding:"14px 16px", borderRadius:12, background:`linear-gradient(135deg,${ACCENT}18,${ACCENT}08)`, border:`1.5px solid ${ACCENT}33`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ fontSize:14, fontWeight:800, color:"#111827" }}>Net Payable</span>
              <span style={{ fontSize:24, fontWeight:900, color:ACCENT, letterSpacing:"-0.5px" }}>{netPayable}</span>
            </div>
          </div>

          {/* Key Dates */}
          <div style={{ background:"#fff", borderRadius:16, border:"1px solid #f1f5f9", overflow:"hidden", boxShadow:"0 2px 16px rgba(0,0,0,0.05)", animation:"fadeUp 0.42s ease 0.1s both" }}>
            <div style={{ padding:"14px 18px", borderBottom:"1px solid #f1f5f9" }}>
              <div style={{ fontSize:13.5, fontWeight:800, color:"#111827" }}>📅 Key Dates</div>
            </div>
            {[
              { label:"Date Joined",          val:ME.joinDate,      icon:"🟢" },
              { label:"Resignation Date",     val:ME.resignDate,    icon:"📝" },
              { label:"Notice Period",        val:`${ME.noticeDays} days`, icon:"⏳" },
              { label:"Last Working Day",     val:ME.lastWorkDay,   icon:"🔴" },
              { label:"Settlement Expected",  val:settleDate,       icon:"💰" },
            ].map((item, i, arr) => (
              <div key={i} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 18px", borderBottom: i<arr.length-1?"1px solid #f9fafb":"none" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ fontSize:14 }}>{item.icon}</span>
                  <span style={{ fontSize:12.5, color:"#6b7280" }}>{item.label}</span>
                </div>
                <span style={{ fontSize:12.5, fontWeight:800, color:"#374151" }}>{item.val}</span>
              </div>
            ))}
          </div>

          {/* Documents (collapsible) */}
          <div style={{ background:"#fff", borderRadius:16, border:"1px solid #f1f5f9", overflow:"hidden", boxShadow:"0 2px 16px rgba(0,0,0,0.05)", animation:"fadeUp 0.42s ease 0.16s both" }}>
            <button onClick={()=>setExpandDocs(v=>!v)} style={{ width:"100%", padding:"14px 18px", borderBottom: expandDocs?"1px solid #f1f5f9":"none", display:"flex", alignItems:"center", justifyContent:"space-between", background:"none", border:"none", cursor:"pointer" }}>
              <div style={{ fontSize:13.5, fontWeight:800, color:"#111827" }}>📄 My Documents</div>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ fontSize:12, color:"#9ca3af" }}>{DOCS.filter(d=>d.status==="available").length}/{DOCS.length} available</span>
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

          {/* Info tip */}
          <div style={{ background:"#fff7ed", border:"1px solid #fed7aa", borderRadius:12, padding:"12px 14px", display:"flex", gap:10, animation:"fadeUp 0.42s ease 0.22s both" }}>
            <span style={{ fontSize:18, flexShrink:0 }}>💡</span>
            <div style={{ fontSize:12.5, color:"#c2410c", lineHeight:1.6 }}>
              Complete all your exit tasks before <strong>{ME.lastWorkDay}</strong>. Reach out to <strong>{ME.manager}</strong> if you need help with knowledge transfer or scheduling the exit interview.
            </div>
          </div>
        </div>
      </div>

      {/* ══ MODALS ══════════════════════════════════════════════════════════ */}

      {/* Message Manager */}
      <Modal show={modal==="msg"} onClose={()=>setModal(null)} title="Message Manager">
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div style={{ padding:"10px 14px", background:"#f9fafb", borderRadius:10, display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:34, height:34, borderRadius:"50%", background:"linear-gradient(135deg,#6366f1,#4f46e5)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:800, color:"#fff" }}>KS</div>
            <div>
              <div style={{ fontSize:13.5, fontWeight:700, color:"#111827" }}>{ME.manager}</div>
              <div style={{ fontSize:12, color:"#9ca3af" }}>Your Reporting Manager</div>
            </div>
          </div>
          <div>
            <label style={{ fontSize:12, fontWeight:700, color:"#374151", marginBottom:6, display:"block" }}>Your Message</label>
            <textarea value={msgText} onChange={e=>setMsgText(e.target.value)} rows={4}
              placeholder="e.g. I'd like to schedule the knowledge transfer session…"
              style={{ ...inputStyle, resize:"none", lineHeight:1.6 }} />
          </div>
          <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
            <button onClick={()=>setModal(null)} style={{ padding:"8px 18px", background:"#f9fafb", border:"1px solid #e5e7eb", borderRadius:9, fontSize:13, fontWeight:600, color:"#374151", cursor:"pointer" }}>Cancel</button>
            <button onClick={()=>{ setModal(null); setMsgText(""); alert("Message sent to "+ME.manager); }}
              style={{ padding:"8px 20px", background:ACCENT, border:"none", borderRadius:9, fontSize:13, fontWeight:700, color:"#fff", cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}>
              <Icon d={IC.send} size={13} stroke="#fff" />Send
            </button>
          </div>
        </div>
      </Modal>

      {/* Early Release */}
      <Modal show={modal==="early"} onClose={()=>setModal(null)} title="⚡ Request Early Release">
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div style={{ padding:"10px 14px", background:"#fff7ed", borderRadius:10, fontSize:12.5, color:"#c2410c", lineHeight:1.6 }}>
            Requesting early release will ask your manager and HR to approve an earlier last working day than <strong>{ME.lastWorkDay}</strong>.
          </div>
          <div>
            <label style={{ fontSize:12, fontWeight:700, color:"#374151", marginBottom:6, display:"block" }}>Proposed Last Working Day</label>
            <input type="date" value={earlyDate} onChange={e=>setEarlyDate(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize:12, fontWeight:700, color:"#374151", marginBottom:6, display:"block" }}>Reason</label>
            <textarea value={earlyReason} onChange={e=>setEarlyReason(e.target.value)} rows={3} placeholder="Briefly explain…" style={{ ...inputStyle, resize:"none", lineHeight:1.6 }} />
          </div>
          <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
            <button onClick={()=>setModal(null)} style={{ padding:"8px 18px", background:"#f9fafb", border:"1px solid #e5e7eb", borderRadius:9, fontSize:13, fontWeight:600, color:"#374151", cursor:"pointer" }}>Cancel</button>
            <button onClick={()=>{ setModal(null); alert("Early release request submitted to HR"); }} style={{ padding:"8px 20px", background:ACCENT, border:"none", borderRadius:9, fontSize:13, fontWeight:700, color:"#fff", cursor:"pointer" }}>Submit Request</button>
          </div>
        </div>
      </Modal>

      {/* Buyout */}
      <Modal show={modal==="buyout"} onClose={()=>setModal(null)} title="💸 Notice Buyout" color="#7c3aed">
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div style={{ borderRadius:14, background:"#f5f3ff", border:"1.5px solid #ddd6fe", padding:"18px", textAlign:"center" }}>
            <div style={{ fontSize:11, fontWeight:800, color:"#7c3aed", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:6 }}>Estimated Buyout Amount</div>
            <div style={{ fontSize:38, fontWeight:900, color:"#7c3aed", letterSpacing:"-1px" }}>{ME.buyoutEst}</div>
            <div style={{ fontSize:12, color:"#9ca3af", marginTop:4 }}>For {remaining} remaining days</div>
          </div>
          <div style={{ fontSize:12.5, color:"#6b7280", lineHeight:1.7, background:"#fafafa", borderRadius:10, padding:"12px 14px" }}>
            Paying the buyout amount lets you exit before your notice period ends. HR will confirm the final amount and release date.
          </div>
          <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
            <button onClick={()=>setModal(null)} style={{ padding:"8px 18px", background:"#f9fafb", border:"1px solid #e5e7eb", borderRadius:9, fontSize:13, fontWeight:600, color:"#374151", cursor:"pointer" }}>Cancel</button>
            <button onClick={()=>{ setModal(null); alert("Buyout request submitted"); }} style={{ padding:"8px 20px", background:"#7c3aed", border:"none", borderRadius:9, fontSize:13, fontWeight:700, color:"#fff", cursor:"pointer" }}>Request Buyout</button>
          </div>
        </div>
      </Modal>

      {/* Cancel Resignation */}
      <Modal show={modal==="cancel"} onClose={()=>setModal(null)} title="↩ Cancel Resignation" color="#dc2626">
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div style={{ background:"#fef2f2", border:"1px solid #fecaca", borderRadius:10, padding:"12px 14px", fontSize:12.5, color:"#991b1b", lineHeight:1.6 }}>
            ⚠️ This will withdraw your resignation and notify your manager and HR. You have <strong>7 days</strong> from the resignation date to reverse this decision.
          </div>
          <div>
            <label style={{ fontSize:12, fontWeight:700, color:"#374151", marginBottom:6, display:"block" }}>Reason (optional)</label>
            <textarea value={cancelReason} onChange={e=>setCancelReason(e.target.value)} rows={2} placeholder="Why are you reconsidering?" style={{ ...inputStyle, resize:"none", lineHeight:1.6 }} />
          </div>
          <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
            <button onClick={()=>setModal(null)} style={{ padding:"8px 18px", background:"#f9fafb", border:"1px solid #e5e7eb", borderRadius:9, fontSize:13, fontWeight:600, color:"#374151", cursor:"pointer" }}>Keep Resignation</button>
            <button onClick={()=>{ setModal(null); alert("Cancellation submitted to HR"); }} style={{ padding:"8px 20px", background:"#dc2626", border:"none", borderRadius:9, fontSize:13, fontWeight:700, color:"#fff", cursor:"pointer" }}>Confirm Cancel</button>
          </div>
        </div>
      </Modal>

      {/* Exit Interview */}
      <Modal show={modal==="exit"} onClose={()=>setModal(null)} title="🎤 Exit Interview">
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div style={{ padding:"10px 14px", background:"#f0fdf4", borderRadius:10, fontSize:12.5, color:"#15803d", lineHeight:1.5 }}>
            Your responses are confidential and used to improve the workplace. Please be honest.
          </div>
          <div>
            <label style={{ fontSize:12, fontWeight:700, color:"#374151", marginBottom:6, display:"block" }}>Primary reason for leaving</label>
            <select value={exitReason} onChange={e=>setExitReason(e.target.value)} style={{ ...inputStyle }}>
              <option value="">Select a reason…</option>
              {["Better opportunity","Higher salary","Work-life balance","Career change","Relocation","Personal reasons","Management issues"].map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize:12, fontWeight:700, color:"#374151", marginBottom:6, display:"block" }}>Additional feedback</label>
            <textarea value={exitFeedback} onChange={e=>setExitFeedback(e.target.value)} rows={4}
              placeholder="What did you like? What could be better? Any suggestions for the team…"
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