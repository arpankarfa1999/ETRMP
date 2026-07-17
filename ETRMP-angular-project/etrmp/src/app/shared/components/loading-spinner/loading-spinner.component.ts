import { Component } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { LoadingService } from '../../../core/services/loading.service';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule, AsyncPipe, MatProgressBarModule],
  template: `
    <mat-progress-bar *ngIf="loading.loading$ | async" mode="indeterminate" color="accent">
    </mat-progress-bar>
  `
})
export class LoadingSpinnerComponent {
  constructor(public loading: LoadingService) {}
}
