"use client";

import { useState, useEffect, useRef } from "react";
import {
  Ticket, TicketCheck, ChevronDown, ChevronRight, Plus,
  Search, Filter, MoreHorizontal, Clock, User, Tag,
  AlertCircle, CheckCircle2, Circle, ArrowUpRight, Zap,
  BarChart3, TrendingUp, MessageSquare, Paperclip, Eye,
  X, ChevronUp, Activity, Shield, Bell, Settings2,
  RefreshCw, Download, Send, Inbox, Hash, Star,
  ArrowRight, PieChart, CalendarDays, Users, Layers,
  SlidersHorizontal, Sparkles, Bot, GitBranch, Play,
  Pause, ToggleLeft, ToggleRight, Info, Check, Edit3,
  Trash2, Copy, ExternalLink, Globe, Mail, Phone,
} from "lucide-react";

// ─── DATA ─────────────────────────────────────────────────────────────────────
const PRIORITIES = {
  critical: { label: "Critical", color: "#ef4444", bg: "#fef2f2", dot: "#ef4444" },
  high:     { label: "High",     color: "#f97316", bg: "#fff7ed", dot: "#f97316" },
  medium:   { label: "Medium",   color: "#eab308", bg: "#fefce8", dot: "#eab308" },
  low:      { label: "Low",      color: "#22c55e", bg: "#f0fdf4", dot: "#22c55e" },
};

const STATUSES = {
  open:        { label: "Open",        color: "#6366f1", bg: "#eef2ff" },
  in_progress: { label: "In Progress", color: "#f97316", bg: "#fff7ed" },
  pending:     { label: "Pending",     color: "#eab308", bg: "#fefce8" },
  resolved:    { label: "Resolved",    color: "#22c55e", bg: "#f0fdf4" },
  closed:      { label: "Closed",      color: "#94a3b8", bg: "#f8fafc" },
};

const ticketsData = [
  { id: "TKT-001", title: "Unable to clock-in from mobile app", category: "IT Support", priority: "high",     status: "open",        assignee: "Ravi Kumar",    created: "2h ago",   updated: "30m ago",  replies: 3, avatar: "#6366f1", tag: "Mobile"    },
  { id: "TKT-002", title: "Payslip not generated for March",    category: "Payroll",    priority: "critical", status: "in_progress", assignee: "Meena Rao",     created: "5h ago",   updated: "1h ago",   replies: 7, avatar: "#ef4444", tag: "Payroll"   },
  { id: "TKT-003", title: "Leave balance showing incorrect",    category: "HR",         priority: "medium",   status: "pending",     assignee: "Arjun Nair",    created: "1d ago",   updated: "4h ago",   replies: 2, avatar: "#14b8a6", tag: "Leave"     },
  { id: "TKT-004", title: "Request for WFH policy document",   category: "HR",         priority: "low",      status: "resolved",    assignee: "Divya Singh",   created: "2d ago",   updated: "6h ago",   replies: 5, avatar: "#8b5cf6", tag: "Policy"    },
  { id: "TKT-005", title: "VPN access not working",            category: "IT Support", priority: "critical", status: "open",        assignee: "Kiran Patel",   created: "3h ago",   updated: "1h ago",   replies: 4, avatar: "#f97316", tag: "Network"   },
  { id: "TKT-006", title: "Attendance report export fails",    category: "Technical",  priority: "high",     status: "in_progress", assignee: "Sunita Joshi",  created: "1d ago",   updated: "2h ago",   replies: 6, avatar: "#ec4899", tag: "Report"    },
  { id: "TKT-007", title: "New employee ID card request",      category: "Admin",      priority: "low",      status: "closed",      assignee: "Tarun Mehta",   created: "3d ago",   updated: "1d ago",   replies: 1, avatar: "#22c55e", tag: "Admin"     },
  { id: "TKT-008", title: "Shift swap approval stuck",         category: "HR",         priority: "medium",   status: "open",        assignee: "Priya Sharma",  created: "6h ago",   updated: "2h ago",   replies: 3, avatar: "#0ea5e9", tag: "Shift"     },
];

