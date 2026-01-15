/**
 * Job State Manager
 *
 * Utility for managing active job state in localStorage
 * Provides persistence across page refreshes and logout/login
 *
 * IMPORTANT: User-specific storage to prevent data leakage between users
 */

const ACTIVE_JOB_KEY = 'activeJobId';
const ACTIVE_JOB_STATUS_KEY = 'activeJobStatus';
const ACTIVE_JOB_USER_KEY = 'activeJobUserId'; // NEW: Track which user owns this job

export const jobStateManager = {
  /**
   * Store active job information for current user
   * @param jobId - The job ID
   * @param status - Job status
   * @param userId - Current user ID (for isolation)
   */
  setActiveJob(jobId: string, status: string, userId?: string) {
    if (typeof window === 'undefined') return;

    localStorage.setItem(ACTIVE_JOB_KEY, jobId);
    localStorage.setItem(ACTIVE_JOB_STATUS_KEY, status);

    // Store user ID to prevent cross-user data leakage
    if (userId) {
      localStorage.setItem(ACTIVE_JOB_USER_KEY, userId);
    }
  },

  /**
   * Get active job information for current user
   * Returns null if no active job OR if job belongs to different user
   * @param currentUserId - Current logged-in user ID
   */
  getActiveJob(currentUserId?: string): { jobId: string; status: string } | null {
    if (typeof window === 'undefined') return null;

    const jobId = localStorage.getItem(ACTIVE_JOB_KEY);
    const status = localStorage.getItem(ACTIVE_JOB_STATUS_KEY);
    const storedUserId = localStorage.getItem(ACTIVE_JOB_USER_KEY);

    if (!jobId || !status) return null;

    // CRITICAL: Verify this job belongs to current user
    if (currentUserId && storedUserId && storedUserId !== currentUserId) {
      // Job belongs to different user - clear stale data
      console.warn('Clearing stale job data from different user');
      this.clearActiveJob();
      return null;
    }

    return { jobId, status };
  },

  /**
   * Clear active job from storage
   * Called when job is completed, failed, or user logs out
   */
  clearActiveJob() {
    if (typeof window === 'undefined') return;

    localStorage.removeItem(ACTIVE_JOB_KEY);
    localStorage.removeItem(ACTIVE_JOB_STATUS_KEY);
    localStorage.removeItem(ACTIVE_JOB_USER_KEY);
  },

  /**
   * Update only the status of current active job
   */
  updateStatus(status: string) {
    if (typeof window === 'undefined') return;

    const jobId = localStorage.getItem(ACTIVE_JOB_KEY);
    if (jobId) {
      localStorage.setItem(ACTIVE_JOB_STATUS_KEY, status);
    }
  },

  /**
   * Check if user has an active job in localStorage
   * @param currentUserId - Current logged-in user ID
   */
  hasActiveJob(currentUserId?: string): boolean {
    if (typeof window === 'undefined') return false;

    const job = this.getActiveJob(currentUserId);
    return !!job;
  }
};
