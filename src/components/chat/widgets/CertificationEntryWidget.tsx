'use client'

/**
 * Certification Entry Widget
 * Form for adding certification details in chat
 */

import { useState } from 'react'
import { Check, FileText, Sparkles, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

interface CertificationData {
  name: string
  issuing_authority?: string
  description?: string
  certificate_image_url?: string
  certificate_pdf_url?: string
}

interface CertificationEntryWidgetProps {
  field: string
  config?: {
    label?: string
    required_fields?: string[]
  }
  onComplete: (certification: CertificationData) => void
  disabled?: boolean
}

export function CertificationEntryWidget({
  field,
  config = {},
  onComplete,
  disabled = false,
}: CertificationEntryWidgetProps) {
  const [formData, setFormData] = useState<CertificationData>({
    name: '',
    issuing_authority: '',
    description: '',
  })

  const [isGeneratingAI, setIsGeneratingAI] = useState(false)
  const [showDescriptionTextarea, setShowDescriptionTextarea] = useState(false)
  const [aiGeneratedDescription, setAiGeneratedDescription] = useState('')

  const requiredFields = config.required_fields || ['name']

  const handleChange = (field: keyof CertificationData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // AI Description Generation
  const handleGenerateAI = async () => {
    if (!formData.name) {
      toast.error('Please enter certification name first')
      return
    }

    try {
      setIsGeneratingAI(true)

      // Get JWT token from localStorage
      const token = localStorage.getItem('access_token')
      if (!token) {
        throw new Error('Not authenticated')
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ai-assistant/description/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          operation: 'auto-generate',
          field_type: 'certification',
          current_text: '',
          context: {
            cert_name: formData.name,
            issuing_authority: formData.issuing_authority,
          },
        }),
      })

      if (!response.ok) throw new Error('Failed to generate description')

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No reader available')

      let accumulated = ''
      const decoder = new TextDecoder()

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
                setAiGeneratedDescription(accumulated)
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }

      if (accumulated) {
        handleChange('description', accumulated)
        setShowDescriptionTextarea(true)
        toast.success('Description generated!')
      }
    } catch (error) {
      console.error('AI generation error:', error)
      toast.error('Failed to generate description')
      setShowDescriptionTextarea(true)
    } finally {
      setIsGeneratingAI(false)
      setAiGeneratedDescription('')
    }
  }

  const handleRegenerateAI = () => {
    handleChange('description', '')
    setShowDescriptionTextarea(false)
    setAiGeneratedDescription('')
    handleGenerateAI()
  }

  const handleWriteManually = () => {
    setShowDescriptionTextarea(true)
  }

  const handleSubmit = () => {
    // Validate required fields
    for (const field of requiredFields) {
      if (!formData[field as keyof CertificationData]) {
        toast.error(`${field} is required`)
        return
      }
    }

    // Clean up empty optional fields
    const cleanedData: CertificationData = { name: formData.name }
    if (formData.issuing_authority) cleanedData.issuing_authority = formData.issuing_authority
    if (formData.description) cleanedData.description = formData.description

    onComplete(cleanedData)
  }

  const isValid = requiredFields.every((field) => formData[field as keyof CertificationData])

  return (
    <div className="mt-3 p-4 bg-white rounded-lg border-2 border-gray-200 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
        <FileText className="w-4 h-4 text-teal-600" />
        {config.label || 'Add Certification'}
      </div>

      {/* Certification Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Certification Name <span className="text-red-500">*</span>
        </label>
        <Input
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="e.g., ISO 9001:2015, FSSAI, USDA Organic"
          disabled={disabled}
          className="w-full"
        />
      </div>

      {/* Issuing Authority */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Issuing Authority <span className="text-gray-400 text-xs">(Optional)</span>
        </label>
        <Input
          value={formData.issuing_authority}
          onChange={(e) => handleChange('issuing_authority', e.target.value)}
          placeholder="e.g., ISO, FSSAI, USDA"
          disabled={disabled}
          className="w-full"
        />
      </div>

      {/* AI-Powered Description Section */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description <span className="text-gray-400 text-xs">(Optional)</span>
        </label>

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
                ⓘ Enter certification name first to enable AI generation
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
            {aiGeneratedDescription && (
              <div className="bg-white rounded-lg p-4 border border-teal-200 min-h-[80px]">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {aiGeneratedDescription}
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
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Describe what this certification covers and its significance..."
              disabled={disabled}
              rows={4}
              className="border-2 border-teal-200 focus:border-teal-500 transition-colors"
            />

            <div className="flex gap-2">
              {formData.description && (
                <Button
                  type="button"
                  onClick={handleRegenerateAI}
                  disabled={disabled || !formData.name}
                  variant="outline"
                  size="sm"
                  className="h-8 border border-teal-300 text-teal-700 hover:bg-teal-50 text-xs"
                >
                  <Sparkles className="w-3 h-3 mr-1" />
                  Regenerate with AI
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <Button
        onClick={handleSubmit}
        disabled={disabled || !isValid}
        className="w-full h-10 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-medium text-sm shadow-md"
      >
        <Check className="w-4 h-4 mr-2" />
        Add Certification
      </Button>
    </div>
  )
}