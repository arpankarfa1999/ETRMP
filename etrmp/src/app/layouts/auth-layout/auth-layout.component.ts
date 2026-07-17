import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

// Simple centered layout wrapper reserved for auth-related screens
// (login today; register / forgot-password could reuse it later).
@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="auth-shell">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    .auth-shell {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #3f51b5, #1a237e);
    }
  `]
})
export class AuthLayoutComponent {}
