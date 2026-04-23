import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-my-appointments',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <h2>My Appointments</h2>

      <div class="loading" *ngIf="loading">Loading your appointments...</div>

      <div class="empty-state" *ngIf="!loading && appointments.length === 0">
        <div class="empty-icon">📅</div>
        <h3>No appointments yet</h3>
        <p>You have not booked any appointments.</p>
        <button (click)="router.navigate(['/book'])" class="btn-book">
          Book an Appointment
        </button>
      </div>

      <div
        class="appointments-list"
        *ngIf="!loading && appointments.length > 0"
      >
        <div
          *ngFor="let appt of appointments"
          class="appointment-card"
          [class.cancelled]="appt.status === 'cancelled'"
          [class.completed]="appt.status === 'completed'"
        >
          <div class="appt-header">
            <div class="doctor-name">👨‍⚕️ {{ appt.doctor?.name }}</div>
            <div class="status-badge" [class]="appt.status">
              {{ appt.status | titlecase }}
            </div>
          </div>

          <div class="appt-details">
            <div class="detail-row">
              <span class="detail-icon">🏥</span>
              <span>{{ appt.doctor?.specialization }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-icon">📅</span>
              <span>{{ formatDate(appt.date) }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-icon">🕐</span>
              <span>{{ appt.time }}</span>
            </div>
          </div>

          <div class="appt-footer" *ngIf="appt.status === 'confirmed'">
            <button
              (click)="cancelAppointment(appt._id)"
              class="btn-cancel"
              [disabled]="cancelling === appt._id"
            >
              {{
                cancelling === appt._id ? 'Cancelling...' : 'Cancel Appointment'
              }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .page-container {
        max-width: 800px;
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
      }
      .empty-state {
        text-align: center;
        padding: 60px 20px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      }
      .empty-icon {
        font-size: 60px;
        margin-bottom: 16px;
      }
      .empty-state h3 {
        color: #333;
        margin-bottom: 8px;
      }
      .empty-state p {
        color: #666;
        margin-bottom: 24px;
      }
      .btn-book {
        background: #1976d2;
        color: white;
        border: none;
        padding: 12px 28px;
        border-radius: 8px;
        font-size: 15px;
        cursor: pointer;
      }
      .appointments-list {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .appointment-card {
        background: white;
        border-radius: 12px;
        padding: 20px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        border-left: 4px solid #1976d2;
      }
      .appointment-card.cancelled {
        border-left-color: #ef5350;
        opacity: 0.7;
      }
      .appointment-card.completed {
        border-left-color: #66bb6a;
      }
      .appt-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
      }
      .doctor-name {
        font-size: 18px;
        font-weight: bold;
        color: #333;
      }
      .status-badge {
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 13px;
        font-weight: 600;
      }
      .status-badge.confirmed {
        background: #e3f2fd;
        color: #1565c0;
      }
      .status-badge.cancelled {
        background: #ffebee;
        color: #c62828;
      }
      .status-badge.completed {
        background: #e8f5e9;
        color: #2e7d32;
      }
      .appt-details {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-bottom: 16px;
      }
      .detail-row {
        display: flex;
        align-items: center;
        gap: 10px;
        color: #555;
      }
      .detail-icon {
        font-size: 16px;
      }
      .appt-footer {
        border-top: 1px solid #f0f0f0;
        padding-top: 16px;
      }
      .btn-cancel {
        background: white;
        color: #ef5350;
        border: 1px solid #ef5350;
        padding: 8px 20px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.2s;
      }
      .btn-cancel:hover:not(:disabled) {
        background: #ffebee;
      }
      .btn-cancel:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    `,
  ],
})
export class MyAppointmentsComponent implements OnInit {
  appointments: any[] = [];
  loading = true;
  cancelling = '';

  constructor(
    public auth: AuthService,
    private api: ApiService,
    public router: Router,
  ) {}

  ngOnInit() {
    const patient = this.auth.getPatient();
    if (!patient) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadAppointments();
  }

  loadAppointments() {
    const patient = this.auth.getPatient();
    this.api.getPatientAppointments(patient.id).subscribe({
      next: (res: any) => {
        this.appointments = res.data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  cancelAppointment(id: string) {
    this.cancelling = id;
    this.api.cancelAppointment(id).subscribe({
      next: () => {
        this.cancelling = '';
        this.loadAppointments();
      },
      error: () => {
        this.cancelling = '';
      },
    });
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
}
