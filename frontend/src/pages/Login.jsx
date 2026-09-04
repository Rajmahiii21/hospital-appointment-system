import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await api.post("/auth/login", form);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate(data.user.role === "doctor" ? "/doctor/dashboard" : "/patient/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-intro">
        <span className="eyebrow">WELCOME TO HOSPITALCARE</span>
        <h1>Healthcare appointments made simple.</h1>
        <p>Find trusted doctors, book appointments, and manage your visits from one clean dashboard.</p>
      </div>

      <form className="auth-card" onSubmit={submit}>
        <div className="auth-header">
          <div className="auth-icon">+</div>
          <h2>Sign in</h2>
          <p>Access your HospitalCare account</p>
        </div>

        {error && <div className="alert error">{error}</div>}

        <label>Username</label>
        <input
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          placeholder="Enter your username"
          autoComplete="username"
          required
        />

        <label>Password</label>
        <input
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          placeholder="Enter your password"
          autoComplete="current-password"
          required
        />

        <button className="btn-primary auth-submit" disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </button>

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Create account</Link>
        </p>
      </form>
    </div>
  );
}
