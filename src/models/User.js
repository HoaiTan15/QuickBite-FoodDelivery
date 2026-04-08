const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: {
      name: 'uq_users_email',
      msg: 'Email already exists'
    },
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING(20),
  },
  address: {
    type: DataTypes.TEXT,
  },
  role: {
    type: DataTypes.STRING(50),
    validate: {
      isIn: [['customer', 'restaurant', 'driver']]
    }
  },
}, {
  tableName: 'Users',
  timestamps: true,
  underscored: true,
});

module.exports = User;