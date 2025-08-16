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
    <div className={`prose prose-lg prose-gray max-w-none ${className}`}>
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
                className="rounded-lg shadow-md"
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
      return <h1 key={block._key} className="text-4xl font-bold mt-12 mb-6">{text}</h1>
    case 'h2':
      return <h2 key={block._key} className="text-3xl font-semibold mt-10 mb-5">{text}</h2>
    case 'h3':
      return <h3 key={block._key} className="text-2xl font-semibold mt-8 mb-4">{text}</h3>
    case 'h4':
      return <h4 key={block._key} className="text-xl font-semibold mt-6 mb-3">{text}</h4>
    case 'blockquote':
      return (
        <blockquote key={block._key} className="border-l-4 border-blue-500 pl-6 my-6 italic text-lg text-gray-700">
          {text}
        </blockquote>
      )
    default:
      return <p key={block._key} className="mb-4 leading-relaxed">{text}</p>
  }
}