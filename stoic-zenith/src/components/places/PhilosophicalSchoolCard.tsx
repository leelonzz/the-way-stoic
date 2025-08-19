import { PhilosophicalSchool } from '@/types/place'
import { Users, Calendar, MapPin, BookOpen } from 'lucide-react'

interface PhilosophicalSchoolCardProps {
  school: PhilosophicalSchool
}

export function PhilosophicalSchoolCard({ school }: PhilosophicalSchoolCardProps) {
  const getSchoolColor = (philosophy: string) => {
    switch (philosophy.toLowerCase()) {
      case 'stoicism':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'platonism':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'aristotelianism (peripatetic)':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'epicureanism':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatYear = (year: number) => {
    return year < 0 ? `${Math.abs(year)} BCE` : `${year} CE`
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Inknut Antiqua, serif' }}>
            {school.name}
          </h3>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getSchoolColor(school.philosophy)}`}>
            {school.philosophy}
          </span>
        </div>
        
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>Founded by {school.founder}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{formatYear(school.foundedYear)}</span>
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="mb-4">
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
          <span className="text-sm text-gray-700">{school.location}</span>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-700 text-sm leading-relaxed mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
        {school.description}
      </p>

      {/* Key Teachings */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1">
          <BookOpen className="w-4 h-4" />
          Key Teachings:
        </h4>
        <ul className="space-y-1">
          {school.keyTeachings.slice(0, 3).map((teaching, index) => (
            <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
              <span className="text-blue-500 mt-1">•</span>
              <span>{teaching}</span>
            </li>
          ))}
          {school.keyTeachings.length > 3 && (
            <li className="text-sm text-gray-500 italic">
              +{school.keyTeachings.length - 3} more teachings
            </li>
          )}
        </ul>
      </div>

      {/* Notable Members */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-2">Notable Members:</h4>
        <div className="flex flex-wrap gap-1">
          {school.notableMembers.slice(0, 4).map((member, index) => (
            <span 
              key={index}
              className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700"
            >
              {member}
            </span>
          ))}
          {school.notableMembers.length > 4 && (
            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
              +{school.notableMembers.length - 4} more
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
