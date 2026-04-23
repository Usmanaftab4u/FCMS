import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="hero">
      <h1>Welcome to Family Clinic Management System</h1>
      <p>Book doctor appointments online — no phone calls, no queues.</p>
      <div class="hero-buttons">
        <a routerLink="/book" *ngIf="auth.isLoggedIn()" class="btn-primary">
          Book an Appointment
        </a>
        <a
          routerLink="/register"
          *ngIf="!auth.isLoggedIn()"
          class="btn-primary"
        >
          Get Started
        </a>
        <a routerLink="/login" *ngIf="!auth.isLoggedIn()" class="btn-secondary">
          Login
        </a>
      </div>
    </div>

    <div class="features">
      <div class="feature-card">
        <div class="icon">📅</div>
        <h3>Easy Booking</h3>
        <p>View available doctors and book your appointment in seconds.</p>
      </div>
      <div class="feature-card">
        <div class="icon">🚫</div>
        <h3>No Double Booking</h3>
        <p>Our system prevents two patients from booking the same slot.</p>
      </div>
      <div class="feature-card">
        <div class="icon">🔔</div>
        <h3>Reminders</h3>
        <p>
          Get confirmation and reminder notifications for your appointments.
        </p>
      </div>
      <div class="feature-card">
        <div class="icon">👨‍⚕️</div>
        <h3>Multiple Doctors</h3>
        <p>Choose from our team of qualified family clinic doctors.</p>
      </div>
    </div>
  `,
  styles: [
    `
      .hero {
        text-align: center;
        padding: 60px 20px;
        background: linear-gradient(135deg, #1976d2, #42a5f5);
        color: white;
        border-radius: 12px;
        margin-bottom: 40px;
      }
      .hero h1 {
        font-size: 32px;
        margin-bottom: 16px;
      }
      .hero p {
        font-size: 18px;
        margin-bottom: 30px;
        opacity: 0.9;
      }
      .hero-buttons {
        display: flex;
        gap: 16px;
        justify-content: center;
      }
      .btn-primary {
        background: white;
        color: #1976d2;
        padding: 12px 28px;
        border-radius: 6px;
        text-decoration: none;
        font-weight: bold;
        transition: transform 0.2s;
      }
      .btn-primary:hover {
        transform: scale(1.05);
      }
      .btn-secondary {
        background: transparent;
        color: white;
        padding: 12px 28px;
        border-radius: 6px;
        text-decoration: none;
        border: 2px solid white;
        transition: transform 0.2s;
      }
      .btn-secondary:hover {
        transform: scale(1.05);
      }
      .features {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 20px;
      }
      .feature-card {
        background: white;
        border-radius: 8px;
        padding: 24px;
        text-align: center;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }
      .icon {
        font-size: 40px;
        margin-bottom: 12px;
      }
      .feature-card h3 {
        color: #1976d2;
        margin-bottom: 8px;
      }
      .feature-card p {
        color: #666;
        font-size: 14px;
      }
    `,
  ],
})
export class HomeComponent {
  constructor(public auth: AuthService) {}
}
