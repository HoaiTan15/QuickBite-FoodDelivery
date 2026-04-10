const { Restaurant, User } = require('../models');
const { Op } = require('sequelize');

// Tạo nhà hàng mới
const createRestaurant = async (req, res) => {
  try {
    const { name, address, cuisineType, openTime, closeTime, phone } = req.body;

    // Validate input
    if (!name || !address || !cuisineType) {
      return res.status(400).json({ error: 'Vui lòng nhập đầy đủ thông tin' });
    }

    // Kiểm tra người dùng có phải restaurant role không
    const user = await User.findByPk(req.user.id);
    if (user.role !== 'restaurant') {
      return res.status(403).json({ error: 'Chỉ chủ nhà hàng mới có thể tạo nhà hàng' });
    }

    // Kiểm tra nhà hàng của user đã tồn tại chưa
    const existingRestaurant = await Restaurant.findOne({ where: { ownerId: req.user.id } });
    if (existingRestaurant) {
      return res.status(400).json({ error: 'Bạn đã có một nhà hàng rồi' });
    }

    // Tạo nhà hàng
    const restaurant = await Restaurant.create({
      name,
      address,
      cuisineType,
      openTime,
      closeTime,
      phone,
      ownerId: req.user.id,
      rating: 5.0,
    });

    res.status(201).json({
      message: ' Tạo nhà hàng thành công',
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
        address: restaurant.address,
        cuisineType: restaurant.cuisineType,
        openTime: restaurant.openTime,
        closeTime: restaurant.closeTime,
        phone: restaurant.phone,
        rating: restaurant.rating,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Lấy tất cả nhà hàng
const getAllRestaurants = async (req, res) => {
  try {
    const { cuisineType, search } = req.query;

    let whereClause = {};

    // Tìm kiếm theo tên
    if (search) {
      whereClause.name = { [Op.like]: `%${search}%` };
    }

    // Lọc theo loại ẩm thực
    if (cuisineType) {
      whereClause.cuisineType = cuisineType;
    }

    const restaurants = await Restaurant.findAll({
      where: whereClause,
      attributes: ['id', 'name', 'address', 'cuisineType', 'openTime', 'closeTime', 'phone', 'rating'],
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['name', 'phone'],
        },
      ],
      order: [['rating', 'DESC']],
    });

    res.status(200).json({
      message: '✅ Lấy danh sách nhà hàng thành công',
      total: restaurants.length,
      restaurants,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Lấy chi tiết nhà hàng
const getRestaurantById = async (req, res) => {
  try {
    const { id } = req.params;

    const restaurant = await Restaurant.findByPk(id, {
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['name', 'email', 'phone'],
        },
      ],
    });

    if (!restaurant) {
      return res.status(404).json({ error: 'Nhà hàng không tồn tại' });
    }

    res.status(200).json({
      message: '✅ Lấy thông tin nhà hàng thành công',
      restaurant,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Cập nhật nhà hàng
const updateRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address, cuisineType, openTime, closeTime, phone } = req.body;

    const restaurant = await Restaurant.findByPk(id);
    if (!restaurant) {
      return res.status(404).json({ error: 'Nhà hàng không tồn tại' });
    }

    // Kiểm tra quyền sở hữu
    if (restaurant.ownerId !== req.user.id) {
      return res.status(403).json({ error: 'Bạn không có quyền cập nhật nhà hàng này' });
    }

    await restaurant.update({
      name: name || restaurant.name,
      address: address || restaurant.address,
      cuisineType: cuisineType || restaurant.cuisineType,
      openTime: openTime || restaurant.openTime,
      closeTime: closeTime || restaurant.closeTime,
      phone: phone || restaurant.phone,
    });

    res.status(200).json({
      message: 'Cập nhật nhà hàng thành công',
      restaurant,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Xóa nhà hàng
const deleteRestaurant = async (req, res) => {
  try {
    const { id } = req.params;

    const restaurant = await Restaurant.findByPk(id);
    if (!restaurant) {
      return res.status(404).json({ error: 'Nhà hàng không tồn tại' });
    }

    // Kiểm tra quyền sở hữu
    if (restaurant.ownerId !== req.user.id) {
      return res.status(403).json({ error: 'Bạn không có quyền xóa nhà hàng này' });
    }

    await restaurant.destroy();

    res.status(200).json({
      message: ' Xóa nhà hàng thành công',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Lấy nhà hàng của user hiện tại
const getMyRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({
      where: { ownerId: req.user.id },
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['name', 'email', 'phone'],
        },
      ],
    });

    if (!restaurant) {
      return res.status(404).json({ error: 'Bạn chưa có nhà hàng' });
    }

    res.status(200).json({
      message: ' Lấy thông tin nhà hàng của bạn thành công',
      restaurant,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createRestaurant,
  getAllRestaurants,
  getRestaurantById,
  updateRestaurant,
  deleteRestaurant,
  getMyRestaurant,
};