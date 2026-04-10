const { MenuItem, Restaurant } = require('../models');
const { Op } = require('sequelize');

// Tạo menu item mới
const createMenuItem = async (req, res) => {
  try {
    const { restaurantId, name, price, description, category } = req.body;

    // Validate input
    if (!restaurantId || !name || !price || !category) {
      return res.status(400).json({ error: 'Vui lòng nhập đầy đủ thông tin' });
    }

    // Kiểm tra nhà hàng có tồn tại không
    const restaurant = await Restaurant.findByPk(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ error: 'Nhà hàng không tồn tại' });
    }

    // Kiểm tra quyền sở hữu
    if (restaurant.ownerId !== req.user.id) {
      return res.status(403).json({ error: 'Bạn không có quyền thêm menu item vào nhà hàng này' });
    }

    // Tạo menu item
    const menuItem = await MenuItem.create({
      restaurantId,
      name,
      price,
      description,
      category,
      available: true,
    });

    res.status(201).json({
      message: '✅ Tạo menu item thành công',
      menuItem,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Lấy menu items của một nhà hàng
const getMenuItemsByRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { category } = req.query;

    let whereClause = { restaurantId };

    if (category) {
      whereClause.category = category;
    }

    const menuItems = await MenuItem.findAll({
      where: whereClause,
      order: [['category', 'ASC'], ['name', 'ASC']],
    });

    res.status(200).json({
      message: '✅ Lấy danh sách menu items thành công',
      total: menuItems.length,
      menuItems,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Lấy chi tiết menu item
const getMenuItemById = async (req, res) => {
  try {
    const { id } = req.params;

    const menuItem = await MenuItem.findByPk(id);
    if (!menuItem) {
      return res.status(404).json({ error: 'Menu item không tồn tại' });
    }

    res.status(200).json({
      message: '✅ Lấy thông tin menu item thành công',
      menuItem,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Cập nhật menu item
const updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, description, category, available } = req.body;

    const menuItem = await MenuItem.findByPk(id);
    if (!menuItem) {
      return res.status(404).json({ error: 'Menu item không tồn tại' });
    }

    // Kiểm tra quyền sở hữu
    const restaurant = await Restaurant.findByPk(menuItem.restaurantId);
    if (restaurant.ownerId !== req.user.id) {
      return res.status(403).json({ error: 'Bạn không có quyền cập nhật menu item này' });
    }

    await menuItem.update({
      name: name || menuItem.name,
      price: price || menuItem.price,
      description: description || menuItem.description,
      category: category || menuItem.category,
      available: available !== undefined ? available : menuItem.available,
    });

    res.status(200).json({
      message: '✅ Cập nhật menu item thành công',
      menuItem,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Xóa menu item
const deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;

    const menuItem = await MenuItem.findByPk(id);
    if (!menuItem) {
      return res.status(404).json({ error: 'Menu item không tồn tại' });
    }

    // Kiểm tra quyền sở hữu
    const restaurant = await Restaurant.findByPk(menuItem.restaurantId);
    if (restaurant.ownerId !== req.user.id) {
      return res.status(403).json({ error: 'Bạn không có quyền xóa menu item này' });
    }

    await menuItem.destroy();

    res.status(200).json({
      message: '✅ Xóa menu item thành công',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createMenuItem,
  getMenuItemsByRestaurant,
  getMenuItemById,
  updateMenuItem,
  deleteMenuItem,
};