import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Everything You Need to Know About Stoicism: A Complete Guide to Ancient Wisdom for Modern Life',
  description: 'Discover everything about Stoicism - from ancient origins to modern applications. Learn practical Stoic principles, exercises, and how this philosophy can transform your life today.',
  alternates: { canonical: 'https://yourdomain/blog/stoicism-complete-guide' },
  openGraph: {
    type: 'article',
    title: 'Everything You Need to Know About Stoicism: A Complete Guide to Ancient Wisdom for Modern Life',
    description: 'Discover everything about Stoicism - from ancient origins to modern applications. Learn practical Stoic principles, exercises, and how this philosophy can transform your life today.',
    url: 'https://yourdomain/blog/stoicism-complete-guide',
    siteName: 'The Stoic Way',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Everything You Need to Know About Stoicism: A Complete Guide to Ancient Wisdom for Modern Life',
    description: 'Discover everything about Stoicism - from ancient origins to modern applications. Learn practical Stoic principles, exercises, and how this philosophy can transform your life today.'
  },
}

export default function StoicismCompleteGuidePage() {
  // Redirect to the dynamic blog post system
  redirect('/blog')
}