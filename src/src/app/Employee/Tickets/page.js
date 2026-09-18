"use client";
import React, { useState, useRef } from "react";

// ─── Icon Helper ──────────────────────────────────────────────────────────────
const Icon = ({ d, size = 16, stroke = "currentColor", fill = "none", sw = 1.8, style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
    strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
    style={{ display: "block", flexShrink: 0, ...style }}>
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

// ─── Icons ────────────────────────────────────────────────────────────────────
const IC = {
  ticket:    "M2 3h20v14H2z M8 21h8M12 17v4",
  plus:      "M12 5v14M5 12h14",
  search:    "M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z",
  filter:    "M22 3H2l8 9.46V19l4 2v-8.54z",
  chevRight: "M9 18l6-6-6-6",
  chevDown:  "M6 9l6 6 6-6",
  x:         "M18 6L6 18M6 6l12 12",
  send:      "M22 2L11 13 M22 2l-7 20-4-9-9-4 20-7z",
  attach:    "M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48",
  star:      "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  book:      "M4 19.5A2.5 2.5 0 0 1 6.5 17H20 M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z",
  check:     "M20 6L9 17l-5-5",
  clock:     "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2",
  user:      "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  refresh:   "M23 4v6h-6 M1 20v-6h6 M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15",
  info:      "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 8h.01M12 12v4",
  upload:    "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M17 8l-5-5-5 5 M12 3v12",
  archive:   "M21 8v13H3V8 M1 3h22v5H1z M10 12h4",
  chevLeft:  "M15 18l-6-6 6-6",
  tag:       "M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z M7 7h.01",
  msg:       "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
};

// ─── Tabs ─────────────────────────────────────────────────────────────────────
const TABS = [
  { id: "mytickets",  label: "My Tickets",      icon: IC.ticket  },
  { id: "raise",      label: "Raise a Ticket",  icon: IC.plus    },
  { id: "resolved",   label: "Resolved",        icon: IC.archive },
  { id: "faq",        label: "Knowledge Base",  icon: IC.book    },
];

// ─── Mock Data ────────────────────────────────────────────────────────────────
const TICKETS = [
  { id: "TKT-1001", subject: "Laptop not connecting to VPN",          category: "IT Support", priority: "high",   status: "in_progress", created: "02 May 2025", updated: "04 May 2025", assignee: "Arjun K.",   desc: "I'm unable to connect to the company VPN from my home network. The error says 'Authentication Failed'. I've tried resetting my password but the issue persists." },
  { id: "TKT-1002", subject: "Incorrect salary credited for March",   category: "Payroll",    priority: "urgent", status: "open",        created: "01 May 2025", updated: "01 May 2025", assignee: "Priya M.",   desc: "My March salary was short by ₹5,400. The deduction is not listed in my payslip. Please investigate and correct." },
  { id: "TKT-1003", subject: "Leave balance not updated after approval",category: "HR",       priority: "medium", status: "open",        created: "29 Apr 2025", updated: "30 Apr 2025", assignee: "Unassigned", desc: "I took 2 days leave which was approved, but my leave balance hasn't been reduced. The portal still shows the old balance." },
  { id: "TKT-1004", subject: "Access required for Jira project board", category: "IT Support",priority: "low",    status: "in_progress", created: "28 Apr 2025", updated: "03 May 2025", assignee: "Arjun K.",   desc: "Need editor access to the Phoenix project board on Jira. My current role is viewer only." },
  { id: "TKT-1005", subject: "Office chair replacement request",       category: "Facilities",priority: "low",    status: "open",        created: "25 Apr 2025", updated: "25 Apr 2025", assignee: "Unassigned", desc: "The armrest of my chair is broken. Requesting a replacement for ergonomic comfort." },
];

const RESOLVED_TICKETS = [
  { id: "TKT-0998", subject: "Email signature update",               category: "IT Support", priority: "low",    status: "resolved", created: "10 Apr 2025", updated: "12 Apr 2025", rating: 5, feedback: "Resolved quickly, very helpful!" },
  { id: "TKT-0997", subject: "Reimbursement claim status",           category: "HR",         priority: "medium", status: "resolved", created: "05 Apr 2025", updated: "09 Apr 2025", rating: 4, feedback: "" },
  { id: "TKT-0995", subject: "Monitor display flickering",           category: "IT Support", priority: "high",   status: "resolved", created: "01 Apr 2025", updated: "04 Apr 2025", rating: 0, feedback: "" },
  { id: "TKT-0990", subject: "Shift change request for March",       category: "HR",         priority: "medium", status: "resolved", created: "20 Mar 2025", updated: "22 Mar 2025", rating: 5, feedback: "Super fast resolution" },
];

const FAQS = [
  {
    category: "Leave & Attendance",
    color: "#3b82f6", bg: "#eff6ff",
    icon: IC.clock,
    articles: [
      { title: "How to apply for leave",               views: 842, time: "2 min read" },
      { title: "How to mark attendance manually",      views: 631, time: "3 min read" },
      { title: "What happens if I forget to punch in", views: 520, time: "2 min read" },
    ],
  },
  {
    category: "Payroll & Salary",
    color: "#22c55e", bg: "#f0fdf4",
    icon: IC.tag,
    articles: [
      { title: "Why is my salary different this month", views: 1204, time: "4 min read" },
      { title: "How to download payslip",               views: 980,  time: "1 min read" },
      { title: "How to submit tax declaration",         views: 763,  time: "5 min read" },
    ],
  },
  {
    category: "IT & Access",
    color: "#8b5cf6", bg: "#f5f3ff",
    icon: IC.info,
    articles: [
      { title: "How to reset VPN credentials",              views: 445, time: "3 min read" },
      { title: "Request access to software or tools",       views: 389, time: "2 min read" },
      { title: "How to set up company email on mobile",     views: 302, time: "4 min read" },
    ],
  },
  {
    category: "HR Policies",
    color: "#f59e0b", bg: "#fffbeb",
    icon: IC.book,
    articles: [
      { title: "Work from home policy",                  views: 1567, time: "6 min read" },
      { title: "Employee code of conduct",               views: 934,  time: "8 min read" },
      { title: "Grievance redressal process",            views: 612,  time: "5 min read" },
    ],
  },
];

// ─── Config maps ──────────────────────────────────────────────────────────────
const PRIORITY_CFG = {
  urgent: { bg: "#fee2e2", text: "#991b1b", dot: "#ef4444", label: "Urgent" },
  high:   { bg: "#fef2f2", text: "#dc2626", dot: "#f87171", label: "High"   },
  medium: { bg: "#fffbeb", text: "#d97706", dot: "#f59e0b", label: "Medium" },
  low:    { bg: "#f0fdf4", text: "#16a34a", dot: "#22c55e", label: "Low"    },
};
const STATUS_CFG = {
  open:        { bg: "#eff6ff", text: "#1d4ed8", dot: "#3b82f6", label: "Open"        },
  in_progress: { bg: "#fff7ed", text: "#c2410c", dot: "#f97316", label: "In Progress" },
  resolved:    { bg: "#f0fdf4", text: "#15803d", dot: "#22c55e", label: "Resolved"    },
  closed:      { bg: "#f3f4f6", text: "#6b7280", dot: "#9ca3af", label: "Closed"      },
};
const CAT_COLOR = {
  "IT Support": "#8b5cf6", "HR": "#3b82f6", "Payroll": "#22c55e",
  "Admin": "#f59e0b", "Facilities": "#f97316",
};

function PriorityBadge({ priority }) {
  const cfg = PRIORITY_CFG[priority] || PRIORITY_CFG.low;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 20, background: cfg.bg, fontSize: 11, fontWeight: 700, color: cfg.text }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.dot }} />{cfg.label}
    </span>
  );
}
function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status] || STATUS_CFG.open;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 20, background: cfg.bg, fontSize: 11, fontWeight: 700, color: cfg.text }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.dot }} />{cfg.label}
    </span>
  );
}

