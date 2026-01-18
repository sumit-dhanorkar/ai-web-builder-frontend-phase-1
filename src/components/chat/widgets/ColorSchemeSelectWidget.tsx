'use client'

/**
 * Color Scheme Select Widget
 * Compact color selection with just dots - no labels
 */

import { useState } from 'react'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { colorSchemes } from '@/data/suggestions'

interface ColorSchemeSelectWidgetProps {
  field: string
  config?: {
    label?: string
  }
  onComplete: (value: any) => void
  disabled?: boolean
}

export function ColorSchemeSelectWidget({
  field,
  config = {},
  onComplete,
  disabled = false,
}: ColorSchemeSelectWidgetProps) {
  const [selectedScheme, setSelectedScheme] = useState<string | null>(null)

  const handleSelect = (value: string) => {
    setSelectedScheme(value)
  }

  const handleConfirm = () => {
    if (selectedScheme) {
      const selected = colorSchemes.find(c => c.value === selectedScheme)
      if (selected) {
        onComplete(JSON.stringify({
          value: selected.value,
          label: selected.label,
          primary: selected.primary,
          secondary: selected.secondary
        }))
      }
    }
  }

  return (
    <div className="mt-3 p-4 bg-white rounded-lg border-2 border-gray-200 shadow-sm space-y-4">
      {/* Compact Color Dots Grid - 8 columns */}
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
        {colorSchemes.map((scheme) => (
          <motion.button
            key={scheme.value}
            type="button"
            onClick={() => handleSelect(scheme.value)}
            disabled={disabled}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className={`
              relative p-2 rounded-lg transition-all group
              ${selectedScheme === scheme.value
                ? 'ring-4 ring-teal-500 bg-teal-50'
                : 'hover:ring-2 hover:ring-gray-300 bg-gray-50'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
            title={scheme.label}
          >
            {/* Selected Indicator */}
            {selectedScheme === scheme.value && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-teal-600 rounded-full flex items-center justify-center shadow-md z-10">
                <Check className="w-3 h-3 text-white" />
              </div>
            )}

            {/* Color Dots - Primary and Secondary stacked */}
            <div className="flex flex-col gap-1.5 items-center">
              <div
                className="w-10 h-10 rounded-full shadow-md border-2 border-white transition-transform group-hover:scale-110"
                style={{ backgroundColor: scheme.primary }}
              />
              <div
                className="w-6 h-6 rounded-full shadow-sm border-2 border-white"
                style={{ backgroundColor: scheme.secondary }}
              />
            </div>
          </motion.button>
        ))}
      </div>

      {/* Selected Color Name Display */}
      {selectedScheme && (
        <div className="text-center py-2 px-4 bg-teal-50 rounded-lg border border-teal-200">
          <p className="text-sm font-medium text-teal-900">
            Selected: {colorSchemes.find(c => c.value === selectedScheme)?.label}
          </p>
        </div>
      )}

      {/* Confirm Button */}
      <Button
        onClick={handleConfirm}
        disabled={disabled || !selectedScheme}
        className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-semibold h-12"
      >
        <Check className="w-4 h-4 mr-2" />
        {selectedScheme
          ? `Continue with ${colorSchemes.find(c => c.value === selectedScheme)?.label}`
          : 'Select a Color Scheme'
        }
      </Button>
    </div>
  )
}