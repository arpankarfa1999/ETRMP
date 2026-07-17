import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { debounceTime } from 'rxjs';
import { Task, TaskStatus } from '../../../core/models/task.model';
import { TaskService } from '../services/task.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule,
    MatTableModule, MatPaginatorModule, MatSortModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatButtonModule, MatIconModule, MatDialogModule
  ],
  template: `
    <div class="page-container">
      <div class="header-row">
        <h1>Tasks</h1>
        <div class="header-actions">
          <button mat-stroked-button routerLink="board"><mat-icon>view_kanban</mat-icon> Board View</button>
          <button mat-flat-button color="primary" routerLink="new"><mat-icon>add</mat-icon> New Task</button>
        </div>
      </div>

      <div class="filters">
        <mat-form-field appearance="outline">
          <mat-label>Search</mat-label>
          <input matInput [formControl]="searchControl" placeholder="Task title">
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Status</mat-label>
          <mat-select [formControl]="statusFilter">
            <mat-option [value]="null">All</mat-option>
            <mat-option value="To Do">To Do</mat-option>
            <mat-option value="In Progress">In Progress</mat-option>
            <mat-option value="Blocked">Blocked</mat-option>
            <mat-option value="Completed">Completed</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <table mat-table [dataSource]="dataSource" matSort class="mat-elevation-z2 full-width">
        <ng-container matColumnDef="title">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Title</th>
          <td mat-cell *matCellDef="let t">{{ t.title }}</td>
        </ng-container>
        <ng-container matColumnDef="priority">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Priority</th>
          <td mat-cell *matCellDef="let t">{{ t.priority }}</td>
        </ng-container>
        <ng-container matColumnDef="status">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
          <td mat-cell *matCellDef="let t">{{ t.status }}</td>
        </ng-container>
        <ng-container matColumnDef="dueDate">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Due Date</th>
          <td mat-cell *matCellDef="let t">{{ t.dueDate }}</td>
        </ng-container>
        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef>Actions</th>
          <td mat-cell *matCellDef="let t">
            <button mat-icon-button [routerLink]="[t.id]"><mat-icon>edit</mat-icon></button>
            <button mat-icon-button (click)="remove(t)"><mat-icon>delete</mat-icon></button>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
      </table>

      <mat-paginator [pageSizeOptions]="[5, 10, 25]" [pageSize]="10"></mat-paginator>
    </div>
  `,
  styles: [`
    .header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .header-actions { display: flex; gap: 8px; }
    .filters { display: flex; gap: 16px; margin-bottom: 16px; flex-wrap: wrap; }
    .full-width { width: 100%; }
  `]
})
export class TaskListComponent implements OnInit {
  displayedColumns = ['title', 'priority', 'status', 'dueDate', 'actions'];
  dataSource = new MatTableDataSource<Task>([]);
  searchControl = new FormControl('');
  statusFilter = new FormControl<TaskStatus | null>(null);
  private allTasks: Task[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private taskService: TaskService,
    private notify: NotificationService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.taskService.getAll().subscribe(tasks => {
      this.allTasks = tasks;
      this.applyFilters();
    });
    this.searchControl.valueChanges.pipe(debounceTime(250)).subscribe(() => this.applyFilters());
    this.statusFilter.valueChanges.subscribe(() => this.applyFilters());
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  private applyFilters(): void {
    const search = (this.searchControl.value ?? '').toLowerCase();
    const status = this.statusFilter.value;
    this.dataSource.data = this.allTasks.filter(t =>
      t.title.toLowerCase().includes(search) && (!status || t.status === status)
    );
  }

  remove(task: Task): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Delete Task', message: `Delete "${task.title}"?` }
    });
    ref.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.taskService.delete(task.id).subscribe(() => this.notify.success('Task deleted.'));
      }
    });
  }
}
