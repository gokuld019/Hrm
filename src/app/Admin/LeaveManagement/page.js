"use client";
import { useState, useEffect, useCallback } from "react";
import {
  X, Plus, Trash2, ChevronDown, AlertTriangle, Loader2,
  CheckCircle2, Users, Calendar, Search, Check, FileText,
  UserCheck, RefreshCw, Shield, Edit2, Eye, XCircle, Info,
  ChevronLeft, ChevronRight, Clock, ThumbsUp, ThumbsDown, Bell,
} from "lucide-react";

const BASE = process.env.NEXT_PUBLIC_API_URL;
const MONTH_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const LEAVE_TYPE_PRESETS = [
  { name:"Annual Leave",      icon:"📅", color:"#f97316", bg:"#fff7ed" },
  { name:"Sick Leave",        icon:"🤒", color:"#ef4444", bg:"#fef2f2" },
  { name:"Casual Leave",      icon:"💼", color:"#3b82f6", bg:"#eff6ff" },
  { name:"Maternity Leave",   icon:"🏖", color:"#ec4899", bg:"#fdf2f8" },
  { name:"Paternity Leave",   icon:"👶", color:"#8b5cf6", bg:"#f5f3ff" },
  { name:"Marriage Leave",    icon:"💍", color:"#14b8a6", bg:"#f0fdfa" },
  { name:"Bereavement Leave", icon:"😢", color:"#64748b", bg:"#f8fafc" },
  { name:"Public Holiday",    icon:"🏛",  color:"#22c55e", bg:"#f0fdf4" },
];
const AVATAR_COLORS = ["#6366f1","#f97316","#14b8a6","#ec4899","#22c55e","#a855f7","#3b82f6","#eab308"];
const CARDS_PER_PAGE = 4;

// ── Dummy leave approval data ─────────────────────────────────────────
const DUMMY_APPROVALS = [
  { id:1,  employee:{ id:1,  firstname:"Arjun",   lastname:"Sharma",   employee_id:"EMP001", designation:"Software Engineer"  }, leave_type:"Annual Leave",      days:5,  from_date:"2026-05-01", to_date:"2026-05-05", reason:"Family vacation",       status:"pending",  applied_on:"2026-04-20" },
  { id:2,  employee:{ id:2,  firstname:"Priya",   lastname:"Nair",     employee_id:"EMP002", designation:"UI/UX Designer"     }, leave_type:"Sick Leave",         days:2,  from_date:"2026-04-28", to_date:"2026-04-29", reason:"Fever and cold",        status:"pending",  applied_on:"2026-04-25" },
  { id:3,  employee:{ id:3,  firstname:"Rahul",   lastname:"Mehta",    employee_id:"EMP003", designation:"Product Manager"    }, leave_type:"Casual Leave",       days:1,  from_date:"2026-04-30", to_date:"2026-04-30", reason:"Personal work",         status:"approved", applied_on:"2026-04-22" },
  { id:4,  employee:{ id:4,  firstname:"Sneha",   lastname:"Iyer",     employee_id:"EMP004", designation:"QA Engineer"        }, leave_type:"Maternity Leave",    days:90, from_date:"2026-06-01", to_date:"2026-08-29", reason:"Maternity",             status:"approved", applied_on:"2026-04-18" },
  { id:5,  employee:{ id:5,  firstname:"Vikram",  lastname:"Pillai",   employee_id:"EMP005", designation:"DevOps Engineer"    }, leave_type:"Annual Leave",      days:3,  from_date:"2026-05-10", to_date:"2026-05-12", reason:"Travel plans",          status:"rejected", applied_on:"2026-04-21" },
  { id:6,  employee:{ id:6,  firstname:"Kavya",   lastname:"Reddy",    employee_id:"EMP006", designation:"Data Analyst"       }, leave_type:"Sick Leave",         days:1,  from_date:"2026-04-26", to_date:"2026-04-26", reason:"Doctor appointment",    status:"pending",  applied_on:"2026-04-25" },
  { id:7,  employee:{ id:7,  firstname:"Arun",    lastname:"Kumar",    employee_id:"EMP007", designation:"Backend Developer"  }, leave_type:"Casual Leave",       days:2,  from_date:"2026-05-05", to_date:"2026-05-06", reason:"Home shifting",         status:"pending",  applied_on:"2026-04-23" },
  { id:8,  employee:{ id:8,  firstname:"Divya",   lastname:"Menon",    employee_id:"EMP008", designation:"HR Executive"       }, leave_type:"Marriage Leave",     days:7,  from_date:"2026-05-20", to_date:"2026-05-26", reason:"Own marriage",          status:"approved", applied_on:"2026-04-15" },
  { id:9,  employee:{ id:9,  firstname:"Suresh",  lastname:"Babu",     employee_id:"EMP009", designation:"Frontend Developer" }, leave_type:"Annual Leave",      days:4,  from_date:"2026-05-08", to_date:"2026-05-11", reason:"Summer break",          status:"pending",  applied_on:"2026-04-24" },
  { id:10, employee:{ id:10, firstname:"Ananya",  lastname:"Krishnan", employee_id:"EMP010", designation:"Content Writer"     }, leave_type:"Bereavement Leave",  days:3,  from_date:"2026-04-27", to_date:"2026-04-29", reason:"Family bereavement",    status:"pending",  applied_on:"2026-04-25" },
  { id:11, employee:{ id:11, firstname:"Mohan",   lastname:"Das",      employee_id:"EMP011", designation:"Sales Executive"    }, leave_type:"Sick Leave",         days:2,  from_date:"2026-05-02", to_date:"2026-05-03", reason:"Medical rest",          status:"rejected", applied_on:"2026-04-20" },
  { id:12, employee:{ id:12, firstname:"Lakshmi", lastname:"Patel",    employee_id:"EMP012", designation:"Finance Analyst"    }, leave_type:"Casual Leave",       days:1,  from_date:"2026-05-15", to_date:"2026-05-15", reason:"Personal errand",       status:"pending",  applied_on:"2026-04-24" },
];

// ── Helpers ───────────────────────────────────────────────────────────
const getAuthHeaders = () => {
  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
  return { "Content-Type":"application/json", Accept:"application/json", "ngrok-skip-browser-warning":"true", ...(token ? { Authorization:`Bearer ${token}` } : {}) };
};
const getInitials = (emp) => { const f=emp.firstname||""; const l=emp.lastname||""; return f&&l?`${f[0]}${l[0]}`.toUpperCase():f?f.slice(0,2).toUpperCase():"??"; };
const getFullName = (emp) => [emp.firstname,emp.lastname].filter(Boolean).join(" ")||"Unknown";
const getRole     = (emp) => emp.designation?.name||emp.designation||emp.role||"Employee";

const inputBase  = "w-full text-sm border rounded-lg px-3 py-2 outline-none focus:ring-2 transition text-gray-800 bg-white placeholder:text-gray-400";
const neutral    = "border-gray-200 focus:border-orange-400 focus:ring-orange-100";
const selectBase = "w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 appearance-none bg-white transition text-gray-700 disabled:opacity-60";

