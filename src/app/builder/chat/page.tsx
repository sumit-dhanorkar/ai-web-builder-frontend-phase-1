'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Building2,
  Package,
  Globe,
  Users,
  Settings,
  Sparkles,
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  Menu,
  User,
  ChevronDown,
  LogOut,
  LayoutDashboard,
  Shield,
  FileText,
  MessageSquare,
  Palette
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ChatProvider, useChat } from '@/lib/chat-context'
import { ChatContainer } from '@/components/chat/ChatContainer'
import { ChatInput } from '@/components/chat/ChatInput'
import { EnhancedProgressDisplay } from '@/components/EnhancedProgressDisplay'
import { useAuth } from '@/lib/auth-context'
import { jobStateManager } from '@/lib/job-state'
import Link from 'next/link'
import { toast } from 'sonner'

// Map chat sections to steps
const chatSteps = [
  {
    id: 'business-info',
    title: 'Business Information',
    description: 'Company details',
    icon: Building2,
    section: 'business_info'
  },
  {
    id: 'contact',
    title: 'Contact Details',
    description: 'Contact information',
    icon: MessageSquare,
    section: 'contact'
  },
  {
    id: 'products',
    title: 'Products & Services',
    description: 'Product categories',
    icon: Package,
    section: 'products'
  },
  {
    id: 'export',
    title: 'Export & Certifications',
    description: 'Export destinations',
    icon: Globe,
    section: 'export_cert'
  },
  {
    id: 'team',
    title: 'Team Members',
    description: 'Your team',
    icon: Users,
    section: 'team'
  },
  {
    id: 'config',
    title: 'Website Config',
    description: 'Design & settings',
    icon: Palette,
    section: 'config'
  },
  {
    id: 'review',
    title: 'Review & Generate',
    description: 'Final review',
    icon: Sparkles,
    section: 'review'
  }
]

