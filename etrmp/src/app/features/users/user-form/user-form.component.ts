import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { UserService } from '../services/user.service';
import { NotificationService } from '../../../core/services/notification.service';

// REACTIVE FORM EXAMPLE #2 - reused for both "create" and "edit" by
// checking whether an `id` route param is present. Shows validators:
// required, email, minLength/maxLength, and how to pre-populate a form
// with patchValue() when editing.
@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatCardModule
  ],
  template: `
    <div class="page-container">
      <mat-card class="form-card">
        <h1>{{ isEdit ? 'Edit User' : 'Add User' }}</h1>
        <form [formGroup]="form" (ngSubmit)="submit()">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Name</mat-label>
            <input matInput formControlName="name">
            <mat-error *ngIf="form.get('name')?.hasError('required')">Name is required</mat-error>
            <mat-error *ngIf="form.get('name')?.hasError('minlength')">Min 2 characters</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Email</mat-label>
            <input matInput formControlName="email">
            <mat-error *ngIf="form.get('email')?.hasError('required')">Email is required</mat-error>
            <mat-error *ngIf="form.get('email')?.hasError('email')">Enter a valid email</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Role</mat-label>
            <mat-select formControlName="role">
              <mat-option value="Admin">Admin</mat-option>
              <mat-option value="Project Manager">Project Manager</mat-option>
              <mat-option value="Team Member">Team Member</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Department</mat-label>
            <input matInput formControlName="department" maxlength="50">
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Status</mat-label>
            <mat-select formControlName="status">
              <mat-option value="Active">Active</mat-option>
              <mat-option value="Inactive">Inactive</mat-option>
            </mat-select>
          </mat-form-field>

          <div class="actions">
            <button mat-button type="button" (click)="cancel()">Cancel</button>
            <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid">
              Save
            </button>
          </div>
        </form>
      </mat-card>
    </div>
  `,
  styles: [`
    .form-card { max-width: 480px; padding: 24px; }
    .full-width { width: 100%; }
    .actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; }
  `]
})
export class UserFormComponent implements OnInit {
  isEdit = false;
  private userId: string | null = null;

  form: any;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private notify: NotificationService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    // initialize form after fb is available
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      role: ['Team Member', Validators.required],
      department: ['', Validators.required],
      status: ['Active', Validators.required]
    });
  }

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!this.userId;

    if (this.isEdit && this.userId) {
      this.userService.getById(this.userId).subscribe(user => {
        this.form.patchValue(user);
      });
    }
  }

  submit(): void {
    if (this.form.invalid) return;
    const raw = this.form.getRawValue();

    const payload = {
      name: raw.name ?? '',
      email: raw.email ?? '',
      role: (raw.role ?? 'Team Member') as any,
      department: raw.department ?? '',
      status: (raw.status ?? 'Active') as any
    } as Partial<import('../../../core/models/user.model').User>;

    const request$ = this.isEdit && this.userId
      ? this.userService.update(this.userId, payload)
      : this.userService.create(payload);

    request$.subscribe(() => {
      this.notify.success(`User ${this.isEdit ? 'updated' : 'created'} successfully.`);
      this.router.navigate(['/users']);
    });
  }

  cancel(): void {
    this.router.navigate(['/users']);
  }
}
