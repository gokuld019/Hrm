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
  star:     "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  calendar: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z",
  alert:    "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z M12 9v4M12 17h.01",
  award:    "M12 15a7 7 0 1 0 0-14 7 7 0 0 0 0 14z M8.21 13.89L7 23l5-3 5 3-1.21-9.12",
  target:   "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12z M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
  info:     "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 8h.01M12 12v4",
  msg:      "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
  send:     "M22 2L11 13 M22 2L15 22l-4-9-9-4 22-7z",
  x:        "M18 6L6 18M6 6l12 12",
  chevD:    "M6 9l6 6 6-6",
  chevU:    "M18 15l-6-6-6 6",
  user:     "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
};

const ACCENT = "#f97316";

// ─── MY probation data (logged-in employee) ────────────────────────────────────
const ME = {
  name:       "Priya Ramesh",
  role:       "UI/UX Designer",
  dept:       "Design",
  manager:    "Kavitha S.",
  startDate:  "Feb 1, 2026",
  endDate:    "Apr 30, 2026",
  totalDays:  90,
  elapsed:    62,
  status:     "On Track",   // "On Track" | "At Risk" | "Extended" | "Completed"
  score:      82,
};

const MY_REVIEWS = [
  {
    period:  "30-Day Review",
    date:    "Mar 3, 2026",
    done:    true,
    rating:  4,
    feedback:"Strong design skills. Good team integration. Keep it up!",
    reviewer:"Kavitha S.",
  },
  {
    period:  "60-Day Review",
    date:    "Apr 2, 2026",
    done:    true,
    rating:  4,
    feedback:"Delivered UI revamp ahead of schedule. Communication is excellent.",
    reviewer:"Kavitha S.",
  },
  {
    period:  "90-Day Review",
    date:    "Apr 30, 2026",
    done:    false,
    rating:  0,
    feedback:"",
    reviewer:"",
  },
];

const MY_GOALS = [
  { id:1, label:"Complete onboarding & HR modules",   done:true,  dueDate:"Feb 10, 2026" },
  { id:2, label:"Deliver first design sprint",        done:true,  dueDate:"Mar 1, 2026"  },
  { id:3, label:"Peer feedback session",              done:true,  dueDate:"Mar 20, 2026" },
  { id:4, label:"Final performance presentation",     done:false, dueDate:"Apr 28, 2026" },
];

const MY_DOCS = [
  { name:"Offer Letter",            status:"available" },
  { name:"Probation Agreement",     status:"available" },
  { name:"30-Day Review Form",      status:"available" },
  { name:"60-Day Review Form",      status:"available" },
  { name:"Confirmation Letter",     status:"pending",  note:"After 90-day review" },
];

// ─── Status config ─────────────────────────────────────────────────────────────
const STATUS_CFG = {
  "On Track":  { bg:"#f0fdf4", c:"#16a34a", dot:"#22c55e", label:"You're on track! Keep up the great work." },
  "At Risk":   { bg:"#fef2f2", c:"#dc2626", dot:"#ef4444", label:"Action needed. Review feedback & improve." },
  "Extended":  { bg:"#fffbeb", c:"#d97706", dot:"#f59e0b", label:"Probation extended. Work with your manager." },
  "Completed": { bg:"#eff6ff", c:"#1d4ed8", dot:"#3b82f6", label:"Congratulations! You're now a confirmed employee." },
};

