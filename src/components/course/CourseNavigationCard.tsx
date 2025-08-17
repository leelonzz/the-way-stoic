import * as React from "react"
import { cn } from "@/lib/utils"

interface CourseNavigationCardProps {
  title: string
  subtitle: string
  icon: string
  progress: number
  badge?: string
  onClick?: () => void
  className?: string
}

export const CourseNavigationCard = React.forwardRef<
  HTMLDivElement,
  CourseNavigationCardProps
>(({ title, subtitle, icon, progress, badge = "GG", onClick, className }, ref) => {
  return (
    <div
      ref={ref}
      onClick={onClick}
      className={cn(
        "relative group cursor-pointer overflow-hidden rounded-lg transition-all duration-200",
        "bg-parchment border border-sage/20 shadow-sm hover:shadow-md",
        "hover:border-primary/30 hover:-translate-y-1",
        "min-h-[200px] flex flex-col",
        className
      )}
    >


      {/* Main Content */}
      <div className="flex-1 p-5 flex flex-col relative z-10">
        {/* Icon */}
        <div className="text-2xl mb-3 text-stone">
          {icon}
        </div>

        {/* Title */}
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-stone mb-2 tracking-normal">
            {title}
          </h3>
          <div className="w-8 h-0.5 bg-primary/60 rounded-full"></div>
        </div>

        {/* Subtitle */}
        <p className="text-muted-foreground text-sm flex-1 leading-relaxed font-normal">
          {subtitle}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="px-5 pb-4 relative z-10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground font-medium">{progress}%</span>
        </div>
        <div className="w-full bg-sage/30 rounded-full h-1.5">
          <div 
            className="bg-primary h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-primary/3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg"></div>
    </div>
  )
})

CourseNavigationCard.displayName = "CourseNavigationCard"