const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { sequelize, User, Restaurant, MenuItem, Order, OrderDetail } = require('./models');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

sequelize.sync({ alter: false })
  .then(() => {
    console.log('✅ All models synced with database');
  })
  .catch((err) => {
    console.error('❌ Error syncing database:', err);
  });

app.get('/', (req, res) => {
  res.json({ 
    message: '🍔 Welcome to QuickBite API',
    status: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found', path: req.originalUrl });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    timestamp: new Date().toISOString(),
  });
});

module.exports = app;