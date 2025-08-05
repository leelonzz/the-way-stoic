import React from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useQuotes } from '@/hooks/useQuotes'
import { useAuthContext } from '@/components/auth/AuthProvider'

function HomePage(): JSX.Element {
  const { user } = useAuthContext()
  const { getDailyQuote, loading, debugCacheStatus } = useQuotes(user)
  
  const currentHour = new Date().getHours()
  const greeting =
    currentHour < 12
      ? 'Good Morning'
      : currentHour < 17
        ? 'Good Afternoon'
        : 'Good Evening'

  const dailyQuote = getDailyQuote()

  return (
    <div className="min-h-screen p-6" style={{ background: 'transparent' }}>
      {/* Main Container - Removed background */}
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1
            className="text-6xl font-inknut font-normal"
            style={{ color: '#100804' }}
          >
            {greeting}
          </h1>
          
        </div>

        {/* Quote Section */}
        <Card
          className="rounded-[36px] shadow-lg transition-all duration-300 hover:shadow-xl"
          style={{
            backgroundColor: '#f4eee6',
          }}
        >
          <CardContent className="py-8 px-12 text-center">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone"></div>
              </div>
            ) : dailyQuote ? (
              <>
                <blockquote
                  className="text-2xl font-inknut font-extrabold leading-[1.4] mb-4"
                  style={{ color: '#100804' }}
                >
                  &ldquo;{dailyQuote.text}&rdquo;
                </blockquote>
                <p
                  className="text-lg font-inknut font-normal"
                  style={{ color: '#100804' }}
                >
                  — {dailyQuote.author}
                  {dailyQuote.source && (
                    <span className="text-base opacity-75 ml-2">({dailyQuote.source})</span>
                  )}
                </p>
              </>
            ) : null}
          </CardContent>
        </Card>

        {/* Main Cards Grid - 3 cards layout with warping */}
        <div className="grid grid-cols-2 gap-6 h-[520px]">
          {/* Journal Card - Top Left */}
          <Card
            className="rounded-[27px] shadow-lg cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105"
            style={{
              backgroundColor: '#8FB069',
            }}
            onClick={() => (window.location.href = '/journal')}
          >
            <CardContent className="p-8 h-full flex flex-col justify-center items-center text-center">
              <div
                className="text-8xl font-inknut font-normal mb-2"
                style={{ color: '#100804' }}
              >
                7
              </div>
              <div
                className="text-3xl font-inknut font-normal"
                style={{ color: '#100804' }}
              >
                Journal
              </div>
              <div
                className="text-lg font-sans font-normal"
                style={{ color: '#000000' }}
              >
                daily
              </div>
            </CardContent>
          </Card>

          {/* Seek Wisdom Card - Spans right side (2 rows) */}
          <Card
            className="rounded-3xl shadow-lg row-span-2 relative overflow-hidden transition-all duration-300 hover:shadow-xl"
            style={{
              backgroundColor: '#f4eee6',
            }}
          >
            <CardContent className="p-8 h-full flex flex-col">
              <div className="text-center mb-6">
                <h2
                  className="text-6xl font-inknut font-medium leading-tight"
                  style={{ color: '#100804' }}
                >
                  Seek
                  <br />
                  Wisdom
                </h2>
              </div>

              {/* Philosopher Image */}
              <div className="flex-1 flex justify-center items-center mb-6">
                <div className="w-48 h-56 relative transition-transform duration-300 hover:scale-110">
                  <Image
                    src="/images/philosopher-image.png"
                    alt="Ancient philosopher"
                    fill
                    className="object-cover rounded-2xl"
                  />
                </div>
              </div>

              {/* Chat Button */}
              <div className="text-center">
                <Button
                  className="text-white font-inknut font-medium text-2xl px-12 py-5 rounded-full shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl"
                  style={{
                    backgroundColor: '#887d4e',
                  }}
                  onClick={() => (window.location.href = '/mentors')}
                >
                  Chat
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Start Your Day Card - Bottom Left */}
          <Card
            className="rounded-[27px] shadow-lg cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105"
            style={{
              backgroundColor: '#f4eee6',
            }}
            onClick={() => (window.location.href = '/journal')}
          >
            <CardContent className="p-8 h-full flex flex-col justify-between items-center">
              {/* Feather Icon */}
              <div className="w-16 h-16 flex items-center justify-center mb-4 transition-transform duration-300 hover:rotate-12">
                <Image
                  src="/images/feather-icon.svg"
                  alt="Feather icon"
                  width={64}
                  height={64}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Start Your Day Button */}
              <div>
                <Button
                  className="text-white font-inknut font-black text-lg px-8 py-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl"
                  style={{
                    backgroundColor: '#887d4e',
                  }}
                  onClick={e => {
                    e.stopPropagation()
                    window.location.href = '/journal'
                  }}
                >
                  Start your day
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default React.memo(HomePage)
