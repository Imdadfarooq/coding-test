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
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1 class="page-title">New Order</h1>
          <p class="page-subtitle">Select products and place your order</p>
        </div>
        <a routerLink="/orders" class="btn btn-outline">← Back to Orders</a>
      </div>

      @if (successMsg()) {
        <div class="alert alert-success">{{ successMsg() }}</div>
      }
      @if (errorMsg()) {
        <div class="alert alert-error">{{ errorMsg() }}</div>
      }

      <div class="order-layout">
        <!-- Product Selection -->
        <div class="form-card">
          <h2 class="section-title">Select Products</h2>

          @if (productService.state().loading) {
            <div class="loading-overlay"><span class="spinner"></span> Loading products...</div>
          } @else {
            <div class="product-select-grid">
              @for (product of productService.state().products; track product.id) {
                <div
                  class="product-select-card"
                  [class.selected]="isSelected(product.id)"
                  (click)="toggleProduct(product)"
                >
                  <div class="product-select-check">{{ isSelected(product.id) ? '✅' : '⬜' }}</div>
                  <div class="product-select-info">
                    <strong>{{ product.name }}</strong>
                    <span class="product-select-price">{{ product.price | currency }}</span>
                    <span class="product-select-stock">Stock: {{ product.stock }}</span>
                  </div>
                </div>
              }
            </div>
          }
        </div>

        <!-- Order Summary & Form -->
        <div class="order-sidebar">
          <div class="form-card">
            <h2 class="section-title">Order Summary</h2>

            @if (selectedProducts().length === 0) {
              <p class="empty-selection">Select products from the left to add them to your order.</p>
            } @else {
              <div class="order-items">
                @for (p of selectedProducts(); track p.id) {
                  <div class="order-item">
                    <span>{{ p.name }}</span>
                    <strong>{{ p.price | currency }}</strong>
                  </div>
                }
              </div>
              <div class="order-total">
                <span>Total</span>
                <strong>{{ orderTotal() | currency }}</strong>
              </div>
            }

            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="order-form">
              <div class="form-group">
                <label for="shippingAddress">Shipping Address</label>
                <textarea
                  id="shippingAddress"
                  formControlName="shippingAddress"
                  rows="3"
                  placeholder="Enter delivery address..."
                ></textarea>
              </div>

              <div class="form-group">
                <label for="notes">Order Notes</label>
                <textarea
                  id="notes"
                  formControlName="notes"
                  rows="2"
                  placeholder="Special instructions..."
                ></textarea>
              </div>

              <button
                type="submit"
                class="btn btn-primary btn-full"
                [disabled]="selectedProducts().length === 0 || submitting()"
              >
                @if (submitting()) { <span class="spinner"></span> Placing Order... }
                @else { 🛍 Place Order ({{ selectedProducts().length }} items) }
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
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
