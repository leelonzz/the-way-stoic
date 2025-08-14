'use client'

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface SectionContentDialogProps {
  isOpen: boolean
  onClose: () => void
  title: string
  content: string
}

export const SectionContentDialog: React.FC<SectionContentDialogProps> = ({
  isOpen,
  onClose,
  title,
  content
}) => {
  // Function to render formatted content with proper styling
  const renderFormattedContent = (text: string) => {
    const lines = text.split('\n')
    const elements: React.ReactNode[] = []
    let key = 0

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) {
        elements.push(<br key={key++} />)
        continue
      }

      // Handle different content types
      if (line.startsWith('Objective:')) {
        elements.push(
          <div key={key++} className="bg-primary/10 p-4 rounded-lg mb-6">
            <h3 className="text-lg font-semibold text-stone mb-2">Objective</h3>
            <p className="text-muted-foreground">{line.substring(10).trim()}</p>
          </div>
        )
      } else if (line.startsWith('Module ')) {
        elements.push(
          <h2 key={key++} className="text-xl font-bold text-stone mt-8 mb-4 border-b border-sage/20 pb-2">
            {line}
          </h2>
        )
      } else if (line.startsWith('Core Concept:')) {
        elements.push(
          <div key={key++} className="bg-sage/10 p-4 rounded-lg mb-4">
            <h4 className="font-semibold text-stone mb-2">Core Concept</h4>
            <p className="text-muted-foreground">{line.substring(13).trim()}</p>
          </div>
        )
      } else if (line.startsWith('Key Idea:')) {
        elements.push(
          <div key={key++} className="bg-accent/10 p-4 rounded-lg mb-4">
            <h4 className="font-semibold text-stone mb-2">Key Idea</h4>
            <p className="text-muted-foreground">{line.substring(9).trim()}</p>
          </div>
        )
      } else if (line.startsWith('Practical Exercise:')) {
        elements.push(
          <div key={key++} className="bg-cta/10 p-4 rounded-lg mb-4">
            <h4 className="font-semibold text-stone mb-2">Practical Exercise</h4>
            <p className="text-muted-foreground">{line.substring(19).trim()}</p>
          </div>
        )
      } else if (line.startsWith('The Four Cardinal Virtues:')) {
        elements.push(
          <h4 key={key++} className="font-semibold text-stone mt-4 mb-3">
            The Four Cardinal Virtues:
          </h4>
        )
      } else if (line.includes(':') && (line.startsWith('Practical Wisdom') || line.startsWith('Courage') || line.startsWith('Justice') || line.startsWith('Temperance'))) {
        const [virtue, description] = line.split(':')
        elements.push(
          <div key={key++} className="ml-4 mb-2">
            <span className="font-medium text-stone">{virtue}:</span>
            <span className="text-muted-foreground">{description}</span>
          </div>
        )
      } else if (line.startsWith('What is up to us?') || line.startsWith('What is not up to us?')) {
        elements.push(
          <p key={key++} className="font-medium text-stone mt-3 mb-2">
            {line}
          </p>
        )
      } else if (line.includes('**')) {
        // Handle bold text formatting
        const parts = line.split('**')
        const formattedParts: React.ReactNode[] = []
        for (let j = 0; j < parts.length; j++) {
          if (j % 2 === 1) {
            formattedParts.push(<strong key={j} className="text-stone">{parts[j]}</strong>)
          } else {
            formattedParts.push(parts[j])
          }
        }
        elements.push(
          <p key={key++} className="text-muted-foreground mb-3 leading-relaxed">
            {formattedParts}
          </p>
        )
      } else if (line.startsWith('Week ') || line.startsWith('Daily ') || line.startsWith('Weekly ')) {
        elements.push(
          <div key={key++} className="ml-4 mb-2">
            <span className="font-medium text-stone">{line}</span>
          </div>
        )
      } else {
        // Regular paragraph
        elements.push(
          <p key={key++} className="text-muted-foreground mb-3 leading-relaxed">
            {line}
          </p>
        )
      }
    }

    return elements
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] bg-parchment border border-sage/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-stone mb-4">
            {title}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-4">
            {renderFormattedContent(content)}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
