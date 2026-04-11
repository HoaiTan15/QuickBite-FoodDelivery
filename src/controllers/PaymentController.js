const { Payment, Order, User, Wallet } = require('../models');
const { Op } = require('sequelize');

// Tạo yêu cầu thanh toán (QR Code hoặc Wallet)
const createPayment = async (req, res) => {
  try {
    const { orderId, paymentMethod, bankCode } = req.body;
    // paymentMethod: 'QR_CODE', 'WALLET', 'BANK_TRANSFER'
    // bankCode: 'VIETCOMBANK', 'TECHCOMBANK', 'AGRIBANK', etc.

    if (!orderId || !paymentMethod) {
      return res.status(400).json({ error: 'Vui lòng nhập orderId và payment method' });
    }

    // Kiểm tra đơn hàng
    const order = await Order.findByPk(orderId, {
      include: [
        {
          model: User,
          as: 'customer',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({ error: 'Đơn hàng không tồn tại' });
    }

    // Kiểm tra quyền
    if (order.customerId !== req.user.id) {
      return res.status(403).json({ error: 'Bạn không có quyền thanh toán đơn hàng này' });
    }

    // Kiểm tra đơn hàng chưa thanh toán
    const existingPayment = await Payment.findOne({
      where: { orderId, status: 'PAID' },
    });
    if (existingPayment) {
      return res.status(400).json({ error: 'Đơn hàng này đã thanh toán rồi' });
    }

    let payment;

    if (paymentMethod === 'WALLET') {
      // Thanh toán bằng ví điện tử
      payment = await createWalletPayment(orderId, order, req.user.id);
    } else if (paymentMethod === 'QR_CODE') {
      // Tạo mã QR thanh toán
      payment = await createQRCodePayment(orderId, order, bankCode);
    } else if (paymentMethod === 'BANK_TRANSFER') {
      // Chuyển khoản ngân hàng
      payment = await createBankTransferPayment(orderId, order, bankCode);
    } else {
      return res.status(400).json({ error: 'Phương thức thanh toán không hợp lệ' });
    }

    res.status(201).json({
      message: '✅ Tạo yêu cầu thanh toán thành công',
      payment,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Thanh toán bằng ví điện tử
const createWalletPayment = async (orderId, order, userId) => {
  try {
    // Kiểm tra ví
    let wallet = await Wallet.findOne({ where: { userId } });
    if (!wallet) {
      return {
        error: 'Bạn chưa có ví điện tử. Vui lòng tạo ví trước',
        status: 'WALLET_NOT_FOUND',
      };
    }

    // Kiểm tra số dư
    if (wallet.balance < order.totalPrice) {
      return {
        error: `Số dư không đủ. Bạn cần ${order.totalPrice - wallet.balance} VNĐ nữa`,
        currentBalance: wallet.balance,
        requiredAmount: order.totalPrice,
        status: 'INSUFFICIENT_BALANCE',
      };
    }

    // Trừ tiền từ ví
    wallet.balance -= order.totalPrice;
    await wallet.save();

    // Tạo ghi nhận thanh toán
    const payment = await Payment.create({
      orderId,
      customerId: userId,
      amount: order.totalPrice,
      paymentMethod: 'WALLET',
      status: 'PAID',
      transactionId: `WALLET_${Date.now()}_${orderId}`,
      paidAt: new Date(),
      description: `Thanh toán đơn hàng #${orderId} bằng ví điện tử`,
    });

    // Cập nhật trạng thái đơn hàng
    await Order.update({ paymentStatus: 'PAID' }, { where: { id: orderId } });

    return {
      id: payment.id,
      status: 'PAID',
      method: 'WALLET',
      amount: payment.amount,
      transactionId: payment.transactionId,
      message: '✅ Thanh toán ví thành công',
      remainingBalance: wallet.balance,
    };
  } catch (error) {
    throw new Error(`Lỗi thanh toán ví: ${error.message}`);
  }
};

// Tạo mã QR thanh toán
const createQRCodePayment = async (orderId, order, bankCode) => {
  try {
    // Thông tin ngân hàng mẫu
    const bankAccounts = {
      VIETCOMBANK: {
        bankName: 'Ngân hàng TMCP Ngoại thư��ng Việt Nam',
        accountNumber: '0011001234567',
        accountName: 'QuickBite Food Delivery',
        swiftCode: 'BFTVVNVX',
      },
      TECHCOMBANK: {
        bankName: 'Ngân hàng TMCP Kỹ Thương Việt Nam',
        accountNumber: '1234567890123',
        accountName: 'QuickBite Food Delivery',
        swiftCode: 'VTCBVNVX',
      },
      AGRIBANK: {
        bankName: 'Ngân hàng TMCP Nông nghiệp và Phát triển Nông thôn',
        accountNumber: '9876543210987',
        accountName: 'QuickBite Food Delivery',
        swiftCode: 'AGBAVNVX',
      },
    };

    const bankInfo = bankAccounts[bankCode] || bankAccounts.VIETCOMBANK;

    // Tạo QR Code Data (theo chuẩn Napas/VNPAY)
    const qrData = {
      bankCode,
      bankName: bankInfo.bankName,
      accountNumber: bankInfo.accountNumber,
      accountName: bankInfo.accountName,
      amount: order.totalPrice,
      description: `QRBill_${orderId}`,
      orderId,
      customerId: order.customerId,
      content: `ThanhtoanDH${orderId}`, // Nội dung chuyển khoản
    };

    // Tạo QR String (có thể dùng library như 'qrcode')
    // Ở đây ta tạo URL để frontend generate QR
    const qrString = generateQRString(qrData);

    // Lưu payment record
    const payment = await Payment.create({
      orderId,
      customerId: order.customerId,
      amount: order.totalPrice,
      paymentMethod: 'QR_CODE',
      bankCode,
      status: 'PENDING',
      transactionId: `QR_${Date.now()}_${orderId}`,
      qrData: JSON.stringify(qrData),
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // Hết hạn sau 15 phút
      description: `Thanh toán QR Code đơn hàng #${orderId}`,
    });

    return {
      id: payment.id,
      status: 'PENDING',
      method: 'QR_CODE',
      amount: payment.amount,
      transactionId: payment.transactionId,
      bankInfo,
      qrString, // Frontend dùng để tạo QR Code image
      qrData,
      expiresAt: payment.expiresAt,
      message: '✅ Tạo mã QR thành công. Quét mã để thanh toán',
    };
  } catch (error) {
    throw new Error(`Lỗi tạo QR Code: ${error.message}`);
  }
};

// Tạo thanh toán chuyển khoản ngân hàng
const createBankTransferPayment = async (orderId, order, bankCode) => {
  try {
    const bankAccounts = {
      VIETCOMBANK: {
        bankName: 'Ngân hàng TMCP Ngoại thương Việt Nam',
        accountNumber: '0011001234567',
        accountName: 'QuickBite Food Delivery',
        swiftCode: 'BFTVVNVX',
      },
      TECHCOMBANK: {
        bankName: 'Ngân hàng TMCP Kỹ Thương Việt Nam',
        accountNumber: '1234567890123',
        accountName: 'QuickBite Food Delivery',
        swiftCode: 'VTCBVNVX',
      },
    };

    const bankInfo = bankAccounts[bankCode] || bankAccounts.VIETCOMBANK;

    const payment = await Payment.create({
      orderId,
      customerId: order.customerId,
      amount: order.totalPrice,
      paymentMethod: 'BANK_TRANSFER',
      bankCode,
      status: 'PENDING',
      transactionId: `BANK_${Date.now()}_${orderId}`,
      bankInfo: JSON.stringify(bankInfo),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Hết hạn sau 24 giờ
      description: `Chuyển khoản ngân hàng đơn hàng #${orderId}`,
    });

    return {
      id: payment.id,
      status: 'PENDING',
      method: 'BANK_TRANSFER',
      amount: payment.amount,
      transactionId: payment.transactionId,
      bankInfo,
      expiresAt: payment.expiresAt,
      transferContent: `ThanhtoanDH${orderId}`, // Nội dung chuyển khoản
      message: '✅ Chuyển tiền theo thông tin dưới đây',
    };
  } catch (error) {
    throw new Error(`Lỗi thanh toán chuyển khoản: ${error.message}`);
  }
};

// Hàm tạo QR String
const generateQRString = (qrData) => {
  // Chuẩn VietQR hoặc có thể dùng thư viện qrcode
  return `https://api.vietqr.io/generate?accountNo=${qrData.accountNumber}&bankCode=${qrData.bankCode}&amount=${qrData.amount}&description=${qrData.content}`;
};

// Xác nhận thanh toán (sau khi customer chuyển tiền)
const confirmPayment = async (req, res) => {
  try {
    const { paymentId, transactionHash } = req.body;

    const payment = await Payment.findByPk(paymentId);
    if (!payment) {
      return res.status(404).json({ error: 'Thanh toán không tồn tại' });
    }

    // Kiểm tra quyền
    if (payment.customerId !== req.user.id) {
      return res.status(403).json({ error: 'Bạn không có quyền xác nhận thanh toán này' });
    }

    // Kiểm tra hết hạn
    if (payment.expiresAt && new Date() > new Date(payment.expiresAt)) {
      return res.status(400).json({ error: 'Yêu cầu thanh toán đã hết hạn' });
    }

    // Cập nhật trạng thái
    await payment.update({
      status: 'PAID',
      paidAt: new Date(),
      transactionHash,
    });

    // Cập nhật đơn hàng
    await Order.update(
      { paymentStatus: 'PAID' },
      { where: { id: payment.orderId } }
    );

    res.status(200).json({
      message: '✅ Xác nhận thanh toán thành công',
      payment: {
        id: payment.id,
        status: 'PAID',
        paidAt: payment.paidAt,
        amount: payment.amount,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Lấy lịch sử thanh toán
const getPaymentHistory = async (req, res) => {
  try {
    const payments = await Payment.findAll({
      where: { customerId: req.user.id },
      include: [
        {
          model: Order,
          as: 'order',
          attributes: ['id', 'totalPrice', 'status'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({
      message: '✅ Lấy lịch sử thanh toán thành công',
      total: payments.length,
      payments,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Hủy thanh toán
const cancelPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await Payment.findByPk(paymentId);
    if (!payment) {
      return res.status(404).json({ error: 'Thanh toán không tồn tại' });
    }

    // Kiểm tra quyền
    if (payment.customerId !== req.user.id) {
      return res.status(403).json({ error: 'Bạn không có quyền hủy thanh toán này' });
    }

    // Chỉ hủy được nếu chưa thanh toán
    if (payment.status === 'PAID') {
      return res.status(400).json({ error: 'Không thể hủy thanh toán đã hoàn tất' });
    }

    await payment.update({ status: 'CANCELLED' });

    res.status(200).json({
      message: '✅ Hủy thanh toán thành công',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Lấy chi tiết thanh toán
const getPaymentDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await Payment.findByPk(id, {
      include: [
        {
          model: Order,
          as: 'order',
          attributes: ['id', 'totalPrice', 'status', 'deliveryAddress'],
        },
      ],
    });

    if (!payment) {
      return res.status(404).json({ error: 'Thanh toán không tồn tại' });
    }

    // Kiểm tra quyền
    if (payment.customerId !== req.user.id) {
      return res.status(403).json({ error: 'Bạn không có quyền xem thanh toán này' });
    }

    res.status(200).json({
      message: '✅ Lấy chi tiết thanh toán thành công',
      payment,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createPayment,
  confirmPayment,
  getPaymentHistory,
  cancelPayment,
  getPaymentDetails,
};