# HospitalCare — Hospital Appointment System

Moderate MERN machine-test project based on the supplied requirements. It includes patient/doctor authentication, JWT, bcryptjs, doctor search/filtering, appointment booking/cancellation/completion, protected routes, Mongoose populate, seed data, and responsive CSS.

## Setup

### Backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/hospitalAppointmentDB
JWT_SECRET=hospital_machine_test_secret
```

Then:

```bash
npm run seed
npm run dev
```

### Frontend

Open another terminal:

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Then:

```bash
npm run dev
```

Open the Vite URL, normally `http://localhost:5173`.

## Test accounts

Patient:
```text
rajpatient / patient123
```

Doctor:
```text
amitdoc / doctor123
```

Other doctors:
```text
priyadoc / doctor123
rahuldoc / doctor123
nehadoc / doctor123
arjundoc / doctor123
snehadoc / doctor123
```

## API

```http
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me

GET  /api/users/doctors
GET  /api/users/patients

POST /api/appointments
GET  /api/appointments
PUT  /api/appointments/:id/cancel
PUT  /api/appointments/:id/complete
```

## Important files to change

Only create/change:
- `backend/.env` for MongoDB URI and JWT secret
- `frontend/.env` for API URL

Do not commit `.env`.

## Seed behavior

`npm run seed` safely removes only the predefined seed users and their related appointments, hashes passwords with bcryptjs, creates 6 doctors, 4 patients, and 6 future appointments. It uses generated MongoDB ObjectIds rather than hardcoded IDs.

## Architecture

```text
React
  ↓ Axios
Express REST API
  ↓ JWT middleware
Controllers
  ↓ Mongoose
MongoDB
```

All JSX files explicitly import React to avoid `React is not defined` issues with JSX runtimes/configurations.
