"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

const BASE = process.env.NEXT_PUBLIC_API_URL;
const HEADERS = () => ({
  Authorization: `Bearer ${localStorage.getItem("employee_auth_token")}`,
  "ngrok-skip-browser-warning": "true",
  Accept: "application/json",
  "Content-Type": "application/json",
});

const Ico = ({ d, size = 16, stroke = "currentColor", sw = 1.8, fill = "none", style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
    strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
    style={{ display: "block", flexShrink: 0, ...style }}>
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);
const I = {
  arrowLeft:  "M19 12H5 M12 19l-7-7 7-7",
  search:     "M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z",
  kanban:     "M3 3h5v18H3z M9 3h5v18H9z M15 3h5v18h-5z",
  list:       "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
  check:      "M20 6L9 17l-5-5",
  clock:      "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2",
  calendar:   "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z",
  folder:     "M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z",
  x:          "M18 6L6 18M6 6l12 12",
  chevRight:  "M9 18l6-6-6-6",
  moreV:      "M12 5h.01M12 12h.01M12 19h.01",
  alertCircle:"M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 8v4M12 16h.01",
  checkCircle:"M22 11.08V12a10 10 0 1 1-5.93-9.14 M22 4L12 14.01l-3-3",
  circle:     "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z",
  tag:        "M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z M7 7h.01",
  user:       "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
};

const PRIORITY_CFG = {
  high:   { dot: "#ef4444", bg: "#fef2f2", text: "#dc2626", label: "High",   bar: "#ef4444" },
  medium: { dot: "#f59e0b", bg: "#fffbeb", text: "#d97706", label: "Medium", bar: "#f59e0b" },
  low:    { dot: "#22c55e", bg: "#f0fdf4", text: "#16a34a", label: "Low",    bar: "#22c55e" },
};
const STATUS_CFG = {
  pending:     { bg: "#fef9c3", text: "#854d0e", dot: "#f59e0b", label: "Pending",     col: "#f59e0b", icon: I.circle      },
  in_progress: { bg: "#dbeafe", text: "#1e40af", dot: "#3b82f6", label: "In Progress", col: "#3b82f6", icon: I.clock       },
  completed:   { bg: "#dcfce7", text: "#166534", dot: "#22c55e", label: "Completed",   col: "#22c55e", icon: I.checkCircle },
  on_hold:     { bg: "#f3f4f6", text: "#6b7280", dot: "#94a3b8", label: "On Hold",     col: "#94a3b8", icon: I.alertCircle },
  planning:    { bg: "#ede9fe", text: "#5b21b6", dot: "#8b5cf6", label: "Planning",    col: "#8b5cf6", icon: I.circle      },
};

const statusKey = s => (s ?? "").toLowerCase().replace(/\s+/g, "_");
const priorityKey = p => (p ?? "").toLowerCase();

const Spinner = ({ size = 20, color = "#f97316" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" style={{ animation: "spin 0.8s linear infinite", display: "block" }}>
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

function PBadge({ p }) {
  const c = PRIORITY_CFG[priorityKey(p)] || PRIORITY_CFG.medium;
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 12, background: c.bg, fontSize: 10, fontWeight: 700, color: c.text }}><span style={{ width: 5, height: 5, borderRadius: "50%", background: c.dot }} />{c.label}</span>;
}
function SBadge({ s }) {
  const c = STATUS_CFG[statusKey(s)] || { bg: "#f3f4f6", text: "#6b7280", dot: "#94a3b8", label: s };
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 12, background: c.bg, fontSize: 10, fontWeight: 700, color: c.text }}><span style={{ width: 5, height: 5, borderRadius: "50%", background: c.dot }} />{c.label}</span>;
}

