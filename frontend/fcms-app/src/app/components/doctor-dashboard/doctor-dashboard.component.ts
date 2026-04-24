import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <!-- Header -->
      <div class="dashboard-header">
        <div class="doctor-info">
          <div class="doctor-avatar">👨‍⚕️</div>
          <div>
            <h2>{{ auth.getUser()?.name }}</h2>
            <p class="specialization">{{ auth.getUser()?.specialization }}</p>
          </div>
        </div>
        <div class="stats">
          <div class="stat-card">
            <div class="stat-number">{{ appointments.length }}</div>
            <div class="stat-label">Total</div>
          </div>
          <div class="stat-card confirmed">
            <div class="stat-number">{{ getCount('confirmed') }}</div>
            <div class="stat-label">Upcoming</div>
          </div>
          <div class="stat-card cancelled">
            <div class="stat-number">{{ getCount('cancelled') }}</div>
            <div class="stat-label">Cancelled</div>
          </div>
          <div class="stat-card slots">
            <div class="stat-number">{{ getAvailableSlots() }}</div>
            <div class="stat-label">Open Slots</div>
          </div>
        </div>
      </div>

      <div class="loading" *ngIf="loading">Loading your dashboard...</div>

      <div *ngIf="!loading">
        <!-- My Appointments -->
        <div class="section-card">
          <div class="section-header">
            <h3>My Patient Appointments</h3>
            <div class="filter-row">
              <select [(ngModel)]="filterStatus" (change)="applyFilter()">
                <option value="">All Status</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </select>
              <input
                type="date"
                [(ngModel)]="filterDate"
                (change)="applyFilter()"
              />
              <button (click)="clearFilter()" class="btn-clear">Clear</button>
            </div>
          </div>

          <div class="empty" *ngIf="filteredAppointments.length === 0">
            No appointments found.
          </div>

          <div
            class="appointments-list"
            *ngIf="filteredAppointments.length > 0"
          >
            <div
              *ngFor="let appt of filteredAppointments"
              class="appt-card"
              [class.cancelled]="appt.status === 'cancelled'"
            >
              <div class="appt-left">
                <div class="patient-name">👤 {{ appt.patient?.name }}</div>
                <div class="patient-contact">
                  {{ appt.patient?.email }} | {{ appt.patient?.phone }}
                </div>
              </div>

              <div class="appt-middle">
                <div class="appt-date">📅 {{ formatDate(appt.date) }}</div>
                <div class="appt-time">🕐 {{ appt.time }}</div>
              </div>

              <div class="appt-right">
                <span class="badge" [class]="appt.status">
                  {{ appt.status | titlecase }}
                </span>
              </div>

              <div class="appt-actions" *ngIf="appt.status === 'confirmed'">
                <!-- Reschedule -->
                <div *ngIf="rescheduleId !== appt._id">
                  <button
                    (click)="startReschedule(appt)"
                    class="btn-reschedule"
                  >
                    Reschedule
                  </button>
                  <button
                    (click)="cancelAppointment(appt._id)"
                    class="btn-cancel-small"
                    [disabled]="cancelling === appt._id"
                  >
                    {{ cancelling === appt._id ? '...' : 'Cancel' }}
                  </button>
                </div>

                <!-- Reschedule form -->
                <div *ngIf="rescheduleId === appt._id" class="reschedule-form">
                  <input type="date" [(ngModel)]="newDate" />
                  <select [(ngModel)]="newTime">
                    <option value="">Select time...</option>
                    <option *ngFor="let t of timeOptions" [value]="t">
                      {{ t }}
                    </option>
                  </select>
                  <button
                    (click)="confirmReschedule(appt._id)"
                    class="btn-confirm-small"
                    [disabled]="rescheduling"
                  >
                    {{ rescheduling ? '...' : 'Confirm' }}
                  </button>
                  <button (click)="cancelReschedule()" class="btn-cancel-small">
                    Cancel
                  </button>
                </div>

                <div class="msg-success" *ngIf="rescheduleSuccess === appt._id">
                  ✅ Rescheduled
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Manage My Slots -->
        <div class="section-card">
          <h3>Manage My Availability</h3>

          <!-- Add slot form -->
          <div class="add-slot-form">
            <h4>Add New Time Slot</h4>
            <div class="form-row">
              <div class="form-group">
                <label>Date</label>
                <input type="date" [(ngModel)]="newSlot.date" />
              </div>
              <div class="form-group">
                <label>Time</label>
                <select [(ngModel)]="newSlot.time">
                  <option value="">Select time...</option>
                  <option *ngFor="let t of timeOptions" [value]="t">
                    {{ t }}
                  </option>
                </select>
              </div>
              <div class="form-group btn-group">
                <label>&nbsp;</label>
                <button
                  (click)="addSlot()"
                  [disabled]="addingSlot"
                  class="btn-add"
                >
                  {{ addingSlot ? 'Adding...' : '+ Add Slot' }}
                </button>
              </div>
            </div>
            <div class="success-msg" *ngIf="slotSuccess">{{ slotSuccess }}</div>
            <div class="error-msg" *ngIf="slotError">{{ slotError }}</div>
          </div>

          <!-- Existing slots -->
          <div class="slots-section" *ngIf="doctorProfile">
            <h4>My Current Slots</h4>
            <div
              class="empty"
              *ngIf="doctorProfile.availableSlots.length === 0"
            >
              No slots added yet. Add slots above so patients can book with you.
            </div>
            <div
              class="slots-grid"
              *ngIf="doctorProfile.availableSlots.length > 0"
            >
              <div
                *ngFor="let slot of doctorProfile.availableSlots"
                class="slot-pill"
                [class.slot-booked]="!slot.isAvailable"
              >
                <span class="slot-info">
                  {{ slot.date }} — {{ slot.time }}
                </span>
                <span class="slot-tag">
                  {{ slot.isAvailable ? '✅ Free' : '❌ Booked' }}
                </span>
                <button
                  *ngIf="slot.isAvailable"
                  (click)="removeSlot(slot._id)"
                  class="btn-remove"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .page-container {
        max-width: 1000px;
        margin: 0 auto;
        padding-bottom: 60px;
      }
      .dashboard-header {
        margin-bottom: 24px;
      }
      .doctor-info {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 20px;
      }
      .doctor-avatar {
        font-size: 52px;
      }
      .doctor-info h2 {
        color: #1976d2;
        font-size: 26px;
        margin: 0 0 4px;
      }
      .specialization {
        color: #666;
        margin: 0;
        font-size: 15px;
      }

      .stats {
        display: flex;
        gap: 14px;
        flex-wrap: wrap;
      }
      .stat-card {
        background: white;
        border-radius: 10px;
        padding: 18px 24px;
        text-align: center;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        border-top: 4px solid #1976d2;
        min-width: 100px;
      }
      .stat-card.confirmed {
        border-top-color: #66bb6a;
      }
      .stat-card.cancelled {
        border-top-color: #ef5350;
      }
      .stat-card.slots {
        border-top-color: #ab47bc;
      }
      .stat-number {
        font-size: 32px;
        font-weight: bold;
        color: #333;
      }
      .stat-label {
        color: #888;
        font-size: 12px;
        margin-top: 4px;
      }

      .loading {
        text-align: center;
        padding: 40px;
        color: #666;
      }

      .section-card {
        background: white;
        border-radius: 12px;
        padding: 24px;
        margin-bottom: 20px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      }
      h3 {
        color: #333;
        font-size: 18px;
        margin: 0 0 16px;
      }
      h4 {
        color: #555;
        font-size: 15px;
        margin: 0 0 14px;
      }

      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        flex-wrap: wrap;
        gap: 12px;
        margin-bottom: 16px;
      }
      .filter-row {
        display: flex;
        gap: 10px;
        align-items: center;
        flex-wrap: wrap;
      }
      .filter-row input,
      .filter-row select {
        padding: 7px 10px;
        border: 1px solid #ddd;
        border-radius: 6px;
        font-size: 13px;
      }
      .btn-clear {
        padding: 7px 14px;
        background: #f5f5f5;
        border: 1px solid #ddd;
        border-radius: 6px;
        cursor: pointer;
        font-size: 13px;
      }

      .empty {
        text-align: center;
        padding: 30px;
        color: #999;
        font-style: italic;
      }

      .appointments-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .appt-card {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 16px;
        border: 1px solid #e0e0e0;
        border-radius: 10px;
        flex-wrap: wrap;
        transition: background 0.15s;
      }
      .appt-card:hover {
        background: #fafafa;
      }
      .appt-card.cancelled {
        opacity: 0.6;
      }
      .appt-left {
        flex: 1;
        min-width: 180px;
      }
      .patient-name {
        font-weight: 600;
        color: #333;
        font-size: 15px;
      }
      .patient-contact {
        color: #888;
        font-size: 12px;
        margin-top: 3px;
      }
      .appt-middle {
        min-width: 160px;
      }
      .appt-date {
        color: #555;
        font-size: 14px;
      }
      .appt-time {
        color: #888;
        font-size: 13px;
        margin-top: 3px;
      }
      .appt-right {
        min-width: 90px;
      }
      .badge {
        padding: 4px 12px;
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

      .appt-actions {
        min-width: 200px;
      }
      .reschedule-form {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        align-items: center;
      }
      .reschedule-form input,
      .reschedule-form select {
        padding: 5px 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 13px;
      }
      .btn-reschedule {
        background: #1976d2;
        color: white;
        border: none;
        padding: 5px 12px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        margin-right: 6px;
      }
      .btn-confirm-small {
        background: #388e3c;
        color: white;
        border: none;
        padding: 5px 12px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
      }
      .btn-cancel-small {
        background: white;
        color: #ef5350;
        border: 1px solid #ef5350;
        padding: 5px 12px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
      }
      .msg-success {
        color: #2e7d32;
        font-size: 12px;
        margin-top: 4px;
      }

      .add-slot-form {
        background: #f8f9fa;
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 20px;
      }
      .form-row {
        display: flex;
        gap: 16px;
        flex-wrap: wrap;
        align-items: flex-end;
      }
      .form-group {
        display: flex;
        flex-direction: column;
        gap: 6px;
        min-width: 160px;
      }
      .form-group label {
        color: #555;
        font-size: 13px;
        font-weight: 500;
      }
      .form-group input,
      .form-group select {
        padding: 8px 12px;
        border: 1px solid #ddd;
        border-radius: 6px;
        font-size: 14px;
        background: white;
      }
      .btn-group {
        justify-content: flex-end;
      }
      .btn-add {
        background: #1976d2;
        color: white;
        border: none;
        padding: 9px 20px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        white-space: nowrap;
      }
      .btn-add:disabled {
        background: #90caf9;
      }
      .success-msg {
        color: #2e7d32;
        background: #e8f5e9;
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 13px;
        margin-top: 10px;
      }
      .error-msg {
        color: #c62828;
        background: #ffebee;
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 13px;
        margin-top: 10px;
      }

      .slots-section {
        margin-top: 16px;
      }
      .slots-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }
      .slot-pill {
        display: flex;
        align-items: center;
        gap: 8px;
        background: #e8f5e9;
        border: 1px solid #a5d6a7;
        border-radius: 8px;
        padding: 8px 12px;
        font-size: 13px;
      }
      .slot-pill.slot-booked {
        background: #fafafa;
        border-color: #e0e0e0;
        opacity: 0.7;
      }
      .slot-info {
        color: #333;
        font-weight: 500;
      }
      .slot-tag {
        font-size: 12px;
        color: #555;
      }
      .btn-remove {
        background: none;
        border: none;
        color: #ef5350;
        cursor: pointer;
        font-size: 14px;
        padding: 0 4px;
        font-weight: bold;
      }
      .btn-remove:hover {
        color: #c62828;
      }
    `,
  ],
})
export class DoctorDashboardComponent implements OnInit {
  appointments: any[] = [];
  filteredAppointments: any[] = [];
  doctorProfile: any = null;
  loading = true;

  filterStatus = '';
  filterDate = '';
  cancelling = '';

  rescheduleId = '';
  newDate = '';
  newTime = '';
  rescheduling = false;
  rescheduleSuccess = '';

  newSlot = { date: '', time: '' };
  addingSlot = false;
  slotSuccess = '';
  slotError = '';

  timeOptions = [
    '08:00 AM',
    '08:30 AM',
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
  ];

  constructor(
    public auth: AuthService,
    private api: ApiService,
    public router: Router,
  ) {}

  ngOnInit() {
    if (!this.auth.isLoggedIn() || !this.auth.isDoctor()) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadDoctorProfile();
  }

  loadDoctorProfile() {
    const user = this.auth.getUser();
    this.api.getDoctorByUserId(user.id).subscribe({
      next: (res: any) => {
        this.doctorProfile = res.data;
        this.loadAppointments(res.data._id);
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  loadAppointments(doctorProfileId: string) {
    this.api.getDoctorAppointments(doctorProfileId).subscribe({
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

  applyFilter() {
    this.filteredAppointments = this.appointments.filter((appt) => {
      const statusMatch =
        !this.filterStatus || appt.status === this.filterStatus;
      const dateMatch = !this.filterDate || appt.date === this.filterDate;
      return statusMatch && dateMatch;
    });
  }

  clearFilter() {
    this.filterStatus = '';
    this.filterDate = '';
    this.filteredAppointments = this.appointments;
  }

  getCount(status: string): number {
    return this.appointments.filter((a) => a.status === status).length;
  }

  getAvailableSlots(): number {
    if (!this.doctorProfile) return 0;
    return this.doctorProfile.availableSlots.filter((s: any) => s.isAvailable)
      .length;
  }

  cancelAppointment(id: string) {
    this.cancelling = id;
    this.api.cancelAppointment(id, 'doctor').subscribe({
      next: () => {
        this.cancelling = '';
        this.loadDoctorProfile();
      },
      error: () => {
        this.cancelling = '';
      },
    });
  }

  startReschedule(appt: any) {
    this.rescheduleId = appt._id;
    this.newDate = appt.date;
    this.newTime = appt.time;
  }

  cancelReschedule() {
    this.rescheduleId = '';
    this.newDate = '';
    this.newTime = '';
  }

  confirmReschedule(id: string) {
    if (!this.newDate || !this.newTime) return;
    this.rescheduling = true;

    this.api.rescheduleAppointment(id, this.newDate, this.newTime).subscribe({
      next: () => {
        this.rescheduling = false;
        this.rescheduleId = '';
        this.rescheduleSuccess = id;
        setTimeout(() => (this.rescheduleSuccess = ''), 3000);
        this.loadDoctorProfile();
      },
      error: (err: any) => {
        this.rescheduling = false;
        alert(err.error?.message || 'Reschedule failed');
      },
    });
  }

  addSlot() {
    if (!this.newSlot.date || !this.newSlot.time) {
      this.slotError = 'Please select both date and time';
      return;
    }
    this.addingSlot = true;
    this.slotError = '';
    this.slotSuccess = '';

    this.api
      .addSingleSlot(
        this.doctorProfile._id,
        this.newSlot.date,
        this.newSlot.time,
      )
      .subscribe({
        next: () => {
          this.addingSlot = false;
          this.slotSuccess = `Slot added: ${this.newSlot.date} at ${this.newSlot.time}`;
          this.newSlot = { date: '', time: '' };
          this.loadDoctorProfile();
        },
        error: (err: any) => {
          this.addingSlot = false;
          this.slotError = err.error?.message || 'Failed to add slot';
        },
      });
  }

  removeSlot(slotId: string) {
    this.api.deleteSlot(this.doctorProfile._id, slotId).subscribe({
      next: () => {
        this.loadDoctorProfile();
      },
      error: () => {},
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
