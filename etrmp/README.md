# ETRMP — Enterprise Task & Resource Management Portal

An Angular 18 (standalone components) implementation of the capstone brief.

## 1. Prerequisites

- Node.js 18+ and npm
- Angular CLI: `npm install -g @angular/cli`

## 2. Install & Run (two terminals)

```bash
npm install

# Terminal 1: fake REST backend (reads db.json)
npm run api          # → http://localhost:3000

# Terminal 2: Angular dev server
npm start             # → http://localhost:4200
```

## 3. Demo logins (password for all: `Passw0rd!`)

| Role            | Email             |
|-----------------|-------------------|
| Admin           | admin@etrmp.com   |
| Project Manager | manager@etrmp.com |
| Team Member     | member@etrmp.com  |

Only Admin sees the **Users** menu item (role-based nav + route guard).

## 4. Folder structure, explained

```
src/app/
├── core/                  # singleton, app-wide stuff (loaded once)
│   ├── models/            # TypeScript interfaces: User, Project, Task, Auth
│   ├── services/          # AuthService, LoadingService, NotificationService
│   ├── guards/             # authGuard, roleGuard (functional route guards)
│   └── interceptors/       # authInterceptor, loadingInterceptor, errorInterceptor
├── shared/                 # reusable, presentational (dumb) components
│   └── components/
│       ├── navbar/          # top bar, emits (toggleSidebar) — @Output example
│       ├── sidebar/         # left nav, filters items by role
│       ├── loading-spinner/ # shows during any HTTP call
│       └── confirm-dialog/  # generic "Are you sure?" modal
├── layouts/
│   ├── main-layout/         # navbar + sidebar + <router-outlet> shell (protected)
│   └── auth-layout/         # centered shell for login page
├── features/                # one folder per business feature, LAZY-LOADED
│   ├── auth/login/           # reactive form + AuthService.login()
│   ├── dashboard/             # KPI cards + 3 charts via forkJoin
│   ├── users/                 # CRUD: list (search/sort/paginate/filter) + form
│   ├── projects/               # CRUD: list, detail (nested tasks), form
│   └── tasks/                   # CRUD: list, form, Kanban board (CDK drag-drop)
├── app.component.ts          # root shell, just <router-outlet>
├── app.config.ts              # DI providers: router, HttpClient, interceptors, toastr
└── app.routes.ts               # top-level route table
```

**Why this structure?** It's exactly what the brief asked for
(`core / shared / features / layouts`), and it's the structure most
real Angular teams use: `core` holds things that exist once for the
whole app, `shared` holds dumb reusable UI, and `features` holds
self-contained business areas that can be lazy-loaded independently.

## 5. How each mandatory requirement is met

| Requirement | Where |
|---|---|
| Route Guards | `core/guards/auth.guard.ts`, `role.guard.ts` |
| Mock JWT auth + session persistence | `core/services/auth.service.ts` (stores token in local/sessionStorage) |
| Lazy loading | every `loadComponent` / `loadChildren` in the `*.routes.ts` files |
| Reactive Forms + validators | `login`, `user-form`, `project-form` (custom cross-field validator), `task-form` |
| `@Input()` / `@Output()` | `sidebar` (`[collapsed]`), `navbar` (`(toggleSidebar)`) |
| RxJS: BehaviorSubject | `AuthService`, `UserService`, `ProjectService`, `TaskService` |
| RxJS: forkJoin | `dashboard.component.ts` (loads users+projects+tasks in parallel) |
| RxJS: debounceTime/distinctUntilChanged | search boxes in `user-list`, `task-list` |
| HTTP Interceptors | `auth.interceptor.ts`, `loading.interceptor.ts`, `error.interceptor.ts` |
| Retry logic | `error.interceptor.ts` (`retry()` on GET requests) |
| Charts (3+) | `dashboard.component.ts` via ngx-charts (pie, bar-vertical, bar-horizontal) |
| CRUD: Users/Projects/Tasks | `features/users`, `features/projects`, `features/tasks` |
| Search / Sort / Pagination / Filter | `user-list.component.ts`, `task-list.component.ts` (MatTable + MatSort + MatPaginator) |
| Kanban with CDK Drag & Drop | `features/tasks/kanban-board` |
| Notifications | `NotificationService` wrapping `ngx-toastr` |
| Nested/child routes | `projects.routes.ts` (`:id`, `:id/edit`), `users.routes.ts`, `tasks.routes.ts` |
| Responsive UI | CSS grid/flex breakpoints in `styles.scss` and each component's `@media` block |
| State management (Option 2) | BehaviorSubject + Services pattern, used consistently instead of NgRx |

## 6. What's intentionally left as a next step

This scaffold focuses on giving you a real, running app that demonstrates
every core Angular concept in the brief. Two sections are genuinely large
enough to be their own follow-up project and are **not** included yet:

- **Testing**: unit tests (Jasmine/Karma, 70% coverage) and e2e tests
  (Cypress/Playwright) for the 6 mandatory scenarios.
- **CI/CD & deployment**: GitHub Actions pipeline, Docker, cloud hosting
  (these are "Bonus" items in the rubric, not mandatory).

I'm happy to build either of these next — just ask, and tell me which
one to start with.

## 7. Angular Material setup note

This project references `@angular/material` components (`MatTableModule`,
`MatDialogModule`, etc.). After `npm install`, if Angular Material's
schematics haven't wired up animations/theme, run:

```bash
ng add @angular/material
```
and choose "Indigo/Pink" theme + "Yes" to animations — it's safe to
run even though `styles.scss` already imports the theme; the schematic
will just confirm your setup.
