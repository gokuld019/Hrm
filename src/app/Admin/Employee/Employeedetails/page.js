"use client";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  FiArrowLeft, FiEdit2, FiMail, FiCalendar, FiUser, FiBriefcase,
  FiFileText, FiAward, FiTrendingUp, FiDollarSign, FiClock, FiMapPin,
  FiCheckCircle, FiXCircle, FiAlertTriangle, FiRefreshCw, FiLoader,
  FiPhone, FiGlobe, FiUpload, FiDownload, FiEye, FiPlus, FiTrash2,
  FiChevronRight, FiChevronDown, FiChevronLeft, FiSun, FiMoon,
  FiUsers, FiTarget, FiActivity, FiLayers, FiShield, FiCreditCard,
  FiBook, FiCode, FiHome, FiMoreVertical, FiSearch, FiFilter,
  FiCalendar as FiCal, FiCheck, FiInfo, FiZap, FiSettings,
  FiSave, FiEdit3, FiX, FiUserPlus, FiHeart, FiDroplet, FiFlag,
  FiSend, FiBriefcase as FiBrief, FiEdit
} from "react-icons/fi";
import { HiOutlineOfficeBuilding, HiOutlineLocationMarker } from "react-icons/hi";
import { MdOutlineWork, MdOutlineSchool, MdOutlineAccountBalance, MdOutlineFamilyRestroom, MdOutlineBloodtype } from "react-icons/md";

const BASE = process.env.NEXT_PUBLIC_API_URL;
const ACCENT = "#f97316";

// ─── AUTH ────────────────────────────────────────────────────────────
const getAuthHeaders = () => {
  const token = typeof window !== "undefined" ? localStorage.getItem("admin_auth_token") : null;
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    "ngrok-skip-browser-warning": "true",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// ─── HELPERS ─────────────────────────────────────────────────────────
const fmt = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");
const fmtDate = (d, opt = { day: "2-digit", month: "short", year: "numeric" }) => {
  if (!d) return "—";
  try { return new Date(d).toLocaleDateString("en-GB", opt); } catch { return "—"; }
};
const fmtTime = (t) => {
  if (!t) return "—";
  try {
    const [h, m] = t.split(":");
    const hour = parseInt(h);
    const ampm = hour >= 12 ? "PM" : "AM";
    const h12 = hour % 12 || 12;
    return `${h12}:${m} ${ampm}`;
  } catch { return t; }
};
const toDateInput = (iso) => {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  } catch { return ""; }
};
const getInitials = (name = "") => name.split(" ").filter(Boolean).map(n => n[0]).join("").slice(0,2).toUpperCase() || "??";
const getFullName = (emp) => {
  if (!emp) return "Unknown";
  if (typeof emp === "string") return emp;
  return [emp.firstname, emp.lastname].filter(Boolean).join(" ") || emp.name || "Unknown";
};

const AVATAR_COLORS = ["#6366f1","#f97316","#14b8a6","#ec4899","#22c55e","#a855f7","#3b82f6","#eab308"];
const avatarBg = (name = "") => {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffffffff;
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
};

const STATUS_CFG = {
  active:    { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0", label: "Active",    Icon: FiCheckCircle },
  inactive:  { bg: "#fef2f2", color: "#dc2626", border: "#fecaca", label: "Inactive",  Icon: FiXCircle     },
  on_leave:  { bg: "#fffbeb", color: "#d97706", border: "#fde68a", label: "On Leave",  Icon: FiClock       },
};

// ─── BASE UI ─────────────────────────────────────────────────────────
function Avatar({ name = "?", src, size = 40 }) {
  if (src) return <img src={src} alt={name} style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover" }} />;
  return (
    <div className="flex items-center justify-center font-bold text-white shrink-0"
      style={{ width: size, height: size, borderRadius: "50%", background: avatarBg(name), fontSize: size * 0.35 }}>
      {getInitials(name)}
    </div>
  );
}

function Spinner({ size = 14, color = ACCENT }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5}
      strokeLinecap="round" className="animate-spin">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status?.toLowerCase()] || STATUS_CFG.active;
  const Icon = cfg.Icon;
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold"
      style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
      <Icon size={11} />{cfg.label}
    </span>
  );
}

function Placeholder({ title, message }) {
  return (
    <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200">
      <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center mx-auto mb-3">
        <FiInfo size={26} className="text-orange-400" />
      </div>
      <p className="text-sm font-bold text-gray-700">{title}</p>
      <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto">{message || "This section is not yet available."}</p>
    </div>
  );
}

function StatBox({ label, value, sub, color = "#6366f1", Icon }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-center gap-3">
      {Icon && (
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0" style={{ background: color }}>
          <Icon size={18} />
        </div>
      )}
      <div className="min-w-0">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
        <p className="text-lg font-black text-gray-900 leading-tight truncate">{value}</p>
        {sub && <p className="text-[10px] text-gray-400 mt-0.5 truncate">{sub}</p>}
      </div>
    </div>
  );
}

function SectionCard({ title, Icon, children, action }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-black text-gray-800 flex items-center gap-2">
          {Icon && <Icon size={14} className="text-orange-500" />} {title}
        </h3>
        {action}
      </div>
      {children}
    </div>
  );
}