// ════════════════════════════════════════════════════════════════════
// ── SHARED: Pagination
// ════════════════════════════════════════════════════════════════════
function Pagination({ total, page, perPage, onChange }) {
  const totalPages = Math.ceil(total / perPage);
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  return (
    <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100">
      <p className="text-[11px] text-gray-400 font-medium">
        Showing{" "}
        <span className="text-gray-700 font-bold">{Math.min((page-1)*perPage+1,total)}–{Math.min(page*perPage,total)}</span>
        {" "}of <span className="text-gray-700 font-bold">{total}</span>
      </p>
      <div className="flex items-center gap-1">
        <button onClick={()=>onChange(page-1)} disabled={page===1}
          className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-orange-50 hover:border-orange-300 hover:text-orange-500 disabled:opacity-30 disabled:cursor-not-allowed transition">
          <ChevronLeft size={13}/>
        </button>
        {pages.map(p=>(
          <button key={p} onClick={()=>onChange(p)}
            className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold transition ${p===page?"bg-orange-500 text-white border border-orange-500 shadow-sm":"border border-gray-200 text-gray-500 hover:bg-orange-50 hover:border-orange-300 hover:text-orange-500"}`}>
            {p}
          </button>
        ))}
        <button onClick={()=>onChange(page+1)} disabled={page===totalPages}
          className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-orange-50 hover:border-orange-300 hover:text-orange-500 disabled:opacity-30 disabled:cursor-not-allowed transition">
          <ChevronRight size={13}/>
        </button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// ── SHARED: NotificationModal
// ════════════════════════════════════════════════════════════════════
function NotificationModal({ type, title, message, onClose }) {
  const config = {
    success: { bg:"bg-green-50",  border:"border-green-200",  icon:<CheckCircle2 size={26} className="text-green-500"/>,  titleColor:"text-green-800",  msgColor:"text-green-600",  btnBg:"bg-green-500 hover:bg-green-600" },
    error:   { bg:"bg-red-50",    border:"border-red-200",    icon:<XCircle      size={26} className="text-red-500"/>,    titleColor:"text-red-800",    msgColor:"text-red-600",    btnBg:"bg-red-500 hover:bg-red-600" },
    warning: { bg:"bg-amber-50",  border:"border-amber-200",  icon:<AlertTriangle size={26} className="text-amber-500"/>, titleColor:"text-amber-800",  msgColor:"text-amber-600",  btnBg:"bg-amber-500 hover:bg-amber-600" },
    info:    { bg:"bg-blue-50",   border:"border-blue-200",   icon:<Info          size={26} className="text-blue-500"/>,  titleColor:"text-blue-800",   msgColor:"text-blue-600",   btnBg:"bg-blue-500 hover:bg-blue-600" },
  };
  const c = config[type] || config.info;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}/>
      <div className={`relative w-full max-w-xs mx-4 rounded-2xl border-2 ${c.bg} ${c.border} p-8 shadow-2xl z-10 flex flex-col items-center text-center`}>
        <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-md mb-4">{c.icon}</div>
        <h3 className={`text-base font-black mb-1 ${c.titleColor}`}>{title}</h3>
        <p className={`text-sm ${c.msgColor} mb-6 leading-relaxed`}>{message}</p>
        <button onClick={onClose} className={`px-8 py-2.5 text-sm font-bold text-white rounded-xl transition ${c.btnBg}`}>OK</button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// ── SHARED: ConfirmModal
// ════════════════════════════════════════════════════════════════════
function ConfirmModal({ title, message, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel}/>
      <div className="relative w-full max-w-sm mx-4 rounded-2xl bg-white border border-gray-200 p-6 shadow-2xl z-10">
        <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4"><Trash2 size={20} className="text-red-500"/></div>
        <h3 className="text-base font-black text-gray-900 text-center mb-1">{title}</h3>
        <p className="text-sm text-gray-500 text-center mb-5 leading-relaxed">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 px-4 py-2.5 text-sm font-bold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition">Cancel</button>
          <button onClick={onConfirm} disabled={loading} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-black text-white bg-red-500 hover:bg-red-600 rounded-xl transition disabled:opacity-60">
            {loading ? <><Loader2 size={13} className="animate-spin"/>Deleting…</> : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// ── SHARED: ModalShell
// ════════════════════════════════════════════════════════════════════
function ModalShell({ title, onClose, children, footer, tabs, activeTab, onTabChange }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}/>
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 z-10 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h2 className="text-base font-black text-gray-900">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition"><X size={15}/></button>
        </div>
        {tabs && (
          <div className="flex items-center px-6 pt-3 shrink-0 border-b border-gray-100">
            {tabs.map(tab=>(
              <button key={tab.id} onClick={()=>onTabChange(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold border-b-2 transition-all -mb-px ${activeTab===tab.id?"border-orange-500 text-orange-500":"border-transparent text-gray-400 hover:text-gray-600"}`}>
                <tab.icon size={12}/>{tab.label}
              </button>
            ))}
          </div>
        )}
        <div className="overflow-y-auto px-6 py-5 space-y-5 flex-1">{children}</div>
        {footer && <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/60 rounded-b-2xl shrink-0">{footer}</div>}
      </div>
    </div>
  );
}

// ── useDeptDesig hook ─────────────────────────────────────────────────
function useDeptDesig() {
  const [departments, setDepts]    = useState([]);
  const [designations,setDesigs]   = useState([]);
  const [loadingDept, setLoadDept] = useState(true);
  const [loadingDesig,setLoadDesig]= useState(true);
  const [deptError,   setDeptErr]  = useState(null);
  useEffect(()=>{
    fetch(`${BASE}/api/admin/departments`,{headers:getAuthHeaders()}).then(r=>{if(!r.ok) throw new Error();return r.json();}).then(d=>setDepts(d?.data||[])).catch(e=>setDeptErr(e.message)).finally(()=>setLoadDept(false));
    fetch(`${BASE}/api/admin/designations`,{headers:getAuthHeaders()}).then(r=>{if(!r.ok) throw new Error();return r.json();}).then(d=>setDesigs(d?.data||[])).catch(()=>{}).finally(()=>setLoadDesig(false));
  },[]);
  return { departments, designations, loadingDept, loadingDesig, deptError };
}

