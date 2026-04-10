import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { Order } from '../../../shared/models';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Orders</h1>
          <p class="page-subtitle">Manage and track all orders</p>
        </div>
        <a routerLink="/orders/new" class="btn btn-primary">➕ New Order</a>
      </div>

      @if (successMsg()) {
        <div class="alert alert-success">{{ successMsg() }}</div>
      }
      @if (errorMsg()) {
        <div class="alert alert-error">{{ errorMsg() }}</div>
      }

      @if (orderService.state().loading) {
        <div class="loading-overlay"><span class="spinner lg"></span><p>Loading orders...</p></div>
      } @else if (orderService.state().orders.length === 0) {
        <div class="empty-state">
          <div class="empty-icon">🛒</div>
          <h3>No orders yet</h3>
          <p>Place your first order to get started.</p>
          <a routerLink="/orders/new" class="btn btn-primary">Place Order</a>
        </div>
      } @else {
        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>#Order ID</th>
                <th>Customer</th>
                <th>Products</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (order of orderService.state().orders; track order.orderId) {
                <tr>
                  <td><strong>#{{ order.orderId }}</strong></td>
                  <td>{{ order.user?.username || 'N/A' }}</td>
                  <td>
                    <span class="badge">{{ order.productIds?.length || 0 }} items</span>
                  </td>
                  <td><strong>{{ order.totalAmount | currency }}</strong></td>
                  <td>
                    <span class="status-badge status-{{ order.status }}">
                      {{ order.status | titlecase }}
                    </span>
                  </td>
                  <td>{{ order.createdAt | date:'MMM d, y' }}</td>
                  <td>
                    <div class="action-btns">
                      <a [routerLink]="['/orders', order.orderId]" class="btn btn-xs btn-outline">View</a>
                      <button
                        class="btn btn-xs btn-danger"
                        (click)="confirmDelete(order)"
                      >Delete</button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        @if (orderService.state().pagination.total > 10) {
          <div class="pagination">
            <button
              class="btn btn-sm btn-outline"
              [disabled]="currentPage() === 1"
              (click)="changePage(currentPage() - 1)"
            >← Prev</button>
            <span class="page-info">Page {{ currentPage() }}</span>
            <button
              class="btn btn-sm btn-outline"
              [disabled]="orderService.state().orders.length < 10"
              (click)="changePage(currentPage() + 1)"
            >Next →</button>
          </div>
        }
      }

      <!-- Delete Modal -->
      @if (deleteTarget()) {
        <div class="modal-overlay" (click)="deleteTarget.set(null)">
          <div class="modal" (click)="$event.stopPropagation()">
            <h3>Delete Order</h3>
            <p>Delete order <strong>#{{ deleteTarget()!.orderId }}</strong>? This cannot be undone.</p>
            <div class="modal-actions">
              <button class="btn btn-outline" (click)="deleteTarget.set(null)">Cancel</button>
              <button class="btn btn-danger" (click)="deleteOrder()">Delete</button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class OrderListComponent implements OnInit {
  orderService = inject(OrderService);

  currentPage = signal(1);
  successMsg = signal('');
  errorMsg = signal('');
  deleteTarget = signal<Order | null>(null);

  ngOnInit(): void {
    this.loadOrders();
  }

  changePage(page: number): void {
    this.currentPage.set(page);
    this.loadOrders();
  }

  confirmDelete(order: Order): void {
    this.deleteTarget.set(order);
  }

  deleteOrder(): void {
    const target = this.deleteTarget();
    if (!target) return;

    this.orderService.deleteOrder(target.orderId).subscribe({
      next: () => {
        this.successMsg.set(`Order #${target.orderId} deleted.`);
        this.deleteTarget.set(null);
        setTimeout(() => this.successMsg.set(''), 3000);
      },
      error: (err) => {
        this.errorMsg.set(err.error?.message || 'Failed to delete order.');
        this.deleteTarget.set(null);
        setTimeout(() => this.errorMsg.set(''), 3000);
      },
    });
  }

  private loadOrders(): void {
    this.orderService.getOrders({ page: this.currentPage(), limit: 10 }).subscribe();
  }
}
