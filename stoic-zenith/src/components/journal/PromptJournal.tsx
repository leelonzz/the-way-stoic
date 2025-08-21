import React, { useState, useEffect } from 'react'
import { Lightbulb, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { getDailyPrompts, getCategoryDisplayName, WritingPrompt } from '@/lib/prompts'
import { toast } from '@/components/ui/use-toast'
import { insertTextAtCursor } from './blockUtils'

interface PromptJournalProps {
  isOpen: boolean
  onClose: () => void
  onPromptSelect: (prompt: string) => void
}

export const PromptJournal: React.FC<PromptJournalProps> = ({
  isOpen,
  onClose,
  onPromptSelect,
}) => {
  const [dailyPrompts, setDailyPrompts] = useState<WritingPrompt[]>([])
  const [selectedPrompt, setSelectedPrompt] = useState<WritingPrompt | null>(null)

  useEffect(() => {
    if (isOpen) {
      const prompts = getDailyPrompts()
      setDailyPrompts(prompts.prompts)
    }
  }, [isOpen])

  const handlePromptClick = (prompt: WritingPrompt) => {
    const promptText = `Prompt: ${prompt.text}`
    
    // Try to insert at cursor position first
    try {
      insertTextAtCursor(promptText)
      onPromptSelect(promptText)
      onClose()
      
      toast({
        title: 'Prompt Added',
        description: 'The writing prompt has been added to your journal.',
      })
    } catch (error) {
      // Fallback: pass the prompt text to parent component
      onPromptSelect(promptText)
      onClose()
      
      toast({
        title: 'Prompt Selected',
        description: 'The writing prompt has been selected.',
      })
    }
  }

  const getCategoryColor = (category: WritingPrompt['category']) => {
    const colors = {
      reflection: 'bg-blue-50 text-blue-700 border-blue-200',
      gratitude: 'bg-green-50 text-green-700 border-green-200',
      creativity: 'bg-purple-50 text-purple-700 border-purple-200',
      goals: 'bg-orange-50 text-orange-700 border-orange-200',
      relationships: 'bg-pink-50 text-pink-700 border-pink-200',
      mindfulness: 'bg-teal-50 text-teal-700 border-teal-200',
      growth: 'bg-indigo-50 text-indigo-700 border-indigo-200'
    }
    return colors[category]
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-stone-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center">
                <Lightbulb className="h-5 w-5 text-stone-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-stone-800 font-inknut">
                  Daily Writing Prompts
                </h2>
                <p className="text-sm text-stone-600">
                  Choose a prompt to spark your writing
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-stone-400 hover:text-stone-600"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="space-y-4">
              {dailyPrompts.map((prompt, index) => (
                <div
                  key={prompt.id}
                  className="group cursor-pointer"
                  onClick={() => handlePromptClick(prompt)}
                >
                  <div className="p-4 border border-stone-200 rounded-lg hover:border-stone-300 hover:shadow-sm transition-all duration-200 bg-white">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(prompt.category)}`}>
                            {getCategoryDisplayName(prompt.category)}
                          </span>
                          <span className="text-xs text-stone-400">
                            Prompt {index + 1}
                          </span>
                        </div>
                        <p className="text-stone-700 font-inknut leading-relaxed">
                          {prompt.text}
                        </p>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <div className="w-8 h-8 bg-stone-100 rounded-full flex items-center justify-center">
                          <svg
                            className="w-4 h-4 text-stone-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer info */}
            <div className="mt-6 p-4 bg-stone-50 rounded-lg">
              <p className="text-sm text-stone-600 text-center">
                <Lightbulb className="inline h-4 w-4 mr-1" />
                New prompts are available every day to inspire your writing
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
