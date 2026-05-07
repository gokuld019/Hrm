"use client";
import React, { useState, useCallback } from "react";

const ACCENT = "#f97316";
const DEPARTMENTS = ["All","Engineering","Design","Finance","HR","Marketing","Sales","Operations"];

// ── MOCK DATA ─────────────────────────────────────────────────────────────────
const MOCK_EMPLOYEES = [
  { id:"EMP-001", name:"Arjun Sharma",    dept:"Engineering", role:"Senior Developer",   gross:85000, deduction:8500,  net:76500, tax:6200, pf:3400, paid_days:22, work_days:22, status:"Paid",    joining:"12 Sep 2022", bank:"HDFC ****4521", salaryGrade:"High"   },
  { id:"EMP-002", name:"Priya Nair",      dept:"Design",      role:"UI/UX Designer",     gross:72000, deduction:7200,  net:64800, tax:5100, pf:2880, paid_days:20, work_days:22, status:"Paid",    joining:"08 Mar 2023", bank:"SBI ****7823",  salaryGrade:"Medium" },
  { id:"EMP-003", name:"Rahul Mehta",     dept:"Finance",     role:"Financial Analyst",   gross:68000, deduction:6800,  net:61200, tax:4800, pf:2720, paid_days:22, work_days:22, status:"Pending", joining:"15 Jan 2023", bank:"ICICI ****3341",salaryGrade:"Medium" },
  { id:"EMP-004", name:"Sneha Iyer",      dept:"HR",          role:"HR Manager",          gross:75000, deduction:7500,  net:67500, tax:5500, pf:3000, paid_days:21, work_days:22, status:"Paid",    joining:"20 Jul 2021", bank:"Axis ****9912", salaryGrade:"Medium" },
  { id:"EMP-005", name:"Vikram Pillai",   dept:"Engineering", role:"DevOps Engineer",     gross:90000, deduction:9000,  net:81000, tax:6800, pf:3600, paid_days:22, work_days:22, status:"Paid",    joining:"03 Nov 2022", bank:"HDFC ****2234", salaryGrade:"High"   },
  { id:"EMP-006", name:"Kavya Reddy",     dept:"Marketing",   role:"Marketing Lead",      gross:65000, deduction:6500,  net:58500, tax:4500, pf:2600, paid_days:19, work_days:22, status:"Unpaid",  joining:"25 Apr 2023", bank:"SBI ****5567",  salaryGrade:"Medium" },
  { id:"EMP-007", name:"Arun Kumar",      dept:"Engineering", role:"Backend Developer",   gross:78000, deduction:7800,  net:70200, tax:5700, pf:3120, paid_days:22, work_days:22, status:"Paid",    joining:"11 Feb 2022", bank:"ICICI ****8810",salaryGrade:"Medium" },
  { id:"EMP-008", name:"Divya Menon",     dept:"Sales",       role:"Sales Executive",     gross:60000, deduction:6000,  net:54000, tax:4200, pf:2400, paid_days:18, work_days:22, status:"Pending", joining:"30 Aug 2023", bank:"Kotak ****1122",salaryGrade:"Basic"  },
  { id:"EMP-009", name:"Suresh Babu",     dept:"Design",      role:"Graphic Designer",    gross:58000, deduction:5800,  net:52200, tax:4000, pf:2320, paid_days:22, work_days:22, status:"Paid",    joining:"17 Oct 2023", bank:"HDFC ****6634", salaryGrade:"Basic"  },
  { id:"EMP-010", name:"Ananya Krishnan", dept:"HR",          role:"HR Executive",        gross:55000, deduction:5500,  net:49500, tax:3800, pf:2200, paid_days:21, work_days:22, status:"Paid",    joining:"05 Dec 2023", bank:"SBI ****3398",  salaryGrade:"Basic"  },
  { id:"EMP-011", name:"Mohan Das",       dept:"Operations",  role:"Ops Manager",         gross:80000, deduction:8000,  net:72000, tax:5900, pf:3200, paid_days:22, work_days:22, status:"Paid",    joining:"14 Jun 2021", bank:"ICICI ****7745",salaryGrade:"High"   },
  { id:"EMP-012", name:"Lakshmi Patel",   dept:"Finance",     role:"Sr. Accountant",      gross:70000, deduction:7000,  net:63000, tax:5000, pf:2800, paid_days:20, work_days:22, status:"Pending", joining:"22 Jan 2022", bank:"Axis ****4401", salaryGrade:"Medium" },
  { id:"EMP-013", name:"Ravi Shankar",    dept:"Engineering", role:"Frontend Developer",  gross:73000, deduction:7300,  net:65700, tax:5200, pf:2920, paid_days:22, work_days:22, status:"Paid",    joining:"09 Sep 2022", bank:"HDFC ****8823", salaryGrade:"Medium" },
  { id:"EMP-014", name:"Meena Joshi",     dept:"Marketing",   role:"Content Writer",      gross:52000, deduction:5200,  net:46800, tax:3500, pf:2080, paid_days:22, work_days:22, status:"Unpaid",  joining:"18 Mar 2024", bank:"SBI ****9901",  salaryGrade:"Basic"  },
  { id:"EMP-015", name:"Deepak Singh",    dept:"Sales",       role:"Business Developer",  gross:82000, deduction:8200,  net:73800, tax:6100, pf:3280, paid_days:21, work_days:22, status:"Paid",    joining:"27 Nov 2022", bank:"Kotak ****2278",salaryGrade:"High"   },
];

const SALARY_GRADE_TEMPLATES = {
  Basic:  { basicPct:60, hraPct:20, conveyancePct:5, medicalPct:3, specialPct:7, bonusPct:5 },
  Medium: { basicPct:55, hraPct:22, conveyancePct:6, medicalPct:4, specialPct:8, bonusPct:5 },
  High:   { basicPct:50, hraPct:25, conveyancePct:5, medicalPct:5, specialPct:8, bonusPct:7 },
};

const INITIAL_SALARY_STRUCTURES = [
  { id:"SS-001", name:"Junior Developer Package", grade:"Basic",  ctc:480000, components:[{id:"c1",label:"Basic Salary",value:24000,color:"#16a34a"},{id:"c2",label:"HRA",value:8000,color:"#3b82f6"},{id:"c3",label:"Medical Allowance",value:1200,color:"#06b6d4"},{id:"c4",label:"Conveyance",value:2000,color:"#8b5cf6"},{id:"c5",label:"Special Allowance",value:2800,color:"#f59e0b"},{id:"c6",label:"Performance Bonus",value:2000,color:"#ec4899"}], createdAt:"2024-01-15" },
  { id:"SS-002", name:"Mid-Level Engineer Band",  grade:"Medium", ctc:780000, components:[{id:"c1",label:"Basic Salary",value:35750,color:"#16a34a"},{id:"c2",label:"HRA",value:14300,color:"#3b82f6"},{id:"c3",label:"Medical Allowance",value:2600,color:"#06b6d4"},{id:"c4",label:"Conveyance",value:3900,color:"#8b5cf6"},{id:"c5",label:"Special Allowance",value:5200,color:"#f59e0b"},{id:"c6",label:"Performance Bonus",value:3250,color:"#ec4899"}], createdAt:"2024-02-20" },
  { id:"SS-003", name:"Senior Tech Lead Package", grade:"High",   ctc:1080000,components:[{id:"c1",label:"Basic Salary",value:45000,color:"#16a34a"},{id:"c2",label:"HRA",value:22500,color:"#3b82f6"},{id:"c3",label:"Medical Allowance",value:4500,color:"#06b6d4"},{id:"c4",label:"Conveyance",value:4500,color:"#8b5cf6"},{id:"c5",label:"Special Allowance",value:7200,color:"#f59e0b"},{id:"c6",label:"Performance Bonus",value:6300,color:"#ec4899"}], createdAt:"2024-03-10" },
];

const MONTHLY_DATA = [
  { month:"Jan", salary:420000, allowance:85000, deduction:42000 },
  { month:"Feb", salary:415000, allowance:80000, deduction:41500 },
  { month:"Mar", salary:445000, allowance:92000, deduction:44500 },
  { month:"Apr", salary:430000, allowance:88000, deduction:43000 },
  { month:"May", salary:460000, allowance:95000, deduction:46000 },
  { month:"Jun", salary:475000, allowance:98000, deduction:47500 },
];

const DEFAULT_SETTINGS = {
  pf:           { enabled:true,  label:"Provident Fund (PF)",            rate:12,   note:"% of Basic Salary",  type:"percent" },
  esic:         { enabled:true,  label:"Employee State Insurance (ESIC)", rate:0.75, note:"% of Gross Salary",  type:"percent" },
  pt:           { enabled:true,  label:"Professional Tax (PT)",          rate:200,  note:"Fixed ₹/month",       type:"fixed" },
  tds:          { enabled:true,  label:"TDS / Income Tax",               rate:0,    note:"As per tax slab",     type:"slab" },
  gratuity:     { enabled:false, label:"Gratuity",                       rate:4.81, note:"% of Basic Salary",   type:"percent" },
  bonus:        { enabled:true,  label:"Performance Bonus",              rate:5,    note:"% of Gross Salary",   type:"percent" },
  hra_exemption:{ enabled:true,  label:"HRA Exemption",                  rate:40,   note:"% of Basic Salary",   type:"percent" },
  lwf:          { enabled:false, label:"Labour Welfare Fund (LWF)",      rate:25,   note:"Fixed ₹/month",       type:"fixed" },
  mediclaim:    { enabled:true,  label:"Medical Insurance",              rate:500,  note:"Fixed ₹/month",       type:"fixed" },
  overtime:     { enabled:false, label:"Overtime Calculation",           rate:2,    note:"x hourly rate",        type:"multiplier" },
  conveyance:   { enabled:true,  label:"Conveyance Allowance",           rate:1600, note:"Fixed ₹/month",       type:"fixed" },
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
const AV_COLORS = ["#6366f1","#f97316","#14b8a6","#ec4899","#22c55e","#a855f7","#3b82f6","#eab308","#ef4444","#06b6d4"];
function avatarBg(name) {
  let h=0; for(let i=0;i<name.length;i++) h=(h*31+name.charCodeAt(i))&0xffffffff;
  return AV_COLORS[Math.abs(h)%AV_COLORS.length];
}

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
  Basic:  {bg:"#f0fdf4",color:"#16a34a",border:"#bbf7d0"},
  Medium: {bg:"#fffbeb",color:"#b45309",border:"#fde68a"},
  High:   {bg:"#eef2ff",color:"#4f46e5",border:"#c7d2fe"},
};
function GradeBadge({ grade }) {
  const cfg = GRADE_CFG[grade]||GRADE_CFG.Basic;
  return <span style={{padding:"2px 8px",borderRadius:99,background:cfg.bg,border:`1px solid ${cfg.border}`,fontSize:10.5,fontWeight:800,color:cfg.color}}>{grade}</span>;
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
  search:    "M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z",
  download:  "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M7 10l5 5 5-5 M12 15V3",
  plus:      "M12 5v14M5 12h14",
  edit:      "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7 M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z",
  trash:     "M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6",
  chevLeft:  "M15 18l-6-6 6-6",
  chevRight: "M9 18l6-6-6-6",
  fileText:  "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6M16 13H8M16 17H8M10 9H8",
  trending:  "M23 6l-9.5 9.5-5-5L1 18 M17 6h6v6",
  wallet:    "M21 12V7H5a2 2 0 0 1 0-4h14v4 M3 5v14a2 2 0 0 0 2 2h16v-5 M18 12a2 2 0 0 0 0 4h4v-4z",
  users:     "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  check:     "M20 6L9 17l-5-5",
  x:         "M18 6L6 18M6 6l12 12",
  send:      "M22 2L11 13 M22 2L15 22l-4-9-9-4 22-7z",
  settings:  "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z",
  layers:    "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  shield:    "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  clock:     "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2",
  info:      "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 8h.01M12 12v4",
  building:  "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",
  grip:      "M9 5h.01M9 12h.01M9 19h.01M15 5h.01M15 12h.01M15 19h.01",
  sparkle:   "M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z",
  tag:       "M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z M7 7h.01",
};

