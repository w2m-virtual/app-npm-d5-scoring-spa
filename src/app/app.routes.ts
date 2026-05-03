import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
  },
  {
    path: 'suppliers',
    loadComponent: () =>
      import('./features/suppliers-list/suppliers-list.component').then(
        (m) => m.SuppliersListComponent,
      ),
  },
  { path: '**', redirectTo: 'dashboard' },
];
