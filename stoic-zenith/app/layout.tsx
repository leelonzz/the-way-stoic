import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Inknut_Antiqua, Inika, Poppins } from 'next/font/google'
import './globals.css'
import { ClientProviders } from '@/components/providers/ClientProviders'
import { ConditionalHeader } from '@/components/layout/ConditionalHeader'
import { MainContent } from '@/components/layout/MainContent'

const inknutAntiqua = Inknut_Antiqua({
  subsets: ['latin'],
  weight: ['400', '600'], // Reduced weights for faster loading
  variable: '--font-inknut-antiqua',
  display: 'swap', // Fast text rendering
})

const inika = Inika({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-inika',
  display: 'swap',
})

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '600'], // Reduced weights for faster loading
  variable: '--font-poppins',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://thewaystoic.site'),
  title: 'The Stoic Way - Philosophy for Daily Life',
  description:
    'Transform your daily practice with ancient Stoic wisdom. Build resilience, find clarity, and cultivate inner strength through guided reflection and timeless teachings.',
  generator: 'v0.dev',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16.png', type: 'image/png', sizes: '16x16' },
      { url: '/favicon-32.png', type: 'image/png', sizes: '32x32' },
    ],
    apple: '/apple-touch-icon.png',
    shortcut: '/favicon.ico',
  },
  openGraph: {
    title: 'The Stoic Way - Philosophy for Daily Life',
    description:
      'Transform your daily practice with ancient Stoic wisdom. Build resilience, find clarity, and cultivate inner strength through guided reflection and timeless teachings.',
    url: 'https://thewaystoic.site',
    siteName: 'The Stoic Way',
    images: [
      {
        url: '/apple-touch-icon.png',
        width: 1200,
        height: 630,
        alt: 'The Stoic Way - Philosophy for Daily Life',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Stoic Way - Philosophy for Daily Life',
    description:
      'Transform your daily practice with ancient Stoic wisdom. Build resilience, find clarity, and cultivate inner strength through guided reflection and timeless teachings.',
    images: ['/apple-touch-icon.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code', // Replace with actual verification code
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>): JSX.Element {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="icon" href="/logo-icon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/logo-icon.png" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="manifest" href="/manifest.json" />
        <link
          rel="alternate"
          type="application/rss+xml"
          title="The Stoic Way - Blog RSS Feed"
          href="/api/rss"
        />
        <style>{`
html {
  font-family: ${inknutAntiqua.style.fontFamily}, serif;
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
  --font-inknut-antiqua: ${inknutAntiqua.style.fontFamily};
  --font-inika: ${inika.style.fontFamily};
  --font-poppins: ${poppins.style.fontFamily};
}
        `}</style>
      </head>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} ${inknutAntiqua.variable} ${inika.variable} ${poppins.variable}`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                '@context': 'https://schema.org',
                '@type': 'Organization',
                '@id': 'https://thewaystoic.site/#organization',
                name: 'The Stoic Way',
                url: 'https://thewaystoic.site',
                logo: {
                  '@type': 'ImageObject',
                  '@id': 'https://thewaystoic.site/#logo',
                  url: 'https://thewaystoic.site/logo-icon.png',
                  contentUrl: 'https://thewaystoic.site/logo-icon.png',
                  width: 512,
                  height: 512,
                  caption: 'The Stoic Way Logo',
                },
                image: {
                  '@type': 'ImageObject',
                  url: 'https://thewaystoic.site/apple-touch-icon.png',
                  width: 180,
                  height: 180,
                },
                description:
                  'Transform your daily practice with ancient Stoic wisdom. Build resilience, find clarity, and cultivate inner strength through guided reflection and timeless teachings.',
                foundingDate: '2024',
                sameAs: [],
                contactPoint: {
                  '@type': 'ContactPoint',
                  contactType: 'customer support',
                  url: 'https://thewaystoic.site/support',
                },
              },
              {
                '@context': 'https://schema.org',
                '@type': 'WebSite',
                '@id': 'https://thewaystoic.site/#website',
                url: 'https://thewaystoic.site',
                name: 'The Stoic Way',
                description:
                  'Transform your daily practice with ancient Stoic wisdom. Build resilience, find clarity, and cultivate inner strength through guided reflection and timeless teachings.',
                publisher: {
                  '@id': 'https://thewaystoic.site/#organization',
                },
                inLanguage: 'en-US',
                potentialAction: [
                  {
                    '@type': 'SearchAction',
                    target: {
                      '@type': 'EntryPoint',
                      urlTemplate:
                        'https://thewaystoic.site/quotes?search={search_term_string}',
                    },
                    'query-input': 'required name=search_term_string',
                  },
                ],
              },
              {
                '@context': 'https://schema.org',
                '@type': 'WebApplication',
                '@id': 'https://thewaystoic.site/#webapp',
                name: 'The Stoic Way',
                url: 'https://thewaystoic.site',
                description:
                  'A comprehensive Stoic philosophy app for daily practice, journaling, and wisdom cultivation.',
                applicationCategory: 'LifestyleApplication',
                operatingSystem: 'Web Browser',
                offers: {
                  '@type': 'Offer',
                  price: '0',
                  priceCurrency: 'USD',
                },
                publisher: {
                  '@id': 'https://thewaystoic.site/#organization',
                },
                featureList: [
                  'Daily Stoic quotes and wisdom',
                  'Personal journaling with Stoic prompts',
                  'Life calendar and memento mori visualization',
                  'Learn from ancient Stoic mentors',
                  'Track personal growth and insights',
                ],
              },
            ]),
          }}
        />
        <ClientProviders>
          <ConditionalHeader />
          <MainContent>{children}</MainContent>
        </ClientProviders>
      </body>
    </html>
  )
}
