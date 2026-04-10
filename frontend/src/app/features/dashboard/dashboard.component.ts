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
  templateUrl: './dashboard.component.html',
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
