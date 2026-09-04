import React from "react";

const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });

export default function AppointmentCard({ appointment, role, onCancel, onComplete }) {
  const person = role === "patient" ? appointment.doctor : appointment.patient;

  return (
    <article className="appointment-card">
      <div className="appointment-main">
        <div className="appointment-avatar">
          {person?.name?.replace("Dr. ", "").charAt(0) || "?"}
        </div>
        <div>
          <h3>{person?.name || "Unknown"}</h3>
          <p className="muted">
            {role === "patient" ? person?.specialization : "Patient"}
          </p>
        </div>
      </div>

      <div className="appointment-info">
        <div><span>Date</span><strong>{formatDate(appointment.appointmentDate)}</strong></div>
        <div><span>Time</span><strong>{appointment.appointmentTime}</strong></div>
        <div><span>Reason</span><strong>{appointment.reason || "General consultation"}</strong></div>
        {role === "doctor" && (
          <div><span>Patient Phone</span><strong>{appointment.patient?.phone || "-"}</strong></div>
        )}
      </div>

      <div className="appointment-actions">
        <span className={`status-badge ${appointment.status.toLowerCase()}`}>
          {appointment.status}
        </span>

        {appointment.status === "Booked" && (
          <>
            {onCancel && (
              <button className="btn-danger" onClick={() => onCancel(appointment._id)}>
                Cancel
              </button>
            )}
            {role === "doctor" && onComplete && (
              <button className="btn-success" onClick={() => onComplete(appointment._id)}>
                Complete
              </button>
            )}
          </>
        )}
      </div>
    </article>
  );
}
