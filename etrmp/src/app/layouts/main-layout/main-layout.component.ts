import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

// The authenticated "shell" of the app: navbar on top, collapsible
// sidebar on the left, and whatever the current route renders on the right.
@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, SidebarComponent, LoadingSpinnerComponent],
  template: `
    <app-loading-spinner></app-loading-spinner>
    <app-navbar (toggleSidebar)="sidebarCollapsed = !sidebarCollapsed"></app-navbar>
    <div class="shell">
      <app-sidebar [collapsed]="sidebarCollapsed"></app-sidebar>
      <main class="content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .shell { display: flex; min-height: calc(100vh - 64px); }
    .content { flex: 1; overflow-x: hidden; }
    @media (max-width: 768px) {
      .shell { flex-direction: column; }
    }
  `]
})
export class MainLayoutComponent {
  sidebarCollapsed = false;
}
