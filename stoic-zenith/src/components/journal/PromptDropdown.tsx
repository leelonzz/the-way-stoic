import React from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import {
  Sparkles,
  Heart,
  Lightbulb,
  Target,
  Book,
  Sunrise,
  Brain,
  RefreshCw,
} from 'lucide-react'
import { useJournalPrompts } from '@/hooks/useJournalPrompts'
import { toast } from '@/components/ui/use-toast'

interface PromptDropdownProps {
  onSelectPrompt: (promptText: string) => void
}

// Map categories to icons and colors
const categoryConfig = {
  reflection: { icon: Brain, color: 'text-purple-600', label: 'Reflection' },
  gratitude: { icon: Heart, color: 'text-pink-600', label: 'Gratitude' },
  creative: { icon: Lightbulb, color: 'text-yellow-600', label: 'Creative' },
  goals: { icon: Target, color: 'text-blue-600', label: 'Goals' },
  stoic: { icon: Book, color: 'text-stone-600', label: 'Stoic' },
  mindfulness: { icon: Sunrise, color: 'text-green-600', label: 'Mindfulness' },
}

export const PromptDropdown: React.FC<PromptDropdownProps> = ({
  onSelectPrompt,
}) => {
  const { prompts, loading, error, refetch } = useJournalPrompts()

  const handleSelectPrompt = (promptText: string) => {
    onSelectPrompt(promptText)
    toast({
      title: 'Prompt Added',
      description: 'The writing prompt has been added to your journal.',
    })
  }

  const handleRefresh = async () => {
    try {
      await refetch()
      toast({
        title: 'Prompts Refreshed',
        description: 'New prompts have been loaded.',
      })
    } catch (err) {
      toast({
        title: 'Refresh Failed',
        description: 'Could not refresh prompts. Please try again.',
        variant: 'destructive',
      })
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="w-10 h-10 p-0"
          title="Writing prompts"
        >
          <Sparkles className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Today's Writing Prompts
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            className="h-6 w-6 p-0"
            disabled={loading}
          >
            <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {loading && prompts.length === 0 ? (
          <DropdownMenuItem disabled>
            <div className="flex items-center gap-2 text-stone-500">
              <RefreshCw className="h-3 w-3 animate-spin" />
              Loading prompts...
            </div>
          </DropdownMenuItem>
        ) : error && prompts.length === 0 ? (
          <DropdownMenuItem disabled>
            <div className="text-stone-500 text-sm">Failed to load prompts</div>
          </DropdownMenuItem>
        ) : (
          <>
            {prompts.slice(0, 3).map((prompt, index) => {
              const config =
                categoryConfig[
                  prompt.category as keyof typeof categoryConfig
                ] || categoryConfig.reflection
              const IconComponent = config.icon

              return (
                <DropdownMenuItem
                  key={prompt.id}
                  onClick={() => handleSelectPrompt(prompt.prompt_text)}
                  className="cursor-pointer p-3"
                >
                  <div className="flex flex-col gap-2 w-full">
                    {/* Category Badge */}
                    <div
                      className={`flex items-center gap-1.5 text-xs font-medium ${config.color}`}
                    >
                      <IconComponent className="h-3 w-3" />
                      {config.label}
                    </div>

                    {/* Prompt Text */}
                    <div className="text-sm text-stone-700 leading-relaxed">
                      {prompt.prompt_text}
                    </div>
                  </div>
                </DropdownMenuItem>
              )
            })}

            <DropdownMenuSeparator />
            <DropdownMenuItem
              disabled
              className="text-xs text-stone-500 justify-center"
            >
              Click any prompt to add it to your journal
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
