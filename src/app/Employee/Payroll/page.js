"use client";
import React, { useState } from "react";

// ─── Icon Helper ──────────────────────────────────────────────────────────────
const Icon = ({ d, size = 16, stroke = "currentColor", fill = "none", sw = 1.8, style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
    strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
    style={{ display: "block", flexShrink: 0, ...style }}>
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

// ─── Mock Data ────────────────────────────────────────────────────────────────
const PAYSLIPS = [
  { month: "April 2025",    gross: 85000, deductions: 12400, net: 72600, status: "paid",    date: "30 Apr 2025" },
  { month: "March 2025",   gross: 85000, deductions: 12400, net: 72600, status: "paid",    date: "31 Mar 2025" },
  { month: "February 2025",gross: 85000, deductions: 11800, net: 73200, status: "paid",    date: "28 Feb 2025" },
  { month: "January 2025", gross: 85000, deductions: 12400, net: 72600, status: "paid",    date: "31 Jan 2025" },
  { month: "December 2024",gross: 92000, deductions: 13500, net: 78500, status: "paid",    date: "31 Dec 2024" },
  { month: "November 2024",gross: 85000, deductions: 12400, net: 72600, status: "paid",    date: "30 Nov 2024" },
];

const TAX_ITEMS = [
  { category: "Section 80C",   items: ["PPF", "ELSS Fund", "Life Insurance"],  declared: 150000, max: 150000 },
  { category: "Section 80D",   items: ["Health Insurance Premium"],             declared: 25000,  max: 25000  },
  { category: "HRA Exemption", items: ["House Rent Allowance"],                 declared: 120000, max: 150000 },
  { category: "Section 80E",   items: ["Education Loan Interest"],              declared: 0,      max: 100000 },
  { category: "Section 80G",   items: ["Charitable Donations"],                 declared: 5000,   max: 50000  },
];

const REIMBURSEMENTS = [
  { id: "RB-001", type: "Travel",    description: "Client visit – Chennai to Bangalore", amount: 4500,  date: "05 Apr 2025", status: "approved" },
  { id: "RB-002", type: "Medical",   description: "Medical bills – Apollo Hospital",      amount: 8200,  date: "12 Apr 2025", status: "pending"  },
  { id: "RB-003", type: "Internet",  description: "Monthly broadband bill",               amount: 1499,  date: "01 Apr 2025", status: "approved" },
  { id: "RB-004", type: "Travel",    description: "Fuel reimbursement – Q1",              amount: 3200,  date: "31 Mar 2025", status: "approved" },
  { id: "RB-005", type: "Education", description: "Online course – React Advanced",       amount: 5999,  date: "20 Mar 2025", status: "rejected" },
  { id: "RB-006", type: "Food",      description: "Team lunch – project milestone",       amount: 2800,  date: "15 Mar 2025", status: "pending"  },
];

const PF_DATA = [
  { month: "April 2025",    employee: 5100, employer: 5100, total: 10200, ytd: 40800 },
  { month: "March 2025",   employee: 5100, employer: 5100, total: 10200, ytd: 30600 },
  { month: "February 2025",employee: 5100, employer: 5100, total: 10200, ytd: 20400 },
  { month: "January 2025", employee: 5100, employer: 5100, total: 10200, ytd: 10200 },
];

const FORM16 = [
  { year: "FY 2024–25", period: "Apr 2024 – Mar 2025", grossSalary: 1020000, taxDeducted: 148800, status: "available" },
  { year: "FY 2023–24", period: "Apr 2023 – Mar 2024", grossSalary: 960000,  taxDeducted: 132000, status: "available" },
  { year: "FY 2022–23", period: "Apr 2022 – Mar 2023", grossSalary: 840000,  taxDeducted: 108000, status: "available" },
];

const TABS = [
  {
    id: "payslips", label: "Pay Slips",
    icon: "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 0 2-2h2a2 2 0 0 0 2 2",
  },
  {
    id: "tax", label: "Tax Declaration",
    icon: "M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z",
  },
  {
    id: "reimbursements", label: "Reimbursements",
    icon: "M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
  },
  {
    id: "pf", label: "PF Details",
    icon: "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z",
  },
  {
    id: "form16", label: "Form 16",
    icon: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(n) {
  return `₹${Number(n).toLocaleString("en-IN")}`;
}

const STATUS_CFG = {
  paid:      { bg: "#dcfce7", text: "#166534", dot: "#22c55e", label: "Paid"      },
  approved:  { bg: "#dcfce7", text: "#166534", dot: "#22c55e", label: "Approved"  },
  pending:   { bg: "#fef9c3", text: "#854d0e", dot: "#f59e0b", label: "Pending"   },
  rejected:  { bg: "#fee2e2", text: "#991b1b", dot: "#ef4444", label: "Rejected"  },
  available: { bg: "#dbeafe", text: "#1e40af", dot: "#3b82f6", label: "Available" },
};

function Badge({ status }) {
  const cfg = STATUS_CFG[status] || STATUS_CFG.pending;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 20, background: cfg.bg, fontSize: 11, fontWeight: 600, color: cfg.text }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.dot, display: "inline-block" }} />
      {cfg.label}
    </span>
  );
}

