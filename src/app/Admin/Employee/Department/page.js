"use client";

import { useState, useEffect } from "react";

const BASE = process.env.NEXT_PUBLIC_API_URL;

const getAuthHeaders = () => {
  const token = localStorage.getItem("auth_token");
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
    "ngrok-skip-browser-warning": "true",
  };
};

export default function Department() {
  const [depts, setDepts] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");

  // Modal states
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [currentDept, setCurrentDept] = useState(null);

  // Form fields
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newStatus, setNewStatus] = useState("Active");

  // UI feedback
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);

  // Fetch departments + employees, then merge employee counts
  const fetchDepartments = async () => {
    try {
      const [deptRes, empRes] = await Promise.all([
        fetch(`${BASE}/api/admin/departments`, { headers: getAuthHeaders() }),
        fetch(`${BASE}/api/admin/employees`,   { headers: getAuthHeaders() }),
      ]);

      const deptData = await deptRes.json();
      const empData  = await empRes.json();

      const departments = Array.isArray(deptData) ? deptData : deptData.data || [];
      const employees   = Array.isArray(empData)  ? empData  : empData.data  || [];

      // Count employees per department_id
      const countMap = {};
      employees.forEach((emp) => {
        const dId = emp.department_id;
        if (dId) countMap[dId] = (countMap[dId] || 0) + 1;
      });

      const normalized = departments.map((d) => ({
        ...d,
        status:    d.status === "active" ? "Active" : "Inactive",
        employees: countMap[d.id] || 0,
      }));

      setDepts(normalized);
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const showMessage = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
  };

  // CREATE
  const handleAdd = async () => {
    if (!newName.trim()) {
      showMessage("Department name is required", "error");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${BASE}/api/admin/departments`, {
        method: "POST",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({
          name:        newName.trim(),
          description: newDesc.trim() || null,
          status:      newStatus.toLowerCase(),
        }),
      });
      const result = await response.json();
      if (response.ok && result.success) {
        showMessage(result.message || "Department created successfully");
        setNewName(""); setNewDesc(""); setNewStatus("Active");
        setShowAdd(false);
        fetchDepartments();
      } else {
        showMessage(result.message || "Failed to create department", "error");
      }
    } catch (error) {
      showMessage("Network error. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  // EDIT
  const handleEdit = (dept) => {
    setCurrentDept(dept);
    setNewName(dept.name);
    setNewDesc(dept.description || "");
    setNewStatus(dept.status);
    setShowEdit(true);
  };

  // UPDATE
  const handleUpdate = async () => {
    if (!newName.trim()) {
      showMessage("Department name is required", "error");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${BASE}/api/admin/departments/${currentDept.id}`, {
        method: "PUT",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({
          name:        newName.trim(),
          description: newDesc.trim() || null,
          status:      newStatus.toLowerCase(),
        }),
      });
      const result = await response.json();
      if (response.ok) {
        showMessage("Department updated successfully");
        setShowEdit(false); setCurrentDept(null);
        setNewName(""); setNewDesc(""); setNewStatus("Active");
        fetchDepartments();
      } else {
        showMessage(result.message || "Failed to update department", "error");
      }
    } catch (error) {
      showMessage("Network error. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  // DELETE
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this department?")) return;
    try {
      const response = await fetch(`${BASE}/api/admin/departments/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        showMessage("Department deleted successfully");
        fetchDepartments();
      } else {
        showMessage("Failed to delete department", "error");
      }
    } catch (error) {
      showMessage("Network error", "error");
    }
  };

  // TOGGLE STATUS
  const toggleStatus = async (id, currentStatus) => {
    const next = currentStatus === "Active" ? "inactive" : "active";
    try {
      const response = await fetch(`${BASE}/api/admin/departments/${id}`, {
        method: "PUT",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (response.ok) {
        showMessage(`Status updated to ${next}`);
        fetchDepartments();
      } else {
        showMessage("Failed to update status", "error");
      }
    } catch (error) {
      showMessage("Network error", "error");
    }
  };

  const filtered = depts.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) &&
      (status === "All" || d.status === status)
  );

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-5 text-black">
        <h3 className="text-sm font-bold text-gray-800">Department List</h3>
        <div className="flex items-center gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search…"
            className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-orange-400 w-40"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-3 py-1.5"
          >
            <option>All</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
          <button className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 text-gray-500">
            📥 Export
          </button>
          <button
            onClick={() => setShowAdd(true)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-orange-500 hover:bg-orange-600"
          >
            ➕ Add Department
          </button>
        </div>
      </div>

      {/* Success/Error message */}
      {message.text && (
        <div
          className={`mb-4 p-3 rounded-xl text-xs font-medium ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message.text}
          <button className="float-right" onClick={() => setMessage({ text: "", type: "" })}>✕</button>
        </div>
      )}

      {/* ADD MODAL */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowAdd(false)} />
          <div className="relative bg-white w-full max-w-md rounded-xl shadow-xl p-6 z-10">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-bold text-gray-800">Add Department</h2>
              <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-gray-600">✖</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-500">Department Name</label>
                <input value={newName} onChange={(e) => setNewName(e.target.value)}
                  className="w-full mt-1 text-xs border rounded-lg px-3 py-2 outline-none focus:border-orange-400 text-black" />
              </div>
              <div>
                <label className="text-xs text-gray-500">Description</label>
                <textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} rows={3}
                  className="w-full mt-1 text-xs border rounded-lg px-3 py-2 outline-none focus:border-orange-400 text-black" />
              </div>
              <div>
                <label className="text-xs text-gray-500">Status</label>
                <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full mt-1 text-xs border rounded-lg px-3 py-2 text-black">
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setShowAdd(false)} className="px-4 py-2 text-xs border rounded-lg text-gray-500">Cancel</button>
              <button
  onClick={handleAdd}
  disabled={loading || !newName.trim() || !newDesc.trim()}
  className="px-4 py-2 text-xs font-semibold text-white bg-orange-500 rounded-lg hover:bg-orange-600 disabled:opacity-50"
