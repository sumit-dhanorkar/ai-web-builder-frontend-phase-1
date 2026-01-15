'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { withAuth, useAuth } from '@/lib/auth-context';
import { useActiveJobCheck } from '@/lib/use-active-job-check';
import { jobStateManager } from '@/lib/job-state';
import { motion } from 'framer-motion';
import {
  XCircle,
  AlertTriangle,
  RefreshCcw,
  Home,
  MessageCircle,
  Loader,
} from 'lucide-react';

interface Job {
  job_id: string;
  company_name: string;
  status: string;
  error_message: string | null;
  created_at: string;
}

function ErrorPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { checkAndRedirect } = useActiveJobCheck(user?.id); // Pass user ID
  const jobId = params.id as string;
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  const handleTryAgain = async () => {
    // Check localStorage first - pass user ID for isolation
    const localJob = jobStateManager.getActiveJob(user?.id);
    if (localJob && localJob.jobId) {
      router.push(`/jobs/${localJob.jobId}/progress`);
      return;
    }

    // Check backend for active job
    const hasActiveJob = await checkAndRedirect();
    if (!hasActiveJob) {
      // No active job, proceed to builder
      router.push('/builder');
    }
  };
  const [error, setError] = useState('');

  useEffect(() => {
    if (!jobId) return;

    loadJob();
  }, [jobId]);

  const loadJob = async () => {
    try {
      const jobData = await apiClient.getJob(jobId);
      setJob(jobData);
      setLoading(false);
    } catch (err: any) {
      setError(err.detail || 'Failed to load job');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-red-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-900 font-medium mb-2">Failed to load job</p>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={handleTryAgain}
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Back to Builder
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Error Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center"
              >
                <XCircle className="w-16 h-16 text-red-600" />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="absolute -top-2 -right-2 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center"
              >
                <AlertTriangle className="w-5 h-5 text-orange-600" />
              </motion.div>
            </div>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Generation Failed
          </h1>
          <p className="text-lg text-gray-600">
            We encountered an issue while generating your website
          </p>
        </motion.div>

        {/* Error Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-200"
        >
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Details</h2>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 font-medium mb-1">
                {job.company_name}
              </p>
              <p className="text-red-700">
                {job.error_message || 'An unexpected error occurred during website generation.'}
              </p>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">What happened?</h3>
            <div className="space-y-3 text-gray-600">
              <p>
                The website generation process encountered an error and could not complete successfully.
                This could be due to various reasons such as:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Invalid or incomplete business information</li>
                <li>Issues with external services (GitHub, Railway)</li>
                <li>Temporary server or network issues</li>
                <li>Configuration or technical errors</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">What can you do?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <RefreshCcw className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-blue-900 mb-1">Try Again</p>
                  <p className="text-sm text-blue-700">
                    Review your information and submit a new generation request
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                <MessageCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-green-900 mb-1">Contact Support</p>
                  <p className="text-sm text-green-700">
                    If the issue persists, reach out to our support team
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-center gap-4"
        >
          <button
            onClick={handleTryAgain}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg hover:from-red-700 hover:to-orange-700 transition-all shadow-md"
          >
            <RefreshCcw className="w-5 h-5" />
            Try Again
          </button>
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all shadow-sm"
          >
            <Home className="w-5 h-5" />
            Go Home
          </button>
        </motion.div>

        {/* Job Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 text-center text-sm text-gray-500"
        >
          <p>Job ID: {jobId}</p>
          <p className="mt-1">
            Created: {new Date(job.created_at).toLocaleString()}
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default withAuth(ErrorPage);