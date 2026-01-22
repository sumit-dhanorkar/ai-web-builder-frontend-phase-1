'use client'

/**
 * AI Description Widget for Chat
 * Allows users to generate AI-powered descriptions within the chat
 */

import { useState } from 'react'
import { Sparkles, Loader2, RefreshCw, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

interface AIDescriptionWidgetProps {
  field: string
  config?: {
    context?: string
    placeholder?: string
    minLength?: number
    maxLength?: number
  }
  onComplete: (description: string) => void
  disabled?: boolean
}

export function AIDescriptionWidget({
  field,
  config = {},
  onComplete,
  disabled = false,
}: AIDescriptionWidgetProps) {
  const [description, setDescription] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [showTextarea, setShowTextarea] = useState(false)

  const context = config.context || ''
  const placeholder = config.placeholder || 'AI will generate a description for you...'
  const minLength = config.minLength || 20
  const maxLength = config.maxLength || 500

  const handleGenerateAI = async () => {
    try {
      setIsGenerating(true)

      // Get JWT token from localStorage
      const token = localStorage.getItem('access_token')
      if (!token) {
        throw new Error('Not authenticated')
      }

      // Determine field_type from context or field name
      let fieldType = 'company'
      if (field === 'category_description' || config.context?.includes('category')) {
        fieldType = 'category'
      } else if (field === 'product_description' || config.context?.includes('product')) {
        fieldType = 'product'
      } else if (field === 'company_description' || config.context?.includes('company')) {
        fieldType = 'company'
      }

      // Call AI description API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/ai-assistant/description/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          operation: 'auto-generate',
          field_type: fieldType,
          current_text: '',
          context: config.collected_data || {},
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate description')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6))
                if (data.text) {
                  accumulated += data.text
                  setDescription(accumulated)
                }
                if (data.done) {
                  setShowTextarea(true)
                }
              } catch (e) {
                // Ignore JSON parse errors
              }
            }
          }
        }
      }

      toast.success('Description generated!')
    } catch (error: any) {
      console.error('AI generation error:', error)
      toast.error('Failed to generate description', {
        description: error?.message || 'Please try again'
      })
      setShowTextarea(true)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleRegenerate = () => {
    setDescription('')
    setShowTextarea(false)
    handleGenerateAI()
  }

  const handleAccept = () => {
    if (description.trim().length < minLength) {
      toast.error(`Description must be at least ${minLength} characters`)
      return
    }
    onComplete(description)
  }

  const handleManual = () => {
    setShowTextarea(true)
  }

  const handleCancel = () => {
    setDescription('')
    setShowTextarea(false)
  }

  return (
    <div className="mt-3 p-4 bg-gradient-to-br from-teal-50 to-emerald-50 rounded-lg border-2 border-teal-200 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-teal-700 font-medium">
          <Sparkles className="w-4 h-4" />
          AI Description Assistant
        </div>
        <span className="text-xs text-teal-600">
          Powered by AI
        </span>
      </div>

      {/* Generate Button (Initial State) */}
      {!description && !showTextarea && !isGenerating && (
        <div className="space-y-3">
          <p className="text-sm text-gray-700">
            Let AI write a professional description for you, or write your own.
          </p>
          <div className="flex gap-2">
            <Button
              onClick={handleGenerateAI}
              disabled={disabled}
              className="flex-1 h-9 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-medium text-sm"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Generate with AI
            </Button>
            <Button
              onClick={handleManual}
              disabled={disabled}
              variant="outline"
              className="h-9 border border-teal-300 text-teal-700 hover:bg-teal-50 text-sm"
            >
              Write Manually
            </Button>
          </div>
        </div>
      )}

      {/* Generating State */}
      {isGenerating && (
        <div className="space-y-3">
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-teal-600 mx-auto mb-3" />
              <p className="text-sm text-teal-700 font-medium">
                AI is writing your description...
              </p>
              <p className="text-xs text-gray-600 mt-1">
                This may take a few seconds
              </p>
            </div>
          </div>

          {/* Live preview of generation */}
          {description && (
            <div className="bg-white rounded-lg p-4 border border-teal-200 min-h-[100px]">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {description}
                <span className="inline-block w-2 h-4 bg-teal-600 animate-pulse ml-1" />
              </p>
            </div>
          )}
        </div>
      )}

      {/* Textarea (Generated or Manual) */}
      {showTextarea && !isGenerating && (
        <div className="space-y-3">
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            rows={6}
            maxLength={maxLength}
            className="border-2 border-teal-200 focus:border-teal-500 transition-colors"
          />

          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">
              {description.length}/{maxLength} characters
              {description.length < minLength && (
                <span className="text-amber-600 ml-2">
                  (minimum {minLength})
                </span>
              )}
            </span>
            {description && (
              <span className={description.length >= minLength ? 'text-green-600' : 'text-gray-400'}>
                {description.length >= minLength ? '✓ Ready' : 'Too short'}
              </span>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleAccept}
              disabled={disabled || description.trim().length < minLength}
              className="flex-1 h-9 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium text-sm shadow-md"
            >
              <Check className="w-4 h-4 mr-2" />
              Use This Description
            </Button>
            {description && (
              <Button
                onClick={handleRegenerate}
                disabled={disabled}
                variant="outline"
                className="h-9 border border-teal-300 text-teal-700 hover:bg-teal-50 text-sm"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Regenerate
              </Button>
            )}
            <Button
              onClick={handleCancel}
              disabled={disabled}
              variant="ghost"
              className="h-9 text-gray-600 hover:bg-gray-100"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}