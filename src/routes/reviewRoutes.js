const express = require('express');
const reviewController = require('../controllers/ReviewController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Tạo review
router.post(
  '/',
  authMiddleware.protect,
  authMiddleware.authorize('customer'),
  reviewController.createReview
);

// Lấy reviews của customer
router.get(
  '/my-reviews',
  authMiddleware.protect,
  authMiddleware.authorize('customer'),
  reviewController.getMyReviews
);

// Cập nhật review
router.put(
  '/:id',
  authMiddleware.protect,
  authMiddleware.authorize('customer'),
  reviewController.updateReview
);

// Xóa review
router.delete(
  '/:id',
  authMiddleware.protect,
  authMiddleware.authorize('customer'),
  reviewController.deleteReview
);

// Đánh giá hữu ích
router.put(
  '/:id/helpful',
  authMiddleware.protect,
  reviewController.markReviewHelpful
);

// Lấy reviews của nhà hàng
router.get(
  '/restaurant/:restaurantId',
  reviewController.getRestaurantReviews
);

// Lấy thống kê reviews của nhà hàng
router.get(
  '/restaurant/:restaurantId/stats',
  reviewController.getRestaurantReviewStats
);

module.exports = router;