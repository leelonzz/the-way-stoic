'use client'

import { useState } from 'react'

interface YouTubeEmbedProps {
  videoUrl: string
  title?: string
  className?: string
}

/**
 * Extracts YouTube video ID from various YouTube URL formats
 */
function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
  ]
  
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) {
      return match[1]
    }
  }
  
  return null
}

/**
 * Responsive YouTube video embed component
 * Embeds videos directly without redirecting to YouTube
 */
export function YouTubeEmbed({ videoUrl, title = 'Video', className = '' }: YouTubeEmbedProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  
  const videoId = extractVideoId(videoUrl)
  
  if (!videoId) {
    return (
      <div className={`bg-gray-100 rounded-lg p-8 text-center ${className}`}>
        <p className="text-gray-600 font-poppins">Invalid YouTube URL provided</p>
      </div>
    )
  }
  
  const embedUrl = `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&showinfo=0`
  
  const handleLoad = () => {
    setIsLoading(false)
  }
  
  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
  }
  
  if (hasError) {
    return (
      <div className={`bg-gray-100 rounded-lg p-8 text-center ${className}`}>
        <p className="text-gray-600 font-poppins">Unable to load video</p>
        <a 
          href={videoUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 underline mt-2 inline-block font-poppins"
        >
          Watch on YouTube
        </a>
      </div>
    )
  }
  
  return (
    <div className={`relative w-full ${className}`}>
      {/* Responsive aspect ratio container */}
      <div className="relative w-full h-0 pb-[56.25%] bg-gray-100 rounded-lg overflow-hidden shadow-lg">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="flex flex-col items-center space-y-3">
              <div className="w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-gray-600 font-poppins">Loading video...</p>
            </div>
          </div>
        )}
        
        <iframe
          src={embedUrl}
          title={title}
          className="absolute top-0 left-0 w-full h-full"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
        />
      </div>
      
      {/* Video caption/title */}
      {title && (
        <p className="mt-3 text-sm text-gray-600 text-center font-poppins font-light">
          {title}
        </p>
      )}
    </div>
  )
}
