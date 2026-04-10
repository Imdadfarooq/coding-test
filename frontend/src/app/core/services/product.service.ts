import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Product, ProductForm, ApiResponse } from '../../shared/models';

interface ProductsState {
  products: Product[];
  selectedProduct: Product | null;
  loading: boolean;
  error: string | null;
  pagination: { total: number; page: number; limit: number; totalPages: number };
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private _state = signal<ProductsState>({
    products: [],
    selectedProduct: null,
    loading: false,
    error: null,
    pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },
  });

  readonly state = this._state.asReadonly();

  constructor(private http: HttpClient) {}

  getProducts(params: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
  } = {}): Observable<any> {
    this._state.update((s) => ({ ...s, loading: true, error: null }));

    let httpParams = new HttpParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        httpParams = httpParams.set(key, String(val));
      }
    });

    return this.http.get<any>(`${environment.apiUrl}/products`, { params: httpParams }).pipe(
      tap((res) => {
        this._state.update((s) => ({
          ...s,
          products: res.data.products,
          pagination: res.data.pagination,
          loading: false,
        }));
      }),
      catchError((err) => {
        this._state.update((s) => ({ ...s, loading: false, error: err.error?.message || 'Failed to load products' }));
        return throwError(() => err);
      })
    );
  }

  getProduct(id: number): Observable<ApiResponse<Product>> {
    return this.http.get<ApiResponse<Product>>(`${environment.apiUrl}/products/${id}`).pipe(
      tap((res) => this._state.update((s) => ({ ...s, selectedProduct: res.data }))),
      catchError((err) => throwError(() => err))
    );
  }

  createProduct(data: ProductForm): Observable<ApiResponse<Product>> {
    return this.http.post<ApiResponse<Product>>(`${environment.apiUrl}/products`, data).pipe(
      tap((res) => {
        this._state.update((s) => ({
          ...s,
          products: [res.data, ...s.products],
          pagination: { ...s.pagination, total: s.pagination.total + 1 },
        }));
      }),
      catchError((err) => throwError(() => err))
    );
  }

  updateProduct(id: number, data: Partial<ProductForm>): Observable<ApiResponse<Product>> {
    return this.http.put<ApiResponse<Product>>(`${environment.apiUrl}/products/${id}`, data).pipe(
      tap((res) => {
        this._state.update((s) => ({
          ...s,
          products: s.products.map((p) => (p.id === id ? res.data : p)),
          selectedProduct: res.data,
        }));
      }),
      catchError((err) => throwError(() => err))
    );
  }

  deleteProduct(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${environment.apiUrl}/products/${id}`).pipe(
      tap(() => {
        this._state.update((s) => ({
          ...s,
          products: s.products.filter((p) => p.id !== id),
          pagination: { ...s.pagination, total: Math.max(0, s.pagination.total - 1) },
        }));
      }),
      catchError((err) => throwError(() => err))
    );
  }

  clearSelected(): void {
    this._state.update((s) => ({ ...s, selectedProduct: null }));
  }
}
