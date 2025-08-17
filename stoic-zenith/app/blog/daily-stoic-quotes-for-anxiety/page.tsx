import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Daily Stoic Quotes for Anxiety Relief',
  description: 'Discover daily Stoic quotes for anxiety. Learn how ancient Stoic philosophy helps manage stress and find peace. Transform your anxiety with timeless wisdom today.',
  alternates: { canonical: 'https://yourdomain/blog/daily-stoic-quotes-for-anxiety' },
  openGraph: {
    type: 'article',
    title: 'Daily Stoic Quotes for Anxiety Relief',
    description: 'Discover daily Stoic quotes for anxiety. Learn how ancient Stoic philosophy helps manage stress and find peace. Transform your anxiety with timeless wisdom today.',
    url: 'https://yourdomain/blog/daily-stoic-quotes-for-anxiety',
    siteName: 'The Stoic Way',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Daily Stoic Quotes for Anxiety Relief',
    description: 'Discover daily Stoic quotes for anxiety. Learn how ancient Stoic philosophy helps manage stress and find peace. Transform your anxiety with timeless wisdom today.'
  },
}

export default function DailyStoicQuotesForAnxietyPage() {
  // Redirect to the dynamic blog post system
  redirect('/blog')
}
