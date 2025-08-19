import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Memento Mori Calendar - Life Visualization Tool | The Stoic Way',
  description:
    'Visualize your life in weeks with our Memento Mori calendar. Track time, set intentions, and remember the preciousness of each moment through Stoic wisdom.',
  keywords: [
    'memento mori',
    'life calendar',
    'time visualization',
    'stoic calendar',
    'mortality reminder',
    'life planning',
    'time awareness',
    'stoic practices',
  ],
  openGraph: {
    title: 'Memento Mori Calendar - Life Visualization Tool',
    description:
      'Visualize your life in weeks with our Memento Mori calendar. Track time and remember the preciousness of each moment.',
    type: 'website',
    images: [
      {
        url: '/og-images/calendar.png',
        width: 1200,
        height: 630,
        alt: 'Memento Mori Calendar - Life Visualization Tool',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Memento Mori Calendar - Life Visualization Tool',
    description: 'Visualize your life in weeks with our Memento Mori calendar.',
    images: ['/og-images/calendar.png'],
  },
  alternates: {
    canonical: 'https://thewaystoic.site/calendar',
  },
}

export default function CalendarLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
