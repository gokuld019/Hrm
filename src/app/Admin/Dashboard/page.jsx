"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard, Users, Building2, BadgeCheck, FileText,
  ChevronDown, Settings, LogOut, Search, RefreshCw,
  Mail, Bell, Calendar, Upload, TrendingUp,
  Globe, CheckSquare, DollarSign, UserPlus,
  UserCheck, Clock, Menu, FolderOpen, Crown, Loader2,
  ArrowRight, LayoutGrid, ChevronRight, Home,
  UserCircle, Layers, ListTodo, Kanban, Plus,
  CalendarClock, ClipboardList, Activity, Video, Radio,
  Link, Shield, X, Check, AlertTriangle, Info,
  Inbox, Send, Star, Trash2, Archive, MoreHorizontal,
  CheckCheck, Circle, Dot, Zap, Package, Briefcase,
  BarChart2, PieChart, Monitor, Smartphone, Globe2,
  Ticket, // Added Ticket icon
} from "lucide-react";

import EmployeeList    from "../Employee/Employeelist/page";
import Department      from "../Employee/Department/page";
import Designation     from "../Employee/Designation/page";
import EmployeeDetails from "../Employee/Employeedetails/page";
import Policies        from "../Employee/Policies/page";
import ClientList      from "../Clients/page";
import ProjectsGrid, { AddProjectModal } from "../Projects/ProjectsGrid/page";
import TasksPage       from "../Projects/Tasks/page";
import TaskBoardPage   from "../Projects/TaskBoard/page";
import ShiftSchedule   from "../Shiftschedule/page";
import AttendancePage  from "../Attendance/page";
import AppsUrls        from "../Apps-urls/page";
import ScreenCapture   from "../Screencapture/page";
import LeaveManagement from "../LeaveManagement/page";
import Livestream      from "../Livestream/page";
import EmployeeSalaryPage from "../PayrollSalary/page";
import PayslipPage     from "../Payslip/page";
import PayrollReport   from "../PayrollReport/page";
import ActivityPage    from "../Activity/page";
import ProductivityPage from "../Productivity/page";
import TicketsPage     from "../Tickets/page"; // Import your tickets page

// ─── ProtectedRoute ───────────────────────────────────────────────────────────
function ProtectedRoute({ children, requiredRole }) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  useEffect(() => {
    const stored = localStorage.getItem("auth_user");
    if (!stored) { router.replace("/login"); return; }
    const user = JSON.parse(stored);
    const role = user?.role ?? "";
    if (requiredRole && role !== requiredRole) {
      router.replace(role === "admin" ? "/Admin/Dashboard" : "/Employee/Dashboard");
    } else { setIsAuthorized(true); }
  }, [requiredRole, router]);
  if (!isAuthorized) return null;
  return children;
}

// ─── DASHBOARD STATS HOOK ─────────────────────────────────────────────────────
function useDashboardStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("admin_auth_token");
      const res = await fetch("https://api.pencilkraft.in/api/admin/dashboard/main-stats", {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const data = await res.json();
      if (data.success) setStats(data);
      else setError("Failed to load stats");
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);
  return { stats, loading, error, refetch: fetchStats };
}

// ─── Shared dashboard helpers ─────────────────────────────────────────────────
const HBar = ({ label, value, max = 10, color = "#f97316" }) => (
  <div className="flex items-center gap-3 text-xs">
    <span className="w-28 text-right text-gray-500 shrink-0 truncate">{label}</span>
    <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
      <div
        className="h-full rounded-full transition-all"
        style={{ width: `${max > 0 ? (value / max) * 100 : 0}%`, backgroundColor: color }}
      />
    </div>
    <span className="text-[11px] font-semibold text-gray-500 w-4 shrink-0">{value}</span>
  </div>
);

const DonutChart = ({ present = 0, halfDay = 0, late = 0, absent = 0, total = 0 }) => {
  const segments = [
    { color: "#f97316", pct: present,  label: "Present"  },
    { color: "#14b8a6", pct: halfDay,  label: "Half Day" },
    { color: "#eab308", pct: late,     label: "Late"     },
    { color: "#ef4444", pct: absent,   label: "Absent"   },
  ];
  const sum = segments.reduce((a, s) => a + s.pct, 0);
  const normalised = sum > 0
    ? segments.map(s => ({ ...s, pct: (s.pct / sum) * 100 }))
    : segments.map((s, i) => ({ ...s, pct: i === 0 ? 100 : 0 }));

  let cum = 0;
  const r = 70, cx = 90, cy = 90, stroke = 28, circ = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center gap-4">
      <svg width={180} height={180} viewBox="0 0 180 180">
        {normalised.map((s, i) => {
          const offset = circ * (1 - cum / 100);
          const dash   = circ * (s.pct / 100);
          cum += s.pct;
          return (
            <circle key={i} cx={cx} cy={cy} r={r} fill="none"
              stroke={s.color} strokeWidth={stroke}
              strokeDasharray={`${dash} ${circ - dash}`}
              strokeDashoffset={offset}
              style={{ transform: "rotate(-90deg)", transformOrigin: `${cx}px ${cy}px` }}
            />
          );
        })}
        <text x={cx} y={cy - 6}  textAnchor="middle" fontSize={22} fontWeight="700" fill="#1e293b">{total}</text>
        <text x={cx} y={cy + 14} textAnchor="middle" fontSize={11} fill="#94a3b8">Present</text>
      </svg>
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
        {segments.map(s => (
          <div key={s.label} className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
            {s.label}
          </div>
        ))}
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, iconBg, label, value, link, onLinkClick }) => (
  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-3">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0" style={{ backgroundColor: iconBg }}>
        <Icon size={20} strokeWidth={1.8} />
      </div>
    </div>
    <p className="text-xs text-gray-400 font-medium mb-1">{label}</p>
    <p className="text-2xl font-bold text-gray-800 mb-3">{value}</p>
    <button onClick={onLinkClick} className="flex items-center gap-1 text-xs font-semibold text-orange-500 hover:underline">
      {link} <ArrowRight size={11} />
    </button>
  </div>
);

