import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

function passwordMatch(control: AbstractControl) {
  const pass    = control.get('password')?.value;
  const confirm = control.get('confirmPassword')?.value;
  return pass === confirm ? null : { mismatch: true };
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card">

        <!-- Logo -->
        <div class="auth-logo">
          <div class="auth-logo-icon">⚡</div>
          <span class="auth-logo-name">MEAN<span>Shop</span></span>
        </div>

        <div class="auth-header">
          <h1>Create account</h1>
          <p>Join MEANShop and start managing your store</p>
        </div>

        @if (authService.error()) {
          <div class="alert alert-error">⚠ {{ authService.error() }}</div>
        }

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="auth-form">

          <div class="form-group">
            <label for="reg-username">Username</label>
            <input
              id="reg-username"
              type="text"
              formControlName="username"
              placeholder="johndoe"
            />
            @if (form.get('username')?.touched && form.get('username')?.errors?.['required']) {
              <span class="field-error">Username is required</span>
            }
            @if (form.get('username')?.touched && form.get('username')?.errors?.['minlength']) {
              <span class="field-error">Minimum 3 characters</span>
            }
          </div>

          <div class="form-group">
            <label for="reg-email">Email address</label>
            <input
              id="reg-email"
              type="email"
              formControlName="email"
              placeholder="you@example.com"
            />
            @if (form.get('email')?.touched && form.get('email')?.errors?.['required']) {
              <span class="field-error">Email is required</span>
            }
            @if (form.get('email')?.touched && form.get('email')?.errors?.['email']) {
              <span class="field-error">Enter a valid email address</span>
            }
          </div>

          <div class="form-group">
            <label for="reg-password">Password</label>
            <input
              id="reg-password"
              type="password"
              formControlName="password"
              placeholder="Min 6 characters"
            />
            @if (form.get('password')?.touched && form.get('password')?.errors?.['minlength']) {
              <span class="field-error">Minimum 6 characters</span>
            }
          </div>

          <div class="form-group">
            <label for="reg-confirm">Confirm password</label>
            <input
              id="reg-confirm"
              type="password"
              formControlName="confirmPassword"
              placeholder="Repeat your password"
            />
            @if (form.touched && form.errors?.['mismatch']) {
              <span class="field-error">Passwords do not match</span>
            }
          </div>

          <button
            type="submit"
            class="btn btn-primary btn-full"
            style="margin-top:.5rem"
            [disabled]="form.invalid || authService.loading()"
          >
            @if (authService.loading()) {
              <span class="spinner"></span> Creating account...
            } @else {
              Create Account
            }
          </button>
        </form>

        <p class="auth-link">
          Already have an account? <a routerLink="/auth/login">Sign in</a>
        </p>

      </div>
    </div>
  `,
})
export class RegisterComponent {
  authService = inject(AuthService);
  private fb  = inject(FormBuilder);

  form = this.fb.group({
    username:        ['', [Validators.required, Validators.minLength(3)]],
    email:           ['', [Validators.required, Validators.email]],
    password:        ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required],
  }, { validators: passwordMatch });

  onSubmit(): void {
    if (this.form.invalid) return;
    this.authService.clearError();
    const { username, email, password } = this.form.value;
    this.authService.register({ username: username!, email: email!, password: password! }).subscribe();
  }
}
