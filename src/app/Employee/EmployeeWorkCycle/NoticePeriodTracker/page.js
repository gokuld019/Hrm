"use client";
import { useState } from "react";

// ─── Icons (inline SVG, no lucide dependency needed) ──────────────────────────
const Icon = ({ d, size = 16, stroke = "currentColor", sw = 1.8, fill = "none" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
    strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
    style={{ display: "block", flexShrink: 0 }}>
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

const IC = {
  check:    "M20 6L9 17l-5-5",
  clock:    "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2",
  x:        "M18 6L6 18M6 6l12 12",
  file:     "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8M16 17H8M10 9H8",
  download: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M7 10l5 5 5-5 M12 15V3",
  calendar: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z",
  alert:    "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z M12 9v4M12 17h.01",
  coin:     "M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zM12 6v6M12 16h.01",
  send:     "M22 2L11 13 M22 2L15 22l-4-9-9-4 22-7z",
  chevR:    "M9 18l6-6-6-6",
};

// ─── Modal wrapper ─────────────────────────────────────────────────────────────
function Modal({ show, onClose, children }) {
  if (!show) return null;
  return (
    <div onClick={onClose} style={{
      position:"fixed", inset:0, zIndex:600,
      background:"rgba(15,23,42,0.6)", backdropFilter:"blur(8px)",
      display:"flex", alignItems:"center", justifyContent:"center", padding:20,
    }}>
      <div onClick={e=>e.stopPropagation()} style={{
        background:"#fff", borderRadius:20, width:"100%", maxWidth:460,
        boxShadow:"0 32px 80px rgba(0,0,0,0.22)",
        animation:"popIn 0.22s cubic-bezier(0.34,1.56,0.64,1) both",
        overflow:"hidden",
      }}>
        {children}
      </div>
    </div>
  );
}

// ─── Modal Header ──────────────────────────────────────────────────────────────
function ModalHeader({ title, sub, color="#f97316", onClose }) {
  return (
    <div style={{ background:`linear-gradient(135deg,${color},${color}bb)`, padding:"20px 22px 18px" }}>
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between" }}>
        <div>
          <div style={{ fontSize:18, fontWeight:900, color:"#fff", letterSpacing:"-0.3px" }}>{title}</div>
          {sub && <div style={{ fontSize:12.5, color:"rgba(255,255,255,0.7)", marginTop:3 }}>{sub}</div>}
        </div>
        <button onClick={onClose} style={{
          width:30, height:30, borderRadius:8, background:"rgba(255,255,255,0.2)",
          border:"none", cursor:"pointer", color:"#fff", fontSize:17,
          display:"flex", alignItems:"center", justifyContent:"center",
        }}>✕</button>
      </div>
    </div>
  );
}

// ─── Input styles ──────────────────────────────────────────────────────────────
const inputStyle = {
  width:"100%", padding:"10px 13px",
  border:"1.5px solid #e5e7eb", borderRadius:10,
  fontSize:13.5, color:"#111827", outline:"none",
  boxSizing:"border-box", fontFamily:"inherit",
  background:"#fafafa",
};

// ─── Main Component ────────────────────────────────────────────────────────────
export default function NoticePeriodTracker({ ACCENT = "#f97316" }) {
  // Modal states
  const [modal, setModal] = useState(null); // "early" | "buyout" | "cancel" | "exit"

  // Early release
  const [earlyDate, setEarlyDate]   = useState("");
  const [earlyReason, setEarlyReason] = useState("");

  // Cancel resignation
  const [cancelReason, setCancelReason] = useState("");

  // Exit interview
  const [exitReason,   setExitReason]   = useState("");
  const [exitFeedback, setExitFeedback] = useState("");

  // Formalities
  const [formalities, setFormalities] = useState([
    { id:1, name:"Handover Document Upload", done:false },
    { id:2, name:"Team Knowledge Transfer",  done:false },
    { id:3, name:"ID Card & Assets Return",  done:false },
    { id:4, name:"Exit Interview",           done:false, special:true },
  ]);

  const markDone = (id) =>
    setFormalities(prev => prev.map(f => f.id === id ? { ...f, done:true } : f));

  const submitExit = () => {
    markDone(4);
    setModal(null);
    setExitReason(""); setExitFeedback("");
  };

  const doneCount = formalities.filter(f => f.done).length;
  const progress  = Math.round((doneCount / formalities.length) * 100);

  // Notice period data
  const totalDays     = 60;
  const elapsed       = 28;
  const remaining     = totalDays - elapsed;
  const noticePct     = Math.round((elapsed / totalDays) * 100);
  const startDate     = "Apr 1, 2025";
  const lastWorkDay   = "May 31, 2025";
  const buyoutAmount  = "₹38,500";

  // Documents
  const docs = [
    { name:"Resignation Letter",            status:"ready",   date:"Apr 1, 2025"  },
    { name:"Resignation Acceptance Letter", status:"ready",   date:"Apr 2, 2025"  },
    { name:"Exit Interview Form",           status:"pending", expected:null        },
    { name:"Relieving Letter",              status:"pending", expected:"Jun 10, 2025" },
    { name:"Experience Letter",             status:"pending", expected:"Jun 7, 2025"  },
    { name:"F&F Settlement Slip",           status:"pending", expected:"Jun 15, 2025" },
  ];

  // Settlement
  const settlement = [
    { label:"Last Month Salary",       amount:"₹75,000",  type:"base"   },
    { label:"Leave Encashment (12d)",  amount:"+₹12,500", type:"credit" },
    { label:"Reimbursements",          amount:"+₹5,000",  type:"credit" },
    { label:"Deductions",              amount:"−₹2,000",  type:"debit"  },
  ];

  const close = () => setModal(null);

  return (
    <div style={{ fontFamily:"'Nunito','DM Sans',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:none} }
        @keyframes popIn  { from{opacity:0;transform:scale(0.92)} to{opacity:1;transform:scale(1)} }
        @keyframes shimBar{ from{width:0} to{width:var(--w)} }
      `}</style>

      <div style={{ display:"flex", flexDirection:"column", gap:18 }}>

        {/* ── HERO BANNER ───────────────────────────────────────────────────── */}
        <div style={{
          borderRadius:20, overflow:"hidden",
          background:"linear-gradient(135deg,#1e293b 0%,#0f172a 100%)",
          boxShadow:"0 8px 40px rgba(0,0,0,0.18)",
          animation:"fadeUp 0.4s ease both",
        }}>
          {/* Top section */}
          <div style={{ padding:"24px 28px 20px", display:"flex", alignItems:"flex-start", justifyContent:"space-between", flexWrap:"wrap", gap:16 }}>
            <div>
              <div style={{ fontSize:11, fontWeight:800, letterSpacing:"0.12em", color:"rgba(255,255,255,0.4)", textTransform:"uppercase", marginBottom:6 }}>Notice Period</div>
              <div style={{ fontSize:26, fontWeight:900, color:"#fff", letterSpacing:"-0.5px", lineHeight:1 }}>Active · Running</div>
              <div style={{ fontSize:13, color:"rgba(255,255,255,0.45)", marginTop:6 }}>
                {startDate} → <span style={{ color:"rgba(255,255,255,0.7)", fontWeight:700 }}>{lastWorkDay}</span>
              </div>
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontSize:52, fontWeight:900, color:ACCENT, lineHeight:1, letterSpacing:"-2px" }}>{remaining}</div>
              <div style={{ fontSize:12, color:"rgba(255,255,255,0.4)", marginTop:2 }}>days remaining</div>
              <div style={{ fontSize:11.5, color:"rgba(255,255,255,0.3)", marginTop:1 }}>of {totalDays}-day notice</div>
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ padding:"0 28px 20px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", fontSize:11.5, color:"rgba(255,255,255,0.35)", marginBottom:7, fontWeight:600 }}>
              <span>Day {elapsed}</span>
              <span>{noticePct}% elapsed</span>
              <span>Day {totalDays}</span>
            </div>
            <div style={{ height:8, background:"rgba(255,255,255,0.1)", borderRadius:99, overflow:"hidden" }}>
              <div style={{
                height:"100%", borderRadius:99,
                background:`linear-gradient(90deg,${ACCENT},#fb923c)`,
                width:`${noticePct}%`, transition:"width 1s ease",
              }} />
            </div>
          </div>

          {/* Action buttons strip */}
          <div style={{
            padding:"14px 28px", borderTop:"1px solid rgba(255,255,255,0.07)",
            display:"flex", gap:10, flexWrap:"wrap",
          }}>
            {[
              { label:"Request Early Release", key:"early",  accent:true  },
              { label:"Notice Buyout",          key:"buyout", accent:false },
              { label:"Cancel Resignation",     key:"cancel", accent:false, danger:true },
            ].map(btn => (
              <button key={btn.key} onClick={()=>setModal(btn.key)}
                style={{
                  padding:"8px 18px", borderRadius:10, border:"none", cursor:"pointer",
                  fontSize:12.5, fontWeight:700, transition:"all 0.15s",
                  background: btn.accent ? ACCENT : btn.danger ? "rgba(239,68,68,0.12)" : "rgba(255,255,255,0.08)",
                  color: btn.accent ? "#fff" : btn.danger ? "#f87171" : "rgba(255,255,255,0.7)",
                  border: btn.accent ? "none" : btn.danger ? "1px solid rgba(239,68,68,0.25)" : "1px solid rgba(255,255,255,0.1)",
                }}>
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── MAIN GRID ─────────────────────────────────────────────────────── */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 340px", gap:18, alignItems:"start" }}>

          {/* LEFT COLUMN */}
          <div style={{ display:"flex", flexDirection:"column", gap:18 }}>

            {/* Exit Formalities */}
            <div style={{
              background:"#fff", borderRadius:16, border:"1px solid #f1f5f9",
              overflow:"hidden", boxShadow:"0 2px 16px rgba(0,0,0,0.05)",
              animation:"fadeUp 0.45s ease 0.1s both",
            }}>
              {/* Header */}
              <div style={{ padding:"16px 22px", borderBottom:"1px solid #f1f5f9", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <div style={{ fontSize:14, fontWeight:800, color:"#111827" }}>Exit Formalities</div>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <span style={{ fontSize:12, fontWeight:700, color:"#9ca3af" }}>{doneCount}/{formalities.length}</span>
                  <div style={{ width:80, height:5, borderRadius:99, background:"#f3f4f6", overflow:"hidden" }}>
                    <div style={{ width:`${progress}%`, height:"100%", background:`linear-gradient(90deg,${ACCENT},#fb923c)`, borderRadius:99, transition:"width 0.5s" }} />
                  </div>
                  <span style={{ fontSize:12, fontWeight:800, color:ACCENT }}>{progress}%</span>
                </div>
              </div>

              {/* Items */}
              <div>
                {formalities.map((f, i) => (
                  <div key={f.id} style={{
                    display:"flex", alignItems:"center", justifyContent:"space-between",
                    padding:"14px 22px",
                    borderBottom: i < formalities.length - 1 ? "1px solid #f9fafb" : "none",
                    background: f.done ? "#f0fdf4" : "#fff",
                    transition:"background 0.2s",
                    animation:`fadeUp 0.4s ease ${0.1 + i * 0.06}s both`,
                  }}>
                    <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                      <div style={{
                        width:32, height:32, borderRadius:9, flexShrink:0,
                        background: f.done ? "#dcfce7" : "#f9fafb",
                        border: `1.5px solid ${f.done ? "#86efac" : "#e5e7eb"}`,
                        display:"flex", alignItems:"center", justifyContent:"center",
                      }}>
                        {f.done
                          ? <Icon d={IC.check} stroke="#16a34a" size={15} sw={2.5} />
                          : <Icon d={IC.clock} stroke="#d1d5db" size={14} />}
                      </div>
                      <span style={{ fontSize:13.5, fontWeight:600, color: f.done ? "#6b7280" : "#111827", textDecoration: f.done ? "line-through" : "none" }}>
                        {f.name}
                      </span>
                    </div>

                    {f.done ? (
                      <span style={{ fontSize:12, fontWeight:700, color:"#16a34a" }}>✓ Done</span>
                    ) : (
                      <button
                        onClick={() => f.special ? setModal("exit") : markDone(f.id)}
                        style={{
                          padding:"6px 16px", borderRadius:8, border:"none", cursor:"pointer",
                          background:`${ACCENT}14`, color:ACCENT,
                          fontSize:12.5, fontWeight:700, transition:"all 0.15s",
                        }}
                        onMouseEnter={e=>{ e.currentTarget.style.background=ACCENT; e.currentTarget.style.color="#fff"; }}
                        onMouseLeave={e=>{ e.currentTarget.style.background=`${ACCENT}14`; e.currentTarget.style.color=ACCENT; }}
                      >
                        {f.special ? "Open Form" : "Mark Done"}
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Company actions — read-only */}
              <div style={{ padding:"12px 22px", borderTop:"1px solid #f1f5f9", background:"#fafafa" }}>
                <div style={{ fontSize:11, fontWeight:800, color:"#9ca3af", letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:10 }}>Pending from Company</div>
                <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
                  {["Access Revocation","Full & Final Settlement","Experience Letter","Relieving Letter"].map((name, i) => (
                    <div key={i} style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <div style={{ width:5, height:5, borderRadius:"50%", background:"#e5e7eb" }} />
                        <span style={{ fontSize:12.5, color:"#6b7280" }}>{name}</span>
                      </div>
                      <span style={{ fontSize:11.5, fontWeight:600, color:"#d97706", background:"#fefce8", padding:"2px 8px", borderRadius:99 }}>Awaiting</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Full & Final Settlement */}
            <div style={{
              background:"#fff", borderRadius:16, border:"1px solid #f1f5f9",
              overflow:"hidden", boxShadow:"0 2px 16px rgba(0,0,0,0.05)",
              animation:"fadeUp 0.45s ease 0.2s both",
            }}>
              <div style={{ padding:"16px 22px", borderBottom:"1px solid #f1f5f9" }}>
                <div style={{ fontSize:14, fontWeight:800, color:"#111827" }}>Full & Final Settlement</div>
                <div style={{ fontSize:12, color:"#9ca3af", marginTop:2 }}>Expected by Jun 15, 2025</div>
              </div>
              <div style={{ padding:"4px 0" }}>
                {settlement.map((row, i) => (
                  <div key={i} style={{
                    display:"flex", justifyContent:"space-between", alignItems:"center",
                    padding:"12px 22px",
                    borderBottom: i < settlement.length - 1 ? "1px solid #f9fafb" : "none",
                  }}>
                    <span style={{ fontSize:13.5, color:"#6b7280" }}>{row.label}</span>
                    <span style={{
                      fontSize:14, fontWeight:800,
                      color: row.type === "credit" ? "#16a34a" : row.type === "debit" ? "#dc2626" : "#111827",
                    }}>{row.amount}</span>
                  </div>
                ))}
              </div>
              <div style={{
                margin:"0 16px 16px", borderRadius:12,
                background:`linear-gradient(135deg,${ACCENT}15,${ACCENT}08)`,
                border:`1.5px solid ${ACCENT}33`,
                padding:"14px 18px",
                display:"flex", justifyContent:"space-between", alignItems:"center",
              }}>
                <span style={{ fontSize:14, fontWeight:800, color:"#111827" }}>Net Payable</span>
                <span style={{ fontSize:26, fontWeight:900, color:ACCENT, letterSpacing:"-0.5px" }}>₹90,500</span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div style={{ display:"flex", flexDirection:"column", gap:18 }}>

            {/* Documents */}
            <div style={{
              background:"#fff", borderRadius:16, border:"1px solid #f1f5f9",
              overflow:"hidden", boxShadow:"0 2px 16px rgba(0,0,0,0.05)",
              animation:"fadeUp 0.45s ease 0.15s both",
            }}>
              <div style={{ padding:"14px 18px", borderBottom:"1px solid #f1f5f9" }}>
                <div style={{ fontSize:14, fontWeight:800, color:"#111827" }}>Documents</div>
                <div style={{ fontSize:12, color:"#9ca3af", marginTop:1 }}>
                  {docs.filter(d=>d.status==="ready").length}/{docs.length} available
                </div>
              </div>
              <div>
                {docs.map((doc, i) => (
                  <div key={i} style={{
                    display:"flex", alignItems:"center", justifyContent:"space-between",
                    padding:"11px 18px",
                    borderBottom: i < docs.length - 1 ? "1px solid #f9fafb" : "none",
                    gap:10,
                  }}>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:12.5, fontWeight:600, color: doc.status==="ready" ? "#111827" : "#9ca3af", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                        {doc.name}
                      </div>
                      {doc.date && <div style={{ fontSize:11, color:"#9ca3af", marginTop:1 }}>{doc.date}</div>}
                      {doc.expected && <div style={{ fontSize:11, color:"#d97706", marginTop:1 }}>Expected: {doc.expected}</div>}
                    </div>
                    {doc.status === "ready" ? (
                      <button style={{
                        display:"flex", alignItems:"center", gap:5, padding:"5px 10px",
                        background:"#f0fdf4", border:"1px solid #bbf7d0",
                        borderRadius:7, fontSize:11.5, fontWeight:700, color:"#16a34a", cursor:"pointer",
                        flexShrink:0,
                      }}>
                        <Icon d={IC.download} size={11} stroke="#16a34a" />Download
                      </button>
                    ) : (
                      <span style={{ fontSize:11, fontWeight:700, color:"#d1d5db", flexShrink:0 }}>Pending</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Quick info card */}
            <div style={{
              background:"linear-gradient(135deg,#1e293b,#334155)",
              borderRadius:16, padding:"18px",
              animation:"fadeUp 0.45s ease 0.25s both",
            }}>
              <div style={{ fontSize:11, fontWeight:800, color:"rgba(255,255,255,0.4)", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:14 }}>Notice Summary</div>
              {[
                { label:"Notice Period",   value:"60 days" },
                { label:"Started",         value:startDate },
                { label:"Last Working Day",value:lastWorkDay },
                { label:"Days Elapsed",    value:`${elapsed} days` },
                { label:"Days Remaining",  value:`${remaining} days` },
              ].map((row, i) => (
                <div key={i} style={{
                  display:"flex", justifyContent:"space-between", alignItems:"center",
                  padding:"8px 0",
                  borderBottom: i < 4 ? "1px solid rgba(255,255,255,0.06)" : "none",
                }}>
                  <span style={{ fontSize:12.5, color:"rgba(255,255,255,0.45)" }}>{row.label}</span>
                  <span style={{ fontSize:12.5, fontWeight:800, color: i === 4 ? ACCENT : "rgba(255,255,255,0.85)" }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          MODALS
      ════════════════════════════════════════════════════════════════════════ */}

      {/* Early Release */}
      <Modal show={modal==="early"} onClose={close}>
        <ModalHeader title="Request Early Release" sub="Submit to HR for approval" onClose={close} />
        <div style={{ padding:"20px 22px", display:"flex", flexDirection:"column", gap:14 }}>
          <div>
            <label style={{ fontSize:12, fontWeight:700, color:"#374151", marginBottom:6, display:"block" }}>Proposed Last Working Day</label>
            <input type="date" value={earlyDate} onChange={e=>setEarlyDate(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize:12, fontWeight:700, color:"#374151", marginBottom:6, display:"block" }}>Reason for Request</label>
            <textarea value={earlyReason} onChange={e=>setEarlyReason(e.target.value)} rows={3} placeholder="Briefly explain your reason…"
              style={{ ...inputStyle, resize:"none", lineHeight:1.6 }} />
          </div>
        </div>
        <div style={{ padding:"12px 22px 20px", display:"flex", gap:8, justifyContent:"flex-end" }}>
          <button onClick={close} style={{ padding:"8px 18px", background:"#f9fafb", border:"1px solid #e5e7eb", borderRadius:9, fontSize:13, fontWeight:600, color:"#374151", cursor:"pointer" }}>Cancel</button>
          <button onClick={()=>{ close(); alert("Request submitted to HR"); }} style={{ padding:"8px 20px", background:ACCENT, border:"none", borderRadius:9, fontSize:13, fontWeight:700, color:"#fff", cursor:"pointer" }}>Submit Request</button>
        </div>
      </Modal>

      {/* Buyout */}
      <Modal show={modal==="buyout"} onClose={close}>
        <ModalHeader title="Notice Period Buyout" sub="Pay to exit before notice ends" color="#8b5cf6" onClose={close} />
        <div style={{ padding:"20px 22px" }}>
          <div style={{
            borderRadius:14, background:"#f5f3ff", border:"1.5px solid #ddd6fe",
            padding:"20px", textAlign:"center", marginBottom:18,
          }}>
            <div style={{ fontSize:11, fontWeight:800, color:"#7c3aed", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:6 }}>Estimated Buyout Amount</div>
            <div style={{ fontSize:40, fontWeight:900, color:"#7c3aed", letterSpacing:"-1px" }}>{buyoutAmount}</div>
            <div style={{ fontSize:12, color:"#9ca3af", marginTop:4 }}>For {remaining} remaining days</div>
          </div>
          <div style={{ fontSize:12.5, color:"#6b7280", lineHeight:1.7, background:"#fafafa", borderRadius:10, padding:"12px 14px" }}>
            Buyout allows you to leave before your notice period ends by compensating the company equivalent to the remaining days' salary. HR will confirm the final amount.
          </div>
        </div>
        <div style={{ padding:"0 22px 20px", display:"flex", gap:8, justifyContent:"flex-end" }}>
          <button onClick={close} style={{ padding:"8px 18px", background:"#f9fafb", border:"1px solid #e5e7eb", borderRadius:9, fontSize:13, fontWeight:600, color:"#374151", cursor:"pointer" }}>Cancel</button>
          <button onClick={()=>{ close(); alert("Buyout request submitted"); }} style={{ padding:"8px 20px", background:"#7c3aed", border:"none", borderRadius:9, fontSize:13, fontWeight:700, color:"#fff", cursor:"pointer" }}>Request Buyout</button>
        </div>
      </Modal>

      {/* Cancel Resignation */}
      <Modal show={modal==="cancel"} onClose={close}>
        <ModalHeader title="Cancel Resignation" sub="You have 7 days to reverse this" color="#dc2626" onClose={close} />
        <div style={{ padding:"20px 22px", display:"flex", flexDirection:"column", gap:14 }}>
          <div style={{ background:"#fef2f2", border:"1px solid #fecaca", borderRadius:10, padding:"12px 14px", fontSize:12.5, color:"#991b1b", lineHeight:1.6 }}>
            ⚠️ Cancelling your resignation will withdraw your exit from the system. Your manager and HR will be notified.
          </div>
          <div>
            <label style={{ fontSize:12, fontWeight:700, color:"#374151", marginBottom:6, display:"block" }}>Reason (optional)</label>
            <textarea value={cancelReason} onChange={e=>setCancelReason(e.target.value)} rows={2} placeholder="Why are you reconsidering?"
              style={{ ...inputStyle, resize:"none", lineHeight:1.6 }} />
          </div>
        </div>
        <div style={{ padding:"0 22px 20px", display:"flex", gap:8, justifyContent:"flex-end" }}>
          <button onClick={close} style={{ padding:"8px 18px", background:"#f9fafb", border:"1px solid #e5e7eb", borderRadius:9, fontSize:13, fontWeight:600, color:"#374151", cursor:"pointer" }}>Keep Resignation</button>
          <button onClick={()=>{ close(); alert("Cancellation submitted"); }} style={{ padding:"8px 20px", background:"#dc2626", border:"none", borderRadius:9, fontSize:13, fontWeight:700, color:"#fff", cursor:"pointer" }}>Confirm Cancel</button>
        </div>
      </Modal>

      {/* Exit Interview */}
      <Modal show={modal==="exit"} onClose={close}>
        <ModalHeader title="Exit Interview" sub="Your feedback is confidential" onClose={close} />
        <div style={{ padding:"20px 22px", display:"flex", flexDirection:"column", gap:14 }}>
          <div>
            <label style={{ fontSize:12, fontWeight:700, color:"#374151", marginBottom:6, display:"block" }}>Primary reason for leaving</label>
            <select value={exitReason} onChange={e=>setExitReason(e.target.value)} style={{ ...inputStyle }}>
              <option value="">Select a reason…</option>
              {["Better opportunity","Higher salary","Work-life balance","Relocation","Personal reasons","Career change"].map(r => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ fontSize:12, fontWeight:700, color:"#374151", marginBottom:6, display:"block" }}>Additional feedback</label>
            <textarea value={exitFeedback} onChange={e=>setExitFeedback(e.target.value)} rows={4}
              placeholder="Suggestions, what you liked, what could be better…"
              style={{ ...inputStyle, resize:"none", lineHeight:1.6 }} />
          </div>
        </div>
        <div style={{ padding:"0 22px 20px", display:"flex", gap:8, justifyContent:"flex-end" }}>
          <button onClick={close} style={{ padding:"8px 18px", background:"#f9fafb", border:"1px solid #e5e7eb", borderRadius:9, fontSize:13, fontWeight:600, color:"#374151", cursor:"pointer" }}>Cancel</button>
          <button onClick={submitExit} disabled={!exitReason}
            style={{ padding:"8px 20px", background:exitReason?ACCENT:"#e5e7eb", border:"none", borderRadius:9, fontSize:13, fontWeight:700, color:exitReason?"#fff":"#9ca3af", cursor:exitReason?"pointer":"not-allowed" }}>
            Submit Interview
          </button>
        </div>
      </Modal>
    </div>
  );
}