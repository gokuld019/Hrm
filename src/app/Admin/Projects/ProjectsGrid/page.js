"use client";
import { useState, useRef, useEffect } from "react";
import {
  Ellipsis, RotateCcw, ChevronDown, ChevronUp, X, FolderUp,
  Search, PencilLine, Trash2, ScanEye, CircleCheck, CircleAlert,
  Loader2, TriangleAlert, ArrowRight, UserRoundCog, Users, Crown,
  CalendarDays, DollarSign, Tag as TagIcon, FileText, Hash,
  Building2, CheckCheck, RotateCw, UserPlus
} from "lucide-react";

const BASE = process.env.NEXT_PUBLIC_API_URL;

const palette = ["#6366f1","#14b8a6","#f97316","#ec4899","#22c55e","#a855f7","#eab308","#ef4444","#06b6d4"];
const getColor = (i) => palette[i % palette.length];

// ── Avatar ────────────────────────────────────────────────────────────
const Avatar = ({ initials, color, size = "w-7 h-7" }) => (
  <div className={`${size} rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0 border-2 border-white`} style={{ backgroundColor: color }}>
    {initials}
  </div>
);

// ── Tag ───────────────────────────────────────────────────────────────
const Tag = ({ label, onRemove }) => (
  <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-700 text-xs font-medium px-2.5 py-1 rounded-full border border-orange-100">
    {label}
    <button onClick={(e) => { e.stopPropagation(); onRemove(); }} className="text-orange-300 hover:text-red-500 transition-colors ml-0.5 cursor-pointer">
      <X size={10} />
    </button>
  </span>
);

