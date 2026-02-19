/**
 * RBAC Integration Test Script
 * 
 * This script performs basic integration tests for the RBAC system
 * Run with: node scripts/testRBACIntegration.js
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

let testResults = {
    passed: 0,
    failed: 0,
    total: 0
};

// Test credentials
const adminCreds = {
    email: 'bitaaaa2004@gmail.com',
    password: 'admin123'
};

const sellerCreds = {
    email: 'meseretmezgebe338@gmail.com',
    password: 'seller123'
};

// Helper functions
function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(name) {
    console.log(`\n${colors.cyan}Testing: ${name}${colors.reset}`);
}

function logPass(message) {
    testResults.passed++;
    testResults.total++;
    log(`✓ ${message}`, 'green');
}

function logFail(message, error = '') {
    testResults.failed++;
    testResults.total++;
    log(`✗ ${message}`, 'red');
    if (error) {
        log(`  Error: ${error}`, 'red');
    }
}

function logInfo(message) {
    log(`  ${message}`, 'blue');
}

// Test functions
async function testAdminLogin() {
    logTest('Admin Login');
    try {
        const response = await axios.post(`${BASE_URL}/auth/login`, adminCreds);

        if (response.data.success && response.data.token) {
            logPass('Admin can login successfully');
            logInfo(`Role: ${response.data.data.role}`);
            return response.data.token;
        } else {
            logFail('Admin login failed - no token returned');
            return null;
        }
    } catch (error) {
        logFail('Admin login failed', error.response?.data?.error || error.message);
        return null;
    }
}

async function testSellerLogin() {
    logTest('Seller Login');
    try {
        const response = await axios.post(`${BASE_URL}/auth/login`, sellerCreds);

        if (response.data.success && response.data.token) {
            logPass('Seller can login successfully');
            logInfo(`Role: ${response.data.data.role}`);
            return response.data.token;
        } else {
            logFail('Seller login failed - no token returned');
            return null;
        }
    } catch (error) {
        logFail('Seller login failed', error.response?.data?.error || error.message);
        return null;
    }
}

async function testTokenVerification(token, expectedRole) {
    logTest(`Token Verification (${expectedRole})`);
    try {
        const response = await axios.get(`${BASE_URL}/auth/verify`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success && response.data.data.role === expectedRole) {
            logPass(`Token verified for ${expectedRole}`);
            return true;
        } else {
            logFail(`Token verification failed - expected role ${expectedRole}, got ${response.data.data.role}`);
            return false;
        }
    } catch (error) {
        logFail('Token verification failed', error.response?.data?.error || error.message);
        return false;
    }
}

async function testAdminRoleAccess(adminToken) {
    logTest('Admin Role Access');
    try {
        const response = await axios.get(`${BASE_URL}/admin/roles`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });

        if (response.data.success) {
            logPass('Admin can access role management endpoint');
            logInfo(`Found ${response.data.data?.length || 0} roles`);
            return true;
        } else {
            logFail('Admin role access failed');
            return false;
        }
    } catch (error) {
        logFail('Admin role access failed', error.response?.data?.error || error.message);
        return false;
    }
}

async function testSellerCannotAccessAdmin(sellerToken) {
    logTest('Seller Cannot Access Admin Endpoints');
    try {
        await axios.get(`${BASE_URL}/admin/roles`, {
            headers: { Authorization: `Bearer ${sellerToken}` }
        });

        logFail('Seller should not be able to access admin endpoints');
        return false;
    } catch (error) {
        if (error.response?.status === 403) {
            logPass('Seller correctly denied access to admin endpoints');
            return true;
        } else {
            logFail('Unexpected error', error.response?.data?.error || error.message);
            return false;
        }
    }
}

async function testGuestCannotAccessProtected() {
    logTest('Guest Cannot Access Protected Endpoints');
    try {
        await axios.get(`${BASE_URL}/auth/verify`);

        logFail('Guest should not be able to access protected endpoints');
        return false;
    } catch (error) {
        if (error.response?.status === 401) {
            logPass('Guest correctly denied access to protected endpoints');
            return true;
        } else {
            logFail('Unexpected error', error.response?.data?.error || error.message);
            return false;
        }
    }
}

async function testTokenRefresh(token) {
    logTest('Token Refresh');
    try {
        const response = await axios.post(`${BASE_URL}/auth/refresh`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success && response.data.token) {
            logPass('Token refresh successful');
            logInfo('New token generated');
            return response.data.token;
        } else {
            logFail('Token refresh failed - no new token returned');
            return null;
        }
    } catch (error) {
        logFail('Token refresh failed', error.response?.data?.error || error.message);
        return null;
    }
}

async function testLogout(token) {
    logTest('Logout and Token Blacklist');
    try {
        const response = await axios.post(`${BASE_URL}/auth/logout`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
            logPass('Logout successful');

            // Try to use the token again
            try {
                await axios.get(`${BASE_URL}/auth/verify`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                logFail('Token should be blacklisted after logout');
                return false;
            } catch (error) {
                if (error.response?.data?.code === 'TOKEN_REVOKED') {
                    logPass('Token correctly blacklisted after logout');
                    return true;
                } else {
                    logFail('Unexpected error when using blacklisted token', error.response?.data?.error);
                    return false;
                }
            }
        } else {
            logFail('Logout failed');
            return false;
        }
    } catch (error) {
        logFail('Logout failed', error.response?.data?.error || error.message);
        return false;
    }
}

async function testRateLimiting() {
    logTest('Rate Limiting (Login Attempts)');
    logInfo('This test will make multiple failed login attempts');

    const failedCreds = {
        email: 'test@test.com',
        password: 'wrongpassword'
    };

    let rateLimitTriggered = false;

    for (let i = 1; i <= 6; i++) {
        try {
            await axios.post(`${BASE_URL}/auth/login`, failedCreds);
        } catch (error) {
            if (error.response?.status === 429) {
                logPass(`Rate limiting triggered after ${i} attempts`);
                rateLimitTriggered = true;
                break;
            }
        }

        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    if (!rateLimitTriggered) {
        logFail('Rate limiting not triggered after 6 attempts');
        return false;
    }

    return true;
}

async function testAuditLogging(adminToken) {
    logTest('Audit Logging');
    try {
        const response = await axios.get(`${BASE_URL}/audit/logs?limit=10`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });

        if (response.data.success && response.data.data) {
            logPass('Audit logs accessible');
            logInfo(`Found ${response.data.data.length} recent audit log entries`);

            // Check if login events are logged
            const loginEvents = response.data.data.filter(log => log.action === 'login');
            if (loginEvents.length > 0) {
                logPass('Login events are being logged');
            } else {
                logInfo('No login events found in recent logs');
            }

            return true;
        } else {
            logFail('Audit logs not accessible');
            return false;
        }
    } catch (error) {
        logFail('Audit logging test failed', error.response?.data?.error || error.message);
        return false;
    }
}

// Main test runner
async function runTests() {
    log('\n========================================', 'cyan');
    log('  RBAC INTEGRATION TEST SUITE', 'cyan');
    log('========================================\n', 'cyan');

    log('Starting tests...', 'yellow');
    log(`Backend URL: ${BASE_URL}\n`, 'blue');

    // Test 1: Admin Login
    const adminToken = await testAdminLogin();
    if (!adminToken) {
        log('\n⚠️  Cannot continue without admin token', 'red');
        return;
    }

    // Test 2: Seller Login
    const sellerToken = await testSellerLogin();
    if (!sellerToken) {
        log('\n⚠️  Cannot continue without seller token', 'red');
        return;
    }

    // Test 3: Token Verification
    await testTokenVerification(adminToken, 'admin');
    await testTokenVerification(sellerToken, 'seller');

    // Test 4: Admin Role Access
    await testAdminRoleAccess(adminToken);

    // Test 5: Seller Cannot Access Admin
    await testSellerCannotAccessAdmin(sellerToken);

    // Test 6: Guest Cannot Access Protected
    await testGuestCannotAccessProtected();

    // Test 7: Token Refresh
    const newAdminToken = await testTokenRefresh(adminToken);

    // Test 8: Audit Logging
    if (newAdminToken) {
        await testAuditLogging(newAdminToken);
    }

    // Test 9: Rate Limiting
    await testRateLimiting();

    // Test 10: Logout and Token Blacklist
    if (newAdminToken) {
        await testLogout(newAdminToken);
    }

    // Print summary
    log('\n========================================', 'cyan');
    log('  TEST SUMMARY', 'cyan');
    log('========================================\n', 'cyan');

    log(`Total Tests: ${testResults.total}`, 'blue');
    log(`Passed: ${testResults.passed}`, 'green');
    log(`Failed: ${testResults.failed}`, 'red');

    const passRate = ((testResults.passed / testResults.total) * 100).toFixed(1);
    log(`\nPass Rate: ${passRate}%`, passRate >= 80 ? 'green' : 'red');

    if (testResults.failed === 0) {
        log('\n✓ All tests passed!', 'green');
    } else {
        log(`\n✗ ${testResults.failed} test(s) failed`, 'red');
    }

    log('\n========================================\n', 'cyan');
}

// Run tests
runTests().catch(error => {
    log('\n✗ Test suite failed with error:', 'red');
    console.error(error);
    process.exit(1);
});
