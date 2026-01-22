'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Sparkles,
  Zap,
  Globe,
  Palette,
  Code,
  Rocket,
  ArrowRight,
  Check,
  Star,
  Building2,
  TrendingUp,
  Shield,
  Award,
  Users,
  PlayCircle,
  LogIn,
  UserPlus,
  LayoutDashboard,
  LogOut,
  User,
  ChevronDown,
  Settings,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { useActiveJobCheck } from '@/lib/use-active-job-check'
import { jobStateManager } from '@/lib/job-state'

export default function HomePage() {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null)
  const { isAuthenticated, user, logout } = useAuth()
  const { checkAndRedirect } = useActiveJobCheck(user?.uid) // Pass Firebase UID
  const router = useRouter()

  // Profile dropdown state
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
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

  const handleLogout = async () => {
    try {
      await logout()
      jobStateManager.clearActiveJob()
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const handleStartBuilding = async () => {
    console.log('Start Building clicked:', { isAuthenticated, user: user?.uid })
    if (!isAuthenticated) {
      console.log('Not authenticated, redirecting to login')
      router.push('/login')
      return
    }

    // INSTANT CHECK: Check localStorage first (synchronous, no delay)
    // Pass user UID to ensure job belongs to THIS user
    const localJob = jobStateManager.getActiveJob(user?.uid)
    if (localJob && localJob.jobId) {
      // Immediately redirect - no waiting for API
      router.push(`/jobs/${localJob.jobId}/progress`)
      return
    }

    // Check backend for active job
    const hasActiveJob = await checkAndRedirect()
    if (!hasActiveJob) {
      // No active job, proceed to choice screen
      router.push('/builder/choose')
    }
  }

  const features = [
    {
      icon: Globe,
      title: "Export Trade Expertise",
      description: "Built specifically for Indian exporters with HSN codes, IEC compliance, and international trade documentation",
      color: "from-teal-500 to-slate-500"
    },
    {
      icon: Award,
      title: "Certification Showcase",
      description: "Professional display of APEDA, DGFT, ISO, and industry certifications to build buyer confidence",
      color: "from-amber-500 to-orange-500"
    },
    {
      icon: Sparkles,
      title: "AI Content Generation",
      description: "Generate compelling product descriptions, company profiles, and technical specifications automatically",
      color: "from-teal-600 to-slate-600"
    },
    {
      icon: TrendingUp,
      title: "B2B Lead Generation",
      description: "Convert global buyers with professional inquiry forms, catalog downloads, and trade-focused CTAs",
      color: "from-teal-600 to-cyan-600"
    },
    {
      icon: Shield,
      title: "Trust & Compliance",
      description: "Display GST, Udyam, and export licenses prominently to establish credibility with international buyers",
      color: "from-teal-600 to-slate-600"
    },
    {
      icon: Zap,
      title: "Multi-Language Ready",
      description: "Support for English, Hindi, and regional languages to reach domestic and international markets",
      color: "from-rose-600 to-pink-600"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center space-x-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-teal-700 to-slate-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-teal-700 to-slate-600 bg-clip-text text-transparent">
                AI Web Builder
              </span>
            </motion.div>
            
            <motion.div
              className="flex items-center space-x-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {isAuthenticated ? (
                <>
                  <Button
                    onClick={handleStartBuilding}
                    className="bg-gradient-to-r from-teal-700 to-slate-600 text-white hover:from-teal-800 hover:to-slate-700"
                  >
                    Start Building
                  </Button>

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
                                    setShowProfileDropdown(false)
                                    router.push('/dashboard')
                                  }}
                                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                  <LayoutDashboard className="w-4 h-4" />
                                  Dashboard
                                </button>

                                <button
                                  onClick={() => {
                                    setShowProfileDropdown(false)
                                    router.push('/admin/dashboard')
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
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" className="flex items-center gap-2">
                      <LogIn className="w-4 h-4" />
                      Login
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button className="bg-gradient-to-r from-teal-700 to-slate-600 text-white hover:from-teal-800 hover:to-slate-700 flex items-center gap-2">
                      <UserPlus className="w-4 h-4" />
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
              <Button
                onClick={handleStartBuilding}
                className="md:hidden bg-gradient-to-r from-teal-700 to-slate-600 text-white hover:from-teal-800 hover:to-slate-700"
              >
                Start Building
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 px-6 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-teal-50/30 via-slate-50/20 to-gray-50/30" />
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-teal-400/10 to-slate-400/10 rounded-full blur-3xl" />
          <div className="absolute top-40 right-10 w-96 h-96 bg-gradient-to-r from-slate-400/10 to-gray-400/10 rounded-full blur-3xl" />
        </div>
        
        <div className="relative max-w-7xl mx-auto">
          <motion.div 
            className="text-center max-w-5xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div 
              className="flex justify-center mb-8"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Badge className="px-6 py-3 text-sm font-semibold bg-gradient-to-r from-teal-600/10 to-slate-600/10 text-teal-700 border-teal-200/50 rounded-full">
                <Building2 className="w-4 h-4 mr-2" />
                Export Business Solutions • AI-Powered
              </Badge>
            </motion.div>
            
            <motion.h1 
              className="text-6xl md:text-8xl font-black mb-8 leading-[0.9]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <span className="bg-gradient-to-r from-gray-900 via-teal-800 to-slate-800 bg-clip-text text-transparent">
                Build Stunning
              </span>
              <br />
              <span className="bg-gradient-to-r from-teal-600 via-cyan-600 to-slate-600 bg-clip-text text-transparent">
                Export Websites
              </span>
              <br />
              <span className="text-gray-800">in Minutes</span>
            </motion.h1>
            
            <motion.p 
              className="text-xl md:text-2xl text-gray-700 mb-10 max-w-4xl mx-auto leading-relaxed font-medium"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Transform your export business into a stunning professional website with AI. 
              <span className="text-teal-600 font-semibold">Generate complete websites</span> with 
              HSN codes, certifications, and export documentation.
            </motion.p>
            
            <motion.div 
              className="flex flex-col lg:flex-row gap-6 justify-center items-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Button
                onClick={handleStartBuilding}
                size="lg"
                className="group bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white text-lg px-10 py-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              >
                <Sparkles className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform" />
                Start Building Now
                <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button variant="outline" size="lg" className="group text-lg px-10 py-6 rounded-2xl border-2 border-gray-200 hover:border-teal-300 hover:bg-teal-50/50 transition-all duration-300">
                <PlayCircle className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                Watch Demo
              </Button>
            </motion.div>
            
            {/* Stats Section */}
            <motion.div 
              className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              {[
                { number: "500+", label: "Exporters", icon: Users },
                { number: "2 Min", label: "Setup Time", icon: Zap },
                { number: "50+", label: "Countries", icon: Globe },
                { number: "24/7", label: "Support", icon: Shield }
              ].map((stat, index) => (
                <motion.div 
                  key={index}
                  className="text-center"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
                >
                  <div className="mb-2">
                    <stat.icon className="w-6 h-6 mx-auto text-teal-600 mb-2" />
                    <div className="text-2xl md:text-3xl font-bold text-gray-900">{stat.number}</div>
                  </div>
                  <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
            
            <motion.div 
              className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <div className="flex items-center">
                <Check className="w-4 h-4 mr-2 text-teal-500" />
                No coding required
              </div>
              <div className="flex items-center">
                <Check className="w-4 h-4 mr-2 text-teal-500" />
                Export compliance ready
              </div>
              <div className="flex items-center">
                <Check className="w-4 h-4 mr-2 text-teal-500" />
                Production ready
              </div>
              <div className="flex items-center">
                <Check className="w-4 h-4 mr-2 text-teal-500" />
                SEO optimized
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative py-20 px-6 overflow-hidden">
        {/* Glass morphism background */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-teal-50/20 to-slate-50/30" />
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 right-20 w-64 h-64 bg-gradient-to-r from-slate-400/20 to-gray-400/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 left-10 w-80 h-80 bg-gradient-to-r from-teal-400/15 to-cyan-400/15 rounded-full blur-3xl" />
        </div>
        
        <div className="relative max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-6xl font-black mb-6 bg-gradient-to-r from-gray-900 via-teal-800 to-slate-800 bg-clip-text text-transparent">
                Powerful Features
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-teal-500 to-slate-600 rounded-full mx-auto mb-6"></div>
              <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto font-medium">
                Everything you need to create professional export business websites with AI
              </p>
            </motion.div>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                onHoverStart={() => setHoveredFeature(index)}
                onHoverEnd={() => setHoveredFeature(null)}
              >
                <Card className="group h-full border-0 shadow-xl hover:shadow-2xl transition-all duration-500 bg-white/70 backdrop-blur-md hover:bg-white/80 relative overflow-hidden">
                  {/* Glass morphism overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Animated border gradient */}
                  <motion.div 
                    className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    animate={{
                      background: [
                        "linear-gradient(0deg, transparent, transparent)",
                        "linear-gradient(360deg, rgba(59, 130, 246, 0.3), rgba(147, 51, 234, 0.3), rgba(59, 130, 246, 0.3))",
                      ]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                    style={{
                      padding: "2px",
                      backgroundClip: "padding-box",
                    }}
                  />
                  
                  <CardHeader className="relative pb-4 z-10">
                    <motion.div 
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-6 shadow-lg`}
                      animate={{ 
                        scale: hoveredFeature === index ? 1.1 : 1,
                        rotate: hoveredFeature === index ? 10 : 0,
                        y: hoveredFeature === index ? -5 : 0
                      }}
                      transition={{ duration: 0.3, type: "spring" }}
                    >
                      <feature.icon className="w-8 h-8 text-white" />
                      
                      {/* Glow effect */}
                      <motion.div
                        className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${feature.color} opacity-0 blur-lg`}
                        animate={{
                          opacity: hoveredFeature === index ? 0.6 : 0,
                          scale: hoveredFeature === index ? 1.2 : 1
                        }}
                        transition={{ duration: 0.3 }}
                      />
                    </motion.div>
                    <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-gray-800 transition-colors">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <CardDescription className="text-gray-600 text-base leading-relaxed group-hover:text-gray-700 transition-colors">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                  
                  {/* Floating particles effect */}
                  <motion.div
                    className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    initial={false}
                  >
                    {[...Array(3)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-teal-400 rounded-full"
                        animate={{
                          x: [Math.random() * 100, Math.random() * 300],
                          y: [Math.random() * 100, Math.random() * 200],
                          opacity: [0, 1, 0],
                          scale: [0, 1, 0]
                        }}
                        transition={{
                          duration: 2 + Math.random(),
                          repeat: Infinity,
                          delay: Math.random() * 2
                        }}
                      />
                    ))}
                  </motion.div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Process Section */}
      <section className="py-16 px-6 bg-gradient-to-r from-slate-50 to-gray-50">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Simple 3-step process to create your professional website
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Input Business Info",
                description: "Fill in your company details, products, and contact information using our intuitive form"
              },
              {
                step: "02", 
                title: "Customize Sections",
                description: "Choose which sections to include and customize your website's structure and appearance"
              },
              {
                step: "03",
                title: "Generate & Deploy",
                description: "AI creates your complete Next.js website ready for immediate deployment"
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                className="relative"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <Card className="text-center p-8 border-0 shadow-lg bg-white">
                  <CardHeader className="pb-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-teal-700 to-slate-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-bold text-white">{step.step}</span>
                    </div>
                    <CardTitle className="text-xl font-semibold text-gray-900">
                      {step.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600 text-base leading-relaxed">
                      {step.description}
                    </CardDescription>
                  </CardContent>
                </Card>
                
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <ArrowRight className="w-8 h-8 text-slate-400" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Ready to Build Your Website?
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Join thousands of export businesses who have created stunning websites with our AI-powered builder.
            </p>
            
            <Button
              onClick={handleStartBuilding}
              size="lg"
              className="bg-gradient-to-r from-teal-700 to-slate-600 text-white hover:from-teal-800 hover:to-slate-700 text-lg px-12 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Get Started Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
