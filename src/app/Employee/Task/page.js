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
  grip:       "M9 5h.01M15 5h.01M9 12h.01M15 12h.01M9 19h.01M15 19h.01",
};

const PRIORITY_CFG = {
  high:   { dot: "#ef4444", bg: "#fef2f2", text: "#dc2626", label: "High",   bar: "#ef4444" },
  medium: { dot: "#f59e0b", bg: "#fffbeb", text: "#d97706", label: "Medium", bar: "#f59e0b" },
  low:    { dot: "#22c55e", bg: "#f0fdf4", text: "#16a34a", label: "Low",    bar: "#22c55e" },
};

// Matches DB enum exactly: pending, in_progress, completed, overdue
const STATUS_CFG = {
  pending:     { bg: "#fef9c3", text: "#854d0e", dot: "#f59e0b", label: "Pending",     col: "#f59e0b", icon: I.circle      },
  in_progress: { bg: "#dbeafe", text: "#1e40af", dot: "#3b82f6", label: "In Progress", col: "#3b82f6", icon: I.clock       },
  overdue:     { bg: "#fee2e2", text: "#991b1b", dot: "#ef4444", label: "Overdue",     col: "#ef4444", icon: I.alertCircle },
  completed:   { bg: "#dcfce7", text: "#166534", dot: "#22c55e", label: "Completed",   col: "#22c55e", icon: I.checkCircle },
};

const STATUSES = ["pending", "in_progress", "overdue", "completed"];

const statusKey = s => {
  const k = (s ?? "").toLowerCase().replace(/\s+/g, "_");
  return STATUS_CFG[k] ? k : "pending";
};
const priorityKey = p => (p ?? "").toLowerCase();

// ── Auto-overdue: if due_date passed and not completed, treat as overdue ──
const effectiveStatus = (task) => {
  const raw = statusKey(task?.status);
  if (raw === "completed") return "completed";
  if (task?.due_date) {
    const due = new Date(task.due_date);
    due.setHours(23, 59, 59, 999);
    if (new Date() > due) return "overdue";
  }
  return raw;
};

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
  const c = STATUS_CFG[statusKey(s)];
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 12, background: c.bg, fontSize: 10, fontWeight: 700, color: c.text }}><span style={{ width: 5, height: 5, borderRadius: "50%", background: c.dot }} />{c.label}</span>;
}

// ─── Kanban Card ──────────────────────────────────────────────────────────────
function KanbanCard({ t, onToggle, onOpen, completedIds, onDragStart, onDragEnd, isDragging, updating }) {
  const st = effectiveStatus(t);
  const done = completedIds.has(t.id) || st === "completed";
  const pc = PRIORITY_CFG[priorityKey(t.priority)] || PRIORITY_CFG.medium;

  return (
    <div
      draggable={!updating}
      onDragStart={(e) => onDragStart(e, t)}
      onDragEnd={onDragEnd}
      style={{
        background: "#fff",
        borderRadius: 12,
        border: `1px solid ${done ? "#dcfce7" : "#f1f5f9"}`,
        padding: "12px 14px",
        cursor: updating ? "wait" : "grab",
        transition: "opacity 0.18s ease, transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease",
        opacity: isDragging ? 0 : 1,
        transform: isDragging ? "scale(0.96)" : "scale(1)",
        position: "relative",
      }}
      onMouseEnter={e => {
        if (isDragging) return;
        e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.10)";
        e.currentTarget.style.borderColor = pc.dot;
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.borderColor = done ? "#dcfce7" : "#f1f5f9";
        e.currentTarget.style.transform = "scale(1)";
      }}
    >
      {/* grip hint, top right */}
      <div style={{ position: "absolute", top: 10, right: 10, opacity: 0.25 }}>
        <Ico d={I.grip} size={12} stroke="#94a3b8" />
      </div>

      {/* Priority bar */}
      <div style={{ height: 2, background: pc.bar, borderRadius: 1, marginBottom: 10, opacity: 0.7 }} />

      <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
        <div
          onClick={(e) => { e.stopPropagation(); onToggle(t.id); }}
          style={{
            width: 18, height: 18, borderRadius: 5,
            border: `2px solid ${done ? "#22c55e" : "#d1d5db"}`,
            background: done ? "#22c55e" : "transparent",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", flexShrink: 0, marginTop: 1, transition: "all 0.15s",
          }}
        >
          {done && <Ico d={I.check} size={10} stroke="#fff" sw={3} />}
        </div>
        <span
          onClick={(e) => { e.stopPropagation(); onOpen(t.id); }}
          style={{
            fontSize: 13, fontWeight: 600,
            color: done ? "#94a3b8" : "#1e293b",
            lineHeight: 1.4,
            textDecoration: done ? "line-through" : "none",
            transition: "all 0.15s", paddingRight: 12,
            cursor: "pointer",
          }}
        >{t.title}</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <PBadge p={t.priority} />
        {t.due_date && (
          <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: st === "overdue" ? "#dc2626" : "#94a3b8", fontWeight: st === "overdue" ? 700 : 400 }}>
            <Ico d={I.calendar} size={10} stroke={st === "overdue" ? "#dc2626" : "#94a3b8"} />
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
}

