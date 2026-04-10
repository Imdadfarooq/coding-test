import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { OrderService } from './order.service';
import { Order } from '../../shared/models';

describe('OrderService', () => {
  let service: OrderService;
  let httpMock: HttpTestingController;

  const mockOrder: Order = {
    orderId: 1,
    userId: 1,
    productIds: [1, 2],
    totalAmount: 79.98,
    status: 'pending',
    shippingAddress: '123 Main St',
    notes: '',
    createdAt: new Date().toISOString(),
  };

  const mockPaginatedResponse = {
    success: true,
    data: {
      orders: [mockOrder],
      pagination: { total: 1, page: 1, limit: 10 },
    },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [OrderService],
    });
    service = TestBed.inject(OrderService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with empty state', () => {
    expect(service.state().orders).toEqual([]);
    expect(service.state().loading).toBeFalse();
    expect(service.state().error).toBeNull();
  });

  describe('getOrders()', () => {
    it('should fetch orders and update state', () => {
      service.getOrders().subscribe(() => {
        expect(service.state().orders.length).toBe(1);
        expect(service.state().orders[0].orderId).toBe(1);
      });

      const req = httpMock.expectOne((r) => r.url === '/api/orders');
      expect(req.request.method).toBe('GET');
      req.flush(mockPaginatedResponse);
    });

    it('should handle errors', () => {
      service.getOrders().subscribe({ error: () => {} });

      httpMock.expectOne((r) => r.url === '/api/orders').flush(
        { message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' }
      );

      expect(service.state().error).toBeTruthy();
    });
  });

  describe('getOrder()', () => {
    it('should fetch a single order', () => {
      service.getOrder(1).subscribe((res) => {
        expect(res.data.orderId).toBe(1);
      });

      const req = httpMock.expectOne('/api/orders/1');
      expect(req.request.method).toBe('GET');
      req.flush({ success: true, data: mockOrder });
      expect(service.state().selectedOrder?.orderId).toBe(1);
    });
  });

  describe('createOrder()', () => {
    it('should POST order and add to state', () => {
      service.createOrder({ productIds: [1, 2], shippingAddress: '123 Main' }).subscribe();

      const req = httpMock.expectOne('/api/orders');
      expect(req.request.method).toBe('POST');
      expect(req.request.body.productIds).toEqual([1, 2]);
      req.flush({ success: true, data: mockOrder });

      expect(service.state().orders.length).toBe(1);
    });
  });

  describe('updateOrder()', () => {
    it('should PUT and update order status in state', () => {
      service['_state'].update((s) => ({ ...s, orders: [mockOrder] }));

      service.updateOrder(1, { status: 'processing' }).subscribe();

      const req = httpMock.expectOne('/api/orders/1');
      expect(req.request.method).toBe('PUT');
      req.flush({ success: true, data: { ...mockOrder, status: 'processing' } });

      expect(service.state().orders[0].status).toBe('processing');
    });
  });

  describe('deleteOrder()', () => {
    it('should DELETE and remove order from state', () => {
      service['_state'].update((s) => ({ ...s, orders: [mockOrder], pagination: { total: 1, page: 1, limit: 10 } }));

      service.deleteOrder(1).subscribe();

      const req = httpMock.expectOne('/api/orders/1');
      expect(req.request.method).toBe('DELETE');
      req.flush({ success: true, message: 'Deleted' });

      expect(service.state().orders.length).toBe(0);
      expect(service.state().pagination.total).toBe(0);
    });
  });
});