function Spinner({ size=13, color="#fff" }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" style={{animation:"spin 0.8s linear infinite",display:"block",flexShrink:0}}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>;
}

function Toggle({ enabled, onChange, size="md" }) {
  const w=size==="sm"?32:42, h=size==="sm"?18:24, knob=size==="sm"?12:18, offset=size==="sm"?3:3;
  return (
    <div onClick={onChange} style={{width:w,height:h,borderRadius:h,background:enabled?ACCENT:"#e5e7eb",cursor:"pointer",position:"relative",transition:"background 0.25s",flexShrink:0,boxShadow:enabled?`0 0 10px ${ACCENT}55`:"none"}}>
      <div style={{position:"absolute",top:offset,left:enabled?w-knob-offset:offset,width:knob,height:knob,borderRadius:"50%",background:"#fff",transition:"left 0.25s",boxShadow:"0 2px 6px rgba(0,0,0,0.22)"}}/>
    </div>
  );
}

// ── COLOR PICKER ──────────────────────────────────────────────────────────────
function ColorDot({ colors, selected, onSelect }) {
  return (
    <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
      {colors.map(c=>(
        <div key={c} onClick={()=>onSelect(c)}
          style={{width:18,height:18,borderRadius:5,background:c,cursor:"pointer",border:`2px solid ${selected===c?"#111827":"transparent"}`,boxSizing:"border-box",transition:"transform 0.1s",transform:selected===c?"scale(1.2)":"scale(1)"}}>
        </div>
      ))}
    </div>
  );
}

