const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Restaurant = sequelize.define('Restaurant', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  ownerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING(20),
  },
  cuisineType: {
    type: DataTypes.STRING(100),
  },
  rating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 5.0,
  },
  openTime: {
    type: DataTypes.TIME,
  },
  closeTime: {
    type: DataTypes.TIME,
  },
}, {
  tableName: 'Restaurants',
  timestamps: true,
  underscored: true,
});

module.exports = Restaurant;