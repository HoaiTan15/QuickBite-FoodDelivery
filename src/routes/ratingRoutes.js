const express = require('express');
const ratingController = require('../controllers/RatingController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Tạo rating cho tài xế
router.post(
  '/',
  authMiddleware.protect,
  authMiddleware.authorize('customer'),
  ratingController.createRating
);

// Lấy ratings của customer
router.get(
  '/my-ratings',
  authMiddleware.protect,
  authMiddleware.authorize('customer'),
  ratingController.getMyRatings
);

// Cập nhật rating
router.put(
  '/:id',
  authMiddleware.protect,
  authMiddleware.authorize('customer'),
  ratingController.updateRating
);

// Xóa rating
router.delete(
  '/:id',
  authMiddleware.protect,
  authMiddleware.authorize('customer'),
  ratingController.deleteRating
);

// Lấy ratings của tài xế
router.get(
  '/driver/:driverId',
  ratingController.getDriverRatings
);

// Lấy thống kê ratings của tài xế
router.get(
  '/driver/:driverId/stats',
  ratingController.getDriverRatingStats
);

module.exports = router;
