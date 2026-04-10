import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, AuthResponse, AuthState } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'auth_user';

  // Angular signals for state management
  private _state = signal<AuthState>({
    user: this.loadUser(),
    token: this.loadToken(),
    isAuthenticated: !!this.loadToken(),
    loading: false,
    error: null,
  });

  readonly state = this._state.asReadonly();
  readonly user = computed(() => this._state().user);
  readonly isAuthenticated = computed(() => this._state().isAuthenticated);
  readonly loading = computed(() => this._state().loading);
  readonly error = computed(() => this._state().error);
  readonly isAdmin = computed(() => this._state().user?.role === 'admin');

  constructor(private http: HttpClient, private router: Router) {}

  register(data: { username: string; email: string; password: string }): Observable<AuthResponse> {
    this.setLoading(true);
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, data).pipe(
      tap((res) => this.handleAuthSuccess(res)),
      catchError((err) => {
        this.setError(err.error?.message || 'Registration failed');
        return throwError(() => err);
      })
    );
  }

  login(data: { email: string; password: string }): Observable<AuthResponse> {
    this.setLoading(true);
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, data).pipe(
      tap((res) => this.handleAuthSuccess(res)),
      catchError((err) => {
        this.setError(err.error?.message || 'Login failed');
        return throwError(() => err);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this._state.set({ user: null, token: null, isAuthenticated: false, loading: false, error: null });
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return this._state().token;
  }

  clearError(): void {
    this._state.update((s) => ({ ...s, error: null }));
  }

  private handleAuthSuccess(res: AuthResponse): void {
    const { user, token } = res.data;
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this._state.set({ user, token, isAuthenticated: true, loading: false, error: null });
    this.router.navigate(['/dashboard']);
  }

  private setLoading(loading: boolean): void {
    this._state.update((s) => ({ ...s, loading, error: null }));
  }

  private setError(error: string): void {
    this._state.update((s) => ({ ...s, loading: false, error }));
  }

  private loadToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private loadUser(): User | null {
    const raw = localStorage.getItem(this.USER_KEY);
    try { return raw ? JSON.parse(raw) : null; } catch { return null; }
  }
}
