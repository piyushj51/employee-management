import React, { useState, useEffect } from "react";
import Login from "./components/Login";
import EmployeeList from "./components/EmployeeList";

export default function App() {
  const [user, setUser] = useState(localStorage.getItem("user"));
  const [token, setToken] = useState(localStorage.getItem("token"));

  useEffect(() => {
    const handleAuthChange = () => {
      setUser(localStorage.getItem("user"));
      setToken(localStorage.getItem("token"));
    };

    window.addEventListener("auth-changed", handleAuthChange);
    return () => window.removeEventListener("auth-changed", handleAuthChange);
  }, []);

  const handleLoginSuccess = ({ username, token }) => {
    setUser(username);
    setToken(token);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setToken(null);
  };

  return (
    <div>
      <nav className="navbar">
        <div className="brand">
          💼 Employee Management
        </div>
        {token && (
          <div className="user-badge">
            <span className="user-pill">👤 {user}</span>
            <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}
      </nav>

      <main className="container">
        {!token ? (
          <Login onLoginSuccess={handleLoginSuccess} />
        ) : (
          <EmployeeList />
        )}
      </main>
    </div>
  );
}

