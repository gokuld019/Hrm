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
  trending: "M23 6l-9.5 9.5-5-5L1 18 M17 6h6v6",
  star:     "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  award:    "M12 15a7 7 0 1 0 0-14 7 7 0 0 0 0 14z M8.21 13.89L7 23l5-3 5 3-1.21-9.12",
  msg:      "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
  send:     "M22 2L11 13 M22 2L15 22l-4-9-9-4 22-7z",
  chevD:    "M6 9l6 6 6-6",
  chevU:    "M18 15l-6-6-6 6",
  download: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M7 10l5 5 5-5 M12 15V3",
  file:     "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6",
  coin:     "M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z M12 6v6M12 16h.01",
  info:     "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 8h.01M12 12v4",
  target:   "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12z M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
  arrow:    "M5 12h14 M12 5l7 7-7 7",
  lock:     "M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z M7 11V7a5 5 0 0 1 10 0v4",
};

const ACCENT = "#f97316";

// ─── My promotion data ─────────────────────────────────────────────────────────
const ME = {
  name:        "Priya Ramesh",
  currentRole: "UI/UX Designer",
  targetRole:  "Senior UI/UX Designer",
  dept:        "Design",
  manager:     "Kavitha S.",
  joinDate:    "Feb 1, 2024",
  yearsExp:    "2.3 yrs",
  status:      "Under Review",  // "Eligible" | "Under Review" | "Approved" | "Not Eligible"
  cycleDate:   "Jun 30, 2026",
  currentSalary:  75000,
  expectedHike:   18,           // percent
  expectedSalary: 88500,
  overallScore:   84,
};

// Promotion eligibility criteria — what the employee needs to hit
const CRITERIA = [
  { id:1, label:"Minimum 2 years in current role",          met:true,  detail:"You have 2.3 years"           },
  { id:2, label:"Performance rating ≥ 4/5 in last review",  met:true,  detail:"Your last rating: 4.2/5"      },
  { id:3, label:"No active disciplinary actions",           met:true,  detail:"Clean record"                  },
  { id:4, label:"Complete mandatory L&D courses",           met:false, detail:"1 of 3 courses pending"        },
  { id:5, label:"Manager nomination submitted",             met:true,  detail:"Nominated by Kavitha S."       },
  { id:6, label:"HR review completed",                      met:false, detail:"Scheduled for Jun 15, 2026"    },
];

// Skills needed for the target role
const SKILLS = [
  { label:"Design Systems",      current:88, required:85, met:true  },
  { label:"User Research",       current:74, required:80, met:false },
  { label:"Prototyping",         current:90, required:85, met:true  },
  { label:"Stakeholder Comms",   current:78, required:80, met:false },
  { label:"Team Mentoring",      current:70, required:75, met:false },
];

// Timeline of the promotion journey
const TIMELINE = [
  { date:"Jan 15, 2026", label:"Eligibility confirmed",     done:true,  icon:"✅" },
  { date:"Feb 10, 2026", label:"Self-assessment submitted",  done:true,  icon:"✅" },
  { date:"Mar 5, 2026",  label:"Manager nomination",        done:true,  icon:"✅" },
  { date:"Apr 20, 2026", label:"HR initial review",         done:true,  icon:"✅" },
  { date:"Jun 15, 2026", label:"Committee review",          done:false, icon:"🔵" },
  { date:"Jun 30, 2026", label:"Final decision",            done:false, icon:"⬜" },
];

// Salary comparison
const SAL_ITEMS = [
  { label:"Current CTC",     val:"₹9,00,000 / yr",  color:"#374151"  },
  { label:"Expected Hike",   val:`+${ME.expectedHike}%`, color:"#16a34a" },
  { label:"New CTC",         val:"₹10,62,000 / yr", color:ACCENT      },
  { label:"Effective From",  val:"Jul 1, 2026",      color:"#6b7280"  },
];

// Past promotions
const HISTORY = [
  { from:"Junior Designer", to:"UI/UX Designer", date:"Feb 2024", hike:"22%", reason:"Outstanding probation & delivery" },
];

