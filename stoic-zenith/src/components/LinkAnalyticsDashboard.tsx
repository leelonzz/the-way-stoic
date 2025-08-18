'use client'

import React, { useState, useEffect } from 'react'
import { LinkAnalytics, generateLinkAnalytics, getPageAnalytics } from '@/lib/linkAnalytics'

interface LinkAnalyticsDashboardProps {
  className?: string
}

export function LinkAnalyticsDashboard({ className = '' }: LinkAnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<LinkAnalytics | null>(null)
  const [selectedPage, setSelectedPage] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const data = generateLinkAnalytics()
        setAnalytics(data)
      } catch (error) {
        console.error('Failed to load analytics:', error)
      } finally {
        setLoading(false)
      }
    }

    loadAnalytics()
  }, [])

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
        <p className="text-gray-500">Failed to load analytics data.</p>
      </div>
    )
  }

  const getEfficiencyColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50'
    if (score >= 60) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Internal Linking Analytics
        </h2>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleDateString()}
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">
            {analytics.totalPages}
          </div>
          <div className="text-sm text-gray-600">Pages Processed</div>
        </div>
        
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {analytics.totalLinks}
          </div>
          <div className="text-sm text-gray-600">Total Links</div>
        </div>
        
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">
            {analytics.averageLinksPerPage}
          </div>
          <div className="text-sm text-gray-600">Avg Links/Page</div>
        </div>
        
        <div className={`text-center p-4 rounded-lg ${getEfficiencyColor(analytics.linkingEfficiency)}`}>
          <div className="text-2xl font-bold">
            {analytics.linkingEfficiency}%
          </div>
          <div className="text-sm">Efficiency Score</div>
        </div>
      </div>

      {/* Top Keywords */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Most Linked Keywords
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Keyword
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Count
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Pages
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Targets
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analytics.mostLinkedKeywords.slice(0, 10).map((keyword, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-sm font-medium text-gray-900">
                    {keyword.keyword}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-600">
                    {keyword.count}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-600">
                    {keyword.pages.length}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-600">
                    {keyword.urls.length}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Target Pages */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Top Target Pages
        </h3>
        <div className="space-y-3">
          {analytics.topTargetPages.slice(0, 8).map((target, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <div className="font-medium text-gray-900 truncate">
                  {target.url}
                </div>
                <div className="text-sm text-gray-600">
                  {target.keywords.slice(0, 3).join(', ')}
                  {target.keywords.length > 3 && ` +${target.keywords.length - 3} more`}
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-blue-600">
                  {target.inboundLinks}
                </div>
                <div className="text-xs text-gray-500">
                  {target.category}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Page Performance */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Page Performance
        </h3>
        <div className="space-y-2">
          {analytics.pagePerformance.slice(0, 10).map((page, index) => (
            <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div className="flex-1">
                <div className="font-medium text-gray-900 truncate">
                  {page.pageId}
                </div>
                <div className="text-sm text-gray-600">
                  {page.totalLinks} links • {page.uniqueKeywords} keywords
                </div>
              </div>
              <div className="text-right">
                <div className={`text-lg font-semibold ${
                  page.score >= 80 ? 'text-green-600' :
                  page.score >= 60 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {page.score}
                </div>
                <div className="text-xs text-gray-500">score</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Linking Trends */}
      {analytics.linkingTrends.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Linking Trends (Last 7 Days)
          </h3>
          <div className="grid grid-cols-7 gap-2">
            {analytics.linkingTrends.map((trend, index) => (
              <div key={index} className="text-center p-2 bg-gray-50 rounded">
                <div className="text-xs text-gray-500 mb-1">
                  {new Date(trend.date).toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className="text-lg font-semibold text-blue-600">
                  {trend.linksCreated}
                </div>
                <div className="text-xs text-gray-600">
                  {trend.pagesProcessed} pages
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {analytics.totalPages === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Analytics Data
          </h3>
          <p className="text-gray-600">
            Start creating content with internal links to see analytics data here.
          </p>
        </div>
      )}
    </div>
  )
}
