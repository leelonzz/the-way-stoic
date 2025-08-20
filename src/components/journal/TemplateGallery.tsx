import React, { useState, useEffect, useMemo, useCallback } from 'react'
import {
  Search,
  X,
  BookTemplate,
  Heart,
  Sunrise,
  Target,
  Moon,
  Calendar,
  FileText,
  Plus,
  Save,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { JournalTemplate, JournalBlock } from './types'
import { toast } from '@/components/ui/use-toast'
import { TemplatePreview } from './TemplatePreview'
import { EnhancedRichTextEditor } from './EnhancedRichTextEditor'

interface TemplateGalleryProps {
  isOpen: boolean
  onClose: () => void
  onApplyTemplate: (template: JournalTemplate) => void
  onCreateTemplate: () => void
  onSaveToMyTemplates?: (template: JournalTemplate) => void
}

// Icon mapping for templates
const getTemplateIcon = (iconName: string) => {
  const iconMap = {
    heart: Heart,
    sunrise: Sunrise,
    target: Target,
    moon: Moon,
    'calendar-week': Calendar,
    'file-text': FileText,
    'book-template': BookTemplate,
  }
  return iconMap[iconName as keyof typeof iconMap] || FileText
}

// Mock system templates (will be replaced with API call)
const SYSTEM_TEMPLATES: JournalTemplate[] = [
  {
    id: 'daily-gratitude',
    name: 'Daily Gratitude',
    description:
      'Cultivate appreciation and positive mindset with structured gratitude practice',
    category: 'getting_started',
    icon: 'heart',
    template_content: {
      blocks: [
        {
          id: '1',
          type: 'heading',
          level: 1,
          text: 'Daily Gratitude Practice',
          richText: '<h1>Daily Gratitude Practice</h1>',
          createdAt: new Date(),
        },
        {
          id: '2',
          type: 'paragraph',
          text: 'Take a moment to reflect on the positive aspects of your life and express genuine appreciation.',
          richText:
            '<p><em>Take a moment to reflect on the positive aspects of your life and express genuine appreciation.</em></p>',
          createdAt: new Date(),
        },
        {
          id: '3',
          type: 'heading',
          level: 3,
          text: "🙏 Three Things I'm Grateful For Today:",
          richText: "<h3>🙏 Three Things I'm Grateful For Today:</h3>",
          createdAt: new Date(),
        },
        {
          id: '4',
          type: 'bullet-list',
          text: '• Something small that brought me joy:',
          richText: '<ul><li>Something small that brought me joy:</li></ul>',
          createdAt: new Date(),
        },
        {
          id: '5',
          type: 'bullet-list',
          text: '• A person who made a positive impact:',
          richText: '<ul><li>A person who made a positive impact:</li></ul>',
          createdAt: new Date(),
        },
        {
          id: '6',
          type: 'bullet-list',
          text: '• An opportunity or experience I appreciate:',
          richText:
            '<ul><li>An opportunity or experience I appreciate:</li></ul>',
          createdAt: new Date(),
        },
        {
          id: '7',
          type: 'heading',
          level: 3,
          text: "💫 Why I'm Grateful:",
          richText: "<h3>💫 Why I'm Grateful:</h3>",
          createdAt: new Date(),
        },
        {
          id: '8',
          type: 'paragraph',
          text: 'Reflect on why these things matter to you and how they contribute to your well-being...',
          richText:
            '<p>Reflect on why these things matter to you and how they contribute to your well-being...</p>',
          createdAt: new Date(),
        },
        {
          id: '9',
          type: 'heading',
          level: 3,
          text: '🌟 Gratitude Intention:',
          richText: '<h3>🌟 Gratitude Intention:</h3>',
          createdAt: new Date(),
        },
        {
          id: '10',
          type: 'paragraph',
          text: 'How can I express or share this gratitude today?',
          richText: '<p>How can I express or share this gratitude today?</p>',
          createdAt: new Date(),
        },
      ] as JournalBlock[],
    },
    is_system: true,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: '5-minutes-am',
    name: '5 minutes A.M.',
    description:
      'Quick morning check-in to center yourself and set positive intentions for the day ahead',
    category: 'getting_started',
    icon: 'sunrise',
    template_content: {
      blocks: [
        {
          id: '1',
          type: 'heading',
          level: 1,
          text: '🌅 Morning Check-In (5 minutes)',
          richText: '<h1>🌅 Morning Check-In (5 minutes)</h1>',
          createdAt: new Date(),
        },
        {
          id: '2',
          type: 'paragraph',
          text: 'Take a few deep breaths and tune into this moment.',
          richText:
            '<p><em>Take a few deep breaths and tune into this moment.</em></p>',
          createdAt: new Date(),
        },
        {
          id: '3',
          type: 'heading',
          level: 3,
          text: '💭 How am I feeling right now?',
          richText: '<h3>💭 How am I feeling right now?</h3>',
          createdAt: new Date(),
        },
        {
          id: '4',
          type: 'paragraph',
          text: 'Physically, mentally, emotionally...',
          richText: '<p>Physically, mentally, emotionally...</p>',
          createdAt: new Date(),
        },
        {
          id: '5',
          type: 'heading',
          level: 3,
          text: '🎯 What do I want to focus on today?',
          richText: '<h3>🎯 What do I want to focus on today?</h3>',
          createdAt: new Date(),
        },
        {
          id: '6',
          type: 'paragraph',
          text: 'One main priority or intention...',
          richText: '<p>One main priority or intention...</p>',
          createdAt: new Date(),
        },
        {
          id: '7',
          type: 'heading',
          level: 3,
          text: '✨ What energy do I want to bring to today?',
          richText: '<h3>✨ What energy do I want to bring to today?</h3>',
          createdAt: new Date(),
        },
        {
          id: '8',
          type: 'paragraph',
          text: 'Calm, focused, joyful, curious...',
          richText: '<p>Calm, focused, joyful, curious...</p>',
          createdAt: new Date(),
        },
        {
          id: '9',
          type: 'heading',
          level: 3,
          text: '🌱 One small step I can take:',
          richText: '<h3>🌱 One small step I can take:</h3>',
          createdAt: new Date(),
        },
        {
          id: '10',
          type: 'paragraph',
          text: "What's one small action that will move me forward?",
          richText: "<p>What's one small action that will move me forward?</p>",
          createdAt: new Date(),
        },
      ] as JournalBlock[],
    },
    is_system: true,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 'daily-goal-plan',
    name: 'Daily Goal Plan',
    description: 'Structure your day with clear goals and action steps',
    category: 'getting_started',
    icon: 'target',
    template_content: {
      blocks: [
        {
          id: '1',
          type: 'heading',
          level: 2,
          text: 'Daily Goal Plan',
          richText: '<h2>Daily Goal Plan</h2>',
          createdAt: new Date(),
        },
        {
          id: '2',
          type: 'paragraph',
          text: 'Main Goal for Today:',
          richText: '<p><strong>Main Goal for Today:</strong></p>',
          createdAt: new Date(),
        },
        {
          id: '3',
          type: 'paragraph',
          text: '',
          richText: '<p></p>',
          createdAt: new Date(),
        },
      ] as JournalBlock[],
    },
    is_system: true,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 'evening-reflection',
    name: 'Evening',
    description: 'End your day with thoughtful reflection',
    category: 'reflections',
    icon: 'moon',
    template_content: {
      blocks: [
        {
          id: '1',
          type: 'heading',
          level: 2,
          text: 'Evening Reflection',
          richText: '<h2>Evening Reflection</h2>',
          createdAt: new Date(),
        },
        {
          id: '2',
          type: 'paragraph',
          text: 'What went well today?',
          richText: '<p><strong>What went well today?</strong></p>',
          createdAt: new Date(),
        },
        {
          id: '3',
          type: 'paragraph',
          text: '',
          richText: '<p></p>',
          createdAt: new Date(),
        },
      ] as JournalBlock[],
    },
    is_system: true,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 'weekly-review',
    name: 'Weekly',
    description: 'Comprehensive weekly reflection and planning ahead',
    category: 'reflections',
    icon: 'calendar-week',
    template_content: {
      blocks: [
        {
          id: '1',
          type: 'heading',
          level: 1,
          text: 'Weekly Review',
          richText: '<h1>Weekly Review</h1>',
          createdAt: new Date(),
        },
        {
          id: '2',
          type: 'heading',
          level: 3,
          text: 'Wins & Accomplishments',
          richText: '<h3>Wins & Accomplishments</h3>',
          createdAt: new Date(),
        },
        {
          id: '3',
          type: 'bullet-list',
          text: '• ',
          richText: '<ul><li></li></ul>',
          createdAt: new Date(),
        },
      ] as JournalBlock[],
    },
    is_system: true,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 'bullet-journal',
    name: 'Bullet Journal',
    description: 'Rapid logging system for tracking tasks, events, and notes',
    category: 'getting_started',
    icon: 'book-template',
    template_content: {
      blocks: [
        {
          id: '1',
          type: 'heading',
          level: 2,
          text: 'Bullet Journal Entry',
          richText: '<h2>Bullet Journal Entry</h2>',
          createdAt: new Date(),
        },
        {
          id: '2',
          type: 'paragraph',
          text: 'Tasks:',
          richText: '<p><strong>Tasks:</strong></p>',
          createdAt: new Date(),
        },
        {
          id: '3',
          type: 'bullet-list',
          text: '• ',
          richText: '<ul><li></li></ul>',
          createdAt: new Date(),
        },
        {
          id: '4',
          type: 'paragraph',
          text: 'Events:',
          richText: '<p><strong>Events:</strong></p>',
          createdAt: new Date(),
        },
        {
          id: '5',
          type: 'bullet-list',
          text: '○ ',
          richText: '<ul><li></li></ul>',
          createdAt: new Date(),
        },
        {
          id: '6',
          type: 'paragraph',
          text: 'Notes:',
          richText: '<p><strong>Notes:</strong></p>',
          createdAt: new Date(),
        },
        {
          id: '7',
          type: 'bullet-list',
          text: '- ',
          richText: '<ul><li></li></ul>',
          createdAt: new Date(),
        },
      ] as JournalBlock[],
    },
    is_system: true,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 'morning-reflection',
    name: 'Morning',
    description: 'Start your day with mindful morning reflection',
    category: 'reflections',
    icon: 'sunrise',
    template_content: {
      blocks: [
        {
          id: '1',
          type: 'heading',
          level: 2,
          text: 'Morning Reflection',
          richText: '<h2>Morning Reflection</h2>',
          createdAt: new Date(),
        },
        {
          id: '2',
          type: 'paragraph',
          text: 'How do I feel this morning?',
          richText: '<p><strong>How do I feel this morning?</strong></p>',
          createdAt: new Date(),
        },
        {
          id: '3',
          type: 'paragraph',
          text: '',
          richText: '<p></p>',
          createdAt: new Date(),
        },
        {
          id: '4',
          type: 'paragraph',
          text: 'What am I looking forward to today?',
          richText:
            '<p><strong>What am I looking forward to today?</strong></p>',
          createdAt: new Date(),
        },
        {
          id: '5',
          type: 'paragraph',
          text: '',
          richText: '<p></p>',
          createdAt: new Date(),
        },
      ] as JournalBlock[],
    },
    is_system: true,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 'monthly-review',
    name: 'Monthly',
    description: 'Comprehensive monthly reflection and goal setting',
    category: 'reflections',
    icon: 'calendar-week',
    template_content: {
      blocks: [
        {
          id: '1',
          type: 'heading',
          level: 1,
          text: 'Monthly Review',
          richText: '<h1>Monthly Review</h1>',
          createdAt: new Date(),
        },
        {
          id: '2',
          type: 'heading',
          level: 3,
          text: 'Major Accomplishments',
          richText: '<h3>Major Accomplishments</h3>',
          createdAt: new Date(),
        },
        {
          id: '3',
          type: 'bullet-list',
          text: '• ',
          richText: '<ul><li></li></ul>',
          createdAt: new Date(),
        },
        {
          id: '4',
          type: 'heading',
          level: 3,
          text: 'Lessons Learned',
          richText: '<h3>Lessons Learned</h3>',
          createdAt: new Date(),
        },
        {
          id: '5',
          type: 'bullet-list',
          text: '• ',
          richText: '<ul><li></li></ul>',
          createdAt: new Date(),
        },
        {
          id: '6',
          type: 'heading',
          level: 3,
          text: 'Goals for Next Month',
          richText: '<h3>Goals for Next Month</h3>',
          createdAt: new Date(),
        },
        {
          id: '7',
          type: 'numbered-list',
          text: '1. ',
          richText: '<ol><li></li></ol>',
          createdAt: new Date(),
        },
      ] as JournalBlock[],
    },
    is_system: true,
    created_at: new Date(),
    updated_at: new Date(),
  },
]

export const TemplateGallery: React.FC<TemplateGalleryProps> = ({
  isOpen,
  onClose,
  onApplyTemplate,
  onCreateTemplate,
  onSaveToMyTemplates,
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [systemTemplates, setSystemTemplates] = useState<JournalTemplate[]>([])
  const [userTemplates, setUserTemplates] = useState<JournalTemplate[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('gallery')
  const [selectedTemplate, setSelectedTemplate] =
    useState<JournalTemplate | null>(null)
  const [isCreatingNew, setIsCreatingNew] = useState(false)

  // Template editor state
  const [templateBlocks, setTemplateBlocks] = useState<JournalBlock[]>([])
  const [isSaving, setIsSaving] = useState(false)

  // Load templates when modal opens
  useEffect(() => {
    if (isOpen) {
      loadTemplates()
    }
  }, [isOpen])

  // Auto-select first template when templates load
  useEffect(() => {
    if (
      systemTemplates.length > 0 &&
      !selectedTemplate &&
      activeTab === 'gallery'
    ) {
      setSelectedTemplate(systemTemplates[0])
    }
  }, [systemTemplates, selectedTemplate, activeTab])

  // Handle tab switching and template selection
  useEffect(() => {
    if (
      activeTab === 'gallery' &&
      systemTemplates.length > 0 &&
      !selectedTemplate
    ) {
      // Auto-select first template when switching to Gallery tab
      setSelectedTemplate(systemTemplates[0])
    } else if (
      activeTab === 'my-templates' &&
      userTemplates.length > 0 &&
      !selectedTemplate
    ) {
      // Auto-select first user template when switching to My Templates tab (if any exist)
      setSelectedTemplate(userTemplates[0])
    }
  }, [activeTab, systemTemplates, userTemplates, selectedTemplate])

  const loadTemplates = async () => {
    setLoading(true)
    try {
      // For now, use mock data. Later replace with API calls
      setSystemTemplates(SYSTEM_TEMPLATES)
      setUserTemplates([]) // Will load from API
    } catch (error) {
      console.error('Failed to load templates:', error)
      toast({
        title: 'Error',
        description: 'Failed to load templates. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  // Filter templates based on search query
  const filteredSystemTemplates = useMemo(() => {
    if (!searchQuery) return systemTemplates
    return systemTemplates.filter(
      template =>
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [systemTemplates, searchQuery])

  const filteredUserTemplates = useMemo(() => {
    if (!searchQuery) return userTemplates
    return userTemplates.filter(
      template =>
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [userTemplates, searchQuery])

  // Group system templates by category
  const gettingStartedTemplates = filteredSystemTemplates.filter(
    t => t.category === 'getting_started'
  )
  const reflectionTemplates = filteredSystemTemplates.filter(
    t => t.category === 'reflections'
  )

  const handleApplyTemplate = (template: JournalTemplate) => {
    onApplyTemplate(template)
    onClose()
    toast({
      title: 'Template Applied',
      description: `"${template.name}" template has been added to your journal entry.`,
    })
  }

  const handleSaveToMyTemplates = (template: JournalTemplate) => {
    if (onSaveToMyTemplates) {
      onSaveToMyTemplates(template)
      toast({
        title: 'Template Saved',
        description: `"${template.name}" has been saved to your templates.`,
      })
    }
  }

  // Template editor handlers
  const handleBlocksChange = useCallback((blocks: JournalBlock[]) => {
    setTemplateBlocks(blocks)
  }, [])

  const handleNewTemplate = () => {
    setIsCreatingNew(true)

    // Create a new template placeholder
    const newTemplateId = `new-${Date.now()}`
    const newTemplate: JournalTemplate = {
      id: newTemplateId,
      name: 'New Template',
      description: '',
      category: 'custom',
      icon: 'file-text',
      template_content: {
        blocks: [
          {
            id: '1',
            type: 'heading',
            level: 2,
            text: 'Template Title',
            richText: '<h2>Template Title</h2>',
            createdAt: new Date(),
          },
          {
            id: '2',
            type: 'paragraph',
            text: 'Start typing your template content here...',
            richText: '<p>Start typing your template content here...</p>',
            createdAt: new Date(),
          },
        ],
      },
      is_system: false,
      created_at: new Date(),
      updated_at: new Date(),
    }

    // Add to userTemplates and select it
    setUserTemplates(prev => [...prev, newTemplate])
    setSelectedTemplate(newTemplate)

    // Initialize editor with template blocks
    setTemplateBlocks(newTemplate.template_content.blocks)
  }

  const handleSaveTemplate = async () => {
    if (templateBlocks.length === 0) {
      toast({
        title: 'Template Content Required',
        description: 'Please add some content to your template.',
        variant: 'destructive',
      })
      return
    }

    setIsSaving(true)
    try {
      // Keep the current name or use the selected template's name
      const templateName = selectedTemplate?.name || 'New Template'

      const updatedTemplate: JournalTemplate = {
        id: selectedTemplate?.id || `custom-${Date.now()}`,
        name: templateName,
        description: selectedTemplate?.description,
        category: 'custom',
        icon: selectedTemplate?.icon || 'file-text',
        template_content: {
          blocks: templateBlocks,
        },
        is_system: false,
        created_at: selectedTemplate?.created_at || new Date(),
        updated_at: new Date(),
      }

      // Update the existing template in userTemplates
      setUserTemplates(prev =>
        prev.map(template =>
          template.id === selectedTemplate?.id ? updatedTemplate : template
        )
      )

      setIsCreatingNew(false)
      setSelectedTemplate(updatedTemplate)

      toast({
        title: 'Template Saved',
        description: `Template "${templateName}" has been saved successfully.`,
      })
    } catch (error) {
      console.error('Failed to save template:', error)
      toast({
        title: 'Save Failed',
        description: 'Failed to save template. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancelTemplate = () => {
    // Remove the new template if it was just created
    if (selectedTemplate && selectedTemplate.id.startsWith('new-')) {
      setUserTemplates(prev =>
        prev.filter(template => template.id !== selectedTemplate.id)
      )
    }
    setIsCreatingNew(false)
    setSelectedTemplate(null)
  }

  const TemplateCard: React.FC<{
    template: JournalTemplate
    showSaveOption?: boolean
  }> = ({ template, showSaveOption = false }) => {
    const IconComponent = getTemplateIcon(template.icon)
    const isSelected = selectedTemplate?.id === template.id

    return (
      <div
        className={`border rounded-lg p-3 cursor-pointer transition-all hover:shadow-sm ${
          isSelected
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-200 hover:border-gray-300'
        }`}
        onClick={() => setSelectedTemplate(template)}
      >
        <div className="flex items-center gap-3">
          <div
            className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center`}
          >
            <IconComponent
              className={`h-4 w-4 ${
                isSelected ? 'text-blue-600' : 'text-gray-600'
              }`}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3
              className={`font-medium text-sm truncate ${
                isSelected ? 'text-blue-900' : 'text-gray-900'
              }`}
            >
              {template.name}
            </h3>
            {template.description && (
              <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                {template.description}
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] p-0">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Daily Gratitude
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-md transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Split Panel Layout */}
        <div className="flex h-[calc(90vh-80px)] bg-white">
          {/* Left Sidebar */}
          <div className="w-80 border-r border-gray-200 flex flex-col bg-white">
            {/* Tab Navigation */}
            <div className="p-4">
              <div className="flex bg-gray-200 rounded-lg p-1">
                <button
                  className={`flex-1 px-3 py-2 text-sm rounded-md transition-colors ${
                    activeTab === 'gallery'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  onClick={() => {
                    setActiveTab('gallery')
                    setIsCreatingNew(false)
                    // Auto-select first template if none selected
                    if (!selectedTemplate && systemTemplates.length > 0) {
                      setSelectedTemplate(systemTemplates[0])
                    }
                  }}
                >
                  Gallery
                </button>
                <button
                  className={`flex-1 px-3 py-2 text-sm rounded-md transition-colors ${
                    activeTab === 'my-templates'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  onClick={() => {
                    setActiveTab('my-templates')
                    setSelectedTemplate(null)
                    setIsCreatingNew(false)
                  }}
                >
                  My templates
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="px-4 pb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search Templates"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-10 text-sm"
                />
              </div>
            </div>

            {/* Template List */}
            <div className="flex-1 overflow-y-auto px-4 pb-6">
              {activeTab === 'gallery' && (
                <div className="space-y-6">
                  {/* Getting Started Section */}
                  {gettingStartedTemplates.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2 text-sm uppercase tracking-wide">
                        GETTING STARTED
                      </h3>
                      <p className="text-xs text-gray-600 mb-3">
                        Templates are a great way to add structure and
                        consistency to your entries.
                      </p>
                      <div className="space-y-2">
                        {gettingStartedTemplates.map(template => (
                          <TemplateCard
                            key={template.id}
                            template={template}
                            showSaveOption={true}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Reflections Section */}
                  {reflectionTemplates.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2 text-sm uppercase tracking-wide">
                        REFLECTIONS
                      </h3>
                      <p className="text-xs text-gray-600 mb-3">
                        Explore your thoughts and emotions through
                        introspection.
                      </p>
                      <div className="space-y-2">
                        {reflectionTemplates.map(template => (
                          <TemplateCard
                            key={template.id}
                            template={template}
                            showSaveOption={true}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'my-templates' && (
                <div className="space-y-4">
                  {/* New Template Button */}
                  <Button
                    onClick={handleNewTemplate}
                    className="w-full border-2 border-dashed border-gray-300 bg-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-400 transition-colors justify-start h-auto p-3"
                    variant="outline"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Template
                  </Button>

                  {/* User Templates */}
                  {filteredUserTemplates.length > 0 ? (
                    <div className="space-y-2">
                      {filteredUserTemplates.map(template => (
                        <TemplateCard key={template.id} template={template} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No custom templates yet</p>
                      <p className="text-xs mt-1">
                        Create your first template to get started
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Conditional Content */}
          {isCreatingNew ? (
            // Full-Size Template Editor
            <div className="flex-1 flex flex-col">
              {/* Full Editor Area */}
              <div className="flex-1 overflow-hidden">
                <div className="h-full overflow-auto p-6 bg-white">
                  <EnhancedRichTextEditor
                    blocks={templateBlocks}
                    onChange={handleBlocksChange}
                    showPlaceholder={true}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="p-6 bg-white border-t border-gray-200 flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={handleCancelTemplate}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveTemplate}
                  disabled={isSaving}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : activeTab === 'my-templates' && !selectedTemplate ? (
            // Blank panel for My Templates
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium mb-2">No template selected</p>
                <p className="text-sm">
                  Choose a template from the list or create a new one
                </p>
              </div>
            </div>
          ) : (
            // Template Preview
            <TemplatePreview
              template={selectedTemplate}
              onUseNow={handleApplyTemplate}
              onSaveToMyTemplates={
                onSaveToMyTemplates ? handleSaveToMyTemplates : undefined
              }
              showSaveOption={activeTab === 'gallery'}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
