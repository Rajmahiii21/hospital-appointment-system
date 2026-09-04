import React, { useEffect, useMemo, useState } from "react";
import DashboardCard from "../components/DashboardCard";
import AppointmentCard from "../components/AppointmentCard";
import api from "../services/api";

export default function DoctorDashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/appointments");
      setAppointments(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const todayCount = useMemo(() => {
    const today = new Date().toDateString();
    return appointments.filter((a) =>
      new Date(a.appointmentDate).toDateString() === today && a.status === "Booked"
    ).length;
  }, [appointments]);

  const counts = {
    total: appointments.length,
    completed: appointments.filter((a) => a.status === "Completed").length,
    cancelled: appointments.filter((a) => a.status === "Cancelled").length
  };

  const filtered = filter === "All" ? appointments : appointments.filter((a) => a.status === filter);

  const cancel = async (id) => {
    if (!window.confirm("Cancel this appointment?")) return;
    try {
      await api.put(`/appointments/${id}/cancel`);
      setMessage("Appointment cancelled successfully");
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Cancellation failed");
    }
  };

  const complete = async (id) => {
    try {
      await api.put(`/appointments/${id}/complete`);
      setMessage("Appointment completed successfully");
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to complete appointment");
    }
  };

  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="dashboard-hero">
          <div>
            <span className="eyebrow">DOCTOR DASHBOARD</span>
            <h1>Welcome, {user?.name}.</h1>
            <p>Review patient visits and manage today's appointments.</p>
          </div>
          <div className="doctor-profile-pill">
            <div className="doctor-avatar small">{user?.name?.replace("Dr. ", "").charAt(0)}</div>
            <div><strong>{user?.name}</strong><span>Doctor</span></div>
          </div>
        </div>

        {error && <div className="alert error">{error}</div>}
        {message && <div className="alert success">{message}</div>}

        <div className="stats-grid">
          <DashboardCard title="Total Appointments" value={counts.total} icon="A" />
          <DashboardCard title="Today's Appointments" value={todayCount} icon="T" />
          <DashboardCard title="Completed" value={counts.completed} icon="✓" />
          <DashboardCard title="Cancelled" value={counts.cancelled} icon="C" />
        </div>

        <section className="section" id="appointments">
          <div className="section-heading">
            <div><span className="eyebrow">PATIENT VISITS</span><h2>Upcoming Appointments</h2></div>
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option>All</option><option>Booked</option><option>Cancelled</option><option>Completed</option>
            </select>
          </div>

          {loading ? (
            <div className="empty-state">Loading appointments...</div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">No appointments found.</div>
          ) : (
            <div className="appointment-list">
              {filtered.map((appointment) => (
                <AppointmentCard
                  key={appointment._id}
                  appointment={appointment}
                  role="doctor"
                  onCancel={cancel}
                  onComplete={complete}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
