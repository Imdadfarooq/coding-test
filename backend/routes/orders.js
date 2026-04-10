const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const {
  createOrder, getOrderById, getMyOrders, updateOrder, deleteOrder,
} = require('../controllers/orderController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/errorHandler');

const orderCreateRules = [
  body('productIds').isArray({ min: 1 }).withMessage('productIds must be a non-empty array'),
  body('productIds.*').isInt({ min: 1 }).withMessage('Each productId must be a positive integer'),
  body('shippingAddress').optional().trim(),
  body('notes').optional().trim(),
];

const orderUpdateRules = [
  body('status')
    .optional()
    .isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
    .withMessage('Invalid status'),
  body('totalAmount').optional().isFloat({ min: 0 }),
  body('shippingAddress').optional().trim(),
  body('notes').optional().trim(),
];

router.get('/', authenticate, getMyOrders);
router.get('/:id', authenticate, getOrderById);
router.post('/', authenticate, orderCreateRules, validate, createOrder);
router.put('/:id', authenticate, orderUpdateRules, validate, updateOrder);
router.delete('/:id', authenticate, deleteOrder);

module.exports = router;
