const express = require('express');
const paymentController = require('../controllers/PaymentController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Tạo yêu cầu thanh toán
router.post(
  '/',
  authMiddleware.protect,
  authMiddleware.authorize('customer'),
  paymentController.createPayment
);

// Xác nhận thanh toán
router.put(
  '/:paymentId/confirm',
  authMiddleware.protect,
  authMiddleware.authorize('customer'),
  paymentController.confirmPayment
);

// Lấy lịch sử thanh toán
router.get(
  '/history',
  authMiddleware.protect,
  authMiddleware.authorize('customer'),
  paymentController.getPaymentHistory
);

// Hủy thanh toán
router.put(
  '/:paymentId/cancel',
  authMiddleware.protect,
  authMiddleware.authorize('customer'),
  paymentController.cancelPayment
);

// Lấy chi tiết thanh toán
router.get(
  '/:id',
  authMiddleware.protect,
  paymentController.getPaymentDetails
);

module.exports = router;