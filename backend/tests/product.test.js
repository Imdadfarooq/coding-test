const request = require('supertest');
const app = require('../server');
const { Op } = require('sequelize');

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

jest.mock('../models/Order', () => ({
  belongsTo: jest.fn(),
  findAll: jest.fn(),
  findByPk: jest.fn(),
  findAndCountAll: jest.fn(),
  create: jest.fn(),
}));

jest.mock('../models/Product', () => ({
  findAndCountAll: jest.fn(),
  findByPk: jest.fn(),
  create: jest.fn(),
}));

const Product = require('../models/Product');

const mockProduct = {
  id: 1,
  name: 'Test Product',
  price: 29.99,
  description: 'A test product',
  stock: 10,
  category: 'Electronics',
  isActive: true,
  update: jest.fn().mockResolvedValue(true),
  toJSON: () => ({
    id: 1, name: 'Test Product', price: 29.99, description: 'A test product',
    stock: 10, category: 'Electronics', isActive: true,
  }),
};

// Helper to get auth token
const getToken = () => {
  const jwt = require('jsonwebtoken');
  return jwt.sign(
    { id: 1, username: 'admin', role: 'admin' },
    process.env.JWT_SECRET || 'fallback_secret',
    { expiresIn: '1h' }
  );
};

describe('Product Controller', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('GET /api/products', () => {
    it('should return paginated products', async () => {
      Product.findAndCountAll.mockResolvedValue({
        count: 1,
        rows: [mockProduct],
      });

      const res = await request(app).get('/api/products');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('products');
      expect(res.body.data).toHaveProperty('pagination');
      expect(Array.isArray(res.body.data.products)).toBe(true);
    });

    it('should return empty array when no products', async () => {
      Product.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });

      const res = await request(app).get('/api/products');

      expect(res.status).toBe(200);
      expect(res.body.data.products).toHaveLength(0);
      expect(res.body.data.pagination.total).toBe(0);
    });
  });

  describe('GET /api/products/:id', () => {
    it('should return a product by ID', async () => {
      Product.findByPk.mockResolvedValue(mockProduct);

      const res = await request(app).get('/api/products/1');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 for non-existent product', async () => {
      Product.findByPk.mockResolvedValue(null);

      const res = await request(app).get('/api/products/9999');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should return 404 for soft-deleted product', async () => {
      Product.findByPk.mockResolvedValue({ ...mockProduct, isActive: false });

      const res = await request(app).get('/api/products/1');

      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/products', () => {
    it('should create a product with valid data', async () => {
      Product.create.mockResolvedValue(mockProduct);
      const token = getToken();

      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'New Product', price: 49.99, description: 'Desc', stock: 5 });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should fail without authentication', async () => {
      const res = await request(app)
        .post('/api/products')
        .send({ name: 'New Product', price: 49.99 });

      expect(res.status).toBe(401);
    });

    it('should fail with missing name', async () => {
      const token = getToken();
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${token}`)
        .send({ price: 49.99 });

      expect(res.status).toBe(422);
    });

    it('should fail with negative price', async () => {
      const token = getToken();
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Bad Product', price: -10 });

      expect(res.status).toBe(422);
    });
  });

  describe('PUT /api/products/:id', () => {
    it('should update a product', async () => {
      Product.findByPk.mockResolvedValue(mockProduct);
      const token = getToken();

      const res = await request(app)
        .put('/api/products/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Updated', price: 39.99, description: 'Updated desc' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 for non-existent product', async () => {
      Product.findByPk.mockResolvedValue(null);
      const token = getToken();

      const res = await request(app)
        .put('/api/products/999')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Updated', price: 39.99, description: 'x' });

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/products/:id', () => {
    it('should soft-delete a product', async () => {
      Product.findByPk.mockResolvedValue(mockProduct);
      const token = getToken();

      const res = await request(app)
        .delete('/api/products/1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 when product not found', async () => {
      Product.findByPk.mockResolvedValue(null);
      const token = getToken();

      const res = await request(app)
        .delete('/api/products/999')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });
  });
});
