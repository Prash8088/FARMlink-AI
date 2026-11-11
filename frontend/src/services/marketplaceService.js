import api from './api';

export const marketplaceService = {
  // Get active, available products with search, filter, sort, and pagination
  async getProducts(params = {}) {
    const response = await api.get('/marketplace/products', { params });
    return response.data;
  },

  // Get single product details by ID for marketplace
  async getProductById(id) {
    const response = await api.get(`/marketplace/products/${id}`);
    return response.data;
  },

  // Get available filter values (categories, states, districts, price range)
  async getFilters() {
    const response = await api.get('/marketplace/filters');
    return response.data;
  }
};
