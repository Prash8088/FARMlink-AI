/**
 * FARMlink AI - Version 3 Automated Backend Test Suite
 * Tests Buyer Marketplace, Price Negotiation & Order Management
 */
const http = require('http');
const mongoose = require('mongoose');
const app = require('../server');
const { Product } = require('../models/Product');
const { Order } = require('../models/Order');
const User = require('../models/User');

const TEST_PORT = 5055;
let server;

function makeRequest({ method, path, headers = {}, body = null }) {
  return new Promise((resolve, reject) => {
    const dataString = body ? JSON.stringify(body) : null;
    const reqHeaders = { ...headers };

    if (dataString) {
      reqHeaders['Content-Type'] = 'application/json';
      reqHeaders['Content-Length'] = Buffer.byteLength(dataString);
    }

    const options = {
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path,
      method,
      headers: reqHeaders
    };

    const req = http.request(options, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => {
        responseBody += chunk;
      });
      res.on('end', () => {
        let parsed = null;
        try {
          parsed = JSON.parse(responseBody);
        } catch (e) {
          parsed = responseBody;
        }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: parsed
        });
      });
    });

    req.on('error', (err) => reject(err));

    if (dataString) {
      req.write(dataString);
    }
    req.end();
  });
}

async function loginUser(email, password) {
  const res = await makeRequest({
    method: 'POST',
    path: '/api/auth/login',
    body: { email, password }
  });
  const token = res.data?.token || res.data?.data?.token;
  const user = res.data?.user || res.data?.data?.user;
  if (res.status !== 200 || !token) {
    throw new Error(`Login failed for ${email}: ${JSON.stringify(res.data)}`);
  }
  return {
    token,
    user
  };
}

