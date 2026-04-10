import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormArray } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../shared/models';

@Component({
  selector: 'app-order-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './order-form.component.html',
})
export class OrderFormComponent implements OnInit {
  orderService = inject(OrderService);
  productService = inject(ProductService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  submitting = signal(false);
  successMsg = signal('');
  errorMsg = signal('');
  selectedProducts = signal<Product[]>([]);

  form = this.fb.group({
    shippingAddress: [''],
    notes: [''],
  });

  ngOnInit(): void {
    this.productService.getProducts({ limit: 50 }).subscribe();
  }

  orderTotal(): number {
    return this.selectedProducts().reduce((sum, p) => sum + Number(p.price), 0);
  }

  isSelected(id: number): boolean {
    return this.selectedProducts().some((p) => p.id === id);
  }

  toggleProduct(product: Product): void {
    if (this.isSelected(product.id)) {
      this.selectedProducts.update((list) => list.filter((p) => p.id !== product.id));
    } else {
      this.selectedProducts.update((list) => [...list, product]);
    }
  }

  onSubmit(): void {
    if (this.selectedProducts().length === 0) return;
    this.submitting.set(true);
    this.errorMsg.set('');

    const payload = {
      productIds: this.selectedProducts().map((p) => p.id),
      shippingAddress: this.form.value.shippingAddress || '',
      notes: this.form.value.notes || '',
    };

    this.orderService.createOrder(payload).subscribe({
      next: (res) => {
        this.submitting.set(false);
        this.successMsg.set('Order placed successfully!');
        setTimeout(() => this.router.navigate(['/orders', res.data.orderId]), 1200);
      },
      error: (err) => {
        this.submitting.set(false);
        this.errorMsg.set(err.error?.message || 'Failed to place order.');
      },
    });
  }
}
