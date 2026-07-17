import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ProjectService } from '../services/project.service';
import { UserService } from '../../users/services/user.service';
import { NotificationService } from '../../../core/services/notification.service';
import { User } from '../../../core/models/user.model';

// REACTIVE FORM EXAMPLE #3, this time with a CUSTOM VALIDATOR
// (endDate must be after startDate) applied at the FormGroup level.
@Component({
  selector: 'app-project-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule,
    MatCardModule, MatDatepickerModule, MatNativeDateModule
  ],
  template: `
    <div class="page-container">
      <mat-card class="form-card">
        <h1>{{ isEdit ? 'Edit Project' : 'New Project' }}</h1>
        <form [formGroup]="form" (ngSubmit)="submit()">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Project Name</mat-label>
            <input matInput formControlName="name">
            <mat-error *ngIf="form.get('name')?.hasError('required')">Required</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Project Code</mat-label>
            <input matInput formControlName="code" placeholder="PRJ-001">
            <mat-error *ngIf="form.get('code')?.hasError('pattern')">Format: PRJ-000</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Description</mat-label>
            <textarea matInput formControlName="description" rows="3"></textarea>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Start Date</mat-label>
            <input matInput [matDatepicker]="startPicker" formControlName="startDate">
            <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
            <mat-datepicker #startPicker></mat-datepicker>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>End Date</mat-label>
            <input matInput [matDatepicker]="endPicker" formControlName="endDate">
            <mat-datepicker-toggle matSuffix [for]="endPicker"></mat-datepicker-toggle>
            <mat-datepicker #endPicker></mat-datepicker>
          </mat-form-field>
          <div class="error-text" *ngIf="form.hasError('dateRange')">
            End date must be after start date.
          </div>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Manager</mat-label>
            <mat-select formControlName="managerId">
              <mat-option *ngFor="let m of managers" [value]="m.id">{{ m.name }}</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Status</mat-label>
            <mat-select formControlName="status">
              <mat-option value="Not Started">Not Started</mat-option>
              <mat-option value="In Progress">In Progress</mat-option>
              <mat-option value="On Hold">On Hold</mat-option>
              <mat-option value="Completed">Completed</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Priority</mat-label>
            <mat-select formControlName="priority">
              <mat-option value="Low">Low</mat-option>
              <mat-option value="Medium">Medium</mat-option>
              <mat-option value="High">High</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Budget ($)</mat-label>
            <input matInput type="number" formControlName="budget">
          </mat-form-field>

          <div class="actions">
            <button mat-button type="button" (click)="cancel()">Cancel</button>
            <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid">Save</button>
          </div>
        </form>
      </mat-card>
    </div>
  `,
  styles: [`
    .form-card { max-width: 560px; padding: 24px; }
    .full-width { width: 100%; }
    .actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; }
    .error-text { color: #c62828; font-size: 12px; margin: -8px 0 12px; }
  `]
})
export class ProjectFormComponent implements OnInit {
  isEdit = false;
  private projectId: string | null = null;
  managers: User[] = [];

  form: any;

  constructor(
    private fb: FormBuilder,
    private projectService: ProjectService,
    private userService: UserService,
    private notify: NotificationService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    // initialize form after fb is available
    this.form = this.fb.group({
      name: ['', Validators.required],
      code: ['', [Validators.required, Validators.pattern(/^PRJ-\d{3}$/)]],
      description: [''],
      startDate: [new Date(), Validators.required],
      endDate: [new Date(), Validators.required],
      managerId: ['', Validators.required],
      status: ['Not Started', Validators.required],
      priority: ['Medium', Validators.required],
      budget: [0, [Validators.required, Validators.min(0)]]
    }, { validators: this.dateRangeValidator });
  }

  ngOnInit(): void {
    this.userService.getAll().subscribe(users => {
      this.managers = users.filter(u => u.role === 'Project Manager' || u.role === 'Admin');
    });

    this.projectId = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!this.projectId;

    if (this.isEdit && this.projectId) {
      this.projectService.getById(this.projectId).subscribe(project => {
        this.form.patchValue({
          ...project,
          startDate: new Date(project.startDate),
          endDate: new Date(project.endDate)
        });
      });
    }
  }

  // Custom validator applied at the FormGroup level, because it needs
  // to compare two sibling controls (startDate vs endDate).
  private dateRangeValidator(group: any) {
    const start = group.get('startDate')?.value;
    const end = group.get('endDate')?.value;
    if (start && end && new Date(end) < new Date(start)) {
      return { dateRange: true };
    }
    return null;
  }

  submit(): void {
    if (this.form.invalid) return;
    const raw = this.form.getRawValue();
    const payload = {
      ...raw,
      startDate: new Date(raw.startDate!).toISOString().split('T')[0],
      endDate: new Date(raw.endDate!).toISOString().split('T')[0]
    };

    const request$ = this.isEdit && this.projectId
      ? this.projectService.update(this.projectId, payload)
      : this.projectService.create(payload);

    request$.subscribe(() => {
      this.notify.success(`Project ${this.isEdit ? 'updated' : 'created'}.`);
      this.router.navigate(['/projects']);
    });
  }

  cancel(): void {
    this.router.navigate(['/projects']);
  }
}
