const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const {
  getAllProducts, getProductById, createProduct, updateProduct, deleteProduct,
} = require('../controllers/productController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/errorHandler');

const productRules = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 200 }),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('description').optional().trim(),
  body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be non-negative integer'),
  body('category').optional().trim(),
];

router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.post('/', authenticate, productRules, validate, createProduct);
router.put('/:id', authenticate, productRules, validate, updateProduct);
router.delete('/:id', authenticate, deleteProduct);

module.exports = router;