// ─── Kanban Column ────────────────────────────────────────────────────────────
function KanbanCol({ status, tasks, onToggle, onOpen, completedIds, onDrop, onDragStart, onDragEnd, draggingId, dragOverCol, onDragEnter, onDragLeave, updatingId }) {
  const cfg = STATUS_CFG[statusKey(status)];
  const isOver = dragOverCol === status;
  const isOverdueCol = status === "overdue";

  return (
    <div style={{ flex: "0 0 280px", display: "flex", flexDirection: "column", gap: 0 }}>
      {/* Column header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", background: "#fff", borderRadius: "14px 14px 0 0", border: "1px solid #f1f5f9", borderBottom: `2px solid ${cfg.col}` }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: cfg.col, flexShrink: 0 }} />
        <span style={{ fontSize: 12, fontWeight: 700, color: "#1e293b", flex: 1 }}>{cfg.label}</span>
        <span style={{ fontSize: 11, fontWeight: 700, background: cfg.bg, color: cfg.text, borderRadius: 20, padding: "1px 8px" }}>{tasks.length}</span>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { if (!isOverdueCol) e.preventDefault(); }}
        onDragEnter={() => { if (!isOverdueCol) onDragEnter(status); }}
        onDragLeave={onDragLeave}
        onDrop={(e) => onDrop(e, status)}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          background: isOver ? `${cfg.col}0D` : "#f8fafc",
          borderRadius: "0 0 14px 14px",
          border: `1px solid ${isOver ? cfg.col + "55" : "#f1f5f9"}`,
          borderTop: "none",
          padding: 10,
          minHeight: 140,
          transition: "background 0.15s ease, border-color 0.15s ease",
        }}
      >
        {tasks.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "28px 0",
            color: isOver ? cfg.col : "#cbd5e1",
            fontSize: 12,
            fontWeight: isOver ? 700 : 400,
            border: `2px dashed ${isOver ? cfg.col : "transparent"}`,
            borderRadius: 10,
            transition: "all 0.15s ease",
          }}>
            {isOver ? "Drop here" : (isOverdueCol ? "Auto-managed" : "No tasks")}
          </div>
        ) : (
          <>
            {tasks.map(t => (
              <KanbanCard
                key={t.id}
                t={t}
                onToggle={onToggle}
                onOpen={onOpen}
                completedIds={completedIds}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                isDragging={draggingId === t.id}
                updating={updatingId === t.id}
              />
            ))}
            {isOver && draggingId && !isOverdueCol && (
              <div style={{
                height: 56,
                borderRadius: 12,
                border: `2px dashed ${cfg.col}`,
                background: `${cfg.col}0D`,
                animation: "pulseBox 1.1s ease-in-out infinite",
              }} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Task Detail Drawer ───────────────────────────────────────────────────────
function MetaRow({ icon, label, value, danger }) {
  return (
    <div style={{ background: "#f9fafb", borderRadius: 10, padding: "10px 12px", border: "1px solid #f1f5f9" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: "#94a3b8", fontWeight: 600, marginBottom: 3 }}>
        <Ico d={icon} size={11} stroke="#94a3b8" />
        {label}
      </div>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: danger ? "#dc2626" : "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {value}
      </div>
    </div>
  );
}

function TaskDetailDrawer({ task, loading, onClose, onStatusChange }) {
  if (!task) return null;
  const st = effectiveStatus(task);
  const sc = STATUS_CFG[st];
  const pc = PRIORITY_CFG[priorityKey(task.priority)] || PRIORITY_CFG.medium;

  const fmt = (d) => d ? new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric"
  }) : "—";

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{
        position: "fixed", inset: 0, background: "rgba(15,23,42,0.45)",
        zIndex: 200, animation: "fadeIn 0.15s ease",
      }} />

      {/* Drawer */}
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0, width: 460,
        maxWidth: "92vw", background: "#fff", zIndex: 201,
        boxShadow: "-12px 0 40px rgba(0,0,0,0.14)",
        display: "flex", flexDirection: "column",
        animation: "slideIn 0.22s ease",
        fontFamily: "'Plus Jakarta Sans',-apple-system,sans-serif",
      }}>
        {/* Header */}
        <div style={{
          padding: "18px 22px", borderBottom: "1px solid #f1f5f9",
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.6px" }}>
              Task #{task.id ?? "—"}
            </div>
          </div>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: 8, border: "1px solid #e5e7eb",
            background: "#fff", cursor: "pointer", display: "flex",
            alignItems: "center", justifyContent: "center",
          }}>
            <Ico d={I.x} size={15} stroke="#6b7280" />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "22px" }}>
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12, padding: 60 }}>
              <Spinner />
              <span style={{ fontSize: 13, color: "#94a3b8" }}>Loading task…</span>
            </div>
          ) : (
            <>
              <h2 style={{ margin: "0 0 12px", fontSize: 20, fontWeight: 800, color: "#0f172a", lineHeight: 1.35 }}>
                {task.title}
              </h2>

              <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
                <SBadge s={st} />
                <PBadge p={task.priority} />
              </div>

              {task.description && (
                <div style={{ marginBottom: 22 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 6 }}>
                    Description
                  </div>
                  <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.6, background: "#f9fafb", borderRadius: 10, padding: "12px 14px", whiteSpace: "pre-wrap" }}>
                    {task.description}
                  </div>
                </div>
              )}

              {/* Meta grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 22 }}>
                <MetaRow icon={I.calendar} label="Start Date" value={fmt(task.start_date)} />
                <MetaRow icon={I.calendar} label="Due Date" value={fmt(task.due_date)} danger={st === "overdue"} />
                <MetaRow icon={I.folder} label="Project" value={task.project?.project_name ?? "—"} />
                <MetaRow icon={I.user} label="Created By" value={task.creator?.name ?? "—"} />
              </div>

              {/* Status changer */}
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 8 }}>
                  Status
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {STATUSES.filter(s => s !== "overdue").map(s => {
                    const c = STATUS_CFG[s];
                    const active = st === s;
                    return (
                      <button key={s} onClick={() => onStatusChange(task, s)}
                        style={{
                          display: "flex", alignItems: "center", gap: 6,
                          padding: "8px 14px", borderRadius: 10,
                          border: `1.5px solid ${active ? c.col : "#e5e7eb"}`,
                          background: active ? c.bg : "#fff",
                          color: active ? c.text : "#6b7280",
                          fontSize: 12, fontWeight: 700, cursor: "pointer",
                          transition: "all 0.15s",
                        }}>
                        <span style={{ width: 7, height: 7, borderRadius: "50%", background: c.dot }} />
                        {c.label}
                      </button>
                    );
                  })}
                </div>

                {st === "overdue" && (
                  <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "10px 14px" }}>
                    <Ico d={I.alertCircle} size={16} stroke="#dc2626" />
                    <span style={{ fontSize: 12, color: "#991b1b", fontWeight: 600 }}>
                      This task is past its deadline
                    </span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
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

  // drag state
  const [draggingTask, setDraggingTask] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  // detail drawer state
  const [detailTask, setDetailTask] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

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

  // ── Update status via API, with optimistic UI ──────────────────────
  const updateTaskStatus = async (task, newStatus) => {
    const prevStatus = task.status;
    setUpdatingId(task.id);

    // optimistic update
    setAllTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus } : t));
    // sync drawer if open
    setDetailTask(prev => (prev && prev.id === task.id) ? { ...prev, status: newStatus } : prev);

    try {
      const res = await fetch(`${BASE}/api/employee/tasks/${task.id}/status`, {
        method: "PUT",
        headers: HEADERS(),
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
    } catch (e) {
      console.error(e);
      // revert on failure
      setAllTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: prevStatus } : t));
      setDetailTask(prev => (prev && prev.id === task.id) ? { ...prev, status: prevStatus } : prev);
      alert("Couldn't update task status. Please try again.");
    } finally {
      setUpdatingId(null);
    }
  };

  // ── Open task detail (fetch fresh) ─────────────────────────────────
  const openTaskDetail = async (taskId) => {
    // Use cached task object immediately for snappy UX
    const cached = allTasks.find(t => t.id === taskId);
    setDetailTask(cached ?? { id: taskId });
    setDetailLoading(true);
    try {
      const res = await fetch(`${BASE}/api/employee/tasks/${taskId}`, { headers: HEADERS() });
      const json = await res.json();
      if (json.success && json.data) setDetailTask(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setDetailLoading(false);
    }
  };

  // ── Drag handlers ───────────────────────────────────────────────────
  const handleDragStart = (e, task) => {
    setDraggingTask(task);
    e.dataTransfer.effectAllowed = "move";
  };
  const handleDragEnd = () => {
    setDraggingTask(null);
    setDragOverCol(null);
  };
  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    setDragOverCol(null);
    if (!draggingTask) return;
    // Block manual drop into Overdue — it's auto-managed
    if (newStatus === "overdue") { setDraggingTask(null); return; }
    const current = effectiveStatus(draggingTask);
    if (current === newStatus) { setDraggingTask(null); return; }
    updateTaskStatus(draggingTask, newStatus);
    setDraggingTask(null);
  };

  const filtered = allTasks.filter(t => {
    const matchP = selectedProject === "all" || t.project?.id === selectedProject;
    const matchPri = !priorityFilter || priorityKey(t.priority) === priorityFilter;
    const matchQ = !search || t.title?.toLowerCase().includes(search.toLowerCase());
    return matchP && matchPri && matchQ;
  });

  const byStatus = STATUSES.reduce((acc, s) => {
    acc[s] = filtered.filter(t => effectiveStatus(t) === s);
    return acc;
  }, {});

  const stats = {
    total:  allTasks.length,
    done:   allTasks.filter(t => effectiveStatus(t) === "completed" || completedIds.has(t.id)).length,
    high:   allTasks.filter(t => priorityKey(t.priority) === "high").length,
    inprog: allTasks.filter(t => effectiveStatus(t) === "in_progress").length,
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'Plus Jakarta Sans',-apple-system,sans-serif", display: "flex", flexDirection: "column" }}>
      <style>{`
        @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
        @keyframes pulseBox{0%,100%{opacity:0.55}50%{opacity:1}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes slideIn{from{transform:translateX(100%)}to{transform:translateX(0)}}
      `}</style>

      {/* Top bar */}
      <div style={{ background: "#fff", borderBottom: "1px solid #f1f5f9", padding: "14px 28px", display: "flex", alignItems: "center", gap: 14, position: "sticky", top: 0, zIndex: 100 }}>
        <button onClick={() => router.back()} style={{ display: "flex", alignItems: "center", gap: 7, background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 10, padding: "7px 14px", fontSize: 12, fontWeight: 600, color: "#374151", cursor: "pointer" }}
          onMouseEnter={e => e.currentTarget.style.background = "#f1f5f9"} onMouseLeave={e => e.currentTarget.style.background = "#f9fafb"}>
          <Ico d={I.arrowLeft} size={14} stroke="#374151" /> Dashboard
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#0f172a" }}>My Tasks</h1>
          <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
            {view === "kanban" ? "Drag a card to change its status · Click a title for details" : "Track and manage your work"}
          </div>
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
              {STATUSES.map(s => (
                <KanbanCol
                  key={s}
                  status={s}
                  tasks={byStatus[s] ?? []}
                  onToggle={toggle}
                  onOpen={openTaskDetail}
                  completedIds={completedIds}
                  onDrop={handleDrop}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  draggingId={draggingTask?.id}
                  dragOverCol={dragOverCol}
                  onDragEnter={setDragOverCol}
                  onDragLeave={() => setDragOverCol(null)}
                  updatingId={updatingId}
                />
              ))}
            </div>
          ) : (
            /* ── List view ── */
            <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #f1f5f9", overflow: "hidden" }}>
              {/* Group by project */}
              {(selectedProject === "all" ? projects : projects.filter(p => p.id === selectedProject)).map(proj => {
                const projTasks = filtered.filter(t => t.project?.id === proj.id);
                if (projTasks.length === 0) return null;
                const doneCnt = projTasks.filter(t => completedIds.has(t.id) || effectiveStatus(t) === "completed").length;
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
                      const st = effectiveStatus(t);
                      const done = completedIds.has(t.id) || st === "completed";
                      const pc = PRIORITY_CFG[priorityKey(t.priority)] || PRIORITY_CFG.medium;
                      return (
                        <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 20px", borderBottom: i < projTasks.length - 1 ? "1px solid #f8fafc" : "none", cursor: "pointer" }}
                          onClick={() => openTaskDetail(t.id)}
                          onMouseEnter={e => e.currentTarget.style.background = "#fffbf5"}
                          onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                          <div onClick={(e) => { e.stopPropagation(); toggle(t.id); }} style={{ width: 18, height: 18, borderRadius: 5, border: `2px solid ${done ? "#22c55e" : "#d1d5db"}`, background: done ? "#22c55e" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, transition: "all 0.15s" }}>
                            {done && <Ico d={I.check} size={10} stroke="#fff" sw={3} />}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <span style={{ fontSize: 13, color: done ? "#94a3b8" : "#1e293b", fontWeight: 500, textDecoration: done ? "line-through" : "none" }}>{t.title}</span>
                            {t.description && <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.description}</div>}
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <PBadge p={t.priority} />
                            <SBadge s={st} />
                            {t.due_date && (
                              <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: st === "overdue" ? "#dc2626" : "#94a3b8", fontWeight: st === "overdue" ? 700 : 400, whiteSpace: "nowrap" }}>
                                <Ico d={I.calendar} size={11} stroke={st === "overdue" ? "#dc2626" : "#94a3b8"} />
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
                      const st = effectiveStatus(t);
                      const done = completedIds.has(t.id) || st === "completed";
                      return (
                        <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 20px", borderBottom: i < orphans.length - 1 ? "1px solid #f8fafc" : "none", cursor: "pointer" }}
                          onClick={() => openTaskDetail(t.id)}
                          onMouseEnter={e => e.currentTarget.style.background = "#fffbf5"}
                          onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                          <div onClick={(e) => { e.stopPropagation(); toggle(t.id); }} style={{ width: 18, height: 18, borderRadius: 5, border: `2px solid ${done ? "#22c55e" : "#d1d5db"}`, background: done ? "#22c55e" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
                            {done && <Ico d={I.check} size={10} stroke="#fff" sw={3} />}
                          </div>
                          <span style={{ flex: 1, fontSize: 13, color: done ? "#94a3b8" : "#1e293b", textDecoration: done ? "line-through" : "none" }}>{t.title}</span>
                          <PBadge p={t.priority} /><SBadge s={st} />
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

      {/* Task Detail Drawer */}
      <TaskDetailDrawer
        task={detailTask}
        loading={detailLoading}
        onClose={() => { setDetailTask(null); setDetailLoading(false); }}
        onStatusChange={(task, newStatus) => updateTaskStatus(task, newStatus)}
      />
    </div>
  );
}