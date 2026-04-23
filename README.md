# Family Clinic Management System (FCMS)

**Student:** Muhammad Usman Aftab  
**Student Number:** 2529243  
**Module:** SWE6011 Agile Programming  
**University:** University of Greater Manchester  
**Tutor:** Renuka Nyayadhish

## Project Overview

A web-based clinic appointment management system built using the Scrum Agile methodology. Patients can book doctor appointments online and admins can manage bookings through a dashboard.

## Technology Stack

- **Backend:** Node.js + Express.js
- **Frontend:** Angular 19
- **Database:** MongoDB
- **Project Management:** JIRA (FCMS project)

## Features

- Patient registration and login
- View available doctors and time slots
- Book appointments online
- Double booking prevention
- Admin dashboard to manage all appointments
- Email confirmation after booking
- Daily appointment reminder emails
- Doctor availability management by admin
- Cancel appointments

## How to Run This Project

### Prerequisites

- Node.js v20+
- MongoDB Community Server running locally
- Angular CLI: `npm install -g @angular/cli`

### Step 1 - Clone the repository

git clone https://github.com/Usmanaftab4u/FCMS.git cd FCMS

### Step 2 - Set up the backend

cd backend
npm install

Create a `.env` file in the backend folder based on `.env.example`:

PORT=5000
MONGODB_URI=mongodb://localhost:27017/fcms
JWT_SECRET=your_secret_key_here
NODE_ENV=development
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
EMAIL_FROM=FCMS Clinic your_gmail@gmail.com

### Step 3 - Seed the database with test doctors

node seed.js

### Step 4 - Create admin account

node createAdmin.js

### Step 5 - Start the backend server

node server.js

Server runs on: http://localhost:5000

### Step 6 - Set up the frontend (new terminal)

cd frontend/fcms-app
npm install
ng serve

App runs on: http://localhost:4200

## Test Accounts

| Role    | Email                 | Password    |
| ------- | --------------------- | ----------- |
| Admin   | admin@fcms.com        | admin123    |
| Patient | Register at /register | your choice |

## JIRA Project

Project: FCMS  
Board: https://usmana9.atlassian.net/jira/software/projects/FCMS/boards

## Sprint Summary

| Sprint   | Duration            | Items             | Status |
| -------- | ------------------- | ----------------- | ------ |
| Sprint 0 | 2 Mar - 16 Mar 2026 | FCMS-1 to FCMS-4  | Done   |
| Sprint 1 | 16 Mar - 6 Apr 2026 | FCMS-5 to FCMS-8  | Done   |
| Sprint 2 | 6 Apr - 20 Apr 2026 | FCMS-9 to FCMS-11 | Done   |
