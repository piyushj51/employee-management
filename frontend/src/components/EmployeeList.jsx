import React, { useState, useEffect } from "react";
import { employeeAPI } from "../api";
import EmployeeModal from "./EmployeeModal";

export default function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await employeeAPI.getAll();
      setEmployees(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleOpenAdd = () => {
    setSelectedEmployee(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (emp) => {
    setSelectedEmployee(emp);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) return;
    try {
      await employeeAPI.delete(id);
      fetchEmployees();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to delete employee (Admin role required)");
    }
  };

  const filteredEmployees = employees.filter((emp) => {
    const q = search.toLowerCase();
    return (
      emp.name?.toLowerCase().includes(q) ||
      emp.email?.toLowerCase().includes(q) ||
      emp.technology?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="card" style={{ marginTop: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h2>Employee Directory</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
            Total Employees: {employees.length}
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search employees..."
            style={{ width: "220px" }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="btn btn-primary" onClick={handleOpenAdd}>
            + Add Employee
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <p style={{ textAlign: "center", padding: "24px", color: "var(--text-muted)" }}>
          Loading employees...
        </p>
      ) : filteredEmployees.length === 0 ? (
        <div style={{ textAlign: "center", padding: "36px", color: "var(--text-muted)" }}>
          <p>No employees found.</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Technology</th>
                <th>Experience</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((emp) => (
                <tr key={emp.id || emp.email}>
                  <td><strong>#{emp.id}</strong></td>
                  <td style={{ fontWeight: 600 }}>{emp.name}</td>
                  <td>{emp.email}</td>
                  <td>
                    <span style={{ backgroundColor: "#e2e8f0", padding: "2px 8px", borderRadius: "4px", fontSize: "0.85rem" }}>
                      {emp.technology}
                    </span>
                  </td>
                  <td>{emp.experience} yrs</td>
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "inline-flex", gap: "6px" }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleOpenEdit(emp)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(emp.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <EmployeeModal
          employee={selectedEmployee}
          onClose={() => setIsModalOpen(false)}
          onSaved={() => {
            setIsModalOpen(false);
            fetchEmployees();
          }}
        />
      )}
    </div>
  );
}

