import { Component, inject, OnInit, signal, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1 class="page-title">{{ isEdit ? 'Edit Product' : 'New Product' }}</h1>
          <p class="page-subtitle">{{ isEdit ? 'Update product details' : 'Add a new product to your catalog' }}</p>
        </div>
        <a routerLink="/products" class="btn btn-outline">← Back to Products</a>
      </div>

      @if (successMsg()) {
        <div class="alert alert-success">{{ successMsg() }}</div>
      }
      @if (errorMsg()) {
        <div class="alert alert-error">{{ errorMsg() }}</div>
      }

      @if (loading()) {
        <div class="loading-overlay"><span class="spinner lg"></span><p>Loading...</p></div>
      } @else {
        <div class="form-card">
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="form-row">
              <div class="form-group">
                <label for="name">Product Name *</label>
                <input id="name" type="text" formControlName="name" placeholder="e.g. Wireless Headphones" />
                @if (f['name'].touched && f['name'].errors?.['required']) {
                  <span class="field-error">Name is required</span>
                }
                @if (f['name'].touched && f['name'].errors?.['maxlength']) {
                  <span class="field-error">Max 200 characters</span>
                }
              </div>

              <div class="form-group">
                <label for="price">Price (USD) *</label>
                <input id="price" type="number" formControlName="price" placeholder="0.00" min="0" step="0.01" />
                @if (f['price'].touched && f['price'].errors?.['required']) {
                  <span class="field-error">Price is required</span>
                }
                @if (f['price'].touched && f['price'].errors?.['min']) {
                  <span class="field-error">Price must be positive</span>
                }
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="category">Category</label>
                <select id="category" formControlName="category">
                  <option value="">Select category...</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Clothing">Clothing</option>
                  <option value="Books">Books</option>
                  <option value="Home">Home & Garden</option>
                  <option value="Sports">Sports</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div class="form-group">
                <label for="stock">Stock Quantity</label>
                <input id="stock" type="number" formControlName="stock" placeholder="0" min="0" />
                @if (f['stock'].touched && f['stock'].errors?.['min']) {
                  <span class="field-error">Stock cannot be negative</span>
                }
              </div>
            </div>

            <div class="form-group">
              <label for="description">Description</label>
              <textarea
                id="description"
                formControlName="description"
                rows="4"
                placeholder="Describe the product..."
              ></textarea>
            </div>

            <div class="form-actions">
              <a routerLink="/products" class="btn btn-outline">Cancel</a>
              <button
                type="submit"
                class="btn btn-primary"
                [disabled]="form.invalid || submitting()"
              >
                @if (submitting()) { <span class="spinner"></span> Saving... }
                @else { {{ isEdit ? '💾 Update Product' : '✅ Create Product' }} }
              </button>
            </div>
          </form>
        </div>
      }
    </div>
  `,
})
export class ProductFormComponent implements OnInit {
  @Input() id?: string;

  productService = inject(ProductService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  isEdit = false;
  loading = signal(false);
  submitting = signal(false);
  successMsg = signal('');
  errorMsg = signal('');

  form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(200)]],
    price: [0, [Validators.required, Validators.min(0)]],
    description: [''],
    stock: [0, [Validators.min(0)]],
    category: [''],
  });

  get f() { return this.form.controls; }

  ngOnInit(): void {
    if (this.id) {
      this.isEdit = true;
      this.loading.set(true);
      this.productService.getProduct(Number(this.id)).subscribe({
        next: (res) => {
          this.form.patchValue(res.data);
          this.loading.set(false);
        },
        error: () => {
          this.errorMsg.set('Product not found.');
          this.loading.set(false);
        },
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.submitting.set(true);
    this.errorMsg.set('');

    const data = this.form.value as any;

    const request$ = this.isEdit
      ? this.productService.updateProduct(Number(this.id), data)
      : this.productService.createProduct(data);

    request$.subscribe({
      next: () => {
        this.submitting.set(false);
        this.successMsg.set(`Product ${this.isEdit ? 'updated' : 'created'} successfully!`);
        setTimeout(() => this.router.navigate(['/products']), 1200);
      },
      error: (err) => {
        this.submitting.set(false);
        this.errorMsg.set(err.error?.message || 'An error occurred.');
      },
    });
  }
}
