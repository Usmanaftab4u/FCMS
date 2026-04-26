# Family Clinic Management System (FCMS)

**Student:** Muhammad Usman Aftab  
**Student Number:** 2529243  
**Student Username:** MUA6OCD  
**Module:** SWE6011 Agile Programming  
**University:** University of Greater Manchester  
**Tutor:** Renuka Nyayadhish  
**GitHub:** https://github.com/Usmanaftab4u/FCMS.git  
**JIRA:** https://usmana9.atlassian.net/jira/software/projects/FCMS/boards  

---

## Project Overview

The Family Clinic Management System (FCMS) is a full-stack web-based clinic appointment management system built using the Scrum Agile methodology across three sprints. The system supports three distinct user roles — Patient, Doctor and Admin — each with their own dashboard and access controls.

The project was built to address a real problem observed in small family clinics that still rely on paper records and telephone bookings, leading to missed appointments and double bookings.

---

## Technology Stack

| Layer | Technology |
|---|---|
| Backend | Node.js v22 + Express.js |
| Frontend | Angular 19 (standalone components) |
| Database | MongoDB Community Server 8.2 |
| Email | Nodemailer + Gmail |
| Scheduler | node-cron (daily reminders) |
| Auth | JWT (JSON Web Tokens) + bcryptjs |
| Version Control | GitHub |
| Project Management | JIRA (Zephyr Advanced for test cases) |

---

## Features

### Patient Role
- Register with Patient role selection
- View all available doctors with specializations
- View available time slots per doctor
- Book appointments online (step-by-step interface)
- Double booking prevention — cannot book an already-taken slot
- Cannot book same date and time as an existing personal appointment
- View all personal appointments
- Cancel appointments
- Receive HTML confirmation email after booking
- Receive automated reminder email the day before appointment

### Doctor Role
- Register with Doctor role and specialization
- Separate doctor dashboard (not accessible to patients)
- View all patient appointments booked with them
- See patient name, email and phone number for each appointment
- Filter appointments by status or date
- Cancel any of their patient appointments
- Reschedule patient appointments to a new date and time
- Add new availability slots from dashboard
- Remove available slots from dashboard

### Admin Role
- Single admin account created via backend script
- Four-tab admin dashboard:
  - **Appointments tab** — view all appointments across all doctors with patient email and phone, filter by date/doctor/status, cancel or reschedule any appointment
  - **Manage Doctors tab** — view all registered doctors with slot statistics
  - **Manage Slots tab** — add new slots to any doctor, edit existing slot date and time inline, remove available slots
  - **Add Doctor tab** — create new doctor accounts directly from admin panel

---

## Project Structure

```
FCMS/
├── backend/
│   ├── models/
│   │   ├── Patient.js          (unified User model - patient/doctor/admin roles)
│   │   ├── Doctor.js           (doctor schedule and slots model)
│   │   └── Appointment.js      (appointment model with cancelledBy field)
│   ├── routes/
│   │   ├── auth.js             (register + login for all roles)
│   │   ├── doctors.js          (doctor CRUD + slot management)
│   │   └── appointments.js     (booking + cancel + reschedule)
│   ├── services/
│   │   ├── emailService.js     (Nodemailer confirmation + reminder emails)
│   │   └── reminderScheduler.js (node-cron daily 8am reminder check)
│   ├── server.js               (main Express server)
│   ├── seed.js                 (creates 3 test doctors with slots)
│   ├── createAdmin.js          (creates admin account)
│   ├── .env.example            (environment variable template)
│   └── package.json
│
└── frontend/
    └── fcms-app/
        └── src/
            └── app/
                ├── components/
                │   ├── navbar/             (role-based navigation)
                │   ├── home/               (landing page)
                │   ├── login/              (login with role redirect)
                │   ├── register/           (patient or doctor registration)
                │   ├── book-appointment/   (patient booking interface)
                │   ├── my-appointments/    (patient appointment list)
                │   ├── doctor-dashboard/   (doctor portal)
                │   └── admin-dashboard/    (admin four-tab panel)
                ├── services/
                │   ├── api.service.ts      (all HTTP calls to backend)
                │   └── auth.service.ts     (JWT storage + role checks)
                ├── app.routes.ts           (role-based routing)
                └── app.config.ts           (Angular providers)
```

---

## How to Run This Project

### Prerequisites

- Node.js v20 or higher — https://nodejs.org
- MongoDB Community Server running locally — https://www.mongodb.com/try/download/community
- Angular CLI — install with: `npm install -g @angular/cli`
- Git — https://git-scm.com

### Step 1 — Clone the repository

```bash
git clone https://github.com/Usmanaftab4u/FCMS.git
cd FCMS
```

