"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  Users, UserCheck, UserX, UserPlus, Search, Plus, Pencil, Trash2,
  X, ChevronDown, AlertTriangle, RefreshCw, Loader2,
  TrendingUp, Download, ChevronLeft, ChevronRight, ArrowUpDown,
  Building2, MapPin, FileText, CreditCard, BadgeCheck, CheckCircle,
  FolderOpen, ListChecks, Clock, CheckCheck, AlertOctagon, Flag,
  CircleDot, Activity, ChevronRight as ChevronRightIcon, Info,
  Lock, Eye, CalendarDays, CalendarClock, Sparkles, Layers, Target
} from "lucide-react";

// ── Constants ─────────────────────────────────────────────────────────
const BASE = process.env.NEXT_PUBLIC_API_URL;
const AVATAR_COLORS = ["#6366f1","#f97316","#14b8a6","#ec4899","#22c55e","#a855f7","#3b82f6","#eab308"];

const getAuthHeaders = () => {
  const token = typeof window !== "undefined" ? localStorage.getItem("admin_auth_token") : null;
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    "ngrok-skip-browser-warning": "true",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const getInitials = (name = "") =>
  name.split(" ").filter(Boolean).map(w => w[0]).join("").slice(0, 2).toUpperCase() || "??";

const getFullName = (c) =>
  c.contact_person || c.company_name || [c.firstname, c.lastname].filter(Boolean).join(" ") || "Unknown";

// ── Priority / Status styling ─────────────────────────────────────────
const priorityColors = {
  high:   "bg-rose-50 text-rose-600 ring-1 ring-rose-100",
  medium: "bg-amber-50 text-amber-600 ring-1 ring-amber-100",
  low:    "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100",
  urgent: "bg-violet-50 text-violet-600 ring-1 ring-violet-100",
};

const statusColors = {
  planning:    "bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100",
  in_progress: "bg-sky-50 text-sky-600 ring-1 ring-sky-100",
  completed:   "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100",
  onhold:      "bg-amber-50 text-amber-600 ring-1 ring-amber-100",
  pending:     "bg-orange-50 text-orange-600 ring-1 ring-orange-100",
  overdue:     "bg-rose-50 text-rose-600 ring-1 ring-rose-100",
};

// ── Shared styles ─────────────────────────────────────────────────────
const inputCls  = "w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition text-gray-800 bg-white placeholder:text-gray-400";
const selectCls = "w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 appearance-none bg-white transition text-gray-700";
const labelCls  = "block text-xs font-semibold text-gray-600 mb-1.5";

// ── Modal tabs ────────────────────────────────────────────────────────
const TABS = [
  { key: "basic",   label: "Basic Info",     Icon: Building2  },
  { key: "address", label: "Address",        Icon: MapPin     },
  { key: "tax",     label: "Tax & Business", Icon: BadgeCheck },
  { key: "billing", label: "Billing",        Icon: CreditCard },
  { key: "notes",   label: "Notes & Status", Icon: FileText   },
];

const BLANK_FORM = {
  client_code: "", company_name: "", contact_person: "", email: "",
  phone: "", alternative_phone: "",
  address: "", city: "", state: "", zip_code: "", country: "India",
  gst_number: "", pan_number: "",
  payment_terms: "net_30", credit_limit: "",
  notes: "", status: "active",
};

// ── SUCCESS MODAL ─────────────────────────────────────────────────────
function SuccessModal({ message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 2500);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
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
        <button onClick={onClose} className="mt-4 px-6 py-2 text-xs font-semibold text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
          Close
        </button>
      </div>
    </div>
  );
}

