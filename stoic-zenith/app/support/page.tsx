'use client'

import {
  ArrowLeft,
  MessageCircle,
  BookOpen,
  Star,
  TrendingUp,
  MessageSquare,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'

export default function SupportPage(): JSX.Element {
  return (
    <div className="min-h-screen bg-parchment">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-12">
          <Link href="/">
            <Button variant="ghost" className="mb-6 text-stone hover:text-ink">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>

          <div className="text-center">
            <h1 className="text-5xl font-bold text-ink mb-4">Help & Support</h1>
          </div>
        </div>

        {/* Main Support Options */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {/* Ask the Community */}
          <Card className="bg-white/60 backdrop-blur-sm border-stone/20 hover:shadow-lg transition-all duration-300 group cursor-pointer">
            <CardContent className="p-8 text-center">
              <div className="bg-indigo-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-indigo-200 transition-colors">
                <MessageCircle className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-ink mb-4">
                Ask the Community
              </h3>
              <p className="text-stone text-sm leading-relaxed">
                Join our Discord to get help from other users and the team.
              </p>
            </CardContent>
          </Card>

          {/* Help Center */}
          <Card className="bg-white/60 backdrop-blur-sm border-stone/20 hover:shadow-lg transition-all duration-300 group cursor-pointer">
            <CardContent className="p-8 text-center">
              <div className="bg-green-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-green-200 transition-colors">
                <BookOpen className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-ink mb-4">Help Center</h3>
              <p className="text-stone text-sm leading-relaxed">
                Browse FAQs, guides, and troubleshooting articles.
              </p>
            </CardContent>
          </Card>

          {/* Premium Support */}
          <Card className="bg-white/60 backdrop-blur-sm border-stone/20 hover:shadow-lg transition-all duration-300 group cursor-pointer">
            <CardContent className="p-8 text-center">
              <div className="bg-amber-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-amber-200 transition-colors">
                <Star className="h-8 w-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-ink mb-4">
                Premium Support
              </h3>
              <p className="text-stone text-sm leading-relaxed">
                Get priority support from our expert team.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Get Involved Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-ink text-center mb-12">
            Get involved
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Product Changelog */}
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="bg-blue-100 w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-ink mb-2">
                    Product Changelog
                  </h3>
                  <p className="text-stone text-sm mb-4 leading-relaxed">
                    News from the Stoic Zenith engineering team.
                  </p>
                  <Link
                    href="#"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium inline-flex items-center"
                  >
                    Stoic Zenith Changelog →
                  </Link>
                </div>
              </div>
            </div>

            {/* Feature Requests */}
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="bg-purple-100 w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-ink mb-2">
                    Feature requests
                  </h3>
                  <p className="text-stone text-sm mb-4 leading-relaxed">
                    Have an idea? Share it and let the community vote!
                  </p>
                  <Link
                    href="#"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium inline-flex items-center"
                  >
                    Stoic Zenith Feedback →
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Affiliate Program */}
          <div className="mt-12">
            <div className="flex items-start space-x-4">
              <div className="bg-green-100 w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
                <Zap className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-ink mb-2">
                  Affiliate program
                </h3>
                <p className="text-stone text-sm mb-4 leading-relaxed">
                  Earn rewards while helping shape the future of Stoic
                  philosophy practice.
                </p>
                <Link
                  href="#"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium inline-flex items-center"
                >
                  Stoic Zenith Affiliates →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
