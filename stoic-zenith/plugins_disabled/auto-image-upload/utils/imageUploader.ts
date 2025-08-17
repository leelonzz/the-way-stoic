import {SanityClient} from '@sanity/client'

/**
 * Downloads an image from an external URL and uploads it to Sanity
 */
export async function uploadExternalImage(
  url: string,
  client: SanityClient,
  filename?: string
): Promise<{_id: string; url: string} | null> {
  try {
    // Fetch the image from the external URL
    const response = await fetch(url)
    
    if (!response.ok) {
      console.error('Failed to fetch image:', response.statusText)
      return null
    }

    // Get the image as a blob
    const blob = await response.blob()
    
    // Determine filename from URL or use provided one
    const imageName = filename || getFilenameFromUrl(url) || `image-${Date.now()}.jpg`
    
    // Create a File object from the blob
    const file = new File([blob], imageName, { type: blob.type || 'image/jpeg' })
    
    // Upload to Sanity
    const asset = await client.assets.upload('image', file, {
      filename: imageName,
      source: {
        name: 'auto-image-upload',
        url: url
      }
    })
    
    console.log('Successfully uploaded image:', asset._id)
    
    return {
      _id: asset._id,
      url: asset.url
    }
  } catch (error) {
    console.error('Error uploading external image:', error)
    return null
  }
}

/**
 * Checks if a string is a valid image URL
 */
export function isImageUrl(url: string): boolean {
  try {
    const urlObj = new URL(url)
    
    // Check for common image extensions
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp']
    const hasImageExtension = imageExtensions.some(ext => 
      urlObj.pathname.toLowerCase().endsWith(ext)
    )
    
    // Check for Google-specific image URLs
    const isGoogleImage = 
      urlObj.hostname.includes('googleusercontent.com') ||
      urlObj.hostname.includes('googleapis.com') ||
      urlObj.hostname.includes('ggpht.com')
    
    // Check for other common image hosting services
    const isImageService = 
      urlObj.hostname.includes('imgur.com') ||
      urlObj.hostname.includes('cloudinary.com') ||
      urlObj.hostname.includes('unsplash.com') ||
      urlObj.hostname.includes('pexels.com')
    
    return hasImageExtension || isGoogleImage || isImageService
  } catch {
    return false
  }
}

/**
 * Extracts a filename from a URL
 */
function getFilenameFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url)
    const pathname = urlObj.pathname
    const filename = pathname.split('/').pop()
    
    // If filename has an extension, return it
    if (filename && filename.includes('.')) {
      return filename
    }
    
    // For Google URLs, generate a name
    if (urlObj.hostname.includes('googleusercontent.com')) {
      return `google-image-${Date.now()}.jpg`
    }
    
    return null
  } catch {
    return null
  }
}

/**
 * Validates if URL is accessible (CORS-friendly check)
 */
export async function isUrlAccessible(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD', mode: 'no-cors' })
    // In no-cors mode, we can't check status, but if fetch doesn't throw, URL exists
    return true
  } catch {
    // Try with a regular GET request as fallback
    try {
      const response = await fetch(url)
      return response.ok
    } catch {
      return false
    }
  }
}
