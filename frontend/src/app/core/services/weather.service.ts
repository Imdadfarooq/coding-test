import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { WeatherData, ForecastItem } from '../../shared/models';

interface WeatherState {
  current: WeatherData | null;
  forecast: ForecastItem[];
  loading: boolean;
  error: string | null;
  isMock: boolean;
}

@Injectable({ providedIn: 'root' })
export class WeatherService {
  private _state = signal<WeatherState>({
    current: null,
    forecast: [],
    loading: false,
    error: null,
    isMock: false,
  });

  readonly state = this._state.asReadonly();

  constructor(private http: HttpClient) {}

  getWeather(city: string = 'Srinagar', units: string = 'metric'): Observable<any> {
    this._state.update((s) => ({ ...s, loading: true, error: null }));
    const params = new HttpParams().set('city', city).set('units', units);

    return this.http.get<any>(`${environment.apiUrl}/weather`, { params }).pipe(
      tap((res) => {
        this._state.update((s) => ({
          ...s,
          current: res.data,
          loading: false,
          isMock: res.isMock || false,
        }));
      }),
      catchError((err) => {
        this._state.update((s) => ({ ...s, loading: false, error: err.error?.message || 'Weather unavailable' }));
        return throwError(() => err);
      })
    );
  }

  getForecast(city: string = 'Srinagar'): Observable<any> {
    const params = new HttpParams().set('city', city);
    return this.http.get<any>(`${environment.apiUrl}/weather/forecast`, { params }).pipe(
      tap((res) => {
        this._state.update((s) => ({ ...s, forecast: res.data.forecast || [] }));
      }),
      catchError((err) => throwError(() => err))
    );
  }
}
