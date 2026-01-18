'use client'

import { useEffect, useRef, useState } from 'react'
import { Message } from './Message'
import { ReviewAllData } from './ReviewAllData'
import { useChat } from '@/lib/chat-context'
import { Loader2 } from 'lucide-react'
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
      const cleanBusinessInfo: any = {
        company_name: collectedData.company_name || '',
        company_type: collectedData.company_type || '',
        description: collectedData.description || '',
        logo_url: collectedData.logo_url || '',
        contact: {
          email: collectedData.contact?.email || collectedData.email || '',
          phone: collectedData.contact?.phone || collectedData.phone || '',
          whatsapp: collectedData.contact?.whatsapp || collectedData.whatsapp || '',
          address: collectedData.contact?.address || '',
          social_media: collectedData.contact?.social_media || {
            linkedin: '',
            facebook: '',
            instagram: '',
            twitter: '',
            youtube: ''
          }
        },
        categories: collectedData.categories || [],
        export_countries: (collectedData.export_countries || []).map((country: any) => ({
          country_name: country.label || country.country_name || '',
          flag_url: country.flag_url || ''
        })),
        certifications: collectedData.certifications || [],
        team_members: collectedData.team_members || []
      }

      // Use website config from backend (smart defaults or user customized)
      const websiteConfig = collectedData.website_config || {
        // Fallback config if somehow not generated
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

      console.log('🎨 Using website config:', websiteConfig)

      // Create job
      const response = await apiClient.createJob({
        business_info: cleanBusinessInfo,
        website_config: websiteConfig
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

  if (uiState.isLoading && messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-teal-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Starting conversation...</p>
        </div>
      </div>
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