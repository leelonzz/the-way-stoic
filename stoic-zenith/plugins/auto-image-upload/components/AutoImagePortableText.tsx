'use client'

import React, {useCallback} from 'react'
import {PortableTextEditor, usePortableTextEditor} from '@sanity/portable-text-editor'
import {useClient} from 'sanity'
import {uploadExternalImage, isImageUrl} from '../utils/imageUploader'
import {ArrayOfObjectsInputProps, insert, set} from 'sanity'

export function AutoImagePortableText(props: ArrayOfObjectsInputProps) {
  const client = useClient({apiVersion: '2024-01-01'})
  const editor = usePortableTextEditor()

  const handlePaste = useCallback(async (event: React.ClipboardEvent) => {
    const text = event.clipboardData.getData('text/plain')
    
    // Check if the pasted text is an image URL
    if (text && isImageUrl(text)) {
      event.preventDefault()
      event.stopPropagation()
      
      // Show loading state (you might want to add a toast notification here)
      console.log('Detected image URL, uploading to Sanity...')
      
      try {
        // Upload the external image to Sanity
        const uploadedAsset = await uploadExternalImage(text, client)
        
        if (uploadedAsset) {
          // Create an image block with the uploaded asset
          const imageBlock = {
            _type: 'image',
            _key: `image-${Date.now()}`,
            asset: {
              _type: 'reference',
              _ref: uploadedAsset._id
            },
            alt: 'Uploaded image'
          }
          
          // Insert the image block into the portable text
          const currentValue = props.value || []
          const path = props.path
          
          // Find the insertion point (at the end of the array)
          const insertPosition = currentValue.length
          
          // Use Sanity's insert mutation
          props.onChange(insert([imageBlock], 'after', [insertPosition - 1]))
          
          console.log('Image successfully uploaded and inserted!')
        } else {
          console.error('Failed to upload image')
          // You might want to show an error toast here
        }
      } catch (error) {
        console.error('Error processing image URL:', error)
        // You might want to show an error toast here
      }
    }
  }, [client, props])

  // Get the default renderDefault function
  const {renderDefault} = props

  // Wrap the default component with our paste handler
  return (
    <div onPaste={handlePaste}>
      {renderDefault(props)}
    </div>
  )
}
