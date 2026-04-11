const express = require('express');
const notificationController = require('../controllers/NotificationController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Lấy thông báo
router.get(
  '/',
  authMiddleware.protect,
  notificationController.getNotifications
);

// Đánh dấu đã đọc
router.put(
  '/:notificationId/read',
  authMiddleware.protect,
  notificationController.markAsRead
);

// Đánh dấu tất cả đã đọc
router.put(
  '/read-all',
  authMiddleware.protect,
  notificationController.markAllAsRead
);

// Xóa thông báo
router.delete(
  '/:notificationId',
  authMiddleware.protect,
  notificationController.deleteNotification
);

// Lấy số lượng chưa đọc
router.get(
  '/unread/count',
  authMiddleware.protect,
  notificationController.getUnreadCount
);

module.exports = router;