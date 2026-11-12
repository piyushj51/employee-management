import React, { useState, useEffect } from "react";
import { employeeAPI } from "../api";

export default function EmployeeModal({ employee, onClose, onSaved }) {
  const isEditing = Boolean(employee && employee.id);
  const [formData, setFormData] = useState({
    name: "",
    experience: 0,
    technology: "",
    email: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name || "",
        experience: employee.experience ?? 0,
        technology: employee.technology || "",
        email: employee.email || "",
      });
    }
  }, [employee]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "experience" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isEditing) {
        await employeeAPI.update(employee.id, formData);
      } else {
        await employeeAPI.create(formData);
      }
      onSaved();
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        (Array.isArray(err.response?.data?.detail)
          ? err.response.data.detail[0]?.msg
          : "Operation failed");
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{isEditing ? "Edit Employee" : "Add New Employee"}</h3>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              required
              minLength={2}
              maxLength={50}
              className="form-control"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              required
              className="form-control"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Technology / Stack</label>
            <input
              type="text"
              name="technology"
              required
              minLength={2}
              maxLength={50}
              className="form-control"
              placeholder="e.g. Python, React"
              value={formData.technology}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Experience (Years: 0 - 50)</label>
            <input
              type="number"
              name="experience"
              min={0}
              max={50}
              required
              className="form-control"
              value={formData.experience}
              onChange={handleChange}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "24px" }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Saving..." : isEditing ? "Save Changes" : "Create Employee"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

