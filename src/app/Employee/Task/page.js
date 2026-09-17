"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";

const BASE = process.env.NEXT_PUBLIC_API_URL;
const HEADERS = () => ({
  "Authorization": `Bearer ${localStorage.getItem("employee_auth_token")}`,
  "ngrok-skip-browser-warning": "true",
  "Accept": "application/json",
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
};

const PRIORITY_CFG = {
  high:   { dot: "#ef4444", bg: "#fef2f2", text: "#dc2626", label: "High",   bar: "#ef4444" },
  medium: { dot: "#f59e0b", bg: "#fffbeb", text: "#d97706", label: "Medium", bar: "#f59e0b" },
  low:    { dot: "#22c55e", bg: "#f0fdf4", text: "#16a34a", label: "Low",    bar: "#22c55e" },
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
// STATUS CHANGE MODAL — prompts for notes before updating
// ⭐═══════════════════════════════════════════════════════════════════════════
function StatusChangeModal({ isOpen, task, currentStatus, newStatus, onConfirm, onCancel, submitting }) {
  const [notes, setNotes] = useState("");
  const [touched, setTouched] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setNotes("");
      setTouched(false);
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape" && isOpen && !submitting) onCancel();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, submitting, onCancel]);

  if (!isOpen || !task) return null;

  const newCfg = STATUS_CFG[statusKey(newStatus)];
  const oldCfg = STATUS_CFG[statusKey(currentStatus)];

  // Notes recommendations by transition
  const isReopening = currentStatus === "completed" && newStatus !== "completed";
  const isCompleting = newStatus === "completed" && currentStatus !== "completed";
  const notesPlaceholder = isReopening
    ? "Why are you reopening this task? (e.g., Found bugs, needs rework...)"
    : isCompleting
    ? "Add optional notes about the completion (e.g., All sections done...)"
    : "Add notes about this status change (optional)";

  const isRequired = isReopening; // Reopening reasons should be documented
  const canSubmit = !submitting && (!isRequired || notes.trim().length >= 3);

  const handleSubmit = () => {
    setTouched(true);
    if (!canSubmit) return;
    onConfirm(notes.trim() || null);
  };

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget && !submitting) onCancel(); }}
      style={{
        position: "fixed", inset: 0, zIndex: 300,
        background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20, animation: "fadeIn 0.15s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 480,
          background: "#fff", borderRadius: 20,
          boxShadow: "0 24px 80px rgba(0,0,0,0.25)",
          overflow: "hidden",
          animation: "modalIn 0.22s cubic-bezier(0.32, 0.72, 0, 1)",
        }}
      >
        {/* Header */}
        <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid #f1f5f9" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 12,
              background: `linear-gradient(135deg, ${newCfg.col}, ${newCfg.col}dd)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: `0 6px 20px ${newCfg.col}44`, flexShrink: 0,
            }}>
              <Ico d={I.edit3} size={19} stroke="#fff" sw={2.2} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.2px" }}>
                Change Status
              </h3>
              <p style={{ margin: "3px 0 0", fontSize: 11.5, color: "#94a3b8", fontWeight: 500 }}>
                Task #{task.id} · {task.title}
              </p>
            </div>
            <button
              onClick={onCancel}
              disabled={submitting}
              style={{
                width: 32, height: 32, borderRadius: 9,
                background: "#f9fafb", border: "1px solid #e5e7eb",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: submitting ? "not-allowed" : "pointer", flexShrink: 0,
                opacity: submitting ? 0.5 : 1,
              }}
            >
              <Ico d={I.x} size={14} stroke="#6b7280" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: "20px 24px" }}>
          {/* Status transition */}
          <div style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "14px 16px", borderRadius: 14,
            background: "linear-gradient(135deg, #f8fafc, #f1f5f9)",
            border: "1px solid #e2e8f0", marginBottom: 20,
          }}>
            <SBadge s={currentStatus} />
            <Ico d={I.chevRight} size={14} stroke="#94a3b8" sw={2.2} />
            <SBadge s={newStatus} />
          </div>

          {/* Notes input */}
          <label style={{ display: "block", marginBottom: 8 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: "#374151" }}>
              <Ico d={I.messageSquare} size={12} stroke="#6b7280" sw={2.2} />
              {isReopening ? "Reason for reopening" : "Notes"}
              {isRequired
                ? <span style={{ color: "#ef4444", fontWeight: 700 }}>*</span>
                : <span style={{ color: "#94a3b8", fontWeight: 500, fontSize: 10.5 }}>(optional)</span>}
            </span>
          </label>

          <textarea
            ref={textareaRef}
            value={notes}
            onChange={e => { setNotes(e.target.value); if (touched) setTouched(false); }}
            onBlur={() => setTouched(true)}
            disabled={submitting}
            placeholder={notesPlaceholder}
            rows={4}
            maxLength={1000}
            style={{
              width: "100%", padding: "12px 14px",
              borderRadius: 12, fontSize: 13, lineHeight: 1.5,
              border: `1.5px solid ${touched && isRequired && notes.trim().length < 3 ? "#fca5a5" : "#e5e7eb"}`,
              outline: "none", resize: "vertical", fontFamily: "inherit",
              background: submitting ? "#f9fafb" : "#fff",
              color: "#1e293b", transition: "border-color 0.15s",
              boxSizing: "border-box", minHeight: 100, maxHeight: 240,
            }}
            onFocus={e => e.currentTarget.style.borderColor = newCfg.col}
            onBlurCapture={e => e.currentTarget.style.borderColor = touched && isRequired && notes.trim().length < 3 ? "#fca5a5" : "#e5e7eb"}
          />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
            <span style={{
              fontSize: 11,
              color: touched && isRequired && notes.trim().length < 3 ? "#dc2626" : "#94a3b8",
              fontWeight: touched && isRequired && notes.trim().length < 3 ? 600 : 400,
            }}>
              {isRequired && notes.trim().length < 3
                ? "⚠️ Minimum 3 characters required"
                : isReopening
                ? "💡 Helpful for tracking why work was reopened"
                : "💡 Optional but helps with team coordination"}
            </span>
            <span style={{ fontSize: 10.5, color: "#cbd5e1", fontWeight: 600 }}>
              {notes.length}/1000
            </span>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: "14px 24px", borderTop: "1px solid #f1f5f9",
          background: "#fafbfc", display: "flex", justifyContent: "flex-end", gap: 10,
        }}>
          <button
            onClick={onCancel}
            disabled={submitting}
            style={{
              padding: "10px 18px", borderRadius: 10, fontSize: 12.5, fontWeight: 600,
              border: "1px solid #e5e7eb", background: "#fff", color: "#6b7280",
              cursor: submitting ? "not-allowed" : "pointer",
              opacity: submitting ? 0.5 : 1,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            style={{
              display: "flex", alignItems: "center", gap: 7,
              padding: "10px 18px", borderRadius: 10, fontSize: 12.5, fontWeight: 700,
              border: "none",
              background: canSubmit
                ? `linear-gradient(135deg, ${newCfg.col}, ${newCfg.col}dd)`
                : "#e5e7eb",
              color: canSubmit ? "#fff" : "#9ca3af",
              cursor: canSubmit ? "pointer" : "not-allowed",
              boxShadow: canSubmit ? `0 6px 18px ${newCfg.col}44` : "none",
              transition: "all 0.15s",
            }}
          >
            {submitting ? (
              <><Spinner size={14} color="#fff" /> Saving…</>
            ) : (
              <><Ico d={I.send} size={13} stroke="#fff" sw={2.2} /> Confirm Change</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ⭐═══════════════════════════════════════════════════════════════════════════
// ACTIVITY TIMELINE — status change history
// ⭐═══════════════════════════════════════════════════════════════════════════
function ActivityTimeline({ logs, loading }) {
  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: 24 }}>
        <Spinner size={16} />
        <span style={{ fontSize: 12, color: "#94a3b8" }}>Loading activity…</span>
      </div>
    );
  }

  if (!logs || logs.length === 0) {
    return (
      <div style={{
        padding: "20px 16px", textAlign: "center",
        background: "#f9fafb", borderRadius: 10, border: "1px dashed #e5e7eb",
      }}>
        <Ico d={I.history} size={20} stroke="#cbd5e1" style={{ margin: "0 auto 8px" }} />
        <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500 }}>No activity yet</div>
      </div>
    );
  }

  return (
    <div style={{ position: "relative", paddingLeft: 22 }}>
      {/* Vertical line */}
      <div style={{
        position: "absolute", left: 8, top: 10, bottom: 10,
        width: 2, background: "#e5e7eb", borderRadius: 1,
      }} />

      {logs.map((log, idx) => {
        const toCfg = STATUS_CFG[statusKey(log.to_status)];
        const fromCfg = log.from_status ? STATUS_CFG[statusKey(log.from_status)] : null;
        const date = log.changed_at ? new Date(log.changed_at) : null;

        return (
          <div key={log.id} style={{ position: "relative", paddingBottom: idx === logs.length - 1 ? 0 : 16 }}>
            {/* Dot */}
            <div style={{
              position: "absolute", left: -22, top: 3,
              width: 16, height: 16, borderRadius: "50%",
              background: toCfg.dot, border: "3px solid #fff",
              boxShadow: `0 0 0 1.5px ${toCfg.dot}44`,
            }} />

            {/* Content */}
            <div style={{
              background: "#f9fafb", borderRadius: 10,
              padding: "10px 12px", border: "1px solid #f1f5f9",
            }}>
              {/* Transition row */}
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: log.notes ? 8 : 4 }}>
                {fromCfg ? (
                  <>
                    <SBadge s={log.from_status} />
                    <Ico d={I.chevRight} size={11} stroke="#94a3b8" sw={2.2} />
                    <SBadge s={log.to_status} />
                  </>
                ) : (
                  <span style={{ fontSize: 11, fontWeight: 700, color: toCfg.text }}>
                    Assigned as <strong>{toCfg.label}</strong>
                  </span>
                )}
              </div>

              {/* Notes */}
              {log.notes && (
                <div style={{
                  fontSize: 12, color: "#374151", lineHeight: 1.55,
                  padding: "8px 10px", background: "#fff",
                  borderRadius: 8, border: "1px solid #e5e7eb",
                  whiteSpace: "pre-wrap", marginBottom: 6,
                }}>
                  {log.notes}
                </div>
              )}

              {/* Meta */}
              <div style={{
                display: "flex", alignItems: "center", gap: 10,
                fontSize: 10, color: "#94a3b8", fontWeight: 500,
              }}>
                {log.employee && (
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <Ico d={I.user} size={10} stroke="#94a3b8" />
                    {log.employee.name}
                  </span>
                )}
                {date && (
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <Ico d={I.clock} size={10} stroke="#94a3b8" />
                    {date.toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                    {" · "}
                    {date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Task Row ─────────────────────────────────────────────────────────────
function TaskRow({ t, isDone, onToggle, onOpen, showStatus = true }) {
  const st = resolveMyStatus(t);
  const pc = PRIORITY_CFG[priorityKey(t.priority)] || PRIORITY_CFG.medium;
  const done = isDone || st === "completed";

  return (
    <div
      onClick={() => onOpen(t.id)}
      style={{
        display: "flex", alignItems: "center", gap: 14,
        padding: "12px 20px",
        borderBottom: "1px solid #f8fafc",
        cursor: "pointer",
        transition: "background 0.15s",
      }}
      onMouseEnter={e => e.currentTarget.style.background = "#fffbf5"}
      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
    >
      <div
        onClick={(e) => { e.stopPropagation(); onToggle(t.id); }}
        style={{
          width: 18, height: 18, borderRadius: 5,
          border: `2px solid ${done ? "#22c55e" : "#d1d5db"}`,
          background: done ? "#22c55e" : "transparent",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", flexShrink: 0, transition: "all 0.15s",
        }}
      >
        {done && <Ico d={I.check} size={10} stroke="#fff" sw={3} />}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{ fontSize: 13, color: done ? "#94a3b8" : "#1e293b", fontWeight: 600, textDecoration: done ? "line-through" : "none" }}>{t.title}</span>
        {t.description && <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.description}</div>}
      </div>

      {showStatus && (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <PBadge p={t.priority} />
          <SBadge s={st} />
          {t.my_status && t.status && t.my_status !== t.status && (
            <span title={`Task-level: ${STATUS_CFG[statusKey(t.status)].label}`} style={{ fontSize: 9.5, color: "#94a3b8", padding: "2px 7px", background: "#f1f5f9", borderRadius: 10, fontWeight: 600, whiteSpace: "nowrap" }}>
              T: {STATUS_CFG[statusKey(t.status)].label}
            </span>
          )}
          {t.due_date && (
            <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: st === "overdue" ? "#dc2626" : "#94a3b8", fontWeight: st === "overdue" ? 700 : 400, whiteSpace: "nowrap" }}>
              <Ico d={I.calendar} size={11} stroke={st === "overdue" ? "#dc2626" : "#94a3b8"} />
              {new Date(t.due_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
            </span>
          )}
        </div>
      )}

      <div style={{ width: 3, height: 36, borderRadius: 2, background: pc.bar, flexShrink: 0 }} />

      <button
        onClick={(e) => { e.stopPropagation(); onOpen(t.id); }}
        title="View details"
        style={{
          width: 30, height: 30, borderRadius: 8,
          background: "#f9fafb", border: "1px solid #e5e7eb",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", flexShrink: 0,
        }}
      >
        <Ico d={I.eye} size={13} stroke="#6b7280" />
      </button>
    </div>
  );
}

// ─── Kanban Card ─────────────────────────────────────────────────────────────
function KanbanCard({ t, onToggle, onOpen, completedIds, onDragStart, onDragEnd, isDragging, updating }) {
  const st = resolveMyStatus(t);
  const done = completedIds.has(t.id) || st === "completed";
  const pc = PRIORITY_CFG[priorityKey(t.priority)] || PRIORITY_CFG.medium;

  return (
    <div
      draggable={!updating}
      onDragStart={(e) => onDragStart(e, t)}
      onDragEnd={onDragEnd}
      onClick={() => onOpen(t.id)}
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
      <div style={{ position: "absolute", top: 10, right: 10, opacity: 0.25 }}>
        <Ico d={I.grip} size={12} stroke="#94a3b8" />
      </div>

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
        <span style={{
          fontSize: 13, fontWeight: 600,
          color: done ? "#94a3b8" : "#1e293b",
          lineHeight: 1.4,
          textDecoration: done ? "line-through" : "none",
          paddingRight: 12,
        }}>{t.title}</span>
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

      {t.my_status && t.status && t.my_status !== t.status && (
        <div style={{ marginTop: 8, paddingTop: 6, borderTop: "1px dashed #e5e7eb", fontSize: 9.5, color: "#7c3aed", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
          <Ico d={I.user} size={9} stroke="#7c3aed" sw={2.5} />
          Your status: {STATUS_CFG[statusKey(t.my_status)]?.label}
        </div>
      )}
    </div>
  );
}

// ─── Kanban Column ───────────────────────────────────────────────────────────
function KanbanCol({ status, tasks, onToggle, onOpen, completedIds, onDrop, onDragStart, onDragEnd, draggingId, dragOverCol, onDragEnter, onDragLeave, updatingId }) {
  const cfg = STATUS_CFG[statusKey(status)];
  const isOver = dragOverCol === status;
  const isOverdueCol = status === "overdue";

  const PAGE_SIZE = 5;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const scrollRef = useRef(null);

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
        ref={scrollRef}
        onScroll={handleScroll}
        onDragOver={(e) => { if (!isOverdueCol) e.preventDefault(); }}
        onDragEnter={() => { if (!isOverdueCol) onDragEnter(status); }}
        onDragLeave={onDragLeave}
        onDrop={(e) => onDrop(e, status)}
        style={{
          display: "flex", flexDirection: "column", gap: 8,
          background: isOver ? `${cfg.col}0D` : "#f8fafc",
          borderRadius: "0 0 14px 14px",
          border: `1px solid ${isOver ? cfg.col + "55" : "#f1f5f9"}`,
          borderTop: "none", padding: 10,
          minHeight: 140, maxHeight: "calc(100vh - 260px)",
          overflowY: "auto",
          transition: "background 0.15s ease, border-color 0.15s ease",
        }}
      >
        {tasks.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "28px 0",
            color: isOver ? cfg.col : "#cbd5e1",
            fontSize: 12, fontWeight: isOver ? 700 : 400,
            border: `2px dashed ${isOver ? cfg.col : "transparent"}`,
            borderRadius: 10, transition: "all 0.15s ease",
          }}>
            {isOver ? "Drop here" : (isOverdueCol ? "Auto-managed" : "No tasks")}
          </div>
        ) : (
          <>
            {visibleTasks.map(t => (
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

            {hasMore && (
              <button
                onClick={() => setVisibleCount(c => Math.min(c + PAGE_SIZE, tasks.length))}
                style={{
                  padding: "8px 12px",
                  background: "#fff",
                  border: `1px dashed ${cfg.col}66`,
                  borderRadius: 10, fontSize: 11, fontWeight: 700,
                  color: cfg.col, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  gap: 6, transition: "all 0.15s",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = `${cfg.col}0D`; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#fff"; }}
              >
                <Ico d={I.chevDown} size={12} stroke={cfg.col} sw={2.5} />
                Load {Math.min(PAGE_SIZE, tasks.length - visibleCount)} more ({tasks.length - visibleCount} left)
              </button>
            )}

            {isOver && draggingId && !isOverdueCol && (
              <div style={{
                height: 56, borderRadius: 12,
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

// ─── Task Detail Drawer ──────────────────────────────────────────────────────
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
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);

  // Fetch status logs when task opens
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

  const fmt = (d) => d ? new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric"
  }) : "—";

  return (
    <>
      <div onClick={onClose} style={{
        position: "fixed", inset: 0, background: "rgba(15,23,42,0.45)",
        zIndex: 200, animation: "fadeIn 0.15s ease",
      }} />

      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0, width: 480,
        maxWidth: "92vw", background: "#fff", zIndex: 201,
        boxShadow: "-12px 0 40px rgba(0,0,0,0.14)",
        display: "flex", flexDirection: "column",
        animation: "slideIn 0.22s ease",
        fontFamily: "'Plus Jakarta Sans',-apple-system,sans-serif",
      }}>
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

              {task.my_status && task.status && task.my_status !== task.status && (
                <div style={{
                  marginBottom: 20, padding: "10px 14px",
                  background: "linear-gradient(135deg, #ede9fe, #f5f3ff)",
                  borderRadius: 10, border: "1px solid #c4b5fd",
                  display: "flex", alignItems: "center", gap: 10,
                }}>
                  <Ico d={I.user} size={16} stroke="#7c3aed" sw={2.5} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: "#6d28d9", fontWeight: 700, marginBottom: 2 }}>
                      YOUR STATUS
                    </div>
                    <div style={{ fontSize: 12, color: "#4c1d95", fontWeight: 600 }}>
                      You marked this as <strong>{STATUS_CFG[statusKey(task.my_status)]?.label}</strong>
                      {task.my_completed_at && <> · {new Date(task.my_completed_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</>}
                    </div>
                  </div>
                </div>
              )}

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

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 22 }}>
                <MetaRow icon={I.calendar} label="Start Date" value={fmt(task.start_date)} />
                <MetaRow icon={I.calendar} label="Due Date" value={fmt(task.due_date)} danger={st === "overdue"} />
                <MetaRow icon={I.folder} label="Project" value={task.project?.project_name ?? "—"} />
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
                        <div key={a.id} style={{
                          display: "flex", alignItems: "center", gap: 10,
                          background: "#f9fafb", borderRadius: 10,
                          padding: "8px 12px", border: "1px solid #f1f5f9",
                        }}>
                          <div style={{
                            width: 26, height: 26, borderRadius: "50%",
                            background: aCfg.dot, color: "#fff",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 10, fontWeight: 700, flexShrink: 0,
                          }}>
                            {(a.firstname?.[0] || "") + (a.lastname?.[0] || "")}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {name}
                            </div>
                            {a.employee_id && (
                              <div style={{ fontSize: 10, color: "#94a3b8" }}>{a.employee_id}</div>
                            )}
                          </div>
                          <SBadge s={aStatus} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ⭐ Activity Timeline */}
              <div style={{ marginBottom: 22 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                  <Ico d={I.history} size={11} stroke="#94a3b8" />
                  Activity Timeline
                  {logs.length > 0 && (
                    <span style={{ fontSize: 9.5, fontWeight: 700, background: "#f1f5f9", color: "#64748b", padding: "1px 6px", borderRadius: 8 }}>
                      {logs.length}
                    </span>
                  )}
                </div>
                <ActivityTimeline logs={logs} loading={logsLoading} />
              </div>

              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 8 }}>
                  Your Status
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

// ─── Project Group ──────────────────────────────────────────────────────────
function ProjectGroup({ proj, tasks, onToggle, onOpen, completedIds }) {
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
        <TaskRow
          key={t.id}
          t={t}
          isDone={completedIds.has(t.id)}
          onToggle={onToggle}
          onOpen={onOpen}
        />
      ))}

      {hasMore && (
        <button
          onClick={() => setVisibleCount(c => Math.min(c + PAGE_SIZE, tasks.length))}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            width: "100%", padding: "10px 16px",
            background: "#fff", border: "none", borderTop: "1px dashed #e5e7eb",
            fontSize: 11.5, fontWeight: 700, color: "#f97316",
            cursor: "pointer", transition: "background 0.15s",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "#fff7ed"}
          onMouseLeave={e => e.currentTarget.style.background = "#fff"}
        >
          <Ico d={I.chevDown} size={12} stroke="#f97316" sw={2.5} />
          Show {Math.min(PAGE_SIZE, tasks.length - visibleCount)} more ({tasks.length - visibleCount} remaining)
        </button>
      )}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
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

  const [draggingTask, setDraggingTask] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const [detailTask, setDetailTask] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // ⭐ Status change modal state
  const [statusModal, setStatusModal] = useState({
    isOpen: false,
    task: null,
    currentStatus: null,
    newStatus: null,
  });
  const [statusSubmitting, setStatusSubmitting] = useState(false);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${BASE}/api/employee/tasks`, { headers: HEADERS() });
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

  // ⭐ OPEN status modal (instead of directly updating)
  const openStatusModal = (task, newStatus) => {
    const currentStatus = resolveMyStatus(task);
    if (currentStatus === newStatus) return;
    setStatusModal({
      isOpen: true,
      task,
      currentStatus,
      newStatus,
    });
  };

  // ⭐ CONFIRM status change with notes
  const confirmStatusChange = async (notes) => {
    const { task, newStatus } = statusModal;
    if (!task) return;

    setStatusSubmitting(true);
    const prevMyStatus = task.my_status;
    const prevStatus = task.status;

    setUpdatingId(task.id);

    // Optimistic update
    setAllTasks(prev => prev.map(t => t.id === task.id ? {
      ...t,
      my_status: newStatus,
      my_completed_at: newStatus === "completed" ? new Date().toISOString() : null,
    } : t));

    setDetailTask(prev => (prev && prev.id === task.id) ? {
      ...prev,
      my_status: newStatus,
      my_completed_at: newStatus === "completed" ? new Date().toISOString() : null,
    } : prev);

    try {
      const res = await fetch(`${BASE}/api/employee/tasks/${task.id}/status`, {
        method: "PUT",
        headers: HEADERS(),
        body: JSON.stringify({ status: newStatus, notes }),
      });
      if (!res.ok) throw new Error("Failed to update status");

      // Close modal + refetch
      setStatusModal({ isOpen: false, task: null, currentStatus: null, newStatus: null });
      await fetchTasks();

      // Re-fetch detail if open
      if (detailTask?.id === task.id) {
        const freshRes = await fetch(`${BASE}/api/employee/tasks/${task.id}`, { headers: HEADERS() });
        const freshJson = await freshRes.json();
        if (freshJson.success && freshJson.data) setDetailTask(freshJson.data);
      }
    } catch (e) {
      console.error(e);
      setAllTasks(prev => prev.map(t => t.id === task.id ? { ...t, my_status: prevMyStatus, status: prevStatus } : t));
      setDetailTask(prev => (prev && prev.id === task.id) ? { ...prev, my_status: prevMyStatus, status: prevStatus } : prev);
      alert("Couldn't update task status. Please try again.");
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
    } catch (e) {
      console.error(e);
      if (!cached) alert("Couldn't load task details.");
    } finally {
      setDetailLoading(false);
    }
  };

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
    if (newStatus === "overdue") { setDraggingTask(null); return; }
    const current = resolveMyStatus(draggingTask);
    if (current === newStatus) { setDraggingTask(null); return; }

    // ⭐ Instead of direct update — open modal!
    openStatusModal(draggingTask, newStatus);
    setDraggingTask(null);
  };

  const filtered = allTasks.filter(t => {
    const matchP = selectedProject === "all" || t.project?.id === selectedProject;
    const matchPri = !priorityFilter || priorityKey(t.priority) === priorityFilter;
    const matchQ = !search || t.title?.toLowerCase().includes(search.toLowerCase());
    return matchP && matchPri && matchQ;
  });

  const byStatus = STATUSES.reduce((acc, s) => {
    acc[s] = filtered.filter(t => resolveMyStatus(t) === s);
    return acc;
  }, {});

  const stats = {
    total:  allTasks.length,
    done:   allTasks.filter(t => resolveMyStatus(t) === "completed").length,
    high:   allTasks.filter(t => priorityKey(t.priority) === "high").length,
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
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        ::-webkit-scrollbar-track { background: transparent; }
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
        </div>
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <div style={{ width: 256, borderRight: "1px solid #f1f5f9", background: "#fff", padding: "16px 12px", overflowY: "auto", flexShrink: 0 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.8px", padding: "0 8px 8px" }}>Projects</div>
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
            <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #f1f5f9", overflow: "hidden" }}>
              {(selectedProject === "all" ? projects : projects.filter(p => p.id === selectedProject)).map(proj => {
                const projTasks = filtered.filter(t => t.project?.id === proj.id);
                if (projTasks.length === 0) return null;
                return (
                  <ProjectGroup
                    key={proj.id}
                    proj={proj}
                    tasks={projTasks}
                    onToggle={toggle}
                    onOpen={openTaskDetail}
                    completedIds={completedIds}
                  />
                );
              })}

              {(() => {
                const orphans = filtered.filter(t => !t.project);
                if (orphans.length === 0) return null;
                return (
                  <ProjectGroup
                    proj={{ id: "orphan", project_name: "Unassigned" }}
                    tasks={orphans}
                    onToggle={toggle}
                    onOpen={openTaskDetail}
                    completedIds={completedIds}
                  />
                );
              })()}
            </div>
          )}
        </div>
      </div>

      {/* ⭐ Status Change Modal */}
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
      />
    </div>
  );
}