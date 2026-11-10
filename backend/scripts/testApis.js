/**
 * API Test Suite for FARMlink AI Backend (Version 1)
 */
const http = require('http');
const app = require('../server');

let server;
const PORT = 5050;
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

  // Get cookies from set-cookie header if present
  const setCookie = response.headers.get('set-cookie');

  return {
    status: response.status,
    headers: response.headers,
    data: json,
    setCookie
  };
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`  ✓ ${message}`);
}

async function runTests() {
  console.log('\n==================================================');
  console.log(' Starting FARMlink AI Backend API Test Suite');
  console.log('==================================================\n');

  // Start server on test port
  server = app.listen(PORT);
  await new Promise((resolve) => setTimeout(resolve, 500));

  try {
    // 1. Health check
    console.log('Test 1: Health check');
    const health = await request('/api/health');
    assert(health.status === 200, 'Health endpoint responds with 200 OK');
    assert(health.data.status === 'healthy', 'Health status is "healthy"');

    // 2. Admin Login
    console.log('\nTest 2: Admin Login');
    const adminLogin = await request('/api/auth/login', {
      method: 'POST',
      body: {
        email: 'admin@farmlink.ai',
        password: 'Admin@FarmLink2026!'
      }
    });
    assert(adminLogin.status === 200, 'Admin login returns 200 OK');
    assert(adminLogin.data.success === true, 'Admin login success is true');
    assert(adminLogin.data.token, 'Admin receives JWT token');
    assert(adminLogin.data.user.role === 'admin', 'Admin user role is admin');
    assert(!adminLogin.data.user.passwordHash, 'passwordHash is excluded from response');
    const adminToken = adminLogin.data.token;

    // 3. Invalid credentials test
    console.log('\nTest 3: Invalid login credentials');
    const badLogin = await request('/api/auth/login', {
      method: 'POST',
      body: {
        email: 'admin@farmlink.ai',
        password: 'WrongPassword123!'
      }
    });
    assert(badLogin.status === 401, 'Bad credentials returns 401 Unauthorized');
    assert(badLogin.data.success === false, 'Bad credentials success is false');

    // 4. Test public registration validation (Reject ADMIN role)
    console.log('\nTest 4: Reject ADMIN role in public registration');
    const spoofAdminReg = await request('/api/auth/register', {
      method: 'POST',
      body: {
        fullName: 'Hacker Joe',
        email: 'hacker@test.com',
        phone: '+919999999999',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        role: 'admin',
        state: 'Delhi',
        district: 'New Delhi',
        village: 'Connaught Place'
      }
    });
    assert(spoofAdminReg.status === 422, 'Public registration with role "admin" is rejected with 422');

    // 5. Register a new Farmer
    console.log('\nTest 5: Register new Farmer');
    const testEmail = `farmer.test.${Date.now()}@example.com`;
    const newFarmerReg = await request('/api/auth/register', {
      method: 'POST',
      body: {
        fullName: 'Suresh Kumar',
        email: testEmail,
        phone: '+919876501234',
        password: 'FarmerSecure2026!',
        confirmPassword: 'FarmerSecure2026!',
        role: 'farmer',
        state: 'Punjab',
        district: 'Ludhiana',
        village: 'Samrala',
        farmerDetails: {
          farmName: 'Suresh Golden Harvest',
          farmingExperience: 12,
          mainCropsGrown: ['Basmati Rice', 'Durum Wheat']
        }
      }
    });
    assert(newFarmerReg.status === 201, 'Farmer registration returns 201 Created');
    assert(newFarmerReg.data.user.role === 'farmer', 'New user role is farmer');
    const farmerToken = newFarmerReg.data.token;
    const farmerId = newFarmerReg.data.user._id;

    // 6. Test duplicate email registration
    console.log('\nTest 6: Duplicate email rejection');
    const duplicateReg = await request('/api/auth/register', {
      method: 'POST',
      body: {
        fullName: 'Suresh Kumar Duplicate',
        email: testEmail,
        phone: '+919876501234',
        password: 'FarmerSecure2026!',
        confirmPassword: 'FarmerSecure2026!',
        role: 'farmer',
        state: 'Punjab',
        district: 'Ludhiana',
        village: 'Samrala'
      }
    });
    assert(duplicateReg.status === 409, 'Duplicate email returns 409 Conflict');

    // 7. Get Current User (/api/auth/me)
    console.log('\nTest 7: /api/auth/me for Farmer');
    const meRes = await request('/api/auth/me', {
      headers: { Authorization: `Bearer ${farmerToken}` }
    });
    assert(meRes.status === 200, 'GET /api/auth/me returns 200 OK');
    assert(meRes.data.data.email === testEmail, 'Current user email matches');

    // 8. Update Profile (/api/users/profile)
    console.log('\nTest 8: Update Profile');
    const updateRes = await request('/api/users/profile', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${farmerToken}` },
      body: {
        address: 'SAM-102 Village Center',
        farmerDetails: {
          farmName: 'Suresh High-Yield Agro',
          farmingExperience: 13,
          mainCropsGrown: ['Basmati Rice', 'Durum Wheat', 'Mustard']
        }
      }
    });
    assert(updateRes.status === 200, 'PUT /api/users/profile returns 200 OK');
    assert(updateRes.data.data.farmerDetails.farmingExperience === 13, 'Farm experience updated');

    // 9. Unauthorized Role Check (Farmer trying to access Admin endpoints)
    console.log('\nTest 9: Role-Based Authorization Guard (Farmer accessing Admin endpoint)');
    const unauthorizedAdminReq = await request('/api/admin/dashboard', {
      headers: { Authorization: `Bearer ${farmerToken}` }
    });
    assert(unauthorizedAdminReq.status === 403, 'Farmer accessing admin route returns 403 Forbidden');

    // 10. Admin Dashboard stats
    console.log('\nTest 10: Admin Dashboard Statistics');
    const adminDashboardRes = await request('/api/admin/dashboard', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(adminDashboardRes.status === 200, 'Admin dashboard returns 200 OK');
    assert(adminDashboardRes.data.data.totalUsers >= 5, 'Total users count is tracked correctly');
    assert(adminDashboardRes.data.data.totalFarmers >= 3, 'Total farmers count is tracked');

    // 11. Admin User Management List
    console.log('\nTest 11: Admin User Management List & Filtering');
    const adminUsersRes = await request('/api/admin/users?role=farmer', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(adminUsersRes.status === 200, 'Admin GET /api/admin/users returns 200 OK');
    assert(adminUsersRes.data.data.users.length > 0, 'Users array has results');
    assert(
      adminUsersRes.data.data.users.every((u) => u.role === 'farmer'),
      'All filtered users have role farmer'
    );

    // 12. Admin Toggle User Status (Deactivate / Activate)
    console.log('\nTest 12: Admin Activate / Deactivate user');
    const deactivateRes = await request(`/api/admin/users/${farmerId}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { isActive: false }
    });
    assert(deactivateRes.status === 200, 'Deactivation returns 200 OK');
    assert(deactivateRes.data.data.isActive === false, 'User status set to false');

    // Check that deactivated user cannot login
    const deactivatedLogin = await request('/api/auth/login', {
      method: 'POST',
      body: {
        email: testEmail,
        password: 'FarmerSecure2026!'
      }
    });
    assert(deactivatedLogin.status === 403, 'Deactivated user cannot log in (403)');

    // Reactivate user
    const reactivateRes = await request(`/api/admin/users/${farmerId}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { isActive: true }
    });
    assert(reactivateRes.status === 200, 'Reactivation returns 200 OK');
    assert(reactivateRes.data.data.isActive === true, 'User status set back to true');

    // 13. Admin cannot deactivate own account
    console.log('\nTest 13: Prevent admin self-deactivation');
    const adminMe = await request('/api/auth/me', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const selfDeactivateRes = await request(`/api/admin/users/${adminMe.data.data._id}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { isActive: false }
    });
    assert(selfDeactivateRes.status === 400, 'Self-deactivation prevented with 400 Bad Request');

    // 14. Logout endpoint
    console.log('\nTest 14: Logout endpoint');
    const logoutRes = await request('/api/auth/logout', { method: 'POST' });
    assert(logoutRes.status === 200, 'Logout returns 200 OK');

    console.log('\n==================================================');
    console.log(' ALL 14 BACKEND TESTS PASSED SUCCESSFULLY! ');
    console.log('==================================================\n');
  } catch (error) {
    console.error('\n❌ Test failure:', error.message);
    process.exit(1);
  } finally {
    if (server) {
      server.close();
    }
    process.exit(0);
  }
}

runTests();
