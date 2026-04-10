import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-header">
          <h1>Welcome Back</h1>
          <p>Sign in to your MEANShop account</p>
        </div>

        @if (authService.error()) {
          <div class="alert alert-error">{{ authService.error() }}</div>
        }

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="auth-form">
          <div class="form-group">
            <label for="email">Email</label>
            <input id="email" type="email" formControlName="email" placeholder="you@example.com" />
            @if (form.get('email')?.touched && form.get('email')?.errors?.['required']) {
              <span class="field-error">Email is required</span>
            }
            @if (form.get('email')?.touched && form.get('email')?.errors?.['email']) {
              <span class="field-error">Invalid email address</span>
            }
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input id="password" type="password" formControlName="password" placeholder="••••••••" />
            @if (form.get('password')?.touched && form.get('password')?.errors?.['required']) {
              <span class="field-error">Password is required</span>
            }
          </div>

          <button type="submit" class="btn btn-primary btn-full" [disabled]="form.invalid || authService.loading()">
            @if (authService.loading()) { <span class="spinner"></span> Signing in... }
            @else { Sign In }
          </button>
        </form>

        <p class="auth-link">
          Don't have an account? <a routerLink="/auth/register">Register here</a>
        </p>
      </div>
    </div>
  `,
})
export class LoginComponent {
  authService = inject(AuthService);
  private fb = inject(FormBuilder);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  onSubmit(): void {
    if (this.form.invalid) return;
    this.authService.clearError();
    this.authService.login(this.form.value as { email: string; password: string }).subscribe();
  }
}
