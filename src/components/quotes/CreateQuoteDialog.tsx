'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Plus } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface CreateQuoteDialogProps {
  isOpen: boolean
  onClose: () => void
  onCreateQuote: (quote: { text: string; author: string; source?: string; category: string; mood_tags: string[]; is_private: boolean }) => Promise<boolean>
}

export function CreateQuoteDialog({ isOpen, onClose, onCreateQuote }: CreateQuoteDialogProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    text: '',
    author: 'Me',
    source: ''
  })

  const resetForm = () => {
    setFormData({
      text: '',
      author: 'Me',
      source: ''
    })
  }

  const handleSubmit = async () => {
    if (!formData.text.trim()) {
      toast({
        title: "Quote text required",
        description: "Please enter a quote",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)
    try {
      const success = await onCreateQuote({
        text: formData.text.trim(),
        author: formData.author.trim() || 'Me',
        source: formData.source.trim() || undefined,
        category: 'personal',
        mood_tags: [],
        is_private: false
      })

      if (success) {
        toast({
          title: "Quote created!",
          description: "Your quote has been added to My Quotes"
        })
        resetForm()
        onClose()
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add New Quote
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="quote-text">Quote *</Label>
            <Textarea
              id="quote-text"
              placeholder="Enter your quote..."
              value={formData.text}
              onChange={(e) => setFormData(prev => ({ ...prev, text: e.target.value }))}
              className="mt-1"
              rows={4}
              disabled={isSubmitting}
            />
          </div>

          <div>
            <Label htmlFor="author">Author</Label>
            <Input
              id="author"
              placeholder="Quote author"
              value={formData.author}
              onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
              className="mt-1"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <Label htmlFor="source">Source (Optional)</Label>
            <Input
              id="source"
              placeholder="Book, speech, etc."
              value={formData.source}
              onChange={(e) => setFormData(prev => ({ ...prev, source: e.target.value }))}
              className="mt-1"
              disabled={isSubmitting}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!formData.text.trim() || isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Quote'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}