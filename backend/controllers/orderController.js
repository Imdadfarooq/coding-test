const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const { Op } = require('sequelize');

// POST /api/orders
const createOrder = async (req, res, next) => {
  try {
    const { productIds, shippingAddress, notes } = req.body;
    const userId = req.user.id;

    // Fetch products to calculate total
    const products = await Product.findAll({
      where: { id: { [Op.in]: productIds }, isActive: true },
    });

    if (products.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid products found.' });
    }

    const totalAmount = products.reduce((sum, p) => sum + parseFloat(p.price), 0);

    const order = await Order.create({
      userId,
      productIds,
      totalAmount: totalAmount.toFixed(2),
      shippingAddress,
      notes,
    });

    const created = await Order.findByPk(order.orderId, {
      include: [{ model: User, as: 'user', attributes: ['id', 'username', 'email'] }],
    });

    res.status(201).json({ success: true, message: 'Order created', data: created });
  } catch (error) {
    next(error);
  }
};

// GET /api/orders/:id
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'username', 'email'] }],
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // Only owner or admin can view
    if (order.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden.' });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// GET /api/orders
const getMyOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const where = req.user.role === 'admin' ? {} : { userId: req.user.id };

    const { count, rows } = await Order.findAndCountAll({
      where,
      include: [{ model: User, as: 'user', attributes: ['id', 'username', 'email'] }],
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']],
    });

    res.json({
      success: true,
      data: {
        orders: rows,
        pagination: { total: count, page: parseInt(page), limit: parseInt(limit) },
      },
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/orders/:id
const updateOrder = async (req, res, next) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (order.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden.' });
    }

    if (order.status === 'delivered' || order.status === 'cancelled') {
      return res.status(400).json({ success: false, message: `Cannot update a ${order.status} order.` });
    }

    const { productIds, totalAmount, status, shippingAddress, notes } = req.body;
    await order.update({ productIds, totalAmount, status, shippingAddress, notes });

    res.json({ success: true, message: 'Order updated', data: order });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/orders/:id
const deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (order.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden.' });
    }

    await order.destroy();
    res.json({ success: true, message: 'Order deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { createOrder, getOrderById, getMyOrders, updateOrder, deleteOrder };
