'use client'

import React, { useState, useEffect } from 'react'
import { 
  LinkOverride, 
  createLinkOverride, 
  updateLinkOverride, 
  deleteLinkOverride,
  getPageOverrides,
  validateOverride,
  getOverrideStats
} from '@/lib/linkOverrides'

interface LinkOverrideManagerProps {
  pageId?: string
  onOverrideChange?: () => void
  className?: string
}

export function LinkOverrideManager({ 
  pageId, 
  onOverrideChange, 
  className = '' 
}: LinkOverrideManagerProps) {
  const [overrides, setOverrides] = useState<LinkOverride[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [stats, setStats] = useState<ReturnType<typeof getOverrideStats> | null>(null)
  const [newOverride, setNewOverride] = useState({
    keyword: '',
    url: '',
    priority: 100,
    wholeWordOnly: true,
    maxOccurrences: 1,
    notes: ''
  })

  useEffect(() => {
    loadOverrides()
    loadStats()
  }, [pageId])

  const loadOverrides = () => {
    if (pageId) {
      const pageOverrides = getPageOverrides(pageId)
      setOverrides(pageOverrides)
    }
  }

  const loadStats = () => {
    const overrideStats = getOverrideStats()
    setStats(overrideStats)
  }

  const handleCreate = async () => {
    const errors = validateOverride(newOverride)
    if (errors.length > 0) {
      alert('Validation errors:\n' + errors.join('\n'))
      return
    }

    if (!pageId) {
      alert('Page ID is required')
      return
    }

    try {
      await createLinkOverride(pageId, newOverride.keyword, newOverride.url, {
        priority: newOverride.priority,
        wholeWordOnly: newOverride.wholeWordOnly,
        maxOccurrences: newOverride.maxOccurrences,
        notes: newOverride.notes
      })

      setNewOverride({
        keyword: '',
        url: '',
        priority: 100,
        wholeWordOnly: true,
        maxOccurrences: 1,
        notes: ''
      })
      setIsCreating(false)
      loadOverrides()
      loadStats()
      onOverrideChange?.()
    } catch (error) {
      alert(`Failed to create override: ${error}`)
    }
  }

  const handleUpdate = async (override: LinkOverride) => {
    try {
      await updateLinkOverride(override.id, override)
      setEditingId(null)
      loadOverrides()
      onOverrideChange?.()
    } catch (error) {
      alert(`Failed to update override: ${error}`)
    }
  }

  const handleDelete = async (overrideId: string) => {
    if (!confirm('Are you sure you want to delete this override?')) {
      return
    }

    try {
      await deleteLinkOverride(overrideId)
      loadOverrides()
      loadStats()
      onOverrideChange?.()
    } catch (error) {
      alert(`Failed to delete override: ${error}`)
    }
  }

  const handleToggleEnabled = async (override: LinkOverride) => {
    await handleUpdate({ ...override, enabled: !override.enabled })
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Link Overrides {pageId && `for ${pageId}`}
        </h3>
        <button
          onClick={() => setIsCreating(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
          disabled={!pageId}
        >
          Add Override
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-lg font-bold text-blue-600">{stats.totalOverrides}</div>
            <div className="text-xs text-gray-600">Total</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-lg font-bold text-green-600">{stats.pageSpecificOverrides}</div>
            <div className="text-xs text-gray-600">Page Specific</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-lg font-bold text-purple-600">{stats.globalOverrides}</div>
            <div className="text-xs text-gray-600">Global</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="text-lg font-bold text-yellow-600">{stats.activeRules}</div>
            <div className="text-xs text-gray-600">Rules</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-bold text-gray-600">{stats.pagesWithOverrides}</div>
            <div className="text-xs text-gray-600">Pages</div>
          </div>
        </div>
      )}

      {/* Create Form */}
      {isCreating && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <h4 className="font-medium text-gray-900 mb-4">Create New Override</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Keyword
              </label>
              <input
                type="text"
                value={newOverride.keyword}
                onChange={(e) => setNewOverride({ ...newOverride, keyword: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Marcus Aurelius"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL
              </label>
              <input
                type="text"
                value={newOverride.url}
                onChange={(e) => setNewOverride({ ...newOverride, url: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., /biography/marcus-aurelius"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={newOverride.priority}
                onChange={(e) => setNewOverride({ ...newOverride, priority: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Occurrences
              </label>
              <input
                type="number"
                min="1"
                value={newOverride.maxOccurrences}
                onChange={(e) => setNewOverride({ ...newOverride, maxOccurrences: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={newOverride.notes}
              onChange={(e) => setNewOverride({ ...newOverride, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={2}
              placeholder="Optional notes about this override"
            />
          </div>
          <div className="mt-4 flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={newOverride.wholeWordOnly}
                onChange={(e) => setNewOverride({ ...newOverride, wholeWordOnly: e.target.checked })}
                className="rounded border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700">Whole word only</span>
            </label>
          </div>
          <div className="mt-4 flex space-x-2">
            <button
              onClick={handleCreate}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
            >
              Create
            </button>
            <button
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Overrides List */}
      <div className="space-y-3">
        {overrides.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No overrides found for this page.</p>
            {pageId && (
              <p className="text-sm mt-1">
                Create an override to customize linking behavior.
              </p>
            )}
          </div>
        ) : (
          overrides.map((override) => (
            <div
              key={override.id}
              className={`border rounded-lg p-4 ${
                override.enabled ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`font-medium ${override.enabled ? 'text-gray-900' : 'text-gray-500'}`}>
                      {override.keyword}
                    </span>
                    <span className="text-sm text-gray-500">→</span>
                    <span className={`text-sm ${override.enabled ? 'text-blue-600' : 'text-gray-400'}`}>
                      {override.url}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      override.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {override.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>Priority: {override.priority}</span>
                    <span>Max: {override.maxOccurrences}</span>
                    <span>{override.wholeWordOnly ? 'Whole word' : 'Partial match'}</span>
                    {override.notes && <span>Notes: {override.notes}</span>}
                  </div>
                  
                  <div className="text-xs text-gray-400 mt-1">
                    Created: {new Date(override.createdAt).toLocaleDateString()}
                    {override.createdBy && ` by ${override.createdBy}`}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => handleToggleEnabled(override)}
                    className={`px-3 py-1 rounded text-xs ${
                      override.enabled 
                        ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' 
                        : 'bg-green-100 text-green-800 hover:bg-green-200'
                    }`}
                  >
                    {override.enabled ? 'Disable' : 'Enable'}
                  </button>
                  <button
                    onClick={() => handleDelete(override.id)}
                    className="px-3 py-1 bg-red-100 text-red-800 rounded text-xs hover:bg-red-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
