import Image from 'next/image'
import { PlaceImage } from '@/types/place'

interface PlaceHeroProps {
  title: string
  description: string
  heroImage: PlaceImage
}

export function PlaceHero({ title, description, heroImage }: PlaceHeroProps) {
  return (
    <header className="mb-16">
      {/* Hero Image */}
      <div className="relative mb-8 rounded-lg overflow-hidden">
        <Image
          src={heroImage.src}
          alt={heroImage.alt}
          width={heroImage.width}
          height={heroImage.height}
          className="w-full h-[60vh] object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        {heroImage.caption && (
          <div className="absolute bottom-4 left-4 text-white">
            <p className="text-sm opacity-90">{heroImage.caption}</p>
          </div>
        )}
      </div>

      <div className="text-center mb-8">
        <h1
          className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
          style={{ fontFamily: 'Inknut Antiqua, serif' }}
        >
          {title}
        </h1>
        <p
          className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
          style={{ fontFamily: 'Poppins, sans-serif' }}
        >
          {description}
        </p>
      </div>
    </header>
  )
}
