'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Input } from '@/components/ui/input'
import { ImageUpload } from '@/components/ui/image-upload'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { MultiSelect } from '@/components/ui/multiselect'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AIDescriptionAssistant } from '@/components/AIDescriptionAssistant'
import {
  Building2,
  Globe,
  Package,
  Settings,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Plus,
  Trash2,
  Eye,
  Download,
  Rocket,
  FileText,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Award,
  Users,
  X,
  ChevronRight,
  ChevronLeft,
  Star,
  Zap,
  Shield,
  Timer,
  Palette,
  Layout,
  Code,
  Cloud,
  AlertTriangle,
  CheckCircle,
  Copy,
  Factory,
  Leaf,
  Zap as Lightning,
  Shirt,
  Gem,
  Wheat,
  Smartphone,
  Handshake,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  User,
  ChevronDown,
  LogOut,
  LayoutDashboard,
  MessageSquare,
  Target
} from 'lucide-react'
import { 
  FaLinkedin, 
  FaFacebook, 
  FaInstagram, 
  FaTwitter, 
  FaYoutube,
  FaSeedling,
  FaTshirt,
  FaGem,
  FaIndustry,
  FaMobileAlt,
  FaHandshake,
  FaCheckCircle,
  FaCloudUploadAlt,
  FaCopy,
  FaDownload
} from 'react-icons/fa'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ProductStep } from '@/components/ProductStep'
import { ConfigurationStep } from '@/components/ConfigurationStep'
import { Combobox } from '@/components/ui/combobox'
import { establishmentYears, exportContriesWithFlags, predefinedCertifications } from '@/data/suggestions'
import { saveCompleteProject } from '@/lib/firebase-helpers'
import { useAuth } from '@/lib/auth-context'
import { apiClient } from '@/lib/api-client'
import { jobStateManager } from '@/lib/job-state'
import { Loader } from 'lucide-react'
import { EnhancedProgressDisplay } from '@/components/EnhancedProgressDisplay'
import { loadChatDataFromStorage, syncChatToForm, saveChatDataToStorage, clearChatDataFromStorage } from '@/lib/state-sync'

interface BusinessInfo {
  company_name: string
  company_type: string
  logo_url: string
  year_established: string
  iec_code: string
  gst_number: string
  udyam_adhar: string
  description: string
  contact: {
    email: string
    phone: string
    whatsapp: string
    address: string
    social_media: {
      linkedin: string
      facebook: string
      instagram: string
      twitter: string
      youtube: string
    }
  }
  categories: Array<{
    name: string
    description: string
    products: Array<{
      name: string
      description: string
      hsn_code: string
      image_url: string
      specifications: {
        grade: string
        origin: string
        color: string
        purity: string
        moisture_content: string
        shelf_life: string
        moq: string
        lead_time: string
      }
      key_benefits: string[]
    }>
  }>
  export_countries: Array<{
    country_name: string
    flag_url: string
  }>
  certifications: Array<{
    name: string
    certificate_url: string
    verification_url?: string
    authority?: string
  }>
  team_members: Array<{
    name: string
    designation: string
    image: string
  }>
}

interface WebsiteConfig {
  seo_enabled: boolean
  email_config: {
    smtp_user: string
    smtp_password: string
  }
  design_preferences: {
    website_type: string
    theme: string
    primary_color: string
    secondary_color: string
    style: string
  }
  pages: {
    home: {
      enabled_sections: {
        hero_carousel: boolean
        company_intro: boolean
        how_we_work: boolean
        stats_counter: boolean
        product_categories: boolean
        featured_products: boolean
        why_choose_us: boolean
        global_presence: boolean
        testimonials: boolean
        cta_banner: boolean
      }
    }
    about: {
      enabled_sections: {
        overview: boolean
        mission_vision: boolean
        milestones: boolean
        memberships: boolean
        sustainability: boolean
        team: boolean
      }
    }
    products: {
      enabled_sections: {
        category_filter: boolean
        overview: boolean
        products: boolean
        why_to_buy: boolean
      }
    }
    certifications: {
      enabled_sections: {
        overview: boolean
        certificates: boolean
        memberships: boolean
        quality_policy: boolean
      }
    }
    contact: {
      enabled_sections: {
        overview: boolean
        contact_form: boolean
        contact_info: boolean
        office_hours: boolean
        faq: boolean
      }
    }
  }
  language: string
  currency: string
}

