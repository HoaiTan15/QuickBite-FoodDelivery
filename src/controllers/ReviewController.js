const { sequelize } = require('../config/database');
const { Review, User, Restaurant, Order } = require('../models');
const { Op } = require('sequelize');

// Tạo review cho nhà hàng
const createReview = async (req, res) => {
  try {
    const { restaurantId, orderId, rating, comment } = req.body;

    // Validate input
    if (!restaurantId || !orderId || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Vui lòng nhập rating từ 1-5' });
    }

    // Kiểm tra đơn hàng có tồn tại không
    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Đơn hàng không tồn tại' });
    }

    // Kiểm tra đơn hàng đã hoàn thành chưa
    if (order.status !== 'DELIVERED') {
      return res.status(400).json({ error: 'Chỉ có thể review đơn hàng đã giao' });
    }

    // Kiểm tra customer có phải của đơn hàng này không
    if (order.customerId !== req.user.id) {
      return res.status(403).json({ error: 'Bạn không có quyền review đơn hàng này' });
    }

    // Kiểm tra đã review chưa
    const existingReview = await Review.findOne({
      where: { orderId, customerId: req.user.id },
    });
    if (existingReview) {
      return res.status(400).json({ error: 'Bạn đã review đơn hàng này rồi' });
    }

    // Tạo review
    const review = await Review.create({
      restaurantId,
      orderId,
      customerId: req.user.id,
      rating,
      comment,
      reviewDate: new Date(),
    });

    // Cập nhật average rating của nhà hàng
    await updateRestaurantRating(restaurantId);

    res.status(201).json({
      message: '✅ Tạo review thành công',
      review: {
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        reviewDate: review.reviewDate,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Hàm cập nhật rating trung bình của nhà hàng
const updateRestaurantRating = async (restaurantId) => {
  try {
    const reviews = await Review.findAll({
      where: { restaurantId },
      attributes: ['rating'],
    });

    if (reviews.length === 0) {
      await Restaurant.update({ rating: 5.0 }, { where: { id: restaurantId } });
      return;
    }

    const averageRating =
      reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await Restaurant.update(
      { rating: parseFloat(averageRating.toFixed(1)) },
      { where: { id: restaurantId } }
    );
  } catch (error) {
    console.error('Error updating restaurant rating:', error.message);
  }
};

// Lấy reviews của nhà hàng
const getRestaurantReviews = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { sortBy = 'reviewDate', order = 'DESC', limit = 10, offset = 0 } = req.query;

    // Validate sortBy
    const validSortBy = ['rating', 'reviewDate', 'helpful'];
    if (!validSortBy.includes(sortBy)) {
      return res.status(400).json({ error: 'Sort by không hợp lệ' });
    }

    const reviews = await Review.findAll({
      where: { restaurantId },
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

    const totalReviews = await Review.count({
      where: { restaurantId },
    });

    // Tính thống kê rating
    const ratingStats = await Review.findAll({
      where: { restaurantId },
      attributes: [
        'rating',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      group: ['rating'],
      raw: true,
    });

    res.status(200).json({
      message: '✅ Lấy danh sách review thành công',
      total: totalReviews,
      reviews,
      ratingStats,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Lấy reviews của customer
const getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.findAll({
      where: { customerId: req.user.id },
      include: [
        {
          model: Restaurant,
          as: 'restaurant',
          attributes: ['name', 'address'],
        },
      ],
      order: [['reviewDate', 'DESC']],
    });

    res.status(200).json({
      message: '✅ Lấy danh sách review của bạn thành công',
      total: reviews.length,
      reviews,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Cập nhật review
const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ error: 'Rating phải từ 1-5' });
    }

    const review = await Review.findByPk(id);
    if (!review) {
      return res.status(404).json({ error: 'Review không tồn tại' });
    }

    // Kiểm tra quyền
    if (review.customerId !== req.user.id) {
      return res.status(403).json({ error: 'Bạn không có quyền cập nhật review này' });
    }

    const oldRating = review.rating;
    await review.update({
      rating: rating || review.rating,
      comment: comment || review.comment,
    });

    // Cập nhật rating nếu rating thay đổi
    if (oldRating !== review.rating) {
      await updateRestaurantRating(review.restaurantId);
    }

    res.status(200).json({
      message: '✅ Cập nhật review thành công',
      review,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Xóa review
const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findByPk(id);
    if (!review) {
      return res.status(404).json({ error: 'Review không tồn tại' });
    }

    // Kiểm tra quyền
    if (review.customerId !== req.user.id) {
      return res.status(403).json({ error: 'Bạn không có quyền xóa review này' });
    }

    const restaurantId = review.restaurantId;
    await review.destroy();

    // Cập nhật rating sau khi xóa
    await updateRestaurantRating(restaurantId);

    res.status(200).json({
      message: '✅ Xóa review thành công',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Đánh giá hữu ích
const markReviewHelpful = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findByPk(id);
    if (!review) {
      return res.status(404).json({ error: 'Review không tồn tại' });
    }

    const newHelpfulCount = (review.helpful || 0) + 1;
    await review.update({ helpful: newHelpfulCount });

    res.status(200).json({
      message: '✅ Đánh giá hữu ích thành công',
      helpful: newHelpfulCount,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Lấy thống kê review của nhà hàng
const getRestaurantReviewStats = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    const restaurant = await Restaurant.findByPk(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ error: 'Nhà hàng không tồn tại' });
    }

    const totalReviews = await Review.count({
      where: { restaurantId },
    });

    const ratingDistribution = await Review.findAll({
      where: { restaurantId },
      attributes: [
        'rating',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      group: ['rating'],
      raw: true,
    });

    const stats = {
      totalReviews,
      averageRating: restaurant.rating,
      ratingDistribution,
    };

    res.status(200).json({
      message: '✅ Lấy thống kê review thành công',
      stats,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createReview,
  getRestaurantReviews,
  getMyReviews,
  updateReview,
  deleteReview,
  markReviewHelpful,
  getRestaurantReviewStats,
};