const NavItem = ({ icon: Icon, label, badge, active, onClick, chevron }) => (
  <div onClick={onClick}
    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl cursor-pointer transition-all group
      ${active ? "bg-orange-50 text-orange-600" : "text-gray-500 hover:bg-orange-50 hover:text-orange-600"}`}>
    <Icon size={17} strokeWidth={1.8} className={active ? "text-orange-500" : "text-gray-400 group-hover:text-orange-400"} />
    <span className="text-sm font-medium flex-1">{label}</span>
    {badge && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-orange-500 text-white">{badge}</span>}
    {chevron !== undefined && (
      <ChevronDown size={13} className={`text-gray-400 transition-transform duration-200 ${chevron ? "rotate-180" : ""}`} />
    )}
  </div>
);

const PAGE_TITLES = {
  null:            { title: "Admin Dashboard",  crumb: "Admin Dashboard"  },
  list:            { title: "Employee List",    crumb: "Employee List"    },
  department:      { title: "Department",       crumb: "Department"       },
  designation:     { title: "Designation",      crumb: "Designation"      },
  policies:        { title: "Policies",         crumb: "Policies"         },
  details:         { title: "Employee Details", crumb: "Employee Details" },
  clients:         { title: "Clients",          crumb: "Clients"          },
  projects:        { title: "Projects",         crumb: "Projects"         },
  tasks:           { title: "Tasks",            crumb: "Tasks"            },
  taskboard:       { title: "Task Board",       crumb: "Task Board"       },
  shiftschedule:   { title: "Shift Schedule",   crumb: "Shift Schedule"   },
  attendance:      { title: "Attendance Admin", crumb: "Attendance Admin" },
  screenCapture:   { title: "Screen Capture",   crumb: "Screen Capture"   },
  liveStream:      { title: "Live Stream",      crumb: "Live Stream"      },
  appUrls:         { title: "App & URLs",       crumb: "App & URLs"       },
  activity:        { title: "Employee Activity", crumb: "Employee Activity" },
  productivity:    { title: "Productivity Insights", crumb: "Productivity Insights" },
  leaveManagement: { title: "Leave Management", crumb: "Leave Management" },
  payrollSalary:   { title: "Employee Salary",  crumb: "Employee Salary"  },
  payrollPayslip:  { title: "Payslip",          crumb: "Payslip"          },
  PayrollReport:   { title: "Payroll Report",   crumb: "Payroll Report"   },
  tickets:         { title: "Tickets",          crumb: "Tickets"          }, // Added tickets page title
};

// ─── Backdrop ────────────────────────────────────────────────────────────────
const Backdrop = ({ onClick }) => (
  <div className="fixed inset-0 z-40" onClick={onClick} style={{ background: "transparent" }} />
);

// ─── NOTIFICATION PANEL ───────────────────────────────────────────────────────
const notifData = [
  { id: 1, type: "info",    icon: Info,          color: "#3b82f6", bg: "#eff6ff", title: "New shift assigned",        desc: "You have been assigned Morning shift for Mon–Fri.", time: "2 min ago",  unread: true  },
  { id: 2, type: "success", icon: CheckCheck,    color: "#16a34a", bg: "#f0fdf4", title: "Leave request approved",    desc: "Your leave for Apr 22–24 has been approved.",       time: "18 min ago", unread: true  },
  { id: 3, type: "warning", icon: AlertTriangle, color: "#d97706", bg: "#fffbeb", title: "Attendance alert",          desc: "3 employees missed clock-in today.",                 time: "1 hr ago",   unread: true  },
  { id: 4, type: "info",    icon: UserPlus,      color: "#8b5cf6", bg: "#f5f3ff", title: "New employee onboarded",   desc: "Priya Sharma joined the UI/UX team.",               time: "3 hr ago",   unread: false },
  { id: 5, type: "success", icon: CheckCheck,    color: "#16a34a", bg: "#f0fdf4", title: "Project milestone reached", desc: "Alpha release of Project Phoenix completed.",       time: "Yesterday",  unread: false },
  { id: 6, type: "warning", icon: Clock,         color: "#f97316", bg: "#fff7ed", title: "Deadline approaching",      desc: "Project Atlas is due in 2 days.",                   time: "Yesterday",  unread: false },
];

function NotificationPanel({ onClose }) {
  const [notifications, setNotifications] = useState(notifData);
  const [filter, setFilter] = useState("all");
  const unreadCount = notifications.filter(n => n.unread).length;
  const displayed = filter === "unread" ? notifications.filter(n => n.unread) : notifications;
  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  const dismiss = (id) => setNotifications(prev => prev.filter(n => n.id !== id));
  return (
    <>
      <Backdrop onClick={onClose} />
      <div className="fixed top-[58px] right-[44px] z-50 w-[380px] rounded-2xl bg-white border border-gray-100 shadow-2xl overflow-hidden"
        style={{ animation: "slideDown .18s cubic-bezier(.4,0,.2,1)" }}>
        <style>{`@keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}`}</style>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <h3 className="text-sm font-bold text-gray-800">Notifications</h3>
            {unreadCount > 0 && <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{unreadCount}</span>}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && <button onClick={markAllRead} className="text-[11px] text-orange-500 font-semibold hover:underline">Mark all read</button>}
            <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100"><X size={14} /></button>
          </div>
        </div>
        <div className="flex gap-1 px-5 pt-3">
          {["all", "unread"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${filter === f ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>{f}</button>
          ))}
        </div>
        <div className="overflow-y-auto max-h-[380px] px-3 py-3 space-y-1.5">
          {displayed.length === 0 && <div className="text-center py-10 text-gray-400 text-sm">No notifications</div>}
          {displayed.map(n => {
            const NIcon = n.icon;
            return (
              <div key={n.id} className={`relative flex gap-3 p-3 rounded-xl transition-all group cursor-pointer ${n.unread ? "bg-orange-50/60 hover:bg-orange-50" : "hover:bg-gray-50"}`}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: n.bg }}>
                  <NIcon size={16} style={{ color: n.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-xs font-semibold leading-snug ${n.unread ? "text-gray-800" : "text-gray-600"}`}>{n.title}</p>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {n.unread && <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0 mt-0.5" />}
                      <span className="text-[10px] text-gray-400 whitespace-nowrap">{n.time}</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5 leading-snug line-clamp-2">{n.desc}</p>
                </div>
                <button onClick={(e) => { e.stopPropagation(); dismiss(n.id); }}
                  className="absolute top-2 right-2 w-5 h-5 rounded-md flex items-center justify-center text-gray-300 hover:text-gray-500 hover:bg-gray-200 opacity-0 group-hover:opacity-100 transition-all">
                  <X size={10} />
                </button>
              </div>
            );
          })}
        </div>
        <div className="border-t border-gray-100 px-5 py-3">
          <button className="w-full text-center text-xs font-semibold text-orange-500 hover:underline">View all notifications</button>
        </div>
      </div>
    </>
  );
}

// ─── MAIL PANEL ───────────────────────────────────────────────────────────────
const mailData = [
  { id: 1, from: "HR Department",   avatar: "HR", avatarBg: "#6366f1", subject: "Q2 Performance Reviews",    preview: "Please complete the Q2 reviews by April 30th for all direct reports...", time: "9:15 AM",   unread: true,  starred: true  },
  { id: 2, from: "Priya Sharma",    avatar: "PS", avatarBg: "#14b8a6", subject: "Re: Onboarding checklist",  preview: "Hi, I have completed all the tasks in the checklist. Could you please verify?", time: "8:42 AM",   unread: true,  starred: false },
  { id: 3, from: "System Alert",    avatar: "SA", avatarBg: "#f97316", subject: "Server maintenance notice", preview: "Scheduled downtime: Sunday Apr 27 02:00–04:00 AM UTC. Plan accordingly.",  time: "Yesterday", unread: true,  starred: false },
  { id: 4, from: "Finance Team",    avatar: "FT", avatarBg: "#ec4899", subject: "March payroll processed",   preview: "March salaries have been disbursed. Please check your accounts.",            time: "Yesterday", unread: false, starred: true  },
  { id: 5, from: "Daniel Esbella",  avatar: "DE", avatarBg: "#8b5cf6", subject: "Design review feedback",    preview: "I have reviewed the new dashboard mockups. Overall looks great, a few tweaks...", time: "Apr 18", unread: false, starred: false },
  { id: 6, from: "Client: Acme Co", avatar: "AC", avatarBg: "#ef4444", subject: "Project deadline extension", preview: "We'd like to request a 2-week extension on the Atlas project delivery.", time: "Apr 17",    unread: false, starred: false },
];

