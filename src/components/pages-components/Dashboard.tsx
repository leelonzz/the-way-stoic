import React from 'react'
import { BookOpen, Brain, Quote, Calendar, Sparkles } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useQuotes } from '@/hooks/useQuotes'
import { useAuthContext } from '@/components/auth/AuthProvider'

import { GetServerSideProps } from 'next'

export const getServerSideProps: GetServerSideProps = async _context => {
  // Perform any server-side logic here
  return { props: {} }
}

export default function Dashboard(): JSX.Element {
  const { user } = useAuthContext()
  const { getDailyQuote, loading } = useQuotes(user)

  const currentHour = new Date().getHours()
  const _isEvening = currentHour >= 17

  const dailyQuote = getDailyQuote()

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-1">
        <h1 className="text-3xl font-serif font-bold text-stone">
          {currentHour < 12
            ? 'Good Morning'
            : currentHour < 17
              ? 'Good Afternoon'
              : 'Good Evening'}
        </h1>
        <p className="text-sage text-base">
          &ldquo;Every new beginning comes from some other beginning&apos;s
          end.&rdquo;
        </p>
      </div>

      {/* Daily Quote */}
      <Card className="bg-gradient-to-br from-parchment/60 to-terra-cotta/10 border-primary/20">
        <CardHeader className="text-center pb-3">
          <CardTitle className="flex items-center justify-center gap-2 text-xl font-serif text-stone">
            <Sparkles className="w-5 h-5 text-primary" />
            Today&apos;s Quote
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {loading ? (
            <div className="text-center space-y-3">
              <div className="animate-pulse">
                <div className="h-6 bg-stone/20 rounded mb-2"></div>
                <div className="h-4 bg-stone/20 rounded w-1/3 mx-auto"></div>
              </div>
            </div>
          ) : dailyQuote ? (
            <div className="text-center space-y-3">
              <blockquote className="text-lg font-serif italic text-stone leading-relaxed">
                &ldquo;{dailyQuote.text}&rdquo;
              </blockquote>
              <div>
                <p className="font-semibold text-crail text-sm">
                  — {dailyQuote.author}
                </p>
                {dailyQuote.source && (
                  <p className="text-xs text-sage">{dailyQuote.source}</p>
                )}
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <BookOpen className="w-6 h-6 text-primary" />
              <div>
                <p className="text-xl font-bold text-stone">7</p>
                <p className="text-xs text-sage">Journal Streak</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Brain className="w-6 h-6 text-primary" />
              <div>
                <p className="text-xl font-bold text-stone">3</p>
                <p className="text-xs text-sage">Mentor Chats</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Quote className="w-6 h-6 text-primary" />
              <div>
                <p className="text-xl font-bold text-stone">15</p>
                <p className="text-xs text-sage">Daily Quotes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Calendar className="w-6 h-6 text-primary" />
              <div>
                <p className="text-xl font-bold text-stone">5</p>
                <p className="text-xs text-sage">Calendar Views</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Action */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookOpen className="w-4 h-4 text-primary" />
              Daily Reflection
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <p className="text-sage text-sm">
                Take a moment to reflect on your day and practice Stoic
                principles.
              </p>
              <Link href="/journal">
                <Button className="w-full bg-primary hover:bg-primary/90 text-sm">
                  Start Journaling
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="bg-white/90 backdrop-blur-sm border border-sage/20 rounded-lg p-6">
            <h3 className="text-lg font-serif font-semibold text-stone mb-3">
              Today&apos;s Focus
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-parchment/80 rounded-lg">
                <h4 className="font-medium text-stone mb-1 text-sm">
                  Stoic Practice
                </h4>
                <p className="text-sage text-xs">
                  Focus on the dichotomy of control. What is within your
                  influence today, and what lies beyond it?
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  className="flex-1 bg-primary hover:bg-primary/90 text-white text-sm"
                  onClick={() => (window.location.href = '/mentors')}
                >
                  <Brain className="w-3 h-3 mr-1" />
                  Seek Wisdom
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-sage/30 hover:bg-parchment/50 text-sm"
                  onClick={() => (window.location.href = '/calendar')}
                >
                  <Calendar className="w-3 h-3 mr-1" />
                  Memento Mori
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
