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
      <!-- Header & Stats -->
      <div class="dashboard-header">
        <h2>⚙️ Admin Dashboard</h2>
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
            <div class="stat-label">Doctors</div>
          </div>
        </div>
      </div>

      <!-- Tab Navigation -->
      <div class="tab-nav">
        <button
          [class.active]="activeTab === 'appointments'"
          (click)="activeTab = 'appointments'"
        >
          📋 Appointments
        </button>
        <button
          [class.active]="activeTab === 'doctors'"
          (click)="activeTab = 'doctors'"
        >
          👨‍⚕️ Manage Doctors
        </button>
        <button
          [class.active]="activeTab === 'slots'"
          (click)="activeTab = 'slots'"
        >
          🕐 Manage Slots
        </button>
        <button
          [class.active]="activeTab === 'add'"
          (click)="activeTab = 'add'"
        >
          ➕ Add Doctor
        </button>
      </div>

      <!-- ── TAB 1: APPOINTMENTS ── -->
      <div *ngIf="activeTab === 'appointments'">
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
            <div class="form-group">
              <label>Filter by Status</label>
              <select [(ngModel)]="filterStatus" (change)="applyFilters()">
                <option value="">All Status</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <button (click)="clearFilters()" class="btn-clear">
              Clear Filters
            </button>
          </div>
        </div>

        <div class="section-card">
          <h3>All Appointments ({{ filteredAppointments.length }})</h3>
          <div class="loading" *ngIf="loading">Loading...</div>
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
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  *ngFor="let appt of filteredAppointments"
                  [class.cancelled-row]="appt.status === 'cancelled'"
                >
                  <td>
                    <div class="patient-name">{{ appt.patient?.name }}</div>
                    <div class="patient-sub">✉️ {{ appt.patient?.email }}</div>
                    <div class="patient-sub">📞 {{ appt.patient?.phone }}</div>
                  </td>
                  <td>
                    <div>{{ appt.doctor?.name }}</div>
                    <div class="patient-sub">
                      {{ appt.doctor?.specialization }}
                    </div>
                  </td>
                  <td>{{ formatDate(appt.date) }}</td>
                  <td>{{ appt.time }}</td>
                  <td>
                    <span class="badge" [class]="appt.status">
                      {{ appt.status | titlecase }}
                    </span>
                  </td>
                  <td>
                    <div
                      class="action-btns"
                      *ngIf="appt.status === 'confirmed'"
                    >
                      <!-- Reschedule -->
                      <button
                        *ngIf="rescheduleId !== appt._id"
                        (click)="startReschedule(appt)"
                        class="btn-edit"
                      >
                        Reschedule
                      </button>
                      <!-- Cancel -->
                      <button
                        *ngIf="rescheduleId !== appt._id"
                        (click)="cancelAppointment(appt._id)"
                        class="btn-action-cancel"
                        [disabled]="cancelling === appt._id"
                      >
                        {{ cancelling === appt._id ? '...' : 'Cancel' }}
                      </button>
                      <!-- Reschedule form -->
                      <div
                        *ngIf="rescheduleId === appt._id"
                        class="inline-form"
                      >
                        <input type="date" [(ngModel)]="rescheduleDate" />
                        <select [(ngModel)]="rescheduleTime">
                          <option value="">Time...</option>
                          <option *ngFor="let t of timeOptions" [value]="t">
                            {{ t }}
                          </option>
                        </select>
                        <button
                          (click)="confirmReschedule(appt._id)"
                          class="btn-confirm-sm"
                          [disabled]="rescheduling"
                        >
                          {{ rescheduling ? '...' : 'Save' }}
                        </button>
                        <button
                          (click)="cancelReschedule()"
                          class="btn-cancel-sm"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                    <span *ngIf="appt.status !== 'confirmed'" class="no-action"
                      >—</span
                    >
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ── TAB 2: MANAGE DOCTORS ── -->
      <div *ngIf="activeTab === 'doctors'">
        <div class="section-card">
          <h3>All Registered Doctors</h3>
          <div class="doctors-list">
            <div *ngFor="let doctor of doctors" class="doctor-row">
              <div class="doctor-row-left">
                <div class="dr-name">👨‍⚕️ {{ doctor.name }}</div>
                <div class="dr-spec">{{ doctor.specialization }}</div>
                <div class="dr-contact">
                  ✉️ {{ doctor.email }}
                  <span *ngIf="doctor.phone"> | 📞 {{ doctor.phone }}</span>
                </div>
              </div>
              <div class="doctor-row-right">
                <span class="slot-count-badge">
                  {{ getAvailableCount(doctor) }} available slots
                </span>
                <span class="slot-count-badge booked">
                  {{ getBookedCount(doctor) }} booked
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ── TAB 3: MANAGE SLOTS ── -->
      <div *ngIf="activeTab === 'slots'">
        <!-- Add slot -->
        <div class="section-card">
          <h3>Add Time Slot to Doctor</h3>
          <div class="form-row">
            <div class="form-group">
              <label>Select Doctor</label>
              <select [(ngModel)]="slotDoctorId">
                <option value="">Choose doctor...</option>
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
                <option *ngFor="let t of timeOptions" [value]="t">
                  {{ t }}
                </option>
              </select>
            </div>
          </div>
          <button (click)="addSlot()" [disabled]="addingSlot" class="btn-add">
            {{ addingSlot ? 'Adding...' : '+ Add Slot' }}
          </button>
          <div class="success-msg" *ngIf="slotSuccess">{{ slotSuccess }}</div>
          <div class="error-msg" *ngIf="slotError">{{ slotError }}</div>
        </div>

        <!-- Edit existing slots -->
        <div class="section-card">
          <h3>Edit Existing Slots</h3>
          <div class="form-group" style="max-width:300px; margin-bottom:20px">
            <label>Select Doctor to Manage</label>
            <select [(ngModel)]="manageDoctorId" (change)="loadDoctorSlots()">
              <option value="">Choose doctor...</option>
              <option *ngFor="let doc of doctors" [value]="doc._id">
                {{ doc.name }}
              </option>
            </select>
          </div>

          <div *ngIf="selectedDoctorSlots.length > 0">
            <div class="slots-table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    *ngFor="let slot of selectedDoctorSlots"
                    [class.booked-slot-row]="!slot.isAvailable"
                  >
                    <td>
                      <span *ngIf="editSlotId !== slot._id">
                        {{ slot.date }}
                      </span>
                      <input
                        *ngIf="editSlotId === slot._id"
                        type="date"
                        [(ngModel)]="editSlotDate"
                      />
                    </td>
                    <td>
                      <span *ngIf="editSlotId !== slot._id">
                        {{ slot.time }}
                      </span>
                      <select
                        *ngIf="editSlotId === slot._id"
                        [(ngModel)]="editSlotTime"
                      >
                        <option *ngFor="let t of timeOptions" [value]="t">
                          {{ t }}
                        </option>
                      </select>
                    </td>
                    <td>
                      <span
                        class="slot-status-badge"
                        [class.available]="slot.isAvailable"
                        [class.booked]="!slot.isAvailable"
                      >
                        {{ slot.isAvailable ? '✅ Available' : '❌ Booked' }}
                      </span>
                    </td>
                    <td>
                      <!-- Edit buttons -->
                      <div *ngIf="slot.isAvailable">
                        <div
                          *ngIf="editSlotId !== slot._id"
                          class="action-btns"
                        >
                          <button
                            (click)="startEditSlot(slot)"
                            class="btn-edit"
                          >
                            Edit
                          </button>
                          <button
                            (click)="removeSlot(manageDoctorId, slot._id)"
                            class="btn-action-cancel"
                          >
                            Remove
                          </button>
                        </div>
                        <div
                          *ngIf="editSlotId === slot._id"
                          class="action-btns"
                        >
                          <button
                            (click)="saveSlotEdit()"
                            class="btn-confirm-sm"
                            [disabled]="savingSlot"
                          >
                            {{ savingSlot ? '...' : 'Save' }}
                          </button>
                          <button
                            (click)="cancelSlotEdit()"
                            class="btn-cancel-sm"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                      <span *ngIf="!slot.isAvailable" class="no-action"
                        >Booked</span
                      >
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="success-msg" *ngIf="editSlotSuccess">
              {{ editSlotSuccess }}
            </div>
          </div>

          <div
            class="empty"
            *ngIf="manageDoctorId && selectedDoctorSlots.length === 0"
          >
            No slots found for this doctor.
          </div>
          <div class="empty" *ngIf="!manageDoctorId">
            Select a doctor above to manage their slots.
          </div>
        </div>
      </div>

      <!-- ── TAB 4: ADD DOCTOR ── -->
      <div *ngIf="activeTab === 'add'">
        <div class="section-card">
          <h3>Add New Doctor Account</h3>
          <p class="section-desc">
            This creates a doctor user account. The doctor can then log in and
            manage their own slots.
          </p>
          <div class="form-row">
            <div class="form-group">
              <label>Full Name</label>
              <input
                type="text"
                [(ngModel)]="newDoctor.name"
                placeholder="e.g. Dr. Ali Hassan"
              />
            </div>
            <div class="form-group">
              <label>Specialization</label>
              <select [(ngModel)]="newDoctor.specialization">
                <option value="">Select specialization...</option>
                <option>General Practitioner</option>
                <option>Pediatrician</option>
                <option>Cardiologist</option>
                <option>Dermatologist</option>
                <option>Neurologist</option>
                <option>Orthopedic Surgeon</option>
                <option>Gynecologist</option>
                <option>Psychiatrist</option>
                <option>ENT Specialist</option>
                <option>Ophthalmologist</option>
              </select>
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
            <div class="form-group">
              <label>Password</label>
              <input
                type="password"
                [(ngModel)]="newDoctor.password"
                placeholder="Minimum 6 characters"
              />
            </div>
          </div>
          <button
            (click)="addDoctor()"
            [disabled]="addingDoctor"
            class="btn-add"
          >
            {{
              addingDoctor ? 'Creating Account...' : '+ Create Doctor Account'
            }}
          </button>
          <div class="success-msg" *ngIf="doctorSuccess">
            {{ doctorSuccess }}
          </div>
          <div class="error-msg" *ngIf="doctorError">
            {{ doctorError }}
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
        margin: 0 0 16px;
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
        min-width: 110px;
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
        font-size: 32px;
        font-weight: bold;
        color: #333;
      }
      .stat-label {
        color: #888;
        font-size: 12px;
        margin-top: 4px;
      }

      .tab-nav {
        display: flex;
        gap: 8px;
        margin-bottom: 20px;
        border-bottom: 2px solid #e0e0e0;
        padding-bottom: 0;
        flex-wrap: wrap;
      }
      .tab-nav button {
        padding: 10px 20px;
        background: transparent;
        border: none;
        font-size: 14px;
        color: #666;
        cursor: pointer;
        border-bottom: 3px solid transparent;
        margin-bottom: -2px;
        transition: all 0.2s;
        border-radius: 4px 4px 0 0;
      }
      .tab-nav button:hover {
        color: #1976d2;
        background: #f3f8ff;
      }
      .tab-nav button.active {
        color: #1976d2;
        font-weight: 600;
        border-bottom-color: #1976d2;
      }

      .section-card {
        background: white;
        border-radius: 12px;
        padding: 24px;
        margin-bottom: 20px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      }
      .section-desc {
        color: #666;
        font-size: 14px;
        margin-bottom: 20px;
      }
      .loading,
      .empty {
        text-align: center;
        padding: 30px;
        color: #666;
        font-style: italic;
      }

      .filters-row {
        display: flex;
        gap: 14px;
        align-items: flex-end;
        flex-wrap: wrap;
      }
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
        min-width: 180px;
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

      .btn-clear {
        padding: 9px 16px;
        background: #f5f5f5;
        border: 1px solid #ddd;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        height: 38px;
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
      }

      .success-msg {
        margin-top: 12px;
        color: #2e7d32;
        background: #e8f5e9;
        padding: 10px 14px;
        border-radius: 6px;
        font-size: 14px;
      }
      .error-msg {
        margin-top: 12px;
        color: #c62828;
        background: #ffebee;
        padding: 10px 14px;
        border-radius: 6px;
        font-size: 14px;
      }

      /* Appointments table */
      .table-wrapper,
      .slots-table-wrapper {
        overflow-x: auto;
      }
      table {
        width: 100%;
        border-collapse: collapse;
      }
      th {
        background: #1976d2;
        color: white;
        padding: 12px 14px;
        text-align: left;
        font-size: 14px;
      }
      td {
        padding: 12px 14px;
        border-bottom: 1px solid #f0f0f0;
        font-size: 14px;
        color: #333;
      }
      tr:hover:not(.cancelled-row):not(.booked-slot-row) {
        background: #fafafa;
      }
      .cancelled-row {
        opacity: 0.6;
      }
      .booked-slot-row {
        background: #fafafa;
        color: #aaa;
      }

      .patient-name {
        font-weight: 600;
      }
      .patient-sub {
        font-size: 12px;
        color: #888;
        margin-top: 2px;
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

      .action-btns {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
      }
      .btn-edit {
        background: #e3f2fd;
        color: #1565c0;
        border: 1px solid #90caf9;
        padding: 4px 10px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
      }
      .btn-edit:hover {
        background: #bbdefb;
      }
      .btn-action-cancel {
        background: white;
        color: #ef5350;
        border: 1px solid #ef5350;
        padding: 4px 10px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
      }
      .btn-action-cancel:hover:not(:disabled) {
        background: #ffebee;
      }
      .btn-confirm-sm {
        background: #388e3c;
        color: white;
        border: none;
        padding: 4px 10px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
      }
      .btn-cancel-sm {
        background: #f5f5f5;
        color: #555;
        border: 1px solid #ddd;
        padding: 4px 10px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
      }
      .no-action {
        color: #ccc;
      }

      .inline-form {
        display: flex;
        gap: 6px;
        align-items: center;
        flex-wrap: wrap;
      }
      .inline-form input,
      .inline-form select {
        padding: 4px 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 13px;
      }

      /* Doctors list */
      .doctors-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .doctor-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 14px 16px;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        flex-wrap: wrap;
        gap: 12px;
      }
      .dr-name {
        font-weight: bold;
        color: #333;
        font-size: 15px;
      }
      .dr-spec {
        color: #1976d2;
        font-size: 13px;
        margin-top: 3px;
      }
      .dr-contact {
        color: #888;
        font-size: 12px;
        margin-top: 3px;
      }
      .doctor-row-right {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }
      .slot-count-badge {
        font-size: 12px;
        padding: 4px 12px;
        border-radius: 20px;
        background: #e8f5e9;
        color: #2e7d32;
        font-weight: 500;
      }
      .slot-count-badge.booked {
        background: #fff3e0;
        color: #e65100;
      }

      /* Slot status badge */
      .slot-status-badge {
        font-size: 12px;
        padding: 3px 10px;
        border-radius: 20px;
      }
      .slot-status-badge.available {
        background: #e8f5e9;
        color: #2e7d32;
      }
      .slot-status-badge.booked {
        background: #ffebee;
        color: #c62828;
      }
    `,
  ],
})
export class AdminDashboardComponent implements OnInit {
  activeTab = 'appointments';

  appointments: any[] = [];
  filteredAppointments: any[] = [];
  doctors: any[] = [];
  loading = true;

  // Filters
  filterDate = '';
  filterDoctor = '';
  filterStatus = '';

  // Cancel
  cancelling = '';

  // Reschedule appointment
  rescheduleId = '';
  rescheduleDate = '';
  rescheduleTime = '';
  rescheduling = false;

  // Add slot
  newSlot = { date: '', time: '' };
  slotDoctorId = '';
  addingSlot = false;
  slotSuccess = '';
  slotError = '';

  // Edit slot
  manageDoctorId = '';
  selectedDoctorSlots: any[] = [];
  editSlotId = '';
  editSlotDate = '';
  editSlotTime = '';
  savingSlot = false;
  editSlotSuccess = '';

  // Add doctor
  newDoctor = {
    name: '',
    specialization: '',
    email: '',
    phone: '',
    password: '',
  };
  addingDoctor = false;
  doctorSuccess = '';
  doctorError = '';

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
      const statusMatch =
        !this.filterStatus || appt.status === this.filterStatus;
      return dateMatch && doctorMatch && statusMatch;
    });
  }

  clearFilters() {
    this.filterDate = '';
    this.filterDoctor = '';
    this.filterStatus = '';
    this.filteredAppointments = this.appointments;
  }

  getCount(status: string): number {
    return this.appointments.filter((a) => a.status === status).length;
  }

  getAvailableCount(doctor: any): number {
    return doctor.availableSlots.filter((s: any) => s.isAvailable).length;
  }

  getBookedCount(doctor: any): number {
    return doctor.availableSlots.filter((s: any) => !s.isAvailable).length;
  }

  // ── CANCEL APPOINTMENT ────────────────────────────────
  cancelAppointment(id: string) {
    this.cancelling = id;
    this.api.cancelAppointment(id, 'admin').subscribe({
      next: () => {
        this.cancelling = '';
        this.loadData();
      },
      error: () => {
        this.cancelling = '';
      },
    });
  }

  // ── RESCHEDULE APPOINTMENT ────────────────────────────
  startReschedule(appt: any) {
    this.rescheduleId = appt._id;
    this.rescheduleDate = appt.date;
    this.rescheduleTime = appt.time;
  }

  cancelReschedule() {
    this.rescheduleId = '';
    this.rescheduleDate = '';
    this.rescheduleTime = '';
  }

  confirmReschedule(id: string) {
    if (!this.rescheduleDate || !this.rescheduleTime) return;
    this.rescheduling = true;
    this.api
      .rescheduleAppointment(id, this.rescheduleDate, this.rescheduleTime)
      .subscribe({
        next: () => {
          this.rescheduling = false;
          this.rescheduleId = '';
          this.loadData();
        },
        error: (err: any) => {
          this.rescheduling = false;
          alert(err.error?.message || 'Reschedule failed');
        },
      });
  }

  // ── ADD SLOT ──────────────────────────────────────────
  addSlot() {
    if (!this.slotDoctorId || !this.newSlot.date || !this.newSlot.time) {
      this.slotError = 'Please select a doctor, date and time';
      return;
    }
    this.addingSlot = true;
    this.slotError = '';
    this.slotSuccess = '';

    this.api
      .addSingleSlot(this.slotDoctorId, this.newSlot.date, this.newSlot.time)
      .subscribe({
        next: () => {
          this.addingSlot = false;
          this.slotSuccess = `Slot added: ${this.newSlot.date} at ${this.newSlot.time}`;
          this.newSlot = { date: '', time: '' };
          this.slotDoctorId = '';
          this.loadData();
          if (this.manageDoctorId) this.loadDoctorSlots();
        },
        error: (err: any) => {
          this.addingSlot = false;
          this.slotError = err.error?.message || 'Failed to add slot';
        },
      });
  }

  // ── LOAD SLOTS FOR EDIT ───────────────────────────────
  loadDoctorSlots() {
    if (!this.manageDoctorId) {
      this.selectedDoctorSlots = [];
      return;
    }
    const doctor = this.doctors.find((d) => d._id === this.manageDoctorId);
    this.selectedDoctorSlots = doctor ? [...doctor.availableSlots] : [];
    this.editSlotId = '';
  }

  // ── EDIT SLOT ─────────────────────────────────────────
  startEditSlot(slot: any) {
    this.editSlotId = slot._id;
    this.editSlotDate = slot.date;
    this.editSlotTime = slot.time;
    this.editSlotSuccess = '';
  }

  cancelSlotEdit() {
    this.editSlotId = '';
  }

  saveSlotEdit() {
    if (!this.editSlotDate || !this.editSlotTime) return;
    this.savingSlot = true;
    this.editSlotSuccess = '';

    const doctor = this.doctors.find((d) => d._id === this.manageDoctorId);
    if (!doctor) return;

    // Update the slot in the slots array
    const updatedSlots = doctor.availableSlots.map((s: any) => {
      if (s._id === this.editSlotId) {
        return { ...s, date: this.editSlotDate, time: this.editSlotTime };
      }
      return s;
    });

    this.api.updateDoctorSlots(this.manageDoctorId, updatedSlots).subscribe({
      next: () => {
        this.savingSlot = false;
        this.editSlotId = '';
        this.editSlotSuccess = `Slot updated to ${this.editSlotDate} at ${this.editSlotTime}`;
        this.loadData();
        setTimeout(() => this.loadDoctorSlots(), 500);
      },
      error: () => {
        this.savingSlot = false;
        alert('Failed to update slot');
      },
    });
  }

  // ── REMOVE SLOT ───────────────────────────────────────
  removeSlot(doctorId: string, slotId: string) {
    this.api.deleteSlot(doctorId, slotId).subscribe({
      next: () => {
        this.loadData();
        setTimeout(() => this.loadDoctorSlots(), 500);
      },
      error: (err: any) => {
        console.error(err);
      },
    });
  }

  // ── ADD DOCTOR ────────────────────────────────────────
  addDoctor() {
    if (
      !this.newDoctor.name ||
      !this.newDoctor.specialization ||
      !this.newDoctor.email ||
      !this.newDoctor.password
    ) {
      this.doctorError = 'Please fill in all required fields';
      return;
    }
    if (this.newDoctor.password.length < 6) {
      this.doctorError = 'Password must be at least 6 characters';
      return;
    }
    this.addingDoctor = true;
    this.doctorError = '';
    this.doctorSuccess = '';

    this.api
      .register({
        name: this.newDoctor.name,
        email: this.newDoctor.email,
        phone: this.newDoctor.phone,
        password: this.newDoctor.password,
        role: 'doctor',
        specialization: this.newDoctor.specialization,
      })
      .subscribe({
        next: (res: any) => {
          this.addingDoctor = false;
          this.doctorSuccess =
            `Doctor account created for ${this.newDoctor.name}. ` +
            `They can now login with ${this.newDoctor.email}`;
          this.newDoctor = {
            name: '',
            specialization: '',
            email: '',
            phone: '',
            password: '',
          };
          this.loadData();
        },
        error: (err: any) => {
          this.addingDoctor = false;
          this.doctorError =
            err.error?.message || 'Failed to create doctor account';
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
