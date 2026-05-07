"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import {
  TrendingUp, TrendingDown, Search, Download, RefreshCw,
  Users, Target, Award, Flame, Zap, Brain, Trophy,
  ArrowUpRight, ArrowDownRight, ArrowUp, ArrowDown, Minus,
  CheckCircle2, AlertCircle, Clock, Calendar,
  ChevronRight, ChevronDown, X, MoreVertical,
  Sparkles, Crown, Medal, Star,
  BarChart3, Activity as ActivityIcon, Gauge,
  Coffee, Sunrise, Sun, Sunset, Moon,
  Filter, Eye, Share2, MessageSquare,
  Briefcase, Layers, Rocket, Lightbulb,
  ThumbsUp, ThumbsDown, Heart, Smile,
  Grid3x3, List as ListIcon, ArrowRight, ChevronLeft,
} from "lucide-react";

// ─── API CONFIG ────────────────────────────────────────────────────────────
const API_BASE = "https://api.pencilkraft.in/api/admin/productivity/dashboard";
const AUTH_TOKEN = "416|qu2wN0p3iQaewkDPVqfGwckDYyspTXag8Z8jmZU3dab4a47f";

// ─── HELPERS ───────────────────────────────────────────────────────────────
const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const SHORT_MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const QUARTERS = ["Q1 (Jan–Mar)","Q2 (Apr–Jun)","Q3 (Jul–Sep)","Q4 (Oct–Dec)"];

function getInitials(name) {
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

const AVATAR_COLORS = ["#ec4899","#6366f1","#22c55e","#14b8a6","#8b5cf6","#ef4444","#f97316","#0ea5e9","#f59e0b","#10b981"];
function avatarColor(id) { return AVATAR_COLORS[id % AVATAR_COLORS.length]; }

function assignLevel(productivity) {
  if (productivity >= 6) return "Champion";
  if (productivity >= 3) return "Pro";
  return "Rising";
}

function rankChange(trend) {
  if (trend > 0) return "up";
  if (trend < 0) return "down";
  return "same";
}

const levelConfig = {
  Champion: { color: "#f59e0b", bg: "#fef3c7", icon: Crown,  label: "Champion" },
  Pro:      { color: "#6366f1", bg: "#e0e7ff", icon: Medal,  label: "Pro"      },
  Rising:   { color: "#22c55e", bg: "#dcfce7", icon: Rocket, label: "Rising"   },
};

// ─── TREND CHIP ────────────────────────────────────────────────────────────
const TrendChip = ({ value, change }) => {
  const isUp = change === "up";
  const isDown = change === "down";
  const Icon = isUp ? ArrowUpRight : isDown ? ArrowDownRight : Minus;
  const color = isUp ? "#22c55e" : isDown ? "#ef4444" : "#94a3b8";
  const bg = isUp ? "#dcfce7" : isDown ? "#fee2e2" : "#f1f5f9";
  return (
    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ color, backgroundColor: bg }}>
      <Icon size={10} strokeWidth={2.5} />
      {value > 0 ? "+" : ""}{typeof value === "number" ? value.toFixed(1) : value}
    </div>
  );
};

// ─── PRODUCTIVITY RING ─────────────────────────────────────────────────────
const ProductivityRing = ({ value, size = 72, stroke = 7, color = "#f97316", max = 10 }) => {
  const pct = Math.min(100, (value / max) * 100);
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f1f5f9" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.6s ease" }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-sm font-extrabold text-gray-800 leading-none">{typeof value === "number" ? value.toFixed(1) : value}</span>
        <span className="text-[8px] text-gray-400 font-medium">/{max}</span>
      </div>
    </div>
  );
};

// ─── HERO METRIC ───────────────────────────────────────────────────────────
const HeroMetric = ({ icon: Icon, label, value, suffix, change, changeType, gradient, subText }) => {
  const isUp = changeType === "up";
  return (
    <div className="relative rounded-2xl p-5 overflow-hidden text-white shadow-md hover:shadow-lg transition-all"
      style={{ background: gradient }}>
      <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10" />
      <div className="absolute -bottom-12 -left-4 w-24 h-24 rounded-full bg-white/5" />
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Icon size={20} strokeWidth={1.8} />
          </div>
          {change !== undefined && (
            <div className="flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg bg-white/20 backdrop-blur-sm">
              {isUp ? <ArrowUpRight size={11} strokeWidth={2.5} /> : <ArrowDownRight size={11} strokeWidth={2.5} />}
              {change}
            </div>
          )}
        </div>
        <p className="text-xs font-medium opacity-80 mb-1">{label}</p>
        <div className="flex items-baseline gap-1">
          <p className="text-3xl font-extrabold">{value}</p>
          {suffix && <p className="text-sm opacity-80">{suffix}</p>}
        </div>
        {subText && <p className="text-[11px] opacity-70 mt-1">{subText}</p>}
      </div>
    </div>
  );
};

