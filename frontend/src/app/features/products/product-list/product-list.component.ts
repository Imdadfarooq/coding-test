import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Products</h1>
          <p class="page-subtitle">Manage your product catalog</p>
        </div>
        <a routerLink="/products/new" class="btn btn-primary">➕ Add Product</a>
      </div>

      <!-- Filters -->
      <div class="filters-bar">
        <input
          type="text"
          [(ngModel)]="searchQuery"
          placeholder="Search products..."
          class="filter-input"
          (input)="onSearch()"
        />
        <select [(ngModel)]="categoryFilter" class="filter-select" (change)="onFilter()">
          <option value="">All Categories</option>
          <option value="Electronics">Electronics</option>
          <option value="Clothing">Clothing</option>
          <option value="Books">Books</option>
          <option value="Home">Home & Garden</option>
          <option value="Sports">Sports</option>
          <option value="Other">Other</option>
        </select>
        <button class="btn btn-outline btn-sm" (click)="clearFilters()">Clear</button>
      </div>

      <!-- Alert -->
      @if (successMsg()) {
        <div class="alert alert-success">{{ successMsg() }}</div>
      }
      @if (errorMsg()) {
        <div class="alert alert-error">{{ errorMsg() }}</div>
      }

      <!-- Loading -->
      @if (productService.state().loading) {
        <div class="loading-overlay"><span class="spinner lg"></span><p>Loading products...</p></div>
      } @else if (productService.state().products.length === 0) {
        <div class="empty-state">
          <div class="empty-icon">📦</div>
          <h3>No products found</h3>
          <p>Get started by adding your first product.</p>
          <a routerLink="/products/new" class="btn btn-primary">Add Product</a>
        </div>
      } @else {
        <div class="product-grid">
          @for (product of productService.state().products; track product.id) {
            <div class="product-card">
              <div class="product-card-header">
                <span class="product-category">{{ product.category || 'General' }}</span>
                <span class="product-stock" [class.low-stock]="product.stock < 5">
                  {{ product.stock }} in stock
                </span>
              </div>
              <h3 class="product-name">{{ product.name }}</h3>
              <p class="product-desc">{{ product.description || 'No description provided.' }}</p>
              <div class="product-price">{{ product.price | currency }}</div>
              <div class="product-actions">
                <a [routerLink]="['/products', product.id, 'edit']" class="btn btn-sm btn-outline">✏️ Edit</a>
                <button class="btn btn-sm btn-danger" (click)="confirmDelete(product.id, product.name)">
                  🗑 Delete
                </button>
              </div>
            </div>
          }
        </div>

        <!-- Pagination -->
        @if (productService.state().pagination.totalPages > 1) {
          <div class="pagination">
            <button
              class="btn btn-sm btn-outline"
              [disabled]="currentPage() === 1"
              (click)="changePage(currentPage() - 1)"
            >← Prev</button>
            <span class="page-info">
              Page {{ currentPage() }} of {{ productService.state().pagination.totalPages }}
            </span>
            <button
              class="btn btn-sm btn-outline"
              [disabled]="currentPage() === productService.state().pagination.totalPages"
              (click)="changePage(currentPage() + 1)"
            >Next →</button>
          </div>
        }
      }

      <!-- Delete Confirm Modal -->
      @if (deleteTarget()) {
        <div class="modal-overlay" (click)="deleteTarget.set(null)">
          <div class="modal" (click)="$event.stopPropagation()">
            <h3>Delete Product</h3>
            <p>Are you sure you want to delete <strong>{{ deleteTarget()!.name }}</strong>?</p>
            <div class="modal-actions">
              <button class="btn btn-outline" (click)="deleteTarget.set(null)">Cancel</button>
              <button class="btn btn-danger" (click)="deleteProduct()">Delete</button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class ProductListComponent implements OnInit {
  productService = inject(ProductService);

  searchQuery = '';
  categoryFilter = '';
  currentPage = signal(1);
  successMsg = signal('');
  errorMsg = signal('');
  deleteTarget = signal<{ id: number; name: string } | null>(null);

  private searchTimer: any;

  ngOnInit(): void {
    this.loadProducts();
  }

  onSearch(): void {
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => {
      this.currentPage.set(1);
      this.loadProducts();
    }, 400);
  }

  onFilter(): void {
    this.currentPage.set(1);
    this.loadProducts();
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.categoryFilter = '';
    this.currentPage.set(1);
    this.loadProducts();
  }

  changePage(page: number): void {
    this.currentPage.set(page);
    this.loadProducts();
  }

  confirmDelete(id: number, name: string): void {
    this.deleteTarget.set({ id, name });
  }

  deleteProduct(): void {
    const target = this.deleteTarget();
    if (!target) return;

    this.productService.deleteProduct(target.id).subscribe({
      next: () => {
        this.successMsg.set(`"${target.name}" deleted successfully.`);
        this.deleteTarget.set(null);
        setTimeout(() => this.successMsg.set(''), 3000);
      },
      error: (err) => {
        this.errorMsg.set(err.error?.message || 'Failed to delete product.');
        this.deleteTarget.set(null);
        setTimeout(() => this.errorMsg.set(''), 3000);
      },
    });
  }

  private loadProducts(): void {
    this.productService.getProducts({
      page: this.currentPage(),
      limit: 9,
      search: this.searchQuery || undefined,
      category: this.categoryFilter || undefined,
    }).subscribe();
  }
}
