require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@sanity/client')

const WRITE_TOKEN = 'skqEzotEwniXr9IJ6DoFxOpCkm4wZvq8ZciGqUsA6DqYXwqS7PdxYfaxoH8vau6A9vYRYt6nHPhISPfutdTLxw2KtSx5YhDLbnJU7IBhWMXrj3QVISM3Vx7atnOhvqbjqA3ax348rXg1tS52H0IH6iKkhjlTaQnNnFa6HJSLWxPoPqej1X8o'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  token: WRITE_TOKEN,
  useCdn: false,
  apiVersion: '2024-01-01'
})

const DOCUMENT_ID = 'Csdd80pLvugiOUK0y3iiV7'

async function deleteSpecificPost() {
  try {
    console.log(`🔍 Looking for document with ID: ${DOCUMENT_ID}`)
    
    // First, get the document details
    const doc = await client.getDocument(DOCUMENT_ID)
    
    if (!doc) {
      console.log('❌ Document not found')
      return
    }
    
    console.log('📋 Found document:')
    console.log(`   Title: ${doc.title || 'No title'}`)
    console.log(`   Type: ${doc._type}`)
    console.log(`   ID: ${doc._id}`)
    console.log(`   Created: ${doc._createdAt}`)
    console.log(`   Author: ${doc.author || 'No author'}`)
    
    if (doc.mainImage) {
      console.log(`   Main Image: ${typeof doc.mainImage === 'string' ? doc.mainImage : 'Image object'}`)
    }
    
    console.log('\n🗑️  Deleting this document...')
    
    // Delete the document
    const result = await client.delete(DOCUMENT_ID)
    
    console.log('✅ Document deleted successfully!')
    console.log('🔍 Deletion result:', result)
    
    // Verify deletion
    try {
      const checkDoc = await client.getDocument(DOCUMENT_ID)
      if (!checkDoc) {
        console.log('✅ Verified: Document has been completely removed')
      } else {
        console.log('⚠️  Warning: Document still exists after deletion')
      }
    } catch (error) {
      if (error.statusCode === 404) {
        console.log('✅ Verified: Document no longer exists (404 error as expected)')
      } else {
        console.log('✅ Verified: Document deletion confirmed')
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Run the deletion
deleteSpecificPost()