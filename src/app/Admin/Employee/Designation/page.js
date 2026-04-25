"use client";
import { useState, useEffect, useCallback } from "react";

const BASE = process.env.NEXT_PUBLIC_API_URL;
const HEADERS = () => ({
  Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
  Accept: "application/json",
  "ngrok-skip-browser-warning": "true",
});

// ── DEPT PICKER ──────────────────────────────────────────────────────
function DeptPicker({ value, onChange, departments }) {
  const [open, setOpen]   = useState(false);
  const [query, setQuery] = useState("");

  const filtered = departments.filter((d) =>
    d.name?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <>
      <div
        onClick={() => { setQuery(""); setOpen(true); }}
        className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 cursor-pointer flex items-center justify-between bg-white hover:border-orange-400 transition"
      >
        <span className={value ? "text-gray-800" : "text-gray-400"}>
          {value || "Select department…"}
        </span>
        <span className="text-gray-400 text-xs">▼</span>
      </div>

      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4 z-10 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-800">Select Department</h3>
              <button
                onClick={() => setOpen(false)}
                className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 text-xs font-bold"
              >✕</button>
            </div>
            <div className="px-4 py-3 border-b border-gray-100">
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search departments…"
                className="w-full text-xs border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-orange-400"
              />
            </div>
            <div className="max-h-56 overflow-y-auto">
              {filtered.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-6">No departments found</p>
              ) : (
                filtered.map((dep) => (
                  <div
                    key={dep.id}
                    onClick={() => { onChange(dep.id, dep.name); setOpen(false); }}
                    className={`px-4 py-2.5 text-xs cursor-pointer hover:bg-orange-50 hover:text-orange-600 transition flex items-center justify-between
                      ${value === dep.name ? "bg-orange-50 text-orange-600 font-semibold" : "text-gray-700"}`}
                  >
                    <span>{dep.name}</span>
                    {value === dep.name && <span className="text-orange-500">✓</span>}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── MODAL FORM ───────────────────────────────────────────────────────
function ModalForm({ title, row, setRow, onSubmit, onClose, submitLabel, loading, departments }) {
  // Validate all required fields
  const isFormValid = row.name?.trim() && row.department_id && row.status;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden z-10">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-800">{title}</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 text-sm font-bold transition-colors"
          >✕</button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Designation Name</label>
            <input
              value={row.name}
              onChange={(e) => setRow((p) => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Software Engineer"
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition text-black"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Department Name</label>
            <DeptPicker
              value={row.department_name}
              departments={departments}
              onChange={(id, name) => setRow((p) => ({ ...p, department_id: id, department_name: name }))}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Status</label>
            <div className="relative">
              <select
                value={row.status}
                onChange={(e) => setRow((p) => ({ ...p, status: e.target.value }))}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 appearance-none bg-white transition text-gray-700"
              >
                <option value="">Select</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▼</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100 transition"
          >Cancel</button>
          <button
            onClick={onSubmit}
            disabled={loading || !isFormValid}
            className="px-5 py-2 text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition disabled:opacity-50"
          >{loading ? "Saving..." : submitLabel}</button>
        </div>
      </div>
    </div>
  );
}
// ── MAIN PAGE ────────────────────────────────────────────────────────
export default function Designation() {
  const [data, setData]                 = useState([]);
  const [departments, setDepartments]   = useState([]);
  const [search, setSearch]             = useState("");
  const [deptFilter, setDeptFilter]     = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [fetching, setFetching]         = useState(true);
  const [loading, setLoading]           = useState(false);
  const [message, setMessage]           = useState({ text: "", type: "" });

  const [showModal, setShowModal] = useState(false);
  const [newRow, setNewRow]       = useState({ name: "", department_id: "", department_name: "", status: "" });

  const [showEdit, setShowEdit] = useState(false);
  const [editRow, setEditRow]   = useState(null);

  const showMessage = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
  };

  // ── FETCH DESIGNATIONS + EMPLOYEES (parallel) ────────────────────
  const fetchDesignations = useCallback(async () => {
    try {
      setFetching(true);
      const [desigRes, empRes] = await Promise.all([
        fetch(`${BASE}/api/admin/designations`, { headers: HEADERS() }),
        fetch(`${BASE}/api/admin/employees`,    { headers: HEADERS() }),
      ]);

      const desigJson = await desigRes.json();
      const empJson   = await empRes.json();

      if (!desigRes.ok) {
        showMessage(desigJson.message || "Failed to fetch designations", "error");
        return;
      }

      const designations = Array.isArray(desigJson) ? desigJson : desigJson.data || [];
      const employees    = Array.isArray(empJson)   ? empJson   : empJson.data   || [];

      // Count employees per designation_id
      const countMap = {};
      employees.forEach((emp) => {
        const dId = emp.designation_id;
        if (dId) countMap[dId] = (countMap[dId] || 0) + 1;
      });

      setData(
        designations.map((d) => ({
          ...d,
          status:          d.status?.toLowerCase() === "active" ? "Active" : "Inactive",
          employees:       countMap[d.id] || 0,
          department_name: d.department?.name ?? d.department_name ?? d.department ?? "—",
        }))
      );
    } catch {
      showMessage("Network error. Please try again.", "error");
    } finally {
      setFetching(false);
    }
  }, []);

  // ── FETCH DEPARTMENTS ────────────────────────────────────────────
  const fetchDepartments = useCallback(async () => {
    try {
      const res  = await fetch(`${BASE}/api/admin/departments`, { headers: HEADERS() });
      const json = await res.json();
      if (res.ok) {
        const list = Array.isArray(json) ? json : json.data || [];
        setDepartments(list);
      }
    } catch (err) {
      console.error("Dept fetch error:", err);
    }
  }, []);

  useEffect(() => {
    fetchDesignations();
    fetchDepartments();
  }, [fetchDesignations, fetchDepartments]);

  // ── ADD ──────────────────────────────────────────────────────────
  const handleAdd = async () => {
    if (!newRow.name.trim() || !newRow.department_id || !newRow.status) {
      showMessage("All fields are required", "error");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/api/admin/designations`, {
        method: "POST",
        headers: { ...HEADERS(), "Content-Type": "application/json" },
        body: JSON.stringify({
          name:          newRow.name.trim(),
          department_id: newRow.department_id,
          status:        newRow.status.toLowerCase(),
        }),
      });
      const result = await res.json();
      if (res.ok) {
        showMessage(result.message || "Designation added successfully");
        setNewRow({ name: "", department_id: "", department_name: "", status: "" });
        setShowModal(false);
        fetchDesignations();
      } else {
        showMessage(result.message || "Failed to add designation", "error");
      }
    } catch {
      showMessage("Network error. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  // ── EDIT ─────────────────────────────────────────────────────────
  const openEdit = (d) => {
    setEditRow({
      id:              d.id,
      name:            d.name,
      department_id:   d.department?.id ?? d.department_id ?? "",
      department_name: d.department_name,
      status:          d.status,
    });
    setShowEdit(true);
  };

  const handleUpdate = async () => {
    if (!editRow.name.trim() || !editRow.department_id || !editRow.status) {
      showMessage("All fields are required", "error");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/api/admin/designations/${editRow.id}`, {
        method: "PUT",
        headers: { ...HEADERS(), "Content-Type": "application/json" },
        body: JSON.stringify({
          name:          editRow.name.trim(),
          department_id: editRow.department_id,
          status:        editRow.status.toLowerCase(),
        }),
      });
      const result = await res.json();
      if (res.ok) {
        showMessage(result.message || "Designation updated successfully");
        setShowEdit(false);
        setEditRow(null);
        fetchDesignations();
      } else {
        showMessage(result.message || "Failed to update designation", "error");
      }
    } catch {
      showMessage("Network error. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  // ── DELETE ───────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this designation?")) return;
    try {
      const res = await fetch(`${BASE}/api/admin/designations/${id}`, {
        method: "DELETE",
        headers: HEADERS(),
      });
      if (res.ok) {
        showMessage("Designation deleted successfully");
        fetchDesignations();
      } else {
        const result = await res.json();
        showMessage(result.message || "Failed to delete designation", "error");
      }
    } catch {
      showMessage("Network error", "error");
    }
  };

  const filtered = data.filter((d) =>
    (d.name?.toLowerCase().includes(search.toLowerCase()) ||
     d.department_name?.toLowerCase().includes(search.toLowerCase())) &&
    (deptFilter   === "All" || d.department_name === deptFilter) &&
    (statusFilter === "All" || d.status          === statusFilter)
  );

  // ── RENDER ───────────────────────────────────────────────────────
  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-bold text-gray-800">Designation List</h3>
        <div className="flex items-center gap-2 flex-wrap">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search…"
            className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-orange-400 w-36"
          />
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 outline-none text-gray-500"
          >
            <option>All</option>
            {departments.map((d) => <option key={d.id}>{d.name}</option>)}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 outline-none text-gray-500"
          >
            <option>All</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
          <button className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 text-gray-500">📥 Export</button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-orange-500 hover:bg-orange-600"
          >➕ Add Designation</button>
        </div>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`mb-4 p-3 rounded-xl text-xs font-medium ${
          message.type === "success"
            ? "bg-green-50 text-green-700 border border-green-200"
            : "bg-red-50 text-red-700 border border-red-200"}`}
        >
          {message.text}
          <button className="float-right" onClick={() => setMessage({ text: "", type: "" })}>✕</button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="w-10 p-3"><input type="checkbox" className="rounded" /></th>
              <th className="p-3 text-left text-xs font-semibold text-gray-500">Designation</th>
              <th className="p-3 text-left text-xs font-semibold text-gray-500">Department</th>
              <th className="p-3 text-left text-xs font-semibold text-gray-500">No of Employees</th>
              <th className="p-3 text-left text-xs font-semibold text-gray-500">Status</th>
              <th className="p-3 text-right text-xs font-semibold text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {fetching && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-xs text-gray-400">
                  <div className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-orange-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Loading designations…
                  </div>
                </td>
              </tr>
            )}
            {!fetching && filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-xs text-gray-400">No designations found.</td>
              </tr>
            )}
            {!fetching && filtered.map((d, i) => (
              <tr key={d.id} className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${i % 2 !== 0 ? "bg-gray-50/40" : ""}`}>
                <td className="p-3"><input type="checkbox" className="rounded" /></td>
                <td className="p-3 text-xs font-medium text-gray-700">{d.name}</td>
                <td className="p-3 text-xs text-gray-500">{d.department_name}</td>
                <td className="p-3">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                    <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-[10px] font-bold">
                      {d.employees}
                    </span>
                    {d.employees === 1 ? "Employee" : "Employees"}
                  </span>
                </td>
                <td className="p-3">
                  <span
                    className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                    style={d.status === "Active"
                      ? { backgroundColor: "#dcfce7", color: "#16a34a" }
                      : { backgroundColor: "#fee2e2", color: "#dc2626" }}
                  >• {d.status}</span>
                </td>
                <td className="p-3 text-right">
                  <button onClick={() => openEdit(d)} className="text-gray-400 hover:text-blue-500 mr-2 text-base">✏️</button>
                  <button onClick={() => handleDelete(d.id)} className="text-gray-400 hover:text-red-500 text-base">🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="px-4 py-3 text-xs text-gray-400 border-t border-gray-100 flex items-center justify-between">
          <span>Showing 1–{filtered.length} of {filtered.length} entries</span>
          <div className="flex items-center gap-1">
            <button className="w-7 h-7 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50">‹</button>
            <button className="w-7 h-7 rounded-lg bg-orange-500 text-white font-bold">1</button>
            <button className="w-7 h-7 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50">›</button>
          </div>
        </div>
      </div>

      {/* Add Modal */}
      {showModal && (
        <ModalForm
          title="Add Designation"
          row={newRow}
          setRow={setNewRow}
          onSubmit={handleAdd}
          onClose={() => { setShowModal(false); setNewRow({ name: "", department_id: "", department_name: "", status: "" }); }}
          submitLabel="Add Designation"
          loading={loading}
          departments={departments}
        />
      )}

      {/* Edit Modal */}
      {showEdit && editRow && (
        <ModalForm
          title="Edit Designation"
          row={editRow}
          setRow={setEditRow}
          onSubmit={handleUpdate}
          onClose={() => { setShowEdit(false); setEditRow(null); }}
          submitLabel="Update Designation"
          loading={loading}
          departments={departments}
        />
      )}
    </div>
  );
}