// ── LeaveTypeRow ──────────────────────────────────────────────────────
function LeaveTypeRow({ row, index, onChange, onRemove }) {
  const preset = LEAVE_TYPE_PRESETS.find(p=>p.name===row.name)||LEAVE_TYPE_PRESETS[0];
  return (
    <div className="grid grid-cols-[1fr_90px_90px_90px_32px] gap-2 items-center p-3 rounded-xl border border-gray-100 bg-gray-50/50 hover:border-orange-200 transition-all">
      <div className="flex items-center gap-2">
        <span className="text-sm">{preset.icon}</span>
        <input value={row.name} onChange={e=>onChange(index,"name",e.target.value)} placeholder="Leave type" className={`${inputBase} ${neutral} text-xs py-1.5`}/>
      </div>
      <input type="number" min="0" max="365" value={row.days_per_year} onChange={e=>onChange(index,"days_per_year",e.target.value)} className={`${inputBase} ${neutral} text-xs py-1.5 text-center`}/>
      <input type="number" min="0" max="365" value={row.carry_forward} onChange={e=>onChange(index,"carry_forward",e.target.value)} className={`${inputBase} ${neutral} text-xs py-1.5 text-center`}/>
      <div className="relative">
        <select value={row.encashable} onChange={e=>onChange(index,"encashable",e.target.value)} className={`${selectBase} text-xs py-1.5`}>
          <option value="no">No</option><option value="yes">Yes</option>
        </select>
        <ChevronDown size={11} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"/>
      </div>
      <button onClick={()=>onRemove(index)} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition"><Trash2 size={12}/></button>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// ── CREATE / EDIT POLICY MODAL
// ════════════════════════════════════════════════════════════════════
function CreateLeavePolicyModal({ onClose, onSuccess, editPolicy }) {
  const isEdit = !!editPolicy;
  const currentYear = new Date().getFullYear();
  const [form, setForm] = useState({
    policy_name:editPolicy?.policy_name||"", year:String(editPolicy?.year||currentYear),
    month_type:editPolicy?.month_type||"all", months:editPolicy?.months||[],
    scope:editPolicy?.scope||"all", department_id:String(editPolicy?.department_id||""),
    designation_ids:editPolicy?.designation_ids||[],
  });
  const [leaveTypes, setLeaveTypes] = useState(
    editPolicy?.leave_types?.map(lt=>({name:lt.name,days_per_year:lt.days_per_year,carry_forward:lt.carry_forward||0,encashable:lt.encashable?"yes":"no"}))
    ||[{name:"Annual Leave",days_per_year:21,carry_forward:5,encashable:"yes"},{name:"Sick Leave",days_per_year:10,carry_forward:0,encashable:"no"},{name:"Casual Leave",days_per_year:7,carry_forward:0,encashable:"no"}]
  );
  const [saving, setSaving]       = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const { departments, designations, loadingDept, loadingDesig, deptError } = useDeptDesig();
  const filteredDesig = designations.filter(d=>d.department_id===Number(form.department_id));
  const set = (k,v)=>setForm(p=>({...p,[k]:v}));
  const toggleMonth=(m)=>{if(form.month_type!=="specific") return;setForm(p=>{const a=p.months.includes(m);return{...p,months:a?p.months.filter(x=>x!==m):[...p.months,m].sort((a,b)=>a-b)};});};
  const toggleDesig=(id)=>{setForm(p=>{const a=p.designation_ids.includes(id);return{...p,designation_ids:a?p.designation_ids.filter(x=>x!==id):[...p.designation_ids,id]};});};
  const handleDeptChange=(val)=>setForm(p=>({...p,department_id:val,designation_ids:[]}));
  const handleLeaveChange=(idx,key,val)=>setLeaveTypes(prev=>prev.map((r,i)=>i===idx?{...r,[key]:val}:r));
  const addLeaveType=()=>{const used=new Set(leaveTypes.map(r=>r.name));const next=LEAVE_TYPE_PRESETS.find(p=>!used.has(p.name));setLeaveTypes(prev=>[...prev,{name:next?.name||"Custom Leave",days_per_year:5,carry_forward:0,encashable:"no"}]);};
  const removeLeaveType=(idx)=>setLeaveTypes(prev=>prev.filter((_,i)=>i!==idx));
  const isDetailsValid=()=>form.policy_name.trim()&&form.year&&(form.month_type==="all"||form.months.length>0)&&(form.scope==="all"||form.department_id);
  const isValid=()=>isDetailsValid()&&leaveTypes.length>0&&leaveTypes.every(r=>r.name.trim()&&Number(r.days_per_year)>0);
  const handleSave=async()=>{if(!isValid()) return;setSaving(true);
    try{
      const payload={policy_name:form.policy_name,year:Number(form.year),month_type:form.month_type,months:form.month_type==="all"?[]:form.months,scope:form.scope,...(form.scope==="department"?{department_id:Number(form.department_id)}:{}),...(form.scope==="department"&&form.designation_ids.length>0?{designation_ids:form.designation_ids}:{}),leave_types:leaveTypes.map(r=>({name:r.name,days_per_year:Number(r.days_per_year),carry_forward:Number(r.carry_forward),encashable:r.encashable==="yes"}))};
      const url=isEdit?`${BASE}/api/admin/leave-policies/${editPolicy.id}`:`${BASE}/api/admin/leave-policies`;
      const res=await fetch(url,{method:isEdit?"PUT":"POST",headers:getAuthHeaders(),body:JSON.stringify(payload)});
      const data=await res.json();if(!res.ok) throw new Error(data?.message||`Error ${res.status}`);
      onSuccess?.(isEdit?"Policy updated successfully!":"Policy created successfully!");onClose();
    }catch(err){onSuccess?.(null,err.message||"Failed to save policy.");}finally{setSaving(false);}
  };
  const TABS=[{id:"details",label:"Policy Details",icon:FileText},{id:"leaves",label:"Leave Types",icon:Calendar}];
  const totalDays=leaveTypes.reduce((s,r)=>s+Number(r.days_per_year||0),0);
  return (
    <ModalShell title={isEdit?"Edit Leave Policy":"Create Leave Policy"} onClose={onClose} tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab}
      footer={activeTab==="details"?(
        <><button onClick={onClose} className="px-5 py-2 text-sm font-bold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-100 transition">Cancel</button>
        <button onClick={()=>setActiveTab("leaves")} disabled={!isDetailsValid()} className="flex items-center gap-2 px-5 py-2 text-sm font-black text-white bg-orange-500 hover:bg-orange-600 rounded-xl transition disabled:opacity-50">Next <ChevronDown size={14} className="-rotate-90"/></button></>
      ):(
        <><button onClick={()=>setActiveTab("details")} className="px-5 py-2 text-sm font-bold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-100 transition">← Back</button>
        <button onClick={handleSave} disabled={saving||!isValid()} className="flex items-center gap-2 px-5 py-2 text-sm font-black text-white bg-orange-500 hover:bg-orange-600 rounded-xl transition disabled:opacity-50">
          {saving?<><Loader2 size={14} className="animate-spin"/>{isEdit?"Updating…":"Saving…"}</>:<><Plus size={14}/>{isEdit?"Update Policy":"Save Policy"}</>}</button></>
      )}>
      {activeTab==="details"&&(<>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-xs font-bold text-gray-600 mb-1.5">Policy Name <span className="text-red-500">*</span></label><input value={form.policy_name} onChange={e=>set("policy_name",e.target.value)} placeholder="e.g., Annual Leave Policy 2026" className={`${inputBase} ${neutral}`}/></div>
          <div><label className="block text-xs font-bold text-gray-600 mb-1.5">Year <span className="text-red-500">*</span></label>
            <div className="relative"><select value={form.year} onChange={e=>set("year",e.target.value)} className={selectBase}>{[currentYear-1,currentYear,currentYear+1,currentYear+2].map(y=><option key={y} value={y}>{y}</option>)}</select><ChevronDown size={13} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"/></div>
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-2">Applicable Month(s) <span className="text-red-500">*</span></label>
          <div className="flex gap-2 mb-3">{["all","specific"].map(t=><button key={t} onClick={()=>set("month_type",t)} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${form.month_type===t?"border-orange-400 bg-orange-50 text-orange-600":"border-gray-200 text-gray-500"}`}><Check size={11} className={form.month_type===t?"opacity-100":"opacity-0"}/>{t==="all"?"All Months":"Specific Months"}</button>)}</div>
          {form.month_type==="specific"&&(<><div className="grid grid-cols-6 gap-2">{MONTH_SHORT.map((m,i)=>{const num=i+1;const sel=form.months.includes(num);return <button key={m} onClick={()=>toggleMonth(num)} className={`py-2 text-xs font-bold rounded-lg border transition-all ${sel?"border-orange-400 bg-orange-50 text-orange-600":"border-gray-200 text-gray-500"}`}>{m}</button>;})}</div>{form.months.length===0&&<p className="text-[11px] text-amber-500 mt-2 flex items-center gap-1"><AlertTriangle size={10}/>Select at least one month</p>}</>)}
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-2">Apply To <span className="text-red-500">*</span></label>
          <div className="flex gap-2 mb-3">
            <button onClick={()=>set("scope","all")} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${form.scope==="all"?"border-orange-400 bg-orange-50 text-orange-600":"border-gray-200 text-gray-500"}`}><Users size={11}/>All Departments</button>
            <button onClick={()=>set("scope","department")} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${form.scope==="department"?"border-orange-400 bg-orange-50 text-orange-600":"border-gray-200 text-gray-500"}`}><Shield size={11}/>Specific Department</button>
          </div>
          {form.scope==="department"&&(<div className="space-y-4">
            <div><label className="block text-xs font-bold text-gray-600 mb-1.5">Department <span className="text-red-500">*</span></label>
              <div className="relative"><select value={form.department_id} onChange={e=>handleDeptChange(e.target.value)} disabled={loadingDept} className={selectBase}><option value="">{loadingDept?"Loading…":"Select Department"}</option>{departments.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}</select><ChevronDown size={13} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"/>{deptError&&<p className="text-[10px] text-red-500 mt-1">Failed to load departments</p>}</div>
            </div>
            {form.department_id&&(<div><label className="block text-xs font-bold text-gray-600 mb-1.5">Designations <span className="ml-1 text-[10px] font-normal text-gray-400">(leave blank = whole dept)</span></label>
              {loadingDesig?<div className="flex items-center gap-2 text-xs text-gray-400 py-2"><Loader2 size={13} className="animate-spin"/>Loading…</div>:filteredDesig.length===0?<p className="text-xs text-gray-400 py-2">No designations found.</p>:(
                <div className="flex flex-wrap gap-2">{filteredDesig.map(d=>{const sel=form.designation_ids.includes(d.id);return <button key={d.id} onClick={()=>toggleDesig(d.id)} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${sel?"border-orange-400 bg-orange-50 text-orange-600":"border-gray-200 text-gray-500"}`}>{sel&&<Check size={10}/>}{d.name}</button>;})}</div>
              )}
              {form.designation_ids.length>0&&<div className="mt-2 flex items-center gap-1.5 p-2 bg-orange-50 border border-orange-200 rounded-lg text-xs text-orange-600"><CheckCircle2 size={11}/>{form.designation_ids.length} selected<button onClick={()=>set("designation_ids",[])} className="ml-auto"><X size={11}/></button></div>}
            </div>)}
          </div>)}
        </div>
        <div className="p-3 bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 rounded-xl text-xs space-y-1">
          <p className="font-black text-gray-700 mb-1">📋 Summary</p>
          <p className="text-gray-600">Name: <span className="text-gray-900 font-bold">{form.policy_name||"—"}</span></p>
          <p className="text-gray-600">Year: <span className="text-gray-900 font-bold">{form.year}</span> · Months: <span className="text-gray-900 font-bold">{form.month_type==="all"?"All 12":form.months.map(m=>MONTH_SHORT[m-1]).join(",")||"—"}</span></p>
          <p className="text-gray-600">Scope: <span className="text-gray-900 font-bold">{form.scope==="all"?"All Departments":departments.find(d=>String(d.id)===String(form.department_id))?.name||"—"}</span></p>
        </div>
      </>)}
      {activeTab==="leaves"&&(<>
        <div className="grid grid-cols-[1fr_90px_90px_90px_32px] gap-2 px-3 pb-1">
          {["Leave Type","Days/Yr","Carry Fwd","Encashable",""].map(h=><span key={h} className="text-[10px] font-black text-gray-400 uppercase tracking-wide">{h}</span>)}
        </div>
        <div className="space-y-2">{leaveTypes.map((row,idx)=><LeaveTypeRow key={idx} row={row} index={idx} onChange={handleLeaveChange} onRemove={removeLeaveType}/>)}</div>
        <button onClick={addLeaveType} className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold text-orange-500 border-2 border-dashed border-orange-200 rounded-xl hover:bg-orange-50 transition"><Plus size={13}/>Add Leave Type</button>
        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl">
          <span className="text-xs font-bold text-white">Total Leave Days</span>
          <span className="text-xl font-black text-white">{totalDays} days/yr</span>
        </div>
      </>)}
    </ModalShell>
  );
}

