// Test script to verify Dodo Payments API connection
// Using built-in fetch (Node.js 18+)

const API_KEY = 'oxKiND9nnyQCKyU3.pg48JLHmF9Ho3aWQyNZ3wJaiqIlNDtWAbMebXV3oBClbqikJ';
const ENVIRONMENT = 'test';
const BASE_URL = 'https://api-test.dodopayments.com';
const PRODUCT_ID = 'pdt_1xvwazO5L41SzZeMegxyk';

async function testDodoAPI() {
  console.log('🧪 Testing Dodo Payments API Connection...\n');

  try {
    // Test 1: Check if we can list products
    console.log('1. Testing product listing...');
    const productsResponse = await fetch(`${BASE_URL}/v1/products`, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(`   Status: ${productsResponse.status}`);
    
    if (productsResponse.ok) {
      const products = await productsResponse.json();
      console.log(`   ✅ Products found: ${products.items ? products.items.length : 0}`);
      
      if (products.items && products.items.length > 0) {
        console.log('   Available products:');
        products.items.forEach(product => {
          console.log(`     - ${product.id}: ${product.name || 'Unnamed'}`);
        });
      }
    } else {
      const error = await productsResponse.text();
      console.log(`   ❌ Error: ${error}`);
    }

    // Test 2: Check specific product
    console.log('\n2. Testing specific product retrieval...');
    const productResponse = await fetch(`${BASE_URL}/v1/products/${PRODUCT_ID}`, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(`   Status: ${productResponse.status}`);
    
    if (productResponse.ok) {
      const product = await productResponse.json();
      console.log(`   ✅ Product found: ${product.name || 'Unnamed'}`);
      console.log(`   Price: ${product.price ? product.price.price : 'N/A'}`);
    } else {
      const error = await productResponse.text();
      console.log(`   ❌ Product not found: ${error}`);
    }

    // Test 3: Try creating a customer
    console.log('\n3. Testing customer creation...');
    const customerResponse = await fetch(`${BASE_URL}/v1/customers`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'test@example.com',
        name: 'Test User'
      })
    });

    console.log(`   Status: ${customerResponse.status}`);
    
    if (customerResponse.ok) {
      const customer = await customerResponse.json();
      console.log(`   ✅ Customer created: ${customer.customer_id}`);
    } else {
      const error = await customerResponse.text();
      console.log(`   ❌ Customer creation failed: ${error}`);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testDodoAPI();
