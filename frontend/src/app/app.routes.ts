import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  {
    path: 'auth',
    canActivate: [guestGuard],
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component').then((m) => m.LoginComponent),
      },
      {
        path: 'register',
        loadComponent: () => import('./features/auth/register/register.component').then((m) => m.RegisterComponent),
      },
    ],
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
  },
  {
    path: 'products',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/products/product-list/product-list.component').then((m) => m.ProductListComponent),
      },
      {
        path: 'new',
        loadComponent: () => import('./features/products/product-form/product-form.component').then((m) => m.ProductFormComponent),
      },
      {
        path: ':id/edit',
        loadComponent: () => import('./features/products/product-form/product-form.component').then((m) => m.ProductFormComponent),
      },
    ],
  },
  {
    path: 'orders',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/orders/order-list/order-list.component').then((m) => m.OrderListComponent),
      },
      {
        path: 'new',
        loadComponent: () => import('./features/orders/order-form/order-form.component').then((m) => m.OrderFormComponent),
      },
      {
        path: ':id',
        loadComponent: () => import('./features/orders/order-detail/order-detail.component').then((m) => m.OrderDetailComponent),
      },
    ],
  },
  { path: '**', redirectTo: '/dashboard' },
];
