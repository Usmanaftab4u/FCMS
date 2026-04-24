import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <nav class="navbar">
      <div class="nav-brand" routerLink="/">
        🏥 Family Clinic Management System
      </div>
      <div class="nav-links">
        <a routerLink="/">Home</a>

        <!-- Patient links -->
        <ng-container *ngIf="auth.isPatient()">
          <a routerLink="/book">Book Appointment</a>
          <a routerLink="/my-appointments">My Appointments</a>
        </ng-container>

        <!-- Doctor links -->
        <ng-container *ngIf="auth.isDoctor()">
          <a routerLink="/doctor-dashboard">My Dashboard</a>
        </ng-container>

        <!-- Admin links -->
        <ng-container *ngIf="auth.isAdmin()">
          <a routerLink="/admin">Admin Dashboard</a>
        </ng-container>

        <!-- Not logged in -->
        <ng-container *ngIf="!auth.isLoggedIn()">
          <a routerLink="/login">Login</a>
          <a routerLink="/register">Register</a>
        </ng-container>

        <!-- Logged in user info + logout -->
        <ng-container *ngIf="auth.isLoggedIn()">
          <span class="user-info">
            {{ getRoleIcon() }} {{ auth.getUser()?.name }}
          </span>
          <span class="logout" (click)="auth.logout()">Logout</span>
        </ng-container>
      </div>
    </nav>
  `,
  styles: [
    `
      .navbar {
        background: #1976d2;
        color: white;
        padding: 0 24px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 62px;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
      }
      .nav-brand {
        font-size: 17px;
        font-weight: bold;
        cursor: pointer;
        white-space: nowrap;
      }
      .nav-links {
        display: flex;
        align-items: center;
        gap: 4px;
      }
      .nav-links a {
        color: white;
        text-decoration: none;
        font-size: 14px;
        cursor: pointer;
        padding: 6px 12px;
        border-radius: 4px;
        transition: background 0.2s;
      }
      .nav-links a:hover {
        background: rgba(255, 255, 255, 0.2);
      }
      .user-info {
        color: #e3f2fd;
        font-size: 13px;
        padding: 6px 12px;
        border-left: 1px solid rgba(255, 255, 255, 0.3);
        margin-left: 8px;
      }
      .logout {
        color: white;
        font-size: 13px;
        cursor: pointer;
        padding: 6px 12px;
        border-radius: 4px;
        background: rgba(255, 255, 255, 0.15);
        transition: background 0.2s;
      }
      .logout:hover {
        background: rgba(255, 255, 255, 0.3);
      }
    `,
  ],
})
export class NavbarComponent {
  constructor(public auth: AuthService) {}

  getRoleIcon(): string {
    const role = this.auth.getUserRole();
    if (role === 'admin') return '⚙️';
    if (role === 'doctor') return '👨‍⚕️';
    return '👤';
  }
}
