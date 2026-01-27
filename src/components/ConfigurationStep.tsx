'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import {
  Settings,
  Layout,
  Home,
  User,
  Package,
  Phone,
  Palette,
  Globe,
  Check,
  Sparkles,
  Star,
  Zap,
  Shield,
  Eye,
  Brush,
  Crown,
  Wand2,
  CheckCircle,
  Award,
  Mail
} from 'lucide-react'
import { IconCombobox } from '@/components/ui/icon-combobox'
import { MultiSelect } from '@/components/ui/multiselect'
import { designThemes, colorSchemes, visualStyles, websiteTypes, websiteTypeMapping } from '@/data/suggestions'

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

interface ConfigurationStepProps {
  config: WebsiteConfig
  onUpdateConfig: (config: WebsiteConfig) => void
}

export function ConfigurationStep({ config, onUpdateConfig }: ConfigurationStepProps) {
  const [selectedWebsiteType, setSelectedWebsiteType] = useState<string>(config.design_preferences.website_type)

  // Sync local selectedWebsiteType with config changes
  useEffect(() => {
    setSelectedWebsiteType(config.design_preferences.website_type)
  }, [config.design_preferences.website_type])

  const updateDesignPreference = (field: keyof WebsiteConfig['design_preferences'], value: string) => {
    const updated = {
      ...config,
      design_preferences: {
        ...config.design_preferences,
        [field]: value
      }
    }
    onUpdateConfig(updated)
  }

  const updateGeneralSetting = (field: keyof WebsiteConfig, value: any) => {
    const updated = {
      ...config,
      [field]: value
    }
    onUpdateConfig(updated)
  }

  const updateEmailConfig = (field: keyof WebsiteConfig['email_config'], value: string) => {
    const updated = {
      ...config,
      email_config: {
        ...config.email_config,
        [field]: value
      }
    }
    onUpdateConfig(updated)
  }

  const getEnabledCount = (page: keyof WebsiteConfig['pages']) => {
    const sections = config.pages[page].enabled_sections
    return Object.values(sections).filter(Boolean).length
  }

  const getTotalCount = (page: keyof WebsiteConfig['pages']) => {
    return Object.keys(config.pages[page].enabled_sections).length
  }

  // Filter design themes based on selected website type
  const getFilteredDesignThemes = () => {
    if (!selectedWebsiteType) return designThemes
    const mapping = websiteTypeMapping[selectedWebsiteType as keyof typeof websiteTypeMapping]
    if (!mapping) return designThemes
    return designThemes.filter(theme => mapping.designThemes.includes(theme.value))
  }

  // Filter visual styles based on selected website type
  const getFilteredVisualStyles = () => {
    if (!selectedWebsiteType) return visualStyles
    const mapping = websiteTypeMapping[selectedWebsiteType as keyof typeof websiteTypeMapping]
    if (!mapping) return visualStyles
    return visualStyles.filter(style => mapping.visualStyles.includes(style.value))
  }

  // Handle website type change
  const handleWebsiteTypeChange = (websiteType: string) => {
    setSelectedWebsiteType(websiteType)

    // Update parent config with website_type
    updateDesignPreference('website_type', websiteType)

    // Get the allowed themes and styles for this website type
    const mapping = websiteTypeMapping[websiteType as keyof typeof websiteTypeMapping]
    if (!mapping) return

    // Auto-select first theme and style if current selections are not allowed
    const filteredThemes = designThemes.filter(t => mapping.designThemes.includes(t.value))
    const filteredStyles = visualStyles.filter(s => mapping.visualStyles.includes(s.value))

    const currentThemeAllowed = mapping.designThemes.includes(config.design_preferences.theme)
    const currentStyleAllowed = mapping.visualStyles.includes(config.design_preferences.style)

    if (!currentThemeAllowed || !currentStyleAllowed) {
      updateDesignPreference('theme', filteredThemes[0]?.value || '')
      updateDesignPreference('style', filteredStyles[0]?.value || '')
    }
  }

  return (
    <div className="space-y-8">
      <Card className="border-0 shadow-2xl bg-gradient-to-br from-white to-teal-50/30 overflow-hidden">
        <div className="bg-gradient-to-r from-teal-500 via-cyan-500 to-slate-500 h-2"></div>
        <CardHeader className="bg-gradient-to-r from-teal-50/50 to-cyan-50/50 border-b border-gray-100">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 sm:gap-3 md:gap-4"
          >
            <motion.div
              className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0"
              whileHover={{ scale: 1.05, rotate: 10 }}
              animate={{
                rotate: [0, 5, -5, 0]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              <Settings className="w-4 sm:w-5 md:w-7 h-4 sm:h-5 md:h-7 text-white" />
            </motion.div>
            <div className="min-w-0">
              <CardTitle className="text-sm sm:text-lg md:text-2xl font-bold bg-gradient-to-r from-teal-700 to-cyan-700 bg-clip-text text-transparent">
                Website Configuration
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm md:text-base text-gray-600 mt-1 hidden sm:block">
                Customize your website sections, design themes, and user experience preferences
              </CardDescription>
            </div>
            <motion.div
              className="ml-auto hidden md:block flex-shrink-0"
              animate={{
                scale: [1, 1.05, 1],
                rotate: [0, 2, -2, 0]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Badge className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-2 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 text-xs sm:text-sm">
                <Wand2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Step 3 of 4
              </Badge>
            </motion.div>
          </motion.div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 md:p-8">
          <Accordion type="single" defaultValue="page-sections" collapsible className="space-y-4 sm:space-y-6">
            {/* Section 1: Page Sections */}
            <AccordionItem
              value="page-sections"
              className="border-2 border-teal-200/50 rounded-2xl bg-gradient-to-br from-white to-teal-50/30 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <AccordionTrigger className="hover:no-underline px-3 sm:px-4 md:px-6 pt-3 sm:pt-4 md:pt-6 pb-2 sm:pb-3 md:pb-4">
                <div className="flex items-center justify-between w-full gap-2">
                  <div className="flex items-center gap-2 sm:gap-3 md:gap-4 min-w-0">
                    <motion.div
                      className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-teal-500 to-slate-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0"
                      whileHover={{ scale: 1.05, rotate: 5 }}
                    >
                      <Layout className="w-4 sm:w-5 md:w-6 h-4 sm:h-5 md:h-6 text-white" />
                    </motion.div>
                    <div className="text-left min-w-0">
                      <h3 className="text-sm sm:text-base md:text-xl font-bold bg-gradient-to-r from-teal-700 to-slate-700 bg-clip-text text-transparent">
                        Page Sections
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 font-normal hidden sm:block">Configure which sections to include on each page</p>
                    </div>
                  </div>
                  <Badge className="bg-gradient-to-r from-teal-500 to-slate-500 text-white px-2 py-0.5 sm:px-3 sm:py-1 text-xs sm:text-sm flex-shrink-0 whitespace-nowrap">
                    <CheckCircle className="w-2 h-2 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                    5 Pages
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-3 sm:px-4 md:px-6 pb-4 sm:pb-5 md:pb-6 pt-2 sm:pt-3">
                {/* Smart Dropdown Section Selector - All Pages in One Card */}
                <motion.div
                  className="border-2 border-teal-200/50 rounded-2xl p-3 sm:p-4 md:p-6 bg-gradient-to-br from-white to-teal-50/20 shadow-lg hover:shadow-xl transition-all duration-300"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3 mb-3 sm:mb-4 md:mb-6">
                    <motion.div
                      className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-gradient-to-br from-teal-500 to-slate-600 rounded-xl flex items-center justify-center shadow-md flex-shrink-0"
                      whileHover={{ scale: 1.05, rotate: 5 }}
                    >
                      <Layout className="w-4 sm:w-5 h-4 sm:h-5 text-white" />
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm sm:text-base md:text-xl font-bold bg-gradient-to-r from-teal-700 to-slate-700 bg-clip-text text-transparent">
                        Page Sections Configuration
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Select sections to enable for each page using smart dropdowns</p>
                    </div>
                    <Badge className="bg-gradient-to-r from-teal-500 to-slate-500 text-white px-2 py-0.5 sm:px-3 sm:py-1 md:px-3 md:py-1.5 text-xs sm:text-sm mt-2 sm:mt-0 flex-shrink-0 whitespace-nowrap">
                      <CheckCircle className="w-2 h-2 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                      Quick Select
                    </Badge>
                  </div>

                  {/* Grid Layout - 2 columns on large screens, 1 on mobile */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 md:gap-4 lg:gap-5">
                    {/* Home Page Dropdown */}
                    <motion.div
                      className="bg-white/80 backdrop-blur-sm rounded-xl border border-teal-100/50 p-3 sm:p-4 md:p-5 shadow-sm hover:shadow-md transition-all duration-200"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <div className="flex items-center justify-between mb-2 sm:mb-3 md:mb-4 gap-2">
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                          <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-gradient-to-br from-teal-500 to-slate-600 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
                            <Home className="w-4 sm:w-5 h-4 sm:h-5 text-white" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-semibold text-xs sm:text-sm md:text-base text-gray-900">Home Page</h4>
                            <p className="text-xs text-gray-500 hidden sm:block">Landing page sections</p>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className="bg-teal-100 border-teal-300 text-teal-700 px-1.5 sm:px-2 md:px-2.5 py-0.5 sm:py-0.5 md:py-1 text-xs flex-shrink-0"
                        >
                          {getEnabledCount('home')}/{getTotalCount('home')}
                        </Badge>
                      </div>
                      <MultiSelect
                        options={Object.keys(config.pages.home.enabled_sections).map(section => ({
                          value: section,
                          label: section.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                        }))}
                        selected={Object.entries(config.pages.home.enabled_sections)
                          .filter(([_, enabled]) => enabled)
                          .map(([section]) => section)}
                        onSelectionChange={(selectedSections) => {
                          const updated = {
                            ...config,
                            pages: {
                              ...config.pages,
                              home: {
                                ...config.pages.home,
                                enabled_sections: Object.keys(config.pages.home.enabled_sections).reduce((acc, section) => ({
                                  ...acc,
                                  [section]: selectedSections.includes(section)
                                }), {} as typeof config.pages.home.enabled_sections)
                              }
                            }
                          }
                          onUpdateConfig(updated)
                        }}
                        placeholder="Select home page sections..."
                        searchPlaceholder="Search sections..."
                        className="min-h-[48px] border-2 border-teal-200/50 focus-within:border-teal-500 bg-white transition-colors duration-200"
                        clearable={true}
                      />
                    </motion.div>

                    {/* About Page Dropdown */}
                    <motion.div
                      className="bg-white/80 backdrop-blur-sm rounded-xl border border-teal-100/50 p-3 sm:p-4 md:p-5 shadow-sm hover:shadow-md transition-all duration-200"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <div className="flex items-center justify-between mb-2 sm:mb-3 md:mb-4 gap-2">
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                          <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-gradient-to-br from-teal-500 to-slate-600 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
                            <User className="w-4 sm:w-5 h-4 sm:h-5 text-white" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-semibold text-xs sm:text-sm md:text-base text-gray-900">About Page</h4>
                            <p className="text-xs text-gray-500 hidden sm:block">Company story sections</p>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className="bg-teal-100 border-teal-300 text-teal-700 px-1.5 sm:px-2 md:px-2.5 py-0.5 sm:py-0.5 md:py-1 text-xs flex-shrink-0"
                        >
                          {getEnabledCount('about')}/{getTotalCount('about')}
                        </Badge>
                      </div>
                      <MultiSelect
                        options={Object.keys(config.pages.about.enabled_sections).map(section => ({
                          value: section,
                          label: section.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                        }))}
                        selected={Object.entries(config.pages.about.enabled_sections)
                          .filter(([_, enabled]) => enabled)
                          .map(([section]) => section)}
                        onSelectionChange={(selectedSections) => {
                          const updated = {
                            ...config,
                            pages: {
                              ...config.pages,
                              about: {
                                ...config.pages.about,
                                enabled_sections: Object.keys(config.pages.about.enabled_sections).reduce((acc, section) => ({
                                  ...acc,
                                  [section]: selectedSections.includes(section)
                                }), {} as typeof config.pages.about.enabled_sections)
                              }
                            }
                          }
                          onUpdateConfig(updated)
                        }}
                        placeholder="Select about page sections..."
                        searchPlaceholder="Search sections..."
                        className="min-h-[48px] border-2 border-teal-200/50 focus-within:border-teal-500 bg-white transition-colors duration-200"
                        clearable={true}
                      />
                    </motion.div>

                    {/* Products Page Dropdown */}
                    <motion.div
                      className="bg-white/80 backdrop-blur-sm rounded-xl border border-teal-100/50 p-3 sm:p-4 md:p-5 shadow-sm hover:shadow-md transition-all duration-200"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <div className="flex items-center justify-between mb-2 sm:mb-3 md:mb-4 gap-2">
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                          <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-gradient-to-br from-teal-500 to-slate-600 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
                            <Package className="w-4 sm:w-5 h-4 sm:h-5 text-white" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-semibold text-xs sm:text-sm md:text-base text-gray-900">Products Page</h4>
                            <p className="text-xs text-gray-500 hidden sm:block">Product showcase sections</p>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className="bg-teal-100 border-teal-300 text-teal-700 px-1.5 sm:px-2 md:px-2.5 py-0.5 sm:py-0.5 md:py-1 text-xs flex-shrink-0"
                        >
                          {getEnabledCount('products')}/{getTotalCount('products')}
                        </Badge>
                      </div>
                      <MultiSelect
                        options={Object.keys(config.pages.products.enabled_sections).map(section => ({
                          value: section,
                          label: section.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                        }))}
                        selected={Object.entries(config.pages.products.enabled_sections)
                          .filter(([_, enabled]) => enabled)
                          .map(([section]) => section)}
                        onSelectionChange={(selectedSections) => {
                          const updated = {
                            ...config,
                            pages: {
                              ...config.pages,
                              products: {
                                ...config.pages.products,
                                enabled_sections: Object.keys(config.pages.products.enabled_sections).reduce((acc, section) => ({
                                  ...acc,
                                  [section]: selectedSections.includes(section)
                                }), {} as typeof config.pages.products.enabled_sections)
                              }
                            }
                          }
                          onUpdateConfig(updated)
                        }}
                        placeholder="Select products page sections..."
                        searchPlaceholder="Search sections..."
                        className="min-h-[48px] border-2 border-teal-200/50 focus-within:border-teal-500 bg-white transition-colors duration-200"
                        clearable={true}
                      />
                    </motion.div>

                    {/* Certifications Page Dropdown */}
                    <motion.div
                      className="bg-white/80 backdrop-blur-sm rounded-xl border border-teal-100/50 p-3 sm:p-4 md:p-5 shadow-sm hover:shadow-md transition-all duration-200"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <div className="flex items-center justify-between mb-2 sm:mb-3 md:mb-4 gap-2">
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                          <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-gradient-to-br from-teal-500 to-slate-600 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
                            <Award className="w-4 sm:w-5 h-4 sm:h-5 text-white" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-semibold text-xs sm:text-sm md:text-base text-gray-900">Certifications Page</h4>
                            <p className="text-xs text-gray-500 hidden sm:block">Credentials & quality sections</p>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className="bg-teal-100 border-teal-300 text-teal-700 px-1.5 sm:px-2 md:px-2.5 py-0.5 sm:py-0.5 md:py-1 text-xs flex-shrink-0"
                        >
                          {getEnabledCount('certifications')}/{getTotalCount('certifications')}
                        </Badge>
                      </div>
                      <MultiSelect
                        options={Object.keys(config.pages.certifications.enabled_sections).map(section => ({
                          value: section,
                          label: section.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                        }))}
                        selected={Object.entries(config.pages.certifications.enabled_sections)
                          .filter(([_, enabled]) => enabled)
                          .map(([section]) => section)}
                        onSelectionChange={(selectedSections) => {
                          const updated = {
                            ...config,
                            pages: {
                              ...config.pages,
                              certifications: {
                                ...config.pages.certifications,
                                enabled_sections: Object.keys(config.pages.certifications.enabled_sections).reduce((acc, section) => ({
                                  ...acc,
                                  [section]: selectedSections.includes(section)
                                }), {} as typeof config.pages.certifications.enabled_sections)
                              }
                            }
                          }
                          onUpdateConfig(updated)
                        }}
                        placeholder="Select certifications page sections..."
                        searchPlaceholder="Search sections..."
                        className="min-h-[48px] border-2 border-teal-200/50 focus-within:border-teal-500 bg-white transition-colors duration-200"
                        clearable={true}
                      />
                    </motion.div>

                    {/* Contact Page Dropdown */}
                    <motion.div
                      className="bg-white/80 backdrop-blur-sm rounded-xl border border-teal-100/50 p-3 sm:p-4 md:p-5 shadow-sm hover:shadow-md transition-all duration-200"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <div className="flex items-center justify-between mb-2 sm:mb-3 md:mb-4 gap-2">
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                          <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-gradient-to-br from-teal-500 to-slate-600 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
                            <Phone className="w-4 sm:w-5 h-4 sm:h-5 text-white" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-semibold text-xs sm:text-sm md:text-base text-gray-900">Contact Page</h4>
                            <p className="text-xs text-gray-500 hidden sm:block">Contact form sections</p>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className="bg-teal-100 border-teal-300 text-teal-700 px-1.5 sm:px-2 md:px-2.5 py-0.5 sm:py-0.5 md:py-1 text-xs flex-shrink-0"
                        >
                          {getEnabledCount('contact')}/{getTotalCount('contact')}
                        </Badge>
                      </div>
                      <MultiSelect
                        options={Object.keys(config.pages.contact.enabled_sections).map(section => ({
                          value: section,
                          label: section.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                        }))}
                        selected={Object.entries(config.pages.contact.enabled_sections)
                          .filter(([_, enabled]) => enabled)
                          .map(([section]) => section)}
                        onSelectionChange={(selectedSections) => {
                          const updated = {
                            ...config,
                            pages: {
                              ...config.pages,
                              contact: {
                                ...config.pages.contact,
                                enabled_sections: Object.keys(config.pages.contact.enabled_sections).reduce((acc, section) => ({
                                  ...acc,
                                  [section]: selectedSections.includes(section)
                                }), {} as typeof config.pages.contact.enabled_sections)
                              }
                            }
                          }
                          onUpdateConfig(updated)
                        }}
                        placeholder="Select contact page sections..."
                        searchPlaceholder="Search sections..."
                        className="min-h-[48px] border-2 border-orange-200/50 focus-within:border-orange-500 bg-white transition-colors duration-200"
                        clearable={true}
                      />
                    </motion.div>
                  </div>

                </motion.div>
              </AccordionContent>
            </AccordionItem>

            {/* Section 2: Design & Theme */}
            <AccordionItem
              value="design-theme"
              className="border-2 border-teal-200/50 rounded-2xl bg-gradient-to-br from-white to-teal-50/30 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <AccordionTrigger className="hover:no-underline px-3 sm:px-4 md:px-6 pt-3 sm:pt-4 md:pt-6 pb-2 sm:pb-3 md:pb-4">
                <div className="flex items-center justify-between w-full gap-2">
                  <div className="flex items-center gap-2 sm:gap-3 md:gap-4 min-w-0">
                    <motion.div
                      className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-teal-500 to-slate-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0"
                      whileHover={{ scale: 1.05, rotate: 5 }}
                    >
                      <Palette className="w-4 sm:w-5 md:w-6 h-4 sm:h-5 md:h-6 text-white" />
                    </motion.div>
                    <div className="text-left min-w-0">
                      <h3 className="text-sm sm:text-base md:text-xl font-bold bg-gradient-to-r from-teal-700 to-slate-700 bg-clip-text text-transparent">
                        Design & Theme
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 font-normal hidden sm:block">Customize your website's visual appearance and style</p>
                    </div>
                  </div>
                  <Badge className="bg-gradient-to-r from-teal-500 to-slate-500 text-white px-2 py-0.5 sm:px-3 sm:py-1 text-xs sm:text-sm flex-shrink-0 whitespace-nowrap">
                    <Brush className="w-2 h-2 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                    Style
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-3 sm:px-4 md:px-6 pb-4 sm:pb-5 md:pb-6 pt-2 sm:pt-3">
                <div className="space-y-4 sm:space-y-5 md:space-y-6">
                {/* COMPACT: Website Type, Design Theme & Visual Style in ONE ROW */}
                <motion.div
                  className="border border-teal-200/50 rounded-xl p-3 sm:p-4 md:p-5 bg-gradient-to-br from-teal-50/30 to-slate-50/30"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className="flex items-center justify-between mb-2 sm:mb-3 md:mb-4">
                    <div className="flex items-center gap-2 sm:gap-3 md:gap-4 min-w-0">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-teal-500 to-slate-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Brush className="w-4 sm:w-5 md:w-6 h-4 sm:h-5 md:h-6 text-white" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900">Design & Style Selection</h3>
                        <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">
                          {selectedWebsiteType
                            ? `${websiteTypes.find(t => t.value === selectedWebsiteType)?.label} - ${getFilteredDesignThemes().length} themes, ${getFilteredVisualStyles().length} styles`
                            : 'Choose website type, theme and visual aesthetics'}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className="bg-purple-100 border-purple-300 text-purple-700 text-xs px-2 py-0.5 sm:px-3 sm:py-1 flex-shrink-0 whitespace-nowrap"
                    >
                      {selectedWebsiteType ? 'Filtered' : 'All Options'}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
                    {/* Website Type */}
                    <div className="space-y-1.5 sm:space-y-2">
                      <Label className="text-xs sm:text-sm font-medium text-gray-700 flex items-center gap-1.5">
                        <Wand2 className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                        <span>Website Type</span>
                      </Label>
                      <Select
                        value={selectedWebsiteType}
                        onValueChange={handleWebsiteTypeChange}
                      >
                        <SelectTrigger className="border border-purple-200 focus:border-purple-500 bg-white text-xs sm:text-sm h-8 sm:h-9">
                          <SelectValue placeholder="Choose type..." />
                        </SelectTrigger>
                        <SelectContent className="max-w-[400px] w-full">
                          {websiteTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              <div className="flex flex-col py-0.5">
                                <span className="font-medium text-gray-900 text-sm">{type.label}</span>
                                <span className="text-xs text-gray-500">{type.description}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Design Theme */}
                    <div className="space-y-1.5 sm:space-y-2">
                      <Label className="text-xs sm:text-sm font-medium text-gray-700">
                        Design Theme
                        {selectedWebsiteType && (
                          <span className="text-xs text-purple-600 ml-1.5">({getFilteredDesignThemes().length})</span>
                        )}
                      </Label>
                      <IconCombobox
                        value={config.design_preferences.theme}
                        onValueChange={(value) => updateDesignPreference('theme', value)}
                        options={getFilteredDesignThemes()}
                        placeholder="Select theme..."
                        searchPlaceholder="Search themes..."
                        className="border border-teal-200/50 focus:border-teal-500 bg-white/80 h-8 sm:h-9 text-xs sm:text-sm"
                      />
                    </div>

                    {/* Visual Style */}
                    <div className="space-y-1.5 sm:space-y-2">
                      <Label className="text-xs sm:text-sm font-medium text-gray-700">
                        Visual Style
                        {selectedWebsiteType && (
                          <span className="text-xs text-purple-600 ml-1.5">({getFilteredVisualStyles().length})</span>
                        )}
                      </Label>
                      <IconCombobox
                        value={config.design_preferences.style}
                        onValueChange={(value) => updateDesignPreference('style', value)}
                        options={getFilteredVisualStyles()}
                        placeholder="Select style..."
                        searchPlaceholder="Search styles..."
                        className="border border-teal-200/50 focus:border-teal-500 bg-white/80 h-8 sm:h-9 text-xs sm:text-sm"
                      />
                    </div>
                  </div>

                  {/* Info Message when filtered */}
                  {selectedWebsiteType && (
                    <motion.div
                      className="mt-2 sm:mt-2.5 p-2 sm:p-3 bg-purple-50/60 border border-purple-200/60 rounded-lg"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ duration: 0.2 }}
                    >
                      <p className="text-xs sm:text-sm text-purple-800 flex items-center gap-1.5">
                        <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                        Website type controls available themes & styles
                      </p>
                    </motion.div>
                  )}
                </motion.div>

                {/* Compact Color Scheme Selection */}
                <motion.div
                  className="border border-teal-200/50 rounded-xl p-3 sm:p-4 md:p-5 bg-gradient-to-br from-teal-50/30 to-slate-50/30"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="flex items-center justify-between mb-3 sm:mb-4 md:mb-5">
                    <div className="flex items-center gap-2 sm:gap-3 md:gap-4 min-w-0">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-teal-500 to-slate-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Palette className="w-4 sm:w-5 md:w-6 h-4 sm:h-5 md:h-6 text-white" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm sm:text-lg md:text-xl font-semibold text-gray-900">Brand Colors</h3>
                        <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Select your brand color scheme</p>
                      </div>
                    </div>
                    {config.design_preferences.primary_color && (
                      <Badge className="bg-teal-100 border-teal-300 text-teal-700 text-xs px-2 py-0.5 sm:px-3 sm:py-1 flex-shrink-0 whitespace-nowrap" variant="outline">
                        <Star className="w-2 h-2 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                        Selected
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-3 sm:space-y-4 md:space-y-5">
                    {/* Professional Colors */}
                    <div>
                      <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3 md:mb-4 flex items-center gap-2">
                        <Crown className="w-3 sm:w-4 h-3 sm:h-4 text-teal-600 flex-shrink-0" />
                        <span>Professional Colors</span>
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                        {colorSchemes.slice(0, 4).map((preset, index) => {
                          const isSelected = config.design_preferences.primary_color === preset.primary
                          return (
                            <motion.button
                              key={`prof-color-${preset.value}`}
                              type="button"
                              className={`relative p-2 sm:p-3 md:p-4 border rounded-xl text-left transition-all duration-300 group ${
                                isSelected
                                  ? 'border-teal-500 bg-teal-50 shadow-lg ring-2 ring-teal-300'
                                  : 'border-gray-200 bg-white hover:border-teal-300 hover:bg-teal-50/50 hover:shadow-lg'
                              }`}
                              whileHover={{ scale: 1.03, y: -3 }}
                              whileTap={{ scale: 0.97 }}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              onClick={(e) => {
                                e.preventDefault()
                                const updated = {
                                  ...config,
                                  design_preferences: {
                                    ...config.design_preferences,
                                    primary_color: preset.primary,
                                    secondary_color: preset.secondary
                                  }
                                }
                                onUpdateConfig(updated)
                              }}
                            >
                              <div className="flex items-center gap-2 sm:gap-3">
                                <div className={`relative w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-lg shadow-md ${preset.preview} ${
                                  isSelected ? 'ring-2 ring-teal-400' : 'group-hover:ring-2 group-hover:ring-teal-300'
                                } flex-shrink-0`}>
                                  {isSelected && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      <Check className="w-3 sm:w-3.5 md:w-4 h-3 sm:h-3.5 md:h-4 text-white drop-shadow-lg" />
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className={`font-medium text-xs sm:text-sm md:text-base ${
                                    isSelected ? 'text-teal-900' : 'text-gray-900 group-hover:text-teal-800'
                                  }`}>
                                    {preset.label}
                                  </div>
                                </div>
                              </div>
                            </motion.button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Modern & Dynamic Colors */}
                    <div>
                      <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3 md:mb-4 flex items-center gap-2">
                        <Zap className="w-3 sm:w-4 h-3 sm:h-4 text-purple-600 flex-shrink-0" />
                        <span>Modern & Dynamic</span>
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                        {colorSchemes.slice(4, 8).map((preset, index) => {
                          const isSelected = config.design_preferences.primary_color === preset.primary
                          return (
                            <motion.button
                              key={`modern-color-${preset.value}`}
                              type="button"
                              className={`relative p-2 sm:p-3 md:p-4 border rounded-xl text-left transition-all duration-300 group ${
                                isSelected
                                  ? 'border-teal-500 bg-teal-50 shadow-lg ring-2 ring-teal-300'
                                  : 'border-gray-200 bg-white hover:border-teal-300 hover:bg-teal-50/50 hover:shadow-lg'
                              }`}
                              whileHover={{ scale: 1.03, y: -3 }}
                              whileTap={{ scale: 0.97 }}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              onClick={(e) => {
                                e.preventDefault()
                                const updated = {
                                  ...config,
                                  design_preferences: {
                                    ...config.design_preferences,
                                    primary_color: preset.primary,
                                    secondary_color: preset.secondary
                                  }
                                }
                                onUpdateConfig(updated)
                              }}
                            >
                              <div className="flex items-center gap-2 sm:gap-3">
                                <div className={`relative w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-lg shadow-md ${preset.preview} ${
                                  isSelected ? 'ring-2 ring-teal-400' : 'group-hover:ring-2 group-hover:ring-teal-300'
                                } flex-shrink-0`}>
                                  {isSelected && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      <Check className="w-3 sm:w-3.5 md:w-4 h-3 sm:h-3.5 md:h-4 text-white drop-shadow-lg" />
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className={`font-medium text-xs sm:text-sm md:text-base ${
                                    isSelected ? 'text-teal-900' : 'text-gray-900 group-hover:text-teal-800'
                                  }`}>
                                    {preset.label}
                                  </div>
                                </div>
                              </div>
                            </motion.button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Warm & Creative Colors */}
                    <div>
                      <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3 md:mb-4 flex items-center gap-2">
                        <Sparkles className="w-3 sm:w-4 h-3 sm:h-4 text-orange-600 flex-shrink-0" />
                        <span>Warm & Creative</span>
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                        {colorSchemes.slice(8, 16).map((preset, index) => {
                          const isSelected = config.design_preferences.primary_color === preset.primary
                          return (
                            <motion.button
                              key={`warm-color-${preset.value}`}
                              type="button"
                              className={`relative p-2 sm:p-3 md:p-4 border rounded-xl text-left transition-all duration-300 group ${
                                isSelected
                                  ? 'border-teal-500 bg-teal-50 shadow-lg ring-2 ring-teal-300'
                                  : 'border-gray-200 bg-white hover:border-teal-300 hover:bg-teal-50/50 hover:shadow-lg'
                              }`}
                              whileHover={{ scale: 1.03, y: -3 }}
                              whileTap={{ scale: 0.97 }}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              onClick={(e) => {
                                e.preventDefault()
                                const updated = {
                                  ...config,
                                  design_preferences: {
                                    ...config.design_preferences,
                                    primary_color: preset.primary,
                                    secondary_color: preset.secondary
                                  }
                                }
                                onUpdateConfig(updated)
                              }}
                            >
                              <div className="flex items-center gap-2 sm:gap-3">
                                <div className={`relative w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-lg shadow-md ${preset.preview} ${
                                  isSelected ? 'ring-2 ring-teal-400' : 'group-hover:ring-2 group-hover:ring-teal-300'
                                } flex-shrink-0`}>
                                  {isSelected && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      <Check className="w-3 sm:w-3.5 md:w-4 h-3 sm:h-3.5 md:h-4 text-white drop-shadow-lg" />
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className={`font-medium text-xs sm:text-sm md:text-base ${
                                    isSelected ? 'text-teal-900' : 'text-gray-900 group-hover:text-teal-800'
                                  }`}>
                                    {preset.label}
                                  </div>
                                </div>
                              </div>
                            </motion.button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Neutral & Premium Colors */}
                    <div>
                      <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3 md:mb-4 flex items-center gap-2">
                        <Shield className="w-3 sm:w-4 h-3 sm:h-4 text-gray-600 flex-shrink-0" />
                        <span>Neutral & Premium</span>
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                        {colorSchemes.slice(16).map((preset, index) => {
                          const isSelected = config.design_preferences.primary_color === preset.primary
                          return (
                            <motion.button
                              key={`neutral-color-${preset.value}`}
                              type="button"
                              className={`relative p-2 sm:p-3 md:p-4 border rounded-xl text-left transition-all duration-300 group ${
                                isSelected
                                  ? 'border-teal-500 bg-teal-50 shadow-lg ring-2 ring-teal-300'
                                  : 'border-gray-200 bg-white hover:border-teal-300 hover:bg-teal-50/50 hover:shadow-lg'
                              }`}
                              whileHover={{ scale: 1.03, y: -3 }}
                              whileTap={{ scale: 0.97 }}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              onClick={(e) => {
                                e.preventDefault()
                                const updated = {
                                  ...config,
                                  design_preferences: {
                                    ...config.design_preferences,
                                    primary_color: preset.primary,
                                    secondary_color: preset.secondary
                                  }
                                }
                                onUpdateConfig(updated)
                              }}
                            >
                              <div className="flex items-center gap-2 sm:gap-3">
                                <div className={`relative w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-lg shadow-md ${preset.preview} ${
                                  isSelected ? 'ring-2 ring-teal-400' : 'group-hover:ring-2 group-hover:ring-teal-300'
                                } flex-shrink-0`}>
                                  {isSelected && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      <Check className="w-3 sm:w-3.5 md:w-4 h-3 sm:h-3.5 md:h-4 text-white drop-shadow-lg" />
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className={`font-medium text-xs sm:text-sm md:text-base ${
                                    isSelected ? 'text-teal-900' : 'text-gray-900 group-hover:text-teal-800'
                                  }`}>
                                    {preset.label}
                                  </div>
                                </div>
                              </div>
                            </motion.button>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </motion.div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Section 3: General Settings */}
            <AccordionItem
              value="general-settings"
              className="border-2 border-teal-200/50 rounded-2xl bg-gradient-to-br from-white to-teal-50/30 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <AccordionTrigger className="hover:no-underline px-3 sm:px-4 md:px-6 pt-3 sm:pt-4 md:pt-6 pb-2 sm:pb-3 md:pb-4">
                <div className="flex items-center justify-between w-full gap-2">
                  <div className="flex items-center gap-2 sm:gap-3 md:gap-4 min-w-0">
                    <motion.div
                      className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-teal-500 to-slate-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0"
                      whileHover={{ scale: 1.05, rotate: 5 }}
                    >
                      <Globe className="w-4 sm:w-5 md:w-6 h-4 sm:h-5 md:h-6 text-white" />
                    </motion.div>
                    <div className="text-left min-w-0">
                      <h3 className="text-sm sm:text-base md:text-xl font-bold bg-gradient-to-r from-teal-700 to-slate-700 bg-clip-text text-transparent">
                        General Settings
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 font-normal hidden sm:block">Configure language, currency, and SEO settings</p>
                    </div>
                  </div>
                  <Badge className="bg-gradient-to-r from-teal-500 to-slate-500 text-white px-2 py-0.5 sm:px-3 sm:py-1 text-xs sm:text-sm flex-shrink-0 whitespace-nowrap">
                    <Globe className="w-2 h-2 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                    Global
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-3 sm:px-4 md:px-6 pb-4 sm:pb-5 md:pb-6 pt-2 sm:pt-3">
                <div className="space-y-4 sm:space-y-5 md:space-y-6">
                {/* Compact General Settings */}
                <motion.div
                  className="border border-teal-200/50 rounded-xl p-3 sm:p-4 md:p-5 bg-gradient-to-br from-teal-50/30 to-slate-50/30"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className="flex items-center justify-between mb-3 sm:mb-4 md:mb-5">
                    <div className="flex items-center gap-2 sm:gap-3 md:gap-4 min-w-0">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-teal-500 to-slate-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Globe className="w-4 sm:w-5 md:w-6 h-4 sm:h-5 md:h-6 text-white" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm sm:text-lg md:text-xl font-semibold text-gray-900">Website Settings</h3>
                        <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Configure language, SEO and features</p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className="bg-teal-100 border-teal-300 text-teal-700 text-xs px-2 py-0.5 sm:px-3 sm:py-1 flex-shrink-0 whitespace-nowrap"
                    >
                      Settings
                    </Badge>
                  </div>

                  <div className="space-y-3 sm:space-y-4 md:space-y-5">
                    {/* SEO & Email Configuration in one row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                      {/* SEO Settings */}
                      <div className="flex items-center justify-between p-2 sm:p-3 md:p-4 border border-gray-200 rounded-lg bg-white">
                        <div className="min-w-0">
                          <div className="font-medium text-xs sm:text-sm">SEO Optimization</div>
                          <div className="text-xs text-gray-600">
                            Advanced SEO features
                          </div>
                        </div>
                        <Switch
                          checked={config.seo_enabled}
                          onCheckedChange={(checked) => updateGeneralSetting('seo_enabled', checked)}
                          className="data-[state=checked]:bg-teal-500 scale-75 sm:scale-100 flex-shrink-0"
                        />
                      </div>

                      {/* Language Selection */}
                      <div className="space-y-1.5 sm:space-y-2">
                        <Label className="text-xs sm:text-sm font-medium">Website Language</Label>
                        <Select
                          value={config.language}
                          onValueChange={(value) => updateGeneralSetting('language', value)}
                        >
                          <SelectTrigger className="border-gray-200 focus:border-teal-500 bg-white text-xs sm:text-sm h-8 sm:h-9">
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                          <SelectContent className="max-w-[250px] w-full">
                            <SelectItem value="en">
                              <span className="block truncate">English</span>
                            </SelectItem>
                            <SelectItem value="es">
                              <span className="block truncate">Spanish</span>
                            </SelectItem>
                            <SelectItem value="fr">
                              <span className="block truncate">French</span>
                            </SelectItem>
                            <SelectItem value="de">
                              <span className="block truncate">German</span>
                            </SelectItem>
                            <SelectItem value="hi">
                              <span className="block truncate">Hindi</span>
                            </SelectItem>
                            <SelectItem value="zh">
                              <span className="block truncate">Chinese</span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Email Configuration Section */}
                    <div className="border border-teal-200/50 rounded-lg p-3 sm:p-4 md:p-5 bg-gradient-to-r from-teal-50/50 to-slate-50/50">
                      <div className="flex items-center gap-2 mb-3 sm:mb-4 md:mb-5">
                        <Mail className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-teal-600 flex-shrink-0" />
                        <h4 className="font-semibold text-xs sm:text-sm text-gray-900">Email Configuration (SMTP)</h4>
                        <Badge variant="outline" className="text-xs px-2 py-0.5 sm:px-2 sm:py-1 bg-teal-100 border-teal-300 text-teal-700 flex-shrink-0 whitespace-nowrap">
                          Contact Form
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                        <div className="space-y-1.5 sm:space-y-2">
                          <Label className="text-xs sm:text-sm font-medium text-gray-700">SMTP Email</Label>
                          <Input
                            type="email"
                            value={config.email_config.smtp_user}
                            onChange={(e) => updateEmailConfig('smtp_user', e.target.value)}
                            placeholder="your-email@gmail.com"
                            className="border-gray-200 focus:border-teal-500 bg-white text-xs sm:text-sm h-8 sm:h-9"
                          />
                          <p className="text-xs text-gray-500">Email address for sending contact form submissions</p>
                        </div>
                        <div className="space-y-1.5 sm:space-y-2">
                          <Label className="text-xs sm:text-sm font-medium text-gray-700">SMTP Password / App Password</Label>
                          <Input
                            type="password"
                            value={config.email_config.smtp_password}
                            onChange={(e) => updateEmailConfig('smtp_password', e.target.value)}
                            placeholder="xxxx xxxx xxxx xxxx"
                            className="border-gray-200 focus:border-blue-500 bg-white text-xs sm:text-sm h-8 sm:h-9"
                          />
                          <p className="text-xs text-gray-500">Use app-specific password for Gmail</p>
                        </div>
                      </div>
                    </div>

                    {/* Currency Selection */}
                    <div className="space-y-1.5 sm:space-y-2">
                      <Label className="text-xs sm:text-sm font-medium">Default Currency</Label>
                      <Select
                        value={config.currency}
                        onValueChange={(value) => updateGeneralSetting('currency', value)}
                      >
                        <SelectTrigger className="border-gray-200 focus:border-teal-500 bg-white text-xs sm:text-sm h-8 sm:h-9">
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent className="max-w-[300px] w-full">
                          <SelectItem value="USD">
                            <span className="block truncate">US Dollar (USD)</span>
                          </SelectItem>
                          <SelectItem value="EUR">
                            <span className="block truncate">Euro (EUR)</span>
                          </SelectItem>
                          <SelectItem value="GBP">
                            <span className="block truncate">British Pound (GBP)</span>
                          </SelectItem>
                          <SelectItem value="INR">
                            <span className="block truncate">Indian Rupee (INR)</span>
                          </SelectItem>
                          <SelectItem value="JPY">
                            <span className="block truncate">Japanese Yen (JPY)</span>
                          </SelectItem>
                          <SelectItem value="CNY">
                            <span className="block truncate">Chinese Yuan (CNY)</span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </motion.div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  )
}