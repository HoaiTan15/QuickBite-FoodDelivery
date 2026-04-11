const { sequelize } = require('../config/database');
const { Rating, User, Order } = require('../models');
const { Op } = require('sequelize');

// Tạo rating cho tài xế
const createRating = async (req, res) => {
  try {
    const { driverId, orderId, rating, comment } = req.body;

    // Validate input
    if (!driverId || !orderId || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Vui lòng nhập rating từ 1-5' });
    }

    // Kiểm tra đơn hàng
    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Đơn hàng không tồn tại' });
    }

    // Kiểm tra đơn hàng đã giao chưa
    if (order.status !== 'DELIVERED') {
      return res.status(400).json({ error: 'Chỉ có thể rating đơn hàng đã giao' });
    }

    // Kiểm tra customer
    if (order.customerId !== req.user.id) {
      return res.status(403).json({ error: 'Bạn không có quyền rating đơn hàng này' });
    }

    // Kiểm tra đã rating chưa
    const existingRating = await Rating.findOne({
      where: { orderId, customerId: req.user.id },
    });
    if (existingRating) {
      return res.status(400).json({ error: 'Bạn đã rating tài xế này rồi' });
    }

    // Tạo rating
    const newRating = await Rating.create({
      driverId,
      orderId,
      customerId: req.user.id,
      rating,
      comment,
      ratingDate: new Date(),
    });

    // Cập nhật average rating của tài xế
    await updateDriverRating(driverId);

    res.status(201).json({
      message: '✅ Tạo rating thành công',
      rating: {
        id: newRating.id,
        rating: newRating.rating,
        comment: newRating.comment,
        ratingDate: newRating.ratingDate,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Hàm cập nhật rating trung bình của tài xế
const updateDriverRating = async (driverId) => {
  try {
    const ratings = await Rating.findAll({
      where: { driverId },
      attributes: ['rating'],
    });

    if (ratings.length === 0) {
      await User.update({ driverRating: 5.0 }, { where: { id: driverId } });
      return;
    }

    const averageRating =
      ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;

    await User.update(
      { driverRating: parseFloat(averageRating.toFixed(1)) },
      { where: { id: driverId } }
    );
  } catch (error) {
    console.error('Error updating driver rating:', error.message);
  }
};

// Lấy ratings của tài xế
const getDriverRatings = async (req, res) => {
  try {
    const { driverId } = req.params;
    const { sortBy = 'ratingDate', order = 'DESC', limit = 10, offset = 0 } = req.query;

    // Validate sortBy
    const validSortBy = ['rating', 'ratingDate'];
    if (!validSortBy.includes(sortBy)) {
      return res.status(400).json({ error: 'Sort by không hợp lệ' });
    }

    // Kiểm tra driver có tồn tại không
    const driver = await User.findByPk(driverId);
    if (!driver || driver.role !== 'driver') {
      return res.status(404).json({ error: 'Tài xế không tồn tại' });
    }

    const ratings = await Rating.findAll({
      where: { driverId },
      include: [
        {
          model: User,
          as: 'customer',
          attributes: ['name', 'email'],
        },
      ],
      order: [[sortBy, order.toUpperCase()]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    const totalRatings = await Rating.count({
      where: { driverId },
    });

    res.status(200).json({
      message: '✅ Lấy danh sách rating thành công',
      total: totalRatings,
      averageRating: driver.driverRating,
      ratings,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Lấy ratings của customer
const getMyRatings = async (req, res) => {
  try {
    const ratings = await Rating.findAll({
      where: { customerId: req.user.id },
      include: [
        {
          model: User,
          as: 'driver',
          attributes: ['name', 'phone', 'driverRating'],
        },
      ],
      order: [['ratingDate', 'DESC']],
    });

    res.status(200).json({
      message: '✅ Lấy danh sách rating của bạn thành công',
      total: ratings.length,
      ratings,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Cập nhật rating
const updateRating = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ error: 'Rating phải từ 1-5' });
    }

    const existingRating = await Rating.findByPk(id);
    if (!existingRating) {
      return res.status(404).json({ error: 'Rating không tồn tại' });
    }

    // Kiểm tra quyền
    if (existingRating.customerId !== req.user.id) {
      return res.status(403).json({ error: 'Bạn không có quyền cập nhật rating này' });
    }

    const oldRating = existingRating.rating;
    await existingRating.update({
      rating: rating || existingRating.rating,
      comment: comment || existingRating.comment,
    });

    // Cập nhật rating nếu rating thay đổi
    if (oldRating !== existingRating.rating) {
      await updateDriverRating(existingRating.driverId);
    }

    res.status(200).json({
      message: '✅ Cập nhật rating thành công',
      rating: existingRating,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Xóa rating
const deleteRating = async (req, res) => {
  try {
    const { id } = req.params;

    const existingRating = await Rating.findByPk(id);
    if (!existingRating) {
      return res.status(404).json({ error: 'Rating không tồn tại' });
    }

    // Kiểm tra quyền
    if (existingRating.customerId !== req.user.id) {
      return res.status(403).json({ error: 'Bạn không có quyền xóa rating này' });
    }

    const driverId = existingRating.driverId;
    await existingRating.destroy();

    // Cập nhật rating sau khi xóa
    await updateDriverRating(driverId);

    res.status(200).json({
      message: '✅ Xóa rating thành công',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Lấy thống kê rating của tài xế
const getDriverRatingStats = async (req, res) => {
  try {
    const { driverId } = req.params;

    const driver = await User.findByPk(driverId);
    if (!driver || driver.role !== 'driver') {
      return res.status(404).json({ error: 'Tài xế không tồn tại' });
    }

    const totalRatings = await Rating.count({
      where: { driverId },
    });

    const ratingDistribution = await Rating.findAll({
      where: { driverId },
      attributes: [
        'rating',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      group: ['rating'],
      raw: true,
    });

    const stats = {
      totalRatings,
      averageRating: driver.driverRating,
      ratingDistribution,
    };

    res.status(200).json({
      message: '✅ Lấy thống kê rating thành công',
      stats,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createRating,
  getDriverRatings,
  getMyRatings,
  updateRating,
  deleteRating,
  getDriverRatingStats,
};