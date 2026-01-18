'use client'

/**
 * Design Configuration Widget
 * Collects website type, design theme, and visual style in one form with filtering
 */

import { useState } from 'react'
import { Check, Palette, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { motion } from 'framer-motion'
import { websiteTypes, designThemes, visualStyles, websiteTypeMapping } from '@/data/suggestions'

interface DesignConfigWidgetProps {
  field: string
  config?: {
    label?: string
  }
  onComplete: (value: any) => void
  disabled?: boolean
}

export function DesignConfigWidget({
  field,
  config = {},
  onComplete,
  disabled = false,
}: DesignConfigWidgetProps) {
  const [websiteType, setWebsiteType] = useState('')
  const [designTheme, setDesignTheme] = useState('')
  const [visualStyle, setVisualStyle] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Filter themes and styles based on selected website type
  const getFilteredDesignThemes = () => {
    if (!websiteType) return designThemes
    const mapping = websiteTypeMapping[websiteType as keyof typeof websiteTypeMapping]
    if (!mapping) return designThemes
    return designThemes.filter(theme => mapping.designThemes.includes(theme.value))
  }

  const getFilteredVisualStyles = () => {
    if (!websiteType) return visualStyles
    const mapping = websiteTypeMapping[websiteType as keyof typeof websiteTypeMapping]
    if (!mapping) return visualStyles
    return visualStyles.filter(style => mapping.visualStyles.includes(style.value))
  }

  // Handle website type change - auto-select first allowed theme/style if needed
  const handleWebsiteTypeChange = (value: string) => {
    setWebsiteType(value)

    const mapping = websiteTypeMapping[value as keyof typeof websiteTypeMapping]
    if (!mapping) return

    // Check if current selections are still valid
    const filteredThemes = designThemes.filter(t => mapping.designThemes.includes(t.value))
    const filteredStyles = visualStyles.filter(s => mapping.visualStyles.includes(s.value))

    const currentThemeAllowed = mapping.designThemes.includes(designTheme)
    const currentStyleAllowed = mapping.visualStyles.includes(visualStyle)

    if (!currentThemeAllowed || !currentStyleAllowed) {
      setDesignTheme(filteredThemes[0]?.value || '')
      setVisualStyle(filteredStyles[0]?.value || '')
    }
  }

  const handleSubmit = () => {
    if (!websiteType || !designTheme || !visualStyle) {
      return
    }

    setIsSubmitting(true)

    const data = {
      website_type: websiteType,
      design_theme: designTheme,
      visual_style: visualStyle
    }

    onComplete(JSON.stringify(data))

    setTimeout(() => {
      setIsSubmitting(false)
    }, 500)
  }

  const isValid = websiteType && designTheme && visualStyle

  return (
    <div className="mt-3 p-6 bg-white rounded-lg border-2 border-gray-200 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2 text-base text-gray-700 font-semibold pb-3 border-b border-gray-200">
        <Palette className="w-5 h-5 text-teal-600" />
        Website Design Configuration
      </div>

      {/* Form Fields */}
      <div className="space-y-5">
        {/* Website Type */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">
            Website Type <span className="text-red-500">*</span>
          </Label>
          <Select value={websiteType} onValueChange={handleWebsiteTypeChange} disabled={disabled}>
            <SelectTrigger className="border-2 border-gray-200 focus:border-teal-500 bg-white">
              <SelectValue placeholder="Choose website type..." />
            </SelectTrigger>
            <SelectContent>
              {websiteTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  <div className="flex flex-col py-1">
                    <span className="font-medium text-gray-900">{type.label}</span>
                    <span className="text-xs text-gray-500">{type.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Design Theme */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">
            Design Theme <span className="text-red-500">*</span>
            {websiteType && (
              <span className="text-xs text-teal-600 ml-1.5">
                ({getFilteredDesignThemes().length} available)
              </span>
            )}
          </Label>
          <Select value={designTheme} onValueChange={setDesignTheme} disabled={disabled || !websiteType}>
            <SelectTrigger className="border-2 border-gray-200 focus:border-teal-500 bg-white">
              <SelectValue placeholder={websiteType ? "Choose design theme..." : "Select website type first"} />
            </SelectTrigger>
            <SelectContent>
              {getFilteredDesignThemes().map((theme) => (
                <SelectItem key={theme.value} value={theme.value}>
                  <div className="flex flex-col py-1">
                    <span className="font-medium text-gray-900">{theme.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Visual Style */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">
            Visual Style <span className="text-red-500">*</span>
            {websiteType && (
              <span className="text-xs text-teal-600 ml-1.5">
                ({getFilteredVisualStyles().length} available)
              </span>
            )}
          </Label>
          <Select value={visualStyle} onValueChange={setVisualStyle} disabled={disabled || !websiteType}>
            <SelectTrigger className="border-2 border-gray-200 focus:border-teal-500 bg-white">
              <SelectValue placeholder={websiteType ? "Choose visual style..." : "Select website type first"} />
            </SelectTrigger>
            <SelectContent>
              {getFilteredVisualStyles().map((style) => (
                <SelectItem key={style.value} value={style.value}>
                  <div className="flex flex-col py-1">
                    <span className="font-medium text-gray-900">{style.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        onClick={handleSubmit}
        disabled={disabled || !isValid || isSubmitting}
        className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-semibold h-12"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Saving Configuration...
          </>
        ) : (
          <>
            <Check className="w-4 h-4 mr-2" />
            Continue to Color Selection
          </>
        )}
      </Button>
    </div>
  )
}