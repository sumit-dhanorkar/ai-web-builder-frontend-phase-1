/**
 * API client for making authenticated requests to the backend
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
   * Get authentication token from localStorage
   */
  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('access_token');
  }

  /**
   * Set authentication token in localStorage
   */
  setToken(token: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', token);
    }
  }

  /**
   * Remove authentication token from localStorage
   */
  clearToken() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      // Also clear job state when logging out
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
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
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
          // Clear all auth data
          this.clearToken();

          // Only redirect if we're in the browser and not already on login page
          if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
            console.warn('Token expired or invalid. Redirecting to login...');
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
  async register(data: {
    email: string;
    password: string;
    full_name?: string;
    company_name?: string;
    phone?: string;
  }) {
    return this.post('/api/auth/register', data);
  }

  async login(email: string, password: string) {
    const response = await this.post<{
      access_token: string;
      refresh_token: string;
      token_type: string;
      expires_in: number;
      user: any;
    }>('/api/auth/login', { email, password });

    // Store tokens
    this.setToken(response.access_token);
    if (typeof window !== 'undefined') {
      localStorage.setItem('refresh_token', response.refresh_token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }

    return response;
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

  async refreshToken() {
    if (typeof window === 'undefined') return null;

    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) return null;

    const response = await this.post<{
      access_token: string;
      token_type: string;
      expires_in: number;
    }>('/api/auth/refresh', { refresh_token: refreshToken });

    this.setToken(response.access_token);
    return response;
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
}

// Export singleton instance
export const apiClient = new ApiClient();