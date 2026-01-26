/**
 * Chat Persistence Hook
 * Handles saving and loading chat messages with widgets to/from Firebase
 * Fixes widget disappearance on page refresh
 */

import { useCallback } from 'react'
import { apiClient } from '@/lib/api-client'
import type { Message, BusinessInfo, ConversationState } from '@/types/chatbot'

/**
 * Hook for chat message persistence
 * Saves messages with widget data to Firebase for resurrection on page refresh
 */
export function useChatPersistence(sessionId: string | null) {
  /**
   * Save chat session state to Firebase
   */
  const saveSession = useCallback(
    async (
      currentState: ConversationState,
      currentSection: string,
      collectedData: Partial<BusinessInfo>
    ): Promise<boolean> => {
      if (!sessionId) {
        console.warn('No session ID, cannot save session')
        return false
      }

      try {
        await apiClient.post('/api/chat-sessions/save', {
          session_id: sessionId,
          current_state: currentState,
          current_section: currentSection,
          collected_data: collectedData,
          status: 'active',
        })

        console.debug('✅ Chat session saved to Firebase', {
          sessionId,
          state: currentState,
        })
        return true
      } catch (error) {
        console.error('Failed to save chat session:', error)
        return false
      }
    },
    [sessionId]
  )

  /**
   * Save individual message with widget data to Firebase
   * This ensures widgets persist across page refreshes
   */
  const saveMessage = useCallback(
    async (message: Message): Promise<boolean> => {
      if (!sessionId) {
        console.warn('No session ID, cannot save message')
        return false
      }

      try {
        // Convert widget config to serializable format
        const widget = message.widget
          ? {
              type: message.widget.type,
              field: message.widget.field,
              config: message.widget.config,
            }
          : null

        await apiClient.post('/api/chat-messages/save', {
          session_id: sessionId,
          message_id: message.id,
          role: message.role,
          content: message.content,
          timestamp: message.timestamp?.toISOString() || new Date().toISOString(),
          widget: widget,
          skip_available: message.skip_available || false,
          status: message.status || 'sent',
        })

        console.log('💾 Chat message saved to Firebase', {
          sessionId,
          messageId: message.id,
          role: message.role,
          hasWidget: !!widget,
        })
        return true
      } catch (error) {
        console.error('Failed to save chat message:', error)
        return false
      }
    },
    [sessionId]
  )

  /**
   * Load all messages for a session from Firebase
   * Messages include widget data for proper rendering
   */
  const loadMessages = useCallback(
    async (sessionId: string, limit: number = 100): Promise<Message[]> => {
      try {
        const response = await apiClient.get<{
          success: boolean
          messages: Array<{
            id: string
            role: string
            content: string
            timestamp: string
            widget?: {
              type: string
              field: string
              config?: any
            }
            skip_available: boolean
            status: string
          }>
        }>(`/api/chat-messages/${sessionId}?limit=${limit}`)

        if (!response.messages) {
          console.log('No messages found for session:', sessionId)
          return []
        }

        // Convert API format to Message format
        const messages: Message[] = response.messages.map(msg => ({
          id: msg.id,
          role: msg.role as 'user' | 'ai' | 'system',
          content: msg.content,
          timestamp: new Date(msg.timestamp),
          widget: msg.widget
            ? {
                type: msg.widget.type as any,
                field: msg.widget.field,
                config: msg.widget.config,
              }
            : undefined,
          skip_available: msg.skip_available,
          status: msg.status as 'sending' | 'sent' | 'error',
        }))

        console.log(`📥 Loaded ${messages.length} messages for session ${sessionId}`)
        return messages
      } catch (error) {
        console.error('Failed to load chat messages:', error)
        return []
      }
    },
    []
  )

  /**
   * Batch save multiple messages at once
   * Useful for syncing accumulated messages
   */
  const batchSaveMessages = useCallback(
    async (messages: Message[]): Promise<{ saved: number; failed: number }> => {
      if (!sessionId || messages.length === 0) {
        return { saved: 0, failed: 0 }
      }

      try {
        const response = await apiClient.post<{
          success: boolean
          saved_count: number
          failed_count: number
        }>('/api/chat-messages/batch-save', {
          session_id: sessionId,
          messages: messages.map(msg => ({
            session_id: sessionId,
            message_id: msg.id,
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp?.toISOString() || new Date().toISOString(),
            widget: msg.widget
              ? {
                  type: msg.widget.type,
                  field: msg.widget.field,
                  config: msg.widget.config,
                }
              : null,
            skip_available: msg.skip_available || false,
            status: msg.status || 'sent',
          })),
        })

        console.log(
          `✅ Batch saved ${response.saved_count} messages to Firebase (${response.failed_count} failed)`
        )

        return {
          saved: response.saved_count,
          failed: response.failed_count,
        }
      } catch (error) {
        console.error('Failed to batch save messages:', error)
        return { saved: 0, failed: messages.length }
      }
    },
    [sessionId]
  )

  /**
   * Get message count for a session without loading all messages
   */
  const getMessageCount = useCallback(
    async (sessionId: string): Promise<number> => {
      try {
        const response = await apiClient.get<{
          success: boolean
          message_count: number
        }>(`/api/chat-messages/${sessionId}/count`)

        return response.message_count || 0
      } catch (error) {
        console.error('Failed to get message count:', error)
        return 0
      }
    },
    []
  )

  /**
   * Delete all messages for a session (cleanup)
   */
  const deleteMessages = useCallback(
    async (sessionId: string): Promise<boolean> => {
      try {
        await apiClient.delete(`/api/chat-messages/${sessionId}`)
        console.log('✅ Deleted all messages for session:', sessionId)
        return true
      } catch (error) {
        console.error('Failed to delete messages:', error)
        return false
      }
    },
    []
  )

  return {
    saveSession,
    saveMessage,
    loadMessages,
    batchSaveMessages,
    getMessageCount,
    deleteMessages,
  }
}