// ─── Kanban Column ────────────────────────────────────────────────────────────
function KanbanCol({ status, tasks, onToggle, completedIds }) {
  const cfg = STATUS_CFG[statusKey(status)] || STATUS_CFG.pending;
  return (
    <div style={{ flex: "0 0 280px", display: "flex", flexDirection: "column", gap: 0 }}>
      {/* Column header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", background: "#fff", borderRadius: "14px 14px 0 0", border: "1px solid #f1f5f9", borderBottom: `2px solid ${cfg.col}`, marginBottom: 0 }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: cfg.col, flexShrink: 0 }} />
        <span style={{ fontSize: 12, fontWeight: 700, color: "#1e293b", flex: 1 }}>{cfg.label}</span>
        <span style={{ fontSize: 11, fontWeight: 700, background: cfg.bg, color: cfg.text, borderRadius: 20, padding: "1px 8px" }}>{tasks.length}</span>
      </div>
      {/* Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, background: "#f8fafc", borderRadius: "0 0 14px 14px", border: "1px solid #f1f5f9", borderTop: "none", padding: 10, minHeight: 100 }}>
        {tasks.length === 0 ? (
          <div style={{ textAlign: "center", padding: "24px 0", color: "#cbd5e1", fontSize: 12 }}>No tasks</div>
        ) : tasks.map(t => {
          const done = completedIds.has(t.id);
          const pc = PRIORITY_CFG[priorityKey(t.priority)] || PRIORITY_CFG.medium;
          return (
            <div key={t.id} style={{ background: "#fff", borderRadius: 12, border: `1px solid ${done ? "#dcfce7" : "#f1f5f9"}`, padding: "12px 14px", cursor: "pointer", transition: "all 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)"; e.currentTarget.style.borderColor = pc.dot; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = done ? "#dcfce7" : "#f1f5f9"; }}>
              {/* Priority bar */}
              <div style={{ height: 2, background: pc.bar, borderRadius: 1, marginBottom: 10, opacity: 0.7 }} />
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
                <div onClick={() => onToggle(t.id)} style={{ width: 18, height: 18, borderRadius: 5, border: `2px solid ${done ? "#22c55e" : "#d1d5db"}`, background: done ? "#22c55e" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, marginTop: 1, transition: "all 0.15s" }}>
                  {done && <Ico d={I.check} size={10} stroke="#fff" sw={3} />}
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: done ? "#94a3b8" : "#1e293b", lineHeight: 1.4, textDecoration: done ? "line-through" : "none", transition: "all 0.15s" }}>{t.title}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <PBadge p={t.priority} />
                {t.due_date && (
                  <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: "#94a3b8" }}>
                    <Ico d={I.calendar} size={10} stroke="#94a3b8" />
                    {new Date(t.due_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                  </span>
                )}
              </div>
              {t.project && (
                <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid #f3f4f6", display: "flex", alignItems: "center", gap: 5 }}>
                  <Ico d={I.folder} size={11} stroke="#94a3b8" />
                  <span style={{ fontSize: 10, color: "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.project.project_name ?? "Project"}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function TasksPage() {
  const router = useRouter();
  const [allTasks, setAllTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("all");
  const [loading, setLoading] = useState(true);
  const [completedIds, setCompletedIds] = useState(new Set());
  const [view, setView] = useState("kanban");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [search, setSearch] = useState("");

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${BASE}/api/employee/tasks/`, { headers: HEADERS() });
      const json = await res.json();
      let tasks = [];
      if (json.success && Array.isArray(json.data)) tasks = json.data;
      else if (Array.isArray(json.data?.tasks)) tasks = json.data.tasks;
      setAllTasks(tasks);
      const projectMap = new Map();
      tasks.forEach(t => {
        if (t.project && !projectMap.has(t.project.id)) projectMap.set(t.project.id, { ...t.project, taskCount: 0 });
        if (t.project) projectMap.get(t.project.id).taskCount++;
      });
      setProjects([...projectMap.values()]);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const toggle = (id) => setCompletedIds(prev => {
    const n = new Set(prev);
    n.has(id) ? n.delete(id) : n.add(id);
    return n;
  });

  const filtered = allTasks.filter(t => {
    const matchP = selectedProject === "all" || t.project?.id === selectedProject;
    const matchPri = !priorityFilter || priorityKey(t.priority) === priorityFilter;
    const matchQ = !search || t.title?.toLowerCase().includes(search.toLowerCase());
    return matchP && matchPri && matchQ;
  });

  const STATUSES = ["pending", "in_progress", "planning", "on_hold", "completed"];
  const byStatus = STATUSES.reduce((acc, s) => {
    acc[s] = filtered.filter(t => statusKey(t.status) === s || (s === "pending" && !t.status));
    return acc;
  }, {});

  const stats = {
    total:    allTasks.length,
    done:     allTasks.filter(t => statusKey(t.status) === "completed" || completedIds.has(t.id)).length,
    high:     allTasks.filter(t => priorityKey(t.priority) === "high").length,
    inprog:   allTasks.filter(t => statusKey(t.status) === "in_progress").length,
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'Plus Jakarta Sans',-apple-system,sans-serif", display: "flex", flexDirection: "column" }}>
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>

      {/* Top bar */}
      <div style={{ background: "#fff", borderBottom: "1px solid #f1f5f9", padding: "14px 28px", display: "flex", alignItems: "center", gap: 14, position: "sticky", top: 0, zIndex: 100 }}>
        <button onClick={() => router.back()} style={{ display: "flex", alignItems: "center", gap: 7, background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 10, padding: "7px 14px", fontSize: 12, fontWeight: 600, color: "#374151", cursor: "pointer" }}
          onMouseEnter={e => e.currentTarget.style.background = "#f1f5f9"} onMouseLeave={e => e.currentTarget.style.background = "#f9fafb"}>
          <Ico d={I.arrowLeft} size={14} stroke="#374151" /> Dashboard
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#0f172a" }}>My Tasks</h1>
          <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>Track and manage your work</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 10, padding: "7px 12px" }}>
            <Ico d={I.search} size={13} stroke="#94a3b8" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks…" style={{ border: "none", background: "transparent", fontSize: 12, color: "#374151", outline: "none", width: 150 }} />
            {search && <button onClick={() => setSearch("")} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}><Ico d={I.x} size={12} stroke="#94a3b8" /></button>}
          </div>
          <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 10, padding: "8px 12px", fontSize: 12, color: "#374151", cursor: "pointer", outline: "none" }}>
            <option value="">All Priority</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <div style={{ display: "flex", background: "#f1f5f9", borderRadius: 10, padding: 3, gap: 2 }}>
            {[["kanban", I.kanban], ["list", I.list]].map(([v, d]) => (
              <button key={v} onClick={() => setView(v)} style={{ width: 30, height: 30, borderRadius: 8, background: view === v ? "#fff" : "transparent", border: view === v ? "1px solid #e5e7eb" : "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <Ico d={d} size={14} stroke={view === v ? "#f97316" : "#6b7280"} />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Sidebar: project list */}
        <div style={{ width: 256, borderRight: "1px solid #f1f5f9", background: "#fff", padding: "16px 12px", overflowY: "auto", flexShrink: 0 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.8px", padding: "0 8px 8px" }}>Projects</div>
          {/* Stats cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
            {[
              { label: "Total",    value: stats.total,  color: "#f97316" },
              { label: "Done",     value: stats.done,   color: "#22c55e" },
              { label: "High ⚡",  value: stats.high,   color: "#ef4444" },
              { label: "Active",   value: stats.inprog, color: "#3b82f6" },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ background: "#f9fafb", borderRadius: 10, padding: "10px 12px", border: "1px solid #f1f5f9" }}>
                <div style={{ fontSize: 18, fontWeight: 800, color }}>{value}</div>
                <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 500 }}>{label}</div>
              </div>
            ))}
          </div>
          {/* Project filter list */}
          {[{ id: "all", project_name: "All Projects", taskCount: allTasks.length }, ...projects].map(p => {
            const isActive = selectedProject === p.id;
            return (
              <div key={p.id} onClick={() => setSelectedProject(p.id)}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 10, cursor: "pointer", background: isActive ? "#fff7ed" : "transparent", marginBottom: 2, transition: "all 0.12s" }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "#f9fafb"; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}>
                <Ico d={I.folder} size={14} stroke={isActive ? "#f97316" : "#94a3b8"} />
                <span style={{ flex: 1, fontSize: 12, fontWeight: isActive ? 700 : 500, color: isActive ? "#f97316" : "#374151", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.project_name}</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: isActive ? "#f97316" : "#94a3b8", background: isActive ? "#fed7aa" : "#f1f5f9", padding: "1px 7px", borderRadius: 10 }}>{p.taskCount}</span>
              </div>
            );
          })}
        </div>

        {/* Main content */}
        <div style={{ flex: 1, overflowX: "auto", overflowY: "auto", padding: "20px 24px" }}>
          {loading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 100, gap: 12 }}>
              <Spinner /><span style={{ fontSize: 13, color: "#94a3b8" }}>Loading tasks…</span>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #f1f5f9", padding: "60px 40px", textAlign: "center" }}>
              <div style={{ width: 60, height: 60, borderRadius: "50%", background: "#fff7ed", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <Ico d={I.check} stroke="#f97316" size={28} />
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#1e293b", marginBottom: 6 }}>No tasks found</div>
              <div style={{ fontSize: 12, color: "#94a3b8" }}>Try a different project or filter</div>
            </div>
          ) : view === "kanban" ? (
            /* ── Kanban ── */
            <div style={{ display: "flex", gap: 14, minWidth: "max-content", paddingBottom: 20 }}>
              {STATUSES.filter(s => byStatus[s]?.length > 0 || true).map(s => (
                <KanbanCol key={s} status={s} tasks={byStatus[s] ?? []} onToggle={toggle} completedIds={completedIds} />
              ))}
            </div>
          ) : (
            /* ── List view ── */
            <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #f1f5f9", overflow: "hidden" }}>
              {/* Group by project */}
              {(selectedProject === "all" ? projects : projects.filter(p => p.id === selectedProject)).map(proj => {
                const projTasks = filtered.filter(t => t.project?.id === proj.id);
                if (projTasks.length === 0) return null;
                const doneCnt = projTasks.filter(t => completedIds.has(t.id) || statusKey(t.status) === "completed").length;
                return (
                  <div key={proj.id} style={{ borderBottom: "1px solid #f8fafc" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 20px", background: "#f9fafb", borderBottom: "1px solid #f1f5f9" }}>
                      <Ico d={I.folder} size={15} stroke="#f97316" />
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", flex: 1 }}>{proj.project_name}</span>
                      <span style={{ fontSize: 11, color: "#94a3b8" }}>{doneCnt}/{projTasks.length} done</span>
                      <div style={{ width: 80, height: 4, background: "#f1f5f9", borderRadius: 2, overflow: "hidden" }}>
                        <div style={{ width: `${projTasks.length > 0 ? (doneCnt / projTasks.length) * 100 : 0}%`, height: "100%", background: "#22c55e", borderRadius: 2 }} />
                      </div>
                    </div>
                    {projTasks.map((t, i) => {
                      const done = completedIds.has(t.id) || statusKey(t.status) === "completed";
                      const pc = PRIORITY_CFG[priorityKey(t.priority)] || PRIORITY_CFG.medium;
                      return (
                        <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 20px", borderBottom: i < projTasks.length - 1 ? "1px solid #f8fafc" : "none" }}
                          onMouseEnter={e => e.currentTarget.style.background = "#fffbf5"}
                          onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                          <div onClick={() => toggle(t.id)} style={{ width: 18, height: 18, borderRadius: 5, border: `2px solid ${done ? "#22c55e" : "#d1d5db"}`, background: done ? "#22c55e" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, transition: "all 0.15s" }}>
                            {done && <Ico d={I.check} size={10} stroke="#fff" sw={3} />}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <span style={{ fontSize: 13, color: done ? "#94a3b8" : "#1e293b", fontWeight: 500, textDecoration: done ? "line-through" : "none" }}>{t.title}</span>
                            {t.description && <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.description}</div>}
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <PBadge p={t.priority} />
                            <SBadge s={t.status} />
                            {t.due_date && (
                              <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#94a3b8", whiteSpace: "nowrap" }}>
                                <Ico d={I.calendar} size={11} stroke="#94a3b8" />
                                {new Date(t.due_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                              </span>
                            )}
                          </div>
                          {/* Left priority indicator */}
                          <div style={{ width: 3, height: 36, borderRadius: 2, background: pc.bar, flexShrink: 0 }} />
                        </div>
                      );
                    })}
                  </div>
                );
              })}
              {/* Tasks with no project */}
              {(() => {
                const orphans = filtered.filter(t => !t.project);
                if (orphans.length === 0) return null;
                return (
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 20px", background: "#f9fafb", borderBottom: "1px solid #f1f5f9" }}>
                      <Ico d={I.tag} size={15} stroke="#94a3b8" />
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>Unassigned</span>
                      <span style={{ fontSize: 11, color: "#94a3b8" }}>{orphans.length} tasks</span>
                    </div>
                    {orphans.map((t, i) => {
                      const done = completedIds.has(t.id) || statusKey(t.status) === "completed";
                      return (
                        <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 20px", borderBottom: i < orphans.length - 1 ? "1px solid #f8fafc" : "none" }}
                          onMouseEnter={e => e.currentTarget.style.background = "#fffbf5"}
                          onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                          <div onClick={() => toggle(t.id)} style={{ width: 18, height: 18, borderRadius: 5, border: `2px solid ${done ? "#22c55e" : "#d1d5db"}`, background: done ? "#22c55e" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
                            {done && <Ico d={I.check} size={10} stroke="#fff" sw={3} />}
                          </div>
                          <span style={{ flex: 1, fontSize: 13, color: done ? "#94a3b8" : "#1e293b", textDecoration: done ? "line-through" : "none" }}>{t.title}</span>
                          <PBadge p={t.priority} /><SBadge s={t.status} />
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}