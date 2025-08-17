'use client'
export const dynamic = 'force-dynamic'

import React, { Suspense, useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { NavigationOptimizedCachedPage } from '@/components/layout/NavigationOptimizedCachedPage'
import { Calendar as CalendarIcon, BarChart3, Settings } from 'lucide-react'
import { useLifeCalendar } from '@/hooks/useLifeCalendar'
import { useAuthContext } from '@/components/auth/AuthProvider'
import { Skeleton } from '@/components/ui/skeleton'
import styled from 'styled-components'

import { LifeCalendarGrid } from '@/components/calendar/LifeCalendarGrid'
import { LifeCalendarSetup } from '@/components/calendar/LifeCalendarSetup'
import { MementoMoriInsights } from '@/components/calendar/MementoMoriInsights'

const StyledWrapper = styled.div`
  .tab-container {
    position: relative;
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 4px;
    background-color: #dadadb;
    border-radius: 9px;
    margin-bottom: 1rem;
    width: 100%;
    min-height: 40px;
    height: 40px;
  }

  .indicator {
    content: '';
    width: calc(33.333% - 4px);
    height: 32px;
    background: #ffffff;
    position: absolute;
    top: 4px;
    left: 4px;
    z-index: 9;
    border: 0.5px solid rgba(0, 0, 0, 0.04);
    box-shadow:
      0px 3px 8px rgba(0, 0, 0, 0.12),
      0px 3px 1px rgba(0, 0, 0, 0.04);
    border-radius: 7px;
    transition: all 0.2s ease-out;
  }

  .tab {
    width: 33.333%;
    height: 32px;
    position: absolute;
    z-index: 99;
    outline: none;
    opacity: 0;
  }

  .tab--2 {
    left: 33.333%;
  }

  .tab--3 {
    left: 66.666%;
  }

  .tab_label {
    width: 33.333%;
    height: 32px;
    position: absolute;
    z-index: 999;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 0;
    font-size: 0.75rem;
    opacity: 0.6;
    cursor: pointer;
    gap: 0.25rem;
    top: 4px;
  }

  .tab_label[for='tab2'] {
    left: 33.333%;
  }

  .tab_label[for='tab3'] {
    left: 66.666%;
  }

  .tab--1:checked ~ .indicator {
    left: 4px;
  }

  .tab--2:checked ~ .indicator {
    left: calc(33.333% + 2px);
  }

  .tab--3:checked ~ .indicator {
    left: calc(66.666% + 2px);
  }

  .tab--1:checked ~ .tab_label[for='tab1'] {
    opacity: 1;
  }

  .tab--2:checked ~ .tab_label[for='tab2'] {
    opacity: 1;
  }

  .tab--3:checked ~ .tab_label[for='tab3'] {
    opacity: 1;
  }
`

// Loading skeleton component
function CalendarSkeleton(): JSX.Element {
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-2">
        <Skeleton className="h-12 w-64 mx-auto" />
        <Skeleton className="h-4 w-48 mx-auto" />
      </div>
      <div className="max-w-2xl mx-auto">
        <Skeleton className="h-96 w-full rounded-lg" />
      </div>
    </div>
  )
}

