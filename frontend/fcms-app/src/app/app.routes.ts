import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { BookAppointmentComponent } from './components/book-appointment/book-appointment.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { MyAppointmentsComponent } from './components/my-appointments/my-appointments.component';
import { DoctorDashboardComponent } from './components/doctor-dashboard/doctor-dashboard.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'book', component: BookAppointmentComponent },
  { path: 'my-appointments', component: MyAppointmentsComponent },
  { path: 'admin', component: AdminDashboardComponent },
  { path: 'doctor-dashboard', component: DoctorDashboardComponent },
  { path: '**', redirectTo: '' },
];
