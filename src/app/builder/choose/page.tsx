'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { MessageSquare, FileText, Sparkles, ArrowRight, CheckCircle2, User, ChevronDown, LogOut, LayoutDashboard, Shield } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'
import Link from 'next/link'

export default function ChooseBuilderMethodPage() {
  const router = useRouter()
  const { isAuthenticated, loading, user, logout } = useAuth()
  const [hoveredCard, setHoveredCard] = useState<'chat' | 'form' | null>(null)
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Protect route - redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, loading, router])

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  const handleChatMode = () => {
    router.push('/builder/chat')
  }

  const handleFormMode = () => {
    router.push('/builder')
  }

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-white to-emerald-50">
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

  // Don't render if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
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

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {showProfileDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50"
                    >
                      {user?.is_admin && (
                        <>
                          <button
                            onClick={() => {
                              router.push('/admin/dashboard')
                              setShowProfileDropdown(false)
                            }}
                            className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                          >
                            <LayoutDashboard className="w-4 h-4 text-gray-500" />
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
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-24 pb-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-teal-600 via-teal-500 to-emerald-600 bg-clip-text text-transparent mb-3">
            Choose Your Creation Method
          </h1>
          <p className="text-base text-gray-600 max-w-2xl mx-auto">
            Select how you'd like to create your website. Both methods collect the same information—choose what works best for you.
          </p>
        </motion.div>

        {/* Choice Cards */}
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6">
          {/* Chat with AI Card */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            onMouseEnter={() => setHoveredCard('chat')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <Card className={`
              relative overflow-hidden transition-all duration-300 h-full
              ${hoveredCard === 'chat' ? 'shadow-2xl scale-105 border-teal-400' : 'shadow-lg border-gray-200'}
            `}>
              {/* Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-teal-50 to-emerald-50 opacity-50" />

              {/* Recommended Badge */}
              <div className="absolute top-3 right-3 z-10">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: 'spring' }}
                >
                  <span className="px-2.5 py-1 bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-xs font-semibold rounded-full shadow-lg">
                    Recommended
                  </span>
                </motion.div>
              </div>

              <CardHeader className="relative z-10 pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-xl shadow-lg">
                    <MessageSquare className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-800">
                      Chat with AI
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-600">
                      Conversational & Easy
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="relative z-10 space-y-4">
                {/* Description */}
                <p className="text-sm text-gray-700 leading-relaxed">
                  Have a natural conversation with our AI assistant. Just answer questions as they come—no forms, no overwhelming screens.
                </p>

                {/* Features */}
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-gray-700">
                      <span className="font-semibold">Guided conversation</span> - AI asks one question at a time
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-gray-700">
                      <span className="font-semibold">Natural language</span> - Type responses in your own words
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-gray-700">
                      <span className="font-semibold">AI assistance</span> - Get help writing descriptions
                    </p>
                  </div>
                </div>

                {/* Best For */}
                <div className="bg-teal-50 border border-teal-200 rounded-lg p-3">
                  <p className="text-xs font-semibold text-teal-800 mb-1.5">
                    <Sparkles className="w-3 h-3 inline mr-1" />
                    Best for:
                  </p>
                  <p className="text-xs text-teal-700">
                    First-time users or anyone who wants a guided experience.
                  </p>
                </div>

                {/* CTA Button */}
                <Button
                  onClick={handleChatMode}
                  className="w-full h-11 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Start with Chat
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Manual Form Card */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            onMouseEnter={() => setHoveredCard('form')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <Card className={`
              relative overflow-hidden transition-all duration-300 h-full
              ${hoveredCard === 'form' ? 'shadow-2xl scale-105 border-teal-400' : 'shadow-lg border-gray-200'}
            `}>
              {/* Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-teal-50 to-emerald-50 opacity-50" />

              <CardHeader className="relative z-10 pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-xl shadow-lg">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-800">
                      Manual Form
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-600">
                      Structured & Detailed
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="relative z-10 space-y-4">
                {/* Description */}
                <p className="text-sm text-gray-700 leading-relaxed">
                  Fill out a comprehensive form at your own pace. See all fields at once and have complete control over every detail.
                </p>

                {/* Features */}
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-gray-700">
                      <span className="font-semibold">Complete overview</span> - See all sections and fields
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-gray-700">
                      <span className="font-semibold">Full control</span> - Jump between sections freely
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-gray-700">
                      <span className="font-semibold">AI assistance</span> - Get help with descriptions
                    </p>
                  </div>
                </div>

                {/* Best For */}
                <div className="bg-teal-50 border border-teal-200 rounded-lg p-3">
                  <p className="text-xs font-semibold text-teal-800 mb-1.5">
                    <FileText className="w-3 h-3 inline mr-1" />
                    Best for:
                  </p>
                  <p className="text-xs text-teal-700">
                    Users who prefer forms or have all information ready.
                  </p>
                </div>

                {/* CTA Button */}
                <Button
                  onClick={handleFormMode}
                  variant="outline"
                  className="w-full h-11 border-2 border-teal-500 text-teal-700 hover:bg-teal-50 font-semibold shadow-md hover:shadow-lg transition-all duration-300"
                >
                  Continue with Form
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Info Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center mt-6 max-w-3xl mx-auto"
        >
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg p-4">
            <p className="text-xs text-amber-900 font-medium">
              <span className="font-bold">💡 Pro Tip:</span> You can switch between chat and form at any time without losing your progress. All your data is automatically saved!
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
