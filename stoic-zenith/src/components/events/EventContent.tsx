import { HistoricalEvent } from '@/types/event'

interface EventContentProps {
  event: HistoricalEvent
}

export function EventContent({ event }: EventContentProps) {
  return (
    <div
      className="prose prose-lg prose-gray max-w-none"
      style={{ fontFamily: 'Inknut Antiqua, serif' }}
    >
      {/* Overview */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Overview</h2>
        <p className="text-gray-700 leading-relaxed">
          {event.content.overview}
        </p>
      </section>

      {/* Historical Context */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Historical Context
        </h2>
        <p className="text-gray-700 leading-relaxed">
          {event.content.historicalContext}
        </p>
      </section>

      {/* Stoic Influence */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Influence on Stoicism
        </h2>
        <p className="text-gray-700 leading-relaxed">
          {event.content.stoicInfluence}
        </p>
      </section>

      {/* Key Moments */}
      {event.content.keyMoments.length > 0 && (
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Moments</h2>
          <div className="space-y-6">
            {event.content.keyMoments.map((moment, index) => (
              <div key={index} className="border-l-4 border-blue-200 pl-6 py-2">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {moment.date}
                </h3>
                <h4 className="text-base font-medium text-gray-800 mb-2">
                  {moment.event}
                </h4>
                <p className="text-gray-700">{moment.significance}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Legacy */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Legacy</h2>
        <p className="text-gray-700 leading-relaxed">{event.content.legacy}</p>
      </section>

      {/* Key Figures */}
      {event.keyFigures.length > 0 && (
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Key Figures</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {event.keyFigures.map((figure, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900">{figure}</h3>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Sources */}
      {event.sources.length > 0 && (
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Historical Sources
          </h2>
          <ul className="list-disc list-inside space-y-2">
            {event.sources.map((source, index) => (
              <li key={index} className="text-gray-700">
                {source}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
