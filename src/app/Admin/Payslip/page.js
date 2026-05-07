"use client";
import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";

// ─── Icon ─────────────────────────────────────────────────────────────────────
const Icon = ({ d, size = 14, stroke = "currentColor", fill = "none", sw = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
    strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
    style={{ display: "block", flexShrink: 0 }}>
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

const ICONS = {
  search:    "M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z",
  edit:      ["M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7","M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"],
  eye:       ["M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z","M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"],
  chevLeft:  "M15 18l-6-6 6-6",
  chevRight: "M9 18l6-6-6-6",
  fileText:  ["M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z","M14 2v6h6","M16 13H8","M16 17H8","M10 9H8"],
  close:     "M18 6L6 18M6 6l12 12",
  check:     "M20 6L9 17l-5-5",
  refresh:   "M23 4v6h-6 M1 20v-6h6 M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15",
  alert:     ["M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z","M12 9v4M12 17h.01"],
  layers:    "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  currency:  "M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
  users:     ["M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2","M23 21v-2a4 4 0 0 0-3-3.87","M16 3.13a4 4 0 0 1 0 7.75","M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"],
  back:      "M19 12H5M12 5l-7 7 7 7",
  download:  ["M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4","M7 10l5 5 5-5","M12 15V3"],
  print:     ["M6 9V2h12v7","M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2","M6 14h12v8H6z"],
  clock:     ["M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z","M12 6v6l4 2"],
  zap:       "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  minus:     "M5 12h14",
  phone:     ["M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"],
  mail:      ["M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z","M22 6l-10 7L2 6"],
  mapPin:    ["M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z","M12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"],
  calendar:  ["M3 4h18v18H3z","M16 2v4M8 2v4","M3 10h18"],
  badge:     ["M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"],
  upload:    ["M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4","M17 8l-5-5-5 5","M12 3v12"],
  image:     ["M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z","M8.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z","M21 15l-5-5L5 21"],
  pen:       "M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z",
  seal:      ["M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z","M9 12l2 2 4-4"],
};

// ─── Constants ────────────────────────────────────────────────────────────────
const BASE = "https://api.pencilkraft.in/api";
const NOW = new Date(), CUR_MONTH = NOW.getMonth() + 1, CUR_YEAR = NOW.getFullYear();

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getAuthToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("admin_auth_token");
}
function authHeaders() {
  const token = getAuthToken();
  const h = { "Content-Type": "application/json" };
  if (token) h["Authorization"] = `Bearer ${token}`;
  return h;
}
function str(val) {
  if (val === null || val === undefined) return "—";
  if (typeof val === "string") return val.trim() || "—";
  if (typeof val === "number") return String(val);
  if (typeof val === "object") return val.name || val.title || val.description || val.label || "—";
  return String(val);
}
function fmt(n) {
  if (n === null || n === undefined) return "—";
  return Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtHrs(h) {
  if (!h && h !== 0) return "—";
  const hrs = Math.floor(h), mins = Math.round((h - hrs) * 60);
  return `${hrs}h ${mins}m`;
}
function numberToWords(n) {
  n = Math.round(n); if (!n) return "Zero";
  const ones = ["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"];
  const tens = ["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];
  if (n < 20) return ones[n];
  if (n < 100) return tens[Math.floor(n/10)]+(n%10?" "+ones[n%10]:"");
  if (n < 1000) return ones[Math.floor(n/100)]+" Hundred"+(n%100?" "+numberToWords(n%100):"");
  if (n < 100000) return numberToWords(Math.floor(n/1000))+" Thousand"+(n%1000?" "+numberToWords(n%1000):"");
  if (n < 10000000) return numberToWords(Math.floor(n/100000))+" Lakh"+(n%100000?" "+numberToWords(n%100000):"");
  return numberToWords(Math.floor(n/10000000))+" Crore"+(n%10000000?" "+numberToWords(n%10000000):"");
}

function normaliseEmployee(raw) {
  const name = str(
    raw.name ||
    raw.employee_name ||
    (raw.firstname || raw.first_name
      ? `${raw.firstname || raw.first_name || ""} ${raw.lastname || raw.last_name || ""}`.trim()
      : null) ||
    raw.full_name
  );
  const salary = Number(
    raw.salary || raw.gross_salary || raw.basic_salary || raw.ctc ||
    parseFloat(raw.salary_structure?.monthly_ctc || 0) || 0
  );
  return {
    db_id: raw.id || raw.user_id,
    id:    raw.employee_id || raw.emp_id || raw.id || raw._id || "",
    name,
    email:       str(raw.email || raw.work_email),
    phone:       str(raw.phone || raw.mobile || raw.contact_number || raw.phone_number),
    address:     str(raw.address || raw.current_address || raw.permanent_address),
    designation: str(raw.designation || raw.job_title || raw.position || raw.role),
    department:  str(raw.department || raw.dept),
    joining:     str(raw.joining_date || raw.joiningDate || raw.joining || raw.date_of_joining || raw.doj),
    salary,
    pan_id:      str(raw.pan_id || raw.pan || raw.pan_number),
    bank_name:   str(raw.bank_name || raw.bank),
    bank_account:str(raw.bank_account || raw.account_number || raw.bank_account_number),
    bank_ifsc:   str(raw.ifsc || raw.bank_ifsc || raw.ifsc_code),
    salary_structure_id: raw.salary_structure_id || raw.salary_structure?.id || null,
    salary_structure:    raw.salary_structure || null,
    _raw: raw,
  };
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
const AP = [
  {bg:"#EEF2FF",color:"#4F46E5"},{bg:"#FFF7ED",color:"#EA6B0E"},
  {bg:"#ECFDF5",color:"#059669"},{bg:"#FEF2F2",color:"#DC2626"},
  {bg:"#F5F3FF",color:"#7C3AED"},{bg:"#E0F2FE",color:"#0284C7"},
  {bg:"#FDF4FF",color:"#A21CAF"},{bg:"#F0FDF4",color:"#16A34A"},
];
function getPalette(name=""){let h=0;for(let i=0;i<name.length;i++)h=(h*31+name.charCodeAt(i))&0xffffffff;return AP[Math.abs(h)%AP.length];}
function Avatar({name="?",size=32}){
  const initials=name.split(" ").filter(Boolean).map(n=>n[0]).join("").slice(0,2).toUpperCase()||"?";
  const p=getPalette(name);
  return <div style={{width:size,height:size,borderRadius:"50%",background:p.bg,color:p.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.34,fontWeight:700,flexShrink:0,border:`1.5px solid ${p.color}22`,letterSpacing:"-0.5px"}}>{initials}</div>;
}

function SkeletonRow(){
  return <tr>{[200,90,120,130,90,110,90,120].map((w,i)=><td key={i} style={{padding:"14px 20px"}}><div className="pk-sk" style={{height:13,width:w,borderRadius:6}}/></td>)}</tr>;
}

function Ring({pct=0,size=80,stroke=7,color="#4F46E5",bg="#EEF2FF",label,sublabel}){
  const r=(size-stroke)/2,circ=2*Math.PI*r,dash=(pct/100)*circ;
  return(
    <div style={{position:"relative",width:size,height:size,flexShrink:0}}>
      <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={bg} strokeWidth={stroke}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" style={{transition:"stroke-dasharray 0.8s ease"}}/>
      </svg>
      <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
        <div style={{fontSize:size*0.2,fontWeight:800,color:"#111827",lineHeight:1}}>{label}</div>
        {sublabel&&<div style={{fontSize:size*0.13,color:"#9CA3AF",marginTop:2}}>{sublabel}</div>}
      </div>
    </div>
  );
}

function DayBadge({status,isWorking,earlyOut}){
  if(!isWorking) return <span style={{fontSize:9,color:"#CBD5E1",fontWeight:600}}>OFF</span>;
  if(status==="present") return <span style={{display:"inline-block",padding:"2px 6px",borderRadius:4,background:earlyOut?"#FFFBEB":"#ECFDF5",color:earlyOut?"#D97706":"#059669",fontSize:9,fontWeight:700}}>{earlyOut?"Early Out":"Present"}</span>;
  if(status==="absent")  return <span style={{display:"inline-block",padding:"2px 6px",borderRadius:4,background:"#FEF2F2",color:"#DC2626",fontSize:9,fontWeight:700}}>Absent</span>;
  return <span style={{fontSize:9,color:"#9CA3AF"}}>{status}</span>;
}

// ─── Demo data ─────────────────────────────────────────────────────────────────
const DEMO_EMPLOYEES = [
  {db_id:24,id:"EMP-001",name:"Anthony Lewis",   designation:"Finance Lead", department:"Finance",    email:"anthony@example.com",   phone:"+91 98765 43210", salary:40000,joining:"12 Sep 2024",salary_structure_id:3},
  {db_id:25,id:"EMP-002",name:"Brian Villalobos",designation:"Developer",    department:"Engineering",email:"brian@example.com",     phone:"+91 98765 43211", salary:35000,joining:"24 Oct 2024",salary_structure_id:null},
  {db_id:26,id:"EMP-003",name:"Harvey Smith",    designation:"Executive",    department:"Executive",  email:"harvey@example.com",    phone:"+91 98765 43212", salary:20000,joining:"18 Feb 2024",salary_structure_id:1},
  {db_id:27,id:"EMP-004",name:"Stephan Peralt",  designation:"Executive",    department:"Executive",  email:"peral@example.com",     phone:"+91 98765 43213", salary:22000,joining:"17 Oct 2024",salary_structure_id:null},
  {db_id:28,id:"EMP-005",name:"Doglas Martini",  designation:"Manager",      department:"Management", email:"martini@example.com",   phone:"+91 98765 43214", salary:25000,joining:"20 Jul 2024",salary_structure_id:2},
];

const DEMO_PAYSLIP = {
  success:true,month:"5",year:"2026",month_name:"May 2026",hourly_rate:144.23,
  employee:{id:23,name:"Vasantha Kumar",employee_id:"EMP-001",designation:"Team Lead",department:"IT"},
  summary:{working_days:26,present_days:2,absent_days:24,paid_leaves:0,unpaid_leaves:0,late_days:0,early_out_days:2,scheduled_hours:208,worked_hours:11.38,paid_leave_hours:0,effective_worked_hours:11.38,hour_shortfall:196.62},
  weekly_summary:[
    {week:1,start_date:"2026-05-01",end_date:"2026-05-03",working_days:2,present_days:1,total_worked_hours:8.05},
    {week:2,start_date:"2026-05-04",end_date:"2026-05-10",working_days:6,present_days:1,total_worked_hours:3.33},
    {week:3,start_date:"2026-05-11",end_date:"2026-05-17",working_days:6,present_days:0,total_worked_hours:0},
    {week:4,start_date:"2026-05-18",end_date:"2026-05-24",working_days:6,present_days:0,total_worked_hours:0},
    {week:5,start_date:"2026-05-25",end_date:"2026-05-31",working_days:6,present_days:0,total_worked_hours:0},
  ],
  daily_breakdown:[
    {date:"2026-05-01",day:"Fri",is_working:true,status:"absent",is_late:false,is_early_out:false,worked_hours:0},
    {date:"2026-05-02",day:"Sat",is_working:true,status:"present",is_late:false,is_early_out:true,worked_hours:8.05},
    {date:"2026-05-03",day:"Sun",is_working:false,status:"off",is_late:false,is_early_out:false,worked_hours:0},
    {date:"2026-05-04",day:"Mon",is_working:true,status:"present",is_late:false,is_early_out:true,worked_hours:3.33},
    {date:"2026-05-05",day:"Tue",is_working:true,status:"absent",is_late:false,is_early_out:false,worked_hours:0},
  ],
  earnings:[{name:"Basic Salary",amount:15000},{name:"HRA",amount:7500},{name:"Conveyance Allowance",amount:4500},{name:"Special Allowance",amount:3000}],
  deductions:[{name:"Hour Shortfall Deduction",amount:28358.65}],
  total_earnings:30000,total_deductions:28358.65,net_pay:1641.35,
};

// ══════════════════════════════════════════════════════════════════════════════
// CORPORATE PAYSLIP — PDF-PERFECT DESIGN
// ══════════════════════════════════════════════════════════════════════════════
function CorporatePayslip({ data, template, empData, printRef }) {
  const {
    employee, earnings, deductions,
    total_earnings, total_deductions, net_pay,
    month_name, hourly_rate, summary
  } = data;

  const pc  = template.primaryColor || "#1E3A5F";
  const co  = template.companyName    || "Your Company";
  const coa = template.companyAddress || "";
  const cph = template.companyPhone   || "";
  const cem = template.companyEmail   || "";
  const terms = template.terms || "This is a computer-generated payslip and does not require a physical signature.";
  const logo  = template.logo || null;            // base64 or URL

  // Signatory / e-signature
  const sigName  = template.signatoryName  || "Authorized Signatory";
  const sigTitle = template.signatoryTitle || "HR Manager";

  // Employee enrichment
  const joining     = empData?.joining      || "—";
  const pan         = empData?.pan_id       || template.pan        || "—";
  const bankName    = empData?.bank_name    || template.bankName   || "—";
  const bankAccount = empData?.bank_account || template.bankAccount|| "—";
  const bankIFSC    = empData?.bank_ifsc    || template.bankIFSC   || "—";
  const payMode     = template.paymentMode  || "—";

  const genDate = new Date().toLocaleDateString("en-IN", { day:"2-digit", month:"long", year:"numeric" });

  // Color variants
  const pcDark  = pc;
  const pcLight = `${pc}15`;

  const tdStyle = {
    padding: "8px 14px",
    border: "1px solid #D1D5DB",
    fontSize: 12,
    color: "#374151",
  };
  const thStyle = {
    ...tdStyle,
    background: pc,
    color: "#fff",
    fontWeight: 700,
    fontSize: 11.5,
    textTransform: "uppercase",
    letterSpacing: "0.6px",
  };

  return (
    <div
      ref={printRef}
      id="payslip-print-area"
      style={{
        fontFamily: "'DM Sans', Arial, sans-serif",
        background: "#ffffff",
        width: "100%",
        maxWidth: 794,   // A4 width at 96dpi
        margin: "0 auto",
        padding: 0,
        border: "1px solid #e0e0e0",
        color: "#111827",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Watermark */}
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%,-50%) rotate(-35deg)",
        fontSize: 110, fontWeight: 900, color: `${pc}06`,
        letterSpacing: 12, whiteSpace: "nowrap", userSelect: "none",
        pointerEvents: "none", zIndex: 0,
        fontFamily: "'DM Sans', Arial, sans-serif",
      }}>
        PAYSLIP
      </div>

      {/* ── HEADER BAND ── */}
      <div style={{
        background: `linear-gradient(135deg, ${pc} 0%, ${pc}dd 100%)`,
        padding: "24px 36px",
        position: "relative",
        overflow: "hidden",
        zIndex: 1,
      }}>
        {/* Decorative circles */}
        <div style={{ position:"absolute", top:-40, right:-40, width:160, height:160, borderRadius:"50%", background:"rgba(255,255,255,0.06)" }}/>
        <div style={{ position:"absolute", bottom:-50, right:80, width:120, height:120, borderRadius:"50%", background:"rgba(255,255,255,0.04)" }}/>

        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", position:"relative" }}>
          {/* Left: Logo + Company */}
          <div style={{ display:"flex", alignItems:"center", gap:18 }}>
            {logo ? (
              <img src={logo} alt="logo" style={{ height:60, maxWidth:140, objectFit:"contain", background:"#fff", borderRadius:8, padding:"6px 10px" }}/>
            ) : (
              <div style={{ width:60, height:60, borderRadius:12, background:"rgba(255,255,255,0.15)", border:"2px solid rgba(255,255,255,0.3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, fontWeight:900, color:"#fff", flexShrink:0 }}>
                {co.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <div style={{ fontSize:22, fontWeight:900, color:"#fff", letterSpacing:"-0.5px", lineHeight:1.2 }}>{co}</div>
              {coa && <div style={{ fontSize:11.5, color:"rgba(255,255,255,0.75)", marginTop:4, maxWidth:280 }}>{coa}</div>}
              <div style={{ display:"flex", gap:14, marginTop:5, flexWrap:"wrap" }}>
                {cph && <span style={{ fontSize:10.5, color:"rgba(255,255,255,0.65)" }}>📞 {cph}</span>}
                {cem && <span style={{ fontSize:10.5, color:"rgba(255,255,255,0.65)" }}>✉ {cem}</span>}
              </div>
            </div>
          </div>
          {/* Right: Payslip title */}
          <div style={{ textAlign:"right" }}>
            <div style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.55)", textTransform:"uppercase", letterSpacing:"2.5px", marginBottom:6 }}>Salary Statement</div>
            <div style={{ fontSize:26, fontWeight:900, color:"#fff", letterSpacing:"-0.5px" }}>PAYSLIP</div>
            <div style={{ marginTop:6, padding:"4px 14px", background:"rgba(255,255,255,0.18)", borderRadius:20, display:"inline-block" }}>
              <span style={{ fontSize:12, fontWeight:700, color:"rgba(255,255,255,0.9)" }}>{month_name}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── EMPLOYEE INFO STRIP ── */}
      <div style={{ background: pcLight, borderBottom:"2px solid #E5E7EB", padding:"0", zIndex:1, position:"relative" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <tbody>
            <tr>
              {[
                { label:"Employee Name",   val: employee.name },
                { label:"Employee ID",     val: employee.employee_id || empData?.id || "—" },
                { label:"Designation",     val: employee.designation },
                { label:"Department",      val: employee.department },
              ].map(({ label, val }) => (
                <td key={label} style={{ padding:"12px 18px", borderRight:"1px solid #E5E7EB", verticalAlign:"top", width:"25%" }}>
                  <div style={{ fontSize:9.5, fontWeight:700, color:pc, textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:3 }}>{label}</div>
                  <div style={{ fontSize:13, fontWeight:700, color:"#111827" }}>{val}</div>
                </td>
              ))}
            </tr>
            <tr style={{ borderTop:"1px solid #E5E7EB" }}>
              {[
                { label:"Date of Joining", val: joining },
                { label:"PAN Number",      val: pan },
                { label:"Working Days",    val: `${summary.present_days} / ${summary.working_days}` },
                { label:"Generated On",    val: genDate },
              ].map(({ label, val }) => (
                <td key={label} style={{ padding:"12px 18px", borderRight:"1px solid #E5E7EB", verticalAlign:"top", width:"25%" }}>
                  <div style={{ fontSize:9.5, fontWeight:700, color:pc, textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:3 }}>{label}</div>
                  <div style={{ fontSize:13, fontWeight:700, color:"#111827" }}>{val}</div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* ── BANK DETAILS STRIP ── */}
      {(bankName !== "—" || bankAccount !== "—" || bankIFSC !== "—") && (
        <div style={{ padding:"10px 18px", background:"#F9FAFB", borderBottom:"1px solid #E5E7EB", display:"flex", gap:28, flexWrap:"wrap", zIndex:1, position:"relative" }}>
          {[
            { label:"Bank Name",    val: bankName    },
            { label:"Account No",   val: bankAccount },
            { label:"IFSC Code",    val: bankIFSC    },
            { label:"Payment Mode", val: payMode     },
          ].filter(f => f.val && f.val !== "—").map(({ label, val }) => (
            <div key={label}>
              <span style={{ fontSize:9.5, fontWeight:700, color:"#6B7280", textTransform:"uppercase", letterSpacing:"0.6px" }}>{label}: </span>
              <span style={{ fontSize:11.5, fontWeight:700, color:"#111827" }}>{val}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── EARNINGS & DEDUCTIONS (2-column) ── */}
      <div style={{ padding:"24px 28px", zIndex:1, position:"relative" }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>

          {/* EARNINGS */}
          <div>
            <table style={{ width:"100%", borderCollapse:"collapse", border:"1px solid #D1D5DB" }}>
              <thead>
                <tr>
                  <th style={{ ...thStyle, textAlign:"left", borderRadius:0 }}>Earnings</th>
                  <th style={{ ...thStyle, textAlign:"right" }}>Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                {earnings.map((e, i) => (
                  <tr key={i} style={{ background: i%2===0 ? "#fff" : "#F9FAFB" }}>
                    <td style={{ ...tdStyle, fontWeight:500 }}>{e.name}</td>
                    <td style={{ ...tdStyle, textAlign:"right", fontWeight:700, color:"#059669" }}>
                      {e.amount.toLocaleString("en-IN", { minimumFractionDigits:2 })}
                    </td>
                  </tr>
                ))}
                {/* pad rows to match deductions height if needed */}
                {earnings.length < deductions.length &&
                  Array(deductions.length - earnings.length).fill(null).map((_, i) => (
                    <tr key={`pad-${i}`} style={{ background: (earnings.length+i)%2===0?"#fff":"#F9FAFB" }}>
                      <td style={{ ...tdStyle, color:"transparent" }}>—</td>
                      <td style={{ ...tdStyle }}></td>
                    </tr>
                  ))
                }
              </tbody>
              <tfoot>
                <tr style={{ background: `${pc}12` }}>
                  <td style={{ ...tdStyle, fontWeight:800, color:pc, borderTop:"2px solid "+pc }}>Gross Earnings</td>
                  <td style={{ ...tdStyle, textAlign:"right", fontWeight:900, color:pc, borderTop:"2px solid "+pc, fontSize:14 }}>
                    {total_earnings.toLocaleString("en-IN", { minimumFractionDigits:2 })}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* DEDUCTIONS */}
          <div>
            <table style={{ width:"100%", borderCollapse:"collapse", border:"1px solid #D1D5DB" }}>
              <thead>
                <tr>
                  <th style={{ ...thStyle, textAlign:"left", background:"#DC2626" }}>Deductions</th>
                  <th style={{ ...thStyle, textAlign:"right", background:"#DC2626" }}>Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                {deductions.map((d, i) => (
                  <tr key={i} style={{ background: i%2===0 ? "#fff" : "#FFF9F9" }}>
                    <td style={{ ...tdStyle, fontWeight:500 }}>{d.name}</td>
                    <td style={{ ...tdStyle, textAlign:"right", fontWeight:700, color:"#DC2626" }}>
                      {fmt(d.amount)}
                    </td>
                  </tr>
                ))}
                {/* Shortfall detail row */}
                {summary.hour_shortfall > 0 && (
                  <tr style={{ background:"#FFF9F9" }}>
                    <td colSpan={2} style={{ ...tdStyle, fontSize:10.5, color:"#9CA3AF", paddingLeft:22, fontStyle:"italic" }}>
                      ↳ {fmtHrs(summary.hour_shortfall)} × ₹{hourly_rate}/hr
                    </td>
                  </tr>
                )}
                {/* Pad to match earnings */}
                {deductions.length < earnings.length &&
                  Array(earnings.length - deductions.length).fill(null).map((_,i) => (
                    <tr key={`pad-${i}`} style={{ background:(deductions.length+i)%2===0?"#fff":"#FFF9F9" }}>
                      <td style={{ ...tdStyle, color:"transparent" }}>—</td>
                      <td style={{ ...tdStyle }}></td>
                    </tr>
                  ))
                }
              </tbody>
              <tfoot>
                <tr style={{ background:"#FEF2F2" }}>
                  <td style={{ ...tdStyle, fontWeight:800, color:"#DC2626", borderTop:"2px solid #DC2626" }}>Total Deductions</td>
                  <td style={{ ...tdStyle, textAlign:"right", fontWeight:900, color:"#DC2626", borderTop:"2px solid #DC2626", fontSize:14 }}>
                    {fmt(total_deductions)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* ── NET PAY BANNER ── */}
        <div style={{
          marginTop:20,
          background:`linear-gradient(135deg, ${pc} 0%, ${pc}ee 100%)`,
          borderRadius:10,
          padding:"18px 28px",
          display:"flex",
          alignItems:"center",
          justifyContent:"space-between",
          position:"relative",
          overflow:"hidden",
        }}>
          <div style={{ position:"absolute", right:-30, top:-30, width:120, height:120, borderRadius:"50%", background:"rgba(255,255,255,0.07)" }}/>
          <div>
            <div style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.6)", textTransform:"uppercase", letterSpacing:"2px", marginBottom:4 }}>Net Take Home Pay</div>
            <div style={{ fontSize:32, fontWeight:900, color:"#fff", letterSpacing:"-1px", lineHeight:1 }}>
              ₹ {net_pay.toLocaleString("en-IN", { minimumFractionDigits:2 })}
            </div>
            <div style={{ fontSize:11.5, color:"rgba(255,255,255,0.65)", marginTop:6, fontStyle:"italic" }}>
              {numberToWords(Math.round(net_pay))} Only
            </div>
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontSize:11, color:"rgba(255,255,255,0.55)", marginBottom:8 }}>Summary</div>
            <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
              <div style={{ display:"flex", gap:12, justifyContent:"flex-end" }}>
                <span style={{ fontSize:11.5, color:"rgba(255,255,255,0.7)" }}>Gross Earnings</span>
                <span style={{ fontSize:12, fontWeight:700, color:"rgba(255,255,255,0.9)" }}>₹{total_earnings.toLocaleString("en-IN")}</span>
              </div>
              <div style={{ display:"flex", gap:12, justifyContent:"flex-end" }}>
                <span style={{ fontSize:11.5, color:"rgba(255,255,255,0.7)" }}>Total Deductions</span>
                <span style={{ fontSize:12, fontWeight:700, color:"#FCA5A5" }}>₹{fmt(total_deductions)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── ATTENDANCE SUMMARY ROW ── */}
        <div style={{ marginTop:16, display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:1, border:"1px solid #E5E7EB", borderRadius:8, overflow:"hidden" }}>
          {[
            { label:"Working Days",   val: summary.working_days,    color: pc         },
            { label:"Present",        val: summary.present_days,    color: "#059669"  },
            { label:"Absent",         val: summary.absent_days,     color: "#DC2626"  },
            { label:"Paid Leaves",    val: summary.paid_leaves,     color: "#2563EB"  },
            { label:"Hours Worked",   val: fmtHrs(summary.effective_worked_hours), color:"#7C3AED" },
            { label:"Hour Shortfall", val: fmtHrs(summary.hour_shortfall), color:"#D97706" },
          ].map(({ label, val, color }) => (
            <div key={label} style={{ padding:"10px 12px", background:"#FAFBFC", textAlign:"center", borderRight:"1px solid #E5E7EB" }}>
              <div style={{ fontSize:15, fontWeight:800, color }}>{val}</div>
              <div style={{ fontSize:9.5, color:"#6B7280", marginTop:2, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.4px" }}>{label}</div>
            </div>
          ))}
        </div>

        {/* ── SIGNATURE SECTION ── */}
        <div style={{ marginTop:28, display:"flex", alignItems:"flex-end", justifyContent:"space-between" }}>
          {/* Left: Note */}
          <div style={{ flex:1, paddingRight:40 }}>
            <div style={{ padding:"10px 14px", background:"#F9FAFB", border:"1px solid #E5E7EB", borderRadius:8, fontSize:10.5, color:"#6B7280", fontStyle:"italic", lineHeight:1.7 }}>
              * {terms}
            </div>
          </div>

          {/* Right: E-Signature Box */}
          <div style={{ width:220, textAlign:"center", flexShrink:0 }}>
            {/* Signature graphic */}
            <div style={{ position:"relative", height:64, marginBottom:4, display:"flex", alignItems:"center", justifyContent:"center" }}>
              {/* Decorative seal */}
              <div style={{ position:"absolute", right:0, top:0, width:52, height:52, borderRadius:"50%", border:`2px solid ${pc}33`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <div style={{ width:42, height:42, borderRadius:"50%", border:`1.5px dashed ${pc}55`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={pc} strokeWidth={1.5} strokeLinecap="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/>
                  </svg>
                </div>
              </div>
              {/* Signature text in cursive style */}
              <div style={{ textAlign:"left" }}>
                <div style={{
                  fontSize: 28,
                  color: pc,
                  fontFamily: "'Dancing Script', 'Brush Script MT', cursive",
                  letterSpacing: "1px",
                  lineHeight: 1,
                  paddingLeft: 8,
                }}>
                  {sigName.split(" ").slice(0,2).join(" ")}
                </div>
              </div>
            </div>
            {/* Signature line */}
            <div style={{ borderTop:`2px solid ${pc}`, paddingTop:6, marginBottom:2 }}/>
            <div style={{ fontSize:12, fontWeight:700, color:"#111827" }}>{sigName}</div>
            <div style={{ fontSize:10.5, color:"#6B7280", marginTop:2 }}>{sigTitle}</div>
            <div style={{ fontSize:10, color:`${pc}`, marginTop:2, fontWeight:600 }}>Electronically Authorized</div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop:18, paddingTop:12, borderTop:"1px solid #F3F4F6", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ fontSize:9.5, color:"#9CA3AF" }}>
            Generated on {genDate} · {co}
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <div style={{ width:6, height:6, borderRadius:"50%", background:pc }}/>
            <div style={{ fontSize:9.5, color:"#9CA3AF" }}>Confidential — For recipient only</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PAYSLIP DETAIL VIEW
// ══════════════════════════════════════════════════════════════════════════════
function PayslipDetailView({ employeeDbId, empData, primaryColor, template, onBack, onEditTemplate }) {
  const [data, setData]               = useState(null);
  const [loading, setLoading]         = useState(true);
  const [tab, setTab]                 = useState("payslip");
  const [downloading, setDownloading] = useState(false);
  const printRef = useRef(null);
  const pc = template.primaryColor || primaryColor;

  useEffect(() => {
    setLoading(true); setTab("payslip");
    (async () => {
      try {
        const res = await fetch(`${BASE}/admin/payslip/${employeeDbId}/${CUR_MONTH}/${CUR_YEAR}`, { headers: authHeaders() });
        if (res.ok) { const json = await res.json(); setData(json); }
        else throw new Error(`HTTP ${res.status}`);
      } catch {
        setData({
          ...DEMO_PAYSLIP,
          employee: {
            ...DEMO_PAYSLIP.employee,
            name: empData?.name || DEMO_PAYSLIP.employee.name,
            employee_id: empData?.id || DEMO_PAYSLIP.employee.employee_id,
            designation: empData?.designation || DEMO_PAYSLIP.employee.designation,
            department: empData?.department || DEMO_PAYSLIP.employee.department,
          }
        });
      } finally { setLoading(false); }
    })();
  }, [employeeDbId]);

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      const el = printRef.current;
      if (!el) return;
      const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Payslip - ${data?.employee?.name || ""} - ${data?.month_name || ""}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800;900&family=Dancing+Script:wght@700&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'DM Sans', Arial, sans-serif;
      background: #fff;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      color: #111827;
    }
    @page {
      size: A4;
      margin: 0;
    }
    @media print {
      body { margin: 0; }
      #payslip-print-area { max-width: 100% !important; border: none !important; }
    }
  </style>
</head>
<body>${el.outerHTML}</body>
</html>`;
      const blob = new Blob([html], { type: "text/html" });
      const url  = URL.createObjectURL(blob);
      const win  = window.open(url, "_blank");
      if (win) {
        win.onload = () => {
          setTimeout(() => { win.print(); URL.revokeObjectURL(url); }, 800);
        };
      }
    } finally { setTimeout(() => setDownloading(false), 1200); }
  };

  if (loading) return (
    <div style={{ padding: "40px 32px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
        <button onClick={onBack} style={{ width:36, height:36, borderRadius:9, border:"1px solid #E5E7EB", background:"#fff", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}><Icon d={ICONS.back} stroke="#374151" size={16}/></button>
        <div className="pk-sk" style={{ height:16, width:220, borderRadius:6 }}/>
      </div>
      <div className="pk-sk" style={{ height:160, borderRadius:20, marginBottom:20 }}/>
    </div>
  );

  const { employee, summary, weekly_summary, daily_breakdown, earnings, deductions, total_earnings, total_deductions, net_pay, hourly_rate, month_name } = data;
  const attPct = summary.working_days ? Math.round((summary.present_days/summary.working_days)*100) : 0;
  const hrsPct = summary.scheduled_hours ? Math.round((summary.effective_worked_hours/summary.scheduled_hours)*100) : 0;
  const TABS   = [{ key:"payslip", label:"Salary Slip" }, { key:"attendance", label:"Attendance" }, { key:"calendar", label:"Calendar" }];

  return (
    <div style={{ padding:"28px 32px" }}>
      {/* Top Row */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24, flexWrap:"wrap", gap:12 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <button onClick={onBack} className="pk-btn" style={{ width:36, height:36, borderRadius:9, border:"1px solid #E5E7EB", background:"#fff", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Icon d={ICONS.back} stroke="#374151" size={16}/>
          </button>
          <Avatar name={employee.name} size={40}/>
          <div>
            <div style={{ fontSize:15, fontWeight:700, color:"#111827" }}>{employee.name}</div>
            <div style={{ fontSize:11, color:"#9CA3AF", marginTop:2 }}>{employee.employee_id} · {employee.designation} · {employee.department} · {month_name}</div>
          </div>
        </div>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          <button onClick={() => window.print()} className="pk-btn"
            style={{ display:"flex", alignItems:"center", gap:7, padding:"8px 16px", background:"#F7F8FA", border:"1px solid #E5E7EB", borderRadius:9, fontSize:13, fontWeight:600, color:"#374151" }}>
            <Icon d={ICONS.print} stroke="#374151" size={13}/> Print
          </button>
          <button onClick={onEditTemplate} className="pk-btn"
            style={{ display:"flex", alignItems:"center", gap:7, padding:"8px 16px", background:"#fff", border:`1.5px solid ${pc}`, borderRadius:9, fontSize:13, fontWeight:600, color:pc }}>
            <Icon d={ICONS.edit} stroke={pc} size={13}/> Edit Template
          </button>
          <button onClick={handleDownloadPDF} disabled={downloading} className="pk-btn"
            style={{ display:"flex", alignItems:"center", gap:7, padding:"8px 16px", background:pc, border:"none", borderRadius:9, fontSize:13, fontWeight:600, color:"#fff", boxShadow:`0 2px 8px ${pc}40`, opacity:downloading?0.75:1 }}>
            <Icon d={ICONS.download} stroke="#fff" size={13}/> {downloading ? "Opening…" : "Download PDF"}
          </button>
        </div>
      </div>

      {/* Employee Detail Card */}
      {empData && (
        <div className="pk-card" style={{ background:"#fff", borderRadius:16, border:"1px solid #EAECF0", padding:"18px 24px", marginBottom:18, boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))", gap:16 }}>
            {[
              { icon:ICONS.badge,    label:"Employee ID",  val:empData.id       },
              { icon:ICONS.mail,     label:"Email",        val:empData.email    },
              { icon:ICONS.phone,    label:"Phone",        val:empData.phone    },
              { icon:ICONS.calendar, label:"Joining Date", val:empData.joining  },
              { icon:ICONS.mapPin,   label:"Address",      val:empData.address  },
            ].filter(f => f.val && f.val !== "—").map(({ icon, label, val }) => (
              <div key={label} style={{ display:"flex", alignItems:"flex-start", gap:8 }}>
                <div style={{ width:28, height:28, borderRadius:8, background:`${pc}10`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:1 }}>
                  <Icon d={icon} stroke={pc} size={12} sw={2}/>
                </div>
                <div>
                  <div style={{ fontSize:10, fontWeight:600, color:"#9CA3AF", textTransform:"uppercase", letterSpacing:"0.5px" }}>{label}</div>
                  <div style={{ fontSize:12.5, fontWeight:600, color:"#111827", marginTop:2, wordBreak:"break-all" }}>{val}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hero */}
      <div className="pk-card" style={{ background:`linear-gradient(135deg,${pc} 0%,${pc}cc 100%)`, borderRadius:20, padding:"28px 36px", marginBottom:18, position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:-60, right:-60, width:220, height:220, borderRadius:"50%", background:"rgba(255,255,255,0.05)" }}/>
        <div style={{ position:"relative", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:20 }}>
          <div style={{ display:"flex", alignItems:"center", gap:18 }}>
            <div style={{ width:60, height:60, borderRadius:"50%", background:"rgba(255,255,255,0.18)", border:"2px solid rgba(255,255,255,0.35)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, fontWeight:800, color:"#fff", flexShrink:0 }}>
              {employee.name.split(" ").filter(Boolean).map(n=>n[0]).join("").slice(0,2).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize:20, fontWeight:800, color:"#fff" }}>{employee.name}</div>
              <div style={{ display:"flex", gap:12, marginTop:5, flexWrap:"wrap" }}>
                <span style={{ fontSize:12, color:"rgba(255,255,255,0.75)" }}>🏷 {employee.designation}</span>
                <span style={{ fontSize:12, color:"rgba(255,255,255,0.75)" }}>🏢 {employee.department}</span>
                <span style={{ fontSize:12, color:"rgba(255,255,255,0.75)" }}>🆔 {employee.employee_id || empData?.id}</span>
              </div>
            </div>
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontSize:10, fontWeight:700, color:"rgba(255,255,255,0.5)", textTransform:"uppercase", letterSpacing:"2px", marginBottom:5 }}>Net Pay · {month_name}</div>
            <div style={{ fontSize:36, fontWeight:900, color:"#fff", letterSpacing:"-2px", lineHeight:1 }}>₹{net_pay.toLocaleString("en-IN",{minimumFractionDigits:2})}</div>
            <div style={{ fontSize:11, color:"rgba(255,255,255,0.55)", marginTop:4 }}>{numberToWords(Math.round(net_pay))} Only</div>
            <div style={{ display:"flex", gap:8, marginTop:10, justifyContent:"flex-end" }}>
              <span style={{ padding:"5px 12px", background:"rgba(255,255,255,0.15)", borderRadius:8, fontSize:12, color:"rgba(255,255,255,0.85)", fontWeight:600 }}>Earnings ₹{total_earnings.toLocaleString("en-IN")}</span>
              <span style={{ padding:"5px 12px", background:"rgba(220,38,38,0.25)", borderRadius:8, fontSize:12, color:"rgba(255,200,200,0.9)", fontWeight:600 }}>Deductions ₹{fmt(total_deductions)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:14, marginBottom:18 }}>
        {[
          { label:"Present Days",   value:`${summary.present_days}/${summary.working_days}`, sub:"days",            color:pc,        bg:`${pc}10`, icon:ICONS.check  },
          { label:"Absent Days",    value:summary.absent_days,                               sub:"days missed",     color:"#DC2626", bg:"#FEF2F2", icon:ICONS.alert  },
          { label:"Hours Worked",   value:fmtHrs(summary.effective_worked_hours),            sub:`of ${summary.scheduled_hours}h`, color:"#059669", bg:"#ECFDF5", icon:ICONS.clock },
          { label:"Hour Shortfall", value:fmtHrs(summary.hour_shortfall),                   sub:"below scheduled", color:"#D97706", bg:"#FFFBEB", icon:ICONS.minus  },
          { label:"Hourly Rate",    value:`₹${hourly_rate}`,                                 sub:"per hour",        color:"#7C3AED", bg:"#F5F3FF", icon:ICONS.zap    },
        ].map((s,i) => (
          <div key={i} className="pk-card" style={{ background:"#fff", borderRadius:14, padding:"18px 20px", border:"1px solid #EAECF0", boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
            <div style={{ width:34, height:34, borderRadius:9, background:s.bg, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:12 }}><Icon d={s.icon} stroke={s.color} size={14} sw={2}/></div>
            <div style={{ fontSize:19, fontWeight:800, color:"#111827", letterSpacing:"-0.5px", lineHeight:1 }}>{s.value}</div>
            <div style={{ fontSize:11.5, fontWeight:600, color:"#374151", marginTop:5 }}>{s.label}</div>
            <div style={{ fontSize:10.5, color:"#9CA3AF", marginTop:2 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", gap:4, marginBottom:18, background:"#fff", padding:5, borderRadius:12, border:"1px solid #EAECF0", width:"fit-content" }}>
        {TABS.map(t => (
          <button key={t.key} className="pk-tab" onClick={() => setTab(t.key)}
            style={{ padding:"8px 22px", borderRadius:9, fontSize:13, fontWeight:600, background:tab===t.key?pc:"transparent", color:tab===t.key?"#fff":"#6B7280", border:"none", boxShadow:tab===t.key?`0 2px 8px ${pc}44`:"none" }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* SALARY SLIP TAB */}
      {tab === "payslip" && (
        <div className="pk-card" style={{ background:"#F9FAFB", borderRadius:16, border:"1px solid #EAECF0", padding:24, boxShadow:"0 1px 8px rgba(0,0,0,0.05)" }}>
          {/* Hidden node for PDF capture */}
          <div style={{ position:"absolute", left:"-9999px", top:0 }}>
            <CorporatePayslip data={data} template={template} empData={empData} printRef={printRef}/>
          </div>
          {/* Visible preview */}
          <CorporatePayslip data={data} template={template} empData={empData} printRef={{ current: null }}/>
        </div>
      )}

      {/* ATTENDANCE TAB */}
      {tab === "attendance" && (
        <div className="pk-card">
          <div style={{ display:"grid", gridTemplateColumns:"280px 1fr", gap:18, marginBottom:18 }}>
            <div style={{ background:"#fff", borderRadius:16, border:"1px solid #EAECF0", padding:"22px", boxShadow:"0 1px 6px rgba(0,0,0,0.04)" }}>
              <div style={{ fontSize:13, fontWeight:700, color:"#111827", marginBottom:16 }}>Attendance Rate</div>
              <div style={{ display:"flex", justifyContent:"space-around", marginBottom:16 }}>
                <div style={{ textAlign:"center" }}><Ring pct={attPct} size={84} stroke={8} color={pc} bg={`${pc}18`} label={`${attPct}%`} sublabel="days"/><div style={{ fontSize:11.5, fontWeight:600, color:"#374151", marginTop:8 }}>Day Rate</div></div>
                <div style={{ textAlign:"center" }}><Ring pct={hrsPct} size={84} stroke={8} color="#F59E0B" bg="#FFF8E6" label={`${hrsPct}%`} sublabel="hours"/><div style={{ fontSize:11.5, fontWeight:600, color:"#374151", marginTop:8 }}>Hour Rate</div></div>
              </div>
              {[{ dot:pc, label:"Present", val:summary.present_days+"d" },{ dot:"#EF4444", label:"Absent", val:summary.absent_days+"d" },{ dot:"#3B82F6", label:"Paid Leave", val:summary.paid_leaves+"d" },{ dot:"#A855F7", label:"Early Out", val:summary.early_out_days+"d" }].map(l => (
                <div key={l.label} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"7px 0", borderBottom:"1px solid #F3F4F6" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}><div style={{ width:8, height:8, borderRadius:"50%", background:l.dot }}/><span style={{ fontSize:12, color:"#374151", fontWeight:500 }}>{l.label}</span></div>
                  <span style={{ fontSize:12, fontWeight:700, color:"#111827" }}>{l.val}</span>
                </div>
              ))}
            </div>
            <div style={{ background:"#fff", borderRadius:16, border:"1px solid #EAECF0", padding:"22px", boxShadow:"0 1px 6px rgba(0,0,0,0.04)" }}>
              <div style={{ fontSize:13, fontWeight:700, color:"#111827", marginBottom:14 }}>Weekly Breakdown</div>
              <div style={{ display:"flex", gap:10, alignItems:"flex-end", marginBottom:20 }}>
                {weekly_summary.map(w => {
                  const p = Math.min(100,(w.total_worked_hours/48)*100);
                  const bc = p>60?pc:p>30?"#F59E0B":"#EF4444";
                  return (
                    <div key={w.week} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:5 }}>
                      <div style={{ fontSize:10, fontWeight:600, color:"#9CA3AF" }}>{fmtHrs(w.total_worked_hours)}</div>
                      <div style={{ width:"100%", height:70, background:"#F3F4F6", borderRadius:7, overflow:"hidden", display:"flex", alignItems:"flex-end" }}>
                        <div style={{ width:"100%", height:`${Math.max(p,2)}%`, background:bc, borderRadius:"6px 6px 0 0", transition:"height 0.7s ease" }}/>
                      </div>
                      <div style={{ fontSize:11, fontWeight:700, color:"#374151" }}>Wk {w.week}</div>
                      <div style={{ fontSize:10, color:"#9CA3AF" }}>{w.present_days}/{w.working_days}d</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CALENDAR TAB */}
      {tab === "calendar" && (
        <div className="pk-card" style={{ background:"#fff", borderRadius:16, border:"1px solid #EAECF0", overflow:"hidden", boxShadow:"0 1px 6px rgba(0,0,0,0.04)" }}>
          <div style={{ padding:"16px 24px", borderBottom:"1px solid #F3F4F6", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:10 }}>
            <div style={{ fontSize:13, fontWeight:700, color:"#111827" }}>Daily Attendance · {month_name}</div>
            <div style={{ display:"flex", gap:14, flexWrap:"wrap" }}>
              {[{ dot:"#059669", label:"Present" },{ dot:"#D97706", label:"Early Out" },{ dot:"#DC2626", label:"Absent" },{ dot:"#CBD5E1", label:"Off" }].map(l => (
                <div key={l.label} style={{ display:"flex", alignItems:"center", gap:5, fontSize:11.5, color:"#374151", fontWeight:500 }}><div style={{ width:8, height:8, borderRadius:"50%", background:l.dot }}/>{l.label}</div>
              ))}
            </div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", background:"#FAFBFC", borderBottom:"1px solid #F3F4F6" }}>
            {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => <div key={d} style={{ padding:"10px 0", textAlign:"center", fontSize:11, fontWeight:700, color:"#9CA3AF", textTransform:"uppercase" }}>{d}</div>)}
          </div>
          <div style={{ padding:14 }}>
            {(() => {
              const first = new Date(daily_breakdown[0].date).getDay();
              const cells = [...Array(first).fill(null), ...daily_breakdown];
              const weeks = [];
              for (let i=0; i<cells.length; i+=7) weeks.push(cells.slice(i,i+7));
              return weeks.map((week,wi) => (
                <div key={wi} style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:5, marginBottom:5 }}>
                  {week.map((day,di) => {
                    if (!day) return <div key={di}/>;
                    const dn = new Date(day.date).getDate();
                    let cbg="#FAFAFA", tc="#374151", bc="#F0F0F0";
                    if (!day.is_working) { cbg="#F8FAFC"; tc="#CBD5E1"; bc="#EEF2F7"; }
                    else if (day.status==="present"&&!day.is_early_out) { cbg="#ECFDF5"; tc="#059669"; bc="#A7F3D0"; }
                    else if (day.status==="present"&&day.is_early_out)  { cbg="#FFFBEB"; tc="#D97706"; bc="#FDE68A"; }
                    else if (day.status==="absent") { cbg="#FEF2F2"; tc="#DC2626"; bc="#FECACA"; }
                    return (
                      <div key={di} style={{ background:cbg, border:`1px solid ${bc}`, borderRadius:9, padding:"9px 6px", minHeight:70, display:"flex", flexDirection:"column", alignItems:"center", gap:3 }}>
                        <div style={{ fontSize:13, fontWeight:800, color:tc }}>{dn}</div>
                        <div style={{ fontSize:9, fontWeight:600, color:"#9CA3AF", textTransform:"uppercase" }}>{day.day}</div>
                        <DayBadge status={day.status} isWorking={day.is_working} earlyOut={day.is_early_out}/>
                        {day.worked_hours>0 && <div style={{ fontSize:9, color:tc, fontWeight:700 }}>{fmtHrs(day.worked_hours)}</div>}
                      </div>
                    );
                  })}
                  {Array(7-week.length).fill(null).map((_,i) => <div key={`t${i}`}/>)}
                </div>
              ));
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ASSIGN MODAL (unchanged logic, kept compact)
// ══════════════════════════════════════════════════════════════════════════════
function AssignSalaryStructureModal({ employee, onClose, onSave, primaryColor }) {
  const [structures, setStructures] = useState([]);
  const [selectedId, setSelectedId] = useState(employee?.salary_structure_id || null);
  const [loading,  setLoading]      = useState(true);
  const [saving,   setSaving]       = useState(false);
  const [error,    setError]        = useState("");
  const [success,  setSuccess]      = useState(false);
  const nid = employee?.db_id || employee?.id;

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`${BASE}/admin/salary-structures`, { headers: authHeaders() });
        if (res.ok) { const d = await res.json(); setStructures(Array.isArray(d)?d:(d.salary_structures||d.data||d.results||[])); }
        else throw new Error();
      } catch {
        setStructures([
          { id:1, name:"Junior",    grade:"junior", monthly_ctc:"20000.00", annual_ctc:"240000.00",  is_active:1 },
          { id:2, name:"Mid-Level", grade:"mid",    monthly_ctc:"40000.00", annual_ctc:"480000.00",  is_active:1 },
          { id:3, name:"Basic",     grade:"basic",  monthly_ctc:"30000.00", annual_ctc:"360000.00",  is_active:1 },
          { id:4, name:"Senior",    grade:"senior", monthly_ctc:"70000.00", annual_ctc:"840000.00",  is_active:1 },
          { id:5, name:"Lead",      grade:"lead",   monthly_ctc:"100000.00",annual_ctc:"1200000.00", is_active:1 },
        ]);
      } finally { setLoading(false); }
    })();
  }, []);

  const handleAssign = async () => {
    if (!selectedId) { setError("Please select a structure."); return; }
    setSaving(true); setError("");
    try {
      const res = await fetch(`${BASE}/admin/employees/${nid}/assign-salary-structure`, { method:"POST", headers:authHeaders(), body:JSON.stringify({ salary_structure_id: selectedId }) });
      if (res.ok) { setSuccess(true); setTimeout(() => { onSave(); onClose(); }, 900); }
      else { const b = await res.json().catch(()=>({})); setError(b.message||`Error ${res.status}`); }
    } catch { setError("Network error."); } finally { setSaving(false); }
  };

  const GS = {
    junior:  { badge:"#EFF6FF", badgeText:"#1D4ED8", accent:"#3B82F6", ring:"#BFDBFE" },
    mid:     { badge:"#F0FDF4", badgeText:"#15803D", accent:"#22C55E", ring:"#BBF7D0" },
    basic:   { badge:"#FEFCE8", badgeText:"#A16207", accent:"#EAB308", ring:"#FDE68A" },
    senior:  { badge:"#FDF4FF", badgeText:"#7E22CE", accent:"#A855F7", ring:"#E9D5FF" },
    lead:    { badge:"#FFF7ED", badgeText:"#C2410C", accent:"#F97316", ring:"#FED7AA" },
    default: { badge:"#F8FAFC", badgeText:"#475569", accent:"#64748B", ring:"#E2E8F0" },
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(15,23,42,0.6)", backdropFilter:"blur(8px)", zIndex:900, display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      <div style={{ background:"#fff", borderRadius:20, width:"100%", maxWidth:540, maxHeight:"90vh", display:"flex", flexDirection:"column", overflow:"hidden", boxShadow:"0 30px 80px rgba(0,0,0,0.25)" }}>
        <div style={{ padding:"22px 28px", borderBottom:"1px solid #F1F5F9", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <div style={{ width:40, height:40, borderRadius:12, background:`${primaryColor}12`, border:`1.5px solid ${primaryColor}25`, display:"flex", alignItems:"center", justifyContent:"center" }}><Icon d={ICONS.layers} stroke={primaryColor} size={17} sw={2}/></div>
            <div><div style={{ fontSize:16, fontWeight:700, color:"#111827" }}>Assign Salary Structure</div><div style={{ fontSize:12, color:"#9CA3AF", marginTop:2 }}>Select a structure for {employee?.name}</div></div>
          </div>
          <button onClick={onClose} style={{ width:32, height:32, borderRadius:8, background:"#F8FAFC", border:"1px solid #E5E7EB", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}><Icon d={ICONS.close} stroke="#6B7280" size={14}/></button>
        </div>
        <div style={{ flex:1, overflowY:"auto", padding:"20px 28px" }}>
          {loading ? [1,2,3].map(i=><div key={i} className="pk-sk" style={{ height:72, borderRadius:12, marginBottom:8 }}/>) :
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {structures.map(s => {
                const st = GS[(s.grade||"default").toLowerCase()]||GS.default;
                const mo = parseFloat(s.monthly_ctc||0), isSel = selectedId===s.id;
                return (
                  <div key={s.id} onClick={() => setSelectedId(s.id)} style={{ border:`1.5px solid ${isSel?st.accent:"#E5E7EB"}`, borderRadius:12, padding:"14px 18px", cursor:"pointer", background:isSel?st.badge:"#fff", transition:"all 0.15s", boxShadow:isSel?`0 0 0 3px ${st.ring}`:"0 1px 3px rgba(0,0,0,0.04)", position:"relative" }}>
                    {s.is_active===1 && <div style={{ position:"absolute", top:12, right:14, width:6, height:6, borderRadius:"50%", background:"#22C55E" }}/>}
                    <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                      <div style={{ width:18, height:18, borderRadius:"50%", border:`2px solid ${isSel?st.accent:"#D1D5DB"}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>{isSel&&<div style={{ width:8, height:8, borderRadius:"50%", background:st.accent }}/>}</div>
                      <div style={{ flex:1 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:8 }}><span style={{ fontSize:13.5, fontWeight:700, color:"#111827" }}>{s.name}</span><span style={{ background:st.badge, color:st.badgeText, border:`1px solid ${st.ring}`, padding:"1px 8px", borderRadius:99, fontSize:10, fontWeight:700 }}>{(s.grade||"—").toUpperCase()}</span></div>
                      </div>
                      <div style={{ textAlign:"right" }}><div style={{ fontSize:15, fontWeight:800, color:isSel?st.badgeText:"#111827" }}>₹{mo.toLocaleString("en-IN")}<span style={{ fontSize:10, fontWeight:500, color:"#9CA3AF" }}>/mo</span></div></div>
                    </div>
                  </div>
                );
              })}
            </div>}
        </div>
        {(error||success) && <div style={{ padding:"0 28px 12px" }}>
          {error   && <div style={{ background:"#FEF2F2", color:"#DC2626", padding:"10px 14px", borderRadius:10, fontSize:12.5, border:"1px solid #FECACA" }}>{error}</div>}
          {success && <div style={{ background:"#F0FDF4", color:"#16A34A", padding:"10px 14px", borderRadius:10, fontSize:12.5, border:"1px solid #BBF7D0" }}>Assigned successfully!</div>}
        </div>}
        <div style={{ padding:"16px 28px", borderTop:"1px solid #F1F5F9", display:"flex", gap:10, justifyContent:"flex-end", background:"#FAFBFC" }}>
          <button onClick={onClose} style={{ padding:"9px 20px", border:"1px solid #E5E7EB", borderRadius:10, background:"#fff", fontSize:13, fontWeight:600, cursor:"pointer", color:"#374151" }}>Cancel</button>
          <button onClick={handleAssign} disabled={saving||!selectedId||success}
            style={{ padding:"9px 24px", border:"none", borderRadius:10, background:success?"#16A34A":selectedId?primaryColor:"#D1D5DB", fontSize:13, fontWeight:700, color:"#fff", cursor:(saving||!selectedId||success)?"not-allowed":"pointer", opacity:saving?0.75:1, display:"flex", alignItems:"center", gap:8 }}>
            {success ? "Assigned!" : saving ? "Assigning…" : <><Icon d={ICONS.layers} stroke="#fff" size={13}/>Assign Structure</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TEMPLATE EDITOR MODAL — with IMAGE UPLOAD for logo
// ══════════════════════════════════════════════════════════════════════════════
function TemplateEditorModal({ template, onSave, onClose, primaryColor }) {
  const [cn,  setCn]  = useState(template.companyName     || "");
  const [ca,  setCa]  = useState(template.companyAddress  || "");
  const [cp,  setCp]  = useState(template.companyPhone    || "");
  const [ce,  setCe]  = useState(template.companyEmail    || "");
  const [co,  setCo]  = useState(template.primaryColor    || primaryColor);
  const [te,  setTe]  = useState(template.terms           || "");
  const [lo,  setLo]  = useState(template.logo            || "");   // base64 or URL
  const [bN,  setBN]  = useState(template.bankName        || "");
  const [bA,  setBA]  = useState(template.bankAccount     || "");
  const [bI,  setBI]  = useState(template.bankIFSC        || "");
  const [pm,  setPm]  = useState(template.paymentMode     || "");
  const [pan, setPan] = useState(template.pan             || "");
  const [sN,  setSN]  = useState(template.signatoryName   || "Authorized Signatory");
  const [sT,  setST]  = useState(template.signatoryTitle  || "HR Manager");

  const [logoPreview, setLogoPreview] = useState(template.logo || "");
  const [logoUploading, setLogoUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Image upload → base64
  const handleLogoFile = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { alert("Please select an image file."); return; }
    if (file.size > 2 * 1024 * 1024) { alert("Image too large. Max 2 MB."); return; }
    setLogoUploading(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target.result;
      setLo(base64);
      setLogoPreview(base64);
      setLogoUploading(false);
    };
    reader.onerror = () => { alert("Failed to read file."); setLogoUploading(false); };
    reader.readAsDataURL(file);
  }, []);

  const COLS = ["#1E3A5F","#4F46E5","#0284C7","#059669","#DC2626","#7C3AED","#EA6B0E","#0F766E","#DB2777","#111827"];
  const fs = { width:"100%", padding:"9px 12px", border:"1.5px solid #E5E7EB", borderRadius:9, fontSize:12.5, outline:"none", boxSizing:"border-box", color:"#111827", fontFamily:"inherit", transition:"border-color 0.15s", background:"#fff" };
  const label = (t) => <label style={{ fontSize:11.5, fontWeight:600, color:"#374151", display:"block", marginBottom:5 }}>{t}</label>;
  const onfocus = (e) => { e.target.style.borderColor = co; };
  const onblur  = (e) => { e.target.style.borderColor = "#E5E7EB"; };

  const [activeSection, setActiveSection] = useState("company");
  const sections = ["company", "bank", "signature", "style"];

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(15,23,42,0.6)", backdropFilter:"blur(8px)", zIndex:900, display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      <div style={{ background:"#fff", borderRadius:20, width:"100%", maxWidth:620, maxHeight:"94vh", display:"flex", flexDirection:"column", overflow:"hidden", boxShadow:"0 30px 80px rgba(0,0,0,0.25)" }}>

        {/* Header */}
        <div style={{ padding:"20px 24px", borderBottom:"1px solid #F1F5F9", display:"flex", alignItems:"center", justifyContent:"space-between", background:`linear-gradient(135deg, ${co}08, #fff)` }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:38, height:38, borderRadius:11, background:`${co}15`, border:`1.5px solid ${co}30`, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Icon d={ICONS.edit} stroke={co} size={16} sw={2}/>
            </div>
            <div>
              <div style={{ fontSize:16, fontWeight:700, color:"#111827" }}>Customize Payslip Template</div>
              <div style={{ fontSize:12, color:"#9CA3AF", marginTop:2 }}>Corporate branding & e-signature settings</div>
            </div>
          </div>
          <button onClick={onClose} style={{ width:32, height:32, borderRadius:8, background:"#F8FAFC", border:"1px solid #E5E7EB", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}><Icon d={ICONS.close} stroke="#6B7280" size={14}/></button>
        </div>

        {/* Section Tabs */}
        <div style={{ display:"flex", gap:0, padding:"12px 24px 0", borderBottom:"1px solid #F1F5F9", background:"#FAFBFC" }}>
          {sections.map(s => (
            <button key={s} onClick={() => setActiveSection(s)}
              style={{ padding:"8px 18px", background:"none", border:"none", borderBottom:`2.5px solid ${activeSection===s?co:"transparent"}`, fontSize:12.5, fontWeight:activeSection===s?700:500, color:activeSection===s?co:"#9CA3AF", cursor:"pointer", fontFamily:"inherit", transition:"all 0.15s", textTransform:"capitalize" }}>
              {s === "signature" ? "E-Signature" : s.charAt(0).toUpperCase()+s.slice(1)}
            </button>
          ))}
        </div>

        <div style={{ flex:1, overflowY:"auto", padding:"22px 24px" }}>

          {/* ── COMPANY ── */}
          {activeSection === "company" && (
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              {/* Logo Upload */}
              <div>
                {label("Company Logo")}
                <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                  {/* Preview */}
                  <div style={{ width:80, height:60, borderRadius:10, border:`2px dashed ${logoPreview?"#E5E7EB":co}`, background:"#F9FAFB", display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden", flexShrink:0 }}>
                    {logoPreview ? (
                      <img src={logoPreview} alt="logo preview" style={{ width:"100%", height:"100%", objectFit:"contain", padding:4 }}/>
                    ) : (
                      <div style={{ textAlign:"center" }}>
                        <Icon d={ICONS.image} stroke="#9CA3AF" size={20}/>
                        <div style={{ fontSize:9, color:"#9CA3AF", marginTop:2 }}>No Logo</div>
                      </div>
                    )}
                  </div>
                  <div style={{ flex:1 }}>
                    {/* Upload button */}
                    <input ref={fileInputRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handleLogoFile}/>
                    <button onClick={() => fileInputRef.current?.click()} disabled={logoUploading}
                      style={{ display:"flex", alignItems:"center", gap:8, padding:"9px 16px", border:`1.5px solid ${co}`, borderRadius:9, background:`${co}08`, fontSize:12.5, fontWeight:600, color:co, cursor:"pointer", fontFamily:"inherit", marginBottom:8, opacity:logoUploading?0.6:1 }}>
                      <Icon d={ICONS.upload} stroke={co} size={13}/>
                      {logoUploading ? "Uploading…" : "Upload Image"}
                    </button>
                    <div style={{ fontSize:11, color:"#9CA3AF" }}>PNG, JPG, SVG — max 2 MB</div>
                    {/* URL fallback */}
                    {!logoPreview && (
                      <input value={typeof lo === "string" && !lo.startsWith("data:") ? lo : ""} onChange={e=>{ setLo(e.target.value); setLogoPreview(e.target.value); }} placeholder="or paste logo URL…"
                        style={{ ...fs, marginTop:8, fontSize:11.5 }} onFocus={onfocus} onBlur={onblur}/>
                    )}
                    {logoPreview && (
                      <button onClick={() => { setLo(""); setLogoPreview(""); }}
                        style={{ fontSize:11, color:"#DC2626", background:"none", border:"none", cursor:"pointer", padding:0, marginTop:4, display:"flex", alignItems:"center", gap:4 }}>
                        <Icon d={ICONS.close} stroke="#DC2626" size={10}/>Remove logo
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <div>{label("Company Name")}<input value={cn} onChange={e=>setCn(e.target.value)} placeholder="Your Company Pvt. Ltd." style={fs} onFocus={onfocus} onBlur={onblur}/></div>
                <div>{label("Phone")}<input value={cp} onChange={e=>setCp(e.target.value)} placeholder="+91 00000 00000" style={fs} onFocus={onfocus} onBlur={onblur}/></div>
              </div>
              <div>{label("Company Address")}<textarea value={ca} onChange={e=>setCa(e.target.value)} rows={2} placeholder="Full registered address" style={{...fs,resize:"vertical"}} onFocus={onfocus} onBlur={onblur}/></div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <div>{label("Email")}<input value={ce} onChange={e=>setCe(e.target.value)} placeholder="hr@company.com" style={fs} onFocus={onfocus} onBlur={onblur}/></div>
                <div>{label("PAN Number")}<input value={pan} onChange={e=>setPan(e.target.value)} placeholder="ABCDE1234F" style={fs} onFocus={onfocus} onBlur={onblur}/></div>
              </div>
              <div>{label("Footer Note / Terms")}<textarea value={te} onChange={e=>setTe(e.target.value)} rows={2} placeholder="This is a computer-generated payslip…" style={{...fs,resize:"vertical"}} onFocus={onfocus} onBlur={onblur}/></div>
            </div>
          )}

          {/* ── BANK ── */}
          {activeSection === "bank" && (
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              <div style={{ padding:"12px 16px", background:`${co}08`, border:`1px solid ${co}20`, borderRadius:10, fontSize:12, color:co, fontWeight:600 }}>
                💡 Bank details shown on payslip. Employee-specific data from profile overrides these.
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <div>{label("Bank Name")}<input    value={bN}  onChange={e=>setBN(e.target.value)}  placeholder="State Bank of India" style={fs} onFocus={onfocus} onBlur={onblur}/></div>
                <div>{label("Account Number")}<input value={bA} onChange={e=>setBA(e.target.value)} placeholder="00000000000" style={fs} onFocus={onfocus} onBlur={onblur}/></div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <div>{label("IFSC Code")}<input    value={bI}  onChange={e=>setBI(e.target.value)}  placeholder="SBIN0001234" style={fs} onFocus={onfocus} onBlur={onblur}/></div>
                <div>{label("Payment Mode")}<input value={pm}  onChange={e=>setPm(e.target.value)}  placeholder="NEFT / IMPS" style={fs} onFocus={onfocus} onBlur={onblur}/></div>
              </div>
            </div>
          )}

          {/* ── E-SIGNATURE ── */}
          {activeSection === "signature" && (
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              <div style={{ padding:"14px 16px", background:`${co}08`, border:`1px solid ${co}20`, borderRadius:10, fontSize:12.5, color:"#374151", lineHeight:1.7 }}>
                The e-signature appears in the <strong>bottom-right corner</strong> of the payslip with a corporate seal and cursive signature style. Customize the name and title below.
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <div>
                  {label("Signatory Name")}
                  <input value={sN} onChange={e=>setSN(e.target.value)} placeholder="Ramesh Kumar" style={fs} onFocus={onfocus} onBlur={onblur}/>
                </div>
                <div>
                  {label("Signatory Title")}
                  <input value={sT} onChange={e=>setST(e.target.value)} placeholder="HR Manager / Director" style={fs} onFocus={onfocus} onBlur={onblur}/>
                </div>
              </div>
              {/* Live Preview */}
              <div>
                {label("Preview")}
                <div style={{ padding:"20px 24px", background:"#F9FAFB", borderRadius:12, border:"1px solid #E5E7EB", width:"fit-content", minWidth:220 }}>
                  <div style={{ position:"relative", height:64, marginBottom:4, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <div style={{ position:"absolute", right:0, top:0, width:52, height:52, borderRadius:"50%", border:`2px solid ${co}33`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <div style={{ width:42, height:42, borderRadius:"50%", border:`1.5px dashed ${co}55`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                        <Icon d={ICONS.seal} stroke={co} size={16} sw={1.5}/>
                      </div>
                    </div>
                    <div style={{ textAlign:"left" }}>
                      <div style={{ fontSize:28, color:co, fontFamily:"'Dancing Script','Brush Script MT',cursive", letterSpacing:"1px", lineHeight:1, paddingLeft:8 }}>
                        {sN.split(" ").slice(0,2).join(" ") || "Signature"}
                      </div>
                    </div>
                  </div>
                  <div style={{ borderTop:`2px solid ${co}`, paddingTop:6 }}/>
                  <div style={{ fontSize:12, fontWeight:700, color:"#111827", textAlign:"center" }}>{sN||"Signatory Name"}</div>
                  <div style={{ fontSize:11, color:"#6B7280", marginTop:2, textAlign:"center" }}>{sT||"Title"}</div>
                  <div style={{ fontSize:10, color:co, marginTop:3, fontWeight:600, textAlign:"center" }}>Electronically Authorized</div>
                </div>
              </div>
            </div>
          )}

          {/* ── STYLE / COLOR ── */}
          {activeSection === "style" && (
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              {label("Brand / Primary Color")}
              <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                {COLS.map(c => (
                  <button key={c} onClick={() => setCo(c)} style={{ width:36, height:36, borderRadius:"50%", background:c, cursor:"pointer", border:`3px solid ${co===c?"#fff":"transparent"}`, outline:`2.5px solid ${co===c?c:"transparent"}`, transition:"all 0.15s", boxShadow:co===c?`0 0 0 3px ${c}44`:"none" }}/>
                ))}
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <input type="color" value={co} onChange={e=>setCo(e.target.value)} style={{ width:44, height:44, borderRadius:10, border:"1.5px solid #E5E7EB", padding:2, cursor:"pointer" }}/>
                <div>
                  <div style={{ fontSize:12.5, fontWeight:600, color:"#374151" }}>Custom color</div>
                  <div style={{ fontSize:11, color:"#9CA3AF" }}>Click the color swatch to pick any color</div>
                </div>
              </div>
              {/* Mini preview */}
              <div style={{ borderRadius:12, overflow:"hidden", border:"1px solid #E5E7EB" }}>
                <div style={{ background:co, padding:"14px 20px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ fontSize:14, fontWeight:800, color:"#fff" }}>Payslip Preview</span>
                  <span style={{ fontSize:11, fontWeight:600, color:"rgba(255,255,255,0.7)", background:"rgba(255,255,255,0.15)", padding:"3px 12px", borderRadius:20 }}>May 2026</span>
                </div>
                <div style={{ padding:"12px 20px", background:`${co}08`, display:"flex", justifyContent:"space-between" }}>
                  <div>
                    <div style={{ fontSize:9.5, fontWeight:700, color:co, textTransform:"uppercase", letterSpacing:"0.8px" }}>Employee Name</div>
                    <div style={{ fontSize:13, fontWeight:700 }}>Sample Employee</div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontSize:9.5, fontWeight:700, color:co, textTransform:"uppercase", letterSpacing:"0.8px" }}>Net Pay</div>
                    <div style={{ fontSize:18, fontWeight:900, color:co }}>₹42,500</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding:"14px 24px", borderTop:"1px solid #F1F5F9", display:"flex", gap:10, justifyContent:"flex-end", background:"#FAFBFC" }}>
          <button onClick={onClose} style={{ padding:"9px 20px", border:"1px solid #E5E7EB", borderRadius:10, background:"#fff", fontSize:13, fontWeight:600, cursor:"pointer", color:"#374151", fontFamily:"inherit" }}>Cancel</button>
          <button onClick={() => {
            onSave({
              ...template,
              logo: lo, companyName:cn, companyAddress:ca, companyPhone:cp, companyEmail:ce,
              primaryColor:co, terms:te, bankName:bN, bankAccount:bA, bankIFSC:bI, paymentMode:pm, pan,
              signatoryName:sN, signatoryTitle:sT,
            });
            onClose();
          }} style={{ padding:"9px 24px", border:"none", borderRadius:10, background:co, fontSize:13, fontWeight:700, color:"#fff", cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", gap:8 }}>
            <Icon d={ICONS.check} stroke="#fff" size={13} sw={2.5}/>Save Template
          </button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN — PayslipPage
// ══════════════════════════════════════════════════════════════════════════════
export default function PayslipPage({ ACCENT = "#1E3A5F" }) {
  const [employees,       setEmployees]       = useState([]);
  const [loadingEmp,      setLoadingEmp]      = useState(true);
  const [apiError,        setApiError]        = useState("");
  const [search,          setSearch]          = useState("");
  const [page,            setPage]            = useState(1);
  const [structureFilter, setStructureFilter] = useState("overall");
  const [deptFilter,      setDeptFilter]      = useState("all");
  const rowsPerPage = 10;

  const [template, setTemplate] = useState(() => {
    try { const s = localStorage.getItem("pk_ps_tpl_v7"); if (s) return JSON.parse(s); } catch {}
    return {
      logo: null,
      companyName:     "PencilKraft Technologies",
      companyAddress:  "Chennai, Tamil Nadu 600001",
      companyPhone:    "",
      companyEmail:    "",
      primaryColor:    ACCENT,
      terms:           "This is a computer-generated payslip and does not require a physical signature.",
      bankName:        "",
      bankAccount:     "",
      bankIFSC:        "",
      paymentMode:     "",
      pan:             "",
      signatoryName:   "Authorized Signatory",
      signatoryTitle:  "HR Manager",
    };
  });

  const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  const [showAssignModal,    setShowAssignModal]    = useState(false);
  const [selectedEmployee,   setSelectedEmployee]   = useState(null);
  const [viewingEmp,         setViewingEmp]         = useState(null);

  const pc = template.primaryColor || ACCENT;

  const fetchEmps = async () => {
    setLoadingEmp(true); setApiError("");
    let list = [];
    let errorMsg = "";
    for (const url of [`${BASE}/employees`, `${BASE}/admin/employees`]) {
      try {
        const r = await fetch(url, { headers: authHeaders() });
        if (r.ok) {
          const d = await r.json();
          const raw = Array.isArray(d) ? d : (d.employees||d.data||d.results||d.users||d.staff||d.members||[]);
          if (raw.length > 0) { list = raw.map(normaliseEmployee); break; }
        } else { errorMsg = `${url} → HTTP ${r.status}`; }
      } catch (e) { errorMsg = e.message; }
    }
    if (list.length > 0) { setEmployees(list); }
    else { setApiError(`Could not load employees (${errorMsg}). Showing demo data.`); setEmployees(DEMO_EMPLOYEES); }
    setLoadingEmp(false);
  };

  useEffect(() => { fetchEmps(); }, []);

  const handleSaveTemplate = (t) => {
    setTemplate(t);
    try { localStorage.setItem("pk_ps_tpl_v7", JSON.stringify(t)); } catch {}
  };

  const hasStr = (e) => !!e.salary_structure_id;
  const departments = useMemo(() => [...new Set(employees.map(e=>e.department).filter(d=>d&&d!=="—"))].sort(), [employees]);
  const addedCnt    = employees.filter(hasStr).length;
  const notAddedCnt = employees.length - addedCnt;
  const totalPay    = employees.reduce((s,e)=>s+(e.salary||0),0);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return employees.filter(e => {
      const mQ = (e.name||"").toLowerCase().includes(q)||(e.id||"").toLowerCase().includes(q)||(e.email||"").toLowerCase().includes(q)||(e.designation||"").toLowerCase().includes(q);
      const mF = structureFilter==="overall"?true:structureFilter==="added"?hasStr(e):!hasStr(e);
      const mD = deptFilter==="all"?true:e.department===deptFilter;
      return mQ&&mF&&mD;
    });
  }, [employees,search,structureFilter,deptFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length/rowsPerPage));
  const paginated  = filtered.slice((page-1)*rowsPerPage, page*rowsPerPage);
  useEffect(() => setPage(1), [search,structureFilter,deptFilter]);

  const STYLES = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800;900&family=Dancing+Script:wght@700&display=swap');
    @keyframes pk-shimmer{0%{background-position:-600px 0}100%{background-position:600px 0}}
    .pk-sk{background:linear-gradient(90deg,#F0F4F8 25%,#E8EDF3 50%,#F0F4F8 75%);background-size:600px 100%;animation:pk-shimmer 1.5s infinite}
    @keyframes pk-fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
    .pk-card{animation:pk-fadeIn 0.3s ease both}
    .pk-row{transition:background 0.1s}.pk-row:hover{background:#F8FAFF!important}
    .pk-btn{transition:all 0.15s ease;cursor:pointer}.pk-btn:hover{transform:translateY(-1px);box-shadow:0 4px 12px rgba(0,0,0,0.12)!important}
    .pk-tab{transition:all 0.18s;cursor:pointer;border:none;font-family:inherit}
    .pk-ba{transition:all 0.15s;cursor:pointer}.pk-ba:hover{transform:translateY(-1px)}
    *{box-sizing:border-box}
    @media print{.no-print{display:none!important}}
    select:focus{outline:none}
  `;

  if (viewingEmp) {
    return (
      <div style={{ fontFamily:"'DM Sans','Nunito',system-ui,sans-serif", minHeight:"100vh", background:"#F7F8FA" }}>
        <style>{STYLES}</style>
        <div className="no-print" style={{ background:"#fff", borderBottom:"1px solid #EAECF0", padding:"0 32px", position:"sticky", top:0, zIndex:50 }}>
          <div style={{ display:"flex", alignItems:"center", height:64, gap:10 }}>
            <div style={{ width:34, height:34, borderRadius:10, background:`linear-gradient(135deg,${pc},${pc}bb)`, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Icon d={ICONS.fileText} stroke="#fff" size={16} sw={2}/>
            </div>
            <div>
              <div style={{ fontSize:15, fontWeight:700, color:"#111827" }}>Payroll & Payslips</div>
              <div style={{ fontSize:11, color:"#9CA3AF" }}>Employee Payslip Detail</div>
            </div>
          </div>
        </div>
        <PayslipDetailView
          employeeDbId={viewingEmp.db_id}
          empData={viewingEmp}
          primaryColor={pc}
          template={template}
          onBack={() => setViewingEmp(null)}
          onEditTemplate={() => setShowTemplateEditor(true)}
        />
        {showTemplateEditor && (
          <TemplateEditorModal template={template} onSave={handleSaveTemplate} onClose={() => setShowTemplateEditor(false)} primaryColor={pc}/>
        )}
      </div>
    );
  }

  return (
    <div style={{ fontFamily:"'DM Sans','Nunito',system-ui,sans-serif", minHeight:"100vh", background:"#F7F8FA" }}>
      <style>{STYLES}</style>

      {/* Header */}
      <div style={{ background:"#fff", borderBottom:"1px solid #EAECF0", padding:"0 32px" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", height:64 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:34, height:34, borderRadius:10, background:`linear-gradient(135deg,${pc},${pc}bb)`, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Icon d={ICONS.fileText} stroke="#fff" size={16} sw={2}/>
            </div>
            <div>
              <div style={{ fontSize:15, fontWeight:700, color:"#111827", letterSpacing:"-0.2px" }}>Payroll & Payslips</div>
              <div style={{ fontSize:11, color:"#9CA3AF" }}>Manage salary structures & employee payslips</div>
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <button onClick={fetchEmps} className="pk-btn" style={{ width:36, height:36, border:"1px solid #E5E7EB", borderRadius:9, background:"#fff", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Icon d={ICONS.refresh} stroke="#6B7280" size={14}/>
            </button>
            <button onClick={() => setShowTemplateEditor(true)} className="pk-btn"
              style={{ display:"flex", alignItems:"center", gap:7, padding:"8px 16px", background:pc, border:"none", borderRadius:9, fontSize:13, fontWeight:600, color:"#fff", boxShadow:`0 2px 8px ${pc}40` }}>
              <Icon d={ICONS.edit} stroke="#fff" size={13}/> Edit Template
            </button>
          </div>
        </div>
      </div>

      <div style={{ padding:"28px 32px" }}>
        {apiError && (
          <div style={{ background:"#FFFBEB", border:"1px solid #FDE68A", borderRadius:10, padding:"10px 16px", marginBottom:20, fontSize:12.5, color:"#92400E", display:"flex", alignItems:"center", gap:8 }}>
            <Icon d={ICONS.alert} stroke="#D97706" size={14}/> {apiError}
          </div>
        )}

        {/* Stat Cards */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:24 }}>
          {[
            { label:"Total Employees",    value:loadingEmp?null:employees.length,                     icon:ICONS.users,    ib:`${pc}12`, ic:pc,        trend:`${departments.length} departments`, tu:true  },
            { label:"Structure Assigned", value:loadingEmp?null:addedCnt,                             icon:ICONS.check,    ib:"#ECFDF5", ic:"#059669", trend:`${employees.length?Math.round(addedCnt/employees.length*100):0}% of team`, tu:true },
            { label:"Pending Assignment", value:loadingEmp?null:notAddedCnt,                          icon:ICONS.alert,    ib:"#FEF2F2", ic:"#DC2626", trend:notAddedCnt>0?"Action required":"All set!", tu:false },
            { label:"Monthly Payout",     value:loadingEmp?null:`₹${(totalPay/100000).toFixed(2)}L`,  icon:ICONS.currency, ib:"#EFF6FF", ic:"#2563EB", trend:"Estimated gross", tu:true },
          ].map(({ label, value, icon, ib, ic, trend, tu }, idx) => (
            <div key={label} className="pk-card" style={{ background:"#fff", borderRadius:14, padding:"20px 22px", border:"1px solid #EAECF0", boxShadow:"0 1px 4px rgba(0,0,0,0.04)", animationDelay:`${idx*60}ms` }}>
              <div style={{ width:38, height:38, borderRadius:10, background:ib, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:14 }}><Icon d={icon} stroke={ic} size={16} sw={2}/></div>
              {loadingEmp ? <div className="pk-sk" style={{ height:28, width:60, borderRadius:6, marginBottom:8 }}/> : <div style={{ fontSize:26, fontWeight:800, color:"#111827", letterSpacing:"-1px", lineHeight:1 }}>{value}</div>}
              <div style={{ fontSize:12, color:"#6B7280", marginTop:6, fontWeight:500 }}>{label}</div>
              <div style={{ fontSize:11, color:tu?"#059669":"#DC2626", marginTop:6, fontWeight:600 }}>{trend}</div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="pk-card" style={{ background:"#fff", borderRadius:16, border:"1px solid #EAECF0", overflow:"hidden", boxShadow:"0 1px 6px rgba(0,0,0,0.05)", animationDelay:"120ms" }}>
          <div style={{ padding:"18px 24px", borderBottom:"1px solid #F3F4F6" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, flexWrap:"wrap" }}>
              <div style={{ display:"flex", gap:4, background:"#F7F8FA", padding:4, borderRadius:10 }}>
                {[{ key:"overall", label:"All", count:employees.length },{ key:"added", label:"Assigned", count:addedCnt },{ key:"not_added", label:"Unassigned", count:notAddedCnt }].map(tab => {
                  const ia = structureFilter===tab.key;
                  return (
                    <button key={tab.key} className="pk-tab" onClick={() => setStructureFilter(tab.key)}
                      style={{ padding:"7px 14px", borderRadius:8, fontSize:12.5, fontWeight:600, background:ia?"#fff":"transparent", color:ia?"#111827":"#6B7280", boxShadow:ia?"0 1px 3px rgba(0,0,0,0.1)":"none", border:ia?"1px solid #E5E7EB":"1px solid transparent", display:"flex", alignItems:"center", gap:6 }}>
                      {tab.label}
                      <span style={{ padding:"1px 7px", borderRadius:99, fontSize:10.5, fontWeight:700, background:ia?`${pc}15`:"#E5E7EB", color:ia?pc:"#9CA3AF" }}>
                        {loadingEmp?"…":tab.count}
                      </span>
                    </button>
                  );
                })}
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                {departments.length>1 && (
                  <select value={deptFilter} onChange={e=>setDeptFilter(e.target.value)}
                    style={{ padding:"8px 12px", border:"1px solid #E5E7EB", borderRadius:9, fontSize:12.5, color:"#374151", background:"#F7F8FA", cursor:"pointer", fontFamily:"inherit" }}>
                    <option value="all">All Departments</option>
                    {departments.map(d=><option key={d} value={d}>{d}</option>)}
                  </select>
                )}
                <div style={{ display:"flex", alignItems:"center", gap:8, background:"#F7F8FA", border:"1px solid #E5E7EB", borderRadius:9, padding:"8px 14px" }}>
                  <Icon d={ICONS.search} stroke="#9CA3AF" size={13}/>
                  <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name, ID, email…"
                    style={{ border:"none", background:"transparent", fontSize:12.5, outline:"none", width:200, fontFamily:"inherit", color:"#111827" }}/>
                  {search && <button onClick={()=>setSearch("")} style={{ background:"none", border:"none", cursor:"pointer", padding:0, display:"flex" }}><Icon d={ICONS.close} stroke="#9CA3AF" size={12}/></button>}
                </div>
              </div>
            </div>
          </div>

          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
              <thead>
                <tr style={{ background:"#FAFBFC" }}>
                  {["Employee","Employee ID","Department","Designation","Phone","Salary","Structure","Actions"].map(h => (
                    <th key={h} style={{ padding:"11px 20px", textAlign:"left", fontSize:11, fontWeight:700, color:"#6B7280", textTransform:"uppercase", letterSpacing:"0.5px", borderBottom:"1px solid #F0F2F5", whiteSpace:"nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loadingEmp
                  ? Array.from({length:6}).map((_,i)=><SkeletonRow key={i}/>)
                  : paginated.length===0
                    ? <tr><td colSpan={8} style={{ padding:"60px 0", textAlign:"center", color:"#9CA3AF", fontSize:14 }}>
                        <div style={{ fontSize:36, marginBottom:12 }}>🔍</div>
                        <div style={{ fontWeight:700, color:"#374151" }}>{search?`No results for "${search}"`:"No employees found"}</div>
                      </td></tr>
                    : paginated.map(emp => {
                        const hs = hasStr(emp);
                        return (
                          <tr key={emp.db_id||emp.id} className="pk-row" style={{ borderBottom:"1px solid #F3F4F6", background:"#fff" }}>
                            <td style={{ padding:"13px 20px" }}>
                              <div style={{ display:"flex", alignItems:"center", gap:11 }}>
                                <Avatar name={emp.name} size={36}/>
                                <div>
                                  <div style={{ fontSize:13.5, fontWeight:700, color:"#111827" }}>{emp.name}</div>
                                  <div style={{ fontSize:11, color:"#9CA3AF", marginTop:1 }}>{emp.email!=="—"?emp.email:""}</div>
                                </div>
                              </div>
                            </td>
                            <td style={{ padding:"13px 20px" }}><span style={{ fontSize:12, fontWeight:600, color:"#374151", background:"#F7F8FA", border:"1px solid #E5E7EB", padding:"3px 9px", borderRadius:6 }}>{emp.id||"—"}</span></td>
                            <td style={{ padding:"13px 20px", color:"#374151", fontSize:13 }}>{emp.department}</td>
                            <td style={{ padding:"13px 20px", color:"#374151", fontSize:13 }}>{emp.designation}</td>
                            <td style={{ padding:"13px 20px" }}><span style={{ fontSize:12.5, color:"#374151" }}>{emp.phone!=="—"?emp.phone:"—"}</span></td>
                            <td style={{ padding:"13px 20px" }}><span style={{ fontSize:13.5, fontWeight:700, color:"#111827" }}>{emp.salary?`₹${emp.salary.toLocaleString("en-IN")}`:"—"}</span></td>
                            <td style={{ padding:"13px 20px" }}>
                              <div className="pk-ba" onClick={()=>{ setSelectedEmployee(emp); setShowAssignModal(true); }}>
                                {hs
                                  ? <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"4px 11px", borderRadius:8, background:"#ECFDF5", border:"1px solid #A7F3D0", fontSize:11.5, fontWeight:700, color:"#059669" }}><span style={{ width:5, height:5, borderRadius:"50%", background:"#10B981" }}/>Assigned</span>
                                  : <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"4px 11px", borderRadius:8, background:"#FEF2F2", border:"1px solid #FECACA", fontSize:11.5, fontWeight:700, color:"#DC2626" }}><span style={{ width:5, height:5, borderRadius:"50%", background:"#F87171" }}/>Not Assigned</span>}
                              </div>
                            </td>
                            <td style={{ padding:"13px 20px" }}>
                              <div style={{ display:"flex", gap:6 }}>
                                <button className="pk-btn" onClick={()=>setViewingEmp(emp)}
                                  style={{ display:"flex", alignItems:"center", gap:5, padding:"6px 12px", background:"#F7F8FA", border:"1px solid #E5E7EB", borderRadius:8, fontSize:12, fontWeight:600, color:"#374151", cursor:"pointer", fontFamily:"inherit" }}>
                                  <Icon d={ICONS.eye} stroke="#374151" size={12}/> View
                                </button>
                                <button className="pk-btn" onClick={()=>{ setSelectedEmployee(emp); setShowAssignModal(true); }}
                                  style={{ display:"flex", alignItems:"center", gap:5, padding:"6px 12px", background:hs?"#EFF6FF":pc, border:hs?"1px solid #BFDBFE":"none", borderRadius:8, fontSize:12, fontWeight:700, color:hs?"#2563EB":"#fff", cursor:"pointer", fontFamily:"inherit" }}>
                                  <Icon d={ICONS.layers} stroke={hs?"#2563EB":"#fff"} size={12}/>
                                  {hs?"Reassign":"Assign"}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
              </tbody>
            </table>
          </div>

          <div style={{ padding:"14px 24px", borderTop:"1px solid #F3F4F6", display:"flex", alignItems:"center", justifyContent:"space-between", background:"#FAFBFC" }}>
            <span style={{ fontSize:12, color:"#9CA3AF" }}>{loadingEmp?"Loading…":`${Math.min((page-1)*rowsPerPage+1,filtered.length)}–${Math.min(page*rowsPerPage,filtered.length)} of ${filtered.length} employees`}</span>
            <div style={{ display:"flex", gap:4 }}>
              <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1||loadingEmp}
                style={{ width:30, height:30, background:"#fff", border:"1px solid #E5E7EB", borderRadius:7, cursor:page===1?"not-allowed":"pointer", opacity:page===1?0.4:1, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <Icon d={ICONS.chevLeft} size={13} stroke="#6B7280"/>
              </button>
              {Array.from({length:Math.min(totalPages,5)},(_,i)=>{
                const n=Math.max(1,Math.min(totalPages-4,page-2))+i;
                return n<=totalPages?(
                  <button key={n} onClick={()=>setPage(n)}
                    style={{ width:30, height:30, background:n===page?pc:"#fff", border:`1px solid ${n===page?pc:"#E5E7EB"}`, borderRadius:7, fontSize:12, fontWeight:n===page?700:500, color:n===page?"#fff":"#374151", cursor:"pointer" }}>
                    {n}
                  </button>
                ):null;
              })}
              <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages||loadingEmp}
                style={{ width:30, height:30, background:"#fff", border:"1px solid #E5E7EB", borderRadius:7, cursor:page===totalPages?"not-allowed":"pointer", opacity:page===totalPages?0.4:1, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <Icon d={ICONS.chevRight} size={13} stroke="#6B7280"/>
              </button>
            </div>
          </div>
        </div>
      </div>

      {showTemplateEditor && (
        <TemplateEditorModal template={template} onSave={handleSaveTemplate} onClose={()=>setShowTemplateEditor(false)} primaryColor={pc}/>
      )}
      {showAssignModal && selectedEmployee && (
        <AssignSalaryStructureModal employee={selectedEmployee} primaryColor={pc}
          onClose={()=>{ setShowAssignModal(false); setSelectedEmployee(null); }}
          onSave={async()=>{ setShowAssignModal(false); setSelectedEmployee(null); await fetchEmps(); }}/>
      )}
    </div>
  );
}