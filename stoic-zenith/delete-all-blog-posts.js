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

async function deleteAllBlogPosts() {
  try {
    console.log('🔍 Finding all blog posts...')
    
    // Get all blog posts
    const allPosts = await client.fetch(`
      *[_type == "blogPost"] {
        _id,
        _createdAt,
        title,
        slug,
        author
      }
    `)
    
    if (allPosts.length === 0) {
      console.log('✅ No blog posts found - nothing to delete')
      return
    }
    
    console.log(`📝 Found ${allPosts.length} blog posts to delete:`)
    allPosts.forEach((post, index) => {
      console.log(`${index + 1}. "${post.title || 'Untitled'}" (ID: ${post._id})`)
    })
    
    console.log('\n🗑️  Starting bulk deletion...')
    
    let deletedCount = 0
    let failedCount = 0
    
    // Delete each post one by one
    for (const post of allPosts) {
      try {
        console.log(`Deleting: "${post.title || 'Untitled'}"...`)
        await client.delete(post._id)
        deletedCount++
        console.log(`✅ Deleted successfully`)
      } catch (error) {
        failedCount++
        console.log(`❌ Failed to delete: ${error.message}`)
      }
    }
    
    console.log('\n📊 Deletion Summary:')
    console.log(`✅ Successfully deleted: ${deletedCount} posts`)
    console.log(`❌ Failed to delete: ${failedCount} posts`)
    console.log(`📝 Total processed: ${allPosts.length} posts`)
    
    // Verify by checking if any blog posts still exist
    console.log('\n🔍 Verifying deletion...')
    const remainingPosts = await client.fetch(`*[_type == "blogPost"] | count()`)
    
    if (remainingPosts === 0) {
      console.log('✅ All blog posts have been successfully deleted!')
    } else {
      console.log(`⚠️  Warning: ${remainingPosts} blog posts still exist`)
    }
    
  } catch (error) {
    console.error('❌ Error during bulk deletion:', error)
  }
}

// Run the bulk deletion
deleteAllBlogPosts()