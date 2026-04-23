import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="dashboard-header">
        <h2>Admin Dashboard</h2>
        <div class="stats">
          <div class="stat-card">
            <div class="stat-number">{{ appointments.length }}</div>
            <div class="stat-label">Total Appointments</div>
          </div>
          <div class="stat-card confirmed">
            <div class="stat-number">{{ getCount('confirmed') }}</div>
            <div class="stat-label">Confirmed</div>
          </div>
          <div class="stat-card cancelled">
            <div class="stat-number">{{ getCount('cancelled') }}</div>
            <div class="stat-label">Cancelled</div>
          </div>
          <div class="stat-card doctors">
            <div class="stat-number">{{ doctors.length }}</div>
            <div class="stat-label">Total Doctors</div>
          </div>
        </div>
      </div>

      <!-- Filter Appointments -->
      <div class="section-card">
        <h3>Filter Appointments</h3>
        <div class="filters-row">
          <div class="form-group">
            <label>Filter by Date</label>
            <input
              type="date"
              [(ngModel)]="filterDate"
              (change)="applyFilters()"
            />
          </div>
          <div class="form-group">
            <label>Filter by Doctor</label>
            <select [(ngModel)]="filterDoctor" (change)="applyFilters()">
              <option value="">All Doctors</option>
              <option *ngFor="let doc of doctors" [value]="doc._id">
                {{ doc.name }}
              </option>
            </select>
          </div>
          <button (click)="clearFilters()" class="btn-clear">
            Clear Filters
          </button>
        </div>
      </div>

      <!-- Appointments Table -->
      <div class="section-card">
        <h3>All Appointments ({{ filteredAppointments.length }})</h3>
        <div class="loading" *ngIf="loading">Loading appointments...</div>
        <div
          class="empty"
          *ngIf="!loading && filteredAppointments.length === 0"
        >
          No appointments found.
        </div>
        <div
          class="table-wrapper"
          *ngIf="!loading && filteredAppointments.length > 0"
        >
          <table>
            <thead>
              <tr>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Specialization</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr
                *ngFor="let appt of filteredAppointments"
                [class.cancelled-row]="appt.status === 'cancelled'"
              >
                <td>
                  <div class="patient-name">{{ appt.patient?.name }}</div>
                  <div class="patient-email">{{ appt.patient?.email }}</div>
                </td>
                <td>{{ appt.doctor?.name }}</td>
                <td>{{ appt.doctor?.specialization }}</td>
                <td>{{ formatDate(appt.date) }}</td>
                <td>{{ appt.time }}</td>
                <td>
                  <span class="badge" [class]="appt.status">
                    {{ appt.status | titlecase }}
                  </span>
                </td>
                <td>
                  <button
                    *ngIf="appt.status === 'confirmed'"
                    (click)="cancelAppointment(appt._id)"
                    class="btn-action-cancel"
                    [disabled]="cancelling === appt._id"
                  >
                    {{ cancelling === appt._id ? '...' : 'Cancel' }}
                  </button>
                  <span *ngIf="appt.status !== 'confirmed'" class="no-action">
                    —
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Add New Doctor -->
      <div class="section-card">
        <h3>Add New Doctor</h3>
        <div class="form-row">
          <div class="form-group">
            <label>Doctor Name</label>
            <input
              type="text"
              [(ngModel)]="newDoctor.name"
              placeholder="e.g. Dr. Ali Hassan"
            />
          </div>
          <div class="form-group">
            <label>Specialization</label>
            <input
              type="text"
              [(ngModel)]="newDoctor.specialization"
              placeholder="e.g. General Practitioner"
            />
          </div>
          <div class="form-group">
            <label>Email</label>
            <input
              type="email"
              [(ngModel)]="newDoctor.email"
              placeholder="doctor@fcms.com"
            />
          </div>
          <div class="form-group">
            <label>Phone</label>
            <input
              type="text"
              [(ngModel)]="newDoctor.phone"
              placeholder="03001234567"
            />
          </div>
        </div>
        <button (click)="addDoctor()" [disabled]="addingDoctor" class="btn-add">
          {{ addingDoctor ? 'Adding Doctor...' : '+ Add Doctor' }}
        </button>
        <div class="success-msg" *ngIf="doctorSuccess">{{ doctorSuccess }}</div>
        <div class="error-msg" *ngIf="doctorError">{{ doctorError }}</div>
      </div>

      <!-- Add Time Slots -->
      <div class="section-card">
        <h3>Add Time Slots to Doctor</h3>
        <div class="form-row">
          <div class="form-group">
            <label>Select Doctor</label>
            <select [(ngModel)]="slotDoctorId">
              <option value="">Choose a doctor...</option>
              <option *ngFor="let doc of doctors" [value]="doc._id">
                {{ doc.name }} — {{ doc.specialization }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Date</label>
            <input type="date" [(ngModel)]="newSlot.date" />
          </div>
          <div class="form-group">
            <label>Time</label>
            <select [(ngModel)]="newSlot.time">
              <option value="">Select time...</option>
              <option *ngFor="let t of timeOptions" [value]="t">{{ t }}</option>
            </select>
          </div>
        </div>
        <button (click)="addSlot()" [disabled]="addingSlot" class="btn-add">
          {{ addingSlot ? 'Adding Slot...' : '+ Add Slot' }}
        </button>
        <div class="success-msg" *ngIf="slotSuccess">{{ slotSuccess }}</div>
        <div class="error-msg" *ngIf="slotError">{{ slotError }}</div>
      </div>

      <!-- Doctor Availability Management -->
      <div class="section-card">
        <h3>Manage Doctor Availability</h3>
        <div class="doctors-availability">
          <div *ngFor="let doctor of doctors" class="doctor-avail-card">
            <div class="da-header">
              <span class="da-name">👨‍⚕️ {{ doctor.name }}</span>
              <span class="da-spec">{{ doctor.specialization }}</span>
              <span class="da-count">
                {{ getAvailableCount(doctor) }} available slots
              </span>
            </div>
            <div class="slots-list" *ngIf="doctor.availableSlots.length > 0">
              <div
                *ngFor="let slot of doctor.availableSlots"
                class="slot-item"
                [class.slot-unavailable]="!slot.isAvailable"
              >
                <span class="slot-date">{{ slot.date }}</span>
                <span class="slot-time">{{ slot.time }}</span>
                <span class="slot-status">
                  {{ slot.isAvailable ? '✅ Available' : '❌ Booked' }}
                </span>
                <button
                  *ngIf="slot.isAvailable"
                  (click)="removeSlot(doctor._id, slot._id)"
                  class="btn-remove"
                >
                  Remove
                </button>
              </div>
            </div>
            <div class="no-slots" *ngIf="doctor.availableSlots.length === 0">
              No slots added yet. Use the form above to add slots.
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .page-container {
        max-width: 1100px;
        margin: 0 auto;
        padding-bottom: 60px;
      }

      /* Header & Stats */
      .dashboard-header {
        margin-bottom: 24px;
      }
      h2 {
        color: #1976d2;
        font-size: 28px;
        margin-bottom: 20px;
      }
      h3 {
        color: #333;
        font-size: 18px;
        margin-bottom: 16px;
        margin-top: 0;
      }

      .stats {
        display: flex;
        gap: 16px;
        flex-wrap: wrap;
      }
      .stat-card {
        background: white;
        border-radius: 10px;
        padding: 20px 28px;
        text-align: center;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        border-top: 4px solid #1976d2;
        min-width: 120px;
      }
      .stat-card.confirmed {
        border-top-color: #66bb6a;
      }
      .stat-card.cancelled {
        border-top-color: #ef5350;
      }
      .stat-card.doctors {
        border-top-color: #ab47bc;
      }
      .stat-number {
        font-size: 36px;
        font-weight: bold;
        color: #333;
      }
      .stat-label {
        color: #666;
        font-size: 13px;
        margin-top: 4px;
      }

      /* Section cards */
      .section-card {
        background: white;
        border-radius: 12px;
        padding: 24px;
        margin-bottom: 20px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      }

      /* Filters */
      .filters-row {
        display: flex;
        gap: 16px;
        align-items: flex-end;
        flex-wrap: wrap;
      }
      .btn-clear {
        padding: 9px 18px;
        background: #f5f5f5;
        border: 1px solid #ddd;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        height: 38px;
      }
      .btn-clear:hover {
        background: #eeeeee;
      }

      /* Table */
      .loading,
      .empty {
        text-align: center;
        padding: 30px;
        color: #666;
      }
      .table-wrapper {
        overflow-x: auto;
      }
      table {
        width: 100%;
        border-collapse: collapse;
      }
      th {
        background: #1976d2;
        color: white;
        padding: 12px 16px;
        text-align: left;
        font-size: 14px;
      }
      td {
        padding: 12px 16px;
        border-bottom: 1px solid #f0f0f0;
        font-size: 14px;
        color: #333;
      }
      tr:hover:not(.cancelled-row) {
        background: #fafafa;
      }
      .cancelled-row {
        opacity: 0.6;
      }
      .patient-name {
        font-weight: 600;
        color: #333;
      }
      .patient-email {
        font-size: 12px;
        color: #888;
      }

      .badge {
        padding: 3px 10px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
      }
      .badge.confirmed {
        background: #e3f2fd;
        color: #1565c0;
      }
      .badge.cancelled {
        background: #ffebee;
        color: #c62828;
      }
      .badge.completed {
        background: #e8f5e9;
        color: #2e7d32;
      }

      .btn-action-cancel {
        background: white;
        color: #ef5350;
        border: 1px solid #ef5350;
        padding: 4px 12px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
      }
      .btn-action-cancel:hover:not(:disabled) {
        background: #ffebee;
      }
      .no-action {
        color: #ccc;
      }

      /* Forms */
      .form-row {
        display: flex;
        flex-wrap: wrap;
        gap: 16px;
        margin-bottom: 16px;
      }
      .form-group {
        display: flex;
        flex-direction: column;
        gap: 6px;
        min-width: 200px;
        flex: 1;
      }
      .form-group label {
        color: #555;
        font-size: 14px;
        font-weight: 500;
      }
      .form-group input,
      .form-group select {
        padding: 9px 12px;
        border: 1px solid #ddd;
        border-radius: 6px;
        font-size: 14px;
        background: white;
      }
      .form-group input:focus,
      .form-group select:focus {
        border-color: #1976d2;
        outline: none;
      }

      .btn-add {
        background: #1976d2;
        color: white;
        border: none;
        padding: 10px 24px;
        border-radius: 6px;
        font-size: 15px;
        cursor: pointer;
        transition: background 0.2s;
      }
      .btn-add:hover:not(:disabled) {
        background: #1565c0;
      }
      .btn-add:disabled {
        background: #90caf9;
        cursor: not-allowed;
      }

      .success-msg {
        color: #2e7d32;
        margin-top: 12px;
        font-size: 14px;
        background: #e8f5e9;
        padding: 8px 12px;
        border-radius: 6px;
      }
      .error-msg {
        color: #c62828;
        margin-top: 12px;
        font-size: 14px;
        background: #ffebee;
        padding: 8px 12px;
        border-radius: 6px;
      }

      /* Doctor availability */
      .doctors-availability {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .doctor-avail-card {
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        overflow: hidden;
      }
      .da-header {
        background: #f5f5f5;
        padding: 12px 16px;
        display: flex;
        align-items: center;
        gap: 16px;
        flex-wrap: wrap;
      }
      .da-name {
        font-weight: bold;
        color: #333;
        font-size: 15px;
      }
      .da-spec {
        color: #1976d2;
        font-size: 13px;
      }
      .da-count {
        margin-left: auto;
        font-size: 12px;
        background: #e3f2fd;
        color: #1565c0;
        padding: 3px 10px;
        border-radius: 20px;
      }

      .slots-list {
        padding: 4px 0;
      }
      .slot-item {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 10px 16px;
        border-bottom: 1px solid #f5f5f5;
        font-size: 14px;
      }
      .slot-item:last-child {
        border-bottom: none;
      }
      .slot-item.slot-unavailable {
        background: #fafafa;
        color: #aaa;
      }
      .slot-date {
        font-weight: 500;
        min-width: 100px;
      }
      .slot-time {
        color: #555;
        min-width: 90px;
      }
      .slot-status {
        font-size: 13px;
      }
      .btn-remove {
        margin-left: auto;
        background: white;
        color: #ef5350;
        border: 1px solid #ef5350;
        padding: 4px 12px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
      }
      .btn-remove:hover {
        background: #ffebee;
      }

      .no-slots {
        padding: 16px;
        color: #999;
        font-size: 14px;
        font-style: italic;
      }
    `,
  ],
})
export class AdminDashboardComponent implements OnInit {
  // Data
  appointments: any[] = [];
  filteredAppointments: any[] = [];
  doctors: any[] = [];

  // Filters
  filterDate = '';
  filterDoctor = '';

  // State
  loading = true;
  cancelling = '';

  // Add Doctor form
  newDoctor = { name: '', specialization: '', email: '', phone: '' };
  addingDoctor = false;
  doctorSuccess = '';
  doctorError = '';

  // Add Slot form
  newSlot = { date: '', time: '' };
  slotDoctorId = '';
  addingSlot = false;
  slotSuccess = '';
  slotError = '';

  timeOptions = [
    '09:00 AM',
    '09:30 AM',
    '10:00 AM',
    '10:30 AM',
    '11:00 AM',
    '11:30 AM',
    '12:00 PM',
    '12:30 PM',
    '01:00 PM',
    '01:30 PM',
    '02:00 PM',
    '02:30 PM',
    '03:00 PM',
    '03:30 PM',
    '04:00 PM',
    '04:30 PM',
    '05:00 PM',
    '05:30 PM',
    '06:00 PM',
    '06:30 PM',
    '07:00 PM',
    '07:30 PM',
    '08:00 PM',
    '08:30 PM',
    '09:00 PM',
    '09:30 PM',
    '10:00 PM',
    '10:30 PM',
    '11:00 PM',
    '11:30 PM',
  ];

  constructor(
    public auth: AuthService,
    private api: ApiService,
    public router: Router,
  ) {}

  ngOnInit() {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadData();
  }

  loadData() {
    this.loading = true;

    this.api.getDoctors().subscribe({
      next: (res: any) => {
        this.doctors = res.data;
      },
      error: () => {},
    });

    this.api.getAllAppointments().subscribe({
      next: (res: any) => {
        this.appointments = res.data;
        this.filteredAppointments = res.data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  applyFilters() {
    this.filteredAppointments = this.appointments.filter((appt) => {
      const dateMatch = !this.filterDate || appt.date === this.filterDate;
      const doctorMatch =
        !this.filterDoctor || appt.doctor?._id === this.filterDoctor;
      return dateMatch && doctorMatch;
    });
  }

  clearFilters() {
    this.filterDate = '';
    this.filterDoctor = '';
    this.filteredAppointments = this.appointments;
  }

  getCount(status: string): number {
    return this.appointments.filter((a) => a.status === status).length;
  }

  getAvailableCount(doctor: any): number {
    return doctor.availableSlots.filter((s: any) => s.isAvailable).length;
  }

  cancelAppointment(id: string) {
    this.cancelling = id;
    this.api.cancelAppointment(id).subscribe({
      next: () => {
        this.cancelling = '';
        this.loadData();
      },
      error: () => {
        this.cancelling = '';
      },
    });
  }

  addDoctor() {
    if (
      !this.newDoctor.name ||
      !this.newDoctor.specialization ||
      !this.newDoctor.email
    ) {
      this.doctorError = 'Please fill in name, specialization and email';
      return;
    }
    this.addingDoctor = true;
    this.doctorError = '';
    this.doctorSuccess = '';

    this.api.createDoctor(this.newDoctor).subscribe({
      next: (res: any) => {
        this.addingDoctor = false;
        this.doctorSuccess = `${res.data.name} added successfully!`;
        this.newDoctor = { name: '', specialization: '', email: '', phone: '' };
        this.loadData();
      },
      error: (err: any) => {
        this.addingDoctor = false;
        this.doctorError = err.error?.message || 'Failed to add doctor';
      },
    });
  }

  addSlot() {
    if (!this.slotDoctorId || !this.newSlot.date || !this.newSlot.time) {
      this.slotError = 'Please select a doctor, date and time';
      return;
    }
    this.addingSlot = true;
    this.slotError = '';
    this.slotSuccess = '';

    const doctor = this.doctors.find((d) => d._id === this.slotDoctorId);
    const updatedSlots = [
      ...doctor.availableSlots,
      { date: this.newSlot.date, time: this.newSlot.time, isAvailable: true },
    ];

    this.api.updateDoctorSlots(this.slotDoctorId, updatedSlots).subscribe({
      next: () => {
        this.addingSlot = false;
        this.slotSuccess = `Slot added: ${this.newSlot.date} at ${this.newSlot.time}`;
        this.newSlot = { date: '', time: '' };
        this.slotDoctorId = '';
        this.loadData();
      },
      error: () => {
        this.addingSlot = false;
        this.slotError = 'Failed to add slot. Please try again.';
      },
    });
  }

  removeSlot(doctorId: string, slotId: string) {
    this.api.deleteSlot(doctorId, slotId).subscribe({
      next: () => {
        this.loadData();
      },
      error: (err: any) => {
        console.error('Failed to remove slot', err);
      },
    });
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-GB', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
}