export default function BuilderPage() {
  const router = useRouter()
  const { isAuthenticated, loading, user, logout } = useAuth()
  const [currentStep, setCurrentStep] = useState(() => {
    // Load saved step from localStorage on initial render
    if (typeof window !== 'undefined') {
      const savedStep = localStorage.getItem('builder_current_step')
      return savedStep ? parseInt(savedStep, 10) : 0
    }
    return 0
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isDesktop, setIsDesktop] = useState(true)
  const [checkingActiveJob, setCheckingActiveJob] = useState(true)
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>({
    company_name: '',
    company_type: '',
    logo_url: '',
    year_established: '',
    iec_code: '',
    gst_number: '',
    udyam_adhar: '',
    description: '',
    contact: {
      email: '',
      phone: '',
      whatsapp: '',
      address: '',
      social_media: {
        linkedin: '',
        facebook: '',
        instagram: '',
        twitter: '',
        youtube: ''
      }
    },
    categories: [],
    export_countries: [],
    certifications: [],
    team_members: [{
      name: '',
      designation: '',
      image: ''
    }]
  })

  const [websiteConfig, setWebsiteConfig] = useState<WebsiteConfig>({
    seo_enabled: true,
    email_config: {
      smtp_user: '',
      smtp_password: ''
    },
    design_preferences: {
      website_type: '',
      theme: '',
      primary_color: '',
      secondary_color: '',
      style: ''
    },
    pages: {
      home: {
        enabled_sections: {
          hero_carousel: true,
          company_intro: true,
          how_we_work: true,
          stats_counter: true,
          product_categories: true,
          featured_products: true,
          why_choose_us: true,
          global_presence: true,
          testimonials: true,
          cta_banner: true
        }
      },
      about: {
        enabled_sections: {
          overview: true,
          mission_vision: true,
          milestones: true,
          memberships: true,
          sustainability: true,
          team: false
        }
      },
      products: {
        enabled_sections: {
          category_filter: true,
          overview: true,
          products: true,
          why_to_buy: true
        }
      },
      certifications: {
        enabled_sections: {
          overview: true,
          certificates: true,
          memberships: false,
          quality_policy: false
        }
      },
      contact: {
        enabled_sections: {
          overview: true,
          contact_form: true,
          contact_info: true,
          office_hours: true,
          faq: true
        }
      }
    },
    language: 'en',
    currency: 'USD'
  })

  // Protect this route - require authentication
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      toast.error('Please login to access the website builder')
      router.push('/login')
    }
  }, [isAuthenticated, loading, router])

  // Check for active job on mount - CRITICAL: Prevents duplicate job creation
  useEffect(() => {
    const checkActiveJob = async () => {
      // Wait for auth to be ready
      if (!isAuthenticated || loading || !user) {
        setCheckingActiveJob(false)
        return
      }

      console.log('🔍 Checking for active job on builder page mount...')

      // FIRST: Check localStorage (but verify with backend before redirecting)
      const localJob = jobStateManager.getActiveJob(user?.uid)
      if (localJob && localJob.jobId) {
        console.log('📦 Found job in localStorage:', localJob.jobId, '- verifying with backend...')

        // Verify this job still exists on backend before redirecting
        try {
          const jobData = await apiClient.getJob(localJob.jobId)
          if (jobData && (jobData.status === 'queued' || jobData.status === 'processing')) {
            console.log('✓ Job verified and still active:', localJob.jobId)
            toast.info('Resuming your job in progress...')
            router.push(`/jobs/${localJob.jobId}/progress`)
            return
          } else {
            console.log('⚠️ Job found but not active anymore - clearing localStorage')
            jobStateManager.clearActiveJob()
          }
        } catch (err: any) {
          console.log('⚠️ Job in localStorage not found on backend - clearing stale data')
          jobStateManager.clearActiveJob()
        }
      }

      // SECOND: Check backend if no localStorage job (handles case where user logged out and back in)
      try {
        const response = await apiClient.getActiveJob()
        if (response.active_job) {
          // Update localStorage with user ID for isolation
          console.log('✓ Found active job on backend:', response.active_job.job_id)
          jobStateManager.setActiveJob(response.active_job.job_id, response.active_job.status, user?.uid)
          toast.info('Resuming your job in progress...')
          router.push(`/jobs/${response.active_job.job_id}/progress`)
          return // Keep showing loading state until redirect happens
        }
        console.log('✓ No active job found - user can create new one')
      } catch (error: any) {
        // Silently fail - user can proceed to builder
        console.warn('⚠️ Could not check for active job:', error?.detail || error?.message || 'Unknown error')
      } finally {
        setCheckingActiveJob(false)
      }
    }

    checkActiveJob()
  }, [isAuthenticated, loading, router, user])

  // Load form data from Firebase on mount (when user is authenticated)
  useEffect(() => {
    const loadData = async () => {
      if (!isAuthenticated || !user?.uid) return

      try {
        // Load business info first
        const businessInfoRes = await apiClient.getBusinessInfo()
        let loadedBusinessInfo: Partial<BusinessInfo> = {
          company_name: '',
          company_type: '',
          logo_url: '',
          year_established: '',
          iec_code: '',
          gst_number: '',
          udyam_adhar: '',
          description: '',
          contact: { email: '', phone: '', whatsapp: '', address: '', social_media: { linkedin: '', facebook: '', instagram: '', twitter: '', youtube: '' } },
          categories: [],
          export_countries: [],
          certifications: [],
          team_members: []
        }

        if (businessInfoRes.has_data && businessInfoRes.data) {
          console.log('📥 Loaded business info from Firebase')
          loadedBusinessInfo = { ...loadedBusinessInfo, ...businessInfoRes.data }
        }

        // Load product data and merge with business info
        const productsRes = await apiClient.getCategoryAndProduct()
        if (productsRes.has_data && productsRes.data?.categories) {
          console.log('📥 Loaded categories from Firebase')
          loadedBusinessInfo.categories = productsRes.data.categories || []
        }

        // Set the merged business info
        setBusinessInfo(loadedBusinessInfo as BusinessInfo)

        // Load website config separately
        const configRes = await apiClient.getWebsiteConfig()
        if (configRes.has_data && configRes.data) {
          console.log('📥 Loaded website config from Firebase')
          setWebsiteConfig(configRes.data)
        }
      } catch (error) {
        console.warn('Failed to load data from Firebase:', error)
        // Fallback: try loading from localStorage for backward compatibility
        const chatData = loadChatDataFromStorage()
        if (chatData && Object.keys(chatData).length > 0) {
          console.log('📥 Loading saved form data from localStorage (fallback)...')
          const mergedData = syncChatToForm(chatData)
          setBusinessInfo(mergedData as BusinessInfo)
        }
      }
    }

    loadData()
  }, [isAuthenticated, user?.uid])

  // Note: Form data is saved explicitly when user clicks "Next" button
  // No auto-save needed - saves on explicit user action

  // Save current step to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('builder_current_step', currentStep.toString())
    }
  }, [currentStep])

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024)
    }
    checkDesktop()
    window.addEventListener('resize', checkDesktop)
    return () => window.removeEventListener('resize', checkDesktop)
  }, [])

  // Click outside handler for profile dropdown
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

  // Show loading state while checking authentication or active job
  if (loading || checkingActiveJob) {
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

  // Don't render the page if not authenticated (redirect is happening)
  if (!isAuthenticated) {
    return null
  }

  const steps = [
    {
      id: 'business-info',
      title: 'Business Information',
      description: 'Company details and basic information',
      icon: Building2
    },
    {
      id: 'products',
      title: 'Products & Services',
      description: 'Product categories and detailed listings',
      icon: Package
    },
    {
      id: 'configuration',
      title: 'Website Configuration',
      description: 'Customize sections and appearance',
      icon: Settings
    },
    {
      id: 'preview',
      title: 'Preview & Generate',
      description: 'Review and create your website',
      icon: Sparkles
    }
  ]

  const handleLogout = async () => {
    try {
      await logout()
      jobStateManager.clearActiveJob()
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const handleSwitchToChat = () => {
    // Don't transfer form data to chat - chat needs fresh start with welcome message
    // Form data is already auto-saved, so user can come back to form anytime
    console.log('🔄 Switching to chat mode (fresh start)...')
    
    // Clear any existing chat session so user gets fresh welcome message
    sessionStorage.removeItem('current_session_id')
    sessionStorage.removeItem('session_timestamp')
    
    toast.success('Switching to AI Chat...', {
      description: 'Starting a guided conversation'
    })
    // Navigate directly to chat page
    router.push('/builder/chat')
  }

  const addCategory = () => {
    setBusinessInfo(prev => ({
      ...prev,
      categories: [...prev.categories, {
        name: '',
        description: '',
        products: []
      }]
    }))
  }

  const removeCategory = (index: number) => {
    setBusinessInfo(prev => ({
      ...prev,
      categories: prev.categories.filter((_, i) => i !== index)
    }))
  }
  const addCertification = () => {
    setBusinessInfo(prev => ({
      ...prev,
      certifications: [...prev.certifications, {
        name: '',
        certificate_url: '',
        verification_url: '',
        authority: ''
      }]
    }))
  }

  const saveToCloud = async () => {
    try {
      // Validate required fields
      if (!businessInfo.company_name || !businessInfo.company_type) {
        toast.error('Please complete Company Name and Business Type before saving.')
        return
      }

      toast.loading('Saving to cloud...', { id: 'save-cloud' })

      // Save complete project data
      const projectData = {
        business_info: businessInfo,
        website_config: websiteConfig,
        project_name: businessInfo.company_name,
        project_type: 'ai-web-builder'
      }

      const projectId = await saveCompleteProject(projectData)

      toast.success(`✓ Project saved to cloud! ID: ${projectId}`, { id: 'save-cloud' })
      
      return projectId
    } catch (error) {
      console.error('Save error:', error)
      toast.error('Failed to save to cloud. Please try again.', { id: 'save-cloud' })
    }
  }

  const generateWebsite = async () => {
    setIsGenerating(true)

    try {
      // Create job using API client
      const response = await apiClient.createJob({
        business_info: businessInfo,
        website_config: websiteConfig
      })

      if (response.success) {
        // Store active job in localStorage with user ID for isolation
        jobStateManager.setActiveJob(response.job_id, response.status, user?.uid)

        toast.success(response.message || 'Website generation started!')

        // Redirect to progress page
        router.push(`/jobs/${response.job_id}/progress`)
      } else {
        toast.error('Failed to start website generation. Please try again.')
      }
    } catch (error: any) {
      // Handle 409 Conflict - user already has an active job
      if (error.status === 409) {
        console.warn('User already has an active job')
        toast.error('You already have a job in progress')

        // If the error includes the active job ID, redirect to its progress page
        if (error.detail?.active_job_id) {
          router.push(`/jobs/${error.detail.active_job_id}/progress`)
        }
      } else {
        console.error('Generation error:', error?.detail || error?.message || 'Unknown error')
        toast.error(error.detail || 'An error occurred while generating your website.')
      }
    } finally {
      setIsGenerating(false)
    }
  }

  const nextStep = async () => {
    if (currentStep < steps.length - 1) {
      // Save to localStorage
      saveChatDataToStorage(businessInfo)

      // Save to Firebase based on current step
      try {
        if (currentStep === 0 && (businessInfo.company_name || businessInfo.company_type)) {
          // Step 0: Save Business Info
          await apiClient.saveBusinessInfo(businessInfo)
          console.log('✅ Business info saved')
        } else if (currentStep === 1) {
          // Step 1: Save Category and Product
          await apiClient.saveCategoryAndProduct({
            categories: businessInfo.categories
          })
          console.log('✅ Products & services saved')
        } else if (currentStep === 2) {
          // Step 2: Save Website Config
          await apiClient.saveWebsiteConfig(websiteConfig)
          console.log('✅ Website configuration saved')
        }
      } catch (error) {
        console.error('Failed to save:', error)
        // Still allow user to proceed even if save fails
      }

      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = async () => {
    if (currentStep > 0) {
      const previousStep = currentStep - 1

      // Load data for previous step from Firebase
      try {
        if (previousStep === 0) {
          // Loading from Step 0: Business Info
          const response = await apiClient.getBusinessInfo()
          if (response.has_data && response.data) {
            console.log('📥 Loading business info from Firebase...')
            setBusinessInfo(response.data as BusinessInfo)
          }
        } else if (previousStep === 1) {
          // Loading from Step 1: Category and Product
          const response = await apiClient.getCategoryAndProduct()
          if (response.has_data && response.data) {
            console.log('📥 Loading category and product from Firebase...')
            setBusinessInfo(prev => ({
              ...prev,
              categories: response.data.categories
            }))
          }
        } else if (previousStep === 2) {
          // Loading from Step 2: Website Config
          const response = await apiClient.getWebsiteConfig()
          if (response.has_data && response.data) {
            console.log('📥 Loading website config from Firebase...')
            setWebsiteConfig(response.data)
          }
        }
      } catch (error) {
        console.warn('Failed to load previous step data:', error)
        // Continue anyway - data in state memory is used as fallback
      }

      // Navigate to previous step
      setCurrentStep(previousStep)
      console.log('⬅️ Navigated to previous step')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Enhanced Navigation */}
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
                <Sparkles className="w-4 h-4 text-teal-500" />
                <span>AI-Powered Builder</span>
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
                      {/* User Info Header */}
                      <div className="p-3 border-b border-gray-100 bg-gradient-to-br from-gray-50 to-white">
                        <p className="text-sm font-medium text-gray-900 truncate">{user?.email}</p>
                        {user?.is_admin && (
                          <p className="text-xs text-teal-600 mt-0.5 flex items-center gap-1">
                            <Shield className="w-3 h-3" />
                            Administrator
                          </p>
                        )}
                      </div>

                      {/* Menu Items */}
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

      {/* Toggle Button - Outside Sidebar */}
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

      {/* Fixed Sidebar */}
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
              steps={steps}
              onStepClick={setCurrentStep}
              isCollapsed={isSidebarCollapsed}
            />
          </div>

          {/* Switch to Chat Button */}
          {!isSidebarCollapsed && (
            <div className="px-4 pb-4 pt-6 mt-6 border-t border-gray-200/50">
              <Button
                onClick={handleSwitchToChat}
                variant="outline"
                className="w-full h-12 items-center justify-center gap-2 border-2 border-teal-400 hover:bg-teal-50 text-teal-700 font-medium transition-all duration-200"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Switch to Chat</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </motion.aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              className="fixed left-0 top-0 h-full w-80 bg-gradient-to-br from-white via-teal-50/20 to-slate-50/30 backdrop-blur-sm shadow-2xl z-50 overflow-y-auto lg:hidden flex flex-col scrollbar-thin scrollbar-thumb-teal-400 scrollbar-track-transparent hover:scrollbar-thumb-teal-500"
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
              <div className="flex-1 p-6 space-y-4 overflow-y-auto scrollbar-thin scrollbar-thumb-teal-400 scrollbar-track-transparent hover:scrollbar-thumb-teal-500">
                {/* Close Button */}
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-800">Navigation</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="hover:bg-red-50 hover:text-red-600"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                {/* Progress Circle */}
                <div className="flex flex-col items-center py-6 bg-gradient-to-br from-teal-500/10 to-slate-500/10 rounded-2xl border border-teal-200/50 shadow-lg">
                  <div className="relative w-24 h-24 mb-4">
                    <svg className="transform -rotate-90 w-24 h-24">
                      <circle
                        cx="48"
                        cy="48"
                        r="44"
                        stroke="#e5e7eb"
                        strokeWidth="6"
                        fill="none"
                      />
                      <motion.circle
                        cx="48"
                        cy="48"
                        r="44"
                        stroke="url(#mobile-gradient)"
                        strokeWidth="6"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 44}`}
                        initial={{ strokeDashoffset: 2 * Math.PI * 44 }}
                        animate={{
                          strokeDashoffset: 2 * Math.PI * 44 * (1 - (currentStep + 1) / steps.length)
                        }}
                        transition={{ duration: 1, ease: "easeInOut" }}
                      />
                      <defs>
                        <linearGradient id="mobile-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#14b8a6" />
                          <stop offset="100%" stopColor="#64748b" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-teal-600">
                          {Math.round(((currentStep + 1) / steps.length) * 100)}%
                        </div>
                        <div className="text-xs text-gray-500">Progress</div>
                      </div>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-800">Building Your Website</h3>
                  <p className="text-sm text-gray-600 text-center">Step {currentStep + 1} of {steps.length}</p>
                </div>

                {/* Step Navigation */}
                <div className="space-y-3">
                  {steps.map((step, index) => {
                    const isActive = index === currentStep
                    const isCompleted = index < currentStep
                    const StepIcon = step.icon

                    return (
                      <div
                        key={step.id}
                        onClick={() => {
                          setCurrentStep(index)
                          setIsMobileMenuOpen(false)
                        }}
                        className="relative cursor-pointer group"
                      >
                        <div className={`p-4 rounded-xl transition-all duration-300 ${
                          isActive
                            ? 'bg-gradient-to-r from-teal-500 to-slate-600 text-white shadow-xl scale-105'
                            : isCompleted
                              ? 'bg-gradient-to-r from-teal-50 to-slate-50 hover:from-teal-100 hover:to-slate-100 border-2 border-teal-300 shadow-md'
                              : 'bg-white/50 border-2 border-gray-200 hover:border-gray-300'
                        }`}>
                          <div className="flex items-start space-x-4">
                            {/* Step Number/Icon */}
                            <div
                              className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
                                isActive
                                  ? 'bg-white/20 backdrop-blur-sm'
                                  : isCompleted
                                    ? 'bg-gradient-to-br from-teal-500 to-slate-600'
                                    : 'bg-gray-100'
                              }`}
                            >
                              {isCompleted ? (
                                <Check className="w-6 h-6 text-white" />
                              ) : (
                                <StepIcon className={`w-6 h-6 ${
                                  isActive ? 'text-white' : isCompleted ? 'text-white' : 'text-gray-500'
                                }`} />
                              )}
                            </div>

                            {/* Step Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <span className={`text-xs font-semibold uppercase tracking-wide ${
                                  isActive ? 'text-teal-100' : 'text-gray-500'
                                }`}>
                                  Step {index + 1}
                                </span>
                                {isCompleted && (
                                  <Badge className="bg-teal-500 text-white text-xs px-2 py-0.5">
                                    <Check className="w-3 h-3 mr-1" />
                                    Done
                                  </Badge>
                                )}
                                {isActive && (
                                  <Badge className="bg-white/20 text-white text-xs px-2 py-0.5 backdrop-blur-sm">
                                    <Zap className="w-3 h-3 mr-1" />
                                    Active
                                  </Badge>
                                )}
                              </div>
                              <h4 className={`font-bold text-base mb-1 ${
                                isActive ? 'text-white' : isCompleted ? 'text-gray-900' : 'text-gray-700'
                              }`}>
                                {step.title}
                              </h4>
                              <p className={`text-sm ${
                                isActive ? 'text-teal-100' : 'text-gray-600'
                              }`}>
                                {step.description}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Vertical Connection Line */}
                        {index < steps.length - 1 && (
                          <div className="absolute left-9 top-full w-0.5 h-3 bg-gradient-to-b from-teal-300 to-transparent" />
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Switch to Chat Button */}
              <div className="p-4 pt-6 border-t border-gray-200/50 mt-6">
                <Button
                  onClick={handleSwitchToChat}
                  variant="outline"
                  className="w-full h-12 items-center justify-center gap-2 border-2 border-teal-400 hover:bg-teal-50 text-teal-700 font-medium transition-all duration-200"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Switch to Chat</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Form Content */}
      <motion.div
        className="pt-24 px-6 pb-16 bg-gradient-to-b from-transparent to-gray-50/30"
        animate={{
          marginLeft: isDesktop ? (isSidebarCollapsed ? '5rem' : '20rem') : '0'
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              {currentStep === 0 && (
                <Card className="border-0 shadow-2xl bg-gradient-to-br from-white to-gray-50/50 overflow-hidden">
                    <div className="bg-gradient-to-r from-teal-500 to-slate-500 h-2"></div>
                    <CardHeader className="bg-gradient-to-r from-teal-50/50 to-slate-50/50 border-b border-gray-100">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-4">
                          <motion.div
                            className="w-12 h-12 bg-gradient-to-br from-teal-500 to-slate-600 rounded-2xl flex items-center justify-center shadow-lg"
                            whileHover={{ scale: 1.05, rotate: 5 }}
                          >
                            <Building2 className="w-7 h-7 text-white" />
                          </motion.div>
                          <div>
                            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-teal-700 to-slate-700 bg-clip-text text-transparent">
                              Business Information
                            </CardTitle>
                            <CardDescription className="text-base text-gray-600 mt-1">
                              Tell us about your company and contact details
                            </CardDescription>
                          </div>
                        </div>
                        <motion.div 
                          className="ml-auto hidden md:block"
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <Badge className="bg-gradient-to-r from-teal-500 to-slate-500 text-white px-4 py-2">
                            <Building2 className="w-4 h-4 mr-2" />
                            Step 1 of 4
                          </Badge>
                        </motion.div>
                      </motion.div>
                    </CardHeader>
                  <CardContent className="p-8">
                    <Accordion type="single" defaultValue="company-details" collapsible className="space-y-6">
                      {/* Section 1: Company Details */}
                      <AccordionItem
                        value="company-details"
                        className="border-2 border-teal-200/50 rounded-2xl bg-gradient-to-br from-white to-teal-50/30 shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        <AccordionTrigger className="hover:no-underline px-6 pt-6 pb-4">
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-4">
                              <motion.div
                                className="w-12 h-12 bg-gradient-to-br from-teal-500 to-slate-600 rounded-2xl flex items-center justify-center shadow-lg"
                                whileHover={{ scale: 1.05, rotate: 5 }}
                              >
                                <Building2 className="w-6 h-6 text-white" />
                              </motion.div>
                              <div className="text-left">
                                <h3 className="text-xl font-bold bg-gradient-to-r from-teal-700 to-slate-700 bg-clip-text text-transparent">
                                  Company Details
                                </h3>
                                <p className="text-sm text-gray-600 font-normal">Basic company information and description</p>
                              </div>
                            </div>
                            <Badge className="bg-gradient-to-r from-teal-500 to-slate-500 text-white px-3 py-1">
                              <Check className="w-3 h-3 mr-1" />
                              Required
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-6 pb-6 pt-2">
                          <motion.div 
                      className="relative group"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 via-emerald-500/10 to-blue-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                      <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 p-6">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-slate-600 rounded-lg flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-white" />
                          </div>
                          <h3 className="font-semibold text-lg text-gray-900">Company Details</h3>
                        </div>
                        
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <motion.div 
                              className="space-y-2"
                              whileHover={{ scale: 1.02 }}
                              transition={{ type: "spring", stiffness: 300 }}
                            >
                              <Label htmlFor="company_name" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <span className="w-2 h-2 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full"></span>
                                Company Name *
                                <span className="text-red-400 text-xs">★</span>
                              </Label>
                              <Input
                                id="company_name"
                                value={businessInfo.company_name}
                                onChange={(e) => setBusinessInfo(prev => ({ ...prev, company_name: e.target.value }))}
                                placeholder="e.g., Nirmita International"
                                className="h-12 border-2 border-teal-200/50 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 bg-white/90 backdrop-blur-sm transition-all duration-300 hover:shadow-md"
                              />
                            </motion.div>
                            <motion.div 
                              className="space-y-2"
                              whileHover={{ scale: 1.02 }}
                              transition={{ type: "spring", stiffness: 300 }}
                            >
                              <Label htmlFor="company_type" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <span className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full"></span>
                                Company Type *
                                <span className="text-red-400 text-xs">★</span>
                              </Label>
                              <Select
                                value={businessInfo.company_type}
                                onValueChange={(value) => setBusinessInfo(prev => ({ ...prev, company_type: value }))}
                              >
                                <SelectTrigger className="!h-12 !min-h-12 w-full border-2 border-teal-200/50 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 bg-white/90 backdrop-blur-sm transition-all duration-300 hover:shadow-md px-3 py-1 flex items-center">
                                  <SelectValue placeholder="Select your business type" />
                                </SelectTrigger>
                                <SelectContent className="bg-white/95 backdrop-blur-sm border border-white/50 shadow-xl max-w-[400px] w-full">
                                  <SelectItem value="Goods Exporter - Agriculture" className="text-wrap">
                                    <div className="flex items-center gap-2">
                                      <Wheat className="h-4 w-4 z-10" style={{ color: '#10B981' }} />
                                      <span className="block truncate">Goods Exporter - Agriculture</span>
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="Goods Exporter - Organic and Natural Products" className="text-wrap">
                                    <div className="flex items-center gap-2">
                                      <FaSeedling className="h-4 w-4 z-10" style={{ color: '#22C55E' }} />
                                      <span className="block truncate">Goods Exporter - Organic and Natural Products</span>
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="Goods Exporter - Food and Spices" className="text-wrap">
                                    <div className="flex items-center gap-2">
                                      <Package className="h-4 w-4" style={{ color: '#F59E0B' }} />
                                      <span className="block truncate">Goods Exporter - Food and Spices</span>
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="Goods Exporter - Textiles" className="text-wrap">
                                    <div className="flex items-center gap-2">
                                      <FaTshirt className="h-4 w-4 z-10" style={{ color: '#3B82F6' }} />
                                      <span className="block truncate">Goods Exporter - Textiles</span>
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="Goods Exporter - Jewelry" className="text-wrap">
                                    <div className="flex items-center gap-2">
                                      <FaGem className="h-4 w-4 z-10" style={{ color: '#8B5CF6' }} />
                                      <span className="block truncate">Goods Exporter - Jewelry</span>
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="Goods Exporter - Chemicals" className="text-wrap">
                                    <div className="flex items-center gap-2">
                                      <Factory className="h-4 w-4" style={{ color: '#6B7280' }} />
                                      <span className="block truncate">Goods Exporter - Chemicals</span>
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="Goods Exporter - Electronics" className="text-wrap">
                                    <div className="flex items-center gap-2">
                                      <FaMobileAlt className="h-4 w-4 z-10" style={{ color: '#2563EB' }} />
                                      <span className="block truncate">Goods Exporter - Electronics</span>
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="Manufacturing" className="text-wrap">
                                    <div className="flex items-center gap-2">
                                      <FaIndustry className="h-4 w-4 z-10" style={{ color: '#374151' }} />
                                      <span className="block truncate">Manufacturing</span>
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="Trading" className="text-wrap">
                                    <div className="flex items-center gap-2">
                                      <FaHandshake className="h-4 w-4 z-10" style={{ color: '#0D9488' }} />
                                      <span className="block truncate">Trading</span>
                                    </div>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </motion.div>
                            <motion.div 
                              className="space-y-2"
                              whileHover={{ scale: 1.02 }}
                              transition={{ type: "spring", stiffness: 300 }}
                            >
                              <Label htmlFor="year_established" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <span className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></span>
                                Year Established
                              </Label>
                              <Combobox
                                value={businessInfo.year_established}
                                onValueChange={(value) => setBusinessInfo(prev => ({ ...prev, year_established: value }))}
                                options={establishmentYears}
                                placeholder="Select year..."
                                searchPlaceholder="Search year..."
                                className="h-12 border-2 border-teal-200/50 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 bg-white/90 backdrop-blur-sm transition-all duration-300 hover:shadow-md"
                              />
                            </motion.div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <motion.div 
                              className="space-y-2"
                              whileHover={{ scale: 1.02 }}
                              transition={{ type: "spring", stiffness: 300 }}
                            >
                              <Label htmlFor="iec_code" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <span className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></span>
                                IEC Code
                              </Label>
                              <Input
                                id="iec_code"
                                value={businessInfo.iec_code}
                                onChange={(e) => setBusinessInfo(prev => ({ ...prev, iec_code: e.target.value }))}
                                placeholder="ABCD1234E"
                                className="h-12 border-2 border-teal-200/50 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 bg-white/90 backdrop-blur-sm transition-all duration-300 hover:shadow-md"
                              />
                            </motion.div>
                            <motion.div 
                              className="space-y-2"
                              whileHover={{ scale: 1.02 }}
                              transition={{ type: "spring", stiffness: 300 }}
                            >
                              <ImageUpload
                                value={businessInfo.logo_url}
                                onValueChange={(value) => setBusinessInfo(prev => ({ ...prev, logo_url: value }))}
                                label="Company Logo"
                                placeholder="Enter logo URL or upload logo"
                                type="logo"
                                icon={<span className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></span>}
                                className="bg-white/90 backdrop-blur-sm transition-all duration-300 hover:shadow-md"
                              />
                            </motion.div>
                          </div>
                          
                          <motion.div 
                            className="space-y-2"
                            whileHover={{ scale: 1.01 }}
                            transition={{ type: "spring", stiffness: 300 }}
                          >
                            <Label htmlFor="description" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                              <span className="w-2 h-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></span>
                              Company Description *
                              <span className="text-red-400 text-xs">★</span>
                            </Label>
                            <div className="relative">
                              <Textarea
                                id="description"
                                value={businessInfo.description}
                                onChange={(e) => setBusinessInfo(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Describe your company, products, and what makes you unique. This will help us create compelling content for your website..."
                                rows={4}
                                className="border-2 border-teal-200/50 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 bg-white/90 backdrop-blur-sm transition-all duration-300 hover:shadow-md resize-none pr-16"
                              />
                              <AIDescriptionAssistant
                                fieldType="company"
                                currentValue={businessInfo.description}
                                onAccept={(newValue) => setBusinessInfo(prev => ({
                                  ...prev,
                                  description: newValue
                                }))}
                                context={{
                                  company_name: businessInfo.company_name,
                                  company_type: businessInfo.company_type,
                                  categories: (businessInfo.categories || []).map(c => c.name).slice(0, 5),
                                  certifications: (businessInfo.certifications || []).map(c => c.name).slice(0, 3)
                                }}
                              />
                            </div>
                          </motion.div>
                        </div>
                      </div>
                    </motion.div>
                        </AccordionContent>
                      </AccordionItem>

                      {/* Section 2: Business Registration Details */}
                      <AccordionItem
                        value="registration-details"
                        className="border-2 border-teal-200/50 rounded-2xl bg-gradient-to-br from-white to-teal-50/30 shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        <AccordionTrigger className="hover:no-underline px-6 pt-6 pb-4">
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-4">
                              <motion.div
                                className="w-12 h-12 bg-gradient-to-br from-teal-500 to-slate-600 rounded-2xl flex items-center justify-center shadow-lg"
                                whileHover={{ scale: 1.05, rotate: 5 }}
                              >
                                <Award className="w-6 h-6 text-white" />
                              </motion.div>
                              <div className="text-left">
                                <h3 className="text-xl font-bold bg-gradient-to-r from-teal-700 to-slate-700 bg-clip-text text-transparent">
                                  Business Registration
                                </h3>
                                <p className="text-sm text-gray-600 font-normal">GST and MSME registration details</p>
                              </div>
                            </div>
                            <Badge className="bg-gradient-to-r from-teal-500 to-slate-500 text-white px-3 py-1">
                              <Award className="w-3 h-3 mr-1" />
                              Optional
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-6 pb-6 pt-2">
                          <motion.div
                            className="relative group"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 via-emerald-500/10 to-red-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                            <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 p-6">
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <motion.div 
                            className="space-y-2"
                            whileHover={{ scale: 1.02 }}
                            transition={{ type: "spring", stiffness: 300 }}
                          >
                            <Label htmlFor="gst_number" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                              <span className="w-2 h-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"></span>
                              GST Number <span className="text-xs text-gray-500">(Tax ID)</span>
                            </Label>
                            <Input
                              id="gst_number"
                              value={businessInfo.gst_number}
                              onChange={(e) => setBusinessInfo(prev => ({ ...prev, gst_number: e.target.value }))}
                              placeholder="e.g., 27KVMPS4973R1ZZ"
                              className="h-12 border-2 border-teal-200/50 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 bg-white/90 backdrop-blur-sm transition-all duration-300 hover:shadow-md"
                            />
                          </motion.div>
                          <motion.div 
                            className="space-y-2"
                            whileHover={{ scale: 1.02 }}
                            transition={{ type: "spring", stiffness: 300 }}
                          >
                            <Label htmlFor="udyam_adhar" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                              <span className="w-2 h-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></span>
                              Udyam Registration Number <span className="text-xs text-gray-500">(MSME)</span>
                            </Label>
                            <Input
                              id="udyam_adhar"
                              value={businessInfo.udyam_adhar}
                              onChange={(e) => setBusinessInfo(prev => ({ ...prev, udyam_adhar: e.target.value }))}
                              placeholder="e.g., UDYAM-MH-03-0070499"
                              className="h-12 border-2 border-teal-200/50 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 bg-white/90 backdrop-blur-sm transition-all duration-300 hover:shadow-md"
                            />
                          </motion.div>
                        </div>
                      </div>
                    </motion.div>
                        </AccordionContent>
                      </AccordionItem>

                      {/* Section 3: Contact Information */}
                      <AccordionItem
                        value="contact-information"
                        className="border-2 border-teal-200/50 rounded-2xl bg-gradient-to-br from-white to-teal-50/30 shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        <AccordionTrigger className="hover:no-underline px-6 pt-6 pb-4">
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-4">
                              <motion.div
                                className="w-12 h-12 bg-gradient-to-br from-teal-500 to-slate-600 rounded-2xl flex items-center justify-center shadow-lg"
                                whileHover={{ scale: 1.05, rotate: 5 }}
                              >
                                <Phone className="w-6 h-6 text-white" />
                              </motion.div>
                              <div className="text-left">
                                <h3 className="text-xl font-bold bg-gradient-to-r from-teal-700 to-slate-700 bg-clip-text text-transparent">
                                  Contact Information
                                </h3>
                                <p className="text-sm text-gray-600 font-normal">Email, phone, address and social media</p>
                              </div>
                            </div>
                            <Badge className="bg-gradient-to-r from-teal-500 to-slate-500 text-white px-3 py-1">
                              <Phone className="w-3 h-3 mr-1" />
                              Required
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-6 pb-6 pt-2">
                          <motion.div
                            className="relative group"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                            <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 p-6">
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <motion.div 
                            className="space-y-2"
                            whileHover={{ scale: 1.02 }}
                            transition={{ type: "spring", stiffness: 300 }}
                          >
                            <Label htmlFor="email" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                              <span className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"></span>
                              Email Address *
                              <span className="text-red-400 text-xs">★</span>
                            </Label>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 z-10 pointer-events-none" style={{ color: '#10B981' }} />
                              <Input
                                id="email"
                                type="email"
                                value={businessInfo.contact.email}
                                onChange={(e) => setBusinessInfo(prev => ({ 
                                  ...prev, 
                                  contact: { ...prev.contact, email: e.target.value }
                                }))}
                                placeholder="info@company.com"
                                className="h-12 pl-11 border-2 border-teal-200/50 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 bg-white/90 backdrop-blur-sm transition-all duration-300 hover:shadow-md"
                              />
                            </div>
                          </motion.div>
                          <motion.div 
                            className="space-y-2"
                            whileHover={{ scale: 1.02 }}
                            transition={{ type: "spring", stiffness: 300 }}
                          >
                            <Label htmlFor="phone" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                              <span className="w-2 h-2 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full"></span>
                              Phone Number *
                              <span className="text-red-400 text-xs">★</span>
                            </Label>
                            <div className="relative">
                              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 z-10 pointer-events-none" style={{ color: '#14B8A6' }} />
                              <Input
                                id="phone"
                                value={businessInfo.contact.phone}
                                onChange={(e) => setBusinessInfo(prev => ({ 
                                  ...prev, 
                                  contact: { ...prev.contact, phone: e.target.value }
                                }))}
                                placeholder="+91-9876543210"
                                className="h-12 pl-11 border-2 border-teal-200/50 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 bg-white/90 backdrop-blur-sm transition-all duration-300 hover:shadow-md"
                              />
                            </div>
                          </motion.div>
                        </div>

                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                          <motion.div 
                            className="space-y-2"
                            whileHover={{ scale: 1.02 }}
                            transition={{ type: "spring", stiffness: 300 }}
                          >
                            <Label htmlFor="whatsapp" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                              <span className="w-2 h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></span>
                              WhatsApp Number <span className="text-xs text-gray-500">(Customer Support)</span>
                            </Label>
                            <div className="relative">
                              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 z-10 pointer-events-none" style={{ color: '#10B981' }} />
                              <Input
                                id="whatsapp"
                                value={businessInfo.contact.whatsapp}
                                onChange={(e) => setBusinessInfo(prev => ({ 
                                  ...prev, 
                                  contact: { ...prev.contact, whatsapp: e.target.value }
                                }))}
                                placeholder="+91-9876543210"
                                className="h-12 pl-11 border-2 border-teal-200/50 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 bg-white/90 backdrop-blur-sm transition-all duration-300 hover:shadow-md"
                              />
                            </div>
                          </motion.div>
                          <motion.div 
                            className="space-y-2"
                            whileHover={{ scale: 1.02 }}
                            transition={{ type: "spring", stiffness: 300 }}
                          >
                            <Label htmlFor="address" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                              <span className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></span>
                              Business Address
                            </Label>
                            <div className="relative">
                              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 z-10 pointer-events-none" style={{ color: '#3B82F6' }} />
                              <Input
                                id="address"
                                value={businessInfo.contact.address}
                                onChange={(e) => setBusinessInfo(prev => ({ 
                                  ...prev, 
                                  contact: { ...prev.contact, address: e.target.value }
                                }))}
                                placeholder="City, State, Country"
                                className="h-12 pl-11 border-2 border-teal-200/50 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 bg-white/90 backdrop-blur-sm transition-all duration-300 hover:shadow-md"
                              />
                            </div>
                          </motion.div>
                        </div>

                        
                        <motion.div 
                          className="mt-6 p-6 bg-gradient-to-r from-slate-50/80 via-gray-50/80 to-zinc-50/80 backdrop-blur-sm rounded-xl border border-slate-200/50 shadow-inner"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.6 }}
                        >
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-slate-600 rounded-lg flex items-center justify-center">
                              <Globe className="w-5 h-5 text-white" />
                            </div>
                            <h4 className="font-semibold text-lg text-gray-900">Social Media</h4>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <motion.div whileHover={{ scale: 1.02 }}>
                              <div className="relative">
                                <FaLinkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 z-10 pointer-events-none" style={{ color: '#0077B5' }} />
                                <Input
                                  value={businessInfo.contact.social_media.linkedin}
                                  onChange={(e) => setBusinessInfo(prev => ({ 
                                    ...prev, 
                                    contact: { 
                                      ...prev.contact, 
                                      social_media: { ...prev.contact.social_media, linkedin: e.target.value }
                                    }
                                  }))}
                                  placeholder="LinkedIn Company URL"
                                  className="h-11 pl-10 border-2 border-teal-200/50 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 bg-white/90 backdrop-blur-sm transition-all duration-300 hover:shadow-md"
                                />
                              </div>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.02 }}>
                              <div className="relative">
                                <FaFacebook className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 z-10 pointer-events-none" style={{ color: '#1877F2' }} />
                                <Input
                                  value={businessInfo.contact.social_media.facebook}
                                  onChange={(e) => setBusinessInfo(prev => ({ 
                                    ...prev, 
                                    contact: { 
                                      ...prev.contact, 
                                      social_media: { ...prev.contact.social_media, facebook: e.target.value }
                                    }
                                  }))}
                                  placeholder="Facebook Page URL"
                                  className="h-11 pl-10 border-2 border-teal-200/50 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 bg-white/90 backdrop-blur-sm transition-all duration-300 hover:shadow-md"
                                />
                              </div>
                            </motion.div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                            <motion.div whileHover={{ scale: 1.02 }}>
                              <div className="relative">
                                <FaInstagram className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 z-10 pointer-events-none" style={{ color: '#E4405F' }} />
                                <Input
                                  value={businessInfo.contact.social_media.instagram}
                                  onChange={(e) => setBusinessInfo(prev => ({ 
                                    ...prev, 
                                    contact: { 
                                      ...prev.contact, 
                                      social_media: { ...prev.contact.social_media, instagram: e.target.value }
                                    }
                                  }))}
                                  placeholder="Instagram Profile URL"
                                  className="h-11 pl-10 border-2 border-teal-200/50 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 bg-white/90 backdrop-blur-sm transition-all duration-300 hover:shadow-md"
                                />
                              </div>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.02 }}>
                              <div className="relative">
                                <FaTwitter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 z-10 pointer-events-none" style={{ color: '#1DA1F2' }} />
                                <Input
                                  value={businessInfo.contact.social_media.twitter}
                                  onChange={(e) => setBusinessInfo(prev => ({ 
                                    ...prev, 
                                    contact: { 
                                      ...prev.contact, 
                                      social_media: { ...prev.contact.social_media, twitter: e.target.value }
                                    }
                                  }))}
                                  placeholder="Twitter Profile URL"
                                  className="h-11 pl-10 border-2 border-teal-200/50 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 bg-white/90 backdrop-blur-sm transition-all duration-300 hover:shadow-md"
                                />
                              </div>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.02 }}>
                              <div className="relative">
                                <FaYoutube className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 z-10 pointer-events-none" style={{ color: '#FF0000' }} />
                                <Input
                                  value={businessInfo.contact.social_media.youtube}
                                  onChange={(e) => setBusinessInfo(prev => ({ 
                                    ...prev, 
                                    contact: { 
                                      ...prev.contact, 
                                      social_media: { ...prev.contact.social_media, youtube: e.target.value }
                                    }
                                  }))}
                                  placeholder="YouTube Channel URL"
                                  className="h-11 pl-10 border-2 border-teal-200/50 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 bg-white/90 backdrop-blur-sm transition-all duration-300 hover:shadow-md"
                                />
                              </div>
                            </motion.div>
                          </div>
                        </motion.div>
                      </div>
                    </motion.div>
                        </AccordionContent>
                      </AccordionItem>

                      {/* Section 4: Team Members */}
                      <AccordionItem
                        value="team-members"
                        className="border-2 border-teal-200/50 rounded-2xl bg-gradient-to-br from-white to-teal-50/30 shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        <AccordionTrigger className="hover:no-underline px-6 pt-6 pb-4">
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-4">
                              <motion.div
                                className="w-12 h-12 bg-gradient-to-br from-teal-500 to-slate-600 rounded-2xl flex items-center justify-center shadow-lg"
                                whileHover={{ scale: 1.05, rotate: 5 }}
                              >
                                <Users className="w-6 h-6 text-white" />
                              </motion.div>
                              <div className="text-left">
                                <h3 className="text-xl font-bold bg-gradient-to-r from-teal-700 to-slate-700 bg-clip-text text-transparent">
                                  Team Members
                                </h3>
                                <p className="text-sm text-gray-600 font-normal">Add your key team members and leadership</p>
                              </div>
                            </div>
                            <Badge className="bg-gradient-to-r from-teal-500 to-slate-500 text-white px-3 py-1">
                              <Users className="w-3 h-3 mr-1" />
                              Optional
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-6 pb-6 pt-2">
                          <motion.div
                            className="relative group"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8 }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-indigo-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                            <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 p-6">
                              <div className="flex items-center justify-between mb-6">
                                <div></div>
                                <Button
                                  type="button"
                                  onClick={() => setBusinessInfo(prev => ({
                                    ...prev,
                                    team_members: [...prev.team_members, { name: "", designation: "", image: "" }]
                                  }))}
                                  size="sm"
                                  className="bg-gradient-to-r from-teal-500 to-slate-500 hover:from-teal-600 hover:to-slate-600 text-white"
                                >
                                  <Plus className="w-4 h-4 mr-2" />
                                  Add Team Member
                                </Button>
                              </div>
                        
                        {(businessInfo.team_members || []).map((member, index) => (
                          <div key={index} className="relative group">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                              <motion.div 
                                className="space-y-2"
                                whileHover={{ scale: 1.02 }}
                                transition={{ type: "spring", stiffness: 300 }}
                              >
                                <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                  <span className="w-2 h-2 bg-gradient-to-r from-teal-500 to-slate-500 rounded-full"></span>
                                  Member Name
                                </Label>
                                <Input
                                  value={member.name}
                                  onChange={(e) => {
                                    const newMembers = [...businessInfo.team_members]
                                    newMembers[index] = { ...newMembers[index], name: e.target.value }
                                    setBusinessInfo(prev => ({ ...prev, team_members: newMembers }))
                                  }}
                                  placeholder="John Doe"
                                  className="h-12 border-2 border-teal-200/50 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 bg-white/90 backdrop-blur-sm transition-all duration-300 hover:shadow-md"
                                />
                              </motion.div>
                              <motion.div 
                                className="space-y-2"
                                whileHover={{ scale: 1.02 }}
                                transition={{ type: "spring", stiffness: 300 }}
                              >
                                <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                  <span className="w-2 h-2 bg-gradient-to-r from-teal-500 to-slate-500 rounded-full"></span>
                                  Designation
                                </Label>
                                <Input
                                  value={member.designation}
                                  onChange={(e) => {
                                    const newMembers = [...businessInfo.team_members]
                                    newMembers[index] = { ...newMembers[index], designation: e.target.value }
                                    setBusinessInfo(prev => ({ ...prev, team_members: newMembers }))
                                  }}
                                  placeholder="CEO / Manager / Developer"
                                  className="h-12 border-2 border-teal-200/50 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 bg-white/90 backdrop-blur-sm transition-all duration-300 hover:shadow-md"
                                />
                              </motion.div>
                              <motion.div 
                                className="space-y-2"
                                whileHover={{ scale: 1.02 }}
                                transition={{ type: "spring", stiffness: 300 }}
                              >
                                <ImageUpload
                                  value={member.image}
                                  onValueChange={(value) => {
                                    const newMembers = [...businessInfo.team_members]
                                    newMembers[index] = { ...newMembers[index], image: value }
                                    setBusinessInfo(prev => ({ ...prev, team_members: newMembers }))
                                  }}
                                  label="Team Member Photo"
                                  placeholder="Enter photo URL or upload photo"
                                  type="team"
                                  icon={Users}
                                  iconColor="#06B6D4"
                                  className="bg-white/90 backdrop-blur-sm transition-all duration-300 hover:shadow-md"
                                />
                              </motion.div>
                            </div>
                            {businessInfo.team_members.length > 1 && (
                              <motion.div
                                onClick={() => {
                                  const newMembers = businessInfo.team_members.filter((_, i) => i !== index)
                                  setBusinessInfo(prev => ({ ...prev, team_members: newMembers }))
                                }}
                                className="absolute top-0 right-0 p-2 rounded-xl bg-red-100 text-red-600 hover:bg-red-200 hover:text-red-700 cursor-pointer transition-all duration-300 opacity-0 group-hover:opacity-100"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </motion.div>
                            )}
                          </div>
                        ))}
                              </div>
                            </motion.div>
                        </AccordionContent>
                      </AccordionItem>

                      {/* Section: Global Export Markets */}
                      <AccordionItem
                        value="export-markets"
                        className="border-2 border-teal-200/50 rounded-2xl bg-gradient-to-br from-white to-teal-50/30 shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        <AccordionTrigger className="hover:no-underline px-6 pt-6 pb-4">
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-4">
                              <motion.div
                                className="w-12 h-12 bg-gradient-to-br from-teal-500 to-slate-600  rounded-2xl flex items-center justify-center shadow-lg"
                                whileHover={{ scale: 1.05, rotate: -5 }}
                              >
                                <Globe className="w-6 h-6 text-white" />
                              </motion.div>
                              <div className="text-left">
                                <h3 className="text-xl font-bold bg-gradient-to-r from-teal-700 to-cyan-700 bg-clip-text text-transparent">
                                  Global Export Markets
                                </h3>
                                <p className="text-sm text-gray-600 font-normal">Select your target export destinations</p>
                              </div>
                            </div>
                            <Badge className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-3 py-1">
                              <Globe className="w-3 h-3 mr-1" />
                              {businessInfo.export_countries.length} Selected
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-6 pb-6 pt-2">
                          <CardContent className="space-y-4">
                            {/* Country Selection */}
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="space-y-3"
                            >
                              <MultiSelect
                                options={exportContriesWithFlags.map(c => ({ value: c.country_name, label: c.country_name }))}
                                selected={(businessInfo.export_countries || []).map(c => c.country_name)}
                                onSelectionChange={(selectedNames) => {
                                  const selectedCountries = exportContriesWithFlags.filter(c => selectedNames.includes(c.country_name)).map(c => ({
                                    country_name: c.country_name,
                                    flag_url: c.image_url
                                  }))
                                  setBusinessInfo(prev => ({ ...prev, export_countries: selectedCountries }))
                                }}
                                placeholder="Select target export countries..."
                                searchPlaceholder="Search countries..."
                                className="border-2 border-teal-200/50 focus-within:border-teal-500 bg-white transition-colors duration-200"
                                clearable={true}
                              />
                              <p className="text-xs text-gray-500 flex items-center gap-1">
                                <Target className="w-3 h-3" />
                                Choose multiple destinations for your export business
                              </p>
                            </motion.div>

                            {/* Selected Countries - Compact Display */}
                            {businessInfo.export_countries.length > 0 ? (
                              <motion.div
                                className="grid grid-cols-6 gap-4"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                              >
                                {(businessInfo.export_countries || []).map((country, index) => (
                                  <motion.div
                                    key={country.country_name}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.03 }}
                                    className="relative group flex flex-col items-center"
                                    whileHover={{ scale: 1.05 }}
                                  >
                                    <img
                                      src={country.flag_url}
                                      alt={country.country_name}
                                      title={country.country_name}
                                      className="w-16 h-12 object-cover rounded-lg shadow-md border-2 border-teal-200/50 hover:border-teal-400 transition-all duration-200 cursor-pointer"
                                    />
                                    <div className="text-xs font-medium text-gray-700 mt-2 text-center">
                                      {country.country_name}
                                    </div>
                                  </motion.div>
                                ))}
                              </motion.div>
                            ) : (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-6 border-2 border-dashed border-teal-200 rounded-xl bg-teal-50/30"
                              >
                                <Globe className="w-8 h-8 text-teal-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-600 mb-1">No markets selected yet</p>
                                <p className="text-xs text-gray-500">Select countries from the dropdown above</p>
                              </motion.div>
                            )}
                          </CardContent>
                        </AccordionContent>
                      </AccordionItem>

                      {/* Section: Certifications & Credentials */}
                      <AccordionItem
                        value="certifications"
                        className="border-2 border-teal-200/50 rounded-2xl bg-gradient-to-br from-white to-teal-50/30 shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        <AccordionTrigger className="hover:no-underline px-6 pt-6 pb-4">
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-4">
                              <motion.div
                                className="w-12 h-12 bg-gradient-to-br from-teal-500 to-slate-600 rounded-2xl flex items-center justify-center shadow-lg"
                                whileHover={{ scale: 1.05, rotate: 10 }}
                              >
                                <Award className="w-6 h-6 text-white" />
                              </motion.div>
                              <div className="text-left">
                                <h3 className="text-xl font-bold bg-gradient-to-r from-teal-700 to-slate-700 bg-clip-text text-transparent">
                                  Certifications & Credentials
                                </h3>
                                <p className="text-sm text-gray-600 font-normal">Select your quality standards and compliance certifications</p>
                              </div>
                            </div>
                            <Badge className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-3 py-1">
                              <Award className="w-3 h-3 mr-1" />
                              {businessInfo.certifications.length} Selected
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-6 pb-6 pt-2">
                          <CardContent className="space-y-4">
                            {/* Certification Selection */}
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="space-y-3"
                            >
                              <MultiSelect
                                options={predefinedCertifications.map(c => ({ value: c.name, label: c.name }))}
                                selected={(businessInfo.certifications || []).map(c => c.name)}
                                onSelectionChange={(selectedNames) => {
                                  const selectedCerts = predefinedCertifications.filter(c => selectedNames.includes(c.name)).map(c => ({
                                    name: c.name,
                                    certificate_url: c.certificate_url,
                                    verification_url: c.verification_url,
                                    authority: c.authority
                                  }))
                                  setBusinessInfo(prev => ({ ...prev, certifications: selectedCerts }))
                                }}
                                placeholder="Select quality certifications..."
                                searchPlaceholder="Search certifications..."
                                className="border-2 border-teal-200/50 focus-within:border-teal-500 bg-white transition-colors duration-200"
                                clearable={true}
                              />
                              <p className="text-xs text-gray-500 flex items-center gap-1">
                                <Award className="w-3 h-3" />
                                Choose certifications to showcase your standards and compliance
                              </p>
                            </motion.div>

                            {/* Selected Certifications - Full Card Display */}
                            {businessInfo.certifications.length > 0 ? (
                              <motion.div
                                className="grid grid-cols-2 gap-3"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                              >
                                {(businessInfo.certifications || []).map((cert, index) => (
                                  <motion.div
                                    key={cert.name}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-lg border-2 border-teal-200 p-4 hover:shadow-md transition-shadow duration-200"
                                  >
                                    <div className="flex items-start gap-3">
                                      {/* Certificate Image */}
                                      {cert.certificate_url && (
                                        <img
                                          src={cert.certificate_url}
                                          alt={cert.name}
                                          className="w-16 h-16 object-cover rounded-lg border border-teal-300 flex-shrink-0 shadow-sm"
                                        />
                                      )}

                                      <div className="flex-1 min-w-0">
                                        <div className="font-semibold text-gray-900">{cert.name}</div>
                                        <div className="text-xs text-gray-600 mt-1">
                                          <span className="font-medium">Authority:</span> {cert.authority || 'N/A'}
                                        </div>
                                        {cert.verification_url && (
                                          <a
                                            href={cert.verification_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-teal-600 hover:text-teal-700 font-medium mt-2 inline-block underline"
                                          >
                                            Verify Certificate →
                                          </a>
                                        )}
                                      </div>
                                    </div>
                                  </motion.div>
                                ))}
                              </motion.div>
                            ) : (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-6 border-2 border-dashed border-teal-200 rounded-xl bg-teal-50/30"
                              >
                                <Award className="w-8 h-8 text-teal-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-600 mb-1">No certifications selected yet</p>
                                <p className="text-xs text-gray-500">Select certifications from the dropdown above</p>
                              </motion.div>
                            )}
                          </CardContent>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </CardContent>
                </Card>
              )}

              {currentStep === 1 && (
                <ProductStep
                  categories={businessInfo.categories}
                  onUpdateCategories={(categories) => setBusinessInfo(prev => ({ ...prev, categories }))}
                />
              )}

              {currentStep === 2 && (
                <ConfigurationStep
                  config={websiteConfig}
                  onUpdateConfig={setWebsiteConfig}
                />
              )}

              {currentStep === 3 && (
                <Card className="border-0 shadow-2xl bg-gradient-to-br from-white to-slate-50/30 overflow-hidden">
                  <div className="bg-gradient-to-r from-teal-400 via-cyan-400 to-slate-500 h-2"></div>
                  <CardHeader className="bg-gradient-to-r from-teal-50/50 to-slate-50/50 border-b border-gray-100">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-4"
                    >
                      <motion.div
                        className="w-12 h-12 bg-gradient-to-br from-teal-500 via-cyan-500 to-slate-600 rounded-2xl flex items-center justify-center shadow-lg"
                        animate={{ 
                          rotate: [0, 5, -5, 0],
                          scale: [1, 1.05, 1]
                        }}
                        transition={{ 
                          duration: 2,
                          repeat: Infinity,
                          repeatType: "reverse" 
                        }}
                      >
                        <Sparkles className="w-7 h-7 text-white" />
                      </motion.div>
                      <div>
                        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-teal-700 via-cyan-700 to-slate-700 bg-clip-text text-transparent">
                          Preview & Generate
                        </CardTitle>
                        <CardDescription className="text-base text-gray-600 mt-1">
                          Review your configuration and generate your professional website
                        </CardDescription>
                      </div>
                      <motion.div 
                        className="ml-auto hidden md:block"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Badge className="bg-gradient-to-r from-teal-500 to-slate-500 text-white px-4 py-2">
                          <Rocket className="w-4 h-4 mr-2" />
                          Ready to Launch
                        </Badge>
                      </motion.div>
                    </motion.div>
                  </CardHeader>
                  <CardContent className="p-8">
                    <div className="space-y-8">
                      <motion.div 
                        className="bg-gradient-to-br from-teal-50/50 via-slate-50/50 to-gray-50/50 p-8 rounded-2xl border border-teal-100/50 shadow-inner"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-slate-600 rounded-lg flex items-center justify-center">
                            <Layout className="w-5 h-5 text-white" />
                          </div>
                          <h3 className="text-xl font-bold text-gray-900">Website Configuration Summary</h3>
                          <div className="ml-auto flex items-center gap-2">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            >
                              <Code className="w-5 h-5 text-teal-500" />
                            </motion.div>
                            <span className="text-sm text-gray-500">AI Optimized</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                          <motion.div 
                            className="bg-gradient-to-br from-teal-50 to-slate-100 p-6 rounded-2xl border border-teal-200/50 shadow-lg hover:shadow-xl transition-all duration-300"
                            whileHover={{ scale: 1.02, y: -2 }}
                          >
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-slate-600 rounded-lg flex items-center justify-center">
                                <Building2 className="w-5 h-5 text-white" />
                              </div>
                              <p className="text-sm font-semibold text-teal-700 uppercase tracking-wide">Company</p>
                            </div>
                            <p className="font-bold text-lg text-gray-900 mb-1">{businessInfo.company_name || 'Not specified'}</p>
                            <p className="text-sm text-teal-600 font-medium">{businessInfo.company_type || 'Type not specified'}</p>
                          </motion.div>
                          
                          <motion.div 
                            className="bg-gradient-to-br from-teal-50 to-slate-100 p-6 rounded-2xl border border-teal-200/50 shadow-lg hover:shadow-xl transition-all duration-300"
                            whileHover={{ scale: 1.02, y: -2 }}
                          >
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-slate-600 rounded-lg flex items-center justify-center">
                                <Package className="w-5 h-5 text-white" />
                              </div>
                              <p className="text-sm font-semibold text-teal-700 uppercase tracking-wide">Products</p>
                            </div>
                            <p className="font-bold text-lg text-gray-900 mb-1">{businessInfo.categories.length} Categories</p>
                            <p className="text-sm text-teal-600 font-medium">
                              {businessInfo.categories.reduce((total, cat) => total + cat.products.length, 0)} Products Total
                            </p>
                          </motion.div>
                          
                          <motion.div 
                            className="bg-gradient-to-br from-teal-50 to-slate-100 p-6 rounded-2xl border border-teal-200/50 shadow-lg hover:shadow-xl transition-all duration-300"
                            whileHover={{ scale: 1.02, y: -2 }}
                          >
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-slate-600 rounded-lg flex items-center justify-center">
                                <Globe className="w-5 h-5 text-white" />
                              </div>
                              <p className="text-sm font-semibold text-teal-700 uppercase tracking-wide">Markets</p>
                            </div>
                            <p className="font-bold text-lg text-gray-900 mb-1">{businessInfo.export_countries.length} Countries</p>
                            <p className="text-sm text-teal-600 font-medium">Global Export Markets</p>
                          </motion.div>
                          
                          <motion.div 
                            className="bg-gradient-to-br from-teal-50 to-slate-100 p-6 rounded-2xl border border-teal-200/50 shadow-lg hover:shadow-xl transition-all duration-300"
                            whileHover={{ scale: 1.02, y: -2 }}
                          >
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-slate-600 rounded-lg flex items-center justify-center">
                                <Award className="w-5 h-5 text-white" />
                              </div>
                              <p className="text-sm font-semibold text-teal-700 uppercase tracking-wide">Certifications</p>
                            </div>
                            <p className="font-bold text-lg text-gray-900 mb-1">{businessInfo.certifications.filter(c => c.name.trim()).length} Certificates</p>
                            <p className="text-sm text-teal-600 font-medium">Quality Standards</p>
                          </motion.div>
                        </div>
                      </motion.div>

                      <motion.div 
                        className="bg-gradient-to-r from-teal-50 via-cyan-50 to-slate-50 border-2 border-teal-200/50 rounded-2xl p-6 shadow-lg"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        <div className="flex items-start gap-4">
                          <motion.div
                            className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center"
                            animate={{ 
                              rotate: [0, 360],
                              scale: [1, 1.1, 1]
                            }}
                            transition={{ 
                              duration: 3,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          >
                            <Sparkles className="w-6 h-6 text-white" />
                          </motion.div>
                          <div className="flex-1">
                            <h4 className="font-bold text-xl text-teal-900 mb-2">Ready to Generate Your Website!</h4>
                            <p className="text-teal-700 leading-relaxed">
                              Your website configuration is complete and optimized. Click &quot;Generate Website&quot; below to create your professional Next.js website with AI-powered design and content generation.
                            </p>
                            <div className="flex items-center gap-4 mt-4">
                              <Badge className="bg-teal-100 border-teal-300 text-teal-700">
                                <Check className="w-3 h-3 mr-1" />
                                Configuration Complete
                              </Badge>
                              <Badge className="bg-cyan-100 border-cyan-300 text-cyan-700">
                                <Zap className="w-3 h-3 mr-1" />
                                AI Optimized
                              </Badge>
                              <Badge className="bg-teal-100 border-teal-300 text-teal-700">
                                <Code className="w-3 h-3 mr-1" />
                                Production Ready
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </motion.div>

                      <motion.div 
                        className="flex flex-col md:flex-row gap-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        <motion.div className="flex-1">
                          <Button 
                            onClick={generateWebsite}
                            disabled={isGenerating || !businessInfo.company_name || !businessInfo.company_type}
                            className="w-full bg-gradient-to-r from-teal-600 via-cyan-600 to-slate-600 hover:from-teal-700 hover:via-cyan-700 hover:to-slate-700 text-white text-lg py-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 font-semibold"
                            size="lg"
                          >
                            {isGenerating ? (
                              <motion.div 
                                className="flex items-center gap-3"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                              >
                                <motion.div 
                                  className="w-6 h-6 border-3 border-white border-t-transparent rounded-full"
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                />
                                <motion.span
                                  animate={{ opacity: [1, 0.5, 1] }}
                                  transition={{ duration: 1.5, repeat: Infinity }}
                                >
                                  Generating Your Website...
                                </motion.span>
                              </motion.div>
                            ) : (
                              <motion.div 
                                className="flex items-center gap-3"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <Rocket className="w-6 h-6" />
                                Generate Website
                                <ChevronRight className="w-5 h-5 ml-1" />
                              </motion.div>
                            )}
                          </Button>
                        </motion.div>
                        
                        <div className="flex flex-col md:flex-row gap-3">
                          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Button 
                              variant="outline" 
                              className="w-full md:w-auto py-6 px-6 border-2 border-cyan-200 hover:border-cyan-400 hover:bg-cyan-50 transition-all duration-300 rounded-xl"
                              onClick={saveToCloud}
                              disabled={!businessInfo.company_name || !businessInfo.company_type}
                            >
                              <Cloud className="w-5 h-5 mr-2" />
                              Save to Cloud
                            </Button>
                          </motion.div>

                          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Button 
                              variant="outline" 
                              className="w-full md:w-auto py-6 px-6 border-2 border-gray-200 hover:border-teal-300 hover:bg-teal-50 transition-all duration-300 rounded-xl"
                              onClick={async () => {
                                const jsonData = {
                                  business_info: businessInfo,
                                  website_config: websiteConfig
                                }
                                const jsonString = JSON.stringify(jsonData, null, 2)
                                
                                try {
                                  if (navigator.clipboard && window.isSecureContext) {
                                    await navigator.clipboard.writeText(jsonString)
                                    toast.success('✓ JSON copied to clipboard!')
                                  } else {
                                    // Fallback for insecure contexts
                                    const textArea = document.createElement('textarea')
                                    textArea.value = jsonString
                                    document.body.appendChild(textArea)
                                    textArea.select()
                                    document.execCommand('copy')
                                    document.body.removeChild(textArea)
                                    toast.success('✓ JSON copied to clipboard!')
                                  }
                                } catch (error) {
                                  console.error('Failed to copy to clipboard:', error)
                                  toast.error('Failed to copy to clipboard')
                                }
                              }}
                            >
                              <FileText className="w-5 h-5 mr-2" />
                              Copy Config
                            </Button>
                          </motion.div>

                          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Button 
                              variant="outline" 
                              className="w-full md:w-auto py-6 px-6 border-2 border-gray-200 hover:border-teal-300 hover:bg-teal-50 transition-all duration-300 rounded-xl"
                              onClick={() => {
                                const jsonData = {
                                  business_info: businessInfo,
                                  website_config: websiteConfig
                                }
                                const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' })
                                const url = URL.createObjectURL(blob)
                                const a = document.createElement('a')
                                a.href = url
                                a.download = `${businessInfo.company_name || 'website'}-config.json`
                                a.click()
                                URL.revokeObjectURL(url)
                                toast.success('✓ Configuration downloaded!')
                              }}
                            >
                              <Download className="w-5 h-5 mr-2" />
                              Download Config
                            </Button>
                          </motion.div>
                        </div>
                      </motion.div>

                      {(!businessInfo.company_name || !businessInfo.company_type) && (
                        <motion.div 
                          className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200/50 rounded-2xl p-6 shadow-lg"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                        >
                          <div className="flex items-start gap-4">
                            <motion.div 
                              className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center"
                              animate={{ 
                                scale: [1, 1.1, 1],
                                rotate: [0, -5, 5, 0]
                              }}
                              transition={{ 
                                duration: 2,
                                repeat: Infinity
                              }}
                            >
                              <X className="w-6 h-6 text-white" />
                            </motion.div>
                            <div>
                              <h4 className="font-bold text-lg text-red-900 mb-2">Missing Required Information</h4>
                              <p className="text-red-700 leading-relaxed">
                                Please complete the <strong>Company Name</strong> and <strong>Business Type</strong> fields in Step 1 before generating your website.
                              </p>
                              <motion.div 
                                className="mt-4"
                                whileHover={{ scale: 1.02 }}
                              >
                                <Button 
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setCurrentStep(0)}
                                  className="border-red-300 text-red-700 hover:bg-red-50"
                                >
                                  <ArrowLeft className="w-4 h-4 mr-2" />
                                  Go Back to Step 1
                                </Button>
                              </motion.div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Enhanced Navigation Buttons */}
          <motion.div 
            className="flex justify-between items-center mt-12 p-6 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-2xl border border-gray-200/50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button 
                variant="outline" 
                onClick={prevStep}
                disabled={currentStep === 0}
                className={`py-4 px-8 rounded-xl border-2 font-semibold transition-all duration-300 ${
                  currentStep === 0 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'border-gray-300 hover:border-teal-400 hover:bg-teal-50 hover:text-teal-700'
                }`}
                size="lg"
              >
                <ArrowLeft className="w-5 h-5 mr-3" />
                Previous Step
              </Button>
            </motion.div>
            
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="hidden md:flex items-center gap-2">
                <span>Progress:</span>
                <div className="flex gap-1">
                  {steps.map((_, index) => (
                    <motion.div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        index <= currentStep ? 'bg-teal-500' : 'bg-gray-300'
                      }`}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                    />
                  ))}
                </div>
              </div>
              <span className="font-medium">
                {currentStep + 1} of {steps.length}
              </span>
            </div>
            
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button 
                onClick={nextStep}
                disabled={currentStep === steps.length - 1}
                className={`py-4 px-8 rounded-xl font-semibold transition-all duration-300 ${
                  currentStep === steps.length - 1
                    ? 'opacity-50 cursor-not-allowed bg-gray-400' 
                    : 'bg-gradient-to-r from-teal-600 to-slate-600 hover:from-teal-700 hover:to-slate-700 text-white shadow-lg hover:shadow-xl'
                }`}
                size="lg"
              >
                {currentStep === steps.length - 2 ? 'Review & Generate' : 'Next Step'}
                <ArrowRight className="w-5 h-5 ml-3" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
