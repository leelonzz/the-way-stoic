require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@sanity/client')

const WRITE_TOKEN = 'skqEzotEwniXr9IJ6DoFxOpCkm4wZvq8ZciGqUsA6DqYXwqS7PdxYfaxoH8vau6A9vYRYt6nHPhISPfutdTLxw2KtSx5YhDLbnJU7IBhWMXrj3QVISM3Vx7atnOhvqbjqA3ax348rXg1tS52H0IH6iKkhjlTaQnNnFa6HJSLWxPoPqej1X8o'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  token: WRITE_TOKEN,
  useCdn: false,
  apiVersion: '2024-01-01',
  perspective: 'published'
})

const TRANSACTION_ID = 'Csdd80pLvugiOUK0y3iiUX'

async function findAndDeleteByTransaction() {
  try {
    console.log(`🔍 Searching for document created by transaction: ${TRANSACTION_ID}`)
    
    // Approach 1: Try to find via transaction history
    try {
      const historyUrl = `https://${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}.api.sanity.io/v2024-01-01/data/history/${process.env.NEXT_PUBLIC_SANITY_DATASET}/transactions/${TRANSACTION_ID}`
      
      const response = await fetch(historyUrl, {
        headers: {
          'Authorization': `Bearer ${WRITE_TOKEN}`
        }
      })
      
      if (response.ok) {
        const transactionData = await response.json()
        console.log('📊 Transaction data:', JSON.stringify(transactionData, null, 2))
        
        // Extract document ID from transaction
        if (transactionData.mutations && transactionData.mutations.length > 0) {
          const mutation = transactionData.mutations[0]
          if (mutation.create) {
            const docId = Object.keys(mutation.create)[0]
            console.log(`✅ Found document ID from transaction: ${docId}`)
            await deleteDocument(docId)
            return
          }
        }
      }
    } catch (error) {
      console.log('⚠️  Transaction history API not accessible, trying alternative approach...')
    }
    
    // Approach 2: Query recent blog posts and check revision history
    console.log('🔍 Searching through recent blog posts...')
    const recentPosts = await client.fetch(`
      *[_type == "blogPost"] | order(_createdAt desc)[0...50] {
        _id,
        _rev,
        _createdAt,
        _updatedAt,
        title,
        slug,
        author
      }
    `)
    
    console.log(`📝 Found ${recentPosts.length} recent blog posts`)
    
    // Check each post's revision history
    for (const post of recentPosts) {
      try {
        const historyUrl = `https://${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}.api.sanity.io/v2024-01-01/data/history/${process.env.NEXT_PUBLIC_SANITY_DATASET}/documents/${post._id}`
        
        const response = await fetch(historyUrl, {
          headers: {
            'Authorization': `Bearer ${WRITE_TOKEN}`
          }
        })
        
        if (response.ok) {
          const history = await response.json()
          
          // Check if any transaction in history matches our ID
          for (const item of history) {
            if (item.transactionId === TRANSACTION_ID) {
              console.log(`✅ Found matching document!`)
              console.log(`📄 Document: ${post.title}`)
              console.log(`🆔 ID: ${post._id}`)
              console.log(`📅 Created: ${post._createdAt}`)
              
              await deleteDocument(post._id)
              return
            }
          }
        }
      } catch (error) {
        // Skip this post if history is not accessible
        continue
      }
    }
    
    console.log('❌ Could not find document with that transaction ID')
    console.log('💡 The document may have already been deleted or the transaction ID is incorrect')
    
  } catch (error) {
    console.error('❌ Error searching for document:', error)
  }
}

async function deleteDocument(docId) {
  try {
    console.log(`🗑️  Attempting to delete document: ${docId}`)
    
    // First, get the document details for confirmation
    const doc = await client.getDocument(docId)
    
    if (!doc) {
      console.log('❌ Document not found or already deleted')
      return
    }
    
    console.log('📋 Document to be deleted:')
    console.log(`   Title: ${doc.title || 'No title'}`)
    console.log(`   Type: ${doc._type}`)
    console.log(`   ID: ${doc._id}`)
    console.log(`   Created: ${doc._createdAt}`)
    
    // Delete the document
    const result = await client.delete(docId)
    
    console.log('✅ Document deleted successfully!')
    console.log('🔍 Deletion result:', result)
    
    // Verify deletion
    try {
      const checkDoc = await client.getDocument(docId)
      if (!checkDoc) {
        console.log('✅ Verified: Document has been completely removed')
      } else {
        console.log('⚠️  Warning: Document still exists after deletion')
      }
    } catch (error) {
      console.log('✅ Verified: Document no longer exists (expected error when checking deleted doc)')
    }
    
  } catch (error) {
    console.error('❌ Error deleting document:', error)
  }
}

// Run the search and delete
findAndDeleteByTransaction()