// ════════════════════════════════════════════════════════════════════
// ── ASSIGN LEAVE MODAL
// ════════════════════════════════════════════════════════════════════
function AssignLeaveModal({ onClose, onSuccess, editAssignment }) {
  const isEdit=!!editAssignment;
  const [employees,setEmployees]=useState([]);const [loadingEmps,setLoadingEmps]=useState(true);const [empError,setEmpError]=useState(null);
  const [search,setSearch]=useState("");const [selectedEmp,setSelectedEmp]=useState(editAssignment?.employee||null);
  const [policies,setPolicies]=useState([]);const [loadingPol,setLoadingPol]=useState(false);const [selectedPol,setSelectedPol]=useState(null);
  const [leaveOverride,setLeaveOverride]=useState({});const [saving,setSaving]=useState(false);const [activeTab,setActiveTab]=useState("employee");
  useEffect(()=>{fetch(`${BASE}/api/admin/employees`,{headers:getAuthHeaders()}).then(r=>{if(!r.ok)throw new Error(`HTTP ${r.status}`);return r.json();}).then(data=>setEmployees(Array.isArray(data)?data:(data?.data??data?.employees??[]))).catch(err=>setEmpError(err.message||"Failed")).finally(()=>setLoadingEmps(false));},[]);
  useEffect(()=>{if(!selectedEmp) return;setLoadingPol(true);setSelectedPol(null);setLeaveOverride({});
    fetch(`${BASE}/api/admin/leave-policies`,{headers:getAuthHeaders()}).then(r=>r.json()).then(data=>{const list=Array.isArray(data)?data:(data?.data??[]);setPolicies(list);if(isEdit&&editAssignment?.policy_id){const pol=list.find(p=>p.id===editAssignment.policy_id);if(pol)handlePolicySelect(pol,editAssignment.leave_allocations);}}).catch(()=>setPolicies([])).finally(()=>setLoadingPol(false));
  },[selectedEmp]);
  const handlePolicySelect=(pol,existing)=>{setSelectedPol(pol);const init={};(pol.leave_types||[]).forEach(lt=>{const ex=existing?.find(a=>a.leave_type_name===lt.name);init[lt.name]={days_assigned:ex?.days_assigned??lt.days_per_year,notes:ex?.notes||""};});setLeaveOverride(init);};
  const handleOverrideChange=(name,key,val)=>setLeaveOverride(prev=>({...prev,[name]:{...prev[name],[key]:val}}));
  const filtered=employees.filter(e=>{const q=search.toLowerCase();return getFullName(e).toLowerCase().includes(q)||(e.employee_id||"").toLowerCase().includes(q)||getRole(e).toLowerCase().includes(q);});
  const isValid=()=>selectedEmp&&selectedPol&&Object.keys(leaveOverride).length>0;
  const totalAssigned=Object.values(leaveOverride).reduce((s,v)=>s+Number(v.days_assigned||0),0);
  const handleSave=async()=>{if(!isValid()) return;setSaving(true);
    try{const payload={employee_id:selectedEmp.id,policy_id:selectedPol.id,leave_allocations:Object.entries(leaveOverride).map(([name,v])=>({leave_type_name:name,days_assigned:Number(v.days_assigned),notes:v.notes||""}))};
    const url=isEdit?`${BASE}/api/admin/leave-assignments/${editAssignment.id}`:`${BASE}/api/admin/leave-assignments`;
    const res=await fetch(url,{method:isEdit?"PUT":"POST",headers:getAuthHeaders(),body:JSON.stringify(payload)});
    const data=await res.json();if(!res.ok) throw new Error(data?.message||`Error ${res.status}`);
    onSuccess?.(isEdit?"Assignment updated!":"Leave assigned!");onClose();}catch(err){onSuccess?.(null,err.message||"Failed to assign.");}finally{setSaving(false);}
  };
  const TABS=[{id:"employee",label:"Select Employee",icon:Users},{id:"leave",label:"Assign Leave",icon:Calendar}];
  return (
    <ModalShell title={isEdit?"Edit Leave Assignment":"Assign Leave to Employee"} onClose={onClose} tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab}
      footer={activeTab==="employee"?(
        <><button onClick={onClose} className="px-5 py-2 text-sm font-bold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-100 transition">Cancel</button>
        <button onClick={()=>setActiveTab("leave")} disabled={!selectedEmp} className="flex items-center gap-2 px-5 py-2 text-sm font-black text-white bg-orange-500 hover:bg-orange-600 rounded-xl transition disabled:opacity-50">Next <ChevronDown size={14} className="-rotate-90"/></button></>
      ):(
        <><button onClick={()=>setActiveTab("employee")} className="px-5 py-2 text-sm font-bold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-100 transition">← Back</button>
        <button onClick={handleSave} disabled={saving||!isValid()} className="flex items-center gap-2 px-5 py-2 text-sm font-black text-white bg-orange-500 hover:bg-orange-600 rounded-xl transition disabled:opacity-50">
          {saving?<><Loader2 size={14} className="animate-spin"/>{isEdit?"Updating…":"Assigning…"}</>:<><UserCheck size={14}/>{isEdit?"Update":"Assign Leave"}</>}</button></>
      )}>
      {activeTab==="employee"&&(<>
        <div className="relative"><Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name, ID, role…" className={`${inputBase} ${neutral} pl-9`}/></div>
        {selectedEmp&&(<div className="flex items-center gap-3 p-3 bg-orange-50 border border-orange-200 rounded-xl">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-black shrink-0" style={{backgroundColor:AVATAR_COLORS[selectedEmp.id%AVATAR_COLORS.length]}}>{getInitials(selectedEmp)}</div>
          <div className="flex-1 min-w-0"><p className="text-xs font-black text-gray-800">{getFullName(selectedEmp)}</p><p className="text-[10px] text-gray-500">{selectedEmp.employee_id}·{getRole(selectedEmp)}</p></div>
          <span className="flex items-center gap-1 text-[10px] font-black text-orange-600"><CheckCircle2 size={12}/>Selected</span>
          <button onClick={()=>setSelectedEmp(null)} className="text-gray-400 hover:text-gray-600"><X size={13}/></button>
        </div>)}
        {loadingEmps?<div className="flex items-center justify-center py-10 gap-2 text-gray-400"><Loader2 size={18} className="animate-spin text-orange-400"/><span className="text-xs">Loading employees…</span></div>
        :empError?<div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600"><AlertTriangle size={13}/>{empError}</div>
        :(<div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
          {filtered.length===0?<div className="flex flex-col items-center py-10 text-gray-400"><Users size={32} strokeWidth={1}/><p className="text-xs mt-2">No employees found</p></div>
          :filtered.map((emp,i)=>{const isSel=selectedEmp?.id===emp.id;const isActive=emp.status==="active"||emp.status===1;
            return(<div key={emp.id??i} onClick={()=>setSelectedEmp(emp)} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${isSel?"border-orange-400 bg-orange-50":"border-gray-100 hover:border-gray-200 hover:bg-gray-50"}`}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black shrink-0" style={{backgroundColor:AVATAR_COLORS[i%AVATAR_COLORS.length]}}>{emp.profile_image?<img src={emp.profile_image} alt="" className="w-8 h-8 rounded-full object-cover"/>:getInitials(emp)}</div>
              <div className="flex-1 min-w-0"><p className="text-xs font-bold text-gray-800 truncate">{getFullName(emp)}</p><p className="text-[10px] text-gray-400">{emp.employee_id}·{getRole(emp)}</p></div>
              <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${isActive?"bg-green-50 text-green-600":"bg-gray-100 text-gray-500"}`}><span className={`w-1.5 h-1.5 rounded-full ${isActive?"bg-green-500":"bg-gray-400"}`}/>{isActive?"Active":"Inactive"}</span>
              {isSel&&<div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center"><Check size={11} className="text-white"/></div>}
            </div>);
          })}
        </div>)}
      </>)}
      {activeTab==="leave"&&(<>
        {selectedEmp&&(<div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-black shrink-0" style={{backgroundColor:AVATAR_COLORS[selectedEmp.id%AVATAR_COLORS.length]}}>{getInitials(selectedEmp)}</div>
          <div><p className="text-sm font-black text-gray-800">{getFullName(selectedEmp)}</p><p className="text-[11px] text-gray-400">{selectedEmp.employee_id}·{getRole(selectedEmp)}</p></div>
        </div>)}
        <div><label className="block text-xs font-bold text-gray-600 mb-1.5">Select Leave Policy <span className="text-red-500">*</span></label>
          {loadingPol?<div className="flex items-center gap-2 text-xs text-gray-400 py-2"><Loader2 size={13} className="animate-spin"/>Loading policies…</div>
          :policies.length===0?<div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-600"><AlertTriangle size={13}/>No policies found. Create one first.</div>
          :(<div className="space-y-2">{policies.map(pol=>{const isSel=selectedPol?.id===pol.id;return(
            <div key={pol.id} onClick={()=>handlePolicySelect(pol)} className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${isSel?"border-orange-400 bg-orange-50":"border-gray-100 hover:border-gray-200"}`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isSel?"bg-orange-100":"bg-gray-100"}`}><FileText size={15} className={isSel?"text-orange-500":"text-gray-400"}/></div>
              <div className="flex-1 min-w-0"><div className="flex items-center justify-between"><p className="text-xs font-black text-gray-800">{pol.policy_name}</p>{isSel&&<div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center"><Check size={11} className="text-white"/></div>}</div>
              <p className="text-[10px] text-gray-400">{pol.year}·{pol.month_type==="all"?"All months":(pol.months||[]).map(m=>MONTH_SHORT[m-1]).join(",")}·{(pol.leave_types||[]).length} types</p></div>
            </div>);})}
          </div>)}
        </div>
        {selectedPol&&(selectedPol.leave_types||[]).length>0&&(<div>
          <label className="block text-xs font-bold text-gray-600 mb-1.5">Leave Allocation</label>
          <div className="space-y-2">{(selectedPol.leave_types||[]).map(lt=>{const ov=leaveOverride[lt.name]||{days_assigned:lt.days_per_year,notes:""};const preset=LEAVE_TYPE_PRESETS.find(p=>p.name===lt.name);
            return(<div key={lt.name} className="grid grid-cols-[1fr_90px] gap-3 items-center p-3 rounded-xl border border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-2"><span className="text-sm">{preset?.icon||"📋"}</span><div><p className="text-xs font-bold text-gray-800">{lt.name}</p><p className="text-[10px] text-gray-400">Default:{lt.days_per_year}d</p></div></div>
              <input type="number" min="0" max="365" value={ov.days_assigned} onChange={e=>handleOverrideChange(lt.name,"days_assigned",e.target.value)} className={`${inputBase} ${neutral} text-xs py-1.5 text-center`}/>
            </div>);})}
          </div>
          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl mt-3">
            <span className="text-xs font-bold text-white">Total for {getFullName(selectedEmp)}</span>
            <span className="text-xl font-black text-white">{totalAssigned}d/yr</span>
          </div>
        </div>)}
      </>)}
    </ModalShell>
  );
}

