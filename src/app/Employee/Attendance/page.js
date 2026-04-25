"use client";
import { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Download,
  FileText,
  Calendar,
  ChevronDown,
  Search,
  Clock,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const attendanceData = [
  { date: "02 Sep 2024", checkIn: "09:12 AM", status: "Present", checkOut: "09:17 PM", break: "14 Min", late: "12 Min", overtime: "-", productionHours: "8.39 Hrs", prodColor: "green" },
  { date: "06 Jul 2024", checkIn: "09:00 AM", status: "Present", checkOut: "07:13 PM", break: "32 Min", late: "-", overtime: "75 Min", productionHours: "9.15 Hrs", prodColor: "green" },
  { date: "10 Dec 2024", checkIn: "-", status: "Absent", checkOut: "-", break: "-", late: "-", overtime: "-", productionHours: "0.00 Hrs", prodColor: "red" },
  { date: "12 Apr 2024", checkIn: "09:00 AM", status: "Present", checkOut: "06:43 PM", break: "23 Min", late: "-", overtime: "10 Min", productionHours: "8.22 Hrs", prodColor: "green" },
  { date: "14 Jan 2024", checkIn: "09:32 AM", status: "Present", checkOut: "06:45 PM", break: "30 Min", late: "32 Min", overtime: "20 Min", productionHours: "8.55 Hrs", prodColor: "green" },
  { date: "15 Mar 2024", checkIn: "09:00 AM", status: "Present", checkOut: "06:23 PM", break: "41 Min", late: "-", overtime: "50 Min", productionHours: "8.35 Hrs", prodColor: "green" },
  { date: "15 Nov 2024", checkIn: "09:00 AM", status: "Present", checkOut: "08:15 PM", break: "12 Min", late: "-", overtime: "-", productionHours: "8.30 Hrs", prodColor: "green" },
  { date: "20 Apr 2024", checkIn: "09:00 AM", status: "Present", checkOut: "07:15 PM", break: "03 Min", late: "-", overtime: "-", productionHours: "8.32 Hrs", prodColor: "green" },
  { date: "20 Feb 2024", checkIn: "09:00 AM", status: "Present", checkOut: "06:13 PM", break: "50 Min", late: "-", overtime: "33 Min", productionHours: "8.45 Hrs", prodColor: "green" },
  { date: "21 Jan 2024", checkIn: "09:00 AM", status: "Present", checkOut: "06:12 PM", break: "20 Min", late: "-", overtime: "-", productionHours: "7.54 Hrs", prodColor: "red" },
];

function StatCard({ icon, iconBg, value, total, label, trend, trendUp, trendColor }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 flex-1 min-w-0">
      <div className="flex items-start justify-between mb-2">
        <div className={`w-9 h-9 ${iconBg} rounded-lg flex items-center justify-center`}>{icon}</div>
      </div>
      <div className="flex items-baseline gap-1.5 mb-1">
        <span className="text-2xl font-bold text-gray-800">{value}</span>
        <span className="text-sm text-gray-400">/ {total}</span>
      </div>
      <p className="text-xs text-gray-500 mb-2">{label}</p>
      <div className={`flex items-center gap-1 text-xs ${trendColor}`}>
        {trendUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
        <span>{trend}</span>
      </div>
    </div>
  );
}

export default function AttendancePage() {
  const [search, setSearch] = useState("");

  const filtered = attendanceData.filter(
    (row) =>
      row.date.toLowerCase().includes(search.toLowerCase()) ||
      row.status.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 bg-gray-50 overflow-y-auto">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Employee Attendance</h1>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-400">
            <span>🏠</span>
            <span>›</span>
            <span>Attendance</span>
            <span>›</span>
            <span className="text-gray-600">Employee Attendance</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 text-orange-500">
            <Clock size={15} />
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-500">
            <FileText size={15} />
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50">
            <Download size={13} />
            <span>Export</span>
            <ChevronDown size={12} />
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 rounded-lg text-xs text-white hover:bg-orange-600">
            <FileText size={13} />
            <span>Report</span>
          </button>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* Top Section: Punch Card + Stats */}
        <div className="flex gap-4">
          {/* Punch Card */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 w-72 shrink-0 text-center">
            <p className="text-sm text-gray-500">Good Morning, Adrian</p>
            <p className="text-sm font-semibold text-gray-700 mt-0.5">08:35 AM, 11 Mar 2025</p>
            <div className="my-4 flex justify-center">
              <div className="w-20 h-20 rounded-full border-4 border-blue-100 overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-blue-300 to-blue-500 flex items-center justify-center">
                  <span className="text-white text-2xl">👤</span>
                </div>
              </div>
            </div>
            <div className="inline-flex items-center gap-1.5 bg-orange-100 text-orange-600 text-xs px-3 py-1.5 rounded-full mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
              Production : 3.45 hrs
            </div>
            <p className="text-xs text-gray-500 mb-3">
              <span className="text-yellow-500">●</span> Punch In at 10.00 AM
            </p>
            <button className="w-full bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium py-2.5 rounded-lg transition-colors">
              Punch Out
            </button>
          </div>

          {/* Stats Grid */}
          <div className="flex-1 grid grid-cols-2 gap-4">
            <StatCard icon={<span className="text-orange-500 text-base">⏱</span>} iconBg="bg-orange-50" value="8.36" total="9" label="Total Hours Today" trend="5% This Week" trendUp={true} trendColor="text-green-500" />
            <StatCard icon={<span className="text-gray-700 text-base">📅</span>} iconBg="bg-gray-100" value="10" total="40" label="Total Hours Week" trend="7% Last Week" trendUp={true} trendColor="text-green-500" />
            <StatCard icon={<span className="text-blue-500 text-base">📊</span>} iconBg="bg-blue-50" value="75" total="98" label="Total Hours Month" trend="8% Last Month" trendUp={false} trendColor="text-red-500" />
            <StatCard icon={<span className="text-pink-500 text-base">⚡</span>} iconBg="bg-pink-50" value="16" total="28" label="Overtime this Month" trend="6% Last Month" trendUp={false} trendColor="text-red-500" />
          </div>
        </div>

        {/* Timeline Bar */}
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="grid grid-cols-4 gap-4 mb-3">
            {[
              { dot: "bg-green-500", label: "Total Working hours", value: "12h 36m" },
              { dot: "bg-blue-500", label: "Productive Hours", value: "08h 36m" },
              { dot: "bg-yellow-500", label: "Break hours", value: "22m 15s" },
              { dot: "bg-purple-500", label: "Overtime", value: "02h 15m" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${item.dot}`}></span>
                <div>
                  <p className="text-[10px] text-gray-400">{item.label}</p>
                  <p className="text-sm font-bold text-gray-800">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden flex">
            <div className="h-full bg-green-400 rounded-l-full" style={{ width: "42%" }} />
            <div className="h-full bg-yellow-400" style={{ width: "6%" }} />
            <div className="h-full bg-green-500" style={{ width: "26%" }} />
            <div className="h-full bg-yellow-300" style={{ width: "4%" }} />
            <div className="h-full bg-blue-500" style={{ width: "4%" }} />
            <div className="h-full bg-purple-400 rounded-r-full" style={{ width: "8%" }} />
          </div>
          <div className="flex justify-between mt-1">
            {["06:00","07:00","08:00","09:00","10:00","11:00","12:00","01:00","02:00","03:00","04:00","05:00","06:00","07:00","08:00","09:00","10:00","11:00"].map((t, i) => (
              <span key={i} className="text-[9px] text-gray-400">{t}</span>
            ))}
          </div>
        </div>

        {/* Attendance Table */}
        <div className="bg-white rounded-xl border border-gray-100">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-700">Employee Attendance</h2>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs text-gray-500 border border-gray-200 rounded-lg px-2.5 py-1.5">
                <Calendar size={13} />
                <span>04/11/2026 - 04/17/2026</span>
              </div>
              <button className="flex items-center gap-1 text-xs text-gray-500 border border-gray-200 rounded-lg px-2.5 py-1.5 hover:bg-gray-50">
                Select Status <ChevronDown size={12} />
              </button>
              <button className="flex items-center gap-1 text-xs text-gray-500 border border-gray-200 rounded-lg px-2.5 py-1.5 hover:bg-gray-50">
                Sort By : Last 7 Days <ChevronDown size={12} />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-50">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>Row Per Page</span>
              <select className="border border-gray-200 rounded px-2 py-1 text-xs">
                <option>10</option>
                <option>25</option>
                <option>50</option>
              </select>
              <span>Entries</span>
            </div>
            <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-1.5">
              <Search size={12} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="text-xs outline-none w-32 placeholder:text-gray-400"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100">
                  {["Date","Check In","Status","Check Out","Break","Late","Overtime","Production Hours"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-gray-500 font-medium text-[11px]">
                      <div className="flex items-center gap-1">
                        {h}
                        <svg width="8" height="12" viewBox="0 0 8 12" fill="none">
                          <path d="M4 0L7 4H1L4 0Z" fill="#d1d5db" />
                          <path d="M4 12L1 8H7L4 12Z" fill="#d1d5db" />
                        </svg>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 text-gray-600">{row.date}</td>
                    <td className="px-5 py-3 text-gray-600">{row.checkIn}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${row.status === "Present" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${row.status === "Present" ? "bg-green-500" : "bg-red-500"}`}></span>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-600">{row.checkOut}</td>
                    <td className="px-5 py-3 text-gray-600">{row.break}</td>
                    <td className="px-5 py-3 text-gray-600">{row.late}</td>
                    <td className="px-5 py-3 text-gray-600">{row.overtime}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${row.prodColor === "green" ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
                        <Clock size={10} />
                        {row.productionHours}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">Showing 1 - 10 of 10 entries</p>
            <div className="flex items-center gap-1">
              <button className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 hover:bg-gray-50 text-gray-500">
                <ChevronLeft size={13} />
              </button>
              <button className="w-7 h-7 flex items-center justify-center rounded bg-blue-600 text-white text-xs font-medium">
                1
              </button>
              <button className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 hover:bg-gray-50 text-gray-500">
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Settings FAB */}
      <button className="fixed bottom-6 right-6 w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg hover:bg-blue-700 transition-colors">
        <Settings size={18} />
      </button>
    </div>
  );
}