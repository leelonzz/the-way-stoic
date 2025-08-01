import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '@/integrations/supabase/client'
import type { User } from '@supabase/supabase-js'

export interface LifeCalendarPreferences {
  id: string
  user_id: string
  birth_date: string
  life_expectancy: number
  created_at: string
  updated_at: string
}

export interface LifeCalendarData {
  birthDate: Date | null
  lifeExpectancy: number
  weeksLived: number
  totalWeeks: number
  yearsLived: number
  yearsRemaining: number
  percentageLived: number
  daysLived: number
  daysRemaining: number
}

export function useLifeCalendar(user: User | null): {
  preferences: LifeCalendarPreferences | null
  lifeCalendarData: LifeCalendarData
  loading: boolean
  error: string | null
  updatePreferences: (
    birthDate: Date,
    lifeExpectancy: number
  ) => Promise<boolean>
  getWeekData: (weekIndex: number) => {
    isLived: boolean
    yearNumber: number
    weekInYear: number
    isCurrentWeek: boolean
  }
  getMotivationalMessage: () => string
  refetch: () => Promise<void>
  clearCache: () => void
} {
  const [preferences, setPreferences] =
    useState<LifeCalendarPreferences | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getCachedPreferences = useCallback(
    (userId: string): LifeCalendarPreferences | null => {
      try {
        const cachedData = localStorage.getItem(`calendar-${userId}`)
        if (!cachedData) return null

        const { preferences, timestamp } = JSON.parse(cachedData)
        const isExpired = Date.now() - timestamp > 60 * 60 * 1000 // 1 hour

        if (isExpired) {
          localStorage.removeItem(`calendar-${userId}`)
          return null
        }

        return preferences
      } catch {
        return null
      }
    },
    []
  )

  const setCachedPreferences = useCallback(
    (userId: string, preferences: LifeCalendarPreferences) => {
      try {
        localStorage.setItem(
          `calendar-${userId}`,
          JSON.stringify({
            preferences,
            timestamp: Date.now(),
          })
        )
      } catch (error) {
        console.warn('Failed to cache calendar preferences:', error)
      }
    },
    []
  )

  const fetchPreferences = useCallback(async () => {
    if (!user) return

    // Try to get cached preferences first
    const cachedPreferences = getCachedPreferences(user.id)
    if (cachedPreferences) {
      console.log('✅ Using cached calendar preferences')
      setPreferences(cachedPreferences)
      setLoading(false)

      // Update in background
      try {
        const { data, error } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (!error && data) {
          setCachedPreferences(user.id, data)
          setPreferences(data)
        }
      } catch (err) {
        console.warn('Background calendar fetch failed:', err)
      }
      return
    }

    try {
      setLoading(true)
      setError(null)
      console.log('🔄 Fetching life calendar preferences for user:', user.id)

      // Reduced timeout to prevent long loading
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), 5000)
      )

      const fetchPromise = supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single()

      const result = await Promise.race([fetchPromise, timeoutPromise])
      const { data, error } = result as {
        data: LifeCalendarPreferences | null
        error: { code?: string } | null
      }

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Error fetching preferences:', error)
        throw error
      }

      console.log('✅ Preferences fetched:', data)
      if (data) {
        setCachedPreferences(user.id, data)
      }
      setPreferences(data)
    } catch (err) {
      console.error('❌ Failed to fetch preferences:', err)
      // Don't show timeout errors to user, just set empty preferences
      if (err instanceof Error && err.message === 'Request timeout') {
        console.log('⚠️ Timeout - using default preferences')
        setPreferences(null)
      } else {
        setError(
          err instanceof Error ? err.message : 'Failed to fetch preferences'
        )
      }
    } finally {
      setLoading(false)
    }
  }, [user, getCachedPreferences, setCachedPreferences])

  const updatePreferences = async (
    birthDate: Date,
    lifeExpectancy: number
  ): Promise<boolean> => {
    if (!user) return false

    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          birth_date: birthDate.toISOString().split('T')[0],
          life_expectancy: lifeExpectancy,
        })
        .select()
        .single()

      if (error) throw error

      if (data) {
        setCachedPreferences(user.id, data)
        setPreferences(data)
      }

      return true
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to update preferences'
      )
      return false
    }
  }

  const lifeCalendarData: LifeCalendarData = useMemo(() => {
    const now = new Date()
    const birthDate = preferences?.birth_date
      ? new Date(preferences.birth_date)
      : null
    const lifeExpectancy = preferences?.life_expectancy || 80

    if (!birthDate) {
      return {
        birthDate: null,
        lifeExpectancy,
        weeksLived: 0,
        totalWeeks: lifeExpectancy * 52,
        yearsLived: 0,
        yearsRemaining: lifeExpectancy,
        percentageLived: 0,
        daysLived: 0,
        daysRemaining: lifeExpectancy * 365,
      }
    }

    const msPerWeek = 7 * 24 * 60 * 60 * 1000
    const msPerDay = 24 * 60 * 60 * 1000
    const msPerYear = 365.25 * msPerDay

    const ageInMs = now.getTime() - birthDate.getTime()
    const weeksLived = Math.floor(ageInMs / msPerWeek)
    const daysLived = Math.floor(ageInMs / msPerDay)
    const yearsLived = ageInMs / msPerYear

    const totalWeeks = lifeExpectancy * 52
    const totalDays = lifeExpectancy * 365
    const yearsRemaining = Math.max(0, lifeExpectancy - yearsLived)
    const daysRemaining = Math.max(0, totalDays - daysLived)
    const percentageLived = Math.min(100, (weeksLived / totalWeeks) * 100)

    return {
      birthDate,
      lifeExpectancy,
      weeksLived: Math.max(0, weeksLived),
      totalWeeks,
      yearsLived: Math.floor(yearsLived),
      yearsRemaining: Math.floor(yearsRemaining),
      percentageLived: Math.round(percentageLived * 10) / 10,
      daysLived: Math.max(0, daysLived),
      daysRemaining: Math.floor(daysRemaining),
    }
  }, [preferences])

  const getWeekData = (
    weekIndex: number
  ): {
    isLived: boolean
    yearNumber: number
    weekInYear: number
    isCurrentWeek: boolean
  } => {
    const isLived = weekIndex < lifeCalendarData.weeksLived
    const yearNumber = Math.floor(weekIndex / 52)
    const weekInYear = weekIndex % 52

    return {
      isLived,
      yearNumber,
      weekInYear,
      isCurrentWeek: weekIndex === lifeCalendarData.weeksLived,
    }
  }

  const getMotivationalMessage = (): string => {
    const { percentageLived } = lifeCalendarData

    if (percentageLived < 25) {
      return 'Your life is just beginning. Make every day count.'
    } else if (percentageLived < 50) {
      return "You're in the prime of your life. Pursue what matters most."
    } else if (percentageLived < 75) {
      return 'Wisdom comes with experience. Share your knowledge with others.'
    } else {
      return 'Every moment is precious. Cherish the time you have.'
    }
  }

  useEffect(() => {
    fetchPreferences()
  }, [fetchPreferences])

  return {
    preferences,
    lifeCalendarData,
    loading,
    error,
    updatePreferences,
    getWeekData,
    getMotivationalMessage,
    refetch: fetchPreferences,
    clearCache: useCallback(() => {
      if (user) {
        localStorage.removeItem(`calendar-${user.id}`)
      }
    }, [user]),
  }
}