// ─── WEEKLY TREND CHART ────────────────────────────────────────────────────
const WeeklyTrendChart = ({ data }) => {
  const [hovered, setHovered] = useState(null);
  const W = 560, H = 200;
  const PAD = { top: 16, right: 20, bottom: 36, left: 40 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const allVals = data.map(d => d.productivity).filter(v => v > 0);
  const maxVal = allVals.length ? Math.ceil(Math.max(...allVals) * 1.2) : 10;
  const minVal = 0;

  const xOf = (i) => PAD.left + (data.length > 1 ? (i / (data.length - 1)) * innerW : innerW / 2);
  const yOf = (v) => PAD.top + innerH - ((v - minVal) / (maxVal - minVal || 1)) * innerH;

  const prodPoints = data.map((d, i) => [xOf(i), yOf(d.productivity)]);

  const toPolyline = (pts) => pts.map(p => p.join(",")).join(" ");
  const toArea = (pts) => {
    const base = `${PAD.left},${PAD.top + innerH} `;
    const top = pts.map(p => p.join(",")).join(" ");
    const end = ` ${PAD.left + innerW},${PAD.top + innerH}`;
    return base + top + end;
  };

  const gridCount = 5;
  const gridLines = Array.from({ length: gridCount }, (_, i) => Math.round(minVal + (i / (gridCount - 1)) * (maxVal - minVal)));

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-gray-800">Weekly Performance Trend</h3>
          <p className="text-[11px] text-gray-400 mt-0.5">Team average productivity</p>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-medium">
          <span className="w-3 h-3 rounded-full inline-block" style={{ background: "#f97316" }} />
          Productivity
        </div>
      </div>
      <div className="mb-3 h-9 flex items-center">
        {hovered !== null ? (
          <div className="flex items-center gap-4 px-4 py-2 rounded-xl bg-gray-900 text-white text-[11px] font-semibold shadow-lg">
            <span className="text-gray-400">{data[hovered]?.week}</span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-orange-500 inline-block" />
              Productivity: <span className="text-orange-400">{data[hovered]?.productivity?.toFixed(1)}</span>
            </span>
          </div>
        ) : (
          <p className="text-[11px] text-gray-400 italic">Hover a data point to see details</p>
        )}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 200, overflow: "visible" }}>
        <defs>
          <linearGradient id="prodFill2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f97316" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
          </linearGradient>
        </defs>
        {gridLines.map(v => {
          const y = yOf(v);
          return (
            <g key={v}>
              <line x1={PAD.left} y1={y} x2={PAD.left + innerW} y2={y} stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
              <text x={PAD.left - 8} y={y + 4} textAnchor="end" fontSize="10" fill="#94a3b8" fontFamily="inherit">{v}</text>
            </g>
          );
        })}
        {data.map((d, i) => (
          <text key={i} x={xOf(i)} y={H - 6} textAnchor="middle" fontSize="9" fill="#94a3b8" fontFamily="inherit" fontWeight="600">{d.week}</text>
        ))}
        <polygon points={toArea(prodPoints)} fill="url(#prodFill2)" />
        <polyline points={toPolyline(prodPoints)} fill="none" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {hovered !== null && (
          <line x1={xOf(hovered)} y1={PAD.top} x2={xOf(hovered)} y2={PAD.top + innerH} stroke="#e2e8f0" strokeWidth="1.5" strokeDasharray="4 3" />
        )}
        {prodPoints.map(([cx, cy], i) => (
          <g key={`prod-${i}`}>
            {hovered === i && <circle cx={cx} cy={cy} r="10" fill="#f97316" fillOpacity="0.12" />}
            <circle cx={cx} cy={cy} r={hovered === i ? 5 : 4}
              fill={hovered === i ? "#f97316" : "white"} stroke="#f97316" strokeWidth="2.5"
              style={{ cursor: "pointer" }}
              onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)} />
          </g>
        ))}
        {hovered !== null && (() => {
          const [px, py] = prodPoints[hovered];
          return (
            <text x={px} y={py - 10} textAnchor="middle" fontSize="10" fontWeight="700" fill="#f97316" fontFamily="inherit">
              {data[hovered].productivity?.toFixed(1)}
            </text>
          );
        })()}
      </svg>
    </div>
  );
};

