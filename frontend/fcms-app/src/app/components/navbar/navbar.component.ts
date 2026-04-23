import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
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
        <a routerLink="/book" *ngIf="auth.isLoggedIn()">Book Appointment</a>
        <a routerLink="/my-appointments" *ngIf="auth.isLoggedIn()"
          >My Appointments</a
        >
        <a routerLink="/admin" *ngIf="auth.isAdmin()">Admin Dashboard</a>
        <a routerLink="/login" *ngIf="!auth.isLoggedIn()">Login</a>
        <a routerLink="/register" *ngIf="!auth.isLoggedIn()">Register</a>
        <span (click)="auth.logout()" *ngIf="auth.isLoggedIn()" class="logout">
          Logout ({{ auth.getPatient()?.name }})
        </span>
      </div>
    </nav>
  `,
  styles: [
    `
      .navbar {
        background: #1976d2;
        color: white;
        padding: 0 20px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 60px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      }
      .nav-brand {
        font-size: 18px;
        font-weight: bold;
        cursor: pointer;
      }
      .nav-links a,
      .nav-links span {
        color: white;
        text-decoration: none;
        margin-left: 20px;
        font-size: 14px;
        cursor: pointer;
        padding: 5px 10px;
        border-radius: 4px;
        transition: background 0.2s;
      }
      .nav-links a:hover,
      .nav-links span:hover {
        background: rgba(255, 255, 255, 0.2);
      }
      .logout {
        background: rgba(255, 255, 255, 0.15);
      }
    `,
  ],
})
export class NavbarComponent {
  constructor(public auth: AuthService) {}
}
