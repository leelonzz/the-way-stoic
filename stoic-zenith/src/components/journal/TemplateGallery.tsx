import React, { useState, useEffect, useMemo } from 'react'
import { Search, X, BookTemplate, Heart, Sunrise, Target, Moon, Calendar, FileText, Plus, Camera } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'
import { JournalTemplate, JournalBlock } from './types'
import { toast } from '@/components/ui/use-toast'
import { TemplatePreview } from './TemplatePreview'

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
    'heart': Heart,
    'sunrise': Sunrise,
    'target': Target,
    'moon': Moon,
    'calendar-week': Calendar,
    'file-text': FileText,
    'book-template': BookTemplate,
    'camera': Camera,
  }
  return iconMap[iconName as keyof typeof iconMap] || FileText
}

// Mock system templates (will be replaced with API call)
const SYSTEM_TEMPLATES: JournalTemplate[] = [
  {
    id: 'daily-gratitude',
    name: 'Daily Gratitude',
    description: 'Start your day with gratitude and positive reflection',
    category: 'getting_started',
    icon: 'heart',
    template_content: {
      blocks: [
        {
          id: '1',
          type: 'heading',
          level: 2,
          text: 'Daily Gratitude',
          richText: '<h2>Daily Gratitude</h2>',
          createdAt: new Date()
        },
        {
          id: '2',
          type: 'paragraph',
          text: 'TODAY I AM GRATEFUL FOR:',
          richText: '<p><strong>TODAY I AM GRATEFUL FOR:</strong></p>',
          createdAt: new Date()
        },
        {
          id: '3',
          type: 'bullet-list',
          text: '• ',
          richText: '<ul><li></li></ul>',
          createdAt: new Date()
        }
      ] as JournalBlock[]
    },
    is_system: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: '5-minutes-am',
    name: '5 minutes A.M.',
    description: 'Quick morning reflection to set intentions for the day',
    category: 'getting_started',
    icon: 'sunrise',
    template_content: {
      blocks: [
        {
          id: '1',
          type: 'heading',
          level: 2,
          text: 'Morning Reflection (5 minutes)',
          richText: '<h2>Morning Reflection (5 minutes)</h2>',
          createdAt: new Date()
        },
        {
          id: '2',
          type: 'paragraph',
          text: 'How am I feeling right now?',
          richText: '<p><strong>How am I feeling right now?</strong></p>',
          createdAt: new Date()
        },
        {
          id: '3',
          type: 'paragraph',
          text: '',
          richText: '<p></p>',
          createdAt: new Date()
        }
      ] as JournalBlock[]
    },
    is_system: true,
    created_at: new Date(),
    updated_at: new Date()
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
          createdAt: new Date()
        },
        {
          id: '2',
          type: 'paragraph',
          text: 'Main Goal for Today:',
          richText: '<p><strong>Main Goal for Today:</strong></p>',
          createdAt: new Date()
        },
        {
          id: '3',
          type: 'paragraph',
          text: '',
          richText: '<p></p>',
          createdAt: new Date()
        }
      ] as JournalBlock[]
    },
    is_system: true,
    created_at: new Date(),
    updated_at: new Date()
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
          createdAt: new Date()
        },
        {
          id: '2',
          type: 'paragraph',
          text: 'What went well today?',
          richText: '<p><strong>What went well today?</strong></p>',
          createdAt: new Date()
        },
        {
          id: '3',
          type: 'paragraph',
          text: '',
          richText: '<p></p>',
          createdAt: new Date()
        }
      ] as JournalBlock[]
    },
    is_system: true,
    created_at: new Date(),
    updated_at: new Date()
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
          createdAt: new Date()
        },
        {
          id: '2',
          type: 'heading',
          level: 3,
          text: 'Wins & Accomplishments',
          richText: '<h3>Wins & Accomplishments</h3>',
          createdAt: new Date()
        },
        {
          id: '3',
          type: 'bullet-list',
          text: '• ',
          richText: '<ul><li></li></ul>',
          createdAt: new Date()
        }
      ] as JournalBlock[]
    },
    is_system: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 'one-photo',
    name: 'One photo',
    description: 'Capture and reflect on a meaningful moment with a photo',
    category: 'getting_started',
    icon: 'camera',
    template_content: {
      blocks: [
        {
          id: '1',
          type: 'heading',
          level: 2,
          text: 'Photo Reflection',
          richText: '<h2>Photo Reflection</h2>',
          createdAt: new Date()
        },
        {
          id: '2',
          type: 'paragraph',
          text: 'Add a photo that represents your day:',
          richText: '<p><strong>Add a photo that represents your day:</strong></p>',
          createdAt: new Date()
        },
        {
          id: '3',
          type: 'paragraph',
          text: '[Photo placeholder]',
          richText: '<p><em>[Photo placeholder]</em></p>',
          createdAt: new Date()
        },
        {
          id: '4',
          type: 'paragraph',
          text: 'What does this photo represent to you?',
          richText: '<p><strong>What does this photo represent to you?</strong></p>',
          createdAt: new Date()
        },
        {
          id: '5',
          type: 'paragraph',
          text: '',
          richText: '<p></p>',
          createdAt: new Date()
        }
      ] as JournalBlock[]
    },
    is_system: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 'todo-list',
    name: 'To-Do List',
    description: 'Organize your tasks and track your productivity',
    category: 'getting_started',
    icon: 'target',
    template_content: {
      blocks: [
        {
          id: '1',
          type: 'heading',
          level: 2,
          text: 'Today\'s Tasks',
          richText: '<h2>Today\'s Tasks</h2>',
          createdAt: new Date()
        },
        {
          id: '2',
          type: 'paragraph',
          text: 'High Priority:',
          richText: '<p><strong>High Priority:</strong></p>',
          createdAt: new Date()
        },
        {
          id: '3',
          type: 'todo',
          text: '□ ',
          richText: '<p>□ </p>',
          createdAt: new Date()
        },
        {
          id: '4',
          type: 'todo',
          text: '□ ',
          richText: '<p>□ </p>',
          createdAt: new Date()
        },
        {
          id: '5',
          type: 'paragraph',
          text: 'Medium Priority:',
          richText: '<p><strong>Medium Priority:</strong></p>',
          createdAt: new Date()
        },
        {
          id: '6',
          type: 'todo',
          text: '□ ',
          richText: '<p>□ </p>',
          createdAt: new Date()
        },
        {
          id: '7',
          type: 'todo',
          text: '□ ',
          richText: '<p>□ </p>',
          createdAt: new Date()
        }
      ] as JournalBlock[]
    },
    is_system: true,
    created_at: new Date(),
    updated_at: new Date()
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
          createdAt: new Date()
        },
        {
          id: '2',
          type: 'paragraph',
          text: 'Tasks:',
          richText: '<p><strong>Tasks:</strong></p>',
          createdAt: new Date()
        },
        {
          id: '3',
          type: 'bullet-list',
          text: '• ',
          richText: '<ul><li></li></ul>',
          createdAt: new Date()
        },
        {
          id: '4',
          type: 'paragraph',
          text: 'Events:',
          richText: '<p><strong>Events:</strong></p>',
          createdAt: new Date()
        },
        {
          id: '5',
          type: 'bullet-list',
          text: '○ ',
          richText: '<ul><li></li></ul>',
          createdAt: new Date()
        },
        {
          id: '6',
          type: 'paragraph',
          text: 'Notes:',
          richText: '<p><strong>Notes:</strong></p>',
          createdAt: new Date()
        },
        {
          id: '7',
          type: 'bullet-list',
          text: '- ',
          richText: '<ul><li></li></ul>',
          createdAt: new Date()
        }
      ] as JournalBlock[]
    },
    is_system: true,
    created_at: new Date(),
    updated_at: new Date()
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
          createdAt: new Date()
        },
        {
          id: '2',
          type: 'paragraph',
          text: 'How do I feel this morning?',
          richText: '<p><strong>How do I feel this morning?</strong></p>',
          createdAt: new Date()
        },
        {
          id: '3',
          type: 'paragraph',
          text: '',
          richText: '<p></p>',
          createdAt: new Date()
        },
        {
          id: '4',
          type: 'paragraph',
          text: 'What am I looking forward to today?',
          richText: '<p><strong>What am I looking forward to today?</strong></p>',
          createdAt: new Date()
        },
        {
          id: '5',
          type: 'paragraph',
          text: '',
          richText: '<p></p>',
          createdAt: new Date()
        }
      ] as JournalBlock[]
    },
    is_system: true,
    created_at: new Date(),
    updated_at: new Date()
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
          createdAt: new Date()
        },
        {
          id: '2',
          type: 'heading',
          level: 3,
          text: 'Major Accomplishments',
          richText: '<h3>Major Accomplishments</h3>',
          createdAt: new Date()
        },
        {
          id: '3',
          type: 'bullet-list',
          text: '• ',
          richText: '<ul><li></li></ul>',
          createdAt: new Date()
        },
        {
          id: '4',
          type: 'heading',
          level: 3,
          text: 'Lessons Learned',
          richText: '<h3>Lessons Learned</h3>',
          createdAt: new Date()
        },
        {
          id: '5',
          type: 'bullet-list',
          text: '• ',
          richText: '<ul><li></li></ul>',
          createdAt: new Date()
        },
        {
          id: '6',
          type: 'heading',
          level: 3,
          text: 'Goals for Next Month',
          richText: '<h3>Goals for Next Month</h3>',
          createdAt: new Date()
        },
        {
          id: '7',
          type: 'numbered-list',
          text: '1. ',
          richText: '<ol><li></li></ol>',
          createdAt: new Date()
        }
      ] as JournalBlock[]
    },
    is_system: true,
    created_at: new Date(),
    updated_at: new Date()
  }
]


