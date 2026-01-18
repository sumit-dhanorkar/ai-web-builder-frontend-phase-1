'use client'

/**
 * Theme Select Widget
 * Allows users to choose a design theme with visual previews
 */

import { useState } from 'react'
import { Check, Palette } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'

interface ThemeOption {
  value: string
  label: string
  description: string
  color: string
}

interface ThemeSelectWidgetProps {
  field: string
  config?: {
    options?: ThemeOption[]
    label?: string
  }
  onComplete: (value: string) => void
  disabled?: boolean
}

export function ThemeSelectWidget({
  field,
  config = {},
  onComplete,
  disabled = false,
}: ThemeSelectWidgetProps) {
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null)

  const options = config.options || []
  const label = config.label || 'Select Theme'

  const handleSelect = (value: string) => {
    setSelectedTheme(value)
  }

  const handleConfirm = () => {
    if (selectedTheme) {
      onComplete(selectedTheme)
    }
  }

  return (
    <div className="mt-3 p-4 bg-white rounded-lg border-2 border-gray-200 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 text-sm text-gray-700 font-medium pb-2 border-b border-gray-200">
        <Palette className="w-4 h-4 text-teal-600" />
        {label}
      </div>

      {/* Theme Options Grid */}
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
              ${selectedTheme === option.value
                ? 'border-teal-500 bg-teal-50 shadow-md ring-2 ring-teal-300'
                : 'border-gray-200 bg-white hover:border-teal-300 hover:shadow-sm'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            {/* Selected Indicator */}
            {selectedTheme === option.value && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-teal-600 rounded-full flex items-center justify-center shadow-sm">
                <Check className="w-3 h-3 text-white" />
              </div>
            )}

            {/* Small Color Dot */}
            <div className="flex justify-center mb-2">
              <div
                className="w-8 h-8 rounded-full shadow-md border-2 border-white"
                style={{
                  background: `linear-gradient(135deg, ${option.color} 0%, ${option.color}dd 100%)`
                }}
              />
            </div>

            {/* Theme Name */}
            <h3 className="font-semibold text-sm text-gray-900 mb-1">{option.label}</h3>

            {/* Description */}
            <p className="text-xs text-gray-500 line-clamp-2">{option.description}</p>
          </motion.button>
        ))}
      </div>

      {/* Confirm Button */}
      <Button
        onClick={handleConfirm}
        disabled={disabled || !selectedTheme}
        className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-semibold"
      >
        <Check className="w-4 h-4 mr-2" />
        Continue with {selectedTheme ? options.find(o => o.value === selectedTheme)?.label : 'Selected Theme'}
      </Button>
    </div>
  )
}