// Error component
function CalendarError({
  error,
  onRetry,
}: {
  error: string
  onRetry: () => void
}): JSX.Element {
  return (
    <div className="text-center py-20 space-y-4">
      <h1 className="text-3xl font-serif text-ink">Memento Mori Calendar</h1>
      <p className="text-red-600 mt-4">Connection issue: {error}</p>
      <div className="space-y-2">
        <p className="text-stone/70 text-sm">
          Unable to load your calendar preferences
        </p>
        <button
          onClick={onRetry}
          className="px-6 py-2 bg-cta hover:bg-cta/90 text-white rounded-lg transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  )
}

function CalendarContent(): JSX.Element {
  const { user, isAuthenticated } = useAuthContext()
  const [activeTab, setActiveTab] = useState('calendar')
  const {
    lifeCalendarData,
    loading: calendarLoading,
    error,
    updatePreferences,
    getWeekData,
    getMotivationalMessage,
    refetch,
    isUpdating,
  } = useLifeCalendar(user)

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-20">
          <CalendarIcon className="w-16 h-16 text-stone/30 mx-auto mb-4" />
          <h1 className="text-3xl font-serif text-ink mb-4">
            Memento Mori Calendar
          </h1>
          <p className="text-stone">
            Please sign in to create your life calendar and track your time.
          </p>
        </div>
      </div>
    )
  }

  if (calendarLoading) {
    return <CalendarSkeleton />
  }

  if (error) {
    return <CalendarError error={error} onRetry={refetch} />
  }

  const hasSetupData = lifeCalendarData.birthDate !== null

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-serif text-ink">Memento Mori</h1>
        <p className="text-stone">
          Remember you must die - Live with intention
        </p>
      </div>

      {!hasSetupData ? (
        <div className="max-w-2xl mx-auto">
          <LifeCalendarSetup
            onSetup={updatePreferences}
            initialBirthDate={lifeCalendarData.birthDate}
            initialLifeExpectancy={lifeCalendarData.lifeExpectancy}
            isLoading={isUpdating}
          />
        </div>
      ) : (
        <div className="w-full">
          {/* Custom Styled Tabs */}
          <StyledWrapper>
            <div className="tab-container">
              <input
                type="radio"
                name="calendar-tab"
                id="tab1"
                className="tab tab--1"
                checked={activeTab === 'calendar'}
                onChange={() => setActiveTab('calendar')}
              />
              <label className="tab_label" htmlFor="tab1">
                <CalendarIcon className="w-4 h-4" />
                Life Calendar
              </label>
              <input
                type="radio"
                name="calendar-tab"
                id="tab2"
                className="tab tab--2"
                checked={activeTab === 'insights'}
                onChange={() => setActiveTab('insights')}
              />
              <label className="tab_label" htmlFor="tab2">
                <BarChart3 className="w-4 h-4" />
                Insights
              </label>
              <input
                type="radio"
                name="calendar-tab"
                id="tab3"
                className="tab tab--3"
                checked={activeTab === 'settings'}
                onChange={() => setActiveTab('settings')}
              />
              <label className="tab_label" htmlFor="tab3">
                <Settings className="w-4 h-4" />
                Settings
              </label>
              <div className="indicator" />
            </div>
          </StyledWrapper>

          <div className="space-y-6">
            {activeTab === 'calendar' && (
              <>
                <div className="text-center space-y-2 mb-6">
                  <h2 className="text-2xl font-serif text-ink">
                    Your Life Visualized
                  </h2>
                  <p className="text-stone/70">
                    Each square represents one week. Time is finite—make it
                    count.
                  </p>
                </div>

                <Suspense fallback={<CalendarSkeleton />}>
                  <LifeCalendarGrid
                    data={lifeCalendarData}
                    getWeekData={getWeekData}
                  />
                </Suspense>
              </>
            )}

            {activeTab === 'insights' && (
              <MementoMoriInsights
                data={lifeCalendarData}
                motivationalMessage={getMotivationalMessage()}
              />
            )}

            {activeTab === 'settings' && (
              <div className="max-w-2xl mx-auto">
                <LifeCalendarSetup
                  onSetup={updatePreferences}
                  initialBirthDate={lifeCalendarData.birthDate}
                  initialLifeExpectancy={lifeCalendarData.lifeExpectancy}
                  isLoading={isUpdating}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function CalendarPage(): JSX.Element {
  return (
    <ProtectedRoute>
      <AppLayout>
        <NavigationOptimizedCachedPage
          pageKey="calendar"
          fallback={<CalendarSkeleton />}
          preserveOnNavigation={true}
          refreshOnlyWhenStale={true}
          maxAge={60 * 60 * 1000} // 60 minutes - longer cache for heavy calendar rendering
          navigationRefreshThreshold={45 * 60 * 1000} // 45 minutes - calendar data doesn't change often
        >
          <CalendarContent />
        </NavigationOptimizedCachedPage>
      </AppLayout>
    </ProtectedRoute>
  )
}
