import { Component, inject, OnInit, signal, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../../core/services/order.service';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './order-detail.component.html',
})
export class OrderDetailComponent implements OnInit {
  @Input() id!: string;

  orderService = inject(OrderService);

  loading = signal(true);
  updating = signal(false);
  successMsg = signal('');
  errorMsg = signal('');

  statuses = [
    { value: 'pending', label: 'Pending', icon: '⏳' },
    { value: 'processing', label: 'Processing', icon: '⚙️' },
    { value: 'shipped', label: 'Shipped', icon: '🚚' },
    { value: 'delivered', label: 'Delivered', icon: '✅' },
    { value: 'cancelled', label: 'Cancelled', icon: '❌' },
  ];

  ngOnInit(): void {
    this.orderService.getOrder(Number(this.id)).subscribe({
      next: () => this.loading.set(false),
      error: () => {
        this.errorMsg.set('Order not found.');
        this.loading.set(false);
      },
    });
  }

  updateStatus(status: string): void {
    this.updating.set(true);
    this.orderService.updateOrder(Number(this.id), { status: status as any }).subscribe({
      next: () => {
        this.updating.set(false);
        this.successMsg.set(`Status updated to "${status}"`);
        setTimeout(() => this.successMsg.set(''), 3000);
      },
      error: (err) => {
        this.updating.set(false);
        this.errorMsg.set(err.error?.message || 'Failed to update status.');
        setTimeout(() => this.errorMsg.set(''), 3000);
      },
    });
  }
}
