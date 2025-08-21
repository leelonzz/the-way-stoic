import Image from 'next/image'
import { PlaceImage } from '@/types/place'

interface SectionImageProps {
  image: PlaceImage
  className?: string
}

export function SectionImage({ image, className = 'mb-6' }: SectionImageProps) {
  return (
    <div className={`relative rounded-lg overflow-hidden ${className}`}>
      <Image
        src={image.src}
        alt={image.alt}
        width={image.width}
        height={image.height}
        className="w-full h-64 object-cover"
        loading="lazy"
      />
      {image.caption && (
        <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
          {image.caption}
        </div>
      )}
    </div>
  )
}
