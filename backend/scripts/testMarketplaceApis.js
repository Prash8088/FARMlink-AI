/**
 * Version 2: Farmer Marketplace Module - Automated API Test Suite
 */
const http = require('http');
const path = require('path');
const app = require('../server');
const { Product } = require('../models/Product');
const User = require('../models/User');

let server;
const PORT = 5055;
const BASE_URL = `http://127.0.0.1:${PORT}`;

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const response = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  const text = await response.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch (e) {
    json = { raw: text };
  }

  return {
    status: response.status,
    headers: response.headers,
    data: json
  };
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`  ✓ ${message}`);
}

async function runMarketplaceTests() {
  console.log('\n======================================================');
  console.log(' Starting FARMlink AI Version 2 Marketplace Tests');
  console.log('======================================================\n');

  server = app.listen(PORT);
  await new Promise((resolve) => setTimeout(resolve, 600));

  try {
    // 1. Authenticate Farmer A (Ramesh)
    console.log('Test 1: Authenticate Farmer A');
    const farmerALogin = await request('/api/auth/login', {
      method: 'POST',
      body: {
        email: 'farmer.ramesh@farmlink.ai',
        password: 'Password123!'
      }
    });
    assert(farmerALogin.status === 200, 'Farmer A logged in successfully');
    const farmerAToken = farmerALogin.data.token;
    const farmerAId = farmerALogin.data.user._id;

    // 2. Authenticate Farmer B (Kavita)
    console.log('\nTest 2: Authenticate Farmer B');
    const farmerBLogin = await request('/api/auth/login', {
      method: 'POST',
      body: {
        email: 'farmer.kavita@farmlink.ai',
        password: 'Password123!'
      }
    });
    assert(farmerBLogin.status === 200, 'Farmer B logged in successfully');
    const farmerBToken = farmerBLogin.data.token;

    // 3. Authenticate Buyer (Ananya)
    console.log('\nTest 3: Authenticate Buyer');
    const buyerLogin = await request('/api/auth/login', {
      method: 'POST',
      body: {
        email: 'buyer.ananya@farmlink.ai',
        password: 'Password123!'
      }
    });
    assert(buyerLogin.status === 200, 'Buyer logged in');
    const buyerToken = buyerLogin.data.token;

    // 4. Authenticate Admin
    console.log('\nTest 4: Authenticate Admin');
    const adminLogin = await request('/api/auth/login', {
      method: 'POST',
      body: {
        email: 'admin@farmlink.ai',
        password: 'Admin@FarmLink2026!'
      }
    });
    assert(adminLogin.status === 200, 'Admin logged in');
    const adminToken = adminLogin.data.token;

    // 5. Test Unauthorized Access (Buyer attempting to create a product)
    console.log('\nTest 5: Buyer unauthorized product creation guard');
    const unauthorizedCreate = await request('/api/products', {
      method: 'POST',
      headers: { Authorization: `Bearer ${buyerToken}` },
      body: {
        cropName: 'Unauthorized Wheat',
        category: 'Grains & Cereals',
        description: 'Should fail authorization',
        quantity: 50,
        unit: 'quintal',
        pricePerUnit: 2200,
        qualityGrade: 'Grade A (Premium)',
        harvestDate: '2026-10-15',
        pickupLocation: 'Farm Gate',
        state: 'Punjab',
        district: 'Ludhiana',
        village: 'Samrala',
        images: ['https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b']
      }
    });
    assert(unauthorizedCreate.status === 403, 'Buyer receives 403 Forbidden on product creation');

    // 6. Test Invalid Product Data Validation
    console.log('\nTest 6: Invalid Product Data Validation (negative price, invalid unit)');
    const invalidProduct = await request('/api/products', {
      method: 'POST',
      headers: { Authorization: `Bearer ${farmerAToken}` },
      body: {
        cropName: 'A', // too short
        category: 'NonExistentCategory',
        description: 'short',
        quantity: -10, // negative
        unit: 'bushel', // invalid unit
        pricePerUnit: -500, // negative
        qualityGrade: 'Grade X',
        harvestDate: 'invalid-date',
        pickupLocation: '',
        state: '',
        district: '',
        village: '',
        images: []
      }
    });
    assert(invalidProduct.status === 422, 'Invalid product data returns 422 Unprocessable Entity');
    assert(invalidProduct.data.errors, 'Errors object returned with validation details');

    // 7. Create Valid Product Listing by Farmer A
    console.log('\nTest 7: Create Valid Product Listing (Farmer A)');
    const createRes = await request('/api/products', {
      method: 'POST',
      headers: { Authorization: `Bearer ${farmerAToken}` },
      body: {
        cropName: 'Sharbati Premium Golden Wheat',
        category: 'Grains & Cereals',
        description: 'Organically cultivated Sharbati durum wheat. Sun-dried, cleaned, moisture content below 10%. High protein content suitable for premium bakery flour.',
        quantity: 120,
        unit: 'quintal',
        pricePerUnit: 2850,
        qualityGrade: 'Grade A (Premium)',
        harvestDate: '2026-10-20',
        pickupLocation: 'Gate 2, Patel Organic Agro Warehouse, Kadi Highway',
        state: 'Gujarat',
        district: 'Mehsana',
        village: 'Kadi',
        images: [
          'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=800'
        ]
      }
    });
    assert(createRes.status === 201, 'Product created successfully with 201 Created');
    assert(createRes.data.data.cropName === 'Sharbati Premium Golden Wheat', 'Crop name matches');
    assert(createRes.data.data.farmerId._id === farmerAId, 'Product is associated with Farmer A');
    const productId = createRes.data.data._id;

    // 8. Farmer A Retrieves Own Products (GET /api/products/my-products)
    console.log('\nTest 8: Farmer A retrieves own product listings');
    const myListings = await request('/api/products/my-products', {
      headers: { Authorization: `Bearer ${farmerAToken}` }
    });
    assert(myListings.status === 200, 'GET /api/products/my-products returns 200 OK');
    assert(myListings.data.data.products.length >= 1, 'Contains at least 1 product');
    assert(myListings.data.data.summary.totalListings >= 1, 'Summary counts are tracked');

    // 9. View Product Details (GET /api/products/:id)
    console.log('\nTest 9: Get Single Product Details');
    const getRes = await request(`/api/products/${productId}`);
    assert(getRes.status === 200, 'Product details returned with 200 OK');
    assert(getRes.data.data.farmerId.fullName === 'Ramesh Patel', 'Farmer info populated');
    assert(getRes.data.data.viewsCount >= 1, 'Views counter incremented');

    // 10. Update Product Details (Farmer A edits own listing)
    console.log('\nTest 10: Farmer A edits own product listing');
    const updateRes = await request(`/api/products/${productId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${farmerAToken}` },
      body: {
        pricePerUnit: 2900,
        description: 'Organically cultivated Sharbati durum wheat. Harvest dried, moisture verified.'
      }
    });
    assert(updateRes.status === 200, 'Product updated with 200 OK');
    assert(updateRes.data.data.pricePerUnit === 2900, 'Price updated to 2900');

    // 11. Cross-Farmer Security Guard (Farmer B attempts to modify Farmer A's product)
    console.log('\nTest 11: Cross-Farmer modification security guard');
    const crossFarmerEdit = await request(`/api/products/${productId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${farmerBToken}` },
      body: { pricePerUnit: 1000 }
    });
    assert(crossFarmerEdit.status === 403, 'Farmer B editing Farmer A product returns 403 Forbidden');

    // 12. Update Stock (PATCH /api/products/:id/stock)
    console.log('\nTest 12: Update Available Stock');
    const stockRes = await request(`/api/products/${productId}/stock`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${farmerAToken}` },
      body: { quantity: 95 }
    });
    assert(stockRes.status === 200, 'Stock update returns 200 OK');
    assert(stockRes.data.data.quantity === 95, 'Stock quantity updated to 95');

    // 13. Update Status (PATCH /api/products/:id/status)
    console.log('\nTest 13: Toggle Product Availability Status');
    const statusRes = await request(`/api/products/${productId}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${farmerAToken}` },
      body: { status: 'unavailable' }
    });
    assert(statusRes.status === 200, 'Status update returns 200 OK');
    assert(statusRes.data.data.status === 'unavailable', 'Status updated to unavailable');

    // Toggle back to available
    const statusBack = await request(`/api/products/${productId}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${farmerAToken}` },
      body: { status: 'available' }
    });
    assert(statusBack.data.data.status === 'available', 'Status restored to available');

    // 14. Admin Marketplace Management (GET /api/admin/products)
    console.log('\nTest 14: Admin views all marketplace listings');
    const adminProductsRes = await request('/api/admin/products', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(adminProductsRes.status === 200, 'Admin product directory returns 200 OK');
    assert(adminProductsRes.data.data.products.length >= 1, 'Admin sees all products');

    // 15. Admin deactivates inappropriate listing
    console.log('\nTest 15: Admin deactivates inappropriate listing');
    const adminDeactivate = await request(`/api/admin/products/${productId}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { status: 'deactivated_by_admin' }
    });
    assert(adminDeactivate.status === 200, 'Admin status change returns 200 OK');
    assert(adminDeactivate.data.data.status === 'deactivated_by_admin', 'Status marked deactivated_by_admin');

    // Restore to available
    await request(`/api/admin/products/${productId}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { status: 'available' }
    });

    // 16. Cross-Farmer Delete Guard (Farmer B attempts to delete Farmer A's product)
    console.log('\nTest 16: Cross-Farmer delete security guard');
    const crossFarmerDelete = await request(`/api/products/${productId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${farmerBToken}` }
    });
    assert(crossFarmerDelete.status === 403, 'Farmer B deleting Farmer A product returns 403 Forbidden');

    // 17. Farmer A Deletes Product (DELETE /api/products/:id)
    console.log('\nTest 17: Farmer A deletes own product listing');
    const deleteRes = await request(`/api/products/${productId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${farmerAToken}` }
    });
    assert(deleteRes.status === 200, 'Delete returns 200 OK');

    // Confirm product is deleted
    const verifyDeleted = await request(`/api/products/${productId}`);
    assert(verifyDeleted.status === 404, 'Deleted product returns 404 Not Found');

    console.log('\n======================================================');
    console.log(' ALL 17 VERSION 2 MARKETPLACE TESTS PASSED! ');
    console.log('======================================================\n');
  } catch (error) {
    console.error('\n❌ Marketplace Test failure:', error.message);
    process.exit(1);
  } finally {
    if (server) {
      server.close();
    }
    process.exit(0);
  }
}

runMarketplaceTests();
