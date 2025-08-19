import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Stoic Quotes - Daily Wisdom Library | The Stoic Way',
  description:
    'Discover timeless Stoic quotes from Marcus Aurelius, Epictetus, and Seneca. Build your daily wisdom practice with curated quotes, favorites, and personal collections.',
  keywords: [
    'stoic quotes',
    'marcus aurelius quotes',
    'epictetus quotes',
    'seneca quotes',
    'stoic wisdom',
    'daily quotes',
    'philosophy quotes',
    'ancient wisdom',
  ],
  openGraph: {
    title: 'Stoic Quotes - Daily Wisdom Library',
    description:
      'Discover timeless Stoic quotes from Marcus Aurelius, Epictetus, and Seneca. Build your daily wisdom practice with curated quotes, favorites, and personal collections.',
    type: 'website',
    images: [
      {
        url: '/og-images/quotes.png',
        width: 1200,
        height: 630,
        alt: 'Stoic Quotes - Daily Wisdom Library',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Stoic Quotes - Daily Wisdom Library',
    description:
      'Discover timeless Stoic quotes from Marcus Aurelius, Epictetus, and Seneca.',
    images: ['/og-images/quotes.png'],
  },
  alternates: {
    canonical: 'https://thewaystoic.site/quotes',
  },
}

export default function QuotesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
