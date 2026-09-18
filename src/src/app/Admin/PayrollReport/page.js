"use client";
import { useState } from "react";

// Dummy payroll items data
const dummyPayrollItems = [
  {
    id: 1,
    employeeName: "John Smith",
    employeeId: "EMP001",
    department: "Engineering",
    basicSalary: 50000,
    allowances: {
      houseRent: 15000,
      transport: 5000,
      medical: 3000,
      dearness: 4000,
    },
    deductions: {
      providentFund: 6000,
      professionalTax: 200,
      incomeTax: 5000,
      loan: 2000,
    },
    netSalary: 0, // Will calculate
    month: "April",
    year: 2026,
    paymentStatus: "Paid",
    paymentDate: "2026-04-30",
  },
  {
    id: 2,
    employeeName: "Sarah Johnson",
    employeeId: "EMP002",
    department: "Marketing",
    basicSalary: 45000,
    allowances: {
      houseRent: 13500,
      transport: 4000,
      medical: 3000,
      dearness: 3500,
    },
    deductions: {
      providentFund: 5400,
      professionalTax: 200,
      incomeTax: 4000,
      loan: 0,
    },
    netSalary: 0,
    month: "April",
    year: 2026,
    paymentStatus: "Pending",
    paymentDate: null,
  },
  {
    id: 3,
    employeeName: "Michael Brown",
    employeeId: "EMP003",
    department: "Sales",
    basicSalary: 48000,
    allowances: {
      houseRent: 14400,
      transport: 5000,
      medical: 3000,
      dearness: 3800,
    },
    deductions: {
      providentFund: 5760,
      professionalTax: 200,
      incomeTax: 4500,
      loan: 1000,
    },
    netSalary: 0,
    month: "April",
    year: 2026,
    paymentStatus: "Paid",
    paymentDate: "2026-04-28",
  },
  {
    id: 4,
    employeeName: "Emily Davis",
    employeeId: "EMP004",
    department: "HR",
    basicSalary: 42000,
    allowances: {
      houseRent: 12600,
      transport: 4000,
      medical: 3000,
      dearness: 3300,
    },
    deductions: {
      providentFund: 5040,
      professionalTax: 200,
      incomeTax: 3500,
      loan: 0,
    },
    netSalary: 0,
    month: "April",
    year: 2026,
    paymentStatus: "Processing",
    paymentDate: null,
  },
  {
    id: 5,
    employeeName: "David Wilson",
    employeeId: "EMP005",
    department: "Engineering",
    basicSalary: 55000,
    allowances: {
      houseRent: 16500,
      transport: 6000,
      medical: 4000,
      dearness: 4500,
    },
    deductions: {
      providentFund: 6600,
      professionalTax: 200,
      incomeTax: 6000,
      loan: 3000,
    },
    netSalary: 0,
    month: "April",
    year: 2026,
    paymentStatus: "Paid",
    paymentDate: "2026-04-29",
  },
];

// Calculate net salary for each item
const calculateNetSalary = (item) => {
  const totalAllowances = Object.values(item.allowances).reduce((a, b) => a + b, 0);
  const totalDeductions = Object.values(item.deductions).reduce((a, b) => a + b, 0);
  return item.basicSalary + totalAllowances - totalDeductions;
};

// Initialize net salaries
dummyPayrollItems.forEach(item => {
  item.netSalary = calculateNetSalary(item);
});

