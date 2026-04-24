import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="form-container">
      <div class="form-card">
        <h2>Create Your Account</h2>

        <!-- Role selector -->
        <div class="role-selector">
          <div
            class="role-option"
            [class.active]="role === 'patient'"
            (click)="role = 'patient'"
          >
            <span class="role-icon">👤</span>
            <span class="role-label">I am a Patient</span>
            <span class="role-desc">Book doctor appointments</span>
          </div>
          <div
            class="role-option"
            [class.active]="role === 'doctor'"
            (click)="role = 'doctor'"
          >
            <span class="role-icon">👨‍⚕️</span>
            <span class="role-label">I am a Doctor</span>
            <span class="role-desc">Manage your appointments</span>
          </div>
        </div>

        <div class="error" *ngIf="errorMessage">{{ errorMessage }}</div>
        <div class="success" *ngIf="successMessage">{{ successMessage }}</div>

        <div class="form-group">
          <label>Full Name</label>
          <input
            type="text"
            [(ngModel)]="name"
            placeholder="Enter your full name"
          />
        </div>

        <div class="form-group">
          <label>Email Address</label>
          <input
            type="email"
            [(ngModel)]="email"
            placeholder="Enter your email"
          />
        </div>

        <div class="form-group">
          <label>Phone Number</label>
          <input
            type="text"
            [(ngModel)]="phone"
            placeholder="e.g. 03001234567"
          />
        </div>

        <!-- Doctor only field -->
        <div class="form-group" *ngIf="role === 'doctor'">
          <label>Specialization</label>
          <select [(ngModel)]="specialization">
            <option value="">Select your specialization...</option>
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

        <!-- Patient only field -->
        <div class="form-group" *ngIf="role === 'patient'">
          <label>Date of Birth</label>
          <input type="date" [(ngModel)]="dateOfBirth" />
        </div>

        <div class="form-group">
          <label>Password</label>
          <input
            type="password"
            [(ngModel)]="password"
            placeholder="Minimum 6 characters"
          />
        </div>

        <div class="form-group">
          <label>Confirm Password</label>
          <input
            type="password"
            [(ngModel)]="confirmPassword"
            placeholder="Re-enter your password"
          />
        </div>

        <button (click)="register()" [disabled]="loading" class="btn-submit">
          {{ loading ? 'Creating Account...' : 'Create Account' }}
        </button>

        <p class="form-footer">
          Already have an account?
          <a routerLink="/login">Login here</a>
        </p>
      </div>
    </div>
  `,
  styles: [
    `
      .form-container {
        display: flex;
        justify-content: center;
        padding: 40px 20px;
      }
      .form-card {
        background: white;
        border-radius: 12px;
        padding: 40px;
        width: 100%;
        max-width: 460px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      }
      h2 {
        color: #1976d2;
        margin-bottom: 24px;
        text-align: center;
        font-size: 24px;
      }
      .role-selector {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
        margin-bottom: 24px;
      }
      .role-option {
        border: 2px solid #e0e0e0;
        border-radius: 10px;
        padding: 16px 12px;
        text-align: center;
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .role-option:hover {
        border-color: #1976d2;
        background: #f3f8ff;
      }
      .role-option.active {
        border-color: #1976d2;
        background: #e3f2fd;
      }
      .role-icon {
        font-size: 28px;
      }
      .role-label {
        font-weight: 600;
        color: #333;
        font-size: 14px;
      }
      .role-desc {
        font-size: 11px;
        color: #888;
      }
      .form-group {
        margin-bottom: 16px;
      }
      label {
        display: block;
        margin-bottom: 6px;
        color: #555;
        font-weight: 500;
        font-size: 14px;
      }
      input,
      select {
        width: 100%;
        padding: 10px 14px;
        border: 1px solid #ddd;
        border-radius: 6px;
        font-size: 15px;
        box-sizing: border-box;
        background: white;
      }
      input:focus,
      select:focus {
        border-color: #1976d2;
        outline: none;
      }
      .btn-submit {
        width: 100%;
        padding: 12px;
        background: #1976d2;
        color: white;
        border: none;
        border-radius: 6px;
        font-size: 16px;
        cursor: pointer;
        margin-top: 8px;
        transition: background 0.2s;
      }
      .btn-submit:hover:not(:disabled) {
        background: #1565c0;
      }
      .btn-submit:disabled {
        background: #90caf9;
        cursor: not-allowed;
      }
      .error {
        background: #ffebee;
        color: #c62828;
        padding: 10px;
        border-radius: 6px;
        margin-bottom: 16px;
        font-size: 14px;
      }
      .success {
        background: #e8f5e9;
        color: #2e7d32;
        padding: 10px;
        border-radius: 6px;
        margin-bottom: 16px;
        font-size: 14px;
      }
      .form-footer {
        text-align: center;
        margin-top: 16px;
        color: #666;
        font-size: 14px;
      }
      .form-footer a {
        color: #1976d2;
      }
    `,
  ],
})
export class RegisterComponent {
  role = 'patient';
  name = '';
  email = '';
  phone = '';
  password = '';
  confirmPassword = '';
  specialization = '';
  dateOfBirth = '';
  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private router: Router,
  ) {}

  register() {
    this.errorMessage = '';

    if (!this.name || !this.email || !this.phone || !this.password) {
      this.errorMessage = 'Please fill in all required fields';
      return;
    }
    if (this.password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters';
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }
    if (this.role === 'doctor' && !this.specialization) {
      this.errorMessage = 'Please select your specialization';
      return;
    }

    this.loading = true;

    const data: any = {
      name: this.name,
      email: this.email,
      phone: this.phone,
      password: this.password,
      role: this.role,
    };

    if (this.role === 'doctor') data.specialization = this.specialization;
    if (this.role === 'patient') data.dateOfBirth = this.dateOfBirth;

    this.api.register(data).subscribe({
      next: (res: any) => {
        this.auth.saveUser(res.token, res.user);
        this.successMessage = 'Account created! Redirecting...';
        setTimeout(() => {
          if (res.user.role === 'doctor') {
            this.router.navigate(['/doctor-dashboard']);
          } else {
            this.router.navigate(['/book']);
          }
        }, 1000);
      },
      error: (err: any) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Registration failed';
      },
    });
  }
}