>
  {loading ? "Adding..." : "Add Department"}
</button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEdit && currentDept && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowEdit(false)} />
          <div className="relative bg-white w-full max-w-md rounded-xl shadow-xl p-6 z-10">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-bold text-gray-800">Edit Department</h2>
              <button onClick={() => setShowEdit(false)} className="text-gray-400 hover:text-gray-600">✖</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-500">Department Name</label>
                <input value={newName} onChange={(e) => setNewName(e.target.value)}
                  className="w-full mt-1 text-xs border rounded-lg px-3 py-2 outline-none focus:border-orange-400 text-black" />
              </div>
              <div>
                <label className="text-xs text-gray-500">Description</label>
                <textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} rows={3}
                  className="w-full mt-1 text-xs border rounded-lg px-3 py-2 outline-none focus:border-orange-400 text-black" />
              </div>
              <div>
                <label className="text-xs text-gray-500">Status</label>
                <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full mt-1 text-xs border rounded-lg px-3 py-2 text-black">
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setShowEdit(false)} className="px-4 py-2 text-xs border rounded-lg text-gray-500">Cancel</button>
              <button onClick={handleUpdate} disabled={loading || !newName.trim()}
  className="px-4 py-2 text-xs font-semibold text-white bg-orange-500 rounded-lg hover:bg-orange-600 disabled:opacity-50">
  {loading ? "Updating..." : "Update Department"}
</button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="w-10 p-3"></th>
              <th className="p-3 text-left text-xs font-semibold text-gray-500">Department</th>
              <th className="p-3 text-left text-xs font-semibold text-gray-500">No of Employees</th>
              <th className="p-3 text-left text-xs font-semibold text-gray-500">Status</th>
              <th className="p-3 text-right text-xs font-semibold text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-xs text-gray-400">
                  No departments found.
                </td>
              </tr>
            ) : (
              filtered.map((d) => (
                <tr key={d.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="p-3"></td>
                  <td className="p-3">
                    <p className="text-xs font-semibold text-gray-800">{d.name}</p>
                    {d.description && (
                      <p className="text-[10px] text-gray-400 mt-0.5">{d.description}</p>
                    )}
                  </td>
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
                      onClick={() => toggleStatus(d.id, d.status)}
                      className="cursor-pointer text-[11px] font-semibold px-2.5 py-1 rounded-full"
                      style={
                        d.status === "Active"
                          ? { backgroundColor: "#dcfce7", color: "#16a34a" }
                          : { backgroundColor: "#fee2e2", color: "#dc2626" }
                      }
                    >
                      • {d.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button onClick={() => handleEdit(d)} className="text-gray-400 hover:text-blue-500 mr-2">✏️</button>
                    <button onClick={() => handleDelete(d.id)} className="text-gray-400 hover:text-red-500">🗑️</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}