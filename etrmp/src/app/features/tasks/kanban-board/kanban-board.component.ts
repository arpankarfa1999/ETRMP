import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { Task, TaskStatus } from '../../../core/models/task.model';
import { TaskService } from '../services/task.service';
import { NotificationService } from '../../../core/services/notification.service';

// KANBAN BOARD using Angular CDK Drag & Drop (mandatory requirement).
// Each column is its own cdkDropList; dragging a card between lists
// calls transferArrayItem to move it in the UI immediately (optimistic
// update), then persists the new status to the API.
@Component({
  selector: 'app-kanban-board',
  standalone: true,
  imports: [CommonModule, RouterModule, DragDropModule, MatCardModule, MatChipsModule],
  template: `
    <div class="page-container">
      <h1>Task Board</h1>
      <div class="board">
        <div class="column" *ngFor="let col of columns">
          <h3>{{ col }} <span class="count">{{ tasksByStatus(col).length }}</span></h3>
          <div
            cdkDropList
            [id]="col"
            [cdkDropListData]="tasksByStatus(col)"
            [cdkDropListConnectedTo]="columns"
            class="drop-list"
            (cdkDropListDropped)="drop($event, col)">
            <mat-card
              *ngFor="let task of tasksByStatus(col); trackBy: trackByTaskId"
              cdkDrag
              class="task-card">
              <div class="task-title">{{ task.title }}</div>
              <mat-chip [class]="'chip-' + task.priority.toLowerCase()">{{ task.priority }}</mat-chip>
              <div class="task-due">Due {{ task.dueDate }}</div>
            </mat-card>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .board { display: flex; gap: 16px; overflow-x: auto; padding-bottom: 8px; }
    .column { flex: 0 0 260px; background: #eceff1; border-radius: 8px; padding: 8px; }
    .count { color: #888; font-size: 12px; }
    .drop-list { min-height: 100px; }
    .task-card { padding: 10px; margin-bottom: 8px; cursor: grab; }
    .task-title { font-weight: 600; font-size: 14px; margin-bottom: 6px; }
    .task-due { font-size: 11px; color: #888; margin-top: 6px; }
    .chip-high { background: #ffcdd2; }
    .chip-medium { background: #fff9c4; }
    .chip-low { background: #c8e6c9; }
    .cdk-drag-preview { box-shadow: 0 4px 12px rgba(0,0,0,.2); }
    .cdk-drop-list-dragging .task-card:not(.cdk-drag-placeholder) { transition: transform .2s ease; }
  `]
})
export class KanbanBoardComponent implements OnInit {
  columns: TaskStatus[] = ['To Do', 'In Progress', 'Blocked', 'Completed'];
  tasks: Task[] = [];

  constructor(private taskService: TaskService, private notify: NotificationService) {}

  ngOnInit(): void {
    this.taskService.getAll().subscribe(tasks => (this.tasks = tasks));
  }

  tasksByStatus(status: TaskStatus): Task[] {
    return this.tasks.filter(t => t.status === status);
  }

  drop(event: CdkDragDrop<Task[]>, targetColumn: TaskStatus): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      return;
    }

    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex
    );

    const movedTask = event.container.data[event.currentIndex];
    movedTask.status = targetColumn;

    this.taskService.updateStatus(movedTask.id, targetColumn).subscribe({
      next: () => this.notify.success(`Task moved to "${targetColumn}"`),
      error: () => this.notify.error('Failed to update task status.')
    });
  }

  trackByTaskId(_index: number, task: Task): string {
    return task.id;
  }
}