export default function PayrollItems() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("April");
  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Get unique departments for filter
  const departments = ["All", ...new Set(dummyPayrollItems.map(item => item.department))];
  const statuses = ["All", "Paid", "Pending", "Processing"];
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const years = [2024, 2025, 2026, 2027];

  // Filter data
  const filteredData = dummyPayrollItems.filter(item => {
    const matchesSearch = item.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMonth = item.month === selectedMonth;
    const matchesYear = item.year === selectedYear;
    const matchesDepartment = selectedDepartment === "All" || item.department === selectedDepartment;
    const matchesStatus = selectedStatus === "All" || item.paymentStatus === selectedStatus;
    return matchesSearch && matchesMonth && matchesYear && matchesDepartment && matchesStatus;
  });

  // Calculate summary statistics
  const totalEmployees = filteredData.length;
  const totalPayroll = filteredData.reduce((sum, item) => sum + item.netSalary, 0);
  const totalPaid = filteredData.filter(item => item.paymentStatus === "Paid").reduce((sum, item) => sum + item.netSalary, 0);
  const pendingPayments = filteredData.filter(item => item.paymentStatus !== "Paid").length;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case "Paid": return "#10b981";
      case "Pending": return "#ef4444";
      case "Processing": return "#f59e0b";
      default: return "#6b7280";
    }
  };

  return (
    <div style={{ padding: "24px", fontFamily: "'DM Sans', sans-serif", background: "#f9fafb", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#111827", marginBottom: "8px" }}>Payroll Items</h1>
        <p style={{ color: "#6b7280", fontSize: "14px" }}>Manage and track employee salary details</p>
      </div>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px", marginBottom: "24px" }}>
        <div style={{ background: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          <p style={{ color: "#6b7280", fontSize: "13px", marginBottom: "8px" }}>Total Employees</p>
          <p style={{ fontSize: "32px", fontWeight: "700", color: "#111827" }}>{totalEmployees}</p>
        </div>
        <div style={{ background: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          <p style={{ color: "#6b7280", fontSize: "13px", marginBottom: "8px" }}>Total Payroll</p>
          <p style={{ fontSize: "32px", fontWeight: "700", color: "#f97316" }}>{formatCurrency(totalPayroll)}</p>
        </div>
        <div style={{ background: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          <p style={{ color: "#6b7280", fontSize: "13px", marginBottom: "8px" }}>Total Paid</p>
          <p style={{ fontSize: "32px", fontWeight: "700", color: "#10b981" }}>{formatCurrency(totalPaid)}</p>
        </div>
        <div style={{ background: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          <p style={{ color: "#6b7280", fontSize: "13px", marginBottom: "8px" }}>Pending Payments</p>
          <p style={{ fontSize: "32px", fontWeight: "700", color: "#ef4444" }}>{pendingPayments}</p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ background: "white", padding: "20px", borderRadius: "12px", marginBottom: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
          <input
            type="text"
            placeholder="Search by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ padding: "10px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "14px" }}
          />
          <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} style={{ padding: "10px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "14px" }}>
            {months.map(month => <option key={month} value={month}>{month}</option>)}
          </select>
          <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} style={{ padding: "10px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "14px" }}>
            {years.map(year => <option key={year} value={year}>{year}</option>)}
          </select>
          <select value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)} style={{ padding: "10px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "14px" }}>
            {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
          </select>
          <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} style={{ padding: "10px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "14px" }}>
            {statuses.map(status => <option key={status} value={status}>{status}</option>)}
          </select>
        </div>
      </div>

      {/* Employee Table */}
      <div style={{ background: "white", borderRadius: "12px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
              <tr>
                <th style={{ padding: "16px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#6b7280" }}>Employee</th>
                <th style={{ padding: "16px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#6b7280" }}>ID</th>
                <th style={{ padding: "16px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#6b7280" }}>Department</th>
                <th style={{ padding: "16px", textAlign: "right", fontSize: "13px", fontWeight: "600", color: "#6b7280" }}>Basic Salary</th>
                <th style={{ padding: "16px", textAlign: "right", fontSize: "13px", fontWeight: "600", color: "#6b7280" }}>Allowances</th>
                <th style={{ padding: "16px", textAlign: "right", fontSize: "13px", fontWeight: "600", color: "#6b7280" }}>Deductions</th>
                <th style={{ padding: "16px", textAlign: "right", fontSize: "13px", fontWeight: "600", color: "#6b7280" }}>Net Salary</th>
                <th style={{ padding: "16px", textAlign: "center", fontSize: "13px", fontWeight: "600", color: "#6b7280" }}>Status</th>
                <th style={{ padding: "16px", textAlign: "center", fontSize: "13px", fontWeight: "600", color: "#6b7280" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item) => {
                const totalAllowances = Object.values(item.allowances).reduce((a, b) => a + b, 0);
                const totalDeductions = Object.values(item.deductions).reduce((a, b) => a + b, 0);
                return (
                  <tr key={item.id} style={{ borderBottom: "1px solid #e5e7eb", cursor: "pointer" }} onClick={() => setSelectedEmployee(item)}>
                    <td style={{ padding: "16px", fontSize: "14px", fontWeight: "500", color: "#111827" }}>{item.employeeName}</td>
                    <td style={{ padding: "16px", fontSize: "14px", color: "#6b7280" }}>{item.employeeId}</td>
                    <td style={{ padding: "16px", fontSize: "14px", color: "#6b7280" }}>{item.department}</td>
                    <td style={{ padding: "16px", textAlign: "right", fontSize: "14px", fontWeight: "500", color: "#111827" }}>{formatCurrency(item.basicSalary)}</td>
                    <td style={{ padding: "16px", textAlign: "right", fontSize: "14px", color: "#10b981" }}>{formatCurrency(totalAllowances)}</td>
                    <td style={{ padding: "16px", textAlign: "right", fontSize: "14px", color: "#ef4444" }}>{formatCurrency(totalDeductions)}</td>
                    <td style={{ padding: "16px", textAlign: "right", fontSize: "14px", fontWeight: "700", color: "#f97316" }}>{formatCurrency(item.netSalary)}</td>
                    <td style={{ padding: "16px", textAlign: "center" }}>
                      <span style={{ display: "inline-block", padding: "4px 12px", background: `${getStatusColor(item.paymentStatus)}20`, color: getStatusColor(item.paymentStatus), borderRadius: "20px", fontSize: "12px", fontWeight: "500" }}>
                        {item.paymentStatus}
                      </span>
                    </td>
                    <td style={{ padding: "16px", textAlign: "center" }}>
                      <button style={{ padding: "6px 12px", background: "#f97316", color: "white", border: "none", borderRadius: "6px", fontSize: "12px", cursor: "pointer" }}>
                        View Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredData.length === 0 && (
          <div style={{ padding: "48px", textAlign: "center", color: "#6b7280" }}>
            No payroll records found
          </div>
        )}
      </div>

      {/* Employee Details Modal */}
      {selectedEmployee && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={() => setSelectedEmployee(null)}>
          <div style={{ background: "white", borderRadius: "16px", maxWidth: "600px", width: "90%", maxHeight: "85vh", overflow: "auto", padding: "24px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "22px", fontWeight: "700" }}>Salary Details</h2>
              <button onClick={() => setSelectedEmployee(null)} style={{ background: "none", border: "none", fontSize: "24px", cursor: "pointer" }}>×</button>
            </div>
            
            <div style={{ marginBottom: "20px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "16px" }}>{selectedEmployee.employeeName}</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div><p style={{ color: "#6b7280", fontSize: "12px" }}>Employee ID</p><p style={{ fontWeight: "500" }}>{selectedEmployee.employeeId}</p></div>
                <div><p style={{ color: "#6b7280", fontSize: "12px" }}>Department</p><p style={{ fontWeight: "500" }}>{selectedEmployee.department}</p></div>
                <div><p style={{ color: "#6b7280", fontSize: "12px" }}>Month</p><p style={{ fontWeight: "500" }}>{selectedEmployee.month} {selectedEmployee.year}</p></div>
                <div><p style={{ color: "#6b7280", fontSize: "12px" }}>Payment Status</p><p style={{ fontWeight: "500", color: getStatusColor(selectedEmployee.paymentStatus) }}>{selectedEmployee.paymentStatus}</p></div>
              </div>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "12px" }}>Allowances</h3>
              <div style={{ background: "#f9fafb", padding: "12px", borderRadius: "8px" }}>
                {Object.entries(selectedEmployee.allowances).map(([key, value]) => (
                  <div key={key} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #e5e7eb" }}>
                    <span style={{ textTransform: "capitalize" }}>{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <span style={{ fontWeight: "500", color: "#10b981" }}>{formatCurrency(value)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "12px" }}>Deductions</h3>
              <div style={{ background: "#f9fafb", padding: "12px", borderRadius: "8px" }}>
                {Object.entries(selectedEmployee.deductions).map(([key, value]) => (
                  <div key={key} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #e5e7eb" }}>
                    <span style={{ textTransform: "capitalize" }}>{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <span style={{ fontWeight: "500", color: "#ef4444" }}>{formatCurrency(value)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: "#f97316", color: "white", padding: "16px", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: "600" }}>Net Salary</span>
              <span style={{ fontSize: "24px", fontWeight: "700" }}>{formatCurrency(selectedEmployee.netSalary)}</span>
            </div>

            {selectedEmployee.paymentDate && (
              <div style={{ marginTop: "16px", textAlign: "center", fontSize: "12px", color: "#6b7280" }}>
                Paid on: {new Date(selectedEmployee.paymentDate).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}