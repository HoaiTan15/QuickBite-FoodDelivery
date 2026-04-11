const { Order, OrderDetail, MenuItem, Restaurant, User } = require('../models');
const { Op } = require('sequelize');

// Tạo đơn hàng mới
const createOrder = async (req, res) => {
  try {
    const { restaurantId, items, deliveryAddress, phone, notes } = req.body;

    // Validate input
    if (!restaurantId || !items || items.length === 0 || !deliveryAddress) {
      return res.status(400).json({ error: 'Vui lòng nhập đầy đủ thông tin' });
    }

    // Kiểm tra nhà hàng có tồn tại không
    const restaurant = await Restaurant.findByPk(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ error: 'Nhà hàng không tồn tại' });
    }

    // Tính tổng giá và kiểm tra items
    let totalPrice = 0;
    for (const item of items) {
      const menuItem = await MenuItem.findByPk(item.menuItemId);
      if (!menuItem) {
        return res.status(404).json({ error: `Menu item ${item.menuItemId} không tồn tại` });
      }
      if (!menuItem.available) {
        return res.status(400).json({ error: `${menuItem.name} không còn available` });
      }
      totalPrice += menuItem.price * item.quantity;
    }

    // Tạo đơn hàng
    const order = await Order.create({
      restaurantId,
      customerId: req.user.id,
      totalPrice,
      status: 'NEW',
      deliveryAddress,
      phone,
      notes,
      orderDate: new Date(),
    });

    // Tạo OrderDetail
    for (const item of items) {
      const menuItem = await MenuItem.findByPk(item.menuItemId);
      await OrderDetail.create({
        orderId: order.id,
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        price: menuItem.price,
      });
    }

    res.status(201).json({
      message: '✅ Tạo đơn hàng thành công',
      order: {
        id: order.id,
        restaurantId: order.restaurantId,
        status: order.status,
        totalPrice: order.totalPrice,
        deliveryAddress: order.deliveryAddress,
        orderDate: order.orderDate,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Lấy tất cả đơn hàng của customer
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { customerId: req.user.id },
      include: [
        {
          model: Restaurant,
          as: 'restaurant',
          attributes: ['name', 'phone', 'address'],
        },
        {
          model: OrderDetail,
          as: 'details',
          include: [
            {
              model: MenuItem,
              as: 'menuItem',
              attributes: ['name', 'price'],
            },
          ],
        },
        {
          model: User,
          as: 'driver',
          attributes: ['name', 'phone'],
        },
      ],
      order: [['orderDate', 'DESC']],
    });

    res.status(200).json({
      message: '✅ Lấy danh sách đơn hàng thành công',
      total: orders.length,
      orders,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Lấy chi tiết đơn hàng
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findByPk(id, {
      include: [
        {
          model: Restaurant,
          as: 'restaurant',
          attributes: ['name', 'phone', 'address'],
        },
        {
          model: User,
          as: 'customer',
          attributes: ['name', 'email', 'phone'],
        },
        {
          model: OrderDetail,
          as: 'details',
          include: [
            {
              model: MenuItem,
              as: 'menuItem',
              attributes: ['name', 'price', 'category'],
            },
          ],
        },
        {
          model: User,
          as: 'driver',
          attributes: ['name', 'phone'],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({ error: 'Đơn hàng không tồn tại' });
    }

    // Kiểm tra quyền xem
    if (order.customerId !== req.user.id && order.restaurantId !== req.restaurant?.id && order.driverId !== req.user.id) {
      return res.status(403).json({ error: 'Bạn không có quyền xem đơn hàng này' });
    }

    res.status(200).json({
      message: '✅ Lấy thông tin đơn hàng thành công',
      order,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Lấy đơn hàng cho nhà hàng
const getRestaurantOrders = async (req, res) => {
  try {
    const { status } = req.query;
    let whereClause = {};

    // Kiểm tra user có phải restaurant không
    const restaurant = await Restaurant.findOne({ where: { ownerId: req.user.id } });
    if (!restaurant) {
      return res.status(403).json({ error: 'Bạn không phải chủ nhà hàng' });
    }

    whereClause.restaurantId = restaurant.id;

    if (status) {
      whereClause.status = status;
    }

    const orders = await Order.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'customer',
          attributes: ['name', 'phone', 'email'],
        },
        {
          model: OrderDetail,
          as: 'details',
          include: [
            {
              model: MenuItem,
              as: 'menuItem',
              attributes: ['name', 'price'],
            },
          ],
        },
        {
          model: User,
          as: 'driver',
          attributes: ['name', 'phone'],
        },
      ],
      order: [['orderDate', 'DESC']],
    });

    res.status(200).json({
      message: '✅ Lấy danh sách đơn hàng thành công',
      total: orders.length,
      orders,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Cập nhật trạng thái đơn hàng
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Status flow: NEW → CONFIRMED → PREPARING → READY → DELIVERING → DELIVERED → CANCELLED
    const validStatuses = ['NEW', 'CONFIRMED', 'PREPARING', 'READY', 'DELIVERING', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Trạng thái không hợp lệ' });
    }

    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({ error: 'Đơn hàng không tồn tại' });
    }

    // Kiểm tra quyền
    const restaurant = await Restaurant.findOne({ where: { ownerId: req.user.id } });
    if (order.restaurantId !== restaurant?.id && order.driverId !== req.user.id) {
      return res.status(403).json({ error: 'Bạn không có quyền cập nhật đơn hàng này' });
    }

    await order.update({ status });

    res.status(200).json({
      message: '✅ Cập nhật trạng thái thành công',
      order: {
        id: order.id,
        status: order.status,
        updatedAt: order.updatedAt,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Gán tài xế
const assignDriver = async (req, res) => {
  try {
    const { id } = req.params;
    const { driverId } = req.body;

    if (!driverId) {
      return res.status(400).json({ error: 'Vui lòng nhập ID tài xế' });
    }

    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({ error: 'Đơn hàng không tồn tại' });
    }

    // Kiểm tra quyền (chỉ nhà hàng có thể gán tài xế)
    const restaurant = await Restaurant.findOne({ where: { ownerId: req.user.id } });
    if (order.restaurantId !== restaurant?.id) {
      return res.status(403).json({ error: 'Bạn không có quyền gán tài xế' });
    }

    // Kiểm tra tài xế có tồn tại không
    const driver = await User.findByPk(driverId);
    if (!driver || driver.role !== 'driver') {
      return res.status(404).json({ error: 'Tài xế không tồn tại hoặc không phải là driver' });
    }

    await order.update({ driverId, status: 'CONFIRMED' });

    res.status(200).json({
      message: '✅ Gán tài xế thành công',
      order: {
        id: order.id,
        driverId: order.driverId,
        status: order.status,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Lấy đơn hàng cho tài xế
const getDriverOrders = async (req, res) => {
  try {
    const { status } = req.query;
    let whereClause = { driverId: req.user.id };

    if (status) {
      whereClause.status = status;
    }

    const orders = await Order.findAll({
      where: whereClause,
      include: [
        {
          model: Restaurant,
          as: 'restaurant',
          attributes: ['name', 'phone', 'address'],
        },
        {
          model: User,
          as: 'customer',
          attributes: ['name', 'phone', 'email'],
        },
        {
          model: OrderDetail,
          as: 'details',
          include: [
            {
              model: MenuItem,
              as: 'menuItem',
              attributes: ['name', 'price'],
            },
          ],
        },
      ],
      order: [['orderDate', 'DESC']],
    });

    res.status(200).json({
      message: '✅ Lấy danh sách đơn hàng thành công',
      total: orders.length,
      orders,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Hủy đơn hàng
const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({ error: 'Đơn hàng không tồn tại' });
    }

    // Chỉ có thể hủy nếu chưa được giao
    if (['DELIVERING', 'DELIVERED', 'CANCELLED'].includes(order.status)) {
      return res.status(400).json({ error: `Không thể hủy đơn hàng ở trạng thái ${order.status}` });
    }

    // Kiểm tra quyền
    if (order.customerId !== req.user.id) {
      return res.status(403).json({ error: 'Bạn không có quyền hủy đơn hàng này' });
    }

    await order.update({ status: 'CANCELLED', cancelReason: reason });

    res.status(200).json({
      message: '✅ H��y đơn hàng thành công',
      order: {
        id: order.id,
        status: order.status,
        cancelReason: order.cancelReason,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getRestaurantOrders,
  updateOrderStatus,
  assignDriver,
  getDriverOrders,
  cancelOrder,
};