// ── ADD / EDIT CLIENT MODAL ───────────────────────────────────────────
function ClientModal({ client, onClose, onSuccess }) {
  const isEdit = !!client;
  const [tab,            setTab]            = useState("basic");
  const [saving,         setSaving]         = useState(false);
  const [saveError,      setSaveError]      = useState(null);
  const [codeChecking,   setCodeChecking]   = useState(false);
  const [codeError,      setCodeError]      = useState(null);
  const [generatingCode, setGeneratingCode] = useState(false);
  const debounceTimer = useRef(null);

  const [form, setForm] = useState(isEdit ? {
    client_code:       client.client_code       || "",
    company_name:      client.company_name      || "",
    contact_person:    client.contact_person    || "",
    email:             client.email             || "",
    phone:             client.phone             || "",
    alternative_phone: client.alternative_phone || "",
    address:           client.address           || "",
    city:              client.city              || "",
    state:             client.state             || "",
    zip_code:          client.zip_code          || "",
    country:           client.country           || "India",
    gst_number:        client.gst_number        || "",
    pan_number:        client.pan_number        || "",
    payment_terms:     client.payment_terms     || "net_30",
    credit_limit:      client.credit_limit      || "",
    notes:             client.notes             || "",
    status:            client.status            || "active",
  } : { ...BLANK_FORM });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  useEffect(() => {
    if (isEdit) return;
    const autoGenCode = async () => {
      setGeneratingCode(true);
      try {
        const res  = await fetch(`${BASE}/api/admin/clients/next-code`, { headers: getAuthHeaders() });
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
      const res  = await fetch(`${BASE}/api/admin/clients/check-code`, {
        method: "POST", headers: getAuthHeaders(),
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
      const url     = isEdit ? `${BASE}/api/admin/clients/${client.id}` : `${BASE}/api/admin/clients`;
      const method  = isEdit ? "PUT" : "POST";
      const payload = { ...form, credit_limit: form.credit_limit ? Number(form.credit_limit) : null };
      const res     = await fetch(url, { method, headers: getAuthHeaders(), body: JSON.stringify(payload) });
      const data    = await res.json();
      if (!res.ok) throw new Error(data?.message || (data?.errors ? Object.values(data.errors).flat().join(" • ") : `Error ${res.status}`));
      onSuccess?.(data, isEdit ? "Client updated successfully!" : "Client created successfully!");
      onClose();
    } catch (err) { setSaveError(err.message || "Failed to save."); }
    finally { setSaving(false); }
  };

  const currentTabIdx = TABS.findIndex(t => t.key === tab);

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
                <select value={form.payment_terms} onChange={e => set("payment_terms", e.target.value)} className={selectCls}>
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
                ["Net 15",    "Due in 15 days"],
                ["Net 30",    "Due in 30 days"],
                ["Net 45",    "Due in 45 days"],
                ["Net 60",    "Due in 60 days"],
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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 z-10 flex flex-col max-h-[92vh]">

        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-base font-bold text-gray-900">
              {isEdit ? `Edit Client — ${getFullName(client)}` : "Add New Client"}
            </h2>
            <p className="text-[11px] text-gray-400 mt-0.5">
              {isEdit ? "Update client information below" : "Fill in the details to create a new client"}
            </p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition">
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
            <button onClick={onClose}
              className="px-5 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100 transition">
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving || !isValid() || codeChecking || generatingCode}
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed">
              {saving
                ? <><Loader2 size={14} className="animate-spin" />{isEdit ? "Updating…" : "Saving…"}</>
                : isEdit
                  ? <><Pencil size={14} />Update Client</>
                  : <><Plus size={14} />Save Client</>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── DELETE CONFIRM MODAL ──────────────────────────────────────────────
function DeleteConfirmModal({ client, onClose, onSuccess }) {
  const [deleting, setDeleting] = useState(false);
  const [error,    setError]    = useState(null);

  const handleDelete = async () => {
    setDeleting(true); setError(null);
    try {
      const res  = await fetch(`${BASE}/api/admin/clients/${client.id}`, { method: "DELETE", headers: getAuthHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || `Error ${res.status}`);
      onSuccess?.("Client deleted successfully!");
      onClose();
    } catch (err) { setError(err.message || "Failed to delete."); }
    finally { setDeleting(false); }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 z-10 p-6">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <Trash2 size={22} className="text-red-500" />
        </div>
        <h3 className="text-base font-bold text-gray-900 text-center mb-1">Delete Client</h3>
        <p className="text-sm text-gray-500 text-center mb-1">Are you sure you want to delete</p>
        <p className="text-sm font-semibold text-gray-800 text-center mb-4">
          {getFullName(client)}{" "}
          <span className="text-gray-400 font-normal">({client.client_code || client.id})</span>
        </p>
        <p className="text-xs text-red-500 text-center mb-5">This action cannot be undone.</p>
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 mb-4">
            <AlertTriangle size={13} /><span>{error}</span>
          </div>
        )}
        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition">
            Cancel
          </button>
          <button onClick={handleDelete} disabled={deleting}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-xl transition disabled:opacity-60">
            {deleting ? <><Loader2 size={14} className="animate-spin" />Deleting…</> : <><Trash2 size={14} />Delete</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── SKELETON ROW ──────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="border-b border-gray-100 animate-pulse">
      <td className="px-4 py-3"><div className="w-4 h-4 bg-gray-200 rounded" /></td>
      <td className="px-4 py-3"><div className="h-3 w-16 bg-gray-200 rounded" /></td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0" />
          <div className="space-y-1">
            <div className="h-3 w-24 bg-gray-200 rounded" />
            <div className="h-2 w-14 bg-gray-100 rounded" />
          </div>
        </div>
      </td>
      <td className="px-4 py-3"><div className="h-3 w-20 bg-gray-200 rounded" /></td>
      <td className="px-4 py-3"><div className="h-3 w-28 bg-gray-200 rounded" /></td>
      <td className="px-4 py-3"><div className="h-3 w-20 bg-gray-200 rounded" /></td>
      <td className="px-4 py-3"><div className="h-6 w-16 bg-gray-100 rounded-full" /></td>
      <td className="px-4 py-3"><div className="h-5 w-14 bg-gray-200 rounded-full" /></td>
      <td className="px-4 py-3"><div className="h-5 w-14 bg-gray-100 rounded" /></td>
    </tr>
  );
}

// ── EXPANDED ROW — PROJECTS + TASKS BREAKDOWN ────────────────────────
function ExpandedProjects({ client }) {
  const projects = client.projects || [];
  const stats    = client.stats || {};

  if (projects.length === 0) {
    return (
      <div className="px-6 py-6 bg-gradient-to-br from-gray-50 to-white">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center mx-auto mb-3 ring-1 ring-gray-100">
            <FolderOpen size={22} className="text-gray-300" />
          </div>
          <p className="text-xs font-semibold text-gray-500">No projects yet</p>
          <p className="text-[10px] text-gray-400 mt-0.5">This client doesn't have any projects assigned.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-5 bg-gradient-to-br from-orange-50/40 via-white to-white">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-xl bg-orange-500 flex items-center justify-center shadow-sm shadow-orange-200">
          <Layers size={14} className="text-white" />
        </div>
        <div>
          <p className="text-xs font-bold text-gray-800">
            Projects & Task Breakdown
          </p>
          <p className="text-[10px] text-gray-400">
            {stats.total_projects} project{stats.total_projects !== 1 ? "s" : ""} · {stats.total_tasks} task{stats.total_tasks !== 1 ? "s" : ""} total
          </p>
        </div>

        {/* Overall progress pill */}
        <div className="ml-auto flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full ring-1 ${
            stats.overall_progress === 100
              ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
              : "bg-orange-50 text-orange-700 ring-orange-200"
          }`}>
            <Target size={10} />
            {stats.overall_progress}% overall
          </span>
        </div>
      </div>

      {/* Aggregate stat strip */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <div className="bg-white rounded-xl p-2.5 ring-1 ring-gray-100">
          <div className="flex items-center gap-1 mb-0.5">
            <ListChecks size={10} className="text-sky-600" />
            <span className="text-[9px] font-bold text-sky-700 uppercase tracking-wider">Total</span>
          </div>
          <p className="text-sm font-black text-sky-700 leading-none">{stats.total_tasks}</p>
        </div>
        <div className="bg-white rounded-xl p-2.5 ring-1 ring-gray-100">
          <div className="flex items-center gap-1 mb-0.5">
            <CheckCheck size={10} className="text-emerald-600" />
            <span className="text-[9px] font-bold text-emerald-700 uppercase tracking-wider">Done</span>
          </div>
          <p className="text-sm font-black text-emerald-700 leading-none">{stats.completed_tasks}</p>
        </div>
        <div className="bg-white rounded-xl p-2.5 ring-1 ring-gray-100">
          <div className="flex items-center gap-1 mb-0.5">
            <Clock size={10} className="text-amber-600" />
            <span className="text-[9px] font-bold text-amber-700 uppercase tracking-wider">Active</span>
          </div>
          <p className="text-sm font-black text-amber-700 leading-none">
            {stats.pending_tasks + stats.in_progress_tasks}
          </p>
        </div>
        <div className={`bg-white rounded-xl p-2.5 ring-1 ${stats.overdue_tasks > 0 ? "ring-rose-200" : "ring-gray-100"}`}>
          <div className="flex items-center gap-1 mb-0.5">
            <AlertOctagon size={10} className={stats.overdue_tasks > 0 ? "text-rose-600" : "text-gray-400"} />
            <span className={`text-[9px] font-bold uppercase tracking-wider ${stats.overdue_tasks > 0 ? "text-rose-700" : "text-gray-500"}`}>Overdue</span>
          </div>
          <p className={`text-sm font-black leading-none ${stats.overdue_tasks > 0 ? "text-rose-700" : "text-gray-500"}`}>
            {stats.overdue_tasks}
          </p>
        </div>
      </div>

      {/* Projects list */}
      <div className="space-y-2">
        {projects.map((p, i) => {
          const ts = p.task_stats || {};
          const statusKey = (p.status || "").toLowerCase();
          const priorityKey = (p.priority || "").toLowerCase();

          return (
            <div key={p.id || i}
              className="bg-white rounded-xl ring-1 ring-gray-100 hover:ring-orange-200 transition-all p-3.5">
              <div className="flex items-start gap-3">
                {/* Project badge */}
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-black shrink-0 shadow-sm"
                  style={{ backgroundColor: AVATAR_COLORS[i % AVATAR_COLORS.length] }}>
                  {(p.project_name || "P")[0].toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                  {/* Title + badges */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-xs font-bold text-gray-800 truncate">{p.project_name}</p>
                    <span className="text-[9px] font-mono text-orange-600 bg-orange-50 ring-1 ring-orange-100 px-1.5 py-0.5 rounded">
                      {p.project_code}
                    </span>
                    {p.priority && (
                      <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded capitalize ${priorityColors[priorityKey] || "bg-gray-100 text-gray-500"}`}>
                        <Flag size={8} className="inline -mt-px mr-0.5" />
                        {p.priority}
                      </span>
                    )}
                    {p.status && (
                      <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full capitalize ${statusColors[statusKey] || "bg-gray-100 text-gray-500"}`}>
                        <CircleDot size={8} className="inline -mt-px mr-0.5" />
                        {p.status}
                      </span>
                    )}
                  </div>

                  {/* Dates row */}
                  {(p.start_date || p.end_date) && (
                    <div className="flex items-center gap-3 mt-1 text-[10px] text-gray-400">
                      {p.start_date && (
                        <span className="flex items-center gap-1">
                          <CalendarDays size={9} /> {p.start_date}
                        </span>
                      )}
                      {p.end_date && (
                        <span className="flex items-center gap-1">
                          <CalendarClock size={9} /> {p.end_date}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Task stats strip */}
                  <div className="grid grid-cols-5 gap-1.5 mt-2.5">
                    <div className="bg-sky-50 rounded-lg px-1.5 py-1 text-center">
                      <p className="text-[11px] font-black text-sky-700 leading-none">{ts.total ?? 0}</p>
                      <p className="text-[8px] text-sky-500 font-bold uppercase tracking-wider mt-0.5">Total</p>
                    </div>
                    <div className="bg-emerald-50 rounded-lg px-1.5 py-1 text-center">
                      <p className="text-[11px] font-black text-emerald-700 leading-none">{ts.completed ?? 0}</p>
                      <p className="text-[8px] text-emerald-500 font-bold uppercase tracking-wider mt-0.5">Done</p>
                    </div>
                    <div className="bg-amber-50 rounded-lg px-1.5 py-1 text-center">
                      <p className="text-[11px] font-black text-amber-700 leading-none">{ts.pending ?? 0}</p>
                      <p className="text-[8px] text-amber-500 font-bold uppercase tracking-wider mt-0.5">Pending</p>
                    </div>
                    <div className="bg-violet-50 rounded-lg px-1.5 py-1 text-center">
                      <p className="text-[11px] font-black text-violet-700 leading-none">{ts.in_progress ?? 0}</p>
                      <p className="text-[8px] text-violet-500 font-bold uppercase tracking-wider mt-0.5">Active</p>
                    </div>
                    <div className={`rounded-lg px-1.5 py-1 text-center ${ts.overdue > 0 ? "bg-rose-50" : "bg-gray-50"}`}>
                      <p className={`text-[11px] font-black leading-none ${ts.overdue > 0 ? "text-rose-700" : "text-gray-400"}`}>{ts.overdue ?? 0}</p>
                      <p className={`text-[8px] font-bold uppercase tracking-wider mt-0.5 ${ts.overdue > 0 ? "text-rose-500" : "text-gray-400"}`}>Late</p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  {ts.total > 0 && (
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            ts.progress === 100 ? "bg-emerald-500" : "bg-orange-500"
                          }`}
                          style={{ width: `${ts.progress || 0}%` }}
                        />
                      </div>
                      <span className={`text-[10px] font-bold tabular-nums ${
                        ts.progress === 100 ? "text-emerald-600" : "text-orange-600"
                      }`}>
                        {ts.progress || 0}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────────────────
export default function ClientList() {
  const [clients,        setClients]        = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState(null);
  const [search,         setSearch]         = useState("");
  const [statusFilter,   setStatusFilter]   = useState("all");
  const [perPage,        setPerPage]        = useState(10);
  const [page,           setPage]           = useState(1);
  const [sortField,      setSortField]      = useState(null);
  const [sortDir,        setSortDir]        = useState("asc");
  const [showAddModal,   setShowAddModal]   = useState(false);
  const [editingClient,  setEditingClient]  = useState(null);
  const [deletingClient, setDeletingClient] = useState(null);
  const [selectedIds,    setSelectedIds]    = useState(new Set());
  const [successMsg,     setSuccessMsg]     = useState(null);
  const [expandedId,     setExpandedId]     = useState(null);

  const fetchClients = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res  = await fetch(`${BASE}/api/admin/clients`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setClients(Array.isArray(data) ? data : (data?.data ?? data?.clients ?? []));
    } catch (err) { setError(err.message || "Failed to load."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchClients(); }, [fetchClients]);
  useEffect(() => { setPage(1); }, [search, statusFilter, perPage]);

  const total    = clients.length;
  const active   = clients.filter(c => c.status === "active").length;
  const inactive = total - active;
  const ago30    = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const newCount = clients.filter(c => c.created_at && new Date(c.created_at) >= ago30).length;

  // Aggregate across all clients
  const totalProjects = clients.reduce((sum, c) => sum + (c.stats?.total_projects || 0), 0);
  const totalTasks    = clients.reduce((sum, c) => sum + (c.stats?.total_tasks || 0), 0);

  let filtered = clients.filter(c => {
    const q      = search.toLowerCase();
    const name   = getFullName(c).toLowerCase();
    const co     = (c.company_name || "").toLowerCase();
    const email  = (c.email || "").toLowerCase();
    const code   = (c.client_code || "").toLowerCase();
    const matchQ = !q || name.includes(q) || co.includes(q) || email.includes(q) || code.includes(q);
    const matchS = statusFilter === "all" ? true : c.status === statusFilter;
    return matchQ && matchS;
  });

  if (sortField) {
    filtered = [...filtered].sort((a, b) => {
      const av = (a[sortField] || "").toString().toLowerCase();
      const bv = (b[sortField] || "").toString().toLowerCase();
      return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    });
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated  = filtered.slice((page - 1) * perPage, page * perPage);
  const from = filtered.length === 0 ? 0 : (page - 1) * perPage + 1;
  const to   = Math.min(page * perPage, filtered.length);

  const toggleSort = (field) => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
  };

  const toggleAll = () => {
    if (selectedIds.size === paginated.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(paginated.map(c => c.id)));
  };

  const toggleOne = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleExpand = (id) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  const SortIcon = ({ field }) => (
    <ArrowUpDown size={11} className={`inline ml-1 ${sortField === field ? "text-orange-500" : "text-gray-300"}`} />
  );

  const stats = [
    { label: "Total Clients",    value: total,         Icon: Users,       bg: "bg-orange-50", iconColor: "text-orange-500", sub: `${totalProjects} projects` },
    { label: "Active Clients",   value: active,        Icon: UserCheck,   bg: "bg-green-50",  iconColor: "text-green-600",  sub: `${totalTasks} tasks`       },
    { label: "Inactive Clients", value: inactive,      Icon: UserX,       bg: "bg-red-50",    iconColor: "text-red-500",    sub: "Not engaged"               },
    { label: "New Clients",      value: newCount,      Icon: UserPlus,    bg: "bg-blue-50",   iconColor: "text-blue-500",   sub: "Last 30 days"              },
  ];

  return (
    <div>
      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {stats.map(({ label, value, Icon, bg, iconColor, sub }) => (
          <div key={label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${bg}`}>
              <Icon size={20} className={iconColor} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] text-gray-400 font-medium">{label}</p>
              <p className="text-xl font-bold text-gray-900 leading-tight">{loading ? "—" : value}</p>
              <p className="text-[10px] text-gray-400 font-medium mt-0.5 truncate flex items-center gap-1">
                <Sparkles size={9} className="text-orange-400" /> {sub}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
          <h3 className="text-sm font-bold text-gray-800">Client List</h3>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              Row Per Page
              <select value={perPage} onChange={e => setPerPage(Number(e.target.value))}
                className="text-xs border border-gray-200 rounded-md px-2 py-1 bg-white outline-none focus:border-orange-400">
                {[10, 25, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
              Entries
            </div>
            <div className="relative">
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                className="text-xs border border-gray-200 rounded-lg pl-3 pr-7 py-1.5 bg-white appearance-none outline-none focus:border-orange-400 text-gray-600">
                <option value="all">Select Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <ChevronDown size={11} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            <button onClick={fetchClients} title="Refresh"
              className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 bg-white transition">
              <RefreshCw size={13} />
            </button>
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search"
                className="text-xs border border-gray-200 rounded-lg pl-7 pr-3 py-1.5 outline-none focus:border-orange-400 w-36 bg-white" />
            </div>
            <button onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-orange-500 hover:bg-orange-600 transition shadow-sm shadow-orange-200">
              <Plus size={14} /> Add Client
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-center justify-between p-4 bg-red-50 border-b border-red-100 text-sm text-red-600 mx-5 my-3 rounded-xl">
            <span className="flex items-center gap-2"><AlertTriangle size={14} />{error}</span>
            <button onClick={fetchClients} className="flex items-center gap-1 text-xs font-semibold underline"><RefreshCw size={11} />Retry</button>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-3 w-10">
                  <input type="checkbox" checked={paginated.length > 0 && selectedIds.size === paginated.length}
                    onChange={toggleAll} className="w-3.5 h-3.5 accent-orange-500 cursor-pointer" />
                </th>
                <th className="px-4 py-3 w-10" />
                {[
                  { label: "Client Code",    field: "client_code"    },
                  { label: "Company",        field: "company_name"   },
                  { label: "Contact Person", field: "contact_person" },
                  { label: "Email",          field: "email"          },
                  { label: "Projects",       field: null             },
                  { label: "Tasks",          field: null             },
                  { label: "Status",         field: "status"         },
                ].map(({ label, field }, idx) => (
                  <th key={`${label}-${idx}`}
                    onClick={field ? () => toggleSort(field) : undefined}
                    className={`px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap transition
                      ${field ? "cursor-pointer select-none hover:text-gray-700" : ""}`}>
                    {label}{field && <SortIcon field={field} />}
                  </th>
                ))}
                <th className="px-4 py-3 w-20" />
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: Math.min(perPage, 10) }).map((_, i) => <SkeletonRow key={i} />)
                : paginated.length === 0
                  ? (
                    <tr>
                      <td colSpan={11} className="text-center py-16">
                        <div className="flex flex-col items-center text-gray-400">
                          <Users size={38} strokeWidth={1} className="mb-3 text-gray-300" />
                          <p className="text-sm font-medium">{search ? "No clients match your search." : "No clients found."}</p>
                        </div>
                      </td>
                    </tr>
                  )
                  : paginated.map((c, i) => {
                    const name     = getFullName(c);
                    const initials = getInitials(name);
                    const color    = AVATAR_COLORS[i % AVATAR_COLORS.length];
                    const isActive = c.status === "active";
                    const avatar   = c.profile_image || c.avatar || null;
                    const isExpanded = expandedId === c.id;
                    const hasProjects = c.has_projects === true || (c.projects?.length ?? 0) > 0;
                    const stats = c.stats || {};
                    const projCount = stats.total_projects ?? (c.projects?.length ?? 0);
                    const taskCount = stats.total_tasks ?? 0;
                    const doneCount = stats.completed_tasks ?? 0;
                    const overdueCount = stats.overdue_tasks ?? 0;

                    return (
                      <>
                        <tr key={c.id ?? i}
                          className={`border-b border-gray-50 transition-colors ${selectedIds.has(c.id) ? "bg-orange-50/20" : ""} ${isExpanded ? "bg-orange-50/40" : "hover:bg-orange-50/30"}`}>

                          {/* Checkbox */}
                          <td className="px-4 py-3">
                            <input type="checkbox" checked={selectedIds.has(c.id)} onChange={() => toggleOne(c.id)}
                              className="w-3.5 h-3.5 accent-orange-500 cursor-pointer" />
                          </td>

                          {/* Expand toggle */}
                          <td className="px-4 py-3">
                            <button onClick={() => toggleExpand(c.id)}
                              className={`w-6 h-6 flex items-center justify-center rounded-lg transition-all cursor-pointer
                                ${isExpanded ? "bg-orange-500 text-white rotate-90" : "text-gray-400 hover:bg-orange-50 hover:text-orange-500"}`}
                              title={isExpanded ? "Hide projects" : "Show projects"}>
                              <ChevronRightIcon size={13} />
                            </button>
                          </td>

                          {/* Client code */}
                          <td className="px-4 py-3 text-xs text-gray-500 font-mono">
                            {c.client_code || `CUST${String(i + 1).padStart(3, "0")}`}
                          </td>

                          {/* Company */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              {avatar
                                ? <img src={avatar} alt={name} className="w-8 h-8 rounded-full object-cover shrink-0" />
                                : <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
                                    style={{ backgroundColor: color + "22", color }}>{initials}</div>
                              }
                              <div className="min-w-0">
                                <p className="text-xs font-semibold text-gray-800 leading-tight truncate">{c.company_name || "—"}</p>
                                {c.city && <p className="text-[10px] text-gray-400 truncate">{c.city}{c.state ? `, ${c.state}` : ""}</p>}
                              </div>
                            </div>
                          </td>

                          {/* Contact */}
                          <td className="px-4 py-3 text-xs text-gray-600">{c.contact_person || "—"}</td>

                          {/* Email */}
                          <td className="px-4 py-3 text-xs text-gray-500 max-w-[180px] truncate">{c.email || "—"}</td>

                          {/* Projects count */}
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ring-1
                              ${projCount > 0 ? "bg-indigo-50 text-indigo-700 ring-indigo-200" : "bg-gray-100 text-gray-500 ring-gray-200"}`}>
                              <FolderOpen size={10} />
                              {projCount}
                            </span>
                          </td>

                          {/* Tasks mini breakdown */}
                          <td className="px-4 py-3">
                            {taskCount > 0 ? (
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 ring-1 ring-sky-100">
                                  {taskCount}
                                </span>
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                                  <CheckCheck size={9} /> {doneCount}
                                </span>
                                {overdueCount > 0 && (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 ring-1 ring-rose-200">
                                    <AlertOctagon size={9} /> {overdueCount}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-[10px] text-gray-400 italic">No tasks</span>
                            )}
                          </td>

                          {/* Status */}
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-green-500" : "bg-red-400"}`} />
                              {isActive ? "Active" : "Inactive"}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1">
                              <button onClick={() => setEditingClient(c)}
                                className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-orange-500 hover:border-orange-200 hover:bg-orange-50 transition"
                                title="Edit">
                                <Pencil size={12} />
                              </button>

                              {hasProjects ? (
                                // Disabled delete with tooltip
                                <div className="relative group">
                                  <button
                                    disabled
                                    className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-gray-300 cursor-not-allowed">
                                    <Lock size={11} />
                                  </button>
                                  <div className="absolute bottom-full right-0 mb-1.5 hidden group-hover:block w-52 bg-gray-900 text-white text-[10px] px-2.5 py-1.5 rounded-lg shadow-lg z-50 pointer-events-none leading-snug">
                                    Cannot delete — this client has {projCount} project{projCount !== 1 ? "s" : ""}. Delete projects first.
                                    <div className="absolute top-full right-3 border-4 border-transparent border-t-gray-900" />
                                  </div>
                                </div>
                              ) : (
                                <button onClick={() => setDeletingClient(c)}
                                  className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition"
                                  title="Delete">
                                  <Trash2 size={12} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>

                        {/* Expanded row */}
                        {isExpanded && (
                          <tr key={`${c.id}-expanded`} className="border-b border-gray-100">
                            <td colSpan={11} className="p-0">
                              <ExpandedProjects client={c} />
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })
              }
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            {loading ? "Loading…" : filtered.length === 0 ? "No entries" : `Showing ${from} - ${to} of ${filtered.length} entries`}
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition">
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = totalPages <= 5 ? i + 1 : page <= 3 ? i + 1 : page >= totalPages - 2 ? totalPages - 4 + i : page - 2 + i;
              return (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium transition ${p === page ? "bg-orange-500 text-white border border-orange-500" : "border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                  {p}
                </button>
              );
            })}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Modals ── */}
      {showAddModal && (
        <ClientModal
          onClose={() => setShowAddModal(false)}
          onSuccess={(data, msg) => { fetchClients(); setSuccessMsg(msg); }}
        />
      )}
      {editingClient && (
        <ClientModal
          client={editingClient}
          onClose={() => setEditingClient(null)}
          onSuccess={(data, msg) => { setEditingClient(null); fetchClients(); setSuccessMsg(msg); }}
        />
      )}
      {deletingClient && (
        <DeleteConfirmModal
          client={deletingClient}
          onClose={() => setDeletingClient(null)}
          onSuccess={(msg) => { setDeletingClient(null); fetchClients(); setSuccessMsg(msg); }}
        />
      )}
      {successMsg && (
        <SuccessModal message={successMsg} onClose={() => setSuccessMsg(null)} />
      )}
    </div>
  );
}