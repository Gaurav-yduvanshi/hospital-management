# Hospital Management System (MERN)

A modern hospital management system built with the MERN stack (MongoDB, Express, React, Node). This repository contains a multi-role application with features for Users (patients), Hospitals (hospital staff), and Admins.

## Table of Contents
- Project overview
- Features
- Tech stack
- Repository structure
- Local setup (backend + frontend)
- Environment variables
- Running the app
- API reference (summary)
- Key implementation notes
- Troubleshooting
- Next steps / optional enhancements

## Project overview
This app allows patients to search for hospitals, book appointments (surgery or health consultation), and view appointment details. Hospital staff can manage surgeries, health consultations, patients and add comments/feedback to patient appointments. Admins can manage hospitals and users.

## Features
- User signup / login
- Hospital signup / login
- Admin console
- Hospital search with filters (State, District, OPD charge, Surgery charge ranges)
- Book appointments (Surgery or Health Consultation)
- Hospital CRUD for surgeries and health consultations
- Hospital can manage patients, approve appointments, mark surgery/consultation status
- Hospital comments/feedback on each patient appointment (viewable by patient)
- Modern UI with responsive design

## Tech stack
- Frontend: React (hooks)
- Backend: Node.js + Express
- Database: MongoDB (Mongoose)
- HTTP client: Axios

## Repository structure
- `backend/` - Express API, Mongoose models, authentication middleware
- `frontend/` - React app

## Local setup
1. Clone the repository

2. Backend

- Navigate to the backend folder:

```bash
cd backend
```
- Install dependencies:

```bash
npm install
```
- Create `.env` file (see Environment variables below)
- Start backend:

```bash
npm start
# or for development with nodemon
npm run dev
```

3. Frontend

- Navigate to the frontend folder:

```bash
cd frontend
```
- Install dependencies:

```bash
npm install
```
- Start frontend:

```bash
npm start
```

Open the browser at `http://localhost:3000` (or whichever port your frontend is configured to run on).

## Environment variables
Create a `.env` file in `backend/` with the following variables:

```
PORT=3000
MONGO_URI=your_mongo_connection_string
JWT_SECRET=your_jwt_secret
```

Frontend may use `REACT_APP_API_URL` if needed (defaults to `/api` in the project).

## API Reference (summary)
- `POST /api/auth/user/signup` - Register user
- `POST /api/auth/user/login` - Login user
- `POST /api/auth/hospital/signup` - Register hospital
- `POST /api/auth/hospital/login` - Login hospital

Users
- `GET /api/users/search-hospitals` - Search hospitals (filters)
- `GET /api/users/search-non-surgery` - Search for health consultations
- `POST /api/users/book-appointment` - Book appointment
- `GET /api/users/my-appointments` - Get user's appointments

Hospitals
- `GET /api/hospitals/profile` - Get hospital profile (surgeries, health consultations)
- `POST /api/hospitals/surgeries` - Add surgery
- `PUT /api/hospitals/surgeries/:id` - Update surgery
- `DELETE /api/hospitals/surgeries/:id` - Delete surgery
- `POST /api/hospitals/health-issues` - Add health consultation
- `PUT /api/hospitals/health-issues/:id` - Update health consultation
- `DELETE /api/hospitals/health-issues/:id` - Delete health consultation
- `GET /api/hospitals/patients` - List patients (filters)
- `GET /api/hospitals/patients/:id` - Get single patient
- `PATCH /api/hospitals/patients/:id/comments` - Update patient comments/feedback
- `PATCH /api/hospitals/patients/:id/approval` - Update approval status
- `PATCH /api/hospitals/patients/:id/surgery-status` - Mark surgery/consultation status

Admin
- `GET /api/admin/hospitals` - List hospitals
- `POST /api/admin/hospitals` - Create hospital (admin)

## Key implementation notes
- Patient schema includes `appointmentType` (`surgery` | `non-surgery`), `comments`, `description`, `surgeryDone`, and `consultationDone`.
- Hospital dashboard has a `Manage Patients` section where staff can add comments. These comments are visible in `UserDashboard` appointment details.
- Google Maps script was removed; location filtering uses state/district dropdowns.

## Troubleshooting
- 404 when saving comments: ensure backend is running and restarted after code changes. The endpoint is `PATCH /api/hospitals/patients/:id/comments`.
- React Router future flag warnings are informational and safe to ignore.
- If you see Google Maps API warnings, remove any leftover `<script>` tag from `frontend/public/index.html`.

## Next steps / optional enhancements
- Email/SMS notifications when appointments are booked or updated
- Admin approval workflow UI improvements
- Doctor accounts and staff role permissions
- Appointment history and analytics

---

If you'd like, I can also add a short troubleshooting script or commands to run integration tests and verify the comments flow end-to-end.