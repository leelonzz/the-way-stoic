require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@sanity/client')

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_API_READ_TOKEN,
  useCdn: false,
  apiVersion: '2024-01-01'
})

async function findInvalidImageReferences() {
  try {
    console.log('🔍 Searching for documents with invalid image URLs...')
    
    // Find all documents where mainImage is a string (URL) instead of an image object
    const documentsWithInvalidImages = await client.fetch(`
      *[_type == "blogPost" && typeof(mainImage) == "string"]{
        _id,
        title,
        mainImage,
        _type
      }
    `)
    
    console.log(`Found ${documentsWithInvalidImages.length} documents with invalid image URLs:`)
    
    documentsWithInvalidImages.forEach((doc, index) => {
      console.log(`\n${index + 1}. Document: ${doc.title}`)
      console.log(`   ID: ${doc._id}`)
      console.log(`   Invalid mainImage: ${doc.mainImage}`)
    })
    
    return documentsWithInvalidImages
  } catch (error) {
    console.error('❌ Error finding invalid image references:', error)
    return []
  }
}

async function fixInvalidImageReferences(documents) {
  if (documents.length === 0) {
    console.log('✅ No documents with invalid image URLs found!')
    return
  }
  
  console.log('\n🔧 Fixing invalid image references...')
  
  for (const doc of documents) {
    try {
      console.log(`\n📝 Fixing document: ${doc.title}`)
      
      // Remove the invalid mainImage field by setting it to null
      const result = await client
        .patch(doc._id)
        .unset(['mainImage'])
        .commit()
      
      console.log(`✅ Successfully removed invalid mainImage from: ${doc.title}`)
      
    } catch (error) {
      console.error(`❌ Error fixing document ${doc.title}:`, error)
    }
  }
}

async function findOtherInvalidImageFields() {
  try {
    console.log('\n🔍 Checking for other invalid image fields...')
    
    // Check for featuredImage fields that might be strings
    const documentsWithInvalidFeaturedImages = await client.fetch(`
      *[_type == "course" && typeof(featuredImage) == "string"]{
        _id,
        title,
        featuredImage,
        _type
      }
    `)
    
    if (documentsWithInvalidFeaturedImages.length > 0) {
      console.log(`Found ${documentsWithInvalidFeaturedImages.length} courses with invalid featuredImage URLs:`)
      
      documentsWithInvalidFeaturedImages.forEach((doc, index) => {
        console.log(`\n${index + 1}. Course: ${doc.title}`)
        console.log(`   ID: ${doc._id}`)
        console.log(`   Invalid featuredImage: ${doc.featuredImage}`)
      })
      
      // Fix these as well
      for (const doc of documentsWithInvalidFeaturedImages) {
        try {
          console.log(`\n📝 Fixing course: ${doc.title}`)
          
          await client
            .patch(doc._id)
            .unset(['featuredImage'])
            .commit()
          
          console.log(`✅ Successfully removed invalid featuredImage from: ${doc.title}`)
          
        } catch (error) {
          console.error(`❌ Error fixing course ${doc.title}:`, error)
        }
      }
    } else {
      console.log('✅ No courses with invalid featuredImage URLs found!')
    }
    
  } catch (error) {
    console.error('❌ Error checking for other invalid image fields:', error)
  }
}

async function main() {
  console.log('🚀 Starting Sanity image URL cleanup...')
  console.log('This script will find and remove invalid image URL strings from your Sanity documents.')
  console.log('After cleanup, you can re-add images properly through the Sanity Studio.\n')
  
  // Find and fix invalid mainImage references
  const invalidDocuments = await findInvalidImageReferences()
  await fixInvalidImageReferences(invalidDocuments)
  
  // Check for other invalid image fields
  await findOtherInvalidImageFields()
  
  console.log('\n🎉 Cleanup completed!')
  console.log('You can now refresh your Sanity Studio - the error should be resolved.')
  console.log('To add images back, use the Sanity Studio interface to upload images properly.')
}

main()
