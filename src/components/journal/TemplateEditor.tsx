import React, { useState, useCallback } from 'react'
import { X, Save, Undo, Redo, Heading, List, ListOrdered, Quote } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { EnhancedRichTextEditor } from './EnhancedRichTextEditor'
import { JournalTemplate, JournalBlock } from './types'
import { toast } from '@/components/ui/use-toast'

interface TemplateEditorProps {
  isOpen: boolean
  onClose: () => void
  onSaveTemplate: (template: Omit<JournalTemplate, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'is_system'>) => Promise<void>
  editingTemplate?: JournalTemplate | null
}

const TEMPLATE_ICONS = [
  { value: 'file-text', label: 'Document', icon: '📄' },
  { value: 'heart', label: 'Heart', icon: '❤️' },
  { value: 'sunrise', label: 'Sunrise', icon: '🌅' },
  { value: 'target', label: 'Target', icon: '🎯' },
  { value: 'moon', label: 'Moon', icon: '🌙' },
  { value: 'calendar-week', label: 'Calendar', icon: '📅' },
  { value: 'book-template', label: 'Book', icon: '📖' },
  { value: 'star', label: 'Star', icon: '⭐' },
  { value: 'lightbulb', label: 'Idea', icon: '💡' },
  { value: 'coffee', label: 'Coffee', icon: '☕' },
]

export const TemplateEditor: React.FC<TemplateEditorProps> = ({
  isOpen,
  onClose,
  onSaveTemplate,
  editingTemplate
}) => {
  const [templateName, setTemplateName] = useState('')
  const [templateDescription, setTemplateDescription] = useState('')
  const [templateIcon, setTemplateIcon] = useState('file-text')
  const [templateBlocks, setTemplateBlocks] = useState<JournalBlock[]>([])
  const [isSaving, setIsSaving] = useState(false)

  // Initialize form when editing an existing template
  React.useEffect(() => {
    if (editingTemplate) {
      setTemplateName(editingTemplate.name)
      setTemplateDescription(editingTemplate.description || '')
      setTemplateIcon(editingTemplate.icon)
      setTemplateBlocks(editingTemplate.template_content.blocks)
    } else {
      // Reset form for new template
      setTemplateName('')
      setTemplateDescription('')
      setTemplateIcon('file-text')
      setTemplateBlocks([
        {
          id: '1',
          type: 'heading',
          level: 2,
          text: 'Template Title',
          richText: '<h2>Template Title</h2>',
          createdAt: new Date()
        },
        {
          id: '2',
          type: 'paragraph',
          text: 'Start typing your template content here...',
          richText: '<p>Start typing your template content here...</p>',
          createdAt: new Date()
        }
      ])
    }
  }, [editingTemplate, isOpen])

  const handleBlocksChange = useCallback((blocks: JournalBlock[]) => {
    setTemplateBlocks(blocks)
  }, [])

  const handleSave = async () => {
    if (!templateName.trim()) {
      toast({
        title: 'Template Name Required',
        description: 'Please enter a name for your template.',
        variant: 'destructive'
      })
      return
    }

    if (templateBlocks.length === 0) {
      toast({
        title: 'Template Content Required',
        description: 'Please add some content to your template.',
        variant: 'destructive'
      })
      return
    }

    setIsSaving(true)
    try {
      const templateData: Omit<JournalTemplate, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'is_system'> = {
        name: templateName.trim(),
        description: templateDescription.trim() || undefined,
        category: 'custom',
        icon: templateIcon,
        template_content: {
          blocks: templateBlocks
        }
      }

      await onSaveTemplate(templateData)
      
      toast({
        title: 'Template Saved',
        description: `Template "${templateName}" has been saved successfully.`,
      })
      
      onClose()
    } catch (error) {
      console.error('Failed to save template:', error)
      toast({
        title: 'Save Failed',
        description: 'Failed to save template. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    onClose()
  }


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] p-0">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">New Template</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-md transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="flex flex-col h-[calc(90vh-80px)]">
          {/* Template Metadata */}
          <div className="p-6 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <Label htmlFor="template-name">Template Name *</Label>
                <Input
                  id="template-name"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="e.g., Morning Pages, Weekly Review"
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="template-icon">Icon</Label>
                <Select value={templateIcon} onValueChange={setTemplateIcon}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TEMPLATE_ICONS.map(icon => (
                      <SelectItem key={icon.value} value={icon.value}>
                        <div className="flex items-center gap-2">
                          <span>{icon.icon}</span>
                          <span>{icon.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="template-description">Description (optional)</Label>
              <Textarea
                id="template-description"
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
                placeholder="Describe what this template is for and how to use it..."
                rows={2}
              />
            </div>
          </div>

          {/* Formatting Toolbar */}
          <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Undo className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Redo className="h-4 w-4" />
              </Button>
              <div className="w-px h-6 bg-gray-300 mx-2" />
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Heading className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <List className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <ListOrdered className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Quote className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Template Content Editor */}
          <div className="flex-1 overflow-hidden">
            <div className="h-full overflow-auto p-6">
              <EnhancedRichTextEditor
                blocks={templateBlocks}
                onChange={handleBlocksChange}
                showPlaceholder={true}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
            <Button 
              variant="outline" 
              onClick={handleCancel}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
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
      </DialogContent>
    </Dialog>
  )
}