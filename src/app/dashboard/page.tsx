'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth, withAdmin } from '@/lib/auth-context';
import { apiClient } from '@/lib/api-client';
import { useActiveJobCheck } from '@/lib/use-active-job-check';
import { jobStateManager } from '@/lib/job-state';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  Loader,
  ExternalLink,
  Github,
  Globe,
  LogOut,
  User,
  Filter,
  ChevronDown,
  LayoutDashboard,
  Settings,
} from 'lucide-react';

interface Job {
  job_id: string;
  company_name: string;
  status: string;
  progress_percentage: number;
  current_step: string;
  created_at: string;
  completed_at: string | null;
  github_repo_url: string | null;
  railway_deployment_url: string | null;
  error_message: string | null;
}

function DashboardPage() {
  const { user, logout } = useAuth();
  const { checkAndRedirect } = useActiveJobCheck(user?.uid); // Pass user ID
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 10;

  // Profile dropdown state
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleNewWebsite = async () => {
    // INSTANT CHECK: Check localStorage first (synchronous, no delay)
    // Pass user ID to ensure job belongs to THIS user
    const localJob = jobStateManager.getActiveJob(user?.uid);
    if (localJob && localJob.jobId) {
      // Immediately redirect - no waiting for API
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

  useEffect(() => {
    loadJobs();
  }, [filter, page]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
    };

    if (showProfileDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileDropdown]);

  const handleLogout = async () => {
    try {
      await logout();
      jobStateManager.clearActiveJob();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const loadJobs = async () => {
    setLoading(true);
    try {
      const response = await apiClient.listJobs({
        status: filter === 'all' ? undefined : filter,
        limit,
        offset: (page - 1) * limit,
      });
      setJobs(response.jobs);
      setTotal(response.total);
    } catch (error: any) {
      console.log('Failed to load jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'processing':
      case 'queued':
        return <Loader className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      processing: 'bg-blue-100 text-blue-800',
      queued: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-gray-100 text-gray-800',
    };
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium ${
          styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-600 mt-1">
                Welcome back, {user?.full_name || user?.email}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleNewWebsite}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-teal-700 to-slate-600 text-white rounded-lg hover:from-teal-800 hover:to-slate-700 transition-all shadow-sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Website
              </button>

              {/* Profile Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-teal-600 to-teal-800 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-gray-900">{user?.email || 'User'}</p>
                    {user?.is_admin && (
                      <p className="text-xs text-teal-600">Admin</p>
                    )}
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showProfileDropdown ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {showProfileDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50"
                    >
                      <div className="p-3 border-b border-gray-100 bg-gray-50">
                        <p className="text-sm font-medium text-gray-900">{user?.email}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {user?.company_name || 'No company'}
                        </p>
                      </div>

                      <div className="py-1">
                        {user?.is_admin && (
                          <>
                            <button
                              onClick={() => {
                                setShowProfileDropdown(false);
                                router.push('/dashboard');
                              }}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              <LayoutDashboard className="w-4 h-4" />
                              Dashboard
                            </button>

                            <button
                              onClick={() => {
                                setShowProfileDropdown(false);
                                router.push('/admin/dashboard');
                              }}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              <Settings className="w-4 h-4" />
                              Admin Panel
                            </button>

                            <div className="border-t border-gray-100 my-1"></div>
                          </>
                        )}

                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Jobs</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Globe className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {jobs.filter((j) => j.status === 'completed').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Processing</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">
                  {jobs.filter((j) => j.status === 'processing' || j.status === 'queued').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Loader className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Failed</p>
                <p className="text-2xl font-bold text-red-600 mt-1">
                  {jobs.filter((j) => j.status === 'failed').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="flex items-center gap-2 p-4 border-b border-gray-200">
            <Filter className="w-5 h-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Filter by:</span>
            {['all', 'completed', 'processing', 'failed'].map((status) => (
              <button
                key={status}
                onClick={() => {
                  setFilter(status);
                  setPage(1);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === status
                    ? 'bg-teal-100 text-teal-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>

          {/* Jobs List */}
          <div className="divide-y divide-gray-200">
            {loading ? (
              <div className="p-12 text-center">
                <Loader className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Loading jobs...</p>
              </div>
            ) : jobs.length === 0 ? (
              <div className="p-12 text-center">
                <Globe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
                <p className="text-gray-600 mb-6">
                  {filter === 'all'
                    ? "You haven't created any websites yet."
                    : `No ${filter} jobs found.`}
                </p>
                <button
                  onClick={handleNewWebsite}
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-teal-700 to-slate-600 text-white rounded-lg hover:from-teal-800 hover:to-slate-700 transition-all"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Website
                </button>
              </div>
            ) : (
              jobs.map((job, index) => (
                <motion.div
                  key={job.job_id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="mt-1">{getStatusIcon(job.status)}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {job.company_name}
                          </h3>
                          {getStatusBadge(job.status)}
                        </div>
                        <div className="flex items-center gap-6 text-sm text-gray-600 mb-3">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {new Date(job.created_at).toLocaleDateString()}
                          </span>
                          {job.status === 'processing' && (
                            <span className="text-blue-600 font-medium">
                              {job.progress_percentage}% complete
                            </span>
                          )}
                        </div>
                        {job.error_message && (
                          <p className="text-sm text-red-600 mb-3">{job.error_message}</p>
                        )}
                        <div className="flex items-center gap-3">
                          {job.status === 'completed' && (
                            <>
                              {job.railway_deployment_url && (
                                <a
                                  href={job.railway_deployment_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                                >
                                  <Globe className="w-4 h-4" />
                                  View Live Site
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                              {job.github_repo_url && (
                                <a
                                  href={job.github_repo_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-700"
                                >
                                  <Github className="w-4 h-4" />
                                  View Code
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </>
                          )}
                          {(job.status === 'processing' || job.status === 'queued') && (
                            <Link
                              href={`/jobs/${job.job_id}/progress`}
                              className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                            >
                              View Progress
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Pagination */}
          {!loading && jobs.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing {(page - 1) * limit + 1}-{Math.min(page * limit, total)} of {total} jobs
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page * limit >= total}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default withAdmin(DashboardPage);