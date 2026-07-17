import { Routes } from '@angular/router';
import { DocsLayout } from './layouts/docs-layout';
import { MarketingLayout } from './layouts/marketing-layout';
import { PlaygroundLayout } from './layouts/playground-layout';

export const routes: Routes = [
  {
    path: '',
    component: MarketingLayout,
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./pages/landing.page').then((m) => m.LandingPage),
      },
      {
        path: 'features',
        loadComponent: () => import('./pages/features.page').then((m) => m.FeaturesPage),
      },
      {
        path: 'examples',
        loadComponent: () => import('./pages/examples.page').then((m) => m.ExamplesPage),
      },
      {
        path: 'docs',
        component: DocsLayout,
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'getting-started' },
          {
            path: 'getting-started',
            loadComponent: () =>
              import('./pages/docs/getting-started.page').then((m) => m.GettingStartedPage),
          },
          {
            path: 'concepts',
            loadComponent: () => import('./pages/docs/concepts.page').then((m) => m.ConceptsPage),
          },
          {
            path: 'recorder',
            loadComponent: () => import('./pages/docs/recorder.page').then((m) => m.RecorderPage),
          },
          {
            path: 'manage',
            loadComponent: () => import('./pages/docs/manage.page').then((m) => m.ManageDocPage),
          },
          {
            path: 'targeting',
            loadComponent: () => import('./pages/docs/targeting.page').then((m) => m.TargetingPage),
          },
          {
            path: 'audience',
            loadComponent: () => import('./pages/docs/audience.page').then((m) => m.AudiencePage),
          },
          {
            path: 'theming',
            loadComponent: () => import('./pages/docs/theming.page').then((m) => m.ThemingPage),
          },
          {
            path: 'accessibility',
            loadComponent: () =>
              import('./pages/docs/accessibility.page').then((m) => m.AccessibilityPage),
          },
          {
            path: 'api',
            loadComponent: () => import('./pages/docs/api.page').then((m) => m.ApiPage),
          },
        ],
      },
    ],
  },
  {
    path: 'playground',
    component: PlaygroundLayout,
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./pages/home.page').then((m) => m.HomePage),
      },
      {
        path: 'settings',
        loadComponent: () => import('./pages/settings.page').then((m) => m.SettingsPage),
      },
      {
        path: 'admin',
        loadComponent: () => import('./pages/admin.page').then((m) => m.AdminPage),
      },
      {
        path: 'manage',
        loadComponent: () => import('./pages/manage.page').then((m) => m.ManagePage),
      },
    ],
  },
];