// ── ADD COMPONENT MODAL ───────────────────────────────────────────────────────
function AddComponentModal({ onClose, onAdd, existingLabel="" }) {
  const [label, setLabel] = useState(existingLabel);
  const [value, setValue] = useState(0);
  const [color, setColor] = useState(COMP_COLORS[0]);
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
            <input value={label} onChange={e=>setLabel(e.target.value)} placeholder="e.g. Internet Allowance"
              style={{width:"100%",padding:"9px 12px",border:"1px solid #e5e7eb",borderRadius:9,fontSize:13,outline:"none",boxSizing:"border-box",fontFamily:"Nunito,sans-serif"}}
              onFocus={e=>e.target.style.borderColor=ACCENT} onBlur={e=>e.target.style.borderColor="#e5e7eb"}/>
          </div>
          <div>
            <label style={{fontSize:11.5,fontWeight:700,color:"#374151",display:"block",marginBottom:5}}>Monthly Amount</label>
            <div style={{position:"relative"}}>
              <span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",fontSize:12,color:"#9ca3af"}}>₹</span>
              <input type="number" value={value} onChange={e=>setValue(Number(e.target.value))}
                style={{width:"100%",padding:"9px 12px 9px 26px",border:"1px solid #e5e7eb",borderRadius:9,fontSize:13,outline:"none",boxSizing:"border-box",fontFamily:"Nunito,sans-serif"}}
                onFocus={e=>e.target.style.borderColor=ACCENT} onBlur={e=>e.target.style.borderColor="#e5e7eb"}/>
            </div>
          </div>
          <div>
            <label style={{fontSize:11.5,fontWeight:700,color:"#374151",display:"block",marginBottom:8}}>Color Label</label>
            <ColorDot colors={COMP_COLORS} selected={color} onSelect={setColor}/>
          </div>
        </div>
        <div style={{display:"flex",gap:9,marginTop:18}}>
          <button onClick={onClose} style={{flex:1,padding:"9px 0",background:"#fff",border:"1px solid #e5e7eb",borderRadius:9,fontSize:13,fontWeight:700,color:"#374151",cursor:"pointer",fontFamily:"Nunito,sans-serif"}}>Cancel</button>
          <button onClick={()=>{if(label.trim())onAdd({id:`c${Date.now()}`,label:label.trim(),value,color});}}
            disabled={!label.trim()}
            style={{flex:2,padding:"9px 0",background:label.trim()?ACCENT:"#d1d5db",border:"none",borderRadius:9,fontSize:13,fontWeight:800,color:"#fff",cursor:label.trim()?"pointer":"not-allowed",fontFamily:"Nunito,sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
            <Ic d={ICONS.plus} stroke="#fff" size={13}/> Add Component
          </button>
        </div>
      </div>
    </div>
  );
}

// ── EDIT COMPONENT INLINE ─────────────────────────────────────────────────────
function ComponentCard({ comp, onEdit, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({label:comp.label, value:comp.value, color:comp.color});

  if (editing) {
    return (
      <div style={{padding:"10px 12px",background:"#fff",borderRadius:11,border:`2px solid ${comp.color}`,boxShadow:`0 0 0 3px ${comp.color}22`}}>
        <div style={{display:"flex",gap:7,marginBottom:8}}>
          <input value={draft.label} onChange={e=>setDraft(p=>({...p,label:e.target.value}))}
            style={{flex:1,padding:"6px 9px",border:"1px solid #e5e7eb",borderRadius:7,fontSize:12,outline:"none",fontFamily:"Nunito,sans-serif",fontWeight:700}}
            onFocus={e=>e.target.style.borderColor=comp.color} onBlur={e=>e.target.style.borderColor="#e5e7eb"}/>
          <div style={{position:"relative",width:100}}>
            <span style={{position:"absolute",left:8,top:"50%",transform:"translateY(-50%)",fontSize:11,color:"#9ca3af"}}>₹</span>
            <input type="number" value={draft.value} onChange={e=>setDraft(p=>({...p,value:Number(e.target.value)}))}
              style={{width:"100%",padding:"6px 8px 6px 20px",border:"1px solid #e5e7eb",borderRadius:7,fontSize:12,outline:"none",fontFamily:"Nunito,sans-serif",fontWeight:700,boxSizing:"border-box"}}/>
          </div>
        </div>
        <div style={{marginBottom:8}}><ColorDot colors={COMP_COLORS} selected={draft.color} onSelect={c=>setDraft(p=>({...p,color:c}))}/></div>
        <div style={{display:"flex",gap:6}}>
          <button onClick={()=>setEditing(false)} style={{flex:1,padding:"5px 0",background:"#f3f4f6",border:"none",borderRadius:7,fontSize:11.5,fontWeight:700,cursor:"pointer",fontFamily:"Nunito,sans-serif",color:"#6b7280"}}>Cancel</button>
          <button onClick={()=>{onEdit({...comp,...draft});setEditing(false);}} style={{flex:2,padding:"5px 0",background:ACCENT,border:"none",borderRadius:7,fontSize:11.5,fontWeight:800,color:"#fff",cursor:"pointer",fontFamily:"Nunito,sans-serif"}}>Save</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{padding:"10px 12px",background:"#fafafa",borderRadius:11,border:"1px solid #f1f5f9",display:"flex",alignItems:"center",justifyContent:"space-between",transition:"all 0.15s",position:"relative"}}>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <div style={{width:10,height:10,borderRadius:3,background:comp.color,flexShrink:0}}/>
        <span style={{fontSize:12.5,fontWeight:700,color:"#374151"}}>{comp.label}</span>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:6}}>
        <span style={{fontSize:13,fontWeight:800,color:comp.color}}>{fmt(comp.value)}</span>
        <button onClick={()=>setEditing(true)}
          style={{width:24,height:24,background:"#fff",border:"1px solid #e5e7eb",borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
          <Ic d={ICONS.edit} stroke="#6b7280" size={10}/>
        </button>
        <button onClick={()=>onDelete(comp.id)}
          style={{width:24,height:24,background:"#fef2f2",border:"1px solid #fecaca",borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
          <Ic d={ICONS.trash} stroke="#dc2626" size={10}/>
        </button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ── SALARY STRUCTURE MODAL (redesigned)
// ════════════════════════════════════════════════════════════════════════════
function SalaryStructureModal({ onClose, onSave, editItem, globalSettings }) {
  const isEdit = !!editItem;
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [showAddComp, setShowAddComp] = useState(false);

  const defaultComponents = [
    {id:"c1",label:"Basic Salary",    value:24000, color:"#16a34a"},
    {id:"c2",label:"HRA",             value:8000,  color:"#3b82f6"},
    {id:"c3",label:"Medical Allowance",value:1200, color:"#06b6d4"},
    {id:"c4",label:"Conveyance",      value:2000,  color:"#8b5cf6"},
  ];

  const [form, setForm] = useState({
    name:       editItem?.name  || "",
    grade:      editItem?.grade || "Basic",
    ctc:        editItem?.ctc   || 480000,
    components: editItem?.components ? JSON.parse(JSON.stringify(editItem.components)) : defaultComponents,
    deductions: {
      pf:       editItem?.deductions?.pf       ?? true,
      esic:     editItem?.deductions?.esic      ?? false,
      pt:       editItem?.deductions?.pt        ?? true,
      tds:      editItem?.deductions?.tds       ?? true,
      gratuity: editItem?.deductions?.gratuity  ?? false,
      conveyance:editItem?.deductions?.conveyance?? true,
    },
    // Editable deduction values
    dedValues: {
      pf:       editItem?.dedValues?.pf        ?? 12,
      esic:     editItem?.dedValues?.esic       ?? 0.75,
      pt:       editItem?.dedValues?.pt         ?? 200,
      gratuity: editItem?.dedValues?.gratuity   ?? 4.81,
    }
  });

  const [editingDed, setEditingDed] = useState(null); // key of deduction being edited
  const [dedDraft, setDedDraft] = useState(0);

  const monthlyCTC = Math.round(form.ctc / 12);
  const totalEarnings = form.components.reduce((s,c)=>s+c.value, 0);

  const applyTemplate = (grade, ctc) => {
    const tpl = SALARY_GRADE_TEMPLATES[grade];
    const monthly = Math.round(ctc / 12);
    const newComps = [
      {id:"c1",label:"Basic Salary",    value:Math.round(monthly*tpl.basicPct/100),      color:"#16a34a"},
      {id:"c2",label:"HRA",             value:Math.round(monthly*tpl.hraPct/100),         color:"#3b82f6"},
      {id:"c3",label:"Medical Allowance",value:Math.round(monthly*tpl.medicalPct/100),    color:"#06b6d4"},
      {id:"c4",label:"Conveyance",      value:Math.round(monthly*tpl.conveyancePct/100),  color:"#8b5cf6"},
      {id:"c5",label:"Special Allowance",value:Math.round(monthly*tpl.specialPct/100),   color:"#f59e0b"},
      {id:"c6",label:"Performance Bonus",value:Math.round(monthly*tpl.bonusPct/100),      color:"#ec4899"},
    ];
    setForm(p=>({...p, grade, ctc, components:newComps}));
  };

  const basicComp = form.components.find(c=>c.label==="Basic Salary");
  const basicVal = basicComp?.value || 0;
  const pfAmt       = form.deductions.pf       ? Math.round(basicVal*form.dedValues.pf/100) : 0;
  const esicAmt     = form.deductions.esic      ? Math.round(totalEarnings*form.dedValues.esic/100) : 0;
  const ptAmt       = form.deductions.pt        ? form.dedValues.pt : 0;
  const gratuityAmt = form.deductions.gratuity  ? Math.round(basicVal*form.dedValues.gratuity/100) : 0;
  const totalDeductions = pfAmt + esicAmt + ptAmt + gratuityAmt;
  const netMonthly = totalEarnings - totalDeductions;

  const setDed = (k,v) => setForm(p=>({...p, deductions:{...p.deductions,[k]:v}}));
  const setDedVal = (k,v) => setForm(p=>({...p, dedValues:{...p.dedValues,[k]:v}}));

  const handleAddComp = (comp) => {
    setForm(p=>({...p, components:[...p.components, comp]}));
    setShowAddComp(false);
  };
  const handleEditComp = (updated) => {
    setForm(p=>({...p, components:p.components.map(c=>c.id===updated.id?updated:c)}));
  };
  const handleDeleteComp = (id) => {
    setForm(p=>({...p, components:p.components.filter(c=>c.id!==id)}));
  };

  // Also include custom settings components in deductions
  const customSettingsKeys = Object.keys(globalSettings).filter(k=>globalSettings[k]._custom);

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    await new Promise(r => setTimeout(r, 900));
    const newItem = {
      id: editItem?.id || `SS-${String(Date.now()).slice(-4)}`,
      ...form,
      createdAt: editItem?.createdAt || new Date().toISOString().slice(0,10),
    };
    onSave(newItem);
    setSaving(false);
    onClose();
  };

  const STEPS = [{n:1,label:"Basic Info"},{n:2,label:"Components"},{n:3,label:"Deductions"}];

  const DEDUCTION_ITEMS = [
    {k:"pf",      label:"Provident Fund (PF)", note:`${form.dedValues.pf}% of Basic`,       amt:pfAmt,       valueKey:"pf",  valueType:"percent"},
    {k:"esic",    label:"ESIC",                note:`${form.dedValues.esic}% of Gross`,     amt:esicAmt,     valueKey:"esic",valueType:"percent"},
    {k:"pt",      label:"Professional Tax",    note:`Fixed ₹${form.dedValues.pt}/month`,    amt:ptAmt,       valueKey:"pt",  valueType:"fixed"},
    {k:"tds",     label:"TDS / Income Tax",    note:"As per slab",                          amt:0,           valueKey:null,  valueType:"slab"},
    {k:"gratuity",label:"Gratuity",            note:`${form.dedValues.gratuity}% of Basic`, amt:gratuityAmt, valueKey:"gratuity",valueType:"percent"},
    {k:"conveyance",label:"Conveyance Limit",  note:"Statutory exemption",                  amt:0,           valueKey:null,  valueType:"info"},
  ];

  return (
    <>
    <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,0.75)",backdropFilter:"blur(10px)",zIndex:700,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div onClick={e=>e.stopPropagation()}
        style={{background:"#fff",borderRadius:22,width:"100%",maxWidth:660,maxHeight:"94vh",display:"flex",flexDirection:"column",boxShadow:"0 48px 120px rgba(0,0,0,0.35)",animation:"modalIn 0.3s cubic-bezier(.34,1.2,.64,1)"}}>

        {/* Header */}
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

        {/* Step Indicator */}
        <div style={{display:"flex",alignItems:"center",padding:"16px 26px",background:"#f8fafc",borderBottom:"1px solid #f1f5f9",flexShrink:0}}>
          {STEPS.map((s,i) => (
            <React.Fragment key={s.n}>
              <div onClick={()=>setStep(s.n)} style={{display:"flex",alignItems:"center",gap:9,cursor:"pointer",userSelect:"none"}}>
                <div style={{width:28,height:28,borderRadius:9,background:step===s.n?`linear-gradient(135deg,${ACCENT},#ea580c)`:step>s.n?"#22c55e":"#e5e7eb",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.25s",boxShadow:step===s.n?`0 4px 12px ${ACCENT}44`:"none"}}>
                  {step>s.n?<Ic d={ICONS.check} stroke="#fff" size={12} sw={2.5}/>:<span style={{fontSize:11.5,fontWeight:900,color:step===s.n?"#fff":"#9ca3af"}}>{s.n}</span>}
                </div>
                <span style={{fontSize:12.5,fontWeight:step===s.n?800:500,color:step===s.n?"#111827":"#9ca3af",transition:"color 0.2s"}}>{s.label}</span>
              </div>
              {i<STEPS.length-1&&<div style={{flex:1,height:2,background:step>s.n?"linear-gradient(90deg,#22c55e,#22c55e)":"#e5e7eb",margin:"0 14px",borderRadius:2,transition:"background 0.3s"}}/>}
            </React.Fragment>
          ))}
        </div>

        {/* Body */}
        <div style={{flex:1,overflowY:"auto",padding:"22px 26px"}}>

          {/* STEP 1: Basic Info */}
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
                  {["Basic","Medium","High"].map(g => {
                    const desc = {Basic:"₹3L–6L CTC/yr\nEntry level",Medium:"₹6L–10L CTC/yr\nMid level",High:"₹10L+ CTC/yr\nSenior level"};
                    const cfg = GRADE_CFG[g];
                    const active = form.grade===g;
                    return (
                      <button key={g} onClick={()=>applyTemplate(g,form.ctc)}
                        style={{padding:"14px 10px",border:`2px solid ${active?cfg.color:cfg.border}`,borderRadius:14,background:active?cfg.bg:"#fafafa",cursor:"pointer",textAlign:"center",transition:"all 0.18s",boxShadow:active?`0 4px 14px ${cfg.color}22`:"none",transform:active?"scale(1.02)":"scale(1)"}}>
                        <div style={{fontSize:14,fontWeight:900,color:active?cfg.color:"#374151",marginBottom:4}}>{g}</div>
                        {desc[g].split("\n").map((l,i)=><div key={i} style={{fontSize:10.5,color:active?cfg.color:"#9ca3af",lineHeight:1.5}}>{l}</div>)}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div>
                  <label style={{fontSize:11.5,fontWeight:700,color:"#374151",display:"block",marginBottom:6}}>Annual CTC <span style={{fontSize:10,color:"#9ca3af"}}>(auto-fills components)</span></label>
                  <div style={{position:"relative"}}>
                    <span style={{position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",fontSize:12.5,color:"#9ca3af",fontWeight:600}}>₹</span>
                    <input type="number" value={form.ctc} onChange={e=>applyTemplate(form.grade,Number(e.target.value))}
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

          {/* STEP 2: Components */}
          {step===2 && (
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div style={{padding:"11px 14px",background:"linear-gradient(135deg,#fff7ed,#ffedd5)",borderRadius:10,border:"1px solid #fed7aa",fontSize:12,color:"#c2410c",display:"flex",alignItems:"center",gap:9}}>
                <Ic d={ICONS.info} stroke={ACCENT} size={14}/>
                <span>All values are <strong>monthly</strong>. Add, edit or remove any component below.</span>
              </div>

              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {form.components.map(comp=>(
                  <ComponentCard key={comp.id} comp={comp} onEdit={handleEditComp} onDelete={handleDeleteComp}/>
                ))}
              </div>

              {/* Add component button */}
              <button onClick={()=>setShowAddComp(true)}
                style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,padding:"11px 0",background:"#fafafa",border:`2px dashed ${ACCENT}55`,borderRadius:12,fontSize:13,fontWeight:700,color:ACCENT,cursor:"pointer",transition:"all 0.15s",fontFamily:"Nunito,sans-serif"}}
                onMouseEnter={e=>{e.currentTarget.style.background="#fff7ed";e.currentTarget.style.borderColor=ACCENT;}}
                onMouseLeave={e=>{e.currentTarget.style.background="#fafafa";e.currentTarget.style.borderColor=`${ACCENT}55`;}}>
                <Ic d={ICONS.plus} stroke={ACCENT} size={15}/> Add New Component
              </button>

              {/* Summary */}
              <div style={{background:"linear-gradient(135deg,#1e293b,#0f172a)",borderRadius:14,padding:"16px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",boxShadow:"0 8px 24px rgba(0,0,0,0.2)"}}>
                <div>
                  <div style={{fontSize:10.5,color:"#94a3b8",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:2}}>Total Monthly</div>
                  <div style={{fontSize:24,fontWeight:900,color:"#fff",letterSpacing:"-0.8px"}}>{fmt(totalEarnings)}</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:10.5,color:"#94a3b8",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:2}}>Annual CTC</div>
                  <div style={{fontSize:17,fontWeight:800,color:ACCENT}}>{fmt(totalEarnings*12)}</div>
                </div>
              </div>

              {/* Visual bar */}
              <div style={{borderRadius:8,overflow:"hidden",height:8,display:"flex",gap:1}}>
                {form.components.map(c=>(
                  <div key={c.id} style={{flex:c.value,background:c.color,transition:"flex 0.3s",minWidth:c.value>0?2:0}}/>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Deductions */}
          {step===3 && (
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <div style={{fontSize:13,fontWeight:800,color:"#374151",marginBottom:2}}>Statutory Deductions</div>
              {DEDUCTION_ITEMS.map(({k,label,note,amt,valueKey,valueType})=>(
                <div key={k} style={{borderRadius:12,border:`1px solid ${form.deductions[k]?"#fed7aa":"#f1f5f9"}`,background:form.deductions[k]?"#fffbeb":"#fafafa",overflow:"hidden",transition:"all 0.2s"}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 14px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <Toggle enabled={form.deductions[k]} onChange={()=>setDed(k,!form.deductions[k])}/>
                      <div>
                        <div style={{fontSize:13,fontWeight:700,color:form.deductions[k]?"#111827":"#9ca3af"}}>{label}</div>
                        <div style={{fontSize:11,color:form.deductions[k]?ACCENT:"#9ca3af",marginTop:1}}>{note}</div>
                      </div>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      {form.deductions[k] && amt>0 && (
                        <span style={{fontSize:13,fontWeight:800,color:"#dc2626"}}>−{fmt(amt)}</span>
                      )}
                      {form.deductions[k] && valueKey && editingDed!==k && (
                        <button onClick={()=>{setEditingDed(k);setDedDraft(form.dedValues[k]);}}
                          style={{width:26,height:26,background:"#fff",border:"1px solid #e5e7eb",borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
                          <Ic d={ICONS.edit} stroke="#6b7280" size={10}/>
                        </button>
                      )}
                    </div>
                  </div>
                  {/* Inline edit */}
                  {editingDed===k && valueKey && (
                    <div style={{padding:"10px 14px",borderTop:"1px solid #fde68a",background:"#fff7ed",display:"flex",alignItems:"center",gap:8}}>
                      <span style={{fontSize:12,color:"#9ca3af",fontWeight:600}}>Value:</span>
                      <div style={{position:"relative",flex:1}}>
                        <input type="number" value={dedDraft} onChange={e=>setDedDraft(Number(e.target.value))} step={valueType==="percent"?0.01:1}
                          style={{width:"100%",padding:"6px 32px 6px 10px",border:"1.5px solid #fed7aa",borderRadius:7,fontSize:13,fontWeight:700,outline:"none",fontFamily:"Nunito,sans-serif",boxSizing:"border-box"}}/>
                        <span style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",fontSize:11,color:"#9ca3af"}}>{valueType==="percent"?"%":"₹"}</span>
                      </div>
                      <button onClick={()=>{setDedVal(valueKey,dedDraft);setEditingDed(null);}}
                        style={{padding:"6px 12px",background:ACCENT,border:"none",borderRadius:7,fontSize:12,fontWeight:800,color:"#fff",cursor:"pointer",fontFamily:"Nunito,sans-serif"}}>Save</button>
                      <button onClick={()=>setEditingDed(null)}
                        style={{padding:"6px 10px",background:"#fff",border:"1px solid #e5e7eb",borderRadius:7,fontSize:12,fontWeight:700,color:"#6b7280",cursor:"pointer",fontFamily:"Nunito,sans-serif"}}>✕</button>
                    </div>
                  )}
                </div>
              ))}

              {/* Net Summary */}
              <div style={{borderRadius:14,overflow:"hidden",border:"1px solid #f1f5f9",marginTop:4}}>
                <div style={{padding:"11px 16px",background:"#f8fafc",borderBottom:"1px solid #f1f5f9"}}>
                  <span style={{fontSize:11,fontWeight:800,color:"#9ca3af",textTransform:"uppercase",letterSpacing:"0.6px"}}>Monthly Pay Summary</span>
                </div>
                {[
                  {label:"Gross Earnings",     value:totalEarnings, color:"#111827",bold:true},
                  form.deductions.pf&&pfAmt>0     &&{label:"PF Deduction",    value:-pfAmt,       color:"#dc2626"},
                  form.deductions.esic&&esicAmt>0  &&{label:"ESIC Deduction",  value:-esicAmt,     color:"#dc2626"},
                  form.deductions.pt&&ptAmt>0      &&{label:"Professional Tax",value:-ptAmt,       color:"#dc2626"},
                  form.deductions.gratuity&&gratuityAmt>0&&{label:"Gratuity",  value:-gratuityAmt, color:"#dc2626"},
                ].filter(Boolean).map((r,i)=>(
                  <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 16px",borderBottom:"1px solid #f9fafb"}}>
                    <span style={{fontSize:12.5,color:"#6b7280"}}>{r.label}</span>
                    <span style={{fontSize:13,fontWeight:r.bold?900:700,color:r.color}}>{r.value>=0?fmt(r.value):`−${fmt(Math.abs(r.value))}`}</span>
                  </div>
                ))}
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 16px",background:"linear-gradient(135deg,#1e293b,#0f172a)"}}>
                  <span style={{fontSize:14,fontWeight:700,color:"#94a3b8"}}>Net Take Home</span>
                  <span style={{fontSize:20,fontWeight:900,color:"#fff"}}>{fmt(netMonthly)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{padding:"15px 26px",borderTop:"1px solid #f1f5f9",display:"flex",justifyContent:"space-between",alignItems:"center",background:"#fafafa",borderRadius:"0 0 22px 22px",flexShrink:0}}>
          <div style={{display:"flex",gap:8}}>
            <button onClick={onClose} style={{padding:"9px 20px",background:"#fff",border:"1px solid #e5e7eb",borderRadius:10,fontSize:13,fontWeight:700,color:"#374151",cursor:"pointer",fontFamily:"Nunito,sans-serif"}}>Cancel</button>
            {step>1&&<button onClick={()=>setStep(s=>s-1)} style={{padding:"9px 20px",background:"#fff",border:"1px solid #e5e7eb",borderRadius:10,fontSize:13,fontWeight:700,color:"#374151",cursor:"pointer",fontFamily:"Nunito,sans-serif"}}>← Back</button>}
          </div>
          {step<3
            ?<button onClick={()=>setStep(s=>s+1)} disabled={step===1&&!form.name.trim()}
                style={{padding:"10px 24px",background:step===1&&!form.name.trim()?"#d1d5db":"linear-gradient(135deg,"+ACCENT+",#ea580c)",border:"none",borderRadius:10,fontSize:13,fontWeight:800,color:"#fff",cursor:step===1&&!form.name.trim()?"not-allowed":"pointer",fontFamily:"Nunito,sans-serif",boxShadow:step===1&&!form.name.trim()?"":`0 4px 14px ${ACCENT}44`}}>
                Next Step →
              </button>
            :<button onClick={handleSave} disabled={saving}
                style={{padding:"10px 24px",background:saving?"#d1d5db":"linear-gradient(135deg,"+ACCENT+",#ea580c)",border:"none",borderRadius:10,fontSize:13,fontWeight:800,color:"#fff",cursor:saving?"not-allowed":"pointer",fontFamily:"Nunito,sans-serif",display:"flex",alignItems:"center",gap:8,boxShadow:saving?"":(`0 4px 14px ${ACCENT}44`)}}>
                {saving?<><Spinner size={13}/>&nbsp;Saving…</>:<><Ic d={ICONS.check} stroke="#fff" size={13} sw={2.5}/>{isEdit?"Update Structure":"Save Structure"}</>}
              </button>}
        </div>
      </div>
    </div>
    {showAddComp && <AddComponentModal onClose={()=>setShowAddComp(false)} onAdd={handleAddComp}/>}
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ── ADD CUSTOM SETTING MODAL
// ════════════════════════════════════════════════════════════════════════════
function AddSettingModal({ onClose, onAdd }) {
  const [label, setLabel] = useState("");
  const [note,  setNote]  = useState("");
  const [rate,  setRate]  = useState(0);
  const [type,  setType]  = useState("percent");

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",backdropFilter:"blur(8px)",zIndex:900,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:20,width:400,padding:24,boxShadow:"0 32px 80px rgba(0,0,0,0.24)",animation:"modalIn 0.22s ease"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:36,height:36,borderRadius:10,background:`linear-gradient(135deg,${ACCENT},#ea580c)`,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <Ic d={ICONS.sparkle} stroke="#fff" size={15}/>
            </div>
            <div style={{fontSize:15,fontWeight:900,color:"#111827"}}>New Payroll Component</div>
          </div>
          <button onClick={onClose} style={{width:28,height:28,borderRadius:8,background:"#f3f4f6",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Ic d={ICONS.x} stroke="#6b7280" size={12}/></button>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div>
            <label style={{fontSize:11.5,fontWeight:700,color:"#374151",display:"block",marginBottom:5}}>Component Name <span style={{color:"#ef4444"}}>*</span></label>
            <input value={label} onChange={e=>setLabel(e.target.value)} placeholder="e.g. Internet Allowance"
              style={{width:"100%",padding:"10px 13px",border:"1.5px solid #e5e7eb",borderRadius:9,fontSize:13,fontWeight:600,color:"#111827",outline:"none",boxSizing:"border-box",fontFamily:"Nunito,sans-serif"}}
              onFocus={e=>e.target.style.borderColor=ACCENT} onBlur={e=>e.target.style.borderColor="#e5e7eb"}/>
          </div>
          <div>
            <label style={{fontSize:11.5,fontWeight:700,color:"#374151",display:"block",marginBottom:5}}>Type</label>
            <div style={{display:"flex",gap:7}}>
              {[["percent","Percentage"],["fixed","Fixed ₹"],["multiplier","Multiplier"]].map(([v,l])=>(
                <button key={v} onClick={()=>setType(v)}
                  style={{flex:1,padding:"7px 0",borderRadius:8,border:`2px solid ${type===v?ACCENT:"#e5e7eb"}`,background:type===v?"#fff7ed":"#fff",fontSize:11.5,fontWeight:700,color:type===v?ACCENT:"#9ca3af",cursor:"pointer",fontFamily:"Nunito,sans-serif"}}>
                  {l}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label style={{fontSize:11.5,fontWeight:700,color:"#374151",display:"block",marginBottom:5}}>Rate / Value</label>
            <div style={{position:"relative"}}>
              <input type="number" value={rate} onChange={e=>setRate(Number(e.target.value))} step={type==="percent"?0.01:1}
                style={{width:"100%",padding:"10px 36px 10px 13px",border:"1.5px solid #e5e7eb",borderRadius:9,fontSize:13,fontWeight:700,outline:"none",boxSizing:"border-box",fontFamily:"Nunito,sans-serif"}}
                onFocus={e=>e.target.style.borderColor=ACCENT} onBlur={e=>e.target.style.borderColor="#e5e7eb"}/>
              <span style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",fontSize:12,color:"#9ca3af",fontWeight:600}}>{type==="percent"?"%":type==="fixed"?"₹":"x"}</span>
            </div>
          </div>
          <div>
            <label style={{fontSize:11.5,fontWeight:700,color:"#374151",display:"block",marginBottom:5}}>Note / Description</label>
            <input value={note} onChange={e=>setNote(e.target.value)} placeholder="e.g. 2% of Gross Salary"
              style={{width:"100%",padding:"10px 13px",border:"1.5px solid #e5e7eb",borderRadius:9,fontSize:13,color:"#374151",outline:"none",boxSizing:"border-box",fontFamily:"Nunito,sans-serif"}}
              onFocus={e=>e.target.style.borderColor=ACCENT} onBlur={e=>e.target.style.borderColor="#e5e7eb"}/>
          </div>
        </div>
        <div style={{display:"flex",gap:9,marginTop:20}}>
          <button onClick={onClose} style={{flex:1,padding:"10px 0",background:"#fff",border:"1px solid #e5e7eb",borderRadius:10,fontSize:13,fontWeight:700,color:"#374151",cursor:"pointer",fontFamily:"Nunito,sans-serif"}}>Cancel</button>
          <button onClick={()=>{if(label.trim())onAdd({label:label.trim(),note:note||`${rate}${type==="percent"?"%":"₹"}/month`,rate,type,enabled:true,_custom:true});}}
            disabled={!label.trim()}
            style={{flex:2,padding:"10px 0",background:label.trim()?`linear-gradient(135deg,${ACCENT},#ea580c)`:"#d1d5db",border:"none",borderRadius:10,fontSize:13,fontWeight:800,color:"#fff",cursor:label.trim()?"pointer":"not-allowed",fontFamily:"Nunito,sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:7}}>
            <Ic d={ICONS.plus} stroke="#fff" size={13}/> Add Component
          </button>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ── PAYROLL SETTINGS PANEL
// ════════════════════════════════════════════════════════════════════════════
function PayrollSettingsPanel({ settings, onChange, onAdd }) {
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);
  const [showAddSetting, setShowAddSetting] = useState(false);
  const [editingKey, setEditingKey] = useState(null);
  const [editDraft,  setEditDraft]  = useState(0);

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleAddSetting = (item) => {
    const key = item.label.toLowerCase().replace(/\s+/g,"_").replace(/[^a-z_]/g,"") + "_" + Date.now();
    onAdd(key, item);
    setShowAddSetting(false);
  };

  const SETTING_GROUPS = [
    { title:"Statutory Deductions",   icon:ICONS.shield,   iconColor:"#dc2626", items:["pf","esic","pt","tds","gratuity","lwf"] },
    { title:"Benefits & Allowances",  icon:ICONS.wallet,   iconColor:"#16a34a", items:["hra_exemption","mediclaim","bonus","conveyance"] },
    { title:"Advanced Settings",      icon:ICONS.settings, iconColor:"#6366f1", items:["overtime"] },
  ];

  const customKeys = Object.keys(settings).filter(k=>settings[k]._custom);

  return (
    <>
    <div style={{background:"#fff",borderRadius:16,border:"1px solid #f1f5f9",overflow:"hidden",boxShadow:"0 2px 8px rgba(0,0,0,0.05)"}}>
      {/* Header */}
      <div style={{padding:"16px 22px",borderBottom:"1px solid #f3f4f6",background:"linear-gradient(135deg,#fafafa,#f3f4f6)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:38,height:38,borderRadius:11,background:"linear-gradient(135deg,#1e293b,#374151)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 12px rgba(0,0,0,0.2)"}}>
            <Ic d={ICONS.settings} stroke={ACCENT} size={16}/>
          </div>
          <div>
            <div style={{fontSize:15,fontWeight:900,color:"#111827"}}>Payroll Configuration</div>
            <div style={{fontSize:11.5,color:"#9ca3af",marginTop:1}}>Manage components, rates & compliance</div>
          </div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>setShowAddSetting(true)}
            style={{display:"flex",alignItems:"center",gap:7,padding:"9px 16px",background:"#fff7ed",border:`1.5px solid ${ACCENT}44`,borderRadius:10,fontSize:12.5,fontWeight:800,color:ACCENT,cursor:"pointer",fontFamily:"Nunito,sans-serif",transition:"all 0.15s"}}
            onMouseEnter={e=>e.currentTarget.style.background="#fff"}
            onMouseLeave={e=>e.currentTarget.style.background="#fff7ed"}>
            <Ic d={ICONS.plus} stroke={ACCENT} size={13}/> Add Component
          </button>
          <button onClick={handleSave} disabled={saving||saved}
            style={{display:"flex",alignItems:"center",gap:7,padding:"9px 16px",background:saved?"#16a34a":`linear-gradient(135deg,${ACCENT},#ea580c)`,border:"none",borderRadius:10,fontSize:12.5,fontWeight:800,color:"#fff",cursor:saving||saved?"not-allowed":"pointer",fontFamily:"Nunito,sans-serif",boxShadow:saved?"0 4px 12px #16a34a44":`0 4px 12px ${ACCENT}44`,transition:"all 0.2s"}}>
            {saving?<><Spinner size={12}/>&nbsp;Saving…</>:saved?<><Ic d={ICONS.check} stroke="#fff" size={12} sw={2.5}/>Saved!</>:<><Ic d={ICONS.check} stroke="#fff" size={12} sw={2.5}/>Save Settings</>}
          </button>
        </div>
      </div>

      <div style={{padding:"20px 22px",display:"flex",flexDirection:"column",gap:22}}>
        {SETTING_GROUPS.map(group=>(
          <div key={group.title}>
            <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:13}}>
              <div style={{width:28,height:28,borderRadius:8,background:group.iconColor,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 3px 9px ${group.iconColor}44`}}>
                <Ic d={group.icon} stroke="#fff" size={13}/>
              </div>
              <span style={{fontSize:13,fontWeight:800,color:"#374151"}}>{group.title}</span>
              <div style={{flex:1,height:1.5,background:"linear-gradient(90deg,#f1f5f9,transparent)"}}/>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {group.items.map(key=>{
                const s = settings[key];
                if(!s) return null;
                return (
                  <div key={key} style={{borderRadius:12,border:`1.5px solid ${s.enabled?"#fed7aa":"#f1f5f9"}`,background:s.enabled?"#fffbeb":"#fafafa",transition:"all 0.2s",overflow:"hidden"}}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 14px",cursor:"pointer"}} onClick={()=>onChange(key,{...s,enabled:!s.enabled})}>
                      <div style={{flex:1,minWidth:0,marginRight:8}}>
                        <div style={{fontSize:12.5,fontWeight:800,color:s.enabled?"#111827":"#9ca3af"}}>{s.label}</div>
                        <div style={{fontSize:10.5,color:s.enabled?ACCENT:"#9ca3af",fontWeight:600,marginTop:1}}>{s.note}</div>
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:7,flexShrink:0}}>
                        {s.enabled&&s.rate>0&&s.type!=="slab"&&(
                          <span style={{fontSize:11,fontWeight:800,color:ACCENT,background:"#fff",padding:"2px 8px",borderRadius:99,border:`1px solid ${ACCENT}33`}}>
                            {s.rate}{s.type==="percent"?"%":s.type==="fixed"?"₹":"x"}
                          </span>
                        )}
                        {s.enabled&&(
                          <button onClick={e=>{e.stopPropagation();setEditingKey(editingKey===key?null:key);setEditDraft(s.rate);}}
                            style={{width:24,height:24,background:"#fff",border:"1px solid #e5e7eb",borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0}}>
                            <Ic d={ICONS.edit} stroke="#6b7280" size={10}/>
                          </button>
                        )}
                        <Toggle enabled={s.enabled} onChange={()=>onChange(key,{...s,enabled:!s.enabled})} size="sm"/>
                      </div>
                    </div>
                    {editingKey===key&&s.enabled&&s.type!=="slab"&&s.type!=="info"&&(
                      <div style={{padding:"10px 14px",borderTop:"1px solid #fde68a",background:"#fff7ed",display:"flex",alignItems:"center",gap:8}}>
                        <span style={{fontSize:11,color:"#9ca3af",fontWeight:700,whiteSpace:"nowrap"}}>Edit value:</span>
                        <div style={{position:"relative",flex:1}}>
                          <input type="number" value={editDraft} onChange={e=>setEditDraft(Number(e.target.value))} step={s.type==="percent"?0.01:1}
                            style={{width:"100%",padding:"6px 30px 6px 10px",border:"1.5px solid #fed7aa",borderRadius:7,fontSize:13,fontWeight:800,outline:"none",fontFamily:"Nunito,sans-serif",boxSizing:"border-box"}}/>
                          <span style={{position:"absolute",right:9,top:"50%",transform:"translateY(-50%)",fontSize:11,color:"#9ca3af",fontWeight:600}}>
                            {s.type==="percent"?"%":s.type==="fixed"?"₹":"x"}
                          </span>
                        </div>
                        <button onClick={()=>{onChange(key,{...s,rate:editDraft});setEditingKey(null);}}
                          style={{padding:"6px 12px",background:ACCENT,border:"none",borderRadius:7,fontSize:12,fontWeight:800,color:"#fff",cursor:"pointer",fontFamily:"Nunito,sans-serif",whiteSpace:"nowrap"}}>Save</button>
                        <button onClick={()=>setEditingKey(null)}
                          style={{padding:"6px 9px",background:"#fff",border:"1px solid #e5e7eb",borderRadius:7,fontSize:12,fontWeight:700,color:"#6b7280",cursor:"pointer"}}>✕</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Custom components */}
        {customKeys.length>0&&(
          <div>
            <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:13}}>
              <div style={{width:28,height:28,borderRadius:8,background:ACCENT,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 3px 9px ${ACCENT}44`}}>
                <Ic d={ICONS.sparkle} stroke="#fff" size={13}/>
              </div>
              <span style={{fontSize:13,fontWeight:800,color:"#374151"}}>Custom Components</span>
              <div style={{flex:1,height:1.5,background:"linear-gradient(90deg,#f1f5f9,transparent)"}}/>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {customKeys.map(key=>{
                const s=settings[key];
                return (
                  <div key={key} style={{borderRadius:12,border:`1.5px solid ${s.enabled?"#fed7aa":"#f1f5f9"}`,background:s.enabled?"#fffbeb":"#fafafa",transition:"all 0.2s",overflow:"hidden"}}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 14px",cursor:"pointer"}} onClick={()=>onChange(key,{...s,enabled:!s.enabled})}>
                      <div style={{flex:1,minWidth:0,marginRight:8}}>
                        <div style={{fontSize:12.5,fontWeight:800,color:s.enabled?"#111827":"#9ca3af"}}>{s.label}</div>
                        <div style={{fontSize:10.5,color:s.enabled?ACCENT:"#9ca3af",fontWeight:600,marginTop:1}}>{s.note}</div>
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:7,flexShrink:0}}>
                        {s.enabled&&s.rate>0&&(
                          <span style={{fontSize:11,fontWeight:800,color:ACCENT,background:"#fff",padding:"2px 8px",borderRadius:99,border:`1px solid ${ACCENT}33`}}>
                            {s.rate}{s.type==="percent"?"%":"₹"}
                          </span>
                        )}
                        {s.enabled&&(
                          <button onClick={e=>{e.stopPropagation();setEditingKey(editingKey===key?null:key);setEditDraft(s.rate);}}
                            style={{width:24,height:24,background:"#fff",border:"1px solid #e5e7eb",borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0}}>
                            <Ic d={ICONS.edit} stroke="#6b7280" size={10}/>
                          </button>
                        )}
                        <Toggle enabled={s.enabled} onChange={()=>onChange(key,{...s,enabled:!s.enabled})} size="sm"/>
                      </div>
                    </div>
                    {editingKey===key&&s.enabled&&(
                      <div style={{padding:"10px 14px",borderTop:"1px solid #fde68a",background:"#fff7ed",display:"flex",alignItems:"center",gap:8}}>
                        <span style={{fontSize:11,color:"#9ca3af",fontWeight:700}}>Value:</span>
                        <div style={{position:"relative",flex:1}}>
                          <input type="number" value={editDraft} onChange={e=>setEditDraft(Number(e.target.value))}
                            style={{width:"100%",padding:"6px 30px 6px 10px",border:"1.5px solid #fed7aa",borderRadius:7,fontSize:13,fontWeight:800,outline:"none",fontFamily:"Nunito,sans-serif",boxSizing:"border-box"}}/>
                          <span style={{position:"absolute",right:9,top:"50%",transform:"translateY(-50%)",fontSize:11,color:"#9ca3af"}}>{s.type==="percent"?"%":"₹"}</span>
                        </div>
                        <button onClick={()=>{onChange(key,{...s,rate:editDraft});setEditingKey(null);}}
                          style={{padding:"6px 12px",background:ACCENT,border:"none",borderRadius:7,fontSize:12,fontWeight:800,color:"#fff",cursor:"pointer",fontFamily:"Nunito,sans-serif"}}>Save</button>
                        <button onClick={()=>setEditingKey(null)}
                          style={{padding:"6px 9px",background:"#fff",border:"1px solid #e5e7eb",borderRadius:7,fontSize:12,fontWeight:700,color:"#6b7280",cursor:"pointer"}}>✕</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Active summary */}
        <div style={{padding:"13px 16px",background:"linear-gradient(135deg,#fff7ed,#ffedd5)",borderRadius:11,border:"1px solid #fed7aa",display:"flex",alignItems:"center",gap:12}}>
          <Ic d={ICONS.info} stroke={ACCENT} size={16}/>
          <div style={{fontSize:12,color:"#c2410c",lineHeight:1.7}}>
            <strong>{Object.values(settings).filter(s=>s.enabled).length} components active</strong> · PF is {settings.pf?.enabled?`enabled (${settings.pf.rate}% of basic)`:"disabled"} · ESIC is {settings.esic?.enabled?`enabled (${settings.esic.rate}%)`:"disabled"} · Changes apply to new payroll runs.
          </div>
        </div>
      </div>
    </div>
    {showAddSetting && <AddSettingModal onClose={()=>setShowAddSetting(false)} onAdd={handleAddSetting}/>}
    </>
  );
}

// ── BAR CHART ─────────────────────────────────────────────────────────────────
function SalaryBarChart({ data, period, onPeriodChange }) {
  const maxVal = Math.max(...data.map(d => d.salary + d.allowance));
  const chartH=130, barW=32, gap=16, padL=56, padB=28;
  const svgW = padL + data.length*(barW+gap)+10;
  const yLabels = [0,0.25,0.5,0.75,1].map(f => Math.round(maxVal*f/50000)*50000);
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
              style={{padding:"4px 11px",borderRadius:6,fontSize:11.5,fontWeight:800,border:"none",cursor:"pointer",background:period===p?"linear-gradient(135deg,"+ACCENT+",#ea580c)":"transparent",color:period===p?"#fff":"#9ca3af",transition:"all 0.15s",boxShadow:period===p?`0 2px 8px ${ACCENT}44`:"none",fontFamily:"Nunito,sans-serif"}}>
              {p}
            </button>
          ))}
        </div>
      </div>
      <div style={{display:"flex",gap:14,marginBottom:10}}>
        {[["Salary","#3b82f6"],["Allowance","#93c5fd"],["Deduction","#fca5a5"]].map(([label,color])=>(
          <div key={label} style={{display:"flex",alignItems:"center",gap:5}}>
            <div style={{width:9,height:9,borderRadius:3,background:color}}/>
            <span style={{fontSize:10.5,color:"#6b7280",fontWeight:600}}>{label}</span>
          </div>
        ))}
      </div>
      <div style={{overflowX:"auto"}}>
        <svg width={svgW} height={chartH+padB} style={{display:"block"}}>
          {yLabels.map((val,i)=>{
            const y=chartH-(val/maxVal)*chartH;
            return <g key={i}><line x1={padL} y1={y} x2={svgW-10} y2={y} stroke="#f1f5f9" strokeWidth={1} strokeDasharray="4 4"/><text x={padL-6} y={y+4} textAnchor="end" fontSize={9} fill="#9ca3af">{fmtShort(val)}</text></g>;
          })}
          {data.map((d,i)=>{
            const x=padL+i*(barW+gap);
            const salH=(d.salary/maxVal)*chartH,allowH=(d.allowance/maxVal)*chartH,dedH=(d.deduction/maxVal)*chartH,totalH=salH+allowH;
            return <g key={d.month}>
              <rect x={x} y={chartH-totalH} width={barW} height={salH} rx={5} fill="#3b82f6" opacity={0.9}/>
              <rect x={x} y={chartH-totalH} width={barW} height={allowH} rx={5} fill="#93c5fd"/>
              <rect x={x} y={chartH-dedH} width={barW/3} height={dedH} rx={3} fill="#fca5a5" opacity={0.8}/>
              <text x={x+barW/2} y={chartH+18} textAnchor="middle" fontSize={9.5} fill="#9ca3af" fontWeight={600}>{d.month}</text>
            </g>;
          })}
        </svg>
      </div>
    </div>
  );
}

// ── DONUT CHART ───────────────────────────────────────────────────────────────
function DeptDonut({ employees }) {
  const deptTotals={};
  employees.forEach(e=>{deptTotals[e.dept]=(deptTotals[e.dept]||0)+e.gross;});
  const total=Object.values(deptTotals).reduce((s,v)=>s+v,0);
  const colors=["#6366f1","#f97316","#14b8a6","#ec4899","#22c55e","#a855f7","#3b82f6","#eab308"];
  const entries=Object.entries(deptTotals).map(([dept,val],i)=>({dept,val,pct:val/total,color:colors[i%colors.length]}));
  const cx=55,cy=55,R=44,r=28;
  let angle=-Math.PI/2;
  const segments=entries.map(e=>{
    const start=angle,sweep=e.pct*2*Math.PI;angle+=sweep;
    const x1=cx+R*Math.cos(start),y1=cy+R*Math.sin(start),x2=cx+R*Math.cos(start+sweep),y2=cy+R*Math.sin(start+sweep);
    const ix1=cx+r*Math.cos(start),iy1=cy+r*Math.sin(start),ix2=cx+r*Math.cos(start+sweep),iy2=cy+r*Math.sin(start+sweep);
    const large=sweep>Math.PI?1:0;
    return {...e,path:`M${x1},${y1} A${R},${R},0,${large},1,${x2},${y2} L${ix2},${iy2} A${r},${r},0,${large},0,${ix1},${iy1} Z`};
  });
  return (
    <div style={{background:"#fff",borderRadius:14,border:"1px solid #f1f5f9",padding:"18px 20px",boxShadow:"0 2px 8px rgba(0,0,0,0.05)"}}>
      <div style={{fontSize:14,fontWeight:900,color:"#111827",marginBottom:2}}>By Department</div>
      <div style={{fontSize:11.5,color:"#9ca3af",marginBottom:13}}>Gross salary split</div>
      <div style={{display:"flex",alignItems:"center",gap:14}}>
        <svg width={110} height={110} style={{flexShrink:0}}>
          {segments.map((s,i)=><path key={i} d={s.path} fill={s.color}/>)}
          <text x={cx} y={cy-3} textAnchor="middle" fontSize={9} fill="#9ca3af">Total</text>
          <text x={cx} y={cy+9} textAnchor="middle" fontSize={10} fontWeight={700} fill="#111827">{fmtShort(total)}</text>
        </svg>
        <div style={{flex:1}}>
          {entries.map(e=>(
            <div key={e.dept} style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <div style={{width:7,height:7,borderRadius:2,background:e.color,flexShrink:0}}/>
                <span style={{fontSize:10.5,color:"#374151",fontWeight:600}}>{e.dept}</span>
              </div>
              <span style={{fontSize:10.5,fontWeight:800,color:"#111827"}}>{Math.round(e.pct*100)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, iconBg, label, value, sub, subColor, trend }) {
  return (
    <div style={{background:"#fff",borderRadius:14,padding:"16px 18px",border:"1px solid #f1f5f9",boxShadow:"0 2px 8px rgba(0,0,0,0.05)",flex:1,minWidth:0}}>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:11}}>
        <div style={{width:42,height:42,borderRadius:12,background:iconBg,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 4px 12px ${typeof iconBg==="string"?iconBg:"#00000033"}44`}}>
          <Ic d={icon} stroke="#fff" size={18}/>
        </div>
        {trend&&<div style={{display:"flex",alignItems:"center",gap:3,fontSize:11,fontWeight:800,color:trend>0?"#16a34a":"#dc2626",background:trend>0?"#f0fdf4":"#fef2f2",padding:"3px 8px",borderRadius:99}}>
          {trend>0?"↑":"↓"}{Math.abs(trend)}%
        </div>}
      </div>
      <div style={{fontSize:10.5,color:"#9ca3af",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:4}}>{label}</div>
      <div style={{fontSize:22,fontWeight:900,color:"#111827",letterSpacing:"-0.8px",lineHeight:1}}>{value}</div>
      {sub&&<div style={{fontSize:11,color:subColor||"#9ca3af",marginTop:5,fontWeight:600}}>{sub}</div>}
    </div>
  );
}

function PayslipModal({ emp, onClose, month }) {
  const [sending,setSending]=useState(false);
  const [sent,setSent]=useState(false);
  const handleSend=async()=>{setSending(true);await new Promise(r=>setTimeout(r,1200));setSending(false);setSent(true);setTimeout(()=>setSent(false),3000);};
  const allowances=[{label:"Basic Salary",amount:Math.round(emp.gross*0.5)},{label:"HRA",amount:Math.round(emp.gross*0.2)},{label:"Transport Allowance",amount:Math.round(emp.gross*0.05)},{label:"Medical Allowance",amount:Math.round(emp.gross*0.05)},{label:"Special Allowance",amount:Math.round(emp.gross*0.1)},{label:"Performance Bonus",amount:Math.round(emp.gross*0.1)}];
  const deductions=[{label:"PF (Employee 12%)",amount:emp.pf},{label:"PF (Employer 12%)",amount:Math.round(emp.pf*0.5)},{label:"Professional Tax",amount:200},{label:"Income Tax (TDS)",amount:emp.tax},{label:"Health Insurance",amount:Math.round(emp.gross*0.01)}];
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",backdropFilter:"blur(10px)",zIndex:600,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:20,width:"100%",maxWidth:560,maxHeight:"92vh",overflowY:"auto",boxShadow:"0 48px 120px rgba(0,0,0,0.3)",animation:"modalIn 0.25s ease"}}>
        <div style={{background:`linear-gradient(135deg,${ACCENT},#ea580c)`,padding:"20px 24px",borderRadius:"20px 20px 0 0",display:"flex",justifyContent:"space-between",alignItems:"center",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:-20,right:60,width:80,height:80,borderRadius:"50%",background:"rgba(255,255,255,0.1)"}}/>
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
            <div>
              <div style={{fontSize:13.5,fontWeight:800,color:"#111827"}}>{emp.name}</div>
              <div style={{fontSize:11,color:"#9ca3af"}}>{emp.id} · {emp.role} · {emp.dept}</div>
              <div style={{fontSize:11,color:"#9ca3af"}}>Joining: {emp.joining} · Days: {emp.paid_days}/{emp.work_days} · Grade: <strong style={{color:ACCENT}}>{emp.salaryGrade}</strong></div>
            </div>
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
            <div><div style={{fontSize:10.5,color:"#94a3b8",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.5px"}}>Net Take Home</div><div style={{fontSize:28,fontWeight:900,color:"#fff",letterSpacing:"-1.5px",lineHeight:1.1}}>{fmt(emp.net)}</div><div style={{fontSize:10,color:"#64748b",marginTop:2}}>{emp.paid_days} days · {month}</div></div>
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
        <div style={{background:`linear-gradient(135deg,${ACCENT},#ea580c)`,padding:"17px 22px",display:"flex",justifyContent:"space-between",alignItems:"center",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:-20,right:30,width:70,height:70,borderRadius:"50%",background:"rgba(255,255,255,0.1)"}}/>
          <div><div style={{fontSize:14.5,fontWeight:900,color:"#fff"}}>Edit Salary — {emp.name}</div><div style={{fontSize:11.5,color:"rgba(255,255,255,0.7)",marginTop:1}}>{emp.id} · {emp.role}</div></div>
          <button onClick={onClose} style={{width:30,height:30,borderRadius:9,background:"rgba(255,255,255,0.2)",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Ic d={ICONS.x} stroke="#fff" size={13}/></button>
        </div>
        <div style={{padding:"20px 22px",display:"flex",flexDirection:"column",gap:14}}>
          <div>
            <label style={{fontSize:11.5,fontWeight:700,color:"#374151",display:"block",marginBottom:8}}>Salary Grade</label>
            <div style={{display:"flex",gap:8}}>
              {["Basic","Medium","High"].map(g=>{const cfg=GRADE_CFG[g];return<button key={g} onClick={()=>set("salaryGrade",g)} style={{flex:1,padding:"9px 0",borderRadius:9,border:`2px solid ${form.salaryGrade===g?cfg.color:cfg.border}`,background:form.salaryGrade===g?cfg.bg:"#fff",fontSize:12.5,fontWeight:800,color:form.salaryGrade===g?cfg.color:"#9ca3af",cursor:"pointer",fontFamily:"Nunito,sans-serif",transition:"all 0.15s"}}>{g}</button>;})}
            </div>
          </div>
          {[["Gross Salary","gross"],["Total Deduction","deduction"]].map(([label,key])=>(
            <div key={key}>
              <label style={{fontSize:11.5,fontWeight:700,color:"#374151",display:"block",marginBottom:6}}>{label} <span style={{color:"#ef4444"}}>*</span></label>
              <div style={{position:"relative"}}><span style={{position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",fontSize:12.5,color:"#9ca3af",fontWeight:600}}>₹</span>
              <input type="number" value={form[key]} onChange={e=>set(key,Number(e.target.value))}
                style={{width:"100%",padding:"10px 12px 10px 28px",border:"1.5px solid #e5e7eb",borderRadius:10,fontSize:13.5,fontWeight:700,color:"#111827",outline:"none",boxSizing:"border-box",fontFamily:"Nunito,sans-serif"}}
                onFocus={e=>e.target.style.borderColor=ACCENT} onBlur={e=>e.target.style.borderColor="#e5e7eb"}/></div>
            </div>
          ))}
          <div style={{padding:"11px 15px",background:net>0?"#f0fdf4":"#fef2f2",borderRadius:10,display:"flex",justifyContent:"space-between",alignItems:"center",border:`1.5px solid ${net>0?"#bbf7d0":"#fecaca"}`}}>
            <span style={{fontSize:12.5,fontWeight:700,color:net>0?"#16a34a":"#dc2626"}}>Net Pay Preview</span>
            <span style={{fontSize:18,fontWeight:900,color:net>0?"#16a34a":"#dc2626"}}>{fmt(net)}</span>
          </div>
          <div>
            <label style={{fontSize:11.5,fontWeight:700,color:"#374151",display:"block",marginBottom:7}}>Payment Status</label>
            <div style={{display:"flex",gap:8}}>
              {["Paid","Pending","Unpaid"].map(s=>(
                <button key={s} onClick={()=>set("status",s)}
                  style={{flex:1,padding:"9px 0",borderRadius:9,border:`2px solid ${form.status===s?STATUS_CFG[s].border:"#e5e7eb"}`,background:form.status===s?STATUS_CFG[s].bg:"#fff",fontSize:12.5,fontWeight:800,color:form.status===s?STATUS_CFG[s].color:"#9ca3af",cursor:"pointer",fontFamily:"Nunito,sans-serif",transition:"all 0.15s"}}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div style={{padding:"0 22px 20px",display:"flex",gap:10}}>
          <button onClick={onClose} style={{flex:1,padding:"11px 0",background:"#fff",border:"1px solid #e5e7eb",borderRadius:10,fontSize:13,fontWeight:700,color:"#374151",cursor:"pointer",fontFamily:"Nunito,sans-serif"}}>Cancel</button>
          <button onClick={handleSave} disabled={saving}
            style={{flex:2,padding:"11px 0",background:saving?"#d1d5db":`linear-gradient(135deg,${ACCENT},#ea580c)`,border:"none",borderRadius:10,fontSize:13,fontWeight:800,color:"#fff",cursor:saving?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,fontFamily:"Nunito,sans-serif",boxShadow:saving?"":(`0 4px 14px ${ACCENT}44`)}}>
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
        <div style={{fontSize:12.5,color:"#6b7280",marginBottom:20,lineHeight:1.7}}>Remove salary record for <strong>{emp.name}</strong>? This cannot be undone.</div>
        <div style={{display:"flex",gap:10}}>
          <button onClick={onClose} style={{flex:1,padding:"10px 0",background:"#fff",border:"1px solid #e5e7eb",borderRadius:10,fontSize:13,fontWeight:700,color:"#374151",cursor:"pointer",fontFamily:"Nunito,sans-serif"}}>Cancel</button>
          <button onClick={handle} disabled={loading}
            style={{flex:1,padding:"10px 0",background:loading?"#d1d5db":"#dc2626",border:"none",borderRadius:10,fontSize:13,fontWeight:800,color:"#fff",cursor:loading?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:7,fontFamily:"Nunito,sans-serif"}}>
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
  const [activeTab, setActiveTab]       = useState("salary");
  const [employees, setEmployees]       = useState(MOCK_EMPLOYEES);
  const [structures,setStructures]      = useState(INITIAL_SALARY_STRUCTURES);
  const [settings,  setSettings]        = useState(DEFAULT_SETTINGS);
  const [search,    setSearch]          = useState("");
  const [dept,      setDept]            = useState("All");
  const [status,    setStatus]          = useState("All");
  const [sortBy,    setSortBy]          = useState("name");
  const [sortDir,   setSortDir]         = useState("asc");
  const [rowsPerPage,setRowsPerPage]    = useState(10);
  const [page,      setPage]            = useState(1);
  const [selectedIds,setSelectedIds]   = useState(new Set());
  const [viewEmp,   setViewEmp]         = useState(null);
  const [editEmp,   setEditEmp]         = useState(null);
  const [deleteEmp, setDeleteEmp]       = useState(null);
  const [period,    setPeriod]          = useState("6M");
  const [month,     setMonth]           = useState("May 2026");
  const [showAddStructure, setShowAddStructure] = useState(false);
  const [editStructure,    setEditStructure]    = useState(null);

  const totalGross     = employees.reduce((s,e)=>s+e.gross,0);
  const totalNet       = employees.reduce((s,e)=>s+e.net,0);
  const totalDeduction = employees.reduce((s,e)=>s+e.deduction,0);
  const paidCount      = employees.filter(e=>e.status==="Paid").length;
  const pendingCount   = employees.filter(e=>e.status==="Pending").length;
  const unpaidCount    = employees.filter(e=>e.status==="Unpaid").length;

  const filtered = employees.filter(e=>{
    const q=search.toLowerCase();
    return (e.name.toLowerCase().includes(q)||e.id.toLowerCase().includes(q)||e.role.toLowerCase().includes(q))
      &&(dept==="All"||e.dept===dept)&&(status==="All"||e.status===status);
  }).sort((a,b)=>{
    let va=a[sortBy],vb=b[sortBy];
    if(typeof va==="string"){va=va.toLowerCase();vb=vb.toLowerCase();}
    return sortDir==="asc"?(va>vb?1:-1):(va<vb?1:-1);
  });

  const totalPages = Math.max(1,Math.ceil(filtered.length/rowsPerPage));
  const paginated  = filtered.slice((page-1)*rowsPerPage,page*rowsPerPage);

  const toggleSort=(col)=>{if(sortBy===col)setSortDir(d=>d==="asc"?"desc":"asc");else{setSortBy(col);setSortDir("asc");}};
  const toggleRow=(id)=>setSelectedIds(prev=>{const n=new Set(prev);n.has(id)?n.delete(id):n.add(id);return n;});
  const toggleAll=()=>{if(selectedIds.size===paginated.length)setSelectedIds(new Set());else setSelectedIds(new Set(paginated.map(e=>e.id)));};
  const handleSaveEdit=(updated)=>setEmployees(prev=>prev.map(e=>e.id===updated.id?updated:e));
  const handleDelete=()=>{setEmployees(prev=>prev.filter(e=>e.id!==deleteEmp.id));setDeleteEmp(null);};
  const handleSaveStructure=(item)=>{
    if(editStructure) setStructures(prev=>prev.map(s=>s.id===item.id?item:s));
    else setStructures(prev=>[...prev,item]);
    setEditStructure(null);
    setShowAddStructure(false);
  };
  const handleDeleteStructure=(id)=>setStructures(prev=>prev.filter(s=>s.id!==id));
  const handleSettingChange=(key,val)=>setSettings(p=>({...p,[key]:val}));
  const handleAddSetting=(key,item)=>setSettings(p=>({...p,[key]:item}));

  const SortIcon=({col})=>(
    <svg width={9} height={9} viewBox="0 0 24 24" fill="none" stroke={sortBy===col?ACCENT:"#d1d5db"} strokeWidth={2.5} strokeLinecap="round">
      <path d={sortBy===col&&sortDir==="asc"?"M8 15l4 4 4-4M12 19V5":sortBy===col&&sortDir==="desc"?"M8 9l4-4 4 4M12 5v14":"M8 9l4-4 4 4M8 15l4 4 4-4"}/>
    </svg>
  );

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
        .sal-row:hover{background:#fafafa !important;}
        .sal-row:hover .row-actions{opacity:1 !important;}
        .row-actions{opacity:0;transition:opacity 0.15s;}
        .icon-btn:hover{transform:scale(1.12);}
        .icon-btn{transition:transform 0.12s;}
        .ss-card:hover{box-shadow:0 10px 32px rgba(0,0,0,0.12) !important;transform:translateY(-3px) !important;}
        .ss-card{transition:all 0.22s !important;}
        * {font-family:'Nunito',sans-serif;}
      `}</style>

      {/* ── PAGE HEADER ── */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div>
          <div style={{fontSize:22,fontWeight:900,color:"#111827",letterSpacing:"-0.7px"}}>Employee Salary</div>
          <div style={{fontSize:12.5,color:"#9ca3af",marginTop:2,fontWeight:600}}>Manage payroll, structures & compliance — {month}</div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button style={{display:"flex",alignItems:"center",gap:7,padding:"9px 16px",background:"#fff",border:"1.5px solid #e5e7eb",borderRadius:10,fontSize:13,fontWeight:700,color:"#374151",cursor:"pointer",transition:"all 0.15s"}}
            onMouseEnter={e=>e.currentTarget.style.borderColor="#d1d5db"}
            onMouseLeave={e=>e.currentTarget.style.borderColor="#e5e7eb"}>
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

      {/* ── TAB BAR ── */}
      <div style={{display:"flex",gap:0,background:"#fff",borderRadius:13,border:"1px solid #f1f5f9",padding:5,width:"fit-content",boxShadow:"0 2px 8px rgba(0,0,0,0.06)"}}>
        {TABS.map(t=>(
          <button key={t.key} onClick={()=>setActiveTab(t.key)}
            style={{display:"flex",alignItems:"center",gap:7,padding:"9px 20px",borderRadius:10,border:"none",cursor:"pointer",fontSize:12.5,fontWeight:activeTab===t.key?900:600,background:activeTab===t.key?`linear-gradient(135deg,${ACCENT},#ea580c)`:"transparent",color:activeTab===t.key?"#fff":"#6b7280",transition:"all 0.2s",boxShadow:activeTab===t.key?`0 4px 14px ${ACCENT}44`:"none"}}>
            <Ic d={t.icon} stroke={activeTab===t.key?"#fff":"#9ca3af"} size={13}/>{t.label}
          </button>
        ))}
      </div>

      {/* ── TAB: EMPLOYEE SALARY ── */}
      {activeTab==="salary"&&(<>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
          <StatCard icon={ICONS.wallet}   iconBg="linear-gradient(135deg,#1e293b,#374151)" label="Total Gross Payroll" value={fmtShort(totalGross)}     sub={`${employees.length} employees`} trend={7}/>
          <StatCard icon={ICONS.trending} iconBg="linear-gradient(135deg,#16a34a,#15803d)" label="Net Payroll"         value={fmtShort(totalNet)}       sub="After all deductions" subColor="#16a34a" trend={5}/>
          <StatCard icon={ICONS.fileText} iconBg="linear-gradient(135deg,#dc2626,#b91c1c)" label="Total Deductions"    value={fmtShort(totalDeduction)} sub="Tax + PF + Insurance" trend={-2}/>
          <StatCard icon={ICONS.users}    iconBg="linear-gradient(135deg,#6366f1,#4f46e5)" label="Payment Status"      value={`${paidCount} Paid`}      sub={`${pendingCount} Pending · ${unpaidCount} Unpaid`} subColor="#d97706"/>
        </div>

        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {[
            {label:"All Employees",count:employees.length,color:"#6366f1",bg:"#eef2ff",filter:"All"},
            {label:"Paid",count:paidCount,color:"#16a34a",bg:"#f0fdf4",filter:"Paid"},
            {label:"Pending",count:pendingCount,color:"#d97706",bg:"#fffbeb",filter:"Pending"},
            {label:"Unpaid",count:unpaidCount,color:"#dc2626",bg:"#fef2f2",filter:"Unpaid"},
          ].map(({label,count,color,bg,filter:f})=>(
            <div key={label} onClick={()=>{setStatus(f);setPage(1);}}
              style={{display:"flex",alignItems:"center",gap:7,padding:"8px 16px",background:status===f?bg:bg+"88",borderRadius:99,cursor:"pointer",border:`1.5px solid ${status===f?color+"55":"transparent"}`,transition:"all 0.15s",boxShadow:status===f?`0 2px 10px ${color}22`:"none"}}>
              <div style={{width:7,height:7,borderRadius:"50%",background:color}}/>
              <span style={{fontSize:12,fontWeight:800,color}}>{count} {label}</span>
            </div>
          ))}
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 280px",gap:12}}>
          <SalaryBarChart data={MONTHLY_DATA.slice(period==="3M"?3:0)} period={period} onPeriodChange={setPeriod}/>
          <DeptDonut employees={employees}/>
        </div>

        {/* Table */}
        <div style={{background:"#fff",borderRadius:16,border:"1px solid #f1f5f9",overflow:"hidden",boxShadow:"0 2px 8px rgba(0,0,0,0.05)"}}>
          <div style={{padding:"13px 20px",borderBottom:"1px solid #f3f4f6",display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,flexWrap:"wrap"}}>
            <div style={{display:"flex",alignItems:"center",gap:9}}>
              <Ic d={ICONS.users} stroke={ACCENT} size={16}/>
              <span style={{fontSize:14,fontWeight:900,color:"#111827"}}>Salary List</span>
              <span style={{background:"#fff7ed",color:ACCENT,borderRadius:20,padding:"2px 10px",fontSize:12,fontWeight:800,border:`1px solid ${ACCENT}33`}}>{filtered.length} records</span>
              {selectedIds.size>0&&<span style={{background:"#eef2ff",color:"#6366f1",borderRadius:20,padding:"2px 10px",fontSize:12,fontWeight:800,border:"1px solid #c7d2fe"}}>{selectedIds.size} selected</span>}
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
              <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} placeholder="Search name, ID, role…"
                style={{border:"none",background:"transparent",fontSize:12.5,color:"#374151",outline:"none",width:200,fontFamily:"Nunito,sans-serif"}}/>
              {search&&<button onClick={()=>setSearch("")} style={{background:"none",border:"none",cursor:"pointer",padding:0,display:"flex"}}><Ic d={ICONS.x} stroke="#9ca3af" size={11}/></button>}
            </div>
          </div>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
              <thead>
                <tr style={{background:"#fafafa"}}>
                  <th style={{width:38,padding:"11px 16px",textAlign:"center"}}>
                    <input type="checkbox" checked={selectedIds.size===paginated.length&&paginated.length>0} onChange={toggleAll} style={{width:13,height:13,cursor:"pointer",accentColor:ACCENT}}/>
                  </th>
                  {[{label:"Emp ID",col:"id"},{label:"Employee",col:"name"},{label:"Department",col:"dept"},{label:"Grade",col:"salaryGrade"},{label:"Paid Days",col:"paid_days"},{label:"Gross",col:"gross"},{label:"Deduction",col:"deduction"},{label:"Net Pay",col:"net"},{label:"Status",col:"status"},{label:"",col:null}].map(({label,col},i)=>(
                    <th key={i} onClick={()=>col&&toggleSort(col)}
                      style={{padding:"11px 12px 11px 0",textAlign:"left",fontSize:10.5,fontWeight:800,color:"#9ca3af",textTransform:"uppercase",letterSpacing:"0.6px",whiteSpace:"nowrap",cursor:col?"pointer":"default",userSelect:"none"}}>
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
                      <td style={{padding:"12px 12px 12px 0"}}>
                        <div style={{display:"flex",alignItems:"center",gap:9}}>
                          <Avatar name={emp.name} size={32}/>
                          <div><div style={{fontSize:12.5,fontWeight:800,color:"#111827",whiteSpace:"nowrap"}}>{emp.name}</div><div style={{fontSize:10.5,color:"#9ca3af",marginTop:1,fontWeight:600}}>{emp.role}</div></div>
                        </div>
                      </td>
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
                          <button className="icon-btn" onClick={()=>setViewEmp(emp)} title="View Payslip"
                            style={{width:28,height:28,background:"#fff7ed",border:"1px solid #fed7aa",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
                            <Ic d={ICONS.fileText} stroke={ACCENT} size={12}/>
                          </button>
                          <button className="icon-btn" onClick={()=>setEditEmp(emp)} title="Edit"
                            style={{width:28,height:28,background:"#f0f9ff",border:"1px solid #bae6fd",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
                            <Ic d={ICONS.edit} stroke="#0369a1" size={12}/>
                          </button>
                          <button className="icon-btn" onClick={()=>setDeleteEmp(emp)} title="Delete"
                            style={{width:28,height:28,background:"#fef2f2",border:"1px solid #fecaca",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
                            <Ic d={ICONS.trash} stroke="#dc2626" size={12}/>
                          </button>
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
                <button key={n} onClick={()=>setPage(n)}
                  style={{width:28,height:28,borderRadius:7,border:`1.5px solid ${n===page?ACCENT:"#e5e7eb"}`,background:n===page?"linear-gradient(135deg,"+ACCENT+",#ea580c)":"#fff",fontSize:12,fontWeight:n===page?900:600,color:n===page?"#fff":"#6b7280",cursor:"pointer"}}>
                  {n}
                </button>
              ))}
              <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages} style={{width:28,height:28,background:"#fff",border:"1px solid #e5e7eb",borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",cursor:page===totalPages?"not-allowed":"pointer",opacity:page===totalPages?0.4:1}}><Ic d={ICONS.chevRight} size={12} stroke="#6b7280"/></button>
              <button onClick={()=>setPage(totalPages)} disabled={page===totalPages} style={{width:28,height:28,background:"#fff",border:"1px solid #e5e7eb",borderRadius:7,cursor:page===totalPages?"not-allowed":"pointer",opacity:page===totalPages?0.4:1,fontSize:11,color:"#6b7280",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>»</button>
            </div>
          </div>
        </div>
      </>)}

      {/* ── TAB: SALARY STRUCTURES ── */}
      {activeTab==="structures"&&(
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          <div style={{padding:"14px 18px",background:"linear-gradient(135deg,#fff7ed,#ffedd5)",borderRadius:14,border:"1px solid #fed7aa",display:"flex",alignItems:"center",gap:13}}>
            <div style={{width:40,height:40,borderRadius:12,background:`linear-gradient(135deg,${ACCENT},#ea580c)`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,boxShadow:`0 4px 14px ${ACCENT}44`}}>
              <Ic d={ICONS.layers} stroke="#fff" size={18}/>
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:13.5,fontWeight:900,color:"#92400e"}}>Salary Structure Templates</div>
              <div style={{fontSize:12,color:"#c2410c",marginTop:2,fontWeight:600}}>Create reusable compensation packages by grade. Components are fully customizable with CRUD support.</div>
            </div>
            <button onClick={()=>{setEditStructure(null);setShowAddStructure(true);}}
              style={{flexShrink:0,display:"flex",alignItems:"center",gap:7,padding:"9px 18px",background:`linear-gradient(135deg,${ACCENT},#ea580c)`,border:"none",borderRadius:10,fontSize:13,fontWeight:800,color:"#fff",cursor:"pointer",whiteSpace:"nowrap",fontFamily:"Nunito,sans-serif",boxShadow:`0 4px 14px ${ACCENT}44`}}>
              <Ic d={ICONS.plus} stroke="#fff" size={14}/> New Structure
            </button>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
            {["Basic","Medium","High"].map(g=>{
              const gStructures=structures.filter(s=>s.grade===g);
              const cfg=GRADE_CFG[g];
              const avgCTC=gStructures.length?Math.round(gStructures.reduce((s,ss)=>s+ss.ctc,0)/gStructures.length):0;
              return (
                <div key={g} style={{background:"#fff",borderRadius:13,border:`1.5px solid ${cfg.border}`,padding:"15px 18px",boxShadow:"0 2px 8px rgba(0,0,0,0.05)",transition:"all 0.2s"}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:9}}>
                    <div style={{padding:"3px 12px",borderRadius:99,background:cfg.bg,border:`1.5px solid ${cfg.border}`,fontSize:12.5,fontWeight:900,color:cfg.color}}>{g} Grade</div>
                    <span style={{fontSize:11,color:"#9ca3af",fontWeight:600}}>{gStructures.length} package{gStructures.length!==1?"s":""}</span>
                  </div>
                  <div style={{fontSize:22,fontWeight:900,color:"#111827",letterSpacing:"-0.5px"}}>{avgCTC?fmtShort(avgCTC):"—"}</div>
                  <div style={{fontSize:11,color:"#9ca3af",marginTop:3,fontWeight:600}}>Avg annual CTC</div>
                </div>
              );
            })}
          </div>

          {structures.length===0?(
            <div style={{padding:"70px 0",textAlign:"center",color:"#9ca3af",background:"#fff",borderRadius:16,border:"2px dashed #e5e7eb"}}>
              <div style={{fontSize:40,marginBottom:12}}>📦</div>
              <div style={{fontSize:14,fontWeight:800,marginBottom:7,color:"#374151"}}>No salary structures yet</div>
              <div style={{fontSize:12.5,fontWeight:600}}>Click "New Structure" to create your first package</div>
            </div>
          ):(
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(310px,1fr))",gap:14}}>
              {structures.map(ss=>{
                const cfg=GRADE_CFG[ss.grade]||GRADE_CFG.Basic;
                const monthly=Math.round(ss.ctc/12);
                const basicComp=ss.components?.find(c=>c.label==="Basic Salary");
                const pfAmt=basicComp?Math.round(basicComp.value*0.12):0;
                const net=monthly-pfAmt-200;
                const totalComps=ss.components?.reduce((s,c)=>s+c.value,0)||0;
                return (
                  <div key={ss.id} className="ss-card"
                    style={{background:"#fff",borderRadius:16,border:`1.5px solid ${cfg.border}`,overflow:"hidden",boxShadow:"0 2px 8px rgba(0,0,0,0.05)"}}>
                    <div style={{background:`linear-gradient(135deg,${cfg.bg},${cfg.bg}dd)`,padding:"15px 18px",borderBottom:`1px solid ${cfg.border}`}}>
                      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between"}}>
                        <div>
                          <div style={{fontSize:14,fontWeight:900,color:cfg.color,marginBottom:4}}>{ss.name}</div>
                          <div style={{display:"flex",alignItems:"center",gap:7}}>
                            <GradeBadge grade={ss.grade}/>
                            <span style={{fontSize:10.5,color:"#9ca3af",fontWeight:600}}>Created {ss.createdAt}</span>
                          </div>
                        </div>
                        <div style={{display:"flex",gap:6}}>
                          <button className="icon-btn" onClick={()=>{setEditStructure(ss);setShowAddStructure(true);}}
                            style={{width:28,height:28,background:"#fff",border:"1px solid #e5e7eb",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
                            <Ic d={ICONS.edit} stroke="#6b7280" size={12}/>
                          </button>
                          <button className="icon-btn" onClick={()=>handleDeleteStructure(ss.id)}
                            style={{width:28,height:28,background:"#fef2f2",border:"1px solid #fecaca",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
                            <Ic d={ICONS.trash} stroke="#dc2626" size={12}/>
                          </button>
                        </div>
                      </div>
                    </div>
                    <div style={{padding:"13px 18px"}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:13,padding:"9px 13px",background:"#f8fafc",borderRadius:10}}>
                        <div><div style={{fontSize:10,color:"#9ca3af",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.5px"}}>ANNUAL CTC</div><div style={{fontSize:20,fontWeight:900,color:"#111827",letterSpacing:"-0.5px"}}>{fmtShort(ss.ctc)}</div></div>
                        <div style={{textAlign:"right"}}><div style={{fontSize:10,color:"#9ca3af",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.5px"}}>MONTHLY</div><div style={{fontSize:17,fontWeight:800,color:cfg.color}}>{fmt(monthly)}</div></div>
                      </div>
                      {/* Component breakdown */}
                      <div style={{display:"flex",flexDirection:"column",gap:5,marginBottom:10}}>
                        {(ss.components||[]).map(c=>(
                          <div key={c.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"4px 8px",background:"#fafafa",borderRadius:7}}>
                            <div style={{display:"flex",alignItems:"center",gap:6}}>
                              <div style={{width:7,height:7,borderRadius:2,background:c.color,flexShrink:0}}/>
                              <span style={{fontSize:10.5,color:"#9ca3af",fontWeight:600}}>{c.label}</span>
                            </div>
                            <span style={{fontSize:11,fontWeight:800,color:c.color}}>{fmt(c.value)}</span>
                          </div>
                        ))}
                      </div>
                      {/* Component bar */}
                      <div style={{height:5,borderRadius:3,overflow:"hidden",display:"flex",marginBottom:10}}>
                        {(ss.components||[]).map(c=><div key={c.id} style={{flex:c.value,background:c.color,minWidth:c.value>0?2:0}}/>)}
                      </div>
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",paddingTop:8,borderTop:"1px solid #f1f5f9"}}>
                        <span style={{fontSize:10.5,color:"#9ca3af",fontWeight:600}}>{ss.components?.length||0} components</span>
                        <div style={{fontSize:11,fontWeight:800,color:"#16a34a",background:"#f0fdf4",padding:"3px 10px",borderRadius:99}}>
                          Net ~{fmt(net)}/mo
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── TAB: PAYROLL SETTINGS ── */}
      {activeTab==="settings"&&(
        <PayrollSettingsPanel settings={settings} onChange={handleSettingChange} onAdd={handleAddSetting}/>
      )}

      {/* ── MODALS ── */}
      {viewEmp   &&<PayslipModal emp={viewEmp} month={month} onClose={()=>setViewEmp(null)}/>}
      {editEmp   &&<EditSalaryModal emp={editEmp} onClose={()=>setEditEmp(null)} onSave={handleSaveEdit}/>}
      {deleteEmp &&<ConfirmModal emp={deleteEmp} onClose={()=>setDeleteEmp(null)} onConfirm={handleDelete}/>}
      {(showAddStructure||editStructure)&&(
        <SalaryStructureModal
          onClose={()=>{setShowAddStructure(false);setEditStructure(null);}}
          onSave={handleSaveStructure}
          editItem={editStructure}
          globalSettings={settings}
        />
      )}
    </div>
  );
}