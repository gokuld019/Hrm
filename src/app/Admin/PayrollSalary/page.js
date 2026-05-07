"use client";
import React, { useState, useCallback, useEffect } from "react";

const ACCENT = "#f97316";
const DEPARTMENTS = ["All","Engineering","Design","Finance","HR","Marketing","Sales","Operations"];
const BASE_URL = "https://api.pencilkraft.in/api/admin";

// ── AUTH ──────────────────────────────────────────────────────────────────────
function getHeaders() {
  if (typeof window === "undefined") return { "Content-Type": "application/json" };
  const token     = localStorage.getItem("admin_auth_token") || "";
  const companyId = localStorage.getItem("company_id")     || "";
  return {
    "Content-Type": "application/json",
    ...(token     && { "Authorization": `Bearer ${token}` }),
    ...(companyId && { "X-Company-ID": companyId }),
  };
}

// ── RAW API ───────────────────────────────────────────────────────────────────
const api = {
  getComponents:   ()      => fetch(`${BASE_URL}/payroll-components`,       { headers:getHeaders() }).then(r=>r.json()),
  createComponent: (b)     => fetch(`${BASE_URL}/payroll-components`,       { method:"POST",   headers:getHeaders(), body:JSON.stringify(b) }).then(r=>r.json()),
  updateComponent: (id,b)  => fetch(`${BASE_URL}/payroll-components/${id}`, { method:"PUT",    headers:getHeaders(), body:JSON.stringify(b) }).then(r=>r.json()),
  deleteComponent: (id)    => fetch(`${BASE_URL}/payroll-components/${id}`, { method:"DELETE", headers:getHeaders() }).then(r=>r.json()),

  getDeductions:   ()      => fetch(`${BASE_URL}/payroll-deductions`,       { headers:getHeaders() }).then(r=>r.json()),
  createDeduction: (b)     => fetch(`${BASE_URL}/payroll-deductions`,       { method:"POST",   headers:getHeaders(), body:JSON.stringify(b) }).then(r=>r.json()),
  updateDeduction: (id,b)  => fetch(`${BASE_URL}/payroll-deductions/${id}`, { method:"PUT",    headers:getHeaders(), body:JSON.stringify(b) }).then(r=>r.json()),
  deleteDeduction: (id)    => fetch(`${BASE_URL}/payroll-deductions/${id}`, { method:"DELETE", headers:getHeaders() }).then(r=>r.json()),

  getStructures:   ()      => fetch(`${BASE_URL}/salary-structures`,        { headers:getHeaders() }).then(r=>r.json()),
  createStructure: (b)     => fetch(`${BASE_URL}/salary-structures`,        { method:"POST",   headers:getHeaders(), body:JSON.stringify(b) }).then(r=>r.json()),
  updateStructure: (id,b)  => fetch(`${BASE_URL}/salary-structures/${id}`,  { method:"PUT",    headers:getHeaders(), body:JSON.stringify(b) }).then(r=>r.json()),
  deleteStructure: (id)    => fetch(`${BASE_URL}/salary-structures/${id}`,  { method:"DELETE", headers:getHeaders() }).then(r=>r.json()),

  getDashboardStats: (year) => fetch(`${BASE_URL}/payroll/dashboard-stats?year=${year}`, { headers:getHeaders() }).then(r=>r.json()),
};

// ── MONTH NAME MAP ─────────────────────────────────────────────────────────────
const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// ── CALC TYPES ────────────────────────────────────────────────────────────────
const CALC_TYPES = [
  { value:"fixed",               label:"Fixed ₹/month"  },
  { value:"percentage_of_basic", label:"% of Basic"     },
  { value:"percentage_of_gross", label:"% of Gross"     },
];
function calcLabel(t){ return CALC_TYPES.find(o=>o.value===t)?.label || t || "—"; }

// ── MOCK DATA (Employee Salary tab) ───────────────────────────────────────────
const MOCK_EMPLOYEES = [
  { id:"EMP-001", name:"Arjun Sharma",    dept:"Engineering", role:"Senior Developer",   gross:85000, deduction:8500,  net:76500, tax:6200, pf:3400, paid_days:22, work_days:22, status:"Paid",    joining:"12 Sep 2022", bank:"HDFC ****4521", salaryGrade:"High"   },
  { id:"EMP-002", name:"Priya Nair",      dept:"Design",      role:"UI/UX Designer",     gross:72000, deduction:7200,  net:64800, tax:5100, pf:2880, paid_days:20, work_days:22, status:"Paid",    joining:"08 Mar 2023", bank:"SBI ****7823",  salaryGrade:"Medium" },
  { id:"EMP-003", name:"Rahul Mehta",     dept:"Finance",     role:"Financial Analyst",  gross:68000, deduction:6800,  net:61200, tax:4800, pf:2720, paid_days:22, work_days:22, status:"Pending", joining:"15 Jan 2023", bank:"ICICI ****3341",salaryGrade:"Medium" },
  { id:"EMP-004", name:"Sneha Iyer",      dept:"HR",          role:"HR Manager",         gross:75000, deduction:7500,  net:67500, tax:5500, pf:3000, paid_days:21, work_days:22, status:"Paid",    joining:"20 Jul 2021", bank:"Axis ****9912", salaryGrade:"Medium" },
  { id:"EMP-005", name:"Vikram Pillai",   dept:"Engineering", role:"DevOps Engineer",    gross:90000, deduction:9000,  net:81000, tax:6800, pf:3600, paid_days:22, work_days:22, status:"Paid",    joining:"03 Nov 2022", bank:"HDFC ****2234", salaryGrade:"High"   },
  { id:"EMP-006", name:"Kavya Reddy",     dept:"Marketing",   role:"Marketing Lead",     gross:65000, deduction:6500,  net:58500, tax:4500, pf:2600, paid_days:19, work_days:22, status:"Unpaid",  joining:"25 Apr 2023", bank:"SBI ****5567",  salaryGrade:"Medium" },
  { id:"EMP-007", name:"Arun Kumar",      dept:"Engineering", role:"Backend Developer",  gross:78000, deduction:7800,  net:70200, tax:5700, pf:3120, paid_days:22, work_days:22, status:"Paid",    joining:"11 Feb 2022", bank:"ICICI ****8810",salaryGrade:"Medium" },
  { id:"EMP-008", name:"Divya Menon",     dept:"Sales",       role:"Sales Executive",    gross:60000, deduction:6000,  net:54000, tax:4200, pf:2400, paid_days:18, work_days:22, status:"Pending", joining:"30 Aug 2023", bank:"Kotak ****1122",salaryGrade:"Basic"  },
  { id:"EMP-009", name:"Suresh Babu",     dept:"Design",      role:"Graphic Designer",   gross:58000, deduction:5800,  net:52200, tax:4000, pf:2320, paid_days:22, work_days:22, status:"Paid",    joining:"17 Oct 2023", bank:"HDFC ****6634", salaryGrade:"Basic"  },
  { id:"EMP-010", name:"Ananya Krishnan", dept:"HR",          role:"HR Executive",       gross:55000, deduction:5500,  net:49500, tax:3800, pf:2200, paid_days:21, work_days:22, status:"Paid",    joining:"05 Dec 2023", bank:"SBI ****3398",  salaryGrade:"Basic"  },
  { id:"EMP-011", name:"Mohan Das",       dept:"Operations",  role:"Ops Manager",        gross:80000, deduction:8000,  net:72000, tax:5900, pf:3200, paid_days:22, work_days:22, status:"Paid",    joining:"14 Jun 2021", bank:"ICICI ****7745",salaryGrade:"High"   },
  { id:"EMP-012", name:"Lakshmi Patel",   dept:"Finance",     role:"Sr. Accountant",     gross:70000, deduction:7000,  net:63000, tax:5000, pf:2800, paid_days:20, work_days:22, status:"Pending", joining:"22 Jan 2022", bank:"Axis ****4401", salaryGrade:"Medium" },
  { id:"EMP-013", name:"Ravi Shankar",    dept:"Engineering", role:"Frontend Developer", gross:73000, deduction:7300,  net:65700, tax:5200, pf:2920, paid_days:22, work_days:22, status:"Paid",    joining:"09 Sep 2022", bank:"HDFC ****8823", salaryGrade:"Medium" },
  { id:"EMP-014", name:"Meena Joshi",     dept:"Marketing",   role:"Content Writer",     gross:52000, deduction:5200,  net:46800, tax:3500, pf:2080, paid_days:22, work_days:22, status:"Unpaid",  joining:"18 Mar 2024", bank:"SBI ****9901",  salaryGrade:"Basic"  },
  { id:"EMP-015", name:"Deepak Singh",    dept:"Sales",       role:"Business Developer", gross:82000, deduction:8200,  net:73800, tax:6100, pf:3280, paid_days:21, work_days:22, status:"Paid",    joining:"27 Nov 2022", bank:"Kotak ****2278",salaryGrade:"High"   },
];

const SALARY_GRADE_TEMPLATES = {
  basic:  { basicPct:60, hraPct:20, conveyancePct:5, medicalPct:3,  specialPct:7, bonusPct:5 },
  medium: { basicPct:55, hraPct:22, conveyancePct:6, medicalPct:4,  specialPct:8, bonusPct:5 },
  high:   { basicPct:50, hraPct:25, conveyancePct:5, medicalPct:5,  specialPct:8, bonusPct:7 },
  Basic:  { basicPct:60, hraPct:20, conveyancePct:5, medicalPct:3,  specialPct:7, bonusPct:5 },
  Medium: { basicPct:55, hraPct:22, conveyancePct:6, medicalPct:4,  specialPct:8, bonusPct:5 },
  High:   { basicPct:50, hraPct:25, conveyancePct:5, medicalPct:5,  specialPct:8, bonusPct:7 },
};

// ── HELPERS ───────────────────────────────────────────────────────────────────
const fmt = (n) => "₹" + Number(n).toLocaleString("en-IN");
function fmtShort(n) {
  if (n >= 10000000) return "₹" + (n/10000000).toFixed(1) + "Cr";
  if (n >= 100000)   return "₹" + (n/100000).toFixed(1) + "L";
  if (n >= 1000)     return "₹" + (n/1000).toFixed(0) + "K";
  return "₹" + n;
}
const COMP_COLORS = ["#16a34a","#3b82f6","#06b6d4","#8b5cf6","#f59e0b","#ec4899","#ef4444","#6366f1","#14b8a6","#f97316"];
const AV_COLORS   = ["#6366f1","#f97316","#14b8a6","#ec4899","#22c55e","#a855f7","#3b82f6","#eab308","#ef4444","#06b6d4"];
function avatarBg(name){ let h=0; for(let i=0;i<name.length;i++) h=(h*31+name.charCodeAt(i))&0xffffffff; return AV_COLORS[Math.abs(h)%AV_COLORS.length]; }
function compColor(idx){ return COMP_COLORS[idx % COMP_COLORS.length]; }

// ── BASE COMPONENTS ───────────────────────────────────────────────────────────
function Avatar({ name="?", size=34 }) {
  const initials = name.split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase();
  return <div style={{width:size,height:size,borderRadius:"50%",background:avatarBg(name),display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.33,fontWeight:800,color:"#fff",flexShrink:0,letterSpacing:"-0.5px",fontFamily:"Nunito,sans-serif"}}>{initials}</div>;
}

const STATUS_CFG = {
  Paid:    {bg:"#f0fdf4",color:"#16a34a",border:"#bbf7d0",dot:"#22c55e"},
  Pending: {bg:"#fffbeb",color:"#d97706",border:"#fde68a",dot:"#f59e0b"},
  Unpaid:  {bg:"#fef2f2",color:"#dc2626",border:"#fecaca",dot:"#ef4444"},
};
function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status]||STATUS_CFG.Pending;
  return <span style={{display:"inline-flex",alignItems:"center",gap:5,padding:"3px 10px",borderRadius:20,background:cfg.bg,border:`1px solid ${cfg.border}`,fontSize:11.5,fontWeight:800,color:cfg.color,whiteSpace:"nowrap"}}><span style={{width:6,height:6,borderRadius:"50%",background:cfg.dot}}/>{status}</span>;
}

const GRADE_CFG = {
  basic:  {bg:"#f0fdf4",color:"#16a34a",border:"#bbf7d0",label:"Basic"},
  medium: {bg:"#fffbeb",color:"#b45309",border:"#fde68a",label:"Medium"},
  high:   {bg:"#eef2ff",color:"#4f46e5",border:"#c7d2fe",label:"High"},
  Basic:  {bg:"#f0fdf4",color:"#16a34a",border:"#bbf7d0",label:"Basic"},
  Medium: {bg:"#fffbeb",color:"#b45309",border:"#fde68a",label:"Medium"},
  High:   {bg:"#eef2ff",color:"#4f46e5",border:"#c7d2fe",label:"High"},
};
function GradeBadge({ grade }) {
  const cfg = GRADE_CFG[grade]||GRADE_CFG.Basic;
  return <span style={{padding:"2px 8px",borderRadius:99,background:cfg.bg,border:`1px solid ${cfg.border}`,fontSize:10.5,fontWeight:800,color:cfg.color}}>{cfg.label}</span>;
}

const DEPT_COLORS = {Engineering:"#eef2ff|#4f46e5",Design:"#fdf2f8|#be185d",Finance:"#fff7ed|#c2410c",HR:"#f0fdf4|#15803d",Marketing:"#fef9c3|#a16207",Sales:"#f0fdfa|#0f766e",Operations:"#f8fafc|#475569"};
function DeptBadge({ dept }) {
  const [bg,color] = (DEPT_COLORS[dept]||"#f3f4f6|#374151").split("|");
  return <span style={{padding:"2px 9px",borderRadius:20,background:bg,fontSize:11,fontWeight:700,color,whiteSpace:"nowrap"}}>{dept}</span>;
}

