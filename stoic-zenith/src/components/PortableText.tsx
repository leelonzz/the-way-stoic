import Image from 'next/image'
import Link from 'next/link'
import { urlFor } from '@/lib/sanity.image'

// Simple Portable Text renderer without external dependencies
interface Block {
  _type: string
  _key: string
  style?: string
  children?: Array<{
    _type: string
    _key: string
    text?: string
    marks?: string[]
  }>
}

interface ImageBlock {
  _type: 'image'
  _key: string
  asset: {
    _ref: string
  }
  alt?: string
}

interface PortableTextProps {
  value: Array<Block | ImageBlock>
  className?: string
}

export function PortableText({ value, className = '' }: PortableTextProps) {
  if (!value || !Array.isArray(value)) {
    return null
  }

  return (
    <div className={`prose prose-neutral max-w-none prose-headings:font-bold prose-h1:text-4xl prose-h1:mt-8 prose-h1:mb-8 prose-h1:text-gray-900 prose-h2:text-3xl prose-h2:mt-10 prose-h2:mb-6 prose-h2:text-gray-900 prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4 prose-h3:text-gray-800 prose-p:mb-6 prose-p:leading-relaxed prose-p:text-gray-700 prose-strong:font-semibold prose-em:italic prose-ol:my-6 prose-ul:my-6 prose-li:mb-2 prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-gray-600 prose-blockquote:bg-gray-50 prose-blockquote:py-4 prose-blockquote:my-6 ${className}`} style={{ fontFamily: 'Inknut Antiqua, serif' }}>
      {value.map((block) => {
        if (block._type === 'image') {
          const imageBlock = block as ImageBlock
          const imageUrl = urlFor(imageBlock).width(800).height(600).url()
          
          return (
            <div key={block._key} className="my-8">
              <Image
                src={imageUrl}
                alt={imageBlock.alt || 'Blog image'}
                width={800}
                height={600}
                className="rounded-lg shadow-lg object-cover"
              />
              {imageBlock.alt && (
                <p className="text-sm text-gray-600 mt-2 text-center italic">
                  {imageBlock.alt}
                </p>
              )}
            </div>
          )
        }

        if (block._type === 'block') {
          const textBlock = block as Block
          return renderBlock(textBlock)
        }

        return null
      })}
    </div>
  )
}

function renderBlock(block: Block) {
  const { style = 'normal', children = [] } = block

  const text = children.map((child, index) => {
    if (!child.text) return null

    let element = <span key={index}>{child.text}</span>

    if (child.marks) {
      child.marks.forEach((mark) => {
        switch (mark) {
          case 'strong':
            element = <strong key={`${index}-strong`}>{element}</strong>
            break
          case 'em':
            element = <em key={`${index}-em`}>{element}</em>
            break
          case 'code':
            element = (
              <code 
                key={`${index}-code`}
                className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono"
              >
                {element}
              </code>
            )
            break
        }
      })
    }

    return element
  })

  switch (style) {
    case 'h1':
      return <h1 key={block._key} className="text-4xl md:text-5xl font-bold mt-12 mb-8 text-gray-900" style={{ fontFamily: 'Inknut Antiqua, serif' }}>{text}</h1>
    case 'h2':
      return <h2 key={block._key} className="text-3xl font-bold mt-12 mb-8 text-gray-900" style={{ fontFamily: 'Inknut Antiqua, serif' }}>{text}</h2>
    case 'h3':
      return <h3 key={block._key} className="text-xl font-bold mt-8 mb-6 text-gray-800" style={{ fontFamily: 'Inknut Antiqua, serif' }}>{text}</h3>
    case 'h4':
      return <h4 key={block._key} className="text-lg font-bold mt-6 mb-4 text-gray-800" style={{ fontFamily: 'Inknut Antiqua, serif' }}>{text}</h4>
    case 'blockquote':
      return (
        <blockquote key={block._key} className="border-l-4 border-black pl-6 italic text-gray-700 py-6 my-8 text-xl leading-relaxed">
          {text}
        </blockquote>
      )
    default:
      return <p key={block._key} className="text-lg leading-relaxed text-gray-700 mb-6">{text}</p>
  }
}