// ── ViewPolicyModal ───────────────────────────────────────────────────
function ViewPolicyModal({ policy, onClose }) {
  return (
    <ModalShell title="Policy Details" onClose={onClose}>
      <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 rounded-xl">
        <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center shrink-0"><FileText size={18} className="text-orange-500"/></div>
        <div><p className="text-sm font-black text-gray-900">{policy.policy_name}</p><p className="text-xs text-gray-500 mt-0.5">{policy.year}·{policy.month_type==="all"?"All months":(policy.months||[]).map(m=>MONTH_SHORT[m-1]).join(", ")}</p><p className="text-xs text-gray-500">Scope:{policy.scope==="all"?"All Departments":policy.department_name||`Dept ${policy.department_id}`}</p></div>
      </div>
      <div><p className="text-xs font-black text-gray-700 mb-2">Leave Types ({(policy.leave_types||[]).length})</p>
        <div className="space-y-2">{(policy.leave_types||[]).map(lt=>{const preset=LEAVE_TYPE_PRESETS.find(p=>p.name===lt.name);return(
          <div key={lt.name} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50 hover:border-orange-200 transition">
            <div className="flex items-center gap-2"><span className="text-sm">{preset?.icon||"📋"}</span><span className="text-xs font-bold text-gray-800">{lt.name}</span></div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-white border border-gray-200 rounded-full text-[10px] font-black text-gray-700">{lt.days_per_year}d/yr</span>
              {lt.carry_forward>0&&<span className="px-2 py-0.5 bg-blue-50 border border-blue-100 rounded-full text-[10px] font-black text-blue-600">CF:{lt.carry_forward}</span>}
              {lt.encashable&&<span className="px-2 py-0.5 bg-green-50 border border-green-100 rounded-full text-[10px] font-black text-green-600">Encashable</span>}
            </div>
          </div>);})}
        </div>
      </div>
    </ModalShell>
  );
}

