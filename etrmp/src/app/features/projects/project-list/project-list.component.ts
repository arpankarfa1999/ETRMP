import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { Project } from '../../../core/models/project.model';
import { ProjectService } from '../services/project.service';
import { Task } from '../../../core/models/task.model';
import { TaskService } from '../../tasks/services/task.service';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule, MatProgressBarModule, MatChipsModule],
  template: `
    <div class="page-container">
      <div class="header-row">
        <h1>Projects</h1>
        <button mat-flat-button color="primary" routerLink="new">
          <mat-icon>add</mat-icon> New Project
        </button>
      </div>

      <div class="project-grid">
        <mat-card *ngFor="let p of projects; trackBy: trackByProjectId" class="project-card" [routerLink]="[p.id]">
          <div class="card-header">
            <h3>{{ p.name }}</h3>
            <mat-chip [class]="'chip-' + p.priority.toLowerCase()">{{ p.priority }}</mat-chip>
          </div>
          <p class="code">{{ p.code }}</p>
          <p class="desc">{{ p.description }}</p>
          <mat-progress-bar mode="determinate" [value]="progressFor(p.id)"></mat-progress-bar>
          <div class="footer-row">
            <span class="status" [class]="'status-' + p.status.toLowerCase().replace(' ', '-')">{{ p.status }}</span>
            <span class="dates">{{ p.startDate }} → {{ p.endDate }}</span>
          </div>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .project-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
    .project-card { padding: 16px; cursor: pointer; }
    .card-header { display: flex; justify-content: space-between; align-items: center; }
    .code { color: #888; font-size: 12px; margin: 2px 0 8px; }
    .desc { font-size: 13px; color: #555; min-height: 36px; }
    .footer-row { display: flex; justify-content: space-between; margin-top: 8px; font-size: 12px; color: #777; }
    .chip-high { background: #ffcdd2; }
    .chip-medium { background: #fff9c4; }
    .chip-low { background: #c8e6c9; }
  `]
})
export class ProjectListComponent implements OnInit {
  projects: Project[] = [];
  private tasks: Task[] = [];

  constructor(private projectService: ProjectService, private taskService: TaskService) {}

  ngOnInit(): void {
    this.projectService.getAll().subscribe(projects => (this.projects = projects));
    this.taskService.getAll().subscribe(tasks => (this.tasks = tasks));
  }

  progressFor(projectId: string): number {
    const projectTasks = this.tasks.filter(t => t.projectId === projectId);
    if (!projectTasks.length) return 0;
    const done = projectTasks.filter(t => t.status === 'Completed').length;
    return Math.round((done / projectTasks.length) * 100);
  }

  trackByProjectId(_index: number, project: Project): string {
    return project.id;
  }
}
