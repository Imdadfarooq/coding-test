import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { Order } from '../../../shared/models';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order-list.component.html',
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
