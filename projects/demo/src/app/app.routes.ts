import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', loadComponent: () => import('./pages/home.page').then(m => m.HomePage) },
  { path: 'settings', loadComponent: () => import('./pages/settings.page').then(m => m.SettingsPage) },
  { path: 'admin', loadComponent: () => import('./pages/admin.page').then(m => m.AdminPage) },
  { path: 'manage', loadComponent: () => import('./pages/manage.page').then(m => m.ManagePage) },
];
