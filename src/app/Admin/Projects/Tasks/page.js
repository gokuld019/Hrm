"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { Plus, RefreshCw, Star, Calendar, ChevronDown, ChevronUp, CheckSquare, Square, X, Search,
  Loader2, CircleCheck, CircleAlert, AlertTriangle, TriangleAlert, Building2, Hash, FileText,
  Users, UserRoundCog, Crown, Tag as TagIcon, RotateCw, UserPlus, MapPin, BadgeCheck, CreditCard,
  Trash2, PencilLine, ScanEye, Ellipsis, FolderUp, ArrowRight, CheckCheck, CalendarDays,
  Clock, User, Flag, Briefcase, Eye, MessageSquare, Paperclip, CalendarClock, Sparkles,
  LayoutGrid, MoreVertical, History, Filter, TrendingUp, AlertOctagon, CircleDot, ListChecks
} from "lucide-react";
import confetti from "canvas-confetti";

const BASE = process.env.NEXT_PUBLIC_API_URL;

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function authHeaders() {
  const token = localStorage.getItem("admin_auth_token");
  return {
    Authorization: `Bearer ${token}`,
    "ngrok-skip-browser-warning": "true",
  };
}

const priorityColors = {
  high:   "bg-rose-50 text-rose-600 ring-1 ring-rose-100",
  medium: "bg-amber-50 text-amber-600 ring-1 ring-amber-100",
  low:    "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100",
  urgent: "bg-violet-50 text-violet-600 ring-1 ring-violet-100",
};

const priorityDot = {
  high: "bg-rose-500",
  medium: "bg-amber-500",
  low: "bg-emerald-500",
  urgent: "bg-violet-500",
};

const statusColors = {
  Onhold:       "bg-amber-50 text-amber-600 ring-1 ring-amber-100",
  Inprogress:   "bg-sky-50 text-sky-600 ring-1 ring-sky-100",
  in_progress:  "bg-sky-50 text-sky-600 ring-1 ring-sky-100",
  Pending:      "bg-orange-50 text-orange-600 ring-1 ring-orange-100",
  pending:      "bg-orange-50 text-orange-600 ring-1 ring-orange-100",
  Completed:    "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100",
  completed:    "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100",
  onhold:       "bg-amber-50 text-amber-600 ring-1 ring-amber-100",
  planning:     "bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100",
  Planning:     "bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100",
  overdue:      "bg-rose-50 text-rose-600 ring-1 ring-rose-100",
};

const STATUS_FILTERS = [
  { key: "all",         label: "All Status",  color: "#94a3b8", icon: ListChecks },
  { key: "pending",     label: "Pending",     color: "#f59e0b", icon: CircleDot },
  { key: "in_progress", label: "In Progress", color: "#3b82f6", icon: Clock },
  { key: "completed",   label: "Completed",   color: "#22c55e", icon: CheckCheck },
  { key: "overdue",     label: "Overdue",     color: "#ef4444", icon: AlertOctagon },
];

const PROJECT_COLORS = ["#6366f1","#22c55e","#06b6d4","#f97316","#ec4899","#8b5cf6"];
const palette = ["#6366f1","#14b8a6","#f97316","#ec4899","#22c55e","#a855f7","#eab308","#ef4444","#06b6d4"];
const getColor = (i) => palette[i % palette.length];

const fmtDate = (iso, opts = { day:"2-digit", month:"short", year:"numeric" }) => {
  if (!iso) return "—";
  try { return new Date(iso).toLocaleDateString("en-GB", opts); }
  catch { return "—"; }
};

const fmtDateTime = (iso) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("en-GB", {
      day:"2-digit", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit"
    });
  } catch { return "—"; }
};

const toDateInput = (iso) => {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  } catch { return ""; }
};

const isTaskOverdue = (task) => {
  if (!task?.due_date) return false;
  if (["completed", "done"].includes((task.status || "").toLowerCase())) return false;
  const due = new Date(task.due_date);
  due.setHours(23, 59, 59, 999);
  return new Date() > due;
};

const matchStatus = (task, filterKey) => {
  if (filterKey === "all") return true;
  const st = (task.status || "").toLowerCase();
  if (filterKey === "overdue") return isTaskOverdue(task) || st === "overdue";
  return st === filterKey;
};

// ── Avatar ────────────────────────────────────────────────────────────
const Avatar = ({ initials, color, size = "w-7 h-7" }) => (
  <div className={`${size} rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0 ring-2 ring-white shadow-sm`} style={{ backgroundColor: color }}>
    {initials}
  </div>
);

// ── Tag ───────────────────────────────────────────────────────────────
const Tag = ({ label, onRemove }) => (
  <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-700 text-xs font-medium px-2.5 py-1 rounded-full ring-1 ring-orange-100">
    {label}
    <button onClick={(e) => { e.stopPropagation(); onRemove(); }} className="text-orange-300 hover:text-red-500 transition-colors ml-0.5 cursor-pointer">
      <X size={10} />
    </button>
  </span>
);

// ── Locked Tag (for completed assignees) ─────────────────────────────
const LockedTag = ({ label }) => (
  <span
    title="This employee has already completed this task and cannot be removed"
    className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-medium px-2.5 py-1 rounded-full ring-1 ring-emerald-200 cursor-not-allowed select-none"
  >
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
    {label}
    <span className="text-[9px] bg-emerald-500 text-white rounded-full px-1.5 py-px font-bold">✓</span>
  </span>
);

