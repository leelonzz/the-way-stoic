require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@sanity/client')

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_API_READ_TOKEN,
  useCdn: false,
  apiVersion: '2024-01-01'
})

async function checkBlogPosts() {
  try {
    console.log('Fetching existing blog posts...')
    const posts = await client.fetch(`*[_type == "blogPost"]{
      _id,
      title,
      slug,
      author,
      excerpt,
      publishedAt,
      body
    }`)
    
    console.log(`Found ${posts.length} blog posts:`)
    posts.forEach((post, index) => {
      console.log(`\n${index + 1}. ${post.title}`)
      console.log(`   Slug: ${post.slug?.current || 'No slug'}`)
      console.log(`   Author: ${post.author || 'No author'}`)
      console.log(`   Published: ${post.publishedAt || 'Not published'}`)
      console.log(`   Body: ${post.body ? `${post.body.length} blocks` : 'No body content'}`)
      if (post.excerpt) {
        console.log(`   Excerpt: ${post.excerpt.substring(0, 100)}...`)
      }
    })
  } catch (error) {
    console.error('Error fetching blog posts:', error)
  }
}

checkBlogPosts()