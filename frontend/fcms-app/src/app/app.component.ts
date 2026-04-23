import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './components/navbar/navbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, NavbarComponent],
  template: `
    <app-navbar></app-navbar>
    <div class="main-content">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [
    `
      .main-content {
        max-width: 1200px;
        margin: 20px auto;
        padding: 0 20px;
      }
    `,
  ],
})
export class AppComponent {
  title = 'fcms-app';
}
