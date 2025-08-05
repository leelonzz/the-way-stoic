#!/usr/bin/env node

/**
 * Quick Integration Test Script
 * Run this to verify your Dodo Payments integration is working
 */

const https = require('https');
const http = require('http');

const TEST_DATA = {
  productId: 'pdt_1xvwazO5L41SzZeMegxyk',
  userId: 'test_user_123',
  customerData: {
    email: 'test@example.com',
    name: 'Test User',
    phone: '+1234567890',
    billingAddress: {
      street: '123 Main St',
      city: 'San Francisco',
      state: 'CA',
      zipcode: '94105',
      country: 'US'
    }
  },
  returnUrl: 'http://localhost:3002/subscription/success',
  cancelUrl: 'http://localhost:3002/subscription/cancel'
};

function testAPI() {
  console.log('🧪 Testing Dodo Payments Integration...\n');

  const postData = JSON.stringify(TEST_DATA);
  
  const options = {
    hostname: 'localhost',
    port: 3002,
    path: '/api/dodo/subscriptions',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log(`📡 Response Status: ${res.statusCode}`);
      console.log(`📡 Response Headers:`, res.headers);
      
      try {
        const response = JSON.parse(data);
        
        if (res.statusCode === 200) {
          console.log('✅ SUCCESS! Integration is working!\n');
          console.log('📋 Response Data:');
          console.log(`   Subscription ID: ${response.subscriptionId}`);
          console.log(`   Checkout URL: ${response.checkoutUrl}`);
          console.log(`   Status: ${response.status}`);
          console.log(`   Customer ID: ${response.customer?.customer_id}`);
          console.log(`   Payment ID: ${response.payment_id}`);
          
          if (response.checkoutUrl) {
            console.log('\n🎉 Perfect! Your integration is ready to use!');
            console.log('🌐 Test it in browser: http://localhost:3002/test-dodo');
          }
        } else {
          console.log('❌ ERROR: API returned non-200 status');
          console.log('📋 Response:', response);
        }
      } catch (error) {
        console.log('❌ ERROR: Invalid JSON response');
        console.log('📋 Raw Response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.log('❌ ERROR: Failed to connect to API');
    console.log('🔍 Details:', error.message);
    console.log('\n💡 Make sure your development server is running:');
    console.log('   cd stoic-zenith && npm run dev');
  });

  req.write(postData);
  req.end();
}

function checkServer() {
  console.log('🔍 Checking if development server is running...\n');
  
  const options = {
    hostname: 'localhost',
    port: 3002,
    path: '/api/dodo/subscriptions',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    if (res.statusCode === 200 || res.statusCode === 405) {
      console.log('✅ Server is running on http://localhost:3002');
      console.log('🧪 Running API test...\n');
      testAPI();
    } else {
      console.log(`⚠️  Server responded with status: ${res.statusCode}`);
      testAPI(); // Try anyway
    }
  });

  req.on('error', (error) => {
    console.log('❌ Server is not running or not accessible');
    console.log('🔍 Error:', error.message);
    console.log('\n💡 Start your development server:');
    console.log('   cd stoic-zenith');
    console.log('   npm run dev');
    console.log('\n   Then run this test again: node test-integration.js');
  });

  req.end();
}

// Run the test
console.log('🚀 Dodo Payments Integration Test\n');
console.log('📋 Test Configuration:');
console.log(`   Product ID: ${TEST_DATA.productId}`);
console.log(`   API Endpoint: http://localhost:3002/api/dodo/subscriptions`);
console.log(`   Test User: ${TEST_DATA.customerData.email}\n`);

checkServer();