export const TemplateGallery: React.FC<TemplateGalleryProps> = ({
  isOpen,
  onClose,
  onApplyTemplate,
  onCreateTemplate,
  onSaveToMyTemplates
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [systemTemplates, setSystemTemplates] = useState<JournalTemplate[]>([])
  const [userTemplates, setUserTemplates] = useState<JournalTemplate[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('gallery')
  const [selectedTemplate, setSelectedTemplate] = useState<JournalTemplate | null>(null)

  // Load templates when modal opens
  useEffect(() => {
    if (isOpen) {
      loadTemplates()
    }
  }, [isOpen])

  // Auto-select first template when templates load
  useEffect(() => {
    if (systemTemplates.length > 0 && !selectedTemplate) {
      setSelectedTemplate(systemTemplates[0])
    }
  }, [systemTemplates, selectedTemplate])

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
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  // Filter templates based on search query
  const filteredSystemTemplates = useMemo(() => {
    if (!searchQuery) return systemTemplates
    return systemTemplates.filter(template => 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [systemTemplates, searchQuery])

  const filteredUserTemplates = useMemo(() => {
    if (!searchQuery) return userTemplates
    return userTemplates.filter(template => 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [userTemplates, searchQuery])

  // Group system templates by category
  const gettingStartedTemplates = filteredSystemTemplates.filter(t => t.category === 'getting_started')
  const reflectionTemplates = filteredSystemTemplates.filter(t => t.category === 'reflections')

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

  const TemplateCard: React.FC<{ template: JournalTemplate, showSaveOption?: boolean }> = ({ 
    template, 
    showSaveOption = false 
  }) => {
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
          <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
            isSelected ? 'bg-blue-100' : 'bg-gray-100'
          }`}>
            <IconComponent className={`h-4 w-4 ${
              isSelected ? 'text-blue-600' : 'text-gray-600'
            }`} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className={`font-medium text-sm truncate ${
              isSelected ? 'text-blue-900' : 'text-gray-900'
            }`}>
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
            <h2 className="text-xl font-semibold text-gray-900">Daily Gratitude</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-md transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Split Panel Layout */}
        <div className="flex h-[calc(90vh-80px)]">
          {/* Left Sidebar */}
          <div className="w-80 border-r border-gray-200 flex flex-col">
            {/* Tab Navigation */}
            <div className="p-4">
              <div className="flex bg-gray-200 rounded-lg p-1">
                <button
                  className={`flex-1 px-3 py-2 text-sm rounded-md transition-colors ${
                    activeTab === 'gallery'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  onClick={() => setActiveTab('gallery')}
                >
                  Gallery
                </button>
                <button
                  className={`flex-1 px-3 py-2 text-sm rounded-md transition-colors ${
                    activeTab === 'my-templates'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  onClick={() => setActiveTab('my-templates')}
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
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 text-sm"
                />
              </div>
            </div>

            {/* Template List */}
            <div className="flex-1 overflow-y-auto px-4 pb-4">
              {activeTab === 'gallery' && (
                <div className="space-y-6">
                  {/* Getting Started Section */}
                  {gettingStartedTemplates.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2 text-sm uppercase tracking-wide">GETTING STARTED</h3>
                      <p className="text-xs text-gray-600 mb-3">Templates are a great way to add structure and consistency to your entries.</p>
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
                      <h3 className="font-semibold text-gray-900 mb-2 text-sm uppercase tracking-wide">REFLECTIONS</h3>
                      <p className="text-xs text-gray-600 mb-3">Explore your thoughts and emotions through introspection.</p>
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
                    onClick={onCreateTemplate}
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
                        <TemplateCard 
                          key={template.id} 
                          template={template}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No custom templates yet</p>
                      <p className="text-xs mt-1">Create your first template to get started</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Template Preview */}
          <TemplatePreview
            template={selectedTemplate}
            onUseNow={handleApplyTemplate}
            onSaveToMyTemplates={onSaveToMyTemplates ? handleSaveToMyTemplates : undefined}
            showSaveOption={activeTab === 'gallery'}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}