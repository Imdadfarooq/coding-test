import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './product-list.component.html',
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
