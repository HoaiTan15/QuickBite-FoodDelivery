const express = require('express');
const authController = require('../controllers/AuthController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Công khai (không cần token)
router.post('/register', authController.register);
router.post('/login', authController.login);

// Cần xác thực (cần token)
router.get('/me', authMiddleware.protect, authController.getCurrentUser);
router.put('/profile', authMiddleware.protect, authController.updateProfile);

module.exports = router;