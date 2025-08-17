# Sanity Queries to Fix Invalid Image URLs

## Step 1: Find Documents with Invalid Image URLs

Go to your Sanity Studio Vision tool and run this query to find the problematic documents:

```groq
*[_type == "blogPost" && typeof(mainImage) == "string"]{
  _id,
  title,
  mainImage,
  _createdAt
}
```

## Step 2: Fix the Documents

For each document found, you can either:

### Option A: Remove the invalid mainImage field entirely
```groq
// In Vision tool, you can't run mutations, but you can identify the documents
// Then manually edit them in the Studio
```

### Option B: Use the Sanity CLI (if you have write access)

1. Install Sanity CLI: `npm install -g @sanity/cli`
2. Login: `sanity login`
3. Navigate to your project directory
4. Run this command:

```bash
sanity exec fix-images.js --with-user-token
```

Where `fix-images.js` contains:

```javascript
import {getCliClient} from 'sanity/cli'

const client = getCliClient()

const query = '*[_type == "blogPost" && typeof(mainImage) == "string"]'

client.fetch(query).then(docs => {
  docs.forEach(doc => {
    console.log(`Fixing ${doc.title}`)
    client
      .patch(doc._id)
      .unset(['mainImage'])
      .commit()
      .then(() => console.log(`✅ Fixed ${doc.title}`))
      .catch(err => console.error(`❌ Error fixing ${doc.title}:`, err))
  })
})
```

## Step 3: Manual Fix in Studio

If the above doesn't work, you can manually fix each document:

1. Go to your Sanity Studio
2. Navigate to the blog post with the invalid image
3. Click on the mainImage field
4. Delete the URL text
5. Leave the field empty or upload a proper image
6. Save the document

## The Problem

The error occurs because your mainImage field contains:
```
"mainImage": "https://cdn.sanity.io/images/uw2gxwzi/production/1b58b76ea039b25efff68afc599c9c80f7a85dbb-1600x1255.png"
```

But it should be:
```
"mainImage": {
  "_type": "image",
  "asset": {
    "_type": "reference",
    "_ref": "image-1b58b76ea039b25efff68afc599c9c80f7a85dbb-1600x1255-png"
  }
}
```

## Quick Fix

The fastest way is to:
1. Open your Sanity Studio
2. Go to the problematic blog post
3. Clear the mainImage field completely
4. Save the document
5. Refresh the Studio - the error should be gone
