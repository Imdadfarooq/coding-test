const request = require('supertest');
const app = require('../server');

// Mock the DB
jest.mock('../config/database', () => ({
  sequelize: { authenticate: jest.fn(), sync: jest.fn() },
  connectDB: jest.fn(),
}));

jest.mock('../models/User', () => {
  const mockUser = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    password: '$2a$12$hashedpassword',
    role: 'user',
    comparePassword: jest.fn().mockResolvedValue(true),
    toSafeObject: jest.fn().mockReturnValue({
      id: 1, username: 'testuser', email: 'test@example.com', role: 'user',
    }),
    toJSON: jest.fn().mockReturnValue({
      id: 1, username: 'testuser', email: 'test@example.com', role: 'user',
    }),
  };

  return {
    findOne: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn().mockResolvedValue({ ...mockUser }),
    __mockUser: mockUser,
  };
});

jest.mock('../models/Order', () => ({
  belongsTo: jest.fn(),
}));

const User = require('../models/User');

describe('Auth Controller', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      User.findOne.mockResolvedValue(null);

      const res = await request(app).post('/api/auth/register').send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data.user).not.toHaveProperty('password');
    });

    it('should fail with duplicate email', async () => {
      User.findOne.mockResolvedValue(User.__mockUser);

      const res = await request(app).post('/api/auth/register').send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('should fail with invalid email', async () => {
      const res = await request(app).post('/api/auth/register').send({
        username: 'testuser',
        email: 'not-an-email',
        password: 'password123',
      });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });

    it('should fail with short password', async () => {
      const res = await request(app).post('/api/auth/register').send({
        username: 'testuser',
        email: 'test@example.com',
        password: '123',
      });

      expect(res.status).toBe(422);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      User.findOne.mockResolvedValue(User.__mockUser);

      const res = await request(app).post('/api/auth/login').send({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
    });

    it('should fail with wrong password', async () => {
      const mockUserWrongPass = { ...User.__mockUser, comparePassword: jest.fn().mockResolvedValue(false) };
      User.findOne.mockResolvedValue(mockUserWrongPass);

      const res = await request(app).post('/api/auth/login').send({
        email: 'test@example.com',
        password: 'wrongpassword',
      });

      expect(res.status).toBe(401);
    });

    it('should fail with non-existent user', async () => {
      User.findOne.mockResolvedValue(null);

      const res = await request(app).post('/api/auth/login').send({
        email: 'nobody@example.com',
        password: 'password123',
      });

      expect(res.status).toBe(401);
    });
  });
});
