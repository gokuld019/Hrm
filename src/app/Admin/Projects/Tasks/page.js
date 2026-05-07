"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { Plus, RefreshCw, Star, Calendar, ChevronDown, CheckSquare, Square, X, Search, Loader2 } from "lucide-react";
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
  high:   "bg-red-100 text-red-700",
  medium: "bg-yellow-100 text-yellow-700",
  low:    "bg-green-100 text-green-700",
  urgent: "bg-purple-100 text-purple-700",
};

const statusColors = {
  Onhold:       "bg-yellow-100 text-yellow-700",
  Inprogress:   "bg-blue-100 text-blue-700",
  in_progress:  "bg-blue-100 text-blue-700",
  Pending:      "bg-orange-100 text-orange-600",
  pending:      "bg-orange-100 text-orange-600",
  Completed:    "bg-green-100 text-green-700",
  completed:    "bg-green-100 text-green-700",
  onhold:       "bg-yellow-100 text-yellow-700",
};

const PROJECT_COLORS = ["#6366f1","#22c55e","#06b6d4","#f97316","#ec4899","#8b5cf6"];

// ─────────────────────────────────────────────────────────────────────────────
// Completion Modal Component
// ─────────────────────────────────────────────────────────────────────────────
function CompletionModal({ taskTitle, onClose }) {
  useEffect(() => {
    // Trigger confetti when modal opens
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    setTimeout(() => {
      confetti({ particleCount: 100, spread: 100, origin: { y: 0.6, x: 0.2 }, startVelocity: 15 });
      confetti({ particleCount: 100, spread: 100, origin: { y: 0.6, x: 0.8 }, startVelocity: 15 });
    }, 150);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 text-center animate-in zoom-in-95 duration-200">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
          <CheckSquare size={32} className="text-green-500" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Task Completed! 🎉</h3>
        <p className="text-sm text-gray-500 mb-6">
          Great work! You've completed <span className="font-semibold text-orange-500">"{taskTitle}"</span>.
        </p>
        <button
          onClick={onClose}
          className="px-6 py-2 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 transition shadow-md"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tag & UserMultiSelect (unchanged)
// ─────────────────────────────────────────────────────────────────────────────
const Tag = ({ label, onRemove }) => (
  <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 text-xs font-medium px-2.5 py-1 rounded-full">
    {label}
    <button onClick={onRemove} className="text-gray-400 hover:text-red-500 transition-colors"><X size={10} /></button>
  </span>
);

const UserMultiSelect = ({ options, selected, onChange, placeholder, isLoading = false }) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) { setOpen(false); setSearchQuery(""); }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => { if (open && searchInputRef.current) searchInputRef.current.focus(); }, [open]);

  const filtered = options.filter(o => o.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="relative" ref={containerRef}>
      <div
        className="flex flex-wrap gap-1.5 p-2.5 border border-gray-200 rounded-xl bg-white min-h-[42px] items-center cursor-pointer hover:border-gray-300 transition-colors"
        onClick={() => !isLoading && setOpen(!open)}
      >
        {selected.map(id => {
          const label = options.find(o => o.id === id)?.name || id;
          return <Tag key={id} label={label} onRemove={() => onChange(selected.filter(x => x !== id))} />;
        })}
        {selected.length === 0 && <span className="text-xs text-gray-400">{isLoading ? "Loading..." : placeholder}</span>}
      </div>
      {open && !isLoading && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-80 overflow-hidden flex flex-col">
          <div className="sticky top-0 bg-white border-b border-gray-100 p-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input ref={searchInputRef} type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search..." className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-orange-400 text-black" />
            </div>
          </div>
          {options.length > 0 && (
            <div className="sticky top-[57px] bg-white border-b border-gray-100 p-2 flex justify-between text-xs">
              <button onClick={() => onChange(filtered.map(o => o.id))} className="text-orange-500 hover:text-orange-600 font-medium">Select All</button>
              <button onClick={() => onChange([])} className="text-gray-400 hover:text-gray-600">Clear</button>
            </div>
          )}
          <div className="max-h-48 overflow-y-auto">
            {filtered.length === 0
              ? <div className="p-4 text-center text-gray-400 text-sm">No matching options</div>
              : filtered.map(opt => (
                <label key={opt.id} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm">
                  <input type="checkbox" checked={selected.includes(opt.id)}
                    onChange={() => onChange(selected.includes(opt.id) ? selected.filter(x => x !== opt.id) : [...selected, opt.id])}
                    className="rounded border-gray-300 text-orange-500 focus:ring-orange-400" />
                  <span className="text-black">{opt.name}</span>
                </label>
              ))
            }
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Add Task Modal (unchanged)
// ─────────────────────────────────────────────────────────────────────────────
function AddTaskModal({ onClose, onSuccess }) {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [projectId, setProjectId] = useState("");
  const [assignees, setAssignees] = useState([]);
  const [priority, setPriority] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [apiErrors, setApiErrors] = useState({});

  const isFormValid =
    title.trim() !== "" &&
    projectId !== "" &&
    dueDate !== "" &&
    priority !== "" &&
    assignees.length > 0;

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${BASE}/api/admin/projects`, { headers: authHeaders() });
        const data = await res.json();
        const d = data.data || data;
        setProjects(Array.isArray(d) ? d : []);
      } catch (e) { console.error(e); } finally { setLoadingProjects(false); }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${BASE}/api/admin/employees`, { headers: authHeaders() });
        const data = await res.json();
        const d = data.data || data;
        setEmployees(d.map(emp => ({
          id: emp.id,
          name: emp.firstname ? `${emp.firstname} ${emp.lastname || ""}`.trim() : (emp.name || emp.username || emp.email),
        })));
      } catch (e) { console.error(e); } finally { setLoadingEmployees(false); }
    })();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiErrors({});
    if (!title.trim()) { alert("Title is required"); return; }
    if (!projectId)    { alert("Please select a project"); return; }
    if (!dueDate)      { alert("Due date is required"); return; }
    if (!priority)     { alert("Priority is required"); return; }
    if (!assignees.length) { alert("Please select at least one assignee"); return; }
    setSubmitting(true);
    try {
      const res = await fetch(`${BASE}/api/admin/tasks`, {
        method: "POST",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: parseInt(projectId),
          title: title.trim(),
          description: description.trim() || null,
          start_date: startDate || null,
          due_date: dueDate,
          priority: priority.toLowerCase(),
          assignees: assignees.map(Number),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 422 && data.errors) {
          setApiErrors(data.errors);
          alert(`Validation failed:\n${Object.values(data.errors).flat().join("\n")}`);
        } else throw new Error(data.message || "Failed to create task");
        return;
      }
      alert("Task created successfully");
      onSuccess?.();
      onClose();
    } catch (err) { alert(err.message); } finally { setSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-bold text-black">Add New Task</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="overflow-y-auto p-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)}
              className="w-full p-2 border border-gray-200 rounded-lg text-sm text-black" placeholder="Enter task title" />
            {apiErrors.title && <p className="text-red-500 text-xs mt-1">{apiErrors.title[0]}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Start Date</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                className="w-full p-2 border border-gray-200 rounded-lg text-sm text-black" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Due Date <span className="text-red-500">*</span></label>
              <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
                className="w-full p-2 border border-gray-200 rounded-lg text-sm text-black" />
              {apiErrors.due_date && <p className="text-red-500 text-xs mt-1">{apiErrors.due_date[0]}</p>}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Project <span className="text-red-500">*</span></label>
            <select value={projectId} onChange={e => setProjectId(e.target.value)} disabled={loadingProjects}
              className="w-full p-2 border border-gray-200 rounded-lg text-sm text-black bg-white">
              <option value="">{loadingProjects ? "Loading..." : "Select a project"}</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.project_name}</option>)}
            </select>
            {apiErrors.project_id && <p className="text-red-500 text-xs mt-1">{apiErrors.project_id[0]}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Team Members <span className="text-red-500">*</span></label>
            <UserMultiSelect options={employees} selected={assignees} onChange={setAssignees}
              placeholder="Select team members" isLoading={loadingEmployees} />
            {apiErrors.assignees && <p className="text-red-500 text-xs mt-1">{apiErrors.assignees[0]}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Priority <span className="text-red-500">*</span></label>
            <select value={priority} onChange={e => setPriority(e.target.value)}
              className="w-full p-2 border border-gray-200 rounded-lg text-sm text-black bg-white">
              <option value="">Select priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
              <option value="urgent">Urgent</option>
            </select>
            {apiErrors.priority && <p className="text-red-500 text-xs mt-1">{apiErrors.priority[0]}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4}
              className="w-full p-2 border border-gray-200 rounded-lg text-sm text-black resize-none" placeholder="Task description..." />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-600">Cancel</button>
            <button type="submit" disabled={submitting || !isFormValid}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-semibold hover:bg-orange-600 disabled:opacity-50">
              {submitting ? "Creating..." : "Add New Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Normalize task
// ─────────────────────────────────────────────────────────────────────────────
function normalizeTask(t) {
  return {
    id: t.id,
    title: t.title || t.name || "Untitled",
    date: t.due_date
      ? new Date(t.due_date).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" })
      : (t.created_at ? new Date(t.created_at).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" }) : "—"),
    tag: t.priority ? t.priority.charAt(0).toUpperCase() + t.priority.slice(1) : "General",
    tagClass: priorityColors[t.priority?.toLowerCase()] || "bg-blue-50 text-blue-600",
    status: t.status || "Pending",
    done: ["completed","done"].includes((t.status || "").toLowerCase()),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Normalize project
// ─────────────────────────────────────────────────────────────────────────────
function normalizeProject(p, index, taskArray) {
  const allTasks  = taskArray || p.tasks || [];
  const completed = allTasks.filter(t => ["completed","done"].includes((t.status || "").toLowerCase())).length;
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
    if (typeof p.project_manager === "string") {
      lead = p.project_manager;
    } else {
      lead = p.project_manager.firstname
        ? `${p.project_manager.firstname} ${p.project_manager.lastname || ""}`.trim()
        : (p.project_manager.name || p.project_manager.username || p.project_manager.email || "—");
    }
  } else if (p.team_leader) {
    if (typeof p.team_leader === "string") {
      lead = p.team_leader;
    } else {
      lead = p.team_leader.firstname
        ? `${p.team_leader.firstname} ${p.team_leader.lastname || ""}`.trim()
        : (p.team_leader.name || p.team_leader.username || p.team_leader.email || "—");
    }
  } else if (p.manager) {
    if (typeof p.manager === "string") {
      lead = p.manager;
    } else {
      lead = p.manager.firstname
        ? `${p.manager.firstname} ${p.manager.lastname || ""}`.trim()
        : (p.manager.name || p.manager.username || p.manager.email || "—");
    }
  } else if (p.lead) {
    lead = typeof p.lead === "string" ? p.lead : (p.lead.name || "—");
  } else if (p.creator) {
    if (typeof p.creator === "string") {
      lead = p.creator;
    } else {
      lead = p.creator.firstname
        ? `${p.creator.firstname} ${p.creator.lastname || ""}`.trim()
        : (p.creator.name || p.creator.username || p.creator.email || "—");
    }
  }
  return {
    id:        p.id,
    name:      p.project_name || p.name || "Untitled Project",
    tasks:     total - completed,
    completed,
    deadline,
    value,
    lead,
    pct,
    color,
    items:     allTasks.map(normalizeTask),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Main TasksPage
// ─────────────────────────────────────────────────────────────────────────────
export default function TasksPage() {
  const [projects, setProjects]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [selected, setSelected]         = useState(null);
  const [priority, setPriority]         = useState("High");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completingTaskTitle, setCompletingTaskTitle] = useState("");
  const [updatingTask, setUpdatingTask] = useState(false);

  // Fetch tasks and projects
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

  // Update task status (complete/incomplete)
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
      // Refresh data after successful update
      await fetchTasks();
      // If marking as completed, show the modern modal
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

  const filteredItems = (selected?.items || []).filter(
    t => t.tag.toLowerCase() === priority.toLowerCase()
  );
  const displayItems = filteredItems.length > 0 ? filteredItems : (selected?.items || []);

  return (
    <div className="relative">
      <div className="flex justify-end mb-4">
        <button onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 shadow-sm">
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
          <p className="text-sm text-red-500">Failed to load tasks: {error}</p>
          <button onClick={fetchTasks} className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600">
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="flex gap-5 h-[calc(100vh-220px)] overflow-hidden">
          {/* Left — project list */}
          <div className="w-72 shrink-0 overflow-y-auto space-y-3">
            {projects.length === 0 && (
              <p className="text-sm text-gray-400 text-center mt-10">No projects found.</p>
            )}
            {projects.map(p => (
              <div key={p.id} onClick={() => setSelected(p)}
                className={`bg-white rounded-2xl border p-4 cursor-pointer transition-all shadow-sm hover:shadow-md
                  ${selected?.id === p.id ? "border-orange-400 ring-1 ring-orange-200" : "border-gray-100"}`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                    style={{ backgroundColor: p.color }}>
                    {p.name[0]}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-800">{p.name}</p>
                    <p className="text-[10px] text-gray-400">{p.tasks} tasks • {p.completed} Completed</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[10px] text-gray-500 mb-2">
                  <div>
                    <p className="text-gray-400">Deadline</p>
                    <p className="font-semibold text-gray-700">{p.deadline}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Value</p>
                    <p className="font-semibold text-gray-700">{p.value}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Project Lead</p>
                    <p className="font-semibold text-gray-700 truncate" title={p.lead}>{p.lead}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${p.pct}%`, backgroundColor: p.color }} />
                  </div>
                  <span className="text-[10px] font-semibold text-gray-500">{p.pct}% Completed</span>
                </div>
              </div>
            ))}
          </div>

          {/* Right — task detail */}
          {selected && (
            <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-y-auto p-5">
              {/* Priority tabs */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                  {["High","Medium","Low"].map(tab => (
                    <button key={tab} onClick={() => setPriority(tab)}
                      className={`px-3 py-1 rounded-md text-xs font-semibold transition-all
                        ${priority === tab ? "bg-white shadow text-gray-800" : "text-gray-500"}`}>
                      {tab}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-1.5 text-xs text-gray-500 border border-gray-200 rounded-lg px-2.5 py-1.5">
                    <Calendar size={11} /> Due Date
                  </button>
                  <button className="flex items-center gap-1.5 text-xs text-gray-500 border border-gray-200 rounded-lg px-2.5 py-1.5">
                    All Tags <ChevronDown size={11} />
                  </button>
                  <button className="flex items-center gap-1.5 text-xs text-gray-500 border border-gray-200 rounded-lg px-2.5 py-1.5">
                    Sort By : Created Date <ChevronDown size={11} />
                  </button>
                </div>
              </div>

              {/* Project header */}
              <div className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-100">
                <h3 className="text-sm font-bold text-gray-800 mb-3">{selected.name}</h3>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-500">Tasks Done</span>
                </div>
                <p className="text-xl font-extrabold text-gray-800 mb-2">
                  {selected.completed} / {selected.tasks + selected.completed}
                </p>
                <div className="h-2 rounded-full bg-gray-200 overflow-hidden mb-1">
                  <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${selected.pct}%` }} />
                </div>
                <p className="text-[11px] text-gray-400">{selected.pct}% Completed</p>
              </div>

              {/* Task list */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-gray-400">
                  {displayItems.length} task{displayItems.length !== 1 ? "s" : ""}
                </span>
                <button className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 border border-gray-200 rounded-lg px-3 py-1.5">
                  Mark All as Completed <ChevronDown size={11} />
                </button>
              </div>

              <div className="space-y-2">
                {displayItems.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-8">No {priority.toLowerCase()} priority tasks.</p>
                ) : (
                  displayItems.map(task => (
                    <div key={task.id}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all">
                      <button
                        onClick={() => updateTaskStatus(task.id, task.done ? "completed" : "pending", task.title)}
                        disabled={updatingTask}
                        className="cursor-pointer text-gray-400 disabled:opacity-50"
                      >
                        {task.done ? <CheckSquare size={16} className="text-orange-500" /> : <Square size={16} />}
                      </button>
                      <Star size={14} className="text-gray-300 shrink-0" />
                      <p className={`flex-1 text-sm font-medium ${task.done ? "line-through text-gray-400" : "text-gray-700"}`}>
                        {task.title}
                      </p>
                      <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                        <Calendar size={11} /> {task.date}
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${task.tagClass}`}>
                        {task.tag}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColors[task.status] || "bg-gray-100 text-gray-500"}`}>
                        • {task.status}
                      </span>
                    </div>
                  ))
                )}
              </div>

              <div className="flex justify-center mt-5">
                <button onClick={fetchTasks}
                  className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white text-sm font-semibold rounded-xl hover:bg-orange-600 shadow-sm">
                  <RefreshCw size={14} /> Refresh
                </button>
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
    </div>
  );
}