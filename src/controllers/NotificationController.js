const { Notification, User } = require('../models');

// Tạo thông báo
const createNotification = async (userId, type, title, message, data = {}) => {
  try {
    const notification = await Notification.create({
      userId,
      type, // 'ORDER_CREATED', 'ORDER_CONFIRMED', 'PAYMENT_SUCCESS', 'DELIVERY_STARTED', etc.
      title,
      message,
      data: JSON.stringify(data),
      isRead: false,
    });
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error.message);
  }
};

// Lấy thông báo của user
const getNotifications = async (req, res) => {
  try {
    const { isRead, limit = 20, offset = 0 } = req.query;

    let whereClause = { userId: req.user.id };
    if (isRead !== undefined) {
      whereClause.isRead = isRead === 'true';
    }

    const notifications = await Notification.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    const total = await Notification.count({ where: whereClause });

    res.status(200).json({
      message: '✅ Lấy danh sách thông báo thành công',
      total,
      notifications,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Đánh dấu đã đọc
const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findByPk(notificationId);
    if (!notification) {
      return res.status(404).json({ error: 'Thông báo không tồn tại' });
    }

    if (notification.userId !== req.user.id) {
      return res.status(403).json({ error: 'Bạn không có quyền' });
    }

    await notification.update({ isRead: true });

    res.status(200).json({
      message: '✅ Đánh dấu đã đọc',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Đánh dấu tất cả đã đọc
const markAllAsRead = async (req, res) => {
  try {
    await Notification.update(
      { isRead: true },
      { where: { userId: req.user.id, isRead: false } }
    );

    res.status(200).json({
      message: '✅ Đánh dấu tất cả thông báo đã đọc',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Xóa thông báo
const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findByPk(notificationId);
    if (!notification) {
      return res.status(404).json({ error: 'Thông báo không tồn tại' });
    }

    if (notification.userId !== req.user.id) {
      return res.status(403).json({ error: 'Bạn không có quyền' });
    }

    await notification.destroy();

    res.status(200).json({
      message: '✅ Xóa thông báo thành công',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Lấy số lượng thông báo chưa đọc
const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.count({
      where: { userId: req.user.id, isRead: false },
    });

    res.status(200).json({
      message: '✅ Lấy số lượng thông báo chưa đọc',
      unreadCount: count,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createNotification,
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
};