// ─── PEAK HOURS CARD ───────────────────────────────────────────────────────
const PeakHoursCard = ({ peakHours }) => {
  const activeHours = peakHours?.filter(h => h.intensity > 0) || [];
  const maxIntensity = activeHours.length ? Math.max(...activeHours.map(h => h.intensity)) : 1;

  const periods = [
    { label: "Morning", icon: Sunrise, range: [6, 12], color: "#f97316" },
    { label: "Midday", icon: Sun, range: [12, 15], color: "#eab308" },
    { label: "Afternoon", icon: Sunset, range: [15, 18], color: "#ec4899" },
    { label: "Evening", icon: Moon, range: [18, 24], color: "#8b5cf6" },
  ];

  const periodScores = periods.map(p => {
    const relevant = peakHours?.filter(h => h.hour >= p.range[0] && h.hour < p.range[1]) || [];
    const avg = relevant.length ? relevant.reduce((a, b) => a + b.intensity, 0) / relevant.length : 0;
    return { ...p, score: avg };
  });

  const maxScore = Math.max(...periodScores.map(p => p.score), 0.01);

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-gray-800">Peak Productivity Hours</h3>
          <p className="text-[11px] text-gray-400 mt-0.5">When the team performs best</p>
        </div>
        <Brain size={16} className="text-orange-500" />
      </div>
      <div className="space-y-3">
        {periodScores.map(p => {
          const PIcon = p.icon;
          const pct = maxScore > 0 ? (p.score / maxScore) * 100 : 0;
          return (
            <div key={p.label}>
              <div className="flex items-center gap-3 mb-1.5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${p.color}15` }}>
                  <PIcon size={14} style={{ color: p.color }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-700">{p.label}</span>
                    <span className="text-xs font-bold text-gray-800">{p.score.toFixed(1)}</span>
                  </div>
                  <p className="text-[10px] text-gray-400">{p.range[0]}:00 – {p.range[1]}:00</p>
                </div>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden ml-11">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: p.color }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── DEPT CARD ─────────────────────────────────────────────────────────────
const DeptCard = ({ deptPerformance }) => {
  const colors = ["#ec4899","#6366f1","#14b8a6","#ef4444","#0ea5e9","#f97316","#22c55e","#8b5cf6"];
  const sorted = [...(deptPerformance || [])].sort((a, b) => b.avg_productivity - a.avg_productivity);
  const maxScore = Math.max(...sorted.map(d => d.avg_productivity), 0.01);

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-gray-800">Department Performance</h3>
          <p className="text-[11px] text-gray-400 mt-0.5">Avg productivity by team</p>
        </div>
      </div>
      <div className="space-y-3">
        {sorted.map((d, i) => (
          <div key={d.department}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-gray-300 w-3">#{i + 1}</span>
                <span className="text-xs font-semibold text-gray-700">{d.department}</span>
              </div>
              <span className="text-xs font-bold text-gray-800">{d.avg_productivity?.toFixed(1)}</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: `${(d.avg_productivity / maxScore) * 100}%`, backgroundColor: colors[i % colors.length] }} />
            </div>
          </div>
        ))}
        {sorted.length === 0 && <p className="text-xs text-gray-400 text-center py-4">No department data</p>}
      </div>
    </div>
  );
};

// ─── LEADERBOARD CARD ──────────────────────────────────────────────────────
const LeaderboardCard = ({ employees, onSelect }) => {
  const top3 = employees.slice(0, 3);
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
            <Trophy size={14} className="text-amber-500" />
            Top Performers
          </h3>
          <p className="text-[11px] text-gray-400 mt-0.5">This period's productivity champions</p>
        </div>
      </div>
      <div className="flex items-end justify-center gap-2 mb-5 h-36">
        {top3[1] && (
          <div className="flex flex-col items-center cursor-pointer group" onClick={() => onSelect(top3[1])}>
            <div className="relative mb-2">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-sm font-bold border-4 border-gray-200 group-hover:scale-110 transition-transform" style={{ backgroundColor: avatarColor(top3[1].id) }}>
                {getInitials(top3[1].name)}
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center">
                <span className="text-[9px] font-extrabold text-white">2</span>
              </div>
            </div>
            <p className="text-[10px] font-bold text-gray-700 truncate max-w-[80px]">{top3[1].name.split(" ")[0]}</p>
            <p className="text-[9px] text-gray-400">{top3[1].productivity?.toFixed(1)}</p>
            <div className="w-16 h-12 bg-gradient-to-t from-gray-200 to-gray-100 rounded-t-lg mt-1 flex items-start justify-center pt-1">
              <Medal size={12} className="text-gray-400" />
            </div>
          </div>
        )}
        {top3[0] && (
          <div className="flex flex-col items-center cursor-pointer group" onClick={() => onSelect(top3[0])}>
            <Crown size={16} className="text-amber-400 mb-1" />
            <div className="relative mb-2">
              <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-base font-bold border-4 border-amber-300 shadow-lg group-hover:scale-110 transition-transform" style={{ backgroundColor: avatarColor(top3[0].id) }}>
                {getInitials(top3[0].name)}
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-400 border-2 border-white flex items-center justify-center">
                <span className="text-[9px] font-extrabold text-white">1</span>
              </div>
            </div>
            <p className="text-[10px] font-bold text-gray-800 truncate max-w-[80px]">{top3[0].name.split(" ")[0]}</p>
            <p className="text-[9px] text-amber-500 font-bold">{top3[0].productivity?.toFixed(1)}</p>
            <div className="w-16 h-16 bg-gradient-to-t from-amber-300 to-amber-200 rounded-t-lg mt-1 flex items-start justify-center pt-1.5">
              <Trophy size={14} className="text-amber-600" />
            </div>
          </div>
        )}
        {top3[2] && (
          <div className="flex flex-col items-center cursor-pointer group" onClick={() => onSelect(top3[2])}>
            <div className="relative mb-2">
              <div className="w-11 h-11 rounded-full flex items-center justify-center text-white text-xs font-bold border-4 border-orange-200 group-hover:scale-110 transition-transform" style={{ backgroundColor: avatarColor(top3[2].id) }}>
                {getInitials(top3[2].name)}
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-orange-400 border-2 border-white flex items-center justify-center">
                <span className="text-[9px] font-extrabold text-white">3</span>
              </div>
            </div>
            <p className="text-[10px] font-bold text-gray-700 truncate max-w-[80px]">{top3[2].name.split(" ")[0]}</p>
            <p className="text-[9px] text-gray-400">{top3[2].productivity?.toFixed(1)}</p>
            <div className="w-16 h-9 bg-gradient-to-t from-orange-200 to-orange-100 rounded-t-lg mt-1 flex items-start justify-center pt-1">
              <Medal size={12} className="text-orange-500" />
            </div>
          </div>
        )}
        {employees.length === 0 && (
          <p className="text-xs text-gray-400">No data available</p>
        )}
      </div>
      <div className="border-t border-gray-100 pt-3 space-y-1">
        {employees.slice(3, 6).map((emp, idx) => (
          <div key={emp.id} onClick={() => onSelect(emp)}
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-orange-50/40 cursor-pointer transition-colors">
            <span className="text-[11px] font-bold text-gray-300 w-4">#{idx + 4}</span>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[10px] font-bold" style={{ backgroundColor: avatarColor(emp.id) }}>
              {getInitials(emp.name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-700 truncate">{emp.name}</p>
              <p className="text-[10px] text-gray-400 truncate">{emp.department}</p>
            </div>
            <span className="text-xs font-bold text-gray-700">{emp.productivity?.toFixed(1)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── EMPLOYEE CARD ─────────────────────────────────────────────────────────
const EmployeeProductivityCard = ({ emp, rank, onClick }) => {
  const lvl = assignLevel(emp.productivity);
  const level = levelConfig[lvl];
  const LevelIcon = level.icon;
  const isTop = rank <= 3;

  return (
    <div onClick={onClick}
      className="relative bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-lg hover:border-orange-200 transition-all cursor-pointer group overflow-hidden">
      {isTop && (
        <div className="absolute top-0 right-0 bg-gradient-to-bl from-amber-400 to-orange-500 text-white text-[9px] font-extrabold px-3 py-1 rounded-bl-xl">
          TOP {rank}
        </div>
      )}
      <div className="flex items-start gap-3 mb-4">
        <div className="relative shrink-0">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-sm font-bold shadow-sm" style={{ backgroundColor: avatarColor(emp.id) }}>
            {getInitials(emp.name)}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-800 truncate">{emp.name}</p>
          <p className="text-[11px] text-gray-400 truncate">{emp.designation}</p>
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold" style={{ color: level.color, backgroundColor: level.bg }}>
              <LevelIcon size={9} />
              {level.label}
            </span>
            <TrendChip value={emp.trend} change={rankChange(emp.trend)} />
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center gap-4 mb-4 py-3 bg-gradient-to-br from-orange-50/60 to-pink-50/40 rounded-xl">
        <ProductivityRing value={emp.productivity} color="#f97316" max={10} />
        <div className="flex flex-col gap-2">
          <div>
            <div className="flex items-center gap-1 mb-0.5">
              <Brain size={10} className="text-pink-500" />
              <span className="text-[9px] font-semibold text-gray-500">Focus</span>
            </div>
            <span className="text-sm font-bold text-gray-800">{emp.focus?.toFixed(1)}</span>
          </div>
          <div>
            <div className="flex items-center gap-1 mb-0.5">
              <Clock size={10} className="text-amber-500" />
              <span className="text-[9px] font-semibold text-gray-500">Hours</span>
            </div>
            <span className="text-sm font-bold text-gray-800">{emp.worked_hours?.toFixed(1)}h</span>
          </div>
        </div>
      </div>
      <div className="pt-3 border-t border-gray-100 flex items-center gap-2">
        <Sparkles size={11} className="text-amber-400 shrink-0" />
        <p className="text-[10px] text-gray-500 leading-snug truncate">{emp.department} · {emp.designation}</p>
      </div>
    </div>
  );
};

// ─── EMPLOYEE ROW ──────────────────────────────────────────────────────────
const EmployeeRow = ({ emp, rank, onClick }) => {
  const lvl = assignLevel(emp.productivity);
  const level = levelConfig[lvl];
  return (
    <tr onClick={onClick} className="hover:bg-orange-50/40 cursor-pointer transition-colors group border-b border-gray-100 last:border-0">
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-extrabold w-5 ${rank <= 3 ? "text-amber-500" : "text-gray-300"}`}>#{rank}</span>
          {rank === 1 && <Crown size={12} className="text-amber-400" />}
        </div>
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: avatarColor(emp.id) }}>
            {getInitials(emp.name)}
          </div>
          <div>
            <p className="text-xs font-bold text-gray-800">{emp.name}</p>
            <p className="text-[10px] text-gray-400">{emp.designation} · {emp.department}</p>
          </div>
        </div>
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-2 min-w-[140px]">
          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-orange-400 to-pink-500" style={{ width: `${Math.min(100, (emp.productivity / 10) * 100)}%` }} />
          </div>
          <span className="text-xs font-bold text-gray-700 w-9 text-right">{emp.productivity?.toFixed(1)}</span>
        </div>
      </td>
      <td className="py-3 px-4 text-xs font-bold text-gray-700">{emp.focus?.toFixed(1)}</td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-1">
          <Clock size={11} className="text-orange-500" />
          <span className="text-xs font-bold text-gray-700">{emp.worked_hours?.toFixed(1)}h</span>
        </div>
      </td>
      <td className="py-3 px-4">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ color: level.color, backgroundColor: level.bg }}>
          {level.label}
        </span>
      </td>
      <td className="py-3 px-4"><TrendChip value={emp.trend} change={rankChange(emp.trend)} /></td>
      <td className="py-3 px-4">
        <button className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-700 opacity-0 group-hover:opacity-100 transition-all">
          <ChevronRight size={14} />
        </button>
      </td>
    </tr>
  );
};

// ─── EMPLOYEE DRAWER ───────────────────────────────────────────────────────
const EmployeeDrawer = ({ emp, rank, onClose }) => {
  if (!emp) return null;
  const lvl = assignLevel(emp.productivity);
  const level = levelConfig[lvl];
  const LevelIcon = level.icon;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]" onClick={onClose}
        style={{ animation: "fadeIn .2s ease" }} />
      <div className="fixed top-0 right-0 h-full z-50 w-[480px] bg-white shadow-2xl flex flex-col"
        style={{ animation: "slideRight .25s cubic-bezier(.4,0,.2,1)" }}>
        <style>{`@keyframes slideRight{from{opacity:0;transform:translateX(40px)}to{opacity:1;transform:translateX(0)}}@keyframes fadeIn{from{opacity:0}to{opacity:1}}`}</style>
        <div className="relative px-6 py-5 border-b border-gray-100 bg-gradient-to-br from-orange-500 to-pink-500 text-white overflow-hidden">
          <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-white/10" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/5" />
          <div className="relative">
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-bold border-2 border-white/40 shadow-lg" style={{ backgroundColor: avatarColor(emp.id) }}>
                  {getInitials(emp.name)}
                </div>
                <div>
                  <h3 className="text-lg font-bold">{emp.name}</h3>
                  <p className="text-xs opacity-80">{emp.designation}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 backdrop-blur-sm">
                      <LevelIcon size={10} />{level.label}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 backdrop-blur-sm">
                      Rank #{rank}
                    </span>
                  </div>
                </div>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-white/80 hover:bg-white/20">
                <X size={15} />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center">
                <p className="text-2xl font-extrabold">{emp.productivity?.toFixed(1)}</p>
                <p className="text-[10px] opacity-80 font-medium">Productivity</p>
              </div>
              <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center">
                <p className="text-2xl font-extrabold">{emp.focus?.toFixed(1)}</p>
                <p className="text-[10px] opacity-80 font-medium">Focus</p>
              </div>
              <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center">
                <p className="text-2xl font-extrabold">{emp.worked_hours?.toFixed(1)}</p>
                <p className="text-[10px] opacity-80 font-medium">Hours Worked</p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-100">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-400 flex items-center justify-center shrink-0">
                <Sparkles size={14} className="text-white" />
              </div>
              <div>
                <p className="text-xs font-bold text-amber-800 mb-1">AI Insight</p>
                <p className="text-[11px] text-amber-700 leading-snug">
                  {emp.productivity >= 6 ? "Exceptional performer. Consider recognizing their contributions publicly." :
                   emp.productivity >= 3 ? "Solid contributor. Consider scheduling 1:1s during peak hours for best engagement." :
                   "Needs support. Schedule a check-in to understand blockers and provide guidance."}
                </p>
              </div>
            </div>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Achievements</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: Trophy,  color: "#f59e0b", bg: "#fef3c7", label: "Top Performer",  earned: rank <= 3 },
                { icon: Brain,   color: "#ec4899", bg: "#fdf2f8", label: "Focus Master",   earned: emp.focus >= 5 },
                { icon: Rocket,  color: "#6366f1", bg: "#e0e7ff", label: "Rising Star",    earned: emp.trend > 2 },
                { icon: Clock,   color: "#22c55e", bg: "#dcfce7", label: "Hard Worker",    earned: emp.worked_hours >= 8 },
                { icon: Target,  color: "#f97316", bg: "#fff7ed", label: "High Output",    earned: emp.productivity >= 5 },
                { icon: Zap,     color: "#eab308", bg: "#fef9c3", label: "Speed Demon",    earned: emp.productivity >= 7 },
              ].map((a, i) => {
                const AIcon = a.icon;
                return (
                  <div key={i} className={`rounded-xl p-3 text-center transition-all ${a.earned ? "" : "opacity-30 grayscale"}`} style={{ backgroundColor: a.bg }}>
                    <AIcon size={20} style={{ color: a.color }} className="mx-auto mb-1" />
                    <p className="text-[9px] font-bold leading-tight" style={{ color: a.color }}>{a.label}</p>
                  </div>
                );
              })}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Recommendations</p>
            <div className="space-y-2">
              {[
                { icon: Lightbulb, color: "#f97316", title: "Try focus blocks", desc: "Schedule 90-min deep work sessions in the morning" },
                { icon: Coffee,    color: "#8b5cf6", title: "Take strategic breaks", desc: "5-min breaks every hour boost output by 15%" },
                { icon: Target,    color: "#22c55e", title: "Set daily goals", desc: "Define 3 priority tasks each morning" },
              ].map((r, i) => {
                const RIcon = r.icon;
                return (
                  <div key={i} className="flex gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${r.color}15` }}>
                      <RIcon size={14} style={{ color: r.color }} />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-gray-800 mb-0.5">{r.title}</p>
                      <p className="text-[11px] text-gray-500">{r.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex gap-2">
          <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-500 text-white rounded-xl text-xs font-bold hover:bg-orange-600 transition-colors">
            <Eye size={13} /> Full Report
          </button>
          <button className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-50">
            <MessageSquare size={13} />
          </button>
          <button className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-50">
            <Share2 size={13} />
          </button>
        </div>
      </div>
    </>
  );
};

// ─── MONTH PICKER POPOVER ──────────────────────────────────────────────────
const MonthPicker = ({ selectedYear, selectedMonth, onChange, onClose }) => {
  const [year, setYear] = useState(selectedYear || new Date().getFullYear());
  const currentYear = new Date().getFullYear();

  return (
    <div className="absolute top-full left-0 mt-2 z-50 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 w-64"
      style={{ animation: "fadeIn .15s ease" }}>
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => setYear(y => y - 1)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500">
          <ChevronLeft size={14} />
        </button>
        <span className="text-sm font-bold text-gray-800">{year}</span>
        <button onClick={() => setYear(y => Math.min(y + 1, currentYear))} disabled={year >= currentYear}
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 disabled:opacity-30">
          <ChevronRight size={14} />
        </button>
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        {SHORT_MONTHS.map((m, i) => {
          const isFuture = year === currentYear && i > new Date().getMonth();
          const isSelected = selectedYear === year && selectedMonth === i + 1;
          return (
            <button key={m} disabled={isFuture}
              onClick={() => { onChange(year, i + 1); onClose(); }}
              className={`py-2 rounded-xl text-xs font-semibold transition-all ${
                isSelected ? "bg-orange-500 text-white shadow-sm" :
                isFuture ? "text-gray-300 cursor-not-allowed" :
                "hover:bg-orange-50 text-gray-700"}`}>
              {m}
            </button>
          );
        })}
      </div>
      <button onClick={onClose} className="mt-3 w-full text-[11px] text-gray-400 hover:text-gray-600 font-medium py-1">Cancel</button>
    </div>
  );
};

// ─── QUARTER PICKER POPOVER ────────────────────────────────────────────────
const QuarterPicker = ({ selectedYear, selectedQuarter, onChange, onClose }) => {
  const [year, setYear] = useState(selectedYear || new Date().getFullYear());
  const currentYear = new Date().getFullYear();
  const currentQ = Math.ceil((new Date().getMonth() + 1) / 3);

  return (
    <div className="absolute top-full left-0 mt-2 z-50 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 w-64"
      style={{ animation: "fadeIn .15s ease" }}>
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => setYear(y => y - 1)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500">
          <ChevronLeft size={14} />
        </button>
        <span className="text-sm font-bold text-gray-800">{year}</span>
        <button onClick={() => setYear(y => Math.min(y + 1, currentYear))} disabled={year >= currentYear}
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 disabled:opacity-30">
          <ChevronRight size={14} />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {QUARTERS.map((q, i) => {
          const qNum = i + 1;
          const isFuture = year === currentYear && qNum > currentQ;
          const isSelected = selectedYear === year && selectedQuarter === qNum;
          return (
            <button key={q} disabled={isFuture}
              onClick={() => { onChange(year, qNum); onClose(); }}
              className={`py-3 px-3 rounded-xl text-xs font-semibold transition-all text-left ${
                isSelected ? "bg-orange-500 text-white shadow-sm" :
                isFuture ? "text-gray-300 cursor-not-allowed bg-gray-50" :
                "hover:bg-orange-50 text-gray-700 border border-gray-100"}`}>
              <div className="font-bold text-sm mb-0.5">Q{qNum}</div>
              <div className="text-[10px] opacity-70">{["Jan–Mar","Apr–Jun","Jul–Sep","Oct–Dec"][i]}</div>
            </button>
          );
        })}
      </div>
      <button onClick={onClose} className="mt-3 w-full text-[11px] text-gray-400 hover:text-gray-600 font-medium py-1">Cancel</button>
    </div>
  );
};

// ─── PERIOD SELECTOR ───────────────────────────────────────────────────────
const PeriodSelector = ({ period, onPeriodChange, monthYear, quarterYear, onMonthChange, onQuarterChange }) => {
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showQuarterPicker, setShowQuarterPicker] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setShowMonthPicker(false);
        setShowQuarterPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const getLabel = (p) => {
    if (p === "Month" && monthYear) {
      return `${SHORT_MONTHS[monthYear.month - 1]} ${monthYear.year}`;
    }
    if (p === "Quarter" && quarterYear) {
      return `Q${quarterYear.quarter} ${quarterYear.year}`;
    }
    return p;
  };

  return (
    <div className="relative flex items-center gap-1 bg-gray-50 rounded-xl p-1 border border-gray-200" ref={ref}>
      {["Today", "Week", "Month", "Quarter"].map(d => (
        <div key={d} className="relative">
          <button
            onClick={() => {
              onPeriodChange(d);
              if (d === "Month") { setShowMonthPicker(true); setShowQuarterPicker(false); }
              else if (d === "Quarter") { setShowQuarterPicker(true); setShowMonthPicker(false); }
              else { setShowMonthPicker(false); setShowQuarterPicker(false); }
            }}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap ${
              period === d ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
            {getLabel(d)}
            {(d === "Month" || d === "Quarter") && period === d && (
              <ChevronDown size={9} className="inline ml-1 opacity-60" />
            )}
          </button>
        </div>
      ))}
      {showMonthPicker && (
        <MonthPicker
          selectedYear={monthYear?.year} selectedMonth={monthYear?.month}
          onChange={onMonthChange} onClose={() => setShowMonthPicker(false)} />
      )}
      {showQuarterPicker && (
        <QuarterPicker
          selectedYear={quarterYear?.year} selectedQuarter={quarterYear?.quarter}
          onChange={onQuarterChange} onClose={() => setShowQuarterPicker(false)} />
      )}
    </div>
  );
};

// ─── MAIN PAGE ─────────────────────────────────────────────────────────────
export default function ProductivityPage() {
  const [view, setView] = useState("grid");
  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState("Week");
  const [sortBy, setSortBy] = useState("productivity");
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [selectedEmpRank, setSelectedEmpRank] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const now = new Date();
  const [monthYear, setMonthYear] = useState({ year: now.getFullYear(), month: now.getMonth() + 1 });
  const [quarterYear, setQuarterYear] = useState({
    year: now.getFullYear(),
    quarter: Math.ceil((now.getMonth() + 1) / 3),
  });

  const buildApiPeriod = () => {
    if (period === "Today") return "today";
    if (period === "Week") return "week";
    if (period === "Month") return `month&month=${monthYear.month}&year=${monthYear.year}`;
    if (period === "Quarter") return `quarter&quarter=${quarterYear.quarter}&year=${quarterYear.year}`;
    return "week";
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const periodParam = buildApiPeriod();
      const url = `${API_BASE}?period=${periodParam}&page=1&per_page=50&sort=${sortBy}&sort_order=desc`;
      const res = await fetch(url, {
        headers: {
          "Authorization": `Bearer ${AUTH_TOKEN}`,
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [period, sortBy, monthYear, quarterYear]);

  const allEmployees = useMemo(() => data?.all_employees?.data || [], [data]);

  const filtered = useMemo(() => {
    return allEmployees.filter(e =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.designation?.toLowerCase().includes(search.toLowerCase()) ||
      e.department?.toLowerCase().includes(search.toLowerCase())
    );
  }, [allEmployees, search]);

  const stats = useMemo(() => {
    if (!allEmployees.length) return { avgProd: 0, avgFocus: 0, totalHours: 0, champions: 0 };
    const avgProd = allEmployees.reduce((a, b) => a + b.productivity, 0) / allEmployees.length;
    const avgFocus = allEmployees.reduce((a, b) => a + b.focus, 0) / allEmployees.length;
    const totalHours = allEmployees.reduce((a, b) => a + b.worked_hours, 0);
    const champions = allEmployees.filter(e => assignLevel(e.productivity) === "Champion").length;
    return {
      avgProd: avgProd.toFixed(1),
      avgFocus: avgFocus.toFixed(1),
      totalHours: totalHours.toFixed(1),
      champions,
    };
  }, [allEmployees]);

  const topPerformers = data?.top_performers || [];
  const weeklyTrend = data?.weekly_trend || [];
  const peakHours = data?.peak_hours || [];
  const deptPerformance = data?.department_performance || [];
  const insights = data?.insights || [];

  const handleSelectEmp = (emp, rank) => {
    setSelectedEmp(emp);
    setSelectedEmpRank(rank);
  };

  const getPeriodLabel = () => {
    if (period === "Month") return `${MONTH_NAMES[monthYear.month - 1]} ${monthYear.year}`;
    if (period === "Quarter") return `Q${quarterYear.quarter} ${quarterYear.year}`;
    return period;
  };

  return (
    <div className="space-y-5">
      <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}}`}</style>

      {/* ── Top Bar ── */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px] flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 border border-gray-200 focus-within:border-orange-300 transition-colors">
          <Search size={14} className="text-gray-400 shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search employees..."
            className="bg-transparent text-xs outline-none text-gray-700 w-full placeholder:text-gray-400" />
        </div>

        <PeriodSelector
          period={period}
          onPeriodChange={setPeriod}
          monthYear={monthYear}
          quarterYear={quarterYear}
          onMonthChange={(y, m) => setMonthYear({ year: y, month: m })}
          onQuarterChange={(y, q) => setQuarterYear({ year: y, quarter: q })}
        />

        <div className="flex items-center gap-2">
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}
            className="text-xs px-3 py-2 border border-gray-200 rounded-xl bg-white text-gray-600 font-medium outline-none cursor-pointer hover:border-orange-300">
            <option value="productivity">Sort: Productivity</option>
            <option value="focus">Sort: Focus</option>
            <option value="worked_hours">Sort: Hours</option>
          </select>
          <div className="flex items-center bg-gray-50 rounded-xl p-1 border border-gray-200">
            <button onClick={() => setView("grid")}
              className={`w-8 h-7 rounded-lg flex items-center justify-center transition-all ${view === "grid" ? "bg-white text-orange-500 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}>
              <Grid3x3 size={13} />
            </button>
            <button onClick={() => setView("list")}
              className={`w-8 h-7 rounded-lg flex items-center justify-center transition-all ${view === "list" ? "bg-white text-orange-500 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}>
              <ListIcon size={13} />
            </button>
          </div>
          <button onClick={fetchData} className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 border border-gray-200 hover:bg-gray-50">
            <RefreshCw size={13} className={loading ? "animate-spin text-orange-500" : ""} />
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50">
            <Download size={13} /> Export
          </button>
        </div>
      </div>

      {/* ── Period Badge ── */}
      {(period === "Month" || period === "Quarter") && (
        <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 border border-orange-100 rounded-xl">
          <Calendar size={13} className="text-orange-500" />
          <span className="text-xs font-semibold text-orange-700">
            Showing data for: <span className="font-bold">{getPeriodLabel()}</span>
          </span>
          {data?.date_range && (
            <span className="text-xs text-orange-500 ml-1">
              ({data.date_range.start} – {data.date_range.end})
            </span>
          )}
        </div>
      )}

      {/* ── Error ── */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl">
          <AlertCircle size={16} className="text-red-500 shrink-0" />
          <p className="text-xs text-red-700 font-medium">Failed to load data: {error}</p>
          <button onClick={fetchData} className="ml-auto text-xs font-bold text-red-600 hover:underline">Retry</button>
        </div>
      )}

      {/* ── Loading Skeleton ── */}
      {loading && !data && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 rounded-2xl bg-gradient-to-r from-gray-100 to-gray-50 animate-pulse" />
          ))}
        </div>
      )}

      {/* ── Hero Metrics ── */}
      {(data || !loading) && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <HeroMetric icon={TrendingUp} label="Avg Productivity" value={stats.avgProd} suffix="/10"
            subText={`${allEmployees.length} employees tracked`}
            gradient="linear-gradient(135deg, #f97316 0%, #ec4899 100%)" />
          <HeroMetric icon={Brain} label="Avg Focus Score" value={stats.avgFocus} suffix="/10"
            subText="Team concentration levels"
            gradient="linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)" />
          <HeroMetric icon={Clock} label="Total Hours Worked" value={stats.totalHours} suffix="hrs"
            subText="Combined team hours"
            gradient="linear-gradient(135deg, #22c55e 0%, #14b8a6 100%)" />
          <HeroMetric icon={Crown} label="Champions" value={stats.champions} suffix="active"
            subText="Productivity ≥ 6.0"
            gradient="linear-gradient(135deg, #6366f1 0%, #0ea5e9 100%)" />
        </div>
      )}

      {/* ── Charts Row 1 ── */}
      {data && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <WeeklyTrendChart data={weeklyTrend} />
          </div>
          <LeaderboardCard employees={topPerformers} onSelect={(emp) => {
            const rank = topPerformers.findIndex(e => e.id === emp.id) + 1;
            handleSelectEmp(emp, rank);
          }} />
        </div>
      )}

      {/* ── Charts Row 2 ── */}
      {data && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <PeakHoursCard peakHours={peakHours} />
          <DeptCard deptPerformance={deptPerformance} />
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                  <Sparkles size={14} className="text-orange-500" />
                  Smart Insights
                </h3>
                <p className="text-[11px] text-gray-400 mt-0.5">AI-powered recommendations</p>
              </div>
            </div>
            <div className="space-y-2.5">
              {insights.length > 0 ? insights.map((insight, i) => (
                <div key={i} className="flex gap-3 p-3 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all cursor-pointer">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-orange-50">
                    <Lightbulb size={14} className="text-orange-500" />
                  </div>
                  <p className="text-[11px] text-gray-700 leading-snug flex-1">{insight}</p>
                </div>
              )) : (
                <p className="text-xs text-gray-400 text-center py-4">No insights available for this period</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Employees ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-gray-800">All Employees</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">
              {filtered.length} of {allEmployees.length} employees · sorted by {sortBy}
            </p>
          </div>
        </div>

        {loading && data && (
          <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-orange-50 rounded-xl">
            <RefreshCw size={12} className="animate-spin text-orange-500" />
            <span className="text-[11px] text-orange-600 font-medium">Refreshing data…</span>
          </div>
        )}

        {view === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
            {filtered.map((emp, idx) => (
              <EmployeeProductivityCard key={emp.id} emp={emp} rank={idx + 1}
                onClick={() => handleSelectEmp(emp, idx + 1)} />
            ))}
            {filtered.length === 0 && !loading && (
              <div className="col-span-full text-center py-16 bg-white rounded-2xl border border-gray-100">
                <Users size={32} className="mx-auto text-gray-300 mb-2" />
                <p className="text-sm text-gray-500 font-medium">No employees found</p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {["Rank", "Employee", "Productivity", "Focus", "Hours", "Level", "Trend", ""].map(h => (
                      <th key={h} className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest py-3 px-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((emp, idx) => (
                    <EmployeeRow key={emp.id} emp={emp} rank={idx + 1}
                      onClick={() => handleSelectEmp(emp, idx + 1)} />
                  ))}
                </tbody>
              </table>
            </div>
            {filtered.length === 0 && !loading && (
              <div className="text-center py-12">
                <Users size={28} className="mx-auto text-gray-300 mb-2" />
                <p className="text-sm text-gray-500 font-medium">No employees found</p>
              </div>
            )}
          </div>
        )}
      </div>

      {selectedEmp && (
        <EmployeeDrawer emp={selectedEmp} rank={selectedEmpRank} onClose={() => setSelectedEmp(null)} />
      )}
    </div>
  );
}