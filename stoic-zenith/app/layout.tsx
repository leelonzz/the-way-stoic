import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Inknut_Antiqua, Inika } from 'next/font/google'
import './globals.css'
import { ClientProviders } from '@/components/providers/ClientProviders'

const inknutAntiqua = Inknut_Antiqua({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-inknut-antiqua',
})

const inika = Inika({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-inika',
})


export const metadata: Metadata = {
  title: 'The Stoic Way - Philosophy for Daily Life',
  description:
    'Transform your daily practice with ancient Stoic wisdom. Build resilience, find clarity, and cultivate inner strength through guided reflection and timeless teachings.',
  generator: 'v0.dev',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/images/logo-icon.png', type: 'image/png', sizes: '32x32' },
    ],
    apple: '/images/logo-icon.png',
    shortcut: '/favicon.ico',
  },
  openGraph: {
    title: 'The Stoic Way - Philosophy for Daily Life',
    description: 'Transform your daily practice with ancient Stoic wisdom. Build resilience, find clarity, and cultivate inner strength through guided reflection and timeless teachings.',
    url: 'https://thewaystoic.site',
    siteName: 'The Stoic Way',
    images: [
      {
        url: '/images/logo-icon.png',
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
    description: 'Transform your daily practice with ancient Stoic wisdom. Build resilience, find clarity, and cultivate inner strength through guided reflection and timeless teachings.',
    images: ['/images/logo-icon.png'],
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
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inknut+Antiqua:wght@300;400;500;600;700&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inika:wght@400;700&display=swap"
        />
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
  --font-inknut-antiqua: ${inknutAntiqua.style.fontFamily};
  --font-inika: ${inika.style.fontFamily};
}
        `}</style>
      </head>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} ${inknutAntiqua.variable} ${inika.variable}`}
      >
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  )
}
