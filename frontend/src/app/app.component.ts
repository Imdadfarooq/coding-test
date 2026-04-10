import { Component, inject, computed } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    <div class="app-shell">
      @if (isAuthenticated()) {
        <nav class="sidebar">
          <div class="sidebar-brand">
            <span class="brand-icon">⚡</span>
            <span class="brand-name">MEAN<span class="brand-accent">Shop</span></span>
          </div>

          <ul class="nav-links">
            <li>
              <a routerLink="/dashboard" routerLinkActive="active">
                <span class="nav-icon">📊</span> Dashboard
              </a>
            </li>
            <li>
              <a routerLink="/products" routerLinkActive="active">
                <span class="nav-icon">📦</span> Products
              </a>
            </li>
            <li>
              <a routerLink="/orders" routerLinkActive="active">
                <span class="nav-icon">🛒</span> Orders
              </a>
            </li>
          </ul>

          <div class="sidebar-footer">
            <div class="user-info">
              <div class="user-avatar">{{ userInitial() }}</div>
              <div class="user-meta">
                <span class="user-name">{{ user()?.username }}</span>
                <span class="user-role">{{ user()?.role }}</span>
              </div>
            </div>
            <button class="logout-btn" (click)="logout()">↩ Logout</button>
          </div>
        </nav>
      }

      <main class="main-content" [class.no-sidebar]="!isAuthenticated()">
        <router-outlet />
      </main>
    </div>
  `,
})
export class AppComponent {
  private authService = inject(AuthService);

  isAuthenticated = this.authService.isAuthenticated;
  user = this.authService.user;
  userInitial = computed(() => this.user()?.username?.[0]?.toUpperCase() || '?');

  logout(): void {
    this.authService.logout();
  }
}
