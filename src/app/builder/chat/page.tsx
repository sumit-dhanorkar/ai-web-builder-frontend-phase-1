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
import { Navbar } from '@/components/Navbar'
import { ChatProvider, useChat } from '@/lib/chat-context'
import { ChatContainer } from '@/components/chat/ChatContainer'
import { ChatInput } from '@/components/chat/ChatInput'
import { EnhancedProgressDisplay } from '@/components/EnhancedProgressDisplay'
import { useAuth } from '@/lib/auth-context'
import { useLoading } from '@/lib/loading-context'
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
  const { showLoader } = useLoading()
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

  // Initialize session only once when authenticated
  useEffect(() => {
    if (!isInitialized && isAuthenticated && !loading) {
      console.log('Initializing chat session...')
      initializeSession()
    }
  }, [isInitialized, isAuthenticated, loading])
  // Note: initializeSession is intentionally NOT in deps to prevent re-initialization

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
    // Show loader before navigation
    showLoader('📝 Switching to manual form...')
    // Chat data is persisted to Firebase, no need to save to localStorage
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

  // Show blank page while checking auth - global loader is visible
  if (loading) {
    return null
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Navigation */}
      <Navbar />

      {/* Mobile Menu Button - Chat specific */}
      {isMobileMenuOpen && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="fixed top-20 left-6 z-40 lg:hidden border-teal-200 hover:bg-teal-50"
        >
          <Menu className="w-5 h-5" />
        </Button>
      )}

      {/* Toggle Button */}
      <motion.button
        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        className="fixed top-28 z-[10001] w-8 h-8 bg-gradient-to-br from-teal-500 to-slate-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 hidden lg:flex"
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
        className="fixed left-0 top-20 h-[calc(100vh-5rem)] bg-gradient-to-br from-white via-teal-50/20 to-slate-50/30 backdrop-blur-sm border-r border-gray-200/50 shadow-2xl z-[9999] overflow-hidden hidden lg:block"
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