// ════════════════════════════════════════════════════════════════════
// ── POLICIES SECTION + PAGINATION
// ════════════════════════════════════════════════════════════════════
function PoliciesSection({ policies, loading, onEdit, onDelete, onView }) {
  const [page, setPage] = useState(1);
  const paginated = policies.slice((page-1)*CARDS_PER_PAGE, page*CARDS_PER_PAGE);
  if (loading) return (
    <div className="grid grid-cols-2 gap-4">{Array.from({length:4}).map((_,i)=>(
      <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 animate-pulse">
        <div className="h-4 w-32 bg-gray-200 rounded mb-3"/><div className="h-3 w-24 bg-gray-100 rounded mb-2"/><div className="h-3 w-20 bg-gray-100 rounded"/>
      </div>
    ))}</div>
  );
  if (policies.length===0) return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-100">
      <FileText size={40} strokeWidth={1} className="mb-3 text-gray-200"/>
      <p className="text-sm font-bold">No leave policies yet.</p>
      <p className="text-xs mt-1 text-gray-300">Create your first policy to get started.</p>
    </div>
  );
  return (<>
    <div className="grid grid-cols-2 gap-4">
      {paginated.map(pol=>(
        <div key={pol.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
          <div className="flex items-start justify-between mb-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center shrink-0 shadow-sm shadow-orange-200"><FileText size={15} className="text-white"/></div>
            <div className="flex items-center gap-1">
              <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">Active</span>
              <button onClick={()=>onView(pol)} className="w-6 h-6 flex items-center justify-center rounded-lg border border-gray-200 text-gray-300 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition"><Eye size={11}/></button>
              <button onClick={()=>onEdit(pol)} className="w-6 h-6 flex items-center justify-center rounded-lg border border-gray-200 text-gray-300 hover:border-orange-400 hover:text-orange-500 hover:bg-orange-50 transition"><Edit2 size={11}/></button>
              <button onClick={()=>onDelete(pol)} className="w-6 h-6 flex items-center justify-center rounded-lg border border-gray-200 text-gray-300 hover:border-red-400 hover:text-red-500 hover:bg-red-50 transition"><Trash2 size={11}/></button>
            </div>
          </div>
          <p className="text-sm font-black text-gray-900 mb-0.5 truncate">{pol.policy_name}</p>
          <p className="text-[10px] text-gray-400 mb-3">{pol.year} · {pol.month_type==="all"?"All months":(pol.months||[]).map(m=>MONTH_SHORT[m-1]).join(", ")}</p>
          <div className="flex flex-wrap gap-1 mb-2">
            {(pol.leave_types||[]).slice(0,3).map(lt=>{const preset=LEAVE_TYPE_PRESETS.find(p=>p.name===lt.name);return(
              <span key={lt.name} className="inline-flex items-center gap-0.5 text-[9px] font-black px-1.5 py-0.5 rounded-full" style={{backgroundColor:preset?.bg||"#f8fafc",color:preset?.color||"#64748b"}}>{preset?.icon} {lt.name.split(" ")[0]}:{lt.days_per_year}d</span>
            );})}
            {(pol.leave_types||[]).length>3&&<span className="text-[9px] text-gray-400">+{(pol.leave_types||[]).length-3} more</span>}
          </div>
          <p className="text-[10px] text-gray-400">🏢 {pol.scope==="all"?"All Departments":pol.department_name||`Dept ${pol.department_id}`}</p>
        </div>
      ))}
    </div>
    <Pagination total={policies.length} page={page} perPage={CARDS_PER_PAGE} onChange={setPage}/>
  </>);
}

