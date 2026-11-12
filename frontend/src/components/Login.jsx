import React, { useState } from "react";
import { authAPI } from "../api";

export default function Login({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (isLogin) {
        const data = await authAPI.login(username, password);
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("user", username);
        onLoginSuccess({ username, token: data.access_token });
      } else {
        await authAPI.register(username, password);
        setSuccess("Registration successful! You can now log in.");
        setIsLogin(true);
      }
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        (typeof err.response?.data === "string" ? err.response?.data : "Authentication failed");
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="card auth-card">
        <div className="tabs">
          <button
            type="button"
            className={`tab-btn ${isLogin ? "active" : ""}`}
            onClick={() => {
              setIsLogin(true);
              setError("");
              setSuccess("");
            }}
          >
            Login
          </button>
          <button
            type="button"
            className={`tab-btn ${!isLogin ? "active" : ""}`}
            onClick={() => {
              setIsLogin(false);
              setError("");
              setSuccess("");
            }}
          >
            Register
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              required
              className="form-control"
              placeholder="e.g. johndoe"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              required
              className="form-control"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", marginTop: "10px" }}
            disabled={loading}
          >
            {loading ? "Processing..." : isLogin ? "Sign In" : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
}

