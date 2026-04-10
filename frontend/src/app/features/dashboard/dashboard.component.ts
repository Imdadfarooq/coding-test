import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ProductService } from '../../core/services/product.service';
import { OrderService } from '../../core/services/order.service';
import { WeatherService } from '../../core/services/weather.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Dashboard</h1>
          <p class="page-subtitle">Welcome back, <strong>{{ user()?.username }}</strong> 👋</p>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card stat-blue">
          <div class="stat-icon">📦</div>
          <div class="stat-info">
            <span class="stat-value">{{ productCount() }}</span>
            <span class="stat-label">Total Products</span>
          </div>
          <a routerLink="/products" class="stat-link">View all →</a>
        </div>

        <div class="stat-card stat-green">
          <div class="stat-icon">🛒</div>
          <div class="stat-info">
            <span class="stat-value">{{ orderCount() }}</span>
            <span class="stat-label">Total Orders</span>
          </div>
          <a routerLink="/orders" class="stat-link">View all →</a>
        </div>

        <div class="stat-card stat-purple">
          <div class="stat-icon">💰</div>
          <div class="stat-info">
            <span class="stat-value">{{ totalRevenue() | currency }}</span>
            <span class="stat-label">Total Revenue</span>
          </div>
        </div>

        <div class="stat-card stat-orange">
          <div class="stat-icon">📈</div>
          <div class="stat-info">
            <span class="stat-value">{{ pendingOrders() }}</span>
            <span class="stat-label">Pending Orders</span>
          </div>
        </div>
      </div>

      <!-- Weather Widget -->
      <div class="dashboard-grid">
        <div class="weather-widget">
          <div class="widget-header">
            <h2>🌤 Live Weather</h2>
            <div class="city-input">
              <input
                type="text"
                [(ngModel)]="citySearch"
                placeholder="Enter city..."
                class="city-field"
                (keyup.enter)="searchWeather()"
              />
              <button class="btn btn-sm btn-secondary" (click)="searchWeather()">Search</button>
            </div>
          </div>

          @if (weatherService.state().loading) {
            <div class="widget-loading"><span class="spinner"></span> Loading weather...</div>
          } @else if (weatherService.state().error) {
            <div class="alert alert-error">{{ weatherService.state().error }}</div>
          } @else if (weatherService.state().current) {
            @let w = weatherService.state().current!;
            <div class="weather-main">
              <div class="weather-temp">
                <span class="temp-value">{{ w.temperature | number:'1.0-0' }}°{{ w.units === 'metric' ? 'C' : 'F' }}</span>
                <span class="weather-desc">{{ w.description | titlecase }}</span>
                <span class="weather-city">{{ w.city }}, {{ w.country }}</span>
              </div>
              <div class="weather-details">
                <div class="weather-detail">
                  <span>💧 Humidity</span><strong>{{ w.humidity }}%</strong>
                </div>
                <div class="weather-detail">
                  <span>💨 Wind</span><strong>{{ w.windSpeed }} m/s</strong>
                </div>
                <div class="weather-detail">
                  <span>🌡 Feels Like</span><strong>{{ w.feelsLike | number:'1.0-0' }}°</strong>
                </div>
                <div class="weather-detail">
                  <span>👁 Visibility</span><strong>{{ (w.visibility / 1000) | number:'1.0-1' }} km</strong>
                </div>
              </div>
            </div>
            @if (weatherService.state().isMock) {
              <p class="mock-note">📌 Mock data — set WEATHER_API_KEY in backend .env for live data</p>
            }
          }

          <!-- Forecast -->
          @if (weatherService.state().forecast.length > 0) {
            <div class="forecast-row">
              @for (item of weatherService.state().forecast; track item.date) {
                <div class="forecast-item">
                  <span class="forecast-day">{{ item.date }}</span>
                  <span class="forecast-temp">{{ item.temperature | number:'1.0-0' }}°</span>
                  <span class="forecast-desc">{{ item.description }}</span>
                </div>
              }
            </div>
          }
        </div>

        <!-- Quick Actions -->
        <div class="quick-actions">
          <h2 class="widget-header-title">Quick Actions</h2>
          <div class="action-list">
            <a routerLink="/products/new" class="action-item action-blue">
              <span class="action-icon">➕</span>
              <div>
                <strong>Add Product</strong>
                <p>Create a new product listing</p>
              </div>
            </a>
            <a routerLink="/orders/new" class="action-item action-green">
              <span class="action-icon">🛍</span>
              <div>
                <strong>Place Order</strong>
                <p>Create a new order</p>
              </div>
            </a>
            <a routerLink="/products" class="action-item action-purple">
              <span class="action-icon">📋</span>
              <div>
                <strong>Browse Products</strong>
                <p>View all products</p>
              </div>
            </a>
            <a routerLink="/orders" class="action-item action-orange">
              <span class="action-icon">📦</span>
              <div>
                <strong>My Orders</strong>
                <p>Track your orders</p>
              </div>
            </a>
          </div>
        </div>
      </div>

      <!-- Recent Products -->
      <div class="recent-section">
        <div class="section-header">
          <h2>Recent Products</h2>
          <a routerLink="/products" class="btn btn-sm btn-outline">View All</a>
        </div>

        @if (productService.state().loading) {
          <div class="table-loading"><span class="spinner"></span> Loading...</div>
        } @else if (productService.state().products.length === 0) {
          <div class="empty-state">
            <p>No products yet. <a routerLink="/products/new">Add your first product</a></p>
          </div>
        } @else {
          <div class="table-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Category</th>
                  <th>Stock</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                @for (product of productService.state().products.slice(0, 5); track product.id) {
                  <tr>
                    <td>{{ product.name }}</td>
                    <td>{{ product.price | currency }}</td>
                    <td><span class="badge">{{ product.category || '—' }}</span></td>
                    <td>{{ product.stock }}</td>
                    <td>
                      <a [routerLink]="['/products', product.id, 'edit']" class="btn btn-xs btn-outline">Edit</a>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  authService = inject(AuthService);
  productService = inject(ProductService);
  orderService = inject(OrderService);
  weatherService = inject(WeatherService);

  user = this.authService.user;
  citySearch = 'Srinagar';

  productCount = signal(0);
  orderCount = signal(0);
  totalRevenue = signal(0);
  pendingOrders = signal(0);

  ngOnInit(): void {
    this.loadData();
    this.weatherService.getWeather(this.citySearch).subscribe();
    this.weatherService.getForecast(this.citySearch).subscribe();
  }

  searchWeather(): void {
    if (this.citySearch.trim()) {
      this.weatherService.getWeather(this.citySearch).subscribe();
      this.weatherService.getForecast(this.citySearch).subscribe();
    }
  }

  private loadData(): void {
    this.productService.getProducts({ page: 1, limit: 10 }).subscribe(() => {
      this.productCount.set(this.productService.state().pagination.total);
    });

    this.orderService.getOrders({ page: 1, limit: 100 }).subscribe(() => {
      const orders = this.orderService.state().orders;
      this.orderCount.set(this.orderService.state().pagination.total);
      this.totalRevenue.set(orders.reduce((sum, o) => sum + Number(o.totalAmount), 0));
      this.pendingOrders.set(orders.filter((o) => o.status === 'pending').length);
    });
  }
}
