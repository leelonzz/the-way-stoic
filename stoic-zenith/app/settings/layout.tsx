import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Account Settings - Manage Your Preferences | The Stoic Way',
  description:
    'Manage your account settings, preferences, and subscription. Customize your Stoic journey with personalized options for quotes, journal, and learning path.',
  keywords: [
    'account settings',
    'user preferences',
    'profile management',
    'subscription settings',
    'stoic app settings',
    'customization',
  ],
  openGraph: {
    title: 'Account Settings - Manage Your Preferences',
    description:
      'Manage your account settings and customize your Stoic journey with personalized options.',
    type: 'website',
    images: [
      {
        url: '/og-images/settings.png',
        width: 1200,
        height: 630,
        alt: 'Account Settings - Manage Your Preferences',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Account Settings - Manage Your Preferences',
    description:
      'Manage your account settings and customize your Stoic journey.',
    images: ['/og-images/settings.png'],
  },
  alternates: {
    canonical: 'https://thewaystoic.site/settings',
  },
}

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