// ─── Star Rating ──────────────────────────────────────────────────────────────
function StarRating({ value, onChange, readonly }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: "flex", gap: 3 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <span key={n}
          onClick={() => !readonly && onChange && onChange(n)}
          onMouseEnter={() => !readonly && setHover(n)}
          onMouseLeave={() => !readonly && setHover(0)}
          style={{ cursor: readonly ? "default" : "pointer", fontSize: 18, color: n <= (hover || value) ? "#f59e0b" : "#e5e7eb", transition: "color 0.1s" }}>
          ★
        </span>
      ))}
    </div>
  );
}

// ─── Slide-over Detail Panel ──────────────────────────────────────────────────
const TIMELINE = [
  { key: "open",        label: "Raised",      icon: IC.ticket },
  { key: "assigned",    label: "Assigned",    icon: IC.user   },
  { key: "in_progress", label: "In Progress", icon: IC.refresh },
  { key: "resolved",    label: "Resolved",    icon: IC.check  },
];

const MOCK_CHAT = [
  { role: "employee", name: "You",      time: "02 May · 10:14 AM", text: "I'm unable to connect to the company VPN from my home network. Authentication keeps failing." },
  { role: "agent",    name: "Arjun K.", time: "02 May · 11:30 AM", text: "Hi! I've looked into your account. Could you please share the exact error message you're seeing on screen?" },
  { role: "employee", name: "You",      time: "02 May · 11:45 AM", text: 'Sure! It says "Error 789: The L2TP connection attempt failed." I\'ve tried three different networks.' },
  { role: "agent",    name: "Arjun K.", time: "03 May · 09:00 AM", text: "Thanks for the details. This looks like a protocol conflict. I've escalated this to the network team and will update you shortly." },
];