const automationRules = [
  { id: 1, name: "Auto-assign IT tickets",       trigger: "Category = IT Support", action: "Assign to IT team", active: true,  runs: 142, lastRun: "2m ago"   },
  { id: 2, name: "Critical priority escalation", trigger: "Priority = Critical",   action: "Notify manager + escalate SLA", active: true,  runs: 38,  lastRun: "1h ago"   },
  { id: 3, name: "Auto-close resolved tickets",  trigger: "Status = Resolved, 48h passed", action: "Move to Closed", active: true,  runs: 91,  lastRun: "3h ago"   },
  { id: 4, name: "SLA breach alert",             trigger: "SLA > 80% elapsed",    action: "Send email alert",  active: false, runs: 17,  lastRun: "2d ago"   },
  { id: 5, name: "Weekend auto-response",        trigger: "Created on weekend",    action: "Send auto-reply + set pending", active: false, runs: 24,  lastRun: "3d ago"   },
];

const reportStats = [
  { label: "Total Tickets",    value: "248", change: "+12%", up: true,  color: "#6366f1", icon: Ticket      },
  { label: "Resolved Today",   value: "34",  change: "+8%",  up: true,  color: "#22c55e", icon: CheckCircle2 },
  { label: "Avg. Resolve Time",value: "4.2h",change: "-18%", up: true,  color: "#f97316", icon: Clock        },
  { label: "Open Critical",    value: "7",   change: "+3",   up: false, color: "#ef4444", icon: AlertCircle  },
];

