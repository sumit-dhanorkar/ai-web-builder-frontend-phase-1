/**
 * Chat API Client
 * Handles all chatbot API interactions
 */

import type {
  ChatMessageRequest,
  ChatMessageResponse,
  ChatStreamChunk,
  SessionInitRequest,
  SessionInitResponse,
  ValidationRequest,
  ValidationResponse,
  ConversationState,
} from '@/types/chatbot'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

/**
 * Get auth token from localStorage
 */
function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('access_token')
}

/**
 * Chat API Client Class
 */
export class ChatAPI {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  /**
   * Initialize a new chatbot session
   */
  async initializeSession(request: SessionInitRequest): Promise<SessionInitResponse> {
    const token = getToken()

    const response = await fetch(`${this.baseUrl}/api/chatbot/session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      // Handle authentication errors
      if (response.status === 401 || response.status === 403) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          localStorage.removeItem('user')
          window.location.href = '/login'
        }
        throw new Error('Authentication required. Please login.')
      }

      const error = await response.json().catch(() => ({ detail: response.statusText }))
      throw new Error(error.detail || `Failed to initialize session: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Get existing session data
   */
  async getSession(sessionId: string): Promise<any> {
    const token = getToken()

    const response = await fetch(`${this.baseUrl}/api/chatbot/session/${sessionId}`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to get session: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Send a message and get non-streaming response
   */
  async sendMessage(request: ChatMessageRequest): Promise<ChatMessageResponse> {
    const token = getToken()

    const response = await fetch(`${this.baseUrl}/api/chatbot/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      throw new Error(`Failed to send message: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Send a message with streaming response
   */
  async streamMessage(
    request: ChatMessageRequest,
    onChunk: (chunk: string) => void,
    onComplete: (data: any) => void,
    onError: (error: Error) => void
  ): Promise<void> {
    const token = getToken()

    try {
      const response = await fetch(`${this.baseUrl}/api/chatbot/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(request),
      })

      if (!response.ok) {
        // Handle authentication errors
        if (response.status === 401 || response.status === 403) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('access_token')
            localStorage.removeItem('refresh_token')
            localStorage.removeItem('user')
            window.location.href = '/login'
          }
          throw new Error('Authentication required. Please login.')
        }

        const error = await response.json().catch(() => ({ detail: response.statusText }))
        throw new Error(error.detail || `Stream failed: ${response.statusText}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No response body')
      }

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n\n')

        // Keep the last incomplete line in the buffer
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6)) as ChatStreamChunk

              if (data.error) {
                onError(new Error(data.error))
                return
              }

              if (data.done) {
                onComplete(data)
              } else if (data.text) {
                onChunk(data.text)
              }
            } catch (err) {
              console.error('Failed to parse SSE data:', err)
            }
          }
        }
      }
    } catch (error) {
      onError(error as Error)
    }
  }

  /**
   * Validate user input for a field
   */
  async validateInput(request: ValidationRequest): Promise<ValidationResponse> {
    const token = getToken()

    const response = await fetch(`${this.baseUrl}/api/chatbot/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      throw new Error(`Validation failed: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Check chatbot service health
   */
  async healthCheck(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/chatbot/health`)

    if (!response.ok) {
      throw new Error(`Health check failed: ${response.statusText}`)
    }

    return response.json()
  }
}

// Export singleton instance
export const chatAPI = new ChatAPI()