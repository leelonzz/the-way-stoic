import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Stoic Mentors - Learn from Ancient Philosophers | The Stoic Way',
  description:
    'Connect with the wisdom of Marcus Aurelius, Epictetus, Seneca, and other Stoic masters. Explore their teachings, life lessons, and philosophical guidance.',
  keywords: [
    'stoic mentors',
    'marcus aurelius',
    'epictetus',
    'seneca',
    'stoic philosophers',
    'ancient philosophy',
    'stoic masters',
    'philosophical guidance',
    'stoic teachings',
  ],
  openGraph: {
    title: 'Stoic Mentors - Learn from Ancient Philosophers',
    description:
      'Connect with the wisdom of Marcus Aurelius, Epictetus, Seneca, and other Stoic masters. Explore their teachings and philosophical guidance.',
    type: 'website',
    images: [
      {
        url: '/og-images/mentors.png',
        width: 1200,
        height: 630,
        alt: 'Stoic Mentors - Learn from Ancient Philosophers',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Stoic Mentors - Learn from Ancient Philosophers',
    description:
      'Connect with the wisdom of Marcus Aurelius, Epictetus, Seneca, and other Stoic masters.',
    images: ['/og-images/mentors.png'],
  },
  alternates: {
    canonical: 'https://thewaystoic.site/mentors',
  },
}

export default function MentorsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
