const express = require('express');
const restaurantController = require('../controllers/RestaurantController');
const menuItemController = require('../controllers/MenuItemController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// ============ RESTAURANT ROUTES ============

// Công khai - lấy tất cả nhà hàng
router.get('/', restaurantController.getAllRestaurants);
router.get('/:id', restaurantController.getRestaurantById);

// Cần xác thực - Chủ nhà hàng
router.post(
  '/',
  authMiddleware.protect,
  authMiddleware.authorize('restaurant'),
  restaurantController.createRestaurant
);

router.get(
  '/owner/me',
  authMiddleware.protect,
  authMiddleware.authorize('restaurant'),
  restaurantController.getMyRestaurant
);

router.put(
  '/:id',
  authMiddleware.protect,
  authMiddleware.authorize('restaurant'),
  restaurantController.updateRestaurant
);

router.delete(
  '/:id',
  authMiddleware.protect,
  authMiddleware.authorize('restaurant'),
  restaurantController.deleteRestaurant
);

// ============ MENU ITEM ROUTES ============

// Công khai - lấy menu items
router.get('/:restaurantId/menu-items', menuItemController.getMenuItemsByRestaurant);
router.get('/menu-items/:id', menuItemController.getMenuItemById);

// Cần xác thực - Chủ nhà hàng
router.post(
  '/:restaurantId/menu-items',
  authMiddleware.protect,
  authMiddleware.authorize('restaurant'),
  menuItemController.createMenuItem
);

router.put(
  '/menu-items/:id',
  authMiddleware.protect,
  authMiddleware.authorize('restaurant'),
  menuItemController.updateMenuItem
);

router.delete(
  '/menu-items/:id',
  authMiddleware.protect,
  authMiddleware.authorize('restaurant'),
  menuItemController.deleteMenuItem
);

module.exports = router;