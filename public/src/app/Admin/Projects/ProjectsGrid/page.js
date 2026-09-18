"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import {
  Ellipsis, RotateCcw, ChevronDown, ChevronUp, X, FolderUp,
  Search, PencilLine, Trash2, ScanEye, CircleCheck, CircleAlert,
  Loader2, TriangleAlert, ArrowRight, UserRoundCog, Users, Crown,
  CalendarDays, DollarSign, Tag as TagIcon, FileText, Hash,
  Building2, CheckCheck, RotateCw, UserPlus, MapPin, BadgeCheck,
  CreditCard, TrendingUp, Download, ChevronLeft, ChevronRight, ArrowUpDown,
  AlertTriangle, RefreshCw, Clock, ListChecks, Eye, MessageSquare,
  CircleDot, AlertOctagon, CalendarClock, Briefcase, Paperclip,
  CheckSquare, Square, Sparkles, Flag, User, Target, Activity,
  BarChart3, PieChart, Zap, TrendingDown, Info
} from "lucide-react";

const BASE = process.env.NEXT_PUBLIC_API_URL;

const palette = ["#6366f1","#14b8a6","#f97316","#ec4899","#22c55e","#a855f7","#eab308","#ef4444","#06b6d4"];
const getColor = (i) => palette[i % palette.length];
const AVATAR_COLORS = ["#6366f1","#f97316","#14b8a6","#ec4899","#22c55e","#a855f7","#3b82f6","#eab308"];

