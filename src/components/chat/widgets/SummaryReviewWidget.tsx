'use client'

/**
 * Summary Review Widget
 * Shows section summary with read-only fields and individual edit buttons
 */

import { useState, useEffect } from 'react'
import { ArrowRight, Loader2, Building2, Mail, Phone, Package, Globe, Edit2, Check, X, Folder, ShoppingBag, Sparkles, RefreshCw, FileText, Users, Palette } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useChat } from '@/lib/chat-context'
import { ImageUploadWidget } from './ImageUploadWidget'
import { MultiSelectWidget } from './MultiSelectWidget'
import { toast } from 'sonner'

interface SummaryReviewWidgetProps {
  field: string
  config?: {
    section: 'business_info' | 'contact' | 'products' | 'export_countries' | 'certification' | 'certifications' | 'category' | 'product' | 'team_member' | 'design_config'
    title: string
    next_section: string
  }
  onComplete: (value: string) => void
  disabled?: boolean
}

export function SummaryReviewWidget({
  field,
  config = { section: 'business_info', title: 'Business Information', next_section: 'Contact Details' },
  onComplete,
  disabled = false,
}: SummaryReviewWidgetProps) {
  const { collectedData } = useChat()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<any>({})
  const [editingField, setEditingField] = useState<string | null>(null)

  // AI Description states
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)
  const [showAIOptions, setShowAIOptions] = useState(false)

  // Initialize form data from collected data
  useEffect(() => {
    console.log('📊 SummaryReviewWidget - Section:', config.section)
    console.log('📊 SummaryReviewWidget - collectedData:', collectedData)

    if (config.section === 'business_info') {
      setFormData({
        company_name: collectedData.company_name || '',
        company_type: collectedData.company_type || '',
        description: collectedData.description || '',
        logo_url: collectedData.logo_url || ''
      })
    } else if (config.section === 'contact') {
      setFormData({
        email: collectedData.contact?.email || collectedData.email || '',
        phone: collectedData.contact?.phone || collectedData.phone || '',
        whatsapp: collectedData.contact?.whatsapp || collectedData.whatsapp || ''
      })
    } else if (config.section === 'category') {
      setFormData({
        category_name: collectedData.category_name || '',
        category_description: collectedData.category_description || ''
      })
    } else if (config.section === 'product') {
      setFormData({
        product_name: collectedData.product_name || '',
        product_description: collectedData.product_description || '',
        product_image_url: collectedData.product_image_url || ''
      })
    } else if (config.section === 'certification') {
      setFormData({
        certification_name: collectedData.certification_name || '',
        certification_issuing_authority: collectedData.certification_issuing_authority || '',
        certification_description: collectedData.certification_description || ''
      })
    } else if (config.section === 'team_member') {
      const teamMemberData = {
        team_member_name: collectedData.team_member_name || '',
        team_member_designation: collectedData.team_member_designation || '',
        team_member_image: collectedData.team_member_image || ''
      }
      console.log('👥 Team member formData:', teamMemberData)
      setFormData(teamMemberData)
    } else if (config.section === 'export_countries') {
      setFormData({
        export_countries: collectedData.export_countries || []
      })
    } else if (config.section === 'design_config') {
      setFormData({
        website_config: collectedData.website_config || {
          design_preferences: {
            website_type: 'export',
            theme: 'professional',
            primary_color: '#0d9488',
            secondary_color: '#10b981',
            style: 'professional'
          }
        }
      })
    }
  }, [collectedData, config.section])

  const handleSaveAndContinue = () => {
    if (isSubmitting) return // Prevent double submission

    setIsSubmitting(true)
    setEditingField(null)

    // Return the updated data as JSON string
    onComplete(JSON.stringify(formData))

    // Reset submitting state after a short delay (widget will be disabled anyway)
    setTimeout(() => {
      setIsSubmitting(false)
    }, 1000)
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value
    }))
  }

  const toggleEdit = (field: string) => {
    if (editingField === field) {
      setEditingField(null)
    } else {
      setEditingField(field)
    }
  }

  const cancelEdit = (field: string) => {
    // Reset to original value
    if (config.section === 'business_info') {
      setFormData((prev: any) => ({
        ...prev,
        [field]: collectedData[field as keyof typeof collectedData] || ''
      }))
    } else if (config.section === 'contact') {
      const originalValue = collectedData.contact?.[field as keyof typeof collectedData.contact] || collectedData[field as keyof typeof collectedData] || ''
      setFormData((prev: any) => ({
        ...prev,
        [field]: originalValue
      }))
    }
    setEditingField(null)
    setShowAIOptions(false)
  }

  const handleGenerateAI = async (fieldName: string, contextType: 'company' | 'category' | 'product') => {
    try {
      setIsGeneratingAI(true)

      // Get auth token
      const token = localStorage.getItem('access_token')

      // Determine context data based on field
      let contextData: any = {}
      if (contextType === 'category') {
        contextData = { category_name: formData.category_name }
      } else if (contextType === 'product') {
        contextData = { product_name: formData.product_name }
      } else if (contextType === 'company') {
        contextData = {
          company_name: formData.company_name,
          company_type: formData.company_type
        }
      }

      // Call AI description API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/ai-assistant/description/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          operation: 'auto-generate',
          field_type: contextType,
          current_text: '',
          context: contextData,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate description')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6))
                if (data.text) {
                  accumulated += data.text
                  handleChange(fieldName, accumulated)
                }
              } catch (e) {
                // Ignore JSON parse errors
              }
            }
          }
        }
      }

      toast.success('Description generated!')
      setShowAIOptions(false)
    } catch (error: any) {
      console.error('AI generation error:', error)
      toast.error('Failed to generate description', {
        description: error?.message || 'Please try again'
      })
    } finally {
      setIsGeneratingAI(false)
    }
  }

  const handleRegenerateAI = (fieldName: string, contextType: 'company' | 'category' | 'product') => {
    handleChange(fieldName, '')
    handleGenerateAI(fieldName, contextType)
  }

  // Render field with read-only/edit toggle
  const renderField = (
    fieldName: string,
    label: string,
    type: 'text' | 'textarea' = 'text',
    required: boolean = false
  ) => {
    const isEditing = editingField === fieldName
    const value = formData[fieldName] || ''

    // Check if this is a description field that supports AI generation
    const isDescriptionField = fieldName.includes('description')
    const canUseAI = isDescriptionField && type === 'textarea'

    // Determine context type for AI generation
    let aiContextType: 'company' | 'category' | 'product' = 'company'
    if (config.section === 'category') aiContextType = 'category'
    else if (config.section === 'product') aiContextType = 'product'
    else if (config.section === 'certification') aiContextType = 'certification'
    else if (config.section === 'business_info') aiContextType = 'company'

    return (
      <div className="group">
        <div className="flex items-center justify-between mb-1">
          <label className="text-sm font-medium text-gray-700">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
          {!isEditing ? (
            <button
              onClick={() => {
                toggleEdit(fieldName)
                if (canUseAI && !value) {
                  setShowAIOptions(true)
                }
              }}
              disabled={disabled}
              className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded-md transition-colors"
            >
              <Edit2 className="w-3 h-3" />
              Edit
            </button>
          ) : (
            <div className="flex gap-1">
              <button
                onClick={() => {
                  setEditingField(null)
                  setShowAIOptions(false)
                }}
                className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-600 hover:text-green-700 hover:bg-green-50 rounded-md transition-colors"
              >
                <Check className="w-3 h-3" />
                Done
              </button>
              <button
                onClick={() => cancelEdit(fieldName)}
                className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {isEditing ? (
          <>
            {/* AI Options for description fields */}
            {canUseAI && !value && showAIOptions && !isGeneratingAI && (
              <div className="mb-3 p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg border-2 border-purple-200 space-y-3">
                <div className="flex items-center gap-2 text-sm text-purple-700 font-medium">
                  <Sparkles className="w-4 h-4" />
                  AI Description Assistant
                </div>
                <p className="text-sm text-gray-700">
                  Let AI write a professional description for you, or write your own.
                </p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={() => handleGenerateAI(fieldName, aiContextType)}
                    disabled={disabled}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold text-sm"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate with AI
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setShowAIOptions(false)}
                    disabled={disabled}
                    variant="outline"
                    className="border-2 border-purple-300 text-purple-700 hover:bg-purple-50 text-sm"
                  >
                    Write Manually
                  </Button>
                </div>
              </div>
            )}

            {/* Generating State - replaces textarea during generation */}
            {canUseAI && isGeneratingAI ? (
              <div className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg border-2 border-purple-200 space-y-3">
                <div className="flex items-center justify-center py-4">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-3" />
                    <p className="text-sm text-purple-700 font-medium">
                      AI is writing your description...
                    </p>
                  </div>
                </div>

                {/* Live preview */}
                {value && (
                  <div className="bg-white rounded-lg p-4 border border-purple-200 min-h-[100px]">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {value}
                      <span className="inline-block w-2 h-4 bg-purple-600 animate-pulse ml-1" />
                    </p>
                  </div>
                )}
              </div>
            ) : type === 'textarea' ? (
              /* Textarea - only shown when NOT generating */
              <div className="space-y-2">
                <Textarea
                  value={value}
                  onChange={(e) => handleChange(fieldName, e.target.value)}
                  placeholder={`Enter ${label.toLowerCase()}`}
                  className="border-2 border-teal-500 focus:border-teal-600 min-h-[100px]"
                  autoFocus={!showAIOptions}
                />

                {/* Regenerate button for descriptions with content */}
                {canUseAI && value && (
                  <Button
                    type="button"
                    onClick={() => handleRegenerateAI(fieldName, aiContextType)}
                    disabled={disabled}
                    variant="outline"
                    size="sm"
                    className="border-2 border-purple-300 text-purple-700 hover:bg-purple-50"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Regenerate with AI
                  </Button>
                )}
              </div>
            ) : (
              /* Regular input for non-textarea fields */
              <Input
                value={value}
                onChange={(e) => handleChange(fieldName, e.target.value)}
                placeholder={`Enter ${label.toLowerCase()}`}
                className="border-2 border-teal-500 focus:border-teal-600"
                autoFocus
              />
            )}
          </>
        ) : (
          <div className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-900 min-h-[42px] flex items-center">
            {value || <span className="text-gray-400">Not provided</span>}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="mt-4 space-y-4">
      {/* Review Summary Card */}
      <div className="bg-gradient-to-br from-white to-teal-50/30 rounded-xl border-2 border-teal-200 shadow-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          {config.section === 'business_info' && <Building2 className="w-5 h-5 text-teal-600" />}
          {config.section === 'contact' && <Mail className="w-5 h-5 text-teal-600" />}
          {config.section === 'category' && <Folder className="w-5 h-5 text-teal-600" />}
          {config.section === 'product' && <ShoppingBag className="w-5 h-5 text-teal-600" />}
          {config.section === 'products' && <Package className="w-5 h-5 text-teal-600" />}
          {config.section === 'export_countries' && <Globe className="w-5 h-5 text-teal-600" />}
          {config.section === 'certification' && <FileText className="w-5 h-5 text-teal-600" />}
          {config.section === 'certifications' && <FileText className="w-5 h-5 text-teal-600" />}
          {config.section === 'team_member' && <Users className="w-5 h-5 text-teal-600" />}
          {config.section === 'design_config' && <Palette className="w-5 h-5 text-teal-600" />}
          <h3 className="text-lg font-bold text-gray-900">{config.title}</h3>
        </div>

        <div className="space-y-4">
          {/* Business Info Fields */}
          {config.section === 'business_info' && (
            <>
              {renderField('company_name', 'Company Name', 'text', true)}
              {renderField('company_type', 'Business Type', 'text', true)}
              {renderField('description', 'Description', 'textarea', true)}

              {/* Logo Display */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium text-gray-700">
                    Logo
                  </label>
                  {!editingField || editingField !== 'logo_url' ? (
                    <button
                      onClick={() => toggleEdit('logo_url')}
                      disabled={disabled}
                      className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded-md transition-colors"
                    >
                      <Edit2 className="w-3 h-3" />
                      {formData.logo_url ? 'Change' : 'Upload'}
                    </button>
                  ) : (
                    <button
                      onClick={() => setEditingField(null)}
                      className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-600 hover:text-green-700 hover:bg-green-50 rounded-md transition-colors"
                    >
                      <Check className="w-3 h-3" />
                      Done
                    </button>
                  )}
                </div>

                {editingField === 'logo_url' ? (
                  <ImageUploadWidget
                    field="logo_url"
                    config={{
                      accept: 'image/*',
                      maxSize: 5242880,
                      label: 'Upload Company Logo'
                    }}
                    onComplete={(url) => {
                      handleChange('logo_url', url)
                      setEditingField(null)
                    }}
                    disabled={disabled}
                  />
                ) : formData.logo_url ? (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <img
                      src={formData.logo_url}
                      alt="Company Logo"
                      className="w-16 h-16 object-contain rounded-lg border border-gray-200 bg-white"
                      onError={(e) => {
                        console.error('Logo load error:', formData.logo_url)
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                    <span className="text-sm text-green-600 font-medium">✅ Logo uploaded</span>
                  </div>
                ) : (
                  <div className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-400 min-h-[42px] flex items-center">
                    No logo uploaded
                  </div>
                )}
              </div>
            </>
          )}

          {/* Contact Fields */}
          {config.section === 'contact' && (
            <>
              {renderField('email', 'Email Address', 'text', true)}
              {renderField('phone', 'Phone Number', 'text', true)}
              {renderField('whatsapp', 'WhatsApp Number', 'text', false)}
            </>
          )}

          {/* Category Fields */}
          {config.section === 'category' && (
            <>
              {renderField('category_name', 'Category Name', 'text', true)}
              {renderField('category_description', 'Description', 'textarea', false)}
            </>
          )}

          {/* Product Fields */}
          {config.section === 'product' && (
            <>
              {renderField('product_name', 'Product Name', 'text', true)}
              {renderField('product_description', 'Description', 'textarea', true)}

              {/* Product Image */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium text-gray-700">
                    Product Image
                  </label>
                  {!editingField || editingField !== 'product_image_url' ? (
                    <button
                      onClick={() => toggleEdit('product_image_url')}
                      disabled={disabled}
                      className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded-md transition-colors"
                    >
                      <Edit2 className="w-3 h-3" />
                      {formData.product_image_url ? 'Change' : 'Upload'}
                    </button>
                  ) : (
                    <button
                      onClick={() => setEditingField(null)}
                      className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-600 hover:text-green-700 hover:bg-green-50 rounded-md transition-colors"
                    >
                      <Check className="w-3 h-3" />
                      Done
                    </button>
                  )}
                </div>

                {editingField === 'product_image_url' ? (
                  <ImageUploadWidget
                    field="product_image_url"
                    config={{
                      accept: 'image/*',
                      maxSize: 5242880,
                      label: 'Upload Product Image'
                    }}
                    onComplete={(url) => {
                      handleChange('product_image_url', url)
                      setEditingField(null)
                    }}
                    disabled={disabled}
                  />
                ) : formData.product_image_url ? (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <img
                      src={formData.product_image_url}
                      alt="Product"
                      className="w-16 h-16 object-contain rounded-lg border border-gray-200 bg-white"
                      onError={(e) => {
                        console.error('Product image load error:', formData.product_image_url)
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                    <span className="text-sm text-green-600 font-medium">✅ Image uploaded</span>
                  </div>
                ) : (
                  <div className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-400 min-h-[42px] flex items-center">
                    No image uploaded
                  </div>
                )}
              </div>
            </>
          )}

          {/* Certification Fields */}
          {config.section === 'certification' && (
            <>
              {renderField('certification_name', 'Certification Name', 'text', true)}
              {renderField('certification_issuing_authority', 'Issuing Authority', 'text', false)}
              {renderField('certification_description', 'Description', 'textarea', false)}
            </>
          )}

          {/* Team Member Fields */}
          {config.section === 'team_member' && (
            <>
              {renderField('team_member_name', 'Member Name', 'text', true)}
              {renderField('team_member_designation', 'Designation', 'text', true)}

              {/* Team Member Image Display */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium text-gray-700">
                    Team Member Photo
                  </label>
                  {!editingField || editingField !== 'team_member_image' ? (
                    <button
                      onClick={() => toggleEdit('team_member_image')}
                      disabled={disabled}
                      className="text-xs text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
                    >
                      <Edit2 className="w-3 h-3" />
                      Edit
                    </button>
                  ) : null}
                </div>
                {editingField === 'team_member_image' ? (
                  <ImageUploadWidget
                    field="team_member_image"
                    config={{
                      accept: 'image/*',
                      maxSize: 2097152, // 2MB
                      label: 'Upload Team Member Photo'
                    }}
                    onComplete={(url) => {
                      handleChange('team_member_image', url)
                      setEditingField(null)
                    }}
                    disabled={disabled}
                  />
                ) : formData.team_member_image ? (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <img
                      src={formData.team_member_image}
                      alt="Team member"
                      className="w-16 h-16 object-cover rounded-lg border border-gray-200 bg-white"
                      onError={(e) => {
                        console.error('Team member image load error:', formData.team_member_image)
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                    <span className="text-sm text-green-600 font-medium">✅ Image uploaded</span>
                  </div>
                ) : (
                  <div className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-400 min-h-[42px] flex items-center">
                    No image uploaded
                  </div>
                )}
              </div>
            </>
          )}

          {/* Products Summary - All Categories and Products */}
          {config.section === 'products' && (
            <div className="space-y-4">
              {collectedData.categories && Array.isArray(collectedData.categories) && collectedData.categories.length > 0 ? (
                collectedData.categories.map((category: any, catIndex: number) => (
                  <div key={catIndex} className="bg-white rounded-lg border-2 border-gray-200 p-4">
                    {/* Category Header */}
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200">
                      <Folder className="w-5 h-5 text-teal-600" />
                      <h4 className="font-semibold text-gray-900">{category.name}</h4>
                    </div>

                    {/* Category Description */}
                    {category.description && (
                      <p className="text-sm text-gray-600 mb-3">{category.description}</p>
                    )}

                    {/* Products in this Category */}
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-gray-500 uppercase">Products:</p>
                      {category.products && category.products.length > 0 ? (
                        <div className="space-y-2">
                          {category.products.map((product: any, prodIndex: number) => (
                            <div key={prodIndex} className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg">
                              <ShoppingBag className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900">{product.name}</p>
                                {product.description && (
                                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">{product.description}</p>
                                )}
                                {product.image_url && (
                                  <span className="text-xs text-green-600 mt-1 inline-block">✓ Has image</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400 italic">No products added yet</p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No categories or products added yet</p>
                </div>
              )}
            </div>
          )}

          {/* Export Countries Summary */}
          {config.section === 'export_countries' && (
            <div className="space-y-4">
              {/* Edit button */}
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">
                  Export Countries ({formData.export_countries?.length || 0} selected)
                </label>
                {!editingField || editingField !== 'export_countries' ? (
                  <button
                    onClick={() => toggleEdit('export_countries')}
                    disabled={disabled}
                    className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded-md transition-colors"
                  >
                    <Edit2 className="w-3 h-3" />
                    Edit
                  </button>
                ) : (
                  <button
                    onClick={() => setEditingField(null)}
                    className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-600 hover:text-green-700 hover:bg-green-50 rounded-md transition-colors"
                  >
                    <Check className="w-3 h-3" />
                    Done
                  </button>
                )}
              </div>

              {/* Editing Mode - Show MultiSelectWidget */}
              {editingField === 'export_countries' ? (
                <MultiSelectWidget
                  field="export_countries"
                  config={{
                    placeholder: "Search countries...",
                    label: "Select Export Countries",
                    initialValues: formData.export_countries || []
                  }}
                  onComplete={(selectedCountries) => {
                    handleChange('export_countries', selectedCountries)
                    setEditingField(null)
                  }}
                  disabled={disabled}
                />
              ) : (
                /* Display Mode - Show selected countries */
                <>
                  {formData.export_countries && Array.isArray(formData.export_countries) && formData.export_countries.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {formData.export_countries.map((country: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-2 px-3 py-2 bg-teal-50 border border-teal-200 rounded-lg">
                          {country.flag_url && (
                            <img src={country.flag_url} alt={country.label || country.country_name} className="w-6 h-4 object-cover rounded-sm" />
                          )}
                          <span className="text-sm font-medium text-gray-700">{country.label || country.country_name}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <Globe className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No export countries selected</p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Certifications Summary */}
          {config.section === 'certifications' && (
            <div className="space-y-4">
              {collectedData.certifications && Array.isArray(collectedData.certifications) && collectedData.certifications.length > 0 ? (
                <div className="space-y-2">
                  {collectedData.certifications.map((cert: any, idx: number) => (
                    <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-sm font-medium text-gray-900">{cert.name}</p>
                      {cert.authority && <p className="text-xs text-gray-600 mt-1">Issued by: {cert.authority}</p>}
                      {cert.description && <p className="text-xs text-gray-500 mt-1">{cert.description}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No certifications added</p>
                </div>
              )}
            </div>
          )}

          {/* Design Configuration Summary */}
          {config.section === 'design_config' && (
            <div className="space-y-4">
              {formData.website_config?.design_preferences ? (
                <>
                  {/* Theme */}
                  <div className="bg-white rounded-lg border-2 border-gray-200 p-4">
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Selected Theme</label>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-16 h-16 rounded-lg border-2 border-gray-200"
                        style={{
                          background: `linear-gradient(135deg, ${formData.website_config.design_preferences.primary_color} 0%, ${formData.website_config.design_preferences.primary_color}dd 100%)`
                        }}
                      />
                      <div>
                        <p className="text-base font-semibold text-gray-900 capitalize">
                          {formData.website_config.design_preferences.theme || 'Professional'}
                        </p>
                        <p className="text-xs text-gray-500 capitalize">
                          {formData.website_config.design_preferences.website_type || 'Export'} Website
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Color Scheme */}
                  <div className="bg-white rounded-lg border-2 border-gray-200 p-4">
                    <label className="text-sm font-medium text-gray-700 mb-3 block">Color Scheme</label>
                    <div className="grid grid-cols-2 gap-3">
                      {/* Primary Color */}
                      <div>
                        <p className="text-xs text-gray-500 mb-2">Primary Color</p>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-10 h-10 rounded-lg border-2 border-gray-200"
                            style={{ backgroundColor: formData.website_config.design_preferences.primary_color }}
                          />
                          <span className="text-xs font-mono text-gray-600">
                            {formData.website_config.design_preferences.primary_color}
                          </span>
                        </div>
                      </div>

                      {/* Secondary Color */}
                      <div>
                        <p className="text-xs text-gray-500 mb-2">Secondary Color</p>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-10 h-10 rounded-lg border-2 border-gray-200"
                            style={{ backgroundColor: formData.website_config.design_preferences.secondary_color }}
                          />
                          <span className="text-xs font-mono text-gray-600">
                            {formData.website_config.design_preferences.secondary_color}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Website Features */}
                  <div className="bg-white rounded-lg border-2 border-gray-200 p-4">
                    <label className="text-sm font-medium text-gray-700 mb-3 block">Enabled Features</label>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {formData.website_config.seo_enabled && (
                        <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                          <Check className="w-3 h-3 text-green-600" />
                          <span className="text-gray-700">SEO Optimization</span>
                        </div>
                      )}
                      {formData.website_config.pages?.home?.enabled_sections?.hero_carousel && (
                        <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                          <Check className="w-3 h-3 text-green-600" />
                          <span className="text-gray-700">Hero Carousel</span>
                        </div>
                      )}
                      {formData.website_config.pages?.home?.enabled_sections?.product_categories && (
                        <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                          <Check className="w-3 h-3 text-green-600" />
                          <span className="text-gray-700">Product Showcase</span>
                        </div>
                      )}
                      {formData.website_config.pages?.about?.enabled_sections?.team && (
                        <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                          <Check className="w-3 h-3 text-green-600" />
                          <span className="text-gray-700">Team Section</span>
                        </div>
                      )}
                      {formData.website_config.pages?.contact?.enabled_sections?.contact_form && (
                        <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                          <Check className="w-3 h-3 text-green-600" />
                          <span className="text-gray-700">Contact Form</span>
                        </div>
                      )}
                      {formData.website_config.pages?.home?.enabled_sections?.global_presence && (
                        <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                          <Check className="w-3 h-3 text-green-600" />
                          <span className="text-gray-700">Global Presence</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Info Message */}
                  <div className="bg-teal-50 border border-teal-200 rounded-lg p-3">
                    <p className="text-xs text-teal-800">
                      <Sparkles className="w-4 h-4 inline mr-1" />
                      This configuration was automatically optimized based on your business type and collected information.
                    </p>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Palette className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No design configuration available</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Save & Continue Button */}
      <Button
        onClick={handleSaveAndContinue}
        disabled={disabled || isSubmitting}
        className="w-full h-14 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-semibold text-base transition-all hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting && !disabled ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            Save & Continue to {config.next_section}
            <ArrowRight className="w-5 h-5 ml-2" />
          </>
        )}
      </Button>

      {/* Helper Text */}
      <p className="text-xs text-center text-gray-500">
        Click "Edit" next to any field to make changes, then "Save & Continue" when ready
      </p>
    </div>
  )
}