function TicketDetailPanel({ ticket, onClose }) {
  const [visible, setVisible] = useState(true);
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState(MOCK_CHAT);
  const chatRef = useRef(null);

  const handleClose = () => { setVisible(false); setTimeout(onClose, 280); };

  const statusOrder = ["open", "assigned", "in_progress", "resolved"];
  const currentIdx  = statusOrder.indexOf(
    ticket.status === "open" ? "open" : ticket.status === "in_progress" ? "in_progress" : "resolved"
  );

  const handleSend = () => {
    if (!message.trim()) return;
    setChat(prev => [...prev, { role: "employee", name: "You", time: "Just now", text: message }]);
    setMessage("");
    setTimeout(() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight; }, 50);
  };

  return (
    <>
      <div onClick={handleClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", backdropFilter: "blur(3px)", zIndex: 400, opacity: visible ? 1 : 0, transition: "opacity 0.28s" }} />
      <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 620, background: "#fff", zIndex: 500, display: "flex", flexDirection: "column", boxShadow: "-20px 0 60px rgba(0,0,0,0.18)", transform: visible ? "translateX(0)" : "translateX(100%)", transition: "transform 0.3s cubic-bezier(0.32,0.72,0,1)" }}>

        {/* Header */}
        <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #1e3a5f 100%)", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px 0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#f97316", background: "rgba(249,115,22,0.15)", padding: "2px 8px", borderRadius: 8 }}>{ticket.id}</span>
              <Icon d={IC.chevRight} size={11} stroke="#64748b" />
              <span style={{ fontSize: 11, color: "#64748b" }}>Ticket Detail</span>
            </div>
            <button onClick={handleClose} style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <Icon d={IC.x} size={13} stroke="#94a3b8" />
            </button>
          </div>
          <div style={{ padding: "16px 20px 0" }}>
            <h2 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 800, color: "#fff" }}>{ticket.subject}</h2>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", paddingBottom: 14 }}>
              <PriorityBadge priority={ticket.priority} />
              <StatusBadge status={ticket.status} />
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 20, background: "rgba(255,255,255,0.07)", fontSize: 11, color: "#94a3b8" }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: CAT_COLOR[ticket.category] || "#94a3b8" }} />{ticket.category}
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 20, background: "rgba(255,255,255,0.07)", fontSize: 11, color: "#94a3b8" }}>
                <Icon d={IC.user} size={11} stroke="#94a3b8" />{ticket.assignee}
              </span>
            </div>
          </div>

          {/* Timeline */}
          <div style={{ display: "flex", padding: "0 20px 16px", gap: 0 }}>
            {TIMELINE.map((step, i) => {
              const done = i <= currentIdx;
              const active = i === currentIdx;
              return (
                <div key={step.key} style={{ display: "flex", alignItems: "center", flex: i < TIMELINE.length - 1 ? 1 : "none" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: done ? (active ? "#f97316" : "#22c55e") : "rgba(255,255,255,0.06)", border: `2px solid ${done ? (active ? "#f97316" : "#22c55e") : "rgba(255,255,255,0.1)"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon d={step.icon} size={12} stroke={done ? "#fff" : "#475569"} />
                    </div>
                    <span style={{ fontSize: 9, color: done ? (active ? "#f97316" : "#22c55e") : "#475569", fontWeight: 600, whiteSpace: "nowrap" }}>{step.label}</span>
                  </div>
                  {i < TIMELINE.length - 1 && (
                    <div style={{ flex: 1, height: 2, background: i < currentIdx ? "#22c55e" : "rgba(255,255,255,0.08)", margin: "0 6px", marginBottom: 18, borderRadius: 1 }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Description */}
        <div style={{ padding: "16px 20px", background: "#f9fafb", borderBottom: "1px solid #f1f5f9", flexShrink: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 6 }}>Description</div>
          <p style={{ margin: 0, fontSize: 13, color: "#4b5563", lineHeight: 1.7 }}>{ticket.desc}</p>
        </div>

        {/* Chat Thread */}
        <div ref={chatRef} style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 2 }}>Conversation</div>
          {chat.map((msg, i) => {
            const isEmployee = msg.role === "employee";
            return (
              <div key={i} style={{ display: "flex", gap: 10, flexDirection: isEmployee ? "row-reverse" : "row" }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, background: isEmployee ? "#f97316" : "#1e293b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#fff" }}>
                  {msg.name[0]}
                </div>
                <div style={{ maxWidth: "72%", display: "flex", flexDirection: "column", gap: 4, alignItems: isEmployee ? "flex-end" : "flex-start" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#374151" }}>{msg.name}</span>
                    <span style={{ fontSize: 10, color: "#94a3b8" }}>{msg.time}</span>
                  </div>
                  <div style={{ padding: "10px 14px", borderRadius: isEmployee ? "14px 4px 14px 14px" : "4px 14px 14px 14px", background: isEmployee ? "#fff7ed" : "#f1f5f9", border: `1px solid ${isEmployee ? "#fed7aa" : "#e5e7eb"}`, fontSize: 13, color: "#374151", lineHeight: 1.6 }}>
                    {msg.text}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Reply Box */}
        <div style={{ padding: "12px 20px 16px", borderTop: "1px solid #f1f5f9", flexShrink: 0 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
            <div style={{ flex: 1, background: "#f9fafb", border: "1.5px solid #e5e7eb", borderRadius: 12, padding: "10px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
              <textarea value={message} onChange={e => setMessage(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder="Type your reply… (Enter to send)"
                style={{ border: "none", background: "transparent", fontSize: 13, color: "#374151", outline: "none", resize: "none", minHeight: 44, fontFamily: "inherit", lineHeight: 1.6 }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <button style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#94a3b8", background: "none", border: "none", cursor: "pointer" }}>
                  <Icon d={IC.attach} size={13} stroke="#94a3b8" /> Attach File
                </button>
                <span style={{ fontSize: 10, color: "#d1d5db" }}>Shift+Enter for newline</span>
              </div>
            </div>
            <button onClick={handleSend} style={{ width: 44, height: 44, borderRadius: 12, background: "#f97316", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
              <Icon d={IC.send} size={16} stroke="#fff" />
            </button>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <button style={{ flex: 1, padding: "8px 0", borderRadius: 9, border: "1px solid #e5e7eb", background: "#fff", fontSize: 12, fontWeight: 600, color: "#6b7280", cursor: "pointer" }}>
              Close Ticket
            </button>
            <button style={{ flex: 1, padding: "8px 0", borderRadius: 9, border: "1px solid #fed7aa", background: "#fff7ed", fontSize: 12, fontWeight: 700, color: "#f97316", cursor: "pointer" }}>
              Reopen Ticket
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── My Tickets Tab ───────────────────────────────────────────────────────────
function MyTicketsTab({ onSelectTicket }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [page, setPage] = useState(1);
  const PER_PAGE = 5;

  const filtered = TICKETS.filter(t => {
    const q = search.toLowerCase();
    const matchQ = t.subject.toLowerCase().includes(q) || t.id.toLowerCase().includes(q) || t.category.toLowerCase().includes(q);
    const matchS = statusFilter === "all" || t.status === statusFilter;
    const matchP = priorityFilter === "all" || t.priority === priorityFilter;
    return matchQ && matchS && matchP;
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const counts = {
    all:         TICKETS.length,
    open:        TICKETS.filter(t => t.status === "open").length,
    in_progress: TICKETS.filter(t => t.status === "in_progress").length,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
        {[
          { label: "Total Tickets",  value: TICKETS.length,                               color: "#3b82f6", bg: "#eff6ff"  },
          { label: "Open",           value: TICKETS.filter(t=>t.status==="open").length,   color: "#f97316", bg: "#fff7ed"  },
          { label: "In Progress",    value: TICKETS.filter(t=>t.status==="in_progress").length, color: "#8b5cf6", bg: "#f5f3ff" },
          { label: "Resolved",       value: RESOLVED_TICKETS.length,                       color: "#22c55e", bg: "#f0fdf4"  },
        ].map(({ label, value, color, bg }) => (
          <div key={label} style={{ background: "#fff", borderRadius: 14, border: "1px solid #f1f5f9", padding: "18px 20px" }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: color, marginBottom: 10 }} />
            <div style={{ fontSize: 10, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #f1f5f9", overflow: "hidden" }}>
        {/* Toolbar */}
        <div style={{ padding: "14px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
          {/* Search */}
          <div style={{ display: "flex", alignItems: "center", gap: 7, background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 9, padding: "7px 12px", flex: 1, minWidth: 180 }}>
            <Icon d={IC.search} stroke="#94a3b8" size={13} />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search tickets…"
              style={{ border: "none", background: "transparent", fontSize: 12, color: "#374151", outline: "none", width: "100%" }} />
          </div>
          {/* Status filter */}
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 9, padding: "7px 12px", fontSize: 12, color: "#6b7280", cursor: "pointer", outline: "none" }}>
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          {/* Priority filter */}
          <select value={priorityFilter} onChange={e => { setPriorityFilter(e.target.value); setPage(1); }}
            style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 9, padding: "7px 12px", fontSize: 12, color: "#6b7280", cursor: "pointer", outline: "none" }}>
            <option value="all">All Priority</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#f9fafb" }}>
                {["Ticket ID", "Subject", "Category", "Priority", "Status", "Created", "Last Updated", ""].map(h => (
                  <th key={h} style={{ padding: "11px 18px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={8} style={{ padding: "40px 0", textAlign: "center", color: "#94a3b8", fontSize: 13 }}>No tickets found</td></tr>
              ) : paginated.map((t, i) => (
                <tr key={t.id} style={{ borderTop: "1px solid #f3f4f6", cursor: "pointer", transition: "background 0.1s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#fafafa"}
                  onMouseLeave={e => e.currentTarget.style.background = "#fff"}>
                  <td style={{ padding: "13px 18px" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#f97316", background: "#fff7ed", padding: "2px 8px", borderRadius: 6 }}>{t.id}</span>
                  </td>
                  <td style={{ padding: "13px 18px", maxWidth: 220 }}>
                    <button onClick={() => onSelectTicket(t)} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#1e293b", textAlign: "left", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 200, display: "block" }}
                      onMouseEnter={e => e.currentTarget.style.color = "#f97316"}
                      onMouseLeave={e => e.currentTarget.style.color = "#1e293b"}>
                      {t.subject}
                    </button>
                  </td>
                  <td style={{ padding: "13px 18px" }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: CAT_COLOR[t.category] || "#6b7280", background: `${CAT_COLOR[t.category] || "#94a3b8"}15`, padding: "2px 8px", borderRadius: 6 }}>{t.category}</span>
                  </td>
                  <td style={{ padding: "13px 18px" }}><PriorityBadge priority={t.priority} /></td>
                  <td style={{ padding: "13px 18px" }}><StatusBadge status={t.status} /></td>
                  <td style={{ padding: "13px 18px", color: "#6b7280", fontSize: 12 }}>{t.created}</td>
                  <td style={{ padding: "13px 18px", color: "#6b7280", fontSize: 12 }}>{t.updated}</td>
                  <td style={{ padding: "13px 18px" }}>
                    <button onClick={() => onSelectTicket(t)} style={{ width: 30, height: 30, background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                      <Icon d={IC.chevRight} size={12} stroke="#0369a1" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ padding: "11px 20px", borderTop: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f9fafb" }}>
          <span style={{ fontSize: 12, color: "#94a3b8" }}>
            {filtered.length === 0 ? "No results" : `Showing ${(page - 1) * PER_PAGE + 1}–${Math.min(page * PER_PAGE, filtered.length)} of ${filtered.length}`}
          </span>
          <div style={{ display: "flex", gap: 4 }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              style={{ width: 30, height: 30, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", cursor: page === 1 ? "not-allowed" : "pointer", opacity: page === 1 ? 0.4 : 1 }}>
              <Icon d={IC.chevLeft} size={13} stroke="#6b7280" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
              <button key={n} onClick={() => setPage(n)}
                style={{ width: 30, height: 30, background: n === page ? "#f97316" : "#fff", border: `1px solid ${n === page ? "#f97316" : "#e5e7eb"}`, borderRadius: 6, fontSize: 12, fontWeight: n === page ? 700 : 400, color: n === page ? "#fff" : "#6b7280", cursor: "pointer" }}>{n}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              style={{ width: 30, height: 30, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", cursor: page === totalPages ? "not-allowed" : "pointer", opacity: page === totalPages ? 0.4 : 1 }}>
              <Icon d={IC.chevRight} size={13} stroke="#6b7280" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Raise a Ticket Tab ───────────────────────────────────────────────────────
function RaiseTicketTab({ onSuccess }) {
  const [form, setForm] = useState({ subject: "", category: "", priority: "medium", description: "" });
  const [file, setFile] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const fileRef = useRef(null);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const isValid = form.subject.trim() && form.category && form.priority && form.description.trim();

  const handleSubmit = () => {
    if (!isValid) return;
    setSubmitted(true);
    setTimeout(() => { setSubmitted(false); setForm({ subject: "", category: "", priority: "medium", description: "" }); setFile(null); if (onSuccess) onSuccess(); }, 2500);
  };

  if (submitted) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 20px", background: "#fff", borderRadius: 16, border: "1px solid #f1f5f9", gap: 16 }}>
      <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#f0fdf4", border: "3px solid #22c55e", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon d={IC.check} size={32} stroke="#22c55e" sw={2.5} />
      </div>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: "#1e293b", marginBottom: 6 }}>Ticket Raised Successfully!</div>
        <div style={{ fontSize: 13, color: "#94a3b8" }}>Our team will respond within 24 hours. You can track status in My Tickets.</div>
      </div>
    </div>
  );

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20 }}>
      {/* Form */}
      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #f1f5f9", overflow: "hidden" }}>
        <div style={{ padding: "18px 22px", borderBottom: "1px solid #f1f5f9", background: "linear-gradient(135deg, #fff7ed, #fce7f3)" }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: "#1e293b" }}>Raise a New Ticket</div>
          <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 3 }}>Fill in the details below and our team will get back to you.</div>
        </div>
        <div style={{ padding: "24px 22px", display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Subject */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: "#374151", display: "block", marginBottom: 7 }}>Subject <span style={{ color: "#ef4444" }}>*</span></label>
            <input value={form.subject} onChange={e => set("subject", e.target.value)} placeholder="Brief summary of your issue…"
              style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #e5e7eb", borderRadius: 10, fontSize: 13, color: "#1e293b", outline: "none", background: "#fafafa", boxSizing: "border-box", transition: "border-color 0.15s" }}
              onFocus={e => e.target.style.borderColor = "#f97316"}
              onBlur={e => e.target.style.borderColor = "#e5e7eb"} />
          </div>

          {/* Category + Priority */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#374151", display: "block", marginBottom: 7 }}>Category <span style={{ color: "#ef4444" }}>*</span></label>
              <select value={form.category} onChange={e => set("category", e.target.value)}
                style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #e5e7eb", borderRadius: 10, fontSize: 13, color: form.category ? "#1e293b" : "#9ca3af", outline: "none", background: "#fafafa", cursor: "pointer", appearance: "none" }}>
                <option value="">Select category…</option>
                {["IT Support", "HR", "Payroll", "Admin", "Facilities"].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#374151", display: "block", marginBottom: 7 }}>Priority <span style={{ color: "#ef4444" }}>*</span></label>
              <div style={{ display: "flex", gap: 6 }}>
                {["low", "medium", "high", "urgent"].map(p => {
                  const cfg = PRIORITY_CFG[p];
                  const isActive = form.priority === p;
                  return (
                    <button key={p} onClick={() => set("priority", p)}
                      style={{ flex: 1, padding: "8px 4px", borderRadius: 8, border: `1.5px solid ${isActive ? cfg.dot : "#e5e7eb"}`, background: isActive ? cfg.bg : "#fafafa", color: isActive ? cfg.text : "#6b7280", fontSize: 10, fontWeight: 700, cursor: "pointer", textTransform: "capitalize", transition: "all 0.15s" }}>
                      {cfg.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: "#374151", display: "block", marginBottom: 7 }}>Description <span style={{ color: "#ef4444" }}>*</span></label>
            <textarea value={form.description} onChange={e => set("description", e.target.value)} rows={6}
              placeholder="Describe your issue in detail. Include steps to reproduce, error messages, or any relevant context…"
              style={{ width: "100%", padding: "12px 14px", border: "1.5px solid #e5e7eb", borderRadius: 10, fontSize: 13, color: "#1e293b", outline: "none", background: "#fafafa", resize: "vertical", fontFamily: "inherit", lineHeight: 1.7, boxSizing: "border-box" }}
              onFocus={e => e.target.style.borderColor = "#f97316"}
              onBlur={e => e.target.style.borderColor = "#e5e7eb"} />
          </div>

          {/* Attachment */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: "#374151", display: "block", marginBottom: 7 }}>Attachment <span style={{ fontSize: 10, color: "#94a3b8" }}>(optional)</span></label>
            <input ref={fileRef} type="file" style={{ display: "none" }} onChange={e => setFile(e.target.files[0])} />
            <div onClick={() => fileRef.current?.click()}
              style={{ border: "2px dashed #e5e7eb", borderRadius: 10, padding: "20px", textAlign: "center", cursor: "pointer", background: "#fafafa", transition: "border-color 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "#f97316"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "#e5e7eb"}>
              {file ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <Icon d={IC.attach} size={14} stroke="#f97316" />
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#f97316" }}>{file.name}</span>
                  <button onClick={e => { e.stopPropagation(); setFile(null); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", fontSize: 14, lineHeight: 1 }}>×</button>
                </div>
              ) : (
                <>
                  <Icon d={IC.upload} size={20} stroke="#94a3b8" style={{ margin: "0 auto 6px" }} />
                  <div style={{ fontSize: 12, color: "#94a3b8" }}>Click to upload or drag &amp; drop</div>
                  <div style={{ fontSize: 10, color: "#d1d5db", marginTop: 3 }}>PNG, JPG, PDF, DOCX up to 10MB</div>
                </>
              )}
            </div>
          </div>

          <button onClick={handleSubmit} disabled={!isValid}
            style={{ width: "100%", padding: "13px 0", background: isValid ? "#f97316" : "#e5e7eb", border: "none", borderRadius: 11, fontSize: 14, fontWeight: 800, color: isValid ? "#fff" : "#9ca3af", cursor: isValid ? "pointer" : "not-allowed", transition: "all 0.15s" }}>
            Submit Ticket
          </button>
        </div>
      </div>

      {/* Tips sidebar */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #f1f5f9", padding: "18px 18px" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", marginBottom: 12 }}>💡 Tips for faster resolution</div>
          {[
            "Be specific about the issue — include error messages",
            "Mention the device or software version if relevant",
            "Add screenshots or attachments when possible",
            "Set the correct priority to help us triage",
            "Check the Knowledge Base first — it may be answered!",
          ].map((tip, i) => (
            <div key={i} style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              <div style={{ width: 20, height: 20, borderRadius: 6, background: "#fff7ed", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 10, fontWeight: 800, color: "#f97316" }}>{i + 1}</div>
              <span style={{ fontSize: 12, color: "#4b5563", lineHeight: 1.6 }}>{tip}</span>
            </div>
          ))}
        </div>
        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #f1f5f9", padding: "18px 18px" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", marginBottom: 10 }}>⏱ SLA Response Times</div>
          {[
            { label: "Urgent", time: "2 hours",  color: "#ef4444" },
            { label: "High",   time: "4 hours",  color: "#f97316" },
            { label: "Medium", time: "24 hours", color: "#f59e0b" },
            { label: "Low",    time: "72 hours", color: "#22c55e" },
          ].map(({ label, time, color }) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #f9fafb" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: color, display: "block" }} />
                <span style={{ fontSize: 12, color: "#374151" }}>{label}</span>
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color }}>{time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Resolved Tickets Tab ─────────────────────────────────────────────────────
function ResolvedTab() {
  const [ratings, setRatings] = useState(() => {
    const m = {};
    RESOLVED_TICKETS.forEach(t => { m[t.id] = t.rating; });
    return m;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
        {[
          { label: "Total Resolved",     value: RESOLVED_TICKETS.length,                                      color: "#22c55e" },
          { label: "Avg Rating",         value: (RESOLVED_TICKETS.filter(t=>t.rating>0).reduce((s,t)=>s+t.rating,0) / RESOLVED_TICKETS.filter(t=>t.rating>0).length || 0).toFixed(1) + " ★", color: "#f59e0b" },
          { label: "Avg Resolution Time",value: "1.8 days",                                                    color: "#3b82f6" },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: "#fff", borderRadius: 14, border: "1px solid #f1f5f9", padding: "18px 20px" }}>
            <div style={{ fontSize: 10, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 24, fontWeight: 800, color }}>{value}</div>
          </div>
        ))}
      </div>

      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #f1f5f9", overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9" }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#1e293b" }}>Resolved Ticket Archive</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {RESOLVED_TICKETS.map((t, i) => (
            <div key={t.id} style={{ padding: "18px 22px", borderBottom: i < RESOLVED_TICKETS.length - 1 ? "1px solid #f3f4f6" : "none", display: "flex", alignItems: "center", gap: 18, transition: "background 0.1s" }}
              onMouseEnter={e => e.currentTarget.style.background = "#fafafa"}
              onMouseLeave={e => e.currentTarget.style.background = "#fff"}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "#f0fdf4", border: "1.5px solid #bbf7d0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon d={IC.check} size={18} stroke="#22c55e" sw={2.5} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#f97316", background: "#fff7ed", padding: "1px 7px", borderRadius: 6 }}>{t.id}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: CAT_COLOR[t.category] || "#6b7280", background: `${CAT_COLOR[t.category]}15`, padding: "1px 7px", borderRadius: 6 }}>{t.category}</span>
                  <PriorityBadge priority={t.priority} />
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", marginBottom: 3 }}>{t.subject}</div>
                <div style={{ fontSize: 11, color: "#94a3b8" }}>Opened {t.created} · Resolved {t.updated}</div>
              </div>
              <div style={{ flexShrink: 0, textAlign: "right" }}>
                <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 5 }}>
                  {ratings[t.id] > 0 ? "Your rating" : "Rate this ticket"}
                </div>
                <StarRating
                  value={ratings[t.id] || 0}
                  onChange={v => setRatings(p => ({ ...p, [t.id]: v }))}
                  readonly={false}
                />
                {t.feedback && <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 4, fontStyle: "italic" }}>"{t.feedback}"</div>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── FAQ / Knowledge Base Tab ─────────────────────────────────────────────────
function FAQTab() {
  const [search, setSearch] = useState("");
  const [openArticle, setOpenArticle] = useState(null);

  const filtered = search
    ? FAQS.map(cat => ({ ...cat, articles: cat.articles.filter(a => a.title.toLowerCase().includes(search.toLowerCase())) })).filter(cat => cat.articles.length > 0)
    : FAQS;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Hero search */}
      <div style={{ background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)", borderRadius: 18, padding: "32px 36px", textAlign: "center" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#f97316", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>Knowledge Base</div>
        <h2 style={{ margin: "0 0 8px", fontSize: 24, fontWeight: 800, color: "#fff" }}>How can we help you?</h2>
        <p style={{ margin: "0 0 20px", fontSize: 13, color: "#64748b" }}>Search our knowledge base before raising a ticket</p>
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#fff", borderRadius: 12, padding: "12px 16px", maxWidth: 480, margin: "0 auto" }}>
          <Icon d={IC.search} stroke="#94a3b8" size={16} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search articles, guides, FAQs…"
            style={{ border: "none", background: "transparent", fontSize: 14, color: "#374151", outline: "none", flex: 1 }} />
        </div>
      </div>

      {/* Category grids */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 16 }}>
        {filtered.map((cat, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: 16, border: "1px solid #f1f5f9", overflow: "hidden" }}>
            {/* Category header */}
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", background: cat.bg, display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${cat.color}20`, border: `1.5px solid ${cat.color}30`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon d={cat.icon} size={15} stroke={cat.color} />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>{cat.category}</div>
                <div style={{ fontSize: 10, color: "#94a3b8" }}>{cat.articles.length} articles</div>
              </div>
            </div>
            {/* Articles */}
            <div style={{ padding: "8px 0" }}>
              {cat.articles.map((art, j) => (
                <div key={j} onClick={() => setOpenArticle(art)}
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 20px", cursor: "pointer", transition: "background 0.1s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#f9fafb"}
                  onMouseLeave={e => e.currentTarget.style.background = "#fff"}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#1e293b", marginBottom: 2 }}>{art.title}</div>
                    <div style={{ display: "flex", gap: 10 }}>
                      <span style={{ fontSize: 10, color: "#94a3b8" }}>{art.views.toLocaleString()} views</span>
                      <span style={{ fontSize: 10, color: "#94a3b8" }}>· {art.time}</span>
                    </div>
                  </div>
                  <Icon d={IC.chevRight} size={13} stroke="#d1d5db" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Article modal */}
      {openArticle && (
        <>
          <div onClick={() => setOpenArticle(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 300 }} />
          <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 301, width: 560, maxHeight: "80vh", background: "#fff", borderRadius: 20, boxShadow: "0 30px 80px rgba(0,0,0,0.2)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: "#1e293b" }}>{openArticle.title}</div>
              <button onClick={() => setOpenArticle(null)} style={{ width: 30, height: 30, borderRadius: 8, background: "#f1f5f9", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon d={IC.x} size={13} stroke="#6b7280" />
              </button>
            </div>
            <div style={{ padding: "20px 24px", overflowY: "auto", flex: 1 }}>
              <p style={{ fontSize: 13, color: "#4b5563", lineHeight: 1.8, margin: 0 }}>
                This is a placeholder article for <strong>"{openArticle.title}"</strong>. In production, this would load the full article content from your knowledge base system. You can integrate with tools like Notion, Confluence, or a custom CMS to pull real documentation.
              </p>
              <div style={{ marginTop: 20, padding: "14px 16px", background: "#f9fafb", borderRadius: 10, border: "1px solid #f1f5f9" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 4 }}>Was this helpful?</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button style={{ padding: "6px 16px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff", fontSize: 12, cursor: "pointer" }}>👍 Yes</button>
                  <button style={{ padding: "6px 16px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff", fontSize: 12, cursor: "pointer" }}>👎 No</button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Main Tickets Page ────────────────────────────────────────────────────────
export default function TicketsPage() {
  const [activeTab, setActiveTab]     = useState("mytickets");
  const [selectedTicket, setSelectedTicket] = useState(null);

  return (
    <>
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={{ display: "flex", flexDirection: "column", gap: 20, animation: "slideUp 0.2s ease" }}>
        {/* Tab Bar */}
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #f1f5f9", overflow: "hidden" }}>
          <div style={{ display: "flex", overflowX: "auto", scrollbarWidth: "none" }}>
            {TABS.map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  style={{ display: "flex", alignItems: "center", gap: 8, padding: "16px 28px", background: "transparent", border: "none", borderBottom: isActive ? "2px solid #f97316" : "2px solid transparent", color: isActive ? "#f97316" : "#6b7280", fontSize: 13, fontWeight: isActive ? 700 : 500, cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.15s" }}>
                  <Icon d={tab.icon} size={15} stroke={isActive ? "#f97316" : "currentColor"} sw={isActive ? 2 : 1.8} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "mytickets"  && <MyTicketsTab onSelectTicket={setSelectedTicket} />}
        {activeTab === "raise"      && <RaiseTicketTab onSuccess={() => setActiveTab("mytickets")} />}
        {activeTab === "resolved"   && <ResolvedTab />}
        {activeTab === "faq"        && <FAQTab />}

        {/* Detail Panel */}
        {selectedTicket && <TicketDetailPanel ticket={selectedTicket} onClose={() => setSelectedTicket(null)} />}
      </div>
    </>
  );
}