'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth, withAdmin } from '@/lib/auth-context';
import { apiClient } from '@/lib/api-client';
import { jobStateManager } from '@/lib/job-state';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Users,
  Briefcase,
  CheckCircle,
  XCircle,
  Loader,
  LogOut,
  Filter,
  ExternalLink,
  Sparkles,
  Shield,
  Github,
  Globe,
  User,
  ChevronDown,
  LayoutDashboard,
  Settings,
} from 'lucide-react';

interface AdminStats {
  total_users: number;
  total_jobs: number;
  jobs_completed: number;
  jobs_processing: number;
  jobs_failed: number;
}

interface User {
  id: string;
  email: string;
  company_name: string;
  created_at: string;
  is_admin: boolean;
  job_stats: {
    total: number;
    completed: number;
    processing: number;
    failed: number;
  };
}

interface Job {
  job_id: string;
  user_email: string;
  user_company: string;
  company_name: string;
  status: string;
  progress_percentage: number;
  created_at: string;
  github_repo_url: string | null;
  railway_deployment_url: string | null;
}

function AdminDashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'users' | 'jobs'>('users');
  const [filter, setFilter] = useState<string>('all');

  // Profile dropdown state
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadAdminData();
  }, [view, filter]);

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

  const loadAdminData = async () => {
    setLoading(true);
    try {
      // Load stats
      const statsData = await apiClient.getAdminStats();
      setStats(statsData);

      if (view === 'users') {
        const usersData = await apiClient.listAllUsers({ limit: 50 });
        setUsers(usersData.users);
      } else {
        const jobsData = await apiClient.listAllJobs({
          status: filter === 'all' ? undefined : filter,
          limit: 50,
        });
        setJobs(jobsData.jobs);
      }
    } catch (error) {
      console.error('Failed to load admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
      case 'queued':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2 group">
              <motion.div
                className="w-8 h-8 bg-gradient-to-br from-teal-700 to-slate-600 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Sparkles className="w-5 h-5 text-white" />
              </motion.div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-teal-700 to-slate-600 bg-clip-text text-transparent">
                  AI Web Builder
                </span>
                <p className="text-xs text-gray-500">Admin Dashboard</p>
              </div>
            </Link>

            <div className="flex items-center gap-4">
              {/* Profile Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-teal-600 to-teal-800 rounded-full flex items-center justify-center">
                    <Shield className="w-4 h-4 text-white" />
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-gray-900">{user?.email || 'Admin'}</p>
                    <p className="text-xs text-teal-600">Administrator</p>
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
                        <p className="text-xs text-teal-600 mt-0.5 flex items-center gap-1">
                          <Shield className="w-3 h-3" />
                          Administrator
                        </p>
                      </div>

                      <div className="py-1">
                        <button
                          onClick={() => {
                            setShowProfileDropdown(false);
                            router.push('/dashboard');
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          User Dashboard
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
            >
              <Users className="w-8 h-8 text-teal-600 mb-2" />
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total_users}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
            >
              <Briefcase className="w-8 h-8 text-purple-600 mb-2" />
              <p className="text-sm text-gray-600">Total Jobs</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total_jobs}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
            >
              <CheckCircle className="w-8 h-8 text-green-600 mb-2" />
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">{stats.jobs_completed}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
            >
              <Loader className="w-8 h-8 text-teal-600 mb-2" />
              <p className="text-sm text-gray-600">Processing</p>
              <p className="text-2xl font-bold text-teal-600">{stats.jobs_processing}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
            >
              <XCircle className="w-8 h-8 text-red-600 mb-2" />
              <p className="text-sm text-gray-600">Failed</p>
              <p className="text-2xl font-bold text-red-600">{stats.jobs_failed}</p>
            </motion.div>
          </div>
        )}

        {/* View Toggle */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex gap-2">
              <button
                onClick={() => setView('users')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  view === 'users'
                    ? 'bg-teal-100 text-teal-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Users
              </button>
              <button
                onClick={() => setView('jobs')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  view === 'jobs'
                    ? 'bg-teal-100 text-teal-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Jobs
              </button>
            </div>

            {view === 'jobs' && (
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-400" />
                {['all', 'completed', 'processing', 'failed'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                      filter === status
                        ? 'bg-teal-100 text-teal-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <Loader className="w-8 h-8 text-teal-600 animate-spin mx-auto" />
              </div>
            ) : view === 'users' ? (
              <div className="space-y-4">
                {users.filter(u => u.email !== user?.email).length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No users found</p>
                ) : (
                  users.filter(u => u.email !== user?.email).map((u) => (
                    <div
                      key={u.id}
                      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900">{u.email}</h3>
                            {u.is_admin && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                                <Shield className="w-3 h-3" />
                                Admin
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{u.company_name || 'No company'}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Joined: {new Date(u.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-4 text-sm">
                          <div className="text-center">
                            <p className="font-bold text-gray-900">{u.job_stats.total}</p>
                            <p className="text-gray-600">Total</p>
                          </div>
                          <div className="text-center">
                            <p className="font-bold text-green-600">{u.job_stats.completed}</p>
                            <p className="text-gray-600">Done</p>
                          </div>
                          <div className="text-center">
                            <p className="font-bold text-teal-600">{u.job_stats.processing}</p>
                            <p className="text-gray-600">Active</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {jobs.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No jobs found</p>
                ) : (
                  jobs.map((j) => (
                    <div
                      key={j.job_id}
                      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-900">{j.company_name}</h3>
                          <p className="text-sm text-gray-600">{j.user_email}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(j.created_at).toLocaleDateString()} at{' '}
                            {new Date(j.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(
                              j.status
                            )}`}
                          >
                            {j.status}
                          </span>

                          {/* GitHub Repository Link - Admin Only */}
                          {j.github_repo_url && (
                            <a
                              href={j.github_repo_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-colors group"
                              title="View GitHub Repository"
                            >
                              <Github className="w-3.5 h-3.5" />
                              <span className="text-xs font-medium">Code</span>
                              <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </a>
                          )}

                          {/* Railway Deployment Link */}
                          {j.railway_deployment_url && (
                            <a
                              href={j.railway_deployment_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white rounded-lg transition-all group shadow-sm"
                              title="View Live Website"
                            >
                              <Globe className="w-3.5 h-3.5" />
                              <span className="text-xs font-medium">Live</span>
                              <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default withAdmin(AdminDashboardPage);
