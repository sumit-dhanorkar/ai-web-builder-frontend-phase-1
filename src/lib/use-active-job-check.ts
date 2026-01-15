/**
 * Custom hook to check for active jobs before navigating to builder
 */
import { useRouter } from 'next/navigation';
import { apiClient } from './api-client';
import { jobStateManager } from './job-state';
import { toast } from 'sonner';

export function useActiveJobCheck(currentUserId?: string) {
  const router = useRouter();

  /**
   * Check if user has an active job and redirect to progress page if they do
   * Uses localStorage first for instant check, then verifies with backend
   * @returns Promise<boolean> - true if has active job (redirected), false if no active job (can proceed)
   */
  const checkAndRedirect = async (): Promise<boolean> => {
    // STEP 1: Check localStorage first (instant, no network delay)
    // Pass currentUserId to ensure job belongs to this user
    const localJob = jobStateManager.getActiveJob(currentUserId);
    if (localJob && localJob.jobId) {
      // Immediately redirect based on localStorage
      toast.info('You have a job in progress');
      router.push(`/jobs/${localJob.jobId}/progress`);

      // Verify in background (don't await)
      verifyJobInBackground(localJob.jobId);

      return true; // Has active job in localStorage
    }

    // STEP 2: No localStorage job, check backend
    try {
      const response = await apiClient.getActiveJob();
      if (response.active_job) {
        // Backend says there's an active job
        const jobId = response.active_job.job_id;

        // Update localStorage with user ID
        jobStateManager.setActiveJob(jobId, response.active_job.status, currentUserId);

        // Redirect
        toast.info('You have a job in progress');
        router.push(`/jobs/${jobId}/progress`);
        return true;
      }

      // No active job
      return false;
    } catch (error: any) {
      // If check fails, allow user to proceed (fail open)
      console.warn('Could not check for active job:', error?.detail || 'Unknown error');
      return false;
    }
  };

  /**
   * Verify localStorage job with backend in background
   * If job is completed/failed, clear localStorage
   */
  const verifyJobInBackground = async (jobId: string) => {
    try {
      const jobData = await apiClient.getJob(jobId);
      if (jobData.status === 'completed' || jobData.status === 'failed') {
        // Job is done, clear localStorage
        jobStateManager.clearActiveJob();
      }
    } catch (error) {
      // Silently fail - user is already redirected
      console.warn('Background job verification failed');
    }
  };

  return { checkAndRedirect };
}