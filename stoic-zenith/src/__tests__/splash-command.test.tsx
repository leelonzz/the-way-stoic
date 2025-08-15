import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EnhancedRichTextEditor } from '../components/journal/EnhancedRichTextEditor'
import { JournalBlock } from '../components/journal/types'

// Mock the nanoid function to return predictable IDs
vi.mock('nanoid', () => ({
  nanoid: vi.fn(() => 'test-id-123')
}))

describe('Splash Command Functionality', () => {
  let mockOnChange: ReturnType<typeof vi.fn>
  let initialBlocks: JournalBlock[]

  beforeEach(() => {
    mockOnChange = vi.fn()
    initialBlocks = [
      {
        id: 'block-1',
        type: 'paragraph',
        text: '',
        richText: '',
        createdAt: new Date(),
      }
    ]
  })

  it('should detect splash command in lowercase', async () => {
    const user = userEvent.setup()
    
    render(
      <EnhancedRichTextEditor
        blocks={initialBlocks}
        onChange={mockOnChange}
      />
    )

    // Find the contenteditable element
    const editor = screen.getByRole('textbox')
    
    // Type "splash" in lowercase
    await user.type(editor, 'splash')
    
    // Wait for command menu to appear
    await waitFor(() => {
      expect(screen.getByText('Heading 1')).toBeInTheDocument()
    })
  })

  it('should detect splash command in uppercase', async () => {
    const user = userEvent.setup()
    
    render(
      <EnhancedRichTextEditor
        blocks={initialBlocks}
        onChange={mockOnChange}
      />
    )

    // Find the contenteditable element
    const editor = screen.getByRole('textbox')
    
    // Type "SPLASH" in uppercase
    await user.type(editor, 'SPLASH')
    
    // Wait for command menu to appear
    await waitFor(() => {
      expect(screen.getByText('Heading 1')).toBeInTheDocument()
    })
  })

  it('should detect splash command in mixed case', async () => {
    const user = userEvent.setup()
    
    render(
      <EnhancedRichTextEditor
        blocks={initialBlocks}
        onChange={mockOnChange}
      />
    )

    // Find the contenteditable element
    const editor = screen.getByRole('textbox')
    
    // Type "SpLaSh" in mixed case
    await user.type(editor, 'SpLaSh')
    
    // Wait for command menu to appear
    await waitFor(() => {
      expect(screen.getByText('Heading 1')).toBeInTheDocument()
    })
  })

  it('should filter commands based on search query after splash', async () => {
    const user = userEvent.setup()
    
    render(
      <EnhancedRichTextEditor
        blocks={initialBlocks}
        onChange={mockOnChange}
      />
    )

    // Find the contenteditable element
    const editor = screen.getByRole('textbox')
    
    // Type "splash h1" to search for heading 1
    await user.type(editor, 'splash h1')
    
    // Wait for command menu to appear with filtered results
    await waitFor(() => {
      expect(screen.getByText('Heading 1')).toBeInTheDocument()
      // Should not show other commands that don't match "h1"
      expect(screen.queryByText('Bullet List')).not.toBeInTheDocument()
    })
  })

  it('should execute command when selected from splash menu', async () => {
    const user = userEvent.setup()
    
    render(
      <EnhancedRichTextEditor
        blocks={initialBlocks}
        onChange={mockOnChange}
      />
    )

    // Find the contenteditable element
    const editor = screen.getByRole('textbox')
    
    // Type "splash"
    await user.type(editor, 'splash')
    
    // Wait for command menu to appear
    await waitFor(() => {
      expect(screen.getByText('Heading 1')).toBeInTheDocument()
    })

    // Click on Heading 1 command
    const heading1Button = screen.getByText('Heading 1')
    await user.click(heading1Button)
    
    // Verify that onChange was called with the updated block
    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalled()
      const lastCall = mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1]
      const updatedBlocks = lastCall[0]
      expect(updatedBlocks[0].type).toBe('heading')
      expect(updatedBlocks[0].level).toBe(1)
    })
  })

  it('should hide command menu when splash text is removed', async () => {
    const user = userEvent.setup()
    
    render(
      <EnhancedRichTextEditor
        blocks={initialBlocks}
        onChange={mockOnChange}
      />
    )

    // Find the contenteditable element
    const editor = screen.getByRole('textbox')
    
    // Type "splash" to show menu
    await user.type(editor, 'splash')
    
    // Wait for command menu to appear
    await waitFor(() => {
      expect(screen.getByText('Heading 1')).toBeInTheDocument()
    })

    // Clear the text
    await user.clear(editor)
    
    // Wait for command menu to disappear
    await waitFor(() => {
      expect(screen.queryByText('Heading 1')).not.toBeInTheDocument()
    })
  })

  it('should work on second line after first line content', async () => {
    const user = userEvent.setup()
    
    // Start with a block that has content
    const blocksWithContent: JournalBlock[] = [
      {
        id: 'block-1',
        type: 'paragraph',
        text: 'First line content',
        richText: 'First line content',
        createdAt: new Date(),
      }
    ]
    
    render(
      <EnhancedRichTextEditor
        blocks={blocksWithContent}
        onChange={mockOnChange}
      />
    )

    // Find the contenteditable element
    const editor = screen.getByRole('textbox')
    
    // Position cursor at the end and add a new line
    await user.click(editor)
    await user.keyboard('{End}')
    await user.keyboard('{Enter}')
    
    // Type "splash" on the new line
    await user.type(editor, 'splash')
    
    // Wait for command menu to appear
    await waitFor(() => {
      expect(screen.getByText('Heading 1')).toBeInTheDocument()
    }, { timeout: 3000 })
  })
})