// ── SearchableSelect ─────────────────────────────────────────────────
const SearchableSelect = ({ options, value, onChange, placeholder, error = false, disabled = false }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false); setQuery("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => { if (open && inputRef.current) inputRef.current.focus(); }, [open]);

  const filtered = options.filter(o => o.name.toLowerCase().includes(query.toLowerCase()));
  const selected = options.find(o => o.id === value);

  return (
    <div className="relative" ref={containerRef}>
      <div
        onClick={() => !disabled && setOpen(!open)}
        className={`flex items-center justify-between gap-2 px-3.5 py-2.5 border rounded-2xl cursor-pointer transition-all select-none
          ${error ? "border-red-300 bg-red-50/50" : open ? "border-orange-400 ring-4 ring-orange-50" : "border-gray-200 hover:border-gray-300"}
          ${disabled ? "opacity-50 cursor-not-allowed bg-gray-50" : "bg-white"}`}
      >
        <span className={`text-sm truncate ${selected ? "text-gray-800 font-medium" : "text-gray-400"}`}>
          {selected ? selected.name : placeholder}
        </span>
        <div className="flex items-center gap-1 shrink-0">
          {selected && (
            <button onClick={(e) => { e.stopPropagation(); onChange(""); }}
              className="text-gray-300 hover:text-red-400 transition-colors p-0.5 cursor-pointer">
              <X size={12} />
            </button>
          )}
          {open ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
        </div>
      </div>

      {open && !disabled && (
        <div className="absolute z-30 mt-1.5 w-full bg-white border border-gray-100 rounded-2xl shadow-xl shadow-gray-200/60 overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search..."
                className="w-full pl-7 pr-3 py-1.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 text-black"
              />
            </div>
          </div>
          <div className="max-h-44 overflow-y-auto">
            {filtered.length === 0
              ? <div className="p-3 text-center text-gray-400 text-xs">No results found</div>
              : filtered.map(opt => (
                <button key={opt.id}
                  onClick={() => { onChange(opt.id); setOpen(false); setQuery(""); }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-orange-50 transition-colors flex items-center gap-2 cursor-pointer
                    ${opt.id === value ? "bg-orange-50 text-orange-600 font-semibold" : "text-gray-700"}`}>
                  {opt.id === value
                    ? <CircleCheck size={12} className="text-orange-500 shrink-0" />
                    : <span className="w-3 shrink-0" />}
                  {opt.name}
                </button>
              ))
            }
          </div>
        </div>
      )}
    </div>
  );
};

// ── UserMultiSelect (with locked completed assignees) ────────────────
const UserMultiSelect = ({ options, selected, onChange, placeholder, isLoading = false, error = false, lockedIds = [] }) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false); setSearchQuery("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => { if (open && searchInputRef.current) searchInputRef.current.focus(); }, [open]);

  const filteredOptions = options.filter(opt =>
    opt.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleUser = (userId) => {
    if (lockedIds.includes(userId) && selected.includes(userId)) return;
    if (selected.includes(userId)) onChange(selected.filter(id => id !== userId));
    else onChange([...selected, userId]);
  };

  return (
    <div className="relative" ref={containerRef}>
      <div
        className={`flex flex-wrap gap-1.5 p-2.5 border rounded-2xl bg-white min-h-[46px] items-center cursor-pointer transition-all select-none
          ${error ? "border-red-300 bg-red-50/50" : open ? "border-orange-400 ring-4 ring-orange-50" : "border-gray-200 hover:border-gray-300"}`}
        onClick={() => !isLoading && setOpen(!open)}
      >
        {selected.length === 0 && (
          <span className={`text-sm flex-1 ${error ? "text-red-400" : "text-gray-400"}`}>
            {isLoading ? "Loading..." : placeholder}
          </span>
        )}
        {selected.map(id => {
          const label = options.find(opt => opt.id === id)?.name || id;
          const isLocked = lockedIds.includes(id);
          return isLocked
            ? <LockedTag key={id} label={label} />
            : <Tag key={id} label={label} onRemove={() => toggleUser(id)} />;
        })}
        <div className="ml-auto pl-1 shrink-0">
          {open ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
        </div>
      </div>

      {open && !isLoading && (
        <div className="absolute z-30 mt-1.5 w-full bg-white border border-gray-100 rounded-2xl shadow-xl shadow-gray-200/60 overflow-hidden">
          <div className="p-2 border-b border-gray-100 bg-gray-50/80">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search members..."
                className="w-full pl-7 pr-3 py-1.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 text-black bg-white"
              />
            </div>
          </div>
          {options.length > 0 && (
            <div className="px-3 py-1.5 border-b border-gray-100 flex justify-between items-center">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const newIds = filteredOptions
                    .map(o => o.id)
                    .filter(id => !lockedIds.includes(id) || selected.includes(id));
                  const merged = Array.from(new Set([...selected.filter(id => lockedIds.includes(id)), ...newIds]));
                  onChange(merged);
                }}
                className="text-xs text-orange-500 hover:text-orange-600 font-semibold cursor-pointer">
                Select All {filteredOptions.length > 0 ? `(${filteredOptions.length})` : ""}
              </button>
              {selected.some(id => !lockedIds.includes(id)) && (
                <button
                  onClick={(e) => { e.stopPropagation(); onChange(selected.filter(id => lockedIds.includes(id))); }}
                  className="text-xs text-gray-400 hover:text-red-500 font-medium cursor-pointer">
                  Clear unlocked
                </button>
              )}
            </div>
          )}
          <div className="max-h-44 overflow-y-auto">
            {filteredOptions.length === 0
              ? <div className="p-4 text-center text-gray-400 text-xs">No matching members</div>
              : filteredOptions.map(opt => {
                const isSelected = selected.includes(opt.id);
                const isLocked = lockedIds.includes(opt.id);
                return (
                  <label
                    key={opt.id}
                    className={`flex items-center gap-2.5 px-3 py-2 text-sm transition-colors
                      ${isLocked ? "cursor-not-allowed bg-emerald-50/50" : "cursor-pointer"}
                      ${isSelected && !isLocked ? "bg-orange-50" : ""}
                      ${!isSelected ? "hover:bg-gray-50" : ""}`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      disabled={isLocked}
                      onChange={() => toggleUser(opt.id)}
                      className={`rounded border-gray-300 text-orange-500 focus:ring-orange-400 shrink-0 ${
                        isLocked ? "cursor-not-allowed opacity-60" : "cursor-pointer"
                      }`}
                    />
                    <span className={isSelected ? "text-orange-700 font-medium" : "text-gray-700"}>{opt.name}</span>
                    {isLocked && (
                      <span className="ml-auto flex items-center gap-1 text-[10px] text-emerald-600 font-semibold">
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                        Completed
                      </span>
                    )}
                    {isSelected && !isLocked && <CircleCheck size={12} className="ml-auto text-orange-400 shrink-0" />}
                  </label>
                );
              })
            }
          </div>
          {selected.length > 0 && (
            <div className="px-3 py-2 border-t border-gray-100 bg-gray-50/80 text-xs text-gray-500 font-medium flex items-center justify-between">
              <span>{selected.length} member{selected.length > 1 ? "s" : ""} selected</span>
              {lockedIds.filter(id => selected.includes(id)).length > 0 && (
                <span className="text-emerald-600 text-[10px] font-semibold flex items-center gap-1">
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  {lockedIds.filter(id => selected.includes(id)).length} locked
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ── SUCCESS MODAL ─────────────────────────────────────────────────────
function SuccessModal({ message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 2500);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-gray-900/30 backdrop-blur-sm cursor-pointer" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl shadow-gray-300/40 w-full max-w-sm mx-4 z-10 p-8 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-4 ring-8 ring-emerald-50/50">
          <svg width="30" height="30" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="16" fill="#10b981" fillOpacity="0.15" />
            <path d="M9 16.5l5 5 9-9" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h3 className="text-base font-bold text-gray-900 mb-1">Success!</h3>
        <p className="text-sm text-gray-500 mb-5">{message}</p>
        <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500 rounded-full" style={{ animation: "shrink 2.5s linear forwards" }} />
        </div>
        <style>{`@keyframes shrink { from { width: 100%; } to { width: 0%; } }`}</style>
        <button onClick={onClose} className="mt-4 px-6 py-2 text-xs font-semibold text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition cursor-pointer">Close</button>
      </div>
    </div>
  );
}

// ── CONFIRM DIALOG ────────────────────────────────────────────────────
function ConfirmDialog({ title, message, confirmLabel = "Delete", danger = true, loading = false, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-3xl shadow-2xl shadow-gray-300/50 w-full max-w-sm mx-4 z-10 p-6">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${danger ? "bg-rose-50" : "bg-orange-50"}`}>
          <TriangleAlert size={20} className={danger ? "text-rose-500" : "text-orange-500"} />
        </div>
        <h3 className="text-base font-bold text-gray-900 mb-1.5">{title}</h3>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">{message}</p>
        <div className="flex items-center gap-2">
          <button onClick={onCancel} disabled={loading}
            className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition cursor-pointer disabled:opacity-50">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-xl transition cursor-pointer disabled:opacity-50
              ${danger ? "bg-rose-500 hover:bg-rose-600 shadow-lg shadow-rose-200" : "bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-200"}`}>
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            {loading ? "Deleting…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── EDIT TASK MODAL (locked completed assignees) ─────────────────────
function EditTaskModal({ task, onClose, onSuccess }) {
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [startDate, setStartDate] = useState(toDateInput(task?.start_date));
  const [dueDate, setDueDate] = useState(toDateInput(task?.due_date));
  const [priority, setPriority] = useState(task?.priority || "");
  const [assignees, setAssignees] = useState((task?.assignees || []).map(a => a.id));
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [apiErrors, setApiErrors] = useState({});
  const [inlineError, setInlineError] = useState(null);

  const lockedIds = (task?.assignees || [])
    .filter(a => a.pivot?.status === "completed")
    .map(a => a.id);

  const isFormValid = title.trim() !== "" && dueDate !== "" && priority !== "" && assignees.length > 0;

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${BASE}/api/admin/employees`, { headers: authHeaders() });
        const data = await res.json();
        const d = data.data || data;
        setEmployees((Array.isArray(d) ? d : []).map(emp => ({
          id: emp.id,
          name: emp.firstname ? `${emp.firstname} ${emp.lastname || ""}`.trim() : (emp.name || emp.username || emp.email),
        })));
      } catch (e) { console.error(e); } finally { setLoadingEmployees(false); }
    })();
  }, []);

  const handleSave = async () => {
    setApiErrors({}); setInlineError(null);
    if (!title.trim()) { setInlineError("Title is required."); return; }
    if (!dueDate) { setInlineError("Due date is required."); return; }
    if (!priority) { setInlineError("Priority is required."); return; }
    if (!assignees.length) { setInlineError("Please select at least one assignee."); return; }

    const finalAssignees = Array.from(new Set([...lockedIds, ...assignees]));

    setSubmitting(true);
    try {
      const res = await fetch(`${BASE}/api/admin/tasks/${task.id}`, {
        method: "PUT",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          start_date: startDate || null,
          due_date: dueDate,
          priority: priority.toLowerCase(),
          assignees: finalAssignees.map(Number),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 422 && data.errors) {
          setApiErrors(data.errors);
          setInlineError(Object.values(data.errors).flat().join(" • "));
        } else throw new Error(data.message || "Failed to update task");
        return;
      }
      onSuccess?.(data.data || data, "Task updated successfully!");
      onClose();
    } catch (err) { setInlineError(err.message); }
    finally { setSubmitting(false); }
  };

  const inputCls = "w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-2xl outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50 text-gray-800 transition-all bg-white placeholder:text-gray-400";
  const labelCls = "block text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1.5";

  return (
    <div className="fixed inset-0 z-[85] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/45 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl shadow-gray-300/50 w-full max-w-lg z-10 flex flex-col max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0 bg-gradient-to-br from-orange-50/60 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-200 shrink-0">
              <PencilLine size={17} className="text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Edit Task</h2>
              <p className="text-[11px] text-gray-400 mt-0.5">#{task?.id} · Update the task details</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-white hover:bg-gray-100 text-gray-500 transition shrink-0 cursor-pointer ring-1 ring-gray-100">
            <X size={15} />
          </button>
        </div>

        {inlineError && (
          <div className="mx-6 mt-4 flex items-start gap-2 p-3 bg-rose-50 border border-rose-100 rounded-2xl text-xs text-rose-600 shrink-0">
            <TriangleAlert size={13} className="shrink-0 mt-0.5" /><span>{inlineError}</span>
          </div>
        )}

        {lockedIds.length > 0 && (
          <div className="mx-6 mt-4 flex items-start gap-2 p-3 bg-emerald-50 border border-emerald-100 rounded-2xl text-xs text-emerald-700 shrink-0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span>
              <strong>{lockedIds.length}</strong> employee{lockedIds.length > 1 ? "s have" : " has"} already completed this task. They cannot be removed.
            </span>
          </div>
        )}

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
          <div>
            <label className={labelCls}><FileText size={11} className="text-gray-400" /> Title <span className="text-red-500">*</span></label>
            <input value={title} onChange={e => setTitle(e.target.value)} className={inputCls} placeholder="Enter task title" />
            {apiErrors.title && <p className="text-red-500 text-xs mt-1">{apiErrors.title[0]}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}><CalendarDays size={11} className="text-gray-400" /> Start Date</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={`${inputCls} cursor-pointer`} />
            </div>
            <div>
              <label className={labelCls}><CalendarClock size={11} className="text-gray-400" /> Due Date <span className="text-red-500">*</span></label>
              <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className={`${inputCls} cursor-pointer`} />
              {apiErrors.due_date && <p className="text-red-500 text-xs mt-1">{apiErrors.due_date[0]}</p>}
            </div>
          </div>

          <div>
            <label className={labelCls}><TagIcon size={11} className="text-gray-400" /> Priority <span className="text-red-500">*</span></label>
            <div className="grid grid-cols-4 gap-2">
              {["low","medium","high","urgent"].map(p => (
                <button key={p} type="button" onClick={() => setPriority(p)}
                  className={`flex items-center justify-center gap-1.5 px-2 py-2 rounded-xl text-xs font-semibold capitalize border transition-all cursor-pointer
                    ${priority === p ? "border-transparent text-white shadow-md" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}
                  style={priority === p ? { backgroundColor: { low:"#10b981", medium:"#f59e0b", high:"#f43f5e", urgent:"#8b5cf6" }[p] } : {}}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${priority === p ? "bg-white" : priorityDot[p]}`} />
                  {p}
                </button>
              ))}
            </div>
            {apiErrors.priority && <p className="text-red-500 text-xs mt-1">{apiErrors.priority[0]}</p>}
          </div>

          <div>
            <label className={labelCls}>
              <Users size={11} className="text-gray-400" /> Assignees <span className="text-red-500">*</span>
              {lockedIds.length > 0 && (
                <span className="text-[10px] text-emerald-600 font-normal ml-auto">
                  {lockedIds.length} locked
                </span>
              )}
            </label>
            <UserMultiSelect
              options={employees}
              selected={assignees}
              onChange={setAssignees}
              placeholder="Select assignees"
              isLoading={loadingEmployees}
              error={apiErrors.assignees}
              lockedIds={lockedIds}
            />
            {apiErrors.assignees && <p className="text-red-500 text-xs mt-1">{apiErrors.assignees[0]}</p>}
          </div>

          <div>
            <label className={labelCls}><MessageSquare size={11} className="text-gray-400" /> Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4}
              className={`${inputCls} resize-none`} placeholder="Task description..." />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100 bg-gray-50/50 shrink-0">
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-100 transition cursor-pointer">
            Cancel
          </button>
          <button onClick={handleSave} disabled={submitting || !isFormValid}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-lg shadow-orange-200">
            {submitting ? <><Loader2 size={14} className="animate-spin" />Saving…</> : <><CheckCheck size={14} />Save Changes</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ⭐═══════════════════════════════════════════════════════════════════════════
// ACTIVITY TIMELINE — shows all status change history
// ⭐═══════════════════════════════════════════════════════════════════════════
function ActivityTimeline({ logs, loading }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center gap-3 py-6">
        <Loader2 size={16} className="animate-spin text-orange-400" />
        <span className="text-xs text-gray-400">Loading activity…</span>
      </div>
    );
  }

  if (!logs || logs.length === 0) {
    return (
      <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
        <History size={22} className="mx-auto mb-2 text-gray-300" />
        <p className="text-xs text-gray-400 font-medium">No activity yet</p>
      </div>
    );
  }

  const STATUS_TIMELINE_CFG = {
    pending:     { dot: "#f59e0b", bg: "#fef9c3", text: "#854d0e", label: "Pending"     },
    in_progress: { dot: "#3b82f6", bg: "#dbeafe", text: "#1e40af", label: "In Progress" },
    completed:   { dot: "#22c55e", bg: "#dcfce7", text: "#166534", label: "Completed"   },
    overdue:     { dot: "#ef4444", bg: "#fee2e2", text: "#991b1b", label: "Overdue"     },
  };

  const getCfg = (s) => STATUS_TIMELINE_CFG[(s || "").toLowerCase().replace(/\s+/g, "_")] || STATUS_TIMELINE_CFG.pending;

  const Badge = ({ status }) => {
    const c = getCfg(status);
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold" style={{ background: c.bg, color: c.text }}>
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: c.dot }} />
        {c.label}
      </span>
    );
  };

  return (
    <div className="relative pl-6">
      <div className="absolute left-2 top-2.5 bottom-2.5 w-px bg-gray-200" />

      {logs.map((log, idx) => {
        const toCfg = getCfg(log.to_status);
        const date = log.changed_at ? new Date(log.changed_at) : null;
        const empName = log.employee?.name || "Unknown";
        const empInitials = empName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

        return (
          <div key={log.id} className={`relative ${idx === logs.length - 1 ? "" : "pb-4"}`}>
            <div
              className="absolute -left-[22px] top-1.5 w-4 h-4 rounded-full border-[3px] border-white"
              style={{
                background: toCfg.dot,
                boxShadow: `0 0 0 1.5px ${toCfg.dot}44`,
              }}
            />

            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                {log.from_status ? (
                  <>
                    <Badge status={log.from_status} />
                    <ArrowRight size={11} className="text-gray-400" />
                    <Badge status={log.to_status} />
                  </>
                ) : (
                  <span className="text-[11px] font-bold" style={{ color: toCfg.text }}>
                    Assigned as <strong>{toCfg.label}</strong>
                  </span>
                )}
              </div>

              {log.notes && (
                <div className="text-xs text-gray-700 leading-relaxed bg-white px-3 py-2 rounded-lg border border-gray-200 mb-2 whitespace-pre-wrap">
                  <div className="flex items-start gap-1.5">
                    <MessageSquare size={11} className="text-gray-400 mt-0.5 shrink-0" />
                    <span>{log.notes}</span>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 text-[10px] text-gray-400 font-medium flex-wrap">
                {log.employee && (
                  <span className="flex items-center gap-1.5">
                    <div
                      className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[7px] font-bold ring-1 ring-white shrink-0"
                      style={{ background: getColor(log.employee.id || 0) }}
                    >
                      {empInitials}
                    </div>
                    <span className="font-semibold text-gray-500">{empName}</span>
                    {log.employee.employee_id && (
                      <span className="font-mono text-gray-400">{log.employee.employee_id}</span>
                    )}
                  </span>
                )}
                {date && (
                  <span className="flex items-center gap-1.5">
                    <Clock size={10} className="text-gray-400" />
                    {date.toLocaleDateString("en-GB", { day: "2-digit", month: "short" })} ·{" "}
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

// ── TASK DETAIL MODAL (with Activity Timeline) ──────────────────────
function TaskDetailModal({ taskId, onClose, onStatusChange, onDeleted }) {
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);

  const fetchDetail = useCallback(async () => {
    if (!taskId) return;
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${BASE}/api/admin/tasks/${taskId}`, { headers: authHeaders() });
      if (!res.ok) throw new Error(`Failed to load task (${res.status})`);
      const data = await res.json();
      setTask(data.data || data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  const fetchLogs = useCallback(async () => {
    if (!taskId) return;
    setLogsLoading(true);
    try {
      const res = await fetch(`${BASE}/api/admin/tasks/${taskId}/status-logs`, { headers: authHeaders() });
      const json = await res.json();
      if (json.success) setLogs(json.data || []);
      else setLogs([]);
    } catch (err) {
      console.error("Failed to load logs:", err);
      setLogs([]);
    } finally {
      setLogsLoading(false);
    }
  }, [taskId]);

  useEffect(() => { fetchDetail(); }, [fetchDetail]);
  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const toggleStatus = async () => {
    if (!task) return;
    const newStatus = task.status === "completed" ? "pending" : "completed";
    setUpdating(true);
    try {
      const res = await fetch(`${BASE}/api/admin/tasks/${task.id}`, {
        method: "PUT",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      setTask(prev => ({ ...prev, status: newStatus, completed_at: newStatus === "completed" ? new Date().toISOString() : null }));
      onStatusChange?.();
      fetchLogs();
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!task) return;
    setDeleting(true); setDeleteError(null);
    try {
      const res = await fetch(`${BASE}/api/admin/tasks/${task.id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to delete task");
      onDeleted?.(task.title);
      onClose();
    } catch (err) {
      setDeleteError(err.message);
      setShowDeleteConfirm(false);
    } finally {
      setDeleting(false);
    }
  };

  const priorityClass = task?.priority ? (priorityColors[task.priority.toLowerCase()] || "bg-gray-100 text-gray-600") : "bg-gray-100 text-gray-600";
  const statusClass = task?.status ? (statusColors[task.status] || "bg-gray-100 text-gray-600") : "bg-gray-100 text-gray-600";
  const project = task?.project;
  const creator = task?.creator;
  const assignees = task?.assignees || [];
  const isDone = ["completed","done"].includes((task?.status || "").toLowerCase());
  const isOverdue = task && isTaskOverdue(task);

  const totalAssignees = assignees.length;
  const completedAssignees = assignees.filter(a => a.pivot?.status === "completed").length;
  const progressPct = totalAssignees > 0 ? Math.round((completedAssignees / totalAssignees) * 100) : 0;

  return (
    <>
      <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-gray-900/45 backdrop-blur-sm" onClick={onClose} />

        <div className="relative bg-white rounded-3xl shadow-2xl shadow-gray-300/50 w-full max-w-2xl z-10 flex flex-col max-h-[92vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 px-6 py-5 border-b border-gray-100 shrink-0 bg-gradient-to-br from-orange-50/50 to-transparent">
            <div className="flex items-start gap-3 min-w-0">
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${isDone ? "bg-emerald-100" : isOverdue ? "bg-rose-100" : "bg-orange-100"}`}>
                {isDone ? <CheckCheck size={19} className="text-emerald-600" /> : isOverdue ? <AlertOctagon size={19} className="text-rose-600" /> : <FileText size={19} className="text-orange-500" />}
              </div>
              <div className="min-w-0">
                <h2 className="text-base font-bold text-gray-900 truncate">
                  {loading ? "Loading task…" : (task?.title || "Task")}
                </h2>
                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                  {task?.id != null && (
                    <span className="text-[10px] font-mono text-gray-400 bg-gray-50 ring-1 ring-gray-100 px-1.5 py-0.5 rounded-md">
                      #{task.id}
                    </span>
                  )}
                  {task?.priority && (
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md capitalize ${priorityClass}`}>
                      {task.priority}
                    </span>
                  )}
                  {task?.status && (
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusClass}`}>
                      • {task.status}
                    </span>
                  )}
                  {isOverdue && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 flex items-center gap-1">
                      <AlertTriangle size={9} /> Overdue
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {task && !loading && !isDone && (
                <>
                  <button onClick={() => setShowEdit(true)}
                    title="Edit task"
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-white hover:bg-orange-50 text-gray-500 hover:text-orange-600 transition cursor-pointer ring-1 ring-gray-100">
                    <PencilLine size={14} />
                  </button>
                  <button onClick={() => setShowDeleteConfirm(true)}
                    title="Delete task"
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-white hover:bg-rose-50 text-gray-500 hover:text-rose-600 transition cursor-pointer ring-1 ring-gray-100">
                    <Trash2 size={14} />
                  </button>
                </>
              )}
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-white hover:bg-gray-100 text-gray-500 transition cursor-pointer ring-1 ring-gray-100">
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="overflow-y-auto flex-1 px-6 py-5">
            {deleteError && (
              <div className="flex items-start gap-2 p-3 mb-4 bg-rose-50 border border-rose-100 rounded-2xl text-xs text-rose-600">
                <AlertTriangle size={13} className="shrink-0 mt-0.5" /><span>{deleteError}</span>
              </div>
            )}

            {loading && (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
                <Loader2 size={24} className="animate-spin text-orange-400" />
                <span className="text-sm">Loading task details…</span>
              </div>
            )}

            {!loading && error && (
              <div className="flex items-start gap-2 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-sm text-rose-600">
                <AlertTriangle size={15} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {!loading && !error && task && (
              <div className="space-y-5">
                {isDone && (
                  <div className="bg-gradient-to-r from-emerald-50 to-white ring-1 ring-emerald-200 rounded-2xl p-3.5 flex items-center gap-2">
                    <CircleCheck size={16} className="text-emerald-600 shrink-0" />
                    <p className="text-xs text-emerald-700">
                      <span className="font-bold">This task is completed</span> · editing and deleting are disabled
                    </p>
                  </div>
                )}

                {task.description && (
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Description</p>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 rounded-2xl p-4 ring-1 ring-gray-100">
                      {task.description}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Timeline</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-2xl p-4 ring-1 ring-gray-100">
                      <div className="flex items-center gap-1.5 mb-1">
                        <CalendarDays size={11} className="text-gray-400" />
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Start Date</p>
                      </div>
                      <p className="text-sm font-semibold text-gray-800">{fmtDate(task.start_date)}</p>
                    </div>
                    <div className={`rounded-2xl p-4 ring-1 ${isOverdue ? "bg-rose-50 ring-rose-100" : "bg-gray-50 ring-gray-100"}`}>
                      <div className="flex items-center gap-1.5 mb-1">
                        <CalendarClock size={11} className={isOverdue ? "text-rose-500" : "text-gray-400"} />
                        <p className={`text-[10px] font-semibold uppercase tracking-wider ${isOverdue ? "text-rose-500" : "text-gray-400"}`}>Due Date</p>
                      </div>
                      <p className={`text-sm font-semibold ${isOverdue ? "text-rose-700" : "text-gray-800"}`}>{fmtDate(task.due_date)}</p>
                    </div>
                  </div>
                </div>

                {project && (
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Project</p>
                    <div className="bg-gradient-to-br from-orange-50 to-amber-50/40 rounded-2xl p-4 ring-1 ring-orange-100 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-orange-500 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-md shadow-orange-200">
                        {(project.project_name || "P")[0]}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-800 truncate">{project.project_name}</p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="text-[10px] font-mono text-orange-600 bg-white/70 ring-1 ring-orange-100 px-1.5 py-0.5 rounded-md">
                            {project.project_code}
                          </span>
                          {project.status && (
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColors[project.status] || "bg-gray-100 text-gray-600"}`}>
                              • {project.status}
                            </span>
                          )}
                          {project.priority && (
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md capitalize ${priorityColors[project.priority.toLowerCase()] || "bg-gray-100 text-gray-600"}`}>
                              {project.priority}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Assignees */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      Assignees {totalAssignees > 0 && <span className="text-gray-300 normal-case font-medium">({totalAssignees})</span>}
                    </p>
                    {completedAssignees > 0 && (
                      <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full ring-1 ring-emerald-100">
                        {completedAssignees} done
                      </span>
                    )}
                  </div>

                  {totalAssignees === 0 ? (
                    <p className="text-sm text-gray-400 italic">No assignees</p>
                  ) : (
                    <div className="space-y-2">
                      {assignees.map((a, i) => {
                        const initials = ((a.firstname?.[0] || "") + (a.lastname?.[0] || "")).toUpperCase() || "?";
                        const fullName = `${a.firstname || ""} ${a.lastname || ""}`.trim() || a.username || a.email || `Employee ${a.id}`;
                        const pivotStatus = a.pivot?.status || "pending";
                        const pivotCompleted = a.pivot?.completed_at;
                        const isDone = pivotStatus === "completed";
                        const isInProgress = pivotStatus === "in_progress";

                        return (
                          <div
                            key={a.id}
                            className={`flex items-center gap-3 rounded-2xl p-3 ring-1 transition-all ${
                              isDone
                                ? "bg-gradient-to-r from-emerald-50/70 to-white ring-emerald-100"
                                : isInProgress
                                ? "bg-gradient-to-r from-sky-50/70 to-white ring-sky-100"
                                : "bg-white ring-gray-100"
                            }`}
                          >
                            <div className="relative shrink-0">
                              {a.profile_image ? (
                                <img src={a.profile_image} alt={fullName} className={`w-10 h-10 rounded-full object-cover ring-2 ${isDone ? "ring-emerald-300" : isInProgress ? "ring-sky-300" : "ring-gray-200"}`} />
                              ) : (
                                <div
                                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold ring-2 shadow-sm ${isDone ? "ring-emerald-300" : isInProgress ? "ring-sky-300" : "ring-white"}`}
                                  style={{ backgroundColor: getColor(i) }}
                                >
                                  {initials}
                                </div>
                              )}
                              {isDone && (
                                <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 rounded-full ring-2 ring-white flex items-center justify-center">
                                  <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
                                    <path d="M1.5 5L4 7.5L8.5 3" stroke="white" strokeWidth="2" strokeLinecap="round" />
                                  </svg>
                                </span>
                              )}
                              {isInProgress && !isDone && (
                                <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-sky-500 rounded-full ring-2 ring-white flex items-center justify-center">
                                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                                </span>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-800 truncate">{fullName}</p>
                              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                {a.employee_id && (
                                  <span className="text-[10px] font-mono text-gray-400">{a.employee_id}</span>
                                )}
                                {pivotCompleted && (
                                  <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                                    <Clock size={9} />
                                    {fmtDateTime(pivotCompleted)}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className={`shrink-0 flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full ring-1 capitalize ${
                              isDone
                                ? "bg-emerald-100 text-emerald-700 ring-emerald-200"
                                : isInProgress
                                ? "bg-sky-100 text-sky-700 ring-sky-200"
                                : "bg-gray-100 text-gray-600 ring-gray-200"
                            }`}>
                              {isDone && <CheckCheck size={11} />}
                              {isInProgress && <Loader2 size={11} className="animate-spin" />}
                              {pivotStatus.replace("_", " ")}
                            </div>
                          </div>
                        );
                      })}

                      <div className={`rounded-2xl p-4 ring-1 transition-colors ${
                        progressPct === 100
                          ? "bg-gradient-to-br from-emerald-50 to-emerald-50/30 ring-emerald-200"
                          : "bg-gradient-to-br from-sky-50 to-white ring-sky-100"
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest flex items-center gap-1.5">
                            <Users size={11} />
                            Team Progress
                          </span>
                          <span className={`text-sm font-bold tabular-nums ${progressPct === 100 ? "text-emerald-600" : "text-sky-600"}`}>
                            {completedAssignees}/{totalAssignees}
                          </span>
                        </div>
                        <div className="h-2.5 rounded-full bg-white overflow-hidden ring-1 ring-gray-100 relative">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              progressPct === 100
                                ? "bg-gradient-to-r from-emerald-400 to-emerald-600"
                                : "bg-gradient-to-r from-sky-400 to-sky-600"
                            }`}
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                        <p className={`text-[10px] mt-1.5 font-semibold ${progressPct === 100 ? "text-emerald-600" : "text-sky-600"}`}>
                          {progressPct === 100 ? "🎉 All assignees completed!" : `${progressPct}% complete`}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Activity Timeline */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                      <History size={11} className="text-gray-400" />
                      Activity Timeline
                      {logs.length > 0 && (
                        <span className="text-[9px] font-bold bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">
                          {logs.length}
                        </span>
                      )}
                    </p>
                  </div>
                  <ActivityTimeline logs={logs} loading={logsLoading} />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                  {creator && (
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Created By</p>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                          {(creator.name || creator.username || "?")[0].toUpperCase()}
                        </div>
                        <div className="leading-tight min-w-0">
                          <p className="text-xs font-semibold text-gray-800 truncate">{creator.name || creator.username}</p>
                          {creator.email && <p className="text-[10px] text-gray-400 truncate">{creator.email}</p>}
                        </div>
                      </div>
                    </div>
                  )}
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Created On</p>
                    <p className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                      <Clock size={11} className="text-gray-400" />
                      {fmtDateTime(task.created_at)}
                    </p>
                    {task.updated_at && task.updated_at !== task.created_at && (
                      <p className="text-[10px] text-gray-400 mt-1">Updated {fmtDateTime(task.updated_at)}</p>
                    )}
                  </div>
                </div>

                {task.completed_at && (
                  <div className="bg-emerald-50 ring-1 ring-emerald-100 rounded-2xl p-3.5 flex items-center gap-2">
                    <CheckCheck size={14} className="text-emerald-600 shrink-0" />
                    <p className="text-xs text-emerald-700">
                      <span className="font-semibold">Completed on</span> {fmtDateTime(task.completed_at)}
                    </p>
                  </div>
                )}

                {task.attachment && (
                  <div className="bg-sky-50 ring-1 ring-sky-100 rounded-2xl p-3.5 flex items-center gap-2">
                    <Paperclip size={13} className="text-sky-600 shrink-0" />
                    <a href={task.attachment} target="_blank" rel="noreferrer" className="text-xs text-sky-700 font-semibold underline truncate">
                      View attachment
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50 shrink-0">
            <button onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-100 transition cursor-pointer">
              Close
            </button>
            {task && (
              <button
                onClick={toggleStatus}
                disabled={updating}
                className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-xl transition disabled:opacity-50 cursor-pointer shadow-lg
                  ${isDone ? "bg-gray-500 hover:bg-gray-600 shadow-gray-200" : "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200"}`}
              >
                {updating ? (
                  <><Loader2 size={14} className="animate-spin" />Updating…</>
                ) : isDone ? (
                  <><RotateCw size={14} />Mark as Pending</>
                ) : (
                  <><CheckCheck size={14} />Mark as Completed</>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {showEdit && task && (
        <EditTaskModal
          task={task}
          onClose={() => setShowEdit(false)}
          onSuccess={(updatedTask) => {
            setTask(prev => ({ ...prev, ...updatedTask }));
            onStatusChange?.();
          }}
        />
      )}

      {showDeleteConfirm && (
        <ConfirmDialog
          title="Delete this task?"
          message={`"${task?.title}" will be permanently removed. This action cannot be undone.`}
          confirmLabel="Delete Task"
          loading={deleting}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </>
  );
}

// ── CLIENT MODAL ─────────────────────────────────────────────────────
function ClientModal({ client, onClose, onSuccess }) {
  const isEdit = !!client;
  const [tab, setTab] = useState("basic");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [codeChecking, setCodeChecking] = useState(false);
  const [codeError, setCodeError] = useState(null);
  const [generatingCode, setGeneratingCode] = useState(false);

  const [form, setForm] = useState(isEdit ? {
    client_code: client.client_code || "",
    company_name: client.company_name || "",
    contact_person: client.contact_person || "",
    email: client.email || "",
    phone: client.phone || "",
    alternative_phone: client.alternative_phone || "",
    address: client.address || "",
    city: client.city || "",
    state: client.state || "",
    zip_code: client.zip_code || "",
    country: client.country || "India",
    gst_number: client.gst_number || "",
    pan_number: client.pan_number || "",
    payment_terms: client.payment_terms || "net_30",
    credit_limit: client.credit_limit || "",
    notes: client.notes || "",
    status: client.status || "active",
  } : {
    client_code: "", company_name: "", contact_person: "", email: "",
    phone: "", alternative_phone: "",
    address: "", city: "", state: "", zip_code: "", country: "India",
    gst_number: "", pan_number: "",
    payment_terms: "net_30", credit_limit: "",
    notes: "", status: "active",
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  useEffect(() => {
    if (isEdit) return;
    const autoGenCode = async () => {
      setGeneratingCode(true);
      try {
        const token = localStorage.getItem("admin_auth_token");
        const res = await fetch(`${BASE}/api/admin/clients/next-code`, {
          headers: { Authorization: `Bearer ${token}`, "ngrok-skip-browser-warning": "true" }
        });
        const data = await res.json();
        if (data.success && data.next_client_code) {
          set("client_code", data.next_client_code);
        }
      } catch (err) {
        console.error("Auto-generate client code failed:", err);
      } finally {
        setGeneratingCode(false);
      }
    };
    autoGenCode();
  }, []);

  const checkClientCode = useCallback(async (code) => {
    if (!code || code.trim() === "") { setCodeError(null); return true; }
    if (isEdit && code === client.client_code) { setCodeError(null); return true; }
    setCodeChecking(true); setCodeError(null);
    try {
      const token = localStorage.getItem("admin_auth_token");
      const res = await fetch(`${BASE}/api/admin/clients/check-code`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
        body: JSON.stringify({ client_code: code.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Code check failed");
      if (data.exists === true) { setCodeError(data.message || "Client code already taken"); return false; }
      setCodeError(null); return true;
    } catch (err) { setCodeError(err.message || "Could not verify code"); return false; }
    finally { setCodeChecking(false); }
  }, [isEdit, client]);

  const isValid = () => {
    if (!form.company_name.trim()) return false;
    if (form.client_code && form.client_code.trim() !== "" && codeError) return false;
    return true;
  };

  const handleSave = async () => {
    if (!isValid()) { if (!form.company_name.trim()) setTab("basic"); return; }
    setSaving(true); setSaveError(null);
    try {
      const token = localStorage.getItem("admin_auth_token");
      const url = isEdit ? `${BASE}/api/admin/clients/${client.id}` : `${BASE}/api/admin/clients`;
      const method = isEdit ? "PUT" : "POST";
      const payload = { ...form, credit_limit: form.credit_limit ? Number(form.credit_limit) : null };
      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || (data?.errors ? Object.values(data.errors).flat().join(" • ") : `Error ${res.status}`));
      onSuccess?.(data, isEdit ? "Client updated successfully!" : "Client created successfully!");
      onClose();
    } catch (err) { setSaveError(err.message || "Failed to save."); }
    finally { setSaving(false); }
  };

  const TABS = [
    { key: "basic", label: "Basic Info", Icon: Building2 },
    { key: "address", label: "Address", Icon: MapPin },
    { key: "tax", label: "Tax & Business", Icon: BadgeCheck },
    { key: "billing", label: "Billing", Icon: CreditCard },
    { key: "notes", label: "Notes & Status", Icon: FileText },
  ];

  const currentTabIdx = TABS.findIndex(t => t.key === tab);
  const inputCls = "w-full text-sm border border-gray-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50 transition text-gray-800 bg-white placeholder:text-gray-400";
  const labelCls = "block text-xs font-semibold text-gray-600 mb-1.5";

  const renderTabContent = () => {
    switch (tab) {
      case "basic": return (
        <div className="space-y-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Company & Contact</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Company Name <span className="text-red-500">*</span></label>
              <input value={form.company_name} onChange={e => set("company_name", e.target.value)} placeholder="Acme Corp" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Client Code</label>
              <div className="relative">
                <input
                  value={generatingCode ? "Generating..." : form.client_code}
                  readOnly
                  className={`${inputCls} bg-gray-50 text-gray-400 cursor-not-allowed select-none`}
                />
                {generatingCode && (
                  <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-gray-400" />
                )}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Contact Person</label>
              <input value={form.contact_person} onChange={e => set("contact_person", e.target.value)} placeholder="Full name" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Email</label>
              <input type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="email@example.com" className={inputCls} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Phone</label>
              <input type="tel" value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="+91 00000 00000" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Alternative Phone (optional)</label>
              <input type="tel" value={form.alternative_phone} onChange={e => set("alternative_phone", e.target.value)} placeholder="+91 00000 00000" className={inputCls} />
            </div>
          </div>
        </div>
      );

      case "address": return (
        <div className="space-y-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Address Details</p>
          <div>
            <label className={labelCls}>Address</label>
            <textarea value={form.address} onChange={e => set("address", e.target.value)} rows={3}
              placeholder="Street address, building, floor…" className={`${inputCls} resize-none`} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className={labelCls}>City</label><input value={form.city} onChange={e => set("city", e.target.value)} placeholder="Type city" className={inputCls} /></div>
            <div><label className={labelCls}>State</label><input value={form.state} onChange={e => set("state", e.target.value)} placeholder="Type state" className={inputCls} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className={labelCls}>ZIP / Postal Code</label><input value={form.zip_code} onChange={e => set("zip_code", e.target.value)} placeholder="******" className={inputCls} /></div>
            <div><label className={labelCls}>Country</label><input value={form.country} onChange={e => set("country", e.target.value)} placeholder="Country" className={inputCls} /></div>
          </div>
        </div>
      );

      case "tax": return (
        <div className="space-y-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Tax & Business Details</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>GST Number (optional)</label>
              <input value={form.gst_number} onChange={e => set("gst_number", e.target.value.toUpperCase())}
                placeholder="22AAAAA0000A1Z5" maxLength={15} className={inputCls} />
              <p className="text-[10px] text-gray-400 mt-1">15-character GSTIN</p>
            </div>
            <div>
              <label className={labelCls}>PAN Number (optional)</label>
              <input value={form.pan_number} onChange={e => set("pan_number", e.target.value.toUpperCase())}
                placeholder="AAAAA0000A" maxLength={10} className={inputCls} />
              <p className="text-[10px] text-gray-400 mt-1">10-character PAN</p>
            </div>
          </div>
          <div className="bg-amber-50 ring-1 ring-amber-100 rounded-2xl p-4">
            <p className="text-[11px] font-semibold text-amber-700 mb-1">Important</p>
            <p className="text-[11px] text-amber-600">GST and PAN numbers are used for invoicing and compliance. Ensure they match your client's official documents.</p>
          </div>
        </div>
      );

      case "billing": return (
        <div className="space-y-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Billing & Payment Terms</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Payment Terms</label>
              <div className="relative">
                <select value={form.payment_terms} onChange={e => set("payment_terms", e.target.value)} className="w-full text-sm border border-gray-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50 appearance-none bg-white transition text-gray-700 cursor-pointer">
                  <option value="immediate">Immediate</option>
                  <option value="net_15">Net 15</option>
                  <option value="net_30">Net 30</option>
                  <option value="net_45">Net 45</option>
                  <option value="net_60">Net 60</option>
                </select>
                <ChevronDown size={13} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            <div>
              <label className={labelCls}>Credit Limit (₹)</label>
              <input type="number" min="0" value={form.credit_limit} onChange={e => set("credit_limit", e.target.value)}
                placeholder="e.g. 100000" className={inputCls} />
              <p className="text-[10px] text-gray-400 mt-1">Leave blank for no limit</p>
            </div>
          </div>
          <div className="bg-sky-50 rounded-2xl p-4 ring-1 ring-sky-100">
            <p className="text-[11px] font-semibold text-sky-700 mb-2">Payment Terms Reference</p>
            <div className="grid grid-cols-2 gap-y-1.5 gap-x-4 text-[10px] text-sky-600">
              {[
                ["Immediate", "Due on receipt"],
                ["Net 15", "Due in 15 days"],
                ["Net 30", "Due in 30 days"],
                ["Net 45", "Due in 45 days"],
                ["Net 60", "Due in 60 days"],
              ].map(([t, d]) => (
                <div key={t} className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0" />
                  <span><span className="font-semibold">{t}:</span> {d}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      );

      case "notes": return (
        <div className="space-y-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Notes & Status</p>
          <div>
            <label className={labelCls}>Status</label>
            <div className="flex items-center gap-3">
              {["active", "inactive"].map(s => (
                <label key={s}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border cursor-pointer transition text-sm font-medium select-none
                    ${form.status === s
                      ? s === "active"
                        ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                        : "border-rose-300 bg-rose-50 text-rose-600"
                      : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
                  <input type="radio" name="status" value={s} checked={form.status === s}
                    onChange={() => set("status", s)} className="sr-only" />
                  <span className={`w-2 h-2 rounded-full ${form.status === s ? (s === "active" ? "bg-emerald-500" : "bg-rose-400") : "bg-gray-300"}`} />
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className={labelCls}>Notes</label>
            <textarea value={form.notes} onChange={e => set("notes", e.target.value)} rows={6}
              placeholder="Any additional notes about this client…" className={`${inputCls} resize-none`} />
          </div>
        </div>
      );

      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center">
      <div className="absolute inset-0 bg-gray-900/45 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl shadow-gray-300/50 w-full max-w-2xl mx-4 z-10 flex flex-col max-h-[92vh]">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0 bg-gradient-to-br from-orange-50/60 to-transparent">
          <div>
            <h2 className="text-base font-bold text-gray-900">
              {isEdit ? `Edit Client` : "Add New Client"}
            </h2>
            <p className="text-[11px] text-gray-400 mt-0.5">
              {isEdit ? "Update client information below" : "Fill in the details to create a new client"}
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-white hover:bg-gray-100 text-gray-500 transition ring-1 ring-gray-100 cursor-pointer">
            <X size={15} />
          </button>
        </div>

        <div className="flex border-b border-gray-100 shrink-0 px-2 overflow-x-auto">
          {TABS.map(({ key, label, Icon }) => (
            <button key={key} onClick={() => setTab(key)}
              className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors cursor-pointer
                ${tab === key ? "border-orange-500 text-orange-600" : "border-transparent text-gray-400 hover:text-gray-600"}`}>
              <Icon size={12} />{label}
            </button>
          ))}
        </div>

        <div className="overflow-y-auto px-6 py-5 flex-1">
          {saveError && (
            <div className="flex items-start gap-2 p-3 bg-rose-50 border border-rose-100 rounded-2xl text-xs text-rose-600 mb-4">
              <AlertTriangle size={13} className="shrink-0 mt-0.5" /><span>{saveError}</span>
            </div>
          )}
          {renderTabContent()}
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50 shrink-0">
          <div className="flex items-center gap-1.5">
            {TABS.map(({ key }) => (
              <button key={key} onClick={() => setTab(key)}
                className={`h-2 rounded-full transition-all cursor-pointer ${tab === key ? "bg-orange-500 w-4" : "bg-gray-200 hover:bg-gray-300 w-2"}`} />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setTab(TABS[currentTabIdx - 1].key)} disabled={currentTabIdx === 0}
              className="px-3 py-1.5 text-xs font-medium text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition cursor-pointer">
              ← Prev
            </button>
            <button onClick={() => setTab(TABS[currentTabIdx + 1].key)} disabled={currentTabIdx === TABS.length - 1}
              className="px-3 py-1.5 text-xs font-medium text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition cursor-pointer">
              Next →
            </button>
            <div className="w-px h-5 bg-gray-200 mx-1" />
            <button onClick={onClose} className="px-5 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-100 transition cursor-pointer">
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving || !isValid() || codeChecking || generatingCode}
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-lg shadow-orange-200">
              {saving
                ? <><Loader2 size={14} className="animate-spin" />{isEdit ? "Updating…" : "Saving…"}</>
                : isEdit
                  ? <><PencilLine size={14} />Update Client</>
                  : <><UserPlus size={14} />Save Client</>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── ADD PROJECT MODAL (unchanged) ────────────────────────────────
function AddProjectModal({ onClose, onSuccess }) {
  const [tab, setTab] = useState("basic");
  const [projectName, setProjectName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [priority, setPriority] = useState("");
  const [description, setDescription] = useState("");
  const [projectCode, setProjectCode] = useState("");
  const [codeCheckStatus, setCodeCheckStatus] = useState(null);
  const [codeChecking, setCodeChecking] = useState(false);
  const [generatingCode, setGeneratingCode] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);
  const [teamLeaderId, setTeamLeaderId] = useState("");
  const [projectManagerId, setProjectManagerId] = useState("");
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [membersError, setMembersError] = useState(null);
  const [memberOptions, setMemberOptions] = useState({ teamLeaders: [], projectManagers: [], teamMembers: [] });
  const [clients, setClients] = useState([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [validationErrors, setValidationErrors] = useState({ teamLeader: false, projectManager: false });
  const [submitting, setSubmitting] = useState(false);
  const [apiErrors, setApiErrors] = useState({});
  const [inlineError, setInlineError] = useState(null);
  const [showClientModal, setShowClientModal] = useState(false);
  const [clientSuccessMsg, setClientSuccessMsg] = useState(null);

  const isFormValid =
    projectName.trim() !== "" &&
    projectCode.trim() !== "" &&
    selectedClientId !== "" &&
    teamLeaderId !== "" &&
    projectManagerId !== "";

  const extractArray = (response, key = "data") => {
    if (Array.isArray(response)) return response;
    if (response && Array.isArray(response[key])) return response[key];
    return [];
  };

  const authHeadersLocal = () => {
    const token = localStorage.getItem("admin_auth_token");
    return { Authorization: `Bearer ${token}`, "ngrok-skip-browser-warning": "true" };
  };

  useEffect(() => {
    const autoGenCode = async () => {
      setGeneratingCode(true);
      try {
        const res = await fetch(`${BASE}/api/admin/projects/next-code`, { headers: authHeadersLocal() });
        const data = await res.json();
        if (data.success && data.next_project_code) setProjectCode(data.next_project_code);
      } catch (err) { console.error(err); } finally { setGeneratingCode(false); }
    };
    autoGenCode();
    fetchMembersData();
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const res = await fetch(`${BASE}/api/admin/clients`, { headers: authHeadersLocal() });
      if (!res.ok) throw new Error("Failed to fetch clients");
      const data = await res.json();
      const list = data.data || data;
      setClients(Array.isArray(list) ? list : []);
    } catch (err) { console.error(err); } finally { setLoadingClients(false); }
  };

  const fetchMembersData = async () => {
    setLoadingMembers(true); setMembersError(null);
    try {
      const headers = { ...authHeadersLocal(), "Content-Type": "application/json" };
      const desigRes = await fetch(`${BASE}/api/admin/designations`, { headers });
      if (!desigRes.ok) throw new Error(`Designations API error: ${desigRes.status}`);
      const desigData = await desigRes.json();
      const designations = extractArray(desigData, "data");

      const roleMap = new Map();
      designations.forEach((d) => {
        const name = d.name?.toLowerCase() || "";
        if (/\b(project manager|pm)\b/.test(name)) roleMap.set(d.id, "project_manager");
        else if (/\b(team leader|team lead|tl|lead)\b/.test(name)) roleMap.set(d.id, "team_leader");
        else roleMap.set(d.id, "team_member");
      });

      const empRes = await fetch(`${BASE}/api/admin/employees`, { headers });
      if (!empRes.ok) throw new Error(`Employees API error: ${empRes.status}`);
      const empData = await empRes.json();
      const employees = extractArray(empData, "data");

      const managersList = [], leadersList = [], membersList = [];
      employees.forEach((emp) => {
        const empName = emp.firstname
          ? `${emp.firstname} ${emp.lastname || ""}`.trim()
          : (emp.name || emp.username || emp.email || `Employee ${emp.id}`);
        const role = roleMap.get(emp.designation?.id || emp.designation_id);
        if (role === "project_manager") managersList.push({ id: emp.id, name: empName });
        else if (role === "team_leader") leadersList.push({ id: emp.id, name: empName });
        else membersList.push({ id: emp.id, name: empName });
      });

      setMemberOptions({ teamLeaders: leadersList, projectManagers: managersList, teamMembers: membersList });
    } catch (err) {
      setMembersError(err.message);
      setMemberOptions({ teamLeaders: [], projectManagers: [], teamMembers: [] });
    } finally { setLoadingMembers(false); }
  };

  const regenerateCode = async () => {
    setGeneratingCode(true); setCodeCheckStatus(null);
    try {
      const res = await fetch(`${BASE}/api/admin/projects/next-code`, { headers: authHeadersLocal() });
      const data = await res.json();
      if (data.success && data.next_project_code) setProjectCode(data.next_project_code);
    } catch (err) { console.error(err); } finally { setGeneratingCode(false); }
  };

  const checkProjectCode = async () => {
    if (!projectCode.trim()) return;
    setCodeChecking(true); setCodeCheckStatus(null);
    try {
      const res = await fetch(`${BASE}/api/admin/projects/check-code`, {
        method: "POST",
        headers: { ...authHeadersLocal(), "Content-Type": "application/json" },
        body: JSON.stringify({ project_code: projectCode })
      });
      const data = await res.json();
      if (res.ok && data.available) setCodeCheckStatus({ type: "success", message: "Code is available" });
      else setCodeCheckStatus({ type: "error", message: data.message || "Code already exists" });
    } catch { setCodeCheckStatus({ type: "error", message: "Failed to check code" }); }
    finally { setCodeChecking(false); }
  };

  const handleClientAdded = () => {
    fetchClients();
    setClientSuccessMsg("Client created successfully!");
    setTimeout(() => setClientSuccessMsg(null), 2500);
  };

  const handleSave = async () => {
    setApiErrors({}); setInlineError(null);
    const errors = { teamLeader: !teamLeaderId, projectManager: !projectManagerId };
    setValidationErrors(errors);
    if (errors.teamLeader || errors.projectManager) {
      setTab("members");
      setInlineError("Please select a Team Leader and a Project Manager.");
      return;
    }
    if (!projectName.trim()) { setInlineError("Project Name is required."); return; }
    if (!projectCode.trim()) { setInlineError("Project Code is required."); return; }
    if (!selectedClientId) { setInlineError("Please select a client."); return; }

    setSubmitting(true);
    try {
      const priorityValue = priority
        ? (['low','medium','high','urgent'].includes(priority.toLowerCase()) ? priority.toLowerCase() : 'medium')
        : null;

      const payload = {
        project_name: projectName,
        project_code: projectCode,
        client_id: parseInt(selectedClientId),
        start_date: startDate || null,
        end_date: endDate || null,
        priority: priorityValue,
        description: description || null,
        project_manager_id: projectManagerId ? parseInt(projectManagerId) : null,
        team_leader_id: teamLeaderId ? parseInt(teamLeaderId) : null,
        team_members: teamMembers.map(id => Number(id))
      };

      const res = await fetch(`${BASE}/api/admin/projects`, {
        method: "POST",
        headers: { ...authHeadersLocal(), "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 422 && data.errors) {
          setApiErrors(data.errors);
          setInlineError(Object.values(data.errors).flat().join(" • "));
        } else throw new Error(data.message || "Failed to create project");
        return;
      }
      onSuccess?.("Project created successfully!");
      onClose();
    } catch (err) { setInlineError(err.message); }
    finally { setSubmitting(false); }
  };

  const inputCls = "w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-2xl outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50 text-black transition-all bg-white cursor-text";

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/45 backdrop-blur-sm p-4">
        <div className="bg-white rounded-3xl shadow-2xl shadow-gray-300/50 w-full max-w-lg flex flex-col overflow-hidden" style={{ maxHeight: "90vh" }}>
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0 bg-gradient-to-br from-orange-50/60 to-transparent">
            <div>
              <h2 className="text-base font-bold text-gray-800">Add Project</h2>
              <p className="text-xs text-gray-400 mt-0.5">Fill in the details to create a new project</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-gray-100 bg-white ring-1 ring-gray-100 flex items-center justify-center text-gray-500 cursor-pointer transition-colors">
              <X size={16} />
            </button>
          </div>

          <div className="flex border-b border-gray-100 px-6 shrink-0 bg-gray-50/40">
            {[["basic","basic"],["members","members"]].map(([t]) => (
              <button key={t} onClick={() => setTab(t)}
                className={`py-3 px-4 text-sm font-semibold border-b-2 transition-colors -mb-px cursor-pointer flex items-center gap-1.5
                  ${tab === t ? "border-orange-500 text-orange-600" : "border-transparent text-gray-400 hover:text-gray-600"}`}>
                {t === "basic" ? <><FileText size={13} />Basic Info</> : <><Users size={13} />Members</>}
              </button>
            ))}
            <div className="ml-auto flex items-center gap-1.5 pr-1">
              {["basic","members"].map((t) => (
                <div key={t} className={`w-2 h-2 rounded-full transition-colors ${tab === t ? "bg-orange-500" : "bg-gray-200"}`} />
              ))}
            </div>
          </div>

          {inlineError && (
            <div className="mx-6 mt-4 flex items-start gap-2 p-3 bg-rose-50 border border-rose-100 rounded-2xl text-xs text-rose-600 shrink-0">
              <TriangleAlert size={13} className="shrink-0 mt-0.5" /><span>{inlineError}</span>
            </div>
          )}

          {clientSuccessMsg && (
            <div className="mx-6 mt-4 flex items-start gap-2 p-3 bg-emerald-50 border border-emerald-100 rounded-2xl text-xs text-emerald-600 shrink-0">
              <CircleCheck size={13} className="shrink-0 mt-0.5" /><span>{clientSuccessMsg}</span>
            </div>
          )}

          <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
            {tab === "basic" && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1">
                    <Hash size={11} className="text-gray-400" /> Project Code <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <input
                        value={generatingCode ? "Generating..." : projectCode}
                        onChange={e => { setProjectCode(e.target.value.toUpperCase()); setCodeCheckStatus(null); }}
                        className={`${inputCls} font-mono bg-gray-50`}
                        placeholder="Auto-generated"
                        readOnly={generatingCode}
                      />
                      {generatingCode && <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-gray-400" />}
                    </div>
                    <button onClick={regenerateCode} disabled={generatingCode}
                      className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm hover:bg-gray-200 disabled:opacity-50 whitespace-nowrap font-medium cursor-pointer transition-colors">
                      <RotateCw size={13} /> New
                    </button>
                    <button onClick={checkProjectCode} disabled={codeChecking || !projectCode}
                      className="flex items-center gap-1.5 px-3 py-2 bg-orange-50 text-orange-600 ring-1 ring-orange-200 rounded-xl text-sm hover:bg-orange-100 disabled:opacity-50 font-medium cursor-pointer transition-colors">
                      {codeChecking ? <Loader2 size={14} className="animate-spin" /> : <CircleCheck size={13} />}
                      Check
                    </button>
                  </div>
                  {codeCheckStatus && (
                    <div className={`mt-1.5 text-xs flex items-center gap-1 ${codeCheckStatus.type === "success" ? "text-emerald-600" : "text-rose-500"}`}>
                      {codeCheckStatus.type === "success" ? <CircleCheck size={12} /> : <CircleAlert size={12} />}
                      {codeCheckStatus.message}
                    </div>
                  )}
                  {apiErrors.project_code && <p className="text-red-500 text-xs mt-1">{apiErrors.project_code[0]}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1">
                    <FileText size={11} className="text-gray-400" /> Project Name <span className="text-red-500">*</span>
                  </label>
                  <input value={projectName} onChange={e => setProjectName(e.target.value)}
                    className={inputCls} placeholder="Enter project name" />
                  {apiErrors.project_name && <p className="text-red-500 text-xs mt-1">{apiErrors.project_name[0]}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1">
                    <Building2 size={11} className="text-gray-400" /> Client <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <select
                        value={selectedClientId}
                        onChange={e => setSelectedClientId(e.target.value)}
                        disabled={loadingClients}
                        className={`${inputCls} cursor-pointer`}
                      >
                        <option value="">{loadingClients ? "Loading clients..." : "Select a client"}</option>
                        {clients.map(c => (
                          <option key={c.id} value={c.id}>
                            {c.company_name} ({c.client_code})
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowClientModal(true)}
                      className="flex items-center gap-1.5 px-4 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 transition-colors whitespace-nowrap cursor-pointer shadow-lg shadow-orange-200"
                    >
                      <UserPlus size={14} /> Add Client
                    </button>
                  </div>
                  {apiErrors.client_id && <p className="text-red-500 text-xs mt-1">{apiErrors.client_id[0]}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1">
                      <CalendarDays size={11} className="text-gray-400" /> Start Date
                    </label>
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={`${inputCls} cursor-pointer`} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1">
                      <CalendarDays size={11} className="text-gray-400" /> End Date
                    </label>
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className={`${inputCls} cursor-pointer`} />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1">
                    <TagIcon size={11} className="text-gray-400" /> Priority
                  </label>
                  <select value={priority} onChange={e => setPriority(e.target.value)} className={`${inputCls} cursor-pointer`}>
                    <option value="">Select Priority</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Description</label>
                  <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
                    className={`${inputCls} resize-none`} placeholder="Add a brief description..." />
                </div>

                <div className="bg-orange-50 ring-1 ring-orange-100 rounded-2xl p-3.5 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                    <Users size={15} className="text-orange-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-orange-700">Don't forget team members!</p>
                    <p className="text-[11px] text-orange-500">Assign a manager, leader & team in the Members tab.</p>
                  </div>
                  <button onClick={() => setTab("members")}
                    className="flex items-center gap-1 px-3 py-1.5 bg-orange-500 text-white text-xs font-semibold rounded-lg hover:bg-orange-600 shrink-0 transition-colors cursor-pointer">
                    Next <ArrowRight size={12} />
                  </button>
                </div>
              </>
            )}

            {tab === "members" && (
              <div className="space-y-5">
                {membersError && (
                  <div className="bg-rose-50 ring-1 ring-rose-100 text-rose-600 p-3 rounded-2xl text-xs flex items-center gap-2">
                    <TriangleAlert size={13} />
                    <span className="flex-1">{membersError}</span>
                    <button onClick={fetchMembersData} className="underline font-medium cursor-pointer">Retry</button>
                  </div>
                )}

                {loadingMembers ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-3 text-gray-400">
                    <Loader2 size={24} className="animate-spin text-orange-400" />
                    <span className="text-sm">Loading employees...</span>
                  </div>
                ) : (
                  <>
                    <div className="bg-white ring-1 ring-gray-100 rounded-2xl p-4 shadow-sm">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center">
                          <UserRoundCog size={14} className="text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-700">Project Manager <span className="text-red-500">*</span></p>
                          <p className="text-[11px] text-gray-400">Oversees the project & reports to stakeholders</p>
                        </div>
                      </div>
                      <SearchableSelect
                        options={memberOptions.projectManagers}
                        value={projectManagerId}
                        onChange={setProjectManagerId}
                        placeholder="Search & select project manager..."
                        error={validationErrors.projectManager}
                      />
                      {memberOptions.projectManagers.length === 0 && (
                        <p className="text-[11px] text-amber-500 mt-1.5 flex items-center gap-1"><TriangleAlert size={10} /> No project managers found</p>
                      )}
                    </div>

                    <div className="bg-white ring-1 ring-gray-100 rounded-2xl p-4 shadow-sm">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-7 h-7 rounded-full bg-sky-100 flex items-center justify-center">
                          <Crown size={14} className="text-sky-600" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-700">Team Leader <span className="text-red-500">*</span></p>
                          <p className="text-[11px] text-gray-400">Leads the day-to-day work of the team</p>
                        </div>
                      </div>
                      <SearchableSelect
                        options={memberOptions.teamLeaders}
                        value={teamLeaderId}
                        onChange={setTeamLeaderId}
                        placeholder="Search & select team leader..."
                        error={validationErrors.teamLeader}
                      />
                      {memberOptions.teamLeaders.length === 0 && (
                        <p className="text-[11px] text-amber-500 mt-1.5 flex items-center gap-1"><TriangleAlert size={10} /> No team leaders found</p>
                      )}
                    </div>

                    <div className="bg-white ring-1 ring-gray-100 rounded-2xl p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center">
                            <Users size={14} className="text-orange-500" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-700">Team Members</p>
                            <p className="text-[11px] text-gray-400">Select one or more members</p>
                          </div>
                        </div>
                        {teamMembers.length > 0 && (
                          <span className="text-[11px] text-orange-500 font-semibold bg-orange-50 px-2.5 py-1 rounded-full ring-1 ring-orange-100">
                            {teamMembers.length} selected
                          </span>
                        )}
                      </div>
                      <UserMultiSelect
                        options={memberOptions.teamMembers}
                        selected={teamMembers}
                        onChange={setTeamMembers}
                        placeholder="Click to select team members..."
                      />
                    </div>

                    {(projectManagerId || teamLeaderId || teamMembers.length > 0) && (
                      <div className="bg-gradient-to-br from-gray-50 to-orange-50/30 ring-1 ring-gray-200 rounded-2xl p-4 space-y-2">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Team Summary</p>
                        {projectManagerId && (
                          <div className="flex items-center gap-2 text-xs">
                            <UserRoundCog size={11} className="text-emerald-500 shrink-0" />
                            <span className="text-gray-500 w-14 shrink-0">Manager</span>
                            <span className="font-semibold text-gray-700">{memberOptions.projectManagers.find(m => m.id === projectManagerId)?.name}</span>
                          </div>
                        )}
                        {teamLeaderId && (
                          <div className="flex items-center gap-2 text-xs">
                            <Crown size={11} className="text-sky-500 shrink-0" />
                            <span className="text-gray-500 w-14 shrink-0">Leader</span>
                            <span className="font-semibold text-gray-700">{memberOptions.teamLeaders.find(m => m.id === teamLeaderId)?.name}</span>
                          </div>
                        )}
                        {teamMembers.length > 0 && (
                          <div className="flex items-center gap-2 text-xs">
                            <Users size={11} className="text-orange-500 shrink-0" />
                            <span className="text-gray-500 w-14 shrink-0">Members</span>
                            <span className="font-semibold text-gray-700">{teamMembers.length} assigned</span>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-100 shrink-0 bg-gray-50/50">
            <button onClick={onClose} className="px-5 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition cursor-pointer">
              Cancel
            </button>
            <div className="flex items-center gap-2">
              {tab === "basic" && (
                <button onClick={() => setTab("members")}
                  className="flex items-center gap-1.5 px-5 py-2 ring-1 ring-orange-200 text-orange-600 rounded-xl text-sm font-semibold hover:bg-orange-50 transition cursor-pointer">
                  Members <ArrowRight size={13} />
                </button>
              )}
              <button onClick={handleSave} disabled={submitting || !isFormValid}
                className="flex items-center gap-2 px-5 py-2 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 disabled:opacity-50 transition cursor-pointer shadow-lg shadow-orange-200">
                {submitting ? <><Loader2 size={14} className="animate-spin" />Creating...</> : <><CircleCheck size={14} /> Create Project</>}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showClientModal && (
        <div className="fixed inset-0 z-[100]">
          <ClientModal
            onClose={() => setShowClientModal(false)}
            onSuccess={(data, msg) => {
              handleClientAdded();
              setShowClientModal(false);
            }}
          />
        </div>
      )}
    </>
  );
}

// ── ADD TASK MODAL (MULTI) ───────────────────────────────────────────
function AddTaskModal({ onClose, onSuccess }) {
  const [tasks, setTasks] = useState([
    { title: "", dueDate: "", startDate: "", priority: "", description: "", assignees: [] }
  ]);
  const [projectId, setProjectId] = useState("");
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [apiErrors, setApiErrors] = useState({});
  const [inlineError, setInlineError] = useState(null);
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [projectSuccessMsg, setProjectSuccessMsg] = useState(null);
  const [expandedIndex, setExpandedIndex] = useState(0); // which task is expanded

  useEffect(() => { fetchProjects(); }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch(`${BASE}/api/admin/projects`, { headers: authHeaders() });
      const data = await res.json();
      const d = data.data || data;
      setProjects(Array.isArray(d) ? d : []);
    } catch (e) { console.error(e); } finally { setLoadingProjects(false); }
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${BASE}/api/admin/employees`, { headers: authHeaders() });
        const data = await res.json();
        const d = data.data || data;
        setEmployees((Array.isArray(d) ? d : []).map(emp => ({
          id: emp.id,
          name: emp.firstname ? `${emp.firstname} ${emp.lastname || ""}`.trim() : (emp.name || emp.username || emp.email),
        })));
      } catch (e) { console.error(e); } finally { setLoadingEmployees(false); }
    })();
  }, []);

  const updateTask = (idx, key, value) => {
    setTasks(prev => prev.map((t, i) => i === idx ? { ...t, [key]: value } : t));
  };

  const addTaskRow = () => {
    setTasks(prev => [
      ...prev,
      { title: "", dueDate: "", startDate: "", priority: "", description: "", assignees: [] }
    ]);
    setExpandedIndex(tasks.length);
  };

  const removeTaskRow = (idx) => {
    if (tasks.length === 1) return; // keep at least one
    setTasks(prev => prev.filter((_, i) => i !== idx));
    if (expandedIndex >= idx && expandedIndex > 0) setExpandedIndex(expandedIndex - 1);
  };

  const duplicateTaskRow = (idx) => {
    const original = tasks[idx];
    setTasks(prev => [
      ...prev.slice(0, idx + 1),
      { ...original, title: original.title + " (copy)" },
      ...prev.slice(idx + 1)
    ]);
    setExpandedIndex(idx + 1);
  };

  const handleProjectAdded = () => {
    fetchProjects();
    setProjectSuccessMsg("Project created successfully!");
    setTimeout(() => setProjectSuccessMsg(null), 2500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiErrors({}); setInlineError(null);

    if (!projectId) { setInlineError("Please select a project."); return; }

    // Validate all rows
    for (let i = 0; i < tasks.length; i++) {
      const t = tasks[i];
      if (!t.title.trim()) { setInlineError(`Task #${i + 1}: Title is required.`); setExpandedIndex(i); return; }
      if (!t.dueDate)      { setInlineError(`Task #${i + 1}: Due date is required.`); setExpandedIndex(i); return; }
      if (!t.priority)     { setInlineError(`Task #${i + 1}: Priority is required.`); setExpandedIndex(i); return; }
      if (!t.assignees.length) { setInlineError(`Task #${i + 1}: Select at least one assignee.`); setExpandedIndex(i); return; }
    }

    setSubmitting(true);
    try {
      const payload = {
        project_id: parseInt(projectId),
        tasks: tasks.map(t => ({
          title:       t.title.trim(),
          description: t.description.trim() || null,
          start_date:  t.startDate || null,
          due_date:    t.dueDate,
          priority:    t.priority.toLowerCase(),
          assignees:   t.assignees.map(Number),
        })),
      };

      // Use bulk endpoint if multiple, else single
      const endpoint = tasks.length > 1 ? "/api/admin/tasks/bulk" : "/api/admin/tasks";

      let body;
      if (tasks.length > 1) {
        body = payload;
      } else {
        const t = payload.tasks[0];
        body = {
          project_id: payload.project_id,
          title: t.title,
          description: t.description,
          start_date: t.start_date,
          due_date: t.due_date,
          priority: t.priority,
          assignees: t.assignees,
        };
      }

      const res = await fetch(`${BASE}${endpoint}`, {
        method: "POST",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 422 && data.errors) {
          setApiErrors(data.errors);
          setInlineError(Object.values(data.errors).flat().join(" • "));
        } else throw new Error(data.message || "Failed to create task");
        return;
      }
      onSuccess?.();
      onClose();
    } catch (err) { setInlineError(err.message); }
    finally { setSubmitting(false); }
  };

  const inputCls = "w-full px-3.5 py-2.5 border border-gray-200 rounded-2xl text-sm text-gray-800 outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50 transition-all bg-white placeholder:text-gray-400";
  const labelCls = "block text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1.5";
  const validCount = tasks.filter(t =>
    t.title.trim() && t.dueDate && t.priority && t.assignees.length > 0
  ).length;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/45 backdrop-blur-sm p-4">
        <div className="bg-white rounded-3xl shadow-2xl shadow-gray-300/50 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">

          {/* Header */}
          <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100 bg-gradient-to-br from-orange-50/60 to-transparent shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-200 shrink-0">
                <Plus size={18} className="text-white" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900">Add Task{tasks.length > 1 ? "s" : ""}</h2>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {tasks.length > 1 ? `${tasks.length} tasks in this batch` : "Fill in the details below"}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-white hover:bg-gray-100 text-gray-500 transition ring-1 ring-gray-100 cursor-pointer shrink-0">
              <X size={15} />
            </button>
          </div>

          {inlineError && (
            <div className="mx-6 mt-4 flex items-start gap-2 p-3 bg-rose-50 border border-rose-100 rounded-2xl text-xs text-rose-600 shrink-0">
              <TriangleAlert size={13} className="shrink-0 mt-0.5" /><span>{inlineError}</span>
            </div>
          )}

          {projectSuccessMsg && (
            <div className="mx-6 mt-2 flex items-start gap-2 p-3 bg-emerald-50 border border-emerald-100 rounded-2xl text-xs text-emerald-600 shrink-0">
              <CircleCheck size={13} className="shrink-0 mt-0.5" /><span>{projectSuccessMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-6 py-5 space-y-4">

            {/* Project selector (shared across all tasks) */}
            <div>
              <label className={labelCls}><Briefcase size={11} className="text-gray-400" /> Project <span className="text-red-500">*</span></label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <select
                    value={projectId}
                    onChange={e => setProjectId(e.target.value)}
                    disabled={loadingProjects}
                    className={`${inputCls} bg-white cursor-pointer`}
                  >
                    <option value="">{loadingProjects ? "Loading..." : "Select a project"}</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.project_name} ({p.project_code})</option>)}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddProjectModal(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 bg-orange-500 text-white rounded-2xl text-sm font-semibold hover:bg-orange-600 transition-colors whitespace-nowrap cursor-pointer shadow-lg shadow-orange-200"
                >
                  <Plus size={14} /> Add Project
                </button>
              </div>
              {apiErrors.project_id && <p className="text-red-500 text-xs mt-1">{apiErrors.project_id[0]}</p>}
            </div>

            {/* Tasks list */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className={labelCls}>
                  <ListChecks size={11} className="text-gray-400" />
                  Tasks ({tasks.length})
                </label>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full ring-1 ring-emerald-100">
                  {validCount} / {tasks.length} ready
                </span>
              </div>

              {tasks.map((task, idx) => {
                const isExpanded = expandedIndex === idx;
                const taskIsValid = task.title.trim() && task.dueDate && task.priority && task.assignees.length > 0;

                return (
                  <div key={idx}
                    className={`rounded-2xl border-2 transition-all ${
                      isExpanded
                        ? "border-orange-200 ring-4 ring-orange-50"
                        : taskIsValid
                        ? "border-emerald-200 bg-emerald-50/30"
                        : "border-gray-100"
                    }`}>

                    {/* Collapsed header */}
                    <div
                      className="flex items-center gap-3 px-4 py-3 cursor-pointer"
                      onClick={() => setExpandedIndex(isExpanded ? -1 : idx)}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                        taskIsValid ? "bg-emerald-500 text-white" : "bg-orange-100 text-orange-600"
                      }`}>
                        {taskIsValid ? <CheckCheck size={14} /> : idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-bold truncate ${task.title ? "text-gray-800" : "text-gray-400"}`}>
                          {task.title || `Task #${idx + 1}`}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-0.5">
                          {task.dueDate && <span>Due {task.dueDate}</span>}
                          {task.priority && (
                            <span className="capitalize font-semibold" style={{ color: priorityDot[task.priority] ? undefined : "#6b7280" }}>
                              {task.priority}
                            </span>
                          )}
                          {task.assignees.length > 0 && (
                            <span className="flex items-center gap-0.5">
                              <Users size={9} /> {task.assignees.length}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); duplicateTaskRow(idx); }}
                          title="Duplicate"
                          className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition cursor-pointer"
                        >
                          <RotateCw size={12} />
                        </button>
                        {tasks.length > 1 && (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); removeTaskRow(idx); }}
                            title="Remove"
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition cursor-pointer"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                        {isExpanded ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
                      </div>
                    </div>

                    {/* Expanded fields */}
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-1 space-y-3 border-t border-gray-100">
                        <div>
                          <label className={labelCls}><FileText size={11} className="text-gray-400" /> Title <span className="text-red-500">*</span></label>
                          <input
                            type="text"
                            value={task.title}
                            onChange={e => updateTask(idx, "title", e.target.value)}
                            className={inputCls}
                            placeholder={`Task #${idx + 1} title`}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className={labelCls}><CalendarDays size={11} className="text-gray-400" /> Start Date</label>
                            <input
                              type="date"
                              value={task.startDate}
                              onChange={e => updateTask(idx, "startDate", e.target.value)}
                              className={`${inputCls} cursor-pointer`}
                            />
                          </div>
                          <div>
                            <label className={labelCls}><CalendarClock size={11} className="text-gray-400" /> Due Date <span className="text-red-500">*</span></label>
                            <input
                              type="date"
                              value={task.dueDate}
                              onChange={e => updateTask(idx, "dueDate", e.target.value)}
                              className={`${inputCls} cursor-pointer`}
                            />
                          </div>
                        </div>

                        <div>
                          <label className={labelCls}><Users size={11} className="text-gray-400" /> Assignees <span className="text-red-500">*</span></label>
                          <UserMultiSelect
                            options={employees}
                            selected={task.assignees}
                            onChange={(v) => updateTask(idx, "assignees", v)}
                            placeholder="Select assignees"
                            isLoading={loadingEmployees}
                          />
                        </div>

                        <div>
                          <label className={labelCls}><TagIcon size={11} className="text-gray-400" /> Priority <span className="text-red-500">*</span></label>
                          <div className="grid grid-cols-4 gap-2">
                            {["low","medium","high","urgent"].map(p => (
                              <button
                                key={p}
                                type="button"
                                onClick={() => updateTask(idx, "priority", p)}
                                className={`flex items-center justify-center gap-1.5 px-2 py-2 rounded-xl text-xs font-semibold capitalize border transition-all cursor-pointer ${
                                  task.priority === p ? "border-transparent text-white shadow-md" : "border-gray-200 text-gray-500 hover:bg-gray-50"
                                }`}
                                style={task.priority === p ? { backgroundColor: { low:"#10b981", medium:"#f59e0b", high:"#f43f5e", urgent:"#8b5cf6" }[p] } : {}}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${task.priority === p ? "bg-white" : priorityDot[p]}`} />
                                {p}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className={labelCls}><MessageSquare size={11} className="text-gray-400" /> Description</label>
                          <textarea
                            value={task.description}
                            onChange={e => updateTask(idx, "description", e.target.value)}
                            rows={2}
                            className={`${inputCls} resize-none`}
                            placeholder="Task description..."
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              <button
                type="button"
                onClick={addTaskRow}
                className="w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold text-orange-500 border-2 border-dashed border-orange-200 rounded-2xl hover:bg-orange-50 transition cursor-pointer"
              >
                <Plus size={15} /> Add Another Task
              </button>
            </div>

            {/* Footer buttons */}
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !projectId || validCount === 0}
                className="px-5 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 disabled:opacity-50 transition cursor-pointer shadow-lg shadow-orange-200 flex items-center gap-2"
              >
                {submitting
                  ? <><Loader2 size={14} className="animate-spin" />Creating…</>
                  : <><Plus size={14} />Create {tasks.length > 1 ? `${tasks.length} Tasks` : "Task"}</>
                }
              </button>
            </div>
          </form>
        </div>
      </div>

      {showAddProjectModal && (
        <div className="fixed inset-0 z-[100]">
          <AddProjectModal
            onClose={() => setShowAddProjectModal(false)}
            onSuccess={() => {
              handleProjectAdded();
              setShowAddProjectModal(false);
            }}
          />
        </div>
      )}
    </>
  );
}

// ── Completion Modal ─────────────────────────────────────────────────
function CompletionModal({ taskTitle, onClose }) {
  useEffect(() => {
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    setTimeout(() => {
      confetti({ particleCount: 100, spread: 100, origin: { y: 0.6, x: 0.2 }, startVelocity: 15 });
      confetti({ particleCount: 100, spread: 100, origin: { y: 0.6, x: 0.8 }, startVelocity: 15 });
    }, 150);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 p-7 text-center animate-in zoom-in-95 duration-200">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center ring-8 ring-emerald-50/60">
          <CheckSquare size={30} className="text-emerald-500" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Task Completed! 🎉</h3>
        <p className="text-sm text-gray-500 mb-6">
          Great work! You've completed <span className="font-semibold text-orange-500">"{taskTitle}"</span>.
        </p>
        <button
          onClick={onClose}
          className="px-6 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 transition shadow-lg shadow-orange-200 cursor-pointer"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

// ── DELETION TOAST ───────────────────────────────────────────────────
function DeletedToast({ taskTitle, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className="fixed bottom-6 right-6 z-[90] flex items-center gap-3 bg-gray-900 text-white px-4 py-3 rounded-2xl shadow-2xl shadow-gray-400/30 animate-in slide-in-from-bottom-4 duration-300">
      <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center shrink-0">
        <Trash2 size={14} className="text-rose-400" />
      </div>
      <div className="text-sm">
        <span className="font-semibold">"{taskTitle}"</span> was deleted
      </div>
      <button onClick={onClose} className="ml-2 text-gray-400 hover:text-white cursor-pointer"><X size={14} /></button>
    </div>
  );
}

// ── Normalize task ───────────────────────────────────────────────────
function normalizeTask(t) {
  const assignees = t.assignees || [];
  const totalAssignees = assignees.length;
  const completedAssignees = assignees.filter(
    (a) => a.pivot?.status === "completed"
  ).length;

  return {
    id: t.id,
    title: t.title || t.name || "Untitled",
    date: t.due_date
      ? new Date(t.due_date).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" })
      : (t.created_at ? new Date(t.created_at).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" }) : "—"),
    tag: t.priority ? t.priority.charAt(0).toUpperCase() + t.priority.slice(1) : "General",
    tagClass: priorityColors[t.priority?.toLowerCase()] || "bg-sky-50 text-sky-600 ring-1 ring-sky-100",
    status: t.status || "Pending",
    done: ["completed","done"].includes((t.status || "").toLowerCase()),

    assignees: assignees,
    assigneeCount: totalAssignees,
    completedCount: completedAssignees,
    progress: totalAssignees > 0 ? Math.round((completedAssignees / totalAssignees) * 100) : 0,

    isOverdue: t.is_overdue || false,
    currentlyOverdue: t.currently_overdue || false,

    raw: t,
  };
}

// ── Normalize project (with counts for badges) ───────────────────────
function normalizeProject(p, index, taskArray) {
  const allTasks  = taskArray || p.tasks || [];
  const completed = allTasks.filter(t => ["completed","done"].includes((t.status || "").toLowerCase())).length;
  const pending    = allTasks.filter(t => (t.status || "").toLowerCase() === "pending").length;
  const inProgress = allTasks.filter(t => (t.status || "").toLowerCase() === "in_progress").length;
  const overdue    = allTasks.filter(t => isTaskOverdue(t)).length;
  const total     = allTasks.length;
  const pct       = total > 0 ? Math.round((completed / total) * 100) : 0;
  const color     = PROJECT_COLORS[index % PROJECT_COLORS.length];
  const deadlineRaw = p.end_date || p.deadline || p.due_date || null;
  const deadline = deadlineRaw
    ? new Date(deadlineRaw).toLocaleDateString("en-GB", { day:"numeric", month:"short", year:"numeric" })
    : "—";
  let value = "—";
  if (p.value != null && p.value !== "" && p.value !== 0) {
    value = `$${Number(p.value).toLocaleString()}`;
  } else if (p.budget != null && p.budget !== "" && p.budget !== 0) {
    value = `$${Number(p.budget).toLocaleString()}`;
  } else if (p.contract_value != null && p.contract_value !== "") {
    value = `$${Number(p.contract_value).toLocaleString()}`;
  }
  let lead = "—";
  if (p.project_manager) {
    if (typeof p.project_manager === "string") lead = p.project_manager;
    else {
      lead = p.project_manager.firstname
        ? `${p.project_manager.firstname} ${p.project_manager.lastname || ""}`.trim()
        : (p.project_manager.name || p.project_manager.username || p.project_manager.email || "—");
    }
  } else if (p.team_leader) {
    if (typeof p.team_leader === "string") lead = p.team_leader;
    else {
      lead = p.team_leader.firstname
        ? `${p.team_leader.firstname} ${p.team_leader.lastname || ""}`.trim()
        : (p.team_leader.name || p.team_leader.username || p.team_leader.email || "—");
    }
  } else if (p.manager) {
    if (typeof p.manager === "string") lead = p.manager;
    else {
      lead = p.manager.firstname
        ? `${p.manager.firstname} ${p.manager.lastname || ""}`.trim()
        : (p.manager.name || p.manager.username || p.manager.email || "—");
    }
  } else if (p.lead) {
    lead = typeof p.lead === "string" ? p.lead : (p.lead.name || "—");
  } else if (p.creator) {
    if (typeof p.creator === "string") lead = p.creator;
    else {
      lead = p.creator.firstname
        ? `${p.creator.firstname} ${p.creator.lastname || ""}`.trim()
        : (p.creator.name || p.creator.username || p.creator.email || "—");
    }
  }

  // ⭐ NEW: extract project manager & team lead names
  const getPersonName = (person) => {
    if (!person) return null;
    if (typeof person === "string") return person;
    return person.firstname
      ? `${person.firstname} ${person.lastname || ""}`.trim()
      : (person.name || person.username || person.email || null);
  };

  const projectManagerName = getPersonName(p.project_manager) || null;
  const teamLeaderName = getPersonName(p.team_leader) || null;

  return {
    id:        p.id,
    name:      p.project_name || p.name || "Untitled Project",
    code:      p.project_code || p.code || "—",
    tasks:     total - completed,
    completed,
    pending,
    inProgress,
    overdue,
    total,
    deadline,
    value,
    lead,
    // ⭐ NEW: show on card
    projectManagerName,
    teamLeaderName,
    pct,
    color,
    items:     allTasks.map(normalizeTask),
  };
}

// ── Main TasksPage ───────────────────────────────────────────────────
export default function TasksPage() {
  const [projects, setProjects]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [selected, setSelected]         = useState(null);
  const [priority, setPriority]         = useState("High");

  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery]   = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completingTaskTitle, setCompletingTaskTitle] = useState("");
  const [updatingTask, setUpdatingTask] = useState(false);
  const [deletedToast, setDeletedToast] = useState(null);

  const [detailTaskId, setDetailTaskId] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [rowDeleting, setRowDeleting] = useState(false);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [tasksRes, projectsRes] = await Promise.all([
        fetch(`${BASE}/api/admin/tasks`,    { headers: authHeaders() }),
        fetch(`${BASE}/api/admin/projects`, { headers: authHeaders() }),
      ]);
      if (!tasksRes.ok)    throw new Error(`Tasks API error ${tasksRes.status}`);
      if (!projectsRes.ok) throw new Error(`Projects API error ${projectsRes.status}`);
      const tasksData    = await tasksRes.json();
      const projectsData = await projectsRes.json();
      const taskArray    = Array.isArray(tasksData.data || tasksData)    ? (tasksData.data || tasksData)    : [];
      const projectArray = Array.isArray(projectsData.data || projectsData) ? (projectsData.data || projectsData) : [];
      const projectDetailMap = {};
      projectArray.forEach(p => { projectDetailMap[p.id] = p; });
      const projectTaskMap = {};
      taskArray.forEach(task => {
        const pid = task.project_id || task.project?.id || 0;
        if (!projectTaskMap[pid]) projectTaskMap[pid] = [];
        projectTaskMap[pid].push(task);
      });
      const normalized = projectArray.map((p, i) =>
        normalizeProject(p, i, projectTaskMap[p.id] || [])
      );
      Object.keys(projectTaskMap).forEach(pid => {
        const numPid = Number(pid);
        if (!projectDetailMap[numPid] && numPid !== 0) {
          const firstTask = projectTaskMap[numPid][0];
          const fallback  = firstTask.project || { id: numPid, project_name: `Project ${numPid}` };
          normalized.push(normalizeProject(fallback, normalized.length, projectTaskMap[numPid]));
        }
      });
      setProjects(normalized);
      setSelected(prev => {
        if (!prev) return normalized[0] || null;
        const refreshed = normalized.find(p => p.id === prev.id);
        return refreshed || normalized[0] || null;
      });
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const updateTaskStatus = async (taskId, currentStatus, taskTitle) => {
    const newStatus = currentStatus === "completed" ? "pending" : "completed";
    setUpdatingTask(true);
    try {
      const res = await fetch(`${BASE}/api/admin/tasks/${taskId}`, {
        method: "PUT",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update task status");
      await fetchTasks();
      if (newStatus === "completed") {
        setCompletingTaskTitle(taskTitle);
        setShowCompletionModal(true);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdatingTask(false);
    }
  };

  const handleRowDelete = async () => {
    if (!deleteTarget) return;
    setRowDeleting(true);
    try {
      const res = await fetch(`${BASE}/api/admin/tasks/${deleteTarget.id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to delete task");
      setDeletedToast(deleteTarget.title);
      setDeleteTarget(null);
      await fetchTasks();
    } catch (err) {
      alert(err.message);
    } finally {
      setRowDeleting(false);
    }
  };

  // ⭐ FIX: prioritize filter first, then compute status counts from priority-filtered items
  const priorityFilteredItems = (selected?.items || [])
    .filter(t => t.tag.toLowerCase() === priority.toLowerCase());

  const filteredItems = priorityFilteredItems
    .filter(t => matchStatus(t.raw, statusFilter))
    .filter(t => !searchQuery || t.title.toLowerCase().includes(searchQuery.toLowerCase()));

  const displayItems = filteredItems;

  // ⭐ FIX: status counts now respect priority filter
  const statusCounts = priorityFilteredItems.reduce((acc, t) => {
    const st = (t.status || "").toLowerCase();
    if (isTaskOverdue(t.raw)) acc.overdue = (acc.overdue || 0) + 1;
    acc[st] = (acc[st] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="relative bg-gray-50/40 -m-1 p-1 rounded-3xl">
      <style>{`
        @keyframes pulseGlow { 0%,100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.4); } 50% { box-shadow: 0 0 0 6px rgba(239,68,68,0); } }
        .overdue-pulse { animation: pulseGlow 2s infinite; }
      `}</style>

      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-200">
            <LayoutGrid size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 leading-tight">Tasks</h1>
            <p className="text-[11px] text-gray-400">Manage projects and track task progress</p>
          </div>
        </div>
        <button onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 text-white rounded-2xl text-sm font-semibold hover:bg-orange-600 shadow-lg shadow-orange-200 transition-all hover:-translate-y-0.5 cursor-pointer">
          <Plus size={16} /> Add Task
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center h-64 gap-3 text-gray-400">
          <Loader2 size={20} className="animate-spin" />
          <span className="text-sm">Loading tasks…</span>
        </div>
      )}

      {!loading && error && (
        <div className="flex flex-col items-center justify-center h-64 gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center">
            <AlertTriangle size={20} className="text-rose-500" />
          </div>
          <p className="text-sm text-rose-500">Failed to load tasks: {error}</p>
          <button onClick={fetchTasks} className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 text-white rounded-2xl text-sm font-semibold hover:bg-orange-600 shadow-lg shadow-orange-200 cursor-pointer">
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="flex gap-5 h-[calc(100vh-220px)] overflow-hidden">
          <div className="w-80 shrink-0 overflow-y-auto space-y-3 pr-1">
            {projects.length === 0 && (
              <p className="text-sm text-gray-400 text-center mt-10">No projects found.</p>
            )}
            {projects.map(p => (
              <div key={p.id} onClick={() => setSelected(p)}
                className={`bg-white rounded-3xl border-2 p-4 cursor-pointer transition-all shadow-sm hover:shadow-lg hover:shadow-gray-200/60 hover:-translate-y-0.5 relative overflow-hidden
                  ${selected?.id === p.id ? "border-orange-300 ring-4 ring-orange-50" : "border-gray-100"}`}>
                {p.overdue > 0 && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-rose-300" />
                )}

                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm"
                    style={{ backgroundColor: p.color }}>
                    {p.name[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-gray-800 truncate">{p.name}</p>
                    <p className="text-[10px] text-gray-400">{p.tasks} pending • {p.completed} done</p>
                  </div>
                  {p.overdue > 0 && (
                    <span className="text-[9px] font-bold text-white bg-rose-500 px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1 overdue-pulse">
                      <AlertOctagon size={9} />
                      {p.overdue}
                    </span>
                  )}
                </div>

                {/* ⭐ NEW: Project Manager & Team Lead */}
                <div className="space-y-1.5 mb-3">
                  {p.projectManagerName && (
                    <div className="flex items-center gap-1.5 text-[10px]">
                      <UserRoundCog size={10} className="text-emerald-500 shrink-0" />
                      <span className="text-gray-400 shrink-0">Manager:</span>
                      <span className="font-semibold text-gray-700 truncate" title={p.projectManagerName}>
                        {p.projectManagerName}
                      </span>
                    </div>
                  )}
                  {p.teamLeaderName && (
                    <div className="flex items-center gap-1.5 text-[10px]">
                      <Crown size={10} className="text-sky-500 shrink-0" />
                      <span className="text-gray-400 shrink-0">Lead:</span>
                      <span className="font-semibold text-gray-700 truncate" title={p.teamLeaderName}>
                        {p.teamLeaderName}
                      </span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-1.5 mb-3">
                  <div className="bg-orange-50 rounded-lg p-1.5 text-center">
                    <p className="text-[13px] font-extrabold text-orange-600 leading-none">{p.pending}</p>
                    <p className="text-[8px] text-orange-500 font-semibold uppercase tracking-wider mt-0.5">Pending</p>
                  </div>
                  <div className="bg-sky-50 rounded-lg p-1.5 text-center">
                    <p className="text-[13px] font-extrabold text-sky-600 leading-none">{p.inProgress}</p>
                    <p className="text-[8px] text-sky-500 font-semibold uppercase tracking-wider mt-0.5">Active</p>
                  </div>
                  <div className="bg-emerald-50 rounded-lg p-1.5 text-center">
                    <p className="text-[13px] font-extrabold text-emerald-600 leading-none">{p.completed}</p>
                    <p className="text-[8px] text-emerald-500 font-semibold uppercase tracking-wider mt-0.5">Done</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-[10px] text-gray-500 mb-3">
                  <div>
                    <p className="text-gray-400">Deadline</p>
                    <p className="font-semibold text-gray-700">{p.deadline}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Value</p>
                    <p className="font-semibold text-gray-700">{p.value}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Lead</p>
                    <p className="font-semibold text-gray-700 truncate" title={p.lead}>{p.lead}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${p.pct}%`, backgroundColor: p.color }} />
                  </div>
                  <span className="text-[10px] font-semibold text-gray-500">{p.pct}%</span>
                </div>

                <div className="mt-2 flex items-center gap-1 text-[10px] text-gray-400">
                  <ListChecks size={10} />
                  <span>{p.total} task{p.total !== 1 ? "s" : ""} total</span>
                </div>
              </div>
            ))}
          </div>

          {selected && (
            <div className="flex-1 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-100 z-10 px-5 py-3">
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
                    {["High","Medium","Low"].map(tab => (
                      <button key={tab} onClick={() => setPriority(tab)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer
                          ${priority === tab ? "bg-white shadow-sm text-gray-800" : "text-gray-500 hover:text-gray-700"}`}>
                        {tab}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
                    {STATUS_FILTERS.map(({ key, label, color, icon: Icon }) => {
                      const active = statusFilter === key;
                      const count = key === "all" ? priorityFilteredItems.length : (statusCounts[key] || 0);
                      return (
                        <button key={key} onClick={() => setStatusFilter(key)}
                          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer
                            ${active ? "bg-white shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                          style={active ? { color } : {}}>
                          <Icon size={11} style={{ color: active ? color : undefined }} />
                          {label}
                          {count > 0 && (
                            <span className="text-[9px] font-bold px-1.5 py-px rounded-full"
                              style={{ background: active ? `${color}20` : "#e5e7eb", color: active ? color : "#6b7280" }}>
                              {count}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-1.5 ml-auto">
                    <Search size={12} className="text-gray-400" />
                    <input
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Search tasks…"
                      className="bg-transparent border-none outline-none text-xs text-gray-700 w-32"
                    />
                    {searchQuery && (
                      <button onClick={() => setSearchQuery("")} className="cursor-pointer">
                        <X size={12} className="text-gray-400 hover:text-gray-600" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-gray-50 to-orange-50/30 rounded-2xl p-4 ring-1 ring-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-gray-800">{selected.name}</h3>
                    <span className="text-xs text-gray-400">{selected.code}</span>
                  </div>

                  {/* ⭐ NEW: Manager & Lead in summary panel */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {selected.projectManagerName && (
                      <div className="flex items-center gap-1.5 bg-white rounded-xl px-2.5 py-1.5 ring-1 ring-gray-100">
                        <UserRoundCog size={12} className="text-emerald-500 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[9px] text-gray-400 uppercase tracking-wider font-semibold">Manager</p>
                          <p className="text-[11px] font-semibold text-gray-700 truncate">{selected.projectManagerName}</p>
                        </div>
                      </div>
                    )}
                    {selected.teamLeaderName && (
                      <div className="flex items-center gap-1.5 bg-white rounded-xl px-2.5 py-1.5 ring-1 ring-gray-100">
                        <Crown size={12} className="text-sky-500 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[9px] text-gray-400 uppercase tracking-wider font-semibold">Team Lead</p>
                          <p className="text-[11px] font-semibold text-gray-700 truncate">{selected.teamLeaderName}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-500">Tasks Done</span>
                    <span className="text-xs font-bold text-gray-800">
                      {selected.completed} / {selected.total}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-200 overflow-hidden mb-1">
                    <div className="h-full rounded-full bg-orange-500 transition-all" style={{ width: `${selected.pct}%` }} />
                  </div>
                  <p className="text-[11px] text-gray-400">{selected.pct}% Completed</p>
                </div>
              </div>

              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-gray-400">
                    {displayItems.length} task{displayItems.length !== 1 ? "s" : ""} found
                    {statusFilter !== "all" && ` · filtered by ${STATUS_FILTERS.find(f => f.key === statusFilter)?.label}`}
                  </span>
                  <button className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 border border-gray-200 rounded-xl px-3 py-1.5 hover:bg-gray-50 transition cursor-pointer">
                    Mark All as Completed <ChevronDown size={11} />
                  </button>
                </div>

                <div className="space-y-2">
                  {displayItems.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-3">
                        <Search size={18} className="text-gray-300" />
                      </div>
                      <p className="text-sm text-gray-400">No tasks match your filters</p>
                    </div>
                  ) : (
                    displayItems.map(task => {
                      const isDone = task.done;
                      const isOverdue = task.currentlyOverdue;

                      return (
                        <div
                          key={task.id}
                          onClick={() => setDetailTaskId(task.id)}
                          className={`flex flex-col gap-2 p-3.5 rounded-2xl border transition-all cursor-pointer group
                            ${isOverdue
                              ? "bg-gradient-to-r from-rose-50/50 to-white border-rose-100 hover:border-rose-200"
                              : isDone
                              ? "bg-gradient-to-r from-emerald-50/40 to-white border-emerald-100 hover:border-emerald-200"
                              : "hover:bg-gray-50 border-transparent hover:border-gray-100"}`}
                        >
                          <div className="flex items-center gap-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                updateTaskStatus(task.id, isDone ? "completed" : "pending", task.title);
                              }}
                              disabled={updatingTask}
                              className="cursor-pointer shrink-0"
                            >
                              {isDone ? <CheckSquare size={17} className="text-emerald-500" /> : <Square size={17} className="text-gray-400" />}
                            </button>
                            <p className={`flex-1 text-sm font-semibold truncate ${isDone ? "line-through text-gray-400" : "text-gray-800"}`}>
                              {task.title}
                            </p>

                            <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-gray-400 shrink-0">
                              <Calendar size={11} />
                              <span className={isOverdue ? "text-rose-600 font-bold" : ""}>{task.date}</span>
                            </div>

                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md capitalize shrink-0 ${task.tagClass}`}>
                              {task.tag}
                            </span>

                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${statusColors[task.status] || "bg-gray-100 text-gray-500"}`}>
                              • {task.status}
                            </span>

                            {isOverdue && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500 text-white shrink-0 flex items-center gap-1">
                                <AlertOctagon size={9} /> Overdue
                              </span>
                            )}

                            <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => { e.stopPropagation(); setDetailTaskId(task.id); }}
                                title="View / Edit"
                                className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-orange-500 hover:bg-orange-50 transition cursor-pointer">
                                <Eye size={13} />
                              </button>
                              {!isDone && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); setDeleteTarget({ id: task.id, title: task.title }); }}
                                  title="Delete"
                                  className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition cursor-pointer">
                                  <Trash2 size={13} />
                                </button>
                              )}
                            </div>
                          </div>

                          {task.assigneeCount > 0 && (
                            <div className="flex items-center gap-3 pl-8">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {task.assignees.slice(0, 3).map((a, i) => {
                                  const initials = `${a.firstname?.[0] || ""}${a.lastname?.[0] || ""}`.toUpperCase() || "?";
                                  const fullName = `${a.firstname || ""} ${a.lastname || ""}`.trim() || a.email || `Employee ${a.id}`;
                                  const isA = a.pivot?.status === "completed";
                                  const isIp = a.pivot?.status === "in_progress";

                                  return (
                                    <div
                                      key={a.id}
                                      title={`${fullName}${a.employee_id ? ` · ${a.employee_id}` : ""} · ${a.pivot?.status || "pending"}`}
                                      className="flex items-center gap-1.5 bg-white ring-1 ring-gray-100 rounded-full pl-0.5 pr-2.5 py-0.5 shadow-sm hover:ring-gray-200 transition-all"
                                    >
                                      <div className={`relative w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold ring-2 ${isA ? "ring-emerald-300" : isIp ? "ring-sky-300" : "ring-white"}`}
                                        style={{ backgroundColor: getColor(i) }}>
                                        {initials}
                                        {isA && (
                                          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-1 ring-white" />
                                        )}
                                        {isIp && !isA && (
                                          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-sky-500 rounded-full ring-1 ring-white" />
                                        )}
                                      </div>
                                      <span className="text-[10px] font-semibold text-gray-700 max-w-[100px] truncate">{fullName}</span>
                                    </div>
                                  );
                                })}
                                {task.assigneeCount > 3 && (
                                  <div className="flex items-center justify-center px-2 h-7 rounded-full bg-gray-100 text-[10px] font-bold text-gray-600">
                                    +{task.assigneeCount - 3}
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center gap-2 flex-1 max-w-[180px] ml-auto">
                                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all ${task.progress === 100 ? "bg-emerald-500" : "bg-orange-500"}`}
                                    style={{ width: `${task.progress}%` }}
                                  />
                                </div>
                                <span className={`text-[10px] font-bold tabular-nums ${task.progress === 100 ? "text-emerald-600" : "text-orange-600"}`}>
                                  {task.completedCount}/{task.assigneeCount}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="flex justify-center mt-5">
                  <button onClick={fetchTasks}
                    className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white text-sm font-semibold rounded-2xl hover:bg-orange-600 shadow-lg shadow-orange-200 transition-all hover:-translate-y-0.5 cursor-pointer">
                    <RefreshCw size={14} /> Refresh
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {showAddModal && (
        <AddTaskModal onClose={() => setShowAddModal(false)} onSuccess={fetchTasks} />
      )}

      {showCompletionModal && (
        <CompletionModal
          taskTitle={completingTaskTitle}
          onClose={() => setShowCompletionModal(false)}
        />
      )}

      {detailTaskId && (
        <TaskDetailModal
          taskId={detailTaskId}
          onClose={() => setDetailTaskId(null)}
          onStatusChange={fetchTasks}
          onDeleted={(title) => { setDetailTaskId(null); setDeletedToast(title); fetchTasks(); }}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete this task?"
          message={`"${deleteTarget.title}" will be permanently removed. This action cannot be undone.`}
          confirmLabel="Delete Task"
          loading={rowDeleting}
          onConfirm={handleRowDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {deletedToast && (
        <DeletedToast taskTitle={deletedToast} onClose={() => setDeletedToast(null)} />
      )}
    </div>
  );
}