"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";

const BASE = process.env.NEXT_PUBLIC_API_URL;

// ⭐ JSON headers
const HEADERS = () => ({
  "Authorization": `Bearer ${localStorage.getItem("employee_auth_token")}`,
  "ngrok-skip-browser-warning": "true",
  "Accept": "application/json",
  "Content-Type": "application/json",
});

// ⭐ Multipart headers — DO NOT set Content-Type (browser sets boundary)
const HEADERS_MULTIPART = () => ({
  "Authorization": `Bearer ${localStorage.getItem("employee_auth_token")}`,
  "ngrok-skip-browser-warning": "true",
  "Accept": "application/json",
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
  chevDown:   "M6 9l6 6 6-6",
  moreV:      "M12 5h.01M12 12h.01M12 19h.01",
  alertCircle:"M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 8v4M12 16h.01",
  checkCircle:"M22 11.08V12a10 10 0 1 1-5.93-9.14 M22 4L12 14.01l-3-3",
  circle:     "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z",
  tag:        "M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z M7 7h.01",
  user:       "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  grip:       "M9 5h.01M15 5h.01M9 12h.01M15 12h.01M9 19h.01M15 19h.01",
  eye:        "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
  plus:       "M12 5v14M5 12h14",
  messageSquare: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
  activity:   "M22 12h-4l-3 9L9 3l-3 9H2",
  send:       "M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z",
  edit3:      "M12 20h9 M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z",
  history:    "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8 M3 3v5h5 M12 7v5l4 2",
  fileText:   "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8M16 17H8M10 9H8",
  briefcase:  "M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2",
  users:      "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75 M9 7a4 4 0 1 0 0 8 4 4 0 0 0 0-8z",
  building:   "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",
  loader:     "M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83",
  trash:      "M3 6h18 M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6 M10 11v6 M14 11v6 M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2",
  pencil:     "M12 20h9 M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z",
  lock:       "M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z M7 11V7a5 5 0 0 1 10 0v4",
  // ⭐ new icons for attachment
  paperclip:  "M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48",
  image:      "M3 3h18v18H3z M8.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z M21 15l-5-5L5 21",
  upload:     "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M17 8l-5-5-5 5 M12 3v12",
  download:   "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M7 10l5 5 5-5 M12 15V3",
};

const PRIORITY_CFG = {
  high:   { dot: "#ef4444", bg: "#fef2f2", text: "#dc2626", label: "High",   bar: "#ef4444" },
  medium: { dot: "#f59e0b", bg: "#fffbeb", text: "#d97706", label: "Medium", bar: "#f59e0b" },
  low:    { dot: "#22c55e", bg: "#f0fdf4", text: "#16a34a", label: "Low",    bar: "#22c55e" },
  urgent: { dot: "#8b5cf6", bg: "#f5f3ff", text: "#7c3aed", label: "Urgent", bar: "#8b5cf6" },
};

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

const resolveMyStatus = (task) => {
  if (!task) return "pending";
  const raw = statusKey(task.my_status || task.status);
  if (raw === "completed") return "completed";
  if (task.due_date) {
    const due = new Date(task.due_date);
    due.setHours(23, 59, 59, 999);
    if (new Date() > due) return "overdue";
  }
  return raw;
};

const getCurrentUser = () => {
  try {
    const raw = localStorage.getItem("auth_user");
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

const canManageTask = (task, currentUserId) => {
  if (!task || !currentUserId) return false;
  if (task.created_by !== currentUserId) return false;
  if (task.status === "completed") return false;
  return true;
};

const canDeleteTask = (task, currentUserId) => {
  if (!canManageTask(task, currentUserId)) return false;
  return task.status === "pending";
};

// ⭐ Helper: format bytes
const formatBytes = (b) => {
  if (!b) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(b) / Math.log(k));
  return `${(b / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
};

// ⭐ Helper: is image URL?
const isImage = (path) => /\.(jpg|jpeg|png|gif|webp)$/i.test(path || "");

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

// ⭐═══════════════════════════════════════════════════════════════════════════
// ADD / EDIT TASK MODAL
// ⭐═══════════════════════════════════════════════════════════════════════════
function AddTaskModal({ onClose, onSuccess, availableProjects, loadingProjects, editingTask = null }) {
  const isEdit = !!editingTask;

  const [projectId, setProjectId] = useState(editingTask?.project_id || "");
  const [title, setTitle] = useState(editingTask?.title || "");
  const [description, setDescription] = useState(editingTask?.description || "");
  const [priority, setPriority] = useState(editingTask?.priority || "medium");
  const [startDate, setStartDate] = useState(
    editingTask?.start_date ? new Date(editingTask.start_date).toISOString().slice(0, 10) : ""
  );
  const [dueDate, setDueDate] = useState(
    editingTask?.due_date ? new Date(editingTask.due_date).toISOString().slice(0, 10) : ""
  );
  const [submitting, setSubmitting] = useState(false);
  const [inlineError, setInlineError] = useState(null);

  const selectedProject = availableProjects.find(p => p.id === projectId);

  useEffect(() => {
    if (!isEdit && availableProjects.length === 1 && !projectId) {
      setProjectId(availableProjects[0].id);
    }
  }, [availableProjects, projectId, isEdit]);

  const handleSubmit = async () => {
    setInlineError(null);
    if (!title.trim()) { setInlineError("Task title is required"); return; }

    setSubmitting(true);
    try {
      const url = isEdit
        ? `${BASE}/api/employee/tasks/${editingTask.id}`
        : `${BASE}/api/employee/tasks`;
      const method = isEdit ? "PUT" : "POST";

      const body = {
        title: title.trim(),
        description: description.trim() || null,
        priority: priority,
        start_date: startDate || null,
        due_date: dueDate || null,
      };
      if (!isEdit) body.project_id = projectId || null;

      const res = await fetch(url, { method, headers: HEADERS(), body: JSON.stringify(body) });
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 422 && data.errors) {
          setInlineError(Object.values(data.errors).flat().join(" • "));
        } else {
          throw new Error(data.message || `Failed to ${isEdit ? "update" : "create"} task`);
        }
        return;
      }

      onSuccess?.(data.data || data, isEdit ? "Task updated!" : "Task created!");
      onClose();
    } catch (err) {
      setInlineError(err.message || `Failed to ${isEdit ? "update" : "create"} task`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget && !submitting) onClose(); }}
      style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, animation: "fadeIn 0.15s ease" }}
    >
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 520, background: "#fff", borderRadius: 20, boxShadow: "0 24px 80px rgba(0,0,0,0.25)", overflow: "hidden", animation: "modalIn 0.22s cubic-bezier(0.32, 0.72, 0, 1)", maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid #f1f5f9", flexShrink: 0, background: isEdit ? "linear-gradient(135deg, #eff6ff, #fff)" : "linear-gradient(135deg, #fff7ed, #fff)" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 13, background: isEdit ? "linear-gradient(135deg, #3b82f6, #2563eb)" : "linear-gradient(135deg, #f97316, #ea580c)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: isEdit ? "0 6px 20px #3b82f644" : "0 6px 20px #f9731644", flexShrink: 0 }}>
              <Ico d={isEdit ? I.pencil : I.plus} size={20} stroke="#fff" sw={2.5} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.2px" }}>{isEdit ? "Edit Task" : "Create New Task"}</h3>
              <p style={{ margin: "3px 0 0", fontSize: 11.5, color: "#94a3b8", fontWeight: 500 }}>{isEdit ? `Task #${editingTask.id}` : "Add a task to your workflow"}</p>
            </div>
            <button onClick={onClose} disabled={submitting} style={{ width: 32, height: 32, borderRadius: 9, background: "#fff", border: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", cursor: submitting ? "not-allowed" : "pointer", flexShrink: 0, opacity: submitting ? 0.5 : 1 }}>
              <Ico d={I.x} size={14} stroke="#6b7280" />
            </button>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
          {inlineError && (
            <div style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "10px 14px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, fontSize: 12, color: "#b91c1c", marginBottom: 16 }}>
              <Ico d={I.alertCircle} size={13} stroke="#dc2626" sw={2.2} style={{ marginTop: 1 }} />
              <span>{inlineError}</span>
            </div>
          )}

          {!isEdit && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, fontWeight: 700, color: "#374151", marginBottom: 6 }}>
                <Ico d={I.folder} size={11} stroke="#6b7280" sw={2.2} /> Project
              </label>
              {loadingProjects ? (
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 14px", background: "#f9fafb", borderRadius: 12, border: "1px solid #e5e7eb" }}>
                  <Spinner size={14} /><span style={{ fontSize: 12, color: "#94a3b8" }}>Loading projects…</span>
                </div>
              ) : (
                <select value={projectId} onChange={e => setProjectId(e.target.value)} disabled={submitting} style={{ width: "100%", padding: "11px 14px", borderRadius: 12, fontSize: 13, border: "1.5px solid #e5e7eb", background: "#fff", color: "#1e293b", outline: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 500 }}>
                  <option value="" disabled>Select Project</option>
                  {availableProjects.map(p => (<option key={p.id} value={p.id}>📁 {p.project_name} ({p.project_code})</option>))}
                </select>
              )}
            </div>
          )}

          {isEdit && editingTask?.project && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, fontWeight: 700, color: "#374151", marginBottom: 6 }}>
                <Ico d={I.folder} size={11} stroke="#6b7280" sw={2.2} /> Project
                <span style={{ color: "#94a3b8", fontWeight: 500, fontSize: 10.5 }}>(cannot change)</span>
              </label>
              <div style={{ padding: "11px 14px", background: "#f9fafb", borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 13, color: "#6b7280", fontWeight: 500, display: "flex", alignItems: "center", gap: 8 }}>
                <Ico d={I.lock} size={12} stroke="#9ca3af" sw={2.2} />
                {editingTask.project.project_name} ({editingTask.project.project_code})
              </div>
            </div>
          )}

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, fontWeight: 700, color: "#374151", marginBottom: 6 }}>
              <Ico d={I.fileText} size={11} stroke="#6b7280" sw={2.2} /> Task Title <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} disabled={submitting} placeholder="e.g. Fix homepage hero section" maxLength={255} autoFocus style={{ width: "100%", padding: "11px 14px", borderRadius: 12, fontSize: 13, border: "1.5px solid #e5e7eb", background: "#fff", color: "#1e293b", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
              onFocus={e => e.currentTarget.style.borderColor = "#f97316"} onBlur={e => e.currentTarget.style.borderColor = "#e5e7eb"} />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, fontWeight: 700, color: "#374151", marginBottom: 6 }}>
              <Ico d={I.messageSquare} size={11} stroke="#6b7280" sw={2.2} /> Description
              <span style={{ color: "#94a3b8", fontWeight: 500, fontSize: 10.5 }}>(optional)</span>
            </label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} disabled={submitting} placeholder="Add more details…" rows={3} maxLength={1000} style={{ width: "100%", padding: "11px 14px", borderRadius: 12, fontSize: 13, border: "1.5px solid #e5e7eb", background: "#fff", color: "#1e293b", outline: "none", fontFamily: "inherit", resize: "vertical", minHeight: 80, maxHeight: 180, boxSizing: "border-box" }}
              onFocus={e => e.currentTarget.style.borderColor = "#f97316"} onBlur={e => e.currentTarget.style.borderColor = "#e5e7eb"} />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, fontWeight: 700, color: "#374151", marginBottom: 6 }}>
              <Ico d={I.tag} size={11} stroke="#6b7280" sw={2.2} /> Priority
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 6 }}>
              {["low", "medium", "high", "urgent"].map(p => {
                const c = PRIORITY_CFG[p];
                const active = priority === p;
                return (
                  <button key={p} type="button" onClick={() => setPriority(p)} disabled={submitting} style={{ padding: "8px 6px", borderRadius: 10, fontSize: 11.5, fontWeight: 700, textTransform: "capitalize", border: `1.5px solid ${active ? c.dot : "#e5e7eb"}`, background: active ? c.bg : "#fff", color: active ? c.text : "#6b7280", cursor: submitting ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5, opacity: submitting ? 0.6 : 1 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.dot }} />{p}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, fontWeight: 700, color: "#374151", marginBottom: 6 }}>
                <Ico d={I.calendar} size={11} stroke="#6b7280" sw={2.2} /> Start Date
              </label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} disabled={submitting} style={{ width: "100%", padding: "11px 12px", borderRadius: 12, fontSize: 12.5, border: "1.5px solid #e5e7eb", background: "#fff", color: "#1e293b", outline: "none", fontFamily: "inherit", cursor: "pointer", boxSizing: "border-box" }}
                onFocus={e => e.currentTarget.style.borderColor = "#f97316"} onBlur={e => e.currentTarget.style.borderColor = "#e5e7eb"} />
            </div>
            <div>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, fontWeight: 700, color: "#374151", marginBottom: 6 }}>
                <Ico d={I.calendar} size={11} stroke="#6b7280" sw={2.2} /> Due Date
              </label>
              <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} disabled={submitting} min={startDate || undefined} style={{ width: "100%", padding: "11px 12px", borderRadius: 12, fontSize: 12.5, border: "1.5px solid #e5e7eb", background: "#fff", color: "#1e293b", outline: "none", fontFamily: "inherit", cursor: "pointer", boxSizing: "border-box" }}
                onFocus={e => e.currentTarget.style.borderColor = "#f97316"} onBlur={e => e.currentTarget.style.borderColor = "#e5e7eb"} />
            </div>
          </div>
        </div>

        <div style={{ padding: "14px 24px", borderTop: "1px solid #f1f5f9", background: "#fafbfc", display: "flex", justifyContent: "flex-end", gap: 10, flexShrink: 0 }}>
          <button onClick={onClose} disabled={submitting} style={{ padding: "10px 20px", borderRadius: 10, fontSize: 12.5, fontWeight: 600, border: "1px solid #e5e7eb", background: "#fff", color: "#6b7280", cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.5 : 1 }}>Cancel</button>
          <button onClick={handleSubmit} disabled={submitting || !title.trim()} style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 20px", borderRadius: 10, fontSize: 12.5, fontWeight: 700, border: "none", background: (submitting || !title.trim()) ? "#e5e7eb" : isEdit ? "linear-gradient(135deg, #3b82f6, #2563eb)" : "linear-gradient(135deg, #f97316, #ea580c)", color: (submitting || !title.trim()) ? "#9ca3af" : "#fff", cursor: (submitting || !title.trim()) ? "not-allowed" : "pointer", boxShadow: (submitting || !title.trim()) ? "none" : isEdit ? "0 6px 18px #3b82f644" : "0 6px 18px #f9731644" }}>
            {submitting ? (<><Spinner size={14} color="#fff" /> {isEdit ? "Saving…" : "Creating…"}</>) : isEdit ? (<><Ico d={I.check} size={13} stroke="#fff" sw={2.8} /> Save Changes</>) : (<><Ico d={I.plus} size={13} stroke="#fff" sw={2.5} /> Create Task</>)}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── DELETE CONFIRM MODAL ───────────────────────────────────────────────
