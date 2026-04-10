const request = require('supertest');
const app = require('../server');
const jwt = require('jsonwebtoken');

jest.mock('../config/database', () => ({
  sequelize: { authenticate: jest.fn(), sync: jest.fn() },
  connectDB: jest.fn(),
}));

jest.mock('../models/User', () => ({
  findOne: jest.fn(),
  findByPk: jest.fn(),
  create: jest.fn(),
  hasMany: jest.fn(),
}));

jest.mock('../models/Product', () => ({
  findAll: jest.fn(),
  findByPk: jest.fn(),
  findAndCountAll: jest.fn(),
  create: jest.fn(),
}));

jest.mock('../models/Order', () => ({
  belongsTo: jest.fn(),
  findAll: jest.fn(),
  findByPk: jest.fn(),
  findAndCountAll: jest.fn(),
  create: jest.fn(),
}));

const Order = require('../models/Order');
const Product = require('../models/Product');

const getToken = (role = 'user', id = 1) => jwt.sign(
  { id, username: 'testuser', role },
  process.env.JWT_SECRET || 'fallback_secret',
  { expiresIn: '1h' }
);

const mockOrder = {
  orderId: 1,
  userId: 1,
  productIds: [1, 2],
  totalAmount: 79.98,
  status: 'pending',
  destroy: jest.fn().mockResolvedValue(true),
  update: jest.fn().mockResolvedValue(true),
  toJSON: () => ({
    orderId: 1, userId: 1, productIds: [1, 2], totalAmount: 79.98, status: 'pending',
  }),
};

const mockProducts = [
  { id: 1, price: 29.99, isActive: true },
  { id: 2, price: 49.99, isActive: true },
];

describe('Order Controller', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('POST /api/orders', () => {
    it('should create an order with valid products', async () => {
      Product.findAll.mockResolvedValue(mockProducts);
      Order.create.mockResolvedValue(mockOrder);
      Order.findByPk.mockResolvedValue({ ...mockOrder, user: { id: 1, username: 'testuser' } });

      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${getToken()}`)
        .send({ productIds: [1, 2], shippingAddress: '123 Main St' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should fail when no valid products found', async () => {
      Product.findAll.mockResolvedValue([]);

      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${getToken()}`)
        .send({ productIds: [999] });

      expect(res.status).toBe(400);
    });

    it('should fail without auth', async () => {
      const res = await request(app)
        .post('/api/orders')
        .send({ productIds: [1] });

      expect(res.status).toBe(401);
    });

    it('should fail with empty productIds', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${getToken()}`)
        .send({ productIds: [] });

      expect(res.status).toBe(422);
    });
  });

  describe('GET /api/orders/:id', () => {
    it('should return order for owner', async () => {
      Order.findByPk.mockResolvedValue({ ...mockOrder, user: { id: 1 } });

      const res = await request(app)
        .get('/api/orders/1')
        .set('Authorization', `Bearer ${getToken('user', 1)}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 for non-existent order', async () => {
      Order.findByPk.mockResolvedValue(null);

      const res = await request(app)
        .get('/api/orders/999')
        .set('Authorization', `Bearer ${getToken()}`);

      expect(res.status).toBe(404);
    });

    it('should return 403 for different user', async () => {
      Order.findByPk.mockResolvedValue({ ...mockOrder, userId: 99 });

      const res = await request(app)
        .get('/api/orders/1')
        .set('Authorization', `Bearer ${getToken('user', 1)}`);

      expect(res.status).toBe(403);
    });

    it('admin can view any order', async () => {
      Order.findByPk.mockResolvedValue({ ...mockOrder, userId: 99 });

      const res = await request(app)
        .get('/api/orders/1')
        .set('Authorization', `Bearer ${getToken('admin', 1)}`);

      expect(res.status).toBe(200);
    });
  });

  describe('PUT /api/orders/:id', () => {
    it('should update order status', async () => {
      Order.findByPk.mockResolvedValue({ ...mockOrder, userId: 1 });

      const res = await request(app)
        .put('/api/orders/1')
        .set('Authorization', `Bearer ${getToken('user', 1)}`)
        .send({ status: 'processing' });

      expect(res.status).toBe(200);
    });

    it('should reject invalid status', async () => {
      const res = await request(app)
        .put('/api/orders/1')
        .set('Authorization', `Bearer ${getToken()}`)
        .send({ status: 'invalid_status' });

      expect(res.status).toBe(422);
    });
  });

  describe('DELETE /api/orders/:id', () => {
    it('should delete own order', async () => {
      Order.findByPk.mockResolvedValue({ ...mockOrder, userId: 1 });

      const res = await request(app)
        .delete('/api/orders/1')
        .set('Authorization', `Bearer ${getToken('user', 1)}`);

      expect(res.status).toBe(200);
    });

    it('should return 404 for non-existent order', async () => {
      Order.findByPk.mockResolvedValue(null);

      const res = await request(app)
        .delete('/api/orders/999')
        .set('Authorization', `Bearer ${getToken()}`);

      expect(res.status).toBe(404);
    });
  });
});