const Ic = ({ d, size=14, stroke="currentColor", fill="none", sw=1.8, style={} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={{display:"block",flexShrink:0,...style}}>
    {Array.isArray(d)?d.map((p,i)=><path key={i} d={p}/>):<path d={d}/>}
  </svg>
);

const ICONS = {
  search:   "M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z",
  download: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M7 10l5 5 5-5 M12 15V3",
  plus:     "M12 5v14M5 12h14",
  edit:     "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7 M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z",
  trash:    "M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6",
  chevLeft: "M15 18l-6-6 6-6",
  chevRight:"M9 18l6-6-6-6",
  fileText: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6M16 13H8M16 17H8M10 9H8",
  trending: "M23 6l-9.5 9.5-5-5L1 18 M17 6h6v6",
  wallet:   "M21 12V7H5a2 2 0 0 1 0-4h14v4 M3 5v14a2 2 0 0 0 2 2h16v-5 M18 12a2 2 0 0 0 0 4h4v-4z",
  users:    "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  check:    "M20 6L9 17l-5-5",
  x:        "M18 6L6 18M6 6l12 12",
  send:     "M22 2L11 13 M22 2L15 22l-4-9-9-4 22-7z",
  settings: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z",
  layers:   "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  shield:   "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  info:     "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 8h.01M12 12v4",
  sparkle:  "M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z",
  tag:      "M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z M7 7h.01",
};

function Spinner({ size=13, color="#fff" }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" style={{animation:"spin 0.8s linear infinite",display:"block",flexShrink:0}}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>;
}

function Toggle({ enabled, onChange, size="md" }) {
  const w=size==="sm"?32:42, h=size==="sm"?18:24, knob=size==="sm"?12:18, offset=3;
  return (
    <div onClick={onChange} style={{width:w,height:h,borderRadius:h,background:enabled?ACCENT:"#e5e7eb",cursor:"pointer",position:"relative",transition:"background 0.25s",flexShrink:0,boxShadow:enabled?`0 0 10px ${ACCENT}55`:"none"}}>
      <div style={{position:"absolute",top:offset,left:enabled?w-knob-offset:offset,width:knob,height:knob,borderRadius:"50%",background:"#fff",transition:"left 0.25s",boxShadow:"0 2px 6px rgba(0,0,0,0.22)"}}/>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ── COMPONENT CARD (inline edit)
// ════════════════════════════════════════════════════════════════════════════
function ComponentCard({ comp, idx, onEditApi, onDeleteApi, deleting }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft]     = useState({ name: comp.name, calculation_type: comp.calculation_type });
  const [saving, setSaving]   = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onEditApi(comp.id, draft);
    setSaving(false);
    setEditing(false);
  };

  if (editing) {
    return (
      <div style={{padding:"10px 12px",background:"#fff",borderRadius:11,border:`2px solid ${compColor(idx)}`,boxShadow:`0 0 0 3px ${compColor(idx)}22`}}>
        <div style={{display:"flex",gap:7,marginBottom:8}}>
          <input value={draft.name} onChange={e=>setDraft(p=>({...p,name:e.target.value}))}
            style={{flex:1,padding:"6px 9px",border:"1px solid #e5e7eb",borderRadius:7,fontSize:12,outline:"none",fontFamily:"Nunito,sans-serif",fontWeight:700}}
            onFocus={e=>e.target.style.borderColor=compColor(idx)} onBlur={e=>e.target.style.borderColor="#e5e7eb"}/>
          <select value={draft.calculation_type} onChange={e=>setDraft(p=>({...p,calculation_type:e.target.value}))}
            style={{padding:"6px 8px",border:"1px solid #e5e7eb",borderRadius:7,fontSize:11,outline:"none",fontFamily:"Nunito,sans-serif",fontWeight:600,cursor:"pointer"}}>
            {CALC_TYPES.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div style={{display:"flex",gap:6}}>
          <button onClick={()=>setEditing(false)} style={{flex:1,padding:"5px 0",background:"#f3f4f6",border:"none",borderRadius:7,fontSize:11.5,fontWeight:700,cursor:"pointer",fontFamily:"Nunito,sans-serif",color:"#6b7280"}}>Cancel</button>
          <button onClick={handleSave} disabled={saving||!draft.name.trim()}
            style={{flex:2,padding:"5px 0",background:saving||!draft.name.trim()?"#d1d5db":ACCENT,border:"none",borderRadius:7,fontSize:11.5,fontWeight:800,color:"#fff",cursor:saving||!draft.name.trim()?"not-allowed":"pointer",fontFamily:"Nunito,sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>
            {saving?<><Spinner size={11}/>&nbsp;Saving…</>:"Save"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{padding:"10px 12px",background:"#fafafa",borderRadius:11,border:"1px solid #f1f5f9",display:"flex",alignItems:"center",justifyContent:"space-between",transition:"all 0.15s",position:"relative"}}>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <div style={{width:10,height:10,borderRadius:3,background:compColor(idx),flexShrink:0}}/>
        <div>
          <span style={{fontSize:12.5,fontWeight:700,color:"#374151"}}>{comp.name}</span>
          <div style={{fontSize:10,color:"#9ca3af",marginTop:1,fontWeight:600}}>{calcLabel(comp.calculation_type)}</div>
        </div>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:6}}>
        <span style={{fontSize:11,fontWeight:800,color:comp.is_active?"#16a34a":"#9ca3af",background:comp.is_active?"#f0fdf4":"#f3f4f6",padding:"1px 7px",borderRadius:99,border:`1px solid ${comp.is_active?"#bbf7d0":"#e5e7eb"}`}}>
          {comp.is_active?"Active":"Inactive"}
        </span>
        <button onClick={()=>setEditing(true)} style={{width:24,height:24,background:"#fff",border:"1px solid #e5e7eb",borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
          <Ic d={ICONS.edit} stroke="#6b7280" size={10}/>
        </button>
        <button onClick={()=>onDeleteApi(comp.id)} disabled={deleting===comp.id}
          style={{width:24,height:24,background:"#fef2f2",border:"1px solid #fecaca",borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",opacity:deleting===comp.id?0.5:1}}>
          {deleting===comp.id?<Spinner size={10} color="#dc2626"/>:<Ic d={ICONS.trash} stroke="#dc2626" size={10}/>}
        </button>
      </div>
    </div>
  );
}

// ── DEDUCTION CARD ─────────────────────────────────────────────────────────────
function DeductionCard({ ded, onToggleApi, onEditApi, onDeleteApi, deleting }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft]     = useState({ name: ded.name, calculation_type: ded.calculation_type });
  const [saving, setSaving]   = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onEditApi(ded.id, { ...draft, is_active: ded.is_active });
    setSaving(false);
    setEditing(false);
  };

  return (
    <div style={{borderRadius:12,border:`1.5px solid ${ded.is_active?"#fecaca":"#f1f5f9"}`,background:ded.is_active?"#fef2f2":"#fafafa",transition:"all 0.2s",overflow:"hidden"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 14px"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <Toggle enabled={!!ded.is_active} onChange={()=>onToggleApi(ded)} size="sm"/>
          <div>
            <div style={{fontSize:13,fontWeight:700,color:ded.is_active?"#111827":"#9ca3af"}}>{ded.name}</div>
            <div style={{fontSize:11,color:ded.is_active?"#dc2626":"#9ca3af",marginTop:1,fontWeight:600}}>{calcLabel(ded.calculation_type)}</div>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:7}}>
          <button onClick={()=>setEditing(p=>!p)} style={{width:26,height:26,background:"#fff",border:"1px solid #e5e7eb",borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
            <Ic d={ICONS.edit} stroke="#6b7280" size={10}/>
          </button>
          <button onClick={()=>onDeleteApi(ded.id)} disabled={deleting===ded.id}
            style={{width:26,height:26,background:"#fef2f2",border:"1px solid #fecaca",borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",opacity:deleting===ded.id?0.5:1}}>
            {deleting===ded.id?<Spinner size={10} color="#dc2626"/>:<Ic d={ICONS.trash} stroke="#dc2626" size={10}/>}
          </button>
        </div>
      </div>
      {editing && (
        <div style={{padding:"10px 14px",borderTop:"1px solid #fde68a",background:"#fff7ed",display:"flex",flexDirection:"column",gap:8}}>
          <input value={draft.name} onChange={e=>setDraft(p=>({...p,name:e.target.value}))} placeholder="Deduction name"
            style={{width:"100%",padding:"6px 10px",border:"1.5px solid #fde68a",borderRadius:7,fontSize:12.5,fontWeight:600,outline:"none",fontFamily:"Nunito,sans-serif",boxSizing:"border-box"}}/>
          <div style={{display:"flex",gap:6}}>
            <select value={draft.calculation_type} onChange={e=>setDraft(p=>({...p,calculation_type:e.target.value}))}
              style={{flex:1,padding:"6px 8px",border:"1.5px solid #fde68a",borderRadius:7,fontSize:11.5,outline:"none",fontFamily:"Nunito,sans-serif",fontWeight:600,cursor:"pointer"}}>
              {CALC_TYPES.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <button onClick={()=>setEditing(false)} style={{padding:"6px 10px",background:"#fff",border:"1px solid #e5e7eb",borderRadius:7,fontSize:12,fontWeight:700,color:"#6b7280",cursor:"pointer",fontFamily:"Nunito,sans-serif"}}>✕</button>
            <button onClick={handleSave} disabled={saving||!draft.name.trim()}
              style={{padding:"6px 14px",background:saving?"#d1d5db":ACCENT,border:"none",borderRadius:7,fontSize:12,fontWeight:800,color:"#fff",cursor:saving?"not-allowed":"pointer",fontFamily:"Nunito,sans-serif",display:"flex",alignItems:"center",gap:5}}>
              {saving?<><Spinner size={11}/>&nbsp;Saving…</>:"Save"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── ADD COMPONENT MODAL ────────────────────────────────────────────────────────
function AddComponentModal({ onClose, onAdd }) {
  const [name, setName]   = useState("");
  const [ct,   setCt]     = useState("fixed");
  const [saving,setSaving]= useState(false);
  const [err,  setErr]    = useState("");

  const handleAdd = async () => {
    if (!name.trim()) return;
    setSaving(true); setErr("");
    try {
      const res = await api.createComponent({ name: name.trim(), calculation_type: ct });
      if (res.success!==false && res.data) { onAdd(res.data); }
      else setErr("Failed to add.");
    } catch { setErr("Network error."); }
    setSaving(false);
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",backdropFilter:"blur(8px)",zIndex:900,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:18,width:360,padding:22,boxShadow:"0 32px 80px rgba(0,0,0,0.24)",animation:"modalIn 0.22s ease"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18}}>
          <div style={{fontSize:15,fontWeight:800,color:"#111827"}}>New Component</div>
          <button onClick={onClose} style={{width:28,height:28,borderRadius:8,background:"#f3f4f6",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Ic d={ICONS.x} stroke="#6b7280" size={12}/></button>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:13}}>
          <div>
            <label style={{fontSize:11.5,fontWeight:700,color:"#374151",display:"block",marginBottom:5}}>Component Name <span style={{color:"#ef4444"}}>*</span></label>
            <input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Basic Salary"
              style={{width:"100%",padding:"9px 12px",border:"1px solid #e5e7eb",borderRadius:9,fontSize:13,outline:"none",boxSizing:"border-box",fontFamily:"Nunito,sans-serif"}}
              onFocus={e=>e.target.style.borderColor=ACCENT} onBlur={e=>e.target.style.borderColor="#e5e7eb"}/>
          </div>
          <div>
            <label style={{fontSize:11.5,fontWeight:700,color:"#374151",display:"block",marginBottom:5}}>Calculation Type</label>
            <div style={{display:"flex",gap:6}}>
              {CALC_TYPES.map(({value:v,label:l})=>(
                <button key={v} onClick={()=>setCt(v)}
                  style={{flex:1,padding:"7px 4px",borderRadius:8,border:`2px solid ${ct===v?ACCENT:"#e5e7eb"}`,background:ct===v?"#fff7ed":"#fff",fontSize:10.5,fontWeight:700,color:ct===v?ACCENT:"#9ca3af",cursor:"pointer",fontFamily:"Nunito,sans-serif"}}>
                  {l}
                </button>
              ))}
            </div>
          </div>
          {err && <div style={{fontSize:12,color:"#dc2626",fontWeight:600}}>{err}</div>}
        </div>
        <div style={{display:"flex",gap:9,marginTop:18}}>
          <button onClick={onClose} style={{flex:1,padding:"9px 0",background:"#fff",border:"1px solid #e5e7eb",borderRadius:9,fontSize:13,fontWeight:700,color:"#374151",cursor:"pointer",fontFamily:"Nunito,sans-serif"}}>Cancel</button>
          <button onClick={handleAdd} disabled={!name.trim()||saving}
            style={{flex:2,padding:"9px 0",background:name.trim()&&!saving?ACCENT:"#d1d5db",border:"none",borderRadius:9,fontSize:13,fontWeight:800,color:"#fff",cursor:name.trim()&&!saving?"pointer":"not-allowed",fontFamily:"Nunito,sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
            {saving?<><Spinner size={13}/>&nbsp;Adding…</>:<><Ic d={ICONS.plus} stroke="#fff" size={13}/> Add Component</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── ADD DEDUCTION MODAL ────────────────────────────────────────────────────────
function AddDeductionModal({ onClose, onAdd }) {
  const [name, setName]   = useState("");
  const [ct,   setCt]     = useState("fixed");
  const [saving,setSaving]= useState(false);
  const [err,  setErr]    = useState("");

  const handleAdd = async () => {
    if (!name.trim()) return;
    setSaving(true); setErr("");
    try {
      const res = await api.createDeduction({ name: name.trim(), calculation_type: ct });
      if (res.success!==false && res.data) { onAdd(res.data); }
      else setErr("Failed to add.");
    } catch { setErr("Network error."); }
    setSaving(false);
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",backdropFilter:"blur(8px)",zIndex:900,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:18,width:360,padding:22,boxShadow:"0 32px 80px rgba(0,0,0,0.24)",animation:"modalIn 0.22s ease"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18}}>
          <div style={{fontSize:15,fontWeight:800,color:"#111827"}}>New Deduction</div>
          <button onClick={onClose} style={{width:28,height:28,borderRadius:8,background:"#f3f4f6",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Ic d={ICONS.x} stroke="#6b7280" size={12}/></button>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:13}}>
          <div>
            <label style={{fontSize:11.5,fontWeight:700,color:"#374151",display:"block",marginBottom:5}}>Deduction Name <span style={{color:"#ef4444"}}>*</span></label>
            <input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Provident Fund (PF)"
              style={{width:"100%",padding:"9px 12px",border:"1px solid #e5e7eb",borderRadius:9,fontSize:13,outline:"none",boxSizing:"border-box",fontFamily:"Nunito,sans-serif"}}
              onFocus={e=>e.target.style.borderColor="#dc2626"} onBlur={e=>e.target.style.borderColor="#e5e7eb"}/>
          </div>
          <div>
            <label style={{fontSize:11.5,fontWeight:700,color:"#374151",display:"block",marginBottom:5}}>Calculation Type</label>
            <div style={{display:"flex",gap:6}}>
              {CALC_TYPES.map(({value:v,label:l})=>(
                <button key={v} onClick={()=>setCt(v)}
                  style={{flex:1,padding:"7px 4px",borderRadius:8,border:`2px solid ${ct===v?"#dc2626":"#e5e7eb"}`,background:ct===v?"#fef2f2":"#fff",fontSize:10.5,fontWeight:700,color:ct===v?"#dc2626":"#9ca3af",cursor:"pointer",fontFamily:"Nunito,sans-serif"}}>
                  {l}
                </button>
              ))}
            </div>
          </div>
          {err && <div style={{fontSize:12,color:"#dc2626",fontWeight:600}}>{err}</div>}
        </div>
        <div style={{display:"flex",gap:9,marginTop:18}}>
          <button onClick={onClose} style={{flex:1,padding:"9px 0",background:"#fff",border:"1px solid #e5e7eb",borderRadius:9,fontSize:13,fontWeight:700,color:"#374151",cursor:"pointer",fontFamily:"Nunito,sans-serif"}}>Cancel</button>
          <button onClick={handleAdd} disabled={!name.trim()||saving}
            style={{flex:2,padding:"9px 0",background:name.trim()&&!saving?"#dc2626":"#d1d5db",border:"none",borderRadius:9,fontSize:13,fontWeight:800,color:"#fff",cursor:name.trim()&&!saving?"pointer":"not-allowed",fontFamily:"Nunito,sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
            {saving?<><Spinner size={13}/>&nbsp;Adding…</>:<><Ic d={ICONS.plus} stroke="#fff" size={13}/> Add Deduction</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ── SALARY STRUCTURE MODAL
// ════════════════════════════════════════════════════════════════════════════
function SalaryStructureModal({ onClose, onSave, editItem }) {
  const isEdit = !!editItem;
  const [step,   setStep]   = useState(1);
  const [saving, setSaving] = useState(false);
  const [err,    setErr]    = useState("");

  const [allComponents,  setAllComponents]  = useState([]);
  const [allDeductions,  setAllDeductions]  = useState([]);
  const [loadingData,    setLoadingData]    = useState(true);
  const [showAddComp,    setShowAddComp]    = useState(false);
  const [showAddDed,     setShowAddDed]     = useState(false);
  const [deletingComp,   setDeletingComp]   = useState(null);
  const [deletingDed,    setDeletingDed]    = useState(null);

  const [form, setForm] = useState({
    name:        editItem?.name || "",
    grade:       editItem?.grade || "basic",
    annual_ctc:  parseFloat(editItem?.annual_ctc)  || 480000,
    monthly_ctc: parseFloat(editItem?.monthly_ctc) || 40000,
  });

  const [selComps, setSelComps] = useState(() => {
    if (!editItem?.components) return {};
    const m = {};
    editItem.components.forEach(c => {
      m[c.id] = { value: parseFloat(c.pivot?.value || 0), calculation_type: c.pivot?.calculation_type || c.calculation_type || "fixed" };
    });
    return m;
  });

  const [selDeds, setSelDeds] = useState(() => {
    if (!editItem?.deductions) return {};
    const m = {};
    editItem.deductions.forEach(d => {
      m[d.id] = { value: parseFloat(d.pivot?.value || 0), calculation_type: d.pivot?.calculation_type || d.calculation_type || "fixed" };
    });
    return m;
  });

  useEffect(() => {
    (async () => {
      setLoadingData(true);
      try {
        const [c, d] = await Promise.all([api.getComponents(), api.getDeductions()]);
        setAllComponents(Array.isArray(c) ? c : []);
        setAllDeductions(Array.isArray(d) ? d : []);
      } catch {}
      setLoadingData(false);
    })();
  }, []);

  const updateCTC = (annual) => {
    setForm(p => ({ ...p, annual_ctc: annual, monthly_ctc: Math.round(annual / 12) }));
  };

  useEffect(() => {
    const total = Object.values(selComps).reduce((s, v) => s + (v.value || 0), 0);
    if (total > 0) setForm(p => ({ ...p, monthly_ctc: total, annual_ctc: total * 12 }));
  }, [selComps]);

  const applyGrade = (grade) => {
    const tpl = SALARY_GRADE_TEMPLATES[grade] || SALARY_GRADE_TEMPLATES.basic;
    const monthly = form.monthly_ctc;
    const pcts = [tpl.basicPct, tpl.hraPct, tpl.medicalPct, tpl.conveyancePct, tpl.specialPct, tpl.bonusPct];
    const keys = Object.keys(selComps);
    const newSel = { ...selComps };
    keys.forEach((id, i) => { newSel[id] = { ...newSel[id], value: Math.round(monthly * (pcts[i] || 5) / 100) }; });
    setSelComps(newSel);
    setForm(p => ({ ...p, grade }));
  };

  const handleEditCompApi = async (id, draft) => {
    const res = await api.updateComponent(id, { name: draft.name, calculation_type: draft.calculation_type });
    if (res.data) setAllComponents(prev => prev.map(c => c.id === id ? res.data : c));
  };
  const handleDeleteCompApi = async (id) => {
    setDeletingComp(id);
    await api.deleteComponent(id);
    setAllComponents(prev => prev.filter(c => c.id !== id));
    setSelComps(prev => { const n = {...prev}; delete n[id]; return n; });
    setDeletingComp(null);
  };
  const handleAddCompDone = (newComp) => { setAllComponents(prev => [...prev, newComp]); setShowAddComp(false); };

  const handleToggleDedApi = async (ded) => {
    const updated = { ...ded, is_active: !ded.is_active };
    setAllDeductions(prev => prev.map(d => d.id === ded.id ? updated : d));
    try { await api.updateDeduction(ded.id, { is_active: !ded.is_active }); }
    catch { setAllDeductions(prev => prev.map(d => d.id === ded.id ? ded : d)); }
  };
  const handleEditDedApi = async (id, draft) => {
    const res = await api.updateDeduction(id, { name: draft.name, calculation_type: draft.calculation_type, is_active: draft.is_active });
    if (res.data) setAllDeductions(prev => prev.map(d => d.id === id ? res.data : d));
  };
  const handleDeleteDedApi = async (id) => {
    setDeletingDed(id);
    await api.deleteDeduction(id);
    setAllDeductions(prev => prev.filter(d => d.id !== id));
    setSelDeds(prev => { const n = {...prev}; delete n[id]; return n; });
    setDeletingDed(null);
  };
  const handleAddDedDone = (newDed) => { setAllDeductions(prev => [...prev, newDed]); setShowAddDed(false); };

  const toggleComp = (comp) => {
    setSelComps(prev => {
      if (prev[comp.id]) { const n = {...prev}; delete n[comp.id]; return n; }
      return { ...prev, [comp.id]: { value: 0, calculation_type: comp.calculation_type || "fixed" } };
    });
  };

  const updateSelComp = (changedId, field, val) => {
    if (field !== "value") {
      setSelComps(prev => ({ ...prev, [changedId]: { ...prev[changedId], [field]: val } }));
      return;
    }
    const changedValue = Number(val);
    const monthly = form.monthly_ctc;
    const remaining = Math.max(0, monthly - changedValue);
    const otherIds = Object.keys(selComps).filter(k => k !== String(changedId));
    if (otherIds.length === 0) {
      setSelComps(prev => ({ ...prev, [changedId]: { ...prev[changedId], value: changedValue } }));
      return;
    }
    const tpl = SALARY_GRADE_TEMPLATES[form.grade] || SALARY_GRADE_TEMPLATES.basic;
    const gradePcts = [tpl.basicPct, tpl.hraPct, tpl.conveyancePct, tpl.medicalPct, tpl.specialPct, tpl.bonusPct];
    const otherPcts = otherIds.map(id => { const idx = allComponents.findIndex(c => String(c.id) === String(id)); return gradePcts[idx] ?? (100 / (otherIds.length + 1)); });
    const totalOtherPct = otherPcts.reduce((s, p) => s + p, 0) || 1;
    setSelComps(prev => {
      const updated = { ...prev, [changedId]: { ...prev[changedId], value: changedValue } };
      let assigned = 0;
      otherIds.forEach((id, i) => {
        const isLast = i === otherIds.length - 1;
        const v = isLast ? remaining - assigned : Math.round(remaining * (otherPcts[i] / totalOtherPct));
        assigned += v;
        updated[id] = { ...updated[id], value: Math.max(0, v) };
      });
      return updated;
    });
  };

  const toggleDed = (ded) => {
    setSelDeds(prev => {
      if (prev[ded.id]) { const n = {...prev}; delete n[ded.id]; return n; }
      return { ...prev, [ded.id]: { value: 0, calculation_type: ded.calculation_type || "fixed" } };
    });
  };
  const updateSelDed = (id, field, val) => setSelDeds(prev => ({ ...prev, [id]: { ...prev[id], [field]: field==="value"?Number(val):val } }));

  const totalEarnings   = Object.entries(selComps).reduce((s,[,v]) => s + (v.value||0), 0);
  const totalDeductions = Object.entries(selDeds).reduce((s,[,v]) => s + (v.value||0), 0);
  const netMonthly      = totalEarnings - totalDeductions;
  const monthlyCTC      = form.monthly_ctc;

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true); setErr("");
    const payload = {
      name: form.name, grade: form.grade, annual_ctc: form.annual_ctc, monthly_ctc: form.monthly_ctc,
      components: Object.entries(selComps).map(([id,v],i) => ({ id:Number(id), value:v.value, calculation_type:v.calculation_type, sort_order:i+1 })),
      deductions:  Object.entries(selDeds).map(([id,v],i)  => ({ id:Number(id), value:v.value, calculation_type:v.calculation_type, sort_order:i+1 })),
    };
    try {
      const res = isEdit ? await api.updateStructure(editItem.id, payload) : await api.createStructure(payload);
      if (res.success!==false && res.data) { onSave(); onClose(); }
      else setErr("Failed to save. Please try again.");
    } catch { setErr("Network error."); }
    setSaving(false);
  };

  const STEPS = [{n:1,label:"Basic Info"},{n:2,label:"Components"},{n:3,label:"Deductions"}];

  return (
    <>
    <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,0.75)",backdropFilter:"blur(10px)",zIndex:700,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div onClick={e=>e.stopPropagation()}
        style={{background:"#fff",borderRadius:22,width:"100%",maxWidth:660,maxHeight:"94vh",display:"flex",flexDirection:"column",boxShadow:"0 48px 120px rgba(0,0,0,0.35)",animation:"modalIn 0.3s cubic-bezier(.34,1.2,.64,1)"}}>
        <div style={{background:"linear-gradient(135deg,#0f172a 0%,#1e293b 50%,#0f172a 100%)",padding:"20px 26px",borderRadius:"22px 22px 0 0",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0,position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:-20,right:-20,width:100,height:100,borderRadius:"50%",background:`${ACCENT}15`}}/>
          <div style={{position:"absolute",bottom:-30,left:40,width:80,height:80,borderRadius:"50%",background:"#6366f115"}}/>
          <div style={{display:"flex",alignItems:"center",gap:13,position:"relative"}}>
            <div style={{width:42,height:42,borderRadius:13,background:`linear-gradient(135deg,${ACCENT},#ea580c)`,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 6px 18px ${ACCENT}55`}}>
              <Ic d={ICONS.layers} stroke="#fff" size={18}/>
            </div>
            <div>
              <div style={{fontSize:16,fontWeight:900,color:"#fff",letterSpacing:"-0.3px"}}>{isEdit?"Edit":"Create"} Salary Structure</div>
              <div style={{fontSize:11.5,color:"#64748b",marginTop:1}}>Define compensation package template</div>
            </div>
          </div>
          <button onClick={onClose} style={{width:32,height:32,borderRadius:9,background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.1)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",position:"relative"}}>
            <Ic d={ICONS.x} stroke="#94a3b8" size={13}/>
          </button>
        </div>
        <div style={{display:"flex",alignItems:"center",padding:"16px 26px",background:"#f8fafc",borderBottom:"1px solid #f1f5f9",flexShrink:0}}>
          {STEPS.map((s,i) => (
            <React.Fragment key={s.n}>
              <div onClick={()=>setStep(s.n)} style={{display:"flex",alignItems:"center",gap:9,cursor:"pointer",userSelect:"none"}}>
                <div style={{width:28,height:28,borderRadius:9,background:step===s.n?`linear-gradient(135deg,${ACCENT},#ea580c)`:step>s.n?"#22c55e":"#e5e7eb",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.25s",boxShadow:step===s.n?`0 4px 12px ${ACCENT}44`:"none"}}>
                  {step>s.n?<Ic d={ICONS.check} stroke="#fff" size={12} sw={2.5}/>:<span style={{fontSize:11.5,fontWeight:900,color:step===s.n?"#fff":"#9ca3af"}}>{s.n}</span>}
                </div>
                <span style={{fontSize:12.5,fontWeight:step===s.n?800:500,color:step===s.n?"#111827":"#9ca3af",transition:"color 0.2s"}}>{s.label}</span>
              </div>
              {i<STEPS.length-1&&<div style={{flex:1,height:2,background:step>s.n?"#22c55e":"#e5e7eb",margin:"0 14px",borderRadius:2,transition:"background 0.3s"}}/>}
            </React.Fragment>
          ))}
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"22px 26px"}}>
          {err && <div style={{padding:"10px 14px",background:"#fef2f2",border:"1px solid #fecaca",borderRadius:9,fontSize:12,color:"#dc2626",fontWeight:600,marginBottom:14}}>{err}</div>}
          {step===1 && (
            <div style={{display:"flex",flexDirection:"column",gap:18}}>
              <div>
                <label style={{fontSize:11.5,fontWeight:700,color:"#374151",display:"block",marginBottom:6}}>Structure Name <span style={{color:"#ef4444"}}>*</span></label>
                <input value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} placeholder="e.g. Senior Developer Package"
                  style={{width:"100%",padding:"11px 14px",border:"1.5px solid #e5e7eb",borderRadius:10,fontSize:13.5,fontWeight:600,color:"#111827",outline:"none",boxSizing:"border-box",fontFamily:"Nunito,sans-serif",transition:"border 0.15s"}}
                  onFocus={e=>e.target.style.borderColor=ACCENT} onBlur={e=>e.target.style.borderColor="#e5e7eb"}/>
              </div>
              <div>
                <label style={{fontSize:11.5,fontWeight:700,color:"#374151",display:"block",marginBottom:9}}>Salary Grade <span style={{color:"#ef4444"}}>*</span></label>
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:11}}>
                  {["basic","medium","high"].map(g => {
                    const cfg = GRADE_CFG[g]; const active = form.grade===g;
                    const desc = {basic:"₹3L–6L CTC/yr\nEntry level",medium:"₹6L–10L CTC/yr\nMid level",high:"₹10L+ CTC/yr\nSenior level"};
                    return (
                      <button key={g} onClick={()=>applyGrade(g)}
                        style={{padding:"14px 10px",border:`2px solid ${active?cfg.color:cfg.border}`,borderRadius:14,background:active?cfg.bg:"#fafafa",cursor:"pointer",textAlign:"center",transition:"all 0.18s",boxShadow:active?`0 4px 14px ${cfg.color}22`:"none",transform:active?"scale(1.02)":"scale(1)"}}>
                        <div style={{fontSize:14,fontWeight:900,color:active?cfg.color:"#374151",marginBottom:4}}>{cfg.label}</div>
                        {desc[g].split("\n").map((l,i)=><div key={i} style={{fontSize:10.5,color:active?cfg.color:"#9ca3af",lineHeight:1.5}}>{l}</div>)}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div>
                  <label style={{fontSize:11.5,fontWeight:700,color:"#374151",display:"block",marginBottom:6}}>Annual CTC</label>
                  <div style={{position:"relative"}}>
                    <span style={{position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",fontSize:12.5,color:"#9ca3af",fontWeight:600}}>₹</span>
                    <input type="number" value={form.annual_ctc} onChange={e=>updateCTC(Number(e.target.value))}
                      style={{width:"100%",padding:"11px 12px 11px 26px",border:"1.5px solid #e5e7eb",borderRadius:10,fontSize:13.5,fontWeight:700,color:"#111827",outline:"none",boxSizing:"border-box",fontFamily:"Nunito,sans-serif"}}
                      onFocus={e=>e.target.style.borderColor=ACCENT} onBlur={e=>e.target.style.borderColor="#e5e7eb"}/>
                  </div>
                </div>
                <div style={{padding:"11px 16px",background:"linear-gradient(135deg,#f8fafc,#f1f5f9)",borderRadius:10,border:"1px solid #e5e7eb",display:"flex",flexDirection:"column",justifyContent:"center"}}>
                  <div style={{fontSize:10.5,color:"#9ca3af",fontWeight:700,marginBottom:2,textTransform:"uppercase",letterSpacing:"0.5px"}}>Monthly CTC</div>
                  <div style={{fontSize:22,fontWeight:900,color:"#111827",letterSpacing:"-0.5px"}}>{fmt(monthlyCTC)}</div>
                  <div style={{fontSize:10.5,color:"#9ca3af",marginTop:2}}>per month</div>
                </div>
              </div>
            </div>
          )}
          {step===2 && (
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div style={{padding:"11px 14px",background:"linear-gradient(135deg,#fff7ed,#ffedd5)",borderRadius:10,border:"1px solid #fed7aa",fontSize:12,color:"#c2410c",display:"flex",alignItems:"center",gap:9}}>
                <Ic d={ICONS.info} stroke={ACCENT} size={14}/>
                <span>Toggle to include a component. Edit or delete components below.</span>
              </div>
              {loadingData ? (
                <div style={{display:"flex",alignItems:"center",gap:10,padding:"30px 0",justifyContent:"center",color:"#9ca3af",fontSize:12.5}}><Spinner size={14} color={ACCENT}/> Loading…</div>
              ) : allComponents.length===0 ? (
                <div style={{textAlign:"center",padding:"30px 0",color:"#9ca3af",border:"2px dashed #e5e7eb",borderRadius:12}}><div style={{fontSize:22,marginBottom:6}}>📦</div><div style={{fontSize:12.5,fontWeight:700}}>No components yet.</div></div>
              ) : (
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {allComponents.map((comp,idx) => (
                    <div key={comp.id}>
                      <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:4}}>
                        <Toggle enabled={!!selComps[comp.id]} onChange={()=>toggleComp(comp)} size="sm"/>
                        <span style={{fontSize:11.5,fontWeight:700,color:selComps[comp.id]?"#111827":"#9ca3af"}}>{selComps[comp.id]?"Included":"Not included"}</span>
                      </div>
                      <ComponentCard comp={comp} idx={idx} onEditApi={handleEditCompApi} onDeleteApi={handleDeleteCompApi} deleting={deletingComp}/>
                      {selComps[comp.id] && (
                        <div style={{padding:"10px 14px",background:"#fff7ed",borderRadius:"0 0 11px 11px",border:"1px solid #fde68a",borderTop:"none",display:"flex",gap:10}}>
                          <div style={{flex:1}}>
                            <label style={{fontSize:10.5,color:"#9ca3af",fontWeight:700,display:"block",marginBottom:4}}>Monthly Value (₹)</label>
                            <div style={{position:"relative"}}><span style={{position:"absolute",left:9,top:"50%",transform:"translateY(-50%)",fontSize:11,color:"#9ca3af"}}>₹</span>
                            <input type="number" value={selComps[comp.id].value} onChange={e=>updateSelComp(comp.id,"value",e.target.value)} style={{width:"100%",padding:"7px 10px 7px 22px",border:"1.5px solid #fde68a",borderRadius:8,fontSize:13,fontWeight:700,outline:"none",fontFamily:"Nunito,sans-serif",boxSizing:"border-box"}}/></div>
                          </div>
                          <div style={{flex:1}}>
                            <label style={{fontSize:10.5,color:"#9ca3af",fontWeight:700,display:"block",marginBottom:4}}>Calculation Type</label>
                            <select value={selComps[comp.id].calculation_type} onChange={e=>updateSelComp(comp.id,"calculation_type",e.target.value)} style={{width:"100%",padding:"7px 10px",border:"1.5px solid #fde68a",borderRadius:8,fontSize:12,fontWeight:600,outline:"none",fontFamily:"Nunito,sans-serif",background:"#fff",cursor:"pointer"}}>
                              {CALC_TYPES.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              <button onClick={()=>setShowAddComp(true)} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,padding:"11px 0",background:"#fafafa",border:`2px dashed ${ACCENT}55`,borderRadius:12,fontSize:13,fontWeight:700,color:ACCENT,cursor:"pointer",fontFamily:"Nunito,sans-serif"}}>
                <Ic d={ICONS.plus} stroke={ACCENT} size={15}/> Add New Component
              </button>
              <div style={{background:"linear-gradient(135deg,#1e293b,#0f172a)",borderRadius:14,padding:"16px 20px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div><div style={{fontSize:10.5,color:"#94a3b8",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:2}}>Total Monthly</div><div style={{fontSize:24,fontWeight:900,color:"#fff",letterSpacing:"-0.8px"}}>{fmt(totalEarnings)}</div></div>
                <div style={{textAlign:"right"}}><div style={{fontSize:10.5,color:"#94a3b8",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:2}}>Annual CTC</div><div style={{fontSize:17,fontWeight:800,color:ACCENT}}>{fmt(totalEarnings*12)}</div></div>
              </div>
            </div>
          )}
          {step===3 && (
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <div style={{fontSize:13,fontWeight:800,color:"#374151",marginBottom:2}}>Statutory Deductions</div>
              {loadingData ? (
                <div style={{display:"flex",alignItems:"center",gap:10,padding:"30px 0",justifyContent:"center",color:"#9ca3af",fontSize:12.5}}><Spinner size={14} color="#dc2626"/> Loading…</div>
              ) : allDeductions.length===0 ? (
                <div style={{textAlign:"center",padding:"30px 0",color:"#9ca3af",border:"2px dashed #e5e7eb",borderRadius:12}}><div style={{fontSize:22,marginBottom:6}}>🛡️</div><div style={{fontSize:12.5,fontWeight:700}}>No deductions yet.</div></div>
              ) : (
                allDeductions.map(ded => (
                  <div key={ded.id}>
                    <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:4}}>
                      <Toggle enabled={!!selDeds[ded.id]} onChange={()=>toggleDed(ded)} size="sm"/>
                      <span style={{fontSize:11.5,fontWeight:700,color:selDeds[ded.id]?"#111827":"#9ca3af"}}>{selDeds[ded.id]?"Included":"Not included"}</span>
                    </div>
                    <DeductionCard ded={ded} onToggleApi={handleToggleDedApi} onEditApi={handleEditDedApi} onDeleteApi={handleDeleteDedApi} deleting={deletingDed}/>
                    {selDeds[ded.id] && (
                      <div style={{padding:"10px 14px",background:"#fff7ed",borderRadius:"0 0 11px 11px",border:"1px solid #fde68a",borderTop:"none",display:"flex",gap:10}}>
                        <div style={{flex:1}}>
                          <label style={{fontSize:10.5,color:"#9ca3af",fontWeight:700,display:"block",marginBottom:4}}>Monthly Value (₹)</label>
                          <div style={{position:"relative"}}><span style={{position:"absolute",left:9,top:"50%",transform:"translateY(-50%)",fontSize:11,color:"#9ca3af"}}>₹</span>
                          <input type="number" value={selDeds[ded.id].value} onChange={e=>updateSelDed(ded.id,"value",e.target.value)} style={{width:"100%",padding:"7px 10px 7px 22px",border:"1.5px solid #fde68a",borderRadius:8,fontSize:13,fontWeight:700,outline:"none",fontFamily:"Nunito,sans-serif",boxSizing:"border-box"}}/></div>
                        </div>
                        <div style={{flex:1}}>
                          <label style={{fontSize:10.5,color:"#9ca3af",fontWeight:700,display:"block",marginBottom:4}}>Calculation Type</label>
                          <select value={selDeds[ded.id].calculation_type} onChange={e=>updateSelDed(ded.id,"calculation_type",e.target.value)} style={{width:"100%",padding:"7px 10px",border:"1.5px solid #fde68a",borderRadius:8,fontSize:12,fontWeight:600,outline:"none",fontFamily:"Nunito,sans-serif",background:"#fff",cursor:"pointer"}}>
                            {CALC_TYPES.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
              <button onClick={()=>setShowAddDed(true)} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,padding:"11px 0",background:"#fafafa",border:"2px dashed #fecaca",borderRadius:12,fontSize:13,fontWeight:700,color:"#dc2626",cursor:"pointer",fontFamily:"Nunito,sans-serif"}}>
                <Ic d={ICONS.plus} stroke="#dc2626" size={15}/> Add New Deduction
              </button>
              <div style={{borderRadius:14,overflow:"hidden",border:"1px solid #f1f5f9",marginTop:4}}>
                <div style={{padding:"11px 16px",background:"#f8fafc",borderBottom:"1px solid #f1f5f9"}}><span style={{fontSize:11,fontWeight:800,color:"#9ca3af",textTransform:"uppercase",letterSpacing:"0.6px"}}>Monthly Pay Summary</span></div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 16px",borderBottom:"1px solid #f9fafb"}}><span style={{fontSize:12.5,color:"#6b7280"}}>Gross Earnings</span><span style={{fontSize:13,fontWeight:900,color:"#111827"}}>{fmt(totalEarnings)}</span></div>
                {allDeductions.filter(d=>selDeds[d.id]).map(d=>(
                  <div key={d.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 16px",borderBottom:"1px solid #f9fafb"}}><span style={{fontSize:12.5,color:"#6b7280"}}>{d.name}</span><span style={{fontSize:13,fontWeight:700,color:"#dc2626"}}>−{fmt(selDeds[d.id].value)}</span></div>
                ))}
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 16px",background:"linear-gradient(135deg,#1e293b,#0f172a)"}}><span style={{fontSize:14,fontWeight:700,color:"#94a3b8"}}>Net Take Home</span><span style={{fontSize:20,fontWeight:900,color:"#fff"}}>{fmt(netMonthly)}</span></div>
              </div>
            </div>
          )}
        </div>
        <div style={{padding:"15px 26px",borderTop:"1px solid #f1f5f9",display:"flex",justifyContent:"space-between",alignItems:"center",background:"#fafafa",borderRadius:"0 0 22px 22px",flexShrink:0}}>
          <div style={{display:"flex",gap:8}}>
            <button onClick={onClose} style={{padding:"9px 20px",background:"#fff",border:"1px solid #e5e7eb",borderRadius:10,fontSize:13,fontWeight:700,color:"#374151",cursor:"pointer",fontFamily:"Nunito,sans-serif"}}>Cancel</button>
            {step>1&&<button onClick={()=>setStep(s=>s-1)} style={{padding:"9px 20px",background:"#fff",border:"1px solid #e5e7eb",borderRadius:10,fontSize:13,fontWeight:700,color:"#374151",cursor:"pointer",fontFamily:"Nunito,sans-serif"}}>← Back</button>}
          </div>
          {step<3
            ?<button onClick={()=>setStep(s=>s+1)} disabled={step===1&&!form.name.trim()} style={{padding:"10px 24px",background:step===1&&!form.name.trim()?"#d1d5db":`linear-gradient(135deg,${ACCENT},#ea580c)`,border:"none",borderRadius:10,fontSize:13,fontWeight:800,color:"#fff",cursor:step===1&&!form.name.trim()?"not-allowed":"pointer",fontFamily:"Nunito,sans-serif"}}>Next Step →</button>
            :<button onClick={handleSave} disabled={saving} style={{padding:"10px 24px",background:saving?"#d1d5db":`linear-gradient(135deg,${ACCENT},#ea580c)`,border:"none",borderRadius:10,fontSize:13,fontWeight:800,color:"#fff",cursor:saving?"not-allowed":"pointer",fontFamily:"Nunito,sans-serif",display:"flex",alignItems:"center",gap:8}}>
              {saving?<><Spinner size={13}/>&nbsp;Saving…</>:<><Ic d={ICONS.check} stroke="#fff" size={13} sw={2.5}/>{isEdit?"Update Structure":"Save Structure"}</>}
            </button>}
        </div>
      </div>
    </div>
    {showAddComp && <AddComponentModal onClose={()=>setShowAddComp(false)} onAdd={handleAddCompDone}/>}
    {showAddDed  && <AddDeductionModal onClose={()=>setShowAddDed(false)}  onAdd={handleAddDedDone}/>}
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ── PAYROLL SETTINGS PANEL
// ════════════════════════════════════════════════════════════════════════════
function PayrollSettingsPanel() {
  const [components, setComponents] = useState([]);
  const [deductions, setDeductions] = useState([]);
  const [loadC, setLoadC]           = useState(true);
  const [loadD, setLoadD]           = useState(true);
  const [showAddComp, setShowAddComp] = useState(false);
  const [showAddDed,  setShowAddDed]  = useState(false);
  const [deletingComp, setDeletingComp] = useState(null);
  const [deletingDed,  setDeletingDed]  = useState(null);

  const fetchC = async () => { setLoadC(true); try { const d=await api.getComponents(); setComponents(Array.isArray(d)?d:[]); } catch{} setLoadC(false); };
  const fetchD = async () => { setLoadD(true); try { const d=await api.getDeductions(); setDeductions(Array.isArray(d)?d:[]); } catch{} setLoadD(false); };
  useEffect(()=>{ fetchC(); fetchD(); },[]);

  const handleEditComp = async (id, draft) => {
    const res = await api.updateComponent(id, { name: draft.name, calculation_type: draft.calculation_type });
    if (res.data) setComponents(prev=>prev.map(c=>c.id===id?res.data:c));
  };
  const handleDeleteComp = async (id) => {
    setDeletingComp(id);
    await api.deleteComponent(id);
    setComponents(prev=>prev.filter(c=>c.id!==id));
    setDeletingComp(null);
  };
  const handleToggleDed = async (ded) => {
    const updated = { ...ded, is_active: !ded.is_active };
    setDeductions(prev=>prev.map(d=>d.id===ded.id?updated:d));
    try { await api.updateDeduction(ded.id, { is_active: !ded.is_active }); }
    catch { setDeductions(prev=>prev.map(d=>d.id===ded.id?ded:d)); }
  };
  const handleEditDed = async (id, draft) => {
    const res = await api.updateDeduction(id, { name: draft.name, calculation_type: draft.calculation_type, is_active: draft.is_active });
    if (res.data) setDeductions(prev=>prev.map(d=>d.id===id?res.data:d));
  };
  const handleDeleteDed = async (id) => {
    setDeletingDed(id);
    await api.deleteDeduction(id);
    setDeductions(prev=>prev.filter(d=>d.id!==id));
    setDeletingDed(null);
  };

  return (
    <>
    <div style={{background:"#fff",borderRadius:16,border:"1px solid #f1f5f9",overflow:"hidden",boxShadow:"0 2px 8px rgba(0,0,0,0.05)"}}>
      <div style={{padding:"16px 22px",borderBottom:"1px solid #f3f4f6",background:"linear-gradient(135deg,#fafafa,#f3f4f6)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:38,height:38,borderRadius:11,background:"linear-gradient(135deg,#1e293b,#374151)",display:"flex",alignItems:"center",justifyContent:"center"}}><Ic d={ICONS.settings} stroke={ACCENT} size={16}/></div>
          <div><div style={{fontSize:15,fontWeight:900,color:"#111827"}}>Payroll Configuration</div><div style={{fontSize:11.5,color:"#9ca3af",marginTop:1}}>Manage components, rates & compliance</div></div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>setShowAddComp(true)} style={{display:"flex",alignItems:"center",gap:7,padding:"9px 16px",background:"#fff7ed",border:`1.5px solid ${ACCENT}44`,borderRadius:10,fontSize:12.5,fontWeight:800,color:ACCENT,cursor:"pointer",fontFamily:"Nunito,sans-serif"}}><Ic d={ICONS.plus} stroke={ACCENT} size={13}/> Add Component</button>
          <button onClick={()=>setShowAddDed(true)} style={{display:"flex",alignItems:"center",gap:7,padding:"9px 16px",background:"#fef2f2",border:"1.5px solid #fecaca",borderRadius:10,fontSize:12.5,fontWeight:800,color:"#dc2626",cursor:"pointer",fontFamily:"Nunito,sans-serif"}}><Ic d={ICONS.plus} stroke="#dc2626" size={13}/> Add Deduction</button>
        </div>
      </div>
      <div style={{padding:"20px 22px",display:"flex",flexDirection:"column",gap:22}}>
        <div>
          <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:13}}>
            <div style={{width:28,height:28,borderRadius:8,background:ACCENT,display:"flex",alignItems:"center",justifyContent:"center"}}><Ic d={ICONS.tag} stroke="#fff" size={13}/></div>
            <span style={{fontSize:13,fontWeight:800,color:"#374151"}}>Payroll Components (Earnings)</span>
            <div style={{flex:1,height:1.5,background:"linear-gradient(90deg,#f1f5f9,transparent)"}}/>
          </div>
          {loadC ? <div style={{display:"flex",alignItems:"center",gap:10,padding:"28px 0",justifyContent:"center",color:"#9ca3af",fontSize:12.5}}><Spinner size={14} color={ACCENT}/> Loading…</div>
            : components.length===0 ? <div style={{textAlign:"center",padding:"26px 0",color:"#9ca3af",border:"2px dashed #e5e7eb",borderRadius:12}}><div style={{fontSize:20,marginBottom:5}}>📦</div><div style={{fontSize:12.5,fontWeight:700}}>No components yet.</div></div>
            : <div style={{display:"flex",flexDirection:"column",gap:8}}>{components.map((comp,idx)=><ComponentCard key={comp.id} comp={comp} idx={idx} onEditApi={handleEditComp} onDeleteApi={handleDeleteComp} deleting={deletingComp}/>)}</div>}
        </div>
        <div>
          <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:13}}>
            <div style={{width:28,height:28,borderRadius:8,background:"#dc2626",display:"flex",alignItems:"center",justifyContent:"center"}}><Ic d={ICONS.shield} stroke="#fff" size={13}/></div>
            <span style={{fontSize:13,fontWeight:800,color:"#374151"}}>Statutory Deductions</span>
            <div style={{flex:1,height:1.5,background:"linear-gradient(90deg,#f1f5f9,transparent)"}}/>
          </div>
          {loadD ? <div style={{display:"flex",alignItems:"center",gap:10,padding:"28px 0",justifyContent:"center",color:"#9ca3af",fontSize:12.5}}><Spinner size={14} color="#dc2626"/> Loading…</div>
            : deductions.length===0 ? <div style={{textAlign:"center",padding:"26px 0",color:"#9ca3af",border:"2px dashed #e5e7eb",borderRadius:12}}><div style={{fontSize:20,marginBottom:5}}>🛡️</div><div style={{fontSize:12.5,fontWeight:700}}>No deductions yet.</div></div>
            : <div style={{display:"flex",flexDirection:"column",gap:10}}>{deductions.map(ded=><DeductionCard key={ded.id} ded={ded} onToggleApi={handleToggleDed} onEditApi={handleEditDed} onDeleteApi={handleDeleteDed} deleting={deletingDed}/>)}</div>}
        </div>
        <div style={{padding:"13px 16px",background:"linear-gradient(135deg,#fff7ed,#ffedd5)",borderRadius:11,border:"1px solid #fed7aa",display:"flex",alignItems:"center",gap:12}}>
          <Ic d={ICONS.info} stroke={ACCENT} size={16}/>
          <div style={{fontSize:12,color:"#c2410c",lineHeight:1.7}}>
            <strong>{components.length} component{components.length!==1?"s":""}</strong> · <strong>{deductions.filter(d=>d.is_active).length} active deduction{deductions.filter(d=>d.is_active).length!==1?"s":""}</strong> · Toggle to activate/deactivate.
          </div>
        </div>
      </div>
    </div>
    {showAddComp && <AddComponentModal onClose={()=>setShowAddComp(false)} onAdd={c=>{setComponents(prev=>[...prev,c]);setShowAddComp(false);}}/>}
    {showAddDed  && <AddDeductionModal onClose={()=>setShowAddDed(false)}  onAdd={d=>{setDeductions(prev=>[...prev,d]);setShowAddDed(false);}}/>}
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ── SALARY STRUCTURES SECTION
// ════════════════════════════════════════════════════════════════════════════
function SalaryStructuresSection({ showAddStructure, setShowAddStructure, editStructure, setEditStructure }) {
  const [structures, setStructures] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const fetchStructures = async () => {
    setLoading(true);
    try { const d=await api.getStructures(); setStructures(d.data||[]); } catch {}
    setLoading(false);
  };
  useEffect(()=>{ fetchStructures(); },[]);

  const handleSave  = async () => { await fetchStructures(); };
  const handleDelete = async (id) => {
    if (!confirm("Delete this salary structure?")) return;
    setDeletingId(id);
    await api.deleteStructure(id);
    setStructures(prev=>prev.filter(s=>s.id!==id));
    setDeletingId(null);
  };

  if (loading) return <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:14,padding:"80px 0",color:"#9ca3af",fontSize:14}}><Spinner size={20} color={ACCENT}/> Loading…</div>;

  const gradeCounts = { basic:0, medium:0, high:0 };
  const gradeCTC    = { basic:0, medium:0, high:0 };
  structures.forEach(s=>{ gradeCounts[s.grade]=(gradeCounts[s.grade]||0)+1; gradeCTC[s.grade]=(gradeCTC[s.grade]||0)+parseFloat(s.annual_ctc||0); });

  return (
    <>
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <div style={{padding:"14px 18px",background:"linear-gradient(135deg,#fff7ed,#ffedd5)",borderRadius:14,border:"1px solid #fed7aa",display:"flex",alignItems:"center",gap:13}}>
        <div style={{width:40,height:40,borderRadius:12,background:`linear-gradient(135deg,${ACCENT},#ea580c)`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Ic d={ICONS.layers} stroke="#fff" size={18}/></div>
        <div style={{flex:1}}><div style={{fontSize:13.5,fontWeight:900,color:"#92400e"}}>Salary Structure Templates</div><div style={{fontSize:12,color:"#c2410c",marginTop:2,fontWeight:600}}>Create reusable compensation packages by grade.</div></div>
        <button onClick={()=>{setEditStructure(null);setShowAddStructure(true);}} style={{flexShrink:0,display:"flex",alignItems:"center",gap:7,padding:"9px 18px",background:`linear-gradient(135deg,${ACCENT},#ea580c)`,border:"none",borderRadius:10,fontSize:13,fontWeight:800,color:"#fff",cursor:"pointer",fontFamily:"Nunito,sans-serif"}}><Ic d={ICONS.plus} stroke="#fff" size={14}/> New Structure</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
        {["basic","medium","high"].map(g=>{
          const cfg = GRADE_CFG[g]; const count = gradeCounts[g]||0; const avgCTC = count ? Math.round(gradeCTC[g]/count) : 0;
          return (
            <div key={g} style={{background:"#fff",borderRadius:13,border:`1.5px solid ${cfg.border}`,padding:"15px 18px"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:9}}>
                <div style={{padding:"3px 12px",borderRadius:99,background:cfg.bg,border:`1.5px solid ${cfg.border}`,fontSize:12.5,fontWeight:900,color:cfg.color}}>{cfg.label} Grade</div>
                <span style={{fontSize:11,color:"#9ca3af",fontWeight:600}}>{count} package{count!==1?"s":""}</span>
              </div>
              <div style={{fontSize:22,fontWeight:900,color:"#111827",letterSpacing:"-0.5px"}}>{avgCTC?fmtShort(avgCTC):"—"}</div>
              <div style={{fontSize:11,color:"#9ca3af",marginTop:3,fontWeight:600}}>Avg annual CTC</div>
            </div>
          );
        })}
      </div>
      {structures.length===0 ? (
        <div style={{padding:"70px 0",textAlign:"center",color:"#9ca3af",background:"#fff",borderRadius:16,border:"2px dashed #e5e7eb"}}><div style={{fontSize:40,marginBottom:12}}>📦</div><div style={{fontSize:14,fontWeight:800,marginBottom:7,color:"#374151"}}>No salary structures yet</div></div>
      ) : (
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(310px,1fr))",gap:14}}>
          {structures.map(ss=>{
            const cfg = GRADE_CFG[ss.grade]||GRADE_CFG.basic;
            const monthly = parseFloat(ss.monthly_ctc)||0; const annual = parseFloat(ss.annual_ctc)||0;
            const comps = ss.components||[]; const deds = ss.deductions||[];
            const totalCompsVal = comps.reduce((s,c)=>s+parseFloat(c.pivot?.value||0),0);
            const totalDedsVal  = deds.reduce((s,d)=>s+parseFloat(d.pivot?.value||0),0);
            const net = totalCompsVal - totalDedsVal;
            return (
              <div key={ss.id} className="ss-card" style={{background:"#fff",borderRadius:16,border:`1.5px solid ${cfg.border}`,overflow:"hidden"}}>
                <div style={{background:`linear-gradient(135deg,${cfg.bg},${cfg.bg}dd)`,padding:"15px 18px",borderBottom:`1px solid ${cfg.border}`}}>
                  <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between"}}>
                    <div><div style={{fontSize:14,fontWeight:900,color:cfg.color,marginBottom:4}}>{ss.name}</div><div style={{display:"flex",alignItems:"center",gap:7}}><GradeBadge grade={ss.grade}/><span style={{fontSize:10.5,color:"#9ca3af",fontWeight:600}}>{ss.created_at?.slice(0,10)}</span></div></div>
                    <div style={{display:"flex",gap:6}}>
                      <button className="icon-btn" onClick={()=>{setEditStructure(ss);setShowAddStructure(true);}} style={{width:28,height:28,background:"#fff",border:"1px solid #e5e7eb",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}><Ic d={ICONS.edit} stroke="#6b7280" size={12}/></button>
                      <button className="icon-btn" onClick={()=>handleDelete(ss.id)} disabled={deletingId===ss.id} style={{width:28,height:28,background:"#fef2f2",border:"1px solid #fecaca",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",opacity:deletingId===ss.id?0.5:1}}>
                        {deletingId===ss.id?<Spinner size={11} color="#dc2626"/>:<Ic d={ICONS.trash} stroke="#dc2626" size={12}/>}
                      </button>
                    </div>
                  </div>
                </div>
                <div style={{padding:"13px 18px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:13,padding:"9px 13px",background:"#f8fafc",borderRadius:10}}>
                    <div><div style={{fontSize:10,color:"#9ca3af",fontWeight:700,textTransform:"uppercase"}}>ANNUAL CTC</div><div style={{fontSize:20,fontWeight:900,color:"#111827"}}>{fmtShort(annual)}</div></div>
                    <div style={{textAlign:"right"}}><div style={{fontSize:10,color:"#9ca3af",fontWeight:700,textTransform:"uppercase"}}>MONTHLY</div><div style={{fontSize:17,fontWeight:800,color:cfg.color}}>{fmt(monthly)}</div></div>
                  </div>
                  {comps.map((c,idx)=>(
                    <div key={c.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"4px 8px",background:"#fafafa",borderRadius:7,marginBottom:4}}>
                      <div style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:7,height:7,borderRadius:2,background:compColor(idx)}}/><span style={{fontSize:10.5,color:"#9ca3af",fontWeight:600}}>{c.name}</span></div>
                      <span style={{fontSize:11,fontWeight:800,color:compColor(idx)}}>{fmt(parseFloat(c.pivot?.value||0))}</span>
                    </div>
                  ))}
                  {deds.length>0 && deds.map(d=>(
                    <div key={d.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"4px 8px",background:"#fef9f9",borderRadius:7,marginBottom:4}}>
                      <span style={{fontSize:10.5,color:"#9ca3af",fontWeight:600}}>{d.name}</span>
                      <span style={{fontSize:11,fontWeight:800,color:"#dc2626"}}>−{fmt(parseFloat(d.pivot?.value||0))}</span>
                    </div>
                  ))}
                  <div style={{height:5,borderRadius:3,overflow:"hidden",display:"flex",margin:"10px 0"}}>
                    {comps.map((c,idx)=><div key={c.id} style={{flex:parseFloat(c.pivot?.value||0)||1,background:compColor(idx),minWidth:2}}/>)}
                  </div>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",paddingTop:8,borderTop:"1px solid #f1f5f9"}}>
                    <span style={{fontSize:10.5,color:"#9ca3af",fontWeight:600}}>{comps.length} components</span>
                    <div style={{fontSize:11,fontWeight:800,color:"#16a34a",background:"#f0fdf4",padding:"3px 10px",borderRadius:99}}>Net ~{fmt(net>0?net:0)}/mo</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
    {(showAddStructure||editStructure) && (
      <SalaryStructureModal onClose={()=>{setShowAddStructure(false);setEditStructure(null);}} onSave={handleSave} editItem={editStructure}/>
    )}
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ── PAYROLL OVERVIEW CHART  (uses API monthly_breakdown)
// ════════════════════════════════════════════════════════════════════════════
function SalaryBarChart({ data, loading, period, onPeriodChange }) {
  if (loading) {
    return (
      <div style={{background:"#fff",borderRadius:14,border:"1px solid #f1f5f9",padding:"18px 20px",boxShadow:"0 2px 8px rgba(0,0,0,0.05)",display:"flex",alignItems:"center",justifyContent:"center",minHeight:220}}>
        <Spinner size={18} color={ACCENT}/>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div style={{background:"#fff",borderRadius:14,border:"1px solid #f1f5f9",padding:"18px 20px",boxShadow:"0 2px 8px rgba(0,0,0,0.05)",display:"flex",alignItems:"center",justifyContent:"center",minHeight:220,flexDirection:"column",gap:8}}>
        <div style={{fontSize:28}}>📊</div>
        <div style={{fontSize:12.5,fontWeight:700,color:"#9ca3af"}}>No payroll data available</div>
      </div>
    );
  }

  const maxVal = Math.max(...data.map(d => (d.gross || 0)));
  const safeMax = maxVal || 1;
  const chartH=130, barW=32, gap=16, padL=62, padB=28;
  const svgW = Math.max(300, padL + data.length*(barW+gap)+10);
  const yLabels = [0,0.25,0.5,0.75,1].map(f => Math.round(safeMax*f/1000)*1000);

  return (
    <div style={{background:"#fff",borderRadius:14,border:"1px solid #f1f5f9",padding:"18px 20px",boxShadow:"0 2px 8px rgba(0,0,0,0.05)"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
        <div>
          <div style={{fontSize:14,fontWeight:900,color:"#111827"}}>Payroll Overview</div>
          <div style={{fontSize:11.5,color:"#9ca3af",marginTop:1}}>Monthly salary breakdown</div>
        </div>
        <div style={{display:"flex",gap:4,background:"#f9fafb",borderRadius:9,padding:4,border:"1px solid #f1f5f9"}}>
          {["3M","6M","1Y"].map(p=>(
            <button key={p} onClick={()=>onPeriodChange(p)}
              style={{padding:"4px 11px",borderRadius:6,fontSize:11.5,fontWeight:800,border:"none",cursor:"pointer",background:period===p?"linear-gradient(135deg,"+ACCENT+",#ea580c)":"transparent",color:period===p?"#fff":"#9ca3af",transition:"all 0.15s",fontFamily:"Nunito,sans-serif"}}>
              {p}
            </button>
          ))}
        </div>
      </div>
      <div style={{display:"flex",gap:14,marginBottom:10}}>
        {[["Gross","#3b82f6"],["Net","#22c55e"],["Deductions","#fca5a5"]].map(([label,color])=>(
          <div key={label} style={{display:"flex",alignItems:"center",gap:5}}>
            <div style={{width:9,height:9,borderRadius:3,background:color}}/>
            <span style={{fontSize:10.5,color:"#6b7280",fontWeight:600}}>{label}</span>
          </div>
        ))}
      </div>
      <div style={{overflowX:"auto"}}>
        <svg width={svgW} height={chartH+padB} style={{display:"block"}}>
          {yLabels.map((val,i)=>{
            const y = chartH - (val/safeMax)*chartH;
            return (
              <g key={i}>
                <line x1={padL} y1={y} x2={svgW-10} y2={y} stroke="#f1f5f9" strokeWidth={1} strokeDasharray="4 4"/>
                <text x={padL-6} y={y+4} textAnchor="end" fontSize={9} fill="#9ca3af">{fmtShort(val)}</text>
              </g>
            );
          })}
          {data.map((d,i)=>{
            const x     = padL + i*(barW+gap);
            const gross = d.gross || 0;
            const net   = d.net   || 0;
            const ded   = d.deductions || 0;
            const grossH = (gross/safeMax)*chartH;
            const netH   = (net/safeMax)*chartH;
            const dedH   = (ded/safeMax)*chartH;
            return (
              <g key={d.month}>
                {/* Gross bar (full height, blue) */}
                <rect x={x} y={chartH-grossH} width={barW} height={grossH} rx={5} fill="#3b82f6" opacity={0.85}/>
                {/* Net bar (green overlay on left portion) */}
                <rect x={x} y={chartH-netH} width={Math.round(barW*0.45)} height={netH} rx={4} fill="#22c55e" opacity={0.9}/>
                {/* Deduction indicator (small red bar on right) */}
                <rect x={x+Math.round(barW*0.6)} y={chartH-dedH} width={Math.round(barW*0.35)} height={dedH} rx={3} fill="#fca5a5" opacity={0.85}/>
                {/* Month label */}
                <text x={x+barW/2} y={chartH+18} textAnchor="middle" fontSize={9.5} fill="#9ca3af" fontWeight={600}>{MONTH_NAMES[(d.month-1)%12]}</text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ── DEPARTMENT DONUT  (uses API department_breakdown)
// ════════════════════════════════════════════════════════════════════════════
function DeptDonut({ deptData, loading }) {
  if (loading) {
    return (
      <div style={{background:"#fff",borderRadius:14,border:"1px solid #f1f5f9",padding:"18px 20px",boxShadow:"0 2px 8px rgba(0,0,0,0.05)",display:"flex",alignItems:"center",justifyContent:"center",minHeight:180}}>
        <Spinner size={18} color={ACCENT}/>
      </div>
    );
  }

  if (!deptData || deptData.length === 0) {
    return (
      <div style={{background:"#fff",borderRadius:14,border:"1px solid #f1f5f9",padding:"18px 20px",boxShadow:"0 2px 8px rgba(0,0,0,0.05)",display:"flex",alignItems:"center",justifyContent:"center",minHeight:180,flexDirection:"column",gap:8}}>
        <div style={{fontSize:28}}>🏢</div>
        <div style={{fontSize:12.5,fontWeight:700,color:"#9ca3af"}}>No department data</div>
      </div>
    );
  }

  const colors = ["#6366f1","#f97316","#14b8a6","#ec4899","#22c55e","#a855f7","#3b82f6","#eab308"];
  const total  = deptData.reduce((s,d) => s + (d.amount||0), 0);
  const entries = deptData.map((d,i) => ({
    dept:  d.department,
    val:   d.amount || 0,
    pct:   d.percentage || ((d.amount/total)*100),
    color: colors[i % colors.length],
  }));

  const cx=55, cy=55, R=44, r=28;
  let angle = -Math.PI/2;
  const segments = entries.map(e=>{
    const start = angle;
    const sweep = (e.pct/100) * 2 * Math.PI;
    angle += sweep;
    const x1=cx+R*Math.cos(start), y1=cy+R*Math.sin(start);
    const x2=cx+R*Math.cos(start+sweep), y2=cy+R*Math.sin(start+sweep);
    const ix1=cx+r*Math.cos(start), iy1=cy+r*Math.sin(start);
    const ix2=cx+r*Math.cos(start+sweep), iy2=cy+r*Math.sin(start+sweep);
    const large = sweep > Math.PI ? 1 : 0;
    return { ...e, path:`M${x1},${y1} A${R},${R},0,${large},1,${x2},${y2} L${ix2},${iy2} A${r},${r},0,${large},0,${ix1},${iy1} Z` };
  });

  return (
    <div style={{background:"#fff",borderRadius:14,border:"1px solid #f1f5f9",padding:"18px 20px",boxShadow:"0 2px 8px rgba(0,0,0,0.05)"}}>
      <div style={{fontSize:14,fontWeight:900,color:"#111827",marginBottom:2}}>By Department</div>
      <div style={{fontSize:11.5,color:"#9ca3af",marginBottom:13}}>Net salary split</div>
      <div style={{display:"flex",alignItems:"center",gap:14}}>
        <svg width={110} height={110} style={{flexShrink:0}}>
          {segments.map((s,i)=><path key={i} d={s.path} fill={s.color}/>)}
          <text x={cx} y={cy-3} textAnchor="middle" fontSize={9} fill="#9ca3af">Total</text>
          <text x={cx} y={cy+9} textAnchor="middle" fontSize={10} fontWeight={700} fill="#111827">{fmtShort(total)}</text>
        </svg>
        <div style={{flex:1}}>
          {entries.map(e=>(
            <div key={e.dept} style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:7}}>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <div style={{width:7,height:7,borderRadius:2,background:e.color,flexShrink:0}}/>
                <span style={{fontSize:10.5,color:"#374151",fontWeight:600}}>{e.dept}</span>
              </div>
              <span style={{fontSize:10.5,fontWeight:800,color:"#111827"}}>{Number(e.pct).toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── STAT CARD ─────────────────────────────────────────────────────────────────
function StatCard({ icon, iconBg, label, value, sub, subColor, trend, loading }) {
  return (
    <div style={{background:"#fff",borderRadius:14,padding:"16px 18px",border:"1px solid #f1f5f9",boxShadow:"0 2px 8px rgba(0,0,0,0.05)",flex:1,minWidth:0}}>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:11}}>
        <div style={{width:42,height:42,borderRadius:12,background:iconBg,display:"flex",alignItems:"center",justifyContent:"center"}}><Ic d={icon} stroke="#fff" size={18}/></div>
        {trend&&<div style={{display:"flex",alignItems:"center",gap:3,fontSize:11,fontWeight:800,color:trend>0?"#16a34a":"#dc2626",background:trend>0?"#f0fdf4":"#fef2f2",padding:"3px 8px",borderRadius:99}}>{trend>0?"↑":"↓"}{Math.abs(trend)}%</div>}
      </div>
      <div style={{fontSize:10.5,color:"#9ca3af",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:4}}>{label}</div>
      {loading
        ?<div style={{height:28,width:"60%",background:"linear-gradient(90deg,#f3f4f6,#e5e7eb,#f3f4f6)",backgroundSize:"200% 100%",borderRadius:6,animation:"shimmer 1.2s infinite"}}/>
        :<div style={{fontSize:22,fontWeight:900,color:"#111827",letterSpacing:"-0.8px",lineHeight:1}}>{value}</div>
      }
      {sub&&<div style={{fontSize:11,color:subColor||"#9ca3af",marginTop:5,fontWeight:600}}>{sub}</div>}
    </div>
  );
}

// ── PAYSLIP MODAL ─────────────────────────────────────────────────────────────
function PayslipModal({ emp, onClose, month }) {
  const [sending,setSending]=useState(false);const [sent,setSent]=useState(false);
  const handleSend=async()=>{setSending(true);await new Promise(r=>setTimeout(r,1200));setSending(false);setSent(true);setTimeout(()=>setSent(false),3000);};
  const allowances=[{label:"Basic Salary",amount:Math.round(emp.gross*0.5)},{label:"HRA",amount:Math.round(emp.gross*0.2)},{label:"Transport Allowance",amount:Math.round(emp.gross*0.05)},{label:"Medical Allowance",amount:Math.round(emp.gross*0.05)},{label:"Special Allowance",amount:Math.round(emp.gross*0.1)},{label:"Performance Bonus",amount:Math.round(emp.gross*0.1)}];
  const deductions=[{label:"PF (Employee 12%)",amount:emp.pf},{label:"PF (Employer 12%)",amount:Math.round(emp.pf*0.5)},{label:"Professional Tax",amount:200},{label:"Income Tax (TDS)",amount:emp.tax},{label:"Health Insurance",amount:Math.round(emp.gross*0.01)}];
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",backdropFilter:"blur(10px)",zIndex:600,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:20,width:"100%",maxWidth:560,maxHeight:"92vh",overflowY:"auto",boxShadow:"0 48px 120px rgba(0,0,0,0.3)",animation:"modalIn 0.25s ease"}}>
        <div style={{background:`linear-gradient(135deg,${ACCENT},#ea580c)`,padding:"20px 24px",borderRadius:"20px 20px 0 0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div><div style={{fontSize:16,fontWeight:900,color:"#fff"}}>Payslip — {month}</div><div style={{fontSize:11.5,color:"rgba(255,255,255,0.7)",marginTop:2}}>Official salary statement</div></div>
          <button onClick={onClose} style={{width:32,height:32,borderRadius:9,background:"rgba(255,255,255,0.2)",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Ic d={ICONS.x} stroke="#fff" size={13}/></button>
        </div>
        <div style={{padding:"20px 24px 0"}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:14,padding:"13px 15px",background:"#f8fafc",borderRadius:11,border:"1px solid #f1f5f9"}}>
            <div><div style={{fontSize:13.5,fontWeight:900,color:"#111827"}}>PencilKraft Technologies</div><div style={{fontSize:11,color:"#9ca3af",marginTop:2}}>Bengaluru, Karnataka 560001</div></div>
            <div style={{textAlign:"right"}}><div style={{fontSize:11.5,fontWeight:800,color:ACCENT}}>Payslip #{emp.id}</div><div style={{fontSize:11,color:"#9ca3af",marginTop:2}}>{month} · {emp.bank}</div></div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14,padding:"11px 14px",background:"#fff7ed",borderRadius:11,border:"1px solid #fed7aa"}}>
            <Avatar name={emp.name} size={42}/>
            <div><div style={{fontSize:13.5,fontWeight:800,color:"#111827"}}>{emp.name}</div><div style={{fontSize:11,color:"#9ca3af"}}>{emp.id} · {emp.role} · {emp.dept}</div><div style={{fontSize:11,color:"#9ca3af"}}>Joining: {emp.joining} · Days: {emp.paid_days}/{emp.work_days}</div></div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
            <div>
              <div style={{fontSize:10,fontWeight:800,color:"#374151",textTransform:"uppercase",letterSpacing:"0.7px",marginBottom:8,display:"flex",alignItems:"center",gap:5}}><div style={{width:7,height:7,borderRadius:2,background:"#22c55e"}}/> Earnings</div>
              {allowances.map((a,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid #f9fafb"}}><span style={{fontSize:11.5,color:"#6b7280"}}>{a.label}</span><span style={{fontSize:11.5,fontWeight:700,color:"#111827"}}>{fmt(a.amount)}</span></div>)}
              <div style={{display:"flex",justifyContent:"space-between",padding:"7px 0 0",fontWeight:900,color:"#16a34a",fontSize:13}}><span>Gross</span><span>{fmt(emp.gross)}</span></div>
            </div>
            <div>
              <div style={{fontSize:10,fontWeight:800,color:"#374151",textTransform:"uppercase",letterSpacing:"0.7px",marginBottom:8,display:"flex",alignItems:"center",gap:5}}><div style={{width:7,height:7,borderRadius:2,background:"#ef4444"}}/> Deductions</div>
              {deductions.map((d,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid #f9fafb"}}><span style={{fontSize:11.5,color:"#6b7280"}}>{d.label}</span><span style={{fontSize:11.5,fontWeight:700,color:"#111827"}}>{fmt(d.amount)}</span></div>)}
              <div style={{display:"flex",justifyContent:"space-between",padding:"7px 0 0",fontWeight:900,color:"#dc2626",fontSize:13}}><span>Total</span><span>{fmt(emp.deduction)}</span></div>
            </div>
          </div>
          <div style={{background:"linear-gradient(135deg,#1e293b,#0f172a)",borderRadius:14,padding:"16px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
            <div><div style={{fontSize:10.5,color:"#94a3b8",fontWeight:700,textTransform:"uppercase"}}>Net Take Home</div><div style={{fontSize:28,fontWeight:900,color:"#fff",letterSpacing:"-1.5px"}}>{fmt(emp.net)}</div></div>
            <div style={{width:54,height:54,borderRadius:"50%",background:`${ACCENT}25`,border:`2px solid ${ACCENT}50`,display:"flex",alignItems:"center",justifyContent:"center"}}><Ic d={ICONS.wallet} stroke={ACCENT} size={22}/></div>
          </div>
          <div style={{display:"flex",gap:10,marginBottom:20}}>
            <button style={{flex:1,padding:"10px 0",background:"#f9fafb",border:"1px solid #e5e7eb",borderRadius:10,fontSize:12.5,fontWeight:700,color:"#374151",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:7,fontFamily:"Nunito,sans-serif"}}><Ic d={ICONS.download} stroke="#374151" size={13}/> Download PDF</button>
            <button onClick={handleSend} disabled={sending||sent} style={{flex:1,padding:"10px 0",background:sent?"#16a34a":`linear-gradient(135deg,${ACCENT},#ea580c)`,border:"none",borderRadius:10,fontSize:12.5,fontWeight:800,color:"#fff",cursor:sending||sent?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:7,fontFamily:"Nunito,sans-serif"}}>
              {sending?<><Spinner size={12}/>&nbsp;Sending…</>:sent?<><Ic d={ICONS.check} stroke="#fff" size={12} sw={2.5}/>Sent!</>:<><Ic d={ICONS.send} stroke="#fff" size={12}/>Email Payslip</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EditSalaryModal({ emp, onClose, onSave }) {
  const [form,setForm]=useState({gross:emp.gross,deduction:emp.deduction,status:emp.status,salaryGrade:emp.salaryGrade||"Basic"});
  const [saving,setSaving]=useState(false);
  const net=form.gross-form.deduction;
  const set=(k,v)=>setForm(p=>({...p,[k]:v}));
  const handleSave=async()=>{setSaving(true);await new Promise(r=>setTimeout(r,800));onSave({...emp,...form,net});setSaving(false);onClose();};
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",backdropFilter:"blur(10px)",zIndex:600,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:18,width:"100%",maxWidth:440,boxShadow:"0 32px 80px rgba(0,0,0,0.28)",animation:"modalIn 0.22s ease",overflow:"hidden"}}>
        <div style={{background:`linear-gradient(135deg,${ACCENT},#ea580c)`,padding:"17px 22px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div><div style={{fontSize:14.5,fontWeight:900,color:"#fff"}}>Edit Salary — {emp.name}</div><div style={{fontSize:11.5,color:"rgba(255,255,255,0.7)",marginTop:1}}>{emp.id} · {emp.role}</div></div>
          <button onClick={onClose} style={{width:30,height:30,borderRadius:9,background:"rgba(255,255,255,0.2)",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Ic d={ICONS.x} stroke="#fff" size={13}/></button>
        </div>
        <div style={{padding:"20px 22px",display:"flex",flexDirection:"column",gap:14}}>
          <div>
            <label style={{fontSize:11.5,fontWeight:700,color:"#374151",display:"block",marginBottom:8}}>Salary Grade</label>
            <div style={{display:"flex",gap:8}}>{["Basic","Medium","High"].map(g=>{const cfg=GRADE_CFG[g];return<button key={g} onClick={()=>set("salaryGrade",g)} style={{flex:1,padding:"9px 0",borderRadius:9,border:`2px solid ${form.salaryGrade===g?cfg.color:cfg.border}`,background:form.salaryGrade===g?cfg.bg:"#fff",fontSize:12.5,fontWeight:800,color:form.salaryGrade===g?cfg.color:"#9ca3af",cursor:"pointer",fontFamily:"Nunito,sans-serif"}}>{cfg.label}</button>;})}</div>
          </div>
          {[["Gross Salary","gross"],["Total Deduction","deduction"]].map(([label,key])=>(
            <div key={key}>
              <label style={{fontSize:11.5,fontWeight:700,color:"#374151",display:"block",marginBottom:6}}>{label}</label>
              <div style={{position:"relative"}}><span style={{position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",fontSize:12.5,color:"#9ca3af"}}>₹</span>
              <input type="number" value={form[key]} onChange={e=>set(key,Number(e.target.value))} style={{width:"100%",padding:"10px 12px 10px 28px",border:"1.5px solid #e5e7eb",borderRadius:10,fontSize:13.5,fontWeight:700,color:"#111827",outline:"none",boxSizing:"border-box",fontFamily:"Nunito,sans-serif"}} onFocus={e=>e.target.style.borderColor=ACCENT} onBlur={e=>e.target.style.borderColor="#e5e7eb"}/></div>
            </div>
          ))}
          <div style={{padding:"11px 15px",background:net>0?"#f0fdf4":"#fef2f2",borderRadius:10,display:"flex",justifyContent:"space-between",alignItems:"center",border:`1.5px solid ${net>0?"#bbf7d0":"#fecaca"}`}}>
            <span style={{fontSize:12.5,fontWeight:700,color:net>0?"#16a34a":"#dc2626"}}>Net Pay Preview</span>
            <span style={{fontSize:18,fontWeight:900,color:net>0?"#16a34a":"#dc2626"}}>{fmt(net)}</span>
          </div>
          <div>
            <label style={{fontSize:11.5,fontWeight:700,color:"#374151",display:"block",marginBottom:7}}>Payment Status</label>
            <div style={{display:"flex",gap:8}}>{["Paid","Pending","Unpaid"].map(s=>(
              <button key={s} onClick={()=>set("status",s)} style={{flex:1,padding:"9px 0",borderRadius:9,border:`2px solid ${form.status===s?STATUS_CFG[s].border:"#e5e7eb"}`,background:form.status===s?STATUS_CFG[s].bg:"#fff",fontSize:12.5,fontWeight:800,color:form.status===s?STATUS_CFG[s].color:"#9ca3af",cursor:"pointer",fontFamily:"Nunito,sans-serif"}}>{s}</button>
            ))}</div>
          </div>
        </div>
        <div style={{padding:"0 22px 20px",display:"flex",gap:10}}>
          <button onClick={onClose} style={{flex:1,padding:"11px 0",background:"#fff",border:"1px solid #e5e7eb",borderRadius:10,fontSize:13,fontWeight:700,color:"#374151",cursor:"pointer",fontFamily:"Nunito,sans-serif"}}>Cancel</button>
          <button onClick={handleSave} disabled={saving} style={{flex:2,padding:"11px 0",background:saving?"#d1d5db":`linear-gradient(135deg,${ACCENT},#ea580c)`,border:"none",borderRadius:10,fontSize:13,fontWeight:800,color:"#fff",cursor:saving?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,fontFamily:"Nunito,sans-serif"}}>
            {saving?<><Spinner size={13}/>&nbsp;Saving…</>:<><Ic d={ICONS.check} stroke="#fff" size={13} sw={2.5}/>Save Changes</>}
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmModal({ emp, onClose, onConfirm }) {
  const [loading,setLoading]=useState(false);
  const handle=async()=>{setLoading(true);await new Promise(r=>setTimeout(r,700));onConfirm();};
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",backdropFilter:"blur(10px)",zIndex:600,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:18,width:"100%",maxWidth:360,padding:24,boxShadow:"0 32px 80px rgba(0,0,0,0.28)",animation:"modalIn 0.22s ease",textAlign:"center"}}>
        <div style={{width:56,height:56,borderRadius:"50%",background:"#fef2f2",border:"2px solid #fecaca",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 13px"}}><Ic d={ICONS.trash} stroke="#dc2626" size={22}/></div>
        <div style={{fontSize:15,fontWeight:900,color:"#111827",marginBottom:7}}>Delete Record?</div>
        <div style={{fontSize:12.5,color:"#6b7280",marginBottom:20,lineHeight:1.7}}>Remove salary record for <strong>{emp.name}</strong>?</div>
        <div style={{display:"flex",gap:10}}>
          <button onClick={onClose} style={{flex:1,padding:"10px 0",background:"#fff",border:"1px solid #e5e7eb",borderRadius:10,fontSize:13,fontWeight:700,color:"#374151",cursor:"pointer",fontFamily:"Nunito,sans-serif"}}>Cancel</button>
          <button onClick={handle} disabled={loading} style={{flex:1,padding:"10px 0",background:loading?"#d1d5db":"#dc2626",border:"none",borderRadius:10,fontSize:13,fontWeight:800,color:"#fff",cursor:loading?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:7,fontFamily:"Nunito,sans-serif"}}>
            {loading?<><Spinner size={13}/>&nbsp;Deleting…</>:"Yes, Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ── MAIN PAGE
// ════════════════════════════════════════════════════════════════════════════
export default function EmployeeSalaryPage() {
  const [activeTab,        setActiveTab]        = useState("salary");
  const [employees,        setEmployees]        = useState(MOCK_EMPLOYEES);
  const [search,           setSearch]           = useState("");
  const [dept,             setDept]             = useState("All");
  const [status,           setStatus]           = useState("All");
  const [sortBy,           setSortBy]           = useState("name");
  const [sortDir,          setSortDir]          = useState("asc");
  const [rowsPerPage,      setRowsPerPage]      = useState(10);
  const [page,             setPage]             = useState(1);
  const [selectedIds,      setSelectedIds]      = useState(new Set());
  const [viewEmp,          setViewEmp]          = useState(null);
  const [editEmp,          setEditEmp]          = useState(null);
  const [deleteEmp,        setDeleteEmp]        = useState(null);
  const [period,           setPeriod]           = useState("6M");
  const [month,            setMonth]            = useState("May 2026");
  const [showAddStructure, setShowAddStructure] = useState(false);
  const [editStructure,    setEditStructure]    = useState(null);

  // ── Dashboard stats from API ──────────────────────────────────────────────
  const [dashStats,         setDashStats]         = useState(null);
  const [monthlyBreakdown,  setMonthlyBreakdown]  = useState([]);
  const [deptBreakdown,     setDeptBreakdown]     = useState([]);
  const [loadingStats,      setLoadingStats]      = useState(true);

  useEffect(() => {
    const year = month.split(" ")[1] || new Date().getFullYear();
    setLoadingStats(true);
    api.getDashboardStats(year)
      .then(res => {
        if (res.success) {
          setDashStats(res.totals);
          // ── feed the two new sections ──────────────────────────────────
          setMonthlyBreakdown(Array.isArray(res.monthly_breakdown) ? res.monthly_breakdown : []);
          setDeptBreakdown(Array.isArray(res.department_breakdown) ? res.department_breakdown : []);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingStats(false));
  }, [month]);

  // Filter monthly data by period selection
  const filteredMonthly = (() => {
    if (!monthlyBreakdown.length) return [];
    const sorted = [...monthlyBreakdown].sort((a,b) => a.month - b.month);
    if (period === "3M") return sorted.slice(-3);
    if (period === "6M") return sorted.slice(-6);
    return sorted; // 1Y = all
  })();

  // Stat card values — prefer API, fallback to mock
  const totalGross     = dashStats ? dashStats.gross      : employees.reduce((s,e)=>s+e.gross,0);
  const totalNet       = dashStats ? dashStats.net        : employees.reduce((s,e)=>s+e.net,0);
  const totalDeduction = dashStats ? dashStats.deductions : employees.reduce((s,e)=>s+e.deduction,0);
  const paidCount      = dashStats ? dashStats.paid       : employees.filter(e=>e.status==="Paid").length;
  const pendingCount   = dashStats ? dashStats.pending    : employees.filter(e=>e.status==="Pending").length;
  const unpaidCount    = dashStats ? dashStats.unpaid     : employees.filter(e=>e.status==="Unpaid").length;
  const totalEmployees = dashStats ? dashStats.employee_count : employees.length;

  const filtered = employees.filter(e=>{
    const q=search.toLowerCase();
    return (e.name.toLowerCase().includes(q)||e.id.toLowerCase().includes(q)||e.role.toLowerCase().includes(q))
      &&(dept==="All"||e.dept===dept)&&(status==="All"||e.status===status);
  }).sort((a,b)=>{ let va=a[sortBy],vb=b[sortBy]; if(typeof va==="string"){va=va.toLowerCase();vb=vb.toLowerCase();} return sortDir==="asc"?(va>vb?1:-1):(va<vb?1:-1); });

  const totalPages = Math.max(1,Math.ceil(filtered.length/rowsPerPage));
  const paginated  = filtered.slice((page-1)*rowsPerPage,page*rowsPerPage);

  const toggleSort=(col)=>{if(sortBy===col)setSortDir(d=>d==="asc"?"desc":"asc");else{setSortBy(col);setSortDir("asc");}};
  const toggleRow=(id)=>setSelectedIds(prev=>{const n=new Set(prev);n.has(id)?n.delete(id):n.add(id);return n;});
  const toggleAll=()=>{if(selectedIds.size===paginated.length)setSelectedIds(new Set());else setSelectedIds(new Set(paginated.map(e=>e.id)));};
  const handleSaveEdit=(updated)=>setEmployees(prev=>prev.map(e=>e.id===updated.id?updated:e));
  const handleDelete=()=>{setEmployees(prev=>prev.filter(e=>e.id!==deleteEmp.id));setDeleteEmp(null);};

  const SortIcon=({col})=>(<svg width={9} height={9} viewBox="0 0 24 24" fill="none" stroke={sortBy===col?ACCENT:"#d1d5db"} strokeWidth={2.5} strokeLinecap="round"><path d={sortBy===col&&sortDir==="asc"?"M8 15l4 4 4-4M12 19V5":sortBy===col&&sortDir==="desc"?"M8 9l4-4 4 4M12 5v14":"M8 9l4-4 4 4M8 15l4 4 4-4"}/></svg>);

  const TABS = [
    {key:"salary",     label:"Employee Salary",   icon:ICONS.users},
    {key:"structures", label:"Salary Structures", icon:ICONS.layers},
    {key:"settings",   label:"Payroll Settings",  icon:ICONS.settings},
  ];

  return (
    <div style={{display:"flex",flexDirection:"column",gap:18,fontFamily:"'Nunito','DM Sans',system-ui,sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap');
        @keyframes spin    {from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes modalIn {from{opacity:0;transform:translateY(16px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes shimmer {0%{background-position:200% 0}100%{background-position:-200% 0}}
        .sal-row:hover{background:#fafafa !important;}
        .sal-row:hover .row-actions{opacity:1 !important;}
        .row-actions{opacity:0;transition:opacity 0.15s;}
        .icon-btn:hover{transform:scale(1.12);}
        .icon-btn{transition:transform 0.12s;}
        .ss-card:hover{box-shadow:0 10px 32px rgba(0,0,0,0.12) !important;transform:translateY(-3px) !important;}
        .ss-card{transition:all 0.22s !important;}
        * {font-family:'Nunito',sans-serif;}
      `}</style>

      {/* PAGE HEADER */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div>
          <div style={{fontSize:22,fontWeight:900,color:"#111827",letterSpacing:"-0.7px"}}>Employee Salary</div>
          <div style={{fontSize:12.5,color:"#9ca3af",marginTop:2,fontWeight:600}}>Manage payroll, structures & compliance — {month}</div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button style={{display:"flex",alignItems:"center",gap:7,padding:"9px 16px",background:"#fff",border:"1.5px solid #e5e7eb",borderRadius:10,fontSize:13,fontWeight:700,color:"#374151",cursor:"pointer"}}>
            <Ic d={ICONS.download} stroke="#374151" size={14}/> Export
          </button>
          {activeTab==="salary"&&(
            <button style={{display:"flex",alignItems:"center",gap:7,padding:"9px 18px",background:`linear-gradient(135deg,${ACCENT},#ea580c)`,border:"none",borderRadius:10,fontSize:13,fontWeight:800,color:"#fff",cursor:"pointer",boxShadow:`0 4px 16px ${ACCENT}55`}}>
              <Ic d={ICONS.plus} stroke="#fff" size={14}/> Add Employee
            </button>
          )}
          {activeTab==="structures"&&(
            <button onClick={()=>{setEditStructure(null);setShowAddStructure(true);}}
              style={{display:"flex",alignItems:"center",gap:7,padding:"9px 18px",background:`linear-gradient(135deg,${ACCENT},#ea580c)`,border:"none",borderRadius:10,fontSize:13,fontWeight:800,color:"#fff",cursor:"pointer",boxShadow:`0 4px 16px ${ACCENT}55`}}>
              <Ic d={ICONS.plus} stroke="#fff" size={14}/> Add Structure
            </button>
          )}
        </div>
      </div>

      {/* TAB BAR */}
      <div style={{display:"flex",gap:0,background:"#fff",borderRadius:13,border:"1px solid #f1f5f9",padding:5,width:"fit-content",boxShadow:"0 2px 8px rgba(0,0,0,0.06)"}}>
        {TABS.map(t=>(
          <button key={t.key} onClick={()=>setActiveTab(t.key)}
            style={{display:"flex",alignItems:"center",gap:7,padding:"9px 20px",borderRadius:10,border:"none",cursor:"pointer",fontSize:12.5,fontWeight:activeTab===t.key?900:600,background:activeTab===t.key?`linear-gradient(135deg,${ACCENT},#ea580c)`:"transparent",color:activeTab===t.key?"#fff":"#6b7280",transition:"all 0.2s"}}>
            <Ic d={t.icon} stroke={activeTab===t.key?"#fff":"#9ca3af"} size={13}/>{t.label}
          </button>
        ))}
      </div>

      {/* ── EMPLOYEE SALARY TAB ── */}
      {activeTab==="salary"&&(<>

        {/* STAT CARDS */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
          <StatCard icon={ICONS.wallet}    iconBg="linear-gradient(135deg,#1e293b,#374151)" label="Total Gross Payroll" value={fmtShort(totalGross)}     sub={`${totalEmployees} employee${totalEmployees!==1?"s":""}`} trend={7}  loading={loadingStats}/>
          <StatCard icon={ICONS.trending}  iconBg="linear-gradient(135deg,#16a34a,#15803d)" label="Net Payroll"         value={fmtShort(totalNet)}       sub="After all deductions"   subColor="#16a34a" trend={5}  loading={loadingStats}/>
          <StatCard icon={ICONS.fileText}  iconBg="linear-gradient(135deg,#dc2626,#b91c1c)" label="Total Deductions"    value={fmtShort(totalDeduction)} sub="Tax + PF + Insurance"   trend={-2} loading={loadingStats}/>
          <StatCard icon={ICONS.users}     iconBg="linear-gradient(135deg,#6366f1,#4f46e5)" label="Payment Status"      value={`${paidCount} Paid`}      sub={`${pendingCount} Pending · ${unpaidCount} Unpaid`} subColor="#d97706" loading={loadingStats}/>
        </div>

        {/* QUICK FILTER PILLS */}
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {[
            {label:"All Employees",count:employees.length,color:"#6366f1",bg:"#eef2ff",filter:"All"},
            {label:"Paid",         count:paidCount,        color:"#16a34a",bg:"#f0fdf4",filter:"Paid"},
            {label:"Pending",      count:pendingCount,     color:"#d97706",bg:"#fffbeb",filter:"Pending"},
            {label:"Unpaid",       count:unpaidCount,      color:"#dc2626",bg:"#fef2f2",filter:"Unpaid"},
          ].map(({label,count,color,bg,filter:f})=>(
            <div key={label} onClick={()=>{setStatus(f);setPage(1);}}
              style={{display:"flex",alignItems:"center",gap:7,padding:"8px 16px",background:status===f?bg:bg+"88",borderRadius:99,cursor:"pointer",border:`1.5px solid ${status===f?color+"55":"transparent"}`,transition:"all 0.15s"}}>
              <div style={{width:7,height:7,borderRadius:"50%",background:color}}/>
              <span style={{fontSize:12,fontWeight:800,color}}>{count} {label}</span>
            </div>
          ))}
        </div>

        {/* ── CHARTS — now fed from API ── */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 280px",gap:12}}>
          <SalaryBarChart
            data={filteredMonthly}
            loading={loadingStats}
            period={period}
            onPeriodChange={setPeriod}
          />
          <DeptDonut
            deptData={deptBreakdown}
            loading={loadingStats}
          />
        </div>

        {/* TABLE */}
        <div style={{background:"#fff",borderRadius:16,border:"1px solid #f1f5f9",overflow:"hidden",boxShadow:"0 2px 8px rgba(0,0,0,0.05)"}}>
          <div style={{padding:"13px 20px",borderBottom:"1px solid #f3f4f6",display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,flexWrap:"wrap"}}>
            <div style={{display:"flex",alignItems:"center",gap:9}}>
              <Ic d={ICONS.users} stroke={ACCENT} size={16}/>
              <span style={{fontSize:14,fontWeight:900,color:"#111827"}}>Salary List</span>
              <span style={{background:"#fff7ed",color:ACCENT,borderRadius:20,padding:"2px 10px",fontSize:12,fontWeight:800,border:`1px solid ${ACCENT}33`}}>{filtered.length} records</span>
              {selectedIds.size>0&&<span style={{background:"#eef2ff",color:"#6366f1",borderRadius:20,padding:"2px 10px",fontSize:12,fontWeight:800}}>{selectedIds.size} selected</span>}
            </div>
            <div style={{display:"flex",gap:7,alignItems:"center"}}>
              <select value={month} onChange={e=>setMonth(e.target.value)} style={{background:"#f9fafb",border:"1px solid #e5e7eb",borderRadius:8,padding:"6px 10px",fontSize:11.5,color:"#374151",cursor:"pointer",outline:"none",fontFamily:"Nunito,sans-serif",fontWeight:600}}>
                {["January 2026","February 2026","March 2026","April 2026","May 2026","June 2026"].map(m=><option key={m}>{m}</option>)}
              </select>
              <select value={dept} onChange={e=>{setDept(e.target.value);setPage(1);}} style={{background:"#f9fafb",border:"1px solid #e5e7eb",borderRadius:8,padding:"6px 10px",fontSize:11.5,color:"#374151",cursor:"pointer",outline:"none",fontFamily:"Nunito,sans-serif",fontWeight:600}}>
                {DEPARTMENTS.map(d=><option key={d}>{d}</option>)}
              </select>
              <select value={status} onChange={e=>{setStatus(e.target.value);setPage(1);}} style={{background:"#f9fafb",border:"1px solid #e5e7eb",borderRadius:8,padding:"6px 10px",fontSize:11.5,color:"#374151",cursor:"pointer",outline:"none",fontFamily:"Nunito,sans-serif",fontWeight:600}}>
                {["All","Paid","Pending","Unpaid"].map(s=><option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div style={{padding:"9px 20px",borderBottom:"1px solid #f3f4f6",background:"#fafafa",display:"flex",alignItems:"center",justifyContent:"space-between",gap:10}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:11.5,color:"#6b7280",fontWeight:600}}>Rows per page</span>
              <select value={rowsPerPage} onChange={e=>{setRowsPerPage(Number(e.target.value));setPage(1);}} style={{background:"#fff",border:"1px solid #e5e7eb",borderRadius:7,padding:"4px 8px",fontSize:11.5,color:"#374151",cursor:"pointer",outline:"none",fontFamily:"Nunito,sans-serif",fontWeight:700}}>
                {[5,10,20,50].map(n=><option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:7,background:"#fff",border:"1px solid #e5e7eb",borderRadius:9,padding:"5px 11px"}}>
              <Ic d={ICONS.search} stroke="#9ca3af" size={13}/>
              <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} placeholder="Search name, ID, role…" style={{border:"none",background:"transparent",fontSize:12.5,color:"#374151",outline:"none",width:200,fontFamily:"Nunito,sans-serif"}}/>
              {search&&<button onClick={()=>setSearch("")} style={{background:"none",border:"none",cursor:"pointer",padding:0,display:"flex"}}><Ic d={ICONS.x} stroke="#9ca3af" size={11}/></button>}
            </div>
          </div>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
              <thead>
                <tr style={{background:"#fafafa"}}>
                  <th style={{width:38,padding:"11px 16px",textAlign:"center"}}><input type="checkbox" checked={selectedIds.size===paginated.length&&paginated.length>0} onChange={toggleAll} style={{width:13,height:13,cursor:"pointer",accentColor:ACCENT}}/></th>
                  {[{label:"Emp ID",col:"id"},{label:"Employee",col:"name"},{label:"Department",col:"dept"},{label:"Grade",col:"salaryGrade"},{label:"Paid Days",col:"paid_days"},{label:"Gross",col:"gross"},{label:"Deduction",col:"deduction"},{label:"Net Pay",col:"net"},{label:"Status",col:"status"},{label:"",col:null}].map(({label,col},i)=>(
                    <th key={i} onClick={()=>col&&toggleSort(col)} style={{padding:"11px 12px 11px 0",textAlign:"left",fontSize:10.5,fontWeight:800,color:"#9ca3af",textTransform:"uppercase",letterSpacing:"0.6px",whiteSpace:"nowrap",cursor:col?"pointer":"default",userSelect:"none"}}>
                      <div style={{display:"flex",alignItems:"center",gap:4}}>{label}{col&&<SortIcon col={col}/>}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.length===0?(
                  <tr><td colSpan={10} style={{padding:"60px 0",textAlign:"center",color:"#9ca3af",fontSize:13}}>
                    <div style={{fontSize:32,marginBottom:10}}>🔍</div><div style={{fontWeight:700}}>No salary records found</div>
                  </td></tr>
                ):paginated.map(emp=>{
                  const isChecked=selectedIds.has(emp.id);
                  return (
                    <tr key={emp.id} className="sal-row" style={{borderTop:"1px solid #f3f4f6",background:isChecked?`${ACCENT}06`:"#fff",transition:"background 0.12s"}}>
                      <td style={{padding:"12px 16px",textAlign:"center"}}><input type="checkbox" checked={isChecked} onChange={()=>toggleRow(emp.id)} style={{width:13,height:13,cursor:"pointer",accentColor:ACCENT}}/></td>
                      <td style={{padding:"12px 12px 12px 0"}}><span style={{fontSize:11.5,fontWeight:800,color:"#9ca3af"}}>{emp.id}</span></td>
                      <td style={{padding:"12px 12px 12px 0"}}><div style={{display:"flex",alignItems:"center",gap:9}}><Avatar name={emp.name} size={32}/><div><div style={{fontSize:12.5,fontWeight:800,color:"#111827",whiteSpace:"nowrap"}}>{emp.name}</div><div style={{fontSize:10.5,color:"#9ca3af",marginTop:1,fontWeight:600}}>{emp.role}</div></div></div></td>
                      <td style={{padding:"12px 12px 12px 0"}}><DeptBadge dept={emp.dept}/></td>
                      <td style={{padding:"12px 12px 12px 0"}}><GradeBadge grade={emp.salaryGrade||"Basic"}/></td>
                      <td style={{padding:"12px 12px 12px 0"}}>
                        <div style={{display:"flex",alignItems:"center",gap:6}}>
                          <div style={{width:34,height:5,borderRadius:3,background:"#f1f5f9",overflow:"hidden"}}><div style={{width:`${(emp.paid_days/emp.work_days)*100}%`,height:"100%",background:emp.paid_days===emp.work_days?"#22c55e":"#f59e0b",borderRadius:3}}/></div>
                          <span style={{fontSize:11.5,fontWeight:700,color:"#374151"}}>{emp.paid_days}/{emp.work_days}</span>
                        </div>
                      </td>
                      <td style={{padding:"12px 12px 12px 0"}}><span style={{fontSize:12.5,fontWeight:800,color:"#111827"}}>{fmt(emp.gross)}</span></td>
                      <td style={{padding:"12px 12px 12px 0"}}><span style={{fontSize:12,fontWeight:700,color:"#dc2626"}}>−{fmt(emp.deduction)}</span></td>
                      <td style={{padding:"12px 12px 12px 0"}}><span style={{fontSize:12.5,fontWeight:900,color:"#16a34a"}}>{fmt(emp.net)}</span></td>
                      <td style={{padding:"12px 12px 12px 0"}}><StatusBadge status={emp.status}/></td>
                      <td style={{padding:"12px 20px 12px 0"}}>
                        <div className="row-actions" style={{display:"flex",gap:5}}>
                          <button className="icon-btn" onClick={()=>setViewEmp(emp)} title="View Payslip" style={{width:28,height:28,background:"#fff7ed",border:"1px solid #fed7aa",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}><Ic d={ICONS.fileText} stroke={ACCENT} size={12}/></button>
                          <button className="icon-btn" onClick={()=>setEditEmp(emp)} title="Edit" style={{width:28,height:28,background:"#f0f9ff",border:"1px solid #bae6fd",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}><Ic d={ICONS.edit} stroke="#0369a1" size={12}/></button>
                          <button className="icon-btn" onClick={()=>setDeleteEmp(emp)} title="Delete" style={{width:28,height:28,background:"#fef2f2",border:"1px solid #fecaca",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}><Ic d={ICONS.trash} stroke="#dc2626" size={12}/></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div style={{padding:"11px 20px",borderTop:"1px solid #f3f4f6",background:"#fafafa",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <span style={{fontSize:11.5,color:"#6b7280",fontWeight:600}}>
              Showing <strong style={{color:"#111827"}}>{filtered.length===0?0:Math.min((page-1)*rowsPerPage+1,filtered.length)}</strong>–<strong style={{color:"#111827"}}>{Math.min(page*rowsPerPage,filtered.length)}</strong> of <strong style={{color:"#111827"}}>{filtered.length}</strong>
              {(search||dept!=="All"||status!=="All")?` (filtered from ${employees.length})`:""}</span>
            <div style={{display:"flex",gap:3}}>
              <button onClick={()=>setPage(1)} disabled={page===1} style={{width:28,height:28,background:"#fff",border:"1px solid #e5e7eb",borderRadius:7,cursor:page===1?"not-allowed":"pointer",opacity:page===1?0.4:1,fontSize:11,color:"#6b7280",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>«</button>
              <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} style={{width:28,height:28,background:"#fff",border:"1px solid #e5e7eb",borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",cursor:page===1?"not-allowed":"pointer",opacity:page===1?0.4:1}}><Ic d={ICONS.chevLeft} size={12} stroke="#6b7280"/></button>
              {Array.from({length:totalPages},(_,i)=>i+1).slice(Math.max(0,page-3),page+2).map(n=>(
                <button key={n} onClick={()=>setPage(n)} style={{width:28,height:28,borderRadius:7,border:`1.5px solid ${n===page?ACCENT:"#e5e7eb"}`,background:n===page?"linear-gradient(135deg,"+ACCENT+",#ea580c)":"#fff",fontSize:12,fontWeight:n===page?900:600,color:n===page?"#fff":"#6b7280",cursor:"pointer"}}>{n}</button>
              ))}
              <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages} style={{width:28,height:28,background:"#fff",border:"1px solid #e5e7eb",borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",cursor:page===totalPages?"not-allowed":"pointer",opacity:page===totalPages?0.4:1}}><Ic d={ICONS.chevRight} size={12} stroke="#6b7280"/></button>
              <button onClick={()=>setPage(totalPages)} disabled={page===totalPages} style={{width:28,height:28,background:"#fff",border:"1px solid #e5e7eb",borderRadius:7,cursor:page===totalPages?"not-allowed":"pointer",opacity:page===totalPages?0.4:1,fontSize:11,color:"#6b7280",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>»</button>
            </div>
          </div>
        </div>
      </>)}

      {/* ── SALARY STRUCTURES TAB ── */}
      {activeTab==="structures" && (
        <SalaryStructuresSection
          showAddStructure={showAddStructure}
          setShowAddStructure={setShowAddStructure}
          editStructure={editStructure}
          setEditStructure={setEditStructure}
        />
      )}

      {/* ── PAYROLL SETTINGS TAB ── */}
      {activeTab==="settings" && <PayrollSettingsPanel/>}

      {/* MODALS */}
      {viewEmp   && <PayslipModal emp={viewEmp} month={month} onClose={()=>setViewEmp(null)}/>}
      {editEmp   && <EditSalaryModal emp={editEmp} onClose={()=>setEditEmp(null)} onSave={handleSaveEdit}/>}
      {deleteEmp && <ConfirmModal emp={deleteEmp} onClose={()=>setDeleteEmp(null)} onConfirm={handleDelete}/>}
    </div>
  );
}