const { OrderDetail, MenuItem, Order } = require('../models');

// Lấy chi tiết các item trong đơn hàng
const getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Đơn hàng không tồn tại' });
    }

    const details = await OrderDetail.findAll({
      where: { orderId },
      include: [
        {
          model: MenuItem,
          as: 'menuItem',
          attributes: ['name', 'price', 'category', 'description'],
        },
      ],
    });

    res.status(200).json({
      message: '✅ Lấy chi tiết đơn hàng thành công',
      total: details.length,
      details,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getOrderDetails,
};