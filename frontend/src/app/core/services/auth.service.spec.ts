import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  const mockAuthResponse = {
    success: true,
    message: 'Login successful',
    data: {
      user: { id: 1, username: 'testuser', email: 'test@example.com', role: 'user' as const },
      token: 'mock-jwt-token',
    },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [AuthService],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start unauthenticated when no token in localStorage', () => {
    expect(service.isAuthenticated()).toBeFalse();
    expect(service.user()).toBeNull();
  });

  it('should login and set authenticated state', () => {
    service.login({ email: 'test@example.com', password: 'password123' }).subscribe((res) => {
      expect(res.success).toBeTrue();
    });

    const req = httpMock.expectOne('/api/auth/login');
    expect(req.request.method).toBe('POST');
    req.flush(mockAuthResponse);

    expect(service.isAuthenticated()).toBeTrue();
    expect(service.user()?.username).toBe('testuser');
    expect(service.getToken()).toBe('mock-jwt-token');
  });

  it('should register and set authenticated state', () => {
    service.register({ username: 'newuser', email: 'new@example.com', password: 'password123' }).subscribe();

    const req = httpMock.expectOne('/api/auth/register');
    expect(req.request.method).toBe('POST');
    req.flush({ ...mockAuthResponse, message: 'User registered successfully' });

    expect(service.isAuthenticated()).toBeTrue();
  });

  it('should set error on failed login', () => {
    service.login({ email: 'bad@example.com', password: 'wrong' }).subscribe({
      error: () => {
        expect(service.error()).toBe('Invalid credentials.');
        expect(service.isAuthenticated()).toBeFalse();
      },
    });

    const req = httpMock.expectOne('/api/auth/login');
    req.flush({ success: false, message: 'Invalid credentials.' }, { status: 401, statusText: 'Unauthorized' });
  });

  it('should persist token to localStorage on login', () => {
    service.login({ email: 'test@example.com', password: 'password123' }).subscribe();
    httpMock.expectOne('/api/auth/login').flush(mockAuthResponse);

    expect(localStorage.getItem('auth_token')).toBe('mock-jwt-token');
  });

  it('should logout and clear state', () => {
    // First login
    service.login({ email: 'test@example.com', password: 'password123' }).subscribe();
    httpMock.expectOne('/api/auth/login').flush(mockAuthResponse);

    service.logout();

    expect(service.isAuthenticated()).toBeFalse();
    expect(service.user()).toBeNull();
    expect(service.getToken()).toBeNull();
    expect(localStorage.getItem('auth_token')).toBeNull();
  });

  it('should detect admin role', () => {
    const adminResponse = {
      ...mockAuthResponse,
      data: {
        ...mockAuthResponse.data,
        user: { ...mockAuthResponse.data.user, role: 'admin' as const },
      },
    };

    service.login({ email: 'admin@example.com', password: 'password123' }).subscribe();
    httpMock.expectOne('/api/auth/login').flush(adminResponse);

    expect(service.isAdmin()).toBeTrue();
  });

  it('should clear error state', () => {
    service.login({ email: 'bad@test.com', password: 'wrong' }).subscribe({ error: () => {} });
    httpMock.expectOne('/api/auth/login').flush(
      { message: 'Invalid credentials.' }, { status: 401, statusText: 'Unauthorized' }
    );

    service.clearError();
    expect(service.error()).toBeNull();
  });
});
