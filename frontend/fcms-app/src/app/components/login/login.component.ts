import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="form-container">
      <div class="form-card">
        <h2>Login to Your Account</h2>
        <div class="error" *ngIf="errorMessage">{{ errorMessage }}</div>
        <div class="success" *ngIf="successMessage">{{ successMessage }}</div>

        <div class="form-group">
          <label>Email Address</label>
          <input
            type="email"
            [(ngModel)]="email"
            placeholder="Enter your email"
          />
        </div>

        <div class="form-group">
          <label>Password</label>
          <input
            type="password"
            [(ngModel)]="password"
            placeholder="Enter your password"
          />
        </div>

        <button (click)="login()" [disabled]="loading" class="btn-submit">
          {{ loading ? 'Logging in...' : 'Login' }}
        </button>

        <p class="form-footer">
          Don't have an account? <a routerLink="/register">Register here</a>
        </p>

        <div class="admin-hint">
          <strong>Admin access:</strong> email: admin&#64;fcms.com | password:
          admin123
        </div>
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
        margin-bottom: 20px;
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
        transition: border 0.2s;
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
      }
      .form-footer a {
        color: #1976d2;
      }
      .admin-hint {
        margin-top: 20px;
        padding: 10px;
        background: #fff3e0;
        border-radius: 6px;
        font-size: 13px;
        color: #e65100;
      }
    `,
  ],
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private router: Router,
  ) {}

  login() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Please enter your email and password';
      return;
    }
    this.loading = true;
    this.errorMessage = '';

    this.api.login({ email: this.email, password: this.password }).subscribe({
      next: (res: any) => {
        this.auth.saveUser(res.token, res.patient);
        this.successMessage = 'Login successful! Redirecting...';
        setTimeout(() => {
          if (res.patient.role === 'admin') {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['/book']);
          }
        }, 1000);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage =
          err.error?.message || 'Login failed. Please try again.';
      },
    });
  }
}
