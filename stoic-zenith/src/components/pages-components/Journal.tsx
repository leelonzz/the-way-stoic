import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  lazy,
  Suspense,
} from 'react'
import { toast } from '@/components/ui/use-toast'
import { EntryList } from '@/components/journal/EntryList'
import { JournalCalendarView } from '@/components/journal/JournalCalendarView'
import { ViewToggle, ViewMode } from '@/components/journal/ViewToggle'
import {
  JournalEntry,
  JournalTemplate,
  JournalBlock,
} from '@/components/journal/types'
import { supabase } from '@/integrations/supabase/client'
import { JournalSkeleton } from '@/components/journal/JournalSkeleton'
import { useCachedJournal } from '@/hooks/useCachedJournal'
import { TemplateGallery } from '@/components/journal/TemplateGallery'
import { TemplateEditor } from '@/components/journal/TemplateEditor'
import { OnboardingModal } from '@/components/onboarding/OnboardingModal'
import { useOnboardingQuestionnaire } from '@/hooks/useOnboardingQuestionnaire'
import { useAuthContext } from '@/components/auth/AuthProvider'

// Lazy load the heavy JournalNavigation component (rich text editor)
const JournalNavigation = lazy(() =>
  import('@/components/journal/JournalNavigation').then(module => ({
    default: module.JournalNavigation,
  }))
)
import {
  recordEntryAccess,
  cleanupOldAccessTimes,
  removeEntryAccess,
} from '@/lib/entryAccessTracker'

