import { Routes } from '@angular/router';

// Feature-level route table, lazy-loaded from app.routes.ts.
// This is a "child routes" example: '' -> list, 'new' -> create form,
// ':id' -> edit form, all nested under the parent '/users' path.
export const USERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./user-list/user-list.component').then(m => m.UserListComponent)
  },
  {
    path: 'new',
    loadComponent: () => import('./user-form/user-form.component').then(m => m.UserFormComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./user-form/user-form.component').then(m => m.UserFormComponent)
  }
];
