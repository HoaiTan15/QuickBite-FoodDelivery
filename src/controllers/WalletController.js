const { Wallet, WalletTransaction, User } = require('../models');

// Tạo ví điện tử
const createWallet = async (req, res) => {
  try {
    // Kiểm tra đã có ví chưa
    let wallet = await Wallet.findOne({ where: { userId: req.user.id } });
    if (wallet) {
      return res.status(400).json({ error: 'Bạn đã có ví rồi' });
    }

    wallet = await Wallet.create({
      userId: req.user.id,
      balance: 0,
      status: 'ACTIVE',
    });

    res.status(201).json({
      message: '✅ Tạo ví điện tử thành công',
      wallet: {
        id: wallet.id,
        balance: wallet.balance,
        status: wallet.status,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Lấy thông tin ví
const getWallet = async (req, res) => {
  try {
    const wallet = await Wallet.findOne({
      where: { userId: req.user.id },
    });

    if (!wallet) {
      return res.status(404).json({ error: 'Bạn chưa có ví điện tử' });
    }

    res.status(200).json({
      message: '✅ Lấy thông tin ví thành công',
      wallet: {
        id: wallet.id,
        balance: wallet.balance,
        status: wallet.status,
        createdAt: wallet.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Nạp tiền vào ví (QR Code hoặc Bank Transfer)
const topUpWallet = async (req, res) => {
  try {
    const { amount, paymentMethod, bankCode, description } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Số tiền phải lớn hơn 0' });
    }

    let wallet = await Wallet.findOne({ where: { userId: req.user.id } });
    if (!wallet) {
      return res.status(404).json({ error: 'Bạn chưa có ví điện tử' });
    }

    // Tạo ghi nhận nạp tiền
    const transaction = await WalletTransaction.create({
      walletId: wallet.id,
      type: 'TOP_UP',
      amount,
      paymentMethod,
      bankCode,
      status: 'PENDING',
      description: description || `Nạp tiền ví - ${paymentMethod}`,
      transactionId: `TOPUP_${Date.now()}_${req.user.id}`,
    });

    // Nếu thanh toán bằng ví sẵn, cộng tiền luôn
    if (paymentMethod === 'WALLET_BALANCE') {
      wallet.balance += amount;
      await wallet.save();

      await transaction.update({ status: 'SUCCESS' });

      return res.status(200).json({
        message: '✅ Nạp tiền thành công',
        wallet: {
          id: wallet.id,
          balance: wallet.balance,
        },
      });
    }

    // Nếu thanh toán QR hoặc Bank Transfer, chờ xác nhận
    res.status(201).json({
      message: '✅ Tạo yêu cầu nạp tiền. Vui lòng thanh toán',
      transaction: {
        id: transaction.id,
        transactionId: transaction.transactionId,
        amount,
        status: 'PENDING',
        paymentMethod,
        bankCode,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Xác nhận nạp tiền
const confirmTopUp = async (req, res) => {
  try {
    const { transactionId } = req.params;

    const transaction = await WalletTransaction.findOne({
      where: { transactionId },
      include: [
        {
          model: Wallet,
          as: 'wallet',
        },
      ],
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Giao dịch không tồn tại' });
    }

    // Kiểm tra quyền
    if (transaction.wallet.userId !== req.user.id) {
      return res.status(403).json({ error: 'Bạn không có quyền xác nhận giao dịch này' });
    }

    if (transaction.status === 'SUCCESS') {
      return res.status(400).json({ error: 'Giao dịch đã được xác nhận' });
    }

    // Cộng tiền vào ví
    transaction.wallet.balance += transaction.amount;
    await transaction.wallet.save();

    await transaction.update({ status: 'SUCCESS', confirmedAt: new Date() });

    res.status(200).json({
      message: '✅ Xác nhận nạp tiền thành công',
      wallet: {
        id: transaction.wallet.id,
        balance: transaction.wallet.balance,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Lấy lịch sử giao dịch ví
const getWalletTransactions = async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ where: { userId: req.user.id } });
    if (!wallet) {
      return res.status(404).json({ error: 'Bạn chưa có ví điện tử' });
    }

    const transactions = await WalletTransaction.findAll({
      where: { walletId: wallet.id },
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({
      message: '✅ Lấy lịch sử giao dịch thành công',
      total: transactions.length,
      transactions,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createWallet,
  getWallet,
  topUpWallet,
  confirmTopUp,
  getWalletTransactions,
};