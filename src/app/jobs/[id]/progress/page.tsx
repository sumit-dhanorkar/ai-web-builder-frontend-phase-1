'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';
import { withAuth, useAuth } from '@/lib/auth-context';
import { jobStateManager } from '@/lib/job-state';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle,
  XCircle,
  Loader,
  ExternalLink,
  Github,
  Globe,
  ArrowLeft,
  Sparkles,
  GripVertical,
  User,
  LogOut,
  Settings,
  LayoutDashboard,
  ChevronDown,
} from 'lucide-react';

interface ProgressStep {
  step_name: string;
  step_status: string;
  step_message: string;
  timestamp: string;
}

interface Job {
  job_id: string;
  company_name: string;
  status: string;
  progress_percentage: number;
  current_step: string;
  github_repo_url: string | null;
  railway_deployment_url: string | null;
  error_message: string | null;
}

const STEP_EMOJIS: Record<string, string> = {
  queued: '⏳',
  business_analysis: '🧠',
  design_system: '🎨',
  create_project: '📦',
  generate_configs: '⚙️',
  generate_layout: '🏗️',
  generate_home: '🏠',
  generate_about: '📖',
  generate_products: '🛍️',
  generate_certificates: '🏆',
  generate_policies: '📜',
  generate_contact: '📞',
  github_integration: '🔗',
  railway_deployment: '🚀',
  completed: '🎉',
  failed: '❌',
};

function ProgressPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const jobId = params.id as string;
  const [job, setJob] = useState<Job | null>(null);
  const [steps, setSteps] = useState<ProgressStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const wsRef = useRef<WebSocket | null>(null);

  // Resizable panels state
  const [leftWidth, setLeftWidth] = useState(30); // percentage
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Profile dropdown state
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!jobId) return;

    loadJob();
    loadProgress();
    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [jobId]);

  // Auto-redirect only when job fails (not on completion - show inline preview instead)
  useEffect(() => {
    if (!job) return;

    if (job.status === 'completed') {
      // Clear active job from localStorage
      jobStateManager.clearActiveJob();

      // IMPORTANT: Ensure we have the deployment URL when job completes
      // If not present, fetch fresh data from API
      if (!job.railway_deployment_url) {
        console.log('⚠️ Job completed but no deployment URL - fetching fresh data...');
        loadJob();
      } else {
        console.log('✓ Job completed with deployment URL:', job.railway_deployment_url);
      }
    } else if (job.status === 'failed') {
      // Clear active job from localStorage
      jobStateManager.clearActiveJob();

      // Short delay to show error state, then redirect
      setTimeout(() => {
        router.push(`/jobs/${jobId}/error`);
      }, 2000);
    }
  }, [job?.status, jobId, router]);

  // Handle panel resizing
  const handleMouseDown = () => {
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !containerRef.current) return;

      const container = containerRef.current;
      const containerRect = container.getBoundingClientRect();
      const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;

      // Constrain between 20% and 50%
      if (newLeftWidth >= 20 && newLeftWidth <= 50) {
        setLeftWidth(newLeftWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

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
      await apiClient.logout();
      jobStateManager.clearActiveJob();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const loadJob = async () => {
    try {
      const jobData = await apiClient.getJob(jobId);
      setJob(jobData);
    } catch (err: any) {
      console.error('Failed to load job:', err);

      // If job not found, clear localStorage and redirect to builder
      if (err.status === 404 || err.detail?.includes('not found')) {
        console.log('Job not found - clearing localStorage and redirecting to builder');
        jobStateManager.clearActiveJob();
        setError('Job not found. Redirecting...');
        setTimeout(() => {
          router.push('/builder');
        }, 1500);
      } else {
        setError(err.detail || 'Failed to load job');
      }
    }
  };

  const loadProgress = async () => {
    try {
      const progressData = await apiClient.getJobProgress(jobId);
      setSteps(progressData.steps || []);
      setLoading(false);
    } catch (err: any) {
      console.error('Failed to load progress:', err);
      setLoading(false);
    }
  };

  const connectWebSocket = () => {
    const token = apiClient['getToken']();
    if (!token) return;

    const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000'}/api/ws/jobs/${jobId}?token=${token}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'progress_update' || data.type === 'step_completed') {
          setJob((prev) =>
            prev
              ? {
                  ...prev,
                  progress_percentage: data.progress_percentage,
                  current_step: data.step_name,
                }
              : null
          );

          // Deduplicate steps: only add if not already present
          setSteps((prev) => {
            const newStep = {
              step_name: data.step_name,
              step_status: data.step_status,
              step_message: data.message,
              timestamp: data.timestamp,
            };

            // Check if this exact step already exists (same step_name, status, and message)
            const isDuplicate = prev.some(
              (step) =>
                step.step_name === newStep.step_name &&
                step.step_status === newStep.step_status &&
                step.step_message === newStep.step_message
            );

            return isDuplicate ? prev : [...prev, newStep];
          });
        } else if (data.type === 'job_completed') {
          console.log('🎉 Job completed! WebSocket data:', data);

          setJob((prev) =>
            prev
              ? {
                  ...prev,
                  status: 'completed',
                  progress_percentage: 100,
                  github_repo_url: data.result?.github_repo_url,
                  railway_deployment_url: data.result?.railway_deployment_url,
                }
              : null
          );

          // IMPORTANT: Fetch fresh job data from API to ensure we have deployment URL
          // Sometimes WebSocket doesn't include the full result, so we need to fetch it
          setTimeout(() => {
            loadJob();
          }, 1000);
        } else if (data.type === 'error') {
          setJob((prev) =>
            prev
              ? {
                  ...prev,
                  status: 'failed',
                  error_message: data.message || data.error,
                }
              : null
          );
        }
      } catch (err) {
        console.error('Failed to parse WebSocket message:', err);
      }
    };

    ws.onerror = () => {
      // WebSocket errors are usually connection issues, will auto-reconnect
      console.warn('WebSocket connection issue - will retry');
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      if (job && (job.status === 'processing' || job.status === 'queued')) {
        setTimeout(() => connectWebSocket(), 3000);
      }
    };

    wsRef.current = ws;
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'failed':
        return <XCircle className="w-6 h-6 text-red-600" />;
      case 'started':
      case 'in_progress':
        return <Loader className="w-6 h-6 text-teal-600 animate-spin" />;
      default:
        return <div className="w-6 h-6 rounded-full border-2 border-gray-400"></div>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-teal-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading progress...</p>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-900 font-medium mb-2">Failed to load job</p>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-teal-700 to-slate-600 text-white rounded-lg hover:from-teal-800 hover:to-slate-700 transition-all"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
      {/* Professional Navbar */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2 group">
              <motion.div
                className="w-8 h-8 bg-gradient-to-br from-teal-600 to-teal-800 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Sparkles className="w-5 h-5 text-white" />
              </motion.div>
              <span className="text-xl font-bold bg-gradient-to-r from-teal-600 to-teal-800 bg-clip-text text-transparent">
                AI Web Builder
              </span>
            </Link>

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
      </header>

      <div className="h-[calc(100vh-73px)] overflow-hidden" ref={containerRef}>
        <div className="flex h-full">
          {/* LEFT SIDE: Compact Overall Progress */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="h-full bg-gradient-to-br from-white to-gray-50 overflow-y-auto"
            style={{
              width: `${leftWidth}%`,
              boxShadow: '4px 0 12px -2px rgba(0, 0, 0, 0.05)'
            }}
          >
            <div className="p-6 space-y-6">
            {/* Company Header */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="text-lg font-bold text-gray-900">{job.company_name}</h1>
              <p className="text-xs text-gray-500 mt-0.5">Website Generation Progress</p>
            </motion.div>

            {/* Progress Bar */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Overall Progress</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Completion</span>
                    <span className="text-lg font-bold bg-gradient-to-r from-teal-600 to-teal-800 bg-clip-text text-transparent">
                      {job.progress_percentage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden shadow-inner">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${job.progress_percentage}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-teal-500 via-teal-600 to-teal-700 rounded-full shadow-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Current Status */}
              {job.status !== 'completed' && job.status !== 'failed' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl p-6 text-center shadow-sm border border-teal-100"
                >
                  <div className="text-5xl mb-3">{STEP_EMOJIS[job.current_step] || '⏳'}</div>
                  <p className="text-sm font-semibold text-gray-900 mb-1">
                    {steps[steps.length - 1]?.step_message || 'Processing...'}
                  </p>
                  <p className="text-xs text-gray-600">Estimated time: 15-20 minutes</p>
                </motion.div>
              )}

              {job.status === 'completed' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 text-center shadow-sm border border-green-200"
                >
                  <div className="text-5xl mb-3">🎉</div>
                  <p className="text-base font-bold text-gray-900 mb-1">Website is Live!</p>
                  <p className="text-xs text-gray-600 mb-4">Successfully deployed</p>
                  {job.railway_deployment_url && (
                    <a
                      href={job.railway_deployment_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-teal-600 to-teal-700 text-white text-sm font-medium rounded-lg hover:from-teal-700 hover:to-teal-800 transition-all shadow-md hover:shadow-lg"
                    >
                      <Globe className="w-4 h-4" />
                      Open in New Tab
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </motion.div>
              )}

              {job.status === 'failed' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-6 text-center shadow-sm border border-red-200"
                >
                  <div className="text-5xl mb-3">❌</div>
                  <p className="text-base font-bold text-gray-900 mb-1">Generation Failed</p>
                  <p className="text-xs text-red-600 mb-4">{job.error_message || 'An error occurred'}</p>
                  <button
                    onClick={() => router.push('/builder')}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-teal-600 to-teal-700 text-white text-sm font-medium rounded-lg hover:from-teal-700 hover:to-teal-800 transition-all shadow-md hover:shadow-lg"
                  >
                    Try Again
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* RESIZE HANDLE */}
          <div
            onMouseDown={handleMouseDown}
            className="group relative w-px bg-transparent cursor-col-resize flex items-center justify-center flex-shrink-0"
          >
            {/* Invisible hit area for easier grabbing */}
            <div className="absolute inset-y-0 w-3 -translate-x-1/2 left-1/2" />

            {/* Visible line - very thin */}
            <div className={`absolute inset-y-0 w-px transition-all duration-200 ${
              isResizing
                ? 'bg-teal-500/60 shadow-sm'
                : 'bg-gray-200/60 group-hover:bg-teal-400/50'
            }`} />

            {/* Floating handle - only on hover/drag */}
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-10 bg-white rounded-md shadow-md border border-gray-200 flex items-center justify-center transition-all duration-200 ${
              isResizing
                ? 'opacity-100 scale-100'
                : 'opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100'
            }`}>
              <GripVertical className={`w-3 h-3 transition-colors ${
                isResizing ? 'text-teal-600' : 'text-gray-400'
              }`} />
            </div>
          </div>

          {/* RIGHT SIDE: Timeline OR Preview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1 h-full bg-gradient-to-br from-slate-50 via-gray-50 to-white overflow-hidden"
          >
            {/* Show Preview when completed, otherwise show timeline */}
            {(() => {
              const shouldShowPreview = job.status === 'completed' && !!job.railway_deployment_url;
              if (job.status === 'completed') {
                console.log('🎯 Render check:', {
                  status: job.status,
                  hasUrl: !!job.railway_deployment_url,
                  url: job.railway_deployment_url,
                  shouldShowPreview
                });
              }
              return shouldShowPreview;
            })() ? (
              <div className="h-full flex flex-col p-8">
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-700 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/30">
                      <Globe className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Live Preview</h3>
                      <p className="text-xs text-gray-500">Your website is now live and ready to view</p>
                    </div>
                  </div>
                </div>
                <div className="flex-1 rounded-2xl overflow-hidden border-2 border-gray-200 bg-white" style={{ boxShadow: '0 20px 60px -15px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.05)' }}>
                  <iframe
                    src={job.railway_deployment_url || ''}
                    className="w-full h-full"
                    title="Website Preview"
                    sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-popups-to-escape-sandbox"
                  />
                </div>
              </div>
            ) : (
              <div className="h-full overflow-y-auto p-8">
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-700 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/30">
                      <Loader className="w-5 h-5 text-white animate-spin" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Building Your Website</h3>
                      <p className="text-xs text-gray-500">Track the generation progress in real-time</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 max-w-4xl relative before:absolute before:left-3 before:top-0 before:bottom-0 before:w-0.5 before:bg-gradient-to-b before:from-gray-200 before:via-gray-300 before:to-gray-200">
                  <AnimatePresence>
                    {(() => {
                      // Deduplicate steps: keep only the LATEST occurrence of each step_name
                      const uniqueSteps = steps.reduce((acc, step) => {
                        const existing = acc.find(s => s.step_name === step.step_name);
                        if (!existing) {
                          acc.push(step);
                        } else {
                          // Replace with newer timestamp
                          const existingTime = new Date(existing.timestamp).getTime();
                          const newTime = new Date(step.timestamp).getTime();
                          if (newTime > existingTime) {
                            const index = acc.indexOf(existing);
                            acc[index] = step;
                          }
                        }
                        return acc;
                      }, [] as ProgressStep[]);

                      return uniqueSteps.map((step, index) => {
                        const isActive = step.step_name === job?.current_step;
                        const isCompleted = step.step_status === 'completed';
                        const isFailed = step.step_status === 'failed';

                        return (
                          <motion.div
                            key={step.step_name}
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05, type: "spring", stiffness: 120, damping: 20 }}
                            className="relative pl-10"
                          >
                            {/* Timeline Node */}
                            <div className={`absolute left-0 top-3 w-6 h-6 rounded-full flex items-center justify-center z-10 transition-all duration-300 ${
                              isActive
                                ? 'bg-gradient-to-br from-teal-400 to-teal-600 shadow-lg shadow-teal-500/50 scale-110'
                                : isCompleted
                                ? 'bg-gradient-to-br from-green-400 to-emerald-600 shadow-md shadow-green-500/30'
                                : isFailed
                                ? 'bg-gradient-to-br from-red-400 to-orange-600 shadow-md shadow-red-500/30'
                                : 'bg-gray-300 shadow-sm'
                            }`}>
                              {isActive ? (
                                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                              ) : isCompleted ? (
                                <CheckCircle className="w-4 h-4 text-white" />
                              ) : isFailed ? (
                                <XCircle className="w-4 h-4 text-white" />
                              ) : (
                                <div className="w-1.5 h-1.5 bg-white rounded-full" />
                              )}
                            </div>

                            {/* Card */}
                            <motion.div
                              whileHover={{ scale: 1.01, x: 4 }}
                              className={`group relative overflow-hidden rounded-2xl transition-all duration-300 border ${
                                isActive
                                  ? 'bg-gradient-to-br from-white via-teal-50/30 to-cyan-50/20 border-teal-200 shadow-lg'
                                  : isCompleted
                                  ? 'bg-white border-green-100 shadow-sm hover:shadow-md hover:border-green-200'
                                  : isFailed
                                  ? 'bg-white border-red-100 shadow-sm hover:shadow-md hover:border-red-200'
                                  : 'bg-white border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300'
                              }`}
                            >
                              {/* Glow effect for active */}
                              {isActive && (
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-teal-100/20 to-transparent opacity-50" />
                              )}

                              <div className="relative p-5">
                                <div className="flex items-start gap-4">
                                  {/* Icon */}
                                  <div className={`flex-shrink-0 mt-1 transition-transform duration-300 ${
                                    isActive ? 'scale-110 animate-pulse' : 'group-hover:scale-105'
                                  }`}>
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                      isActive
                                        ? 'bg-gradient-to-br from-teal-100 to-cyan-100'
                                        : isCompleted
                                        ? 'bg-gradient-to-br from-green-50 to-emerald-50'
                                        : isFailed
                                        ? 'bg-gradient-to-br from-red-50 to-orange-50'
                                        : 'bg-gray-50'
                                    }`}>
                                      {getStepIcon(step.step_status)}
                                    </div>
                                  </div>

                                  {/* Content */}
                                  <div className="flex-1 min-w-0">
                                    <h4 className={`font-semibold leading-relaxed mb-2 ${
                                      isActive
                                        ? 'text-gray-900 text-base'
                                        : 'text-gray-800 text-sm'
                                    }`}>
                                      {step.step_message}
                                    </h4>

                                    <div className="flex items-center gap-3 flex-wrap">
                                      {/* Timestamp */}
                                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                        <div className="w-1 h-1 bg-gray-400 rounded-full" />
                                        {new Date(step.timestamp).toLocaleTimeString('en-US', {
                                          hour: '2-digit',
                                          minute: '2-digit',
                                          second: '2-digit'
                                        })}
                                      </div>

                                      {/* Status Badge */}
                                      {isCompleted && (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                          <CheckCircle className="w-3 h-3" />
                                          Completed
                                        </span>
                                      )}
                                      {isActive && (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-teal-100 text-teal-700 text-xs font-medium rounded-full animate-pulse">
                                          <div className="w-2 h-2 bg-teal-500 rounded-full" />
                                          In Progress
                                        </span>
                                      )}
                                      {isFailed && (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                                          <XCircle className="w-3 h-3" />
                                          Failed
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          </motion.div>
                        );
                      });
                    })()}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(ProgressPage);