// Docs
const DOCS = [
  { name:"Promotion Policy Document",    status:"available" },
  { name:"Self-Assessment Form",         status:"available" },
  { name:"Manager Nomination Letter",    status:"available" },
  { name:"Promotion Offer Letter",       status:"pending",  note:"After final decision" },
  { name:"Revised Salary Slip",          status:"pending",  note:"After Jul 1, 2026"   },
];

// ─── Status config ─────────────────────────────────────────────────────────────
const STATUS_CFG = {
  "Eligible":      { bg:"#f0fdf4", c:"#16a34a", dot:"#22c55e", emoji:"🟢", msg:"You meet all criteria! Promotion cycle is open." },
  "Under Review":  { bg:"#eff6ff", c:"#1d4ed8", dot:"#3b82f6", emoji:"🔵", msg:"Your promotion is being reviewed by HR & the committee." },
  "Approved":      { bg:"#fdf4ff", c:"#7e22ce", dot:"#a855f7", emoji:"🎉", msg:"Congratulations! Your promotion has been approved." },
  "Not Eligible":  { bg:"#fef2f2", c:"#dc2626", dot:"#ef4444", emoji:"🔴", msg:"You don't meet all criteria yet. Keep working on it!" },
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

// ─── Main ──────────────────────────────────────────────────────────────────────
export default function MyPromotion() {
  const [showMsg,       setShowMsg]       = useState(false);
  const [msgText,       setMsgText]       = useState("");
  const [expandHistory, setExpandHistory] = useState(false);
  const [expandDocs,    setExpandDocs]    = useState(false);

  const cfg      = STATUS_CFG[ME.status] || STATUS_CFG["Under Review"];
  const metCount = CRITERIA.filter(c => c.met).length;
  const critPct  = Math.round((metCount / CRITERIA.length) * 100);
  const skillsMet= SKILLS.filter(s => s.met).length;

  return (
    <div style={{ fontFamily:"'Nunito','DM Sans',sans-serif", display:"flex", flexDirection:"column", gap:16 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }
        @keyframes popIn  { from{opacity:0;transform:scale(0.93)} to{opacity:1;transform:scale(1)} }
        @keyframes pulse  { 0%,100%{opacity:0.6} 50%{opacity:1} }
      `}</style>

      {/* ── HERO ───────────────────────────────────────────────────────────── */}
      <div style={{
        borderRadius:20, overflow:"hidden",
        background:"linear-gradient(135deg,#1e293b 0%,#0f172a 100%)",
        boxShadow:"0 8px 40px rgba(0,0,0,0.18)",
        animation:"fadeUp 0.4s ease both",
      }}>
        {/* Top */}
        <div style={{ padding:"24px 28px 18px", display:"flex", alignItems:"flex-start", justifyContent:"space-between", flexWrap:"wrap", gap:16 }}>
          <div>
            <div style={{ fontSize:11, fontWeight:800, letterSpacing:"0.12em", color:"rgba(255,255,255,0.35)", textTransform:"uppercase", marginBottom:6 }}>My Promotion</div>
            <div style={{ fontSize:22, fontWeight:900, color:"#fff", letterSpacing:"-0.5px" }}>Hello, {ME.name.split(" ")[0]} 🚀</div>
            <div style={{ fontSize:13, color:"rgba(255,255,255,0.45)", marginTop:4 }}>
              {ME.currentRole} · {ME.dept} · Manager: <span style={{ color:"rgba(255,255,255,0.65)", fontWeight:700 }}>{ME.manager}</span>
            </div>

            {/* Status badge */}
            <div style={{ marginTop:14, display:"inline-flex", alignItems:"center", gap:8, padding:"7px 14px", borderRadius:99, background:cfg.bg, border:`1.5px solid ${cfg.dot}55` }}>
              <span style={{ width:8, height:8, borderRadius:"50%", background:cfg.dot, animation:"pulse 2s ease infinite" }} />
              <span style={{ fontSize:13, fontWeight:800, color:cfg.c }}>{ME.status}</span>
              <span style={{ fontSize:12, color:cfg.c, opacity:0.7 }}>· {cfg.msg}</span>
            </div>
          </div>

          {/* Role upgrade display */}
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.3)", letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:8 }}>Role Change</div>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ background:"rgba(255,255,255,0.07)", borderRadius:10, padding:"8px 14px", border:"1px solid rgba(255,255,255,0.1)" }}>
                <div style={{ fontSize:12, color:"rgba(255,255,255,0.4)", marginBottom:2 }}>Current</div>
                <div style={{ fontSize:13.5, fontWeight:800, color:"rgba(255,255,255,0.8)" }}>{ME.currentRole}</div>
              </div>
              <div style={{ fontSize:20, color:ACCENT }}>→</div>
              <div style={{ background:`${ACCENT}22`, borderRadius:10, padding:"8px 14px", border:`1px solid ${ACCENT}44` }}>
                <div style={{ fontSize:12, color:`${ACCENT}cc`, marginBottom:2 }}>Target</div>
                <div style={{ fontSize:13.5, fontWeight:800, color:"#fff" }}>{ME.targetRole}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Criteria progress bar */}
        <div style={{ padding:"0 28px 16px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:"rgba(255,255,255,0.3)", marginBottom:6, fontWeight:700 }}>
            <span>Eligibility Progress</span>
            <span>{metCount}/{CRITERIA.length} criteria met · {critPct}%</span>
          </div>
          <div style={{ height:8, background:"rgba(255,255,255,0.08)", borderRadius:99, overflow:"hidden" }}>
            <div style={{ height:"100%", width:`${critPct}%`, background:`linear-gradient(90deg,${ACCENT},#fb923c)`, borderRadius:99 }} />
          </div>
        </div>

        {/* Bottom strip */}
        <div style={{ padding:"12px 28px 16px", borderTop:"1px solid rgba(255,255,255,0.06)", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:10 }}>
          <div style={{ display:"flex", alignItems:"center", gap:24 }}>
            {[
              { label:"Performance Score", val:`${ME.overallScore}/100`,      color:"#fb923c" },
              { label:"Expected Hike",     val:`+${ME.expectedHike}%`,        color:"#22c55e" },
              { label:"Cycle Closes",      val:ME.cycleDate,                  color:"rgba(255,255,255,0.7)" },
              { label:"Experience",        val:ME.yearsExp,                   color:"rgba(255,255,255,0.7)" },
            ].map((s, i) => (
              <div key={i}>
                <div style={{ fontSize:10.5, fontWeight:700, color:"rgba(255,255,255,0.3)", textTransform:"uppercase", letterSpacing:"0.07em" }}>{s.label}</div>
                <div style={{ fontSize:18, fontWeight:900, color:s.color, marginTop:2 }}>{s.val}</div>
              </div>
            ))}
          </div>
          <button onClick={()=>setShowMsg(true)} style={{ display:"flex", alignItems:"center", gap:7, padding:"9px 18px", borderRadius:10, background:ACCENT, border:"none", cursor:"pointer", fontSize:13, fontWeight:700, color:"#fff" }}>
            <Icon d={IC.msg} size={14} stroke="#fff" />Message Manager
          </button>
        </div>
      </div>

      {/* ── 2-COL GRID ─────────────────────────────────────────────────────── */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 320px", gap:16, alignItems:"start" }}>

        {/* LEFT ─────────────────────────────────────────────────────────────── */}
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

          {/* Eligibility Criteria */}
          <div style={{ background:"#fff", borderRadius:16, border:"1px solid #f1f5f9", overflow:"hidden", boxShadow:"0 2px 16px rgba(0,0,0,0.05)", animation:"fadeUp 0.42s ease 0.08s both" }}>
            <div style={{ padding:"14px 20px", borderBottom:"1px solid #f1f5f9", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div>
                <div style={{ fontSize:14, fontWeight:800, color:"#111827" }}>✅ Eligibility Criteria</div>
                <div style={{ fontSize:12, color:"#9ca3af", marginTop:2 }}>{metCount} of {CRITERIA.length} criteria met</div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <div style={{ width:64, height:6, background:"#f1f5f9", borderRadius:99, overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${critPct}%`, background:`linear-gradient(90deg,${ACCENT},#fb923c)`, borderRadius:99 }} />
                </div>
                <span style={{ fontSize:13, fontWeight:900, color:ACCENT }}>{critPct}%</span>
              </div>
            </div>
            <div>
              {CRITERIA.map((c, i) => (
                <div key={c.id} style={{
                  display:"flex", alignItems:"center", gap:13, padding:"13px 20px",
                  borderBottom: i < CRITERIA.length - 1 ? "1px solid #f9fafb" : "none",
                  background: c.met ? "#fff" : "#fefce8",
                  animation:`fadeUp 0.38s ease ${0.1 + i*0.06}s both`,
                }}>
                  <div style={{ width:30, height:30, borderRadius:9, flexShrink:0, background: c.met ? "#dcfce7" : "#fef3c7", border:`1.5px solid ${c.met ? "#86efac" : "#fde68a"}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    {c.met
                      ? <Icon d={IC.check} size={14} stroke="#16a34a" sw={2.5} />
                      : <Icon d={IC.clock} size={13} stroke="#d97706" />}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13.5, fontWeight:700, color:"#111827" }}>{c.label}</div>
                    <div style={{ fontSize:12, color: c.met ? "#9ca3af" : "#d97706", marginTop:2 }}>{c.detail}</div>
                  </div>
                  <span style={{ fontSize:11.5, fontWeight:700, padding:"3px 10px", borderRadius:99, background: c.met ? "#f0fdf4" : "#fef3c7", color: c.met ? "#16a34a" : "#d97706", flexShrink:0 }}>
                    {c.met ? "Met" : "Pending"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Skills Gap */}
          <div style={{ background:"#fff", borderRadius:16, border:"1px solid #f1f5f9", overflow:"hidden", boxShadow:"0 2px 16px rgba(0,0,0,0.05)", animation:"fadeUp 0.42s ease 0.14s both" }}>
            <div style={{ padding:"14px 20px", borderBottom:"1px solid #f1f5f9" }}>
              <div style={{ fontSize:14, fontWeight:800, color:"#111827" }}>🎯 Skills for {ME.targetRole}</div>
              <div style={{ fontSize:12, color:"#9ca3af", marginTop:2 }}>{skillsMet} of {SKILLS.length} skills at required level</div>
            </div>
            <div style={{ padding:"16px 20px", display:"flex", flexDirection:"column", gap:13 }}>
              {SKILLS.map((s, i) => (
                <div key={i} style={{ animation:`fadeUp 0.38s ease ${0.1+i*0.05}s both` }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <span style={{ width:7, height:7, borderRadius:"50%", background: s.met ? "#22c55e" : "#f59e0b", flexShrink:0 }} />
                      <span style={{ fontSize:13, fontWeight:700, color:"#374151" }}>{s.label}</span>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <span style={{ fontSize:12, color:"#9ca3af" }}>Need {s.required}</span>
                      <span style={{ fontSize:13, fontWeight:900, color: s.met ? "#16a34a" : "#d97706" }}>{s.current}</span>
                    </div>
                  </div>
                  <div style={{ position:"relative", height:7, background:"#f1f5f9", borderRadius:99, overflow:"visible" }}>
                    {/* Actual bar */}
                    <div style={{ height:"100%", width:`${s.current}%`, background: s.met ? "linear-gradient(90deg,#22c55e,#16a34a)" : "linear-gradient(90deg,#f59e0b,#d97706)", borderRadius:99 }} />
                    {/* Required marker */}
                    <div style={{ position:"absolute", top:-3, left:`${s.required}%`, width:2, height:13, background:"#374151", borderRadius:1, transform:"translateX(-50%)" }} />
                  </div>
                  {!s.met && (
                    <div style={{ fontSize:11, color:"#d97706", marginTop:4 }}>
                      Need +{s.required - s.current} points · Work with manager to close gap
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Promotion Timeline */}
          <div style={{ background:"#fff", borderRadius:16, border:"1px solid #f1f5f9", overflow:"hidden", boxShadow:"0 2px 16px rgba(0,0,0,0.05)", animation:"fadeUp 0.42s ease 0.2s both" }}>
            <div style={{ padding:"14px 20px", borderBottom:"1px solid #f1f5f9" }}>
              <div style={{ fontSize:14, fontWeight:800, color:"#111827" }}>📍 Promotion Timeline</div>
              <div style={{ fontSize:12, color:"#9ca3af", marginTop:2 }}>Current cycle · Apr – Jun 2026</div>
            </div>
            <div style={{ padding:"16px 20px 8px", position:"relative" }}>
              {/* vertical line */}
              <div style={{ position:"absolute", left:38, top:16, bottom:16, width:2, background:"#f1f5f9", borderRadius:1 }} />
              <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
                {TIMELINE.map((t, i) => (
                  <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:14, paddingBottom: i < TIMELINE.length-1 ? 18 : 8, position:"relative", animation:`fadeUp 0.38s ease ${0.1+i*0.07}s both` }}>
                    {/* icon */}
                    <div style={{ width:28, height:28, borderRadius:"50%", background: t.done ? "#f0fdf4" : i === TIMELINE.findIndex(x=>!x.done) ? "#eff6ff" : "#f9fafb", border:`2px solid ${t.done ? "#86efac" : i === TIMELINE.findIndex(x=>!x.done) ? "#93c5fd" : "#e5e7eb"}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, flexShrink:0, zIndex:1, background:"#fff" }}>
                      {t.icon}
                    </div>
                    <div style={{ paddingTop:4 }}>
                      <div style={{ fontSize:13.5, fontWeight:700, color: t.done ? "#111827" : "#9ca3af" }}>{t.label}</div>
                      <div style={{ fontSize:12, color:"#9ca3af", marginTop:2 }}>{t.date}</div>
                    </div>
                    {i === TIMELINE.findIndex(x=>!x.done) && (
                      <span style={{ marginLeft:"auto", marginTop:4, fontSize:11.5, fontWeight:700, padding:"2px 10px", borderRadius:99, background:"#eff6ff", color:"#1d4ed8", flexShrink:0 }}>Current</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT ─────────────────────────────────────────────────────────────── */}
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

          {/* Salary Preview */}
          <div style={{ background:"#fff", borderRadius:16, border:"1px solid #f1f5f9", overflow:"hidden", boxShadow:"0 2px 16px rgba(0,0,0,0.05)", animation:"fadeUp 0.42s ease 0.06s both" }}>
            <div style={{ padding:"14px 18px", borderBottom:"1px solid #f1f5f9" }}>
              <div style={{ fontSize:13.5, fontWeight:800, color:"#111827" }}>💰 Expected Salary</div>
              <div style={{ fontSize:12, color:"#9ca3af", marginTop:2 }}>If approved this cycle</div>
            </div>
            <div style={{ padding:"4px 0" }}>
              {SAL_ITEMS.map((s, i) => (
                <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"11px 18px", borderBottom: i < SAL_ITEMS.length-1 ? "1px solid #f9fafb":"none" }}>
                  <span style={{ fontSize:12.5, color:"#6b7280" }}>{s.label}</span>
                  <span style={{ fontSize:14, fontWeight:900, color:s.color }}>{s.val}</span>
                </div>
              ))}
            </div>
            {/* Highlight box */}
            <div style={{ margin:"0 14px 14px", padding:"14px 16px", borderRadius:12, background:`linear-gradient(135deg,${ACCENT}18,${ACCENT}08)`, border:`1.5px solid ${ACCENT}33`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ fontSize:13, fontWeight:800, color:"#111827" }}>New CTC</span>
              <span style={{ fontSize:22, fontWeight:900, color:ACCENT, letterSpacing:"-0.5px" }}>₹10,62,000</span>
            </div>
            <div style={{ padding:"0 14px 14px" }}>
              <div style={{ fontSize:11.5, color:"#9ca3af", background:"#f9fafb", borderRadius:9, padding:"9px 12px", lineHeight:1.6 }}>
                💡 Salary breakdown is an estimate. Final amount is subject to HR & management approval after the Jun 30 cycle.
              </div>
            </div>
          </div>

          {/* Score card */}
          <div style={{ background:"#fff", borderRadius:16, border:"1px solid #f1f5f9", padding:"16px 18px", boxShadow:"0 2px 16px rgba(0,0,0,0.05)", animation:"fadeUp 0.42s ease 0.1s both" }}>
            <div style={{ fontSize:13.5, fontWeight:800, color:"#111827", marginBottom:14 }}>📊 Performance Score</div>
            <div style={{ display:"flex", justifyContent:"center", marginBottom:14 }}>
              {(() => {
                const r=42, circ=2*Math.PI*r, p=ME.overallScore/100;
                const scoreColor = ME.overallScore>=80?"#16a34a":ME.overallScore>=60?"#d97706":"#dc2626";
                return (
                  <svg width={104} height={104} viewBox="0 0 104 104">
                    <circle cx={52} cy={52} r={r} fill="none" stroke="#f1f5f9" strokeWidth={9} />
                    <circle cx={52} cy={52} r={r} fill="none" stroke={scoreColor} strokeWidth={9}
                      strokeDasharray={`${circ*p} ${circ*(1-p)}`} strokeLinecap="round"
                      style={{ transform:"rotate(-90deg)", transformOrigin:"52px 52px" }} />
                    <text x={52} y={48} textAnchor="middle" fontSize={22} fontWeight={900} fill="#111827">{ME.overallScore}</text>
                    <text x={52} y={63} textAnchor="middle" fontSize={10} fill="#9ca3af">out of 100</text>
                  </svg>
                );
              })()}
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {[
                { label:"Delivery",     val:88 },
                { label:"Innovation",   val:80 },
                { label:"Teamwork",     val:85 },
                { label:"Leadership",   val:72 },
              ].map(item => (
                <div key={item.label} style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ fontSize:12, color:"#6b7280", width:72, flexShrink:0 }}>{item.label}</span>
                  <div style={{ flex:1, height:5, background:"#f1f5f9", borderRadius:99, overflow:"hidden" }}>
                    <div style={{ height:"100%", width:`${item.val}%`, background:ACCENT, borderRadius:99 }} />
                  </div>
                  <span style={{ fontSize:12, fontWeight:800, color:"#374151", minWidth:24, textAlign:"right" }}>{item.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Promotion History (collapsible) */}
          <div style={{ background:"#fff", borderRadius:16, border:"1px solid #f1f5f9", overflow:"hidden", boxShadow:"0 2px 16px rgba(0,0,0,0.05)", animation:"fadeUp 0.42s ease 0.16s both" }}>
            <button onClick={()=>setExpandHistory(v=>!v)} style={{ width:"100%", padding:"14px 18px", borderBottom: expandHistory?"1px solid #f1f5f9":"none", display:"flex", alignItems:"center", justifyContent:"space-between", background:"none", border:"none", cursor:"pointer" }}>
              <div style={{ fontSize:13.5, fontWeight:800, color:"#111827" }}>🏅 Promotion History</div>
              <Icon d={expandHistory ? IC.chevU : IC.chevD} size={15} stroke="#9ca3af" />
            </button>
            {expandHistory && (
              <div>
                {HISTORY.map((h, i) => (
                  <div key={i} style={{ padding:"14px 18px", borderBottom: i < HISTORY.length-1?"1px solid #f9fafb":"none" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                      <span style={{ fontSize:14, fontWeight:800, color:"#111827" }}>{h.from}</span>
                      <span style={{ fontSize:16, color:ACCENT }}>→</span>
                      <span style={{ fontSize:14, fontWeight:800, color:ACCENT }}>{h.to}</span>
                    </div>
                    <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                      <span style={{ fontSize:12, color:"#9ca3af" }}>{h.date}</span>
                      <span style={{ fontSize:12, fontWeight:700, color:"#16a34a", background:"#f0fdf4", padding:"1px 8px", borderRadius:99 }}>+{h.hike} hike</span>
                    </div>
                    <div style={{ fontSize:12.5, color:"#6b7280", marginTop:6, fontStyle:"italic" }}>"{h.reason}"</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Documents (collapsible) */}
          <div style={{ background:"#fff", borderRadius:16, border:"1px solid #f1f5f9", overflow:"hidden", boxShadow:"0 2px 16px rgba(0,0,0,0.05)", animation:"fadeUp 0.42s ease 0.2s both" }}>
            <button onClick={()=>setExpandDocs(v=>!v)} style={{ width:"100%", padding:"14px 18px", borderBottom: expandDocs?"1px solid #f1f5f9":"none", display:"flex", alignItems:"center", justifyContent:"space-between", background:"none", border:"none", cursor:"pointer" }}>
              <div style={{ fontSize:13.5, fontWeight:800, color:"#111827" }}>📄 Documents</div>
              <Icon d={expandDocs ? IC.chevU : IC.chevD} size={15} stroke="#9ca3af" />
            </button>
            {expandDocs && (
              <div>
                {DOCS.map((doc, i) => (
                  <div key={i} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 18px", borderBottom: i<DOCS.length-1?"1px solid #f9fafb":"none", gap:8 }}>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:12.5, fontWeight:600, color: doc.status==="available"?"#111827":"#9ca3af", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{doc.name}</div>
                      {doc.note && <div style={{ fontSize:11, color:"#d97706", marginTop:1 }}>{doc.note}</div>}
                    </div>
                    {doc.status === "available"
                      ? <button style={{ padding:"4px 10px", background:"#f0fdf4", border:"1px solid #bbf7d0", borderRadius:7, fontSize:11.5, fontWeight:700, color:"#16a34a", cursor:"pointer", flexShrink:0 }}>⬇ Get</button>
                      : <span style={{ fontSize:11, fontWeight:700, color:"#d1d5db", flexShrink:0 }}>Pending</span>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info tip */}
          <div style={{ background:"#eff6ff", border:"1px solid #bfdbfe", borderRadius:12, padding:"12px 14px", display:"flex", gap:10, animation:"fadeUp 0.42s ease 0.24s both" }}>
            <span style={{ fontSize:18, flexShrink:0 }}>💡</span>
            <div style={{ fontSize:12.5, color:"#1d4ed8", lineHeight:1.6 }}>
              Final promotion decision will be made by <strong>{ME.manager}</strong> and HR committee on <strong>{ME.cycleDate}</strong>. Complete the pending criteria to improve your chances.
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
              <div style={{ fontSize:12, color:"#9ca3af" }}>Your Reporting Manager</div>
            </div>
          </div>
          <div>
            <label style={{ fontSize:12, fontWeight:700, color:"#374151", marginBottom:6, display:"block" }}>Your Message</label>
            <textarea value={msgText} onChange={e=>setMsgText(e.target.value)} rows={4}
              placeholder="e.g. I'd like to discuss my promotion eligibility and how I can close the skill gaps…"
              style={{ width:"100%", padding:"10px 13px", border:"1.5px solid #e5e7eb", borderRadius:10, fontSize:13.5, color:"#111827", outline:"none", resize:"none", boxSizing:"border-box", fontFamily:"inherit", background:"#fafafa", lineHeight:1.6 }} />
          </div>
          <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
            <button onClick={()=>setShowMsg(false)} style={{ padding:"8px 18px", background:"#f9fafb", border:"1px solid #e5e7eb", borderRadius:9, fontSize:13, fontWeight:600, color:"#374151", cursor:"pointer" }}>Cancel</button>
            <button onClick={()=>{ setShowMsg(false); setMsgText(""); alert("Message sent to "+ME.manager); }}
              style={{ padding:"8px 20px", background:ACCENT, border:"none", borderRadius:9, fontSize:13, fontWeight:700, color:"#fff", cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}>
              <Icon d={IC.send} size={13} stroke="#fff" />Send Message
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}