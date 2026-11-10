import api from './api';

export const productService = {
  // Create product
  async createProduct(productData) {
    const response = await api.post('/products', productData);
    return response.data;
  },

  // Get logged-in farmer's products with filters & pagination
  async getMyProducts(params = {}) {
    const response = await api.get('/products/my-products', { params });
    return response.data;
  },

  // Get product by ID
  async getProductById(id) {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // Update product details
  async updateProduct(id, productData) {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },

  // Delete product
  async deleteProduct(id) {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },

  // Quick stock update
  async updateStock(id, quantity) {
    const response = await api.patch(`/products/${id}/stock`, { quantity });
    return response.data;
  },

  // Toggle or update status
  async updateStatus(id, status) {
    const response = await api.patch(`/products/${id}/status`, { status });
    return response.data;
  },

  // Upload image files (multipart/form-data)
  async uploadImages(formData) {
    const response = await api.post('/products/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }
};
