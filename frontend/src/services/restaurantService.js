import api from './api';

const restaurantService = {
  // Restaurants
  getAllRestaurants: (params) => api.get('/restaurants', { params }),
  getRestaurantById: (id) => api.get(`/restaurants/${id}`),
  getMyRestaurant: () => api.get('/restaurants/my-restaurant'),
  createRestaurant: (data) => api.post('/restaurants', data),
  updateRestaurant: (id, data) => api.put(`/restaurants/${id}`, data),
  deleteRestaurant: (id) => api.delete(`/restaurants/${id}`),

  // Menu Items
  getMenuItems: (restaurantId) => api.get(`/restaurants/${restaurantId}/menu`),
  createMenuItem: (restaurantId, data) =>
    api.post(`/restaurants/${restaurantId}/menu`, data),
  updateMenuItem: (restaurantId, itemId, data) =>
    api.put(`/restaurants/${restaurantId}/menu/${itemId}`, data),
  deleteMenuItem: (restaurantId, itemId) =>
    api.delete(`/restaurants/${restaurantId}/menu/${itemId}`),

  // Reviews
  getRestaurantReviews: (restaurantId) =>
    api.get(`/reviews/restaurant/${restaurantId}`),
  getRestaurantReviewStats: (restaurantId) =>
    api.get(`/reviews/restaurant/${restaurantId}/stats`),
  createReview: (data) => api.post('/reviews', data),
  updateReview: (id, data) => api.put(`/reviews/${id}`, data),
  deleteReview: (id) => api.delete(`/reviews/${id}`),
};

export default restaurantService;
