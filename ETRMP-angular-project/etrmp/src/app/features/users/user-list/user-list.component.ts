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
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { User, UserRole } from '../../../core/models/user.model';
import { UserService } from '../services/user.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

// Demonstrates: search, sort, pagination, filter-by-role, filter by status,
// and trackBy for *ngFor performance (used inside the MatTable's rowDef,
// Angular Material tables already trackBy on row identity internally,
// so we implement it explicitly wherever we hand-roll *ngFor below).
@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule,
    MatTableModule, MatPaginatorModule, MatSortModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatButtonModule, MatIconModule, MatDialogModule
  ],
  template: `
    <div class="page-container">
      <div class="header-row">
        <h1>User Management</h1>
        <button mat-flat-button color="primary" routerLink="new">
          <mat-icon>add</mat-icon> Add User
        </button>
      </div>

      <div class="filters">
        <mat-form-field appearance="outline">
          <mat-label>Search</mat-label>
          <input matInput [formControl]="searchControl" placeholder="Name or email">
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Role</mat-label>
          <mat-select [formControl]="roleFilter">
            <mat-option [value]="null">All Roles</mat-option>
            <mat-option value="Admin">Admin</mat-option>
            <mat-option value="Project Manager">Project Manager</mat-option>
            <mat-option value="Team Member">Team Member</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Status</mat-label>
          <mat-select [formControl]="statusFilter">
            <mat-option [value]="null">All</mat-option>
            <mat-option value="Active">Active</mat-option>
            <mat-option value="Inactive">Inactive</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <table mat-table [dataSource]="dataSource" matSort class="mat-elevation-z2 full-width">
        <ng-container matColumnDef="name">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Name</th>
          <td mat-cell *matCellDef="let u">{{ u.name }}</td>
        </ng-container>
        <ng-container matColumnDef="email">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Email</th>
          <td mat-cell *matCellDef="let u">{{ u.email }}</td>
        </ng-container>
        <ng-container matColumnDef="role">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Role</th>
          <td mat-cell *matCellDef="let u">{{ u.role }}</td>
        </ng-container>
        <ng-container matColumnDef="department">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Department</th>
          <td mat-cell *matCellDef="let u">{{ u.department }}</td>
        </ng-container>
        <ng-container matColumnDef="status">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
          <td mat-cell *matCellDef="let u">
            <span class="badge" [class.active]="u.status === 'Active'">{{ u.status }}</span>
          </td>
        </ng-container>
        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef>Actions</th>
          <td mat-cell *matCellDef="let u">
            <button mat-icon-button [routerLink]="[u.id]"><mat-icon>edit</mat-icon></button>
            <button mat-icon-button (click)="remove(u)"><mat-icon>delete</mat-icon></button>
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
    .filters { display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 16px; }
    .full-width { width: 100%; }
    .badge { padding: 2px 10px; border-radius: 12px; background: #eee; font-size: 12px; }
    .badge.active { background: #c8e6c9; color: #2e7d32; }
  `]
})
export class UserListComponent implements OnInit {
  displayedColumns = ['name', 'email', 'role', 'department', 'status', 'actions'];
  dataSource = new MatTableDataSource<User>([]);

  searchControl = new FormControl('');
  roleFilter = new FormControl<UserRole | null>(null);
  statusFilter = new FormControl<'Active' | 'Inactive' | null>(null);

  private allUsers: User[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private userService: UserService,
    private notify: NotificationService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.userService.getAll().subscribe(users => {
      this.allUsers = users;
      this.applyFilters();
    });

    // debounceTime + distinctUntilChanged: classic RxJS pattern so we
    // don't refilter on every single keystroke.
    this.searchControl.valueChanges
      .pipe(debounceTime(250), distinctUntilChanged())
      .subscribe(() => this.applyFilters());

    this.roleFilter.valueChanges.subscribe(() => this.applyFilters());
    this.statusFilter.valueChanges.subscribe(() => this.applyFilters());
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  private applyFilters(): void {
    const search = (this.searchControl.value ?? '').toLowerCase();
    const role = this.roleFilter.value;
    const status = this.statusFilter.value;

    this.dataSource.data = this.allUsers.filter(u =>
      (u.name.toLowerCase().includes(search) || u.email.toLowerCase().includes(search)) &&
      (!role || u.role === role) &&
      (!status || u.status === status)
    );
  }

  remove(user: User): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Delete User', message: `Delete ${user.name}? This cannot be undone.` }
    });
    ref.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.userService.delete(user.id).subscribe(() => {
          this.notify.success('User deleted.');
        });
      }
    });
  }

  trackByUserId(_index: number, user: User): string {
    return user.id;
  }
}
