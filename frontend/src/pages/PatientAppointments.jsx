import React, { useEffect, useState } from "react";
import AppointmentCard from "../components/AppointmentCard";
import api from "../services/api";

export default function PatientAppointments() {
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

  const cancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
    try {
      await api.put(`/appointments/${id}/cancel`);
      setMessage("Appointment cancelled successfully");
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Cancellation failed");
    }
  };

  const filtered = filter === "All" ? appointments : appointments.filter((a) => a.status === filter);

  return (
    <div className="dashboard-page">
      <div className="container narrow-container">
        <div className="page-title-row">
          <div><span className="eyebrow">PATIENT PORTAL</span><h1>My Appointments</h1><p>Keep track of your booked and completed visits.</p></div>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option>All</option><option>Booked</option><option>Cancelled</option><option>Completed</option>
          </select>
        </div>

        {error && <div className="alert error">{error}</div>}
        {message && <div className="alert success">{message}</div>}

        {loading ? (
          <div className="empty-state">Loading appointments...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">No appointments found for this filter.</div>
        ) : (
          <div className="appointment-list">
            {filtered.map((appointment) => (
              <AppointmentCard key={appointment._id} appointment={appointment} role="patient" onCancel={cancel} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
