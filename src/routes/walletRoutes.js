const express = require('express');
const walletController = require('../controllers/WalletController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Tạo ví
router.post(
  '/',
  authMiddleware.protect,
  authMiddleware.authorize('customer'),
  walletController.createWallet
);

// Lấy thông tin ví
router.get(
  '/',
  authMiddleware.protect,
  authMiddleware.authorize('customer'),
  walletController.getWallet
);

// Nạp tiền
router.post(
  '/top-up',
  authMiddleware.protect,
  authMiddleware.authorize('customer'),
  walletController.topUpWallet
);

// Xác nhận nạp tiền
router.put(
  '/top-up/:transactionId/confirm',
  authMiddleware.protect,
  authMiddleware.authorize('customer'),
  walletController.confirmTopUp
);

// Lấy lịch sử giao dịch
router.get(
  '/transactions',
  authMiddleware.protect,
  authMiddleware.authorize('customer'),
  walletController.getWalletTransactions
);

module.exports = router;