// ─── Modal ─────────────────────────────────────────────────────────────────────
function Modal({ show, onClose, title, children }) {
  if (!show) return null;
  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, zIndex:600, background:"rgba(15,23,42,0.6)", backdropFilter:"blur(8px)", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:"#fff", borderRadius:20, width:"100%", maxWidth:460, boxShadow:"0 32px 80px rgba(0,0,0,0.22)", animation:"popIn 0.22s cubic-bezier(0.34,1.56,0.64,1) both", overflow:"hidden" }}>
        <div style={{ background:`linear-gradient(135deg,${ACCENT},#fb923c)`, padding:"18px 22px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ fontSize:16, fontWeight:900, color:"#fff" }}>{title}</div>
          <button onClick={onClose} style={{ width:28, height:28, borderRadius:8, background:"rgba(255,255,255,0.2)", border:"none", cursor:"pointer", color:"#fff", fontSize:16, display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
        </div>
        <div style={{ padding:"20px 22px 22px" }}>{children}</div>
      </div>
    </div>
  );
}

// ─── Stars display ─────────────────────────────────────────────────────────────
const Stars = ({ rating, size=16 }) => (
  <div style={{ display:"flex", gap:2 }}>
    {[1,2,3,4,5].map(n => (
      <span key={n} style={{ fontSize:size, color: n <= rating ? "#f59e0b" : "#e5e7eb" }}>★</span>
    ))}
  </div>
);

// ─── Main Component ────────────────────────────────────────────────────────────
export default function MyProbationStatus() {
  const [showMsg,    setShowMsg]    = useState(false);
  const [msgText,    setMsgText]    = useState("");
  const [expandGoals,setExpandGoals]= useState(true);
  const [expandDocs, setExpandDocs] = useState(false);

  const pct    = Math.min(100, Math.round((ME.elapsed / ME.totalDays) * 100));
  const cfg    = STATUS_CFG[ME.status] || STATUS_CFG["On Track"];
  const doneGoals = MY_GOALS.filter(g => g.done).length;
  const scoreColor = ME.score >= 75 ? "#16a34a" : ME.score >= 60 ? "#d97706" : "#dc2626";
  const daysLeft   = ME.totalDays - ME.elapsed;

  return (
    <div style={{ fontFamily:"'Nunito','DM Sans',sans-serif", display:"flex", flexDirection:"column", gap:16 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }
        @keyframes popIn  { from{opacity:0;transform:scale(0.93)} to{opacity:1;transform:scale(1)} }
        @keyframes glow   { 0%,100%{opacity:0.7} 50%{opacity:1} }
      `}</style>

      {/* ── HERO ───────────────────────────────────────────────────────────── */}
      <div style={{
        borderRadius:20, overflow:"hidden",
        background:"linear-gradient(135deg,#1e293b 0%,#0f172a 100%)",
        boxShadow:"0 8px 40px rgba(0,0,0,0.18)",
        animation:"fadeUp 0.4s ease both",
      }}>
        {/* Top */}
        <div style={{ padding:"24px 28px 20px", display:"flex", alignItems:"flex-start", justifyContent:"space-between", flexWrap:"wrap", gap:16 }}>
          <div>
            <div style={{ fontSize:11, fontWeight:800, letterSpacing:"0.12em", color:"rgba(255,255,255,0.35)", textTransform:"uppercase", marginBottom:6 }}>My Probation Period</div>
            <div style={{ fontSize:22, fontWeight:900, color:"#fff", letterSpacing:"-0.5px" }}>Hello, {ME.name.split(" ")[0]} 👋</div>
            <div style={{ fontSize:13, color:"rgba(255,255,255,0.45)", marginTop:4 }}>
              {ME.role} · {ME.dept} · Manager: <span style={{ color:"rgba(255,255,255,0.65)", fontWeight:700 }}>{ME.manager}</span>
            </div>

            {/* Status badge */}
            <div style={{
              marginTop:14, display:"inline-flex", alignItems:"center", gap:8,
              padding:"7px 14px", borderRadius:99,
              background:cfg.bg, border:`1.5px solid ${cfg.dot}44`,
            }}>
              <span style={{ width:8, height:8, borderRadius:"50%", background:cfg.dot, animation:"glow 1.8s ease infinite" }} />
              <span style={{ fontSize:13, fontWeight:800, color:cfg.c }}>{ME.status}</span>
              <span style={{ fontSize:12, color:cfg.c, opacity:0.7 }}>· {cfg.label}</span>
            </div>
          </div>

          {/* Days counter */}
          <div style={{ textAlign:"right" }}>
            {ME.status !== "Completed" ? (
              <>
                <div style={{ fontSize:54, fontWeight:900, color:ACCENT, lineHeight:1, letterSpacing:"-2px" }}>{daysLeft}</div>
                <div style={{ fontSize:12, color:"rgba(255,255,255,0.35)", marginTop:2 }}>days remaining</div>
                <div style={{ fontSize:11, color:"rgba(255,255,255,0.25)", marginTop:1 }}>Ends {ME.endDate}</div>
              </>
            ) : (
              <div style={{ fontSize:40 }}>🎓</div>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ padding:"0 28px 20px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:"rgba(255,255,255,0.3)", marginBottom:6, fontWeight:700 }}>
            <span>{ME.startDate}</span>
            <span>{pct}% complete · Day {ME.elapsed} of {ME.totalDays}</span>
            <span>{ME.endDate}</span>
          </div>
          <div style={{ height:8, background:"rgba(255,255,255,0.08)", borderRadius:99, overflow:"hidden" }}>
            <div style={{ height:"100%", width:`${pct}%`, background:`linear-gradient(90deg,${ACCENT},#fb923c)`, borderRadius:99, transition:"width 1s ease" }} />
          </div>
        </div>

        {/* Score strip */}
        <div style={{ padding:"12px 28px 16px", borderTop:"1px solid rgba(255,255,255,0.06)", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:10 }}>
          <div style={{ display:"flex", alignItems:"center", gap:20 }}>
            <div>
              <div style={{ fontSize:10.5, fontWeight:700, color:"rgba(255,255,255,0.3)", textTransform:"uppercase", letterSpacing:"0.08em" }}>Performance Score</div>
              <div style={{ fontSize:22, fontWeight:900, color:scoreColor, marginTop:2 }}>{ME.score}<span style={{ fontSize:12, color:"rgba(255,255,255,0.3)", fontWeight:600 }}>/100</span></div>
            </div>
            <div>
              <div style={{ fontSize:10.5, fontWeight:700, color:"rgba(255,255,255,0.3)", textTransform:"uppercase", letterSpacing:"0.08em" }}>Goals</div>
              <div style={{ fontSize:22, fontWeight:900, color:"#fff", marginTop:2 }}>{doneGoals}<span style={{ fontSize:12, color:"rgba(255,255,255,0.3)", fontWeight:600 }}>/{MY_GOALS.length}</span></div>
            </div>
            <div>
              <div style={{ fontSize:10.5, fontWeight:700, color:"rgba(255,255,255,0.3)", textTransform:"uppercase", letterSpacing:"0.08em" }}>Reviews Done</div>
              <div style={{ fontSize:22, fontWeight:900, color:"#fff", marginTop:2 }}>{MY_REVIEWS.filter(r=>r.done).length}<span style={{ fontSize:12, color:"rgba(255,255,255,0.3)", fontWeight:600 }}>/{MY_REVIEWS.length}</span></div>
            </div>
          </div>
          <button onClick={()=>setShowMsg(true)} style={{
            display:"flex", alignItems:"center", gap:7,
            padding:"9px 18px", borderRadius:10,
            background:ACCENT, border:"none", cursor:"pointer",
            fontSize:13, fontWeight:700, color:"#fff",
          }}>
            <Icon d={IC.msg} size={14} stroke="#fff" />
            Message Manager
          </button>
        </div>
      </div>

      {/* ── 2-COL GRID ─────────────────────────────────────────────────────── */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 340px", gap:16, alignItems:"start" }}>

        {/* LEFT — Reviews ───────────────────────────────────────────────────── */}
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

          {/* Review cards */}
          <div style={{ background:"#fff", borderRadius:16, border:"1px solid #f1f5f9", overflow:"hidden", boxShadow:"0 2px 16px rgba(0,0,0,0.05)", animation:"fadeUp 0.42s ease 0.08s both" }}>
            <div style={{ padding:"14px 20px", borderBottom:"1px solid #f1f5f9" }}>
              <div style={{ fontSize:14, fontWeight:800, color:"#111827" }}>📋 My Review Schedule</div>
              <div style={{ fontSize:12, color:"#9ca3af", marginTop:2 }}>Conducted by your manager every 30 days</div>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
              {MY_REVIEWS.map((r, i) => (
                <div key={i} style={{
                  padding:"16px 20px",
                  borderBottom: i < MY_REVIEWS.length - 1 ? "1px solid #f9fafb" : "none",
                  background: r.done ? "#fff" : "#fffbeb",
                  display:"flex", flexDirection:"column", gap: r.done ? 10 : 0,
                  animation:`fadeUp 0.38s ease ${0.1 + i*0.08}s both`,
                }}>
                  {/* Row header */}
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                      {/* Icon */}
                      <div style={{
                        width:38, height:38, borderRadius:11, flexShrink:0,
                        background: r.done ? "#f0fdf4" : "#fef3c7",
                        border:`1.5px solid ${r.done ? "#86efac" : "#fde68a"}`,
                        display:"flex", alignItems:"center", justifyContent:"center",
                        fontSize:16,
                      }}>
                        {r.done ? "✅" : "🕐"}
                      </div>
                      <div>
                        <div style={{ fontSize:14, fontWeight:800, color:"#111827" }}>{r.period}</div>
                        <div style={{ fontSize:12, color:"#9ca3af", marginTop:1 }}>{r.date}</div>
                      </div>
                    </div>
                    {r.done
                      ? <Stars rating={r.rating} size={15} />
                      : <span style={{ fontSize:11.5, fontWeight:700, padding:"3px 10px", borderRadius:99, background:"#fef3c7", color:"#d97706" }}>Upcoming</span>}
                  </div>

                  {/* Feedback block */}
                  {r.done && r.feedback && (
                    <div style={{ padding:"12px 14px", background:"#f8fafc", borderRadius:10, border:"1px solid #f1f5f9" }}>
                      <div style={{ fontSize:11, fontWeight:700, color:"#9ca3af", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:5 }}>
                        Manager Feedback · {r.reviewer}
                      </div>
                      <div style={{ fontSize:13, color:"#374151", lineHeight:1.6 }}>"{r.feedback}"</div>
                    </div>
                  )}

                  {/* Upcoming info */}
                  {!r.done && (
                    <div style={{ marginTop:8, fontSize:12.5, color:"#9ca3af" }}>
                      Your manager will conduct this review on <strong style={{ color:"#374151" }}>{r.date}</strong>. Prepare your progress update!
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Goals */}
          <div style={{ background:"#fff", borderRadius:16, border:"1px solid #f1f5f9", overflow:"hidden", boxShadow:"0 2px 16px rgba(0,0,0,0.05)", animation:"fadeUp 0.42s ease 0.14s both" }}>
            {/* Collapsible header */}
            <button onClick={()=>setExpandGoals(v=>!v)} style={{
              width:"100%", padding:"14px 20px", borderBottom: expandGoals ? "1px solid #f1f5f9" : "none",
              display:"flex", alignItems:"center", justifyContent:"space-between",
              background:"none", border:"none", cursor:"pointer", textAlign:"left",
            }}>
              <div>
                <div style={{ fontSize:14, fontWeight:800, color:"#111827" }}>🎯 My Goals</div>
                <div style={{ fontSize:12, color:"#9ca3af", marginTop:2 }}>{doneGoals} of {MY_GOALS.length} completed</div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                {/* mini progress */}
                <div style={{ width:60, height:5, background:"#f1f5f9", borderRadius:99, overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${Math.round(doneGoals/MY_GOALS.length*100)}%`, background:`linear-gradient(90deg,${ACCENT},#fb923c)`, borderRadius:99 }} />
                </div>
                <span style={{ fontSize:12, fontWeight:800, color:ACCENT }}>{Math.round(doneGoals/MY_GOALS.length*100)}%</span>
                <Icon d={expandGoals ? IC.chevU : IC.chevD} size={16} stroke="#9ca3af" />
              </div>
            </button>

            {expandGoals && (
              <div>
                {MY_GOALS.map((g, i) => (
                  <div key={g.id} style={{
                    display:"flex", alignItems:"center", gap:12, padding:"13px 20px",
                    borderBottom: i < MY_GOALS.length - 1 ? "1px solid #f9fafb" : "none",
                    background: g.done ? "#f0fdf408" : "#fff",
                  }}>
                    {/* checkbox (read-only — HR marks these) */}
                    <div style={{
                      width:24, height:24, borderRadius:7, flexShrink:0,
                      background: g.done ? "#dcfce7" : "#f9fafb",
                      border:`1.5px solid ${g.done ? "#86efac" : "#e5e7eb"}`,
                      display:"flex", alignItems:"center", justifyContent:"center",
                    }}>
                      {g.done && <Icon d={IC.check} size={13} stroke="#16a34a" sw={2.5} />}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13.5, fontWeight:600, color: g.done ? "#9ca3af" : "#111827", textDecoration: g.done ? "line-through" : "none" }}>{g.label}</div>
                      <div style={{ fontSize:11.5, color:"#9ca3af", marginTop:2 }}>Due: {g.dueDate}</div>
                    </div>
                    {g.done
                      ? <span style={{ fontSize:11.5, fontWeight:700, color:"#16a34a", background:"#f0fdf4", padding:"2px 9px", borderRadius:99 }}>✓ Done</span>
                      : <span style={{ fontSize:11.5, fontWeight:700, color:ACCENT, background:`${ACCENT}12`, padding:"2px 9px", borderRadius:99 }}>Pending</span>}
                  </div>
                ))}
                <div style={{ padding:"10px 20px", background:"#fafafa", fontSize:12, color:"#9ca3af" }}>
                  Goals are marked complete by your manager after verification.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT ─────────────────────────────────────────────────────────────── */}
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

          {/* Performance score card */}
          <div style={{ background:"#fff", borderRadius:16, border:"1px solid #f1f5f9", padding:"18px 20px", boxShadow:"0 2px 16px rgba(0,0,0,0.05)", animation:"fadeUp 0.42s ease 0.06s both" }}>
            <div style={{ fontSize:13.5, fontWeight:800, color:"#111827", marginBottom:14 }}>📊 Performance Score</div>
            {/* Arc-style display */}
            <div style={{ display:"flex", justifyContent:"center", marginBottom:14 }}>
              {(() => {
                const r=44, circ=2*Math.PI*r, p=ME.score/100;
                return (
                  <svg width={108} height={108} viewBox="0 0 108 108">
                    <circle cx={54} cy={54} r={r} fill="none" stroke="#f1f5f9" strokeWidth={10} />
                    <circle cx={54} cy={54} r={r} fill="none" stroke={scoreColor} strokeWidth={10}
                      strokeDasharray={`${circ*p} ${circ*(1-p)}`} strokeLinecap="round"
                      style={{ transform:"rotate(-90deg)", transformOrigin:"54px 54px" }} />
                    <text x={54} y={48} textAnchor="middle" fontSize={22} fontWeight={900} fill="#111827">{ME.score}</text>
                    <text x={54} y={64} textAnchor="middle" fontSize={11} fill="#9ca3af">out of 100</text>
                  </svg>
                );
              })()}
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
              {[
                { label:"Communication",    val:88 },
                { label:"Technical Skills", val:82 },
                { label:"Punctuality",      val:90 },
                { label:"Team Fit",         val:78 },
              ].map(item => (
                <div key={item.label} style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ fontSize:12, color:"#6b7280", flex:1 }}>{item.label}</span>
                  <div style={{ width:70, height:5, background:"#f1f5f9", borderRadius:99, overflow:"hidden" }}>
                    <div style={{ height:"100%", width:`${item.val}%`, background:ACCENT, borderRadius:99 }} />
                  </div>
                  <span style={{ fontSize:12, fontWeight:800, color:"#374151", minWidth:28, textAlign:"right" }}>{item.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Key Dates */}
          <div style={{ background:"#fff", borderRadius:16, border:"1px solid #f1f5f9", overflow:"hidden", boxShadow:"0 2px 16px rgba(0,0,0,0.05)", animation:"fadeUp 0.42s ease 0.12s both" }}>
            <div style={{ padding:"14px 18px", borderBottom:"1px solid #f1f5f9" }}>
              <div style={{ fontSize:13.5, fontWeight:800, color:"#111827" }}>📅 Key Dates</div>
            </div>
            <div>
              {[
                { label:"Probation Start",    val:ME.startDate,        icon:"🟢" },
                { label:"30-Day Review",      val:"Mar 3, 2026",       icon:"✅" },
                { label:"60-Day Review",      val:"Apr 2, 2026",       icon:"✅" },
                { label:"90-Day Review",      val:"Apr 30, 2026",      icon:"🔵" },
                { label:"Expected Confirmation",val:"May 1, 2026",     icon:"🎓" },
              ].map((item, i, arr) => (
                <div key={i} style={{
                  display:"flex", alignItems:"center", justifyContent:"space-between",
                  padding:"10px 18px",
                  borderBottom: i < arr.length - 1 ? "1px solid #f9fafb" : "none",
                }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ fontSize:14 }}>{item.icon}</span>
                    <span style={{ fontSize:12.5, color:"#6b7280" }}>{item.label}</span>
                  </div>
                  <span style={{ fontSize:12.5, fontWeight:800, color:"#374151" }}>{item.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Documents */}
          <div style={{ background:"#fff", borderRadius:16, border:"1px solid #f1f5f9", overflow:"hidden", boxShadow:"0 2px 16px rgba(0,0,0,0.05)", animation:"fadeUp 0.42s ease 0.18s both" }}>
            <button onClick={()=>setExpandDocs(v=>!v)} style={{ width:"100%", padding:"14px 18px", borderBottom: expandDocs ? "1px solid #f1f5f9":"none", display:"flex", alignItems:"center", justifyContent:"space-between", background:"none", border:"none", cursor:"pointer" }}>
              <div style={{ fontSize:13.5, fontWeight:800, color:"#111827" }}>📄 My Documents</div>
              <Icon d={expandDocs ? IC.chevU : IC.chevD} size={15} stroke="#9ca3af" />
            </button>
            {expandDocs && (
              <div>
                {MY_DOCS.map((doc, i) => (
                  <div key={i} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 18px", borderBottom: i < MY_DOCS.length-1 ? "1px solid #f9fafb":"none", gap:8 }}>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:12.5, fontWeight:600, color: doc.status==="available"?"#111827":"#9ca3af", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{doc.name}</div>
                      {doc.note && <div style={{ fontSize:11, color:"#d97706", marginTop:1 }}>{doc.note}</div>}
                    </div>
                    {doc.status === "available"
                      ? <button style={{ padding:"4px 10px", background:"#f0fdf4", border:"1px solid #bbf7d0", borderRadius:7, fontSize:11.5, fontWeight:700, color:"#16a34a", cursor:"pointer", flexShrink:0 }}>⬇ Download</button>
                      : <span style={{ fontSize:11, fontWeight:700, color:"#d1d5db", flexShrink:0 }}>Pending</span>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info tip */}
          <div style={{ background:"#eff6ff", border:"1px solid #bfdbfe", borderRadius:12, padding:"12px 14px", display:"flex", gap:10, animation:"fadeUp 0.42s ease 0.22s both" }}>
            <span style={{ fontSize:18, flexShrink:0 }}>💡</span>
            <div style={{ fontSize:12.5, color:"#1d4ed8", lineHeight:1.6 }}>
              Your probation will be reviewed and confirmed by <strong>{ME.manager}</strong> after your 90-day review on <strong>Apr 30, 2026</strong>.
            </div>
          </div>
        </div>
      </div>

      {/* ── Message Manager Modal ─────────────────────────────────────────── */}
      <Modal show={showMsg} onClose={()=>setShowMsg(false)} title="Message Manager">
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div style={{ padding:"10px 14px", background:"#f9fafb", borderRadius:10, display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:34, height:34, borderRadius:"50%", background:"linear-gradient(135deg,#6366f1,#4f46e5)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:800, color:"#fff" }}>KS</div>
            <div>
              <div style={{ fontSize:13.5, fontWeight:700, color:"#111827" }}>{ME.manager}</div>
              <div style={{ fontSize:12, color:"#9ca3af" }}>Your Probation Manager</div>
            </div>
          </div>
          <div>
            <label style={{ fontSize:12, fontWeight:700, color:"#374151", marginBottom:6, display:"block" }}>Your Message</label>
            <textarea
              value={msgText} onChange={e=>setMsgText(e.target.value)}
              rows={4} placeholder="e.g. I'd like to discuss my 90-day review preparation…"
              style={{ width:"100%", padding:"10px 13px", border:"1.5px solid #e5e7eb", borderRadius:10, fontSize:13.5, color:"#111827", outline:"none", resize:"none", boxSizing:"border-box", fontFamily:"inherit", background:"#fafafa", lineHeight:1.6 }}
            />
          </div>
          <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
            <button onClick={()=>setShowMsg(false)} style={{ padding:"8px 18px", background:"#f9fafb", border:"1px solid #e5e7eb", borderRadius:9, fontSize:13, fontWeight:600, color:"#374151", cursor:"pointer" }}>Cancel</button>
            <button onClick={()=>{ setShowMsg(false); setMsgText(""); alert("Message sent to " + ME.manager); }}
              style={{ padding:"8px 20px", background:ACCENT, border:"none", borderRadius:9, fontSize:13, fontWeight:700, color:"#fff", cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}>
              <Icon d={IC.send} size={13} stroke="#fff" />Send Message
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}