"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// ─── Copy these shared helpers or import from your shared file ────────────────
// If you extract shared components to a file like `EmployeeShared.jsx`, replace
// the block below with:
//   import { ProtectedRoute, EmployeeSidebar, EmployeeTopbar, Icon, Avatar, ICONS, ACCENT } from "@/components/EmployeeShared";

const ACCENT = "#f97316";

const Icon = ({ d, size = 14, stroke = "currentColor", fill = "none", sw = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
    strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
    style={{ display: "block", flexShrink: 0 }}>
    <path d={d} />
  </svg>
);

const ICONS = {
  tickets:     "M2 3h20v14H2z M8 21h8M12 17v4",
  ticketList:  "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 0 2-2h2a2 2 0 0 0 2 2m-6 9l2 2 4-4",
  ticketDetail:"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z M14 2v5h5M8 13h8M8 17h5",
  automation:  "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  reports:     "M18 20V10M12 20V4M6 20v-6",
  search:      "M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z",
  export:      "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M17 8l-5-5-5 5 M12 3v12",
  calendar:    "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z",
  settings:    "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z",
  bell:        "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0",
  mail:        "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6",
  grid:        "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z",
  sun:         "M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12 M12 16A4 4 0 1 0 12 8a4 4 0 0 0 0 8z",
  monitor:     "M2 3h20v14H2z M8 21h8M12 17v4",
  chevronDown: "M6 9l6 6 6-6",
  plus:        "M12 5v14M5 12h14",
  comment:     "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
  clock:       "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2",
  tag:         "M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82zM7 7h.01",
  list:        "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 0 2-2h2a2 2 0 0 0 2 2",
  grid2:       "M3 3h8v8H3zM13 3h8v8h-8zM3 13h8v8H3zM13 13h8v8h-8z",
  filter:      "M22 3H2l8 9.46V19l4 2v-8.54L22 3z",
  user:        "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  attendance: "M3 3h18v18H3z",
performance: "M3 17l6-6 4 4 8-8",
training: "M12 2l10 5-10 5-10-5 10-5z",
probation: "M12 12a5 5 0 1 0 0-10",
notice: "M12 8v4l3 3",
promotion: "M12 19V5M5 12l7-7 7 7",
resignation: "M6 6l12 12",
termination: "M18 6L6 18",
holidays: "M8 7V3m8 4V3",
};

const Avatar = ({ name = "?", size = 32, color = "#374151", src }) => {
  const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  if (src) return <img src={src} alt={name} style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />;
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.32, fontWeight: 700, color: "#fff", flexShrink: 0, letterSpacing: "-0.5px" }}>
      {initials}
    </div>
  );
};

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
    } else {
      setIsAuthorized(true);
    }
  }, [requiredRole, router]);
  if (!isAuthorized) return null;
  return children;
}

// ── Sidebar sub-icon paths ────────────────────────────────────────────────────
const subIconPaths = {
  ticketList:   ICONS.ticketList,
  ticketDetail: ICONS.ticketDetail,
  automation:   ICONS.automation,
  reports:      ICONS.reports,
  
};

