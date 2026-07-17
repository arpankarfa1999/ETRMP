import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

// REACTIVE FORM EXAMPLE #1 (Mandatory requirement: Reactive Forms).
// Every field is built in the TS class with FormBuilder, not with
// ngModel in the template - this is what "Reactive Forms" means in Angular.
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatFormFieldModule, MatInputModule, MatButtonModule, MatCheckboxModule, MatCardModule
  ],
  template: `
    <mat-card class="login-card">
      <h1>ETRMP Login</h1>
      <p class="subtitle">Enterprise Task & Resource Management Portal</p>

      <form [formGroup]="form" (ngSubmit)="submit()">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Email</mat-label>
          <input matInput type="email" formControlName="email" placeholder="admin&#64;etrmp.com">
          <mat-error *ngIf="form.get('email')?.hasError('required')">Email is required</mat-error>
          <mat-error *ngIf="form.get('email')?.hasError('email')">Enter a valid email</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Password</mat-label>
          <input matInput type="password" formControlName="password">
          <mat-error *ngIf="form.get('password')?.hasError('required')">Password is required</mat-error>
          <mat-error *ngIf="form.get('password')?.hasError('minlength')">Min 6 characters</mat-error>
        </mat-form-field>

        <mat-checkbox formControlName="rememberMe">Remember Me</mat-checkbox>

        <button mat-flat-button color="primary" class="full-width submit-btn"
                type="submit" [disabled]="form.invalid || submitting">
          {{ submitting ? 'Signing in...' : 'Sign In' }}
        </button>
      </form>

      <p class="hint">Demo accounts: admin&#64;etrmp.com / manager&#64;etrmp.com / member&#64;etrmp.com (password: <code>Passw0rd!</code>)</p>
    </mat-card>
  `,
  styles: [`
    .login-card { width: 380px; padding: 32px; }
    .subtitle { color: #666; margin-top: -8px; margin-bottom: 24px; font-size: 13px; }
    .full-width { width: 100%; }
    .submit-btn { margin-top: 16px; height: 44px; }
    .hint { font-size: 12px; color: #888; margin-top: 16px; }
  `]
})
export class LoginComponent {
  submitting = false;

  form: any;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private notify: NotificationService,
    private router: Router
  ) {
    // initialize form after fb is available
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [true]
    });
  }

  async submit(): Promise<void> {
    if (this.form.invalid) return;
    this.submitting = true;
    try {
      const { email, password, rememberMe } = this.form.getRawValue();
      const user = await this.auth.login({ email: email!, password: password!, rememberMe: !!rememberMe });
      this.notify.success(`Welcome back, ${user.name}!`);
      this.router.navigate(['/dashboard']);
    } catch (err) {
      this.notify.error('Invalid email or password.');
    } finally {
      this.submitting = false;
    }
  }
}
