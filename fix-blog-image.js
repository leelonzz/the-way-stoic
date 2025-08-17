// Simple script to fix the invalid image URL in the recent blog post
// Using the transaction ID: Csdd80pLvugiOUK9y3liUX

const https = require('https');

// Sanity project details
const projectId = 'uw2gxwzi';
const dataset = 'production';
const apiVersion = '2024-01-01';

// You'll need to get your write token from Sanity
const token = 'YOUR_SANITY_WRITE_TOKEN'; // Replace with your actual token

async function findAndFixBlogPost() {
  try {
    console.log('🔍 Finding blog posts with invalid image URLs...');
    
    // Query to find blog posts where mainImage is a string
    const query = `*[_type == "blogPost" && typeof(mainImage) == "string"]{
      _id,
      title,
      mainImage
    }`;
    
    const url = `https://${projectId}.api.sanity.io/v${apiVersion}/data/query/${dataset}?query=${encodeURIComponent(query)}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    if (data.result && data.result.length > 0) {
      console.log(`Found ${data.result.length} blog posts with invalid images:`);
      
      for (const post of data.result) {
        console.log(`\n📝 Fixing: ${post.title}`);
        console.log(`   ID: ${post._id}`);
        console.log(`   Invalid URL: ${post.mainImage}`);
        
        // Remove the invalid mainImage field
        await removeInvalidImage(post._id);
      }
    } else {
      console.log('✅ No blog posts with invalid image URLs found!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

async function removeInvalidImage(documentId) {
  try {
    const mutation = {
      mutations: [
        {
          patch: {
            id: documentId,
            unset: ['mainImage']
          }
        }
      ]
    };
    
    const url = `https://${projectId}.api.sanity.io/v${apiVersion}/data/mutate/${dataset}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(mutation)
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Successfully removed invalid mainImage');
    } else {
      console.error('❌ Failed to remove image:', result);
    }
    
  } catch (error) {
    console.error('❌ Error removing image:', error);
  }
}

// Instructions for the user
console.log('🚀 Sanity Image URL Fix Script');
console.log('');
console.log('⚠️  IMPORTANT: You need to add your Sanity write token!');
console.log('');
console.log('1. Go to https://sanity.io/manage');
console.log('2. Select your project');
console.log('3. Go to API tab');
console.log('4. Create a new token with "Editor" permissions');
console.log('5. Replace YOUR_SANITY_WRITE_TOKEN in this script');
console.log('');

if (token === 'YOUR_SANITY_WRITE_TOKEN') {
  console.log('❌ Please add your Sanity write token first!');
  process.exit(1);
}

// Run the fix
findAndFixBlogPost();
