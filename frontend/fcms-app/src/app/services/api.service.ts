import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    });
  }

  // ── AUTH ─────────────────────────────────────────────
  register(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/register`, data);
  }

  login(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/login`, data);
  }

  // ── DOCTORS ──────────────────────────────────────────
  getDoctors(): Observable<any> {
    return this.http.get(`${this.baseUrl}/doctors`);
  }

  getDoctorById(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/doctors/${id}`);
  }

  getDoctorByUserId(userId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/doctors/by-user/${userId}`, {
      headers: this.getHeaders(),
    });
  }

  createDoctor(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/doctors`, data, {
      headers: this.getHeaders(),
    });
  }

  updateDoctorSlots(doctorId: string, slots: any[]): Observable<any> {
    return this.http.put(
      `${this.baseUrl}/doctors/${doctorId}/slots`,
      { availableSlots: slots },
      { headers: this.getHeaders() },
    );
  }

  addSingleSlot(doctorId: string, date: string, time: string): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/doctors/${doctorId}/slots`,
      { date, time },
      { headers: this.getHeaders() },
    );
  }

  deleteSlot(doctorId: string, slotId: string): Observable<any> {
    return this.http.delete(
      `${this.baseUrl}/doctors/${doctorId}/slots/${slotId}`,
      { headers: this.getHeaders() },
    );
  }

  // ── APPOINTMENTS ─────────────────────────────────────
  getAllAppointments(filters?: any): Observable<any> {
    let url = `${this.baseUrl}/appointments`;
    const params = [];
    if (filters?.date) params.push(`date=${filters.date}`);
    if (filters?.doctorId) params.push(`doctorId=${filters.doctorId}`);
    if (params.length > 0) url += '?' + params.join('&');
    return this.http.get(url, { headers: this.getHeaders() });
  }

  getPatientAppointments(patientId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/appointments/patient/${patientId}`, {
      headers: this.getHeaders(),
    });
  }

  getDoctorAppointments(doctorProfileId: string): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/appointments/doctor/${doctorProfileId}`,
      { headers: this.getHeaders() },
    );
  }

  bookAppointment(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/appointments`, data, {
      headers: this.getHeaders(),
    });
  }

  cancelAppointment(id: string, cancelledBy: string): Observable<any> {
    return this.http.put(
      `${this.baseUrl}/appointments/${id}/cancel`,
      { cancelledBy },
      { headers: this.getHeaders() },
    );
  }

  rescheduleAppointment(
    id: string,
    newDate: string,
    newTime: string,
  ): Observable<any> {
    return this.http.put(
      `${this.baseUrl}/appointments/${id}/reschedule`,
      { newDate, newTime },
      { headers: this.getHeaders() },
    );
  }
}
