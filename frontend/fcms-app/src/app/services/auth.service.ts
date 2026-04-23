import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private router: Router) {}

  saveUser(token: string, patient: any): void {
    localStorage.setItem('token', token);
    localStorage.setItem('patient', JSON.stringify(patient));
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getPatient(): any {
    const patient = localStorage.getItem('patient');
    return patient ? JSON.parse(patient) : null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  isAdmin(): boolean {
    const patient = this.getPatient();
    return patient?.role === 'admin';
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('patient');
    this.router.navigate(['/login']);
  }
}
