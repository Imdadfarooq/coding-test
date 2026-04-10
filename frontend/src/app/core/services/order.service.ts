import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Order, OrderForm, ApiResponse } from '../../shared/models';

interface OrdersState {
  orders: Order[];
  selectedOrder: Order | null;
  loading: boolean;
  error: string | null;
  pagination: { total: number; page: number; limit: number };
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private _state = signal<OrdersState>({
    orders: [],
    selectedOrder: null,
    loading: false,
    error: null,
    pagination: { total: 0, page: 1, limit: 10 },
  });

  readonly state = this._state.asReadonly();

  constructor(private http: HttpClient) {}

  getOrders(params: { page?: number; limit?: number } = {}): Observable<any> {
    this._state.update((s) => ({ ...s, loading: true, error: null }));
    let httpParams = new HttpParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined) httpParams = httpParams.set(k, String(v));
    });

    return this.http.get<any>(`${environment.apiUrl}/orders`, { params: httpParams }).pipe(
      tap((res) => {
        this._state.update((s) => ({
          ...s,
          orders: res.data.orders,
          pagination: res.data.pagination,
          loading: false,
        }));
      }),
      catchError((err) => {
        this._state.update((s) => ({ ...s, loading: false, error: err.error?.message || 'Failed to load orders' }));
        return throwError(() => err);
      })
    );
  }

  getOrder(id: number): Observable<ApiResponse<Order>> {
    return this.http.get<ApiResponse<Order>>(`${environment.apiUrl}/orders/${id}`).pipe(
      tap((res) => this._state.update((s) => ({ ...s, selectedOrder: res.data }))),
      catchError((err) => throwError(() => err))
    );
  }

  createOrder(data: OrderForm): Observable<ApiResponse<Order>> {
    return this.http.post<ApiResponse<Order>>(`${environment.apiUrl}/orders`, data).pipe(
      tap((res) => {
        this._state.update((s) => ({
          ...s,
          orders: [res.data, ...s.orders],
          pagination: { ...s.pagination, total: s.pagination.total + 1 },
        }));
      }),
      catchError((err) => throwError(() => err))
    );
  }

  updateOrder(id: number, data: Partial<Order>): Observable<ApiResponse<Order>> {
    return this.http.put<ApiResponse<Order>>(`${environment.apiUrl}/orders/${id}`, data).pipe(
      tap((res) => {
        this._state.update((s) => ({
          ...s,
          orders: s.orders.map((o) => (o.orderId === id ? res.data : o)),
          selectedOrder: res.data,
        }));
      }),
      catchError((err) => throwError(() => err))
    );
  }

  deleteOrder(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${environment.apiUrl}/orders/${id}`).pipe(
      tap(() => {
        this._state.update((s) => ({
          ...s,
          orders: s.orders.filter((o) => o.orderId !== id),
          pagination: { ...s.pagination, total: Math.max(0, s.pagination.total - 1) },
        }));
      }),
      catchError((err) => throwError(() => err))
    );
  }
}