function ChatPageContent() {
  const router = useRouter()
  const { isAuthenticated, loading, user, logout } = useAuth()
  const { initializeSession, sendMessage, progress, isInitialized, collectedData } = useChat()

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isDesktop, setIsDesktop] = useState(true)
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Calculate current step based on progress section
  const getCurrentStep = () => {
    const stepIndex = chatSteps.findIndex(s => s.section === progress.section)
    return stepIndex >= 0 ? stepIndex : 0
  }

  const currentStep = getCurrentStep()

  // Protect route
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      toast.error('Please login to access the chatbot')
      router.push('/login')
    }
  }, [isAuthenticated, loading, router])

  // Initialize session
  useEffect(() => {
    if (!isInitialized && isAuthenticated) {
      initializeSession()
    }
  }, [isInitialized, initializeSession, isAuthenticated])

  // Check desktop
  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024)
    }
    checkDesktop()
    window.addEventListener('resize', checkDesktop)
    return () => window.removeEventListener('resize', checkDesktop)
  }, [])

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false)
      }
    }

    if (showProfileDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showProfileDropdown])

  const handleSwitchToForm = () => {
    // Save chat data to localStorage before switching
    localStorage.setItem('chatbot_data', JSON.stringify(collectedData))
    toast.success('Switching to manual form...')
    router.push('/builder')
  }

  const handleLogout = async () => {
    try {
      await logout()
      jobStateManager.clearActiveJob()
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <div className="text-center">
          <motion.div
            className="inline-block w-16 h-16 border-4 border-teal-200 border-t-teal-600 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Navigation - Same as Builder */}
      <nav className="fixed top-0 w-full z-50 bg-gradient-to-r from-white/95 to-gray-50/95 backdrop-blur-xl border-b border-gray-200/50 shadow-lg">
        <div className="max-w-full mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3 group">
              <motion.div
                className="w-10 h-10 bg-gradient-to-br from-teal-600 to-slate-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300"
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Sparkles className="w-6 h-6 text-white" />
              </motion.div>
              <div className="flex flex-col">
                <span className="text-xl font-bold bg-gradient-to-r from-teal-700 to-slate-700 bg-clip-text text-transparent">
                  AI Web Builder
                </span>
                <span className="text-xs text-gray-500">Professional Website Generator</span>
              </div>
            </Link>

            <div className="flex items-center space-x-4">
              {/* Mobile Menu Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden border-teal-200 hover:bg-teal-50"
              >
                <Menu className="w-5 h-5" />
              </Button>

              <motion.div
                className="hidden sm:flex items-center space-x-2 text-sm text-gray-600"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <MessageSquare className="w-4 h-4 text-teal-500" />
                <span>AI Chat Mode</span>
              </motion.div>

              {/* Profile Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-100 transition-all duration-200 group"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-teal-600 to-teal-800 rounded-full flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-gray-900">{user?.email || 'User'}</p>
                    {user?.is_admin && (
                      <p className="text-xs text-teal-600 flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        Admin
                      </p>
                    )}
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${
                      showProfileDropdown ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {showProfileDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50"
                    >
                      <div className="p-3 border-b border-gray-100 bg-gradient-to-br from-gray-50 to-white">
                        <p className="text-sm font-medium text-gray-900 truncate">{user?.email}</p>
                        {user?.is_admin && (
                          <p className="text-xs text-teal-600 mt-0.5 flex items-center gap-1">
                            <Shield className="w-3 h-3" />
                            Administrator
                          </p>
                        )}
                      </div>

                      <div className="py-1">
                        {user?.is_admin && (
                          <>
                            <button
                              onClick={() => {
                                router.push('/dashboard')
                                setShowProfileDropdown(false)
                              }}
                              className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                            >
                              <LayoutDashboard className="w-4 h-4 text-gray-500" />
                              Dashboard
                            </button>
                            <button
                              onClick={() => {
                                router.push('/admin/dashboard')
                                setShowProfileDropdown(false)
                              }}
                              className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                            >
                              <Settings className="w-4 h-4 text-gray-500" />
                              Admin Panel
                            </button>
                            <div className="border-t border-gray-100 my-1"></div>
                          </>
                        )}
                        <button
                          onClick={() => {
                            handleLogout()
                            setShowProfileDropdown(false)
                          }}
                          className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
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
      </nav>

      {/* Toggle Button */}
      <motion.button
        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        className="fixed top-28 z-50 w-8 h-8 bg-gradient-to-br from-teal-500 to-slate-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 hidden lg:flex"
        animate={{
          left: isSidebarCollapsed ? '4rem' : '19rem'
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {isSidebarCollapsed ? (
          <ChevronRight className="w-4 h-4 text-white" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-white" />
        )}
      </motion.button>

      {/* Fixed Sidebar - Same as Builder */}
      <motion.aside
        className="fixed left-0 top-20 h-[calc(100vh-5rem)] bg-gradient-to-br from-white via-teal-50/20 to-slate-50/30 backdrop-blur-sm border-r border-gray-200/50 shadow-2xl z-40 overflow-hidden hidden lg:block"
        initial={{ x: isSidebarCollapsed ? -100 : -320, opacity: 0 }}
        animate={{
          x: 0,
          opacity: 1,
          width: isSidebarCollapsed ? '5rem' : '20rem'
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="h-full overflow-y-auto py-4 flex flex-col scrollbar-thin scrollbar-thumb-teal-400 scrollbar-track-transparent hover:scrollbar-thumb-teal-500">
          <div className="flex-1">
            <EnhancedProgressDisplay
              currentStep={currentStep}
              steps={chatSteps}
              onStepClick={undefined} // Chat doesn't support manual step jumping
              isCollapsed={isSidebarCollapsed}
            />
          </div>

          {/* Switch to Manual Form Button */}
          {!isSidebarCollapsed && (
            <div className="px-4 pb-4 pt-6 mt-6 border-t border-gray-200/50">
              <Button
                onClick={handleSwitchToForm}
                variant="outline"
                className="w-full h-12 items-center justify-center gap-2 border-2 border-teal-400 hover:bg-teal-50 text-teal-700 font-medium transition-all duration-200"
              >
                <FileText className="w-4 h-4" />
                <span>Switch to Manual Form</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </motion.aside>

      {/* Main Content */}
      <div
        className={`pt-20 transition-all duration-300 ${
          isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-80'
        }`}
      >
        <div className="h-[calc(100vh-5rem)] flex flex-col bg-white">
          <ChatContainer />
          <ChatInput
            onSend={sendMessage}
            placeholder="Type your answer here..."
          />
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
            />

            <motion.div
              className="fixed left-0 top-20 bottom-0 w-80 bg-white shadow-2xl z-50 lg:hidden overflow-y-auto flex flex-col scrollbar-thin scrollbar-thumb-teal-400 scrollbar-track-transparent hover:scrollbar-thumb-teal-500"
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="flex-1 p-4">
                <EnhancedProgressDisplay
                  currentStep={currentStep}
                  steps={chatSteps}
                  onStepClick={undefined}
                  isCollapsed={false}
                />
              </div>

              {/* Switch to Manual Form Button */}
              <div className="p-4 pt-6 border-t border-gray-200 mt-6">
                <Button
                  onClick={handleSwitchToForm}
                  variant="outline"
                  className="w-full h-12 items-center justify-center gap-2 border-2 border-teal-400 hover:bg-teal-50 text-teal-700 font-medium transition-all duration-200"
                >
                  <FileText className="w-4 h-4" />
                  <span>Switch to Manual Form</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function ChatPage() {
  return (
    <ChatProvider>
      <ChatPageContent />
    </ChatProvider>
  )
}