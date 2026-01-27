'use client'

import { useEffect, useRef, useState } from 'react'
import { Message } from './Message'
import { ReviewAllData } from './ReviewAllData'
import { useChat } from '@/lib/chat-context'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api-client'
import { toast } from 'sonner'

export function ChatContainer() {
  const router = useRouter()
  const { messages, uiState, collectedData, progress, jumpToField } = useChat()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  // Check if we're in review section (ONLY show final review in actual review states)
  const isInReviewSection = progress.section === 'review'

  // Handle website generation
  const handleGenerateWebsite = async () => {
    try {
      setIsGenerating(true)

      // Clean up collected data - remove intermediate state fields and parse JSON strings
      // Cast to any for flat fields that chatbot stores during conversation (email, phone, whatsapp)
      const data = collectedData as any
      
      // Clean export_countries - ensure correct structure (country_name, flag_url)
      let exportCountries = data.export_countries || []
      if (typeof exportCountries === 'string') {
        try {
          exportCountries = JSON.parse(exportCountries)
        } catch (e) {
          exportCountries = []
        }
      }
      const cleanExportCountries = (exportCountries || []).map((country: any) => {
        // Handle both formats: {value, label, flag_url} or {country_name, flag_url}
        return {
          country_name: country.country_name || country.label || '',
          flag_url: country.flag_url || ''
        }
      }).filter((c: any) => c.country_name && c.flag_url) // Remove empty entries

      // Clean certifications - ensure correct structure
      let certifications = data.certifications || []
      if (typeof certifications === 'string') {
        try {
          certifications = JSON.parse(certifications)
        } catch (e) {
          certifications = []
        }
      }

      // Clean team_members - ensure correct structure
      let teamMembers = data.team_members || []
      if (typeof teamMembers === 'string') {
        try {
          teamMembers = JSON.parse(teamMembers)
        } catch (e) {
          teamMembers = []
        }
      }

      // Clean categories - ensure correct structure
      let categories = data.categories || []
      if (typeof categories === 'string') {
        try {
          categories = JSON.parse(categories)
        } catch (e) {
          categories = []
        }
      }

      const cleanBusinessInfo: any = {
        company_name: data.company_name || '',
        company_type: data.company_type || '',
        description: data.description || '',
        logo_url: data.logo_url || '',
        year_established: data.year_established || '',
        iec_code: data.iec_code || '',
        gst_number: data.gst_number || '',
        udyam_adhar: data.udyam_adhar || '',
        contact: {
          email: data.contact?.email || data.email || '',
          phone: data.contact?.phone || data.phone || '',
          whatsapp: data.contact?.whatsapp || data.whatsapp || '',
          address: data.contact?.address || data.address || '',
          social_media: data.contact?.social_media || {
            linkedin: data.contact?.social_media?.linkedin || '',
            facebook: data.contact?.social_media?.facebook || '',
            instagram: data.contact?.social_media?.instagram || '',
            twitter: data.contact?.social_media?.twitter || '',
            youtube: data.contact?.social_media?.youtube || ''
          }
        },
        categories: (categories || []).map((cat: any) => ({
          name: cat.name || '',
          description: cat.description || '',
          products: (cat.products || []).map((prod: any) => ({
            name: prod.name || '',
            description: prod.description || '',
            hsn_code: prod.hsn_code || '',
            image_url: prod.image_url || '',
            specifications: prod.specifications || {},
            key_benefits: prod.key_benefits || []
          }))
        })),
        export_countries: cleanExportCountries,
        certifications: (certifications || []).map((cert: any) => ({
          name: cert.name || '',
          certificate_url: cert.certificate_url || '',
          verification_url: cert.verification_url || '',
          authority: cert.authority || ''
        })),
        team_members: (teamMembers || []).map((member: any) => ({
          name: member.name || '',
          designation: member.designation || '',
          image: member.image || ''
        }))
      }

      // Parse website_config if it's a JSON string, otherwise use as-is
      let websiteConfig = data.website_config
      if (typeof websiteConfig === 'string') {
        try {
          websiteConfig = JSON.parse(websiteConfig)
        } catch (e) {
          websiteConfig = null
        }
      }
      
      // Ensure website_config has proper structure with all required fields
      // Merge with defaults if missing or incomplete
      const defaultWebsiteConfig = {
        seo_enabled: true,
        email_config: {
          smtp_user: cleanBusinessInfo.contact.email,
          smtp_password: ''
        },
        design_preferences: {
          website_type: 'export',
          theme: 'professional',
          primary_color: '#0d9488',
          secondary_color: '#10b981',
          style: 'professional'
        },
        pages: {
          home: {
            enabled_sections: {
              hero_carousel: true,
              company_intro: true,
              how_we_work: true,
              stats_counter: false,
              product_categories: true,
              featured_products: true,
              why_choose_us: true,
              global_presence: true,
              testimonials: false,
              cta_banner: true
            }
          },
          about: {
            enabled_sections: {
              overview: true,
              mission_vision: true,
              milestones: true,
              memberships: false,
              sustainability: false,
              team: true
            }
          },
          products: {
            enabled_sections: {
              category_filter: true,
              overview: false,
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
              office_hours: false,
              faq: true
            }
          }
        },
        language: 'en',
        currency: 'USD'
      }

      // Deep merge websiteConfig with defaults (user values override defaults)
      const finalWebsiteConfig = websiteConfig ? {
        seo_enabled: websiteConfig.seo_enabled !== undefined ? websiteConfig.seo_enabled : defaultWebsiteConfig.seo_enabled,
        email_config: {
          smtp_user: websiteConfig.email_config?.smtp_user || defaultWebsiteConfig.email_config.smtp_user,
          smtp_password: websiteConfig.email_config?.smtp_password || defaultWebsiteConfig.email_config.smtp_password
        },
        design_preferences: {
          website_type: websiteConfig.design_preferences?.website_type || defaultWebsiteConfig.design_preferences.website_type,
          theme: websiteConfig.design_preferences?.theme || defaultWebsiteConfig.design_preferences.theme,
          primary_color: websiteConfig.design_preferences?.primary_color || defaultWebsiteConfig.design_preferences.primary_color,
          secondary_color: websiteConfig.design_preferences?.secondary_color || defaultWebsiteConfig.design_preferences.secondary_color,
          style: websiteConfig.design_preferences?.style || defaultWebsiteConfig.design_preferences.style
        },
        pages: websiteConfig.pages || defaultWebsiteConfig.pages,
        language: websiteConfig.language || defaultWebsiteConfig.language,
        currency: websiteConfig.currency || defaultWebsiteConfig.currency
      } : defaultWebsiteConfig

      console.log('🎨 Final website config:', finalWebsiteConfig)
      console.log('📦 Clean business info:', cleanBusinessInfo)

      // Create job
      const response = await apiClient.createJob({
        business_info: cleanBusinessInfo,
        website_config: finalWebsiteConfig
      })

      if (response.job_id) {
        toast.success('Website generation started!', {
          description: 'Redirecting to progress page...'
        })

        // Redirect to progress page
        setTimeout(() => {
          router.push(`/jobs/${response.job_id}/progress`)
        }, 1000)
      }
    } catch (error: any) {
      console.error('Failed to generate website:', error)
      toast.error('Failed to start website generation', {
        description: error?.message || 'Please try again'
      })
      setIsGenerating(false)
    }
  }

  // Auto-scroll to bottom when new messages arrive or when scrollToBottom is triggered
  useEffect(() => {
    if (uiState.scrollToBottom || messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, uiState.scrollToBottom])

  // Show empty chat area while initializing - global loader is visible
  if (uiState.isLoading && messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-gray-50 to-white" />
    )
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto px-4 py-6 bg-gradient-to-b from-gray-50 to-white"
      role="log"
      aria-label="Chat conversation"
      aria-live="polite"
      aria-atomic="false"
    >
      <div className="max-w-4xl mx-auto">
        {/* Messages */}
        {messages.map((message, index) => (
          <Message
            key={message.id}
            message={message}
            isLatest={index === messages.length - 1}
          />
        ))}

        {/* Final Review Section */}
        {isInReviewSection && (
          <ReviewAllData
            data={collectedData}
            onEdit={jumpToField}
            onConfirm={handleGenerateWebsite}
            isGenerating={isGenerating}
          />
        )}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />

        {/* Empty state */}
        {messages.length === 0 && !uiState.isLoading && (
          <div className="text-center py-12">
            <div className="inline-block p-4 bg-teal-100 rounded-full mb-4">
              <svg
                className="w-12 h-12 text-teal-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Let's Get Started!
            </h3>
            <p className="text-gray-600">
              Your AI assistant is ready to help you create your website.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}