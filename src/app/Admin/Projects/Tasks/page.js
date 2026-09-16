"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { Plus, RefreshCw, Star, Calendar, ChevronDown, CheckSquare, Square, X, Search, Loader2, CircleCheck, AlertTriangle, Building2, Hash, FileText, Users, UserRoundCog, Crown, Tag as TagIcon, RotateCw, UserPlus, MapPin, BadgeCheck, CreditCard, Trash2, PencilLine, ScanEye, Ellipsis, FolderUp, ArrowRight, CheckCheck, CalendarDays } from "lucide-react";
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
const AVATAR_COLORS = ["#6366f1","#f97316","#14b8a6","#ec4899","#22c55e","#a855f7","#3b82f6","#eab308"];
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

// ── CLIENT MODAL (For adding client inline) ─────────────────────────────────
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

// ── ADD TASK MODAL (UPDATED WITH ADD PROJECT BUTTON) ─────────────────────────────────────────────────
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
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [projectSuccessMsg, setProjectSuccessMsg] = useState(null);

  const isFormValid =
    title.trim() !== "" &&
    projectId !== "" &&
    dueDate !== "" &&
    priority !== "" &&
    assignees.length > 0;

  useEffect(() => {
    fetchProjects();
  }, []);

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
        setEmployees(d.map(emp => ({
          id: emp.id,
          name: emp.firstname ? `${emp.firstname} ${emp.lastname || ""}`.trim() : (emp.name || emp.username || emp.email),
        })));
      } catch (e) { console.error(e); } finally { setLoadingEmployees(false); }
    })();
  }, []);

  const handleProjectAdded = () => {
    fetchProjects();
    setProjectSuccessMsg("Project created successfully!");
    setTimeout(() => setProjectSuccessMsg(null), 2500);
  };

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
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-lg font-bold text-black">Add New Task</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700"><X size={20} /></button>
          </div>

          {projectSuccessMsg && (
            <div className="mx-4 mt-2 flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-xl text-xs text-green-600 shrink-0">
              <CircleCheck size={13} className="shrink-0 mt-0.5" /><span>{projectSuccessMsg}</span>
            </div>
          )}

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
              <div className="flex gap-2">
                <div className="flex-1">
                  <select 
                    value={projectId} 
                    onChange={e => setProjectId(e.target.value)} 
                    disabled={loadingProjects}
                    className="w-full p-2 border border-gray-200 rounded-lg text-sm text-black bg-white cursor-pointer"
                  >
                    <option value="">{loadingProjects ? "Loading..." : "Select a project"}</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.project_name} ({p.project_code})</option>)}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddProjectModal(true)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-orange-500 text-white rounded-lg text-sm font-semibold hover:bg-orange-600 transition-colors whitespace-nowrap cursor-pointer"
                >
                  <Plus size={14} /> Add Project
                </button>
              </div>
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
                className="w-full p-2 border border-gray-200 rounded-lg text-sm text-black bg-white cursor-pointer">
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
              <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50 transition cursor-pointer">Cancel</button>
              <button type="submit" disabled={submitting || !isFormValid}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-semibold hover:bg-orange-600 disabled:opacity-50 transition cursor-pointer">
                {submitting ? "Creating..." : "Add New Task"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {showAddProjectModal && (
        <div className="fixed inset-0 z-[100]">
          <AddProjectModal
            onClose={() => setShowAddProjectModal(false)}
            onSuccess={(msg) => {
              handleProjectAdded();
              setShowAddProjectModal(false);
            }}
          />
        </div>
      )}
    </>
  );
}

// ── Completion Modal Component ─────────────────────────────────────────────────
function CompletionModal({ taskTitle, onClose }) {
  useEffect(() => {
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

// ── Normalize task ─────────────────────────────────────────────────────────────
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

// ── Normalize project ─────────────────────────────────────────────────────────────
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

// ── Main TasksPage ─────────────────────────────────────────────────────────────
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

          {selected && (
            <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-y-auto p-5">
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