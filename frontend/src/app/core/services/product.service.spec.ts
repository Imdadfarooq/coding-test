import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProductService } from './product.service';
import { Product } from '../../shared/models';

describe('ProductService', () => {
  let service: ProductService;
  let httpMock: HttpTestingController;

  const mockProduct: Product = {
    id: 1,
    name: 'Test Product',
    price: 29.99,
    description: 'A great product',
    stock: 10,
    category: 'Electronics',
    isActive: true,
  };

  const mockPaginatedResponse = {
    success: true,
    data: {
      products: [mockProduct],
      pagination: { total: 1, page: 1, limit: 10, totalPages: 1 },
    },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProductService],
    });
    service = TestBed.inject(ProductService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with empty state', () => {
    expect(service.state().products).toEqual([]);
    expect(service.state().loading).toBeFalse();
    expect(service.state().error).toBeNull();
  });

  describe('getProducts()', () => {
    it('should fetch products and update state', () => {
      service.getProducts().subscribe(() => {
        expect(service.state().products.length).toBe(1);
        expect(service.state().products[0].name).toBe('Test Product');
        expect(service.state().loading).toBeFalse();
        expect(service.state().pagination.total).toBe(1);
      });

      const req = httpMock.expectOne((r) => r.url === '/api/products');
      expect(req.request.method).toBe('GET');
      req.flush(mockPaginatedResponse);
    });

    it('should pass search param to request', () => {
      service.getProducts({ search: 'laptop', page: 2, limit: 5 }).subscribe();

      const req = httpMock.expectOne((r) =>
        r.url === '/api/products' &&
        r.params.get('search') === 'laptop' &&
        r.params.get('page') === '2'
      );
      req.flush(mockPaginatedResponse);
    });

    it('should set error on failure', () => {
      service.getProducts().subscribe({ error: () => {} });

      const req = httpMock.expectOne((r) => r.url === '/api/products');
      req.flush({ message: 'Server error' }, { status: 500, statusText: 'Internal Server Error' });

      expect(service.state().error).toBeTruthy();
      expect(service.state().loading).toBeFalse();
    });
  });

  describe('getProduct()', () => {
    it('should fetch a single product', () => {
      service.getProduct(1).subscribe((res) => {
        expect(res.data.id).toBe(1);
      });

      const req = httpMock.expectOne('/api/products/1');
      expect(req.request.method).toBe('GET');
      req.flush({ success: true, data: mockProduct });
    });
  });

  describe('createProduct()', () => {
    it('should POST and add product to state', () => {
      service.createProduct({
        name: 'New Product',
        price: 49.99,
        description: 'Desc',
        stock: 5,
        category: 'Books',
      }).subscribe((res) => {
        expect(res.data.name).toBe('New Product');
      });

      const req = httpMock.expectOne('/api/products');
      expect(req.request.method).toBe('POST');
      expect(req.request.body.name).toBe('New Product');
      req.flush({ success: true, data: { ...mockProduct, id: 2, name: 'New Product' } });

      expect(service.state().products.length).toBe(1);
    });
  });

  describe('updateProduct()', () => {
    it('should PUT and update product in state', () => {
      // Seed state first
      service['_state'].update((s) => ({ ...s, products: [mockProduct] }));

      service.updateProduct(1, { name: 'Updated' }).subscribe();

      const req = httpMock.expectOne('/api/products/1');
      expect(req.request.method).toBe('PUT');
      req.flush({ success: true, data: { ...mockProduct, name: 'Updated' } });

      expect(service.state().products[0].name).toBe('Updated');
    });
  });

  describe('deleteProduct()', () => {
    it('should DELETE and remove product from state', () => {
      service['_state'].update((s) => ({ ...s, products: [mockProduct], pagination: { total: 1, page: 1, limit: 10, totalPages: 1 } }));

      service.deleteProduct(1).subscribe();

      const req = httpMock.expectOne('/api/products/1');
      expect(req.request.method).toBe('DELETE');
      req.flush({ success: true, message: 'Deleted' });

      expect(service.state().products.length).toBe(0);
      expect(service.state().pagination.total).toBe(0);
    });
  });
});
