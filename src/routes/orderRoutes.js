const express = require('express');
const orderController = require('../controllers/OrderController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// ============ CUSTOMER ROUTES ============

// Tạo đơn hàng mới
router.post(
  '/',
  authMiddleware.protect,
  authMiddleware.authorize('customer'),
  orderController.createOrder
);

// Lấy đơn hàng của customer
router.get(
  '/my-orders',
  authMiddleware.protect,
  authMiddleware.authorize('customer'),
  orderController.getMyOrders
);

// Hủy đơn hàng
router.put(
  '/:id/cancel',
  authMiddleware.protect,
  authMiddleware.authorize('customer'),
  orderController.cancelOrder
);

// ============ RESTAURANT ROUTES ============

// Lấy đơn hàng của nhà hàng
router.get(
  '/restaurant/orders',
  authMiddleware.protect,
  authMiddleware.authorize('restaurant'),
  orderController.getRestaurantOrders
);

// Cập nhật trạng thái đơn hàng
router.put(
  '/:id/status',
  authMiddleware.protect,
  authMiddleware.authorize('restaurant', 'driver'),
  orderController.updateOrderStatus
);

// Gán tài xế
router.put(
  '/:id/assign-driver',
  authMiddleware.protect,
  authMiddleware.authorize('restaurant'),
  orderController.assignDriver
);

// ============ DRIVER ROUTES ============

// Lấy đơn hàng của tài xế
router.get(
  '/driver/orders',
  authMiddleware.protect,
  authMiddleware.authorize('driver'),
  orderController.getDriverOrders
);

// ============ PUBLIC ROUTES ============

// Lấy chi tiết đơn hàng
router.get(
  '/:id',
  authMiddleware.protect,
  orderController.getOrderById
);

module.exports = router;