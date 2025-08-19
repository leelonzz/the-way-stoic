import Link from 'next/link'
import { HistoricalEvent } from '@/types/event'

interface EventCardProps {
  event: HistoricalEvent
}

export function EventCard({ event }: EventCardProps) {
  const formatDateRange = (dateRange: string) => {
    return dateRange.replace(/BCE/g, 'BCE').replace(/CE/g, 'CE')
  }

  const getPeriodColor = (period: string) => {
    switch (period) {
      case 'hellenistic':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'roman-republic':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'roman-empire':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <article className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100">
      <Link href={`/events/${event.slug}`} className="block">
        <div className="p-6">
          {/* Period Badge */}
          <div className="mb-4">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getPeriodColor(event.period)}`}
            >
              {event.periodName}
            </span>
          </div>

          {/* Title and Date */}
          <div className="mb-4">
            <h3 className="text-xl font-bold font-inknut text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
              {event.title}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <time className="font-medium">
                {formatDateRange(event.dateRange)}
              </time>
              <span>•</span>
              <span>{event.location}</span>
            </div>
          </div>

          {/* Description */}
          <p className="font-inknut text-gray-700 text-sm leading-relaxed line-clamp-3 mb-4">
            {event.description}
          </p>

          {/* Stoic Connection */}
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-1">
              Stoic Connection:
            </h4>
            <p className="font-inknut text-gray-600 text-sm line-clamp-2">
              {event.stoicConnection}
            </p>
          </div>

          {/* Key Figures */}
          {event.keyFigures.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">
                Key Figures:
              </h4>
              <div className="flex flex-wrap gap-1">
                {event.keyFigures.slice(0, 3).map((figure, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700"
                  >
                    {figure}
                  </span>
                ))}
                {event.keyFigures.length > 3 && (
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                    +{event.keyFigures.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}



          {/* Read More Indicator */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Read full analysis</span>
              <svg
                className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </div>
        </div>
      </Link>
    </article>
  )
}