function DeleteConfirmModal({ task, onConfirm, onCancel, deleting }) {
  if (!task) return null;
  return (
    <div onClick={(e) => { if (e.target === e.currentTarget && !deleting) onCancel(); }} style={{ position: "fixed", inset: 0, zIndex: 350, background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, animation: "fadeIn 0.15s ease" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 420, background: "#fff", borderRadius: 20, boxShadow: "0 24px 80px rgba(0,0,0,0.25)", overflow: "hidden", animation: "modalIn 0.22s cubic-bezier(0.32, 0.72, 0, 1)" }}>
        <div style={{ padding: "24px 24px 20px" }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, boxShadow: "0 6px 20px #ef444433" }}>
            <Ico d={I.trash} size={22} stroke="#dc2626" sw={2.2} />
          </div>
          <h3 style={{ margin: "0 0 8px", fontSize: 17, fontWeight: 800, color: "#0f172a" }}>Delete this task?</h3>
          <p style={{ margin: "0 0 4px", fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>You're about to delete:</p>
          <div style={{ padding: "10px 12px", background: "#f9fafb", borderRadius: 10, border: "1px solid #e5e7eb", fontSize: 13, fontWeight: 600, color: "#1e293b", marginBottom: 12 }}>{task.title}</div>
          <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>This action cannot be undone.</p>
        </div>
        <div style={{ padding: "14px 24px", borderTop: "1px solid #f1f5f9", background: "#fafbfc", display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button onClick={onCancel} disabled={deleting} style={{ padding: "10px 18px", borderRadius: 10, fontSize: 12.5, fontWeight: 600, border: "1px solid #e5e7eb", background: "#fff", color: "#6b7280", cursor: deleting ? "not-allowed" : "pointer", opacity: deleting ? 0.5 : 1 }}>Cancel</button>
          <button onClick={onConfirm} disabled={deleting} style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 18px", borderRadius: 10, fontSize: 12.5, fontWeight: 700, border: "none", background: deleting ? "#e5e7eb" : "linear-gradient(135deg, #ef4444, #dc2626)", color: deleting ? "#9ca3af" : "#fff", cursor: deleting ? "not-allowed" : "pointer", boxShadow: deleting ? "none" : "0 6px 18px #ef444444" }}>
            {deleting ? <><Spinner size={14} color="#fff" /> Deleting…</> : <><Ico d={I.trash} size={13} stroke="#fff" sw={2.2} /> Delete Task</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ⭐═══════════════════════════════════════════════════════════════════════════
// STATUS CHANGE MODAL — with IMAGE UPLOAD + PREVIEW
// ⭐═══════════════════════════════════════════════════════════════════════════
function StatusChangeModal({ isOpen, task, currentStatus, newStatus, onConfirm, onCancel, submitting }) {
  const [notes, setNotes] = useState("");
  const [touched, setTouched] = useState(false);
  const [attachment, setAttachment] = useState(null);       // File object
  const [previewUrl, setPreviewUrl] = useState(null);       // Object URL
  const [uploadError, setUploadError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  const ACCEPTED = ["image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf"];

  useEffect(() => {
    if (isOpen) {
      setNotes("");
      setTouched(false);
      setAttachment(null);
      setPreviewUrl(null);
      setUploadError(null);
      setIsDragging(false);
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === "Escape" && isOpen && !submitting) onCancel(); };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, submitting, onCancel]);

  // Cleanup object URL
  useEffect(() => {
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
  }, [previewUrl]);

  if (!isOpen || !task) return null;

  const newCfg = STATUS_CFG[statusKey(newStatus)];
  const isReopening = currentStatus === "completed" && newStatus !== "completed";
  const isCompleting = newStatus === "completed" && currentStatus !== "completed";
  const notesPlaceholder = isReopening
    ? "Why are you reopening this task?"
    : isCompleting
    ? "Add optional notes about the completion…"
    : "Add notes about this status change (optional)";

  const isRequired = isReopening;
  const canSubmit = !submitting && (!isRequired || notes.trim().length >= 3);

  // ⭐ File validation + preview
  const handleFile = (file) => {
    setUploadError(null);
    if (!file) return;
    if (!ACCEPTED.includes(file.type)) {
      setUploadError("Only JPG, PNG, GIF, WEBP, or PDF files allowed.");
      return;
    }
    if (file.size > MAX_SIZE) {
      setUploadError(`File too large (max ${formatBytes(MAX_SIZE)}).`);
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setAttachment(file);
    setPreviewUrl(file.type.startsWith("image/") ? URL.createObjectURL(file) : null);
  };

  const handleRemoveFile = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setAttachment(null);
    setPreviewUrl(null);
    setUploadError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleSubmit = () => {
    setTouched(true);
    if (!canSubmit) return;
    // ⭐ Pass notes + file up to parent
    onConfirm(notes.trim() || null, attachment);
  };

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget && !submitting) onCancel(); }}
      style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, animation: "fadeIn 0.15s ease" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ width: "100%", maxWidth: 500, background: "#fff", borderRadius: 20, boxShadow: "0 24px 80px rgba(0,0,0,0.25)", overflow: "hidden", animation: "modalIn 0.22s cubic-bezier(0.32, 0.72, 0, 1)", maxHeight: "92vh", display: "flex", flexDirection: "column" }}
      >
        <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid #f1f5f9", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: `linear-gradient(135deg, ${newCfg.col}, ${newCfg.col}dd)`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 6px 20px ${newCfg.col}44`, flexShrink: 0 }}>
              <Ico d={I.edit3} size={19} stroke="#fff" sw={2.2} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#0f172a" }}>Change Status</h3>
              <p style={{ margin: "3px 0 0", fontSize: 11.5, color: "#94a3b8", fontWeight: 500 }}>Task #{task.id} · {task.title}</p>
            </div>
            <button onClick={onCancel} disabled={submitting} style={{ width: 32, height: 32, borderRadius: 9, background: "#f9fafb", border: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", cursor: submitting ? "not-allowed" : "pointer", flexShrink: 0, opacity: submitting ? 0.5 : 1 }}>
              <Ico d={I.x} size={14} stroke="#6b7280" />
            </button>
          </div>
        </div>

        <div style={{ padding: "20px 24px", overflowY: "auto", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 14, background: "linear-gradient(135deg, #f8fafc, #f1f5f9)", border: "1px solid #e2e8f0", marginBottom: 20 }}>
            <SBadge s={currentStatus} />
            <Ico d={I.chevRight} size={14} stroke="#94a3b8" sw={2.2} />
            <SBadge s={newStatus} />
          </div>

          <label style={{ display: "block", marginBottom: 8 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: "#374151" }}>
              <Ico d={I.messageSquare} size={12} stroke="#6b7280" sw={2.2} />
              {isReopening ? "Reason for reopening" : "Notes"}
              {isRequired ? <span style={{ color: "#ef4444", fontWeight: 700 }}>*</span> : <span style={{ color: "#94a3b8", fontWeight: 500, fontSize: 10.5 }}>(optional)</span>}
            </span>
          </label>
          <textarea
            ref={textareaRef}
            value={notes}
            onChange={e => { setNotes(e.target.value); if (touched) setTouched(false); }}
            onBlur={() => setTouched(true)}
            disabled={submitting}
            placeholder={notesPlaceholder}
            rows={3}
            maxLength={1000}
            style={{ width: "100%", padding: "12px 14px", borderRadius: 12, fontSize: 13, lineHeight: 1.5, border: `1.5px solid ${touched && isRequired && notes.trim().length < 3 ? "#fca5a5" : "#e5e7eb"}`, outline: "none", resize: "vertical", fontFamily: "inherit", background: submitting ? "#f9fafb" : "#fff", color: "#1e293b", boxSizing: "border-box", minHeight: 80, maxHeight: 200 }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8, marginBottom: 20 }}>
            <span style={{ fontSize: 11, color: touched && isRequired && notes.trim().length < 3 ? "#dc2626" : "#94a3b8", fontWeight: touched && isRequired && notes.trim().length < 3 ? 600 : 400 }}>
              {isRequired && notes.trim().length < 3 ? "⚠️ Minimum 3 characters required" : "💡 Optional"}
            </span>
            <span style={{ fontSize: 10.5, color: "#cbd5e1", fontWeight: 600 }}>{notes.length}/1000</span>
          </div>

          {/* ⭐═══════════ ATTACHMENT UPLOAD ═══════════ */}
          <div>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 8 }}>
              <Ico d={I.paperclip} size={12} stroke="#6b7280" sw={2.2} />
              Attachment
              <span style={{ color: "#94a3b8", fontWeight: 500, fontSize: 10.5 }}>(optional · max 5MB)</span>
            </label>

            {!attachment ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                style={{
                  border: `2px dashed ${isDragging ? newCfg.col : "#cbd5e1"}`,
                  background: isDragging ? `${newCfg.col}0D` : "#f9fafb",
                  borderRadius: 12,
                  padding: "22px 16px",
                  textAlign: "center",
                  cursor: submitting ? "not-allowed" : "pointer",
                  transition: "all 0.18s ease",
                }}
              >
                <div style={{ width: 40, height: 40, borderRadius: 12, background: isDragging ? `${newCfg.col}22` : "#e0e7ff", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px" }}>
                  <Ico d={I.upload} size={18} stroke={isDragging ? newCfg.col : "#4f46e5"} sw={2.2} />
                </div>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: "#1e293b", marginBottom: 3 }}>
                  {isDragging ? "Drop file here" : "Click or drag & drop"}
                </div>
                <div style={{ fontSize: 11, color: "#94a3b8" }}>
                  JPG, PNG, GIF, WEBP or PDF · max 5MB
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp,application/pdf"
                  onChange={(e) => handleFile(e.target.files?.[0])}
                  style={{ display: "none" }}
                  disabled={submitting}
                />
              </div>
            ) : (
              <div style={{ border: "1.5px solid #e5e7eb", borderRadius: 12, background: "#fff", overflow: "hidden" }}>
                {previewUrl ? (
                  <div style={{ position: "relative", background: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center", maxHeight: 220 }}>
                    <img src={previewUrl} alt="preview" style={{ maxWidth: "100%", maxHeight: 220, display: "block", objectFit: "contain" }} />
                  </div>
                ) : (
                  <div style={{ padding: "20px 16px", display: "flex", alignItems: "center", gap: 12, background: "#fef2f2" }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Ico d={I.fileText} size={18} stroke="#dc2626" sw={2.2} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{attachment.name}</div>
                      <div style={{ fontSize: 10.5, color: "#94a3b8", fontWeight: 500 }}>PDF · {formatBytes(attachment.size)}</div>
                    </div>
                  </div>
                )}
                <div style={{ padding: "10px 14px", borderTop: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, background: "#fafbfc" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11.5, fontWeight: 700, color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{attachment.name}</div>
                    <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 500 }}>{formatBytes(attachment.size)}</div>
                  </div>
                  <button type="button" onClick={handleRemoveFile} disabled={submitting} title="Remove attachment" style={{ width: 28, height: 28, borderRadius: 8, background: "#fef2f2", border: "1px solid #fecaca", display: "flex", alignItems: "center", justifyContent: "center", cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.5 : 1 }}>
                    <Ico d={I.x} size={12} stroke="#dc2626" sw={2.4} />
                  </button>
                </div>
              </div>
            )}

            {uploadError && (
              <div style={{ marginTop: 8, display: "flex", alignItems: "flex-start", gap: 6, padding: "8px 12px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, fontSize: 11.5, color: "#b91c1c" }}>
                <Ico d={I.alertCircle} size={12} stroke="#dc2626" sw={2.2} style={{ marginTop: 1 }} />
                <span>{uploadError}</span>
              </div>
            )}
          </div>
          {/* ⭐═══════════ END ATTACHMENT ═══════════ */}
        </div>

        <div style={{ padding: "14px 24px", borderTop: "1px solid #f1f5f9", background: "#fafbfc", display: "flex", justifyContent: "flex-end", gap: 10, flexShrink: 0 }}>
          <button onClick={onCancel} disabled={submitting} style={{ padding: "10px 18px", borderRadius: 10, fontSize: 12.5, fontWeight: 600, border: "1px solid #e5e7eb", background: "#fff", color: "#6b7280", cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.5 : 1 }}>Cancel</button>
          <button onClick={handleSubmit} disabled={!canSubmit} style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 18px", borderRadius: 10, fontSize: 12.5, fontWeight: 700, border: "none", background: canSubmit ? `linear-gradient(135deg, ${newCfg.col}, ${newCfg.col}dd)` : "#e5e7eb", color: canSubmit ? "#fff" : "#9ca3af", cursor: canSubmit ? "pointer" : "not-allowed", boxShadow: canSubmit ? `0 6px 18px ${newCfg.col}44` : "none" }}>
            {submitting ? <><Spinner size={14} color="#fff" /> {attachment ? "Uploading…" : "Saving…"}</> : <><Ico d={I.send} size={13} stroke="#fff" sw={2.2} /> Confirm</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ⭐═══════════════════════════════════════════════════════════════════════════
// Activity Timeline — now shows attachment preview / download link
// ⭐═══════════════════════════════════════════════════════════════════════════
function ActivityTimeline({ logs, loading }) {
  const [previewLog, setPreviewLog] = useState(null);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: 24 }}>
        <Spinner size={16} /><span style={{ fontSize: 12, color: "#94a3b8" }}>Loading activity…</span>
      </div>
    );
  }

  if (!logs || logs.length === 0) {
    return (
      <div style={{ padding: "20px 16px", textAlign: "center", background: "#f9fafb", borderRadius: 10, border: "1px dashed #e5e7eb" }}>
        <Ico d={I.history} size={20} stroke="#cbd5e1" style={{ margin: "0 auto 8px" }} />
        <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500 }}>No activity yet</div>
      </div>
    );
  }

  return (
    <>
      <div style={{ position: "relative", paddingLeft: 22 }}>
        <div style={{ position: "absolute", left: 8, top: 10, bottom: 10, width: 2, background: "#e5e7eb", borderRadius: 1 }} />
        {logs.map((log, idx) => {
          const toCfg = STATUS_CFG[statusKey(log.to_status)];
          const fromCfg = log.from_status ? STATUS_CFG[statusKey(log.from_status)] : null;
          const date = log.changed_at ? new Date(log.changed_at) : null;
          const attUrl = log.attachment_url;
          const attImg = attUrl && isImage(attUrl);

          return (
            <div key={log.id} style={{ position: "relative", paddingBottom: idx === logs.length - 1 ? 0 : 16 }}>
              <div style={{ position: "absolute", left: -22, top: 3, width: 16, height: 16, borderRadius: "50%", background: toCfg.dot, border: "3px solid #fff", boxShadow: `0 0 0 1.5px ${toCfg.dot}44` }} />
              <div style={{ background: "#f9fafb", borderRadius: 10, padding: "10px 12px", border: "1px solid #f1f5f9" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: log.notes || attUrl ? 8 : 4 }}>
                  {fromCfg ? <><SBadge s={log.from_status} /><Ico d={I.chevRight} size={11} stroke="#94a3b8" sw={2.2} /><SBadge s={log.to_status} /></> : <span style={{ fontSize: 11, fontWeight: 700, color: toCfg.text }}>Assigned as <strong>{toCfg.label}</strong></span>}
                </div>

                {log.notes && (
                  <div style={{ fontSize: 12, color: "#374151", lineHeight: 1.55, padding: "8px 10px", background: "#fff", borderRadius: 8, border: "1px solid #e5e7eb", whiteSpace: "pre-wrap", marginBottom: attUrl ? 8 : 6 }}>{log.notes}</div>
                )}

                {/* ⭐ ATTACHMENT PREVIEW */}
                {attUrl && (
                  attImg ? (
                    <div
                      onClick={() => setPreviewLog(log)}
                      style={{ position: "relative", borderRadius: 10, overflow: "hidden", border: "1px solid #e5e7eb", background: "#0f172a", cursor: "pointer", marginBottom: 6, maxHeight: 160 }}
                    >
                      <img src={attUrl} alt="attachment" style={{ width: "100%", maxHeight: 160, display: "block", objectFit: "cover" }} />
                      <div style={{ position: "absolute", top: 8, right: 8, background: "rgba(15,23,42,0.75)", borderRadius: 8, padding: "4px 8px", display: "flex", alignItems: "center", gap: 4 }}>
                        <Ico d={I.eye} size={11} stroke="#fff" sw={2.2} />
                        <span style={{ fontSize: 10, fontWeight: 700, color: "#fff" }}>View</span>
                      </div>
                    </div>
                  ) : (
                    <a
                      href={attUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", background: "#fff", borderRadius: 8, border: "1px solid #e5e7eb", textDecoration: "none", marginBottom: 6 }}
                    >
                      <div style={{ width: 30, height: 30, borderRadius: 8, background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Ico d={I.fileText} size={14} stroke="#dc2626" sw={2.2} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 11.5, fontWeight: 700, color: "#1e293b" }}>Attachment</div>
                        <div style={{ fontSize: 10, color: "#94a3b8" }}>Click to open</div>
                      </div>
                      <Ico d={I.download} size={14} stroke="#6b7280" sw={2.2} />
                    </a>
                  )
                )}

                <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 10, color: "#94a3b8", fontWeight: 500 }}>
                  {log.employee && <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Ico d={I.user} size={10} stroke="#94a3b8" />{log.employee.name}</span>}
                  {date && <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Ico d={I.clock} size={10} stroke="#94a3b8" />{date.toLocaleDateString("en-GB", { day: "2-digit", month: "short" })} · {date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ⭐ Full-screen image preview modal */}
      {previewLog && (
        <div
          onClick={() => setPreviewLog(null)}
          style={{ position: "fixed", inset: 0, zIndex: 500, background: "rgba(0,0,0,0.9)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, animation: "fadeIn 0.15s ease" }}
        >
          <button
            onClick={() => setPreviewLog(null)}
            style={{ position: "absolute", top: 20, right: 20, width: 40, height: 40, borderRadius: 10, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
          >
            <Ico d={I.x} size={20} stroke="#fff" sw={2.2} />
          </button>
          <img
            src={previewLog.attachment_url}
            alt="preview"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "92%", maxHeight: "88vh", borderRadius: 12, boxShadow: "0 24px 80px rgba(0,0,0,0.6)" }}
          />
        </div>
      )}
    </>
  );
}

// ─── Task Row ─────────────────────────────────────────────────────────
function TaskRow({ t, isDone, onToggle, onOpen, onEdit, onDelete, currentUserId }) {
  const st = resolveMyStatus(t);
  const pc = PRIORITY_CFG[priorityKey(t.priority)] || PRIORITY_CFG.medium;
  const done = isDone || st === "completed";
  const canManage = canManageTask(t, currentUserId);
  const canDelete = canDeleteTask(t, currentUserId);

  return (
    <div
      onClick={() => onOpen(t.id)}
      style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 20px", borderBottom: "1px solid #f8fafc", cursor: "pointer", transition: "background 0.15s" }}
      onMouseEnter={e => e.currentTarget.style.background = "#fffbf5"}
      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
    >
      <div onClick={(e) => { e.stopPropagation(); onToggle(t.id); }} style={{ width: 18, height: 18, borderRadius: 5, border: `2px solid ${done ? "#22c55e" : "#d1d5db"}`, background: done ? "#22c55e" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
        {done && <Ico d={I.check} size={10} stroke="#fff" sw={3} />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{ fontSize: 13, color: done ? "#94a3b8" : "#1e293b", fontWeight: 600, textDecoration: done ? "line-through" : "none" }}>{t.title}</span>
        {t.description && <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.description}</div>}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {canManage && (
          <span title="You created this task" style={{ fontSize: 9.5, color: "#7c3aed", background: "#f5f3ff", padding: "2px 7px", borderRadius: 10, fontWeight: 700, display: "flex", alignItems: "center", gap: 3 }}>
            <Ico d={I.user} size={9} stroke="#7c3aed" sw={2.5} /> Mine
          </span>
        )}
        <PBadge p={t.priority} />
        <SBadge s={st} />
        {t.due_date && <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: st === "overdue" ? "#dc2626" : "#94a3b8", fontWeight: st === "overdue" ? 700 : 400 }}><Ico d={I.calendar} size={11} stroke={st === "overdue" ? "#dc2626" : "#94a3b8"} />{new Date(t.due_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}</span>}
      </div>
      <div style={{ width: 3, height: 36, borderRadius: 2, background: pc.bar, flexShrink: 0 }} />
      {canManage && (
        <>
          <button onClick={(e) => { e.stopPropagation(); onEdit(t); }} title="Edit task" style={{ width: 30, height: 30, borderRadius: 8, background: "#eff6ff", border: "1px solid #bfdbfe", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, transition: "all 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "#dbeafe"; e.currentTarget.style.transform = "scale(1.05)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#eff6ff"; e.currentTarget.style.transform = "scale(1)"; }}>
            <Ico d={I.pencil} size={13} stroke="#2563eb" sw={2.2} />
          </button>
          {canDelete && (
            <button onClick={(e) => { e.stopPropagation(); onDelete(t); }} title="Delete task" style={{ width: 30, height: 30, borderRadius: 8, background: "#fef2f2", border: "1px solid #fecaca", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, transition: "all 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.background = "#fee2e2"; e.currentTarget.style.transform = "scale(1.05)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#fef2f2"; e.currentTarget.style.transform = "scale(1)"; }}>
              <Ico d={I.trash} size={13} stroke="#dc2626" sw={2.2} />
            </button>
          )}
        </>
      )}
      <button onClick={(e) => { e.stopPropagation(); onOpen(t.id); }} title="View details" style={{ width: 30, height: 30, borderRadius: 8, background: "#f9fafb", border: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
        <Ico d={I.eye} size={13} stroke="#6b7280" />
      </button>
    </div>
  );
}

// ─── Kanban Card ─────────────────────────────────────────────────────────
function KanbanCard({ t, onToggle, onOpen, onEdit, onDelete, completedIds, onDragStart, onDragEnd, isDragging, updating, currentUserId }) {
  const st = resolveMyStatus(t);
  const done = completedIds.has(t.id) || st === "completed";
  const pc = PRIORITY_CFG[priorityKey(t.priority)] || PRIORITY_CFG.medium;
  const canManage = canManageTask(t, currentUserId);
  const canDelete = canDeleteTask(t, currentUserId);

  return (
    <div
      draggable={!updating}
      onDragStart={(e) => onDragStart(e, t)}
      onDragEnd={onDragEnd}
      onClick={() => onOpen(t.id)}
      style={{
        background: "#fff", borderRadius: 12,
        border: `1px solid ${done ? "#dcfce7" : canManage ? "#c4b5fd" : "#f1f5f9"}`,
        padding: "12px 14px", cursor: updating ? "wait" : "grab",
        transition: "all 0.18s ease",
        opacity: isDragging ? 0 : 1,
        transform: isDragging ? "scale(0.96)" : "scale(1)",
        position: "relative",
      }}
      onMouseEnter={e => { if (isDragging) return; e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.10)"; e.currentTarget.style.borderColor = pc.dot; e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = done ? "#dcfce7" : canManage ? "#c4b5fd" : "#f1f5f9"; e.currentTarget.style.transform = "scale(1)"; }}
    >
      <div style={{ position: "absolute", top: 10, right: 10, opacity: 0.25 }}><Ico d={I.grip} size={12} stroke="#94a3b8" /></div>
      {canManage && (
        <div style={{ position: "absolute", top: 8, left: 12, fontSize: 9, color: "#7c3aed", background: "#f5f3ff", padding: "2px 7px", borderRadius: 8, fontWeight: 800, display: "flex", alignItems: "center", gap: 3, letterSpacing: "0.3px" }}>
          <Ico d={I.user} size={8} stroke="#7c3aed" sw={2.8} /> MINE
        </div>
      )}
      <div style={{ height: 2, background: pc.bar, borderRadius: 1, marginTop: canManage ? 18 : 0, marginBottom: 10, opacity: 0.7 }} />
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
        <div onClick={(e) => { e.stopPropagation(); onToggle(t.id); }} style={{ width: 18, height: 18, borderRadius: 5, border: `2px solid ${done ? "#22c55e" : "#d1d5db"}`, background: done ? "#22c55e" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, marginTop: 1 }}>
          {done && <Ico d={I.check} size={10} stroke="#fff" sw={3} />}
        </div>
        <span style={{ fontSize: 13, fontWeight: 600, color: done ? "#94a3b8" : "#1e293b", lineHeight: 1.4, textDecoration: done ? "line-through" : "none", paddingRight: 12 }}>{t.title}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <PBadge p={t.priority} />
        {t.due_date && <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: st === "overdue" ? "#dc2626" : "#94a3b8", fontWeight: st === "overdue" ? 700 : 400 }}><Ico d={I.calendar} size={10} stroke={st === "overdue" ? "#dc2626" : "#94a3b8"} />{new Date(t.due_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}</span>}
      </div>
      {t.project && (
        <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid #f3f4f6", display: "flex", alignItems: "center", gap: 5 }}>
          <Ico d={I.folder} size={11} stroke="#94a3b8" />
          <span style={{ fontSize: 10, color: "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.project.project_name ?? "Personal"}</span>
        </div>
      )}
      {canManage && (
        <div onClick={(e) => e.stopPropagation()} style={{ marginTop: 8, paddingTop: 8, borderTop: "1px dashed #e5e7eb", display: "flex", gap: 6 }}>
          <button onClick={(e) => { e.stopPropagation(); onEdit(t); }} title="Edit" style={{ flex: 1, padding: "6px 8px", borderRadius: 8, background: "#eff6ff", border: "1px solid #bfdbfe", color: "#2563eb", fontSize: 10.5, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
            <Ico d={I.pencil} size={11} stroke="#2563eb" sw={2.4} /> Edit
          </button>
          {canDelete && (
            <button onClick={(e) => { e.stopPropagation(); onDelete(t); }} title="Delete" style={{ flex: 1, padding: "6px 8px", borderRadius: 8, background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", fontSize: 10.5, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
              <Ico d={I.trash} size={11} stroke="#dc2626" sw={2.4} /> Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Kanban Column ─────────────────────────────────────────────────────
function KanbanCol({ status, tasks, onToggle, onOpen, onEdit, onDelete, currentUserId, completedIds, onDrop, onDragStart, onDragEnd, draggingId, dragOverCol, onDragEnter, onDragLeave, updatingId }) {
  const cfg = STATUS_CFG[statusKey(status)];
  const isOver = dragOverCol === status;
  const isOverdueCol = status === "overdue";
  const PAGE_SIZE = 5;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [tasks.length]);

  const handleScroll = (e) => {
    const el = e.target;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 60) {
      if (visibleCount < tasks.length) setVisibleCount(c => Math.min(c + PAGE_SIZE, tasks.length));
    }
  };

  const visibleTasks = tasks.slice(0, visibleCount);
  const hasMore = visibleCount < tasks.length;

  return (
    <div style={{ flex: "0 0 280px", display: "flex", flexDirection: "column", gap: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", background: "#fff", borderRadius: "14px 14px 0 0", border: "1px solid #f1f5f9", borderBottom: `2px solid ${cfg.col}` }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: cfg.col, flexShrink: 0 }} />
        <span style={{ fontSize: 12, fontWeight: 700, color: "#1e293b", flex: 1 }}>{cfg.label}</span>
        <span style={{ fontSize: 11, fontWeight: 700, background: cfg.bg, color: cfg.text, borderRadius: 20, padding: "1px 8px" }}>{tasks.length}</span>
      </div>
      <div
        onScroll={handleScroll}
        onDragOver={(e) => { if (!isOverdueCol) e.preventDefault(); }}
        onDragEnter={() => { if (!isOverdueCol) onDragEnter(status); }}
        onDragLeave={onDragLeave}
        onDrop={(e) => onDrop(e, status)}
        style={{ display: "flex", flexDirection: "column", gap: 8, background: isOver ? `${cfg.col}0D` : "#f8fafc", borderRadius: "0 0 14px 14px", border: `1px solid ${isOver ? cfg.col + "55" : "#f1f5f9"}`, borderTop: "none", padding: 10, minHeight: 140, maxHeight: "calc(100vh - 260px)", overflowY: "auto" }}
      >
        {tasks.length === 0 ? (
          <div style={{ textAlign: "center", padding: "28px 0", color: isOver ? cfg.col : "#cbd5e1", fontSize: 12, fontWeight: isOver ? 700 : 400, border: `2px dashed ${isOver ? cfg.col : "transparent"}`, borderRadius: 10 }}>
            {isOver ? "Drop here" : (isOverdueCol ? "Auto-managed" : "No tasks")}
          </div>
        ) : (
          <>
            {visibleTasks.map(t => (
              <KanbanCard key={t.id} t={t} onToggle={onToggle} onOpen={onOpen} onEdit={onEdit} onDelete={onDelete} currentUserId={currentUserId} completedIds={completedIds} onDragStart={onDragStart} onDragEnd={onDragEnd} isDragging={draggingId === t.id} updating={updatingId === t.id} />
            ))}
            {hasMore && (
              <button onClick={() => setVisibleCount(c => Math.min(c + PAGE_SIZE, tasks.length))} style={{ padding: "8px 12px", background: "#fff", border: `1px dashed ${cfg.col}66`, borderRadius: 10, fontSize: 11, fontWeight: 700, color: cfg.col, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <Ico d={I.chevDown} size={12} stroke={cfg.col} sw={2.5} /> Load {Math.min(PAGE_SIZE, tasks.length - visibleCount)} more
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Meta Row ─────────────────────────────────────────────────────────
function MetaRow({ icon, label, value, danger }) {
  return (
    <div style={{ background: "#f9fafb", borderRadius: 10, padding: "10px 12px", border: "1px solid #f1f5f9" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: "#94a3b8", fontWeight: 600, marginBottom: 3 }}>
        <Ico d={icon} size={11} stroke="#94a3b8" />{label}
      </div>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: danger ? "#dc2626" : "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value}</div>
    </div>
  );
}

// ─── Task Detail Drawer ────────────────────────────────────────────────
function TaskDetailDrawer({ task, loading, onClose, onStatusChange, onEdit, onDelete, currentUserId }) {
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);

  useEffect(() => {
    if (!task?.id) return;
    setLogsLoading(true);
    fetch(`${BASE}/api/employee/tasks/${task.id}/status-logs`, { headers: HEADERS() })
      .then(r => r.json())
      .then(json => { if (json.success) setLogs(json.data || []); })
      .catch(console.error)
      .finally(() => setLogsLoading(false));
  }, [task?.id]);

  if (!task) return null;
  const st = resolveMyStatus(task);
  const fmt = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";
  const canManage = canManageTask(task, currentUserId);
  const canDelete = canDeleteTask(task, currentUserId);

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.45)", zIndex: 200, animation: "fadeIn 0.15s ease" }} />
      <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 480, maxWidth: "92vw", background: "#fff", zIndex: 201, boxShadow: "-12px 0 40px rgba(0,0,0,0.14)", display: "flex", flexDirection: "column", animation: "slideIn 0.22s ease", fontFamily: "'Plus Jakarta Sans',-apple-system,sans-serif" }}>
        <div style={{ padding: "18px 22px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.6px" }}>Task #{task.id ?? "—"}</div>
              {canManage && (
                <span style={{ fontSize: 9.5, color: "#7c3aed", background: "#f5f3ff", padding: "2px 7px", borderRadius: 8, fontWeight: 800, display: "flex", alignItems: "center", gap: 3 }}>
                  <Ico d={I.user} size={9} stroke="#7c3aed" sw={2.5} /> MINE
                </span>
              )}
            </div>
          </div>
          {canManage && (
            <>
              <button onClick={() => onEdit(task)} title="Edit task" style={{ width: 32, height: 32, borderRadius: 8, background: "#eff6ff", border: "1px solid #bfdbfe", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <Ico d={I.pencil} size={14} stroke="#2563eb" sw={2.2} />
              </button>
              {canDelete && (
                <button onClick={() => onDelete(task)} title="Delete task" style={{ width: 32, height: 32, borderRadius: 8, background: "#fef2f2", border: "1px solid #fecaca", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                  <Ico d={I.trash} size={14} stroke="#dc2626" sw={2.2} />
                </button>
              )}
            </>
          )}
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Ico d={I.x} size={15} stroke="#6b7280" /></button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "22px" }}>
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12, padding: 60 }}><Spinner /><span style={{ fontSize: 13, color: "#94a3b8" }}>Loading…</span></div>
          ) : (
            <>
              <h2 style={{ margin: "0 0 12px", fontSize: 20, fontWeight: 800, color: "#0f172a", lineHeight: 1.35 }}>{task.title}</h2>
              <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}><SBadge s={st} /><PBadge p={task.priority} /></div>

              {task.my_status && task.status && task.my_status !== task.status && (
                <div style={{ marginBottom: 20, padding: "10px 14px", background: "linear-gradient(135deg, #ede9fe, #f5f3ff)", borderRadius: 10, border: "1px solid #c4b5fd", display: "flex", alignItems: "center", gap: 10 }}>
                  <Ico d={I.user} size={16} stroke="#7c3aed" sw={2.5} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: "#6d28d9", fontWeight: 700, marginBottom: 2 }}>YOUR STATUS</div>
                    <div style={{ fontSize: 12, color: "#4c1d95", fontWeight: 600 }}>You marked this as <strong>{STATUS_CFG[statusKey(task.my_status)]?.label}</strong></div>
                  </div>
                </div>
              )}

              {task.description && (
                <div style={{ marginBottom: 22 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 6 }}>Description</div>
                  <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.6, background: "#f9fafb", borderRadius: 10, padding: "12px 14px", whiteSpace: "pre-wrap" }}>{task.description}</div>
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 22 }}>
                <MetaRow icon={I.calendar} label="Start Date" value={fmt(task.start_date)} />
                <MetaRow icon={I.calendar} label="Due Date" value={fmt(task.due_date)} danger={st === "overdue"} />
                <MetaRow icon={I.folder} label="Project" value={task.project?.project_name ?? "Personal"} />
                <MetaRow icon={I.user} label="Created By" value={task.creator?.name ?? "—"} />
              </div>

              {task.assignees && task.assignees.length > 0 && (
                <div style={{ marginBottom: 22 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 8 }}>
                    Team Progress ({task.assignees.filter(a => a.pivot?.status === "completed").length}/{task.assignees.length})
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {task.assignees.map(a => {
                      const name = `${a.firstname || ""} ${a.lastname || ""}`.trim() || a.email;
                      const aStatus = statusKey(a.pivot?.status);
                      const aCfg = STATUS_CFG[aStatus];
                      return (
                        <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 10, background: "#f9fafb", borderRadius: 10, padding: "8px 12px", border: "1px solid #f1f5f9" }}>
                          <div style={{ width: 26, height: 26, borderRadius: "50%", background: aCfg.dot, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, flexShrink: 0 }}>
                            {(a.firstname?.[0] || "") + (a.lastname?.[0] || "")}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</div>
                            {a.employee_id && <div style={{ fontSize: 10, color: "#94a3b8" }}>{a.employee_id}</div>}
                          </div>
                          <SBadge s={aStatus} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div style={{ marginBottom: 22 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                  <Ico d={I.history} size={11} stroke="#94a3b8" /> Activity Timeline
                  {logs.length > 0 && <span style={{ fontSize: 9.5, fontWeight: 700, background: "#f1f5f9", color: "#64748b", padding: "1px 6px", borderRadius: 8 }}>{logs.length}</span>}
                </div>
                <ActivityTimeline logs={logs} loading={logsLoading} />
              </div>

              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 8 }}>Your Status</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {STATUSES.filter(s => s !== "overdue").map(s => {
                    const c = STATUS_CFG[s];
                    const active = st === s;
                    return (
                      <button key={s} onClick={() => onStatusChange(task, s)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 10, border: `1.5px solid ${active ? c.col : "#e5e7eb"}`, background: active ? c.bg : "#fff", color: active ? c.text : "#6b7280", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                        <span style={{ width: 7, height: 7, borderRadius: "50%", background: c.dot }} />{c.label}
                      </button>
                    );
                  })}
                </div>
                {st === "overdue" && (
                  <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "10px 14px" }}>
                    <Ico d={I.alertCircle} size={16} stroke="#dc2626" />
                    <span style={{ fontSize: 12, color: "#991b1b", fontWeight: 600 }}>This task is past its deadline</span>
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

// ─── Project Group ────────────────────────────────────────────────────
function ProjectGroup({ proj, tasks, onToggle, onOpen, onEdit, onDelete, currentUserId, completedIds }) {
  const PAGE_SIZE = 5;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [tasks.length]);

  const doneCnt = tasks.filter(t => resolveMyStatus(t) === "completed").length;
  const visibleTasks = tasks.slice(0, visibleCount);
  const hasMore = visibleCount < tasks.length;

  return (
    <div style={{ borderBottom: "1px solid #f8fafc" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 20px", background: "#f9fafb", borderBottom: "1px solid #f1f5f9" }}>
        <Ico d={I.folder} size={15} stroke="#f97316" />
        <span style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", flex: 1 }}>{proj.project_name}</span>
        <span style={{ fontSize: 11, color: "#94a3b8" }}>{doneCnt}/{tasks.length} done</span>
        <div style={{ width: 80, height: 4, background: "#f1f5f9", borderRadius: 2, overflow: "hidden" }}>
          <div style={{ width: `${tasks.length > 0 ? (doneCnt / tasks.length) * 100 : 0}%`, height: "100%", background: "#22c55e", borderRadius: 2 }} />
        </div>
      </div>
      {visibleTasks.map((t) => (
        <TaskRow key={t.id} t={t} isDone={completedIds.has(t.id)} onToggle={onToggle} onOpen={onOpen} onEdit={onEdit} onDelete={onDelete} currentUserId={currentUserId} />
      ))}
      {hasMore && (
        <button onClick={() => setVisibleCount(c => Math.min(c + PAGE_SIZE, tasks.length))} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, width: "100%", padding: "10px 16px", background: "#fff", border: "none", borderTop: "1px dashed #e5e7eb", fontSize: 11.5, fontWeight: 700, color: "#f97316", cursor: "pointer" }}>
          <Ico d={I.chevDown} size={12} stroke="#f97316" sw={2.5} /> Show {Math.min(PAGE_SIZE, tasks.length - visibleCount)} more
        </button>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────
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

  const [availableProjects, setAvailableProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deleteTask, setDeleteTask] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [successToast, setSuccessToast] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  const [draggingTask, setDraggingTask] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const [detailTask, setDetailTask] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [statusModal, setStatusModal] = useState({ isOpen: false, task: null, currentStatus: null, newStatus: null });
  const [statusSubmitting, setStatusSubmitting] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    if (user) setCurrentUserId(user.id);
  }, []);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/api/employee/tasks`, { headers: HEADERS() });
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

  const fetchAvailableProjects = useCallback(async () => {
    setLoadingProjects(true);
    try {
      const res = await fetch(`${BASE}/api/employee/projects`, { headers: HEADERS() });
      const json = await res.json();
      let list = [];
      if (json.success && Array.isArray(json.data)) list = json.data;
      else if (Array.isArray(json.data?.projects)) list = json.data.projects;
      else if (Array.isArray(json)) list = json;
      setAvailableProjects(list);
    } catch (e) { console.error("Failed to load projects:", e); }
    finally { setLoadingProjects(false); }
  }, []);

  useEffect(() => { fetchTasks(); fetchAvailableProjects(); }, [fetchTasks, fetchAvailableProjects]);

  const toggle = (id) => setCompletedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const openStatusModal = (task, newStatus) => {
    const currentStatus = resolveMyStatus(task);
    if (currentStatus === newStatus) return;
    setStatusModal({ isOpen: true, task, currentStatus, newStatus });
  };

  // ⭐═══════════════════════════════════════════════════════════════════════
  // ⭐ CONFIRM STATUS CHANGE — sends FormData when attachment present
  // ⭐═══════════════════════════════════════════════════════════════════════
  const confirmStatusChange = async (notes, attachmentFile) => {
    const { task, newStatus } = statusModal;
    if (!task) return;
    setStatusSubmitting(true);
    setUpdatingId(task.id);

    const prevMyStatus = task.my_status;
    const prevStatus = task.status;

    // Optimistic UI
    setAllTasks(prev => prev.map(t => t.id === task.id ? { ...t, my_status: newStatus, my_completed_at: newStatus === "completed" ? new Date().toISOString() : null } : t));
    setDetailTask(prev => (prev && prev.id === task.id) ? { ...prev, my_status: newStatus, my_completed_at: newStatus === "completed" ? new Date().toISOString() : null } : prev);

    try {
      let res;

      if (attachmentFile) {
        // ⭐ Multipart form-data path
        const fd = new FormData();
        fd.append("status", newStatus);
        if (notes) fd.append("notes", notes);
        fd.append("attachment", attachmentFile);

        // ⚠️ Use POST + _method=PUT for reliable multipart handling
        fd.append("_method", "PUT");

        res = await fetch(`${BASE}/api/employee/tasks/${task.id}/status`, {
          method: "POST",
          headers: HEADERS_MULTIPART(),
          body: fd,
        });
      } else {
        // ⭐ JSON path (no file)
        res = await fetch(`${BASE}/api/employee/tasks/${task.id}/status`, {
          method: "PUT",
          headers: HEADERS(),
          body: JSON.stringify({ status: newStatus, notes }),
        });
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to update status");
      }

      setStatusModal({ isOpen: false, task: null, currentStatus: null, newStatus: null });
      await fetchTasks();
      if (detailTask?.id === task.id) {
        const freshRes = await fetch(`${BASE}/api/employee/tasks/${task.id}`, { headers: HEADERS() });
        const freshJson = await freshRes.json();
        if (freshJson.success && freshJson.data) setDetailTask(freshJson.data);
      }
      setSuccessToast(attachmentFile ? "Status updated with attachment!" : "Status updated!");
      setTimeout(() => setSuccessToast(null), 3000);
    } catch (e) {
      console.error(e);
      setAllTasks(prev => prev.map(t => t.id === task.id ? { ...t, my_status: prevMyStatus, status: prevStatus } : t));
      setDetailTask(prev => (prev && prev.id === task.id) ? { ...prev, my_status: prevMyStatus, status: prevStatus } : prev);
      alert(e.message || "Couldn't update task status. Please try again.");
    } finally {
      setUpdatingId(null);
      setStatusSubmitting(false);
    }
  };

  const openTaskDetail = async (taskId) => {
    if (!taskId) return;
    const cached = allTasks.find(t => t.id === taskId);
    if (cached) setDetailTask(cached);
    else setDetailTask({ id: taskId, title: "Loading…" });
    setDetailLoading(true);
    try {
      const res = await fetch(`${BASE}/api/employee/tasks/${taskId}`, { headers: HEADERS() });
      const json = await res.json();
      if (json.success && json.data) setDetailTask(json.data);
      else if (cached) setDetailTask(cached);
    } catch (e) { console.error(e); if (!cached) alert("Couldn't load task details."); }
    finally { setDetailLoading(false); }
  };

  const handleDragStart = (e, task) => { setDraggingTask(task); e.dataTransfer.effectAllowed = "move"; };
  const handleDragEnd = () => { setDraggingTask(null); setDragOverCol(null); };
  const handleDrop = (e, newStatus) => {
    e.preventDefault(); setDragOverCol(null);
    if (!draggingTask) return;
    if (newStatus === "overdue") { setDraggingTask(null); return; }
    const current = resolveMyStatus(draggingTask);
    if (current === newStatus) { setDraggingTask(null); return; }
    openStatusModal(draggingTask, newStatus);
    setDraggingTask(null);
  };

  const handleTaskCreated = (data, msg) => {
    fetchTasks();
    setSuccessToast(msg || "Task created successfully!");
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleEditClick = (task) => {
    setDetailTask(null);
    setEditingTask(task);
  };

  const handleDeleteClick = (task) => {
    setDetailTask(null);
    setDeleteTask(task);
  };

  const confirmDelete = async () => {
    if (!deleteTask) return;
    setDeleting(true);
    try {
      const res = await fetch(`${BASE}/api/employee/tasks/${deleteTask.id}`, { method: "DELETE", headers: HEADERS() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete task");
      setDeleteTask(null);
      fetchTasks();
      setSuccessToast("Task deleted successfully!");
      setTimeout(() => setSuccessToast(null), 3000);
    } catch (e) {
      console.error(e);
      alert(e.message || "Couldn't delete task");
    } finally {
      setDeleting(false);
    }
  };

  const filtered = allTasks.filter(t => {
    const matchP = selectedProject === "all" || t.project?.id === selectedProject;
    const matchPri = !priorityFilter || priorityKey(t.priority) === priorityFilter;
    const matchQ = !search || t.title?.toLowerCase().includes(search.toLowerCase());
    return matchP && matchPri && matchQ;
  });

  const byStatus = STATUSES.reduce((acc, s) => { acc[s] = filtered.filter(t => resolveMyStatus(t) === s); return acc; }, {});

  const stats = {
    total: allTasks.length,
    done: allTasks.filter(t => resolveMyStatus(t) === "completed").length,
    high: allTasks.filter(t => priorityKey(t.priority) === "high").length,
    inprog: allTasks.filter(t => resolveMyStatus(t) === "in_progress").length,
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'Plus Jakarta Sans',-apple-system,sans-serif", display: "flex", flexDirection: "column" }}>
      <style>{`
        @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
        @keyframes pulseBox{0%,100%{opacity:0.55}50%{opacity:1}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes slideIn{from{transform:translateX(100%)}to{transform:translateX(0)}}
        @keyframes modalIn{from{opacity:0;transform:scale(0.95) translateY(10px)}to{opacity:1;transform:scale(1) translateY(0)}}
        @keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>

      <div style={{ background: "#fff", borderBottom: "1px solid #f1f5f9", padding: "14px 28px", display: "flex", alignItems: "center", gap: 14, position: "sticky", top: 0, zIndex: 100 }}>
        <button onClick={() => router.back()} style={{ display: "flex", alignItems: "center", gap: 7, background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 10, padding: "7px 14px", fontSize: 12, fontWeight: 600, color: "#374151", cursor: "pointer" }}
          onMouseEnter={e => e.currentTarget.style.background = "#f1f5f9"} onMouseLeave={e => e.currentTarget.style.background = "#f9fafb"}>
          <Ico d={I.arrowLeft} size={14} stroke="#374151" /> Dashboard
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#0f172a" }}>My Tasks</h1>
          <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
            {view === "kanban" ? "Drag a card to change your status · Click a title for details" : "Track and manage your work"}
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
          <button onClick={() => setShowAddModal(true)} style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 16px", borderRadius: 10, background: "linear-gradient(135deg, #f97316, #ea580c)", border: "none", color: "#fff", fontSize: 12.5, fontWeight: 700, cursor: "pointer", boxShadow: "0 6px 18px #f9731644" }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; }} onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}>
            <Ico d={I.plus} size={14} stroke="#fff" sw={2.5} /> Add Task
          </button>
        </div>
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <div style={{ width: 256, borderRight: "1px solid #f1f5f9", background: "#fff", padding: "16px 12px", overflowY: "auto", flexShrink: 0 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.8px", padding: "0 8px 8px" }}>Projects</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
            {[
              { label: "Total", value: stats.total, color: "#f97316" },
              { label: "Done", value: stats.done, color: "#22c55e" },
              { label: "High ⚡", value: stats.high, color: "#ef4444" },
              { label: "Active", value: stats.inprog, color: "#3b82f6" },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ background: "#f9fafb", borderRadius: 10, padding: "10px 12px", border: "1px solid #f1f5f9" }}>
                <div style={{ fontSize: 18, fontWeight: 800, color }}>{value}</div>
                <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 500 }}>{label}</div>
              </div>
            ))}
          </div>
          {[{ id: "all", project_name: "All Projects", taskCount: allTasks.length }, ...projects].map(p => {
            const isActive = selectedProject === p.id;
            return (
              <div key={p.id} onClick={() => setSelectedProject(p.id)}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 10, cursor: "pointer", background: isActive ? "#fff7ed" : "transparent", marginBottom: 2 }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "#f9fafb"; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}>
                <Ico d={I.folder} size={14} stroke={isActive ? "#f97316" : "#94a3b8"} />
                <span style={{ flex: 1, fontSize: 12, fontWeight: isActive ? 700 : 500, color: isActive ? "#f97316" : "#374151", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.project_name}</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: isActive ? "#f97316" : "#94a3b8", background: isActive ? "#fed7aa" : "#f1f5f9", padding: "1px 7px", borderRadius: 10 }}>{p.taskCount}</span>
              </div>
            );
          })}
        </div>

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
            <div style={{ display: "flex", gap: 14, minWidth: "max-content", paddingBottom: 20 }}>
              {STATUSES.map(s => (
                <KanbanCol key={s} status={s} tasks={byStatus[s] ?? []} onToggle={toggle} onOpen={openTaskDetail} onEdit={handleEditClick} onDelete={handleDeleteClick} currentUserId={currentUserId} completedIds={completedIds} onDrop={handleDrop} onDragStart={handleDragStart} onDragEnd={handleDragEnd} draggingId={draggingTask?.id} dragOverCol={dragOverCol} onDragEnter={setDragOverCol} onDragLeave={() => setDragOverCol(null)} updatingId={updatingId} />
              ))}
            </div>
          ) : (
            <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #f1f5f9", overflow: "hidden" }}>
              {(selectedProject === "all" ? projects : projects.filter(p => p.id === selectedProject)).map(proj => {
                const projTasks = filtered.filter(t => t.project?.id === proj.id);
                if (projTasks.length === 0) return null;
                return <ProjectGroup key={proj.id} proj={proj} tasks={projTasks} onToggle={toggle} onOpen={openTaskDetail} onEdit={handleEditClick} onDelete={handleDeleteClick} currentUserId={currentUserId} completedIds={completedIds} />;
              })}
              {(() => {
                const orphans = filtered.filter(t => !t.project);
                if (orphans.length === 0) return null;
                return <ProjectGroup proj={{ id: "orphan", project_name: "Personal Tasks" }} tasks={orphans} onToggle={toggle} onOpen={openTaskDetail} onEdit={handleEditClick} onDelete={handleDeleteClick} currentUserId={currentUserId} completedIds={completedIds} />;
              })()}
            </div>
          )}
        </div>
      </div>

      {showAddModal && (
        <AddTaskModal onClose={() => setShowAddModal(false)} onSuccess={handleTaskCreated} availableProjects={availableProjects} loadingProjects={loadingProjects} />
      )}

      {editingTask && (
        <AddTaskModal editingTask={editingTask} onClose={() => setEditingTask(null)} onSuccess={handleTaskCreated} availableProjects={availableProjects} loadingProjects={loadingProjects} />
      )}

      {deleteTask && (
        <DeleteConfirmModal task={deleteTask} onConfirm={confirmDelete} onCancel={() => !deleting && setDeleteTask(null)} deleting={deleting} />
      )}

      <StatusChangeModal
        isOpen={statusModal.isOpen}
        task={statusModal.task}
        currentStatus={statusModal.currentStatus}
        newStatus={statusModal.newStatus}
        onConfirm={confirmStatusChange}
        onCancel={() => !statusSubmitting && setStatusModal({ isOpen: false, task: null, currentStatus: null, newStatus: null })}
        submitting={statusSubmitting}
      />

      <TaskDetailDrawer
        task={detailTask}
        loading={detailLoading}
        onClose={() => { setDetailTask(null); setDetailLoading(false); }}
        onStatusChange={(task, newStatus) => openStatusModal(task, newStatus)}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
        currentUserId={currentUserId}
      />

      {successToast && (
        <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 90, display: "flex", alignItems: "center", gap: 12, background: "#0f172a", color: "#fff", padding: "14px 18px", borderRadius: 14, boxShadow: "0 20px 50px rgba(15,23,42,0.3)", animation: "slideUp 0.3s ease" }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(34,197,94,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Ico d={I.checkCircle} size={16} stroke="#4ade80" sw={2.2} />
          </div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{successToast}</div>
          <button onClick={() => setSuccessToast(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 4 }}>
            <Ico d={I.x} size={14} stroke="#94a3b8" />
          </button>
        </div>
      )}
    </div>
  );
}