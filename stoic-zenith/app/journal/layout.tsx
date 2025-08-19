import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Personal Journal - Stoic Reflection & Growth | The Stoic Way',
  description:
    'Practice daily reflection with your private Stoic journal. Write your thoughts, track progress, and develop wisdom through mindful journaling and self-examination.',
  keywords: [
    'stoic journal',
    'daily reflection',
    'stoic diary',
    'philosophy journal',
    'mindfulness journal',
    'self-examination',
    'personal growth',
    'stoic practices',
  ],
  openGraph: {
    title: 'Personal Journal - Stoic Reflection & Growth',
    description:
      'Practice daily reflection with your private Stoic journal. Write your thoughts, track progress, and develop wisdom through mindful journaling.',
    type: 'website',
    images: [
      {
        url: '/og-images/journal.png',
        width: 1200,
        height: 630,
        alt: 'Personal Journal - Stoic Reflection & Growth',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Personal Journal - Stoic Reflection & Growth',
    description: 'Practice daily reflection with your private Stoic journal.',
    images: ['/og-images/journal.png'],
  },
  alternates: {
    canonical: 'https://thewaystoic.site/journal',
  },
}

export default function JournalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
