'use client'

import React from 'react'
import { CourseNavigation } from '@/components/course/CourseNavigation'

interface CourseModule {
  id: string
  title: string
  subtitle: string
  icon: string
  progress: number
  path?: string
}

export default function CoursesPage() {
  const handleModuleClick = (module: CourseModule) => {
    // For now, just log the module click
    // In a real app, this would navigate to the course content
    console.log('Navigating to course:', module.title)
    
    // You can implement actual navigation here
    // router.push(module.path) if using Next.js router
    // or window.location.href = module.path for simple navigation
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 border-b border-border">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-stone mb-4">
              Master Your Skills
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comprehensive learning paths designed to take you from beginner to expert. 
              Start your journey with structured courses and hands-on projects.
            </p>
          </div>
        </div>
      </div>

      {/* Course Navigation */}
      <div className="container mx-auto px-4 py-16">
        <CourseNavigation onModuleClick={handleModuleClick} />
      </div>

    </div>
  )
}