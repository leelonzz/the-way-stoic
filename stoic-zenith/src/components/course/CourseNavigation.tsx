'use client'

import * as React from "react"
import { CourseNavigationCard } from "./CourseNavigationCard"
import { cn } from "@/lib/utils"

interface CourseModule {
  id: string
  title: string
  subtitle: string
  icon: string
  progress: number
  path?: string
}

const courseModules: CourseModule[] = [
  {
    id: "start-here",
    title: "START HERE",
    subtitle: "Let's get you off on the right foot",
    icon: "🚀",
    progress: 0,
    path: "/courses/start-here"
  },
  {
    id: "learn-n8n",
    title: "LEARN N8N",
    subtitle: "Zero to Hero with n8n",
    icon: "🎓",
    progress: 0,
    path: "/courses/learn-n8n"
  },
  {
    id: "build-with-n8n",
    title: "BUILD WITH N8N",
    subtitle: "Automate smarter, faster — with n8n.",
    icon: "🔨",
    progress: 0,
    path: "/courses/build-with-n8n"
  },
  {
    id: "youtube-resources",
    title: "YOUTUBE RESOURCES",
    subtitle: "This will contain all the Youtube Resources",
    icon: "🎬",
    progress: 0,
    path: "/courses/youtube-resources"
  },
  {
    id: "live-call-recordings",
    title: "WEEKLY CALLS RECORDING",
    subtitle: "All previous LIVE automation calls are available for replay — jump back in anytime.",
    icon: "📹",
    progress: 0,
    path: "/courses/live-calls"
  },
  {
    id: "community",
    title: "COMMUNITY",
    subtitle: "Learn from #1 Tech Community",
    icon: "💎",
    progress: 0,
    path: "/courses/community"
  }
]

interface CourseNavigationProps {
  className?: string
  onModuleClick?: (module: CourseModule) => void
}

export const CourseNavigation: React.FC<CourseNavigationProps> = ({
  className,
  onModuleClick
}) => {
  const handleModuleClick = (module: CourseModule) => {
    if (onModuleClick) {
      onModuleClick(module)
    } else if (module.path) {
      // Default navigation behavior
      window.location.href = module.path
    }
  }

  return (
    <div className={cn("w-full", className)}>
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-stone mb-2">Course Navigation</h1>
        <p className="text-muted-foreground">Choose your learning path and start your journey</p>
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courseModules.map((module) => (
          <CourseNavigationCard
            key={module.id}
            title={module.title}
            subtitle={module.subtitle}
            icon={module.icon}
            progress={module.progress}
            onClick={() => handleModuleClick(module)}
            className="animate-fade-in-up"
          />
        ))}
      </div>

      {/* Footer Info */}
      <div className="mt-12 text-center">
        <p className="text-sm text-muted-foreground">
          Complete modules in any order. Your progress is automatically saved.
        </p>
      </div>
    </div>
  )
}