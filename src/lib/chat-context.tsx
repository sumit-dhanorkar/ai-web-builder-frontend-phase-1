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

  // Use ref to track initialization in progress (prevents double calls in Strict Mode)
  const isInitializingRef = React.useRef(false)

  /**
   * NOTE: We intentionally do NOT load data from localStorage for chat.
   * Chat always starts fresh with the welcome message because:
   * 1. We can't reconstruct chat history/widgets from form data
   * 2. User expects a fresh guided conversation when choosing chat
   * 
   * Form data is preserved in localStorage for the manual form,
   * so users can switch back to form and continue where they left off.
   */

  /**
   * Session tracking - save session ID to sessionStorage (cleared on tab close)
   * This allows resuming session from backend without storing full message history locally
   */
  useEffect(() => {
    if (sessionId) {
      sessionStorage.setItem('current_session_id', sessionId)
      sessionStorage.setItem('session_timestamp', Date.now().toString())
    }
  }, [sessionId])

  /**
   * Check if there's meaningful chatbot data in localStorage
   * Returns true only if chatbot_data exists and has actual content
   */
  const hasMeaningfulChatData = (): boolean => {
    try {
      const data = localStorage.getItem('chatbot_data')
      if (!data) return false
      
      const parsed = JSON.parse(data)
      if (!parsed || typeof parsed !== 'object') return false
      
      // Check if there's any actual data (not just empty object)
      // Look for key fields that indicate user has actually entered data
      const hasCompanyName = parsed.company_name && parsed.company_name.trim() !== ''
      const hasCompanyType = parsed.company_type && parsed.company_type.trim() !== ''
      const hasDescription = parsed.description && parsed.description.trim() !== ''
      
      return hasCompanyName || hasCompanyType || hasDescription
    } catch {
      return false
    }
  }

  /**
   * Initialize chatbot session
   * - If no meaningful data collected → always show fresh welcome message
   * - If user has data → try to resume session from backend
   */
  const initializeSession = useCallback(async () => {
    // Prevent double initialization (handles React Strict Mode double mounting)
    if (isInitialized || isInitializingRef.current) {
      console.log('Session already initialized or initializing, skipping...')
      return
    }

    isInitializingRef.current = true

    try {
      setUIState(prev => ({ ...prev, isLoading: true }))

      // Check if user has meaningful data - if not, always start fresh
      const hasData = hasMeaningfulChatData()
      
      if (!hasData) {
        // No meaningful data - clear any stale session and start fresh
        console.log('📭 No meaningful chatbot data found - starting fresh')
        sessionStorage.removeItem('current_session_id')
        sessionStorage.removeItem('session_timestamp')
      }

      // Check for existing session in sessionStorage
      const existingSessionId = sessionStorage.getItem('current_session_id')
      const sessionTimestamp = parseInt(sessionStorage.getItem('session_timestamp') || '0')
      const sessionAge = Date.now() - sessionTimestamp
      const SESSION_EXPIRY = 24 * 60 * 60 * 1000 // 24 hours (matches Redis TTL)

      let response

      // Try to resume existing session only if we have data AND valid session
      if (hasData && existingSessionId && sessionAge < SESSION_EXPIRY) {
        console.log('📥 Attempting to resume session from backend:', existingSessionId)
        try {
          response = await chatAPI.resumeSession(existingSessionId)

          // Successfully resumed
          setSessionId(response.session_id)
          setCurrentState(response.current_state)
          setMessages(response.messages as Message[])
          setCollectedData(response.collected_data || {})
          setProgress(response.progress || {
            section: 'welcome',
            completionPercent: 0,
            fieldsCollected: 0,
            totalFields: 30,
          })
          setIsInitialized(true)

          toast.success('Session restored!', {
            description: 'Continuing where you left off'
          })

          console.log(`✅ Session resumed with ${response.messages.length} messages`)
        } catch (resumeError: any) {
          // Session not found in backend, clear sessionStorage and create new
          console.log('⚠️ Failed to resume session:', resumeError.message)
          sessionStorage.removeItem('current_session_id')
          sessionStorage.removeItem('session_timestamp')

          // Fall through to create new session
          response = null
        }
      }

      // Create new session if resume failed or no existing session
      if (!response) {
        console.log('🆕 Creating new session...')
        response = await chatAPI.initializeSession({
          user_id: user?.uid || 'guest', // Use Firebase UID
          resume: false,
        })

        setSessionId(response.session_id)
        setCurrentState(response.current_state)
        setMessages(response.messages as Message[])
        setCollectedData(response.collected_data || {})
        setIsInitialized(true)

        // Send initial welcome message from AI
        setTimeout(() => {
          sendWelcomeMessage()
        }, 500)
      }

    } catch (error) {
      console.error('Failed to initialize session:', error)
      toast.error('Failed to start chat session')
      setUIState(prev => ({
        ...prev,
        error: 'Failed to initialize session'
      }))
      isInitializingRef.current = false // Reset on error
    } finally {
      setUIState(prev => ({ ...prev, isLoading: false }))
    }
  }, [user?.uid])

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
    // Clear both localStorage and sessionStorage
    localStorage.removeItem('chatbot_data')
    sessionStorage.removeItem('current_session_id')
    sessionStorage.removeItem('session_timestamp')
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