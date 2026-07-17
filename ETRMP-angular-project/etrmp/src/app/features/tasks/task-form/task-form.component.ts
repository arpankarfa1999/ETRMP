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
import { TaskService } from '../services/task.service';
import { ProjectService } from '../../projects/services/project.service';
import { UserService } from '../../users/services/user.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Project } from '../../../core/models/project.model';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule,
    MatCardModule, MatDatepickerModule, MatNativeDateModule
  ],
  template: `
    <div class="page-container">
      <mat-card class="form-card">
        <h1>{{ isEdit ? 'Edit Task' : 'New Task' }}</h1>
        <form [formGroup]="form" (ngSubmit)="submit()">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Title</mat-label>
            <input matInput formControlName="title">
            <mat-error *ngIf="form.get('title')?.hasError('required')">Required</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Description</mat-label>
            <textarea matInput formControlName="description" rows="3"></textarea>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Project</mat-label>
            <mat-select formControlName="projectId">
              <mat-option *ngFor="let p of projects" [value]="p.id">{{ p.name }}</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Assigned To</mat-label>
            <mat-select formControlName="assignedUserId">
              <mat-option *ngFor="let u of users" [value]="u.id">{{ u.name }}</mat-option>
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

          <mat-form-field appearance="outline">
            <mat-label>Status</mat-label>
            <mat-select formControlName="status">
              <mat-option value="To Do">To Do</mat-option>
              <mat-option value="In Progress">In Progress</mat-option>
              <mat-option value="Blocked">Blocked</mat-option>
              <mat-option value="Completed">Completed</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Due Date</mat-label>
            <input matInput [matDatepicker]="dp" formControlName="dueDate">
            <mat-datepicker-toggle matSuffix [for]="dp"></mat-datepicker-toggle>
            <mat-datepicker #dp></mat-datepicker>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Estimated Hours</mat-label>
            <input matInput type="number" formControlName="estimatedHours">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Actual Hours</mat-label>
            <input matInput type="number" formControlName="actualHours">
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
  `]
})
export class TaskFormComponent implements OnInit {
  isEdit = false;
  private taskId: string | null = null;
  projects: Project[] = [];
  users: User[] = [];

  form: any;

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    private projectService: ProjectService,
    private userService: UserService,
    private notify: NotificationService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    // initialize form after fb is available
    this.form = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      projectId: ['', Validators.required],
      assignedUserId: ['', Validators.required],
      priority: ['Medium', Validators.required],
      status: ['To Do', Validators.required],
      dueDate: [new Date(), Validators.required],
      estimatedHours: [0, [Validators.required, Validators.min(0)]],
      actualHours: [0, [Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.projectService.getAll().subscribe(projects => (this.projects = projects));
    this.userService.getAll().subscribe(users => (this.users = users));

    this.taskId = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!this.taskId;

    if (this.isEdit && this.taskId) {
      this.taskService.getById(this.taskId).subscribe(task => {
        this.form.patchValue({ ...task, dueDate: new Date(task.dueDate) });
      });
    }
  }

  submit(): void {
    if (this.form.invalid) return;
    const raw = this.form.getRawValue();
    const payload = { ...raw, dueDate: new Date(raw.dueDate!).toISOString().split('T')[0] };

    const request$ = this.isEdit && this.taskId
      ? this.taskService.update(this.taskId, payload)
      : this.taskService.create(payload);

    request$.subscribe(() => {
      this.notify.success(`Task ${this.isEdit ? 'updated' : 'created'}.`);
      this.router.navigate(['/tasks']);
    });
  }

  cancel(): void {
    this.router.navigate(['/tasks']);
  }
}
