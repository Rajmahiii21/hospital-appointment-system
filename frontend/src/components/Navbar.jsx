import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const dashboard = user?.role === "doctor" ? "/doctor/dashboard" : "/patient/dashboard";

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <header className="navbar">
      <Link className="brand" to={user ? dashboard : "/login"}>
        <span className="brand-mark">+</span>
        <span>HospitalCare</span>
      </Link>

      <nav className="nav-links">
        {!user ? (
          <>
            <Link to="/login">Login</Link>
            <Link className="nav-register" to="/register">Register</Link>
          </>
        ) : user.role === "patient" ? (
          <>
            <Link to="/patient/dashboard">Dashboard</Link>
            <Link to="/patient/appointments">My Appointments</Link>
            <button className="nav-button" onClick={logout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/doctor/dashboard">Dashboard</Link>
            <Link to="/doctor/dashboard#appointments">Appointments</Link>
            <button className="nav-button" onClick={logout}>Logout</button>
          </>
        )}
      </nav>
    </header>
  );
}
