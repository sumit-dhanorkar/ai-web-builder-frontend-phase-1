/**
 * API client for making authenticated requests to the backend
 * Uses JWT tokens from backend for authorization
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface ApiError {
  detail: string;
  status: number;
}

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Get JWT token from localStorage
   */
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('access_token');
  }

  /**
   * Store JWT token in localStorage
   */
  setToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('access_token', token);
  }

  /**
   * Clear token and user data (for logout)
   */
  clearToken() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      // Clear job state when logging out
      localStorage.removeItem('activeJobId');
      localStorage.removeItem('activeJobStatus');
      localStorage.removeItem('activeJobUserId');
    }
  }

  /**
   * Make authenticated request
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({
          detail: response.statusText,
        }));

        // Handle token expiration (401 Unauthorized)
        if (response.status === 401) {
          // JWT token expired or invalid, clear it and redirect to login
          this.clearToken();
          if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
            console.warn('Authentication failed. Redirecting to login...');
            window.location.href = '/login';
          }
        }

        throw {
          detail: error.detail || error.message || 'Request failed',
          status: response.status,
        } as ApiError;
      }

      return response.json();
    } catch (error) {
      if ((error as ApiError).status) {
        throw error;
      }
      throw {
        detail: 'Network error. Please check your connection.',
        status: 0,
      } as ApiError;
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const response = await fetch(`${this.baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Login failed');
    }

    return response.json();
  }

  async register(data: {
    email: string;
    password: string;
    full_name?: string;
    company_name?: string;
    phone?: string;
  }) {
    const response = await fetch(`${this.baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Registration failed');
    }

    return response.json();
  }

  async logout() {
    try {
      await this.post('/api/auth/logout');
    } finally {
      this.clearToken();
    }
  }

  async getCurrentUser() {
    return this.get<any>('/api/auth/me');
  }

  // File upload endpoints
  async uploadImage(file: File, folder: string = 'images'): Promise<string> {
    const token = this.getToken();
    if (!token) throw new Error('Not authenticated');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const response = await fetch(`${this.baseUrl}/api/upload/image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Upload failed');
    }

    const data = await response.json();
    return data.url;
  }

  async uploadPDF(file: File, folder: string = 'documents'): Promise<string> {
    const token = this.getToken();
    if (!token) throw new Error('Not authenticated');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const response = await fetch(`${this.baseUrl}/api/upload/pdf`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Upload failed');
    }

    const data = await response.json();
    return data.url;
  }

  // Job endpoints
  async createJob(data: {
    business_info: any;
    website_config?: any;
  }) {
    return this.post<{
      success: boolean;
      job_id: string;
      celery_task_id: string;
      status: string;
      message: string;
      estimated_completion: string | null;
    }>('/api/jobs/generate', data);
  }

  async getJob(jobId: string) {
    return this.get<any>(`/api/jobs/${jobId}`);
  }

  async getJobProgress(jobId: string) {
    return this.get<any>(`/api/jobs/${jobId}/progress`);
  }

  async listJobs(params?: {
    status?: string;
    limit?: number;
    offset?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    const query = queryParams.toString();
    return this.get<any>(`/api/jobs${query ? `?${query}` : ''}`);
  }

  async cancelJob(jobId: string) {
    return this.delete<{
      success: boolean;
      job_id: string;
      message: string;
    }>(`/api/jobs/${jobId}`);
  }

  async getActiveJob() {
    return this.get<{
      active_job: any | null;
    }>('/api/jobs/active');
  }

  // Admin endpoints
  async getAdminStats() {
    return this.get<{
      total_users: number;
      total_jobs: number;
      jobs_completed: number;
      jobs_processing: number;
      jobs_failed: number;
    }>('/api/admin/stats');
  }

  async listAllUsers(params?: {
    limit?: number;
    offset?: number;
    search?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    if (params?.search) queryParams.append('search', params.search);

    const query = queryParams.toString();
    return this.get<any>(`/api/admin/users${query ? `?${query}` : ''}`);
  }

  async listAllJobs(params?: {
    status?: string;
    user_id?: string;
    limit?: number;
    offset?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.user_id) queryParams.append('user_id', params.user_id);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    const query = queryParams.toString();
    return this.get<any>(`/api/admin/jobs${query ? `?${query}` : ''}`);
  }

  // AI Description Assistant endpoints
  async streamDescription(
    operation: string,
    fieldType: string,
    currentText: string,
    context: Record<string, any>,
    onChunk: (text: string) => void,
    onComplete: () => void,
    onError: (error: Error) => void
  ): Promise<void> {
    const token = this.getToken();

    try {
      const response = await fetch(`${this.baseUrl}/api/ai-assistant/description/stream`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          operation,
          field_type: fieldType,
          current_text: currentText,
          context
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Stream failed' }));
        throw new Error(errorData.detail || 'Stream failed');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('ReadableStream not supported');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');

        // Process complete lines, keep incomplete line in buffer
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.error) {
                onError(new Error(data.error));
                return;
              }

              if (data.done) {
                onComplete();
              } else if (data.text) {
                onChunk(data.text);
              }
            } catch (e) {
              console.error('Failed to parse SSE data:', e);
            }
          }
        }
      }
    } catch (error) {
      onError(error as Error);
    }
  }

  // Chat Session endpoints
  async saveChatSession(data: {
    session_id: string
    current_state: string
    current_section: string
    collected_data: any
    status?: string
  }) {
    return this.post<{
      success: boolean
      message: string
      session_id: string
      timestamp: string
    }>('/api/chat-sessions/save', data);
  }

  async getChatSession(sessionId: string) {
    return this.get<{
      success: boolean
      session: any
    }>(`/api/chat-sessions/${sessionId}`);
  }

  async getLatestChatSession() {
    return this.get<{
      success: boolean
      session: any | null
      message?: string
    }>('/api/chat-sessions/user/latest');
  }

  async listChatSessions(limit: number = 10) {
    return this.get<{
      success: boolean
      sessions: any[]
      total_count: number
    }>(`/api/chat-sessions?limit=${Math.min(limit, 100)}`);
  }

  async completeChatSession(sessionId: string) {
    return this.post<{
      success: boolean
      message: string
      session_id: string
      timestamp: string
    }>(`/api/chat-sessions/${sessionId}/complete`);
  }

  async getConversationHistory(limit: number = 5) {
    return this.get<{
      success: boolean
      user_id: string
      sessions: any[]
      total_sessions: number
    }>(`/api/chat-sessions/history/conversation?limit=${Math.min(limit, 50)}`);
  }

  // Chat Messages endpoints
  async saveChatMessage(data: {
    session_id: string
    message_id: string
    role: string
    content: string
    timestamp: string
    widget?: any
    skip_available?: boolean
    status?: string
  }) {
    return this.post<{
      success: boolean
      message: string
      session_id: string
      message_id: string
      timestamp: string
    }>('/api/chat-messages/save', data);
  }

  async batchSaveChatMessages(data: {
    session_id: string
    messages: Array<{
      session_id: string
      message_id: string
      role: string
      content: string
      timestamp: string
      widget?: any
      skip_available?: boolean
      status?: string
    }>
  }) {
    return this.post<{
      success: boolean
      message: string
      session_id: string
      saved_count: number
      failed_count: number
      total_count: number
      timestamp: string
    }>('/api/chat-messages/batch-save', data);
  }

  async getChatMessages(sessionId: string, limit: number = 100) {
    return this.get<{
      success: boolean
      session_id: string
      messages: any[]
      total_count: number
      ordered_by: string
    }>(`/api/chat-messages/${sessionId}?limit=${Math.min(limit, 500)}`);
  }

  async getChatMessageCount(sessionId: string) {
    return this.get<{
      success: boolean
      session_id: string
      message_count: number
    }>(`/api/chat-messages/${sessionId}/count`);
  }

  async deleteChatMessages(sessionId: string) {
    return this.delete<{
      success: boolean
      message: string
      session_id: string
      timestamp: string
    }>(`/api/chat-messages/${sessionId}`);
  }

  // Website Info endpoints (standardized form sections)
  async saveBusinessInfo(data: any) {
    return this.post<{
      success: boolean
      message: string
      data: any
    }>('/api/website-info/business-info', data)
  }

  async getBusinessInfo() {
    return this.get<{
      success: boolean
      has_data: boolean
      data: any | null
    }>('/api/website-info/business-info')
  }

  async saveCategoryAndProduct(data: any) {
    return this.post<{
      success: boolean
      message: string
      data: any
    }>('/api/website-info/category-and-product', data)
  }

  async getCategoryAndProduct() {
    return this.get<{
      success: boolean
      has_data: boolean
      data: any | null
    }>('/api/website-info/category-and-product')
  }

  async saveWebsiteConfig(data: any) {
    return this.post<{
      success: boolean
      message: string
      data: any
    }>('/api/website-info/website-config', data)
  }

  async getWebsiteConfig() {
    return this.get<{
      success: boolean
      has_data: boolean
      data: any | null
    }>('/api/website-info/website-config')
  }

  async getAllWebsiteInfo() {
    return this.get<{
      success: boolean
      has_data: boolean
      data: any | null
    }>('/api/website-info/all')
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
