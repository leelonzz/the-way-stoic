'use client'

import React, { useState } from 'react'
import { ContentAnalysisResult, LinkingOpportunity } from '@/lib/contentAnalysis'

interface LinkingAnalysisProps {
  analysis: ContentAnalysisResult
  onApplyLinks?: (opportunities: LinkingOpportunity[]) => void
  showDetails?: boolean
}

export function LinkingAnalysis({ 
  analysis, 
  onApplyLinks, 
  showDetails = false 
}: LinkingAnalysisProps) {
  const [selectedOpportunities, setSelectedOpportunities] = useState<Set<number>>(new Set())
  const [showFullAnalysis, setShowFullAnalysis] = useState(showDetails)

  const handleOpportunityToggle = (index: number) => {
    const newSelected = new Set(selectedOpportunities)
    if (newSelected.has(index)) {
      newSelected.delete(index)
    } else {
      newSelected.add(index)
    }
    setSelectedOpportunities(newSelected)
  }

  const handleApplySelected = () => {
    if (onApplyLinks) {
      const selected = analysis.linkingOpportunities.filter((_, index) => 
        selectedOpportunities.has(index)
      )
      onApplyLinks(selected)
    }
  }

  const getReadabilityColor = (score: number) => {
    if (score >= 70) return 'text-green-600'
    if (score >= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getReadabilityLabel = (score: number) => {
    if (score >= 70) return 'Easy to read'
    if (score >= 50) return 'Moderate difficulty'
    return 'Difficult to read'
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Content Analysis & Linking Suggestions
        </h3>
        <button
          onClick={() => setShowFullAnalysis(!showFullAnalysis)}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          {showFullAnalysis ? 'Hide Details' : 'Show Details'}
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">
            {analysis.linkingOpportunities.length}
          </div>
          <div className="text-sm text-gray-600">Link Opportunities</div>
        </div>
        
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {analysis.detectedTopics.length}
          </div>
          <div className="text-sm text-gray-600">Topics Detected</div>
        </div>
        
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">
            {analysis.philosopherMentions.length}
          </div>
          <div className="text-sm text-gray-600">Philosophers</div>
        </div>
        
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className={`text-2xl font-bold ${getReadabilityColor(analysis.readabilityScore)}`}>
            {Math.round(analysis.readabilityScore)}
          </div>
          <div className="text-sm text-gray-600">Readability</div>
        </div>
      </div>

      {showFullAnalysis && (
        <div className="space-y-6">
          {/* Detected Topics */}
          {analysis.detectedTopics.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Detected Topics</h4>
              <div className="flex flex-wrap gap-2">
                {analysis.detectedTopics.map((topic, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Stoic Concepts */}
          {analysis.stoicConcepts.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Stoic Concepts Found</h4>
              <div className="flex flex-wrap gap-2">
                {analysis.stoicConcepts.map((concept, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm"
                  >
                    {concept}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Philosopher Mentions */}
          {analysis.philosopherMentions.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Philosophers Mentioned</h4>
              <div className="flex flex-wrap gap-2">
                {analysis.philosopherMentions.map((philosopher, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                  >
                    {philosopher.replace('-', ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Readability Details */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Readability Analysis</h4>
            <div className="flex items-center space-x-4">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    analysis.readabilityScore >= 70 ? 'bg-green-500' :
                    analysis.readabilityScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${analysis.readabilityScore}%` }}
                />
              </div>
              <span className={`text-sm font-medium ${getReadabilityColor(analysis.readabilityScore)}`}>
                {getReadabilityLabel(analysis.readabilityScore)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Linking Opportunities */}
      {analysis.linkingOpportunities.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900">
              Linking Opportunities ({analysis.linkingOpportunities.length})
            </h4>
            {onApplyLinks && selectedOpportunities.size > 0 && (
              <button
                onClick={handleApplySelected}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
              >
                Apply Selected ({selectedOpportunities.size})
              </button>
            )}
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {analysis.linkingOpportunities.slice(0, 20).map((opportunity, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {onApplyLinks && (
                        <input
                          type="checkbox"
                          checked={selectedOpportunities.has(index)}
                          onChange={() => handleOpportunityToggle(index)}
                          className="rounded border-gray-300"
                        />
                      )}
                      <span className="font-medium text-gray-900">
                        {opportunity.keyword}
                      </span>
                      <span className="text-sm text-gray-500">
                        → {opportunity.url}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">
                      {opportunity.context}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>Confidence: {Math.round(opportunity.confidence * 100)}%</span>
                      <span>Position: {opportunity.position}</span>
                      <span>{opportunity.reason}</span>
                    </div>
                  </div>
                  
                  <div className="ml-4">
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-2 h-2 rounded-full ${
                            i < Math.round(opportunity.confidence * 5)
                              ? 'bg-blue-500'
                              : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {analysis.linkingOpportunities.length > 20 && (
            <div className="text-center mt-4">
              <span className="text-sm text-gray-500">
                Showing top 20 of {analysis.linkingOpportunities.length} opportunities
              </span>
            </div>
          )}
        </div>
      )}

      {analysis.linkingOpportunities.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No linking opportunities found in this content.</p>
          <p className="text-sm mt-1">
            Try adding more Stoic concepts or philosopher names to improve linking potential.
          </p>
        </div>
      )}
    </div>
  )
}
