import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import DoctorCard from "../components/DoctorCard";
import DashboardCard from "../components/DashboardCard";
import api from "../services/api";

const specializations = ["All", "Cardiologist", "Dentist", "Dermatologist", "Pediatrician", "Orthopedic", "General Physician"];
const timeSlots = ["09:00 AM","10:00 AM","11:00 AM","12:00 PM","02:00 PM","03:00 PM","04:00 PM","05:00 PM"];

export default function PatientDashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [search, setSearch] = useState("");
  const [specialization, setSpecialization] = useState("All");
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [form, setForm] = useState({ appointmentDate: "", appointmentTime: "", reason: "" });
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const [doctorRes, appointmentRes] = await Promise.all([
        api.get("/users/doctors"),
        api.get("/appointments")
      ]);
      setDoctors(doctorRes.data);
      setAppointments(appointmentRes.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const filteredDoctors = useMemo(() => {
    const q = search.toLowerCase();
    return doctors.filter((doctor) => {
      const matchesSearch =
        doctor.name.toLowerCase().includes(q) ||
        doctor.specialization.toLowerCase().includes(q);
      const matchesSpec = specialization === "All" || doctor.specialization === specialization;
      return matchesSearch && matchesSpec;
    });
  }, [doctors, search, specialization]);

  const upcoming = appointments.filter((a) => a.status === "Booked").length;
  const completed = appointments.filter((a) => a.status === "Completed").length;

  const openBooking = (doctor) => {
    setError("");
    setMessage("");
    setSelectedDoctor(doctor);
  };

  const closeBooking = () => {
    setSelectedDoctor(null);
    setForm({ appointmentDate: "", appointmentTime: "", reason: "" });
  };

  const bookAppointment = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setBooking(true);

    try {
      await api.post("/appointments", {
        doctorId: selectedDoctor._id,
        ...form
      });
      setMessage("Appointment booked successfully");
      closeBooking();
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Booking failed");
    } finally {
      setBooking(false);
    }
  };

  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="dashboard-hero">
          <div>
            <span className="eyebrow">PATIENT DASHBOARD</span>
            <h1>Welcome back, {user?.name?.split(" ")[0]}.</h1>
            <p>Find a doctor and manage your upcoming healthcare visits.</p>
          </div>
          <Link className="btn-primary" to="/patient/appointments">View My Appointments</Link>
        </div>

        {error && <div className="alert error">{error}</div>}
        {message && <div className="alert success">{message}</div>}

        <div className="stats-grid">
          <DashboardCard title="Available Doctors" value={doctors.length} icon="D" />
          <DashboardCard title="My Appointments" value={appointments.length} icon="A" />
          <DashboardCard title="Upcoming" value={upcoming} icon="U" />
          <DashboardCard title="Completed" value={completed} icon="✓" />
        </div>

        <section className="section">
          <div className="section-heading">
            <div><span className="eyebrow">FIND CARE</span><h2>Find a Doctor</h2></div>
            <span className="result-count">{filteredDoctors.length} doctors</span>
          </div>

          <div className="filters">
            <div className="search-box">
              <span>⌕</span>
              <input placeholder="Search doctor or specialization..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <select value={specialization} onChange={(e) => setSpecialization(e.target.value)}>
              {specializations.map((item) => <option key={item}>{item}</option>)}
            </select>
          </div>

          {loading ? (
            <div className="empty-state">Loading doctors...</div>
          ) : filteredDoctors.length === 0 ? (
            <div className="empty-state">No doctors match your search.</div>
          ) : (
            <div className="doctor-grid">
              {filteredDoctors.map((doctor) => (
                <DoctorCard key={doctor._id} doctor={doctor} onBook={openBooking} />
              ))}
            </div>
          )}
        </section>

        <section className="section">
          <div className="section-heading">
            <div><span className="eyebrow">YOUR VISITS</span><h2>Recent Appointments</h2></div>
            <Link to="/patient/appointments">View all →</Link>
          </div>

          {appointments.length === 0 ? (
            <div className="empty-state">No appointments yet.</div>
          ) : (
            <div className="appointment-list">
              {appointments.slice(0, 3).map((a) => (
                <div className="appointment-summary" key={a._id}>
                  <div><strong>{a.doctor?.name}</strong><span>{a.doctor?.specialization}</span></div>
                  <div><strong>{new Date(a.appointmentDate).toLocaleDateString("en-IN")}</strong><span>{a.appointmentTime}</span></div>
                  <span className={`status-badge ${a.status.toLowerCase()}`}>{a.status}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {selectedDoctor && (
        <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && closeBooking()}>
          <form className="modal-card" onSubmit={bookAppointment}>
            <div className="modal-header">
              <div><span className="eyebrow">BOOK VISIT</span><h2>Appointment Details</h2></div>
              <button type="button" className="icon-button" onClick={closeBooking}>×</button>
            </div>

            <div className="selected-doctor">
              <div className="doctor-avatar small">{selectedDoctor.name.replace("Dr. ", "").charAt(0)}</div>
              <div><strong>{selectedDoctor.name}</strong><span>{selectedDoctor.specialization} · ₹{selectedDoctor.consultationFee}</span></div>
            </div>

            <div className="form-grid">
              <div>
                <label>Appointment Date</label>
                <input type="date" min={new Date().toISOString().split("T")[0]} value={form.appointmentDate} onChange={(e) => setForm({ ...form, appointmentDate: e.target.value })} required />
              </div>
              <div>
                <label>Appointment Time</label>
                <select value={form.appointmentTime} onChange={(e) => setForm({ ...form, appointmentTime: e.target.value })} required>
                  <option value="">Select time</option>
                  {timeSlots.map((time) => <option key={time}>{time}</option>)}
                </select>
              </div>
            </div>

            <label>Reason for Visit</label>
            <textarea placeholder="Briefly describe your reason for visit..." value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />

            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={closeBooking}>Cancel</button>
              <button className="btn-primary" disabled={booking}>{booking ? "Booking..." : "Confirm Appointment"}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
