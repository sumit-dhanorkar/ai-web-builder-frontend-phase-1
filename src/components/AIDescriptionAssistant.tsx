'use client'

import { useState } from 'react'
import { Sparkles, X, ChevronLeft, Loader2, Copy, ThumbsUp, ThumbsDown, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { OperationMenu, type Operation } from '@/components/ai/OperationMenu'
import { apiClient } from '@/lib/api-client'

interface AIDescriptionAssistantProps {
  // Field identification
  fieldType: 'company' | 'category' | 'product' | 'certification'

  // Current value
  currentValue: string

  // Callback to update parent state
  onAccept: (newValue: string) => void

  // Context data for AI generation
  context: Record<string, any>

  // Optional styling
  iconClassName?: string

  // Optional disabled state
  disabled?: boolean
}

const operationLabels: Record<Operation, string> = {
  'auto-generate': 'Auto-generate description',
  'improve-writing': 'Improve writing',
  'improve-description': 'Improve description',
  'rewrite': 'Rewrite'
}

export function AIDescriptionAssistant({
  fieldType,
  currentValue,
  onAccept,
  context,
  iconClassName,
  disabled = false
}: AIDescriptionAssistantProps) {
  // UI State
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  // Streaming State
  const [selectedOperation, setSelectedOperation] = useState<Operation | null>(null)
  const [streamedText, setStreamedText] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Handle operation selection from menu
  const handleOperationSelect = async (operation: Operation) => {
    setSelectedOperation(operation)
    setIsPopoverOpen(false)
    setShowPreview(true)
    setStreamedText('')
    setError(null)
    setIsStreaming(true)

    try {
      await apiClient.streamDescription(
        operation,
        fieldType,
        currentValue,
        context,
        // onChunk: Accumulate streamed text
        (chunk) => {
          setStreamedText((prev) => prev + chunk)
        },
        // onComplete: Mark streaming as done
        () => {
          setIsStreaming(false)
        },
        // onError: Handle errors
        (err) => {
          setError(err.message)
          setIsStreaming(false)
          toast.error(`Failed to generate: ${err.message}`)
        }
      )
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      setIsStreaming(false)
      toast.error('Failed to generate description')
    }
  }

  // Handle replace button - update parent state
  const handleReplace = () => {
    if (streamedText) {
      onAccept(streamedText)
      setShowPreview(false)
      toast.success('Description replaced successfully!')

      // Reset state
      setStreamedText('')
      setSelectedOperation(null)
      setError(null)
    }
  }

  // Handle insert below
  const handleInsertBelow = () => {
    if (streamedText) {
      const newValue = currentValue ? `${currentValue}\n\n${streamedText}` : streamedText
      onAccept(newValue)
      setShowPreview(false)
      toast.success('Description inserted below!')

      // Reset state
      setStreamedText('')
      setSelectedOperation(null)
      setError(null)
    }
  }

  // Handle discard
  const handleDiscard = () => {
    setShowPreview(false)
    setStreamedText('')
    setSelectedOperation(null)
    setError(null)
  }

  // Handle copy
  const handleCopy = () => {
    if (streamedText) {
      navigator.clipboard.writeText(streamedText)
      toast.success('Copied to clipboard!')
    }
  }

  return (
    <>
      {/* AI Assistant Trigger Button - stays in relative parent with textarea */}
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={`absolute right-2 bottom-2 z-10 hover:bg-teal-50 transition-colors ${iconClassName || ''}`}
            disabled={disabled || showPreview}
            title="AI Writing Assistant"
          >
            <Sparkles className={`w-10 h-10 ${showPreview ? 'text-teal-300 animate-pulse' : 'text-teal-500 hover:text-teal-600'}`} />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="p-0 w-auto z-50">
          <OperationMenu onSelect={handleOperationSelect} />
        </PopoverContent>
      </Popover>

      {/* Preview Card Below Textarea (Rovo Style) - Rendered by parent */}
      {showPreview && (
        <PreviewCard
          selectedOperation={selectedOperation}
          streamedText={streamedText}
          isStreaming={isStreaming}
          error={error}
          onDiscard={handleDiscard}
          onCopy={handleCopy}
          onRegenerate={() => selectedOperation && handleOperationSelect(selectedOperation)}
          onInsertBelow={handleInsertBelow}
          onReplace={handleReplace}
        />
      )}
    </>
  )
}

// Separate Preview Card Component
interface PreviewCardProps {
  selectedOperation: Operation | null
  streamedText: string
  isStreaming: boolean
  error: string | null
  onDiscard: () => void
  onCopy: () => void
  onRegenerate: () => void
  onInsertBelow: () => void
  onReplace: () => void
}

function PreviewCard({
  selectedOperation,
  streamedText,
  isStreaming,
  error,
  onDiscard,
  onCopy,
  onRegenerate,
  onInsertBelow,
  onReplace
}: PreviewCardProps) {
  return (
    <div className="mt-3 bg-white border-2 border-teal-300 rounded-lg shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
      {/* Header with AI Theme */}
      <div className="flex items-center justify-between px-4 py-3 bg-teal-600 border-b border-teal-500">
        <div className="flex items-center gap-3">
          <button
            onClick={onDiscard}
            className="p-1.5 hover:bg-teal-700 rounded-lg transition-all duration-200"
            title="Back"
          >
            <ChevronLeft className="w-4 h-4 text-white" />
          </button>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
            <span className="text-sm font-semibold text-white">
              {selectedOperation && operationLabels[selectedOperation]}
            </span>
          </div>
          {isStreaming && (
            <Loader2 className="w-4 h-4 animate-spin text-yellow-300" />
          )}
        </div>
        <button
          onClick={onDiscard}
          disabled={isStreaming}
          className="p-1.5 hover:bg-teal-700 rounded-lg transition-all duration-200 disabled:opacity-50"
          title="Close"
        >
          <X className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Generated Content */}
      <div className="p-5 min-h-[120px] max-h-[300px] overflow-y-auto bg-gray-50 relative">
        {error ? (
          <div className="text-red-600 text-sm font-medium bg-red-50 border border-red-200 rounded-lg p-3">
            {error}
          </div>
        ) : (
          <div className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
            {streamedText || (
              <div className="flex items-center gap-2 text-teal-600">
                <Sparkles className="w-4 h-4 animate-pulse" />
                <span className="font-medium">Generating with AI...</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-100 border-t border-gray-200">
        <div className="flex items-center gap-1">
          <button
            onClick={onCopy}
            disabled={isStreaming || !streamedText}
            className="p-2 hover:bg-white rounded-lg transition-all duration-200 disabled:opacity-50 group"
            title="Copy"
          >
            <Copy className="w-4 h-4 text-gray-600 group-hover:text-gray-800" />
          </button>
          <button
            onClick={onRegenerate}
            disabled={isStreaming}
            className="p-2 hover:bg-white rounded-lg transition-all duration-200 disabled:opacity-50 group"
            title="Regenerate"
          >
            <RefreshCw className="w-4 h-4 text-gray-600 group-hover:text-gray-800" />
          </button>
          <button
            disabled={isStreaming || !streamedText || !!error}
            className="p-2 hover:bg-green-100 rounded-lg transition-all duration-200 disabled:opacity-50 group"
            title="Thumbs up"
          >
            <ThumbsUp className="w-4 h-4 text-gray-600 group-hover:text-green-600" />
          </button>
          <button
            disabled={isStreaming || !streamedText || !!error}
            className="p-2 hover:bg-red-100 rounded-lg transition-all duration-200 disabled:opacity-50 group"
            title="Thumbs down"
          >
            <ThumbsDown className="w-4 h-4 text-gray-600 group-hover:text-red-600" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={onDiscard}
            disabled={isStreaming}
            variant="outline"
            size="sm"
            className="h-9 border-2 border-red-400 hover:bg-red-500 text-red-600 hover:text-white font-medium transition-all duration-200"
          >
            Discard
          </Button>
          <Button
            onClick={onInsertBelow}
            disabled={isStreaming || !streamedText || !!error}
            variant="outline"
            size="sm"
            className="h-9 border-2 border-teal-500 hover:bg-teal-500 text-teal-700 hover:text-white font-medium transition-all duration-200"
          >
            Insert below
          </Button>
          <Button
            onClick={onReplace}
            disabled={isStreaming || !streamedText || !!error}
            className="h-9 bg-teal-600 hover:bg-teal-700 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200"
            size="sm"
          >
            Replace
          </Button>
        </div>
      </div>
    </div>
  )
}