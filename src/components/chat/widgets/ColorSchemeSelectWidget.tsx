'use client'

/**
 * Color Scheme Select Widget
 * Allows users to choose brand colors with visual previews
 */

import { useState } from 'react'
import { Check, Palette } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'

interface ColorScheme {
  value: string
  label: string
  primary: string
  secondary: string
}

interface ColorSchemeSelectWidgetProps {
  field: string
  config?: {
    options?: ColorScheme[]
    label?: string
  }
  onComplete: (value: ColorScheme) => void
  disabled?: boolean
}

export function ColorSchemeSelectWidget({
  field,
  config = {},
  onComplete,
  disabled = false,
}: ColorSchemeSelectWidgetProps) {
  const [selectedScheme, setSelectedScheme] = useState<string | null>(null)

  const options = config.options || []
  const label = config.label || 'Select Brand Colors'

  const handleSelect = (value: string) => {
    setSelectedScheme(value)
  }

  const handleConfirm = () => {
    if (selectedScheme) {
      const selected = options.find(o => o.value === selectedScheme)
      if (selected) {
        onComplete(selected)
      }
    }
  }

  return (
    <div className="mt-3 p-4 bg-white rounded-lg border-2 border-gray-200 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 text-sm text-gray-700 font-medium pb-2 border-b border-gray-200">
        <Palette className="w-4 h-4 text-teal-600" />
        {label}
      </div>

      {/* Color Options Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {options.map((option) => (
          <motion.button
            key={option.value}
            type="button"
            onClick={() => handleSelect(option.value)}
            disabled={disabled}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`
              relative p-3 rounded-lg border-2 text-center transition-all
              ${selectedScheme === option.value
                ? 'border-teal-500 bg-teal-50 shadow-md ring-2 ring-teal-300'
                : 'border-gray-200 bg-white hover:border-teal-300 hover:shadow-sm'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            {/* Selected Indicator */}
            {selectedScheme === option.value && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-teal-600 rounded-full flex items-center justify-center shadow-sm">
                <Check className="w-3 h-3 text-white" />
              </div>
            )}

            {/* Color Dots - Primary and Secondary */}
            <div className="flex justify-center gap-1 mb-2">
              <div
                className="w-8 h-8 rounded-full shadow-md border-2 border-white"
                style={{ backgroundColor: option.primary }}
              />
              <div
                className="w-8 h-8 rounded-full shadow-md border-2 border-white"
                style={{ backgroundColor: option.secondary }}
              />
            </div>

            {/* Color Name */}
            <h3 className="font-semibold text-sm text-gray-900">{option.label}</h3>
            <p className="text-xs text-gray-500 mt-1">Primary & Secondary</p>
          </motion.button>
        ))}
      </div>

      {/* Confirm Button */}
      <Button
        onClick={handleConfirm}
        disabled={disabled || !selectedScheme}
        className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-semibold"
      >
        <Check className="w-4 h-4 mr-2" />
        Continue with {selectedScheme ? options.find(o => o.value === selectedScheme)?.label : 'Selected Colors'}
      </Button>
    </div>
  )
}