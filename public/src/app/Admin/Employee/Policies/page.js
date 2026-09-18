"use client";
import { useState } from "react";

const policies = [
  { id: 1, title: "Leave Policy",          dept: "HR",              updated: "01 Jan 2025", status: "Active",   icon: "📋", color: "#3b82f6" },
  { id: 2, title: "Work From Home Policy", dept: "All Departments", updated: "15 Feb 2025", status: "Active",   icon: "🏠", color: "#22c55e" },
  { id: 3, title: "Code of Conduct",       dept: "All Departments", updated: "10 Mar 2025", status: "Active",   icon: "📜", color: "#f97316" },
  { id: 4, title: "IT Security Policy",    dept: "IT Management",   updated: "05 Apr 2025", status: "Active",   icon: "🔒", color: "#6366f1" },
  { id: 5, title: "Travel Policy",         dept: "Sales",           updated: "20 Jan 2025", status: "Inactive", icon: "✈️", color: "#ec4899" },
  { id: 6, title: "Anti-Harassment Policy",dept: "HR",              updated: "01 Jan 2025", status: "Active",   icon: "🛡️", color: "#14b8a6" },
];

export default function Policies() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const filtered = policies.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) &&
    (filter === "All" || p.status === filter)
  );

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-bold text-gray-800">Policies</h3>
        <div className="flex items-center gap-2">
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search policies…"
            className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-orange-400 w-44" />
          <select value={filter} onChange={e => setFilter(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 outline-none text-gray-500">
            <option>All</option><option>Active</option><option>Inactive</option>
          </select>
          <button className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 text-gray-500">📥 Export</button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-orange-500 hover:bg-orange-600">
            ➕ Add Policy
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(p => (
          <div key={p.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl" style={{ backgroundColor: p.color + "15" }}>
                {p.icon}
              </div>
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                style={p.status === "Active"
                  ? { backgroundColor: "#dcfce7", color: "#16a34a" }
                  : { backgroundColor: "#fee2e2", color: "#dc2626" }}>
                • {p.status}
              </span>
            </div>
            <h4 className="text-sm font-bold text-gray-800 mb-1">{p.title}</h4>
            <p className="text-xs text-gray-400 mb-3">{p.dept}</p>
            <div className="flex items-center justify-between text-[11px] text-gray-400 pt-3 border-t border-gray-100">
              <span>Updated: {p.updated}</span>
              <div className="flex items-center gap-2">
                <button className="hover:text-blue-500 transition-colors">✏️</button>
                <button className="hover:text-red-500 transition-colors">🗑️</button>
                <button className="hover:text-green-500 transition-colors font-semibold text-gray-500">View →</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-3xl mb-2">📋</p>
          <p className="text-sm">No policies found</p>
        </div>
      )}
    </div>
  );
}