### Step 2 — Set up the backend

```bash
cd backend
npm install
```

Create a `.env` file inside the backend folder. Use `.env.example` as a template:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/fcms
JWT_SECRET=your_secret_key_here
NODE_ENV=development
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_16_character_gmail_app_password
EMAIL_FROM=FCMS Clinic <your_gmail@gmail.com>
```

**Important for email:** You must generate a Gmail App Password at myaccount.google.com → Security → 2-Step Verification → App Passwords. The EMAIL_PASS must be the 16-character app password with no spaces, not your regular Gmail password.

### Step 3 — Start MongoDB

Make sure MongoDB is running. On Windows it runs as a service automatically after installation. Verify in MongoDB Compass by clicking Connect — if it connects, MongoDB is running.

### Step 4 — Seed the database with test doctors

```bash
cd backend
node seed.js
```

This creates three test doctor accounts (Dr. Ahmed Khan, Dr. Sara Malik, Dr. Bilal Hassan) with available appointment slots. All doctors use the password: **doctor123**

### Step 5 — Create the admin account

```bash
node createAdmin.js
```

This creates the admin user at admin@fcms.com with password admin123.

### Step 6 — Start the backend server

```bash
node server.js
```

You should see:
```
FCMS Server running on port 5000
MongoDB connected successfully
Email service ready
Reminder scheduler started — runs daily at 8:00 AM
```

### Step 7 — Set up and run the frontend (new terminal window)

```bash
cd frontend/fcms-app
npm install
ng serve
```

Open your browser at: **http://localhost:4200**

---

## Test Accounts

| Role | Email | Password | Notes |
|---|---|---|---|
| Admin | admin@fcms.com | admin123 | Created via createAdmin.js |
| Doctor | ahmed.khan@fcms.com | doctor123 | Created via seed.js |
| Doctor | sara.malik@fcms.com | doctor123 | Created via seed.js |
| Doctor | bilal.hassan@fcms.com | doctor123 | Created via seed.js |
| Patient | Register at /register | your choice | Select Patient role |

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/register | Register patient or doctor |
| POST | /api/auth/login | Login all roles |
| GET | /api/doctors | Get all doctors with slots |
| GET | /api/doctors/by-user/:userId | Get doctor profile by user ID |
| POST | /api/doctors | Create new doctor profile |
| PUT | /api/doctors/:id/slots | Update all doctor slots |
| POST | /api/doctors/:id/slots | Add single slot to doctor |
| DELETE | /api/doctors/:doctorId/slots/:slotId | Remove a slot |
| GET | /api/appointments | Get all appointments (admin) |
| GET | /api/appointments/patient/:id | Get patient appointments |
| GET | /api/appointments/doctor/:id | Get doctor appointments |
| POST | /api/appointments | Book new appointment |
| PUT | /api/appointments/:id/cancel | Cancel appointment |
| PUT | /api/appointments/:id/reschedule | Reschedule appointment |

---

## Sprint Summary

| Sprint | Duration | Items | Story Points | Outcome |
|---|---|---|---|---|
| Sprint 0 | 2 Mar – 16 Mar 2026 | FCMS-1 to FCMS-4 | 18 pts | FCMS-1, 2 done. FCMS-3, 4 carried to Sprint 1 due to CORS configuration issues |
| Sprint 1 | 16 Mar – 6 Apr 2026 | FCMS-3 to FCMS-8 | 28 pts | FCMS-3, 4, 6, 7 done. FCMS-5, 8 carried to Sprint 2 |
| Sprint 2 | 6 Apr – 20 Apr 2026 | FCMS-5, 8–11, 14–21 | 41 pts | All 13 items completed — 100% velocity |

---

## Artefacts Included in Submission

- `FCMS_Sprint_Burndown_FINAL.xlsx` — Sprint 0, Sprint 1 and Sprint 2 burndown charts
- `Risk_Management_Log_FCMS_2529243.xlsx` — Full risk log reviewed at each sprint

---

## Known Limitations

- Role-based access control is enforced in the Angular frontend only. Backend API routes do not currently verify JWT roles via middleware. This is identified as a future improvement before any production deployment.
- The admin account can only be created via the createAdmin.js script — there is no admin registration through the UI by design.
- Email notifications require a valid Gmail account with App Password configured. If EMAIL_USER and EMAIL_PASS are not set in .env, the server will still run but emails will not send.

---

## Future Enhancements (Release 2)

- FCMS-12: Laboratory test booking module
- FCMS-13: WhatsApp chatbot integration for appointment management
- JWT middleware on backend routes for server-side role enforcement
- Admin dashboard refactored into separate Angular components per tab