function DownloadBtn({ small }) {
  const iconD = "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M17 8l-5-5-5 5 M12 3v12";
  if (small) return (
    <button style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 8, color: "#f97316", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
      <Icon d={iconD} size={12} stroke="#f97316" /> Download
    </button>
  );
  return (
    <button style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 20px", background: "#f97316", border: "none", borderRadius: 10, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
      <Icon d={iconD} size={14} stroke="#fff" /> Download
    </button>
  );
}

// ─── Pay Slips Tab ────────────────────────────────────────────────────────────
function PaySlipsTab() {
  const latest = PAYSLIPS[0];
  const [yearFilter, setYearFilter] = useState("All");

  const filtered = yearFilter === "All"
    ? PAYSLIPS
    : PAYSLIPS.filter(p => p.month.includes(yearFilter));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Hero Banner */}
      <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #1e3a5f 100%)", borderRadius: 18, padding: "28px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -30, right: 260, width: 160, height: 160, borderRadius: "50%", background: "rgba(249,115,22,0.06)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -20, left: 200, width: 120, height: 120, borderRadius: "50%", background: "rgba(249,115,22,0.04)", pointerEvents: "none" }} />
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>NET SALARY</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#f97316", background: "rgba(249,115,22,0.12)", padding: "1px 8px", borderRadius: 8 }}>April 2025</span>
          </div>
          <div style={{ fontSize: 40, fontWeight: 800, color: "#fff", letterSpacing: "-1px" }}>
            {fmt(latest.net)}
          </div>
          <div style={{ display: "flex", gap: 20, marginTop: 14 }}>
            <div>
              <div style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.6px" }}>Gross</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#94a3b8", marginTop: 2 }}>{fmt(latest.gross)}</div>
            </div>
            <div style={{ width: 1, background: "#334155" }} />
            <div>
              <div style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.6px" }}>Deductions</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#ef4444", marginTop: 2 }}>−{fmt(latest.deductions)}</div>
            </div>
            <div style={{ width: 1, background: "#334155" }} />
            <div>
              <div style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.6px" }}>Credited On</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#94a3b8", marginTop: 2 }}>{latest.date}</div>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <DownloadBtn />
          <button style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 20px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, color: "#94a3b8", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
            <Icon d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" size={14} stroke="#94a3b8" />
            Preview Slip
          </button>
        </div>
      </div>

      {/* History Table */}
      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #f1f5f9", overflow: "hidden" }}>
        <div style={{ padding: "16px 22px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#1e293b" }}>Payslip History</span>
          <select value={yearFilter} onChange={e => setYearFilter(e.target.value)}
            style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: "6px 12px", fontSize: 12, color: "#6b7280", cursor: "pointer", outline: "none" }}>
            <option value="All">All Year</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
          </select>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#f9fafb" }}>
                {["Month", "Credit Date", "Gross Salary", "Deductions", "Net Salary", "Status", "Action"].map(h => (
                  <th key={h} style={{ padding: "11px 22px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.6px", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <tr key={i} style={{ borderTop: "1px solid #f3f4f6", transition: "background 0.1s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#fafafa"}
                  onMouseLeave={e => e.currentTarget.style.background = "#fff"}>
                  <td style={{ padding: "14px 22px", fontWeight: 600, color: "#1e293b" }}>{p.month}</td>
                  <td style={{ padding: "14px 22px", color: "#6b7280" }}>{p.date}</td>
                  <td style={{ padding: "14px 22px", color: "#374151" }}>{fmt(p.gross)}</td>
                  <td style={{ padding: "14px 22px", color: "#ef4444", fontWeight: 500 }}>−{fmt(p.deductions)}</td>
                  <td style={{ padding: "14px 22px", fontWeight: 700, color: "#22c55e", fontSize: 14 }}>{fmt(p.net)}</td>
                  <td style={{ padding: "14px 22px" }}><Badge status={p.status} /></td>
                  <td style={{ padding: "14px 22px" }}><DownloadBtn small /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Tax Declaration Tab ──────────────────────────────────────────────────────
function TaxDeclarationTab() {
  const totalDeclared = TAX_ITEMS.reduce((s, t) => s + t.declared, 0);
  const totalMax = TAX_ITEMS.reduce((s, t) => s + t.max, 0);
  const taxSaved = Math.round(totalDeclared * 0.3);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
        {[
          { label: "Total Declared",    value: fmt(totalDeclared), color: "#f97316", bg: "#fff7ed", icon: "M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" },
          { label: "Max Eligible",      value: fmt(totalMax),      color: "#3b82f6", bg: "#eff6ff", icon: "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2" },
          { label: "Estimated Tax Saved", value: fmt(taxSaved),    color: "#22c55e", bg: "#f0fdf4", icon: "M20 6L9 17l-5-5" },
        ].map(({ label, value, color, bg, icon }) => (
          <div key={label} style={{ background: "#fff", borderRadius: 14, border: "1px solid #f1f5f9", padding: "20px 22px" }}>
            <div style={{ width: 42, height: 42, borderRadius: 11, background: bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
              <Icon d={icon} size={18} stroke={color} />
            </div>
            <div style={{ fontSize: 10, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#1e293b" }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Declarations */}
      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #f1f5f9", overflow: "hidden" }}>
        <div style={{ padding: "16px 22px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#1e293b" }}>Investment Declarations</div>
            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>FY 2025–26 · Submission deadline: 15 Dec 2025</div>
          </div>
          <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "#f97316", border: "none", borderRadius: 9, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
            <Icon d="M12 5v14M5 12h14" size={13} stroke="#fff" /> Add Declaration
          </button>
        </div>
        <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
          {TAX_ITEMS.map((item, i) => {
            const pct = Math.round((item.declared / item.max) * 100);
            const barColor = pct >= 100 ? "#22c55e" : pct >= 60 ? "#f97316" : "#3b82f6";
            return (
              <div key={i} style={{ padding: "18px 20px", background: "#f9fafb", borderRadius: 14, border: "1px solid #f1f5f9", transition: "box-shadow 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.06)"}
                onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>{item.category}</div>
                    <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 3 }}>{item.items.join(" · ")}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: "#1e293b" }}>{fmt(item.declared)}</div>
                    <div style={{ fontSize: 10, color: "#94a3b8" }}>of {fmt(item.max)}</div>
                  </div>
                </div>
                <div style={{ height: 7, background: "#e5e7eb", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ width: `${pct}%`, height: "100%", background: barColor, borderRadius: 4, transition: "width 0.6s ease" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 7 }}>
                  <span style={{ fontSize: 10, color: "#94a3b8" }}>{pct}% utilized</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: item.declared >= item.max ? "#22c55e" : "#f97316" }}>
                    {item.declared >= item.max ? "Fully utilized ✓" : `${fmt(item.max - item.declared)} remaining`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Reimbursements Tab ───────────────────────────────────────────────────────
function ReimbursementsTab() {
  const [filter, setFilter] = useState("all");
  const TYPE_COLOR = { Travel: "#3b82f6", Medical: "#ef4444", Internet: "#8b5cf6", Education: "#f59e0b", Food: "#22c55e" };
  const filtered = filter === "all" ? REIMBURSEMENTS : REIMBURSEMENTS.filter(r => r.status === filter);
  const totalApproved = REIMBURSEMENTS.filter(r => r.status === "approved").reduce((s, r) => s + r.amount, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
        {[
          { label: "Total Approved",  value: fmt(totalApproved),                                     color: "#22c55e", bg: "#f0fdf4" },
          { label: "Total Requests",  value: REIMBURSEMENTS.length,                                    color: "#3b82f6", bg: "#eff6ff" },
          { label: "Pending Review",  value: REIMBURSEMENTS.filter(r => r.status === "pending").length, color: "#f59e0b", bg: "#fffbeb" },
          { label: "Rejected",        value: REIMBURSEMENTS.filter(r => r.status === "rejected").length,color: "#ef4444", bg: "#fef2f2" },
        ].map(({ label, value, color, bg }) => (
          <div key={label} style={{ background: "#fff", borderRadius: 14, border: "1px solid #f1f5f9", padding: "18px 20px" }}>
            <div style={{ fontSize: 10, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>{label}</div>
            <div style={{ fontSize: 24, fontWeight: 800, color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* List */}
      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #f1f5f9", overflow: "hidden" }}>
        <div style={{ padding: "14px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", gap: 4 }}>
            {["all", "approved", "pending", "rejected"].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{ padding: "5px 14px", borderRadius: 8, border: "none", background: filter === f ? "#f97316" : "#f1f5f9", color: filter === f ? "#fff" : "#6b7280", fontSize: 11, fontWeight: 600, textTransform: "capitalize", cursor: "pointer", transition: "all 0.15s" }}>{f}</button>
            ))}
          </div>
          <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "#f97316", border: "none", borderRadius: 9, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
            <Icon d="M12 5v14M5 12h14" size={13} stroke="#fff" /> New Request
          </button>
        </div>
        <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map((r, i) => {
            const color = TYPE_COLOR[r.type] || "#94a3b8";
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", background: "#f9fafb", borderRadius: 12, border: "1px solid #f1f5f9", transition: "box-shadow 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 14px rgba(0,0,0,0.06)"}
                onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}>
                <div style={{ width: 42, height: 42, borderRadius: 11, background: `${color}15`, border: `1.5px solid ${color}25`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: 14, fontWeight: 800, color }}>{r.type[0]}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{r.description}</div>
                  <div style={{ display: "flex", gap: 10, marginTop: 3 }}>
                    <span style={{ fontSize: 10, color: "#94a3b8" }}>{r.id}</span>
                    <span style={{ fontSize: 10, color: "#94a3b8" }}>·</span>
                    <span style={{ fontSize: 10, color: "#94a3b8" }}>{r.date}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color, background: `${color}12`, padding: "0 6px", borderRadius: 6 }}>{r.type}</span>
                  </div>
                </div>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#1e293b", marginRight: 8 }}>{fmt(r.amount)}</div>
                <Badge status={r.status} />
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "32px 0", color: "#94a3b8", fontSize: 13 }}>No reimbursements found.</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── PF Details Tab ───────────────────────────────────────────────────────────
function PFDetailsTab() {
  const ytdTotal = PF_DATA[0]?.ytd || 0;
  const totalEmployee = PF_DATA.reduce((s, p) => s + p.employee, 0);
  const totalEmployer = PF_DATA.reduce((s, p) => s + p.employer, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* PF Account Banner */}
      <div style={{ background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)", borderRadius: 18, padding: "26px 30px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <Icon d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" size={14} stroke="#f97316" />
          <span style={{ fontSize: 11, color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.7px" }}>PF Account</span>
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 20, fontFamily: "monospace", letterSpacing: 2 }}>
          TN / CHE / 1234567 / 000 / 1234567
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 0 }}>
          {[
            { label: "YTD Balance", value: fmt(ytdTotal), sub: "Total contribution" },
            { label: "Your Share",  value: fmt(totalEmployee), sub: "12% of Basic" },
            { label: "Employer",    value: fmt(totalEmployer), sub: "12% of Basic" },
          ].map(({ label, value, sub }, i) => (
            <div key={label} style={{ borderLeft: i > 0 ? "1px solid #1e3a5f" : "none", paddingLeft: i > 0 ? 28 : 0 }}>
              <div style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.6px" }}>{label}</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#fff", margin: "6px 0 4px" }}>{value}</div>
              <div style={{ fontSize: 10, color: "#475569" }}>{sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Contribution breakdown rings */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {[
          { label: "Employee Contribution", pct: 50, value: fmt(totalEmployee), color: "#3b82f6", note: "Deducted from your salary" },
          { label: "Employer Contribution", pct: 50, value: fmt(totalEmployer), color: "#22c55e", note: "Added by your employer" },
        ].map(({ label, value, color, note }) => (
          <div key={label} style={{ background: "#fff", borderRadius: 14, border: "1px solid #f1f5f9", padding: "20px 22px", display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: `${color}15`, border: `3px solid ${color}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontSize: 12, fontWeight: 800, color }}>50%</span>
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#1e293b" }}>{label}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color, marginTop: 4 }}>{value}</div>
              <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>{note}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Monthly table */}
      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #f1f5f9", overflow: "hidden" }}>
        <div style={{ padding: "16px 22px", borderBottom: "1px solid #f1f5f9" }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#1e293b" }}>Monthly Contributions – FY 2025</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#f9fafb" }}>
                {["Month", "Employee (12%)", "Employer (12%)", "Monthly Total", "YTD Balance"].map(h => (
                  <th key={h} style={{ padding: "11px 22px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PF_DATA.map((p, i) => (
                <tr key={i} style={{ borderTop: "1px solid #f3f4f6", transition: "background 0.1s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#fafafa"}
                  onMouseLeave={e => e.currentTarget.style.background = "#fff"}>
                  <td style={{ padding: "14px 22px", fontWeight: 600, color: "#1e293b" }}>{p.month}</td>
                  <td style={{ padding: "14px 22px", color: "#3b82f6", fontWeight: 600 }}>{fmt(p.employee)}</td>
                  <td style={{ padding: "14px 22px", color: "#22c55e", fontWeight: 600 }}>{fmt(p.employer)}</td>
                  <td style={{ padding: "14px 22px", fontWeight: 700, color: "#1e293b" }}>{fmt(p.total)}</td>
                  <td style={{ padding: "14px 22px" }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#f97316", background: "#fff7ed", padding: "4px 12px", borderRadius: 20 }}>{fmt(p.ytd)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Form 16 Tab ──────────────────────────────────────────────────────────────
function Form16Tab() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Info note */}
      <div style={{ background: "#eff6ff", borderRadius: 14, padding: "16px 20px", border: "1px solid #bfdbfe", display: "flex", gap: 12, alignItems: "flex-start" }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
          <Icon d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" size={16} stroke="#3b82f6" />
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#1e40af", marginBottom: 4 }}>About Form 16</div>
          <div style={{ fontSize: 12, color: "#3b82f6", lineHeight: 1.7 }}>
            Form 16 is a TDS certificate issued under Section 203 of the Income Tax Act. <strong>Part A</strong> contains TDS details and employer/employee PAN. <strong>Part B</strong> contains detailed salary breakup. Use this document while filing your ITR.
          </div>
        </div>
      </div>

      {/* Form 16 cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {FORM16.map((f, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: 16, border: "1px solid #f1f5f9", padding: "22px 26px", display: "flex", alignItems: "center", justifyContent: "space-between", transition: "box-shadow 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = "0 8px 28px rgba(0,0,0,0.07)"}
            onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}>
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              {/* File icon */}
              <div style={{ width: 56, height: 56, borderRadius: 14, background: "linear-gradient(135deg, #fff7ed, #fee7d0)", border: "1.5px solid #fed7aa", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8" size={24} stroke="#f97316" />
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                  <span style={{ fontSize: 16, fontWeight: 800, color: "#1e293b" }}>{f.year}</span>
                  <Badge status={f.status} />
                </div>
                <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>{f.period}</div>
                <div style={{ display: "flex", gap: 22 }}>
                  <div>
                    <span style={{ fontSize: 10, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.4px" }}>Gross Salary</span>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#374151", marginTop: 2 }}>{fmt(f.grossSalary)}</div>
                  </div>
                  <div style={{ width: 1, background: "#f1f5f9" }} />
                  <div>
                    <span style={{ fontSize: 10, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.4px" }}>TDS Deducted</span>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#ef4444", marginTop: 2 }}>{fmt(f.taxDeducted)}</div>
                  </div>
                  <div style={{ width: 1, background: "#f1f5f9" }} />
                  <div>
                    <span style={{ fontSize: 10, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.4px" }}>Effective Rate</span>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#6b7280", marginTop: 2 }}>{((f.taxDeducted / f.grossSalary) * 100).toFixed(1)}%</div>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 18px", background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 10, color: "#374151", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                <Icon d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" size={13} stroke="#6b7280" />
                Preview
              </button>
              <DownloadBtn />
            </div>
          </div>
        ))}
      </div>

      {/* Checklist */}
      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #f1f5f9", padding: "18px 22px" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", marginBottom: 12 }}>Quick Guide – What to do with Form 16</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            "Download Form 16 Part A & Part B separately",
            "Log in to Income Tax portal at incometax.gov.in",
            "Select 'File Income Tax Return' for the relevant AY",
            "Pre-fill data using Form 16 – verify and submit",
            "Keep Form 16 for at least 6 years for record",
          ].map((step, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 22, height: 22, borderRadius: 6, background: "#fff7ed", border: "1.5px solid #fed7aa", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontSize: 10, fontWeight: 800, color: "#f97316" }}>{i + 1}</span>
              </div>
              <span style={{ fontSize: 12, color: "#4b5563" }}>{step}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Payroll Page ────────────────────────────────────────────────────────
export default function PayrollPage() {
  const [activeTab, setActiveTab] = useState("payslips");

  const activeTabData = TABS.find(t => t.id === activeTab);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Tab Bar */}
      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #f1f5f9", overflow: "hidden" }}>
        <div style={{ display: "flex", overflowX: "auto", scrollbarWidth: "none" }}>
          {TABS.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "16px 26px", background: "transparent", border: "none",
                  borderBottom: isActive ? "2px solid #f97316" : "2px solid transparent",
                  color: isActive ? "#f97316" : "#6b7280",
                  fontSize: 13, fontWeight: isActive ? 700 : 500,
                  cursor: "pointer", whiteSpace: "nowrap",
                  transition: "all 0.15s",
                }}>
                <Icon d={tab.icon} size={15} stroke={isActive ? "#f97316" : "currentColor"} sw={isActive ? 2 : 1.8} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "payslips" && <PaySlipsTab />}
      {activeTab === "tax" && <TaxDeclarationTab />}
      {activeTab === "reimbursements" && <ReimbursementsTab />}
      {activeTab === "pf" && <PFDetailsTab />}
      {activeTab === "form16" && <Form16Tab />}
    </div>
  );
}