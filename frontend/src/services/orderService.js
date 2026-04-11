import api from './api';

const orderService = {
  createOrder: (data) => api.post('/orders', data),
  getMyOrders: (params) => api.get('/orders/my-orders', { params }),
  getOrderById: (id) => api.get(`/orders/${id}`),
  cancelOrder: (id) => api.put(`/orders/${id}/cancel`),
  updateOrderStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),

  // Order details
  getOrderDetails: (orderId) => api.get(`/orders/${orderId}/details`),

  // Ratings
  createRating: (data) => api.post('/ratings', data),
  getMyRatings: () => api.get('/ratings/my-ratings'),
  updateRating: (id, data) => api.put(`/ratings/${id}`, data),
  deleteRating: (id) => api.delete(`/ratings/${id}`),
};

export default orderService;
