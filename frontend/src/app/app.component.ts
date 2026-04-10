import { Component, inject, computed, signal, HostListener } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './app.component.html',
})
export class AppComponent {
  private authService = inject(AuthService);

  isAuthenticated = this.authService.isAuthenticated;
  user            = this.authService.user;
  userInitial     = computed(() => this.user()?.username?.[0]?.toUpperCase() || '?');
  sidebarOpen     = signal(false);

  toggleSidebar(): void { this.sidebarOpen.update(v => !v); }
  closeSidebar():  void { this.sidebarOpen.set(false); }

  @HostListener('window:resize')
  onResize(): void {
    if (window.innerWidth > 768) this.sidebarOpen.set(false);
  }

  logout(): void {
    this.authService.logout();
  }
}
