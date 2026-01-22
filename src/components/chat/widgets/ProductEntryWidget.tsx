'use client'

/**
 * Product Entry Widget for Chat
 * Mini-form for adding products within the chat interface
 */

import { useState, useRef } from 'react'
import { Package, Upload, Check, Loader2, X, Sparkles, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api-client'

interface ProductData {
  name: string
  description: string
  hsn_code?: string
  image_url?: string
  specifications?: {
    grade?: string
    origin?: string
    color?: string
    purity?: string
    moisture_content?: string
    shelf_life?: string
    moq?: string
    lead_time?: string
  }
  key_benefits?: string[]
}

interface ProductEntryWidgetProps {
  field: string
  config?: {
    label?: string
    required_fields?: string[]
    show_specifications?: boolean
    show_benefits?: boolean
  }
  onComplete: (product: ProductData) => void
  disabled?: boolean
}

export function ProductEntryWidget({
  field,
  config = {},
  onComplete,
  disabled = false,
}: ProductEntryWidgetProps) {
  const [formData, setFormData] = useState<ProductData>({
    name: '',
    description: '',
    hsn_code: '',
    image_url: '',
    specifications: {
      grade: '',
      origin: '',
      color: '',
      purity: '',
      moisture_content: '',
      shelf_life: '',
      moq: '',
      lead_time: '',
    },
    key_benefits: [''],
  })

  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // AI Description states
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)
  const [showDescriptionTextarea, setShowDescriptionTextarea] = useState(false)

  const label = config.label || 'Add Product'
  const requiredFields = config.required_fields || ['name', 'description']
  const showSpecifications = config.show_specifications !== false
  const showBenefits = config.show_benefits !== false

  const handleChange = (field: keyof ProductData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSpecChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        [field]: value,
      },
    }))
  }

  const handleBenefitChange = (index: number, value: string) => {
    setFormData(prev => {
      const newBenefits = [...(prev.key_benefits || [])]
      newBenefits[index] = value
      return {
        ...prev,
        key_benefits: newBenefits,
      }
    })
  }

  const handleAddBenefit = () => {
    setFormData(prev => ({
      ...prev,
      key_benefits: [...(prev.key_benefits || []), ''],
    }))
  }

  const handleRemoveBenefit = (index: number) => {
    setFormData(prev => ({
      ...prev,
      key_benefits: (prev.key_benefits || []).filter((_, i) => i !== index),
    }))
  }

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('🖼️ Product image select triggered')
    const file = e.target.files?.[0]
    if (!file) {
      console.log('❌ No file selected')
      return
    }

    console.log('📁 File selected:', file.name, file.type, file.size)

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB')
      return
    }

    try {
      setUploading(true)
      console.log('⬆️ Starting upload...')

      // Show preview
      const reader = new FileReader()
      reader.onload = (e) => {
        const preview = e.target?.result as string
        console.log('👁️ Preview generated:', preview?.substring(0, 50) + '...')
        setPreview(preview)
      }
      reader.readAsDataURL(file)

      // Upload via backend
      console.log('☁️ Uploading image...')
      const url = await apiClient.uploadImage(file, 'products')
      console.log('✅ Upload complete. URL:', url)

      handleChange('image_url', url)
      console.log('💾 Updated formData.image_url')
      toast.success('Image uploaded successfully!')
    } catch (error: any) {
      console.error('❌ Upload error:', error)
      toast.error(error?.message || 'Failed to upload image')
      setPreview(null)
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveImage = () => {
    handleChange('image_url', '')
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleGenerateAI = async () => {
    try {
      setIsGeneratingAI(true)

      // Get JWT token from localStorage
      const token = localStorage.getItem('access_token')
      if (!token) {
        throw new Error('Not authenticated')
      }

      // Call AI description API for product
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/ai-assistant/description/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          operation: 'auto-generate',
          field_type: 'product',
          current_text: '',
          context: { product_name: formData.name },
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
                  handleChange('description', accumulated)
                }
                if (data.done) {
                  setShowDescriptionTextarea(true)
                }
              } catch (e) {
                // Ignore JSON parse errors
              }
            }
          }
        }
      }

      toast.success('Description generated!')
    } catch (error: any) {
      console.error('AI generation error:', error)
      toast.error('Failed to generate description', {
        description: error?.message || 'Please try again'
      })
      setShowDescriptionTextarea(true)
    } finally {
      setIsGeneratingAI(false)
    }
  }

  const handleRegenerateAI = () => {
    handleChange('description', '')
    setShowDescriptionTextarea(false)
    handleGenerateAI()
  }

  const handleWriteManually = () => {
    setShowDescriptionTextarea(true)
  }

  const handleCancelDescription = () => {
    handleChange('description', '')
    setShowDescriptionTextarea(false)
  }

  const handleSubmit = () => {
    console.log('📝 Product submit - Current formData:', formData)

    // Validate required fields
    for (const field of requiredFields) {
      if (!formData[field as keyof ProductData]) {
        toast.error(`${field.replace('_', ' ')} is required`)
        return
      }
    }

    // Validate description length
    if (formData.description && formData.description.length < 30) {
      toast.error('Description must be at least 30 characters')
      return
    }

    // Filter out empty benefits
    const cleanedData = {
      ...formData,
      key_benefits: (formData.key_benefits || []).filter(b => b.trim() !== ''),
    }

    console.log('✅ Product submit - Sending data:', cleanedData)
    onComplete(cleanedData)
  }

  const isValid = requiredFields.every(field => {
    const value = formData[field as keyof ProductData]
    if (typeof value === 'string') {
      // Special validation for description field
      if (field === 'description') {
        return value.trim() !== '' && value.length >= 30
      }
      return value.trim() !== ''
    }
    return true
  })

  return (
    <div className="mt-3 p-4 bg-white rounded-lg border-2 border-gray-200 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 text-sm text-gray-700 font-medium pb-2 border-b border-gray-200">
        <Package className="w-4 h-4 text-teal-600" />
        {label}
      </div>

      {/* Basic Fields */}
      <div className="space-y-3">
        <div>
          <Label htmlFor="product-name" className="text-sm font-medium text-gray-700">
            Product Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="product-name"
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="e.g., Basmati Rice"
            disabled={disabled}
            className="mt-1"
          />
        </div>

        {/* AI-Powered Description Section */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            Description <span className="text-red-500">*</span>
          </Label>

          {/* Initial State - Choose AI or Manual */}
          {!formData.description && !showDescriptionTextarea && !isGeneratingAI && (
            <div className="p-4 bg-gradient-to-br from-teal-50 to-emerald-50 rounded-lg border-2 border-teal-200 space-y-3">
              <div className="flex items-center gap-2 text-sm text-teal-700 font-medium">
                <Sparkles className="w-4 h-4" />
                AI Description Assistant
              </div>
              <p className="text-sm text-gray-700">
                Let AI write a professional description for you, or write your own.
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={handleGenerateAI}
                  disabled={disabled || !formData.name}
                  className="flex-1 h-9 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-medium text-sm"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate with AI
                </Button>
                <Button
                  type="button"
                  onClick={handleWriteManually}
                  disabled={disabled}
                  variant="outline"
                  className="h-9 border border-teal-300 text-teal-700 hover:bg-teal-50 text-sm"
                >
                  Write Manually
                </Button>
              </div>
              {!formData.name && (
                <p className="text-xs text-amber-600">
                  Please enter product name first
                </p>
              )}
            </div>
          )}

          {/* Generating State */}
          {isGeneratingAI && (
            <div className="p-4 bg-gradient-to-br from-teal-50 to-emerald-50 rounded-lg border-2 border-teal-200 space-y-3">
              <div className="flex items-center justify-center py-4">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-teal-600 mx-auto mb-3" />
                  <p className="text-sm text-teal-700 font-medium">
                    AI is writing your description...
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    This may take a few seconds
                  </p>
                </div>
              </div>

              {/* Live preview of generation */}
              {formData.description && (
                <div className="bg-white rounded-lg p-4 border border-teal-200 min-h-[100px]">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {formData.description}
                    <span className="inline-block w-2 h-4 bg-teal-600 animate-pulse ml-1" />
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Textarea (Generated or Manual) */}
          {showDescriptionTextarea && !isGeneratingAI && (
            <div className="space-y-3">
              <Textarea
                id="product-description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Brief description of the product..."
                disabled={disabled}
                rows={6}
                maxLength={500}
                className="border-2 border-teal-200 focus:border-teal-500 transition-colors"
              />

              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">
                  {formData.description.length}/500 characters
                  {formData.description.length < 30 && (
                    <span className="text-amber-600 ml-2">
                      (minimum 30)
                    </span>
                  )}
                </span>
                {formData.description && (
                  <span className={formData.description.length >= 30 ? 'text-green-600' : 'text-gray-400'}>
                    {formData.description.length >= 30 ? '✓ Ready' : 'Too short'}
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                {formData.description && (
                  <Button
                    type="button"
                    onClick={handleRegenerateAI}
                    disabled={disabled}
                    variant="outline"
                    size="sm"
                    className="h-8 border border-teal-300 text-teal-700 hover:bg-teal-50 text-xs"
                  >
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Regenerate
                  </Button>
                )}
                <Button
                  type="button"
                  onClick={handleCancelDescription}
                  disabled={disabled}
                  variant="ghost"
                  size="sm"
                  className="h-8 text-gray-600 hover:bg-gray-100 text-xs"
                >
                  <X className="w-3 h-3 mr-1" />
                  Clear
                </Button>
              </div>
            </div>
          )}
        </div>

        <div>
          <Label htmlFor="product-hsn" className="text-sm font-medium text-gray-700">
            HSN Code
          </Label>
          <Input
            id="product-hsn"
            type="text"
            value={formData.hsn_code}
            onChange={(e) => handleChange('hsn_code', e.target.value)}
            placeholder="e.g., 1006"
            disabled={disabled}
            className="mt-1"
          />
        </div>
      </div>

      {/* Image Upload */}
      <div>
        <Label className="text-sm font-medium text-gray-700 mb-2 block">
          Product Image
        </Label>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          disabled={disabled || uploading}
          className="hidden"
        />

        {!formData.image_url && !preview ? (
          <Button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || uploading}
            variant="outline"
            className="w-full h-9 border-2 border-dashed border-gray-300 hover:border-teal-500 hover:bg-teal-50 text-sm"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Choose Image
              </>
            )}
          </Button>
        ) : (
          <div className="relative rounded-lg overflow-hidden border-2 border-gray-200">
            <img
              src={preview || formData.image_url || ''}
              alt="Product preview"
              className="w-full h-32 object-cover"
            />
            {formData.image_url && !disabled && (
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg hover:bg-red-600 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Specifications (collapsible) */}
      {showSpecifications && (
        <details className="border border-gray-200 rounded-lg">
          <summary className="px-3 py-2 cursor-pointer hover:bg-gray-50 text-sm font-medium text-gray-700">
            Specifications (Optional)
          </summary>
          <div className="p-3 space-y-2 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="text"
                value={formData.specifications?.grade || ''}
                onChange={(e) => handleSpecChange('grade', e.target.value)}
                placeholder="Grade"
                disabled={disabled}
                className="text-sm"
              />
              <Input
                type="text"
                value={formData.specifications?.origin || ''}
                onChange={(e) => handleSpecChange('origin', e.target.value)}
                placeholder="Origin"
                disabled={disabled}
                className="text-sm"
              />
              <Input
                type="text"
                value={formData.specifications?.purity || ''}
                onChange={(e) => handleSpecChange('purity', e.target.value)}
                placeholder="Purity"
                disabled={disabled}
                className="text-sm"
              />
              <Input
                type="text"
                value={formData.specifications?.moq || ''}
                onChange={(e) => handleSpecChange('moq', e.target.value)}
                placeholder="MOQ"
                disabled={disabled}
                className="text-sm"
              />
            </div>
          </div>
        </details>
      )}

      {/* Key Benefits (collapsible) */}
      {showBenefits && (
        <details className="border border-gray-200 rounded-lg">
          <summary className="px-3 py-2 cursor-pointer hover:bg-gray-50 text-sm font-medium text-gray-700">
            Key Benefits (Optional)
          </summary>
          <div className="p-3 space-y-2 border-t border-gray-200">
            {(formData.key_benefits || []).map((benefit, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  type="text"
                  value={benefit}
                  onChange={(e) => handleBenefitChange(index, e.target.value)}
                  placeholder={`Benefit ${index + 1}`}
                  disabled={disabled}
                  className="flex-1 text-sm"
                />
                {(formData.key_benefits || []).length > 1 && (
                  <Button
                    onClick={() => handleRemoveBenefit(index)}
                    disabled={disabled}
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:bg-red-50"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              onClick={handleAddBenefit}
              disabled={disabled}
              variant="outline"
              size="sm"
              className="w-full text-teal-600 hover:bg-teal-50"
            >
              + Add Benefit
            </Button>
          </div>
        </details>
      )}

      {/* Submit Button */}
      <Button
        onClick={handleSubmit}
        disabled={disabled || !isValid}
        className="w-full h-10 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-medium text-sm shadow-md"
      >
        <Check className="w-4 h-4 mr-2" />
        Add Product
      </Button>
    </div>
  )
}