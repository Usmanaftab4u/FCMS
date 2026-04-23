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
        <div class="form-group">
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

        <button (click)="register()" [disabled]="loading" class="btn-submit">
          {{ loading ? 'Creating Account...' : 'Create Account' }}
        </button>

        <p class="form-footer">
          Already have an account? <a routerLink="/login">Login here</a>
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
        max-width: 420px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      }
      h2 {
        color: #1976d2;
        margin-bottom: 24px;
        text-align: center;
      }
      .form-group {
        margin-bottom: 16px;
      }
      label {
        display: block;
        margin-bottom: 6px;
        color: #555;
        font-weight: 500;
      }
      input {
        width: 100%;
        padding: 10px 14px;
        border: 1px solid #ddd;
        border-radius: 6px;
        font-size: 15px;
        box-sizing: border-box;
      }
      input:focus {
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
      }
      .btn-submit:hover:not(:disabled) {
        background: #1565c0;
      }
      .btn-submit:disabled {
        background: #90caf9;
      }
      .error {
        background: #ffebee;
        color: #c62828;
        padding: 10px;
        border-radius: 6px;
        margin-bottom: 16px;
      }
      .success {
        background: #e8f5e9;
        color: #2e7d32;
        padding: 10px;
        border-radius: 6px;
        margin-bottom: 16px;
      }
      .form-footer {
        text-align: center;
        margin-top: 16px;
        color: #666;
      }
      .form-footer a {
        color: #1976d2;
      }
    `,
  ],
})
export class RegisterComponent {
  name = '';
  email = '';
  phone = '';
  password = '';
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
    if (!this.name || !this.email || !this.phone || !this.password) {
      this.errorMessage = 'Please fill in all required fields';
      return;
    }
    if (this.password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters';
      return;
    }
    this.loading = true;
    this.errorMessage = '';

    this.api
      .register({
        name: this.name,
        email: this.email,
        phone: this.phone,
        password: this.password,
        dateOfBirth: this.dateOfBirth,
      })
      .subscribe({
        next: (res: any) => {
          this.auth.saveUser(res.token, res.patient);
          this.successMessage = 'Account created successfully! Redirecting...';
          setTimeout(() => this.router.navigate(['/book']), 1000);
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage =
            err.error?.message || 'Registration failed. Please try again.';
        },
      });
  }
}
