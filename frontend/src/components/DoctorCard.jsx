import React from "react";

export default function DoctorCard({ doctor, onBook }) {
  return (
    <article className="doctor-card">
      <div className="doctor-avatar">
        {doctor.name.replace("Dr. ", "").charAt(0)}
      </div>
      <div className="doctor-content">
        <div className="doctor-title-row">
          <div>
            <h3>{doctor.name}</h3>
            <span className="specialization">{doctor.specialization}</span>
          </div>
          <span className="fee">₹{doctor.consultationFee}</span>
        </div>

        <div className="doctor-details">
          <p><strong>Qualification:</strong> {doctor.qualification || "MBBS"}</p>
          <p><strong>Experience:</strong> {doctor.experience} years</p>
          <p><strong>Phone:</strong> {doctor.phone}</p>
        </div>

        <button className="btn-primary full-width" onClick={() => onBook(doctor)}>
          Book Appointment
        </button>
      </div>
    </article>
  );
}
