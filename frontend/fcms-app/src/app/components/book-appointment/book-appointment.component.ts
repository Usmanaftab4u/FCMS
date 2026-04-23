import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-book-appointment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <h2>Book an Appointment</h2>

      <!-- Not logged in -->
      <div class="alert-info" *ngIf="!auth.isLoggedIn()">
        Please <a (click)="goToLogin()">login</a> to book an appointment.
      </div>

      <!-- Loading -->
      <div class="loading" *ngIf="loading">Loading doctors...</div>

      <!-- Success Message -->
      <div class="success-banner" *ngIf="successMessage">
        <span>✅</span>
        <div>
          <strong>Appointment Booked Successfully!</strong>
          <p>{{ successMessage }}</p>
        </div>
      </div>

      <!-- Error Message -->
      <div class="error-banner" *ngIf="errorMessage">❌ {{ errorMessage }}</div>

      <div *ngIf="auth.isLoggedIn() && !loading">
        <!-- Step 1: Select Doctor -->
        <div class="step-card">
          <div class="step-header">
            <span class="step-number">1</span>
            <h3>Select a Doctor</h3>
          </div>
          <div class="doctors-grid">
            <div
              *ngFor="let doctor of doctors"
              class="doctor-card"
              [class.selected]="selectedDoctor?._id === doctor._id"
              (click)="selectDoctor(doctor)"
            >
              <div class="doctor-avatar">👨‍⚕️</div>
              <div class="doctor-info">
                <h4>{{ doctor.name }}</h4>
                <p class="specialization">{{ doctor.specialization }}</p>
                <p class="slots-count">
                  {{ getAvailableSlots(doctor).length }} slots available
                </p>
              </div>
              <div
                class="selected-badge"
                *ngIf="selectedDoctor?._id === doctor._id"
              >
                ✓ Selected
              </div>
            </div>
          </div>
        </div>

        <!-- Step 2: Select Date -->
        <div class="step-card" *ngIf="selectedDoctor">
          <div class="step-header">
            <span class="step-number">2</span>
            <h3>Select a Date</h3>
          </div>
          <div class="dates-grid">
            <div
              *ngFor="let date of getAvailableDates()"
              class="date-card"
              [class.selected]="selectedDate === date"
              (click)="selectDate(date)"
            >
              {{ formatDate(date) }}
            </div>
          </div>
        </div>

        <!-- Step 3: Select Time -->
        <div class="step-card" *ngIf="selectedDate">
          <div class="step-header">
            <span class="step-number">3</span>
            <h3>Select a Time Slot</h3>
          </div>
          <div class="times-grid">
            <div
              *ngFor="let slot of getSlotsForDate()"
              class="time-card"
              [class.selected]="selectedTime === slot.time"
              [class.unavailable]="!slot.isAvailable"
              (click)="slot.isAvailable && selectTime(slot.time)"
            >
              {{ slot.time }}
              <span *ngIf="!slot.isAvailable" class="booked-label">Booked</span>
            </div>
          </div>
        </div>

        <!-- Step 4: Confirm -->
        <div class="step-card confirm-card" *ngIf="selectedTime">
          <div class="step-header">
            <span class="step-number">4</span>
            <h3>Confirm Your Appointment</h3>
          </div>
          <div class="summary">
            <div class="summary-row">
              <span class="label">Doctor</span>
              <span class="value">{{ selectedDoctor?.name }}</span>
            </div>
            <div class="summary-row">
              <span class="label">Specialization</span>
              <span class="value">{{ selectedDoctor?.specialization }}</span>
            </div>
            <div class="summary-row">
              <span class="label">Date</span>
              <span class="value">{{ formatDate(selectedDate) }}</span>
            </div>
            <div class="summary-row">
              <span class="label">Time</span>
              <span class="value">{{ selectedTime }}</span>
            </div>
            <div class="summary-row">
              <span class="label">Patient</span>
              <span class="value">{{ auth.getPatient()?.name }}</span>
            </div>
          </div>
          <button
            class="btn-confirm"
            (click)="bookAppointment()"
            [disabled]="booking"
          >
            {{ booking ? 'Booking...' : '✅ Confirm Appointment' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .page-container {
        max-width: 900px;
        margin: 0 auto;
      }
      h2 {
        color: #1976d2;
        margin-bottom: 24px;
        font-size: 28px;
      }
      .loading {
        text-align: center;
        padding: 40px;
        color: #666;
        font-size: 18px;
      }
      .alert-info {
        background: #e3f2fd;
        padding: 16px;
        border-radius: 8px;
        color: #1565c0;
        font-size: 16px;
      }
      .alert-info a {
        color: #1976d2;
        cursor: pointer;
        font-weight: bold;
      }
      .success-banner {
        background: #e8f5e9;
        border: 1px solid #a5d6a7;
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 20px;
        display: flex;
        align-items: flex-start;
        gap: 12px;
      }
      .success-banner span {
        font-size: 24px;
      }
      .success-banner strong {
        color: #2e7d32;
        display: block;
        margin-bottom: 4px;
      }
      .success-banner p {
        color: #388e3c;
        margin: 0;
        font-size: 14px;
      }
      .error-banner {
        background: #ffebee;
        border: 1px solid #ef9a9a;
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 20px;
        color: #c62828;
      }
      .step-card {
        background: white;
        border-radius: 12px;
        padding: 24px;
        margin-bottom: 20px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      }
      .step-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 20px;
      }
      .step-number {
        background: #1976d2;
        color: white;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 16px;
        flex-shrink: 0;
      }
      .step-header h3 {
        margin: 0;
        color: #333;
        font-size: 18px;
      }
      .doctors-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
        gap: 16px;
      }
      .doctor-card {
        border: 2px solid #e0e0e0;
        border-radius: 10px;
        padding: 16px;
        cursor: pointer;
        transition: all 0.2s;
        position: relative;
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .doctor-card:hover {
        border-color: #1976d2;
        background: #f3f8ff;
      }
      .doctor-card.selected {
        border-color: #1976d2;
        background: #e3f2fd;
      }
      .doctor-avatar {
        font-size: 36px;
      }
      .doctor-info h4 {
        margin: 0 0 4px;
        color: #333;
      }
      .specialization {
        color: #1976d2;
        font-size: 13px;
        margin: 0 0 4px;
      }
      .slots-count {
        color: #666;
        font-size: 12px;
        margin: 0;
      }
      .selected-badge {
        position: absolute;
        top: 8px;
        right: 8px;
        background: #1976d2;
        color: white;
        font-size: 11px;
        padding: 2px 8px;
        border-radius: 20px;
      }
      .dates-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
      }
      .date-card {
        border: 2px solid #e0e0e0;
        border-radius: 8px;
        padding: 12px 20px;
        cursor: pointer;
        transition: all 0.2s;
        font-weight: 500;
      }
      .date-card:hover {
        border-color: #1976d2;
        background: #f3f8ff;
      }
      .date-card.selected {
        border-color: #1976d2;
        background: #1976d2;
        color: white;
      }
      .times-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
      }
      .time-card {
        border: 2px solid #e0e0e0;
        border-radius: 8px;
        padding: 10px 16px;
        cursor: pointer;
        transition: all 0.2s;
        font-weight: 500;
        position: relative;
      }
      .time-card:hover:not(.unavailable) {
        border-color: #1976d2;
        background: #f3f8ff;
      }
      .time-card.selected {
        border-color: #1976d2;
        background: #1976d2;
        color: white;
      }
      .time-card.unavailable {
        background: #f5f5f5;
        color: #bbb;
        cursor: not-allowed;
        border-color: #e0e0e0;
      }
      .booked-label {
        font-size: 10px;
        background: #ffcdd2;
        color: #c62828;
        padding: 1px 6px;
        border-radius: 10px;
        margin-left: 6px;
      }
      .summary {
        background: #f8f9fa;
        border-radius: 8px;
        padding: 20px;
        margin-bottom: 20px;
      }
      .summary-row {
        display: flex;
        justify-content: space-between;
        padding: 10px 0;
        border-bottom: 1px solid #e0e0e0;
      }
      .summary-row:last-child {
        border-bottom: none;
      }
      .label {
        color: #666;
        font-weight: 500;
      }
      .value {
        color: #333;
        font-weight: 600;
      }
      .btn-confirm {
        width: 100%;
        padding: 14px;
        background: #388e3c;
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 16px;
        font-weight: bold;
        cursor: pointer;
        transition: background 0.2s;
      }
      .btn-confirm:hover:not(:disabled) {
        background: #2e7d32;
      }
      .btn-confirm:disabled {
        background: #a5d6a7;
        cursor: not-allowed;
      }
    `,
  ],
})
export class BookAppointmentComponent implements OnInit {
  doctors: any[] = [];
  selectedDoctor: any = null;
  selectedDate: string = '';
  selectedTime: string = '';
  loading = true;
  booking = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    public auth: AuthService,
    private api: ApiService,
    private router: Router,
  ) {}

  ngOnInit() {
    if (!this.auth.isLoggedIn()) {
      this.loading = false;
      return;
    }
    this.loadDoctors();
  }

  loadDoctors() {
    this.loading = true;
    this.api.getDoctors().subscribe({
      next: (res: any) => {
        this.doctors = res.data;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load doctors. Please refresh the page.';
        this.loading = false;
      },
    });
  }

  selectDoctor(doctor: any) {
    this.selectedDoctor = doctor;
    this.selectedDate = '';
    this.selectedTime = '';
    this.successMessage = '';
    this.errorMessage = '';
  }

  getAvailableSlots(doctor: any) {
    return doctor.availableSlots.filter((s: any) => s.isAvailable);
  }

  getAvailableDates(): string[] {
    if (!this.selectedDoctor) return [];
    const dates = this.selectedDoctor.availableSlots
      .filter((s: any) => s.isAvailable)
      .map((s: any) => s.date);
    return [...new Set(dates)] as string[];
  }

  selectDate(date: string) {
    this.selectedDate = date;
    this.selectedTime = '';
  }

  getSlotsForDate(): any[] {
    if (!this.selectedDoctor || !this.selectedDate) return [];
    return this.selectedDoctor.availableSlots.filter(
      (s: any) => s.date === this.selectedDate,
    );
  }

  selectTime(time: string) {
    this.selectedTime = time;
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  bookAppointment() {
    const patient = this.auth.getPatient();
    if (!patient) {
      this.router.navigate(['/login']);
      return;
    }
    this.booking = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.api
      .bookAppointment({
        patientId: patient.id,
        doctorId: this.selectedDoctor._id,
        date: this.selectedDate,
        time: this.selectedTime,
      })
      .subscribe({
        next: (res: any) => {
          this.booking = false;
          this.successMessage = `Your appointment with ${this.selectedDoctor.name} on
          ${this.formatDate(this.selectedDate)} at ${this.selectedTime}
          has been confirmed.`;
          this.selectedDoctor = null;
          this.selectedDate = '';
          this.selectedTime = '';
          this.loadDoctors();
        },
        error: (err: any) => {
          this.booking = false;
          this.errorMessage =
            err.error?.message || 'Booking failed. Please try again.';
        },
      });
  }
}
