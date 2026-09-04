import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

const initialForm = {
  name: "", username: "", email: "", password: "", confirmPassword: "",
  phone: "", role: "patient", specialization: "", experience: "",
  qualification: "", consultationFee: ""
};

export default function Register() {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post("/auth/register", form);
      setMessage(data.message);
      setTimeout(() => navigate("/login"), 900);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page register-page">
      <div className="auth-intro">
        <span className="eyebrow">JOIN HOSPITALCARE</span>
        <h1>Your health journey starts here.</h1>
        <p>Create a patient or doctor account and manage appointments with ease.</p>
      </div>

      <form className="auth-card register-card" onSubmit={submit}>
        <div className="auth-header">
          <div className="auth-icon">+</div>
          <h2>Create account</h2>
          <p>Fill in your details to get started</p>
        </div>

        {error && <div className="alert error">{error}</div>}
        {message && <div className="alert success">{message}</div>}

        <div className="form-grid">
          <div><label>Full Name</label><input name="name" value={form.name} onChange={change} required /></div>
          <div><label>Username</label><input name="username" value={form.username} onChange={change} required /></div>
          <div><label>Email</label><input type="email" name="email" value={form.email} onChange={change} required /></div>
          <div><label>Phone Number</label><input name="phone" value={form.phone} onChange={change} required /></div>
          <div><label>Password</label><input type="password" name="password" value={form.password} onChange={change} required /></div>
          <div><label>Confirm Password</label><input type="password" name="confirmPassword" value={form.confirmPassword} onChange={change} required /></div>
        </div>

        <label>Role</label>
        <select name="role" value={form.role} onChange={change}>
          <option value="patient">Patient</option>
          <option value="doctor">Doctor</option>
        </select>

        {form.role === "doctor" && (
          <div className="doctor-form-section">
            <h3>Doctor Information</h3>
            <div className="form-grid">
              <div><label>Specialization</label><input name="specialization" value={form.specialization} onChange={change} placeholder="Cardiologist" required /></div>
              <div><label>Experience (years)</label><input type="number" min="0" name="experience" value={form.experience} onChange={change} required /></div>
              <div><label>Qualification</label><input name="qualification" value={form.qualification} onChange={change} placeholder="MBBS, MD" required /></div>
              <div><label>Consultation Fee (₹)</label><input type="number" min="0" name="consultationFee" value={form.consultationFee} onChange={change} required /></div>
            </div>
          </div>
        )}

        <button className="btn-primary auth-submit" disabled={loading}>
          {loading ? "Creating account..." : "Create Account"}
        </button>

        <p className="auth-footer">
          Already registered? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </div>
  );
}