async function runTests() {
  console.log('\n======================================================');
  console.log(' Starting FARMlink AI Version 3 Marketplace & Order Tests');
  console.log('======================================================\n');

  try {
    // Start temporary test server
    await new Promise((resolve) => {
      server = app.listen(TEST_PORT, () => resolve());
    });

    // 1. Authenticate Farmer A, Farmer B, Buyer, Admin
    console.log('Test 1: Authenticate users (Farmer Ramesh, Farmer Kavita, Buyer Ananya, Admin)');
    const farmerA = await loginUser('farmer.ramesh@farmlink.ai', 'Password123!');
    const farmerB = await loginUser('farmer.kavita@farmlink.ai', 'Password123!');
    const buyer = await loginUser('buyer.ananya@farmlink.ai', 'Password123!');
    const admin = await loginUser('admin@farmlink.ai', 'Admin@FarmLink2026!');
    console.log('  ✓ Farmer A, Farmer B, Buyer, and Admin authenticated successfully\n');

    // 2. Ensure test product exists by Farmer A
    console.log('Test 2: Create a high-grade product listing for Farmer A');
    const productPayload = {
      cropName: 'Kalyansona Wheat Grade A',
      category: 'Grains & Cereals',
      description: 'Prime quality grain harvested under optimal moisture levels.',
      images: ['https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80'],
      quantity: 50,
      unit: 'quintal',
      pricePerUnit: 3200,
      qualityGrade: 'Grade A (Premium)',
      harvestDate: new Date().toISOString(),
      pickupLocation: 'Sehore Agri Hub, Gate 2',
      state: 'Madhya Pradesh',
      district: 'Sehore',
      village: 'Bilkisganj'
    };

    const createProductRes = await makeRequest({
      method: 'POST',
      path: '/api/products',
      headers: { Authorization: `Bearer ${farmerA.token}` },
      body: productPayload
    });

    if (createProductRes.status !== 201) {
      throw new Error(`Failed to create test product: ${JSON.stringify(createProductRes.data)}`);
    }
    const testProduct = createProductRes.data.product || createProductRes.data.data;
    console.log(`  ✓ Created test product ID: ${testProduct._id} with stock: 50 quintal @ Rs 3200\n`);

    // 3. Buyer discovers active marketplace listings
    console.log('Test 3: Buyer queries marketplace listings (GET /api/marketplace/products)');
    const marketRes = await makeRequest({
      method: 'GET',
      path: '/api/marketplace/products',
      headers: { Authorization: `Bearer ${buyer.token}` }
    });
    if (marketRes.status !== 200 || !marketRes.data.products) {
      throw new Error(`Marketplace list failed: ${JSON.stringify(marketRes.data)}`);
    }
    const foundProduct = marketRes.data.products.find((p) => p._id.toString() === testProduct._id.toString());
    if (!foundProduct) {
      throw new Error('Newly created product not found in active marketplace listings');
    }
    console.log(`  ✓ Marketplace returns ${marketRes.data.count} items; newly created product found\n`);

    // 4. Search & Filter marketplace products
    console.log('Test 4: Marketplace search and filter options');
    const searchRes = await makeRequest({
      method: 'GET',
      path: '/api/marketplace/products?category=Grains+%26+Cereals&district=Sehore&sortBy=price_desc',
      headers: { Authorization: `Bearer ${buyer.token}` }
    });
    if (searchRes.status !== 200) {
      throw new Error(`Filter failed: ${JSON.stringify(searchRes.data)}`);
    }
    console.log(`  ✓ Filter by category & district returned ${searchRes.data.count} matching products\n`);

    // 5. Product details view
    console.log('Test 5: Buyer views single product details (GET /api/marketplace/products/:id)');
    const detailRes = await makeRequest({
      method: 'GET',
      path: `/api/marketplace/products/${testProduct._id}`,
      headers: { Authorization: `Bearer ${buyer.token}` }
    });
    if (detailRes.status !== 200 || !detailRes.data.product.farmerId.fullName) {
      throw new Error(`Product detail view failed: ${JSON.stringify(detailRes.data)}`);
    }
    console.log(`  ✓ Product detail returned with populated farmer profile: ${detailRes.data.product.farmerId.fullName}\n`);

    // 6. Overselling guard on initial request
    console.log('Test 6: Reject purchase request exceeding available stock');
    const excessOrderRes = await makeRequest({
      method: 'POST',
      path: '/api/orders',
      headers: { Authorization: `Bearer ${buyer.token}` },
      body: {
        productId: testProduct._id,
        requestedQuantity: 999, // Stock is only 50
        initialOfferPrice: 3000,
        deliveryLocation: {
          address: 'Warehouse 4B, APMC Yard',
          district: 'Bhopal',
          state: 'Madhya Pradesh'
        }
      }
    });
    if (excessOrderRes.status !== 400) {
      throw new Error(`Expected 400 for excess quantity, got: ${excessOrderRes.status}`);
    }
    console.log(`  ✓ Excess quantity (999 vs 50) correctly rejected with 400: "${excessOrderRes.data.message}"\n`);

    // 7. Valid purchase request submission
    console.log('Test 7: Buyer submits valid purchase request (POST /api/orders)');
    const orderRes = await makeRequest({
      method: 'POST',
      path: '/api/orders',
      headers: { Authorization: `Bearer ${buyer.token}` },
      body: {
        productId: testProduct._id,
        requestedQuantity: 20,
        initialOfferPrice: 2900,
        buyerMessage: 'Looking for prompt delivery next Monday.',
        deliveryLocation: {
          address: 'Warehouse 4B, APMC Yard',
          district: 'Bhopal',
          state: 'Madhya Pradesh',
          pincode: '462001'
        }
      }
    });
    if (orderRes.status !== 201 || !orderRes.data.order) {
      throw new Error(`Order creation failed: ${JSON.stringify(orderRes.data)}`);
    }
    const orderId = orderRes.data.order._id;
    console.log(`  ✓ Order created successfully with ID: ${orderId}, orderNumber: ${orderRes.data.order.orderNumber}`);
    console.log(`  ✓ Order initial status: ${orderRes.data.order.status}, negotiation: ${orderRes.data.order.negotiationStatus}\n`);

    // 8. Prevent duplicate active order by same buyer on same product
    console.log('Test 8: Prevent duplicate active purchase request on same product');
    const duplicateRes = await makeRequest({
      method: 'POST',
      path: '/api/orders',
      headers: { Authorization: `Bearer ${buyer.token}` },
      body: {
        productId: testProduct._id,
        requestedQuantity: 10,
        initialOfferPrice: 3000,
        deliveryLocation: {
          address: 'Warehouse 4B',
          district: 'Bhopal',
          state: 'Madhya Pradesh'
        }
      }
    });
    if (duplicateRes.status !== 400) {
      throw new Error(`Expected 400 for duplicate order, got ${duplicateRes.status}`);
    }
    console.log(`  ✓ Duplicate request prevented with 400: "${duplicateRes.data.message}"\n`);

    // 9. Farmer retrieves incoming orders
    console.log('Test 9: Farmer A retrieves incoming orders (GET /api/orders/farmer)');
    const farmerOrdersRes = await makeRequest({
      method: 'GET',
      path: '/api/orders/farmer',
      headers: { Authorization: `Bearer ${farmerA.token}` }
    });
    if (farmerOrdersRes.status !== 200 || !farmerOrdersRes.data.orders) {
      throw new Error(`Farmer orders failed: ${JSON.stringify(farmerOrdersRes.data)}`);
    }
    const incomingOrder = farmerOrdersRes.data.orders.find((o) => o._id.toString() === orderId.toString());
    if (!incomingOrder) {
      throw new Error('Created order not found in Farmer A orders list');
    }
    console.log(`  ✓ Farmer A sees incoming order from ${incomingOrder.buyerId.fullName}\n`);

    // 10. Farmer submits counter-offer
    console.log('Test 10: Farmer A submits counter-offer (POST /api/orders/:id/offers)');
    const counterRes = await makeRequest({
      method: 'POST',
      path: `/api/orders/${orderId}/offers`,
      headers: { Authorization: `Bearer ${farmerA.token}` },
      body: {
        offeredPrice: 3100,
        offeredQuantity: 20,
        message: 'Rs 2900 is too low. I can offer Rs 3100 for this Grade A wheat.'
      }
    });
    if (counterRes.status !== 200 || counterRes.data.order.status !== 'NEGOTIATING') {
      throw new Error(`Counter-offer failed: ${JSON.stringify(counterRes.data)}`);
    }
    const farmerOfferId = counterRes.data.order.offers[counterRes.data.order.offers.length - 1]._id;
    console.log(`  ✓ Farmer counter-offer recorded. Order status is now: ${counterRes.data.order.status}`);
    console.log(`  ✓ Latest offer ID: ${farmerOfferId} @ Rs 3100\n`);

    // 11. Security Guard: Farmer cannot accept their own counter-offer
    console.log('Test 11: Guard - Sender cannot accept their own offer');
    const selfAcceptRes = await makeRequest({
      method: 'PATCH',
      path: `/api/orders/${orderId}/offers/${farmerOfferId}/respond`,
      headers: { Authorization: `Bearer ${farmerA.token}` },
      body: { action: 'accept' }
    });
    if (selfAcceptRes.status !== 400) {
      throw new Error(`Expected 400 for self-accept, got: ${selfAcceptRes.status}`);
    }
    console.log(`  ✓ Self-acceptance blocked with 400: "${selfAcceptRes.data.message}"\n`);

    // 12. Security Guard: Farmer B (unauthorized third-party) cannot view or counter
    console.log('Test 12: Guard - Cross-user unauthorized access protection');
    const unauthorizedRes = await makeRequest({
      method: 'GET',
      path: `/api/orders/${orderId}`,
      headers: { Authorization: `Bearer ${farmerB.token}` }
    });
    if (unauthorizedRes.status !== 403) {
      throw new Error(`Expected 403 for unauthorized order view, got: ${unauthorizedRes.status}`);
    }
    console.log('  ✓ Unauthorized user Farmer B receives 403 Forbidden\n');

    // 13. Buyer submits counter-offer back to Farmer
    console.log('Test 13: Buyer submits counter-offer to Rs 3050');
    const buyerCounterRes = await makeRequest({
      method: 'POST',
      path: `/api/orders/${orderId}/offers`,
      headers: { Authorization: `Bearer ${buyer.token}` },
      body: {
        offeredPrice: 3050,
        offeredQuantity: 20,
        message: 'Can we settle at Rs 3050? Immediate confirmation.'
      }
    });
    if (buyerCounterRes.status !== 200) {
      throw new Error(`Buyer counter-offer failed: ${JSON.stringify(buyerCounterRes.data)}`);
    }
    const buyerOfferId = buyerCounterRes.data.order.offers[buyerCounterRes.data.order.offers.length - 1]._id;
    console.log(`  ✓ Buyer counter-offer recorded @ Rs 3050 with offer ID: ${buyerOfferId}\n`);

    // 14. Farmer accepts Buyer offer
    console.log('Test 14: Farmer accepts Buyer offer (PATCH /api/orders/:id/offers/:offerId/respond)');
    const acceptRes = await makeRequest({
      method: 'PATCH',
      path: `/api/orders/${orderId}/offers/${buyerOfferId}/respond`,
      headers: { Authorization: `Bearer ${farmerA.token}` },
      body: { action: 'accept' }
    });
    if (acceptRes.status !== 200 || acceptRes.data.order.status !== 'ACCEPTED') {
      throw new Error(`Offer accept failed: ${JSON.stringify(acceptRes.data)}`);
    }
    const acceptedOrder = acceptRes.data.order;
    if (acceptedOrder.agreedPrice !== 3050 || acceptedOrder.agreedQuantity !== 20 || acceptedOrder.totalAmount !== 61000) {
      throw new Error(`Agreed amounts incorrect: ${JSON.stringify(acceptedOrder)}`);
    }
    console.log(`  ✓ Offer accepted! Status: ${acceptedOrder.status}, agreedPrice: Rs ${acceptedOrder.agreedPrice}, total: Rs ${acceptedOrder.totalAmount}\n`);

    // 15. Farmer tries to confirm order (Must be rejected: only buyer can confirm!)
    console.log('Test 15: Guard - Farmer cannot confirm order (only buyer can confirm)');
    const farmerConfirmRes = await makeRequest({
      method: 'PATCH',
      path: `/api/orders/${orderId}/confirm`,
      headers: { Authorization: `Bearer ${farmerA.token}` }
    });
    if (farmerConfirmRes.status !== 403) {
      throw new Error(`Expected 403 for farmer confirm, got: ${farmerConfirmRes.status}`);
    }
    console.log('  ✓ Farmer confirmation correctly blocked with 403 Forbidden\n');

    // 16. Buyer confirms order - ATOMIC STOCK DEDUCTION
    console.log('Test 16: Buyer explicitly confirms order (PATCH /api/orders/:id/confirm) - Atomic stock deduction');
    const confirmRes = await makeRequest({
      method: 'PATCH',
      path: `/api/orders/${orderId}/confirm`,
      headers: { Authorization: `Bearer ${buyer.token}` }
    });
    if (confirmRes.status !== 200 || confirmRes.data.order.status !== 'CONFIRMED') {
      throw new Error(`Order confirmation failed: ${JSON.stringify(confirmRes.data)}`);
    }

    // Verify product stock in database was decremented from 50 to 30 (50 - 20)
    const productAfterConfirm = await Product.findById(testProduct._id);
    if (productAfterConfirm.quantity !== 30) {
      throw new Error(`Expected product stock to be 30, got: ${productAfterConfirm.quantity}`);
    }
    console.log(`  ✓ Order confirmed! Product stock atomically decremented from 50 to ${productAfterConfirm.quantity} quintal\n`);

    // 17. Overselling Guard: Try to create and confirm an order that exceeds remaining stock
    console.log('Test 17: Overselling Prevention - Stock reservation safety check');
    const secondOrderRes = await makeRequest({
      method: 'POST',
      path: '/api/orders',
      headers: { Authorization: `Bearer ${buyer.token}` },
      body: {
        productId: testProduct._id,
        requestedQuantity: 35, // Remaining stock is only 30!
        initialOfferPrice: 3000,
        deliveryLocation: {
          address: 'Second Warehouse',
          district: 'Bhopal',
          state: 'Madhya Pradesh'
        }
      }
    });
    if (secondOrderRes.status !== 400) {
      throw new Error(`Expected 400 when requesting 35 against 30 remaining stock, got: ${secondOrderRes.status}`);
    }
    console.log(`  ✓ Overselling prevented: Requesting 35 with 30 stock returned 400: "${secondOrderRes.data.message}"\n`);

    // 18. Order Cancellation - ATOMIC STOCK RESTORATION
    console.log('Test 18: Cancel confirmed order (PATCH /api/orders/:id/cancel) - Atomic stock restoration');
    const cancelRes = await makeRequest({
      method: 'PATCH',
      path: `/api/orders/${orderId}/cancel`,
      headers: { Authorization: `Bearer ${buyer.token}` },
      body: { reason: 'Logistics rescheduled by warehouse.' }
    });
    if (cancelRes.status !== 200 || cancelRes.data.order.status !== 'CANCELLED') {
      throw new Error(`Order cancellation failed: ${JSON.stringify(cancelRes.data)}`);
    }

    // Verify product stock in database was restored back to 50 (30 + 20)
    const productAfterCancel = await Product.findById(testProduct._id);
    if (productAfterCancel.quantity !== 50) {
      throw new Error(`Expected restored product stock to be 50, got: ${productAfterCancel.quantity}`);
    }
    console.log(`  ✓ Order cancelled! Stock atomically restored from 30 back to ${productAfterCancel.quantity} quintal\n`);

    // 19. Order Completion Flow
    console.log('Test 19: Full flow from Negotiation -> Confirmation -> Completion');
    // Create new order
    const completedFlowOrderRes = await makeRequest({
      method: 'POST',
      path: '/api/orders',
      headers: { Authorization: `Bearer ${buyer.token}` },
      body: {
        productId: testProduct._id,
        requestedQuantity: 10,
        initialOfferPrice: 3200,
        deliveryLocation: {
          address: 'Bhopal Mandi Hub',
          district: 'Bhopal',
          state: 'Madhya Pradesh'
        }
      }
    });
    const flowOrderId = completedFlowOrderRes.data.order._id;
    const initialOfferId = completedFlowOrderRes.data.order.offers[0]._id;

    // Farmer accepts initial offer directly
    await makeRequest({
      method: 'PATCH',
      path: `/api/orders/${flowOrderId}/offers/${initialOfferId}/respond`,
      headers: { Authorization: `Bearer ${farmerA.token}` },
      body: { action: 'accept' }
    });

    // Buyer confirms
    await makeRequest({
      method: 'PATCH',
      path: `/api/orders/${flowOrderId}/confirm`,
      headers: { Authorization: `Bearer ${buyer.token}` }
    });

    // Farmer or Buyer marks completed
    const completeRes = await makeRequest({
      method: 'PATCH',
      path: `/api/orders/${flowOrderId}/complete`,
      headers: { Authorization: `Bearer ${farmerA.token}` }
    });
    if (completeRes.status !== 200 || completeRes.data.order.status !== 'COMPLETED') {
      throw new Error(`Complete order failed: ${JSON.stringify(completeRes.data)}`);
    }
    console.log(`  ✓ Order marked as COMPLETED successfully\n`);

    // 20. Admin views all platform orders & telemetry
    console.log('Test 20: Admin views all orders and platform order telemetry (GET /api/admin/orders)');
    const adminOrdersRes = await makeRequest({
      method: 'GET',
      path: '/api/admin/orders',
      headers: { Authorization: `Bearer ${admin.token}` }
    });
    if (adminOrdersRes.status !== 200 || !adminOrdersRes.data.summary) {
      throw new Error(`Admin orders view failed: ${JSON.stringify(adminOrdersRes.data)}`);
    }
    console.log(`  ✓ Admin retrieved ${adminOrdersRes.data.total} orders platform-wide`);
    console.log(`  ✓ Platform Telemetry: Total Orders: ${adminOrdersRes.data.summary.totalOrders}, Confirmed: ${adminOrdersRes.data.summary.confirmedCount}, Completed: ${adminOrdersRes.data.summary.completedCount}\n`);

    // Clean up test product and test orders
    await Order.deleteMany({ productId: testProduct._id });
    await Product.findByIdAndDelete(testProduct._id);

    console.log('======================================================');
    console.log(' ALL 20 VERSION 3 MARKETPLACE & ORDER TESTS PASSED! ');
    console.log('======================================================\n');
  } catch (error) {
    console.error('\n❌ Test failed with error:', error);
    process.exitCode = 1;
  } finally {
    if (server) {
      server.close();
    }
    await mongoose.connection.close();
  }
}

runTests();