// ── SearchableSelect — single-select with search ──────────────────────
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

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  const filtered = options.filter(o => o.name.toLowerCase().includes(query.toLowerCase()));
  const selected = options.find(o => o.id === value);

  return (
    <div className="relative" ref={containerRef}>
      <div
        onClick={() => !disabled && setOpen(!open)}
        className={`flex items-center justify-between gap-2 px-3 py-2.5 border rounded-xl cursor-pointer transition-colors select-none
          ${error ? "border-red-400 bg-red-50" : open ? "border-orange-400 ring-2 ring-orange-100" : "border-gray-200 hover:border-gray-300"}
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
        <div className="absolute z-30 mt-1.5 w-full bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search..."
                className="w-full pl-7 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-orange-400 text-black"
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

// ── UserMultiSelect ───────────────────────────────────────────────────
const UserMultiSelect = ({ options, selected, onChange, placeholder, isLoading = false, error = false }) => {
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

  useEffect(() => {
    if (open && searchInputRef.current) searchInputRef.current.focus();
  }, [open]);

  const filteredOptions = options.filter(opt =>
    opt.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleUser = (userId) => {
    if (selected.includes(userId)) onChange(selected.filter(id => id !== userId));
    else onChange([...selected, userId]);
  };

  return (
    <div className="relative" ref={containerRef}>
      <div
        className={`flex flex-wrap gap-1.5 p-2.5 border rounded-xl bg-white min-h-[46px] items-center cursor-pointer transition-colors select-none
          ${error ? "border-red-400 bg-red-50" : open ? "border-orange-400 ring-2 ring-orange-100" : "border-gray-200 hover:border-gray-300"}`}
        onClick={() => !isLoading && setOpen(!open)}
      >
        {selected.length === 0 && (
          <span className={`text-sm flex-1 ${error ? "text-red-400" : "text-gray-400"}`}>
            {isLoading ? "Loading..." : placeholder}
          </span>
        )}
        {selected.map(id => {
          const label = options.find(opt => opt.id === id)?.name || id;
          return <Tag key={id} label={label} onRemove={() => toggleUser(id)} />;
        })}
        <div className="ml-auto pl-1 shrink-0">
          {open ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
        </div>
      </div>

      {open && !isLoading && (
        <div className="absolute z-30 mt-1.5 w-full bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
          <div className="p-2 border-b border-gray-100 bg-gray-50/80">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search members..."
                className="w-full pl-7 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-orange-400 text-black bg-white"
              />
            </div>
          </div>
          {options.length > 0 && (
            <div className="px-3 py-1.5 border-b border-gray-100 flex justify-between items-center">
              <button
                onClick={(e) => { e.stopPropagation(); onChange(filteredOptions.map(o => o.id)); }}
                className="text-xs text-orange-500 hover:text-orange-600 font-semibold cursor-pointer">
                Select All {filteredOptions.length > 0 ? `(${filteredOptions.length})` : ""}
              </button>
              {selected.length > 0 && (
                <button
                  onClick={(e) => { e.stopPropagation(); onChange([]); }}
                  className="text-xs text-gray-400 hover:text-red-500 font-medium cursor-pointer">
                  Clear all
                </button>
              )}
            </div>
          )}
          <div className="max-h-44 overflow-y-auto">
            {filteredOptions.length === 0
              ? <div className="p-4 text-center text-gray-400 text-xs">No matching members</div>
              : filteredOptions.map(opt => {
                const isSelected = selected.includes(opt.id);
                return (
                  <label
                    key={opt.id}
                    className={`flex items-center gap-2.5 px-3 py-2 cursor-pointer transition-colors text-sm
                      ${isSelected ? "bg-orange-50" : "hover:bg-gray-50"}`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleUser(opt.id)}
                      className="rounded border-gray-300 text-orange-500 focus:ring-orange-400 shrink-0 cursor-pointer"
                    />
                    <span className={isSelected ? "text-orange-700 font-medium" : "text-gray-700"}>{opt.name}</span>
                    {isSelected && <CircleCheck size={12} className="ml-auto text-orange-400 shrink-0" />}
                  </label>
                );
              })
            }
          </div>
          {selected.length > 0 && (
            <div className="px-3 py-2 border-t border-gray-100 bg-gray-50/80 text-xs text-gray-500 font-medium">
              {selected.length} member{selected.length > 1 ? "s" : ""} selected
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
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm cursor-pointer" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 z-10 p-8 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="16" fill="#22c55e" fillOpacity="0.15" />
            <path d="M9 16.5l5 5 9-9" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h3 className="text-base font-bold text-gray-900 mb-1">Success!</h3>
        <p className="text-sm text-gray-500 mb-5">{message}</p>
        <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-green-500 rounded-full" style={{ animation: "shrink 2.5s linear forwards" }} />
        </div>
        <style>{`@keyframes shrink { from { width: 100%; } to { width: 0%; } }`}</style>
        <button onClick={onClose} className="mt-4 px-6 py-2 text-xs font-semibold text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition cursor-pointer">Close</button>
      </div>
    </div>
  );
}

// ── ERROR MODAL ───────────────────────────────────────────────────────
function ErrorModal({ message, onClose }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm cursor-pointer" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 z-10 p-8 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="16" fill="#ef4444" fillOpacity="0.15" />
            <path d="M11 11l10 10M21 11l-10 10" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>
        <h3 className="text-base font-bold text-gray-900 mb-1">Something went wrong</h3>
        <p className="text-sm text-gray-500 mb-5">{message}</p>
        <button onClick={onClose} className="px-6 py-2 text-xs font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg transition cursor-pointer">Close</button>
      </div>
    </div>
  );
}

// ── CONFIRM DELETE MODAL ──────────────────────────────────────────────
function ConfirmDeleteModal({ title, onConfirm, onClose, deleting }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm cursor-pointer" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 z-10 p-6 flex flex-col items-center text-center">
        <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mb-4">
          <Trash2 size={24} className="text-red-500" />
        </div>
        <h3 className="text-base font-bold text-gray-900 mb-1">Delete Project</h3>
        <p className="text-sm text-gray-500 mb-1">Are you sure you want to delete</p>
        <p className="text-sm font-semibold text-gray-800 mb-2">"{title}"?</p>
        <p className="text-xs text-red-500 mb-6">This action cannot be undone.</p>
        <div className="flex gap-3 w-full">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition cursor-pointer">Cancel</button>
          <button onClick={onConfirm} disabled={deleting}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-xl transition disabled:opacity-60 cursor-pointer">
            {deleting ? <><Loader2 size={14} className="animate-spin" />Deleting…</> : <><Trash2 size={14} />Delete</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── ADD PROJECT MODAL ─────────────────────────────────────────────────
function AddProjectModal({ onClose, onSuccess }) {
  const [tab, setTab] = useState("basic");
  const [projectName, setProjectName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [priority, setPriority] = useState("");
  const [value, setValue] = useState("");
  const [priceType, setPriceType] = useState("");
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

  const authHeaders = () => {
    const token = localStorage.getItem("admin_auth_token");
    return { Authorization: `Bearer ${token}`, "ngrok-skip-browser-warning": "true" };
  };

  useEffect(() => {
    const autoGenCode = async () => {
      setGeneratingCode(true);
      try {
        const res = await fetch(`${BASE}/api/admin/projects/next-code`, { headers: authHeaders() });
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
      const res = await fetch(`${BASE}/api/admin/clients`, { headers: authHeaders() });
      if (!res.ok) throw new Error("Failed to fetch clients");
      const data = await res.json();
      const list = data.data || data;
      setClients(Array.isArray(list) ? list : []);
    } catch (err) { console.error(err); } finally { setLoadingClients(false); }
  };

  const fetchMembersData = async () => {
    setLoadingMembers(true); setMembersError(null);
    try {
      const headers = { ...authHeaders(), "Content-Type": "application/json" };
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
      const res = await fetch(`${BASE}/api/admin/projects/next-code`, { headers: authHeaders() });
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
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ project_code: projectCode })
      });
      const data = await res.json();
      if (res.ok && data.available) setCodeCheckStatus({ type: "success", message: "Code is available" });
      else setCodeCheckStatus({ type: "error", message: data.message || "Code already exists" });
    } catch { setCodeCheckStatus({ type: "error", message: "Failed to check code" }); }
    finally { setCodeChecking(false); }
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
    if (!selectedClientId)   { setInlineError("Please select a client."); return; }

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
        value: value ? parseFloat(value) : null,
        type: priceType ? priceType.toLowerCase() : "fixed",
        description: description || null,
        project_manager_id: projectManagerId ? parseInt(projectManagerId) : null,
        team_leader_id: teamLeaderId ? parseInt(teamLeaderId) : null,
        team_members: teamMembers.map(id => Number(id))
      };

      const res = await fetch(`${BASE}/api/admin/projects`, {
        method: "POST",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
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

  const inputCls = "w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 text-black transition-all bg-white cursor-text";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden" style={{ maxHeight: "90vh" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-base font-bold text-gray-800">Add Project</h2>
            <p className="text-xs text-gray-400 mt-0.5">Fill in the details to create a new project</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 cursor-pointer transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Tabs */}
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

        {/* Inline error */}
        {inlineError && (
          <div className="mx-6 mt-4 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 shrink-0">
            <TriangleAlert size={13} className="shrink-0 mt-0.5" /><span>{inlineError}</span>
          </div>
        )}

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">

          {tab === "basic" && (
            <>
              {/* Project Code */}
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
                    className="flex items-center gap-1.5 px-3 py-2 bg-orange-50 text-orange-600 border border-orange-200 rounded-xl text-sm hover:bg-orange-100 disabled:opacity-50 font-medium cursor-pointer transition-colors">
                    {codeChecking ? <Loader2 size={14} className="animate-spin" /> : <CircleCheck size={13} />}
                    Check
                  </button>
                </div>
                {codeCheckStatus && (
                  <div className={`mt-1.5 text-xs flex items-center gap-1 ${codeCheckStatus.type === "success" ? "text-green-600" : "text-red-500"}`}>
                    {codeCheckStatus.type === "success" ? <CircleCheck size={12} /> : <CircleAlert size={12} />}
                    {codeCheckStatus.message}
                  </div>
                )}
                {apiErrors.project_code && <p className="text-red-500 text-xs mt-1">{apiErrors.project_code[0]}</p>}
              </div>

              {/* Project Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1">
                  <FileText size={11} className="text-gray-400" /> Project Name <span className="text-red-500">*</span>
                </label>
                <input value={projectName} onChange={e => setProjectName(e.target.value)}
                  className={inputCls} placeholder="Enter project name" />
                {apiErrors.project_name && <p className="text-red-500 text-xs mt-1">{apiErrors.project_name[0]}</p>}
              </div>

              {/* Client */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1">
                  <Building2 size={11} className="text-gray-400" /> Client <span className="text-red-500">*</span>
                </label>
                <select value={selectedClientId} onChange={e => setSelectedClientId(e.target.value)} disabled={loadingClients}
                  className={`${inputCls} cursor-pointer`}>
                  <option value="">{loadingClients ? "Loading clients..." : "Select a client"}</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.company_name} ({c.client_code})</option>)}
                </select>
                {apiErrors.client_id && <p className="text-red-500 text-xs mt-1">{apiErrors.client_id[0]}</p>}
              </div>

              {/* Dates */}
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

              {/* Priority, Value, Type */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1">
                    <TagIcon size={11} className="text-gray-400" /> Priority
                  </label>
                  <select value={priority} onChange={e => setPriority(e.target.value)} className={`${inputCls} cursor-pointer`}>
                    <option value="">Select</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1">
                    <DollarSign size={11} className="text-gray-400" /> Value
                  </label>
                  <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100 transition-all">
                    <span className="px-2 text-sm text-gray-400 bg-gray-50 border-r border-gray-200 py-2.5">$</span>
                    <input value={value} onChange={e => setValue(e.target.value)} type="number"
                      className="flex-1 px-2 py-2.5 text-sm outline-none text-black cursor-text" placeholder="0" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Price Type</label>
                  <select value={priceType} onChange={e => setPriceType(e.target.value)} className={`${inputCls} cursor-pointer`}>
                    <option value="">Select</option>
                    <option value="fixed">Fixed</option>
                    <option value="hourly">Hourly</option>
                    <option value="retainer">Retainer</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Description</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
                  className={`${inputCls} resize-none`} placeholder="Add a brief description..." />
              </div>

              {/* Nudge */}
              <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 flex items-center gap-3">
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

          {/* MEMBERS TAB */}
          {tab === "members" && (
            <div className="space-y-5">
              {membersError && (
                <div className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-xl text-xs flex items-center gap-2">
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
                  {/* Project Manager */}
                  <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center">
                        <UserRoundCog size={14} className="text-green-600" />
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

                  {/* Team Leader */}
                  <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center">
                        <Crown size={14} className="text-blue-600" />
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

                  {/* Team Members */}
                  <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
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
                        <span className="text-[11px] text-orange-500 font-semibold bg-orange-50 px-2.5 py-1 rounded-full border border-orange-100">
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

                  {/* Summary */}
                  {(projectManagerId || teamLeaderId || teamMembers.length > 0) && (
                    <div className="bg-gradient-to-br from-gray-50 to-orange-50/30 border border-gray-200 rounded-xl p-3 space-y-2">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Team Summary</p>
                      {projectManagerId && (
                        <div className="flex items-center gap-2 text-xs">
                          <UserRoundCog size={11} className="text-green-500 shrink-0" />
                          <span className="text-gray-500 w-14 shrink-0">Manager</span>
                          <span className="font-semibold text-gray-700">{memberOptions.projectManagers.find(m => m.id === projectManagerId)?.name}</span>
                        </div>
                      )}
                      {teamLeaderId && (
                        <div className="flex items-center gap-2 text-xs">
                          <Crown size={11} className="text-blue-500 shrink-0" />
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

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-100 shrink-0 bg-gray-50/50">
          <button onClick={onClose} className="px-5 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition cursor-pointer">
            Cancel
          </button>
          <div className="flex items-center gap-2">
            {tab === "basic" && (
              <button onClick={() => setTab("members")}
                className="flex items-center gap-1.5 px-5 py-2 border border-orange-200 text-orange-600 rounded-xl text-sm font-semibold hover:bg-orange-50 transition cursor-pointer">
                Members <ArrowRight size={13} />
              </button>
            )}
            <button onClick={handleSave} disabled={submitting || !isFormValid}
              className="flex items-center gap-2 px-5 py-2 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 disabled:opacity-50 transition cursor-pointer">
              {submitting ? <><Loader2 size={14} className="animate-spin" />Creating...</> : <><CircleCheck size={14} /> Create Project</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── EDIT PROJECT MODAL ────────────────────────────────────────────────
function EditProjectModal({ projectId, onClose, onSuccess }) {
  const [tab, setTab] = useState("details");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({});
  const [teamMembers, setTeamMembers] = useState([]);
  const [teamLeaderId, setTeamLeaderId] = useState("");
  const [projectManagerId, setProjectManagerId] = useState("");
  const [memberOptions, setMemberOptions] = useState({ teamLeaders: [], projectManagers: [], teamMembers: [] });
  const [apiErrors, setApiErrors] = useState({});
  const [inlineError, setInlineError] = useState(null);
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState("");

  const isFormValid =
    formData.project_name?.trim() !== "" &&
    selectedClientId !== "" &&
    teamLeaderId !== "" &&
    projectManagerId !== "";

  const authHeaders = () => {
    const token = localStorage.getItem("admin_auth_token");
    return { Authorization: `Bearer ${token}`, "ngrok-skip-browser-warning": "true" };
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = authHeaders();
        const projRes = await fetch(`${BASE}/api/admin/projects/${projectId}`, { headers });
        const projData = await projRes.json();
        const project = projData.data || projData;

        setFormData({
          project_name: project.project_name || "",
          project_code: project.project_code || "",
          start_date: project.start_date || "",
          end_date: project.end_date || "",
          priority: project.priority || "",
          value: project.value || "",
          type: project.type || "",
          description: project.description || ""
        });
        setSelectedClientId(project.client_id || "");
        setTeamLeaderId(project.team_leader?.id || "");
        setProjectManagerId(project.project_manager?.id || "");
        setTeamMembers(project.team_members?.map(m => m.id) || []);

        const [empRes, clientsRes] = await Promise.all([
          fetch(`${BASE}/api/admin/employees`, { headers }),
          fetch(`${BASE}/api/admin/clients`, { headers })
        ]);

        const empData = await empRes.json();
        const employees = empData.data || [];
        const leaders = [], managers = [], members = [];
        employees.forEach(emp => {
          const name = emp.firstname
            ? `${emp.firstname} ${emp.lastname || ""}`.trim()
            : (emp.name || emp.username || emp.email || `Employee ${emp.id}`);
          const desig = emp.designation?.name?.toLowerCase() || "";
          if (desig.includes("project manager") || desig.includes("pm")) managers.push({ id: emp.id, name });
          else if (desig.includes("team leader") || desig.includes("team lead") || desig.includes("tl")) leaders.push({ id: emp.id, name });
          else members.push({ id: emp.id, name });
        });
        setMemberOptions({ teamLeaders: leaders, projectManagers: managers, teamMembers: members });

        const clientsData = await clientsRes.json();
        const list = clientsData.data || clientsData;
        setClients(Array.isArray(list) ? list : []);
      } catch (err) { setInlineError("Failed to load project data"); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [projectId]);

  const handleUpdate = async () => {
    setSubmitting(true); setApiErrors({}); setInlineError(null);
    try {
      const payload = {
        project_name: formData.project_name,
        project_code: formData.project_code,
        client_id: selectedClientId ? parseInt(selectedClientId) : null,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        priority: formData.priority ? formData.priority.toLowerCase() : null,
        value: formData.value ? parseFloat(formData.value) : null,
        type: formData.type ? formData.type.toLowerCase() : "fixed",
        description: formData.description || null,
        project_manager_id: projectManagerId ? parseInt(projectManagerId) : null,
        team_leader_id: teamLeaderId ? parseInt(teamLeaderId) : null,
        team_members: teamMembers.map(id => Number(id))
      };
      const res = await fetch(`${BASE}/api/admin/projects/${projectId}`, {
        method: "PUT",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 422 && data.errors) {
          setApiErrors(data.errors);
          setInlineError(Object.values(data.errors).flat().join(" • "));
        } else throw new Error(data.message || "Update failed");
        return;
      }
      onSuccess?.("Project updated successfully!");
      onClose();
    } catch (err) { setInlineError(err.message); }
    finally { setSubmitting(false); }
  };

  const field = "w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all text-black bg-white";
  const lbl   = "block text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5";

  if (loading) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Loader2 size={32} className="animate-spin text-orange-400" />
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden" style={{ maxHeight: "90vh" }}>

        <div className="px-6 pt-5 pb-0 shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-0.5">{formData.project_code}</p>
              <h2 className="text-[17px] font-semibold text-black leading-tight">Edit project</h2>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 shrink-0 cursor-pointer transition-colors">
              <X size={14} />
            </button>
          </div>
          <div className="flex mt-4 border-b border-gray-100">
            {[["details","Details"],["team","Team"]].map(([key, label]) => (
              <button key={key} onClick={() => setTab(key)}
                className={`px-4 py-2.5 text-[13px] font-medium border-b-2 -mb-px transition-colors cursor-pointer
                  ${tab === key ? "border-orange-500 text-orange-500" : "border-transparent text-gray-400 hover:text-gray-600"}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {inlineError && (
          <div className="mx-6 mt-4 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600">
            <TriangleAlert size={13} className="shrink-0 mt-0.5" /><span>{inlineError}</span>
          </div>
        )}

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
          {tab === "details" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={lbl}>Project code</label>
                  <div className="px-3 py-2.5 text-sm bg-gray-50 border border-gray-100 rounded-xl text-gray-400 select-none font-mono">
                    {formData.project_code || "—"}
                  </div>
                </div>
                <div>
                  <label className={lbl}>Client <span className="text-orange-500">*</span></label>
                  <select value={selectedClientId} onChange={e => setSelectedClientId(e.target.value)} className={`${field} cursor-pointer`}>
                    <option value="">Select client</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.company_name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className={lbl}>Project name <span className="text-orange-500">*</span></label>
                <input value={formData.project_name} onChange={e => setFormData({ ...formData, project_name: e.target.value })}
                  placeholder="Enter project name" className={`${field} cursor-text`} />
                {apiErrors.project_name && <p className="text-red-500 text-xs mt-1">{apiErrors.project_name[0]}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={lbl}>Start date</label>
                  <input type="date" value={formData.start_date} onChange={e => setFormData({ ...formData, start_date: e.target.value })} className={`${field} cursor-pointer`} />
                </div>
                <div>
                  <label className={lbl}>End date</label>
                  <input type="date" value={formData.end_date} onChange={e => setFormData({ ...formData, end_date: e.target.value })} className={`${field} cursor-pointer`} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className={lbl}>Priority</label>
                  <select value={formData.priority} onChange={e => setFormData({ ...formData, priority: e.target.value })} className={`${field} cursor-pointer`}>
                    <option value="">—</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className={lbl}>Value ($)</label>
                  <input type="number" value={formData.value} onChange={e => setFormData({ ...formData, value: e.target.value })} placeholder="0" className={`${field} cursor-text`} />
                </div>
                <div>
                  <label className={lbl}>Type</label>
                  <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} className={`${field} cursor-pointer`}>
                    <option value="">—</option>
                    <option value="fixed">Fixed</option>
                    <option value="hourly">Hourly</option>
                    <option value="retainer">Retainer</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={lbl}>Description</label>
                <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                  rows={3} placeholder="Add a short description..." className={`${field} resize-none cursor-text`} />
              </div>
            </>
          )}

          {tab === "team" && (
            <div className="space-y-4">
              <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center">
                    <UserRoundCog size={14} className="text-green-600" />
                  </div>
                  <p className="text-xs font-bold text-gray-700">Project Manager <span className="text-orange-500">*</span></p>
                </div>
                <SearchableSelect
                  options={memberOptions.projectManagers}
                  value={projectManagerId}
                  onChange={setProjectManagerId}
                  placeholder="Search & select project manager..."
                />
              </div>
              <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center">
                    <Crown size={14} className="text-blue-600" />
                  </div>
                  <p className="text-xs font-bold text-gray-700">Team Leader <span className="text-orange-500">*</span></p>
                </div>
                <SearchableSelect
                  options={memberOptions.teamLeaders}
                  value={teamLeaderId}
                  onChange={setTeamLeaderId}
                  placeholder="Search & select team leader..."
                />
              </div>
              <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center">
                      <Users size={14} className="text-orange-500" />
                    </div>
                    <p className="text-xs font-bold text-gray-700">Team Members</p>
                  </div>
                  {teamMembers.length > 0 && (
                    <span className="text-[11px] text-orange-500 font-semibold bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100">
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
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between shrink-0 bg-gray-50/50">
          <button onClick={onClose} className="text-sm text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">Cancel</button>
          <button onClick={handleUpdate} disabled={submitting || !isFormValid}
            className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-colors cursor-pointer">
            {submitting
              ? <><Loader2 size={14} className="animate-spin" />Saving...</>
              : <><CircleCheck size={14} /> Save changes</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}

// ── VIEW PROJECT MODAL ────────────────────────────────────────────────
function ViewProjectModal({ projectId, onClose, onRefresh }) {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [confirmRemove, setConfirmRemove] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const authHeaders = () => {
    const token = localStorage.getItem("admin_auth_token");
    return { Authorization: `Bearer ${token}`, "ngrok-skip-browser-warning": "true" };
  };

  const normalizePerson = (person) => {
    if (!person) return null;
    if (typeof person === "string") return { name: person };
    const fullName = [person.firstname, person.lastname].filter(Boolean).join(" ").trim();
    return { ...person, name: fullName || person.name || person.username || person.email || `Employee ${person.id}` };
  };

  const fetchProject = async () => {
    try {
      const res = await fetch(`${BASE}/api/admin/projects/${projectId}`, { headers: authHeaders() });
      const data = await res.json();
      const p = data.data || data;
      setProject({
        ...p,
        team_leader: normalizePerson(p.team_leader),
        project_manager: normalizePerson(p.project_manager),
        team_members: (p.team_members || []).map(normalizePerson)
      });
    } catch (err) { setErrorMsg("Failed to load project details"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProject(); }, [projectId]);

  const removeTeamMember = async (employeeId) => {
    try {
      const res = await fetch(`${BASE}/api/admin/projects/${projectId}/remove-member/${employeeId}`, {
        method: "DELETE", headers: authHeaders()
      });
      if (!res.ok) throw new Error();
      setSuccessMsg("Member removed successfully!");
      fetchProject(); onRefresh?.();
    } catch { setErrorMsg("Failed to remove member"); }
    setConfirmRemove(null);
  };

  if (loading) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <Loader2 size={32} className="animate-spin text-orange-400" />
    </div>
  );

  if (!project) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-lg font-bold text-black">{project.project_name}</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 cursor-pointer transition-colors"><X size={20} /></button>
          </div>
          <div className="overflow-y-auto p-4 space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2"><Hash size={13} className="text-gray-400" /><span className="font-semibold text-gray-700">Code:</span> <span className="text-black font-mono">{project.project_code}</span></div>
              <div className="flex items-center gap-2"><Building2 size={13} className="text-gray-400" /><span className="font-semibold text-gray-700">Client:</span> <span className="text-black">{project.client?.company_name || "—"}</span></div>
              <div className="flex items-center gap-2"><CalendarDays size={13} className="text-gray-400" /><span className="font-semibold text-gray-700">Start:</span> <span className="text-black">{project.start_date || "—"}</span></div>
              <div className="flex items-center gap-2"><CalendarDays size={13} className="text-gray-400" /><span className="font-semibold text-gray-700">End:</span> <span className="text-black">{project.end_date || "—"}</span></div>
              <div className="flex items-center gap-2"><TagIcon size={13} className="text-gray-400" /><span className="font-semibold text-gray-700">Priority:</span> <span className="text-black capitalize">{project.priority || "—"}</span></div>
              <div className="flex items-center gap-2"><DollarSign size={13} className="text-gray-400" /><span className="font-semibold text-gray-700">Value:</span> <span className="text-black">{project.value ? `$${project.value}` : "—"}</span></div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-1"><FileText size={13} className="text-gray-400" /><span className="font-semibold text-gray-700 text-sm">Description</span></div>
              <p className="text-sm text-black pl-5">{project.description || "No description"}</p>
            </div>
            <div className="border-t pt-3">
              <div className="flex items-center gap-1.5 mb-2"><Crown size={13} className="text-blue-500" /><h3 className="font-semibold text-gray-800 text-sm">Team Leader</h3></div>
              {project.team_leader
                ? <span className="bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-lg text-sm text-black font-medium">{project.team_leader.name}</span>
                : <span className="text-gray-400 text-sm">None assigned</span>}
            </div>
            <div className="border-t pt-3">
              <div className="flex items-center gap-1.5 mb-2"><UserRoundCog size={13} className="text-green-500" /><h3 className="font-semibold text-gray-800 text-sm">Project Manager</h3></div>
              {project.project_manager
                ? <span className="bg-green-50 border border-green-100 px-3 py-1.5 rounded-lg text-sm text-black font-medium">{project.project_manager.name}</span>
                : <span className="text-gray-400 text-sm">None assigned</span>}
            </div>
            <div className="border-t pt-3">
              <div className="flex items-center gap-1.5 mb-2"><Users size={13} className="text-orange-500" /><h3 className="font-semibold text-gray-800 text-sm">Team Members</h3></div>
              <div className="flex flex-wrap gap-2">
                {project.team_members && project.team_members.length > 0
                  ? project.team_members.map(member => (
                    <div key={member.id} className="bg-gray-100 px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 text-black">
                      {member.name}
                      <button onClick={() => setConfirmRemove(member)} className="text-red-400 hover:text-red-600 cursor-pointer transition-colors"><X size={12} /></button>
                    </div>
                  ))
                  : <span className="text-gray-400 text-sm">No members</span>}
              </div>
            </div>
          </div>
          <div className="flex justify-end p-4 border-t">
            <button onClick={onClose} className="px-5 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition text-sm font-medium cursor-pointer">Close</button>
          </div>
        </div>
      </div>
      {confirmRemove && (
        <ConfirmDeleteModal
          title={`Remove ${confirmRemove.name} from this project?`}
          onConfirm={() => removeTeamMember(confirmRemove.id)}
          onClose={() => setConfirmRemove(null)}
          deleting={false}
        />
      )}
      {successMsg && <SuccessModal message={successMsg} onClose={() => setSuccessMsg(null)} />}
      {errorMsg   && <ErrorModal   message={errorMsg}   onClose={() => setErrorMsg(null)}   />}
    </>
  );
}

// ── MAIN ProjectsGrid ─────────────────────────────────────────────────
export default function ProjectsGrid() {
  const [visible, setVisible] = useState(12);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpenMenuId(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchProjects = async () => {
    setLoading(true); setError(null);
    try {
      const token = localStorage.getItem("admin_auth_token");
      const headers = { Authorization: `Bearer ${token}`, "ngrok-skip-browser-warning": "true" };
      const res = await fetch(`${BASE}/api/admin/projects`, { headers });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      const raw = Array.isArray(data) ? data : data.data || [];
      setProjects(raw.map(p => ({
        id: p.id,
        title: p.project_name || p.name,
        desc: p.description || "No description",
        leader: p.creator?.name || "Unassigned",
        leaderRole: "Project Creator",
        deadline: p.end_date || "TBD",
        tasks: p.task_count ?? 0,
        raw: p
      })));
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleDeleteConfirmed = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      const token = localStorage.getItem("admin_auth_token");
      const res = await fetch(`${BASE}/api/admin/projects/${confirmDelete.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}`, "ngrok-skip-browser-warning": "true" }
      });
      if (!res.ok) throw new Error();
      setSuccessMsg("Project deleted successfully!");
      fetchProjects();
    } catch { setErrorMsg("Delete failed. Please try again."); }
    finally { setDeleting(false); setConfirmDelete(null); }
  };

  if (loading) return (
    <div className="flex justify-center items-center py-32">
      <Loader2 size={32} className="animate-spin text-orange-400" />
    </div>
  );

  if (error) return (
    <div className="text-center py-20 text-red-500">
      Error: {error}
      <button onClick={fetchProjects} className="ml-2 underline cursor-pointer">Retry</button>
    </div>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-base font-bold text-gray-700">Projects Grid</h2>
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs cursor-pointer hover:bg-gray-50 transition-colors">
            Select Status <ChevronDown size={11} />
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs cursor-pointer hover:bg-gray-50 transition-colors">
            Sort By : Last 7 Days <ChevronDown size={11} />
          </button>
        </div>
      </div>

      {projects.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <p>No projects yet. Click the + button to add.</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {projects.slice(0, visible).map((p, i) => {
          const initials = p.leader.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase();
          const memberAvatars = p.raw?.team_members?.slice(0,3).map(m => m?.name?.charAt(0) || "").filter(c => c !== "");
          const avatars = memberAvatars && memberAvatars.length > 0 ? memberAvatars : [initials];
          const isMenuOpen = openMenuId === p.id;

          return (
            <div key={p.id} className="bg-white rounded-2xl border shadow-sm hover:shadow-md p-4 flex flex-col gap-3 transition-shadow">
              <div className="flex justify-between items-start">
                <h3 className="text-sm font-bold text-black leading-tight flex-1 pr-2">{p.title}</h3>
                <div className="relative shrink-0" ref={isMenuOpen ? menuRef : null}>
                  <button
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={(e) => { e.stopPropagation(); setOpenMenuId(isMenuOpen ? null : p.id); }}>
                    <Ellipsis size={15} />
                  </button>
                  {isMenuOpen && (
                    <div className="absolute right-0 top-8 flex flex-col bg-white border border-gray-200 rounded-xl shadow-lg z-20 w-36 overflow-hidden py-1">
                      <button onClick={() => { setOpenMenuId(null); setSelectedProjectId(p.id); setShowViewModal(true); }}
                        className="text-left px-3 py-2 text-xs hover:bg-gray-50 flex items-center gap-2 text-gray-700 cursor-pointer transition-colors">
                        <ScanEye size={13} className="text-gray-500" /> View
                      </button>
                      <button onClick={() => { setOpenMenuId(null); setSelectedProjectId(p.id); setShowEditModal(true); }}
                        className="text-left px-3 py-2 text-xs hover:bg-gray-50 flex items-center gap-2 text-gray-700 cursor-pointer transition-colors">
                        <PencilLine size={13} className="text-gray-500" /> Edit
                      </button>
                      <div className="my-1 border-t border-gray-100" />
                      <button onClick={() => { setOpenMenuId(null); setConfirmDelete(p); }}
                        className="text-left px-3 py-2 text-xs hover:bg-red-50 text-red-500 flex items-center gap-2 cursor-pointer transition-colors">
                        <Trash2 size={13} /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <p className="text-[11px] text-gray-500 line-clamp-3 leading-relaxed">{p.desc}</p>

              <div className="flex justify-between items-center mt-auto pt-2 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <Avatar initials={initials} color={getColor(i)} size="w-7 h-7" />
                  <div>
                    <p className="text-xs font-semibold text-black">{p.leader}</p>
                    <p className="text-[10px] text-gray-400">{p.leaderRole}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-400 flex items-center gap-0.5 justify-end"><CalendarDays size={9} /> Deadline</p>
                  <p className="text-[11px] font-semibold text-black">{p.deadline}</p>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[11px] text-gray-400 flex items-center gap-1">
                  <CheckCheck size={12} className="text-gray-400" /> {p.tasks} tasks
                </span>
                <div className="flex -space-x-1.5">
                  {avatars.map((a, j) => <Avatar key={j} initials={a} color={getColor(i+j)} size="w-6 h-6" />)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {visible < projects.length && (
        <div className="flex justify-center mt-6">
          <button onClick={() => setVisible(v => v+4)}
            className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors cursor-pointer text-sm font-semibold">
            <RotateCcw size={14}/> Load More
          </button>
        </div>
      )}

      {/* FAB */}
      <div className="fixed bottom-6 right-6 z-40">
        <button onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-orange-500 text-white px-4 py-3 rounded-2xl shadow-lg hover:bg-orange-600 transition-colors cursor-pointer text-sm font-semibold">
          <FolderUp size={18} /> New Project
        </button>
      </div>

      {showAddModal && <AddProjectModal onClose={() => setShowAddModal(false)} onSuccess={(msg) => { fetchProjects(); setSuccessMsg(msg); }} />}
      {showEditModal && <EditProjectModal projectId={selectedProjectId} onClose={() => setShowEditModal(false)} onSuccess={(msg) => { fetchProjects(); setSuccessMsg(msg); }} />}
      {showViewModal && <ViewProjectModal projectId={selectedProjectId} onClose={() => setShowViewModal(false)} onRefresh={fetchProjects} />}
      {confirmDelete && <ConfirmDeleteModal title={confirmDelete.title} onConfirm={handleDeleteConfirmed} onClose={() => setConfirmDelete(null)} deleting={deleting} />}

      {successMsg && <SuccessModal message={successMsg} onClose={() => setSuccessMsg(null)} />}
      {errorMsg   && <ErrorModal   message={errorMsg}   onClose={() => setErrorMsg(null)}   />}
    </div>
  );
}

export { AddProjectModal, EditProjectModal, ViewProjectModal };