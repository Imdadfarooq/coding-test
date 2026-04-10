import { Component, inject, OnInit, signal, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './product-form.component.html',
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