function EmptyState({ Icon, title, sub }) {
  return (
    <div className="text-center py-8">
      {Icon && <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-2">
        <Icon size={20} className="text-gray-300" />
      </div>}
      <p className="text-xs font-bold text-gray-500">{title}</p>
      {sub && <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

// ─── EDITABLE INFO ROW ───────────────────────────────────────────────
function InfoRow({ label, value, Icon, highlight, editing, editKey, editData, onEdit }) {
  return (
    <div className="flex items-start gap-2 py-2 border-b border-gray-50 last:border-0">
      {Icon && <Icon size={13} className="text-gray-400 mt-1 shrink-0" />}
      <span className="text-xs text-gray-500 w-36 shrink-0 mt-1">{label}</span>
      {editing ? (
        <input
          value={editData?.[editKey] ?? ""}
          onChange={e => onEdit(editKey, e.target.value)}
          className="flex-1 text-xs font-semibold text-gray-800 border border-orange-200 rounded-lg px-2 py-1.5 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-50"
        />
      ) : (
        <span className={`text-xs flex-1 break-words ${highlight ? "font-bold text-orange-600" : "font-semibold text-gray-800"}`}>
          {value || "—"}
        </span>
      )}
    </div>
  );
}

function EditableDateRow({ label, value, Icon, editing, editKey, editData, onEdit }) {
  return (
    <div className="flex items-start gap-2 py-2 border-b border-gray-50 last:border-0">
      {Icon && <Icon size={13} className="text-gray-400 mt-1 shrink-0" />}
      <span className="text-xs text-gray-500 w-36 shrink-0 mt-1">{label}</span>
      {editing ? (
        <input
          type="date"
          value={toDateInput(editData?.[editKey])}
          onChange={e => onEdit(editKey, e.target.value)}
          className="flex-1 text-xs font-semibold text-gray-800 border border-orange-200 rounded-lg px-2 py-1.5 outline-none focus:border-orange-400 cursor-pointer"
        />
      ) : (
        <span className="text-xs flex-1 font-semibold text-gray-800">{fmtDate(value)}</span>
      )}
    </div>
  );
}

function EditableSelectRow({ label, value, Icon, editing, editKey, editData, onEdit, options }) {
  return (
    <div className="flex items-start gap-2 py-2 border-b border-gray-50 last:border-0">
      {Icon && <Icon size={13} className="text-gray-400 mt-1 shrink-0" />}
      <span className="text-xs text-gray-500 w-36 shrink-0 mt-1">{label}</span>
      {editing ? (
        <select
          value={editData?.[editKey] ?? ""}
          onChange={e => onEdit(editKey, e.target.value)}
          className="flex-1 text-xs font-semibold text-gray-800 border border-orange-200 rounded-lg px-2 py-1.5 outline-none focus:border-orange-400 bg-white cursor-pointer"
        >
          <option value="">— Select —</option>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <span className="text-xs flex-1 font-semibold text-gray-800">{value || "—"}</span>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// TAB 1: OVERVIEW (Editable)
// ════════════════════════════════════════════════════════════════════
function TabOverview({ employee, editing, editData, onEdit }) {
  return (
    <div className="space-y-4">
      <SectionCard title="Basic Information" Icon={FiUser}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
          <div>
            <InfoRow label="First Name"    value={employee.firstname}    editing={editing} editKey="firstname"    editData={editData} onEdit={onEdit} />
            <InfoRow label="Last Name"     value={employee.lastname}     editing={editing} editKey="lastname"     editData={editData} onEdit={onEdit} />
            <InfoRow label="Username"      value={employee.username}     editing={editing} editKey="username"     editData={editData} onEdit={onEdit} />
            <InfoRow label="Email"         value={employee.email}        Icon={FiMail} editing={editing} editKey="email" editData={editData} onEdit={onEdit} />
            <InfoRow label="Phone"         value={employee.phone_number} Icon={FiPhone} editing={editing} editKey="phone_number" editData={editData} onEdit={onEdit} />
          </div>
          <div>
            <InfoRow label="Employee ID"   value={employee.employee_id} highlight />
            <EditableDateRow label="Joining Date" value={employee.joining_date} Icon={FiCalendar} editing={editing} editKey="joining_date" editData={editData} onEdit={onEdit} />
            <EditableSelectRow
              label="Status"
              value={employee.status}
              editing={editing}
              editKey="status"
              editData={editData}
              onEdit={onEdit}
              options={["active", "inactive"]}
            />
            <InfoRow label="About"         value={employee.about}        editing={editing} editKey="about" editData={editData} onEdit={onEdit} />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Work Information" Icon={HiOutlineOfficeBuilding}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
          <div>
            <InfoRow label="Department"   value={employee.department?.name} />
            <InfoRow label="Designation"  value={employee.designation?.name} />
            <InfoRow label="Company"      value={employee.company} editing={editing} editKey="company" editData={editData} onEdit={onEdit} />
          </div>
          <div>
            <InfoRow label="Shift"        value={employee.shift?.shift_name} Icon={FiClock} />
            <InfoRow label="Shift Time"   value={employee.shift ? `${fmtTime(employee.shift.start_time)} – ${fmtTime(employee.shift.end_time)}` : "—"} />
            <InfoRow label="Weekly Off"   value={employee.shift?.active_days ? `Working: ${employee.shift.active_days.join(", ").toUpperCase()}` : "—"} />
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// TAB 2: PERSONAL (Editable)
// ════════════════════════════════════════════════════════════════════
function TabPersonal({ employee, editing, editData, onEdit }) {
  return (
    <div className="space-y-4">
      <SectionCard title="Personal Details" Icon={FiUser}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
          <div>
            <EditableDateRow label="Date of Birth" value={employee.date_of_birth || employee.dob} Icon={FiCalendar} editing={editing} editKey="date_of_birth" editData={editData} onEdit={onEdit} />
            <EditableSelectRow label="Gender" value={employee.gender} Icon={FiUser} editing={editing} editKey="gender" editData={editData} onEdit={onEdit} options={["Male","Female","Other"]} />
            <EditableSelectRow label="Marital Status" value={employee.marital_status} Icon={FiHeart} editing={editing} editKey="marital_status" editData={editData} onEdit={onEdit} options={["Single","Married","Divorced","Widowed"]} />
            <InfoRow label="Blood Group"      value={employee.blood_group} Icon={MdOutlineBloodtype} editing={editing} editKey="blood_group" editData={editData} onEdit={onEdit} />
            <InfoRow label="Nationality"      value={employee.nationality || "Indian"} Icon={FiFlag} editing={editing} editKey="nationality" editData={editData} onEdit={onEdit} />
          </div>
          <div>
            <InfoRow label="Father's Name"    value={employee.father_name}  editing={editing} editKey="father_name" editData={editData} onEdit={onEdit} />
            <InfoRow label="Mother's Name"    value={employee.mother_name}  editing={editing} editKey="mother_name" editData={editData} onEdit={onEdit} />
            <InfoRow label="Spouse Name"      value={employee.spouse_name}  editing={editing} editKey="spouse_name" editData={editData} onEdit={onEdit} />
            <InfoRow label="PAN Number"       value={employee.pan_number}   editing={editing} editKey="pan_number"  editData={editData} onEdit={onEdit} />
            <InfoRow label="Aadhaar Number"   value={employee.aadhaar_number} editing={editing} editKey="aadhaar_number" editData={editData} onEdit={onEdit} />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Contact & Address" Icon={HiOutlineLocationMarker}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
          <div>
            <InfoRow label="Current Address"   value={employee.current_address || employee.address} Icon={FiMapPin} editing={editing} editKey="address" editData={editData} onEdit={onEdit} />
            <InfoRow label="Current City"      value={employee.city}     editing={editing} editKey="city"     editData={editData} onEdit={onEdit} />
            <InfoRow label="Current State"     value={employee.state}    editing={editing} editKey="state"    editData={editData} onEdit={onEdit} />
            <InfoRow label="Current ZIP"       value={employee.zip_code} editing={editing} editKey="zip_code" editData={editData} onEdit={onEdit} />
          </div>
          <div>
            <InfoRow label="Permanent Address" value={employee.permanent_address} editing={editing} editKey="permanent_address" editData={editData} onEdit={onEdit} />
            <InfoRow label="Permanent City"    value={employee.permanent_city}    editing={editing} editKey="permanent_city" editData={editData} onEdit={onEdit} />
            <InfoRow label="Permanent State"   value={employee.permanent_state}   editing={editing} editKey="permanent_state" editData={editData} onEdit={onEdit} />
            <InfoRow label="Country"           value={employee.country || "India"} editing={editing} editKey="country" editData={editData} onEdit={onEdit} />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Emergency Contact" Icon={MdOutlineFamilyRestroom}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8">
          <InfoRow label="Name"          value={employee.emergency_contact_name}     editing={editing} editKey="emergency_contact_name" editData={editData} onEdit={onEdit} />
          <InfoRow label="Relationship"  value={employee.emergency_contact_relation} editing={editing} editKey="emergency_contact_relation" editData={editData} onEdit={onEdit} />
          <InfoRow label="Phone"         value={employee.emergency_contact_phone}    Icon={FiPhone} editing={editing} editKey="emergency_contact_phone" editData={editData} onEdit={onEdit} />
        </div>
      </SectionCard>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// TAB 3: EMPLOYMENT (Editable)
// ════════════════════════════════════════════════════════════════════
function TabEmployment({ employee, editing, editData, onEdit }) {
  return (
    <div className="space-y-4">
      <SectionCard title="Employment Details" Icon={FiBriefcase}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
          <div>
            <InfoRow label="Employee ID"       value={employee.employee_id} highlight />
            <EditableDateRow label="Joining Date" value={employee.joining_date} editing={editing} editKey="joining_date" editData={editData} onEdit={onEdit} />
            <EditableSelectRow
              label="Employment Type"
              value={employee.employment_type || "Full-time"}
              editing={editing}
              editKey="employment_type"
              editData={editData}
              onEdit={onEdit}
              options={["Full-time", "Part-time", "Contract", "Intern", "Consultant"]}
            />
            <EditableSelectRow
              label="Work Mode"
              value={employee.work_mode || "On-site"}
              editing={editing}
              editKey="work_mode"
              editData={editData}
              onEdit={onEdit}
              options={["On-site", "Remote", "Hybrid"]}
            />
            <InfoRow label="Work Location"     value={employee.work_location || "Head Office"} editing={editing} editKey="work_location" editData={editData} onEdit={onEdit} />
          </div>
          <div>
            <EditableDateRow label="Confirmation Date" value={employee.confirmation_date} editing={editing} editKey="confirmation_date" editData={editData} onEdit={onEdit} />
            <EditableDateRow label="Probation End"     value={employee.probation_end_date} editing={editing} editKey="probation_end_date" editData={editData} onEdit={onEdit} />
            <InfoRow label="Notice Period"     value={employee.notice_period ? `${employee.notice_period} days` : "30 days"} editing={editing} editKey="notice_period" editData={editData} onEdit={onEdit} />
            <InfoRow label="Reporting Manager" value={employee.reporting_manager?.name || "—"} />
            <InfoRow label="HR Manager"        value={employee.hr_manager?.name || "—"} />
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// TAB 4: ATTENDANCE (Read-only, from API)
// ════════════════════════════════════════════════════════════════════
function TabAttendance({ employee }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  useEffect(() => {
    (async () => {
      setLoading(true); setError(null);
      try {
        const res = await fetch(`${BASE}/api/admin/attendance/employee/${employee.id}?month=${month}&year=${year}`, { headers: getAuthHeaders() });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        setData(json.data || json);
      } catch (err) { setError(err.message); }
      finally { setLoading(false); }
    })();
  }, [employee.id, month, year]);

  if (loading) return <div className="flex justify-center py-16"><Spinner size={24} /></div>;
  if (error || !data) return <Placeholder title="Attendance not available" message={error || "No attendance records"} />;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <select value={month} onChange={e => setMonth(Number(e.target.value))}
          className="text-xs border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-orange-400 bg-white cursor-pointer">
          {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
            <option key={m} value={m}>{new Date(2026, m - 1, 1).toLocaleString("en-US", { month: "long" })}</option>
          ))}
        </select>
        <select value={year} onChange={e => setYear(Number(e.target.value))}
          className="text-xs border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-orange-400 bg-white cursor-pointer">
          {[now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map(y => <option key={y}>{y}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatBox label="Present" value={data.present_days ?? 0} color="#16a34a" Icon={FiCheckCircle} />
        <StatBox label="Absent"  value={data.absent_days  ?? 0} color="#dc2626" Icon={FiXCircle} />
        <StatBox label="Late"    value={data.late_days    ?? 0} color="#f59e0b" Icon={FiClock} />
        <StatBox label="Hours"   value={`${data.total_hours ?? 0}h`} color="#6366f1" Icon={FiActivity} />
      </div>

      <SectionCard title="Daily Log">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50">
                {["Date", "Status", "Check In", "Check Out", "Hours", "Notes"].map(h => (
                  <th key={h} className="px-3 py-2 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(data.daily || data.days || []).map((d, i) => (
                <tr key={i} className="border-t border-gray-50 hover:bg-orange-50/30">
                  <td className="px-3 py-2 font-semibold text-gray-700">{fmtDate(d.date, { day: "2-digit", month: "short" })}</td>
                  <td className="px-3 py-2"><StatusBadge status={d.status?.toLowerCase()} /></td>
                  <td className="px-3 py-2 text-gray-600">{d.check_in || "—"}</td>
                  <td className="px-3 py-2 text-gray-600">{d.check_out || "—"}</td>
                  <td className="px-3 py-2 font-bold text-gray-800">{d.hours || 0}h</td>
                  <td className="px-3 py-2 text-gray-500 italic">{d.notes || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// TAB 5: LEAVES (Read-only)
// ════════════════════════════════════════════════════════════════════
function TabLeaves({ employee }) {
  const [balances, setBalances] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [bRes, rRes] = await Promise.all([
          fetch(`${BASE}/api/admin/leave-balances?employee_id=${employee.id}`, { headers: getAuthHeaders() }),
          fetch(`${BASE}/api/admin/leave-requests?employee_id=${employee.id}`, { headers: getAuthHeaders() }),
        ]);
        const bData = await bRes.json().catch(() => ({}));
        const rData = await rRes.json().catch(() => ({}));
        setBalances(Array.isArray(bData) ? bData : (bData.data || []));
        setRequests(Array.isArray(rData) ? rData : (rData.data || []));
      } catch { /* silent */ }
      finally { setLoading(false); }
    })();
  }, [employee.id]);

  if (loading) return <div className="flex justify-center py-16"><Spinner size={24} /></div>;

  return (
    <div className="space-y-4">
      <SectionCard title="Leave Balances" Icon={FiCalendar}>
        {balances.length === 0 ? (
          <EmptyState Icon={FiCalendar} title="No leave balances" sub="No leave types assigned" />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {balances.map((b, i) => {
              const pct = b.assigned_days > 0 ? Math.round((b.used_days / b.assigned_days) * 100) : 0;
              return (
                <div key={i} className="p-3 rounded-xl border border-gray-100 bg-gray-50">
                  <p className="text-xs font-bold text-gray-700 mb-2">{b.leave_type_name}</p>
                  <div className="flex items-end justify-between mb-1.5">
                    <span className="text-lg font-black text-gray-900">{b.remaining_days || 0}</span>
                    <span className="text-[10px] text-gray-400">of {b.assigned_days || 0}</span>
                  </div>
                  <div className="h-1.5 bg-white rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-orange-500" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1.5">{b.used_days || 0} used</p>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>

      <SectionCard title="Leave History" Icon={FiFileText}>
        {requests.length === 0 ? (
          <EmptyState Icon={FiFileText} title="No leave requests" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50">
                  {["Type", "From", "To", "Days", "Reason", "Status"].map(h => (
                    <th key={h} className="px-3 py-2 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {requests.slice(0, 15).map((r, i) => (
                  <tr key={i} className="border-t border-gray-50 hover:bg-orange-50/30">
                    <td className="px-3 py-2 font-semibold text-gray-700">{r.leave_type?.name || r.leave_type_name || "—"}</td>
                    <td className="px-3 py-2 text-gray-600">{fmtDate(r.start_date, { day: "2-digit", month: "short" })}</td>
                    <td className="px-3 py-2 text-gray-600">{fmtDate(r.end_date, { day: "2-digit", month: "short" })}</td>
                    <td className="px-3 py-2 font-bold text-gray-800">{r.number_of_days || 0}</td>
                    <td className="px-3 py-2 text-gray-500 italic max-w-[200px] truncate">{r.reason}</td>
                    <td className="px-3 py-2"><StatusBadge status={r.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// TAB 6: SHIFT (Read-only)
// ════════════════════════════════════════════════════════════════════
function TabShift({ employee }) {
  const shift = employee.shift;
  if (!shift) return <Placeholder title="No shift assigned" />;

  const DAY_LABELS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  const DAY_KEYS = ["mon","tue","wed","thu","fri","sat","sun"];
  const activeDays = (shift.active_days || []).map(d => d.toLowerCase());

  return (
    <div className="space-y-4">
      <SectionCard title="Current Shift" Icon={FiClock}>
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center shrink-0">
            <FiSun size={22} className="text-orange-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-black text-gray-900">{shift.shift_name}</h3>
            <p className="text-xs text-gray-500 mt-0.5 capitalize">{shift.shift_type} shift</p>
            <div className="flex items-center gap-3 mt-2 text-xs text-gray-600 flex-wrap">
              <span className="flex items-center gap-1.5"><FiClock size={11} />{fmtTime(shift.start_time)} – {fmtTime(shift.end_time)}</span>
              {shift.break_time && <span>· {shift.break_time}m break</span>}
            </div>
          </div>
          <StatusBadge status={shift.status} />
        </div>
      </SectionCard>

      <SectionCard title="Weekly Pattern">
        <div className="grid grid-cols-7 gap-2">
          {DAY_LABELS.map((d, i) => {
            const isActive = activeDays.includes(DAY_KEYS[i]);
            return (
              <div key={d} className={`text-center p-3 rounded-xl border-2 ${isActive ? "border-orange-300 bg-orange-50" : "border-gray-100 bg-gray-50"}`}>
                <p className={`text-[10px] font-bold uppercase ${isActive ? "text-orange-600" : "text-gray-400"}`}>{d}</p>
                <p className={`text-xs font-black mt-1 ${isActive ? "text-orange-500" : "text-gray-300"}`}>
                  {isActive ? "ON" : "OFF"}
                </p>
              </div>
            );
          })}
        </div>
      </SectionCard>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// TAB 7: PAYROLL (Read-only)
// ════════════════════════════════════════════════════════════════════
function TabPayroll({ employee }) {
  const [slip, setSlip] = useState(null);
  const [loading, setLoading] = useState(true);
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`${BASE}/api/admin/payslip/${employee.id}/${month}/${year}`, { headers: getAuthHeaders() });
        const j = await res.json();
        if (j.success) setSlip(j);
        else setSlip(null);
      } catch { setSlip(null); }
      finally { setLoading(false); }
    })();
  }, [employee.id, month, year]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <select value={month} onChange={e => setMonth(Number(e.target.value))}
          className="text-xs border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-orange-400 bg-white cursor-pointer">
          {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
            <option key={m} value={m}>{new Date(2026, m - 1, 1).toLocaleString("en-US", { month: "long" })}</option>
          ))}
        </select>
        <select value={year} onChange={e => setYear(Number(e.target.value))}
          className="text-xs border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-orange-400 bg-white cursor-pointer">
          {[now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map(y => <option key={y}>{y}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size={24} /></div>
      ) : !slip ? (
        <Placeholder title="No payslip data" message="No payslip found for the selected month." />
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatBox label="Total Earnings" value={fmt(slip.total_earnings)} color="#16a34a" Icon={FiTrendingUp} />
            <StatBox label="Total Deductions" value={fmt(slip.total_deductions)} color="#dc2626" Icon={FiDollarSign} />
            <StatBox label="Net Pay" value={fmt(slip.net_pay)} color={ACCENT} Icon={FiDollarSign} />
            <StatBox label="Hourly Rate" value={fmt(slip.hourly_rate)} color="#6366f1" Icon={FiClock} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SectionCard title="Earnings">
              {(slip.earnings || []).map((e, i) => (
                <div key={i} className="flex justify-between py-1.5 text-xs border-b border-gray-50 last:border-0">
                  <span className="text-gray-600">{e.name}</span>
                  <span className="font-bold text-emerald-700">{fmt(e.amount)}</span>
                </div>
              ))}
              <div className="flex justify-between pt-2 mt-2 border-t-2 border-emerald-100">
                <span className="text-xs font-bold text-emerald-700">Total</span>
                <span className="text-sm font-black text-emerald-700">{fmt(slip.total_earnings)}</span>
              </div>
            </SectionCard>
            <SectionCard title="Deductions">
              {(slip.deductions || []).map((d, i) => (
                <div key={i} className="flex justify-between py-1.5 text-xs border-b border-gray-50 last:border-0">
                  <span className="text-gray-600">{d.name}</span>
                  <span className="font-bold text-rose-700">{fmt(d.amount)}</span>
                </div>
              ))}
              <div className="flex justify-between pt-2 mt-2 border-t-2 border-rose-100">
                <span className="text-xs font-bold text-rose-700">Total</span>
                <span className="text-sm font-black text-rose-700">{fmt(slip.total_deductions)}</span>
              </div>
            </SectionCard>
          </div>
        </>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// TAB 8: BANK (Editable)
// ════════════════════════════════════════════════════════════════════
function TabBank({ employee, editing, editData, onEdit }) {
  return (
    <div className="space-y-4">
      <SectionCard title="Bank Account Details" Icon={MdOutlineAccountBalance}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
          <div>
            <InfoRow label="Bank Name"       value={employee.bank_name}      Icon={FiCreditCard} editing={editing} editKey="bank_name" editData={editData} onEdit={onEdit} />
            <InfoRow label="Account Number"  value={employee.account_number} editing={editing} editKey="account_number" editData={editData} onEdit={onEdit} />
            <InfoRow label="IFSC Code"       value={employee.ifsc_code}      editing={editing} editKey="ifsc_code" editData={editData} onEdit={onEdit} />
            <InfoRow label="Account Holder"  value={employee.account_holder_name || getFullName(employee)} editing={editing} editKey="account_holder_name" editData={editData} onEdit={onEdit} />
          </div>
          <div>
            <InfoRow label="Branch"          value={employee.branch_name}    Icon={FiMapPin} editing={editing} editKey="branch_name" editData={editData} onEdit={onEdit} />
            <InfoRow label="UAN (PF)"        value={employee.uan_number}     editing={editing} editKey="uan_number" editData={editData} onEdit={onEdit} />
            <InfoRow label="ESI Number"      value={employee.esi_number}     editing={editing} editKey="esi_number" editData={editData} onEdit={onEdit} />
            <InfoRow label="PAN Number"      value={employee.pan_number}     editing={editing} editKey="pan_number" editData={editData} onEdit={onEdit} />
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// TAB 9: DOCUMENTS (Read-only UI, upload coming soon)
// ════════════════════════════════════════════════════════════════════
function TabDocuments({ employee }) {
  const DOC_TYPES = [
    { key: "aadhaar", label: "Aadhaar Card", Icon: FiCreditCard, color: "#3b82f6" },
    { key: "pan", label: "PAN Card", Icon: FiCreditCard, color: "#8b5cf6" },
    { key: "passport", label: "Passport", Icon: FiGlobe, color: "#ec4899" },
    { key: "license", label: "Driving License", Icon: FiCreditCard, color: "#14b8a6" },
    { key: "voter", label: "Voter ID", Icon: FiCreditCard, color: "#f97316" },
    { key: "bank", label: "Bank Passbook", Icon: FiDollarSign, color: "#22c55e" },
    { key: "offer", label: "Offer Letter", Icon: FiFileText, color: "#06b6d4" },
    { key: "relieving", label: "Relieving Letter", Icon: FiFileText, color: "#a855f7" },
    { key: "tenth", label: "10th Marksheet", Icon: FiAward, color: "#eab308" },
    { key: "twelfth", label: "12th Marksheet", Icon: FiAward, color: "#ef4444" },
    { key: "degree", label: "Degree Certificate", Icon: FiAward, color: "#6366f1" },
    { key: "nda", label: "Signed NDA", Icon: FiShield, color: "#64748b" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-2xl">
        <FiInfo size={16} className="text-blue-600 shrink-0 mt-0.5" />
        <p className="text-xs text-blue-700 flex-1">Upload, view, and manage all employee documents.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {DOC_TYPES.map(({ key, label, Icon, color }) => (
          <div key={key} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${color}15`, color }}>
                <Icon size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-800">{label}</p>
                <p className="text-[10px] text-gray-400">Not uploaded</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button disabled className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-bold bg-gray-100 text-gray-400 cursor-not-allowed">
                <FiUpload size={10} /> Upload
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// TAB 10: EDUCATION (Read-only from API)
// ════════════════════════════════════════════════════════════════════
function TabEducation({ employee, editing, editData, onEdit }) {
  const education = employee.education || employee.educations || [];

  if (education.length === 0 && !editing) {
    return (
      <div className="space-y-4">
        <Placeholder title="No education records" message="Education records will appear here once added." />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <SectionCard title={`Education (${education.length})`} Icon={MdOutlineSchool}>
        <div className="space-y-3">
          {education.map((e, i) => (
            <div key={i} className="p-4 rounded-xl border border-gray-100 bg-gray-50">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm font-bold text-gray-800">{e.degree || e.qualification}</p>
                  <p className="text-xs text-gray-500">{e.institution || e.university}</p>
                </div>
                <span className="text-[10px] font-bold text-orange-600">{e.year_of_passing || e.year}</span>
              </div>
              {(e.specialization || e.percentage) && (
                <div className="flex items-center gap-3 text-[10px] text-gray-500">
                  {e.specialization && <span>Specialization: {e.specialization}</span>}
                  {e.percentage && <span>Score: {e.percentage}%</span>}
                </div>
              )}
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// TAB 11: EXPERIENCE (Read-only)
// ════════════════════════════════════════════════════════════════════
function TabExperience({ employee }) {
  const experience = employee.experience || employee.experiences || [];
  if (experience.length === 0) return <Placeholder title="No work experience recorded" />;

  return (
    <div className="space-y-3">
      {experience.map((e, i) => (
        <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
              <FiBriefcase size={18} className="text-orange-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-800">{e.designation}</p>
              <p className="text-xs text-gray-500">{e.company_name}</p>
              <p className="text-[10px] text-gray-400 mt-1">
                {fmtDate(e.from_date, { month: "short", year: "numeric" })} → {e.to_date ? fmtDate(e.to_date, { month: "short", year: "numeric" }) : "Present"}
              </p>
            </div>
          </div>
          {e.reason_for_leaving && (
            <p className="text-xs text-gray-500 italic border-t border-gray-100 pt-2">
              <span className="font-bold not-italic">Reason for leaving:</span> {e.reason_for_leaving}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// TAB 12: SKILLS (Read-only)
// ════════════════════════════════════════════════════════════════════
function TabSkills({ employee }) {
  const skills = employee.skills || [];
  const proficiencyColor = { Expert: "#16a34a", Advanced: "#3b82f6", Intermediate: "#f59e0b", Beginner: "#94a3b8" };

  if (skills.length === 0) return <Placeholder title="No skills added" />;

  return (
    <div className="flex flex-wrap gap-2">
      {skills.map((s, i) => {
        const level = s.proficiency || s.level || "Intermediate";
        const color = proficiencyColor[level] || "#94a3b8";
        return (
          <div key={i} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-100 bg-white shadow-sm">
            <span className="w-2 h-2 rounded-full" style={{ background: color }} />
            <span className="text-xs font-bold text-gray-800">{s.name || s.skill_name}</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: `${color}15`, color }}>{level}</span>
          </div>
        );
      })}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// TAB 13: PROJECTS (Read-only)
// ════════════════════════════════════════════════════════════════════
function TabProjects({ employee }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${BASE}/api/admin/projects`, { headers: getAuthHeaders() });
        const data = await res.json();
        const all = Array.isArray(data) ? data : (data.data || []);
        const mine = all.filter(p =>
          p.project_manager_id === employee.id ||
          p.team_leader_id === employee.id ||
          (p.team_members || []).some(m => m.id === employee.id)
        );
        setProjects(mine);
      } catch { /* silent */ }
      finally { setLoading(false); }
    })();
  }, [employee.id]);

  if (loading) return <div className="flex justify-center py-16"><Spinner size={24} /></div>;
  if (projects.length === 0) return <Placeholder title="No projects" message="This employee is not assigned to any project yet." />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {projects.map(p => {
        const role = p.project_manager_id === employee.id ? "Manager"
                    : p.team_leader_id === employee.id ? "Team Lead"
                    : "Member";
        const roleColor = role === "Manager" ? "#16a34a" : role === "Team Lead" ? "#3b82f6" : "#f59e0b";
        return (
          <div key={p.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
                <FiLayers size={18} className="text-orange-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-gray-800 truncate">{p.project_name}</p>
                <p className="text-[10px] text-gray-400 font-mono">{p.project_code}</p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
                style={{ background: `${roleColor}15`, color: roleColor }}>
                {role}
              </span>
            </div>
            <p className="text-xs text-gray-500 line-clamp-2 mb-3">{p.description || "No description"}</p>
            <div className="flex items-center justify-between text-[10px] text-gray-400 pt-2 border-t border-gray-100">
              <span className="flex items-center gap-1"><FiCal size={10} /> {fmtDate(p.start_date, { day: "2-digit", month: "short" })} → {fmtDate(p.end_date, { day: "2-digit", month: "short" })}</span>
              <span className="capitalize font-bold">{p.priority}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// TAB 14: TASKS (Read-only)
// ════════════════════════════════════════════════════════════════════
function TabTasks({ employee }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${BASE}/api/admin/tasks`, { headers: getAuthHeaders() });
        const data = await res.json();
        const all = Array.isArray(data) ? data : (data.data || []);
        const mine = all.filter(t => (t.assignees || []).some(a => a.id === employee.id));
        setTasks(mine);
      } catch { /* silent */ }
      finally { setLoading(false); }
    })();
  }, [employee.id]);

  if (loading) return <div className="flex justify-center py-16"><Spinner size={24} /></div>;

  const filtered = filter === "all" ? tasks : tasks.filter(t => t.status === filter);
  const counts = {
    all: tasks.length,
    pending: tasks.filter(t => t.status === "pending").length,
    in_progress: tasks.filter(t => t.status === "in_progress").length,
    completed: tasks.filter(t => t.status === "completed").length,
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        {[
          { k: "all", label: "All", count: counts.all },
          { k: "pending", label: "Pending", count: counts.pending },
          { k: "in_progress", label: "In Progress", count: counts.in_progress },
          { k: "completed", label: "Completed", count: counts.completed },
        ].map(f => (
          <button key={f.k} onClick={() => setFilter(f.k)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition"
            style={{
              background: filter === f.k ? ACCENT : "#f3f4f6",
              color: filter === f.k ? "#fff" : "#6b7280",
            }}>
            {f.label}
            <span className="text-[10px] px-1.5 py-px rounded-full"
              style={{ background: filter === f.k ? "rgba(255,255,255,0.25)" : "#e5e7eb", color: filter === f.k ? "#fff" : "#6b7280" }}>
              {f.count}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Placeholder title={`No ${filter === "all" ? "" : filter} tasks`} />
      ) : (
        <div className="space-y-2">
          {filtered.map(t => {
            const isOverdue = t.due_date && new Date(t.due_date) < new Date() && t.status !== "completed";
            const statusColor = t.status === "completed" ? "#16a34a" : t.status === "in_progress" ? "#3b82f6" : "#f59e0b";
            return (
              <div key={t.id} className={`p-4 rounded-2xl bg-white border shadow-sm ${isOverdue ? "border-rose-200 bg-rose-50/30" : "border-gray-100"}`}>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <p className="text-sm font-bold text-gray-800 flex-1">{t.title}</p>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize shrink-0"
                    style={{ background: `${statusColor}15`, color: statusColor }}>
                    {t.status?.replace("_", " ")}
                  </span>
                </div>
                {t.description && <p className="text-xs text-gray-500 line-clamp-2 mb-2">{t.description}</p>}
                <div className="flex items-center gap-3 text-[10px] text-gray-400 pt-2 border-t border-gray-50">
                  {t.project?.project_name && <span className="flex items-center gap-1"><FiLayers size={10} /> {t.project.project_name}</span>}
                  {t.due_date && <span className={`flex items-center gap-1 ${isOverdue ? "text-rose-500 font-bold" : ""}`}><FiCal size={10} /> Due {fmtDate(t.due_date, { day: "2-digit", month: "short" })}</span>}
                  {t.priority && <span className="capitalize font-bold">{t.priority}</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// TAB 15: PERFORMANCE (Read-only)
// ════════════════════════════════════════════════════════════════════
function TabPerformance({ employee, tasksCount }) {
  const { total = 0, completed = 0 } = tasksCount || {};
  const taskScore = total > 0 ? Math.round((completed / total) * 100) : 0;
  const overallScore = taskScore;
  const colorForScore = (v) => v >= 80 ? "#16a34a" : v >= 60 ? "#f59e0b" : "#dc2626";

  return (
    <div className="space-y-4">
      <SectionCard title="Overall Performance" Icon={FiTrendingUp}>
        <div className="flex items-center gap-6 mb-5">
          <div className="relative w-28 h-28 shrink-0">
            <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="none" stroke="#f1f5f9" strokeWidth="10" />
              <circle cx="50" cy="50" r="40" fill="none" stroke={colorForScore(overallScore)} strokeWidth="10"
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - overallScore / 100)}`}
                strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-black" style={{ color: colorForScore(overallScore) }}>
                {overallScore}%
              </span>
            </div>
          </div>
          <div className="flex-1">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-gray-500 font-medium">Task Completion</span>
              <span className="font-bold" style={{ color: colorForScore(taskScore) }}>{taskScore}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${taskScore}%`, background: colorForScore(taskScore) }} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-center">
            <p className="text-[10px] text-blue-600 font-bold uppercase">Total Tasks</p>
            <p className="text-2xl font-black text-blue-700">{total}</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-center">
            <p className="text-[10px] text-emerald-600 font-bold uppercase">Completed</p>
            <p className="text-2xl font-black text-emerald-700">{completed}</p>
          </div>
          <div className="p-3 rounded-xl bg-orange-50 border border-orange-100 text-center">
            <p className="text-[10px] text-orange-600 font-bold uppercase">Pending</p>
            <p className="text-2xl font-black text-orange-700">{total - completed}</p>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// TAB 16: TIMELINE (Read-only)
// ════════════════════════════════════════════════════════════════════
function TabTimeline({ employee }) {
  const events = [
    { date: employee.joining_date, title: "Joined Company", desc: `Joined as ${employee.designation?.name || "Employee"}`, color: "#16a34a", Icon: FiUserPlus },
    ...(employee.confirmation_date ? [{ date: employee.confirmation_date, title: "Confirmed", desc: "Successfully completed probation", color: "#3b82f6", Icon: FiCheckCircle }] : []),
  ].filter(e => e.date).sort((a, b) => new Date(b.date) - new Date(a.date));

  if (events.length === 0) return <Placeholder title="No timeline events" />;

  return (
    <div className="relative pl-6">
      <div className="absolute left-2 top-2.5 bottom-2.5 w-px bg-gray-200" />
      {events.map((e, i) => {
        const Icon = e.Icon;
        return (
          <div key={i} className={`relative ${i === events.length - 1 ? "" : "pb-6"}`}>
            <div className="absolute -left-[22px] top-1 w-5 h-5 rounded-full flex items-center justify-center ring-4 ring-white"
              style={{ background: e.color }}>
              <Icon size={10} className="text-white" />
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <p className="text-sm font-bold text-gray-800">{e.title}</p>
              <p className="text-xs text-gray-500 mt-0.5">{e.desc}</p>
              <p className="text-[10px] text-gray-400 mt-1.5">{fmtDate(e.date, { day: "2-digit", month: "long", year: "numeric" })}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// MAIN PAGE — ADMIN VIEW WITH EDIT MODE
// ════════════════════════════════════════════════════════════════════
export default function EmployeeDetails({ employee, onBack, onRefresh }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [empData, setEmpData] = useState(employee || null);
  const [tasksCount, setTasksCount] = useState({ total: 0, completed: 0 });

  // ⭐ EDIT MODE
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  // Refetch fresh employee data
  useEffect(() => {
    if (!employee?.id) return;
    (async () => {
      try {
        const res = await fetch(`${BASE}/api/admin/employees/${employee.id}`, { headers: getAuthHeaders() });
        const data = await res.json();
        if (data.success) setEmpData(data.data);
        else if (data.id) setEmpData(data);
      } catch { /* keep prop data */ }
    })();
  }, [employee?.id]);

  // Fetch task counts
  useEffect(() => {
    if (!employee?.id) return;
    (async () => {
      try {
        const res = await fetch(`${BASE}/api/admin/tasks`, { headers: getAuthHeaders() });
        const data = await res.json();
        const all = Array.isArray(data) ? data : (data.data || []);
        const mine = all.filter(t => (t.assignees || []).some(a => a.id === employee.id));
        setTasksCount({
          total: mine.length,
          completed: mine.filter(t => t.status === "completed").length,
        });
      } catch { /* silent */ }
    })();
  }, [employee?.id]);

  const startEdit = () => {
    setEditData({
      firstname: empData?.firstname || "",
      lastname: empData?.lastname || "",
      username: empData?.username || "",
      email: empData?.email || "",
      phone_number: empData?.phone_number || "",
      joining_date: empData?.joining_date || "",
      status: empData?.status || "active",
      about: empData?.about || "",
      company: empData?.company || "",
      date_of_birth: empData?.date_of_birth || empData?.dob || "",
      gender: empData?.gender || "",
      marital_status: empData?.marital_status || "",
      blood_group: empData?.blood_group || "",
      nationality: empData?.nationality || "Indian",
      father_name: empData?.father_name || "",
      mother_name: empData?.mother_name || "",
      spouse_name: empData?.spouse_name || "",
      pan_number: empData?.pan_number || "",
      aadhaar_number: empData?.aadhaar_number || "",
      address: empData?.address || "",
      city: empData?.city || "",
      state: empData?.state || "",
      zip_code: empData?.zip_code || "",
      permanent_address: empData?.permanent_address || "",
      permanent_city: empData?.permanent_city || "",
      permanent_state: empData?.permanent_state || "",
      country: empData?.country || "India",
      emergency_contact_name: empData?.emergency_contact_name || "",
      emergency_contact_relation: empData?.emergency_contact_relation || "",
      emergency_contact_phone: empData?.emergency_contact_phone || "",
      employment_type: empData?.employment_type || "Full-time",
      work_mode: empData?.work_mode || "On-site",
      work_location: empData?.work_location || "",
      confirmation_date: empData?.confirmation_date || "",
      probation_end_date: empData?.probation_end_date || "",
      notice_period: empData?.notice_period || "",
      bank_name: empData?.bank_name || "",
      account_number: empData?.account_number || "",
      ifsc_code: empData?.ifsc_code || "",
      account_holder_name: empData?.account_holder_name || "",
      branch_name: empData?.branch_name || "",
      uan_number: empData?.uan_number || "",
      esi_number: empData?.esi_number || "",
    });
    setSaveError(null);
    setEditing(true);
    setActiveTab("overview");
  };

  const cancelEdit = () => {
    setEditing(false);
    setEditData({});
    setSaveError(null);
  };

  const handleEditChange = useCallback((key, value) => {
    setEditData(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      // Send only non-empty fields
      const payload = {};
      Object.keys(editData).forEach(k => {
        const v = editData[k];
        if (v !== "" && v !== null && v !== undefined) payload[k] = v;
      });

      const res = await fetch(`${BASE}/api/admin/employees/${empData.id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || (data?.errors ? Object.values(data.errors).flat().join(" • ") : `Error ${res.status}`));

      // Refresh with updated data
      setEmpData(data.data || data);
      setEditing(false);
      setEditData({});
      onRefresh?.();
    } catch (err) {
      setSaveError(err.message || "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  if (!empData) return (
    <div className="flex flex-col items-center justify-center py-20">
      <FiAlertTriangle size={32} className="text-amber-500 mb-3" />
      <p className="text-sm font-bold text-gray-700">No employee data</p>
      <button onClick={onBack} className="mt-3 text-xs text-orange-500 underline">← Back to list</button>
    </div>
  );

  const name = getFullName(empData);
  const role = empData.designation?.name || "Employee";
  const dept = empData.department?.name || "—";
  const email = empData.email || "—";
  const phone = empData.phone_number || "—";
  const empId = empData.employee_id || "—";
  const joinDate = empData.joining_date;
  const avatarSrc = empData.profile_image || empData.avatar || null;
  const status = empData.status === "active" || empData.status === 1 ? "active" : "inactive";

  const TABS = [
    { k: "overview",    label: "Overview",    Icon: FiUser         },
    { k: "personal",    label: "Personal",    Icon: FiUser         },
    { k: "employment",  label: "Employment",  Icon: FiBriefcase    },
    { k: "attendance",  label: "Attendance",  Icon: FiClock        },
    { k: "leaves",      label: "Leaves",      Icon: FiCalendar     },
    { k: "shift",       label: "Shift",       Icon: FiSun          },
    { k: "payroll",     label: "Payroll",     Icon: FiDollarSign   },
    { k: "bank",        label: "Bank",        Icon: FiCreditCard   },
    { k: "documents",   label: "Documents",   Icon: FiFileText     },
    { k: "education",   label: "Education",   Icon: MdOutlineSchool },
    { k: "experience",  label: "Experience",  Icon: MdOutlineWork  },
    { k: "skills",      label: "Skills",      Icon: FiCode         },
    { k: "projects",    label: "Projects",    Icon: FiLayers       },
    { k: "tasks",       label: "Tasks",       Icon: FiCheck        },
    { k: "performance", label: "Performance", Icon: FiTrendingUp   },
    { k: "timeline",    label: "Timeline",    Icon: FiActivity     },
  ];

  return (
    <div className="space-y-4">
      {/* Back + Actions */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <button onClick={onBack} disabled={editing}
          className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-orange-500 transition disabled:opacity-50 disabled:cursor-not-allowed">
          <FiArrowLeft size={15} /> Back to Employee List
        </button>
        <div className="flex items-center gap-2">
          {!editing ? (
            <>
              <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50">
                <FiDownload size={12} /> Export Profile
              </button>
              <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50">
                <FiMail size={12} /> Send Email
              </button>
              <button onClick={startEdit}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold text-white"
                style={{ background: ACCENT }}>
                <FiEdit2 size={12} /> Edit Employee
              </button>
            </>
          ) : (
            <>
              {saveError && (
                <span className="text-[11px] font-bold text-red-500 bg-red-50 px-3 py-1.5 rounded-lg border border-red-100">
                  {saveError.length > 60 ? saveError.slice(0, 60) + "…" : saveError}
                </span>
              )}
              <button onClick={cancelEdit} disabled={saving}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50">
                <FiX size={12} /> Cancel
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold text-white disabled:opacity-60"
                style={{ background: ACCENT }}>
                {saving ? <><Spinner size={12} color="#fff" /> Saving…</> : <><FiSave size={12} /> Save Changes</>}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Editing banner */}
      {editing && (
        <div className="flex items-start gap-3 p-4 bg-orange-50 border-2 border-orange-200 rounded-2xl">
          <FiEdit3 size={16} className="text-orange-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-black text-orange-900">Edit Mode is ON</p>
            <p className="text-[11px] text-orange-700 mt-0.5">
              You can edit fields on the <strong>Overview</strong>, <strong>Personal</strong>, <strong>Employment</strong>, and <strong>Bank</strong> tabs. Click <strong>Save Changes</strong> when done.
            </p>
          </div>
        </div>
      )}

      {/* Profile Header */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-orange-400 to-orange-500 relative">
          <div className="absolute inset-0 opacity-30"
            style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 0%, transparent 30%), radial-gradient(circle at 80% 50%, white 0%, transparent 30%)" }} />
        </div>

        <div className="px-6 pb-6 -mt-12 relative">
          <div className="flex items-end gap-5 flex-wrap">
            <div className="rounded-full bg-white p-1 shadow-md shrink-0">
              <Avatar name={name} src={avatarSrc} size={92} />
            </div>
            <div className="flex-1 min-w-0 pb-2">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h1 className="text-xl font-black text-gray-900">{name}</h1>
                <StatusBadge status={status} />
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                <span className="flex items-center gap-1.5"><FiBriefcase size={11} /> {role}</span>
                <span className="text-gray-300">·</span>
                <span className="flex items-center gap-1.5"><HiOutlineOfficeBuilding size={11} /> {dept}</span>
                <span className="text-gray-300">·</span>
                <span className="flex items-center gap-1.5 font-mono">{empId}</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500 mt-2 flex-wrap">
                <span className="flex items-center gap-1.5"><FiMail size={11} /> {email}</span>
                <span className="flex items-center gap-1.5"><FiPhone size={11} /> {phone}</span>
                <span className="flex items-center gap-1.5"><FiCalendar size={11} /> Joined {fmtDate(joinDate)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatBox label="Total Tasks"  value={tasksCount.total}     color="#3b82f6" Icon={FiCheck} />
        <StatBox label="Completed"    value={tasksCount.completed} color="#16a34a" Icon={FiCheckCircle} />
        <StatBox label="Shift"        value={empData.shift?.shift_name || "—"} sub={empData.shift ? `${fmtTime(empData.shift.start_time)} – ${fmtTime(empData.shift.end_time)}` : ""} color="#f97316" Icon={FiClock} />
        <StatBox label="Department"   value={dept}                 color="#8b5cf6" Icon={HiOutlineOfficeBuilding} />
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="border-b border-gray-100 overflow-x-auto">
          <div className="flex items-center gap-0 px-4">
            {TABS.map(t => {
              const active = activeTab === t.k;
              const Icon = t.Icon;
              return (
                <button key={t.k} onClick={() => setActiveTab(t.k)}
                  className="flex items-center gap-2 px-4 py-3.5 text-xs font-bold whitespace-nowrap border-b-2 transition-all"
                  style={{
                    borderColor: active ? ACCENT : "transparent",
                    color: active ? ACCENT : "#6b7280",
                  }}>
                  <Icon size={13} /> {t.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-6">
          {activeTab === "overview"    && <TabOverview    employee={empData} editing={editing} editData={editData} onEdit={handleEditChange} />}
          {activeTab === "personal"    && <TabPersonal    employee={empData} editing={editing} editData={editData} onEdit={handleEditChange} />}
          {activeTab === "employment"  && <TabEmployment  employee={empData} editing={editing} editData={editData} onEdit={handleEditChange} />}
          {activeTab === "attendance"  && <TabAttendance  employee={empData} />}
          {activeTab === "leaves"      && <TabLeaves      employee={empData} />}
          {activeTab === "shift"       && <TabShift       employee={empData} />}
          {activeTab === "payroll"     && <TabPayroll     employee={empData} />}
          {activeTab === "bank"        && <TabBank        employee={empData} editing={editing} editData={editData} onEdit={handleEditChange} />}
          {activeTab === "documents"   && <TabDocuments   employee={empData} />}
          {activeTab === "education"   && <TabEducation   employee={empData} editing={editing} editData={editData} onEdit={handleEditChange} />}
          {activeTab === "experience"  && <TabExperience  employee={empData} />}
          {activeTab === "skills"      && <TabSkills      employee={empData} />}
          {activeTab === "projects"    && <TabProjects    employee={empData} />}
          {activeTab === "tasks"       && <TabTasks       employee={empData} />}
          {activeTab === "performance" && <TabPerformance employee={empData} tasksCount={tasksCount} />}
          {activeTab === "timeline"    && <TabTimeline    employee={empData} />}
        </div>
      </div>
    </div>
  );
}