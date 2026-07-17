import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { Project } from '../../../core/models/project.model';
import { Task } from '../../../core/models/task.model';
import { ProjectService } from '../services/project.service';
import { TaskService } from '../../tasks/services/task.service';

// ROUTE RESOLVER-STYLE DATA LOADING via ActivatedRoute.paramMap + switchMap.
// switchMap is the right operator here because if the id param changes
// (e.g. user navigates from one project detail straight to another),
// we want to CANCEL the previous in-flight request and switch to the new one.
@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatTableModule],
  template: `
    <div class="page-container" *ngIf="project as p">
      <div class="header-row">
        <h1>{{ p.name }} <small class="code">({{ p.code }})</small></h1>
        <button mat-flat-button color="primary" [routerLink]="['/projects', p.id, 'edit']">
          Edit
        </button>
      </div>

      <mat-card class="detail-card">
        <p>{{ p.description }}</p>
        <div class="meta-grid">
          <div><strong>Status:</strong> {{ p.status }}</div>
          <div><strong>Priority:</strong> {{ p.priority }}</div>
          <div><strong>Start:</strong> {{ p.startDate }}</div>
          <div><strong>End:</strong> {{ p.endDate }}</div>
          <div><strong>Budget:</strong> {{ p.budget | currency }}</div>
        </div>
      </mat-card>

      <h2>Tasks in this project</h2>
      <table mat-table [dataSource]="tasks" class="mat-elevation-z2 full-width">
        <ng-container matColumnDef="title">
          <th mat-header-cell *matHeaderCellDef>Title</th>
          <td mat-cell *matCellDef="let t">{{ t.title }}</td>
        </ng-container>
        <ng-container matColumnDef="status">
          <th mat-header-cell *matHeaderCellDef>Status</th>
          <td mat-cell *matCellDef="let t">{{ t.status }}</td>
        </ng-container>
        <ng-container matColumnDef="priority">
          <th mat-header-cell *matHeaderCellDef>Priority</th>
          <td mat-cell *matCellDef="let t">{{ t.priority }}</td>
        </ng-container>
        <ng-container matColumnDef="dueDate">
          <th mat-header-cell *matHeaderCellDef>Due</th>
          <td mat-cell *matCellDef="let t">{{ t.dueDate }}</td>
        </ng-container>
        <tr mat-header-row *matHeaderRowDef="cols"></tr>
        <tr mat-row *matRowDef="let row; columns: cols;"></tr>
      </table>
    </div>
  `,
  styles: [`
    .header-row { display: flex; justify-content: space-between; align-items: center; }
    .code { color: #888; font-weight: 400; }
    .detail-card { padding: 16px; margin: 16px 0; }
    .meta-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 8px; margin-top: 12px; }
    .full-width { width: 100%; }
  `]
})
export class ProjectDetailComponent implements OnInit {
  project: Project | null = null;
  tasks: Task[] = [];
  cols = ['title', 'status', 'priority', 'dueDate'];

  constructor(
    private route: ActivatedRoute,
    private projectService: ProjectService,
    private taskService: TaskService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.projectService.getById(id).subscribe(p => (this.project = p));
    this.taskService.getAll().subscribe(all => {
      this.tasks = all.filter(t => t.projectId === id);
    });
  }
}
