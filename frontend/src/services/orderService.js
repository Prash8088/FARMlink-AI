import api from './api';

export const orderService = {
  // Create purchase request / initial offer (Buyer only)
  async createOrder(orderData) {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  // Get orders for authenticated buyer
  async getBuyerOrders(params = {}) {
    const response = await api.get('/orders/buyer', { params });
    return response.data;
  },

  // Get incoming orders for authenticated farmer
  async getFarmerOrders(params = {}) {
    const response = await api.get('/orders/farmer', { params });
    return response.data;
  },

  // Get order by ID (with full offers negotiation thread)
  async getOrderById(id) {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  // Submit counter-offer in active negotiation
  async submitCounterOffer(orderId, offerData) {
    const response = await api.post(`/orders/${orderId}/offers`, offerData);
    return response.data;
  },

  // Respond to counter-offer (action: 'accept' | 'reject')
  async respondToOffer(orderId, offerId, action, message = '') {
    const response = await api.patch(`/orders/${orderId}/offers/${offerId}/respond`, {
      action,
      message
    });
    return response.data;
  },

  // Confirm agreed order contract (Buyer only - atomic stock reservation)
  async confirmOrder(orderId) {
    const response = await api.patch(`/orders/${orderId}/confirm`);
    return response.data;
  },

  // Cancel order (Buyer, Farmer, or Admin; restores stock if confirmed)
  async cancelOrder(orderId, reason = '') {
    const response = await api.patch(`/orders/${orderId}/cancel`, { reason });
    return response.data;
  },

  // Mark order as completed after delivery
  async completeOrder(orderId) {
    const response = await api.patch(`/orders/${orderId}/complete`);
    return response.data;
  },

  // Admin get all platform orders
  async getAdminOrders(params = {}) {
    const response = await api.get('/admin/orders', { params });
    return response.data;
  }
};