// ════════════════════════════════════════════════════════════════════
// ── ASSIGNED LEAVE SECTION + PAGINATION
// ════════════════════════════════════════════════════════════════════
function AssignedLeaveSection({ onEdit, onDelete, refreshKey }) {
  const [assignments,setAssignments]=useState([]);const [loading,setLoading]=useState(true);const [error,setError]=useState(null);
  const [searchQ,setSearchQ]=useState("");const [page,setPage]=useState(1);
  const fetchAssignments=useCallback(async()=>{setLoading(true);setError(null);
    try{const res=await fetch(`${BASE}/api/admin/leave-assignments`,{headers:getAuthHeaders()});if(!res.ok)throw new Error(`HTTP ${res.status}`);const data=await res.json();setAssignments(Array.isArray(data)?data:(data?.data??[]));}
    catch(err){setError(err.message||"Failed to load assignments.");}finally{setLoading(false);}
  },[]);
  useEffect(()=>{fetchAssignments();},[fetchAssignments,refreshKey]);
  const filtered=assignments.filter(a=>{const q=searchQ.toLowerCase();const emp=getFullName(a.employee||a);return emp.toLowerCase().includes(q)||(a.policy_name||"").toLowerCase().includes(q);});
  const paginated=filtered.slice((page-1)*CARDS_PER_PAGE,page*CARDS_PER_PAGE);
  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-black text-gray-800">Assigned Leave Details</h3>
          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-orange-100 text-orange-600">{assignments.length}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative"><Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"/>
            <input value={searchQ} onChange={e=>{setSearchQ(e.target.value);setPage(1);}} placeholder="Search…" className="pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg outline-none focus:border-orange-400 bg-white text-gray-700 w-36"/>
          </div>
          <button onClick={fetchAssignments} className="w-7 h-7 flex items-center justify-center border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition"><RefreshCw size={11}/></button>
        </div>
      </div>
      {error&&<div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 mb-3"><span className="flex items-center gap-2"><AlertTriangle size={13}/>{error}</span><button onClick={fetchAssignments} className="font-black underline flex items-center gap-1"><RefreshCw size={10}/>Retry</button></div>}
      {loading?(<div className="grid grid-cols-2 gap-4">{Array.from({length:4}).map((_,i)=><div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 animate-pulse"><div className="flex gap-3 mb-3"><div className="w-10 h-10 rounded-full bg-gray-200"/><div className="flex-1"><div className="h-3 w-28 bg-gray-200 rounded mb-1.5"/><div className="h-2.5 w-20 bg-gray-100 rounded"/></div></div><div className="h-3 w-36 bg-gray-100 rounded mb-2"/><div className="h-3 w-24 bg-gray-100 rounded"/></div>)}</div>)
      :filtered.length===0?(
        <div className="flex flex-col items-center justify-center py-12 text-gray-400 bg-white rounded-2xl border border-gray-100">
          <UserCheck size={36} strokeWidth={1} className="mb-2 text-gray-200"/>
          <p className="text-sm font-bold">{searchQ?"No matching assignments.":"No leave assignments yet."}</p>
          <p className="text-xs mt-1 text-gray-300">Use "Assign Leave" to get started.</p>
        </div>
      ):(<>
        <div className="grid grid-cols-2 gap-4">
          {paginated.map(a=>{
            const emp=a.employee||a;const name=getFullName(emp);const initials=getInitials(emp);
            const avatarBg=AVATAR_COLORS[(emp.id||0)%AVATAR_COLORS.length];
            const allocs=a.leave_allocations||[];const total=allocs.reduce((s,x)=>s+Number(x.days_assigned||0),0);
            return(
              <div key={a.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-black shrink-0" style={{backgroundColor:avatarBg}}>{initials}</div>
                    <div><p className="text-xs font-black text-gray-900">{name}</p><p className="text-[10px] text-gray-400">{emp.employee_id||""}·{getRole(emp)}</p></div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={()=>onEdit(a)} className="w-6 h-6 flex items-center justify-center rounded-lg border border-gray-200 text-gray-300 hover:border-orange-400 hover:text-orange-500 hover:bg-orange-50 transition"><Edit2 size={11}/></button>
                    <button onClick={()=>onDelete(a)} className="w-6 h-6 flex items-center justify-center rounded-lg border border-gray-200 text-gray-300 hover:border-red-400 hover:text-red-500 hover:bg-red-50 transition"><Trash2 size={11}/></button>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 mb-2 p-2 bg-gray-50 border border-gray-100 rounded-lg">
                  <FileText size={10} className="text-gray-400"/><span className="text-[10px] font-bold text-gray-600 truncate">{a.policy_name||`Policy #${a.policy_id}`}</span>
                  <span className="ml-auto text-[10px] font-black text-orange-500 shrink-0">{total}d/yr</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {allocs.slice(0,4).map(alloc=>{const preset=LEAVE_TYPE_PRESETS.find(p=>p.name===alloc.leave_type_name);return(
                    <span key={alloc.leave_type_name} className="inline-flex items-center gap-0.5 text-[9px] font-black px-1.5 py-0.5 rounded-full" style={{backgroundColor:preset?.bg||"#f8fafc",color:preset?.color||"#64748b"}}>{preset?.icon}{alloc.leave_type_name.split(" ")[0]}:{alloc.days_assigned}d</span>
                  );})}
                  {allocs.length>4&&<span className="text-[9px] text-gray-400">+{allocs.length-4}</span>}
                </div>
              </div>
            );
          })}
        </div>
        <Pagination total={filtered.length} page={page} perPage={CARDS_PER_PAGE} onChange={setPage}/>
      </>)}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// ── LEAVE APPROVAL SECTION (dummy data)
// ════════════════════════════════════════════════════════════════════
function LeaveApprovalSection() {
  const [approvals,setApprovals]   = useState(DUMMY_APPROVALS);
  const [filter,setFilter]         = useState("all");
  const [search,setSearch]         = useState("");
  const [page,setPage]             = useState(1);
  const [actionLoading,setAL]      = useState(null);
  const [notification,setNotif]    = useState(null);

  const notify=(type,title,message)=>setNotif({type,title,message});

  const handleAction=async(id,action)=>{
    setAL(id);
    await new Promise(r=>setTimeout(r,650));
    setApprovals(prev=>prev.map(a=>a.id===id?{...a,status:action}:a));
    setAL(null);
    notify("success",action==="approved"?"✅ Approved!":"❌ Rejected",action==="approved"?"Leave request has been approved.":"Leave request has been rejected.");
  };

  const counts={ all:approvals.length, pending:approvals.filter(a=>a.status==="pending").length, approved:approvals.filter(a=>a.status==="approved").length, rejected:approvals.filter(a=>a.status==="rejected").length };

  const filtered=approvals.filter(a=>{
    const q=search.toLowerCase();
    return (getFullName(a.employee).toLowerCase().includes(q)||a.leave_type.toLowerCase().includes(q))&&(filter==="all"||a.status===filter);
  });
  const paginated=filtered.slice((page-1)*CARDS_PER_PAGE,page*CARDS_PER_PAGE);

  const statusStyle={
    pending:  { dot:"bg-amber-400",  badge:"bg-amber-50 text-amber-700 border-amber-200",  label:"Pending"  },
    approved: { dot:"bg-emerald-500",badge:"bg-emerald-50 text-emerald-700 border-emerald-200",label:"Approved" },
    rejected: { dot:"bg-red-400",    badge:"bg-red-50 text-red-600 border-red-200",          label:"Rejected" },
  };

  return (
    <div className="mt-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-sm shadow-violet-200">
            <Bell size={13} className="text-white"/>
          </div>
          <h3 className="text-sm font-black text-gray-800">Leave Approval Requests</h3>
          {counts.pending>0&&<span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-red-500 text-white">{counts.pending} pending</span>}
        </div>
        <div className="relative">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} placeholder="Search employee…" className="pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg outline-none focus:border-violet-400 bg-white text-gray-700 w-40"/>
        </div>
      </div>

      {/* Filter pills */}
      <div className="flex items-center gap-2 mb-4">
        {[["all","All"],["pending","Pending"],["approved","Approved"],["rejected","Rejected"]].map(([f,label])=>{
          const isActive=filter===f;
          const activeColor=f==="pending"?"bg-amber-500 border-amber-500 shadow-amber-100":f==="approved"?"bg-emerald-500 border-emerald-500 shadow-emerald-100":f==="rejected"?"bg-red-500 border-red-500 shadow-red-100":"bg-orange-500 border-orange-500 shadow-orange-100";
          return(
            <button key={f} onClick={()=>{setFilter(f);setPage(1);}}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-black rounded-xl border transition-all ${isActive?`${activeColor} text-white shadow-sm`:"border-gray-200 text-gray-500 bg-white hover:bg-gray-50"}`}>
              {label}
              <span className={`text-[10px] font-black px-1.5 py-0 rounded-full ${isActive?"bg-white/25":"bg-gray-100 text-gray-600"}`}>{counts[f]}</span>
            </button>
          );
        })}
      </div>

      {filtered.length===0?(
        <div className="flex flex-col items-center justify-center py-12 text-gray-400 bg-white rounded-2xl border border-gray-100">
          <Bell size={36} strokeWidth={1} className="mb-2 text-gray-200"/>
          <p className="text-sm font-bold">No requests found.</p>
        </div>
      ):(<>
        <div className="grid grid-cols-2 gap-4">
          {paginated.map(a=>{
            const sc=statusStyle[a.status]||statusStyle.pending;
            const preset=LEAVE_TYPE_PRESETS.find(p=>p.name===a.leave_type);
            const avatarBg=AVATAR_COLORS[a.employee.id%AVATAR_COLORS.length];
            const isLoading=actionLoading===a.id;
            return(
              <div key={a.id} className={`bg-white rounded-2xl p-4 border-2 shadow-sm hover:shadow-xl transition-all duration-200 ${a.status==="pending"?"border-amber-100 hover:border-amber-200":a.status==="approved"?"border-emerald-100 hover:border-emerald-200":"border-gray-100 hover:border-gray-200"}`}>
                {/* Employee */}
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-black shrink-0" style={{backgroundColor:avatarBg}}>{getInitials(a.employee)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-gray-900 truncate">{getFullName(a.employee)}</p>
                    <p className="text-[10px] text-gray-400">{a.employee.employee_id} · {a.employee.designation}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full border shrink-0 ${sc.badge}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`}/>{sc.label}
                  </span>
                </div>

                {/* Info grid */}
                <div className="grid grid-cols-3 gap-1.5 mb-3">
                  <div className="col-span-2 p-2 rounded-xl bg-gray-50 border border-gray-100">
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wide mb-0.5">Leave Type</p>
                    <p className="text-[11px] font-black text-gray-800">{preset?.icon} {a.leave_type}</p>
                  </div>
                  <div className="p-2 rounded-xl bg-orange-50 border border-orange-100 text-center">
                    <p className="text-[9px] text-orange-400 font-bold uppercase tracking-wide mb-0.5">Days</p>
                    <p className="text-lg font-black text-orange-600 leading-none">{a.days}</p>
                  </div>
                  <div className="col-span-3 p-2 rounded-xl bg-gray-50 border border-gray-100">
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wide mb-0.5">Period</p>
                    <p className="text-[10px] font-bold text-gray-700">{a.from_date} → {a.to_date}</p>
                  </div>
                </div>

                {/* Reason */}
                <div className="mb-2.5 px-2.5 py-2 rounded-lg bg-gray-50 border border-gray-100">
                  <p className="text-[10px] text-gray-500 italic leading-relaxed">"{a.reason}"</p>
                </div>

                {/* Applied on */}
                <p className="text-[9px] text-gray-400 mb-3 flex items-center gap-1 font-medium"><Clock size={9}/>Applied: {a.applied_on}</p>

                {/* Action buttons */}
                {a.status==="pending"&&(
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={()=>handleAction(a.id,"rejected")} disabled={isLoading}
                      className="flex items-center justify-center gap-1.5 py-2.5 text-xs font-black text-red-500 bg-red-50 border-2 border-red-100 rounded-xl hover:bg-red-100 hover:border-red-300 transition disabled:opacity-50">
                      {isLoading?<Loader2 size={12} className="animate-spin"/>:<ThumbsDown size={12}/>}Reject
                    </button>
                    <button onClick={()=>handleAction(a.id,"approved")} disabled={isLoading}
                      className="flex items-center justify-center gap-1.5 py-2.5 text-xs font-black text-white bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 rounded-xl shadow-sm shadow-emerald-200 transition disabled:opacity-50">
                      {isLoading?<Loader2 size={12} className="animate-spin"/>:<ThumbsUp size={12}/>}Approve
                    </button>
                  </div>
                )}
                {a.status==="approved"&&(
                  <div className="flex items-center justify-center gap-2 py-2.5 bg-emerald-50 border-2 border-emerald-100 rounded-xl">
                    <CheckCircle2 size={14} className="text-emerald-500"/><span className="text-xs font-black text-emerald-600">Leave Approved</span>
                  </div>
                )}
                {a.status==="rejected"&&(
                  <div className="flex items-center justify-center gap-2 py-2.5 bg-red-50 border-2 border-red-100 rounded-xl">
                    <XCircle size={14} className="text-red-400"/><span className="text-xs font-black text-red-500">Leave Rejected</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <Pagination total={filtered.length} page={page} perPage={CARDS_PER_PAGE} onChange={setPage}/>
      </>)}
      {notification&&<NotificationModal type={notification.type} title={notification.title} message={notification.message} onClose={()=>setNotif(null)}/>}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// ── MAIN PAGE
// ════════════════════════════════════════════════════════════════════
export default function LeaveManagement() {
  const [showCreatePolicy,setShowCreatePolicy]=useState(false);
  const [showAssignLeave,setShowAssignLeave]  =useState(false);
  const [editPolicy,setEditPolicy]            =useState(null);
  const [editAssignment,setEditAssignment]    =useState(null);
  const [viewPolicy,setViewPolicy]            =useState(null);
  const [confirmDelete,setConfirmDelete]      =useState(null);
  const [deleting,setDeleting]               =useState(false);
  const [notification,setNotification]       =useState(null);
  const [policies,setPolicies]               =useState([]);
  const [loading,setLoading]                 =useState(true);
  const [error,setError]                     =useState(null);
  const [assignKey,setAssignKey]             =useState(0);

  const notify=useCallback((type,title,message)=>setNotification({type,title,message}),[]);

  const fetchPolicies=useCallback(async()=>{setLoading(true);setError(null);
    try{const res=await fetch(`${BASE}/api/admin/leave-policies`,{headers:getAuthHeaders()});if(!res.ok) throw new Error(`HTTP ${res.status}`);const data=await res.json();setPolicies(Array.isArray(data)?data:(data?.data??[]));}
    catch(err){setError(err.message||"Failed to load policies.");}finally{setLoading(false);}
  },[]);

  useEffect(()=>{fetchPolicies();},[fetchPolicies]);

  const handlePolicySuccess=(msg,errMsg)=>{if(errMsg){notify("error","Error",errMsg);return;}notify("success","Success",msg||"Done!");fetchPolicies();};
  const handleAssignSuccess=(msg,errMsg)=>{if(errMsg){notify("error","Error",errMsg);return;}notify("success","Success",msg||"Done!");setAssignKey(k=>k+1);};

  const handleDeleteConfirm=async()=>{if(!confirmDelete) return;const{type,item}=confirmDelete;setDeleting(true);
    try{const url=type==="policy"?`${BASE}/api/admin/leave-policies/${item.id}`:`${BASE}/api/admin/leave-assignments/${item.id}`;
    const res=await fetch(url,{method:"DELETE",headers:getAuthHeaders()});const data=await res.json().catch(()=>({}));
    if(!res.ok) throw new Error(data?.message||`Error ${res.status}`);
    setConfirmDelete(null);notify("success","Deleted",type==="policy"?"Policy deleted successfully.":"Assignment deleted successfully.");
    if(type==="policy") fetchPolicies();else setAssignKey(k=>k+1);}
    catch(err){setConfirmDelete(null);notify("error","Delete Failed",err.message||"Could not delete.");}finally{setDeleting(false);}
  };

  const totalLeaveTypes=policies.reduce((s,p)=>s+(p.leave_types?.length||0),0);
  const pendingCount=DUMMY_APPROVALS.filter(a=>a.status==="pending").length;

  const stats=[
    {label:"Total Policies",    value:loading?"—":policies.length,    Icon:FileText, bg:"bg-slate-800",   text:"text-white"},
    {label:"Active Year",       value:new Date().getFullYear(),        Icon:Calendar, bg:"bg-orange-500",  text:"text-white"},
    {label:"Leave Types",       value:loading?"—":totalLeaveTypes,    Icon:Shield,   bg:"bg-blue-500",    text:"text-white"},
    {label:"Pending Approvals", value:pendingCount,                    Icon:Bell,     bg:"bg-violet-600",  text:"text-white"},
  ];

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {stats.map(({label,value,Icon,bg,text})=>(
          <div key={label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-3 hover:shadow-md transition-shadow">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${bg} shadow-sm`}><Icon size={20} className={text}/></div>
            <div><p className="text-[11px] text-gray-400 font-semibold">{label}</p><p className="text-2xl font-black text-gray-900">{value}</p></div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-black text-gray-800">Leave Policies</h3>
          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-orange-100 text-orange-600">{policies.length}</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchPolicies} className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition"><RefreshCw size={13}/></button>
          <button onClick={()=>{setEditAssignment(null);setShowAssignLeave(true);}} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black text-orange-600 bg-orange-50 border border-orange-200 hover:bg-orange-100 transition">
            <UserCheck size={13}/>Assign Leave
          </button>
          <button onClick={()=>{setEditPolicy(null);setShowCreatePolicy(true);}} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 transition shadow-sm shadow-orange-200">
            <Plus size={13}/>Create Policy
          </button>
        </div>
      </div>

      {error&&<div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 mb-4"><span className="flex items-center gap-2"><AlertTriangle size={15}/>{error}</span><button onClick={fetchPolicies} className="flex items-center gap-1 text-xs font-black underline"><RefreshCw size={11}/>Retry</button></div>}

      <PoliciesSection policies={policies} loading={loading}
        onEdit={pol=>{setEditPolicy(pol);setShowCreatePolicy(true);}}
        onDelete={pol=>setConfirmDelete({type:"policy",item:pol})}
        onView={pol=>setViewPolicy(pol)}
      />

      <AssignedLeaveSection key={assignKey} refreshKey={assignKey}
        onEdit={a=>{setEditAssignment(a);setShowAssignLeave(true);}}
        onDelete={a=>setConfirmDelete({type:"assignment",item:a})}
      />

      <LeaveApprovalSection/>

      {showCreatePolicy&&<CreateLeavePolicyModal editPolicy={editPolicy} onClose={()=>{setShowCreatePolicy(false);setEditPolicy(null);}} onSuccess={handlePolicySuccess}/>}
      {showAssignLeave&&<AssignLeaveModal editAssignment={editAssignment} onClose={()=>{setShowAssignLeave(false);setEditAssignment(null);}} onSuccess={handleAssignSuccess}/>}
      {viewPolicy&&<ViewPolicyModal policy={viewPolicy} onClose={()=>setViewPolicy(null)}/>}
      {confirmDelete&&<ConfirmModal
        title={confirmDelete.type==="policy"?"Delete Policy?":"Delete Assignment?"}
        message={confirmDelete.type==="policy"?`Delete "${confirmDelete.item.policy_name}"? This cannot be undone.`:`Delete assignment for ${getFullName(confirmDelete.item.employee||confirmDelete.item)}?`}
        loading={deleting} onConfirm={handleDeleteConfirm} onCancel={()=>setConfirmDelete(null)}/>}
      {notification&&<NotificationModal type={notification.type} title={notification.title} message={notification.message} onClose={()=>setNotification(null)}/>}
    </div>
  );
}
