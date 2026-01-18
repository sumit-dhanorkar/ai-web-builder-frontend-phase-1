'use client'

import { motion } from 'framer-motion'
import { Bot, User, Loader2 } from 'lucide-react'
import type { Message as MessageType } from '@/types/chatbot'
import ReactMarkdown from 'react-markdown'
import { WidgetRenderer } from './widgets/WidgetRenderer'
import { useChat } from '@/lib/chat-context'

interface MessageProps {
  message: MessageType
  isLatest?: boolean
}

export function Message({ message, isLatest }: MessageProps) {
  const isUser = message.role === 'user'
  const isAI = message.role === 'ai'
  const { sendMessage } = useChat()

  // Debug logging
  if (isAI && message.widget) {
    console.log(`🎯 Message ${message.id} has widget:`, message.widget)
  }

  const handleWidgetComplete = (value: any) => {
    // Send widget value as a message
    // The value format depends on widget type
    let messageText = ''

    if (typeof value === 'string') {
      messageText = value
    } else if (Array.isArray(value)) {
      // For multi-select or arrays
      messageText = JSON.stringify(value)
    } else if (typeof value === 'object') {
      // For product entry or complex objects
      messageText = JSON.stringify(value)
    }

    sendMessage(messageText)
  }

  // Helper to display user message nicely
  const getDisplayContent = (content: string, role: string) => {
    // Don't transform, we'll handle images separately
    return content
  }

  // Check if message is an image URL
  const isImageUrl = (content: string) => {
    return content.startsWith('https://firebasestorage.googleapis.com') &&
           /\.(jpg|jpeg|png|gif|webp)/i.test(content)
  }

  // Check if message is JSON review data
  const isJsonReviewData = (content: string) => {
    try {
      const parsed = JSON.parse(content)
      return typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)
    } catch (e) {
      return false
    }
  }

  // Check if message is export countries array
  const isExportCountriesArray = (content: string) => {
    try {
      const parsed = JSON.parse(content)
      return Array.isArray(parsed) && parsed.length > 0 && parsed[0].flag_url
    } catch (e) {
      return false
    }
  }

  // Format export countries display
  const formatExportCountries = (content: string) => {
    try {
      const countries = JSON.parse(content)
      const names = countries.map((c: any) => c.label).join(', ')
      return `✅ Selected ${countries.length} ${countries.length === 1 ? 'country' : 'countries'}: ${names}`
    } catch (e) {
      return content
    }
  }

  // Get filename from URL
  const getFilename = (url: string) => {
    try {
      const urlObj = new URL(url)
      const pathParts = urlObj.pathname.split('/')
      const encodedFilename = pathParts[pathParts.length - 1]
      return decodeURIComponent(encodedFilename.split('%2F').pop() || '')
    } catch (e) {
      return 'image.jpg'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-2 sm:gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} mb-3 sm:mb-4 px-2 sm:px-0`}
      role="article"
      aria-label={`${isUser ? 'User' : 'AI Assistant'} message`}
    >
      {/* Avatar */}
      <div className={`
        flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center
        ${isUser ? 'bg-gradient-to-br from-teal-500 to-emerald-500' : 'bg-gradient-to-br from-teal-500 to-emerald-500'}
      `}>
        {isUser ? (
          <User className="w-5 h-5 text-white" />
        ) : (
          <Bot className="w-5 h-5 text-white" />
        )}
      </div>

      {/* Message Bubble */}
      <div className={`
        flex flex-col max-w-[85%] sm:max-w-[75%] min-w-0
        ${isUser ? 'items-end' : 'items-start'}
      `}>
        {/* Message Content */}
        <div className={`
          rounded-2xl px-3 py-2 sm:px-4 sm:py-3 shadow-md break-words
          ${isUser
            ? 'bg-gradient-to-br from-teal-600 to-emerald-600 text-white'
            : 'bg-white border border-gray-200 text-gray-800'
          }
          ${message.status === 'error' ? 'border-2 border-red-500' : ''}
        `}>
          {/* Show typing indicator for AI */}
          {message.status === 'sending' && isAI && message.content === '' && (
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          )}

          {/* Actual message content */}
          {message.content && (
            <>
              {isUser && isImageUrl(message.content) ? (
                // Simple text for uploaded images
                <div className="flex items-center gap-2 text-sm">
                  <span>✅ Uploaded: {getFilename(message.content)}</span>
                </div>
              ) : isUser && isJsonReviewData(message.content) ? (
                // Simple text for JSON review data
                <div className="flex items-center gap-2 text-sm">
                  <span>✅ Updated information and continuing</span>
                </div>
              ) : isUser && isExportCountriesArray(message.content) ? (
                // Format export countries nicely
                <div className="flex items-center gap-2 text-sm">
                  <span>{formatExportCountries(message.content)}</span>
                </div>
              ) : (
                // Normal text rendering
                <div className={`
                  prose prose-sm max-w-none
                  ${isUser ? 'prose-invert' : ''}
                `}>
                  <ReactMarkdown
                    components={{
                      p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                      strong: ({ node, ...props }) => <strong className="font-semibold" {...props} />,
                      ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-2" {...props} />,
                      li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              )}
            </>
          )}

          {/* Widget rendering */}
          {message.widget && isAI && (
            <WidgetRenderer
              widget={message.widget}
              onComplete={handleWidgetComplete}
              disabled={!isLatest}
            />
          )}

          {/* Skip button for optional fields */}
          {message.skip_available && isAI && isLatest && (
            <WidgetRenderer
              widget={{
                type: 'skip_button',
                field: 'skip',
                config: { label: 'Skip this step' }
              }}
              onComplete={handleWidgetComplete}
              disabled={!isLatest}
            />
          )}
        </div>

        {/* Timestamp */}
        <span className="text-xs text-gray-400 mt-1 px-1">
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </span>
      </div>
    </motion.div>
  )
}