import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Inknut_Antiqua, Inika, Poppins } from 'next/font/google'
import './globals.css'
import { ClientProviders } from '@/components/providers/ClientProviders'

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
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
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
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  )
}
