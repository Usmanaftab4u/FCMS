import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="form-container">
      <div class="form-card">
        <div class="login-icon">🏥</div>
        <h2>Login to FCMS</h2>
        <p class="subtitle">Family Clinic Management System</p>

        <div class="error" *ngIf="errorMessage">{{ errorMessage }}</div>
        <div class="success" *ngIf="successMessage">{{ successMessage }}</div>

        <div class="form-group">
          <label>Email Address</label>
          <input
            type="email"
            [(ngModel)]="email"
            placeholder="Enter your email"
            (keyup.enter)="login()"
          />
        </div>

        <div class="form-group">
          <label>Password</label>
          <input
            type="password"
            [(ngModel)]="password"
            placeholder="Enter your password"
            (keyup.enter)="login()"
          />
        </div>

        <button (click)="login()" [disabled]="loading" class="btn-submit">
          {{ loading ? 'Logging in...' : 'Login' }}
        </button>

        <p class="form-footer">
          Don't have an account?
          <a routerLink="/register">Register here</a>
        </p>

        <div class="test-accounts">
          <p class="test-title">Test Accounts</p>
          <div class="test-row" (click)="fillAdmin()">
            ⚙️ Admin: admin&#64;fcms.com / admin123
          </div>
          <div class="test-row" (click)="fillDoctor()">
            👨‍⚕️ Doctor: ahmed.khan&#64;fcms.com / doctor123
          </div>
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
        text-align: center;
      }
      .login-icon {
        font-size: 48px;
        margin-bottom: 8px;
      }
      h2 {
        color: #1976d2;
        margin-bottom: 4px;
        font-size: 24px;
      }
      .subtitle {
        color: #888;
        font-size: 14px;
        margin-bottom: 28px;
      }
      .form-group {
        margin-bottom: 18px;
        text-align: left;
      }
      label {
        display: block;
        margin-bottom: 6px;
        color: #555;
        font-weight: 500;
        font-size: 14px;
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
        text-align: left;
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
      .test-accounts {
        margin-top: 24px;
        background: #f8f9fa;
        border-radius: 8px;
        padding: 14px;
        text-align: left;
      }
      .test-title {
        font-size: 12px;
        color: #888;
        font-weight: 600;
        margin-bottom: 8px;
        text-transform: uppercase;
      }
      .test-row {
        font-size: 12px;
        color: #555;
        padding: 6px 8px;
        border-radius: 4px;
        cursor: pointer;
        margin-bottom: 4px;
        transition: background 0.15s;
      }
      .test-row:hover {
        background: #e3f2fd;
        color: #1976d2;
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

  fillAdmin() {
    this.email = 'admin@fcms.com';
    this.password = 'admin123';
  }

  fillDoctor() {
    this.email = 'ahmed.khan@fcms.com';
    this.password = 'doctor123';
  }

  login() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Please enter your email and password';
      return;
    }
    this.loading = true;
    this.errorMessage = '';

    this.api.login({ email: this.email, password: this.password }).subscribe({
      next: (res: any) => {
        this.auth.saveUser(res.token, res.user);
        this.successMessage = 'Login successful! Redirecting...';
        setTimeout(() => {
          const role = res.user.role;
          if (role === 'admin') this.router.navigate(['/admin']);
          else if (role === 'doctor')
            this.router.navigate(['/doctor-dashboard']);
          else this.router.navigate(['/book']);
        }, 800);
      },
      error: (err: any) => {
        this.loading = false;
        this.errorMessage =
          err.error?.message || 'Login failed. Please try again.';
      },
    });
  }
}
