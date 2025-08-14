import { Loader2 } from 'lucide-react'

export default function RootLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-hero via-parchment to-accent/10 flex flex-col items-center justify-center">
      {/* Logo/Brand */}
      <div className="mb-8">
        <div className="w-16 h-16 bg-stone/20 rounded-full flex items-center justify-center mb-4">
          <div className="w-8 h-8 bg-stone/40 rounded-full"></div>
        </div>
        <h1 className="text-2xl font-serif text-stone">The Stoic Way</h1>
        <p className="text-stone/70 text-sm mt-1">Philosophy for Daily Life</p>
      </div>

      {/* Loading Spinner */}
      <div className="flex items-center space-x-2">
        <Loader2 className="w-6 h-6 text-stone animate-spin" />
        <span className="text-stone/70 text-sm">Loading your wisdom...</span>
      </div>

      {/* Progress Bar */}
      <div className="mt-6 w-64">
        <div className="h-1 bg-stone/20 rounded-full overflow-hidden">
          <div className="h-full bg-stone/40 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  )
}