// ─── TICKET DETAIL DRAWER ─────────────────────────────────────────────────────
function TicketDetailDrawer({ ticket, onClose }) {
  const [reply, setReply] = useState("");
  const P = PRIORITIES[ticket.priority];
  const S = STATUSES[ticket.status];
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]" onClick={onClose} style={{ animation: "fadeIn .2s ease" }} />
      <div className="fixed top-0 right-0 h-full z-50 w-[460px] bg-white shadow-2xl flex flex-col border-l border-gray-100"
        style={{ animation: "slideRight .22s cubic-bezier(.4,0,.2,1)" }}>
        <style>{`@keyframes slideRight{from{opacity:0;transform:translateX(32px)}to{opacity:1;transform:translateX(0)}}@keyframes fadeIn{from{opacity:0}to{opacity:1}}`}</style>

        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold text-gray-400 font-mono">{ticket.id}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ backgroundColor: S.bg, color: S.color }}>{S.label}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ backgroundColor: P.bg, color: P.color }}>{P.label}</span>
            </div>
            <h3 className="text-sm font-bold text-gray-800 leading-snug max-w-[340px]">{ticket.title}</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-100 shrink-0"><X size={15} /></button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Meta */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Category",  value: ticket.category },
              { label: "Assignee",  value: ticket.assignee },
              { label: "Created",   value: ticket.created  },
              { label: "Updated",   value: ticket.updated  },
            ].map(m => (
              <div key={m.label} className="bg-gray-50 rounded-xl p-3">
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-1">{m.label}</p>
                <p className="text-xs font-semibold text-gray-700">{m.value}</p>
              </div>
            ))}
          </div>

          {/* Description */}
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Description</p>
            <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 rounded-xl p-4">
              This ticket was submitted by the employee regarding an issue with {ticket.title.toLowerCase()}.
              The problem has been occurring since the last system update. Initial investigation suggests
              a configuration mismatch in the backend settings.
            </p>
          </div>

          {/* Activity */}
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Activity ({ticket.replies})</p>
            <div className="space-y-3">
              {[
                { user: "System",       color: "#94a3b8", msg: "Ticket created and assigned to " + ticket.assignee,       time: ticket.created  },
                { user: ticket.assignee, color: ticket.avatar, msg: "Acknowledged. Looking into the issue.",              time: "1h ago"         },
                { user: "Reporter",     color: "#6366f1", msg: "Still facing the issue. Please prioritize.",               time: "30m ago"        },
              ].map((a, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0" style={{ backgroundColor: a.color }}>
                    {a.user.charAt(0)}
                  </div>
                  <div className="flex-1 bg-gray-50 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-gray-700">{a.user}</span>
                      <span className="text-[10px] text-gray-400">{a.time}</span>
                    </div>
                    <p className="text-xs text-gray-600">{a.msg}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reply Box */}
        <div className="px-6 py-4 border-t border-gray-100">
          <div className="flex gap-2 items-end">
            <textarea
              value={reply} onChange={e => setReply(e.target.value)}
              placeholder="Write a reply…"
              rows={2}
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-gray-700 outline-none focus:border-orange-300 resize-none placeholder:text-gray-400"
            />
            <button className="h-10 px-4 bg-orange-500 text-white rounded-xl text-xs font-bold hover:bg-orange-600 flex items-center gap-1.5 shrink-0">
              <Send size={12} /> Send
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── TICKET ROW ───────────────────────────────────────────────────────────────
function TicketRow({ ticket, onView }) {
  const P = PRIORITIES[ticket.priority];
  const S = STATUSES[ticket.status];
  return (
    <div className="grid items-center px-4 py-3.5 hover:bg-orange-50/40 transition-colors cursor-pointer border-b border-gray-50 group"
      style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr auto" }}
      onClick={() => onView(ticket)}>
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-1.5 h-8 rounded-full shrink-0" style={{ backgroundColor: P.dot }} />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-gray-400 shrink-0">{ticket.id}</span>
            <span className="text-[10px] px-1.5 py-px rounded-md font-semibold shrink-0" style={{ backgroundColor: "#f1f5f9", color: "#64748b" }}>{ticket.tag}</span>
          </div>
          <p className="text-xs font-semibold text-gray-800 truncate mt-0.5 group-hover:text-orange-600 transition-colors">{ticket.title}</p>
        </div>
      </div>
      <div>
        <span className="text-[11px] px-2.5 py-1 rounded-full font-semibold" style={{ backgroundColor: S.bg, color: S.color }}>{S.label}</span>
      </div>
      <div>
        <span className="text-[11px] px-2.5 py-1 rounded-full font-semibold" style={{ backgroundColor: P.bg, color: P.color }}>{P.label}</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0" style={{ backgroundColor: ticket.avatar }}>
          {ticket.assignee.charAt(0)}
        </div>
        <span className="text-xs text-gray-600 truncate">{ticket.assignee.split(" ")[0]}</span>
      </div>
      <div className="flex items-center gap-1.5 text-xs text-gray-400">
        <MessageSquare size={11} className="text-gray-300" />
        <span>{ticket.replies}</span>
        <span className="mx-1 text-gray-200">·</span>
        <Clock size={11} className="text-gray-300" />
        <span>{ticket.updated}</span>
      </div>
      <button className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:text-orange-500 hover:bg-orange-50 opacity-0 group-hover:opacity-100 transition-all">
        <ArrowRight size={13} />
      </button>
    </div>
  );
}

// ─── TAB: TICKETS ─────────────────────────────────────────────────────────────
function TicketsTab() {
  const [search, setSearch]     = useState("");
  const [filter, setFilter]     = useState("all");
  const [selected, setSelected] = useState(null);
  const [showNew, setShowNew]   = useState(false);

  const counts = {
    all:        ticketsData.length,
    open:       ticketsData.filter(t => t.status === "open").length,
    in_progress:ticketsData.filter(t => t.status === "in_progress").length,
    pending:    ticketsData.filter(t => t.status === "pending").length,
    resolved:   ticketsData.filter(t => ["resolved","closed"].includes(t.status)).length,
  };

  const filtered = ticketsData.filter(t => {
    const matchSearch = !search || t.title.toLowerCase().includes(search.toLowerCase()) || t.id.includes(search);
    const matchFilter = filter === "all" || t.status === filter || (filter === "resolved" && ["resolved","closed"].includes(t.status));
    return matchSearch && matchFilter;
  });

  return (
    <div>
      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Open",        val: counts.open,        color: "#6366f1", bg: "#eef2ff",  icon: Circle       },
          { label: "In Progress", val: counts.in_progress, color: "#f97316", bg: "#fff7ed",  icon: RefreshCw    },
          { label: "Pending",     val: counts.pending,     color: "#eab308", bg: "#fefce8",  icon: Clock        },
          { label: "Resolved",    val: counts.resolved,    color: "#22c55e", bg: "#f0fdf4",  icon: CheckCircle2 },
        ].map(c => {
          const CIcon = c.icon;
          return (
            <div key={c.label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: c.bg }}>
                  <CIcon size={17} style={{ color: c.color }} strokeWidth={1.8} />
                </div>
                <span className="text-2xl font-black" style={{ color: c.color }}>{c.val}</span>
              </div>
              <p className="text-xs font-semibold text-gray-500">{c.label}</p>
            </div>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-1">
            {[
              { id: "all", label: "All Tickets" },
              { id: "open", label: "Open" },
              { id: "in_progress", label: "In Progress" },
              { id: "pending", label: "Pending" },
              { id: "resolved", label: "Resolved" },
            ].map(f => (
              <button key={f.id} onClick={() => setFilter(f.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filter === f.id ? "bg-orange-500 text-white shadow-sm" : "text-gray-500 hover:bg-gray-100"}`}>
                {f.label}
                <span className={`ml-1.5 text-[10px] px-1.5 py-px rounded-full font-bold ${filter === f.id ? "bg-white/20 text-white" : "bg-gray-100 text-gray-400"}`}>
                  {counts[f.id]}
                </span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
              <Search size={13} className="text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tickets…" className="bg-transparent text-xs outline-none text-gray-600 w-36 placeholder:text-gray-400" />
            </div>
            <button className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50">
              <SlidersHorizontal size={12} /> Filter
            </button>
            <button onClick={() => setShowNew(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 text-white rounded-xl text-xs font-bold hover:bg-orange-600 shadow-sm">
              <Plus size={13} /> New Ticket
            </button>
          </div>
        </div>

        {/* Table Header */}
        <div className="grid px-4 py-3 bg-gray-50/80 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider"
          style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr auto" }}>
          <span>Ticket</span><span>Status</span><span>Priority</span><span>Assignee</span><span>Activity</span><span />
        </div>

        {/* Rows */}
        <div>
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Inbox size={32} className="mx-auto mb-3 opacity-40" />
              <p className="text-sm font-medium">No tickets found</p>
            </div>
          ) : (
            filtered.map(t => <TicketRow key={t.id} ticket={t} onView={setSelected} />)
          )}
        </div>
      </div>

      {selected && <TicketDetailDrawer ticket={selected} onClose={() => setSelected(null)} />}

      {/* New Ticket Modal */}
      {showNew && (
        <>
          <div className="fixed inset-0 z-40 bg-black/25 backdrop-blur-[2px]" onClick={() => setShowNew(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[520px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
            style={{ animation: "popIn .2s cubic-bezier(.34,1.56,.64,1)" }}>
            <style>{`@keyframes popIn{from{opacity:0;transform:translate(-50%,-50%) scale(.95)}to{opacity:1;transform:translate(-50%,-50%) scale(1)}}`}</style>
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-orange-500 flex items-center justify-center"><Plus size={15} className="text-white" /></div>
                <h3 className="text-sm font-bold text-gray-800">Create New Ticket</h3>
              </div>
              <button onClick={() => setShowNew(false)} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100"><X size={14} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Title</label>
                <input placeholder="Brief description of the issue…" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-orange-300 text-gray-700 placeholder:text-gray-400" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Category",  opts: ["IT Support","HR","Payroll","Technical","Admin"]          },
                  { label: "Priority",  opts: ["Low","Medium","High","Critical"]                        },
                  { label: "Assign To", opts: ["Ravi Kumar","Meena Rao","Arjun Nair","Divya Singh"]     },
                  { label: "Status",    opts: ["Open","In Progress","Pending"]                          },
                ].map(f => (
                  <div key={f.label}>
                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">{f.label}</label>
                    <select className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-orange-300 text-gray-700">
                      {f.opts.map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                ))}
              </div>
              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Description</label>
                <textarea placeholder="Detailed description…" rows={3} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-orange-300 text-gray-700 resize-none placeholder:text-gray-400" />
              </div>
            </div>
            <div className="flex justify-end gap-2 px-6 pb-5">
              <button onClick={() => setShowNew(false)} className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
              <button className="px-5 py-2 bg-orange-500 text-white rounded-xl text-xs font-bold hover:bg-orange-600 shadow-sm">Create Ticket</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── TAB: TICKET DETAILS ──────────────────────────────────────────────────────
function TicketDetailsTab() {
  const [selected, setSelected] = useState(ticketsData[1]);
  const P = PRIORITIES[selected.priority];
  const S = STATUSES[selected.status];

  return (
    <div className="grid grid-cols-[320px_1fr] gap-5 h-full">
      {/* Left: List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
        <div className="px-4 py-3.5 border-b border-gray-100">
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
            <Search size={12} className="text-gray-400" />
            <input placeholder="Find ticket…" className="bg-transparent text-xs outline-none text-gray-600 flex-1 placeholder:text-gray-400" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {ticketsData.map(t => {
            const TP = PRIORITIES[t.priority];
            const TS = STATUSES[t.status];
            return (
              <div key={t.id} onClick={() => setSelected(t)}
                className={`flex gap-3 px-4 py-3.5 cursor-pointer border-b border-gray-50 transition-all ${selected.id === t.id ? "bg-orange-50 border-l-2 border-l-orange-500" : "hover:bg-gray-50"}`}>
                <div className="w-1 h-10 rounded-full shrink-0" style={{ backgroundColor: TP.dot }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-mono text-gray-400">{t.id}</span>
                    <span className="text-[9px] px-1.5 py-px rounded-full font-bold" style={{ backgroundColor: TS.bg, color: TS.color }}>{TS.label}</span>
                  </div>
                  <p className="text-xs font-semibold text-gray-700 truncate leading-snug">{t.title}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{t.updated}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right: Detail */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
        {/* Top bar */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[11px] font-mono font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-lg">{selected.id}</span>
              <span className="text-[10px] px-2.5 py-1 rounded-full font-bold" style={{ backgroundColor: S.bg, color: S.color }}>{S.label}</span>
              <span className="text-[10px] px-2.5 py-1 rounded-full font-bold" style={{ backgroundColor: P.bg, color: P.color }}>{P.label}</span>
            </div>
            <h2 className="text-base font-bold text-gray-800">{selected.title}</h2>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50"><Edit3 size={12} /> Edit</button>
            <button className="flex items-center gap-1.5 px-3 py-2 bg-orange-500 text-white rounded-xl text-xs font-bold hover:bg-orange-600 shadow-sm"><Check size={12} /> Resolve</button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="grid grid-cols-4 gap-3 mb-6">
            {[
              { label: "Category",  value: selected.category                 },
              { label: "Assignee",  value: selected.assignee                 },
              { label: "Created",   value: selected.created                  },
              { label: "Replies",   value: selected.replies + " messages"    },
            ].map(m => (
              <div key={m.label} className="bg-gray-50 rounded-xl p-3.5">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">{m.label}</p>
                <p className="text-xs font-bold text-gray-700">{m.value}</p>
              </div>
            ))}
          </div>

          {/* Description */}
          <div className="mb-6">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Description</p>
            <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600 leading-relaxed">
              This ticket was submitted regarding an issue with <strong>{selected.title.toLowerCase()}</strong>.
              The issue was first reported by the employee and has been verified by the system. Initial diagnosis
              indicates a possible backend configuration error or permissions issue that needs immediate attention
              from the relevant department.
            </div>
          </div>

          {/* Timeline */}
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Activity Timeline</p>
            <div className="space-y-4">
              {[
                { user: "System",          color: "#94a3b8", action: "Ticket created", time: selected.created, note: "Automatically assigned to " + selected.assignee },
                { user: selected.assignee, color: selected.avatar, action: "Acknowledged", time: "1h later", note: "Started investigation. Will update shortly."      },
                { user: "Reporter",        color: "#6366f1", action: "Follow-up",    time: "2h later", note: "Still facing the issue. Please prioritize."             },
                { user: selected.assignee, color: selected.avatar, action: "Update",       time: "30m ago", note: "Root cause identified. Working on a fix."          },
              ].map((a, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0" style={{ backgroundColor: a.color }}>
                      {a.user.charAt(0)}
                    </div>
                    {i < 3 && <div className="w-px flex-1 bg-gray-100 mt-2" style={{ minHeight: "24px" }} />}
                  </div>
                  <div className="flex-1 pb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-gray-800">{a.user}</span>
                      <span className="text-[10px] font-semibold text-gray-400 bg-gray-100 px-1.5 py-px rounded-md">{a.action}</span>
                      <span className="text-[10px] text-gray-400 ml-auto">{a.time}</span>
                    </div>
                    <p className="text-xs text-gray-500 bg-gray-50 rounded-xl p-3">{a.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reply */}
        <div className="px-6 py-4 border-t border-gray-100">
          <div className="flex gap-3 items-end">
            <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus-within:border-orange-300 transition-colors">
              <textarea placeholder="Add a comment or update…" rows={2} className="w-full bg-transparent text-xs text-gray-700 outline-none resize-none placeholder:text-gray-400" />
              <div className="flex items-center gap-2 pt-2 border-t border-gray-100 mt-2">
                <button className="text-[10px] text-gray-400 hover:text-orange-500 flex items-center gap-1"><Paperclip size={11} /> Attach</button>
                <button className="text-[10px] text-gray-400 hover:text-orange-500 flex items-center gap-1"><Tag size={11} /> Tag</button>
              </div>
            </div>
            <button className="h-10 px-4 bg-orange-500 text-white rounded-xl text-xs font-bold hover:bg-orange-600 flex items-center gap-1.5 shrink-0">
              <Send size={12} /> Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── TAB: AUTOMATION ──────────────────────────────────────────────────────────
function AutomationTab() {
  const [rules, setRules] = useState(automationRules);
  const [showNew, setShowNew] = useState(false);
  const toggleRule = (id) => setRules(prev => prev.map(r => r.id === id ? { ...r, active: !r.active } : r));

  return (
    <div>
      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Active Rules",    value: rules.filter(r => r.active).length,  icon: Zap,      color: "#f97316", bg: "#fff7ed" },
          { label: "Total Runs Today",value: rules.reduce((a,r) => a + r.runs, 0),icon: Activity, color: "#6366f1", bg: "#eef2ff" },
          { label: "Inactive Rules",  value: rules.filter(r => !r.active).length, icon: Pause,    color: "#94a3b8", bg: "#f8fafc" },
        ].map(s => {
          const SIcon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: s.bg }}>
                <SIcon size={20} style={{ color: s.color }} strokeWidth={1.8} />
              </div>
              <div>
                <p className="text-2xl font-black text-gray-800">{s.value}</p>
                <p className="text-xs text-gray-400 font-medium">{s.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Rules list */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h3 className="text-sm font-bold text-gray-800">Automation Rules</h3>
            <p className="text-xs text-gray-400 mt-0.5">Automate ticket routing, escalation & responses</p>
          </div>
          <button onClick={() => setShowNew(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 text-white rounded-xl text-xs font-bold hover:bg-orange-600 shadow-sm">
            <Plus size={13} /> New Rule
          </button>
        </div>

        <div className="divide-y divide-gray-50">
          {rules.map(rule => (
            <div key={rule.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/50 transition-colors group">
              {/* Toggle */}
              <button onClick={() => toggleRule(rule.id)} className="shrink-0">
                <div className={`relative rounded-full transition-colors ${rule.active ? "bg-orange-500" : "bg-gray-200"}`} style={{ height: "22px", minWidth: "40px" }}>
                  <span className={`absolute top-0.5 w-[18px] h-[18px] rounded-full bg-white shadow transition-transform ${rule.active ? "translate-x-[20px]" : "translate-x-0.5"}`} />
                </div>
              </button>

              {/* Icon */}
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${rule.active ? "bg-orange-50" : "bg-gray-100"}`}>
                <GitBranch size={16} className={rule.active ? "text-orange-500" : "text-gray-400"} strokeWidth={1.8} />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className={`text-xs font-bold ${rule.active ? "text-gray-800" : "text-gray-500"}`}>{rule.name}</p>
                  {rule.active
                    ? <span className="text-[9px] font-bold px-1.5 py-px rounded-full bg-green-100 text-green-700">ACTIVE</span>
                    : <span className="text-[9px] font-bold px-1.5 py-px rounded-full bg-gray-100 text-gray-500">INACTIVE</span>
                  }
                </div>
                <div className="flex items-center gap-3 text-[10px] text-gray-400">
                  <span className="flex items-center gap-1"><Zap size={9} className="text-yellow-400" /> <strong className="text-gray-600">Trigger:</strong> {rule.trigger}</span>
                  <span className="text-gray-200">→</span>
                  <span className="flex items-center gap-1"><ArrowRight size={9} className="text-orange-400" /> <strong className="text-gray-600">Action:</strong> {rule.action}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="text-right shrink-0">
                <p className="text-sm font-black text-gray-700">{rule.runs}</p>
                <p className="text-[10px] text-gray-400">runs · {rule.lastRun}</p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <button className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-orange-500 hover:bg-orange-50"><Edit3 size={12} /></button>
                <button className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50"><Trash2 size={12} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* New Rule Modal */}
      {showNew && (
        <>
          <div className="fixed inset-0 z-40 bg-black/25 backdrop-blur-[2px]" onClick={() => setShowNew(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[480px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
            style={{ animation: "popIn .2s cubic-bezier(.34,1.56,.64,1)" }}>
            <style>{`@keyframes popIn{from{opacity:0;transform:translate(-50%,-50%) scale(.95)}to{opacity:1;transform:translate(-50%,-50%) scale(1)}}`}</style>
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-orange-500 flex items-center justify-center"><Zap size={15} className="text-white" /></div>
                <h3 className="text-sm font-bold text-gray-800">Create Automation Rule</h3>
              </div>
              <button onClick={() => setShowNew(false)} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100"><X size={14} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Rule Name</label>
                <input placeholder="e.g., Auto-assign payroll tickets" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-orange-300 text-gray-700 placeholder:text-gray-400" />
              </div>
              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Trigger Condition</label>
                <select className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-orange-300 text-gray-700">
                  <option>Category = IT Support</option>
                  <option>Priority = Critical</option>
                  <option>Status = Resolved + 48h</option>
                  <option>SLA &gt; 80% elapsed</option>
                  <option>Created on weekend</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Action</label>
                <select className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-orange-300 text-gray-700">
                  <option>Assign to team</option>
                  <option>Notify manager</option>
                  <option>Send auto-reply</option>
                  <option>Escalate SLA</option>
                  <option>Move to Closed</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 px-6 pb-5">
              <button onClick={() => setShowNew(false)} className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
              <button className="px-5 py-2 bg-orange-500 text-white rounded-xl text-xs font-bold hover:bg-orange-600 shadow-sm">Save Rule</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── TAB: REPORTS ─────────────────────────────────────────────────────────────
function ReportsTab() {
  const bars = [
    { label: "IT Support", count: 78, color: "#6366f1" },
    { label: "HR",         count: 54, color: "#f97316" },
    { label: "Payroll",    count: 43, color: "#14b8a6" },
    { label: "Technical",  count: 37, color: "#ec4899" },
    { label: "Admin",      count: 22, color: "#8b5cf6" },
  ];
  const maxBar = Math.max(...bars.map(b => b.count));

  const weekly = [
    { day: "Mon", open: 12, resolved: 9  },
    { day: "Tue", open: 8,  resolved: 11 },
    { day: "Wed", open: 15, resolved: 7  },
    { day: "Thu", open: 6,  resolved: 13 },
    { day: "Fri", open: 10, resolved: 8  },
    { day: "Sat", open: 3,  resolved: 5  },
    { day: "Sun", open: 2,  resolved: 2  },
  ];
  const maxWeekly = Math.max(...weekly.map(w => Math.max(w.open, w.resolved)));

  return (
    <div className="space-y-5">
      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        {reportStats.map(s => {
          const SIcon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: s.color + "18" }}>
                  <SIcon size={18} style={{ color: s.color }} strokeWidth={1.8} />
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 ${s.up ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}>
                  {s.up ? <ChevronUp size={9} /> : <ChevronDown size={9} />} {s.change}
                </span>
              </div>
              <p className="text-2xl font-black text-gray-800 mb-0.5">{s.value}</p>
              <p className="text-xs text-gray-400 font-medium">{s.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-5">
        {/* Tickets by Category */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-bold text-gray-800">Tickets by Category</h3>
            <button className="flex items-center gap-1 text-xs text-gray-400 border border-gray-200 rounded-lg px-2.5 py-1 hover:bg-gray-50">
              <Download size={11} /> Export
            </button>
          </div>
          <div className="space-y-3">
            {bars.map(b => (
              <div key={b.label} className="flex items-center gap-3">
                <span className="text-xs text-gray-500 font-medium w-20 shrink-0">{b.label}</span>
                <div className="flex-1 h-6 bg-gray-50 rounded-full overflow-hidden">
                  <div className="h-full rounded-full flex items-center justify-end pr-2 transition-all duration-700"
                    style={{ width: `${(b.count / maxBar) * 100}%`, backgroundColor: b.color + "22", borderRight: `3px solid ${b.color}` }}>
                    <span className="text-[9px] font-bold" style={{ color: b.color }}>{b.count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Volume */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-bold text-gray-800">Weekly Volume</h3>
            <div className="flex items-center gap-3 text-[10px]">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-orange-400" /> Opened</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Resolved</span>
            </div>
          </div>
          <div className="flex items-end gap-2 h-[130px]">
            {weekly.map(w => (
              <div key={w.day} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex items-end gap-0.5 h-[100px]">
                  <div className="flex-1 rounded-t-md bg-orange-100 transition-all duration-700 hover:bg-orange-400"
                    style={{ height: `${(w.open / maxWeekly) * 100}%` }} />
                  <div className="flex-1 rounded-t-md bg-emerald-100 transition-all duration-700 hover:bg-emerald-400"
                    style={{ height: `${(w.resolved / maxWeekly) * 100}%` }} />
                </div>
                <span className="text-[9px] text-gray-400 font-semibold">{w.day}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Resolution Performance */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-bold text-gray-800">Assignee Performance</h3>
          <button className="flex items-center gap-1.5 text-xs text-gray-400 border border-gray-200 rounded-lg px-2.5 py-1 hover:bg-gray-50">
            <CalendarDays size={11} /> This Month
          </button>
        </div>
        <div className="grid grid-cols-5 gap-3">
          {[
            { name: "Ravi Kumar",  resolved: 34, total: 41, time: "3.2h", color: "#6366f1" },
            { name: "Meena Rao",   resolved: 28, total: 35, time: "4.8h", color: "#f97316" },
            { name: "Arjun Nair",  resolved: 22, total: 28, time: "5.1h", color: "#14b8a6" },
            { name: "Divya Singh", resolved: 19, total: 22, time: "2.9h", color: "#ec4899" },
            { name: "Kiran Patel", resolved: 15, total: 20, time: "6.2h", color: "#8b5cf6" },
          ].map(a => {
            const pct = Math.round((a.resolved / a.total) * 100);
            return (
              <div key={a.name} className="bg-gray-50 rounded-2xl p-4 text-center">
                <div className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: a.color }}>
                  {a.name.charAt(0)}
                </div>
                <p className="text-xs font-bold text-gray-700 mb-1 truncate">{a.name.split(" ")[0]}</p>
                <div className="relative w-full h-1.5 bg-gray-200 rounded-full mb-2">
                  <div className="absolute left-0 top-0 h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: a.color }} />
                </div>
                <p className="text-[10px] font-bold" style={{ color: a.color }}>{pct}%</p>
                <p className="text-[9px] text-gray-400">{a.resolved}/{a.total} · ø {a.time}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN TICKETS PAGE ────────────────────────────────────────────────────────
export default function TicketsPage() {
  const [activeTab, setActiveTab] = useState("tickets");

  const TABS = [
    { id: "tickets",    label: "Tickets",            icon: Inbox      },
    { id: "details",    label: "Ticket Details",     icon: Eye        },
    { id: "automation", label: "Ticket Automation",  icon: Zap        },
    { id: "reports",    label: "Ticket Reports",     icon: BarChart3  },
  ];

  return (
    <div>
      {/* Tab Bar */}
      <div className="flex items-center gap-1 mb-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-1.5">
        {TABS.map(tab => {
          const TIcon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold transition-all flex-1 justify-center
                ${isActive
                  ? "bg-orange-500 text-white shadow-sm shadow-orange-200"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"}`}>
              <TIcon size={14} strokeWidth={isActive ? 2.2 : 1.8} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div style={{ animation: "fadeSlide .2s ease" }}>
        <style>{`@keyframes fadeSlide{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}`}</style>
        {activeTab === "tickets"    && <TicketsTab    key="tickets"    />}
        {activeTab === "details"    && <TicketDetailsTab key="details" />}
        {activeTab === "automation" && <AutomationTab key="automation" />}
        {activeTab === "reports"    && <ReportsTab    key="reports"    />}
      </div>
    </div>
  );
}