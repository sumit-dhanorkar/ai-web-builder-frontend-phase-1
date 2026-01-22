'use client'

import { useState, useRef, KeyboardEvent } from 'react'
import { Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useChat } from '@/lib/chat-context'

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
  placeholder?: string
}

export function ChatInput({ onSend, disabled = false, placeholder = 'Type your message...' }: ChatInputProps) {
  const [message, setMessage] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { uiState, messages } = useChat()

  // Check if the latest AI message has a widget
  const latestAIMessage = messages.filter(m => m.role === 'ai').slice(-1)[0]
  const hasActiveWidget = latestAIMessage?.widget && latestAIMessage?.status === 'sent'

  // Update placeholder if widget is shown
  const effectivePlaceholder = hasActiveWidget
    ? 'Use the widget above, or type here...'
    : placeholder

  const handleSend = () => {
    const trimmed = message.trim()
    if (trimmed && !disabled) {
      onSend(trimmed)
      setMessage('')

      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
        // Refocus input after sending
        setTimeout(() => {
          textareaRef.current?.focus()
        }, 100)
      }
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Enter, new line on Shift+Enter
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value)

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }

  const isDisabled = disabled || uiState.isStreaming || uiState.isLoading

  return (
    <div className="border-t border-gray-200 bg-white p-2 sm:p-4 safe-area-bottom">
      <div className="max-w-4xl mx-auto">
        <div className="flex gap-1.5 sm:gap-2 items-end">
          {/* Textarea */}
          <div className="flex-1 relative min-w-0">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder={effectivePlaceholder}
              disabled={isDisabled}
              className="min-h-[44px] sm:min-h-[50px] max-h-[120px] sm:max-h-[150px] resize-none pr-10 sm:pr-12 border-2 border-gray-300 focus:border-teal-500 transition-colors text-sm sm:text-base"
              rows={1}
              aria-label="Message input"
              aria-describedby="message-hint"
              autoComplete="off"
            />

            {/* Character count (optional) */}
            {message.length > 0 && (
              <span className="absolute bottom-2 right-2 text-xs text-gray-400 hidden sm:inline">
                {message.length}
              </span>
            )}
          </div>

          {/* Send Button */}
          <Button
            onClick={handleSend}
            disabled={isDisabled || !message.trim()}
            size="sm"
            className="h-[44px] sm:h-[50px] px-3 sm:px-6 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-semibold flex-shrink-0"
            aria-label="Send message"
            title="Send message (Enter)"
          >
            <Send className="w-4 h-4 sm:mr-2" aria-hidden="true" />
            <span className="hidden sm:inline">Send</span>
          </Button>
        </div>

        {/* Hint text */}
        <div id="message-hint" className="mt-1.5 sm:mt-2 flex items-center justify-between text-xs text-gray-500" role="status" aria-live="polite">
          {hasActiveWidget ? (
            <span className="text-teal-600 font-medium">💡 Use the widget above or type here</span>
          ) : (
            <>
              <span className="hidden sm:inline">Press Enter to send, Shift+Enter for new line</span>
              <span className="sm:hidden text-xs">Tap Send or press Enter</span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}