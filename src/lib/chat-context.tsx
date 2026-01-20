'use client'

/**
 * Chat Context
 * Manages chatbot state and provides hooks for components
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { toast } from 'sonner'
import { chatAPI } from './chat-api'
import { useAuth } from './auth-context'
import type {
  Message,
  ConversationState,
  ConversationSession,
  BusinessInfo,
  ChatUIState,
  ProgressState,
} from '@/types/chatbot'

interface ChatContextValue {
  // Session data
  sessionId: string | null
  currentState: ConversationState
  messages: Message[]
  collectedData: Partial<BusinessInfo>

  // UI state
  uiState: ChatUIState
  progress: ProgressState

  // Actions
  sendMessage: (message: string) => Promise<void>
  initializeSession: () => Promise<void>
  clearSession: () => void
  jumpToField: (field: string) => void

  // Utilities
  canSkip: boolean
  isInitialized: boolean
  showSummary: boolean
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined)

interface ChatProviderProps {
  children: React.ReactNode
}

export function ChatProvider({ children }: ChatProviderProps) {
  const { user } = useAuth()
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [currentState, setCurrentState] = useState<ConversationState>('welcome' as ConversationState)
  const [messages, setMessages] = useState<Message[]>([])
  const [collectedData, setCollectedData] = useState<Partial<BusinessInfo>>({})
  const [isInitialized, setIsInitialized] = useState(false)

  const [uiState, setUIState] = useState<ChatUIState>({
    isLoading: false,
    isStreaming: false,
    isTyping: false,
    error: null,
    scrollToBottom: false,
  })

  const [progress, setProgress] = useState<ProgressState>({
    section: 'welcome',
    completionPercent: 0,
    fieldsCollected: 0,
    totalFields: 30,
  })

  const [canSkip, setCanSkip] = useState(false)
  const [showSummary, setShowSummary] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const MAX_RETRIES = 3

  /**
   * Load data from localStorage on mount (for form→chat switching)
   */
  useEffect(() => {
    const savedData = localStorage.getItem('chatbot_data')
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData)
        if (Object.keys(parsed).length > 0) {
          console.log('📥 Loading existing data from form...')
          setCollectedData(parsed)
          toast.success('Loaded data from form!', {
            description: 'Continuing where you left off'
          })
        }
      } catch (error) {
        console.error('Failed to parse saved chat data:', error)
      }
    }
  }, [])

  /**
   * Session recovery - save session state to localStorage
   */
  useEffect(() => {
    if (sessionId && messages.length > 0) {
      try {
        const sessionState = {
          sessionId,
          currentState,
          messages: messages.slice(-10), // Save last 10 messages only
          collectedData,
          progress,
          timestamp: Date.now(),
        }
        localStorage.setItem('chatbot_session', JSON.stringify(sessionState))
      } catch (error) {
        console.error('Failed to save session state:', error)
      }
    }
  }, [sessionId, currentState, messages, collectedData, progress])

  /**
   * Session recovery - restore session on mount
   */
  useEffect(() => {
    const savedSession = localStorage.getItem('chatbot_session')
    if (savedSession && !isInitialized) {
      try {
        const parsed = JSON.parse(savedSession)
        const age = Date.now() - parsed.timestamp

        // Only restore if session is less than 1 hour old
        if (age < 60 * 60 * 1000) {
          console.log('📥 Restoring previous session...')
          setSessionId(parsed.sessionId)
          setCurrentState(parsed.currentState)
          setMessages(parsed.messages)
          setCollectedData(parsed.collectedData)
          setProgress(parsed.progress)
          setIsInitialized(true)

          toast.success('Session restored!', {
            description: 'Your conversation has been recovered'
          })
        } else {
          // Session too old, clear it
          localStorage.removeItem('chatbot_session')
        }
      } catch (error) {
        console.error('Failed to restore session:', error)
        localStorage.removeItem('chatbot_session')
      }
    }
  }, [])

  /**
   * Initialize chatbot session
   */
  const initializeSession = useCallback(async () => {
    try {
      setUIState(prev => ({ ...prev, isLoading: true }))

      const response = await chatAPI.initializeSession({
        user_id: user?.id || 'guest',
        resume: false,
      })

      setSessionId(response.session_id)
      setCurrentState(response.current_state)
      setMessages(response.messages as Message[])
      // Don't override collectedData if it was loaded from localStorage
      setCollectedData(prev => {
        const hasExistingData = Object.keys(prev).length > 0
        return hasExistingData ? prev : response.collected_data
      })
      setIsInitialized(true)

      // Send initial welcome message from AI
      setTimeout(() => {
        sendWelcomeMessage()
      }, 500)

    } catch (error) {
      console.error('Failed to initialize session:', error)
      toast.error('Failed to start chat session')
      setUIState(prev => ({
        ...prev,
        error: 'Failed to initialize session'
      }))
    } finally {
      setUIState(prev => ({ ...prev, isLoading: false }))
    }
  }, [user])

  /**
   * Send welcome message
   */
  const sendWelcomeMessage = () => {
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      role: 'ai',
      content: "👋 Welcome! I'm your AI assistant, and I'm here to help you create a professional export website.\n\nThis will be quick and easy - just answer my questions naturally, and we'll have your website ready in about 10-15 minutes.\n\nYou can skip optional fields or edit your answers anytime. Ready to get started?\n\n**Let's begin with the basics: What's your company name?**",
      timestamp: new Date(),
      status: 'sent',
    }

    setMessages([welcomeMessage])
    setUIState(prev => ({ ...prev, scrollToBottom: true }))
  }

  /**
   * Send message to chatbot
   */
  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim() || !sessionId) return

    try {
      // Add user message to UI
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: message,
        timestamp: new Date(),
        status: 'sending',
      }

      setMessages(prev => [...prev, userMessage])
      setUIState(prev => ({
        ...prev,
        isStreaming: true,
        isTyping: true,
        scrollToBottom: true
      }))

      // Prepare AI message placeholder
      const aiMessageId = (Date.now() + 1).toString()
      const aiMessage: Message = {
        id: aiMessageId,
        role: 'ai',
        content: '',
        timestamp: new Date(),
        status: 'sending',
      }

      setMessages(prev => [...prev, aiMessage])

      // Stream response
      let accumulatedText = ''

      await chatAPI.streamMessage(
        {
          session_id: sessionId,
          message: message,
          current_state: currentState,
          collected_data: collectedData,
        },
        // onChunk
        (chunk: string) => {
          accumulatedText += chunk
          setMessages(prev =>
            prev.map(msg =>
              msg.id === aiMessageId
                ? { ...msg, content: accumulatedText }
                : msg
            )
          )
          setUIState(prev => ({ ...prev, scrollToBottom: true }))
        },
        // onComplete
        (data: any) => {
          console.log('📦 Stream completed with data:', data)
          console.log('🎨 Widget received:', data.widget)

          // CRITICAL: Update collected data FIRST before adding widget to message
          // This ensures the widget has access to the latest data when it mounts
          if (data.updated_data) {
            setCollectedData(data.updated_data)
          }

          // Update state
          if (data.next_state) {
            setCurrentState(data.next_state)
          }

          // Now update message with widget (after collectedData is set)
          setMessages(prev =>
            prev.map(msg => {
              if (msg.id === userMessage.id) {
                return { ...msg, status: 'sent' as const }
              }
              if (msg.id === aiMessageId) {
                return {
                  ...msg,
                  content: data.full_text || accumulatedText,
                  status: 'sent' as const,
                  widget: data.widget,
                  skip_available: data.skip_available,
                }
              }
              return msg
            })
          )

          if (data.progress) {
            setProgress({
              section: data.progress.section,
              completionPercent: data.progress.completion_percent,
              fieldsCollected: data.progress.fields_collected,
              totalFields: data.progress.total_fields,
            })
          }

          if (data.skip_available !== undefined) {
            setCanSkip(data.skip_available)
          }

          setUIState(prev => ({
            ...prev,
            isStreaming: false,
            isTyping: false,
            scrollToBottom: true
          }))

          // Save to localStorage
          if (data.updated_data) {
            localStorage.setItem('chatbot_data', JSON.stringify(data.updated_data))
          }
        },
        // onError
        (error: Error) => {
          console.error('Stream error:', error)

          // Check if this is a validation error (don't retry validation errors)
          const isValidationError = error.message.includes('Please provide') ||
                                   error.message.includes('Invalid') ||
                                   error.message.includes('required') ||
                                   error.message.includes('must be')

          // Only retry connection errors, not validation errors
          if (!isValidationError && retryCount < MAX_RETRIES) {
            setRetryCount(prev => prev + 1)
            toast.error(`Connection error. Retrying... (${retryCount + 1}/${MAX_RETRIES})`)

            // Retry after a delay
            setTimeout(() => {
              sendMessage(message)
            }, 2000 * (retryCount + 1)) // Exponential backoff
          } else {
            // Validation error or max retries reached - don't retry
            toast.error(error.message || 'Failed to send message', {
              description: isValidationError ? 'Please check your input' : 'Please check your connection and try again'
            })

            setMessages(prev =>
              prev.map(msg =>
                msg.id === aiMessageId
                  ? { ...msg, content: `❌ ${error.message}\n\nPlease try again.`, status: 'error' as const }
                  : msg
              )
            )

            setRetryCount(0) // Reset for next message
          }

          setUIState(prev => ({
            ...prev,
            isStreaming: false,
            isTyping: false,
            error: error.message
          }))
        }
      )

      // Reset retry count on success
      setRetryCount(0)

    } catch (error: any) {
      console.error('Failed to send message:', error)
      toast.error('Failed to send message', {
        description: error?.message || 'Please try again'
      })
      setUIState(prev => ({
        ...prev,
        isStreaming: false,
        isTyping: false,
        error: 'Failed to send message'
      }))
    }
  }, [sessionId, currentState, collectedData, retryCount])

  /**
   * Clear session and reset state
   */
  const clearSession = useCallback(() => {
    setSessionId(null)
    setCurrentState('welcome' as ConversationState)
    setMessages([])
    setCollectedData({})
    setIsInitialized(false)
    setProgress({
      section: 'welcome',
      completionPercent: 0,
      fieldsCollected: 0,
      totalFields: 30,
    })
    localStorage.removeItem('chatbot_data')
  }, [])

  /**
   * Jump to a specific field for editing
   * Maps field names to conversation states
   */
  const jumpToField = useCallback((field: string) => {
    // Map field names to states
    const fieldToStateMap: Record<string, ConversationState> = {
      'company_name': 'company_name' as ConversationState,
      'company_type': 'company_type' as ConversationState,
      'description': 'company_description' as ConversationState,
      'logo_url': 'logo_upload' as ConversationState,
      'year_established': 'year_established' as ConversationState,
      'gst_number': 'gst_number' as ConversationState,
      'contact.email': 'contact_email' as ConversationState,
      'contact.phone': 'contact_phone' as ConversationState,
      'contact.whatsapp': 'contact_whatsapp' as ConversationState,
      'contact.address': 'contact_address' as ConversationState,
    }

    const targetState = fieldToStateMap[field]
    if (targetState) {
      // Add an AI message asking for the update
      const editMessage: Message = {
        id: Date.now().toString(),
        role: 'ai',
        content: `Let's update your **${field.replace('_', ' ').replace('.', ' ')}**. Please provide the new value.`,
        timestamp: new Date(),
        status: 'sent',
      }

      setMessages(prev => [...prev, editMessage])
      setCurrentState(targetState)
      setUIState(prev => ({ ...prev, scrollToBottom: true }))

      toast.info('Ready to edit!', {
        description: `You can now update your ${field.replace('_', ' ')}`
      })
    } else {
      toast.error('Cannot edit this field directly')
    }
  }, [])

  /**
   * Show summary card after completing major sections
   */
  useEffect(() => {
    const sectionsForSummary = ['business_info', 'contact', 'products', 'export_cert', 'team']

    // Show summary when moving to next major section
    if (sectionsForSummary.includes(progress.section) && progress.completionPercent > 0) {
      // Only show if we have data in that section
      setShowSummary(true)
    }
  }, [progress.section, progress.completionPercent])

  // Reset scroll trigger after scrolling
  useEffect(() => {
    if (uiState.scrollToBottom) {
      const timer = setTimeout(() => {
        setUIState(prev => ({ ...prev, scrollToBottom: false }))
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [uiState.scrollToBottom])

  const value: ChatContextValue = {
    sessionId,
    currentState,
    messages,
    collectedData,
    uiState,
    progress,
    sendMessage,
    initializeSession,
    clearSession,
    jumpToField,
    canSkip,
    isInitialized,
    showSummary,
  }

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

/**
 * Hook to use chat context
 */
export function useChat() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider')
  }
  return context
}