function AccordionNavItem({ label, subItems, router, activeSubPath }) {
  const [open, setOpen] = useState(true); // default open since we're on Tickets

  return (
    <div style={{ marginBottom: 2 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "8px 12px 8px 10px", border: "none", borderRadius: 8, background: open ? `${ACCENT}18` : "transparent", color: open ? ACCENT : "#374151", cursor: "pointer", fontSize: 13.5, fontWeight: open ? 600 : 500, textAlign: "left", transition: "background 0.15s, color 0.15s" }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0, background: open ? ACCENT : "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.15s" }}>
          <Icon d={ICONS.tickets} size={16} stroke={open ? "#fff" : "#6b7280"} />
        </div>
        <span style={{ flex: 1 }}>{label}</span>
        <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={open ? ACCENT : "#9ca3af"} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", flexShrink: 0 }}>
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div style={{ marginTop: 2, marginLeft: 20, paddingLeft: 16, borderLeft: "2px solid #e5e7eb" }}>
          {subItems.map((item, i) => {
            const isActive = activeSubPath === item.path;
            return (
              <button key={i} onClick={() => { if (router && item.path) router.push(item.path); }}
                style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "7px 10px", border: "none", borderRadius: 6, background: isActive ? `${ACCENT}15` : "transparent", color: isActive ? ACCENT : "#6b7280", cursor: "pointer", fontSize: 12.5, fontWeight: isActive ? 600 : 400, marginBottom: 1, textAlign: "left" }}
                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = "#f9fafb"; e.currentTarget.style.color = "#374151"; } }}
                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#6b7280"; } }}>
                <div style={{ width: 22, height: 22, borderRadius: 5, flexShrink: 0, background: isActive ? `${ACCENT}15` : "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon d={subIconPaths[item.iconKey] || subIconPaths.ticketList} size={12} stroke={isActive ? ACCENT : "#9ca3af"} />
                </div>
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function NavItem({ label, iconKey, path, badge, router }) {
  return (
    <div
      onClick={() => router.push(path)}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 12px",
        cursor: "pointer",
        borderRadius: "6px",
        marginBottom: "4px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: "#f3f4f6",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <Icon d={ICONS[iconKey] || ICONS.tickets} size={14} stroke="#6b7280" />
        </div>
        <span style={{ fontSize: "13.5px", color: "#374151" }}>{label}</span>
      </div>

      {badge && (
        <span style={{
          background: "#ef4444",
          color: "#fff",
          fontSize: "10px",
          padding: "2px 6px",
          borderRadius: "6px"
        }}>
          {badge}
        </span>
      )}
    </div>
  );
}

function EmployeeSidebar({ router, activeSubPath = "", fullName = "", designation = "" }) {
  return (
    <aside style={{ width: 232, background: "#fff", borderRight: "1px solid #f1f5f9", display: "flex", flexDirection: "column", flexShrink: 0, height: "100vh" }}>
      <div style={{ padding: "15px 16px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 9 }}>
        <div style={{ width: 32, height: 32, borderRadius: 9, background: ACCENT, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 15, fontWeight: 800 }}>S</div>
        <span style={{ fontSize: 16, fontWeight: 800, color: "#111827", letterSpacing: "-0.4px" }}>SmartHR</span>
      </div>
       {/* Nav */}
      <nav style={{ padding: "14px 10px", flex: 1, overflowY: "auto" }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.9px", padding: "0 10px 8px" }}>
          HRM
        </div>

        <AccordionNavItem
          label="Tickets"
          iconKey="tickets"
          router={router}
          activeSubPath={activeSubPath}
          subItems={[
            { label: "Ticket",            iconKey: "ticketList",   path: "/Employee/Tickets" },
            { label: "Ticket Details",    iconKey: "ticketDetail", path: "/Employee/Tickets/Details" },
            { label: "Ticket Automation", iconKey: "automation",   path: "/Employee/Tickets/Automation" },
            { label: "Ticket Reports",    iconKey: "reports",      path: "/Employee/Tickets/Reports" },
          ]}
        />

        <AccordionNavItem
          label="Attendance"
          iconKey="attendance"
          router={router}
          activeSubPath={activeSubPath}
          subItems={[
            { label: "Leaves",              iconKey: "ticketList", path: "/Employee/Attendance/Leaves" },
            { label: "Attendance",          iconKey: "ticketList", path: "/Employee/Attendance/Employee" },
            { label: "Timesheets",          iconKey: "reports",    path: "/Employee/Attendance/Timesheets" },
            { label: "Shift & Schedule",    iconKey: "ticketList", path: "/Employee/Attendance/Shift-Schedule" },
            { label: "Shift Swap Requests", iconKey: "automation", path: "/Employee/Attendance/Shift-Swap",  badge: "New" },
            { label: "Overtime",            iconKey: "reports",    path: "/Employee/Attendance/Overtime" },
            { label: "Holiday Calendar",    iconKey: "ticketList", path: "/Employee/Attendance/Holidays",    badge: "New" },
            { label: "WFH Management",      iconKey: "ticketList", path: "/Employee/Attendance/WFH",         badge: "New" },
          ]}
        />

        <AccordionNavItem
          label="Performance"
          iconKey="performance"
          router={router}
          activeSubPath={activeSubPath}
          subItems={[
            { label: "Performance Indicator", iconKey: "reports",     path: "/Employee/Performance/Indicator" },
            { label: "Performance Review",    iconKey: "ticketDetail",path: "/Employee/Performance/Review" },
            { label: "Performance Appraisal", iconKey: "ticketDetail",path: "/Employee/Performance/Appraisal" },
            { label: "Goal List",             iconKey: "ticketList",  path: "/Employee/Performance/Goal-List" },
            { label: "Goal Type",             iconKey: "automation",  path: "/Employee/Performance/Goal-Type" },
          ]}
        />

        <AccordionNavItem
          label="Training"
          iconKey="training"
          router={router}
          activeSubPath={activeSubPath}
          subItems={[
            { label: "Training List",         iconKey: "ticketList",  path: "/Employee/Training/List" },
            { label: "Trainers",              iconKey: "ticketDetail",path: "/Employee/Training/Trainers" },
            { label: "Training Type",         iconKey: "automation",  path: "/Employee/Training/Type" },
            { label: "Certification Tracking",iconKey: "ticketList",  path: "/Employee/Training/Certification", badge: "New" },
            { label: "Learning Analytics",    iconKey: "reports",     path: "/Employee/Training/Analytics",     badge: "New" },
          ]}
        />

        <NavItem label="Probation Management" iconKey="probation"   path="/Employee/Probation"    badge="New" router={router} />
        <NavItem label="Notice Period Tracker" iconKey="notice"     path="/Employee/Notice-Period" badge="New" router={router} />
        <NavItem label="Promotion"             iconKey="promotion"  path="/Employee/Promotion"             router={router} />
        <NavItem label="Resignation"           iconKey="resignation" path="/Employee/Resignation"           router={router} />
        <NavItem label="Termination"           iconKey="termination" path="/Employee/Termination"           router={router} />
        <NavItem label="Holidays"           iconKey="holidays" path="/Employee/Termination"           router={router} />

      </nav>
      <div style={{ padding: "12px 14px", borderTop: "1px solid #f1f5f9" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <Avatar name={fullName || "Employee"} size={34} color="#374151" />
          <div style={{ overflow: "hidden" }}>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{fullName || "Employee"}</div>
            <div style={{ fontSize: 10.5, color: "#9ca3af" }}>{designation || "Employee"}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function EmployeeTopbar({ fullName = "" }) {
  return (
    <div style={{ background: "#fff", borderBottom: "1px solid #f1f5f9", padding: "10px 20px", display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginRight: 6 }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: ACCENT, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 14, fontWeight: 800 }}>S</div>
        <span style={{ fontSize: 15, fontWeight: 800, color: "#111827" }}>SmartHR</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 7, padding: "5px 10px", flex: 1, maxWidth: 220 }}>
        <Icon d={ICONS.search} stroke="#9ca3af" />
        <input placeholder="Search in HRMS…" style={{ border: "none", background: "transparent", fontSize: 12, color: "#6b7280", outline: "none", width: "100%" }} />
        <span style={{ fontSize: 10, color: "#d1d5db", marginLeft: 4 }}>Ctrl + /</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginLeft: "auto" }}>
        {[ICONS.grid, ICONS.sun, ICONS.monitor, ICONS.mail].map((d, i) => (
          <div key={i} style={{ width: 30, height: 30, borderRadius: 7, background: "#f9fafb", border: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <Icon d={d} stroke="#6b7280" />
          </div>
        ))}
        <div style={{ position: "relative", width: 30, height: 30, borderRadius: 7, background: "#f9fafb", border: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <Icon d={ICONS.bell} stroke="#6b7280" />
          <div style={{ position: "absolute", top: 2, right: 2, width: 7, height: 7, borderRadius: "50%", background: "#ef4444", border: "1px solid #fff" }} />
        </div>
        <Avatar name={fullName || "Employee"} size={30} color="#374151" />
      </div>
    </div>
  );
}

// ── Mini sparkbar chart ───────────────────────────────────────────────────────
function SparkBars({ color, values }) {
  const max = Math.max(...values);
  return (
    <svg viewBox="0 0 88 44" style={{ width: 88, height: 44 }}>
      {values.map((v, i) => {
        const barH = (v / max) * 34;
        const x = i * 8;
        const y = 40 - barH;
        const opacity = 0.35 + (i / (values.length - 1)) * 0.65;
        return <rect key={i} x={x} y={y} width={5} height={barH} rx={2} fill={color} opacity={opacity} />;
      })}
    </svg>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ icon, iconBg, label, value, badge, chartColor, chartValues }) {
  return (
    <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #f1f5f9", padding: "18px 16px", display: "flex", alignItems: "flex-end", justifyContent: "space-between", flex: 1 }}>
      <div>
        <div style={{ width: 44, height: 44, borderRadius: "50%", border: `2px solid ${iconBg}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
          <Icon d={icon} stroke={iconBg} size={18} />
        </div>
        <div style={{ fontSize: 11.5, color: "#9ca3af", marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: 26, fontWeight: 800, color: "#111827", lineHeight: 1 }}>{value}</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: "#22c55e", background: "#f0fdf4", padding: "2px 7px", borderRadius: 10 }}>{badge}</span>
        <SparkBars color={chartColor} values={chartValues} />
      </div>
    </div>
  );
}

// ── Priority badge ────────────────────────────────────────────────────────────
const priorityStyle = {
  High:   { bg: "#fef2f2", text: "#dc2626", dot: "#dc2626" },
  Low:    { bg: "#f0fdf4", text: "#16a34a", dot: "#16a34a" },
  Medium: { bg: "#fffbeb", text: "#d97706", dot: "#d97706" },
};
const statusStyle = {
  Open:      { bg: "#fce7f3", text: "#be185d" },
  "On Hold":  { bg: "#fef9c3", text: "#854d0e" },
  Reopened:  { bg: "#ede9fe", text: "#7c3aed" },
  Resolved:  { bg: "#dcfce7", text: "#166534" },
  Closed:    { bg: "#f1f5f9", text: "#475569" },
};

// ── Ticket Row ────────────────────────────────────────────────────────────────
function TicketRow({ id, category, title, status, priority, assignedTo, updatedAgo, comments, avatarColor }) {
  const pr = priorityStyle[priority] || priorityStyle.Medium;
  const st = statusStyle[status]     || { bg: "#f3f4f6", text: "#6b7280" };

  return (
    <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #f1f5f9", padding: "16px 20px", marginBottom: 10 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: ACCENT }}>{category}</span>
        <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 12px", borderRadius: 6, background: pr.bg, color: pr.text, display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: pr.dot, display: "inline-block" }} />
          {priority}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#fff", background: ACCENT, padding: "2px 8px", borderRadius: 5 }}>{id}</span>
        <span style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>{title}</span>
        <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 10, background: st.bg, color: st.text, fontWeight: 600 }}>• {status}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Avatar name={assignedTo} size={20} color={avatarColor} />
          <span style={{ fontSize: 11.5, color: "#6b7280" }}>Assigned to <strong style={{ color: "#374151" }}>{assignedTo}</strong></span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <Icon d={ICONS.calendar} stroke="#9ca3af" size={12} />
          <span style={{ fontSize: 11, color: "#9ca3af" }}>Updated {updatedAgo}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <Icon d={ICONS.comment} stroke="#9ca3af" size={12} />
          <span style={{ fontSize: 11, color: "#9ca3af" }}>{comments} Comments</span>
        </div>
      </div>
    </div>
  );
}

// ── Main Tickets Page ─────────────────────────────────────────────────────────
export default function EmployeeTickets() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState("list"); // "list" | "grid"
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    fetch("https://gerda-anthropopathic-aurora.ngrok-free.dev/api/employee/profile", {
      headers: { "Authorization": `Bearer ${token}`, "ngrok-skip-browser-warning": "true", "Accept": "application/json" },
    })
      .then(r => r.json())
      .then(json => { if (json.success) setProfile(json.data); })
      .catch(console.error);
  }, []);

  const emp         = profile?.employee;
  const fullName    = emp ? `${emp.firstname} ${emp.lastname}` : "Employee";
  const designation = profile?.designation?.name ?? "Senior Product Designer";

  const tickets = [
    { id: "Tic - 001", category: "IT Support", title: "Laptop Issue",   status: "Open",     priority: "High",   assignedTo: "Edgar Hansel", updatedAgo: "10 hours ago", comments: 9, avatarColor: "#6366f1" },
    { id: "Tic - 002", category: "IT Support", title: "Payment Issue",  status: "On Hold",  priority: "Low",    assignedTo: "Ann Lynch",    updatedAgo: "15 hours ago", comments: 9, avatarColor: "#f59e0b" },
    { id: "Tic - 003", category: "IT Support", title: "Bug Report",     status: "Reopened", priority: "Medium", assignedTo: "Juan Hermann", updatedAgo: "20 hours ago", comments: 9, avatarColor: "#22c55e" },
    { id: "Tic - 004", category: "IT Support", title: "Network Issue",  status: "Open",     priority: "High",   assignedTo: "Jessie Otero", updatedAgo: "1 day ago",    comments: 5, avatarColor: "#ef4444" },
    { id: "Tic - 005", category: "HR Support", title: "Leave Request",  status: "Resolved", priority: "Low",    assignedTo: "Ann Lynch",    updatedAgo: "2 days ago",   comments: 3, avatarColor: "#8b5cf6" },
  ];

  const categories = [
    { name: "Internet Issue",  count: 0, color: "#6366f1" },
    { name: "Computer",        count: 1, color: "#f59e0b" },
    { name: "Redistribute",    count: 0, color: "#22c55e" },
    { name: "Payment",         count: 2, color: "#ef4444" },
    { name: "Complaint",       count: 1, color: "#8b5cf6" },
  ];

  const agents = [
    { name: "Edgar Hansel",  count: 0, color: "#6366f1" },
    { name: "Ann Lynch",     count: 1, color: "#f59e0b" },
    { name: "Juan Hermann",  count: 0, color: "#22c55e" },
    { name: "Jessie Otero",  count: 2, color: "#ef4444" },
  ];

  const sparkData = {
    new:     [8, 14, 10, 18, 12, 20, 16, 22, 14, 18, 20],
    open:    [6, 10,  8, 14, 10, 16, 12, 18, 10, 14, 16],
    solved:  [4,  8,  6, 10,  8, 12, 10, 14,  8, 10, 12],
    pending: [2,  4,  3,  6,  4,  8,  6, 10,  4,  6,  8],
  };

  return (
    <ProtectedRoute requiredRole="employee">
      <div style={{ display: "flex", height: "100vh", fontFamily: "'Inter',-apple-system,sans-serif", background: "#f9fafb", color: "#111827", overflow: "hidden" }}>

        {/* ── Shared Sidebar ── */}
        <EmployeeSidebar
          router={router}
          activeSubPath="/Employee/Tickets"
          fullName={fullName}
          designation={designation}
        />

        {/* ── Right panel ── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", height: "100vh" }}>

          {/* Shared Topbar */}
          <EmployeeTopbar fullName={fullName} />

          {/* Page header */}
          <div style={{ background: "#fff", borderBottom: "1px solid #f1f5f9", padding: "9px 20px", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <h1 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>Tickets</h1>
                <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 1, display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ cursor: "pointer" }} onClick={() => router.push("/Employee/Dashboard")}>🏠</span>
                  <span>›</span>
                  <span>Tickets</span>
                  <span>›</span>
                  <span style={{ color: "#374151", fontWeight: 500 }}>Tickets</span>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {/* View toggle */}
                <div style={{ display: "flex", border: "1px solid #e5e7eb", borderRadius: 7, overflow: "hidden" }}>
                  {["list", "grid"].map((m, i) => (
                    <button key={m} onClick={() => setViewMode(m)}
                      style={{ width: 32, height: 30, border: "none", background: viewMode === m ? ACCENT : "#fff", color: viewMode === m ? "#fff" : "#6b7280", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", borderRight: i === 0 ? "1px solid #e5e7eb" : "none" }}>
                      <Icon d={m === "list" ? ICONS.list : ICONS.grid2} size={13} stroke={viewMode === m ? "#fff" : "#6b7280"} />
                    </button>
                  ))}
                </div>
                <button style={{ display: "flex", alignItems: "center", gap: 5, background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 7, padding: "5px 10px", fontSize: 12, color: "#6b7280", fontWeight: 500, cursor: "pointer" }}>
                  <Icon d={ICONS.export} stroke="#6b7280" /> Export
                </button>
                <button style={{ display: "flex", alignItems: "center", gap: 6, background: ACCENT, border: "none", borderRadius: 7, padding: "6px 14px", fontSize: 12.5, color: "#fff", fontWeight: 700, cursor: "pointer" }}>
                  <Icon d={ICONS.plus} stroke="#fff" size={13} /> Add Ticket
                </button>
                <div style={{ width: 30, height: 30, borderRadius: 7, background: "#f9fafb", border: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                  <Icon d={ICONS.settings} stroke="#6b7280" />
                </div>
              </div>
            </div>
          </div>

          {/* Scrollable body */}
          <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Stat cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
              <StatCard icon={ICONS.tickets}     iconBg={ACCENT}     label="New Tickets"     value="120" badge="↑+19.01%" chartColor={ACCENT}     chartValues={sparkData.new}     />
              <StatCard icon={ICONS.ticketList}  iconBg="#a855f7"    label="Open Tickets"    value="60"  badge="↑+19.01%" chartColor="#a855f7"    chartValues={sparkData.open}    />
              <StatCard icon={ICONS.ticketDetail} iconBg="#22c55e"   label="Solved Tickets"  value="50"  badge="↑+19.01%" chartColor="#22c55e"   chartValues={sparkData.solved}  />
              <StatCard icon={ICONS.clock}       iconBg="#06b6d4"    label="Pending Tickets" value="10"  badge="↑+19.01%" chartColor="#06b6d4"    chartValues={sparkData.pending} />
            </div>

            {/* Ticket list + right panel */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 260px", gap: 14, alignItems: "start" }}>

              {/* Left: ticket list */}
              <div>
                {/* Filter bar */}
                <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #f1f5f9", padding: "12px 16px", marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 14, fontWeight: 700 }}>Ticket List</span>
                  <div style={{ display: "flex", gap: 8 }}>
                    {["Priority ▾", "Select Status ▾", "Sort By : Last 7 Days ▾"].map((label, i) => (
                      <button key={i} style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 6, padding: "5px 11px", fontSize: 11.5, color: "#6b7280", cursor: "pointer", fontWeight: 500 }}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tickets */}
                {tickets.map((t, i) => (
                  <TicketRow key={i} {...t} />
                ))}
              </div>

              {/* Right: categories + agents */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

                {/* Ticket Categories */}
                <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #f1f5f9", padding: "16px" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Ticket Categories</div>
                  {categories.map((c, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 0", borderBottom: i < categories.length - 1 ? "1px solid #f9fafb" : "none" }}>
                      <span style={{ fontSize: 13, color: "#374151" }}>{c.name}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, width: 24, height: 24, borderRadius: "50%", background: c.count > 0 ? "#111827" : "#f3f4f6", color: c.count > 0 ? "#fff" : "#9ca3af", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {c.count}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Support Agents */}
                <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #f1f5f9", padding: "16px" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Support Agents</div>
                  {agents.map((a, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: i < agents.length - 1 ? "1px solid #f9fafb" : "none" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Avatar name={a.name} size={30} color={a.color} />
                        <span style={{ fontSize: 12.5, fontWeight: 500, color: "#374151" }}>{a.name}</span>
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, width: 24, height: 24, borderRadius: "50%", background: a.count > 0 ? "#111827" : "#f3f4f6", color: a.count > 0 ? "#fff" : "#9ca3af", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {a.count}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Quick Add Ticket */}
                <button
                  onClick={() => {}}
                  style={{ width: "100%", background: ACCENT, color: "#fff", border: "none", borderRadius: 10, padding: "12px", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
                  <Icon d={ICONS.plus} stroke="#fff" size={15} /> Raise New Ticket
                </button>

              </div>
            </div>

            <div style={{ textAlign: "center", fontSize: 11, color: "#9ca3af", paddingTop: 4 }}>
              2014 - 2026 © SmartHR &nbsp;·&nbsp; Designed &amp; Developed By <span style={{ color: ACCENT, fontWeight: 600 }}>Dreamo</span>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}