export default function Journal(): JSX.Element {
  try {
    // Auth context
    const { user } = useAuthContext()

    // View state management
    const [viewMode, setViewMode] = useState<ViewMode>('list')

    // Template system state
    const [showTemplateGallery, setShowTemplateGallery] = useState(false)
    const [showTemplateEditor, setShowTemplateEditor] = useState(false)

    // Onboarding state
    const [showOnboardingModal, setShowOnboardingModal] = useState(false)
    const { isQuestionnaireCompleted, fetchQuestionnaireState } =
      useOnboardingQuestionnaire(user)

    // Use cache-aware journal hook
    const {
      entries,
      selectedEntry,
      loading: isLoadingEntries,
      error: entriesError,
      syncStatus,
      handleSelectEntry: selectEntry,
      handleCreateEntry: createEntry,
      handleDeleteEntry: deleteEntry,
      handleUpdateEntry: updateEntry,
      handleUpdateEntryWithIdChange: updateEntryWithIdChange,
      handleRetrySync: retrySync,
      clearSelection,
      journalManager,
      isCreatingEntry, // Use the isCreatingEntry from the hook
    } = useCachedJournal(viewMode)

    // Legacy state for compatibility
    const [userId, setUserId] = useState<string | null>(null)
    const lastCreateTimeRef = useRef<number>(0)

    // Handle view mode changes with selection clearing
    const handleViewModeChange = useCallback(
      (newViewMode: ViewMode) => {
        setViewMode(newViewMode)
        // Clear selection when switching to calendar view
        if (newViewMode === 'calendar') {
          clearSelection()
        }
      },
      [clearSelection]
    )

    // Wrapper functions for compatibility with existing code
    const handleSelectEntryWrapper = useCallback(
      (entry: JournalEntry) => {
        selectEntry(entry)
        recordEntryAccess(entry.id)
      },
      [selectEntry]
    )

    const handleCreateEntryWrapper = useCallback(() => {
      const now = Date.now()
      if (now - lastCreateTimeRef.current < 1000) return // Prevent double-clicks

      lastCreateTimeRef.current = now
      createEntry() // The hook manages its own isCreatingEntry state
    }, [createEntry])

    const handleDeleteEntryWrapper = useCallback(
      async (entryId: string) => {
        try {
          await deleteEntry(entryId)
          removeEntryAccess(entryId)
          toast({
            title: 'Entry deleted',
            description: 'The journal entry has been deleted successfully.',
          })
        } catch {
          toast({
            title: 'Error',
            description: 'Failed to delete entry. Please try again.',
            variant: 'destructive',
          })
        }
      },
      [deleteEntry]
    )

    const handleRetrySyncWrapper = useCallback(async () => {
      try {
        await retrySync()
        toast({
          title: 'Sync completed',
          description: 'Your journal has been synchronized successfully.',
        })
      } catch {
        toast({
          title: 'Sync failed',
          description: 'Failed to sync journal. Please check your connection.',
          variant: 'destructive',
        })
      }
    }, [retrySync])
    // Initialize user context for legacy compatibility
    useEffect((): void => {
      const initializeUser = async (): Promise<void> => {
        try {
          const {
            data: { user },
          } = await supabase.auth.getUser()
          if (user) {
            setUserId(user.id)
            // Clean up old access times to prevent localStorage bloat
            cleanupOldAccessTimes()
          }
        } catch (error) {
          console.error('Failed to initialize user:', error)
        }
      }

      initializeUser()
    }, [])

    // Listen for auth changes for legacy compatibility
    useEffect((): (() => void) => {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        const newUserId = session?.user?.id || null
        if (newUserId !== userId) {
          setUserId(newUserId)
        }
      })

      return () => {
        subscription.unsubscribe()
      }
    }, [userId])

    // Check onboarding status and show modal if needed
    useEffect(() => {
      if (user && !isQuestionnaireCompleted) {
        // Check if user has visited before
        const hasVisitedBefore = localStorage.getItem(
          `journal_visited_${user.id}`
        )
        if (!hasVisitedBefore) {
          // First visit - show onboarding modal
          setShowOnboardingModal(true)
          localStorage.setItem(`journal_visited_${user.id}`, 'true')
        }
        // Fetch questionnaire state to get current status
        fetchQuestionnaireState()
      }
    }, [user, isQuestionnaireCompleted, fetchQuestionnaireState])

    // Handle entry update using cache-aware hook to update UI instantly
    const handleEntryUpdate = useCallback(
      async (updatedEntry: JournalEntry): Promise<void> => {
        try {
          await updateEntry(updatedEntry.id, updatedEntry.blocks)
        } catch (error) {
          console.error('Failed to update entry:', error)
        }
      },
      [updateEntry]
    )

    // Template system handlers
    const handleOpenTemplates = useCallback(() => {
      setShowTemplateGallery(true)
    }, [])

    const handleCloseTemplates = useCallback(() => {
      setShowTemplateGallery(false)
    }, [])

    const handleOpenTemplateEditor = useCallback(() => {
      setShowTemplateGallery(false)
      setShowTemplateEditor(true)
    }, [])

    const handleCloseTemplateEditor = useCallback(() => {
      setShowTemplateEditor(false)
    }, [])

    const handleSelectPrompt = useCallback(
      async (promptText: string) => {
        if (!selectedEntry) {
          toast({
            title: 'No Entry Selected',
            description: 'Please select or create a journal entry first.',
            variant: 'destructive',
          })
          return
        }

        try {
          // Create prompt heading block with CSS class for Input Antiqua font
          const promptBlock: JournalBlock = {
            id: `prompt-${Date.now()}`,
            type: 'heading',
            level: 3,
            text: promptText,
            richText: `<h3 class="prompt-text">${promptText}</h3>`,
            createdAt: new Date(),
          }

          // Create empty paragraph block for writing
          const responseBlock: JournalBlock = {
            id: `response-${Date.now()}`,
            type: 'paragraph',
            text: '',
            richText: '',
            createdAt: new Date(),
          }

          // Get current blocks and insert new ones at the beginning (line 1)
          const currentBlocks = selectedEntry.blocks || []
          const newBlocks = [promptBlock, responseBlock, ...currentBlocks]

          // Update the entry
          await updateEntry(selectedEntry.id, newBlocks)

          toast({
            title: 'Prompt Added',
            description: 'The writing prompt has been added to your journal.',
          })
        } catch (error) {
          console.error('Failed to add prompt:', error)
          toast({
            title: 'Error',
            description: 'Failed to add prompt. Please try again.',
            variant: 'destructive',
          })
        }
      },
      [selectedEntry, updateEntry]
    )

    const handleApplyTemplate = useCallback(
      async (
        template: JournalTemplate,
        insertionMode: 'prepend' | 'append' | 'replace' = 'append'
      ) => {
        if (!selectedEntry) {
          toast({
            title: 'No Entry Selected',
            description: 'Please select or create a journal entry first.',
            variant: 'destructive',
          })
          return
        }

        try {
          // Validate template content
          if (
            !template.template_content?.blocks ||
            !Array.isArray(template.template_content.blocks)
          ) {
            throw new Error('Invalid template content structure')
          }

          // Generate new IDs for template blocks to avoid conflicts
          const templateBlocks: JournalBlock[] =
            template.template_content.blocks.map((block, index) => ({
              ...block,
              id: `template-${Date.now()}-${index}`,
              createdAt: new Date(),
            }))

          // Ensure selectedEntry.blocks exists, fallback to empty array
          const currentBlocks = selectedEntry.blocks || []

          // Check if the entry only has the initial empty block(s)
          const hasOnlyInitialBlocks =
            currentBlocks.length <= 1 &&
            currentBlocks.every(
              block =>
                block.text.trim() === '' &&
                (block.id.includes('initial') || block.type === 'paragraph')
            )

          let combinedBlocks: JournalBlock[]

          // Handle different insertion modes
          switch (insertionMode) {
            case 'replace':
              combinedBlocks = templateBlocks
              break
            case 'prepend':
              if (hasOnlyInitialBlocks) {
                combinedBlocks = templateBlocks
              } else {
                combinedBlocks = [...templateBlocks, ...currentBlocks]
              }
              break
            case 'append':
            default:
              if (hasOnlyInitialBlocks) {
                combinedBlocks = templateBlocks
              } else {
                combinedBlocks = [...currentBlocks, ...templateBlocks]
              }
              break
          }

          // Validate that we have blocks to save
          if (combinedBlocks.length === 0) {
            throw new Error('No content to save')
          }

          // Update the entry
          await updateEntry(selectedEntry.id, combinedBlocks)

          toast({
            title: 'Template Applied',
            description: `"${template.name}" template has been ${insertionMode === 'replace' ? 'replaced' : 'added to'} your journal entry.`,
          })
        } catch (error) {
          console.error('Failed to apply template:', error)
          toast({
            title: 'Error',
            description:
              error instanceof Error
                ? error.message
                : 'Failed to apply template. Please try again.',
            variant: 'destructive',
          })
        }
      },
      [selectedEntry, updateEntry]
    )

    const handleSaveTemplate = useCallback(
      async (
        templateData: Omit<
          JournalTemplate,
          'id' | 'created_at' | 'updated_at' | 'user_id' | 'is_system'
        >
      ) => {
        try {
          const response = await fetch('/api/templates', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(templateData),
          })

          if (!response.ok) {
            throw new Error('Failed to save template')
          }

          const { template } = await response.json()
          console.log('Template saved:', template)
        } catch (error) {
          console.error('Failed to save template:', error)
          throw error
        }
      },
      []
    )

    const handleSaveToMyTemplates = useCallback(
      async (template: JournalTemplate) => {
        try {
          const response = await fetch(`/api/templates/${template.id}`, {
            method: 'POST',
          })

          if (!response.ok) {
            throw new Error('Failed to save template')
          }

          const { template: savedTemplate } = await response.json()
          console.log('Template saved to my templates:', savedTemplate)
        } catch (error) {
          console.error('Failed to save template to my templates:', error)
          toast({
            title: 'Error',
            description:
              'Failed to save template to your collection. Please try again.',
            variant: 'destructive',
          })
        }
      },
      []
    )

    // Onboarding handlers
    const handleOnboardingComplete = useCallback(() => {
      setShowOnboardingModal(false)
      toast({
        title: 'Welcome!',
        description:
          'Thank you for completing the survey. Your experience has been personalized.',
      })
    }, [])

    const handleOnboardingSkip = useCallback(() => {
      setShowOnboardingModal(false)
    }, [])

    // Show loading state while entries are loading
    if (isLoadingEntries) {
      return <JournalSkeleton />
    }

    // Show error state if there's an error
    if (entriesError) {
      return (
        <div className="h-screen flex items-center justify-center bg-stone-50">
          <div className="text-center">
            <p className="text-stone-600 mb-4">
              Failed to load journal entries
            </p>
            <button
              onClick={handleRetrySyncWrapper}
              className="px-4 py-2 bg-stone-800 text-white rounded hover:bg-stone-700"
            >
              Retry
            </button>
          </div>
        </div>
      )
    }

    // Performance tracking removed to fix loading issues

    return (
      <>
        {/* Custom CSS for smooth scrolling behavior */}
        <style jsx>{`
          .journal-entry-list-scroll {
            scroll-behavior: smooth;
            scrollbar-width: thin;
            scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
          }

          .journal-entry-list-scroll::-webkit-scrollbar {
            width: 6px;
          }

          .journal-entry-list-scroll::-webkit-scrollbar-track {
            background: transparent;
          }

          .journal-entry-list-scroll::-webkit-scrollbar-thumb {
            background-color: rgba(0, 0, 0, 0.2);
            border-radius: 3px;
          }

          .journal-entry-list-scroll::-webkit-scrollbar-thumb:hover {
            background-color: rgba(0, 0, 0, 0.3);
          }

          .journal-editor-scroll {
            scroll-behavior: smooth;
            scrollbar-width: thin;
            scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
          }

          .journal-editor-scroll::-webkit-scrollbar {
            width: 6px;
          }

          .journal-editor-scroll::-webkit-scrollbar-track {
            background: transparent;
          }

          .journal-editor-scroll::-webkit-scrollbar-thumb {
            background-color: rgba(0, 0, 0, 0.2);
            border-radius: 3px;
          }

          .journal-editor-scroll::-webkit-scrollbar-thumb:hover {
            background-color: rgba(0, 0, 0, 0.3);
          }
        `}</style>

        <div className="h-screen flex bg-stone-50">
          {/* Entry List/Calendar Sidebar */}
          <div className="w-80 border-r border-stone-200 bg-white flex flex-col h-full overflow-hidden">
            {/* Header with View Toggle */}
            <div className="flex-shrink-0 p-4 border-b border-stone-200 bg-white">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-stone-800">
                  Journal
                </h2>
                <ViewToggle
                  currentView={viewMode}
                  onViewChange={handleViewModeChange}
                />
              </div>
            </div>

            {/* Conditional View Rendering - Independent Scrolling Container */}
            <div className="flex-1 min-h-0">
              {viewMode === 'list' ? (
                <EntryList
                  entries={entries || []}
                  selectedEntry={selectedEntry}
                  onSelectEntry={handleSelectEntryWrapper}
                  onCreateEntry={handleCreateEntryWrapper}
                  onDeleteEntry={handleDeleteEntryWrapper}
                  onEntriesChange={() => {}} // No-op since entries are managed by cache-aware hook
                  syncStatus={syncStatus === 'syncing' ? 'pending' : syncStatus}
                  onRetrySync={handleRetrySyncWrapper}
                  journalManager={journalManager}
                  showDeleteButton={false}
                  className="h-full"
                />
              ) : (
                <JournalCalendarView
                  entries={entries || []}
                  selectedEntry={selectedEntry}
                  onSelectEntry={handleSelectEntryWrapper}
                  onDeleteEntry={handleDeleteEntryWrapper}
                  showDeleteButton={false}
                  className="h-full"
                />
              )}
            </div>
          </div>

          {/* Journal Editor - Independent Scrolling Container */}
          <div className="flex-1 flex flex-col bg-white h-full overflow-hidden">
            {selectedEntry ? (
              <Suspense
                fallback={
                  <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-800"></div>
                  </div>
                }
              >
                <JournalNavigation
                  entry={selectedEntry}
                  onEntryUpdate={handleEntryUpdate}
                  onUpdateEntryWithIdChange={updateEntryWithIdChange}
                  onCreateEntry={handleCreateEntryWrapper}
                  onDeleteEntry={handleDeleteEntryWrapper}
                  syncStatus={syncStatus === 'syncing' ? 'pending' : syncStatus}
                  journalManager={journalManager}
                  hasOtherEntries={entries && entries.length > 1}
                  onOpenTemplates={handleOpenTemplates}
                  onSelectPrompt={handleSelectPrompt}
                />
              </Suspense>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-white">
                <div className="text-center p-8">
                  <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                    <svg
                      className="w-8 h-8 text-stone-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <h2 className="text-lg font-medium text-stone-700 mb-2">
                    {!entries || entries.length === 0
                      ? 'Start writing your thoughts...'
                      : 'Choose entry and it will show here'}
                  </h2>
                </div>
              </div>
            )}
          </div>

          {/* Template Gallery Modal */}
          <TemplateGallery
            isOpen={showTemplateGallery}
            onClose={handleCloseTemplates}
            onApplyTemplate={handleApplyTemplate}
            onCreateTemplate={handleOpenTemplateEditor}
            onSaveToMyTemplates={handleSaveToMyTemplates}
          />

          {/* Template Editor Modal */}
          <TemplateEditor
            isOpen={showTemplateEditor}
            onClose={handleCloseTemplateEditor}
            onSaveTemplate={handleSaveTemplate}
          />

          {/* Onboarding Modal */}
          <OnboardingModal
            isOpen={showOnboardingModal}
            onClose={() => setShowOnboardingModal(false)}
            onComplete={handleOnboardingComplete}
            onSkip={handleOnboardingSkip}
          />
        </div>
      </>
    )
  } catch (error) {
    console.error('🚨 Journal component error:', error)
    throw error // Re-throw to trigger error boundary
  }
}
