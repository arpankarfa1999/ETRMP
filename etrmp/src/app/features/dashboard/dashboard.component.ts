import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { forkJoin } from 'rxjs';
import { ProjectService } from '../projects/services/project.service';
import { TaskService } from '../tasks/services/task.service';
import { UserService } from '../users/services/user.service';

// DASHBOARD
// Demonstrates RxJS forkJoin: we need projects + tasks + users all at
// once before we can compute KPIs, so we fire all three requests in
// parallel and wait for all of them to complete, instead of chaining
// them one after another (which would be slower).
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, NgxChartsModule],
  template: `
    <div class="page-container">
      <h1>Executive Dashboard</h1>

      <div class="kpi-cards">
        <mat-card class="kpi">
          <div class="kpi-value">{{ totalProjects }}</div>
          <div class="kpi-label">Total Projects</div>
        </mat-card>
        <mat-card class="kpi">
          <div class="kpi-value">{{ activeProjects }}</div>
          <div class="kpi-label">Active Projects</div>
        </mat-card>
        <mat-card class="kpi">
          <div class="kpi-value">{{ completedTasks }}</div>
          <div class="kpi-label">Completed Tasks</div>
        </mat-card>
        <mat-card class="kpi">
          <div class="kpi-value">{{ pendingTasks }}</div>
          <div class="kpi-label">Pending Tasks</div>
        </mat-card>
        <mat-card class="kpi">
          <div class="kpi-value">{{ teamUtilization }}%</div>
          <div class="kpi-label">Team Utilization</div>
        </mat-card>
      </div>

      <div class="charts-grid">
        <mat-card class="chart-card">
          <h3>Project Status</h3>
          <ngx-charts-pie-chart [results]="projectStatusData" [labels]="true" [legend]="true">
          </ngx-charts-pie-chart>
        </mat-card>

        <mat-card class="chart-card">
          <h3>Task Distribution</h3>
          <ngx-charts-bar-vertical [results]="taskDistributionData" [xAxis]="true" [yAxis]="true">
          </ngx-charts-bar-vertical>
        </mat-card>

        <mat-card class="chart-card">
          <h3>Resource Allocation</h3>
          <ngx-charts-bar-horizontal [results]="resourceAllocationData" [xAxis]="true" [yAxis]="true">
          </ngx-charts-bar-horizontal>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .kpi { padding: 16px; text-align: center; }
    .kpi-value { font-size: 28px; font-weight: 700; color: #3f51b5; }
    .kpi-label { color: #666; font-size: 13px; margin-top: 4px; }
    .charts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 16px;
    }
    .chart-card { padding: 16px; height: 320px; }
  `]
})
export class DashboardComponent implements OnInit {
  totalProjects = 0;
  activeProjects = 0;
  completedTasks = 0;
  pendingTasks = 0;
  teamUtilization = 0;

  projectStatusData: { name: string; value: number }[] = [];
  taskDistributionData: { name: string; value: number }[] = [];
  resourceAllocationData: { name: string; value: number }[] = [];

  constructor(
    private projectService: ProjectService,
    private taskService: TaskService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    forkJoin({
      projects: this.projectService.getAll(),
      tasks: this.taskService.getAll(),
      users: this.userService.getAll()
    }).subscribe(({ projects, tasks, users }) => {
      this.totalProjects = projects.length;
      this.activeProjects = projects.filter(p => p.status === 'In Progress').length;
      this.completedTasks = tasks.filter(t => t.status === 'Completed').length;
      this.pendingTasks = tasks.filter(t => t.status !== 'Completed').length;

      const activeUsers = users.filter(u => u.status === 'Active').length;
      this.teamUtilization = users.length ? Math.round((activeUsers / users.length) * 100) : 0;

      this.projectStatusData = this.groupBy(projects, 'status');
      this.taskDistributionData = this.groupBy(tasks, 'status');
      this.resourceAllocationData = this.groupBy(tasks, 'assignedUserId').map(d => ({
        name: users.find(u => u.id === d.name)?.name ?? d.name,
        value: d.value
      }));
    });
  }

  private groupBy<T extends Record<string, any>>(items: T[], key: keyof T) {
    const counts = new Map<string, number>();
    items.forEach(i => {
      const k = String(i[key]);
      counts.set(k, (counts.get(k) ?? 0) + 1);
    });
    return Array.from(counts.entries()).map(([name, value]) => ({ name, value }));
  }
}
