'use client'

import React, {useCallback, useState} from 'react'
import {useClient} from 'sanity'
import {uploadExternalImage, isImageUrl} from '../utils/imageUploader'
import {ArrayOfObjectsInputProps, insert, setIfMissing} from 'sanity'
import {Card, Stack, Text, Spinner, Badge} from '@sanity/ui'
import {CheckmarkIcon, ErrorOutlineIcon} from '@sanity/icons'

interface UploadStatus {
  isUploading: boolean
  message?: string
  type?: 'success' | 'error' | 'info'
}

export function AutoImagePortableTextEnhanced(props: ArrayOfObjectsInputProps) {
  const client = useClient({apiVersion: '2024-01-01'})
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({isUploading: false})

  const handlePaste = useCallback(async (event: React.ClipboardEvent) => {
    const text = event.clipboardData.getData('text/plain')
    
    // Check if the pasted text is an image URL
    if (text && isImageUrl(text)) {
      event.preventDefault()
      event.stopPropagation()
      
      // Set uploading status
      setUploadStatus({
        isUploading: true,
        message: 'Uploading image from URL...',
        type: 'info'
      })
      
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
          
          // Use Sanity's mutations to properly insert the image
          if (currentValue.length === 0) {
            // If array is empty, set initial value
            props.onChange(setIfMissing([]))
            props.onChange([imageBlock])
          } else {
            // Insert after the last item
            props.onChange(insert([imageBlock], 'after', [currentValue.length - 1]))
          }
          
          // Success status
          setUploadStatus({
            isUploading: false,
            message: 'Image uploaded successfully!',
            type: 'success'
          })
          
          // Clear success message after 3 seconds
          setTimeout(() => {
            setUploadStatus({isUploading: false})
          }, 3000)
        } else {
          // Error status
          setUploadStatus({
            isUploading: false,
            message: 'Failed to upload image. Please try uploading manually.',
            type: 'error'
          })
          
          // Clear error message after 5 seconds
          setTimeout(() => {
            setUploadStatus({isUploading: false})
          }, 5000)
        }
      } catch (error) {
        console.error('Error processing image URL:', error)
        
        // Error status with specific message
        let errorMessage = 'Failed to process image URL.'
        if (error instanceof Error) {
          if (error.message.includes('CORS')) {
            errorMessage = 'Image URL is blocked by CORS. Please download and upload manually.'
          } else if (error.message.includes('404')) {
            errorMessage = 'Image not found at the provided URL.'
          }
        }
        
        setUploadStatus({
          isUploading: false,
          message: errorMessage,
          type: 'error'
        })
        
        // Clear error message after 5 seconds
        setTimeout(() => {
          setUploadStatus({isUploading: false})
        }, 5000)
      }
    }
  }, [client, props])

  // IMPORTANT: Always use renderDefault to render the actual editor
  const {renderDefault} = props

  // Only show our UI additions if the field is for 'body'
  const showEnhancements = props.path[props.path.length - 1] === 'body'

  if (!showEnhancements) {
    return renderDefault(props)
  }

  return (
    <Stack space={3}>
      {/* Status notification */}
      {(uploadStatus.isUploading || uploadStatus.message) && (
        <Card 
          tone={uploadStatus.type === 'error' ? 'critical' : uploadStatus.type === 'success' ? 'positive' : 'primary'}
          padding={3}
          radius={2}
        >
          <Stack space={2}>
            <Badge 
              tone={uploadStatus.type === 'error' ? 'critical' : uploadStatus.type === 'success' ? 'positive' : 'primary'}
            >
              {uploadStatus.isUploading && (
                <>
                  <Spinner size={1} />
                  <Text size={1} weight="medium" style={{marginLeft: '8px'}}>
                    {uploadStatus.message}
                  </Text>
                </>
              )}
              {!uploadStatus.isUploading && uploadStatus.type === 'success' && (
                <>
                  <CheckmarkIcon />
                  <Text size={1} weight="medium" style={{marginLeft: '8px'}}>
                    {uploadStatus.message}
                  </Text>
                </>
              )}
              {!uploadStatus.isUploading && uploadStatus.type === 'error' && (
                <>
                  <ErrorOutlineIcon />
                  <Text size={1} weight="medium" style={{marginLeft: '8px'}}>
                    {uploadStatus.message}
                  </Text>
                </>
              )}
            </Badge>
          </Stack>
        </Card>
      )}
      
      {/* Wrap the default component with our paste handler */}
      <div onPaste={handlePaste}>
        {renderDefault(props)}
      </div>
      
      {/* Helper text */}
      <Card padding={2} tone="transparent">
        <Text size={1} muted>
          💡 Tip: You can paste image URLs directly (e.g., from Google Docs) and they'll be automatically uploaded
        </Text>
      </Card>
    </Stack>
  )
}
