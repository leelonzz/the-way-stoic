'use client'

import React, { useState, useCallback } from 'react'
import { ArrayOfObjectsInputProps, set, unset } from 'sanity'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { markdownToPortableText, isValidMarkdown } from '@/lib/markdownToPortableText'
import { PortableText } from '@portabletext/react'
import { Eye, Edit, Wand2 } from 'lucide-react'

export function MarkdownBodyInput(props: ArrayOfObjectsInputProps) {
  const { onChange, value = [] } = props
  const [markdownText, setMarkdownText] = useState('')
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit')
  const [isConverting, setIsConverting] = useState(false)
  const [conversionError, setConversionError] = useState<string | null>(null)

  const handleMarkdownChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMarkdownText(event.target.value)
    setConversionError(null)
  }, [])

  const convertToPortableText = useCallback(async () => {
    if (!markdownText.trim()) {
      setConversionError('Please enter some markdown text to convert')
      return
    }

    setIsConverting(true)
    setConversionError(null)

    try {
      const blocks = markdownToPortableText(markdownText)
      
      if (blocks && blocks.length > 0) {
        onChange(set(blocks))
        setMarkdownText('')
        setActiveTab('preview')
      } else {
        setConversionError('No content blocks were generated from the markdown')
      }
    } catch (error) {
      console.error('Conversion error:', error)
      setConversionError(error instanceof Error ? error.message : 'Failed to convert markdown')
    } finally {
      setIsConverting(false)
    }
  }, [markdownText, onChange])

  const clearContent = useCallback(() => {
    onChange(unset())
    setMarkdownText('')
    setConversionError(null)
  }, [onChange])

  const hasValidMarkdown = markdownText.trim() && isValidMarkdown(markdownText)
  const hasPortableTextContent = value && value.length > 0

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Content Body</h3>
        <div className="flex gap-2">
          {hasValidMarkdown && (
            <Badge variant="secondary" className="text-xs">
              Markdown detected
            </Badge>
          )}
          {hasPortableTextContent && (
            <Badge variant="default" className="text-xs">
              {value.length} block{value.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(tab) => setActiveTab(tab as 'edit' | 'preview')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="edit" className="flex items-center gap-2">
            <Edit size={16} />
            Markdown Editor
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Eye size={16} />
            Preview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="edit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Write in Markdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={markdownText}
                onChange={handleMarkdownChange}
                placeholder="# Your Title Here

Write your content using markdown syntax:

- **Bold text**
- *Italic text*
- `code snippets`
- [Links](https://example.com)

## Subheading

> Blockquotes for emphasis

```
Code blocks
```"
                rows={12}
                className="font-mono text-sm"
              />
              
              {conversionError && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                  {conversionError}
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={convertToPortableText}
                  disabled={!markdownText.trim() || isConverting}
                  className="flex items-center gap-2"
                >
                  <Wand2 size={16} />
                  {isConverting ? 'Converting...' : 'Convert to Rich Text'}
                </Button>
                
                {hasPortableTextContent && (
                  <Button variant="outline" onClick={clearContent}>
                    Clear All Content
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Rich Text Preview</CardTitle>
            </CardHeader>
            <CardContent>
              {hasPortableTextContent ? (
                <div className="prose prose-sm max-w-none">
                  <PortableText
                    value={value}
                    components={{
                      block: {
                        normal: ({ children }) => <p className="mb-4">{children}</p>,
                        h1: ({ children }) => <h1 className="text-3xl font-bold mb-4">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-2xl font-semibold mb-3">{children}</h2>,
                        h3: ({ children }) => <h3 className="text-xl font-medium mb-2">{children}</h3>,
                        h4: ({ children }) => <h4 className="text-lg font-medium mb-2">{children}</h4>,
                        blockquote: ({ children }) => (
                          <blockquote className="border-l-4 border-gray-300 pl-4 italic mb-4">
                            {children}
                          </blockquote>
                        ),
                      },
                      marks: {
                        strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                        em: ({ children }) => <em className="italic">{children}</em>,
                        code: ({ children }) => (
                          <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">
                            {children}
                          </code>
                        ),
                        link: ({ children, value }) => (
                          <a
                            href={value?.href}
                            className="text-blue-600 hover:underline"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {children}
                          </a>
                        ),
                      },
                    }}
                  />
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No content yet. Switch to the Markdown Editor tab to start writing.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}