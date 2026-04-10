const User = require('./User');
const Restaurant = require('./Restaurant');
const MenuItem = require('./MenuItem');
const Order = require('./Order');
const OrderDetail = require('./OrderDetail');
const sequelize = require('../config/database');

// ==================== ASSOCIATIONS ====================
User.hasMany(Restaurant, { foreignKey: 'ownerId', as: 'restaurants' });
Restaurant.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });

Restaurant.hasMany(MenuItem, { foreignKey: 'restaurantId', as: 'menuItems' });
MenuItem.belongsTo(Restaurant, { foreignKey: 'restaurantId', as: 'restaurant' });

User.hasMany(Order, { foreignKey: 'customerId', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'customerId', as: 'customer' });

Restaurant.hasMany(Order, { foreignKey: 'restaurantId', as: 'orders' });
Order.belongsTo(Restaurant, { foreignKey: 'restaurantId', as: 'restaurant' });

User.hasMany(Order, { foreignKey: 'driverId', as: 'deliveries' });
Order.belongsTo(User, { foreignKey: 'driverId', as: 'driver' });

Order.hasMany(OrderDetail, { foreignKey: 'orderId', as: 'details' });
OrderDetail.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

MenuItem.hasMany(OrderDetail, { foreignKey: 'menuItemId', as: 'orderDetails' });
OrderDetail.belongsTo(MenuItem, { foreignKey: 'menuItemId', as: 'menuItem' });

module.exports = {
  sequelize,
  User,
  Restaurant,
  MenuItem,
  Order,
  OrderDetail,
};