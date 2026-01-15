'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { withAuth } from '@/lib/auth-context';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  ExternalLink,
  Github,
  Globe,
  Sparkles,
  ArrowRight,
  Loader,
} from 'lucide-react';

interface Job {
  job_id: string;
  company_name: string;
  status: string;
  github_repo_url: string | null;
  railway_deployment_url: string | null;
}

function SuccessPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
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
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-green-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your website...</p>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-900 font-medium mb-2">Failed to load job</p>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/builder')}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Back to Builder
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="flex items-center justify-center mb-4">
              <CheckCircle className="w-16 h-16 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Your Website is Live! 🎉
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              {job.company_name} is now deployed and ready to share
            </p>

            <div className="flex items-center justify-center gap-4">
              {job.railway_deployment_url && (
                <a
                  href={job.railway_deployment_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition-all shadow-md"
                >
                  <Globe className="w-5 h-5" />
                  Open in New Tab
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
              {job.github_repo_url && (
                <a
                  href={job.github_repo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all shadow-md"
                >
                  <Github className="w-5 h-5" />
                  View Code
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
              <button
                onClick={() => router.push('/builder')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all shadow-sm"
              >
                <Sparkles className="w-5 h-5" />
                Build Another Website
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Website Preview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200"
        >
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <div className="flex-1 mx-6">
              <div className="bg-gray-700 rounded-md px-4 py-2 text-sm text-gray-300 font-mono truncate">
                {job.railway_deployment_url || 'Website Preview'}
              </div>
            </div>
            <Globe className="w-5 h-5 text-gray-400" />
          </div>

          {job.railway_deployment_url ? (
            <div className="relative" style={{ height: 'calc(100vh - 400px)', minHeight: '600px' }}>
              <iframe
                src={job.railway_deployment_url}
                className="w-full h-full border-0"
                title="Website Preview"
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
              />
            </div>
          ) : (
            <div className="h-96 flex items-center justify-center bg-gray-50">
              <p className="text-gray-500">No preview available</p>
            </div>
          )}
        </motion.div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-6 shadow-md border border-gray-200"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Fully Deployed</h3>
                <p className="text-sm text-gray-600">Live on Railway</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Your website is deployed and accessible worldwide with automatic HTTPS.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl p-6 shadow-md border border-gray-200"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Github className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Source Code</h3>
                <p className="text-sm text-gray-600">GitHub Repository</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Full source code is available on GitHub. Clone it to customize further.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl p-6 shadow-md border border-gray-200"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">AI-Generated</h3>
                <p className="text-sm text-gray-600">Powered by Claude</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Built with cutting-edge AI technology tailored to your business.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(SuccessPage);