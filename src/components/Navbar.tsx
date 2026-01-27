'use client'

import { useRef, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, User, ChevronDown, LogOut, LayoutDashboard, Shield, LogIn, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'
import { jobStateManager } from '@/lib/job-state'
import { toast } from 'sonner'

export function Navbar() {
  const router = useRouter()
  const { user, logout, isAuthenticated } = useAuth()
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

  const handleLogout = async () => {
    try {
      await logout()
      jobStateManager.clearActiveJob()
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Logout failed')
    }
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-[10000] bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="max-w-full mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
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

          {/* Profile Dropdown / Auth Buttons */}
          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
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
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="flex items-center gap-2">
                    <LogIn className="w-4 h-4" />
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-gradient-to-r from-teal-600 to-slate-600 text-white hover:from-teal-700 hover:to-slate-700 flex items-center gap-2">
                    <UserPlus className="w-4 h-4" />
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}