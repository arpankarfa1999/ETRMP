import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  roles?: string[]; // if omitted, visible to everyone
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatListModule, MatIconModule],
  template: `
    <mat-nav-list [class.collapsed]="collapsed">
      <a mat-list-item *ngFor="let item of visibleItems()"
         [routerLink]="item.route" routerLinkActive="active-link">
        <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
        <span matListItemTitle>{{ item.label }}</span>
      </a>
    </mat-nav-list>
  `,
  styles: [`
    mat-nav-list { width: 220px; transition: width .2s ease; background: #fff; height: 100%; }
    mat-nav-list.collapsed { width: 64px; }
    .active-link { background: #e8eaf6; }
  `]
})
export class SidebarComponent {
  @Input() collapsed = false;

  private items: NavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
    { label: 'Users', icon: 'people', route: '/users', roles: ['Admin'] },
    { label: 'Projects', icon: 'folder', route: '/projects' },
    { label: 'Tasks', icon: 'task', route: '/tasks' }
  ];

  constructor(private auth: AuthService) {}

  // Role-based nav: items with a `roles` list only render for matching users.
  visibleItems(): NavItem[] {
    return this.items.filter(i => !i.roles || this.auth.hasRole(i.roles));
  }
}
