import api from './api';

const paymentService = {
  // Payments
  createPayment: (data) => api.post('/payments', data),
  getMyPayments: () => api.get('/payments/my-payments'),
  getPaymentById: (id) => api.get(`/payments/${id}`),

  // Wallet
  getWallet: () => api.get('/wallet'),
  topUpWallet: (data) => api.post('/wallet/top-up', data),
  getWalletTransactions: () => api.get('/wallet/transactions'),
  payWithWallet: (data) => api.post('/wallet/pay', data),
};

export default paymentService;
