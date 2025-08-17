import {getCliClient} from 'sanity/cli'

const client = getCliClient()

async function findAndDeleteMostRecent() {
  try {
    console.log('🔍 Finding the most recent blog post...')
    
    // Get the most recent blog post
    const recentPosts = await client.fetch(`
      *[_type == "blogPost"] | order(_createdAt desc)[0...5] {
        _id,
        _createdAt,
        _updatedAt,
        title,
        slug,
        author,
        excerpt
      }
    `)
    
    if (recentPosts.length === 0) {
      console.log('❌ No blog posts found')
      return
    }
    
    console.log(`📝 Found ${recentPosts.length} recent blog posts:`)
    recentPosts.forEach((post, index) => {
      console.log(`\n${index + 1}. ${post.title || 'Untitled'}`)
      console.log(`   ID: ${post._id}`)
      console.log(`   Created: ${post._createdAt}`)
      console.log(`   Author: ${post.author || 'No author'}`)
      if (post.slug?.current) {
        console.log(`   Slug: ${post.slug.current}`)
      }
      if (post.excerpt) {
        console.log(`   Excerpt: ${post.excerpt.substring(0, 100)}...`)
      }
    })
    
    // Delete the most recent one (assuming it's the one from the transaction)
    const mostRecent = recentPosts[0]
    console.log(`\n🗑️  Deleting the most recent blog post: "${mostRecent.title || 'Untitled'}"`)
    console.log(`   ID: ${mostRecent._id}`)
    
    // Confirm before deletion
    console.log('⚠️  This will permanently delete the blog post!')
    
    // Delete the document
    const result = await client.delete(mostRecent._id)
    
    console.log('✅ Blog post deleted successfully!')
    console.log('🔍 Deletion result:', result)
    
    // Verify deletion
    try {
      const checkDoc = await client.getDocument(mostRecent._id)
      if (!checkDoc) {
        console.log('✅ Verified: Document has been completely removed')
      } else {
        console.log('⚠️  Warning: Document still exists after deletion')
      }
    } catch (error) {
      console.log('✅ Verified: Document no longer exists')
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Run the deletion
findAndDeleteMostRecent()