function MailPanel({ onClose }) {
  const [mails, setMails] = useState(mailData);
  const [selected, setSelected] = useState(null);
  const [folder, setFolder] = useState("inbox");
  const unreadCount = mails.filter(m => m.unread).length;
  const toggleStar = (id, e) => { e.stopPropagation(); setMails(prev => prev.map(m => m.id === id ? { ...m, starred: !m.starred } : m)); };
  const openMail = (mail) => { setSelected(mail); setMails(prev => prev.map(m => m.id === mail.id ? { ...m, unread: false } : m)); };
  return (
    <>
      <Backdrop onClick={onClose} />
      <div className="fixed top-[58px] right-[84px] z-50 w-[420px] rounded-2xl bg-white border border-gray-100 shadow-2xl overflow-hidden"
        style={{ animation: "slideDown .18s cubic-bezier(.4,0,.2,1)" }}>
        <style>{`@keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}`}</style>
        {selected ? (
          <div>
            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
              <button onClick={() => setSelected(null)} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100"><ChevronRight size={14} className="rotate-180" /></button>
              <h3 className="text-sm font-bold text-gray-800 flex-1 truncate">{selected.subject}</h3>
              <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100"><X size={14} /></button>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ backgroundColor: selected.avatarBg }}>{selected.avatar}</div>
                <div><p className="text-sm font-semibold text-gray-800">{selected.from}</p><p className="text-xs text-gray-400">to me · {selected.time}</p></div>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed mb-5">{selected.preview} Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
              <div className="flex gap-2">
                <button className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 text-white rounded-lg text-xs font-semibold hover:bg-orange-600"><Send size={11} /> Reply</button>
                <button className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-xs font-semibold hover:bg-gray-50"><Archive size={11} /> Archive</button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <h3 className="text-sm font-bold text-gray-800">Messages</h3>
                {unreadCount > 0 && <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{unreadCount}</span>}
              </div>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1 text-xs font-semibold text-orange-500 bg-orange-50 px-3 py-1.5 rounded-lg hover:bg-orange-100"><Plus size={11} /> Compose</button>
                <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100"><X size={14} /></button>
              </div>
            </div>
            <div className="flex gap-1 px-4 pt-3">
              {[{ id: "inbox", label: "Inbox", count: mails.filter(m => m.unread).length }, { id: "starred", label: "Starred", count: mails.filter(m => m.starred).length }, { id: "sent", label: "Sent", count: 0 }].map(f => (
                <button key={f.id} onClick={() => setFolder(f.id)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${folder === f.id ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                  {f.label}
                  {f.count > 0 && <span className={`text-[9px] font-bold px-1.5 py-px rounded-full ${folder === f.id ? "bg-white/20 text-white" : "bg-orange-100 text-orange-600"}`}>{f.count}</span>}
                </button>
              ))}
            </div>
            <div className="overflow-y-auto max-h-[380px] px-3 py-3 space-y-1">
              {(folder === "starred" ? mails.filter(m => m.starred) : mails).map(mail => (
                <div key={mail.id} onClick={() => openMail(mail)}
                  className={`flex gap-3 p-3 rounded-xl cursor-pointer transition-all group ${mail.unread ? "bg-orange-50/50 hover:bg-orange-50" : "hover:bg-gray-50"}`}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ backgroundColor: mail.avatarBg }}>{mail.avatar}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <p className={`text-xs font-semibold truncate ${mail.unread ? "text-gray-800" : "text-gray-500"}`}>{mail.from}</p>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[10px] text-gray-400">{mail.time}</span>
                        <button onClick={(e) => toggleStar(mail.id, e)} className={`transition-colors ${mail.starred ? "text-amber-400" : "text-gray-300 hover:text-amber-400"}`}>
                          <Star size={11} fill={mail.starred ? "currentColor" : "none"} />
                        </button>
                      </div>
                    </div>
                    <p className={`text-[11px] truncate mb-0.5 ${mail.unread ? "text-gray-700 font-medium" : "text-gray-500"}`}>{mail.subject}</p>
                    <p className="text-[10px] text-gray-400 truncate">{mail.preview}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 px-5 py-3">
              <button className="w-full text-center text-xs font-semibold text-orange-500 hover:underline">Open full inbox</button>
            </div>
          </>
        )}
      </div>
    </>
  );
}

// ─── APP SWITCHER PANEL ───────────────────────────────────────────────────────
const appList = [
  { name: "Dashboard",  icon: LayoutDashboard, color: "#f97316", bg: "#fff7ed" },
  { name: "Employees",  icon: Users,           color: "#6366f1", bg: "#eef2ff" },
  { name: "Projects",   icon: FolderOpen,      color: "#14b8a6", bg: "#f0fdfa" },
  { name: "Attendance", icon: ClipboardList,   color: "#ec4899", bg: "#fdf2f8" },
  { name: "Shifts",     icon: CalendarClock,   color: "#8b5cf6", bg: "#f5f3ff" },
  { name: "Clients",    icon: Briefcase,       color: "#0ea5e9", bg: "#f0f9ff" },
  { name: "Analytics",  icon: BarChart2,       color: "#22c55e", bg: "#f0fdf4" },
  { name: "Activity",   icon: Activity,        color: "#ef4444", bg: "#fef2f2" },
  { name: "Settings",   icon: Settings,        color: "#64748b", bg: "#f8fafc" },
];

function AppSwitcherPanel({ onClose }) {
  return (
    <>
      <Backdrop onClick={onClose} />
      <div className="fixed top-[58px] right-[124px] z-50 w-[300px] rounded-2xl bg-white border border-gray-100 shadow-2xl overflow-hidden"
        style={{ animation: "slideDown .18s cubic-bezier(.4,0,.2,1)" }}>
        <style>{`@keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}`}</style>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-bold text-gray-800">Apps</h3>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100"><X size={14} /></button>
        </div>
        <div className="p-4 grid grid-cols-3 gap-2">
          {appList.map(app => {
            const AppIcon = app.icon;
            return (
              <button key={app.name} className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 transition-all active:scale-95 cursor-pointer border border-transparent hover:border-gray-100">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: app.bg }}>
                  <AppIcon size={20} style={{ color: app.color }} strokeWidth={1.8} />
                </div>
                <span className="text-[10px] font-semibold text-gray-600 text-center leading-tight">{app.name}</span>
              </button>
            );
          })}
        </div>
        <div className="border-t border-gray-100 px-5 py-3">
          <button className="w-full text-center text-xs font-semibold text-orange-500 hover:underline">Manage apps</button>
        </div>
      </div>
    </>
  );
}

// ─── SETTINGS DRAWER ─────────────────────────────────────────────────────────
const settingsSections = [
  { title: "Appearance", items: [
    { label: "Theme", desc: "Choose your preferred color scheme", type: "toggle-group", options: ["Light", "Dark", "System"], value: "Light" },
    { label: "Sidebar compact mode", desc: "Show icons only in sidebar", type: "toggle", value: false },
    { label: "Dense layout", desc: "Reduce spacing for more content", type: "toggle", value: false },
  ]},
  { title: "Notifications", items: [
    { label: "Email notifications", desc: "Receive updates via email", type: "toggle", value: true  },
    { label: "Push notifications",  desc: "Browser push alerts",       type: "toggle", value: true  },
    { label: "Shift reminders",     desc: "Remind 15 min before shift", type: "toggle", value: false },
  ]},
  { title: "Privacy & Security", items: [
    { label: "Two-factor auth",  desc: "Add an extra layer of security", type: "toggle", value: true  },
    { label: "Session timeout",  desc: "Auto-logout after 30 min idle",  type: "toggle", value: false },
    { label: "Activity log",     desc: "Track all admin actions",         type: "toggle", value: true  },
  ]},
];

function SettingsDrawer({ onClose }) {
  const [vals, setVals] = useState(() => {
    const flat = {};
    settingsSections.forEach(s => s.items.forEach(i => { flat[i.label] = i.value; }));
    return flat;
  });
  const [themeVal, setThemeVal] = useState("Light");
  const toggle = (label) => setVals(prev => ({ ...prev, [label]: !prev[label] }));
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]" onClick={onClose} style={{ animation: "fadeIn .2s ease" }} />
      <div className="fixed top-0 right-0 h-full z-50 w-[360px] bg-white shadow-2xl flex flex-col"
        style={{ animation: "slideRight .22s cubic-bezier(.4,0,.2,1)" }}>
        <style>{`@keyframes slideRight{from{opacity:0;transform:translateX(32px)}to{opacity:1;transform:translateX(0)}}@keyframes fadeIn{from{opacity:0}to{opacity:1}}`}</style>
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gray-900 flex items-center justify-center"><Settings size={15} className="text-white" /></div>
            <h3 className="text-sm font-bold text-gray-800">Settings</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-100"><X size={15} /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {settingsSections.map(section => (
            <div key={section.title}>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">{section.title}</p>
              <div className="space-y-3">
                {section.items.map(item => (
                  <div key={item.label} className="flex items-center justify-between gap-4 p-3.5 bg-gray-50 rounded-xl hover:bg-gray-100/80 transition-colors">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-gray-700">{item.label}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{item.desc}</p>
                    </div>
                    {item.type === "toggle-group" ? (
                      <div className="flex bg-gray-200 rounded-lg p-0.5 shrink-0">
                        {item.options.map(opt => (
                          <button key={opt} onClick={() => setThemeVal(opt)}
                            className={`px-2 py-1 rounded-md text-[10px] font-semibold transition-all ${themeVal === opt ? "bg-white text-gray-800 shadow-sm" : "text-gray-500"}`}>
                            {opt}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <button onClick={() => toggle(item.label)}
                        className={`relative rounded-full transition-colors shrink-0 ${vals[item.label] ? "bg-orange-500" : "bg-gray-300"}`}
                        style={{ height: "22px", minWidth: "40px" }}>
                        <span className={`absolute top-0.5 w-[18px] h-[18px] rounded-full bg-white shadow transition-transform ${vals[item.label] ? "translate-x-[20px]" : "translate-x-0.5"}`} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Account</p>
            <div className="flex items-center gap-3 p-3.5 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white font-bold text-sm shrink-0">A</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-800">Admin</p>
                <p className="text-[10px] text-gray-400 truncate">admin@mindcarve.com</p>
              </div>
              <button className="text-xs font-semibold text-orange-500 hover:underline shrink-0">Edit</button>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-100">
          <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-gray-800 transition-colors">Save changes</button>
        </div>
      </div>
    </>
  );
}

// ─── REFRESH HOOK ─────────────────────────────────────────────────────────────
function useRefreshButton() {
  const [spinning, setSpinning] = useState(false);
  const trigger = () => { if (spinning) return; setSpinning(true); setTimeout(() => setSpinning(false), 900); };
  return { spinning, trigger };
}

// ─── CALENDAR PANEL ───────────────────────────────────────────────────────────
const events = [
  { date: "Mon, Apr 21", title: "Shift review meeting",      time: "10:00 AM", color: "#f97316", tag: "Meeting"  },
  { date: "Mon, Apr 21", title: "New hire onboarding",       time: "02:00 PM", color: "#6366f1", tag: "HR"       },
  { date: "Tue, Apr 22", title: "Project Atlas demo",        time: "11:30 AM", color: "#14b8a6", tag: "Project"  },
  { date: "Wed, Apr 23", title: "Performance review – Dev",  time: "09:00 AM", color: "#8b5cf6", tag: "Review"   },
  { date: "Thu, Apr 24", title: "Client call – Acme Co.",    time: "03:30 PM", color: "#ec4899", tag: "Client"   },
  { date: "Fri, Apr 25", title: "Q2 planning retrospective", time: "10:00 AM", color: "#22c55e", tag: "Planning" },
];

function CalendarPanel({ onClose }) {
  const days = ["S", "M", "T", "W", "T", "F", "S"];
  const today = 20;
  const dates = Array.from({ length: 30 }, (_, i) => i + 1);
  return (
    <>
      <Backdrop onClick={onClose} />
      <div className="fixed top-[58px] right-4 z-50 w-[340px] rounded-2xl bg-white border border-gray-100 shadow-2xl overflow-hidden"
        style={{ animation: "slideDown .18s cubic-bezier(.4,0,.2,1)" }}>
        <style>{`@keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}`}</style>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-bold text-gray-800">Calendar</h3>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1 text-xs font-semibold text-orange-500 bg-orange-50 px-3 py-1.5 rounded-lg hover:bg-orange-100"><Plus size={11} /> Event</button>
            <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100"><X size={14} /></button>
          </div>
        </div>
        <div className="px-5 py-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-gray-800">April 2026</span>
            <div className="flex gap-1">
              <button className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100"><ChevronRight size={12} className="rotate-180" /></button>
              <button className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100"><ChevronRight size={12} /></button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-1">
            {days.map((d, i) => <div key={i} className="text-center text-[10px] font-bold text-gray-400 py-1">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {[0, 1, 2].map(i => <div key={`e${i}`} />)}
            {dates.map(d => (
              <button key={d} className={`text-center text-[11px] font-semibold py-1.5 rounded-lg transition-all ${d === today ? "bg-orange-500 text-white" : "text-gray-600 hover:bg-orange-50 hover:text-orange-500"}`}>{d}</button>
            ))}
          </div>
        </div>
        <div className="border-t border-gray-100 px-5 pb-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest py-3">Upcoming</p>
          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            {events.map((ev, i) => (
              <div key={i} className="flex gap-3 items-start p-2.5 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="w-1 h-10 rounded-full shrink-0" style={{ backgroundColor: ev.color }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-xs font-semibold text-gray-700 truncate">{ev.title}</p>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0" style={{ backgroundColor: `${ev.color}18`, color: ev.color }}>{ev.tag}</span>
                  </div>
                  <p className="text-[10px] text-gray-400">{ev.date} · {ev.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

// ─── PROFILE PANEL ────────────────────────────────────────────────────────────
function ProfilePanel({ onClose, displayName, onLogout, loggingOut }) {
  const menuItems = [
    { icon: UserCircle, label: "My Profile",       desc: "View & edit profile"    },
    { icon: Settings,   label: "Account Settings", desc: "Preferences & security" },
    { icon: Bell,       label: "Notifications",    desc: "Manage alerts"          },
    { icon: Shield,     label: "Privacy",          desc: "Data & permissions"     },
  ];
  return (
    <>
      <Backdrop onClick={onClose} />
      <div className="fixed top-[58px] right-4 z-50 w-[280px] rounded-2xl bg-white border border-gray-100 shadow-2xl overflow-hidden"
        style={{ animation: "slideDown .18s cubic-bezier(.4,0,.2,1)" }}>
        <style>{`@keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}`}</style>
        <div className="px-5 pt-5 pb-4 bg-gradient-to-br from-orange-50 to-pink-50 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white text-lg font-bold shadow-sm">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">{displayName}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                <p className="text-[10px] text-gray-500">Administrator · Online</p>
              </div>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            {[{ v: "47", l: "Tasks" }, { v: "12", l: "Projects" }, { v: "99%", l: "Uptime" }].map(({ v, l }) => (
              <div key={l} className="flex-1 text-center bg-white/70 rounded-xl py-2">
                <p className="text-sm font-bold text-gray-800">{v}</p>
                <p className="text-[9px] text-gray-500 font-medium">{l}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="px-3 py-3 space-y-1">
          {menuItems.map(item => {
            const PIcon = item.icon;
            return (
              <button key={item.label} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-orange-50 transition-colors text-left group">
                <div className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-orange-100 flex items-center justify-center transition-colors">
                  <PIcon size={14} className="text-gray-500 group-hover:text-orange-500" strokeWidth={1.8} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-700">{item.label}</p>
                  <p className="text-[10px] text-gray-400">{item.desc}</p>
                </div>
                <ChevronRight size={12} className="text-gray-300 ml-auto" />
              </button>
            );
          })}
        </div>
        <div className="px-3 pb-3 border-t border-gray-100 pt-2">
          <button onClick={onLogout} disabled={loggingOut}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 transition-colors disabled:opacity-60">
            {loggingOut ? <Loader2 size={13} className="animate-spin" /> : <LogOut size={13} />}
            {loggingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
      </div>
    </>
  );
}

// ─── TOOLTIP ─────────────────────────────────────────────────────────────────
function Tooltip({ label, children }) {
  return (
    <div className="relative group">
      {children}
      <span className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-30 font-medium shadow-lg">
        {label}
      </span>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [sidebarOpen,          setSidebarOpen]          = useState(true);
  const [settingsOpen,         setSettingsOpen]         = useState(false);
  const [loggingOut,           setLoggingOut]           = useState(false);
  const [employeeDropdownOpen, setEmployeeDropdownOpen] = useState(false);
  const [projectsDropdownOpen, setProjectsDropdownOpen] = useState(false);
  const [payrollDropdownOpen,  setPayrollDropdownOpen]  = useState(false);
  const [activePage, setActivePage] = useState(() => {
    if (typeof window !== "undefined") return localStorage.getItem("admin_active_page") || null;
    return null;
  });
  const [showAddProject,   setShowAddProject]   = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [openPanel, setOpenPanel] = useState(null);
  const { spinning, trigger: triggerRefresh } = useRefreshButton();

  // ── API stats ──
  const { stats, loading: statsLoading, error: statsError, refetch: refetchStats } = useDashboardStats();

  let user    = { name: "Admin", role: "admin", email: "" };
  let company = { name: "Mindcarve Organization", domain: "" };
  try {
    const u = localStorage.getItem("auth_user");
    const c = localStorage.getItem("auth_company");
    if (u) user    = JSON.parse(u);
    if (c) company = JSON.parse(c);
  } catch (_) {}
  const displayName = user.name || user.username || "Admin";

  const togglePanel = (name) => setOpenPanel(prev => prev === name ? null : name);
  const closePanel  = () => setOpenPanel(null);

  const navigate = (page) => {
    setActivePage(page);
    setSelectedEmployee(null);
    if (typeof window !== "undefined") {
      if (page === null) localStorage.removeItem("admin_active_page");
      else               localStorage.setItem("admin_active_page", page);
    }
  };

  const handleViewEmployeeDetails = (emp) => {
    setSelectedEmployee(emp);
    setActivePage("details");
    localStorage.setItem("admin_active_page", "details");
  };

  const handleBackToEmployeeList = () => {
    setActivePage("list");
    setSelectedEmployee(null);
    localStorage.setItem("admin_active_page", "list");
  };

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      const token = localStorage.getItem("admin_auth_token");
      await fetch("https://gerda-anthropopathic-aurora.ngrok-free.dev/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json", Accept: "application/json",
          "ngrok-skip-browser-warning": "true",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
    } catch (_) {}
    finally {
      ["admin_auth_token", "auth_user", "auth_company", "auth_payload", "admin_active_page"].forEach(k => localStorage.removeItem(k));
      window.location.replace("/auth/signup");
    }
  };

  const isEmployeePage   = ["list", "department", "designation", "policies", "details"].includes(activePage);
  const isProjectsPage   = ["clients", "projects", "tasks", "taskboard"].includes(activePage);
  const isPayrollPage    = ["payrollSalary", "payrollPayslip", "PayrollReport"].includes(activePage);
  const isShiftPage      = activePage === "shiftschedule";
  const isAttendancePage = activePage === "attendance";
  const isDashboard      = activePage === null;
  const pageInfo         = PAGE_TITLES[activePage] ?? PAGE_TITLES[null];

  useEffect(() => { if (isPayrollPage) setPayrollDropdownOpen(true); }, [isPayrollPage]);

  // ─── renderMainContent ──────────────────────────────────────────────────────
  const renderMainContent = () => {
    switch (activePage) {
      case "list":          return <EmployeeList onViewDetails={handleViewEmployeeDetails} />;
      case "department":    return <Department />;
      case "designation":   return <Designation />;
      case "policies":      return <Policies />;
      case "details":       return selectedEmployee ? <EmployeeDetails employee={selectedEmployee} onBack={handleBackToEmployeeList} /> : null;
      case "clients":       return <ClientList />;
      case "projects":      return <ProjectsGrid />;
      case "tasks":         return <TasksPage />;
      case "taskboard":     return <TaskBoardPage />;
      case "shiftschedule": return <ShiftSchedule />;
      case "attendance":    return <AttendancePage />;
      case "screenCapture": return <ScreenCapture />;
      case "liveStream":    return <Livestream />;
      case "appUrls":       return <AppsUrls />;
      case "leaveManagement": return <LeaveManagement />;
      case "payrollSalary":  return <EmployeeSalaryPage ACCENT="#f97316" />;
      case "payrollPayslip": return <PayslipPage ACCENT="#f97316" />;
      case "PayrollReport":  return <PayrollReport ACCENT="#f97316" />;
      case "activity":       return <ActivityPage />;
      case "productivity":   return <ProductivityPage />;
      case "tickets":        return <TicketsPage />; // Added tickets page rendering
      default: return renderDashboard();
    }
  };

  // ─── renderDashboard ────────────────────────────────────────────────────────
  const renderDashboard = () => {
    const att   = stats?.attendance_overview      ?? {};
    const proj  = stats?.project_stats            ?? {};
    const cli   = stats?.client_stats             ?? {};
    const task  = stats?.task_stats               ?? {};
    const empSt = stats?.employee_status          ?? {};
    const depts = stats?.employees_by_department  ?? [];
    const clock = stats?.recent_clock_records     ?? [];

    const totalEmp = att.total_employees ?? 0;
    const present  = att.present  ?? 0;
    const halfDay  = att.half_day ?? 0;
    const late     = att.late     ?? 0;
    const absent   = att.absent   ?? 0;

    const toP = (v) => totalEmp > 0 ? Math.round((v / totalEmp) * 100) : 0;
    const presentP  = toP(present);
    const halfDayP  = toP(halfDay);
    const lateP     = toP(late);
    const absentP   = toP(absent);

    const deptMax = depts.length > 0 ? Math.max(...depts.map(d => d.count), 1) : 1;

    const AVATAR_COLORS = ["#6366f1", "#14b8a6", "#f97316", "#ec4899", "#8b5cf6", "#22c55e", "#ef4444", "#0ea5e9"];

    return (
      <>
        {/* ── Welcome Banner ── */}
        <div className="bg-white rounded-2xl p-5 mb-6 flex items-center justify-between border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white text-xl font-bold shrink-0">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                Welcome Back, {displayName} <BadgeCheck size={18} className="text-orange-400" />
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {statsLoading
                  ? "Loading your data…"
                  : <>You have <span className="text-orange-500 font-semibold">{task.total ?? 0}</span> Total Tasks &amp;{" "}
                    <span className="text-orange-500 font-semibold">{absent}</span> Absent Today</>
                }
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 bg-white hover:bg-gray-50">
              <Calendar size={15} className="text-gray-400" /> Add Schedule
            </button>
            <button onClick={() => navigate("list")} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 shadow-sm">
              <Users size={15} /> View Employees
            </button>
          </div>
        </div>

        {statsLoading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={32} className="animate-spin text-orange-400" />
            <span className="ml-3 text-sm text-gray-400 font-medium">Loading dashboard data…</span>
          </div>
        )}

        {!statsLoading && statsError && (
          <div className="flex items-center justify-center gap-3 py-8 bg-red-50 rounded-2xl border border-red-100 mb-6">
            <AlertTriangle size={18} className="text-red-400" />
            <span className="text-sm text-red-500 font-medium">{statsError}</span>
            <button onClick={refetchStats} className="text-xs font-semibold text-red-600 underline ml-2">Retry</button>
          </div>
        )}

        {!statsLoading && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <StatCard icon={UserCheck}  iconBg="#f97316" label="Attendance Overview" value={`${present}/${totalEmp}`}             link="View Details" onLinkClick={() => navigate("attendance")} />
              <StatCard icon={FolderOpen} iconBg="#14b8a6" label="Total Projects"      value={`${proj.completed ?? 0}/${proj.total ?? 0}`} link="View All"     onLinkClick={() => navigate("projects")} />
              <StatCard icon={Globe}      iconBg="#6366f1" label="Total Clients"       value={`${cli.active ?? 0}/${cli.total ?? 0}`}     link="View All"     onLinkClick={() => navigate("clients")} />
              <StatCard icon={CheckSquare} iconBg="#ec4899" label="Total Tasks"        value={`${task.completed ?? 0}/${task.total ?? 0}`} link="View All"     onLinkClick={() => navigate("tasks")} />
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard icon={DollarSign} iconBg="#a855f7" label="Payroll"            value="View"                          link="Go to Payroll" onLinkClick={() => navigate("payrollSalary")} />
              <StatCard icon={TrendingUp} iconBg="#ef4444" label="Total Employees"    value={totalEmp}                      link="View All"      onLinkClick={() => navigate("list")} />
              <StatCard icon={UserCheck}  iconBg="#22c55e" label="Active Employees"   value={empSt.active   ?? "–"}         link="View All"      onLinkClick={() => navigate("list")} />
              <StatCard icon={UserPlus}   iconBg="#1e293b" label="Inactive Employees" value={empSt.inactive ?? "–"}         link="View All"      onLinkClick={() => navigate("list")} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-gray-800">Employee Status</h3>
                  <button className="flex items-center gap-1.5 text-xs text-gray-400 border border-gray-200 rounded-lg px-2.5 py-1">
                    <Calendar size={11} /> Today
                  </button>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500">Total Employees</span>
                  <span className="text-sm font-bold text-gray-800">{totalEmp}</span>
                </div>
                <div className="h-3 rounded-full overflow-hidden flex mb-4">
                  <div className="h-full bg-orange-400" style={{ width: `${presentP}%`  }} />
                  <div className="h-full bg-teal-500"   style={{ width: `${halfDayP}%` }} />
                  <div className="h-full bg-yellow-400" style={{ width: `${lateP}%`    }} />
                  <div className="h-full bg-red-500"    style={{ width: `${absentP}%`  }} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: `Present (${presentP}%)`,  value: present,  color: "#f97316" },
                    { label: `Half Day (${halfDayP}%)`, value: halfDay,  color: "#14b8a6" },
                    { label: `Late (${lateP}%)`,        value: late,     color: "#eab308" },
                    { label: `Absent (${absentP}%)`,    value: absent,   color: "#ef4444" },
                  ].map(item => (
                    <div key={item.label} className="flex items-start gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0 mt-1" style={{ backgroundColor: item.color }} />
                      <div>
                        <p className="text-[11px] text-gray-400">{item.label}</p>
                        <p className="text-lg font-bold text-gray-800">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-gray-800">Attendance Overview</h3>
                  <button className="flex items-center gap-1.5 text-xs text-gray-400 border border-gray-200 rounded-lg px-2.5 py-1">
                    <Calendar size={11} /> Today
                  </button>
                </div>
                <DonutChart present={present} halfDay={halfDay} late={late} absent={absent} total={present} />
              </div>

              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-gray-800">Employees By Department</h3>
                  <button className="flex items-center gap-1.5 text-xs text-gray-400 border border-gray-200 rounded-lg px-2.5 py-1">
                    <Calendar size={11} /> This Week
                  </button>
                </div>
                <div className="space-y-3">
                  {depts.length > 0
                    ? depts.map((d, i) => (
                        <HBar key={d.department} label={d.department} value={d.count} max={deptMax} color={AVATAR_COLORS[i % AVATAR_COLORS.length]} />
                      ))
                    : <p className="text-xs text-gray-400 text-center py-4">No department data</p>
                  }
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mt-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-800">Recent Clock Records</h3>
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-1.5 text-xs text-gray-500 border border-gray-200 rounded-lg px-2.5 py-1">
                    All Departments <ChevronDown size={11} />
                  </button>
                  <button className="flex items-center gap-1.5 text-xs text-gray-500 border border-gray-200 rounded-lg px-2.5 py-1">
                    <Calendar size={11} /> Today
                  </button>
                </div>
              </div>

              {clock.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-6">No recent clock records</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {clock.map((p, i) => {
                    const avatarBg = AVATAR_COLORS[i % AVATAR_COLORS.length];
                    const initials = p.employee_name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
                    const isClockIn = p.type === "in";
                    return (
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ backgroundColor: avatarBg }}>
                            {initials}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-800">{p.employee_name}</p>
                            <p className="text-[11px] text-gray-400">{p.designation}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <div className="flex items-center gap-1.5">
                            <Clock size={12} className="text-gray-400" />
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isClockIn ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}>
                              {p.time}
                            </span>
                          </div>
                          <span className={`text-[9px] font-bold uppercase tracking-wide px-1.5 py-px rounded ${isClockIn ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                            {isClockIn ? "Clock In" : "Clock Out"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </>
    );
  };

  const SubNavItem = ({ icon: SubIcon, label, page }) => (
    <div onClick={() => navigate(page)}
      className={`flex items-center gap-2.5 px-4 py-2 rounded-lg text-xs transition-colors cursor-pointer
        ${activePage === page ? "bg-orange-50 text-orange-600 font-semibold" : "text-gray-600 hover:bg-orange-50 hover:text-orange-600"}`}>
      <SubIcon size={14} strokeWidth={1.8} className={activePage === page ? "text-orange-400" : "text-gray-400"} />
      {label}
    </div>
  );

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="flex h-screen bg-gray-50 overflow-hidden" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
          * { box-sizing: border-box; }
          ::-webkit-scrollbar { width: 4px; }
          ::-webkit-scrollbar-track { background: transparent; }
          ::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 99px; }
        `}</style>

        <aside className={`${sidebarOpen ? "w-60" : "w-0 overflow-hidden"} shrink-0 bg-white border-r border-gray-100 flex flex-col transition-all duration-300`}>
          <div className="flex items-center gap-2.5 px-5 py-5 border-b border-gray-100 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white font-black text-sm">S</div>
            <span className="font-extrabold text-gray-800 text-lg tracking-tight">Mindcarve</span>
          </div>

          <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4 mb-2">Main Menu</p>
            <NavItem icon={LayoutDashboard} label="Dashboard" badge="Hot" active={isDashboard} onClick={() => navigate(null)} />

            <div>
              <NavItem icon={Users} label="Employees" active={isEmployeePage} chevron={employeeDropdownOpen} onClick={() => setEmployeeDropdownOpen(p => !p)} />
              <div className={`overflow-hidden transition-all duration-200 ${employeeDropdownOpen ? "max-h-60 opacity-100" : "max-h-0 opacity-0"}`}>
                <div className="ml-4 mt-1 border-l-2 border-gray-100 pl-3 pb-1 space-y-1">
                  <SubNavItem icon={Users}      label="Employee List" page="list"        />
                  <SubNavItem icon={Building2}  label="Department"   page="department"   />
                  <SubNavItem icon={BadgeCheck} label="Designation"  page="designation"  />
                  <SubNavItem icon={FileText}   label="Policies"     page="policies"     />
                </div>
              </div>
            </div>

            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4 mt-5 mb-2">Projects</p>
            <NavItem icon={Users} label="Clients" active={activePage === "clients"} onClick={() => navigate("clients")} />
            <div>
              <NavItem icon={FolderOpen} label="Projects" active={isProjectsPage && activePage !== "clients"} chevron={projectsDropdownOpen} onClick={() => setProjectsDropdownOpen(p => !p)} />
              <div className={`overflow-hidden transition-all duration-200 ${projectsDropdownOpen ? "max-h-60 opacity-100" : "max-h-0 opacity-0"}`}>
                <div className="ml-4 mt-1 border-l-2 border-gray-100 pl-3 pb-1 space-y-1">
                  <SubNavItem icon={LayoutGrid} label="Projects"   page="projects"  />
                  <SubNavItem icon={ListTodo}   label="Tasks"      page="tasks"     />
                  <SubNavItem icon={Kanban}     label="Task Board" page="taskboard" />
                </div>
              </div>
            </div>

            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4 mt-5 mb-2">Attendance</p>
            <NavItem icon={ClipboardList} label="Attendance"      active={isAttendancePage}              onClick={() => navigate("attendance")}      />
            <NavItem icon={CalendarClock} label="Shift Schedule"  active={isShiftPage}                   onClick={() => navigate("shiftschedule")}   />
            <NavItem icon={CalendarClock} label="Leave Management" active={activePage === "leaveManagement"} onClick={() => navigate("leaveManagement")} />

            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4 mt-5 mb-2">Payroll</p>
            <div>
              <NavItem icon={DollarSign} label="Payroll" active={isPayrollPage} chevron={payrollDropdownOpen} onClick={() => setPayrollDropdownOpen(p => !p)} />
              <div className={`overflow-hidden transition-all duration-200 ${payrollDropdownOpen ? "max-h-60 opacity-100" : "max-h-0 opacity-0"}`}>
                <div className="ml-4 mt-1 border-l-2 border-gray-100 pl-3 pb-1 space-y-1">
                  <SubNavItem icon={Users}    label="Employee Salary" page="payrollSalary"  />
                  <SubNavItem icon={FileText} label="Payslip"         page="payrollPayslip" />
                  <SubNavItem icon={Package}  label="Payroll Report"  page="PayrollReport"  />
                </div>
              </div>
            </div>

            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4 mt-5 mb-2">Features</p>
            <NavItem icon={Video}      label="Screen Capture" active={activePage === "screenCapture"} onClick={() => navigate("screenCapture")} />
            <NavItem icon={Radio}      label="Live Stream"    active={activePage === "liveStream"}    onClick={() => navigate("liveStream")}    />
            <NavItem icon={Link}       label="App & URLs"     active={activePage === "appUrls"}       onClick={() => navigate("appUrls")}       />
            <NavItem icon={Activity}   label="Activity"       active={activePage === "activity"}      onClick={() => navigate("activity")}      />
            <NavItem icon={TrendingUp} label="Productivity"   active={activePage === "productivity"}  onClick={() => navigate("productivity")}  />

            <div className="mt-4">
              <NavItem icon={Settings} label="Settings" chevron={settingsOpen} active={settingsOpen} onClick={() => setSettingsOpen(v => !v)} />
              <div className={`overflow-hidden transition-all duration-200 ${settingsOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}`}>
                <div className="ml-4 mt-1 border-l-2 border-gray-100 pl-3 pb-1 space-y-1">
                  {/* Tickets added below Settings */}
                  <SubNavItem icon={Ticket} label="Tickets" page="tickets" />
                  <button onClick={handleLogout} disabled={loggingOut}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl cursor-pointer transition-all text-red-500 hover:bg-red-50 disabled:opacity-60 group">
                    {loggingOut ? <Loader2 size={15} className="animate-spin" /> : <LogOut size={15} />}
                    <span className="text-sm font-semibold">{loggingOut ? "Logging out…" : "Logout"}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <div className="flex-1 flex flex-col overflow-hidden">

          <header className="h-14 bg-white border-b border-gray-100 flex items-center px-5 gap-4 shrink-0 relative z-30">
            <button onClick={() => setSidebarOpen(v => !v)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-all active:scale-95">
              <Menu size={17} strokeWidth={1.8} />
            </button>
            <div className="flex-1 max-w-xs flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 border border-gray-200 hover:border-orange-300 transition-colors">
              <Search size={13} className="text-gray-400 shrink-0" />
              <input placeholder="Search in HRMS" className="bg-transparent text-xs outline-none text-gray-500 w-full" />
              <span className="text-[10px] text-gray-400 bg-gray-200 px-1.5 py-0.5 rounded font-mono shrink-0">⌘/</span>
            </div>
            <div className="flex items-center gap-1 ml-auto">
              <Tooltip label="App switcher">
                <button onClick={() => togglePanel("appswitcher")}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all active:scale-95 ${openPanel === "appswitcher" ? "bg-orange-50 text-orange-500" : "text-gray-400 hover:bg-gray-100 hover:text-gray-700"}`}>
                  <LayoutGrid size={15} strokeWidth={1.8} />
                </button>
              </Tooltip>
              <Tooltip label="Settings">
                <button onClick={() => togglePanel("settings")}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all active:scale-95 ${openPanel === "settings" ? "bg-orange-50 text-orange-500" : "text-gray-400 hover:bg-gray-100 hover:text-gray-700"}`}>
                  <Settings size={15} strokeWidth={1.8} />
                </button>
              </Tooltip>
              <div className="w-px h-5 bg-gray-200 mx-1" />
              <Tooltip label="Refresh">
                <button onClick={() => { triggerRefresh(); refetchStats(); }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-all active:scale-95">
                  <RefreshCw size={14} strokeWidth={1.8} className={spinning ? "animate-spin text-orange-500" : ""} />
                </button>
              </Tooltip>
              <Tooltip label="Messages">
                <button onClick={() => togglePanel("mail")}
                  className={`relative w-8 h-8 rounded-lg flex items-center justify-center transition-all active:scale-95 ${openPanel === "mail" ? "bg-orange-50 text-orange-500" : "text-gray-400 hover:bg-gray-100 hover:text-gray-700"}`}>
                  <Mail size={15} strokeWidth={1.8} />
                  <span className="absolute top-1 right-1 bg-orange-500 text-white text-[8px] font-bold px-1 py-px rounded-full border-[1.5px] border-white leading-none min-w-[13px] text-center">3</span>
                </button>
              </Tooltip>
              <Tooltip label="Notifications">
                <button onClick={() => togglePanel("notifications")}
                  className={`relative w-8 h-8 rounded-lg flex items-center justify-center transition-all active:scale-95 ${openPanel === "notifications" ? "bg-orange-50 text-orange-500" : "text-gray-400 hover:bg-gray-100 hover:text-gray-700"}`}>
                  <Bell size={15} strokeWidth={1.8} />
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-orange-500 rounded-full border border-white" />
                </button>
              </Tooltip>
              <Tooltip label="Calendar">
                <button onClick={() => togglePanel("calendar")}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all active:scale-95 ${openPanel === "calendar" ? "bg-orange-50 text-orange-500" : "text-gray-400 hover:bg-gray-100 hover:text-gray-700"}`}>
                  <Calendar size={15} strokeWidth={1.8} />
                </button>
              </Tooltip>
              <Tooltip label="My Profile">
                <button onClick={() => togglePanel("profile")}
                  className={`w-8 h-8 rounded-[10px] bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white text-xs font-bold ml-2 transition-all active:scale-95 ${openPanel === "profile" ? "ring-2 ring-orange-400 ring-offset-1 scale-105" : "hover:ring-2 hover:ring-orange-300 hover:ring-offset-1 hover:scale-105"}`}>
                  {displayName.charAt(0).toUpperCase()}
                </button>
              </Tooltip>
            </div>
          </header>

          {openPanel === "notifications" && <NotificationPanel onClose={closePanel} />}
          {openPanel === "mail"          && <MailPanel onClose={closePanel} />}
          {openPanel === "appswitcher"   && <AppSwitcherPanel onClose={closePanel} />}
          {openPanel === "settings"      && <SettingsDrawer onClose={closePanel} />}
          {openPanel === "calendar"      && <CalendarPanel onClose={closePanel} />}
          {openPanel === "profile"       && <ProfilePanel onClose={closePanel} displayName={displayName} onLogout={handleLogout} loggingOut={loggingOut} />}

          <main className="flex-1 overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h1 className="text-xl font-bold text-gray-800">{pageInfo.title}</h1>
                <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-0.5">
                  <Home size={11} /><ChevronRight size={11} /><span>Dashboard</span>
                  <ChevronRight size={11} /><span className="text-gray-600 font-medium">{pageInfo.crumb}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 bg-white hover:bg-gray-50">
                  <Upload size={13} className="text-gray-400" /> Export <ChevronDown size={11} className="text-gray-400" />
                </button>
                <button className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 bg-white hover:bg-gray-50">
                  <Calendar size={13} className="text-gray-400" /> Jan 2025 <ChevronDown size={11} className="text-gray-400" />
                </button>
                {activePage === "projects" && (
                  <button onClick={() => setShowAddProject(true)} className="flex items-center gap-1.5 px-3 py-2 bg-orange-500 text-white rounded-lg text-xs font-semibold hover:bg-orange-600 shadow-sm">
                    <Plus size={13} /> Add Project
                  </button>
                )}
                {(activePage === "tasks" || activePage === "taskboard") && (
                  <button className="flex items-center gap-1.5 px-3 py-2 bg-orange-500 text-white rounded-lg text-xs font-semibold hover:bg-orange-600 shadow-sm">
                    <Plus size={13} /> {activePage === "tasks" ? "Add Task" : "Add Board"}
                  </button>
                )}
                {activePage === "attendance" && (
                  <button className="flex items-center gap-1.5 px-3 py-2 bg-orange-500 text-white rounded-lg text-xs font-semibold hover:bg-orange-600 shadow-sm">
                    <FileText size={13} /> Report
                  </button>
                )}
                {activePage === "payrollSalary" && (
                  <button className="flex items-center gap-1.5 px-3 py-2 bg-orange-500 text-white rounded-lg text-xs font-semibold hover:bg-orange-600 shadow-sm">
                    <Plus size={13} /> Add Salary
                  </button>
                )}
              </div>
            </div>
            {renderMainContent()}
          </main>
        </div>

        <button
          onClick={() => togglePanel("settings")}
          className={`fixed bottom-6 right-6 w-11 h-11 rounded-[14px] shadow-xl flex items-center justify-center transition-all duration-200 z-40 hover:scale-110 active:scale-95
            ${openPanel === "settings" ? "bg-orange-500 rotate-[60deg]" : "bg-gray-900 hover:bg-orange-500 hover:rotate-[60deg]"}`}>
          <Settings size={18} strokeWidth={1.8} className="text-white" />
        </button>

        {showAddProject && <AddProjectModal onClose={() => setShowAddProject(false)} />}
      </div>
    </ProtectedRoute>
  );
}