// ── Helpers ───────────────────────────────────────────────────────────
const priorityColors = {
  high:   "bg-rose-50 text-rose-600 ring-1 ring-rose-100",
  medium: "bg-amber-50 text-amber-600 ring-1 ring-amber-100",
  low:    "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100",
  urgent: "bg-violet-50 text-violet-600 ring-1 ring-violet-100",
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

const fmtDate = (iso, opts = { day:"2-digit", month:"short", year:"numeric" }) => {
  if (!iso) return "—";
  try { return new Date(iso).toLocaleDateString("en-GB", opts); }
  catch { return "—"; }
};

const isTaskOverdue = (task) => {
  if (!task?.due_date) return false;
  if (["completed", "done"].includes((task.status || "").toLowerCase())) return false;
  const due = new Date(task.due_date);
  due.setHours(23, 59, 59, 999);
  return new Date() > due;
};

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

// ── SearchableSelect ──────────────────────────────────────────────────
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

// ── CLIENT MODAL ──────────────────────────────────────────────────────
function ClientModal({ client, onClose, onSuccess }) {
  const isEdit = !!client;
  const [tab, setTab] = useState("basic");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [codeChecking, setCodeChecking] = useState(false);
  const [codeError, setCodeError] = useState(null);
  const [generatingCode, setGeneratingCode] = useState(false);
  const debounceTimer = useRef(null);

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

  const handleCodeChange = (e) => {
    const newCode = e.target.value;
    set("client_code", newCode);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => checkClientCode(newCode), 500);
  };

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
  const inputCls = "w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition text-gray-800 bg-white placeholder:text-gray-400";
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
              <label className={labelCls}>Alternative Phone(optional)</label>
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
              <label className={labelCls}>GST Number(optional)</label>
              <input value={form.gst_number} onChange={e => set("gst_number", e.target.value.toUpperCase())}
                placeholder="22AAAAA0000A1Z5" maxLength={15} className={inputCls} />
              <p className="text-[10px] text-gray-400 mt-1">15-character GSTIN</p>
            </div>
            <div>
              <label className={labelCls}>PAN Number(optional)</label>
              <input value={form.pan_number} onChange={e => set("pan_number", e.target.value.toUpperCase())}
                placeholder="AAAAA0000A" maxLength={10} className={inputCls} />
              <p className="text-[10px] text-gray-400 mt-1">10-character PAN</p>
            </div>
          </div>
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
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
                <select value={form.payment_terms} onChange={e => set("payment_terms", e.target.value)} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 appearance-none bg-white transition text-gray-700">
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
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
            <p className="text-[11px] font-semibold text-blue-700 mb-2">Payment Terms Reference</p>
            <div className="grid grid-cols-2 gap-y-1.5 gap-x-4 text-[10px] text-blue-600">
              {[
                ["Immediate", "Due on receipt"],
                ["Net 15", "Due in 15 days"],
                ["Net 30", "Due in 30 days"],
                ["Net 45", "Due in 45 days"],
                ["Net 60", "Due in 60 days"],
              ].map(([t, d]) => (
                <div key={t} className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
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
                        ? "border-green-400 bg-green-50 text-green-700"
                        : "border-red-300 bg-red-50 text-red-600"
                      : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
                  <input type="radio" name="status" value={s} checked={form.status === s}
                    onChange={() => set("status", s)} className="sr-only" />
                  <span className={`w-2 h-2 rounded-full ${form.status === s ? (s === "active" ? "bg-green-500" : "bg-red-400") : "bg-gray-300"}`} />
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
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 z-10 flex flex-col max-h-[92vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-base font-bold text-gray-900">
              {isEdit ? `Edit Client` : "Add New Client"}
            </h2>
            <p className="text-[11px] text-gray-400 mt-0.5">
              {isEdit ? "Update client information below" : "Fill in the details to create a new client"}
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition">
            <X size={15} />
          </button>
        </div>

        <div className="flex border-b border-gray-100 shrink-0 px-2 overflow-x-auto">
          {TABS.map(({ key, label, Icon }) => (
            <button key={key} onClick={() => setTab(key)}
              className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors
                ${tab === key ? "border-orange-500 text-orange-600" : "border-transparent text-gray-400 hover:text-gray-600"}`}>
              <Icon size={12} />{label}
            </button>
          ))}
        </div>

        <div className="overflow-y-auto px-6 py-5 flex-1">
          {saveError && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 mb-4">
              <AlertTriangle size={13} className="shrink-0 mt-0.5" /><span>{saveError}</span>
            </div>
          )}
          {renderTabContent()}
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50 shrink-0">
          <div className="flex items-center gap-1.5">
            {TABS.map(({ key }) => (
              <button key={key} onClick={() => setTab(key)}
                className={`h-2 rounded-full transition-all ${tab === key ? "bg-orange-500 w-4" : "bg-gray-200 hover:bg-gray-300 w-2"}`} />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setTab(TABS[currentTabIdx - 1].key)} disabled={currentTabIdx === 0}
              className="px-3 py-1.5 text-xs font-medium text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition">
              ← Prev
            </button>
            <button onClick={() => setTab(TABS[currentTabIdx + 1].key)} disabled={currentTabIdx === TABS.length - 1}
              className="px-3 py-1.5 text-xs font-medium text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition">
              Next →
            </button>
            <div className="w-px h-5 bg-gray-200 mx-1" />
            <button onClick={onClose} className="px-5 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100 transition">
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving || !isValid() || codeChecking || generatingCode}
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed">
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

// ── ADD PROJECT MODAL ─────────────────────────────────────────────────
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
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden" style={{ maxHeight: "90vh" }}>

          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
            <div>
              <h2 className="text-base font-bold text-gray-800">Add Project</h2>
              <p className="text-xs text-gray-400 mt-0.5">Fill in the details to create a new project</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 cursor-pointer transition-colors">
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
            <div className="mx-6 mt-4 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 shrink-0">
              <TriangleAlert size={13} className="shrink-0 mt-0.5" /><span>{inlineError}</span>
            </div>
          )}

          {clientSuccessMsg && (
            <div className="mx-6 mt-4 flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-xl text-xs text-green-600 shrink-0">
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
                      className="flex items-center gap-1.5 px-4 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 transition-colors whitespace-nowrap cursor-pointer"
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
  const lbl = "block text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5";

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

// ── PROJECT DETAIL MODAL ──────────────────────────────────────────────
function ProjectDetailModal({ projectId, onClose, onEdit, onRefresh }) {
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [error, setError] = useState(null);
  const [taskFilter, setTaskFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const authHeaders = () => {
    const token = localStorage.getItem("admin_auth_token");
    return { Authorization: `Bearer ${token}`, "ngrok-skip-browser-warning": "true" };
  };

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true); setError(null);
      try {
        const headers = authHeaders();
        const res = await fetch(`${BASE}/api/admin/projects/${projectId}`, { headers });
        if (!res.ok) throw new Error(`Project load failed: ${res.status}`);
        const data = await res.json();
        setProject(data.data || data);
      } catch (err) { setError(err.message); }
      finally { setLoading(false); }
    };
    fetchAll();
  }, [projectId]);

  useEffect(() => {
    const fetchTasks = async () => {
      setTasksLoading(true);
      try {
        const headers = authHeaders();
        const res = await fetch(`${BASE}/api/admin/tasks`, { headers });
        const data = await res.json();
        const all = Array.isArray(data.data || data) ? (data.data || data) : [];
        const filtered = all.filter(t => {
          const pid = t.project_id || t.project?.id;
          return Number(pid) === Number(projectId);
        });
        setTasks(filtered);
      } catch (err) { console.error("Tasks load failed:", err); setTasks([]); }
      finally { setTasksLoading(false); }
    };
    fetchTasks();
  }, [projectId]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin text-orange-400" />
          <p className="text-xs text-white/70 font-medium">Loading project details…</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full text-center">
          <div className="w-14 h-14 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-3">
            <AlertTriangle size={24} className="text-rose-500" />
          </div>
          <h3 className="text-sm font-bold text-gray-900 mb-1">Failed to load</h3>
          <p className="text-xs text-gray-500 mb-4">{error || "Project not found"}</p>
          <button onClick={onClose} className="px-5 py-2 bg-orange-500 text-white text-sm font-semibold rounded-xl hover:bg-orange-600 cursor-pointer">Close</button>
        </div>
      </div>
    );
  }

  const totalTasks = tasks.length;
  const completed = tasks.filter(t => ["completed","done"].includes((t.status || "").toLowerCase())).length;
  const pending = tasks.filter(t => (t.status || "").toLowerCase() === "pending").length;
  const inProgress = tasks.filter(t => (t.status || "").toLowerCase() === "in_progress").length;
  const overdue = tasks.filter(t => isTaskOverdue(t)).length;
  const pct = totalTasks > 0 ? Math.round((completed / totalTasks) * 100) : 0;

  const priorityKey = (project.priority || "").toLowerCase();
  const priorityClass = priorityColors[priorityKey] || "bg-gray-100 text-gray-600 ring-1 ring-gray-200";
  const statusKey = (project.status || "").toLowerCase();
  const statusClass = statusColors[statusKey] || "bg-gray-100 text-gray-600 ring-1 ring-gray-200";

  const manager = project.project_manager;
  const leader = project.team_leader;
  const members = project.team_members || [];

  const getPersonName = (p) => {
    if (!p) return "—";
    if (typeof p === "string") return p;
    return p.firstname
      ? `${p.firstname} ${p.lastname || ""}`.trim()
      : (p.name || p.username || p.email || "—");
  };
  const getInitials = (n = "") => n.split(" ").map(x => x[0]).join("").slice(0,2).toUpperCase() || "?";

  const filteredTasks = tasks
    .filter(t => {
      if (taskFilter === "all") return true;
      const st = (t.status || "").toLowerCase();
      if (taskFilter === "overdue") return isTaskOverdue(t);
      return st === taskFilter;
    })
    .filter(t => !searchQuery || (t.title || "").toLowerCase().includes(searchQuery.toLowerCase()));

  const STATUS_TABS = [
    { key: "all",         label: "All",         count: totalTasks },
    { key: "pending",     label: "Pending",     count: pending },
    { key: "in_progress", label: "In Progress", count: inProgress },
    { key: "completed",   label: "Completed",   count: completed },
    { key: "overdue",     label: "Overdue",     count: overdue },
  ];

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden">

        <div className="relative shrink-0 px-6 py-5 border-b border-gray-100 bg-gradient-to-br from-orange-50/70 via-white to-white">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500" />

          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0 flex-1">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-lg font-black shrink-0 shadow-lg"
                style={{ background: `linear-gradient(135deg, ${getColor(project.id % palette.length)}, ${getColor((project.id+3) % palette.length)})` }}>
                {(project.project_name || "P")[0].toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-bold text-gray-900 leading-tight truncate">{project.project_name}</h2>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span className="text-[10px] font-mono text-orange-600 bg-orange-50 ring-1 ring-orange-100 px-2 py-0.5 rounded-md font-semibold">
                    {project.project_code}
                  </span>
                  {project.client?.company_name && (
                    <span className="flex items-center gap-1 text-[10px] text-gray-500 bg-gray-50 ring-1 ring-gray-100 px-2 py-0.5 rounded-md">
                      <Building2 size={9} /> {project.client.company_name}
                    </span>
                  )}
                  {project.priority && (
                    <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full capitalize ${priorityClass}`}>
                      <Flag size={9} className="inline mr-0.5 -mt-0.5" /> {project.priority}
                    </span>
                  )}
                  {project.status && (
                    <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full capitalize ${statusClass}`}>
                      <CircleDot size={9} className="inline mr-0.5 -mt-0.5" /> {project.status}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {onEdit && (
                <button onClick={() => { onClose(); onEdit(projectId); }}
                  title="Edit project"
                  className="w-9 h-9 flex items-center justify-center rounded-xl bg-white hover:bg-orange-50 text-gray-500 hover:text-orange-600 transition-colors cursor-pointer ring-1 ring-gray-100">
                  <PencilLine size={15} />
                </button>
              )}
              <button onClick={onClose}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-white hover:bg-gray-100 text-gray-500 transition-colors cursor-pointer ring-1 ring-gray-100">
                <X size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

          <div className="grid grid-cols-4 gap-2.5">
            <div className="bg-gradient-to-br from-sky-50 to-white ring-1 ring-sky-100 rounded-2xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <ListChecks size={12} className="text-sky-600" />
                <span className="text-[10px] font-bold text-sky-700 uppercase tracking-wider">Total</span>
              </div>
              <p className="text-xl font-black text-sky-700 leading-none">{totalTasks}</p>
              <p className="text-[9px] text-sky-500 mt-0.5">task{totalTasks !== 1 ? "s" : ""}</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-white ring-1 ring-emerald-100 rounded-2xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <CheckCheck size={12} className="text-emerald-600" />
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Done</span>
              </div>
              <p className="text-xl font-black text-emerald-700 leading-none">{completed}</p>
              <p className="text-[9px] text-emerald-500 mt-0.5">{pct}% complete</p>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-white ring-1 ring-amber-100 rounded-2xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Clock size={12} className="text-amber-600" />
                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Pending</span>
              </div>
              <p className="text-xl font-black text-amber-700 leading-none">{pending + inProgress}</p>
              <p className="text-[9px] text-amber-500 mt-0.5">{inProgress} active</p>
            </div>
            <div className={`bg-gradient-to-br rounded-2xl p-3 ring-1 ${overdue > 0 ? "from-rose-50 to-white ring-rose-100" : "from-gray-50 to-white ring-gray-100"}`}>
              <div className="flex items-center gap-1.5 mb-1">
                <AlertOctagon size={12} className={overdue > 0 ? "text-rose-600" : "text-gray-400"} />
                <span className={`text-[10px] font-bold uppercase tracking-wider ${overdue > 0 ? "text-rose-700" : "text-gray-500"}`}>Overdue</span>
              </div>
              <p className={`text-xl font-black leading-none ${overdue > 0 ? "text-rose-700" : "text-gray-500"}`}>{overdue}</p>
              <p className={`text-[9px] mt-0.5 ${overdue > 0 ? "text-rose-500" : "text-gray-400"}`}>{overdue > 0 ? "needs attention" : "all on track"}</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-2xl p-4 ring-1 ring-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider flex items-center gap-1.5">
                <Activity size={11} /> Overall Progress
              </span>
              <span className={`text-sm font-black tabular-nums ${pct === 100 ? "text-emerald-600" : "text-orange-600"}`}>
                {pct}%
              </span>
            </div>
            <div className="h-2.5 rounded-full bg-white ring-1 ring-gray-100 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${pct === 100 ? "bg-gradient-to-r from-emerald-400 to-emerald-600" : "bg-gradient-to-r from-orange-400 to-orange-600"}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2.5">Project Info</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-2xl p-3.5 ring-1 ring-gray-100">
                <div className="flex items-center gap-1.5 mb-1">
                  <CalendarDays size={11} className="text-gray-400" />
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Start Date</p>
                </div>
                <p className="text-sm font-semibold text-gray-800">{fmtDate(project.start_date)}</p>
              </div>
              <div className="bg-gray-50 rounded-2xl p-3.5 ring-1 ring-gray-100">
                <div className="flex items-center gap-1.5 mb-1">
                  <CalendarClock size={11} className="text-gray-400" />
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">End Date</p>
                </div>
                <p className="text-sm font-semibold text-gray-800">{fmtDate(project.end_date)}</p>
              </div>
              {project.creator?.name && (
                <div className="bg-gray-50 rounded-2xl p-3.5 ring-1 ring-gray-100">
                  <div className="flex items-center gap-1.5 mb-1">
                    <User size={11} className="text-gray-400" />
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Created By</p>
                  </div>
                  <p className="text-sm font-semibold text-gray-800 truncate">{project.creator.name}</p>
                </div>
              )}
              <div className="bg-gray-50 rounded-2xl p-3.5 ring-1 ring-gray-100">
                <div className="flex items-center gap-1.5 mb-1">
                  <Briefcase size={11} className="text-gray-400" />
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Type</p>
                </div>
                <p className="text-sm font-semibold text-gray-800 capitalize">{project.type || "Fixed"}</p>
              </div>
            </div>
          </div>

          {project.description && (
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <FileText size={10} /> Description
              </p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 rounded-2xl p-4 ring-1 ring-gray-100 leading-relaxed">
                {project.description}
              </p>
            </div>
          )}

          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
              <Users size={10} /> Team
            </p>
            <div className="grid grid-cols-2 gap-3 mb-3">
              {manager && (
                <div className="flex items-center gap-2.5 bg-gradient-to-br from-emerald-50 to-white rounded-2xl p-3 ring-1 ring-emerald-100">
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-bold ring-2 ring-white shadow-sm">
                      {getInitials(getPersonName(manager))}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-white rounded-full flex items-center justify-center ring-2 ring-emerald-100">
                      <UserRoundCog size={9} className="text-emerald-600" />
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider">Project Manager</p>
                    <p className="text-xs font-bold text-gray-800 truncate">{getPersonName(manager)}</p>
                    {manager.employee_id && <p className="text-[9px] font-mono text-gray-400">{manager.employee_id}</p>}
                  </div>
                </div>
              )}
              {leader && (
                <div className="flex items-center gap-2.5 bg-gradient-to-br from-sky-50 to-white rounded-2xl p-3 ring-1 ring-sky-100">
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-full bg-sky-500 flex items-center justify-center text-white text-xs font-bold ring-2 ring-white shadow-sm">
                      {getInitials(getPersonName(leader))}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-white rounded-full flex items-center justify-center ring-2 ring-sky-100">
                      <Crown size={9} className="text-sky-600" />
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] font-bold text-sky-600 uppercase tracking-wider">Team Leader</p>
                    <p className="text-xs font-bold text-gray-800 truncate">{getPersonName(leader)}</p>
                    {leader.employee_id && <p className="text-[9px] font-mono text-gray-400">{leader.employee_id}</p>}
                  </div>
                </div>
              )}
            </div>

            {members.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Users size={10} className="text-orange-500" />
                  <p className="text-[10px] font-bold text-orange-600 uppercase tracking-wider">Team Members</p>
                  <span className="text-[9px] font-bold bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded-full ring-1 ring-orange-100">
                    {members.length}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {members.map((m, i) => {
                    const name = getPersonName(m);
                    return (
                      <span key={m.id || i} className="inline-flex items-center gap-1.5 bg-white ring-1 ring-gray-100 rounded-full pl-0.5 pr-2.5 py-0.5 shadow-sm">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold" style={{ backgroundColor: getColor(i) }}>
                          {getInitials(name)}
                        </div>
                        <span className="text-[10px] font-semibold text-gray-700">{name}</span>
                        {m.employee_id && <span className="text-[9px] font-mono text-gray-400">{m.employee_id}</span>}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-gray-100 pt-4">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                <ListChecks size={11} /> Tasks
                <span className="text-[9px] font-bold bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">{totalTasks}</span>
              </p>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 bg-gray-100 rounded-lg px-2.5 py-1">
                  <Search size={11} className="text-gray-400" />
                  <input
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search tasks…"
                    className="bg-transparent border-none outline-none text-[11px] text-gray-700 w-28"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery("")} className="cursor-pointer">
                      <X size={10} className="text-gray-400 hover:text-gray-600" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 mb-3 overflow-x-auto">
              {STATUS_TABS.map(({ key, label, count }) => {
                const active = taskFilter === key;
                return (
                  <button key={key} onClick={() => setTaskFilter(key)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap cursor-pointer
                      ${active ? "bg-white shadow-sm text-gray-800" : "text-gray-500 hover:text-gray-700"}`}>
                    {label}
                    {count > 0 && (
                      <span className={`text-[9px] font-bold px-1.5 py-px rounded-full ${active ? "bg-orange-100 text-orange-600" : "bg-gray-200 text-gray-500"}`}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {tasksLoading ? (
              <div className="flex items-center justify-center gap-2 py-8 text-gray-400">
                <Loader2 size={16} className="animate-spin text-orange-400" />
                <span className="text-xs">Loading tasks…</span>
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center mx-auto mb-2 ring-1 ring-gray-100">
                  <ListChecks size={16} className="text-gray-300" />
                </div>
                <p className="text-xs font-semibold text-gray-500">
                  {totalTasks === 0 ? "No tasks yet" : "No tasks match your filters"}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {totalTasks === 0 ? "Tasks will appear here once added to this project" : "Try a different filter or search"}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredTasks.map((task) => {
                  const isDone = ["completed","done"].includes((task.status || "").toLowerCase());
                  const isOverdue = isTaskOverdue(task);
                  const assignees = task.assignees || [];

                  return (
                    <div key={task.id}
                      className={`flex items-center gap-3 p-3 rounded-2xl ring-1 transition-all
                        ${isOverdue ? "bg-gradient-to-r from-rose-50/60 to-white ring-rose-100"
                          : isDone ? "bg-gradient-to-r from-emerald-50/50 to-white ring-emerald-100"
                          : "bg-white ring-gray-100 hover:ring-orange-200"}`}>

                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ring-1
                        ${isDone ? "bg-emerald-100 ring-emerald-200" : isOverdue ? "bg-rose-100 ring-rose-200" : "bg-gray-50 ring-gray-200"}`}>
                        {isDone ? <CheckCheck size={14} className="text-emerald-600" /> :
                         isOverdue ? <AlertOctagon size={14} className="text-rose-600" /> :
                         <FileText size={14} className="text-gray-500" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className={`text-xs font-bold truncate ${isDone ? "line-through text-gray-400" : "text-gray-800"}`}>
                            {task.title}
                          </p>
                          {task.priority && (
                            <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${priorityColors[task.priority.toLowerCase()] || "bg-gray-100 text-gray-500"}`}>
                              {task.priority}
                            </span>
                          )}
                          {isOverdue && (
                            <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-rose-500 text-white">
                              Overdue
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          {task.due_date && (
                            <span className={`text-[10px] font-medium flex items-center gap-1 ${isOverdue ? "text-rose-600" : "text-gray-400"}`}>
                              <CalendarClock size={9} /> {fmtDate(task.due_date)}
                            </span>
                          )}
                          {assignees.length > 0 && (
                            <span className="text-[10px] text-gray-400 flex items-center gap-1">
                              <Users size={9} /> {assignees.length}
                            </span>
                          )}
                          {task.status && (
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full capitalize ${statusColors[task.status] || "bg-gray-100 text-gray-500"}`}>
                              • {task.status.replace("_", " ")}
                            </span>
                          )}
                        </div>
                      </div>

                      {assignees.length > 0 && (
                        <div className="flex -space-x-1.5 shrink-0">
                          {assignees.slice(0, 3).map((a, j) => {
                            const nm = `${a.firstname || ""} ${a.lastname || ""}`.trim() || a.email || "?";
                            return (
                              <div key={a.id || j} title={nm}
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold ring-2 ring-white`}
                                style={{ backgroundColor: getColor((task.id || 0) + j) }}>
                                {getInitials(nm)}
                              </div>
                            );
                          })}
                          {assignees.length > 3 && (
                            <div className="w-6 h-6 rounded-full bg-gray-200 text-gray-600 text-[9px] font-bold flex items-center justify-center ring-2 ring-white">
                              +{assignees.length - 3}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/60 shrink-0">
          <div className="text-[11px] text-gray-400 font-medium flex items-center gap-1.5">
            <Info size={11} />
            Showing {filteredTasks.length} of {totalTasks} task{totalTasks !== 1 ? "s" : ""}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onRefresh} className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-600 bg-white ring-1 ring-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer">
              <RefreshCw size={11} /> Refresh
            </button>
            <button onClick={onClose} className="px-5 py-2 text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-xl transition-colors cursor-pointer">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── MAIN ProjectsGrid ─────────────────────────────────────────────────
export default function ProjectsGrid() {
  const [visible, setVisible] = useState(12);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
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

      const [projRes, taskRes] = await Promise.all([
        fetch(`${BASE}/api/admin/projects`, { headers }),
        fetch(`${BASE}/api/admin/tasks`, { headers }).catch(() => null),
      ]);

      if (!projRes.ok) throw new Error(`Projects API error: ${projRes.status}`);
      const data = await projRes.json();
      const raw = Array.isArray(data) ? data : data.data || [];

      let allTasks = [];
      if (taskRes && taskRes.ok) {
        try {
          const td = await taskRes.json();
          allTasks = Array.isArray(td.data || td) ? (td.data || td) : [];
        } catch {}
      }
      const taskMap = {};
      allTasks.forEach(t => {
        const pid = t.project_id || t.project?.id;
        if (!taskMap[pid]) taskMap[pid] = [];
        taskMap[pid].push(t);
      });

      setProjects(raw.map(p => {
        const projTasks = taskMap[p.id] || [];
        const total = projTasks.length;
        const done = projTasks.filter(t => ["completed","done"].includes((t.status || "").toLowerCase())).length;
        const pend = projTasks.filter(t => (t.status || "").toLowerCase() === "pending").length;
        const inProg = projTasks.filter(t => (t.status || "").toLowerCase() === "in_progress").length;
        const over = projTasks.filter(t => isTaskOverdue(t)).length;
        const pctDone = total > 0 ? Math.round((done / total) * 100) : 0;

        const pm = p.project_manager;
        const tl = p.team_leader;
        const getPersonName = (person) => {
          if (!person) return null;
          if (typeof person === "string") return person;
          return person.firstname
            ? `${person.firstname} ${person.lastname || ""}`.trim()
            : (person.name || person.username || person.email || null);
        };

        return {
          id: p.id,
          title: p.project_name || p.name,
          desc: p.description || "No description",
          leader: p.creator?.name || "Unassigned",
          leaderRole: "Project Creator",
          deadline: p.end_date || "TBD",
          startDate: p.start_date || null,
          priority: p.priority || null,
          status: p.status || null,
          clientName: p.client?.company_name || null,
          projectManagerName: getPersonName(pm),
          teamLeaderName: getPersonName(tl),
          tasks: total,
          tasksDone: done,
          tasksPending: pend,
          tasksInProgress: inProg,
          tasksOverdue: over,
          tasksPct: pctDone,
          raw: p
        };
      }));
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

  const openDetail = (id) => {
    setSelectedProjectId(id);
    setShowDetailModal(true);
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
          const memberAvatars = p.raw?.team_members?.slice(0,3).map(m => {
            const n = m?.firstname ? `${m.firstname} ${m.lastname || ""}`.trim() : (m?.name || "");
            return n.charAt(0);
          }).filter(c => c !== "");
          const avatars = memberAvatars && memberAvatars.length > 0 ? memberAvatars : [initials];
          const isMenuOpen = openMenuId === p.id;

          return (
            <div
              key={p.id}
              onClick={() => openDetail(p.id)}
              className={`group bg-white rounded-2xl border shadow-sm hover:shadow-lg hover:-translate-y-0.5 p-4 flex flex-col gap-3 transition-all cursor-pointer relative overflow-hidden
                ${p.tasksOverdue > 0 ? "border-rose-100 hover:border-rose-200" : "border-gray-100 hover:border-orange-200"}`}
            >
              {p.tasksOverdue > 0 && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-rose-300" />
              )}

              <div className="flex justify-between items-start">
                <h3 className="text-sm font-bold text-black leading-tight flex-1 pr-2 truncate">{p.title}</h3>
                <div className="relative shrink-0" ref={isMenuOpen ? menuRef : null}>
                  <button
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={(e) => { e.stopPropagation(); setOpenMenuId(isMenuOpen ? null : p.id); }}>
                    <Ellipsis size={15} />
                  </button>
                  {isMenuOpen && (
                    <div className="absolute right-0 top-8 flex flex-col bg-white border border-gray-200 rounded-xl shadow-lg z-20 w-36 overflow-hidden py-1">
                      <button onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); openDetail(p.id); }}
                        className="text-left px-3 py-2 text-xs hover:bg-gray-50 flex items-center gap-2 text-gray-700 cursor-pointer transition-colors">
                        <ScanEye size={13} className="text-gray-500" /> View
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); setSelectedProjectId(p.id); setShowEditModal(true); }}
                        className="text-left px-3 py-2 text-xs hover:bg-gray-50 flex items-center gap-2 text-gray-700 cursor-pointer transition-colors">
                        <PencilLine size={13} className="text-gray-500" /> Edit
                      </button>
                      <div className="my-1 border-t border-gray-100" />
                      <button onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); setConfirmDelete(p); }}
                        className="text-left px-3 py-2 text-xs hover:bg-red-50 text-red-500 flex items-center gap-2 cursor-pointer transition-colors">
                        <Trash2 size={13} /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                {p.priority && (
                  <span className={`text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded ${priorityColors[p.priority] || "bg-gray-100 text-gray-500"}`}>
                    {p.priority}
                  </span>
                )}
                {p.status && (
                  <span className={`text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full ${statusColors[p.status] || "bg-gray-100 text-gray-500"}`}>
                    • {p.status}
                  </span>
                )}
                {p.tasksOverdue > 0 && (
                  <span className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-rose-500 text-white flex items-center gap-0.5">
                    <AlertOctagon size={8} /> {p.tasksOverdue}
                  </span>
                )}
              </div>

              <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">{p.desc}</p>

              <div className="grid grid-cols-3 gap-1.5 mt-1">
                <div className="bg-sky-50 rounded-lg p-1.5 text-center">
                  <p className="text-[13px] font-extrabold text-sky-700 leading-none">{p.tasks}</p>
                  <p className="text-[8px] text-sky-500 font-bold uppercase tracking-wider mt-0.5">Total</p>
                </div>
                <div className="bg-emerald-50 rounded-lg p-1.5 text-center">
                  <p className="text-[13px] font-extrabold text-emerald-700 leading-none">{p.tasksDone}</p>
                  <p className="text-[8px] text-emerald-500 font-bold uppercase tracking-wider mt-0.5">Done</p>
                </div>
                <div className="bg-amber-50 rounded-lg p-1.5 text-center">
                  <p className="text-[13px] font-extrabold text-amber-700 leading-none">{p.tasksPending + p.tasksInProgress}</p>
                  <p className="text-[8px] text-amber-500 font-bold uppercase tracking-wider mt-0.5">Active</p>
                </div>
              </div>

              {p.tasks > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${p.tasksPct === 100 ? "bg-emerald-500" : "bg-orange-500"}`}
                      style={{ width: `${p.tasksPct}%` }}
                    />
                  </div>
                  <span className={`text-[10px] font-bold tabular-nums ${p.tasksPct === 100 ? "text-emerald-600" : "text-orange-600"}`}>
                    {p.tasksPct}%
                  </span>
                </div>
              )}

              {(p.projectManagerName || p.teamLeaderName) && (
                <div className="space-y-1 border-t border-gray-100 pt-2">
                  {p.projectManagerName && (
                    <div className="flex items-center gap-1.5 text-[10px]">
                      <UserRoundCog size={10} className="text-emerald-500 shrink-0" />
                      <span className="text-gray-400 shrink-0">Manager</span>
                      <span className="font-semibold text-gray-700 truncate ml-auto" title={p.projectManagerName}>
                        {p.projectManagerName}
                      </span>
                    </div>
                  )}
                  {p.teamLeaderName && (
                    <div className="flex items-center gap-1.5 text-[10px]">
                      <Crown size={10} className="text-sky-500 shrink-0" />
                      <span className="text-gray-400 shrink-0">Lead</span>
                      <span className="font-semibold text-gray-700 truncate ml-auto" title={p.teamLeaderName}>
                        {p.teamLeaderName}
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-between items-center mt-auto pt-2 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <Avatar initials={initials} color={getColor(i)} size="w-7 h-7" />
                  <div>
                    <p className="text-xs font-semibold text-black truncate max-w-[90px]">{p.leader}</p>
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
                  <Eye size={11} className="text-gray-400 group-hover:text-orange-500 transition-colors" />
                  <span className="group-hover:text-orange-500 transition-colors font-semibold">Click for details</span>
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

      <div className="fixed bottom-6 right-6 z-40">
        <button onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-orange-500 text-white px-4 py-3 rounded-2xl shadow-lg hover:bg-orange-600 transition-colors cursor-pointer text-sm font-semibold">
          <FolderUp size={18} /> New Project
        </button>
      </div>

      {showAddModal && <AddProjectModal onClose={() => setShowAddModal(false)} onSuccess={(msg) => { fetchProjects(); setSuccessMsg(msg); }} />}
      {showEditModal && <EditProjectModal projectId={selectedProjectId} onClose={() => setShowEditModal(false)} onSuccess={(msg) => { fetchProjects(); setSuccessMsg(msg); }} />}

      {showDetailModal && selectedProjectId && (
        <ProjectDetailModal
          projectId={selectedProjectId}
          onClose={() => setShowDetailModal(false)}
          onEdit={(id) => { setSelectedProjectId(id); setShowEditModal(true); }}
          onRefresh={fetchProjects}
        />
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setConfirmDelete(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 z-10 p-6 flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <Trash2 size={24} className="text-red-500" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">Delete Project</h3>
            <p className="text-sm text-gray-500 mb-1">Are you sure you want to delete</p>
            <p className="text-sm font-semibold text-gray-800 mb-2">"{confirmDelete.title}"?</p>
            <p className="text-xs text-red-500 mb-6">This action cannot be undone.</p>
            <div className="flex gap-3 w-full">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition cursor-pointer">Cancel</button>
              <button onClick={handleDeleteConfirmed} disabled={deleting}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-xl transition disabled:opacity-60 cursor-pointer">
                {deleting ? <><Loader2 size={14} className="animate-spin" />Deleting…</> : <><Trash2 size={14} />Delete</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {successMsg && <SuccessModal message={successMsg} onClose={() => setSuccessMsg(null)} />}
      {errorMsg && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setErrorMsg(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 z-10 p-8 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <AlertTriangle size={32} className="text-red-500" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">Error</h3>
            <p className="text-sm text-gray-500 mb-5">{errorMsg}</p>
            <button onClick={() => setErrorMsg(null)} className="px-6 py-2 text-xs font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg transition cursor-pointer">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ⭐ FIXED: Removed ViewProjectModal (no longer exists) — only export the two still-used modals
export { AddProjectModal, EditProjectModal };